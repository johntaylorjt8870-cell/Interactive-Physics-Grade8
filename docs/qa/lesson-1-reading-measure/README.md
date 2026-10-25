# Lesson 1 — reading measure (line length of running text)

Scope: the **running text** of `lesson-1.html` (stage paragraphs, list items and the
stage summary). Changed file: `src/lesson-1.css` only, plus a new unit test, two QA
scripts and this QA folder. No content, interaction, teacher area, assessment or
step-rail rule was touched.

## The defect

The lesson column is `978px` wide at 1366px and `1032px` at 1440px (`lesson-layout`
is a 264px rail + `minmax(0, 1fr)` column). Nothing capped the prose, so a paragraph
line ran to the full column: **918px at 1366** and **973px at 1440** (prose only).
That is far beyond a comfortable measure.

## The fix

`src/lesson-1.css`:

- `--l1-reading-measure: 40rem` (640px; the character estimate is approximate) in the
  `.l1-page` variable block.
- `.l1-page .page-content :is(p, li)` and `.l1-page .stage-hero-card :is(p, li)`
  get `max-width: var(--l1-reading-measure)`.
- Interactive regions are **excluded with `:not()`**, not reset: `.simulation-experience`,
  `.inquiry-card`, `.l1-practice-deck`, `.problem-workbench`, `[data-self-check]`.
  Resetting them with `max-width: none` would have undone the existing 820px cap
  that `src/styles.css` gives simulation text, so the exclusion is done in the selector.

The cap only bites where the text column is wider than 640px. On the stacked layout the
column is the viewport minus 36px, so phones (390px measured) are unchanged and the cap
starts to apply from about 680px wide; laptops and wide tablets get the narrower measure.

## Measurements

Source: `browser-results-before.json` (baseline build, `d7b8016`) and
`browser-results-after.json` (this change, `6fc2337` and later). Headless Chromium
(`@sparticuz/chromium`), all eight stages per viewport. The **prose** figure is the
longest line of a `p`/`li` outside the interactive zones (`prose.max` in the JSON),
maximum over the eight stages.

| viewport | column | longest prose line, before | after |
| --- | --- | --- | --- |
| 1366×768 | 978px | **918px** | **640px** (min 619) |
| 1440×900 | 1032px | **973px** | **640px** (min 619) |
| 1920×1080 | 1032px | **973px** | **640px** (min 619) |
| 1024×768 | 714px | **659px** | **640px** (min 608) |
| 820×768 | 784px | **733px** | **640px** (min 631) |
| 390×844 | 364px | 330px | 330px (no change) |

"min" is the smallest per-stage maximum after the change, so the prose lines on the
lightest stage are shorter than the cap. At 1440 and 1920 the largest line before the
change was 977px, which belongs to an interactive zone (`lines.max` in the JSON); that
zone keeps its width. The interactive zones keep their original width; this is by design.

Horizontal overflow (`docOverflowX`) is **0** at every viewport, before and after.
`offenders` and `textClipped` are empty at every viewport, before and after.

### Clipped boxes (information only)

`clipped` lists scroll containers whose content is wider than their box. Most entries
are intended scrollers: display equations (`katex-display`), self-check forms, option
cards and option grids. Some are inline math spans (`span.math-inline`) that are 2px
wider than their box. The list is **identical before and after** at every viewport
(see the invariance check below), so it is not gated.

## Gate: `scripts/qa-lesson-1-reading-measure.mjs`

The script exits with code 1 if any of these hold on any viewport and stage:

- `prose-measured`: no prose lines were measured (the measure is not meaningful);
- `reading-measure`: a prose line is longer than `--l1-reading-measure` plus 1px
  (the limit is read from the live page; 40rem if the variable is absent);
- `horizontal-overflow`: the document is wider than the viewport;
- `outside-column`: a box lies outside the lesson column;
- `text-clipped`: text is cut off by its own box.

On the baseline build it fails (40 checks: five viewports × eight stages, the 390px
viewport is not over the limit). On this change it passes.

## Invariance check: `scripts/qa-lesson-1-reading-invariance.mjs`

