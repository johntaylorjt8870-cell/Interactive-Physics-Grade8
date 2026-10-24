import { calculation, tex } from './math.js';
import { currentFromChargeTime, chargeFromCurrentTime, seriesCurrents, parallelTotal } from './unit2-lesson2-physics.js';

const fmt = (v) => {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1000 || (a < 0.01 && a > 0)) return v.toExponential(2);
  return String(Number(v.toFixed(4)));
};

/* A formatted number as TeX (turns 1.2e-3 into 1.2\times10^{-3}). */
const texNumber = (v) => {
  const s = fmt(v);
  const m = s.match(/^(-?[\d.]+)e([+-]\d+)$/);
  return m ? `${m[1]}\\times10^{${m[2].replace('+', '')}}` : s;
};

/* Live substitution for the I = q/t lab: a real typeset fraction, not a slash. */
function currentEquation(charge, time, current) {
  return calculation(
    `I=\\dfrac{q}{t}=\\dfrac{${texNumber(charge)}\\,\\mathrm{C}}{${texNumber(time)}\\,\\mathrm{s}}=${texNumber(current)}\\,\\mathrm{A}`,
    `I equals q over t equals ${fmt(charge)} C over ${fmt(time)} s equals ${fmt(current)} A`,
  );
}

/* ---------------------------------------------------------------------------
   p88 tube-and-balls model (pure, unit-tested). Slot 0 is the end we push from.
   Pushing k balls shifts the whole row at once, so exactly k balls leave the far
   end in the same step — the effect crosses the tube immediately, while every
   individual ball (including the marked one) advances only k slots.
   --------------------------------------------------------------------------- */
export const TUBE_CAPACITY = 9;

export function createTubeState(capacity = TUBE_CAPACITY) {
  if (!Number.isInteger(capacity) || capacity < 2) throw new RangeError('capacity must be an integer of at least 2.');
  return Object.freeze({
    capacity,
    balls: Object.freeze(Array.from({ length: capacity }, (_, i) => i)),
    nextId: capacity,
    pushed: 0,
    exited: 0,
    markedId: 0,
    lastIn: Object.freeze([]),
    lastOut: Object.freeze([]),
  });
}

export function pushBalls(state, count) {
  const k = Number(count);
  if (!Number.isInteger(k) || k < 1 || k > state.capacity) {
    throw new RangeError('count must be an integer between 1 and the tube capacity.');
  }
  const incoming = Array.from({ length: k }, (_, i) => state.nextId + i);
  return Object.freeze({
    ...state,
    balls: Object.freeze([...incoming.slice().reverse(), ...state.balls.slice(0, state.capacity - k)]),
    nextId: state.nextId + k,
    pushed: state.pushed + k,
    exited: state.exited + k,
    lastIn: Object.freeze(incoming),
    lastOut: Object.freeze(state.balls.slice(state.capacity - k).reverse()),
  });
}

/** Slot of the marked ball, or -1 once it has left the tube. */
export const markedSlot = (state) => state.balls.indexOf(state.markedId);

const TUBE_GEOMETRY = Object.freeze({ firstX: 178, gap: 44, cy: 118, r: 20 });
const tubeSlotX = (slot) => TUBE_GEOMETRY.firstX + slot * TUBE_GEOMETRY.gap;
const tubeBallMarkup = (id, slot, markedId) => `<g class="u2l2-ball${id === markedId ? ' is-marked' : ''}" data-ball-id="${id}" style="transform: translate(${tubeSlotX(slot)}px, 0px)"><circle cx="0" cy="${TUBE_GEOMETRY.cy}" r="${TUBE_GEOMETRY.r}"/></g>`;

const ballsText = (n) => (n === 1 ? 'كرة واحدة' : n === 2 ? 'كرتين' : n <= 10 ? `${n} كرات` : `${n} كرة`);
const slotsText = (n) => (n === 0 ? 'لم تتحرك بعد' : n === 1 ? 'خانة واحدة' : n === 2 ? 'خانتان' : n <= 10 ? `${n} خانات` : `${n} خانة`);
const TUBE_START_STATUS = 'الأنبوب ممتلئ بتسع كرات. ادفع كرة واحدة أو عدة كرات من الطرف الأيسر، وراقب الطرف الآخر والكرة المميّزة.';

/* A prediction the student must commit to before acting on the model. The
   answer lives in src/unit2-lesson2-answers.js and is fetched on submit only. */
function predictionMarkup(id, question, options, actionLabel) {
  return `<div class="u2l2-prediction" data-prediction="${id}">
    <p class="u2l2-prediction-title"><span class="u2l2-tag u2l2-tag-platform">تنبّأ قبل التنفيذ</span> ${question}</p>
    <div class="u2l2-prediction-options" role="radiogroup" aria-label="خيارات التنبّؤ">
      ${options.map(([value, label]) => `<label class="u2l2-prediction-option"><input type="radio" name="prediction-${id}" value="${value}" data-prediction-input /> <span>${label}</span></label>`).join('')}
    </div>
    <div class="u2l2-prediction-actions">
      <button class="u2l2-button u2l2-button-primary" type="button" data-prediction-submit>${actionLabel ?? 'تحقق من تنبّؤي'}</button>
      <button class="u2l2-button u2l2-button-ghost" type="button" data-prediction-clear>مسح التنبّؤ</button>
    </div>
    <output class="u2l2-prediction-feedback" data-prediction-feedback role="status" aria-live="polite"></output>
  </div>`;
}

