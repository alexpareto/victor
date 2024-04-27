import { embedTexts } from "@/inference/embed";
import { testCompletion } from "./inference/inference";
import { runPrograms } from "@/execution/run";

const FN = `
function add(a: number, b: number)  {
    return a + b;
}
`;

const P_TO_RUN = `
console.log(add(1, 2));
`;

async function main() {
  //   let result = await testCompletion();
  //   console.log(result);

  runPrograms([FN], P_TO_RUN);
}

main();
