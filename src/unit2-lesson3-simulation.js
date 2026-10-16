import {
  convertPotentialDifference,
  missingSeriesPotentialDifference,
  parallelPotentialDifferences,
  waterFlowDirection,
} from './unit2-lesson3-physics.js';

const formatNumber = (value) => new Intl.NumberFormat('en-GB', { maximumFractionDigits: 6 }).format(value);
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function conversionMarkup() {
  return `<section class="p3-interactive p3-converter" data-u2l3-sim="conversion" aria-labelledby="p3-converter-title">
    <header class="p3-interactive-heading"><span class="p3-interactive-tag">تدريب تفاعلي · شرح المنصة</span><h3 id="p3-converter-title">بدّل وحدة فرق الكمون</h3><p>اختر القيمة والوحدتين، ثم تحقّق من التحويل. اكتب أرقاماً موجبة.</p></header>
    <div class="p3-controls p3-converter-controls">
      <label>القيمة <input type="number" inputmode="decimal" min="0" step="any" value="0.7" data-convert-value /></label>
      <label>من <select data-convert-from><option value="kV" selected>kV · كيلو فولت</option><option value="V">V · فولت</option><option value="mV">mV · ميلي فولت</option></select></label>
      <span class="p3-converter-arrow" aria-hidden="true">←</span>
      <label>إلى <select data-convert-to><option value="kV">kV · كيلو فولت</option><option value="V" selected>V · فولت</option><option value="mV">mV · ميلي فولت</option></select></label>
      <button class="p3-action-button" type="button" data-convert-submit>حوّل القيمة</button>
    </div>
    <output class="p3-live-output" data-convert-result role="status" aria-live="polite">أدخل قيمة ثم اضغط «حوّل القيمة».</output>
    <p class="p3-hint">تذكّر: <bdi dir="ltr">1 kV = 1000 V</bdi> و<bdi dir="ltr">1 V = 1000 mV</bdi>.</p>
  </section>`;
}

function waterFlowMarkup() {
  return `<section class="p3-interactive p3-water-lab" data-u2l3-sim="water-flow" aria-labelledby="p3-water-lab-title">
    <header class="p3-interactive-heading"><span class="p3-interactive-tag">مختبر تفاعلي · نموذج تعليمي مبسّط</span><h3 id="p3-water-lab-title">غيّر المنسوب وافتح الصنبور</h3><p>اضبط مستويَي الماء، ثم افتح الصنبور ولاحظ اتجاه الجريان في هذا التشبيه.</p></header>
    <div class="p3-model-notice" role="note"><strong>نموذج تعليمي مبسّط</strong><span>يعرض النموذج اتجاه الجريان فقط ولا يحاكي زمن انتقال الماء أو تغير حجمه. منسوب الماء تشبيه لفرق الكمون، وليس فولتاً؛ الماء ليس شحنة كهربائية.</span></div>
    <div class="p3-water-workbench">
      <div class="p3-water-controls">
        <label class="p3-range-control" for="p3-water-level-a"><span>مستوى الوعاء (أ)</span><output data-water-level-label="a">7</output><input id="p3-water-level-a" type="range" min="0" max="10" step="1" value="7" data-water-level="a" /></label>
        <label class="p3-range-control" for="p3-water-level-b"><span>مستوى الوعاء (ب)</span><output data-water-level-label="b">3</output><input id="p3-water-level-b" type="range" min="0" max="10" step="1" value="3" data-water-level="b" /></label>
        <div class="p3-action-row"><button class="p3-action-button" type="button" data-water-tap="open" aria-pressed="false">افتح الصنبور</button><button class="p3-quiet-button" type="button" data-water-tap="close" aria-pressed="true">أغلق الصنبور</button></div>
        <output class="p3-live-output" data-water-status role="status" aria-live="polite">الصنبور مغلق؛ لا يوجد جريان.</output>
      </div>
      <figure class="p3-water-visual"><svg class="p3-svg" viewBox="0 0 640 300" role="img" aria-labelledby="p3-water-svg-title p3-water-svg-desc">
        <title id="p3-water-svg-title">وعاءان متصلان وصنبور قابل للفتح</title><desc id="p3-water-svg-desc" data-water-svg-desc>مستوى الماء في الوعاء أ أعلى من الوعاء ب، والصنبور مغلق.</desc>
        <path class="p3-tank-outline" d="M90 45v180q0 16 16 16h92q16 0 16-16V45M426 45v180q0 16 16 16h92q16 0 16-16V45"/>
        <rect class="p3-water-fill" x="96" y="96" width="112" height="129" data-water-fill="a"/>
        <rect class="p3-water-fill" x="432" y="148" width="112" height="77" data-water-fill="b"/>
        <path class="p3-water-surface" d="M96 96h112M432 148h112" data-water-surface="a" data-level="7"/><path class="p3-water-surface" d="M432 148h112" data-surface-level="b"/>
        <path class="p3-water-connector" d="M150 241v25h340v-25"/><path class="p3-tap-handle" d="M320 266v17m-14 0h28m-21-17h14" data-water-valve-icon/>
        <path class="p3-water-arrow" d="M454 253H186" data-water-flow-arrow/><path class="p3-water-arrow-head" d="m186 253 18-10v20z" data-water-flow-head/>
        <text x="150" y="35" class="p3-panel-title" text-anchor="middle" direction="rtl">الوعاء (أ)</text><text x="486" y="35" class="p3-panel-title" text-anchor="middle" direction="rtl">الوعاء (ب)</text>
        <text x="320" y="293" class="p3-panel-note" text-anchor="middle" direction="rtl" data-water-diagram-caption>اتجاه الجريان يتحدد بفرق المنسوب</text>
      </svg></figure>
    </div>
  </section>`;
}

