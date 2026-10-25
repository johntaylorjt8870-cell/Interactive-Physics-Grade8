/* Interactive, clearly-labelled platform labs for Unit 2 Lesson 4.
 *
 * Six exploratory labs (heat, ohm, wire, network, colour, rheostat). The two
 * textbook experiments that ask the student to *record* meter readings (series
 * and parallel, pp113–115) live in unit2-lesson4-practice.js because they are
 * graded tasks, not open exploration.
 *
 * Rules shared with the practice layer:
 *   - every lab is a model, not a measurement from the book; the tag says so;
 *   - every control is a native input/select/button and drives the model;
 *   - outputs are polite live regions, values are formatted, and impossible
 *     inputs can never print NaN/∞;
 *   - reset restores the initial physical state of that lab only.
 */
import { graph } from './unit2-lesson4-diagrams.js';
import {
  colourResistance, formatNumber, heatLabModel, metalWireResistance, network, ohmCurrent, rheostatModel,
} from './unit2-lesson4-physics.js';
import { formula } from './math.js';

const esc = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const num = (value) => formatNumber(value, 3);
const tag = (text) => `<span class="r4-lab-tag">${text}</span>`;

const range = (id, label, min, max, value, step = 1, unit = '') => `<label class="r4-field" for="${id}">
  <span class="r4-field-label">${label}</span>
  <span class="r4-field-row"><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-default="${value}" />
  <output class="r4-value" id="${id}-value" for="${id}" dir="ltr">${value}${unit ? ` ${unit}` : ''}</output></span>
</label>`;

const select = (id, label, options, selected) => `<label class="r4-field" for="${id}">
  <span class="r4-field-label">${label}</span>
  <select id="${id}" data-default="${selected}">${options.map(([value, copy]) => `<option value="${value}"${String(value) === String(selected) ? ' selected' : ''}>${copy}</option>`).join('')}</select>
</label>`;

const reset = (id, label = 'إعادة ضبط المختبر') => `<button class="r4-quiet-button" type="button" data-lab-reset="${id}">${label}</button>`;

const shell = (id, title, lead, tagText, body, note) => `<section class="r4-lab" data-u2l4-sim="${id}" aria-labelledby="${id}-lab-title">
  <header class="r4-lab-head">${tag(tagText)}<h3 id="${id}-lab-title">${title}</h3><p>${lead}</p></header>
  ${body}
  <p class="r4-lab-note">${note}</p>
</section>`;

const COLOURS = Object.freeze([
  ['أسود', '#141414'], ['بني', '#6f431f'], ['أحمر', '#c92a2a'], ['برتقالي', '#e8590c'],
  ['أصفر', '#f2c200'], ['أخضر', '#2f8f46'], ['أزرق', '#2b5fc4'], ['بنفسجي', '#7b3fa0'],
  ['رمادي', '#8b8b8b'], ['أبيض', '#f7f7f2'],
]);

/* ------------------------------------------------------------------------- */
/* Markup                                                                     */
/* ------------------------------------------------------------------------- */

function heatMarkup() {
  const initial = heatLabModel(0);
  return shell('heat', 'المصدر ثابت… والمسار يتغيّر',
    'نمثّل المصباح بمقاومة أومية ثابتة مقدارها 6 Ω ومصدراً مثالياً 6 V. المصباح الحقيقي ليس أومياً في كل درجات الحرارة.',
    'مختبر افتراضي من المنصة · ليس قياساً من الكتاب',
    `<div class="r4-lab-layout">
      <div class="r4-lab-controls">
        ${range('heat-added', 'المقاومة المضافة على التسلسل (Ω)', 0, 18, 0, 1)}
        <div class="r4-button-row">${reset('heat')}</div>
      </div>
      <div class="r4-lab-stage">
        <div class="r4-lamp-stage" data-heat-lamp data-lit="false" aria-hidden="true"><span class="r4-lamp-glow"></span><span class="r4-lamp-text">مصباح 6 Ω</span></div>
        <div class="r4-meter" role="status" aria-live="polite">
          <span class="r4-meter-label">شدة التيار</span><strong data-heat-current>${num(initial.current)} A</strong>
        </div>
        <div class="r4-readouts">
          <div><span>المقاومة الكلية</span><strong data-heat-resistance>${num(initial.totalResistance)} Ω</strong></div>
          <div><span>فرق الكمون على المصباح</span><strong data-heat-voltage>${num(initial.lampVoltage)} V</strong></div>
          <div><span>القدرة في المصباح</span><strong data-heat-power>${num(initial.lampPower)} W</strong></div>
        </div>
      </div>
    </div>`,
    'القيم ناتجة عن النموذج عند ثبات المصدر، وليست قراءات مصباح مقيسة. زيادة المقاومة المضافة تقلّل التيار والقدرة عادةً، لكنها لا تعني أن المقاومة «تستهلك الشحنة».');
}

