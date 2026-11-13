import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

function git(args, options = {}) {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options }).trim();
}

// Shallow-clones each project's branch into .sources/<id>, replacing any
// previous clone. Public repositories need no credentials.
export function fetchSources(config, log = console.log) {
    const sourcesDir = path.join(config.root, ".sources");
    mkdirSync(sourcesDir, { recursive: true });

    for (const project of config.projects) {
        const dest = project.sourceDir;
        if (path.dirname(dest) !== sourcesDir) throw new Error(`Refusing to clone outside .sources: ${dest}`);
        rmSync(dest, { recursive: true, force: true });
        log(`Fetching ${project.id} (${project.branch}) from ${project.repo}`);
        execFileSync("git", [
            "clone", "--quiet", "--depth", "1", "--single-branch",
            "--branch", project.branch, project.repo, dest
        ], { stdio: "inherit" });
    }
}

// Commit and dirty state of a source checkout, recorded in build-info.json.
// "dirty" counts tracked changes only, so untracked local files (which are
// never published) don't flag it.
export function sourceInfo(dir) {
    if (!existsSync(path.join(dir, ".git"))) return { commit: null, dirty: null };
    try {
        return {
            commit: git(["-C", dir, "rev-parse", "HEAD"]),
            dirty: git(["-C", dir, "status", "--porcelain", "--untracked-files=no"]) !== ""
        };
    } catch {
        return { commit: null, dirty: null };
    }
}
