module.exports = function ({ types: t }) {
    return {
      visitor: {
        FunctionDeclaration(path, state) {
            // Adding 'state' as the first parameter
         
            const filename = state.filename;
            const isTargetFile = filename.includes('programs.ts');
            if (!isTargetFile) {
              return; // Skip the plugin logic if not the target file
            }

            const funcName = path.node.id.name;
            const originalFuncName = `${funcName}_original`;
    
            path.node.id.name = originalFuncName;
    
            const wrapperFunc = t.functionExpression(
              t.identifier(funcName),
              [t.identifier("state"), ...path.node.params], // Include "state" and existing parameters
              t.blockStatement([
                t.variableDeclaration("let", [
                  t.variableDeclarator(t.identifier("nodeId"), null)
                ]),
                t.expressionStatement(
                  t.assignmentExpression(
                    "=",
                    t.identifier("nodeId"),
                    t.callExpression(t.identifier("updateState"), [t.identifier("state")])
                  )
                ),
                t.variableDeclaration("const", [                  t.variableDeclarator(
                    t.identifier("originalResult"),
                    t.callExpression(t.identifier(originalFuncName), [
                      t.identifier("state"),
                      ...path.node.params.map((param) => t.identifier(param.name)),
                    ])
                  )
                ]),
                t.expressionStatement(
                  t.callExpression(t.identifier("updateStateResult"), [
                    t.identifier("nodeId"),
                    t.identifier("originalResult")
                  ])
                ),
                t.returnStatement(t.identifier("originalResult"))
              ])
            );


            path.insertBefore(wrapperFunc);

            path.node.params.unshift(t.identifier('state'));

            // Modify calls within the function body
            path.traverse({
              CallExpression(callPath) {
                const calleeName = callPath.node.callee.name;
                // Ensure it's a function from this file and not a method or a function from another scope
                if (callPath.scope.hasBinding(calleeName, true) && callPath.node.arguments[0]?.name !== 'state') {
                  // Add 'state' as the first argument
                  callPath.node.arguments.unshift(t.identifier('state'));
                }
              }
            });
        },
      },
    };
  };
  