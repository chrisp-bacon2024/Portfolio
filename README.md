# christophermpalmer.com

Source for Christopher M. Palmer's portfolio: the portfolio pages, the shared design system, and the build that brings independently maintained applications onto the site.

The visual reference for everything here is [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md).

## How it fits together

- **Each application stays in its own repository.** This repository never holds a copy of an application's source. The build reads each application from its repository (or your local clone) and publishes it at its route.
- **[projects.json](projects.json)** lists the hosted applications: repository, branch, route, section, which files to publish (`include`), and the test command.
- **The portfolio bar** (wordmark, breadcrumb, source link, site menu) is added to each application's `index.html` at build time. Nothing else in the application changes.
- **The output is static files** for GitHub Pages. Every route is a real folder with an `index.html`, so direct links and refreshes work without a router.

```
site/            portfolio pages (templates with <!-- pf:... --> placeholders)
shared/          design system, published at /shared/
  brand-tokens.css   brand tokens (portfolio pages only)
  base.css           base styles (portfolio pages only, never loaded into apps)
  nav.json           the five main navigation items
  chrome/            portfolio bar, site header, footer and menu (CSS + JS)
scripts/         build, dev server and tests (no dependencies)
projects.json    hosted applications
```

| Route | Contents |
|---|---|
| `/` | Home |
| `/softwareengineering/` | Software Engineering |
| `/softwareengineering/pathfindingvisualizer/` | Pathfinding Visualizer (from [its own repository](https://github.com/chrisp-bacon2024/pathfinding-visualizer)) |
| `/datascience/` | Data Science |
| `/compositions/` | Compositions |
| `/about/` | About |

## Requirements

- Node.js 18.12 or newer (20 or 22 LTS recommended). There are no npm dependencies, so `npm install` isn't needed.
- Git.
- A local clone of each hosted application, by default as a sibling folder:

  ```
  E:\Programming\Portfolio                  this repository
  E:\Programming\Pathfinding Visualizer     https://github.com/chrisp-bacon2024/pathfinding-visualizer
  ```

  If a clone lives somewhere else, create `projects.local.json` (git-ignored):

  ```json
  { "projects": { "pathfinding-visualizer": { "localPath": "D:/code/pathfinding-visualizer" } } }
  ```

## Local development

```bash
npm run dev
```

Open <http://localhost:8080/>. The Pathfinding Visualizer is at <http://localhost:8080/softwareengineering/pathfindingvisualizer/>.

The dev server renders each request from `site/`, `shared/` and the application's local folder, so **edits in either repository appear when you refresh**. There's nothing to rebuild or copy. It behaves like GitHub Pages: folder URLs serve `index.html`, a folder URL without its trailing slash redirects, and unknown paths get the 404 page. It also publishes exactly the same files as the production build, so a file the build would leave out (tests, PDFs, README...) returns 404 locally too.

Use another port with `npm run dev -- --port 3000`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Live local server (above). |
| `npm run build` | Builds the site into `dist/` from the local application folders. |
| `npm run build:ci` | Builds from GitHub instead: clones each application's branch into `.sources/` first. This is what CI runs. |
| `npm run preview` | Serves the built `dist/` folder exactly as it will be deployed. |
| `npm test` | Tests for the build tooling (injection, file selection, link checking, CSS isolation). |
| `npm run test:projects` | Runs each application's own test command (`"test"` in projects.json). Add `-- --fetched` to test the `.sources/` clones. |

## What the build checks

The build fails, and writes nothing, if:

- an application's entry page is missing, or the portfolio bar couldn't be added to it;
- any local link, stylesheet, script or JavaScript `import` in the output points at a file that isn't published;
- a link is root-absolute (`/about/`), which would break at the GitHub Pages project URL; all internal links are relative;
- a forbidden file would be published from an application: tests, Markdown, PDFs, `package.json`, dotfiles or `node_modules`, even if the `include` list matches it;
- any required page (home, the five sections, 404) is missing.

`dist/build-info.json` records the commit of the portfolio and of each application in every build.

## Shared styling and isolation

- Portfolio pages load `brand-tokens.css`, `base.css` and the chrome.
- Hosted applications load **only** `shared/chrome/chrome.css` and `chrome.js`:
  - every selector in `chrome.css` starts with a `.pf-` class;
  - its variables are `--pf-` copies of the brand tokens, generated at build time;
  - there are no global resets;
  - a test enforces all of this.
- The chrome stops keyboard events that start inside it, so application shortcuts (such as the visualizer's `d`, `b`, `j`, `a`, `w`, `g`, `m`, `r`) don't fire while you use the portfolio menu.
- Each application keeps its own fonts, colours and layout. A full-height application reserves the bar's height with `var(--pf-bar-height, 0px)`. Outside the portfolio that variable is unset, so the application is unaffected.

Further documentation (deployment, domain setup, integrating another application) will be added in `docs/` as those phases are completed.
