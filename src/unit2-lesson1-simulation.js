import { formula } from './math.js';
import { coulombForce } from './unit2-lesson1-physics.js';

const markers = (id) => `<defs><marker id="${id}-red" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#b84b44" /></marker><marker id="${id}-navy" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#294c7a" /></marker><marker id="${id}-dimension" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#56627a" /></marker></defs>`;
const labHead = (page, title, note) => `<header class="u2-lab-header"><div><span class="u2-tag u2-tag-platform">محاكاة من المنصة · ص ${page}</span><h3>${title}</h3></div><p>${note}</p></header>`;
const resetButton = (attribute) => `<button class="u2-button u2-button-ghost" type="button" ${attribute}>إعادة الضبط</button>`;
const scopeLeaves = (prefix, cx = 350, y = 160) => `<line data-${prefix}-leaf-l x1="${cx}" y1="${y}" x2="${cx - 4}" y2="${y + 72}" class="u2-scope-leaf" /><line data-${prefix}-leaf-r x1="${cx}" y1="${y}" x2="${cx + 4}" y2="${y + 72}" class="u2-scope-leaf" />`;
const smallScope = (prefix, cx = 350, cy = 48) => `<g transform="translate(${cx} ${cy})"><rect x="-76" y="44" width="152" height="218" rx="50" class="u2-scope-jar" /><rect x="-20" y="35" width="40" height="18" rx="5" class="u2-scope-stopper" /><ellipse cx="0" cy="18" rx="25" ry="9" class="u2-scope-disc" /><line x1="0" y1="27" x2="0" y2="112" class="u2-scope-stem" />${scopeLeaves(prefix, 0, 112)}<rect x="-60" y="258" width="120" height="16" rx="8" class="u2-scope-base" /></g>`;

function electroscopeLab() {
  return `<aside class="u2-lab" data-u2-sim="electroscope-lab" aria-labelledby="u2-scope-lab-title">${labHead(74, 'اختبر مبدأ عمل الكاشف', 'نموذج نوعي للكشف فقط: لا يقيس مقدار الشحنة ولا يحدد نوعها.')}<h4 id="u2-scope-lab-title" class="u2-sr-only">نموذج الكاشف الكهربائي</h4><div class="u2-lab-grid"><section class="u2-lab-controls"><p>اختر الجسم الذي ستقربه من القرص، ولاحظ الوريقتين.</p><div class="u2-button-row"><button class="u2-button" type="button" data-scope-test="neutral">جسم غير مشحون</button><button class="u2-button" type="button" data-scope-test="charged">جسم مشحون</button>${resetButton('data-scope-reset')}</div><output class="u2-lab-status" data-scope-status role="status" aria-live="polite">الكاشف معتدل والوريقتان منطبقتان.</output></section><figure class="u2-lab-figure"><svg viewBox="0 0 720 350" role="img" aria-labelledby="scope-lab-svg-title scope-lab-svg-desc"><title id="scope-lab-svg-title">اختبار الكاشف بجسمين</title><desc id="scope-lab-svg-desc" data-scope-desc>الوريقتان منطبقتان قبل تقريب الجسم.</desc>${smallScope('test', 390, 20)}<g data-scope-object transform="translate(110 125)"><circle r="42" class="u2-test-object" /><text y="12" class="u2-svg-question" text-anchor="middle">؟</text></g><path d="M165 125 H255" class="u2-approach-line" /><text x="110" y="205" class="u2-svg-label" text-anchor="middle">الجسم المختار</text></svg><figcaption>انفراج الوريقتين دليل الشحن، وانطباقهما دليل عدمه وفق نص الصفحة.</figcaption></figure></div></aside>`;
}

