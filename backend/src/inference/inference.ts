import { PrismaClient, type Inference } from "@prisma/client";
import { createHash } from "crypto";
import { Semaphore } from "async-mutex";
import { oai_client } from "../clients";
import OpenAI from "openai";

const prisma = new PrismaClient();

interface ModelCost {
  inputTokenCost: number;
  outputTokenCost: number;
}

const MODEL_COSTS: Record<string, ModelCost> = {
  "gpt-3.5-turbo-1106": {
    inputTokenCost: 0.000001,
    outputTokenCost: 0.000002,
  },
  "gpt-3.5-turbo-0125": {
    inputTokenCost: 0.0000005,
    outputTokenCost: 0.0000015,
  },
  "gpt-4-turbo-2024-04-09": {
    inputTokenCost: 0.00001,
    outputTokenCost: 0.00003,
  },
};

const MODEL_SEMAPHORE_LIMITS: Record<string, number> = {
  "gpt-3.5-turbo-1106": 100,
  "gpt-3.5-turbo-0125": 100,
  "gpt-4-turbo-2024-04-09": 30,
  DEFAULT: 100,
};

const modelSemaphores: Record<string, Semaphore> = Object.entries(
  MODEL_SEMAPHORE_LIMITS
).reduce(
  (acc, [model, limit]) => ({
    ...acc,
    [model]: new Semaphore(limit),
  }),
  {}
);

interface LLMResult {
  output: string;
  inputTokens: number;
  outputTokens: number;
}

async function openaiCompletion(
  model: string,
  messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
  temperature: number,
  useJsonMode: boolean
): Promise<LLMResult> {
  const result = await oai_client.chat.completions.create({
    model,
    messages,
    temperature,
    response_format: useJsonMode ? { type: "json_object" } : undefined,
  });

  const output = result.choices[0].message?.content;
  if (!result.usage) {
    throw new Error("Usage data not available");
  }

  if (!output) {
    throw new Error("Output is empty");
  }

  return {
    output,
    inputTokens: result.usage.prompt_tokens,
    outputTokens: result.usage.completion_tokens,
  };
}

export async function chatCompletion({
  model,
  messages,
  useJsonMode = false,
  useCache = true,
  name,
  temperature = 0,
  tracerUuid,
}: {
  model: string;
  messages: Array<OpenAI.Chat.ChatCompletionMessageParam>;
  useJsonMode?: boolean;
  useCache?: boolean;
  name?: string;
  temperature?: number;
  tracerUuid?: string;
}): Promise<Inference> {
  const completionParams = {
    model,
    messages,
    temperature,
    useJsonMode,
  };

  const completionParamsJson = JSON.stringify(
    completionParams,
    Object.keys(completionParams).sort()
  );
  const cacheKey = createHash("sha256")
    .update(`${name ?? ""}_${completionParamsJson}`)
    .digest("hex");

  if (useCache) {
    const existingInference = await prisma.inference.findFirst({
      where: { cacheKey },
      orderBy: { createdAt: "desc" },
    });

    if (existingInference) {
      return existingInference;
    }
  }

  const startTime = Date.now();
  const semaphore = modelSemaphores[model] ?? modelSemaphores.DEFAULT;

  let result: LLMResult;
  await semaphore.acquire();
  try {
    result = await openaiCompletion(model, messages, temperature, useJsonMode);
  } finally {
    semaphore.release();
  }

  const endTime = Date.now();
  const elapsedTime = (endTime - startTime) / 1000;

  const outputJson = useJsonMode ? JSON.parse(result.output) : undefined;
  const userMessage = messages.find((message) => message.role === "user");
  const systemMessage = messages.find((message) => message.role === "system");

  const modelCost = MODEL_COSTS[model];
  const estimatedCost = modelCost
    ? modelCost.inputTokenCost * result.inputTokens +
      modelCost.outputTokenCost * result.outputTokens
    : undefined;

  const userMessageContent = Array.isArray(userMessage?.content)
    ? null
    : userMessage?.content;

  const systemMessageContent = Array.isArray(systemMessage?.content)
    ? null
    : systemMessage?.content;

  const inference = await prisma.inference.create({
    data: {
      cacheKey,
      name,
      model,
      output: result.output,
      outputJson,
      inputMessages: messages as any,
      userMessage: userMessageContent,
      systemMessage: systemMessageContent,
      numInputTokens: result.inputTokens,
      numOutputTokens: result.outputTokens,
      latencySeconds: elapsedTime,
      skippedCache: !useCache,
      estimatedCost,
      tracerUuid,
    },
  });

  console.log(`Finished inference, ${name}, inferenceId: ${inference.id}`);

  return inference;
}

export const testCompletion = async () => {
  return await chatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: [{ role: "user", content: "HI" }],
    name: "test",
  });
};
