import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { LESSON_PAGES, pageTextBlocks } from '../src/lesson-content.js';
import { LESSON_TEST, QUESTIONS, LESSON_ID } from '../src/lesson-test-data.js';
import {
  ANSWER_KEY,
  SOLUTION_GROUPS,
  SOLUTIONS,
} from '../src/lesson-test-solutions.js';
import {
  DIFFICULTY_LEVELS,
  answerIsCorrect,
  canRevealResults,
  canRevealSolutions,
  createAssessmentState,
  moveToQuestion,
  parseNumericResponse,
  questionIsAnswered,
  recordAnswer,
  restartAssessment,
  startAssessment,
  submitAssessment,
  validateAnswerKey,
} from '../src/lesson-test-engine.js';
import { assessmentDiagramMarkup } from '../src/lesson-test-diagrams.js';
import { V_F, V_F1, V_F2, V_OM, V_OX, V_OY, V_R } from '../src/math.js';

const question = (id) => QUESTIONS.find((item) => item.id === id);
const answerKeyFor = (id) => ANSWER_KEY[id];
const sourceContent = (pageNumber) => pageTextBlocks(LESSON_PAGES.find((item) => item.page === pageNumber));
const deepClone = (value) => Array.isArray(value) ? [...value] : value && typeof value === 'object' ? { ...value } : value;

function correctDraft() {
  return Object.fromEntries(QUESTIONS.map((item) => {
    const key = ANSWER_KEY[item.id];
    const answer = item.type === 'numeric' ? String(key.value) : deepClone(key);
    return [item.id, answer];
  }));
}

function completedState(answerOverrides = {}) {
  let state = startAssessment(createAssessmentState());
  const answers = { ...correctDraft(), ...answerOverrides };
  for (const item of QUESTIONS) state = recordAnswer(state, item, answers[item.id]);
  return state;
}

function renderLifecycleState(answers = {}) {
  let state = startAssessment(createAssessmentState());
  for (const [id, value] of Object.entries(answers)) state = recordAnswer(state, question(id), value);
  return state;
}

test('Phase 5 bank contains exactly 20 original lesson questions with the prescribed difficulty split', () => {
  assert.equal(LESSON_ID, 'unit2-lesson1');
  assert.equal(LESSON_TEST.id, LESSON_ID);
  assert.equal(LESSON_TEST.unit, 'الوحدة الثانية — الحركة والقوى');
  assert.equal(LESSON_TEST.lesson, 'الدرس 1 — القوى المتلاقية');
  assert.deepEqual(LESSON_TEST.sourcePages, [55, 56, 57, 58, 59, 60, 61, 62]);
  assert.equal(QUESTIONS.length, 20);
  assert.equal(new Set(QUESTIONS.map((item) => item.id)).size, 20);
  assert.deepEqual(QUESTIONS.map((item) => item.id), Array.from({ length: 20 }, (_, index) => `q${String(index + 1).padStart(2, '0')}`));
  assert.deepEqual(DIFFICULTY_LEVELS, ['basic', 'medium', 'advanced', 'thinking']);
  assert.deepEqual(Object.fromEntries(DIFFICULTY_LEVELS.map((level) => [level, QUESTIONS.filter((item) => item.difficulty === level).length])), {
    basic: 6,
    medium: 7,
    advanced: 4,
    thinking: 3,
  });
  assert.ok(new Set(QUESTIONS.map((item) => item.type)).size >= 7, 'question types are varied');
  for (const item of QUESTIONS) {
    assert.equal(item.lessonId, LESSON_ID);
    assert.ok(DIFFICULTY_LEVELS.includes(item.difficulty), `${item.id} has explicit difficulty`);
    assert.ok(item.prompt.trim().length > 20, `${item.id} has a substantive prompt`);
    assert.ok(item.sourcePages.length > 0);
    assert.ok(item.sourcePages.every((page) => LESSON_TEST.sourcePages.includes(page)));
    assert.ok(!Object.hasOwn(item, 'answerKey'));
    assert.ok(!Object.hasOwn(item, 'solution'));
    assert.ok(!Object.hasOwn(item, 'correctAnswer'));
  }
});

