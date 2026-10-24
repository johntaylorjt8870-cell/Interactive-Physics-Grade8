/* Interactive task layer for Unit 2 Lesson 3 (textbook pp97–106).
 *
 * The book copy in src/unit2-lesson3-content.js stays verbatim. This module adds
 * a clearly tagged platform activity next to every task the book actually asks
 * the student to do:
 *   p98  · observe/compare the two water pictures and the charge-transfer figure
 *   p99  · answer the six «أفكر وأستنتج» questions
 *   p100 · run the dipole experiment (switch, ammeter, two voltmeters) and record
 *   p101 · run the series experiment, record U, U₁, U₂, then conclude
 *   p102 · solve the printed series activity, then run the parallel experiment
 *   p103 · solve the printed parallel activity
 *   p105 · the book's four multiple-choice and four true/false questions
 *   p106 · the book's four fill-in sentences (seven blanks)
 *
 * Rules, shared with the Lesson 2 practice layer and enforced by tests:
 *   - no answer ships in the initial markup: keys, hints and solutions live in
 *     src/unit2-lesson3-answers.js and load lazily on the first explicit action;
 *   - a wrong attempt never reveals the correct answer: it gets a scientific hint;
 *   - the model solution stays locked until at least one checked attempt;
 *   - changing any input re-arms the activity (results, hints, solutions hide);
 *   - lab readings come from a labelled, idealised platform model; the book
 *     prints no numbers for these experiments, and nothing here pretends it does.
 */
import { formula, tex } from './math.js';
import {
  dipoleExperimentReadings,
  matchesBlankAnswer,
  parallelLabReadings,
  readingMatches,
  seriesLabReadings,
} from './unit2-lesson3-physics.js';

const PLATFORM_TAG = '<span class="p3p-tag">نشاط تفاعلي من المنصة · مبني على المطلوب من الكتاب</span>';
const MODEL_TAG = '<span class="p3p-tag p3p-tag-model">نموذج مبسّط · قراءات مثالية للتدريب</span>';
const HINT_TAG = '<span class="p3p-tag">تلميح من المنصة</span>';
const SOLUTION_TAG = '<span class="p3p-tag">حل نموذجي · يُعرض بعد المحاولة فقط</span>';

const esc = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const fmt = (value) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 3 }).format(value);

/* ------------------------------------------------------------------------ */
/* Shared building blocks                                                     */
/* ------------------------------------------------------------------------ */

const actionBar = () => `<div class="p3p-actions">
  <button class="p3-action-button" type="button" data-p3p-action="check">تحقق من الإجابة</button>
  <button class="p3-quiet-button" type="button" data-p3p-action="hint">تلميح</button>
  <button class="p3-quiet-button" type="button" data-p3p-action="solution">الحل النموذجي بعد المحاولة</button>
  <button class="p3-quiet-button p3p-reset" type="button" data-p3p-action="reset">إعادة المحاولة</button>
</div>
<output class="p3p-score" data-p3p-score aria-live="polite"></output>
<output class="p3p-feedback" data-p3p-feedback role="status" aria-live="polite"></output>
<div class="p3p-hint" data-p3p-hint hidden></div>
<div class="p3p-solution" data-p3p-solution hidden></div>`;

const shell = (id, page, title, lead, body, tag = PLATFORM_TAG) => `<section class="p3-interactive p3p-activity" data-u2l3-practice="${id}" aria-label="${esc(title)}">
  <header class="p3-interactive-heading">${tag}<p class="p3p-source-line">موضعها في الكتاب: صفحة <bdi dir="ltr">${page}</bdi></p>
    <h3>${title}</h3><p>${lead}</p></header>
  <form data-p3p-form novalidate>${body}${actionBar()}</form>
</section>`;

const itemShell = (id, prompt, inner) => `<fieldset class="p3p-item" data-p3p-item="${id}">
  <legend class="p3p-prompt">${prompt}</legend>
  ${inner}
  <output class="p3p-item-feedback" data-p3p-item-feedback role="status" aria-live="polite"></output>
</fieldset>`;

const quizOptions = (id, options, letters = null) => `<div class="p3p-options">${options.map(([value, copy], index) => `<label class="p3p-choice"><input type="radio" name="p3p-${id}" value="${value}" /> <span class="p3p-choice-body">${letters ? `<bdi class="p3p-choice-letter" dir="ltr">${letters[index]}</bdi>` : ''}<span class="p3p-choice-copy">${copy}</span></span></label>`).join('')}</div>`;

/* ------------------------------------------------------------------------ */
/* p98 · observing the water pictures and the charge-transfer figure          */
/* ------------------------------------------------------------------------ */

const P98_ITEMS = [
  ['levels-1', '1 · في الشكل (1): سويتا الماء في الأنبوبين…', [
    ['equal', 'متساويتان الارتفاع.'],
    ['different', 'مختلفتان الارتفاع.'],
  ]],
  ['levels-2', '2 · في الشكل (2): سوية الماء في الأنبوب (أ) مقارنة بسويته في الأنبوب (ب)…', [
    ['a-higher', 'أعلى منها في (ب).'],
    ['a-lower', 'أدنى منها في (ب).'],
    ['equal', 'متساويتان.'],
  ]],
  ['flow-2', '3 · إذا فتحتَ الصنبور في الحالة الثانية فإن الماء…', [
    ['high-to-low', 'يجري من الأنبوب ذي السوية الأعلى إلى ذي السوية الأدنى.'],
    ['low-to-high', 'يجري من الأنبوب الأدنى إلى الأعلى.'],
    ['no-flow', 'لا يجري مطلقاً بين الوعاءين.'],
  ]],
  ['charges', '4 · عند وصل الناقلين في الشكل (3) بساق ناقلة فإن الشحنات الكهربائية…', [
    ['transfer', 'تنتقل من أحد الناقلين إلى الآخر.'],
    ['stay', 'تبقى ثابتة في مكانها لا تتحرك.'],
    ['vanish', 'تفنى وتختفي من الناقلين.'],
  ]],
];

function p98Body() {
  return `<p class="p3p-lead-note">أجب عن أسئلة التأمل المطروحة في الصفحة، ثم تحقّق. لكل فقرة نتيجة مستقلة.</p>
  <div class="p3p-items">${P98_ITEMS.map(([id, prompt, options]) => itemShell(id, prompt, quizOptions(id, options))).join('')}</div>`;
}

/* ------------------------------------------------------------------------ */
/* p99 · the six «أفكر وأستنتج» questions                                     */
/* ------------------------------------------------------------------------ */

