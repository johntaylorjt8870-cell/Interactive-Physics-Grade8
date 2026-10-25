# Unit 2 Lesson 1 Appendix — answer-option contrast QA

Scope: the answer options of «مختبر الشحنات — اكتشف الكهرباء الساكنة»
(`unit2-lesson-1-appendix.html`), at the two laptop viewports **1366×768** and
**1440×900**. Nothing else was touched: `src/unit2-lesson1-appendix.css` is
linked by this page only, and the change lives entirely inside
`.u2l1a-choice` and its radio.

## What was changed and why

The options used `border: 1px solid var(--line-soft)` — `rgba(146,178,224,.14)` —
which composites to `rgb(31,41,62)` over the option's own fill `rgb(12,20,35)`:
**1.27:1**, far below the 3:1 that WCAG 2.1 SC 1.4.11 asks of a control boundary.
The browser's own radio (white disc, light-mode default) also read as "already
chosen" against the dark field.

| state | before | after |
| --- | --- | --- |
| resting edge | `rgba(146,178,224,.14)` → **1.27:1** | `--choice-line: rgba(146,178,224,.55)` → **3.37:1** |
| resting radio ring | native white widget → **1.14:1** | drawn 2px ring `rgba(146,178,224,.62)` → **8.55:1** |
| hover | spark edge, no fill change | spark edge 0.8 + lighter fill + spark radio ring |
| selected | spark edge + fill | spark edge + **1px inset ring** + denser fill (**1.45 → 1.70** vs the resting fill) + filled radio dot |
| keyboard focus | the 18 px native circle only | **3px spark outline around the whole option** (`:has(input:focus-visible)`), native ring suppressed to avoid a double ring |

Radios are now drawn from the page palette (`appearance: none`, 2px ring, 9px
cyan dot) so colour is never the only cue: the checked state shows a dot *and* a
fill *and* a double edge. Under `@media (forced-colors: active)` the radio is
handed back to the engine and the inset ring becomes an `outline: 2px Highlight`.

No colour token of the theme was redefined, so every other panel of the page
(cards, tables, verdicts, sliders, concepts) keeps its exact previous pixels.

## What actually ran

```
npm test       → tests 319 | pass 310 | fail 0 | skipped 9
                 (the 9 skips are pre-existing jsdom-only DOM tests; no dependency added)
npm run build  → "Production static build written to dist/."
```

`tests/unit2-lesson1-appendix.test.js` gained two tests (32 pass, 0 fail):
one pins the option CSS contract (tokens, states, focus ring, forced-colours
fallback), the other recomputes the contrast of the shipped tokens over both dark
bases inside `npm test`, so a future restyle cannot silently regress the edge.

Browser QA — a real Chromium (`HeadlessChrome/153`), driven by
`scripts/qa-unit2-lesson1-appendix-options.mjs` (puppeteer-core +
`@sparticuz/chromium`, installed **outside** the repository; `package.json`
untouched). In this sandbox Chromium needs `libnss3`/`libnspr4`, which are not
installed, so ABI stubs were compiled from the binary's own `readelf -V` symbols
and exported through `LD_LIBRARY_PATH`. The script needs no stub on a normal host.

```bash
npm run build
python3 -m http.server 4173 --bind 0.0.0.0 --directory dist            # after
python3 -m http.server 4174 --bind 0.0.0.0 --directory /tmp/before-site  # git archive HEAD
QA_MODULE_DIR=<dir> CHROMIUM_PATH=/tmp/chromium QA_BASE_URL=http://127.0.0.1:4173 QA_PHASE=after \
  node scripts/qa-unit2-lesson1-appendix-options.mjs
```

| run | page | checks | failures |
| --- | --- | --- | --- |
| `browser-results-before.json` | `git archive HEAD` (pre-fix CSS) | 74 | **20** |
| `browser-results-after.json` | working tree (fixed CSS) | 74 | **0** |

The 20 pre-fix failures are exactly the defect: 1.27:1 edge on every option,
1.14:1 radio ring, no drawn dot, no inset ring, no focus ring on the option.
The identical script passes every check afterwards, so the script is not
vacuous — it fails on the code it was written to catch.

### What each run asserts (37 checks per viewport)

- **Resting** — 1px edge, edge ≥ 3:1 against the option's own fill **measured
  from real screenshot pixels** (the border colour is sampled along a scan across
  the top edge), label ≥ 4.5:1, radio ring ≥ 3:1, no vertical/horizontal clip of
  the option or its label, and the same edge ratio for *every* option (not just
  the first).
- **Hover** — the edge colour actually changes, still ≥ 3:1.
- **Selected** — the radio is checked, the dot is drawn, the fill differs from
  the resting fill, the edge is ≥ 3:1 both on its own fill and against the
  resting fill, the inset ring exists, label ≥ 4.5:1.
- **Keyboard** — `ArrowDown` moves focus, the whole option carries a 3px solid
  `rgb(88,205,242)` ring, the ring clears 3:1 on the lab panel, and the input no
  longer draws a second inner ring.
- **Interaction unchanged** — station 1 predict → rub → approach still reveals
  the observation and explanation with its live status; station 5's probe pills
  are present and still 44 px tall; station 6 selects, submits (verdict
  revealed), and retries (answer and feedback cleared, card back to `open`).
- **Layout** — no unintended horizontal page scroll on any station, no JS error,
  no failed request, no response ≥ 400 (the error list is recorded in the JSON).

## Screenshots in this folder

`*-before-*` and `*-after-*` pairs at both viewports:
`station1-options-resting`, `station1-options-hover`, `station1-options-selected`,
`station1-options-focus`, `station5-probes`, `station6-options-selected`,
`station6-options-verdict`, plus one `page-*` shot of the first screen.

The comparison shows four things at a glance: the resting rows now have a visible
edge and a hollow ring instead of near-invisible rows with a bright white dot;
the chosen row is a clearly filled, double-edged row; the keyboard ring wraps the
whole row; and the station-6 verdict cards and buttons are untouched.

## Not verified (stated, not implied)

- No physical touch device and no phone-width pass in this round; the task asked
  for 1366×768 and 1440×900. The change adds no new breakpoint and no new width,
  and the 44 px minimum height of `.u2l1a-choice` is unchanged.
- No screen-reader session; the change is visual only — the markup, the radio
  inputs, names, values and the explicit-submit quiz state are untouched, so the
  accessibility tree is unchanged.
