# Brand Guidelines: christophermpalmer.com

**Source:** the Pathfinding Visualizer web app (`index.html`, `style.css`, and the canvas-drawing JavaScript), as of November 2026. Its visual style is the foundation of the brand.
**Purpose:** a self-contained specification for building Christopher M. Palmer's professional portfolio website, **christophermpalmer.com**, and for keeping the applications it hosts visually consistent. You do not need access to the original repository to use it.
**Scope:** the site presents three disciplines:

1. **Software Engineering:** Genetic Snake, Sorting Visualizer, Pathfinding Visualizer, JobPilot, and future applications.
2. **Data Science:** FrequenSee, Philly Crime & Sports Analysis, a planned Alzheimer's predictive model, and future projects.
3. **Music Composition:** original compositions, recordings, sheet music and program notes.

## How to read this document

Every rule is labelled:

- **[Existing]**: exactly what the Pathfinding Visualizer does today. Values are copied from its code.
- **[Proposed]**: a recommended extension or improvement for the portfolio. These don't exist in the app, but follow its conventions.

When the two conflict, keep the **[Existing]** look and treat **[Proposed]** items as refinements.

The document has two layers:

1. **Brand layer** (Sections 1–7): colours, type, components and layout for every portfolio page, and for the shared navigation shown around each hosted application. Section 7 applies them to christophermpalmer.com.
2. **Project visualization layer** (Section 8): the Pathfinding Visualizer's own terrain, search-state and data-series colours. They belong to that one application. They are an example of a project-specific palette, not a portfolio-wide one; every project keeps its own (see 7.7).

---

## 1. Visual Identity

### 1.1 Character [Existing]

The interface is **quiet, academic and precise**: a white page, classic serif type, slate-grey hairlines, and a single deep navy for anything important or selected. The colourful content (the terrain map and algorithm paths) does the visual work; the surrounding interface deliberately stays out of its way.

Defining characteristics:

1. **Serif typography everywhere**, including buttons and form controls. This is the most distinctive trait: it makes a technical tool feel like a printed reference or textbook rather than a generic dashboard.
2. **Navy and white.** Deep navy `#284a63` marks the page title and every "selected / active" state. Everything else is white with slate-grey text and borders.
3. **One restrained light-blue accent**, `#65b5e8`. It is used sparingly: the short rule under the page title, and the 1px border of selected controls. It is never used as a fill for large areas or as text.
4. **Small-caps-style section labels.** Section headings are tiny (12px), bold, UPPERCASE and letter-spaced, in slate grey. They label rather than shout.
5. **Hairline structure.** 1px `#cbd5e1` borders and dividers separate groups. There are no heavy panels, background stripes or gradients.
6. **Compact, gently rounded controls.** 6px radius, modest padding, and a hover that only tints the background (`#f1f5f9`).
7. **Colour carries meaning.** Saturated colours appear only where they encode information: algorithm identity, terrain type and search state.
8. **Centred composition.** The page title, section titles and button groups are centred; columns align across sections.

### 1.2 Design principles [Existing, stated as principles]

- **Content first, chrome second.** Interface elements use neutrals so the data stands out.
- **One emphasis colour.** If something is selected, active or the "current" item, it turns navy with white text. Nothing else competes.
- **Alignment over decoration.** Rows of controls line up across sections (the code goes out of its way to align them) instead of being separated by boxes.
- **Every colour has a job.** Green means "best/guaranteed", amber means "warning", muted grey italic means "not applicable".
- **Honest states.** Disabled and unavailable items stay visible at 45% opacity, so users can still discover why they are unavailable (via tooltip).

---

## 2. Color Palette

All brand neutrals happen to match Tailwind CSS's *slate* scale; the app does not use Tailwind. The navy and light-blue accents are custom colours.

### 2.1 Core brand colours

| Token (proposed name) | Hex | Status | Purpose in the app |
|---|---|---|---|
| `--color-navy` | `#284a63` | Existing | Page title text; background of every selected/active control (last-run algorithm, current paint brush, Directions toggle, selected dropdown trigger); tooltip title text. The primary brand colour. |
| `--color-navy-hover` | `#345d7b` | Existing | Hover background for navy (selected) controls. |
| `--color-sky` | `#65b5e8` | Existing | Accent only: 3px rule under the page title; 1px border of selected controls; border of shortcut keys inside selected buttons. Decorative, never text. |
| `--color-white` | `#ffffff` | Existing | Page background (browser default; never set explicitly in the CSS), button, dropdown and tooltip backgrounds, and text on navy. |

### 2.2 Neutrals (slate scale)

| Token | Hex | Status | Purpose in the app |
|---|---|---|---|
| `--color-slate-50` | `#f8fafc` | Proposed | Optional subtle page band (not used in app). |
| `--color-slate-100` | `#f1f5f9` | Existing | Hover background for buttons and select; Directions panel background; neutral badge background. |
| `--color-slate-200` | `#e2e8f0` | Existing | Table header rule; shortcut-key text on navy. |
| `--color-slate-300` | `#cbd5e1` | Existing | **All** borders and dividers: buttons, select, dropdown menu, tooltip, toolbar section dividers; fallback swatch fill. |
| `--color-slate-400` | `#94a3b8` | Existing | Muted, not-applicable values ("no path"), shown in italic. |
| `--color-slate-500` | `#64748b` | Existing | Secondary text: table headers, notes (italic), "Directions" caption, shortcut keys. |
| `--color-slate-600` | `#475569` | Existing | Section titles (ALGORITHMS, TERRAIN, PLAYBACK); neutral badge text. |
| `--color-slate-700` | `#334155` | Existing | Primary interface text: buttons, select, tooltip body; range-slider accent colour. |
| `--color-slate-900` | `#0f172a` | Existing (as rgba) | Shadow colour (`rgba(15, 23, 42, 0.18)`) and swatch/dot outlines (`rgba(15, 23, 42, 0.55)`). |
| `--color-text` | `#000000` | Existing (browser default) | Unstyled body text, e.g. the "Paint:" and "Map:" row labels. **[Proposed]**: use `--color-slate-700` or darker slate (`#1e293b`) instead of pure black for body copy, to match the rest of the interface. |

### 2.3 Status and feedback colours [Existing]

| Token | Hex | Purpose |
|---|---|---|
| `--color-success-bg` | `#dcfce7` | Background of the "guarantee" badge (e.g. "Lowest cost"). |
| `--color-success-text` | `#166534` | Text of that badge. |
| `--color-success-strong` | `#15803d` | Best value in a comparison column (bold). |
| `--color-highlight-row` | `#eff6ff` | Background of the current/hovered row in the comparison table. |
| `--color-warning-bg` | `#fffbeb` | Warning callout background. |
| `--color-warning-border` | `#f59e0b` | Warning callout 3px left border. |
| `--color-warning-text` | `#92400e` | Warning callout text (bold). |

### 2.4 Legacy colours (do not reuse)

The stylesheet contains rules for a `#runAlgorithm` button (`#2563eb`, hover `#1d4ed8`) and a `.shortcut` key style. Neither element exists in the current HTML; they are leftovers. The bright `#2563eb` blue is **not** part of the brand: the brand's "primary action" colour is navy.

### 2.5 Contrast (WCAG 2.x ratios, computed)

