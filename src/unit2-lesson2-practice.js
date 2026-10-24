/* Interactive layer for the textbook tasks of Unit 2 Lesson 2 (pages 87–96).
 *
 * The book text in src/unit2-lesson2-content.js stays verbatim; this module adds
 * a platform activity under each task the book asks the student to perform:
 * completing the p90 table, drawing the p90 graph, writing the four terms of
 * p95 q1, judging p95 q2, choosing the curve of p95 q3, choosing the cause of
 * p96 q3, explaining p96 q4 and solving p96 q5 step by step.
 *
 * Rules shared by every activity and enforced by tests:
 *   - no answer lives in this file or in the markup: they are loaded from
 *     src/unit2-lesson2-answers.js with a dynamic import, only after the student
 *     presses an explicit button;
 *   - an activity never reports success before an attempt, and every result is
 *     cleared as soon as an input changes or the activity is reset;
 *   - each activity has its own state and its own reset button;
 *   - the model solution is locked until «تحقق من الإجابة» has been pressed.
 */
import { formula, tex } from './math.js';
import {
  P90_BLANK_CELLS,
  P90_CHARGE_C,
  P90_RATIO,
  P90_TIME_S,
  P90_GRAPH_POINTS,
  P90_GRAPH_Q_TICKS,
  P90_GRAPH_T_TICKS,
  checkQuantity,
  gradeGraphPoints,
  gradePlaceholderTable,
  matchesTerm,
} from './unit2-lesson2-physics.js';

const PLATFORM_TAG = '<span class="u2l2-tag u2l2-tag-platform">تفاعل من المنصة · المطلوب أعلاه من الكتاب</span>';
const HINT_TAG = '<span class="u2l2-tag u2l2-tag-platform">تلميح من المنصة</span>';
const SOLUTION_TAG = '<span class="u2l2-tag u2l2-tag-platform">حل مشتق من المنصة · ليس نصاً إضافياً من الكتاب</span>';

const actionBar = (extra = '') => `<div class="u2l2-practice-actions">
  <button class="u2l2-button u2l2-button-primary" type="button" data-practice-action="check">تحقق من الإجابة</button>
  <button class="u2l2-button" type="button" data-practice-action="hint">تلميح</button>
  <button class="u2l2-button" type="button" data-practice-action="solution">الحل النموذجي بعد المحاولة</button>
  <button class="u2l2-button u2l2-button-ghost" type="button" data-practice-action="reset">إعادة المحاولة</button>
  ${extra}
</div>
<output class="u2l2-practice-score" data-practice-score aria-live="polite"></output>
<output class="u2l2-practice-feedback" data-practice-feedback role="status" aria-live="polite"></output>
<div class="u2l2-hint-panel" data-practice-hint hidden></div>
<div class="u2l2-solution-panel" data-practice-solution hidden></div>`;

const shell = (id, body, extra) => `<div class="u2l2-practice" data-practice-body="${id}">${PLATFORM_TAG}
  <form data-practice-form novalidate>${body}${actionBar(extra)}</form></div>`;

/* ---------- p90: complete the table ---------- */

function tableBody() {
  const cell = (row, column) => {
    const blank = P90_BLANK_CELLS.findIndex((c) => c.row === row && c.column === column);
    if (blank === -1) {
      const printed = row === 'time' ? P90_TIME_S[column] : P90_RATIO[column];
      return `<td class="u2l2-table-printed">${printed}</td>`;
    }
    return `<td class="u2l2-table-input-cell"><label class="u2l2-visually-hidden" for="p90-${row}-${column}">${
      row === 'time' ? `الزمن عند كمية كهرباء ${P90_CHARGE_C[column]} كولوم` : `النسبة q على t عند ${P90_CHARGE_C[column]} كولوم`
    }</label><input id="p90-${row}-${column}" type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-practice-cell="${blank}" aria-label="${
      row === 'time' ? `الزمن بالثواني عند ${P90_CHARGE_C[column]} C` : `q/t عند ${P90_CHARGE_C[column]} C`
    }" /><output class="u2l2-cell-feedback" data-cell-feedback="${blank}" aria-live="polite"></output></td>`;
  };
  return `<p class="u2l2-practice-lead">أكمل الخلايا الخمس الفارغة كما طلب الكتاب، ثم تحقّق. الخلايا المطبوعة في الكتاب تبقى كما هي.</p>
  <div class="u2l2-table-wrap"><table class="u2l2-data-table u2l2-practice-table"><caption class="u2l2-visually-hidden">جدول ص90: كمية الكهرباء والزمن والنسبة بينهما</caption>
  <thead><tr><th scope="col">كميّة الكهرباء ${tex('q\\,(\\mathrm{c})', 'q in coulombs')}</th>${P90_CHARGE_C.map((q) => `<th scope="col">${q}</th>`).join('')}</tr></thead>
  <tbody>
    <tr><th scope="row">الزّمن ${tex('t\\,(\\mathrm{s})', 't in seconds')}</th>${P90_CHARGE_C.map((_, c) => cell('time', c)).join('')}</tr>
    <tr><th scope="row">${tex('\\dfrac{q}{t}', 'q over t')}</th>${P90_CHARGE_C.map((_, c) => cell('ratio', c)).join('')}</tr>
  </tbody></table></div>
  <p class="u2l2-input-help">تُقبل الأرقام العربية والفاصلة العشرية العربية؛ الحقول الخمسة تُصحَّح كل واحد على حدة.</p>`;
}

