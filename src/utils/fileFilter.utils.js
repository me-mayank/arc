const IGNORE = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
  "coverage",
  ".DS_Store",
]);

/**
 * Check if file/folder should be ignored
 */
export function shouldIgnore(name) {
  return IGNORE.has(name);
}