const P99_ITEMS = [
  ['pump-role', '1 · ما دور المضخة؟', [
    ['drives', 'تحرّك الماء في الدارة المائية وتزوّده بالطاقة ليستمر جريانه.'],
    ['makes-water', 'تصنع ماءً جديداً فتزيد كميته في الأنابيب.'],
    ['stores', 'تخزّن الماء داخلها فتنقص كميته من الأنابيب.'],
  ]],
  ['pump-amount', '2 · هل تقوم المضخة بزيادة كمية الماء أو إنقاصها؟', [
    ['increase', 'تزيد كمية الماء في الدارة.'],
    ['same', 'لا تزيدها ولا تنقصها؛ تحرّك الماء الموجود فقط.'],
    ['decrease', 'تنقص كمية الماء أثناء الضخ.'],
  ]],
  ['water-cause', '3 · ما الذي يجعل الماء ينتقل من الوعاء (أ) إلى الوعاء (ب)؟', [
    ['tube-size', 'كبر حجم الأنابيب الواصلة.'],
    ['level-diff', 'وجود فرق في منسوبي سطحي الماء (فرق في الضغط).'],
    ['colour', 'اختلاف لون الماء بين الوعاءين.'],
  ]],
  ['generator-role', '4 · ما دور المولد في الدارة الكهربائية؟', [
    ['creates', 'يخلق شحنات كهربائية جديدة داخل الأسلاك.'],
    ['energizes', 'يحرّك الشحنات الموجودة في الناقل ويزوّدها بالطاقة لتكمل دورة كاملة.'],
    ['stops', 'يوقف حركة الشحنات عند إغلاق الدارة.'],
  ]],
  ['generator-amount', '5 · هل يقوم المولد بزيادة كمية الشحنات الكهربائية أو إنقاصها؟', [
    ['increases', 'يزيدها باستمرار داخل الناقل.'],
    ['decreases', 'ينقصها لأن الشحنات تُستهلك في المصباح.'],
    ['no-change', 'لا يزيدها ولا ينقصها؛ يزوّدها بالطاقة فقط.'],
  ]],
  ['charge-cause', '6 · ما الذي يجعل الشحنات الكهربائية تتحرك في الدارة الكهربائية؟', [
    ['potential-diff', 'وجود فرق في الكمون بين نقطتين ضمن دارة مغلقة.'],
    ['switch-only', 'القاطعة وحدها دون حاجة إلى فرق كمون.'],
    ['wire-length', 'طول أسلاك التوصيل فقط.'],
  ]],
];

function p99Body() {
  return `<p class="p3p-lead-note">هذه هي أسئلة «أفكر وأستنتج» الستة من الصفحة نفسها بصيغة اختيارات للتدريب. اختر إجابة لكل سؤال ثم تحقّق؛ التفسير الكامل في خلاصة الكتاب ومنطقة المعلم.</p>
  <div class="p3p-items p3p-items-two">${P99_ITEMS.map(([id, prompt, options]) => itemShell(id, prompt, quizOptions(id, options))).join('')}</div>`;
}

/* ------------------------------------------------------------------------ */
/* Live lab circuits (SVG)                                                    */
/*                                                                            */
/* Geometry: voltmeter stubs always land on true circle edge points, switch   */
/* levers pivot on the upper contact, readings sit under each meter face, and */
/* conventional-current arrows appear only while the loop is closed.          */
/* ------------------------------------------------------------------------ */

const meterFace = (cx, cy, letter, readingId, readingDy = 36) => `<circle class="p3-meter" cx="${cx}" cy="${cy}" r="22"/>
  <text class="p3-meter-letter" x="${cx}" y="${cy + 7}" direction="ltr">${letter}</text>
  <text class="p3p-meter-reading" x="${cx}" y="${cy + readingDy}" direction="ltr" text-anchor="middle" data-lab-reading="${readingId}">—</text>`;

const lamp = (cx, cy, part) => `<g class="p3p-lamp" data-lab-lamp="${part}"><circle class="p3-lamp-symbol" cx="${cx}" cy="${cy}" r="22"/><path class="p3-lamp-cross" d="M${cx - 13} ${cy - 13}l26 26m0-26-26 26"/></g>`;

const horizontalBattery = (xLong, xShort, y) => `<path class="p3-battery-long" d="M${xLong} ${y - 24}v48"/><path class="p3-battery-short" d="M${xShort} ${y - 14}v28"/>
  <text class="p3-sign" x="${xLong - 1}" y="${y - 30}" direction="ltr" text-anchor="end">+</text><text class="p3-sign" x="${xShort + 9}" y="${y - 30}" direction="ltr" text-anchor="start">−</text>`;

const horizontalSwitch = (xContact, y) => `<g class="p3p-switch" data-lab-switch-visual>
  <circle class="p3-contact" cx="${xContact}" cy="${y}" r="5"/><circle class="p3-contact" cx="${xContact}" cy="${y + 44}" r="5"/>
  <path class="p3-switch-lever" data-lab-lever d="M${xContact} ${y}l-22 30"/></g>`;

/* Arrowheads: tip at (x, y); direction of travel decides the base side. */
const ARROW_HEAD = Object.freeze({
  left: (x, y) => `m${x} ${y} 14 -7 v14 z`,
  right: (x, y) => `m${x} ${y} -14 -7 v14 z`,
  up: (x, y) => `m${x} ${y} -7 14 h14 z`,
  down: (x, y) => `m${x} ${y} -7 -14 h14 z`,
});
const flowArrow = (line, head) => `<path class="p3-flow-arrow" d="${line}"/><path class="p3-flow-head" d="${head}"/>`;

/* --- p100: dipole experiment --------------------------------------------- */

const P100_OBSERVATIONS = [
  ['ammeter-open', '1 · عند فتح القاطعة، تصبح قراءة الأمبيرمتر…', [
    ['zero', 'صفراً؛ لأن مسار الدارة انقطع.'],
    ['stays', 'كما كانت قبل الفتح.'],
    ['increases', 'أكبر؛ لأن التيار يتراكم عند القاطعة.'],
  ]],
  ['voltmeter-lamp-open', '2 · عند فتح القاطعة، قراءة الفولتميتر الموصول على طرفي المصباح…', [
    ['zero', 'تنعدم (تشير إلى الصفر).'],
    ['stays', 'تبقى مساوية لقراءة فولتميتر المولد.'],
  ]],
  ['voltmeter-source-open', '3 · عند فتح القاطعة، قراءة الفولتميتر الموصول على طرفي المولد…', [
    ['stays', 'لا تنعدم؛ يبقى للمولد فرق كمون بين قطبيه.'],
    ['zero', 'تنعدم تماماً كالأمبيرمتر.'],
  ]],
  ['lamp-kind', '4 · المصباح في هذه الدارة ثنائي قطب…', [
    ['passive', 'غير فعّال؛ لا يسبب مرور التيار في دارة مغلقة بنفسه.'],
    ['active', 'فعّال؛ يسبب مرور التيار في دارة مغلقة بنفسه.'],
  ]],
  ['generator-kind', '5 · المولد في هذه الدارة ثنائي قطب…', [
    ['active', 'فعّال؛ يسبب مرور التيار في دارة مغلقة.'],
    ['passive', 'غير فعّال؛ يستقبل التيار فقط.'],
  ]],
];

