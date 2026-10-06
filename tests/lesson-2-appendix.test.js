import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { BOOK_SCOPE, BOOK_CASES, BOOK_WORKED_EXAMPLE, CHALLENGES, DEFAULT_PRESET_ID, LAB_PRESETS, PLATFORM_CONCEPTS, PRESET_BY_ID, findChallenge, findPreset } from '../src/lesson-2-appendix-content.js';
import {
  DEFAULT_LAB_STATE,
  LAB_FIELDS,
  LAB_FORCE_MAX_N,
  LAB_FORCE_MIN_N,
  LAB_FORCE_STEP_N,
  LAB_POSITION_MAX_CM,
  LAB_POSITION_MIN_CM,
  LAB_POSITION_STEP_CM,
  MIN_SEPARATION_CM,
  OPPOSITE_SENSE,
  RESULT_COUPLE,
  RESULT_SINGLE,
  ROD_LENGTH_CM,
  SAME_SENSE,
  createLabState,
  evaluateChallenge,
  parallelResultant,
  resultantDistanceFromLargerForce,
  updateLabInput,
} from '../src/lesson-2-appendix-physics.js';
import { oppositeSenseParallelResultant, sameSenseParallelResultant } from '../src/lesson-2-physics.js';
import { UNIT_1_QUESTIONS } from '../src/unit-1-test-data.js';
import { LESSON_2_QUESTIONS } from '../src/lesson-2-test-data.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const near = (actual, expected, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected} by more than ${tolerance}`);
};
const sliderValue = (html, id) => {
  const match = html.match(new RegExp(`<input id="${id}"[^>]*>`));
  assert.ok(match, `expected a slider with id ${id}`);
  const attribute = (name) => {
    const found = match[0].match(new RegExp(`${name}="([^"]+)"`));
    assert.ok(found, `expected ${id} to declare ${name}`);
    return Number(found[1]);
  };
  return { min: attribute('min'), max: attribute('max'), step: attribute('step'), value: attribute('value'), tag: match[0] };
};
const allLabStates = () => {
  const forces = [];
  for (let value = LAB_FORCE_MIN_N; value <= LAB_FORCE_MAX_N; value += LAB_FORCE_STEP_N) forces.push(value);
  const positions = [];
  for (let value = LAB_POSITION_MIN_CM; value <= LAB_POSITION_MAX_CM; value += LAB_POSITION_STEP_CM) positions.push(value);
  const states = [];
  for (const mode of [SAME_SENSE, OPPOSITE_SENSE]) {
    for (const force1 of forces) {
      for (const force2 of forces) {
        for (const position1 of positions) {
          for (const position2 of positions) {
            const state = createLabState({ mode, force1, force2, position1, position2 });
            const untouched = state.mode === mode && state.force1 === force1 && state.force2 === force2
              && state.position1 === position1 && state.position2 === position2;
            if (untouched) states.push(state);
          }
        }
      }
    }
  }
  return states;
};

/* ----------------------------------------------------------- the page --- */

test('the Lesson 2 appendix is a standalone RTL page with its own KaTeX lab and no Lesson 3', async () => {
  assert.equal(existsSync(new URL('../lesson-2-appendix.html', import.meta.url)), true);
  const page = await read('../lesson-2-appendix.html');
  assert.match(page, /<html lang="ar" dir="rtl">/);
  assert.match(page, /<title>ملحق الدرس الثاني — القوى المتوازية/);
  assert.match(page, /href="\.\/src\/fonts\.css"/);
  assert.match(page, /href="\.\/vendor\/katex\/katex\.min\.css"/);
  assert.match(page, /href="\.\/src\/styles\.css"/);
  assert.match(page, /href="\.\/src\/lesson-2-appendix\.css"/);
  assert.match(page, /src="\.\/src\/lesson-2-appendix\.js"/);
  assert.match(page, /<main id="appendix-main" data-lesson-2-appendix>/);
  assert.match(page, /id="parallel-lab"/);
  assert.doesNotMatch(page, /lesson-3|الدرس 3|الوحدة الثانية|lesson-2-test-data|unit-2/);
});