| Pair | Ratio | Guidance |
|---|---|---|
| Navy `#284a63` on white (or white on navy) | 9.33 : 1 | Any text size. |
| White on navy-hover `#345d7b` | 7.01 : 1 | Any text size. |
| Slate-700 `#334155` on white | 10.35 : 1 | Body text. |
| Slate-600 `#475569` on white | 7.58 : 1 | Body text / labels. |
| Slate-500 `#64748b` on white | 4.76 : 1 | OK for normal text (AA). |
| Slate-500 on slate-100 `#f1f5f9` | 4.34 : 1 | Large or bold text only. |
| Success green `#15803d` on white | 5.02 : 1 | OK. |
| Badge text on badge backgrounds | 6.5–6.9 : 1 | OK. |
| Slate-400 `#94a3b8` on white | 2.56 : 1 | Decorative or "not applicable" text only; never essential info. |
| Sky `#65b5e8` on white | 2.25 : 1 | **Never text.** Rules, borders, focus rings beside navy only. |
| Slate-300 `#cbd5e1` on white | 1.48 : 1 | Borders only. |

---

## 3. Typography

### 3.1 Font family

**[Existing]** The stylesheet never declares `font-family`. Every element uses the **browser's default serif font**: Times New Roman on Windows and most desktop browsers, Times on macOS/iOS. Buttons and the speed `<select>` set `font: inherit`, so they are serif too (browsers would otherwise give form controls a sans-serif system font). That inheritance is what makes the controls look distinctive.

**[Proposed]**: lock this look in explicitly, so it no longer depends on browser defaults:

```css
:root {
  --font-serif: "Times New Roman", Times, "Liberation Serif", "Nimbus Roman", serif;
  --font-mono: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace; /* code samples only */
}
body { font-family: var(--font-serif); }
button, input, select, textarea { font: inherit; }   /* keep controls serif */
```

If a web font is wanted later, choose a classic, Times-like text serif and keep it the **only** typeface for UI and prose. Do not introduce a sans-serif for headings or buttons; the all-serif interface is the brand. Use monospace only inside code blocks.

Serif is the default everywhere on the portfolio. Limited, justified exceptions are allowed inside specialized application interfaces; see 7.8.

### 3.2 Type scale [Existing]

The base size is the browser default **16px** (not set in the CSS). Line height is the browser's `normal` (about 1.15 for Times) unless listed.

| Role | Size | Weight | Letter spacing | Transform | Colour | Notes |
|---|---|---|---|---|---|---|
| Page title (H1) | `clamp(22px, 4.5vw, 30px)` | 700 | `0.08em` | UPPERCASE | Navy `#284a63` | Centred; 56×3px sky rule 6px below, radius 2px. |
| Section title (H2) | 12px | 700 | `0.06em` | UPPERCASE | Slate-600 `#475569` | Centred above its controls. |
| Button / control text | 16px (inherited) | 400 | normal | none | Slate-700 `#334155` (white when selected) | |
| Row label ("Paint:", "Map:") | 12px | 600 | normal | none | Black (default) | `white-space: nowrap`, 4px right margin. |
| Micro caption ("DIRECTIONS") | 9px | 600 | `0.05em` | UPPERCASE | Slate-500 `#64748b` | Line height 10px. |
| Compact toggle text ("4-way") | 11px | 600 | normal | none | White on navy | Line height 22px. |
| Tooltip body | 13px | 400 | normal | none | Slate-700 | Line height **1.35**. |
| Tooltip title | 14px | 700 (`<strong>`) | normal | none | Navy | |
| Badge | 11px | 600 | normal | none | Status colours | Pill shape. |
| Table body | 12px | 400 | normal | none | Slate-700 | `font-variant-numeric: tabular-nums`, right-aligned numbers. |
| Table header | 11px | 600 | normal | none | Slate-500 | Right-aligned; 1px slate-200 rule below. |
| Note | inherits (13px) | 400, *italic* | normal | none | Slate-500 | |
| Muted value | inherits | 400, *italic* | normal | none | Slate-400 | |

### 3.3 Hierarchy rules [Existing]

- Only **two** weights in practice: 600 (labels, captions, badges) and 700 (titles, emphasis). Regular text is 400.
- **UPPERCASE plus letter-spacing is reserved for titles and captions**, and the tracking scales with the role: 0.08em for H1, 0.06em for section titles, 0.05em for micro captions.
- Hierarchy comes from **size, weight and colour**, not from extra typefaces: navy for the most important text, slate-600 for structural labels, slate-500 for secondary, slate-400 italic for not-applicable.
- Numbers in tables are tabular and right-aligned.

### 3.4 Extended scale for the portfolio [Proposed]

The app only needs a tiny scale; a portfolio needs body copy and longer headings. Extend it in the same spirit:

| Role | Size | Weight | Tracking | Transform | Colour |
|---|---|---|---|---|---|
| Display / hero name | `clamp(32px, 6vw, 48px)` | 700 | 0.08em | UPPERCASE | Navy |
| Page title (H1) | `clamp(22px, 4.5vw, 30px)` | 700 | 0.08em | UPPERCASE | Navy, with sky rule |
| Section heading (H2) | 22–24px | 700 | 0.02em | Sentence case | Navy |
| Eyebrow / kicker | 12px | 700 | 0.06em | UPPERCASE | Slate-600 |
| Subheading (H3) | 18px | 700 | normal | Sentence case | Slate-700 |
| Body | 17–18px | 400 | normal | none | Slate-700 / `#1e293b` |
| Small / meta | 13–14px | 400 | normal | none | Slate-500 |
| Caption / label | 12px | 600 | normal | none | Slate-600 |

Body line height: **1.6** for paragraphs, **1.35** for compact UI text (the tooltip value), and `normal` for single-line controls. Paragraph measure: about 65–75 characters (`max-width: 68ch`).

---

## 4. UI Components

All values below are **[Existing]** unless marked. "Interface border" means `1px solid #cbd5e1`.

### 4.1 Buttons

| State | Background | Border | Text | Other |
|---|---|---|---|---|
| Default | `#fff` | `1px solid #cbd5e1` | `#334155` | `padding: 8px 12px; border-radius: 6px; font: inherit; cursor: pointer` |
| Hover (enabled) | `#f1f5f9` | unchanged | unchanged | `transition: background .15s, border-color .15s` |
| Selected / active | `#284a63` | `#65b5e8` | `white` | Used for "current choice" (toggle groups) and "last used" items. |
| Selected + hover | `#345d7b` | `#65b5e8` | `white` | |
| Disabled | unchanged | unchanged | unchanged | `opacity: 0.45; cursor: not-allowed` |
| Unavailable (looks disabled but still hoverable, so a tooltip can explain) | `#fff` | `#cbd5e1` | `#334155` | `opacity: 0.45; cursor: not-allowed`; hover does **not** change background |
| Tagged with a data colour ("has path") | unchanged | unchanged | unchanged | `box-shadow: inset 0 -4px 0 var(--path-color)`: a 4px coloured sliver along the bottom edge |
| Tagged but hidden | unchanged | unchanged | unchanged | Sliver at 30%: `color-mix(in srgb, var(--path-color) 30%, transparent)` |
| Focus | browser default focus ring | | | No custom focus style exists. See 4.10. |

There is **no separate "primary" button colour** in the brand. The selected/active navy treatment *is* the emphasis style. If a portfolio needs a call-to-action button, use the navy style (see 4.11).

