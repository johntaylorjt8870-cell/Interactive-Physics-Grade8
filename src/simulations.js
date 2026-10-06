import { formula, tex, V_F1, V_F2, V_F, V_W, V_OM, V_OX, V_OY } from './math.js';
import {
  concurrentDiagramGeometry,
  concurrentExperimentGeometry,
  forceResolutionDiagramGeometry,
  perpendicularDiagramGeometry,
  resolveForceIntoPerpendicularComponents,
  resultantOfConcurrentForces,
  resultantOfPerpendicularForces,
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
      min="${min}" max="${max}" step="${step}" value="${value}"
      aria-label="${ariaLabel}" aria-valuetext="${value} ${unit}"${describedBy ? ` aria-describedby="${describedBy}"` : ''} />
    <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">${min} ${unit}</bdi><bdi dir="ltr">${max} ${unit}</bdi></div>
  </div>`;

const markerDefs = (prefix) => `<defs>
  <marker id="${prefix}-f1-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#148f91" /></marker>
  <marker id="${prefix}-f2-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#536fc4" /></marker>
  <marker id="${prefix}-result-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#d97961" /></marker>
</defs>`;

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

function concurrentMarkup() {
  return `<section class="simulation-experience simulation-concurrent" data-simulation="concurrent" aria-labelledby="simulation-a-heading">
    <header class="simulation-header">
      <span class="simulation-platform-label">محاكاة تفاعلية من المنصة</span>
      <h3 id="simulation-a-heading">استكشف محصلة قوتين متلاقيتين</h3>
      <p>غيّر شدتي القوتين والزاوية بينهما. يبدأ السهمان من النقطة نفسها، ويبيّن متوازي الأضلاع كيف يتغير قطر المحصلة.</p>
      <p class="simulation-default-note">قيم البداية للاستكشاف فقط، وليست قيماً من المثال المحلول في الكتاب.</p>
    </header>
    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="مدخلات محاكاة محصلة قوتين">
        ${controlMarkup({ id: 'sim-a-f1', symbol: V_F1, label: 'شدة القوة', min: 0, max: 10, step: 0.5, value: 6, unit: 'N', ariaLabel: 'شدة القوة F1 بالنيوتن' })}
        ${controlMarkup({ id: 'sim-a-f2', symbol: V_F2, label: 'شدة القوة', min: 0, max: 10, step: 0.5, value: 4, unit: 'N', ariaLabel: 'شدة القوة F2 بالنيوتن' })}
        <div class="simulation-control">
          <div class="simulation-control-heading">
            <label for="sim-a-angle">الزاوية بين ${V_F1} و${V_F2}</label>
            <output class="simulation-control-value" id="sim-a-angle-value" for="sim-a-angle"><bdi dir="ltr">45°</bdi></output>
          </div>
          <input class="simulation-range" id="sim-a-angle" data-input="angle" type="range" min="0" max="180" step="1" value="45"
            aria-label="الزاوية بين F1 وF2 بالدرجات" aria-valuetext="45 درجة" aria-describedby="sim-a-angle-help" />
          <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">0°</bdi><bdi dir="ltr">180°</bdi></div>
          <p class="simulation-control-help" id="sim-a-angle-help">تقاس من اتجاه ${V_F1} إلى ${V_F2} عكس عقارب الساعة.</p>
        </div>
        <div class="simulation-sweep-row">
          <button class="simulation-sweep" type="button" data-sweep="sim-a-angle" aria-describedby="sim-a-sweep-hint">
            <span aria-hidden="true">▶</span> شاهد المحصلة تتغير
          </button>
          <p class="simulation-sweep-hint" id="sim-a-sweep-hint">تتحرك الزاوية تدريجيًا من <bdi dir="ltr">10°</bdi> إلى <bdi dir="ltr">170°</bdi> ثم تعود؛ راقب كيف يقصر القطر ويطول.</p>
        </div>
        <div class="simulation-result-grid">
          <div class="simulation-result-cell">
            <span id="sim-a-result-label">شدة المحصلة ${V_F}</span>
            <output id="sim-a-result" class="simulation-result-value" aria-labelledby="sim-a-result-label"><bdi dir="ltr">— N</bdi></output>
          </div>
          <div class="simulation-result-cell">
            <span id="sim-a-direction-label">اتجاهها بالنسبة إلى ${V_F1}</span>
            <output id="sim-a-direction" class="simulation-result-value" aria-labelledby="sim-a-direction-label"><bdi dir="ltr">—</bdi></output>
          </div>
        </div>
        <p class="simulation-status" id="sim-a-status" role="status" aria-live="polite" aria-atomic="true">تتغير المحصلة مع الشدتين والزاوية.</p>
      </section>
      <figure class="simulation-visual">
        <div class="simulation-svg-wrap">
          <svg id="sim-a-svg" viewBox="0 0 640 360" role="img" aria-labelledby="sim-a-svg-title sim-a-svg-desc">
            <title id="sim-a-svg-title">متوازي أضلاع محصلتي القوتين</title>
            <desc id="sim-a-svg-desc" data-role="diagram-description">سهمان من نقطة التأثير O وقطر المحصلة M.</desc>
            ${markerDefs('sim-a')}
            <line class="simulation-axis" x1="22" y1="290" x2="615" y2="290" />
            <line class="simulation-construction" id="sim-a-edge-f1" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-construction" id="sim-a-edge-f2" x1="0" y1="0" x2="0" y2="0" />
            <path class="simulation-angle-arc" id="sim-a-angle-arc" d="" />
            <line class="simulation-vector sim-vector-f1" id="sim-a-vector-f1" marker-end="url(#sim-a-f1-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-f2" id="sim-a-vector-f2" marker-end="url(#sim-a-f2-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-result" id="sim-a-vector-result" marker-end="url(#sim-a-result-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <circle class="simulation-point" id="sim-a-point-o" r="5" cx="220" cy="290" />
            <circle class="simulation-point simulation-point-result" id="sim-a-point-m" r="5" cx="220" cy="290" />
            <text class="simulation-point-label" x="202" y="316" direction="ltr">O</text>
            <text class="simulation-point-label" id="sim-a-label-m" x="220" y="290" direction="ltr">M</text>
          </svg>
        </div>
        <ul class="simulation-legend" aria-label="مفتاح رموز المحاكاة">
          <li><span class="simulation-key f1" aria-hidden="true"></span>${V_F1}</li>
          <li><span class="simulation-key f2" aria-hidden="true"></span>${V_F2}</li>
          <li><span class="simulation-key result" aria-hidden="true"></span>${V_F} المحصلة</li>
          <li><span class="simulation-key construction" aria-hidden="true"></span>إنشاء متوازي الأضلاع</li>
        </ul>
        <figcaption>النقطة O هي نقطة التأثير المشتركة. القطر من O إلى M يمثل محصلة المحاكاة.</figcaption>
      </figure>
    </div>
    <section class="simulation-explanation" aria-labelledby="sim-a-explanation-heading">
      <h4 id="sim-a-explanation-heading">شرح المنصة</h4>
      <p>المحصلة هي جمع متجهي القوتين. عند تغيير الزاوية ${simulationAngleSymbol} أو أي شدة، تتغير مركبات المتجهين، فيتغير طول القطر واتجاهه.</p>
      <div class="simulation-equation">${magnitudeFormula}</div>
      <p class="simulation-equation-note">${simulationAngleSymbol} هي زاوية هذه المحاكاة بين ${V_F1} و${V_F2}، ومدخلها بالدرجات. الناتج المعروض أعلاه حساب المحاكاة، وليس قيمة المثال المقاسة في الكتاب.</p>
    </section>
  </section>`;
}

function perpendicularMarkup() {
  return `<section class="simulation-experience simulation-perpendicular" data-simulation="perpendicular" aria-labelledby="simulation-b-heading">
    <header class="simulation-header">
      <span class="simulation-platform-label">محاكاة تفاعلية من المنصة</span>
      <h3 id="simulation-b-heading">استكشف قوتين متعامدتين</h3>
      <p>غيّر شدتي القوتين. تبقى الزاوية بينهما قائمة، ويُظهر القطر محصلة المحاكاة والمثلث القائم الموافق لها.</p>
      <p class="simulation-default-note">قيم البداية في هذه المحاكاة ليست قيماً من المثال المطبوع في الكتاب.</p>
    </header>
    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="مدخلات محاكاة القوتين المتعامدتين">
        ${controlMarkup({ id: 'sim-b-f1', symbol: V_F1, label: 'شدة القوة', min: 0, max: 100, step: 1, value: 50, unit: 'N', ariaLabel: 'شدة القوة F1 بالنيوتن' })}
        ${controlMarkup({ id: 'sim-b-f2', symbol: V_F2, label: 'شدة القوة', min: 0, max: 100, step: 1, value: 70, unit: 'N', ariaLabel: 'شدة القوة F2 بالنيوتن' })}
        <div class="simulation-fixed-angle"><span>الزاوية بين القوتين</span><bdi dir="ltr">90°</bdi><span class="fixed-angle-mark" aria-hidden="true">□</span></div>
        <div class="simulation-result-grid">
          <div class="simulation-result-cell">
            <span id="sim-b-result-label">شدة المحصلة ${V_F}</span>
            <output id="sim-b-result" class="simulation-result-value" aria-labelledby="sim-b-result-label"><bdi dir="ltr">— N</bdi></output>
          </div>
          <div class="simulation-result-cell">
            <span id="sim-b-direction-label">اتجاهها بالنسبة إلى ${V_F1}</span>
            <output id="sim-b-direction" class="simulation-result-value" aria-labelledby="sim-b-direction-label"><bdi dir="ltr">—</bdi></output>
          </div>
        </div>
        <p class="simulation-status" id="sim-b-status" role="status" aria-live="polite" aria-atomic="true">القوتان متعامدتان؛ يتغير طول القطر عند تغيير أي شدة.</p>
      </section>
      <figure class="simulation-visual">
        <div class="simulation-svg-wrap simulation-svg-perpendicular">
          <svg id="sim-b-svg" viewBox="0 0 640 390" role="img" aria-labelledby="sim-b-svg-title sim-b-svg-desc">
            <title id="sim-b-svg-title">مثلث قائم لمحصلة قوتين متعامدتين</title>
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
          <li><span class="simulation-key result" aria-hidden="true"></span>${V_F} المحصلة / وتر المثلث</li>
          <li><span class="simulation-key construction" aria-hidden="true"></span>إكمال المستطيل والمثلث</li>
        </ul>
        <figcaption>مثلث قائم يوضح ضلعي القوة المتعامدين وقطر المستطيل من O إلى M.</figcaption>
      </figure>
    </div>
    <section class="simulation-explanation" aria-labelledby="sim-b-explanation-heading">
      <h4 id="sim-b-explanation-heading">شرح المنصة</h4>
      <p>لأن ${V_F1} و${V_F2} متعامدتان، يشكلان ضلعين متعامدين في مثلث قائم بعد نقل أحد المتجهين موازياً لنفسه. المحصلة ${V_F} هي الوتر؛ لذلك نستخدم نظرية فيثاغورث لحساب شدتها.</p>
      <div class="simulation-equation">${perpendicularFormula}</div>
      <p class="simulation-equation-note">القيمة في بطاقة المحاكاة ناتجة عن المدخلين الحاليين. تبقى كتلة الحساب المطبوعة في «محتوى الكتاب» مستقلة كما هي.</p>
    </section>
  </section>`;
}

function concurrentExperimentMarkup() {
  return `<section class="simulation-experience simulation-concurrent-experiment" data-simulation="spring-concurrency" aria-labelledby="sim-c-heading">
    <header class="simulation-header">
      <span class="simulation-platform-label">محاكاة تفاعلية من المنصة</span>
      <h3 id="sim-c-heading">تجربة القوى المتلاقية: حرّك نقطة التأثير</h3>
      <p>حرّك نقطة تأثير الجسم. تتغير اتجاهات الشدّ المرسومة، وتبقى حواملها مع حامل قوة الثقل ملتقية عند نقطة واحدة.</p>
      <p class="simulation-default-note">أطوال الأسهم رمزية لبيان الاتجاه فقط؛ لا تمثل شدّة القوى أو مقياساً للأطوال.</p>
    </header>
    <aside class="reference-treatment simulation-source-reference" aria-label="مرجع مصدر الصفحة 56">
      <span class="reference-mark">مرجع المصدر</span>
      <span>الرسم تخطيطي لخطوط القوى فقط؛ لا يعيد بناء اللوح أو ترتيب الأدوات الملتبس في صورة الصفحة.</span>
    </aside>
    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="تحريك نقطة التأثير في محاكاة القوى المتلاقية">
        <div class="simulation-control">
          <div class="simulation-control-heading">
            <label for="sim-c-horizontal">موضع نقطة التأثير <bdi dir="ltr">O</bdi> أفقياً</label>
            <output class="simulation-control-value" id="sim-c-horizontal-value" for="sim-c-horizontal"><bdi dir="ltr">50%</bdi></output>
          </div>
          <input class="simulation-range" id="sim-c-horizontal" data-input="horizontal" type="range" min="0" max="100" step="1" value="50"
            aria-label="تحريك نقطة التأثير أفقياً" aria-valuetext="50 بالمئة" aria-describedby="sim-c-horizontal-help" />
          <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">0%</bdi><bdi dir="ltr">100%</bdi></div>
          <p class="simulation-control-help" id="sim-c-horizontal-help">زيادة القيمة تحرّك النقطة إلى يمين الرسم.</p>
        </div>
        <div class="simulation-control">
          <div class="simulation-control-heading">
            <label for="sim-c-vertical">موضع نقطة التأثير <bdi dir="ltr">O</bdi> رأسياً</label>
            <output class="simulation-control-value" id="sim-c-vertical-value" for="sim-c-vertical"><bdi dir="ltr">50%</bdi></output>
          </div>
          <input class="simulation-range" id="sim-c-vertical" data-input="vertical" type="range" min="0" max="100" step="1" value="50"
            aria-label="تحريك نقطة التأثير رأسياً" aria-valuetext="50 بالمئة" aria-describedby="sim-c-vertical-help" />
          <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">0%</bdi><bdi dir="ltr">100%</bdi></div>
          <p class="simulation-control-help" id="sim-c-vertical-help">زيادة القيمة تحرّك النقطة إلى أسفل الرسم.</p>
        </div>
        <div class="simulation-result-grid">
          <div class="simulation-result-cell">
            <span id="sim-c-common-point-label">موضع تلاقي الحوامل</span>
            <output id="sim-c-common-point" class="simulation-result-value" aria-labelledby="sim-c-common-point-label"><bdi dir="ltr">O</bdi></output>
          </div>
          <div class="simulation-result-cell">
            <span id="sim-c-carrier-count-label">الخطوط الممثلة للقوى</span>
            <output id="sim-c-carrier-count" class="simulation-result-value" aria-labelledby="sim-c-carrier-count-label"><bdi dir="ltr">3</bdi> حوامل</output>
          </div>
        </div>
        <p class="simulation-status" id="sim-c-status" role="status" aria-live="polite" aria-atomic="true">حوامل قوتي الشدّ وقوة الثقل تلتقي عند النقطة <bdi dir="ltr">O</bdi>.</p>
      </section>
      <figure class="simulation-visual">
        <div class="simulation-svg-wrap">
          <svg id="sim-c-svg" viewBox="0 0 680 390" role="img" aria-labelledby="sim-c-svg-title sim-c-svg-desc">
            <title id="sim-c-svg-title">تلاقي حوامل قوتي الشد والثقل عند O</title>
            <desc id="sim-c-svg-desc" data-role="diagram-description">ثلاثة حوامل قوى تمر بنقطة التأثير O: حاملا قوتي الشد المائلان والحامل الرأسي لقوة الثقل.</desc>
            ${markerDefs('sim-c')}
            <line class="simulation-concurrency-carrier carrier-f1" id="sim-c-carrier-f1" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-concurrency-carrier carrier-f2" id="sim-c-carrier-f2" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-concurrency-carrier carrier-weight" id="sim-c-carrier-weight" x1="340" y1="18" x2="340" y2="372" />
            <line class="simulation-vector sim-vector-f1" id="sim-c-vector-f1" marker-end="url(#sim-c-f1-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-f2" id="sim-c-vector-f2" marker-end="url(#sim-c-f2-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <line class="simulation-vector sim-vector-weight" id="sim-c-vector-weight" marker-end="url(#sim-c-result-arrow)" x1="0" y1="0" x2="0" y2="0" />
            <circle class="simulation-guide-point" id="sim-c-guide-f1" r="5" cx="140" cy="62" />
            <circle class="simulation-guide-point" id="sim-c-guide-f2" r="5" cx="540" cy="62" />
            <circle class="simulation-common-point-ring" id="sim-c-point-ring" r="11" cx="340" cy="205" />
            <circle class="simulation-point simulation-common-point" id="sim-c-point-o" r="5" cx="340" cy="205" />
            <text class="simulation-point-label" id="sim-c-label-o" x="349" y="195" direction="ltr">O</text>
            <text class="simulation-force-label" id="sim-c-label-f1" direction="ltr">F₁</text>
            <text class="simulation-force-label" id="sim-c-label-f2" direction="ltr">F₂</text>
            <text class="simulation-force-label" id="sim-c-label-weight" direction="ltr">w</text>
          </svg>
        </div>
        <ul class="simulation-legend" aria-label="مفتاح رموز المحاكاة">
          <li><span class="simulation-key f1" aria-hidden="true"></span>${V_F1}</li>
          <li><span class="simulation-key f2" aria-hidden="true"></span>${V_F2}</li>
          <li><span class="simulation-key weight" aria-hidden="true"></span>${V_W}</li>
          <li><span class="simulation-key construction" aria-hidden="true"></span>حوامل القوى (امتداد الخطوط)</li>
        </ul>
        <figcaption>النقطتان العلويتان مرجعان هندسيان لاتجاهي الشد فقط، وليستا إعادة بناء لأداة الصفحة.</figcaption>
      </figure>
    </div>
    <section class="simulation-explanation" aria-labelledby="sim-c-explanation-heading">
      <h4 id="sim-c-explanation-heading">شرح المنصة</h4>
      <p>السهم يبيّن اتجاه القوة، والخط المتقطع الممتد على جهتيه هو حاملها. حرّك <bdi dir="ltr">O</bdi> ولاحظ أن حاملي قوتي الشدّ والحامل الرأسي للوزن تمر جميعها بنقطة التأثير نفسها؛ وهذا معنى <strong>القوى المتلاقية</strong>.</p>
      <p class="simulation-equation-note">هذا نموذج هندسي للحاملات فقط؛ لا يحسب شدّ النوابض ولا يختبر اتزان الجسم، ولا يحاكي اللوح أو ترتيب الأدوات غير المحسوم في صورة المصدر.</p>
    </section>
  </section>`;
}

function forceResolutionMarkup() {
  const initial = resolveForceIntoPerpendicularComponents(8, 35);
  return `<section class="simulation-experience simulation-force-resolution" data-simulation="force-resolution" aria-labelledby="sim-d-heading">
    <header class="simulation-header">
      <span class="simulation-platform-label">محاكاة تفاعلية من المنصة</span>
      <h3 id="sim-d-heading">حلّل القوة على محورين متعامدين</h3>
      <p>غيّر مقدار القوة الأصلية وزاويتها مع محور ${V_OX}. تتغير مساقطها على المحورين ${V_OX} و${V_OY}، ويبقى قطر المستطيل هو القوة الأصلية.</p>
      <p class="simulation-default-note">قيم البداية للاستكشاف فقط؛ لا تمثل قيماً أو اتجاهات من شكل النشاط في الكتاب.</p>
    </header>
    <div class="simulation-workbench">
      <section class="simulation-controls" aria-label="مدخلات تحليل القوة إلى مركبتين">
        ${controlMarkup({ id: 'sim-d-force', symbol: V_OM, label: 'مقدار القوة الأصلية', min: 0, max: 10, step: 0.5, value: 8, unit: 'N', ariaLabel: 'مقدار القوة الأصلية بوحدة النيوتن', describedBy: 'sim-d-force-help' })}
        <div class="simulation-control">
          <div class="simulation-control-heading">
            <label for="sim-d-angle">زاوية القوة مع محور ${V_OX}</label>
            <output class="simulation-control-value" id="sim-d-angle-value" for="sim-d-angle"><bdi dir="ltr">35°</bdi></output>
          </div>
          <input class="simulation-range" id="sim-d-angle" data-input="angle" type="range" min="0" max="90" step="1" value="35"
            aria-label="زاوية القوة من محور OX بالدرجات" aria-valuetext="35 درجة" aria-describedby="sim-d-angle-help" />
          <div class="range-endpoints" aria-hidden="true"><bdi dir="ltr">0°</bdi><bdi dir="ltr">90°</bdi></div>
          <p class="simulation-control-help" id="sim-d-angle-help">تُقاس من الاتجاه الموجب لمحور ${V_OX} نحو محور ${V_OY}.</p>
        </div>
        <div class="simulation-sweep-row">
          <button class="simulation-sweep" type="button" data-sweep="sim-d-angle" aria-describedby="sim-d-sweep-hint">
            <span aria-hidden="true">▶</span> شاهد المركبتين تتغيران
          </button>
          <p class="simulation-sweep-hint" id="sim-d-sweep-hint">تدور القوة من محور <bdi dir="ltr">OX</bdi> إلى محور <bdi dir="ltr">OY</bdi>؛ لاحظ كيف تنتقل الشدة من مركبة إلى الأخرى.</p>
        </div>
        <p class="simulation-control-help" id="sim-d-force-help">طول السهم يتناسب مع مقدار القوة في هذا النموذج التخطيطي.</p>
        <div class="simulation-result-grid">
          <div class="simulation-result-cell">
            <span id="sim-d-x-label">المركبة على محور ${V_OX}</span>
            <output id="sim-d-x-value" class="simulation-result-value" aria-labelledby="sim-d-x-label"><bdi dir="ltr">${formatNumber(initial.componentX)} N</bdi></output>
          </div>
          <div class="simulation-result-cell">
            <span id="sim-d-y-label">المركبة على محور ${V_OY}</span>
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
            <circle class="simulation-point" id="sim-d-point-y" r="4" cx="160" cy="0" />
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
          <li><span class="simulation-key f1" aria-hidden="true"></span>${V_OX} المركبة الأولى</li>
          <li><span class="simulation-key f2" aria-hidden="true"></span>${V_OY} المركبة الثانية</li>
          <li><span class="simulation-key construction" aria-hidden="true"></span>إسقاطان متعامدان</li>
        </ul>
        <figcaption>من M، يلتقي كل خط إنشاء بمحوره عمودياً؛ يوضح المستطيل جمع المركبتين.</figcaption>
      </figure>
    </div>
    <section class="simulation-explanation" aria-labelledby="sim-d-explanation-heading">
      <h4 id="sim-d-explanation-heading">شرح المنصة</h4>
      <p>المركبتان هما مسقطا القوة الأصلية على المحورين المتعامدين. يبيّن الشكل أن مركبة ${V_OX} ومركبة ${V_OY} ضلعان متعامدان، وأن القوة الأصلية ${V_OM} هي القطر الناتج عن جمعهما متجهياً.</p>
      <div class="simulation-equation">${forceResolutionIdentity}</div>
    </section>
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
  line.setAttribute('x1', String(start.x));
  line.setAttribute('y1', String(start.y));
  line.setAttribute('x2', String(end.x));
  line.setAttribute('y2', String(end.y));
  line.setAttribute('visibility', visible ? 'visible' : 'hidden');
}

function setPoint(point, position, visible = true) {
  point.setAttribute('cx', String(position.x));
  point.setAttribute('cy', String(position.y));
  point.setAttribute('visibility', visible ? 'visible' : 'hidden');
}

function setLabel(label, position, visible = true) {
  label.setAttribute('x', String(position.x + 9));
  label.setAttribute('y', String(position.y - 10));
  label.setAttribute('visibility', visible ? 'visible' : 'hidden');
}

function syncRange(input, output, unit, ariaText) {
  const value = Number(input.value);
  output.innerHTML = `<bdi dir="ltr">${formatNumber(value, input.step.includes('.') ? 1 : 0)} ${unit}</bdi>`;
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
  root.querySelector('#sim-a-angle-value').innerHTML = `<bdi dir="ltr">${angle}°</bdi>`;
  angleInput.setAttribute('aria-valuetext', `${angle} درجة`);

  const result = resultantOfConcurrentForces(f1, f2, angle);
  const geometry = concurrentDiagramGeometry(result);
  const { origin, F1Tip, F2Tip, resultantTip } = geometry;
  setLine(root.querySelector('#sim-a-vector-f1'), origin, F1Tip, f1 > 0);
  setLine(root.querySelector('#sim-a-vector-f2'), origin, F2Tip, f2 > 0);
  setLine(root.querySelector('#sim-a-vector-result'), origin, resultantTip, result.magnitude > 1e-10);
  setLine(root.querySelector('#sim-a-edge-f1'), F1Tip, resultantTip, f2 > 0);
  setLine(root.querySelector('#sim-a-edge-f2'), F2Tip, resultantTip, f1 > 0);
  setPoint(root.querySelector('#sim-a-point-o'), origin);
  setPoint(root.querySelector('#sim-a-point-m'), resultantTip, result.magnitude > 1e-10);
  setLabel(root.querySelector('#sim-a-label-m'), resultantTip, result.magnitude > 1e-10);

  const radius = 34;
  const angleArc = root.querySelector('#sim-a-angle-arc');
  if (angle > 0 && f1 > 0 && f2 > 0) {
    const end = { x: origin.x + radius * Math.cos(angle * Math.PI / 180), y: origin.y - radius * Math.sin(angle * Math.PI / 180) };
    angleArc.setAttribute('d', `M ${origin.x + radius} ${origin.y} A ${radius} ${radius} 0 0 0 ${end.x} ${end.y}`);
    angleArc.setAttribute('visibility', 'visible');
  } else {
    angleArc.setAttribute('visibility', 'hidden');
  }

  const direction = formatNumber(result.directionDegrees, 1);
  const magnitude = formatNumber(result.magnitude, 2);
  root.querySelector('#sim-a-result').innerHTML = `<bdi dir="ltr">${magnitude} N</bdi>`;
  root.querySelector('#sim-a-direction').innerHTML = directionOutput(result.directionDegrees);
  root.querySelector('#sim-a-status').innerHTML = result.directionDegrees === null
    ? 'نتيجة المحاكاة: <bdi dir="ltr">F = 0 N</bdi>؛ اتجاه المحصلة غير محدد عندما تكون المحصلة صفراً.'
    : `نتيجة المحاكاة: <bdi dir="ltr">F = ${magnitude} N</bdi>؛ اتجاهها <bdi dir="ltr">${direction}°</bdi> بالنسبة إلى ${V_F1}.`;
  root.querySelector('[data-role="diagram-description"]').textContent = result.directionDegrees === null
    ? (f1 === 0 && f2 === 0
      ? 'القوتان تساويان صفراً؛ المحصلة تساوي صفراً عند نقطة التأثير O.'
      : 'قوتان متعاكستان متساويتان؛ المحصلة تساوي صفراً عند نقطة التأثير O.')
    : `قوتان تبدآن عند O بزاوية ${angle} درجة؛ متوازي الأضلاع وقطره OM يوضحان محصلة مقدارها ${magnitude} نيوتن واتجاهها ${direction} درجة من اتجاه F1.`;
}

function updatePerpendicularSimulation(root) {
  const f1Input = root.querySelector('[data-input="f1"]');
  const f2Input = root.querySelector('[data-input="f2"]');
  const f1 = syncRange(f1Input, root.querySelector('#sim-b-f1-value'), 'N', (value) => `${value} نيوتن`);
  const f2 = syncRange(f2Input, root.querySelector('#sim-b-f2-value'), 'N', (value) => `${value} نيوتن`);
  const result = resultantOfPerpendicularForces(f1, f2);
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
  triangle.setAttribute('points', `${origin.x},${origin.y} ${F1Tip.x},${F1Tip.y} ${resultantTip.x},${resultantTip.y}`);
  const squareSize = 14;
  root.querySelector('#sim-b-right-angle-o').setAttribute('d', `M ${origin.x} ${origin.y - squareSize} L ${origin.x + squareSize} ${origin.y - squareSize} L ${origin.x + squareSize} ${origin.y}`);
  root.querySelector('#sim-b-right-angle-triangle').setAttribute('d', `M ${F1Tip.x - squareSize} ${F1Tip.y} L ${F1Tip.x - squareSize} ${F1Tip.y - squareSize} L ${F1Tip.x} ${F1Tip.y - squareSize}`);

  const magnitude = formatNumber(result.magnitude, 2);
  const direction = formatNumber(result.directionDegrees, 1);
  root.querySelector('#sim-b-result').innerHTML = `<bdi dir="ltr">${magnitude} N</bdi>`;
  root.querySelector('#sim-b-direction').innerHTML = directionOutput(result.directionDegrees);
  root.querySelector('#sim-b-status').innerHTML = result.directionDegrees === null
    ? 'نتيجة المحاكاة: <bdi dir="ltr">F = 0 N</bdi>؛ اتجاه المحصلة غير محدد عندما تكون المحصلة صفراً.'
    : `نتيجة المحاكاة: <bdi dir="ltr">F = ${magnitude} N</bdi>؛ اتجاهها <bdi dir="ltr">${direction}°</bdi> بالنسبة إلى ${V_F1}.`;
  root.querySelector('[data-role="diagram-description"]').textContent = `قوتان متعامدتان عند O؛ المحصلة تمثل قطراً ومقدارها ${magnitude} نيوتن، ومثلثها قائم.`;
}

function updateConcurrentExperimentSimulation(root) {
  const horizontalInput = root.querySelector('[data-input="horizontal"]');
  const verticalInput = root.querySelector('[data-input="vertical"]');
  const syncPosition = (input, output) => {
    const value = Number(input.value);
    output.innerHTML = `<bdi dir="ltr">${formatNumber(value, 0)}%</bdi>`;
    input.setAttribute('aria-valuetext', `${formatNumber(value, 0)} بالمئة`);
    return value;
  };
  const horizontal = syncPosition(horizontalInput, root.querySelector('#sim-c-horizontal-value'));
  const vertical = syncPosition(verticalInput, root.querySelector('#sim-c-vertical-value'));
  const geometry = concurrentExperimentGeometry(horizontal, vertical);

  for (const [name, carrier] of Object.entries(geometry.carriers)) {
    const id = name === 'W' ? 'weight' : name.toLowerCase();
    setLine(root.querySelector(`#sim-c-carrier-${id}`), carrier.start, carrier.end);
  }
  for (const [name, tip] of Object.entries(geometry.arrowTips)) {
    const id = name === 'W' ? 'weight' : name.toLowerCase();
    setLine(root.querySelector(`#sim-c-vector-${id}`), geometry.origin, tip);
    setLabel(root.querySelector(`#sim-c-label-${id}`), tip);
  }
  setPoint(root.querySelector('#sim-c-guide-f1'), geometry.guidePoints.F1);
  setPoint(root.querySelector('#sim-c-guide-f2'), geometry.guidePoints.F2);
  setPoint(root.querySelector('#sim-c-point-ring'), geometry.origin);
  setPoint(root.querySelector('#sim-c-point-o'), geometry.origin);
  setLabel(root.querySelector('#sim-c-label-o'), geometry.origin);

  root.querySelector('#sim-c-status').innerHTML = `الموضع الأفقي <bdi dir="ltr">${formatNumber(horizontal, 0)}%</bdi> والرأسي <bdi dir="ltr">${formatNumber(vertical, 0)}%</bdi>؛ تلتقي حوامل قوتي الشد وقوة الثقل عند النقطة <bdi dir="ltr">O</bdi>.`;
  root.querySelector('[data-role="diagram-description"]').textContent = `حوامل قوتي الشد المائلتين والحامل الرأسي لقوة الثقل تلتقي عند O؛ موضع O الأفقي ${formatNumber(horizontal, 0)} بالمئة والرأسي ${formatNumber(vertical, 0)} بالمئة من مجال الحركة.`;
}

function updateForceResolutionSimulation(root) {
  const forceInput = root.querySelector('[data-input="force"]');
  const angleInput = root.querySelector('[data-input="angle"]');
  const force = syncRange(forceInput, root.querySelector('#sim-d-force-value'), 'N', (value) => `${formatNumber(value, 1)} نيوتن`);
  const angle = Number(angleInput.value);
  root.querySelector('#sim-d-angle-value').innerHTML = `<bdi dir="ltr">${formatNumber(angle, 0)}°</bdi>`;
  angleInput.setAttribute('aria-valuetext', `${formatNumber(angle, 0)} درجة`);

  const components = resolveForceIntoPerpendicularComponents(force, angle);
  const geometry = forceResolutionDiagramGeometry(components);
  const hasX = components.componentX > 1e-10;
  const hasY = components.componentY > 1e-10;
  const hasForce = force > 1e-10;
  const rectangle = root.querySelector('#sim-d-rectangle');
  rectangle.setAttribute('points', `${geometry.origin.x},${geometry.origin.y} ${geometry.XTip.x},${geometry.XTip.y} ${geometry.resultantTip.x},${geometry.resultantTip.y} ${geometry.YTip.x},${geometry.YTip.y}`);
  rectangle.setAttribute('visibility', hasX && hasY ? 'visible' : 'hidden');
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
  root.querySelector('[data-role="diagram-description"]').textContent = `قوة أصلية مقدارها ${formatNumber(force, 1)} نيوتن عند زاوية ${formatNumber(angle, 0)} درجة من OX؛ مركبتها الأفقية ${componentX} نيوتن والعمودية ${componentY} نيوتن. القطر من O إلى M يساوي مجموع متجهي المركبتين على OX وOY.`;
}

/* Animation-first exploration: sweeping a range input through its meaningful
   domain so the student *sees* the relationship, not just a static picture. */
function runSweep(root, button) {
  const input = root.querySelector(`#${button.dataset.sweep}`);
  if (!input || button.disabled) return;
  const isConcurrentAngle = button.dataset.sweep === 'sim-a-angle';
  const start = Number(input.value);
  const waypoints = isConcurrentAngle ? [10, 170, 10, start] : [5, 85, 5, start];
  const segmentMillis = isConcurrentAngle ? [900, 3400, 3400, 900] : [900, 3000, 3000, 900];
  const reduced = typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  button.disabled = true;
  const dispatch = () => input.dispatchEvent(new Event('input', { bubbles: true }));

  const finish = () => { button.disabled = false; };

  if (reduced) {
    // No smooth motion: step through the extremes so the relationship is still visible.
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
    update();
  }
}

export { concurrentMarkup, perpendicularMarkup };
