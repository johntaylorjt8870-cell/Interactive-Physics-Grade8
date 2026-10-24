import { formula, solutionSteps } from './math.js';
import { checkEquivalentQuantity, parseQuantityInput } from './unit2-lesson1-physics.js';

const platformLabel = '<span class="u2-tag u2-tag-platform">تفاعل من المنصة · السؤال أعلاه من الكتاب</span>';
const actions = () => `<div class="u2-practice-actions"><button class="u2-button u2-button-primary" type="button" data-practice-action="check">تحقق من الإجابة</button><button class="u2-button" type="button" data-practice-action="hint">تلميح</button><button class="u2-button" type="button" data-practice-action="solution">الحل بعد المحاولة</button><button class="u2-button u2-button-ghost" type="button" data-practice-action="reset">إعادة المحاولة</button></div><output class="u2-practice-score" data-practice-score aria-live="polite"></output><output class="u2-practice-feedback" data-practice-feedback role="status" aria-live="polite"></output><div class="u2-hint-panel" data-practice-hint-panel hidden></div><div class="u2-solution-panel" data-practice-solution-panel hidden></div>`;
const shell = (id, body) => `<div class="u2-practice" data-practice-body="${id}">${platformLabel}<form data-practice-form novalidate>${body}${actions()}</form></div>`;
const numericUnits = (kind) => kind === 'charge' ? ['C', 'mC', 'μC', 'nC', 'kC'] : ['N', 'mN', 'kN'];
const numericBody = (id, label, kind) => `<div class="u2-numeric-entry"><label><span>${label}</span><input type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-numeric-value aria-label="${label} — العدد" placeholder="العدد أو الصيغة العلمية" /></label><label><span>الوحدة</span><select data-numeric-unit aria-label="${label} — الوحدة">${numericUnits(kind).map((unit) => `<option value="${unit}">${unit}</option>`).join('')}</select></label></div><p class="u2-input-help">تُقبل الصيغة العلمية والفاصلة العشرية العربية والوحدات المتكافئة؛ اكتب الإشارة عند الحاجة.</p>`;
const choiceBody = (id, legend, options) => `<fieldset class="u2-choice-list"><legend>${legend}</legend>${options.map(([value, label]) => `<label class="u2-choice"><input type="radio" name="${id}-choice" value="${value}" /> <span>${label}</span></label>`).join('')}</fieldset>`;

