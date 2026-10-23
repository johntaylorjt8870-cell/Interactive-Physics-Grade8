import { formula, tex, V_F1, V_F2, V_F, V_F_PRIME, V_W, V_R, V_OM, V_OX, V_OY, LATIN_A } from './math.js';
import {
  concurrentDiagramGeometry,
  concurrentExperimentGeometry,
  forceResolutionDiagramGeometry,
  inclinedPlaneDiagramGeometry,
  inclinedPlaneResolution,
  perpendicularDiagramGeometry,
  perpendicularScaleModel,
  resolveForceIntoPerpendicularComponents,
  resultantOfConcurrentForces,
  resultantOfPerpendicularForces,
  springBoardEquilibrium,
} from './simulation-logic.js';

const formatNumber = (value, digits = 2) => {
  if (value === null || !Number.isFinite(value)) return '—';
  return Number(value.toFixed(digits)).toString();
};

const directionOutput = (degrees) => degrees === null
  ? '<span dir="rtl">غير محدد</span>'
  : `<bdi dir="ltr">${formatNumber(degrees, 1)}°</bdi>`;

const controlMarkup = ({ id, symbol, label, min, max, step, value, unit, ariaLabel, describedBy }) => `
  <div class="simulation-control">
    <div class="simulation-control-heading">
      <label for="${id}">${label} ${symbol}</label>
      <output class="simulation-control-value" id="${id}-value" for="${id}"><bdi dir="ltr">${value} ${unit}</bdi></output>
    </div>
    <input class="simulation-range" id="${id}" data-input="${id.split('-').at(-1)}" type="range"
      min="${min}" max="${max}" step="${step}" value="${value}" data-default="${value}"
      aria-label="${ariaLabel}" aria-valuetext="${value} ${unit}"${describedBy ? ` aria-describedby="${describedBy}"` : ''} />
    <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">${min} ${unit}</bdi><bdi dir="ltr">${max} ${unit}</bdi></div>
  </div>`;

const markerDefs = (prefix) => `<defs>
  <marker id="${prefix}-f1-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#148f91" /></marker>
  <marker id="${prefix}-f2-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b5fc0" /></marker>
  <marker id="${prefix}-result-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#d55b43" /></marker>
  <marker id="${prefix}-eq-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7a4a72" /></marker>
  <marker id="${prefix}-slate-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" /></marker>
</defs>`;

const SIM_PREDICTIONS = Object.freeze({
  'spring-concurrency': {
    prompt: 'تنبّأ قبل التجريب: إذا نقلتَ نقطة تعليق الجسم O أفقياً نحو الربيعة اليمنى ثم رفعتَ الجهاز عن اللوح (الخطوة 6)، فماذا تلاحظ في الخطوط الثلاثة المرسومة؟',
    correct: 'b',
    options: [
      {
        id: 'a',
        label: 'تنفصل الخطوط الثلاثة فلا تعود تلتقي في نقطة واحدة لأن الزاويتين اختلفتا.',
        feedback: 'غير صحيح: اختلاف الزاويتين يغيّر شدتي الربيعتين واتجاهي خطيهما، لكن الخيطين وحامل الثقل كلها ما زالت مرتبطة بنقطة التعليق المشتركة O، لذا تظل امتداداتها تلتقي في الموضع الجديد للنقطة O.',
      },
      {
        id: 'b',
        label: 'يتغيّر ميل خطي الشدّ وموضع الشاقول، لكن الخطوط الثلاثة تبقى متلاقية في الموضع الجديد للنقطة O.',
        feedback: 'تنبؤ علمي صحيح! جرّب تحريك O أفقياً ثم اضغط زر «الخطوة 6: ارفع الجهاز»: ستلاحظ تغيّر ميول الحوامل واشتداد قراءة الربيعة الأقرب، بينما تبقى الخطوط الثلاثة متلاقية في النقطة O ذاتها.',
      },
      {
        id: 'c',
        label: 'يميل حامل قوة الثقل مع الخيط الأقصر حتى يوازي الربيعة القريبة.',
        feedback: 'انتبه لهذا التصور الخاطئ: قوة ثقل الجسم جذب الأرض له نحو مركزها، لذلك يبقى حامل الثقل شاقولياً دائماً مهما تغيرت زوايا الخيوط.',
      },
    ],
  },
  concurrent: {
    prompt: 'تنبّأ قبل تحريك الزاوية: عند تثبيت شدتي القوتين (مثلاً F₁ = 6 N وF₂ = 4 N) وزيادة الزاوية بينهما من 0° إلى 180°، كيف تتغير شدة المحصلة F؟',
    correct: 'c',
    options: [
      {
        id: 'a',
        label: 'تبقى شدة المحصلة ثابتة وتساوي 10 N لأن الشدتين لم تتغيرا.',
        feedback: 'غير صحيح: القوة كمية متجهة وليست عدداً مجرداً. لا تساوي المحصلة 6 + 4 = 10 N إلا عند الزاوية 0° حين تتعاون القوتان في الجهة نفسها تماماً.',
      },
      {
        id: 'b',
        label: 'تزداد شدة المحصلة كلما كبرت الزاوية بين القوتين.',
        feedback: 'عكس الواقع الفيزيائي! كلما اتسعت الزاوية بين القوتين تعاكس جزء من أثرهما، فيقصر قطر متوازي الأضلاع وتتناقص شدة المحصلة.',
      },
      {
        id: 'c',
        label: 'تتناقص تدريجياً من قيمتها العظمى (10 N عند 0°) إلى قيمتها الصغرى (2 N عند 180°).',
        feedback: 'أحسنت! حرّك منزلق الزاوية من 0° إلى 180° للتحقق: يقصر القطر OM من المجموع F₁ + F₂ = 10 N إلى الفرق |F₁ − F₂| = 2 N.',
      },
    ],
  },
  perpendicular: {
    prompt: 'تنبّأ ثم تحقّق في المختبر: إذا ضبطتَ القوتين المتعامدتين على F₁ = 30 N وF₂ = 40 N مع مقياس رسم (كل 1 cm يقابل 10 N)، فكم سيكون طول قطر المستطيل OM على الرسم وكم شدة المحصلة؟',
    correct: 'b',
    options: [
      {
        id: 'a',
        label: 'طول القطر 7 cm وشدة المحصلة 70 N.',
        feedback: 'جمعتَ 3 cm + 4 cm جمعاً عددياً! في المثلث القائم الوتر أقصر من مجموع الضلعين القائمين، ونحسبه من √(3² + 4²) = 5 cm.',
      },
      {
        id: 'b',
        label: 'طول القطر 5 cm وشدة المحصلة 50 N.',
        feedback: 'صحيح تماماً! اضغط زر «حمل الحقيبة: 30 N و40 N» في المختبر لترى المستطيل ذا الضلعين 3 cm و4 cm والقطر 5 cm الموافق لـ 5 × 10 = 50 N.',
      },
      {
        id: 'c',
        label: 'طول القطر 25 cm وشدة المحصلة 2500 N.',
        feedback: 'نسيتَ أخذ الجذر التربيعي! المقدار 3² + 4² = 25 هو مربع طول القطر (ومثله 30² + 40² = 2500 هو F²)، وبعد الجذر نحصل على 5 cm و50 N.',
      },
    ],
  },
  'force-resolution': {
    prompt: 'تنبّأ قبل إمالة السطح: في وضع «نشاط المستوى المائل الأملس»، عندما تزيد زاوية ميل المستوي a من 0° إلى 45° مع ثبات ثقل الجسم w، ماذا يحدث لمركبتي الثقل المتعامدتين؟',
    correct: 'a',
    options: [
      {
        id: 'a',
        label: 'تزداد المركبة الموازية للمستوي F₁ (المسببة للانزلاق) وتنقص المركبة العمودية عليه F₂.',
        feedback: 'استنتاج ممتاز! افتح تبويب «المستوى المائل الأملس» وحرّك الزاوية a: كلما ازداد الانحدار كبرت F₁ فاندفع الجسم للانزلاق بقوة أكبر، بينما صغرت F₂ الضاغطة على السطح وبقي قطر المستطيل مساوياً لثقل الجسم w.',
      },
      {
        id: 'b',
        label: 'تزداد المركبتان F₁ وF₂ معاً لأن الانحدار أصبح أشد.',
        feedback: 'مستحيل فيزيائياً وهندسياً: القوة الأصلية w (قطر المستطيل) ثابتة لأن الجسم لم يتغير، ومن فيثاغورث F₁² + F₂² = w²؛ فإذا كبرت إحدى المركبتين وجب أن تصغر الأخرى.',
      },
      {
        id: 'c',
        label: 'تبقى F₁ وF₂ ثابتتين ويتغير ثقل الجسم w.',
        feedback: 'ثقل الجسم w يعتمد على كتلته وجاذبية الأرض فلا يتغير بإمالة السطح؛ الذي يتغير هو توزيع أثر هذا الثقل بين اتجاه الانزلاق والاتجاه العمودي على السطح.',
      },
    ],
  },
});

function renderPredictionCard(simId) {
  const item = SIM_PREDICTIONS[simId];
  if (!item) return '';
  return `<form class="sim-prediction-card" data-sim-prediction="${simId}" novalidate>
    <div class="sim-prediction-head">
      <span class="sim-prediction-badge">مهمة التنبؤ والاستنتاج</span>
      <strong>فكّر قبل التحريك ثم تحقّق بنفسك</strong>
    </div>
    <p class="sim-prediction-prompt">${item.prompt}</p>
    <div class="sim-prediction-options" role="radiogroup" aria-label="خيارات التنبؤ">
      ${item.options.map((opt) => `<label class="sim-prediction-option">
        <input type="radio" name="pred-${simId}" value="${opt.id}" />
        <span>${opt.label}</span>
      </label>`).join('')}
    </div>
    <div class="sim-prediction-actions">
      <button type="submit" class="sim-btn sim-btn-primary">تحقّق من تنبؤي</button>
      <button type="reset" class="sim-btn sim-btn-ghost">إعادة التنبؤ</button>
    </div>
    <div class="sim-prediction-feedback" data-role="prediction-feedback" role="status" aria-live="polite" hidden></div>
  </form>`;
}

const magnitudeFormula = formula(
  'F=\\sqrt{F_{1}^{2}+F_{2}^{2}+2F_{1}F_{2}\\cos\\varphi}',
  'F = square root of F one squared plus F two squared plus two F one F two cosine phi',
);

const simulationAngleSymbol = tex('\\varphi', 'phi');

const perpendicularFormula = formula(
  'F=\\sqrt{F_{1}^{2}+F_{2}^{2}}',
  'F = square root of F one squared plus F two squared',
);

const forceResolutionIdentity = formula(
  '\\vec{\\mathrm{OM}}=\\vec{\\mathrm{OX}}+\\vec{\\mathrm{OY}}',
  'vector OM equals vector OX plus vector OY',
);

/* --- Simulation 1 (p56): Magnetic Spring-Balance Board ------------------- */

