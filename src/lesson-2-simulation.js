import { V_F, V_F1, V_F2, formula, ltrText, qty } from './math.js';
import {
  momentProducts,
  oppositeSenseParallelResultant,
  sameSenseParallelResultant,
} from './lesson-2-physics.js';

const fmt = (value, digits = 2) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return String(Number(n.toFixed(digits)));
};

const rangeControl = (id, label, symbol, min, max, step, value, unit) => `
  <div class="simulation-control">
    <div class="simulation-control-heading">
      <label for="${id}">${label} ${symbol}</label>
      <output id="${id}-value" class="simulation-control-value" for="${id}"><bdi dir="ltr">${value} ${unit}</bdi></output>
    </div>
    <input class="simulation-range" id="${id}" data-parallel-input type="range"
      min="${min}" max="${max}" step="${step}" value="${value}" data-default="${value}"
      aria-label="${label}" aria-valuetext="${value} ${unit}" />
    <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">${min} ${unit}</bdi><bdi dir="ltr">${max} ${unit}</bdi></div>
  </div>`;

function definitionLabMarkup() {
  return `<aside class="simulation-experience l2-simulation" data-lesson2-simulation="parallel-definition-lab" aria-labelledby="def-lab-title">
    <header class="simulation-header">
      <div class="simulation-header-top">
        <span class="simulation-badge">تجربة تفاعلية · ص 64</span>
        <span class="simulation-model-label">Educational simplified model</span>
      </div>
      <h3 id="def-lab-title">مختبر لوح الربائع: من الربيعة الواحدة إلى الحوامل المتوازية</h3>
      <p>نفّذ خطوات تجربة الكتاب بالترتيب. النموذج هندسي تعليمي: لا يحاكي مرونة الربيعة الحقيقية ولا قراءة تدريجها.</p>
    </header>
    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="خطوات تجربة التعريف">
        <p class="sim-step-label">خطوات التجربة</p>
        <div class="sim-step-buttons" role="group" aria-label="اختيار خطوة التجربة">
          <button type="button" class="sim-chip is-active" data-def-step="1">1. ربيعة واحدة</button>
          <button type="button" class="sim-chip" data-def-step="2">2. ربيعتان ومسطرة</button>
          <button type="button" class="sim-chip" data-def-step="3">3. أرسم الحوامل</button>
          <button type="button" class="sim-chip" data-def-step="4">4. أرفع الجهاز</button>
        </div>
        <div class="sim-step-box" data-def-step-copy>
          <strong>الخطوة 1 من الكتاب:</strong>
          <p>أعلّق جسماً في خطّاف ربيعة فيتأثر بقوة ثقله. ما حامل هذه القوة؟ وما جهتها؟</p>
        </div>
        <div class="simulation-result-grid">
          <div class="simulation-result-cell"><span>وضع الحوامل</span><output class="simulation-result-value" data-def-carriers>حامل واحد شاقولي</output></div>
          <div class="simulation-result-cell"><span>جهة الثقل</span><output class="simulation-result-value" data-def-weight>إلى أسفل</output></div>
        </div>
        <div class="simulation-status" role="status" aria-live="polite" data-def-status>حامل الثقل شاقولي وجهته إلى أسفل.</div>
        <button type="button" class="sim-btn sim-btn-ghost" data-def-reset>إعادة الضبط</button>
      </section>
      <figure class="simulation-visual">
        <div class="simulation-svg-wrap">
          <svg viewBox="0 0 720 360" role="img" aria-labelledby="def-svg-title def-svg-desc">
            <title id="def-svg-title">تجربة تعريف القوى المتوازية</title>
            <desc id="def-svg-desc" data-def-description>جسم معلّق في ربيعة واحدة وثقلُه إلى أسفل.</desc>
            <defs>
              <marker id="def-f1" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#0f766e"/></marker>
              <marker id="def-f2" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1d4ed8"/></marker>
              <marker id="def-w" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#b45309"/></marker>
            </defs>
            <line data-def-c1 x1="360" y1="30" x2="360" y2="330" class="l2-carrier" opacity="0" />
            <line data-def-c2 x1="170" y1="30" x2="170" y2="330" class="l2-carrier" opacity="0" />
            <line data-def-c3 x1="550" y1="30" x2="550" y2="330" class="l2-carrier" opacity="0" />
            <rect data-def-bar x="150" y="150" width="420" height="16" rx="6" class="l2-bar" opacity="0" />
            <line data-def-f2 x1="170" y1="150" x2="170" y2="70" class="l2-force l2-force-f2" marker-end="url(#def-f2)" opacity="0" />
            <line data-def-f1 x1="550" y1="150" x2="550" y2="70" class="l2-force l2-force-f1" marker-end="url(#def-f1)" opacity="0" />
            <rect data-def-mass x="338" y="168" width="44" height="26" rx="4" class="l2-mass" />
            <line data-def-w x1="360" y1="180" x2="360" y2="280" class="l2-force l2-force-weight" marker-end="url(#def-w)" />
            <text data-def-lf2 x="142" y="64" class="l2-force-label l2-force-label-f2" opacity="0" direction="ltr">F₂</text>
            <text data-def-lf1 x="578" y="64" class="l2-force-label l2-force-label-f1" opacity="0" direction="ltr">F₁</text>
            <text x="392" y="292" class="l2-force-label l2-force-label-weight" direction="ltr">w</text>
            <text data-def-lc x="360" y="142" class="l2-point-label" text-anchor="middle" direction="ltr" opacity="0">C</text>
          </svg>
        </div>
        <figcaption data-def-caption>في الربيعة الواحدة: حامل الثقل شاقولي وجهته إلى أسفل.</figcaption>
      </figure>
    </div>
    <section class="sim-prediction-card" data-def-predict aria-labelledby="def-predict-title">
      <div class="sim-prediction-head">
        <span class="sim-prediction-badge">تنبّأ ثم لاحظ</span>
        <h4 id="def-predict-title">بعد رفع الربائع والمسطرة، ما وضع الخطوط الثلاثة المرسومة؟</h4>
      </div>
      <div class="sim-prediction-options">
        <label class="sim-prediction-option"><input type="radio" name="def-predict" value="a" /> تتقاطع الخطوط الثلاثة في نقطة واحدة مثل القوى المتلاقية.</label>
        <label class="sim-prediction-option"><input type="radio" name="def-predict" value="b" /> تبقى ثلاثة مستقيمات متوازية لا تتقاطع.</label>
        <label class="sim-prediction-option"><input type="radio" name="def-predict" value="c" /> ينطبق حاملا الشدّين فيستحيلان مستقيماً واحداً.</label>
      </div>
      <div class="sim-prediction-actions">
        <button type="button" class="sim-btn sim-btn-primary" data-def-predict-check>تحقّق من التنبؤ</button>
        <button type="button" class="sim-btn sim-btn-ghost" data-def-predict-retry hidden>أعد المحاولة</button>
      </div>
      <div class="sim-prediction-feedback" data-def-predict-feedback hidden role="status" aria-live="polite"></div>
    </section>
  </aside>`;
}

