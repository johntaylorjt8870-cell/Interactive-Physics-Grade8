# Delivery Report — Unit 2, Lesson 1 Appendix: «مختبر الشحنات — اكتشف الكهرباء الساكنة»

Standalone interactive enrichment appendix for the static-electricity lesson (textbook pages 73–86), published as a third entry in the «ملحقات الدروس» library.

- Page: `unit2-lesson-1-appendix.html`
- Modules: `src/unit2-lesson1-appendix-physics.js`, `-flow.js`, `-content.js`, `-appendix.js`
- Design: `src/unit2-lesson1-appendix.css` (new identity, prefix `u2l1a-`)
- Tests: `tests/unit2-lesson1-appendix.test.js` (30 tests)
- Delivery date: 2026-10-16

## 1. Scope basis

The scope authority for this appendix is **the lesson information supplied by the user** (the six lesson goals, the five keywords and the seven required stations), not the printed book and not any guess about it. Nothing was added to the scope that the user did not ask for, and no Unit 2 test, lesson page, teacher area or earlier appendix was touched.

The printed pages remain the authority for anything labelled «من الكتاب», through the already-audited inventory `docs/unit-2-lesson-1-source-audit.md` (pp. 73–86). The unit numbering follows the user and the platform («الوحدة الثانية — الدرس الأول»); printed p73 reads «الوحدة الثالثة», and that numbering is never attributed to the book — the same decision the source audit records.

## 2. Lesson goals covered

| # | Goal (as supplied) | Where it is covered |
|---|---|---|
| 1 | يتعرّف الكهرباء الساكنة | Station 1 «لغز الكهرباء الساكنة» (paper bits + rubbed rod), station 7 concept map root node |
| 2 | يتعرّف الشحنات الكهربائية | Station 2 «من أين تأتي الشحنة؟» (charge ledger, `q = n·e`, two charge kinds) |
| 3 | يميّز بين الأجسام المشحونة وغير المشحونة | Station 2 (neutral = balanced, not empty; electroscope reading), station 6 questions `electroscope-reading` and `neutral-meaning` |
| 4 | يفسّر طرائق التكهرب | Station 3 «ورشة طرائق التكهرب» (friction / contact / induction, ordered steps, comparison table), station 6 `induction-sign` |
| 5 | يفسّر قوى التنافر والتجاذب | Station 4 «ساحة التجاذب والتنافر» (sign choice, force arrows, released motion), station 6 `glass-and-plastic` |
| 6 | يتعرّف قانون كولوم | Station 5 «تحدّي قانون كولوم» (live lab, unit conversion, ratio probes, book worked example), station 6 `compare-two-setups` |

Keywords carried on the page: الكهرباء الساكنة، التكهرب، قوى التنافر، قوى التجاذب، قانون كولوم.
Each station header states which of the six goals it serves (`objective`); stations 1–5 name one goal each (station 2 names goals 2 and 3), station 6 mixes all six, station 7 ties them into a map.

## 3. Stations and interactions

Navigation is a station rail of seven chips (`aria-current="step"`, `data-visited`), prev/next buttons that disable at the ends, a `role="progressbar"` readout (`aria-valuemax="7"`, `aria-valuetext` naming the station) plus a discovery percentage of visited stations, hash routing (`#station-<id>` written with `history.replaceState`), PageUp/PageDown, a skip link, and focus moved to the station heading on arrival. Every panel is built once and kept, so returning to a station preserves the student's state. One concept per screen; no continuous decorative animation (`prefers-reduced-motion` honoured in JS and CSS).

