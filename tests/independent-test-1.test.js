/* ============================================================================
   Independent Test 1 — automated coverage.
   These are behavioural checks: they grade real answers through the shared
   engine, verify the answer key against independently computed values, and
   assert the module graph really keeps the key off the pre-submission path.
   ========================================================================== */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

import {
  IT1_MARKS,
  IT1_PROBLEMS,
  IT1_QUESTIONS,
  IT1_TEST,
  IT1_TOTAL_MARKS,
  questionById,
} from '../src/it1-problems.js';
import {
  ANSWER_KEY,
  ANSWER_PROSE,
  SOLUTIONS,
  buildSolutionGroups,
  IT1_SOLUTIONS,
  workedSolutionHtml,
} from '../src/it1-solutions.js';
import { it1GivenDiagram, it1SolvedDiagram, IT1_FIGURE_IDS } from '../src/it1-diagrams.js';
import {
  answerIsCorrect,
  createAssessmentState,
  recordAnswer,
  startAssessment,
  submitAssessment,
  validateAnswerKey,
} from '../src/lesson-test-engine.js';
import {
  INDEPENDENT_TESTS,
  getSolutionForTest,
  validateTestEntry,
} from '../src/independent-tests-data.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const srcUrl = (name) => new URL(`../src/${name}`, import.meta.url);

/* A tiny helper that answers a whole attempt the way a student would. */
function attempt(answers, questions = IT1_QUESTIONS) {
  let state = startAssessment(createAssessmentState());
  for (const question of questions) {
    if (!(question.id in answers)) continue;
    state = recordAnswer(state, question, answers[question.id]);
  }
  return { state, result: submitAssessment(state, questions, ANSWER_KEY) };
}

const fullAnswers = () => Object.fromEntries(IT1_QUESTIONS.map((question) => {
  const key = ANSWER_KEY[question.id];
  return [question.id, typeof key === 'object' ? key.value : key];
}));

/* -------------------------------------------------------------- 1. exists -- */