function rubbingLab() {
  const steps = ['الساق قبل الدلك + الكاشف', 'الساق قبل الدلك + الورق', 'الدلك ثم الكاشف', 'الطرف المدلوك + الورق'];
  return `<aside class="u2-lab" data-u2-sim="rubbing-lab" aria-labelledby="rubbing-lab-title">${labHead(75, 'تجربة الدلك: قبله وبعده', 'نموذج نوعي للمشاهدات المرسومة في الكتاب؛ لا يمثل عدد الإلكترونات أو مقدار الشحنة.')}<h4 id="rubbing-lab-title" class="u2-sr-only">محاكاة تجربة التكهرب بالدلك</h4><div class="u2-step-buttons" role="group" aria-label="خطوات تجربة الدلك">${steps.map((label, index) => `<button type="button" class="u2-step-button" data-rub-step="${index + 1}"><span>${index + 1}</span>${label}</button>`).join('')}</div><div class="u2-lab-grid"><section class="u2-lab-controls"><div class="u2-lab-meter"><span>الخطوات المنفذة</span><output data-rub-progress dir="ltr">0 / 4</output></div><output class="u2-lab-status" data-rub-status role="status" aria-live="polite">اختر خطوة لتنفيذها وملاحظة الأثر.</output>${resetButton('data-rub-reset')}</section><figure class="u2-lab-figure"><svg viewBox="0 0 720 410" role="img" aria-labelledby="rub-svg-title rub-svg-desc"><title id="rub-svg-title">ساق بلاستيك وكاشف وقصاصات ورق</title><desc id="rub-svg-desc" data-rub-desc>الأدوات في حالتها الابتدائية.</desc>${smallScope('rub', 200, 45)}<g data-rub-rod transform="translate(440 105) rotate(-12)"><rect x="-85" y="-13" width="190" height="26" rx="13" class="u2-plastic-rod" /><g data-rub-charges opacity="0"><text x="-45" y="7" class="u2-svg-rod-sign">− − −</text></g></g><g data-rub-wool opacity="0" transform="translate(500 165)"><path d="M-60-25 45-35 65 25-45 35Z" class="u2-wool" /><text x="0" y="8" class="u2-svg-label" text-anchor="middle">صوف</text></g><g class="u2-paper-bits"><path data-paper="1" d="M450 310 l22-8 8 15-24 7Z" /><path data-paper="2" d="M515 330 l20-12 10 14-20 12Z" /><path data-paper="3" d="M580 300 l18-6 9 14-20 8Z" /><path data-paper="4" d="M615 342 l22-9 7 15-20 7Z" /></g><text x="530" y="390" class="u2-svg-label" text-anchor="middle">قصاصات الورق</text></svg><figcaption data-rub-caption>الأدوات جافة كما تشترط التجربة.</figcaption></figure></div></aside>`;
}

function interactionLab() {
  return `<aside class="u2-lab" data-u2-sim="interaction-lab" aria-labelledby="interaction-lab-title">${labHead(77, 'الكرة المعلقة: تنافر أم تجاذب؟', 'نموذج نوعي للاتجاه فقط؛ زاوية الخيط توضيحية وليست قياساً للقوة.')}<h4 id="interaction-lab-title" class="u2-sr-only">محاكاة الأفعال المتبادلة بين الشحنات</h4><div class="u2-lab-grid"><section class="u2-lab-controls"><ol class="u2-lab-mini-steps"><li>نفّذ التجهيز في الخطوات 1–3.</li><li>اختر الساق في الخطوة 4 أو 5.</li><li>تنبأ، ثم قرّب الساق وقارن ملاحظتك بتنبؤك.</li></ol><button class="u2-button" type="button" data-interaction-prepare>1–3 · جهّز الكرة والساق</button><div class="u2-button-row" role="group" aria-label="اختيار الساق"><button class="u2-button u2-button-choice" type="button" data-interaction-rod="plastic" aria-pressed="false">4 · بلاستيك مدلوك بالصوف</button><button class="u2-button u2-button-choice" type="button" data-interaction-rod="glass" aria-pressed="false">5 · زجاج مدلوك بالحرير</button></div><fieldset class="u2-prediction"><legend>تنبؤك عند التقريب</legend><label><input type="radio" name="interaction-prediction" value="تنافر" /> تنافر</label><label><input type="radio" name="interaction-prediction" value="تجاذب" /> تجاذب</label></fieldset><div class="u2-button-row"><button class="u2-button u2-button-primary" type="button" data-interaction-approach>قرّب الساق ولاحظ</button>${resetButton('data-interaction-reset')}</div><output class="u2-lab-status" data-interaction-status role="status" aria-live="polite">ابدأ بتجهيز الكرة والساق.</output><div class="u2-lab-meter"><span>المشاهدتان المنجزتان</span><output data-interaction-progress dir="ltr">0 / 2</output></div></section><figure class="u2-lab-figure"><svg viewBox="0 0 720 420" role="img" aria-labelledby="interaction-svg-title interaction-svg-desc"><title id="interaction-svg-title">كرة بلاستيكية معلقة وساق مشحونة</title><desc id="interaction-svg-desc" data-interaction-desc>كرة معلقة رأسياً قبل تجهيز التجربة.</desc><path d="M150 355 H600 M220 355 V50 H350" class="u2-stand" /><circle cx="350" cy="50" r="6" class="u2-pivot" /><line data-ball-string x1="350" y1="50" x2="350" y2="250" class="u2-string" /><g data-ball transform="translate(350 250)"><circle r="25" class="u2-ball" /><text data-ball-sign y="8" class="u2-svg-charge-sign" text-anchor="middle" opacity="0">−</text></g><g data-interaction-rod-visual transform="translate(545 220) rotate(-8)" opacity="0"><rect x="-90" y="-13" width="180" height="26" rx="13" class="u2-plastic-rod" data-rod-body /><text data-rod-sign x="0" y="7" class="u2-svg-rod-sign" text-anchor="middle">− − −</text></g><text x="350" y="305" class="u2-svg-label" text-anchor="middle" data-ball-label>الكرة البلاستيكية</text><text x="540" y="275" class="u2-svg-label" text-anchor="middle" data-rod-label></text></svg><figcaption data-interaction-caption>الكرة معلقة على حامل معزول.</figcaption></figure></div></aside>`;
}

