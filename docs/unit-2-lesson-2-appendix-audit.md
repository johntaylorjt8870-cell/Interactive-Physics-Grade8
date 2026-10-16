# Delivery Report — Unit 2, Lesson 2 Appendix: «رحلة الشحنات — من المولّد إلى المصباح»

Standalone interactive enrichment appendix for the continuous-current lesson (textbook pages 87–96), published as a fourth entry in the «ملحقات الدروس» library.

- Page: `unit2-lesson-2-appendix.html`
- Modules: `src/unit2-lesson2-appendix-physics.js`, `src/unit2-lesson2-appendix-content.js`, `src/unit2-lesson2-appendix-flow.js`, `src/unit2-lesson2-appendix.js`
- Design: `src/unit2-lesson2-appendix.css` (new identity, prefix `u2l2a-`)
- Tests: `tests/unit2-lesson2-appendix.test.js` (27 tests)
- Delivery date: 2026-10-16

## 1. Scope basis

The confirmed scope is the lesson material supplied for this task: the three printed objectives, the three keywords, the «ألاحظ وأستنتج» questions on the generator's role and energy transfer, the ampere convention, the relation `I = Q/t`, and the station list that was requested for this appendix. The appendix adds nothing to that scope and replaces nothing in the lesson.

The printed pages remain the authority for anything labelled «من الكتاب». The wording used inside the appendix comes from the audited extraction in `src/unit2-lesson2-content.js` and the page-by-page analysis recorded in `docs/unit-2-lesson-2-source-audit.md` (pp. 87–96). The lesson title alone was never used to invent book details, and no book number was introduced that the extraction does not contain.

The appendix is a **platform extension**, not a lesson page: it is not the official lesson test, does not touch the Teacher Area, and is never counted as part of the lesson assessment.

## 2. Source review — what was readable, and what the appendix does with it

| Source reviewed | Readability | What the appendix takes from it |
|---|---|---|
| `src/unit2-lesson2-content.js` (audited extraction of pp. 87–96) | Fully readable: objectives, keywords, the three printed questions, the Ampere convention, the definition of current intensity, `I = Q/t` with its worked application, the multiples and submultiples of the ampere, the series/parallel readings, the exercises | Every «من الكتاب» badge, every printed page number, the objectives, the keywords and the three questions of station 1 |
| `docs/unit-2-lesson-2-source-audit.md` | Fully readable; it records pp. 87–96 as complete with no gaps and lists the known quirks (numbering, figure quality) | The page map used for `pageRef` values (87, 88, 89, 90, 91, 92, 94) and the decision not to reproduce any figure |
| `src/unit2-lesson2-physics.js` (published lesson model) | Fully readable | `currentFromChargeTime`, `chargeFromCurrentTime`, `milliampereToAmpere` behaviour is mirrored by the appendix's own pure module; the lesson module itself is **not modified and not imported**, so the appendix can never change lesson behaviour |
| `src/unit2-lesson2-simulation.js`, `src/unit2-lesson2-diagrams.js` | Fully readable | Read for collision avoidance only: the appendix deliberately uses different ids, different ranges, a different interaction shape and a different visual identity from the lesson's tube, current and circuit labs |
| `src/unit2-lesson1-appendix*.{js,css}` | Fully readable | Used as the structural template (station flow, hash routing, explicit-submit quiz, labels, test style) — not copied wholesale, and the appendix uses a deliberately different palette |

No book figure, photograph or table is reproduced anywhere in the appendix. The circuit, the ammeter and the concept map are platform drawings, and every scene that shows one carries the visible note «رسم إثرائي توضيحي — ليس نقلاً مؤكداً لشكل الكتاب» plus the «نموذج تعليمي مبسّط — Educational simplified model» badge with the model's limits written next to it.

## 3. Objectives, keywords and the three questions → where each one is served

### 3.1 The three printed objectives