const conclusionMarkup = (id, ref) => `<div class="u2l2-sim-conclusion" data-sim-conclusion="${id}" hidden>
  <h4>أستنتج من التجربة</h4>
  <p data-conclusion-copy></p>
  <p class="u2l2-sim-conclusion-ref">${ref}</p>
</div>`;

function tubeLabMarkup() {
  const start = createTubeState();
  return `<aside class="simulation-experience u2l2-sim u2l2-sim-wide" data-u2l2-sim="tube" aria-labelledby="tube-lab-title">
  <header class="simulation-header"><div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model · نموذج تعليمي مبسّط</span></div>
  <h3 id="tube-lab-title">مختبر الأنبوب والكرات: انتقال التأثير</h3>
  <p>نفّذ الخطوتين 3 و4 من تجربة الكتاب: ادفع كرة جديدة من أحد طرفي الأنبوب، ثم ادفع عدداً من الكرات من الطرف ذاته، وراقب ما يحدث عند الطرف الآخر.</p></header>
  <div class="u2l2-model-notice" role="note" aria-labelledby="tube-notice-title">
   <p class="u2l2-model-notice-title" id="tube-notice-title">نموذج تعليمي مبسّط</p>
   <p>يشرح هذا النموذج <strong>انتقال التأثير</strong> في الدارة: الأنبوب ممتلئ بالكرات سلفاً، لذلك يظهر أثر الدفع عند الطرف الآخر مباشرةً.</p>
   <p>ولا يعني ذلك أن الإلكترونات نفسها تنتقل فوراً من أحد طرفي السلك إلى الطرف الآخر؛ فكل إلكترون يتحرك ببطء مسافة صغيرة، كما تتقدّم الكرة المميّزة خانة واحدة فقط مع كل كرة تدفعها. حدود النموذج: الكرات أكبر من الإلكترونات، ولا يمثّل النموذج تصادمات الشبكة البلورية ولا سرعة الانجراف.</p>
  </div>
  <div class="simulation-workbench"><section class="simulation-controls" aria-label="ضوابط الأنبوب">
   ${predictionMarkup('sim-tube', 'إذا دفعت ثلاث كرات معاً من الطرف الأيسر، فكم كرة تخرج من الطرف الآخر في اللحظة نفسها؟', [['zero', 'لا تخرج أي كرة قبل أن تصل الكرة المدفوعة'], ['one', 'كرة واحدة فقط'], ['three', 'ثلاث كرات']])}
   <div class="u2l2-steps" role="group" aria-label="دفع الكرات">
    <button type="button" data-tube-push="1">ادفع كرة واحدة</button>
    <button type="button" data-tube-push="3">ادفع 3 كرات معاً</button>
    <button type="button" data-tube-reset>إعادة الضبط</button>
   </div>
   <div class="simulation-result-grid">
     <div class="simulation-result-cell"><span>كرات دُفعت من الطرف الأيسر</span><output class="simulation-result-value" data-tube-pushed>0</output></div>
     <div class="simulation-result-cell"><span>كرات خرجت من الطرف الآخر</span><output class="simulation-result-value" data-tube-exited>0</output></div>
     <div class="simulation-result-cell u2l2-result-wide"><span>تقدّم الكرة المميّزة داخل الأنبوب</span><output class="simulation-result-value" data-tube-marked>${slotsText(0)}</output></div>
   </div>
   <div class="simulation-status" role="status" aria-live="polite" data-tube-status>${TUBE_START_STATUS}</div>
  </section>
  <figure class="simulation-visual"><div class="simulation-svg-wrap"><svg viewBox="0 0 720 200" role="img" aria-labelledby="tl-title tl-desc"><title id="tl-title">أنبوب شفاف ممتلئ بالكرات</title><desc id="tl-desc" data-tube-desc>أنبوب ممتلئ بتسع كرات؛ لم تُدفع أي كرة بعد.</desc>
   <rect class="u2l2-zone" x="16" y="84" width="136" height="68" rx="14"/>
   <rect class="u2l2-zone u2l2-zone-exit" x="556" y="84" width="148" height="68" rx="14"/>
   <rect class="u2l2-tube" x="150" y="92" width="408" height="52" rx="26"/>
   <path class="u2l2-tube-shine" d="M178 101 H530"/>
   <polygon class="u2l2-push-arrow" data-tube-arrow points="232,56 462,56 462,47 488,61 462,75 462,66 232,66"/>
   <text x="360" y="36" class="u2l2-tube-label" text-anchor="middle" direction="rtl">اتجاه الدفع</text>
   <text x="84" y="74" class="u2l2-tube-label" text-anchor="middle" direction="rtl">كرات جديدة</text>
   <text x="630" y="74" class="u2l2-tube-label" text-anchor="middle" direction="rtl">الطرف الآخر</text>
   <text x="84" y="178" class="u2l2-tube-sub" text-anchor="middle" direction="rtl">ندفع من هنا</text>
   <text x="630" y="178" class="u2l2-tube-sub" text-anchor="middle" direction="rtl">تخرج الكرات هنا</text>
   <g data-tube-balls>${start.balls.map((id, slot) => tubeBallMarkup(id, slot, start.markedId)).join('')}</g>
  </svg></div>
  <ul class="simulation-legend" aria-label="رموز مختبر الأنبوب">
   <li><span class="u2l2-key-dot is-ball" aria-hidden="true"></span>كرة في الأنبوب (تمثّل إلكتروناً حراً)</li>
   <li><span class="u2l2-key-dot is-marked" aria-hidden="true"></span>الكرة المميّزة</li>
   <li><span class="u2l2-key-dot is-new" aria-hidden="true"></span>كرة دُفعت الآن</li>
   <li><span class="u2l2-key-dot is-out" aria-hidden="true"></span>كرة خرجت من الطرف الآخر</li>
  </ul>
  <figcaption>الكرات تمثّل الإلكترونات الحرة الموجودة سلفاً في السلك، والدفع يمثّل تأثير المولّد.</figcaption></figure>
  ${conclusionMarkup('sim-tube', 'مطابق لاستنتاج الكتاب ص88: التيار المتواصل انتقال مستمرّ للإلكترونات الحرة باتجاه واحد.')}
  </div></aside>`;
}