```css
.btn {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #334155;
  font: inherit;
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.btn:hover:not(:disabled) { background: #f1f5f9; }
.btn:disabled { opacity: .45; cursor: not-allowed; }
.btn.is-selected, .btn[aria-pressed="true"] {
  background: #284a63; border-color: #65b5e8; color: #fff;
}
.btn.is-selected:hover:not(:disabled) { background: #345d7b; }
.btn.has-accent { box-shadow: inset 0 -4px 0 var(--accent, transparent); }
```

**Grouping:** buttons in a group sit 6px apart, in flex rows or CSS grids. In the app, nine algorithm buttons plus a mode toggle form a 5-column grid with 6px gaps. Selection is single-choice and shown with the navy state plus `aria-pressed`.

### 4.2 Compact toggle panel ("Directions" switch)

A labelled mini-panel that fits exactly into one button-sized grid cell (36px tall):

- Panel: `padding: 1px 2px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f1f5f9`, with a vertical flex layout.
- Caption: 9px / 600 / UPPERCASE / 0.05em / slate-500 / centred / line-height 10px.
- Inner button: navy background, white 11px/600 text, line-height 22px, `border-radius: 4px` (nested radius 4 inside 6), no border, 4px gap between a 22×22px icon and the text. Hover `#345d7b`.
- Icons are inline SVGs drawn with `currentColor` (stroke widths 1 to 1.3 on a 16-unit viewBox), so they inherit the text colour.

### 4.3 Section header (toolbar section)

- A vertical flex column with **centred** items and a 4px gap: title above, controls below.
- Title: 12px, bold, UPPERCASE, `letter-spacing: .06em`, slate-600, `margin: 0`.
- Sections sit side by side in a wrapping flex row (12px gap, `padding: 8px 12px`). Every section after the first gets a **1px slate-300 left divider** with 12px left padding: `.toolbar > * + * { border-left: 1px solid #cbd5e1; padding-left: 12px; }`.
- On narrow screens the dividers move to the top: `border-top: 1px solid #cbd5e1; padding-top: 10px`.

### 4.4 Label + control rows

A two-column CSS grid (`grid-template-columns: auto auto; gap: 6px; align-items: center`). The left column holds a 12px/600 label ending in a colon ("Paint:"); the right column holds a centred button group. The row heights match the neighbouring button grid, so rows line up across sections.

### 4.5 Dropdown menu

Used for collapsing a button group on small screens.

- **Trigger:** a regular button with `display: flex; align-items: center; gap: 6px; width: 100%`. It contains left-aligned text (`flex: 1`), optional colour dots, and a caret `▾` at 11px and 70% opacity. When something is selected, the trigger takes the navy selected style and mirrors that item's colour sliver.
- **Menu:** `position: absolute; top: calc(100% + 4px); left: 0; min-width: 100%; z-index: 20`; a flex column with 4px gaps; `padding: 6px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(15, 23, 42, .18)`. Items are full buttons, left-aligned.
- **Colour dots:** 7×7px circles, 3px apart, each with a hairline outline `box-shadow: 0 0 0 1px rgba(15, 23, 42, .55)`. Faded dots use `opacity: .3`.
- **Behaviour:** the trigger toggles the menu. Escape, an outside click or choosing an item closes it. Arrow keys move between items. The trigger sets `aria-haspopup` and `aria-expanded`.

### 4.6 Select

`padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; color: #334155; font: inherit`. Hover `#f1f5f9`. Native arrow (no custom chevron).

### 4.7 Range slider

Native `<input type="range">` with `width: 100%; margin: 0; accent-color: #334155; cursor: pointer`. The slate-700 accent keeps the thumb and track neutral rather than blue.

### 4.8 Icon-only button (play/pause)

A standard button with `min-width: 44px; padding: 4px 12px` (44px meets touch-target guidance). It holds a Unicode glyph (▶, ❚❚) and an `aria-label` that changes with its state.

### 4.9 Tooltip / popover card

- `position: fixed; z-index: 30; max-width: min(360px, calc(100vw - 16px)); padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(15, 23, 42, .18); color: #334155; font-size: 13px; line-height: 1.35`.
- **Header:** a 9px colour swatch circle (hairline outline as in 4.5) with a 6px gap to a 14px bold navy title.
- **Badge (pill):** `display: inline-block; margin-top: 5px; padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 600`. Positive variant: `#dcfce7` / `#166534`. Neutral variant: `#f1f5f9` / `#475569`.
- **Description:** a paragraph with `margin: 6px 0 0`.
- **Note:** italic, slate-500. **Warning:** `padding: 4px 6px; border-left: 3px solid #f59e0b; background: #fffbeb; color: #92400e; font-weight: 600`.
- **Data table:** 12px, tabular numbers, collapsed borders, `margin-top: 8px`. Headers are 11px/600 slate-500, right-aligned, with a 1px `#e2e8f0` rule beneath. Cells have `padding: 2px 0 2px 8px`. The current row is `#eff6ff` and bold. The best value is `#15803d` and bold. Not-applicable values are slate-400 italic.
- **Behaviour:** appears after a 250ms hover (mouse), on keyboard focus, or after a 450ms long press (touch). It sits below its trigger, or above when there's no room.

### 4.10 Focus states

**[Existing]** None are defined, so browsers draw their default focus outline.
**[Proposed]** Add a consistent, visible ring that matches the brand, shown only for keyboard focus:

```css
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: 2px solid #284a63;      /* navy: 9.3:1 on white */
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(101, 181, 232, .45); /* soft sky halo */
}
.btn.is-selected:focus-visible { outline-color: #65b5e8; } /* stays visible on navy */
```

### 4.11 Components needed only by the portfolio [Proposed]

These follow the existing rules and introduce no new colours.

- **Link:** navy text with a 1px underline, offset 3px; on hover, the underline thickens to 2px and turns sky. Visited links stay navy (keep a single colour).
- **Call-to-action button:** the selected style used as a permanent primary button (`background: #284a63; border-color: #65b5e8; color: #fff`). Secondary actions use the default white button.
- **Card:** white, interface border, `border-radius: 8px`, `padding: 16px`. On hover, add the popover shadow `0 8px 24px rgba(15, 23, 42, .18)` and change the border to `#94a3b8`. An optional accent uses the 4px bottom sliver `box-shadow: inset 0 -4px 0 var(--accent)`, in a colour taken from the project's own palette (see 7.7).
- **Tag / skill chip:** the badge pill from 4.9 in its neutral variant (`#f1f5f9` / `#475569`). Use the positive (green) variant only for status meanings such as "Live" or "Tested".
- **Code block:** `background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; font-family: var(--font-mono); font-size: 14px; color: #1e293b`.

---

## 5. Layout and Spacing

### 5.1 Spacing scale

**[Existing]** values found in the CSS: 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20 px. The workhorses are:

| Use | Value |
|---|---|
| Gap inside a control group (buttons, rows) | **6px** |
| Gap between a section title and its controls; menu item gap | **4px** |
| Gap between toolbar sections; divider padding | **12px** (10px when stacked) |
| Button padding | **8px 12px** (compact controls: 4px 8px or 4px 12px) |
| Card/popover padding | **10px 12px** |
| Page padding / vertical rhythm between page regions | **20px** padding, **15px** gap (10px / 10px at 700px wide or narrower) |

**[Proposed]** For the portfolio, formalise a 4px-based scale that contains those values:
`--space-1: 4px; --space-1-5: 6px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px`.
Use 6px for related controls, 12px for groups, 20–24px for regions, and 48–64px between major page sections.

### 5.2 Borders, radii and shadows [Existing]

