import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT2L3_META, UNIT2L3_PAGES } from '../src/unit2-lesson3-content.js';
import { UNIT2L3_NOTEBOOK_BLOCK, UNIT2L3_NOTEBOOK_TITLE } from '../src/unit2-lesson3-notebook.js';
import { auditLessonSteps, LessonStepper } from '../src/lesson-steps.js';
import { unit2l3StepMarkup } from '../src/unit2-lesson3-step-view.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('Lesson 3 notebook is the single final reference step, after all ten textbook pages', () => {
  const audit = auditLessonSteps(UNIT2L3_PAGES, { sourcePages: UNIT2L3_META.sourcePages });
  assert.deepEqual(audit, { ok: true, problems: [] });
  assert.equal(UNIT2L3_PAGES.length, 11);
  assert.deepEqual(UNIT2L3_PAGES.slice(0, 10).map((page) => page.page), UNIT2L3_META.sourcePages);
  assert.equal(UNIT2L3_PAGES.at(-1).id, 'student-notebook');
  assert.equal(UNIT2L3_PAGES.at(-1).page, 106);
  assert.equal(UNIT2L3_PAGES.filter((page) => page.blocks.some((block) => block.type === 'student-notebook')).length, 1);
  assert.equal(UNIT2L3_PAGES.at(-1).navLabel, UNIT2L3_NOTEBOOK_TITLE);
});

test('notebook selects the definitions, units, measurement rules, circuit laws and source examples', () => {
  for (const phrase of [
    'فرق الكمون الكهربائي', 'الفولتميتر', 'ثنائي قطب فعّال', 'ثنائي قطب غير فعّال',
    'يوصل على التفرع', 'U=U_{1}+U_{2}', 'U=U_{1}=U_{2}',
    '1\\,\\mathrm{kV}', '1\\,\\mathrm{mV}', '12-5=7', '6\\,\\mathrm{V}',
    'الناقل المعتدل', 'القوة المحركة الكهربائية', '220 V', '110 V',
  ]) assert.ok(UNIT2L3_NOTEBOOK_BLOCK.includes(phrase), phrase);
  assert.equal((UNIT2L3_NOTEBOOK_BLOCK.match(/class="student-notebook-section"/g) ?? []).length, 9);
  assert.doesNotMatch(UNIT2L3_NOTEBOOK_BLOCK, /<form|data-p3p-action|data-correct|data-answer/);
  assert.doesNotMatch(UNIT2L3_NOTEBOOK_BLOCK, /begin\{aligned\}|begin\{array\}/);
  assert.ok(UNIT2L3_NOTEBOOK_BLOCK.includes('إضافات المنصة'));
  assert.ok(UNIT2L3_NOTEBOOK_BLOCK.includes('لا تجرّب جهد المنزل'));
});

test('notebook reference renders directly without being wrapped as textbook copy or a platform note', () => {
  const page = UNIT2L3_PAGES.at(-1);
  const markup = unit2l3StepMarkup(page);
  assert.match(markup, /data-page-view="student-notebook"/);
  assert.match(markup, /دفتر الطالب/);
  assert.match(markup, /student-notebook p3-student-notebook/);
  assert.doesNotMatch(markup, /p3-book-copy|p3-platform-card/);
});

test('stepper reaches the notebook as step 11 and cannot advance beyond it', () => {
  const stepper = new LessonStepper(UNIT2L3_PAGES);
  for (let i = 0; i < 10; i += 1) assert.equal(stepper.next(), true);
  assert.equal(stepper.position, 11);
  assert.equal(stepper.total, 11);
  assert.equal(stepper.page.id, 'student-notebook');
  assert.equal(stepper.labelFor('previous'), 'اختبر نفسي 2');
  assert.equal(stepper.next(), false);
  assert.equal(stepper.isLast, true);
  assert.equal(stepper.previous(), true);
  assert.equal(stepper.page.page, 106);
});

test('HTML, main navigation and CSS expose an accessible responsive final notebook step', async () => {
  const [html, main, css] = await Promise.all([
    read('../unit2-lesson-3.html'),
    read('../src/unit2-lesson3-main.js'),
    read('../src/unit2-lesson3.css'),
  ]);
  assert.match(html, /1 \/ 11/);
  assert.match(html, /aria-valuemax="11"/);
  assert.match(html, /١٠ صفحات كتاب \+ دفتر الطالب/);
  assert.match(main, /stepper\.page\.id === 'student-notebook'/);
  assert.match(main, /آخر خطوة · مرجع مراجعة/);
  assert.match(css, /\.p3-student-notebook/);
  assert.match(css, /overflow-x: auto/);
  assert.match(css, /@media \(max-width: 600px\)/);
});
