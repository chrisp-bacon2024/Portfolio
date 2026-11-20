// Keeps the deployment workflows and the project template consistent with
// each other. They are YAML, but simple enough to check with patterns.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { loadConfig, REPO_ROOT } from "../lib/config.mjs";
import { TEMPLATE_PATH } from "../lib/project-workflow.mjs";

const read = file => readFileSync(path.join(REPO_ROOT, file), "utf8");
const deploy = read(".github/workflows/deploy.yml");
const notify = read(".github/workflows/notify-portfolio.yml");
const template = read(TEMPLATE_PATH);

test("deploy listens for the event that notify sends", () => {
    const types = deploy.match(/repository_dispatch:\s*\n\s*types:\s*\[([^\]]*)\]/)[1].split(",").map(s => s.trim());
    const sent = notify.match(/event_type: "([^"]+)"/)[1];
    assert.ok(types.includes(sent), `deploy.yml types ${types} do not include "${sent}"`);
});

test("template calls this repository's notify workflow with the right secret", () => {
    const portfolioRepo = notify.match(/PORTFOLIO_REPO: (\S+)/)[1];
    const uses = template.match(/uses: (\S+)/)[1];
    assert.equal(uses, `${portfolioRepo}/.github/workflows/notify-portfolio.yml@main`);
    assert.ok(existsSync(path.join(REPO_ROOT, ".github/workflows/notify-portfolio.yml")));
    assert.match(notify, /on:\s*\n\s*workflow_call:/);

    const declared = notify.match(/secrets:\s*\n\s*([A-Z_]+):/)[1];
    assert.match(template, new RegExp(`${declared}: \\$\\{\\{ secrets\\.${declared} \\}\\}`));
});

test("template triggers on every branch the portfolio builds from", () => {
    const branches = template.match(/push:\s*\n\s*branches:\s*\[([^\]]*)\]/)[1].split(",").map(s => s.trim());
    for (const project of loadConfig().projects) {
        assert.ok(branches.includes(project.branch),
            `${project.id} is built from "${project.branch}", but the template only triggers on ${branches}`);
    }
});

test("deploy only runs on main, which the github-pages environment allows", () => {
    assert.match(deploy, /push:\s*\n\s*branches: \[main\]/);
    assert.doesNotMatch(deploy, /schedule:/);
});