/* ---------- p90: draw the graph ---------- */

const GRAPH = Object.freeze({ x0: 80, y0: 300, xPerS: 16, yPerC: 2, width: 720, height: 372 });
const graphX = (t) => GRAPH.x0 + t * GRAPH.xPerS;
const graphY = (q) => GRAPH.y0 - q * GRAPH.yPerC;

function graphSvg() {
  const hits = [];
  for (const t of P90_GRAPH_T_TICKS.filter((value) => value > 0 && value <= 30)) {
    for (const q of P90_GRAPH_Q_TICKS) {
      hits.push(`<g class="u2l2-graph-point" data-graph-point="${t},${q}">
        <circle class="u2l2-graph-hit" cx="${graphX(t)}" cy="${graphY(q)}" r="21" role="button" tabindex="0" aria-pressed="false" aria-label="نقطة عند ${t} ثانية و${q} كولوم"></circle>
        <circle class="u2l2-graph-marker" data-graph-marker="${t},${q}" cx="${graphX(t)}" cy="${graphY(q)}" r="6.5"></circle>
      </g>`);
    }
  }
  return `<svg class="u2l2-graph-svg" viewBox="0 0 ${GRAPH.width} ${GRAPH.height}" role="group" aria-labelledby="p90-graph-title p90-graph-desc">
    <title id="p90-graph-title">لوحة رسم: كمية الكهرباء بدلالة الزمن</title>
    <desc id="p90-graph-desc">شبكة بمحور أفقي للزمن من صفر إلى 35 ثانية ومحور عمودي لكمية الكهرباء من صفر إلى 120 كولوم. اضغط تقاطعاً لوضع نقطة، واضغطه مرة أخرى لإزالتها.</desc>
    ${P90_GRAPH_T_TICKS.map((t) => `<line class="u2l2-graph-grid" x1="${graphX(t)}" y1="${GRAPH.y0}" x2="${graphX(t)}" y2="44"/>`).join('')}
    ${P90_GRAPH_Q_TICKS.map((q) => `<line class="u2l2-graph-grid" x1="${GRAPH.x0}" y1="${graphY(q)}" x2="660" y2="${graphY(q)}"/>`).join('')}
    <line class="u2-axis" x1="${GRAPH.x0}" y1="${GRAPH.y0}" x2="680" y2="${GRAPH.y0}"/>
    <line class="u2-axis" x1="${GRAPH.x0}" y1="${GRAPH.y0}" x2="${GRAPH.x0}" y2="40"/>
    ${P90_GRAPH_T_TICKS.map((t) => `<text class="u2l2-tick" x="${graphX(t)}" y="320" text-anchor="middle" dominant-baseline="hanging" direction="ltr">${t}</text>`).join('')}
    ${P90_GRAPH_Q_TICKS.map((q) => `<text class="u2l2-tick" x="70" y="${graphY(q)}" text-anchor="end" dominant-baseline="central" direction="ltr">${q}</text>`).join('')}
    <text class="u2l2-tick" x="70" y="320" text-anchor="end" dominant-baseline="hanging" direction="ltr">0</text>
    <text class="u2l2-axis-label" x="86" y="26" text-anchor="start" direction="ltr">q (C)</text>
    <text class="u2l2-axis-label" x="684" y="288" text-anchor="end" direction="ltr">t (s)</text>
    ${hits.join('')}
  </svg>`;
}

function graphBody() {
  return `<p class="u2l2-practice-lead">ارسم بنفسك: اضغط تقاطعاً على الشبكة لوضع نقطة، واضغطها مرة أخرى لإزالتها. ضع نقاط الجدول التي حسبتها، ثم تحقّق.</p>
  <figure class="u2l2-graph-figure"><div class="u2l2-graph-scroll">${graphSvg()}</div><figcaption>لوحة الرسم من المنصة: كل تقاطع يمثّل زوجاً (زمن بالثواني، كمية بالكولوم).</figcaption></figure>
  <p class="u2l2-graph-status" role="status" aria-live="polite" data-graph-status>لم تُوضع أي نقطة بعد.</p>`;
}

/* ---------- p95 q1: the four scientific terms ---------- */

const TERM_LABELS = Object.freeze([
  'كمية الشحنة التي تجتاز مقطع الناقل في الثانية الواحدة',
  'شحنة قدرها كولوم واحد تجتاز مقطع الناقل في ثانية واحدة',
  'جهاز يستخدم لقياس شدة التيار ويوصل في الدارة على التسلسل',
  'حركة مستمرة ومباشرة للإلكترونات في دارة مغلقة من القطب السالب إلى الموجب',
]);

