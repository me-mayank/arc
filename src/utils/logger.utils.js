import chalk from "chalk";

export const log = {
  info: (msg) => console.log(chalk.cyan(`[ARC] ${msg}`)),
  success: (msg) => console.log(chalk.green(`[ARC] ${msg}`)),
  warn: (msg) => console.log(chalk.yellow(`[ARC] ${msg}`)),
  error: (msg) => console.log(chalk.red(`[ARC] ${msg}`)),
  plain: (msg) => console.log(msg), // no color (for summary mode)
};
