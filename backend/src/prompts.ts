export const generateFunctionBodyPrompt = (
  prompt: string,
  functionSignature: string
): string => {
  return `
    You are an intelligent AI that generates a function body with a predefined function signature to solve a given prompt. This function must follow the following rules:
    * The function must be written in syntactically valid TypeScript
    * Your function must follow the signature provided
    * You may ONLY use any of the "predefined" functions below 
    * You may NOT create new sub-functions
    
    Available predefined functions:
    * call_llm(prompt, output) - calls an advanced LLM (gpt-4-turbo) with the provided prompt and output format
    
    Prompt function must answer: 
    ${prompt}

    Function signature: 
    ${functionSignature} {
      // TODO write body code
    }

    Respond ONLY with the function body and NO other formatting:
    `;
};

// todo, when we want to do sub_functions, update prompt to this:
const subFunctionPrompt = `
You are an intelligent AI that generates a function body with a predefined function signature to solve a given prompt. This function must follow the following rules:
* The function must be written in syntactically valid TypeScript
* Your function must follow the signature provided
* You may use any of the "predefined" functions below 
* You may create new sub-functions
* Make your function as modular as possible - rather than doing code in the function, break it out into sub-functions as needed. 
* If you create any new sub-functions, you MUST define the function signature for the sub-function and the prompt for what it should do but NOT the body of the function

Available predefined functions:
* call_llm(prompt, output) - calls an advanced gpt-4-turbo with the provided prompt and output format

Prompt function must answer: What is the best tv show clip in the dataset?

Function signature:
function solvePrompt(dataset: {transcript: string, metadata: {show: string, season: string, episode: string, title: string}): string {
// Body to fill in here
}

Respond ONLY in JSON with the response in format:
{
function_body: string
sub_functions: {sub_function_name: string, sub_function_prompt: string, input_types: string[], output_types: string[]}[]
}
`;
