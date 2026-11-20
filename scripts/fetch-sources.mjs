// Clones each project's branch from GitHub into .sources/<id>, replacing any
// previous clone. CI runs this first, then tests the clones
// (test-projects.mjs --fetched) and builds from them (build.mjs --fetched),
// so the code that is tested is exactly the code that is deployed.

import { loadConfig } from "./lib/config.mjs";
import { fetchSources } from "./lib/sources.mjs";

try {
    fetchSources(loadConfig({ sourceMode: "fetched" }));
} catch (error) {
    console.error(`\nFetch failed: ${error.message}\n`);
    process.exit(1);
}