1. **لغز الكهرباء الساكنة** — the student predicts (3 options), then runs/replays the scene: an unrubbed rod does nothing (`neutral-rod`), a rubbed rod lifts the paper bits (`charged-rod-attraction`), a rubbed rod held away does nothing (`charged-rod-held-above`). Observation and explanation are two separate reveal blocks; a polarization note («شرح المنصة») explains induction in the neutral bits, and the scene states that it does not reproduce every detail of the real experiment (dry tools, humidity, material pairs).
2. **من أين تأتي الشحنة؟** — a symbolic ledger of two bodies: fixed protons (`SYMBOLIC_PROTONS = 6`), movable electrons, buttons that transfer electrons **only** from one body to the other (`data-ledger-transfer="a"|"b"`), live `q = -Δn·e` in coulombs with typeset powers of ten, a neutral-vs-charged comparison, the book rule (p76) and the book worked example (`n = 5×10¹² ↔ q = +8×10⁻⁷ C`), plus a labelled platform exercise (`20×10¹⁰` electrons lost → `+3.2×10⁻⁸ C`, the p76 activity). Charge is conserved by construction and the conservation report is asserted in tests.
3. **ورشة طرائق التكهرب** — three method tabs, each an ordered set of steps that must be executed in order («بالترتيب» gating), showing before/after states, what changed and what did not, and the mechanism (`transfer-between-bodies`, `spread-over-surface`, `redistribution-only` → `transfer-with-ground`). A comparison table computed from the model (7 rows; 5 of them differ between methods) separates electron transfer from charge redistribution, and an electroscope note (p74) links each method to leaf divergence.
4. **ساحة التجاذب والتنافر** — the student picks each body's sign (and can flip one), predicts, then reveals: like signs repel, unlike attract, with an accurate arrow on **each** body (equal length even for unequal charge magnitudes — Newton's third law, stated explicitly), motion consistent with the force kind, and drawing bounds that never clip. Force elements from p80 (نقطة التأثير، الحامل، الجهة، الشدة) are quoted.
5. **تحدّي قانون كولوم** — sliders for `q₁`, `q₂` (1–80 μC, step 1) and `d` (20–200 cm, step 10), sign buttons, live computation through the published lesson model, SI conversion shown under each slider, a symbol/unit legend, an explicit «magnitude vs direction» note, five «what if…?» ratio probes that must be predicted before being checked (×2, ×2, ×4, ÷4, ×4), the book worked example loaded into the sliders (`50 μC`, `80 μC`, `1 m` → `36 N`, p81), a reset, and a beyond-range warning above `MODEL_FORCE_LIMIT_N = 500 N`.
6. **تحدّي المحقّق الكهربائي** — seven mixed situations (electroscope reading, induction sign, glass-and-plastic pair, comparing two setups → `F/2`, find-and-fix a scientific error about which particle moves, why paper bits rise, what "neutral" means). Nothing is revealed before an attempt (single explicit submit is the only grader), each choice carries an explanation, retry clears the answer with no penalty, and the block states that these are **not** the book's questions (pp. 84–86 are never copied).
7. **خلاصة الاكتشاف** — a concept map (الكهرباء الساكنة ← الشحنات ← التكهرب ← التجاذب/التنافر ← قانون كولوم) with expandable nodes that link back to their station (`openStation`), eight key ideas, and review/replay buttons. No long essay.

## 4. Book content vs platform enrichment

Three voices are kept strictly apart in `src/unit2-lesson1-appendix-content.js`, and every one of them is labelled in the interface:

| Voice | Label | Rule |
|---|---|---|
| Audited textbook wording/conclusions | «من الكتاب» (`SOURCE_LABEL`) with `Reference / See textbook — p<n>` | only pages 73–86 confirmed by `docs/unit-2-lesson-1-source-audit.md`; 8 quoted blocks citing pp. 74, 75, 76, 77, 78, 79, 80 (plus «ص80–81» for the worked example) |
| The platform's own explanation of what the model shows | «شرح المنصة · Platform Explanation» (`PLATFORM_LABEL`) | never presented as book wording |
| Correct physics beyond the printed page | «إثراء علمي من المنصة» (`ENRICHMENT_LABEL`) | labelled as enrichment; the induction sign conclusion says explicitly that it is «وليست نصاً حرفياً من استنتاج الكتاب» |