function p100Svg() {
  return `<svg class="p3-svg p3p-lab-svg" viewBox="0 0 720 500" role="img" aria-labelledby="p3p-lab100-title p3p-lab100-desc">
  <title id="p3p-lab100-title">دارة تجربة ص100: مولد ومصباح وقاطعة وأمبيرمتر وفولتميتران</title>
  <desc id="p3p-lab100-desc" data-lab-desc>القاطعة مفتوحة؛ لم تُؤخذ قراءة بعد.</desc>
  <rect class="p3-circuit-back" x="16" y="14" width="688" height="472" rx="24"/>
  <path class="p3-wire" d="M180 120 H343"/><path class="p3-wire" d="M387 120 H600"/>
  <path class="p3-wire" d="M600 120 V252"/><path class="p3-wire" d="M600 296 V340"/>
  <path class="p3-wire" d="M600 340 H380"/><path class="p3-wire" d="M362 340 H180"/>
  <path class="p3-wire" d="M180 120 V206"/><path class="p3-wire" d="M180 250 V340"/>
  ${meterFace(365, 120, 'A', 'current')}
  ${lamp(180, 228, 'main')}
  <path class="p3-wire" d="M180 206 H134 V228"/><path class="p3-wire" d="M90 228 V250 H180"/>
  ${meterFace(112, 228, 'V', 'lamp')}
  ${horizontalBattery(362, 380, 340)}
  ${horizontalSwitch(600, 252)}
  <path class="p3-wire" d="M340 340 V446 H349"/><path class="p3-wire" d="M393 446 H402 V340"/>
  ${meterFace(371, 446, 'V', 'source')}
  <text class="p3p-meter-label" x="365" y="80" direction="rtl" text-anchor="middle">أمبيرمتر</text>
  <text class="p3p-meter-label" x="112" y="292" direction="rtl" text-anchor="middle">عبر المصباح</text>
  <text class="p3p-meter-label" x="305" y="450" direction="rtl" text-anchor="end">عبر المولد</text>
  <text class="p3-schematic-label" x="624" y="278" direction="rtl" text-anchor="start">قاطعة</text>
  <text class="p3-schematic-label" x="212" y="232" direction="rtl" text-anchor="start">مصباح</text>
  <text class="p3-schematic-label" x="424" y="366" direction="rtl" text-anchor="start">المولد</text>
  <g class="p3p-flow" data-lab-flow hidden>
    ${flowArrow('M250 352 H208', ARROW_HEAD.left(208, 352))}
    ${flowArrow('M168 300 V258', ARROW_HEAD.up(168, 258))}
    ${flowArrow('M430 108 H480', ARROW_HEAD.right(480, 108))}
    ${flowArrow('M612 200 V244', ARROW_HEAD.down(612, 244))}
  </g>
</svg>`;
}

function labControls(sourceOptions, statusText, note) {
  return `<div class="p3p-lab-controls">
    <label class="p3p-field">فرق كمون المولد في النموذج
      <select data-lab-source class="p3p-input">${sourceOptions.map(([value, selected]) => `<option value="${value}"${selected ? ' selected' : ''}>${value} V</option>`).join('')}</select>
    </label>
    <div class="p3p-switch-row" role="group" aria-label="حالة القاطعة">
      <button class="p3-action-button" type="button" data-lab-toggle="close" aria-pressed="false">أغلق القاطعة</button>
      <button class="p3-quiet-button" type="button" data-lab-toggle="open" aria-pressed="true">افتح القاطعة</button>
    </div>
    <output class="p3-live-output" data-lab-status role="status" aria-live="polite">${statusText}</output>
    <p class="p3p-lab-note">${note}</p>
  </div>`;
}

function p100Body() {
  return `<div class="p3p-lab">
  <div class="p3p-lab-stage">
    <figure class="p3p-lab-figure">${p100Svg()}<figcaption>الدارة كما في شكل تجربة ص100: أمبيرمتر على التسلسل، وفولتميتر على التفرع عبر المصباح، وآخر عبر المولد. ${MODEL_TAG}</figcaption></figure>
    ${labControls([['3', false], ['4.5', true], ['6', false]],
      'القاطعة مفتوحة؛ أغلقها ثم افتحها ولاحظ دلالات الأجهزة الثلاثة.',
      'المصباح مثالي بمقاومة 6 Ω والمقاييس مثالية في هذا النموذج؛ القيم للتدريب على الملاحظة والتسجيل، والكتاب لا يطبع قراءات عددية لهذه التجربة.')}
  </div>
  <h4 class="p3p-subhead">سجّل ملاحظاتك — الخطوة 4 («ماذا ألاحظ؟»)</h4>
  <div class="p3p-items">${P100_OBSERVATIONS.map(([id, prompt, options]) => itemShell(id, prompt, quizOptions(id, options))).join('')}</div>
</div>`;
}

/* --- p101: series experiment ---------------------------------------------- */

function p101Svg() {
  return `<svg class="p3-svg p3p-lab-svg" viewBox="0 0 760 512" role="img" aria-labelledby="p3p-lab101-title p3p-lab101-desc">
  <title id="p3p-lab101-title">دارة متسلسلة: مولد ومصباحان وثلاثة مقاييس فولت U وU₁ وU₂</title>
  <desc id="p3p-lab101-desc" data-lab-desc>القاطعة مفتوحة؛ لم تُؤخذ قراءة بعد.</desc>
  <rect class="p3-circuit-back" x="16" y="12" width="728" height="488" rx="24"/>
  <path class="p3-wire" d="M130 120 H218"/><path class="p3-wire" d="M262 120 H458"/><path class="p3-wire" d="M502 120 H630"/>
  <path class="p3-wire" d="M630 120 V258"/><path class="p3-wire" d="M630 302 V380"/>
  <path class="p3-wire" d="M630 380 H370"/><path class="p3-wire" d="M352 380 H130"/>
  <path class="p3-wire" d="M130 380 V120"/>
  ${lamp(240, 120, 'lamp-2')}
  ${lamp(480, 120, 'lamp-1')}
  <path class="p3-wire" d="M218 120 V64"/><path class="p3-wire" d="M262 120 V64"/>
  ${meterFace(240, 64, 'V₂', 'u2', 100)}
  <path class="p3-wire" d="M458 120 V64"/><path class="p3-wire" d="M502 120 V64"/>
  ${meterFace(480, 64, 'V₁', 'u1', 100)}
  ${horizontalBattery(352, 370, 380)}
  ${horizontalSwitch(630, 258)}
  <path class="p3-wire" d="M330 380 V446 H339"/><path class="p3-wire" d="M383 446 H392 V380"/>
  ${meterFace(361, 446, 'V', 'u', 36)}
  <text class="p3-voltage-label" x="240" y="26" direction="ltr">U₂</text>
  <text class="p3-voltage-label" x="480" y="26" direction="ltr">U₁</text>
  <text class="p3-voltage-label" x="413" y="450" direction="ltr">U</text>
  <text class="p3-schematic-label" x="480" y="168" direction="rtl" text-anchor="middle">المصباح الأول</text>
  <text class="p3-schematic-label" x="240" y="168" direction="rtl" text-anchor="middle">المصباح الثاني</text>
  <text class="p3-schematic-label" x="424" y="406" direction="rtl" text-anchor="start">المولد</text>
  <text class="p3-schematic-label" x="654" y="284" direction="rtl" text-anchor="start">قاطعة</text>
  <g class="p3p-flow" data-lab-flow hidden>
    ${flowArrow('M300 392 H256', ARROW_HEAD.left(256, 392))}
    ${flowArrow('M118 340 V296', ARROW_HEAD.up(118, 296))}
    ${flowArrow('M300 108 H352', ARROW_HEAD.right(352, 108))}
    ${flowArrow('M642 200 V248', ARROW_HEAD.down(642, 248))}
  </g>
</svg>`;
}

/* --- p102: parallel experiment -------------------------------------------- */