function contactLab() {
  const labels = ['وصل الكرة بالكاشف', 'دلك الساق وملامستها', 'إبعاد الساق', 'الكشف من جديد'];
  return `<aside class="u2-lab" data-u2-sim="contact-lab" aria-labelledby="contact-lab-title">${labHead(78, 'التكهرب باللمس: نفّذ بالترتيب', 'نموذج نوعي لانتقال الشحنة بالتماس؛ إشارة الساق البلاستيكية مأخوذة من السؤال الثاني ص 84.')}<h4 id="contact-lab-title" class="u2-sr-only">محاكاة التكهرب باللمس</h4><div class="u2-step-buttons" role="group" aria-label="خطوات التكهرب باللمس">${labels.map((label, index) => `<button type="button" class="u2-step-button" data-contact-step="${index + 1}" ${index ? 'disabled' : ''}><span>${index + 1}</span>${label}</button>`).join('')}</div><div class="u2-lab-grid"><section class="u2-lab-controls"><div class="u2-lab-meter"><span>التقدم في التجربة</span><output data-contact-progress dir="ltr">0 / 4</output></div><output class="u2-lab-status" data-contact-status role="status" aria-live="polite">ابدأ بالخطوة الأولى: وصل الكرة المعتدلة بالكاشف.</output>${resetButton('data-contact-reset')}</section><figure class="u2-lab-figure"><svg viewBox="0 0 720 410" role="img" aria-labelledby="contact-svg-title contact-svg-desc"><title id="contact-svg-title">كرة معدنية موصولة بكاشف</title><desc id="contact-svg-desc" data-contact-desc>كرة معدنية على عازل وكاشف قبل التنفيذ.</desc>${smallScope('contact', 510, 60)}<path d="M195 150 Q310 85 510 78" class="u2-wire" /><circle cx="170" cy="150" r="38" class="u2-metal-ball" /><path d="M170 188 V330 M135 330 H205" class="u2-insulator" /><text x="170" y="360" class="u2-svg-label" text-anchor="middle">كرة معدنية على عازل</text><g data-contact-ball-charges opacity="0"><text x="170" y="160" class="u2-svg-rod-sign" text-anchor="middle">− −</text></g><g data-contact-rod transform="translate(295 105) rotate(-18)" opacity="0"><rect x="-85" y="-13" width="180" height="26" rx="13" class="u2-plastic-rod" /><text x="0" y="7" class="u2-svg-rod-sign" text-anchor="middle">− − −</text></g><g data-contact-leaf-charges opacity="0"><text x="510" y="250" class="u2-svg-rod-sign" text-anchor="middle">− −</text></g></svg><figcaption data-contact-caption>السلك الناقل يصل الكرة بقرص الكاشف.</figcaption></figure></div></aside>`;
}

function inductionLab() {
  const steps = [['1', 'قرّب دون لمس'], ['2', 'أبعد الساق'], ['3a', '3 · قرّب من جديد'], ['3b', '3 · المس بالإصبع'], ['3c', '3 · أبعدهما معاً']];
  return `<aside class="u2-lab" data-u2-sim="induction-lab" aria-labelledby="induction-lab-title">${labHead(79, 'التكهرب بالتأثير: قرّب، المس، أبعد', 'نموذج نوعي لإعادة توزع الشحنات؛ فصلنا أفعال الخطوة الثالثة فقط لتوضيح ترتيبها، دون تغيير نصها.')}<h4 id="induction-lab-title" class="u2-sr-only">محاكاة التكهرب بالتأثير</h4><div class="u2-step-buttons u2-step-buttons-five" role="group" aria-label="أفعال التكهرب بالتأثير">${steps.map(([value, label], index) => `<button type="button" class="u2-step-button" data-induction-step="${value}" ${index ? 'disabled' : ''}>${label}</button>`).join('')}</div><div class="u2-lab-grid"><section class="u2-lab-controls"><div class="u2-lab-meter"><span>مرحلة التنفيذ</span><output data-induction-progress dir="ltr">0 / 3</output></div><output class="u2-lab-status" data-induction-status role="status" aria-live="polite">الكاشف معتدل. نفّذ الخطوة الأولى دون ملامسة الساق للقرص.</output>${resetButton('data-induction-reset')}</section><figure class="u2-lab-figure"><svg viewBox="0 0 720 420" role="img" aria-labelledby="induction-svg-title induction-svg-desc"><title id="induction-svg-title">الكاشف والساق المشحونة والإصبع</title><desc id="induction-svg-desc" data-induction-desc>كاشف معتدل قبل تقريب الساق.</desc>${smallScope('induction', 400, 65)}<g data-induction-rod transform="translate(150 115) rotate(10)" opacity="0"><rect x="-90" y="-14" width="190" height="28" rx="14" class="u2-plastic-rod" /><text x="0" y="8" class="u2-svg-rod-sign" text-anchor="middle">− − −</text><text x="0" y="55" class="u2-svg-label" text-anchor="middle">دون ملامسة</text></g><g data-induction-near opacity="0"><text x="400" y="92" class="u2-svg-rod-sign" text-anchor="middle">+ +</text></g><g data-induction-far opacity="0"><text x="400" y="268" class="u2-svg-rod-sign" text-anchor="middle">− −</text></g><g data-induction-final opacity="0"><text x="400" y="92" class="u2-svg-rod-sign" text-anchor="middle">+ +</text><text x="400" y="268" class="u2-svg-rod-sign" text-anchor="middle">+ +</text></g><g data-induction-finger opacity="0"><path d="M500 40 Q470 32 445 65 L415 77" class="u2-finger" /><text x="520" y="35" class="u2-svg-label">إصبع</text><path d="M450 115 Q520 160 555 245" class="u2-ground-path" /><text x="570" y="265" class="u2-svg-label">إلى الأرض</text></g></svg><figcaption data-induction-caption>لا يوجد تماس بين الساق والقرص في التأثير.</figcaption></figure></div></aside>`;
}

