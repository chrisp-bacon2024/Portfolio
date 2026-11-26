// Records the short looping previews shown on project cards.
//
//   npm run previews                        every project with a recipe
//   npm run previews -- genetic-snake       just one (or several) by id
//
// For each recipe in scripts/preview-recipes.mjs it serves the site exactly
// as `npm run dev` would (from the local project folders), drives the real
// app in headless Chrome, films the chosen element, and writes to
// site/previews/<id>/:
//   preview.webm, preview.mp4   silent 16:10 loop, 800×500, filmed with
//                               Chrome's screencast at the page's CSS size
//   poster.webp                 still frame, 1200×750 (BRAND_GUIDELINES 7.9),
//                               a separate full-resolution screenshot
//
// Needs Google Chrome (or CHROME_PATH) and ffmpeg (or FFMPEG_PATH).

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { launchChrome } from "./lib/cdp.mjs";
import { loadConfig, REPO_ROOT } from "./lib/config.mjs";
import { buildProjects } from "./lib/project-build.mjs";
import { collectOutputs, renderOutput } from "./lib/site.mjs";
import recipes from "./preview-recipes.mjs";

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const VIDEO = { width: 800, height: 500, fps: 30 };
const POSTER = { width: 1200, height: 750 };
const PIXEL_RATIO = 2; // for the poster screenshot

function serveSite(config) {
    const outputs = collectOutputs(config);
    const server = http.createServer((req, res) => {
        let key = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "");
        if (key === "" || key.endsWith("/")) key += "index.html";
        if (!outputs.has(key) && outputs.has(`${key}/index.html`)) key += "/index.html";
        if (!outputs.has(key)) { res.writeHead(404); return res.end(); }
        const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webp": "image/webp" };
        res.writeHead(200, { "Content-Type": types[path.extname(key)] || "application/octet-stream" });
        res.end(renderOutput(key, outputs.get(key), config));
    });
    return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
}

// Width and height of a baseline JPEG, from its SOF marker.
function jpegSize(buffer) {
    let i = 2;
    while (i + 9 < buffer.length && buffer[i] === 0xff) {
        const marker = buffer[i + 1];
        if (marker >= 0xc0 && marker <= 0xc3) return { width: buffer.readUInt16BE(i + 7), height: buffer.readUInt16BE(i + 5) };
        i += 2 + buffer.readUInt16BE(i + 2);
    }
    throw new Error("could not read the screencast frame size");
}

// A 16:10 crop centred on the element (or anchored to its top), in CSS px.
function cropFor(rect, viewport, anchor) {
    const ratio = 16 / 10;
    let { x, y, width, height } = rect;
    if (width / height > ratio) {
        const w = height * ratio;
        x += (width - w) / 2;
        width = w;
    } else {
        const h = width / ratio;
        if (anchor !== "top") y += (height - h) / 2;
        height = h;
    }
    x = Math.max(0, x);
    y = Math.max(0, y);
    width = Math.min(width, viewport[0] - x);
    height = Math.min(height, viewport[1] - y);
    return { x, y, width, height };
}

// Opens the app at the recipe's viewport and runs its prepare step.
async function openRecipe(recipe, baseUrl, project) {
    const opened = await launchChrome();
    const { page } = opened;
    const [vw, vh] = recipe.viewport;
    await page.send("Emulation.setDeviceMetricsOverride", { width: vw, height: vh, deviceScaleFactor: PIXEL_RATIO, mobile: false });
    await page.goto(`${baseUrl}/${project.route}`);
    await recipe.prepare(page);
    const rect = await page.eval(`(() => {
        const r = document.querySelector(${JSON.stringify(recipe.frame)}).getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, scrollX, scrollY };
    })()`);
    const crop = cropFor(rect, recipe.viewport, recipe.anchor);
    // Screenshot clips are measured from the top of the document, not the viewport.
    const posterClip = { ...crop, x: crop.x + rect.scrollX, y: crop.y + rect.scrollY };
    return { ...opened, crop, posterClip };
}

async function screenshot(page, clip) {
    const shot = await page.send("Page.captureScreenshot", { format: "png", clip: { ...clip, scale: PIXEL_RATIO }, captureBeyondViewport: false });
    return shot.data;
}

// Waits until the motion is over: recipe.done plus recipe.hold (held
// longer if needed to reach recipe.length), or recipe.seconds.
async function waitForMotion(page, recipe, started) {
    if (recipe.done) {
        const limit = (recipe.maxSeconds ?? 15) * 1000;
        while (Date.now() - started < limit && !(await page.eval(recipe.done))) await page.wait(100);
        if (Date.now() - started >= limit) throw new Error(`the motion didn't finish within ${recipe.maxSeconds ?? 15} s (raise maxSeconds or speed it up)`);
        const hold = (recipe.hold ?? 1) * 1000;
        const toLength = recipe.length ? recipe.length * 1000 - (Date.now() - started) : 0;
        await page.wait(Math.max(hold, toLength));
    } else {
        await page.wait((recipe.seconds ?? 8) * 1000);
    }
}

