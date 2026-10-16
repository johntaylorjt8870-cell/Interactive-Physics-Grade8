# Unit 2 · Lesson 3 appendix audit — «محطة الفولت — اكشف فرق الكمون»

Standalone interactive enrichment appendix for the Lesson 3 page of Unit 2
(فرق الكمون الكهربائي, textbook pp97–106). This document records what was
reviewed, what was authored, how the electrical model works, and the actual
verification results. It accompanies `unit2-lesson-3-appendix.html` and the
five source files `src/unit2-lesson3-appendix-{physics,content,flow,js,css}`.

## 1. Source pages reviewed and clarity

| Source | What could be read | Clarity |
| --- | --- | --- |
| `unit2-lesson-3.html` (published student page) | Full lesson text for pp97–106 as published on the platform | Clear |
| `docs/unit-2-lesson-3-source-audit.md` | Earlier page-by-page audit of the same spread: objectives p97, keywords p97, voltmeter definition and parallel connection p99/p104, active/passive dipole p100/p104, series relation p101–102, parallel relation p103, units kV/V/mV and the 25 kV conversion p105 | Clear |
| `src/unit2-lesson3-content.js` | The published lesson content module (protected, read-only for this work) | Clear |
| Printed page images / PDF | **Not available in this environment.** Every book claim below is therefore taken from the two audited in-repo sources above, and each carries a `من الكتاب · صNN` badge only where those sources state it | — |

Nothing was re-uploaded or requested from the user: the in-repo sources were
sufficient, and every citation in the appendix stays inside pp97–106 (enforced
by `tests/unit2-lesson3-appendix.test.js`).

## 2. Objective / keyword → station mapping

| Confirmed objective (p97 wording) | Stations serving it |
| --- | --- |
| يتعرّف فرق الكمون الكهربائي. | 1 «ما الذي يقيسه مقياس الفولت؟», 4 «خريطة الكمون على الدارة», 7 «خريطة المفاهيم» |
| يقيس تجريبياً فرق الكمون بين نقطتين في دارة كهربائية. | 2 «وصّل مقياس الفولت بنفسك», 4, 6 «محقّق القياسات» |
| يميّز بين ثنائي القطب الفعّال وغير الفعّال. | 3 «ثنائي قطب فعّال أم غير فعّال؟», 6, 7 |
| يربط بين فرق الكمون الكلي وفروق الكمون الجزئية في الدارات الكهربائية. | 5 «هل يساوي فرق الكمون الكلي مجموع الفروق الجزئية؟», 6, 7 |

| Confirmed keyword (p97) | Where it is taught interactively |
| --- | --- |
| فرق الكمون | Stations 1, 2, 4, 5 (measured live on the bench) |
| مقياس فولت | Stations 1, 2 (the big digital meter, unit V, parallel connection) |
| ثنائي قطب فعّال | Stations 3, 6, 7 (source trials) |
| ثنائي قطب غير فعّال | Stations 3, 6, 7 (lamp / wire / open-switch trials) |

The mapping is machine-checked: `appendixCoverageReport()` fails the test suite
if any objective loses its station or its self-check row, or any keyword is no
longer taught by a station.

## 3. Source vs enrichment separation

- Book-sourced statements (definition of فرق الكمون, the voltmeter and its
  parallel connection, the two dipole classes, `U = U₁ + U₂` in series,
  `U = U₁ = U₂` in parallel, the 12 V/5 V→7 V and 6 V printed activities, the
  kV/V/mV family and 25 kV) appear only with a `من الكتاب · صNN` badge and only
  inside the reviewed range.
- Platform-authored explanations carry `شرح المنصة · Platform Explanation` or
  `إثراء علمي من المنصة`; every schematic carries
  «رسم إثرائي توضيحي — ليس نقلاً مؤكداً لشكل الكتاب», and every scene carries
  «نموذج تعليمي مبسّط — Educational simplified model».
- The detective station prints «تحديات من إعداد المنصة · ليست أسئلة اختبار
  الدرس ولا جزءاً من منطقة المعلم»; no score is shown before submit and no
  total grade is ever displayed.
- Scope notes at the top of the page state that the appendix changes nothing in
  the published lesson, is not part of the lesson test, and is not linked to
  the teacher area.

## 4. Active / passive dipole: definitions and verification source

- Definition used (book-sourced, p100/p104): an **active dipole** (ثنائي قطب
  فعّال) causes a potential difference between its terminals and can drive a
  current in a closed circuit (the generator); a **passive dipole** (ثنائي قطب
  غير فعّال) does not create a difference of its own — a lamp alone between
  dead wires reads 0 V — yet inside a driven closed loop it *does* show a
  difference between its terminals.
