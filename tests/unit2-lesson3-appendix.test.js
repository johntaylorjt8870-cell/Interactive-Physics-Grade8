/* Tests for the Unit 2 Lesson 3 appendix: «محطة الفولت — اكشف فرق الكمون».

   The file covers four layers:
   1. the published standalone page and its registration in the appendices
      library and the static build script;
   2. the educational content module: the four confirmed objectives and
      keywords, the seven stations, and the source/enrichment labelling;
   3. the electrical model: node potentials, voltmeter readings, the active /
      passive dipole trials, the series and parallel relations and the unit
      conversions, including a consistency sweep over the whole control range;
   4. the answer flow (choice, numeric, ordering and on-schematic probe
      questions), the checklist and — when jsdom is installed — a DOM run
      against the published page that exercises probes, sliders, reset and the
      detective station in a document.

   Nothing here grades or imports the lesson test, its solutions, the teacher
   area or any earlier appendix. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import {
  ALL_QUESTIONS,
  APPENDIX_KEYWORDS,
  APPENDIX_OBJECTIVES,
  APPENDIX_STATIONS,
  APPENDIX_TITLE,
  CHECKLIST_ITEMS,
  CONCEPT_LINKS,
  CONCEPT_MAP_LEGEND,
  CONCEPT_NODES,
  SCOPE_NOTES,
} from '../src/unit2-lesson3-appendix-content.js';
import {
  BENCH_DEFAULTS,
  BENCH_VIEW,
  BOOK_PARALLEL_PRESET,
  BOOK_SERIES_PRESET,
  EMF_RANGE,
  SCENE_LABEL_ANCHORS,
  SHARE_RANGE,
  convertVoltage,
  createCircuit,
  dipoleTrials,
  formatVoltage,
  parallelRelation,
  probePairsEqual,
  receiverInsideDrivenLoop,
  seriesConnectionFault,
  seriesRelation,
  voltmeterReading,
  withReference,
} from '../src/unit2-lesson3-appendix-physics.js';
import {
  answerProgress,
  appendixCoverageReport,
  createAnswerState,
  createChecklistState,
  createStationFlow,
  checklistProgress,
  goToStation,
  moveOrderItem,
  nextStation,
  previousStation,
  questionsIntegrityReport,
  retryAnswer,
  selectAnswer,
  setNumberAnswer,
  setProbe,
  stationHash,
  stationIdFromHash,
  submitAnswer,
  toggleChecklistItem,
} from '../src/unit2-lesson3-appendix-flow.js';

const read = (relative) => readFile(new URL(relative, import.meta.url), 'utf8');

/* --------------------------------------------------- page and registration */

test('the appendix page is a standalone RTL document with its own assets', async () => {
  const page = await read('../unit2-lesson-3-appendix.html');
  assert.match(page, /<html lang="ar" dir="rtl">/);
  assert.match(page, /<title>محطة الفولت/);
  assert.match(page, /rel="stylesheet" href="\.\/src\/unit2-lesson3-appendix\.css"/);
  assert.match(page, /katex\.min\.css/);
  assert.match(page, /<script type="module" src="\.\/src\/unit2-lesson3-appendix\.js"><\/script>/);
  assert.match(page, /data-unit2-lesson3-appendix/);
  assert.match(page, /href="\.\/appendices\.html"/);
  assert.match(page, /<noscript>/);
  /* every hook the view module queries exists in the published markup */
  for (const id of [
    'station-nav', 'station-panels', 'station-progress-track', 'station-progress-fill',
    'station-progress-label', 'station-progress-value', 'previous-station', 'next-station',
    'previous-station-label', 'next-station-label', 'control-center', 'objective-list',
    'keyword-row', 'howto-steps', 'scope-notes', 'hero-description', 'hero-note',
    'hero-extension', 'hero-lesson-label', 'start-first-station', 'answer-progress',
  ]) {
    assert.match(page, new RegExp(`id="${id}"`), `the page must expose #${id}`);
  }
  /* the hero carries the measurement-bench identity, not a recoloured clone:
     * a graphite digital meter with an amber reading and the two probe handles */
  assert.match(page, /u2l3a-hero-art/);
  assert.match(page, /fill="#10151c"/);
  assert.match(page, /fill="#ffb000"/);
  assert.match(page, /fill="#c62828"/);
  assert.match(page, /fill="#263238"/);
});