// Films the motion with Chrome's screencast: one frame per paint, each with
// its own timestamp, so the video keeps real-time pacing. Nothing else may
// capture the page meanwhile: a screenshot would change what the screencast
// sends.
async function film(recipe, baseUrl, project) {
    const { page, close, crop, posterClip } = await openRecipe(recipe, baseUrl, project);
    try {
        const frames = [];
        page.on(message => {
            if (message.method !== "Page.screencastFrame") return;
            frames.push({ data: message.params.data, time: message.params.metadata.timestamp });
            page.send("Page.screencastFrameAck", { sessionId: message.params.sessionId }).catch(() => {});
        });
        await page.send("Page.startScreencast", { format: "jpeg", quality: 92, everyNthFrame: 1 });
        await page.wait(250);
        await recipe.start(page);
        await waitForMotion(page, recipe, Date.now());
        const stoppedAt = Date.now() / 1000;
        await page.send("Page.stopScreencast");
        // A poster of the final state can come from this run.
        const poster = recipe.poster === "end" || recipe.poster === undefined ? await screenshot(page, posterClip) : null;
        if (page.errors.length) throw new Error(`page errors while recording: ${page.errors.join("; ")}`);
        if (frames.length < 10) throw new Error(`only ${frames.length} frames were captured`);
        return { frames, stoppedAt, crop, poster };
    } finally {
        close();
    }
}

// A poster from partway through the motion: a separate run of the recipe,
// with no screencast, captured recipe.poster seconds after the start.
async function posterMidway(recipe, baseUrl, project) {
    const { page, close, posterClip } = await openRecipe(recipe, baseUrl, project);
    try {
        await recipe.start(page);
        await page.wait(recipe.poster * 1000);
        return await screenshot(page, posterClip);
    } finally {
        close();
    }
}

async function record(id, recipe, baseUrl, project) {
    const result = await film(recipe, baseUrl, project);
    if (!result.poster) result.poster = await posterMidway(recipe, baseUrl, project);
    return result;
}

function encode(id, recipe, { frames, stoppedAt, crop, poster }) {
    const work = mkdtempSync(path.join(os.tmpdir(), `pf-preview-${id}-`));
    try {
        // Frames plus their display durations, for ffmpeg's concat demuxer.
        const lines = [];
        frames.forEach((frame, i) => {
            const file = `f${String(i).padStart(5, "0")}.jpg`;
            writeFileSync(path.join(work, file), Buffer.from(frame.data, "base64"));
            const next = i + 1 < frames.length ? frames[i + 1].time : stoppedAt;
            // True durations (frames can arrive faster than the output rate):
            // padding short ones would stretch the clip into slow motion.
            lines.push(`file '${file}'`, `duration ${Math.max(0.001, next - frame.time).toFixed(4)}`);
        });
        lines.push(`file 'f${String(frames.length - 1).padStart(5, "0")}.jpg'`);
        writeFileSync(path.join(work, "frames.txt"), `${lines.join("\n")}\n`);
        const seconds = stoppedAt - frames[0].time;

        const out = path.join(REPO_ROOT, "site", "previews", id);
        mkdirSync(out, { recursive: true });
        // Screencast frames are at the page's CSS size (or smaller), so
        // scale the CSS-pixel crop to the frames' actual size.
        const frameSize = jpegSize(Buffer.from(frames[0].data, "base64"));
        const k = frameSize.width / recipe.viewport[0];
        const even = value => Math.max(2, Math.floor(value * k / 2) * 2);
        const cropFilter = `crop=${even(crop.width)}:${even(crop.height)}:${even(crop.x)}:${even(crop.y)}`;
        const video = [
            cropFilter,
            `scale=${VIDEO.width}:${VIDEO.height}:flags=lanczos`,
            `fps=${VIDEO.fps}`,
            "format=yuv420p"
        ].join(",");
        // -t: the concat list repeats the last frame (ffmpeg needs that to
        // honour its duration), which would otherwise add that hold twice.
        const input = ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", "frames.txt", "-t", seconds.toFixed(3)];
        const run = args => execFileSync(FFMPEG, args, { cwd: work, stdio: ["ignore", "inherit", "inherit"] });

        run([...input, "-vf", video, "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1", "-deadline", "good", path.join(out, "preview.webm")]);
        run([...input, "-vf", video, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-profile:v", "high", "-movflags", "+faststart", path.join(out, "preview.mp4")]);

        writeFileSync(path.join(work, "poster.png"), Buffer.from(poster, "base64"));
        run(["-y", "-loglevel", "error", "-i", "poster.png", "-vf", `scale=${POSTER.width}:${POSTER.height}:flags=lanczos`, "-quality", "82", path.join(out, "poster.webp")]);

        const size = name => `${Math.round(statSync(path.join(out, name)).size / 1024)} KB`;
        console.log(`  ${seconds.toFixed(1)} s, ${frames.length} frames -> preview.webm ${size("preview.webm")}, preview.mp4 ${size("preview.mp4")}, poster.webp ${size("poster.webp")}`);
    } finally {
        rmSync(work, { recursive: true, force: true });
    }
}

async function main() {
    try {
        execFileSync(FFMPEG, ["-version"], { stdio: "ignore" });
    } catch {
        throw new Error("ffmpeg not found. Install it, or set FFMPEG_PATH.");
    }
    const config = loadConfig();
    const wanted = process.argv.slice(2);
    const unknown = wanted.filter(id => !recipes[id]);
    if (unknown.length) throw new Error(`No preview recipe for: ${unknown.join(", ")}`);
    const ids = wanted.length ? wanted : Object.keys(recipes);

    buildProjects(config);
    const server = await serveSite(config);
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    try {
        for (const id of ids) {
            const project = config.projects.find(p => p.id === id);
            if (!project) throw new Error(`"${id}" has a recipe but isn't in projects.json`);
            console.log(`Recording ${project.title}...`);
            encode(id, recipes[id], await record(id, recipes[id], baseUrl, project));
        }
    } finally {
        server.close();
    }
    console.log("\nDone. Previews are in site/previews/.");
}

main().catch(error => {
    console.error(`\nPreview recording failed: ${error.message}\n`);
    process.exit(1);
});
