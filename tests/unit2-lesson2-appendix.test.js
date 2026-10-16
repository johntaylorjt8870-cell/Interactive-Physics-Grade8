/*
 * Tests for the Unit 2 Lesson 2 appendix — «رحلة الشحنات — من المولّد إلى المصباح».
 *
 * The suite covers, in order:
 *   1. the standalone page: RTL, its own stylesheet and module, KaTeX, the
 *      return paths and every hook the script fills in;
 *   2. the authored content: the three printed objectives, the three keywords,
 *      the three «ألاحظ وأستنتج» questions, the station → objective → keyword
 *      coverage, and the source-versus-enrichment labelling;
 *   3. the physics: I = Q/t and its two equivalent forms, every validation path
 *      (zeros, negatives, unreadable and non-finite input, division by zero),
 *      unit conversion, the three calculator targets, the ammeter and the
 *      seeded drift model;
 *   4. the interaction state: station flow, hash routing, the three answer
 *      kinds, retry without penalty and the self-check list;
 *   5. the design guarantees: focus states, touch targets, RTL/LTR isolation,
 *      reduced motion and responsive rules;
 *   6. registration plus the scope guarantees: the preserved lesson, its test
 *      and the teacher area are untouched.
 *
 * The interaction behaviours are exercised for real at the bottom of the file:
 * when jsdom is available the appendix is mounted against the published page.
 * jsdom is a developer-only package (it is not a dependency of this project),
 * so that block reports itself as skipped rather than passing silently when the
 * package is absent.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { formula } from '../src/math.js';
import {
  ALL_QUESTIONS,
  APPENDIX_KEYWORDS,
  APPENDIX_OBJECTIVES,
  APPENDIX_STATIONS,
  APPENDIX_TITLE,
  AMMETER_BOOK_VALUE,
  AMMETER_QUESTIONS,
  CALCULATOR_COPY,
  ARROW_CAPTION_COPY,
  CHECKLIST_ITEMS,
  CONCEPT_LINKS,
  CONCEPT_NODES,
  DETECTIVE_QUESTIONS,
  DIRECTION_LEGEND,
  DIRECTION_LEGEND_NOTE,
  DIRECTION_QUESTIONS,
  DIRECTION_TOGGLES,
  ELECTRON_QUESTIONS,
  ELECTRONS_GENERATOR_NOTE,
  ELECTRONS_MODEL_LIMITS,
  EXTENSION_LABEL,
  FOOTER_NOTE,
  KEY_IDEAS,
  LESSON_PAGES,
  MODEL_LABEL,
  NOT_BOOK_LABEL,
  ORIGIN_QUESTIONS,
  PART_CARDS,
  PLATFORM_LABEL,
  RELATION_CHALLENGES,
  RELATION_FORMS,
  SCENE_COPY,
  SCENE_LABEL,
  SCOPE_NOTES,
  SOURCE_LABEL,
  SYMBOL_LEGEND,
  findQuestion,
  findStation,
  objectivesOfStation,
  questionsOfStation,
} from '../src/unit2-lesson2-appendix-content.js';
import {
  AMMETER,
  ARROW_SPOTS,
  CALCULATOR_START,
  CALCULATOR_TARGETS,
  ARROW_CAPTIONS,
  CIRCUIT,
  DIRECTION_ANGLE,
  DRIFT_DEFAULTS,
  FIELD_META,
  GENERATOR_INTERIOR,
  LAB_RANGE,
  RELATION_TEX,
  advanceDrift,
  ammeterReading,
  ampereToMilliampere,
  calculatorReport,
  chargeFromCurrentTime,
  clampValue,
  consistencyReport,
  createCalculatorState,
  createDriftState,
  currentFromChargeTime,
  driftSummary,
  drawnArrows,
  electronPoint,
  boxGap,
  boxesOverlap,
  formatNumber,
  insideGenerator,
  kiloampereToAmpere,
  loopLength,
  microampereToAmpere,
  milliampereToAmpere,
  needleAngle,
  numberTeX,
  oppositeFlowReport,
  pointOnLoop,
  quantityTeX,
  resetCalculatorState,
  resetDriftState,
  scaleLabInput,
  SCENE_LABEL_ANCHORS,
  SCENE_LABEL_SETS,
  SCENE_SOLID_BOXES,
  SCENE_WIRE_BOXES,
  segmentDirections,
  setCalculatorInput,
  setCalculatorTarget,
  setCalculatorUnit,
  setDriftClosed,
  timeFromChargeCurrent,
  toAmperes,
  toSeconds,
} from '../src/unit2-lesson2-appendix-physics.js';
import {
  answerIsReady,
  answerProgress,
  appendixCoverageReport,
  checklistProgress,
  createAnswerState,
  createChecklistState,
  createStationFlow,
  goToStation,
  initialOrder,
  moveOrderItem,
  questionsIntegrityReport,
  retryAnswer,
  selectAnswer,
  setNumberAnswer,
  stationAnswerProgress,
  stationHash,
  stationIdFromHash,
  stepStation,
  submitAnswer,
  toggleChecklistItem,
} from '../src/unit2-lesson2-appendix-flow.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const near = (actual, expected, tolerance = 1e-9, message = '') => {
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${message} ${actual} ≠ ${expected}`);
};

/* ==================================================================== page */

test('the appendix is a standalone RTL page with its own identity, KaTeX and return paths', async () => {
  assert.equal(existsSync(new URL('../unit2-lesson-2-appendix.html', import.meta.url)), true);
  const page = await read('../unit2-lesson-2-appendix.html');
  assert.match(page, /<html lang="ar" dir="rtl">/);
  assert.match(page, /<title>رحلة الشحنات — ملحق الدرس الثاني من الوحدة الثانية/);
  assert.match(page, /<meta name="viewport" content="width=device-width, initial-scale=1" \/>/);
  assert.match(page, /<meta name="theme-color" content="#f4efe4" \/>/);
  assert.match(page, /href="\.\/src\/fonts\.css"/);
  assert.match(page, /href="\.\/vendor\/katex\/katex\.min\.css"/);
  assert.match(page, /href="\.\/src\/unit2-lesson2-appendix\.css"/);
  assert.match(page, /src="\.\/src\/unit2-lesson2-appendix\.js"/);
  assert.match(page, /<main id="appendix-main" data-unit2-lesson2-appendix>/);
  assert.match(page, /<a class="u2l2a-skip-link" href="#station-panels">/);
  /* platform extension, never a new lesson, and never a replacement for it */
  assert.match(page, /ملحق تفاعلي — <bdi dir="ltr">Platform Extension<\/bdi>/);
  assert.match(page, /<span aria-current="page">رحلة الشحنات<\/span>/);
  for (const hook of ['hero-description', 'keyword-row', 'objective-list', 'howto-steps', 'station-nav', 'station-panels', 'station-progress-track', 'station-progress-fill', 'station-progress-label', 'station-progress-value', 'answer-progress', 'previous-station', 'next-station', 'control-center', 'start-first-station', 'hero-lesson-label', 'hero-note']) {
    assert.ok(page.includes(`id="${hook}"`), `the page must contain #${hook}`);
  }
  assert.match(page, /role="progressbar"[^>]*aria-valuemin="1" aria-valuemax="7" aria-valuenow="1"/);
  assert.match(page, /<kbd>Page Up<\/kbd>/);
  assert.match(page, /<kbd>Page Down<\/kbd>/);
  assert.match(page, /<kbd>Home<\/kbd>/);
  assert.match(page, /<kbd>End<\/kbd>/);
  /* the book's printed scope, and the return paths */
  assert.ok(page.includes(`صفحات الكتاب ${LESSON_PAGES}`), 'the printed page range must be the audited one');
  assert.match(page, /href="\.\/unit2-lesson-2\.html"/);
  assert.match(page, /href="\.\/appendices\.html"/);
  assert.match(page, /href="\.\/">الرئيسية<\/a>/);
  assert.ok(page.includes(FOOTER_NOTE), 'the footer must repeat the audited scope note');
  /* the appendix never loads a lesson, a test or a teacher module */
  assert.doesNotMatch(page, /unit2-lesson2-main\.js|unit2-lesson-2-test|unit2-lesson-2-teacher|teacher-auth|assessment/);
  assert.match(page, /<noscript>/);
  assert.equal(questionsOfStation('origin').length, ORIGIN_QUESTIONS.length);
});

