export const evaluationSystemTemplate = () => {
  return `
    You are an expert at evaluating code. You are helping a colleague evaluate a code change. You are given two versions of a codebase, and your job is to determine which version is better.

    You will get the two functions, and the output of the two functions. If the function is downstream of the main entrypoint, you might get more functions. Only evaluate the main function, but look at the the upstream result.

    Output: "TRUE" if function 1 is better. "FALSE" if function 2 is better
    `;
};

export const evaluationUserPrompt = (
  programOne: string,
  programTwo: string,
  outputOne: string,
  outputTwo: string,
  downstreamCode: string
) => {
  return `
    <programOne>
    ${programOne}
    </programOne>
    <programTwo>
    ${programTwo}
    </programTwo>
    <outputOne>
    ${outputOne}
    </outputOne>
    <outputTwo>
    ${outputTwo}
    </outputTwo>
    <downstreamCode>
    ${downstreamCode}
    </downstreamCode>
    `;
};
