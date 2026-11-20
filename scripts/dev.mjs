// Local server that behaves like GitHub Pages: directory URLs serve
// index.html, a directory URL without its trailing slash redirects to it,
// and unknown paths get 404.html with status 404.
//
//   node scripts/dev.mjs           live: renders every request from site/,
//                                  shared/ and each project's local folder,
//                                  so edits in any repo show on refresh
//   node scripts/dev.mjs --dist    preview the built dist/ folder
//   --port N (or PORT=N)           default 8080
//
// Listens on 127.0.0.1 only. URL paths are looked up in the list of
// published files and never joined onto the filesystem directly.

import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { loadConfig, REPO_ROOT } from "./lib/config.mjs";
import { buildProjects } from "./lib/project-build.mjs";
import { collectOutputs, renderOutput, walk } from "./lib/site.mjs";

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".webmanifest": "application/manifest+json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".ico": "image/x-icon",
    ".pdf": "application/pdf",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".opus": "audio/ogg",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".woff2": "font/woff2"
};

function parseArgs(argv) {
    const args = { dist: false, port: Number(process.env.PORT) || 8080 };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--dist") args.dist = true;
        else if (argv[i] === "--port") args.port = Number(argv[++i]);
        else throw new Error(`Unknown argument: ${argv[i]}`);
    }
    return args;
}

// A "site" answers: which paths exist, and what are their bytes.
function liveSite() {
    const config = loadConfig();
    const outputs = collectOutputs(config);
    return {
        has: p => outputs.has(p),
        read: p => renderOutput(p, outputs.get(p), config)
    };
}

function distSite(distDir) {
    if (!existsSync(distDir)) throw new Error("dist/ not found. Run `npm run build` first.");
    const files = new Set(walk(distDir));
    return {
        has: p => files.has(p),
        read: p => readFileSync(path.join(distDir, ...p.split("/")))
    };
}

function send(res, status, body, type, extra = {}) {
    res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", ...extra });
    res.end(body);
}

function errorPage(message) {
    const safe = message.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
    return `<!doctype html><meta charset="utf-8"><title>Build error</title>`
        + `<pre style="font: 14px/1.5 Consolas, monospace; padding: 20px; white-space: pre-wrap">${safe}</pre>`;
}

function handle(req, res, getSite) {
    let site;
    try {
        site = getSite();
    } catch (error) {
        console.error(error.message);
        return send(res, 500, errorPage(error.message), TYPES[".html"]);
    }

    const url = new URL(req.url, "http://localhost");
    let pathname;
    try {
        pathname = decodeURIComponent(url.pathname);
    } catch {
        return send(res, 400, "Bad request", TYPES[".txt"]);
    }
    if (pathname.includes("\0") || pathname.split("/").includes("..")) {
        return send(res, 400, "Bad request", TYPES[".txt"]);
    }

    let key = pathname.replace(/^\/+/, "");
    if (key === "" || key.endsWith("/")) key += "index.html";

    try {
        if (site.has(key)) {
            const type = TYPES[path.extname(key).toLowerCase()] || "application/octet-stream";
            return send(res, 200, req.method === "HEAD" ? undefined : site.read(key), type);
        }
        if (site.has(`${key}/index.html`)) {
            return send(res, 301, undefined, TYPES[".txt"], { Location: `${url.pathname}/${url.search}` });
        }
        const notFound = site.has("404.html") ? site.read("404.html") : "Not found";
        return send(res, 404, notFound, TYPES[".html"]);
    } catch (error) {
        console.error(error.message);
        return send(res, 500, errorPage(error.message), TYPES[".html"]);
    }
}

const args = parseArgs(process.argv.slice(2));
const getSite = args.dist ? (() => {
    const site = distSite(path.join(REPO_ROOT, "dist"));
    return () => site;
})() : liveSite;

if (!args.dist) {
    // Fail fast on configuration problems instead of on the first request.
    // Projects with a build step are built once here; pages and other
    // projects are read fresh on every request.
    try {
        buildProjects(loadConfig());
        getSite();
    } catch (error) {
        console.error(`\n${error.message}\n`);
        process.exit(1);
    }
}

const server = http.createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
        return send(res, 405, "Method not allowed", TYPES[".txt"], { Allow: "GET, HEAD" });
    }
    handle(req, res, getSite);
});

server.on("error", error => {
    console.error(error.code === "EADDRINUSE"
        ? `Port ${args.port} is in use. Try: npm run ${args.dist ? "preview" : "dev"} -- --port ${args.port + 1}`
        : error.message);
    process.exit(1);
});

server.listen(args.port, "127.0.0.1", () => {
    const base = `http://localhost:${args.port}/`;
    console.log(`${args.dist ? "Previewing dist/" : "Live development server"} at ${base}`);
    if (!args.dist) {
        for (const project of loadConfig().projects) {
            const note = project.build ? "  (built at startup; run `npm run build:projects` to rebuild)" : "";
            console.log(`  ${project.title}: ${base}${project.route}${note}`);
        }
        console.log("Edits to site/, shared/ and project folders appear on refresh. Ctrl+C to stop.");
    }
});
