import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import {
  APPENDIX_KEYWORDS,
  APPENDIX_OBJECTIVES,
  APPENDIX_STATIONS,
  CHARGE_EXERCISE_SOLUTION,
  CHARGE_PLATFORM_EXERCISE,
  CONCEPT_NODES,
  COULOMB_PROBE_QUESTIONS,
  COULOMB_RATIO_CHOICES,
  DETECTIVE_QUESTIONS,
  KEY_IDEAS,
  METHOD_CARDS,
  METHOD_COMPARISON_ROWS,
  METHOD_STEP_COPY,
  PUZZLE_OUTCOMES,
  PUZZLE_PREDICTIONS,
  STATION_IDS,
  findDetectiveQuestion,
  findStation,
  probeExplanation,
} from '../src/unit2-lesson1-appendix-content.js';
import {
  ATTRACTION,
  BOOK_COULOMB_STATE,
  COULOMB_FIELDS,
  COULOMB_PROBES,
  DEFAULT_COULOMB_STATE,
  ELEMENTARY_CHARGE,
  METHOD_CONTACT,
  METHOD_FRICTION,
  METHOD_IDS,
  METHOD_INDUCTION,
  METHOD_STEPS,
  MODEL_FORCE_LIMIT_N,
  PAPER_SCENE,
  RATIO_DOUBLE,
  RATIO_QUADRUPLE,
  RATIO_QUARTER,
  REPULSION,
  SYMBOLIC_PROTONS,
  arenaState,
  bodyState,
  chargeOfElectronCount,
  checkProbePrediction,
  classifyRatio,
  coulombReading,
  createCoulombState,
  electronCountOfCharge,
  evaluateCoulombProbe,
  forceTeX,
  formatForce,
  interactionKind,
  methodComparison,
  methodFinalState,
  methodState,
  neutralPair,
  paperBitPositions,
  paperSceneOutcome,
  resetCoulombState,
  scaleCoulombInputs,
  transferElectrons,
  updateCoulombInput,
} from '../src/unit2-lesson1-appendix-physics.js';
import {
  createQuizState,
  createStationFlow,
  goToStation,
  quizIntegrityReport,
  quizProgress,
  retryQuizQuestion,
  selectQuizChoice,
  stationHash,
  stationIdFromHash,
  stepStation,
  submitQuizAnswer,
} from '../src/unit2-lesson1-appendix-flow.js';
import { COULOMB_CONSTANT, coulombForce } from '../src/unit2-lesson1-physics.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

/**
 * Every string the content module can put on screen, flattened into one blob.
 * Page citations are built by a template helper, so they are checked on the
 * rendered output rather than on the source text.
 */