function concurrentExperimentMarkup() {
  return `<section class="simulation-experience simulation-concurrent-experiment" data-simulation="spring-concurrency" aria-labelledby="sim-c-heading">
    <header class="simulation-header">
      <div class="simulation-header-top">
        <span class="simulation-platform-label">محاكاة تفاعلية من المنصة · تجربة ص 56</span>
        <button type="button" class="sim-btn sim-btn-ghost" data-sim-reset>إعادة ضبط اللوح</button>
      </div>
      <h3 id="sim-c-heading">مختبر لوح الربائع المغناطيسي وتلاقي الحوامل</h3>
      <p>جرّب خطوات التجربة عملياً: قارن بين تعليق الجسم بربيعة واحدة أو بربيعتين، وحرّك نقطة التعليق <bdi dir="ltr">O</bdi> أو غيّر ثقل الجسم، ثم ارفع الجهاز عن اللوح (الخطوة 6) لتشاهد أثر الحوامل الثلاثة.</p>
    </header>

    <div class="sim-mode-toolbar" role="group" aria-label="أوضاع تجربة لوح الربائع">
      <button type="button" class="sim-chip is-active" data-board-mode="double" aria-pressed="true">الخطوات 3–5: ربيعتان مائلتان</button>
      <button type="button" class="sim-chip" data-board-mode="single" aria-pressed="false">الخطوتان 1–2: ربيعة واحدة شاقولية</button>
      <button type="button" class="sim-chip sim-chip-accent" data-toggle-apparatus aria-pressed="false">الخطوة 6: ارفع الربيعتين والجسم</button>
    </div>

    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="مدخلات مختبر لوح الربائع">
        <div class="simulation-control">
          <div class="simulation-control-heading">
            <label for="sim-c-horizontal">موضع نقطة التعليق <bdi dir="ltr">O</bdi> أفقياً</label>
            <output class="simulation-control-value" id="sim-c-horizontal-value" for="sim-c-horizontal"><bdi dir="ltr">50%</bdi></output>
          </div>
          <input class="simulation-range" id="sim-c-horizontal" data-input="horizontal" type="range" min="0" max="100" step="1" value="50" data-default="50"
            aria-label="تحريك نقطة التأثير أفقياً" aria-valuetext="50 بالمئة" aria-describedby="sim-c-horizontal-help" />
          <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">0%</bdi><bdi dir="ltr">100%</bdi></div>
          <p class="simulation-control-help" id="sim-c-horizontal-help">تحريك النقطة يقربها من إحدى الربيعتين فيغير زاويتي الخيطين.</p>
        </div>

        <div class="simulation-control">
          <div class="simulation-control-heading">
            <label for="sim-c-vertical">موضع نقطة التعليق <bdi dir="ltr">O</bdi> رأسياً</label>
            <output class="simulation-control-value" id="sim-c-vertical-value" for="sim-c-vertical"><bdi dir="ltr">50%</bdi></output>
          </div>
          <input class="simulation-range" id="sim-c-vertical" data-input="vertical" type="range" min="0" max="100" step="1" value="50" data-default="50"
            aria-label="تحريك نقطة التأثير رأسياً" aria-valuetext="50 بالمئة" aria-describedby="sim-c-vertical-help" />
          <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">0%</bdi><bdi dir="ltr">100%</bdi></div>
          <p class="simulation-control-help" id="sim-c-vertical-help">زيادة القيمة تطيل الخيطين إلى أسفل فتصغر الزاوية بين الربيعتين.</p>
        </div>

        ${controlMarkup({ id: 'sim-c-weight', symbol: V_W, label: 'ثقل الجسم المعلّق', min: 2, max: 10, step: 1, value: 6, unit: 'N', ariaLabel: 'ثقل الجسم المعلق بالنيوتن' })}

        <div class="simulation-result-grid simulation-result-grid-3">
          <div class="simulation-result-cell">
            <span id="sim-c-t1-label">شدّ الربيعة اليسرى ${V_F2}</span>
            <output id="sim-c-t1" class="simulation-result-value" aria-labelledby="sim-c-t1-label"><bdi dir="ltr">— N</bdi></output>
          </div>
          <div class="simulation-result-cell">
            <span id="sim-c-t2-label">شدّ الربيعة اليمنى ${V_F1}</span>
            <output id="sim-c-t2" class="simulation-result-value" aria-labelledby="sim-c-t2-label"><bdi dir="ltr">— N</bdi></output>
          </div>
          <div class="simulation-result-cell">
            <span id="sim-c-common-point-label">نقطة تلاقي الحوامل</span>
            <output id="sim-c-common-point" class="simulation-result-value" aria-labelledby="sim-c-common-point-label"><bdi dir="ltr">O</bdi></output>
          </div>
        </div>

        <p class="simulation-status" id="sim-c-status" role="status" aria-live="polite" aria-atomic="true">تلتقي حوامل قوتي الشدّ وقوة الثقل عند النقطة <bdi dir="ltr">O</bdi>.</p>
      </section>

      <figure class="simulation-visual">
        <div class="simulation-svg-wrap">
          <svg id="sim-c-svg" viewBox="0 0 680 390" role="img" aria-labelledby="sim-c-svg-title sim-c-svg-desc">
            <title id="sim-c-svg-title">لوح الربائع المغناطيسي وتلاقي الحوامل عند O</title>
            <desc id="sim-c-svg-desc" data-role="diagram-description">ثلاثة حوامل قوى تمر بنقطة التأثير O: حاملا قوتي الشد المائلان والحامل الرأسي لقوة الثقل.</desc>
            ${markerDefs('sim-c')}
            <rect x="18" y="14" width="644" height="362" rx="14" fill="#f8fafc" stroke="#cbd5e1" />
            <line class="simulation-concurrency-carrier carrier-f1" id="sim-c-carrier-f1" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-concurrency-carrier carrier-f2" id="sim-c-carrier-f2" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-concurrency-carrier carrier-weight" id="sim-c-carrier-weight" x1="340" y1="18" x2="340" y2="372" />

            <g id="sim-c-apparatus-group">
              <line id="sim-c-cord-1" x1="140" y1="62" x2="340" y2="205" stroke="#64748b" stroke-width="2.5" />
              <line id="sim-c-cord-2" x1="540" y1="62" x2="340" y2="205" stroke="#64748b" stroke-width="2.5" />
              <rect id="sim-c-mass-box" x="322" y="232" width="36" height="32" rx="5" fill="#94a3b8" stroke="#475569" stroke-width="2" />
              <line id="sim-c-mass-hook" x1="340" y1="205" x2="340" y2="232" stroke="#475569" stroke-width="2.2" />
              <circle class="simulation-guide-point" id="sim-c-guide-f1" r="7" cx="140" cy="62" />
              <circle class="simulation-guide-point" id="sim-c-guide-f2" r="7" cx="540" cy="62" />
            </g>

            <line class="simulation-vector sim-vector-f2" id="sim-c-vector-f1" marker-end="url(#sim-c-f2-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-f1" id="sim-c-vector-f2" marker-end="url(#sim-c-f1-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-weight" id="sim-c-vector-weight" marker-end="url(#sim-c-result-arrow)" x1="0" y1="0" x2="0" y2="0" />

            <circle class="simulation-common-point-ring" id="sim-c-point-ring" r="11" cx="340" cy="205" />
            <circle class="simulation-point simulation-common-point" id="sim-c-point-o" r="5" cx="340" cy="205" />
            <text class="simulation-point-label" id="sim-c-label-o" x="349" y="195" direction="ltr">O</text>
            <text class="simulation-force-label" id="sim-c-label-f1" direction="ltr">F₂</text>
            <text class="simulation-force-label" id="sim-c-label-f2" direction="ltr">F₁</text>
            <text class="simulation-force-label" id="sim-c-label-weight" direction="ltr">w</text>
          </svg>
        </div>
        <ul class="simulation-legend" aria-label="مفتاح رموز المحاكاة">
          <li><span class="simulation-key f1" aria-hidden="true"></span>${V_F1} شد الربيعة اليمنى</li>
          <li><span class="simulation-key f2" aria-hidden="true"></span>${V_F2} شد الربيعة اليسرى</li>
          <li><span class="simulation-key weight" aria-hidden="true"></span>${V_W} ثقل الجسم</li>
          <li><span class="simulation-key construction" aria-hidden="true"></span>الحوامل المرسومة على اللوح</li>
        </ul>
        <figcaption>نموذج توازن سكوني مبسط يحسب شدّي الربيعتين بحيث توازن محصلتهما ثقل الجسم المعلّق عند O.</figcaption>
      </figure>
    </div>

    <div class="sim-live-why" data-role="why-changed" aria-live="polite"></div>
    ${renderPredictionCard('spring-concurrency')}
  </section>`;
}

/* --- Simulation 2 (p57): Parallelogram Resultant & Equilibrium ----------- */

