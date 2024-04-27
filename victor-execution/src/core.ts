import { v4 as uuidv4 } from "uuid";

type State = {
  root: Node | null;
  current: Node | null;
};

type Node = {
  id: string;
  name: string;
  inputArgs: any;
  output: any | null;
  children: Node[];
};

export function updateState(state: State, funcName: string, ...inArgs: any) {
  const node = {
    id: uuidv4(),
    name: funcName,
    inputArgs: inArgs,
    output: null,
    children: [],
  };

  if (state.current) {
    state.current.children.push(node);
  }

  const root = state.root ?? node;

  state.root = root;
  state.current = node;

  return node.id;
}

function findNodeWithId(state: State, nodeId: string): Node {
  const stack: Node[] = [state.root!];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.id === nodeId) {
      return current;
    }
    stack.push(...current.children);
  }
  throw new Error("node not found");
}
function findNodeParent(state: State, nodeId: string): Node | null {
  const stack: Array<{ node: Node; parent: Node | null }> = [
    { node: state.root!, parent: null },
  ];

  while (stack.length > 0) {
    const { node, parent } = stack.pop()!;
    if (node.id === nodeId) {
      return parent;
    }
    node.children.forEach((child) => {
      stack.push({ node: child, parent: node });
    });
  }

  return null; // Return null if no parent is found (nodeId does not exist or is the root)
}

export function updateStateResult(state: State, nodeId: string, result: any) {
  // traverse state.root to find node with id nodeId
  const node = findNodeWithId(state, nodeId);
  node.output = result;

  const parent = findNodeParent(state, nodeId);

  state.current = parent;
}

export function runProgram(initialFunc: (...args: any[]) => any, args: string) {
  const state = {
    root: null,
    current: null,
  };
  const parsedArgs = JSON.parse(args);

  const res = initialFunc(state, ...parsedArgs);

  console.log(JSON.stringify(state.root));
}
