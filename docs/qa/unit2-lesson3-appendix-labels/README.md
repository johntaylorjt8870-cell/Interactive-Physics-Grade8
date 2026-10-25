# QA — probe callout labels in the Unit 2 · Lesson 3 appendix bench scene

Real-browser record for the «المجس الأحمر / المصباح» label-overlap fix.

## Environment

- Headless Chromium 131 (`playwright-core` + `@sparticuz/chromium`, NSS libs from
  the package's `al2023.tar.br`, `LD_LIBRARY_PATH` — the routine documented in
  `README.md`). First-party fonts (`vendor/fonts`, `src/fonts.css`) were served
  normally, so the glyph widths are the ones students see.
- Server: `npm run build`, then `python3 -m http.server 4173 --bind 0.0.0.0
  --directory dist` (they serve `dist/`, the production build).
- Viewports: **1366×768** and **1440×900** at `deviceScaleFactor: 1` for the
  stage captures; the zoom crops use `deviceScaleFactor: 3` on the same layout.

## Files

| File | What it shows |
| --- | --- |
| `before-meaning-stage-1366x768.png`, `before-meaning-stage-1440x900.png` | station 1 before: the red pill with its text running outside it, and «المصباح» pressed under it |
| `after-meaning-stage-1366x768.png`, `after-meaning-stage-1440x900.png` | station 1 after |
| `before-probes-stage-1366x768.png`, `before-probes-stage-1440x900.png` | station 2 before (default probes on B/C) |
| `after-probes-stage-1366x768.png`, `after-probes-stage-1440x900.png` | station 2 after |
| `before-potentials-stage-1366x768.png`, `before-potentials-stage-1440x900.png` | station 4 before (probes on A/C) |
| `after-potentials-stage-1366x768.png`, `after-potentials-stage-1440x900.png` | station 4 after |
| `after-sum-stage-*.png`, `after-sum-parallel2-stage-1366x768.png` | station 5 series and parallel benches after (no probes drawn there) |
| `after-detective-viewport-*.png` | station 6 probe question after |
| `before-zoom-meaning-lamp.png` / `after-zoom-meaning-lamp.png` | 3× crop of the same scene region: text outside the pill and the lamp label underneath vs. text inside the pill and a clear gap |
| `before-zoom-probes-bench.png` / `after-zoom-probes-bench.png` | 3× crop of station 2: the red pill and «المصباح الأول» |

## Measurements (Chromium, DOM geometry, not eyeballed)

Text box of the pill label vs. its own pill, at 1366×768:

| Scene | Before (left spill / right spill, px) | After (left / right, px) |
| --- | --- | --- |
| station 1 «المجس الأحمر» | 7.2 / 6.3 | 8 / 9 inside |
| station 1 «المجس الأسود» | 7.0 / 7.0 | 8.2 / 8.2 inside |
| station 2 / 4 (same marks) | 7.7 / 7.3 | 8.5–9.3 inside |

- Before, station 1's red pill also intersected the «المصباح» text box.
  After, the nearest pill edge to that label is 59.9 px horizontally and
  42.3 px vertically.
- Fallback-font stress test (`*.woff2` blocked, even though both files exist):
  the widest label (`المجس الأسود`, 77.4 px) still stays inside the 84-unit
  pill, with ≥ 1 px slack on each side.

## Full sweep (no new overlaps)

Every station was opened at both viewports and every text box inside each bench
scene was compared with every other text box and with every probe pill —
**14 scenarios, 0 overlaps** (station 1, 2, 3, 4, 5, 6, 7 at 1366×768 and
1440×900). Station 2 was additionally exercised by selecting **all 30 ordered
probe pairs** (`A…F` × `A…F`, both arms) and re-scanning after each redraw:
0 overlaps, 0 label spills.

## Behaviour and console

- Station 2: default reading `4` at B/C (6 V, shares 4 + 2); moving the black
  probe to D gives `6`; opening the switch and the deliberately wrong series
  connection still read `6`; «أضف القراءة» adds one table row; «إعادة الضبط»
  returns to `4`.
- Station 1: `—` before measuring, `4.5` after «اقس فرق الكمون بين طرفي
  المصباح», `0` after opening the switch.
- Station 6 probe question `dt1`: clicking two measurement points still places
  the red and the black probe, both pills render, and «تحقّق» gives its normal
  verdict.
- Identical outputs before and after the change (station 1 and 2 run against the
  unmodified `HEAD` build on port 4174 and the new build on port 4173).
- Console: **0 errors, 0 warnings, 0 page errors, 0 failed requests, 0 non-2xx
  responses** at both viewports (`before` and `after` runs).

## Hit-testing (unchanged before/after)

`document.elementFromPoint` on the centre of every measurement dot: the only
nodes that do not receive the click are the ones already holding a probe (the
probe group is drawn above the nodes). This is the same on the unmodified build
and is not part of this task; the nodes are still reachable with the dropdowns
and the keyboard, which is how the QA script and the checks above drive them.

## Project checks

- `npm test` — 317 tests, 308 pass, 0 fail, 9 skipped (jsdom-only DOM run).
- `npm run build` — `Production static build written to dist/.`
- `node scripts/qa-unit2-lesson3.mjs` (against `dist/` on port 4173) —
  `Unit 2 Lesson 3 browser QA passed: 876 checks.` The script rewrites the
  screenshots under `docs/qa/unit2-lesson3/`; those regenerated artefacts were
  reverted so this PR carries only the appendix-label change.
