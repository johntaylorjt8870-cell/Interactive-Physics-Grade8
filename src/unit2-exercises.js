import { UNIT2_EXERCISES, UNIT2_EXERCISE_META } from './unit2-exercises-data.js';

const KEY = 'physics8.unit2.textbook-exercises.v1';
const state = loadState();
const index = document.querySelector('#exercise-index');
const mount = document.querySelector('#exercise-content');
const safe = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const fieldId = (id) => `response-${id}`;

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private browsing/storage disabled: current-page interactions still work */ }
}
function stateFor(id) { return state[id] ??= { answer: '', reviewed: false }; }
function questionDiagram(kind) {
  if (kind === 'charges') return `<figure class="u2-diagram"><svg viewBox="0 0 430 255" role="img" aria-labelledby="charge-title charge-desc"><title id="charge-title">المخطط المثلثي للشحنات في السؤال 3، المسألة الثانية</title><desc id="charge-desc">شحنة q1 أعلى q3، وشحنة q2 إلى يمين q3. الضلعان القائمان متساويان وطول كل منهما d.</desc><path d="M90 36V190H310Z" fill="none" stroke="#4266a8" stroke-width="4"/><circle cx="90" cy="36" r="7" fill="#273957"/><circle cx="90" cy="190" r="7" fill="#273957"/><circle cx="310" cy="190" r="7" fill="#273957"/><text x="106" y="34" class="diagram-ltr">q₁</text><text x="106" y="215" class="diagram-ltr">q₃</text><text x="318" y="215" class="diagram-ltr">q₂</text><text x="66" y="119" class="diagram-ltr">d</text><text x="192" y="221" class="diagram-ltr">d</text><path d="M90 174h16v16" fill="none" stroke="#8492a9" stroke-width="2"/></svg><figcaption>إعادة رسم توضيحية للمخطط المطبوع؛ الشحنتان q₁ وq₂ تبعدان d عن q₃.</figcaption></figure>`;
  if (kind === 'circuit') return `<figure class="u2-diagram"><svg viewBox="0 0 520 240" role="img" aria-labelledby="circuit-title circuit-desc"><title id="circuit-title">دارة المسألة الرابعة: R1 على التسلسل مع R2 وR3 على التفرع</title><desc id="circuit-desc">مقاومة R1 تسبق عقدة تفرع. R2 وR3 موصولتان بين العقدتين نفسيهما، والمصدر 12 فولت.</desc><path d="M65 58H155 M230 58H295V36H380 M295 58V170H380 M440 36V170H460V210H65V58" fill="none" stroke="#4266a8" stroke-width="4" stroke-linejoin="round"/><path d="M155 58l9-9 9 18 9-18 9 18 9-18 9 18 9-9" fill="none" stroke="#8965a1" stroke-width="4"/><path d="M380 36l8-9 8 18 8-18 8 18 8-9" fill="none" stroke="#d77b37" stroke-width="4"/><path d="M380 170l8-9 8 18 8-18 8 18 8-9" fill="none" stroke="#6c9b52" stroke-width="4"/><path d="M190 210v-17 M204 210v-27" stroke="#d64d55" stroke-width="3"/><text x="180" y="93" class="diagram-ltr">R₁ = 8 Ω</text><text x="385" y="21" class="diagram-ltr">R₂ = 6 Ω</text><text x="385" y="206" class="diagram-ltr">R₃ = 3 Ω</text><text x="214" y="233" class="diagram-ltr">U = 12 V</text><circle cx="295" cy="58" r="5" fill="#263b60"/><circle cx="295" cy="170" r="5" fill="#263b60"/></svg><figcaption>مخطط تخطيطي معاد رسمه من المصدر لتوضيح العقد: R₂ وR₃ على التفرع، والمجموعة على التسلسل مع R₁.</figcaption></figure>`;
  return '';
}
function renderItem(section, item) {
  const value = stateFor(item.id);
  const sourcePage = item.page ?? section.page;
  const control = item.kind === 'choice'
    ? `<fieldset class="u2-options"><legend>اختر خياراً واحداً</legend>${item.options.map((option, index) => `<label class="u2-option"><input type="radio" name="${safe(item.id)}" value="${safe(String.fromCharCode(97 + index))}" ${value.answer === String.fromCharCode(97 + index) ? 'checked' : ''}><span class="u2-option-key" dir="ltr">${String.fromCharCode(97 + index)}.</span><span>${safe(option)}</span></label>`).join('')}</fieldset>`
    : `<label class="u2-answer-label" for="${fieldId(item.id)}">مساحة إجابتك <span>${item.kind === 'text' ? 'اكتب تفسيرك أو خطوات الحساب ووحدات النتيجة.' : 'اكتب إجابتك.'}</span></label><textarea id="${fieldId(item.id)}" name="${safe(item.id)}" rows="3" placeholder="دوّن ما فكرت به…" spellcheck="false">${safe(value.answer)}</textarea>`;
  return `<article class="u2-item ${value.reviewed ? 'is-reviewed' : ''}" id="item-${safe(item.id)}" data-item-id="${safe(item.id)}"><header class="u2-item-heading"><span class="u2-item-number">${safe(item.label)} · ص ${sourcePage}</span><span class="u2-item-status" data-status>${value.reviewed ? 'راجعت هذا الفرع' : value.answer ? 'إجابة محفوظة' : 'بانتظار المحاولة'}</span></header><h3>${safe(item.prompt)}</h3>${control}<div class="u2-item-actions"><button type="button" class="u2-secondary" data-hint aria-expanded="false" aria-controls="hint-${safe(item.id)}">أظهر التلميح</button><button type="button" class="u2-review ${value.reviewed ? 'is-done' : ''}" data-review>${value.reviewed ? 'إلغاء المراجعة' : 'راجعت إجابتي'}</button></div><p class="u2-hint" id="hint-${safe(item.id)}" hidden>${safe(item.hint)}</p><p class="u2-feedback" data-feedback aria-live="polite">${value.answer ? 'إجابتك محفوظة تلقائياً على هذا الجهاز.' : ''}</p></article>`;
}
function renderSection(section, number) {
  const continued = section.page === 122 ? ' · متابعة تمرينات الصفحة السابقة' : '';
  return `<section class="u2-exercise-section" id="section-${safe(section.id)}" aria-labelledby="heading-${safe(section.id)}" data-page="${section.page}"><header class="u2-section-heading"><div><p class="u2-section-kicker">دفتر الوحدة · المحطة ${String(number).padStart(2, '0')}${continued}</p><h2 id="heading-${safe(section.id)}">${safe(section.title)}</h2></div><span class="u2-page-tag">ص <bdi dir="ltr">${section.page}</bdi></span></header>${section.intro ? `<p class="u2-source-intro">${safe(section.intro)}</p>` : ''}${section.id === 'project' ? '<aside class="u2-safety-note"><strong>سلامة كهربائية:</strong> الجهد المنزلي 220 V خطر؛ لا تُجرّب توصيل المصابيح بالشبكة بنفسك. استخدم بيانات الملصقات أو نفّذ النشاط فقط بإشراف المعلم وبمعدات معزولة.</aside>' : ''}${questionDiagram(section.diagram)}${section.items.map((item) => renderItem(section, item)).join('')}</section>`;
}

