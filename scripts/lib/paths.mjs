import path from "node:path";

// Relative prefix from an output file back to the site root, e.g.
// "index.html" -> "./", "softwareengineering/pathfindingvisualizer/index.html"
// -> "../../". All internal links are written relative to this prefix, so the
// same build works at the custom domain root, at the GitHub Pages project URL
// (/Portfolio/), and locally.
export function rootPrefix(outputPath) {
    const depth = outputPath.split("/").length - 1;
    return depth === 0 ? "./" : "../".repeat(depth);
}

export function toPosix(p) {
    return p.split(path.sep).join("/");
}
