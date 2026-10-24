# Unit 2 Lesson 2 — QA evidence

## What actually ran

A real Chromium **does** run in this sandbox. `@sparticuz/chromium` ships
`/tmp/chromium`, which needs `libnss3`, `libnssutil3` and `libnspr4`; none of them is
installed and there is no root/apt access, so the three libraries were rebuilt as
ABI-compatible stubs (`gcc -shared -fPIC … -Wl,--version-script=…`, symbols taken from
`readelf -V /tmp/chromium`) and exported through `LD_LIBRARY_PATH`. Chromium's old
`--dump-dom` mode hangs in this environment, but **Playwright (headless) drives it
normally**, so every number below comes from a real browser engine.

`playwright-core` and `@sparticuz/chromium` are installed **outside** the repository
(no `package.json` change); the script finds them through `QA_MODULE_DIR`.

```bash
npm run build
python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
QA_MODULE_DIR=/tmp/qa/node_modules LD_LIBRARY_PATH=/tmp/nssstub \
  node scripts/qa-unit2-lesson2.mjs
```

| Layer | Tool | Result |
| --- | --- | --- |
| Unit + content tests | `node --test` | **292 tests: 290 pass, 0 fail, 2 skipped** |
| Production build | `npm run build` | `dist/` written |
| Browser QA against `dist/` | `scripts/qa-unit2-lesson2.mjs` (Playwright + real Chromium) at **1366×768, 1440×900, 390×844** | **129 checks, 0 failures** (`browser-results.json`: 43 checks per viewport) |
| Real DOM integration (earlier layer) | jsdom 25 on the real pages/modules (`dom-qa.mjs`) | 65 checks |
| Diagram rendering | sharp (librsvg), vendored Arabic font | 7 diagram PNGs in this folder |

`browser-results.json` records the base URL, the per-viewport check counts and an empty
failure list. Each run asserts: no JS errors, no failed requests, no response ≥ 400, no
`katex-error`, no unintended horizontal page scroll, navigation, per-activity grading,
per-activity reset, answers not requested before an attempt, teacher gate with a wrong and
a correct password plus logout.

## Screenshots in this folder

**Real Chromium screenshots** (`lesson-*`, `labs-*`, `activities-*`, `teacher-*` at the
three viewports) — first screen of each section, produced by the QA script.

**Targeted Chromium screenshots** taken during the visual review of the fixes of this
round, at 1366 and 390: `current-lab-loop-*`, `circuit-lab-series-*`,
`circuit-lab-parallel-*`, `curves-cards-*`, `graph-board-mobile-check-*`, `p89-figure-*`.

**Earlier sharp renders**: `intro-scenes.png`, `current-direction.png`, `qt-graph.png`,
`series-circuit.png`, `parallel-circuit.png`, `batteries-series.png`,
`batteries-parallel.png`, `graph-board.png`, `curves.png`.

## Defects found by looking at the screenshots, and fixed

1. **p91 current lab** drew the lamp, the generator and the current arrows outside the
   closed loop. Rebuilt so each element sits on the loop with the wire stopping at it
   (`src/unit2-lesson2-simulation.js`).
2. **p93 circuit lab drew both canvases at once**. `hidden` is an HTML attribute and does
   nothing on an SVG `<g>`, so the series and the parallel drawings were painted on top of
   each other. The inactive canvas now carries `.is-hidden` as well.
3. **Circuit drawings were illegible** in the narrow two-column layout at 1366 (labels
   ≈6 px). Both labs now use the single-column wide layout, with the drawing first, the
   tools second and the conclusion last.
4. **Parallel canvas return wire** passed through the A₂ and L₂ symbols (it looked like a
   short circuit). Rerouted below the lower branch.
5. **p95 q3 curve choices** rendered as 940 px full-width rows with a 193 px text box.
   Now four drawn cards (`flex: 1 1 auto` on the copy, `auto-fit` grid).
6. **p90 graph board at 390 px** opened scrolled to the far right, hiding the q axis. The
   scroll box is now `direction: ltr` and says it scrolls; the axis of the origin is what
   the student sees first.
7. **Print symbols** in the p92/p93 diagrams now carry the book's subscripts
   (`A₁`, `L₁`, `A₂`) instead of `A1`, `L1`, `A2`.
8. **p90 reference line** described the printed bench image as a circuit drawing; it is a
   photo, and the reference now says so.

## Limits (not claimed as done)

- The book figures (not the lab canvases) are SVG scaled to the column width; at 390 px
  their internal labels render at roughly 7 CSS px. They are not clipped and do not
  overlap, but they are small. Enlarging them was tried and rejected in this round because
  the book's own tight label placement collides at larger font sizes.
- Chromium here is a headless shell build with software rendering (`--use-gl=angle`,
  `--use-angle=swiftshader`); no real phone, no real touch input and no OS-level font
  fallback were tested.
- `prefers-reduced-motion: reduce` was set in every context.
