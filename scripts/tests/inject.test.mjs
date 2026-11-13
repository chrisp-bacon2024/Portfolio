import assert from "node:assert/strict";
import { test } from "node:test";
import { loadConfig } from "../lib/config.mjs";
import { injectPortfolioBar, renderSitePage } from "../lib/inject.mjs";
import { APP_HTML } from "./helpers.mjs";

const { nav } = loadConfig();
const project = {
    id: "demo", title: "Demo App", section: "softwareengineering",
    entry: "index.html", sourceUrl: "https://github.com/example/demo"
};

test("injection adds chrome assets, the bar and the site name, and nothing else", () => {
    const out = injectPortfolioBar(APP_HTML, { nav, root: "../../", project });

    // Bar is the first thing in <body>; assets are the last thing in <head>.
    assert.match(out, /<body class="x">\s*<!-- Portfolio bar/);
    assert.match(out, /href="\.\.\/\.\.\/shared\/chrome\/chrome\.css">\s*<script src="\.\.\/\.\.\/shared\/chrome\/chrome\.js" defer><\/script>\s*<\/head>/);
    assert.match(out, /<title>Demo App — Christopher M\. Palmer<\/title>/);

    // The app's own markup is untouched.
    const strip = html => html
        .replace(/<!-- Portfolio bar[\s\S]*?<!-- End portfolio bar\. -->\n?/, "")
        .replace(/<!-- Portfolio chrome[\s\S]*?<\/script>\n/, "")
        .replace(/<title>.*<\/title>/, "")
        .replace(/\n+/g, "\n");
    assert.equal(strip(out), strip(APP_HTML));
});

test("bar: wordmark, breadcrumb, source link, five-item menu with parent section current", () => {
    const out = injectPortfolioBar(APP_HTML, { nav, root: "../../", project });
    assert.match(out, /class="pf-wordmark" href="\.\.\/\.\.\/">Christopher M\. Palmer</);
    assert.match(out, /href="\.\.\/\.\.\/softwareengineering\/">Software Engineering<\/a>/);
    assert.match(out, /aria-current="page">Demo App</);
    assert.match(out, /href="https:\/\/github\.com\/example\/demo">Source/);
    assert.match(out, /data-pf-isolate/);
    assert.match(out, /aria-expanded="false" aria-controls="pf-bar-menu"/);

    const menu = out.match(/<ul class="pf-menu-list">([\s\S]*?)<\/ul>/)[1];
    const labels = [...menu.matchAll(/>([^<]+)<\/a>/g)].map(m => m[1]);
    assert.deepEqual(labels, ["Home", "Software Engineering", "Data Science", "Compositions", "About"]);
    assert.equal((menu.match(/aria-current/g) || []).length, 1);
    assert.match(menu, /softwareengineering\/" aria-current="true">/);
});

test("source link is optional", () => {
    const out = injectPortfolioBar(APP_HTML, { nav, root: "./", project: { ...project, sourceUrl: undefined } });
    assert.doesNotMatch(out, /Source/);
});

test("injection refuses malformed or already-injected HTML", () => {
    assert.throws(() => injectPortfolioBar("<html><body></body></html>", { nav, root: "./", project }), /<\/head>/);
    assert.throws(() => injectPortfolioBar("<html><head></head></html>", { nav, root: "./", project }), /<body>/);
    const once = injectPortfolioBar(APP_HTML, { nav, root: "./", project });
    assert.throws(() => injectPortfolioBar(once, { nav, root: "./", project }), /already contains/);
});

test("site pages: placeholders expand, current section marked, unknown placeholders fail", () => {
    const template = '<head><!-- pf:head --></head><body><!-- pf:site-header section="datascience" --><a href="{{root}}about/">x</a><!-- pf:site-footer --></body>';
    const out = renderSitePage(template, { nav, root: "../", file: "t.html" });
    assert.match(out, /href="\.\.\/shared\/brand-tokens\.css"/);
    assert.match(out, /href="\.\.\/datascience\/" aria-current="page">Data Science/);
    assert.match(out, /href="\.\.\/about\/">x/);
    assert.match(out, /pf-site-footer/);
    assert.doesNotMatch(out, /<base|location\.hostname/);

    assert.throws(() => renderSitePage("<!-- pf:sidebar -->", { nav, root: "./", file: "t.html" }), /unknown placeholder/);
    assert.throws(() => renderSitePage("{{title}}", { nav, root: "./", file: "t.html" }), /unknown placeholder/);
    assert.throws(() => renderSitePage('<!-- pf:site-header section="nope" -->', { nav, root: "./", file: "t.html" }), /Unknown navigation section/);
});

test("site header menu button always has both a full and a short (phone) label", () => {
    for (const marker of ['<!-- pf:site-header section="about" -->', "<!-- pf:site-header -->"]) {
        const out = renderSitePage(marker, { nav, root: "./", file: "t.html" });
        const button = out.match(/<button[^>]*data-pf-menu-button>([\s\S]*?)<\/button>/)[1];
        assert.match(button, /class="pf-menu-label">[^<]+</, marker);
        assert.match(button, /class="pf-menu-label-short">Menu</, marker);
    }
});

test("404 page gets the <base> script before any stylesheet", () => {
    const out = renderSitePage("<head><!-- pf:head --></head>", { nav, root: "./", file: "404.html", is404: true });
    assert.ok(out.indexOf("createElement(\"base\")") < out.indexOf("<link"));
});