const rangeControl = (id, label, min, max, step, value, unit) => `<div class="u2-range"><div><label for="${id}">${label}</label><output for="${id}" id="${id}-output" dir="ltr">${value} ${unit}</output></div><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-coulomb-input /><div class="u2-range-ends" aria-hidden="true"><span dir="ltr">${min} ${unit}</span><span dir="ltr">${max} ${unit}</span></div></div>`;
const signControl = (id, label) => `<label class="u2-select-label" for="${id}">${label}<select id="${id}" data-coulomb-input><option value="1">موجبة +</option><option value="-1">سالبة −</option></select></label>`;

function coulombLab() {
  return `<aside class="u2-lab" data-u2-sim="coulomb-lab" aria-labelledby="coulomb-lab-title">${labHead(81, 'مختبر قانون كولوم', 'شحنتان نقطيتان في الخلاء. الرسم تخطيطي وليس بمقياس؛ النموذج لا يحاكي التفريغ الكهربائي.')}<h4 id="coulomb-lab-title" class="u2-sr-only">محاكاة قانون كولوم</h4><div class="u2-coulomb-controls"><div class="u2-charge-control">${signControl('cq1sign', 'إشارة q₁')}${rangeControl('cq1', 'مقدار q₁', 1, 100, 1, 50, 'μC')}</div><div class="u2-charge-control">${signControl('cq2sign', 'إشارة q₂')}${rangeControl('cq2', 'مقدار q₂', 1, 100, 1, 80, 'μC')}</div>${rangeControl('cd', 'البعد d', 20, 200, 10, 100, 'cm')}</div><div class="u2-lab-grid"><section class="u2-lab-controls"><div class="u2-result-grid"><div><span>شدة القوة</span><output data-coulomb-force dir="ltr">36 N</output></div><div><span>نوع القوة</span><output data-coulomb-kind>تنافر</output></div></div><div class="u2-live-formula" data-coulomb-formula></div><output class="u2-lab-status" data-coulomb-status role="status" aria-live="polite"></output><div class="u2-prediction u2-coulomb-prediction"><label for="coulomb-prediction">قبل مضاعفة d، ما توقعك لشدة القوة؟</label><select id="coulomb-prediction"><option value="">اختر تنبؤاً</option><option>تزداد</option><option>تنقص إلى النصف</option><option>تنقص إلى الربع</option><option>لا تتغير</option></select><button class="u2-button" type="button" data-coulomb-double>ضاعف المسافة وقارن</button></div><div class="u2-button-row">${resetButton('data-coulomb-reset')}</div></section><figure class="u2-lab-figure"><svg viewBox="0 0 720 340" role="img" aria-labelledby="coulomb-svg-title coulomb-svg-desc"><title id="coulomb-svg-title">شحنتان وقوتا كولوم</title><desc id="coulomb-svg-desc" data-coulomb-desc>شحنتان موجبتان تتنافران بقوة مقدارها 36 نيوتن.</desc>${markers('coulomb-lab')}<line x1="220" y1="70" x2="500" y2="70" class="u2-dimension-line" marker-start="url(#coulomb-lab-dimension)" marker-end="url(#coulomb-lab-dimension)" /><text data-coulomb-distance x="360" y="52" class="u2-svg-dimension" text-anchor="middle" direction="ltr">d = 100 cm</text><line x1="220" y1="175" x2="500" y2="175" class="u2-force-carrier" /><circle data-cq1-circle cx="220" cy="175" r="25" class="u2-charge-positive" /><circle data-cq2-circle cx="500" cy="175" r="25" class="u2-charge-positive" /><text data-cq1-sign x="220" y="184" class="u2-svg-charge-sign" text-anchor="middle">+</text><text data-cq2-sign x="500" y="184" class="u2-svg-charge-sign" text-anchor="middle">+</text><line data-coulomb-arrow1 x1="192" y1="175" x2="102" y2="175" class="u2-force-red" marker-end="url(#coulomb-lab-red)" /><line data-coulomb-arrow2 x1="528" y1="175" x2="618" y2="175" class="u2-force-red" marker-end="url(#coulomb-lab-red)" /><text data-coulomb-f1 x="110" y="145" class="u2-svg-force" text-anchor="middle" direction="ltr">F₂/₁</text><text data-coulomb-f2 x="610" y="145" class="u2-svg-force" text-anchor="middle" direction="ltr">F₁/₂</text><text x="220" y="222" class="u2-svg-math" text-anchor="middle" direction="ltr">q₁</text><text x="500" y="222" class="u2-svg-math" text-anchor="middle" direction="ltr">q₂</text></svg><figcaption>القوتان المتبادلتان متساويتان في الشدة ومتعاكستان في الجهة على الحامل نفسه.</figcaption></figure></div></aside>`;
}

