# Official External Physics Labs Integration Standard

**Status:** Active — official repository standard
**Applies to:** every external physics lab added to the Interactive Physics Grade 8 platform
**Owner / approver:** repository owner (`johntaylorjt8870-cell`)
**Authority:** this file. Conversation history, agent memory and chat transcripts are **not** authoritative.
**Version:** 1.2 — 2026-11-27, verified against `main` @ `3d3c0e9fce9cea820036f4663627ff7d1ee14397`

> **1.1 correction:** acceptance items A5, A6, B2 and §9.2 test item 9 were universal, which
> contradicted Shape C (§4.3) — a platform-native lab has no separate artifact. They are now scoped
> to Shapes A and B, with equivalent Shape C items A8/B4 and test items 10–11 added. See §12 for the
> applicability rule.
>
> **1.2 correction:** four residual Shape C assumptions were fixed. (1) §4.3 pointed at §9.2
> *item 5* for the artifact assertion; the correct item is *9*. (2) §6.1 and §7.2 still asserted that
> `External-labs/unit-X/lesson-Y/` holds *all* executable source and is *the* source of record —
> split into a metadata/documentation directory (all shapes) and an executable-source location
> (shape-dependent, declared for Shape C), with the source branch as the provenance record.
> (3) §9.2 item 5 demanded a manifest and lockfile in the lab directory universally — now the
> *authoritative* paths are declared, with A/B owning theirs and Shape C using the platform's without
> duplication. (4) §10.2 item 2 compared one directory to the source branch tip — it now reconciles
> the *complete contribution* against the branch. No repository finding, screenshot or evidence claim
> changed in 1.1 or 1.2.

---

## How to read this document

Every requirement below carries one of three labels:

| Label | Meaning |
|---|---|
| **MANDATORY** | A lab cannot be accepted without it. Missing = blocked, no exceptions without the repository owner's written approval recorded in the PR. |
| **RECOMMENDED** | Preferred practice. Deviating is allowed but the reason must appear in the integration report. |
| **REFERENCE** | How the first integrated lab actually does it. **Not** a requirement. A future lab may do it differently. |

> **Repository-reality rule.** This document describes *outcomes*, not a toolchain. Wherever it
> mentions the first lab, that is an example, not a mandate. Wherever it mentions a repository
> file, that file was inspected on the date above — re-verify before relying on it.

---

