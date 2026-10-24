import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import {
  UNIT2L3_META,
  UNIT2L3_PAGES,
  UNIT2L3_STATIONS,
} from '../src/unit2-lesson3-content.js';
import {
  convertPotentialDifference,
  missingSeriesPotentialDifference,
  parallelPotentialDifferences,
  sumSeriesPotentialDifferences,
  waterFlowDirection,
} from '../src/unit2-lesson3-physics.js';
import { UNIT2L3_DIAGRAMS, unit2l3DiagramMarkup } from '../src/unit2-lesson3-diagrams.js';
import { unit2l3SimulationMarkup } from '../src/unit2-lesson3-simulation.js';
import {
  UNIT2L3_PRACTICE_IDS,
  unit2l3PracticeMarkup,
} from '../src/unit2-lesson3-practice.js';
import { UNIT2L3_ANSWERS } from '../src/unit2-lesson3-answers.js';
import { UNIT2L3_TEST, UNIT2L3_QUESTIONS } from '../src/unit2-lesson3-test-data.js';
import { unit2l3AssessmentDiagram } from '../src/unit2-lesson3-test-diagrams.js';
import { ANSWER_KEY, SOLUTIONS, SOLUTION_GROUPS } from '../src/unit2-lesson3-test-solutions.js';
import {
  canRevealResults,
  canRevealSolutions,
  createAssessmentState,
  recordAnswer,
  restartAssessment,
  startAssessment,
  submitAssessment,
  validateAnswerKey,
} from '../src/lesson-test-engine.js';
import { renderTeacherContent } from '../src/unit2-lesson3-teacher-content.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const pageSource = (pageNumber) => UNIT2L3_PAGES.find((page) => page.page === pageNumber)?.blocks
  .filter((block) => block.type === 'book').map((block) => block.html).join('') ?? '';
const platformBlocks = UNIT2L3_PAGES.flatMap((page) => page.blocks
  .filter((block) => block.type === 'platform').map((block) => ({ page: page.page, ...block })));

function expectedLetters() {
  return Array.from({ length: 20 }, (_, index) => `u2l3q${String(index + 1).padStart(2, '0')}`);
}

test('Unit 2 Lesson 3 has audited pp97–106 entries, correct course order, and completed Unit 2 test', async () => {
  assert.deepEqual(UNIT2L3_META.sourcePages, [97, 98, 99, 100, 101, 102, 103, 104, 105, 106]);
  assert.equal(UNIT2L3_META.title, 'فرق الكمون الكهربائي');
  assert.equal(UNIT2L3_META.pages, '97–106');
  assert.deepEqual(UNIT2L3_PAGES.map((page) => page.page), UNIT2L3_META.sourcePages);
  assert.deepEqual(UNIT2L3_STATIONS.flatMap((station) => station.pages), UNIT2L3_META.sourcePages);

  const [student, teacher, assessment, home, build, lesson1, lesson2] = await Promise.all([
    read('../unit2-lesson-3.html'), read('../unit2-lesson-3-teacher.html'), read('../unit2-lesson-3-test.html'),
    read('../index.html'), read('../scripts/build.mjs'), read('../unit2-lesson-1.html'), read('../unit2-lesson-2.html'),
  ]);
  for (const path of ['../unit2-lesson-3.html', '../unit2-lesson-3-teacher.html', '../unit2-lesson-3-test.html']) {
    assert.equal(existsSync(new URL(path, import.meta.url)), true, path);
  }
  assert.match(student, /<html lang="ar" dir="rtl">/);
  assert.match(student, /فرق الكمون الكهربائي/);
  assert.match(student, /TEXTBOOK · 97—106/);
  assert.match(student, /unit2-lesson3-main\.js/);
  assert.match(student, /unit2-lesson-3-test\.html/);
  assert.match(student, /unit2-lesson-3-teacher\.html/);
  assert.match(student, /unit2-lesson-2\.html/);
  assert.match(teacher, /unit2-lesson3-teacher\.js/);
  assert.match(assessment, /unit2-lesson3-assessment\.js/);
  assert.match(assessment, /20 سؤالاً/);

  const unitTwoStart = home.indexOf('<div class="unit-panel">', home.indexOf('<div class="unit-panel">') + 1);
  const unitTwoEnd = home.indexOf('<div class="unit-panel">', unitTwoStart + 10);
  const unitTwoPanel = home.slice(unitTwoStart, unitTwoEnd < 0 ? home.indexOf('</section>', unitTwoStart) : unitTwoEnd);
  assert.deepEqual([...unitTwoPanel.matchAll(/href="\.\/unit2-lesson-([123])\.html"/g)].map((match) => Number(match[1])), [1, 2, 3]);
  assert.ok(unitTwoPanel.indexOf('unit2-lesson-2.html') < unitTwoPanel.indexOf('unit2-lesson-3.html'));
  assert.match(home, /href="\.\/unit2-lesson-3-test\.html"/);
  assert.match(home, /unit-2-test\.html/);
  assert.match(build, /unit-2-test\.html/);
  for (const entry of ['unit2-lesson-3.html', 'unit2-lesson-3-teacher.html', 'unit2-lesson-3-test.html']) {
    assert.ok(build.includes(`'${entry}'`), `static build must copy ${entry}`);
  }

  // Prior Unit 2 lessons keep their own direct entries and lesson-specific modules.
  assert.match(lesson1, /unit2-lesson1-main\.js/);
  assert.match(lesson1, /unit2-lesson-1-test\.html/);
  assert.match(lesson2, /unit2-lesson2-main\.js/);
  assert.match(lesson2, /unit2-lesson-2-test\.html/);
  assert.match(home, /unit2-lesson-1\.html/);
  assert.match(home, /unit2-lesson-2\.html/);
});

