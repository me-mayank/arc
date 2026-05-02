#!/usr/bin/env node

import path from "path";
import os from "os";
import { Command } from "commander";
import chalk from "chalk";

import { getAllFiles } from "./core/fileLoader.core.js";
import { parseFile } from "./core/parser.core.js";
import { extractDependencies } from "./core/dependencyExtractor.core.js";
import { resolveImport } from "./utils/pathResolver.utils.js";
import { buildGraph } from "./core/graphBuilder.core.js";
import { exportGraph } from "./core/graphExporter.core.js";
import { log } from "./utils/logger.utils.js";
import { generateMeta } from "./core/metaGenerator.core.js";
import { isGraphvizInstalled } from "./utils/dependencyChecker.utils.js";

import { buildComponentGraph } from "./services/componentGraph.service.js";
import { analyzeRoutes } from "./core/routeAnalyzer.core.js";

// ===== Banner =====
const banner =
  chalk.cyan(`
 █████╗ ██████╗  ██████╗
██╔══██╗██╔══██╗██╔════╝
███████║██████╔╝██║     
██╔══██║██╔══██╗██║     
██║  ██║██║  ██║╚██████╗
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝
`) +
  chalk.gray("Architecture Relationship Compiler\n") +
  chalk.gray("Developed by Mayank Tripathi\n") +
  chalk.gray("GitHub: https://github.com/me-mayank\n");

// ===== CLI Setup =====
const program = new Command();

program
  .name("arc")
  .addHelpText("beforeAll", banner)
  .description("Visualize and analyze code dependencies.")
  .version("3.3.0")
  .argument("<path>", "Project directory to analyze")

  .option("--backend", "Backend mode (stable)")
  .option("--frontend", "Frontend mode (experimental)")
  .option("--full", "Full mode (backend + frontend (experimental))")

  .addHelpText(
    "after",
    `
Modes:
  --backend   Stable dependency analysis
  --frontend  Experimental (components + routes)
  --full      Backend + frontend(experimental)

Examples:
  arc . --backend
  arc . --frontend
  arc . --full
`,
  );

// ===== HELP =====
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);

const options = program.opts();
const inputPath = program.args[0];

// ===== VALIDATION =====
if (!inputPath) {
  log.error("Please provide a project path");
  process.exit(1);
}

// Only ONE mode allowed
const selectedModes = [options.backend, options.frontend, options.full].filter(
  Boolean,
);

if (selectedModes.length > 1) {
  log.error("Only one mode allowed: --backend | --frontend | --full");
  process.exit(1);
}

// ===== MODE RESOLUTION =====
const mode = options.backend
  ? "backend"
  : options.frontend
    ? "frontend"
    : options.full
      ? "full"
      : "full";

const runBackend = mode === "backend" || mode === "full";
const runFrontend = mode === "frontend" || mode === "full";

// ===== GRAPHVIZ CHECK =====
let graphvizAvailable = true;

if (runBackend) {
  graphvizAvailable = isGraphvizInstalled();

  if (!graphvizAvailable && !options.quiet) {
    log.warn(`
Graphviz not found. PNG generation will be skipped.

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

// ===== USER MESSAGES =====
if (!options.quiet) {
  if (mode === "backend") {
    log.info("Running in BACKEND mode (stable)");
  }

  if (mode === "frontend") {
    log.warn("Running in FRONTEND mode (experimental)");
  }

  if (mode === "full") {
    log.info("Running in FULL mode");
    log.warn("Frontend analysis is experimental");
  }
}

// ===== START =====
const fullPath = path.resolve(inputPath);
const start = Date.now();

if (!options.quiet) log.info("Scanning project...");

const files = getAllFiles(fullPath);

if (!options.quiet) log.success(`Found ${files.length} files`);

// ===== ANALYSIS =====
let graph = {};
let componentEdges = [];
let routes = [];

// ===== BACKEND =====
if (runBackend) {
  if (!options.quiet) log.info("Analyzing dependencies...");

  const fileData = [];

  for (const file of files) {
    const ast = parseFile(file);
    if (!ast) continue;

    const deps = extractDependencies(ast);

    const resolvedDeps = deps
      .map((dep) => {
        const importPath = typeof dep === "string" ? dep : dep?.source;
        if (!importPath) return null;
        return resolveImport(importPath, file);
      })
      .filter(Boolean);

    fileData.push({
      file,
      dependencies: resolvedDeps,
    });
  }

  graph = buildGraph(fileData, fullPath);
}

// ===== FRONTEND =====
if (runFrontend) {
  if (!options.quiet) log.info("Analyzing frontend...");

  componentEdges = buildComponentGraph(files);
  routes = analyzeRoutes(fullPath);

  if (!options.quiet && componentEdges.length === 0) {
    log.warn("No components detected (basic detection only)");
  }
}

// ===== EXPORT =====
if (!options.quiet) log.info("Generating output...");

exportGraph(graph, fullPath, {
  ...options,
  mode,
  componentEdges,
  routes,
});

// ===== META =====
if (runBackend) {
  generateMeta(graph, fullPath);
}

// ===== DONE =====
const end = Date.now();

if (!options.quiet) {
  log.success(`Completed in ${end - start} ms`);
}
