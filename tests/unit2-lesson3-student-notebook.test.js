import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT2L3_META, UNIT2L3_PAGES } from '../src/unit2-lesson3-content.js';
import { UNIT2L3_NOTEBOOK_BLOCK, UNIT2L3_NOTEBOOK_TITLE } from '../src/unit2-lesson3-notebook.js';
import { UNIT2L3_DIAGRAMS } from '../src/unit2-lesson3-diagrams.js';
import { UNIT2L3_ANSWERS } from '../src/unit2-lesson3-answers.js';
import {
  convertPotentialDifference,
  matchesBlankAnswer,
  missingSeriesPotentialDifference,
  parallelPotentialDifferences,
  sumSeriesPotentialDifferences,
} from '../src/unit2-lesson3-physics.js';
import { auditLessonSteps, LessonStepper } from '../src/lesson-steps.js';
import { unit2l3StepMarkup } from '../src/unit2-lesson3-step-view.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const html = UNIT2L3_NOTEBOOK_BLOCK;

const fold = (value) => value.replace(/[\u064B-\u0652\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا');
const plain = (source) => source
  .replace(/<annotation[\s\S]*?<\/annotation>/g, ' ')
  .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const sectionHtml = (id) => {
  const start = html.indexOf(`aria-labelledby="${id}"`);
  assert.notEqual(start, -1, `missing notebook section ${id}`);
  const end = html.indexOf('</section>', start);
  assert.notEqual(end, -1, `unclosed notebook section ${id}`);
  return html.slice(start, end);
};
const sectionText = (id) => plain(sectionHtml(id));
const has = (haystack, needle, label) => assert.ok(
  fold(haystack).includes(fold(needle)),
  `missing ${label ?? `"${needle}"`}`,
);
const hasTex = (source) => {
  const escaped = source.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  assert.ok(
    html.includes(`<annotation encoding="application/x-tex">${escaped}</annotation>`),
    `missing typeset KaTeX equation: ${source}`,
  );
};

/* ---------------------------------------------------------------------------
 * 1. Placement, ownership & stepper navigation
 * ------------------------------------------------------------------------- */

test('Lesson 3 notebook is the single final reference step, after all ten textbook pages', () => {
  const audit = auditLessonSteps(UNIT2L3_PAGES, { sourcePages: UNIT2L3_META.sourcePages });
  assert.deepEqual(audit, { ok: true, problems: [] });
  assert.equal(UNIT2L3_PAGES.length, 11);
  assert.deepEqual(UNIT2L3_PAGES.slice(0, 10).map((page) => page.page), UNIT2L3_META.sourcePages);
  assert.equal(UNIT2L3_PAGES.at(-1).id, 'student-notebook');
  assert.equal(UNIT2L3_PAGES.at(-1).page, 106);
  assert.equal(UNIT2L3_PAGES.filter((page) => page.blocks.some((block) => block.type === 'student-notebook')).length, 1);
  assert.equal(UNIT2L3_PAGES.at(-1).navLabel, UNIT2L3_NOTEBOOK_TITLE);
  assert.equal(UNIT2L3_META.title, 'فرق الكمون الكهربائي');
  assert.equal(UNIT2L3_META.pages, '97–106');
});

test('Lesson 3 notebook lives only in Unit 2 Lesson 3 and never leaks into other lessons or HTML entries', async () => {
  const htmlFiles = [
    '../index.html', '../appendices.html', '../lesson-1.html', '../lesson-2.html',
    '../unit2-lesson-1.html', '../unit2-lesson-2.html', '../unit2-lesson-3.html', '../unit2-lesson-4.html',
    '../unit2-lesson-3-appendix.html', '../unit2-lesson-3-teacher.html', '../unit2-lesson-3-test.html',
    '../unit-2-test.html', '../unit2-exercises.html',
  ];
  const sources = await Promise.all(htmlFiles.map(read));
  for (const [index, source] of sources.entries()) {
    assert.doesNotMatch(source, /UNIT2L3_NOTEBOOK_BLOCK|u2l3-notebook-title/, `${htmlFiles[index]} never inlines the notebook`);
  }
  for (const mod of [
    'unit2-lesson1-content.js', 'unit2-lesson2-content.js', 'unit2-lesson4-content.js',
    'unit2-lesson3-appendix-content.js', 'unit2-lesson3-teacher-content.js',
    'lesson-content.js', 'lesson-2-content.js',
  ]) {
    const src = await read(`../src/${mod}`);
    assert.doesNotMatch(src, /unit2-lesson3-notebook|UNIT2L3_NOTEBOOK_BLOCK/, `${mod} does not import Lesson 3 notebook`);
  }
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
  const [pageHtml, main, css] = await Promise.all([
    read('../unit2-lesson-3.html'),
    read('../src/unit2-lesson3-main.js'),
    read('../src/unit2-lesson3.css'),
  ]);
  assert.match(pageHtml, /1 \/ 11/);
  assert.match(pageHtml, /aria-valuemax="11"/);
  assert.match(pageHtml, /١٠ صفحات كتاب \+ دفتر الطالب/);
  assert.match(main, /stepper\.page\.id === 'student-notebook'/);
  assert.match(main, /آخر خطوة · مرجع مراجعة/);
  assert.match(pageHtml, /id="page-badge-label"/);
  assert.match(main, /مرجع الكتاب/);
  assert.match(css, /\.p3-student-notebook/);
  assert.match(css, /\.student-notebook-toc/);
  assert.match(css, /\.student-notebook-tag-book/);
  assert.match(css, /\.student-notebook-tag-enrich/);
  assert.match(css, /\.student-notebook-tag-infer/);
  assert.match(css, /overflow-x: auto/);
  assert.match(css, /@media \(max-width: 600px\)/);
});

/* ---------------------------------------------------------------------------
 * 2. Complete structure, TOC, tables, diagrams & preservation of prior content
 * ------------------------------------------------------------------------- */

test('notebook builds a complete 18-section reference in textbook-page order with working TOC', () => {
  const expectedIds = Array.from({ length: 18 }, (_, i) => `nb3-s${String(i + 1).padStart(2, '0')}`);
  const actualIds = [...html.matchAll(/<section class="student-notebook-section" aria-labelledby="(nb3-s\d+)">/g)].map((m) => m[1]);
  assert.deepEqual(actualIds, expectedIds);

  const tocMatch = html.match(/<nav class="student-notebook-toc"[\s\S]*?<\/nav>/);
  assert.ok(tocMatch, 'TOC navigation must exist');
  const tocTargets = [...tocMatch[0].matchAll(/href="#(nb3-s\d+)"/g)].map((m) => m[1]);
  assert.deepEqual(tocTargets, expectedIds, 'every section appears in the TOC in exact order');

  const tables = (html.match(/<table class="student-notebook-table">/g) ?? []).length;
  const wraps = (html.match(/<div class="student-notebook-table-wrap">/g) ?? []).length;
  const captions = (html.match(/<caption>/g) ?? []).length;
  assert.equal(tables, 14, '14 reference tables');
  assert.equal(wraps, tables, 'every table has its own scroll wrapper');
  assert.equal(captions, tables, 'every table has a caption');

  assert.doesNotMatch(html, /<form|data-p3p-action|data-correct|data-answer/);
  assert.doesNotMatch(html, /begin\{aligned\}|begin\{array\}/);
  assert.doesNotMatch(html, /katex-error/);
});

test('notebook embeds all nine authentic SVG diagrams from UNIT2L3_DIAGRAMS once each with unique ids', () => {
  const expectedDiagrams = Object.keys(UNIT2L3_DIAGRAMS);
  assert.equal(expectedDiagrams.length, 9);
  const embedded = [...html.matchAll(/data-notebook-figure="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(new Set(embedded), new Set(expectedDiagrams), 'all 9 diagrams embedded');
  assert.equal(embedded.length, expectedDiagrams.length, 'each diagram embedded exactly once');
  for (const id of expectedDiagrams) {
    assert.ok(html.includes(`id="u2l3-nb-${id}-title"`), `unique SVG title id for ${id}`);
  }
});

test('notebook preserves all prior core phrases and includes «القوة المحركة الكهربائية» in context', () => {
  for (const phrase of [
    'فرق الكمون الكهربائي', 'الفولتميتر', 'ثنائي قطب فعّال', 'ثنائي قطب غير فعّال',
    'يوصل على التفرع', 'U=U_{1}+U_{2}', 'U=U_{1}=U_{2}',
    '1\\,\\mathrm{kV}', '1\\,\\mathrm{mV}', '12-5=7', '6\\,\\mathrm{V}',
    'الناقل المعتدل', 'القوة المحركة الكهربائية', '220 V', '110 V',
    'إضافات المنصة', 'لا تجرّب جهد المنزل',
  ]) {
    assert.ok(html.includes(phrase), `missing required phrase: ${phrase}`);
  }
});

/* ---------------------------------------------------------------------------
 * 3. Page-by-page textbook fidelity (pp. 97–106)
 * ------------------------------------------------------------------------- */

test('p. 97 coverage: title, 4 objectives, 4 keywords, opening questions and labelled platform formula', () => {
  const s = sectionText('nb3-s01');
  for (const phrase of [
    'فرق الكمون الكهربائي', 'يتعرف فرق الكمون الكهربائي',
    'يقيس تجريبيا فرق الكمون بين نقطتين', 'يميز بين ثنائي القطب الفعال وغير الفعال',
    'يربط بين فرق الكمون الكلي وفروق الكمون الجزئية',
    'مقياس فولت', 'تشاهد التلفاز', 'ما الذي يدفع الشحنة الكهربائية',
    'ما الذي يسبب سريان التيار الكهربائي',
  ]) has(s, phrase);
  hasTex('U=\\dfrac{\\Delta E}{q}');
  hasTex('1\\,\\mathrm{V}=1\\,\\mathrm{J/C}');
  has(s, 'ليستا معادلتين مطبوعتين', 'platform formula caveat');
});

test('p. 98 coverage: water-level experiment prompts, Shape 3 transfer, conclusion and analogy limits', () => {
  const s = sectionText('nb3-s02');
  for (const phrase of [
    'اتامل الصورتين', 'اقارن بين ارتفاعي سويتي الماء',
    'افتح الصنبور في الحالة الاولى', 'افتح الصنبور في الحالة الثانية',
    'انتقل من الانبوب ذي السوية الاعلى الى الانبوب ذي السوية الادنى',
    'ساق ناقلة للكهرباء', 'كمون كهربائي مرتفع', 'كمون كهربائي منخفض',
    'اذا وصل ناقلان مشحونان مختلفان كمونا بسلك ناقل',
    'حدود التشبيه المائي',
  ]) has(s, phrase);
});

test('p. 99 coverage: all six «أفكر وأستنتج» questions, Alessandro Volta, five conclusions and voltmeter', () => {
  const s = sectionText('nb3-s03');
  for (const phrase of [
    'ما دور المضخة', 'هل تقوم المضخة بزيادة كمية الماء', 'ينتقل من الوعاء',
    'ما دور المولد', 'هل يقوم المولد بزيادة كمية الشحنات', 'يجعل الشحنات الكهربائية تتحرك',
    'اليخاندرو فولتا', 'اول بطارية كهربائية',
    'يقوم المولد الكهربائي بتحريك الشحنات الكهربائية وتزويدها بالطاقة',
    'لا يسري بين نقطتين في الدارة الكهربائية الا بوجود فرق في الكمون بينهما',
    'من الكمون المرتفع الى الكمون المنخفض', 'جهة حركة الالكترونات عكس جهة التيار',
    'مقياس فولت', 'يوصل على التفرع', 'وحدة الفولت',
  ]) has(s, phrase);
});

test('p. 100 coverage: active/passive dipole experiment, EMF in textbook place, Einthoven and no invented readings', () => {
  const s = sectionText('nb3-s04');
  for (const phrase of [
    'ادوات التجربة', 'اسلاك توصيل', 'مصباح كهربائي', 'مقياس امبير', 'قاطعة',
    'اركب الدارة كما في الشكل', 'اغلق القاطعة', 'افتح القاطعة', 'ماذا الاحظ',
    'المصباح ثنائي قطب غير فعال لانه لا يسبب مرور التيار في دارة مغلقة',
    'المولد ثنائي قطب فعال لانه يسبب مرور التيار في دارة مغلقة',
    'فرق الكمون بين قطبي المولد لا ينعدم عندما تكون الدارة مفتوحة',
    'القوة المحركة الكهربائية',
    'وليم ايثوفن', 'المخطط البياني الكهربائي لعمل القلب',
    'الكتاب لا يطبع قراءات عددية',
  ]) has(s, phrase);
});

test('pp. 101–102 (series) coverage: full experiment, U=U1+U2 law, and 12 V − 5 V = 7 V calculation', () => {
  const s5 = sectionText('nb3-s05');
  const s6 = sectionText('nb3-s06');
  for (const phrase of [
    'مقاييس فولت', 'مصباحان', 'موصولين على التسلسل',
    'فرق الكمون الكلي في دارة متسلسلة يساوي مجموع فروق الكمون الجزئية',
  ]) has(s5, phrase);
  hasTex('U=U_{1}+U_{2}');

  const expectedU1 = missingSeriesPotentialDifference(12, 5);
  assert.equal(expectedU1, 7);
  assert.equal(sumSeriesPotentialDifferences([expectedU1, 5]), 12);
  has(s6, '12 V');
  has(s6, '5 V');
  hasTex('U_{1}=U-U_{2}=12-5=7\\,\\mathrm{V}');
  hasTex('7\\,\\mathrm{V}+5\\,\\mathrm{V}=12\\,\\mathrm{V}');
});

test('pp. 102–103 (parallel & transformer) coverage: full experiment, U=U1=U2, 6 V activity and transformer safety', () => {
  const s7 = sectionText('nb3-s07');
  const s8 = sectionText('nb3-s08');
  for (const phrase of [
    'موصولين على التفرع', 'فرق الكمون الكلي بين قطبي المولد يساوي فرق الكمون في كل فرع',
    '6 V',
  ]) has(s7, phrase);
  hasTex('U=U_{1}=U_{2}');
  hasTex('U=U_{1}=U_{2}=6\\,\\mathrm{V}');
  assert.deepEqual([...parallelPotentialDifferences(6, 2)], [6, 6]);

  for (const phrase of [
    '220 V', '110 V', 'محول خافض للكمون الكهربائي',
    'انواع المحولات الكهربائية', 'محول رافع للكمون', 'محول عزل',
    'تفسير من المنصة', 'لا تجرب جهد المنزل',
  ]) has(s8, phrase);
  hasTex('\\dfrac{U_{p}}{U_{s}}=\\dfrac{N_{p}}{N_{s}}=\\dfrac{220\\,\\mathrm{V}}{110\\,\\mathrm{V}}=2');
});

test('p. 104 coverage: all eight verbatim «تعلّمتُ» statements', () => {
  const s9 = sectionHtml('nb3-s09');
  const listMatch = s9.match(/<div class="student-notebook-conclusion">[\s\S]*?<ol[^>]*>([\s\S]*?)<\/ol>/);
  assert.ok(listMatch, '«تعلّمتُ» numbered list must exist');
  assert.equal((listMatch[1].match(/<li>/g) ?? []).length, 8, 'all eight «تعلّمتُ» statements');
  const txt = plain(listMatch[1]);
  for (const phrase of [
    'اذا وصل ناقلان مشحونان مختلفان كمونا',
    'يسري التيار الكهربائي من الكمون المرتفع الى الكمون المنخفض',
    'يقاس فرق الكمون بواسطة جهاز يسمى مقياس فولت ويوصل على التفرع',
    'يرمز لفرق الكمون الكهربائي',
    'المصباح ثنائي قطب غير فعال',
    'المولد ثنائي قطب فعال',
    'فرق الكمون الكلي في دارة متسلسلة يساوي مجموع فروق الكمون الجزئية',
    'فرق الكمون الكلي بين قطبي المولد يساوي فرق الكمون في كل فرع',
  ]) has(txt, phrase);
});

test('unit conversions and pp. 105–106 «أختبر نفسي» match physics module and answer keys', () => {
  // Independent arithmetic verification against src/unit2-lesson3-physics.js
  assert.equal(convertPotentialDifference(25, 'kV', 'V'), 25000);
  assert.equal(convertPotentialDifference(2.4, 'V', 'mV'), 2400);
  assert.equal(convertPotentialDifference(250, 'mV', 'V'), 0.25);
  assert.equal(convertPotentialDifference(0.7, 'kV', 'V'), 700);
  assert.equal(convertPotentialDifference(0.7, 'kV', 'mV'), 700000);
  assert.equal(convertPotentialDifference(1, 'mV', 'V'), 0.001);
  assert.notEqual(convertPotentialDifference(1, 'mV', 'V'), 0.0001);

  hasTex('1\\,\\mathrm{kV}=1000\\,\\mathrm{V}=10^{3}\\,\\mathrm{V}');
  hasTex('1\\,\\mathrm{V}=1000\\,\\mathrm{mV}=10^{3}\\,\\mathrm{mV}');
  hasTex('1\\,\\mathrm{mV}=0.001\\,\\mathrm{V}=10^{-3}\\,\\mathrm{V}');
  hasTex('25\\,\\mathrm{kV}=25\\times1000=25000\\,\\mathrm{V}');
  hasTex('2.4\\,\\mathrm{V}=2.4\\times1000=2400\\,\\mathrm{mV}');
  hasTex('1\\,\\mathrm{mV}=0.001\\,\\mathrm{V}\\neq 0.0001\\,\\mathrm{V}');

  // p. 105 Q1 (4 MCQ) & Q2 (4 True/False)
  const s11Html = sectionHtml('nb3-s11');
  assert.equal((s11Html.match(/class="student-notebook-qa"/g) ?? []).length, 8, '4 MCQ + 4 T/F items');
  const s11 = plain(s11Html);
  const mcqKeys = UNIT2L3_ANSWERS['p105-mcq'].items.map((item) => item.correct);
  assert.deepEqual(mcqKeys, ['c', 'd', 'b', 'b']);
  for (const phrase of [
    'تغذى منشاة صناعية', '25000', 'مقياس الفولت المستخدم في دارة يقيس',
    'كل الاجابات السابقة صحيحة', '2400', 'يقاس الكمون الكهربائي بوحدة تسمى', 'الفولت',
    'يشير مقياس الفولت بين قطبي المولد الى التاشيرة صفر',
    'الكمون الكهربائي لناقل معتدل يساوي الصفر',
    'يوصل مقياس الفولت على التسلسل مع المصباح',
    'الميلي فولت يساوي', '0.0001',
  ]) has(s11, phrase);
  assert.equal(UNIT2L3_ANSWERS['p105-true-false'].items.every((item) => item.correct === 'false'), true);
  assert.equal((s11Html.match(/الإجابة: غلط/g) ?? []).length, 4, 'all 4 T/F items judged غلط');

  // p. 106 Q3 (4 fill-in-the-blank items, 7 blanks)
  const s12Html = sectionHtml('nb3-s12');
  assert.equal((s12Html.match(/class="student-notebook-qa"/g) ?? []).length, 4, '4 fill-in-the-blank items');
  const s12 = plain(s12Html);
  const blanksAnswers = [
    ['blank-1a', 'فرق الكمون'],
    ['blank-1b', 'المولد'],
    ['blank-2a', 'المرتفع'],
    ['blank-2b', 'المنخفض'],
    ['blank-3', 'التفرع'],
    ['blank-4a', 'مجموع'],
    ['blank-4b', 'الجزئية'],
  ];
  for (const [id, word] of blanksAnswers) {
    const entry = UNIT2L3_ANSWERS['p106-blanks'].items.find((item) => item.id === id);
    assert.ok(matchesBlankAnswer(word, entry.accepted), `blank ${id} accepts ${word}`);
    has(s12, word);
  }
  assert.equal(missingSeriesPotentialDifference(15, 4), 11);
  has(s12, '15-4=11'.replace(/-/g, '') ? '11' : '11');
});

test('glossary, laws, misconceptions, Lesson 2 comparison, source caveats and checklist are complete', () => {
  has(sectionText('nb3-s13'), 'القوة المحركة الكهربائية للمولد');
  has(sectionText('nb3-s13'), '220 V');
  has(sectionText('nb3-s14'), 'شرط التطبيق');
  has(sectionText('nb3-s15'), 'الناقل المعتدل');
  has(sectionText('nb3-s16'), 'شدة التيار الكهربائي (الدرس ٢)');
  has(sectionText('nb3-s16'), 'فرق الكمون الكهربائي (الدرس ٣)');

  const s17 = sectionText('nb3-s17');
  for (const caveat of [
    'لا يطبع الكتاب اي قراءات رقمية',
    'الكمون الكهربائي لناقل معتدل يساوي الصفر',
    'بحرف صغير',
    'لم يطبع جدول تحويل وحدات',
    'اسلاك توصيل',
    'وليم ايثوفن',
  ]) has(s17, caveat);

  const checklist = sectionHtml('nb3-s18').match(/<div class="student-notebook-checklist">([\s\S]*?)<\/div>/);
  assert.ok(checklist, 'pre-exam checklist must exist');
  assert.equal((checklist[1].match(/<li>/g) ?? []).length, 10, '10 pre-exam check items');
});

/* ---------------------------------------------------------------------------
 * 4. Provenance separation & RTL/LTR bidirectional hygiene
 * ------------------------------------------------------------------------- */

test('provenance tags clearly distinguish textbook, platform enrichment, and educational inference', () => {
  assert.ok((html.match(/student-notebook-tag-book/g) ?? []).length >= 10, 'explicit «من الكتاب» badges');
  assert.ok((html.match(/student-notebook-tag-enrich/g) ?? []).length >= 10, 'explicit «إثراء من المنصة» badges');
  assert.ok((html.match(/student-notebook-tag-infer/g) ?? []).length >= 5, 'explicit «استنتاج تعليمي» badges');
});

test('strict RTL/LTR hygiene: zero Arabic inside <bdi dir="ltr"> and zero bare Latin/ASCII values in prose', () => {
  const bdiTokens = [...html.matchAll(/<bdi dir="ltr">([^<]*)<\/bdi>/g)].map((m) => m[1]);
  assert.ok(bdiTokens.length >= 100, `expected >=100 isolated LTR tokens, got ${bdiTokens.length}`);
  const arabicInBdi = bdiTokens.filter((token) => /[\u0600-\u06FF]/.test(token));
  assert.deepEqual(arabicInBdi, [], 'Arabic text must never be placed inside <bdi dir="ltr">');

  // Strip SVG, MathML, KaTeX, and <bdi dir="ltr"> to verify zero bare Latin/ASCII numbers+units in RTL prose
  const noSvgMath = html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' ');
  let stripped = '';
  let i = 0;
  while (i < noSvgMath.length) {
    if (
      noSvgMath.startsWith('<span class="math', i)
      || noSvgMath.startsWith('<div class="math', i)
      || noSvgMath.startsWith('<bdi dir="ltr"', i)
    ) {
      const tag = noSvgMath.startsWith('<div', i) ? 'div' : noSvgMath.startsWith('<bdi', i) ? 'bdi' : 'span';
      let depth = 0;
      while (i < noSvgMath.length) {
        if (noSvgMath.startsWith(`<${tag}`, i) && /[\s>]/.test(noSvgMath[i + tag.length + 1])) {
          depth += 1;
          i += tag.length + 1;
        } else if (noSvgMath.startsWith(`</${tag}>`, i)) {
          depth -= 1;
          i += tag.length + 3;
          if (depth === 0) break;
        } else {
          i += 1;
        }
      }
      stripped += ' ';
    } else {
      stripped += noSvgMath[i];
      i += 1;
    }
  }
  const prose = stripped.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const bareLatin = [...prose.matchAll(/[A-Za-z0-9][A-Za-z0-9.,:+\-−/Ω₁₂]*/g)].map((m) => m[0]);
  assert.deepEqual(bareLatin, [], 'every Latin symbol, number and unit in prose must be isolated in <bdi dir="ltr"> or KaTeX');
  assert.doesNotMatch(html, /aria-label="[^"]*<[^"]*"/, 'no HTML markup inside aria-label attributes');
});