function termsBody() {
  return `<p class="u2l2-practice-lead">اكتب المصطلح العلمي المناسب لكل عبارة. تُقبل الصيغة العربية الصحيحة مع الحركات أو دونها، والصيغ المكافئة للمصطلح نفسه.</p>
  <ol class="u2l2-term-list" start="1">${TERM_LABELS.map((label, index) => `<li class="u2l2-term-item">
    <label for="term-${index}"><span class="u2l2-term-label">${label}</span>
      <input id="term-${index}" type="text" autocomplete="off" data-term-input="${index}" aria-label="المصطلح العلمي للعبارة ${index + 1}" placeholder="اكتب المصطلح هنا" />
    </label>
    <output class="u2l2-term-feedback" data-term-feedback="${index}" aria-live="polite"></output>
  </li>`).join('')}</ol>`;
}

/* ---------- p95 q2: true or false ---------- */

const TRUTH_STATEMENTS = Object.freeze([
  'جهة التيار في الدارة المغلقة من القطب السالب إلى الموجب.',
  'يُوصَل مقياس أمبير في الدارة على التسلسل.',
]);

function trueFalseBody() {
  return `<p class="u2l2-practice-lead">ضع إشارة صح أمام العبارة الصحيحة وإشارة خطأ أمام العبارة المغلوط فيها، ثم تحقّق. لكل عبارة نتيجة مستقلة.</p>
  <div class="u2l2-truth-list">${TRUTH_STATEMENTS.map((statement, index) => `<fieldset class="u2l2-truth-row" data-truth-row="${index}">
    <legend>العبارة ${index + 1}</legend>
    <p class="u2l2-truth-statement">${statement}</p>
    <div class="u2l2-truth-options">
      <label><input type="radio" name="u2l2-truth-${index}" value="true" data-truth-input="${index}" /> <span>صح</span></label>
      <label><input type="radio" name="u2l2-truth-${index}" value="false" data-truth-input="${index}" /> <span>خطأ</span></label>
    </div>
    <output class="u2l2-truth-feedback" data-truth-feedback="${index}" aria-live="polite"></output>
  </fieldset>`).join('')}</div>`;
}

/* ---------- p95 q3 and p96 q3: choose one answer ---------- */

/* The four curves of p95 are redrawn from the book's own axes: a decaying
   curve, a wave that changes sign, a two-level step, and a horizontal line. */
const CURVE_SHAPES = Object.freeze({
  a: 'M30 24 C58 24 66 66 118 76',
  b: 'M30 50 C40 16 52 16 64 50 C76 84 88 84 100 50 C106 34 112 34 118 42',
  c: 'M30 80 H52 V28 H74 V80 H96 V28 H118',
  d: 'M30 52 H118',
});

const curveOption = (letter, caption) => `<span class="u2l2-curve-option">
  <svg viewBox="0 0 132 106" class="u2l2-curve-svg" role="img" aria-label="منحنى ${letter}"><title>منحنى ${letter}</title>
    <line class="u2-axis" x1="30" y1="84" x2="122" y2="84"/><line class="u2-axis" x1="30" y1="88" x2="30" y2="10"/>
    <path class="u2l2-curve-path" d="${CURVE_SHAPES[letter]}"/>
    <text class="u2l2-tick" x="128" y="99" text-anchor="end" direction="ltr">t</text>
    <text class="u2l2-tick" x="38" y="18" text-anchor="start" direction="ltr">i</text>
  </svg>
  <span class="u2l2-curve-letter"><bdi dir="ltr">${letter}</bdi> · ${caption}</span>
</span>`;

const CURVE_CAPTIONS = Object.freeze({ a: 'منحنى متناقص', b: 'موجة متغيرة', c: 'مستويان متعاقبان', d: 'خط أفقي ثابت' });

/* The options keep the printed order of p95 (a, b, c, d). */
const CURVE_OPTIONS = Object.freeze([
  ['a', curveOption('a', CURVE_CAPTIONS.a)],
  ['b', curveOption('b', CURVE_CAPTIONS.b)],
  ['c', curveOption('c', CURVE_CAPTIONS.c)],
  ['d', curveOption('d', CURVE_CAPTIONS.d)],
]);

const CAUSE_OPTIONS = Object.freeze([
  ['a', 'المصباح الكهربائي.'],
  ['b', 'المولّد الكهربائي.'],
  ['c', 'القاطعة.'],
  ['d', 'مقياس أمبير.'],
]);

function choiceBody(id, legend, options) {
  return `<fieldset class="u2l2-choice-list"><legend class="u2l2-choice-legend">${legend}</legend>
    ${options.map(([value, label]) => `<label class="u2l2-choice"><input type="radio" name="${id}-choice" value="${value}" data-choice-input /> <span class="u2l2-choice-copy">${label}</span></label>`).join('')}
  </fieldset>`;
}

/* ---------- p96 q4: explanation ---------- */

