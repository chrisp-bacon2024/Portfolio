// Minimal glob matching for manifest include/exclude patterns, so the build
// needs no dependencies. Paths are POSIX-style and relative.
//   *    any characters except "/"
//   **   any characters including "/" ("**/" also matches zero directories)
//   ?    one character except "/"

export function globToRegExp(glob) {
    let source = "";
    for (let i = 0; i < glob.length; i++) {
        const char = glob[i];
        if (char === "*") {
            if (glob[i + 1] === "*") {
                if (glob[i + 2] === "/") {
                    source += "(?:.*/)?";
                    i += 2;
                } else {
                    source += ".*";
                    i += 1;
                }
            } else {
                source += "[^/]*";
            }
        } else if (char === "?") {
            source += "[^/]";
        } else {
            source += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
        }
    }
    return new RegExp(`^${source}$`);
}

export function createMatcher(globs) {
    const patterns = globs.map(globToRegExp);
    return path => patterns.some(pattern => pattern.test(path));
}
