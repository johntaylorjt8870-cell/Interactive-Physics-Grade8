# Lesson 1 — reading measure (line length of running text)

Scope: the **running text** of `lesson-1.html` (stage paragraphs, list items and the
stage summary). Changed file: `src/lesson-1.css` only, plus a new unit test and
this QA folder. No content, interaction, teacher area, assessment or step-rail
rule was touched.

## The defect

The lesson column is `978px` wide at 1366px and `1032px` at 1440px (`lesson-layout`
is a 264px rail + `minmax(0, 1fr)` column). Nothing capped the prose, so a paragraph
line ran to the full column: **918px at 1366** and **977px at 1440** (about 120
Arabic characters per line at 17px). That is far beyond a comfortable measure.

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

## Measurements (`browser-results-before.json` / `browser-results-after.json`)

Measured with `scripts/qa-lesson-1-reading-measure.mjs` in headless Chromium 153,
all eight stages per viewport.

| viewport | column | longest prose line, before | after |
| --- | --- | --- | --- |
| 1366×768 | 978px | **918px** | **640px** |
| 1440×900 | 1032px | **971–977px** | **640px** |
| 1920×1080 | 1032px | 971–977px | 640px |
| 1024×768 | 714px | 657px | 640px |
| 820×768 | 784px | 724px | 638–640px |
| 390×844 | 364px | 330px | 330px (no change) |

"Prose" excludes the interactive zones listed above; those keep their original
width (up to 977px at 1440). Horizontal overflow (`scrollWidth > clientWidth`) is
**0** at every viewport, before and after. No text is clipped by its box.

Lines per block (characters per line of multi-line paragraphs, median/p90) are in the
raw JSON under `cpl`.

### Unchanged parts (`visual-invariance-check.json`)

Compared before/after for every stage at six viewports (48 pairs):

- text content of `#page-content` — identical;
- left rail, top bar and stage buttons (position and size) — identical;
- every interactive zone (width, height, left, markup length and text) — identical.
  Their **vertical position** moves when the prose above them gets shorter; that
  is expected reflow, not a change to the zone;
- no horizontal page overflow.

Result: **0 differences in 48 checks.**

### Prose coverage

In the same browser run, every stage paragraph and list item outside the
interactive zones reports `max-width: 640px` (152 elements). The 77 elements inside
interactive zones keep their previous `max-width` (`none`, or 820px for the
simulation headers from `styles.css`).

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

- Headings (`h3`/`h4`) are not capped. Their boxes are 880–920px wide, but each
  heading is short text, one or two lines, so the box width does not form a
  reading line. They are left as they are.
- Inline math spans (`.math-inline`) report a 2px scroll-width excess in the
  existing build. This was measured, not seen: it is identical before and after,
  and I did not check it visually.
- The interactive zones (simulations, inquiry cards, practice, workbenches) keep
  their full width by design, so their long prompt lines are still wide.