function ohmMarkup() {
  const u = 4, r = 4;
  return shell('ohm', 'اصنع نقطة على الخط',
    'غيّر فرق الكمون والمقاومة، وراقب شدة التيار والموضع على الخط. الخط المستقيم يمرّ بالأصل لأن النموذج أومي حراري الثبات.',
    'نموذج أومي من المنصة · حرارة ثابتة',
    `<div class="r4-lab-layout">
      <div class="r4-lab-controls">
        ${range('ohm-u', 'فرق الكمون U (V)', 0, 16, u, 0.5, 'V')}
        ${range('ohm-r', 'المقاومة R (Ω)', 2, 8, r, 1, 'Ω')}
        <div class="r4-button-row">${reset('ohm')}</div>
      </div>
      <div class="r4-lab-stage">
        <div class="r4-meter" role="status" aria-live="polite">
          <span class="r4-meter-label">شدة التيار</span><strong data-ohm-current>${num(ohmCurrent(u, r))} A</strong>
          <span class="r4-meter-note" data-ohm-equation>I = U / R = 4 / 4 = 1 A</span>
        </div>
        <div class="r4-live-graph" data-ohm-graph>${graph([{ i: 0, u: 0 }, { i: 1, u: 4 }], { id: 'r4-live-ohm', maxI: 8, maxU: 16, active: { i: 1, u: 4 } })}</div>
      </div>
    </div>`,
    'المقاومة في هذا النموذج ثابتة مع الحرارة؛ لا تُعمّم النتيجة على فتيل ساخن أو LED. النقطة الحمراء هي وضع القياس الحالي، والخط يمثل العلاقة U = R·I.');
}

function wireMarkup() {
  const rho = 1.7, length = 2, area = 1;
  const initial = metalWireResistance(rho * 1e-8, length, area);
  return shell('wire', 'ثبّت عاملين وغيّر الثالث',
    'اختر مادة (بمقاومة نوعية توضيحية)، وطولاً، ومساحة مقطع بوحدة المليمتر المربع. النموذج يحسب مقاومة سلك معدني بالعلاقة R = ρℓ/S.',
    'نموذج حسابي من المنصة · ليس عيّنة من مادة محددة',
    `<div class="r4-lab-layout">
      <div class="r4-lab-controls">
        ${range('wire-rho', 'المقاومة النوعية (×10⁻⁸ Ω·m)', 1, 5, rho, 0.1)}
        ${range('wire-length', 'الطول ℓ (m)', 1, 10, length, 0.5, 'm')}
        ${range('wire-area', 'مساحة المقطع (mm²)', 0.5, 5, area, 0.5, 'mm²')}
        <div class="r4-button-row">${reset('wire')}</div>
      </div>
      <div class="r4-lab-stage">
        <div class="r4-meter" role="status" aria-live="polite">
          <span class="r4-meter-label">مقاومة السلك</span><strong data-wire-resistance>${num(initial)} Ω</strong>
        </div>
        <div class="r4-readouts">
          <div><span>الطول</span><strong data-wire-length>2 m</strong></div>
          <div><span>المساحة</span><strong data-wire-area>1 mm²</strong></div>
          <div><span>ρ</span><strong data-wire-rho>1.7×10⁻⁸ Ω·m</strong></div>
        </div>
        <p class="r4-model-note">ضاعف الطول ← تتضاعف المقاومة. ضاعف المساحة ← تنقص إلى النصف. غيّر ρ وحدها ← تتغيّر المقاومة بالتناسب.</p>
      </div>
    </div>`,
    'المقاومة النوعية المختارة قيمة توضيحية قريبة من رتبة المعادن، وليست تعريفاً لمادة بعينها. الوحدة في القانون: ρ بالأوم·متر، ℓ بالمتر، S بالمتر المربع.');
}

