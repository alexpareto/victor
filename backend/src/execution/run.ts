import { prisma } from "@/clients";
import { executePrograms, type ExecuteResult } from "@/execution/execute";
import { Program, ProgramVersion } from "@prisma/client";

const getAllProgramVersionDependencies = async (
  programVersion: ProgramVersion
) => {
  let allProgramVersionDepedencies: ProgramVersion[] = [];

  let currentProgramDependencies: Program[] = await prisma.program.findMany({
    where: {
      dependents: {
        some: {
          id: programVersion.id,
        },
      },
    },
  });

  while (currentProgramDependencies.length > 0) {
    console.log("a");

    let newProgramDependencies: Program[] = [];
    for (const program of currentProgramDependencies) {
      const programVersion = await prisma.programVersion.findFirst({
        where: {
          programId: program.id,
        },
        orderBy: {
          fitness: "desc", // Assuming the field is named 'fitnessScore'
        },
        include: {
          dependencies: true,
        },
      });

      allProgramVersionDepedencies.push(programVersion!);

      newProgramDependencies.push(...programVersion!.dependencies);
    }
    currentProgramDependencies = newProgramDependencies;
  }
  return allProgramVersionDepedencies;
};

export const runProgram = async (
  programVersion: ProgramVersion,
  args: any[]
): Promise<ExecuteResult> => {
  const programVersionDependencies = await getAllProgramVersionDependencies(
    programVersion
  );
  console.log("Dependencies", programVersionDependencies);

  const allProgramVersions = [...programVersionDependencies, programVersion];

  const program = await prisma.program.findFirst({
    where: {
      id: programVersion.programId,
    },
  });

  const formattedArgs = JSON.stringify(args);
  const programToRun = `
  import { runProgram } from "./core";
  import { updateState, updateStateResult } from "./core";
  
  function __import_hack() {
    return {
      updateState,
      updateStateResult,
    };
  }
  
  ${allProgramVersions.map((pv) => pv.body).join("\n")}

  const rawArgs = "${formattedArgs}"
const result = runProgram(${program!.name}, rawArgs)
  `;

  return executePrograms(programToRun);
};