function p102Svg() {
  return `<svg class="p3-svg p3p-lab-svg" viewBox="0 0 760 512" role="img" aria-labelledby="p3p-lab102-title p3p-lab102-desc">
  <title id="p3p-lab102-title">دارة متفرعة: مولد ومصباحان على فرعين متوازيين وثلاثة مقاييس فولت</title>
  <desc id="p3p-lab102-desc" data-lab-desc>القاطعة مفتوحة؛ لم تُؤخذ قراءة بعد.</desc>
  <rect class="p3-circuit-back" x="16" y="12" width="728" height="488" rx="24"/>
  <path class="p3-wire" d="M140 110 H620"/><path class="p3-wire" d="M620 110 V390"/>
  <path class="p3-wire" d="M140 110 V258"/><path class="p3-wire" d="M140 302 V390"/>
  <path class="p3-wire" d="M620 390 H370"/><path class="p3-wire" d="M352 390 H140"/>
  <path class="p3-wire" d="M470 110 V178"/><path class="p3-wire" d="M470 222 V390"/>
  <path class="p3-wire" d="M280 110 V178"/><path class="p3-wire" d="M280 222 V390"/>
  ${lamp(470, 200, 'lamp-1')}
  ${lamp(280, 200, 'lamp-2')}
  <path class="p3-wire" d="M470 178 H538 V200"/><path class="p3-wire" d="M582 200 V222 H470"/>
  ${meterFace(560, 200, 'V₁', 'u1')}
  <path class="p3-wire" d="M280 178 H212 V200"/><path class="p3-wire" d="M168 200 V222 H280"/>
  ${meterFace(190, 200, 'V₂', 'u2')}
  ${horizontalBattery(352, 370, 390)}
  ${horizontalSwitch(140, 258)}
  <path class="p3-wire" d="M330 390 V446 H339"/><path class="p3-wire" d="M383 446 H392 V390"/>
  ${meterFace(361, 446, 'V', 'u', 36)}
  <text class="p3-voltage-label" x="560" y="156" direction="ltr">U₁</text>
  <text class="p3-voltage-label" x="190" y="156" direction="ltr">U₂</text>
  <text class="p3-voltage-label" x="413" y="450" direction="ltr">U</text>
  <text class="p3-schematic-label" x="470" y="262" direction="rtl" text-anchor="middle">المصباح الأول · الفرع الأول</text>
  <text class="p3-schematic-label" x="280" y="262" direction="rtl" text-anchor="middle">المصباح الثاني · الفرع الثاني</text>
  <text class="p3-schematic-label" x="424" y="416" direction="rtl" text-anchor="start">المولد</text>
  <text class="p3-schematic-label" x="126" y="284" direction="rtl" text-anchor="end">قاطعة</text>
  <g class="p3p-flow" data-lab-flow hidden>
    ${flowArrow('M300 98 H352', ARROW_HEAD.right(352, 98))}
    ${flowArrow('M632 250 V294', ARROW_HEAD.down(632, 294))}
    ${flowArrow('M300 402 H256', ARROW_HEAD.left(256, 402))}
  </g>
</svg>`;
}

/* --- relation choice + record fields --------------------------------------- */

const RELATION_OPTIONS = {
  series: [
    ['sum', 'U=U_{1}+U_{2}', 'U يساوي مجموع فرقي المصباحين', 'يفرق المولد مجموع الفرقين الجزئيين.'],
    ['equal', 'U=U_{1}=U_{2}', 'U يساوي فرق كل فرع', 'تتساوى القراءات الثلاث دائماً.'],
    ['diff', 'U=U_{1}-U_{2}', 'U يساوي فرق الفرقين', 'فرق المولد هو الفرق بين الفرقين.'],
  ],
  parallel: [
    ['equal', 'U=U_{1}=U_{2}', 'U يساوي فرق كل فرع', 'تتساوى القراءات في الفروع كلها.'],
    ['sum', 'U=U_{1}+U_{2}', 'U يساوي مجموع فرقي المصباحين', 'يفرق المولد مجموع الفرعين.'],
    ['diff', 'U=U_{1}-U_{2}', 'U يساوي فرق الفرقين', 'فرق المولد هو الفرق بين الفرعين.'],
  ],
};

const recordInput = (id, label) => `<label class="p3p-record-field"><span>${label} <bdi dir="ltr">(V)</bdi></span><input type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-lab-record="${id}" aria-label="سجّل ${label} بالفولت" placeholder="اقرأ المقياس" /><output class="p3p-item-feedback" data-p3p-item-feedback role="status" aria-live="polite"></output></label>`;

function circuitChecklist(kind) {
  return `<div class="p3p-items">${itemShell('relation', 'ما العلاقة التي تربط قراءة فولتميتر المولد بقراءتي المصباحين؟ قارن القراءات التي سجّلتها بنفسك.',
    `<div class="p3p-options">${RELATION_OPTIONS[kind].map(([value, texSource, ariaLabel, copy]) => `<label class="p3p-choice p3p-choice-math"><input type="radio" name="p3p-relation" value="${value}" aria-label="${ariaLabel}" /> <span class="p3p-choice-body"><span class="p3p-choice-formula" dir="ltr">${tex(texSource, ariaLabel)}</span><span class="p3p-choice-copy">${copy}</span></span></label>`).join('')}</div>`)}</div>`;
}

function recordSection() {
  return `<h4 class="p3p-subhead">4 · سجّل دلالة مؤشّر مقاييس فولت في الدارة (خطوة الكتاب 4)</h4>
  <div class="p3p-record-row">
    ${recordInput('u', 'فرق الكمون بين قطبي المولد U')}
    ${recordInput('u1', 'فرق الكمون بين طرفي المصباح الأول U₁')}
    ${recordInput('u2', 'فرق الكمون بين طرفي المصباح الثاني U₂')}
  </div>
  <p class="p3p-live-check" data-lab-relation role="status" aria-live="polite"></p>`;
}

function p101Body() {
  return `<div class="p3p-lab">
  <div class="p3p-lab-stage">
    <figure class="p3p-lab-figure">${p101Svg()}<figcaption>دارة الكتاب ص101: مصباحان على التسلسل، وفولتميتر على طرفي المولد وفولتميتر على طرفي كل مصباح. ${MODEL_TAG}</figcaption></figure>
    ${labControls([['4', false], ['6', true], ['8', false], ['10', false], ['12', false]],
      'القاطعة مفتوحة؛ أغلقها واقرأ المقاييس الثلاثة ثم سجّل.',
      'المصباحان متماثلان في هذا النموذج، فيتقاسمان فرق الكمون بالتساوي، والمقاييس مثالية بلا أخطاء قراءة. سجّل ما تقرؤه بنفسك كما تطلب الخطوة 4.')}
  </div>
  ${recordSection()}
  ${circuitChecklist('series')}
</div>`;
}

function p102LabBody() {
  return `<div class="p3p-lab">
  <div class="p3p-lab-stage">
    <figure class="p3p-lab-figure">${p102Svg()}<figcaption>دارة الكتاب ص102: مصباحان على التفرع، وفولتميتر على طرفي المولد وآخر على طرفي كل مصباح. ${MODEL_TAG}</figcaption></figure>
    ${labControls([['3', false], ['4.5', false], ['6', true], ['9', false]],
      'القاطعة مفتوحة؛ أغلقها واقرأ المقاييس الثلاثة ثم سجّل.',
      'فرعا المصباحين موصولان بين العقدتين نفسيهما، والمقاييس مثالية. سجّل ما تقرؤه بنفسك كما تطلب الخطوة 4.')}
  </div>
  ${recordSection()}
  ${circuitChecklist('parallel')}
</div>`;
}

/* --- p102/p103 printed activities (numeric) -------------------------------- */

