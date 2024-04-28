import { prisma } from "@/clients";
import {
  evaluationSystemTemplate,
  evaluationUserPrompt,
} from "@/evaluation/prompts";
import { runProgram } from "@/execution/run";
import { chatCompletion } from "@/inference/inference";
import type {
  Program,
  ProgramInvocation,
  ProgramVersion,
} from "@prisma/client";

export const backprop = async (
  startProgram: Program,
  optionOne: ProgramVersion,
  optionTwo: ProgramVersion
) => {
  const inputArgsResults = await prisma.programInvocation.findMany({
    where: {
      programVersion: {
        programId: startProgram.id,
      },
    },
  });

  console.log(inputArgsResults);
  const randomIndex = Math.floor(Math.random() * inputArgsResults.length);
  const randomInputArgs = inputArgsResults[randomIndex].inputArgs;

  // if (startProgram.id === optionOne.id) {

  // }

  // let bestStartProgramVersion: ProgramVersion

  // = await prisma.programVersion.findFirst({
  //   where: {
  //     programId: startProgram.id,
  //   },
  //   orderBy: {
  //     fitness: "desc",
  //   },
  // });

  const runOne = await runProgram(optionOne!, randomInputArgs as any, [
    optionOne,
  ]);

  const runTwo = await runProgram(optionTwo!, randomInputArgs as any, [
    optionTwo,
  ]);

  const overallOutputRunOne = (runOne as any).outputArgs;
  const overallOutputRunTwo = (runOne as any).outputArgs;

  const relevantOutputRunOne = await findRelevantOutput(
    runOne as any,
    optionOne
  );
  const relevantOutputRunTwo = await findRelevantOutput(
    runTwo as any,
    optionTwo
  );

  const evalSystemPrompt = evaluationSystemTemplate();
  const evalUserPrompt = evaluationUserPrompt(
    optionOne.body,
    optionTwo.body,
    JSON.stringify(relevantOutputRunOne!.outputArgs),
    JSON.stringify(relevantOutputRunTwo!.outputArgs),
    ""
  );

  const inference = await chatCompletion({
    name: "evaluation",
    messages: [
      { role: "system", content: evalSystemPrompt },
      { role: "user", content: evalUserPrompt },
    ],
    model: "gpt-4-turbo-2024-04-09",
  });

  if (inference.output.includes("TRUE")) {
    optionOne.fitness = Math.min(1, Math.max(0, optionOne.fitness + 0.01));
    optionTwo.fitness = Math.min(1, Math.max(0, optionTwo.fitness - 0.01));
    await prisma.programVersion.update({
      where: { id: optionOne.id },
      data: { fitness: optionOne.fitness },
    });
    await prisma.programVersion.update({
      where: { id: optionTwo.id },
      data: { fitness: optionTwo.fitness },
    });
  } else {
    optionOne.fitness = Math.min(1, Math.max(0, optionOne.fitness - 0.01));
    optionTwo.fitness = Math.min(1, Math.max(0, optionTwo.fitness + 0.01));
    await prisma.programVersion.update({
      where: { id: optionOne.id },
      data: { fitness: optionOne.fitness },
    });
    await prisma.programVersion.update({
      where: { id: optionTwo.id },
      data: { fitness: optionTwo.fitness },
    });
  }
  console.log("done");
};

async function findRelevantOutput(
  rootInvocation: ProgramInvocation,
  programVersion: ProgramVersion
): Promise<ProgramInvocation | null> {
  let invocations = [rootInvocation];
  while (invocations.length > 0) {
    const invocation = invocations.shift();

    if (invocation?.programVersionId === programVersion.id) {
      return invocation;
    }

    const newInvocations = await prisma.programInvocation.findMany({
      where: {
        previousInvocationId: invocation!.id,
      },
    });

    invocations = invocations.concat(newInvocations);
  }
  throw new Error("No relevant output found");
}
