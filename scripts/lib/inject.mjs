import {
    BASE_SCRIPT, chromeAssets, escapeHtml, pageAssets,
    renderPortfolioBar, renderSiteFooter, renderSiteHeader
} from "./chrome.mjs";

function findOnce(html, pattern, description, file) {
    const matches = [...html.matchAll(new RegExp(pattern.source, `${pattern.flags.replace("g", "")}g`))];
    if (matches.length !== 1) {
        throw new Error(`${file}: expected exactly one ${description}, found ${matches.length}`);
    }
    return matches[0];
}

// Points links to the live theme (https://christophermpalmer.com/shared/
// theme/...) at this build's own copy, so a hosted application always uses
// the theme deployed with it. Standalone, the application keeps loading the
// live URL.
export function localizeTheme(html, { nav, root }) {
    const host = new URL(nav.siteUrl).host.replace(/^www\./, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Only whole URLs: at the start of a quoted attribute value or url(...).
    const live = new RegExp(`(?<=["'(])https?://(?:www\\.)?${host}/shared/theme/`, "g");
    return html.replace(live, `${root}shared/theme/`);
}

// Adds the portfolio bar to a hosted application's entry HTML. Only four
// things change: links to the live theme point at this build's copy, the
// <title> gains the site name, the chrome stylesheet and script are added at
// the end of <head>, and the bar is inserted as the first child of <body>.
// Nothing else inside the application is altered.
export function injectPortfolioBar(html, { nav, root, project, file = project.entry }) {
    if (html.includes("data-pf-bar")) {
        throw new Error(`${file}: already contains a portfolio bar`);
    }
    html = localizeTheme(html, { nav, root });

    const head = findOnce(html, /<\/head\s*>/i, "</head>", file);
    const body = findOnce(html, /<body\b[^>]*>/i, "<body> tag", file);

    const headInsert = `<!-- Portfolio chrome (injected at build time). -->\n${chromeAssets(root)}\n`;
    const bodyInsert = `\n${renderPortfolioBar({ nav, root, project })}\n`;

    // Insert from the end of the document backwards so indexes stay valid.
    const bodyEnd = body.index + body[0].length;
    let out = html.slice(0, bodyEnd) + bodyInsert + html.slice(bodyEnd);
    out = out.slice(0, head.index) + headInsert + out.slice(head.index);

    return out.replace(/<title>([\s\S]*?)<\/title>/i, (match, title) => {
        const text = title.trim();
        return text.includes(nav.siteName) ? match : `<title>${text} — ${escapeHtml(nav.siteName)}</title>`;
    });
}

const HEADER_MARKER = /<!--\s*pf:site-header(?:\s+section="([^"]*)")?\s*-->/g;

// Expands the placeholders in a portfolio page template (site/**.html):
//   <!-- pf:head -->                         shared stylesheets and script
//   <!-- pf:site-header section="<id>" -->   site header; <id> is highlighted
//   <!-- pf:site-footer -->                  site footer
//   {{root}}                                 relative path to the site root
export function renderSitePage(html, { nav, root, file, is404 = false }) {
    let out = html
        .replace(/<!--\s*pf:head\s*-->/g, () => (is404 ? `${BASE_SCRIPT}\n` : "") + pageAssets(root))
        .replace(HEADER_MARKER, (match, section) => renderSiteHeader({ nav, root, current: section || null }))
        .replace(/<!--\s*pf:site-footer\s*-->/g, () => renderSiteFooter({ nav, root }))
        .replace(/\{\{root\}\}/g, root);

    const leftover = out.match(/<!--\s*pf:[\w-]+|\{\{\w+\}\}/);
    if (leftover) throw new Error(`${file}: unknown placeholder "${leftover[0]}"`);
    return out;
}
