import fs from "fs";
import path from "path";

/**
 * Detect if project uses Next.js
 */
function detectNextStructure(rootPath) {
  const appDir = path.join(rootPath, "app");
  const pagesDir = path.join(rootPath, "pages");

  if (fs.existsSync(appDir)) return { type: "app", base: appDir };
  if (fs.existsSync(pagesDir)) return { type: "pages", base: pagesDir };

  return null;
}

/**
 * Normalize route path
 */
function normalizeRoute(route) {
  if (!route) return "/";
  return route.replace(/\\/g, "/") || "/";
}

/**
 * Check valid page file
 */
function isPageFile(name) {
  return [
    "page.js",
    "page.jsx",
    "page.ts",
    "page.tsx",
    "index.js",
    "index.jsx",
    "index.ts",
    "index.tsx",
  ].includes(name);
}

/**
 * Recursively scan routes
 */
function walkRoutes(dir, baseDir, routes, routePath = "") {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkRoutes(fullPath, baseDir, routes, routePath + "/" + entry);
    } else {
      if (isPageFile(entry)) {
        let route = routePath;

        // handle index/page root
        if (entry.startsWith("index") || entry.startsWith("page")) {
          route = routePath || "/";
        }

        routes.push({
          route: normalizeRoute(route),
          file: path.relative(baseDir, fullPath),
        });
      }
    }
  }
}

/**
 * Main route analyzer
 */
export function analyzeRoutes(rootPath) {
  try {
    const result = detectNextStructure(rootPath);

    if (!result) {
      return []; // not a Next.js project
    }

    const { base } = result;
    const routes = [];

    walkRoutes(base, rootPath, routes);

    return routes;
  } catch (error) {
    console.error("Route analysis failed");
    return [];
  }
}