const EXPLAIN_PROMPTS = Object.freeze([
  'وجود قاصمة منصهرة في معظم الأجهزة الكهربائية.',
  'سبب ناقلية المعادن للتيار وعدم ناقلية العوازل.',
]);

function explainBody() {
  return `<p class="u2l2-practice-lead">اكتب تفسيرك العلمي أولاً، ثم قارنه بمعايير الإجابة النموذجية. هذا السؤال تفسيري، ولا يصحّحه التطبيق آلياً: التقييم بيدك بعد المقارنة، ولا تُعلَن «إجابة صحيحة» تلقائياً.</p>
  ${EXPLAIN_PROMPTS.map((prompt, index) => `<div class="u2l2-explain-item">
    <label for="explain-${index}"><span class="u2l2-explain-label">${index + 1}. ${prompt}</span>
      <textarea id="explain-${index}" rows="3" data-explain-input="${index}" placeholder="اكتب تفسيرك هنا…"></textarea>
    </label>
    <div class="u2l2-explain-compare" data-explain-compare-panel="${index}" hidden></div>
  </div>`).join('')}
  <p class="u2l2-input-help">لن يظهر أي معيار قبل كتابة تفسيرك والضغط على «قارن بإجابة نموذجية».</p>`;
}

/* ---------- p96 q5: multi-step numeric ---------- */

const Q5_PARTS = Object.freeze([
  Object.freeze({ id: 'current', label: 'شدة التيار المارّة في الدارة', units: ['A', 'mA'] }),
  Object.freeze({ id: 'charge', label: 'كمية الكهرباء المارّة خلال 5 min', units: ['C', 'mC'] }),
]);

function numericStepsBody() {
  return `<p class="u2l2-practice-lead">حل المطلوبين بالترتيب: حوّل الزمن أولاً، ثم اكتب شدة التيار، ثم استخدمها لحساب كمية الكهرباء. تُقبل الوحدات المتكافئة.</p>
  <div class="u2l2-steps-inputs">${Q5_PARTS.map((part) => `<fieldset class="u2l2-step-input" data-step-part="${part.id}">
    <legend>${part.label}</legend>
    <div class="u2l2-quantity-row">
      <label><span class="u2l2-visually-hidden">القيمة</span><input type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-step-value="${part.id}" aria-label="${part.label} — القيمة" placeholder="القيمة" /></label>
      <label><span class="u2l2-visually-hidden">الوحدة</span><select data-step-unit="${part.id}" aria-label="${part.label} — الوحدة">${part.units.map((u) => `<option value="${u}">${u}</option>`).join('')}</select></label>
    </div>
    <output class="u2l2-step-feedback" data-step-feedback="${part.id}" aria-live="polite"></output>
  </fieldset>`).join('')}</div>`;
}

export function unit2l2PracticeMarkup(id) {
  if (id === 'p90-table') return shell(id, tableBody());
  if (id === 'p90-graph') return shell(id, graphBody());
  if (id === 'p95-q1') return shell(id, termsBody());
  if (id === 'p95-q2') return shell(id, trueFalseBody());
  if (id === 'p95-q3') return shell(id, choiceBody(id, 'اختر المنحنى المُعبّر عن تغيّرات شدة التيار مع الزمن في التيار المتواصل:', CURVE_OPTIONS));
  if (id === 'p96-q3b') return shell(id, choiceBody(id, 'المُسبّب لحركة الإلكترونات في الدارة هو:', CAUSE_OPTIONS));
  if (id === 'p96-q4') return shell(id, explainBody(), '<button class="u2l2-button u2l2-button-primary" type="button" data-explain-compare>قارن بإجابة نموذجية</button>');
  if (id === 'p96-q5') return shell(id, numericStepsBody());
  return '';
}

/* ------------------------------------------------------------------------- */
/* Mounting and interaction                                                   */
/* ------------------------------------------------------------------------- */

const states = new WeakMap();
const RESULT_IDS = ['p95-q3', 'p96-q3b'];

const stateFor = (root) => {
  if (!states.has(root)) states.set(root, { checked: false, request: 0, answersPromise: null, graph: new Set() });
  return states.get(root);
};
const hide = (element, value) => { if (element) element.hidden = value; };
const feedback = (root, text, kind = '') => {
  const output = root.querySelector('[data-practice-feedback]');
  output.textContent = text;
  if (kind) output.dataset.kind = kind; else delete output.dataset.kind;
};
const score = (root, text) => { root.querySelector('[data-practice-score]').textContent = text; };

/* Both the terms and the graph need the keyboard too, not only the pointer. */
export function mountUnit2l2Practice(scope = document) {
  scope.querySelectorAll('[data-u2l2-practice]').forEach((root) => {
    if (!root.innerHTML.trim()) {
      const markup = unit2l2PracticeMarkup(root.dataset.u2l2Practice);
      if (!markup) return;
      root.innerHTML = markup;
    }
    internalMount(root);
  });
}