function voltageSplitMarkup() {
  return `<section class="p3-interactive p3-split-lab" data-u2l3-sim="voltage-split" aria-labelledby="p3-split-title">
    <header class="p3-interactive-heading"><span class="p3-interactive-tag">مختبر حسابي · شرح المنصة</span><h3 id="p3-split-title">قارن التسلسل والتفرع</h3><p>ابدأ بقيم نشاط الكتاب، ثم غيّرها لتختبر القاعدة. لا يحاكي هذا المختبر مكونات أو مقاومات؛ إنه يحسب علاقات فرق الكمون فقط.</p></header>
    <div class="p3-rule-lab">
      <label for="p3-circuit-mode">نوع التوصيل</label>
      <select id="p3-circuit-mode" data-voltage-mode><option value="series" selected>على التسلسل</option><option value="parallel">على التفرع</option></select>
      <label for="p3-total-voltage">فرق كمون المولد U (V)</label><input id="p3-total-voltage" type="number" min="0" step="any" value="12" inputmode="decimal" data-total-voltage />
      <label for="p3-known-voltage" data-known-label>فرق كمون المصباح الثاني U₂ (V)</label><input id="p3-known-voltage" type="number" min="0" step="any" value="5" inputmode="decimal" data-known-voltage />
      <button class="p3-action-button" type="button" data-voltage-calculate>احسب فرق الكمون</button>
      <button class="p3-quiet-button" type="button" data-voltage-reset>إعادة القيم الأصلية</button>
      <output class="p3-live-output p3-split-output" data-voltage-result role="status" aria-live="polite">المتبقي على المصباح الأول هو 7 V.</output>
    </div>
    <div class="p3-rule-reference"><div><span class="p3-rule-chip">التسلسل</span><bdi dir="ltr">U = U₁ + U₂</bdi><small>مجموع الفروق الجزئية يساوي فرق المولد.</small></div><div><span class="p3-rule-chip">التفرع</span><bdi dir="ltr">U = U₁ = U₂</bdi><small>فرق الكمون متساوٍ في فروع الدارة.</small></div></div>
  </section>`;
}

