import { DIAGRAMS } from './diagrams.js';
import {
  formula,
  V_F1,
  V_F2,
  V_F,
  V_F_PRIME,
  V_W,
  V_R,
  V_OM,
  V_OX,
  V_OY,
  S_F1,
  S_F2,
  S_F,
  S_F_PRIME,
  SEG_OM,
  LATIN_A,
} from './math.js';
import { simulationMarkup } from './simulations.js';
import { renderPracticeDeck, renderProblemWorkbench } from './lesson-1-practice.js';
import { TEXTBOOK_PROBLEMS } from './lesson-1-practice-data.js';

const UNIT_TITLE = 'الوحدة الأولى: الحركة والقوى';
const LESSON_TITLE = 'الدرس الأول: القوى المتلاقية';

const curriculumBadge = (label = 'محتوى الكتاب المدرسي') =>
  `<span class="curriculum-tag curriculum-tag-book">${label}</span>`;
const enrichmentBadge = (label = 'إثراء وتوضيح من المنصة') =>
  `<span class="curriculum-tag curriculum-tag-enrich">${label}</span>`;

const diagramFigure = (key, caption, badgeHtml = '') => {
  const entry = DIAGRAMS[key];
  const legendHtml = entry.legend?.length
    ? `<ul class="diagram-legend" aria-label="مفتاح الرموز">
        ${entry.legend.map((item) => `<li><span class="legend-dot legend-${item.color}" aria-hidden="true"></span>${item.symbol}</li>`).join('')}
      </ul>`
    : '';
  return `
  <figure class="diagram-card">
    <div class="diagram-card-head">
      <strong>${entry.title}</strong>
      ${badgeHtml ? `<div class="diagram-card-badge">${badgeHtml}</div>` : ''}
    </div>
    <div class="diagram-svg-wrap">${entry.svg}</div>
    ${legendHtml}
    <figcaption>${caption}</figcaption>
  </figure>`;
};

const pythagoreanFormula = formula(
  'F=\\sqrt{F_{1}^{2}+F_{2}^{2}}',
  'F = square root of F one squared plus F two squared',
);
const p59Substitution = formula(
  'F=\\sqrt{(60)^{2}+(80)^{2}}=\\sqrt{3600+6400}=\\sqrt{10000}=100\\,\\mathrm{N}',
  'F equals square root of 60 squared plus 80 squared equals 100 newtons',
);
const inversePythagoras = formula(
  'F_{1}=\\sqrt{F^{2}-F_{2}^{2}}\\quad,\\quad F_{2}=\\sqrt{F^{2}-F_{1}^{2}}',
  'F1 equals square root of F squared minus F2 squared, and F2 equals square root of F squared minus F1 squared',
);
const vectorSumIdentity = formula(
  '\\vec{\\mathrm{OM}}=\\vec{\\mathrm{OX}}+\\vec{\\mathrm{OY}}',
  'vector OM equals vector OX plus vector OY',
);

const choiceOption = (code, labelHtml, dir = 'rtl') => `
  <div class="option-card" data-option="${code}">
    <span class="option-code" dir="ltr">${code})</span>
    <span dir="${dir}">${labelHtml}</span>
  </div>`;