| Element | Value |
|---|---|
| Borders and dividers | `1px solid #cbd5e1` everywhere; table rule `1px solid #e2e8f0` |
| Radius: controls (buttons, select, toggle panel) | **6px** |
| Radius: floating surfaces (dropdown menu, tooltip) | **8px** |
| Radius: nested inner control | 4px |
| Radius: tiny elements (shortcut key 3px, title rule 2px) | 2–3px |
| Radius: pills, dots, swatches | `999px` / `50%` |
| Shadow: floating surfaces only | `0 8px 24px rgba(15, 23, 42, 0.18)` |
| Hairline outline for colour swatches on any background | `box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.55)` |
| Accent sliver | `box-shadow: inset 0 -4px 0 <colour>` |

Flat elements (buttons, sections) have **no shadow**; only things that float above the page (menus, tooltips) do.

### 5.3 Page structure [Existing]

- A full-height column: `.app { display: flex; flex-direction: column; height: 100vh; padding: 20px; gap: 15px; }`.
- **Header:** a centred, uppercase navy title with a short sky rule underneath.
- **Toolbar:** titled sections in a row, separated by vertical hairlines; titles are centred; rows of controls align horizontally across sections; the last section (Playback) takes the remaining width (`flex: 1 1 260px`).
- **Main area:** fills the remaining height (`flex: 1; min-height: 0`), with its content centred both ways.
- Layering: dropdown menus at `z-index: 20`, tooltips at `z-index: 30`.

### 5.4 Responsive conventions [Existing]

| Breakpoint | Behaviour |
|---|---|
| `> 900px` | Full layout: all buttons visible in grids; sections side by side. |
| `≤ 900px` | Long button groups collapse into dropdowns that show the current choice. (On wide screens the dropdown wrappers use `display: contents`, so the same markup lays out as a plain grid.) |
| `≤ 800px` | Sections stack into one centred column (`max-width: 360px`, all the same width). Dividers switch from left borders to top borders. Labels share a fixed 76px first column, so controls start at the same x position in every section. Paired buttons split the row evenly (`flex: 1`). |
| `≤ 700px` | Page padding and region gap drop from 20/15px to 10/10px. |

Other conventions:

- The viewport meta tag is required.
- The page title scales with `clamp()`.
- Touch drawing areas use `touch-action: none`.
- Long-pressable elements use `user-select: none` and `-webkit-touch-callout: none`.
- Input uses Pointer Events, so mouse, touch and pen behave the same.

**[Proposed]** For a content site, use a centred content column of `max-width: 1100px` (text column `68ch`) with `padding-inline: 20px`, dropping to `10–16px` at 700px or narrower. Keep the 900px and 800px breakpoints for navigation behaviour (see 7.4 and 7.12).

---

## 6. Design Tokens

**[Proposed]** These tokens consolidate the **[Existing]** values (the comments note each original use), plus the minimum extra tokens a portfolio needs. Put brand tokens and visualization tokens in separate files.

### 6.1 `brand-tokens.css`

```css
:root {
  /* ---- Colour: brand ---- */
  --color-navy: #284a63;          /* titles, selected/active, primary emphasis */
  --color-navy-hover: #345d7b;    /* hover on navy */
  --color-sky: #65b5e8;           /* accent rule, selected border. Never text */
  --color-white: #ffffff;

  /* ---- Colour: neutrals (slate) ---- */
  --color-slate-50:  #f8fafc;     /* proposed: subtle surfaces, code blocks */
  --color-slate-100: #f1f5f9;     /* hover fill, panel fill, neutral badge */
  --color-slate-200: #e2e8f0;     /* light rules */
  --color-slate-300: #cbd5e1;     /* borders and dividers */
  --color-slate-400: #94a3b8;     /* muted / not-applicable text */
  --color-slate-500: #64748b;     /* secondary text */
  --color-slate-600: #475569;     /* section titles / labels */
  --color-slate-700: #334155;     /* interface text */
  --color-slate-800: #1e293b;     /* proposed: long-form body text */
  --color-slate-900: #0f172a;     /* shadow / outline base */

  /* ---- Colour: semantic ---- */
  --color-bg: var(--color-white);
  --color-surface: var(--color-white);
  --color-surface-muted: var(--color-slate-100);
  --color-text: var(--color-slate-800);
  --color-text-ui: var(--color-slate-700);
  --color-text-secondary: var(--color-slate-500);
  --color-text-muted: var(--color-slate-400);
  --color-heading: var(--color-navy);
  --color-label: var(--color-slate-600);
  --color-border: var(--color-slate-300);
  --color-rule: var(--color-slate-200);
  --color-accent: var(--color-sky);
  --color-selected-bg: var(--color-navy);
  --color-selected-bg-hover: var(--color-navy-hover);
  --color-selected-border: var(--color-sky);
  --color-selected-text: var(--color-white);
  --color-hover-bg: var(--color-slate-100);
  --color-highlight-row: #eff6ff;

  --color-success-bg: #dcfce7;
  --color-success-text: #166534;
  --color-success-strong: #15803d;
  --color-warning-bg: #fffbeb;
  --color-warning-border: #f59e0b;
  --color-warning-text: #92400e;

  /* ---- Typography ---- */
  --font-serif: "Times New Roman", Times, "Liberation Serif", "Nimbus Roman", serif;
  --font-mono: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace;

  --font-size-display: clamp(32px, 6vw, 48px);  /* proposed */
  --font-size-title: clamp(22px, 4.5vw, 30px);  /* existing H1 */
  --font-size-h2: 24px;                         /* proposed */
  --font-size-h3: 18px;                         /* proposed */
  --font-size-body: 17px;                       /* proposed (app: 16px default) */
  --font-size-ui: 16px;                         /* existing control text */
  --font-size-small: 13px;                      /* existing tooltip text */
  --font-size-label: 12px;                      /* existing section titles / labels */
  --font-size-micro: 11px;                      /* existing badges, table headers */
  --font-size-caption: 9px;                     /* existing micro caption */

  --font-weight-regular: 400;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --tracking-title: 0.08em;     /* H1 / display */
  --tracking-section: 0.06em;   /* section titles, eyebrows */
  --tracking-caption: 0.05em;   /* micro captions */

  --leading-tight: 1.15;        /* single-line UI (browser "normal" for Times) */
  --leading-ui: 1.35;           /* tooltip / compact text */
  --leading-body: 1.6;          /* proposed: paragraphs */

  /* ---- Spacing ---- */
  --space-1: 4px;
  --space-1-5: 6px;
  --space-2: 8px;
  --space-2-5: 10px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* ---- Shape ---- */
  --radius-xs: 2px;
  --radius-inner: 4px;
  --radius-control: 6px;
  --radius-surface: 8px;
  --radius-pill: 999px;
  --border-width: 1px;
  --border: var(--border-width) solid var(--color-border);

  /* ---- Elevation ---- */
  --shadow-float: 0 8px 24px rgba(15, 23, 42, 0.18);
  --outline-swatch: 0 0 0 1px rgba(15, 23, 42, 0.55);
  --sliver-width: 4px;

  /* ---- Motion ---- */
  --transition-fast: 0.15s;     /* background / border-color on hover */

  /* ---- Layout ---- */
  --content-max: 1100px;        /* proposed */
  --measure: 68ch;              /* proposed */
  --title-rule-width: 56px;
  --title-rule-height: 3px;
  --z-dropdown: 20;
  --z-tooltip: 30;

  /* ---- Component ---- */
  --btn-padding: var(--space-2) var(--space-3);       /* 8px 12px */
  --btn-padding-compact: var(--space-1) var(--space-2); /* 4px 8px */
  --surface-padding: var(--space-2-5) var(--space-3); /* 10px 12px */
  --touch-target: 44px;
}

/* Breakpoints (use literally in media queries):
   900px  collapse button groups / nav into dropdowns
   800px  stack side-by-side sections into one column
   700px  tighten page padding */
```

