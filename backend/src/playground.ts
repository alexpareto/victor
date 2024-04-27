import { embedTexts } from "@/inference/embed";
import { testCompletion } from "./inference/inference";

async function main() {
  //   let result = await testCompletion();
  //   console.log(result);

  let res = await embedTexts(["Hello, world!"]);
  console.log(res);
}

main();