Book material used: p74 electroscope principle; p75 dry-tool paper-bits activity; p76 rubbing transfers electrons, `q = ±ne`, charge stays on the rubbed end of an insulator, the `5×10¹²` worked example and the `20×10¹⁰` activity; p77 two charge kinds, like repel / unlike attract; p78 باللمس ⇒ same sign; p79 بالتأثير ⇒ redistribution + finger grounding; p80 `F = K q₁q₂/d²`, `K = 9×10⁹ N·m²·C⁻²` in vacuum, force elements; p81 the `36 N` worked example and التفريغ الكهربائي. The «أختبر نفسي» questions on pp. 84–86 are **not** used anywhere.

Symbol decision: the quoted law keeps the book's symbol `d` (`F = K q₁q₂/d²`) rather than `r`. The lab **computes** the magnitude with absolute values, `F = K|q₁q₂|/d²`, and derives attraction/repulsion from the signs separately, so a computed magnitude is never mixed with a direction — the interface says this in «magnitude vs direction».

## 5. Scientific verification of the enrichment

Outbound network access in this environment is limited to GitHub and the npm/PyPI registries, so **no external web source was fetched** for this work. Verification therefore rests on three things:

1. **The in-repo audited source** — `docs/unit-2-lesson-1-source-audit.md` (pp. 73–86) for every «من الكتاب» item.
2. **The published lesson model** — `src/unit2-lesson1-physics.js`, which already carries `ELEMENTARY_CHARGE = 1.6e-19`, `COULOMB_CONSTANT = 9e9` and `coulombForce(q1, q2, d) = K|q₁q₂|/d²` with kind from signs, and is covered by the existing lesson tests. The appendix **imports** these instead of re-implementing them, so it cannot drift from the published lesson (the same delegation the Lesson 2 appendix uses).
3. **Standard physics, checked for internal consistency and unit coherence** — charge quantization `q = ne`; only electrons move in rubbing/contact/induction while protons stay bound in nuclei; a neutral body has balanced charges, not zero charges; plastic rubbed with wool becomes negative, glass rubbed with silk positive; contact charging leaves the same sign; induction with grounding leaves the opposite sign; polarization attracts a neutral light body; action/reaction forces are equal in magnitude and opposite in direction; the inverse-square behaviour (double `d` → `F/4`; double one charge → `2F`; double both → `4F`); very large forces between close charges are unrealistic because discharge would occur first. Each of these appears in the interface as «شرح المنصة» or «إثراء علمي من المنصة», never as a book quote, and each is pinned by a test.

Numbers verified by the test suite (all computed, none hard-coded as "measurements"):

| Case | Result |
|---|---|
| Default lab state `{q₁=5 μC, q₂=5 μC, d=50 cm}`, same signs | `0.9 N`, repulsion |
| Book state `{50 μC, 80 μC, 1 m}` (p81) | `36 N`, `d = 1 m` |
| Probes on the default state | double `q₁` ×2, double `q₂` ×2, double both ×4, double `d` ×0.25, halve `d` ×4 (flagged `outsideGrid`, 25 cm is off the 10 cm slider grid) — ratios hold across the whole slider grid sweep |
| Corner `{80 μC, 80 μC, 20 cm}` | `1440 N`, `beyondModelRange: true` (> 500 N) |
| Book example p76 | `n = 5×10¹² ↔ q = +8×10⁻⁷ C`; activity `20×10¹⁰` electrons lost → `+3.2×10⁻⁸ C` |
| Rod charge in station 1 | `−3.2×10⁻¹⁹ C` (gained 2 electrons ⇒ negative) |
| Method finals | friction `+2 / −2` electrons (rod negative, partner positive, charge localized); contact `+3 / +1` (both negative, spread over the surface); induction: approach = redistribution only, after grounding `+4 / −2` with the rod untouched and the partner's sign opposite |
| Arena | all 40 sign / unequal-magnitude / progress combinations: `insideView` and `arrowLengthsEqual` |

## 6. Limits of the simplified models (stated on the page)

Every interactive station renders a «حدود هذا النموذج» card, and the scenes carry the label «نموذج تعليمي مبسّط — Educational simplified model»:

- Counts of protons/electrons are **symbolic and miniature** (6 protons per body), chosen so each moving electron is visible; they are not measurements and not real particle counts. Real charging involves astronomically larger numbers.
- The paper-bits scene is deterministic drawing geometry: positions and "lift" are illustration, not measured motion; it does not model humidity, bit mass, air currents or partial discharge, and it does not claim to prove every detail of the real experiment.
- The three methods are idealized step sequences: perfect insulators/conductors, no leakage, no humidity, no charge loss over time; the induction sequence's final-sign conclusion is platform explanation beyond the printed text.
- The arena shows point-like bodies on a line with no rotation, no contact and no third body; arrow **length** encodes force type only, magnitude is read from the numeric panel; equal arrows for unequal charges is Newton's third law, not a claim that the effects on the two bodies look the same.
- Coulomb's law is applied to point charges in vacuum only: no dielectric medium, no induction on nearby bodies, no finite-size correction, and no discharge — which is why very large forces are flagged as beyond the model instead of being presented as physical.
- Animations are time-compressed illustrations; nothing on screen is a real-time or real-scale measurement.

## 7. Visual identity and accessibility

- New identity, not a recolour of the Unit 1 appendices: dark "storm lab" palette (`--bg: #0a1120`, charged amber/cyan accents), own typography scale, own card/scene components, all class names prefixed `u2l1a-`, own stylesheet only — the page does **not** load `src/styles.css`, so the light lesson theme cannot leak in.
- Arabic prose is RTL; every equation, number, unit and symbol is an LTR-isolated island (`<bdi dir="ltr">`, `ltrText`, `qty`, `tex`, `formula`) rendered by the shared KaTeX layer `src/math.js` with real exponents and fractions (`F=K\frac{q_{1}q_{2}}{d^{2}}`, `9\times 10^{9}~\mathrm{N\cdot m^{2}\cdot C^{-2}}`).
- 8 `aria-live` regions announce state changes in words; all 5 `role="img"` SVG scenes have accessible titles/descriptions; keyboard-operable controls with visible focus and understandable labels; `prefers-reduced-motion` removes motion in both CSS and JS; four responsive breakpoints (1080 / 860 / 680 / 420 px) plus a print block; `overflow-x: clip` on the shell and `max-inline-size: 100%` on scene canvases prevent unintended horizontal scroll.
- `<noscript>` explains that the appendix needs JavaScript; the page works over HTTP with ordinary relative links (no client-side router).

## 8. Files added

| File | Lines | Purpose |
|---|---|---|
| `unit2-lesson-1-appendix.html` | 119 | standalone RTL appendix page (shell, rail, progressbar, skip link, return links) |
| `src/unit2-lesson1-appendix-physics.js` | 957 | pure model: charge ledger, `q = n·e`, three methods + comparison, paper scene, arena geometry, Coulomb lab + probes, formatters (plain + TeX) |
| `src/unit2-lesson1-appendix-flow.js` | 177 | station flow, hash routing, explicit-submit-only quiz state, integrity report |
| `src/unit2-lesson1-appendix-content.js` | 828 | all authored Arabic/KaTeX content, labels, station metadata, questions, concept map |
| `src/unit2-lesson1-appendix.js` | 1705 | mount module: markup per station, SVG scenes, controls, wiring, live regions |
| `src/unit2-lesson1-appendix.css` | 1621 | isolated dark storm-lab design, responsive + reduced-motion + print |
| `tests/unit2-lesson1-appendix.test.js` | 920 | 30 focused tests (see §9) |
| `docs/unit-2-lesson-1-appendix-audit.md` | — | this delivery report |

## 9. Files modified (shared) — minimal changes and why

`git diff --numstat`: 7 files, +125 / −13 (`README.md` 12/2, `appendices.html` 33/1, `scripts/build.mjs` 1/0, `src/appendices.css` 62/0, `tests/appendices.test.js` 13/7, `tests/lesson-2-appendix.test.js` 2/1, `tests/unit-questions.test.js` 2/2).