function networkMarkup() {
  const initial = network(12, 3, 3, 'series');
  return shell('network', 'أعد توصيل المقاومتين',
    'قارن بين التسلسل والتفرع عند المصدر نفسه. أغلق القاطعة ثم اقرأ المقاومة المكافئة والتيارات وفروق الكمون.',
    'دارة مثالية من المنصة · ليست تجربة عملية مقيسة',
    `<div class="r4-lab-layout">
      <div class="r4-lab-controls">
        <fieldset class="r4-mode-field"><legend>طريقة الوصل</legend>
          <label><input type="radio" name="r4-network-mode" value="series" checked /> تسلسل</label>
          <label><input type="radio" name="r4-network-mode" value="parallel" /> تفرع</label>
        </fieldset>
        ${range('network-u', 'المصدر U (V)', 2, 24, 12, 1, 'V')}
        ${range('network-r1', 'R₁ (Ω)', 1, 12, 3, 1, 'Ω')}
        ${range('network-r2', 'R₂ (Ω)', 1, 12, 3, 1, 'Ω')}
        <div class="r4-button-row">
          <button class="r4-action-button" type="button" data-network-switch="close" aria-pressed="false">أغلق القاطعة</button>
          <button class="r4-quiet-button" type="button" data-network-switch="open" aria-pressed="true">افتح القاطعة</button>
          ${reset('network')}
        </div>
      </div>
      <div class="r4-lab-stage">
        <div class="r4-circuit-stage" data-network-circuit>${circuitMarkup('series')}</div>
        <div class="r4-meter" role="status" aria-live="polite">
          <span class="r4-meter-label">المقاومة المكافئة</span><strong data-network-req>${num(initial.r)} Ω</strong>
        </div>
        <div class="r4-readouts">
          <div><span>التيار الكلي</span><strong data-network-i>—</strong></div>
          <div><span>تيار R₁</span><strong data-network-i1>—</strong></div>
          <div><span>تيار R₂</span><strong data-network-i2>—</strong></div>
          <div><span>فرق الكمون U₁</span><strong data-network-u1>—</strong></div>
          <div><span>فرق الكمون U₂</span><strong data-network-u2>—</strong></div>
          <div><span>تحقّق الحفظ</span><strong data-network-check>—</strong></div>
        </div>
        <p class="r4-model-note" data-network-status>القاطعة مفتوحة؛ لا تيار قبل الإغلاق.</p>
      </div>
    </div>`,
    'الدارة مثالية والمقاييس مثالية؛ لا تحاكي مقاومة داخلية للمولد أو أسلاكاً. غيّر القيم لاختبار جمع فروق الكمون في التسلسل وجمع التيارات في التفرع.');
}

