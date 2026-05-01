#!/usr/bin/env node

import path from "path";
import { Command } from "commander";

import { getAllFiles } from "./core/fileLoader.core.js";
import { parseFile } from "./core/parser.core.js";
import { extractDependencies } from "./core/dependencyExtractor.core.js";
import { resolveImport } from "./utils/pathResolver.utils.js";
import { buildGraph } from "./core/graphBuilder.core.js";
import { exportGraph } from "./core/graphExporter.core.js";
import { log } from "./utils/logger.utils.js";
import chalk from "chalk";

const banner =
  chalk.green(`
 █████╗ ██████╗  ██████╗
██╔══██╗██╔══██╗██╔════╝
███████║██████╔╝██║     
██╔══██║██╔══██╗██║     
██║  ██║██║  ██║╚██████╗
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝
`) + chalk.gray("Architecture Relationship Compiler\n");

const program = new Command();

program
  .name("arc")
  .addHelpText("beforeAll", banner)
  .description("Visualize and analyze code dependencies.")
  .version("2.1.0")
  .argument("<path>", "Project directory to analyze")
  .option("--png", "Generate only PNG graph")
  .option("--txt", "Generate only readable report")
  .option("--dot", "Generate only DOT file")
  .option("--summary", "Print summary only")
  .option("--quiet", "Minimal output")
  .option("--open", "Open PNG after generation")
  .option("--struct", "Output: file structure only")
  .addHelpText(
    "after",
    `
Examples:
  arc .                 Generate all outputs
  arc . --png           Generate only PNG
  arc . --txt           Generate only readable report
  arc . --dot           Generate only DOT file
  arc . --summary       Print summary only
  arc . --open          Open PNG after generation
  arc . --struct        Only file structure
`,
  );

// Show help if no args
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);

const options = program.opts();
const inputPath = program.args[0];

if (!inputPath) {
  log.error("Please provide a project path");
  process.exit(1);
}

const fullPath = path.resolve(inputPath);

const start = Date.now();

if (!options.quiet) log.info("Scanning project...");

const files = getAllFiles(fullPath);

if (!options.quiet) log.success(`Found ${files.length} files`);

if (!options.quiet) log.info("Analyzing dependencies...");

const fileData = [];

for (const file of files) {
  const ast = parseFile(file);
  const deps = extractDependencies(ast);

  const resolvedDeps = deps
    .map((dep) => resolveImport(dep, file))
    .filter(Boolean);

  fileData.push({
    file,
    dependencies: resolvedDeps,
  });
}

const graph = buildGraph(fileData, fullPath);

if (!options.quiet) log.info("Generating output...");

exportGraph(graph, fullPath, options);

const end = Date.now();

if (!options.quiet) log.success(`Completed in ${end - start} ms`);
