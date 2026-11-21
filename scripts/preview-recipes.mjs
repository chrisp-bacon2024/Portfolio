// How to record each project's card preview (npm run previews).
//
// For each project id in projects.json:
//   viewport   browser size, in CSS pixels. BRAND_GUIDELINES 7.9 suggests
//              1440×900; use another size when it frames the app better
//   prepare    sets the app up before recording starts
//   frame      CSS selector of the element to film; the clip is a 16:10
//              crop centred on it (anchor "top" keeps its top edge instead)
//   start      starts the motion; recording begins just before it runs
//   done       optional JS expression that is true once the motion has
//              finished; recording stops `hold` seconds after it, or at
//              `maxSeconds`, whichever comes first
//   seconds    fixed length when there is no `done` (prepare may set it)
//   poster     when to take the still image: "end", or seconds after the
//              start. It shows before playback and with reduced motion
//   alt        what the preview shows, for screen readers (BRAND_GUIDELINES 7.9)
//
// Each recipe drives the real app through its own controls, so previews
// show the app exactly as it is. Re-record after a visual change to an app.
//
// Clips loop by cutting straight back to their first frame (no fade), so
// film one complete action: the start state, the motion, a short hold on
// the result.

export default {
    "pathfinding-visualizer": {
        alt: "Pathfinding Visualizer: A* searches generated terrain and draws the shortest path",
        // At this width the grid is close to 16:10, so the clip shows nearly
        // all of it, start to end (at 1440 it is much wider than 16:10).
        viewport: [1100, 930],
        async prepare(page) {
            await page.waitFor(`document.getElementById("gridCanvas")?.width > 0`);
            await page.click("#generate-map-btn");
            await page.select("#playback-speed", "10");
            // Generating animates the terrain for about 2 seconds, and the
            // app ignores algorithm clicks until it has finished.
            await page.wait(3000);
        },
        frame: "#gridCanvas",
        start: page => page.click('.algorithm-btn[data-algorithm="astar"]'),
        done: `(() => { const s = document.getElementById("playback-slider"); return Number(s.max) > 0 && Number(s.value) >= Number(s.max); })()`,
        hold: 1.2,
        maxSeconds: 12,
        poster: "end"
    },

    "genetic-snake": {
        alt: "Genetic Snake: an evolved neural network steers the snake until it fills the board, with its vision rays and network activity",
        viewport: [1440, 900],
        // One whole run, first move to win, so the loop simply restarts it:
        // generation 100 clears the 5×5 board in 174 moves.
        generation: 100,
        speed: 3, // one of the player's speed options (1, 3, 10, 20, 50); rays show below 10
        async prepare(page) {
            await page.waitFor(`document.getElementById("featured-generation")?.options.length > 0`);
            // Film just the board and the network: hide the sticky header,
            // which would cover the player, and the caption and controls.
            await page.addStyle(".site-header, .featured-meta, .featured-controls { display: none !important; }");
            await page.eval(`document.getElementById("featured").scrollIntoView({ block: "start", behavior: "instant" })`);
            // Pause, then load the run: it waits on its first frame until
            // start() presses play. (The controls are hidden, so press the
            // button directly rather than with the mouse.)
            await page.eval(`document.getElementById("featured-play").click()`);
            await page.select("#featured-speed", String(this.speed));
            await page.select("#featured-generation", String(this.generation));
            await page.wait(2000);
            // Record the run's length at this speed, plus a second on the win.
            const run = await page.eval(`fetch("data/manifest.json").then(r => r.json()).then(m =>
                [...m.grid_generations, ...m.featured_generations].find(e => e.generation === ${this.generation}))`);
            this.seconds = run.frame_count / (run.ticks_per_second * this.speed) + 1;
        },
        frame: ".featured-demo",
        anchor: "top",
        start: page => page.eval(`document.getElementById("featured-play").click()`),
        // Mid-run, with a long snake (the run lasts about 5.8 s at 3×).
        poster: 4
    },

    "sorting-visualizer": {
        alt: "Sorting Visualizer: heap sort puts a 25 by 25 grid of colors in order by hue, building the sorted rows up from the bottom",
        // Tall enough for the grid to reach its full 640px.
        viewport: [1440, 1000],
        cols: 25,
        async prepare(page) {
            await page.waitFor(`document.querySelectorAll(".algo-picker__option").length > 0`);
            // Speed first: in Tutorial speed the app locks the grid to 5×5.
            // "Very fast" (preset 5) plays a whole sort in about 9.5 s.
            await page.select("#speed-preset", "5");
            await page.eval(`(() => {
                const cols = document.getElementById("grid-cols");
                cols.value = "${this.cols}";
                cols.dispatchEvent(new Event("input", { bubbles: true }));
            })()`);
            await page.wait(300);
            await page.eval(`document.querySelector('.algo-picker__option[data-value="heap"]').click()`);
            // Hue numbers off: at this size they are noise.
            await page.eval(`(() => {
                const values = document.getElementById("show-hue");
                if (values.checked) values.click();
            })()`);
            await page.wait(500);
            // Film the whole square grid, centred in a 16:10 box with room
            // either side, so no rows are cropped (heap sort fills the
            // sorted rows from the bottom up). The box is an invisible
            // element, because the recorder films one element. (The heap
            // tree panel only shows in Tutorial speed.)
            await page.eval(`(() => {
                const r = document.querySelector(".canvas-container").getBoundingClientRect();
                const pad = 16;
                const height = r.height + 2 * pad;
                const width = height * 16 / 10;
                const box = document.createElement("div");
                box.id = "pf-preview-frame";
                Object.assign(box.style, {
                    position: "absolute", pointerEvents: "none",
                    left: (r.left + r.width / 2 - width / 2 + scrollX) + "px",
                    top: (r.top - pad + scrollY) + "px",
                    width: width + "px",
                    height: height + "px"
                });
                document.body.append(box);
            })()`);
        },
        frame: "#pf-preview-frame",
        start: page => page.click("#play-toggle"),
        done: `document.getElementById("status").textContent.startsWith("Sorted")`,
        hold: 1.2,
        maxSeconds: 15,
        // Partway through: the heap above, the sorted rainbow growing from
        // the bottom.
        poster: 6
    }
};
