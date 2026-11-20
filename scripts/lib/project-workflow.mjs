import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./config.mjs";

// Master copy of the workflow every project repository uses to tell the
// portfolio it changed, and where it lives inside each project.
export const TEMPLATE_PATH = "templates/project-workflow/portfolio-update.yml";
export const PROJECT_WORKFLOW_PATH = ".github/workflows/portfolio-update.yml";

const normalize = text => text.replace(/\r\n/g, "\n");

// "ok", "missing" or "different": whether a project folder has an exact copy
// of the template.
export function projectWorkflowStatus(projectDir) {
    const file = path.join(projectDir, PROJECT_WORKFLOW_PATH);
    if (!existsSync(file)) return "missing";
    const template = readFileSync(path.join(REPO_ROOT, TEMPLATE_PATH), "utf8");
    return normalize(readFileSync(file, "utf8")) === normalize(template) ? "ok" : "different";
}
