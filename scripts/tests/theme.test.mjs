// The shared theme (shared/theme/v1/theme.css) is loaded by portfolio pages
// and by hosted applications, so it must only style markup that opts in.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { REPO_ROOT } from "../lib/config.mjs";
import { injectPortfolioBar, localizeTheme } from "../lib/inject.mjs";
import { loadConfig } from "../lib/config.mjs";
import { buildThemeCss, parseRootTokens } from "../lib/tokens.mjs";
import { APP_HTML } from "./helpers.mjs";

const shared = path.join(REPO_ROOT, "shared");
const source = path.join(shared, "theme", "v1", "theme.css");
const built = buildThemeCss(shared, source);
const { nav } = loadConfig();

test("theme has only class selectors (no elements, ids, resets or globals)", () => {
    const css = readFileSync(source, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/@(?:media|supports)[^{]*\{/g, "");
    assert.doesNotMatch(css, /@(?!media|supports)\w+/, "no other at-rules");
    const offenders = [];
    for (const [, list] of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
        for (const selector of list.split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean)) {
            // Every compound must start with a class: ".btn.selected:hover"
            // is fine; "button", ".x a", "#id", "*" and "[attr]" are not.
            const compounds = selector.split(/\s*[\s>+~]\s*/);
            if (compounds.some(compound => !/^\.[\w-]/.test(compound))) offenders.push(selector);
        }
    }
    assert.deepEqual(offenders, []);
});

test("built theme declares every brand token, then the components", () => {
    const tokens = parseRootTokens(readFileSync(path.join(shared, "brand-tokens.css"), "utf8"));
    assert.match(built, /^\/\* Generated tokens/);
    for (const [name, value] of tokens) assert.ok(built.includes(`${name}: ${value};`), name);
    assert.ok(built.indexOf(":root") < built.indexOf(".btn {"));
});

test("every variable the theme uses is a brand token", () => {
    const defined = new Set(parseRootTokens(built).map(([name]) => name));
    const used = new Set([...built.matchAll(/var\(\s*(--[\w-]+)/g)].map(m => m[1]));
    assert.deepEqual([...used].filter(name => !defined.has(name)), []);
});

test("hosted apps' links to the live theme point at the build's own copy", () => {
    const html = APP_HTML.replace("</head>",
        '<link rel="stylesheet" href="https://christophermpalmer.com/shared/theme/v1/theme.css">\n</head>');
    const project = { id: "demo", title: "Demo", section: "softwareengineering", entry: "index.html" };
    const out = injectPortfolioBar(html, { nav, root: "../../", project });
    assert.match(out, /href="\.\.\/\.\.\/shared\/theme\/v1\/theme\.css"/);
    assert.doesNotMatch(out, /christophermpalmer\.com\/shared/);
});

test("theme URL rewriting only touches whole URLs on the site's own domain", () => {
    const rewrite = html => localizeTheme(html, { nav, root: "./" });
    assert.equal(rewrite('<link href="http://www.christophermpalmer.com/shared/theme/v1/theme.css">'), '<link href="./shared/theme/v1/theme.css">');
    for (const untouched of [
        '<link href="https://christophermpalmerXcom/shared/theme/v1/theme.css">',
        '<a href="https://evil.example/?u=https://christophermpalmer.com/shared/theme/">',
        '<link href="https://christophermpalmer.com/shared/other.css">'
    ]) assert.equal(rewrite(untouched), untouched);
});
