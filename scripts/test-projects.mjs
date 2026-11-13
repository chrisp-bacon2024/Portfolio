// Runs each hosted project's own test command (the "test" field in
// projects.json) in its source folder. CI runs this before building, so a
// project whose tests fail is never deployed.
//
//   node scripts/test-projects.mjs            local project folders
//   node scripts/test-projects.mjs --fetched  .sources/ (after build --fetch)

import { execSync } from "node:child_process";
import { loadConfig } from "./lib/config.mjs";

const fetched = process.argv.includes("--fetched");
const config = loadConfig({ sourceMode: fetched ? "fetched" : "local" });

let failed = 0;
for (const project of config.projects) {
    if (!project.test) {
        console.log(`- ${project.id}: no test command`);
        continue;
    }
    console.log(`\n> ${project.id}: ${project.test}`);
    try {
        execSync(project.test, { cwd: project.sourceDir, stdio: "inherit" });
    } catch {
        failed++;
        console.error(`x ${project.id}: tests failed`);
    }
}

if (failed) {
    console.error(`\n${failed} project(s) failed their tests.`);
    process.exit(1);
}
console.log("\nAll project tests passed.");
