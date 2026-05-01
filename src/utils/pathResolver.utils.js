import path from "path";
import fs from "fs";

/**
 * Resolve import path to actual file path
 * @param {string} importPath - e.g. "./utils"
 * @param {string} currentFile - full path of current file
 * @returns {string|null} resolved file path
 */
export function resolveImport(importPath, currentFile) {
  try {
    // Ignore external packages for now
    if (!importPath.startsWith(".")) {
      return null;
    }

    const currentDir = path.dirname(currentFile);

    // Step 1: resolve relative path
    let resolvedPath = path.resolve(currentDir, importPath);

    // Step 2: check if file exists directly
    if (fs.existsSync(resolvedPath)) {
      return resolvedPath;
    }

    // Step 3: try adding .js extension
    if (fs.existsSync(resolvedPath + ".js")) {
      return resolvedPath + ".js";
    }

    // Step 4: check index.js inside folder
    const indexPath = path.join(resolvedPath, "index.js");
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }

    return null;
  } catch (error) {
    console.error(`❌ Path resolve error: ${importPath}`);
    return null;
  }
}
