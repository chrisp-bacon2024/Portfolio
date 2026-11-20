import { execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

// Projects that must be compiled before they can be published (TypeScript,
// Vite...) declare a "build" step in projects.json:
//
//   "build": {
//     "dir": "site",              folder to run the commands in (default ".")
//     "install": "npm ci",        run when node_modules is missing, or always in CI
//     "command": "npm run build", produces the publishable files
//     "output": "site/dist"       folder that is published (relative to the repo)
//   }
//
// "entry" and "include" are then relative to "output". Projects without a
// build step are published straight from their repository folder.

// The folder a project is published from.
export function publishDir(project) {
    return project.build ? path.join(project.sourceDir, ...project.build.output.split("/")) : project.sourceDir;
}

// Runs one project's build. install: "auto" installs only when node_modules
// is missing (local), "always" installs every time (CI, fresh clones).
export function buildProject(project, { install = "auto", log = console.log, stdio = "inherit" } = {}) {
    if (!project.build) return false;
    const { dir = ".", install: installCommand, command } = project.build;
    const cwd = path.join(project.sourceDir, ...dir.split("/"));
    if (!existsSync(cwd)) throw new Error(`"${project.id}": build folder not found: ${cwd}`);

    const run = (cmd, what) => {
        log(`> ${project.id}: ${what} (${cmd}) in ${path.relative(process.cwd(), cwd) || "."}`);
        try {
            execSync(cmd, { cwd, stdio });
        } catch {
            throw new Error(`"${project.id}": ${what} failed: ${cmd}`);
        }
    };

    if (installCommand && (install === "always" || !existsSync(path.join(cwd, "node_modules")))) {
        run(installCommand, "install");
    }
    run(command, "build");

    const out = publishDir(project);
    if (!existsSync(out) || !statSync(out).isDirectory()) {
        throw new Error(`"${project.id}": the build finished but "${project.build.output}" was not created`);
    }
    return true;
}

export function buildProjects(config, options = {}) {
    return config.projects.filter(project => buildProject(project, options)).map(project => project.id);
}