function concurrentMarkup() {
  return `<section class="simulation-experience simulation-concurrent" data-simulation="concurrent" aria-labelledby="simulation-a-heading">
    <header class="simulation-header">
      <div class="simulation-header-top">
        <span class="simulation-platform-label">محاكاة تفاعلية من المنصة · ص 57–58</span>
        <button type="button" class="sim-btn sim-btn-ghost" data-sim-reset>إعادة ضبط</button>
      </div>
      <h3 id="simulation-a-heading">مختبر متوازي الأضلاع وعناصر المحصلة والتوازن</h3>
      <p>غيّر شدتي القوتين والزاوية بينهما، أو استعرض خطوات الإنشاء الهندسي تدريجياً، أو فعّل قوة الموازنة ${V_F_PRIME} لمقارنة حالتي عدم التوازن والتوازن.</p>
    </header>

    <div class="sim-preset-bar" role="group" aria-label="حالات جاهزة للاستكشاف">
      <span class="sim-preset-title">حالات سريعة:</span>
      <button type="button" class="sim-chip" data-preset-f1="4" data-preset-f2="3" data-preset-angle="60">مثال الكتاب ص58 (<bdi dir="ltr">4 N, 3 N, 60°</bdi>)</button>
      <button type="button" class="sim-chip" data-preset-f1="6" data-preset-f2="4" data-preset-angle="0">جهة واحدة (<bdi dir="ltr">0°</bdi>)</button>
      <button type="button" class="sim-chip" data-preset-f1="6" data-preset-f2="4" data-preset-angle="90">مستطيل (<bdi dir="ltr">90°</bdi>)</button>
      <button type="button" class="sim-chip" data-preset-f1="5" data-preset-f2="5" data-preset-angle="90">مربّع (<bdi dir="ltr">5 N, 5 N, 90°</bdi>)</button>
      <button type="button" class="sim-chip" data-preset-f1="5" data-preset-f2="5" data-preset-angle="180">توازن قوتين (<bdi dir="ltr">180°</bdi>)</button>
    </div>

    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="مدخلات محاكاة محصلة قوتين">
        ${controlMarkup({ id: 'sim-a-f1', symbol: V_F1, label: 'شدة القوة الأولى', min: 0, max: 10, step: 0.5, value: 6, unit: 'N', ariaLabel: 'شدة القوة F1 بالنيوتن' })}
        ${controlMarkup({ id: 'sim-a-f2', symbol: V_F2, label: 'شدة القوة الثانية', min: 0, max: 10, step: 0.5, value: 4, unit: 'N', ariaLabel: 'شدة القوة F2 بالنيوتن' })}
        <div class="simulation-control">
          <div class="simulation-control-heading">
            <label for="sim-a-angle">الزاوية بين حاملي ${V_F1} و${V_F2}</label>
            <output class="simulation-control-value" id="sim-a-angle-value" for="sim-a-angle"><bdi dir="ltr">45°</bdi></output>
          </div>
          <input class="simulation-range" id="sim-a-angle" data-input="angle" type="range" min="0" max="180" step="1" value="45" data-default="45"
            aria-label="الزاوية بين F1 وF2 بالدرجات" aria-valuetext="45 درجة" aria-describedby="sim-a-angle-help" />
          <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">0°</bdi><bdi dir="ltr">180°</bdi></div>
          <p class="simulation-control-help" id="sim-a-angle-help">تُقاس عكس عقارب الساعة من حامل ${V_F1} إلى حامل ${V_F2}.</p>
        </div>

        <div class="sim-step-box" role="group" aria-label="عرض خطوات الإنشاء التدريجي">
          <span class="sim-step-label">خطوات الإنشاء:</span>
          <div class="sim-step-buttons">
            <button type="button" class="sim-chip" data-construct-step="1">١. الشعاعان</button>
            <button type="button" class="sim-chip" data-construct-step="2">٢. إكمال المتوازي</button>
            <button type="button" class="sim-chip is-active" data-construct-step="3">٣. القطر والمحصلة</button>
          </div>
          <label class="sim-toggle-check">
            <input type="checkbox" data-toggle-equilibrant />
            <span>أضف قوة الموازنة ${V_F_PRIME} لتحقيق توازن النقطة <bdi dir="ltr">O</bdi></span>
          </label>
        </div>

        <div class="simulation-sweep-row">
          <button class="simulation-sweep" type="button" data-sweep="sim-a-angle" aria-describedby="sim-a-sweep-hint">
            <span aria-hidden="true">▶</span> شاهد تغيّر القطر مع الزاوية
          </button>
          <p class="simulation-sweep-hint" id="sim-a-sweep-hint">يمسح الزاوية من <bdi dir="ltr">10°</bdi> إلى <bdi dir="ltr">170°</bdi> ذهاباً وإياباً.</p>
        </div>

        <div class="simulation-result-grid simulation-result-grid-3">
          <div class="simulation-result-cell">
            <span id="sim-a-result-label">شدة المحصلة ${V_F}</span>
            <output id="sim-a-result" class="simulation-result-value" aria-labelledby="sim-a-result-label"><bdi dir="ltr">— N</bdi></output>
          </div>
          <div class="simulation-result-cell">
            <span id="sim-a-direction-label">زاويتها مع ${V_F1}</span>
            <output id="sim-a-direction" class="simulation-result-value" aria-labelledby="sim-a-direction-label"><bdi dir="ltr">—</bdi></output>
          </div>
          <div class="simulation-result-cell">
            <span id="sim-a-shape-label">نوع الشكل المنشأ</span>
            <output id="sim-a-shape" class="simulation-result-value simulation-shape-badge" aria-labelledby="sim-a-shape-label">—</output>
          </div>
        </div>
        <p class="simulation-status" id="sim-a-status" role="status" aria-live="polite" aria-atomic="true">تتغير المحصلة مع الشدتين والزاوية.</p>
      </section>

      <figure class="simulation-visual">
        <div class="simulation-svg-wrap">
          <svg id="sim-a-svg" viewBox="0 0 640 380" role="img" aria-labelledby="sim-a-svg-title sim-a-svg-desc">
            <title id="sim-a-svg-title">متوازي أضلاع محصلة القوتين المتلاقيتين</title>
            <desc id="sim-a-svg-desc" data-role="diagram-description">سهمان من نقطة التأثير O وقطر المحصلة OM.</desc>
            ${markerDefs('sim-a')}
            <line class="simulation-axis" x1="22" y1="265" x2="615" y2="265" />
            <line class="simulation-construction" id="sim-a-edge-f1" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-construction" id="sim-a-edge-f2" x1="0" y1="0" x2="0" y2="0" />
            <path class="simulation-angle-arc" id="sim-a-angle-arc" d="" />
            <line class="simulation-vector sim-vector-f1" id="sim-a-vector-f1" marker-end="url(#sim-a-f1-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-f2" id="sim-a-vector-f2" marker-end="url(#sim-a-f2-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-result" id="sim-a-vector-result" marker-end="url(#sim-a-result-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-eq" id="sim-a-vector-eq" marker-end="url(#sim-a-eq-arrow)" x1="0" y1="0" x2="0" y2="0" visibility="hidden" />
            <circle class="simulation-point" id="sim-a-point-o" r="5" cx="250" cy="265" />
            <circle class="simulation-point simulation-point-result" id="sim-a-point-m" r="5" cx="250" cy="265" />
            <text class="simulation-point-label" x="234" y="290" direction="ltr">O</text>
            <text class="simulation-point-label" id="sim-a-label-m" x="250" y="265" direction="ltr">M</text>
            <text class="simulation-point-label" id="sim-a-label-eq" x="250" y="265" direction="ltr" visibility="hidden">F′</text>
          </svg>
        </div>
        <ul class="simulation-legend" aria-label="مفتاح رموز المحاكاة">
          <li><span class="simulation-key f1" aria-hidden="true"></span>${V_F1}</li>
          <li><span class="simulation-key f2" aria-hidden="true"></span>${V_F2}</li>
          <li><span class="simulation-key result" aria-hidden="true"></span>${V_F} المحصلة</li>
          <li><span class="simulation-key eq" aria-hidden="true"></span>${V_F_PRIME} قوة الموازنة</li>
        </ul>
        <figcaption>القطر من O إلى M يمثل المحصلة هندسياً؛ وقوة الموازنة F′ تساويه شدةً وتعاكسه جهةً على الحامل نفسه.</figcaption>
      </figure>
    </div>

    <div class="sim-live-why" data-role="why-changed" aria-live="polite"></div>
    <section class="simulation-explanation" aria-labelledby="sim-a-explanation-heading">
      <h4 id="sim-a-explanation-heading">ملاحظة علمية (التمييز بين مقرر الصف الثامن والإثراء الرياضي)</h4>
      <p>في منهج الصف الثامن نجد شدة المحصلة عند الزوايا غير القائمة <strong>بالرسم القياسي وقراءة طول القطر بالمسطرة</strong> (كما أعطى مثال ص 58 القيمة التقريبية <bdi dir="ltr">6 N</bdi>). أما المحاكاة فتحسب الطول الهندسي الدقيق للقطر من علاقة جيب التمام الإثرائية:</p>
      <div class="simulation-equation">${magnitudeFormula}</div>
      <p class="simulation-equation-note">حيث ${simulationAngleSymbol} الزاوية بين القوتين؛ وعند تجريب مثال ص 58 (<bdi dir="ltr">4 N, 3 N, 60°</bdi>) تعطي المحاكاة <bdi dir="ltr">6.08 N</bdi> وهي القيمة التي قرأتها مسطرة الكتاب تقريبياً بـ <bdi dir="ltr">6 N</bdi>.</p>
    </section>
    ${renderPredictionCard('concurrent')}
  </section>`;
}

/* --- Simulation 3 (p59): Perpendicular Forces, Scale & Pythagoras -------- */

function perpendicularMarkup() {
  return `<section class="simulation-experience simulation-perpendicular" data-simulation="perpendicular" aria-labelledby="simulation-b-heading">
    <header class="simulation-header">
      <div class="simulation-header-top">
        <span class="simulation-platform-label">محاكاة تفاعلية من المنصة · ص 58–59</span>
        <button type="button" class="sim-btn sim-btn-ghost" data-sim-reset>إعادة ضبط</button>
      </div>
      <h3 id="simulation-b-heading">مختبر القوتين المتعامدتين: المستطيل ومقياس الرسم وفيثاغورث</h3>
      <p>قارن جنباً إلى جنب بين <strong>الطريقة البيانية</strong> (أطوال المستطيل بالسنتيمتر وفق مقياس الرسم) و<strong>الطريقة الحسابية</strong> بنظرية فيثاغورث.</p>
    </header>

    <div class="sim-preset-bar" role="group" aria-label="أمثلة ومسائل الكتاب للتجريب">
      <span class="sim-preset-title">جرّب قيم مسائل الدرس:</span>
      <button type="button" class="sim-chip" data-perp-f1="60" data-perp-f2="80" data-perp-scale="20">مثال ص59 (<bdi dir="ltr">60 N, 80 N</bdi>)</button>
      <button type="button" class="sim-chip" data-perp-f1="12" data-perp-f2="16" data-perp-scale="4">س1/4 ص62 (<bdi dir="ltr">12 N, 16 N</bdi>)</button>
      <button type="button" class="sim-chip" data-perp-f1="40" data-perp-f2="30" data-perp-scale="10">حمل الحقيبة (<bdi dir="ltr">30 N, 40 N</bdi>)</button>
      <button type="button" class="sim-chip" data-perp-f1="9" data-perp-f2="12" data-perp-scale="3">المسألة 1 (<bdi dir="ltr">9 N, 12 N</bdi>)</button>
    </div>

    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="مدخلات محاكاة القوتين المتعامدتين">
        ${controlMarkup({ id: 'sim-b-f1', symbol: V_F1, label: 'شدة القوة الأولى', min: 0, max: 100, step: 1, value: 50, unit: 'N', ariaLabel: 'شدة القوة F1 بالنيوتن' })}
        ${controlMarkup({ id: 'sim-b-f2', symbol: V_F2, label: 'شدة القوة الثانية', min: 0, max: 100, step: 1, value: 70, unit: 'N', ariaLabel: 'شدة القوة F2 بالنيوتن' })}

        <div class="simulation-control">
          <div class="simulation-control-heading">
            <label for="sim-b-scale">مقياس الرسم المختار (<bdi dir="ltr">1 cm : ? N</bdi>)</label>
          </div>
          <select id="sim-b-scale" class="sim-select" data-scale-select aria-label="اختيار مقياس الرسم">
            <option value="20" selected>كل 1 cm يمثل 20 N (مقياس مثال ص 59)</option>
            <option value="10">كل 1 cm يمثل 10 N (مناسب لحمل الحقيبة)</option>
            <option value="5">كل 1 cm يمثل 5 N</option>
            <option value="4">كل 1 cm يمثل 4 N</option>
            <option value="3">كل 1 cm يمثل 3 N (مناسب للمسألة 1)</option>
            <option value="1">كل 1 cm يمثل 1 N</option>
          </select>
        </div>

        <div class="simulation-fixed-angle"><span>الزاوية بين القوتين ثابتة</span><bdi dir="ltr">90°</bdi><span class="fixed-angle-mark" aria-hidden="true">□</span></div>

        <div class="simulation-result-grid">
          <div class="simulation-result-cell">
            <span id="sim-b-result-label">شدة المحصلة ${V_F}</span>
            <output id="sim-b-result" class="simulation-result-value" aria-labelledby="sim-b-result-label"><bdi dir="ltr">— N</bdi></output>
          </div>
          <div class="simulation-result-cell">
            <span id="sim-b-direction-label">زاويتها مع ${V_F1}</span>
            <output id="sim-b-direction" class="simulation-result-value" aria-labelledby="sim-b-direction-label"><bdi dir="ltr">—</bdi></output>
          </div>
        </div>

        <div class="sim-dual-verification" id="sim-b-steps" aria-label="خطوات التحقق البياني والحسابي"></div>
        <p class="simulation-status" id="sim-b-status" role="status" aria-live="polite" aria-atomic="true">القوتان متعامدتان؛ يتغير طول القطر عند تغيير أي شدة.</p>
      </section>

      <figure class="simulation-visual">
        <div class="simulation-svg-wrap simulation-svg-perpendicular">
          <svg id="sim-b-svg" viewBox="0 0 640 390" role="img" aria-labelledby="sim-b-svg-title sim-b-svg-desc">
            <title id="sim-b-svg-title">مستطيل ومثلث قائم لمحصلة قوتين متعامدتين</title>
            <desc id="sim-b-svg-desc" data-role="diagram-description">القوتان F1 وF2 متعامدتان من O، والقطر F هو المحصلة.</desc>
            ${markerDefs('sim-b')}
            <line class="simulation-axis" x1="80" y1="330" x2="605" y2="330" />
            <line class="simulation-axis" x1="100" y1="355" x2="100" y2="48" />
            <polygon class="simulation-triangle-fill" id="sim-b-triangle" points="100,330 205,330 205,183" />
            <line class="simulation-construction" id="sim-b-edge-f1" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-construction" id="sim-b-edge-f2" x1="0" y1="0" x2="0" y2="0" />
            <path class="simulation-right-angle" id="sim-b-right-angle-o" d="M 100 314 L 116 314 L 116 330" />
            <path class="simulation-right-angle" id="sim-b-right-angle-triangle" d="M 0 0" />
            <line class="simulation-vector sim-vector-f1" id="sim-b-vector-f1" marker-end="url(#sim-b-f1-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-f2" id="sim-b-vector-f2" marker-end="url(#sim-b-f2-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-result" id="sim-b-vector-result" marker-end="url(#sim-b-result-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <circle class="simulation-point" id="sim-b-point-o" r="5" cx="100" cy="330" />
            <circle class="simulation-point simulation-point-result" id="sim-b-point-m" r="5" cx="205" cy="183" />
            <text class="simulation-point-label" x="81" y="357" direction="ltr">O</text>
            <text class="simulation-point-label" id="sim-b-label-m" x="205" y="183" direction="ltr">M</text>
            <text class="simulation-axis-label" x="610" y="339" direction="ltr">x</text>
            <text class="simulation-axis-label" x="92" y="42" direction="ltr">y</text>
          </svg>
        </div>
        <ul class="simulation-legend" aria-label="مفتاح رموز المحاكاة">
          <li><span class="simulation-key f1" aria-hidden="true"></span>${V_F1}</li>
          <li><span class="simulation-key f2" aria-hidden="true"></span>${V_F2}</li>
          <li><span class="simulation-key result" aria-hidden="true"></span>${V_F} المحصلة (وتر المثلث القائم)</li>
          <li><span class="simulation-key construction" aria-hidden="true"></span>إكمال المستطيل</li>
        </ul>
        <figcaption>عندما تكون الزاوية 90° يتحول متوازي الأضلاع إلى مستطيل (أو مربع عند تساوي الشدتين) ويصبح القطر OM وتراً في مثلث قائم.</figcaption>
      </figure>
    </div>

    <div class="sim-live-why" data-role="why-changed" aria-live="polite"></div>
    <section class="simulation-explanation" aria-labelledby="sim-b-explanation-heading">
      <h4 id="sim-b-explanation-heading">تطابق الرسم مع قانون فيثاغورث</h4>
      <div class="simulation-equation">${perpendicularFormula}</div>
    </section>
    ${renderPredictionCard('perpendicular')}
  </section>`;
}