function resultantLabMarkup() {
  return `<aside class="simulation-experience l2-simulation" data-lesson2-simulation="parallel-resultant-lab" aria-labelledby="parallel-lab-title">
    <header class="simulation-header">
      <div class="simulation-header-top">
        <span class="simulation-badge">تجربة تفاعلية · ص 65–68</span>
        <span class="simulation-model-label">Educational simplified model</span>
      </div>
      <h3 id="parallel-lab-title">مختبر موضع محصلة قوتين متوازيتين</h3>
      <p>غيّر الشدتين والمسافة والجهتين. يتحدّث الرسم والحساب معاً وفق ${formula('F_{1}\\\\times d_{1}=F_{2}\\\\times d_{2}', 'F one times d one equals F two times d two')}. النموذج هندسي ولا يحاكي مرونة المسطرة.</p>
    </header>
    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="ضوابط القوى المتوازية">
        <fieldset class="parallel-mode-control">
          <legend>جهتا القوتين</legend>
          <label><input type="radio" name="parallel-mode" value="same" checked data-parallel-mode /> جهة واحدة</label>
          <label><input type="radio" name="parallel-mode" value="opposite" data-parallel-mode /> جهتان متعاكستان</label>
        </fieldset>
        <div class="sim-preset-bar">
          <span class="sim-preset-title">أمثلة من الكتاب:</span>
          <button type="button" class="sim-chip" data-parallel-preset="same-book">20 N و 30 N · جهة واحدة</button>
          <button type="button" class="sim-chip" data-parallel-preset="equal">قوتان متساويتان</button>
          <button type="button" class="sim-chip" data-parallel-preset="opposite-book">نسبة 2:3 · تعاكس</button>
        </div>
        ${rangeControl('parallel-f1', 'مقدار القوة الأولى', V_F1, 5, 80, 5, 20, 'N')}
        ${rangeControl('parallel-f2', 'مقدار القوة الثانية', V_F2, 5, 80, 5, 30, 'N')}
        ${rangeControl('parallel-distance', 'المسافة بين الحاملين', ltrText('d'), 20, 100, 5, 50, 'cm')}
        <div class="simulation-sweep-row">
          <button class="simulation-sweep" type="button" data-parallel-sweep aria-describedby="parallel-sweep-help"><span aria-hidden="true">▶</span> شاهد نقطة المحصلة تتحرك</button>
          <button class="sim-btn sim-btn-ghost" type="button" data-parallel-reset>إعادة الضبط</button>
        </div>
        <p class="simulation-sweep-hint" id="parallel-sweep-help">تزداد القوة الثانية تدريجياً، فتتحرك C وفق علاقة الجداءين.</p>
        <div class="simulation-result-grid simulation-result-grid-3">
          <div class="simulation-result-cell"><span>شدة المحصلة ${V_F}</span><output class="simulation-result-value" data-parallel-result><bdi dir="ltr">50 N</bdi></output></div>
          <div class="simulation-result-cell"><span>بعد ${V_F1} عن C</span><output class="simulation-result-value" data-parallel-d1><bdi dir="ltr">30 cm</bdi></output></div>
          <div class="simulation-result-cell"><span>بعد ${V_F2} عن C</span><output class="simulation-result-value" data-parallel-d2><bdi dir="ltr">20 cm</bdi></output></div>
        </div>
        <div class="sim-dual-verification" data-parallel-moments>
          <span>الجداءان: <bdi dir="ltr">20 × 30 = 30 × 20</bdi></span>
        </div>
        <div class="simulation-status" role="status" aria-live="polite" aria-atomic="true" data-parallel-status>تقع المحصلة بين القوتين وأقرب إلى القوة الثانية الأكبر.</div>
      </section>
      <figure class="simulation-visual">
        <div class="simulation-svg-wrap">
          <svg viewBox="0 0 720 390" role="img" aria-labelledby="parallel-svg-title parallel-svg-desc">
            <title id="parallel-svg-title">تغير موضع محصلة قوتين متوازيتين</title>
            <desc id="parallel-svg-desc" data-parallel-description>قوتان متوازيتان في جهة واحدة، ومحصلتهما بينهما.</desc>
            <defs>
              <marker id="parallel-green-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#0f766e"/></marker>
              <marker id="parallel-blue-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#1d4ed8"/></marker>
              <marker id="parallel-red-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#c2410c"/></marker>
            </defs>
            <line data-bar x1="90" y1="210" x2="630" y2="210" class="parallel-lab-bar"/>
            <line data-c-f1 x1="190" y1="36" x2="190" y2="350" class="parallel-lab-carrier"/>
            <line data-c-f2 x1="530" y1="36" x2="530" y2="350" class="parallel-lab-carrier"/>
            <line data-result-carrier x1="360" y1="30" x2="360" y2="355" class="parallel-lab-result-carrier"/>
            <line data-vector="f1" x1="190" y1="210" x2="190" y2="120" class="parallel-lab-force f1" marker-end="url(#parallel-green-arrow)"/>
            <line data-vector="f2" x1="530" y1="210" x2="530" y2="90" class="parallel-lab-force f2" marker-end="url(#parallel-blue-arrow)"/>
            <line data-vector="result" x1="360" y1="210" x2="360" y2="64" class="parallel-lab-force result" marker-end="url(#parallel-red-arrow)"/>
            <circle data-result-point cx="360" cy="210" r="7" class="parallel-lab-result-point"/>
            <text data-lab-a x="190" y="372" class="l2-point-label" text-anchor="middle" direction="ltr">A</text>
            <text data-lab-b x="530" y="372" class="l2-point-label" text-anchor="middle" direction="ltr">B</text>
            <text data-result-label x="360" y="372" class="l2-point-label result-label" text-anchor="middle" direction="ltr">C</text>
            <text data-f1-label x="160" y="110" class="parallel-svg-force-label" direction="ltr">F₁</text>
            <text data-f2-label x="552" y="80" class="parallel-svg-force-label" direction="ltr">F₂</text>
            <text data-result-symbol x="382" y="56" class="parallel-svg-force-label result" direction="ltr">F</text>
          </svg>
        </div>
        <figcaption data-parallel-caption>في الجهة الواحدة: ${formula('F=F_{1}+F_{2}', 'F equals F one plus F two')}</figcaption>
      </figure>
    </div>
    <p class="sim-live-why" data-parallel-why>لأن F2 أكبر من F1، يكون بعدها عن C أصغر حتى يتساوى الجداءان. لذلك تقترب C من القوة الأكبر.</p>
    <section class="sim-prediction-card" data-res-predict aria-labelledby="res-predict-title">
      <div class="sim-prediction-head">
        <span class="sim-prediction-badge">تنبّأ قبل التحريك</span>
        <h4 id="res-predict-title">إذا ثبّتنا المسافة والقوة الأولى ثم زدنا F2 (والجهتان واحدة)، فإلى أين تتحرك C؟</h4>
      </div>
      <div class="sim-prediction-options">
        <label class="sim-prediction-option"><input type="radio" name="res-predict" value="a" /> تبتعد عن F2 لأن القوة الأكبر تحتاج بعداً أكبر.</label>
        <label class="sim-prediction-option"><input type="radio" name="res-predict" value="b" /> تقترب من F2 حتى يبقى الجداءان متساويين.</label>
        <label class="sim-prediction-option"><input type="radio" name="res-predict" value="c" /> تبقى في المنتصف لأن المسافة بين الحاملين لم تتغير.</label>
      </div>
      <div class="sim-prediction-actions">
        <button type="button" class="sim-btn sim-btn-primary" data-res-predict-check>تحقّق من التنبؤ</button>
        <button type="button" class="sim-btn sim-btn-ghost" data-res-predict-retry hidden>أعد المحاولة</button>
      </div>
      <div class="sim-prediction-feedback" data-res-predict-feedback hidden role="status" aria-live="polite"></div>
    </section>
  </aside>`;
}

