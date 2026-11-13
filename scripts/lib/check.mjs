import path from "node:path";
import { isProjectDenied } from "./site.mjs";

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const TEXT_EXT = /\.(?:html?|m?js)$/i;

function resolveRef(fromOutput, ref) {
    const clean = ref.split(/[?#]/)[0];
    if (!clean) return null;
    if (clean.startsWith("/")) return { error: "root-absolute URL (use a relative path so the site works under /Portfolio/ too)" };
    let joined = path.posix.normalize(path.posix.join(path.posix.dirname(fromOutput), clean));
    if (joined === ".." || joined.startsWith("../")) return { error: "points outside the site" };
    if (joined === "." || joined === "./") joined = "";
    const isDir = joined === "" || clean.endsWith("/") || /(?:^|\/)\.{1,2}$/.test(clean);
    return { target: joined.replace(/\/$/, ""), isDir };
}

function exists(outputs, target, isDir) {
    const index = target ? `${target}/index.html` : "index.html";
    if (isDir) return outputs.has(index);
    return outputs.has(target) || outputs.has(index);
}

function htmlRefs(html) {
    const refs = [];
    // Ignore comments, and inline scripts (which may contain URL-like strings).
    const stripped = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, "");
    for (const match of stripped.matchAll(/\s(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
        refs.push(match[1] ?? match[2]);
    }
    return refs;
}

function jsImports(js) {
    const refs = [];
    const patterns = [
        /\b(?:import|export)\b[^'"`;]*?\bfrom\s*["'](\.{1,2}\/[^"']+)["']/g,
        /\bimport\s*["'](\.{1,2}\/[^"']+)["']/g,
        /\bimport\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g
    ];
    for (const pattern of patterns) {
        for (const match of js.matchAll(pattern)) refs.push(match[1]);
    }
    return refs;
}

// Validates the rendered site. `rendered` maps output path -> Buffer.
// Returns a list of problems; an empty list means the site is safe to deploy.
export function checkSite(rendered, config) {
    const errors = [];

    for (const project of config.projects) {
        const entry = `${project.route}${project.entry}`;
        const html = rendered.get(entry)?.toString("utf8");
        if (!html) errors.push(`${project.id}: entry ${entry} missing from output`);
        else if (!html.includes("data-pf-bar")) errors.push(`${project.id}: portfolio bar not injected into ${entry}`);

        for (const outputPath of rendered.keys()) {
            if (outputPath.startsWith(project.route) && isProjectDenied(outputPath.slice(project.route.length))) {
                errors.push(`${project.id}: forbidden file published: ${outputPath}`);
            }
        }
    }

    for (const required of ["index.html", "404.html", ...config.nav.sections.map(s => `${s.path}index.html`)]) {
        if (!rendered.has(required)) errors.push(`missing required page: ${required}`);
    }

    for (const [outputPath, content] of rendered) {
        if (!TEXT_EXT.test(outputPath)) continue;
        const text = content.toString("utf8");
        const refs = outputPath.endsWith("html") ? htmlRefs(text) : jsImports(text);
        // 404.html resolves links against <base> = site root.
        const from = outputPath === "404.html" ? "index.html" : outputPath;

        for (const ref of refs) {
            if (!ref || EXTERNAL.test(ref) || ref.startsWith("data:")) continue;
            const resolved = resolveRef(from, ref);
            if (!resolved) continue;
            if (resolved.error) errors.push(`${outputPath}: "${ref}" ${resolved.error}`);
            else if (!exists(rendered, resolved.target, resolved.isDir)) {
                errors.push(`${outputPath}: broken reference "${ref}"`);
            }
        }
    }

    return errors;
}
