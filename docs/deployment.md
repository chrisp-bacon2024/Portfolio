# Deployment and automatic updates

How christophermpalmer.com is built and published, and how a change in a project's own repository reaches the site without anyone touching this repository.

## How it fits together

```
project repo (e.g. pathfinding-visualizer)          Portfolio repo
──────────────────────────────────────────          ──────────────────────────────────────────
push to main
  ├─ its own GitHub Pages site (unchanged)
  └─ .github/workflows/portfolio-update.yml
       └─ calls Portfolio/.github/workflows/  ──►   notify-portfolio.yml
          notify-portfolio.yml                        sends repository_dispatch "project-updated"
                                                           │
push to main, or Actions ▸ Run workflow ─────────►   deploy.yml
                                                      1. npm test                 portfolio tooling tests
                                                      2. npm run fetch            clone every project
                                                      3. npm run test:projects    each project's own tests
                                                      4. build --fetched          build from those clones
                                                      5. deploy to GitHub Pages
```

- **The site is always rebuilt in full.** Whatever triggered a run, every project in `projects.json` is fetched at the head of its branch. The notification only says "something changed".
- **A failing step deploys nothing.** The live site stays as it was. This applies to any project's tests and to the build checks.
- **Projects stay independent.** The portfolio only reads public project repositories and never writes to them. A project's own Pages site and workflows keep working whether or not the portfolio exists.
- **Runs never overlap.** If several runs are queued, only the newest waits, so the latest sources always win.
- **The run summary records the deployed commits.** It shows the portfolio commit and each project's commit (`build-info.json`, also published at `/build-info.json`).

## Files

| File | Where | Purpose |
|---|---|---|
| `.github/workflows/deploy.yml` | Portfolio | Tests, builds and deploys the site. |
| `.github/workflows/notify-portfolio.yml` | Portfolio | Reusable workflow that sends the `project-updated` event. Fix it once here and every project picks up the fix. |
| `templates/project-workflow/portfolio-update.yml` | Portfolio | Master copy of the small file every project repository needs. |
| `.github/workflows/portfolio-update.yml` | each project | Exact copy of the template. |
| `.node-version` | Portfolio | Node.js version CI uses (an LTS line). |

`npm test` checks these files against each other: the event name, the secret name, the reusable workflow's path, and the branches. `npm run test:projects` warns when a project's copy of the template is missing or differs from the template.

## One-time setup

### 1. GitHub Pages for the Portfolio repository

Already done: **Settings ▸ Pages ▸ Source: GitHub Actions**. The `github-pages` environment only allows deployments from `main`, and every trigger runs on `main`.

### 2. The dispatch token

Project repositories can't trigger workflows in another repository with their built-in `GITHUB_TOKEN`, so they use one shared fine-grained personal access token.

1. Go to GitHub ▸ **Settings ▸ Developer settings ▸ Personal access tokens ▸ Fine-grained tokens ▸ Generate new token**.
2. Fill it in:
   - **Name:** `portfolio-dispatch`
   - **Expiration:** up to 1 year. Put a reminder in your calendar.
   - **Resource owner:** your account
   - **Repository access:** *Only select repositories* ▸ **Portfolio**, and nothing else
   - **Permissions ▸ Repository ▸ Contents:** **Read and write**. This is what the `dispatches` endpoint requires. *Metadata: Read* is added automatically. Leave everything else as *No access*.
3. Copy the token. GitHub shows it only once.

**Why this is acceptable:** the token can only reach the Portfolio repository. It's stored as an encrypted secret. Workflows triggered by pull requests from forks never receive secrets.

### 3. Store the token in each project repository

Run this once per project. `gh` prompts for the value, so the token never appears in your shell history:

```sh
gh secret set PORTFOLIO_DISPATCH_TOKEN --repo chrisp-bacon2024/pathfinding-visualizer
```

The secret name must be exactly `PORTFOLIO_DISPATCH_TOKEN`. Nothing is stored in the Portfolio repository itself.

## Testing the chain

1. In the project repository, open **Actions ▸ Update portfolio ▸ Run workflow**, or push to `main`.
2. The run should finish in a few seconds. Its summary says *"Asked chrisp-bacon2024/Portfolio to redeploy…"*.
3. In the Portfolio repository, **Actions ▸ Deploy site** shows a new run triggered by `repository_dispatch`. Its "Show what triggered this run" step prints the payload.

From the command line:

```sh
gh workflow run portfolio-update.yml --repo chrisp-bacon2024/pathfinding-visualizer
gh run list --repo chrisp-bacon2024/Portfolio --workflow deploy.yml --limit 3
```

## Rotating the token

When it expires, or if it might have leaked:

1. Regenerate it (same page, **Regenerate token**), or create a new one with the same settings.
2. Run `gh secret set PORTFOLIO_DISPATCH_TOKEN --repo …` again for **every** project repository.
3. Test one project as above.

Until you do this, project pushes still update the project's own site, but the portfolio won't update. Pushing to Portfolio or running *Deploy site* by hand still works.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| *Update portfolio* fails: "secret is not set" | No `PORTFOLIO_DISPATCH_TOKEN` in that project repository | Step 3 above. |
| *Update portfolio* fails with 401 / "Bad credentials" | Token expired or revoked | Rotate it. |
| *Update portfolio* fails with 403 or 404 | The token doesn't include the Portfolio repository, or lacks Contents: Read and write | Edit the token's repository access and permissions. |
| *Update portfolio* fails: "workflow was not found" | `notify-portfolio.yml` is missing from Portfolio's `main`, or Portfolio became private | Restore the file and keep Portfolio public. |
| *Update portfolio* succeeds but no *Deploy site* run appears | `deploy.yml` doesn't list `project-updated`, or Actions is disabled in Portfolio | `npm test` catches the first; check **Settings ▸ Actions** for the second. |
| *Deploy site* fails at "Test the hosted applications" | A project's own tests fail at its branch head, or its test command doesn't work on the CI Node version | Fix in the project repository. Nothing was deployed. |
| *Deploy site* fails at "Build the site" | A build check failed (missing file, root-absolute link…) | The log lists each problem. Reproduce locally with `npm run build`. |
| The project changed but the site shows the old version | The deploy hasn't finished, or the browser cached the page | Check the run summary's commits; hard-refresh. |
