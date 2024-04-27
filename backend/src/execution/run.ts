import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

const EXECUTION_ENVIRONMENT_PATH = "../victor-execution";

export const runPrograms = async (programs: string[], programToRun: string) => {
  console.log("Current working directory:", process.cwd());
  const filePath = path.join(EXECUTION_ENVIRONMENT_PATH, "src/program.ts");
  console.log("file path", filePath);

  const programFile = programs.join("\n") + "\n" + programToRun;

  fs.writeFileSync(filePath, programFile);

  try {
    // First, perform type-checking
    const { stdout: stdoutTypeCheck, stderr: stderrTypeCheck } =
      await execPromise("yarn type-check-raw", {
        cwd: path.join(EXECUTION_ENVIRONMENT_PATH),
      });
    console.log(`Type-check stdout: ${stdoutTypeCheck}`);
    if (stderrTypeCheck) {
      console.error(`Type-check stderr: ${stderrTypeCheck}`);
    }

    // Then, build the project
    const { stdout: stdoutBuild, stderr: stderrBuild } = await execPromise(
      "yarn build",
      {
        cwd: path.join(EXECUTION_ENVIRONMENT_PATH),
      }
    );
    console.log(`Build stdout: ${stdoutBuild}`);
    if (stderrBuild) {
      console.error(`Build stderr: ${stderrBuild}`);
    }

    // Finally, execute the program file
    const { stdout: stdoutExec, stderr: stderrExec } = await execPromise(
      `node dist/program.js`,
      {
        cwd: path.join(EXECUTION_ENVIRONMENT_PATH),
      }
    );
    console.log(`Execution stdout: ${stdoutExec}`);
    if (stderrExec) {
      console.error(`Execution stderr: ${stderrExec}`);
    }

    console.log("DONE");
  } catch (error) {
    console.error(`exec error: ${error}`);
  }

  // fs.unlinkSync(filePath);
};
