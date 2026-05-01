import fs from "fs";
import path from "path";

/**
 * Detect file type
 */
function getFileType(file) {
  if (file.includes("index.js")) return "entry";
  if (file.includes("/core/")) return "core";
  if (file.includes("/utils/")) return "utility";
  if (file.includes("/services/")) return "service";
  if (file.includes("/config/")) return "config";
  return "other";
}

/**
 * Generate metadata JSON for AI
 */
export function generateMeta(graph, outputDir) {
  const meta = {
    entry: null,
    files: {},
  };

  // detect entry
  meta.entry =
    Object.keys(graph).find((f) => f.includes("index.js")) ||
    Object.keys(graph)[0];

  // initialize reverse map
  const reverseMap = {};

  for (const file in graph) {
    graph[file].forEach((dep) => {
      if (!reverseMap[dep]) reverseMap[dep] = [];
      reverseMap[dep].push(file);
    });
  }

  // build meta
  for (const file in graph) {
    meta.files[file] = {
      type: getFileType(file),
      dependsOn: graph[file],
      usedBy: reverseMap[file] || [],
    };
  }

  // save file
  const projectName = path.basename(outputDir);
  const metaPath = path.join(outputDir, `${projectName}-arc-meta.json`);

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log(`Meta: ${metaPath}`);
}
