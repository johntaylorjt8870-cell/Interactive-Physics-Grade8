import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT2_PAGES, UNIT2_META } from '../src/unit2-lesson1-content.js';
import {
  UNIT2_LESSON1_NOTEBOOK_BLOCK,
  UNIT2_NOTEBOOK_TITLE,
} from '../src/unit2-lesson1-notebook.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const NOTEBOOK_TITLE = '📒 دفتر الطالب';
const isNotebook = (stage) => stage.stageTitle === NOTEBOOK_TITLE || stage.navLabel === NOTEBOOK_TITLE || stage.id === 'student-notebook';
const notebook = UNIT2_PAGES.at(-1);
const text = UNIT2_LESSON1_NOTEBOOK_BLOCK.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

/* The lesson page that owns this notebook is `unit2-lesson-1.html`: the Unit 2
   Lesson 1 stepper (Unit 2 · الكهرباء · الدرس 1: الكهرباء الساكنة, book pages
   73–86). Every assertion below is anchored to that ownership, not merely to
   the phrase «دفتر الطالب» existing somewhere in the repository, so the notebook
   can never drift into the appendix, the unit page, «الفيزياء في حياتنا» or a
   Unit 1 lesson. */

test('the student notebook is the fifteenth and final tab of the real Unit 2 Lesson 1', async () => {
  const [page, main, build] = await Promise.all([
    read('../unit2-lesson-1.html'),
    read('../src/unit2-lesson1-main.js'),
    read('../scripts/build.mjs'),
  ]);

  // 1. it is the last stage of the Lesson 1 stepper, and there is exactly one
  assert.equal(UNIT2_PAGES.length, 15);
  assert.equal(UNIT2_PAGES.filter(isNotebook).length, 1, 'the notebook is never duplicated inside the lesson');
  assert.equal(notebook.navLabel, NOTEBOOK_TITLE);
  assert.equal(notebook.heading, 'دفتر الطالب');
  assert.match(notebook.blocks[0].html, /student-notebook-title/);
  assert.equal(notebook.blocks.length, 1, 'the notebook is one block, rendered by the stepper only');

  // 2. the fourteen teaching stages keep book pages 73–86, in order
  assert.deepEqual(
    UNIT2_PAGES.filter((stage) => !isNotebook(stage)).map((stage) => stage.page),
    [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
  );
  assert.equal(UNIT2_META.pages, '73–86');

  // 3. the real lesson page renders its stages from UNIT2_PAGES, so the last tab
  //    of the stepper *is* the notebook on unit2-lesson-1.html
  assert.match(main, /import \{ UNIT2_PAGES \} from '\.\/unit2-lesson1-content\.js'/);
  assert.match(main, /goToPage\(0\)/);
  assert.match(main, /if \(block\.type === 'student-notebook'\) return block\.html;/);
  assert.match(page, /src="\.\/src\/unit2-lesson1-main\.js"/);
  assert.match(page, /الكهرباء الساكنة/);
  assert.match(page, /aria-valuemax="15"/);
  assert.match(page, /1 \/ 15/);
  assert.match(page, /المرحلة 1 من 15/);
  assert.match(page, /١٥ مرحلة/);
  assert.match(build, /'unit2-lesson-1\.html'/, 'the lesson page stays in the production build');
});

test('the notebook sits inside Unit 2 Lesson 1 and on no other page', async () => {
  const pages = await Promise.all([
    '../index.html',
    '../lesson-1.html',
    '../lesson-2.html',
    '../unit2-lesson-1.html',
    '../unit2-lesson-1-appendix.html',
    '../unit2-lesson-1-teacher.html',
    '../unit2-lesson-1-test.html',
    '../unit2-lesson-2.html',
    '../unit2-lesson-2-appendix.html',
    '../unit2-lesson-3.html',
    '../unit2-lesson-3-appendix.html',
    '../unit2-lesson-4.html',
    '../appendices.html',
    '../unit-questions.html',
    '../unit2-exercises.html',
    '../physics-in-life.html',
    '../physics-in-life-lesson-1.html',
    '../lesson-1-appendix.html',
    '../lesson-2-appendix.html',
  ].map(read));

  // No page inlines the notebook: it is authored once in the lesson's own module
  // and rendered by the Unit 2 Lesson 1 stepper only. The lesson shell itself may
  // name the tab in its stage counter, but it never carries the notebook markup.
  for (const html of pages) {
    assert.doesNotMatch(html, /student-notebook/, 'no page pre-renders the notebook');
    if (html !== pages[3]) assert.doesNotMatch(html, /دفتر الطالب/, 'the notebook lives in one lesson only');
  }
  const lessonShell = pages[3];
  assert.equal((lessonShell.match(/دفتر الطالب/g) ?? []).length, 1,
    'the lesson shell names the notebook once, in the stage counter');
  assert.doesNotMatch(lessonShell, /student-notebook-title|student-notebook-sheet/);

  const [content, notebookSource] = await Promise.all([
    read('../src/unit2-lesson1-content.js'),
    read('../src/unit2-lesson1-notebook.js'),
  ]);
  assert.equal((notebookSource.match(/📒 دفتر الطالب/g) ?? []).length, 2,
    'the title is declared once and used once by the one heading');
  assert.equal((notebookSource.match(/<h2 id="student-notebook-title">📒 دفتر الطالب<\/h2>/g) ?? []).length, 1,
    'one notebook heading only');
  assert.equal((content.match(/UNIT2_LESSON1_NOTEBOOK_BLOCK/g) ?? []).length, 2, 'imported once and used once');

  // the other lessons of Unit 2 and the appendices keep their own step lists
  for (const module of ['unit2-lesson2-content.js', 'unit2-lesson3-content.js', 'unit2-lesson4-content.js']) {
    const source = await read(`../src/${module}`);
    assert.doesNotMatch(source, /UNIT2_LESSON1_NOTEBOOK_BLOCK|unit2-lesson1-notebook/,
      `${module} does not reuse this lesson's notebook`);
  }
  const appendix = await read('../src/unit2-lesson1-appendix-content.js');
  assert.doesNotMatch(appendix, /UNIT2_LESSON1_NOTEBOOK_BLOCK|unit2-lesson1-notebook/);
});

test('the notebook covers every scientific point of pages 73–86', () => {
  const headings = [
    '١. ما يطلبه الدرس مني',
    '٢. التعريفات والمصطلحات',
    '٣. الكاشف الكهربائي',
    '٤. التجارب الأربع',
    '٥. كمّ الشحنة',
    '٦. قوى التجاذب والتنافر',
    '٧. طرائق التكهرب الثلاث',
    '٨. قانون كولوم',
    '٩. الأمثلة المحلولة',
    '١٠. التفريغ الكهربائي',
    '١١. قراءة الرسوم',
    '١٢. «أختبر نفسي»',
    '١٣. أخطاء شائعة',
    '١٤. «تعلمت»',
    '١٥. حالات خاصة',
  ];
  let cursor = -1;
  for (const heading of headings) {
    const at = text.indexOf(heading);
    assert.ok(at > cursor, `missing or out-of-order notebook section: ${heading}`);
    cursor = at;
  }

  // definitions, apparatus, procedures and conclusions of the four experiments
  for (const phrase of [
    'لماذا أستخدم الكاشف الكهربائي',
    'قرص ناقل',
    'ساق ناقلة',
    'وريقتان ناقلتان خفيفتان',
    'وعاء زجاجي عازل',
    'حقيبة الكهرباء الساكنة',
    'كرة بلاستيكية – قطع صوف – ساق من الزجاج',
    'ساق بلاستيكية – كاشف كهربائي – كرة معدنية محمولة على عازل',
    'أبعد الإصبع والساق معاً',
    'تتوضع الشحنات الكهربائية وتبقى ساكنة',
    'مقدار كمية من المادة',
    'مانعة الصواعق سلك مدبب من الطرفين',
    'بنجامين فرانكلين',
    'شارل أوغستان دي كولوم',
    'الاختلاف الكبير بين الشحنتين',
    'انظر إلى الشكل التالي الذي يوضح كيفية تشكل ظاهرتي البرق والصاعقة',
    'نقربهما من بعض حتى تصبح المسافة بينهما ربع ما كانت عليه',
    'ملامسة ساق بلاستيكية معتدلة لساق معدنية',
    'لا يوجد تعريف مطبوع واحد',
    'نوعان: سالبة (−) وموجبة (+)',
  ]) {
    assert.ok(text.includes(phrase), `missing: ${phrase}`);
  }
});

test('every law, symbol, unit and textbook value of the lesson is in the notebook', () => {
  // laws, each typeset through the project helper as one line of TeX
  for (const law of [
    'F=K\\frac{q_{1}\\cdot q_{2}}{d^{2}}',
    'k=9\\times10^{9}\\,\\mathrm{N\\cdot m^{2}\\cdot C^{-2}}',
    'q=ne',
    'n=\\frac{q}{e}',
    'q=+e^{-}',
    'q=+2e^{-}',
    'q=+ne',
    'q=-ne',
    '1\\,\\mathrm{m}=100\\,\\mathrm{cm}',
    '1\\,\\mu\\mathrm{C}=10^{-6}\\,\\mathrm{C}',
    '\\frac{F_{2}}{F_{1}}=\\left(\\frac{d_{1}}{d_{2}}\\right)^{2}',
  ]) {
    assert.ok(UNIT2_LESSON1_NOTEBOOK_BLOCK.includes(law), `missing law: ${law}`);
  }

  // symbols and units of the law
  for (const symbol of ['q_{1}', 'q_{2}', 'd^{2}', 'K', 'k', '\\mathrm{N}', '\\mathrm{C}', '\\mathrm{m}', '\\mu\\mathrm{C}']) {
    assert.ok(UNIT2_LESSON1_NOTEBOOK_BLOCK.includes(symbol), `missing symbol: ${symbol}`);
  }

  // the book's own values: the p76 example and activity, p81 example, p85 problems, p86 problem
  for (const value of [
    '8\\times10^{-7}', '1.6\\times10^{-19}', '5\\times10^{12}', '20\\times10^{10}', '3.2\\times10^{-8}',
    '50\\times10^{-6}', '80\\times10^{-6}', '36\\,\\mathrm{N}',
    '6.02\\times10^{23}', '9.632\\times10^{4}', '96320', '0.145', '2.32',
    '5\\,\\mu\\mathrm{c}', '6\\,\\mu\\mathrm{c}', '-8\\,\\mu\\mathrm{c}', 'AB=20\\,\\mathrm{cm}', 'BC=40\\,\\mathrm{cm}',
    '60\\,\\mathrm{cm}', '6.75', '5.75',
  ]) {
    assert.ok(UNIT2_LESSON1_NOTEBOOK_BLOCK.includes(value), `missing textbook value: ${value}`);
  }

  // the self-check answers, with the route to each one
  for (const answer of [
    'مختلفين', 'تنافر', 'مماثلة', 'التأثير', 'شحنة',
    'تكهرب', 'تدافع', 'البروتون', 'تفريغ', 'عازل',
    'صح', 'غلط',
  ]) {
    assert.ok(text.includes(answer), `missing self-check answer: ${answer}`);
  }
  // the unused Column B option stays explicitly unused instead of being invented
  assert.ok(text.includes('دون استخدام'));
});

test('every notebook equation is a single rendered line with no TeX line break', () => {
  const html = UNIT2_LESSON1_NOTEBOOK_BLOCK;
  assert.equal((html.match(/linebreak="newline"/g) ?? []).length, 0);
  assert.equal((html.match(/katex-error/g) ?? []).length, 0, 'no equation fails to typeset');
  assert.doesNotMatch(html, /\\begin\{aligned\}/, 'no equation is split into aligned rows');
  const sources = [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map((m) => m[1]);
  assert.ok(sources.length > 60, 'the notebook typesets its equations through the project helper');
  const laws = sources.filter((source) => source.includes('=') && !source.includes('\\text'));
  assert.ok(laws.length > 20, 'the notebook carries its laws as real equations');
  for (const source of sources) {
    assert.doesNotMatch(source, /\\\\/, `doubled backslash is a TeX line break: ${source}`);
    assert.doesNotMatch(source.replace(/\\[a-zA-Z]+/g, ''), /times|div|dfrac|frac|mathrm|cdot|approx/,
      `command printed as a word in ${source}`);
  }
});

test('the notebook stylesheet reuses the shared contract and cannot widen the page', async () => {
  const css = await read('../src/unit2-lesson1.css');
  assert.match(css, /\.u2l1-page \.student-notebook \{/);
  assert.match(css, /\.u2l1-page \.student-notebook-tags/);
  assert.match(css, /\.u2l1-page \.student-notebook-step \{/);
  assert.match(css, /\.u2l1-page \.student-notebook-formula \{[^}]*overflow-x: auto/);
  assert.match(css, /\.u2l1-page \.student-notebook-table-wrap \{[^}]*overflow-x: auto/);
  assert.match(css, /@media \(max-width: 760px\) \{\s*\.u2l1-page \.student-notebook-header/);
  assert.match(css, /@media \(max-width: 480px\) \{\s*\.u2l1-page \.student-notebook-step \{ grid-template-columns: 1fr;/);
  // the fifteen-tab rail is bounded instead of pushing the page sideways
  assert.match(css, /\.u2l1-page \.lesson-sidebar > \.page-nav \{\s*min-height: 0;\s*overflow-y: auto;/);
  assert.match(await read('../src/unit2-lesson1-main.js'), /revealScrollTop|railMaxHeight/);
});

test('the notebook markup is a well-formed fragment that cannot break the page shell', () => {
  const html = UNIT2_LESSON1_NOTEBOOK_BLOCK;
  const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
    // SVG primitives used by inline KaTeX output are self-closed in the source
  ]);
  const stack = [];
  const problems = [];
  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>])*?)(\/?)>/g;
  let match;
  while ((match = tagPattern.exec(html)) !== null) {
    const [, closing, name, , selfClosing] = match;
    const tag = name.toLowerCase();
    if (closing) {
      const open = stack.pop();
      if (open !== tag) problems.push(`</${tag}> closes <${open ?? 'nothing'}>`);
    } else if (!selfClosing && !VOID.has(tag)) {
      stack.push(tag);
    }
  }
  if (stack.length) problems.push(`unclosed: ${stack.join(', ')}`);
  assert.deepEqual(problems, [], 'the notebook HTML is balanced');

  // one <article> root, one <h2> heading, and every heading level in order
  assert.equal((html.match(/<article\b/g) ?? []).length, 1);
  assert.equal((html.match(/<h2\b/g) ?? []).length, 1);
  assert.equal((html.match(/<h3\b/g) ?? []).length, 15);
  assert.equal((html.match(/<section class="student-notebook-section"/g) ?? []).length, 15);

  // no inline style/script, no page-widening fixed width, no raw TeX leak
  assert.doesNotMatch(html, /<script|<style=|style="[^"]*width:\s*\d{3,}px/);
  assert.doesNotMatch(html, /\$\$|\\begin\{aligned\}/);
  const textContent = html.replace(/<[^>]+>/g, ' ');
  assert.doesNotMatch(textContent, /undefined|NaN|\[object Object\]/);
});

/* ---------------------------------------------------------------------------
   Runtime navigation check without a browser.
   The stepper bootstrap is DOM-driven, so this test installs a minimal DOM shim
   (elements, listeners, matchMedia, requestAnimationFrame) and boots the real
   `src/unit2-lesson1-main.js`. It is the guard that the notebook is the last tab
   *at runtime*, that it appears once, and that forward/back/keyboard navigation
   still work — not merely that the data array has fifteen entries.
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
    await import('../src/unit2-lesson1-main.js');
    const nav = registry.get('#page-nav');
    const content = registry.get('#page-content');
    const heading = registry.get('#page-heading');
    const center = registry.get('#control-center');
    const progress = registry.get('#progress-text');
    const pageNumber = registry.get('#page-number');
    const nextButton = registry.get('#next-button');
    const previousButton = registry.get('#previous-button');

    assert.equal(nav.children.length, 15, 'the rail renders fifteen tabs');
    assert.equal(nav.children.filter((button) => button.dataset.stage === 'student-notebook').length, 1,
      'the notebook tab exists once');
    assert.equal(nav.children.at(-1).dataset.stage, 'student-notebook', 'and it is the last tab');

    for (let step = 0; step < 15; step += 1) {
      const rendered = content.children[0]?.innerHTML ?? '';
      const notebooks = (rendered.match(/class="student-notebook u2l1-student-notebook"/g) ?? []).length;
      assert.equal(notebooks, step === 14 ? 1 : 0, `step ${step + 1} renders the notebook ${step === 14 ? 'once' : 'nowhere'}`);
      assert.equal(nav.children.filter((button) => button.attrs['aria-current'] === 'step').length, 1,
        `step ${step + 1} marks exactly one current tab`);
      if (step < 14) nextButton.fire('click');
    }
    assert.equal(heading.textContent, 'دفتر الطالب');
    assert.equal(nextButton.disabled, true, 'the notebook is the end of the lesson');
    assert.equal(progress.textContent, '15 / 15');
    assert.match(center.textContent, /المرحلة 15 من 15 · دفتر الطالب/);

    const keydown = windowListeners.keydown ?? [];
    for (const handler of keydown) handler({ key: 'PageUp', preventDefault() {}, target: { closest: () => null } });
    assert.equal(heading.textContent, 'أختبر نفسي: المسألة الثالثة', 'PageUp returns to the printed page 86');
    assert.equal(pageNumber.textContent, '86');
    for (const handler of keydown) handler({ key: 'PageDown', preventDefault() {}, target: { closest: () => null } });
    assert.equal(heading.textContent, 'دفتر الطالب', 'PageDown returns to the notebook');

    previousButton.fire('click');
    assert.notEqual(heading.textContent, 'دفتر الطالب', 'the previous button leaves the notebook');
    while (previousButton.disabled === false) previousButton.fire('click');
    assert.equal(heading.textContent, 'الكهرباء الساكنة', 'the first stage is still the floor');
  } finally {
    for (const [key, value] of Object.entries(previousGlobals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
