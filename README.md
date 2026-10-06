# Interactive Physics Grade 8 — Course Home

Arabic (RTL) interactive physics platform for Grade 8. The course home is the root entry; the currently published Lesson 1 covers **Concurrent Forces and Force Resolution** based on textbook pages 55–62.

The student area keeps the textbook wording, order, values, and examples, while the platform layer adds clearly-labelled explanations, accessible SVG diagrams, four guided lesson simulations, interactive self-check, a separate Teacher Area, and a 20-question Lesson Test. The Unit 1 review at `unit-questions.html` presents the original textbook questions from pages 71–72 as a standalone review (not a third lesson), with worked solutions in its password-gated Teacher Area. A separate Lesson 1 Appendix adds a multi-force exploration lab without changing the published lesson.

## Contents

- [Running the app](#running-the-app)
- [Project structure](#project-structure)
- [Rendering architecture](#rendering-architecture)
- [Textbook fidelity and source disclosure](#textbook-fidelity-and-source-disclosure)
- [Course navigation](#course-navigation)
- [Lesson Appendices](#lesson-appendices)
- [Student experience](#student-experience)
- [Unit Questions review](#unit-questions-review)
- [Interactive simulations](#interactive-simulations)
- [Teacher Area](#teacher-area)
- [Lesson Test](#lesson-test)
- [Accessibility](#accessibility)
- [Tests and build](#tests-and-build)

## Running the app

No installation is required for the app itself; every asset (fonts, KaTeX) is vendored in this repository and served over HTTP.

```bash
npm start
# or
python3 -m http.server 4173
```

Then open:

- Course Home: http://127.0.0.1:4173/index.html
- Student Lesson 1: http://127.0.0.1:4173/lesson-1.html
- Lesson Appendices: http://127.0.0.1:4173/appendices.html
- Lesson 1 Appendix: http://127.0.0.1:4173/lesson-1-appendix.html
- Lesson 2: http://127.0.0.1:4173/lesson-2.html
- Lesson 2 Appendix: http://127.0.0.1:4173/lesson-2-appendix.html
- Unit 1 Questions: http://127.0.0.1:4173/unit-questions.html
- Unit 1 Questions Teacher Area: http://127.0.0.1:4173/unit-questions-teacher.html
- Lesson Test: http://127.0.0.1:4173/lesson-test.html
- Teacher Area: http://127.0.0.1:4173/teacher.html

Modules and vendored fonts must be served over HTTP; opening the HTML files directly with `file://` will not work in modern browsers.

## Project structure

```text
index.html                  Course Home / platform entry
lesson-1.html               Published Lesson 1 student page (preserved)
appendices.html             Published appendices library
lesson-1-appendix.html      Standalone Lesson 1 interactive appendix
lesson-2.html               Published Lesson 2 student page (preserved)
lesson-2-appendix.html      Standalone Lesson 2 interactive appendix (parallel forces)
unit-questions.html         Unit 1 textbook-question review (pages 71–72)
unit-questions-teacher.html Password-gated worked-solution Area for the review
teacher.html                Separate Lesson 1 Teacher Area page
lesson-test.html            20-question Lesson Test page
docs/unit-1-questions-source-audit.md Source Audit for pages 71–72
scripts/build.mjs           Static production build
src/
  main.js                   Lesson-page navigation and mounting
  lesson-content.js         Structured textbook content (verbatim blocks + platform explanations)
  math.js                   Shared KaTeX API (vectors, units, LTR isolation)
  appendix-physics.js       Independent multi-force/resultant/motion model for the appendix
  appendix-practice.js      Explicit-submit-only appendix practice state
  lesson-1-appendix-content.js Presets, worked example, practice and challenge data
  lesson-1-appendix.js      Appendix lab, SVG, controls and interactions
  diagrams.js               Static lesson SVG diagrams
  simulations.js            Existing lesson simulation markup
  simulation-logic.js       Existing pure geometry / physics used by lesson simulations
  self-check.js             Self-check enhancement layer
  self-check-answers.js     Frozen answer key for the printed self-check
  teacher.js / teacher-content.js / teacher-auth.js
  lesson-assessment.js      Lesson Test flow (question → answer → results)
  lesson-test-engine.js     Pure grading and solution logic
  lesson-test-data.js       20 questions (no answers embedded)
  lesson-test-solutions.js  Answer key and worked solutions (loaded only at submission)
  lesson-test-diagrams.js   Static diagrams used by the test
  fonts.css                 @font-face rules pointing at the vendored fonts
  home.css                  Course Home design system
  appendices.css            Course Home appendices entry + library page
  styles.css                Student lesson design system + shared math styles
  lesson-1-appendix.css     Isolated responsive lab design
  lesson-2-appendix-physics.js Parallel-force model: intensities, carriers, resultant position, challenges
  lesson-2-appendix-content.js Authored «من الكتاب» / «شرح المنصة» content, presets and challenges
  lesson-2-appendix.js      Parallel-forces lab, SVG scene, controls and interactions
  lesson-2-appendix.css     Isolated responsive lab design for the parallel-forces lab
  unit-questions-content.js Source text, page audit, and platform-only hints for pp71–72
  unit-questions-teacher-content.js Lazily loaded worked solutions and teacher diagrams
  unit-questions.js         Student Area mount for the standalone review
  unit-questions-teacher.js Password-gated Teacher Area mount
  unit-questions.css        Responsive Unit Questions student-page styles
  unit-questions-teacher.css Isolated teacher-diagram styles
  teacher.css / lesson-test.css
tests/
  appendices.test.js        Navigation, practice flow, direct-page and preservation checks
  appendix-physics.test.js  Resultant, force editing, presets, challenge and motion tests
vendor/
  katex/                    KaTeX 0.16 (ES module + trimmed CSS + woff2 math fonts)
  fonts/                    IBM Plex Sans Arabic + Manrope woff2 subsets
```

## Rendering architecture

All mathematics is rendered through **KaTeX 0.16** (vendored and rendered to HTML + MathML by the browser-side ES modules at module load) behind a shared wrapper, `src/math.js`:

- `tex(source, label)` / `formula(source, label)` — inline and display math. Every expression carries an `aria-label` describing it in words, and the original TeX is preserved in a MathML `<annotation>`.
- `vector(symbol, subscript)` — true vector accents (`\vec{F}_{1}`): the arrow sits over the letter and the subscript attaches to the accented symbol.
- `qty(value, unit)` / `unit(name)` — values and units render LTR with a non-breaking thin space (`100 N`, never `N 100`).
- `ltrText(text)` — `<bdi dir="ltr">` isolation for Latin text embedded in Arabic prose.
- `solutionSteps(rows)` — the worked-problem structure (المعطيات / المطلوب / القانون / التعويض / الحساب / الوحدة / التحقق).

Arabic prose is RTL; every math expression, number, unit, and vector is an LTR-isolated island. Long printed derivations (the three-line Pythagoras block on p59) render as labelled display lines carrying `data-source-line` attributes with the exact printed text.

Fonts are vendored in `vendor/` (no CDN): IBM Plex Sans Arabic for Arabic UI and prose, Manrope for Latin UI, and the KaTeX math fonts for equations.

## Textbook fidelity and source disclosure

- Book paragraphs, lists, questions, values, units, and example order are reproduced verbatim inside `book` blocks, each page labelled with its printed page number.
- Platform additions are visually separated and labelled («شرح من المنصة», «رسم توضيحي من المنصة», «محاكاة تفاعلية من المنصة»).
- Blurred or unreadable source artwork is **not** replaced with invented reconstructions: a labelled source slot marks its position, and ambiguous symbols (e.g. the small arrow printed as `R` on p60, the angle letter `a`) are disclosed as unresolved rather than guessed.
- The printed approximate result on p58 (measured from the drawing) is preserved and explained; the exact trigonometric verification is labelled as teacher-only extended content.

## Course navigation

- The root URL (`index.html`) is the Course Home, not a lesson.
- The published Lesson 1 has a stable direct URL at `lesson-1.html` and links back to the Course Home.
- `unit-questions.html` is a separate Unit 1 review for textbook pages 71–72, linked from the Unit 1 panel and Lesson 2; it is not part of the lesson list and is not the Unit 1 Test.
- `unit-questions-teacher.html` is the review's separate, password-gated Teacher Area. It reuses the existing verifier and lazy-loads its solutions only after authorization.
- The appendices library is `appendices.html`; its two entries link to `lesson-1-appendix.html` and `lesson-2-appendix.html`.
- Every appendix page is a static direct URL with ordinary relative links, so refresh does not depend on a client-side router.
- The unit and lesson list keeps only the published lessons; no future appendix cards or placeholders are shown.

## Lesson Appendices

The Lesson 1 Appendix is an independent platform extension; it does not edit or duplicate the textbook page flow. Its force engine lives in `src/appendix-physics.js` and sums each force's signed x/y components. It supports one to three concurrent forces and has unit-tested add/remove/update operations, preset states, target-resultant evaluation, and a bounded visual motion model.

The lab uses a fixed educational mass of 2 kg and `a = F_R / m`. Motion has no drag, rotation, or collisions; animation time and screen position are explicitly not real-world measurements. A force preset updates the controls, vectors, resultant and explanatory prompt together. The page also includes a stepped KaTeX worked example, submit-to-check practice with explanatory feedback, and a challenge that asks the student to balance three forces using the lab.

All of this material is labelled as a platform extension. It is practice/exploration, not textbook wording or part of the official Lesson Test.

The Lesson 2 Appendix («ملحق الدرس الثاني — القوى المتوازية») follows the same architecture for pages 63–70. Its lab puts two parallel forces on a horizontal rod and lets the student change `F_{1}`, `F_{2}` and both carrier positions in the same-sense and opposite-sense cases. `src/lesson-2-appendix-physics.js` owns the model (slider clamping, the resultant's intensity, sense, carrier position and the moment products) and delegates both textbook cases to the published Lesson 2 model in `src/lesson-2-physics.js`; the platform-only derivation of the carrier position is labelled «شرح المنصة», while the quoted relations stay labelled «من الكتاب». Equal-and-opposite forces are shown as a zero resultant with no single carrier, drawn as a rotational effect instead of an arrow. The four exploratory challenges are verified reachable on the real slider grid by the test suite and are checked only when the student asks; the scene keeps a `prefers-reduced-motion` path and carries the «نموذج تعليمي مبسّط — Educational simplified model» label.

## Student experience

- Sidebar navigation follows pages 55–62 in book order, with prev/next controls and keyboard support.
- Each page: learning goal → verbatim textbook content → platform explanation → diagram/simulation → worked structure where the book solves an example.
- Self-check answers (p61–62) are interactive, graded locally against the frozen printed key, with explanations after checking.

## Unit Questions review

- The review reproduces the three numbered prompts on pages 71–72 in printed order: four multiple-choice items, one written resultant task, and two problems with three parts each.
- Each page excerpt is labelled with its printed page reference. Page 72 continues the first problem before introducing the second.
- Platform hints are labelled separately from the source. No preprinted diagram or table appears on the supplied pages; the requested drawings are student tasks. Teacher-only solution diagrams are labelled as platform illustrations.
- The full page-by-page source audit is `docs/unit-1-questions-source-audit.md`; the KaTeX source blocks and page map are covered by `tests/unit-questions.test.js`.

## Interactive simulations

Four simulations (p56, 57, 59, 60) are built on pure functions in `simulation-logic.js` (unit-tested):

| Page | Simulation | Controls |
|---|---|---|
| 56 | Spring concurrency | application point ×, y |
| 57 | Two concurrent forces | F₁, F₂ magnitudes, angle (with guided angle sweep) |
| 59 | Perpendicular resultant | F₁, F₂ magnitudes |
| 60 | Force resolution on axes | magnitude, angle (with guided angle sweep) |

Every simulation is explicit that it is a platform interaction, states what it does and does not model, and starts from exploration defaults — never presented as book data.

## Teacher Area

`teacher.html` is the Lesson 1 password-gated Teacher Area, separate from the student bundle. It provides page-by-page teaching objectives, exact source content in collapsible disclosures, step-by-step worked solutions (answer separated from explanation), limitations of each simulation, common misconceptions, and clearly-labelled extended mathematics (e.g. the cosine law for p58). `lesson-2-teacher.html` covers Lesson 2. `unit-questions-teacher.html` is the separate Teacher Area for the Unit 1 review; it reuses the existing password verifier and includes worked answers for every page 71–72 item, with source excerpts and teacher-only diagrams.

## Lesson Test

- 20 questions: 6 Basic, 7 Medium, 4 Advanced, 3 Thinking.
- Flow: question → draft answer (progress only, never graded or persisted) → final submission → results and per-question worked solutions.
- Answer key and solutions live in `lesson-test-solutions.js`, dynamically imported only after final submission.
- Restart clears answers and returns to question 1. No unit test is included.

## Accessibility

- `lang="ar" dir="rtl"` documents with LTR-isolated math islands.
- SVG diagrams use `role="img"` with `<title>`/`<desc>`; force symbols are grouped `F` + subscript + vector arrow.
- Simulation sliders are native ranges with `aria-valuetext`; results are announced via live regions.
- The Lesson Test has a skip link, progress bar, dialog-based confirmation, and visible focus states.

## Tests and build

```bash
npm test          # 147 Node tests: source fidelity, navigation, simulation and appendix physics,
                  # Unit Questions coverage, practice feedback, assessment flow, teacher area
npm run build     # static build into dist/ (all HTML entries + src + vendor)
```

`npm run build` creates `dist/` with the Course Home, Lessons 1 and 2, the standalone Unit 1 Questions student and teacher pages, the appendices library and two appendices, Lesson 2 test and teacher pages, the Unit 1 Test, `src/`, and the vendored `vendor/` tree; serve `dist/` the same way as the project root.
