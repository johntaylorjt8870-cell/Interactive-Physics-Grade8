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

  // all fourteen study sections, in order
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
    '١٠. أسئلة المصدر والرسوم التخطيطية',
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
    'ثلاثة مستقيمات متوازية',
    'لا تعطي شدّاً عددياً',
    'افحص التوازي',
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
    'حاملها يوازي حاملي القوتين',
    'غير محسومة',
    'فيثاغورث',
  ]) {
    assert.ok(html.includes(phrase), `missing: ${phrase}`);
  }

  // The full option lists (including the division distractor) and the separate answer key are both present.
  const mcqStart = html.indexOf('class="student-notebook-mcq"');
  const keyStart = html.indexOf('class="student-notebook-inference-block"', mcqStart);
  const mcq = html.slice(mcqStart, keyStart);
  const optionLists = [...mcq.matchAll(/<ol class="student-notebook-options" type="a">([\s\S]*?)<\/ol>/g)];
  assert.equal(optionLists.length, 4, 'all four printed MCQs are included');
  for (const [, options] of optionLists) {
    assert.equal((options.match(/<li>/g) ?? []).length, 4, 'each printed MCQ keeps all four options');
  }
  const optionTex = [...mcq.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map(([, source]) => source);
  assert.ok(optionTex.includes('d=d_{1}\\div d_{2}'), 'page 70 question 4 keeps the division distractor');
  assert.match(html, /<td>a<\/td>[\s\S]*?<td>c، 7 N<\/td>/, 'the separate key records the correct choices and answer');
});

test('the notebook table of contents links all fourteen sections in order', () => {
  const html = LESSON_2_NOTEBOOK_BLOCK;
  const nav = html.match(/<nav class="student-notebook-toc" id="student-notebook-contents" aria-label="فهرس دفتر الطالب">([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'the notebook has a labelled table-of-contents landmark');
  assert.match(nav[1], /فهرس الدفتر · مرتّب حسب صفحات الكتاب/);

  const links = [...nav[1].matchAll(/<a href="#([^"]+)">([^<]+)<\/a>/g)];
  const expectedIds = [
    'l2-nb-scope', 'l2-nb-terms', 'l2-nb-experiments', 'l2-nb-same',
    'l2-nb-proportion', 'l2-nb-opposite', 'l2-nb-compare', 'l2-nb-examples',
    'l2-nb-symbols', 'l2-nb-figures', 'l2-nb-mistakes', 'l2-nb-special',
    'l2-nb-answers', 'l2-nb-plan',
  ];
  assert.deepEqual(links.map(([, id]) => id), expectedIds);
  assert.equal(new Set(links.map(([, id]) => id)).size, 14, 'all fourteen fragment IDs are unique');
  for (const [, id, label] of links) {
    assert.ok(label.trim(), `TOC link ${id} has a visible label`);
    assert.ok(html.includes(`<h3 id="${id}">`), `TOC link ${id} targets its section heading`);
    assert.equal(html.split(`id="${id}"`).length - 1, 1, `section target ${id} appears exactly once`);
  }
  assert.ok(html.indexOf(nav[0]) < html.indexOf('<section class="student-notebook-section"'),
    'the table of contents precedes the study sections');
});

test('the coverage matrix is reflected in verbatim source prompts, conditional geometry, provenance, and figures', () => {
  const html = LESSON_2_NOTEBOOK_BLOCK;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const prompt of [
    'كيف تكون قوى شد السلاسل للأرجوحة؟',
    'ما الذي يجعل الأرجوحة متوازنة؟',
    'كيف يشد الحصانان العربة؟',
    'هل حاملا قوتي شد الربيعتين الاستقامة ذاتها؟',
    'هل يتغير حامل قوة ثقل الجسم في هذه الحالة عما كان عليه في الحالة الأولى؟',
    'ما وضع الخطوط الممثلة لحوامل القوى الثلاث؟',
    'أنزع الثقل w₁ = F₁؛ ماذا ألاحظ؟',
    'أعيد الثقل F₁؛ ما دور هذا الثقل؟',
    'ماذا أسمّي هذا الثقل بالنسبة للقوتين F₂ و F₃؟',
    'ارسم كلاً من (d₁, d₂, F, F₂, F₁).',
    'حدّد كتابةً وبالرسم عناصر محصلة هاتين القوتين.',
  ]) {
    assert.ok(text.includes(prompt), `missing printed prompt: ${prompt}`);
  }

  const annotations = [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map(([, source]) => source);
  for (const equation of [
    '\\dfrac{A}{B}=\\dfrac{C}{D}=\\dfrac{A+C}{B+D}=\\dfrac{K}{L}',
    '\\dfrac{A}{B}=\\dfrac{C}{D}=\\dfrac{K}{L}',
    'd=d_{1}-d_{2}',
    'd=d_{2}-d_{1}',
  ]) {
    assert.ok(annotations.includes(equation), `missing source/conditional equation: ${equation}`);
  }
  assert.ok(html.includes('البعد · عندما F₂>F₁'));
  assert.ok(html.includes('إذا كانت القوة الأكبر F₁'));
  assert.ok(html.includes('F₁ &gt; F₂'));

  const figures = [...html.matchAll(/data-notebook-diagram="([^"]+)" data-source-page="(\d+)"/g)];
  assert.equal(figures.length, 14, 'all relevant scan figures have a notebook reconstruction');
  assert.ok(figures.every(([match]) => html.slice(html.indexOf(match), html.indexOf(match) + 260).includes('إعادة بناء تخطيطية من المنصة')),
    'each figure is identified as a platform redraw, not an original scan');
  assert.match(html, /curriculum-tag-book/);
  assert.match(html, /استنتاج تعليمي/);
  assert.ok(text.includes('[كلمة غير محسومة في المسح]'));
  assert.ok(text.includes('لا نثبتها حرفياً ولا نصححها إلى «محصلة»'));
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
  assert.match(css, /\.student-notebook-source-block[\s\S]*\.student-notebook-inference-block/);
  assert.match(css, /\.student-notebook-options/);
  assert.match(css, /\.l2-page \.student-notebook-toc ol \{[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.l2-page \.student-notebook-toc a:focus-visible/);
  assert.match(css, /@media \(max-width: 900px\) \{\s*\.l2-page \.student-notebook-toc ol \{ grid-template-columns: 1fr; \}/);
  assert.match(css, /\.l2-page \.student-notebook-section h3 \{ scroll-margin-top:/);
  assert.match(css, /@media \(max-width: 640px\) \{\s*\.student-notebook-step \{ grid-template-columns: 1fr;/);
  assert.match(css, /\.math\.math-display \{ overflow-x: auto; max-width: 100%; \}/);
});