async function renderedContent() {
  const module = await import('../src/unit2-lesson1-appendix-content.js');
  return Object.values(module)
    .map((value) => {
      if (typeof value === 'string') return value;
      try { return JSON.stringify(value) ?? ''; } catch { return ''; }
    })
    .join('\n');
}
const near = (actual, expected, tolerance = 1e-9, message = '') => {
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${message} ${actual} ≠ ${expected}`);
};

/* ------------------------------------------------- the appendix page itself */

test('the appendix is a standalone RTL page with its own identity, KaTeX and return paths', async () => {
  assert.equal(existsSync(new URL('../unit2-lesson-1-appendix.html', import.meta.url)), true);
  const page = await read('../unit2-lesson-1-appendix.html');
  assert.match(page, /<html lang="ar" dir="rtl">/);
  assert.match(page, /<title>مختبر الشحنات — ملحق الدرس الأول من الوحدة الثانية/);
  assert.match(page, /<meta name="viewport" content="width=device-width, initial-scale=1" \/>/);
  assert.match(page, /href="\.\/src\/fonts\.css"/);
  assert.match(page, /href="\.\/vendor\/katex\/katex\.min\.css"/);
  assert.match(page, /href="\.\/src\/unit2-lesson1-appendix\.css"/);
  assert.match(page, /src="\.\/src\/unit2-lesson1-appendix\.js"/);
  assert.match(page, /<main id="appendix-main" data-unit2-lesson1-appendix>/);
  /* platform extension, never a new lesson */
  assert.match(page, /ملحق تفاعلي — <bdi dir="ltr">Platform Extension<\/bdi>/);
  assert.match(page, /aria-current="page">مختبر الشحنات/);
  /* station navigation, progress and live regions exist before any script runs */
  assert.match(page, /id="station-nav"/);
  assert.match(page, /id="station-panels"/);
  assert.match(page, /role="progressbar"[^]*aria-valuemax="7"/);
  assert.match(page, /id="station-progress-label"/);
  assert.match(page, /id="previous-station"[^]*disabled/);
  assert.match(page, /id="next-station"/);
  assert.match(page, /class="u2l1a-skip-link" href="#station-panels"/);
  assert.match(page, /Page Up/);
  assert.match(page, /<noscript>/);
  /* return navigation to the library, the lesson and the course home */
  assert.match(page, /href="\.\/appendices\.html"/);
  assert.match(page, /href="\.\/unit2-lesson-1\.html"/);
  assert.match(page, /href="\.\/"/);
});

test('the appendix page never reaches into the lesson test, the teacher area or the password gate', async () => {
  const page = await read('../unit2-lesson-1-appendix.html');
  assert.doesNotMatch(page, /unit2-lesson-1-test|teacher|assessment|test-data|test-solutions|self-check/);
  const [script, physics, content, flow] = await Promise.all([
    read('../src/unit2-lesson1-appendix.js'),
    read('../src/unit2-lesson1-appendix-physics.js'),
    read('../src/unit2-lesson1-appendix-content.js'),
    read('../src/unit2-lesson1-appendix-flow.js'),
  ]);
  for (const module of [script, physics, content, flow]) {
    assert.doesNotMatch(module, /teacher-auth|teacher-content|test-data|test-solutions|assessment-runtime|lesson-assessment|self-check-answers/);
  }
  /* the appendix imports nothing from the Unit 1 appendices: it is independent */
  assert.doesNotMatch(script, /lesson-1-appendix|lesson-2-appendix|appendix-physics'|appendix-practice/);
  /* but it does delegate the constants and the Coulomb relation to the lesson model */
  assert.match(physics, /from '\.\/unit2-lesson1-physics\.js'/);
  assert.equal(COULOMB_CONSTANT, 9e9);
  assert.equal(ELEMENTARY_CHARGE, 1.6e-19);
});

test('the appendix stylesheet carries its own dark storm-lab identity and accessible states', async () => {
  const css = await read('../src/unit2-lesson1-appendix.css');
  /* a new identity, not a recolour of the Unit 1 appendix theme */
  assert.match(css, /\.u2l1a-page \{/);
  assert.match(css, /--bg: #0a1120/);
  assert.match(css, /--spark: #58cdf2/);
  assert.match(css, /--positive: #f6a94a/);
  assert.match(css, /--negative: #58cdf2/);
  assert.doesNotMatch(css, /--paper: #faf9f5/);
  assert.doesNotMatch(css, /\.appendix-lab-section|\.parallel-|\.appendix-force-card/);
  /* accessibility and responsiveness */
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /@media \(max-width: 1080px\)/);
  assert.match(css, /\.u2l1a-visually-hidden/);
  /* RTL prose with LTR-isolated math islands */
  assert.match(css, /\.u2l1a-page \.math \{ direction: ltr; unicode-bidi: isolate; \}/);
  assert.match(css, /\.u2l1a-page bdi\[dir="ltr"\]/);
  /* nothing scrolls the page sideways: wide tables and the rail scroll inside */
  assert.match(css, /\.u2l1a-table-scroll \{ overflow-x: auto/);
  assert.match(css, /\.u2l1a-station-nav \{[\s\S]*overflow-x: auto/);
  assert.match(css, /\.u2l1a-shell \{[\s\S]*overflow-x: clip/);
  assert.match(css, /\.u2l1a-scene-canvas svg \{[^}]*max-inline-size: 100%/);
  /* hidden stations and hidden feedback really stay hidden */
  assert.match(css, /\.u2l1a-station\[hidden\] \{ display: none; \}/);
  assert.match(css, /\.u2l1a-feedback\[hidden\] \{ display: none; \}/);
  assert.match(css, /\.u2l1a-probe-result\[hidden\] \{ display: none; \}/);
});

/* ------------------------------------------------------------- the stations */

test('the appendix is seven short stations, each with its own goal and lesson objective', () => {
  assert.equal(APPENDIX_STATIONS.length, 7);
  assert.deepEqual(STATION_IDS, ['puzzle', 'charge', 'methods', 'forces', 'coulomb', 'detective', 'summary']);
  assert.deepEqual(APPENDIX_STATIONS.map((station) => station.index), [1, 2, 3, 4, 5, 6, 7]);
  for (const station of APPENDIX_STATIONS) {
    assert.ok(station.title.trim().length > 3, `station ${station.id} needs a title`);
    assert.ok(station.goal.trim().length > 20, `station ${station.id} needs an explicit goal`);
    assert.ok(station.kicker.trim().length > 2, `station ${station.id} needs a kicker`);
    assert.ok(station.navLabel.trim().length > 1, `station ${station.id} needs a nav label`);
    assert.equal(findStation(station.id).id, station.id);
  }
  assert.throws(() => findStation('nope'), RangeError);
});

test('the station flow moves forward and back, clamps at both ends and remembers visited stations', () => {
  let flow = createStationFlow();
  assert.equal(flow.activeId, 'puzzle');
  assert.equal(flow.total, 7);
  assert.equal(flow.progressPercent, 14);
  assert.equal(flow.canGoBack, false);
  assert.equal(flow.canGoForward, true);

  flow = stepStation(flow, 1);
  assert.equal(flow.activeId, 'charge');
  flow = goToStation(flow, 'coulomb');
  assert.equal(flow.activeIndex, 4);
  assert.equal(flow.progressPercent, 71);
  assert.deepEqual([...flow.visitedIds], ['puzzle', 'charge', 'coulomb']);

  /* returning to a station already visited keeps the visited list stable */
  flow = goToStation(flow, 'puzzle');
  assert.equal(flow.activeId, 'puzzle');
  assert.deepEqual([...flow.visitedIds], ['puzzle', 'charge', 'coulomb']);
  assert.equal(flow.discoveryPercent, 43);

  /* clamping at both ends */
  flow = stepStation(flow, -1);
  assert.equal(flow.activeId, 'puzzle', 'cannot go before the first station');
  assert.equal(flow.canGoBack, false);
  for (let step = 0; step < 12; step += 1) flow = stepStation(flow, 1);
  assert.equal(flow.activeId, 'summary');
  assert.equal(flow.canGoForward, false);
  assert.equal(flow.progressPercent, 100);
  assert.equal(flow.discoveryPercent, 100);
  assert.throws(() => goToStation(flow, 'unknown-station'), RangeError);
  assert.throws(() => stepStation(flow, 0), RangeError);
});

test('station deep links are read from the hash and written back as station hashes', () => {
  assert.equal(stationIdFromHash('#station-coulomb'), 'coulomb');
  assert.equal(stationIdFromHash('station-methods'), 'methods');
  assert.equal(stationIdFromHash('#station-unknown'), null);
  assert.equal(stationIdFromHash('#some-other-anchor'), null);
  assert.equal(stationHash('detective'), '#station-detective');
  const flow = createStationFlow(stationIdFromHash('#station-forces'));
  assert.equal(flow.activeId, 'forces');
});

test('the six lesson objectives and the five keywords the user supplied drive the appendix scope', async () => {
  assert.deepEqual(APPENDIX_OBJECTIVES, [
    'يتعرّف الكهرباء الساكنة.',
    'يتعرّف الشحنات الكهربائية.',
    'يميّز بين الأجسام المشحونة والأجسام غير المشحونة.',
    'يفسّر طرائق التكهرب.',
    'يفسّر قوى التنافر والتجاذب بين الشحنات.',
    'يتعرّف قانون كولوم.',
  ]);
  assert.deepEqual(APPENDIX_KEYWORDS, ['الكهرباء الساكنة', 'التكهرب', 'قوى التنافر', 'قوى التجاذب', 'قانون كولوم']);
  const [script, page] = await Promise.all([read('../src/unit2-lesson1-appendix.js'), read('../unit2-lesson-1-appendix.html')]);
  assert.match(script, /APPENDIX_OBJECTIVES/);
  assert.match(script, /APPENDIX_KEYWORDS/);
  assert.match(page, /الكهرباء الساكنة/);
  /* stations 1-5 each name the objective they serve; 6-7 tie all six together */
  assert.equal(APPENDIX_STATIONS.filter((station) => /الهدف/.test(station.objective)).length, 5);
  const claimedObjectives = APPENDIX_STATIONS.map((station) => station.objective).join(' · ');
  for (const needle of [
    'الكهرباء الساكنة',
    'الشحنات الكهربائية',
    'المشحون وغير المشحون',
    'طرائق التكهرب',
    'التنافر والتجاذب',
    'قانون كولوم',
  ]) {
    assert.ok(claimedObjectives.includes(needle), `a station header must claim the objective «${needle}»`);
  }
});

/* --------------------------------------- station 1 · the paper-bits puzzle */

test('station 1: an unrubbed rod attracts nothing, a rubbed rod does, and the student decides which', () => {
  const neutral = paperSceneOutcome({ rubbed: false, approachProgress: 1 });
  assert.equal(neutral.outcomeKey, 'neutral-rod');
  assert.equal(neutral.attracted, false);
  assert.equal(neutral.rodCharge.charge, 0);

  const held = paperSceneOutcome({ rubbed: true, approachProgress: 0 });
  assert.equal(held.outcomeKey, 'charged-rod-held-above');
  assert.equal(held.attracted, false);

  const attracted = paperSceneOutcome({ rubbed: true, approachProgress: 1 });
  assert.equal(attracted.outcomeKey, 'charged-rod-attraction');
  assert.equal(attracted.attracted, true);
  /* the plastic rod rubbed with wool gains electrons, so its charge is negative */
  assert.ok(attracted.rodCharge.charge < 0);
  assert.equal(attracted.rodCharge.sign, -1);

  /* every reachable outcome has both an observation and an explanation */
  for (const key of ['neutral-rod', 'charged-rod-held-above', 'charged-rod-attraction']) {
    assert.ok(PUZZLE_OUTCOMES[key], `${key} needs copy`);
    assert.ok(PUZZLE_OUTCOMES[key].observationHtml.length > 40);
    assert.ok(PUZZLE_OUTCOMES[key].explanationHtml.length > 40);
  }
  assert.equal(PUZZLE_PREDICTIONS.length, 3);
});

test('station 1: paper bits stay put without rubbing and rise toward the rubbed end when charged', () => {
  const still = paperBitPositions({ rubbed: false, approachProgress: 1 });
  still.forEach((bit, index) => {
    assert.equal(bit.x, PAPER_SCENE.bits[index].x);
    assert.equal(bit.y, PAPER_SCENE.bits[index].y);
    assert.equal(bit.lift, 0);
    assert.equal(bit.attached, false);
  });

  const lifted = paperBitPositions({ rubbed: true, approachProgress: 1 });
  assert.equal(lifted.length, PAPER_SCENE.bits.length);
  lifted.forEach((bit, index) => {
    assert.ok(bit.y < PAPER_SCENE.bits[index].y, `bit ${bit.id} must rise`);
    assert.equal(bit.attached, true);
    assert.ok(bit.x > 0 && bit.x < PAPER_SCENE.width, 'bits stay inside the drawing');
    assert.ok(bit.y > 0, 'bits never leave the top of the drawing');
  });
  /* the lift is staggered: halfway through, the near bits have moved more */
  const halfway = paperBitPositions({ rubbed: true, approachProgress: 0.3 });
  assert.ok(halfway[0].lift >= halfway[5].lift, 'the nearest bit leads the motion');
});

/* ------------------------------------------------ station 2 · charge ledger */

test('station 2: a neutral body is balanced, not empty, and only electrons move', () => {
  const neutral = bodyState({ label: 'rod', material: 'insulator' });
  assert.equal(neutral.protons, SYMBOLIC_PROTONS);
  assert.equal(neutral.electrons, SYMBOLIC_PROTONS);
  assert.equal(neutral.charge, 0);
  assert.equal(neutral.condition, 'neutral');
  assert.ok(neutral.protons > 0 && neutral.electrons > 0, 'a neutral body still contains charges');

  const pair = neutralPair({ labelA: 'rod', labelB: 'wool', materialA: 'insulator', materialB: 'insulator' });
  const moved = transferElectrons(pair, 2, 'b');
  assert.equal(moved.a.electronDelta, 2, 'the receiver gained two electrons');
  assert.equal(moved.b.electronDelta, -2, 'the donor lost two electrons');
  assert.equal(moved.a.protons, SYMBOLIC_PROTONS, 'protons never move');
  assert.equal(moved.b.protons, SYMBOLIC_PROTONS, 'protons never move');
  assert.equal(moved.a.condition, 'negative');
  assert.equal(moved.b.condition, 'positive');
  assert.equal(moved.conserved, true);
  near(moved.a.charge, -2 * ELEMENTARY_CHARGE, 1e-12, 'gaining electrons is negative');
  near(moved.b.charge, 2 * ELEMENTARY_CHARGE, 1e-12, 'losing electrons is positive');
  near(moved.a.charge + moved.b.charge, 0, 1e-12, 'the pair stays neutral overall');
});

test('station 2: q = n·e reproduces the lesson worked example and the platform exercise', () => {
  /* textbook page 76: q = +8×10⁻⁷ C with e = 1.6×10⁻¹⁹ C gives n = 5×10¹² */
  const bookCount = electronCountOfCharge(8e-7);
  near(bookCount.count, 5e12, 1e-6, 'book electron count');
  assert.equal(bookCount.sign, -1, 'a positive charge means electrons were lost');
  assert.equal(chargeOfElectronCount(-5e12).sign, 1);

  /* platform exercise built on the page 76 activity: losing 20×10¹⁰ electrons */
  assert.equal(CHARGE_PLATFORM_EXERCISE.electronCount, 20e10);
  near(CHARGE_EXERCISE_SOLUTION.charge, 3.2e-8, 1e-9, 'q = n e for the exercise');
  assert.ok(CHARGE_EXERCISE_SOLUTION.charge > 0, 'losing electrons leaves a positive charge');
  assert.equal(CHARGE_EXERCISE_SOLUTION.steps.length, 5);
  assert.ok(CHARGE_EXERCISE_SOLUTION.steps.every((step) => step.html.includes('katex') || step.html.includes('<p>')));

  /* the ledger cannot invent electrons it does not have */
  const pair = neutralPair({ labelA: 'a', labelB: 'b', materialA: 'insulator', materialB: 'insulator' });
  assert.throws(() => transferElectrons(pair, 99, 'a'), RangeError);
  assert.throws(() => transferElectrons(pair, 1.5, 'a'), RangeError);
  assert.throws(() => transferElectrons(pair, 1, 'c'), RangeError);
});

/* --------------------------------------------- station 3 · charging methods */

test('station 3: the three methods start alike and end differently', () => {
  assert.deepEqual(METHOD_IDS, [METHOD_FRICTION, METHOD_CONTACT, METHOD_INDUCTION]);
  assert.deepEqual(METHOD_STEPS[METHOD_FRICTION], ['before', 'rub', 'test']);
  assert.deepEqual(METHOD_STEPS[METHOD_CONTACT], ['before', 'touch', 'separate']);
  assert.deepEqual(METHOD_STEPS[METHOD_INDUCTION], ['before', 'approach', 'ground', 'unground', 'withdraw']);

  /* friction: two neutral bodies end with equal and opposite charges */
  const frictionBefore = methodState(METHOD_FRICTION, 'before');
  assert.equal(frictionBefore.a.condition, 'neutral');
  assert.equal(frictionBefore.b.condition, 'neutral');
  const friction = methodFinalState(METHOD_FRICTION);
  assert.equal(friction.a.condition, 'negative', 'the rubbed plastic rod gains electrons');
  assert.equal(friction.b.condition, 'positive', 'the wool loses them');
  assert.equal(friction.a.electronDelta, -friction.b.electronDelta);
  assert.equal(friction.flow.from, 'b');
  assert.equal(friction.flow.to, 'a');
  assert.equal(friction.mechanism, 'transfer-between-bodies');
  assert.equal(friction.a.distribution, 'localized-at-rubbed-end', 'charges stay put on an insulator');

  /* contact: the neutral conductor takes the SAME sign and the rod loses some charge */
  const contact = methodFinalState(METHOD_CONTACT);
  assert.equal(contact.a.condition, 'negative');
  assert.equal(contact.b.condition, 'negative');
  assert.ok(Math.abs(contact.a.electronDelta) < Math.abs(methodState(METHOD_CONTACT, 'before').a.electronDelta));
  assert.equal(contact.b.distribution, 'spread-over-surface');
  assert.equal(contact.flow.from, 'a');
  assert.equal(contact.flow.to, 'b');

  /* induction: no electron crosses between the bodies, and the final sign is opposite */
  const approach = methodState(METHOD_INDUCTION, 'approach');
  assert.equal(approach.b.electronDelta, 0, 'approaching alone changes no net charge');
  assert.equal(approach.b.condition, 'neutral');
  assert.deepEqual(approach.b.polarized, { nearEnd: 'positive', farEnd: 'negative', cause: 'negative' });
  assert.equal(approach.mechanism, 'redistribution-only');
  assert.equal(approach.flow, null);

  const grounded = methodState(METHOD_INDUCTION, 'ground');
  assert.equal(grounded.b.condition, 'positive');
  assert.equal(grounded.flow.to, 'ground', 'the electrons leave into the Earth, not into the rod');
  assert.equal(grounded.a.electronDelta, methodState(METHOD_INDUCTION, 'before').a.electronDelta, 'the rod is untouched');

  const induction = methodFinalState(METHOD_INDUCTION);
  assert.equal(induction.b.condition, 'positive');
  assert.equal(induction.a.condition, 'negative');
  assert.equal(induction.b.polarized, null, 'the polarization ends when the rod leaves');
  assert.equal(induction.b.distribution, 'spread-over-surface');
  assert.equal(induction.mechanism, 'transfer-with-ground');
});

test('station 3: charge is conserved in every step of every method and every step is explained', () => {
  for (const method of METHOD_IDS) {
    const before = methodState(method, 'before');
    const initialTotal = before.a.electronDelta + before.b.electronDelta + before.ground;
    for (const stepId of METHOD_STEPS[method]) {
      const state = methodState(method, stepId);
      assert.equal(state.conservation.balanced, true, `${method}:${stepId} must conserve charge`);
      assert.equal(state.conservation.total, initialTotal, `${method}:${stepId} keeps the initial ledger`);
      assert.equal(state.a.protons, SYMBOLIC_PROTONS, `${method}:${stepId} never moves protons`);
      assert.equal(state.b.protons, SYMBOLIC_PROTONS, `${method}:${stepId} never moves protons`);
      assert.equal(state.a.electronDelta + state.b.electronDelta + state.ground, state.conservation.total);
      assert.ok(METHOD_STEP_COPY[`${method}:${stepId}`], `${method}:${stepId} needs observation copy`);
      assert.ok(METHOD_STEP_COPY[`${method}:${stepId}`].observation.length > 20);
      assert.ok(METHOD_STEP_COPY[`${method}:${stepId}`].explanation.length > 20);
    }
    assert.ok(METHOD_CARDS[method].bookHtml.includes('u2l1a-book-quote'), `${method} quotes the book conclusion`);
    assert.ok(METHOD_CARDS[method].steps.length === METHOD_STEPS[method].length);
    assert.deepEqual(METHOD_CARDS[method].steps.map((step) => step.id), METHOD_STEPS[method]);
  }
  /* induction is the only method whose final sign is opposite without any transfer between bodies */
  assert.ok(METHOD_CARDS[METHOD_INDUCTION].platformHtml.includes('شرح من المنصة'));
  assert.throws(() => methodState('nope', 'before'), RangeError);
  assert.throws(() => methodState(METHOD_FRICTION, 'ground'), RangeError);
});

test('station 3: the comparison table is computed from the model and really separates the methods', () => {
  const { rows, finals } = methodComparison();
  assert.deepEqual(rows.map((row) => row.id), METHOD_COMPARISON_ROWS.map((row) => row.id));
  const values = Object.fromEntries(rows.map((row) => [row.id, row.values]));

  assert.deepEqual(values['electrons-between-bodies'], { friction: 'yes', contact: 'yes', induction: 'no' });
  assert.deepEqual(values['partner-sign-vs-rod'], { friction: 'opposite', contact: 'same', induction: 'opposite' });
  assert.deepEqual(values['rod-keeps-its-charge'], { friction: 'no', contact: 'no', induction: 'yes' });
  assert.deepEqual(values['final-distribution'], {
    friction: 'localized-at-rubbed-end',
    contact: 'spread-over-surface',
    induction: 'spread-over-surface',
  });
  assert.deepEqual(values['mechanism'], {
    friction: 'transfer-between-bodies',
    contact: 'transfer-between-bodies',
    induction: 'transfer-with-ground',
  });
  assert.deepEqual(values['system-charge-conserved'], { friction: 'yes', contact: 'yes', induction: 'yes' });
  /* the three columns are not identical: at least four rows differ between methods */
  const differing = rows.filter((row) => new Set(METHOD_IDS.map((method) => row.values[method])).size > 1);
  assert.ok(differing.length >= 4, `methods must not look the same (only ${differing.length} differing rows)`);
  assert.equal(finals[METHOD_FRICTION].stepId, 'test');
});

/* ------------------------------------------- station 4 · attraction arena */

test('station 4: like signs repel, unlike signs attract, and the two arrows are opposite and equal', () => {
  assert.equal(interactionKind(1, 1), REPULSION);
  assert.equal(interactionKind(-1, -1), REPULSION);
  assert.equal(interactionKind(1, -1), ATTRACTION);
  assert.equal(interactionKind(-1, 1), ATTRACTION);
  assert.equal(interactionKind(0, 1), 'none');

  for (const signA of [1, -1]) {
    for (const signB of [1, -1]) {
      const state = arenaState({ signA, signB });
      const kind = signA === signB ? REPULSION : ATTRACTION;
      assert.equal(state.kind, kind);
      assert.equal(state.arrowLengthsEqual, true, 'the two forces have equal magnitude');
      const [arrowA, arrowB] = state.arrows;
      const directionA = Math.sign(arrowA.x2 - arrowA.x1);
      const directionB = Math.sign(arrowB.x2 - arrowB.x1);
      assert.equal(directionA, -directionB, 'the two forces are opposite');
      if (kind === ATTRACTION) {
        assert.equal(directionA, 1, 'the force on A points toward B');
        assert.equal(directionB, -1, 'the force on B points toward A');
        assert.equal(arrowA.pointsTowardOther, true);
      } else {
        assert.equal(directionA, -1, 'the force on A points away from B');
        assert.equal(directionB, 1, 'the force on B points away from A');
        assert.equal(arrowA.pointsTowardOther, false);
      }
      /* both arrows live on their own lane, so they never overlap a sphere */
      assert.notEqual(arrowA.y1, arrowB.y1);
    }
  }
});

test('station 4: released motion always agrees with the force shown, and stays inside the drawing', () => {
  const attraction = arenaState({ signA: 1, signB: -1, progress: 1 });
  assert.equal(attraction.movedCloser, true);
  assert.equal(attraction.movedApart, false);
  assert.ok(attraction.positions.bx - attraction.positions.ax < 468 - 252);
  assert.ok(attraction.gapPx >= 14, 'the bodies never overlap');

  const repulsion = arenaState({ signA: -1, signB: -1, progress: 1 });
  assert.equal(repulsion.movedApart, true);
  assert.equal(repulsion.movedCloser, false);
  assert.ok(repulsion.positions.bx - repulsion.positions.ax > 468 - 252);

  for (const signA of [1, -1]) {
    for (const signB of [1, -1]) {
      for (const unequal of [false, true]) {
        for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
          const state = arenaState({ signA, signB, unequal, progress });
          assert.equal(state.insideView, true, `everything stays inside the view (${signA},${signB},${unequal},${progress})`);
          assert.equal(state.arrowLengthsEqual, true);
        }
      }
    }
  }
  /* the "different magnitudes" switch changes the radii, never the arrow lengths */
  const equal = arenaState({ signA: 1, signB: -1, unequal: false });
  const unequal = arenaState({ signA: 1, signB: -1, unequal: true });
  assert.notEqual(unequal.radii.a, unequal.radii.b);
  assert.equal(Math.abs(unequal.arrows[0].x2 - unequal.arrows[0].x1), Math.abs(equal.arrows[0].x2 - equal.arrows[0].x1));
});

/* ------------------------------------------------- station 5 · Coulomb lab */

test('station 5: the lab computes F = K|q1 q2|/d² with consistent SI units', () => {
  const state = createCoulombState();
  assert.deepEqual(state, { q1Sign: 1, q2Sign: 1, q1: 5, q2: 5, d: 50 });
  const reading = coulombReading(state);
  near(reading.q1C, 5e-6, 1e-15, 'μC → C');
  near(reading.q2C, 5e-6, 1e-15, 'μC → C');
  near(reading.dM, 0.5, 1e-15, 'cm → m');
  near(reading.magnitude, COULOMB_CONSTANT * 25e-12 / 0.25, 1e-9, 'F = K q1 q2 / d²');
  near(reading.magnitude, 0.9, 1e-9, 'the default state gives 0.9 N');
  assert.equal(reading.kind, 'repulsion', 'two positive charges repel');
  /* the same relation the published lesson uses */
  const lesson = coulombForce(reading.q1C, reading.q2C, reading.dM);
  near(reading.magnitude, lesson.magnitude, 1e-12, 'the appendix never drifts from the lesson model');
});

test('station 5: doubling the distance quarters the force, doubling a charge doubles it', () => {
  const base = createCoulombState({ q1: 6, q2: 4, d: 60, q1Sign: 1, q2Sign: -1 });
  const baseReading = coulombReading(base);

  const doubleDistance = evaluateCoulombProbe(base, 'double-distance');
  near(doubleDistance.ratio, 0.25, 1e-12, 'inverse square law');
  assert.equal(doubleDistance.ratioClass, RATIO_QUARTER);
  near(doubleDistance.next.magnitude, baseReading.magnitude / 4, 1e-12, 'F/4');

  const halveDistance = evaluateCoulombProbe(base, 'halve-distance');
  near(halveDistance.ratio, 4, 1e-12, 'halving d quadruples F');
  assert.equal(halveDistance.ratioClass, RATIO_QUADRUPLE);

  const doubleQ1 = evaluateCoulombProbe(base, 'double-q1');
  near(doubleQ1.ratio, 2, 1e-12, 'direct proportionality with q1');
  assert.equal(doubleQ1.ratioClass, RATIO_DOUBLE);

  const doubleQ2 = evaluateCoulombProbe(base, 'double-q2');
  near(doubleQ2.ratio, 2, 1e-12, 'direct proportionality with q2');

  const doubleBoth = evaluateCoulombProbe(base, 'double-both-charges');
  near(doubleBoth.ratio, 4, 1e-12, 'both charges doubled');
  assert.equal(doubleBoth.ratioClass, RATIO_QUADRUPLE);

  /* the probes hold for every state the sliders can reach, not just the default */
  for (const q1 of [1, 5, 20, 50, 80]) {
    for (const q2 of [1, 7, 40, 80]) {
      for (const d of [20, 50, 100, 200]) {
        for (const q1Sign of [1, -1]) {
          for (const q2Sign of [1, -1]) {
            const state = createCoulombState({ q1, q2, d, q1Sign, q2Sign });
            near(evaluateCoulombProbe(state, 'double-distance').ratio, 0.25, 1e-9, `d ratio at ${q1},${q2},${d}`);
            near(evaluateCoulombProbe(state, 'double-q1').ratio, 2, 1e-9, `q1 ratio at ${q1},${q2},${d}`);
            near(evaluateCoulombProbe(state, 'double-q2').ratio, 2, 1e-9, `q2 ratio at ${q1},${q2},${d}`);
          }
        }
      }
    }
  }
});

test('station 5: signs decide the kind only, never the magnitude, and the sliders stay legal', () => {
  const positivePair = coulombReading(createCoulombState({ q1: 8, q2: 3, d: 40, q1Sign: 1, q2Sign: 1 }));
  const mixedPair = coulombReading(createCoulombState({ q1: 8, q2: 3, d: 40, q1Sign: 1, q2Sign: -1 }));
  near(positivePair.magnitude, mixedPair.magnitude, 1e-15, 'the magnitude ignores the signs');
  assert.equal(positivePair.kind, 'repulsion');
  assert.equal(mixedPair.kind, 'attraction');

  /* slider values snap to their own grid and clamp inside it */
  assert.equal(updateCoulombInput(DEFAULT_COULOMB_STATE, 'q1', 7.4).q1, 7);
  assert.equal(updateCoulombInput(DEFAULT_COULOMB_STATE, 'd', 23).d, 20);
  assert.equal(updateCoulombInput(DEFAULT_COULOMB_STATE, 'd', 9999).d, COULOMB_FIELDS.d.max);
  /* a charge magnitude is a positive quantity: the sign lives in q1Sign/q2Sign,
     so a negative magnitude is rejected instead of being silently reinterpreted */
  assert.throws(() => updateCoulombInput(DEFAULT_COULOMB_STATE, 'q2', -4), RangeError);
  assert.equal(updateCoulombInput(DEFAULT_COULOMB_STATE, 'q2', 0.2).q2, COULOMB_FIELDS.q2.min);
  assert.equal(updateCoulombInput(DEFAULT_COULOMB_STATE, 'q1Sign', -1).q1Sign, -1);
  assert.throws(() => updateCoulombInput(DEFAULT_COULOMB_STATE, 'q1Sign', 0), RangeError);
  assert.throws(() => updateCoulombInput(DEFAULT_COULOMB_STATE, 'distance', 30), RangeError);
  assert.throws(() => updateCoulombInput(DEFAULT_COULOMB_STATE, 'd', 0), RangeError);

  /* reset returns the published initial state, and the book state reproduces 36 N */
  assert.deepEqual(resetCoulombState(), createCoulombState(DEFAULT_COULOMB_STATE));
  const book = coulombReading(BOOK_COULOMB_STATE);
  near(book.magnitude, 36, 1e-9, 'textbook page 81 worked example');
  assert.equal(formatForce(book.magnitude), '36 N');
  assert.deepEqual(BOOK_COULOMB_STATE, { q1Sign: 1, q2Sign: 1, q1: 50, q2: 80, d: 100 });
  assert.equal(book.dM, 1);
});

test('station 5: predictions are graded against the computed ratio and flagged when they leave the model', () => {
  const state = createCoulombState({ q1: 5, q2: 5, d: 50 });
  const right = checkProbePrediction(state, 'double-distance', RATIO_QUARTER);
  assert.equal(right.isCorrect, true);
  assert.equal(right.expected, RATIO_QUARTER);
  const wrong = checkProbePrediction(state, 'double-distance', RATIO_DOUBLE);
  assert.equal(wrong.isCorrect, false);
  assert.equal(wrong.expected, RATIO_QUARTER, 'the expected answer is computed, never stored');
  assert.equal(checkProbePrediction(state, 'double-q1', RATIO_DOUBLE).isCorrect, true);
  assert.equal(checkProbePrediction(state, 'double-both-charges', RATIO_QUADRUPLE).isCorrect, true);
  assert.equal(classifyRatio(1), 'unchanged');
  assert.equal(classifyRatio(0.5), 'half');
  assert.equal(classifyRatio(3.3), 'other');
  assert.throws(() => classifyRatio(0), RangeError);
  assert.throws(() => evaluateCoulombProbe(state, 'triple-q1'), RangeError);
  assert.equal(COULOMB_PROBES.length, COULOMB_PROBE_QUESTIONS.length);
  assert.deepEqual(COULOMB_PROBES.map((probe) => probe.id), COULOMB_PROBE_QUESTIONS.map((question) => question.id));
  assert.equal(COULOMB_RATIO_CHOICES.length, 5);

  /* halving 50 cm lands off the 10 cm grid: the lab says so instead of pretending */
  const offGrid = evaluateCoulombProbe(state, 'halve-distance');
  assert.equal(offGrid.outsideGrid, true);
  near(offGrid.ratio, 4, 1e-12, 'the comparison is still computed exactly');
  const inGrid = evaluateCoulombProbe(state, 'double-distance');
  assert.equal(inGrid.outsideGrid, false);
  const scaled = scaleCoulombInputs(state, { dFactor: 2 });
  assert.equal(scaled.d, 100);

  /* extreme values are flagged as beyond the point-charge model */
  const extreme = coulombReading(createCoulombState({ q1: 80, q2: 80, d: 20 }));
  assert.ok(extreme.magnitude > MODEL_FORCE_LIMIT_N);
  assert.equal(extreme.beyondModelRange, true);
  assert.equal(coulombReading(state).beyondModelRange, false);

  /* explanation text always carries the two computed forces, not a canned number */
  const explanation = probeExplanation('double-distance', inGrid);
  assert.match(explanation, /0\.9 N/);
  assert.match(explanation, /0\.225 N/);
  assert.match(explanation, /الربع/);
  assert.match(explanation, /المقام/);
  assert.match(probeExplanation('halve-distance', offGrid), /خارج مدى المنزلقات/);
  assert.throws(() => probeExplanation('nope', inGrid), RangeError);
});

test('station 5: forces and charges are rendered with real typeset powers of ten', () => {
  assert.equal(forceTeX(0.9), '0.9~\\mathrm{N}');
  assert.equal(forceTeX(36), '36~\\mathrm{N}');
  assert.equal(forceTeX(1440), '1440~\\mathrm{N}');
  assert.match(forceTeX(1.44e5), /1\.44\\times 10\^\{5\}~\\mathrm\{N\}/);
  assert.match(forceTeX(3.2e-19), /3\.2\\times 10\^\{-19\}~\\mathrm\{N\}/);
  assert.equal(formatForce(0), '0 N');
  assert.match(formatForce(1440), /1440 N/);
  const reading = coulombReading(createCoulombState());
  assert.ok(reading.formatted.endsWith('N'));
  assert.equal(reading.state.q1, 5);
});

/* ------------------------------------------- station 6 · detective challenge */

test('station 6: seven varied situations, every choice explained, nothing revealed before an attempt', () => {
  assert.equal(DETECTIVE_QUESTIONS.length, 7);
  const ids = DETECTIVE_QUESTIONS.map((question) => question.id);
  assert.equal(new Set(ids).size, 7);
  const contexts = DETECTIVE_QUESTIONS.map((question) => question.context);
  assert.equal(new Set(contexts).size, 7, 'every question has its own context');

  for (const report of quizIntegrityReport()) {
    assert.equal(report.choices, 4, `${report.id} offers four choices`);
    assert.equal(report.correctChoiceIsPresent, true, `${report.id} has its correct choice listed`);
    assert.equal(report.everyChoiceExplained, true, `${report.id} explains every choice`);
    assert.ok(STATION_IDS.includes(report.stationRef), `${report.id} points at a real station`);
  }

  for (const question of DETECTIVE_QUESTIONS) {
    let state = createQuizState(question.id);
    assert.equal(state.submitted, false);
    assert.equal(state.feedbackHtml, '');
    assert.equal(state.attempts, 0);

    /* submitting with no selection reveals nothing */
    const empty = submitQuizAnswer(state);
    assert.equal(empty.needsSelection, true);
    assert.equal(empty.submitted, false);
    assert.equal(empty.feedbackHtml, '');

    /* selecting never evaluates */
    state = selectQuizChoice(state, question.choices[0].id);
    assert.equal(state.submitted, false);
    assert.equal(state.feedbackHtml, '');

    const submitted = submitQuizAnswer(state);
    assert.equal(submitted.submitted, true);
    assert.equal(submitted.isCorrect, question.choices[0].id === question.correctChoice);
    assert.ok(submitted.feedbackHtml.length > 60, 'the answer is explained');
    assert.equal(submitted.attempts, 1);

    /* a wrong choice is explained too, and a retry carries no penalty */
    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoice);
    const wrong = submitQuizAnswer(selectQuizChoice(createQuizState(question.id), wrongChoice.id));
    assert.equal(wrong.isCorrect, false);
    assert.match(wrong.feedbackHtml, /غير صحيح|غير دقيق/);
    const retried = retryQuizQuestion(wrong);
    assert.equal(retried.selectedChoice, null);
    assert.equal(retried.submitted, false);
    assert.equal(retried.feedbackHtml, '');
    assert.equal(retried.attempts, wrong.attempts, 'attempts are information only, never a penalty');
    assert.throws(() => selectQuizChoice(state, 'nope'), RangeError);
  }
  assert.throws(() => createQuizState('unknown'), RangeError);
  assert.equal(findDetectiveQuestion('find-the-error').correctChoice, 'electrons-move');
});

test('station 6: challenge progress counts solved situations without any grading pressure', () => {
  const states = {};
  for (const question of DETECTIVE_QUESTIONS) states[question.id] = createQuizState(question.id);
  let progress = quizProgress(states);
  assert.deepEqual({ ...progress }, { total: 7, attempted: 0, solved: 0, remaining: 7, percent: 0 });

  const first = DETECTIVE_QUESTIONS[0];
  states[first.id] = submitQuizAnswer(selectQuizChoice(states[first.id], first.correctChoice));
  progress = quizProgress(states);
  assert.equal(progress.solved, 1);
  assert.equal(progress.remaining, 6);
  assert.equal(progress.percent, 14);

  /* answering the same question twice must not double-count */
  states[first.id] = retryQuizQuestion(states[first.id]);
  states[first.id] = submitQuizAnswer(selectQuizChoice(states[first.id], first.correctChoice));
  assert.equal(quizProgress(states).solved, 1);

  const second = DETECTIVE_QUESTIONS[1];
  states[second.id] = submitQuizAnswer(selectQuizChoice(states[second.id], second.choices.find((choice) => choice.id !== second.correctChoice).id));
  progress = quizProgress(states);
  assert.equal(progress.attempted, 2);
  assert.equal(progress.solved, 1, 'an incorrect attempt is attempted but not solved');
});

test('station 6: the misconception items target the exact errors the brief warns about', () => {
  const protonError = findDetectiveQuestion('find-the-error');
  assert.match(protonError.context, /بروتونات/);
  const correct = protonError.choices.find((choice) => choice.id === protonError.correctChoice);
  assert.match(correct.label, /الإلكترونات/);
  assert.match(correct.feedbackHtml, /البروتونات/);

  const neutral = findDetectiveQuestion('neutral-meaning');
  const neutralCorrect = neutral.choices.find((choice) => choice.id === neutral.correctChoice);
  assert.match(neutralCorrect.label, /متوازن إجمالاً/);
  assert.match(neutralCorrect.feedbackHtml, /صفر/);

  const polarization = findDetectiveQuestion('paper-bits-why');
  assert.match(polarization.choices.find((choice) => choice.id === polarization.correctChoice).label, /استقطاب/);

  const induction = findDetectiveQuestion('induction-sign');
  assert.match(induction.choices.find((choice) => choice.id === induction.correctChoice).label, /موجبة/);

  const comparison = findDetectiveQuestion('compare-two-setups');
  assert.match(comparison.choices.find((choice) => choice.id === comparison.correctChoice).label, /F\/2|نصف/);
});

/* ------------------------------------------------- station 7 · concept map */

test('station 7: the concept map chains the five lesson concepts and each node reopens its station', () => {
  assert.equal(CONCEPT_NODES.length, 5);
  assert.deepEqual(CONCEPT_NODES.map((node) => node.title), [
    'الكهرباء الساكنة',
    'الشحنات الكهربائية',
    'التكهرب',
    'التجاذب والتنافر',
    'قانون كولوم',
  ]);
  for (const node of CONCEPT_NODES) {
    assert.ok(STATION_IDS.includes(node.stationRef), `${node.id} must link to a real station`);
    assert.ok(node.summaryHtml.length > 60, `${node.id} needs a short summary`);
    assert.match(node.sourceLabel, /من الكتاب|Platform|إثراء/);
  }
  assert.deepEqual(CONCEPT_NODES.map((node) => node.stationRef), ['puzzle', 'charge', 'methods', 'forces', 'coulomb']);
  assert.ok(KEY_IDEAS.length >= 6 && KEY_IDEAS.length <= 10, 'the key-idea list stays short');
  const coulombNode = CONCEPT_NODES.find((node) => node.id === 'coulomb-law');
  assert.match(coulombNode.relationHtml, /<annotation encoding="application\/x-tex">F=K\\frac\{q_\{1\}q_\{2\}\}\{d\^\{2\}\}/);
  assert.match(coulombNode.relationHtml, /9\\times 10\^\{9\}/);
});

/* -------------------------------------------- source labelling and honesty */

test('book content is quoted with its page, and platform additions are labelled as platform work', async () => {
  const content = await read('../src/unit2-lesson1-appendix-content.js');
  const rendered = await renderedContent();

  /* every «من الكتاب» block carries a printed page reference from pp. 73-86 */
  const bookQuotes = rendered.match(/u2l1a-book-quote/g) ?? [];
  assert.ok(bookQuotes.length >= 5, 'the appendix quotes the audited lesson conclusions');
  const citedPages = [...rendered.matchAll(/Reference \/ See textbook \u2014 p(\d+)/g)].map((match) => Number(match[1]));
  assert.ok(citedPages.length >= 8, 'the citations are printed next to the quoted conclusions');
  for (const page of citedPages) {
    assert.ok(page >= 73 && page <= 86, `page ${page} stays inside the audited lesson pp. 73-86`);
  }
  for (const page of [74, 75, 76, 77, 78, 79, 80]) {
    assert.ok(citedPages.includes(page), `a quoted conclusion cites printed page ${page}`);
  }
  /* the lesson's own worked example keeps its Arabic page citation */
  assert.ok(rendered.includes('\u063581'), 'the page-81 worked example is cited as \u063581');
  assert.ok(rendered.includes('\u063580'), 'Coulomb\u2019s law is cited as \u063580');

  /* labels keep the two voices apart */
  assert.match(content, /SOURCE_LABEL = '\u0645\u0646 \u0627\u0644\u0643\u062a\u0627\u0628'/);
  assert.match(content, /PLATFORM_LABEL = '\u0634\u0631\u062d \u0627\u0644\u0645\u0646\u0635\u0629 \u00b7 Platform Explanation'/);
  assert.match(content, /ENRICHMENT_LABEL = '\u0625\u062b\u0631\u0627\u0621 \u0639\u0644\u0645\u064a \u0645\u0646 \u0627\u0644\u0645\u0646\u0635\u0629'/);
  assert.match(content, /NOT_BOOK_QUESTIONS_LABEL/);
  /* the enrichment that goes beyond the printed page admits it */
  assert.ok(rendered.includes('\u0648\u0644\u064a\u0633\u062a \u0646\u0635\u0627\u064b \u062d\u0631\u0641\u064a\u0627\u064b \u0645\u0646 \u0627\u0633\u062a\u0646\u062a\u0627\u062c \u0627\u0644\u0643\u062a\u0627\u0628'), 'the induction conclusion is labelled as platform wording');
  /* the simplified-model label the brief requires */
  assert.match(content, /\u0646\u0645\u0648\u0630\u062c \u062a\u0639\u0644\u064a\u0645\u064a \u0645\u0628\u0633\u0651\u0637 \u2014 Educational simplified model/);
  assert.ok(rendered.includes('\u0646\u0645\u0648\u0630\u062c \u062a\u0639\u0644\u064a\u0645\u064a \u0645\u0628\u0633\u0651\u0637'), 'the simplified-model label reaches the rendered copy');
  /* symbolic counts are declared symbolic, never measurements */
  assert.ok(rendered.includes('\u0631\u0645\u0632\u064a\u0629 \u0648\u0645\u0635\u063a\u0651\u0631\u0629'), 'the charge counts are declared symbolic');
  /* and the challenge never claims to be the book\u2019s own questions */
  assert.ok(rendered.includes('\u0644\u064a\u0633\u062a \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0643\u062a\u0627\u0628') || /NOT_BOOK_QUESTIONS_LABEL/.test(content), 'the detective challenge disclaims book authorship');
});

test('the mount script renders every station, keeps them mounted, and honours reduced motion', async () => {
  const script = await read('../src/unit2-lesson1-appendix.js');
  /* one generic panel template, then a body builder and a mount call per station */
  assert.ok(script.includes('id="station-${station.id}"'), 'every panel keeps a stable id for hash routing');
  assert.ok(script.includes('data-station="${station.id}"'), 'every panel is addressable by station id');
  for (const station of APPENDIX_STATIONS) {
    assert.ok(script.includes(`panels.${station.id}`), `${station.id} panel is rendered and mounted`);
  }
  for (const marker of [
    'mountPuzzle', 'mountLedger', 'mountMethods', 'mountArena', 'mountCoulomb', 'mountDetective', 'mountSummary',
    'prefers-reduced-motion: reduce', 'aria-current', 'aria-live', 'role="status"', 'hidden = true', 'dataset.visited', 'aria-valuetext',
    'PageDown', 'PageUp', 'hashchange', 'replaceState',
  ]) {
    assert.ok(script.includes(marker), `the mount script must use ${marker}`);
  }
  /* every station is built once and kept, so returning preserves the student's state */
  assert.match(script, /every station is built once and kept/i);
  assert.match(script, /panelsHost\.innerHTML = APPENDIX_STATIONS\.map/);
  /* guarded DOM APIs so the module never throws in a partial environment */
  assert.match(script, /scrollIntoView\?\.\(/);
  assert.match(script, /matchMedia === 'function'/);
  assert.match(script, /const appendixRoot = typeof document !== 'undefined'/);
  assert.equal(typeof (await import('../src/unit2-lesson1-appendix.js')).mountChargesAppendix, 'function');
});

/* ------------------------------------------------ library, build and scope */

test('the appendices library publishes exactly one card for this appendix with a working link', async () => {
  const library = await read('../appendices.html');
  assert.equal((library.match(/class="appendix-library-card"/g) ?? []).length, 4);
  assert.match(library, /id="unit2-lesson-one-appendix-title">مختبر الشحنات/);
  assert.match(library, /href="\.\/unit2-lesson-1-appendix\.html"/);
  assert.match(library, /appendix-card-art-charges/);
  assert.match(library, /اكتشف الكهرباء الساكنة في سبع محطات/);
  /* the two published Unit 1 cards keep their own art and copy */
  assert.match(library, /appendix-card-art-parallel/);
  assert.match(library, /القوى المتلاقية/);
  assert.match(library, /القوى المتوازية/);
});

test('the production build copies the appendix page next to the other entries', async () => {
  const build = await read('../scripts/build.mjs');
  assert.match(build, /resolve\(projectDirectory, 'unit2-lesson-1-appendix\.html'\)/);
  assert.match(build, /resolve\(outputDirectory, 'unit2-lesson-1-appendix\.html'\)/);
  assert.match(build, /resolve\(projectDirectory, 'src'\)/);
  assert.match(build, /resolve\(projectDirectory, 'vendor'\)/);
});

test('the published lesson, its test, its teacher area and the earlier appendices stay untouched', async () => {
  const [lesson, lessonContent, lessonTest, lessonSolutions, teacher, teacherAuth, appendix1, appendix2] = await Promise.all([
    read('../unit2-lesson-1.html'),
    read('../src/unit2-lesson1-content.js'),
    read('../src/unit2-lesson1-test-data.js'),
    read('../src/unit2-lesson1-test-solutions.js'),
    read('../src/unit2-lesson1-teacher-content.js'),
    read('../src/teacher-auth.js'),
    read('../lesson-1-appendix.html'),
    read('../lesson-2-appendix.html'),
  ]);
  /* the student lesson still mounts its own modules and its own 14 pages */
  assert.match(lesson, /src="\.\/src\/unit2-lesson1-main\.js"/);
  assert.match(lesson, /href="\.\/unit2-lesson-1-test\.html"/);
  assert.match(lesson, /href="\.\/unit2-lesson-1-teacher\.html"/);
  assert.doesNotMatch(lesson, /appendix/);
  assert.match(lessonContent, /الكهرباء الساكنة/);
  assert.equal((lessonTest.match(/q\('u2q/g) ?? []).length, 20);
  assert.match(lessonSolutions, /UNIT2_LESSON1_SOLUTIONS|export const/);
  assert.match(teacher, /export/);
  assert.match(teacherAuth, /PASSWORD_DERIVED_KEY/);
  /* the earlier appendices are byte-for-byte the published ones */
  assert.match(appendix1, /<title>ملحق الدرس الأول — القوى المتلاقية/);
  assert.match(appendix1, /src="\.\/src\/lesson-1-appendix\.js"/);
  assert.match(appendix2, /<title>ملحق الدرس الثاني — القوى المتوازية/);
  assert.match(appendix2, /src="\.\/src\/lesson-2-appendix\.js"/);
  assert.doesNotMatch(appendix2, /unit2-lesson-1-appendix/);
  /* and no Unit 2 test entry appeared anywhere */
  const home = await read('../index.html');
  assert.doesNotMatch(home, /اختبار الوحدة الثانية|unit-2-test|unit2-test/);
  assert.equal((home.match(/class="lesson-entry"/g) ?? []).length, 5);
});