function numericItem(id, prompt, ariaLabel) {
  return itemShell(id, prompt, `<div class="p3p-numeric-row"><input type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-p3p-numeric="${id}" aria-label="${ariaLabel}" placeholder="القيمة" /><bdi dir="ltr" class="p3p-unit">V</bdi></div>`);
}

function p102ActivityBody() {
  return `<p class="p3p-lead-note">حُلّ نشاط الكتاب بيدك أولاً، ثم أدخل ناتجك بالفولت وتحقّق. المعطيات من الكتاب: ${tex('U=12\\,\\mathrm{V}', 'فرق المولد 12 فولت')} و${tex('U_{2}=5\\,\\mathrm{V}', 'فرق كمون المصباح الثاني 5 فولت')}.</p>
  <div class="p3p-items">${numericItem('u1', `فرق الكمون بين طرفي المصباح الأول ${tex('U_{1}', 'U واحد')} =`, 'فرق الكمون بين طرفي المصباح الأول بالفولت')}</div>`;
}

function p103ActivityBody() {
  return `<p class="p3p-lead-note">النشاط من الكتاب: مولد ${tex('U=6\\,\\mathrm{V}', 'فرق المولد 6 فولت')} ومصباحان موصولان على التفرع معه. ما فرق الكمون في كل من الفرعين؟ أدخل القيمتين ثم تحقّق.</p>
  <div class="p3p-items p3p-items-two">
    ${numericItem('branch-1', `فرق الكمون بين طرفي المصباح الأول ${tex('U_{1}', 'U واحد')} =`, 'فرق الكمون على الفرع الأول بالفولت')}
    ${numericItem('branch-2', `فرق الكمون بين طرفي المصباح الثاني ${tex('U_{2}', 'U اثنان')} =`, 'فرق الكمون على الفرع الثاني بالفولت')}
  </div>`;
}

/* ------------------------------------------------------------------------ */
/* p105 · the book's self-check, made truly answerable                        */
/* ------------------------------------------------------------------------ */

const P105_MCQ = [
  ['mcq-1', `1 · تغذّى منشأة صناعية بكمون مقداره (${tex('25\\,\\mathrm{kV}', '25 كيلو فولت')}) فتكون قيمة هذا الكمون بالفولت:`, [
    ['a', '<bdi dir="ltr">0.025</bdi>'], ['b', '<bdi dir="ltr">2500</bdi>'], ['c', '<bdi dir="ltr">25000</bdi>'], ['d', '<bdi dir="ltr">25</bdi>'],
  ]],
  ['mcq-2', '2 · مقياس الفولت المستخدم في دارة يقيس:', [
    ['a', 'القوة المحركة الكهربائية للمولد.'],
    ['b', 'فرق الكمون بين طرفي المصباح.'],
    ['c', 'فرق الكمون بين طرفي المولد.'],
    ['d', 'كل الإجابات السابقة صحيحة.'],
  ]],
  ['mcq-3', `3 · إذا كان فرق الكمون بين طرفي جزء من دارة ${tex('2.4\\,\\mathrm{V}', '2.4 فولت')} فتكون قيمته بالميلي فولت:`, [
    ['a', '<bdi dir="ltr">0.24</bdi>'], ['b', '<bdi dir="ltr">2400</bdi>'], ['c', '<bdi dir="ltr">24000</bdi>'], ['d', '<bdi dir="ltr">12000</bdi>'],
  ]],
  ['mcq-4', '4 · يقاس الكمون الكهربائي بوحدة تسمى:', [
    ['a', 'الكولوم.'], ['b', 'الفولت.'], ['c', 'الأوم.'], ['d', 'الأمبير.'],
  ]],
];

const P105_TF = [
  ['tf-1', '1 · عند فتح القاطعة في دارة كهربائية يشير مقياس الفولت بين قطبي المولد إلى التأشيرة صفر.'],
  ['tf-2', '2 · الكمون الكهربائي لناقل معتدل يساوي الصفر.'],
  ['tf-3', '3 · لقياس فرق الكمون بين طرفي مصباح في دارة متفرعة يوصل مقياس الفولت على التسلسل مع المصباح.'],
  ['tf-4', `4 · الميلي فولت يساوي ${tex('0.0001\\,\\mathrm{V}', '0.0001 فولت')}.`],
];

function p105McqBody() {
  return `<p class="p3p-lead-note">أسئلة «اختر الإجابة الصحيحة» الأربعة من ص105 نفسها، بخيارات قابلة للنقر. اختر ثم تحقّق؛ عند الخطأ تحصل على تلميح علمي دون كشف الإجابة الصحيحة.</p>
  <div class="p3p-items">${P105_MCQ.map(([id, prompt, options]) => itemShell(id, prompt, quizOptions(id, options, ['a', 'b', 'c', 'd']))).join('')}</div>`;
}

function p105TfBody() {
  return `<p class="p3p-lead-note">عبارات «صح / غلط» الأربع من ص105 نفسها. اختر حكمك لكل عبارة ثم تحقّق.</p>
  <div class="p3p-items">${P105_TF.map(([id, prompt]) => itemShell(id, prompt, quizOptions(id, [['true', 'صح'], ['false', 'غلط']]))).join('')}</div>`;
}

/* ------------------------------------------------------------------------ */
/* p106 · fill the blanks                                                     */
/* ------------------------------------------------------------------------ */

const P106_SENTENCES = [
  ['s1', ['يمر تيار كهربائي في دارة مغلقة بتأثير', 'blank-1a', 'بين قطبي', 'blank-1b', '.']],
  ['s2', ['يسري التيار الكهربائي في الدارة الكهربائية من الكمون', 'blank-2a', 'إلى الكمون', 'blank-2b', '.']],
  ['s3', ['يوصل مقياس الفولت في الدارات الكهربائية على', 'blank-3', '.']],
  ['s4', ['يكون فرق الكمون بين قطبي المولد في الدارة المغلقة التسلسلية يساوي', 'blank-4a', 'فروق الكمون', 'blank-4b', 'في تلك الدارة.']],
];

function p106Body() {
  let index = 0;
  const sentence = ([sid, parts]) => {
    const html = parts.map((part) => {
      if (!part.startsWith('blank-')) return `<span class="p3p-sentence-text">${part}</span>`;
      index += 1;
      return `<span class="p3p-blank-wrap"><input type="text" autocomplete="off" class="p3p-blank" data-p3p-blank="${part}" aria-label="الفراغ ${index} من ${P106_SENTENCES.length + 2}" placeholder="…" /><output class="p3p-item-feedback p3p-blank-feedback" data-p3p-item-feedback role="status" aria-live="polite"></output></span>`;
    }).join(' ');
    return `<fieldset class="p3p-item p3p-sentence" data-p3p-sentence="${sid}">
      <legend class="p3p-visually-hidden">الجملة ${Number(sid.slice(1))} من السؤال الثالث</legend>
      <p class="p3p-sentence-line">${html}</p>
    </fieldset>`;
  };
  return `<p class="p3p-lead-note">املأ الفراغات السبعة بما يناسبها من الكلمات، كما في السؤال الثالث من ص106. تُقبل الصيغ العربية المكافئة للمصطلح الصحيح.</p>
  <div class="p3p-items">${P106_SENTENCES.map(sentence).join('')}</div>
  <p class="p3p-input-help">الحركات وصور الهمزة والتاء المربوطة لا تؤثر في التصحيح؛ المعنى العلمي هو المعتمد.</p>`;
}

/* ------------------------------------------------------------------------ */
/* Public markup API                                                          */
/* ------------------------------------------------------------------------ */