function quickPracticeMarkup() {
  return `<section class="p3-interactive p3-practice" data-u2l3-sim="quick-practice" aria-labelledby="p3-practice-title">
    <header class="p3-interactive-heading"><span class="p3-interactive-tag">تدريب تفاعلي · أسئلة من المنصة</span><h3 id="p3-practice-title">تدرّب قبل اختبار الدرس</h3><p>أجب عن المسائل الثلاث ثم اضغط «تحقق من التدريب». هذه ليست أسئلة اختبار الدرس.</p></header>
    <div class="p3-practice-grid">
      <label class="p3-practice-item"><span><bdi dir="ltr">U = 15 V</bdi> و<bdi dir="ltr">U₂ = 4 V</bdi> على التسلسل. أوجد <bdi dir="ltr">U₁</bdi>.</span><span class="p3-practice-entry"><input type="number" min="0" step="any" inputmode="decimal" aria-label="فرق كمون المصباح الأول في تدريب التسلسل" data-practice-series/><bdi dir="ltr">V</bdi></span></label>
      <label class="p3-practice-item"><span>مولد <bdi dir="ltr">9 V</bdi> ومصباحان، وقراءة كل مصباح <bdi dir="ltr">9 V</bdi>. ما نوع التوصيل؟</span><select aria-label="نوع التوصيل في التدريب الثاني" data-practice-topology><option value="">اختر</option><option value="series">تسلسل</option><option value="parallel">تفرع</option></select></label>
      <label class="p3-practice-item"><span>يوصل الفولتميتر على التسلسل مع المصباح.</span><select aria-label="صح أو خطأ في التدريب الثالث" data-practice-meter><option value="">اختر</option><option value="true">صح</option><option value="false">خطأ</option></select></label>
    </div>
    <div class="p3-practice-actions"><button class="p3-action-button" type="button" data-practice-submit>تحقق من التدريب</button><button class="p3-quiet-button" type="button" data-practice-reset>امسح الإجابات</button><output class="p3-live-output" data-practice-result role="status" aria-live="polite">لن تظهر الملاحظات إلا بعد ضغط زر التحقق.</output></div>
  </section>`;
}

const MARKUP = Object.freeze({
  conversion: conversionMarkup,
  'water-flow': waterFlowMarkup,
  'voltage-split': voltageSplitMarkup,
  'quick-practice': quickPracticeMarkup,
});

export function unit2l3SimulationMarkup(id) {
  const render = MARKUP[id];
  if (!render) throw new RangeError(`Unknown Unit 2 Lesson 3 interaction: ${id}`);
  return render();
}

function numberFrom(input) {
  const text = input?.value?.trim() ?? '';
  if (!text) return Number.NaN;
  return Number(text);
}

