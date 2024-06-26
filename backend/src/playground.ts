import { embedTexts } from "@/inference/embed";
import { testCompletion } from "./inference/inference";
// import { runPrograms } from "@/execution/execute";
import { prisma } from "@/clients";
import { runProgram } from "@/execution/run";
import { backprop } from "@/evaluation/evaluate";

const B1_FN = `
async function fib(n: number): Promise<number> {
  if (n <= 0) {
      return 0;
  }
  if (n === 1) {
      return 1;
  }
  let previous = 0;
  let current = 1;
  for (let i = 2; i <= n; i++) {
      let next = previous + current;
      previous = current;
      current = next;
  }
  return current;
}
`;

const B2_FN = `
async function fib(n: number): Promise<number> {
  if (n <= 1) {
      return n;
  }
  return await fib(n - 1) + await fib(n - 2);
}
`;

async function testBackprop() {
  const program = await prisma.program.create({
    data: {
      name: "fib",
    },
  });
  const version1 = await prisma.programVersion.create({
    data: {
      body: B1_FN,
      programId: program.id,
      signature: "async function fib(n: number): number",
      description: "add two numbers",
      fitness: 0.5,
    },
  });
  const version2 = await prisma.programVersion.create({
    data: {
      body: B2_FN,
      programId: program.id,
      signature: "async function fib(n: number): number",
      description: "add two numbers",
      fitness: 0.5,
    },
  });

  await runProgram(version1, [4]);

  await backprop(program, version1, version2);
}

const ADD_FN = `
function add(a, b: number)  {
    return a + b;
}
`;

const FIB_FN = `
function fib(n: number): number {
    if (n <= 1) {
        return n;
    }
    return add(fib(n - 1), fib(n - 2));
}
`;

const P_TO_RUN = `
console.log(add(1, 2));
`;

async function createSamples() {
  const program = await prisma.program.create({
    data: {
      name: "add",
    },
  });
  const addVersion = await prisma.programVersion.create({
    data: {
      body: ADD_FN,
      programId: program.id,
      signature: "add(a: number, b: number): number",
      description: "add two numbers",
      fitness: 0.5,
    },
  });
  const fibProgram = await prisma.program.create({
    data: {
      name: "fib",
    },
  });
  const fibVersion = await prisma.programVersion.create({
    data: {
      body: FIB_FN,
      programId: fibProgram.id,
      signature: "fib(n: number): number",
      description: "calculate fibonacci",
      fitness: 0.5,
      dependencies: {
        connect: {
          id: program.id,
        },
      },
    },
    include: {
      program: true,
    },
  });

  const result = await runProgram(fibVersion, [10]);
  console.log(result);
}

async function main() {
  //   let result = await testCompletion();
  //   console.log(result);
  // runPrograms([FN], P_TO_RUN);
}

// main();
testBackprop();