export function unit2SimulationMarkup(id) {
  if (id === 'electroscope-lab') return electroscopeLab();
  if (id === 'rubbing-lab') return rubbingLab();
  if (id === 'interaction-lab') return interactionLab();
  if (id === 'contact-lab') return contactLab();
  if (id === 'induction-lab') return inductionLab();
  if (id === 'coulomb-lab') return coulombLab();
  return '';
}

const setOpacity = (element, visible) => element?.setAttribute('opacity', visible ? '1' : '0');
const setLeaves = (root, prefix, open) => {
  const left = root.querySelector(`[data-${prefix}-leaf-l]`);
  const right = root.querySelector(`[data-${prefix}-leaf-r]`);
  if (!left || !right) return;
  const x1 = Number(left.getAttribute('x1'));
  const y1 = Number(left.getAttribute('y1'));
  left.setAttribute('x2', String(x1 - (open ? 34 : 4)));
  right.setAttribute('x2', String(x1 + (open ? 34 : 4)));
  left.setAttribute('y2', String(y1 + 72));
  right.setAttribute('y2', String(y1 + 72));
};
const pressed = (buttons, active) => buttons.forEach((button) => {
  const selected = button === active;
  button.classList.toggle('is-active', selected);
  button.setAttribute('aria-pressed', String(selected));
});

function mountElectroscope(root) {
  const status = root.querySelector('[data-scope-status]');
  const description = root.querySelector('[data-scope-desc]');
  const buttons = [...root.querySelectorAll('[data-scope-test]')];
  const apply = (kind, button = null) => {
    const charged = kind === 'charged';
    setLeaves(root, 'test', charged);
    pressed(buttons, button);
    status.textContent = charged ? 'انفرجت الوريقتان (ابتعدتا عن بعضهما)؛ الجسم مشحون.' : kind === 'neutral' ? 'بقيت الوريقتان منطبقتين؛ الجسم غير مشحون.' : 'الكاشف معتدل والوريقتان منطبقتان.';
    description.textContent = status.textContent;
  };
  buttons.forEach((button) => button.addEventListener('click', () => apply(button.dataset.scopeTest, button)));
  root.querySelector('[data-scope-reset]').addEventListener('click', () => apply('reset'));
}

function mountRubbing(root) {
  const buttons = [...root.querySelectorAll('[data-rub-step]')];
  const status = root.querySelector('[data-rub-status]');
  const caption = root.querySelector('[data-rub-caption]');
  const description = root.querySelector('[data-rub-desc]');
  const progress = root.querySelector('[data-rub-progress]');
  const papers = [...root.querySelectorAll('[data-paper]')];
  const visited = new Set();
  const states = {
    1: ['لم تنفرج ورقتا الكاشف عند تقريب الساق غير المدلوكة.', 'قبل الدلك: لا انفراج للوريقتين.'],
    2: ['لم تنجذب قصاصات الورق إلى الساق غير المدلوكة.', 'قبل الدلك: قصاصات الورق باقية في مكانها.'],
    3: ['بعد دلك الطرف بالصوف وتقريبه من القرص، انفرجت الوريقتان.', 'بعد الدلك: انفراج ورقتي الكاشف.'],
    4: ['بعد الدلك، اجتذب طرف الساق قصاصات الورق الخفيفة.', 'بعد الدلك: قصاصات الورق تنجذب نحو الساق.'],
  };
  const apply = (step, button = null) => {
    const rubbed = step >= 3;
    setLeaves(root, 'rub', step === 3);
    setOpacity(root.querySelector('[data-rub-charges]'), rubbed);
    setOpacity(root.querySelector('[data-rub-wool]'), step === 3);
    papers.forEach((paper, index) => paper.setAttribute('transform', step === 4 ? `translate(${index % 2 ? -18 : 8} ${-70 - index * 10}) rotate(${index % 2 ? -18 : 20})` : 'translate(0 0)'));
    if (step) {
      visited.add(step);
      status.textContent = states[step][0];
      caption.textContent = states[step][1];
    } else {
      visited.clear();
      status.textContent = 'اختر خطوة لتنفيذها وملاحظة الأثر.';
      caption.textContent = 'الأدوات جافة كما تشترط التجربة.';
    }
    description.textContent = status.textContent;
    progress.textContent = `${visited.size} / 4`;
    pressed(buttons, button);
  };
  buttons.forEach((button) => button.addEventListener('click', () => apply(Number(button.dataset.rubStep), button)));
  root.querySelector('[data-rub-reset]').addEventListener('click', () => apply(0));
}

