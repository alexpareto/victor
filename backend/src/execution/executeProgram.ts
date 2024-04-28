import { Program, ProgramVersion } from "@prisma/client";
import { runProgram } from "./run";

export const executeProgram = async (
  program: Program & { versions: ProgramVersion[] },
  datasetFilePath: string
) => {
  const results = [];

  // loop through each version and run it
  for (let i = 0; i < program.versions.length; i++) {
    const version = program.versions[i];
    console.log("=====================");
    console.log("program version", version.id);
    const result = await runProgram(version, [datasetFilePath]);
    console.log(result);
    console.log("===================");
    results.push(result);
  }
  return results;

  // TODO: come up with a way to rank the results
};