function rng(id, label, min, max, step, val, unit) {
  return `<div class="simulation-control"><div class="simulation-control-heading"><label for="${id}">${label}</label><output class="simulation-control-value" for="${id}"><bdi dir="ltr">${val} ${unit}</bdi></output></div><input class="simulation-range" id="${id}" data-u2l2-input type="range" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}"/><div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">${min} ${unit}</bdi><bdi dir="ltr">${max} ${unit}</bdi></div></div>`;
}

/* Current lab canvas: one closed loop with generator, lamp and ammeter, and a
   row of free electrons whose labels state the printed direction facing. The
   number of drawn electrons never changes with the sliders (the wire is always
   full), only the label and the readout do. */
function currentCanvasSvg() {
  /* Every element sits ON the closed loop and the wire stops at each element,
     as in the book figure of p89: the battery on the top side, the lamp on the
     right side and the ammeter on the bottom side. The plus terminal is on the
     left, so the conventional current leaves it leftwards, runs down the left
     side, rightwards along the bottom and up through the lamp. The red arrows
     show that direction; the blue dots are free electrons. */
  return `<svg viewBox="0 0 720 330" role="img" aria-labelledby="cl-title cl-desc"><title id="cl-title">دارة مغلقة لقياس شدة التيار</title><desc id="cl-desc" data-current-desc>دارة مغلقة: مولّد ومصباح ومقياس أمبير وأسلاك موصولة على مسار واحد مغلق.</desc>
    <defs><marker id="current-lab-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#c95348"/></marker></defs>
    <path class="u2-wire" d="M170 100 H320"/>
    <path class="u2-wire" d="M440 100 H570 V146"/>
    <path class="u2-wire" d="M570 194 V250 H386"/>
    <path class="u2-wire" d="M334 250 H170 V100"/>
    <g data-part="generator"><rect class="u2l2-battery-pos" x="320" y="76" width="66" height="44" rx="6"/><rect class="u2l2-battery-neg" x="386" y="76" width="54" height="44" rx="6"/>
      <text class="u2l2-terminal-sign" data-terminal="positive" x="353" y="106" text-anchor="middle" direction="ltr">+</text>
      <text class="u2l2-terminal-sign" data-terminal="negative" x="413" y="106" text-anchor="middle" direction="ltr">−</text></g>
    <text class="u2l2-part-label" x="380" y="60" text-anchor="middle" direction="rtl">المولّد</text>
    <g data-part="lamp"><circle class="u2l2-lamp-glow" cx="570" cy="170" r="36"/><circle class="u2l2-lamp" cx="570" cy="170" r="24"/><path class="u2l2-lamp-x" d="M556 156 L584 184 M584 156 L556 184"/></g>
    <text class="u2l2-part-label" x="646" y="176" text-anchor="middle" direction="rtl">مصباح</text>
    <g data-part="ammeter"><circle class="u2-ammeter" cx="360" cy="250" r="26"/><text class="u2l2-circuit-label" x="360" y="250" text-anchor="middle" dominant-baseline="central" direction="ltr">A</text></g>
    <text class="u2l2-part-label" x="396" y="306" text-anchor="middle" direction="rtl">مقياس الأمبير</text>
    <g data-electron-row>${[200, 240, 280].map((x) => `<circle class="u2-electron" cx="${x}" cy="100" r="8"/>`).join('')}</g>
    <g data-current-flow>
      <path class="u2-arrow-e" d="M210 250 H300" marker-end="url(#current-lab-arrow)"/>
      <path class="u2-arrow-e" d="M570 240 V214" marker-end="url(#current-lab-arrow)"/>
      <path class="u2-arrow-e" d="M540 100 H470" marker-end="url(#current-lab-arrow)"/>
    </g>
    <text class="u2l2-part-sub" x="150" y="294" text-anchor="middle" direction="rtl">جهة التيار الاصطلاحية</text>
    <text class="u2l2-circuit-label" data-current-label x="478" y="58" text-anchor="middle" direction="ltr">I = 2 A</text>
  </svg>`;
}

