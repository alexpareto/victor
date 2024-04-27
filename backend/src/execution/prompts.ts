export const rewriteProgramSystemTemplate =
  () => `You are an expert programmer. You are right now part of an automated data analysis system. The system involves automatically written functions.

You have written some code, but it doesn't work. You will be given the functions as well as the error message. Rewrite the functions to make it work. Choose one function to rewrite. You can only rewrite one function at a time.

Output the new source code from the function declaration to the last curley brace. Your first characters should be "function" no additional formatting.`;

export const rewriteProgramUserTemplate = (
  program: string,
  error: string
) => `<program>
${program}
</program>
<error>
${error}
</error>`;
