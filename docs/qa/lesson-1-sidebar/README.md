# Lesson 1 — step rail on laptop screens

Scope: the step sidebar of `lesson-1.html` at the two laptop viewports **1366×768**
and **1440×900**, plus the guards for 1920×1080, 1024×768, 820×768 and 390×844.
Two files changed, both loaded by this page only (`src/lesson-1.css` and
`src/main.js`), plus a new DOM-free helper (`src/sidebar-reveal.js`) and two test
files. No content, interaction, teacher area or assessment was touched.

## The defect

The rail is a sticky flex column: intro + progress + eight step buttons + the
curriculum key. That stack is **849px** tall. `.lesson-sidebar` is
`position: sticky; top: 24px`, and `#page-nav` was `overflow-y: visible`, so:

| at 1366×768, rail stuck | before | after |
| --- | --- | --- |
| `.lesson-sidebar` box | `24..873` (**849px**, 105px past the window) | `24..744` (**720px**, inside) |
| `.sidebar-footer` (curriculum key) | `777..867` — **below the fold, always** | `647..738` — visible |
| `#page-nav` | `overflow: visible`, `506/506` not scrollable | `overflow: auto`, `scroll`s `444` in `377` |
| step 7 «الخلاصة وخريطة المفاهيم» | `756..809`, partly cut | reachable |
| step 8 «المسائل والتدريب الشامل» | `811..865`, cut | reachable, rail scrolled to `67` |
| button width | 256px | **256px** (unchanged) |

The eighth step and the key could only be seen by scrolling to the very bottom of
a 4583px page; `scrollY` stayed at `400` while measuring step 8, i.e. the rail was
pinned and still hid it.

## The fix

1. `src/lesson-1.css` — inside `@media (min-width: 821px)` only (below that the
   sidebar is `position: static` and sits in the flow):
   `max-height: calc(100vh - 48px)` (with a `100dvh` companion) on the rail,
   `flex: 0 0 auto` on the intro / progress / key so they never shrink, and
   `min-height: 0; overflow-y: auto; overscroll-behavior: contain` on the step
   list. No inline padding and no `scrollbar-gutter`: both would shift the RTL
   buttons and break the 256px measurement.
2. `src/sidebar-reveal.js` — `revealScrollTop(metrics)`, a pure function that
   decides whether the rail needs to scroll and where. DOM-free so it is unit
   tested with `node --test`.
3. `src/main.js` — `revealActiveStep()` runs after `renderNav()` and from a
   `resize` listener. It only ever assigns `#page-nav.scrollTop`; the window is
   still moved solely by the existing step-change scroll, and `scrollIntoView` is
   not used at all.

## What actually ran

```
npm test       → tests 333 | pass 324 | fail 0 | skipped 9
npm run build  → "Production static build written to dist/."
```

The 9 skips are the pre-existing jsdom-only checks; no dependency was added and
`package.json` is untouched.

Browser QA — real Chromium (`HeadlessChrome/153`) driven by
`scripts/qa-lesson-1-sidebar.mjs` (puppeteer-core + `@sparticuz/chromium`,
installed **outside** the repository; on minimal Linux Chromium needs the
NSS/NSPR libraries from that package's `al2023.tar.br`, exported through
`LD_LIBRARY_PATH`).

```bash
npm run build
python3 -m http.server 4174 --bind 0.0.0.0 --directory /tmp/before-site   # git archive HEAD
python3 -m http.server 4176 --bind 0.0.0.0 --directory dist               # after
QA_MODULE_DIR=<dir> QA_BASE_URL=http://127.0.0.1:4174 QA_PHASE=before \
  node scripts/qa-lesson-1-sidebar.mjs
QA_MODULE_DIR=<dir> QA_BASE_URL=http://127.0.0.1:4176 QA_PHASE=after \
  node scripts/qa-lesson-1-sidebar.mjs
```

| run | page | checks | failures |
| --- | --- | --- | --- |
| `browser-results-before.json` | pre-fix tree (`git archive HEAD`) | 63 | **6** |
| `browser-results-after.json` | built `dist/` (fixed) | 63 | **0** |

The 6 pre-fix failures are exactly the defect (steps 7 and 8 unreachable, the rail
out of the window, the key below the fold, the list not scrollable, no rail
scroll when the last step is reached). The same script passes every check
afterwards, so it is not vacuous: it fails on the code it was written to catch.

The two protection test files fail on the pre-fix tree as well (7/7), and pass
now (7/7 + 7/7).

### What the script asserts

- **1366×768** — no sideways page scroll; all eight steps exist and each becomes
  reachable *without* moving the window (the active step must sit inside both the
  list scrollport and the viewport); the pinned rail fits the window; the
  curriculum key stays visible; the list — not the window — scrolls to reach the
  last step; every button is exactly 256px; no rail label is clipped; changing a
  step still returns the reader to the step heading and reveals the new step.
- **1440×900 and 1920×1080** — the list does **not** scroll, all eight steps are
  reachable with `scrollTop === 0`, the rail fits, the key is visible, buttons are
  256px, labels unclipped.
- **820×768 and 390×844** — layout stays `static`, rail unbounded, step list keeps
  `overflow: visible`, no clipping.

### Pixel identity on the untouched sizes

Full-window screenshots at the same scroll position, compared by SHA-256 of the
PNG bytes:

| viewport | before vs after |
| --- | --- |
| 1440×900 | **identical** |
| 1920×1080 | **identical** |
| 820×768 | **identical** |
| 390×844 | **identical** |
| 1024×768 | differs — the defect existed there too (rail `24..895`, key `799..889` outside); now `24..744` with the key at `647..738` |
| 1366×768 | differs — this is the fix, above |

Note on 1024×768: it is a two-column layout (breakpoint 1080), so the same rule
applies and the key becomes visible; button width there stays 228px before and
after.

## Residual (measured, not hidden)

At `scrollY = 0` the rail is still below the top bar (`top: 112px`), so its
bottom lands at 832px and the last 64px of the curriculum key are below the fold
until the reader scrolls ~88px, at which point the rail pins to `top: 24px` and
the whole stack is visible. This is inherent to a sticky column that starts lower
than its sticky offset; shrinking the rail to fit at `scrollY = 0` would cost one
and a half visible steps for the whole lesson, so it was not done. Before the fix
the rail never fit at any scroll position.

## Files

```
docs/qa/lesson-1-sidebar/README.md                     this note
docs/qa/lesson-1-sidebar/browser-results-before.json   raw measurements, pre-fix
docs/qa/lesson-1-sidebar/browser-results-after.json    raw measurements, fixed
docs/qa/lesson-1-sidebar/{before,after}-1366x768.png   full window
docs/qa/lesson-1-sidebar/{before,after}-1366x768-sidebar.png   rail only
docs/qa/lesson-1-sidebar/after-1366x768-keyboard-focus.png     focus ring in the scrollport
docs/qa/lesson-1-sidebar/{before,after}-{1440x900,1920x1080,820x768,390x844}.png
scripts/qa-lesson-1-sidebar.mjs                        the reproducible run
```
