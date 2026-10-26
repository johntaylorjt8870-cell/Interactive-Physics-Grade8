import test from 'node:test';
import assert from 'node:assert/strict';
import { UNIT_2_QUESTIONS } from '../src/unit-2-test-data.js';
import { ANSWER_KEY, SOLUTIONS, SOLUTION_GROUPS } from '../src/unit-2-test-solutions.js';

const arabicChoiceLabels = { a: 'أ', b: 'ب', c: 'ج', d: 'د' };

test('Unit 2 solutions show the full correct choice text, not only its letter', () => {
  for (const question of UNIT_2_QUESTIONS) {
    const solution = SOLUTIONS[question.id];
    assert.ok(solution, `solution exists for ${question.id}`);
    const key = ANSWER_KEY[question.id];
    if (typeof key !== 'string') continue;
    const option = question.options.find((candidate) => candidate.id === key);
    assert.ok(option, `correct option exists for ${question.id}`);
    assert.ok(solution.answerHtml.includes(`الخيار ${arabicChoiceLabels[key]}:`), `${question.id} uses the Arabic option label`);
    assert.ok(solution.answerHtml.includes(option.content), `${question.id} displays the complete correct option text`);
    assert.doesNotMatch(solution.answerHtml, /الخيار [A-D](?:$|<)/i, `${question.id} does not expose a bare Latin option letter`);
  }
});

test('Unit 2 numeric solutions isolate the value and unit in left-to-right order', () => {
  const numericQuestions = UNIT_2_QUESTIONS.filter((question) => question.type === 'numeric');
  assert.equal(numericQuestions.length, 14);
  for (const question of numericQuestions) {
    const solution = SOLUTIONS[question.id];
    const key = ANSWER_KEY[question.id];
    assert.match(solution.answerHtml, /<bdi class="ltr-isolate" dir="ltr" aria-label="/);
    assert.ok(solution.answerHtml.includes(`${key.value} ${key.unit}`), `${question.id} keeps value and unit together`);
  }
});

test('every displayed Unit 2 solution equation has a meaningful non-TeX accessible label', () => {
  const labels = [];
  for (const solution of Object.values(SOLUTIONS)) {
    for (const match of solution.explanationHtml.matchAll(/class="math math-display equation" dir="ltr" role="math" aria-label="([^"]+)"/g)) {
      labels.push(match[1]);
    }
  }
  assert.ok(labels.length >= 28, 'the solution set includes the authored calculation steps');
  for (const label of labels) {
    assert.ok(label.trim().length > 8);
    assert.doesNotMatch(label, /\\\\|\\\\frac|\\\\times|[{}]|_\\{|\\^\\{/,
      `accessible label is prose rather than raw TeX: ${label}`);
    assert.notEqual(label, 'خطوة حسابية في الحل');
  }
});

test('all 56 solutions and the six ordered groups remain complete', () => {
  assert.equal(UNIT_2_QUESTIONS.length, 56);
  assert.equal(Object.keys(ANSWER_KEY).length, UNIT_2_QUESTIONS.length);
  assert.equal(Object.keys(SOLUTIONS).length, UNIT_2_QUESTIONS.length);
  assert.deepEqual(SOLUTION_GROUPS.map((group) => group.items.length), [10, 10, 10, 10, 10, 6]);
  assert.deepEqual(SOLUTION_GROUPS.flatMap((group) => group.questionIds), UNIT_2_QUESTIONS.map((question) => question.id));
  for (const question of UNIT_2_QUESTIONS) {
    assert.equal(SOLUTIONS[question.id].answerKey, ANSWER_KEY[question.id]);
    assert.equal(SOLUTIONS[question.id].questionId, question.id);
  }
});