| # | Objective (as printed, from the audited extraction) | Stations that serve it | How it is practised |
|---|---|---|---|
| o1 | يتعرّف التيّار الكهربائيّ المُتواصِل | 1 origin, 2 electrons, 7 map | Close/open the circuit and watch what changes; then watch free electrons wander with the switch open and drift in one direction with it closed; the map reopens both stations |
| o2 | يحدّد جهة التيّار الكهربائيّ المُتواصِل | 3 direction, 7 map | Three reveal layers (conventional current / electron drift / energy transfer), arrows drawn on the same wires, two questions with explanatory feedback, plus the «ثلاثة أشياء لا تُخلط» card |
| o3 | يستنتج العلاقة بين شِدّة التيّار وكميّة الكهرباء وزمن مرورها | 4 ammeter, 5 relation, 7 map | The ammeter lab changes `Q` and `t` and reads `I`; station 5 states the relation in its three equivalent forms, runs a step-by-step calculator and asks four challenges (↑Q at fixed t ⇒ ↑I, ↑t at fixed Q ⇒ ↓I, a numeric application, the units) |

### 3.2 The three keywords

| Keyword | Stations that name it | How the page makes it concrete |
|---|---|---|
| الإلكترونات الحرّة | 1, 2, 3, 6, 7 | The electrons are drawn as identifiable dots whose count never changes; the drift readout separates random motion from ordered drift |
| شِدّة التيّار | 1, 2, 3, 4, 5, 6, 7 | Always defined as charge per unit time (never as energy or as power); the ammeter and the calculator both show `Q ÷ t` |
| كميّة الكهرباء | 4, 5, 6, 7 | The charge slider, the `Q = I·t` form, the symbol table (which also shows that the book writes `q` in its relation), and the challenges |

Every station header prints the objective(s) it serves and the lesson keywords it uses; this is asserted, not just displayed (`appendixCoverageReport()` in the test suite).

### 3.3 The three «ألاحظ وأستنتج» questions

| Question (as printed) | Task in station 1 | Type | Feedback |
|---|---|---|---|
| من أين نحصل على الطاقة الكهربائية؟ | `origin-1` | choice (generator / lamp / wires) | Explains that the lamp *consumes*, the wires *conduct*, and the generator is the source; quotes p87 |
| ما دور المولّد في الدارة؟ | `origin-2` | ordering (three statements) | Position-by-position feedback centred on «المولّد لا يُنتِج إلكترونات، لكنه يُسبّب حركتها»; quotes pp. 88 and 94 |
| كيف انتقلت الطّاقة الكهربائية من المولّد إلى المصباح؟ | `origin-3` | choice | Separates the energy that reaches the device from the electrons themselves, and states the three conditions (generator + closed circuit + conductor) |

### 3.4 The seven stations

| # | Station | Interaction | Tasks | Source mix |
|---|---|---|---|---|
| 1 | من أين تأتي الطاقة؟ | Switch the circuit, click any part (`generator`, `wires`, `lamp`, `switch`) to read its role, switch and parts, reset | 3 | all three from the book (p87, p88) |
| 2 | رحلة الإلكترونات الحرّة | Open/close the circuit, run/pause (or single step under reduced motion), reset; readouts of count, net displacement and travelled distance | 2 | 2 platform questions about the model; the underlying conclusion is quoted from p88 |
| 3 | أيّ جهة يسير فيها التيّار؟ | Three independent reveal switches for the conventional-current layer, the electron-drift layer and the energy-transfer arc; opposite arrows on all five outside wires | 2 | 2 from the book (p89) |
| 4 | مختبر شِدّة التيار | Two sliders (charge 10–120 C, time 10–120 s) on a live `I = Q/t` readout, a real dial needle, the printed 200 mA value, ×2 charge / ×2 time probes, reset | 4 | `ammeter-connection` from the book (p92), the other three platform |
| 5 | العلاقة بين شِدّة التيار وكمية الكهرباء والزمن | Three equivalent forms each on its own line, a target picker (I / Q / t), a validated calculator with substitution steps, unit selectors, reset, and four challenges | 4 | `relation-units` from the book (p91), the other three platform |
| 6 | المحقّق الكهربائي | One workshop scenario, seven graded tasks: four choice, one ordering, two numeric — with explanatory feedback and no penalty for retrying | 7 | 4 from the book (pp. 87, 89, 94), 3 platform |
| 7 | خريطة الفهم | Six-node concept map (generator/energy, closed circuit, free electrons, current direction, current intensity, charge & time) whose nodes reopen the station that taught them, plus a three-item self-check tied to the objectives | 0 (reflection) | platform structure over lesson content |

