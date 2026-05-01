import path from "path";

/**
 * Build dependency graph
 * @param {Array<{ file: string, dependencies: string[] }>} fileData
 * @returns {Object} graph (adjacency list)
 */
export function buildGraph(fileData, rootPath) {
  const graph = {};

  for (const { file, dependencies } of fileData) {
    const relFile = path.relative(rootPath, file);

    graph[relFile] = dependencies.map((dep) => path.relative(rootPath, dep));
  }

  return graph;
}