test('source content covers each printed page, section, activity, and requested question part', () => {
  assert.equal(pageSource(97).includes('الأهداف:'), true);
  assert.equal((pageSource(97).match(/ما الذي/g) ?? []).length, 2, 'both opening questions');
  for (const phrase of ['أقارن بين ارتفاعي', 'أفتح الصنبور في الحالة الأولى', 'أفتح الصنبور في الحالة الثانية', 'أفسّر مستعيناً بالشكل (3)']) {
    assert.ok(pageSource(98).includes(phrase), `p98 ${phrase}`);
  }
  const p99Questions = pageSource(99).match(/<ol>([\s\S]*?)<\/ol>/)?.[1] ?? '';
  assert.equal((p99Questions.match(/<li>/g) ?? []).length, 6, 'all six «أقرأ وأستنتج» items');
  const p100Steps = pageSource(100).match(/<h5>الخطوات:<\/h5><ol>([\s\S]*?)<\/ol>/)?.[1] ?? '';
  assert.equal((p100Steps.match(/<li>/g) ?? []).length, 4, 'four experiment steps');
  assert.equal((pageSource(101).match(/<li>/g) ?? []).length, 7, 'four steps and three nested meter readings');
  assert.ok(pageSource(101).includes('U=U_{1}+U_{2}'));
  assert.match(pageSource(101), /class="math math-display equation"[^]*<math[^]*<annotation encoding="application\/x-tex">U=U_\{1\}\+U_\{2\}<\/annotation>/);
  assert.match(pageSource(105), /<span class="math math-inline" dir="ltr"/);
  assert.equal((pageSource(102).match(/<li>/g) ?? []).length, 7, 'four experiment steps and three meter readings, in addition to the activity');
  for (const phrase of ['12', '5', 'على التسلسل', 'على التفرع', 'نشاط']) assert.ok(pageSource(102).includes(phrase), `p102 ${phrase}`);
  assert.ok(pageSource(103).includes('6'));
  for (const phrase of ['220', '110', 'محول خافض للكمون', 'ابحث عن أنواع المحولات']) assert.ok(pageSource(103).includes(phrase), `p103 ${phrase}`);
  assert.equal((pageSource(104).match(/<li>/g) ?? []).length, 8, 'all eight summary statements');
  assert.equal((pageSource(105).match(/<li>/g) ?? []).length, 24, 'four MC questions with four options each, plus four true/false statements');
  assert.ok(pageSource(105).includes('0.0001'));
  assert.equal((pageSource(106).match(/<li>/g) ?? []).length, 4, 'all four fill-in subparts');
  assert.equal(UNIT2L3_META.originalSelfCheck.totalParts, 12);

  assert.equal(platformBlocks.length, 10);
  assert.ok(platformBlocks.every((block) => block.title && block.html));
  assert.ok(platformBlocks.some((block) => block.title.includes('شرح المنصة')));
  assert.ok(UNIT2L3_PAGES.every((page) => page.blocks.some((block) => block.type === 'book')));
});

