# christophermpalmer.com

Source for Christopher M. Palmer's portfolio: the portfolio pages, the shared design system, and the build that brings independently maintained applications onto the site.

The visual reference for everything here is [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md).

## How it fits together

- **Each application stays in its own repository.** This repository never holds a copy of an application's source. The build reads each application from its repository (or your local clone) and publishes it at its route.
- **[projects.json](projects.json)** lists the hosted applications: repository, branch, route, section, which files to publish (`include`), the test command, and an optional build step for applications that must be compiled.
- **The portfolio bar** (wordmark, breadcrumb, source link, site menu) is added to each application's `index.html` at build time. Nothing else in the application changes.
- **The site is live at <https://christophermpalmer.com/>**, deployed by GitHub Actions to GitHub Pages.
- **The output is static files.** Every route is a real folder with an `index.html`, so direct links and refreshes work without a router.

```
site/            portfolio pages (templates with <!-- pf:... --> placeholders)
shared/          design system, published at /shared/
  brand-tokens.css   brand tokens (portfolio pages only)
  base.css           base styles (portfolio pages only, never loaded into apps)
  nav.json           the five main navigation items
  theme/v1/theme.css shared theme: tokens + components, for pages and applications
  chrome/            portfolio bar, site header, footer and menu (CSS + JS)
scripts/         build, dev server and tests (no dependencies)
projects.json    hosted applications
.github/         deploy workflow and the shared notify workflow
templates/       files copied unchanged into each application repository
docs/            deployment and adding-a-project guides
```