const BUILDERS = Object.freeze({
  'p98-observe': () => shell('p98-observe', 98, 'أتأمّل وأجيب عن أسئلة الصفحة 98', 'قارن المنسوبين في الصورتين، وتوقّع ما يحدث عند فتح الصنبور، ثم انقل الفكرة إلى انتقال الشحنات.', p98Body()),
  'p99-think': () => shell('p99-think', 99, 'أفكر وأستنتج: أسئلة الصفحة 99 الستة', 'أجب عن الأسئلة الستة بالاعتماد على تشبيه الدارة المائية بالدارة الكهربائية، ثم تحقّق.', p99Body()),
  'p100-lab': () => shell('p100-lab', 100, 'مختبر الثنائي الفعّال وغير الفعّال', 'نفّذ تجربة ص100 رقمياً: أغلق القاطعة وافتحها، لاحظ دلالات الأمبيرمتر والفولتميترين، ثم سجّل ملاحظاتك.', p100Body(), MODEL_TAG),
  'p101-series-lab': () => shell('p101-series-lab', 101, 'مختبر فرق الكمون في دارة متسلسلة', 'نفّذ تجربة ص101 رقمياً: أغلق القاطعة، اقرأ المقاييس الثلاثة، سجّل القراءات في الحقول، ثم استنتج العلاقة.', p101Body(), MODEL_TAG),
  'p102-series-activity': () => shell('p102-series-activity', 102, 'حلّ نشاط التسلسل (12 V و5 V)', 'أوجد فرق الكمون بين طرفي المصباح الأول بنفسك قبل فتح خطوات الحل.', p102ActivityBody()),
  'p102-parallel-lab': () => shell('p102-parallel-lab', 102, 'مختبر فرق الكمون في دارة متفرعة', 'نفّذ تجربة التفرع رقمياً: أغلق القاطعة، اقرأ المقاييس، سجّل القراءات، ثم استنتج العلاقة.', p102LabBody(), MODEL_TAG),
  'p103-parallel-activity': () => shell('p103-parallel-activity', 103, 'حلّ نشاط التفرع (6 V)', 'مصباحان على التفرع ومولد 6 V: ما فرق الكمون في كل فرع؟ أدخل القيمتين وتحقّق.', p103ActivityBody()),
  'p105-mcq': () => shell('p105-mcq', 105, 'أختبر نفسي · السؤال الأول (اختيار من متعدد)', 'أسئلة الكتاب الأربعة كما وردت، بتفاعل كامل وتلميحات لا تكشف الإجابة.', p105McqBody()),
  'p105-true-false': () => shell('p105-true-false', 105, 'أختبر نفسي · السؤال الثاني (صح / غلط)', 'عبارات الكتاب الأربع كما وردت، بتفاعل كامل.', p105TfBody()),
  'p106-blanks': () => shell('p106-blanks', 106, 'أختبر نفسي · السؤال الثالث (املأ الفراغات)', 'جمل الكتاب الأربع بفراغاتها السبعة، بتصحيح يقبل الصياغات المكافئة.', p106Body()),
});

export const UNIT2L3_PRACTICE_IDS = Object.freeze(Object.keys(BUILDERS));

export function unit2l3PracticeMarkup(id) {
  const build = BUILDERS[id];
  if (!build) throw new RangeError(`Unknown Unit 2 Lesson 3 activity: ${id}`);
  return build();
}

/* ------------------------------------------------------------------------ */
/* Mounting: state, grading, hints, solutions, labs                           */
/* ------------------------------------------------------------------------ */

const states = new WeakMap();
const initialLab = () => ({ closed: false, seenClosed: false, seenOpen: false });
const stateFor = (root) => {
  if (!states.has(root)) states.set(root, { attempted: false, request: 0, answers: null, lastWrongHints: [], lab: initialLab() });
  return states.get(root);
};

const out = (root, selector) => root.querySelector(selector);
const setFeedback = (root, text, kind = '') => {
  const node = out(root, '[data-p3p-feedback]');
  if (!node) return;
  node.textContent = text;
  if (kind) node.dataset.kind = kind; else node.removeAttribute('data-kind');
};
const setScore = (root, text) => {
  const node = out(root, '[data-p3p-score]');
  if (node) node.textContent = text;
};
const itemFeedback = (root, id, text, ok) => {
  const host = root.querySelector(`[data-p3p-item="${id}"]`) ?? root.querySelector(`[data-lab-record="${id}"]`)?.closest('.p3p-record-field') ?? null;
  if (!host) return;
  const outputNode = host.querySelector('[data-p3p-item-feedback]');
  if (outputNode) {
    outputNode.textContent = text;
    if (text) outputNode.dataset.kind = ok ? 'correct' : 'incorrect';
    else outputNode.removeAttribute('data-kind');
  }
  host.classList.toggle('is-correct', Boolean(ok) && Boolean(text));
  host.classList.toggle('is-incorrect', !ok && Boolean(text));
};

async function withAnswers(root, apply) {
  const state = stateFor(root);
  const request = state.request + 1;
  state.request = request;
  root.setAttribute('aria-busy', 'true');
  try {
    if (!state.answers) state.answers = import('./unit2-lesson3-answers.js').then((module) => module.UNIT2L3_ANSWERS);
    const answers = await state.answers;
    if (request !== state.request) return;
    apply(answers[root.dataset.u2l3Practice]);
  } catch {
    if (request === state.request) setFeedback(root, 'تعذّر تحميل مفاتيح الإجابة الآن؛ أعد المحاولة.', 'error');
  } finally {
    if (request === state.request) root.removeAttribute('aria-busy');
  }
}

function clearResult(root) {
  const state = stateFor(root);
  state.attempted = false;
  state.request += 1;
  setFeedback(root, '');
  setScore(root, '');
  for (const node of root.querySelectorAll('[data-p3p-item-feedback]')) {
    node.textContent = '';
    node.removeAttribute('data-kind');
  }
  for (const item of root.querySelectorAll('.p3p-item, .p3p-record-field')) item.classList.remove('is-correct', 'is-incorrect');
  const relation = out(root, '[data-lab-relation]');
  if (relation) { relation.textContent = ''; relation.removeAttribute('data-kind'); }
  out(root, '[data-p3p-hint]')?.setAttribute('hidden', '');
  const solution = out(root, '[data-p3p-solution]');
  if (solution) { solution.setAttribute('hidden', ''); solution.replaceChildren(); }
}

/* --- grading ------------------------------------------------------------- */

function gradeQuiz(root, spec) {
  let right = 0;
  const wrongHints = [];
  for (const item of spec.items) {
    const selected = root.querySelector(`input[name="p3p-${item.id}"]:checked`)?.value ?? null;
    const ok = selected !== null && selected === item.correct;
    if (ok) right += 1; else if (item.hint) wrongHints.push(item.hint);
    itemFeedback(root, item.id, ok ? '✓ إجابة صحيحة' : 'تحتاج مراجعة؛ انظر التلميح', ok);
  }
  return { right, total: spec.items.length, wrongHints };
}

function gradeNumeric(root, spec) {
  let right = 0;
  for (const item of spec.items) {
    const input = root.querySelector(`[data-p3p-numeric="${item.id}"]`);
    const parsed = Number(String(input?.value ?? '').trim().replace(',', '.').replace('٫', '.'));
    const ok = Number.isFinite(parsed) && Math.abs(parsed - item.correct) < 1e-9;
    if (ok) right += 1;
    itemFeedback(root, item.id, ok ? '✓ قيمة صحيحة' : 'راجع القيمة؛ طبّق علاقة الكمون المناسبة', ok);
  }
  return { right, total: spec.items.length };
}

