import { execSync } from "child_process";

export function isGraphvizInstalled() {
  try {
    execSync("dot -V", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function getGraphvizHelpMessage() {
  const platform = os.platform();

  if (platform === "darwin") {
    return `
Graphviz not found.

Install Graphviz:
  brew install graphviz

Then verify:
  dot -V
`;
  }

  if (platform === "linux") {
    return `
Graphviz not found.

Install Graphviz:
  sudo apt install graphviz

Then verify:
  dot -V
`;
  }

  if (platform === "win32") {
    return `
Graphviz not found.

Install Graphviz:
  winget install Graphviz.Graphviz

After installing, verify:
  dot -V

If 'dot' is not recognized:

1. Open System Environment Variables
2. Edit the 'Path' variable
3. Add:
   C:\\Program Files\\Graphviz\\bin

4. Restart your terminal

Then run again:
  dot -V
`;
  }

  return `
Graphviz not found.

Install it from:
https://graphviz.org/download/
`;
}