function internalMount(root) {
  if (root.dataset.mounted === 'true') return;
  root.dataset.mounted = 'true';
  const id = root.dataset.u2l2Practice;
  const form = root.querySelector('[data-practice-form]');
  form?.addEventListener('submit', (event) => event.preventDefault());
  root.querySelectorAll('[data-practice-action]').forEach((button) => {
    button.addEventListener('click', () => handleAction(root, id, button.dataset.practiceAction, button));
  });
  root.querySelector('[data-explain-compare]')?.addEventListener('click', () => handleExplainCompare(root, id));
  root.querySelectorAll('input, select, textarea').forEach((input) => {
    const clear = () => clearResult(root, id);
    input.addEventListener('input', clear);
    input.addEventListener('change', clear);
  });
  if (id === 'p90-graph') mountGraph(root);
  const hintPanel = root.querySelector('[data-practice-hint]');
  const solutionPanel = root.querySelector('[data-practice-solution]');
  if (hintPanel) hintPanel.hidden = true;
  if (solutionPanel) solutionPanel.hidden = true;
}

/* Every activity's answer module is fetched once per activity, and only when it
   is really needed. */
async function withAnswers(root, callback, kind = 'answers') {
  const state = stateFor(root);
  const request = state.request + 1;
  state.request = request;
  root.setAttribute('aria-busy', 'true');
  try {
    if (!state.answersPromise) {
      state.answersPromise = import('./unit2-lesson2-answers.js').then((module) => module.UNIT2L2_ANSWERS);
    }
    const answers = await state.answersPromise;
    if (request !== state.request) return;
    callback(answers[root.dataset.u2l2Practice], answers);
  } catch {
    if (request === state.request) feedback(root, 'تعذّر تحميل المساعدة الآن. أعد المحاولة.', 'error');
  } finally {
    if (request === state.request) root.removeAttribute('aria-busy');
  }
}

function clearResult(root, id) {
  const state = stateFor(root);
  state.checked = false;
  state.request += 1;
  feedback(root, '');
  score(root, '');
  root.querySelectorAll('[data-cell-feedback], [data-term-feedback], [data-truth-feedback], [data-step-feedback]').forEach((output) => {
    output.textContent = '';
    delete output.dataset.kind;
    output.closest('td, li, fieldset')?.classList.remove('is-correct', 'is-incorrect');
  });
  root.querySelectorAll('.u2l2-choice').forEach((choice) => choice.classList.remove('is-selected'));
  root.querySelectorAll('[data-graph-point]').forEach((point) => point.classList.remove('is-correct', 'is-incorrect'));
  const hintPanel = root.querySelector('[data-practice-hint]');
  const solutionPanel = root.querySelector('[data-practice-solution]');
  hide(hintPanel, true); hide(solutionPanel, true);
  if (solutionPanel) solutionPanel.replaceChildren();
  if (RESULT_IDS.includes(id)) root.querySelectorAll('.u2l2-choice').forEach((choice) => choice.classList.toggle('is-selected', Boolean(choice.querySelector('input:checked'))));
  /* A changed explanation invalidates the comparison that was shown for it. */
  root.querySelectorAll('[data-explain-compare-panel]').forEach((panel) => { panel.hidden = true; panel.replaceChildren(); });
}

function handleAction(root, id, action, button) {
  const state = stateFor(root);
  if (action === 'reset') { resetPractice(root, id); return; }
  if (action === 'hint') {
    withAnswers(root, (spec) => {
      const panel = root.querySelector('[data-practice-hint]');
      panel.innerHTML = `${HINT_TAG}<div class="u2l2-hint-copy">${spec.hint}</div>`;
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
    });
    return;
  }
  if (action === 'solution') {
    if (!state.checked) {
      feedback(root, 'قدّم محاولتك واضغط «تحقق من الإجابة» أولاً؛ الحل النموذجي يُفتح بعد المحاولة فقط.', 'error');
      return;
    }
    withAnswers(root, (spec) => renderSolution(root, spec));
    return;
  }
  if (action !== 'check') return;
  if (id === 'p96-q4') {
    feedback(root, 'سؤال التفسير لا يُصحَّح آلياً: اكتب تفسيرك ثم اضغط «قارن بإجابة نموذجية».', 'neutral');
    return;
  }
  const values = readValues(root, id, state);
  if (!values.complete) {
    feedback(root, values.message || 'أكمل جميع الحقول المطلوبة قبل التحقق.', 'error');
    return;
  }
  withAnswers(root, (spec) => {
    grade(root, id, values, spec);
    state.checked = true;
  });
}

