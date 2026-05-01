import fs from "fs";
import path from "path";

const IGNORE = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
]);

export function generateTree(rootDir) {
  function walk(dir, prefix = "") {
    const entries = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => !IGNORE.has(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    let result = "";

    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const nextPrefix = prefix + (isLast ? "    " : "│   ");

      result += prefix + connector + entry.name + "\n";

      if (entry.isDirectory()) {
        result += walk(path.join(dir, entry.name), nextPrefix);
      }
    });

    return result;
  }

  const rootName = path.basename(rootDir);
  return rootName + "\n" + walk(rootDir);
}