export const LESSON_PAGES = [
  /* =========================================================================
   * المرحلة 1 — ص 55: المدخل الحياتي + القوة ككمية شعاعية + المظلّي
   * ========================================================================= */
  {
    page: 55,
    unitTitle: UNIT_TITLE,
    title: LESSON_TITLE,
    stageTitle: 'التمهيد وتمثيل شعاع القوة',
    summary: 'من مشهد المظلّي وسحب الأجسام في حياتنا اليومية ننطلق لفهم القوة ككمية متجهة (شعاعية) بعناصرها الأربعة ومقياس رسمها قبل دراسة تلاقي القوى.',
    objectives: [
      'يوضّح لماذا تُعدّ القوة كمية متجهة لا يكفي رقم واحد لوصفها.',
      'يسمّي العناصر الأربعة لشعاع القوة ويقرأ الشدة والجهة من رسم مقياسي.',
      'يحلّل القوى المؤثرة في المظلّي ويستنتج معنى تلاقي حواملها.',
    ],
    blocks: [
      `<section class="content-card hook-card">
        <div class="card-badges">${enrichmentBadge('مدخل واقعي مشوّق')} ${curriculumBadge('تمهيد الدرس · ص 55')}</div>
        <h2>لماذا لا يكفي أن نسأل «كم نيوتن؟» عندما تؤثر عدة قوى في جسم واحد؟</h2>
        <p>تخيّل ولدين يسحبان صندوقاً ثقيلاً بحبلين مربوطين في حلقة واحدة: إذا وقفا متجاورين وسحبا إلى الأمام تحرّك الصندوق بسهولة، أمّا إذا تباعدا وسحب كلٌّ منهما بزاوية واسعة فشعرا بتعب أكبر مع أن قوّة شدّ كل حبل لم تتغير! وتأمّل أيضاً <strong>المظلّي الهابط بمظلته</strong>: عشرات الحبال المائلة تشدّ حزام تعليقه إلى الأعلى من زوايا مختلفة، في حين تجذبه الأرض شاقولياً إلى الأسفل، ومع ذلك يهبط باتزان وأمان.</p>
        <p>سرّ هذين المشهدين يكمن في حقيقة فيزيائية جوهرية: <strong>أثر القوى لا يتوقف على مقاديرها وحدها، بل على خطوط تأثيرها وجهاتها وكيفية تلاقيها في الجسم</strong>.</p>
      </section>`,

      `<section class="goals-panel">
        <div class="card-badges">${curriculumBadge('أهداف التعلّم والكلمات المفتاحية · ص 55')}</div>
        <h2>أهداف الدرس</h2>
        <p class="goals-lead">يتوقّع من المتعلّم في نهاية هذا الدرس أن يكون قادراً على أن:</p>
        <ul class="goals-list">
          <li>يتعرّف مفهوم القوى المتلاقية ويميزها هندسياً وفيزيائياً.</li>
          <li>يستنتج عناصر محصّلة قوّتين متلاقيتين باعتماد قاعدة متوازي الأضلاع.</li>
          <li>يحسب شدّة محصّلة قوّتين متلاقيتين متعامدتين بيانياً وبنظرية فيثاغورث.</li>
          <li>يحلّل قوّةً إلى مركّبتين متعامدتين ويفسّر أثر الثقل على مستوى مائل أملس.</li>
        </ul>
        <div class="keyword-row" aria-label="الكلمات المفتاحية">
          <span class="keyword-label">الكلمات المفتاحية:</span>
          <span class="keyword-chip">القوى المتلاقية</span>
          <span class="keyword-chip">تحليل القوة</span>
          <span class="keyword-chip">حامل القوة</span>
          <span class="keyword-chip">المحصلة ${V_F}</span>
          <span class="keyword-chip">مقياس الرسم</span>
        </div>
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${enrichmentBadge('تأسيس مفهومي ضروري لطالب الصف الثامن')}</div>
        <h2>تأسيس: القوة كمية متجهة (شعاعية) وعناصرها الأربعة</h2>
        <p>لو قال لك زميلك: «أثّرتُ في الباب بقوة شدتها <bdi dir="ltr">15 N</bdi>» وسكت، فهل تستطيع معرفة إن كان الباب سيُفتح أم سيُغلق أم لن يدور أصلاً؟ بالتأكيد لا؛ لأنك لا تعرف <strong>أين</strong> وضع يده، ولا <strong>على أي خط</strong> دفع، ولا <strong>بأي اتجاه</strong> دفع. لذلك نسمّي القوة <strong>مقداراً شعاعياً (كمية متجهة)</strong> لا يتعيّن تماماً إلا بذكر <strong>أربعة عناصر مجتمعة</strong>:</p>
        <div class="four-elements-grid">
          <article class="element-tile">
            <span class="element-num">١</span>
            <h3>نقطة التأثير</h3>
            <p>النقطة من الجسم التي تطبَّق فيها القوة فعلياً (مثل عقدة ربط الخيط <bdi dir="ltr">O</bdi> أو مركز ثقل الجسم)، وتمثّل <strong>مبدأ السهم</strong>.</p>
          </article>
          <article class="element-tile">
            <span class="element-num">٢</span>
            <h3>الحامل (خط التأثير)</h3>
            <p>المستقيم الهندسي غير المحدود الذي تعمل القوة على استقامته (أفقي، شاقولي، أو مائل بزاوية)، ويمثّل <strong>المستقيم الحامل للسهم</strong>.</p>
          </article>
          <article class="element-tile">
            <span class="element-num">٣</span>
            <h3>الجهة</h3>
            <p>المنحى الذي تدفع أو تشدّ إليه القوة على حاملها (يميناً أم يساراً، أعلى أم أسفل)، ويمثّلها <strong>رأس السهم</strong>؛ فلكل حامل واحد جهتان متعاكستان.</p>
          </article>
          <article class="element-tile">
            <span class="element-num">٤</span>
            <h3>الشدة (المقدار)</h3>
            <p>قيمة القوة مقيسةً بالربيعة (الدينامومتر) ومقدّرةً في الجملة الدولية بواحدة <strong>النيوتن (<bdi dir="ltr">N</bdi>)</strong>، ويمثّلها <strong>طول السهم وفق مقياس رسم مختار</strong>.</p>
          </article>
        </div>
        ${diagramFigure('force-vector-anatomy', 'تشريح شعاع القوة: كل عنصر من العناصر الأربعة يظهر بوضوح على السهم المرسوم بمقياس رسم.', enrichmentBadge('مخطط تعليمي من المنصة'))}
        <div class="callout-box callout-tip">
          <h3>كيف نقرأ مقياس الرسم ونحوّل بين السنتيمتر والنيوتن؟</h3>
          <p>لا يمكن رسم نيوتنات على الورقة مباشرةً، فنختار <strong>مقياس رسم مناسب</strong> مثل: <bdi dir="ltr">1 cm : 5 N</bdi> (كل سنتيمتر واحد على الورقة يمثّل <bdi dir="ltr">5 N</bdi>). عندئذٍ:</p>
          <ul class="lesson-list">
            <li><strong>للرسم (من <bdi dir="ltr">N</bdi> إلى <bdi dir="ltr">cm</bdi>):</strong> نقسم الشدة على قيمة السنتيمتر الواحد؛ فالقوة <bdi dir="ltr">20 N</bdi> نرسمها بسهم طوله <bdi dir="ltr">20 ÷ 5 = 4 cm</bdi>.</li>
            <li><strong>للقراءة من الرسم (من <bdi dir="ltr">cm</bdi> إلى <bdi dir="ltr">N</bdi>):</strong> نقيس طول السهم بالمسطرة ثم نضربه في قيمة السنتيمتر الواحد؛ فسهم طوله <bdi dir="ltr">3 cm</bdi> يمثّل شدة <bdi dir="ltr">3 × 5 = 15 N</bdi>.</li>
            <li><strong>تنبيه رمزي مهم:</strong> نكتب رمز الشعاع بسهم فوق الحرف (${V_F}) للدلالة على المتجه بعناصره الأربعة، ونكتب الحرف من دون سهم (<bdi dir="ltr">${S_F} = 15 N</bdi>) للدلالة على <strong>الشدة العددية</strong> فقط.</li>
          </ul>
        </div>
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${curriculumBadge('نشاط الاستكشاف الافتتاحي · ص 55')}</div>
        <h2>استكشاف مشهد المظلّي: قراءة حوامل القوى الثلاث</h2>
        <p>تأمّل المخطط التوضيحي للمظلّي وحبال المظلّة المرتبطة بنقطة التعليق المشتركة <bdi dir="ltr">O</bdi>، ثم أجب عن الأسئلة الثلاثة الآتية لاختبار استنتاجك الأولي:</p>
        ${diagramFigure('parachutist-vectors', 'تمثيل تخطيطي للقوى المؤثرة في جملة المظلّي عند نقطة التقاء حبال التعليق O: قوتا شد الحبال المائلتان للأعلى وقوة الثقل الشاقولية للأسفل.', curriculumBadge('تمثيل مشهد ص 55'))}

        <div class="inquiry-stack">
          <div class="inquiry-card" data-inquiry-card data-correct="b">
            <p class="inquiry-q"><strong>١. ما القوى المؤثرة في المظلّي أثناء هبوطه المستقر بالمظلّة؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-55-1" value="a" data-feedback="قوة الثقل وحدها تجعله يسقط سقوطاً حراً متسارعاً؛ لا بد من احتساب قوى شدّ حبال المظلة (الناشئة عن مقاومة الهواء لقبة المظلة) نحو الأعلى." /> <span>قوة ثقله نحو الأسفل فقط.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-55-1" value="b" data-feedback="صحيح! تؤثر فيه قوة ثقله الشاقولية نحو الأسفل (جذب الأرض)، وقوى شدّ حبال المظلة المائلة نحو الأعلى (التي تنقل مقاومة الهواء لقبة المظلة)." /> <span>قوة ثقله نحو الأسفل، وقوى شدّ حبال المظلّة (ومقاومة الهواء عبرها) نحو الأعلى.</span></label>
            <button type="button" class="l1-btn l1-btn-check" data-inquiry-check>تحقّق وافتح التفسير</button>
            <div class="l1-item-feedback" data-inquiry-feedback role="status" aria-live="polite" hidden></div>
          </div>

          <div class="inquiry-card" data-inquiry-card data-correct="a">
            <p class="inquiry-q"><strong>٢. كيف نحدّد حامل كلّ قوّة من هذه القوى عملياً؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-55-2" value="a" data-feedback="ممتاز! كل خيط مشدود يجسّد مستقيماً مائلاً هو حامل قوة الشد فيه، بينما تعمل جاذبية الأرض دائماً وفق المستقيم الشاقولي المار بمركز الثقل." /> <span>حامل كل قوة شدّ ينطبق على استقامة الخيط المشدود الموافق لها، وحامل قوة الثقل هو المستقيم الشاقولي.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-55-2" value="b" data-feedback="حبال المظلة مائلة نحو قبة المظلة وليست أفقية، كما أن الثقل شاقولي دائماً لا أفقي." /> <span>جميع الحوامل مستقيمات أفقية موازية لسطح الأرض.</span></label>
            <button type="button" class="l1-btn l1-btn-check" data-inquiry-check>تحقّق وافتح التفسير</button>
            <div class="l1-item-feedback" data-inquiry-feedback role="status" aria-live="polite" hidden></div>
          </div>

          <div class="inquiry-card" data-inquiry-card data-correct="b">
            <p class="inquiry-q"><strong>٣. هل تتلاقى حوامل هذه القوى في نقطة واحدة؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-55-3" value="a" data-feedback="انظر إلى امتدادات حاملي الشدّ المائلين والحامل الشاقولي في المخطط: إنها تتقاطع جميعاً في عقدة التعليق المشتركة O." /> <span>لا، لأن القوى مختلفة في الجهة والزاوية.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-55-3" value="b" data-feedback="استنتاج دقيق! رغم اختلاف زوايا الخيوط عن الشاقول، تتقاطع امتدادات حوامل القوى كلها في نقطة التجمع المشتركة O، ولذلك نسمّيها قوى متلاقية." /> <span>نعم، تلتقي امتدادات حوامل قوى الشد وحامل الثقل في نقطة واحدة مشتركة <bdi dir="ltr">O</bdi>.</span></label>
            <button type="button" class="l1-btn l1-btn-check" data-inquiry-check>تحقّق وافتح التفسير</button>
            <div class="l1-item-feedback" data-inquiry-feedback role="status" aria-live="polite" hidden></div>
          </div>
        </div>

        <div class="stage-bridge">
          <strong>الانتقال إلى المرحلة الثانية:</strong> استنتجنا من مشهد المظلّي أن حوامل القوى يمكن أن تلتقي في نقطة واحدة. كيف نتحقق من هذه الظاهرة عملياً داخل المختبر باستخدام لوح الربائع المغناطيسي؟
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 2 — ص 56: تجربة لوح الربائع المغناطيسي وتعريف القوى المتلاقية
   * ========================================================================= */
  {
    page: 56,
    unitTitle: UNIT_TITLE,
    title: 'أولاً: مفهوم القوى المتلاقية وتجربة لوح الربائع',
    stageTitle: 'تجربة تلاقي الحوامل والتعريف',
    summary: 'ننفّذ خطوات تجربة لوح الربائع المغناطيسي، ونقارن بين تعليق الجسم بربيعة واحدة أو بربيعتين مائلتين، ونميّز القوى المتلاقية عن غير المتلاقية.',
    objectives: [
      'يسمّي أدوات تجربة لوح الربائع المغناطيسي ويفسر دور كل خطوة فيها.',
      'يقارن بين حاملي القوتين عند التعليق بربيعة واحدة وحوامل القوى الثلاث عند التعليق بربيعتين.',
      'يصوغ تعريف القوى المتلاقية بدقة ويميزها عن القوى المتوازية غير المتلاقية.',
    ],
    blocks: [
      `<section class="content-card">
        <div class="card-badges">${curriculumBadge('التجربة الاستقصائية · ص 56')}</div>
        <h2>أولاً: القوى المتلاقية — نشاط لوح الربائع المغناطيسي</h2>
        <div class="tools-strip" role="note" aria-label="أدوات التجربة">
          <strong>الأدوات والمواد:</strong> لوح الربائع المغناطيسي – ربائع (دينامومترات نابضية) – جسم مزوّد بخطّاف – خيوط ربط – قلم رصاص لرسم الحوامل على اللوح.
        </div>

        <div class="two-phase-grid">
          <article class="phase-card">
            <h3>المرحلة (أ) — تعليق الجسم بربيعة واحدة (الخطوتان ١–٢)</h3>
            <ol class="experiment-steps">
              <li>نعلّق الجسم المزوّد بخطاف في خطاف ربيعة واحدة حرّة التعليق شاقولياً، فيخضع الجسم لقوتين: <strong>قوة ثقله</strong> ${V_W} نحو الأسفل و<strong>قوة توتر نابض الربيعة</strong> نحو الأعلى.</li>
              <li><strong>الملاحظة والتفسير السببي:</strong> نلاحظ أن حامل قوة الثقل وحامل قوة توتر نابض الربيعة <strong>منطبقان على المستقيم الشاقولي نفسه</strong> وبجهتين متعاكستين وبشدتين متساويتين؛ ولذلك يستقر الجسم متوازناً دون ميلان.</li>
            </ol>
          </article>

          <article class="phase-card">
            <h3>المرحلة (ب) — تعليق الجسم بربيعتين على اللوح (الخطوات ٣–٧)</h3>
            <ol class="experiment-steps" start="3">
              <li>نربط الجسم بخيطين يصلان إلى ربيعتين مثبتتين بزاويتين مختلفتين على <strong>لوح الربائع المغناطيسي</strong>.</li>
              <li>ندرس حاملَي قوتي توتر نابضي الربيعتين ${V_F1} و${V_F2}: نجد أن <strong>ليس لهما الاستقامة ذاتها</strong>، بل يصنع كل خيط زاوية مائلة خاصة به، بينما يبقى حامل الثقل ${V_W} شاقولياً نحو الأسفل.</li>
              <li>نرسم بقلم الرصاص على اللوح خطاً مستقيماً يطابق كل خيط مشدود، وخطاً شاقولياً يمر بنقطة تعليق الجسم <bdi dir="ltr">O</bdi>.</li>
              <li><strong>نرفع الربيعتين والجسم عن اللوح:</strong> نشاهد ثلاثة مستقيمات مرسومة على اللوح تتقاطع جميعاً في <strong>النقطة الواحدة <bdi dir="ltr">O</bdi></strong>!</li>
            </ol>
          </article>
        </div>
      </section>`,

      simulationMarkup('spring-concurrency'),

      `<section class="content-card">
        <div class="card-badges">${curriculumBadge('الاستنتاج والتعريف · ص 56')} ${enrichmentBadge('تمييز مفهومي')}</div>
        <div class="conclusion-box">
          <h3>التعريف العلمي المستنتج</h3>
          <p><strong>القوى المتلاقية:</strong> هي القوى التي تتلاقى حواملها في نقطة واحدة.</p>
        </div>

        <h3>متى تكون القوى متلاقية ومتى لا تكون؟</h3>
        <p>الشرط الحاسم في التعريف هو <strong>تلاقي الحوامل (خطوط التأثير المستقيمة)</strong> في نقطة واحدة مشتركة، سواء التقت الأسهم المرسومة نفسها عند مبدأ واحد أو التقت امتدادات حواملها في نقطة واحدة داخل الجسم أو خارجه. أما إذا كانت الحوامل متوازية منفصلة فلا تلتقي في نقطة واحدة ولا تُسمّى قوى متلاقية.</p>
        ${diagramFigure('concurrent-comparison', 'مقارنة بصرية حاسمة: على اليمين قوى تتلاقى حواملها في نقطة واحدة O (متلاقية)، وعلى اليسار قوى متوازية منفصلة الحوامل (غير متلاقية).', enrichmentBadge('مقارنة توضيحية من المنصة'))}

        <div class="misconception-card">
          <h3>تصحيح تصور خاطئ شائع</h3>
          <p><strong>التصور الخاطئ:</strong> «إذا تغيّر ميل أحد الخيطين على لوح الربائع فلن يمر حامل الثقل بنقطة التلاقي».<br />
          <strong>التصحيح العلمي:</strong> قوة الثقل جذب الأرض للجسم نحو مركزها، فحاملها شاقولي دائماً ويمر بنقطة التعليق الجديدة <bdi dir="ltr">O</bdi> التي يلتقي عندها الخيطان المشدودان، لذا تبقى الحوامل الثلاثة متلاقية في <bdi dir="ltr">O</bdi> عند كل وضع اتزان.</p>
        </div>

        <div class="stage-bridge">
          <strong>الانتقال إلى المرحلة الثالثة:</strong> ما دامت الربيعتان المائلتان معاً نجحتا في حمل الجسم وموازنة ثقله تماماً كما فعلت ربيعة شاقولية واحدة، فكيف نجد <strong>القوة الواحدة المكافئة (المحصلة)</strong> لأي قوتين متلاقيتين؟
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 3 — ص 57: محصلة قوتين متلاقيتين وقاعدة متوازي الأضلاع
   * ========================================================================= */
  {
    page: 57,
    unitTitle: UNIT_TITLE,
    title: 'محصلة قوتين متلاقيتين: قاعدة متوازي الأضلاع',
    stageTitle: 'إنشاء متوازي الأضلاع وعناصر المحصلة',
    summary: 'نكتشف لماذا يمثّل قطر متوازي الأضلاع الخارج من نقطة التلاقي محصلة القوتين المتلاقيتين، ونتدرّب على تحديد عناصر المحصلة الأربعة وشرط التوازن.',
    objectives: [
      'يعلّل فيزيائياً لماذا تساوي محصلة قوتي الشدّ ثقل الجسم بالشدة وتعاكسه بالجهة.',
      'ينشئ هندسياً متوازي الأضلاع لإيجاد محصلة قوتين متلاقيتين بزاوية عامة.',
      'يحدّد العناصر الأربعة للمحصلة ويفرّق بين المحصلة وقوة الموازنة.',
    ],
    blocks: [
      `<section class="content-card">
        <div class="card-badges">${curriculumBadge('أتساءل والاستنتاج · ص 57')}</div>
        <div class="question-banner">
          <span class="question-badge">أتساءل</span>
          <p>هل يمكن استبدال قوّةٍ واحدةٍ بقوّتين متلاقيتين تؤثّران في جسم، بحيث تُحدِث هذه القوة الواحدة الأثر الفيزيائي نفسه الذي تُحدثه القوتان معاً؟</p>
        </div>

        <h2>كيف توصّل العلماء إلى قاعدة متوازي الأضلاع من تجربة التوازن؟</h2>
        <p>لنفكّر خطوةً بخطوة بالربط مع تجربة لوح الربائع في الصفحة السابقة:</p>
        <ol class="experiment-steps">
          <li>الجسم المعلّق ساكن متوازن تحت تأثير ثلاث قوى متلاقية في <bdi dir="ltr">O</bdi>: قوتا الربيعتين ${V_F1} و${V_F2}، وقوة الثقل الشاقولية ${V_W} المتجهة نحو الأسفل.</li>
          <li>لو استبدلنا بالربيعتين قوةً واحدةً مكافئةً لهما نسمّيها <strong>المحصلة ${V_F}</strong>، لوجب أن توازن هذه القوة الواحدة ثقل الجسم ${V_W} تماماً كما فعلت الربيعتان؛ أي أن يكون لـ ${V_F} <strong>الحامل الشاقولي نفسه</strong>، و<strong>الشدة نفسها</strong> (<bdi dir="ltr">${S_F} = w</bdi>)، و<strong>جهة معاكسة للثقل</strong> (نحو الأعلى).</li>
          <li>عندما نرسم على الورقة من النقطة <bdi dir="ltr">O</bdi> الشعاعين ${V_F1} و${V_F2} والشعاع الشاقولي الصاعد ${V_F} وفق <strong>مقياس رسم واحد</strong> (بقراءة الشدات من الربيعتين ومن ثقل الجسم)، ثم نرسم من نهاية ${V_F1} موازياً لـ ${V_F2} ومن نهاية ${V_F2} موازياً لـ ${V_F1} حتى يلتقيا في <bdi dir="ltr">M</bdi>، نكتشف تطابقاً هندسياً باهراً: <strong>ينطبق شعاع المحصلة ${V_F} تماماً على القطر <bdi dir="ltr">OM</bdi> في متوازي الأضلاع!</strong></li>
        </ol>

        <div class="dual-diagram-row">
          ${diagramFigure('equilibrium-parallelogram', 'البرهان الفيزيائي للتجربة: المحصلة F توازن الثقل w شاقولياً للأعلى، وتنطبق في الوقت نفسه على قطر متوازي الأضلاع OM.', enrichmentBadge('توضيح سببي لتجربة ص 57'))}
          ${diagramFigure('parallelogram', 'الإنشاء الهندسي العام: من نهاية كل شعاع نرسم موازياً للآخر بالخطوط المتقطعة، فيكون القطر من O إلى M هو المحصلة F.', curriculumBadge('مخطط الكتاب · ص 57'))}
        </div>

        <div class="conclusion-box">
          <h3>عناصر محصلة قوتين متلاقيتين ${V_F} (قاعدة متوازي الأضلاع)</h3>
          <p>إنّ قطر متوازي الأضلاع <bdi dir="ltr">OM</bdi> المنشأ على شعاعي القوتين يمثل محصلة القوتين ${V_F1} و${V_F2}، وتكون عناصر المحصلة ${V_F} أربعة:</p>
          <ul class="elements-list">
            <li><strong>نقطة التأثير:</strong> نقطة تلاقي القوتين <bdi dir="ltr">O</bdi>.</li>
            <li><strong>الحامل:</strong> المستقيم الحامل لقطر متوازي الأضلاع <bdi dir="ltr">OM</bdi> المار بنقطة التلاقي <bdi dir="ltr">O</bdi>.</li>
            <li><strong>الجهة:</strong> من نقطة تلاقي القوتين <bdi dir="ltr">O</bdi> نحو الرأس المقابل <bdi dir="ltr">M</bdi> وبجهة القوتين (بينهما).</li>
            <li><strong>الشدة:</strong> تُقاس بطول القطر <bdi dir="ltr">OM</bdi> على الرسم مضروباً في مقياس الرسم المختار.</li>
          </ul>
        </div>
      </section>`,

      simulationMarkup('concurrent'),

      `<section class="content-card">
        <div class="card-badges">${enrichmentBadge('تصويب المفاهيم والربط بحالات خاصة')}</div>
        <h2>أخطاء شائعة يجب تجنّبها عند تركيب قوتين متلاقيتين</h2>
        <div class="misconception-grid">
          <article class="misconception-card">
            <h3>١. خطأ الجمع العددي الآلي (<bdi dir="ltr">F = F₁ + F₂</bdi>)</h3>
            <p>لا تساوي شدة المحصلة مجموع الشدتين <bdi dir="ltr">F₁ + F₂</bdi> إلا في حالة واحدة فقط هي الزاوية <bdi dir="ltr">0°</bdi> (حامل واحد وجهة واحدة). أما عند وجود زاوية بينهما فتكون الشدة محصورة دائماً بين الفرق والمجموع: <bdi dir="ltr">|F₁ − F₂| ≤ F ≤ F₁ + F₂</bdi>.</p>
          </article>
          <article class="misconception-card">
            <h3>٢. خطأ اختيار القطر الثاني لمتوازي الأضلاع</h3>
            <p>لمتوازي الأضلاع قطران! القطر الممثّل للمحصلة ${V_F} هو حصراً القطر <strong>الذي يبدأ من نقطة التلاقي المشتركة <bdi dir="ltr">O</bdi></strong> ويتجه إلى الرأس المقابل <bdi dir="ltr">M</bdi>، وليس القطر الواصل بين رأسي السهمين ${V_F1} و${V_F2}.</p>
          </article>
          <article class="misconception-card">
            <h3>٣. الخلط بين المحصلة ${V_F} وقوة الموازنة ${V_F_PRIME}</h3>
            <p><strong>المحصلة ${V_F}</strong> تحلّ محل القوتين وتُحدث أثرهما نفسه (باتجاه <bdi dir="ltr">O → M</bdi>). أمّا <strong>قوة الموازنة ${V_F_PRIME}</strong> فهي قوة ثالثة تُضاف إلى القوتين لإيقاف أثرهما، فتساوي ${V_F} بالشدة والحامل وتعاكسها بالجهة.</p>
          </article>
        </div>

        <div class="stage-bridge">
          <strong>الانتقال إلى المرحلة الرابعة:</strong> لنطبّق الآن قاعدة متوازي الأضلاع عملياً بالأرقام ومقياس الرسم على مثال الكتاب الأول، ثم نستكشف ماذا يحدث للشكل عندما تصبح الزاوية قائمة (<bdi dir="ltr">90°</bdi>).
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 4 — ص 58: المثال المحلول (1) بالرسم المقياسي + مدخل التعامد
   * ========================================================================= */
  {
    page: 58,
    unitTitle: UNIT_TITLE,
    title: 'تطبيق محصلة قوتين بزاوية حادة والانتقال إلى التعامد',
    stageTitle: 'مثال متوازي الأضلاع وتصنيف الرباعيات',
    summary: 'ندرس المثال المحلول الأول خطوةً بخطوة بالرسم المقياسي، ثم نكتشف كيف يتحول متوازي الأضلاع إلى معيّن أو مستطيل أو مربّع عند الحالات الخاصة.',
    objectives: [
      'يحلّ مسألة محصلة قوتين متلاقيتين بزاوية 60° بيانياً باستخدام مقياس الرسم.',
      'يفسّر لماذا يكون القياس بالمسطرة تقريبياً ويتحقق من معقولية الناتج فيزيائياً.',
      'يميّز هندسياً بين متوازي الأضلاع العام والمعيّن والمستطيل والمربّع.',
    ],
    blocks: [
      `<section class="content-card worked-example" data-worked-stepper>
        <div class="worked-header-row">
          <div>
            <div class="card-badges">${curriculumBadge('مثال محلول (١) · ص 58')} ${enrichmentBadge('عرض تفصيلي من ٨ خطوات')}</div>
            <h2>مثال محلول (١): محصلة قوتين متلاقيتين بزاوية <bdi dir="ltr">60°</bdi></h2>
          </div>
          <div class="worked-stepper-controls" role="group" aria-label="التحكم بخطوات الحل">
            <button type="button" class="l1-btn l1-btn-ghost" data-w-reset>اعرض خطوةً بخطوة</button>
            <button type="button" class="l1-btn l1-btn-check" data-w-next disabled>جميع الخطوات معروضة</button>
            <button type="button" class="l1-btn l1-btn-hint" data-w-all>اعرض الحل كاملاً</button>
          </div>
        </div>

        <p class="problem-box"><strong>نص المسألة:</strong> قوتان متلاقيتان في النقطة <bdi dir="ltr">O</bdi>؛ شدّة الأولى <bdi dir="ltr">${S_F1} = 4 N</bdi> وشدّة الثانية <bdi dir="ltr">${S_F2} = 3 N</bdi>، والزاوية بين حامليهما <bdi dir="ltr">60°</bdi>. أوجد عناصر محصلتهما ${V_F} ومثّلها بمقياس رسم مناسب.</p>

        <div class="worked-eight-grid">
          <div class="worked-step-card" data-w-step>
            <h5>١. المطلوب</h5>
            <p>تحديد العناصر الأربعة لمحصلة القوتين ${V_F} (نقطة التأثير، الحامل، الجهة، الشدة) وتمثيلها بيانياً بمقياس رسم مناسب.</p>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٢. المعطيات بالرموز والواحدات</h5>
            <p>نقطة التلاقي <bdi dir="ltr">O</bdi>، شدة الأولى <bdi dir="ltr">${S_F1} = 4 N</bdi>، شدة الثانية <bdi dir="ltr">${S_F2} = 3 N</bdi>، الزاوية المحصورة بين الحاملين <bdi dir="ltr">60°</bdi>.</p>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٣. القاعدة المختارة وسبب اختيارها</h5>
            <p>الزاوية <bdi dir="ltr">60°</bdi> حادة غير قائمة، فلا يصح تطبيق نظرية فيثاغورث هنا؛ نعتمد <strong>قاعدة متوازي الأضلاع بالرسم الهندسي المقياسي</strong>.</p>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٤. اختيار مقياس الرسم وتحويل الأطوال</h5>
            <p>نختار مقياس الرسم البسيط: <strong>كل <bdi dir="ltr">1 cm</bdi> يقابل <bdi dir="ltr">1 N</bdi></strong>، فيكون طول شعاع ${V_F1} على الورقة <bdi dir="ltr">4 cm</bdi>، وطول شعاع ${V_F2} يساوي <bdi dir="ltr">3 cm</bdi> بزاوية <bdi dir="ltr">60°</bdi> عن حامل ${V_F1}.</p>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٥. الإنشاء وقياس القطر وحساب الشدة</h5>
            <p>نكمل متوازي الأضلاع برسم ضلعين متقطعين موازيين لـ ${V_F1} و${V_F2} يلتقيان في <bdi dir="ltr">M</bdi>، ثم نرسم القطر <bdi dir="ltr">OM</bdi> ونقيس طوله بالمسطرة فنجد أن طول القطر تقريباً <bdi dir="ltr">6 cm</bdi>، ومنه:</p>
            <p class="math-line"><bdi dir="ltr">F = 6 × 1 = 6 N</bdi></p>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٦. العناصر الأربعة للمحصلة ${V_F}</h5>
            <ul class="worked-elements-list">
              <li><strong>نقطة التأثير:</strong> النقطة <bdi dir="ltr">O</bdi>.</li>
              <li><strong>الحامل:</strong> المستقيم الحامل لقطر متوازي الأضلاع <bdi dir="ltr">OM</bdi>.</li>
              <li><strong>الجهة:</strong> من <bdi dir="ltr">O</bdi> نحو الرأس المقابل <bdi dir="ltr">M</bdi> بين حاملي القوتين.</li>
              <li><strong>الشدة:</strong> نحو <bdi dir="ltr">${S_F} = 6 N</bdi> تقريباً وفق القياس البياني.</li>
            </ul>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٧. المعنى الفيزيائي والتحقق من معقولية الناتج</h5>
            <p>القيمة <bdi dir="ltr">6 N</bdi> معقولة تماماً لأنها أكبر من الفرق <bdi dir="ltr">4 − 3 = 1 N</bdi> وأصغر من المجموع الأقصى <bdi dir="ltr">4 + 3 = 7 N</bdi>، ولأن الزاوية <bdi dir="ltr">60°</bdi> حادة تتعاون القوتان بدرجة كبيرة فتقترب المحصلة من <bdi dir="ltr">7 N</bdi> وتميل أقرب إلى القوة الكبرى <bdi dir="ltr">4 N</bdi>.</p>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٨. ملاحظة علمية أمينة حول الرسم والقياس</h5>
            <p>الرسم المطبوع في الكتاب المدرسي توضيحي غير محجّم بالسنتيمتر الحقيقي على الصفحة، أمّا المخطط أدناه فمرسوم بنسبة هندسية مضبوطة (<bdi dir="ltr">4 : 3</bdi> وزاوية <bdi dir="ltr">60°</bdi>). ويعطي الحساب المثلثي الإثرائي في المحاكاة <bdi dir="ltr">√37 ≈ 6.08 N</bdi>، وهي مطابقة لقراءة المسطرة المقررة في الكتاب (<bdi dir="ltr">6 N</bdi> تقريباً).</p>
          </div>
        </div>

        ${diagramFigure('oblique-example', 'تمثيل هندسي مضبوط لمثال ص 58: ضلعان بنسبتي 4 cm و3 cm يحصران زاوية 60°، وطول القطر OM يقارب 6 cm أي نحو 6 N.', curriculumBadge('تمثيل مضبوط لمثال ص 58'))}
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${curriculumBadge('محصلة قوتين متعامدتين · ص 58')} ${enrichmentBadge('مقارنة هندسية شاملة')}</div>
        <h2>حالة خاصة مهمة: محصلة قوتين متلاقيتين حاملاهما متعامدان (<bdi dir="ltr">90°</bdi>)</h2>
        <p>تأمّل كيف يتغيّر نوع الشكل الرباعي المنشأ على شعاعي القوتين تبعاً للزاوية بين حامليهما وتبعاً لتساوي الشدتين أو اختلافهما — هذه المقارنة الهندسية تحسم كثيراً من أسئلة الاختيار من متعدد:</p>
        ${diagramFigure('quadrilateral-cases', 'الحالات الأربع لرباعي المحصلة: متوازي أضلاع عام، معيّن (تساوي الشدتين من غير تعامد)، مستطيل (تعامد مع اختلاف الشدتين)، ومربّع (تعامد + تساوي الشدتين).', enrichmentBadge('مقارنة الأشكال الأربعة'))}

        <div class="callout-box callout-book">
          <h3>تمهيد المثال المحلول (٢) في أسفل ص 58</h3>
          <p>إذا تعامد حاملا القوتين المتلاقيتين (<bdi dir="ltr">90°</bdi>) أصبح متوازي الأضلاع <strong>مستطيلاً</strong> (أو <strong>مربّعاً</strong> إذا تساوت الشدتان)، وأصبح القطر <bdi dir="ltr">OM</bdi> <strong>وتراً في مثلث قائم الزاوية</strong> ضلعاه القائمان يمثلان شدتي القوتين ${V_F1} و${V_F2}. لنختبر ذلك في المرحلة التالية على القوتين المتعامدتين <bdi dir="ltr">F₁ = 60 N</bdi> و<bdi dir="ltr">F₂ = 80 N</bdi> بالرسم وبنظرية فيثاغورث معاً!</p>
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 5 — ص 59: المثال المحلول (2) بالمستطيل وفيثاغورث + مدخل التحليل
   * ========================================================================= */
  {
    page: 59,
    unitTitle: UNIT_TITLE,
    title: 'الحل البياني والحسابي بنظرية فيثاغورث (90°)',
    stageTitle: 'فيثاغورث للقوى المتعامدة',
    summary: 'نحلّ مثال القوتين المتعامدتين (60 N و80 N) بطريقتين متطابقتين: الرسم بالمقياس ونظرية فيثاغورث، ونتعرّف كيفية إيجاد قوة مجهولة بمعلومية المحصلة.',
    objectives: [
      'يوجد محصلة قوتين متعامدتين بيانياً باختيار مقياس رسم مناسب (1 cm : 20 N).',
      'يطبق نظرية فيثاغورث لحساب شدة المحصلة بدقة تامة دون تقريب مسطرة.',
      'يستنتج العلاقة العكسية لحساب إحدى القوتين المتعامدتين إذا عُلمت المحصلة والقوة الأخرى.',
    ],
    blocks: [
      `<section class="content-card worked-example" data-worked-stepper>
        <div class="worked-header-row">
          <div>
            <div class="card-badges">${curriculumBadge('مثال محلول (٢) · ص 58–59')} ${enrichmentBadge('مقارنة الرسم بفيثاغورث')}</div>
            <h2>مثال محلول (٢): محصلة قوتين متلاقيتين متعامدتين (<bdi dir="ltr">60 N</bdi> و<bdi dir="ltr">80 N</bdi>)</h2>
          </div>
          <div class="worked-stepper-controls" role="group" aria-label="التحكم بخطوات الحل">
            <button type="button" class="l1-btn l1-btn-ghost" data-w-reset>اعرض خطوةً بخطوة</button>
            <button type="button" class="l1-btn l1-btn-check" data-w-next disabled>جميع الخطوات معروضة</button>
            <button type="button" class="l1-btn l1-btn-hint" data-w-all>اعرض الحل كاملاً</button>
          </div>
        </div>

        <p class="problem-box"><strong>نص المسألة:</strong> قوّتان متلاقيتان حاملاهما متعامدان تؤثّران في النقطة <bdi dir="ltr">O</bdi> من جسم صلب؛ شدّة الأولى <bdi dir="ltr">${S_F1} = 60 N</bdi> وشدّة الثانية <bdi dir="ltr">${S_F2} = 80 N</bdi>. حدّد عناصر محصلتهما ${V_F} بطريقتي الرسم والحساب.</p>

        <div class="worked-eight-grid">
          <div class="worked-step-card" data-w-step>
            <h5>١. المطلوب والمعطيات</h5>
            <p><strong>المطلوب:</strong> حساب شدة المحصلة ${V_F} وتحديد عناصرها الأربعة.<br />
            <strong>المعطيات:</strong> <bdi dir="ltr">${S_F1} = 60 N</bdi>، <bdi dir="ltr">${S_F2} = 80 N</bdi>، الزاوية بين الحاملين <bdi dir="ltr">90°</bdi> في النقطة <bdi dir="ltr">O</bdi>.</p>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٢. الطريقة الأولى — الرسم الهندسي المقياسي</h5>
            <p>بما أن <bdi dir="ltr">60</bdi> و<bdi dir="ltr">80</bdi> من مضاعفات <bdi dir="ltr">20</bdi>، نختار المقياس: <strong>كل <bdi dir="ltr">1 cm</bdi> يقابل <bdi dir="ltr">20 N</bdi></strong>. نرسم ${V_F1} بطول <bdi dir="ltr">60 ÷ 20 = 3 cm</bdi>، وعمودياً عليها ${V_F2} بطول <bdi dir="ltr">80 ÷ 20 = 4 cm</bdi>. نكمل <strong>المستطيل</strong> ونقيس القطر <bdi dir="ltr">OM</bdi> فنجد طوله <bdi dir="ltr">5 cm</bdi>، فتكون الشدة: <bdi dir="ltr">F = 5 × 20 = 100 N</bdi>.</p>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٣. الطريقة الثانية — الحساب بنظرية فيثاغورث (الأدقّ)</h5>
            <p>لأن الزاوية قائمة (<bdi dir="ltr">90°</bdi>) يكون شعاع المحصلة وتراً في مثلث قائم ضلعاه <bdi dir="ltr">60 N</bdi> و<bdi dir="ltr">80 N</bdi>، فنطبق علاقة فيثاغورث (<bdi dir="ltr">F = √((60)² + (80)²)</bdi>):</p>
            <div class="worked-math">${pythagoreanFormula}</div>
            <div class="worked-math">${p59Substitution}</div>
            <p>نحصل بالحساب الدقيق على <bdi dir="ltr">F = 100 N</bdi> مطابقةً تماماً لطريقة الرسم!</p>
          </div>
          <div class="worked-step-card" data-w-step>
            <h5>٤. العناصر الأربعة للمحصلة وفحص المعقولية</h5>
            <ul class="worked-elements-list">
              <li><strong>نقطة التأثير:</strong> النقطة المشتركة <bdi dir="ltr">O</bdi>.</li>
              <li><strong>الحامل:</strong> المستقيم القطري <bdi dir="ltr">OM</bdi> في المستطيل المنشأ على القوتين.</li>
              <li><strong>الجهة:</strong> من <bdi dir="ltr">O</bdi> نحو الرأس المقابل <bdi dir="ltr">M</bdi> بين حاملي القوتين (أقرب إلى القوة الكبرى <bdi dir="ltr">80 N</bdi>).</li>
              <li><strong>الشدة:</strong> <bdi dir="ltr">${S_F} = 100 N</bdi> — وهي أكبر من <bdi dir="ltr">80 N</bdi> وأصغر من المجموع العددي <bdi dir="ltr">140 N</bdi>.</li>
            </ul>
          </div>
        </div>

        ${diagramFigure('right-angle-resultant', 'تمثيل المثال المحلول (2): مستطيل بعداه 3 cm و4 cm (كل 1 cm يقابل 20 N) وقطره OM وتر مثلث قائم طوله 5 cm يمثل F = 100 N.', curriculumBadge('مخطط ص 59'))}

        <div class="two-phase-grid">
          <aside class="math-note">
            <h3>تذكير رياضي · نظرية فيثاغورث (ص 59)</h3>
            <p>في أي مثلث قائم الزاوية: <strong>مربّع طول الوتر يساوي مجموع مربّعي طولي الضلعين القائمين</strong>. وتُطبَّق هذه القاعدة في الفيزياء حصراً عندما يكون حاملا القوتين <strong>متعامدين (<bdi dir="ltr">90°</bdi>)</strong>.</p>
          </aside>
          <aside class="math-note enrich-note">
            <h3>مهارة أساسية لحل المسائل: إيجاد ضلع قائم مجهول</h3>
            <p>إذا أعطاك السؤال شدة المحصلة ${V_F} (الوتر) وإحدى القوتين المتعامدتين وطلب القوة الأخرى، <strong>اطرح المربعين تحت الجذر</strong> ولا تجمع:</p>
            <div class="worked-math">${inversePythagoras}</div>
          </aside>
        </div>
      </section>`,

      simulationMarkup('perpendicular'),

      `<section class="content-card">
        <div class="card-badges">${curriculumBadge('تمهيد القسم الثاني · أسفل ص 59')}</div>
        <h2>ثانياً: تحليل القوة إلى مركبتين متعامدتين (تمهيد الفكرة العكسية)</h2>
        <p>تعلّمنا حتى الآن كيف <strong>نركّب (نجمع شعاعياً)</strong> قوتين متعامدتين لنحصل على قوة واحدة هي المحصلة ${V_F}. والآن نسأل السؤال العكسي تماماً: إذا كانت لدينا <strong>قوة واحدة مائلة</strong> تؤثر في جسم، فهل نستطيع تفكيكها واستبدالها بـ <strong>قوتين متعامدتين</strong> على محورين متعامدين <bdi dir="ltr">Ox</bdi> و<bdi dir="ltr">Oy</bdi> تُحدثان الأثر نفسه؟ هذه العملية العكسية تُسمّى <strong>تحليل القوة إلى مركبتين متعامدتين</strong>.</p>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 6 — ص 60: تحليل القوة إلى مركبتين متعامدتين + نشاط المستوى المائل
   * ========================================================================= */
  {
    page: 60,
    unitTitle: UNIT_TITLE,
    title: 'ثانياً: تحليل القوة إلى مركبتين متعامدتين والمستوى المائل',
    stageTitle: 'تحليل القوة والمستوى المائل الأملس',
    summary: 'نتعلّم خطوات إسقاط قوة على محورين متعامدين للحصول على مركبتيها، ونطبّق ذلك عملياً على ثقل جسم موضوع على مستوى مائل أملس.',
    objectives: [
      'ينفّذ خطوات الإسقاط العمودي لشعاع قوة على محورين متعامدين OX وOY.',
      'يشرح لماذا تُعدّ عملية تحليل القوة العمليةَ العكسية لتركيب قوتين متعامدتين.',
      'يحلّل قوة ثقل جسم على مستوى مائل أملس إلى مركبة موازية تسبب الانزلاق وأخرى عمودية يوازنها رد الفعل.',
    ],
    blocks: [
      `<section class="content-card">
        <div class="card-badges">${curriculumBadge('أتساءل وخطوات التحليل · ص 60')} ${enrichmentBadge('ربط بالحياة اليومية')}</div>
        <div class="question-banner">
          <span class="question-badge">أتساءل</span>
          <p>استبدلنا بقوّتين متلاقيتين قوّةً واحدةً سمّيناها المحصّلة؛ فهل يمكن استبدال قوّةٍ واحدةٍ بقوّتين متلاقيتين متعامدتين تقومان مقامها؟</p>
        </div>

        <h2>لماذا نحتاج في الفيزياء والحياة اليومية إلى تحليل قوة واحدة؟</h2>
        <p>عندما تسحب حقيبة سفر ذات عجلات بمقبض مائل، فإن سحبك الواحد يفعل أمرين في اللحظة نفسها: <strong>يرفع طرف الحقيبة قليلاً إلى الأعلى</strong> فيخفف ضغطها على الأرض، و<strong>يسحبها أفقياً إلى الأمام</strong> فتسير معك! لفهم مقدار كل أثر منهما على حدة، نحلّل القوة المائلة الواحدة إلى <strong>مركبتين متعامدتين</strong>.</p>

        <h3>خطوات عملية تحليل القوة إلى مركبتين متعامدتين (ص 60)</h3>
        <ol class="experiment-steps">
          <li>نثبّت على <strong>لوح الربائع</strong> محورين متعامدين <bdi dir="ltr">Ox</bdi> و<bdi dir="ltr">Oy</bdi> يتقاطعان في النقطة <bdi dir="ltr">O</bdi>.</li>
          <li>نمثّل القوة الأصلية المراد تحليلها بالشعاع ${V_OM} الذي مبدؤه <bdi dir="ltr">O</bdi> ونهايته الرأس <bdi dir="ltr">M</bdi>.</li>
          <li>ننزل من نهاية الشعاع <bdi dir="ltr">M</bdi> عموداً على المحور <bdi dir="ltr">Ox</bdi> فيقطعه في النقطة <bdi dir="ltr">X</bdi> التي تُسمّى <strong>(مرتسم النقطة <bdi dir="ltr">M</bdi>)</strong> على المحور الأول، فيتعيّن الشعاع ${V_OX} ويمثّل المركبة الأولى ${V_F1}.</li>
          <li>ننزل من النقطة <bdi dir="ltr">M</bdi> عموداً ثانياً على المحور <bdi dir="ltr">Oy</bdi> فيقطعه في النقطة <bdi dir="ltr">Y</bdi> (مرتسم <bdi dir="ltr">M</bdi> على المحور الثاني)، فيتعيّن الشعاع ${V_OY} ويمثّل المركبة الثانية ${V_F2}.</li>
          <li>نلاحظ تشكل <strong>مستطيل <bdi dir="ltr">OXMY</bdi></strong> قطره القوة الأصلية ${V_OM} وضلعاه المتجاوران هما المركبتان المتعامدتان: ${vectorSumIdentity}.</li>
        </ol>

        ${diagramFigure('components-xy', 'الإسقاط العمودي للرأس M على المحورين المتعامدين يعيّن المركبتين OX وOY بحيث يكون القطر OM مساوياً لمجموعهما الشعاعي.', curriculumBadge('مخطط الإسقاط · ص 60'))}

        <div class="conclusion-box">
          <h3>استنتاج الكتاب المدرسي (ص 60)</h3>
          <ul class="lesson-list">
            <li>نستطيع استبدال قوّةٍ واحدةٍ بقوّتين متعامدتين تقومان مقامها في إحداث الأثر نفسه.</li>
            <li>نسمّي عملية استبدال قوّةٍ بقوّتين متعامدتين <strong>عملية تحليل القوة إلى مركبتين متعامدتين</strong>، ونسمّي القوتين الناتجتين <strong>مركّبتَي القوّة</strong>، بينما تبقى القوة الأصلية محصّلةً لهاتين المركبتين (<bdi dir="ltr">F² = F₁² + F₂²</bdi>).</li>
          </ul>
        </div>
      </section>`,

      `<section class="content-card activity-card">
        <div class="card-badges">${curriculumBadge('نشاط تطبيقي مقرر · ص 60')}</div>
        <h2>نشاط: تحليل ثقل جسم على مستوى مائل أملس</h2>
        <p><strong>نص النشاط:</strong> نضع جسماً صلباً على <strong>مستوى مائل أملس</strong> (عديم الاحتكاك) يميل عن الأفق بزاوية ${LATIN_A}. يخضع الجسم لقوة ثقله الشاقولية ${V_W} المتجهة دوماً نحو الأسفل، ولردّ فعل المستوي الأملس ${V_R} العمودي على سطح المستوي. نريد أن نحلّل قوة ثقله إلى مركبتين متعامدتين:</p>
        <ol class="problem-sublist">
          <li>أحلل قوة ثقله إلى مركبتين متعامدتين: الأولى وفق خطّ موازٍ للمستوي المائل ${V_F1}، والثانية وفق خطّ عمودي على المستوي المائل ${V_F2}.</li>
          <li>ما نوع الشكل الهندسي الناتج من هذا التحليل؟ وما دور كلٍّ من المركبتين في حركة الجسم؟</li>
        </ol>

        ${diagramFigure('inclined-plane', 'تحليل قوة الثقل الشاقولية w على مستوى مائل أملس بزاوية a: المركبة F₁ توازي السطح نحو الأسفل، والمركبة F₂ تعامد السطح وتعاكس رد الفعل R، والشكل الناتج مستطيل قطره w.', curriculumBadge('تمثيل شكل ص 60'))}

        <div class="inquiry-stack">
          <div class="inquiry-card" data-inquiry-card data-correct="b">
            <p class="inquiry-q"><strong>تحقّق من الطلب (١): كيف نعيّن المركبتين ${V_F1} و${V_F2} انطلاقاً من نهاية شعاع الثقل ${V_W}؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-60-1" value="a" data-feedback="المحوران المختاران هنا ليسا الأفقي والشاقولي، لأن حركة الجسم مقيدة بطول السطح المائل؛ لذلك نختار محوراً موازياً للمستوي ومحوراً عمودياً عليه." /> <span>نُسقط شعاع الثقل على محور أفقي ومحور شاقولي، فتنطبق الثقل على الشاقول ولا تتجزأ.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-60-1" value="b" data-feedback="إجابة دقيقة! نرسم من مبدأ الثقل محورين متعامدين أحدهما يوازي السطح المائل والآخر يعامده، ثم ننزل من نهاية شعاع الثقل w عمودين على هذين المحورين فنحصل على F₁ الموازية للسطح وF₂ العمودية عليه." /> <span>نسقط نهاية شعاع الثقل ${V_W} عمودياً على المحور الموازي للمستوي فنحصل على ${V_F1}، وعمودياً على المحور الناظم على المستوي فنحصل على ${V_F2}.</span></label>
            <button type="button" class="l1-btn l1-btn-check" data-inquiry-check>تحقّق وافتح التفسير</button>
            <div class="l1-item-feedback" data-inquiry-feedback role="status" aria-live="polite" hidden></div>
          </div>

          <div class="inquiry-card" data-inquiry-card data-correct="a">
            <p class="inquiry-q"><strong>تحقّق من الطلب (٢): ما الشكل الهندسي الناتج، ولماذا ينزلق الجسم أسفل المستوى المائل الأملس؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-60-2" value="a" data-feedback="تفسير علمي ممتاز! لأن المحورين متعامدان (90°) والشدتين F₁ وF₂ مختلفتان بوجه عام، يكون الشكل مستطيلاً قطره w (ولا يصير مربعاً إلا عند a = 45°). وتوازن رد الفعل R المركبة العمودية F₂، فتبقى المركبة الموازية F₁ دون موازنة فتسبّب انزلاق الجسم!" /> <span>الشكل <strong>مستطيل</strong> قطره ${V_W} (ويصبح مربعاً في الحالة الخاصة <bdi dir="ltr">a = 45°</bdi>)؛ توازن ${V_R} المركبةَ العمودية ${V_F2}، وتبقى ${V_F1} مسؤولةً عن انزلاق الجسم أسفل المستوي.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-60-2" value="b" data-feedback="رد الفعل R عمودية على السطح فتوازن F₂ العمودية مثلها، أما F₁ الموازية للسطح الأملس فلا توجد قوة احتكاك تعاكسها." /> <span>الشكل شبه منحرف، وتبقى المركبة العمودية ${V_F2} هي المسببة للانزلاق.</span></label>
            <button type="button" class="l1-btn l1-btn-check" data-inquiry-check>تحقّق وافتح التفسير</button>
            <div class="l1-item-feedback" data-inquiry-feedback role="status" aria-live="polite" hidden></div>
          </div>
        </div>
      </section>`,

      simulationMarkup('force-resolution'),

      `<section class="content-card">
        <div class="card-badges">${enrichmentBadge('تنبيه علمي مهم')}</div>
        <div class="misconception-card">
          <h3>انتبه: هل يمكن أن تكون إحدى المركبتين المتعامدتين أكبر من القوة الأصلية؟</h3>
          <p><strong>أبداً!</strong> لأن القوة الأصلية هي <strong>قطر المستطيل (الوتر)</strong> والمركبتين هما الضلعان القائمان (<bdi dir="ltr">F² = F₁² + F₂²</bdi>)، والوتر في المثلث القائم أكبر دائماً من كل ضلع قائم على حدة (وتتساوى إحدى المركبتين مع القوة الأصلية فقط عندما تنطبق القوة كلياً على أحد المحورين فتصبح المركبة الأخرى صفراً).</p>
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 7 — ص 61: خلاصة الدرس + خريطة المفاهيم + أختبر نفسي (دفعة 1)
   * ========================================================================= */
  {
    page: 61,
    unitTitle: UNIT_TITLE,
    title: 'خلاصة الدرس وخريطة المفاهيم وأختبر نفسي (١)',
    stageTitle: 'الخلاصة وخريطة المفاهيم',
    summary: 'نراجع القواعد الأربع الكبرى للدرس في ملخص منظم وخريطة مفاهيم وجدول مقارنة سريع، ثم نبدأ التقييم التكويني في «أختبر نفسي».',
    objectives: [
      'يلخّص القواعد الأساسية الأربع لدرس القوى المتلاقية وتحليل القوة.',
      'يربط بصرياً بين عمليتَي التركيب والتحليل كعمليتين متعاكستين.',
      'يجيب عن أسئلة التمييز الهندسي في «أختبر نفسي» مع تعليل سبب استبعاد البدائل الخاطئة.',
    ],
    blocks: [
      `<section class="content-card summary-panel">
        <div class="card-badges">${curriculumBadge('تعلّمتُ · خلاصة الكتاب ص 61')}</div>
        <h2>تعلّمتُ — الخلاصة المركّزة للدرس</h2>
        <ul class="learned-list">
          <li><strong>القوى المتلاقية:</strong> هي القوى التي تتلاقى حواملها في نقطة واحدة.</li>
          <li><strong>محصّلة قوّتين متلاقيتين (حالة عامة):</strong> تُعيَّن بقطر متوازي الأضلاع المنشأ على شعاعي القوتين والمبتدئ من نقطة التلاقي المشتركة <bdi dir="ltr">O</bdi> وفق مقياس الرسم المختار.</li>
          <li><strong>محصّلة قوّتين متلاقيتين متعامدتين (<bdi dir="ltr">90°</bdi>):</strong> يتحول متوازي الأضلاع إلى مستطيل (أو مربع عند تساوي الشدتين)، وتُحسب شدة المحصلة من نظرية فيثاغورث: ${pythagoreanFormula}.</li>
          <li><strong>تحليل القوّة إلى مركبتين متعامدتين:</strong> عملية عكسية لجمع قوتين متعامدتين، نستبدل فيها بقوة واحدة مركبتين متعامدتين على محورين متعامدين تشكّلان ضلعي مستطيل قطره القوة الأصلية.</li>
        </ul>
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${enrichmentBadge('خريطة مفاهيم وجدول مقارنة للمراجعة السريعة')}</div>
        <h2>خريطة مفاهيم الدرس: الصورة الكاملة في نظرة واحدة</h2>
        <div class="concept-map" role="region" aria-label="خريطة مفاهيم القوى المتلاقية">
          <div class="cmap-root">
            <strong>القوة كمية متجهة (شعاعية) ${V_F}</strong>
            <span>تتعيّن بـ ٤ عناصر: نقطة التأثير · الحامل · الجهة · الشدة (N) بمقياس رسم</span>
          </div>
          <div class="cmap-connector" aria-hidden="true">↓ عندما تلتقي الحوامل في نقطة واحدة O ↓</div>
          <div class="cmap-hub">
            <strong>القوى المتلاقية في النقطة <bdi dir="ltr">O</bdi></strong>
          </div>
          <div class="cmap-branches">
            <article class="cmap-branch cmap-branch-compose">
              <h3>العملية الأولى: التركيب (جمع قوتين ← محصلة واحدة ${V_F})</h3>
              <ul>
                <li><strong>زاوية عامة:</strong> إنشاء <strong>متوازي أضلاع</strong> ← القطر <bdi dir="ltr">OM</bdi> بالمسطرة والمقياس.</li>
                <li><strong>تساوي الشدتين دون تعامد:</strong> الشكل <strong>معيّن</strong> والقطر ينصّف الزاوية.</li>
                <li><strong>تعامد الحاملين (<bdi dir="ltr">90°</bdi>):</strong> الشكل <strong>مستطيل</strong> (أو <strong>مربّع</strong> إذا <bdi dir="ltr">F₁ = F₂</bdi>) ← فيثاغورث <bdi dir="ltr">F = √(F₁² + F₂²)</bdi>.</li>
                <li><strong>موازنة القوتين:</strong> نضيف ${V_F_PRIME} على الحامل <bdi dir="ltr">OM</bdi> بشدة <bdi dir="ltr">F</bdi> وبجهة معاكسة.</li>
              </ul>
            </article>
            <article class="cmap-branch cmap-branch-resolve">
              <h3>العملية العكسية: التحليل (قوة واحدة ← مركبتان متعامدتان)</h3>
              <ul>
                <li><strong>على محورين متعامدين:</strong> إسقاط عمودي من الرأس <bdi dir="ltr">M</bdi> يعطي ${V_OX} و${V_OY} داخل <strong>مستطيل</strong> قطره القوة الأصلية.</li>
                <li><strong>على مستوى مائل أملس:</strong> يتحلل الثقل الشاقولي ${V_W} إلى ${V_F1} موازية للسطح (تسبب الانزلاق) و${V_F2} عمودية عليه (توازنها ${V_R}).</li>
              </ul>
            </article>
          </div>
        </div>

        <div class="comparison-table-wrap">
          <table class="comparison-table">
            <caption>جدول التمييز السريع لحالات قوتين متلاقيتين في النقطة <bdi dir="ltr">O</bdi></caption>
            <thead>
              <tr>
                <th scope="col">العلاقة بين القوتين</th>
                <th scope="col">الشكل الهندسي المنشأ</th>
                <th scope="col">علاقة حساب الشدة</th>
                <th scope="col">ملاحظة عن جهة المحصلة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>زاوية عامة (<bdi dir="ltr">0° &lt; φ &lt; 180°, φ ≠ 90°</bdi>) و<bdi dir="ltr">F₁ ≠ F₂</bdi></td>
                <td>متوازي أضلاع</td>
                <td>قياس القطر <bdi dir="ltr">OM</bdi> × مقياس الرسم</td>
                <td>بين القوتين وأقرب إلى الكبرى</td>
              </tr>
              <tr>
                <td>زاوية عامة غير قائمة و<bdi dir="ltr">F₁ = F₂</bdi></td>
                <td>معيّن</td>
                <td>قياس القطر <bdi dir="ltr">OM</bdi> × مقياس الرسم</td>
                <td>منصّف الزاوية بين القوتين</td>
              </tr>
              <tr>
                <td>حاملان متعامدان (<bdi dir="ltr">90°</bdi>) و<bdi dir="ltr">F₁ ≠ F₂</bdi></td>
                <td>مستطيل</td>
                <td><bdi dir="ltr">F = √(F₁² + F₂²)</bdi></td>
                <td>بين القوتين وأقرب إلى الكبرى</td>
              </tr>
              <tr>
                <td>حاملان متعامدان (<bdi dir="ltr">90°</bdi>) و<bdi dir="ltr">F₁ = F₂</bdi></td>
                <td>مربّع</td>
                <td><bdi dir="ltr">F = √(F₁² + F₂²)</bdi></td>
                <td>تصنع <bdi dir="ltr">45°</bdi> مع كل قوة</td>
              </tr>
              <tr>
                <td>حامل واحد وبجهة واحدة (<bdi dir="ltr">0°</bdi>) (إثراء ربط)</td>
                <td>تنطبقان على مستقيم</td>
                <td><bdi dir="ltr">F = F₁ + F₂</bdi> (عظمى)</td>
                <td>بجهة القوتين نفسها</td>
              </tr>
              <tr>
                <td>حامل واحد وبجهتين متعاكستين (<bdi dir="ltr">180°</bdi>) (إثراء ربط)</td>
                <td>تنطبقان على مستقيم</td>
                <td><bdi dir="ltr">F = |F₁ − F₂|</bdi> (صغرى)</td>
                <td>بجهة القوة الكبرى (أو تتوازنان إذا تساوتا)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>`,

      `<section class="content-card exam-card" data-self-check="p61">
        <div class="card-badges">${curriculumBadge('أختبر نفسي · الدفعة الأولى ص 61')}</div>
        <h2>أختبر نفسي — أولاً: اختر الإجابة الصحيحة (الفقرتان ١–٢)</h2>
        <p class="self-check-note">اختر الإجابة ثم اضغط «تحقّق من هذه الفقرة» أو اطلب تلميحاً تدريجياً لا يكشف الجواب مباشرةً.</p>

        <div class="exam-question" data-self-check-key="61-1">
          <p><strong>1.</strong> نعيّن محصّلة قوّتين متلاقيتين بإنشاء شكل هندسي هو:</p>
          <div class="options-grid">
            ${choiceOption('a', 'مثلّث')}
            ${choiceOption('b', 'مستطيل')}
            ${choiceOption('c', 'مربّع')}
            ${choiceOption('d', 'متوازي أضلاع')}
          </div>
        </div>

        <div class="exam-question" data-self-check-key="61-2">
          <p><strong>2.</strong> نعيّن محصّلة قوّتين متلاقيتين متعامدتين بإنشاء شكل هندسي هو:</p>
          <div class="options-grid">
            ${choiceOption('a', 'مربّع')}
            ${choiceOption('b', 'مستطيل')}
            ${choiceOption('c', 'معيّن')}
            ${choiceOption('d', 'شبه منحرف')}
          </div>
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 8 — ص 62: بقية أختبر نفسي + ورشة المسألتين + بنك التدريب المتدرج
   * ========================================================================= */
  {
    page: 62,
    unitTitle: UNIT_TITLE,
    title: 'استكمال أختبر نفسي وورشة المسائل وبنك التدريب المتدرّج',
    stageTitle: 'المسائل والتدريب الشامل',
    summary: 'نستكمل أسئلة «أختبر نفسي»، ونتدرّب خطوةً بخطوة على مسألتَي ص 62 مع الحلول النموذجية المقياسية، ثم نتقن الدرس عبر 10 تمارين متدرجة في 4 مستويات.',
    objectives: [
      'يحلّ فقرات الاختيار من متعدد الحسابية والقانونية في ص 62 بدقة.',
      'يحلّ المسألتين الأولى والثانية كاملتين بما في ذلك عناصر القوة الموازِنة F′ والتمثيل المقياسي.',
      'يجتاز بنك التدريب التكويني المتدرج في المستويات الأربعة.',
    ],
    blocks: [
      `<section class="content-card exam-card" data-self-check="p62">
        <div class="card-badges">${curriculumBadge('أختبر نفسي · الدفعة الثانية ص 62')}</div>
        <h2>أختبر نفسي — استكمال أولاً: اختر الإجابة الصحيحة (الفقرات ٣–٦)</h2>
        <p class="self-check-note">استخدم التلميحات التدريجية عند الحاجة، واقرأ التغذية الراجعة المخصصة لمعرفة سبب صحة اختيارك أو سبب استبعاد البديل الخاطئ.</p>

        <div class="exam-question" data-self-check-key="62-1">
          <p><strong>3.</strong> نعيّن محصّلة قوّتين متلاقيتين متعامدتين ومتساويتين بالشّدّة بإنشاء شكل هندسي هو:</p>
          <div class="options-grid">
            ${choiceOption('a', 'مربّع')}
            ${choiceOption('b', 'مستطيل')}
            ${choiceOption('c', 'متوازي أضلاع')}
            ${choiceOption('d', 'شبه منحرف')}
          </div>
        </div>

        <div class="exam-question" data-self-check-key="62-2">
          <p><strong>4.</strong> قوّتان متلاقيتان حاملاهما متعامدان شدّتاهما <bdi dir="ltr">F₁ = 12 N</bdi> و<bdi dir="ltr">F₂ = 16 N</bdi>، فتكون شدّة محصّلتهما:</p>
          <div class="options-grid">
            ${choiceOption('a', 'F = 28 N', 'ltr')}
            ${choiceOption('b', 'F = 20 N', 'ltr')}
            ${choiceOption('c', 'F = 4 N', 'ltr')}
            ${choiceOption('d', 'F = 192 N', 'ltr')}
          </div>
        </div>

        <div class="exam-question" data-self-check-key="62-3">
          <p><strong>5.</strong> قوّتان متلاقيتان حاملاهما متعامدان؛ شدّة الأولى <bdi dir="ltr">F₁ = 40 N</bdi> وشدّة محصّلتهما <bdi dir="ltr">F = 50 N</bdi>، فتكون شدّة القوّة الثّانية <bdi dir="ltr">F₂</bdi> مساويةً: <span class="inline-editorial-note">(ملاحظة أمانة علمية: كُتب الرمز <bdi dir="ltr">F =</bdi> في بدائل الطبعة المدرسية والمقصود مقدار <bdi dir="ltr">F₂</bdi>)</span></p>
          <div class="options-grid">
            ${choiceOption('a', '90 N (في الطبعة: F = 90 N)', 'rtl')}
            ${choiceOption('b', '30 N (في الطبعة: F = 30 N)', 'rtl')}
            ${choiceOption('c', '10 N (في الطبعة: F = 10 N)', 'rtl')}
            ${choiceOption('d', '45 N (في الطبعة: F = 45 N)', 'rtl')}
          </div>
        </div>

        <div class="exam-question" data-self-check-key="62-4">
          <p><strong>6.</strong> تُعطى شدّة محصّلة قوّتين متلاقيتين متعامدتين بالعلاقة:</p>
          <div class="options-grid">
            ${choiceOption('a', formula('F=F_{1}+F_{2}', 'F equals F one plus F two'), 'ltr')}
            ${choiceOption('b', formula('F=F_{1}-F_{2}', 'F equals F one minus F two'), 'ltr')}
            ${choiceOption('c', pythagoreanFormula, 'ltr')}
            ${choiceOption('d', formula('F=\\sqrt{F_{1}^{2}-F_{2}^{2}}', 'F equals square root of F one squared minus F two squared'), 'ltr')}
          </div>
        </div>
      </section>`,

      renderProblemWorkbench(TEXTBOOK_PROBLEMS[0]),
      renderProblemWorkbench(TEXTBOOK_PROBLEMS[1]),
      renderPracticeDeck(),

      `<section class="content-card next-step-card">
        <div class="card-badges">${enrichmentBadge('الخطوة التالية بعد إتقان الدرس')}</div>
        <h2>هل أتقنتَ الدرس الأول ومستعدّ لقياس مستواك؟</h2>
        <p>بعد مراجعتك لخلاصة الدرس وحلّ مسألتَي ص 62 وبنك التدريب التكويني أعلاه، يمكنك الانتقال إلى <strong>اختبار الدرس الأول المستقل (٢٠ سؤالاً)</strong> لقياس استيعابك الشامل، أو العودة إلى الملاحق الإثرائية وفهرس الدروس.</p>
        <div class="next-step-links">
          <a class="l1-cta-link l1-cta-primary" href="./lesson-test.html">انتقل إلى اختبار الدرس الأول (٢٠ سؤالاً)</a>
          <a class="l1-cta-link l1-cta-secondary" href="./lesson-1-appendix.html">ملحق الدرس الأول</a>
          <a class="l1-cta-link l1-cta-secondary" href="./index.html">العودة إلى فهرس المقرر</a>
        </div>
      </section>`,
    ],
  },
];

export const PYTHAGORAS_LINES = Object.freeze([
  'F = √(F₁² + F₂²)',
  'F = √((60)² + (80)²)',
  'F = 100 N',
]);

export function pageTextBlocks(page) {
  return page.blocks
    .map((html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .join('\n');
}