function gradeBlanks(root, spec) {
  let right = 0;
  for (const item of spec.items) {
    const input = root.querySelector(`[data-p3p-blank="${item.id}"]`);
    const value = input?.value ?? '';
    const ok = matchesBlankAnswer(value, [...item.accepted]);
    if (ok) right += 1;
    itemFeedback(root, item.id, ok ? '✓' : value.trim() ? 'صياغة غير مطابقة؛ قاربها على مصطلح الكتاب' : 'املأ الفراغ', ok);
  }
  return { right, total: spec.items.length };
}

function completionCheck(root, spec, kind) {
  if (kind === 'blanks') {
    const empty = spec.items.some((item) => !(root.querySelector(`[data-p3p-blank="${item.id}"]`)?.value ?? '').trim());
    return empty ? 'أكمل جميع الفراغات قبل التحقق.' : '';
  }
  if (kind === 'numeric') {
    const empty = spec.items.some((item) => !(root.querySelector(`[data-p3p-numeric="${item.id}"]`)?.value ?? '').trim());
    return empty ? 'أدخل قيمة عددية في كل حقل قبل التحقق.' : '';
  }
  if (kind === 'quiz') {
    const missing = spec.items.some((item) => !root.querySelector(`input[name="p3p-${item.id}"]:checked`));
    return missing ? 'اختر إجابة لكل فقرة قبل التحقق.' : '';
  }
  return '';
}

function applyResult(root, result, wrongHints = []) {
  if (result.gated && result.gateMessage) return; /* feedback already written */
  setScore(root, `النتيجة: ${result.right} / ${result.total}`);
  stateFor(root).lastWrongHints = wrongHints;
  if (result.right === result.total) {
    setFeedback(root, '✓ جميع إجاباتك صحيحة. يمكنك فتح الحل النموذجي لمراجعة التفسير العلمي.', 'correct');
  } else {
    setFeedback(root, `أصبت ${result.right} من ${result.total}. لم تُكشف أي إجابة صحيحة؛ صحّح البنود المعلَّمة بالاستعانة بالتلميح ثم أعد التحقق.`, 'incorrect');
  }
}

/* --- labs ------------------------------------------------------------------ */

const LAB_KINDS = Object.freeze(new Set(['lab-dipole', 'lab-series', 'lab-parallel']));

function labSourceValue(root) {
  return Number(root.querySelector('[data-lab-source]')?.value ?? Number.NaN);
}

function renderLab(root, kind) {
  const state = stateFor(root);
  const closed = state.lab.closed;
  const source = labSourceValue(root);
  const status = out(root, '[data-lab-status]');
  const desc = out(root, '[data-lab-desc]');
  for (const button of root.querySelectorAll('[data-lab-toggle]')) {
    button.setAttribute('aria-pressed', String((button.dataset.labToggle === 'close') === closed));
  }
  const write = (id, text) => {
    const node = root.querySelector(`[data-lab-reading="${id}"]`);
    if (node) node.textContent = text;
  };
  if (kind === 'lab-dipole') {
    const readings = Number.isFinite(source) ? dipoleExperimentReadings(source, closed) : null;
    if (readings) {
      write('current', closed ? `${fmt(readings.current)} A` : '0 A');
      write('lamp', closed ? `${fmt(readings.lampVoltage)} V` : '0 V');
      write('source', `${fmt(readings.sourceVoltage)} V`);
    }
    root.querySelector('[data-lab-lamp="main"]')?.classList.toggle('is-lit', closed);
    if (status && readings) {
      status.textContent = closed
        ? `الدارة مغلقة: يمر تيار ${fmt(readings.current)} A، وفرق الكمون على المصباح ${fmt(readings.lampVoltage)} V، وبين قطبي المولد ${fmt(readings.sourceVoltage)} V.`
        : `القاطعة مفتوحة: التيار 0 A، وفرق الكمون على المصباح 0 V، وبين قطبي المولد ${fmt(readings.sourceVoltage)} V (القوة المحركة الكهربائية).`;
    }
  } else {
    const model = Number.isFinite(source)
      ? (kind === 'lab-series' ? seriesLabReadings(source) : parallelLabReadings(source))
      : null;
    if (model) {
      write('u', `${fmt(model.sourceVoltage)} V`);
      write('u1', closed ? `${fmt(model.lampVoltages[0])} V` : '0 V');
      write('u2', closed ? `${fmt(model.lampVoltages[1])} V` : '0 V');
      for (const lampId of ['lamp-1', 'lamp-2']) root.querySelector(`[data-lab-lamp="${lampId}"]`)?.classList.toggle('is-lit', closed);
      if (status) {
        status.textContent = closed
          ? `الدارة مغلقة: U = ${fmt(model.sourceVoltage)} V، U₁ = ${fmt(model.lampVoltages[0])} V، U₂ = ${fmt(model.lampVoltages[1])} V. سجّل القراءات في الحقول.`
          : 'القاطعة مفتوحة: قراءة المصباحين 0 V ولا يولّد تيار؛ أغلق القاطعة ثم اقرأ وسجّل.';
      }
    }
  }
  out(root, '[data-lab-flow]')?.toggleAttribute('hidden', !closed);
  out(root, '[data-lab-switch-visual]')?.classList.toggle('is-closed', closed);
  const lever = out(root, '[data-lab-lever]');
  if (lever) {
    const match = /^M([\d.]+) ([\d.]+)/.exec(lever.getAttribute('d') ?? '');
    if (match) lever.setAttribute('d', closed ? `M${match[1]} ${match[2]}v44` : `M${match[1]} ${match[2]}l-22 30`);
  }
  if (desc && status) desc.textContent = status.textContent;
}

