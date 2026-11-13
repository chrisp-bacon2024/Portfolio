import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadConfig } from "../lib/config.mjs";

export const APP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Demo App</title>
<link rel="stylesheet" href="style.css">
</head>
<body class="x">
<div class="app"><main>demo</main></div>
<script type="module" src="./main.js"></script>
</body>
</html>`;

// Creates a throwaway project folder containing app files plus everything
// that must never be published.
export function makeFixtureProject(files = {}) {
    const dir = mkdtempSync(path.join(os.tmpdir(), "pf-fixture-"));
    const all = {
        "index.html": APP_HTML,
        "style.css": ".app { height: 100vh; }",
        "main.js": 'import { x } from "./lib/util.js";\nconsole.log(x);',
        "lib/util.js": "export const x = 1;",
        "README.md": "# readme",
        "notes.pdf": "%PDF",
        "package.json": "{}",
        "tests/app.test.js": "test",
        "lib/util.test.js": "test",
        ".env": "SECRET=1",
        ".github/workflows/ci.yml": "on: push",
        ".git/HEAD": "ref: refs/heads/main",
        "node_modules/dep/index.js": "x",
        ...files
    };
    for (const [file, content] of Object.entries(all)) {
        const abs = path.join(dir, ...file.split("/"));
        mkdirSync(path.dirname(abs), { recursive: true });
        writeFileSync(abs, content);
    }
    return dir;
}

// Real site/, shared/ and nav, with a single fixture project.
export function fixtureConfig(sourceDir, overrides = {}) {
    const real = loadConfig();
    return {
        ...real,
        projects: [{
            id: "demo-app",
            title: "Demo App",
            section: "softwareengineering",
            route: "softwareengineering/demoapp/",
            repo: "https://example.invalid/demo.git",
            branch: "main",
            entry: "index.html",
            sourceUrl: "https://github.com/example/demo",
            include: ["**/*"],
            sourceDir,
            ...overrides
        }]
    };
}