function circuitMarkup(mode) {
  const series = mode === 'series';
  const part = (x, y, label) => `<g class="r4-mini-resistor"><rect x="${x - 42}" y="${y - 15}" width="84" height="30" rx="4"/><text x="${x}" y="${y + 6}" text-anchor="middle" direction="ltr">${label}</text></g>`;
  return `<svg class="r4-mini-circuit" viewBox="0 0 560 230" role="img" aria-labelledby="r4-mini-title-${mode} r4-mini-desc-${mode}">
    <title id="r4-mini-title-${mode}">${series ? 'مقاومتان على التسلسل' : 'مقاومتان على التفرع'}</title>
    <desc id="r4-mini-desc-${mode}">${series ? 'مسار واحد يمر عبر R واحد ثم R اثنان.' : 'المقاومتان بين العقدتين نفسيهما في مسارين مستقلين.'}</desc>
    <path class="r4-mini-wire" d="M60 180V50H500V180"/>
    <path class="r4-mini-wire" d="M60 180H500"/>
    <path class="r4-mini-wire" d="M45 184h30M52 210h16"/>
    <text class="r4-mini-sign" x="28" y="182">+</text><text class="r4-mini-sign" x="28" y="216">−</text>
    ${series
      ? `${part(230, 50, 'R₁')}${part(390, 50, 'R₂')}`
      : `<path class="r4-mini-wire" d="M180 50V115H380V50"/><path class="r4-mini-wire" d="M180 115V180"/><path class="r4-mini-wire" d="M380 115V180"/>${part(280, 50, 'R₁')}${part(280, 115, 'R₂')}<circle class="r4-mini-node" cx="180" cy="115" r="5"/><circle class="r4-mini-node" cx="380" cy="115" r="5"/>`}
    <text class="r4-mini-label" x="280" y="222" text-anchor="middle">${series ? 'مسار واحد · التيار نفسه' : 'عقدتان مشتركتان · الكمون نفسه'}</text>
  </svg>`;
}

function colourMarkup() {
  const a = 4, b = 7, c = 2; // training default 4700 Ω
  const value = colourResistance(a, b, c);
  return shell('colour', 'فكّ الشيفرة اللونية',
    'اختر رقمَي الحلقتين A وB وأس المضاعف C، ثم اقرأ القيمة. الحلقة D للتفاوت لكن المصدر لا يعطي نسبه، لذلك لا نحسب نسبة تفاوت.',
    'تدريب من المنصة على نموذج الأربع حلقات · ليس قراءة للرسم الأصلي المتعارض',
    `<div class="r4-lab-layout">
      <div class="r4-lab-controls">
        ${select('colour-a', 'الحلقة A · الرقم الأول', COLOURS.map(([name], index) => [index, `${name} · ${index}`]), a)}
        ${select('colour-b', 'الحلقة B · الرقم الثاني', COLOURS.map(([name], index) => [index, `${name} · ${index}`]), b)}
        ${select('colour-c', 'الحلقة C · أس المضاعف', COLOURS.map(([name], index) => [index, `${name} · 10^${index}`]), c)}
        <div class="r4-button-row">${reset('colour')}</div>
      </div>
      <div class="r4-lab-stage">
        <div class="r4-band-preview" aria-hidden="true">
          <span class="r4-band-preview-lead"></span>
          <span class="r4-band-preview-body">
            <i data-band="a" style="background:${COLOURS[a][1]}"></i><i data-band="b" style="background:${COLOURS[b][1]}"></i><i data-band="c" style="background:${COLOURS[c][1]}"></i><i class="r4-band-preview-d" style="background:#b69750"></i>
          </span>
          <span class="r4-band-preview-lead"></span>
          <span class="r4-band-preview-labels" dir="ltr"><b>A</b><b>B</b><b>C</b><b>D</b></span>
        </div>
        <div class="r4-meter" role="status" aria-live="polite">
          <span class="r4-meter-label">قيمة المقاومة</span><strong data-colour-reading>${num(value)} Ω</strong>
          <span class="r4-meter-note" data-colour-equation>R = (10×4 + 7) × 10² = 4700 Ω</span>
        </div>
        <div class="r4-challenge">
          <p>تحدٍّ: اضبط المقاومة على <bdi dir="ltr">4700 Ω</bdi> ثم تحقّق. جرّب بعدها 220 Ω و10000 Ω.</p>
          <button class="r4-action-button" type="button" data-colour-check>تحقّق من الهدف</button>
          <output class="r4-feedback" data-colour-feedback role="status" aria-live="polite"></output>
        </div>
      </div>
    </div>`,
    '4700 Ω هنا تدريب مستقل على نموذج الأربع حلقات، وليس قراءة مؤكدة للرسم الأصلي؛ الصورة المطبوعة تُظهر خمس مناطق لونية. لا نخترع نسبة تفاوت للحلقة D.');
}

