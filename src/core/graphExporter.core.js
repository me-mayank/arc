import fs from "fs";
import path from "path";
import { execSync, exec } from "child_process";
import { log } from "../utils/logger.utils.js";
import { generateTree } from "../utils/treeGenerator.utils.js";

/**
 * Generate filename
 */
function generateFileName(outputDir) {
  const projectName = path.basename(outputDir);
  return `${projectName}-arc-graph`;
}

/**
 * Convert graph → DOT format
 */
function generateDOT(graph) {
  let dot = "digraph G {\n";

  dot += "  rankdir=TB;\n";
  dot += "  nodesep=0.8;\n";
  dot += "  ranksep=1.2;\n\n";

  dot += "  node [shape=box, style=filled, fontname=Helvetica];\n\n";

  const entry =
    Object.keys(graph).find((f) => f.includes("index.js")) ||
    Object.keys(graph)[0];

  dot += `  "${entry}" [fillcolor=gold];\n\n`;

  const modules = {};

  for (const file in graph) {
    if (file === entry) continue;

    const parts = file.split(path.sep);
    const folder = parts.length > 1 ? parts[0] : "others";

    if (!modules[folder]) modules[folder] = [];
    modules[folder].push(file);
  }

  let clusterId = 0;

  for (const module in modules) {
    dot += `  subgraph cluster_${clusterId++} {\n`;
    dot += `    label = "${module}";\n`;
    dot += "    style=rounded;\n";
    dot += "    color=lightgrey;\n";

    modules[module].forEach((file) => {
      const deps = graph[file];
      const color = deps.length === 0 ? "lightgreen" : "lightcoral";
      dot += `    "${file}" [fillcolor=${color}];\n`;
    });

    dot += "  }\n\n";
  }

  dot += `  { rank=source; "${entry}"; }\n\n`;

  for (const file in graph) {
    graph[file].forEach((dep) => {
      dot += `  "${file}" -> "${dep}" [color=gray30];\n`;
    });
  }

  dot += "}\n";
  return dot;
}

/**
 * Human readable
 */
function generateReadable(graph) {
  let output = "Dependency Summary\n\n";

  for (const file in graph) {
    output += `${file}\n`;

    if (graph[file].length === 0) {
      output += "  └─ No dependencies\n";
    } else {
      graph[file].forEach((dep, i) => {
        const symbol = i === graph[file].length - 1 ? "└─" : "├─";
        output += `  ${symbol} ${dep}\n`;
      });
    }

    output += "\n";
  }

  return output;
}

/**
 * Open file helper
 */
function openFile(filePath) {
  const cmd =
    process.platform === "darwin"
      ? `open "${filePath}"`
      : process.platform === "win32"
        ? `start "" "${filePath}"`
        : `xdg-open "${filePath}"`;

  exec(cmd);
}

/**
 * Export graph
 */
export function exportGraph(graph, outputDir, options = {}) {
  try {
    const baseName = generateFileName(outputDir);

    const dotTxtPath = path.join(outputDir, `${baseName}.dot.txt`);
    const readablePath = path.join(outputDir, `${baseName}.txt`);
    const pngPath = path.join(outputDir, `${baseName}.png`);
    const tempDotPath = path.join(outputDir, `${baseName}.dot`);

    // ✅ CORRECT structure naming (single source)
    const projectName = path.basename(outputDir);
    const treePath = path.join(outputDir, `${projectName}-arc-structure.txt`);

    const dotContent = generateDOT(graph);
    const readableContent = generateReadable(graph);

    // SUMMARY MODE
    if (options.summary) {
      console.log(readableContent);
      return;
    }

    // ✅ include struct in mode detection
    const specificMode =
      options.png || options.txt || options.dot || options.struct;

    // TXT
    if (options.txt || !specificMode) {
      fs.writeFileSync(readablePath, readableContent);
      if (!options.quiet) log.success(`Readable: ${readablePath}`);
    }

    // DOT
    if (options.dot || !specificMode) {
      fs.writeFileSync(dotTxtPath, dotContent);
      if (!options.quiet) log.success(`DOT: ${dotTxtPath}`);
    }

    // STRUCTURE
    if (options.struct || !specificMode) {
      const treeContent = generateTree(outputDir);
      fs.writeFileSync(treePath, treeContent);

      if (!options.quiet) log.success(`Structure: ${treePath}`);
    }

    // PNG
    if (options.png || !specificMode) {
      try {
        fs.writeFileSync(tempDotPath, dotContent);

        execSync(`dot -Tpng "${tempDotPath}" -o "${pngPath}"`, {
          stdio: "ignore",
        });

        fs.unlinkSync(tempDotPath);

        if (!options.quiet) log.success(`PNG: ${pngPath}`);

        if (options.open) {
          openFile(pngPath);
        }
      } catch {
        if (!options.quiet) log.warn("Graphviz not found → PNG not generated");
      }
    }
  } catch (error) {
    log.error("Failed to export graph");
    log.error(error.message);
  }
}