### 6.2 Base styles using the tokens

```css
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-serif);
  font-size: var(--font-size-body);
  line-height: var(--leading-body);
}
button, input, select, textarea { font: inherit; }

.page-title {
  margin: 0;
  font-size: var(--font-size-title);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-title);
  text-transform: uppercase;
  color: var(--color-heading);
  text-align: center;
  line-height: var(--leading-tight);
}
.page-title::after {
  content: "";
  display: block;
  width: var(--title-rule-width);
  height: var(--title-rule-height);
  margin: 6px auto 0;
  border-radius: var(--radius-xs);
  background: var(--color-accent);
}

.eyebrow {          /* = app's section title */
  margin: 0;
  font-size: var(--font-size-label);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-section);
  text-transform: uppercase;
  color: var(--color-label);
}
```

---

## 7. Portfolio Application: christophermpalmer.com

Everything in this section is **[Proposed]** unless marked **[Existing]**. It applies the brand from Sections 1–6 to the portfolio and to the applications it hosts.

### 7.1 Overall feel

The portfolio should read like a well-set technical monograph. It should be white and calm, set in serif type, with navy for headings and the current state, slate hairlines for structure, and colour only where it means something.

The work itself supplies the vibrancy: running applications, charts, recordings and scores. The portfolio's own chrome stays quiet around them, just as the Pathfinding Visualizer's toolbar stays quiet around its grid.

### 7.2 Site structure

| Page | Suggested URL | Contents |
|---|---|---|
| Home | `/` | Introduction; featured Software Engineering and Data Science work; a clear path to Compositions (7.5). |
| Software Engineering | `/softwareengineering/` | Gallery of applications: Genetic Snake, Sorting Visualizer, Pathfinding Visualizer, JobPilot, and future work. |
| Data Science | `/datascience/` | Gallery of projects: FrequenSee, Philly Crime & Sports Analysis, the planned Alzheimer's predictive model, and future work. |
| Compositions | `/compositions/` | List of pieces; each links to a piece page with recording, program notes, score preview and downloads (7.10). |
| About | `/about/` | Biography, skills, résumé download, contact. |

**Hosted projects:**
- Each interactive project lives at its own stable URL, for example `/softwareengineering/pathfindingvisualizer/`. That URL **is the application**.
- The Pathfinding Visualizer is served on the portfolio at `/softwareengineering/pathfindingvisualizer/`. **[Existing]** Its original standalone deployment at `chrisp-bacon2024.github.io/pathfinding-visualizer/` is kept as well; the portfolio copy is built from the same repository, never maintained separately. The gallery link must go straight to the running app.

**Project types:**