## 4. Book-derived material vs platform enrichment

| Category | Count | How the reader can tell |
|---|---|---|
| Tasks whose statement comes from the book | 11 of 22 | Badge «من الكتاب · ص<page>» on the task, and the explanation carries an inline `Reference / See textbook — p<page>` |
| Tasks written by the platform | 11 of 22 | Badge «شرح المنصة · Platform Explanation»; the two numeric ones also say «مثال إثرائي من إعداد المنصة» inside the prompt |
| Inline book references | 30 `ref(page, …)` calls, all on printed pages 87, 88, 89, 91, 92, 94 | Each one renders the page number; there is no reference without a page |
| Quoted printed values | the ampere convention (p89), the ampere definition (p90–91), the unit multiples and submultiples (p91), the worked application 60 C in 30 s ⇒ 2 A (p91), the 200 mA series reading (p92) | Quoted as printed values with their page; the appendix never presents them as new measurements |
| Platform-only numeric examples | 45 C in 15 s ⇒ 3 A; 90 C in 3 min ⇒ 0.5 A; 900 C ÷ 3 A = 300 s (= 5 min) | All three are labelled «من إعداد المنصة», and none of them is attributed to the book |
| Enrichment explanations | the drift speed versus the speed at which the generator's *effect* spreads, why the lamp does not consume electrons, why the two directions swap inside the generator, what the model does **not** reproduce | Each is labelled «إثراء علمي من المنصة» and is written to complement, not to contradict, the printed sentences |

The four scope notes printed on the last station state plainly: the appendix does not modify the lesson, is not part of the lesson test, reproduces no photograph or table, computes every numeric result from `I = Q/t`, labels every unprinted value, and leaves the Teacher Area password and the unit-test rules untouched.

## 5. Equation, unit and direction audit

### 5.1 The relation and its forms

| Item | Value | Verified |
|---|---|---|
| Current intensity | `I = Q / t` (`I=\dfrac{Q}{t}`) | Rendered as a single display block, `dir="ltr"`, `role="math"`, one `<div>` per form — a right-to-left page cannot reorder it |
| Charge | `Q = I · t` | Same isolation; the symbol table notes that the printed relation writes `q` |
| Time | `t = Q / I` | Same isolation |
| Units | `I` in amperes `A`, `Q` in coulombs `C`, `t` in seconds `s`; `min` offered for time, `mA` for current | `FIELD_META` in the physics module; the calculator converts before substituting and prints the conversion as its own step |
| Submultiples | 200 mA = 0.2 A, 1 mA = 10⁻³ A, 1 µA = 10⁻⁶ A, 1 kA = 10³ A | `milliampereToAmpere`, `microampereToAmpere`, `kiloampereToAmpere` with `node`-level assertions |
| Printed application | 60 C in 30 s ⇒ 2 A | Asserted; it is also the calculator's starting state and the ammeter lab's starting point |
| Printed series reading | 200 mA in the p92 series circuit | Reachable on the slider grid (20 C in 100 s) and loaded by its own button; the readout shows 0.2 A and 200 mA together |

### 5.2 Validation matrix of the calculator (never throws)

| Input | Result |
|---|---|
| `Q = 0`, `t > 0` | valid, `I = 0` — a genuine zero reading, not an error |
| `t = 0` while `I` is the target | invalid: «الزمن يجب أن يكون أكبر من صفر؛ القسمة على زمن صفري غير معرّفة.» |
| `I = 0` while `t` is the target | invalid: «قسمة كمية الكهرباء على شِدّة تيار صفرية غير معرّفة…» |
| Negative value | invalid, names the field, says the quantity is not negative |
| Empty field | invalid, asks for a value, reveals nothing, and is not counted as an attempt |
| Non-numeric text (`abc`, `NaN`) | invalid, asks for an English-digit number |
| Arabic-Indic digits (`٤٥`), Arabic decimal separator (`٫`) and the comma (`3,0`) | understood, not rejected |
| Finite but extreme values | accepted; the result is formatted without noise and in scientific form when it helps |
| Non-finite input reaching the pure model | `RangeError` from the model layer |

