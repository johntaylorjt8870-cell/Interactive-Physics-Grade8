import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { vector } from '../src/math.js';
import { FORCE_PRESETS, PRACTICE_QUESTIONS, WORKED_EXAMPLE, ZERO_RESULTANT_CHALLENGE } from '../src/lesson-1-appendix-content.js';
import { checkPracticeAnswer, createPracticeState, selectPracticeChoice } from '../src/appendix-practice.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('Course Home keeps the single Lesson 1 appendix entry while publishing both real lessons', async () => {
  const home = await read('../index.html');
  assert.match(home, /href="\.\/src\/appendices\.css"/);
  assert.match(home, /<section class="appendices-home-entry"[^]*aria-labelledby="appendices-home-heading"/);
  assert.match(home, /<h2 id="appendices-home-heading">ملحقات الدروس<\/h2>/);
  assert.match(home, /href="\.\/appendices\.html"/);
  assert.equal((home.match(/class="lesson-entry"/g) ?? []).length, 2);
  assert.match(home, /id="available-lessons"/);
  assert.match(home, /href="\.\/lesson-2\.html"/);
  assert.doesNotMatch(home, /مساحة الدروس القادمة|lesson-3\.html/);
});

test('appendices library has one real Lesson 1 entry, a working start link, and no future placeholders', async () => {
  const library = await read('../appendices.html');
  assert.match(library, /<title>ملحقات الدروس/);
  assert.match(library, /<html lang="ar" dir="rtl">/);
  assert.match(library, /aria-current="page">ملحقات الدروس/);
  assert.equal((library.match(/class="appendix-library-card"/g) ?? []).length, 1);
  assert.match(library, /Lesson 1/);
  assert.match(library, /القوى المتلاقية/);
  assert.match(library, /المختبر التفاعلي والشرح الموسّع/);
  assert.match(library, /Platform Extension/);
  assert.match(library, /href="\.\/lesson-1-appendix\.html"[^]*ابدأ الملحق/);
  assert.match(library, /محاكاة حركية للقوى/);
  assert.match(library, /أسئلة وتحديات تفاعلية/);
  assert.doesNotMatch(library, /Lesson\s*[2-9]|الدرس\s*[2-9]|lesson-[2-9]\.html|قريباً|قريبًا/);
});

test('direct appendix URL includes a standalone RTL page, KaTeX, independent code, and return navigation', async () => {
  assert.equal(existsSync(new URL('../lesson-1-appendix.html', import.meta.url)), true);
  const page = await read('../lesson-1-appendix.html');
  assert.match(page, /<html lang="ar" dir="rtl">/);
  assert.match(page, /<title>ملحق الدرس الأول — القوى المتلاقية/);
  assert.match(page, /ملحق تفاعلي — <bdi dir="ltr">Platform Extension<\/bdi>/);
  assert.match(page, /href="\.\/appendices\.html"/);
  assert.match(page, /href="\.\/"/);
  assert.match(page, /href="\.\/src\/styles\.css"/);
  assert.match(page, /href="\.\/vendor\/katex\/katex\.min\.css"/);
  assert.match(page, /src="\.\/src\/lesson-1-appendix\.js"/);
  assert.match(page, /id="interactive-lab"/);
  assert.match(page, /id="force-diagram"[^]*role="img"/);
  assert.match(page, /id="resultant-vector"/);
  assert.match(page, /id="result-magnitude"/);
  assert.match(page, /id="result-direction"/);
  assert.match(page, /role="status" aria-live="polite"/);
  assert.match(page, /Educational simplified model/);
  assert.match(page, /Platform Explanation/);
  assert.match(page, /id="worked-example-steps"/);
  assert.match(page, /id="practice-questions"/);
  assert.match(page, /id="start-challenge"/);
});

test('all preset experiments are authored states with distinct teaching prompts', () => {
  assert.equal(FORCE_PRESETS.length, 7);
  assert.deepEqual(FORCE_PRESETS.map((preset) => preset.id), [
    'same-direction', 'opposite', 'equal-perpendicular', 'angled-pair',
    'three-forces', 'angle-explorer', 'balanced-three',
  ]);
  assert.ok(FORCE_PRESETS.every((preset) => preset.forces.length >= 1 && preset.forces.length <= 3));
  assert.ok(FORCE_PRESETS.every((preset) => preset.observation.trim() && preset.prediction.trim()));
  assert.equal(FORCE_PRESETS.find((preset) => preset.id === 'balanced-three').forces.length, 3);
});

