# Adding a project to the portfolio

The checklist used for Pathfinding Visualizer. Follow it in order for each new project. Every project uses the same update workflow and the same build pipeline; only its `projects.json` entry and its card are specific to it.

The project keeps its own repository, its own GitHub Pages site and its own workflows. The portfolio never stores a copy of the project's source. It fetches the project at build time.

## 0. Decide what kind of project it is

| Kind | Example | How it's hosted |
|---|---|---|
| **Static app, no build step:** HTML, CSS and JS served as they are | Pathfinding Visualizer | Supported. Follow this guide. |
| **Static app with a build step:** Vite, TypeScript, a bundler | Genetic Snake (`site/`, Vite) | Needs one portfolio feature first. See [Projects with a build step](#projects-with-a-build-step). |
| **Needs a server, a database or secret API keys** | JobPilot (likely) | Can't run on GitHub Pages. Give it a normal portfolio page (screenshots, write-up, links) instead of embedding it. |
| **Analysis or notebook** | Data Science projects | A written project page with charts and findings, linking to the repository. Not an embedded app. |

## 1. Prepare the project repository

Each item below keeps the project working **both** standalone and inside the portfolio.

- [ ] **Use relative URLs only.** Write `style.css` or `./data/x.json`, never `/style.css`. The app is served from `/softwareengineering/<name>/`, not from `/`, and the build rejects root-absolute links. For Vite, set `base: "./"` in `vite.config.ts` (Genetic Snake already does).
- [ ] **Full-height layouts reserve room for the portfolio bar.** If the app fills the viewport (`height: 100vh` or similar), keep that line as a fallback and add this after it:
  ```css
  height: calc(100dvh - var(--pf-bar-height, 0px));
  ```
  Standalone, the variable is unset and nothing changes. Apps that scroll like a normal page don't need this.
- [ ] **Make the test command work on Node 22 and later.** Use `"test": "node --test"`, with no folder argument; it finds `*.test.js` files by itself. `node --test tests/` only works on Node 18 and broke CI once. If the project has no tests, leave `test` out of its `projects.json` entry.
- [ ] **Keyboard shortcuts need no change.** The portfolio bar stops its own key presses from reaching the app.
- [ ] **Keep the repository public.** CI clones it without credentials.
- [ ] **Add the update workflow.** Copy it byte for byte; don't edit it:
  ```sh
  mkdir -p .github/workflows
  cp ../Portfolio/templates/project-workflow/portfolio-update.yml .github/workflows/portfolio-update.yml
  ```
  It triggers on pushes to `main`. If the project builds from another branch, change the template itself in the Portfolio repository (`npm test` checks this), not the copy.
- [ ] **Add the secret.** Use the same shared token every project uses (see [deployment.md](deployment.md#2-the-dispatch-token)):
  ```sh
  gh secret set PORTFOLIO_DISPATCH_TOKEN --repo chrisp-bacon2024/<repo-name>
  ```

## 2. Register it in the Portfolio repository

Add an entry to `projects.json`:

```json
{
  "id": "genetic-snake",
  "title": "Genetic Snake",
  "section": "softwareengineering",
  "route": "softwareengineering/geneticsnake/",
  "repo": "https://github.com/chrisp-bacon2024/Genetic-Snake.git",
  "branch": "main",
  "localPath": "../Genetic Snake",
  "entry": "index.html",
  "sourceUrl": "https://github.com/chrisp-bacon2024/Genetic-Snake",
  "include": ["index.html", "*.css", "*.js"],
  "test": "npm test"
}
```

| Field | Meaning |
|---|---|
| `id` | Lowercase kebab-case. Also the folder name under `.sources/`. |
| `title` | Shown in the breadcrumb and the browser tab. |
| `section` | One of the navigation sections: `softwareengineering`, `datascience`, `compositions`, `about`. |
| `route` | URL path. Must start with the section; unhyphenated words, per BRAND_GUIDELINES §7.2; ends with `/`. |
| `repo`, `branch` | What CI clones. |
| `localPath` | Where the project lives on your machine, relative to this repository. Override it per machine in `projects.local.json` (gitignored). |
| `entry` | The page that gets the portfolio bar. |
| `sourceUrl` | Optional. Adds the "Source ↗" link to the bar. |
| `include` | Allowlist of files to publish, as globs. Tests, Markdown, PDFs, `package.json`, dotfiles and `node_modules` are never published even if they match. |
| `test` | Optional. The command CI runs in the project folder before deploying. |

Then add a card to the section page (for example `site/softwareengineering/index.html`). Copy the Pathfinding Visualizer card, change the title, summary, badges and link, and give it its own accent colour (`<article class="card has-accent" style="--accent: …">`, see BRAND_GUIDELINES §7.6). Remove the project from that page's "Coming to this page" list.

## 3. Check locally

```sh
npm run dev               # open the new route; edits in either repository show on refresh
npm run test:projects     # runs the project's tests, and warns if the update workflow is missing or edited
npm test
npm run build             # all build checks; prints how many files the project published
npm run preview           # serves dist/ exactly as it will be deployed
```

Check that:
- the app works, with the bar and Menu above it;
- nothing scrolls unexpectedly at phone and desktop widths;
- the app's keyboard shortcuts don't fire while the Menu is open;
- the card and breadcrumb links work;
- the build's file count is plausible (no data files missing).

## 4. Commit and push, project first

1. **Push the project repository first.** CI always fetches the project from GitHub, so the portfolio must not depend on unpushed project changes. This push also runs *Update portfolio*. The resulting deploy won't include the new project yet, because it isn't in `projects.json`.
2. **Then push the Portfolio repository.** This deploys the site with the new project.
3. Check the *Deploy site* run summary. The new project should be listed with its commit.

From then on, every push to the project's `main` updates both its own site and the portfolio.

## Projects with a build step

Genetic Snake's web demo lives in `site/` and is built with `npm ci && npm run build` (TypeScript + Vite) into `site/dist/`. The portfolio currently publishes source files directly, so before integrating it the portfolio build needs a small addition: an optional `build` field, for example:

```json
"build": { "dir": "site", "install": "npm ci", "command": "npm run build", "output": "site/dist" }
```

When `build` is present, CI would run the install and build commands in the clone after its tests, and then publish from `output` (filtered by `include`) instead of from the repository root. `npm run dev` would serve the built output in the same way.

What's already true for Genetic Snake:
- `base: "./"` gives relative URLs;
- the page scrolls normally, so no viewport change is needed;
- its own Pages workflow stays as it is.

It currently has no JavaScript tests, so either leave out `test` (the TypeScript check in `npm run build` still has to pass) or add some.

This feature will be added, with tests, when Genetic Snake is integrated. This guide will then be updated to match.
