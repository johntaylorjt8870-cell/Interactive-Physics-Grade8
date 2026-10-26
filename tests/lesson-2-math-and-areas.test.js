import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LESSON_2_PAGES } from '../src/lesson-2-content.js';
import { renderTeacherContent } from '../src/lesson-2-teacher-content.js';
import { SOLUTIONS } from '../src/lesson-2-test-solutions.js';
import { PRACTICE_DECK, SELF_CHECK_ITEMS, TEXTBOOK_PROBLEMS } from '../src/lesson-2-practice-data.js';
import { lesson2SimulationMarkup } from '../src/lesson-2-simulation.js';
import { verifyTeacherPassword } from '../src/teacher-auth.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const texOf = (html) => [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)]
  .map((match) => match[1]);

function lesson2MathHtml() {
  return [
    ...LESSON_2_PAGES.flatMap((page) => page.blocks),
    renderTeacherContent(),
    ...Object.values(SOLUTIONS).map((item) => `${item.explanationHtml}${item.answerHtml}`),
    ...Object.values(SELF_CHECK_ITEMS).flatMap((item) => [item.explanation, ...Object.values(item.optionFeedback ?? {})]),
    ...Object.values(TEXTBOOK_PROBLEMS).flatMap((problem) => [problem.lead, ...(problem.givens ?? [])]),
    ...PRACTICE_DECK.flatMap((item) => [item.prompt, item.explanation ?? '', ...item.options.map((option) => option.label)]),
    lesson2SimulationMarkup('parallel-definition-lab'),
    lesson2SimulationMarkup('parallel-resultant-lab'),
  ].filter(Boolean).join('\n');
}

/* Lesson 2 stored TeX commands with a doubled backslash (`\\\\times` in a JS
   string). KaTeX read the first pair as a line break and printed the word
   "times"/"div"/"dfrac" instead of ×/÷/a fraction, splitting operations over
   several rows. This is the regression guard for student, teacher and test
   content alike. */
test('Lesson 2 math renders real operators, units and fractions with no leaked line breaks', () => {
  const html = lesson2MathHtml();
  const sources = texOf(html);
  assert.ok(sources.length > 200, 'the whole Lesson 2 math surface is covered');
  assert.equal((html.match(/linebreak="newline"/g) ?? []).length, 0);
  for (const source of sources) {
    assert.equal([...source].filter((character) => character.charCodeAt(0) < 32).length, 0,
      `control character in ${source}`);
    let run = 0;
    for (const character of source) {
      run = character === '\\' ? run + 1 : 0;
      assert.ok(run < 2, `doubled backslash (TeX line break) in ${source}`);
    }
    assert.doesNotMatch(source.replace(/\\[a-zA-Z]+/g, ''),
      /times|div|dfrac|frac|mathrm|Rightarrow|quad|cdot|approx/,
      `command printed as a word in ${source}`);
  }
  for (const symbol of ['F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F_{1}=20\\,\\mathrm{N}', '\\dfrac{F_{1}}{d_{2}}']) {
    assert.ok(sources.some((source) => source.includes(symbol)), `expected typeset symbol ${symbol}`);
  }
});

