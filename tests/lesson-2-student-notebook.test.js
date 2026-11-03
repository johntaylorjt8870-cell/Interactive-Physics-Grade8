import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LESSON_2_PAGES } from '../src/lesson-2-content.js';
import { LESSON_2_NOTEBOOK_BLOCK } from '../src/lesson-2-notebook.js';
import { LESSON_PAGES } from '../src/lesson-content.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const NOTEBOOK_TITLE = '📒 دفتر الطالب';
const isNotebook = (stage) => stage.stageTitle === NOTEBOOK_TITLE;
const notebook = LESSON_2_PAGES.at(-1);

/* The lesson page that owns the notebook is `lesson-2.html`: the Unit 1 Lesson 2
   stepper. Every assertion below is anchored to that ownership, not merely to
   the phrase «دفتر الطالب» existing somewhere in the repository. */

test('the student notebook is the ninth and final tab of the real Unit 1 Lesson 2', async () => {
  const [page, main, meta] = await Promise.all([
    read('../lesson-2.html'),
    read('../src/lesson-2-main.js'),
    Promise.resolve(LESSON_2_PAGES),
  ]);

  // 1. it is the last stage of the Lesson 2 stepper, and there is exactly one
  assert.equal(meta.length, 9);
  assert.equal(meta.filter(isNotebook).length, 1, 'the notebook is never duplicated inside Lesson 2');
  assert.equal(meta.at(-1).stageTitle, NOTEBOOK_TITLE);
  assert.equal(meta.at(-1).title, 'دفتر الطالب');
  assert.ok(meta.at(-1).blocks[0].includes('student-notebook-title'));

  // 2. the eight teaching stages keep the textbook pages 63–70, in order
  assert.deepEqual(
    meta.filter((stage) => !isNotebook(stage)).map((stage) => stage.page),
    [63, 64, 65, 66, 67, 68, 69, 70],
  );

  // 3. the real lesson page renders stages from LESSON_2_PAGES, so the last
  //    tab of the stepper *is* the notebook on lesson-2.html
  assert.match(main, /import \{ LESSON_2_PAGES \} from '\.\/lesson-2-content\.js'/);
  assert.match(main, /goToPage\(0\)/);
  assert.match(page, /src="\.\/src\/lesson-2-main\.js"/);
  assert.match(page, /aria-valuemax="9"/);
  assert.match(page, /1 \/ 9/);
  assert.match(page, /المرحلة 1 من 9/);
  assert.match(page, /٩ مراحل/);
});

test('the notebook sits inside Lesson 2 and not on any other page', async () => {
  const pages = await Promise.all([
    read('../index.html'),
    read('../lesson-1.html'),
    read('../lesson-2.html'),
    read('../lesson-2-appendix.html'),
    read('../lesson-2-teacher.html'),
    read('../lesson-2-test.html'),
    read('../appendices.html'),
    read('../physics-in-life.html'),
    read('../physics-in-life-lesson-1.html'),
    read('../unit-questions.html'),
    read('../unit-1-test.html'),
  ]);
  // No page inlines the notebook content: it is authored once in Lesson 2's
  // content module and rendered by the Lesson 2 stepper only.
  for (const html of pages) {
    assert.doesNotMatch(html, /student-notebook|دفتر الطالب/);
  }
  const content = await read('../src/lesson-2-content.js');
  const notebookSource = await read('../src/lesson-2-notebook.js');
  assert.equal((notebookSource.match(/📒 دفتر الطالب/g) ?? []).length, 1, 'one notebook heading only');
  assert.equal((content.match(/LESSON_2_NOTEBOOK_BLOCK/g) ?? []).length, 2, 'imported once and used once');

  // Lesson 1 owns its own notebook and is untouched by this one
  assert.equal(LESSON_PAGES.at(-1).stageTitle, NOTEBOOK_TITLE);
  assert.equal(LESSON_PAGES.at(-1).blocks[0].includes('l2-student-notebook'), false);
  assert.equal(notebook.blocks[0].includes('تعريفات أساسية'), false,
    'Lesson 2 does not repeat Lesson 1 notebook sections');
});