Every generated TeX string of a wide input sweep is rendered through the shared KaTeX wrapper with `throwOnError` in the test suite, so a relation that cannot be typeset fails the build rather than the browser.

### 5.3 Arrow directions (the part that must never be conflated)

The drawing places the generator on the top edge with its **positive terminal on the left** and its negative terminal on the right (both labelled in the scene), the lamp on the left branch and the switch on the right branch.

| Segment | Conventional current | Electron drift |
|---|---|---|
| top wire, left of the generator | left (leaving +) | right |
| left branch (through the lamp) | down | up |
| bottom wire | right | left |
| right branch (through the switch) | up | down |
| top wire, right of the generator | left (entering −) | right |
| inside the generator | − → + (right to left) | + → − (left to right) |

- Every outside segment is asserted to show the two directions **opposite**, 180° apart, with the electron arrow and the current arrow placed on different spots so they cannot be mistaken for each other.
- The conventional circulation closes: it leaves the + terminal, travels around the outside, re-enters the − terminal, and continues inside the generator from − to +.
- **One real defect was found by this audit and fixed**: `segmentDirections()` had the two generator directions inverted (it reported the current as − → … turning right and the electrons leftwards). That contradicted the module's own loop definition, the drift animation and the printed explanation. The pair is now `current: left` / `electron: right`, matching «داخل المولّد تسير الإلكترونات من الموجب إلى السالب والتيّار الاصطلاحي من السالب إلى الموجب» and keeping the two drawn wire segments consistent with the closed circulation. The fix was verified at `node -e` level and by the DOM run.
- **Electrons are never consumed**: the model keeps a fixed electron count and a fixed identity per electron; the readout says «ثابت قبل المصباح وبعده», and the test asserts that the count, the identities and the summary all survive a full circulation through the lamp.
- **Electrons are never the energy source**: the energy transfer is drawn as a separate brass arc, in a separate reveal layer, with its own explanation that the *effect* of the generator spreads quickly while the electrons themselves creep.
- Inside a closed circuit the mean net displacement grows; with the switch open the same random walk has a mean net displacement near zero. Both are asserted numerically (≈ 79.5 px net after 2 s closed versus ≈ 1.5 px open, i.e. the open case stays inside the tolerance band).
- A real break is a real break: with the switch open, no electron is drawn inside the gap (asserted through `opacity="0"` for electrons in the switch region).

## 6. Interaction verification in a real DOM

`npm test` runs the appendix against a real DOM when `jsdom` happens to be installed (it is a developer-only package here, and reports itself as *skipped* — never as passed — when it is missing). The DOM test mounts `unit2-lesson-2-appendix.html`, drives it with real clicks, input and change events, and asserts:

| Station | What was actually driven | Result |
|---|---|---|
| shell | hero description, 3 objectives, 3 keywords, 4 how-to steps, 7 rail chips, 7 panels | pass |
| 1 origin | switch on (scene state, «مضيئان», energy path flowing), part card open/close, reset; `origin-1` wrong → `التفسير العلمي` → retry → correct; `origin-2` ordering solved in three moves → correct | pass |
| 2 electrons | close the circuit, start the simulation, wait 600 ms, pause, read the count (16) and the growing net displacement, reset to 0 | pass |
| 3 direction | 5 + 5 arrows, every pair opposite per segment, the electron layer starts hidden and toggles, the energy layer toggles | pass |
| 4 ammeter | 60/30 → 2 A; ×2 charge → 4 A; ×2 time → 1 A; the printed value button → 0.2 A / 200 mA; the needle receives a `rotate(...)`; reset → 2 A | pass |
| 5 calculator | result typeset by KaTeX, 3 steps; switch to `t` (Q and I fields), reject `I = 0`, reject `bad`, accept 45 C / 3 A → 15; switch to `I`, choose `min`, 60 C in 1 min → 1 A with four steps; reset | pass |
| 6 detective | numeric wrong (`5`) → incorrect, right (`0.5`) → correct; the four-statement ordering solved; the station progress bar moves and the readout counts the solved tasks | pass |
| 7 map | concept card opens, the node is marked active, the self-check box updates the progress bar (1 → 0), a self-check row reopens the station that teaches it | pass |
| navigation | next/previous buttons, rail chips, `#station-…` deep link through `hashchange`, PageUp/PageDown/Home/End, exactly one visible station, the answers readout «… من 22 سؤالاً» | pass |