test('the appendix states that it is an appendix of Lesson 2 and keeps every return path', async () => {
  const page = await read('../lesson-2-appendix.html');
  assert.match(page, /<h1 id="appendix-title">ملحق الدرس الثاني<\/h1>/);
  assert.match(page, /<p class="appendix-hero-subtitle">القوى المتوازية<\/p>/);
  assert.match(page, /ملحق تفاعلي — <bdi dir="ltr">Platform Extension<\/bdi>/);
  assert.match(page, /ليس درساً جديداً/);
  assert.match(page, /<span dir="ltr">LAB 02<\/span><span>ملحق الدرس 2<\/span>/);
  const breadcrumb = page.match(/<nav class="appendix-breadcrumb"[^]*?<\/nav>/);
  assert.ok(breadcrumb, 'the appendix keeps the shared breadcrumb');
  assert.match(breadcrumb[0], /href="\.\/">الرئيسية<\/a>/);
  assert.match(breadcrumb[0], /href="\.\/appendices\.html">ملحقات الدروس<\/a>/);
  assert.match(breadcrumb[0], /<span aria-current="page">ملحق الدرس الثاني<\/span>/);
  assert.match(page, /href="\.\/appendices\.html">العودة إلى ملحقات الدروس<\/a>/);
  assert.match(page, /<a [^>]*href="\.\/lesson-2\.html">مراجعة الدرس الثاني/);
  assert.match(page, /<footer class="appendix-footer">[^]*?href="\.\/appendices\.html"/);
  assert.match(page, /<noscript>[^]*?href="\.\/lesson-2\.html"/);
});

