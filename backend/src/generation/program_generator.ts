import { TVShows, showsTypeString } from "@/datasets/tv_shows";
import { chatCompletion } from "../inference/inference";
import { generateFunctionBodyPrompt } from "../prompts";
import { prisma } from "@/clients";
import { Program } from "@prisma/client";

// for now datasets aren't generic, can figure that out later
export const initProgram = async (
  description: string,
  datasetTypeString: string
): Promise<Program> => {
  const initalProgramSignature = `solvePrompt(datasetFilePath: string): Promise<string>`;
  const programName = `solvePrompt`;

  // recursively generate the function bodies
  return await generatePrograms({
    description,
    name: programName,
    signature: initalProgramSignature,
    datasetTypeString: datasetTypeString,
  });
};

type ProgramGenerationDetails = {
  description: string; // description of what the function should do
  name: string; // name of function
  signature: string;
  datasetTypeString?: string;
};

// recursively generates all the programs and then saves them to the DB
const generatePrograms = async (
  details: ProgramGenerationDetails
): Promise<Program> => {
  const baseProgramBodies = await generateFunctionBodies(details, 10);
  // now we parse out the other programs we need to generate, and generate those for each
  const subPrograms: Promise<Program>[] = [];
  for (let i = 0; i < baseProgramBodies.length; i++) {
    // TODO: parse out childPrograms
    // childrenPrograms.map((programInfo) => generateProgram(programInfo))
    // subPrograms.push(childrenPrograms);
  }
  // let all subprograms generate
  await Promise.all(subPrograms);

  // save these programs to DB
  const program = await prisma.program.create({
    data: {
      name: details.name,
    },
  });
  const versions = baseProgramBodies.map((body) => {
    return {
      body: body,
      signature: details.signature,
      description: details.description,
      programId: program.id,
    };
  });

  // create version
  await prisma.programVersion.createMany({
    data: versions,
  });

  return program;
};

export const generateFunctionBodies = async (
  details: ProgramGenerationDetails,
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
  details: ProgramGenerationDetails
): Promise<string> => {
  const prompt = generateFunctionBodyPrompt(
    details.description,
    details.signature,
    details.datasetTypeString
  );

  const response = await chatCompletion({
    model: "gpt-4-turbo",
    messages: [{ content: prompt, role: "system" }],
    useCache: false,
  });

  return response.output;
};
