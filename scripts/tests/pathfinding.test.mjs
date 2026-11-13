// Integration check against the real Pathfinding Visualizer source, using
// the location configured in projects.json / projects.local.json. Skipped
// if that folder isn't present (e.g. a fresh CI checkout before --fetch).

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { checkSite } from "../lib/check.mjs";
import { loadConfig } from "../lib/config.mjs";
import { collectOutputs, renderOutput, walk } from "../lib/site.mjs";

const config = loadConfig();
const project = config.projects.find(p => p.id === "pathfinding-visualizer");
const present = project && existsSync(project.sourceDir);
const ROUTE = "softwareengineering/pathfindingvisualizer/";

test("pathfinding visualizer: route, files and checks", { skip: !present && "source folder not present" }, () => {
    assert.equal(project.route, ROUTE);

    const outputs = collectOutputs(config);
    const rendered = new Map();
    for (const [p, d] of outputs) rendered.set(p, renderOutput(p, d, config));
    assert.deepEqual(checkSite(rendered, config), []);

    const published = [...outputs.keys()].filter(p => p.startsWith(ROUTE)).map(p => p.slice(ROUTE.length));

    // Every runtime file the app needs: the entry, its stylesheet, and every
    // tracked .js module outside tests/.
    const expected = walk(project.sourceDir)
        .filter(f => f === "index.html" || f === "style.css" || (f.endsWith(".js") && !f.startsWith("tests/")));
    assert.deepEqual(published.sort(), expected.sort());

    // Nothing else: no tests, docs, PDFs, package files, demo media.
    for (const file of published) {
        assert.ok(!/\.(pdf|md|gif|json)$/.test(file) && !file.startsWith("tests/"), `unexpected: ${file}`);
    }

    // Bar injected; app markup and its stylesheet/script references kept.
    const html = rendered.get(`${ROUTE}index.html`).toString();
    assert.match(html, /data-pf-bar/);
    assert.match(html, /<link rel="stylesheet" href="style\.css">/);
    assert.match(html, /<script type="module" src="\.\/main\.js"><\/script>/);
    assert.match(html, /<canvas id="gridCanvas"><\/canvas>/);
    assert.match(html, /href="\.\.\/\.\.\/shared\/chrome\/chrome\.css"/);

    // Non-entry files are byte-identical to the source.
    for (const file of ["main.js", "style.css", "algorithms/aStar.js"]) {
        assert.deepEqual(rendered.get(ROUTE + file), readFileSync(path.join(project.sourceDir, file)), file);
    }
});