Two further checks run outside `npm test` with the same throwaway harness:

- a 12-check interaction script (`12/12` passed, `0` console errors collected),
- a 5-check reduced-motion/keyboard script (`5/5` passed): under `prefers-reduced-motion` the play button becomes «خطوة واحدة (حركة مقلّلة)», stepping still moves the cloud, and the four navigation keys work.

**Defects found by these runs and fixed** (not merely reported):

1. `mountDirection` reassigned the current layer to an array instead of toggling the layer groups, so a reveal switch did not work; the three `[data-layer]` groups are now toggled as whole groups.
2. The relation calculator only rendered the fields of its default target, so switching to `t` produced an unreachable input; all three quantities now render and only the target's two known quantities are shown.
3. `calculatorReport` was rewritten to be validation-first and target-aware, so a zero time is always an error for `I` and `Q`, a zero current is only an error for `t`, and the substituted form is chosen per target.
4. The generator direction inversion described in §5.3.
5. A tiny fix in `unit2-lesson2-appendix.js`: the platform label in the hero and the printed page range now come from the content module (and the Latin half of the label is `<bdi dir="ltr">`-isolated, as the CSS expects).

## 7. Visual identity, accessibility and responsive measurement

- **Identity**: a new daylight identity — ivory paper with a faint grid, copper for the conventional current, teal for the free electrons, brass for the energy that reaches the device — deliberately unlike the dark storm-lab `u2l1a-` appendix. The stylesheet defines its own tokens (`--paper`, `--copper`, `--flux`, `--gold`, …) inside `.u2l2a-page` and no rule of another appendix is touched.
- **Focus**: `.u2l2a-page :focus-visible` draws a 3 px outline measured at **9.46:1** on a card and **8.39:1** on the paper.
- **Touch targets**: `--target: 44px`, applied by 15 `min-block-size: var(--target)` declarations plus a 44 px square for the ordering arrows (`inline-size: var(--target)`); the CSS test fails if fewer than fifteen such rules exist.
- **States**: hover, focus-visible, pressed (`aria-pressed` with a `✓`/`○` marker, so state is never colour-only), disabled, selected, correct (`✓`), incorrect (`✗`) and invalid (`!`) each carry a sign as well as a colour.
- **Reduced motion**: exactly one looping animation exists (the energy path), it only runs while the circuit is closed, and `prefers-reduced-motion: reduce` both collapses it and switches the electrons station to single-step control; the script reads the media query and prints «حركة مقلّلة» on the button.
- **RTL/LTR**: Arabic prose is RTL; every equation, symbol, unit and numeric readout is an LTR island (`dir="ltr"` + `unicode-bidi: isolate`), including inside SVG (`<bdi dir="ltr">` in map captions and dial numbers) and inside the hero label.
- **Responsive**: explicit rules at 1080 px and 680 px, `overflow-x: auto` for the symbol table and the station rail, `overflow-x: clip` on the shell, and SVG scenes that keep their aspect ratio (`max-inline-size: 100%`).
- **Contrast (computed from the shipped tokens, WCAG 2.1)** — every result below is from the actual values in `src/unit2-lesson2-appendix.css`:

