import assert from "node:assert/strict";
import { test } from "node:test";
import { validateConfig } from "../lib/config.mjs";
import { createMatcher, globToRegExp } from "../lib/glob.mjs";
import { rootPrefix } from "../lib/paths.mjs";
import { parseRootTokens, prefixTokens, renderScopedTokens } from "../lib/tokens.mjs";
import { isProjectDenied } from "../lib/site.mjs";

test("glob: * stays within one directory, ** crosses directories", () => {
    assert.ok(globToRegExp("*.js").test("main.js"));
    assert.ok(!globToRegExp("*.js").test("algorithms/bfs.js"));
    assert.ok(globToRegExp("algorithms/**/*.js").test("algorithms/bfs.js"));
    assert.ok(globToRegExp("terrain/**/*.js").test("terrain/generators/wall.js"));
    assert.ok(globToRegExp("**/*.pdf").test("notes.pdf"));
    assert.ok(globToRegExp("**/*.pdf").test("a/b/notes.pdf"));
    assert.ok(!globToRegExp("style.css").test("stylexcss"), "dots are literal");
    assert.ok(createMatcher(["a.js", "b/**"])("b/c/d.txt"));
});

test("deny list blocks tests, docs, tooling, dotfiles and PDFs anywhere", () => {
    for (const file of [
        "tests/a.test.js", "algorithms/tests/x.js", "a.test.js", "x.spec.ts", "notes.pdf", "docs/x.pdf",
        "README.md", "package.json", "package-lock.json", ".env", ".github/workflows/ci.yml",
        "node_modules/x/index.js", "__tests__/a.js"
    ]) {
        assert.ok(isProjectDenied(file), `${file} should be denied`);
    }
    for (const file of ["index.html", "main.js", "terrain/generators/wall.js", "assets/img.png"]) {
        assert.ok(!isProjectDenied(file), `${file} should be allowed`);
    }
});

test("rootPrefix walks back to the site root", () => {
    assert.equal(rootPrefix("index.html"), "./");
    assert.equal(rootPrefix("404.html"), "./");
    assert.equal(rootPrefix("about/index.html"), "../");
    assert.equal(rootPrefix("softwareengineering/pathfindingvisualizer/index.html"), "../../");
});

test("tokens: parsed from :root, prefixed, var() references renamed", () => {
    const css = ":root {\n  /* c */ --color-navy: #284a63;\n  --color-heading: var(--color-navy);\n  --font-serif: \"Times New Roman\", serif;\n}";
    assert.deepEqual(parseRootTokens(css), [
        ["--color-navy", "#284a63"],
        ["--color-heading", "var(--color-navy)"],
        ["--font-serif", "\"Times New Roman\", serif"]
    ]);
    assert.deepEqual(prefixTokens(parseRootTokens(css))[1], ["--pf-color-heading", "var(--pf-color-navy)"]);
    const scoped = renderScopedTokens(css);
    assert.match(scoped, /^\.pf-scope \{/);
    assert.doesNotMatch(scoped, /var\(--(?!pf-)/);
});

test("config validation rejects bad routes, sections and duplicates", () => {
    const nav = { sections: [{ id: "home" }, { id: "softwareengineering" }] };
    const good = {
        id: "app", title: "App", section: "softwareengineering", route: "softwareengineering/app/",
        repo: "r", branch: "main", entry: "index.html", include: ["**/*"]
    };
    assert.doesNotThrow(() => validateConfig({ nav, projects: [good] }));
    assert.throws(() => validateConfig({ nav, projects: [{ ...good, route: "softwareengineering/app" }] }), /route/);
    assert.throws(() => validateConfig({ nav, projects: [{ ...good, route: "datascience/app/" }] }), /route must start/);
    assert.throws(() => validateConfig({ nav, projects: [{ ...good, section: "home" }] }), /section/);
    assert.throws(() => validateConfig({ nav, projects: [good, { ...good }] }), /duplicate/);
    assert.throws(() => validateConfig({ nav, projects: [{ ...good, include: [] }] }), /include/);
});