export function lesson2SimulationMarkup(id) {
  if (id === 'parallel-definition-lab') return definitionLabMarkup();
  if (id === 'parallel-resultant-lab') return resultantLabMarkup();
  return '';
}

const DEF_COPY = {
  1: {
    title: 'الخطوة 1 من الكتاب:',
    body: 'أعلّق جسماً في خطّاف ربيعة فيتأثر بقوة ثقله. ما حامل هذه القوة؟ وما جهتها؟',
    carriers: 'حامل واحد شاقولي',
    weight: 'إلى أسفل',
    status: 'حامل الثقل شاقولي وجهته إلى أسفل. لا توجد بعدُ قوتا شدّ متوازيتان.',
    caption: 'في الربيعة الواحدة: حامل الثقل شاقولي وجهته إلى أسفل.',
    desc: 'جسم معلّق في ربيعة واحدة وثقلُه إلى أسفل على حامل شاقولي.',
  },
  2: {
    title: 'الخطوة 2 من الكتاب:',
    body: 'أربط خطّافي ربيعتين وأعلّقهما بطرفي مسطرة، وأعلّق خطاف الجسم بالنقطة C بحيث تبقى المسطرة أفقية.',
    carriers: 'ثلاثة حوامل شاقولية',
    weight: 'إلى أسفل كما كانت',
    status: 'حاملا الشدّين ليسا الاستقامة ذاتها: هما مستقيمان منفصلان. حامل الثقل لم تتغير جهته.',
    caption: 'مسطرة أفقية: شدّان إلى أعلى وثقل إلى أسفل عند C.',
    desc: 'ربيعتان عند الطرفين وثقل عند C، والحوامل الثلاثة شاقولية.',
  },
  3: {
    title: 'الخطوة من «أتساءل»:',
    body: 'أرسم على اللوح ثلاثة خطوط على امتداد كل ربيعة تمثّل حوامل القوى.',
    carriers: 'ثلاثة مستقيمات مرسومة',
    weight: 'إلى أسفل',
    status: 'امتداد كل سهم يعطي حاملاً. الخطوط الثلاثة شاقولية، فهي متوازية.',
    caption: 'الحوامل الثلاثة ممدودة بخطوط متقطعة متوازية.',
    desc: 'ثلاثة خطوط شاقولية متقطعة تمثّل حوامل F1 و F2 و w.',
  },
  4: {
    title: 'رفع الجهاز:',
    body: 'أرفع الربائع والمسطرة. ماذا ألاحظ؟ ما وضع الخطوط الممثلة لحوامل القوى الثلاث؟',
    carriers: 'مستقيمات متوازية',
    weight: 'إلى أسفل',
    status: 'بعد رفع الجهاز تبقى الخطوط المرسومة: ثلاثة مستقيمات متوازية. هذا هو تعريف القوى المتوازية.',
    caption: 'بعد رفع الجهاز: الخطوط الثلاثة مستقيمات متوازية.',
    desc: 'ثلاثة مستقيمات متوازية متبقية بعد رفع الربائع والمسطرة.',
  },
};