- Verification in the appendix never rests on one reading: station 3 runs two
  trials per element (alone with open terminals; inside a closed loop with a
  lamp) plus the «ولكن انتبه» note computed by `receiverInsideDrivenLoop`
  (a passive receiver inside a driven loop shows `U = I·R` across it, e.g.
  4 V for 6 V, 4 Ω against 2 Ω). The model functions are
  `dipoleTrials(kind)` and `receiverInsideDrivenLoop(kind)` in
  `src/unit2-lesson3-appendix-physics.js`, unit-tested in
  `tests/unit2-lesson3-appendix.test.js`.

## 5. Voltage-measurement model logic

- One consistent electrical model per bench layout (`single`, `series2`,
  `series3`, `parallel2`): ideal source of emf `E`, ideal wires and closed
  switch (0 V), lamps as resistances of one ohm per share unit.
- Potentials are solved by walking each loop once from the positive terminal
  (`createCircuit`); with the switch open the current is zero, every lamp keeps
  0 V, the conductor chain still joined to the + terminal sits at `E`, and the
  open switch carries the whole `E`. The solver throws if the walk does not
  return to the source potential, so an inconsistent circuit cannot render.
- A reading is always `U(red→black) = V(red) − V(black)` (`voltmeterReading`),
  i.e. the meter is connected **on the branch (parallel)** between exactly the
  two touched nodes; reversed probes give the negative value with the same
  magnitude and an explicit «المجسّان معكوسان» message — never a different
  number.
- Reference independence: `withReference` shifts every node potential by one
  constant; the test suite asserts readings are unchanged, and station 4 lets
  the student verify it live (the compared differences survive a reference
  change).
- Series wiring fault (meter inserted inside the path) is modelled as an open
  loop: lamp dark at 0 V while the meter reads the whole source difference
  (`seriesConnectionFault`), used to teach parallel vs series connection.
- Controls genuinely change results: emf 1–15 V step 0.5 and shares 1–12 Ω are
  swept exhaustively in the tests (1 728 combinations on `series2`), asserting
  `U₁ + U₂ = U_total = E` and `U₁/U₂ = R₁/R₂` everywhere.

## 6. Total vs partial testing

- `seriesRelation` computes each lamp difference from the solved potentials,
  sums them and compares with the source difference; `parallelRelation`
  asserts branch equality and states *why* the additive rule does not apply
  there («الفروع موصولة بين العقدتين نفسيهما»).
- Book presets reproduce the printed activities exactly: series 12 V with
  7 V + 5 V (p102) and parallel 6 V on both branches (p103); both are one-click
  presets in station 5 and asserted in the tests.
- Station 5 is predict-then-reveal: partial values stay hidden («القراءة
  مخفية حتى تقيس») until the student records a prediction and presses «قِس
  الآن»; the verdict compares prediction with the model total and explains
  mismatches.
- The exhaustive sweep of §5 is the machine-level total-vs-partial test; the
  browser interaction run re-verified it live (prediction 6 V matched the
  measured 6 V; the p102 preset displayed 7/5/12).

## 7. Actual test and build results (this branch)

- `npm test` before the appendix (baseline on `main`): 238 tests, 237 pass,
  0 fail, 1 skip.
- `npm test` after the appendix: **260 tests, 260 pass, 0 fail, 0 skip**
  (the new file adds 22 tests, including a jsdom DOM run of the published
  page; jsdom is a developer-only package installed with `--no-save`, and the
  DOM block self-skips when it is absent).
- `npm run build`: **success** — `dist/` now contains 25 HTML entries
  including `unit2-lesson-3-appendix.html`.
- Shared-count assertions updated from four to five published appendices in
  `tests/appendices.test.js`, `tests/lesson-2-appendix.test.js`,
  `tests/unit-questions.test.js`, `tests/unit2-lesson1-appendix.test.js`,
  `tests/unit2-lesson2-appendix.test.js` and `README.md`; the
  «no future appendices» guard now rejects Lesson 4+ instead of Lesson 3+.

## 8. RTL / LTR, symbols and units audit

- Page is `<html lang="ar" dir="rtl">`; every numeric or symbolic run is
  isolated with `<bdi dir="ltr">` or `dir="ltr"` spans (readings, node
  letters, formulas), and the DMM screen forces `direction: ltr` so «4 V»
  never renders as «V 4».
- SVG `<text>` inherits the document direction: every numeric/± label in the
  hero and bench scenes carries an explicit `direction="ltr"` (a missing one
  mirrored the `text-anchor` side — caught in the first browser pass and fixed).