| Pair | Ratio | Verdict |
|---|---|---|
| body text on the page paper `#1b2740` / `#f4efe4` | 12.98 | AA text |
| body text on a card `#1b2740` / `#fffdf8` | 14.64 | AA text |
| strong text on a card `#101a2c` / `#fffdf8` | 17.13 | AA text |
| muted text on a card `#55617a` / `#fffdf8` | 6.12 | AA text |
| faint text on a card / on the paper `#636d82` | 5.11 / 4.53 | AA text (was `#6f7b92` at 4.20 — **darkened by this audit**) |
| copper label on a card `#9c4a16` | 6.07 | AA text |
| teal label on a card `#0f5c67` | 7.52 | AA text |
| brass label on a card `#7d5a06` | 6.19 | AA text |
| correct / incorrect / invalid feedback | 7.43 / 7.73 / 6.28 | AA text |
| book / platform / enrichment badges | 6.62 / 7.72 / 7.90 | AA text |
| copper arrows on a card `#c26a26` | 3.84 | AA graphics (≥ 3:1) |
| teal electrons on the paper `#1c8a97` | 3.57 | AA graphics (≥ 3:1) |
| control boundaries `--control-line` `#8c8271` | 3.72 (card) / 3.30 (paper) | AA graphics — **introduced by this audit** so that inputs, selects, choice rows, targets and controls keep a visible frame (the decorative hairline is 1.93 and is no longer used for control boundaries) |

## 8. Files added

| File | Lines | Contents |
|---|---|---|
| `unit2-lesson-2-appendix.html` | 129 | Standalone RTL page: topbar/breadcrumb, hero, how-to, progress section, station rail, station host, prev/next controls, footer, noscript, module script |
| `src/unit2-lesson2-appendix-physics.js` | 730 | Pure model: the circuit constants, the loop and its segment directions, the `I = Q/t` trio and unit conversions, number/LaTeX formatting, the calculator state machine and report, the ammeter and its slider grid, the seeded electron-drift model, the consistency report |
| `src/unit2-lesson2-appendix-content.js` | 1262 | All authored Arabic copy, the seven stations, 22 tasks, 6 concept nodes, 6 links, 3 self-check items, the labels and the scope notes |
| `src/unit2-lesson2-appendix-flow.js` | 413 | Station flow, hash routing, answer state for the three task kinds, progress and coverage reports |
| `src/unit2-lesson2-appendix.js` | 1564 | The seven station bodies, the SVG scenes, the controls, the interactions, keyboard and reduced-motion handling, `dispose()` |
| `src/unit2-lesson2-appendix.css` | 1472 | The new daylight identity, every state, the 44 px targets, the responsive rules and the reduced-motion block |
| `tests/unit2-lesson2-appendix.test.js` | 1276 | 27 tests: page, content coverage, physics and validation, flow, design, scope, and the conditional real-DOM run |
| `docs/unit-2-lesson-2-appendix-audit.md` | this file | Delivery report |

## 9. Files modified (shared) — minimal changes and why

`git diff --numstat` on the touched shared files: 8 files, +123 / −14.

| File | Change | Why it is unavoidable |
|---|---|---|
| `appendices.html` | +34 / −1: one new `article.appendix-library-card` (art, «Unit 2 · Lesson 2 · التيّار الكهربائي المتواصل», `Platform Extension`, title «رحلة الشحنات», 6 feature items, «ابدأ الملحق» → `./unit2-lesson-2-appendix.html`) and the header status «ثلاثة ملحقات تفاعلية» → «أربعة ملحقات تفاعلية» | the appendix must appear in the existing library; the three published cards are untouched |
| `src/appendices.css` | +63 appended: `.appendix-card-art-current` panel (paper grid, copper loop, teal drift dashes, brass dots) with `::before/::after { content: none }` so no inherited decoration leaks | the fourth card needs its own artwork; purely additive, no existing rule edited |
| `scripts/build.mjs` | +1 `cp(...)` line for `unit2-lesson-2-appendix.html` | otherwise the page would be missing from `dist/` and from GitHub Pages |
| `README.md` | +13 / −2: URL bullet, structure entries (page, five modules, test file, audit file), «three entries»→«four entries», «three appendices»→«four appendices», one paragraph describing the new appendix | documentation must match the published library and the build output |
| `tests/appendices.test.js` | card count 3→4, `Platform Extension` count 3→4, header text «ثلاثة»→«أربعة», the placeholder guard now allows `Unit 2 · Lesson 2` while still forbidding `Lesson [3-9]`, `lesson-[3-9].html`, `Unit 2 · Lesson [3-9]`, «قريباً», `Placeholder`, «قادم», and two comments | these assertions counted the published appendices; a fourth real entry breaks them by design. No assertion was deleted |
| `tests/lesson-2-appendix.test.js` | card count 3→4 (+1 comment) | same library-count assertion |
| `tests/unit-questions.test.js` | card count 3→4 | same library-count assertion |
| `tests/unit2-lesson1-appendix.test.js` | card count 3→4 | same library-count assertion |

