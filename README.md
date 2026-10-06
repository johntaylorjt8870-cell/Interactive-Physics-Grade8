# Interactive Physics Grade 8 — Lesson 1: Concurrent Forces

Arabic (RTL) interactive lesson on **Concurrent Forces and Force Resolution** for Grade 8 physics, based on textbook pages 55–62.

The student area keeps the textbook wording, order, values, and examples, while the platform layer adds clearly-labelled explanations, accessible SVG diagrams, four guided simulations, interactive self-check, a separate Teacher Area, and a 20-question Lesson Test.

## Contents

- [Running the app](#running-the-app)
- [Project structure](#project-structure)
- [Rendering architecture](#rendering-architecture)
- [Textbook fidelity and source disclosure](#textbook-fidelity-and-source-disclosure)
- [Student experience](#student-experience)
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

- Student lesson: http://127.0.0.1:4173/index.html
- Lesson Test: http://127.0.0.1:4173/lesson-test.html
- Teacher Area: http://127.0.0.1:4173/teacher.html

Modules and vendored fonts must be served over HTTP; opening the HTML files directly with `file://` will not work in modern browsers.

## Project structure

```text
index.html                  Sequential student lesson
teacher.html                Separate Teacher Area page
lesson-test.html            20-question Lesson Test page
scripts/build.mjs           Static production build
src/
  main.js                   Page router and lesson mounting
  lesson-content.js         Structured textbook content (verbatim blocks + platform explanations)
  math.js                   Math rendering API (KaTeX wrapper, vectors, units, LTR isolation)
  diagrams.js               Static SVG diagrams
  simulations.js            Interactive simulation markup
  simulation-logic.js       Pure geometry / physics used by simulations
  self-check.js             Self-check enhancement layer
  self-check-answers.js     Frozen answer key for the printed self-check
  teacher.js / teacher-content.js / teacher-auth.js
  lesson-assessment.js      Lesson Test flow (question → answer → results)
  lesson-test-engine.js     Pure grading and solution logic
  lesson-test-data.js       20 questions (no answers embedded)
  lesson-test-solutions.js  Answer key and worked solutions (loaded only at submission)
  lesson-test-diagrams.js   Static diagrams used by the test
  fonts.css                 @font-face rules pointing at the vendored fonts
  styles.css                Student design system
  teacher.css / lesson-test.css
vendor/
  katex/                    KaTeX 0.16 (ES module + trimmed CSS + woff2 math fonts)
  fonts/                    IBM Plex Sans Arabic + Manrope woff2 subsets
tests/                      Node test suites (70 tests)
```

## Rendering architecture

All mathematics is rendered through **KaTeX 0.16** (vendored, server-side rendered to HTML + MathML at module load) behind a single wrapper, `src/math.js`:

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

## Student experience

- Sidebar navigation follows pages 55–62 in book order, with prev/next controls and keyboard support.
- Each page: learning goal → verbatim textbook content → platform explanation → diagram/simulation → worked structure where the book solves an example.
- Self-check answers (p61–62) are interactive, graded locally against the frozen printed key, with explanations after checking.

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

`teacher.html` is password-gated (the project password), separate from the student bundle. It provides page-by-page teaching objectives, exact source content in collapsible disclosures, step-by-step worked solutions (answer separated from explanation), limitations of each simulation, common misconceptions, and clearly-labelled extended mathematics (e.g. the cosine law for p58).

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
npm test          # 70 Node tests: content fidelity, diagram geometry, simulation logic,
                  # grading purity, assessment flow, teacher area
npm run build     # static build into dist/ (html + src + vendor)
```

`npm run build` creates `dist/` with the three HTML pages, `src/`, and the vendored `vendor/` tree; serve `dist/` the same way as the project root.
