# Interactive Physics — Grade 8

A small, dependency-free Arabic RTL lesson app for **Unit 2 — الحركة والقوى**, Lesson 1 — **القوى المتلاقية** (textbook pages 55–62).

## Run locally

```sh
npm start
```

Then open `http://localhost:4173`.

## Validate and build

```sh
npm test
npm run build
```

The production build copies the static app into `dist/`; no package installation is required. The app uses native MathML for isolated LTR scientific notation and provides page-by-page lesson navigation. The current implementation is Phase 1 only; it does not include simulations, a Teacher Area, or a student/unit test.
