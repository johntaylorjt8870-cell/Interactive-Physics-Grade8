import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { LESSON_1_NOTEBOOK_BLOCK } from '../src/lesson-1-notebook.js';
import { LESSON_PAGES } from '../src/lesson-content.js';
import { DIAGRAMS } from '../src/diagrams.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

/* The notebook is the ninth and final tab of `lesson-1.html`, and it is a
   reference document rather than a teaching stage: every assertion below is
   about the *content* a student can recover from it without re-opening pages
   55–62 of the textbook. */

const NOTEBOOK = LESSON_1_NOTEBOOK_BLOCK;
const plain = (html) => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
/** A display equation is asserted on its TeX source, which KaTeX keeps in the
 *  MathML annotation; the visual glyphs cannot be read back from HTML. */
const tex = (source) => {
  const escaped = source.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  assert.ok(
    NOTEBOOK.includes(`<annotation encoding="application/x-tex">${escaped}</annotation>`),
    `missing typeset equation: ${source}`,
  );
};
/** A line inside a multi-row derivation: KaTeX wraps the rows in one
 *  annotation, so the assertion is a substring of the escaped TeX source. */
const texContains = (fragment) => {
  const escaped = fragment.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  assert.ok(NOTEBOOK.includes(escaped), `missing typeset equation line: ${fragment}`);
};
/** Number of <li> items printed under a sub-head (ordered lists are numbered by
 *  the browser, so the digits are not part of the text). */
const listLengthAfter = (id) => {
  const start = NOTEBOOK.indexOf(`id="${id}"`);
  assert.notEqual(start, -1, `missing sub-head ${id}`);
  const open = NOTEBOOK.indexOf('<ol', start);
  const close = NOTEBOOK.indexOf('</ol>', open);
  return (NOTEBOOK.slice(open, close).match(/<li>/g) ?? []).length;
};
const text = plain(NOTEBOOK);
const section = (id) => {
  const start = NOTEBOOK.indexOf(`aria-labelledby="${id}"`);
  assert.notEqual(start, -1, `missing notebook section ${id}`);
  const end = NOTEBOOK.indexOf('</section>', start);
  return NOTEBOOK.slice(start, end);
};
const sectionText = (id) => plain(section(id));
const has = (haystack, needle, label) => assert.ok(
  haystack.includes(needle),
  `missing ${label ?? `"${needle}"`}`,
);

test('the notebook is the ninth, single, reference tab of lesson 1 and is authored once', async () => {
  const [content, page, main] = await Promise.all([
    read('../src/lesson-content.js'),
    read('../lesson-1.html'),
    read('../src/main.js'),
  ]);

  assert.equal(LESSON_PAGES.length, 9);
  const notebookStage = LESSON_PAGES.at(-1);
  assert.equal(notebookStage.stageTitle, '📒 دفتر الطالب');
  assert.equal(notebookStage.title, 'دفتر الطالب');
  assert.equal(LESSON_PAGES.filter((stage) => stage.blocks.some((block) => block.includes('student-notebook-title'))).length, 1,
    'exactly one stage carries the notebook');
  assert.equal(notebookStage.blocks.length, 1, 'the notebook is one block, not a set of fragments');
  assert.equal(notebookStage.blocks[0], LESSON_1_NOTEBOOK_BLOCK);
  assert.equal((NOTEBOOK.match(/<h2 id="student-notebook-title">/g) ?? []).length, 1, 'one notebook heading');

  // it is imported, not inlined a second time
  assert.match(content, /import \{ LESSON_1_NOTEBOOK_BLOCK \} from '\.\/lesson-1-notebook\.js'/);
  assert.doesNotMatch(content, /<h3 id="student-notebook-definitions">/, 'the notebook markup is not duplicated in the lesson module');

  // and the real lesson page renders the stage list, so the ninth tab is the notebook
  assert.match(main, /import \{ LESSON_PAGES \} from '\.\/lesson-content\.js'/);
  assert.match(page, /aria-valuemax="9"/);
  assert.match(page, /1 \/ 9/);
  assert.match(page, /المرحلة 1 من 8/);
});