function currentLabMarkup() {
  return `<aside class="simulation-experience u2l2-sim u2l2-sim-wide" data-u2l2-sim="current" aria-labelledby="current-lab-title">
  <header class="simulation-header"><div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model · نموذج تعليمي مبسّط</span></div>
  <h3 id="current-lab-title">مختبر شدة التيار ${tex('I=\\dfrac{q}{t}', 'I equals q over t')}</h3>
  <p>غيّر كمية الكهرباء وزمن مرورها. تنبّأ أولاً، ثم راقب شدة التيار. الحدود: النموذج يفترض تياراً متواصلاً ثابتاً في دارة مغلقة، ولا يمثل مقاومة أو حرارة الأسلاك، ولا يحسب زمن وصول الإلكترونات.</p></header>
  <div class="simulation-workbench"><section class="simulation-controls" aria-label="ضوابط التيار">
   ${predictionMarkup('sim-current', 'إذا تضاعفت كمية الكهرباء q وبقي الزمن t كما هو، فماذا يحدث لشدة التيار I؟', [['double', 'تتضاعف شدة التيار'], ['half', 'تصبح نصف ما كانت'], ['same', 'لا تتغير شدة التيار']])}
   ${rng('cq', 'كمية الكهرباء q', 10, 120, 5, 60, 'C')}
   ${rng('ct', 'الزمن t', 5, 120, 5, 30, 's')}
   <button class="simulation-sweep" type="button" data-current-reset>إعادة الضبط</button>
   <div class="simulation-result-grid">
     <div class="simulation-result-cell"><span>شدة التيار I</span><output class="simulation-result-value" data-current-i><bdi dir="ltr">—</bdi></output></div>
     <div class="simulation-result-cell"><span>q عند ثلاثة أمثال الزمن</span><output class="simulation-result-value" data-current-q3><bdi dir="ltr">—</bdi></output></div>
   </div>
   <div class="simulation-status" role="status" aria-live="polite" data-current-status></div>
   <p class="u2l2-predict">تحقق: عند قيم الكتاب ${tex('q=60\\,\\mathrm{C}', 'q equals 60 C')} و ${tex('t=30\\,\\mathrm{s}', 't equals 30 s')} يجب أن تحصل على ${tex('I=2\\,\\mathrm{A}', 'I equals 2 A')}.</p>
  </section>
  <figure class="simulation-visual"><div class="simulation-svg-wrap">${currentCanvasSvg()}</div>
  <figcaption><div class="u2l2-live-equation" data-current-equation>${currentEquation(60, 30, 2)}</div></figcaption></figure>
  ${conclusionMarkup('sim-current', 'مطابق لاستنتاج الكتاب ص91: النسبة بين كمية الكهرباء والزمن ثابتة وهي تعبّر عن شدة التيار I، وتُحسب بقسمة كمية الكهرباء المارّة على زمن مرورها.')}
  </div></aside>`;
}

/* The two circuit canvases follow the topology of the p92 and p93 figures:
   series = one closed loop through G, A1, L1, L2 and A2; parallel = A in the main
   line and two branches between the same two junctions. Lamps switch off when a
   lamp is removed, and the ammeter labels follow the mode. */
const SIM_WIRE = 'u2-wire';

function seriesCanvas() {
  return `<g data-circuit-canvas="series">
    <path class="${SIM_WIRE}" d="M120 170 V90 H240"/><path class="${SIM_WIRE}" d="M292 90 H330"/><path class="${SIM_WIRE}" d="M390 90 H440"/>
    <path class="${SIM_WIRE}" d="M500 90 H600 V170"/><path class="${SIM_WIRE}" d="M600 210 V250 H120 V210"/>
    <g data-part="generator"><rect class="u2l2-battery-cap" x="112" y="170" width="16" height="11" rx="3"/><rect class="u2l2-battery-pos" x="100" y="180" width="40" height="30" rx="5"/>
      <text class="u2l2-terminal-sign" data-terminal="positive" x="120" y="204" text-anchor="middle">+</text></g>
    <g data-part="ammeter"><circle class="u2-ammeter" cx="266" cy="90" r="26"/><text class="u2l2-circuit-label" x="266" y="90" text-anchor="middle" dominant-baseline="central" direction="ltr">A₁</text></g>
    <g data-part="lamp" data-lamp="1"><circle class="u2l2-lamp-glow" cx="360" cy="90" r="36"/><circle class="u2l2-lamp" cx="360" cy="90" r="28" data-bulb="1"/><path class="u2l2-lamp-x" data-bulb-x="1" d="M340 70 L380 110 M380 70 L340 110"/></g>
    <g data-part="lamp" data-lamp="2"><circle class="u2l2-lamp-glow" cx="470" cy="90" r="36"/><circle class="u2l2-lamp" cx="470" cy="90" r="28" data-bulb="2"/><path class="u2l2-lamp-x" data-bulb-x="2" d="M450 70 L490 110 M490 70 L450 110"/></g>
    <g data-part="ammeter"><circle class="u2-ammeter" cx="600" cy="190" r="26"/><text class="u2l2-circuit-label" x="600" y="190" text-anchor="middle" dominant-baseline="central" direction="ltr">A₂</text></g>
    <text class="u2l2-part-label" x="360" y="40" text-anchor="middle" direction="rtl">L₁</text>
    <text class="u2l2-part-label" x="470" y="40" text-anchor="middle" direction="rtl">L₂</text>
    <text class="u2l2-circuit-label" data-series-a1 x="266" y="132" text-anchor="middle" direction="ltr">200 mA</text>
    <text class="u2l2-circuit-label" data-series-a2 x="546" y="196" text-anchor="end" direction="ltr">200 mA</text>
    <text class="u2l2-part-label" x="70" y="240" text-anchor="middle" direction="rtl">المولّد</text>
    <text class="u2l2-part-sub" x="360" y="284" text-anchor="middle" direction="rtl">مسار واحد مغلق: التيار نفسه في كل أجزائه</text>
  </g>`;
}