| File | Change | Why it is unavoidable |
|---|---|---|
| `appendices.html` | +33 / −1: one new `article.appendix-library-card` (art, «Unit 2 · Lesson 1 · الكهرباء الساكنة», `Platform Extension`, title «مختبر الشحنات», 5 feature items, «ابدأ الملحق» → `./unit2-lesson-1-appendix.html`) and the header status «ملحقان تفاعليان» → «ثلاثة ملحقات تفاعلية» | the appendix must appear in the existing library; the two published cards are untouched |
| `src/appendices.css` | +62 appended at end of file: `.appendix-card-art-charges` panel, field lines, `+`/`−` charge glyphs, paper bits; `::before/::after { content: none }` so no inherited decoration leaks | the new card needs its own artwork; purely additive — no existing rule was edited, and the block sits after the existing media queries so the published cards render identically |
| `scripts/build.mjs` | +1 `cp(...)` line for `unit2-lesson-1-appendix.html`, right after the `unit2-lesson-1.html` line | otherwise the page would be missing from `dist/` and from GitHub Pages |
| `tests/appendices.test.js` | card count 2→3, test titles reworded ("two"→"three"/"every"), `Platform Extension` count 2→3, new positive assertions for the new card, `doesNotMatch` placeholder guard now allows `Unit 2` but still forbids `Lesson [3-9]`, `lesson-[3-9].html`, `Unit 2 · Lesson [2-9]`, «قريباً», `Placeholder`, «قادم»; build-page list includes the new page | these assertions counted the published appendices; a third real entry breaks them by design. Only the counts and the placeholder guard were relaxed — no assertion was deleted, and new ones were added |
| `tests/lesson-2-appendix.test.js` | card count 2→3 (+1 comment) | same library-count assertion |
| `tests/unit-questions.test.js` | card count 2→3, test title "two-entry Appendix Library"→"Appendix Library" | same library-count assertion |
| `README.md` | +12 / −2: URL bullet, structure entries (page, 5 modules, test file), "two entries"→"three entries", "two appendices"→"three appendices" in the build description, one paragraph describing the new appendix | documentation must match the published library and the build output |

**Not modified** (verified by `git status` and by tests): `package.json` (no dependency added or updated), `vendor/`, `src/styles.css`, `src/math.js`, `src/appendices.css` existing rules, every lesson content/simulation/diagram module, `src/unit2-lesson1-*` lesson files (content, main, physics, simulation, assessment, teacher, test data/solutions/diagrams, self-check), `src/teacher-auth.js` and all teacher areas, `index.html`, all lesson and Unit 1 pages, `lesson-1-appendix.*` and `lesson-2-appendix.*`, and every existing test file except the three count relaxations above. No Unit 2 test was created.

## 10. Actual test and build results

```
npm test      → 1..209 | tests 209 | pass 209 | fail 0   (baseline before this work: 179/179)
node --test tests/unit2-lesson1-appendix.test.js → 30 tests, 30 pass, 0 fail
npm run build → "Production static build written to dist/."
```

Build artefacts verified present in `dist/`: `dist/unit2-lesson-1-appendix.html`, `dist/src/unit2-lesson1-appendix.js`, `-physics.js`, `-flow.js`, `-content.js`, `-appendix.css`.

The 30 new tests cover: page structure and RTL/LTR isolation; the CSS identity, responsive and reduced-motion rules; the six goals and five keywords; station flow, hash routing and progress; station 1 (unrubbed vs rubbed rod, bit lift order, prediction gating); station 2 (neutral = balanced, only electrons move, protons fixed, `q = n·e`, book example and platform exercise, conservation); station 3 (three methods start alike and end differently, conservation at every step, comparison table separates them); station 4 (like/unlike signs, opposite equal arrows, motion agrees with force, stays inside the view); station 5 (SI units, `36 N` book state, inverse-square sweeps across the whole slider grid, signs affect kind only, slider legality, reset, probes graded against computed ratios, typeset powers of ten); station 6 (seven varied situations, nothing revealed before an attempt, retry without penalty, progress); station 7 (concept map nodes link back to stations, key ideas, state persistence); source labelling (page citations inside pp. 73–86, three voices apart, simplified-model label, symbolic counts declared); library card and build entry; scope preservation (published lesson, its test, its teacher area, the password gate, the two earlier appendices, and "no Unit 2 test").