test('the lab ships both sense cases, four labelled sliders within the model bounds, reset and live status', async () => {
  const page = await read('../lesson-2-appendix.html');
  assert.match(page, /<input type="radio" name="parallel-sense-mode" value="same" data-lab-mode checked \/>/);
  assert.match(page, /<input type="radio" name="parallel-sense-mode" value="opposite" data-lab-mode \/>/);
  assert.match(page, /القوتان إلى الأعلى/);
  assert.match(page, /الأولى إلى الأعلى والثانية إلى الأسفل/);

  const expectations = {
    'force-1-magnitude': ['force1', DEFAULT_LAB_STATE.force1],
    'force-2-magnitude': ['force2', DEFAULT_LAB_STATE.force2],
    'force-1-position': ['position1', DEFAULT_LAB_STATE.position1],
    'force-2-position': ['position2', DEFAULT_LAB_STATE.position2],
  };
  for (const [id, [field, initial]] of Object.entries(expectations)) {
    const slider = sliderValue(page, id);
    assert.equal(slider.min, LAB_FIELDS[field].min, `${id} min must follow the model`);
    assert.equal(slider.max, LAB_FIELDS[field].max, `${id} max must follow the model`);
    assert.equal(slider.step, LAB_FIELDS[field].step, `${id} step must follow the model`);
    assert.equal(slider.value, initial, `${id} must open on the default state`);
    assert.match(slider.tag, /data-lab-input="[a-z0-9]+"/);
    assert.match(slider.tag, /aria-valuetext="[^"]*"/);
    assert.match(slider.tag, /aria-describedby="[^"]+"/);
  }
  const outputIds = {
    force1: 'force-1-magnitude-output',
    force2: 'force-2-magnitude-output',
    position1: 'force-1-position-output',
    position2: 'force-2-position-output',
  };
  for (const field of Object.keys(LAB_FIELDS)) {
    assert.ok(page.includes(`data-lab-input="${field}"`), `the page must wire the ${field} control`);
    assert.ok(page.includes(`<output id="${outputIds[field]}" for="`), `${field} needs its own labelled output`);
  }
  assert.match(page, /<output id="result-magnitude"/);
  assert.match(page, /<output id="result-sense"/);
  assert.match(page, /<output id="result-position"/);
  assert.match(page, /<output id="result-distance-1"/);
  assert.match(page, /<output id="result-distance-2"/);
  assert.match(page, /<output id="result-moments"/);
  assert.match(page, /id="reset-lab"/);
  assert.match(page, /id="sweep-lab"[^>]*aria-describedby="sweep-help"/);
  assert.match(page, /id="lab-status" role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(page, /id="live-observation"/);
  assert.match(page, /<figcaption>/);
  assert.match(page, /role="img" aria-labelledby="parallel-diagram-title parallel-diagram-desc"/);
  assert.match(page, /<title id="parallel-diagram-title">[^<]+<\/title>/);
  assert.match(page, /<desc id="parallel-diagram-desc">[^<]+<\/desc>/);
});

test('the appendix separates «من الكتاب» from «Platform Explanation» and keeps the simplified-model label', async () => {
  const page = await read('../lesson-2-appendix.html');
  assert.match(page, /<h2 id="book-source-heading">من الكتاب — صفحات 63–70<\/h2>/);
  assert.match(page, /من الكتاب · الصفحات 64–69/);
  assert.match(page, /هذه البطاقات من إعداد المنصة، وتشرح ما يظهر في المختبر؛ وهي ليست نصاً إضافياً في الكتاب\./);
  assert.match(page, /<bdi dir="ltr">Platform Explanation<\/bdi>/);
  assert.match(page, /<strong>Educational simplified model<\/strong>/);
  assert.match(page, /id="book-definition"/);
  assert.match(page, /id="book-cases"/);
  assert.match(page, /id="platform-concepts"/);
  assert.match(page, /id="book-example"/);
  assert.match(page, /id="live-equations"/);
  assert.match(page, /id="summary-equations"/);
  assert.match(page, /id="challenge-list"/);
  assert.match(page, /id="preset-buttons" role="group"/);
  assert.match(page, /id="parallel-legend" role="group"/);
});

/* ------------------------------------------------------------ physics --- */

test('same-sense parallel forces add up and place the carrier closer to the larger force', () => {
  const book = parallelResultant({ mode: SAME_SENSE, force1: 20, force2: 30, position1: 0, position2: 50 });
  assert.equal(book.kind, RESULT_SINGLE);
  near(book.magnitude, 50);
  near(book.resultantPosition, 30);
  near(book.distanceFromForce1, 30);
  near(book.distanceFromForce2, 20);
  near(book.moments.first, 600);
  near(book.moments.second, 600);
  assert.equal(book.moments.balanced, true);
  assert.equal(book.sense, 1);
  assert.equal(book.largestForce, 2);

  const third = parallelResultant({ mode: SAME_SENSE, force1: 20, force2: 60, position1: 20, position2: 50 });
  near(third.magnitude, 80);
  near(third.resultantPosition, 42.5);
  assert.ok(third.distanceFromForce2 < third.distanceFromForce1, 'the carrier sits closer to the larger force');
  assert.ok(resultantDistanceFromLargerForce(third) < MIN_SEPARATION_CM * 2);
});

test('opposite-sense parallel forces subtract and put the carrier outside the segment on the larger side', () => {
  const heavierSecond = parallelResultant({ mode: OPPOSITE_SENSE, force1: 20, force2: 80, position1: 20, position2: 60 });
  near(heavierSecond.magnitude, 60);
  assert.equal(heavierSecond.sense, -1, 'the resultant follows the larger, downward force');
  assert.equal(heavierSecond.largestForce, 2);
  assert.ok(heavierSecond.resultantPosition > 60, 'the carrier is beyond B');
  near(heavierSecond.resultantPosition, 73.333333333, 1e-6);
  near(heavierSecond.moments.first, heavierSecond.moments.second, 1e-6);
  assert.equal(heavierSecond.couple, null);

  const heavierFirst = parallelResultant({ mode: OPPOSITE_SENSE, force1: 80, force2: 20, position1: 20, position2: 60 });
  assert.equal(heavierFirst.sense, 1);
  assert.ok(heavierFirst.resultantPosition < 20, 'the carrier is on the other extension, beyond A');

  /* The textbook's own application (200 N and 300 N over 60 cm) is quoted in
   * the appendix; the sliders stay inside the lesson-relevant 5–80 N range, and
   * both cases are delegated to the lesson model. */
  const bookCase = oppositeSenseParallelResultant(200, 300, 60);
  near(bookCase.magnitude, 100);
  near(bookCase.position, 180);
  near(bookCase.distanceFromF2, 120);
  assert.equal(LAB_FORCE_MIN_N, 5);
  assert.equal(LAB_FORCE_MAX_N, 80);
});

test('the equal-and-opposite case is zero force with a rotational effect and no single carrier', () => {
  const couple = parallelResultant({ mode: OPPOSITE_SENSE, force1: 20, force2: 20, position1: 10, position2: 50 });
  assert.equal(couple.kind, RESULT_COUPLE);
  assert.equal(couple.magnitude, 0);
  assert.equal(couple.sense, 0);
  assert.equal(couple.resultantPosition, null);
  assert.equal(couple.distanceFromForce1, null);
  assert.equal(couple.distanceFromForce2, null);
  assert.equal(couple.moments.balanced, false);
  assert.equal(couple.couple.netForce, 0);
  near(couple.couple.moment, 800, 1e-9);
  assert.equal(couple.couple.separation, MIN_SEPARATION_CM * 4);
});

test('the appendix delegates both textbook cases to the lesson model instead of re-deriving them', () => {
  const same = parallelResultant({ mode: SAME_SENSE, force1: 20, force2: 30, position1: 5, position2: 55 });
  const lessonSame = sameSenseParallelResultant(20, 30, 50);
  near(same.magnitude, lessonSame.magnitude);
  near(same.resultantPosition - 5, lessonSame.position);
  near(same.distanceFromForce2, lessonSame.distanceFromF2);

  const opposite = parallelResultant({ mode: OPPOSITE_SENSE, force1: 20, force2: 80, position1: 15, position2: 55 });
  const lessonOpposite = oppositeSenseParallelResultant(20, 80, 40);
  near(opposite.magnitude, lessonOpposite.magnitude);
  near(opposite.sense, lessonOpposite.sense);
  near(opposite.resultantPosition - 15, lessonOpposite.position);

  const balanced = parallelResultant({ mode: OPPOSITE_SENSE, force1: 45, force2: 45, position1: 5, position2: 55 });
  assert.equal(balanced.kind, RESULT_COUPLE);
  assert.equal(oppositeSenseParallelResultant(45, 45, 50).hasFiniteResultant, false);
});

test('slider values snap to the grid, stay inside the rod, and never let the two carriers merge', () => {
  assert.equal(ROD_LENGTH_CM, 60);
  assert.equal(MIN_SEPARATION_CM, 10);
  assert.deepEqual(createLabState({ position1: 60, position2: 10 }), { mode: SAME_SENSE, force1: 20, force2: 30, position1: 50, position2: 60 });
  assert.equal(updateLabInput(createLabState({}), 'position2', 5).position2, MIN_SEPARATION_CM);
  assert.equal(updateLabInput(createLabState({ position2: 60 }), 'position1', 60).position1, 50);
  assert.equal(updateLabInput(createLabState({}), 'force1', 0).force1, LAB_FORCE_MIN_N);
  assert.equal(updateLabInput(createLabState({}), 'force1', 999).force1, LAB_FORCE_MAX_N);
  assert.equal(updateLabInput(createLabState({}), 'force2', 33).force2, 35, 'values snap to the 5 N grid');
  assert.equal(updateLabInput(createLabState({}), 'position1', 33).position1, 35, 'positions snap to the 5 cm grid');
  assert.equal(updateLabInput(createLabState({}), 'mode', OPPOSITE_SENSE).mode, OPPOSITE_SENSE);
  assert.throws(() => updateLabInput(createLabState({}), 'unknown', 1), RangeError);
  assert.throws(() => parallelResultant({ mode: 'sideways', force1: 10, force2: 10, position1: 0, position2: 20 }), RangeError);
  for (const state of allLabStates()) {
    assert.ok(state.position2 - state.position1 >= MIN_SEPARATION_CM, 'carriers always stay apart');
    assert.ok(state.position1 >= LAB_POSITION_MIN_CM && state.position2 <= LAB_POSITION_MAX_CM);
  }
});

/* ------------------------------------------------------------ presets --- */

test('every authored preset is a legal slider state whose printed numbers match the model', () => {
  assert.equal(LAB_PRESETS.length, 5);
  assert.equal(DEFAULT_PRESET_ID, 'book-example');
  assert.equal(new Set(LAB_PRESETS.map((preset) => preset.id)).size, LAB_PRESETS.length);
  for (const preset of LAB_PRESETS) {
    assert.ok(preset.title.trim() && preset.badge.trim() && preset.observation.trim() && preset.prediction.trim(), `${preset.id} needs a title, badge and prompt`);
    assert.equal(/[₀-₉×↑↓]/.test(preset.badge), false, `${preset.id} must keep symbols out of its Arabic badge`);
    assert.deepEqual(createLabState(preset.state), preset.state, `${preset.id} must already be a legal slider state`);
    assert.equal(findPreset(preset.id), preset);
    assert.equal(PRESET_BY_ID.get(preset.id), preset);
  }

  const book = parallelResultant(findPreset('book-example').state);
  near(book.magnitude, 50);
  near(book.resultantPosition, 30);
  near(book.distanceFromForce2, 20);
  assert.notEqual(findPreset('book-example').state.position2, BOOK_WORKED_EXAMPLE.labState.position2 + 1);

  const far = parallelResultant(findPreset('same-sense-far-carriers').state);
  near(far.magnitude, 80);
  near(far.resultantPosition, 45);

  const closer = parallelResultant(findPreset('closer-to-larger').state);
  assert.ok(resultantDistanceFromLargerForce(closer) < 1, 'the carrier sits right next to the 80 N force');

  const opposite = parallelResultant(findPreset('opposite-sense').state);
  assert.equal(opposite.mode, OPPOSITE_SENSE);
  assert.equal(opposite.sense, -1);
  assert.ok(opposite.resultantPosition > ROD_LENGTH_CM);

  const couple = parallelResultant(findPreset('equal-opposite').state);
  assert.equal(couple.kind, RESULT_COUPLE);

  assert.equal(findPreset('missing-preset'), null);
});

test('the textbook application is reproduced with its own values and stays loadable in the lab', () => {
  assert.equal(BOOK_WORKED_EXAMPLE.id, 'book-example-p66');
  assert.deepEqual(BOOK_WORKED_EXAMPLE.labState, findPreset(DEFAULT_PRESET_ID).state);
  assert.match(BOOK_WORKED_EXAMPLE.source, /p66/);
  const html = BOOK_WORKED_EXAMPLE.steps.map((step) => step.html).join('');
  for (const value of ['20', '30', '50', '0.2', '\\mathrm{N}', '\\mathrm{m}']) {
    assert.ok(html.includes(value), `the textbook application must keep ${value}`);
  }
  assert.match(html, /<annotation encoding="application\/x-tex">/);
  const result = parallelResultant(BOOK_WORKED_EXAMPLE.labState);
  near(result.magnitude, 50);
  near(result.resultantPosition, 30);
  near(result.distanceFromForce2, 20, 1e-9);
  assert.deepEqual(createLabState(BOOK_WORKED_EXAMPLE.labState), { ...BOOK_WORKED_EXAMPLE.labState });
});

test('both textbook cases are quoted with their source pages and their exact relations', () => {
  assert.equal(BOOK_CASES.length, 2);
  const same = BOOK_CASES.find((item) => item.mode === SAME_SENSE);
  const opposite = BOOK_CASES.find((item) => item.mode === OPPOSITE_SENSE);
  assert.ok(same && opposite);
  assert.match(BOOK_SCOPE.pages, /63–70/);
  assert.equal(BOOK_SCOPE.relationTex, 'F_{1}\\times d_{1}=F_{2}\\times d_{2}');
  for (const item of BOOK_CASES) {
    assert.match(item.source, /p6[0-9]/);
    const html = item.elements.map((element) => element.html).join('') + item.proportional.join('');
    assert.match(html, /class="math math-inline" dir="ltr" role="math"/);
    assert.ok(html.includes('<annotation encoding="application/x-tex">F_{1}\\times d_{1}=F_{2}\\times d_{2}</annotation>'), 'both cases keep the moment relation');
    assert.ok(html.includes('<annotation encoding="application/x-tex">\\vec{F}_{1}</annotation>'), 'vectors are KaTeX accents over the right symbol, not pasted Unicode');
  }
  assert.match(same.elements.map((element) => element.html).join(''), /F=F_\{1\}\+F_\{2\}/);
  assert.match(opposite.elements.map((element) => element.html).join(''), /F=F_\{2\}-F_\{1\}/);
  for (const item of BOOK_CASES) {
    assert.match(item.badgeTex, /^F_\{1\}/, 'the case badge starts from the first force');
    assert.match(item.badgeTex, /\\uparrow|\\downarrow/, 'direction is typeset, never a pasted arrow glyph');
    assert.ok(item.badgeLabel.trim(), 'the badge carries a spoken label');
    assert.equal(/[₀-₉×↑↓]/.test(item.badgeTex + item.badgeLabel), false, 'badges stay free of Unicode symbols');
  }
  assert.match(same.badgeTex, /\\uparrow\\quad F_\{2\}\\!\\uparrow/);
  assert.match(opposite.badgeTex, /\\uparrow\\quad F_\{2\}\\!\\downarrow/);
});

/* ----------------------------------------------------- platform voice --- */

test('platform explanations stay labelled, derive the carrier position, and cover the zero-resultant case', () => {
  assert.ok(PLATFORM_CONCEPTS.length >= 6);
  const ids = PLATFORM_CONCEPTS.map((concept) => concept.id);
  for (const required of ['magnitude', 'distances', 'position', 'link', 'opposite', 'zero', 'model']) {
    assert.ok(ids.includes(required), `missing platform explanation: ${required}`);
  }
  const byId = Object.fromEntries(PLATFORM_CONCEPTS.map((concept) => [concept.id, concept]));
  assert.ok(byId.zero.paragraphs.join(' ').includes('F\\times d') || byId.zero.paragraphs.join(' ').includes('F\\times d'), 'the zero case explains the rotational effect');
  assert.match(byId.zero.note, /صفحة 67|ص 67/);
  assert.match(byId.position.note, /اشتقاق من المنصة/);
  assert.match(byId.model.paragraphs.join(' '), /Educational simplified model/);
  const equations = PLATFORM_CONCEPTS.flatMap((concept) => concept.equations ?? []).join('');
  assert.match(equations, /x_\{C\}=\\frac\{F_\{1\}x_\{1\}\+F_\{2\}x_\{2\}\}\{F_\{1\}\+F_\{2\}\}/);
  assert.match(equations, /x_\{C\}=\\frac\{F_\{1\}x_\{1\}-F_\{2\}x_\{2\}\}\{F_\{1\}-F_\{2\}\}/);
  assert.equal(equations.includes('⃗'), false);
});

/* ---------------------------------------------------------- challenges --- */

test('the four challenges are authored, start unsolved, and lock only real controls', () => {
  assert.equal(CHALLENGES.length, 4);
  for (const challenge of CHALLENGES) {
    assert.ok(challenge.index && challenge.title && challenge.brief && challenge.hint);
    assert.ok(challenge.startObservation && challenge.successNote);
    assert.ok([SAME_SENSE, OPPOSITE_SENSE].includes(challenge.mode));
    assert.equal(findChallenge(challenge.id), challenge);
    assert.deepEqual(createLabState(challenge.startState), challenge.startState, `${challenge.id} must start from a legal state`);
    assert.equal(evaluateChallenge(challenge, challenge.startState, challenge.startState).complete, false, `${challenge.id} must not start solved`);
    for (const lock of challenge.locks) assert.ok(Object.hasOwn(LAB_FIELDS, lock), `${challenge.id} locks an unknown field: ${lock}`);
  }
  const watched = findChallenge('change-one-force');
  assert.deepEqual([...watched.locks].sort(), ['force1', 'position1', 'position2'].sort());
  assert.equal(watched.target.type, 'increase-and-observe');
  assert.equal(watched.target.deltaN, 20);
});

test('every numeric challenge target is reachable inside the real slider grid', () => {
  const states = allLabStates();
  assert.ok(states.length > 30000, 'the reachability proof must span the whole slider grid');
  for (const challenge of CHALLENGES) {
    if (challenge.target.type === 'increase-and-observe') {
      const start = createLabState(challenge.startState);
      let solution = null;
      for (let force2 = LAB_FORCE_MIN_N; force2 <= LAB_FORCE_MAX_N && !solution; force2 += LAB_FORCE_STEP_N) {
        const attempt = createLabState({ ...start, force2 });
        if (evaluateChallenge(challenge, attempt, start).complete) solution = attempt;
      }
      assert.ok(solution, `${challenge.id} must be reachable by changing only its own control`);
      continue;
    }
    const solution = states.find((state) => evaluateChallenge(challenge, state, null).complete);
    assert.ok(solution, `${challenge.id} target must be reachable with the sliders`);
  }
});

test('challenges verify honestly: impossible states are rejected with a teaching message', () => {
  const nearest = findChallenge('near-the-larger');
  const equal = parallelResultant({ mode: SAME_SENSE, force1: 20, force2: 20, position1: 0, position2: 50 });
  const rejected = evaluateChallenge(nearest, equal, null);
  assert.equal(rejected.complete, false);
  assert.equal(rejected.missing, 'difference');
  assert.ok(rejected.message.length > 20);
  const accepted = evaluateChallenge(nearest, { mode: SAME_SENSE, force1: 5, force2: 80, position1: 50, position2: 60 }, null);
  assert.equal(accepted.complete, true);

  const coupleChallenge = findChallenge('equal-opposite');
  assert.equal(evaluateChallenge(coupleChallenge, { mode: OPPOSITE_SENSE, force1: 40, force2: 20, position1: 20, position2: 60 }, null).complete, false);
  assert.equal(evaluateChallenge(coupleChallenge, { mode: OPPOSITE_SENSE, force1: 20, force2: 20, position1: 20, position2: 60 }, null).complete, true);
  assert.equal(evaluateChallenge(coupleChallenge, { mode: SAME_SENSE, force1: 20, force2: 20, position1: 20, position2: 60 }, null).missing, 'mode');

  const target = findChallenge('target-point');
  assert.equal(evaluateChallenge(target, { mode: SAME_SENSE, force1: 20, force2: 30, position1: 0, position2: 50 }, null).complete, false);
  assert.equal(evaluateChallenge(target, { mode: SAME_SENSE, force1: 20, force2: 20, position1: 30, position2: 60 }, null).complete, true);
  assert.throws(() => evaluateChallenge({ target: { type: 'unknown' } }, createLabState({}), null), RangeError);
});

/* ----------------------------------------------------- rendering rules --- */

test('every equation in the appendix is produced by the shared KaTeX layer with LTR isolation', async () => {
  const html = [
    BOOK_SCOPE.relationHtml,
    ...BOOK_CASES.flatMap((item) => item.proportional),
    ...BOOK_WORKED_EXAMPLE.steps.map((step) => step.html),
    ...PLATFORM_CONCEPTS.flatMap((concept) => concept.equations ?? []),
  ].join('');
  assert.match(html, /class="math math-display equation" dir="ltr" role="math"/);
  assert.ok(html.includes('<annotation encoding="application/x-tex">F_{1}\\times d_{1}=F_{2}\\times d_{2}</annotation>'));
  assert.equal(html.includes('₁'), false, 'subscripts must be typeset, never Unicode');
  /* The rendered equations do contain the real × glyph, because KaTeX typesets
   * \\times; the authored markup must not paste it directly. */
  assert.ok(html.includes('<annotation encoding="application/x-tex">\\times</annotation>')
    || /F_\{1\}\\times d_\{1\}/.test(html), 'multiplication comes from KaTeX');

  const page = await read('../lesson-2-appendix.html');
  assert.equal(page.includes('₁') || page.includes('₂'), false, 'the page typesets subscripts instead of pasting them');
  assert.equal(page.includes('×'), false, 'the page never pastes the multiplication sign');
  const slots = page.match(/data-tex="[^"]+"/g) ?? [];
  assert.equal(slots.length, 11, 'every body symbol in the markup is a KaTeX slot');
  assert.equal(slots.filter((slot) => /\\(times|vec)|_\{/.test(slot)).length, slots.length, 'slots carry TeX source, not plain text');

  const [source, content] = await Promise.all([read('../src/lesson-2-appendix.js'), read('../src/lesson-2-appendix-content.js')]);
  assert.match(source, /import \{ formula, qty, scalar, tex, vector \} from '\.\/math\.js';/);
  assert.match(source, /<bdi dir="ltr">/);
  for (const [name, text] of [['module', source], ['content', content]]) {
    assert.ok(text.includes('\\times'), `the ${name} must multiply with \\times`);
    assert.equal(text.includes('×'), false, `the ${name} must not use the Unicode multiplication sign`);
    assert.equal(text.includes('⃗'), false, `the ${name} must not paste combining vector arrows`);
    assert.equal(text.includes('white-space'), false, `the ${name} must not work around layout with inline nowrap`);
  }
});

test('the appendix stylesheet keeps focus, LTR-safe numbers, line-style differentiation and reduced motion', async () => {
  const css = await read('../src/lesson-2-appendix.css');
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 1120px\)/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.parallel-resultant-layer \{ transition-duration: 0\.01ms !important; \}/);
  assert.match(css, /\.parallel-carrier-2 \{ stroke-dasharray: 2 6; \}/, 'the second carrier is distinguishable without colour');
  assert.match(css, /\.parallel-challenge-status\[data-complete='true'\]/);
  assert.match(css, /\.katex-display \{ overflow-x: auto; overflow-y: hidden; \}/);
  assert.equal(/white-space:\s*nowrap/.test(css), false, 'no global nowrap workaround for mathematics');
  assert.equal(/color:\s*red|#f00/.test(css), false);
});

test('the live panel, legend and diagram are wired to the same ids the module renders into', async () => {
  const [page, script] = await Promise.all([read('../lesson-2-appendix.html'), read('../src/lesson-2-appendix.js')]);
  const ids = ['carrier-layer', 'distance-layer', 'force-layer', 'zero-layer', 'edge-layer', 'point-layer', 'resultant-layer', 'resultant-vector', 'resultant-point', 'resultant-tag', 'parallel-legend', 'parallel-diagram-desc', 'live-equations', 'live-observation', 'lab-status', 'preset-buttons', 'preset-observation', 'challenge-list', 'book-definition', 'book-cases', 'platform-concepts', 'book-example', 'summary-equations'];
  for (const id of ids) {
    assert.ok(page.includes(`id="${id}"`), `the page must contain #${id}`);
    assert.ok(script.includes(`'${id}'`), `the module must reference #${id}`);
  }
  assert.ok(script.includes("'#load-book-example'"), 'the module renders the button that loads the textbook state');
  assert.match(script, /id="load-book-example"/);
  for (const button of ['data-challenge-start', 'data-challenge-check', 'data-challenge-reset', 'data-challenge-status', 'data-preset-id', 'data-lab-input', 'data-lab-mode']) {
    assert.ok(script.includes(button), `the module must render ${button}`);
  }
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(script, /matchMedia/);
  assert.match(script, /addEventListener\?\.\('change'/);
  assert.match(page, /<bdi dir="ltr">20 N<\/bdi>/);
});

/* ------------------------------------------------------- regressions ---- */

test('the published Lesson 1 appendix, Lesson 2, and the tests of both lessons are untouched', async () => {
  const [lesson1Appendix, lesson2, library, home] = await Promise.all([
    read('../lesson-1-appendix.html'), read('../lesson-2.html'), read('../appendices.html'), read('../index.html'),
  ]);
  assert.match(lesson1Appendix, /<title>ملحق الدرس الأول — القوى المتلاقية/);
  assert.match(lesson1Appendix, /src="\.\/src\/lesson-1-appendix\.js"/);
  assert.match(lesson1Appendix, /href="\.\/src\/lesson-1-appendix\.css"/);
  assert.match(lesson1Appendix, /id="force-diagram"[^]*role="img"/);
  assert.match(lesson1Appendix, /id="start-challenge"/);
  assert.match(lesson1Appendix, /href="\.\/appendices\.html"/);
  assert.equal(lesson1Appendix.includes('lesson-2-appendix'), false);

  assert.match(lesson2, /src="\.\/src\/lesson-2-main\.js"/);
  assert.match(lesson2, /href="\.\/lesson-2-test\.html"/);
  assert.ok(lesson2.includes('ص 63–70'));
  assert.equal(lesson2.includes('appendix'), false, 'Lesson 2 stays exactly as published');

  assert.match(library, /href="\.\/lesson-1-appendix\.html"/);
  assert.match(library, /href="\.\/lesson-2-appendix\.html"/);
  assert.equal((library.match(/class="appendix-library-card"/g) ?? []).length, 2);

  assert.equal((home.match(/class="lesson-entry"/g) ?? []).length, 2);
  assert.match(home, /<section class="appendices-home-entry"[^]*?href="\.\/appendices\.html"/);
  assert.equal((home.match(/lesson-2-appendix/g) ?? []).length, 0, 'Course Home is unchanged and reaches both appendices through the library');
  assert.equal(LESSON_2_QUESTIONS.length, 20);
  assert.equal(UNIT_1_QUESTIONS.length, 60);
});