function parallelCanvas() {
  return `<g data-circuit-canvas="parallel">
    <path class="${SIM_WIRE}" d="M120 170 H210"/><path class="${SIM_WIRE}" d="M262 170 H320"/><path class="${SIM_WIRE}" d="M320 170 V100 H356"/>
    <path class="${SIM_WIRE}" d="M444 100 H520 V170"/><path class="${SIM_WIRE}" d="M320 170 V240 H356"/><path class="${SIM_WIRE}" d="M444 240 H520 V170"/>
    <path class="${SIM_WIRE}" d="M520 170 H620 V304 H120 V210"/>
    <circle class="u2l2-junction" data-junction="320,170" cx="320" cy="170" r="5"/>
    <circle class="u2l2-junction" data-junction="520,170" cx="520" cy="170" r="5"/>
    <g data-part="generator"><rect class="u2l2-battery-cap" x="112" y="170" width="16" height="11" rx="3"/><rect class="u2l2-battery-pos" x="100" y="180" width="40" height="30" rx="5"/>
      <text class="u2l2-terminal-sign" data-terminal="positive" x="120" y="204" text-anchor="middle">+</text></g>
    <g data-part="ammeter"><circle class="u2-ammeter" cx="236" cy="170" r="26"/><text class="u2l2-circuit-label" x="236" y="170" text-anchor="middle" dominant-baseline="central" direction="ltr">A</text></g>
    <g data-part="ammeter"><circle class="u2-ammeter" cx="400" cy="100" r="24"/><text class="u2l2-circuit-label" x="400" y="100" text-anchor="middle" dominant-baseline="central" direction="ltr">A₁</text></g>
    <g data-part="lamp" data-lamp="1"><circle class="u2l2-lamp-glow" cx="470" cy="100" r="32"/><circle class="u2l2-lamp" cx="470" cy="100" r="22" data-bulb="1"/><path class="u2l2-lamp-x" data-bulb-x="1" d="M454 84 L486 116 M486 84 L454 116"/></g>
    <g data-part="ammeter"><circle class="u2-ammeter" cx="400" cy="240" r="24"/><text class="u2l2-circuit-label" x="400" y="240" text-anchor="middle" dominant-baseline="central" direction="ltr">A₂</text></g>
    <g data-part="lamp" data-lamp="2"><circle class="u2l2-lamp-glow" cx="470" cy="240" r="32"/><circle class="u2l2-lamp" cx="470" cy="240" r="22" data-bulb="2"/><path class="u2l2-lamp-x" data-bulb-x="2" d="M454 224 L486 256 M486 224 L454 256"/></g>
    <text class="u2l2-part-label" x="470" y="52" text-anchor="middle" direction="rtl">L₁</text>
    <text class="u2l2-part-label" x="470" y="292" text-anchor="middle" direction="rtl">L₂</text>
    <text class="u2l2-circuit-label" data-parallel-a x="236" y="212" text-anchor="middle" direction="ltr">300 mA</text>
    <text class="u2l2-circuit-label" data-parallel-a1 x="400" y="140" text-anchor="middle" direction="ltr">200 mA</text>
    <text class="u2l2-circuit-label" data-parallel-a2 x="400" y="282" text-anchor="middle" direction="ltr">100 mA</text>
    <text class="u2l2-part-label" x="66" y="240" text-anchor="middle" direction="rtl">المولّد</text>
    <text class="u2l2-part-sub" x="360" y="326" text-anchor="middle" direction="rtl">فرعان بين النقطتين نفسيهما: تيار الأصل = مجموع تياري الفرعين</text>
  </g>`;
}

function circuitLabMarkup() {
  return `<aside class="simulation-experience u2l2-sim u2l2-sim-wide" data-u2l2-sim="circuit" aria-labelledby="circuit-lab-title">
  <header class="simulation-header"><div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model · نموذج تعليمي مبسّط</span></div>
  <h3 id="circuit-lab-title">مختبر التسلسل والتفرع</h3>
  <p>قارن: على التسلسل التيار نفسه في كل جزء؛ على التفرع المجموع يساوي تيار المصدر. نزع مصباح على التسلسل يقطع الكل، وعلى التفرع يبقى الفرع الآخر. حدود النموذج: التيارات تُدخل بالميلي أمبير ولا يحسب النموذج المقاومات ولا هبوط الجهد.</p></header>
  <div class="simulation-workbench"><section class="simulation-controls" aria-label="ضوابط الدارة">
   ${predictionMarkup('sim-circuit', 'في الوصل على التسلسل، ماذا تقرأ A₂ بالمقارنة مع A₁ ما دام المسار مغلقاً؟', [['equal', 'القراءة نفسها'], ['half', 'نصف قراءة A₁'], ['sum', 'مجموع القراءتين']])}
   <div class="u2l2-steps u2l2-steps-four" role="group" aria-label="أدوات الدارة">
    <button type="button" data-circuit-mode="series" aria-pressed="true">وصل على التسلسل</button>
    <button type="button" data-circuit-mode="parallel" aria-pressed="false">وصل على التفرع</button>
    <button type="button" data-circuit-remove aria-pressed="false">انزع مصباحاً</button>
    <button type="button" data-circuit-reset>إعادة الضبط</button>
   </div>
   ${rng('ci1', 'تيار الفرع 1', 50, 400, 10, 200, 'mA')}
   ${rng('ci2', 'تيار الفرع 2', 50, 400, 10, 100, 'mA')}
   <div class="simulation-result-grid">
     <div class="simulation-result-cell"><span>قراءة المصدر</span><output class="simulation-result-value" data-circuit-src>—</output></div>
     <div class="simulation-result-cell"><span>حالة الدارة</span><output class="simulation-result-value" data-circuit-state>—</output></div>
   </div>
   <div class="simulation-status" role="status" aria-live="polite" data-circuit-status></div>
  </section>
  <figure class="simulation-visual"><div class="simulation-svg-wrap"><svg viewBox="0 0 720 330" role="img" aria-labelledby="cc-title cc-desc"><title id="cc-title">دارة تسلسل أو تفرع</title><desc id="cc-desc" data-circuit-desc>دارة تسلسل.</desc>
   <g data-circuit-canvas-group="series">${seriesCanvas()}</g>
   <g data-circuit-canvas-group="parallel" class="is-hidden" hidden>${parallelCanvas()}</g>
  </svg></div>
  <figcaption>على التسلسل I ثابت؛ على التفرع I = I₁ + I₂ ما دامت الفروع مغلقة. الرسم تخطيطي من المنصة وليس صورة الكتاب.</figcaption></figure>
  ${conclusionMarkup('sim-circuit', 'مطابق لاستنتاج الكتاب ص92 وص94: شدة التيار ثابتة في جميع أجزاء الدارة الموصولة على التسلسل، ومجموع تياري الفرعين يساوي التيار الأصلي على التفرع.')}
  </div></aside>`;
}

