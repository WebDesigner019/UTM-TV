import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env") as typeof import("@next/env");

loadEnvConfig(process.cwd());

const args = process.argv.slice(2);
const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["prisma", ...args], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32"
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