function rheostatMarkup() {
  const initial = rheostatModel(1);
  return shell('rheostat', 'لماذا تتحكم الزلاقة في التيار؟',
    'حرّك الزلاقة لتغيير طول الجزء المستعمل من الناقل المقاوم. النموذج يستخدم سلكاً توضيحياً ومصدراً مثالياً 6 V.',
    'نموذج من المنصة · قيمة توضيحية',
    `<div class="r4-lab-layout">
      <div class="r4-lab-controls">
        ${range('rheostat-fraction', 'نسبة الطول المستعمل (%)', 10, 100, 100, 5, '%')}
        <div class="r4-button-row">${reset('rheostat')}</div>
      </div>
      <div class="r4-lab-stage">
        <div class="r4-rheostat-bar" aria-hidden="true"><span data-rheostat-fill style="width:100%"></span></div>
        <div class="r4-meter" role="status" aria-live="polite">
          <span class="r4-meter-label">المقاومة والتيار</span><strong data-rheostat-reading>${num(initial.resistance)} Ω · ${num(initial.current)} A</strong>
        </div>
        <div class="r4-readouts">
          <div><span>الطول الفعّال</span><strong data-rheostat-length>1 m</strong></div>
          <div><span>المقاومة</span><strong data-rheostat-r>${num(initial.resistance)} Ω</strong></div>
          <div><span>التيار</span><strong data-rheostat-i>${num(initial.current)} A</strong></div>
        </div>
        <p class="r4-model-note">تقليل الطول الفعّال يقلّل المقاومة، فيزداد التيار عند ثبات المصدر. هذا هو مبدأ التحكم بالتيار في المقاومة المتغيرة.</p>
      </div>
    </div>`,
    'المقاومة المتغيرة ليست ضابطاً سحرياً للتوتر؛ في هذا النموذج نتحكم في المقاومة فقط. لا تُجرّب توصيلاً حقيقياً على جهد الشبكة.');
}

const BUILDERS = Object.freeze({
  heat: heatMarkup,
  ohm: ohmMarkup,
  wire: wireMarkup,
  network: networkMarkup,
  colour: colourMarkup,
  rheostat: rheostatMarkup,
});

export const UNIT2L4_SIMULATION_IDS = Object.freeze(Object.keys(BUILDERS));

export function unit2l4SimulationMarkup(id) {
  const build = BUILDERS[id];
  if (!build) throw new RangeError(`Unknown Unit 2 Lesson 4 simulation: ${id}`);
  return build();
}

/* ------------------------------------------------------------------------- */
/* Mount                                                                     */
/* ------------------------------------------------------------------------- */

const states = new WeakMap();
const stateFor = (root) => {
  if (!states.has(root)) states.set(root, { networkClosed: false, targetChecked: false });
  return states.get(root);
};
const q = (root, selector) => root.querySelector(selector);
const value = (root, id) => Number(q(root, `#${id}`)?.value ?? Number.NaN);
const write = (root, selector, text) => {
  const node = q(root, selector);
  if (node) node.textContent = text;
};

function renderHeat(root) {
  const added = Math.max(0, value(root, 'heat-added') || 0);
  const model = heatLabModel(added);
  write(root, '[data-heat-current]', `${num(model.current)} A`);
  write(root, '[data-heat-resistance]', `${num(model.totalResistance)} Ω`);
  write(root, '[data-heat-voltage]', `${num(model.lampVoltage)} V`);
  write(root, '[data-heat-power]', `${num(model.lampPower)} W`);
  q(root, '[data-heat-lamp]')?.setAttribute('data-lit', String(model.brightness > 0.22));
  q(root, '[data-heat-lamp]')?.style.setProperty('--r4-glow', String(model.brightness));
}