export function unit2l2SimulationMarkup(id) {
  if (id === 'tube-lab') return tubeLabMarkup();
  if (id === 'current-lab') return currentLabMarkup();
  if (id === 'circuit-lab') return circuitLabMarkup();
  return '';
}

/* ---------- prediction behaviour (shared by the three labs) ---------- */
const predictionAnswers = new WeakMap();
const predictionResets = new WeakMap();

/* Called by a lab's own reset: the prediction returns to its initial state too,
   so no stale «correct» message can survive a reset. */
function resetPrediction(root) {
  predictionResets.get(root)?.();
}

function mountPrediction(root) {
  const block = root.querySelector('[data-prediction]');
  if (!block) return;
  const id = block.dataset.prediction;
  const feedback = block.querySelector('[data-prediction-feedback]');
  const submit = block.querySelector('[data-prediction-submit]');
  const clear = block.querySelector('[data-prediction-clear]');
  const setFeedback = (text, kind) => {
    feedback.textContent = text;
    if (kind) feedback.dataset.kind = kind; else delete feedback.dataset.kind;
  };
  submit.addEventListener('click', async () => {
    const selected = block.querySelector('[data-prediction-input]:checked')?.value;
    if (!selected) { setFeedback('اختر تنبّؤاً واحداً قبل التحقق.', 'error'); return; }
    submit.disabled = true;
    try {
      if (!predictionAnswers.has(block)) {
        predictionAnswers.set(block, import('./unit2-lesson2-answers.js').then((module) => module.UNIT2L2_ANSWERS));
      }
      const answers = await predictionAnswers.get(block);
      const spec = answers[`${id}`] ?? answers[id.replace('sim-', 'prediction-')];
      if (!spec) { setFeedback('تعذّر تحميل التحقق الآن.', 'error'); return; }
      const correct = selected === spec.correct;
      setFeedback(correct
        ? `✓ ${spec.correctFeedback}`
        : `تنبّؤك غير مطابق: ${spec.incorrectFeedback}`, correct ? 'correct' : 'incorrect');
    } catch {
      setFeedback('تعذّر تحميل التحقق الآن. أعد المحاولة.', 'error');
    } finally {
      submit.disabled = false;
    }
  });
  const clearPrediction = () => {
    block.querySelectorAll('[data-prediction-input]').forEach((input) => { input.checked = false; });
    setFeedback('');
  };
  clear.addEventListener('click', clearPrediction);
  block.querySelectorAll('[data-prediction-input]').forEach((input) => {
    input.addEventListener('change', () => setFeedback(''));
  });
  predictionResets.set(root, clearPrediction);
}

function buildConclusion(root, text) {
  const box = root.querySelector('[data-sim-conclusion]');
  if (!box) return;
  box.querySelector('[data-conclusion-copy]').textContent = text;
  box.hidden = false;
}

