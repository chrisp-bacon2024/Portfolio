/* Card previews: the short silent loops at the top of project cards
   (BRAND_GUIDELINES 7.9). PORTFOLIO PAGES ONLY.

   Markup (see site/softwareengineering/index.html):
     <div class="card-media" data-card-preview data-label="Pathfinding Visualizer preview">
       <video muted loop playsinline preload="none" poster="...">...</video>
       <button type="button" class="card-media-toggle" hidden></button>
     </div>

   Behaviour:
   - plays only while at least half the preview is on screen, and stops when
     it scrolls away or the tab is hidden;
   - never starts by itself when the visitor prefers reduced motion: the
     poster shows, and the button can still play it;
   - the button pauses and resumes it (WCAG 2.2.2), and a pause sticks until
     the visitor presses play again;
   - without JavaScript the poster image shows and nothing moves. */

(() => {
    "use strict";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previews = [...document.querySelectorAll("[data-card-preview]")].map(root => ({
        root,
        video: root.querySelector("video"),
        button: root.querySelector(".card-media-toggle"),
        label: root.dataset.label || "preview",
        visible: false,
        userPaused: reducedMotion.matches
    })).filter(preview => preview.video && preview.button);

    if (previews.length === 0) return;

    function render(preview) {
        const playing = !preview.video.paused;
        preview.button.dataset.state = playing ? "playing" : "paused";
        preview.button.setAttribute("aria-label", `${playing ? "Pause" : "Play"} ${preview.label}`);
    }

    function sync(preview) {
        const shouldPlay = preview.visible && !preview.userPaused && !document.hidden;
        if (shouldPlay && preview.video.paused) {
            preview.video.play().catch(() => {
                // Autoplay refused (for example in a power-saving mode):
                // leave the poster showing and the button on "Play".
                render(preview);
            });
        } else if (!shouldPlay && !preview.video.paused) {
            preview.video.pause();
        }
    }

    for (const preview of previews) {
        preview.video.muted = true;
        preview.button.hidden = false;
        preview.video.addEventListener("play", () => render(preview));
        preview.video.addEventListener("pause", () => render(preview));
        preview.button.addEventListener("click", event => {
            // The card is a stretched link; this button must not follow it.
            event.preventDefault();
            event.stopPropagation();
            preview.userPaused = !preview.video.paused;
            if (preview.userPaused) preview.video.pause();
            else {
                preview.visible = true;
                sync(preview);
            }
        });
        render(preview);
    }

    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            const preview = previews.find(p => p.root === entry.target);
            if (!preview) continue;
            preview.visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
            sync(preview);
        }
    }, { threshold: [0, 0.5] });
    previews.forEach(preview => observer.observe(preview.root));

    document.addEventListener("visibilitychange", () => previews.forEach(sync));

    // Turning on "reduce motion" while the page is open stops everything.
    reducedMotion.addEventListener("change", () => {
        if (!reducedMotion.matches) return;
        for (const preview of previews) {
            preview.userPaused = true;
            sync(preview);
        }
    });
})();
