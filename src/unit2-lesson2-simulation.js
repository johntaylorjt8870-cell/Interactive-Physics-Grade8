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
  return m ? `${m[1]}\\times10^{${Number(m[2])}}` : s;
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

function tubeLabMarkup() {
  const start = createTubeState();
  return `<aside class="simulation-experience u2l2-sim u2l2-sim-wide" data-u2l2-sim="tube" aria-labelledby="tube-lab-title">
  <header class="simulation-header"><div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model · نموذج تعليمي مبسّط</span></div>
  <h3 id="tube-lab-title">مختبر الأنبوب والكرات: انتقال التأثير</h3>
  <p>نفّذ الخطوتين 3 و4 من تجربة الكتاب: ادفع كرة جديدة من أحد طرفي الأنبوب، ثم ادفع عدداً من الكرات من الطرف ذاته، وراقب ما يحدث عند الطرف الآخر.</p></header>
  <div class="u2l2-model-notice" role="note" aria-labelledby="tube-notice-title">
   <p class="u2l2-model-notice-title" id="tube-notice-title">نموذج تعليمي مبسّط</p>
   <p>يشرح هذا النموذج <strong>انتقال التأثير</strong> في الدارة: الأنبوب ممتلئ بالكرات سلفاً، لذلك يظهر أثر الدفع عند الطرف الآخر مباشرةً.</p>
   <p>ولا يعني ذلك أن الإلكترونات نفسها تنتقل فوراً من أحد طرفي السلك إلى الطرف الآخر؛ فكل إلكترون يتحرك ببطء مسافة صغيرة، كما تتقدّم الكرة المميّزة خانة واحدة فقط مع كل كرة تدفعها.</p>
  </div>
  <div class="simulation-workbench"><section class="simulation-controls" aria-label="ضوابط الأنبوب">
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
  <figcaption>الكرات تمثّل الإلكترونات الحرة الموجودة سلفاً في السلك، والدفع يمثّل تأثير المولّد.</figcaption></figure></div></aside>`;
}

function rng(id, label, min, max, step, val, unit) {
  return `<div class="simulation-control"><div class="simulation-control-heading"><label for="${id}">${label}</label><output class="simulation-control-value" for="${id}"><bdi dir="ltr">${val} ${unit}</bdi></output></div><input class="simulation-range" id="${id}" data-u2l2-input type="range" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}"/><div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">${min} ${unit}</bdi><bdi dir="ltr">${max} ${unit}</bdi></div></div>`;
}

export function unit2l2SimulationMarkup(id) {
  if (id === 'tube-lab') return tubeLabMarkup();
  if (id === 'current-lab') {
    return `<aside class="simulation-experience u2l2-sim" data-u2l2-sim="current" aria-labelledby="current-lab-title">
  <header class="simulation-header"><div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model · نموذج تعليمي مبسّط</span></div>
  <h3 id="current-lab-title">مختبر شدة التيار ${tex('I=\\dfrac{q}{t}', 'I equals q over t')}</h3>
  <p>غيّر كمية الكهرباء وزمن مرورها. تنبّأ أولاً: إذا تضاعفت q وبقي t، ماذا يحدث لـ I؟ الحدود: النموذج يفترض تياراً متواصلاً ثابتاً في دارة مغلقة، ولا يمثل مقاومة أو حرارة الأسلاك.</p></header>
  <div class="simulation-workbench"><section class="simulation-controls" aria-label="ضوابط التيار">
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
  <figure class="simulation-visual"><div class="simulation-svg-wrap"><svg viewBox="0 0 720 280" role="img" aria-labelledby="cl-title cl-desc"><title id="cl-title">تمثيل شدة التيار: كمية الكهرباء المارّة في وحدة الزمن</title><desc id="cl-desc" data-current-desc>شدة التيار تتغير مع q و t.</desc>
   <rect x="80" y="80" width="560" height="80" rx="40" fill="#e8eef6" stroke="#9db4c0"/>
   <circle class="u2-electron" cx="160" cy="120" r="10"/><circle class="u2-electron" cx="240" cy="120" r="10"/><circle class="u2-electron" cx="320" cy="120" r="10"/><circle class="u2-electron" cx="400" cy="120" r="10"/><circle class="u2-electron" cx="480" cy="120" r="10"/>
   <text x="360" y="50" class="u2-label" text-anchor="middle" data-current-label>I</text>
  </svg></div>
  <figcaption><div class="u2l2-live-equation" data-current-equation>${currentEquation(60, 30, 2)}</div></figcaption></figure></div></aside>`;
  }
  if (id === 'circuit-lab') {
    return `<aside class="simulation-experience u2l2-sim" data-u2l2-sim="circuit" aria-labelledby="circuit-lab-title">
  <header class="simulation-header"><div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model · نموذج تعليمي مبسّط</span></div>
  <h3 id="circuit-lab-title">مختبر التسلسل والتفرع</h3>
  <p>قارن: على التسلسل التيار نفسه في كل جزء؛ على التفرع المجموع يساوي تيار المصدر. نزع مصباح على التسلسل يقطع الكل، وعلى التفرع يبقى الفرع الآخر. النموذج لا يحسب المقاومات.</p></header>
  <div class="simulation-workbench"><section class="simulation-controls" aria-label="ضوابط الدارة">
   <div class="u2l2-steps" role="group">
    <button type="button" data-circuit-mode="series">وصل على التسلسل</button>
    <button type="button" data-circuit-mode="parallel">وصل على التفرع</button>
    <button type="button" data-circuit-remove>انزع مصباحاً</button>
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
  <figure class="simulation-visual"><div class="simulation-svg-wrap"><svg viewBox="0 0 720 280" role="img" aria-labelledby="cc-title cc-desc"><title id="cc-title">دارة تسلسل أو تفرع</title><desc id="cc-desc" data-circuit-desc>دارة.</desc>
   <rect x="40" y="120" width="70" height="40" class="u2-cell"/><text x="75" y="145" class="u2-label" text-anchor="middle">+</text>
   <circle cx="220" cy="80" r="24" class="u2-bulb" data-c-l1/><circle cx="400" cy="80" r="24" class="u2-bulb" data-c-l2/>
   <path class="u2-wire" d="M110 140 H620 V200 H75 V160"/>
  </svg></div>
  <figcaption>على التسلسل I ثابت؛ على التفرع I = I₁ + I₂ ما دامت الفروع مغلقة.</figcaption></figure></div></aside>`;
  }
  return '';
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
    // Balls that left on the previous push are cleared; last push's highlights end.
    for (const id of before.lastOut) { nodes.get(id)?.remove(); nodes.delete(id); }
    for (const id of before.lastIn) nodes.get(id)?.classList.remove('is-new');
    // New balls appear just outside the entry end, then everything moves together.
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
  }
  root.querySelectorAll('[data-tube-push]').forEach((button) => button.addEventListener('click', () => push(Number(button.dataset.tubePush))));
  q('[data-tube-reset]').addEventListener('click', reset);
  reset();
}