test('practice layer: one interactive activity per book task, wired in reading order, without shipped answers', async () => {
  const EXPECTED = [
    [98, ['p98-observe']],
    [99, ['p99-think']],
    [100, ['p100-lab']],
    [101, ['p101-series-lab']],
    [102, ['p102-series-activity', 'p102-parallel-lab']],
    [103, ['p103-parallel-activity']],
    [105, ['p105-mcq', 'p105-true-false']],
    [106, ['p106-blanks']],
  ];
  const practiceBlocks = UNIT2L3_PAGES.flatMap((page) => page.blocks
    .filter((block) => block.type === 'practice').map((block) => [page.page, block.id]));
  assert.deepEqual(practiceBlocks, EXPECTED.flatMap(([page, ids]) => ids.map((id) => [page, id])));
  for (const [page, ids] of EXPECTED) {
    const pageEntry = UNIT2L3_PAGES.find((candidate) => candidate.page === page);
    for (const id of ids) {
      const blockIndex = pageEntry.blocks.findIndex((block) => block.type === 'practice' && block.id === id);
      assert.ok(blockIndex > 0, `${id} sits after its book copy`);
      assert.ok(pageEntry.blocks.slice(0, blockIndex).some((block) => block.type === 'book'), `${id} has book text before it`);
    }
  }
  assert.deepEqual([...UNIT2L3_PRACTICE_IDS].sort(), EXPECTED.flatMap(([, ids]) => ids).sort());
  for (const id of UNIT2L3_PRACTICE_IDS) {
    const markup = unit2l3PracticeMarkup(id);
    assert.ok(markup.includes(`data-u2l3-practice="${id}"`), id);
    for (const control of ['data-p3p-action="check"', 'data-p3p-action="hint"', 'data-p3p-action="solution"', 'data-p3p-action="reset"', 'role="status"', 'aria-live="polite"']) {
      assert.ok(markup.includes(control), `${id} exposes ${control}`);
    }
    assert.doesNotMatch(markup, /data-correct|data-answer|إجابتك صحيحة|الإجابة الصحيحة هي/, `${id} ships no answer key`);
    assert.throws(() => unit2l3PracticeMarkup(`${id}-x`), RangeError);
  }
  const answersIds = new Set(Object.keys(UNIT2L3_ANSWERS));
  assert.deepEqual(answersIds, new Set(UNIT2L3_PRACTICE_IDS), 'every activity has a lazy answer spec and vice versa');
  for (const [id, spec] of Object.entries(UNIT2L3_ANSWERS)) {
    assert.ok(spec.items.length > 0, id);
    assert.ok(spec.hint.length > 12, id);
    assert.ok(spec.solution.title.length > 4, id);
    assert.ok(spec.solution.steps.length > 0, id);
    /* graded items carry either an exact key (correct) or an accepted-variants list (blanks) */
    assert.ok(spec.items.every((item) => item.id && (item.correct !== undefined || (Array.isArray(item.accepted) && item.accepted.length > 0))), id);
  }
  assert.deepEqual(UNIT2L3_ANSWERS['p105-mcq'].items.map((item) => item.correct), ['c', 'd', 'b', 'b']);
  assert.ok(UNIT2L3_ANSWERS['p105-true-false'].items.every((item) => item.correct === 'false'));
  assert.equal(UNIT2L3_ANSWERS['p106-blanks'].items.length, 7, 'seven blanks across the four sentences of p106');
  assert.ok(UNIT2L3_ANSWERS['p106-blanks'].items.every((item) => Array.isArray(item.accepted) && item.accepted.length > 0), 'p106 blanks accept variants');

  const p100 = unit2l3PracticeMarkup('p100-lab');
  assert.match(p100, /data-lab-toggle="close"/);
  assert.match(p100, /data-lab-toggle="open"/);
  assert.match(p100, /data-lab-reading="current"/);
  assert.match(p100, /data-lab-reading="lamp"/);
  assert.match(p100, /data-lab-reading="source"/);
  for (const id of ['p101-series-lab', 'p102-parallel-lab']) {
    const lab = unit2l3PracticeMarkup(id);
    for (const key of ['u', 'u1', 'u2']) {
      assert.ok(lab.includes(`data-lab-record="${key}"`), `${id} records ${key}`);
      assert.ok(lab.includes(`data-lab-reading="${key}"`), `${id} reads ${key}`);
    }
    assert.match(lab, /name="p3p-relation"/);
    assert.match(lab, /نموذج مبسّط/, `${id} labels the idealised model`);
    assert.match(lab, /aria-pressed="true"/, `${id} starts with the switch open`);
    /* labs start open-switch with no readings shown */
    assert.ok((lab.match(/>—</g) ?? []).length >= 3, `${id} shows placeholder dashes, not precomputed values`);
  }

  /* Parallel lab wiring must mirror the book (p102): switch and battery interrupt
     the return line (− left, + right), the source voltmeter lands on the two
     sides of the battery, and no bare wire ever joins the two branch chords. */
  const parallelLab = unit2l3PracticeMarkup('p102-parallel-lab');
  for (const wire of ['M200 412 H240', 'M284 412 H362', 'M380 412 H560']) {
    assert.ok(parallelLab.includes(`d="${wire}"`), `return line segment ${wire}`);
  }
  assert.ok(parallelLab.includes('M340 412 V470 H349'), 'source voltmeter taps the battery- minus side');
  assert.ok(parallelLab.includes('M393 470 H402 V412'), 'source voltmeter taps the battery- plus side');
  assert.ok(parallelLab.includes('data-lab-closed="h44"'), 'switch closes along the return line');
  for (const chord of ['M150 268 H358', 'M402 268 H610', 'M260 116 H358', 'M402 116 H500']) {
    assert.ok(parallelLab.includes(`d="${chord}"`), `parallel branch chord ${chord}`);
  }
  assert.ok(!parallelLab.includes('M620 110 V390'), 'no wire may short the two rails together');
  assert.ok(!parallelLab.includes('M140 110 H620'), 'rails must not span a bare frame');

  const [main, css] = await Promise.all([read('../src/unit2-lesson3-main.js'), read('../src/unit2-lesson3.css')]);
  assert.match(main, /mountUnit2Lesson3Practice/);
  assert.match(main, /unit2l3PracticeMarkup/);
  for (const rule of ['.p3p-item.is-correct', '.p3p-choice:has(input:focus-visible)', '.p3p-lab-stage', '.p3p-record-row', '.p3p-meter-reading']) {
    assert.ok(css.includes(rule), `css ${rule}`);
  }
});

