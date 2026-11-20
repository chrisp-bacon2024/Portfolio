// Builds the complete site into dist/.
//
//   node scripts/build.mjs            projects read from their local folders
//   node scripts/build.mjs --fetch    clone projects from GitHub into .sources/, then build
//   node scripts/build.mjs --fetched  build from existing .sources/ clones (CI, after fetch-sources.mjs)
//   node scripts/build.mjs --out DIR  write somewhere other than dist/
//   --skip-project-builds             don't run projects' build steps first
//                                     (CI runs them as a separate step)
//
// The build fails, and writes nothing, if any check in check.mjs fails.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { checkSite } from "./lib/check.mjs";
import { loadConfig, REPO_ROOT } from "./lib/config.mjs";
import { collectOutputs, renderOutput } from "./lib/site.mjs";
import { buildProjects } from "./lib/project-build.mjs";
import { fetchSources, sourceInfo } from "./lib/sources.mjs";

function parseArgs(argv) {
    const args = { fetch: false, fetched: false, skipProjectBuilds: false, out: "dist" };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--fetch") args.fetch = true;
        else if (argv[i] === "--fetched") args.fetched = true;
        else if (argv[i] === "--skip-project-builds") args.skipProjectBuilds = true;
        else if (argv[i] === "--out") args.out = argv[++i];
        else throw new Error(`Unknown argument: ${argv[i]}`);
    }
    return args;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const outDir = path.resolve(REPO_ROOT, args.out);
    const relOut = path.relative(REPO_ROOT, outDir);
    if (!relOut || relOut.startsWith("..") || path.isAbsolute(relOut) || ["site", "shared", "scripts", ".git", ".sources"].includes(relOut.split(path.sep)[0])) {
        throw new Error(`Refusing to write build output to ${outDir}`);
    }

    const config = loadConfig({ sourceMode: args.fetch || args.fetched ? "fetched" : "local" });
    if (args.fetch) fetchSources(config);
    if (!args.skipProjectBuilds) {
        buildProjects(config, { install: config.sourceMode === "fetched" ? "always" : "auto" });
    }

    const outputs = collectOutputs(config);
    const rendered = new Map();
    for (const [outputPath, descriptor] of outputs) {
        rendered.set(outputPath, renderOutput(outputPath, descriptor, config));
    }

    const errors = checkSite(rendered, config);
    if (errors.length) {
        console.error(`\nBuild failed: ${errors.length} problem(s)\n  - ${errors.join("\n  - ")}\n`);
        process.exit(1);
    }

    const info = {
        builtAt: new Date().toISOString(),
        sourceMode: config.sourceMode,
        portfolio: sourceInfo(REPO_ROOT),
        projects: Object.fromEntries(config.projects.map(project => [project.id, {
            repo: project.repo,
            branch: project.branch,
            route: project.route,
            ...sourceInfo(project.sourceDir)
        }]))
    };
    rendered.set("build-info.json", Buffer.from(`${JSON.stringify(info, null, 2)}\n`));
    // Not strictly needed for Actions-based Pages deployments; harmless and
    // keeps the output correct if it is ever published from a branch.
    rendered.set(".nojekyll", Buffer.alloc(0));

    rmSync(outDir, { recursive: true, force: true });
    for (const [outputPath, content] of rendered) {
        const file = path.join(outDir, ...outputPath.split("/"));
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, content);
    }

    console.log(`Built ${rendered.size} files into ${path.relative(REPO_ROOT, outDir) || "."}/`);
    for (const project of config.projects) {
        const count = [...rendered.keys()].filter(key => key.startsWith(project.route)).length;
        const { commit, dirty } = info.projects[project.id];
        const where = commit ? `${commit.slice(0, 7)}${dirty ? " + uncommitted changes" : ""}` : "no git info";
        console.log(`  /${project.route}  ${project.title}: ${count} files (${where})`);
    }
}

try {
    main();
} catch (error) {
    console.error(`\nBuild failed: ${error.message}\n`);
    process.exit(1);
}
