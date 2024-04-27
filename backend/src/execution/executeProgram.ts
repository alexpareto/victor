import { Program, ProgramVersion } from "@prisma/client";
import { call_llm } from "./defaultPrograms";
import { runPrograms } from "./run";

export const executeProgram = async (
  program: Program & { versions: ProgramVersion[] },
  datasetFilePath: string
) => {
  const defaultPrograms = [call_llm];

  const results = [];

  // loop through each version and run it
  for (let i = 0; i < program.versions.length; i++) {
    const version = program.versions[i];
    console.log("=====================");
    console.log("program version", version.id);
    const programWithCall = genProgramWithCall(
      datasetFilePath,
      version,
      program
    );
    console.log("program to run");
    console.log(programWithCall);

    console.log("program result:");
    const result = await runPrograms(defaultPrograms, programWithCall);
    console.log("===================");
    results.push(result);
  }
  return results;

  // TODO: come up with a way to rank the results
};

const genProgramWithCall = (
  datasetFilePath: string,
  version: ProgramVersion,
  program: Program
) => {
  const programWithCall = `
  async function ${version.signature} {
    ${version.body}
  }

  import fs from 'fs';
  

  const dataset = JSON.parse(
    fs.readFileSync("${datasetFilePath}", "utf-8")
  );
  ${program.name}(dataset)
  `;

  return programWithCall;
};
