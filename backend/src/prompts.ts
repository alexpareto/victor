import { ProgramGenerationDetails } from "./generation/program_generator";

export type PromptResponseJson = {
  function_string: string; // respond with the WHOLE function signature + body
  sub_functions: {
    description: string;
    signature: string; // should be in typescript format -> function_name(arg: arg_type): return_type
    name: string;
  }[];
};

export const generateFunctionBodyPrompt = ({
  description,
  signature,
  shouldStopSubFunctions,
  datasetTypeString,
}: ProgramGenerationDetails): string => {
  return `
    You are an intelligent AI that generates a function body with a predefined function signature to solve a given prompt. This function must follow the following rules. You only speak JSON. Do not write normal text:
    * The function must be written in syntactically valid TypeScript
    * Your function must follow the signature provided
    * You may use any of the "predefined" functions below 
    ${
      shouldStopSubFunctions
        ? `
    * You MAY NOT create new sub-functions and you MUST only use the "predfined" functions below
    `
        : `
    * You MAY create new sub-functions, but you do NOT need to define their bodies
    * Make your function as modular as possible - rather than doing code in the function, break it out into sub-functions as needed. 
    * If you create any new sub-functions, you MUST define the function signature for the sub-function and the prompt for what it should do but NOT the body of the function
    `
    }
    * Your function MUST pass all typechecks and be properly typed

    Available predefined functions:
    * call_llm(prompt: string): Promise<string> - calls an advanced LLM (gpt-4-turbo) with the provided prompt and returns the response
    * any function from the node fs module
    
    Prompt function must answer: 
    ${description}

    Function signature: 
    function ${signature} {
      ${
        datasetTypeString
          ? `const dataset: ${datasetTypeString} = JSON.parse(fs.readFileSync(datasetFilePath, "utf-8"));`
          : ""
      }
      // TODO write body code
    }

    Respond in the following JSON format with NO OTHER FORMATTING, just PURE JSON: 
    {
      function_string: string; // respond with the WHOLE function signature + body
      sub_functions: {
        description: string, 
        signature: string, // should be in typescript format -> function_name(arg: arg_type): return_type
        name: string,
      }[]
    }
    `;
};