function readValues(root, id, state) {
  if (id === 'p90-table') {
    const cells = [...root.querySelectorAll('[data-practice-cell]')].map((input) => input.value);
    if (cells.some((value) => !value.trim())) return { complete: false, message: 'أكمل الخلايا الخمس الفارغة قبل التحقق.' };
    return { complete: true, cells };
  }
  if (id === 'p90-graph') {
    if (!state.graph.size) return { complete: false, message: 'ضع النقاط على الشبكة أولاً، ثم تحقّق.' };
    return { complete: true, points: [...state.graph].map((key) => key.split(',').map(Number)) };
  }
  if (id === 'p95-q1') {
    const terms = [...root.querySelectorAll('[data-term-input]')].map((input) => input.value);
    if (terms.some((value) => !value.trim())) return { complete: false, message: 'اكتب المصطلح في العبارات الأربع قبل التحقق.' };
    return { complete: true, terms };
  }
  if (id === 'p95-q2') {
    const picks = [0, 1].map((index) => root.querySelector(`input[name="u2l2-truth-${index}"]:checked`)?.value ?? null);
    if (picks.some((value) => value === null)) return { complete: false, message: 'اختر صح أو خطأ لكل عبارة قبل التحقق.' };
    return { complete: true, picks };
  }
  if (id === 'p95-q3' || id === 'p96-q3b') {
    const selected = root.querySelector('.u2l2-choice input:checked')?.value ?? null;
    if (!selected) return { complete: false, message: 'اختر إجابة واحدة قبل التحقق.' };
    return { complete: true, selected };
  }
  if (id === 'p96-q5') {
    const parts = Q5_PARTS.map((part) => ({
      value: root.querySelector(`[data-step-value="${part.id}"]`).value,
      unit: root.querySelector(`[data-step-unit="${part.id}"]`).value,
    }));
    if (parts.some((part) => !part.value.trim())) return { complete: false, message: 'أكمل المطلوبين قبل التحقق.' };
    return { complete: true, parts };
  }
  return { complete: false };
}

function grade(root, id, values, spec) {
  if (id === 'p90-table') return gradeTable(root, values, spec);
  if (id === 'p90-graph') return gradeGraph(root, values, spec);
  if (id === 'p95-q1') return gradeTerms(root, values, spec);
  if (id === 'p95-q2') return gradeTruth(root, values, spec);
  if (id === 'p95-q3' || id === 'p96-q3b') return gradeChoice(root, values, spec);
  if (id === 'p96-q5') return gradeSteps(root, values, spec);
  return undefined;
}

function gradeTable(root, values, spec) {
  const graded = gradePlaceholderTable(values.cells, spec.values);
  let right = 0;
  for (const entry of graded) {
    if (entry.correct) right += 1;
    const output = root.querySelector(`[data-cell-feedback="${entry.index}"]`);
    const cell = root.querySelector(`[data-practice-cell="${entry.index}"]`).closest('td');
    const unparsed = entry.parsed === null;
    output.textContent = entry.correct ? '✓' : unparsed ? 'اكتب عدداً' : 'راجع';
    output.dataset.kind = entry.correct ? 'correct' : 'incorrect';
    cell.classList.toggle('is-correct', entry.correct);
    cell.classList.toggle('is-incorrect', !entry.correct);
  }
  score(root, `النتيجة: ${right} / ${graded.length}`);
  feedback(root, right === graded.length
    ? '✓ الجدول مكتمل، والنسبة ثابتة في كل الأعمدة.'
    : 'صُحّحت الخلايا كل واحدة على حدة. استخدم ثبات النسبة والزمن من الرسم، ثم أعد المحاولة.', right === graded.length ? 'correct' : 'incorrect');
}

function gradeGraph(root, values, spec) {
  const result = gradeGraphPoints(values.points, spec.points ?? P90_GRAPH_POINTS);
  const expectedKeys = new Set((spec.points ?? P90_GRAPH_POINTS).map(([t, q]) => `${t},${q}`));
  for (const point of root.querySelectorAll('[data-graph-point]')) {
    const key = point.dataset.graphPoint;
    const placed = stateFor(root).graph.has(key);
    point.classList.toggle('is-correct', placed && expectedKeys.has(key));
    point.classList.toggle('is-incorrect', placed && !expectedKeys.has(key));
  }
  const wrong = result.extra.length;
  score(root, `النتيجة: ${result.placed} نقطة موضوعة · ${result.total - result.missing.length} منها في مواضعها`);
  if (result.correct) {
    feedback(root, '✓ رسمت النقاط المطلوبة كلها في مواضعها الصحيحة.', 'correct');
  } else if (wrong) {
    feedback(root, `بعض النقاط الموضوعة ليست من قيم الجدول (${wrong}). احذفها بالضغط عليها، ثم أعد المحاولة؛ لن تُكشف بقية النقاط.`, 'incorrect');
  } else {
    feedback(root, `المواضع المصحّحة لا تكفي بعد (${result.placed} من ${result.total}). أضف بقية النقاط من الجدول ثم تحقّق مرة أخرى.`, 'incorrect');
  }
  setGraphStatus(root);
}

function gradeTerms(root, values, spec) {
  let right = 0;
  spec.terms.forEach((term, index) => {
    const correct = matchesTerm(values.terms[index], term.accepted);
    if (correct) right += 1;
    const output = root.querySelector(`[data-term-feedback="${index}"]`);
    const item = output.closest('.u2l2-term-item');
    output.textContent = correct ? '✓ مصطلح صحيح' : 'غير مطابق؛ راجع تعريف المصطلح';
    output.dataset.kind = correct ? 'correct' : 'incorrect';
    item.classList.toggle('is-correct', correct);
    item.classList.toggle('is-incorrect', !correct);
    if (!correct) delete item.dataset.reveal;
  });
  score(root, `النتيجة: ${right} / ${spec.terms.length}`);
  feedback(root, right === spec.terms.length
    ? '✓ المصطلحات الأربعة صحيحة.'
    : 'لكل عبارة نتيجة مستقلة، ولم تُكشف المصطلحات الصحيحة. استخدم التلميح ثم أعد المحاولة.', right === spec.terms.length ? 'correct' : 'incorrect');
}