function gradeLab(root, spec, kind) {
  const state = stateFor(root);
  if (kind === 'lab-dipole') {
    if (!state.lab.seenClosed || !state.lab.seenOpen) {
      return { gated: true, gateMessage: 'جرّب الحالتين أولاً: أغلق القاطعة ولاحظ، ثم افتحها ولاحظ، وبعدها أجب عن أسئلة الملاحظة.' };
    }
    return { ...gradeQuiz(root, spec), kind: 'observations' };
  }
  if (!state.lab.seenClosed) {
    return { gated: true, gateMessage: 'أغلق القاطعة أولاً واقرأ المقاييس، ثم سجّل القراءات بنفسك قبل التحقق.' };
  }
  const source = labSourceValue(root);
  const model = Number.isFinite(source)
    ? (kind === 'lab-series' ? seriesLabReadings(source) : parallelLabReadings(source))
    : null;
  if (!model) return { gated: true, gateMessage: 'أعد اختيار قيمة المولد ثم أغلق القاطعة.' };
  const expected = { u: model.sourceVoltage, u1: model.lampVoltages[0], u2: model.lampVoltages[1] };
  const labels = { u: 'U', u1: 'U₁', u2: 'U₂' };
  let recordRight = 0;
  const misses = [];
  let blanks = 0;
  for (const key of ['u', 'u1', 'u2']) {
    const input = root.querySelector(`[data-lab-record="${key}"]`);
    const value = input?.value ?? '';
    if (!value.trim()) {
      blanks += 1;
      itemFeedback(root, key, 'أدخل القراءة', false);
      misses.push(labels[key]);
      continue;
    }
    const check = readingMatches(value, expected[key]);
    if (check.ok) recordRight += 1; else misses.push(labels[key]);
    itemFeedback(root, key, check.ok ? '✓ مطابقة لقراءة المقياس' : 'قارن بقراءة المقياس المعروضة أمامك', check.ok);
  }
  if (blanks) {
    return { gated: true, gateMessage: `أكمل تسجيل القراءات في الحقول الناقصة: ${misses.join('، ')}.` };
  }
  const selectedRelation = root.querySelector('input[name="p3p-relation"]:checked')?.value ?? null;
  if (!selectedRelation) {
    return { gated: true, gateMessage: 'اختر العلاقة المستنتجة بعد تسجيل القراءات الثلاث.' };
  }
  const relationSpec = spec.items[0];
  const relationOk = selectedRelation === relationSpec.correct;
  itemFeedback(root, 'relation', relationOk ? '✓ العلاقة صحيحة' : 'راجع العلاقة؛ قارن القراءات الثلاث ببعضها', relationOk);
  const relationLine = out(root, '[data-lab-relation]');
  if (relationLine) {
    if (recordRight === 3) {
      relationLine.textContent = kind === 'lab-series'
        ? `تحقّق بنفسك: U₁ + U₂ = ${fmt(expected.u1)} + ${fmt(expected.u2)} = ${fmt(expected.u1 + expected.u2)} V = U ✓`
        : `تحقّق بنفسك: U = U₁ = U₂ = ${fmt(expected.u)} V ✓`;
      relationLine.dataset.kind = 'correct';
    } else {
      relationLine.textContent = `القراءات تُنقل مما تعرضه المقاييس الآن؛ راجع: ${misses.join('، ')}.`;
      relationLine.dataset.kind = 'incorrect';
    }
  }
  return { right: recordRight + (relationOk ? 1 : 0), total: 4, wrongHints: [spec.hint] };
}

function handleCheck(root, kind) {
  withAnswers(root, (spec) => {
    if (!spec) {
      setFeedback(root, 'هذا النشاط بلا مفتاح تصحيح معرّف.', 'error');
      return;
    }
    if (LAB_KINDS.has(kind)) {
      const result = gradeLab(root, spec, kind);
      if (result.gated) {
        setFeedback(root, result.gateMessage, 'error');
        return;
      }
      stateFor(root).attempted = true;
      stateFor(root).lastWrongHints = result.wrongHints ?? [];
      applyResult(root, result, result.wrongHints ?? []);
      return;
    }
    const incomplete = completionCheck(root, spec, kind);
    if (incomplete) {
      setFeedback(root, incomplete, 'error');
      return;
    }
    const result = kind === 'numeric' ? gradeNumeric(root, spec) : kind === 'blanks' ? gradeBlanks(root, spec) : gradeQuiz(root, spec);
    stateFor(root).attempted = true;
    applyResult(root, result, result.wrongHints ?? []);
  });
}

/* --- hint & solution rendering -------------------------------------------- */

function renderHint(root, spec) {
  const panel = out(root, '[data-p3p-hint]');
  if (!panel) return;
  const wrongHints = spec.items
    .filter((item) => item.hint)
    .filter((item) => {
      const selected = root.querySelector(`input[name="p3p-${item.id}"]:checked`);
      return selected && selected.value !== item.correct;
    })
    .map((item) => `<li>${item.hint}</li>`)
    .join('');
  panel.innerHTML = `${HINT_TAG}<div class="p3p-hint-body"><p>${spec.hint}</p>${wrongHints ? `<ul class="p3p-hint-list">${wrongHints}</ul>` : ''}</div>`;
  panel.removeAttribute('hidden');
}

function renderSolution(root, spec) {
  const panel = out(root, '[data-p3p-solution]');
  if (!panel) return;
  const steps = spec.solution.steps.map((step) => `<div class="p3p-solution-step"><span class="p3p-solution-label">${step.label}</span>${step.tex ? formula(step.tex, step.label) : `<p>${step.text ?? ''}</p>`}</div>`).join('');
  panel.innerHTML = `<div class="p3p-solution-heading">${SOLUTION_TAG}<h4>${spec.solution.title}</h4></div><div class="p3p-solution-steps">${steps}</div>${spec.solution.note ? `<p class="p3p-solution-note">${spec.solution.note}</p>` : ''}`;
  panel.removeAttribute('hidden');
}

/* --- public mount ----------------------------------------------------------- */

const KIND_BY_ID = Object.freeze({
  'p98-observe': 'quiz',
  'p99-think': 'quiz',
  'p100-lab': 'lab-dipole',
  'p101-series-lab': 'lab-series',
  'p102-series-activity': 'numeric',
  'p102-parallel-lab': 'lab-parallel',
  'p103-parallel-activity': 'numeric',
  'p105-mcq': 'quiz',
  'p105-true-false': 'quiz',
  'p106-blanks': 'blanks',
});

function mountActivity(root) {
  if (root.dataset.mounted === 'true') return;
  root.dataset.mounted = 'true';
  const id = root.dataset.u2l3Practice;
  const kind = KIND_BY_ID[id] ?? 'quiz';
  const form = root.querySelector('[data-p3p-form]');
  form?.addEventListener('submit', (event) => event.preventDefault());
  const onEdit = (event) => {
    if (event.target.closest?.('[data-lab-source]') && stateFor(root).lab.closed) renderLab(root, kind);
    clearResult(root);
  };
  form?.addEventListener('input', onEdit);
  form?.addEventListener('change', onEdit);
  root.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-lab-toggle]');
    if (toggle) {
      const state = stateFor(root);
      state.lab.closed = toggle.dataset.labToggle === 'close';
      if (state.lab.closed) state.lab.seenClosed = true;
      else state.lab.seenOpen = true;
      renderLab(root, kind);
      clearResult(root);
      return;
    }
    const action = event.target.closest('[data-p3p-action]');
    if (!action) return;
    const mode = action.dataset.p3pAction;
    if (mode === 'reset') {
      const state = stateFor(root);
      state.lab = initialLab();
      form?.reset();
      if (LAB_KINDS.has(kind)) renderLab(root, kind);
      clearResult(root);
      setFeedback(root, 'أُعيد ضبط هذا النشاط وحده: عادت الأجهزة إلى حالتها الابتدائية، ولا نتائج أو حلول ظاهرة.', 'neutral');
      return;
    }
    if (mode === 'hint') {
      withAnswers(root, (spec) => { if (spec) renderHint(root, spec); });
      return;
    }
    if (mode === 'solution') {
      if (!stateFor(root).attempted) {
        setFeedback(root, 'قدّم محاولتك واضغط «تحقق من الإجابة» أولاً؛ الحل النموذجي يُفتح بعد المحاولة فقط.', 'error');
        return;
      }
      withAnswers(root, (spec) => { if (spec) renderSolution(root, spec); });
      return;
    }
    if (mode === 'check') handleCheck(root, kind);
  });
  if (LAB_KINDS.has(kind)) renderLab(root, kind);
}

export function mountUnit2Lesson3Practice(scope = document) {
  scope.querySelectorAll('[data-u2l3-practice]').forEach(mountActivity);
}

/* exported for focused unit tests */
export const __internals = Object.freeze({ KIND_BY_ID });