/* --- Simulation 4 (p60): Force Resolution & Smooth Inclined Plane -------- */

function forceResolutionMarkup() {
  const initial = resolveForceIntoPerpendicularComponents(8, 35);
  return `<section class="simulation-experience simulation-force-resolution" data-simulation="force-resolution" aria-labelledby="sim-d-heading">
    <header class="simulation-header">
      <div class="simulation-header-top">
        <span class="simulation-platform-label">محاكاة تفاعلية من المنصة · ص 60</span>
        <button type="button" class="sim-btn sim-btn-ghost" data-sim-reset>إعادة ضبط</button>
      </div>
      <h3 id="sim-d-heading">مختبر تحليل القوة إلى مركبتين متعامدتين والمستوى المائل الأملس</h3>
      <p>بدّل بين <strong>الإسقاط على المحورين المتعامدين ${V_OX} و${V_OY}</strong> وبين <strong>نشاط المستوى المائل الأملس</strong> لترى كيف نفكك قوة واحدة إلى مركبتين متعامدتين تقومان مقامها.</p>
    </header>

    <div class="sim-mode-toolbar" role="tablist" aria-label="وضعا مختبر تحليل القوة">
      <button type="button" class="sim-chip is-active" role="tab" aria-selected="true" data-res-tab="axes">١. التحليل على المحورين OX وOY</button>
      <button type="button" class="sim-chip" role="tab" aria-selected="false" data-res-tab="incline">٢. نشاط المستوى المائل الأملس (ص 60)</button>
    </div>

    <div data-res-panel="axes">
      <div class="simulation-workbench">
        <section class="simulation-controls" aria-label="مدخلات تحليل القوة إلى مركبتين">
          ${controlMarkup({ id: 'sim-d-force', symbol: V_OM, label: 'شدة القوة الأصلية', min: 0, max: 10, step: 0.5, value: 8, unit: 'N', ariaLabel: 'مقدار القوة الأصلية بوحدة النيوتن', describedBy: 'sim-d-force-help' })}
          <div class="simulation-control">
            <div class="simulation-control-heading">
              <label for="sim-d-angle">زاوية القوة مع المحور ${V_OX}</label>
              <output class="simulation-control-value" id="sim-d-angle-value" for="sim-d-angle"><bdi dir="ltr">35°</bdi></output>
            </div>
            <input class="simulation-range" id="sim-d-angle" data-input="angle" type="range" min="0" max="90" step="1" value="35" data-default="35"
              aria-label="زاوية القوة من محور OX بالدرجات" aria-valuetext="35 درجة" aria-describedby="sim-d-angle-help" />
            <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">0°</bdi><bdi dir="ltr">90°</bdi></div>
            <p class="simulation-control-help" id="sim-d-angle-help">جرّب الزاويتين الطرفيتين <bdi dir="ltr">0°</bdi> و<bdi dir="ltr">90°</bdi> وراقب أي مركبة تنعدم.</p>
          </div>
          <div class="simulation-sweep-row">
            <button class="simulation-sweep" type="button" data-sweep="sim-d-angle" aria-describedby="sim-d-sweep-hint">
              <span aria-hidden="true">▶</span> شاهد تبادل الشدة بين المركبتين
            </button>
            <p class="simulation-sweep-hint" id="sim-d-sweep-hint">تدور القوة من <bdi dir="ltr">OX</bdi> إلى <bdi dir="ltr">OY</bdi> مع بقاء <bdi dir="ltr">√(F₁² + F₂²) = F</bdi>.</p>
          </div>
          <p class="simulation-control-help" id="sim-d-force-help">إسقاط العمودين من الرأس M يعيّن مرتسمي النقطة على المحورين.</p>
          <div class="simulation-result-grid">
            <div class="simulation-result-cell">
              <span id="sim-d-x-label">المركبة ${V_F1} على ${V_OX}</span>
              <output id="sim-d-x-value" class="simulation-result-value" aria-labelledby="sim-d-x-label"><bdi dir="ltr">${formatNumber(initial.componentX)} N</bdi></output>
            </div>
            <div class="simulation-result-cell">
              <span id="sim-d-y-label">المركبة ${V_F2} على ${V_OY}</span>
              <output id="sim-d-y-value" class="simulation-result-value" aria-labelledby="sim-d-y-label"><bdi dir="ltr">${formatNumber(initial.componentY)} N</bdi></output>
            </div>
          </div>
          <p class="simulation-status" id="sim-d-status" role="status" aria-live="polite" aria-atomic="true">القوة الأصلية هي محصلة مركبتيها المتعامدتين على المحورين.</p>
        </section>
        <figure class="simulation-visual">
          <div class="simulation-svg-wrap">
            <svg id="sim-d-svg" viewBox="0 0 680 420" role="img" aria-labelledby="sim-d-svg-title sim-d-svg-desc">
              <title id="sim-d-svg-title">إسقاط القوة على المحورين OX وOY</title>
              <desc id="sim-d-svg-desc" data-role="diagram-description">القوة الأصلية من O إلى M قطر مستطيل، ومركبتاها إسقاطان متعامدان على المحورين OX وOY.</desc>
              ${markerDefs('sim-d')}
              <defs><marker id="sim-d-axis-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#62718b" /></marker></defs>
              <line class="simulation-resolution-axis" x1="70" y1="370" x2="645" y2="370" marker-end="url(#sim-d-axis-arrow)" />
              <line class="simulation-resolution-axis" x1="160" y1="395" x2="160" y2="28" marker-end="url(#sim-d-axis-arrow)" />
              <polygon class="simulation-triangle-fill simulation-resolution-fill" id="sim-d-rectangle" points="160,370 360,370 360,170 160,170" />
              <line class="simulation-construction" id="sim-d-projection-x" x1="0" y1="0" x2="0" y2="0" />
              <line class="simulation-construction" id="sim-d-projection-y" x1="0" y1="0" x2="0" y2="0" />
              <path class="simulation-right-angle" id="sim-d-right-angle" d="M 160 347 L 183 347 L 183 370" />
              <line class="simulation-vector sim-vector-f1" id="sim-d-component-x" marker-end="url(#sim-d-f1-arrow)" x1="160" y1="370" x2="0" y2="370" />
              <line class="simulation-vector sim-vector-f2" id="sim-d-component-y" marker-end="url(#sim-d-f2-arrow)" x1="160" y1="370" x2="160" y2="0" />
              <line class="simulation-vector sim-vector-result" id="sim-d-force-vector" marker-end="url(#sim-d-result-arrow)" x1="160" y1="370" x2="0" y2="0" />
              <circle class="simulation-point" id="sim-d-origin" r="5" cx="160" cy="370" />
              <circle class="simulation-point" id="sim-d-point-x" r="4" cx="0" cy="370" />
              <circle class="simulation-point" id="sim-d-point-y" r="4" cx="160" y2="0" />
              <circle class="simulation-point simulation-point-result" id="sim-d-point-m" r="5" cx="0" cy="0" />
              <text class="simulation-point-label" x="143" y="395" direction="ltr">O</text>
              <text class="simulation-point-label" id="sim-d-label-x" direction="ltr">X</text>
              <text class="simulation-point-label" id="sim-d-label-y" direction="ltr">Y</text>
              <text class="simulation-point-label" id="sim-d-label-m" direction="ltr">M</text>
              <text class="simulation-axis-label simulation-resolution-axis-label" x="654" y="378" direction="ltr">X</text>
              <text class="simulation-axis-label simulation-resolution-axis-label" x="151" y="22" direction="ltr">Y</text>
            </svg>
          </div>
          <ul class="simulation-legend" aria-label="مفتاح رموز تحليل القوة">
            <li><span class="simulation-key result" aria-hidden="true"></span>${V_OM} القوة الأصلية</li>
            <li><span class="simulation-key f1" aria-hidden="true"></span>${V_F1} على ${V_OX}</li>
            <li><span class="simulation-key f2" aria-hidden="true"></span>${V_F2} على ${V_OY}</li>
            <li><span class="simulation-key construction" aria-hidden="true"></span>مرتسما النقطة M</li>
          </ul>
          <figcaption>من الرأس M ننزل عموداً على كل محور فيتشكل مستطيل قطره القوة الأصلية وضلعاه المركبتان.</figcaption>
        </figure>
      </div>
    </div>

    <div data-res-panel="incline" hidden>
      <div class="simulation-workbench">
        <section class="simulation-controls" aria-label="مدخلات نشاط المستوى المائل الأملس">
          <div class="simulation-control">
            <div class="simulation-control-heading">
              <label for="sim-d-incline-angle">زاوية ميل المستوي عن الأفق ${LATIN_A}</label>
              <output class="simulation-control-value" id="sim-d-incline-angle-value" for="sim-d-incline-angle"><bdi dir="ltr">25°</bdi></output>
            </div>
            <input class="simulation-range" id="sim-d-incline-angle" data-incline-input="angle" type="range" min="0" max="60" step="1" value="25" data-default="25"
              aria-label="زاوية ميل المستوى المائل بالدرجات" aria-valuetext="25 درجة" />
            <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">0°</bdi><bdi dir="ltr">60°</bdi></div>
          </div>
          <div class="simulation-control">
            <div class="simulation-control-heading">
              <label for="sim-d-incline-weight">شدة قوة ثقل الجسم ${V_W}</label>
              <output class="simulation-control-value" id="sim-d-incline-weight-value" for="sim-d-incline-weight"><bdi dir="ltr">8 N</bdi></output>
            </div>
            <input class="simulation-range" id="sim-d-incline-weight" data-incline-input="weight" type="range" min="2" max="12" step="1" value="8" data-default="8"
              aria-label="ثقل الجسم على المستوى المائل بالنيوتن" aria-valuetext="8 نيوتن" />
            <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">2 N</bdi><bdi dir="ltr">12 N</bdi></div>
          </div>
          <div class="simulation-result-grid simulation-result-grid-3">
            <div class="simulation-result-cell">
              <span>مركبة الانزلاق ${V_F1}</span>
              <output id="sim-d-inc-f1" class="simulation-result-value"><bdi dir="ltr">— N</bdi></output>
            </div>
            <div class="simulation-result-cell">
              <span>المركبة العمودية ${V_F2}</span>
              <output id="sim-d-inc-f2" class="simulation-result-value"><bdi dir="ltr">— N</bdi></output>
            </div>
            <div class="simulation-result-cell">
              <span>ردّ فعل السطح ${V_R}</span>
              <output id="sim-d-inc-r" class="simulation-result-value"><bdi dir="ltr">— N</bdi></output>
            </div>
          </div>
          <p class="simulation-status" id="sim-d-incline-status" role="status" aria-live="polite" aria-atomic="true">الشكل الناتج من تحليل قوة الثقل إلى مركبتين متعامدتين هو مستطيل قطره w.</p>
        </section>

        <figure class="simulation-visual">
          <div class="simulation-svg-wrap">
            <svg id="sim-d-incline-svg" viewBox="0 0 640 390" role="img" aria-labelledby="sim-d-inc-title sim-d-inc-desc">
              <title id="sim-d-inc-title">نموذج نشاط المستوى المائل الأملس وتحليل قوة الثقل</title>
              <desc id="sim-d-inc-desc">جسم صلب على مستو مائل أملس؛ يتحلل ثقله w إلى مركبة موازية F1 ومركبة عمودية F2 تشكلان مستطيلاً، بينما يعامد رد الفعل R السطح.</desc>
              ${markerDefs('sim-inc')}
              <line id="sim-inc-base" class="simulation-axis" x1="76" y1="334" x2="566" y2="334" />
              <line id="sim-inc-ramp" class="simulation-resolution-axis" x1="76" y1="334" x2="500" y2="180" />
              <polygon id="sim-inc-rect" class="simulation-triangle-fill simulation-resolution-fill" points="0,0" />
              <line id="sim-inc-proj1" class="simulation-construction" x1="0" y1="0" x2="0" y2="0" />
              <line id="sim-inc-proj2" class="simulation-construction" x1="0" y1="0" x2="0" y2="0" />
              <g id="sim-inc-block">
                <rect x="-28" y="-15" width="56" height="30" rx="5" fill="#fde68a" stroke="#b45309" stroke-width="2" />
              </g>
              <line id="sim-inc-vec-r" class="simulation-vector" stroke="#334155" marker-end="url(#sim-inc-slate-arrow)" x1="0" y1="0" x2="0" y2="0" />
              <line id="sim-inc-vec-f1" class="simulation-vector sim-vector-f1" marker-end="url(#sim-inc-f1-arrow)" x1="0" y1="0" x2="0" y2="0" />
              <line id="sim-inc-vec-f2" class="simulation-vector sim-vector-f2" marker-end="url(#sim-inc-f2-arrow)" x1="0" y1="0" x2="0" y2="0" />
              <line id="sim-inc-vec-w" class="simulation-vector sim-vector-result" marker-end="url(#sim-inc-result-arrow)" x1="0" y1="0" x2="0" y2="0" />
              <circle id="sim-inc-origin" class="simulation-point" r="4.5" cx="300" cy="200" />
              <text id="sim-inc-lbl-r" class="simulation-force-label" direction="ltr">R</text>
              <text id="sim-inc-lbl-f1" class="simulation-force-label" direction="ltr">F₁</text>
              <text id="sim-inc-lbl-f2" class="simulation-force-label" direction="ltr">F₂</text>
              <text id="sim-inc-lbl-w" class="simulation-force-label" direction="ltr">w</text>
            </svg>
          </div>
          <ul class="simulation-legend" aria-label="مفتاح رموز المستوى المائل">
            <li><span class="simulation-key result" aria-hidden="true"></span>${V_W} الثقل الشاقولي</li>
            <li><span class="simulation-key f1" aria-hidden="true"></span>${V_F1} موازية للمستوي</li>
            <li><span class="simulation-key f2" aria-hidden="true"></span>${V_F2} عمودية على المستوي</li>
            <li><span class="simulation-key slate" aria-hidden="true"></span>${V_R} ردّ فعل المستوي</li>
          </ul>
          <figcaption>نموذج تعليمي مبسّط لمستوٍ أملس عديم الاحتكاك: توازن R المركبة العمودية F₂، وتبقى F₁ مسؤولة عن انزلاق الجسم.</figcaption>
        </figure>
      </div>
    </div>

    <div class="sim-live-why" data-role="why-changed" aria-live="polite"></div>
    <section class="simulation-explanation" aria-labelledby="sim-d-explanation-heading">
      <h4 id="sim-d-explanation-heading">القاعدة الهندسية للتحليل</h4>
      <div class="simulation-equation">${forceResolutionIdentity}</div>
    </section>
    ${renderPredictionCard('force-resolution')}
  </section>`;
}

