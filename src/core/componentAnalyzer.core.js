import path from "path";

/**
 * Analyze components using AST + import map
 */
export default function analyzeComponents(ast, importMap, filePath) {
  const edges = [];
  let currentComponent = null;

  function isComponent(name) {
    return /^[A-Z]/.test(name);
  }

  function walk(node) {
    if (!node || typeof node !== "object") return;

    // Detect component definitions
    if (
      node.type === "FunctionDeclaration" &&
      node.id &&
      isComponent(node.id.name)
    ) {
      currentComponent = node.id.name;
    }

    if (
      node.type === "VariableDeclarator" &&
      node.id?.name &&
      isComponent(node.id.name)
    ) {
      currentComponent = node.id.name;
    }

    // Detect JSX usage
    if (node.type === "JSXOpeningElement") {
      const nameNode = node.name;

      if (nameNode.type === "JSXIdentifier") {
        const childName = nameNode.name;

        if (currentComponent && importMap[childName]) {
          edges.push({
            parentComponent: currentComponent,
            parentFile: filePath,
            childComponent: childName,
            childFile: importMap[childName],
          });
        }
      }
    }

    for (const key in node) {
      const val = node[key];
      if (Array.isArray(val)) val.forEach(walk);
      else if (val && typeof val === "object") walk(val);
    }
  }

  walk(ast);
  return edges;
}