index.innerHTML = UNIT2_EXERCISES.map((section, i) => `<a href="#section-${safe(section.id)}"><span class="u2-index-num" dir="ltr">${String(i + 1).padStart(2, '0')}</span><span>${safe(section.title.replace(/^السؤال الثالث · /, 'المسألة · '))}</span><bdi>ص ${section.page}</bdi></a>`).join('');
mount.innerHTML = UNIT2_EXERCISES.map(renderSection).join('');
document.querySelector('#total-count').textContent = UNIT2_EXERCISE_META.responseItemCount;
document.querySelector('.u2-progress-meter').setAttribute('aria-valuemax', String(UNIT2_EXERCISE_META.responseItemCount));

function updateProgress() {
  const values = UNIT2_EXERCISES.flatMap((section) => section.items).map((item) => stateFor(item.id));
  const reviewed = values.filter((item) => item.reviewed).length;
  const answered = values.filter((item) => item.answer.trim()).length;
  document.querySelector('#reviewed-count').textContent = reviewed;
  document.querySelector('.u2-progress-meter').setAttribute('aria-valuenow', String(reviewed));
  document.querySelector('#progress-fill').style.width = `${reviewed / values.length * 100}%`;
  document.querySelector('#progress-message').textContent = `${answered} إجابة محفوظة · لا يُحكم على إجاباتك آلياً؛ راجع خطواتك ومعيار التلميح.`;
}

mount.addEventListener('input', (event) => {
  const itemElement = event.target.closest('[data-item-id]');
  if (!itemElement) return;
  const id = itemElement.dataset.itemId;
  if (event.target.matches('textarea')) stateFor(id).answer = event.target.value;
  if (event.target.matches('input[type="radio"]')) stateFor(id).answer = event.target.value;
  persist();
  const status = itemElement.querySelector('[data-status]');
  if (!stateFor(id).reviewed) status.textContent = stateFor(id).answer ? 'إجابة محفوظة' : 'بانتظار المحاولة';
  updateProgress();
});
mount.addEventListener('click', (event) => {
  const itemElement = event.target.closest('[data-item-id]');
  if (!itemElement) return;
  const id = itemElement.dataset.itemId;
  if (event.target.closest('[data-hint]')) {
    const button = event.target.closest('[data-hint]');
    const hint = itemElement.querySelector('.u2-hint');
    hint.hidden = !hint.hidden;
    button.setAttribute('aria-expanded', String(!hint.hidden));
    button.textContent = hint.hidden ? 'أظهر التلميح' : 'أخفِ التلميح';
  }
  if (event.target.closest('[data-review]')) {
    const record = stateFor(id);
    const feedback = itemElement.querySelector('[data-feedback]');
    if (!record.answer.trim()) {
      feedback.textContent = 'اكتب محاولة أولاً، ثم راجعها في ضوء التلميح والوحدات وخطوات الاستدلال.';
      itemElement.querySelector('textarea, input[type="radio"]')?.focus();
      return;
    }
    record.reviewed = !record.reviewed;
    persist();
    itemElement.classList.toggle('is-reviewed', record.reviewed);
    itemElement.querySelector('[data-review]').textContent = record.reviewed ? 'إلغاء المراجعة' : 'راجعت إجابتي';
    itemElement.querySelector('[data-review]').classList.toggle('is-done', record.reviewed);
    itemElement.querySelector('[data-status]').textContent = record.reviewed ? 'راجعت هذا الفرع' : 'إجابة محفوظة';
    feedback.textContent = record.reviewed ? 'سُجّلت مراجعتك. قارن تفسيرك بالقانون المناسب، وارجع إلى الحل النموذجي في منطقة المعلم عند الحاجة.' : 'يمكنك متابعة مراجعة هذا الفرع.';
    updateProgress();
  }
});
document.querySelector('#clear-answers').addEventListener('click', () => {
  if (!globalThis.confirm('هل تريد مسح جميع الإجابات المحفوظة ومؤشر التقدم؟')) return;
  localStorage.removeItem(KEY);
  location.reload();
});
updateProgress();
