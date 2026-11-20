import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { after, test } from "node:test";
import { checkSite } from "../lib/check.mjs";
import { loadConfig } from "../lib/config.mjs";
import { collectOutputs, renderOutput } from "../lib/site.mjs";
import { fixtureConfig, makeFixtureProject } from "./helpers.mjs";

const dirs = [];
after(() => dirs.forEach(dir => rmSync(dir, { recursive: true, force: true })));

function fixture(files, overrides) {
    const dir = makeFixtureProject(files);
    dirs.push(dir);
    return fixtureConfig(dir, overrides);
}

function renderAll(config) {
    const rendered = new Map();
    for (const [p, d] of collectOutputs(config)) rendered.set(p, renderOutput(p, d, config));
    return rendered;
}

test("only included, non-denied project files are published", () => {
    const config = fixture();
    const published = [...collectOutputs(config).keys()].filter(p => p.startsWith("softwareengineering/demoapp/"));
    assert.deepEqual(published.sort(), [
        "softwareengineering/demoapp/index.html",
        "softwareengineering/demoapp/lib/util.js",
        "softwareengineering/demoapp/main.js",
        "softwareengineering/demoapp/style.css"
    ]);
});

test("include list is an allowlist", () => {
    const config = fixture({}, { include: ["index.html", "*.js", "style.css"] });
    const published = [...collectOutputs(config).keys()].filter(p => p.startsWith("softwareengineering/demoapp/"));
    assert.ok(!published.includes("softwareengineering/demoapp/lib/util.js"));
    // ...and the checker notices main.js now imports a file that isn't published.
    const errors = checkSite(renderAll(config), config);
    assert.ok(errors.some(e => e.includes('broken reference "./lib/util.js"')), errors.join("\n"));
});

test("a complete fixture site passes every check", () => {
    const config = fixture();
    const errors = checkSite(renderAll(config), config);
    // The real section pages link to the real projects, which this fixture
    // config replaces, so the checker must report exactly those links (pages
    // can't link to projects that aren't published), and nothing else.
    const expected = loadConfig().projects.map(project =>
        `${project.section}/index.html: broken reference "../${project.route}"`);
    assert.deepEqual([...errors].sort(), expected.sort());
});

test("site pages, shared assets and generated chrome CSS are all present", () => {
    const config = fixture();
    const outputs = collectOutputs(config);
    for (const p of ["index.html", "404.html", "softwareengineering/index.html", "datascience/index.html",
        "compositions/index.html", "about/index.html", "shared/brand-tokens.css", "shared/base.css", "shared/theme/v1/theme.css",
        "shared/chrome/chrome.css", "shared/chrome/chrome.js"]) {
        assert.ok(outputs.has(p), p);
    }
    assert.ok(!outputs.has("shared/nav.json"), "build inputs are not published");
    const css = renderOutput("shared/chrome/chrome.css", outputs.get("shared/chrome/chrome.css"), config).toString();
    assert.match(css, /^\/\* Generated --pf- tokens/);
    assert.match(css, /--pf-color-navy: #284a63;/);
});

test("missing source folder gives an actionable error", () => {
    const config = fixtureConfig("Z:/definitely/missing");
    assert.throws(() => collectOutputs(config), /not found[\s\S]*projects\.local\.json/);
});

test("entry outside the include list is rejected", () => {
    const config = fixture({}, { include: ["*.js"] });
    assert.throws(() => collectOutputs(config), /entry "index\.html"/);
});

test("route collisions with portfolio pages are rejected", () => {
    const config = fixture({}, { route: "about/" });
    assert.throws(() => collectOutputs(config), /Two sources produce "about\/index\.html"/);
});

test("checker flags broken links, root-absolute URLs, escapes and forbidden files", () => {
    const config = fixture();
    const rendered = renderAll(config);
    rendered.set("about/index.html", Buffer.from(
        '<a href="../nope/">a</a><a href="/about/">b</a><a href="../../../x">c</a>'
        + '<a href="https://example.com/">ok</a><a href="#top">ok</a><a href="mailto:x@y.z">ok</a><a href="../">ok</a>'
    ));
    rendered.set("softwareengineering/demoapp/notes.pdf", Buffer.from("%PDF"));
    const errors = checkSite(rendered, config).join("\n");
    assert.match(errors, /broken reference "\.\.\/nope\/"/);
    assert.match(errors, /"\/about\/" root-absolute/);
    assert.match(errors, /"\.\.\/\.\.\/\.\.\/x" points outside/);
    assert.match(errors, /forbidden file published: softwareengineering\/demoapp\/notes\.pdf/);
    assert.doesNotMatch(errors, /example\.com|#top|mailto|"\.\.\/"/);
});

test("video sources and posters are checked like any other reference", () => {
    const config = fixture();
    const rendered = renderAll(config);
    rendered.set("softwareengineering/index.html", Buffer.from(
        '<video poster="../previews/missing/poster.webp"><source src="../previews/missing/preview.webm"></video>'));
    const errors = checkSite(rendered, config).filter(e => e.includes("previews/missing"));
    assert.deepEqual(errors.sort(), [
        'softwareengineering/index.html: broken reference "../previews/missing/poster.webp"',
        'softwareengineering/index.html: broken reference "../previews/missing/preview.webm"'
    ]);
});
