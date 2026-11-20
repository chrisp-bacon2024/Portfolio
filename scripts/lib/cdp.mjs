// A minimal Chrome DevTools Protocol client over --remote-debugging-pipe.
// No dependencies; used to record the project previews.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_CANDIDATES = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium"
];

export function findChrome() {
    const found = CHROME_CANDIDATES.find(candidate => candidate && existsSync(candidate));
    if (!found) throw new Error("Chrome not found. Set CHROME_PATH to the Chrome executable.");
    return found;
}

export async function launchChrome() {
    const profile = mkdtempSync(path.join(os.tmpdir(), "pf-chrome-"));
    const chrome = spawn(findChrome(), [
        "--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars", "--mute-audio",
        "--remote-debugging-pipe", `--user-data-dir=${profile}`, "about:blank"
    ], { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });

    let id = 0;
    let buffer = "";
    let sessionId;
    const pending = new Map();
    const listeners = new Set();

    chrome.stdio[4].on("data", chunk => {
        buffer += chunk.toString();
        let end;
        while ((end = buffer.indexOf("\0")) >= 0) {
            const message = JSON.parse(buffer.slice(0, end));
            buffer = buffer.slice(end + 1);
            if (message.id && pending.has(message.id)) {
                pending.get(message.id)(message);
                pending.delete(message.id);
            } else {
                listeners.forEach(listener => listener(message));
            }
        }
    });

    const send = (method, params = {}, inSession = true) => new Promise((resolve, reject) => {
        const message = { id: ++id, method, params };
        if (inSession && sessionId) message.sessionId = sessionId;
        pending.set(message.id, reply => (reply.error ? reject(new Error(`${method}: ${reply.error.message}`)) : resolve(reply.result)));
        chrome.stdio[3].write(`${JSON.stringify(message)}\0`);
    });

    const { targetId } = await send("Target.createTarget", { url: "about:blank" }, false);
    ({ sessionId } = await send("Target.attachToTarget", { targetId, flatten: true }, false));
    await send("Page.enable");
    await send("Runtime.enable");

    const errors = [];
    listeners.add(message => {
        if (message.method === "Runtime.exceptionThrown") {
            errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
        }
    });

    const page = {
        send,
        errors,
        on: listener => { listeners.add(listener); return () => listeners.delete(listener); },
        wait: ms => new Promise(resolve => setTimeout(resolve, ms)),
        async eval(expression) {
            const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
            if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || "evaluation failed");
            return result.result.value;
        },
        async goto(url) {
            const loaded = new Promise(resolve => {
                const off = page.on(message => { if (message.method === "Page.loadEventFired") { off(); resolve(); } });
            });
            await send("Page.navigate", { url });
            await loaded;
        },
        async waitFor(expression, timeout = 15000) {
            const start = Date.now();
            while (Date.now() - start < timeout) {
                if (await page.eval(expression)) return;
                await page.wait(100);
            }
            throw new Error(`Timed out waiting for: ${expression}`);
        },
        // A real mouse click at the element's centre (apps may listen for
        // pointer events rather than "click"), then the pointer moves to the
        // corner so no hover state or tooltip is left showing.
        async click(selector) {
            const [x, y] = await page.eval(`(() => {
                const el = document.querySelector(${JSON.stringify(selector)});
                el.scrollIntoView({ block: "nearest", inline: "nearest" });
                const r = el.getBoundingClientRect();
                return [r.left + r.width / 2, r.top + r.height / 2];
            })()`);
            for (const type of ["mouseMoved", "mousePressed", "mouseReleased"]) {
                await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
            }
            await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
        },
        select: (selector, value) => page.eval(`(() => {
            const el = document.querySelector(${JSON.stringify(selector)});
            el.value = ${JSON.stringify(String(value))};
            el.dispatchEvent(new Event("change", { bubbles: true }));
        })()`),
        addStyle: css => page.eval(`(() => {
            const style = document.createElement("style");
            style.textContent = ${JSON.stringify(css)};
            document.head.appendChild(style);
        })()`)
    };

    const close = () => {
        chrome.kill();
        // Chrome may still hold files for a moment.
        setTimeout(() => rmSync(profile, { recursive: true, force: true }), 1000).unref();
    };
    return { page, close };
}