function mountInteraction(root) {
  const prepare = root.querySelector('[data-interaction-prepare]');
  const rods = [...root.querySelectorAll('[data-interaction-rod]')];
  const status = root.querySelector('[data-interaction-status]');
  const caption = root.querySelector('[data-interaction-caption]');
  const description = root.querySelector('[data-interaction-desc]');
  const progress = root.querySelector('[data-interaction-progress]');
  let prepared = false;
  let rod = null;
  const observed = new Set();
  const message = (text) => { status.textContent = text; description.textContent = text; };
  const clearObservation = () => {
    root.querySelector('[data-ball-string]').setAttribute('x2', '350');
    root.querySelector('[data-ball-string]').setAttribute('y2', '250');
    root.querySelector('[data-ball]').setAttribute('transform', 'translate(350 250)');
    root.querySelector('[data-interaction-rod-visual]').setAttribute('opacity', '0');
  };
  rods.forEach((button) => button.addEventListener('click', () => {
    rod = button.dataset.interactionRod;
    pressed(rods, button);
    clearObservation();
    message(prepared ? `اخترت ${rod === 'plastic' ? 'الساق البلاستيكية' : 'الساق الزجاجية'}. تنبأ ثم قرّبها.` : 'اخترت الساق، لكن نفّذ التجهيز في الخطوات 1–3 أولاً.');
  }));
  prepare.addEventListener('click', () => {
    prepared = true;
    prepare.classList.add('is-active');
    root.querySelector('[data-ball-sign]').setAttribute('opacity', '1');
    message('اكتمل التجهيز: الكرة مدلوكة بالصوف. اختر ساق الخطوة 4 أو 5.');
  });
  root.querySelectorAll('input[name="interaction-prediction"]').forEach((input) => input.addEventListener('change', () => {
    clearObservation();
    message('سُجل تنبؤك. اضغط «قرّب الساق ولاحظ» للمقارنة.');
  }));
  root.querySelector('[data-interaction-approach]').addEventListener('click', () => {
    const prediction = root.querySelector('input[name="interaction-prediction"]:checked')?.value;
    if (!prepared) { message('نفّذ التجهيز في الخطوات 1–3 أولاً.'); return; }
    if (!rod) { message('اختر الساق البلاستيكية أو الزجاجية أولاً.'); return; }
    if (!prediction) { message('اختر تنبؤك: تنافر أم تجاذب، ثم نفّذ التقريب.'); return; }
    const attraction = rod === 'glass';
    const x = attraction ? 395 : 275;
    const y = 235;
    root.querySelector('[data-ball-string]').setAttribute('x2', String(x));
    root.querySelector('[data-ball-string]').setAttribute('y2', String(y));
    root.querySelector('[data-ball]').setAttribute('transform', `translate(${x} ${y})`);
    const visual = root.querySelector('[data-interaction-rod-visual]');
    visual.setAttribute('opacity', '1');
    root.querySelector('[data-rod-body]').setAttribute('class', attraction ? 'u2-glass-rod' : 'u2-plastic-rod');
    root.querySelector('[data-rod-sign]').textContent = attraction ? '+ + +' : '− − −';
    root.querySelector('[data-rod-label]').textContent = attraction ? 'زجاج مدلوك بالحرير' : 'بلاستيك مدلوك بالصوف';
    const result = attraction ? 'تجاذب: اقتربت الكرة من الساق.' : 'تنافر: ابتعدت الكرة عن الساق.';
    observed.add(rod);
    progress.textContent = `${observed.size} / 2`;
    caption.textContent = result;
    message(`تنبؤك: ${prediction}. الملاحظة: ${result}${observed.size === 2 ? ' اكتملت المقارنة بين الساقين.' : ''}`);
  });
  root.querySelector('[data-interaction-reset]').addEventListener('click', () => {
    prepared = false; rod = null; observed.clear();
    prepare.classList.remove('is-active');
    pressed(rods, null);
    root.querySelectorAll('input[name="interaction-prediction"]').forEach((input) => { input.checked = false; });
    root.querySelector('[data-ball-sign]').setAttribute('opacity', '0');
    root.querySelector('[data-rod-label]').textContent = '';
    progress.textContent = '0 / 2';
    caption.textContent = 'الكرة معلقة على حامل معزول.';
    clearObservation();
    message('ابدأ بتجهيز الكرة والساق.');
  });
}