test('the library card, the build script and the shared css register the appendix', async () => {
  const [library, build, css] = await Promise.all([
    read('../appendices.html'),
    read('../scripts/build.mjs'),
    read('../src/appendices.css'),
  ]);
  assert.match(library, /id="unit2-lesson-three-appendix-title">محطة الفولت/);
  assert.match(library, /href="\.\/unit2-lesson-3-appendix\.html"/);
  assert.match(library, /appendix-card-art-voltage/);
  assert.match(library, /Unit 2 · Lesson 3/);
  assert.equal((library.match(/class="appendix-library-card"/g) ?? []).length, 5);
  assert.match(build, /resolve\(projectDirectory, 'unit2-lesson-3-appendix\.html'\)/);
  assert.match(css, /\.appendix-card-art-voltage/);
  /* the four earlier cards keep their own copy */
  for (const title of ['مختبر الشحنات', 'رحلة الشحنات', 'القوى المتلاقية', 'القوى المتوازية']) {
    assert.ok(library.includes(title), `the library must keep ${title}`);
  }
});

test('protected pages and teacher tooling stay untouched by this appendix', async () => {
  const [lesson, teacherAuth, teacherPage, testData, solutions, home] = await Promise.all([
    read('../unit2-lesson-3.html'),
    read('../src/teacher-auth.js'),
    read('../unit2-lesson-3-teacher.html'),
    read('../src/unit2-lesson3-test-data.js'),
    read('../src/unit2-lesson3-test-solutions.js'),
    read('../index.html'),
  ]);
  assert.equal(lesson.includes('appendix'), false, 'the lesson page stays exactly as published');
  assert.equal(teacherPage.includes('appendix'), false, 'the teacher page stays exactly as published');
  /* the passphrase itself never lives in the repo: the salted verifier is the
     * protected artefact, so the test pins its derived key and cost instead. */
  assert.match(teacherAuth, /PASSWORD_DERIVED_KEY = 'b767bb650abe55633f83ab308ede528269d08bb2a555fc0d0a096d290828cbf6'/);
  assert.match(teacherAuth, /PASSWORD_ITERATIONS = 180_000/);
  assert.match(testData, /id: 'unit2-lesson3'/);
  assert.match(testData, /sourcePages: Object\.freeze\(\[97, 98, 99, 100, 101, 102, 103, 104, 105, 106\]\)/);
  assert.match(solutions, /questionId/);
  assert.equal(home.includes('unit2-lesson-3-appendix'), false, 'the home page lists lessons only');
  /* none of the appendix modules imports the lesson test or teacher area */
  for (const file of [
    '../src/unit2-lesson3-appendix.js',
    '../src/unit2-lesson3-appendix-flow.js',
    '../src/unit2-lesson3-appendix-content.js',
    '../src/unit2-lesson3-appendix-physics.js',
  ]) {
    const source = await read(file);
    assert.doesNotMatch(source, /unit2-lesson3-test|teacher-auth|solutions/);
  }
});

/* ------------------------------------------------------- educational scope */

test('the four confirmed objectives and keywords are published verbatim', () => {
  assert.deepEqual(APPENDIX_OBJECTIVES.map((objective) => objective.text), [
    'يتعرّف فرق الكمون الكهربائي.',
    'يقيس تجريبياً فرق الكمون بين نقطتين في دارة كهربائية.',
    'يميّز بين ثنائي القطب الفعّال وغير الفعّال.',
    'يربط بين فرق الكمون الكلي وفروق الكمون الجزئية في الدارات الكهربائية.',
  ]);
  assert.deepEqual(APPENDIX_KEYWORDS.map((keyword) => keyword.label), [
    'فرق الكمون',
    'مقياس فولت',
    'ثنائي قطب فعّال',
    'ثنائي قطب غير فعّال',
  ]);
  assert.match(APPENDIX_TITLE, /محطة الفولت/);
  for (const objective of APPENDIX_OBJECTIVES) {
    assert.ok(objective.check && objective.stations, `${objective.id} must carry its self-check wording`);
  }
});

test('seven stations cover the objectives and keywords, each with a real interaction', () => {
  assert.equal(APPENDIX_STATIONS.length, 7);
  assert.deepEqual(APPENDIX_STATIONS.map((station) => station.id), [
    'meaning', 'probes', 'dipoles', 'potentials', 'sum', 'detective', 'map',
  ]);
  for (const station of APPENDIX_STATIONS) {
    assert.ok(station.objectiveIds.length >= 1, `${station.id} must serve an objective`);
    assert.ok(station.keywords.length >= 1, `${station.id} must teach a keyword`);
    assert.match(station.goal, /./, `${station.id} must state its goal`);
    assert.match(station.title, /./, `${station.id} must carry its printed title`);
  }
  const covered = new Set(APPENDIX_STATIONS.flatMap((station) => station.objectiveIds));
  assert.deepEqual([...covered].sort(), ['o1', 'o2', 'o3', 'o4']);
  const taught = new Set(APPENDIX_STATIONS.flatMap((station) => station.keywords));
  for (const keyword of APPENDIX_KEYWORDS) {
    assert.ok(taught.has(keyword.label), `${keyword.label} must be taught by a station`);
  }
});

