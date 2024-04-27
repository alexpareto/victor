module.exports = function ({ types: t }) {
    return {
      visitor: {
        Program(path, state) {
          // Extract the filename from the state and check if it matches 'targetFile.ts'
          const filename = state.filename;
          const isTargetFile = filename.includes('programs.ts');
  
          if (!isTargetFile) {
            return; // Skip the plugin logic if not the target file
          }
          console.log("ADD import")
          const importSpecifier = t.importSpecifier(t.identifier('updateState'), t.identifier('updateState'));
          const importDeclaration = t.importDeclaration([importSpecifier], t.stringLiteral('./core'));
          path.node.body.unshift(importDeclaration); // Add the import at the beginning of the file

        },
        FunctionDeclaration(path, state) {
            const filename = state.filename;
            const isTargetFile = filename.includes('programs.ts');
    
            if (!isTargetFile) {
              return; // Skip the plugin logic if not the target file
            }
            // The rest of your transformation logic here
          const funcName = path.node.id.name;
          const originalFuncName = `${funcName}_original`;
  
          path.node.id.name = originalFuncName;
  
          const wrapperFunc = t.functionExpression(
            t.identifier(funcName),
            [t.identifier("state"), ...path.node.params], // Include "state" and existing parameters
            t.blockStatement([
              t.expressionStatement(
                t.assignmentExpression(
                  "=",
                  t.identifier("state"),
                  t.callExpression(t.identifier("_core.updateState"), [t.identifier("state")])
                )
              ),
              t.returnStatement(
                t.callExpression(t.identifier(originalFuncName), [
                  t.identifier("state"),
                  ...path.node.params.map((param) => t.identifier(param.name)),
                ])
              ),
            ])
          );
  
          path.insertBefore(wrapperFunc);

        },
      },
    };
  };
  