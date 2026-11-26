# Adding a project to the portfolio

The checklist used for Pathfinding Visualizer. Follow it in order for each new project. Every project uses the same update workflow and the same build pipeline; only its `projects.json` entry and its card are specific to it.

The project keeps its own repository, its own GitHub Pages site and its own workflows. The portfolio never stores a copy of the project's source. It fetches the project at build time.

## 0. Decide what kind of project it is

| Kind | Example | How it's hosted |
|---|---|---|
| **Static app, no build step:** HTML, CSS and JS served as they are | Pathfinding Visualizer | Supported. Follow this guide. |
| **Static app with a build step:** Vite, TypeScript, a bundler | Genetic Snake (`site/`, Vite) | Supported. Follow this guide and add a `build` step; see [Projects with a build step](#projects-with-a-build-step). |
| **Needs a server, a database or secret API keys** | JobPilot (likely) | Can't run on GitHub Pages. Give it a normal portfolio page (screenshots, write-up, links) instead of embedding it. |
| **Analysis or notebook** | Data Science projects | A written project page with charts and findings, linking to the repository. Not an embedded app. |

## 1. Prepare the project repository

Each item below keeps the project working **both** standalone and inside the portfolio.

- [ ] **Use relative URLs only.** Write `style.css` or `./data/x.json`, never `/style.css`. The app is served from `/softwareengineering/<name>/`, not from `/`, and the build rejects root-absolute links. For Vite, set `base: "./"` in `vite.config.ts` (Genetic Snake already does).
- [ ] **Use the shared theme.** Link it before the app's own stylesheet:
  ```html
  <link rel="stylesheet" href="https://christophermpalmer.com/shared/theme/v1/theme.css">
  ```
  Then use its components for standard controls (`class="btn"`, `btn selected`, `page-title`, `section-title`, `select`, `range`, `popover`, `badge`) and its variables for everything else (`var(--color-border)`, `var(--space-3)`…), instead of raw colours and sizes. Keep only app-specific layout in the app's CSS. Pathfinding Visualizer's `style.css` is the worked example. The portfolio build points the link at its own copy; standalone, the app loads it from the live site, so working on the app locally needs an internet connection.
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
| `build` | Optional. For projects that must be compiled; see [Projects with a build step](#projects-with-a-build-step). |
| `test` | Optional. The command CI runs in the project folder before deploying. |

Then add a card to the section page (for example `site/softwareengineering/index.html`). Copy the Pathfinding Visualizer card, change the title, summary, badges and link, and give it its own accent colour (`<article class="card has-accent" style="--accent: …">`, see BRAND_GUIDELINES §7.6). Remove the project from that page's "Coming to this page" list.

### Card preview

Each card can show a short silent loop of the app working (BRAND_GUIDELINES 7.9, "Card previews").

1. Add a recipe for the project in [scripts/preview-recipes.mjs](../scripts/preview-recipes.mjs). It drives the real app through its own controls: what to set up, which element to film, and how to start the motion. Copy the closest existing recipe. Wait for anything the app animates first (Pathfinding Visualizer ignores clicks while its terrain is still generating). Pick an app speed at which the motion takes most of `CLIP_SECONDS` (about 22 s), and set `length: CLIP_SECONDS` so the clip holds on the result until it matches the other cards.
2. Record it (needs Chrome and ffmpeg):
   ```sh
   npm run previews -- <project-id>
   ```
   This writes `site/previews/<project-id>/`: `preview.webm`, `preview.mp4` and `poster.webp`. Look at the poster and play the video before committing; aim for under 1 MB per file.
3. Put the preview block at the top of the card. Copy it from an existing card and change the id, the `data-label` and the `aria-label` (what the preview shows). The page must load `shared/card-previews.js`, which the Software Engineering page already does.

Re-record a preview after a visible change to the app. `npm run previews` with no id re-records them all.

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

Some projects must be compiled before they can be published, for example a TypeScript + Vite site. Genetic Snake is the worked example: its web demo lives in `site/` and builds into `site/dist/`. Add a `build` field to its `projects.json` entry:

```json
"build": { "dir": "site", "install": "npm ci", "command": "npm run build", "output": "site/dist" },
"include": ["index.html", "assets/**", "data/**"]
```

| Field | Meaning |
|---|---|
| `build.dir` | Folder to run the commands in, relative to the repository. Optional; defaults to the root. |
| `build.install` | Optional. Installs dependencies. Runs locally only when `node_modules` is missing, and always in CI, which uses fresh clones. Use `npm ci`, so the lockfile is respected. |
| `build.command` | Produces the publishable files. |
| `build.output` | The folder that gets published, relative to the repository. **`entry` and `include` are relative to this folder**, not to the repository. |

Where builds run:

- **`npm run dev`** compiles each built project once at startup. Run `npm run build:projects` in another terminal to pick up changes while the server is running.
- **`npm run build`** compiles them before building the site.
- **CI** compiles them in their own step, after the projects' tests and before the site build. A failing build stops the deploy.

Checklist for a built project:

- [ ] **Relative asset URLs.** For Vite, set `base: "./"` in `vite.config.ts`. The build check rejects root-absolute URLs.
- [ ] **A committed lockfile** (`package-lock.json`), so `npm ci` installs the same versions every time.
- [ ] **A build that works on the CI Node version** (`.node-version`).
- [ ] **No tests?** Leave out `test`. The compile step (for example `tsc` in `npm run build`) still has to pass.
- [ ] **A sticky header of its own?** Make sure in-page links don't hide headings under it (`scroll-margin-top`), and consider making it static on phones. Genetic Snake does both.