### Interaction check in a real DOM (outside `npm test`)

jsdom is **not** a dependency of this repository and none was added, so the DOM-level run lives outside the repo (`/home/user/.cache/domcheck/smoke.mjs`, jsdom installed there only):

```
126/126 DOM checks passed — 0 JavaScript errors, 0 unhandled KaTeX ParseError
```

It mounts the real page + real modules and exercises: rail/progress/prev-next disabling, PageUp/PageDown, `#station-coulomb` routing, all seven stations end to end (predict → run → observation/explanation → reset; ledger transfers with protons fixed; example/exercise reveals; method tabs, ordered-step gating, comparison table; arena reveal «تجاذب» / flip «تنافر» with unequal radii and equal arrows; Coulomb `0.9 → 1.8 → 0.45 N`, sign flip keeping the magnitude, book state setting the sliders to 50/80/100, probe gating and applying, beyond-range warning; detective submit-without-selection revealing nothing, retry clearing without penalty, seven review buttons navigating; summary nodes and «ص80»), plus no raw TeX leaking into visible text, ≥6 live regions, every `role="img"` SVG labelled, and both «نموذج تعليمي مبسّط» and «Platform Extension» present.

Served over HTTP (`npm start`, port 4173, `--bind 0.0.0.0`), every requested asset returns `200` with the correct MIME type (`text/html`, `text/css`, `text/javascript`): the page, `appendices.html`, the five appendix modules, `src/fonts.css`, `vendor/katex/katex.min.css`, `src/math.js`, `src/unit2-lesson1-physics.js`.

## 11. Visual check — NOT performed

There is **no browser or GUI in this environment**, so no real visual check was possible. Specifically **not** verified: pixel rendering, font loading/fallback, measured contrast ratios, real touch behaviour on a phone, and the actual appearance at mobile widths.

What was done instead, and its limits: a real-DOM interaction run (jsdom, §10) that verifies structure, attributes, wiring and text output but **not** layout or paint; static CSS analysis for breakpoints, overflow containment and reduced motion; and HTTP/MIME verification of every asset. **A visual check on desktop and on a phone should still be performed before merging** — the live preview served from this workspace (port 4173) can be used for it: `/appendices.html` → «ابدأ الملحق» → `/unit2-lesson-1-appendix.html`.

## 12. Unresolved constraints and issues

1. **No browser check** (see §11) — the only outstanding verification item; layout, fonts and contrast are unconfirmed in a real renderer.
2. **jsdom harness lives outside the repository** — the DOM checks are not part of `npm test`, because adding a dev dependency would change `package.json` (out of scope: no dependency updates). Re-running them requires a jsdom install outside the repo.
3. **Unit numbering discrepancy** — printed p73 says «الوحدة الثالثة»; the platform says «الوحدة الثانية». The appendix follows the user's numbering and attributes nothing about numbering to the book (consistent with the existing source audit).
4. **Halving the distance leaves the slider grid** — `d = 25 cm` is not representable on a 10 cm grid, so the probe reports `outsideGrid: true` and says the value was rounded, instead of silently snapping. This is intentional and visible to the student.
5. **Beyond-range forces are flagged, not hidden** — `{80 μC, 80 μC, 20 cm}` yields `1440 N`, above `MODEL_FORCE_LIMIT_N = 500 N`; the lab shows the number *and* a warning that real discharge would occur first, rather than clamping the physics.
6. **Card-count assertions in three existing test files had to change** — unavoidable when publishing a third appendix; the relaxations are limited to counts/titles and the placeholder guard (§9), and new positive assertions were added so the two published cards remain pinned.
