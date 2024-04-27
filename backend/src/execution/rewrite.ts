import { prisma } from "@/clients";
import type { ErrorType } from "@/execution/execute";
import {
  rewriteProgramSystemTemplate,
  rewriteProgramUserTemplate,
} from "@/execution/prompts";
import { chatCompletion } from "@/inference/inference";
import { ProgramVersion } from "@prisma/client";

export const rewriteProgram = async (
  programVersions: ProgramVersion[],
  error: string,
  errorType: ErrorType
) => {
  console.log("rewriting ", programVersions.map((v) => v.body).join("\n"));
  const rewriteProgramSystemPrompt = rewriteProgramSystemTemplate();
  const rewriteProgramUserPrompt = rewriteProgramUserTemplate(
    programVersions.map((v) => v.body).join("\n"),
    `Error Type: ${errorType}\nError: ${error}`
  );

  const inference = await chatCompletion({
    model: "gpt-4-turbo-2024-04-09",
    messages: [
      { role: "system", content: rewriteProgramSystemPrompt },
      { role: "user", content: rewriteProgramUserPrompt },
    ],
    name: "rewrite",
    temperature: 0.2,
    useCache: false,
  });

  const newFunctionCode = inference.output;
  const functionNameMatch = newFunctionCode.match(/function (\w+)\(/);
  const functionName = functionNameMatch ? functionNameMatch[1] : null;

  let programVersion: ProgramVersion | null = null;
  const chosenProgramVersion = programVersions.find(
    (v) => (v as any).program.name === functionName
  );

  if (chosenProgramVersion!.runTries > 3) {
    await prisma.programVersion.update({
      where: { id: chosenProgramVersion!.id },
      data: {
        body: inference.output,
        updatedAt: new Date(),
        runTries: chosenProgramVersion!.runTries + 1,
        fitness: 0,
      },
    });
    throw new Error("Maximum number of rewriting retries reached");
  }

  const updatedProgramVersion = await prisma.programVersion.update({
    where: { id: chosenProgramVersion!.id },
    data: {
      body: inference.output,
      updatedAt: new Date(),
      runTries: chosenProgramVersion!.runTries + 1,
    },
  });

  console.log("rewritten ", updatedProgramVersion.body);
};