export function simulationMarkup(id) {
  if (id === 'concurrent') return concurrentMarkup();
  if (id === 'perpendicular') return perpendicularMarkup();
  if (id === 'spring-concurrency') return concurrentExperimentMarkup();
  if (id === 'force-resolution') return forceResolutionMarkup();
  return '';
}

function setLine(line, start, end, visible = true) {
  if (!line) return;
  line.setAttribute('x1', String(start.x));
  line.setAttribute('y1', String(start.y));
  line.setAttribute('x2', String(end.x));
  line.setAttribute('y2', String(end.y));
  line.setAttribute('visibility', visible ? 'visible' : 'hidden');
}

function setPoint(point, position, visible = true) {
  if (!point) return;
  point.setAttribute('cx', String(position.x));
  point.setAttribute('cy', String(position.y));
  point.setAttribute('visibility', visible ? 'visible' : 'hidden');
}

function setLabel(label, position, visible = true, dx = 9, dy = -10) {
  if (!label) return;
  label.setAttribute('x', String(position.x + dx));
  label.setAttribute('y', String(position.y + dy));
  label.setAttribute('visibility', visible ? 'visible' : 'hidden');
}

function syncRange(input, output, unit, ariaText) {
  const value = Number(input.value);
  if (output) {
    output.innerHTML = `<bdi dir="ltr">${formatNumber(value, String(input.step ?? '').includes('.') ? 1 : 0)} ${unit}</bdi>`;
  }
  input.setAttribute('aria-valuetext', ariaText(value));
  return value;
}

function updateConcurrentSimulation(root) {
  const f1Input = root.querySelector('[data-input="f1"]');
  const f2Input = root.querySelector('[data-input="f2"]');
  const angleInput = root.querySelector('[data-input="angle"]');
  const f1 = syncRange(f1Input, root.querySelector('#sim-a-f1-value'), 'N', (value) => `${value} نيوتن`);
  const f2 = syncRange(f2Input, root.querySelector('#sim-a-f2-value'), 'N', (value) => `${value} نيوتن`);
  const angle = Number(angleInput.value);
  const angleOut = root.querySelector('#sim-a-angle-value');
  if (angleOut) angleOut.innerHTML = `<bdi dir="ltr">${angle}°</bdi>`;
  angleInput.setAttribute('aria-valuetext', `${angle} درجة`);

  const step = Number(root.dataset.constructStep || 3);
  const showEquilibrant = root.dataset.showEquilibrant === 'true';

  const result = resultantOfConcurrentForces(f1, f2, angle);
  const geometry = concurrentDiagramGeometry(result);
  const { origin, F1Tip, F2Tip, resultantTip, equilibrantTip } = geometry;
  setLine(root.querySelector('#sim-a-vector-f1'), origin, F1Tip, f1 > 0);
  setLine(root.querySelector('#sim-a-vector-f2'), origin, F2Tip, f2 > 0);
  setLine(root.querySelector('#sim-a-edge-f1'), F1Tip, resultantTip, step >= 2 && f2 > 0);
  setLine(root.querySelector('#sim-a-edge-f2'), F2Tip, resultantTip, step >= 2 && f1 > 0);
  setLine(root.querySelector('#sim-a-vector-result'), origin, resultantTip, step >= 3 && result.magnitude > 1e-10);
  setLine(root.querySelector('#sim-a-vector-eq'), origin, equilibrantTip, showEquilibrant && result.magnitude > 1e-10);
  setPoint(root.querySelector('#sim-a-point-o'), origin);
  setPoint(root.querySelector('#sim-a-point-m'), resultantTip, step >= 2 && result.magnitude > 1e-10);
  setLabel(root.querySelector('#sim-a-label-m'), resultantTip, step >= 2 && result.magnitude > 1e-10);
  setLabel(root.querySelector('#sim-a-label-eq'), equilibrantTip, showEquilibrant && result.magnitude > 1e-10, -24, 16);

  const radius = 32;
  const angleArc = root.querySelector('#sim-a-angle-arc');
  if (angleArc) {
    if (angle > 0 && f1 > 0 && f2 > 0) {
      const end = { x: origin.x + radius * Math.cos(angle * Math.PI / 180), y: origin.y - radius * Math.sin(angle * Math.PI / 180) };
      angleArc.setAttribute('d', `M ${origin.x + radius} ${origin.y} A ${radius} ${radius} 0 0 0 ${end.x} ${end.y}`);
      angleArc.setAttribute('visibility', 'visible');
    } else {
      angleArc.setAttribute('visibility', 'hidden');
    }
  }

  const direction = formatNumber(result.directionDegrees, 1);
  const magnitude = formatNumber(result.magnitude, 2);
  root.querySelector('#sim-a-result').innerHTML = `<bdi dir="ltr">${magnitude} N</bdi>`;
  root.querySelector('#sim-a-direction').innerHTML = directionOutput(result.directionDegrees);
  const shapeNode = root.querySelector('#sim-a-shape');
  if (shapeNode) shapeNode.textContent = result.shape.labelAr;

  root.querySelector('#sim-a-status').innerHTML = result.directionDegrees === null
    ? 'نتيجة المحاكاة: <bdi dir="ltr">F = 0 N</bdi>؛ اتجاه المحصلة غير محدد عندما تكون المحصلة صفراً (القوتان متوازنتان).'
    : `نتيجة المحاكاة: <bdi dir="ltr">F = ${magnitude} N</bdi>؛ اتجاهها <bdi dir="ltr">${direction}°</bdi> بالنسبة إلى ${V_F1}.`;

  const whyNode = root.querySelector('[data-role="why-changed"]');
  if (whyNode) {
    const sumVal = formatNumber(f1 + f2, 1);
    const diffVal = formatNumber(Math.abs(f1 - f2), 1);
    const eqNote = showEquilibrant && result.magnitude > 1e-10
      ? ` وبإضافة قوة الموازنة ${V_F_PRIME} بشدة <bdi dir="ltr">${magnitude} N</bdi> وبجهة معاكسة للمحصلة يصبح المجموع الشعاعي للقوى الثلاث معدوماً فتتزن النقطة <bdi dir="ltr">O</bdi>.`
      : '';
    whyNode.innerHTML = `<strong>ما الذي تغيّر ولماذا؟</strong> عند الزاوية <bdi dir="ltr">${angle}°</bdi> شكّل الشعاعان <strong>${result.shape.labelAr}</strong>، فكانت شدة المحصلة <bdi dir="ltr">${magnitude} N</bdi> وهي محصورة حتماً بين الفرق <bdi dir="ltr">${diffVal} N</bdi> والمجموع <bdi dir="ltr">${sumVal} N</bdi>.${eqNote}`;
  }

  const descNode = root.querySelector('[data-role="diagram-description"]');
  if (descNode) {
    descNode.textContent = result.directionDegrees === null
      ? (f1 === 0 && f2 === 0
        ? 'القوتان تساويان صفراً؛ المحصلة تساوي صفراً عند نقطة التأثير O.'
        : 'قوتان متعاكستان متساويتان؛ المحصلة تساوي صفراً عند نقطة التأثير O.')
      : `قوتان تبدآن عند O بزاوية ${angle} درجة؛ متوازي الأضلاع وقطره OM يوضحان محصلة مقدارها ${magnitude} نيوتن واتجاهها ${direction} درجة من اتجاه F1.`;
  }
}

