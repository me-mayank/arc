import path from "path";
import { resolveImport } from "../utils/pathResolver.utils.js";

/**
 * Build import map for a file
 * @param {Array} imports - extracted imports (objects)
 * @param {string} file - current file path
 * @returns {Object} identifier → resolved file path
 */
export function buildImportMap(imports, file) {
  const map = {};

  for (const imp of imports) {
    const { source, specifiers } = imp;

    const resolved = resolveImport(source, file);
    if (!resolved) continue;

    // Map each imported identifier to resolved file
    specifiers.forEach((name) => {
      map[name] = resolved;
    });
  }

  return map;
}