function setOpacity(el, on) {
  if (el) el.setAttribute('opacity', on ? '1' : '0');
}

function mountDefinitionLab(lab) {
  const buttons = [...lab.querySelectorAll('[data-def-step]')];
  const copyBox = lab.querySelector('[data-def-step-copy]');
  const carriersOut = lab.querySelector('[data-def-carriers]');
  const weightOut = lab.querySelector('[data-def-weight]');
  const status = lab.querySelector('[data-def-status]');
  const caption = lab.querySelector('[data-def-caption]');
  const desc = lab.querySelector('[data-def-description]');
  let step = 1;

  const apply = (next) => {
    step = next;
    const copy = DEF_COPY[step];
    buttons.forEach((btn) => btn.classList.toggle('is-active', Number(btn.dataset.defStep) === step));
    copyBox.innerHTML = `<strong>${copy.title}</strong><p>${copy.body}</p>`;
    carriersOut.textContent = copy.carriers;
    weightOut.textContent = copy.weight;
    status.textContent = copy.status;
    caption.textContent = copy.caption;
    desc.textContent = copy.desc;
    const two = step >= 2;
    const lines = step >= 3;
    setOpacity(lab.querySelector('[data-def-bar]'), two);
    setOpacity(lab.querySelector('[data-def-f1]'), two);
    setOpacity(lab.querySelector('[data-def-f2]'), two);
    setOpacity(lab.querySelector('[data-def-lf1]'), two);
    setOpacity(lab.querySelector('[data-def-lf2]'), two);
    setOpacity(lab.querySelector('[data-def-lc]'), two);
    setOpacity(lab.querySelector('[data-def-c1]'), lines);
    setOpacity(lab.querySelector('[data-def-c2]'), lines);
    setOpacity(lab.querySelector('[data-def-c3]'), lines);
    const mass = lab.querySelector('[data-def-mass]');
    const w = lab.querySelector('[data-def-w]');
    if (step === 4) {
      setOpacity(lab.querySelector('[data-def-bar]'), false);
      setOpacity(lab.querySelector('[data-def-f1]'), true);
      setOpacity(lab.querySelector('[data-def-f2]'), true);
      if (mass) mass.setAttribute('opacity', '0');
    } else if (mass) mass.setAttribute('opacity', '1');
    if (w) {
      w.setAttribute('x1', '360');
      w.setAttribute('x2', '360');
    }
  };

  buttons.forEach((btn) => btn.addEventListener('click', () => apply(Number(btn.dataset.defStep))));
  lab.querySelector('[data-def-reset]')?.addEventListener('click', () => apply(1));

  const feedback = lab.querySelector('[data-def-predict-feedback]');
  const retry = lab.querySelector('[data-def-predict-retry]');
  lab.querySelector('[data-def-predict-check]')?.addEventListener('click', () => {
    const chosen = lab.querySelector('input[name="def-predict"]:checked');
    if (!chosen) {
      feedback.hidden = false;
      feedback.className = 'sim-prediction-feedback is-warning';
      feedback.textContent = 'اختر أحد البدائل أولاً.';
      return;
    }
    const ok = chosen.value === 'b';
    feedback.hidden = false;
    feedback.className = `sim-prediction-feedback ${ok ? 'is-correct' : 'is-wrong'}`;
    feedback.innerHTML = ok
      ? '<strong>تنبؤ صحيح.</strong> الخطوط المرسومة على اللوح تبقى مستقيمات متوازية بعد رفع الجهاز؛ وهذا هو تعريف الكتاب للقوى المتوازية.'
      : chosen.value === 'a'
        ? '<strong>هذا وصف القوى المتلاقية لا المتوازية.</strong> في هذه التجربة لا تتقاطع الحوامل في نقطة واحدة.'
        : '<strong>الحاملان منفصلان.</strong> التوازي يعني مستقيمين لا ينطبقان ولا يتقاطعان، لا مستقيماً واحداً.';
    retry.hidden = false;
    if (ok) apply(4);
  });
  retry?.addEventListener('click', () => {
    lab.querySelectorAll('input[name="def-predict"]').forEach((input) => { input.checked = false; });
    feedback.hidden = true;
    retry.hidden = true;
  });

  apply(1);
}