function updatePerpendicularSimulation(root) {
  const f1Input = root.querySelector('[data-input="f1"]');
  const f2Input = root.querySelector('[data-input="f2"]');
  const scaleSelect = root.querySelector('[data-scale-select]');
  const f1 = syncRange(f1Input, root.querySelector('#sim-b-f1-value'), 'N', (value) => `${value} نيوتن`);
  const f2 = syncRange(f2Input, root.querySelector('#sim-b-f2-value'), 'N', (value) => `${value} نيوتن`);
  const scaleVal = scaleSelect ? Number(scaleSelect.value) : 20;

  const result = resultantOfPerpendicularForces(f1, f2);
  const scaleModel = perpendicularScaleModel(f1, f2, scaleVal);
  const geometry = perpendicularDiagramGeometry(result);
  const { origin, F1Tip, F2Tip, resultantTip } = geometry;
  setLine(root.querySelector('#sim-b-vector-f1'), origin, F1Tip, f1 > 0);
  setLine(root.querySelector('#sim-b-vector-f2'), origin, F2Tip, f2 > 0);
  setLine(root.querySelector('#sim-b-vector-result'), origin, resultantTip, result.magnitude > 1e-10);
  setLine(root.querySelector('#sim-b-edge-f1'), F1Tip, resultantTip, f2 > 0);
  setLine(root.querySelector('#sim-b-edge-f2'), F2Tip, resultantTip, f1 > 0);
  setPoint(root.querySelector('#sim-b-point-o'), origin);
  setPoint(root.querySelector('#sim-b-point-m'), resultantTip, result.magnitude > 1e-10);
  setLabel(root.querySelector('#sim-b-label-m'), resultantTip, result.magnitude > 1e-10);

  const triangle = root.querySelector('#sim-b-triangle');
  if (triangle) triangle.setAttribute('points', `${origin.x},${origin.y} ${F1Tip.x},${F1Tip.y} ${resultantTip.x},${resultantTip.y}`);
  const squareSize = 14;
  root.querySelector('#sim-b-right-angle-o')?.setAttribute('d', `M ${origin.x} ${origin.y - squareSize} L ${origin.x + squareSize} ${origin.y - squareSize} L ${origin.x + squareSize} ${origin.y}`);
  root.querySelector('#sim-b-right-angle-triangle')?.setAttribute('d', `M ${F1Tip.x - squareSize} ${F1Tip.y} L ${F1Tip.x - squareSize} ${F1Tip.y - squareSize} L ${F1Tip.x} ${F1Tip.y - squareSize}`);

  const magnitude = formatNumber(result.magnitude, 2);
  const direction = formatNumber(result.directionDegrees, 1);
  root.querySelector('#sim-b-result').innerHTML = `<bdi dir="ltr">${magnitude} N</bdi>`;
  root.querySelector('#sim-b-direction').innerHTML = directionOutput(result.directionDegrees);
  root.querySelector('#sim-b-status').innerHTML = result.directionDegrees === null
    ? 'نتيجة المحاكاة: <bdi dir="ltr">F = 0 N</bdi>؛ اتجاه المحصلة غير محدد عندما تكون المحصلة صفراً.'
    : `نتيجة المحاكاة: <bdi dir="ltr">F = ${magnitude} N</bdi>؛ اتجاهها <bdi dir="ltr">${direction}°</bdi> بالنسبة إلى ${V_F1}.`;

  const stepsBox = root.querySelector('#sim-b-steps');
  if (stepsBox) {
    stepsBox.innerHTML = `
      <div class="sim-step-line"><span>١. بالرسم (<bdi dir="ltr">1 cm : ${scaleVal} N</bdi>):</span> <bdi dir="ltr">L₁ = ${formatNumber(scaleModel.cmF1, 2)} cm , L₂ = ${formatNumber(scaleModel.cmF2, 2)} cm | OM = ${formatNumber(scaleModel.cmResultant, 2)} cm</bdi></div>
      <div class="sim-step-line"><span>٢. بفيثاغورث:</span> <bdi dir="ltr">F = √(${f1}² + ${f2}²) = √(${scaleModel.f1Squared} + ${scaleModel.f2Squared}) = √${scaleModel.sumOfSquares} = ${magnitude} N</bdi></div>
    `;
  }

  const whyNode = root.querySelector('[data-role="why-changed"]');
  if (whyNode) {
    whyNode.innerHTML = `<strong>ما الذي تغيّر ولماذا؟</strong> الشكل المنشأ الآن هو <strong>${scaleModel.shapeLabel}</strong>. الطريقتان متطابقتان تماماً: ضرب طول القطر <bdi dir="ltr">${formatNumber(scaleModel.cmResultant, 2)} cm</bdi> في المقياس <bdi dir="ltr">${scaleVal} N/cm</bdi> يعطي <bdi dir="ltr">${magnitude} N</bdi>، وهو نفسه جذر مجموع المربعين.`;
  }

  const descNode = root.querySelector('[data-role="diagram-description"]');
  if (descNode) {
    descNode.textContent = `قوتان متعامدتان عند O؛ المحصلة تمثل قطراً ومقدارها ${magnitude} نيوتن، ومثلثها قائم.`;
  }
}

