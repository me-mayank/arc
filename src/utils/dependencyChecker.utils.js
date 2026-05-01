import { execSync } from "child_process";

export function isGraphvizInstalled() {
  try {
    execSync("dot -V", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
