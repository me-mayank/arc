/**
 * Extract import dependencies from AST
 * @param {object} ast
 * @returns {Array<{source: string, specifiers: string[]}>}
 */
export function extractDependencies(ast) {
  const dependencies = [];

  if (!ast || !ast.program) return dependencies;

  function addDependency(source, specifiers = []) {
    if (!source) return;

    dependencies.push({
      source,
      specifiers,
    });
  }

  function walk(node) {
    if (!node || typeof node !== "object") return;

    // ===== ES Module Imports =====
    if (node.type === "ImportDeclaration") {
      const source = node.source.value;

      const specifiers = node.specifiers
        .map((s) => {
          if (s.type === "ImportDefaultSpecifier") return s.local.name;
          if (s.type === "ImportSpecifier") return s.imported.name;
          if (s.type === "ImportNamespaceSpecifier") return s.local.name;
          return null;
        })
        .filter(Boolean);

      addDependency(source, specifiers);
    }

    // ===== require() (CommonJS) =====
    if (
      node.type === "CallExpression" &&
      node.callee?.name === "require" &&
      node.arguments?.length
    ) {
      const arg = node.arguments[0];

      if (arg.type === "StringLiteral") {
        addDependency(arg.value);
      }
    }

    // ===== dynamic import() =====
    if (node.type === "ImportExpression") {
      const arg = node.source;

      if (arg && arg.value) {
        addDependency(arg.value);
      }
    }

    // ===== Traverse children =====
    for (const key in node) {
      const val = node[key];

      if (Array.isArray(val)) {
        val.forEach(walk);
      } else if (val && typeof val === "object") {
        walk(val);
      }
    }
  }

  walk(ast);

  return dependencies;
}