test('book citations stay inside the reviewed pages and enrichment is labelled', () => {
  const bookQuestions = ALL_QUESTIONS.filter((question) => question.source === 'book');
  assert.ok(bookQuestions.length >= 8, 'the book-sourced questions must exist');
  for (const question of bookQuestions) {
    assert.ok(question.pageRef >= 97 && question.pageRef <= 106, `${question.id} cites ص${question.pageRef}`);
  }
  for (const note of SCOPE_NOTES) {
    assert.match(note, /المنصة|الكتاب|الملحق|اختبار/);
  }
  assert.match(CONCEPT_MAP_LEGEND.nodeHint, /اضغط/);
  assert.equal(CONCEPT_NODES.length, 7);
  assert.ok(CONCEPT_LINKS.length >= 6);
  assert.equal(CHECKLIST_ITEMS.length, 4);
  assert.deepEqual(CHECKLIST_ITEMS.map((item) => item.objectiveId).sort(), ['o1', 'o2', 'o3', 'o4']);
});

test('the question bank keeps its integrity contract and never grades before submit', () => {
  assert.equal(ALL_QUESTIONS.length, 26);
  const kinds = ALL_QUESTIONS.reduce((acc, question) => {
    acc[question.kind] = (acc[question.kind] ?? 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(kinds, { choice: 19, number: 4, probe: 2, order: 1 });
  for (const question of ALL_QUESTIONS) {
    assert.ok(String(question.prompt).length > 20, `${question.id} needs a substantive prompt`);
    assert.ok(String(question.explanationHtml).length > 40, `${question.id} must explain itself`);
    assert.equal('answer' in question, false, `${question.id} must not expose its answer statically`);
    if (question.kind === 'choice') {
      assert.equal(question.choices.filter((entry) => entry.correct).length, 1);
      for (const entry of question.choices) assert.ok(entry.feedbackHtml.length > 60);
    }
    if (question.kind === 'probe') {
      assert.ok(question.correctPairs.length >= 1);
      assert.ok(Number.isFinite(question.expectedReading));
      assert.ok(question.circuit, `${question.id} probe question needs a circuit spec`);
    }
    if (question.kind === 'number') {
      assert.ok(Number.isFinite(question.expected));
      assert.equal(typeof question.unit, 'string');
    }
    if (question.kind === 'order') {
      assert.deepEqual([...question.items].map((item) => item.position).sort((a, b) => a - b), [0, 1, 2, 3]);
    }
  }
  for (const report of questionsIntegrityReport()) {
    for (const [key, value] of Object.entries(report)) {
      if (key === 'id' || key === 'kind' || key === 'pageRef' || key === 'source') continue;
      assert.equal(value, true, `${report.id}: integrity flag ${key} must hold`);
    }
  }
  const coverage = appendixCoverageReport();
  assert.equal(coverage.stationCount, 7);
  assert.equal(coverage.objectiveCount, 4);
  assert.equal(coverage.keywordCount, 4);
  assert.equal(coverage.questionCount, 26);
  assert.deepEqual(coverage.questionKinds, ['choice', 'number', 'order', 'probe']);
  for (const [key, value] of Object.entries(coverage)) {
    if (typeof value === 'boolean') assert.equal(value, true, `coverage ${key} must pass`);
  }
  for (const row of coverage.stationKeywordCoverage) {
    assert.equal(row.allKeywordsKnown, true);
    assert.equal(row.allObjectivesKnown, true);
  }
});

/* --------------------------------------------------------- electrical model */

const potMap = (circuit) => Object.fromEntries(circuit.nodes.map((point) => [point.id, point.potential]));

test('the series bench derives every node potential from one consistent loop', () => {
  const circuit = createCircuit({ layout: 'series2', emf: 6, shares: [4, 2], closed: true });
  assert.deepEqual(potMap(circuit), { pos: 6, w1: 6, mid: 2, w2: 0, w3: 0, neg: 0 });
  assert.equal(voltmeterReading(circuit, 'w1', 'mid').value, 4);
  assert.equal(voltmeterReading(circuit, 'mid', 'w1').value, -4);
  assert.equal(voltmeterReading(circuit, 'w1', 'mid').redIsHigher, true);
  assert.equal(voltmeterReading(circuit, 'mid', 'w1').redIsHigher, false);
  assert.equal(voltmeterReading(circuit, 'pos', 'neg').value, 6);
  /* the same wire always reads zero, whatever the reference */
  assert.equal(voltmeterReading(circuit, 'pos', 'w1').value, 0);
  const shifted = withReference(circuit, 'mid');
  assert.equal(potMap(shifted).pos, 4);
  assert.equal(voltmeterReading(shifted, 'w1', 'mid').value, 4, 'readings must not depend on the reference');
});

test('an open circuit moves the whole emf onto the open switch and leaves lamps at zero', () => {
  const open = createCircuit({ layout: 'series2', emf: 6, shares: [4, 2], closed: false });
  assert.deepEqual(potMap(open), { pos: 6, w1: 6, mid: 6, w2: 6, w3: 0, neg: 0 });
  assert.equal(voltmeterReading(open, 'w1', 'mid').value, 0);
  assert.equal(voltmeterReading(open, 'w2', 'w3').value, 6);
  const openElements = Object.fromEntries(open.elements.map((element) => [element.id, element.u]));
  assert.equal(openElements.sw, 6);
  assert.equal(openElements.l1, 0);
  assert.equal(openElements.l2, 0);
});

test('the parallel bench keeps both branches between the same two nodes', () => {
  const circuit = createCircuit({ layout: 'parallel2', emf: 6, shares: [4, 8], closed: true });
  const potentials = potMap(circuit);
  assert.equal(potentials.ain, 6);
  assert.equal(potentials.aout, 0);
  assert.equal(potentials.bin, 6);
  assert.equal(potentials.bout, 0);
  assert.equal(voltmeterReading(circuit, 'ain', 'aout').value, 6);
  assert.equal(voltmeterReading(circuit, 'bin', 'bout').value, 6);
  assert.equal(voltmeterReading(circuit, 'pos', 'neg').value, 6);
  const open = createCircuit({ layout: 'parallel2', emf: 6, shares: [4, 8], closed: false });
  assert.equal(voltmeterReading(open, 'ain', 'aout').value, 0);
  assert.equal(voltmeterReading(open, 'pos', 'neg').value, 6);
});

test('changing the model really changes the readings across the whole control range', () => {
  for (let emf = EMF_RANGE.min; emf <= EMF_RANGE.max; emf += EMF_RANGE.step) {
    for (let a = SHARE_RANGE.min; a <= SHARE_RANGE.max; a += 1) {
      for (let b = SHARE_RANGE.min; b <= SHARE_RANGE.max; b += 1) {
        const circuit = createCircuit({ layout: 'series2', emf, shares: [a, b], closed: true });
        const u1 = voltmeterReading(circuit, 'w1', 'mid').value;
        const u2 = voltmeterReading(circuit, 'mid', 'w2').value;
        const total = voltmeterReading(circuit, 'pos', 'neg').value;
        assert.ok(Math.abs(u1 + u2 - total) < 1e-9, `partial differences must sum to the total (${emf},${a},${b})`);
        assert.ok(Math.abs(total - emf) < 1e-9, 'the source difference equals the emf in a closed loop');
        assert.ok(u1 > 0 && u2 > 0, 'every closed lamp carries a positive difference');
        assert.ok(Math.abs(u1 / u2 - a / b) < 1e-9, 'the split follows the shares');
      }
    }
  }
});

test('the series fault model shows the source difference on the meter and dark lamps', () => {
  const circuit = createCircuit({ layout: 'series2', emf: 6, shares: [4, 2], closed: true });
  const faulty = seriesConnectionFault(circuit);
  assert.equal(faulty.connection, 'series');
  assert.equal(faulty.meterReading, 6);
  assert.equal(faulty.lampVoltages.l1, 0);
  assert.equal(faulty.current, 0);
  assert.equal(faulty.lampLit, false);
});

test('the dipole lab separates active from passive dipoles without a single reading', () => {
  const active = dipoleTrials('source');
  assert.equal(active.classification, 'active');
  assert.equal(active.trials.length, 2);
  assert.equal(active.trials[0].voltage, 6, 'alone with open terminals the source shows its emf');
  assert.equal(active.trials[1].voltage, 6, 'inside a driven loop the source keeps its difference');
  assert.equal(active.trials[1].drivesCurrent, true);
  const lamp = dipoleTrials('lamp');
  assert.equal(lamp.classification, 'passive');
  assert.equal(lamp.trials[0].voltage, 0, 'a lamp alone between dead wires reads zero');
  assert.equal(lamp.trials[1].drivesCurrent, false);
  /* but inside a driven loop the passive dipole does carry a difference */
  const driven = receiverInsideDrivenLoop('lamp', { emf: 6, lampResistance: 4, otherResistance: 2 });
  assert.equal(driven.voltage, 4);
  assert.equal(driven.current, 1);
  assert.match(driven.note, /غير فعّال/);
  assert.throws(() => dipoleTrials('wire'), RangeError);
});

test('the series and parallel relations state their own applicability', () => {
  const series = seriesRelation(createCircuit({ ...BOOK_SERIES_PRESET, closed: true }));
  assert.deepEqual(series.partials.map((partial) => partial.value), [7, 5]);
  assert.equal(series.total, 12);
  assert.equal(series.sourceVoltage, 12);
  assert.equal(series.holds, true);
  const parallel = parallelRelation(createCircuit({ ...BOOK_PARALLEL_PRESET, closed: true }));
  assert.deepEqual(parallel.branches.map((branch) => branch.value), [6, 6]);
  assert.equal(parallel.total, 6);
  assert.equal(parallel.holds, true);
  assert.match(parallel.reason, /العقدتين نفسيهما/);
  assert.equal(probePairsEqual(['mid', 'w2'], [['w2', 'mid'], ['pos', 'neg']]), true);
  assert.equal(probePairsEqual(['mid', 'w2'], [['w2', 'w3'], ['pos', 'neg']]), false);
});

test('unit conversions and formatting keep the volt family honest', () => {
  assert.equal(convertVoltage(25, 'kV', 'V'), 25000);
  assert.equal(convertVoltage(2.4, 'V', 'mV'), 2400);
  assert.ok(Math.abs(convertVoltage(350, 'mV', 'V') - 0.35) < 1e-9);
  assert.throws(() => convertVoltage(1, 'V', 'A'));
  assert.equal(formatVoltage(4), '4');
  assert.equal(formatVoltage(-2.5), '-2.5');
  assert.equal(formatVoltage(0.35), '0.35');
});

test('scene geometry keeps labels, handles and solids apart on every layout', () => {
  const boxOf = (label) => {
    const width = label.text.length * label.size * 0.55;
    return { x1: label.x - width / 2, x2: label.x + width / 2, y1: label.y - label.size * 0.9, y2: label.y + label.size * 0.3 };
  };
  const gap = (a, b) => Math.max(b.x1 - a.x2, a.x1 - b.x2, b.y1 - a.y2, a.y1 - b.y2);
  for (const layout of ['single', 'series2', 'series3', 'parallel2']) {
    const defaults = BENCH_DEFAULTS[layout];
    const circuit = createCircuit({ layout, emf: defaults.emf, shares: defaults.shares, closed: true });
    /* the drawn solids: the source body and every lamp / switch symbol */
    const solids = [
      { x1: circuit.source.from, x2: circuit.source.to, y1: circuit.source.y - 20, y2: circuit.source.y + 20 },
      ...circuit.elements.map((element) => {
        const half = element.kind === 'lamp' ? 27 : 24;
        return { x1: element.x - half, x2: element.x + half, y1: element.y - half, y2: element.y + half };
      }),
    ];
    const LABEL_TEXT = Object.freeze({
      terminalPositive: 'القطب الموجب',
      terminalNegative: 'القطب السالب',
      sourceTitle: 'المولّد',
      lampOne: 'المصباح الأول',
      lampTwo: 'المصباح الثاني',
      lampThree: 'المصباح الثالث',
      switchLabel: 'قاطعة مغلقة',
    });
    const labelSize = (anchor) => (anchor.className.includes('is-title') ? 15
      : anchor.className.includes('part-sub') ? 11.5 : 14);
    const labels = Object.entries(SCENE_LABEL_ANCHORS[layout]).map(([key, value]) => ({
      key, ...value, text: LABEL_TEXT[key], size: labelSize(value),
    }));
    for (const label of labels) {
      const box = boxOf(label);
      assert.ok(box.x1 >= 0 && box.x2 <= BENCH_VIEW.width, `${layout}.${label.key} must stay inside the view`);
      assert.ok(box.y1 >= 0 && box.y2 <= BENCH_VIEW.height, `${layout}.${label.key} must stay inside the view vertically`);
      for (const solid of solids) {
        assert.ok(gap(box, solid) >= 0, `${layout}.${label.key} must not sit on a circuit solid`);
      }
      for (const node of circuit.nodes) {
        const halo = { x1: node.x - 16, x2: node.x + 16, y1: node.y - 16, y2: node.y + 16 };
        assert.ok(gap(box, halo) >= 0, `${layout}.${label.key} must not sit on node ${node.id}`);
      }
    }
    /* the probe handle of every node stays clear of the printed labels */
    for (const node of circuit.nodes) {
      const distance = node.lead === 'up' ? 58 : 40;
      const handle = node.lead === 'up'
        ? { x1: node.x - 26, x2: node.x + 26, y1: node.y - distance - 11, y2: node.y - distance + 11 }
        : node.lead === 'down'
          ? { x1: node.x - 26, x2: node.x + 26, y1: node.y + distance - 11, y2: node.y + distance + 11 }
          : node.lead === 'left'
            ? { x1: node.x - distance - 26, x2: node.x - distance + 26, y1: node.y - 11, y2: node.y + 11 }
            : { x1: node.x + distance - 26, x2: node.x + distance + 26, y1: node.y - 11, y2: node.y + 11 };
      assert.ok(handle.y1 >= 0 && handle.y2 <= BENCH_VIEW.height, `${layout}.${node.id} handle inside view`);
      assert.ok(handle.x1 >= 0 && handle.x2 <= BENCH_VIEW.width, `${layout}.${node.id} handle inside view horizontally`);
      for (const label of labels) {
        assert.ok(gap(handle, boxOf(label)) >= 0, `${layout}.${node.id} handle must not cover ${label.key}`);
      }
    }
  }
});

/* --------------------------------------------------------------- answer flow */

test('the answer flow grades only on submit and keeps attempts honest', () => {
  /* probe question dt1: invalid until both probes sit on two distinct points */
  let state = createAnswerState('dt1');
  const invalid = submitAnswer(state);
  assert.equal(invalid.status, null);
  assert.equal(invalid.needsInput, true);
  assert.equal(invalid.attempts, 0);

  state = setProbe(state, 'red', 'mid');
  const samePoint = submitAnswer(setProbe(state, 'black', 'mid'));
  assert.equal(samePoint.needsInput, true, 'the two probes may never touch one point');

  const correct = submitAnswer(setProbe(state, 'black', 'w2'));
  assert.equal(correct.status, 'correct');
  assert.equal(correct.attempts, 1);
  assert.match(correct.feedbackHtml, /2/);
  const swapped = submitAnswer(setProbe(setProbe(state, 'red', 'w2'), 'black', 'mid'));
  assert.equal(swapped.status, 'correct', 'the same two points read the same magnitude either way');
  const wrong = submitAnswer(setProbe(state, 'black', 'pos'));
  assert.equal(wrong.status, 'incorrect');
  assert.match(wrong.feedbackHtml, /القراءة المطلوبة/);

  const retried = retryAnswer(correct);
  assert.equal(retried.status, null);
  assert.equal(retried.red, null);
  assert.equal(retried.attempts, 1, 'a retry clears the answer but keeps the attempt count');

  /* numeric answers accept Arabic-Indic digits and reject empty input */
  let numeric = createAnswerState('dt5');
  const empty = submitAnswer(numeric);
  assert.equal(empty.status, 'invalid');
  assert.equal(empty.attempts, 0);
  numeric = setNumberAnswer(numeric, '٢٥٠٠٠');
  const arabic = submitAnswer(numeric);
  assert.equal(arabic.status, 'correct');
  const negative = submitAnswer(setNumberAnswer(createAnswerState('dt5'), '-3'));
  assert.equal(negative.status, 'invalid');

  /* choice answers expose the verdict only after submit */
  const m1 = ALL_QUESTIONS.find((question) => question.id === 'm1');
  const rightId = m1.choices.find((entry) => entry.correct).id;
  const wrongId = m1.choices.find((entry) => !entry.correct).id;
  let choiceState = createAnswerState('m1');
  assert.equal(submitAnswer(choiceState).needsInput, true);
  choiceState = selectAnswer(choiceState, rightId);
  assert.equal(choiceState.status, null, 'picking an option never grades it');
  const graded = submitAnswer(choiceState);
  assert.equal(graded.status, 'correct');
  assert.equal(submitAnswer(selectAnswer(createAnswerState('m1'), wrongId)).status, 'incorrect');

  /* ordering questions grade the visible sequence */
  let orderState = createAnswerState('dt3');
  const target = [...m1OrderTarget()];
  for (let position = 0; position < target.length; position += 1) {
    const itemId = target[position];
    const delta = position - orderState.order.indexOf(itemId);
    if (delta !== 0) orderState = moveOrderItem(orderState, itemId, delta);
  }
  assert.equal(submitAnswer(orderState).status, 'correct');
  assert.equal(submitAnswer(createAnswerState('dt3')).status, 'incorrect', 'the initial order is never pre-solved');

  /* progress is reported without pressure */
  const progress = answerProgress({ dt1: correct, dt5: arabic });
  assert.equal(progress.attempted, 2);
  assert.equal(progress.solved, 2);
  assert.equal(progress.total, 26);

  function m1OrderTarget() {
    const dt3 = ALL_QUESTIONS.find((question) => question.id === 'dt3');
    return [...dt3.items].sort((a, b) => a.position - b.position).map((item) => item.id);
  }
});

test('the self-check list mirrors the four objectives', () => {
  let state = createChecklistState();
  assert.equal(checklistProgress(state).done, 0);
  state = toggleChecklistItem(state, CHECKLIST_ITEMS[0].id);
  assert.equal(checklistProgress(state).done, 1);
  state = toggleChecklistItem(state, CHECKLIST_ITEMS[0].id);
  assert.equal(checklistProgress(state).done, 0);
  for (const item of CHECKLIST_ITEMS) state = toggleChecklistItem(state, item.id);
  const done = checklistProgress(state);
  assert.equal(done.complete, true);
  assert.equal(done.percent, 100);
  assert.deepEqual([...done.doneObjectiveIds].sort(), ['o1', 'o2', 'o3', 'o4']);
  assert.throws(() => toggleChecklistItem(state, 'nope'), RangeError);
});

test('station navigation state walks the seven stations and their hashes', () => {
  const flow = createStationFlow();
  assert.equal(flow.activeIndex, 0);
  assert.equal(flow.total, 7);
  const atSum = goToStation(flow, 'sum');
  assert.equal(atSum.activeIndex, 4);
  assert.equal(nextStation(atSum).activeIndex, 5);
  assert.equal(previousStation(atSum).activeIndex, 3);
  assert.equal(previousStation(flow).activeIndex, 0, 'backwards is clamped at the first station');
  assert.equal(nextStation(goToStation(flow, 'map')).activeIndex, 6, 'forwards is clamped at the last');
  assert.throws(() => goToStation(flow, 'nope'), RangeError);
  assert.equal(stationIdFromHash('#station-map'), 'map');
  assert.equal(stationIdFromHash('#nonsense'), null);
  assert.equal(stationHash('map'), '#station-map');
  assert.deepEqual(atSum.visitedIds, ['meaning', 'sum']);
});

/* ------------------------------------------------------------- design guards */

test('the stylesheet keeps the measurement-lab identity accessible', async () => {
  const css = await read('../src/unit2-lesson3-appendix.css');
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width/);
  assert.match(css, /direction:\s*ltr/);
  assert.match(css, /\.u2l3a-trial-log:empty \{ display: none; \}/);
  /* never colour-only: ok / err / warn states also change text or icon */
  assert.match(css, /--correct:/);
  assert.match(css, /--wrong:/);
  assert.match(css, /--volt:/);
  assert.doesNotMatch(css, /#0a1120/, 'the charge-lab palette must not leak in');
});

/* ----------------------------------------- DOM run (jsdom, developer-only) */

test('mounting the published page drives probes, sliders, reset and the detective', async (t) => {
  let JSDOM;
  try {
    ({ JSDOM } = await import('jsdom'));
  } catch {
    t.skip('jsdom is not installed here (developer-only package), so the DOM run is skipped rather than faked');
    return;
  }
  const html = await read('../unit2-lesson-3-appendix.html');
  const dom = new JSDOM(html, { url: 'https://example.test/unit2-lesson-3-appendix.html', pretendToBeVisual: true });
  const { window } = dom;
  const problems = [];
  window.addEventListener('error', (event) => problems.push(String(event.message)));
  try {
    const module = await import('../src/unit2-lesson3-appendix.js');
    const root = window.document.querySelector('[data-unit2-lesson3-appendix]');
    const app = module.mountVoltageAppendix(root);
    const $ = (selector) => root.querySelector(selector);
    const click = (element) => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    const set = (element, value) => { element.value = value; element.dispatchEvent(new window.Event('input', { bubbles: true })); };
    const change = (element, value) => { element.value = value; element.dispatchEvent(new window.Event('change', { bubbles: true })); };

    assert.equal($('#station-nav').children.length, 7);
    assert.equal($('#objective-list').children.length, 4);
    assert.equal($('#keyword-row').children.length, 4);
    assert.equal($('#scope-notes').children.length, 3);
    assert.equal($('[data-dmm="meaning"] [data-dmm-value]').textContent, '—');

    /* station 1: measure, open the circuit, reset */
    click($('[data-meaning-measure]'));
    assert.equal($('[data-dmm="meaning"] [data-dmm-value]').textContent, '4.5');
    click($('[data-meaning-switch]'));
    assert.equal($('[data-dmm="meaning"] [data-dmm-value]').textContent, '0');
    click($('[data-meaning-reset]'));
    assert.equal($('[data-dmm="meaning"] [data-dmm-value]').textContent, '—');

    /* station 2: place the two probes on nodes, read, move, reset */
    app.goToStation('probes');
    assert.equal($('[data-dmm="probes"] [data-dmm-value]').textContent, '4');
    click($('[data-station="probes"] [data-node="pos"]'));
    click($('[data-station="probes"] [data-node="neg"]'));
    assert.equal($('[data-dmm="probes"] [data-dmm-value]').textContent, '-6');
    set($('[data-probes-emf]'), '12');
    assert.equal($('[data-dmm="probes"] [data-dmm-value]').textContent, '-12');
    set($('[data-probes-share1]'), '9');
    click($('[data-station="probes"] [data-node="w1"]'));
    click($('[data-station="probes"] [data-node="mid"]'));
    assert.equal($('[data-dmm="probes"] [data-dmm-value]').textContent, '-9.8182');
    click($('[data-probes-reset]'));
    assert.equal($('[data-dmm="probes"] [data-dmm-value]').textContent, '4');
    click($('[data-probes-add]'));
    assert.equal($('[data-probes-table]').children.length, 1);
    assert.equal($('[data-probes-table]').querySelector('.is-empty'), null);

    /* station 3: two trials before any classification, then the driven-loop note */
    app.goToStation('dipoles');
    assert.equal($('[data-dipole-driven]').hidden, true);
    click($('[data-dipole="lamp"]'));
    click($('[data-dipole-trial-a]'));
    assert.match($('[data-dipole-log]').textContent, /التجربة 1/);
    click($('[data-dipole-trial-b]'));
    assert.equal($('[data-dipole-driven]').hidden, false);
    assert.match($('[data-dipole-driven]').textContent, /غير فعّال/);

    /* station 4: reference choice moves potentials but not differences */
    app.goToStation('potentials');
    change($('[data-pot-select="first"]'), 'pos');
    change($('[data-pot-select="second"]'), 'mid');
    click($('[data-pot-add]'));
    const before = $('[data-pot-table]').textContent.replace(/\s+/g, ' ');
    change($('[data-pot-reference]'), 'mid');
    const after = $('[data-pot-table]').textContent.replace(/\s+/g, ' ');
    assert.match(before, /4/);
    assert.match(after, /4/, 'the compared difference must survive a reference change');

    /* station 5: prediction first, then the measured reveal */
    app.goToStation('sum');
    assert.match($('[data-sum-relation]').textContent, /مخفية/, 'partials stay hidden before the reveal');
    assert.doesNotMatch($('[data-sum-relation]').textContent, /4 V|2 V/, 'no partial value leaks before the reveal');
    set($('[data-sum-predict]'), '6');
    click($('[data-sum-predict-submit]'));
    click($('[data-sum-measure]'));
    assert.match($('[data-sum-result]').textContent, /مطابق/);
    click($('[data-sum-book-series]'));
    assert.match($('[data-sum-relation]').textContent, /7/);
    click($('[data-sum-book-parallel]'));
    assert.match($('[data-sum-relation]').textContent, /6/);

    /* station 6: the detective grades only after submit */
    app.goToStation('detective');
    const question = $('[data-question="m1"]');
    const gradedStatus = () => question.dataset.status;
    assert.ok(!['correct', 'incorrect'].includes(gradedStatus()), 'nothing is graded on mount');
    click(question.querySelector('[data-choice]'));
    assert.ok(!['correct', 'incorrect'].includes(gradedStatus()), 'choosing never grades');
    click(question.querySelector('[data-question-submit]'));
    assert.ok(['correct', 'incorrect'].includes(question.dataset.status));
    assert.match($('#answer-progress').textContent, /1/);

    /* station 7: concept nodes open their cards and the checklist counts */
    app.goToStation('map');
    click($('[data-map-node="voltmeter"]'));
    assert.equal($('[data-map-card="voltmeter"]').hidden, false);
    const item = $('[data-checklist-item]');
    item.checked = true;
    item.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.match($('[data-checklist-count]').textContent, /1 من 4/);

    assert.deepEqual(problems, []);
    app.dispose();
  } finally {
    dom.window.close();
  }
});

test('the appendices library link resolves to real files on disk', () => {
  assert.equal(existsSync(new URL('../unit2-lesson-3-appendix.html', import.meta.url)), true);
  assert.equal(existsSync(new URL('../src/unit2-lesson3-appendix.css', import.meta.url)), true);
  assert.equal(existsSync(new URL('../src/unit2-lesson3-appendix.js', import.meta.url)), true);
});
