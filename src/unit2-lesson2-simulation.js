import { formula } from './math.js';
import { currentFromChargeTime, chargeFromCurrentTime, seriesCurrents, parallelTotal } from './unit2-lesson2-physics.js';

const fmt = (v) => {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1000 || (a < 0.01 && a > 0)) return v.toExponential(2);
  return String(Number(v.toFixed(4)));
};

function rng(id, label, min, max, step, val, unit) {
  return `<div class="simulation-control"><div class="simulation-control-heading"><label for="${id}">${label}</label><output class="simulation-control-value" for="${id}"><bdi dir="ltr">${val} ${unit}</bdi></output></div><input class="simulation-range" id="${id}" data-u2l2-input type="range" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}"/><div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">${min} ${unit}</bdi><bdi dir="ltr">${max} ${unit}</bdi></div></div>`;
}

export function unit2l2SimulationMarkup(id) {
  if (id === 'current-lab') {
    return `<aside class="simulation-experience u2l2-sim" data-u2l2-sim="current" aria-labelledby="current-lab-title">
  <header class="simulation-header"><div><span class="simulation-badge">تجربة تفاعلية</span><span class="simulation-model-label">Educational simplified model · نموذج تعليمي مبسّط</span></div>
  <h3 id="current-lab-title">مختبر شدة التيار I = q / t</h3>
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
   <p class="u2l2-predict">تحقق: عند قيم الكتاب q = 60 C و t = 30 s يجب أن تحصل على I = 2 A.</p>
  </section>
  <figure class="simulation-visual"><div class="simulation-svg-wrap"><svg viewBox="0 0 720 280" role="img" aria-labelledby="cl-title cl-desc"><title id="cl-title">تمثيل I = q/t</title><desc id="cl-desc" data-current-desc>شدة التيار تتغير مع q و t.</desc>
   <rect x="80" y="80" width="560" height="80" rx="40" fill="#e8eef6" stroke="#9db4c0"/>
   <circle class="u2-electron" cx="160" cy="120" r="10"/><circle class="u2-electron" cx="240" cy="120" r="10"/><circle class="u2-electron" cx="320" cy="120" r="10"/><circle class="u2-electron" cx="400" cy="120" r="10"/><circle class="u2-electron" cx="480" cy="120" r="10"/>
   <text x="360" y="50" class="u2-label" text-anchor="middle" data-current-label>I</text>
  </svg></div>
  <figcaption>${formula('I=\\\\frac{q}{t}', 'I equals q over t')}</figcaption></figure></div></aside>`;
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

export function mountUnit2l2Simulations(scope) {
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
      q('[data-current-status]').textContent = `I = q/t = ${fmt(charge)}/${fmt(time)} = ${fmt(r.current)} A. إذا بقي التيار ثابتاً فإن كمية الكهرباء خلال ثلاثة أمثال الزمن تساوي ${fmt(later.charge)} C.`;
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
