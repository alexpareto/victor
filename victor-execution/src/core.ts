export function updateState(state: any, newState: any) {
  console.log("in update state");
  return "state";
}
export function updateStateResult(state: any, result: any) {
  console.log("result", result);
}

export function runProgram(initialFunc: (...args: any[]) => any, args: string) {
  const state = {
    fns: [],
  };
  console.log(args);
  const parsedArgs = JSON.parse(args);

  return initialFunc(state, ...parsedArgs);
}
