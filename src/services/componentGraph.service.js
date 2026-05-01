import { parseFile } from "../core/parser.core.js";
import { extractDependencies } from "../core/dependencyExtractor.core.js";
import { buildImportMap } from "../core/importMapBuilder.core.js";
import analyzeComponents from "../core/componentAnalyzer.core.js";

export function buildComponentGraph(files) {
  const allEdges = [];

  for (const file of files) {
    const ast = parseFile(file);
    if (!ast) continue;

    const imports = extractDependencies(ast).map((imp) =>
      typeof imp === "string" ? imp : imp.source,
    );

    const importMap = buildImportMap(imports, file);

    const edges = analyzeComponents(ast, importMap, file);

    allEdges.push(...edges);
  }

  return allEdges;
}