test('the notebook keeps the visual identity, navigation and a stable table of contents', () => {
  assert.match(NOTEBOOK, /^<article class="student-notebook" aria-labelledby="student-notebook-title">/);
  assert.match(NOTEBOOK, /<div class="student-notebook-sheet">/);
  assert.match(NOTEBOOK, /class="student-notebook-kicker"/);

  const ids = [...NOTEBOOK.matchAll(/id="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(new Set(ids).size, ids.length, 'every id is unique');

  const anchors = [...NOTEBOOK.matchAll(/<a href="#([^"]+)">/g)].map(([, id]) => id);
  assert.equal(anchors.length, 17, 'the table of contents lists all seventeen sections');
  for (const anchor of anchors) {
    assert.ok(ids.includes(anchor), `table-of-contents anchor #${anchor} has no target`);
  }

  const sections = [...NOTEBOOK.matchAll(/<section class="student-notebook-section" aria-labelledby="([^"]+)"/g)];
  assert.equal(sections.length, 17, 'seventeen sections, in study order');
  assert.deepEqual(
    sections.map(([, id]) => id),
    ['nb-s01', 'nb-s02', 'nb-s03', 'nb-s04', 'nb-s05', 'nb-s06', 'nb-s07', 'nb-s08', 'nb-s09',
      'nb-s10', 'nb-s11', 'nb-s12', 'nb-s13', 'nb-s14', 'nb-s15', 'nb-s16', 'nb-s17'],
  );

  // the sheet is well formed: every container that is opened is closed
  for (const tag of ['article', 'section', 'table', 'figure', 'ol', 'ul', 'div']) {
    const opened = (NOTEBOOK.match(new RegExp(`<${tag}[ >]`, 'g')) ?? []).length;
    const closed = (NOTEBOOK.match(new RegExp(`</${tag}>`, 'g')) ?? []).length;
    assert.equal(opened, closed, `<${tag}> is balanced`);
  }
});

test('page 55: objectives, key words, the parachutist paragraph and its three questions', () => {
  const intro = sectionText('nb-s01');
  for (const objective of [
    'يتعرّف القوى المتلاقية',
    'يوضّح بالرسم القوى المتلاقية',
    'يحدّد عناصر محصّلة قوّتين متلاقيتين',
    'يحلّل القوّة إلى مركبتين متعامدتين',
  ]) has(intro, objective, `objective "${objective}"`);
  assert.match(intro, /الكلمات المفتاحية: القوى المتلاقية – تحليل القوّة/);
  has(intro, 'يستخدم المظلّي الذي يهبط من طائرة على ارتفاع ما من سطح الأرض مظلة من أجل الوصول إلى الأرض بسلامة وأمان',
    'the textbook opening paragraph');
  for (const question of [
    'كيف يرتبط المظلّي بمظلّته',
    'ما القوى المؤثّرة على المظلّي',
    'أين تتلاقى حبال المظلّة',
  ]) has(intro, question, `parachutist question "${question}"`);
  // the notebook is explicit that the printed page gives no answers
  assert.match(intro, /دون إجابات مطبوعة/);
});

test('page 55 groundwork: the four elements of a force vector and both scale conversions', () => {
  const vector = sectionText('nb-s02');
  for (const element of ['نقطة التأثير', 'الحامل (خط التأثير)', 'الجهة', 'الشدة (المقدار)']) {
    has(vector, element, `force element "${element}"`);
  }
  assert.match(vector, /1 cm : 5 N/);
  assert.match(vector, /20 ÷ 5 = 4 cm/, 'N → cm conversion');
  assert.match(vector, /3 × 5 = 15 N/, 'cm → N conversion');
  assert.match(vector, /1 cm ↔ 1 N/);
  assert.match(vector, /1 cm ↔ 20 N/);
  assert.match(vector, /النيوتن/);
  assert.match(vector, /الربيعة \(الدينامومتر\)/);
});

test('page 56: the experiment verbatim (tools, seven steps, observations and conclusion)', () => {
  const experiment = sectionText('nb-s04');
  has(experiment, 'لوح الربائع المغناطيسي – ربائع – جسم مزوّد بخطاف – خيوط ربط', 'the printed tool list');
  for (let step = 1; step <= 7; step += 1) {
    has(experiment, `الخطوة ${['١', '٢', '٣', '٤', '٥', '٦', '٧'][step - 1]}:`, `experiment step ${step}`);
  }
  // each printed step keeps its question and gains its answer
  for (const question of [
    'ما حامل هذه القوة؟ وما جهتها؟',
    'هل ينطبق حاملها على حامل قوة الثقل؟',
    'هل لحاملي قوّتي شدّ الربيعتين الاستقامة ذاتها؟',
    'هل يتغيّر حامل قوة ثقل الجسم في هذه الحالة',
    'ماذا ألاحظ؟',
    'أين تلتقي الخطوط الممثّلة لحوامل القوى الثلاث؟',
  ]) has(experiment, question, `printed question "${question}"`);
  assert.match(experiment, /القوى المتلاقية: هي القوى التي تتلاقى حواملها في نقطة واحدة/, 'the definition verbatim');
  // both cases of the experiment are tabulated
  assert.match(experiment, /ربيعة واحدة \(الخطوتان ١–٢\)/);
  assert.match(experiment, /ربيعتان على اللوح \(الخطوات ٣–٧\)/);
  assert.match(section('nb-s04'), /student-notebook-table/);
  // and the notebook does not invent measurements
  assert.match(experiment, /التجربة نوعية لا عددية/);
});

test('page 57: the parallelogram rule, all four resultant elements and the equilibrant', () => {
  const rule = sectionText('nb-s05');
  has(rule, 'هل يمكن إيجاد محصّلة عدّة قوى متلاقية؟ وكيف يتم ذلك؟', 'the «أتساءل» prompt');
  for (const probe of [
    'أرسمُ القوة',
    'أرسمُ هندسيّاً متوازي الأضلاع',
    'أرسمُ قطر متوازي الأضلاع المارّ من نقطة تلاقي القوتين',
    'أُحدّد عناصر',
  ]) has(rule, probe, `page-57 probe step "${probe}"`);
  assert.match(rule, /قطر متوازي الأضلاع يمثّل محصّلة القوّتين المتلاقيتين/);
  assert.match(rule, /تقعان في مستو واحد هي قوّة واحدة/);
  for (const element of ['نقطة التأثير', 'الحامل', 'الجهة', 'الشدة']) has(rule, element);
  // the six construction moves and the vector law
  assert.equal(listLengthAfter('nb-s05-construction'), 6, 'six construction steps');
  tex('\\vec{F}=\\vec{F}_{1}+\\vec{F}_{2}');
  assert.match(rule, /قوة الموازنة/);
  assert.match(rule, /F′ = F/);
  // the special-case table covers every shape and both extreme angles
  for (const shape of ['متوازي أضلاع', 'معيّن', 'مستطيل', 'مربّع']) has(rule, shape, `shape "${shape}"`);
  assert.match(rule, /0°/, 'aligned forces');
  assert.match(rule, /180°/, 'opposed forces');
  texContains('\\left|F_{1}-F_{2}\\right|\\leq F\\leq F_{1}+F_{2}');
  assert.match(rule, /قوّتين متلاقيتين تقعان في مستو واحد/, 'the rule is limited to two coplanar concurrent forces');
});

test('pages 58–59: perpendicular forces, Pythagoras, the inverse relation and the printed statements', () => {
  const perpendicular = sectionText('nb-s06');
  assert.match(perpendicular, /مربّع الوتر يساوي مجموع مربّعي الضلعين القائمين/, 'the printed Pythagoras box');
  tex('F=\\sqrt{F_{1}^{2}+F_{2}^{2}}');
  tex('F^{2}=F_{1}^{2}+F_{2}^{2}');
  texContains('F_{1}&=\\sqrt{F^{2}-F_{2}^{2}}');
  texContains('F_{2}&=\\sqrt{F^{2}-F_{1}^{2}}');
  tex('\\theta=\\tan^{-1}\\!\\left(\\dfrac{F_{2}}{F_{1}}\\right)');
  assert.match(perpendicular, /متعامدين تماماً/, 'Pythagoras is limited to 90°');
  assert.match(perpendicular, /tan−1|tan-1|tan⁻¹|\\tan\^\{-1\}/, 'the direction relation is present');
  assert.match(perpendicular, /θ/, 'the direction angle is named');
});

test('page 58 worked example 1: every given value, construction step and the printed result', () => {
  const example = sectionText('nb-s07');
  for (const given of ['F₁ = 4 N', 'F₂ = 3 N', '60°', '1 cm ↔ 1 N']) has(example, given, `given "${given}"`);
  assert.match(example, /أرسمُ شعاع القوة الأولى بطول 4 cm/);
  assert.match(example, /شعاع القوة الثانية بطول 3 cm/);
  assert.match(example, /يساوي تقريباً 6 cm/);
  assert.match(example, /F = 6 × 1 = 6 N/);
  assert.match(example, /قطر متوازي الأضلاع/);
  // the analytic cross-check is labelled as enrichment, not as printed content
  assert.match(example, /6\.08/, 'the analytic cross-check is kept');
  assert.match(example, /إثراء من المنصة/);
});

test('pages 58–59 worked example 2: the 1 cm : 20 N scale, the 3–4–5 rectangle and F = 100 N', () => {
  const example = sectionText('nb-s08');
  for (const given of ['F₁ = 60 N', 'F₂ = 80 N', '20 N', '3 cm', '4 cm', '5 cm', '100 N']) has(example, given);
  assert.match(example, /60 ÷ 20 = 3 cm/);
  assert.match(example, /80 ÷ 20 = 4 cm/);
  assert.match(example, /F = 5 × 20 = 100 N/);
  assert.match(example, /3600 \+ 6400/, 'the printed substitution chain');
  texContains('F&=\\sqrt{(60)^{2}+(80)^{2}}');
  texContains('&=\\sqrt{3600+6400}');
  texContains('&=\\sqrt{10000}=100\\,\\mathrm{N}');
  assert.match(example, /مستطيل/);
  assert.match(example, /3² \+ 4² = 5²/, 'the drawing-to-calculation match is explained');
});

test('page 60: resolution steps 1–6, both conclusions, and the vector identity', () => {
  const resolution = sectionText('nb-s09');
  has(resolution, 'هل يمكن تحليل القوّة', 'the «أتساءل» prompt');
  assert.equal(listLengthAfter('nb-s09-steps'), 6, 'six resolution steps');
  for (const phrase of [
    'أحدّدُ على لوح الربائع نقطة',
    'وليكن الشعاع',
    'محورين متعامدين',
    'عمودين على هذين المحورين (مرتسم النقطة)',
    'يتشكّل مستطيل',
    'المساقط على المحورين',
  ]) has(resolution, phrase, `step phrase "${phrase}"`);
  assert.match(resolution, /تقومان مقامها/);
  assert.match(resolution, /عملية معاكسة لعملية إيجاد محصّلة قوّتين متعامدتين/);
  tex('\\vec{\\mathrm{OM}}=\\vec{\\mathrm{OX}}+\\vec{\\mathrm{OY}}');
  assert.match(resolution, /مرتسم النقطة/, 'the term «مرتسم» is explained');
});

test('page 60 incline activity: printed prompt, force diagram, rectangle and the role of each component', () => {
  const incline = sectionText('nb-s10');
  assert.match(incline, /إذا وُضع جسم صلب فوق مستوٍ مائل أملس يميل عن الأفق بزاوية/);
  assert.match(incline, /أحدّد بالرسم القوى المؤثّرة عليه/);
  assert.match(incline, /أحلّل قوّة ثقله إلى مركّبتين متعامدتين، ما الشكل الذي أحصل عليه/);
  // the ambiguity of the printed angle symbol is documented rather than guessed
  assert.match(incline, /دون تسمية رمزها لفظياً/);
  assert.match(incline, /الحرف اللاتيني a/);
  // the two forces and the two components
  for (const symbol of ['w', 'R', 'F₁', 'F₂']) has(incline, symbol);
  assert.match(incline, /مستطيل/);
  assert.match(incline, /45°/);
  tex('w_{\\parallel}=w\\,\\sin a \\qquad w_{\\perp}=w\\,\\cos a');
  tex('w^{2}=w_{\\parallel}^{2}+w_{\\perp}^{2}');
  assert.match(incline, /توازن|يوازنها/, 'the normal reaction balances the perpendicular component');
  assert.match(incline, /انزلاق/, 'the parallel component causes sliding');
  assert.match(incline, /عديم الاحتكاك/);
  assert.match(incline, /جزء من ثقل الجسم/, 'the component is not the normal reaction');
});

test('page 61: the four «تعلّمتُ» blocks of the textbook summary', () => {
  const summary = sectionText('nb-s11');
  assert.match(summary, /هي القوى التي تتلاقى حواملها في نقطة واحدة/);
  assert.match(summary, /عناصر محصّلة قوّتين متلاقيتين تقعان في مستوٍ واحد/);
  assert.match(summary, /عناصر محصّلة قوّتين متعامدتين/);
  assert.match(summary, /تحليل قوّة إلى مركّبتين متعامدتين/);
  assert.match(summary, /F = √\(F₁² \+ F₂²\)/);
  assert.match(summary, /أو من الرسم/);
  assert.match(summary, /عملية معاكسة لعملية إيجاد محصّلة قوّتين متعامدتين/);
});

test('pages 61–62: all six multiple-choice items, their options and the correct answers', () => {
  const check = sectionText('nb-s12');
  assert.match(check, /اختر الإجابة الصحيحة لكلّ مما يأتي، وانقلها إلى دفترك/, 'the printed instruction');
  for (const prompt of [
    'بينهما زاوية حادة',
    'متلاقيتان متعامدتان مختلفتان شدّةً',
    'متلاقيتان متعامدتان متساويتان شدّةً',
    '12 N',
    '16 N',
    'F = 50 N',
    'F₁ = 40 N',
    'تُحسب من العلاقة',
  ]) has(check, prompt, `item phrase "${prompt}"`);

  const questions = [...section('nb-s12').matchAll(/class="student-notebook-qa"/g)].length;
  assert.equal(questions, 6, 'six answered items');

  const answers = [...section('nb-s12').matchAll(/<p class="student-notebook-qa-a"><strong>([\s\S]*?)<\/strong>/g)]
    .map(([, answer]) => plain(answer));
  assert.deepEqual(answers, [
    'الإجابة: (d) متوازي أضلاع.',
    'الإجابة: (b) مستطيل.',
    'الإجابة: (a) مربّع.',
    'الإجابة: (b) F = 20 N.',
    'الإجابة: (b) F = 30 N.',
    'الإجابة: (c) F = √(F₁² + F₂²).',
  ]);
  // the option letters are isolated Latin tokens, so bidi cannot move the dot
  assert.equal((section('nb-s12').match(/<li><bdi dir="ltr">[a-d]\.<\/bdi>/g) ?? []).length, 24,
    'all four options of all six items keep an isolated letter');
  // the arithmetic behind items 4 and 5 is shown, and the printed option set is preserved
  assert.match(check, /√\(12² \+ 16²\) = √\(144 \+ 256\) = √400 = 20 N/);
  assert.match(check, /√\(50² − 40²\) = √\(2500 − 1600\) = √900 = 30 N/);
  assert.match(check, /F = 2000 N/, 'the printed distractor is preserved');
  assert.match(check, /خطأ مطبعي في الطبعة المدرسية/, 'the «F =» misprint of item 5 is documented');
});

test('page 62: both problems, fully solved (9 N, 15 N, 30 N, 40 N, 50 N and the two scale drawings)', () => {
  const problems = sectionText('nb-s13');
  assert.match(problems, /تؤثّر قوّتان متعامدتان/, 'problem 1 statement');
  assert.match(problems, /شدّة القوّة الثانية 12 N وشدّة محصّلتهما 15 N/);
  assert.match(problems, /√\(15² − 12²\) = √\(225 − 144\) = √81 = 9 N/);
  assert.match(problems, /F′ = F = 15 N/);
  assert.match(problems, /F₁, F₂/, 'the required representation list of problem 1');
  assert.match(problems, /يحمل شخصان حقيبةً بواسطة حبلين بينهما زاوية 90°/, 'problem 2 statement');
  assert.match(problems, /30 N/);
  assert.match(problems, /40 N/);
  assert.match(problems, /√\(30² \+ 40²\) = √\(900 \+ 1600\) = √2500 = 50 N/);
  assert.match(problems, /1 cm ↔ 3 N/);
  assert.match(problems, /1 cm ↔ 10 N/);
  // the equilibrant keeps all four elements, not merely a magnitude
  for (const element of ['نقطة التأثير', 'الحامل', 'الجهة', 'الشدة']) has(problems, element);
  assert.match(section('nb-s13'), /diagram-card[\s\S]*problem1-scale|problem1-scale/, 'problem 1 scale drawing');
  assert.match(section('nb-s13'), /problem2-scale/, 'problem 2 scale drawing');
});

test('the notebook carries the symbols/units table, the misconception table and the law-limits table', () => {
  const symbols = sectionText('nb-s14');
  for (const symbol of ['F₁', 'F₂', 'F′', 'w', 'R', 'w∥', 'w⊥', 'θ', 'N', 'cm', '°']) {
    has(symbols, symbol, `symbol ${symbol}`);
  }
  assert.match(symbols, /النيوتن/);

  const misconceptions = sectionText('nb-s15');
  for (const phrase of [
    'جمع الشدّتين جمعاً عددياً',
    'لمتوازي الأضلاع قطران',
    'المحصّلة',
    'قوّة الموازنة',
    'ردّ الفعل',
    'زاوية ميل المستوي',
    'الاتزان يتطلّب انعدام محصّلة',
  ]) has(misconceptions, phrase, `misconception "${phrase}"`);

  const limits = sectionText('nb-s16');
  for (const law of [
    'تعريف القوى المتلاقية',
    'قاعدة متوازي الأضلاع',
    'نظرية فيثاغورث لمحصّلة قوّتين',
    'العلاقة العكسية',
    'قوّة الموازنة',
    'تحليل الثقل على مستوٍ مائل',
    'شرط الاتزان',
  ]) has(limits, law, `law "${law}"`);

  assert.equal((NOTEBOOK.match(/student-notebook-table-wrap/g) ?? []).length, 12, 'twelve reference tables');
  assert.equal((NOTEBOOK.match(/<table class="student-notebook-table">/g) ?? []).length, 12);
  assert.equal((NOTEBOOK.match(/<caption>/g) ?? []).length, 12, 'every table is captioned');
});

test('every source page 55–62 is represented and every diagram the notebook cites exists', () => {
  for (const page of ['ص ٥٥', 'ص ٥٦', 'ص ٥٧', 'ص ٥٨', 'ص ٥٩', 'ص ٦٠', 'ص ٦١', 'ص ٦٢']) {
    assert.ok(text.includes(page), `the notebook cites ${page}`);
  }
  const figures = [...NOTEBOOK.matchAll(/class="diagram-card student-notebook-figure"[\s\S]*?<strong>([^<]+)<\/strong>/g)];
  assert.equal(figures.length, 10, 'ten geometric diagrams and scale drawings');
  const figureBlock = NOTEBOOK.slice(NOTEBOOK.indexOf('student-notebook-figure'));
  assert.ok(figureBlock.length > 0);
  for (const [key, entry] of Object.entries(DIAGRAMS)) {
    if (NOTEBOOK.includes(entry.svg.slice(0, 120))) {
      assert.ok(entry.title, `${key} keeps its title`);
    }
  }
  // the two scale drawings of page 62 are the real diagram sources, not redrawn copies
  assert.ok(NOTEBOOK.includes(DIAGRAMS['problem1-scale'].svg));
  assert.ok(NOTEBOOK.includes(DIAGRAMS['problem2-scale'].svg));
  assert.ok(NOTEBOOK.includes(DIAGRAMS['inclined-plane'].svg));
});

test('RTL prose never swallows Latin math: every formula is LTR-isolated and typeset by KaTeX', () => {
  assert.doesNotMatch(NOTEBOOK, /katex-error/, 'no formula failed to typeset');
  const math = [...NOTEBOOK.matchAll(/<div class="math math-display[^"]*" dir="ltr"/g)];
  assert.equal(math.length, 13, 'thirteen display equations');
  const inline = [...NOTEBOOK.matchAll(/<span class="math math-inline" dir="ltr"/g)];
  assert.ok(inline.length >= 30, `vector symbols stay inline and LTR (found ${inline.length})`);

  // every Latin bdi is explicitly LTR and holds no Arabic letters. The split is
  // deliberately not a tag regex: any markup-looking character inside the
  // isolation would make a regex skip the very case that must fail.
  const bdiBodies = NOTEBOOK.split('<bdi dir="ltr">').slice(1)
    .map((part) => part.slice(0, part.indexOf('</bdi>')));
  assert.ok(bdiBodies.length >= 300, `the notebook isolates every Latin token (found ${bdiBodies.length})`);
  for (const body of bdiBodies) {
    assert.doesNotMatch(body, /[\u0600-\u06FF]/, `Arabic text must not be wrapped in dir="ltr": ${body}`);
  }
  assert.doesNotMatch(NOTEBOOK, / < /, 'no raw less-than sign leaks into RTL prose');
  // and no undirected bdi was introduced
  const bdis = [...NOTEBOOK.matchAll(/<bdi([^>]*)>/g)].map(([, attrs]) => attrs);
  for (const attrs of bdis) assert.match(attrs, /dir="ltr"/, 'every bdi declares its direction');
});

test('added explanations are labelled as platform enrichment, not passed off as textbook text', () => {
  const tags = (NOTEBOOK.match(/class="student-notebook-tag"/g) ?? []).length;
  assert.ok(tags >= 6, `enrichment notes are labelled (found ${tags})`);
  assert.match(text, /إثراء من المنصة/);
  // the notebook explains, for each enrishment, that it is an addition
  assert.match(sectionText('nb-s07'), /إثراء من المنصة/);
  assert.match(sectionText('nb-s10'), /إثراء رياضي/);
  assert.match(sectionText('nb-s06'), /إثراء/);
});

test('the notebook is not injected into any other page of the platform', async () => {
  const entries = await readdir(new URL('..', import.meta.url));
  const pages = entries.filter((name) => name.endsWith('.html'));
  assert.ok(pages.length >= 20);
  for (const name of pages) {
    const html = await read(name === 'lesson-1.html' ? '../lesson-1.html' : `../${name}`);
    const notebookInlined = html.includes('student-notebook-sheet') || html.includes('student-notebook-title');
    assert.equal(notebookInlined, false, `${name} must not inline the notebook`);
  }
  // only the Lesson 1 module chain can reach it
  const lessonTwoNotebook = await read('../src/lesson-2-notebook.js');
  assert.doesNotMatch(lessonTwoNotebook, /LESSON_1_NOTEBOOK_BLOCK/);
});