function mountTubeLab(root) {
  const q = (s) => root.querySelector(s);
  const layer = q('[data-tube-balls]');
  const svgNs = 'http://www.w3.org/2000/svg';
  const nodes = new Map();
  let state = createTubeState();
  let arrowTimer = null;
  const place = (node, slot) => { node.style.transform = `translate(${tubeSlotX(slot)}px, 0px)`; };
  const ballNode = (id) => {
    const g = document.createElementNS(svgNs, 'g');
    g.setAttribute('class', 'u2l2-ball');
    g.setAttribute('data-ball-id', String(id));
    const circle = document.createElementNS(svgNs, 'circle');
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', String(TUBE_GEOMETRY.cy));
    circle.setAttribute('r', String(TUBE_GEOMETRY.r));
    g.append(circle);
    layer.append(g);
    nodes.set(id, g);
    return g;
  };
  function report(message) {
    q('[data-tube-pushed]').textContent = String(state.pushed);
    q('[data-tube-exited]').textContent = String(state.exited);
    const slot = markedSlot(state);
    q('[data-tube-marked]').textContent = slot >= 0 ? slotsText(slot) : 'خرجت من الأنبوب';
    q('[data-tube-status]').textContent = message;
    q('[data-tube-desc]').textContent = `أنبوب ممتلئ بتسع كرات؛ دُفعت ${state.pushed} وخرجت ${state.exited} من الطرف الآخر.`;
  }
  function reset() {
    state = createTubeState();
    nodes.clear();
    layer.replaceChildren();
    state.balls.forEach((id, slot) => { const node = ballNode(id); node.classList.toggle('is-marked', id === state.markedId); place(node, slot); });
    report(TUBE_START_STATUS);
  }
  function push(count) {
    const before = state;
    const markedBefore = markedSlot(before);
    state = pushBalls(before, count);
    for (const id of before.lastOut) { nodes.get(id)?.remove(); nodes.delete(id); }
    for (const id of before.lastIn) nodes.get(id)?.classList.remove('is-new');
    state.lastIn.forEach((id, i) => {
      const node = ballNode(id);
      node.classList.add('is-new');
      place(node, -(i + 1));
      node.getBoundingClientRect();
    });
    state.balls.forEach((id, slot) => place(nodes.get(id), slot));
    state.lastOut.forEach((id) => { const node = nodes.get(id); node.classList.add('is-out'); place(node, before.balls.indexOf(id) + count); });
    const arrow = q('[data-tube-arrow]');
    arrow.classList.add('is-active');
    clearTimeout(arrowTimer);
    arrowTimer = setTimeout(() => arrow.classList.remove('is-active'), 600);
    const slot = markedSlot(state);
    let message = `دفعتَ ${count === 1 ? 'كرة واحدة' : `${ballsText(count)} معاً`}، فخرجت ${ballsText(count)} من الطرف الآخر في اللحظة نفسها.`;
    if (slot >= 0) message += ` الكرة التي خرجت ليست الكرة التي دفعتها، والكرة المميّزة تقدّمت حتى الآن ${slotsText(slot)} فقط: الذي انتقل عبر الأنبوب كله هو التأثير.`;
    else if (markedBefore >= 0) message += ` خرجت الكرة المميّزة الآن بعد دفع ${ballsText(state.pushed)} بالمجموع، أما أثر الدفعة الأولى فظهر عند الطرف الآخر فوراً.`;
    else message += ' الكرة المميّزة خرجت سابقاً؛ اضغط «إعادة الضبط» لتتبّعها من جديد.';
    report(message);
    if (!q('[data-sim-conclusion]').hidden || state.pushed >= 3) {
      buildConclusion(root, 'الكرات موجودة في الأنبوب سلفاً، وما ينتقل فوراً إلى الطرف الآخر هو أثر الدفع لا الكرة المدفوعة نفسها. وبالمثل: الإلكترونات الحرة موجودة في الناقل، والمولّد يسبب حركتها في اتجاه واحد — وهذا هو التيار المتواصل.');
    }
  }
  root.querySelectorAll('[data-tube-push]').forEach((button) => button.addEventListener('click', () => push(Number(button.dataset.tubePush))));
  q('[data-tube-reset]').addEventListener('click', () => {
    reset();
    q('[data-sim-conclusion]').hidden = true;
    resetPrediction(root);
  });
  reset();
}

