import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT2L2_PAGES, UNIT2L2_META } from '../src/unit2-lesson2-content.js';
import { UNIT2L2_NOTEBOOK_BLOCK, UNIT2L2_NOTEBOOK_TITLE } from '../src/unit2-lesson2-notebook.js';
import { UNIT2L2_DIAGRAMS } from '../src/unit2-lesson2-diagrams.js';
import { UNIT2_PAGES } from '../src/unit2-lesson1-content.js';
import { LESSON_PAGES } from '../src/lesson-content.js';
import { LESSON_2_PAGES } from '../src/lesson-2-content.js';
import { auditLessonSteps } from '../src/lesson-steps.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const NOTEBOOK_MARK = 'class="student-notebook u2l2-student-notebook"';
const isNotebook = (stage) => stage.id === 'student-notebook' || stage.navLabel === UNIT2L2_NOTEBOOK_TITLE;
const notebook = UNIT2L2_PAGES.at(-1);
const bookPages = UNIT2L2_PAGES.filter((stage) => !isNotebook(stage));
const html = UNIT2L2_NOTEBOOK_BLOCK;
const plain = (source) => source
  .replace(/<annotation[\s\S]*?<\/annotation>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const text = plain(html);
/** A display equation is asserted on its TeX source, which KaTeX keeps in the MathML annotation. */
const tex = (source) => {
  const escaped = source.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  assert.ok(html.includes(`<annotation encoding="application/x-tex">${escaped}</annotation>`),
    `missing typeset equation: ${source}`);
};
const matches = (haystack, pattern, label) => assert.match(fold(haystack), new RegExp(fold(pattern.source), pattern.flags),
  `missing ${label}`);

const section = (id) => {
  const start = html.indexOf(`aria-labelledby="${id}"`);
  assert.notEqual(start, -1, `missing notebook section ${id}`);
  const end = html.indexOf('</section>', start);
  return html.slice(start, end);
};
const sectionText = (id) => plain(section(id));
/* Printed passages are compared with the vowel marks (tashkeel) folded away: the
 * book's own diacritics are reproduced as they are, but the *order* of shadda and
 * fatha on one letter must never decide whether a page is covered. Letters, words,
 * numbers and units are still compared exactly. */
const fold = (value) => value.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
const has = (haystack, needle, label) => assert.ok(fold(haystack).includes(fold(needle)),
  `missing ${label ?? `"${needle}"`}`);

/* ---------------------------------------------------------------------------
   Placement: the notebook is the eleventh and final tab of the real Unit 2
   Lesson 2 page. Every assertion is anchored to that ownership, never to the
   phrase «دفتر الطالب» existing somewhere in the repository.
   ------------------------------------------------------------------------- */

test('the notebook is the eleventh and final tab of the real Unit 2 Lesson 2', async () => {
  const [page, main, home, build, audit] = await Promise.all([
    read('../unit2-lesson-2.html'),
    read('../src/unit2-lesson2-main.js'),
    read('../index.html'),
    read('../scripts/build.mjs'),
    read('../docs/unit-2-lesson-2-source-audit.md'),
  ]);

  assert.equal(UNIT2L2_PAGES.length, 11);
  assert.equal(UNIT2L2_PAGES.filter(isNotebook).length, 1, 'the notebook is never duplicated inside the lesson');
  assert.equal(notebook.navLabel, UNIT2L2_NOTEBOOK_TITLE);
  assert.equal(notebook.heading, 'دفتر الطالب');
  assert.equal(notebook.blocks.length, 1, 'one block, rendered by the stepper only');
  assert.equal(notebook.blocks[0].type, 'student-notebook');
  assert.match(notebook.blocks[0].html, /student-notebook-title/);
  assert.deepEqual(bookPages.map((stage) => stage.page), [87, 88, 89, 90, 91, 92, 93, 94, 95, 96]);
  assert.equal(UNIT2L2_META.lesson, 'الدرس 2 — التيار الكهربائي المتواصل');
  assert.equal(UNIT2L2_META.pages, '87–96');
  assert.equal(auditLessonSteps(UNIT2L2_PAGES).ok, true, 'the shared step audit accepts the final reference stage');

  assert.match(page, /<title>التيار الكهربائي المتواصل — الفيزياء للصف الثامن<\/title>/);
  assert.match(page, /الوحدة الثانية<\/span>[\s\S]*الكهرباء<\/span>[\s\S]*<strong>الدرس 2<\/strong>/);
  assert.match(page, /محتوى الكتاب · ص 87–96/);
  assert.match(page, /src="\.\/src\/unit2-lesson2-main\.js"/);
  assert.match(page, /<body class="u2l2-page">/);
  assert.match(page, /aria-valuemax="11"/);
  assert.match(page, /1 \/ 11/);
  assert.match(page, /صفحة 1 من 11/);
  assert.match(audit, /التيّار الكهربائيّ المُتواصِل/);
  assert.match(audit, /87–96/);
  const unitTwoStart = home.indexOf('<div class="unit-panel">', home.indexOf('<div class="unit-panel">') + 1);
  assert.deepEqual([...home.slice(unitTwoStart).matchAll(/href="\.\/unit2-lesson-([1234])\.html"/g)].map((m) => Number(m[1])), [1, 2, 3, 4]);
  assert.ok(home.indexOf('الصفحات 73–86') < home.indexOf('الصفحات 87–96'));
  assert.ok(home.indexOf('الصفحات 87–96') < home.indexOf('الصفحات 97–106'));
  assert.match(build, /'unit2-lesson-2\.html'/, 'the lesson page stays in the production build');

  assert.match(main, /import \{ UNIT2L2_PAGES \} from '\.\/unit2-lesson2-content\.js'/);
  assert.match(main, /goToPage\(0\)/);
  assert.match(main, /if \(block\.type === 'student-notebook'\) return block\.html;/);
  assert.match(main, /المرحلة \$\{current\} من \$\{UNIT2L2_PAGES\.length\} · دفتر الطالب/);
});

test('the notebook lives in Unit 2 Lesson 2 and on no other page', async () => {
  const paths = [
    '../index.html', '../appendices.html', '../lesson-1.html', '../lesson-2.html',
    '../unit2-lesson-1.html', '../unit2-lesson-2.html', '../unit2-lesson-3.html', '../unit2-lesson-4.html',
    '../unit2-lesson-1-appendix.html', '../unit2-lesson-2-appendix.html', '../unit2-lesson-3-appendix.html',
    '../unit2-lesson-2-teacher.html', '../unit2-lesson-2-test.html', '../unit-2-test.html',
    '../unit2-exercises.html', '../unit-questions.html', '../physics-in-life.html',
    '../physics-in-life-lesson-1.html', '../lesson-1-appendix.html', '../lesson-2-appendix.html',
  ];
  const pages = await Promise.all(paths.map(read));
  for (const [index, source] of pages.entries()) {
    assert.doesNotMatch(source, /u2l2-student-notebook|UNIT2L2_NOTEBOOK_BLOCK/, `${paths[index]} never inlines this notebook`);
    assert.doesNotMatch(source, /student-notebook-sheet|student-notebook-title/, `${paths[index]} never pre-renders the notebook`);
  }
  const [content, notebookSource] = await Promise.all([
    read('../src/unit2-lesson2-content.js'),
    read('../src/unit2-lesson2-notebook.js'),
  ]);
  assert.equal((content.match(/UNIT2L2_NOTEBOOK_BLOCK/g) ?? []).length, 2, 'imported once and used once');
  assert.equal((notebookSource.match(/📒 دفتر الطالب/g) ?? []).length, 1, 'the title is declared once and interpolated into the one heading');
  assert.equal((html.match(/📒 دفتر الطالب/g) ?? []).length, 1, 'the rendered heading carries it once');
  assert.equal((notebookSource.match(/<h2 id="student-notebook-title">/g) ?? []).length, 1, 'one notebook heading');
  assert.equal((html.match(new RegExp(NOTEBOOK_MARK.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length, 1);

  for (const module of [
    'unit2-lesson1-content.js', 'unit2-lesson3-content.js', 'unit2-lesson4-content.js',
    'unit2-lesson2-appendix-content.js', 'unit2-lesson2-teacher-content.js',
    'lesson-content.js', 'lesson-2-content.js', 'physics-in-life-content.js',
  ]) {
    const source = await read(`../src/${module}`);
    assert.doesNotMatch(source, /unit2-lesson2-notebook|UNIT2L2_NOTEBOOK_BLOCK/, `${module} does not reuse this notebook`);
  }
  assert.equal(UNIT2_PAGES.at(-1).id, 'student-notebook', 'Unit 2 Lesson 1 notebook stays in its own lesson');
  assert.equal(LESSON_PAGES.at(-1).stageTitle, '📒 دفتر الطالب');
  assert.equal(LESSON_2_PAGES.at(-1).stageTitle, '📒 دفتر الطالب');
});

/* ---------------------------------------------------------------------------
   Structure: eighteen sections in source-page order, a working table of
   contents, and a well-formed sheet.
   ------------------------------------------------------------------------- */

test('the notebook is a complete eighteen-section reference in source-page order', () => {
  const headings = [
    '١. الدرس في سطور: العنوان والأهداف والكلمات المفتاحية وأسئلة الافتتاح (ص ٨٧)',
    '٢. «أجرب وأستنتج»: تجربة الأنبوب والكرات — الإلكترونات الحرّة (ص ٨٨)',
    '٣. اصطلاح جهة التيار: لماذا جهتان متعاكستان؟ (ص ٨٩)',
    '٤. شِدّة التيار: مقطع الدارة ووحدة الزمن والجدول والخط البياني (ص ٩٠)',
    '٥. استنتاجات ص ٩١: تعريف شدة التيار والأمبير ومضاعفاته وأجزائه',
    '٦. التطبيق المحلول في ص ٩١: الحلّ الكامل خطوةً بخطوة',
    '٧. قياس شدة التيار والوصل على التَّسلسُل (ص ٩٢)',
    '٨. مثال الجهود: وصل مولّدات متماثلة على التَّسلسُل (ص ٩٣)',
    '٩. الوصل على التفرُّع: التجربة والاستنتاج ومثال الجهود (ص ٩٣–٩٤)',
    '١٠. خلاصة «تعلّمتُ» كما وردت في الكتاب (ص ٩٤)',
    '١١. «أختبر نفسي» ص ٩٥: المصطلحات وصح/خطأ ومنحنى التيار المتواصل',
    '١٢. «أختبر نفسي» ص ٩٦: المسبّب والتفسيرات والسؤال الحسابي',
    '١٣. الرموز والوحدات وأمثلة الجهود الواردة في الدرس',
    '١٤. القوانين والعلاقات: الرموز والوحدات وشروط التطبيق',
    '١٥. الأخطاء الشائعة والتصحيح العلمي',
    '١٦. ملاحظات امتحانية وتسلسل الإجابة',
    '١٧. قيود المصدر وما بقي غامضاً (موثَّق لا مخمَّن)',
    '١٨. قائمة تحقّق قبل اختبار الدرس',
  ];
  let cursor = -1;
  for (const heading of headings) {
    const at = text.indexOf(heading);
    assert.notEqual(at, -1, `missing notebook section: ${heading}`);
    assert.ok(at > cursor, `notebook section out of order: ${heading}`);
    cursor = at;
  }
  assert.equal((html.match(/class="student-notebook-section"/g) ?? []).length, 18, 'eighteen sections');
  assert.equal((html.match(/<article/g) ?? []).length, 1);
  assert.equal((html.match(/<h2/g) ?? []).length, 1);

  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(new Set(ids).size, ids.length, 'every id is unique');
  const anchors = [...html.matchAll(/<a href="#([^"]+)">/g)].map(([, id]) => id);
  assert.equal(anchors.length, 18, 'the table of contents lists all eighteen sections');
  for (const anchor of anchors) assert.ok(ids.includes(anchor), `table-of-contents anchor #${anchor} has no target`);

  for (const tag of ['article', 'section', 'table', 'figure', 'ol', 'ul', 'div']) {
    const opened = (html.match(new RegExp(`<${tag}[ >]`, 'g')) ?? []).length;
    const closed = (html.match(new RegExp(`</${tag}>`, 'g')) ?? []).length;
    assert.equal(opened, closed, `<${tag}> is balanced`);
  }
});

/* ---------------------------------------------------------------------------
   Page-by-page source coverage: every printed element of pages 87–96 that a
   student needs is recoverable from the notebook.
   ------------------------------------------------------------------------- */

test('page 87: title, the three objectives, the keywords and the three opening questions', () => {
  const overview = sectionText('nb-s01');
  for (const objective of [
    'يتعرّف التيّار الكهربائيّ المُتواصِل',
    'يحدّد جهة التيّار الكهربائيّ المُتواصِل',
    'يستنتج العلاقة بين شِدّة التيّار وكميّة الكهرباء وزمن مرورها',
  ]) has(overview, objective, `objective "${objective}"`);
  assert.match(overview, /الكلمات المفتاحية: الإلكترونات الحرّة – شِدّة التيّار – كميّة الكهرباء/);
  for (const question of [
    'من أين نحصل على الطاقة الكهربائية',
    'ما دور المولّد في الدّارة السّابقة',
    'كيف انتقلت الطّاقة الكهربائية من المولّد إلى المصباح',
  ]) has(overview, question, `opening question "${question}"`);
  assert.match(overview, /دون إجابات مطبوعة/, 'the page gives no printed answers');
  assert.match(overview, /الدومينو/, 'the domino scene is explained');
});

test('page 88: the tube experiment verbatim — tools, five steps, three conclusions', () => {
  const tube = sectionText('nb-s02');
  has(tube, 'أنبوب بلاستيكي شفّاف - كرات بلاستيكيّة أو زجاجيّة', 'the printed tool list');
  for (const step of [
    'أضعُ الأنبوب الشفّاف على سطح أفقيّ',
    'أملأُ الأنبوب بالكرات البلاستيكية',
    'أدفعُ كرة جديدة من أحد طرفي الأنبوب',
    'أدفعُ عدداً من الكرات الجديدة من طرف الأنبوب ذاته',
    'أتساءلُ هل حركة الكرات في الأنبوب تشابه حركة الإلكترونات الحرّة في السّلك النّاقل',
  ]) has(tube, step, `experiment step "${step}"`);
  assert.match(tube, /يمكن تشبيه حركة الكرات داخل الأنبوب بحركة الإلكترونات الحرّة في السّلك النّاقل/,
    'the printed sentence after the steps');
  // the three printed conclusions, verbatim
  assert.match(tube, /التيّار الكهربائيّ المُتواصِل \(المستمر\) هو انتقال مستمرٌّ للإلكترونات الحرّة باتجاهٍ واحد/);
  assert.match(tube, /جهة حركة الإلكترونات خارج المولّد من القطب السّالب إلى القطب الموجب للمولّد/);
  assert.match(tube, /يُسبّب المولّد الحركة السّابقة للإلكترونات/);
  // the model is labelled, and the experiment invents no measurement
  assert.match(tube, /إثراء من المنصة/);
  assert.match(tube, /حدود التشبيه/);
  assert.doesNotMatch(tube, /\d+\s*(?:cm|m\/s|درجة)/, 'the qualitative experiment gains no invented numbers');
  assert.match(section('nb-s02'), /student-notebook-table/);
});

test('page 89: Ampere\'s convention, the circuit parts, the enrichment generators and the sidebar', () => {
  const convention = sectionText('nb-s03');
  assert.match(convention, /اصطلح العالم أمبير أن جهـة التيّار الكهربائيّ خارج المولّد من القطب الموجب إلى القطب السّالب/);
  assert.match(convention, /عكس جهـة حركة الإلكترونات/);
  for (const part of ['مصدر الطاقة الكهربائية', 'الموصل الكهربائي', 'جهاز كهربائي', 'مفتاح']) has(convention, part, `circuit part "${part}"`);
  assert.match(convention, /الخلايا الكهربائيّة البسيطة والخلايا الضوئيّة/, 'the enrichment generators');
  assert.match(convention, /عالم فيزيائي ورياضي فرنسي/, 'the Ampere sidebar');
  assert.match(section('nb-s03'), /diagram-card student-notebook-figure/, 'the p89 circuit figure');
  assert.match(convention, /خارج المولّد/, 'the direction limit is stated');
});

test('page 90: both table states, the graph points and the reading of the slope', () => {
  const intensity = sectionText('nb-s04');
  assert.match(intensity, /لمعرفة غزارة نهر ما تقاس كميّة الماء المارّة عبر مقطع النّهر خلال وحدة الزّمن/, 'the river analogy');
  assert.match(intensity, /كيف يُمكن معرفة كميّة الكهرباء المارّة عبْر مقطع دارة كهربائيّة ما خلال واحدة الزّمن/, 'the «أساءَل» prompt');
  assert.match(intensity, /أُتمِّمُ الجدول الآتي وأقارن النتائج/, 'the table instruction');
  assert.match(intensity, /أرسمُ الخطّ البيانيّ الممثّل لقيم/);
  assert.match(intensity, /ألاحظ شكل الخط البيانيّ الناتج/);
  // the printed cells survive, including the blank ones
  for (const value of ['20', '40', '60', '80', '100', '5', '10', '20', '15', '25']) has(intensity, value, `table value ${value}`);
  assert.match(intensity, /\(فارغة\)/, 'the empty printed cells are marked empty, not invented');
  assert.match(intensity, /قيد مصدر/, 'the derived cells are documented');
  for (const point of ['(5, 20)', '(10, 40)', '(15, 60)', '(20, 80)', '(25, 100)']) has(intensity, point, `graph point ${point}`);
  assert.match(section('nb-s04'), /diagram-card student-notebook-figure/, 'the q–t graph figure');
  tex('\\dfrac{20}{5}=\\dfrac{40}{10}=\\dfrac{60}{15}=\\dfrac{80}{20}=\\dfrac{100}{25}=4\\,\\mathrm{A}');
  assert.match(intensity, /الميل هو الشدة/, 'the slope is read as the current');
});

test('page 91: all nine conclusions, the ampere definition and every prefix', () => {
  const concepts = sectionText('nb-s05');
  for (const conclusion of [
    'وهي تُعبّر عن شِدّة التيّار الكهربائيّ',
    'هي كميّة الكهرباء',
    'تُحسَب شِدّة التيّار الكهربائيّ من العلاقة',
    'كميّة الكهرباء المارّة عبر مقطع النّاقل وتقدر بالكولوم',
    'الزّمن يقدر بالثانية',
    'شَدّة التيّار تقدر بالأمبير',
    'شِدّة تيّار كهربائيّ ناتج عن مرور كميّة من الكهرباء قدرها',
  ]) has(concepts, conclusion, `p91 conclusion "${conclusion}"`);
  assert.match(concepts, /كيلو أمبير/);
  assert.match(concepts, /ميلي أمبير/);
  assert.match(concepts, /ميكرو أمبير/);
  tex('\\mathrm{A}=\\dfrac{\\mathrm{C}}{\\mathrm{s}}');
  tex('1\\,\\mathrm{kA}=10^{3}\\,\\mathrm{A}');
  tex('1\\,\\mathrm{mA}=10^{-3}\\,\\mathrm{A}');
  tex('1\\,\\mu\\mathrm{A}=10^{-6}\\,\\mathrm{A}');
  tex('1\\,\\mathrm{A}=\\dfrac{1\\,\\mathrm{C}}{1\\,\\mathrm{s}}');
  // the conversion table covers every time conversion used anywhere in the lesson
  for (const conversion of ['1\\,\\mathrm{min}=60\\,\\mathrm{s}', '2\\,\\mathrm{min}=120\\,\\mathrm{s}',
    '3\\,\\mathrm{min}=180\\,\\mathrm{s}', '5\\,\\mathrm{min}=300\\,\\mathrm{s}',
    '200\\,\\mathrm{mA}=0.2\\,\\mathrm{A}', '0.1\\,\\mathrm{A}=100\\,\\mathrm{mA}']) tex(conversion);
});

test('the milliampere drill and the 6 V ↔ 1.5 V consistency are both present and labelled', () => {
  const concepts = sectionText('nb-s05');
  assert.match(concepts, /تدريب على التحويل قبل الحساب/);
  tex('200\\times10^{-3}\\,\\mathrm{A}');
  tex('2\\times10^{-3}\\,\\mathrm{A}');
  tex('100\\times10^{-3}\\,\\mathrm{A}');
  for (const value of ['0.2\\,\\mathrm{A}', '0.002\\,\\mathrm{A}', '0.1\\,\\mathrm{A}']) tex(value);
  // the two printed voltages are consistent with each other, and the note says so
  const parallel = sectionText('nb-s09');
  assert.match(parallel, /العلاقة بين المثالين/);
  tex('\\dfrac{6}{4}=1.5\\,\\mathrm{V}');
  assert.match(parallel, /لا يُستعمل في حساب شدة التيار|ولا يُستعمل|لا يضيف قانوناً جديداً/);
});

test('page 91 worked example: the full statement, all four givens and both computed parts', () => {
  const worked = sectionText('nb-s06');
  assert.match(worked, /دارة تيّار كهربائيّ مُتواصِل يمرُّ عبر مقطعها كميّة من الكهرباء قدرها/);
  assert.match(worked, /قيمة شِدّة التيّار المارّ في الدّارة/);
  assert.match(worked, /كميّة الكهرباء المارّة عبر مقطع الدّارة خلال ثلاث دقائق/);
  assert.match(worked, /المعطيات والمطلوب/);
  // the two printed calculations, exactly as the book writes them
  tex('I=\\dfrac{60}{30}=2\\,\\mathrm{A}');
  tex('q=2\\times(3\\times60)=360\\,\\mathrm{C}');
  assert.match(worked, /التحقّق من معقولية النتيجة/);
  assert.match(worked, /\\d|180/, 'the check uses the 180 s conversion');
  assert.match(worked, /خطأ شائع/);
});

test('page 92: the ammeter, the series experiment, its two conclusions and the 200 mA reading', () => {
  const series = sectionText('nb-s07');
  assert.match(series, /تقاس شِدّة التيّار الكهربائيّ عمليّاً باستخدام مقياس الأمبير الذي يُوصل على التَّسلسُل/);
  assert.match(series, /مولّد تيار مستمر - مصباحان/);
  assert.match(series, /مقياسا أمبير/);
  assert.match(series, /أسلاك توصيل/);
  assert.match(series, /أركّبُ الدّارة كما هو موضّح في الشّكل ونلاحظ قراءة كلٍّ من مقياسي الأمبير/);
  assert.match(series, /أنزِعُ أحد المصباحين مع المحافظة على ترتيب الدّارة/);
  assert.match(series, /شِدّة التيّار ثابتة في كل أجزاء الدّارة/);
  assert.match(series, /عند نزع أحد أجزاء الدّارة ينقطع التيّار عن الدّارة الكهربائيّة/);
  tex('I=\\mathrm{Const}');
  assert.match(series, /200/, 'the printed 200 mA reading');
  assert.match(section('nb-s07'), /diagram-card student-notebook-figure/, 'the series circuit figure');
  // why the ammeter goes in series is an explicit platform addition
  assert.match(series, /لماذا على التسلسل/);
  assert.match(series, /إثراء من المنصة/);
});

test('page 93: batteries in series (6 V) and the three-step parallel experiment', () => {
  const battery = sectionText('nb-s08');
  assert.match(battery, /وصل مجموعة مولّدات متماثلة على التَّسلسُل/);
  assert.match(battery, /يُوصل القطب الموجب للمولّد إلى القطب السّالب في المولّد الذي يليه/);
  assert.match(battery, /6/, 'the printed 6 Volts');
  assert.match(battery, /Volts/);
  assert.match(battery, /ليس قانوناً لشدة التيار/, 'the voltage example is not a current law');
  assert.match(section('nb-s08'), /diagram-card student-notebook-figure/, 'the series batteries figure');

  const parallel = sectionText('nb-s09');
  assert.match(parallel, /مولّد تيار مُتواصِل - مصباحان مختلفان/);
  assert.match(parallel, /ثلاثة مقاييس أمبير/);
  assert.match(parallel, /أركّبُ الدّارة الموضّحة بالشّكل وألاحظُ قراءة مقاييس الأمبير/);
  assert.match(parallel, /أقارنُ قراءة مقياس الأمبير/);
  assert.match(parallel, /أنزِعُ أحد المصابيح مع المحافظة على ترتيب الدّارة/);
  assert.match(parallel, /قيد مصدر/, 'the duplicated L1 label is documented');
  assert.match(section('nb-s09'), /diagram-card student-notebook-figure/, 'the parallel circuit figure');
});

test('page 94: the three parallel conclusions, the 1.5 V example and all seven «تعلّمتُ» items', () => {
  const parallel = sectionText('nb-s09');
  assert.match(parallel, /في الوصل على التفرّع تكون شِدّات التيّار مختلفة/);
  assert.match(parallel, /شِدّة التيّار في الدّارة الأصلية تساوي مجموع شِدّات التيّارات في فروع الدّارة المختلفة/);
  assert.match(parallel, /عند نزع أحد أجهزة الدّارة التفرّعية يبقى التيّار الكهربائيّ في بقية الفروع/);
  assert.match(parallel, /1\.5/);
  assert.match(parallel, /Volts/);
  tex('I=I_{1}+I_{2}');
  assert.match(section('nb-s09'), /batteries-parallel|student-notebook-figure/);
  assert.match(parallel, /الجهد المطبوع/);

  const summary = sectionText('nb-s10');
  for (const item of [
    'انتقال مستمرٌّ للإلكترونات الحرّة باتجاهٍ واحد',
    'يجب أن تحتوي على مولّد وأن تكون الدّارة مغلقة',
    'شِدّة التيّار تعطى بالعلاقة',
    'جهة التيّار من القطب الموجب للمولّد إلى القطب السّالب خارج المولّد',
    'المولّد لا يُنتِج إلكترونات ولكن يُسبّب حركة الإلكترونات في الدّارة',
    'تكون شِدّة التيّار ثابتة في جميع أجزاء الدّارة الموصولة على التَّسلسُل',
    'تكون شِدّة التيّار مختلفة في جميع أجزاء الدّارة الموصولة على التفرّع',
  ]) has(summary, item, `«تعلّمتُ» item "${item}"`);
});

test('pages 95–96: all five self-check questions, every option and every answer', () => {
  const checkOne = sectionText('nb-s11');
  assert.match(checkOne, /اكتب المصطلح العلمي المناسب لكلٍّ من العبارات/);
  for (const prompt of [
    'كميّة الشّحنة التي تجتاز مقطع النّاقل في الثّانية الواحدة',
    'شحنة قدرها كولوم واحد تجتاز مقطع النّاقل في ثانية واحدة',
    'جهاز يستخدم لقياس شِدّة التيّار و يُوصَل في الدّارة على التَّسلسُل',
    'حركة مستمرة ومباشرة للإلكترونات في دارة كهربائية مغلقة',
  ]) has(checkOne, prompt, `term prompt "${prompt}"`);
  for (const term of ['شِدّة التيّار الكهربائيّ', 'الأمبير', 'مقياس الأمبير', 'التيّار الكهربائيّ المُتواصِل (المستمر)']) {
    has(checkOne, term, `term answer "${term}"`);
  }
  assert.match(checkOne, /ضعْ إشارة صح أمام العبارة الصّحيحة|ضع إشارة صح|إشارة صح/);
  assert.match(checkOne, /جهة التيّار في الدّارة المغلقة من القطب السّالب إلى الموجب/);
  matches(checkOne, /يُوصَل مقياس أمبير في الدّارة على التَّسلسُل/, 'the ammeter true/false statement');
  assert.match(checkOne, /خطأ/, 'the false statement is judged false');
  assert.match(checkOne, /صح/, 'the true statement is judged true');
  assert.match(checkOne, /المنحني المُعبّر عن تغيُّرات شِدّة التيّار مع الزّمن في التيار المُتواصِل/);
  for (const curve of ['a', 'b', 'c', 'd']) {
    assert.ok(new RegExp(`<th scope="row"><bdi dir="ltr">${curve}</bdi></th>`).test(section('nb-s11')), `curve ${curve}`);
  }
  assert.match(checkOne, /خط أفقي/, 'the constant curve is identified');
  assert.match(checkOne, /خط أفقي ثابت/, 'the answer names the horizontal, constant curve');
  assert.match(checkOne, /متغيّرة/, 'the answer rules out the varying curves');

  const checkTwo = sectionText('nb-s12');
  assert.match(checkTwo, /المُسبّب لحركة الإلكترونات في الدّارة هو/);
  for (const option of ['المصباح الكهربائيّ.', 'المولّد الكهربائيّ.', 'القاطعة.', 'مقياس أمبير.']) {
    has(checkTwo, option, `cause option "${option}"`);
  }
  assert.match(checkTwo, /أعطِ تفسيراً علمياً لما يأتي/);
  assert.match(checkTwo, /قاصمة منصهرة/);
  assert.match(checkTwo, /سبب ناقلية المعادن للتيّار وعدم ناقلية العوازل/);
  assert.match(checkTwo, /نغذّي دارة كهربائيّة بمنبع تيار متواصل فتمرُّ كميّة من الكهرباء قدرُها/);
  tex('12\\,\\mathrm{c}'); // the printed misprint is preserved, not corrected
  assert.match(checkTwo, /قيد مصدر/, 'the 12 c misprint is documented');
  assert.match(checkTwo, /المطلوب الأول: شدة التيار/);
  assert.match(checkTwo, /المطلوب الثاني: كمية الكهرباء خلال/);
  tex('I=\\dfrac{q}{t}=\\dfrac{12}{120}=0.1\\,\\mathrm{A}');
  tex('q=I\\,t=0.1\\times300=30\\,\\mathrm{C}');
  assert.match(checkTwo, /2\.5/, 'the proportional check 5/2 = 2.5');
  assert.match(checkTwo, /6\\,\\mathrm{A}|6 A|ستة أمبير|6/);
});

test('the reference sections carry the symbols, the laws, the traps and the source caveats', () => {
  const symbols = sectionText('nb-s13');
  for (const symbol of ['I', 'q', 't', 'kA', 'mA', 'V', 'L', 'A']) has(symbols, symbol, `symbol ${symbol}`);
  assert.match(symbols, /أمبير/);
  assert.match(symbols, /كولوم/);
  assert.match(symbols, /أمثلة الجهود/);
  assert.match(symbols, /6/, 'the 6 V example is tabulated');
  assert.match(symbols, /1\.5/, 'the 1.5 V example is tabulated');

  const laws = sectionText('nb-s14');
  for (const entry of ['قانون شدة التيار', 'كمية الكهرباء', 'الزمن', 'ثبات النسبة', 'التناسب الطردي',
    'الوصل على التسلسل', 'الوصل على التفرّع']) has(laws, entry, `law "${entry}"`);
  assert.match(laws, /شرط التطبيق/);
  tex('q=I\\,t');
  tex('t=\\dfrac{q}{I}');

  const traps = sectionText('nb-s15');
  for (const trap of ['جهة التيار من السالب إلى الموجب', 'الأمبير', 'مقياس الأمبير', 'القسمة على عدد الدقائق',
    '12 c', 'ينتج الإلكترونات', 'التفرّع', 'التسلسل', '1.5 V', 'b أو c']) has(traps, trap, `trap "${trap}"`);

  const exam = sectionText('nb-s16');
  assert.match(exam, /خارج المولّد/);
  assert.match(exam, /خطة إجابة سؤال حسابي/);

  const caveats = sectionText('nb-s17');
  for (const caveat of ['ص ٩٠', 'ص ٩٣', 'ص ٩٦', 'ص ٨٧', 'ص ٨٨', 'ص ٩٢', 'ص ٨٩']) has(caveats, caveat, `caveat page ${caveat}`);
  assert.match(caveats, /لا يوجد رقم واحد من خارج الدرس|من خارج الدرس/);

  const checklist = sectionText('nb-s18');
  assert.ok((section('nb-s18').match(/<li>/g) ?? []).length >= 10, 'a real revision checklist');
});

test('each self-check answer block prints «الإجابة» once and never repeats its own prompt', () => {
  const blocks = [...html.matchAll(/<div class="student-notebook-qa">([\s\S]*?)<\/div>/g)].map(([, body]) => body);
  assert.ok(blocks.length >= 4, `the notebook carries answered self-check items (found ${blocks.length})`);
  for (const block of blocks) {
    const labels = (block.match(/الإجابة[::]/g) ?? []).length;
    assert.ok(labels <= 1, `«الإجابة» printed once per block: ${plain(block).slice(0, 90)}`);
    const q = plain((block.match(/student-notebook-qa-q">([\s\S]*?)<\/p>/) ?? [, ''])[1]);
    const a = plain((block.match(/student-notebook-qa-a">([\s\S]*?)<\/p>/) ?? [, ''])[1]);
    assert.ok(q.length > 0 && a.length > 0, 'both the question and the answer are present');
    assert.notEqual(q, a, 'the answer block does not restate its own prompt verbatim');
    assert.ok(!a.startsWith('الإجابة الإجابة'), 'no doubled answer label');
  }
});

/* ---------------------------------------------------------------------------
   Content that existed before this task and must never be lost.
   ------------------------------------------------------------------------- */

test('every study point of the previous selective sheet is still present', () => {
  for (const phrase of [
    'I=\\dfrac{q}{t}', 'q=I\\,t', 't=\\dfrac{q}{I}', '\\dfrac{q}{t}=\\mathrm{const}',
    'I=\\mathrm{Const}', 'I=I_{1}+I_{2}', '\\mathrm{kA}=10^{3}', '\\mathrm{mA}=10^{-3}',
    '\\mu\\mathrm{A}=10^{-6}', '2\\,\\mathrm{min}=120\\,\\mathrm{s}', '5\\,\\mathrm{min}=300\\,\\mathrm{s}',
    '200\\,\\mathrm{mA}=0.2\\,\\mathrm{A}', '0.1\\,\\mathrm{A}=100\\,\\mathrm{mA}',
    '12\\,\\mathrm{c}', '360\\,\\mathrm{C}', '30\\,\\mathrm{C}', '4\\,\\mathrm{A}',
    'دارة مغلقة', 'خارج المولّد', 'بالكولوم', 'بالثانية', 'بالأمبير', 'مقياس الأمبير',
    'الأنبوب', 'التسلسل', 'التفرّع', 'القاصمة المنصهرة', 'العوازل', 'المنحنى',
    '6 V', '1.5 V', 'لا تُجمع الشدات', 'شرح المنصة', 'إثراء من المنصة',
    'إلكترونات حرّة', 'المولّد', 'المصباح', 'القاطعة', 'الكولوم', 'الأمبير',
  ]) assert.ok(html.includes(phrase), `missing previously covered study point: ${phrase}`);
});

/* ---------------------------------------------------------------------------
   Rendering: single-line equations, LTR isolation, no clipping, no script.
   ------------------------------------------------------------------------- */

test('equations, tables and the sheet stay inside the viewport on laptop and phone', async () => {
  const css = await read('../src/unit2-lesson2.css');
  assert.doesNotMatch(html, /<script|<style=|style="[^"]*width:\s*\d{3,}px/);
  assert.doesNotMatch(html, /\$\$|\\begin\{aligned\}/);
  const bs = String.fromCharCode(92);
  assert.equal(html.includes(bs + bs), false, 'no TeX line breaks splitting an equation');
  assert.doesNotMatch(html.replace(/<[^>]+>/g, ' '), /undefined|NaN|\[object Object\]/);
  assert.equal(html.includes('katex-error'), false);
  assert.ok((html.match(/class="student-notebook-table-wrap"/g) ?? []).length >= 20, 'many reference tables');
  assert.equal((html.match(/<table class="student-notebook-table">/g) ?? []).length,
    (html.match(/<caption>/g) ?? []).length, 'every table is captioned');
  assert.ok((html.match(/class="student-notebook-formula"/g) ?? []).length >= 12, 'law cards');
  assert.ok((html.match(/class="student-notebook-step"/g) ?? []).length >= 2, 'worked-example rows');
  assert.equal((html.match(/<div class="math math-display/g) ?? []).length,
    (html.match(/class="math math-display equation"/g) ?? []).length);
  for (const rule of [
    '.u2l2-page .student-notebook {', '.u2l2-page .student-notebook-formula,',
    '.u2l2-page .student-notebook-table-wrap {', 'overflow-x: auto;',
    '.u2l2-page .student-notebook-toc {', '.u2l2-page .student-notebook-figure {',
    '.u2l2-page .student-notebook-conclusion {', '.u2l2-page .student-notebook-checklist {',
    '@media (max-width: 760px)', '@media (max-width: 480px)',
    '.u2l2-page .lesson-sidebar {', '[data-stage="student-notebook"]',
  ]) assert.ok(css.includes(rule), `css rule: ${rule}`);
});

test('RTL prose never swallows Latin math: every formula is LTR-isolated and typeset by KaTeX', () => {
  assert.doesNotMatch(html, /katex-error/);
  const display = [...html.matchAll(/<div class="math math-display[^"]*" dir="ltr"/g)];
  assert.ok(display.length >= 20, `twenty display equations (found ${display.length})`);
  const inline = [...html.matchAll(/<span class="math math-inline" dir="ltr"/g)];
  assert.ok(inline.length >= 150, `symbols stay inline and LTR (found ${inline.length})`);

  const bdiBodies = html.split('<bdi dir="ltr">').slice(1)
    .map((part) => part.slice(0, part.indexOf('</bdi>')));
  assert.ok(bdiBodies.length >= 40, `the notebook isolates Latin tokens (found ${bdiBodies.length})`);
  for (const body of bdiBodies) {
    assert.doesNotMatch(body, /[\u0600-\u06FF]/, `Arabic text must not be wrapped in dir="ltr": ${body}`);
  }
  assert.doesNotMatch(html, / < /, 'no raw less-than sign leaks into RTL prose');
  for (const [, attrs] of html.matchAll(/<bdi([^>]*)>/g)) {
    assert.match(attrs, /dir="ltr"/, 'every bdi declares its direction');
  }
  // no bare LaTeX delimiters survive into the prose: every symbol goes through src/math.js
  assert.doesNotMatch(text, /\\\(|\\\)|\\dfrac|\\mathrm/);
});

test('no Arabic-Indic digit is left glued to a Latin unit in the prose (bidi safety)', () => {
  /* A number followed by a Latin unit inside RTL prose is reordered by the bidi
   * algorithm ("٢٠٠ mA" was rendered as "mA ٢٠٠"). Every value+unit must be one
   * LTR-isolated token or one KaTeX expression, so this can never happen again. */
  const prose = plain(html);
  const glued = [...prose.matchAll(/[\u0660-\u0669]+\s*(?:mA|kA|\u00b5A|A|C|c|s|V|min|Volts|cm)\b/g)]
    .map((match) => match[0]);
  assert.deepEqual(glued, [], `value+unit left in Arabic prose: ${glued.join(' | ')}`);
  // and every such pair that *is* printed lives inside a rendered expression
  for (const value of ['200\\,\\mathrm{mA}', '4\\,\\mathrm{A}', '6\\,\\mathrm{V}', '1.5\\,\\mathrm{V}']) tex(value);
});

test('every printed voltage and current of the lesson appears once, and only in its context', () => {
  // voltages are examples of potential, never inputs of the current law
  for (const voltage of ['6\\,\\mathrm{V}', '1.5\\,\\mathrm{V}']) tex(voltage);
  const caveat = sectionText('nb-s13');
  assert.match(caveat, /مثالان على الجهد|جهد خلية واحدة|لا يُدخل في حساب شدة التيار/);
  assert.match(sectionText('nb-s08'), /ليس قانوناً لشدة التيار/);
  assert.match(sectionText('nb-s15'), /مثالان على الجهد/);
  // the four printed readings/values are all quoted
  for (const value of ['60\\,\\mathrm{C}', '30\\,\\mathrm{s}', '200\\,\\mathrm{mA}', '12\\,\\mathrm{c}']) tex(value);
});

test('every diagram the notebook shows is the lesson\'s own SVG source', () => {
  const figures = [...html.matchAll(/class="diagram-card student-notebook-figure"[\s\S]*?<strong>([^<]+)<\/strong>/g)];
  assert.equal(figures.length, 7, 'all seven lesson diagrams appear once');
  for (const key of ['intro-scenes', 'current-direction', 'qt-graph', 'series-circuit', 'parallel-circuit', 'batteries-series', 'batteries-parallel']) {
    assert.ok(html.includes(UNIT2L2_DIAGRAMS[key].svg), `the ${key} SVG is the lesson's own drawing`);
    assert.ok(html.includes(UNIT2L2_DIAGRAMS[key].title), `the ${key} title is kept`);
  }
  // and no figure is authored twice
  for (const key of Object.keys(UNIT2L2_DIAGRAMS)) {
    const occurrences = html.split(UNIT2L2_DIAGRAMS[key].svg).length - 1;
    assert.equal(occurrences, 1, `${key} is embedded exactly once`);
  }
});

/* ---------------------------------------------------------------------------
   Provenance: additions are labelled, and printed text is not reworded.
   ------------------------------------------------------------------------- */

test('added explanations are labelled, and no printed value is presented as an answer the book does not print', () => {
  const tags = (html.match(/class="student-notebook-tag/g) ?? []).length;
  assert.ok(tags >= 10, `enrichment and inference notes are labelled (found ${tags})`);
  assert.match(text, /إثراء من المنصة/);
  assert.match(text, /من الكتاب/);
  assert.match(text, /استنتاج تعليمي/);
  // the answers that the textbook does not print are declared as inferences
  assert.match(sectionText('nb-s01'), /الكتاب يطرح الأسئلة الثلاثة دون إجابات مطبوعة|دون إجابات مطبوعة/);
  assert.match(sectionText('nb-s12'), /الكتاب يطلب التفسير ولا يطبعه|استنتاج تعليمي/);
  // printed figures are quoted verbatim: the notebook does not paraphrase the book's numbers
  for (const printed of ['60\\,\\mathrm{C}', '30\\,\\mathrm{s}', '360\\,\\mathrm{C}', '200\\,\\mathrm{mA}']) tex(printed);
});

/* ---------------------------------------------------------------------------
   Runtime navigation: install a minimal DOM shim and boot the real module.
   ------------------------------------------------------------------------- */

class ShimElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attrs = {};
    this.listeners = {};
    this.style = { setProperty() {}, getPropertyValue() { return ''; }, removeProperty() {} };
    this.dataset = {};
    this._html = '';
    this.textContent = '';
    this.disabled = false;
    this.scrollTop = 0;
    this.scrollHeight = 0;
    this.clientHeight = 0;
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  set innerHTML(value) { this._html = String(value); }
  get innerHTML() { return this._html; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  getAttribute(name) { return this.attrs[name] ?? null; }
  removeAttribute(name) { delete this.attrs[name]; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  get childElementCount() { return this.children.length; }
  querySelector(selector) {
    return selector === '[aria-current="step"]'
      ? this.children.find((child) => child.attrs['aria-current'] === 'step') ?? null
      : null;
  }
  querySelectorAll() { return []; }
  addEventListener(type, handler) { (this.listeners[type] ??= []).push(handler); }
  fire(type, event = {}) { for (const handler of this.listeners[type] ?? []) handler({ preventDefault() {}, target: this, ...event }); }
  focus() {}
  scrollIntoView() {}
  getBoundingClientRect() { return { top: 100, bottom: 700, left: 0, right: 300, width: 300, height: 600 }; }
  closest() { return null; }
}

test('runtime: the notebook is the single last tab and every navigation path reaches it', async () => {
  const registry = new Map();
  for (const id of ['page-nav', 'page-content', 'page-heading', 'page-number', 'progress-text', 'progress-track',
    'progress-fill', 'mobile-progress-fill', 'previous-button', 'next-button', 'previous-label', 'next-label',
    'control-center', 'section-kicker']) {
    const element = new ShimElement();
    element.id = id;
    registry.set(`#${id}`, element);
  }
  const sidebar = new ShimElement('aside');
  const windowListeners = {};
  const previousGlobals = {
    document: globalThis.document,
    window: globalThis.window,
    matchMedia: globalThis.matchMedia,
    requestAnimationFrame: globalThis.requestAnimationFrame,
  };
  globalThis.document = {
    querySelector: (selector) => (selector === '.lesson-sidebar' ? sidebar : registry.get(selector) ?? null),
    createElement: (tag) => new ShimElement(tag),
    addEventListener() {},
  };
  globalThis.window = {
    innerWidth: 1440,
    innerHeight: 900,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener: (type, handler) => { (windowListeners[type] ??= []).push(handler); },
    requestAnimationFrame: (handler) => { handler(); return 1; },
  };
  globalThis.matchMedia = window.matchMedia;
  globalThis.requestAnimationFrame = window.requestAnimationFrame;

  try {
    await import('../src/unit2-lesson2-main.js');
    const nav = registry.get('#page-nav');
    const content = registry.get('#page-content');
    const heading = registry.get('#page-heading');
    const center = registry.get('#control-center');
    const progress = registry.get('#progress-text');
    const pageNumber = registry.get('#page-number');
    const nextButton = registry.get('#next-button');
    const previousButton = registry.get('#previous-button');

    assert.equal(nav.children.length, 11, 'the rail renders eleven tabs');
    assert.equal(nav.children.filter((button) => button.dataset.stage === 'student-notebook').length, 1);
    assert.equal(nav.children.at(-1).dataset.stage, 'student-notebook', 'and it is the last tab');

    for (let step = 0; step < 11; step += 1) {
      const rendered = content.innerHTML;
      const notebooks = (rendered.match(/class="student-notebook u2l2-student-notebook"/g) ?? []).length;
      assert.equal(notebooks, step === 10 ? 1 : 0, `step ${step + 1} renders the notebook ${step === 10 ? 'once' : 'nowhere'}`);
      assert.equal(nav.children.filter((button) => button.attrs['aria-current'] === 'step').length, 1,
        `step ${step + 1} marks exactly one current tab`);
      if (step < 10) nextButton.fire('click');
    }
    assert.equal(heading.textContent, 'دفتر الطالب');
    assert.equal(nextButton.disabled, true, 'the notebook is the end of the lesson');
    assert.equal(progress.textContent, '11 / 11');
    assert.match(center.textContent, /المرحلة 11 من 11 · دفتر الطالب/);
    assert.match(content.innerHTML, /student-notebook-toc/, 'the notebook renders its contents');

    const keydown = windowListeners.keydown ?? [];
    for (const handler of keydown) handler({ key: 'PageUp', preventDefault() {}, target: { closest: () => null } });
    assert.equal(heading.textContent, 'اختبر نفسي: تتمة الأسئلة', 'PageUp returns to printed page 96');
    assert.equal(pageNumber.textContent, '96');
    for (const handler of keydown) handler({ key: 'PageDown', preventDefault() {}, target: { closest: () => null } });
    assert.equal(heading.textContent, 'دفتر الطالب', 'PageDown returns to the notebook');

    previousButton.fire('click');
    assert.notEqual(heading.textContent, 'دفتر الطالب', 'the previous button leaves the notebook');
    while (previousButton.disabled === false) previousButton.fire('click');
    assert.equal(heading.textContent, 'تمهيد الدرس: التيار الكهربائي المتواصل', 'the first stage is still the floor');
  } finally {
    for (const [key, value] of Object.entries(previousGlobals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