test('the notebook covers every teaching point of pages 63–70', () => {
  const html = notebook.blocks.join('\n');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  // the twelve scientific sections, in order
  const headings = [
    '١. ما يطلبه الدرس مني',
    '٢. التعريفات والمصطلحات',
    '٣. التجارب وخطواتها',
    '٤. محصلة قوتين متوازيتين بجهة واحدة',
    '٥. من الجداءين إلى سلسلة التناسب',
    '٦. محصلة قوتين متوازيتين بجهتين متعاكستين',
    '٧. جدول يجمع الحالتين',
    '٨. الأمثلة المحلولة',
    '٩. الرموز والكميات والوحدات',
    '١٠. قراءة الرسوم والأسهم والتسميات',
    '١١. أخطاء شائعة وفروق يجب الانتباه إليها',
    '١٢. حالات خاصة واستثناءات وحدود المصدر',
    '١٣. أسئلة «أختبر نفسي» ص 70 وإجاباتها',
    '١٤. خريطة القرار وقائمة تحقق قبل التسليم',
  ];
  let cursor = -1;
  for (const heading of headings) {
    const at = text.indexOf(heading);
    assert.ok(at > cursor, `missing or out-of-order notebook section: ${heading}`);
    cursor = at;
  }

  // definitions, experiments, apparatus, keywords
  for (const phrase of [
    'هي القوى التي تكون حواملها مستقيمات متوازية',
    'لوح الربائع المغناطيسي',
    'حقيبة الميكانيك',
    'خطّاف',
    'ثلاثة مستقيمات متوازية',
    'هل يمكن إيجاد محصلة عدة قوى متوازية',
    'أفكر',
    'التوازي',
    'الاتزان',
    'السهمين متجاوران',
    'لا يعطيان أي قيم عددية',
    'اقرأ',
  ]) {
    assert.ok(text.includes(phrase), `missing: ${phrase}`);
  }

  // the laws, each present as typeset TeX
  for (const law of [
    'F=F_{1}+F_{2}',
    'F=F_{2}-F_{1}',
    'F_{1}\\times d_{1}=F_{2}\\times d_{2}',
    'd=d_{1}+d_{2}',
    'd=d_{2}-d_{1}',
    '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}',
    '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}=\\dfrac{F_{1}+F_{2}}{d_{2}+d_{1}}=\\dfrac{F}{d}',
    '\\vec{F}_{3}=-\\vec{F}',
  ]) {
    assert.ok(html.includes(law), `missing law: ${law}`);
  }

  // all four book examples, with the book's own values and results
  for (const value of [
    '0.5\\,\\mathrm{m}', '20\\,\\mathrm{N}', '30\\,\\mathrm{N}', '50\\,\\mathrm{N}', 'd_{2}=0.2\\,\\mathrm{m}',
    '60\\,\\mathrm{cm}', '200\\,\\mathrm{N}', '300\\,\\mathrm{N}', '100\\,\\mathrm{N}', 'd_{1}=180\\,\\mathrm{cm}',
    '40\\,\\mathrm{N}', '10\\,\\mathrm{N}', 'd_{2}=120\\,\\mathrm{cm}', '150\\,\\mathrm{cm}',
    '80\\,\\mathrm{N}', 'd_{2}=\\dfrac{160}{3}',
    '40 ', // page 70 problem 2 distance appears as d=40 cm
  ]) {
    assert.ok(html.includes(value), `missing example value: ${value}`);
  }
  assert.ok(html.includes('d=40\\,\\mathrm{cm}'), 'page 70 problem 2 given distance');

  // units, symbols, figure reading and the recorded source ambiguity
  for (const phrase of [
    '\\mathrm{N\\cdot m}',
    '\\mathrm{N\\cdot cm}',
    '1\\,\\mathrm{m}=100\\,\\mathrm{cm}',
    'C',
    'حامل المحصلة يوازي',
    'غير محسومة',
    'فيثاغورث',
  ]) {
    assert.ok(html.includes(phrase), `missing: ${phrase}`);
  }

  // the four self-check answers of page 70
  for (const answer of ['a) ', 'c) ', '7\\,\\mathrm{N}']) {
    assert.ok(html.includes(answer), `missing self-check answer marker: ${answer}`);
  }
});

test('every notebook equation is a single rendered line with no TeX line break', () => {
  const html = LESSON_2_NOTEBOOK_BLOCK;
  assert.equal((html.match(/linebreak="newline"/g) ?? []).length, 0);
  const sources = [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map((m) => m[1]);
  assert.ok(sources.length > 100, 'the notebook typesets its equations through the project helper');
  for (const source of sources) {
    let run = 0;
    for (const character of source) {
      run = character === '\\' ? run + 1 : 0;
      assert.ok(run < 2, `doubled backslash (a TeX line break) in ${source}`);
    }
    assert.doesNotMatch(source.replace(/\\[a-zA-Z]+/g, ''), /times|div|dfrac|frac|mathrm|cdot|approx/,
      `command printed as a word in ${source}`);
  }
});

test('the Lesson 2 notebook stylesheet reuses the shared notebook contract', async () => {
  const css = await read('../src/lesson-2.css');
  assert.match(css, /\.student-notebook-tags/);
  assert.match(css, /\.student-notebook-step \{/);
  assert.match(css, /@media \(max-width: 640px\) \{\s*\.student-notebook-step \{ grid-template-columns: 1fr;/);
  assert.match(css, /\.math\.math-display \{ overflow-x: auto; max-width: 100%; \}/);
});