export function mountUnit2l2Simulations(scope) {
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
    root.addEventListener('input', update);
    q('[data-current-reset]').addEventListener('click', () => {
      q('#cq').value = '60';
      q('#ct').value = '30';
      update();
    });
    update();
  });

  scope.querySelectorAll('[data-u2l2-sim="circuit"]').forEach((root) => {
    const q = (s) => root.querySelector(s);
    let mode = 'series';
    let removed = false;
    function update() {
      const i1 = Number(q('#ci1').value);
      const i2 = Number(q('#ci2').value);
      root.querySelectorAll('[data-u2l2-input]').forEach((inp) => {
        const out = root.querySelector(`output[for="${inp.id}"]`);
        if (out) out.innerHTML = `<bdi dir="ltr">${inp.value} mA</bdi>`;
      });
      if (removed && mode === 'series') {
        q('[data-circuit-src]').textContent = '0 mA';
        q('[data-circuit-state]').textContent = 'مقطوعة';
        q('[data-circuit-status]').textContent = 'نزع جزء على التسلسل يقطع التيار عن الدارة كلها.';
        q('[data-circuit-desc]').textContent = 'دارة تسلسل مفتوحة: التيار صفر.';
        return;
      }
      if (removed && mode === 'parallel') {
        q('[data-circuit-src]').innerHTML = `<bdi dir="ltr">${i1} mA</bdi>`;
        q('[data-circuit-state]').textContent = 'فرع واحد يعمل';
        q('[data-circuit-status]').textContent = 'نزع جهاز من فرع يبقي التيار في الفرع الآخر.';
        q('[data-circuit-desc]').textContent = 'تفرع مع فرع مفتوح: يبقى التيار في الفرع المغلق.';
        return;
      }
      if (mode === 'series') {
        const s = seriesCurrents(i1, 2);
        q('[data-circuit-src]').innerHTML = `<bdi dir="ltr">${s.currents[0]} mA</bdi>`;
        q('[data-circuit-state]').textContent = 'I ثابت';
        q('[data-circuit-status]').textContent = `على التسلسل التيار نفسه في كل جزء: ${s.currents[0]} mA.`;
        q('[data-circuit-desc]').textContent = 'دارة تسلسل والتيار ثابت.';
      } else {
        const p = parallelTotal([i1, i2]);
        q('[data-circuit-src]').innerHTML = `<bdi dir="ltr">${p.total} mA</bdi>`;
        q('[data-circuit-state]').textContent = 'I = I1 + I2';
        q('[data-circuit-status]').textContent = `على التفرع ${i1} + ${i2} = ${p.total} mA.`;
        q('[data-circuit-desc]').textContent = 'دارة تفرع والتيار الأصلي مجموع الفرعين.';
      }
    }
    q('[data-circuit-mode="series"]').addEventListener('click', () => { mode = 'series'; removed = false; update(); });
    q('[data-circuit-mode="parallel"]').addEventListener('click', () => { mode = 'parallel'; removed = false; update(); });
    q('[data-circuit-remove]').addEventListener('click', () => { removed = true; update(); });
    q('[data-circuit-reset]').addEventListener('click', () => {
      mode = 'series'; removed = false; q('#ci1').value = '200'; q('#ci2').value = '100'; update();
    });
    root.addEventListener('input', update);
    update();
  });
}