function updateConcurrentExperimentSimulation(root) {
  const horizontalInput = root.querySelector('[data-input="horizontal"]');
  const verticalInput = root.querySelector('[data-input="vertical"]');
  const weightInput = root.querySelector('[data-input="weight"]');
  const syncPosition = (input, output) => {
    const value = Number(input.value);
    if (output) output.innerHTML = `<bdi dir="ltr">${formatNumber(value, 0)}%</bdi>`;
    input.setAttribute('aria-valuetext', `${formatNumber(value, 0)} بالمئة`);
    return value;
  };
  const horizontal = syncPosition(horizontalInput, root.querySelector('#sim-c-horizontal-value'));
  const vertical = syncPosition(verticalInput, root.querySelector('#sim-c-vertical-value'));
  const weight = weightInput
    ? syncRange(weightInput, root.querySelector('#sim-c-weight-value'), 'N', (v) => `${v} نيوتن`)
    : 6;
  const boardMode = root.dataset.boardMode || 'double';
  const hideApparatus = root.dataset.hideApparatus === 'true';

  const geometry = concurrentExperimentGeometry(horizontal, vertical);
  const equilibrium = springBoardEquilibrium({
    weightNewtons: weight,
    horizontalPercent: horizontal,
    verticalPercent: vertical,
    mode: boardMode,
  });

  if (boardMode === 'single') {
    setLine(root.querySelector('#sim-c-carrier-f1'), equilibrium.carriers.F1.start, equilibrium.carriers.F1.end, true);
    setLine(root.querySelector('#sim-c-carrier-f2'), equilibrium.origin, equilibrium.origin, false);
    setLine(root.querySelector('#sim-c-carrier-weight'), equilibrium.carriers.W.start, equilibrium.carriers.W.end, true);
    setLine(root.querySelector('#sim-c-vector-f1'), equilibrium.origin, equilibrium.arrowTips.F1, !hideApparatus);
    setLine(root.querySelector('#sim-c-vector-f2'), equilibrium.origin, equilibrium.origin, false);
    setLine(root.querySelector('#sim-c-vector-weight'), equilibrium.origin, equilibrium.arrowTips.W, !hideApparatus);
    setLabel(root.querySelector('#sim-c-label-f1'), equilibrium.arrowTips.F1, !hideApparatus);
    setLabel(root.querySelector('#sim-c-label-f2'), equilibrium.origin, false);
    setLabel(root.querySelector('#sim-c-label-weight'), equilibrium.arrowTips.W, !hideApparatus);
    setPoint(root.querySelector('#sim-c-guide-f1'), equilibrium.anchors.F1, !hideApparatus);
    setPoint(root.querySelector('#sim-c-guide-f2'), equilibrium.origin, false);
    setLine(root.querySelector('#sim-c-cord-1'), equilibrium.anchors.F1, equilibrium.origin, !hideApparatus);
    setLine(root.querySelector('#sim-c-cord-2'), equilibrium.origin, equilibrium.origin, false);
  } else {
    // Keep exact carrier & vector endpoints compatible with concurrentExperimentGeometry when weightInput is absent (unit-test mock)
    const tips = weightInput ? equilibrium.arrowTips : geometry.arrowTips;
    for (const [name, carrier] of Object.entries(geometry.carriers)) {
      const id = name === 'W' ? 'weight' : name.toLowerCase();
      setLine(root.querySelector(`#sim-c-carrier-${id}`), carrier.start, carrier.end, true);
    }
    for (const [name, tip] of Object.entries(tips)) {
      const id = name === 'W' ? 'weight' : name.toLowerCase();
      setLine(root.querySelector(`#sim-c-vector-${id}`), geometry.origin, tip, !hideApparatus);
      setLabel(root.querySelector(`#sim-c-label-${id}`), tip, !hideApparatus);
    }
    setPoint(root.querySelector('#sim-c-guide-f1'), geometry.guidePoints.F1, !hideApparatus);
    setPoint(root.querySelector('#sim-c-guide-f2'), geometry.guidePoints.F2, !hideApparatus);
    setLine(root.querySelector('#sim-c-cord-1'), geometry.guidePoints.F1, geometry.origin, !hideApparatus);
    setLine(root.querySelector('#sim-c-cord-2'), geometry.guidePoints.F2, geometry.origin, !hideApparatus);
  }

  const massBox = root.querySelector('#sim-c-mass-box');
  const massHook = root.querySelector('#sim-c-mass-hook');
  if (massBox) {
    massBox.setAttribute('x', String(geometry.origin.x - 18));
    massBox.setAttribute('y', String(geometry.origin.y + 26));
    massBox.setAttribute('visibility', hideApparatus ? 'hidden' : 'visible');
  }
  setLine(massHook, geometry.origin, { x: geometry.origin.x, y: geometry.origin.y + 26 }, !hideApparatus);

  setPoint(root.querySelector('#sim-c-point-ring'), geometry.origin);
  setPoint(root.querySelector('#sim-c-point-o'), geometry.origin);
  setLabel(root.querySelector('#sim-c-label-o'), geometry.origin);

  const t1Out = root.querySelector('#sim-c-t1');
  const t2Out = root.querySelector('#sim-c-t2');
  if (t1Out) t1Out.innerHTML = `<bdi dir="ltr">${formatNumber(equilibrium.tension1Newtons, 2)} N</bdi>`;
  if (t2Out) {
    t2Out.innerHTML = boardMode === 'single'
      ? '<span dir="rtl">غير مستخدمة</span>'
      : `<bdi dir="ltr">${formatNumber(equilibrium.tension2Newtons, 2)} N</bdi>`;
  }

  root.querySelector('#sim-c-status').innerHTML = boardMode === 'single'
    ? `ربيعة واحدة شاقولية: ينطبق حامل توتر النابض على حامل الثقل <bdi dir="ltr">(${weight} N)</bdi> وتلتقي الخطوط عند <bdi dir="ltr">O</bdi>.`
    : `الموضع الأفقي <bdi dir="ltr">${formatNumber(horizontal, 0)}%</bdi> والرأسي <bdi dir="ltr">${formatNumber(vertical, 0)}%</bdi>؛ تلتقي حوامل قوتي الشد وقوة الثقل عند النقطة <bdi dir="ltr">O</bdi>.`;

  const whyNode = root.querySelector('[data-role="why-changed"]');
  if (whyNode) {
    if (hideApparatus) {
      whyNode.innerHTML = '<strong>الخطوة 6 (رفع الجهاز عن اللوح):</strong> اختفت الربيعتان والجسم، وبقيت على اللوح الخطوط المستقيمة الممثلة لحوامل القوى الثلاث، وجميعها تتقاطع في النقطة الواحدة <bdi dir="ltr">O</bdi>!';
    } else if (boardMode === 'single') {
      whyNode.innerHTML = `<strong>حالة ربيعة واحدة (الخطوتان 1–2):</strong> حامل قوة توتر النابض منطبق تماماً على الحامل الشاقولي لقوة الثقل، وجهتاهما متعاكستان، وشدة التوتر تساوي <bdi dir="ltr">${weight} N</bdi>.`;
    } else {
      whyNode.innerHTML = `<strong>حالة ربيعتين (الخطوات 3–5):</strong> ليس لحاملي الشدّ الاستقامة ذاتها (الزاوية بينهما <bdi dir="ltr">${formatNumber(equilibrium.includedAngleDegrees, 1)}°</bdi>)، وحامل الثقل بقي شاقولياً، لكن امتدادات الحوامل الثلاثة تلتقي كلها في <bdi dir="ltr">O</bdi>. الربيعة الأقرب إلى الشاقول تحمل شداً أكبر.`;
    }
  }

  const descNode = root.querySelector('[data-role="diagram-description"]');
  if (descNode) {
    descNode.textContent = `حوامل قوتي الشد المائلتين والحامل الرأسي لقوة الثقل تلتقي عند O؛ موضع O الأفقي ${formatNumber(horizontal, 0)} بالمئة والرأسي ${formatNumber(vertical, 0)} بالمئة من مجال الحركة.`;
  }
}

function updateForceResolutionSimulation(root) {
  const forceInput = root.querySelector('[data-input="force"]');
  const angleInput = root.querySelector('[data-input="angle"]');
  const force = syncRange(forceInput, root.querySelector('#sim-d-force-value'), 'N', (value) => `${formatNumber(value, 1)} نيوتن`);
  const angle = Number(angleInput.value);
  const angleOut = root.querySelector('#sim-d-angle-value');
  if (angleOut) angleOut.innerHTML = `<bdi dir="ltr">${formatNumber(angle, 0)}°</bdi>`;
  angleInput.setAttribute('aria-valuetext', `${formatNumber(angle, 0)} درجة`);

  const components = resolveForceIntoPerpendicularComponents(force, angle);
  const geometry = forceResolutionDiagramGeometry(components);
  const hasX = components.componentX > 1e-10;
  const hasY = components.componentY > 1e-10;
  const hasForce = force > 1e-10;
  const rectangle = root.querySelector('#sim-d-rectangle');
  if (rectangle) {
    rectangle.setAttribute('points', `${geometry.origin.x},${geometry.origin.y} ${geometry.XTip.x},${geometry.XTip.y} ${geometry.resultantTip.x},${geometry.resultantTip.y} ${geometry.YTip.x},${geometry.YTip.y}`);
    rectangle.setAttribute('visibility', hasX && hasY ? 'visible' : 'hidden');
  }
  setLine(root.querySelector('#sim-d-component-x'), geometry.origin, geometry.XTip, hasX);
  setLine(root.querySelector('#sim-d-component-y'), geometry.origin, geometry.YTip, hasY);
  setLine(root.querySelector('#sim-d-force-vector'), geometry.origin, geometry.resultantTip, hasForce);
  setLine(root.querySelector('#sim-d-projection-x'), geometry.XTip, geometry.resultantTip, hasX && hasY);
  setLine(root.querySelector('#sim-d-projection-y'), geometry.YTip, geometry.resultantTip, hasX && hasY);
  setPoint(root.querySelector('#sim-d-origin'), geometry.origin);
  setPoint(root.querySelector('#sim-d-point-x'), geometry.XTip, hasX);
  setPoint(root.querySelector('#sim-d-point-y'), geometry.YTip, hasY);
  setPoint(root.querySelector('#sim-d-point-m'), geometry.resultantTip, hasForce);
  setLabel(root.querySelector('#sim-d-label-x'), geometry.XTip, hasX);
  setLabel(root.querySelector('#sim-d-label-y'), geometry.YTip, hasY);
  setLabel(root.querySelector('#sim-d-label-m'), geometry.resultantTip, hasForce);

  const componentX = formatNumber(components.componentX);
  const componentY = formatNumber(components.componentY);
  root.querySelector('#sim-d-x-value').innerHTML = `<bdi dir="ltr">${componentX} N</bdi>`;
  root.querySelector('#sim-d-y-value').innerHTML = `<bdi dir="ltr">${componentY} N</bdi>`;
  root.querySelector('#sim-d-status').innerHTML = `المركبتان المتعامدتان على ${V_OX} و${V_OY} مقدارهما <bdi dir="ltr">${componentX} N</bdi> و<bdi dir="ltr">${componentY} N</bdi>؛ جمعهما المتجهي يعيد القوة الأصلية ${V_OM}.`;

  // Also update inclined-plane sub-panel if present
  const incAngleInput = root.querySelector('[data-incline-input="angle"]');
  const incWeightInput = root.querySelector('[data-incline-input="weight"]');
  let inclineSummary = '';
  if (incAngleInput && incWeightInput) {
    const incAngle = Number(incAngleInput.value);
    const incWeight = Number(incWeightInput.value);
    root.querySelector('#sim-d-incline-angle-value').innerHTML = `<bdi dir="ltr">${incAngle}°</bdi>`;
    root.querySelector('#sim-d-incline-weight-value').innerHTML = `<bdi dir="ltr">${incWeight} N</bdi>`;
    incAngleInput.setAttribute('aria-valuetext', `${incAngle} درجة`);
    incWeightInput.setAttribute('aria-valuetext', `${incWeight} نيوتن`);

    const incModel = inclinedPlaneResolution(incWeight, incAngle);
    const incGeo = inclinedPlaneDiagramGeometry(incModel);
    setLine(root.querySelector('#sim-inc-ramp'), incGeo.baseStart, incGeo.rampEnd, true);
    const blockGroup = root.querySelector('#sim-inc-block');
    if (blockGroup) {
      blockGroup.setAttribute('transform', `translate(${incGeo.origin.x} ${incGeo.origin.y}) rotate(${-incAngle})`);
    }
    const showF1 = incModel.parallelF1 > 1e-9;
    const showF2 = incModel.normalF2 > 1e-9;
    const incRect = root.querySelector('#sim-inc-rect');
    if (incRect) {
      incRect.setAttribute('points', `${incGeo.origin.x},${incGeo.origin.y} ${incGeo.f1Tip.x},${incGeo.f1Tip.y} ${incGeo.weightTip.x},${incGeo.weightTip.y} ${incGeo.f2Tip.x},${incGeo.f2Tip.y}`);
      incRect.setAttribute('visibility', showF1 && showF2 ? 'visible' : 'hidden');
    }
    setLine(root.querySelector('#sim-inc-proj1'), incGeo.f1Tip, incGeo.weightTip, showF1 && showF2);
    setLine(root.querySelector('#sim-inc-proj2'), incGeo.f2Tip, incGeo.weightTip, showF1 && showF2);
    setLine(root.querySelector('#sim-inc-vec-r'), incGeo.origin, incGeo.normalTip, showF2);
    setLine(root.querySelector('#sim-inc-vec-f1'), incGeo.origin, incGeo.f1Tip, showF1);
    setLine(root.querySelector('#sim-inc-vec-f2'), incGeo.origin, incGeo.f2Tip, showF2);
    setLine(root.querySelector('#sim-inc-vec-w'), incGeo.origin, incGeo.weightTip, true);
    setPoint(root.querySelector('#sim-inc-origin'), incGeo.origin, true);
    setLabel(root.querySelector('#sim-inc-lbl-r'), incGeo.normalTip, showF2, 10, 4);
    setLabel(root.querySelector('#sim-inc-lbl-f1'), incGeo.f1Tip, showF1, -28, 6);
    setLabel(root.querySelector('#sim-inc-lbl-f2'), incGeo.f2Tip, showF2, 10, 8);
    setLabel(root.querySelector('#sim-inc-lbl-w'), incGeo.weightTip, true, -24, 14);

    root.querySelector('#sim-d-inc-f1').innerHTML = `<bdi dir="ltr">${formatNumber(incModel.parallelF1)} N</bdi>`;
    root.querySelector('#sim-d-inc-f2').innerHTML = `<bdi dir="ltr">${formatNumber(incModel.normalF2)} N</bdi>`;
    root.querySelector('#sim-d-inc-r').innerHTML = `<bdi dir="ltr">${formatNumber(incModel.normalReactionR)} N</bdi>`;
    root.querySelector('#sim-d-incline-status').innerHTML = incAngle === 0
      ? `عند الزاوية <bdi dir="ltr">0°</bdi> (سطح أفقي): تنعدم مركبة الانزلاق <bdi dir="ltr">F₁ = 0 N</bdi> وينطبق الثقل كله على الناظم <bdi dir="ltr">F₂ = w = ${incWeight} N</bdi>.`
      : `عند ميل <bdi dir="ltr">${incAngle}°</bdi>: مركبة الانزلاق <bdi dir="ltr">F₁ = ${formatNumber(incModel.parallelF1)} N</bdi>، والمركبة الضاغطة <bdi dir="ltr">F₂ = ${formatNumber(incModel.normalF2)} N</bdi>، والشكل المتشكل مستطيل قطره الثقل <bdi dir="ltr">${incWeight} N</bdi>.`;
    inclineSummary = ` في وضع المستوى المائل (<bdi dir="ltr">a = ${incAngle}°</bdi>): <bdi dir="ltr">F₁ = ${formatNumber(incModel.parallelF1)} N</bdi> و<bdi dir="ltr">F₂ = ${formatNumber(incModel.normalF2)} N</bdi>.`;
  }

  const whyNode = root.querySelector('[data-role="why-changed"]');
  if (whyNode) {
    const activeTab = root.dataset.activeResTab || 'axes';
    whyNode.innerHTML = activeTab === 'incline'
      ? `<strong>ما الذي تغيّر ولماذا؟</strong>${inclineSummary} لاحظ أن الثقل الشاقولي يتوزع دائماً إلى مركبتين متعامدتين تشكلان مستطيلاً، فتتكفل رد الفعل العمودية بموازنة ${V_F2} وتبقى ${V_F1} تدفع الجسم للانزلاق أسفل المستوي.`
      : `<strong>ما الذي تغيّر ولماذا؟</strong> عند الزاوية <bdi dir="ltr">${angle}°</bdi> أخذ المحور ${V_OX} مركبة شدتها <bdi dir="ltr">${componentX} N</bdi> وأخذ المحور ${V_OY} مركبة شدتها <bdi dir="ltr">${componentY} N</bdi>، ولو طبقنا فيثاغورث على المركبتين لعادت القوة الأصلية <bdi dir="ltr">√(${componentX}² + ${componentY}²) ≈ ${formatNumber(force, 2)} N</bdi>.`;
  }

  const descNode = root.querySelector('[data-role="diagram-description"]');
  if (descNode) {
    descNode.textContent = `قوة أصلية مقدارها ${formatNumber(force, 1)} نيوتن عند زاوية ${formatNumber(angle, 0)} درجة من OX؛ مركبتها الأفقية ${componentX} نيوتن والعمودية ${componentY} نيوتن. القطر من O إلى M يساوي مجموع متجهي المركبتين على OX وOY.`;
  }
}

