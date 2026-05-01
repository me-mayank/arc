import fs from "fs";
import * as babelParser from "@babel/parser";

/**
 * Parses a JS/TS/JSX/TSX file into AST
 */
export function parseFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf-8");

    const ast = babelParser.parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "classProperties", "dynamicImport"],
      errorRecovery: true, // 🔥 prevents hard crashes
    });

    return ast;
  } catch (error) {
    // ❗ suppress noisy logs, but still debug if needed
    // console.error(`Failed to parse: ${filePath}`);
    return null;
  }
}
