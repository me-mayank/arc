import fs from "fs";
import path from "path";
import { shouldIgnore } from "../utils/fileFilter.utils.js";

/**
 * Recursively collect all valid files from a directory
 * @param {string} dirPath - root directory
 * @param {string[]} extensions - allowed file extensions
 * @returns {string[]} list of file paths
 */
export function getAllFiles(dirPath, extensions = [".js"]) {
  let results = [];

  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);

      // Skip ignored files/folders
      if (shouldIgnore(file)) continue;

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recurse into subdirectory
        results = results.concat(getAllFiles(fullPath, extensions));
      } else {
        // Check extension
        if (extensions.includes(path.extname(file))) {
          results.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(` Error reading directory: ${dirPath}`);
    console.error(error.message);
  }

  return results;
}
