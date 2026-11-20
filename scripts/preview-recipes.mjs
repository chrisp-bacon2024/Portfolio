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
    }
};
