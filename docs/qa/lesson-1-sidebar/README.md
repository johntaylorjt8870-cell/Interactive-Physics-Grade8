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
3. `src/main.js` — `revealActiveStep()` runs after `renderNav()` and on layout
   changes. It only ever assigns `#page-nav.scrollTop`; the window is still moved
   solely by the existing step-change scroll, and `scrollIntoView` is not used at
   all. `fitRailToViewport()` measures the rail's space at every scroll position
   and publishes `--rail-max-height` (short windows only).

## What actually ran

```
npm test       → tests 339 | pass 330 | fail 0 | skipped 9
npm run build  → "Production static build written to dist/."
```

The 9 skips are the pre-existing jsdom-only checks; no dependency was added and
`package.json` is untouched. The two protection test files hold 11 + 9 tests, and
both fail on the pre-fix tree.

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
| `browser-results-before.json` | `main` before any fix | 75 | **12** |
| `browser-results-pr31-first.json` | first PR commit (pinned-rail fix only) | 75 | **4** |
| `browser-results-after.json` | built `dist/` (complete fix) | 75 | **0** |

The 12 pre-fix failures are the whole defect (steps 7 and 8 unreachable, the rail
out of the window, the key below the fold while reading *and* at `scrollY 0`, the
list not scrollable, no rail scroll when the last step is reached). The 4
remaining failures in `pr31-first` are exactly the top-of-page residual this
second commit closes. The same script passes every check afterwards, so it is not
vacuous: it fails on each code it was written to catch.

The two protection test files fail on the pre-fix tree as well (7/7), and pass
now (7/7 + 7/7).

### What the script asserts

- **1366×768 @ `scrollY = 0`** — with step 1 active *and* again with step 8
  active: the window is really at the top; the rail ends above the fold; the
  curriculum key is whole (`bottom ≤ 760`, i.e. at least 8px clear); the active
  step is inside both the list and the window; the active step keeps ≥24px clear
  of the window edge; and the list still shows at least four steps (≥216px).
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
| 1440×900 | **identical** (at the top and scrolled) |
| 1920×1080 | **identical** (at the top and scrolled) |
| 820×768 | **identical** (at the top and scrolled) |
| 390×844 | **identical** (at the top and scrolled) |
| 1024×768 | differs — the defect existed there too (rail `24..895`, key `799..889` outside); now `24..744` with the key at `647..738` |
| 1366×768 | differs — this is the fix, above |

Note on 1024×768: it is a two-column layout (breakpoint 1080), so the same rule
applies and the key becomes visible; button width there stays 228px before and
after.

## Top of the page (`scrollY = 0`) — fixed

The first fix bounded the rail by `100vh - 48px`, which is the space a *pinned*
rail has. At the top of the page the rail has not stuck yet: it starts 112px down
(76px top bar + 36px layout margin), so it ended at 832px and the bottom 58px of
the curriculum key were still cut. The rail now measures the space it actually
has (`railMaxHeight()` in `src/sidebar-reveal.js`) and publishes it as
`--rail-max-height`; the stylesheet uses it inside
`@media (min-width: 821px) and (max-height: 800px)` with a static
`calc(100vh - 136px)` fallback for no-JS. Tall screens (≥801px tall) never enter
that rule, so their pixels cannot change.

| 1366×768, step 8 active | main | first PR commit | now |
| --- | --- | --- | --- |
| rail at `scrollY 0` | `112..961` (849px) | `112..832` (720px) | **`112..744` (632px)** |
| curriculum key at `scrollY 0` | `865..955` — **cut (187px out)** | `735..826` — **cut (58px out)** | **`647..738` — whole** |
| active step 8 at `scrollY 0` | `811..865` — 97px past the edge | `683..735` | **`595..647`** — 121px clear of the edge |
| step list height at `scrollY 0` | 506px (not scrollable) | 377px | **289px** — still five steps |
| rail once pinned | `24..873` | `24..744` | `24..744` |
| rail button width | 256px | 256px | **256px** |

The rail now fits at every scroll position: sweeping `scrollY` from 0 to the end
of the page keeps the key inside the window (rail height grows 632 → 720 px once
it pins, so the list only ever gains room). The measured height is refreshed on
scroll, on resize and when the breakpoint is crossed; the list is re-centred only
on layout changes, so browsing the rail by hand is not fought by the scroll
handler.

A `scroll`-time fit cannot shrink the list under the active step (the rail only
grows as the page scrolls down); the one visible consequence is that a rail
position the reader dragged past the new maximum is clamped by the browser when
the list grows — i.e. the rail shows *more* steps, never fewer.

## Files

```
docs/qa/lesson-1-sidebar/README.md                     this note
docs/qa/lesson-1-sidebar/browser-results-before.json   raw measurements, pre-fix
docs/qa/lesson-1-sidebar/browser-results-pr31-first.json  raw measurements, first commit of this PR
docs/qa/lesson-1-sidebar/browser-results-after.json    raw measurements, fixed
docs/qa/lesson-1-sidebar/{before,after}-1366x768.png   full window
docs/qa/lesson-1-sidebar/{before,after}-1366x768-sidebar.png   rail only
docs/qa/lesson-1-sidebar/after-1366x768-keyboard-focus.png     focus ring in the scrollport
docs/qa/lesson-1-sidebar/after-1366x768-top-step8.png          scrollY 0, step 8 active (fixed)
docs/qa/lesson-1-sidebar/after-1366x768-top-step8-sidebar.png  same, rail only
docs/qa/lesson-1-sidebar/pr31-first-1366x768-top-step8-sidebar.png  the same view on the first commit: the key is cut
docs/qa/lesson-1-sidebar/{before,after}-{1440x900,1920x1080,820x768,390x844}.png
scripts/qa-lesson-1-sidebar.mjs                        the reproducible run
```
