import path from "path";
import fs from "fs";
import { ALIASES } from "../config/aliases.config.js";

/**
 * Supported extensions (priority order)
 */
const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

/**
 * Try resolving file with extensions
 */
function resolveWithExtensions(basePath) {
  // Case 1: exact file exists
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }

  // Case 2: try extensions
  for (const ext of EXTENSIONS) {
    const fullPath = basePath + ext;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

/**
 * Try resolving directory index files
 */
function resolveDirectoryIndex(dirPath) {
  if (!fs.existsSync(dirPath)) return null;

  if (fs.statSync(dirPath).isDirectory()) {
    for (const ext of EXTENSIONS) {
      const indexPath = path.join(dirPath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
  }

  return null;
}

/**
 * Resolve import path to actual file path
 */
export function resolveImport(importPath, currentFile) {
  try {
    // 🔥 guard: stop undefined spam
    if (!importPath || typeof importPath !== "string") {
      return null;
    }

    // 1. Ignore external packages
    if (!importPath.startsWith(".") && !importPath.startsWith("@")) {
      return null;
    }

    const currentDir = path.dirname(currentFile);

    let basePath;

    // 2. Alias resolution (@/)
    if (importPath.startsWith("@/")) {
      const aliasBase = ALIASES["@"];
      if (!aliasBase) return null;

      basePath = path.join(process.cwd(), aliasBase, importPath.slice(2));
    } else {
      // 3. Relative path
      basePath = path.resolve(currentDir, importPath);
    }

    // 4. Try file
    const fileResolved = resolveWithExtensions(basePath);
    if (fileResolved) return fileResolved;

    // 5. Try directory index
    const dirResolved = resolveDirectoryIndex(basePath);
    if (dirResolved) return dirResolved;

    return null;
  } catch {
    // 🔥 silent fail (no console spam)
    return null;
  }
}