| Type | Where the card leads |
|---|---|
| **Interactive application** (all Software Engineering apps, and any interactive data-science tool) | Directly into the working app (7.3). |
| **Analysis or report** (a data-science study presented as charts and text rather than an app) | Directly to the report itself. The report page *is* the project, not a description of it. |
| **Planned / in progress** (e.g. the Alzheimer's predictive model) | Nowhere until something exists to open. The card stays visible but isn't clickable, has a neutral "Planned" or "In development" badge, and shows no "Open" action. Don't create placeholder pages. |

### 7.3 Interactive projects open directly

Visitors must never pass through an intermediate description page to reach a working application.

**Gallery cards:**
- Clicking a card (or its title) opens the application itself, in the same tab, so the browser's Back button returns to the gallery.
- The card carries everything a description page would have said, in brief: a one-sentence summary, technology tags and a status badge.
- Secondary links on the card are optional and never required:
  - **"Source"** (GitHub, marked as external with `↗`);
  - **"Write-up"**, if a longer article exists.

**Inside the application:**
- Any context the visitor needs lives in the app. Use the shared portfolio bar (7.4) for navigation and links, and, if helpful, an "About this project" panel or tooltip within the app's own UI.
- The Pathfinding Visualizer's algorithm tooltips are an **[Existing]** example of in-app explanation.

**Technical requirements:**
- **Deep links:** every app works when opened directly by URL, refreshed, or shared.
- **Fast first paint:** the app's title and the portfolio bar should render immediately.
- **Loading states:** apps that take time to load (e.g. a model or a large dataset) show a branded loading state: a centred serif title with the sky rule, and a short status line in slate-500 such as "Loading model…".
- **Unusable on small screens:** if an app genuinely can't work at small sizes, show a short message in brand style ("This application needs a wider screen") with a link back to the gallery, rather than a broken layout.

### 7.4 Navigation and the shared portfolio bar

There are two navigation surfaces with the same identity: the **site header** on portfolio pages, and the slimmer **portfolio bar** on top of each hosted application.

#### Main navigation (site header)

| Part | Spec |
|---|---|
| Items, in order | **Home · Software Engineering · Data Science · Compositions · About**. The order and labels are the same on every page. |
| Bar | White, `padding: 12px 20px`, `border-bottom: 1px solid #cbd5e1`, no shadow. Optional `position: sticky; top: 0; z-index: 10` with a solid white background. |
| Wordmark (left) | "CHRISTOPHER M. PALMER": bold, uppercase, `letter-spacing: .08em`, navy, 18–20px, with a 32px × 3px sky rule beneath, left-aligned. Links to Home. |
| Links | Section-title style: 13px, bold, uppercase, `.06em` tracking, slate-600, 6px gaps, `padding: 8px 12px`, 6px radius. |
| Link hover | Slate-100 background. |
| Current section | The **[Existing]** selected-button treatment (navy background, sky border, white text) plus `aria-current="page"`. Project pages and apps highlight their parent section. |
| At 900px or narrower | The links collapse into the dropdown pattern (4.5). The trigger shows the current section name and a `▾` caret. The menu is a white surface with an 8px radius and the float shadow. |

#### Portfolio bar (inside applications)

A compact strip that gives every hosted app consistent branding and a way home, **without restyling the app beneath it**.

- **Height:** 40px. White background with a 1px slate-300 bottom border. It uses the brand tokens and serif type, even when the app uses something else (7.8).
- **Left:** a small wordmark (12px, bold, uppercase, `.08em` tracking, navy) linking to Home, then a breadcrumb in 13px slate-500, e.g. `Software Engineering / Pathfinding Visualizer`. The section name links to its gallery.
- **Right:**
  - optional "Source ↗" and "About this project" links;
  - a compact menu button (`▾`) that opens the full main navigation as a dropdown (4.5).
- **At 700px or narrower:** show only the wordmark and the menu button.

**Integration rules:**
1. **One snippet for every app.** Ship the bar as a single, self-contained snippet: a small HTML fragment plus `portfolio-bar.css`, optionally as a Web Component (`<portfolio-bar section="softwareengineering" project="Pathfinding Visualizer">`). Every app includes the same snippet, whatever framework it is built with.
2. **No style leakage.** Prefix every class with `pf-` (or use Shadow DOM), and don't ship global resets. The bar must not change the app's fonts, colours or layout, and the app's CSS must not change the bar.
3. **Fit the app around the bar.** The app reserves the bar's height. Full-viewport apps such as the Pathfinding Visualizer, whose root is `height: 100vh`, change to `height: calc(100dvh - var(--pf-bar-height, 40px))`. This is the only change an existing app should need.
4. **Leave app interfaces alone.** Apps keep their existing toolbars, controls, interaction models and visualization colours. Align them with the brand where it's cheap and harmless (the navy selected state, 1px slate borders, 6px radii), but never at the cost of an app's specialized UI.

### 7.5 Homepage

The homepage puts Software Engineering and Data Science first, and gives Compositions a clear but secondary path.

1. **Hero** (centred, mirroring the app header):
   - the name as a display title (uppercase navy, sky rule);
   - one line naming the focus, e.g. "Software engineering and data science", in 18px slate-600;
   - a short paragraph in body text (at most 60ch);
   - two equal buttons: **Software Engineering** (navy primary) and **Data Science** (white secondary);
   - a quiet text link beneath: "Also a composer — listen to my compositions →".
2. **Software Engineering** band:
   - an eyebrow ("SOFTWARE ENGINEERING"), a one-sentence intro, then 3 featured cards (7.6) that open their apps directly;
   - a "View all software engineering →" link at the end.
3. **Data Science** band: the same structure and visual weight as the Software Engineering band.
4. **Compositions** band (deliberately lighter, but clearly visible):
   - an eyebrow ("COMPOSITIONS") and a one-sentence intro;
   - one featured piece shown with the embedded audio player (7.9);
   - an "Explore compositions →" button in the default white style.
5. **About** teaser: two or three sentences, a link to About, and contact links.

The bands are separated by 48–64px of space and a 1px slate-200 rule, never by coloured backgrounds. Use the same card component for both disciplines, so neither looks like an afterthought.

### 7.6 Galleries and project cards

The Software Engineering and Data Science galleries share one layout:
- the page title (uppercase navy, sky rule) and a short intro;
- an optional filter bar: toggle buttons, with selected = navy and `aria-pressed`, collapsing into a dropdown at 900px or narrower;
- the card grid: 3 columns, 2 at 900px or narrower, 1 at 700px or narrower, with 20–24px gaps.

**Card anatomy** (builds on the card in 4.11):
1. **Thumbnail** (7.9) at the top, inside the card's 8px radius, with a 1px slate-200 rule beneath.
2. **Title:** 18px, bold, navy.
3. **Summary:** one sentence, 15–16px, slate-700.
4. **Tags:** neutral pills for the stack (e.g. "JavaScript", "Canvas", "Python").
5. **Status badge:**
   - "Live" uses the positive green variant;
   - "In development" and "Planned" use the neutral variant;
   - never use colour alone; the badge text carries the meaning.
6. **Actions row:**
   - the primary action is the whole card, labelled with a visible "Open app →" (or "Read analysis →" for reports);
   - secondary text links (Source ↗, Write-up) sit beneath.
7. **Accent sliver** (optional): 4px along the bottom edge, in the project's own colour (7.7).

**Accessible card link pattern:** the title is the real `<a>`, stretched over the card with a `::after` overlay. Secondary links sit above that overlay (`position: relative; z-index: 1`) so they stay independently clickable and focusable. Avoid nesting interactive elements.

**Planned projects:** same card, but with a neutral placeholder thumbnail (slate-100 with the project name in slate-500 serif), a "Planned" badge, no actions and no hover lift. They stay at full opacity because they are information, not disabled controls.

### 7.7 Project colours and visualization palettes

- **Every project keeps its own visualization colours.** A project's charts, maps and canvases use whatever palette suits its data.
  - The Pathfinding Visualizer's terrain and algorithm colours (Section 8) belong to that app alone.
  - Genetic Snake, the Sorting Visualizer, FrequenSee and the others should **not** adopt those algorithm colours or any other arbitrary portfolio-wide palette.
- **The chrome around a project stays brand.** Navy, slate, white and serif apply to the portfolio pages, the portfolio bar, cards and buttons, whatever colours the project uses inside.
- **Card accents come from the project.** If a project has a recognisable signature colour from its own interface, use it as the card's 4px accent sliver or a 9px dot (with the hairline outline from 5.2). If a project has none, leave the card neutral rather than inventing one.
- **Default chart palette** (only for portfolio content pages, or for a project with no palette of its own):

| Need | Colours |
|---|---|
| One series | Navy `#284a63` |
| Context or comparison series | Slate-400 `#94a3b8` or slate-500 `#64748b` |
| Highlight or annotation | Navy at a heavier weight, or warning amber `#f59e0b` only when it means "attention" |
| Semantic good / bad | Success green `#15803d` and warning amber, only with those meanings |
| More than three categories | A documented colour-blind-safe categorical palette (for example Okabe–Ito), plus labels or direct annotation |

- **Graphics need contrast too.** Chart lines, markers and bars need at least 3:1 contrast against their background (WCAG 1.4.11). Sky `#65b5e8` (2.25:1) and slate-300 can't carry data on white; use them only for gridlines and decoration.

### 7.8 Typography across the portfolio and its applications

- **Default:** serif (`--font-serif`) for everything the portfolio controls: pages, navigation, the portfolio bar, cards, buttons, form controls, program notes and captions. Monospace only inside code blocks.
- **Justified exceptions** are allowed **only inside a specialized application interface**:
  1. **Dense data displays:** dashboards, wide tables, small chart labels or numeric readouts below about 12px, where a sans-serif or tabular face is measurably easier to read. Use the system sans stack `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
  2. **Code, logs and fixed-width data:** `--font-mono`.
  3. **Embedded third-party components:** for example a notebook viewer, a chart library's built-in labels, or a map widget, when overriding their fonts would be fragile.
  4. **Music notation:** engraving fonts in score previews and PDFs (e.g. Bravura or the notation software's defaults) are part of the music, not the UI. Never override them.
  5. **An existing app's established interface:** an app built before these guidelines may keep its typography if changing it would mean redesigning the app.
- **Conditions for any exception:**
  - it stays inside the app's own content area;
  - the portfolio bar, page titles and navigation remain serif;
  - only one alternative family is added (in addition to monospace);
  - the reason is noted in the project's README or style notes.

### 7.9 Media conventions

#### Project thumbnails
- **Content:** a real capture of the working interface, not a mock-up or device frame. Show the most characteristic state, e.g. paths drawn across terrain rather than an empty grid.
- **Size and format:**
  - 16:10 ratio; export at 1200×750px and display at up to 600×375px;
  - WebP or AVIF with a PNG/JPEG fallback;
  - `loading="lazy"`, plus `width`/`height` attributes to prevent layout shift.
- **Consistency:** capture every app at 100% zoom in the same viewport (e.g. 1440×900) and light mode, then crop to the central working area.
- **Text:** no text overlays, badges or logos baked into the image; the card provides all text.
- **Alt text:** describe what the image shows ("Pathfinding Visualizer comparing three algorithm paths across mud and road terrain"), not "screenshot".

#### Card previews (moving thumbnails)
A project card's thumbnail may be a short **card preview**: a silent loop of the real app working (for example A* searching a grid, or a snake run). This is the one exception to "no autoplay" in 7.13 and 7.14, under these conditions:
- **Silent and calm:** no audio track. It shows one complete action (for example a search from start to path, or one whole run) and loops by cutting straight back to the start, with no fade.
- **Slow, and the same length on every card:** film the app at one of its slower speeds so the cards don't pull focus when the page opens, and make every preview the same length, about 22 seconds (`CLIP_SECONDS` in the recipes). A preview that finishes early holds on its result until it reaches that length. Slow the app down rather than slowing the video, which would make the motion jerky.
- **Recorded from the real app**, never a mock-up, with `npm run previews` (scripts/preview-recipes.mjs). Re-record after a visual change to the app.
- **Same frame as a still thumbnail:** 16:10, the app's characteristic working area, no text overlays. Video at 800×500 (WebM, plus MP4 as a fallback); a 1200×750 WebP `poster`.
- **Plays only while visible:** it starts when at least half of it is on screen, and stops when it scrolls away or the tab is hidden.
- **Reduced motion:** with `prefers-reduced-motion: reduce` it never starts on its own; the poster shows.
- **Pause control:** a visible pause/play button on every preview (WCAG 2.2.2), labelled with the project ("Pause Genetic Snake preview"), above the card's stretched link so it stays its own control.
- **Light:** `preload="none"`, so nothing downloads until it is about to play; under about 1 MB per file.
- **Accessible name:** the alt text above goes on the video (`role="img"` with `aria-label`).

#### Application screenshots (in write-ups, About, reports)
- **Style:** full-width figures, `border: 1px solid #cbd5e1`, 6px radius, no drop shadow or device frame (flat, like the brand).
- **Captions:** 13px, slate-500, italic, 6px below the image.
- **Annotations:** navy outlines or numbered markers with a white fill, explained in the caption.
- **Motion:**
  - prefer muted, looping MP4/WebM with a `poster` frame over large GIFs (card previews, above, follow their own rules);
  - don't autoplay when `prefers-reduced-motion: reduce` is set;
  - always provide a visible play/pause control.

#### Embedded audio players
- **Base:** the native `<audio>` element (`preload="metadata"`, never `autoplay`), progressively enhanced with a branded control strip.
- **Container:** a card with a 1px slate-300 border, 8px radius and `padding: 10px 12px`.
- **Controls:**
  - 44px play/pause icon button (as in 4.8) with an `aria-label` that changes with the state;
  - piece title in serif (bold, navy) with performer or recording credit in 13px slate-500;
  - a scrubber built from the range slider (4.7, `accent-color: #334155`);
  - current time / duration in 12px slate-500 with `tabular-nums`.
- **Behaviour:**
  - starting one player pauses any other on the page;
  - Space or Enter on the focused play button toggles playback;
  - the scrubber responds to arrow keys.
- **Formats:** MP3 for universal support, optionally Opus or OGG as an extra `<source>`.
- **Below the player:** show the duration and a "Download recording (MP3, 6.4 MB)" link (see downloads).
- **Mobile:** the player spans the full width at 700px or narrower; controls keep 44px touch targets.

#### Sheet music previews
- **Default preview:** show page 1 (optionally pages 1–2) as a high-resolution image, at least 1600px wide so noteheads stay crisp.
- **Paper look:** white page, `border: 1px solid #cbd5e1`, no radius (paper has square corners), and the float shadow `0 8px 24px rgba(15, 23, 42, .18)` sparingly to suggest a sheet.
- **Page ratio:** keep the real page ratio (Letter 8.5:11 or A4); never crop staves.
- **Interaction:**
  - clicking opens an accessible, full-screen viewer with keyboard paging, Escape to close, and pinch-zoom allowed (don't set `touch-action: none`);
  - the viewer also links to the full PDF.
- **Alt text:** e.g. "First page of the score of <title>, for <instrumentation>". Essential facts (instrumentation, duration, year) also appear as page text, never only inside the image.

#### Downloadable scores and recordings
- **Buttons:** default white buttons, with the format and size in the label, e.g. "Download score (PDF, 1.2 MB)" and "Download parts (PDF, 3.4 MB)". Optionally add a ⬇ icon, with the label still describing the action.
- **File names:** consistent and descriptive, e.g. `Palmer_<Title>_Score.pdf`, `Palmer_<Title>_Parts.pdf`, `Palmer_<Title>_<Performer>.mp3`.
- **Links:** use the `download` attribute for files served from the site.
- **PDFs:**
  - prefer tagged PDFs with document title metadata where the notation software supports it;
  - include a copyright or licence line on the piece page and in the PDF.
- **Résumé:** offer it on About using the same convention: "Download résumé (PDF, 120 KB)".

### 7.10 Compositions section

**Compositions index:**
- a list (not a card grid), since pieces are browsed by title and instrumentation;
- each row shows: title (bold, navy) · instrumentation · year · duration (tabular), separated by slate-200 rules, with an inline 44px play button when a recording exists;
- an optional filter bar for instrumentation or ensemble type.

**Piece page:**
1. **Title:** uppercase, navy, with the sky rule.
2. **Metadata row:** the **[Existing]** toolbar-section pattern, with titled groups (INSTRUMENTATION · DURATION · YEAR · PREMIERE / PERFORMERS) separated by vertical hairlines. At 800px or narrower they stack with top hairlines.
3. **Recording:** the audio player.
4. **Program notes:** body text in a 68ch column, 17–18px, line height 1.6. These are the composer's own words, presented as prose.
5. **Score preview and downloads.**

**Style:** the music pages use exactly the same brand as the technical pages. The serif identity is especially at home here, so no separate "artistic" style is needed.

### 7.11 About page and footer

**About:**
- an optional portrait (square, 6px radius, 1px slate-300 border);
- a biography in a 68ch column;
- the skills summary as toolbar-style groups (SOFTWARE ENGINEERING · DATA SCIENCE · MUSIC), each an eyebrow over neutral pills, separated by vertical hairlines;
- the résumé download;
- contact links.

**Footer** (identical on every portfolio page; not shown inside apps, where the portfolio bar takes its place):
- a 1px slate-300 top border, `padding: 24px 20px`, centred;
- the wordmark (12px, bold, uppercase, `.08em`, navy) with a short sky rule;
- the five main navigation links repeated in 13px slate-500, plus GitHub, LinkedIn and email; hover turns them navy;
- a copyright line in 12px slate-400 (decorative contrast; repeat any essential information elsewhere);
- no dark footer band: the site stays white from top to bottom.

### 7.12 Responsive design

- **Breakpoints:** keep the **[Existing]** 900 / 800 / 700px breakpoints:

| Width | Navigation and filters | Toolbar-style groups | Grids | Page padding |
|---|---|---|---|---|
| 900px or narrower | Collapse into dropdowns | Side by side | Card grids drop to 2 columns | 20px |
| 800px or narrower | Collapsed | Stack in one column with top hairlines (metadata rows, skills) | 2 columns | 20px |
| 700px or narrower | Collapsed | Stacked | Card grids go to 1 column | 10–16px |

- **Content width:** `max-width: 1100px`, text columns `68ch`.
- **Viewport:** every page and app needs `<meta name="viewport" content="width=device-width, initial-scale=1">`. Use `100dvh` rather than `100vh` for full-height app layouts, so mobile browser toolbars don't hide content.
- **Applications:** each app owns its responsive behaviour (the Pathfinding Visualizer's dropdowns and stacked toolbar are **[Existing]** examples). The portfolio bar adapts independently (7.4). Apps that can't work at small sizes show the branded message from 7.3.
- **Media:** serve thumbnails and screenshots with `srcset`/`sizes`. Score previews fit the width and allow pinch-zoom. Audio players span the full width on phones.
- **Touch:**
  - use Pointer Events for drawing surfaces, as the **[Existing]** visualizer does;
  - interactive targets need at least 44×44px of hit area;
  - hover-only information must also be available on tap or focus, as the visualizer's long-press tooltips already allow.

### 7.13 Accessibility

- **Structure:**
  - landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page and logical heading order;
  - `lang="en"`;
  - a "Skip to content" link as the first focusable element on every page, including inside the portfolio bar of each app.
- **Navigation:** the same order and labels everywhere; `aria-current="page"` on the current section; dropdown triggers with `aria-expanded` and `aria-haspopup`; Escape closes menus.
- **Focus:** the visible `:focus-visible` ring from 4.10 on all portfolio surfaces, including the portfolio bar. Never remove outlines without a replacement.
- **Colour and contrast:**
  - follow 2.5;
  - status, selection and project accents are never conveyed by colour alone;
  - charts meet 3:1 for graphical elements and label series directly where possible.
- **Images:** meaningful alt text for thumbnails, screenshots and score previews. Decorative imagery uses `alt=""`.
- **Audio and video:**
  - no autoplay (except silent card previews; see 7.9);
  - labelled, keyboard-operable controls with a visible focus state;
  - program notes and metadata give text context for recordings;
  - spoken or narrated video needs captions.
- **Motion:** respect `prefers-reduced-motion` in portfolio transitions and media. Apps with animation should offer pause controls (the visualizer's playback controls are an **[Existing]** example).
- **Forms and contact:** visible labels (not placeholders alone) and error text in the warning colour with an icon or text cue.
- **Downloads:** state the format and size; prefer accessible (tagged) PDFs.
- **External links:** mark them with a visible `↗` and include it in the accessible name, e.g. "Source on GitHub (opens external site)".

### 7.14 Dos and don'ts

**Do:**
- open interactive projects directly into the working app;
- put the shared portfolio bar on every hosted app;
- use the five-item navigation (Home · Software Engineering · Data Science · Compositions · About) everywhere, in the same order;
- give Software Engineering and Data Science equal prominence on the homepage, with a clear path to Compositions;
- keep serif as the default typeface, documenting any exception inside an app;
- let each project keep its own visualization palette;
- use navy as the only interface emphasis colour and sky only as a thin accent;
- separate groups with hairlines, not filled panels.

**Don't:**
- create intermediary "project overview" pages that stand between a visitor and an app;
- restyle a specialized app interface just to match the portfolio;
- spread one project's colours (such as the visualizer's algorithm colours) across other projects or the chrome;
- introduce a sans-serif for portfolio headings, navigation or buttons;
- use the legacy bright `#2563eb` blue or gradients;
- use sky `#65b5e8` or slate-400 for meaningful text;
- add shadows to flat elements;
- autoplay audio or video (silent card previews, 7.9, are the only exception);
- design a dark mode first. **[Proposed, optional]** If you add one later, invert the surfaces (slate-900 background, slate-100 text) and keep navy for selection with a sky border, but keep light mode as the canonical brand.

---

## 8. Project Visualization Palette: Pathfinding Visualizer (example)

**[Existing]** These colours belong to the Pathfinding Visualizer's canvas and data encodings. They are **not** brand colours and **not** a portfolio-wide data palette.

They are documented here for two reasons:
1. so the visualizer keeps them unchanged when it is hosted on the portfolio;
2. as a worked example of a project-owned palette.

Each project keeps its own visualization colours (7.7). Other projects should not adopt these algorithm or terrain colours.

### 8.1 Terrain

Each terrain type picks one shade per cell, using smoothed value noise over the grid position. This gives organic patches instead of a flat fill.

| Terrain | Shades (light variation) | Meaning |
|---|---|---|
| Grass | `#65c98b`, `#78e69e`, `#86efac`, `#a1f3be` | Default walkable ground (cost 2). |
| Mud | `#92400e`, `#a64b0b`, `#b45309`, `#c66a22` | Slow ground (cost 5). |
| Road | `#5c6267`, `#62686d`, `#696f74`, `#70767b` (fallback `#656b70`) | Fast ground (cost 1). Has a centred 2×6px dash in `rgba(235, 235, 235, 0.45)`. |
| Wall | `#171717`, `#222222`, `#2c2c2c` | Impassable. |
| Start | fill `#16a34a`, border `#14532d` | Start point. |
| End | fill `#dc2626`, border `#991b1b` | Destination. |

Cells are 25px squares. By default, each cell's border is drawn in its own fill colour, so the grid reads as continuous terrain rather than graph paper.

### 8.2 Search states (translucent overlays on terrain)

| State | Fill | Opacity | Border | Border width |
|---|---|---|---|---|
| Scanned (examined in passing) | `#8b7bc8` | 0.22 | `#8b7bc8` | 0.75px |
| Frontier (queued) | `#3b82f6` | 0.25 | `#2563eb` | 3px |
| Visited (expanded) | `#06b6d4` | 0.12 | `#0891b2` | 0.75px |
| Path | none: drawn as a line instead (8.4) | | | |

Overlays are never drawn over walls, the start or the end.

### 8.3 Pointer interactions on the canvas

| Interaction | Style |
|---|---|
| Hover over a paintable cell | fill `#ddd`, border `#888`, 2px |
| Hover over a draggable cell (start/end) | border `yellow`, 3px |
| Dragging | border `orange`, 3px |

### 8.4 Path lines

- Each path is a polyline through cell centres with round caps and joins.
- Every line gets a dark outline first, `rgba(15, 23, 42, 0.75)`, 2px wider than the colour line. All outlines are drawn before any colours, so no outline covers another path.
- Line width is `max(1.5px, min(0.16 × cell, 0.7 × lane spacing))`.
- When several paths are shown, they become parallel "transit-map" lanes with spacing `min(0.8 × cell / n, 0.24 × cell)`, offset symmetrically around the cell centre with mitred joins.

### 8.5 Categorical data colours (one per series / algorithm)

| Series | Hex | Series | Hex |
|---|---|---|---|
| 1 (DFS) | `#f97316` orange | 6 (Bidirectional BFS) | `#22d3ee` cyan |
| 2 (BFS) | `#facc15` yellow | 7 (JPS) | `#3b82f6` blue |
| 3 (Dijkstra) | `#ec4899` pink | 8 (Bellman-Ford) | `#ffffff` white, needs an outline |
| 4 (A*) | `#ef4444` red | 9 (Theta*) | `#a3e635` lime |
| 5 (Greedy) | `#a855f7` violet | | |

How they appear in the UI:
- **On buttons:** as the 4px bottom sliver (`--path-color`), faded to 30% via `color-mix` when the series is hidden.
- **In menus:** as 7px dots.
- **In tables:** as 9px swatches.

All three always carry the hairline outline `0 0 0 1px rgba(15, 23, 42, .55)`, so light colours (yellow, white, lime) stay visible on white.

The 4px coloured strip on the buttons, which the app calls the "sliver", is the **[Existing]** source of the card accent sliver proposed in 4.11 and 7.6. The portfolio reuses the *technique*, not these particular colours.

**[Proposed]** The Pathfinding Visualizer's gallery card accent should be a colour from this app's own palette. Grass green `#65c98b` is the most recognisable choice, since the map is mostly grass. Other projects take their accents from their own interfaces, or have none (7.7).
