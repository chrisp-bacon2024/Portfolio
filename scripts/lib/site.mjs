import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { createMatcher } from "./glob.mjs";
import { injectPortfolioBar, renderSitePage } from "./inject.mjs";
import { rootPrefix, toPosix } from "./paths.mjs";
import { buildChromeCss, buildThemeCss } from "./tokens.mjs";

// Never published from a project repository, even if a project's "include"
// list would match: tests, docs, tooling, dotfiles and local artefacts such
// as PDFs. checkSite() verifies this again on the final output.
export const PROJECT_DENY = [
    "**/.*",
    "**/.*/**",
    "**/node_modules/**",
    "**/test/**",
    "**/tests/**",
    "**/__tests__/**",
    "**/*.test.*",
    "**/*.spec.*",
    "**/*.pdf",
    "**/*.md",
    "**/package.json",
    "**/package-lock.json"
];
export const isProjectDenied = createMatcher(PROJECT_DENY);

// Theme stylesheets, one per version: shared/theme/v1/theme.css, ...
export const THEME_FILE = /^theme\/v\d+\/theme\.css$/;

// shared/ files that are build inputs, not published assets.
const SHARED_EXCLUDE = new Set(["nav.json"]);

const SKIP_DIRS = new Set([".git", "node_modules"]);

// Lists files under `dir` as POSIX paths relative to it. Dot-directories,
// .git and node_modules are skipped. Dotfiles are returned (so the deny list
// can be tested) unless `skipDotfiles` is set.
export function walk(dir, { skipDotfiles = false } = {}) {
    const files = [];
    const visit = (current, prefix) => {
        for (const entry of readdirSync(current, { withFileTypes: true })) {
            if (entry.isDirectory()) {
                if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
                visit(path.join(current, entry.name), `${prefix}${entry.name}/`);
            } else if (entry.isFile()) {
                if (skipDotfiles && entry.name.startsWith(".")) continue;
                files.push(`${prefix}${entry.name}`);
            }
        }
    };
    visit(dir, "");
    return files.sort();
}

export function projectFiles(project) {
    const included = createMatcher(project.include);
    return walk(project.sourceDir).filter(file => included(file) && !isProjectDenied(file));
}

function missingSourceMessage(project, sourceMode) {
    return sourceMode === "fetched"
        ? `Source for "${project.id}" not found at ${project.sourceDir}. Run "npm run fetch" first, or build with --fetch.`
        : `Source for "${project.id}" not found at ${project.sourceDir}.\n`
          + `  Clone ${project.repo} there, set "localPath" for "${project.id}" in projects.local.json,\n`
          + `  or run "npm run build:ci" to build from GitHub instead.`;
}

// Every file the site publishes, keyed by output path (POSIX, relative to the
// site root). Used by both the production build and the dev server, so they
// publish exactly the same files.
export function collectOutputs(config) {
    const outputs = new Map();
    const add = (outputPath, descriptor) => {
        if (outputs.has(outputPath)) {
            throw new Error(`Two sources produce "${outputPath}": ${outputs.get(outputPath).abs} and ${descriptor.abs}`);
        }
        outputs.set(outputPath, descriptor);
    };

    for (const file of walk(config.siteDir, { skipDotfiles: true })) {
        add(file, { kind: file.endsWith(".html") ? "site-page" : "static", abs: path.join(config.siteDir, file) });
    }

    for (const file of walk(config.sharedDir, { skipDotfiles: true })) {
        if (SHARED_EXCLUDE.has(file)) continue;
        add(`shared/${file}`, {
            kind: file === "chrome/chrome.css" ? "chrome-css" : THEME_FILE.test(file) ? "theme-css" : "static",
            abs: path.join(config.sharedDir, file)
        });
    }

    for (const project of config.projects) {
        if (!existsSync(project.sourceDir) || !statSync(project.sourceDir).isDirectory()) {
            throw new Error(missingSourceMessage(project, config.sourceMode));
        }
        const files = projectFiles(project);
        if (!files.includes(project.entry)) {
            throw new Error(`"${project.id}": entry "${project.entry}" is missing or not matched by "include"`);
        }
        for (const file of files) {
            add(`${project.route}${file}`, {
                kind: file === project.entry ? "project-entry" : "static",
                abs: path.join(project.sourceDir, file),
                project
            });
        }
    }

    return outputs;
}

// Produces the published bytes for one output.
export function renderOutput(outputPath, descriptor, config) {
    switch (descriptor.kind) {
        case "site-page": {
            const is404 = outputPath === "404.html";
            const html = readFileSync(descriptor.abs, "utf8");
            return Buffer.from(renderSitePage(html, {
                nav: config.nav,
                // 404.html sits at the root and its <base> points at the
                // site root, so "./" works wherever it is served.
                root: rootPrefix(outputPath),
                file: toPosix(path.relative(config.root, descriptor.abs)),
                is404
            }));
        }
        case "project-entry": {
            const html = readFileSync(descriptor.abs, "utf8");
            return Buffer.from(injectPortfolioBar(html, {
                nav: config.nav,
                root: rootPrefix(outputPath),
                project: descriptor.project,
                file: `${descriptor.project.id}/${descriptor.project.entry}`
            }));
        }
        case "theme-css":
            return Buffer.from(buildThemeCss(config.sharedDir, descriptor.abs));
        case "chrome-css":
            return Buffer.from(buildChromeCss(config.sharedDir));
        default:
            return readFileSync(descriptor.abs);
    }
}
