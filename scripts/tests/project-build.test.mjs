// Projects with a "build" step (projects.json) are compiled first and
// published from their output folder.

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { validateConfig } from "../lib/config.mjs";
import { buildProject, publishDir } from "../lib/project-build.mjs";
import { collectOutputs } from "../lib/site.mjs";
import { APP_HTML, fixtureConfig } from "./helpers.mjs";

const dirs = [];
after(() => dirs.forEach(dir => rmSync(dir, { recursive: true, force: true })));

// A tiny project whose "install" creates node_modules and whose "build"
// writes web/out/. Both append to log.txt so tests can see what ran.
function buildableProject() {
    const dir = mkdtempSync(path.join(os.tmpdir(), "pf-build-"));
    dirs.push(dir);
    const files = {
        "web/install.cjs": `const fs = require("fs"); fs.mkdirSync("node_modules", { recursive: true }); fs.appendFileSync("../log.txt", "install\\n");`,
        "web/build.cjs": `const fs = require("fs"); fs.mkdirSync("out/assets", { recursive: true });
fs.writeFileSync("out/index.html", ${JSON.stringify(APP_HTML)});
fs.writeFileSync("out/style.css", "body {}");
fs.writeFileSync("out/main.js", "console.log(1);");
fs.writeFileSync("out/assets/app.js", "console.log(2);");
fs.writeFileSync("out/.nojekyll", "");
fs.appendFileSync("../log.txt", "build\\n");`,
        "web/src/main.ts": "source, never published",
        "index.html": "<p>repository root page: must not be published</p>"
    };
    for (const [file, content] of Object.entries(files)) {
        const abs = path.join(dir, ...file.split("/"));
        mkdirSync(path.dirname(abs), { recursive: true });
        writeFileSync(abs, content);
    }
    return dir;
}

const BUILD = { dir: "web", install: "node install.cjs", command: "node build.cjs", output: "web/out" };
const quiet = { log: () => {}, stdio: "ignore" };
const log = dir => (existsSync(path.join(dir, "log.txt")) ? readFileSync(path.join(dir, "log.txt"), "utf8").trim().split("\n") : []);

test("auto install runs only when node_modules is missing; always reinstalls", () => {
    const dir = buildableProject();
    const [project] = fixtureConfig(dir, { build: BUILD }).projects;
    buildProject(project, quiet);
    buildProject(project, quiet);
    assert.deepEqual(log(dir), ["install", "build", "build"]);
    buildProject(project, { ...quiet, install: "always" });
    assert.deepEqual(log(dir), ["install", "build", "build", "install", "build"]);
});

test("a built project is published from its output folder only", () => {
    const dir = buildableProject();
    const config = fixtureConfig(dir, { build: BUILD, include: ["index.html", "*.css", "*.js", "assets/**"] });
    buildProject(config.projects[0], quiet);
    assert.equal(publishDir(config.projects[0]), path.join(dir, "web", "out"));
    const published = [...collectOutputs(config).keys()].filter(p => p.startsWith("softwareengineering/demoapp/")).sort();
    assert.deepEqual(published, [
        "softwareengineering/demoapp/assets/app.js",
        "softwareengineering/demoapp/index.html",
        "softwareengineering/demoapp/main.js",
        "softwareengineering/demoapp/style.css"
    ]);
    const entry = collectOutputs(config).get("softwareengineering/demoapp/index.html");
    assert.equal(entry.abs, path.join(dir, "web", "out", "index.html"));
});

test("an unbuilt project gives an actionable error", () => {
    const dir = buildableProject();
    const config = fixtureConfig(dir, { build: BUILD });
    assert.throws(() => collectOutputs(config), /hasn't been built yet[\s\S]*npm run build:projects/);
});

test("a failing build, or one that doesn't create its output, is an error", () => {
    const dir = buildableProject();
    const [failing] = fixtureConfig(dir, { build: { ...BUILD, command: "node -e \"process.exit(3)\"" } }).projects;
    assert.throws(() => buildProject(failing, quiet), /build failed/);
    const [noOutput] = fixtureConfig(dir, { build: { ...BUILD, output: "web/missing" } }).projects;
    assert.throws(() => buildProject(noOutput, quiet), /was not created/);
});

test("build settings are validated", () => {
    const nav = { sections: [{ id: "softwareengineering" }] };
    const base = { id: "x", title: "X", section: "softwareengineering", route: "softwareengineering/x/", repo: "r", branch: "main", entry: "index.html", include: ["*"] };
    const check = build => () => validateConfig({ nav, projects: [{ ...base, build }] });
    assert.doesNotThrow(check(BUILD));
    assert.throws(check({ output: "dist" }), /build\.command/);
    assert.throws(check({ command: "npm run build", output: "../elsewhere" }), /build\.output/);
    assert.throws(check({ command: "npm run build", output: "C:/dist" }), /build\.output/);
    assert.throws(check({ command: "npm run build", output: "dist", dir: "/abs" }), /build\.dir/);
    assert.throws(check("npm run build"), /must be an object/);
});