function geometryPosition(result, distance) {
  const physical = [0, distance];
  if (Number.isFinite(result.position)) physical.push(result.position);
  const min = Math.min(...physical);
  const max = Math.max(...physical);
  const span = Math.max(max - min, 1);
  const map = (x) => 90 + ((x - min) / span) * 540;
  return {
    f1: map(0),
    f2: map(distance),
    result: Number.isFinite(result.position) ? map(result.position) : 360,
  };
}

function setVector(line, x, magnitude, sense, marker) {
  const length = Math.min(150, 50 + magnitude * 1.15);
  line.setAttribute('x1', String(x));
  line.setAttribute('x2', String(x));
  line.setAttribute('y1', '210');
  line.setAttribute('y2', String(210 - (sense * length)));
  line.setAttribute('marker-end', `url(#${marker})`);
}

function mountResultantLab(lab) {
  const f1Input = lab.querySelector('#parallel-f1');
  const f2Input = lab.querySelector('#parallel-f2');
  const distanceInput = lab.querySelector('#parallel-distance');
  const modes = [...lab.querySelectorAll('[data-parallel-mode]')];
  const f1Line = lab.querySelector('[data-vector="f1"]');
  const f2Line = lab.querySelector('[data-vector="f2"]');
  const resultLine = lab.querySelector('[data-vector="result"]');
  const resultCarrier = lab.querySelector('[data-result-carrier]');
  const resultPoint = lab.querySelector('[data-result-point]');
  const resultLabel = lab.querySelector('[data-result-label]');
  const resultSymbol = lab.querySelector('[data-result-symbol]');
  const f1Label = lab.querySelector('[data-f1-label]');
  const f2Label = lab.querySelector('[data-f2-label]');
  const cF1 = lab.querySelector('[data-c-f1]');
  const cF2 = lab.querySelector('[data-c-f2]');
  const labA = lab.querySelector('[data-lab-a]');
  const labB = lab.querySelector('[data-lab-b]');
  const resultOutput = lab.querySelector('[data-parallel-result]');
  const d1Output = lab.querySelector('[data-parallel-d1]');
  const d2Output = lab.querySelector('[data-parallel-d2]');
  const moments = lab.querySelector('[data-parallel-moments]');
  const status = lab.querySelector('[data-parallel-status]');
  const caption = lab.querySelector('[data-parallel-caption]');
  const description = lab.querySelector('[data-parallel-description]');
  const why = lab.querySelector('[data-parallel-why]');
  const bar = lab.querySelector('[data-bar]');
  let animationFrame = null;

  const writeValue = (input, unit) => {
    const out = lab.querySelector(`#${input.id}-value`);
    if (out) out.innerHTML = `<bdi dir="ltr">${fmt(input.value, 0)} ${unit}</bdi>`;
    input.setAttribute('aria-valuetext', `${fmt(input.value, 0)} ${unit}`);
  };

  const update = () => {
    const F1 = Number(f1Input.value);
    const F2 = Number(f2Input.value);
    const d = Number(distanceInput.value);
    const opposite = (modes.find((input) => input.checked)?.value ?? 'same') === 'opposite';
    const result = opposite ? oppositeSenseParallelResultant(F1, F2, d) : sameSenseParallelResultant(F1, F2, d);
    const points = geometryPosition(result, d);
    const f1Sense = 1;
    const f2Sense = opposite ? -1 : 1;
    const resultSense = opposite ? result.sense : 1;

    setVector(f1Line, points.f1, F1, f1Sense, 'parallel-green-arrow');
    setVector(f2Line, points.f2, F2, f2Sense, 'parallel-blue-arrow');
    cF1?.setAttribute('x1', String(points.f1));
    cF1?.setAttribute('x2', String(points.f1));
    cF2?.setAttribute('x1', String(points.f2));
    cF2?.setAttribute('x2', String(points.f2));
    labA?.setAttribute('x', String(points.f1));
    labB?.setAttribute('x', String(points.f2));
    f1Label.setAttribute('x', String(points.f1 - 28));
    f1Label.setAttribute('y', String(Math.max(48, 200 - Math.min(150, 50 + F1 * 1.15))));
    f2Label.setAttribute('x', String(points.f2 + 18));
    f2Label.setAttribute('y', String(f2Sense > 0 ? Math.max(48, 200 - Math.min(150, 50 + F2 * 1.15)) : 348));

    const left = Math.min(points.f1, points.f2);
    const right = Math.max(points.f1, points.f2);
    bar?.setAttribute('x1', String(left));
    bar?.setAttribute('x2', String(right));

    const finite = result.position !== null;
    [resultLine, resultCarrier, resultPoint, resultLabel, resultSymbol].forEach((el) => {
      if (el) el.style.opacity = finite ? '1' : '0';
    });
    if (finite) {
      setVector(resultLine, points.result, result.magnitude, resultSense, 'parallel-red-arrow');
      resultCarrier.setAttribute('x1', String(points.result));
      resultCarrier.setAttribute('x2', String(points.result));
      resultPoint.setAttribute('cx', String(points.result));
      resultLabel.setAttribute('x', String(points.result));
      resultSymbol.setAttribute('x', String(points.result + 22));
      resultSymbol.setAttribute('y', String(resultSense > 0 ? Math.max(42, 200 - Math.min(150, 50 + result.magnitude * 1.15)) : 348));
    }

    writeValue(f1Input, 'N');
    writeValue(f2Input, 'N');
    writeValue(distanceInput, 'cm');
    resultOutput.innerHTML = `<bdi dir="ltr">${fmt(result.magnitude)} N</bdi>`;

    if (!finite) {
      d1Output.textContent = '—';
      d2Output.textContent = '—';
      moments.innerHTML = '<span>لا توجد محصلة مفردة محدودة الموضع عندما تتساوى قوتان متوازيتان متعاكستان على حاملين مختلفين.</span>';
      status.textContent = 'القوتان متساويتان ومتعاكستان وعلى حاملين مختلفين؛ يظهر أثر إداري ولا تمثله قوة مفردة محدودة الموضع. هذه حالة حدّية من المنصة وليست من استنتاج الكتاب.';
      description.textContent = 'قوتان متوازيتان متساويتان ومتعاكستان، ولا تظهر محصلة مفردة محدودة الموضع.';
      why.textContent = 'استنتاج الكتاب يفترض أن إحدى القوتين أكبر (F2 > F1) حتى تكون للمحصلة شدة غير صفرية ونقطة تأثير محددة.';
      caption.innerHTML = 'حالة حدّية خارج صياغة استنتاج الكتاب.';
      return;
    }

    d1Output.innerHTML = `<bdi dir="ltr">${fmt(result.distanceFromF1)} cm</bdi>`;
    d2Output.innerHTML = `<bdi dir="ltr">${fmt(result.distanceFromF2)} cm</bdi>`;
    const products = momentProducts(F1, result.distanceFromF1, F2, result.distanceFromF2);
    moments.innerHTML = `<span>الجداءان: <bdi dir="ltr">${fmt(F1, 0)} × ${fmt(result.distanceFromF1)} = ${fmt(F2, 0)} × ${fmt(result.distanceFromF2)} = ${fmt(products.first)}</bdi> ${products.balanced ? '· متساويان' : ''}</span>`;

    if (!opposite) {
      const closer = F1 === F2
        ? 'في منتصف المسافة لأن القوتين متساويتان شدة.'
        : `بين القوتين وأقرب إلى القوة ${F1 > F2 ? 'الأولى' : 'الثانية'} الأكبر.`;
      status.textContent = `تقع المحصلة ${closer}`;
      description.textContent = `قوتان متوازيتان في جهة واحدة، ومحصلتهما بينهما على بعد ${fmt(result.distanceFromF1)} cm من القوة الأولى.`;
      why.textContent = F1 === F2
        ? 'إذا تساوت الشّدتان لزم من F1 × d1 = F2 × d2 أن يتساوى البعدان، فتستقر C في المنتصف كما في سؤال «أفكر» ص 66.'
        : `القوة الأكبر لا تحتاج بعداً كبيراً لتساوي جداء الأصغر. لذلك تقترب C من ${F1 > F2 ? 'F1' : 'F2'}. الشدة تُجمع: F = F1 + F2 = ${fmt(result.magnitude)} N.`;
      caption.innerHTML = `في الجهة الواحدة: ${formula('F=F_{1}+F_{2}', 'F equals F one plus F two')}`;
    } else {
      const larger = F1 > F2 ? 'الأولى' : 'الثانية';
      status.textContent = `تقع المحصلة خارج القطعة ومن جهة القوة ${larger} الأكبر، وتتجه بجهتها.`;
      description.textContent = `قوتان متوازيتان متعاكستان، ومحصلتهما خارج القطعة من جهة القوة ${larger}.`;
      why.textContent = `الشدة صارت فرقاً لا مجموعاً: F = |F1 − F2| = ${fmt(result.magnitude)} N. نقطة التأثير تخرج من القطعة حتى يبقى الجداءان متساويين.`;
      caption.innerHTML = `في الجهتين المتعاكستين: ${formula('F=|F_{1}-F_{2}|', 'F equals the absolute difference of F one and F two')}`;
    }
  };

  const setMode = (value) => {
    modes.forEach((input) => { input.checked = input.value === value; });
  };

  [...modes, f1Input, f2Input, distanceInput].forEach((input) => input.addEventListener('input', update));

  lab.querySelector('[data-parallel-preset="same-book"]')?.addEventListener('click', () => {
    setMode('same');
    f1Input.value = '20';
    f2Input.value = '30';
    distanceInput.value = '50';
    update();
  });
  lab.querySelector('[data-parallel-preset="equal"]')?.addEventListener('click', () => {
    setMode('same');
    f1Input.value = '25';
    f2Input.value = '25';
    distanceInput.value = '50';
    update();
  });
  lab.querySelector('[data-parallel-preset="opposite-book"]')?.addEventListener('click', () => {
    setMode('opposite');
    f1Input.value = '20';
    f2Input.value = '30';
    distanceInput.value = '60';
    update();
  });
  lab.querySelector('[data-parallel-reset]')?.addEventListener('click', () => {
    setMode('same');
    f1Input.value = f1Input.dataset.default ?? '20';
    f2Input.value = f2Input.dataset.default ?? '30';
    distanceInput.value = distanceInput.dataset.default ?? '50';
    update();
  });

  lab.querySelector('[data-parallel-sweep]')?.addEventListener('click', () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      f2Input.value = f2Input.max;
      update();
      f2Input.focus();
      return;
    }
    const start = performance.now();
    const min = Number(f2Input.min);
    const max = Number(f2Input.max);
    const duration = 2200;
    const animate = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const wave = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
      f2Input.value = String(Math.round((min + (max - min) * wave) / Number(f2Input.step)) * Number(f2Input.step));
      update();
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
      else {
        animationFrame = null;
        f2Input.focus();
      }
    };
    animationFrame = requestAnimationFrame(animate);
  });

  const resFeedback = lab.querySelector('[data-res-predict-feedback]');
  const resRetry = lab.querySelector('[data-res-predict-retry]');
  lab.querySelector('[data-res-predict-check]')?.addEventListener('click', () => {
    const chosen = lab.querySelector('input[name="res-predict"]:checked');
    if (!chosen) {
      resFeedback.hidden = false;
      resFeedback.className = 'sim-prediction-feedback is-warning';
      resFeedback.textContent = 'اختر أحد البدائل أولاً.';
      return;
    }
    const ok = chosen.value === 'b';
    resFeedback.hidden = false;
    resFeedback.className = `sim-prediction-feedback ${ok ? 'is-correct' : 'is-wrong'}`;
    resFeedback.innerHTML = ok
      ? '<strong>تنبؤ صحيح.</strong> العلاقة عكسية: كلما كبرت F2 صغر d2 حتى يبقى F1 × d1 = F2 × d2. جرّب زر الحركة لترى C تقترب من F2.'
      : chosen.value === 'a'
        ? '<strong>عكس قاعدة الكتاب.</strong> القوة الأكبر يكون بعدها عن حامل المحصلة أصغر لا أكبر.'
        : '<strong>المنتصف حالة خاصة.</strong> C تكون في المنتصف فقط إذا تساوت الشّدتان، كما في سؤال «أفكر».';
    resRetry.hidden = false;
  });
  resRetry?.addEventListener('click', () => {
    lab.querySelectorAll('input[name="res-predict"]').forEach((input) => { input.checked = false; });
    resFeedback.hidden = true;
    resRetry.hidden = true;
  });

  update();
}

export function mountLesson2Simulations(scope) {
  for (const lab of scope.querySelectorAll('[data-lesson2-simulation="parallel-definition-lab"]')) {
    mountDefinitionLab(lab);
  }
  for (const lab of scope.querySelectorAll('[data-lesson2-simulation="parallel-resultant-lab"]')) {
    mountResultantLab(lab);
  }
}