test('choice, multiple-select, ordering and matching questions have well-formed authored response structures', () => {
  const idsAreUnique = (items) => items.length > 0 && new Set(items.map((item) => item.id)).size === items.length;
  for (const item of QUESTIONS) {
    if (['single-choice', 'true-false', 'multiple-select', 'error-analysis', 'diagram-interpretation'].includes(item.type)) {
      assert.ok(item.options.length >= 2, `${item.id} has at least two choices`);
      assert.ok(idsAreUnique(item.options), `${item.id} choice identifiers are unique`);
      assert.ok(item.options.every((option) => option.content.trim().length > 0));
    }
    if (item.type === 'ordering') {
      assert.ok(item.items.length >= 3);
      assert.ok(idsAreUnique(item.items));
    }
    if (item.type === 'matching') {
      assert.ok(item.fields.length >= 2);
      assert.ok(idsAreUnique(item.fields));
      assert.ok(idsAreUnique(item.options));
      assert.ok(item.options.length >= item.fields.length);
    }
    if (item.type === 'numeric') assert.ok(Object.hasOwn(item, 'numericUnit'));
  }
});

test('answer keys and explanatory solutions are separate and cover the exact four groups of five', () => {
  assert.equal(Object.keys(ANSWER_KEY).length, QUESTIONS.length);
  assert.deepEqual(Object.keys(ANSWER_KEY).sort(), QUESTIONS.map((item) => item.id).sort());
  assert.deepEqual(Object.keys(SOLUTIONS).sort(), QUESTIONS.map((item) => item.id).sort());
  assert.equal(SOLUTION_GROUPS.length, 4);
  assert.deepEqual(SOLUTION_GROUPS.map((group) => group.title), ['الأسئلة 1–5', 'الأسئلة 6–10', 'الأسئلة 11–15', 'الأسئلة 16–20']);
  assert.deepEqual(SOLUTION_GROUPS.map((group) => group.questionIds), [
    ['q01', 'q02', 'q03', 'q04', 'q05'],
    ['q06', 'q07', 'q08', 'q09', 'q10'],
    ['q11', 'q12', 'q13', 'q14', 'q15'],
    ['q16', 'q17', 'q18', 'q19', 'q20'],
  ]);
  const flattened = SOLUTION_GROUPS.flatMap((group) => group.items.map((item) => item.questionId));
  assert.deepEqual(flattened, QUESTIONS.map((item) => item.id));
  for (const group of SOLUTION_GROUPS) {
    assert.equal(group.items.length, 5);
    for (const item of group.items) {
      assert.equal(SOLUTIONS[item.questionId], item);
      assert.ok(item.answerHtml.length > 0);
      assert.ok(item.explanationHtml.length > 40, `${item.questionId} gives an explanation`);
      assert.ok(validateAnswerKey(question(item.questionId), item.answerKey), `valid key for ${item.questionId}`);
      assert.deepEqual(item.answerKey, ANSWER_KEY[item.questionId]);
    }
  }
});

test('p58 retains the textbook graphical result as approximately 6 N in both the key and its explanation', () => {
  const p58 = sourceContent(58);
  assert.match(p58, /تقريباً[^]*6 cm/);
  assert.match(p58, /F = 6 × 1 = 6 N/);
  assert.equal(ANSWER_KEY.q05.value, 6);
  assert.equal(ANSWER_KEY.q05.unit, 'N');
  assert.match(SOLUTIONS.q05.answerHtml, /نحو/);
  assert.match(SOLUTIONS.q05.answerHtml, /6 N/);
  assert.match(SOLUTIONS.q05.explanationHtml, /تقريبية/);
  assert.match(SOLUTIONS.q12.answerHtml, /نحو[^]*6 N/);
  assert.match(SOLUTIONS.q12.explanationHtml, /لا يصح استبدال هذا القياس/);
  assert.doesNotMatch(SOLUTIONS.q05.explanationHtml, /7 N|5\.9 N|تحليلية أدق/);
});

