import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";

function execPromise(
  command: string,
  options: any
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr, stdout }); // Rejects the promise with error and stderr
      } else {
        resolve({ stdout: stdout.toString(), stderr: stderr.toString() }); // Resolves the promise with stdout and stderr as properties of an object
      }
    });
  });
}

const EXECUTION_ENVIRONMENT_PATH = "../victor-execution";

export enum ErrorType {
  TYPE_CHECK_ERROR = "TYPE_CHECK_ERROR",
  BUILD_ERROR = "BUILD_ERROR",
  EXECUTION_ERROR = "EXECUTION_ERROR",
}

export type ExecuteResult = {
  value: any | null;
  logs: any | null; // for successes
  error: string | null;
  errorType: ErrorType | null;
};

type ExecException = {
  stdout: string;
  stderr: string;
  error: string;
};

export const executePrograms = async (
  programToRun: string
): Promise<ExecuteResult> => {
  const filePath = path.join(EXECUTION_ENVIRONMENT_PATH, "src/programs.ts");

  fs.writeFileSync(filePath, programToRun);

  try {
    const { stdout: stdoutTypeCheck, stderr: stderrTypeCheck } =
      await execPromise("yarn type-check-raw", {
        cwd: path.join(EXECUTION_ENVIRONMENT_PATH),
      });
  } catch (error: any) {
    const typedError = error as ExecException;
    return {
      errorType: ErrorType.TYPE_CHECK_ERROR,
      error: typedError.stdout + typedError.error + typedError.stderr,
      logs: null,
      value: null,
    };
  }

  try {
    const { stdout: stdoutBuild, stderr: stderrBuild } = await execPromise(
      "yarn build",
      {
        cwd: path.join(EXECUTION_ENVIRONMENT_PATH),
      }
    );
  } catch (error: any) {
    const typedError = error as ExecException;
    return {
      errorType: ErrorType.BUILD_ERROR,
      error: typedError.stdout + typedError.error + typedError.stderr,
      logs: null,
      value: null,
    };
  }

  try {
    const { stdout: stdoutExec, stderr: stderrExec } = await execPromise(
      `node dist/programs.js`,
      {
        cwd: path.join(EXECUTION_ENVIRONMENT_PATH),
      }
    );

    const stdoutLines = stdoutExec.trim().split("\n");
    const lastLine = stdoutLines.pop()!; // Removes and returns the last element
    const earlierLines = stdoutLines.join("\n");

    console.log(stdoutLines);
    return {
      value: JSON.parse(lastLine),
      logs: earlierLines,
      error: null,
      errorType: null,
    };
  } catch (error: any) {
    const typedError = error as ExecException;
    console.log(error);
    return {
      errorType: ErrorType.EXECUTION_ERROR,
      error: typedError.stdout + typedError.error + typedError.stderr,
      logs: null,
      value: null,
    };
  }
  // fs.unlinkSync(filePath);
};
