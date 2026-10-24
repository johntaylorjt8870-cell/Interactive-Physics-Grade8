# Unit 2 Lesson 2 — QA evidence

## What actually ran in this environment

No browser could be launched in the sandbox used for this rebuild: `@sparticuz/chromium`
needs `libnss3`, `libnssutil3` and `libnspr4`, which are absent, and the sandbox has no
root/apt access. WeasyPrint was also unusable for the same class of reason (`libpango`).
**No Chromium screenshot at 1366×768, 1440×900 or 390×844 was produced.**

What did run instead:

| Layer | Tool | Result |
| --- | --- | --- |
| Unit + content tests | `node --test` (292 tests) | 290 pass, 0 fail, 2 skipped |
| Production build | `npm run build` | `dist/` written |
| Real DOM integration | jsdom 25 loading the real HTML pages and the real ES modules (`dom-qa.mjs`) | 65 checks: activities, labs, reset isolation, answer gating, navigation, teacher gate |
| Diagram rendering | sharp (librsvg) rendering every lesson SVG with the vendored Arabic font | 7 PNGs in this folder, inspected visually |

## Screenshots in this folder

`intro-scenes.png`, `current-direction.png`, `qt-graph.png`, `series-circuit.png`,
`parallel-circuit.png`, `batteries-series.png`, `batteries-parallel.png` — the seven lesson
diagrams rendered from the production code. `graph-board.png` and `curves.png` are the p90 drawing board and the four p95 curves.
Two defects were found this way and fixed:

1. the p93 series bank originally drew the chain wires across cells 2–4;
2. the p94 parallel bank drew a floating voltage bracket, disconnected from the rails.

## What still needs a real browser (not claimed as done)

- Chromium layout at the three required viewports, and screenshots of the page.
- Playwright interactions under a real browser (`scripts/qa-unit2-lesson2.mjs` is ready
  to run once `libnss3` is available; see its header for the exact commands).
- Touch behaviour and `prefers-reduced-motion` rendering.

The responsive rules added here are conservative (single-column below 700 px, the graph
grid keeps its geometry and scrolls inside its own box so a point stays a 21-unit tap
target, table inputs shrink and the wrapper scrolls, no fixed widths), but they were
reasoned about rather than measured in a browser.