test('the test registers 14 problems and 39 graded items against the existing zone contract', () => {
  assert.equal(IT1_PROBLEMS.length, 14);
  assert.equal(IT1_QUESTIONS.length, 39);
  assert.equal(IT1_TEST.id, 'test-01');
  assert.equal(IT1_TEST.number, 1);

  const registered = INDEPENDENT_TESTS.find((entry) => entry.id === 'test-01');
  assert.ok(registered, 'test-01 must be registered in the independent-tests registry');
  assert.doesNotThrow(() => validateTestEntry(registered));
  assert.equal(registered.questionCount, IT1_QUESTIONS.length);
  assert.equal(registered.problemCount, IT1_PROBLEMS.length);
  assert.equal(registered.totalMarks, IT1_TOTAL_MARKS);
  assert.equal(registered.href, './independent-tests.html#test-01');

  // Stable ids map one-to-one to the fourteen attached images, in order.
  assert.deepEqual(IT1_PROBLEMS.map((item) => item.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  assert.deepEqual(IT1_PROBLEMS.map((item) => item.sourceImage), Array.from({ length: 14 }, (_, index) => index + 1));
  assert.equal(new Set(IT1_PROBLEMS.map((item) => item.sourceImage)).size, 14);
});

/* ------------------------------------------------------- 2. source givens -- */
/* Each assertion transcribes the photographed worksheet line for line. */

const SOURCE = Object.freeze({
  1: { givens: ['15 N', '45 N', '2 m'], asks: 3, family: 'parallel' },
  2: { givens: ['60 N', '20 N', '0.8 m'], asks: 4, family: 'parallel' },
  3: { givens: ['100 N', '300 N', '0.75 m'], asks: 3, family: 'parallel' },
  4: { givens: ['30 N', '90 N', '0.6 m'], asks: 3, family: 'parallel' },
  5: { givens: ['120 N', '40 N', '0.2 m'], asks: 4, family: 'parallel' },
  6: { givens: ['50 N', '200 N', '150 N', '2 m'], asks: 3, family: 'parallel' },
  7: { givens: ['3 N', '4 N'], asks: 3, family: 'concurrent' },
  8: { givens: ['16 N', '12 N'], asks: 2, family: 'concurrent' },
  9: { givens: ['6 N', '6 N'], asks: 3, family: 'concurrent' },
  10: { givens: ['20 N', '20 N'], asks: 2, family: 'concurrent' },
  11: { givens: ['10 N', '15 N', '45'], asks: 2, family: 'concurrent' },
  12: { givens: ['30 N', '50 N'], asks: 2, family: 'concurrent' },
  13: { givens: ['50 N', '50 N', '60'], asks: 2, family: 'concurrent' },
  14: { givens: ['80 N', '80 N', '60'], asks: 3, family: 'concurrent' },
});

test('every problem carries exactly the givens and the number of asks printed in the source', () => {
  for (const problem of IT1_PROBLEMS) {
    const expected = SOURCE[problem.number];
    assert.ok(expected, `problem ${problem.number} must exist in the source table`);
    for (const given of expected.givens) {
      assert.ok(
        problem.givens.join(' ').includes(given),
        `problem ${problem.number} must state ${given} in its structured givens — got: ${problem.givens.join(', ')}`,
      );
    }
    assert.equal(problem.asks.length, expected.asks, `problem ${problem.number} must have ${expected.asks} asks`);
  }
});

test('no problem silently changes a source value into a different one', () => {
  // The three audited corruptions and their neighbours must never reappear.
  const intro = (n) => { const { givens, intro } = IT1_PROBLEMS.find((item) => item.number === n); return JSON.stringify({ givens, intro }); };
  assert.ok(!intro(6).includes('d₁ = 0.2 m'), 'problem 6 must not use d₁ = 0.2 m');
  assert.ok(intro(6).includes('d₁ = 2 m'), 'problem 6 must use d₁ = 2 m');
  assert.ok(!intro(7).includes('7 N'), 'problem 7 must not use F₂ = 7 N');
  assert.ok(intro(7).includes('F₂ = 4 N'), 'problem 7 must use F₂ = 4 N');
  assert.ok(!intro(9).includes('12 N'), 'problem 9 must not use F₁ = F₂ = 12 N');
  assert.ok(intro(9).includes('F₁ = F₂ = 6 N'), 'problem 9 must use F₁ = F₂ = 6 N');
  // And the corrected values must be used consistently across the whole test.
  const everything = JSON.stringify(IT1_PROBLEMS);
  assert.ok(!everything.includes('F_2=7'), 'the 7 N corruption must not survive in any TeX');
});

/* --------------------------------------------------- 3. recomputed answers -- */
/* Values recomputed here from the physics, independently of the key module.  */

const recomputed = Object.freeze({
  'it1p01-magnitude': 15 + 45,
  'it1p01-d1': +(45 / (15 + 45) * 2).toFixed(6),
  'it1p01-d2': +(15 / (15 + 45) * 2).toFixed(6),

  'it1p02-magnitude': 60 + 20,
  'it1p02-d1': +(20 / (60 + 20) * 0.8).toFixed(6),
  'it1p02-d2': +(60 / (60 + 20) * 0.8).toFixed(6),

  'it1p03-magnitude': 100 + 300,
  'it1p03-d2': +(0.75 * 100 / 300).toFixed(6),
  'it1p03-total': +(0.75 + (0.75 * 100 / 300)).toFixed(6),

  'it1p04-magnitude': 90 - 30,
  'it1p04-d1': +(90 / (90 - 30) * 0.6).toFixed(6),
  'it1p04-d2': +(30 / (90 - 30) * 0.6).toFixed(6),

  'it1p05-f2': 120 + 40,
  'it1p05-d1': +(160 / 40 * 0.2).toFixed(6),
  'it1p05-total': +(160 / 40 * 0.2 - 0.2).toFixed(6),

  'it1p06-d2': +(2 * 50 / 200).toFixed(6),
  'it1p06-total': +(2 - (2 * 50 / 200)).toFixed(6),

  'it1p07-magnitude': 5,
  'it1p07-alpha': +((Math.atan2(4, 3) * 180) / Math.PI).toFixed(3),

  'it1p08-magnitude': 20,
  'it1p08-tan': 0.75,

  'it1p09-magnitude': +(6 * Math.SQRT2).toFixed(3),
  'it1p09-alpha': 45,

  'it1p10-magnitude': +(20 * Math.SQRT2).toFixed(3),


  'it1p13-magnitude': +(2 * 50 * Math.cos(Math.PI / 6)).toFixed(2),

  'it1p14-magnitude': +(2 * 80 * Math.cos(Math.PI / 6)).toFixed(2),
  'it1p14-alpha': 30,
});

test('every numeric answer key equals the value recomputed from the source givens', () => {
  let checked = 0;
  for (const [id, expected] of Object.entries(recomputed)) {
    const key = ANSWER_KEY[id];
    assert.ok(key && typeof key === 'object', `${id} must have a numeric key`);
    assert.ok(
      Math.abs(key.value - expected) <= Math.max(key.tolerance, 0.005),
      `${id}: key says ${key.value}, recomputed ${expected}`,
    );
    checked += 1;
  }
  assert.ok(checked >= 20, 'the recomputation table must cover every numeric answer');
});

test('the three audited corrections propagate into the answer key, not just the text', () => {
  // M6: d₁ = 2 m  →  d₂ = 0.5 m, d = 1.5 m   (the 0.2 m version would give 0.05/0.15)
  assert.equal(ANSWER_KEY['it1p06-d2'].value, 0.5);
  assert.equal(ANSWER_KEY['it1p06-total'].value, 1.5);
  // M7: F₂ = 4 N  →  F = 5 N, α ≈ 53.1°   (7 N would give √58 ≈ 7.62 N)
  assert.equal(ANSWER_KEY['it1p07-magnitude'].value, 5);
  assert.ok(Math.abs(ANSWER_KEY['it1p07-alpha'].value - 53.13) < 0.3);
  assert.notEqual(ANSWER_KEY['it1p07-magnitude'].value, 7);
  // M9: F₁ = F₂ = 6 N  →  F ≈ 8.49 N   (12 N would give ≈ 16.97 N)
  assert.equal(ANSWER_KEY['it1p09-magnitude'].value, 8.49);
  assert.notEqual(ANSWER_KEY['it1p09-magnitude'].value, 16.97);
});

test('the worked-solution figures state the corrected values, and never the old ones', () => {
  const six = readFile(new URL('../src/it1-solutions.js', import.meta.url), 'utf8');
  const seven = six;
  return Promise.all([six, seven]).then(([solutions]) => {
    assert.ok(solutions.includes('it1p06-d2') || solutions.includes('d_{2}'));
    // problem 6 solution chain
    assert.match(solutions, /0\.75/); // problem 3 chain still present
    const p6 = solutions.slice(solutions.indexOf("solution('it1p06'"), solutions.indexOf("solution('it1p07'"));
    assert.ok(p6.includes('0.5') && p6.includes('1.5'), 'problem 6 must solve to d₂ = 0.5 m and d = 1.5 m');
    assert.ok(!p6.includes('0.05'), 'problem 6 must not keep the 0.2 m chain');
    const p7 = solutions.slice(solutions.indexOf("solution('it1p07'"), solutions.indexOf("solution('it1p08'"));
    assert.ok(p7.includes('5~\\\\mathrm{N}'), 'problem 7 must solve to F = 5 N');
    assert.ok(!p7.includes('7~\\\\mathrm{N}'), 'problem 7 must not keep F = 7 N');
    const p9 = solutions.slice(solutions.indexOf("solution('it1p09'"), solutions.indexOf("solution('it1p10'"));
    assert.ok(p9.includes('8.49'), 'problem 9 must solve to F ≈ 8.49 N');
    assert.ok(!p9.includes('12~\\\\mathrm{N}'), 'problem 9 must not keep 12 N');
  });
});

/* ------------------------------------------------------ 4. the F notation -- */

test('the resultant magnitude is written F everywhere and never R', async () => {
  const files = ['it1-problems.js', 'it1-solutions.js', 'it1-diagrams.js', 'it1-assessment.js'];
  for (const name of files) {
    const source = await readFile(srcUrl(name), 'utf8');
    // Only TeX/label positions matter: an R used for the resultant would have
    // to appear as a math symbol (\\vec{R}, R=…, F replaced by R) — plain
    // English letters inside identifiers are irrelevant.
    assert.doesNotMatch(source, /\\vec\{R\}|\\mathrm\{R\}|\\vec\{R\}_/, `${name} must not use R as a vector symbol`);
    assert.doesNotMatch(source, /R=|R\^\{|R_\{1\}/, `${name} must not use R as the resultant magnitude`);
    assert.doesNotMatch(source, /label: 'R'|>R</, `${name} must not label the resultant R`);
  }
  // Positive check: the resultant label in every solved figure is F.
  for (const id of IT1_FIGURE_IDS) {
    const solved = it1SolvedDiagram(`it1${id}`);
    assert.match(solved, /label: 'F'|>F</, `solved figure ${id} must label the resultant F`);
  }
  // The prompts ask for F explicitly.
  const magnitudePrompts = IT1_QUESTIONS.filter((question) => question.askId === 'magnitude');
  assert.ok(magnitudePrompts.length >= 10);
  for (const question of magnitudePrompts) {
    assert.match(question.prompt, /<span class="it1-ask">/, 'the ask must be marked up');
    assert.doesNotMatch(question.prompt.replace(/<[^>]+>/g, ''), /(^|[^\p{L}])R([^\p{L}]|$)/u, 'no R in the prompt');
  }
});

/* -------------------------------------------------- 5. every ask is graded -- */

test('every requested item in every problem has exactly one graded field and one key', () => {
  for (const problem of IT1_PROBLEMS) {
    const ids = problem.asks.map((ask) => `${problem.id}-${ask.id}`);
    assert.equal(new Set(ids).size, ids.length, `problem ${problem.number} has duplicate ask ids`);
    for (const id of ids) {
      assert.ok(id in ANSWER_KEY, `${id} must have an answer key`);
      assert.ok(id in ANSWER_PROSE, `${id} must have correct-answer prose for the review`);
    }
  }
  // And nothing extra: the key may not grade fields that are not asked.
  const asked = new Set(IT1_QUESTIONS.map((question) => question.id));
  for (const id of Object.keys(ANSWER_KEY)) assert.ok(asked.has(id), `${id} is graded but not asked`);
  assert.equal(Object.keys(ANSWER_KEY).length, IT1_QUESTIONS.length);
});

test('explicitly covers the eight problems whose grading fields were audited as incomplete', () => {
  const audited = [2, 6, 7, 9, 10, 11, 13, 14];
  for (const number of audited) {
    const problem = IT1_PROBLEMS.find((item) => item.number === number);
    for (const ask of problem.asks) {
      assert.ok(`${problem.id}-${ask.id}` in ANSWER_KEY, `problem ${number} ask ${ask.id} must be graded`);
    }
    // The review must state the correct answer for each of those fields.
    for (const ask of problem.asks) {
      assert.ok(`${problem.id}-${ask.id}` in ANSWER_PROSE, `problem ${number} ask ${ask.id} needs prose`);
    }
  }
  // Descriptive asks (not just numbers) must exist for the audited problems.
  for (const number of [2, 6, 9, 10, 11, 13, 14]) {
    const problem = IT1_PROBLEMS.find((item) => item.number === number);
    assert.ok(
      problem.asks.some((ask) => ask.kind === 'choice'),
      `problem ${number} must have a descriptive (choice) requirement, not only a number`,
    );
  }
});

test('problems 9 and 10 never describe a "larger force" — the two forces are equal', () => {
  for (const number of [9, 10]) {
    const problem = IT1_PROBLEMS.find((item) => item.number === number);
    const text = JSON.stringify(problem);
    assert.ok(!text.includes('الكبرى'), `problem ${number} must not mention القوة الكبرى`);
    assert.ok(!text.includes('الأكبر'), `problem ${number} must not mention القوة الأكبر`);
    const solved = it1SolvedDiagram(problem.id);
    assert.ok(!solved.includes('الكبرى'), `the solved figure of problem ${number} must not mention القوة الكبرى`);
  }
});

test('problem 13 stays consistent: equal 50 N forces at 60° → 86.6 N on the bisector', () => {
  const problem = IT1_PROBLEMS.find((item) => item.number === 13);
  assert.ok(problem.givens.includes('F₁ = F₂ = 50 N'));
  assert.ok(problem.intro.includes('60'));
  assert.equal(ANSWER_KEY['it1p13-magnitude'].value, 86.6);
  assert.equal(ANSWER_KEY['it1p13-elements'], 'bisector');
  assert.match(it1SolvedDiagram('it1p13'), /86\.6/);
});

test('problem 13 uses isolated typeset math and a valid equilateral-triangle median argument', () => {
  const html = workedSolutionHtml('it1p13');
  assert.doesNotMatch(html, /\$\\[A-Za-z]/, 'solution must not leak raw TeX delimiters');
  assert.match(html, /the median is 50 square root of 3 over 2 newtons/);
  assert.match(html, /class="math math-inline" dir="ltr" role="math"/);
  assert.match(html, /50\\sqrt\{3\}/, 'the typeset math source must contain the derived radical');
});

/* ------------------------------------------- 6/11/12. the engine really works */

test('a perfect attempt scores every mark through the shared engine', () => {
  const { result } = attempt(fullAnswers());
  assert.equal(result.status, 'submitted');
  assert.equal(result.results.correct, IT1_QUESTIONS.length);
  assert.equal(result.results.incorrect, 0);
  assert.equal(result.results.percentage, 100);
});

test('numeric input accepts what a student types: decimals, Arabic digits, units, fractions', () => {
  const question = questionById('it1p01-magnitude');
  assert.ok(question, 'numeric question exists');
  const cases = [
    ['60', true],
    ['60 N', true],
    ['60 newtons', true],
    ['٦٠', true],
    [' 60 ', true],
    ['59', false],
    ['61', false],
    ['', false],
  ];
  for (const [input, expected] of cases) {
    assert.equal(
      answerIsCorrect(question, input, ANSWER_KEY[question.id]),
      expected,
      `input "${input}" should be ${expected ? 'accepted' : 'rejected'}`,
    );
  }
  // A distance answer in metres must accept comma decimals too.
  const dist = questionById('it1p01-d1');
  assert.equal(answerIsCorrect(dist, '1.5', ANSWER_KEY[dist.id]), true);
  assert.equal(answerIsCorrect(dist, '1,5', ANSWER_KEY[dist.id]), true);
  assert.equal(answerIsCorrect(dist, '1.4', ANSWER_KEY[dist.id]), false);
  // And a wrong unit must be rejected rather than silently accepted.
  assert.equal(answerIsCorrect(dist, '1.5 N', ANSWER_KEY[dist.id]), false);
});

test('choice questions grade a single selection and reject the distractors', () => {
  const choiceQuestions = IT1_QUESTIONS.filter((question) => question.type === 'single-choice');
  assert.ok(choiceQuestions.length >= 8, 'the test must contain real multiple-choice questions');
  for (const question of choiceQuestions) {
    const key = ANSWER_KEY[question.id];
    assert.equal(answerIsCorrect(question, key, key), true, `${question.id} key must self-validate`);
    for (const option of question.options) {
      if (option.id === key) continue;
      assert.equal(answerIsCorrect(question, option.id, key), false, `${question.id}: distractor ${option.id} must be wrong`);
    }
    // No duplicate options and at least three of them.
    const ids = question.options.map((option) => option.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(ids.length >= 3);
  }
});

test('an unanswered item earns nothing, and a wrong one is counted as incorrect', () => {
  const answers = fullAnswers();
  const { result } = attempt(answers);
  const perfect = result.results.correct;

  const missing = fullAnswers();
  delete missing['it1p06-total'];
  const withoutOne = attempt(missing).result;
  assert.equal(withoutOne.results.correct, perfect - 1);
  assert.equal(withoutOne.results.incorrect, 1);
  assert.ok(!withoutOne.results.correctQuestionIds.includes('it1p06-total'));

  const wrong = fullAnswers();
  wrong['it1p06-total'] = 0.15; // the old 0.2 m chain would produce this
  const withWrong = attempt(wrong).result;
  assert.equal(withWrong.results.correct, perfect - 1);
  assert.ok(!withWrong.results.correctQuestionIds.includes('it1p06-total'));
});

/* ------------------------------------------------------------ 7. figures -- */

test('every problem has a givens figure that never draws the resultant', () => {
  for (const problem of IT1_PROBLEMS) {
    const given = it1GivenDiagram({ diagram: problem.figure });
    assert.ok(given.length > 300, `problem ${problem.number} must have a figure`);
    assert.match(given, /<svg[^>]+role="img"/, 'the figure must be an accessible svg');
    assert.match(given, /<title id=/, 'the svg needs a title');
    assert.match(given, /<desc id=/, 'the svg needs a description');
    // Givens only: no resultant marker, no resultant label, no red resultant line.
    assert.ok(!given.includes('-res'), `the givens figure of problem ${problem.number} must not draw the resultant`);
    assert.doesNotMatch(given, /label">F</, `the givens figure of problem ${problem.number} must not label a resultant`);
  }
});

test('every solved figure draws the resultant F with a real value and a direction', () => {
  for (const problem of IT1_PROBLEMS) {
    const solved = it1SolvedDiagram(problem.id);
    assert.ok(solved.length > 300);
    assert.ok(solved.includes('-res'), `problem ${problem.number} solved figure must draw the resultant`);
    assert.match(solved, /marker-end="url\(#[^)]+-res\)"/, 'the resultant must be an arrow, not a line');
    assert.match(solved, />F</, 'the resultant must be labelled F');
    // Both forces keep their labels and their numeric values.
    assert.match(solved, />F₁</);
    assert.match(solved, />F₂</);
  }
});

test('figure labels agree with the givens in each problem statement', () => {
  const expected = {
    1: ['15 N', '45 N'], 2: ['60 N', '20 N'], 3: ['100 N', '300 N'], 4: ['30 N', '90 N'],
    5: ['40 N'], 6: ['50 N', '200 N'], 7: ['3 N', '4 N'], 8: ['16 N', '12 N'],
    9: ['6 N'], 10: ['20 N'], 11: ['10 N', '15 N'], 12: ['30 N', '50 N'],
    13: ['50 N'], 14: ['80 N'],
  };
  for (const [number, values] of Object.entries(expected)) {
    const given = it1GivenDiagram({ diagram: `p${String(number).padStart(2, '0')}` });
    for (const value of values) {
      assert.ok(given.includes(value), `problem ${number} figure must show ${value}`);
    }
  }
  // Equal-force problems show the SAME value for both forces (no invented pair).
  // Concurrent figures carry the values in a legend line; parallel ones beside
  // each arrow — both are read here through the same matcher.
  const shownValues = (figure) => [...figure.matchAll(/it1-value"[^>]*>([^<]+)</g)].map((match) => match[1]);
  for (const [id, value] of [['p09', '6 N'], ['p10', '20 N'], ['p13', '50 N'], ['p14', '80 N']]) {
    const figure = it1GivenDiagram({ diagram: id });
    const legend = figure.match(/class="it1-legend"[^>]*>([^<]+)</)[1];
    assert.equal(legend, `F₁ = ${value}   ·   F₂ = ${value}`, `${id} legend must show ${value} for both forces`);
  }
  // Parallel figures keep a value label beside each arrow.
  const p01 = shownValues(it1GivenDiagram({ diagram: 'p01' }));
  assert.deepEqual(p01, ['15 N', '45 N']);
});


/* ------------------------------------------- 7b. figure geometry is provable -- */

/* These four tests exist because the earlier suite only checked that a figure
   existed and contained the right words. Every defect found in the audit —
   a resultant on the wrong side, spans whose labels contradicted their own
   length, arrows whose lengths ignored the magnitudes, a label sitting on an
   arrow, an unknown printed as if it were given — passed that weaker suite. */

const FIGURE_EXPECT = {
  p01: { F1: 15, F2: 45, d: 2, sense: 'same', F: 60, d1: 1.5, d2: 0.5 },
  p02: { F1: 60, F2: 20, d: 0.8, sense: 'same', F: 80, d1: 0.2, d2: 0.6 },
  p03: { F1: 100, F2: 300, d: 1, sense: 'same', F: 400, d1: 0.75, d2: 0.25 },
  p04: { F1: 30, F2: 90, d: 0.6, sense: 'opposite', F: 60, d1: 0.9, d2: 0.3 },
  p05: { F1: 40, F2: 160, d: 0.6, sense: 'opposite', F: 120, d1: 0.8, d2: 0.2 },
  p06: { F1: 50, F2: 200, d: 1.5, sense: 'opposite', F: 150, d1: 2, d2: 0.5 },
};

const forceGroup = (svg, label) => {
  const groups = [...svg.matchAll(/<g class="it1-force[^"]*">([\s\S]*?)<\/g>/g)].map((m) => m[1]);
  return groups.find((body) => body.includes(`>${label}<`)) ?? null;
};

const arrowOf = (svg, label) => {
  const group = forceGroup(svg, label);
  assert.ok(group, `figure must draw an arrow labelled ${label}`);
  const line = /<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/.exec(group);
  const value = /it1-value[^>]*>([^<]*)</.exec(group);
  return {
    x: Number(line[1]), y: Number(line[2]), tipY: Number(line[4]),
    len: Math.hypot(Number(line[3]) - Number(line[1]), Number(line[4]) - Number(line[2])),
    value: value ? value[1] : null,
  };
};

const spanGroups = (svg) => [...svg.matchAll(/<g class="it1-span">([\s\S]*?)<\/g>/g)].map((m) => m[1]);

const spanOf = (svg, label) => {
  const group = spanGroups(svg).find((body) => body.includes(`>${label}<`));
  assert.ok(group, `figure must draw the span labelled ${label}`);
  const line = /<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)"/.exec(group);
  return { x1: Number(line[1]), x2: Number(line[3]) };
};

test('each solved parallel figure puts the resultant where the two laws put it', () => {
  for (const [id, expected] of Object.entries(FIGURE_EXPECT)) {
    const svg = it1SolvedDiagram(`it1${id}`);
    const a = arrowOf(svg, 'F₁');
    const b2 = arrowOf(svg, 'F₂');
    const resultant = arrowOf(svg, 'F');

    const pxPerMetre = Math.abs(b2.x - a.x) / expected.d;
    assert.ok(Math.abs(Math.abs(resultant.x - a.x) / pxPerMetre - expected.d1) < 0.02,
      `${id}: d₁ drawn ${(Math.abs(resultant.x - a.x) / pxPerMetre).toFixed(2)} m, law says ${expected.d1}`);
    assert.ok(Math.abs(Math.abs(resultant.x - b2.x) / pxPerMetre - expected.d2) < 0.02,
      `${id}: d₂ drawn ${(Math.abs(resultant.x - b2.x) / pxPerMetre).toFixed(2)} m, law says ${expected.d2}`);

    const inside = resultant.x > Math.min(a.x, b2.x) && resultant.x < Math.max(a.x, b2.x);
    if (expected.sense === 'same') {
      assert.ok(inside, `${id}: same-sense resultant must lie BETWEEN the two forces`);
    } else {
      assert.ok(!inside, `${id}: opposite-sense resultant must lie OUTSIDE AB`);
      const beyondLarger = expected.F2 > expected.F1
        ? resultant.x > Math.max(a.x, b2.x)
        : resultant.x < Math.min(a.x, b2.x);
      assert.ok(beyondLarger, `${id}: resultant must lie beyond the LARGER force`);
    }
  }
});

test('every distance label measures the length it is drawn across', () => {
  for (const [id, expected] of Object.entries(FIGURE_EXPECT)) {
    const svg = it1SolvedDiagram(`it1${id}`);
    const a = arrowOf(svg, 'F₁');
    const b2 = arrowOf(svg, 'F₂');
    const pxPerMetre = Math.abs(b2.x - a.x) / expected.d;
    for (const group of spanGroups(svg)) {
      const label = /it1-span-label[^>]*>([^<]*)</.exec(group);
      if (!label) continue;
      const metres = /([\d.]+)\s*m/.exec(label[1]);
      if (!metres) continue;
      const line = /<line x1="([\d.]+)" y1="[\d.]+" x2="([\d.]+)"/.exec(group);
      const drawn = Math.abs(Number(line[2]) - Number(line[1])) / pxPerMetre;
      assert.ok(Math.abs(drawn - Number(metres[1])) < 0.03,
        `${id}: span "${label[1]}" is drawn ${drawn.toFixed(2)} m long`);
    }
  }
});

test('arrow lengths in a figure are proportional to the magnitudes they label', () => {
  for (const [id, expected] of Object.entries(FIGURE_EXPECT)) {
    const svg = it1SolvedDiagram(`it1${id}`);
    const perNewton = [
      arrowOf(svg, 'F₁').len / expected.F1,
      arrowOf(svg, 'F₂').len / expected.F2,
      arrowOf(svg, 'F').len / expected.F,
    ];
    const spread = Math.max(...perNewton) / Math.min(...perNewton);
    assert.ok(spread < 1.08,
      `${id}: arrow lengths vary by ×${spread.toFixed(2)} per newton — 50 N and 200 N must not look alike`);
    /* And the smallest force stays a legible arrow. */
    assert.ok(Math.min(arrowOf(svg, 'F₁').len, arrowOf(svg, 'F₂').len) >= 30,
      `${id}: the shortest arrow must still read as an arrow`);
  }
});

test('a givens figure never prints a value or a distance the statement withholds', () => {
  /* p03 asks for d, p05 asks for F₂ and d, p06 asks for d. */
  const withheld = { p03: ['1 m'], p05: ['160 N', '0.6 m'], p06: ['1.5 m'] };
  for (const [id, values] of Object.entries(withheld)) {
    const given = it1GivenDiagram({ diagram: id });
    for (const value of values) {
      assert.ok(!given.includes(value), `the givens figure of ${id} must not reveal ${value} before submission`);
    }
    assert.match(given, /[?؟]/, `the givens figure of ${id} must mark its unknown with a question mark`);
  }
  /* The solved figure is allowed — and required — to state them. */
  for (const [id, values] of Object.entries(withheld)) {
    const solved = it1SolvedDiagram(`it1${id}`);
    for (const value of values) {
      assert.ok(solved.includes(value), `the solved figure of ${id} must state ${value}`);
    }
  }
});

test('no figure label is cropped by the drawing box or struck by an arrow', () => {
  /* Pure geometry on the emitted SVG: every <text> must sit inside the viewBox,
     and no angle label may be placed on top of an arrow shaft. */
  for (const problem of IT1_PROBLEMS) {
    for (const [kind, svg] of [['givens', it1GivenDiagram({ diagram: problem.figure })],
                               ['solved', it1SolvedDiagram(problem.id)]]) {
      const viewBox = /viewBox="0 0 640 ([\d.]+)"/.exec(svg);
      assert.ok(viewBox, `${problem.number} ${kind} figure must declare its height`);
      const height = Number(viewBox[1]);
      const y = [...svg.matchAll(/<text[^>]*\by="(-?[\d.]+)"[^>]*>/g)].map((m) => Number(m[1]));
      for (const value of y) {
        assert.ok(value > 6 && value < height,
          `${problem.number} ${kind}: a label sits at y=${value}, outside 0..${height}`);
      }
      /* The angle label of a concurrent figure must clear every arrow. */
      const label = /it1-angle-label" x="([\d.]+)" y="([\d.]+)"/.exec(svg);
      if (label) {
        const px = Number(label[1]);
        const py = Number(label[2]) - 5;
        for (const shaft of [...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/g)]) {
          const x1 = Number(shaft[1]); const y1 = Number(shaft[2]);
          const dx = Number(shaft[3]) - x1; const dy = Number(shaft[4]) - y1;
          const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1)));
          const gap = Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
          assert.ok(gap > 4, `${problem.number} ${kind}: the angle label sits ${gap.toFixed(1)}px from an arrow`);
        }
      }
    }
  }
});

/* ---------------------------------------------------- 8. registry sanity -- */

test('the zone links the test card to the test page and the solution row to the same gated page', async () => {
  const data = await read('../src/independent-tests-data.js');
  assert.match(data, /id: 'test-01'/);
  assert.match(data, /href: '\.\/independent-tests\.html#test-01'/);
  assert.match(data, /gated: true/);
  assert.doesNotMatch(data, /ANSWER_KEY|answerKey|explanationHtml|tolerance/);
  const page = await read('../independent-tests.html');
  assert.match(page, /id="it-tests-grid"/);
  assert.match(page, /id="it-test-view"[^>]*hidden/);
  assert.doesNotMatch(page, /independent-test-1\.html/);
});

test('the answer key is not reachable from any pre-submission module', async () => {
  const entry = srcUrl('it1-assessment.js');
  const graph = new Set();
  const queue = [entry];
  while (queue.length) {
    const url = queue.pop();
    if (graph.has(url.href)) continue;
    graph.add(url.href);
    const source = await readFile(url, 'utf8');
    for (const match of source.matchAll(/^\s*import\s[^;]*?from\s+'([^']+)'/gm)) {
      if (match[1].startsWith('.')) queue.push(new URL(match[1], url));
    }
  }
  const names = [...graph].map((url) => url.split('/').pop());
  assert.ok(names.includes('it1-problems.js'));
  assert.ok(names.includes('lesson-test-engine.js'));
  assert.ok(!names.includes('it1-solutions.js'));
  assert.ok(!names.includes('it1-diagrams.js'));
  const assessment = await read('../src/it1-assessment.js');
  assert.deepEqual([...assessment.matchAll(/import\('([^']+)'\)/g)].map((match) => match[1]), ['./it1-solutions.js']);
  assert.match(assessment, /async function submit\(/);
  assert.ok(assessment.indexOf("import('./it1-solutions.js')") > assessment.indexOf('async function submit'));
  assert.match(assessment, /submitAssessment\(state, IT1_QUESTIONS, solutionModule\.ANSWER_KEY\)/);
});

test('the shipped page never embeds an answer key in its markup', async () => {
  const page = await read('../independent-tests.html');
  assert.doesNotMatch(page, /ANSWER_KEY|answerKey|tolerance|explanationHtml/);
  assert.match(page, /src="\.\/src\/independent-tests\.js"/);
  assert.match(page, /id="it1-assessment"/);
  assert.doesNotMatch(page, /role="tab"/, 'the tablist is generated only after opening the active test');
});

test('the worked solutions exist for all 14 problems and are only rendered by the review', async () => {
  assert.equal(IT1_SOLUTIONS.length, 14);
  for (const problem of IT1_PROBLEMS) {
    const html = workedSolutionHtml(problem.id);
    assert.ok(html.length > 400, `problem ${problem.number} must have a worked solution`);
    assert.ok(html.includes('it1-solution'));
    assert.ok(html.includes('solution-steps'));
    assert.equal((html.match(/<figure class="it1-figure-inner"/g) ?? []).length, 1);
  }
  const assessment = await read('../src/it1-assessment.js');
  assert.match(assessment, /data-solution-slot/);
  assert.match(assessment, /slot\.hidden = false/);
  assert.ok(assessment.indexOf('slot.hidden = false') > assessment.indexOf("import('./it1-solutions.js')"));
  const size = 5;
  const groups = buildSolutionGroups(IT1_QUESTIONS, size);
  assert.equal(groups.length, Math.ceil(IT1_QUESTIONS.length / size));
  groups.forEach((group, index) => {
    assert.equal(group.items.length, Math.min(size, IT1_QUESTIONS.length - index * size));
    assert.deepEqual(group.questionIds, IT1_QUESTIONS.slice(index * size, index * size + size).map((q) => q.id));
    for (const item of group.items) assert.ok(item?.explanationHtml);
  });
});

test('the marks add up, match the graded fields, and are visible to the student', () => {
  const gradedPoints = IT1_QUESTIONS.map((question) => question.points);
  assert.ok(gradedPoints.every((points) => Number.isInteger(points) && points > 0), 'every field must carry marks');
  const sum = gradedPoints.reduce((total, points) => total + points, 0);
  assert.equal(sum, IT1_TOTAL_MARKS);
  assert.equal(IT1_MARKS.reduce((total, row) => total + row.marks, 0), IT1_TOTAL_MARKS);
  assert.equal(IT1_TOTAL_MARKS, (IT1_QUESTIONS.length), 'one mark per graded field in this test');
  // Per-page totals printed in the review group titles must be true.
  const rangeMarks = (first, last) => IT1_MARKS
    .filter((row) => row.number >= first && row.number <= last)
    .reduce((total, row) => total + row.marks, 0);
  assert.equal(rangeMarks(1, 5), 17);
  assert.equal(rangeMarks(6, 10), 13);
  assert.equal(rangeMarks(11, 14), 9);
  const titles = buildSolutionGroups(IT1_QUESTIONS, 5).map((group) => group.title);
  assert.ok(titles[0].includes('17'));
  assert.ok(titles[1].includes('13'));
  assert.ok(titles[2].includes('9'));
});

/* ------------------------------------------------------- build + wiring ---- */

test('the static build ships the test page and its modules', async () => {
  const buildScript = await read('../scripts/build.mjs');
  assert.ok(buildScript.includes("resolve(projectDirectory, 'independent-tests.html')"));
  assert.doesNotMatch(buildScript, /independent-test-1\.html/);
  const modules = await readdir(new URL('../src/', import.meta.url));
  for (const name of ['it1-problems.js', 'it1-solutions.js', 'it1-diagrams.js', 'it1-assessment.js', 'it1.css']) {
    assert.ok(modules.includes(name));
  }
});

test('the page loads the platform stylesheet chain it depends on', async () => {
  const page = await read('../independent-tests.html');
  assert.match(page, /href="\.\/src\/fonts\.css"/);
  assert.match(page, /href="\.\/vendor\/katex\/katex\.min\.css"/);
  assert.match(page, /href="\.\/src\/home\.css"/);
  assert.match(page, /href="\.\/src\/it1\.css"/);
  assert.match(page, /<html lang="ar" dir="rtl">/);
});

test('the engine module stays in the pre-submission graph and is the only grader', async () => {
  const assessment = await read('../src/it1-assessment.js');
  assert.match(assessment, /from '\.\/lesson-test-engine\.js'/);
  assert.match(assessment, /questionIsAnswered/);
  assert.match(assessment, /recordAnswer/);
  assert.match(assessment, /submitAssessment\(/);
  assert.doesNotMatch(assessment, /function answerIsCorrect/);
  for (const question of IT1_QUESTIONS) {
    assert.equal(validateAnswerKey(question, ANSWER_KEY[question.id]), true, `${question.id} key must be valid`);
  }
});

test('every import specifier in the new modules points at a file that exists', async () => {
  const names = ['it1-problems.js', 'it1-solutions.js', 'it1-diagrams.js', 'it1-assessment.js'];
  const present = new Set(await readdir(new URL('../src/', import.meta.url)));
  for (const name of names) {
    const source = await readFile(srcUrl(name), 'utf8');
    for (const match of source.matchAll(/from\s+'(\.[^']+)'|import\('(\.[^']+)'\)/g)) {
      const specifier = (match[1] ?? match[2]).replace('./', '');
      assert.ok(present.has(specifier), `${name} imports missing module ${specifier}`);
    }
  }
});


test('the 14 supplied image files are mapped one-to-one in image order', async () => {
  const audit = await read('../docs/qa/independent-test-1/SOURCE-AUDIT.md');
  assert.match(audit, /الصور الأصلية تطبع الرمز `R`/);
  assert.match(audit, /بناءً على تعليمات صاحب المشروع/);
  assert.deepEqual(IT1_PROBLEMS.map((problem) => problem.sourceImage), Array.from({ length: 14 }, (_, i) => i + 1));
  for (let number = 1; number <= 14; number += 1) {
    const source = new URL(`../docs/source-images/independent-test-1/problem-${number}.png`, import.meta.url);
    assert.ok((await readFile(source)).length > 10_000);
  }
});

test('problem eleven retains its two printed tasks and no extra numeric grade item', () => {
  const problem = IT1_PROBLEMS.find((entry) => entry.number === 11);
  assert.deepEqual(problem.asks.map((ask) => ask.id), ['construction', 'elements']);
  assert.equal(ANSWER_KEY['it1p11-magnitude'], undefined);
});

test('the resultant notation normalization is explicit and does not alter source images', async () => {
  const audit = await read('../docs/qa/independent-test-1/SOURCE-AUDIT.md');
  const problems = await read('../src/it1-problems.js');
  assert.match(audit, /تطبع الرمز `R` لشدة محصلة القوى/);
  assert.match(audit, /يعتمد التنفيذ `F` للمحصلة/);
  assert.match(problems, /NOTATION RULE: the magnitude of the resultant is always written `F`/);
});
