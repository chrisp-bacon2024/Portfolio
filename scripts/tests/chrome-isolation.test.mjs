// Guards the rule that portfolio chrome CSS can never style a hosted app:
// every selector must start with a .pf- class, :root may only declare
// --pf-* properties, and only --pf-* variables are referenced.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { REPO_ROOT } from "../lib/config.mjs";

const css = readFileSync(path.join(REPO_ROOT, "shared", "chrome", "chrome.css"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "");

// Returns [selectorList, body] pairs. Callers remove @media/@supports
// openers first; their leftover closing braces are skipped by the pattern.
function rules(source) {
    return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => [m[1].trim(), m[2]]);
}

test("every chrome selector is scoped to a .pf- class", () => {
    const offenders = [];
    const flat = css.replace(/@(?:media|supports)[^{]*\{/g, "");
    assert.doesNotMatch(flat, /@(?!media|supports)\w+/, "no other at-rules (e.g. @font-face, @import)");
    for (const [selectorList, body] of rules(flat)) {
        // Split on top-level commas only (not inside :where(...)).
        const selectors = selectorList.split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean);
        for (const selector of selectors) {
            if (selector === ":root") {
                const props = [...body.matchAll(/([\w-]+)\s*:/g)].map(m => m[1]);
                if (props.some(p => !p.startsWith("--pf-"))) offenders.push(`:root declares ${props.join(", ")}`);
            } else if (!selector.startsWith(".pf-")) {
                offenders.push(selector);
            }
        }
    }
    assert.deepEqual(offenders, []);
});

test("chrome CSS only references --pf- variables", () => {
    const refs = [...css.matchAll(/var\(\s*(--[\w-]+)/g)].map(m => m[1]);
    assert.ok(refs.length > 0);
    assert.deepEqual(refs.filter(name => !name.startsWith("--pf-")), []);
});

test("every --pf- variable used by the chrome exists in the generated tokens", async () => {
    const { buildChromeCss } = await import("../lib/tokens.mjs");
    const full = buildChromeCss(path.join(REPO_ROOT, "shared"));
    const defined = new Set([...full.matchAll(/(--pf-[\w-]+)\s*:/g)].map(m => m[1]));
    const used = new Set([...full.matchAll(/var\(\s*(--pf-[\w-]+)/g)].map(m => m[1]));
    assert.deepEqual([...used].filter(name => !defined.has(name)), []);
});

test("chrome script defines no globals and isolates keyboard events", () => {
    const js = readFileSync(path.join(REPO_ROOT, "shared", "chrome", "chrome.js"), "utf8");
    assert.match(js, /^\/\*[\s\S]*?\*\/\s*\(\(\) => \{/, "wrapped in an IIFE");
    assert.match(js, /\["keydown", "keyup", "keypress"\]/);
    assert.match(js, /stopPropagation\(\)/);
});
