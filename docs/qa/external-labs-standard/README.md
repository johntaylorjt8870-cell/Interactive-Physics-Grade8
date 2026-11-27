# Evidence for `docs/EXTERNAL-LABS-STANDARD.md`

Real-browser evidence captured while writing the standard, using the repository's existing QA
pattern (`playwright-core` + `@sparticuz/chromium`, installed **outside** the repository).

- **Date:** 2026-11-27
- **Build:** `npm run build` on `main` @ `3d3c0e9` (clean checkout), served with
  `python3 -m http.server 4173 --directory dist`
- **Browser:** Chromium 141.0.7390.0 (headless, `@sparticuz/chromium`)
- **Tools:** `playwright-core` 1.56.1, `@sparticuz/chromium` 141.0.0 (installed in `/tmp`, none committed)
- **Viewports:** exactly 1366×768 and 1440×900

No application code, lab source, build script or test was modified to produce this evidence.

## Navigation path actually exercised

`index.html` → click «المخبر» → `almakhbar.html` → click «افتح المختبر» →
`lab-unit2-lesson1.html` → lab iframe → click «المخبر» → back to `almakhbar.html`.

Measured results at both viewports:

| Check | 1366×768 | 1440×900 |
|---|---|---|
| Directory page `<h1>` | المخبر | المخبر |
| Wrapper top bar height | 56 px | 56 px |
| Wrapper document scroll width vs. viewport | 1366 / 1366 (no overflow) | 1440 / 1440 (no overflow) |
| Lab iframe document scroll width vs. viewport | 1366 / 1366 | 1440 / 1440 |
| Return link «المخبر» navigates back | yes | yes |
| Lab `<title>` | `مختبر الكهرباء الساكنة \| الوحدة الثانية · الدرس الأول · فيزياء الثامن` | same |
| Lab station tabs present | 8 | 8 |

Screenshots: `wrapper-1366x768.png`, `wrapper-1440x900.png`.

## Finding: the lab's math renders wrongly when its CDN is unreachable

The first lab loads the **KaTeX stylesheet from `cdn.jsdelivr.net`** and its fonts from
**`fonts.googleapis.com`**. In this sandbox both origins are unreachable (verified with `curl`:
HTTP `000`), so the browser reports:

```text
Failed to load resource: net::ERR_CONNECTION_CLOSED  (x2)
https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css   → failed
https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic…  → failed
```

KaTeX still runs and emits its visual layer, but without its stylesheet the layer is read as flat
text. The Coulomb law renders as:

```text
F = Kd2|q1 q2|      <!-- visually: "F = Kd2|q1 q2|" -->
```

which a learner reads as `F = K·d²·|q₁q₂|` — **wrong by a square in the wrong place**.

The same station's derivation of the inverse square renders as:

```text
F ∝ 4πd21   ⟹   F ∝ d21
```

i.e. `F ∝ 4πd²₁ ⟹ F ∝ d²₁` instead of `F ∝ 1/(4πd²) ⟹ F ∝ 1/d²`. Two hand-written relations, both
inverted, with no error state anywhere in the UI.

Screenshots:

- `lab-coulomb-katex-blocked-1366x768.png` — the Coulomb station as rendered (header reads
  «مختبر قانون كولوم»; the book card is labelled «من الكتاب · ص 80»).
- `card-coulomb-katex-blocked-1366x768.png` — close-up of the inverted-square derivation. The same
  crop also shows the tab strip clipping «اختبر نفسي» at the left edge (finding D13).

Why the platform does not have this defect:

| | KaTeX CSS | Fonts | MathML fallback |
|---|---|---|---|
| Platform (`src/math.js`: `output: 'htmlAndMathml'`) | vendored at `./vendor/katex/katex.min.css` | vendored under `vendor/fonts` | yes |
| First external lab (`src/lib/math.tsx`: `output: "html"`) | CDN | Google Fonts CDN | **no** |

This is a property of the **lab**, not of the standard. It is recorded here because it is the
concrete reason §2 P4 requires declared external origins and §3.3 requires a text/accessibility
fallback for math.

## What this evidence does NOT establish

- It does not establish how the lab looks on a normal network, where the CDN resolves. On a normal
  network the CDN styling applies and the formulas render normally.
- It is not an acceptance record for the first lab; that lab was integrated before this standard
  existed, and its own report (`INTEGRATION-REPORT.md`) records no browser evidence.
- It is not a regression baseline. It documents the current state of `main` for the standard's
  Appendix A.

## Reproduce

```bash
npm run build
python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
# in a separate QA install (outside the repository):
#   npm i playwright-core@1.56.1 @sparticuz/chromium@141.0.0
#   QA_MODULE_DIR=/path/to/qa/node_modules node <script>.mjs
```

On minimal Linux the bundled `al2023.tar.br` libraries must be extracted and exposed through
`LD_LIBRARY_PATH` (this environment needed `libnspr4.so`, `libnss3.so`, `libnssutil3.so`).
