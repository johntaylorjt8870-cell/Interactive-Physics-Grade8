import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT2L2_PAGES, UNIT2L2_META } from '../src/unit2-lesson2-content.js';
import { UNIT2L2_NOTEBOOK_BLOCK, UNIT2L2_NOTEBOOK_TITLE } from '../src/unit2-lesson2-notebook.js';
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
const text = html.replace(/<annotation[\s\S]*?<\/annotation>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

/* The owning page is `unit2-lesson-2.html`: Unit 2 · الكهرباء · الدرس 2
   «التيار الكهربائي المتواصل», printed pages 87–96. Every placement assertion
   is anchored to that ownership, not to the phrase «دفتر الطالب» existing
   somewhere in the repository, so the notebook cannot drift into the appendix,
   the home page, «الفيزياء في حياتنا», a Unit 1 lesson or another Unit 2 lesson. */

test('the student notebook is the eleventh and final tab of the real Unit 2 Lesson 2', async () => {
  const [page, main, home, build, audit] = await Promise.all([
    read('../unit2-lesson-2.html'),
    read('../src/unit2-lesson2-main.js'),
    read('../index.html'),
    read('../scripts/build.mjs'),
    read('../docs/unit-2-lesson-2-source-audit.md'),
  ]);

  // 1. one reference stage, last, inside the lesson's own step array
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

  // 2. identity by title, breadcrumb, page sequence and home-page order — not the filename alone
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
  assert.match(audit, /مرقم \*\*2\*\* في رأس الصفحة 87/);
  const unitTwoStart = home.indexOf('<div class="unit-panel">', home.indexOf('<div class="unit-panel">') + 1);
  assert.deepEqual([...home.slice(unitTwoStart).matchAll(/href="\.\/unit2-lesson-([1234])\.html"/g)].map((m) => Number(m[1])), [1, 2, 3, 4]);
  assert.ok(home.indexOf('الصفحات 73–86') < home.indexOf('الصفحات 87–96'));
  assert.ok(home.indexOf('الصفحات 87–96') < home.indexOf('الصفحات 97–106'));
  assert.match(build, /'unit2-lesson-2\.html'/, 'the lesson page stays in the production build');

  // 3. the real lesson bootstrap renders the notebook from UNIT2L2_PAGES
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

  // Other lessons keep their own step lists and their own notebooks; none imports ours.
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

test('the notebook is a selective study sheet, not a copy of the textbook', () => {
  const headings = [
    '١. الفكرة الأساسية',
    '٢. تعريفات ومصطلحات لا تُنسى',
    '٣. القوانين والعلاقات: الرموز والوحدات والشروط',
    '٤. ما أرسمه وما أقرأه في الرسوم',
    '٥. خطوات الحل ونمطان مهمان',
    '٦. التجارب: الهدف، الأدوات، النتيجة',
    '٧. ملاحظات امتحانية وأخطاء شائعة',
    '٨. خلاصة الدرس للمراجعة السريعة',
  ];
  let cursor = -1;
  for (const heading of headings) {
    const at = text.indexOf(heading);
    assert.ok(at > cursor, `missing or out-of-order notebook section: ${heading}`);
    cursor = at;
  }
  assert.equal((html.match(/class="student-notebook-section"/g) ?? []).length, 8, 'eight sections, not one card per sentence');
  assert.equal((html.match(/<article/g) ?? []).length, 1);
  assert.equal((html.match(/<h2/g) ?? []).length, 1);

  // every law, symbol, unit, condition, experiment outcome and exam trap that a
  // student needs for a problem or a test question
  for (const phrase of [
    'I=\\dfrac{q}{t}', 'q=I\\,t', 't=\\dfrac{q}{I}', '\\dfrac{q}{t}=\\mathrm{const}',
    'I=\\mathrm{Const}', 'I=I_{1}+I_{2}', '\\mathrm{kA}=10^{3}', '\\mathrm{mA}=10^{-3}',
    '\\mu\\mathrm{A}=10^{-6}', '2\\,\\mathrm{min}=120\\,\\mathrm{s}', '5\\,\\mathrm{min}=300\\,\\mathrm{s}',
    '200\\,\\mathrm{mA}=0.2\\,\\mathrm{A}', '0.1\\,\\mathrm{A}=100\\,\\mathrm{mA}',
    '12\\,\\mathrm{c}', '360\\,\\mathrm{C}', '30\\,\\mathrm{C}', '4\\,\\mathrm{A}',
    'دارة مغلقة', 'خارج المولّد', 'بالكولوم', 'بالثانية', 'بالأمبير', 'مقياس الأمبير',
    'الأنبوب', 'التسلسل', 'التفرّع', 'القاصمة المنصهرة', 'العوازل', 'المنحنى d',
    '6 V', '1.5 V', 'لا تُجمع الشدات', 'شرح المنصة', 'حل نموذجي من المنصة',
  ]) assert.ok(html.includes(phrase), `missing study point: ${phrase}`);

  // long verbatim textbook passages are deliberately absent: the notebook does
  // not reprint the lesson's narrative, experiment steps or question wording
  for (const passage of [
    'أُتمِّمُ الجدول الآتي وأقارن النتائج',
    'أضعُ الأنبوب الشفّاف على سطح أفقيّ',
    'أرسمُ الخطّ البيانيّ الممثّل لقيم',
    'ألاحظ شكل الخط البيانيّ الناتج',
    'يتعرّف التيّار الكهربائيّ المُتواصِل',
    'اكتب المصطلح العلمي المناسب لكلٍّ من العبارات',
    'نغذّي دارة كهربائيّة بمنبع تيار متواصل',
    'أعطِ تفسيراً علمياً لما يأتي',
  ]) assert.doesNotMatch(text, new RegExp(passage), `verbatim textbook passage copied: ${passage}`);
  assert.ok(text.length < 16000, `the sheet stays short enough to review: ${text.length} chars`);
});

test('equations, tables and the sheet stay inside the viewport on phone and desktop', async () => {
  const css = await read('../src/unit2-lesson2.css');
  assert.doesNotMatch(html, /<script|<style=|style="[^"]*width:\s*\d{3,}px/);
  assert.doesNotMatch(html, /\$\$|\\begin\{aligned\}/);
  const bs = String.fromCharCode(92);
  assert.equal(html.includes(bs + bs), false, 'no TeX line breaks splitting an equation');
  assert.doesNotMatch(html.replace(/<[^>]+>/g, ' '), /undefined|NaN|\[object Object\]/);
  assert.equal(html.includes('katex-error'), false);
  assert.equal((html.match(/class="student-notebook-table-wrap"/g) ?? []).length, 4);
  assert.equal((html.match(/class="student-notebook-table"/g) ?? []).length, 4);
  assert.equal((html.match(/class="student-notebook-formula"/g) ?? []).length, 6, 'six law cards');
  assert.ok((html.match(/class="student-notebook-step"/g) ?? []).length >= 7, 'worked-example rows');
  assert.equal((html.match(/<div class="math math-display/g) ?? []).length, (html.match(/class="math math-display equation"/g) ?? []).length);
  for (const rule of [
    '.u2l2-page .student-notebook {', '.u2l2-page .student-notebook-formula,',
    '.u2l2-page .student-notebook-table-wrap {', 'overflow-x: auto;',
    '@media (max-width: 760px)', '@media (max-width: 480px)',
    '.u2l2-page .lesson-sidebar {', '[data-stage="student-notebook"]',
  ]) assert.ok(css.includes(rule), `css rule: ${rule}`);
});

/* ---------------------------------------------------------------------------
   Runtime navigation check without a browser: install a minimal DOM shim and
   boot the real `src/unit2-lesson2-main.js`. This proves the notebook is the
   last tab *at runtime*, appears once, and that forward/back/keyboard
   navigation still works — not merely that the data array has eleven entries.
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
