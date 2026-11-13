// Runs the build-tooling tests with Node's built-in test runner. Test files
// are listed explicitly because `node --test <dir>` and glob handling differ
// between Node versions and shells (cmd.exe does not expand globs).

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./lib/config.mjs";

const dir = path.join(REPO_ROOT, "scripts", "tests");
const files = readdirSync(dir).filter(name => name.endsWith(".test.mjs")).map(name => path.join(dir, name));

const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
process.exit(result.status ?? 1);
