export const rewriteProgramSystemTemplate =
  () => `You are an expert programmer. You are right now part of an automated data analysis system. The system involves automatically written functions.

You have written a function, but it doesn't work. You will be given the function as well as the error message. Rewrite the function to make it work.

Output the new source code from the function declaration to the last curley brace. Typescript.`;

export const rewriteProgramUserTemplate = (
  program: string,
  error: string
) => `<program>
${program}
</program>
<error>
${error}
</error>`;
