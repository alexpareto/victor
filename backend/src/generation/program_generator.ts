import { TVShows, showsTypeString } from "@/datasets/tv_shows";
import { chatCompletion } from "../inference/inference";
import { PromptResponseJson, generateFunctionBodyPrompt } from "../prompts";
import { prisma } from "@/clients";
import { Program } from "@prisma/client";

// for now datasets aren't generic, can figure that out later
export const initProgram = async (
  description: string,
  datasetTypeString: string
): Promise<[Program, Promise<Program>]> => {
  const initalProgramSignature = `solvePrompt(datasetFilePath: string): Promise<string>`;
  const programName = `solvePrompt`;
  // create the base program
  const program = await prisma.program.create({
    data: {
      name: programName,
    },
  });

  // kick off program generation but don't await so we can get the program id
  const programGenerationPromise = generatePrograms(
    program,
    {
      description,
      name: programName,
      signature: initalProgramSignature,
      datasetTypeString: datasetTypeString,
      shouldStopSubFunctions: false,
    },
    0
  );
  return [program, programGenerationPromise];
};

export type ProgramGenerationDetails = {
  description: string; // description of what the function should do
  name: string; // name of function
  signature: string;
  shouldStopSubFunctions: boolean;
  datasetTypeString?: string;
};

// recursively generates all the programs and then saves them to the DB
const generatePrograms = async (
  program: Program,
  details: ProgramGenerationDetails,
  recursion_level: number
): Promise<Program> => {
  console.log(
    `GENERATING PROGRAM (${details.name}) RECURSION LEVEL ${recursion_level}`
  );

  // generate the program versions
  const programVersions = await generateFunctionBodies(details, 3);
  // now we parse out the other sub-programs we need to generate, and generate those for each
  const programVersionCalculations = programVersions.map(
    async (programVersion, index) => {
      console.log(
        `generating ${programVersion.sub_functions.length} subfunctions for program: ${program.name} and version:${index} and recursion level: ${recursion_level}`
      );
      const dbVersion = await prisma.programVersion.create({
        data: {
          body: programVersion.function_string,
          signature: details.signature,
          description: details.description,
          programId: program.id,
          fitness: Math.random(),
        },
      });

      const subProgramsPromises = programVersion.sub_functions.map(
        async (sub_function) => {
          const subProgram = await prisma.program.create({
            data: {
              name: sub_function.name,
            },
          });

          return await generatePrograms(
            subProgram,
            {
              description: sub_function.description,
              signature: sub_function.signature,
              name: sub_function.name,
              shouldStopSubFunctions: recursion_level + 1 > 2,
            },
            recursion_level + 1
          );
        }
      );
      const subPrograms = await Promise.all(subProgramsPromises);

      // now create the programversion and add the subprograms as dependencies
      const dbVersionUpdated = await prisma.programVersion.update({
        where: { id: dbVersion.id },
        data: {
          dependencies: {
            connect: subPrograms.map((program) => ({ id: program.id })),
          },
        },
      });
    }
  );

  await Promise.all(programVersionCalculations);

  console.log(
    `COMPLETED GENERATING PROGRAM (${program.name}) AT RECURSION LEVEL ${recursion_level}`
  );

  return program;
};

export const generateFunctionBodies = async (
  details: ProgramGenerationDetails,
  count: number
): Promise<PromptResponseJson[]> => {
  const bodies = [];
  for (let i = 0; i < count; i++) {
    const body = generateFunctionBody(details);
    bodies.push(body);
  }
  return await Promise.all(bodies);
};

const generateFunctionBody = async (
  details: ProgramGenerationDetails
): Promise<PromptResponseJson> => {
  const prompt = generateFunctionBodyPrompt(details);

  const response = await chatCompletion({
    model: "gpt-4-turbo",
    messages: [{ content: prompt, role: "system" }],
    useCache: false,
  });

  console.log(response.output);
  return JSON.parse(response.output);
};