function mountWaterLab(root) {
  const panel = root.querySelector('[data-u2l3-sim="water-flow"]');
  if (!panel) return;
  const aInput = panel.querySelector('[data-water-level="a"]');
  const bInput = panel.querySelector('[data-water-level="b"]');
  const aFill = panel.querySelector('[data-water-fill="a"]');
  const bFill = panel.querySelector('[data-water-fill="b"]');
  const aSurface = panel.querySelector('[data-water-surface="a"]');
  const bSurface = panel.querySelector('[data-surface-level="b"]');
  const status = panel.querySelector('[data-water-status]');
  const desc = panel.querySelector('[data-water-svg-desc]');
  const arrow = panel.querySelector('[data-water-flow-arrow]');
  const arrowHead = panel.querySelector('[data-water-flow-head]');
  const valve = panel.querySelector('[data-water-valve-icon]');
  let isOpen = false;

  const render = () => {
    const a = numberFrom(aInput);
    const b = numberFrom(bInput);
    const direction = Number.isFinite(a) && Number.isFinite(b) ? waterFlowDirection(a, b, isOpen) : 'closed';
    for (const [key, value] of [['a', a], ['b', b]]) {
      const level = Math.max(0, Math.min(10, Number.isFinite(value) ? value : 0));
      const height = 14 + level * 17;
      const y = 225 - height;
      const fill = key === 'a' ? aFill : bFill;
      const surface = key === 'a' ? aSurface : bSurface;
      fill.setAttribute('y', String(y));
      fill.setAttribute('height', String(height));
      const line = surface;
      if (key === 'a') line.setAttribute('d', `M96 ${y}h112`);
      else line.setAttribute('d', `M432 ${y}h112`);
      panel.querySelector(`[data-water-level-label="${key}"]`).textContent = String(level);
    }
    arrow.hidden = direction !== 'a-to-b' && direction !== 'b-to-a';
    arrowHead.hidden = arrow.hidden;
    if (direction === 'a-to-b') {
      arrow.setAttribute('d', 'M190 253H450');
      arrowHead.setAttribute('d', 'm450 253-18-10v20z');
    } else if (direction === 'b-to-a') {
      arrow.setAttribute('d', 'M450 253H190');
      arrowHead.setAttribute('d', 'm190 253 18-10v20z');
    }
    valve.classList.toggle('is-open', isOpen);
    panel.querySelectorAll('[data-water-tap]').forEach((button) => {
      const active = (button.dataset.waterTap === 'open') === isOpen;
      button.setAttribute('aria-pressed', String(active));
    });
    const directionText = direction === 'a-to-b'
      ? 'الماء يجري من الوعاء (أ) ذي المنسوب الأعلى إلى الوعاء (ب) ذي المنسوب الأدنى.'
      : direction === 'b-to-a'
        ? 'الماء يجري من الوعاء (ب) ذي المنسوب الأعلى إلى الوعاء (أ) ذي المنسوب الأدنى.'
        : direction === 'balanced'
          ? 'المنسوبان متساويان؛ لا يوجد جريان صافٍ بين الوعاءين.'
          : 'الصنبور مغلق؛ لا يوجد جريان.';
    status.textContent = directionText;
    desc.textContent = `${directionText} هذه محاكاة لاتجاه الجريان فقط.`;
  };

  panel.addEventListener('input', (event) => {
    if (event.target.matches('[data-water-level]')) render();
  });
  panel.addEventListener('click', (event) => {
    const button = event.target.closest('[data-water-tap]');
    if (!button) return;
    isOpen = button.dataset.waterTap === 'open';
    render();
  });
  render();
}

function mountVoltageSplitLab(root) {
  const panel = root.querySelector('[data-u2l3-sim="voltage-split"]');
  if (!panel) return;
  const mode = panel.querySelector('[data-voltage-mode]');
  const totalInput = panel.querySelector('[data-total-voltage]');
  const knownInput = panel.querySelector('[data-known-voltage]');
  const knownLabel = panel.querySelector('[data-known-label]');
  const result = panel.querySelector('[data-voltage-result]');
  const run = () => {
    const total = numberFrom(totalInput);
    if (!Number.isFinite(total) || total < 0) {
      result.textContent = 'أدخل قيمة موجبة أو صفراً لفرق كمون المولد.';
      totalInput.focus();
      return;
    }
    try {
      if (mode.value === 'parallel') {
        const [branchOne, branchTwo] = parallelPotentialDifferences(total, 2);
        result.textContent = `U₁ = U₂ = ${formatNumber(branchOne)} V؛ فرق الكمون في كل فرع يساوي فرق كمون المولد (${formatNumber(branchTwo)} V).`;
        return;
      }
      const known = numberFrom(knownInput);
      if (!Number.isFinite(known) || known < 0) {
        result.textContent = 'أدخل فرق الكمون المعروف في الدارة المتسلسلة.';
        knownInput.focus();
        return;
      }
      const missing = missingSeriesPotentialDifference(total, known);
      result.textContent = `U₁ = U − U₂ = ${formatNumber(total)} − ${formatNumber(known)} = ${formatNumber(missing)} V.`;
    } catch {
      result.textContent = 'لا يمكن أن يتجاوز فرق الكمون الجزئي فرق كمون المولد في هذا النموذج.';
      knownInput.focus();
    }
  };
  const updateMode = () => {
    const parallel = mode.value === 'parallel';
    knownInput.disabled = parallel;
    knownLabel.textContent = parallel ? 'القيمة غير مستخدمة في التفرع' : 'فرق كمون المصباح الثاني U₂ (V)';
    result.textContent = parallel
      ? 'في التفرع، فرق الكمون على كل فرع يساوي فرق كمون المولد.'
      : 'أدخل قيمة، ثم احسب فرق الكمون غير المعروف.';
  };
  panel.addEventListener('change', (event) => {
    if (event.target === mode) updateMode();
  });
  panel.addEventListener('click', (event) => {
    const action = event.target.closest('[data-voltage-calculate], [data-voltage-reset]');
    if (!action) return;
    if (action.matches('[data-voltage-reset]')) {
      mode.value = 'series';
      totalInput.value = '12';
      knownInput.value = '5';
      updateMode();
      result.textContent = 'أعدنا قيم الكتاب: U = 12 V وU₂ = 5 V؛ احسب U₁.';
    } else run();
  });
  updateMode();
  run();
}