function mountContact(root) {
  const buttons = [...root.querySelectorAll('[data-contact-step]')];
  const status = root.querySelector('[data-contact-status]');
  const description = root.querySelector('[data-contact-desc]');
  const caption = root.querySelector('[data-contact-caption]');
  const progress = root.querySelector('[data-contact-progress]');
  let current = 0;
  const states = {
    0: ['ابدأ بالخطوة الأولى: وصل الكرة المعتدلة بالكاشف.', 'السلك الناقل يصل الكرة بقرص الكاشف.'],
    1: ['الكرة والكاشف معتدلان؛ بقيت الوريقتان منطبقتين.', 'الخطوة 1: لا انفراج قبل شحن الكرة.'],
    2: ['بعد دلك الساق وملامستها، انتقل بعض الشحنة وانفرجت الوريقتان.', 'الخطوة 2: التماس ينقل بعض الشحنة.'],
    3: ['أبعدنا الساق؛ بقيت الكرة مشحونة وبقيت الوريقتان منفرجتين.', 'الخطوة 3: بقاء الشحنة بعد إبعاد الساق.'],
    4: ['عند الكشف من جديد بقيت الوريقتان منفرجتين؛ شحنة الكرة مماثلة بالنوع لشحنة الساق.', 'الخطوة 4: الكاشف يؤكد بقاء الشحنة.'],
  };
  const apply = (step) => {
    current = step;
    const charged = step >= 2;
    setLeaves(root, 'contact', charged);
    setOpacity(root.querySelector('[data-contact-rod]'), step === 2);
    setOpacity(root.querySelector('[data-contact-ball-charges]'), charged);
    setOpacity(root.querySelector('[data-contact-leaf-charges]'), charged);
    status.textContent = states[step][0]; description.textContent = states[step][0]; caption.textContent = states[step][1];
    progress.textContent = `${step} / 4`;
    buttons.forEach((button) => {
      const number = Number(button.dataset.contactStep);
      button.disabled = number > step + 1;
      button.classList.toggle('is-active', number === step);
      button.classList.toggle('is-done', number < step);
    });
  };
  buttons.forEach((button) => button.addEventListener('click', () => {
    const step = Number(button.dataset.contactStep);
    if (step === current + 1) apply(step);
  }));
  root.querySelector('[data-contact-reset]').addEventListener('click', () => apply(0));
}

function mountInduction(root) {
  const order = ['1', '2', '3a', '3b', '3c'];
  const buttons = [...root.querySelectorAll('[data-induction-step]')];
  const status = root.querySelector('[data-induction-status]');
  const description = root.querySelector('[data-induction-desc]');
  const caption = root.querySelector('[data-induction-caption]');
  const progress = root.querySelector('[data-induction-progress]');
  let index = -1;
  const states = {
    '1': ['تقريب الساق دون لمس: انفرجت الوريقتان بسبب إعادة توزع الشحنات.', 'الطرف القريب مخالف للمؤثر، والطرف البعيد مماثل له.'],
    '2': ['بعد إبعاد الساق: انطبقت الوريقتان؛ عادت الشحنات إلى توزعها السابق.', 'لا بقاء للانفراج بعد إبعاد المؤثر.'],
    '3a': ['قربنا الساق من جديد دون ملامستها، فعاد الانفراج.', 'الخطوة 3 تبدأ بالتقريب دون لمس.'],
    '3b': ['مع لمس القرص بالإصبع وبقاء الساق قريبة: انطبقت الوريقتان.', 'الإصبع يلامس القرص والساق ما تزال قريبة دون تماس.'],
    '3c': ['بعد إبعاد الإصبع والساق معاً: بقيت الوريقتان منفرجتين، وأصبح الكاشف موجباً.', 'بقاء الانفراج يدل على الشحن بالتأثير.'],
  };
  const apply = (nextIndex) => {
    index = nextIndex;
    const step = index >= 0 ? order[index] : null;
    const near = ['1', '3a', '3b'].includes(step);
    const finger = step === '3b';
    const final = step === '3c';
    setLeaves(root, 'induction', step === '1' || step === '3a' || final);
    setOpacity(root.querySelector('[data-induction-rod]'), near);
    setOpacity(root.querySelector('[data-induction-near]'), near);
    setOpacity(root.querySelector('[data-induction-far]'), near);
    setOpacity(root.querySelector('[data-induction-finger]'), finger);
    setOpacity(root.querySelector('[data-induction-final]'), final);
    const initial = index < 0;
    status.textContent = initial ? 'الكاشف معتدل. نفّذ الخطوة الأولى دون ملامسة الساق للقرص.' : states[step][0];
    description.textContent = status.textContent;
    caption.textContent = initial ? 'لا يوجد تماس بين الساق والقرص في التأثير.' : states[step][1];
    progress.textContent = step === '3c' ? '3 / 3' : step === '3a' || step === '3b' ? '3 / 3 · جارٍ' : `${Math.max(0, index + 1)} / 3`;
    buttons.forEach((button) => {
      const buttonIndex = order.indexOf(button.dataset.inductionStep);
      button.disabled = buttonIndex > index + 1;
      button.classList.toggle('is-active', buttonIndex === index);
      button.classList.toggle('is-done', buttonIndex < index);
    });
  };
  buttons.forEach((button) => button.addEventListener('click', () => {
    const nextIndex = order.indexOf(button.dataset.inductionStep);
    if (nextIndex === index + 1) apply(nextIndex);
  }));
  root.querySelector('[data-induction-reset]').addEventListener('click', () => apply(-1));
}

