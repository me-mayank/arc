import fs from "fs";
import path from "path";
import os from "os";
import { execSync, exec } from "child_process";
import { log } from "../utils/logger.utils.js";
import { generateTree } from "../utils/treeGenerator.utils.js";
import { isGraphvizInstalled } from "../utils/dependencyChecker.utils.js";

// ===== Helper =====
function getInstallCommand() {
  const platform = os.platform();

  if (platform === "darwin") return "brew install graphviz";
  if (platform === "linux") return "sudo apt install graphviz";
  if (platform === "win32") return "winget install Graphviz.Graphviz";

  return "https://graphviz.org/download/";
}

/**
 * Generate filename
 */
function generateFileName(outputDir) {
  const projectName = path.basename(outputDir);
  return `${projectName}-arc-graph`;
}

/**
 * 🔥 NEW: Backend readable (FIX)
 */
function generateReadable(graph) {
  let output = "Dependency Summary\n\n";

  for (const file in graph) {
    output += `${file}\n`;

    if (!graph[file] || graph[file].length === 0) {
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
 * Backend DOT
 */
function generateDOT(graph) {
  let dot = "digraph G {\n";

  dot += `
  rankdir=LR;
  splines=polyline;
  overlap=false;
  nodesep=0.5;
  ranksep=1;

  node [shape=box, style="rounded"];
  edge [color="#6b7280"];
  \n`;

  function shortName(file) {
    return file.split("/").pop();
  }

  for (const file in graph) {
    dot += `"${file}" [label="${shortName(file)}"];\n`;
  }

  for (const file in graph) {
    graph[file].forEach((dep) => {
      if (!dep) return;
      dot += `"${file}" -> "${dep}";\n`;
    });
  }

  dot += "}\n";
  return dot;
}

/**
 * Component DOT
 */
function generateComponentDOT(edges) {
  if (!edges || edges.length === 0) {
    return `digraph G {\n  label="No components found";\n}`;
  }

  let dot = "digraph G {\n";

  dot += `
  rankdir=LR;
  splines=polyline;
  overlap=false;
  nodesep=0.6;
  ranksep=1;

  node [shape=box, style="rounded"];
  edge [color="#6b7280"];
  \n`;

  const seen = new Set();

  edges.forEach(({ parentComponent, childComponent }) => {
    seen.add(parentComponent);
    seen.add(childComponent);
  });

  seen.forEach((c) => {
    dot += `"${c}" [label="${c}"];\n`;
  });

  edges.forEach(({ parentComponent, childComponent }) => {
    if (parentComponent !== childComponent) {
      dot += `"${parentComponent}" -> "${childComponent}";\n`;
    }
  });

  dot += "}\n";

  return dot;
}

/**
 * Component readable
 */
function generateComponentReadable(edges) {
  if (!edges || edges.length === 0) {
    return "Component Relationships\n\n(No components found)\n";
  }

  let output = "Component Relationships\n\n";
  const map = {};

  edges.forEach(({ parentComponent, childComponent }) => {
    if (!map[parentComponent]) map[parentComponent] = new Set();
    map[parentComponent].add(childComponent);
  });

  for (const parent in map) {
    output += parent + "\n";

    [...map[parent]].forEach((child, i, arr) => {
      const symbol = i === arr.length - 1 ? "└─" : "├─";
      output += `  ${symbol} ${child}\n`;
    });

    output += "\n";
  }

  return output;
}

/**
 * Routes readable
 */
function generateRoutesReadable(routes) {
  if (!routes || routes.length === 0) {
    return "Routes\n\n(No routes found)\n";
  }

  let output = "Routes\n\n";

  routes.forEach((r) => {
    output += `${r.route} → ${r.file}\n`;
  });

  return output;
}

/**
 * Frontend meta
 */
function generateFrontendMeta(edges, routes, outputDir) {
  if ((!edges || edges.length === 0) && (!routes || routes.length === 0)) {
    return;
  }

  const meta = {
    components: {},
    routes: [],
  };

  edges?.forEach(({ parentComponent, childComponent, parentFile }) => {
    if (!meta.components[parentComponent]) {
      meta.components[parentComponent] = {
        file: parentFile,
        uses: [],
      };
    }

    meta.components[parentComponent].uses.push(childComponent);
  });

  routes?.forEach((r) => {
    meta.routes.push({
      path: r.route,
      file: r.file,
    });
  });

  const projectName = path.basename(outputDir);
  const metaPath = path.join(
    outputDir,
    `${projectName}-arc-frontend-meta.json`,
  );

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  log.success(`Frontend Meta: ${metaPath}`);
}

/**
 * EXPORT
 */
export function exportGraph(graph, outputDir, options = {}) {
  try {
    const baseName = generateFileName(outputDir);
    const projectName = path.basename(outputDir);

    const dotPath = path.join(outputDir, `${baseName}.dot`);
    const pngPath = path.join(outputDir, `${baseName}.png`);
    const txtPath = path.join(outputDir, `${baseName}.txt`);

    const compDotPath = path.join(
      outputDir,
      `${projectName}-arc-components.dot`,
    );
    const compPngPath = path.join(
      outputDir,
      `${projectName}-arc-components.png`,
    );

    const treePath = path.join(outputDir, `${projectName}-arc-structure.txt`);
    const routePath = path.join(outputDir, `${projectName}-arc-routes.txt`);
    const compTxt = path.join(outputDir, `${projectName}-arc-components.txt`);

    const mode = options.mode || "full";

    const graphvizAvailable = isGraphvizInstalled();

    // ===== STRUCTURE =====
    fs.writeFileSync(treePath, generateTree(outputDir));
    log.success(`Structure: ${treePath}`);

    // ===== BACKEND =====
    if (mode !== "frontend") {
      const dot = generateDOT(graph);
      const readable = generateReadable(graph);

      fs.writeFileSync(dotPath, dot);
      fs.writeFileSync(txtPath, readable);

      log.success(`Readable: ${txtPath}`);

      if (graphvizAvailable) {
        try {
          execSync(`dot -Tpng "${dotPath}" -o "${pngPath}"`);
          log.success(`PNG: ${pngPath}`);
        } catch {
          log.warn("Failed to generate PNG using Graphviz");
        }
      } else {
        log.warn(`
Skipping PNG generation (Graphviz not installed)

Install Graphviz:

macOS:
  brew install graphviz

Linux:
  sudo apt install graphviz

Windows:
  winget install Graphviz.Graphviz

After installing, verify:
  dot -V

If 'dot' is not recognized on Windows:

1. Open System Environment Variables
2. Edit the 'Path' variable
3. Add:
   C:\\Program Files\\Graphviz\\bin

4. Restart your terminal

Then run again:
  dot -V
`);
      }
    }

    // ===== FRONTEND =====
    if (mode !== "backend") {
      if (options.componentEdges?.length) {
        const compDot = generateComponentDOT(options.componentEdges);

        fs.writeFileSync(compDotPath, compDot);
        fs.writeFileSync(
          compTxt,
          generateComponentReadable(options.componentEdges),
        );

        if (graphvizAvailable) {
          try {
            execSync(`dot -Tpng "${compDotPath}" -o "${compPngPath}"`);
            log.success(`Component PNG: ${compPngPath}`);
          } catch {
            log.warn("Failed to generate component PNG");
          }
        }
      }

      if (options.routes?.length) {
        fs.writeFileSync(routePath, generateRoutesReadable(options.routes));
      }

      generateFrontendMeta(options.componentEdges, options.routes, outputDir);
    }
  } catch (error) {
    log.error("Failed to export graph");
    log.error(error.message);
  }
}
