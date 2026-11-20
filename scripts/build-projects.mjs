// Builds every project that has a "build" step in projects.json (for example
// a Vite + TypeScript site), so its output folder is ready to publish.
//
//   node scripts/build-projects.mjs            local project folders; installs
//                                              dependencies only if node_modules is missing
//   node scripts/build-projects.mjs --fetched  .sources/ clones (CI); always installs
//
// npm run dev and npm run build run this automatically. Run it yourself while
// the dev server is running to pick up changes to a built project.

import { loadConfig } from "./lib/config.mjs";
import { buildProjects } from "./lib/project-build.mjs";

const fetched = process.argv.includes("--fetched");
try {
    const built = buildProjects(loadConfig({ sourceMode: fetched ? "fetched" : "local" }), { install: fetched ? "always" : "auto" });
    console.log(built.length ? `\nBuilt: ${built.join(", ")}` : "No projects have a build step.");
} catch (error) {
    console.error(`\nProject build failed: ${error.message}\n`);
    process.exit(1);
}