test('all textbook diagrams are separately labelled platform artwork with accessible titles and descriptions', async () => {
  assert.deepEqual(Object.values(UNIT2L3_DIAGRAMS).map((diagram) => diagram.page), [97, 98, 98, 99, 99, 100, 101, 102, 103]);
  for (const [id, diagram] of Object.entries(UNIT2L3_DIAGRAMS)) {
    assert.ok(diagram.title.length > 4, id);
    assert.ok(diagram.description.length > 20, id);
    const markup = unit2l3DiagramMarkup(id, `test-${id}`);
    assert.match(markup, /رسم توضيحي من المنصة/);
    assert.match(markup, /role="img"/);
    assert.match(markup, /aria-labelledby="test-[^ ]+-title test-[^ ]+-desc"/);
    assert.match(markup, /<title/);
    assert.match(markup, /<desc/);
    assert.match(markup, /<figcaption/);
  }

  const css = await read('../src/unit2-lesson3.css');
  assert.match(css, /\.p3-svg \.p3-meter\s*\{[^}]*fill:\s*#fff/s, 'voltmeter faces must stay readable on every reconstructed circuit');

  const pumpCircuit = unit2l3DiagramMarkup('pump-circuit', 'pump-test');
  assert.match(pumpCircuit, /data-part="voltmeter-generator"/);
  assert.match(pumpCircuit, /data-wire="voltmeter-upper"/);
  assert.match(pumpCircuit, /data-wire="voltmeter-lower"/);
  assert.match(pumpCircuit, /الفولتميتر على التفرع/);

  const series = unit2l3DiagramMarkup('series-circuit', 'series-test');
  const parallel = unit2l3DiagramMarkup('parallel-circuit', 'parallel-test');
  for (const [svg, names] of [
    [series, ['lamp-1', 'lamp-2', 'voltmeter-lamp-1', 'voltmeter-lamp-2', 'voltmeter-source']],
    [parallel, ['lamp-1', 'lamp-2', 'voltmeter-lamp-1', 'voltmeter-lamp-2', 'voltmeter-source']],
  ]) for (const name of names) assert.ok(svg.includes(`data-part="${name}"`), name);
  assert.match(series, /U₁/);
  assert.match(series, /U₂/);
  assert.match(parallel, /U₁/);
  assert.match(parallel, /U₂/);
  assert.throws(() => unit2l3DiagramMarkup('not-a-diagram'), RangeError);
});

test('potential-difference functions handle conversions, series, parallel, and water analogy boundaries', () => {
  assert.equal(convertPotentialDifference(3.6, 'kV', 'V'), 3600);
  assert.equal(convertPotentialDifference(25, 'kV', 'V'), 25000);
  assert.equal(convertPotentialDifference(2.4, 'V', 'mV'), 2400);
  assert.ok(Math.abs(convertPotentialDifference(820, 'mV', 'V') - 0.82) < 1e-12);
  assert.equal(convertPotentialDifference(1, 'mV', 'V'), 0.001);
  assert.equal(convertPotentialDifference(0.015, 'kV', 'mV'), 15000);
  assert.equal(convertPotentialDifference(4, 'V', 'V'), 4);

  assert.equal(sumSeriesPotentialDifferences([3.6, 5.4, 3]), 12);
  assert.equal(missingSeriesPotentialDifference(12, 5), 7);
  assert.deepEqual(parallelPotentialDifferences(6), [6, 6]);
  assert.deepEqual(parallelPotentialDifferences(9, 3), [9, 9, 9]);
  assert.equal(waterFlowDirection(7, 3, false), 'closed');
  assert.equal(waterFlowDirection(7, 3, true), 'a-to-b');
  assert.equal(waterFlowDirection(2, 8, true), 'b-to-a');
  assert.equal(waterFlowDirection(5, 5, true), 'balanced');

  assert.throws(() => convertPotentialDifference(1, 'V', '__proto__'), RangeError);
  assert.throws(() => convertPotentialDifference(-1, 'V', 'mV'), RangeError);
  assert.throws(() => sumSeriesPotentialDifferences([1]), TypeError);
  assert.throws(() => missingSeriesPotentialDifference(5, 6), RangeError);
  assert.throws(() => parallelPotentialDifferences(5, 0), RangeError);
  assert.throws(() => waterFlowDirection(1, 2, 'yes'), TypeError);
});

test('interactive lesson models are labelled, bounded, keyboard-friendly, and explicit-submit-only', async () => {
  const converter = unit2l3SimulationMarkup('conversion');
  const water = unit2l3SimulationMarkup('water-flow');
  const split = unit2l3SimulationMarkup('voltage-split');
  const practice = unit2l3SimulationMarkup('quick-practice');
  assert.match(converter, /شرح المنصة/);
  assert.match(converter, /data-convert-submit/);
  assert.match(converter, /1 kV = 1000 V/);
  assert.match(water, /نموذج تعليمي مبسّط/);
  assert.match(water, /لا يحاكي زمن انتقال الماء أو تغير حجمه/);
  assert.match(water, /aria-live="polite"/);
  assert.match(water, /type="range"/);
  assert.match(split, /لا يحاكي هذا المختبر مكونات أو مقاومات/);
  assert.match(split, /data-voltage-reset/);
  assert.match(split, /12/);
  assert.match(split, /5/);
  assert.match(practice, /أسئلة من المنصة/);
  assert.match(practice, /ليست أسئلة اختبار الدرس/);
  assert.match(practice, /لن تظهر الملاحظات إلا بعد ضغط زر التحقق/);
  assert.match(practice, /data-practice-reset/);
  assert.throws(() => unit2l3SimulationMarkup('unknown'), RangeError);

  const [boot, css] = await Promise.all([read('../src/unit2-lesson3-main.js'), read('../src/unit2-lesson3.css')]);
  assert.match(boot, /mountUnit2Lesson3Simulations/);
  assert.match(boot, /IntersectionObserver/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('Teacher Area shares the current password gate and covers every book/platform item on pp97–106', async () => {
  const teacher = renderTeacherContent();
  const [page, boot, auth, sharedGate] = await Promise.all([
    read('../unit2-lesson-3-teacher.html'), read('../src/unit2-lesson3-teacher.js'),
    read('../src/teacher-auth.js'), read('../src/teacher-area.js'),
  ]);
  for (const pageNumber of UNIT2L3_META.sourcePages) {
    assert.ok(teacher.includes(`data-source-page="p${pageNumber}"`), `source excerpt p${pageNumber}`);
    assert.ok(teacher.includes(`data-page-reference="p${pageNumber}"`), `worked teacher answer p${pageNumber}`);
  }
  assert.equal((teacher.match(/class="teacher-source-details"/g) ?? []).length, 10);
  assert.match(teacher, /الأسئلة الستة/);
  assert.match(teacher, /البنود الثمانية/);
  assert.match(teacher, /25000/);
  assert.match(teacher, /2400/);
  assert.match(teacher, /0\.001/);
  assert.match(teacher, /12-5=7/);
  assert.match(teacher, /220/);
  assert.match(teacher, /110/);
  assert.match(teacher, /700000/);
  assert.match(teacher, /15-4=11/);
  assert.match(teacher, /توصيل الفولتميتر على التسلسل/);
  assert.match(teacher, /لا توجد أرقام مطبوعة في ص100/);
  assert.match(boot, /teacher-area\.js/);
  assert.match(boot, /mountTeacherArea/);
  assert.match(boot, /verifyTeacherPassword/);
  assert.match(boot, /new MutationObserver/);
  assert.match(boot, /gate\.hidden = form\.hidden/);
  assert.match(boot, /import\('\.\/unit2-lesson3-teacher-content\.js'\)/);
  assert.match(sharedGate, /const module = await loadContent\(\)/);
  assert.doesNotMatch(page + boot, /somer173/);
  assert.doesNotMatch(boot, /unit2-lesson3-test-solutions/);
  assert.match(auth, /PASSWORD_DERIVED_KEY/);
  const { verifyTeacherPassword } = await import('../src/teacher-auth.js');
  assert.equal(await verifyTeacherPassword('somer173'), true);
  assert.equal(await verifyTeacherPassword('not-the-password'), false);
});

test('lesson test has exactly 20 new questions, the 6/7/4/3 distribution, hidden solutions, and five-item batches', async () => {
  const expectedIds = expectedLetters();
  assert.equal(UNIT2L3_QUESTIONS.length, 20);
  assert.deepEqual(UNIT2L3_QUESTIONS.map((question) => question.id), expectedIds);
  assert.equal(new Set(UNIT2L3_QUESTIONS.map((question) => question.id)).size, 20);
  assert.deepEqual(Object.fromEntries(['basic', 'medium', 'advanced', 'thinking'].map((level) => [
    level, UNIT2L3_QUESTIONS.filter((question) => question.difficulty === level).length,
  ])), { basic: 6, medium: 7, advanced: 4, thinking: 3 });
  assert.ok(new Set(UNIT2L3_QUESTIONS.map((question) => question.type)).size >= 8);
  assert.deepEqual(UNIT2L3_TEST.sourcePages, UNIT2L3_META.sourcePages);
  assert.ok(UNIT2L3_QUESTIONS.every((question) => question.sourcePages.every((page) => UNIT2L3_META.sourcePages.includes(page))));
  assert.deepEqual(SOLUTION_GROUPS.map((group) => group.items.length), [5, 5, 5, 5]);
  assert.deepEqual(SOLUTION_GROUPS.map((group) => group.questionIds), [expectedIds.slice(0, 5), expectedIds.slice(5, 10), expectedIds.slice(10, 15), expectedIds.slice(15, 20)]);
  assert.equal(Object.keys(ANSWER_KEY).length, 20);
  assert.equal(Object.keys(SOLUTIONS).length, 20);
  for (const question of UNIT2L3_QUESTIONS) {
    assert.equal(validateAnswerKey(question, ANSWER_KEY[question.id]), true, question.id);
    assert.ok(SOLUTIONS[question.id].explanationHtml.length > 40, question.id);
  }
  assert.equal(ANSWER_KEY.u2l3q02.value, 3600);
  assert.equal(ANSWER_KEY.u2l3q07.value, 11);
  assert.equal(ANSWER_KEY.u2l3q08.value, 6);
  assert.equal(ANSWER_KEY.u2l3q11, 'nine');
  assert.equal(ANSWER_KEY.u2l3q13.value, 0.82);
  assert.equal(ANSWER_KEY.u2l3q14.value, 12);
  assert.equal(ANSWER_KEY.u2l3q15.value, 15000);
  assert.equal(ANSWER_KEY.u2l3q16.value, 7);
  assert.equal(ANSWER_KEY.u2l3q17.value, 360);

  const [bootstrap, runtime] = await Promise.all([read('../src/unit2-lesson3-assessment.js'), read('../src/assessment-runtime.js')]);
  assert.match(bootstrap, /loadSolutions: \(\) => import\('\.\/unit2-lesson3-test-solutions\.js'\)/);
  assert.match(bootstrap, /solutionsHeading: 'حلول الاختبارات'/);
  assert.match(bootstrap, /solutionGroupSize: 5/);
  assert.doesNotMatch(bootstrap, /ANSWER_KEY|SOLUTION_GROUPS|u2l3q\d{2}.*answerKey/);
  assert.match(runtime, /if \(!canRevealResults\(state\) \|\| !canRevealSolutions\(state\)\) return;/);
  assert.match(runtime, /welcome\.solutionsHeading/);
  assert.match(runtime, /loadSolutions\(\)/);
  assert.match(runtime, /restartAssessment\(\)/);

  let state = createAssessmentState();
  assert.equal(canRevealResults(state), false);
  assert.equal(canRevealSolutions(state), false);
  state = startAssessment(state);
  state = recordAnswer(state, UNIT2L3_QUESTIONS[0], ANSWER_KEY[UNIT2L3_QUESTIONS[0].id]);
  assert.equal(state.results, null);
  assert.equal(canRevealResults(state), false);
  assert.equal(canRevealSolutions(state), false);
  const submitted = submitAssessment(state, UNIT2L3_QUESTIONS, ANSWER_KEY);
  assert.equal(submitted.status, 'submitted');
  assert.equal(submitted.results.correct, 1);
  assert.equal(canRevealResults(submitted), true);
  assert.equal(canRevealSolutions(submitted), true);
  assert.deepEqual(restartAssessment(submitted), { status: 'not-started', currentIndex: 0, answers: {}, results: null });
});

test('assessment circuit figures identify real parallel branches and one three-lamp series loop', () => {
  const parallelQuestion = UNIT2L3_QUESTIONS.find((question) => question.diagram === 'parallel-readings');
  const seriesQuestion = UNIT2L3_QUESTIONS.find((question) => question.diagram === 'series-three-drops');
  const parallel = unit2l3AssessmentDiagram(parallelQuestion);
  const series = unit2l3AssessmentDiagram(seriesQuestion);
  for (const svg of [parallel, series]) {
    assert.match(svg, /role="img"/);
    assert.match(svg, /aria-labelledby=/);
    assert.match(svg, /<title/);
    assert.match(svg, /<desc/);
    assert.match(svg, /data-wire=/);
  }
  assert.match(parallel, /data-part="lamp-1"/);
  assert.match(parallel, /data-part="lamp-2"/);
  assert.match(parallel, /data-part="voltmeter-v2"/);
  assert.match(parallel, /data-wire="parallel-v2-top"/);
  assert.match(parallel, /data-wire="parallel-v2-bottom"/);
  assert.match(parallel, /U = 9 V/);
  assert.match(series, /data-part="lamp-1"/);
  assert.match(series, /data-part="lamp-2"/);
  assert.match(series, /data-part="lamp-3"/);
  assert.match(series, /U = 24 V/);
  assert.match(series, /U₁ = 8 V/);
  assert.match(series, /U₂ = 9 V/);
  assert.equal(unit2l3AssessmentDiagram({}), '');
});