function mountConverter(root) {
  const panel = root.querySelector('[data-u2l3-sim="conversion"]');
  if (!panel) return;
  const value = panel.querySelector('[data-convert-value]');
  const from = panel.querySelector('[data-convert-from]');
  const to = panel.querySelector('[data-convert-to]');
  const result = panel.querySelector('[data-convert-result]');
  panel.addEventListener('click', (event) => {
    if (!event.target.closest('[data-convert-submit]')) return;
    const amount = numberFrom(value);
    if (!Number.isFinite(amount) || amount < 0) {
      result.textContent = 'أدخل قيمة عددية موجبة أو صفراً.';
      value.focus();
      return;
    }
    try {
      const converted = convertPotentialDifference(amount, from.value, to.value);
      result.textContent = `${formatNumber(amount)} ${from.value} = ${formatNumber(converted)} ${to.value}`;
    } catch {
      result.textContent = 'تحقق من الوحدتين المختارتين.';
    }
  });
}

function mountQuickPractice(root) {
  const panel = root.querySelector('[data-u2l3-sim="quick-practice"]');
  if (!panel) return;
  const series = panel.querySelector('[data-practice-series]');
  const topology = panel.querySelector('[data-practice-topology]');
  const meter = panel.querySelector('[data-practice-meter]');
  const result = panel.querySelector('[data-practice-result]');
  const setDisabled = (value) => {
    series.disabled = value;
    topology.disabled = value;
    meter.disabled = value;
  };
  panel.addEventListener('click', (event) => {
    if (event.target.closest('[data-practice-reset]')) {
      series.value = '';
      topology.value = '';
      meter.value = '';
      setDisabled(false);
      result.textContent = 'أدخل إجابات جديدة ثم اضغط زر التحقق.';
      return;
    }
    if (!event.target.closest('[data-practice-submit]')) return;
    const seriesValue = numberFrom(series);
    if (!Number.isFinite(seriesValue) || seriesValue < 0 || !topology.value || !meter.value) {
      result.textContent = 'أكمل المسائل الثلاث أولاً.';
      return;
    }
    const checks = [Math.abs(seriesValue - 11) <= 0.01, topology.value === 'parallel', meter.value === 'false'];
    const correct = checks.filter(Boolean).length;
    const feedback = [
      `التسلسل: U₁ = 15 − 4 = 11 V${checks[0] ? '؛ إجابتك صحيحة.' : '؛ الإجابة الصحيحة 11 V.'}`,
      `التساوي بين فرق كل مصباح وفرق المولد يدل على التفرع${checks[1] ? '؛ إجابتك صحيحة.' : '؛ الاختيار الصحيح هو التفرع.'}`,
      `العبارة خطأ؛ يوصل الفولتميتر على التفرع لا على التسلسل${checks[2] ? '؛ إجابتك صحيحة.' : '.'}`,
    ];
    result.textContent = `${correct} من 3 صحيحة. ${feedback.join(' ')}`;
    setDisabled(true);
  });
}

export function mountUnit2Lesson3Simulations(root = document) {
  mountWaterLab(root);
  mountVoltageSplitLab(root);
  mountConverter(root);
  mountQuickPractice(root);
}
