import { prisma } from "@/clients";
import type { ErrorType } from "@/execution/execute";
import {
  rewriteProgramSystemTemplate,
  rewriteProgramUserTemplate,
} from "@/execution/prompts";
import { chatCompletion } from "@/inference/inference";
import { ProgramVersion } from "@prisma/client";

export const rewriteProgram = async (
  programVersion: ProgramVersion,
  error: string,
  errorType: ErrorType
): Promise<ProgramVersion> => {
  console.log("rewriting ", programVersion.body);
  const rewriteProgramSystemPrompt = rewriteProgramSystemTemplate();
  const rewriteProgramUserPrompt = rewriteProgramUserTemplate(
    programVersion.body,
    `Error Type: ${errorType}\nError: ${error}`
  );

  const inference = await chatCompletion({
    model: "gpt-4-turbo-2024-04-09",
    messages: [
      { role: "system", content: rewriteProgramSystemPrompt },
      { role: "user", content: rewriteProgramUserPrompt },
    ],
    name: "rewrite",
  });

  const updatedProgramVersion = await prisma.programVersion.update({
    where: { id: programVersion.id },
    data: {
      body: inference.output,
      updatedAt: new Date(),
      runTries: programVersion.runTries + 1,
    },
  });

  console.log("rewritten ", updatedProgramVersion.body);

  return updatedProgramVersion;
};
