/**
 * Extract import dependencies from AST
 * @param {object} ast
 * @returns {string[]} list of imports
 */
export function extractDependencies(ast) {
  const dependencies = [];

  if (!ast || !ast.program || !ast.program.body) {
    return dependencies;
  }

  for (const node of ast.program.body) {
    if (node.type === "ImportDeclaration") {
      dependencies.push(node.source.value);
    }
  }

  return dependencies;
}
