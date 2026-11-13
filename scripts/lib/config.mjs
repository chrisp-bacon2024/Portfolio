import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function readJson(file) {
    try {
        return JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
        throw new Error(`Could not read ${file}: ${error.message}`);
    }
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ROUTE_PATTERN = /^(?:[a-z0-9-]+\/)+$/;

export function validateConfig({ nav, projects }) {
    const errors = [];
    const sectionIds = new Set(nav.sections.map(section => section.id));
    const ids = new Set();
    const routes = new Set();

    for (const project of projects) {
        const name = project.id ?? "(missing id)";
        for (const field of ["id", "title", "section", "route", "repo", "branch", "entry", "include"]) {
            if (project[field] === undefined) errors.push(`${name}: missing "${field}"`);
        }
        if (project.id && !ID_PATTERN.test(project.id)) errors.push(`${name}: id must be lowercase kebab-case`);
        if (ids.has(project.id)) errors.push(`${name}: duplicate id`);
        ids.add(project.id);

        if (project.section && (!sectionIds.has(project.section) || project.section === "home")) {
            errors.push(`${name}: section "${project.section}" is not a navigation section`);
        }
        if (project.route) {
            if (!ROUTE_PATTERN.test(project.route)) {
                errors.push(`${name}: route must be lowercase segments ending in "/" (got "${project.route}")`);
            } else if (!project.route.startsWith(`${project.section}/`)) {
                errors.push(`${name}: route must start with its section ("${project.section}/")`);
            }
            if (routes.has(project.route)) errors.push(`${name}: duplicate route`);
            routes.add(project.route);
        }
        if (project.include !== undefined && (!Array.isArray(project.include) || project.include.length === 0)) {
            errors.push(`${name}: "include" must be a non-empty list of globs`);
        }
        if (project.sourceUrl && !/^https:\/\//.test(project.sourceUrl)) {
            errors.push(`${name}: sourceUrl must be an https URL`);
        }
    }

    if (errors.length) throw new Error(`Invalid project configuration:\n  - ${errors.join("\n  - ")}`);
}

// sourceMode "local": read each project from its localPath (or the override
// in projects.local.json). sourceMode "fetched": read from .sources/<id>,
// where `build --fetch` clones it.
export function loadConfig({ root = REPO_ROOT, sourceMode = "local" } = {}) {
    const nav = readJson(path.join(root, "shared", "nav.json"));
    const manifest = readJson(path.join(root, "projects.json"));
    const localFile = path.join(root, "projects.local.json");
    const local = existsSync(localFile) ? readJson(localFile) : {};

    const projects = manifest.projects.map(project => {
        const override = local.projects?.[project.id] ?? {};
        const sourceDir = sourceMode === "fetched"
            ? path.join(root, ".sources", project.id)
            : path.resolve(root, override.localPath ?? project.localPath ?? "");
        return { ...project, sourceDir };
    });

    validateConfig({ nav, projects });

    return {
        root,
        siteDir: path.join(root, "site"),
        sharedDir: path.join(root, "shared"),
        nav,
        projects,
        sourceMode
    };
}