## Table of contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Core Architectural Principles](#2-core-architectural-principles)
3. [Lab Identification and Educational Requirements](#3-lab-identification-and-educational-requirements)
4. [Development and Technology Requirements](#4-development-and-technology-requirements)
5. [Independent Lab Testing](#5-independent-lab-testing)
6. [Source Packaging and Preservation](#6-source-packaging-and-preservation)
7. [Git Branch and Directory Conventions](#7-git-branch-and-directory-conventions)
8. [Platform Integration Requirements](#8-platform-integration-requirements)
9. [Integration and Quality Assurance](#9-integration-and-quality-assurance)
10. [Integration Report](#10-integration-report)
11. [Pull Request Rules](#11-pull-request-rules)
12. [Acceptance Criteria](#12-acceptance-criteria)
13. [Post-Merge Verification](#13-post-merge-verification)
14. [Future Compatibility](#14-future-compatibility)

Appendices:

- [A. Repository facts this standard is built on](#appendix-a--repository-facts-this-standard-is-built-on)
- [B. `INTEGRATION-REPORT.md` template](#appendix-b--integration-reportmd-template)
- [C. Copy-paste acceptance checklist](#appendix-c--copy-paste-acceptance-checklist)
- [D. Known gaps in the current platform](#appendix-d--known-gaps-in-the-current-platform)

---

## 1. Purpose and Scope

### 1.1 Why external labs exist

The main platform is a static, dependency-free course site: hand-authored HTML pages, ES modules
under `src/`, vendored fonts and KaTeX, and a copy-based production build (`scripts/build.mjs`).
That architecture keeps lessons fast, auditable and stable, but it is a poor fit for
interaction-heavy laboratory work: 3D scenes, physics engines, real-time canvases, audio, or
richer UI toolkits.

External labs exist so that a laboratory can be **built as its own application** — with its own
framework, build tool, styling and interaction model — and still be **reached from the course**
as an ordinary, predictable part of the platform.

### 1.2 Relationship with the main learning platform

An external lab is **not** a lesson page and does not replace one. A lesson page
(`unit2-lesson-1.html`, `unit2-lesson-3.html`, …) is the authoritative study flow for its textbook
pages. An external lab is a **laboratory/directory entry** in the lab section (المخبر), reachable
from the course home and from the lab directory.

Consequently a lab:

- **MUST NOT** rewrite, fork or restate the lesson's textbook content as the lesson's own.
- **MUST** cite the lesson it belongs to (unit + lesson number + exact official lesson title).
- **MUST** be clearly identifiable as a separate interactive experience, not as book text.
- **MUST** return the learner to the platform with a visible control.

### 1.3 Independent development, controlled integration

Two ideas are kept deliberately separate:

| Independent (the lab's own business) | Controlled (the platform's business) |
|---|---|
| Framework, language, styling, animation, engine | Where the lab lives in the repository and navigation |
| Internal architecture, component structure | Entry URL, wrapper chrome, return path |
| Its own build tooling and scripts | Build-pipeline registration and deployment inclusion |
| Authoring of experiments and interactions | Educational labelling, scientific consistency, acceptance |

The standard governs the **seam**: the directory, the entry point, the navigation, the build, the
evidence, the review. Inside the seam the lab team (and their chosen AI agent or IDE) chooses
freely, subject to §4.

### 1.4 Out of scope

- Mobile/tablet QA is optional unless the owner asks for it (§5.9).
- Reviewing or re-auditing the educational content of **existing** lessons and appendices
  (`src/unit2-*`, `docs/*-source-audit.md`). A lab PR may not touch them (§11.1).
- Choice of visual design language.
- Server-side features. The platform is static; see §4.6 for what happens if a lab needs a backend.

---

## 2. Core Architectural Principles

### P1 — Technology independence · **MANDATORY**

No framework is imposed. The only requirement is a **deployable output** that satisfies §4.2 and
§8. A decision to use or not use React, Vite, Three.js, Godot, plain HTML, canvas, or anything
else must be justified in the integration report (§10), never assumed by this document.

### P2 — Independent source preservation · **MANDATORY**

The lab's complete source — code and documentation together — lives in the repository, and its
**provenance** is the `lab-source/unit-X/lesson-Y` branch (§7). Where that code sits depends on the
chosen shape: inside `External-labs/unit-X/lesson-Y/` for Shapes A and B, under the platform's `src/`
conventions for Shape C (§4.3, §6.1.2). Integration must never delete, replace or "clean up" the
original source, in either location. Deleting a lab's source branch, its metadata directory, or its
platform-path module is forbidden (§11).

### P3 — Reproducible production builds · **MANDATORY**

Any competent person must be able to rebuild the deployed artifact from a clean checkout, using
only what the repository contains, and get a working result. For Shapes A and B the artifact is the
lab's own bundle; for Shape C (§4.3) it is the **platform** build that ships the lab source. Either
way the rule is the same: one command, from a clean checkout, produces the thing that is deployed.
This means:

- committed dependency manifest **and** lockfile where the ecosystem has one (e.g.
  `package.json` + `package-lock.json`) — the lab's own for Shapes A and B, the platform's for
  Shape C, whose authoritative paths are declared in the report (§6.1.2, §9.2 items 9b, 11b);
- a build command that runs without interactive input;
- no manual post-processing steps that exist only in someone's head;
- the exact toolchain recorded in the report (e.g. `Node 22.22.3 / npm 10.9.8`).

> **Verified for the first lab:** `npm ci && npm run build` inside
> `External-labs/unit-2/lesson-1/` reproduces `dist/index.html` **byte-for-byte**
> (SHA-256 `1703eb0ab289d6ce09cd2a7939713889e3fe594dce027c2f87985d822e04be4c`,
> 828,520 bytes) on Node 22.22.3 / npm 10.9.8. Byte-identity is a property of *that* toolchain.
> The requirement is **functional** reproducibility — the rebuild runs, loads and behaves the same.
> A byte-identical result is strong supporting evidence, not a universal rule, and a lab whose
> bundler stamps timestamps or hashes may legitimately differ per build; then the report must say
> what was compared instead (§6.6).

### P4 — Local and reliable asset loading · **MANDATORY with declared exceptions**

Whatever the lab ships (its own bundle for Shapes A/B, the platform build for Shape C) must load its
core assets from the repository by relative path, and must work when the whole `dist/` tree is
served from any static host, including a GitHub Pages **project** subpath
(e.g. `https://<user>.github.io/Interactive-Physics-Grade8/`).

If a lab depends on a third-party origin at runtime, that is an **exception that must be declared**:

- list every external origin in the integration report (fonts, CSS, CDNs, analytics, APIs);
- state what breaks if that origin is unreachable;
- state why a local copy is not feasible;
- obtain explicit owner approval in the PR.

An undeclared third-party runtime dependency is an acceptance failure.

> **Reference / existing exception:** the first lab ships Google Fonts and the KaTeX stylesheet
> from CDNs (`fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.jsdelivr.net`) — 3 external origins,
> declared in `INTEGRATION-REPORT.md` §6. The platform itself vendors both under `vendor/`;
> **new labs MUST vendor instead.**
>
> **Why this is now a MUST and not a SHOULD:** a real-browser run of the built lab with those two
> origins unreachable showed that the KaTeX stylesheet is **load-bearing for correctness**, not only
> for appearance — the Coulomb law displayed as `F = Kd2|q1 q2|`. A missing CDN silently produced a
> scientifically wrong formula in a card labelled «من الكتاب». Evidence and reproduction steps:
> `docs/qa/external-labs-standard/`.
>
> **MANDATORY for new labs:** every asset whose absence can change the *meaning* of what is shown
> (math stylesheets above all) is served from the repository. Cosmetic-only origins may remain
> external, declared, and must degrade to a correct, readable default.

### P5 — Clear separation between lab source and platform integration · **MANDATORY**

Platform-side integration files are *thin*. The integration PR may add/modify only:

- one wrapper page (§8.4),
- one entry in the lab directory (§8.2),
- one link in the course-home navigation if the section is new,
- the build registration (§8.8),
- integration tests (§9),
- the integration report (§10).

Lab-internal code must never be edited to satisfy platform layout needs. If it must be changed, the
change is documented as a lab change with its own justification, and the lab is rebuilt — never a
silent patch inside `dist/`.

### P6 — No unnecessary dependencies on external services · **MANDATORY**

No lab may require a running server, a database, a paid API, an account, or a network call to
function in its core educational loop. See §4.6 for the declaration procedure when a lab genuinely
needs one.

### P7 — No secrets or credentials in the repository · **MANDATORY**

No API keys, tokens, passwords, `.env` files, service-account JSON, private keys, or personal
credentials. Note the platform's own teacher gate is a **client-side gate** with a derived hash
(`src/teacher-auth.js`), explicitly documented as "not server-side authorization" — it is a
deterrent, not a secret store. A lab must not claim otherwise, and must not treat a
client-side gate as protection for anything sensitive.

**Personal data is not a credential but still needs approval.** Publishing a phone number, email,
personal name or messaging link (the first lab embeds a WhatsApp contact) requires explicit owner
approval and a declaration in the report.

---

## 3. Lab Identification and Educational Requirements

### 3.1 Mandatory identification block · **MANDATORY**

Every lab must state, in its own `README.md` **and** in the integration report:

| Field | Rule |
|---|---|
| **Unit number** | Platform numbering (`الوحدة الأولى`, `الوحدة الثانية`, …), not necessarily the printed book's numbering. |
| **Lesson number** | Platform lesson numbering. |
| **Exact official lesson title** | Character-for-character identical to the published lesson's title. See §3.2. |
| **Textbook page range** | The printed pages the lab supports (e.g. `pp73–86`). |
| **Educational objectives** | What the learner must be able to do afterwards. |
| **Scientific concepts and laws** | Named concepts plus the exact relations used (e.g. `q = n·e`, `F = K·|q₁q₂|/d²`). |
| **Experiments / interactive activities** | Enumerated, one line each, with what the learner changes and observes. |
| **Expected learning outcomes** | Observable, checkable statements. |
| **Model limits** | What the simulation does **not** model. |

### 3.2 Exact lesson titles (verified 2026-11-27) · **MANDATORY**

Titles must match the `<title>`/`<h1>` of the published lesson pages. Do not invent, shorten,
translate, or "improve" them.

| Unit | Lesson | Official title | Published page |
|---|---|---|---|
| 1 | 1 | القوى المتلاقية | `lesson-1.html` |
| 1 | 2 | القوى المتوازية | `lesson-2.html` |
| 2 | 1 | الكهرباء الساكنة | `unit2-lesson-1.html` |
| 2 | 2 | التيار الكهربائي المتواصل | `unit2-lesson-2.html` |
| 2 | 3 | فرق الكمون الكهربائي | `unit2-lesson-3.html` |
| 2 | 4 | المقاومة الكهربائية | `unit2-lesson-4.html` |

In the lab directory the title is prefixed with the ordinal, matching existing rows:
`الدرس الأول: الكهرباء الساكنة`. Keep the ordinal form consistent with the rows already in
`almakhbar.html` (الأول / الثاني / الثالث / الرابع).

> **Numbering conflict rule.** Where the printed book's unit numbering disagrees with the
> platform's, the **platform numbering is authoritative for identification**, and the printed
> number must never be silently attributed to the book. This has already happened once: printed
> p73 reads «الوحدة الثالثة» while the platform and the lesson audit use «الوحدة الثانية»
> (see `docs/unit-2-lesson-1-appendix-audit.md` §1). Disclose the discrepancy; do not paper over it.

### 3.3 Scientific accuracy · **MANDATORY**

- Every relation used must be dimensionally consistent, with the correct symbols, subscripts and
  units (`F = K·|q₁q₂|/d²` with `K = 9×10⁹ N·m²/C²`, `q = n·e`, `I = Q/t`, `U = ΔE/q`).
  These are the platform's own forms — `src/unit2-lesson1-physics.js` and
  `src/unit2-lesson3-content.js`. Use the platform's symbols, not a generic textbook variant.
- Arabic prose is RTL; mathematical expressions, numbers, units and vector notation are
  **LTR-isolated islands**. On platform pages this is the `src/math.js` KaTeX contract. Inside a
  lab, any equivalent that keeps equations in the correct visual order and exposes MathML/alt text
  is acceptable.
- Vector quantities carry vector notation (arrow over the symbol), scalars do not. A magnitude must
  never be typeset as a vector.
- **Math must survive a missing stylesheet.** A formula may never become a *wrong* formula when a
  font or CSS request fails. Concretely: do not rely on a CSS-dependent layout layer as the only
  representation of an equation. Either emit MathML (the platform's `src/math.js` uses
  `output: 'htmlAndMathml'`), or provide a text alternative beside the rendered formula, or vendor
  the stylesheet so it cannot fail.
  > *Verified defect this rule prevents:* the first lab renders KaTeX with `output: "html"` and
  > pulls the KaTeX CSS from a CDN. With the CDN unreachable, `F = K|q₁q₂|/d²` displays as
  > `F = Kd2|q1 q2|`, and `F ∝ 1/(4πd²) ⟹ F ∝ 1/d²` displays as `F ∝ 4πd21 ⟹ F ∝ d21` — two
  > inverted equations, in a card labelled «من الكتاب», with no error state in the UI. See
  > `docs/qa/external-labs-standard/`.
- Every simplified model states its limits **on the page**, not only in the report.
- Rounding and significant figures follow the printed source for book-labelled values.
- No fabricated data: measurements that a lab displays must come from a stated model or a real
  interaction, and the model must be described.

### 3.4 Curriculum consistency · **MANDATORY**

The lab must not teach material beyond the Grade 8 scope without labelling it
(`إثراء علمي من المنصة`) and must not contradict the published lesson. Where the platform
deliberately corrects an imprecise printed statement, the lab follows the platform correction and
cites it.

### 3.5 Labelling contract · **MANDATORY**

A learner must always be able to tell what is **book** and what is **platform**. Reuse the existing
labels so the vocabulary stays uniform across the platform and its labs:

| Situation | Label |
|---|---|
| Quoted book text / conclusion | `من الكتاب` (+ printed page) |
| Platform-authored explanation | `شرح المنصة` |
| Platform-authored diagram | `رسم توضيحي من المنصة` |
| Platform-authored simulation / lab | `محاكاة تفاعلية من المنصة` |
| Beyond the printed scope | `إثراء علمي من المنصة` |
| Any simplified model | `<n>نموذج تعليمي مبسّط` / `Educational simplified model` |

---

## 4. Development and Technology Requirements

### 4.1 Permitted technologies · **MANDATORY**

Any technology that produces a deployable web artifact. Explicitly permitted, without preference:

- plain **HTML / CSS / JavaScript** (ES modules), the platform's own idiom;
- **React** with **Vite** (and any styling approach: plain CSS, Tailwind, CSS modules…);
- **Three.js** or any WebGL/WebGPU/canvas library, bundled or as ES modules;
- **Godot** (web export) or another game engine that can export to the browser;
- other frameworks (Svelte, Vue, Solid, Preact, Lit…), WASM toolchains, or a headless engine.

No lab "must be React", "must be Vite", and no lab "must be plain HTML". A standard that pinned
one framework would be obsolete within a year and would block legitimate labs.

### 4.2 Conditions any chosen technology must satisfy · **MANDATORY**

A chosen technology is acceptable only if **all** of the following hold:

1. **Source is preserved** in the repository (§6) in its normal, editable form.
2. **Production output is reproducible** from a clean checkout by a documented command (§2 P3) —
   the lab's own bundle for Shapes A/B, the platform build for Shape C.
3. **The output runs on a static host** with no server-side rendering, no Node process at runtime,
   and no required build step on the host.
4. **All dependencies and assets are accounted for** — either committed, or declared external
   origins (§2 P4).
5. **The output works from a subpath** (`/repo-name/`), i.e. no root-absolute asset URLs.
6. **The output is self-contained enough for the integration architecture in §8.4** — it must not
   require a Node dev server, HMR socket, or framework-specific dev proxy.
7. **Browser compatibility is stated** — a browser baseline is declared in the report, and the lab
   must run on current Chromium/Firefox/Safari desktop releases.
8. **Build failures are visible** — a failing build must not silently produce a stale artifact
   (§6.6).

### 4.3 Output-shape options · **REFERENCE**

Three supported shapes. A lab picks one, states it in the report, and justifies it:

| Shape | What is committed | Integration | Separate lab artifact? | Trade-off |
|---|---|---|---|---|
| **A — Single-file bundle** *(first lab)* | full source + `dist/index.html` (JS/CSS inlined) | iframe points at `dist/index.html` | **Yes** | simplest to serve, trivially isolated; one large HTML file (~828 KB, 233 KB gzip for lab 1) |
| **B — Multi-file static bundle** | full source + `dist/` (hashed JS/CSS/assets) | iframe points at `dist/index.html` | **Yes** | better caching and lazy loading; more files, so a tighter asset audit is required |
| **C — Platform-native module** | source only, under the platform `src/` conventions | loaded directly into a platform page | **No** — the source *is* the artifact | no isolation boundary; changes must satisfy the platform's module/style/accessibility contracts |

Shapes A and B keep the lab independent, so they ship a built artifact of their own that must be
committed and tracked (§6.4). Shape C ships **no separate artifact**: its source is consumed by the
platform build directly, so the deployable is the platform `dist/` itself.

**The selected shape decides which acceptance items apply.** A5, A6, B2 and test item 9 in §9.2 are
**Shapes A and B only**; A8, B4 and test items 10–11 in §9.2 are **Shape C only**. Every other
requirement in this standard applies to all three shapes. Declare the shape in the report (§10.2
item 4) — an undeclared shape makes the checklist ambiguous and is itself a defect.

**Where the lab's files live.** Two locations are distinguished, and only one of them is
shape-dependent:

| | Shapes A and B | Shape C |
|---|---|---|
| **Executable source** | inside `External-labs/unit-X/lesson-Y/` | under the **platform's** `src/` conventions, at a path declared in the report |
| **Lab metadata / documentation** | `External-labs/unit-X/lesson-Y/` (`README.md`, `INTEGRATION-REPORT.md`, QA evidence) | the same directory — it holds the documents, not the code |
| **Provenance record** | the `lab-source/unit-X/lesson-Y` branch | the same branch — it carries the *complete* contribution, including the platform-path module |

A Shape C lab is therefore **never** required to duplicate its module into
`External-labs/unit-X/lesson-Y/`, and that directory is never claimed to contain executable Shape C
source.

Shape C trades independence for a smaller footprint and should be chosen only when the lab is
genuinely simple.

> **Shape B caveat:** hashed filenames are fine, but the *entry* file must remain a stable,
> predictable path, and every emitted asset must be committed (§6.3) or produced by a build the
> deployment pipeline runs (§6.5).

### 4.4 Explicitly discouraged · **RECOMMENDED**

- Runtime TypeScript/JSX transpilation in the browser (slow, fragile, unreviewable output).
- CDN-hosted UI frameworks at runtime.
- Bundling a second copy of KaTeX when the platform already vendors one — declare it if you do.
- Committing build caches, `.vite/`, `node_modules/`, editor files, or OS metadata.

### 4.5 Build-time network access · **MANDATORY**

`npm install` at build time is acceptable **only** if it is declared, and if a lockfile makes it
deterministic (§6.3). Prefer `npm ci`. A lab whose build needs a private registry, a global
dependency, or a licence-gated tool may not be integrated until the owner accepts that dependency
in writing.

> **Verified for the first lab:** `scripts/build.mjs` runs `npm install` (not `npm ci`) inside the
> lab directory with a 120 s timeout, then `npm run build`. That is why a committed
> `dist/index.html` must exist as the fallback (§6.5) for **Shapes A and B**. Shape C needs no
> fallback artifact: its source is copied to `dist/` as platform source and is never built by a
> per-lab step.

### 4.6 Backend, paid services, and anything non-static · **MANDATORY declaration**

A lab needing a backend must submit, **before** integration:

- exactly which service, which endpoints and what data they receive;
- whether it is paid, rate-limited, or subject to terms that could change;
- what the learner sees when the service is down;
- why a fully static implementation is not sufficient;
- an explicit owner approval recorded in the PR.

Without that approval the lab is **not acceptable**, even if it builds and runs.

---

## 5. Independent Lab Testing

All of §5 is performed by the lab's authors **before** the integration PR is opened, inside the
lab's own directory. It is independent of the platform's test suite.

### 5.1 Mandatory pre-integration checks · **MANDATORY**

| # | Check | Evidence |
|---|---|---|
| 5.1.1 | **Every experiment and interaction** exercised once, including empty/invalid input | a checklist of interactions, each marked exercised + what was observed |
| 5.1.2 | **Scientific calculations, equations, symbols, units** verified against an independent hand calculation | a table of expected vs. observed values |
| 5.1.3 | **Diagrams and visual representations** correct in geometry, labels, and sign/arrow direction | per-diagram notes |
| 5.1.4 | **Questions, feedback and answer validation** — correct answers accepted, wrong answers rejected, no answer revealed before an attempt, equivalent Arabic forms accepted | list of question IDs and outcomes |
| 5.1.5 | **Audio and other media**, if present | what plays, when, and the autoplay-policy behaviour |
| 5.1.6 | **Browser console** clean in the production build that will actually be deployed (lab bundle for A/B, platform `dist/` for C) | console log excerpt or explicit statement that none occurred |
| 5.1.6b | **Degraded-network render** — load the production build with every declared external origin blocked, and confirm that no equation, unit, number or label becomes wrong or unreadable | screenshot per viewport + the list of blocked origins |
| 5.1.7 | **Production build** succeeds from a clean checkout — the lab's own build for Shapes A/B, the platform build for Shape C | command + output |
| 5.1.8 | **Laptop visual inspection at exactly 1366×768 and 1440×900** | screenshots from a real browser (§5.4) |

### 5.2 Scientific verification method · **MANDATORY**

Each formula in the lab gets a row: relation, symbol definitions with units, one hand-computed
value, the value the lab produces, and the verdict. Symbolic answers (e.g. `q = −3e`) are checked
for **sign as well as magnitude**. Vector results are checked for magnitude **and** direction.

### 5.3 Console and network hygiene · **MANDATORY**

A production build must produce no console errors and no failed network requests other than the
declared external origins (§2 P4). A 404 for a font or a stylesheet is a defect, not a warning.

**But separate the two cases when you report:**

| Case | Meaning | Verdict |
|---|---|---|
| An origin fails **in your test environment** because the network blocks it | Not a code defect — but it *is* proof the lab has no offline fallback | Report as a **finding**, check what the learner sees, and record it |
| An origin fails for **real users** (404, expired certificate, removed package) | A real defect | Acceptance failure |

The first case is exactly how the `F = Kd2|q1 q2|` defect was found. Treat a blocked origin as a
free robustness test: look at what renders, do not just note the console error.

### 5.4 Visual verification honesty · **MANDATORY — and non-negotiable**

- Visual verification means **a real browser rendering the real production build at exactly
  1366×768 and 1440×900**.
- Reading CSS, measuring element widths in source, or confirming an HTTP 200 **is not** visual
  verification. It may be reported, but under a different heading (e.g. "static structural review"),
  never as "verified visually".
- If no browser is available, **say so explicitly**, list what is therefore unverified, and mark the
  lab as not-yet-visually-accepted. Do not attach placeholders, mock-ups, or re-used screenshots
  as if they were evidence.
- Never fabricate screenshots, test output, interaction results, or a passing status.

> **Precedent (honest failure, but avoidable):** PR #60's report records that Playwright's browser
> download was blocked and that **no** screenshots were captured; `qa-visual/1366x768/README.md`
> and `qa-visual/1440x900/README.md` say the same. Not fabricating a result was correct. But the
> conclusion "no browser is possible here" was **wrong**: `playwright-core` +
> `@sparticuz/chromium` install from the npm registry and launch Chromium in this same environment
> (§5.5, Appendix A15). The lesson is twofold — never fake evidence, and never accept "impossible"
> without trying the mechanism the repository already documents.

### 5.5 The established browser-evidence mechanism in this repository · **REFERENCE**

The repository already has a working pattern for real-browser evidence to
`docs/qa/<name>/` with a `browser-results.json` and viewport-named PNGs — e.g.
`scripts/qa-unit2-lesson4.mjs` → `docs/qa/unit2-lesson4/` (617 checks recorded, console errors `[]`
at 1366×768 and 1440×900). It uses `playwright-core` + `@sparticuz/chromium` installed **outside**
the repository, resolved through `QA_MODULE_DIR`, with no browser binaries committed.
Labs **must** reuse this pattern rather than invent a new one.

Verified working recipe (2026-11-27, no system browser, no Playwright download):

```bash
# outside the repository
npm i playwright-core@1.56.1 @sparticuz/chromium@141.0.0
# the bundled libraries must be on the loader path on minimal Linux
node -e "const fs=require('fs'),z=require('zlib');fs.writeFileSync('/tmp/al2023.tar',z.brotliDecompressSync(fs.readFileSync('node_modules/@sparticuz/chromium/bin/al2023.tar.br')))"
mkdir -p /tmp/al2023 && tar -xf /tmp/al2023.tar -C /tmp/al2023
export LD_LIBRARY_PATH=/tmp/al2023/lib:/tmp/al2023/usr/lib:/tmp/al2023/usr/lib64
# then launch exactly as scripts/qa-unit2-lesson4.mjs does
```

Full working example, including the navigation click-path and the measurements it produced:
`docs/qa/external-labs-standard/`.

### 5.6 Regression awareness · **MANDATORY**

Before integration, run the platform's existing suite (`npm test`) on a **clean checkout of `main`**
and record the baseline as described in §9.1. The lab must not change that baseline. A lab cannot be blamed
for pre-existing platform failures, and cannot hide new ones behind them.

### 5.7 What must be checked at both viewports · **MANDATORY**

For each of 1366×768 and 1440×900:

- no horizontal scrollbar on the lab itself;
- no clipped or overlapping text, controls, labels or SVG annotations;
- the primary interaction is reachable without the platform chrome covering it;
- the return-to-platform control is visible and usable;
- nothing important is truncated at the shorter 768 px height;
- **internal scroll strips are checked for clipping**, not just the page: a horizontal tab bar with
  `overflow-x: auto` hides its last item and may show **no scrollbar at all** (macOS and touch
  styling), so measure `scrollWidth > clientWidth` on the strip rather than trusting the page
  to have "no horizontal overflow".
  > *Verified defect this rule prevents:* the first lab's 8-tab strip is 1331 px inside 1240 px at
  > **both** 1366×768 and 1440×900, so «اختبر نفسي» is clipped at both required laptop sizes, while
  > the page-level overflow check passes (`scrollWidth == clientWidth` on `body`).

### 5.8 Evidence retention · **MANDATORY**

The evidence (screenshots, console captures, expected-vs-observed tables) is committed in the
integration PR under `docs/qa/<lab-name>/` **or** linked from a permanent, reviewable location.
Evidence that exists only in a chat transcript does not count.

### 5.9 Other viewports · **RECOMMENDED**

390×844 (and tablet 768×1024) checks are strongly recommended and already used on platform lessons
(`docs/qa/unit2-lesson3/`, `docs/qa/unit2-lesson4/`), but laptop is the acceptance baseline. If the
lab is expected to be used on phones, say so and test it.

---

## 6. Source Packaging and Preservation

### 6.1 Expected source package · **MANDATORY**

Two distinct things are preserved, and they are **not** the same location for every shape:

- the **lab metadata / documentation directory** — always `External-labs/unit-X/lesson-Y/`;
- the **executable source** — shape-dependent (§4.3).

#### 6.1.1 Lab metadata / documentation directory · all shapes

`External-labs/unit-X/lesson-Y/` must contain:

| Item | Rule |
|---|---|
| **`README.md`** | see §6.2 |
| **`INTEGRATION-REPORT.md`** | see §10 |
| **QA evidence** | the §5 screenshots, captures and expected-vs-observed tables, or a committed pointer to them |
| **Build instructions** | exact commands, exact toolchain versions — for Shape C these are the **platform** build |
| **Declared paths** | where the executable source actually lives (see below) |

#### 6.1.2 Executable source · shape-dependent

| Shape | Where the executable source lives | What this directory additionally holds |
|---|---|---|
| **A / B** | inside `External-labs/unit-X/lesson-Y/` — complete, in the lab's normal editable form | assets, dependency manifest, lockfile (where the ecosystem has one; **mandatory** for `npm`), configuration files, the lab's own tests, and the committed production output (§6.4) |
| **C** | under the **platform's** `src/` conventions, at a path declared in `INTEGRATION-REPORT.md` | **no** executable source, **no** manifest, **no** lockfile, **no** production output |

A Shape C lab must **not** duplicate its module into `External-labs/unit-X/lesson-Y/`, and must not
copy the platform's `package.json` / `package-lock.json` into the lab directory merely to satisfy a
directory shape (§9.2 item 5). The metadata directory documents the lab; it does not have to contain
the lab's code.

**Provenance for every shape** is the `lab-source/unit-X/lesson-Y` branch, which carries the *complete*
contribution — for Shape C that means both the platform-path module and the metadata directory (§10.2
item 2).

### 6.2 The lab `README.md` · **MANDATORY**

Minimum content:

1. Unit, lesson, exact official lesson title, textbook pages.
2. What the lab teaches (objectives, concepts, relations).
3. Experiments/interactions list.
4. Technology stack + versions.
5. **Build instructions**: install, build, preview, in order, with the tested Node/engine version.
   For Shape C this is the **platform** build (`npm run build` at the repository root), because that
   is what ships the lab.
6. How to open the built output locally (served over HTTP, with the port) — for Shape C, the platform
   page that mounts the lab, opened from `dist/`.
7. Declared external runtime origins (§2 P4).
8. Model limits.
9. Where the integration report is, and — for Shape C — the **declared platform path** of the
   executable module, since it is not inside this directory (§6.1.2).

> **Gap in the first lab:** its `README.md` is 3 lines and contains **no** build instructions.
> This standard exists so that no further lab repeats that.

### 6.3 Excluded from the source package · **MANDATORY**

Never commit:

- `node_modules/` (any depth);
- build caches and intermediates (`node_modules/.vite`, `.cache`, `.turbo`, `__pycache__`, engine
  import caches, `.godot/` import artifacts);
- OS/editor metadata (`.DS_Store`, `Thumbs.db`, `.idea/`, unwanted `.vscode/`);
- `.env`, keys, tokens, credentials (§2 P7);
- generated logs, `*.log`, temporary files;
- duplicate copies of the same asset in several resolutions "just in case".

### 6.4 When production output **must** be committed · **Shapes A and B only**

**This section does not apply to Shape C**, which has no separate production artifact (§4.3).

For Shapes A and B, commit the production output (e.g.
`External-labs/unit-X/lesson-Y/dist/index.html`) when **any** of the following is true:

1. The platform build may skip or fail the lab build without failing itself — which is the **current**
   behaviour of `scripts/build.mjs` (its lab-build step is wrapped in `try/catch` and only warns).
2. The deployment runner is not guaranteed to have the lab's toolchain.
3. The lab's build needs network access the deployment runner may not have.

Given (1) is true today, **every Shape A or B lab integrated under the current pipeline must commit
its production output.** For those shapes a missing `dist/` means a lab that silently disappears
from the deployed site. (Shape C has no `dist/` to be missing — see below.)

**Shape C instead satisfies the same underlying goal — "the deployed site really contains this lab" —
through the platform build.** Its requirement is that a clean-checkout `npm run build` emits the
platform `dist/` containing the lab's functionality, verified structurally (A8, B4, §9.2 item 10).
The goal is identical; only the mechanism differs.

### 6.5 When production output may be generated at platform-build time · **Shapes A and B, CONDITIONAL**

For Shapes A and B, production output may be **omitted** from the commit **only** after the owner has:

- extended `scripts/build.mjs` to build **every** registered lab, and
- made a lab build failure **fail the platform build** (no `try/catch` swallow), and
- proven it with a clean-checkout build (and ideally in CI).

Until then, omitting `dist/` for a Shape A or B lab is an acceptance failure, not a preference.

### 6.6 Stale artifacts · **MANDATORY**

**Shapes A and B:** if `dist/` is committed, it must correspond to the committed source.

**Shape C:** there is no committed lab artifact to go stale, but the *platform* build can still be
stale or incomplete. Verify that a clean-checkout `npm run build` emits `dist/` containing the lab's
shipped source and that the built entry page references it (B4, §9.2 item 10). Never hand-edit files
inside the platform `dist/`.

Details for Shapes A and B:

- Rebuild and compare before opening the PR.
- Record in the report: build command, byte size, and SHA-256, plus the toolchain used.
- Never hand-edit a committed `dist/` file. Ever.
- If the rebuild differs only in non-functional ways (minifier version), say so explicitly and state
  what was compared instead (behaviour, content assertions).

### 6.7 `.gitignore` interaction · **MANDATORY to handle, not to copy**

The root `.gitignore` contains `dist/` and `node_modules/`. A bare `dist/` pattern **also matches**
`External-labs/unit-X/lesson-Y/dist/`. Verified behaviours:

- `git add` silently ignores `External-labs/**/dist/` — the first lab's `dist/index.html` is tracked
  only because it was force-added;
- adding negations keeps the root `dist/` ignored while tracking lab output:
  ```
  dist/
  node_modules/
  !External-labs/**/dist/
  !External-labs/**/dist/**
  ```

Either approach is acceptable. What is **not** acceptable is a PR where the author believes `dist/`
was committed and it was not — for Shapes A and B the integration test in §9.2 (item 5) must assert
the artifact is **tracked** (`git ls-files`), not merely present on disk.

**Shape C is unaffected by this section:** it commits no `dist/` at all, so no negation rule is
needed. Do not add one "for consistency" — the root `dist/` must stay ignored.

---

## 7. Git Branch and Directory Conventions

### 7.1 Required conventions · **MANDATORY**

| Thing | Convention |
|---|---|
| **Source branch** | `lab-source/unit-X/lesson-Y` |
| **Source directory** | `External-labs/unit-X/lesson-Y/` |
| **Integration branch** | one dedicated branch per lab, e.g. `arena/<session>-interactive-physics-grade8` |
| **Integration PR** | exactly one, base `main` |
| **Base branch** | `main` — never a feature branch, never another lab's branch |

`X` and `Y` are the **platform** unit and lesson numbers (§3.1), zero-padded only if the repository
later adopts padding — be consistent per lab and state it.

> **Existing inconsistency, disclosed:** the first lab's source branch is
> `lab-source/unit-2-lesson-1` (hyphen-separated) and its wrapper is `lab-unit2-lesson1.html`,
> while its directory is `External-labs/unit-2/lesson-1/` (slash-separated). The slash form is the
> standard for **directories** and **future source branches**. New labs must use
> `lab-source/unit-X/lesson-Y`. The first lab's branch already used a hyphenated form; it is
> grandfathered and must be preserved, not renamed.

### 7.2 Rules · **MANDATORY**

- **One lab = one independent source branch.** Do not put two labs on one source branch.
- **One lab = one clearly identified metadata directory** at `External-labs/unit-X/lesson-Y/`, plus
  its declared executable source path (§6.1.2). Two labs never share files, and two lab metadata
  directories never share files: `External-labs/unit-2/lesson-1/` and
  `External-labs/unit-2/lesson-2/` are separate labs.
- **The metadata directory is the documentation record; the source branch is the provenance record.**
  For Shapes A and B the metadata directory also holds the executable source. For Shape C the
  executable source lives under the platform `src/` conventions and the metadata directory holds only
  documents, its QA evidence and the declared paths. Do not claim the metadata directory contains all
  executable Shape C source (§6.1.1, §6.1.2).
- **One dedicated integration PR per lab** (§11).
- **Never overwrite or delete the original lab source during integration.** The source branch is the
  provenance record for the complete contribution; the metadata directory is the documentation record
  and — for Shapes A and B only — also the home of the executable source.
- **Do not modify `main` directly.** Every change arrives through a PR.
- **Do not delete the source branch** after integration, and do not delete it *before* it either.
- **Do not rewrite history** on a source branch that has been integrated (no force-push). If the lab
  needs changes after integration, push forward and say so.

### 7.3 Directory layout · **MANDATORY**

The layout below is a **Shape A** lab (the first lab). It is the reference, not a universal
skeleton. `dist/`, `src/`, `package.json`, `package-lock.json`, `vite.config.ts` and `tsconfig.json`
appear here because a Shape A lab owns its whole toolchain.

A **Shape C** lab keeps `README.md`, `INTEGRATION-REPORT.md` and its QA evidence in
`External-labs/unit-X/lesson-Y/`, but its executable module lives at the platform `src/` path declared
in the report, and it declares the **platform** manifest and lockfile instead of owning copies
(§4.3, §6.1.1, §6.1.2).

```text
External-labs/
  unit-2/
    lesson-1/
      README.md                   # lab README (§6.2)
      INTEGRATION-REPORT.md       # §10
      package.json                # dependency manifest
      package-lock.json           # lockfile
      vite.config.ts              # configuration
      tsconfig.json
      index.html                  # source entry (dev) — Shapes A/B only
      src/                        # Shapes A/B: all executable source.
                                  # Shape C: absent here — the module lives under the
                                  # platform src/ path declared in INTEGRATION-REPORT.md
      dist/                       # Shapes A/B ONLY — absent for Shape C
        index.html                # committed production output (§6.4, A/B only)
    lesson-2/                     # next lab — no shared files with lesson-1
```

An `External-labs/README.md` index may be added when the directory would otherwise be hard to
navigate. It is optional, must be added in a documentation PR (not a lab PR, §11.1), and must not
duplicate the lab directory page (`almakhbar.html`).

---

## 8. Platform Integration Requirements

This section describes the **outcomes** the platform requires. The HTML/CSS/markup shown is the
first lab's implementation — a reference, not a template mandate.

### 8.1 Where labs live in the platform · **MANDATORY**

Labs are published under the lab section, **المخبر**:

- course home navigation → lab directory (`almakhbar.html`);
- lab directory → one row per lesson;
- row → entry page (a wrapper for Shapes A/B, a mounting platform page for Shape C) → the lab itself.

A lab must be reachable from the directory by an ordinary `<a href>` link. JavaScript-only routing
is acceptable *inside* the lab but must never be the only way to reach it.

### 8.2 Lab index (directory) entry · **MANDATORY**

Each lab adds exactly one `.lab-row` **inside** its unit's `.unit-dir` in `almakhbar.html`, keeping
the existing structure (`unit-dir` → `unit-dir-header` → `lab-row` → `lab-info` + `lab-link`):

```html
<div class="lab-row" aria-label="مختبر الدرس الأول: الكهرباء الساكنة">
  <div class="lab-info">
    <h3>الدرس الأول: الكهرباء الساكنة</h3>
    <p class="lab-meta">مخبر تفاعلي · تجارب على الشحنة الكهربائية وقانون كولوم</p>
  </div>
  <a class="lab-link" href="./lab-unit2-lesson1.html">افتح المختبر <span aria-hidden="true">←</span></a>
</div>
```

Rules:

- The `<h3>` carries the exact official lesson title with its ordinal (§3.2).
- `.lab-meta` states what the lab is, in one short clause. No marketing claims.
- The link is `./`-relative and points at the lab wrapper.
- **An unavailable lab must not be presented as available.** The existing convention is a row with
  status `قريباً` and **no** `افتح المختبر` link (already enforced by a test in
  `tests/almakhbar-integration.test.js`). Empty units keep their `.empty-state` text.
- `<main>` keeps its `id` and the heading structure stays valid (`h2` per unit, `h3` per lab).
- Do not add a new unit block that duplicates an existing one; find the unit and add a row.

### 8.3 Unit and lesson navigation from the course home · **CONDITIONAL**

The المخبر link already exists in `index.html` (`nav.home-nav`, `href="./almakhbar.html"`).
A new lab therefore needs **no** `index.html` change. Any change to `index.html` beyond a missing
section link is out of scope for a lab PR.

### 8.4 Runtime integration · **MANDATORY outcomes**

The lab is reached through a **platform-owned entry page** so that the learner never loses the
platform's navigation. Two mechanisms are acceptable:

- **isolated wrapper** — a dedicated page that embeds the lab (recommended when the lab is a full
  application); name it `lab-unitX-lessonY.html`, matching `lab-unit2-lesson1.html`;
- **direct mount** — the lab is mounted into a platform page (shape C, §4.3), which is only
  acceptable when the lab's styles and scripts cannot leak into the platform.

Whichever is used, the outcomes in the table below are mandatory.

Required outcomes, whatever the mechanism:

| Outcome | Requirement |
|---|---|
| **Isolation** | The lab must not leak styles, globals, DOM ids or JS runtime into platform pages, and the platform CSS must not alter the lab. |
| **Full usable area** | Platform chrome must not consume a significant share of the viewport. (Reference: 56 px top bar.) |
| **Return path** | A visible control returns to the lab directory **and** to the course home. Both are plain `<a href>` links — no `window.location` hacks, no JS history manipulation. |
| **Direct URL** | The wrapper has a stable, bookmarkable, refresh-safe URL. |
| **No scroll trap** | The learner cannot get stuck inside a nested scroll context with no way back. |
| **Language** | The wrapper is `lang="ar" dir="rtl"`, consistent with the rest of the platform. |
| **Accessibility** | The chrome has landmarks and an accessible name; the embedded lab region is labelled. |
| **Title** | The wrapper `<title>` identifies unit + lesson; the lab region carries a descriptive `title`/`aria-label`. |

**Reference implementation (first lab):** `lab-unit2-lesson1.html` — a 56 px `.lab-topbar` with
«عودة للمنصة» (`./`) and «المخبر» (`./almakhbar.html`), plus `.lab-viewport`
(`height: calc(100vh - var(--bar-h))`) containing
`<iframe src="./External-labs/unit-2/lesson-1/dist/index.html">`. The iframe is chosen because the
lab is a React 19 + Tailwind v4 single-file build whose CSS `@layer` rules would fight the
platform's `styles.css`/`home.css`, and whose React runtime must not be loaded into platform pages.
**A lab that is a plain ES-module page may instead be mounted directly (shape C, §4.3) — that is a
legitimate different choice, provided the isolation outcomes above still hold.**

### 8.5 Responsive layout behaviour · **MANDATORY where supported**

- The wrapper must not impose a fixed pixel width or `max-width` that shrinks the lab area.
- At 1366×768 and 1440×900 there must be no horizontal scrollbar and no clipped chrome.
- If the lab is not designed for narrow screens, that must be stated on the page or in the report —
  not left for the learner to discover. Silently unusable is a defect; honestly declared is a known
  limitation.

### 8.6 Returning to the main platform · **MANDATORY**

- The return control is **persistent** while the learner is in the lab (or at minimum always
  reachable without scrolling to a page bottom inside a scrollable iframe).
- It target-navigates to real platform pages, so browser Back works naturally.
- The control is a link, not `javascript:` and not a JS-only handler.

### 8.7 Asset paths · **MANDATORY**

These rules apply to whatever the deployed page loads: the lab bundle for Shapes A/B, and both the
platform output and the module paths it references for Shape C. Every rule applies to all shapes.

- Every reference to an asset in the deployed artifact is **relative** (`./…`, `../…`).
- **No** leading-slash paths (`/src/…`, `/assets/…`) anywhere in what the deployed page loads — they
  break under a GitHub Pages project subpath. *(Verified: the first lab's `dist/index.html` contains zero
  root-absolute `src`/`href` values and no `<base>` tag.)*
- The dev-only entry (`index.html` with `/src/main.tsx`) may be absolute; only the **built** output
  must be relative — for Shape C that means the platform `dist/` output and the module paths the
  built page references, not a lab bundle.
- If the bundler supports it, set an explicit relative base (e.g. `base: './'`) rather than relying
  on defaults.
- Asset references are case-exact — GitHub Pages is case-sensitive.

### 8.8 Build-pipeline integration · **MANDATORY**

Current pipeline facts (verified):

- `scripts/build.mjs` copies a **fixed list** of root HTML entries into `dist/`.
- It then builds **exactly one** lab — `External-labs/unit-2/lesson-1` — via
  `npm install` + `npm run build`, inside a `try/catch` that only prints a warning on failure.
- It then copies the whole `External-labs` tree into `dist/`, excluding `node_modules`.
- `.github/workflows/pages.yml` runs `npm run build` on push to `main` and deploys `dist/`.
- The workflow does **not** run `npm test`.

Integration requirements for a new lab:

1. **MANDATORY (Shapes A and B)** — the wrapper page is added to the copy list in
   `scripts/build.mjs`. **Shape C** instead requires that the platform page mounting the lab is
   already in that copy list, or is added to it by this PR — the lab must be reachable in `dist/`
   either way.
2. **MANDATORY (Shapes A and B)** — the lab's production output is present in
   `dist/External-labs/unit-X/lesson-Y/` after `npm run build` on a clean checkout. With today's
   single-hardcoded-lab step, that is achieved by the committed `dist/` (§6.4) **and must be
   asserted by an integration test**. **Shape C** has no such artifact; instead `npm run build` must
   emit the platform `dist/` containing the lab's shipped source (B4, §9.2 item 10).
3. **RECOMMENDED** — register the lab in a data-driven lab list in `scripts/build.mjs` instead of
   hardcoding, and make a lab build failure fatal (§6.5). This is the target state and is tracked in
   [Appendix D](#appendix-d--known-gaps-in-the-current-platform).
4. **MANDATORY** — do not add a second, divergent build path. One build command
   (`npm run build`) must produce the whole deployable site.

### 8.9 Local deployment and hosting compatibility · **MANDATORY**

The lab must work when `dist/` is served by any static file server, from a subpath, over HTTP:

```bash
npm run build
python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
# http://127.0.0.1:4173/lab-unit2-lesson1.html
```

- No `file://` support is required (the platform does not support it either — ES modules and fonts
  need HTTP).
- No SPA rewrite is available on GitHub Pages: every route must be a real file.
- Deployment target is **GitHub Pages** under `https://<owner>.github.io/Interactive-Physics-Grade8/`.
  Root-relative URLs and absolute origins break there. Anything that cannot be served from a plain
  static file server cannot be integrated.

### 8.10 Preserving the lab's independence · **MANDATORY**

Integration touches the lab's **metadata directory** only to add `INTEGRATION-REPORT.md` (§10) and,
if needed, to update the lab's own `README.md`. Wherever the executable source lives — inside the
metadata directory for Shapes A and B, under the platform `src/` conventions for Shape C — it is not
reformatted, not re-styled to match the platform, and not trimmed to fit a wrapper. For Shape C,
"not re-styled" also means the module keeps using the platform's shared modules rather than
forking them (§9.2 item 11). If a platform need truly requires a lab change, the
change is a **lab change**: separate commit, separate justification, and — for Shapes A and B —
rebuilt `dist/` with a re-recorded hash and a re-run clean-rebuild comparison. Shape C has no lab
`dist/`, so its equivalent is re-running the platform build and the B4 assertion (§12).

---

## 9. Integration and Quality Assurance

Six verification levels. **A successful build alone proves almost nothing** — it proves that the
bundler ran.

| Level | Proves | Automated in this repository? | Evidence |
|---|---|---|---|
| **A — Structural** | Files, paths, links, titles, sizes, `.gitignore` handling, and — for Shapes A/B — tracked-artifact presence | **Yes** — `node --test` (Node's test runner discovers `tests/*.test.js` **and** `External-labs/**/*.test.js`) | test output |
| **B — Clean-checkout production build** | The site can be built from scratch and contains the lab (for Shape C this is the *only* artifact evidence, and it is mandatory) | **Yes (manual invocation)** — `npm ci` + `npm run build`; CI builds but does **not** test | build log + `dist/` listing |
| **C — Functional interaction** | The controls actually do what they claim | **Partly** — DOM tests need `jsdom`, which is *not* installed, so those 13 tests **skip**; real browser runs need an external Playwright install | DOM/browser run log, interaction checklist |
| **D — Scientific correctness** | Numbers, units, signs, diagrams | **Partly** — pure functions are unit-testable; rendering is not | expected-vs-observed table |
| **E — Real-browser visual** | It looks right at 1366×768 and 1440×900 | **No** — requires a browser binary; none is committed | screenshots (§5.4) |
| **F — Regression** | Nothing else broke | **Yes** — the existing suite, compared to a captured baseline | baseline diff |

### 9.1 Baseline capture · **MANDATORY**

Before integrating, on a clean checkout of `main`:

```bash
# The root has NO package-lock.json, so `npm ci` fails there — do not run it at the root.
npm test 2>&1 | tail -20            # record pass/fail/skip counts and every "not ok"
npm run build                       # record success and dist/ contents
```

Inside a **Shapes A and B** lab directory that has its own lockfile, `npm ci` is correct and
preferred. A Shape C lab has no lab lockfile, so its reproducibility is proven by the root build
above (§9.2 items 9b, 11b).

On `main` @ `3d3c0e9` (2026-11-27) the baseline was: **569 tests, 553 pass, 3 fail, 13 skip**, zero
dependencies. The 3 failures are **pre-existing and unrelated to labs**:

| Failing test | File | Cause |
|---|---|---|
| `Lesson 1 remains an independent 20-question test after the authorized Unit 1 Test is published` | `tests/lesson-test.test.js` | stale assertion vs. current `main` |
| `lesson navigation follows 8 self-contained stages mapped to textbook pages 55 through 62` | `tests/lesson.test.js` | stale assertion vs. current `main` |
| whole file | `tests/physics-in-life.test.js` | `SyntaxError: … does not provide an export named 'NOTEBOOK_FORMULAS'` |

**Do not "fix" these in a lab PR** (§11 — no unrelated modifications). Record your baseline, and
require that your PR adds **zero** new failures.

### 9.2 Required integration tests · **MANDATORY**

A lab integration adds a test file (e.g. `tests/<lab-id>-integration.test.js`). The required
assertions depend on the declared output shape (§4.3).

**Required for every shape:**

1. the directory page contains the unit block and the lab's `.lab-row` with the exact lesson title;
2. the row links to the entry page with a `./`-relative path;
3. the entry page contains the return links (directory + home) and the lab region;
4. the entry page's `src`/`href` to the lab is relative and resolves to the real shipped path —
   for Shapes A/B the committed artifact, for Shape C the platform path that serves the lab source;
5. the lab metadata directory contains its `README.md` and `INTEGRATION-REPORT.md`, and the
   **authoritative** dependency manifest and lockfile paths are those the report declares — see the
   shape-specific items below. The metadata directory is **not** required to contain a manifest or
   lockfile of its own;
6. no root-absolute asset URLs in whatever the deployed page loads, and no `<base>` tag pointing
   off-site;
7. the pre-existing platform pages still match their key markers (regression smoke);
8. any declared-status row (e.g. `قريباً`) still does **not** claim availability.

**Additionally required for Shapes A and B:**

9. *(Shapes A and B only)* the separate lab artifact **is tracked by git** (`git ls-files`, not
   merely present on disk) and contains lab-specific content that could only come from the lab source;
9b. *(Shapes A and B only)* the lab directory contains its **own** dependency manifest and lockfile
   where the ecosystem has one (`package.json` + `package-lock.json` for npm), and `npm ci` against
   that lockfile reproduces the build (§6.1.2, §2 P3).

**Additionally required for Shape C:**

10. the complete platform production build contains the integrated functionality — after
    `npm run build`, the built `dist/` contains the lab's shipped source at its platform path and
    the built entry page references it, so the feature is genuinely deployed rather than merely
    present in the working tree;
11. the lab's own source is preserved in the repository (§6.1.2) and its integration does not
    duplicate or fork platform modules — a Shape C lab reuses the platform's shared modules
    (`src/math.js`, `src/fonts.css`, styles) rather than shipping parallel copies;
11b. *(Shape C)* when the module shares the platform toolchain, the **platform** manifest and
    lockfile are the authoritative ones and are **not** duplicated into the lab metadata directory;
    the report declares both paths, and reproducibility is proven by the root build (§9.1) rather
    than by a per-lab `npm ci`.

`tests/almakhbar-integration.test.js` (12 tests, all passing) is the reference for the universal
items 1–4 and 7–8, and for Shapes A/B items 9–9b (it reads the committed `dist/index.html` and
asserts lab-specific content). **No Shape C lab exists yet**, so items 10–11b have no reference
implementation — write them against the actual platform build, not against an imagined bundle.

### 9.3 Automated vs. manual — the bright line · **MANDATORY**

- **Automated** may be trusted only for what a test actually asserts on real bytes. A regex over
  HTML is a structural check; it is **not** proof of rendering.
- **Manual** is required for checks 5.1.1–5.1.5, 5.1.6b and 5.1.8 in §5.1, and for level E in §9.
- Every manual check in the report names **what was done**, **with what**, and **what was seen**.
- A skipped test is reported as **skipped**, never as passed. (The repository's own convention —
  "# SKIP jsdom is not installed here (developer-only package), so the DOM run is skipped rather
  than faked" — is the model to follow.)

### 9.4 When a browser or test environment is unavailable · **MANDATORY**

State it plainly:

```text
Limitation: the SD-card-quality / offline network profile could not be simulated exactly
(this environment blocks the CDN but allows the npm registry), so:
Therefore unverified: behaviour on a slow connection, Safari/iOS rendering.
Verified instead: real Chromium 141 at 1366×768 and 1440×900, navigation click-path, interactions,
console output, degraded-network render with all declared origins blocked.
Consequence: level E is NOT fully passed. The lab is structurally ready; visual acceptance is
limited to Chromium desktop at the two required viewports.
```

A browser being genuinely unavailable is the **only** acceptable version of this statement — and
per Appendix A15 it is currently **not** true in this environment, so "no browser" will be
challenged during review.

Never fabricate. Never downgrade the requirement to make a report look complete.

---

## 10. Integration Report

### 10.1 Requirement · **MANDATORY**

Every lab integration PR includes an `INTEGRATION-REPORT.md`.

**Location:** `External-labs/unit-X/lesson-Y/INTEGRATION-REPORT.md` — co-located with the lab it
describes, so multiple labs never collide. The root `INTEGRATION-REPORT.md` is the historical
record of the first lab and must **not** be overwritten or reused.

### 10.2 Required sections · **MANDATORY**

1. **Lab identity** — unit, lesson, exact official title, textbook pages, wrapper URL, lab URL.
2. **Source provenance** — the source branch name and source commit SHA, plus **every** path that
   makes up the integrated contribution, and a statement of how that complete set was verified
   against the source branch. Compare the *contribution*, never one directory in isolation:
   - **Shapes A and B** — the lab directory, plus the explicitly permitted built artifact (and any
     other permitted addition). The directory alone equals the source branch tip; the contribution
     equals that plus the artifact.
   - **Shape C** — the platform source module path(s) **and** the lab metadata directory
     (`External-labs/unit-X/lesson-Y/`), with every path listed explicitly. State that the metadata
     directory does **not** contain the executable source, and verify the pair against the source
     branch tip.
   *(For the first lab — Shape A: source branch `lab-source/unit-2-lesson-1` @ `fcb6341`; the
   integrated directory differs from that tip only by the added `dist/index.html`, and that single
   difference is the permitted artifact. A Shape C lab has no artifact, so its expected result is:
   platform module + metadata directory together equal the source branch tip, item for item.)*
   **If any path cannot be reconciled with the source branch tip, say so — an unexplained path is a
   provenance defect, not a formatting detail.**
3. **Technology and dependencies** — framework, bundler, styling, library versions, all external
   runtime origins, and any paid/back-end services (§4.6).
4. **Integration architecture** — shape A/B/C (§4.3), why, and how isolation is achieved.
5. **Build commands and results** — exact commands, toolchain versions, exit codes, artifact size,
   SHA-256, and whether the committed artifact matches a clean rebuild. *(Shapes A/B.)* For Shape C,
   report the **platform** build (`npm run build` at the root): exit code, what the built `dist/`
   contains for this lab, and the test that proves it (B4, §9.2 item 10). Do not report a lab
   `dist/index.html` size or hash — there is none.
6. **Test commands and results** — the lab's own tests, the baseline (§9.1), this PR's additions,
   and a diff of pass/fail/skip counts.
7. **Scientific verification** — expected-vs-observed table, diagram checks, and unit/sign checks.
8. **Visual QA evidence** — screenshots at **exactly** 1366×768 and 1440×900 with their paths and
   what each shows; or an explicit, honest limitation statement (§9.4).
9. **Known limitations** — declared external origins, unsupported viewports, autoplay constraints,
   model simplifications.
10. **Unresolved issues** — anything open, with impact and proposed follow-up.
11. **Final acceptance status** — one of `PASS`, `PASS WITH DECLARED LIMITATIONS`, `NOT ACCEPTED`,
    with the criteria from §12 that are unmet listed by number.

### 10.3 Honesty requirements · **MANDATORY**

- The report describes **this** integration, verified **now**, on **these** commits.
- "It should work" is not a result. "The build completed; rendering not checked — no browser" is.
- Numbers quoted (test counts, sizes, hashes) must be reproducible from the repository.

---

## 11. Pull Request Rules

### 11.1 · **MANDATORY**

| Rule | Detail |
|---|---|
| **One lab = one dedicated integration PR** | Two labs in one PR = not reviewable = rejected. |
| **PR base must be `main`** | Never stack lab PRs on each other. |
| **PR must remain OPEN and unmerged until reviewed by the repository owner** | The agent opens it and stops. |
| **No automatic merging** | Do not merge, do not enable auto-merge, do not ask another automation to merge. |
| **No source branch deletion** | Neither the `lab-source/*` branch nor the integration branch. |
| **No unrelated modifications** | No drive-by refactors, formatting sweeps, dependency bumps, or fixes to pre-existing failures. |
| **All changed files documented, with reasons** | §10 requires it; the PR body repeats the list. |

### 11.2 PR description · **MANDATORY**

The PR body must contain: what the lab is, its exact identity, the files added/modified **with one
reason per file**, the report path, the verification summary, the unmet criteria (if any), and the
sentence «This PR is intentionally left open and unmerged for owner review.»

### 11.3 When a lab PR should be closed instead of merged · **MANDATORY**

Missing source, missing authoritative lockfile, undeclared external dependency, scientific error, or
a fabricated verification claim — any one of these means the PR is `NOT ACCEPTED` (§10.2, item 11)
and must not be merged, even if CI is green. "Authoritative" is shape-aware: the lab's own lockfile
for Shapes A and B, the platform lockfile for Shape C (§9.2 items 9b, 11b) — a Shape C lab is not
rejected for lacking a lab-level lockfile it is forbidden to duplicate. For **Shapes A and B** only, a missing or untracked production output is
also disqualifying (§6.4); for Shape C the equivalent disqualifier is a platform build that does not
contain the integrated lab (B4).

### 11.4 Documentation PRs (like this one) · **MANDATORY distinction**

A standards/documentation PR is **not** a lab integration PR and does not require an
`INTEGRATION-REPORT.md` or visual QA. It still follows: base `main`, one purpose, no unrelated
changes, no application-code modifications, open-and-unmerged for the owner. Adding a single new
document under `docs/` (there is no `docs/README.md` index to update) is a complete, justified
change.

---

## 12. Acceptance Criteria

A lab may be approved **only** if every item below passes. "It builds" is item B1 — one line out of
the whole list.

**How the shape applies.** The lab declares its output shape (§4.3) in the report. Items marked
**A/B** apply only to Shapes A and B; items marked **C** apply only to Shape C; unmarked items apply
to **every** shape. An item that does not apply to the declared shape is reported as `N/A — <shape>`,
never silently skipped, and never treated as a pass for the other shape's requirement. The two
branches are deliberately equivalent in strength: Shapes A/B prove the lab artifact is committed and
correct; Shape C proves the platform build genuinely contains and serves the integrated lab.

### A. Structure and preservation

- [ ] **A1** The lab metadata directory is `External-labs/unit-X/lesson-Y/` and contains everything
      in §6.1.1. *(A/B additionally: it holds the complete executable source per §6.1.2.)*
- [ ] **A2** `README.md` follows §6.2, including real build instructions.
- [ ] **A3** The **authoritative** manifest and lockfile are committed and the build is reproducible
      from a clean checkout — *(A/B)* the lab's own, in the lab directory; *(C)* the platform's,
      declared in the report and not duplicated into the lab directory (§9.2 items 9b, 11b).
- [ ] **A4** No `node_modules`, caches, secrets, `.env`, or OS/editor junk committed.
- [ ] **A5** *(A/B)* Production output is committed and **tracked by git** (§6.4, §6.7).
- [ ] **A6** *(A/B)* The committed artifact matches a clean rebuild (§6.6), with hash recorded.
- [ ] **A7** *(all shapes)* Source branch `lab-source/unit-X/lesson-Y` exists and was not deleted or
      rewritten.
- [ ] **A8** *(C)* No separate `dist/` is committed or expected for this lab; the executable source
      is preserved under the platform's `src/` conventions at a path **declared in the report**, the
      metadata directory holds its documents and QA evidence, and the two together are the complete
      contribution (§6.1.1, §6.1.2, §4.3).

### B. Build

- [ ] **B1** A clean-checkout build succeeds on the PR branch — *(A/B)* `npm ci && npm run build`
      inside the lab; *(C)* `npm run build` at the platform root, which is the only build that
      ships a Shape C lab (§6.2 item 5).
- [ ] **B2** *(A/B)* `dist/` contains the entry page (wrapper) and
      `dist/External-labs/unit-X/lesson-Y/dist/index.html`.
- [ ] **B3** *(all shapes)* The lab loads from a static server under a subpath with no root-absolute
      URLs (§8.7).
- [ ] **B4** *(C)* The **platform** production build contains the integrated functionality: after
      `npm run build`, `dist/` contains the lab's shipped source at its platform path and the built
      entry page references it, so the lab is deployed rather than merely present in the working
      tree (§6.6, §9.2 item 10).

### C. Navigation and integration

- [ ] **C1** One `.lab-row` in the correct unit of `almakhbar.html`, with the exact lesson title.
- [ ] **C2** The row's link is `./`-relative and resolves in `dist/`.
- [ ] **C3** An entry page exists — a wrapper for Shapes A/B, or a platform page that mounts the lab
      for Shape C — is included by `scripts/build.mjs`, and offers return links to both the directory
      and the course home (§8.6).
- [ ] **C4** No unavailable lab is presented as available; status rows are honest (§8.2).
- [ ] **C5** Language, direction, landmarks and accessible names are correct (§8.4).
- [ ] **C6** Browser Back returns to the previous platform page.

### D. Function and science

- [ ] **D1** Every experiment/interaction exercised and recorded (§5.1.1).
- [ ] **D2** Every calculation checked against an independent hand computation, including sign and
      unit (§5.2).
- [ ] **D3** Diagrams verified for geometry, labels and direction.
- [ ] **D4** Questions: no answer before an attempt; wrong answers rejected; equivalent Arabic forms
      accepted; feedback accurate (§5.1.4).
- [ ] **D5** Scientific model limits stated on the page (§3.3).
- [ ] **D6** Book/platform labelling follows §3.5; no fabricated book attributions.
- [ ] **D7** Curriculum scope appropriate for Grade 8; numbering conflicts disclosed (§3.2).

### E. Browser and visual

- [ ] **E1** Production build inspected in a **real browser** at **exactly 1366×768** and
      **1440×900**, screenshots retained (§5.4).
- [ ] **E2** No horizontal scroll, clipping, overlap or truncation at either size (§5.7).
- [ ] **E3** Console free of errors in the production build; failed requests explained (§5.3).
- [ ] **E4** Audio, if any, behaves under autoplay policy (§5.1.5).
- [ ] **E5** With every declared external origin blocked, nothing *wrong* is displayed — no equation,
      unit or label silently changes meaning (§5.1.6b, §3.3).
- [ ] **E6** No internal scroll strip hides content at either viewport (`scrollWidth > clientWidth`
      measured on tab bars, sidebars and tables), even when the page itself does not overflow (§5.7).

### F. Regression and process

- [ ] **F1** `npm test` shows the same pre-existing failures as the recorded baseline and **no new
      ones** (§9.1).
- [ ] **F2** Integration tests added per §9.2 and passing — universal items 1–8 for every shape,
      plus item 9 (Shapes A/B) or items 10–11 (Shape C).
- [ ] **F3** `INTEGRATION-REPORT.md` complete (§10), located in the lab directory.
- [ ] **F4** Exactly one lab changed; no unrelated modifications (§11.1).
- [ ] **F5** No secrets, credentials or unapproved personal data (§2 P7).
- [ ] **F6** All external runtime origins declared and approved (§2 P4).
- [ ] **F7** PR open, unmerged, base `main`, branch preserved (§11).
- [ ] **F8** No fabricated evidence; every limitation stated (§9.4).

**A lab is declared acceptable only when every item that applies to its declared shape passes, or is
explicitly owner-waived in writing.** "Applicable" is defined by §4.3: A/B-only items for a Shape C
lab are recorded as `N/A`, not as passes, and a Shape C lab cannot be accepted by satisfying the A/B
branch instead of its own.

---

## 13. Post-Merge Verification

Merging is not the end. The repository owner merges; verification continues on the deployed site.

### 13.1 Steps · **MANDATORY**

1. **Confirm the deployment** — the GitHub Pages workflow
   (`.github/workflows/pages.yml`) has run successfully on the merge commit, and the deployed build
   is the merge commit's build (not a stale artifact).
2. **Open the lab through the real navigation** — start at the course home, click المخبر, then the
   lab row, then enter the lab. Do not paste the lab URL first; the point is to prove the path.
3. **Exercise the main interactions** — one pass through each station/experiment, including one
   wrong answer and one reset.
4. **Confirm assets load** — no 404s for fonts, math stylesheets, images or audio in the network
   panel; declared external origins resolve.
5. **Confirm return works** — the entry page's return controls reach the directory and the course
   home, and browser Back behaves.
6. **Confirm the rest of the site is intact** — home, a lesson page, a teacher area, a test page.

### 13.2 If post-merge verification fails · **MANDATORY**

Do **not** hot-fix `main` and do **not** force-push. Open a follow-up PR (lab fix or integration fix),
reference the failing step, and state the rollback decision explicitly. Rolling back means reverting
the merge commit through a new PR — never a history rewrite.

### 13.3 Record · **RECOMMENDED**

Append the post-merge result to the lab's `INTEGRATION-REPORT.md` (date, deploy URL, steps, outcome)
so the next agent sees the final state rather than the pre-merge one.

---

## 14. Future Compatibility

This standard is written to survive all of the following.

| Change | Why the standard still applies |
|---|---|
| **Arena is replaced by another AI coding agent** | Every rule references repository files and commands, not agent behaviour. A new agent reads §1–§14 and Appendix A, runs the commands, and produces the same evidence. Nothing depends on conversation history. |
| **The lab is developed on another platform/IDE** | §4.1 imposes no framework. A Godot export, a Svelte app, a Three.js scene and a hand-written ES-module page all satisfy §4.2. |
| **The framework or build system changes** | Requirements are stated as outcomes (reproducible output, relative paths, static hosting, a build that genuinely contains the lab). Any bundler that meets them is acceptable, and the shape (§4.3) says which artifact proves it. |
| **A lab needs a different runtime architecture** | Shapes A/B/C (§4.3) cover single-file, multi-file and platform-native. A genuinely new shape is allowed if it satisfies §4.2 and §8.4, and is added to §4.3 by a documentation PR. |
| **The platform moves off GitHub Pages** | §8.9 requires "any static host", so nothing depends on Pages specifically. Only §8.9's URL example and §13.1's deploy check are Pages-specific and are updated with the platform. |
| **The lab directory page is rebuilt** | Requirements are structural (one row per lab, exact title, honest status, relative link), not markup-specific. |

### 14.1 Maintenance of this document · **MANDATORY**

This standard is updated **only** by a documentation PR against `main`, and only when the
repository's reality has changed (pipeline, conventions, deployment). It must **not** be edited
inside a lab PR: an integration PR that also edits the standard is two purposes in one PR.

When updating, re-run [Appendix A](#appendix-a--repository-facts-this-standard-is-built-on)'s
checks and update the version line at the top with the new commit reference. Do not silently carry
forward stale facts.

### 14.2 Precedence

If this document conflicts with the code, **the code wins for facts** and this document is corrected.
If it conflicts with a request from the repository owner, the owner wins — recorded in the PR, and
this document is corrected afterwards so the next agent is not misled.

---

## Appendix A — Repository facts this standard is built on

Verified 2026-11-27 against `main` @ `3d3c0e9fce9cea820036f4663627ff7d1ee14397`
(Node 22.22.3, npm 10.9.8). Re-check these before relying on them.

> These are **current facts, not requirements**. If one of them changes, the standard still stands —
> only the table below is out of date, and §14.1 requires correcting it.
>
> Browser-derived facts (A7, A15–A21, D12–D14) come from the captures in
> `docs/qa/external-labs-standard/`, which also records the exact commands to reproduce them.

| # | Fact | How to re-check |
|---|---|---|
| A1 | Platform is static: no runtime deps, `npm start` = `python3 -m http.server` | `cat package.json` |
| A2 | Build copies a fixed HTML list, builds **one** lab in a `try/catch`, then copies `External-labs` minus `node_modules` | `sed -n '55,70p' scripts/build.mjs` |
| A3 | Deploy = GitHub Pages on push to `main`, `npm run build`, upload `./dist`, **no** test gate | `cat .github/workflows/pages.yml` |
| A4 | Root `.gitignore` = `dist/` + `node_modules/`; lab `dist/` is matched and was force-added | `git check-ignore -v --no-index External-labs/unit-2/lesson-1/dist/index.html` |
| A5 | Lab 1 = React 19.2.6, Vite 7.3.7, Tailwind 4.1.17, TS 5.9.3, `vite-plugin-singlefile` 2.3.0, `package-lock.json` v3, single-file output | `cat External-labs/unit-2/lesson-1/package.json` |
| A6 | Lab 1 output = `dist/index.html`, 828,520 bytes, 233,314 gzip, SHA-256 `1703eb0a…4be4c`, reproduced byte-identically by `npm ci && npm run build` | `npm ci && npm run build` in the lab dir; `sha256sum dist/index.html` |
| A7 | Lab 1 declares 3 external runtime origins (Google Fonts ×2, jsDelivr KaTeX) and one `wa.me` link; **the KaTeX stylesheet is load-bearing** — blocked, the Coulomb law renders as `F = Kd2\|q1 q2\|` | block the origins (or use an offline network profile), open the Coulomb station, read the formula; see `docs/qa/external-labs-standard/` |
| A8 | Lab 1 has **no** tests and no `test` script; `README.md` is 3 lines with no build instructions | `ls External-labs/unit-2/lesson-1`; `cat …/package.json` |
| A9 | Lab 1 source branch `lab-source/unit-2-lesson-1` @ `fcb6341` still exists; the integrated directory differs from it only by the added `dist/index.html` | `git fetch origin lab-source/unit-2-lesson-1 && git diff --stat FETCH_HEAD -- External-labs` |
| A10 | Wrapper = 56 px bar + `calc(100vh - 56px)` iframe → `./External-labs/unit-2/lesson-1/dist/index.html` | `cat lab-unit2-lesson1.html` |
| A11 | Directory `almakhbar.html`: 3 unit blocks, 1 live row, 1 `قريباً` row, empty states | `grep -n 'unit-dir\|lab-row' almakhbar.html` |
| A12 | Course-home nav already links المخبر at `index.html` line 30 | `grep -n almakhbar index.html` |
| A13 | Root suite baseline: 569 tests / 553 pass / 3 pre-existing failures / 13 jsdom skips | `npm test 2>&1 \| tail -12` |
| A14 | `node --test` discovers `External-labs/**/*.test.js` as well as `tests/*.test.js` | place a temporary test in a lab dir and run `node --test` |
| A15 | **A real browser IS reachable here** — none is installed system-wide, and `npx playwright install` downloads are blocked, but `playwright-core` + `@sparticuz/chromium` from the npm registry **works** once the bundled `al2023.tar.br` libs are on `LD_LIBRARY_PATH`. Chromium 141.0.7390.0 launched and rendered both viewports | `npm i playwright-core@1.56.1 @sparticuz/chromium@141.0.0` outside the repo, extract `bin/al2023.tar.br`, set `LD_LIBRARY_PATH` |
| A15b | The sandbox cannot reach `cdn.jsdelivr.net` or `fonts.googleapis.com` (HTTP `000`), while `registry.npmjs.org` works | `curl -s -o /dev/null -m 8 -w '%{http_code}' https://cdn.jsdelivr.net/…` |
| A15c | Because of A15, "no browser" is **not** an acceptable excuse in this environment. PR #60's blocked-browser claim predates this finding and must not be copied as precedent | read A15, then run the capture |
| A16 | Real-browser QA pattern exists: `scripts/qa-unit2-lesson{2,3,4}.mjs` → `docs/qa/<name>/` with `browser-results.json` | `cat docs/qa/unit2-lesson4/browser-results.json` |
| A17 | Teacher gate is client-side (PBKDF2 hash in `src/teacher-auth.js`), documented as not server-side authorization | `head -20 src/teacher-auth.js` |
| A18 | `README.md` does not yet document the المخبر / `External-labs` section | `grep -n 'المخبر\|External-labs' README.md` |
| A19 | Platform math is `htmlAndMathml` with vendored CSS; lab math is `output: "html"` with CDN CSS — the platform degrades safely, the lab does not | `grep -n 'output:' src/math.js External-labs/unit-2/lesson-1/src/lib/math.tsx` |
| A20 | The lab's station tab strip scrolls horizontally: its `<nav>` is 1331 px wide inside a 1240 px box at **both** 1366 and 1440, so the last tab («اختبر نفسي») is clipped at both laptop sizes | `el.scrollWidth > el.clientWidth` on `nav` in the lab iframe |
| A21 | The lab wrapper is `overflow: hidden` on `body`, so nothing inside can be reached by page scrolling; the lab iframe owns all scrolling | `grep -n 'overflow: hidden' lab-unit2-lesson1.html` |

---

## Appendix B — `INTEGRATION-REPORT.md` template

```markdown
# Integration Report — <Lab name> (Unit X, Lesson Y)

- **Date / toolchain:** <YYYY-MM-DD> · <OS> · Node <version> · <package manager> <version>
- **Lab identity:** الوحدة <X> · الدرس <Y> · «<exact official title>» · textbook pp<a>–<b>
- **Source branch:** `lab-source/unit-X/lesson-Y` @ `<sha>`
- **Metadata directory:** `External-labs/unit-X/lesson-Y/` (`README.md`, this report, QA evidence)
- **Executable source:** <A/B:> `External-labs/unit-X/lesson-Y/` (complete)
                        <C:>   `<platform src path(s)>` — declared here; **not** duplicated into the metadata directory
- **Provenance check:** <A/B:> metadata dir == source tip, plus the permitted built artifact
                        <C:> platform module(s) + metadata dir == source tip, path by path
- **Output shape:** <A | B | C> (§4.3) — decides which acceptance items apply
- **Lab URL:** <A/B:> `./lab-unitX-lessonY.html` → `./External-labs/unit-X/lesson-Y/dist/index.html`
               <C:>   `./<platform-page>.html` → source at `src/<lab-module>.js` (no separate dist)
- **Integration PR:** #<n> · base `main` · **OPEN, unmerged**

## 1. Technology and dependencies
| Item | Version | Why |
**Authoritative manifest / lockfile:** <A/B:> `External-labs/…/package.json` + `package-lock.json`
                                      <C:> repo-root `package.json` + `package-lock.json` (not duplicated)
## 2. External runtime origins (declared)
| Origin | Used for | If unreachable | Approved by |
## 3. Back-end / paid services
None.  <!-- or the §4.6 declaration + owner approval quote -->

## 4. Integration architecture
Shape <A|B|C> because <reason>. Isolation: <iframe | direct mount>. Chrome: <bar height, links>.
This declaration decides which acceptance items apply (A5/A6/B2 and test item 9 are A/B only;
A8/B4 and test items 10–11 are Shape C only).

## 5. Build

**Shapes A and B:**
| Command | Result | Notes |
`npm ci` → `<exit 0>`
`npm run build` → `<exit 0>`
Artifact: `dist/index.html`, <bytes> bytes, gzip <bytes>, SHA-256 `<hash>`
Clean-rebuild match: <byte-identical | differs, explained how>

**Shape C** (replace the block above):
`npm run build` (repository root) → `<exit 0>`
Built `dist/` contains the lab source at `<path>`; entry page `<path>` references it
No lab `dist/index.html` is expected — do not report a size or hash for one.

## 6. Tests
| Suite | Pass | Fail | Skip |
Baseline on `main` @ `<sha>`: <p>/<f>/<s> — failures: <list>
This PR: <p>/<f>/<s> — new failures: <none | list>

## 7. Scientific verification
| Relation | Symbols & units | Hand value | Lab value | Verdict |
| Diagram | What was checked | Verdict |

## 8. Visual QA
| Viewport | Build | Screenshots | Result |
| 1366×768 | production | `docs/qa/<lab>/<file>.png` | <what was seen> |
| 1440×900 | production | `docs/qa/<lab>/<file>.png` | <what was seen> |
<!-- If unavailable: state §9.4 limitation verbatim and mark E as NOT PASSED. -->

## 9. Known limitations
## 10. Unresolved issues
## 11. Acceptance status
**<PASS | PASS WITH DECLARED LIMITATIONS | NOT ACCEPTED>**
| Criterion | Status | Evidence |
| A1 … F8 | ✅ / ⚠️ / ❌ / N/A | |   <!-- N/A only for the other shape's items, with the shape named -->
```

---

## Appendix C — Copy-paste acceptance checklist

```markdown
### Acceptance — Unit X / Lesson Y
Declared output shape (§4.3): [ ] A   [ ] B   [ ] C
Only the items for the selected shape apply. The other shape's items are marked N/A — never
silently skipped, never counted as passes.

A. [ ] A1 metadata dir (§6.1.1)  [ ] A2 README  [ ] A4 clean  [ ] A7 source branch intact
   [ ] A3 authoritative manifest+lockfile declared & reproducible
             (A/B: lab's own  |  C: platform's, not duplicated)
   A/B only:  [ ] A5 dist tracked  [ ] A6 rebuild match
   C only:    [ ] A8 module at declared platform path + metadata dir, no separate dist
B. [ ] B1 clean build  [ ] B3 subpath/relative URLs
   A/B only:  [ ] B2 dist contents (entry page + lab dist/index.html)
   C only:    [ ] B4 platform dist/ contains the shipped lab source + entry page references it
C. [ ] C1 directory row  [ ] C2 relative link  [ ] C3 entry page + returns
   [ ] C4 honest status  [ ] C5 a11y/RTL  [ ] C6 Back works
D. [ ] D1 interactions  [ ] D2 numbers  [ ] D3 diagrams  [ ] D4 questions
   [ ] D5 model limits  [ ] D6 labelling  [ ] D7 scope/numbering
E. [ ] E1 1366×768 + 1440×900 screenshots  [ ] E2 no overflow/clipping
   [ ] E3 console clean  [ ] E4 media  [ ] E5 degraded-network math still correct
   [ ] E6 no clipped scroll strip
F. [ ] F1 no new failures  [ ] F2 integration tests (universal 1-8; A/B 9 + 9b; C 10-11b)
   [ ] F3 report  [ ] F4 one lab only  [ ] F5 no secrets  [ ] F6 origins declared
   [ ] F7 PR open/unmerged  [ ] F8 no fabricated evidence
Status: PASS / PASS WITH DECLARED LIMITATIONS / NOT ACCEPTED
Shape check: the N/A items belong to the *other* shape only, and the selected shape's own items
all pass. A Shape C lab may not be accepted on the A/B branch, or vice versa.
```

---

## Appendix D — Known gaps in the current platform

These are **real, verified** gaps between this standard and the repository as of the date above.
They are listed so no agent assumes capabilities that do not exist, and so they can be closed
deliberately rather than accidentally.

| # | Gap | Impact | Closing action |
|---|---|---|---|
| D1 | `scripts/build.mjs` builds only `External-labs/unit-2/lesson-1`, hardcoded | A second **Shape A/B** lab's output reaches `dist/` only through the committed `dist/` copy (Shape C is unaffected — it is copied as platform source) | Make the lab list data-driven (§8.8.3) |
| D2 | The lab-build step is wrapped in `try/catch` and only warns | A broken lab build deploys a stale artifact and the pipeline still reports success | Make failures fatal (§6.5) |
| D3 | The step runs `npm install`, not `npm ci` | A drifted lockfile can pass locally and fail in CI | Switch to `npm ci` |
| D4 | `pages.yml` runs `npm run build` but not `npm test` | Broken tests can reach `main` and deploy | Add a test step (after §D6) |
| D5 | Root `.gitignore` `dist/` also matches lab `dist/` | New **Shape A/B** labs' artifacts silently untracked (no effect on Shape C, which commits none) | Negation rules or documented `git add -f` (§6.7) |
| D6 | 3 pre-existing test failures, 13 jsdom skips on `main` | "Green suite" cannot be used as an acceptance signal | Fix separately; until then use a captured baseline (§9.1) |
| D7 | Lab 1 `README.md` has no build instructions | The first lab cannot be rebuilt by a newcomer without reading the report | Extend it in a future lab-maintenance PR |
| D8 | Lab 1 has no tests | Its own behaviour is verified only by hand | Add lab tests in a future PR |
| D9 | No `docs/README.md` index; 24 other `.md` documents already sit loose in `docs/` | New documents are hard to discover | Optional index PR |
| D10 | `README.md` never mentions المخبر / `External-labs` | The lab section is invisible to anyone reading the main README | Documentation PR |
| D11 | RTL/LTR math is enforced only on platform pages (`src/math.js`) | A lab can ship unisolated math and still pass | Add to the lab checklist (§3.3, §12 D2) |
| D12 | Lab 1 renders KaTeX with `output: "html"` and a CDN stylesheet, so math has **no MathML fallback** and breaks into wrong text when the CDN fails (`F = Kd2\|q1 q2\|`) | A learner on a filtered network sees a scientifically wrong equation labelled «من الكتاب» | Vendor `vendor/katex/katex.min.css` + `output: 'htmlAndMathml'` in a lab-maintenance PR |
| D13 | Lab 1's 8-tab strip is 1331 px wide inside a 1240 px box at both 1366 and 1440, clipping «اختبر نفسي» | The last station is hard to reach at the required laptop sizes; the page-level overflow check still passes | Fix the tab strip in a lab-maintenance PR (§5.7) |
| D14 | `INTEGRATION-REPORT.md` (first lab) claimed browser evidence was impossible; a browser **was** reachable via the repo's own QA pattern | Future agents may copy a false limitation | Corrected in this standard (A15, §5.5); the old report is left untouched as a historical record |

**None of these gaps block a lab that follows this standard** — §6.4, §9.1 and §10 exist precisely
to work around them honestly. Closing them is a separate, owner-approved effort.

---

*End of standard. This document is authoritative for lab integration; it is corrected when the
repository changes, and it is never replaced by a conversation.*