## 10. Actual test and build results

```
node --test                     → 1..236 | tests 236 | pass 236 | fail 0 | skipped 0   (≈ 4.9 s)
                                  baseline before this work: 209/209
node --test tests/unit2-lesson2-appendix.test.js → tests 27 | pass 27 | fail 0 | skipped 0
npm run build                   → "Production static build written to dist/."
                                  dist/unit2-lesson-2-appendix.html + the five appendix modules present
```

Verification scripts run outside `npm test` (throwaway harness, not committed):

```
interaction script          → 12/12 checks, 0 console errors
reduced-motion/keyboard     → 5/5 checks
link/resource/coverage scan → 28 local resources referenced by the checked pages, 0 missing
                              0 remote references (everything is vendored)
                              12 links on the appendix page, all resolving
                              20 ids queried by the script, all present in the page markup
                              dist/ contains all six new files
class scan                  → 165 u2l2a- classes emitted by the JS; the ones without a rule are
                              SVG hook groups (data-layer containers) or companions of a styled
                              class (.u2l2a-mix-card with .u2l2a-info-card, etc.)
```

## 11. Protected areas confirmed untouched

Verified by `git status`, by `git diff --name-only`, and by explicit assertions in the new test suite:

- `unit2-lesson-2.html` — no appendix link, no appendix wording (the project's convention is that appendices are reached from `appendices.html`, exactly as with the three earlier appendices).
- `unit2-lesson-2-test.html`, `src/unit2-lesson2-*` (lesson content, main, physics, simulation, diagrams, assessment, self-check, test data, solutions, diagrams), `unit2-lesson-2-teacher.html` — untouched; the appendix imports none of them.
- `src/teacher-auth.js` — untouched; the test asserts that `verifyTeacherPassword('somer173')` is still `true` and that the retired passphrase is still rejected, without printing any secret.
- `unit2-lesson-1-appendix.html`, the two Unit 1 appendices, every lesson page, the Unit 1 Test and the Unit 1 questions pages — untouched.
- `package.json` and `vendor/` — untouched: the appendix adds no dependency, no CDN and no build tool.
- The only shared files edited are the eight listed in §9, and each edit is a registration, a count, a documentation line or additive styling.

## 12. Limitations — what could not be verified here

1. **No real browser and no phone are available in this environment.** The checks above are DOM-level (jsdom), arithmetic-level and stylesheet-level. jsdom does not implement layout, so it cannot prove that nothing overflows at a given width, that the dial and the SVG scenes scale exactly as intended, or how the page looks on a real screen. A human visual pass at ~360 px, ~768 px and ~1280 px remains required before merging.
2. Contrast was computed from the shipped colour tokens, not sampled from rendered pixels; gradients, opacity (`--copper-ring`, soft backgrounds) and antialiasing can shift the perceived result slightly.
3. Touch-target sizes are guaranteed by CSS declarations (44 px minimum) and asserted by the stylesheet test, not measured in a browser.
4. The Drift model, the ammeter and the calculator are teaching models: the on-screen speeds are not physical measurements, the dial range is 0–12 A by design, and the appendix says so on the page.
5. The DOM run depends on `jsdom`, which is not a dependency of this repository (the project ships zero dependencies). Without it, that single test reports itself as **skipped** with an explicit reason; the other 26 tests are dependency-free and always run.
6. The four earlier test files listed in §9 had to be touched for the library count; nothing else in them was changed, but that means this PR does not leave those four files byte-identical.