test('worked example reveals a seven-part mathematical solution structure one step at a time', () => {
  assert.equal(WORKED_EXAMPLE.steps.length, 7);
  assert.deepEqual(WORKED_EXAMPLE.steps.map((step) => step.label), ['المعطيات', 'المطلوب', 'القانون', 'التعويض', 'الحساب', 'الوحدة', 'التحقق']);
  assert.ok(WORKED_EXAMPLE.steps.every((step) => step.html.length > 0));
  assert.ok(WORKED_EXAMPLE.steps.some((step) => step.html.includes('<annotation encoding="application/x-tex">')));
  assert.match(WORKED_EXAMPLE.steps.find((step) => step.label === 'الحساب').html, /5~\\mathrm\{N\}/);
});

test('practice choices remain unevaluated until explicit check and checked feedback explains the principle', () => {
  for (const question of PRACTICE_QUESTIONS) {
    let state = createPracticeState(question.id);
    assert.equal(state.submitted, false);
    assert.equal(state.feedbackHtml, '');
    const noSelection = checkPracticeAnswer(state);
    assert.equal(noSelection.needsSelection, true);
    assert.equal(noSelection.feedbackHtml, '');

    state = selectPracticeChoice(state, question.choices[0].id);
    assert.equal(state.submitted, false);
    assert.equal(state.feedbackHtml, '');
    const checked = checkPracticeAnswer(state);
    assert.equal(checked.submitted, true);
    assert.equal(checked.isCorrect, true);
    assert.ok(checked.feedbackHtml.length > 80);
    assert.match(checked.feedbackHtml, /لماذا|السبب|المتجه|المركب|اتجاه/);

    const wrongChoice = question.choices.find((choice) => choice.id !== question.correctChoice);
    const wrongState = selectPracticeChoice(createPracticeState(question.id), wrongChoice.id);
    const wrongCheck = checkPracticeAnswer(wrongState);
    assert.equal(wrongCheck.isCorrect, false);
    assert.ok(wrongCheck.feedbackHtml.length > 80, 'incorrect answers also get teaching feedback');
  }
  assert.throws(() => createPracticeState('unknown'), RangeError);
});

test('the zero-resultant challenge starts away from its target and has one intended editable vector', async () => {
  assert.equal(ZERO_RESULTANT_CHALLENGE.forces.length, 3);
  assert.deepEqual(ZERO_RESULTANT_CHALLENGE.target, { x: 0, y: 0 });
  assert.equal(ZERO_RESULTANT_CHALLENGE.editableForceIndex, 2);
  const physics = await import('../src/appendix-physics.js');
  assert.ok(physics.resultantOfForces(ZERO_RESULTANT_CHALLENGE.forces).magnitude > 1);
  assert.match((await read('../lesson-1-appendix.html')), /أبقِ القوتين الأولى والثانية كما هما/);
});

test('vector notation in appendix content comes from the shared KaTeX math layer', () => {
  const f1 = vector('F', '1');
  assert.match(f1, /class="math math-inline" dir="ltr" role="math"/);
  assert.match(f1, /<annotation encoding="application\/x-tex">\\vec\{F\}_\{1\}<\/annotation>/);
  assert.doesNotMatch(f1, /F⃗|F₁/);
});

test('appendix CSS preserves keyboard focus, mobile layout, and reduced-motion information', async () => {
  const [css, script] = await Promise.all([read('../src/lesson-1-appendix.css'), read('../src/lesson-1-appendix.js')]);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.legend-line\.dotted/);
  assert.match(script, /index === 1 \? 'dashed' : index === 2 \? 'dotted'/);
  assert.doesNotMatch(css, /display:\s*none[^}]*lab|\.lab[^}]*display:\s*none/);
});

test('static build explicitly copies both new direct URLs and retains all current entry pages', async () => {
  const build = await read('../scripts/build.mjs');
  for (const page of ['index.html', 'lesson-1.html', 'appendices.html', 'lesson-1-appendix.html', 'teacher.html', 'lesson-test.html']) {
    assert.ok(build.includes(`resolve(projectDirectory, '${page}')`), `build must copy ${page}`);
  }
  assert.match(build, /resolve\(projectDirectory, 'src'\)/);
  assert.match(build, /resolve\(projectDirectory, 'vendor'\)/);
});

test('existing Lesson 1, Lesson Test, and Teacher Area direct entries remain present and separate', async () => {
  const [lesson, assessment, teacher, main] = await Promise.all([
    read('../lesson-1.html'), read('../lesson-test.html'), read('../teacher.html'), read('../src/main.js'),
  ]);
  assert.match(lesson, /src="\.\/src\/main\.js"/);
  assert.match(lesson, /href="\.\/lesson-test\.html"/);
  assert.match(lesson, /href="\.\/teacher\.html"/);
  assert.match(assessment, /src="\.\/src\/lesson-assessment\.js"/);
  assert.match(teacher, /src="\.\/src\/teacher\.js"/);
  assert.match(main, /goToPage\(0\)/);
});