function mountCoulomb(root) {
  const value = (id) => Number(root.querySelector(`#${id}`).value);
  const format = (number) => Number(number.toFixed(6)).toString();
  const prediction = root.querySelector('#coulomb-prediction');
  const doubleButton = root.querySelector('[data-coulomb-double]');
  const status = root.querySelector('[data-coulomb-status]');
  let comparison = '';
  const update = () => {
    const q1 = value('cq1sign') * value('cq1') * 1e-6;
    const q2 = value('cq2sign') * value('cq2') * 1e-6;
    const d = value('cd') / 100;
    const result = coulombForce(q1, q2, d);
    for (const [id, unit] of [['cq1', 'μC'], ['cq2', 'μC'], ['cd', 'cm']]) root.querySelector(`#${id}-output`).textContent = `${value(id)} ${unit}`;
    root.querySelector('[data-coulomb-force]').textContent = `${format(result.magnitude)} N`;
    root.querySelector('[data-coulomb-kind]').textContent = result.kind === 'repulsion' ? 'تنافر' : 'تجاذب';
    root.querySelector('[data-coulomb-formula]').innerHTML = formula(`F=9\\times10^{9}\\frac{(${value('cq1')}\\times10^{-6})(${value('cq2')}\\times10^{-6})}{(${d})^{2}}=${format(result.magnitude)}\\,\\mathrm{N}`, `F equals ${format(result.magnitude)} newtons`);
    root.querySelector('[data-coulomb-distance]').textContent = `d = ${value('cd')} cm`;
    const attraction = result.kind === 'attraction';
    for (const [number, sign] of [[1, Math.sign(q1)], [2, Math.sign(q2)]]) {
      root.querySelector(`[data-cq${number}-sign]`).textContent = sign > 0 ? '+' : '−';
      root.querySelector(`[data-cq${number}-circle]`).setAttribute('class', sign > 0 ? 'u2-charge-positive' : 'u2-charge-negative');
    }
    const arrow1 = root.querySelector('[data-coulomb-arrow1]');
    const arrow2 = root.querySelector('[data-coulomb-arrow2]');
    const className = attraction ? 'u2-force-navy' : 'u2-force-red';
    const marker = attraction ? 'coulomb-lab-navy' : 'coulomb-lab-red';
    const coordinates = attraction ? [[248, 338], [472, 382]] : [[192, 102], [528, 618]];
    [[arrow1, coordinates[0]], [arrow2, coordinates[1]]].forEach(([arrow, [x1, x2]]) => {
      arrow.setAttribute('x1', String(x1)); arrow.setAttribute('x2', String(x2)); arrow.setAttribute('class', className); arrow.setAttribute('marker-end', `url(#${marker})`);
    });
    root.querySelector('[data-coulomb-desc]').textContent = `شحنتان ${attraction ? 'مختلفتان تتجاذبان' : 'متماثلتان تتنافران'}، وشدة القوة ${format(result.magnitude)} نيوتن.`;
    status.textContent = comparison || (attraction ? 'الشحنتان مختلفتان: القوة تجاذبية.' : 'الشحنتان متماثلتان: القوة تنافرية.');
    doubleButton.disabled = value('cd') > 100;
  };
  root.querySelectorAll('[data-coulomb-input]').forEach((input) => input.addEventListener('input', () => { comparison = ''; update(); }));
  prediction.addEventListener('change', () => { comparison = ''; update(); });
  doubleButton.addEventListener('click', () => {
    if (!prediction.value) { comparison = 'اختر تنبؤاً أولاً، ثم اضغط مضاعفة المسافة.'; update(); return; }
    if (value('cd') > 100) return;
    const before = root.querySelector('[data-coulomb-force]').textContent;
    const previousDistance = value('cd');
    const guess = prediction.value;
    root.querySelector('#cd').value = String(previousDistance * 2);
    update();
    comparison = `تنبؤك: ${guess}. عند مضاعفة d من ${previousDistance} إلى ${previousDistance * 2} cm تغيرت القوة من ${before} إلى ${root.querySelector('[data-coulomb-force]').textContent}.`;
    update();
  });
  root.querySelector('[data-coulomb-reset]').addEventListener('click', () => {
    for (const [id, val] of [['cq1sign', '1'], ['cq2sign', '1'], ['cq1', '50'], ['cq2', '80'], ['cd', '100']]) root.querySelector(`#${id}`).value = val;
    prediction.value = ''; comparison = ''; update();
  });
  update();
}

export function mountUnit2Simulations(scope) {
  scope.querySelectorAll('[data-u2-sim]').forEach((root) => {
    if (root.dataset.mounted === 'true') return;
    root.dataset.mounted = 'true';
    const id = root.dataset.u2Sim;
    if (id === 'electroscope-lab') mountElectroscope(root);
    if (id === 'rubbing-lab') mountRubbing(root);
    if (id === 'interaction-lab') mountInteraction(root);
    if (id === 'contact-lab') mountContact(root);
    if (id === 'induction-lab') mountInduction(root);
    if (id === 'coulomb-lab') mountCoulomb(root);
  });
}