test('the appendix module mounts itself, owns its own files and never reaches into a lesson', async () => {
  const module = await import('../src/unit2-lesson2-appendix.js');
  assert.equal(typeof module.mountJourneyAppendix, 'function');
  const allowed = new Set(['./math.js', './unit2-lesson2-appendix-content.js', './unit2-lesson2-appendix-flow.js', './unit2-lesson2-appendix-physics.js']);
  for (const file of ['unit2-lesson2-appendix.js', 'unit2-lesson2-appendix-content.js', 'unit2-lesson2-appendix-flow.js', 'unit2-lesson2-appendix-physics.js']) {
    const source = await read(`../src/${file}`);
    const imports = [...source.matchAll(/from '([^']+)'/g)].map((match) => match[1]);
    for (const specifier of imports) assert.ok(allowed.has(specifier), `${file} may not reach into ${specifier}`);
    if (file !== 'unit2-lesson2-appendix-physics.js') {
      assert.ok(imports.length > 0, `${file} must import what it needs`);
    }
  }
  const script = await read('../src/unit2-lesson2-appendix.js');
  assert.match(script, /const appendixRoot = typeof document !== 'undefined'/);
  assert.match(script, /root\.ownerDocument\.defaultView/);
  assert.match(script, /scrollIntoView\?\.\(/);
});

/* ================================================================= content */

test('the three printed objectives, keywords and questions are the audited ones', () => {
  assert.equal(APPENDIX_TITLE, 'رحلة الشحنات');
  assert.deepEqual(APPENDIX_OBJECTIVES.map((objective) => objective.text), [
    'يتعرّف التيّار الكهربائيّ المُتواصِل.',
    'يحدّد جهة التيّار الكهربائيّ المُتواصِل.',
    'يستنتج العلاقة بين شِدّة التيّار وكميّة الكهرباء وزمن مرورها.',
  ]);
  assert.deepEqual(APPENDIX_KEYWORDS.map((keyword) => keyword.label), ['الإلكترونات الحرّة', 'شِدّة التيّار', 'كميّة الكهرباء']);
  for (const keyword of APPENDIX_KEYWORDS) assert.ok(keyword.gloss.length > 20, `${keyword.id} needs a real gloss`);
  assert.equal(LESSON_PAGES, '87–96');

  /* the three questions of «ألاحظ وأستنتج» are genuine tasks of station 1 */
  assert.deepEqual(ORIGIN_QUESTIONS.map((question) => question.prompt), [
    'من أين نحصل على الطاقة الكهربائية؟',
    'ما دور المولّد في الدارة؟ رتّب الجمل الثلاث لتحصل على تفسير مترابط.',
    'كيف انتقلت الطّاقة الكهربائية من المولّد إلى المصباح؟',
  ]);
  assert.deepEqual(ORIGIN_QUESTIONS.map((question) => question.kind), ['choice', 'order', 'choice']);
  assert.deepEqual(ORIGIN_QUESTIONS.map((question) => question.source), ['book', 'book', 'book']);
  assert.deepEqual(questionsOfStation('origin').map((question) => question.id), ['origin-1', 'origin-2', 'origin-3']);
  assert.match(findQuestion('origin-2').explanationHtml, /المولّد لا يُنتِج إلكترونات/);
  assert.match(findQuestion('origin-2').explanationHtml, /p88/);
});

test('every station serves the lesson objectives and keywords, and every task is explained', () => {
  const coverage = appendixCoverageReport();
  assert.equal(coverage.stationCount, APPENDIX_STATIONS.length);
  assert.equal(coverage.objectiveCount, 3);
  assert.equal(coverage.keywordCount, 3);
  assert.equal(coverage.questionCount, 22);
  assert.equal(coverage.everyStationServesAnObjective, true);
  assert.equal(coverage.everyKeywordTaughtSomewhere, true);
  assert.equal(coverage.everyObjectiveHasAStation, true);
  assert.equal(coverage.everyObjectiveHasAChecklistItem, true);
  assert.equal(coverage.everyConceptNodeOpensAStation, true);
  assert.equal(coverage.everyLinkConnectsKnownNodes, true);
  assert.equal(coverage.linksDoNotSelfLoop, true);
  for (const row of coverage.stationKeywordCoverage) {
    assert.ok(row.keywords >= 2, `${row.station} must name at least two lesson keywords`);
    assert.ok(row.objectives >= 1, `${row.station} must serve at least one objective`);
    assert.equal(row.allKeywordsKnown, true);
    assert.equal(row.allObjectivesKnown, true);
  }
  assert.deepEqual(APPENDIX_STATIONS.map((station) => station.id), ['origin', 'electrons', 'direction', 'ammeter', 'relation', 'detective', 'map']);
  assert.deepEqual(APPENDIX_STATIONS.map((station) => station.index), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(APPENDIX_STATIONS.map((station) => station.title), [
    'من أين تأتي الطاقة؟',
    'رحلة الإلكترونات الحرّة',
    'أيّ جهة يسير فيها التيّار؟',
    'مختبر شِدّة التيار',
    'العلاقة بين شِدّة التيار وكمية الكهرباء والزمن',
    'المحقّق الكهربائي',
    'خريطة الفهم',
  ]);
  for (const station of APPENDIX_STATIONS) {
    assert.ok(objectivesOfStation(station.id).length >= 1, `${station.id} needs an objective`);
    assert.ok(station.goal.length > 30, `${station.id} needs a real goal`);
    assert.ok(station.kicker.length > 6, `${station.id} needs a kicker`);
  }

  const report = questionsIntegrityReport();
  assert.equal(report.length, ALL_QUESTIONS.length);
  for (const row of report) {
    assert.equal(row.promptIsSubstantive, true, `${row.id} prompt`);
    assert.equal(row.explanationIsSubstantive, true, `${row.id} explanation`);
    assert.equal(row.everyChoiceExplained, true, `${row.id} choices`);
    assert.equal(row.exactlyOneCorrectChoice, true, `${row.id} single answer`);
    assert.equal(row.orderPositionsComplete, true, `${row.id} ordering`);
    assert.equal(row.numericTargetDeclared, true, `${row.id} numeric target`);
    assert.ok(row.pageRef >= 87 && row.pageRef <= 96, `${row.id} must cite a page of 87–96`);
  }
  assert.equal(ALL_QUESTIONS.length, 22);
  assert.equal(ALL_QUESTIONS.filter((question) => question.kind === 'order').length, 2);
  assert.equal(ALL_QUESTIONS.filter((question) => question.kind === 'number').length, 2);
  assert.equal(ALL_QUESTIONS.filter((question) => question.source === 'book').length, 11, 'eleven tasks quote or test a printed statement');
  assert.equal(ORIGIN_QUESTIONS.length + ELECTRON_QUESTIONS.length + DIRECTION_QUESTIONS.length + AMMETER_QUESTIONS.length + RELATION_CHALLENGES.length + DETECTIVE_QUESTIONS.length, ALL_QUESTIONS.length);
  assert.equal(ELECTRON_QUESTIONS.length, 2);
  assert.equal(DIRECTION_QUESTIONS.length, 2);
  assert.equal(AMMETER_QUESTIONS.length, 4);
  assert.equal(RELATION_CHALLENGES.length, 4);
  assert.equal(DETECTIVE_QUESTIONS.length, 7, 'the final challenge is seven tasks in one workshop');
  /* the final station is a synthesis, not the lesson test */
  for (const question of DETECTIVE_QUESTIONS) {
    assert.ok(question.explanationHtml.length > 40, `${question.id} must explain`);
  }
});

test('source material stays separated from platform material, and no figure is claimed as the printed one', async () => {
  const everything = JSON.stringify({ ALL_QUESTIONS, PART_CARDS, SYMBOL_LEGEND, KEY_IDEAS, RELATION_FORMS, SCOPE_NOTES, CONCEPT_NODES, AMMETER_BOOK_VALUE });
  assert.ok(everything.includes(SOURCE_LABEL));
  /* the two badges are rendered by the view, so both labels must reach it */
  const view = await read('../src/unit2-lesson2-appendix.js');
  assert.ok(view.includes('SOURCE_LABEL'), 'the view must render the book badge');
  assert.ok(view.includes('PLATFORM_LABEL'), 'the view must render the platform badge');
  assert.match(PLATFORM_LABEL, /شرح المنصة/);
  /* the printed ampere convention and the printed series reading are quoted as such */
  assert.equal(AMMETER_BOOK_VALUE.current, 0.2);
  assert.match(AMMETER_BOOK_VALUE.label, /200 mA/);
  assert.match(AMMETER_BOOK_VALUE.label, /صفحة 92/);
  assert.match(AMMETER_BOOK_VALUE.noteHtml, /من إعداد المنصة/);
  /* every numeric example is a labelled platform example, never a book number */
  const numericQuestions = ALL_QUESTIONS.filter((item) => item.kind === 'number');
  assert.equal(numericQuestions.length, 2);
  assert.equal(numericQuestions.every((question) => question.source === 'platform'), true);
  assert.match(numericQuestions.find((question) => question.id === 'relation-number').prompt, /من إعداد المنصة/);
  /* the final challenge's calculation is introduced by a platform-labelled card
     and every platform-sourced task carries the badge in the DOM */
  assert.match(view, /sourceCard\(PLATFORM_LABEL, DETECTIVE_SCENARIO_HTML\)/);
  assert.match(view, /u2l2a-question-tag is-platform">\$\{PLATFORM_LABEL\}/);
  assert.equal(DETECTIVE_QUESTIONS.find((question) => question.id === 'detective-7').source, 'platform');
  /* the scene is declared as an explanatory drawing, not a reproduction */
  assert.match(SCENE_LABEL, /ليس نقلاً مؤكداً لشكل الكتاب/);
  assert.match(MODEL_LABEL, /نموذج تعليمي مبسّط/);
  assert.match(NOT_BOOK_LABEL, /ليست أسئلة اختبار الدرس/);
  assert.ok(SCOPE_NOTES.some((note) => note.includes('لا تُعاد طباعة')));
  assert.ok(SCOPE_NOTES.some((note) => note.includes('منطقة المعلم')));
  for (const note of SCOPE_NOTES) assert.ok(note.length > 30, note);
});

test('every string that reaches an SVG scene is plain text, never markup', () => {
  /* SVG is foreign content in the HTML parser: one HTML tag inside a <text>
     node closes the whole scene and orphans every node after it. The map's link
     captions and node labels are the strings that live inside <text>. */
  for (const link of CONCEPT_LINKS) {
    assert.doesNotMatch(link.label, /[<>]/, `link ${link.from}-${link.to} caption must be plain text`);
    assert.ok(link.label.trim().length > 8);
  }
  for (const node of CONCEPT_NODES) {
    assert.doesNotMatch(node.short, /[<>]/);
    assert.doesNotMatch(node.label, /[<>]/);
    assert.equal(typeof node.stationId, 'string');
  }
  for (const card of PART_CARDS) {
    assert.doesNotMatch(card.labelInScene, /[<>]/, `${card.id} in-scene label`);
  }
  for (const toggle of DIRECTION_TOGGLES) assert.doesNotMatch(toggle.label, /[<>]/);
  assert.equal(typeof findStation('map').title, 'string');
});

test('the relation is stated with the printed symbols, each form on its own LTR line', () => {
  assert.equal(RELATION_TEX, 'I=\\dfrac{Q}{t}');
  assert.deepEqual(RELATION_FORMS.map((form) => form.target), ['I', 'Q', 't']);
  assert.equal(RELATION_FORMS.length, 3);
  for (const form of RELATION_FORMS) {
    /* one display block per form: RTL prose can never reorder an equation */
    assert.match(form.html, /class="math math-display equation" dir="ltr"/);
    assert.match(form.html, /role="math"/);
    assert.equal((form.html.match(/<div/g) ?? []).length, 1, `${form.target} must be a single undivided block`);
  }
  const chargeRow = SYMBOL_LEGEND.find((row) => row.name.includes('كميّة الكهرباء'));
  assert.ok(chargeRow, 'the charge row exists');
  assert.equal(FIELD_META.Q.baseUnit, 'C');
  assert.equal(FIELD_META.I.baseUnit, 'A');
  assert.equal(FIELD_META.t.baseUnit, 's');
  assert.deepEqual(FIELD_META.t.units, ['s', 'min']);
  assert.deepEqual(FIELD_META.I.units, ['A', 'mA']);
  assert.equal(CALCULATOR_COPY.graphNote.includes('60'), true);
  assert.equal(CALCULATOR_START.Q, '60');
  assert.equal(CALCULATOR_START.t, '30');
});

/* ================================================================= physics */

test('I = Q/t, its equivalent forms and every unit of page 91 behave', () => {
  near(currentFromChargeTime(60, 30).current, 2);
  near(currentFromChargeTime(45, 15).current, 3);
  near(currentFromChargeTime(12, 120).current, 0.1);
  near(currentFromChargeTime(0, 30).current, 0, 1e-12, 'zero charge is a legal zero reading');
  near(chargeFromCurrentTime(2, 180).charge, 360);
  near(chargeFromCurrentTime(0.1, 300).charge, 30);
  near(timeFromChargeCurrent(45, 3).time, 15);
  near(timeFromChargeCurrent(900, 3).time, 300);

  /* the multiples and submultiples printed with the units on p91 */
  near(milliampereToAmpere(200), 0.2);
  near(ampereToMilliampere(0.2), 200);
  near(microampereToAmpere(500), 5e-4);
  near(kiloampereToAmpere(2), 2000);
  near(toSeconds(3, 'min'), 180);
  near(toSeconds(30, 's'), 30);
  near(toAmperes(200, 'mA'), 0.2);
  near(toAmperes(2, 'A'), 2);

  /* the round trip is exact for the printed application */
  const report = consistencyReport();
  for (const row of report) {
    assert.equal(row.chargeReturns, true, `charge ${row.charge}`);
    assert.equal(row.timeReturns, true, `time ${row.charge}/${row.time}`);
  }
  assert.ok(report.some((row) => row.charge === 60 && row.time === 30 && row.current === 2), 'the p91 application is in the report');
});

test('every invalid input is refused, including the division by zero', () => {
  assert.throws(() => currentFromChargeTime(60, 0), RangeError);
  assert.throws(() => currentFromChargeTime(60, -1), RangeError);
  assert.throws(() => currentFromChargeTime(-1, 30), RangeError);
  assert.throws(() => currentFromChargeTime(Number.NaN, 30), RangeError);
  assert.throws(() => currentFromChargeTime(60, Number.POSITIVE_INFINITY), RangeError);
  assert.throws(() => chargeFromCurrentTime(2, 0), RangeError);
  assert.throws(() => timeFromChargeCurrent(60, 0), RangeError);
  assert.throws(() => timeFromChargeCurrent(-5, 2), RangeError);
  assert.throws(() => timeFromChargeCurrent(60, -3), RangeError);
  assert.throws(() => toSeconds(1, 'h'), RangeError);
  assert.throws(() => toAmperes(1, 'kA'), RangeError);
  assert.throws(() => formatNumber(Number.NaN), RangeError);
  assert.throws(() => pointOnLoop(Number.NaN), RangeError);
  assert.throws(() => createDriftState({ electronCount: 2 }), RangeError);
  assert.throws(() => createDriftState({ electronCount: 500 }), RangeError);
  assert.throws(() => advanceDrift(createDriftState(), 0), RangeError);
  assert.throws(() => advanceDrift(createDriftState(), 4), RangeError);
  assert.throws(() => advanceDrift(createDriftState(), -1), RangeError);
  assert.throws(() => clampValue(5, 10, 10), RangeError);
  assert.throws(() => scaleLabInput(60, LAB_RANGE.charge, 0), RangeError);
  assert.throws(() => needleAngle(-1), RangeError);
  assert.throws(() => ammeterReading(Number.NaN, 30), RangeError);
  assert.throws(() => ammeterReading(60, 'x'), RangeError);
  /* the lab controls live on the slider grid: an out-of-range value is clamped,
     so the division can never be performed with a zero time */
  assert.equal(ammeterReading(60, 0).time, LAB_RANGE.time.min);
  assert.equal(ammeterReading(0, 0).charge, LAB_RANGE.charge.min);
  assert.ok(Number.isFinite(ammeterReading(-500, -500).current));
});

test('number formatting and LaTeX never produce invalid KaTeX', () => {
  assert.equal(formatNumber(2), '2');
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(0.1), '0.1');
  assert.equal(formatNumber(1 / 3), '0.3333');
  assert.equal(formatNumber(1e-4), '1e-4');
  assert.equal(numberTeX(0.0001234), '1.234\\times 10^{-4}');
  assert.equal(quantityTeX(2, 'A'), '2\\,\\mathrm{A}');
  assert.equal(quantityTeX(0.2, 'A'), '0.2\\,\\mathrm{A}');
  /* every substitution line of a wide sweep must survive KaTeX with throwOnError */
  for (const charge of [0, 1, 12, 45, 60, 120, 900, 0.5]) {
    for (const time of [1, 5, 30, 120, 180]) {
      const state = setCalculatorInput(setCalculatorInput(createCalculatorState('I'), 'Q', String(charge)), 't', String(time));
      const report = calculatorReport(state);
      assert.equal(report.status, 'ok', `${charge}/${time}`);
      for (const step of report.steps) assert.match(formula(step.tex, step.plain), /katex/);
    }
  }
  for (const current of [0, 0.2, 2, 200]) {
    for (const unit of ['A', 'mA']) {
      let state = createCalculatorState('Q');
      state = setCalculatorInput(state, 'I', String(current));
      state = setCalculatorInput(state, 't', '30');
      state = setCalculatorUnit(state, 'I', unit);
      const report = calculatorReport(state);
      assert.equal(report.status, 'ok', `${current} ${unit}`);
      for (const step of report.steps) assert.match(formula(step.tex, step.plain), /katex/);
    }
  }
});

test('the calculator computes I, Q and t from the real inputs and explains every step', () => {
  /* the initial state is the book's own application (p91): 60 C in 30 s */
  const start = createCalculatorState('I');
  assert.deepEqual(start.inputs.map((input) => input.field), ['Q', 't']);
  const first = calculatorReport(start);
  assert.equal(first.status, 'ok');
  assert.equal(first.result, 2);
  assert.equal(first.resultUnit, 'A');
  assert.deepEqual(first.steps.map((step) => step.label), ['العلاقة', 'التعويض', 'الناتج']);
  assert.match(first.steps[0].tex, /I=\\dfrac\{Q\}\{t\}/);

  /* target Q: 2 A for 3 minutes = 360 C, with the minute conversion shown */
  let state = setCalculatorUnit(setCalculatorUnit(setCalculatorInput(setCalculatorInput(createCalculatorState('Q'), 'I', '2'), 't', '3'), 'I', 'A'), 't', 'min');
  let report = calculatorReport(state);
  assert.equal(report.status, 'ok');
  near(report.result, 360);
  assert.equal(report.resultUnit, 'C');
  assert.deepEqual(report.steps.map((step) => step.label), ['الصورة المكافئة للعلاقة', 'تحويل الزمن إلى الثواني', 'التعويض', 'الناتج']);
  assert.match(report.steps[1].tex, /180\\,\\mathrm\{s\}/);
  assert.deepEqual(report.si, { charge: null, current: 2, time: 180 });

  /* target Q with milliamperes: 200 mA for 30 s = 6 C */
  state = setCalculatorUnit(setCalculatorInput(setCalculatorInput(createCalculatorState('Q'), 'I', '200'), 't', '30'), 'I', 'mA');
  report = calculatorReport(state);
  assert.equal(report.status, 'ok');
  near(report.result, 6);
  assert.deepEqual(report.steps.map((step) => step.label), ['الصورة المكافئة للعلاقة', 'تحويل شِدّة التيار إلى الأمبير', 'التعويض', 'الناتج']);
  assert.match(report.steps[1].tex, /0\.2\\,\\mathrm\{A\}/);

  /* target t: 45 C at 3 A = 15 s, and a long one also reads in minutes */
  state = setCalculatorInput(setCalculatorInput(createCalculatorState('t'), 'Q', '45'), 'I', '3');
  report = calculatorReport(state);
  assert.equal(report.status, 'ok');
  near(report.result, 15);
  assert.equal(report.alternate, null);
  state = setCalculatorInput(setCalculatorInput(createCalculatorState('t'), 'Q', '900'), 'I', '3');
  report = calculatorReport(state);
  near(report.result, 300);
  assert.deepEqual(report.alternate, { value: 5, unit: 'min' });

  /* a small current is also offered in milliamperes */
  state = setCalculatorInput(setCalculatorInput(createCalculatorState('I'), 'Q', '12'), 't', '120');
  report = calculatorReport(state);
  near(report.result, 0.1);
  assert.deepEqual(report.alternate, { value: 100, unit: 'mA' });

  /* a zero charge is a legal answer, not an error */
  state = setCalculatorInput(setCalculatorInput(createCalculatorState('I'), 'Q', '0'), 't', '30');
  report = calculatorReport(state);
  assert.equal(report.status, 'ok');
  assert.equal(report.result, 0);
});

test('the calculator rejects bad input with a message and never throws', () => {
  const cases = [
    { target: 'I', field: 'Q', value: '', pattern: /أدخل قيمة/ },
    { target: 'I', field: 'Q', value: 'abc', pattern: /بالأرقام/ },
    { target: 'I', field: 'Q', value: '-5', pattern: /لا تكون سالبة/ },
    { target: 'I', field: 't', value: '0', pattern: /القسمة على زمن صفري غير معرّفة/ },
    { target: 'I', field: 't', value: '-3', pattern: /لا تكون سالبة/ },
    { target: 'I', field: 't', value: ' ', pattern: /أدخل قيمة/ },
    { target: 't', field: 'I', value: '0', pattern: /تيار صفرية غير معرّفة/ },
    { target: 't', field: 'I', value: '', pattern: /أدخل قيمة/ },
    { target: 'Q', field: 'I', value: 'NaN', pattern: /بالأرقام/ },
    { target: 'Q', field: 't', value: '0', pattern: /القسمة على زمن صفري غير معرّفة|أكبر من صفر/ },
  ];
  for (const item of cases) {
    const state = setCalculatorInput(createCalculatorState(item.target), item.field, item.value);
    const report = calculatorReport(state);
    assert.equal(report.status, 'invalid', `${item.target}/${item.field}=${item.value}`);
    assert.equal(report.steps.length, 0);
    assert.equal(report.result, null);
    assert.ok(report.issues.some((issue) => issue.field === item.field), `the message must name ${item.field}`);
    assert.ok(report.issues.some((issue) => item.pattern.test(issue.message)), `${item.value}: ${report.issues.map((issue) => issue.message).join(' | ')}`);
  }
  /* Arabic-Indic digits and a decimal comma are understood, not rejected */
  const arabic = setCalculatorInput(setCalculatorInput(createCalculatorState('I'), 'Q', '٤٥'), 't', '١٥');
  const arabicReport = calculatorReport(arabic);
  assert.equal(arabicReport.status, 'ok');
  near(arabicReport.result, 3);
  near(calculatorReport(setCalculatorInput(setCalculatorInput(createCalculatorState('t'), 'Q', '45'), 'I', '3,0')).result, 15);
});

test('the calculator state carries values across targets, changes units and resets', () => {
  let state = setCalculatorInput(setCalculatorInput(createCalculatorState('I'), 'Q', '120'), 't', '60');
  state = setCalculatorTarget(state, 'Q');
  assert.deepEqual(state.inputs.map((input) => input.field), ['I', 't']);
  assert.equal(state.inputs.find((input) => input.field === 't').raw, '60', 'the known time follows the new target');
  state = setCalculatorUnit(state, 't', 'min');
  assert.equal(state.inputs.find((input) => input.field === 't').unit, 'min');
  assert.throws(() => setCalculatorUnit(state, 't', 'A'), RangeError);
  assert.throws(() => setCalculatorUnit(state, 'X', 'A'), RangeError);
  state = setCalculatorTarget(state, 't');
  assert.deepEqual(state.inputs.map((input) => input.field), ['Q', 'I']);
  const reset = resetCalculatorState(state);
  assert.equal(reset.target, 't');
  assert.deepEqual(reset.inputs.map((input) => input.raw), [CALCULATOR_START.Q, ''], 'only the printed starting values are pre-filled');
  assert.throws(() => createCalculatorState('X'), RangeError);
  assert.throws(() => setCalculatorTarget(state, 'X'), RangeError);
  assert.equal(CALCULATOR_TARGETS.length, 3);
  assert.deepEqual(CALCULATOR_TARGETS.map((target) => target.required), [['Q', 't'], ['I', 't'], ['Q', 'I']]);
});

test('the ammeter lab reads I = Q/t on a dial and clamps its controls', () => {
  const start = ammeterReading(LAB_RANGE.charge.start, LAB_RANGE.time.start);
  near(start.current, 2);
  near(start.charge, 60);
  near(start.time, 30);
  near(start.milli, 2000);
  assert.equal(start.predominantUnit, 'A');
  assert.equal(start.predominantValue, 2);

  /* the printed 200 mA of p92 is reachable on the slider grid */
  const book = ammeterReading(20, 100);
  near(book.current, AMMETER_BOOK_VALUE.current);
  near(book.milli, 200);
  assert.equal(book.predominantUnit, 'mA');
  assert.equal(book.predominantValue, 200);
  assert.ok(book.needle.fraction > 0 && book.needle.fraction < 0.03, 'the needle sits at the very start of the dial');

  /* the needle mapping is bounded and monotone */
  assert.deepEqual({ ...needleAngle(0) }, { angle: AMMETER.startAngle, fraction: 0 });
  assert.deepEqual({ ...needleAngle(AMMETER.maxA) }, { angle: AMMETER.startAngle + AMMETER.sweep, fraction: 1 });
  assert.equal(needleAngle(AMMETER.maxA * 4).fraction, 1, 'above the range the needle stops at the end');
  assert.equal(needleAngle(AMMETER.maxA / 2).angle, AMMETER.startAngle + AMMETER.sweep / 2);

  /* doubling the charge doubles the reading; doubling the time halves it */
  near(ammeterReading(scaleLabInput(60, LAB_RANGE.charge, 2), 30).current, 4);
  near(ammeterReading(60, scaleLabInput(30, LAB_RANGE.time, 2)).current, 1);
  assert.equal(scaleLabInput(120, LAB_RANGE.charge, 2), LAB_RANGE.charge.max, 'the control clamps at its end');
  assert.equal(scaleLabInput(10, LAB_RANGE.charge, 0.5), LAB_RANGE.charge.min);
  assert.equal(LAB_RANGE.charge.step, LAB_RANGE.time.step, 'both sliders keep the same educational step');
  assert.equal(LAB_RANGE.charge.start / LAB_RANGE.time.start, 2, 'the lab opens on the printed 2 A value');
});

/*
 * Ink metrics of every string the shared scene paints, measured with HarfBuzz on
 * the subsets this page ships (see §5.4 of
 * docs/unit-2-lesson-2-appendix-audit.md). `[size, width, inkTop, inkBottom]`
 * are pixels relative to the baseline; the strings are looked up in the modules
 * below, so re-writing a label fails the lookup instead of silently invalidating
 * the geometry.
 */
const MEASURED_INK = new Map([
  [ARROW_CAPTION_COPY.current, [13.5, 23.97, -9.99, 3.24]],
  [ARROW_CAPTION_COPY.electron, [13.5, 56.22, -10.15, 3.59]],
  [SCENE_COPY.generatorInteriorCaption, [13.5, 193.09, -9.99, 3.59]],
  [SCENE_COPY.generatorTitle, [18, 217.98, -14.80, 4.86]],
  [SCENE_COPY.terminalPositive, [13.5, 78.30, -9.99, 3.24]],
  [SCENE_COPY.terminalNegative, [13.5, 75.02, -9.99, 2.70]],
  [SCENE_COPY.lampTitle, [16.5, 54.69, -12.21, 5.02]],
  [SCENE_COPY.lampSubtitle, [13.5, 128.23, -10.91, 5.94]],
  [SCENE_COPY.lampTwoTitle, [13.5, 68.66, -9.99, 5.94]],
  [SCENE_COPY.switchTitle, [16.5, 47.39, -12.36, 5.02]],
  [SCENE_COPY.switchSubtitle, [13.5, 91.42, -9.99, 4.10]],
  [SCENE_COPY.wireLabel, [16.5, 98.73, -15.41, 3.96]],
  [SCENE_COPY.energyLabel, [14.5, 141.48, -11.92, 4.41]],
]);

const measuredBox = (x, y, text, anchor = 'middle') => {
  const [size, width, top, bottom] = MEASURED_INK.get(text) ?? [];
  assert.ok(width !== undefined, `no measurement for ${text}: re-measure the ink before trusting the layout`);
  const x1 = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  return { x1, x2: x1 + width, y1: y + top, y2: y + bottom };
};

/** The shaft and the head of one arrow as the two rectangles it really is. */
const arrowParts = (arrow) => {
  const half = 20;
  const shaft = 6;
  const head = 13;
  const headLength = 16;
  const forward = arrow.direction === 'right' || arrow.direction === 'down';
  const sign = forward ? 1 : -1;
  if (arrow.direction === 'left' || arrow.direction === 'right') {
    const back = arrow.x - sign * half;
    const mid = arrow.x + sign * (half - headLength);
    const tip = arrow.x + sign * half;
    return [
      { x1: Math.min(back, mid), x2: Math.max(back, mid), y1: arrow.y - shaft, y2: arrow.y + shaft },
      { x1: Math.min(mid, tip), x2: Math.max(mid, tip), y1: arrow.y - head, y2: arrow.y + head },
    ];
  }
  const back = arrow.y - sign * half;
  const mid = arrow.y + sign * (half - headLength);
  const tip = arrow.y + sign * half;
  return [
    { x1: arrow.x - shaft, x2: arrow.x + shaft, y1: Math.min(back, mid), y2: Math.max(back, mid) },
    { x1: arrow.x - head, x2: arrow.x + head, y1: Math.min(mid, tip), y2: Math.max(mid, tip) },
  ];
};

test('every drawn arrow carries one visible caption, and the measured layout stays clear', () => {
  const arrows = drawnArrows();
  const wordOf = (arrow) => (arrow.insideGenerator ? SCENE_COPY.generatorInteriorCaption : ARROW_CAPTION_COPY[arrow.kind]);
  const captions = arrows.map((arrow) => ({ arrow, word: wordOf(arrow), box: measuredBox(arrow.caption.x, arrow.caption.y, wordOf(arrow)) }));

  /* one caption per arrow, each of them one of the audited words */
  assert.equal(captions.length, arrows.length);
  for (const caption of captions) {
    assert.ok(caption.word && caption.word.length > 0, `${caption.arrow.segment} needs a caption`);
  }
  assert.equal(new Set(captions.map((caption) => `${caption.arrow.segment}/${caption.arrow.kind}`)).size, arrows.length);

  /* the caption sits beside its own arrow: close enough to name it, far enough not to touch it */
  for (const caption of captions) {
    const distance = Math.hypot(caption.arrow.caption.x - caption.arrow.x, caption.arrow.caption.y - caption.arrow.y);
    assert.ok(distance >= 12, `${caption.arrow.segment}/${caption.arrow.kind}: the caption must not sit on its arrow (${distance.toFixed(1)}px)`);
    assert.ok(distance <= 80, `${caption.arrow.segment}/${caption.arrow.kind}: the caption must stay beside its arrow (${distance.toFixed(1)}px)`);
  }

  /* nothing is crowded: captions, labels, the drawn arrows, the parts and the wires */
  const labelBoxes = Object.entries(SCENE_LABEL_ANCHORS).map(([id, anchor]) => ({ id, box: measuredBox(anchor.x, anchor.y, SCENE_COPY[id]) }));
  const captionPairs = [];
  for (let i = 0; i < captions.length; i += 1) {
    for (let j = i + 1; j < captions.length; j += 1) captionPairs.push([captions[i].box, captions[j].box]);
  }
  for (const [a, b] of captionPairs) {
    assert.ok(boxGap(a, b) >= 4, `two captions are crowded (${boxGap(a, b).toFixed(1)}px)`);
  }
  for (const caption of captions) {
    for (const arrow of arrows) {
      for (const part of arrowParts(arrow)) {
        assert.ok(boxGap(caption.box, part) >= 4, `${caption.arrow.segment}/${caption.arrow.kind} crowds arrow ${arrow.segment}/${arrow.kind} (${boxGap(caption.box, part).toFixed(1)}px)`);
      }
    }
    for (const label of labelBoxes) {
      assert.ok(boxGap(caption.box, label.box) >= 4, `${caption.arrow.segment}/${caption.arrow.kind} crowds ${label.id} (${boxGap(caption.box, label.box).toFixed(1)}px)`);
    }
    /* the second lamp is drawn in the origin scene only, where no arrow is drawn */
    for (const [id, box] of Object.entries(SCENE_SOLID_BOXES)) {
      if (id === 'lampTwo') continue;
      assert.ok(boxGap(caption.box, box) >= 4, `${caption.arrow.segment}/${caption.arrow.kind} crowds the ${id} (${boxGap(caption.box, box).toFixed(1)}px)`);
    }
    for (const [id, box] of Object.entries(SCENE_WIRE_BOXES)) {
      assert.ok(boxGap(caption.box, box) >= 2, `${caption.arrow.segment}/${caption.arrow.kind} sits on the ${id} wire (${boxGap(caption.box, box).toFixed(1)}px)`);
    }
    assert.ok(caption.box.x1 > 8 && caption.box.y1 > 6 && caption.box.x2 < 712 && caption.box.y2 < 414, `${caption.arrow.segment}/${caption.arrow.kind}: the caption leaves the viewBox`);
  }

  /* the labels of the scene hold the same guarantees among themselves */
  for (let i = 0; i < labelBoxes.length; i += 1) {
    for (let j = i + 1; j < labelBoxes.length; j += 1) {
      const gap = boxGap(labelBoxes[i].box, labelBoxes[j].box);
      assert.ok(gap >= 4 || boxesOverlap(labelBoxes[i].box, labelBoxes[j].box) === false, `${labelBoxes[i].id} and ${labelBoxes[j].id} overlap (${gap.toFixed(1)}px)`);
      assert.ok(gap > 0, `${labelBoxes[i].id} and ${labelBoxes[j].id} touch (${gap.toFixed(1)}px)`);
    }
    for (const [id, box] of Object.entries(SCENE_WIRE_BOXES)) {
      assert.ok(boxGap(labelBoxes[i].box, box) >= 2, `${labelBoxes[i].id} sits on the ${id} wire`);
    }
    for (const [id, box] of Object.entries(SCENE_SOLID_BOXES)) {
      if (['lampTwo', 'positiveSign', 'negativeSign'].includes(id)) continue; // by design: parts sit on the wires, the signs inside the generator
      assert.ok(boxesOverlap(labelBoxes[i].box, box) === false, `${labelBoxes[i].id} overlaps the ${id}`);
    }
    assert.ok(labelBoxes[i].box.x1 > 8 && labelBoxes[i].box.y1 > 6 && labelBoxes[i].box.x2 < 712 && labelBoxes[i].box.y2 < 414, `${labelBoxes[i].id} leaves the viewBox`);
  }
});

test('the scene words, the anchors and the captions come from one place', async () => {
  /* the words the SVG paints are authored copy, not view literals */
  const view = await read('../src/unit2-lesson2-appendix.js');
  assert.match(view, /SCENE_LABEL_ANCHORS/);
  assert.match(view, /ARROW_CAPTIONS/);
  assert.match(view, /ARROW_CAPTION_COPY/);
  assert.match(view, /SCENE_COPY/);
  for (const literal of [SCENE_COPY.generatorTitle, SCENE_COPY.wireLabel, SCENE_COPY.energyLabel, SCENE_COPY.lampSubtitle]) {
    assert.equal(view.includes(literal), false, `the view must not hard-code ${literal}`);
  }
  assert.equal(Object.keys(SCENE_COPY.segments).length, 6, 'every drawn segment has a readable name');
  /* each scene draws exactly the labels its set names, and nothing else */
  assert.deepEqual(Object.keys(SCENE_LABEL_SETS), ['origin-scene', 'electrons-scene', 'direction-scene']);
  for (const [scene, ids] of Object.entries(SCENE_LABEL_SETS)) {
    assert.ok(ids.length >= 5, `${scene} must name its parts`);
    for (const id of ids) {
      assert.ok(SCENE_COPY[id], `${scene} asks for the label ${id} and the copy module must own it`);
      assert.ok(SCENE_LABEL_ANCHORS[id], `${scene} asks for the label ${id} and the model must place it`);
    }
    assert.equal(new Set(ids).size, ids.length, `${scene} must not repeat a label`);
  }
  assert.equal(SCENE_LABEL_SETS['origin-scene'].includes('terminalPositive'), true, 'the parts scene names the terminals');
  assert.equal(SCENE_LABEL_SETS['electrons-scene'].includes('terminalPositive'), false, 'the drift scene does not need the terminals');
  assert.equal(SCENE_LABEL_SETS['direction-scene'].includes('wireLabel'), false, 'the arrow scene leaves the room to the arrow captions');
  const view2 = await read('../src/unit2-lesson2-appendix.js');
  assert.match(view2, /SCENE_LABEL_SETS\[id\]/);

  /* the two words of the two arrow layers, and the one sentence inside the source */
  assert.equal(ARROW_CAPTION_COPY.current, 'التيّار');
  assert.equal(ARROW_CAPTION_COPY.electron, 'الإلكترونات');
  assert.notEqual(ARROW_CAPTION_COPY.current, ARROW_CAPTION_COPY.electron);
  assert.match(SCENE_COPY.generatorInteriorCaption, /داخل المولّد/);
  assert.match(SCENE_COPY.generatorInteriorCaption, /السالب/);
  assert.match(SCENE_COPY.generatorInteriorCaption, /الموجب/);
  assert.equal(SCENE_COPY.generatorInteriorCaption.includes('+'), false, 'the caption is spelled in words, not signs');
  assert.equal(SCENE_COPY.generatorInteriorCaption.includes('−'), false);
  assert.match(SCENE_COPY.generatorInteriorTitle, /داخل المولّد/);
  assert.match(SCENE_COPY.generatorInteriorTitle, /القطب السالب/);

  /* the legend binds each word to its own arrow, and the legend note says it outright */
  assert.match(DIRECTION_LEGEND.find((row) => row.id === 'current').bodyHtml, new RegExp(ARROW_CAPTION_COPY.current));
  assert.match(DIRECTION_LEGEND.find((row) => row.id === 'electrons').bodyHtml, new RegExp(ARROW_CAPTION_COPY.electron));
  assert.match(DIRECTION_LEGEND_NOTE, new RegExp(ARROW_CAPTION_COPY.current));
  assert.match(DIRECTION_LEGEND_NOTE, new RegExp(ARROW_CAPTION_COPY.electron));
  assert.match(DIRECTION_LEGEND_NOTE, /الطاقة/, 'the note keeps the third idea separate');
  assert.match(DIRECTION_LEGEND_NOTE, /متعاكسان/, 'the note states that the two arrows on one wire oppose');

  /* the electrons station says where the points stop, and its limits list agrees */
  assert.match(ELECTRONS_GENERATOR_NOTE, /داخل المولّد/);
  assert.match(ELECTRONS_GENERATOR_NOTE, /الأسلاك/);
  assert.equal(ELECTRONS_MODEL_LIMITS.length, 4);
  assert.ok(ELECTRONS_MODEL_LIMITS.some((item) => /داخل المولّد/.test(item)), 'the limits list names the source explicitly');
});

test('the wire arrows stay opposite everywhere, and the source interior stays neutral', () => {
  const report = oppositeFlowReport();
  assert.equal(report.length, 6, 'five outside wires plus the inside of the generator');
  const wires = report.filter((row) => row.segment !== 'generator');
  assert.equal(wires.length, 5, 'the five wire segments of the loop');
  assert.deepEqual(wires.map((row) => row.segment), ['top-left', 'left', 'bottom', 'right', 'top-right']);
  for (const row of wires) {
    assert.equal(row.opposite, true, `${row.segment} must show the two directions opposite`);
    assert.equal(row.angleBetween, 180, `${row.segment} is a straight reversal`);
    assert.equal(row.modelled, true, `${row.segment} is a metal wire, so both carriers are modelled`);
  }
  /* the source interior is deliberately neutral: the lesson states no carrier
     direction there, so the appendix claims none */
  const inside = report.find((row) => row.segment === 'generator');
  assert.equal(inside.modelled, false);
  assert.equal(inside.electron, null, 'no electron direction is asserted inside the source');
  assert.equal(inside.current, 'left', 'the conventional current still returns − → + inside the source');
  assert.equal(inside.opposite, null, 'with one arrow drawn there is nothing to be opposite to');
  assert.equal(inside.angleBetween, null);
  const directions = segmentDirections();
  /* outside the generator the current leaves + and returns to −, and the free
     electrons of the metal wire always drift the other way */
  const wire = (segment, current, electron) => assert.deepEqual(
    { ...directions[segment] },
    { segment, current, electron, kind: 'wire', modelled: true },
  );
  wire('top-left', 'left', 'right');
  wire('left', 'down', 'up');
  wire('bottom', 'right', 'left');
  wire('right', 'up', 'down');
  wire('top-right', 'left', 'right');
  /* inside the generator only the conventional current is stated at all */
  assert.deepEqual({ ...directions.generator }, { segment: 'generator', current: 'left', electron: null, kind: 'source-interior', modelled: false });
  for (const [segment, pair] of Object.entries(directions)) {
    if (segment === 'generator') continue;
    assert.equal(pair.kind, 'wire');
    assert.equal(pair.modelled, true);
  }
  assert.equal(CIRCUIT.generator.from < CIRCUIT.generator.to, true, '+ is the left end of the generator and − the right one');
  /* the current is one closed circulation: every outside arrow agrees with the next */
  assert.equal(directions['top-left'].current, 'left', 'leaves + leftwards');
  assert.equal(directions.left.current, 'down', 'then down the left branch');
  assert.equal(directions.bottom.current, 'right', 'then right along the bottom');
  assert.equal(directions.right.current, 'up', 'then up the right branch');
  assert.equal(directions['top-right'].current, 'left', 'then back into −');
  assert.equal(directions.generator.current, 'left', 'and closes − → + inside the source');
  /* the arrows are placed on the wires they explain, without overlapping */
  const spots = Object.entries(ARROW_SPOTS);
  assert.equal(spots.length, 5, 'one arrow pair per outside wire');
  for (const [segment, pair] of spots) {
    assert.ok(pair.current && pair.electron, `${segment} needs a spot per direction`);
    assert.notEqual(`${pair.current.x},${pair.current.y}`, `${pair.electron.x},${pair.electron.y}`);
    assert.ok(DIRECTION_ANGLE[directions[segment].current] !== undefined);
  }
  /* the interior arrow is the only arrow inside the source, and the model says
     out loud that no carrier is drawn there */
  assert.equal(GENERATOR_INTERIOR.electronsModelled, false);
  assert.equal(GENERATOR_INTERIOR.segment, 'generator');
  assert.equal(GENERATOR_INTERIOR.arrow.direction, 'left');
  assert.ok(GENERATOR_INTERIOR.arrow.x > GENERATOR_INTERIOR.inside.x1 && GENERATOR_INTERIOR.arrow.x < GENERATOR_INTERIOR.inside.x2);
  assert.ok(GENERATOR_INTERIOR.arrow.y > GENERATOR_INTERIOR.inside.y1 && GENERATOR_INTERIOR.arrow.y < GENERATOR_INTERIOR.inside.y2);
  const arrows = drawnArrows();
  assert.equal(arrows.length, 11, 'five pairs of wire arrows plus the single interior arrow');
  assert.equal(arrows.filter((arrow) => arrow.insideGenerator).length, 1);
  assert.equal(arrows.filter((arrow) => arrow.insideGenerator)[0].kind, 'current');
  assert.equal(arrows.filter((arrow) => arrow.insideGenerator)[0].segment, 'generator');
  assert.equal(arrows.filter((arrow) => arrow.kind === 'electron').length, 5, 'no electron arrow inside the source');
  assert.equal(insideGenerator({ segmentId: 'generator' }), true);
  assert.equal(insideGenerator({ segmentId: 'left' }), false);
});

test('the loop path is continuous, wraps cleanly and covers the whole circuit', () => {
  const total = loopLength();
  assert.ok(total > 1000, `loop length ${total}`);
  const start = pointOnLoop(0);
  const wrapped = pointOnLoop(total);
  near(start.x, wrapped.x, 1e-9);
  near(start.y, wrapped.y, 1e-9);
  assert.equal(pointOnLoop(-1).segmentId, pointOnLoop(total - 1).segmentId, 'negative arc lengths wrap backwards');
  /* walking the loop passes the four corners of the drawn rectangle */
  const corners = [
    { x: CIRCUIT.right, y: CIRCUIT.top },
    { x: CIRCUIT.right, y: CIRCUIT.bottom },
    { x: CIRCUIT.left, y: CIRCUIT.bottom },
    { x: CIRCUIT.left, y: CIRCUIT.top },
  ];
  for (const corner of corners) {
    const hit = [...Array(4000).keys()].some((step) => {
      const point = pointOnLoop((step * total) / 4000);
      return Math.abs(point.x - corner.x) < 3 && Math.abs(point.y - corner.y) < 3;
    });
    assert.equal(hit, true, `the loop reaches (${corner.x}, ${corner.y})`);
  }
  /* the loop is walked in the direction the electrons move */
  assert.equal(pointOnLoop(0).segmentId, 'top-right', 'it starts at the − terminal');
  for (const point of [...Array(200).keys()].map((step) => pointOnLoop((step * total) / 200))) {
    assert.ok(['top-left', 'top-right', 'left', 'right', 'bottom', 'generator'].includes(point.segmentId));
    assert.ok(Object.values(DIRECTION_ANGLE).includes(point.angle));
  }
  assert.deepEqual([...new Set([...Array(400).keys()].map((step) => pointOnLoop((step * total) / 400).segmentId))].sort(), ['bottom', 'generator', 'left', 'right', 'top-left', 'top-right']);
  for (const direction of ['left', 'right', 'up', 'down']) assert.ok(Object.prototype.hasOwnProperty.call(DIRECTION_ANGLE, direction));
});

test('the electron model drifts when the circuit is closed and only wanders when it is open', () => {
  const steps = 120;
  const dt = 1 / 60;
  let closedState = setDriftClosed(createDriftState(), true);
  let openState = createDriftState();
  for (let step = 0; step < steps; step += 1) {
    closedState = advanceDrift(closedState, dt);
    openState = advanceDrift(openState, dt);
  }
  const closed = driftSummary(closedState);
  const open = driftSummary(openState);
  assert.equal(closed.closed, true);
  assert.equal(open.closed, false);
  near(closedState.elapsed, steps * dt, 1e-9, 'elapsed time');
  /* two seconds of drift must clearly separate the two cases */
  assert.ok(closed.meanNetDisplacement > 60, `closed drift ${closed.meanNetDisplacement} must move the cloud`);
  assert.ok(Math.abs(open.meanNetDisplacement) < 6, `open wander ${open.meanNetDisplacement} must stay near zero`);
  assert.ok(closed.meanDistance > 0);
  assert.equal(closed.ordered, true);
  assert.equal(open.ordered, false);

  /* the electron count never changes: nothing is consumed at the lamp */
  let lampState = setDriftClosed(createDriftState({ electronCount: 12 }), true);
  for (let step = 0; step < steps; step += 1) lampState = advanceDrift(lampState, dt);
  assert.equal(lampState.electrons.length, 12);
  const summary = driftSummary(lampState);
  assert.equal(summary.count, 12);
  assert.equal(summary.electronsConserved, 12, 'every electron that left the generator returns to it');
  for (const point of lampState.electrons.map(electronPoint)) {
    assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
    assert.ok(['top-left', 'top-right', 'left', 'right', 'bottom', 'generator'].includes(point.segmentId));
  }
  /* nothing is consumed at the lamp: the same twelve electrons keep circulating,
     and the ones that happen to be on the lamp's branch are still counted */
  const nearLamp = lampState.electrons.filter((electron) => electronPoint(electron).segmentId === 'left');
  assert.equal(lampState.electrons.length, 12);
  assert.ok(lampState.electrons.every((electron, index) => electron.id === createDriftState({ electronCount: 12 }).electrons[index].id), 'the identities never change');
  assert.equal(driftSummary(lampState).count - nearLamp.length + nearLamp.length, 12);

  /* the pseudo-random sequence is carried in the state, so a seeded run repeats */
  let a = createDriftState();
  let b = createDriftState();
  for (let step = 0; step < 30; step += 1) { a = advanceDrift(a, dt); b = advanceDrift(b, dt); }
  assert.deepEqual(a.electrons.map((electron) => electron.s), b.electrons.map((electron) => electron.s));
  assert.equal(DRIFT_DEFAULTS.electronCount, 16);
  assert.equal(DRIFT_DEFAULTS.seed, 20261016);

  /* the switch is remembered by the model and a reset starts the cloud from rest */
  const off = setDriftClosed(a, false);
  assert.equal(off.closed, false);
  const afterReset = resetDriftState(off);
  assert.equal(afterReset.electrons.length, a.electrons.length);
  assert.equal(afterReset.elapsed, 0);
  assert.equal(driftSummary(afterReset).meanNetDisplacement, 0);
  assert.equal(afterReset.closed, false, 'a reset keeps the switch as the student left it');
});

/* ============================================================= interaction */

test('station flow opens, steps, clamps and routes by hash', () => {
  const flow = createStationFlow();
  assert.equal(flow.activeId, 'origin');
  assert.equal(flow.total, 7);
  assert.equal(flow.visitedCount, 1);
  assert.equal(flow.canGoBack, false);
  assert.equal(flow.discoveryPercent, 14);
  assert.equal(stepStation(flow, -1).activeId, 'origin', 'stepping back at the first station stays');
  const second = stepStation(flow, 1);
  assert.equal(second.activeId, 'electrons');
  assert.equal(second.visitedCount, 2);
  assert.equal(second.discoveryPercent, 29);
  const last = goToStation(flow, 'map');
  assert.equal(last.activeIndex, 6);
  assert.equal(last.progressPercent, 100);
  assert.equal(last.canGoForward, false);
  assert.equal(last.discoveryPercent, 29, 'jumping forward does not count the stations in between');
  assert.equal(goToStation(flow, 'origin').activeId, 'origin');
  assert.throws(() => goToStation(flow, 'nowhere'), RangeError);
  assert.throws(() => stepStation(flow, 0), RangeError);
  assert.throws(() => stepStation(flow, 1.5), RangeError);
  assert.equal(stationIdFromHash('#station-relation'), 'relation');
  assert.equal(stationIdFromHash('#station-nope'), null);
  assert.equal(stationIdFromHash('#hero'), null);
  assert.equal(stationHash('map'), '#station-map');
  assert.equal(createStationFlow('detective').activeId, 'detective');
  assert.throws(() => createStationFlow('nope'), RangeError);
  assert.throws(() => findStation('nope'), RangeError);
});

test('a choice answer is evaluated only on submit and explains every path', () => {
  let state = createAnswerState('origin-1');
  assert.equal(state.choiceId, null);
  assert.equal(state.submitted, false);
  assert.equal(answerIsReady(state), false);
  const empty = submitAnswer(state);
  assert.equal(empty.needsInput, true);
  assert.equal(empty.submitted, false);
  assert.equal(empty.feedbackHtml, '');
  assert.equal(empty.attempts, 0);

  state = selectAnswer(state, 'lamp');
  assert.equal(state.submitted, false, 'selecting alone never reveals anything');
  assert.equal(answerIsReady(state), true);
  const wrong = submitAnswer(state);
  assert.equal(wrong.status, 'incorrect');
  assert.equal(wrong.submitted, true);
  assert.match(wrong.feedbackHtml, /مستهلك/);
  assert.match(wrong.feedbackHtml, /التفسير العلمي/);
  assert.equal(wrong.attempts, 1);

  const retried = retryAnswer(wrong);
  assert.equal(retried.choiceId, null);
  assert.equal(retried.status, null);
  assert.equal(retried.feedbackHtml, '');
  assert.equal(retried.attempts, 1, 'the attempt counter is information for the student only');

  const right = submitAnswer(selectAnswer(retried, 'generator'));
  assert.equal(right.status, 'correct');
  assert.match(right.feedbackHtml, /أحسنت/);
  assert.throws(() => selectAnswer(right, 'nope'), RangeError);
  assert.throws(() => createAnswerState('nope'), RangeError);
  assert.throws(() => questionsOfStation('nope'), RangeError);
});

test('an ordering answer is checked position by position and never starts solved', () => {
  const question = findQuestion('origin-2');
  const order = initialOrder(question);
  const solution = [...question.items].sort((a, b) => a.position - b.position).map((item) => item.id);
  assert.notDeepEqual(order, solution, 'the task must not start solved');
  assert.deepEqual([...order].sort(), [...solution].sort(), 'the same statements, only reordered');

  let state = createAnswerState('origin-2');
  assert.deepEqual(state.order, order);
  const before = submitAnswer(state);
  assert.equal(before.status, 'incorrect');
  assert.match(before.feedbackHtml, /موضعه الصحيح/);
  assert.equal(before.attempts, 1);

  /* the statement that already exists in the conductor belongs at the top */
  state = moveOrderItem(moveOrderItem(state, 'exists', -1), 'exists', -1);
  assert.deepEqual(state.order, solution);
  const after = submitAnswer(state);
  assert.equal(after.status, 'correct');
  assert.match(after.feedbackHtml, /أحسنت/);
  assert.equal(moveOrderItem(after, solution[0], -1).order[0], solution[0], 'the first statement cannot move up');
  assert.equal(moveOrderItem(after, solution[solution.length - 1], 1).order.at(-1), solution.at(-1), 'the last cannot move down');
  assert.throws(() => moveOrderItem(after, 'nope', 1), RangeError);
  assert.throws(() => moveOrderItem(after, solution[0], 0), RangeError);
  assert.throws(() => selectAnswer(after, 'x'), RangeError);
  assert.equal(retryAnswer(after).order.join(), order.join(), 'a retry restores the starting scramble');

  /* the final challenge orders the same way, in four steps */
  const detective = findQuestion('detective-4');
  const detectiveOrder = initialOrder(detective);
  assert.equal(detectiveOrder.length, 4);
  assert.notDeepEqual(detectiveOrder, [...detective.items].sort((a, b) => a.position - b.position).map((item) => item.id));
});

test('a numeric answer separates "invalid" from "wrong" and stops at the exact value', () => {
  let state = createAnswerState('relation-number');
  assert.equal(state.numberRaw, '');
  const empty = submitAnswer(state);
  assert.equal(empty.status, 'invalid');
  assert.equal(empty.submitted, false);
  assert.match(empty.feedbackHtml, /أكمل إجابتك/);
  assert.match(empty.feedbackHtml, /تلميح|hint/i);

  const unreadable = submitAnswer(setNumberAnswer(state, 'three'));
  assert.equal(unreadable.status, 'invalid');
  assert.equal(unreadable.attempts, 0, 'an unreadable answer is not counted as an attempt');
  assert.equal(submitAnswer(setNumberAnswer(state, '-3')).status, 'invalid');

  const wrong = submitAnswer(setNumberAnswer(state, '5'));
  assert.equal(wrong.status, 'incorrect');
  assert.equal(wrong.attempts, 1);
  assert.match(wrong.feedbackHtml, /الحلّ الصحيح خطوة بخطوة/);
  assert.match(wrong.feedbackHtml, /45/);

  const right = submitAnswer(setNumberAnswer(wrong, '3'));
  assert.equal(right.status, 'correct');
  near(findQuestion('relation-number').expected, 3);
  assert.equal(retryAnswer(right).numberRaw, '');
  assert.equal(submitAnswer(setNumberAnswer(state, '٣')).status, 'correct', 'Arabic-Indic digits are accepted');
  assert.throws(() => setNumberAnswer(createAnswerState('origin-1'), '1'), RangeError);

  /* the final challenge's answer is the converted one, not the printed minutes */
  const detective = findQuestion('detective-7');
  assert.equal(detective.expected, 0.5);
  assert.match(detective.prompt, /3 min/);
  assert.equal(submitAnswer(setNumberAnswer(createAnswerState('detective-7'), '30')).status, 'incorrect');
  assert.equal(submitAnswer(setNumberAnswer(createAnswerState('detective-7'), '0.5')).status, 'correct');
});

test('progress and the self-check list report without grading', () => {
  const states = {};
  for (const question of ALL_QUESTIONS) states[question.id] = createAnswerState(question.id);
  let progress = answerProgress(states);
  assert.equal(progress.total, ALL_QUESTIONS.length);
  assert.equal(progress.solved, 0);
  assert.equal(progress.percent, 0);
  assert.equal(progress.remaining, ALL_QUESTIONS.length);

  states['origin-1'] = submitAnswer(selectAnswer(states['origin-1'], 'generator'));
  states['origin-3'] = submitAnswer(selectAnswer(states['origin-3'], 'electron-travel'));
  progress = answerProgress(states);
  assert.equal(progress.attempted, 2);
  assert.equal(progress.solved, 1, 'only a correct answer counts as solved');
  assert.equal(progress.remaining, ALL_QUESTIONS.length - 1);
  assert.equal(progress.percent, Math.round((1 / ALL_QUESTIONS.length) * 100));

  assert.equal(stationAnswerProgress('detective', states).solved, 0);
  const oneSolved = stationAnswerProgress('detective', { 'detective-1': submitAnswer(selectAnswer(createAnswerState('detective-1'), 'generator')) });
  assert.equal(oneSolved.total, 7);
  assert.equal(oneSolved.solved, 1);
  assert.equal(oneSolved.percent, 14);
  assert.throws(() => stationAnswerProgress('nope', states), RangeError);

  let checklist = createChecklistState();
  assert.equal(checklistProgress(checklist).done, 0);
  assert.equal(checklistProgress(checklist).complete, false);
  checklist = toggleChecklistItem(checklist, CHECKLIST_ITEMS[0].id);
  assert.equal(checklistProgress(checklist).done, 1);
  assert.deepEqual(checklistProgress(checklist).doneObjectiveIds, [CHECKLIST_ITEMS[0].objectiveId]);
  checklist = toggleChecklistItem(checklist, CHECKLIST_ITEMS[1].id);
  assert.equal(checklistProgress(checklist).percent, 67);
  assert.equal(checklistProgress(checklist).complete, false);
  checklist = toggleChecklistItem(checklist, CHECKLIST_ITEMS[2].id);
  assert.equal(checklistProgress(checklist).complete, true);
  assert.equal(checklistProgress(checklist).percent, 100);
  const unchecked = toggleChecklistItem(checklist, CHECKLIST_ITEMS[2].id);
  assert.equal(unchecked[CHECKLIST_ITEMS[2].id], false, 'a second click unchecks');
  assert.equal(checklistProgress(unchecked).done, 2);
  assert.throws(() => toggleChecklistItem(checklist, 'nope'), RangeError);

  /* one self-check item per lesson objective, each pointing at the station that teaches it */
  assert.deepEqual(CHECKLIST_ITEMS.map((item) => item.objectiveId), ['o1', 'o2', 'o3']);
  assert.deepEqual(CHECKLIST_ITEMS.map((item) => item.stationId), ['electrons', 'direction', 'relation']);
  for (const item of CHECKLIST_ITEMS) assert.equal(typeof findStation(item.stationId).title, 'string');
});

/* ================================================================== design */

test('the stylesheet keeps the daylight identity, the RTL rules and every interaction state', async () => {
  const css = await read('../src/unit2-lesson2-appendix.css');
  assert.match(css, /\.u2l2a-page \{/);
  /* the identity is deliberately not the static-electricity appendix's one */
  assert.match(css, /--paper: #f4efe4/);
  assert.match(css, /--copper: #9c4a16/);
  assert.match(css, /--flux: #0f5c67/);
  assert.doesNotMatch(css, /--spark|#58cdf2|#0a1120/);
  assert.doesNotMatch(css, /\.u2l1a-|\.u2l2a-\.\./);

  /* RTL prose with LTR-isolated mathematics */
  assert.match(css, /\.u2l2a-page \.math \{ direction: ltr; unicode-bidi: isolate; \}/);
  assert.match(css, /\.u2l2a-page \.equation/);
  assert.match(css, /\.u2l2a-extension-label bdi \{ font-family: var\(--font-latin\); \}/);

  /* every state carries a sign, not colour alone */
  assert.match(css, /\.u2l2a-page :focus-visible/);
  assert.match(css, /\.u2l2a-choice input:checked/);
  assert.match(css, /\.u2l2a-toggle\[aria-pressed='true'\]::before/);
  assert.match(css, /\.u2l2a-toggle\[aria-pressed='false'\]::before/);
  assert.match(css, /\.u2l2a-feedback\.is-correct/);
  assert.match(css, /\.u2l2a-feedback\.is-incorrect/);
  assert.match(css, /\.u2l2a-feedback\.is-invalid/);
  assert.match(css, /\.u2l2a-feedback\.is-correct \.u2l2a-feedback-headline::before \{ content: '✓ /);
  assert.match(css, /\.u2l2a-feedback\.is-incorrect \.u2l2a-feedback-headline::before \{ content: '✗ /);
  assert.match(css, /\.u2l2a-feedback\.is-invalid \.u2l2a-feedback-headline::before \{ content: '! /);
  assert.match(css, /\.u2l2a-order-button:disabled/);

  /* contrast tiers: every text colour is AA on both surfaces, the control
     boundaries keep their non-text contrast, and the focus ring is loud */
  assert.match(css, /--faint: #636d82/);
  assert.match(css, /--control-line: #8c8271/);
  assert.match(css, /\.u2l2a-calc-input,\n\.u2l2a-calc-unit,[\s\S]*?border-color: var\(--control-line\)/);

  /* 44 px touch targets, responsive breakpoints and reduced motion */
  assert.match(css, /--target: 44px/);
  const targetUses = (css.match(/min-block-size: var\(--target\)/g) ?? []).length;
  assert.ok(targetUses >= 15, `only ${targetUses} rules guarantee a 44px target`);
  assert.match(css, /\.u2l2a-order-button \{[^}]*inline-size: var\(--target\)/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /@media \(max-width: 1080px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.u2l2a-visually-hidden/);
  assert.match(css, /\.u2l2a-table-scroll \{ overflow-x: auto/);
  assert.match(css, /\.u2l2a-station-nav \{[^}]*overflow-x: auto/);
  assert.match(css, /\.u2l2a-scene-canvas svg/);
  assert.match(css, /\.u2l2a-page \[hidden\] \{ display: none !important; \}/);
  /* the only looping animation is the energy path, and reduced motion stops it */
  const animations = (css.match(/animation: u2l2a-\w+/g) ?? []).length;
  assert.equal(animations, 1, 'exactly one animated element in the whole appendix');
  assert.match(css, /@keyframes u2l2a-flow/);
  assert.match(css, /\.u2l2a-scene-svg\[data-closed='true'\] \.u2l2a-energy-path \{ opacity: 1; animation: u2l2a-flow/);
  assert.match(css, /animation-duration: 0\.001ms !important/);
});

test('the script is keyboard-operable, announceable and stoppable', async () => {
  const script = await read('../src/unit2-lesson2-appendix.js');
  for (const token of [
    'prefers-reduced-motion',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'aria-live',
    'role="status"',
    'aria-valuetext',
    'dataset.visited',
    "'PageDown'",
    "'PageUp'",
    "'Home'",
    "'End'",
    'hashchange',
    'dispose()',
    'tabindex="-1"',
  ]) {
    assert.ok(script.includes(token), `the script must implement ${token}`);
  }
  /* the animation loop is opt-in and always cancellable */
  assert.match(script, /let running = false;/);
  assert.match(script, /if \(!\s*running\) return;/);
  assert.match(script, /context\.cancelFrame\(frame\)/);
  /* an open switch is a real break: no electron is drawn inside the gap */
  assert.match(script, /const inGap = !state\.closed/);
  /* the two-direction scene starts with the current layer only */
  assert.match(script, /<g class="u2l2a-layer" data-layer="electrons" hidden>/);
  assert.match(script, /<g class="u2l2a-layer" data-layer="energy" hidden>/);
  /* every hook the interaction tests drive exists in the source */
  for (const hook of [
    'data-origin-switch',
    'data-origin-reset',
    'data-drift-play',
    'data-drift-step',
    'data-drift-circuit',
    'data-drift-reset',
    'data-direction-toggle',
    'data-lab-charge',
    'data-lab-time',
    'data-lab-book',
    'data-lab-reset',
    'data-calc-input',
    'data-calc-unit',
    'data-calc-target',
    'data-calc-reset',
    'data-question-submit',
    'data-question-retry',
    'data-question-feedback',
    'data-order-delta',
    'data-number-input',
    'data-concept-button',
    'data-map-node',
    'data-checklist-item',
    'data-checklist-open',
    'data-map-restart',
  ]) {
    assert.ok(script.includes(hook), `the script must render ${hook}`);
  }
  /* motion is announced, never implied: the play button keeps an aria-pressed state */
  assert.match(script, /playButton\.setAttribute\('aria-pressed'/);
  /* the reduced-motion branch offers single steps instead of a running animation */
  assert.match(script, /context\.reducedMotion \? 'خطوة واحدة/);
});

/* ================================================= registration and scope */

test('the appendix is registered in the library, the build and the README', async () => {
  const [library, libraryCss, build, readme] = await Promise.all([
    read('../appendices.html'),
    read('../src/appendices.css'),
    read('../scripts/build.mjs'),
    read('../README.md'),
  ]);
  assert.equal((library.match(/class="appendix-library-card"/g) ?? []).length, 4);
  assert.match(library, /id="unit2-lesson-two-appendix-title">رحلة الشحنات/);
  assert.match(library, /href="\.\/unit2-lesson-2-appendix\.html"/);
  assert.match(library, /<span dir="ltr">Unit 2 · Lesson 2<\/span>/);
  assert.match(library, /appendix-card-art-current/);
  assert.match(library, /حاسبة/);
  assert.match(library, /أربعة ملحقات تفاعلية/);
  /* the three published cards keep their own copy and links */
  for (const href of ['./lesson-1-appendix.html', './lesson-2-appendix.html', './unit2-lesson-1-appendix.html']) {
    assert.ok(library.includes(href), `the library must keep ${href}`);
  }
  assert.match(build, /resolve\(projectDirectory, 'unit2-lesson-2-appendix\.html'\)/);
  assert.match(readme, /unit2-lesson-2-appendix\.html/);
  assert.match(readme, /رحلة الشحنات/);
  /* the shared card stylesheet is extended, never replaced */
  assert.match(libraryCss, /\.appendix-card-art-current/);
  assert.match(libraryCss, /\.appendix-card-art-charges/);
  assert.match(libraryCss, /\.appendix-card-art-parallel/);
});

test('the lesson, its test, the teacher area and the static-electricity appendix stay untouched', async () => {
  const [lesson, lessonTest, teacher, staticAppendix, lessonContent, teacherAuth] = await Promise.all([
    read('../unit2-lesson-2.html'),
    read('../unit2-lesson-2-test.html'),
    read('../unit2-lesson-2-teacher.html'),
    read('../unit2-lesson-1-appendix.html'),
    read('../src/unit2-lesson2-content.js'),
    read('../src/teacher-auth.js'),
  ]);
  /* the published lesson keeps its own content and gains nothing from the appendix */
  assert.match(lesson, /unit2-lesson2-main\.js/);
  assert.match(lesson, /التيار الكهربائي المتواصل|التيّار الكهربائيّ المُتواصِل/);
  assert.doesNotMatch(lesson, /appendix|رحلة الشحنات/);
  assert.doesNotMatch(lessonTest, /appendix|رحلة الشحنات/);
  assert.doesNotMatch(teacher, /appendix|رحلة الشحنات/);
  /* the static-electricity appendix is a different product and is not touched */
  assert.match(staticAppendix, /مختبر الشحنات/);
  assert.doesNotMatch(staticAppendix, /رحلة الشحنات|unit2-lesson2-appendix/);
  /* the lesson's own content module keeps its scope: pages 87–96, no appendix copy */
  assert.doesNotMatch(lessonContent, /رحلة الشحنات|appendix/);
  /* the protected teacher gate still accepts only the required passphrase */
  assert.match(teacherAuth, /export async function verifyTeacherPassword/);
  const { verifyTeacherPassword } = await import('../src/teacher-auth.js');
  assert.equal(await verifyTeacherPassword('somer173'), true);
  assert.equal(await verifyTeacherPassword('Teacher-L1-55-62!'), false);
  /* and the appendix never imports a test, a solution or a teacher module */
  for (const file of ['unit2-lesson2-appendix.js', 'unit2-lesson2-appendix-content.js', 'unit2-lesson2-appendix-flow.js', 'unit2-lesson2-appendix-physics.js']) {
    const source = await read(`../src/${file}`);
    assert.doesNotMatch(source, /from '\.\/[^']*(test|solution|teacher|assessment|lesson2-main)[^']*'/, `${file} must not import a lesson test, a solution or a teacher module`);
    assert.doesNotMatch(source, /verifyTeacherPassword|loadSolutions|teacherAuth/, `${file} must not reach the teacher gate`);
  }
});

/* ==================================================== live interaction run */

test('the published page really works when it is mounted in a DOM', async (t) => {
  let JSDOM;
  try {
    ({ JSDOM } = await import('jsdom'));
  } catch {
    t.skip('jsdom is not installed here (developer-only package), so the DOM run is skipped rather than faked');
    return;
  }
  const html = await read('../unit2-lesson-2-appendix.html');
  const dom = new JSDOM(html, { url: 'https://example.test/unit2-lesson-2-appendix.html', pretendToBeVisual: true });
  const { window } = dom;
  const problems = [];
  window.addEventListener('error', (event) => problems.push(String(event.message)));
  const originalError = console.error;
  console.error = (...args) => problems.push(args.map(String).join(' '));
  try {
    const module = await import('../src/unit2-lesson2-appendix.js');
    const root = window.document.querySelector('[data-unit2-lesson2-appendix]');
    const app = module.mountJourneyAppendix(root);
    const $ = (selector) => root.querySelector(selector);
    const click = (element) => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const set = (element, value) => { element.value = value; element.dispatchEvent(new window.Event('input', { bubbles: true })); };
    const change = (element, value) => { element.value = value; element.dispatchEvent(new window.Event('change', { bubbles: true })); };

    /* --- the shell is built from the content module ----------------------- */
    assert.match($('#hero-description').innerHTML, /ملحق إثرائي مستقلّ/);
    assert.equal($('#objective-list').children.length, 3);
    assert.equal($('#keyword-row').children.length, 3);
    assert.equal($('#howto-steps').children.length, 4);
    assert.equal($('#station-nav').children.length, 7);
    assert.equal(root.querySelectorAll('[data-station]').length, 7);
    assert.equal(app.flow.activeId, 'origin');
    assert.match($('#hero-extension').innerHTML, /<bdi dir="ltr">Platform Extension<\/bdi>/);

    /* --- station 1: switch, parts, the three printed questions ------------ */
    click($('[data-origin-switch]'));
    assert.match($('[data-origin-state]').textContent, /مغلقة/);
    assert.equal($('[data-origin-lamps]').textContent, 'مضيئان');
    assert.equal($('[data-scene="origin-scene"]').dataset.closed, 'true');
    assert.equal($('[data-origin-energy-path]').classList.contains('is-flowing'), true);
    click($('[data-part-button="generator"]'));
    assert.equal($('[data-part-card="generator"]').hidden, false);
    assert.equal($('[data-part-button="generator"]').getAttribute('aria-pressed'), 'true');
    click($('[data-origin-reset]'));
    assert.match($('[data-origin-state]').textContent, /مفتوحة/);
    assert.equal($('[data-part-card="generator"]').hidden, true);

    const origin1 = root.querySelector('[data-question="origin-1"]');
    change(origin1.querySelector('input[value="lamp"]'), 'lamp');
    click(origin1.querySelector('[data-question-submit]'));
    assert.equal(origin1.dataset.status, 'incorrect');
    assert.match(origin1.querySelector('[data-question-feedback]').innerHTML, /التفسير العلمي/);
    assert.equal(origin1.querySelector('[data-question-feedback]').hidden, false);
    click(origin1.querySelector('[data-question-retry]'));
    assert.equal(origin1.dataset.status, 'idle');
    change(origin1.querySelector('input[value="generator"]'), 'generator');
    click(origin1.querySelector('[data-question-submit]'));
    assert.equal(origin1.dataset.status, 'correct');
    const origin2 = root.querySelector('[data-question="origin-2"]');
    const moveUp = origin2.querySelector('[data-order-item="exists"] [data-order-delta="-1"]');
    click(moveUp);
    click(moveUp);
    click(origin2.querySelector('[data-question-submit]'));
    assert.equal(origin2.dataset.status, 'correct');

    /* --- station 2: open/closed drift, play, stop, reset ------------------- */
    app.goToStation('electrons');
    click($('[data-drift-circuit]'));
    assert.match($('[data-drift-state]').textContent, /مغلقة/);
    click($('[data-drift-play]'));
    assert.match($('[data-drift-play]').textContent, /إيقاف/);
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    click($('[data-drift-play]'));
    assert.match($('[data-drift-count]').textContent, /16/);
    assert.ok(Number($('[data-drift-net]').textContent.trim()) > 1, 'the cloud really drifts while the circuit is closed');
    /* the carriers are drawn in the metal wire only: the source itself is skipped */
    const dotsInSource = [...$('[data-scene="electrons-scene"]').querySelectorAll('[data-electron]')]
      .filter((node) => node.dataset.segment === 'generator');
    assert.equal(dotsInSource.length === 0 || dotsInSource.every((node) => node.getAttribute('opacity') === '0'), true,
      'no carrier may be drawn inside the generator');
    assert.match($('[data-drift-count]').textContent, /16/, 'and the count is unchanged all the same');
    assert.match($('[data-station="electrons"] .u2l2a-inline-note').textContent, /داخل المولّد/);
    click($('[data-drift-reset]'));
    assert.equal($('[data-drift-net]').textContent.trim(), '0');
    assert.equal($('[data-drift-play]').getAttribute('aria-pressed'), 'false');

    /* --- station 3: the two arrow layers, opposite on every wire ---------- */
    app.goToStation('direction');
    const scene = $('[data-scene="direction-scene"]');
    assert.equal(scene.querySelectorAll('[data-layer="current"] polygon[data-flow="current"]').length, 6, 'five wire arrows plus the one inside the source');
    assert.equal(scene.querySelectorAll('[data-layer="electrons"] polygon[data-flow="electron"]').length, 5, 'no electron arrow is drawn inside the source');
    assert.equal(scene.querySelectorAll('[data-layer="electrons"] [data-segment="generator"]').length, 0);
    /* every arrow has a visible caption of its own, and the long name in <title> */
    assert.equal(scene.querySelectorAll('[data-caption]').length, drawnArrows().length);
    for (const arrow of drawnArrows()) {
      const polygon = scene.querySelector(`polygon[data-flow="${arrow.kind}"][data-segment="${arrow.segment}"]`);
      assert.ok(polygon, `${arrow.segment}/${arrow.kind} must be drawn`);
      assert.equal(polygon.querySelector('title').textContent.length > 0, true, 'the long name stays in the SVG title');
      const caption = polygon.closest('g').querySelector(`[data-caption][data-segment="${arrow.segment}"]`);
      assert.ok(caption, `${arrow.segment}/${arrow.kind} must carry a visible caption`);
      assert.equal(caption.getAttribute('x'), String(arrow.caption.x));
      assert.equal(caption.getAttribute('y'), String(arrow.caption.y));
      const word = arrow.insideGenerator ? SCENE_COPY.generatorInteriorCaption : ARROW_CAPTION_COPY[arrow.kind];
      /* the painted text only: the SVG <title> child is a tooltip, not a glyph */
      const painted = [...caption.childNodes].filter((node) => node.nodeType === 3).map((node) => node.textContent).join('').trim();
      assert.equal(painted, word);
      const tooltip = caption.querySelector('title').textContent;
      assert.equal(tooltip.includes(arrow.insideGenerator ? 'داخل المولّد' : word), true, 'the tooltip names what the caption names');
    }
    assert.match($('.u2l2a-legend-note').textContent, new RegExp(ARROW_CAPTION_COPY.current));
    assert.match($('.u2l2a-legend-note').textContent, new RegExp(ARROW_CAPTION_COPY.electron));
    const opposites = { left: 'right', right: 'left', up: 'down', down: 'up' };
    for (const segment of Object.keys(ARROW_SPOTS)) {
      const current = scene.querySelector(`[data-flow="current"][data-segment="${segment}"]`).dataset.dir;
      const electron = scene.querySelector(`[data-flow="electron"][data-segment="${segment}"]`).dataset.dir;
      assert.equal(opposites[current], electron, `segment ${segment} must show opposite directions`);
    }
    assert.equal(scene.querySelector('[data-layer="electrons"]').hidden, true, 'the electron layer starts hidden');
    click($('[data-direction-toggle="electrons"]'));
    assert.equal(scene.querySelector('[data-layer="electrons"]').hidden, false);
    click($('[data-direction-toggle="energy"]'));
    assert.equal(scene.querySelector('[data-layer="energy"]').hidden, false);
    click($('[data-direction-toggle="electrons"]'));
    assert.equal(scene.querySelector('[data-layer="electrons"]').hidden, true);

    /* --- station 4: change the values, read the dial, reset --------------- */
    app.goToStation('ammeter');
    assert.match($('[data-lab-reading]').textContent, /2/);
    set($('[data-lab-charge]'), '120');
    assert.match($('[data-lab-reading]').textContent, /4/);
    set($('[data-lab-time]'), '120');
    assert.match($('[data-lab-reading]').textContent, /1/);
    click($('[data-lab-book]'));
    assert.match($('[data-lab-reading]').textContent, /0\.2/);
    assert.match($('[data-lab-milli]').textContent, /200/);
    assert.match($('[data-dial-needle]').getAttribute('transform'), /rotate\(/);
    click($('[data-lab-reset]'));
    assert.match($('[data-lab-reading]').textContent, /2/);

    /* --- station 5: the calculator, its targets, its refusals ------------- */
    app.goToStation('relation');
    assert.match($('[data-calc-result]').innerHTML, /katex/);
    assert.equal($('[data-calc-steps]').children.length, 3);
    click($('[data-calc-target="t"]'));
    assert.equal($('[data-calc-input="Q"]').closest('[data-calc-field="Q"]').hidden, false);
    set($('[data-calc-input="I"]'), '0');
    assert.equal($('[data-calc-issues]').hidden, false, 'a zero divisor is refused in the UI');
    set($('[data-calc-input="I"]'), 'bad');
    assert.equal($('[data-calc-issues]').hidden, false);
    set($('[data-calc-input="I"]'), '3');
    set($('[data-calc-input="Q"]'), '45');
    assert.equal($('[data-calc-output]').hidden, false);
    assert.match($('[data-calc-result]').textContent, /15/);
    click($('[data-calc-target="I"]'));
    change($('[data-calc-unit="t"]'), 'min');
    set($('[data-calc-input="Q"]'), '60');
    set($('[data-calc-input="t"]'), '1');
    assert.equal($('[data-calc-steps]').children.length, 4, 'the minute conversion is a step');
    assert.match($('[data-calc-result]').textContent, /1/, '60 C in 1 min = 1 A');
    click($('[data-calc-reset]'));
    assert.equal($('[data-calc-input="t"]').value, '30');

    /* --- station 6: the final challenge mixes all four task kinds --------- */
    app.goToStation('detective');
    const numeric = root.querySelector('[data-question="detective-7"]');
    set(numeric.querySelector('[data-number-input]'), '5');
    click(numeric.querySelector('[data-question-submit]'));
    assert.equal(numeric.dataset.status, 'incorrect');
    set(numeric.querySelector('[data-number-input]'), '0.5');
    click(numeric.querySelector('[data-question-submit]'));
    assert.equal(numeric.dataset.status, 'correct');
    const detectiveOrder = root.querySelector('[data-question="detective-4"]');
    const up = detectiveOrder.querySelector('[data-order-item="causes"] [data-order-delta="-1"]');
    click(up);
    click(up);
    click(up);
    click(detectiveOrder.querySelector('[data-question-submit]'));
    assert.equal(detectiveOrder.dataset.status, 'correct');
    assert.match($('[data-detective-count]').textContent, /2/);
    assert.notEqual($('[data-detective-track]').getAttribute('aria-valuenow'), '0');

    /* --- station 7: the concept map, the self-check list, the restart ----- */
    app.goToStation('map');
    click($('[data-concept-button="free-electrons"]'));
    assert.equal($('[data-concept-card="free-electrons"]').hidden, false);
    assert.equal($('[data-map-node="free-electrons"]').dataset.active, 'true');
    const item = $('[data-checklist-item="check-o1"]');
    item.checked = true;
    item.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal($('[data-checklist-track]').getAttribute('aria-valuenow'), '1');
    item.checked = false;
    item.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal($('[data-checklist-track]').getAttribute('aria-valuenow'), '0', 'unchecking is reported too');
    click($('[data-checklist-open="electrons"]'));
    assert.equal(app.flow.activeId, 'electrons', 'a self-check row reopens the station that teaches it');

    /* --- navigation, deep links, keyboard and progress ------------------- */
    app.goToStation('map');
    click($('#previous-station'));
    assert.equal(app.flow.activeId, 'detective');
    click($('[data-station-link="origin"]'));
    assert.equal(app.flow.activeId, 'origin');
    assert.equal(root.querySelectorAll('[data-station]:not([hidden])').length, 1, 'exactly one station is on screen');
    window.location.hash = '#station-relation';
    window.dispatchEvent(new window.HashChangeEvent('hashchange'));
    assert.equal(app.flow.activeId, 'relation');
    const press = (key) => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true }));
    press('PageDown');
    assert.equal(app.flow.activeId, 'detective');
    press('PageUp');
    assert.equal(app.flow.activeId, 'relation');
    press('End');
    assert.equal(app.flow.activeId, 'map');
    press('Home');
    assert.equal(app.flow.activeId, 'origin');
    assert.match($('#answer-progress').textContent, /من 22 سؤالاً/);
    assert.match($('#station-progress-value').textContent, /%/);
    app.dispose();
    assert.equal(problems.length, 0, `the page logged runtime problems: ${problems.join(' | ')}`);
  } finally {
    console.error = originalError;
    window.close();
  }
});
