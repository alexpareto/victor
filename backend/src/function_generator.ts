import { TVShows } from "./datasets/tv_shows";
import { chatCompletion } from "./inference/inference";
import { generateFunctionBodyPrompt } from "./prompts";

type FunctionDetails = {
  prompt: string; // description of what the function should do
  name: string; // name of function
  signature: string;
};

export const generateFunctionBodies = async (
  details: FunctionDetails,
  count: number
): Promise<string[]> => {
  const bodies = [];
  for (let i = 0; i < count; i++) {
    const body = generateFunctionBody(details);
    bodies.push(body);
  }
  return await Promise.all(bodies);
};

const generateFunctionBody = async (
  details: FunctionDetails
): Promise<string> => {
  const prompt = generateFunctionBodyPrompt(details.prompt, details.signature);

  const response = await chatCompletion({
    model: "gpt-4-turbo",
    messages: [{ content: prompt, role: "system" }],
  });

  return response.output;
};