function renderOhm(root) {
  const u = Math.max(0, value(root, 'ohm-u') || 0);
  const r = Math.max(2, value(root, 'ohm-r') || 4);
  const i = ohmCurrent(u, r);
  write(root, '[data-ohm-current]', `${num(i)} A`);
  write(root, '[data-ohm-equation]', `I = U / R = ${num(u)} / ${num(r)} = ${num(i)} A`);
  const host = q(root, '[data-ohm-graph]');
  if (host) {
    host.innerHTML = graph([{ i: 0, u: 0 }, { i: u / r, u }], {
      id: 'r4-live-ohm', maxI: 8, maxU: 16, active: { i: u / r, u },
    });
  }
}

function renderWire(root) {
  const rho = (value(root, 'wire-rho') || 1.7) * 1e-8;
  const length = value(root, 'wire-length') || 2;
  const area = value(root, 'wire-area') || 1;
  const resistance = metalWireResistance(rho, length, area);
  write(root, '[data-wire-resistance]', `${num(resistance)} Ω`);
  write(root, '[data-wire-length]', `${num(length)} m`);
  write(root, '[data-wire-area]', `${num(area)} mm²`);
  write(root, '[data-wire-rho]', `${num(rho / 1e-8)}×10⁻⁸ Ω·m`);
}

function renderNetwork(root) {
  const state = stateFor(root);
  const mode = root.querySelector('input[name="r4-network-mode"]:checked')?.value ?? 'series';
  const u = value(root, 'network-u') || 12;
  const r1 = value(root, 'network-r1') || 3;
  const r2 = value(root, 'network-r2') || 3;
  const model = network(u, r1, r2, mode);
  write(root, '[data-network-req]', `${num(model.r)} Ω`);
  const stage = q(root, '[data-network-circuit]');
  if (stage) stage.innerHTML = circuitMarkup(mode);
  for (const button of root.querySelectorAll('[data-network-switch]')) {
    button.setAttribute('aria-pressed', String((button.dataset.networkSwitch === 'close') === state.networkClosed));
  }
  if (!state.networkClosed) {
    for (const key of ['i', 'i1', 'i2', 'u1', 'u2']) write(root, `[data-network-${key}]`, '0');
    write(root, '[data-network-check]', '—');
    write(root, '[data-network-status]', 'القاطعة مفتوحة: لا تيار. أغلق القاطعة لقراءة التيارات وفروق الكمون.');
    return;
  }
  write(root, '[data-network-i]', `${num(model.i)} A`);
  write(root, '[data-network-i1]', `${num(model.i1)} A`);
  write(root, '[data-network-i2]', `${num(model.i2)} A`);
  write(root, '[data-network-u1]', `${num(model.u1)} V`);
  write(root, '[data-network-u2]', `${num(model.u2)} V`);
  write(root, '[data-network-check]', mode === 'series'
    ? `${num(model.u1)} + ${num(model.u2)} = ${num(u)} V`
    : `${num(model.i1)} + ${num(model.i2)} = ${num(model.i)} A`);
  write(root, '[data-network-status]', mode === 'series'
    ? `تسلسل: التيار نفسه ${num(model.i)} A، وفرق الكمون الكلي يتوزّع بين المقاومتين.`
    : `تفرع: فرق الكمون نفسه ${num(u)} V على الفرعين، والتيار الكلي مجموع التيارين.`);
}

function renderColour(root) {
  const a = value(root, 'colour-a');
  const b = value(root, 'colour-b');
  const c = value(root, 'colour-c');
  const resistance = colourResistance(a, b, c);
  write(root, '[data-colour-reading]', `${num(resistance)} Ω`);
  write(root, '[data-colour-equation]', `R = (10×${a} + ${b}) × 10^${c} = ${num(resistance)} Ω`);
  for (const [key, index] of [['a', a], ['b', b], ['c', c]]) {
    const band = q(root, `[data-band="${key}"]`);
    if (band) band.style.background = COLOURS[index][1];
  }
}