| Route | Contents |
|---|---|
| `/` | Home |
| `/softwareengineering/` | Software Engineering |
| `/softwareengineering/pathfindingvisualizer/` | Pathfinding Visualizer (from [its own repository](https://github.com/chrisp-bacon2024/pathfinding-visualizer)) |
| `/softwareengineering/geneticsnake/` | Genetic Snake (from [its own repository](https://github.com/chrisp-bacon2024/Genetic-Snake)) |
| `/softwareengineering/sortingvisualizer/` | Sorting Visualizer (from [its own repository](https://github.com/chrisp-bacon2024/Sorting-Visualizer)) |
| `/datascience/` | Data Science |
| `/datascience/phillycrimesports/` | Philly Crime & Sports report (from [its own repository](https://github.com/chrisp-bacon2024/Philly-Crime-and-Sports)) |
| `/compositions/` | Compositions |
| `/about/` | About |

## Requirements

- Node.js 18.12 or newer (20 or 22 LTS recommended). There are no npm dependencies, so `npm install` isn't needed.
- Git.
- A local clone of each hosted application, by default as a sibling folder:

  ```
  E:\Programming\Portfolio                  this repository
  E:\Programming\Pathfinding Visualizer     https://github.com/chrisp-bacon2024/pathfinding-visualizer
  E:\Programming\Genetic Snake              https://github.com/chrisp-bacon2024/Genetic-Snake
  E:\Programming\Sorting Visualizer         https://github.com/chrisp-bacon2024/Sorting-Visualizer
  E:\Programming\Philly Crime and Sports    https://github.com/chrisp-bacon2024/Philly-Crime-and-Sports
  ```

  If a clone lives somewhere else, create `projects.local.json` (git-ignored):

  ```json
  { "projects": { "pathfinding-visualizer": { "localPath": "D:/code/pathfinding-visualizer" } } }
  ```

## Local development

```bash
npm run dev
```

Open <http://localhost:8080/>. The startup message lists each application's address, for example <http://localhost:8080/softwareengineering/pathfindingvisualizer/>.

The dev server renders each request from `site/`, `shared/` and the application's local folder, so **edits in either repository appear when you refresh**. There's nothing to rebuild or copy. It behaves like GitHub Pages: folder URLs serve `index.html`, a folder URL without its trailing slash redirects, and unknown paths get the 404 page. It also publishes exactly the same files as the production build, so a file the build would leave out (tests, PDFs, README...) returns 404 locally too.

Applications with a build step (such as Genetic Snake, built with Vite) are compiled once when the dev server starts, and their dependencies are installed if `node_modules` is missing. To see changes to one while the server is running, run `npm run build:projects` in another terminal and refresh.

Use another port with `npm run dev -- --port 3000`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Live local server (above). |
| `npm run build` | Builds the site into `dist/` from the local application folders, compiling applications that have a build step first. |
| `npm run build:ci` | Builds from GitHub instead: clones each application's branch into `.sources/` first. |
| `npm run fetch` | Only clones each application into `.sources/`. CI then tests those clones and builds with `node scripts/build.mjs --fetched`. |
| `npm run build:projects` | Only compiles the applications that have a build step (`"build"` in projects.json). Add `-- --fetched` for the `.sources/` clones. |
| `npm run previews` | Re-records the short looping card previews in `site/previews/` from the real apps (needs Chrome and ffmpeg). Add `-- <project-id>` for one. Every clip is the same length (`CLIP_SECONDS`, about 22 s) with the app at a slow speed. See docs/adding-a-project.md. |
| `npm run preview` | Serves the built `dist/` folder exactly as it will be deployed. |
| `npm test` | Tests for the build tooling (injection, file selection, link checking, CSS isolation). |
| `npm run test:projects` | Runs each application's own test command (`"test"` in projects.json). Add `-- --fetched` to test the `.sources/` clones. |

## What the build checks

The build fails, and writes nothing, if:

- an application's entry page is missing, or the portfolio bar couldn't be added to it;
- any local link, stylesheet, script or JavaScript `import` in the output points at a file that isn't published;
- a link is root-absolute (`/about/`); all internal links are relative, so the site works from any folder, such as a GitHub Pages project URL, not only at a domain root;
- a forbidden file would be published from an application: tests, Markdown, PDFs, `package.json`, dotfiles or `node_modules`, even if the `include` list matches it;
- any required page (home, the five sections, 404) is missing.

`dist/build-info.json` records the commit of the portfolio and of each application in every build.

## Shared theme

[shared/theme/v1/theme.css](shared/theme/v1/theme.css) is the house style that portfolio pages and applications share. It contains:

- **every brand token** as a CSS variable (`--color-navy`, `--space-3`, `--radius-control`…). The build copies these from [shared/brand-tokens.css](shared/brand-tokens.css), so they're defined in one place;
- **shared components**, from BRAND_GUIDELINES §4: `.btn` (with `.selected` and `.btn-primary`), `.page-title`, `.section-title`, `.select`, `.range`, `.popover`, `.badge` (with `.badge-positive`) and `.kbd`.

Changing a token or component there changes the portfolio and every application that uses the theme, on their next deploy.

How applications load it:

- **Standalone:** an application links the live file, `https://christophermpalmer.com/shared/theme/v1/theme.css`, before its own stylesheet. Its standalone site picks up theme changes as soon as the portfolio deploys.
- **Inside the portfolio:** the build rewrites that link to the copy deployed with it, so the portfolio and its applications always change together.

Rules that keep the theme safe to share:

- **Classes only.** It has no element selectors, resets or globals, so nothing changes until markup uses a class; a test enforces this.
- **Low, flat specificity.** An application can override any component with one class.
- **Versioned.** Compatible changes go into `v1`. A change that would break existing markup goes into a new `v2/` folder, and applications move over one at a time.

Application-specific styles (layout, canvas drawing, special controls) stay in the application's own CSS, written with the theme's variables rather than raw colours. CSS can't reach canvas drawing, so an application that draws text or lines on a canvas reads the theme variables from JavaScript instead (Sorting Visualizer's `js/visualize/ink.js` does this).

## Isolation

- Portfolio pages load the theme, `base.css` (page-level element styles, never loaded into applications) and the chrome.
- The portfolio adds **only** `shared/chrome/chrome.css` and `chrome.js` to a hosted application. An application opts into the theme itself.
- The chrome is isolated from the application:
  - every selector in `chrome.css` starts with a `.pf-` class;
  - its variables are `--pf-` copies of the brand tokens, generated at build time;
  - there are no global resets;
  - a test enforces all of this.
- The chrome stops keyboard events that start inside it, so application shortcuts (such as the visualizer's `d`, `b`, `j`, `a`, `w`, `g`, `m`, `r`) don't fire while you use the portfolio menu.
- A full-height application reserves the bar's height with `var(--pf-bar-height, 0px)`. Outside the portfolio that variable is unset, so the application is unaffected.

## Deployment

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) deploys the site to GitHub Pages using GitHub Actions. It runs when `main` is pushed, when an application's repository reports a change (a `project-updated` `repository_dispatch` event, sent by the shared [notify workflow](.github/workflows/notify-portfolio.yml)), or when started by hand from the Actions tab. There is no scheduled run.

Each run:

1. runs the build tooling tests (`npm test`);
2. clones every application in projects.json (`npm run fetch`);
3. runs each application's own tests on those clones (`npm run test:projects -- --fetched`);
4. compiles the applications that have a build step (`npm run build:projects -- --fetched`), with a fresh dependency install;
5. builds the site from the same clones (`node scripts/build.mjs --fetched --skip-project-builds`) and lists the deployed commits in the run summary;
6. uploads `dist/` and deploys it.

If any step fails, nothing is deployed and the live site stays as it was. CI uses the Node.js LTS version in [.node-version](.node-version).

Deploying here never changes an application's repository or its own GitHub Pages site.

Each application repository contains an identical copy of [templates/project-workflow/portfolio-update.yml](templates/project-workflow/portfolio-update.yml), so pushing to the application updates both its own site and this one.

## Documentation

- [docs/deployment.md](docs/deployment.md): how deployment and automatic updates work, the token setup, rotation and troubleshooting.
- [docs/adding-a-project.md](docs/adding-a-project.md): step-by-step checklist for hosting another project.

## Domain and HTTPS

The site is served at **https://christophermpalmer.com/**. Every other address redirects there with a 301:

- `http://christophermpalmer.com/`
- `www.christophermpalmer.com` (HTTP or HTTPS)
- the GitHub Pages project URL `chrisp-bacon2024.github.io/Portfolio/`

The settings that make this work:

| Where | Setting |
|---|---|
| Registrar DNS | `christophermpalmer.com`: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| Registrar DNS | `www`: CNAME `chrisp-bacon2024.github.io` |
| Portfolio ▸ Settings ▸ Pages | Source: **GitHub Actions**. Custom domain: `christophermpalmer.com`. **Enforce HTTPS** on. |
| Account ▸ Settings ▸ Pages | `christophermpalmer.com` verified with a TXT record, so no other GitHub account can claim it. |

- **The domain is set in the Pages settings, not in a `CNAME` file.** Deployments made with GitHub Actions ignore `CNAME` files, so the build doesn't produce one.
- **The HTTPS certificate is managed by GitHub.** It's issued by Let's Encrypt, covers the bare domain and `www`, and renews automatically.
- **If the certificate ever gets stuck** (the Pages settings say it's still being issued after an hour, or `https://` doesn't load), clear the custom domain, **Save**, enter it again and **Save**. That restarts issuance. If it still fails, make sure the registrar has no AAAA records and no CAA records that exclude `letsencrypt.org`.

Each application's own GitHub Pages site (for example <https://chrisp-bacon2024.github.io/pathfinding-visualizer/>) is separate from this domain and stays on its github.io address.