Compares a baseline build with the changed build at six viewports × eight stages
(**48 pairs**). It checks:

- the lesson markup and its text are identical;
- every element inside an interactive zone has the same computed style, size and
  position;
- every other element that is not running text keeps its width and left position,
  and the sidebar and top bar are unchanged;
- running text had no `max-width` before and has the 640px cap now (no cap overwritten);
- the set of clipped scroll containers is unchanged.

Vertical positions of ordinary containers are not compared: they move when the prose
above them reflows. Inline pieces inside running text (`strong`, `bdi`, KaTeX spans)
move with the line wrap, so only their style is compared.

Result in `visual-invariance-check.json`: **0 differences in 48 pairs**. Per viewport:
markup 8/8, text 8/8, clipped set 8/8; 152 prose elements (all capped at 640px, summed
over the eight stages); 77 visible text blocks inside interactive zones (keeping their
previous width); 7286 interactive-zone element comparisons.

## Reproducing the results

These scripts need `puppeteer-core` and `@sparticuz/chromium`. They are **not** in
`package.json` and are not installed by `npm test`. Put them in any directory and point
`QA_MODULE_DIR` at it (the directory must contain `node_modules`); set `CHROMIUM_PATH`
to a Chromium binary if you do not want the `@sparticuz/chromium` one. Also set
`LD_LIBRARY_PATH` if that Chromium needs shared libraries from the package.

```sh
# 1. Baseline build (commit before the change) on port 4190
mkdir -p /tmp/base
git archive d7b80166b43bb4d8f203797a79b707897173df2b | tar -x -C /tmp/base
(cd /tmp/base && node scripts/build.mjs)
python3 -m http.server 4190 --bind 0.0.0.0 --directory /tmp/base/dist &

# 2. Changed build on port 4191
npm run build
python3 -m http.server 4191 --bind 0.0.0.0 --directory dist &

# 3. Measurement gate, one run per build (each overwrites its results file)
QA_MODULE_DIR=/path/to/qa QA_BASE_URL=http://127.0.0.1:4190 QA_PHASE=before \
  node scripts/qa-lesson-1-reading-measure.mjs    # expected: exit 1
QA_MODULE_DIR=/path/to/qa QA_BASE_URL=http://127.0.0.1:4191 QA_PHASE=after \
  node scripts/qa-lesson-1-reading-measure.mjs    # expected: exit 0

# 4. Invariance check (overwrites visual-invariance-check.json)
QA_MODULE_DIR=/path/to/qa QA_BASELINE_URL=http://127.0.0.1:4190 QA_AFTER_URL=http://127.0.0.1:4191 \
  node scripts/qa-lesson-1-reading-invariance.mjs  # expected: exit 0
```

Unit tests and build: `npm test` (344 tests: 335 pass, 0 fail, 9 skipped, as in the
baseline plus the five new tests) and `npm run build`.

## Screenshots

| | before | after |
| --- | --- | --- |
| 1366×768, stage 1 | `before-1366x768-stage1.png` | `after-1366x768-stage1.png` |
| 1440×900, stage 1 | `before-1440x900-stage1.png` | `after-1440x900-stage1.png` |
| 1366×768, stage 3 | `before-1366x768-stage3.png` | `after-1366x768-stage3.png` |

## Tests

- `tests/lesson-1-reading-measure.test.js` (5 tests) pins the variable, the selector
  scope, the exclusion list, the absence of `max-width` resets and `!important`, and
  that `styles.css` keeps its simulation cap. Three of the five fail on the
  previous stylesheet.

## Known, not changed here

- Headings (`h3`/`h4`) are not capped. Their lines reach 882px at 1366 and 937px at
  1440 (`perSelector.h3.max`). Each heading is short text, so the box width does not
  form a reading line. They are left as they are.
- Interactive zones (simulations, inquiry cards, practice, workbenches) keep their
  full width by design, so their long prompt lines are still wide.
- Equations and self-check elements are intended scroll containers; they are listed in
  `clipped` and are the same before and after.
