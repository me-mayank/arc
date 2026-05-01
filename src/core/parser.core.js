import fs from "fs";
import parser from "@babel/parser";

/**
 * Parses a JS file into AST
 * @param {string} filePath
 * @returns {object|null} AST
 */
export function parseFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf-8");

    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    return ast;
  } catch (error) {
    console.error(`❌ Failed to parse: ${filePath}`);
    console.error(error.message);
    return null;
  }
}
