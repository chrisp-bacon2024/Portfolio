// HTML templates for the portfolio chrome. All navigation comes from
// shared/nav.json; every internal URL is built from `root` (see paths.mjs).

export function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

const SOURCE_SUFFIX = " on GitHub (opens external site)";

export function chromeAssets(root) {
    return [
        `<link rel="stylesheet" href="${root}shared/chrome/chrome.css">`,
        `<script src="${root}shared/chrome/chrome.js" defer></script>`
    ].join("\n");
}

export const THEME_PATH = "shared/theme/v1/theme.css";

// <head> assets for portfolio pages: the theme (tokens and shared
// components) and page-level base styles first, then the chrome.
export function pageAssets(root) {
    return [
        `<link rel="stylesheet" href="${root}${THEME_PATH}">`,
        `<link rel="stylesheet" href="${root}shared/base.css">`,
        chromeAssets(root)
    ].join("\n");
}

// The main navigation list. `current` is the active section id;
// `currentValue` is "page" on the section's own page and "true" inside a
// project that belongs to it.
function navList({ nav, root, current, currentValue }) {
    return nav.sections.map(section => {
        const attr = section.id === current ? ` aria-current="${currentValue}"` : "";
        return `<li><a class="pf-nav-link" href="${root}${section.path}"${attr}>${escapeHtml(section.label)}</a></li>`;
    }).join("\n");
}

function sectionById(nav, id) {
    return nav.sections.find(section => section.id === id);
}

export function renderPortfolioBar({ nav, root, project }) {
    const section = sectionById(nav, project.section);
    const source = project.sourceUrl
        ? `<a class="pf-bar-link" href="${escapeHtml(project.sourceUrl)}">Source<span aria-hidden="true"> ↗</span><span class="pf-sr-only">${SOURCE_SUFFIX}</span></a>`
        : "";

    return `<!-- Portfolio bar: injected at build time from the Portfolio repository. -->
<div class="pf-scope pf-bar-root" data-pf-bar data-pf-isolate>
<a class="pf-skip" href="#pf-content" data-pf-skip>Skip to content</a>
<div class="pf-bar">
<div class="pf-bar-start">
<a class="pf-wordmark" href="${root}">${escapeHtml(nav.siteName)}</a>
<nav class="pf-crumbs" aria-label="Breadcrumb">
<ol class="pf-crumbs-list">
<li><a class="pf-crumb-link" href="${root}${section.path}">${escapeHtml(section.label)}</a><span class="pf-crumb-sep" aria-hidden="true">/</span></li>
<li class="pf-crumb-current" aria-current="page">${escapeHtml(project.title)}</li>
</ol>
</nav>
</div>
<div class="pf-bar-end">
${source}
<nav class="pf-menu" aria-label="Main" data-pf-menu>
<button type="button" class="pf-menu-button" aria-expanded="false" aria-controls="pf-bar-menu" data-pf-menu-button>Menu<span class="pf-menu-caret" aria-hidden="true">▾</span></button>
<div class="pf-menu-panel" id="pf-bar-menu" data-pf-menu-panel hidden>
<ul class="pf-menu-list">
${navList({ nav, root, current: project.section, currentValue: "true" })}
</ul>
</div>
</nav>
</div>
</div>
</div>
<div class="pf-content-anchor" id="pf-content" tabindex="-1"></div>
<!-- End portfolio bar. -->`;
}

export function renderSiteHeader({ nav, root, current }) {
    const section = current ? sectionById(nav, current) : null;
    if (current && !section) throw new Error(`Unknown navigation section "${current}"`);
    // Wide-ish screens show the current section on the trigger (7.4); phones
    // show "Menu", since a long section name doesn't fit beside the wordmark.
    const buttonLabel = `<span class="pf-menu-label">${escapeHtml(section ? section.label : "Menu")}</span>`
        + `<span class="pf-menu-label-short">Menu</span>`;

    return `<header class="pf-scope pf-site-header" data-pf-isolate>
<a class="pf-skip" href="#main" data-pf-skip>Skip to content</a>
<div class="pf-site-header-inner">
<a class="pf-wordmark" href="${root}">${escapeHtml(nav.siteName)}</a>
<nav class="pf-menu pf-site-nav" aria-label="Main" data-pf-menu>
<button type="button" class="pf-menu-button" aria-expanded="false" aria-controls="pf-site-menu" data-pf-menu-button>${buttonLabel}<span class="pf-menu-caret" aria-hidden="true">▾</span></button>
<div class="pf-menu-panel" id="pf-site-menu" data-pf-menu-panel hidden>
<ul class="pf-menu-list">
${navList({ nav, root, current, currentValue: "page" })}
</ul>
</div>
</nav>
</div>
</header>`;
}

export function renderSiteFooter({ nav, root, year = new Date().getFullYear() }) {
    const links = nav.sections
        .map(section => `<li><a class="pf-footer-link" href="${root}${section.path}">${escapeHtml(section.label)}</a></li>`)
        .join("\n");
    const github = nav.githubUrl
        ? `<li><a class="pf-footer-link" href="${escapeHtml(nav.githubUrl)}">GitHub<span aria-hidden="true"> ↗</span><span class="pf-sr-only"> (opens external site)</span></a></li>`
        : "";

    return `<footer class="pf-scope pf-site-footer">
<a class="pf-wordmark" href="${root}">${escapeHtml(nav.siteName)}</a>
<ul class="pf-footer-links">
${links}
${github}
</ul>
<p class="pf-footer-copy">© ${year} ${escapeHtml(nav.siteName)}</p>
</footer>`;
}

// 404.html is served at arbitrary depths, so relative links can't be
// precomputed. This sets <base> to the site root: "/" on the custom domain
// and locally, "/<repo>/" on a *.github.io project URL.
export const BASE_SCRIPT = `<script>
(function () {
  var seg = location.pathname.split("/")[1];
  var base = /\\.github\\.io$/.test(location.hostname) && seg ? "/" + seg + "/" : "/";
  var el = document.createElement("base");
  el.href = base;
  document.head.appendChild(el);
})();
</script>`;