function gradeTruth(root, values, spec) {
  let right = 0;
  spec.values.forEach((expected, index) => {
    const correct = values.picks[index] === expected;
    if (correct) right += 1;
    const output = root.querySelector(`[data-truth-feedback="${index}"]`);
    const row = output.closest('[data-truth-row]');
    output.textContent = correct ? '✓ الحكم صحيح' : 'الحكم غير مطابق؛ أعد النظر في العبارة';
    output.dataset.kind = correct ? 'correct' : 'incorrect';
    row.classList.toggle('is-correct', correct);
    row.classList.toggle('is-incorrect', !correct);
  });
  score(root, `النتيجة: ${right} / ${spec.values.length}`);
  feedback(root, right === spec.values.length
    ? '✓ الحكمان صحيحان.'
    : 'لكل عبارة نتيجة مستقلة. عُد إلى اصطلاح أمبير وطريقة وصل مقياس الأمبير ثم أعد المحاولة.', right === spec.values.length ? 'correct' : 'incorrect');
}

function gradeChoice(root, values, spec) {
  const correct = values.selected === spec.correct;
  root.querySelectorAll('.u2l2-choice').forEach((choice) => {
    const input = choice.querySelector('input');
    choice.classList.toggle('is-selected', input.checked);
    choice.classList.toggle('is-correct', correct && input.checked);
    choice.classList.toggle('is-incorrect', !correct && input.checked);
  });
  score(root, correct ? 'النتيجة: اختيار صحيح' : 'النتيجة: اختيار غير صحيح');
  feedback(root, correct
    ? '✓ اختيارك صحيح. اطلب الحل النموذجي لمعرفة سبب استبعاد بقية المنحنيات/الخيارات.'
    : 'اختيارك غير صحيح. استخدم التلميح ثم أعد الاختيار؛ لن يُكشف الخيار الصحيح تلقائياً، بل في الحل النموذجي بعد المحاولة.', correct ? 'correct' : 'incorrect');
}

function gradeSteps(root, values, spec) {
  let right = 0;
  spec.parts.forEach((part, index) => {
    const typed = values.parts[index];
    const checked = checkQuantity(typed.value, typed.unit, part.expected, part.unit);
    if (checked.correct) right += 1;
    const output = root.querySelector(`[data-step-feedback="${part.id}"]`);
    const fieldset = output.closest('[data-step-part]');
    output.textContent = checked.correct
      ? '✓ القيمة صحيحة والوحدة متكافئة'
      : checked.reason === 'unparsed' ? 'اكتب قيمة عددية' : 'راجع القيمة أو الوحدة';
    output.dataset.kind = checked.correct ? 'correct' : 'incorrect';
    fieldset.classList.toggle('is-correct', checked.correct);
    fieldset.classList.toggle('is-incorrect', !checked.correct);
  });
  score(root, `النتيجة: ${right} / ${spec.parts.length}`);
  feedback(root, right === spec.parts.length
    ? '✓ المطلوبان صحيحان. تحقّق من تحويل الدقائق إلى ثوانٍ في الحل النموذجي.'
    : 'لكل مطلوب نتيجة مستقلة. تذكّر تحويل الزمن إلى ثوانٍ قبل التعويض، ثم أعد المحاولة.', right === spec.parts.length ? 'correct' : 'incorrect');
}

function renderSolution(root, spec) {
  const panel = root.querySelector('[data-practice-solution]');
  const rows = (spec.solution.steps ?? []).map((row) => ({
    kind: row.tex ? (row.label.startsWith('الزمن') || row.label.startsWith('المطلوب') || row.label.startsWith('النقاط') ? 'substitute' : 'law') : 'check',
    label: row.label,
    html: row.tex ? formula(row.tex, row.label) : `<p>${row.text}</p>`,
  }));
  const table = spec.solution.table
    ? `<div class="u2l2-table-wrap"><table class="u2l2-data-table"><thead><tr><th scope="col">${tex('q\\,(\\mathrm{c})', 'q in coulombs')}</th>${spec.solution.table.charge.map((q) => `<th scope="col">${q}</th>`).join('')}</tr></thead>
      <tbody><tr><th scope="row">${tex('t\\,(\\mathrm{s})', 't in seconds')}</th>${spec.solution.table.time.map((t) => `<td>${t}</td>`).join('')}</tr>
      <tr><th scope="row">${tex('\\dfrac{q}{t}', 'q over t')}</th>${spec.solution.table.ratio.map((r) => `<td>${r}</td>`).join('')}</tr></tbody></table></div>`
    : '';
  panel.innerHTML = `<div class="u2l2-solution-heading">${SOLUTION_TAG}<h4>${spec.solution.title}</h4></div>
    ${spec.solution.steps?.some((row) => row.tex) ? `<div class="u2l2-solution-steps">${rows.map((row) => `<div class="u2l2-solution-step"><span class="u2l2-solution-label">${row.label}</span>${row.html}</div>`).join('')}</div>` : `<ol class="u2l2-solution-plain">${rows.map((row) => `<li><strong>${row.label}:</strong> ${row.html}</li>`).join('')}</ol>`}
    ${table}${spec.solution.note ? `<p class="u2l2-platform-note">${spec.solution.note}</p>` : ''}`;
  panel.hidden = false;
}

