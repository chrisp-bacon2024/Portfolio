/* Portfolio chrome behaviour: navigation menus, skip links, and keyboard
   isolation. Loaded (deferred) by portfolio pages and injected into every
   hosted application. No dependencies, no globals.

   Keyboard isolation: hosted apps often listen for shortcuts on window or
   document (the Pathfinding Visualizer runs algorithms on d/b/j/a and
   selects brushes on w/g/m/r). Key events that start inside the chrome
   are stopped at the chrome's root, so they never bubble up to those
   listeners. The chrome's own handlers run first, because they sit on
   descendants of that root. */
(() => {
    "use strict";

    const KEY_EVENTS = ["keydown", "keyup", "keypress"];

    function isolateKeyboard(root) {
        const stop = event => event.stopPropagation();
        KEY_EVENTS.forEach(type => root.addEventListener(type, stop));
    }

    // Moves focus to the skip target without navigating, so it also works
    // on pages that set a <base> element (404.html).
    function setupSkipLink(link) {
        link.addEventListener("click", event => {
            const id = (link.getAttribute("href") || "").replace(/^#/, "");
            const target = id && document.getElementById(id);
            if (!target) return;
            event.preventDefault();
            if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
            target.focus();
        });
    }

    // Disclosure navigation: a button with aria-expanded that shows a list
    // of links. Escape, an outside tap/click, or tabbing away closes it;
    // arrow keys, Home and End move between the links.
    function setupMenu(root) {
        const button = root.querySelector("[data-pf-menu-button]");
        const panel = root.querySelector("[data-pf-menu-panel]");
        if (!button || !panel) return;

        const links = () => [...panel.querySelectorAll("a[href]")];
        const isOpen = () => button.getAttribute("aria-expanded") === "true";
        // The site header shows its links inline on wide screens and hides
        // the button; the menu behaviour only applies while it's visible.
        const isCollapsed = () => button.getClientRects().length > 0;

        function open(focusIndex) {
            panel.hidden = false;
            button.setAttribute("aria-expanded", "true");
            if (focusIndex !== undefined) {
                const items = links();
                const index = focusIndex < 0 ? items.length + focusIndex : focusIndex;
                if (items[index]) items[index].focus();
            }
        }

        function close({ focusButton = false } = {}) {
            panel.hidden = true;
            button.setAttribute("aria-expanded", "false");
            if (focusButton) button.focus();
        }

        close();
        root.setAttribute("data-pf-menu-ready", "");

        button.addEventListener("click", () => (isOpen() ? close() : open()));

        root.addEventListener("keydown", event => {
            if (!isCollapsed()) return;

            if (event.key === "Escape" && isOpen()) {
                event.preventDefault();
                close({ focusButton: true });
                return;
            }

            const items = links();
            const index = items.indexOf(document.activeElement);

            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    if (!isOpen()) open(0);
                    else items[(index + 1) % items.length].focus();
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    if (!isOpen()) open(-1);
                    else items[index <= 0 ? items.length - 1 : index - 1].focus();
                    break;
                case "Home":
                case "End":
                    if (!isOpen() || index === -1) return;
                    event.preventDefault();
                    items[event.key === "Home" ? 0 : items.length - 1].focus();
                    break;
            }
        });

        // Tap or click outside closes it.
        document.addEventListener("pointerdown", event => {
            if (isOpen() && !root.contains(event.target)) close();
        });

        // Tabbing out closes it. A null relatedTarget (e.g. Safari, which
        // doesn't focus links on click) is left to the pointerdown handler,
        // so a tap on a menu link is never cancelled by an early close.
        root.addEventListener("focusout", event => {
            if (isOpen() && event.relatedTarget && !root.contains(event.relatedTarget)) close();
        });
    }

    document.querySelectorAll("[data-pf-isolate]").forEach(isolateKeyboard);
    document.querySelectorAll("[data-pf-skip]").forEach(setupSkipLink);
    document.querySelectorAll("[data-pf-menu]").forEach(setupMenu);
})();