- Equations are rendered by KaTeX on their own line with Arabic `aria-label`s
  (`U=U₁+U₂++Uₙ`, `U=U₁=U₂`, `U_{AB}=V_A−V_B`); 18 KaTeX nodes render on load
  with zero console errors.
- Unit discipline: the volt (V) is the only unit on meter screens; conversions
  stay inside the volt family (`convertVoltage` throws on non-volt units, e.g.
  A); the appendix never describes فرق الكمون as current, charge or energy —
  station 1 exists precisely to separate those, and question feedback repeats
  the distinction.

## 9. Laptop visual review (real browser)

- Environment: headless Chromium (puppeteer-core + stub NSS libs) at
  **1366×768** and **1440×900**, served by `python3 -m http.server` from the
  repo root — a real rendering engine, not a simulation.
- Metrics: `scrollWidth == clientWidth` at both widths (no horizontal
  overflow), 7 stations present, 18 KaTeX nodes, zero console errors, zero
  page errors, zero failed requests.
- Per-station capture: all seven stations visible with **0 clipped elements**
  each; screenshots reviewed by eye at both widths.
- Interaction run (26 scripted checks, all PASS): measure/open/reset in
  station 1; node clicks and probe arming in station 2 (readings 4 → −2 → −6 →
  0 → 12 → 9.6 → open-switch 12 → fault 12, reset to 4, comparison table row,
  keyboard Enter on a focused node); prediction→reveal and both book presets
  in station 5; probe-question selects (correct/incorrect), numeric 25 000 and
  the ordering task in station 6; checklist 4/4 and concept-card opening in
  station 7.
- Fixes made after the first visual pass: terminal/title labels lifted clear
  of the node halos, probe handles moved out of the label band, concept-map
  bottom nodes separated, first concept card open by default, DMM digits
  forced LTR, empty trial log hidden, probe-question scene width capped.
- Geometry is also guarded analytically: the test suite rebuilds every label
  box, node halo, probe handle and drawn solid for all four layouts and fails
  on any overlap or out-of-view box.
- Remaining limits: no touch-device or screen-reader field test was performed
  (keyboard focus order, `aria-live` regions and contrast tokens are designed
  and CSS-checked but not verified with assistive technology); small screens
  (≤560 px) stack to a single column and remain usable but were not the design
  target; printed-page images were unavailable, so book figures are described,
  never copied.

## 10. Changed files and protected-file confirmation

New files:

- `unit2-lesson-3-appendix.html` — standalone RTL page (hero bench SVG, hooks,
  noscript fallback, module script).
- `src/unit2-lesson3-appendix-physics.js` — electrical model.
- `src/unit2-lesson3-appendix-content.js` — objectives, keywords, stations,
  26 questions, concept map, scope notes.
- `src/unit2-lesson3-appendix-flow.js` — station flow, explicit-submit answer
  state, checklist, coverage/integrity reports.
- `src/unit2-lesson3-appendix.js` — view: scenes, probes, meters, interactions.
- `src/unit2-lesson3-appendix.css` — isolated measurement-lab design system.
- `tests/unit2-lesson3-appendix.test.js` — 22 tests for the layers above.
- `docs/unit-2-lesson-3-appendix-audit.md` — this document.

Modified shared files (each kept minimal, each explained):

- `appendices.html` — fifth library card + status line «خمسة ملحقات تفاعلية».
- `scripts/build.mjs` — one `copy` line so `dist/` ships the new page.
- `src/appendices.css` — one appended `.appendix-card-art-voltage` art block.
- `tests/appendices.test.js`, `tests/lesson-2-appendix.test.js`,
  `tests/unit-questions.test.js`, `tests/unit2-lesson1-appendix.test.js`,
  `tests/unit2-lesson2-appendix.test.js` — card-count 4→5, «أربعة»→«خمسة»,
  future-appendix guard narrowed to Lesson 4+, plus three new assertions that
  the fifth card is real.
- `README.md` — library URL list, file map and the build paragraph now say
  five appendices.

Protected artefacts confirmed untouched (asserted in the new test file):
`unit2-lesson-3.html`, `unit2-lesson-3-teacher.html`,
`src/unit2-lesson3-test-data.js`, `src/unit2-lesson3-test-solutions.js`,
`src/teacher-auth.js` (salted verifier unchanged: same derived key and
180 000 iterations; the passphrase itself never appears in the repo),
`index.html`, every earlier appendix page and module, and the unit-test rules.
No new unit test was created and no Vercel or platform-wide change was
introduced; GitHub Pages delivery and `scripts/build.mjs` remain the only
build path.