test('arithmetic operation chains stay on one line with slash notation', async () => {
  const files = [
    '../src/lesson-2-content.js',
    '../src/lesson-2-teacher-content.js',
    '../src/lesson-2-test-solutions.js',
  ];
  for (const file of files) {
    const source = await read(file);
    const calls = [...source.matchAll(/\b(?:calculation|eq)\(\s*'([^']*)'/g)].map((match) => match[1]);
    assert.ok(calls.length > 0, `${file} contains operation chains`);
    for (const call of calls) {
      assert.doesNotMatch(call, /\\(?:dfrac|frac)\b/, `${file}: stacked fraction inside an operation: ${call}`);
      assert.doesNotMatch(call, /\\{4}/, `${file}: TeX line break inside an operation: ${call}`);
    }
  }
  const [student, teacher, solutions] = await Promise.all(files.map(read));
  assert.match(student, /50\/0\.5=20\/d_\{2\}/);
  assert.match(teacher, /300\/d_\{1\}=100\/60/);
  assert.match(solutions, /d_\{A\}=F_\{2\}d\/F/);
});

const TEACHER_PAGES = Object.freeze([
  ['teacher.html', 'src/teacher.js'],
  ['lesson-2-teacher.html', 'src/lesson-2-teacher.js'],
  ['unit-questions-teacher.html', 'src/unit-questions-teacher.js'],
  ['unit2-exercises-teacher.html', 'src/unit2-exercises-teacher.js'],
  ['unit2-lesson-1-teacher.html', 'src/unit2-lesson1-teacher.js'],
  ['unit2-lesson-2-teacher.html', 'src/unit2-lesson2-teacher.js'],
  ['unit2-lesson-3-teacher.html', 'src/unit2-lesson3-teacher.js'],
  ['unit2-lesson-4-teacher.html', 'src/unit2-lesson4-teacher.js'],
]);

const TEST_PAGES = Object.freeze([
  ['lesson-test.html', 'src/lesson-assessment.js'],
  ['lesson-2-test.html', 'src/lesson-2-assessment.js'],
  ['unit-1-test.html', 'src/unit-1-assessment.js'],
  ['unit-2-test.html', 'src/unit-2-assessment.js'],
  ['unit2-lesson-1-test.html', 'src/unit2-lesson1-assessment.js'],
  ['unit2-lesson-2-test.html', 'src/unit2-lesson2-assessment.js'],
  ['unit2-lesson-3-test.html', 'src/unit2-lesson3-assessment.js'],
]);

test('the teacher gate keeps the somer173 passphrase shared, hidden and lazy on every page', async () => {
  assert.equal(await verifyTeacherPassword('somer173'), true);
  assert.equal(await verifyTeacherPassword('wrong-pass'), false);
  for (const [page, boot] of TEACHER_PAGES) {
    const [html, entry] = await Promise.all([read(`../${page}`), read(`../${boot}`)]);
    assert.match(html, /id="teacher-workspace"[^>]*hidden/, page);
    assert.match(html, /type="password"/, page);
    assert.doesNotMatch(html, /somer173/, `${page} must not print the passphrase`);
    assert.match(entry, /verifyTeacherPassword/, `${boot} uses the shared verifier`);
    assert.doesNotMatch(entry, /somer173/, `${boot} must not embed the passphrase`);
    if (boot === 'src/unit2-exercises-teacher.js') {
      // This area ships an authenticated ciphertext instead of a JS module.
      assert.match(entry, /UNIT2_TEACHER_PAYLOAD/);
      assert.match(entry, /crypto\.subtle\.decrypt/);
      assert.match(entry, /passPasswordToContent:\s*true/);
    } else {
      assert.match(entry, /import\(['"]\.\/[^'"]*(?:teacher-)?content\.js['"]\)/, `${boot} lazy-loads its solutions`);
    }
  }
});

test('every test area keeps its answer key in a lazy-loaded solution module', async () => {
  const runtime = await read('../src/assessment-runtime.js');
  assert.doesNotMatch(runtime, /ANSWER_KEY\s*=|answerKey:\s*'/);
  for (const [page, boot] of TEST_PAGES) {
    const [html, entry] = await Promise.all([read(`../${page}`), read(`../${boot}`)]);
    assert.match(html, /id="assessment-root"/, page);
    assert.doesNotMatch(html, /ANSWER_KEY|answerKey/, `${page} must not print answers`);
    assert.match(entry, /import\(['"]\.\/[^'"]*test-solutions\.js['"]\)/, `${boot} lazy-loads solutions`);
    assert.doesNotMatch(entry, /const\s+ANSWER_KEY|answerKey:\s*['"]/, `${boot} must not embed the key`);
  }
  for (const group of [SOLUTIONS]) {
    assert.ok(Object.keys(group).length === 20, 'Lesson 2 test still ships 20 worked solutions');
    for (const solution of Object.values(group)) {
      assert.ok(solution.explanationHtml.length > 60, `${solution.questionId} has a worked explanation`);
    }
  }
});