const fillOptions = [
  ['مختلفين', 'مختلفين'], ['متماثلين', 'متماثلين'], ['تنافر', 'تنافر'], ['تجاذب', 'تجاذب'], ['مماثلة', 'مماثلة'], ['مخالفة', 'مخالفة'], ['التأثير', 'التأثير'], ['اللمس', 'اللمس'], ['شحنة', 'شحنة'], ['شحنتين', 'شحنتين'],
];
const fillBody = () => `<ol class="u2-fill-inputs">${['نوعا الشحنات', 'نوع القوى', 'نوع الشحنة المكتسبة', 'طريقة التكهرب', 'ما تكتسبه الوريقتان'].map((label, index) => `<li><label for="fill-${index}"><span>الفراغ ${index + 1} · ${label}</span><select id="fill-${index}" data-fill-value="${index}"><option value="">اختر الكلمة المناسبة</option>${fillOptions.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label><output data-fill-feedback="${index}" aria-live="polite"></output></li>`).join('')}</ol>`;

const truthBody = () => `<div class="u2-truth-inputs">${[1, 2, 3, 4].map((number) => `<fieldset class="u2-truth-row" data-truth-row="${number - 1}"><legend>العبارة ${number}</legend><div class="u2-truth-judgement"><label><input type="radio" name="truth-${number}" value="true" /> صح</label><label><input type="radio" name="truth-${number}" value="false" /> غلط</label></div><label class="u2-correction-label">التصحيح عند اختيار «غلط»<select data-truth-correction="${number - 1}" disabled><option value="">اختر التصحيح</option><option value="insulator">لا تتكهرب العوازل باللمس بهذه الصورة.</option><option value="same-sign">التدافع يعني شحنتين متماثلتين، موجبتين أو سالبتين.</option><option value="neutral-atom">الشحنة الصافية للذرة المعتدلة صفر.</option></select></label><output data-truth-feedback="${number - 1}" aria-live="polite"></output></fieldset>`).join('')}</div>`;

const matchingBody = () => `<ol class="u2-matching-inputs">${['تجمع الإلكترونات على جسم ما', 'ابتعاد الكرة البلاستيكية عن ساق بلاستيكي', 'أصغر شحنة موجبة في الطبيعة', 'ظهور شرارات كهربائية خفيفة', 'جسم إلكترونات ذراته السطحية قليل وشديدة الارتباط بالنواة'].map((label, index) => `<li><label for="match-${index}"><span>${index + 1} · ${label}</span><select id="match-${index}" data-match-value="${index}"><option value="">اختر من العمود B</option>${['البروتون', 'عازل', 'تدافع', 'تكهرب', 'تفريغ', 'موجب'].map((word) => `<option value="${word}">${word}</option>`).join('')}</select></label><output data-match-feedback="${index}" aria-live="polite"></output></li>`).join('')}</ol>`;

function vectorCanvas(prefix) {
  return `<svg class="u2-vector-canvas" data-vector-canvas="${prefix}" viewBox="0 0 760 310" role="img" aria-labelledby="${prefix}-vector-title ${prefix}-vector-desc"><title id="${prefix}-vector-title">لوحة بناء متجهات القوة على q1</title><desc id="${prefix}-vector-desc" data-vector-description>ثلاث شحنات على حامل واحد. لم تُرسم المتجهات بعد.</desc><defs><marker id="${prefix}-vector-red" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#b84b44" /></marker><marker id="${prefix}-vector-navy" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#294c7a" /></marker><marker id="${prefix}-vector-gold" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#a56c16" /></marker></defs><line x1="180" y1="180" x2="660" y2="180" class="u2-vector-carrier" /><line x1="180" y1="48" x2="340" y2="48" class="u2-dimension-line" /><line x1="340" y1="48" x2="660" y2="48" class="u2-dimension-line" /><text x="260" y="35" class="u2-svg-dimension" text-anchor="middle" direction="ltr">AB = 20 cm</text><text x="500" y="35" class="u2-svg-dimension" text-anchor="middle" direction="ltr">BC = 40 cm</text><g class="u2-vector-charges"><circle cx="180" cy="180" r="22" class="u2-charge-positive" /><circle cx="340" cy="180" r="22" class="u2-charge-positive" /><circle cx="660" cy="180" r="22" class="u2-charge-negative" /><text x="180" y="188" class="u2-svg-charge-sign" text-anchor="middle">+</text><text x="340" y="188" class="u2-svg-charge-sign" text-anchor="middle">+</text><text x="660" y="188" class="u2-svg-charge-sign" text-anchor="middle">−</text><text x="180" y="225" class="u2-svg-math" text-anchor="middle" direction="ltr">A · q₁</text><text x="340" y="225" class="u2-svg-math" text-anchor="middle" direction="ltr">B · q₂</text><text x="660" y="225" class="u2-svg-math" text-anchor="middle" direction="ltr">C · q₃</text></g>${[['f12', 'F₁₂', 'red', 105], ['f13', 'F₁₃', 'navy', 140], ['resultant', 'Fnet', 'gold', 265]].map(([key, label, color, labelY]) => `<g data-vector-arrow="${key}" opacity="0"><line data-vector-line x1="180" y1="180" x2="180" y2="180" class="u2-vector-${color}" marker-end="url(#${prefix}-vector-${color})" /><text data-vector-label x="180" y="${labelY}" class="u2-svg-force" text-anchor="middle" direction="ltr">${label}</text></g>`).join('')}</svg>`;
}

const vectorBody = () => `<p class="u2-input-help">ابنِ تمثيلك أولاً: أدخل الشدات، واختر جهة كل قوة مؤثرة في <bdi dir="ltr">q₁</bdi>، ثم اضغط «ارسم المتجهات». لن يظهر الحل النموذجي قبل التحقق.</p><div class="u2-vector-controls">${[['f12', 'القوة بين q₁ وq₂', 'F₁₂'], ['f13', 'القوة بين q₁ وq₃', 'F₁₃'], ['resultant', 'محصلة القوى على q₁', 'Fnet']].map(([key, label, symbol]) => `<fieldset class="u2-vector-control" data-vector-control="${key}"><legend><bdi dir="ltr">${symbol}</bdi> · ${label}</legend><label>الشدة<input type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-vector-value="${key}" placeholder="العدد" /></label><label>الوحدة<select data-vector-unit="${key}"><option value="N">N</option><option value="mN">mN</option><option value="kN">kN</option></select></label><label>الجهة<select data-vector-direction="${key}"><option value="">اختر الجهة</option><option value="left">إلى اليسار</option><option value="right">إلى اليمين</option></select></label><output data-vector-feedback="${key}" aria-live="polite"></output></fieldset>`).join('')}</div><div class="u2-button-row"><button class="u2-button" type="button" data-vector-draw>ارسم المتجهات على q₁</button></div><figure class="u2-vector-figure">${vectorCanvas('student')}<figcaption>لوحة الطالب: المتجهات على الحامل نفسه وتبدأ من q₁؛ الألوان للتمييز فقط، والأطوال توضيحية وليست مقياس رسم.</figcaption></figure>`;

export function unit2PracticeMarkup(id) {
  if (id === 'charge-activity') return shell(id, numericBody(id, 'الشحنة المكتسبة q', 'charge'));
  if (id === 'positive-electroscope') return shell(id, choiceBody(id, 'اختر الطريقة المناسبة:', [['negative-induction', 'أقرّب ساقاً سالبة دون لمس، ثم ألمس القرص بالإصبع، ثم أبعد الإصبع والساق معاً.'], ['positive-induction', 'أقرّب ساقاً موجبة دون لمس، ثم ألمس القرص بالإصبع، ثم أبعدهما معاً.'], ['negative-contact', 'ألمس قرص الكاشف بساق سالبة ملامسة مباشرة.'], ['near-only', 'أقرّب ساقاً سالبة ثم أبعدها دون أي لمس أو تأريض.']]));
  if (id === 'selfcheck-fill') return shell(id, fillBody());
  if (id === 'selfcheck-truth') return shell(id, truthBody());
  if (id === 'selfcheck-conductor') return shell(id, choiceBody(id, 'اختر الإجابة الأنسب:', [['isolated-rubbing', 'نعم، إذا كان الناقل معزولاً أثناء الدلك، مثل حمله بمقبض عازل.'], ['never', 'لا، لا يمكن أن يتكهرب أي ناقل بالدلك إطلاقاً.'], ['grounded', 'نعم، بشرط أن يكون الناقل موصولاً بالأرض أثناء الدلك.'], ['contact-only', 'نعم، لكن باللمس فقط دون دلك.']]));
  if (id === 'selfcheck-matching') return shell(id, matchingBody());
  if (id === 'mol-charge') return shell(id, numericBody(id, 'شحنة مول الإلكترونات q', 'charge'));
  if (id === 'distance-force') return shell(id, numericBody(id, 'شدة القوة الجديدة F₂', 'force'));
  if (id === 'three-charge-problem') return shell(id, vectorBody());
  return '';
}

const states = new WeakMap();
const stateFor = (root) => {
  if (!states.has(root)) states.set(root, { checked: false, drawn: false, request: 0, answersPromise: null });
  return states.get(root);
};
const feedback = (root, text, kind = '') => {
  const output = root.querySelector('[data-practice-feedback]');
  output.textContent = text;
  output.dataset.kind = kind;
};
const score = (root, text) => { root.querySelector('[data-practice-score]').textContent = text; };
const hide = (element, value) => { if (element) element.hidden = value; };

async function loadAnswers(root) {
  const state = stateFor(root);
  if (!state.answersPromise) state.answersPromise = import('./unit2-lesson1-self-check-answers.js').then((module) => module.UNIT2_SELF_CHECK_ANSWERS);
  return state.answersPromise;
}

async function withAnswers(root, callback) {
  const state = stateFor(root);
  const request = ++state.request;
  root.setAttribute('aria-busy', 'true');
  try {
    const answers = await loadAnswers(root);
    if (request !== state.request) return;
    await callback(answers[root.dataset.u2Practice]);
  } catch (error) {
    if (request === state.request) feedback(root, 'تعذر تحميل المساعدة الآن. أعد المحاولة.', 'error');
  } finally {
    if (request === state.request) root.removeAttribute('aria-busy');
  }
}

function renderSolution(root, spec) {
  const panel = root.querySelector('[data-practice-solution-panel]');
  const rows = (spec.solution || []).map((row, index) => ({
    kind: row.tex ? (index === 0 ? 'law' : 'substitute') : 'check',
    label: row.label,
    html: row.tex ? formula(row.tex, row.label) : `<p>${row.text}</p>`,
  }));
  panel.innerHTML = `<div class="u2-solution-heading"><span class="u2-tag u2-tag-platform">حل مشتق من المنصة · ليس نصاً إضافياً من الكتاب</span><h4>الحل النموذجي بعد محاولتك</h4></div>${solutionSteps(rows)}${spec.note ? `<p class="u2-platform-note">${spec.note}</p>` : ''}`;
  if (spec.kind === 'vectors') {
    const diagram = document.createElement('div');
    diagram.className = 'u2-solution-vector';
    diagram.innerHTML = `<h5>التمثيل الصحيح للمتجهات</h5>${vectorCanvas('solution')}<p>السهم الأحمر: تنافر q₂؛ الأزرق: تجاذب q₃؛ الذهبي المتقطع: المحصلة. جميعها على حامل واحد وتبدأ من q₁.</p>`;
    panel.appendChild(diagram);
    paintVectors(diagram, spec.expected, spec.directions, 'solution');
  }
  hide(panel, false);
}

function clearSolutionOnEdit(root) {
  const state = stateFor(root);
  state.checked = false;
  state.request += 1;
  const solutionPanel = root.querySelector('[data-practice-solution-panel]');
  hide(solutionPanel, true);
  solutionPanel.replaceChildren();
  feedback(root, '');
  score(root, '');
}

function updateTruthControls(root) {
  root.querySelectorAll('[data-truth-row]').forEach((row) => {
    const index = row.dataset.truthRow;
    const falseSelected = row.querySelector(`input[name="truth-${Number(index) + 1}"]:checked`)?.value === 'false';
    const select = row.querySelector('[data-truth-correction]');
    select.disabled = !falseSelected;
    if (!falseSelected) select.value = '';
  });
}

function clearVectorDrawing(root) {
  stateFor(root).drawn = false;
  root.querySelectorAll('[data-vector-canvas="student"] [data-vector-arrow]').forEach((group) => group.setAttribute('opacity', '0'));
  const description = root.querySelector('[data-vector-canvas="student"] [data-vector-description]');
  if (description) description.textContent = 'ثلاث شحنات على حامل واحد. لم تُرسم المتجهات بعد.';
}

function paintVectors(root, values, directions, prefix = 'student') {
  const canvas = root.querySelector(`[data-vector-canvas="${prefix}"]`);
  if (!canvas) return;
  const labels = { f12: 'F₁₂', f13: 'F₁₃', resultant: 'Fnet' };
  const lengths = {};
  for (const key of Object.keys(labels)) {
    const group = canvas.querySelector(`[data-vector-arrow="${key}"]`);
    const value = Number(values[key]);
    const direction = directions[key];
    if (!group || !Number.isFinite(value) || !direction) continue;
    const length = Math.min(145, Math.max(18, Math.abs(value) * 16));
    lengths[key] = length;
    const x2 = 180 + (direction === 'left' ? -length : length);
    const line = group.querySelector('[data-vector-line]');
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', '180');
    if (key === 'resultant') line.setAttribute('stroke-dasharray', '9 5');
    group.querySelector('[data-vector-label]').textContent = `${labels[key]} = ${Number(value.toFixed(6))} N`;
    group.setAttribute('opacity', '1');
  }
  const description = canvas.querySelector('[data-vector-description]');
  if (description) description.textContent = `متجهات مرسومة على q1: ${Object.keys(labels).map((key) => `${labels[key]} ${values[key]} نيوتن ${directions[key] === 'left' ? 'يساراً' : 'يميناً'}`).join('، ')}.`;
}

function readVectors(root) {
  const values = {}; const directions = {}; const raw = {}; const units = {};
  for (const key of ['f12', 'f13', 'resultant']) {
    raw[key] = root.querySelector(`[data-vector-value="${key}"]`).value;
    units[key] = root.querySelector(`[data-vector-unit="${key}"]`).value;
    directions[key] = root.querySelector(`[data-vector-direction="${key}"]`).value;
    const parsed = parseQuantityInput(raw[key], units[key]);
    if (!parsed || parsed.unit !== 'N' || parsed.value <= 0 || !directions[key]) return { incomplete: true };
    values[key] = parsed.value;
  }
  return { values, directions, raw, units };
}

function drawStudentVectors(root) {
  const result = readVectors(root);
  if (result.incomplete) { feedback(root, 'أدخل شدة موجبة ووحدة وجهة لكل متجه قبل الرسم.', 'error'); return; }
  paintVectors(root, result.values, result.directions);
  stateFor(root).drawn = true;
  feedback(root, 'رُسم تمثيلك. اضغط «تحقق من الإجابة» لمقارنة الفروع بشكل مستقل.', 'neutral');
}

function completeBasic(root, id) {
  if (['charge-activity', 'mol-charge', 'distance-force'].includes(id)) return Boolean(root.querySelector('[data-numeric-value]').value.trim());
  if (['positive-electroscope', 'selfcheck-conductor'].includes(id)) return Boolean(root.querySelector('input[type="radio"]:checked'));
  if (id === 'selfcheck-fill') return [...root.querySelectorAll('[data-fill-value]')].every((input) => input.value);
  if (id === 'selfcheck-truth') return [...root.querySelectorAll('[data-truth-row]')].every((row) => row.querySelector('input[type="radio"]:checked'));
  if (id === 'selfcheck-matching') return [...root.querySelectorAll('[data-match-value]')].every((input) => input.value);
  return true;
}

function checkNumeric(root, spec) {
  const raw = root.querySelector('[data-numeric-value]').value;
  const unit = root.querySelector('[data-numeric-unit]').value;
  const result = checkEquivalentQuantity(raw, unit, spec.expected, spec.unit);
  feedback(root, result.correct ? '✓ قيمة صحيحة، والوحدة متكافئة.' : 'لم تتطابق القيمة أو الوحدة. راجع الإشارة والتحويل والصيغة العلمية، ثم أعد المحاولة.', result.correct ? 'correct' : 'incorrect');
  score(root, result.correct ? 'النتيجة: صحيح' : 'النتيجة: تحتاج مراجعة');
}

function checkChoice(root, spec) {
  const selected = root.querySelector('input[type="radio"]:checked')?.value;
  const correct = selected === spec.correct;
  feedback(root, correct ? '✓ اختيار صحيح.' : 'الاختيار غير مناسب. استخدم التلميح وراجع شروط الطريقة، ثم أعد المحاولة.', correct ? 'correct' : 'incorrect');
  score(root, correct ? 'النتيجة: صحيح' : 'النتيجة: تحتاج مراجعة');
}

function checkFill(root, spec) {
  let correct = 0;
  root.querySelectorAll('[data-fill-value]').forEach((input) => {
    const index = Number(input.dataset.fillValue);
    const valid = input.value === spec.items[index];
    if (valid) correct += 1;
    const output = root.querySelector(`[data-fill-feedback="${index}"]`);
    output.textContent = valid ? '✓ صحيح' : 'راجع هذا الفراغ';
    output.dataset.kind = valid ? 'correct' : 'incorrect';
  });
  score(root, `النتيجة: ${correct} / ${spec.items.length}`);
  feedback(root, correct === spec.items.length ? 'أحسنت، اكتملت الفراغات.' : 'صُحّح كل فراغ على حدة؛ لم تُكشف الكلمات الصحيحة بعد.', correct === spec.items.length ? 'correct' : 'incorrect');
}

function checkTruth(root, spec) {
  let correct = 0;
  root.querySelectorAll('[data-truth-row]').forEach((row) => {
    const index = Number(row.dataset.truthRow);
    const judgement = row.querySelector('input[type="radio"]:checked').value === 'true';
    const expected = spec.items[index];
    const correction = row.querySelector('[data-truth-correction]').value;
    const judgementCorrect = judgement === expected.truth;
    const correctionCorrect = expected.truth || correction === expected.correction;
    const valid = judgementCorrect && correctionCorrect;
    if (valid) correct += 1;
    const output = row.querySelector('[data-truth-feedback]');
    output.textContent = valid ? '✓ الحكم والتصحيح صحيحان' : judgementCorrect ? 'الحكم صحيح؛ راجع التصحيح' : 'راجع الحكم والتصحيح';
    output.dataset.kind = valid ? 'correct' : 'incorrect';
  });
  score(root, `النتيجة: ${correct} / ${spec.items.length}`);
  feedback(root, correct === spec.items.length ? 'أحسنت، كل الأحكام والتصحيحات صحيحة.' : 'لكل عبارة نتيجة مستقلة. عند اختيار «غلط» يجب اختيار تصحيحها أيضاً.', correct === spec.items.length ? 'correct' : 'incorrect');
}

function checkMatching(root, spec) {
  let correct = 0;
  root.querySelectorAll('[data-match-value]').forEach((input) => {
    const index = Number(input.dataset.matchValue);
    const valid = input.value === spec.items[index];
    if (valid) correct += 1;
    const output = root.querySelector(`[data-match-feedback="${index}"]`);
    output.textContent = valid ? '✓ صحيح' : 'راجع هذا الربط';
    output.dataset.kind = valid ? 'correct' : 'incorrect';
  });
  score(root, `النتيجة: ${correct} / ${spec.items.length}`);
  feedback(root, correct === spec.items.length ? 'أحسنت، المطابقة مكتملة.' : 'كل وصلة تُصحّح باستقلال؛ توجد كلمة زائدة في العمود B.', correct === spec.items.length ? 'correct' : 'incorrect');
}

function checkVectors(root, spec) {
  const current = readVectors(root);
  if (current.incomplete) { feedback(root, 'أكمل الشدات والوحدات والجهات، ثم ارسم المتجهات قبل التحقق.', 'error'); return; }
  let correct = 0;
  for (const key of ['f12', 'f13', 'resultant']) {
    const numeric = checkEquivalentQuantity(current.raw[key], current.units[key], spec.expected[key], 'N');
    const direction = current.directions[key] === spec.directions[key];
    if (numeric.correct) correct += 1;
    if (direction) correct += 1;
    const output = root.querySelector(`[data-vector-feedback="${key}"]`);
    output.textContent = `${numeric.correct ? '✓ الشدة' : 'راجع الشدة'} · ${direction ? '✓ الجهة' : 'راجع الجهة'}`;
    output.dataset.kind = numeric.correct && direction ? 'correct' : 'incorrect';
  }
  score(root, `النتيجة: ${correct} / 6 · ثلاث شدات وثلاث جهات`);
  feedback(root, correct === 6 ? 'أحسنت، الشدات والجهات والرسم متوافقة.' : 'صُحّحت الشدة والجهة لكل متجه باستقلال. عدّل مدخلاتك ثم أعد الرسم والتحقق.', correct === 6 ? 'correct' : 'incorrect');
}

const checkers = { numeric: checkNumeric, choice: checkChoice, fill: checkFill, truth: checkTruth, matching: checkMatching, vectors: checkVectors };

function resetPractice(root) {
  const state = stateFor(root);
  state.request += 1; state.checked = false; state.drawn = false;
  root.querySelector('[data-practice-form]').reset();
  root.querySelectorAll('[data-fill-feedback], [data-truth-feedback], [data-match-feedback], [data-vector-feedback]').forEach((output) => { output.textContent = ''; delete output.dataset.kind; });
  const hintPanel = root.querySelector('[data-practice-hint-panel]');
  const solutionPanel = root.querySelector('[data-practice-solution-panel]');
  hide(hintPanel, true);
  hide(solutionPanel, true);
  hintPanel.replaceChildren();
  solutionPanel.replaceChildren();
  clearVectorDrawing(root);
  updateTruthControls(root);
  feedback(root, 'أُعيد ضبط هذا السؤال وحده.'); score(root, '');
}

function mountPractice(root) {
  if (root.dataset.mounted === 'true') return;
  root.dataset.mounted = 'true';
  const id = root.dataset.u2Practice;
  const state = stateFor(root);
  root.querySelector('[data-practice-form]').addEventListener('submit', (event) => event.preventDefault());
  root.querySelectorAll('[data-practice-action]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.practiceAction;
    if (action === 'reset') { resetPractice(root); return; }
    if (action === 'hint') {
      withAnswers(root, (spec) => {
        const panel = root.querySelector('[data-practice-hint-panel]');
        panel.innerHTML = `<span class="u2-tag u2-tag-platform">تلميح من المنصة</span><p>${spec.hint}</p>`;
        hide(panel, false);
      });
      return;
    }
    if (action === 'solution') {
      if (!state.checked) { feedback(root, 'أدخل إجابتك واضغط «تحقق من الإجابة» أولاً؛ ثم يمكنك فتح الحل النموذجي.', 'error'); return; }
      withAnswers(root, (spec) => renderSolution(root, spec));
      return;
    }
    if (id === 'three-charge-problem' && !state.drawn) { feedback(root, 'ابنِ المتجهات على لوحة الرسم أولاً، ثم اطلب التحقق.', 'error'); return; }
    if (!completeBasic(root, id)) { feedback(root, 'أكمل جميع الحقول أو الاختيارات المطلوبة قبل التحقق.', 'error'); return; }
    withAnswers(root, (spec) => {
      checkers[spec.kind](root, spec);
      state.checked = true;
    });
  }));
  root.querySelector('[data-vector-draw]')?.addEventListener('click', () => drawStudentVectors(root));
  root.querySelectorAll('input, select').forEach((input) => {
    input.addEventListener('input', () => {
      clearSolutionOnEdit(root);
      if (id === 'three-charge-problem') clearVectorDrawing(root);
      updateTruthControls(root);
    });
    input.addEventListener('change', () => {
      clearSolutionOnEdit(root);
      if (id === 'three-charge-problem') clearVectorDrawing(root);
      updateTruthControls(root);
    });
  });
  updateTruthControls(root);
}

export function mountUnit2Practice(scope) {
  scope.querySelectorAll('[data-u2-practice]').forEach((root) => {
    if (!root.innerHTML.trim()) root.innerHTML = unit2PracticeMarkup(root.dataset.u2Practice);
    if (root.innerHTML.trim()) mountPractice(root);
  });
}