export function mountUnit2l2Simulations(scope) {
  scope.querySelectorAll('[data-prediction]').forEach((block) => mountPrediction(block.closest('[data-u2l2-sim]') ?? block.parentElement));
  scope.querySelectorAll('[data-u2l2-sim="tube"]').forEach(mountTubeLab);

  scope.querySelectorAll('[data-u2l2-sim="current"]').forEach((root) => {
    const q = (s) => root.querySelector(s);
    function update() {
      const charge = Number(q('#cq').value);
      const time = Number(q('#ct').value);
      root.querySelectorAll('[data-u2l2-input]').forEach((inp) => {
        const out = root.querySelector(`output[for="${inp.id}"]`);
        if (out) out.innerHTML = `<bdi dir="ltr">${inp.value} ${inp.id === 'cq' ? 'C' : 's'}</bdi>`;
      });
      const r = currentFromChargeTime(charge, time);
      const later = chargeFromCurrentTime(r.current, time * 3);
      q('[data-current-i]').innerHTML = `<bdi dir="ltr">${fmt(r.current)} A</bdi>`;
      q('[data-current-q3]').innerHTML = `<bdi dir="ltr">${fmt(later.charge)} C</bdi>`;
      q('[data-current-equation]').innerHTML = currentEquation(charge, time, r.current);
      q('[data-current-status]').innerHTML = `شدة التيار <bdi dir="ltr">${fmt(r.current)} A</bdi>: تمر <bdi dir="ltr">${fmt(charge)} C</bdi> خلال <bdi dir="ltr">${fmt(time)} s</bdi>. إذا بقي التيار ثابتاً فإن كمية الكهرباء خلال ثلاثة أمثال الزمن تساوي <bdi dir="ltr">${fmt(later.charge)} C</bdi>.`;
      q('[data-current-desc]').textContent = `تيار متواصل شدته ${fmt(r.current)} أمبير.`;
      q('[data-current-label]').textContent = `I = ${fmt(r.current)} A`;
    }
    root.addEventListener('input', () => {
      update();
      buildConclusion(root, 'العلاقة بين الشدة والكمية والزمن تعني أن شدة التيار هي كمية الكهرباء المارّة في واحدة الزمن؛ مضاعفة كمية الكهرباء مع بقاء الزمن تضاعف الشدة، ومضاعفة الزمن مع بقاء الكمية تنصّفها.');
    });
    q('[data-current-reset]').addEventListener('click', () => {
      q('#cq').value = '60';
      q('#ct').value = '30';
      update();
      q('[data-sim-conclusion]').hidden = true;
      resetPrediction(root);
    });
    update();
  });

  scope.querySelectorAll('[data-u2l2-sim="circuit"]').forEach((root) => {
    const q = (s) => root.querySelector(s);
    let mode = 'series';
    let removed = false;
    /* `hidden` is an HTML attribute and does nothing on an SVG <g>, so the two
       canvases are switched with a class as well; otherwise both drawings were
       painted on top of each other. */
    const setCanvas = () => {
      root.querySelectorAll('[data-circuit-canvas-group]').forEach((group) => {
        const active = group.dataset.circuitCanvasGroup === mode;
        group.hidden = !active;
        group.classList.toggle('is-hidden', !active);
      });
    };
    const setLamps = (on) => {
      root.querySelectorAll('[data-lamp]').forEach((lamp) => {
        const isOn = typeof on === 'function' ? on(lamp.dataset.lamp) : on;
        lamp.classList.toggle('is-off', !isOn);
        lamp.querySelectorAll('[data-bulb]').forEach((bulb) => bulb.classList.toggle('is-lit', isOn));
        lamp.querySelector('[data-lamp-x]')?.classList.toggle('is-hidden', isOn);
      });
    };
    function update() {
      const i1 = Number(q('#ci1').value);
      const i2 = Number(q('#ci2').value);
      root.querySelectorAll('[data-u2l2-input]').forEach((inp) => {
        const out = root.querySelector(`output[for="${inp.id}"]`);
        if (out) out.innerHTML = `<bdi dir="ltr">${inp.value} mA</bdi>`;
      });
      setCanvas();
      root.querySelectorAll('[data-circuit-mode]').forEach((btn) => {
        btn.setAttribute('aria-pressed', btn.dataset.circuitMode === mode && !removed ? 'true' : 'false');
      });
      q('[data-circuit-remove]').setAttribute('aria-pressed', removed ? 'true' : 'false');
      const source = q('[data-circuit-src]');
      const state = q('[data-circuit-state]');
      const status = q('[data-circuit-status]');
      if (mode === 'series') {
        const s = seriesCurrents(i1, 2);
        q('[data-series-a1]').textContent = `${i1} mA`;
        q('[data-series-a2]').textContent = `${i1} mA`;
        if (removed) {
          source.textContent = '0 mA';
          state.textContent = 'مقطوعة';
          status.textContent = 'نزع جزء على التسلسل يقطع التيار عن الدارة كلها.';
          setLamps(false);
          q('[data-circuit-desc]').textContent = 'دارة تسلسل مفتوحة: التيار صفر.';
          buildConclusion(root, 'على التسلسل مسار واحد: نزع أي جزء يفتح المسار، فينقطع التيار عن الدارة كلها وتنطفئ المصابيح.');
          return;
        }
        source.innerHTML = `<bdi dir="ltr">${s.currents[0]} mA</bdi>`;
        state.textContent = 'I ثابت';
        status.textContent = `على التسلسل التيار نفسه في كل جزء: ${i1} mA عند A₁ و${i1} mA عند A₂.`;
        setLamps(true);
        q('[data-circuit-desc]').textContent = 'دارة تسلسل مغلقة والتيار ثابت في كل أجزائها.';
        buildConclusion(root, 'شدة التيار ثابتة في جميع أجزاء الدارة الموصولة على التسلسل؛ نزع مصباح منها يقطع التيار عن الدارة كلها.');
        return;
      }
      q('[data-parallel-a1]').textContent = `${i1} mA`;
      q('[data-parallel-a2]').textContent = removed ? '0 mA' : `${i2} mA`;
      const total = removed ? i1 : parallelTotal([i1, i2]).total;
      q('[data-parallel-a]').textContent = `${total} mA`;
      source.innerHTML = `<bdi dir="ltr">${total} mA</bdi>`;
      if (removed) {
        state.textContent = 'فرع واحد يعمل';
        status.textContent = `نزع جهاز من فرع يبقي التيار في الفرع الآخر: التيار الأصلي أصبح ${i1} mA.`;
        setLamps((index) => index === '1');
        q('[data-circuit-desc]').textContent = 'تفرع مع فرع مفتوح: يبقى التيار في الفرع المغلق.';
        buildConclusion(root, 'في الوصل على التفرع يكون التيار في الدارة الأصلية مساوياً لمجموع التيارات في الفروع المختلفة؛ ونزع أحد الأجهزة يبقي التيار في بقية الفروع.');
        return;
      }
      state.textContent = 'I = I₁ + I₂';
      status.textContent = `على التفرع ${i1} + ${i2} = ${total} mA.`;
      setLamps(true);
      q('[data-circuit-desc]').textContent = 'دارة تفرع والتيار الأصلي مجموع الفرعين.';
      buildConclusion(root, 'في الوصل على التفرع تختلف شدات التيار في الفروع، وشدة التيار في الدارة الأصلية تساوي مجموع شدات التيار في الفروع.');
    }
    q('[data-circuit-mode="series"]').addEventListener('click', () => { mode = 'series'; removed = false; update(); });
    q('[data-circuit-mode="parallel"]').addEventListener('click', () => { mode = 'parallel'; removed = false; update(); });
    q('[data-circuit-remove]').addEventListener('click', () => { removed = true; update(); });
    q('[data-circuit-reset]').addEventListener('click', () => {
      mode = 'series'; removed = false; q('#ci1').value = '200'; q('#ci2').value = '100';
      q('[data-sim-conclusion]').hidden = true;
      resetPrediction(root);
      update();
    });
    root.addEventListener('input', update);
    update();
  });
}