test('source audit supports numeric, Pythagoras, force resolution, and p60-only inclined-plane coverage', () => {
  const p56 = sourceContent(56);
  const p57 = sourceContent(57);
  const p59 = sourceContent(59);
  const p60 = sourceContent(60);
  const p62 = sourceContent(62);
  assert.match(p56, /القوى التي تتلاقى حواملها في نقطة واحدة/);
  assert.match(p57, /قطر متوازي الأضلاع[^]*يمثل محصلة القوتين/);
  assert.match(p59, /F = 100 N/);
  assert.match(p59, /F = √\(\(60\)² \+ \(80\)²\)/);
  assert.match(p59, /تحليل القوة إلى مركبتين متعامدتين/);
  assert.match(p60, /عملية تحليل القوة إلى مركبتين متعامدتين/);
  assert.match(p60, /مستوى مائل أملس/);
  assert.match(p60, /أحلل قوة ثقله إلى مركبتين متعامدتين/);
  assert.match(p62, /شدة محصلتهما[^]*15 N/);
  assert.deepEqual(question('q17').sourcePages, [60]);
  assert.doesNotMatch(question('q17').prompt, /α|θ/);
  assert.match(question('q17').prompt, /<annotation encoding="application\/x-tex">a<\/annotation>/);
  assert.ok(question('q17').prompt.includes(V_R));
  assert.deepEqual(question('q20').sourcePages, [60]);
  assert.ok(question('q20').prompt.includes(V_OX));
  assert.ok(question('q20').prompt.includes(V_OY));
  assert.ok(question('q10').prompt.includes(V_OX));
  assert.ok(question('q10').prompt.includes(V_OY));
  assert.ok(question('q13').options[0].content.includes('\\vec{\\mathrm{OM}}'));
  assert.ok(question('q13').options[0].content.includes('<mover accent="true">'));
  assert.ok(question('q04').options[2].content.includes('<span class="math math-inline" dir="ltr"'));
  assert.ok(question('q05').prompt.includes('class="ltr-isolate"'));
  assert.ok(question('q11').prompt.includes('class="ltr-isolate"'));
  assert.ok(question('q16').fields[0].content.includes('class="ltr-isolate"'));
  assert.ok(question('q19').inputHint.includes('class="ltr-isolate"'));
  assert.ok(SOLUTIONS.q16.answerHtml.includes('class="ltr-isolate"'));
  assert.ok(SOLUTIONS.q17.answerHtml.includes(V_R));
  assert.ok(SOLUTIONS.q17.answerHtml.includes('<annotation encoding="application/x-tex">a</annotation>'));
});