function handleExplainCompare(root, id) {
  if (id !== 'p96-q4') return;
  const state = stateFor(root);
  const inputs = [...root.querySelectorAll('[data-explain-input]')];
  if (inputs.some((input) => input.value.trim().length < 12)) {
    feedback(root, 'اكتب جملة تفسيرية واحدة على الأقل لكل فقرة قبل المقارنة.', 'error');
    return;
  }
  withAnswers(root, (spec) => {
    inputs.forEach((input, index) => {
      const panel = root.querySelector(`[data-explain-compare-panel="${index}"]`);
      const criteria = spec.criteria?.[index + 1] ?? [];
      const model = spec.model?.[index + 1] ?? '';
      panel.innerHTML = `<div class="u2l2-explain-model"><h5>معايير الإجابة النموذجية</h5><ul>${criteria.map((item) => `<li>${item}</li>`).join('')}</ul>
        <p><strong>إجابة نموذجية:</strong> ${model}</p></div>`;
      panel.hidden = false;
    });
    state.checked = true;
    feedback(root, 'قارن تفسيرك بالمعايير أعلاه وقيّمه بنفسك؛ التطبيق لا يمنح درجة لسؤال تفسيري.', 'neutral');
    score(root, 'النتيجة: تقييم ذاتي بعد المقارنة');
  });
}

function mountGraph(root) {
  const state = stateFor(root);
  const status = root.querySelector('[data-graph-status]');
  const updateStatus = () => setGraphStatus(root);
  const toggle = (key) => {
    if (state.graph.has(key)) state.graph.delete(key); else state.graph.add(key);
    const group = root.querySelector(`[data-graph-point="${key}"]`);
    group?.classList.toggle('is-placed', state.graph.has(key));
    group?.classList.remove('is-correct', 'is-incorrect');
    const hit = group?.querySelector('.u2l2-graph-hit');
    hit?.setAttribute('aria-pressed', state.graph.has(key) ? 'true' : 'false');
    clearResult(root, 'p90-graph');
    updateStatus();
  };
  root.querySelectorAll('[data-graph-point]').forEach((group) => {
    const key = group.dataset.graphPoint;
    const hit = group.querySelector('.u2l2-graph-hit');
    hit.addEventListener('click', () => toggle(key));
    hit.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggle(key);
    });
  });
  if (status) status.textContent = 'لم تُوضع أي نقطة بعد.';
}

function setGraphStatus(root) {
  const state = stateFor(root);
  const status = root.querySelector('[data-graph-status]');
  if (!status) return;
  const count = state.graph.size;
  status.textContent = count === 0 ? 'لم تُوضع أي نقطة بعد.' : `وضعت ${count} ${count === 1 ? 'نقطة واحدة' : 'نقاط'}. اضغط النقطة نفسها لإزالتها.`;
}

function resetPractice(root, id) {
  const state = stateFor(root);
  state.checked = false;
  state.request += 1;
  state.graph.clear();
  root.querySelector('[data-practice-form]')?.reset();
  root.querySelectorAll('[data-cell-feedback], [data-term-feedback], [data-truth-feedback], [data-step-feedback]').forEach((output) => {
    output.textContent = '';
    delete output.dataset.kind;
  });
  root.querySelectorAll('.is-correct, .is-incorrect, .is-selected, .is-placed').forEach((element) => element.classList.remove('is-correct', 'is-incorrect', 'is-selected', 'is-placed'));
  root.querySelectorAll('.u2l2-graph-hit').forEach((hit) => hit.setAttribute('aria-pressed', 'false'));
  root.querySelectorAll('[data-explain-compare-panel]').forEach((panel) => { panel.hidden = true; panel.replaceChildren(); });
  const hintPanel = root.querySelector('[data-practice-hint]');
  const solutionPanel = root.querySelector('[data-practice-solution]');
  if (hintPanel) { hintPanel.hidden = true; hintPanel.replaceChildren(); }
  if (solutionPanel) { solutionPanel.hidden = true; solutionPanel.replaceChildren(); }
  score(root, '');
  feedback(root, 'أُعيد ضبط هذا النشاط وحده: لا نتائج ولا حلول ظاهرة.', 'neutral');
  if (id === 'p90-graph') setGraphStatus(root);
}