function runSweep(root, button) {
  const input = root.querySelector(`#${button.dataset.sweep}`);
  if (!input || button.disabled) return;
  const isConcurrentAngle = button.dataset.sweep === 'sim-a-angle';
  const start = Number(input.value);
  const waypoints = isConcurrentAngle ? [10, 170, 10, start] : [5, 85, 5, start];
  const segmentMillis = isConcurrentAngle ? [900, 3400, 3400, 900] : [900, 3000, 3000, 900];
  const reduced = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  button.disabled = true;
  const dispatch = () => input.dispatchEvent(new Event('input', { bubbles: true }));
  const finish = () => { button.disabled = false; };

  if (reduced) {
    let index = 0;
    const step = () => {
      if (index >= waypoints.length) { finish(); return; }
      input.value = String(waypoints[index]);
      dispatch();
      index += 1;
      window.setTimeout(step, 1200);
    };
    step();
    return;
  }

  let segment = 0;
  let segmentStart = null;
  let from = start;
  const tick = (timestamp) => {
    if (segmentStart === null) segmentStart = timestamp;
    const duration = segmentMillis[segment];
    const progress = Math.min(1, (timestamp - segmentStart) / duration);
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - ((-2 * progress + 2) ** 2) / 2;
    const to = waypoints[segment];
    input.value = String(Math.round((from + (to - from) * eased) * 10) / 10);
    dispatch();
    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }
    from = to;
    segment += 1;
    segmentStart = null;
    if (segment < waypoints.length) requestAnimationFrame(tick);
    else { input.value = String(waypoints.at(-1)); dispatch(); finish(); }
  };
  requestAnimationFrame(tick);
}

function wirePredictionCard(root) {
  const form = root.querySelector?.('[data-sim-prediction]');
  if (!form || !form.addEventListener) return;
  const simId = form.dataset.simPrediction;
  const config = SIM_PREDICTIONS[simId];
  const feedback = form.querySelector('[data-role="prediction-feedback"]');
  if (!config || !feedback) return;

  form.addEventListener('change', () => {
    feedback.hidden = true;
    feedback.innerHTML = '';
    feedback.className = 'sim-prediction-feedback';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const checked = form.querySelector('input[type="radio"]:checked');
    if (!checked) {
      feedback.hidden = false;
      feedback.className = 'sim-prediction-feedback is-warning';
      feedback.textContent = 'اختر أحد التوقعات أولاً ثم اضغط «تحقّق من تنبؤي».';
      return;
    }
    const option = config.options.find((item) => item.id === checked.value);
    const isCorrect = checked.value === config.correct;
    feedback.hidden = false;
    feedback.className = `sim-prediction-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
    feedback.innerHTML = `<strong>${isCorrect ? 'توقّع صحيح:' : 'راجع التفسير الفيزيائي:'}</strong> ${option?.feedback ?? ''}`;
  });

  form.addEventListener('reset', () => {
    feedback.hidden = true;
    feedback.innerHTML = '';
    feedback.className = 'sim-prediction-feedback';
  });
}

function wireRichControls(root, update) {
  if (!root.querySelectorAll) return;

  // Board modes in Lab 1
  for (const modeBtn of root.querySelectorAll('[data-board-mode]')) {
    modeBtn.addEventListener('click', () => {
      root.dataset.boardMode = modeBtn.dataset.boardMode;
      for (const b of root.querySelectorAll('[data-board-mode]')) {
        const active = b === modeBtn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      }
      update();
    });
  }

  const apparatusBtn = root.querySelector?.('[data-toggle-apparatus]');
  if (apparatusBtn?.addEventListener) {
    apparatusBtn.addEventListener('click', () => {
      const next = root.dataset.hideApparatus !== 'true';
      root.dataset.hideApparatus = String(next);
      apparatusBtn.classList.toggle('is-active', next);
      apparatusBtn.setAttribute('aria-pressed', String(next));
      apparatusBtn.textContent = next ? 'أعد الربيعتين والجسم إلى اللوح' : 'الخطوة 6: ارفع الربيعتين والجسم';
      update();
    });
  }

  // Presets & construction stepper in Lab 2
  for (const preset of root.querySelectorAll('[data-preset-f1]')) {
    preset.addEventListener('click', () => {
      const f1 = root.querySelector('[data-input="f1"]');
      const f2 = root.querySelector('[data-input="f2"]');
      const angle = root.querySelector('[data-input="angle"]');
      if (f1) f1.value = preset.dataset.presetF1;
      if (f2) f2.value = preset.dataset.presetF2;
      if (angle) angle.value = preset.dataset.presetAngle;
      root.dataset.constructStep = '3';
      for (const stepBtn of root.querySelectorAll('[data-construct-step]')) {
        stepBtn.classList.toggle('is-active', stepBtn.dataset.constructStep === '3');
      }
      update();
    });
  }

  for (const stepBtn of root.querySelectorAll('[data-construct-step]')) {
    stepBtn.addEventListener('click', () => {
      root.dataset.constructStep = stepBtn.dataset.constructStep;
      for (const b of root.querySelectorAll('[data-construct-step]')) {
        b.classList.toggle('is-active', b === stepBtn);
      }
      update();
    });
  }

  const eqCheck = root.querySelector?.('[data-toggle-equilibrant]');
  if (eqCheck?.addEventListener) {
    eqCheck.addEventListener('change', () => {
      root.dataset.showEquilibrant = String(eqCheck.checked);
      update();
    });
  }

  // Presets & scale selector in Lab 3
  const scaleSelect = root.querySelector?.('[data-scale-select]');
  if (scaleSelect?.addEventListener) {
    scaleSelect.addEventListener('change', update);
  }
  for (const perpPreset of root.querySelectorAll('[data-perp-f1]')) {
    perpPreset.addEventListener('click', () => {
      const f1 = root.querySelector('[data-input="f1"]');
      const f2 = root.querySelector('[data-input="f2"]');
      if (f1) f1.value = perpPreset.dataset.perpF1;
      if (f2) f2.value = perpPreset.dataset.perpF2;
      if (scaleSelect && perpPreset.dataset.perpScale) {
        scaleSelect.value = perpPreset.dataset.perpScale;
      }
      update();
    });
  }

  // Tabs in Lab 4 (Axes vs Inclined Plane)
  for (const tabBtn of root.querySelectorAll('[data-res-tab]')) {
    tabBtn.addEventListener('click', () => {
      const target = tabBtn.dataset.resTab;
      root.dataset.activeResTab = target;
      for (const b of root.querySelectorAll('[data-res-tab]')) {
        const active = b === tabBtn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      }
      for (const panel of root.querySelectorAll('[data-res-panel]')) {
        panel.hidden = panel.dataset.resPanel !== target;
      }
      update();
    });
  }

  // Reset button across all simulations
  const resetBtn = root.querySelector?.('[data-sim-reset]');
  if (resetBtn?.addEventListener) {
    resetBtn.addEventListener('click', () => {
      for (const input of root.querySelectorAll('input[type="range"]')) {
        if (input.dataset?.default !== undefined) input.value = input.dataset.default;
      }
      if (scaleSelect) scaleSelect.value = '20';
      if (eqCheck) eqCheck.checked = false;
      delete root.dataset.showEquilibrant;
      delete root.dataset.hideApparatus;
      delete root.dataset.boardMode;
      root.dataset.constructStep = '3';
      if (apparatusBtn) {
        apparatusBtn.classList.remove('is-active');
        apparatusBtn.setAttribute('aria-pressed', 'false');
        apparatusBtn.textContent = 'الخطوة 6: ارفع الربيعتين والجسم';
      }
      for (const b of root.querySelectorAll('[data-board-mode]')) {
        const active = b.dataset.boardMode === 'double';
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      }
      for (const b of root.querySelectorAll('[data-construct-step]')) {
        b.classList.toggle('is-active', b.dataset.constructStep === '3');
      }
      update();
    });
  }

  wirePredictionCard(root);
}

export function mountSimulationExperiences(container) {
  const updateByType = {
    concurrent: updateConcurrentSimulation,
    perpendicular: updatePerpendicularSimulation,
    'spring-concurrency': updateConcurrentExperimentSimulation,
    'force-resolution': updateForceResolutionSimulation,
  };
  for (const root of container.querySelectorAll('[data-simulation]')) {
    if (root.dataset.mounted === 'true') continue;
    const updateSimulation = updateByType[root.dataset.simulation];
    if (!updateSimulation) continue;
    root.dataset.mounted = 'true';
    const update = () => updateSimulation(root);
    for (const input of root.querySelectorAll('input[type="range"]')) {
      input.addEventListener('input', update);
    }
    for (const button of root.querySelectorAll('[data-sweep]')) {
      button.addEventListener('click', () => runSweep(root, button));
    }
    wireRichControls(root, update);
    update();
  }
}

export { concurrentMarkup, perpendicularMarkup, SIM_PREDICTIONS };