function renderRheostat(root) {
  const percent = value(root, 'rheostat-fraction') || 100;
  const model = rheostatModel(percent / 100);
  write(root, '[data-rheostat-reading]', `${num(model.resistance)} Ω · ${num(model.current)} A`);
  write(root, '[data-rheostat-length]', `${num(model.fraction)} m`);
  write(root, '[data-rheostat-r]', `${num(model.resistance)} Ω`);
  write(root, '[data-rheostat-i]', `${num(model.current)} A`);
  const fill = q(root, '[data-rheostat-fill]');
  if (fill) fill.style.width = `${percent}%`;
}

function renderRangeLabels(root) {
  for (const input of root.querySelectorAll('input[type="range"]')) {
    const output = root.querySelector(`#${input.id}-value`);
    if (!output) continue;
    const unit = output.textContent.trim().replace(/^[-\d.,]+/, '').trim();
    output.textContent = `${input.value}${unit ? ` ${unit}` : ''}`;
  }
}

const RENDERERS = Object.freeze({
  heat: renderHeat,
  ohm: renderOhm,
  wire: renderWire,
  network: renderNetwork,
  colour: renderColour,
  rheostat: renderRheostat,
});

function resetLab(root, id) {
  for (const input of root.querySelectorAll('input[type="range"], input[type="radio"]')) {
    if (input.type === 'range') input.value = input.dataset.default ?? input.defaultValue;
    if (input.type === 'radio' && input.defaultChecked) input.checked = true;
  }
  for (const field of root.querySelectorAll('select')) {
    if (field.dataset.default !== undefined) field.value = field.dataset.default;
  }
  const state = stateFor(root);
  if (id === 'network') state.networkClosed = false;
  if (id === 'colour') {
    state.targetChecked = false;
    write(root, '[data-colour-feedback]', '');
  }
  renderRangeLabels(root);
  RENDERERS[id]?.(root);
}

function mountLab(root) {
  if (root.dataset.mounted === 'true') return;
  root.dataset.mounted = 'true';
  const id = root.dataset.u2l4Sim;
  renderRangeLabels(root);
  RENDERERS[id]?.(root);
  root.addEventListener('input', () => {
    renderRangeLabels(root);
    RENDERERS[id]?.(root);
  });
  root.addEventListener('change', () => {
    renderRangeLabels(root);
    RENDERERS[id]?.(root);
  });
  root.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.labReset === id) {
      resetLab(root, id);
      return;
    }
    if (id === 'network' && target.dataset.networkSwitch) {
      stateFor(root).networkClosed = target.dataset.networkSwitch === 'close';
      renderNetwork(root);
      return;
    }
    if (id === 'colour' && target.hasAttribute('data-colour-check')) {
      const feedback = q(root, '[data-colour-feedback]');
      if (!feedback) return;
      const a = value(root, 'colour-a');
      const b = value(root, 'colour-b');
      const c = value(root, 'colour-c');
      const total = colourResistance(a, b, c);
      stateFor(root).targetChecked = true;
      if (total === 4700) {
        feedback.textContent = '✓ 4700 Ω: أصفر (4)، بنفسجي (7)، وأحمر (2). جرّب الآن 220 Ω أو 10000 Ω.';
        feedback.dataset.kind = 'correct';
      } else {
        feedback.textContent = `القيمة الحالية ${num(total)} Ω وليست 4700 Ω. راجع رقمَي الحلقتين A وB ثم أس المضاعف C.`;
        feedback.dataset.kind = 'incorrect';
      }
    }
  });
}

export function mountUnit2L4Simulations(scope = document) {
  scope.querySelectorAll('[data-u2l4-sim]').forEach(mountLab);
}

/* exported for focused unit tests */
export const __internals = Object.freeze({ COLOURS, circuitMarkup });
