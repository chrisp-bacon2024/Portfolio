import { readFileSync } from "node:fs";
import path from "node:path";

// Brand tokens live once, in shared/brand-tokens.css, as unprefixed :root
// variables for portfolio pages. The chrome injected into hosted apps must
// not define unprefixed globals (an app may use --color-text itself), so the
// build derives a --pf- prefixed copy scoped to .pf-scope and prepends it to
// chrome.css. Editing brand-tokens.css updates both automatically.

function stripComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

export function parseRootTokens(css) {
    const block = stripComments(css).match(/:root\s*\{([^}]*)\}/);
    if (!block) throw new Error("brand-tokens.css: no :root block found");
    const tokens = [];
    for (const match of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
        tokens.push([match[1], match[2].trim()]);
    }
    return tokens;
}

export function prefixTokens(tokens, prefix = "pf") {
    return tokens.map(([name, value]) => [
        `--${prefix}-${name.slice(2)}`,
        value.replace(/var\(\s*--/g, `var(--${prefix}-`)
    ]);
}

export function renderScopedTokens(css, selector = ".pf-scope") {
    const lines = prefixTokens(parseRootTokens(css)).map(([name, value]) => `  ${name}: ${value};`);
    return `${selector} {\n${lines.join("\n")}\n}\n`;
}

// The theme (shared/theme/v<n>/theme.css) gets every brand token as an
// unprefixed :root variable above its components, so one stylesheet gives an
// application both. Applications opt into the theme, so unprefixed names are
// intended here (unlike the chrome, which apps never choose to load).
export function renderRootTokens(css) {
    const lines = parseRootTokens(css).map(([name, value]) => `  ${name}: ${value};`);
    return `:root {\n${lines.join("\n")}\n}\n`;
}

export function buildThemeCss(sharedDir, themeFile) {
    const tokens = readFileSync(path.join(sharedDir, "brand-tokens.css"), "utf8");
    const components = readFileSync(themeFile, "utf8");
    return "/* Generated tokens: from shared/brand-tokens.css at build time. */\n"
        + renderRootTokens(tokens)
        + "\n"
        + components;
}

export function buildChromeCss(sharedDir) {
    const tokens = readFileSync(path.join(sharedDir, "brand-tokens.css"), "utf8");
    const chrome = readFileSync(path.join(sharedDir, "chrome", "chrome.css"), "utf8");
    return "/* Generated --pf- tokens: derived from shared/brand-tokens.css at build time. */\n"
        + renderScopedTokens(tokens)
        + "\n"
        + chrome;
}
