export function updateState(state: any, newState: any) {
  console.log("in update state");
  return "state";
}

export function runProgram(
  initialFunc: (...args: any[]) => any,
  ...args: any[]
) {
  const state = {
    fns: [],
  };

  return initialFunc(state, ...args);
}