test('static test diagrams are source-neutral, descriptive, and contain no interactive simulation controls', () => {
  const concurrent = assessmentDiagramMarkup(question('q04'));
  const components = assessmentDiagramMarkup(question('q13'));
  for (const markup of [concurrent, components]) {
    assert.match(markup, /<figure class="assessment-figure"/);
    assert.match(markup, /<svg[^>]+role="img"/);
    assert.match(markup, /<title/);
    assert.match(markup, /<desc/);
    assert.match(markup, /<figcaption/);
    assert.doesNotMatch(markup, /<input\b|<button\b|<script\b|<animate\b|<foreignObject\b/);
  }
  assert.match(concurrent, /حوامل قوى تلتقي عند O/);
  assert.match(concurrent, /لا يستنتج من الرسم تساوي القوى أو اتزان الجسم/);
  const carriers = [...concurrent.matchAll(/<line class="assessment-carrier" x1="([0-9.]+)" y1="([0-9.]+)" x2="([0-9.]+)" y2="([0-9.]+)"/g)]
    .map((match) => match.slice(1).map(Number));
  assert.equal(carriers.length, 3);
  const origin = { x: 210, y: 125 };
  for (const [index, [x1, y1, x2, y2]] of carriers.entries()) {
    if (index === 2) continue;
    const [tipX, tipY] = index === 0 ? [126, 181] : [294, 181];
    const cross = (x2 - x1) * (origin.y - y1) - (y2 - y1) * (origin.x - x1);
    const arrowCross = (x2 - x1) * (tipY - y1) - (y2 - y1) * (tipX - x1);
    assert.equal(cross, 0, 'all three carriers share point O');
    assert.equal(arrowCross, 0, 'each diagonal force arrow lies on its carrier');
  }
  const [verticalX1, verticalY1, verticalX2, verticalY2] = carriers[2];
  assert.equal(verticalX1, verticalX2);
  assert.equal(origin.x, verticalX1);
  assert.ok(origin.y >= verticalY1 && origin.y <= verticalY2);
  assert.match(concurrent, /assessment-force force-three" x1="210" y1="125" x2="210" y2="198"/);
  assert.match(components, /قوة أصلية ومركبتان متعامدتان/);
  assert.ok(components.includes(V_OM));
  assert.ok(components.includes(V_OX));
  assert.ok(components.includes(V_OY));
  assert.equal(assessmentDiagramMarkup(question('q05')), '');
});

test('a new attempt begins without a score, answer key, or revealed correctness', () => {
  const initial = createAssessmentState();
  assert.deepEqual(initial, { status: 'not-started', currentIndex: 0, answers: {}, results: null });
  assert.equal(canRevealResults(initial), false);
  assert.equal(canRevealSolutions(initial), false);

  const started = startAssessment(initial);
  const drafted = recordAnswer(started, question('q01'), 'balanced');
  assert.equal(drafted.status, 'in-progress');
  assert.deepEqual(drafted.answers, { q01: 'balanced' });
  assert.equal(drafted.results, null);
  assert.equal(canRevealResults(drafted), false);
  assert.equal(canRevealSolutions(drafted), false);
  assert.ok(!Object.hasOwn(drafted, 'score'));
  assert.ok(!Object.hasOwn(drafted, 'correctQuestionIds'));
  assert.equal(started.answers.q01, undefined, 'recording an answer leaves the prior draft state unchanged');
});

test('final submission calculates correct, incorrect, and percentage totals; blank answers count as incorrect', () => {
  const blank = startAssessment(createAssessmentState());
  const blankResult = submitAssessment(blank, QUESTIONS, ANSWER_KEY);
  assert.equal(blankResult.status, 'submitted');
  assert.deepEqual(blankResult.results, { total: 20, correct: 0, incorrect: 20, percentage: 0, correctQuestionIds: [] });
  assert.equal(canRevealResults(blankResult), true);
  assert.equal(canRevealSolutions(blankResult), true);

  const partlyCorrect = completedState({
    q01: 'balanced',
    q02: 'true',
    q03: ['common-point'],
    q04: '',
    q05: '7 N',
    q06: ['draw-resultant', 'draw-forces', 'complete-parallelogram'],
    q07: { ...ANSWER_KEY.q07, sense: 'common-point' },
    q08: 'from-common-point',
    q09: 'false',
    q10: ['perpendicular-projections', 'sum-is-original'],
    q11: '100',
    q12: 'ignored-angle',
    q13: 'vector-sum',
    q14: '9 N',
    q15: 'equal-opposite',
    q16: ANSWER_KEY.q16,
    q17: 'preserve-a-review-r',
    q18: ANSWER_KEY.q18,
    q19: '0.6',
    q20: ANSWER_KEY.q20,
  });
  const result = submitAssessment(partlyCorrect, QUESTIONS, ANSWER_KEY);
  assert.equal(result.results.correct, 13);
  assert.equal(result.results.incorrect, 7);
  assert.equal(result.results.percentage, 65);
  assert.equal(result.results.total, 20);
  assert.equal(result.results.correctQuestionIds.length, 13);
});

test('repeated submit is idempotent; editing a submitted attempt is rejected', () => {
  const before = completedState();
  const submitted = submitAssessment(before, QUESTIONS, ANSWER_KEY);
  assert.equal(submitted.results.percentage, 100);
  assert.strictEqual(submitAssessment(submitted, QUESTIONS, ANSWER_KEY), submitted);
  assert.strictEqual(startAssessment(submitted), submitted);
  assert.strictEqual(recordAnswer(submitted, question('q01'), 'balanced'), submitted);
  assert.strictEqual(moveToQuestion(submitted, 4, QUESTIONS.length), submitted);
  assert.equal(submitted.results.correct, 20);
});

test('restart erases all answers, navigation, and results and starts a clean attempt', () => {
  const submitted = submitAssessment(completedState(), QUESTIONS, ANSWER_KEY);
  const restarted = restartAssessment(submitted);
  assert.deepEqual(restarted, { status: 'not-started', currentIndex: 0, answers: {}, results: null });
  assert.equal(canRevealResults(restarted), false);
  assert.equal(canRevealSolutions(restarted), false);
  const restartedAndStarted = startAssessment(restarted);
  assert.equal(restartedAndStarted.status, 'in-progress');
  assert.deepEqual(restartedAndStarted.answers, {});
  assert.equal(restartedAndStarted.results, null);
});

test('question navigation clamps safely and cannot move before the attempt starts or after submission', () => {
  const initial = createAssessmentState();
  assert.strictEqual(moveToQuestion(initial, 9, 20), initial);
  const started = startAssessment(initial);
  assert.equal(moveToQuestion(started, -3, QUESTIONS.length).currentIndex, 0);
  assert.equal(moveToQuestion(started, 99, QUESTIONS.length).currentIndex, 19);
  assert.strictEqual(moveToQuestion(started, 1.5, QUESTIONS.length), started);
  assert.strictEqual(moveToQuestion(started, 1, 0), started);
});

test('multiple-select grading is order-independent and rejects omissions, duplicates, extras, and unknown choices', () => {
  const item = question('q03');
  assert.equal(answerIsCorrect(item, ['different-directions', 'common-point'], ANSWER_KEY.q03), true);
  assert.equal(questionIsAnswered(item, ['common-point', 'different-directions']), true);
  assert.equal(answerIsCorrect(item, ['common-point'], ANSWER_KEY.q03), false);
  assert.equal(questionIsAnswered(item, ['common-point', 'common-point']), false);
  assert.equal(answerIsCorrect(item, ['common-point', 'common-point'], ANSWER_KEY.q03), false);
  assert.equal(questionIsAnswered(item, ['common-point', 'unknown']), false);
  assert.equal(answerIsCorrect(item, ['common-point', 'different-directions', 'equal-arrows'], ANSWER_KEY.q03), false);
  assert.equal(questionIsAnswered(item, []), false);
  assert.equal(validateAnswerKey(item, ['common-point', 'different-directions']), true);
  assert.equal(validateAnswerKey(item, ['common-point', 'common-point']), false);
  assert.equal(validateAnswerKey(item, ['not-an-option']), false);
});

test('ordering grading requires each item exactly once and the exact intended sequence', () => {
  const item = question('q06');
  const correct = ['draw-forces', 'complete-parallelogram', 'draw-resultant'];
  assert.equal(questionIsAnswered(item, correct), true);
  assert.equal(answerIsCorrect(item, correct, correct), true);
  assert.equal(answerIsCorrect(item, [...correct].reverse(), correct), false);
  assert.equal(questionIsAnswered(item, ['draw-forces', 'draw-forces', 'draw-resultant']), false);
  assert.equal(answerIsCorrect(item, ['draw-forces', 'draw-forces', 'draw-resultant'], correct), false);
  assert.equal(questionIsAnswered(item, ['draw-forces', '', 'draw-resultant']), false);
  assert.equal(questionIsAnswered(item, ['draw-forces', 'unknown', 'draw-resultant']), false);
  assert.equal(validateAnswerKey(item, correct), true);
  assert.equal(validateAnswerKey(item, ['draw-forces', 'draw-forces', 'draw-resultant']), false);
  assert.equal(validateAnswerKey(item, ['draw-forces', 'unknown', 'draw-resultant']), false);
});

test('matching grading verifies complete, unique mappings and rejects duplicates, omissions, and foreign fields', () => {
  const item = question('q07');
  const key = ANSWER_KEY.q07;
  assert.equal(questionIsAnswered(item, key), true);
  assert.equal(answerIsCorrect(item, key, key), true);
  const wrong = { ...key, carrier: key.sense, sense: key.carrier };
  assert.equal(questionIsAnswered(item, wrong), true);
  assert.equal(answerIsCorrect(item, wrong, key), false);
  assert.equal(questionIsAnswered(item, { ...key, carrier: key.application }), false);
  assert.equal(answerIsCorrect(item, { ...key, carrier: key.application }, key), false);
  const missing = { ...key };
  delete missing.magnitude;
  assert.equal(questionIsAnswered(item, missing), false);
  assert.equal(validateAnswerKey(item, key), true);
  assert.equal(validateAnswerKey(item, { ...key, extra: 'common-point' }), false);
  assert.equal(validateAnswerKey(item, { ...key, carrier: 'not-a-match' }), false);
});

test('numeric parser accepts supported decimal, Arabic-digit, unit, and fraction forms without evaluating expressions', () => {
  assert.equal(parseNumericResponse('100', 'N'), 100);
  assert.equal(parseNumericResponse('100 N', 'N'), 100);
  assert.equal(parseNumericResponse('100 newtons', 'N'), 100);
  assert.equal(parseNumericResponse('١٠٠ نيوتن', 'N'), 100);
  assert.equal(parseNumericResponse('۱۰۰ N', 'N'), 100);
  assert.equal(parseNumericResponse('٦٠٫٥ N', 'N'), 60.5);
  assert.equal(parseNumericResponse('60,5 N', 'N'), 60.5);
  assert.equal(parseNumericResponse('1,000 N', 'N'), 1000);
  assert.equal(parseNumericResponse('1 000 N', 'N'), 1000);
  assert.equal(parseNumericResponse('15 سم', 'cm'), 15);
  assert.equal(parseNumericResponse('0.6', null), 0.6);
  assert.equal(parseNumericResponse('0,6', null), 0.6);
  assert.equal(parseNumericResponse('3/5', null), 0.6);
  assert.equal(parseNumericResponse('3/0', null), null);
  assert.equal(parseNumericResponse('3/5 N', 'N'), 0.6, 'a numeric fraction may carry the expected unit');
  assert.equal(parseNumericResponse('6 cm', 'N'), null, 'wrong units are rejected');
  assert.equal(parseNumericResponse('6 N', null), null, 'unitless ratios reject units');
  assert.equal(parseNumericResponse('6 + 1 N', 'N'), null, 'arithmetic expressions are not evaluated');
  assert.equal(parseNumericResponse('NaN', 'N'), null);
  assert.equal(parseNumericResponse('Infinity', 'N'), null);
  assert.equal(parseNumericResponse('1/1/1', null), null);
  assert.equal(parseNumericResponse('   ', 'N'), null);
  assert.equal(parseNumericResponse(null, 'N'), null);
});

test('numeric grading enforces units and the authored tolerances rather than accepting arbitrary numeric input', () => {
  const graphical = question('q05');
  assert.equal(answerIsCorrect(graphical, '6', ANSWER_KEY.q05), true);
  assert.equal(answerIsCorrect(graphical, '6 N', ANSWER_KEY.q05), true);
  assert.equal(answerIsCorrect(graphical, '٦ نيوتن', ANSWER_KEY.q05), true);
  assert.equal(answerIsCorrect(graphical, '6.05', ANSWER_KEY.q05), true);
  assert.equal(answerIsCorrect(graphical, '6.051 N', ANSWER_KEY.q05), false);
  assert.equal(answerIsCorrect(graphical, '6 cm', ANSWER_KEY.q05), false);
  assert.equal(answerIsCorrect(graphical, '6 + 0 N', ANSWER_KEY.q05), false);
  assert.equal(answerIsCorrect(question('q11'), '100 N', ANSWER_KEY.q11), true);
  assert.equal(answerIsCorrect(question('q14'), '9.02N', ANSWER_KEY.q14), true);
  assert.equal(answerIsCorrect(question('q14'), '9.06N', ANSWER_KEY.q14), false);
  assert.equal(answerIsCorrect(question('q19'), '3/5', ANSWER_KEY.q19), true);
  assert.equal(answerIsCorrect(question('q19'), '0.6000009', ANSWER_KEY.q19), true);
  assert.equal(answerIsCorrect(question('q19'), '0.60001', ANSWER_KEY.q19), false);
  assert.equal(questionIsAnswered(graphical, 'not a number'), true);
  assert.equal(answerIsCorrect(graphical, 'not a number', ANSWER_KEY.q05), false);
  assert.equal(questionIsAnswered(graphical, '   '), false);
  assert.equal(answerIsCorrect(graphical, '', ANSWER_KEY.q05), false);
});

test('answer-key schema validation rejects malformed values and unit mismatches', () => {
  assert.equal(validateAnswerKey(question('q01'), 'concurrent'), true);
  assert.equal(validateAnswerKey(question('q01'), 'absent'), false);
  assert.equal(validateAnswerKey(question('q05'), { value: 6, tolerance: 0.1, unit: 'N' }), true);
  assert.equal(validateAnswerKey(question('q05'), { value: 6, tolerance: -1, unit: 'N' }), false);
  assert.equal(validateAnswerKey(question('q05'), { value: Infinity, tolerance: 0, unit: 'N' }), false);
  assert.equal(validateAnswerKey(question('q05'), { value: 6, tolerance: 0, unit: 'cm' }), false);
  assert.equal(validateAnswerKey(question('q19'), { value: 0.6, tolerance: 0, unit: 'N' }), false);
});

test('lesson-test entry is accessible, RTL, separate from Teacher Area and the sequential lesson, and linked minimally', async () => {
  const [pageHtml, homeHtml, appSource, css, buildSource, lessonEntry, teacherPage] = await Promise.all([
    readFile(new URL('../lesson-test.html', import.meta.url), 'utf8'),
    readFile(new URL('../lesson-1.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/lesson-assessment.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/lesson-test.css', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../teacher.html', import.meta.url), 'utf8'),
  ]);
  assert.match(pageHtml, /<html lang="ar" dir="rtl">/);
  assert.match(pageHtml, /href="\.\/src\/lesson-test\.css"/);
  assert.match(pageHtml, /src="\.\/src\/lesson-assessment\.js"/);
  assert.match(pageHtml, /class="assessment-skip-link" href="#assessment-main"/);
  assert.match(pageHtml, /<main class="assessment-main" id="assessment-main">/);
  assert.match(pageHtml, /<dialog[^]*aria-labelledby="assessment-dialog-title"[^]*aria-describedby="assessment-dialog-message"/);
  assert.match(appSource, /<nav class="question-navigation" aria-label="التنقل بين أسئلة الاختبار">/);
  assert.match(appSource, /aria-current="step"/);
  assert.match(appSource, /role="progressbar" aria-label="تقدم تسجيل الإجابات، وليس الدرجة"/);
  assert.match(appSource, /role="status" aria-live="polite"/);
  assert.match(appSource, /aria-describedby="question-prompt question-instruction/);
  assert.match(appSource, /<legend class="visually-hidden">/);
  assert.match(appSource, /data-answer-control="numeric"/);
  assert.match(appSource, /data-answer-control="ordering"/);
  assert.match(appSource, /data-answer-control="matching"/);
  assert.match(appSource, /<button class="test-button quiet" type="button" data-action="restart">إعادة الاختبار/);
  assert.match(appSource, /مسح الإجابات والبدء من جديد/);
  assert.match(css, /\.assessment-page :focus-visible/);
  assert.match(css, /\.assessment-skip-link/);
  assert.match(homeHtml, /href="\.\/lesson-test\.html"[^>]*>اختبار الدرس<\/a>/);
  assert.equal((homeHtml.match(/href="\.\/lesson-test\.html"/g) ?? []).length, 1);
  assert.match(homeHtml, /href="\.\/teacher\.html"[^>]*>منطقة المعلم/);
  assert.doesNotMatch(pageHtml, /teacher\.html|teacher\.js|teacher-auth|Teacher Area|منطقة المعلم/);
  assert.doesNotMatch(appSource, /src\/main\.js|simulation\.js|force-resolution/);
  assert.doesNotMatch(lessonEntry, /lesson-assessment\.js|lesson-test-solutions\.js/);
  assert.doesNotMatch(teacherPage, /lesson-test\.html|lesson-test-solutions\.js/);
  assert.match(buildSource, /lesson-test\.html/);
});

test('answer key loads only at final submission; drafts are not persisted or graded in the answer view', async () => {
  const appSource = await readFile(new URL('../src/lesson-assessment.js', import.meta.url), 'utf8');
  const dataSource = await readFile(new URL('../src/lesson-test-data.js', import.meta.url), 'utf8');
  assert.doesNotMatch(appSource, /^import[^\n]*lesson-test-solutions\.js/m);
  assert.match(appSource, /await import\('\.\/lesson-test-solutions\.js'\)/);
  assert.match(appSource, /if \(!canRevealResults\(state\) \|\| !canRevealSolutions\(state\)\) return;/);
  assert.match(appSource, /const submitted = submitAssessment\(state, QUESTIONS, solutionModule\.ANSWER_KEY\)/);
  assert.match(appSource, /بعد التسليم النهائي/);
  assert.doesNotMatch(appSource, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(dataSource, /ANSWER_KEY|answerKey\s*:|explanationHtml/);
});

test('final results expose the exact four solution groups, score totals, and per-question verdicts only after submission', async () => {
  const appSource = await readFile(new URL('../src/lesson-assessment.js', import.meta.url), 'utf8');
  assert.match(appSource, /الإجابات الصحيحة|صحيحة/);
  assert.match(appSource, /غير صحيحة/);
  assert.match(appSource, /النسبة/);
  assert.match(appSource, /إجابة صحيحة/);
  assert.match(appSource, /إجابة غير صحيحة/);
  assert.match(appSource, /لم تتم الإجابة/);
  assert.match(appSource, /إجابتك:/);
  assert.match(appSource, /الإجابة الصحيحة:/);
  assert.equal(SOLUTION_GROUPS.flatMap((group) => group.items).length, 20);
  assert.equal(new Set(SOLUTION_GROUPS.flatMap((group) => group.questionIds)).size, 20);
  assert.equal(LESSON_TEST.questions.length, 20);
});

test('Phase 5 adds no Unit Test page, route, completion behavior, or future test entry', async () => {
  const [homeHtml, testPage, appSource, buildSource, packageJson] = await Promise.all([
    readFile(new URL('../lesson-1.html', import.meta.url), 'utf8'),
    readFile(new URL('../lesson-test.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/lesson-assessment.js', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ]);
  for (const content of [homeHtml, testPage, appSource, buildSource]) {
    assert.doesNotMatch(content, /unit-test\.html|unit-test\.js|completeUnit|unitCompletion|اختبار الوحدة/iu);
  }
  assert.equal(existsSync(new URL('../unit-test.html', import.meta.url)), false);
  assert.equal(existsSync(new URL('../src/unit-test.js', import.meta.url)), false);
  assert.doesNotMatch(packageJson, /unit-test/i);
  assert.equal(LESSON_PAGES.length, 8, 'the existing lesson sequence remains pages 55–62');
  assert.doesNotMatch(testPage, /<iframe|src="\.\/src\/main\.js"/);
});
