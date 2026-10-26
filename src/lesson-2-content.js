import { LESSON_2_DIAGRAMS } from './lesson-2-diagrams.js';
import {
  calculation,
  formula,
  qty,
  tex,
  V_F,
  V_F1,
  V_F2,
  V_F3,
  V_W,
} from './math.js';
import { lesson2SimulationMarkup } from './lesson-2-simulation.js';
import { renderChoice, renderPracticeDeck, renderProblemWorkbenches } from './lesson-2-practice.js';

const UNIT_TITLE = 'الوحدة الأولى: الحركة والقوى';
const LESSON_TITLE = 'الدرس الثاني: القوى المتوازية';

const bookBadge = (label = 'محتوى الكتاب المدرسي') =>
  `<span class="curriculum-tag curriculum-tag-book">${label}</span>`;
const enrichBadge = (label = 'إثراء وتوضيح من المنصة') =>
  `<span class="curriculum-tag curriculum-tag-enrich">${label}</span>`;

const diagramFigure = (key, caption, badgeHtml = '') => {
  const entry = LESSON_2_DIAGRAMS[key];
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

const SAME_MOMENT = formula('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two');
const SAME_SUM = formula('F=F_{1}+F_{2}', 'F equals F one plus F two');
const OPPOSITE_DIFF = formula('F=F_{2}-F_{1}', 'F equals F two minus F one');
const PROPORTION = formula(
  '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}=\\dfrac{F_{1}+F_{2}}{d_{2}+d_{1}}=\\dfrac{F}{d}',
  'F one over d two equals F two over d one equals F over d',
);

export const LESSON_2_PAGES = [
  /* =========================================================================
   * المرحلة 1 — ص 63
   * ========================================================================= */
  {
    page: 63,
    unitTitle: UNIT_TITLE,
    title: LESSON_TITLE,
    stageTitle: 'التمهيد والأهداف',
    summary: 'من مشهدي الأرجوحة والعربة نتعرّف أن قوى الشد قد تعمل على حوامل متوازية، ونحدّد أهداف الدرس والكلمة المفتاحية قبل أي حساب.',
    objectives: [
      'يربط مشهدي الأرجوحة والعربة بفكرة الحوامل المتوازية.',
      'يميّز سؤال الاتزان عن سؤال التوازي.',
      'يسمّي أهداف الدرس الأربعة والكلمة المفتاحية كما في الكتاب.',
    ],
    blocks: [
      `<section class="content-card hook-card">
        <div class="card-badges">${enrichBadge('مدخل من مشهدي الكتاب · ص 63')} ${bookBadge('ألاحظ الصورة وأجيب')}</div>
        <h2>عندما لا تلتقي خطوط الشد في نقطة واحدة</h2>
        <p>في الدرس السابق كانت حوامل القوى تتلاقى في نقطة. انظر الآن إلى أرجوحة معلّقة بسلسلتين، وإلى حصانين يشدّان عربة: كل سلسلة — وكل حصان — يعمل على خطّه الخاص. الخطّان لا يتقاطعان، بل يجريان جنباً إلى جنب. هذه هي فكرة <strong>القوى المتوازية</strong>.</p>
        <p>لن نخمّن أرقاماً غير موجودة في الصورة. سنقرأ <strong>وضع الحوامل</strong> و<strong>الجهة</strong> فقط، ثم نسأل: إذا استبدلنا القوتين بقوة واحدة، فما شدتها وأين يقع حاملها؟</p>
      </section>`,

      `<section class="goals-panel">
        <div class="card-badges">${bookBadge('الأهداف والكلمات المفتاحية · ص 63')}</div>
        <h2>أهداف الدرس</h2>
        <p class="goals-lead">يتوقع من المتعلم في نهاية هذا الدرس أن يكون قادراً على أن:</p>
        <ul class="goals-list">
          <li>يتعرّف القوى المتوازية.</li>
          <li>يحدّد عناصر محصلة قوتين متوازيتين بجهة واحدة.</li>
          <li>يحدّد عناصر محصلة قوتين متوازيتين بجهتين متعاكستين.</li>
          <li>يمثّل بالرسم القوى المتوازية ومحصلتها.</li>
        </ul>
        <div class="keyword-row" aria-label="الكلمات المفتاحية">
          <span class="keyword-label">الكلمات المفتاحية:</span>
          <span class="keyword-chip">قوتان متوازيتان</span>
          <span class="keyword-chip">الحامل</span>
          <span class="keyword-chip">المحصلة ${V_F}</span>
          <span class="keyword-chip">نقطة التأثير</span>
        </div>
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${bookBadge('ألاحظ الصورة وأجيب · ص 63')}</div>
        <h2>مشهدان من حياة الطالب</h2>
        <div class="dual-diagram-row">
          ${diagramFigure('swing-scene', 'كل سلسلة تشد المقعد على حاملها. الحاملان مستقيمان متوازيان تقريباً، والثقل شاقولي إلى أسفل.', bookBadge('تمثيل مشهد ص 63'))}
          ${diagramFigure('wagon-scene', 'الحصانان يشدان العربة بقوتين متوازيتين وبجهة واحدة في المشهد المقصود.', bookBadge('تمثيل مشهد ص 63'))}
        </div>
        <div class="inquiry-stack">
          <div class="inquiry-card" data-inquiry-card data-correct="b">
            <p class="inquiry-q"><strong>١. كيف تكون قوى شد السلاسل للأرجوحة؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-63-1" value="a" data-feedback="لو التقت الحوامل في نقطة واحدة لعدنا إلى القوى المتلاقية. هنا كل سلسلة على خطها." /> <span>حواملها تتلاقى في نقطة واحدة تحت المقعد.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-63-1" value="b" data-feedback="صحيح اتجاهياً: كل سلسلة تشد على حاملها، والخطان لا يتقاطعان فهما متوازيان في التمثيل المقصود." /> <span>تعمل على حاملين منفصلين متوازيين، كل شد على استقامة سلسلته.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-63-1" value="c" data-feedback="الكتاب لا يعطي مقدار الشد. السؤال عن وضع القوى لا عن رقم النيوتن." /> <span>شدّاهما متساويان دوماً ويساويان وزن المقعد كلٌّ على حدة.</span></label>
            <button type="button" class="l2-btn l2-btn-check" data-inquiry-check>تحقّق وافتح التفسير</button>
            <div class="l2-item-feedback" data-inquiry-feedback role="status" aria-live="polite" hidden></div>
          </div>
          <div class="inquiry-card" data-inquiry-card data-correct="b">
            <p class="inquiry-q"><strong>٢. ما الذي يجعل الأرجوحة متوازنة؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-63-2" value="a" data-feedback="التوازي وصف هندسي للحوامل، أما الاتزان فشرط ألا تتحرك الأرجوحة وألا تدور." /> <span>كون قوى الشد متوازية فقط، حتى لو زاد أحد الشدّين كثيراً.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-63-2" value="b" data-feedback="نعم: تبقى الأرجوحة ساكنة عندما تتوازن تأثيرات القوى (الشدّان إلى أعلى والثقل إلى أسفل) ولا يحدث دوران." /> <span>تعادل تأثيرات القوى المؤثرة بحيث لا تتحرك الأرجوحة ولا تدور.</span></label>
            <button type="button" class="l2-btn l2-btn-check" data-inquiry-check>تحقّق وافتح التفسير</button>
            <div class="l2-item-feedback" data-inquiry-feedback role="status" aria-live="polite" hidden></div>
          </div>
          <div class="inquiry-card" data-inquiry-card data-correct="a">
            <p class="inquiry-q"><strong>٣. كيف يشد الحصانان العربة؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-63-3" value="a" data-feedback="في المشهد المقصود يشد الحصانان في اتجاه السير نفسه على خطين متوازيين، فهذه قوتان متوازيتان بجهة واحدة." /> <span>بقوتين متوازيتين وبجهة واحدة تقريباً نحو الأمام.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-63-3" value="b" data-feedback="لو شدّا في جهتين متعاكستين لما تقدمت العربة إلى الأمام في هذا المشهد." /> <span>بقوتين متوازيتين بجهتين متعاكستين فيشدّ كلٌّ عكس الآخر.</span></label>
            <button type="button" class="l2-btn l2-btn-check" data-inquiry-check>تحقّق وافتح التفسير</button>
            <div class="l2-item-feedback" data-inquiry-feedback role="status" aria-live="polite" hidden></div>
          </div>
        </div>
        <div class="callout-box callout-tip">
          <h3>تمييز سريع قبل التجربة</h3>
          <p><strong>التوازي</strong> صفة هندسية: الحوامل مستقيمات لا تتقاطع. <strong>الاتزان</strong> صفة حركية: الجسم لا يترجم ولا يدور. قد تكون القوى متوازية والجسم غير متزن، أو متوازية ومتزنة معاً كما في تجارب الدرس.</p>
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 2 — ص 64
   * ========================================================================= */
  {
    page: 64,
    unitTitle: UNIT_TITLE,
    title: 'تعريف القوى المتوازية',
    stageTitle: 'التعريف والتجربة',
    summary: 'من تجربة لوح الربائع المغناطيسي نستنتج تعريف الكتاب: القوى المتوازية هي القوى التي تكون حواملها مستقيمات متوازية.',
    objectives: [
      'ينفّذ ذهنياً خطوتي تجربة الصفحة 64.',
      'يجيب عن أسئلة «أتساءل» حول الحوامل.',
      'يصوغ تعريف القوى المتوازية ويحفظ شرطه الهندسي فقط.',
    ],
    blocks: [
      `<section class="content-card">
        <div class="card-badges">${bookBadge('أجرّب وأستنتج · ص 64')}</div>
        <h2>تعريف القوى المتوازية</h2>
        <div class="tools-strip">
          <strong>أدوات التجربة:</strong>
          لوح الربائع المغناطيسي — مسطرة خفيفة مثقّبة ومدرّجة — جسم مزوّد بخطّاف — ربائع — خيوط ربط — (حقيبة الميكانيك).
        </div>
        <ol class="experiment-list">
          <li>أعلّق جسماً في خطّاف ربيعة فيتأثر بقوة ثقله ${V_W}. ما حامل هذه القوة؟ وما جهتها؟</li>
          <li>أربط خطّافي ربيعتين بخيطين باستخدام لوح الربائع، وأعلّق كلّاً منهما بطرفي مسطرة خفيفة، وأعلّق خطاف الجسم بالنقطة ${tex('C', 'C')} من المسطرة بحيث تبقى المسطرة أفقية متوازنة كما في الشكل.</li>
        </ol>
        <div class="dual-diagram-row">
          ${diagramFigure('single-spring', 'الخطوة 1: حامل الثقل شاقولي وجهته إلى أسفل.', bookBadge('الخطوة 1'))}
          ${diagramFigure('two-spring-bar', 'الخطوة 2: شدّان إلى أعلى عند الطرفين وثقل إلى أسفل عند C.', bookBadge('الشكل العلوي ص 64'))}
        </div>
      </section>`,

      lesson2SimulationMarkup('parallel-definition-lab'),

      `<section class="content-card">
        <div class="card-badges">${bookBadge('أتساءل · ص 64')}</div>
        <h2>أسئلة التجربة</h2>
        <div class="inquiry-stack">
          <div class="inquiry-card" data-inquiry-card data-correct="b">
            <p class="inquiry-q"><strong>هل لحاملي قوتي شد الربيعتين الاستقامة ذاتها؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-64-1" value="a" data-feedback="الاستقامة ذاتها تعني مستقيماً واحداً. هنا ربيعتان على طرفي المسطرة فالحاملان منفصلان." /> <span>نعم، ينطبق الحاملان فيصبحان مستقيماً واحداً.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-64-1" value="b" data-feedback="صحيح: كل ربيعة على حاملها. الحاملان شاقوليان متوازيان وليسا الاستقامة ذاتها." /> <span>لا. هما مستقيمان منفصلان متوازيان.</span></label>
            <button type="button" class="l2-btn l2-btn-check" data-inquiry-check>تحقّق</button>
            <div class="l2-item-feedback" data-inquiry-feedback hidden role="status" aria-live="polite"></div>
          </div>
          <div class="inquiry-card" data-inquiry-card data-correct="a">
            <p class="inquiry-q"><strong>هل يتغيّر حامل قوة ثقل الجسم في هذه الحالة عمّا كان عليه في الحالة الأولى؟</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-64-2" value="a" data-feedback="الثقل جذب الأرض للجسم نحو مركزها، فجهته إلى أسفل وحامله شاقولي في الحالتين." /> <span>لا. يبقى الحامل شاقولياً والجهة إلى أسفل.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-64-2" value="b" data-feedback="تعليق الجسم في المسطرة يغيّر نقطة التأثير (تصبح C) لا جهة الثقل ولا حاملها الشاقولي." /> <span>نعم، يميل حامل الثقل نحو الربيعة الأقرب.</span></label>
            <button type="button" class="l2-btn l2-btn-check" data-inquiry-check>تحقّق</button>
            <div class="l2-item-feedback" data-inquiry-feedback hidden role="status" aria-live="polite"></div>
          </div>
        </div>
        <p>بعد رسم ثلاثة خطوط على امتداد كل ربيعة ثم رفع الربائع والمسطرة، تبقى الخطوط المرسومة على اللوح: <strong>ثلاثة مستقيمات متوازية</strong>.</p>
      </section>`,

      `<section class="content-card source-conclusion">
        <div class="card-badges">${bookBadge('أستنتج · ص 64')}</div>
        <h2>استنتاج التعريف</h2>
        ${diagramFigure('parallel-definition', 'الحوامل الثلاثة مستقيمات متوازية: هذا هو شرط التعريف، لا تساوي المقادير.', bookBadge('شكل الاستنتاج ص 64'))}
        <div class="callout-box callout-book">
          <p><strong>القوى المتوازية:</strong> هي القوى التي تكون حواملها مستقيمات متوازية.</p>
        </div>
        <div class="misconception-card">
          <h3>خطأ شائع</h3>
          <p>القول إن القوتين متوازيتان «لأن السهمين متجاوران». يجب مدّ كل سهم على استقامته: إن كان الحاملان مستقيمين متوازيين فالقوتان متوازيتان، ثم نسأل هل الجهتان واحدة أم متعاكستان.</p>
        </div>
        <div class="stage-bridge">
          <strong>أتساءل (ص 64):</strong> هل يمكن إيجاد محصلة عدة قوى متوازية؟ وكيف يتم ذلك؟ الإجابة تبدأ في الصفحة التالية: نبحث عن قوة وحيدة تقوم مقام القوتين، بتعيين شدتها وجهتها وحاملها ونقطة تأثيرها.
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 3 — ص 65
   * ========================================================================= */
  {
    page: 65,
    unitTitle: UNIT_TITLE,
    title: 'محصلة قوتين بجهة واحدة',
    stageTitle: 'جهة واحدة',
    summary: 'من تجربة الثقلين والربيعة نستنتج عناصر محصلة قوتين متوازيتين بجهة واحدة: حامل موازٍ، جهة القوتين، شدة مجموعهما، ونقطة بين القوتين أقرب إلى الأكبر تحقق تساوي الجداءين.',
    objectives: [
      'يتتبع خطوات التجربة التسع ويربط F3 بالمحصلة F.',
      'يكتب العناصر الأربعة للمحصلة بجهة واحدة.',
      'يفسّر لماذا تقترب C من القوة الأكبر.',
    ],
    blocks: [
      `<section class="content-card">
        <div class="card-badges">${bookBadge('أجرّب وأستنتج · ص 65')}</div>
        <h2>محصلة قوتين متوازيتين بجهة واحدة</h2>
        <div class="tools-strip">
          <strong>أدوات التجربة:</strong>
          لوح الربائع المغناطيسي — مسطرة خفيفة مثقّبة ومدرّجة — أجسام مزوّدة بخطّاف — ربائع — خيوط ربط.
        </div>
        ${diagramFigure('same-sense-experiment', 'الثقلان إلى أسفل عند A و B، والربيعة F3 إلى أعلى عند C. تُبحث C حتى تبقى المسطرة أفقية.', bookBadge('شكل التجربة ص 65'))}
        <ol class="experiment-list">
          <li>أعلّق في طرفي مسطرة طولها ${tex('d', 'd')} ثقلين مختلفين ${tex('w_{1}=F_{1}', 'w one equals F one')} ، ${tex('w_{2}=F_{2}', 'w two equals F two')}.</li>
          <li>أبحث عن النقطة ${tex('C', 'C')} التي أعلّق المسطرة عندها بواسطة ربيعة لتبقى المسطرة متوازنة أفقية.</li>
          <li>أسجّل دلالة مؤشر الربيعة وليكن ${V_F3}. ماذا ألاحظ؟</li>
          <li>ألاحظ حامل ${V_F3} بالنسبة لحاملي الثقلين.</li>
          <li>أرسم حوامل القوى الثلاث مع المسطرة، وأرسم حامل القوة ${V_F} التي تعاكس مباشرة القوة ${V_F3}.</li>
          <li>أمثّل القوى بالرسم.</li>
          <li>أقيس بُعد النقطة C عن النقطة A ولتكن ${tex('d_{1}', 'd one')}.</li>
          <li>أقيس بُعد النقطة C عن النقطة B ولتكن ${tex('d_{2}', 'd two')}.</li>
          <li>أحسب الجداءين ${tex('F_{1}\\times d_{1}', 'F one times d one')} والجداء ${tex('F_{2}\\times d_{2}', 'F two times d two')}.</li>
        </ol>
        <div class="callout-box callout-tip">
          <h3>لماذا نرسم ${V_F} معاكسة لـ ${V_F3}؟</h3>
          <p>عند الاتزان الأفقي تعادل الربيعة أثر الثقلين معاً، فتكون ${V_F3} معاكسة لمحصلة الثقلين ومساوية لها شدة. القوة ${V_F} التي تعاكس ${V_F3} مباشرة هي إذن <strong>محصلة القوتين المتوازيتين بجهتهما</strong>.</p>
        </div>
        ${diagramFigure('same-sense-construction', 'F3 إلى أعلى، و F إلى أسفل معاكسة لها. d1 = CA و d2 = CB و d = AB.', bookBadge('خطوات الرسم 5–9'))}
      </section>`,

      `<section class="content-card source-conclusion">
        <div class="card-badges">${bookBadge('أستنتج · ص 65')}</div>
        <h2>عناصر المحصلة بجهة واحدة</h2>
        <p>محصلة قوتين متوازيتين وبجهة واحدة هي قوة وحيدة ${V_F} عناصرها:</p>
        <div class="four-elements-grid">
          <article class="element-tile"><span class="element-num">١</span><h3>الحامل</h3><p>يوازي حاملي القوتين ${V_F1} ، ${V_F2}.</p></article>
          <article class="element-tile"><span class="element-num">٢</span><h3>الجهة</h3><p>بجهة القوتين ${V_F1} ، ${V_F2}.</p></article>
          <article class="element-tile"><span class="element-num">٣</span><h3>الشدة</h3><p>حاصل جمع شدتي القوتين:</p>${SAME_SUM}</article>
          <article class="element-tile"><span class="element-num">٤</span><h3>نقطة التأثير</h3><p>تقع على القطعة المستقيمة ${tex('AB', 'A B')} الواصلة بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر ${V_F2} وتحقق العلاقة:</p>${SAME_MOMENT}</article>
        </div>
        ${diagramFigure('same-sense', 'بعد تمثيل القوى تُرسم الأسهم في جهة واحدة. C بين B و A وأقرب إلى F2 الأكبر، مع d = d1 + d2.', bookBadge('شكل الاستنتاج ص 65'))}
        <div class="misconception-card">
          <h3>خطأ شائع: البعد الأكبر للقوة الأكبر</h3>
          <p>العلاقة عكسية. حتى يبقى الجداءان متساويين، القوة الأكبر يكون بعدها عن حامل المحصلة أصغر؛ لذلك تقترب C منها.</p>
        </div>
      </section>`,

      lesson2SimulationMarkup('parallel-resultant-lab'),
    ],
  },

  /* =========================================================================
   * المرحلة 4 — ص 66
   * ========================================================================= */
  {
    page: 66,
    unitTitle: UNIT_TITLE,
    title: 'علاقات التناسب وتطبيق محلول',
    stageTitle: 'التناسب والتطبيق',
    summary: 'من تساوي الجداءين نكتب تناسب الكتاب، ونجيب عن «أفكر»، ثم نبدأ تطبيق الساق 0.5 m بالقوتين 20 N و 30 N.',
    objectives: [
      'ينتقل من F1 × d1 = F2 × d2 إلى سلسلة التناسب.',
      'يستنتج أن C في المنتصف إذا تساوت الشّدتان.',
      'يحسب شدة محصلة التطبيق المحلول.',
    ],
    blocks: [
      `<section class="content-card">
        <div class="card-badges">${bookBadge('ترتيب العلاقة · ص 66')}</div>
        <h2>من الجداءين إلى التناسب</h2>
        <p>بترتيب العلاقة ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one d one equals F two d two')} نجد:</p>
        ${formula('\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}', 'F one over d two equals F two over d one')}
        <div class="callout-box callout-book">
          <h3>من خصائص التناسب في الرياضيات</h3>
          ${formula('\\dfrac{A}{B}=\\dfrac{C}{D}=\\dfrac{A+C}{B+D}=\\dfrac{K}{L}', 'A over B equals C over D equals A plus C over B plus D')}
          <p>يؤدي ذلك إلى السلسلة نفسها بعد إعادة التسمية. وحسب خصائص التناسب نكتب:</p>
        </div>
        ${PROPORTION}
        ${formula('\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}=\\dfrac{F}{d}', 'F one over d two equals F two over d one equals F over d')}
        <p>حيث ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')} و ${tex('d=d_{1}+d_{2}', 'd equals d one plus d two')} في حالة الجهة الواحدة. هذه السلسلة لا تغيّر القانون؛ هي ترتيب يسهّل حساب مجهول واحد إذا عُرفت ثلاثة مقادير.</p>
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${bookBadge('أفكر · ص 66')}</div>
        <h2>أين تستقر النقطة C إذا تساوت الشّدتان؟</h2>
        <p>أين ستقع النقطة ${tex('C', 'C')} إذا كانت القوتان متوازيتين وبجهة واحدة ومتساويتين شدة؟</p>
        <div class="inquiry-stack">
          <div class="inquiry-card" data-inquiry-card data-correct="b">
            <p class="inquiry-q"><strong>اختر الاستنتاج قبل كشف التفسير.</strong></p>
            <label class="inquiry-opt"><input type="radio" name="inq-66-think" value="a" data-feedback="لا يوجد سبب يجعل C أقرب إلى إحدى القوتين إذا تساوت الشّدتان." /> <span>أقرب إلى الطرف الأيمن كيفما كانت المسطرة.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-66-think" value="b" data-feedback="من F1 = F2 و F1 × d1 = F2 × d2 يلزم d1 = d2، فتستقر C في المنتصف." /> <span>في منتصف المسافة بين نقطتي التأثير.</span></label>
            <label class="inquiry-opt"><input type="radio" name="inq-66-think" value="c" data-feedback="خروج C من القطعة صفة حالة التعاكس لا الجهة الواحدة." /> <span>خارج القطعة AB.</span></label>
            <button type="button" class="l2-btn l2-btn-check" data-inquiry-check>تحقّق</button>
            <div class="l2-item-feedback" data-inquiry-feedback hidden role="status" aria-live="polite"></div>
          </div>
        </div>
        <p>يمكنك تثبيت هذا الاستنتاج في المختبر السابق بزر «قوتان متساويتان».</p>
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${bookBadge('تطبيق محلول · ص 66')}</div>
        <h2>ساق مهملة الكتلة طولها 0.5 m</h2>
        <div class="problem-box">
          <p>ساق مهملة الكتلة طولها ${tex('AB=0.5\\,\\mathrm{m}', 'A B equals 0.5 meters')} تؤثر في طرفيها قوتان متوازيتان وبجهة واحدة شدتاهما: ${tex('F_{1}=20\\,\\mathrm{N}', 'F one equals 20 newtons')} ، ${tex('F_{2}=30\\,\\mathrm{N}', 'F two equals 30 newtons')}. المطلوب:</p>
          <ol>
            <li>أحسب شدة محصلة هاتين القوتين.</li>
            <li>أحسب بُعد حامل القوة الثانية عن حامل المحصلة.</li>
            <li>أكتب عناصر المحصلة.</li>
            <li>أرسم كلاً من ${tex('(F_{1},F_{2},F,d_{1},d_{2})', 'F one, F two, F, d one, d two')}.</li>
          </ol>
        </div>
        <div data-worked-stepper>
          <div class="worked-stepper-controls">
            <button type="button" class="l2-btn l2-btn-ghost" data-worked-prev>الخطوة السابقة</button>
            <button type="button" class="l2-btn l2-btn-check" data-worked-next>الخطوة التالية</button>
          </div>
          <div class="worked-step-card" data-worked-step>
            <h5>المعطيات</h5>
            <p>جهة واحدة، ${qty(20, 'N')} و ${qty(30, 'N')} ، ${tex('AB=0.5\\,\\mathrm{m}', '0.5 meters')}. الكتلة مهملة فلا وزن للساق نفسها.</p>
          </div>
          <div class="worked-step-card" data-worked-step>
            <h5>المطلوب 1 — الشدة</h5>
            <p>لماذا الجمع؟ لأن الجهتين واحدة، فالاستنتاج يعطي ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')}.</p>
            ${calculation('F=F_{1}+F_{2}=20+30=50\\,\\mathrm{N}', 'F equals 20 plus 30 equals 50 newtons')}
          </div>
        </div>
        <p>تتمة الحل (البعد والعناصر والرسم) في المرحلة التالية كما يتابعها الكتاب في الصفحة 67.</p>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 5 — ص 67
   * ========================================================================= */
  {
    page: 67,
    unitTitle: UNIT_TITLE,
    title: 'تتمة التطبيق والجهتان المتعاكستان',
    stageTitle: 'التعاكس',
    summary: 'نُكمل حساب d2 وعناصر محصلة 20 N و 30 N، ثم ننتقل إلى استنتاج الكتاب لعناصر محصلة قوتين متوازيتين بجهتين متعاكستين.',
    objectives: [
      'يحسب d2 من سلسلة التناسب ويتحقق بالجداءين.',
      'يكتب عناصر المحصلة الأربعة للتطبيق.',
      'يميّز ما يتغير عند عكس إحدى الجهتين: الشدة والجهة والموضع.',
    ],
    blocks: [
      `<section class="content-card">
        <div class="card-badges">${bookBadge('تتمة الحل · ص 67')}</div>
        <h2>حساب d2 وعناصر المحصلة</h2>
        <div data-worked-stepper>
          <div class="worked-stepper-controls">
            <button type="button" class="l2-btn l2-btn-ghost" data-worked-prev>السابق</button>
            <button type="button" class="l2-btn l2-btn-check" data-worked-next>التالي</button>
          </div>
          <div class="worked-step-card" data-worked-step>
            <h5>2. بعد حامل القوة الثانية عن حامل المحصلة</h5>
            <p>نستعمل ${tex('F/d=F_{1}/d_{2}', 'F over d equals F one over d two')} لأن المجهول هو d2 المرتبط بالقوة الأولى في سلسلة التناسب.</p>
            ${formula('\\dfrac{F}{d}=\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}', 'F over d equals F one over d two equals F two over d one')}
            ${calculation('50/0.5=20/d_{2}\\;\\Rightarrow\\;d_{2}=0.2\\,\\mathrm{m}', '50 over 0.5 equals 20 over d two, so d two equals 0.2 meters')}
          </div>
          <div class="worked-step-card" data-worked-step>
            <h5>التحقق قبل كتابة العناصر</h5>
            <p>d1 = 0.5 − 0.2 = 0.3 m، والجداءان:</p>
            ${calculation('20\\times 0.3=30\\times 0.2=6\\,\\mathrm{N\\cdot m}', '20 times 0.3 equals 30 times 0.2 equals 6 newton meters')}
            <p>C أقرب إلى 30 N لأن 0.2 m &lt; 0.3 m.</p>
          </div>
          <div class="worked-step-card" data-worked-step>
            <h5>3. عناصر المحصلة</h5>
            <ul class="worked-elements-list">
              <li><strong>نقطة التأثير:</strong> تقع على القطعة المستقيمة AB الواصلة بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر ${V_F2}، وعلى بعد ${qty(0.2, 'm')} من حامل القوة الثانية.</li>
              <li><strong>حاملها:</strong> يوازي حاملي القوتين ${V_F1} ، ${V_F2}.</li>
              <li><strong>جهتها:</strong> بجهة القوتين ${V_F1} ، ${V_F2}.</li>
              <li><strong>شدتها:</strong> ${tex('F=50\\,\\mathrm{N}', 'F equals 50 newtons')}.</li>
            </ul>
          </div>
        </div>
        ${diagramFigure('worked-same', 'F2 عند B يساراً و F1 عند A يميناً و F عند C أقرب إلى B. القيم من حل الكتاب.', bookBadge('رسم الحل ص 67'))}
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${bookBadge('محصلة قوتين بجهتين متعاكستين · ص 67')}</div>
        <h2>في التجربة السابقة</h2>
        <ul class="source-list">
          <li>أنزع الثقل ${tex('w_{1}=F_{1}', 'w one equals F one')}، ماذا ألاحظ؟</li>
          <li>أعيد الثقل ${V_F1} ما دور هذا الثقل؟</li>
          <li>ماذا أسمّي هذا الثقل بالنسبة للقوتين ${V_F2} ، ${V_F3}؟</li>
        </ul>
        <div class="callout-box callout-tip">
          <h3>قراءة التجربة دون إضافة قانون جديد</h3>
          <p>عند نزع أحد الثقلين تختل أفقية المسطرة لأن الجداءين لم يعودا متعادلين حول C. إعادة الثقل تعيد الاتزان. في التمثيل النهائي نعكس جهة إحدى القوتين: الشدة تصبح فرقاً، والجهة جهة الأكبر، ونقطة التأثير تخرج من القطعة.</p>
        </div>
        ${diagramFigure('opposite-sense', 'F1 إلى أعلى عند A، و F2 الأكبر إلى أسفل عند B، و F إلى أسفل عند C خارج AB من جهة الأكبر.', bookBadge('شكل ص 67'))}
      </section>`,

      `<section class="content-card source-conclusion">
        <div class="card-badges">${bookBadge('أستنتج · ص 67')}</div>
        <h2>عناصر محصلة قوتين متوازيتين وبجهتين متعاكستين</h2>
        <ul class="worked-elements-list">
          <li><strong>نقطة تأثيرها:</strong> تقع على امتداد القطعة المستقيمة ${tex('(AB)', 'line A B')} الواصلة بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر ${V_F2} وتحقق العلاقة ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two')}.</li>
          <li><strong>حاملها:</strong> يوازي حاملي القوتين ${V_F1} ، ${V_F2}.</li>
          <li><strong>جهتها:</strong> بجهة القوة الأكبر ${V_F2}.</li>
          <li><strong>شدتها:</strong> حاصل طرح شدتي القوتين:</li>
        </ul>
        ${OPPOSITE_DIFF}
        <div class="misconception-card">
          <h3>ما الذي لا يتغير؟</h3>
          <p>التوازي يبقى، وعلاقة الجداءين تبقى. الذي يتغير: عملية الشدة (طرح بدل جمع)، وجهة المحصلة (جهة الأكبر)، وموضع C (خارج القطعة لا بينها).</p>
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 6 — ص 68
   * ========================================================================= */
  {
    page: 68,
    unitTitle: UNIT_TITLE,
    title: 'تطبيق محلول: قوتان متعاكستان',
    stageTitle: 'تطبيق متعاكس',
    summary: 'نحل تطبيق الكتاب: 200 N و 300 N متعاكستان والبعد 60 cm، فنحصل على F = 100 N و d1 = 180 cm خارج القطعة.',
    objectives: [
      'يحسب شدة المحصلة بالطرح مع شرط F2 أكبر.',
      'يستخرج d1 من التناسب ويتحقق أنها أكبر من 60 cm.',
      'يكتب العناصر الأربعة ويربطها بالرسم.',
    ],
    blocks: [
      `<section class="content-card">
        <div class="card-badges">${bookBadge('تطبيق محلول · ص 68')}</div>
        <h2>ساق طويلة مهملة الكتلة</h2>
        <div class="problem-box">
          <p>ساق طويلة مهملة الكتلة تُحدَّد عليها النقطتان ${tex('A', 'A')} ، ${tex('B', 'B')} البعد بينهما ${qty(60, 'cm')} تؤثر في كل من النقطتين A ، B قوتان متوازيتان متعاكستان بالجهة شدتاهما ${tex('F_{1}=200\\,\\mathrm{N}', 'F one equals 200 newtons')} ، ${tex('F_{2}=300\\,\\mathrm{N}', 'F two equals 300 newtons')}. المطلوب:</p>
          <ol>
            <li>أحسب شدة محصلة القوتين.</li>
            <li>أكتب عناصر محصلة القوتين.</li>
            <li>أرسم كلاً من القوى ${tex('(F_{1},F_{2},F,d_{1})', 'F one, F two, F, d one')}.</li>
          </ol>
        </div>
        <div data-worked-stepper>
          <div class="worked-stepper-controls">
            <button type="button" class="l2-btn l2-btn-ghost" data-worked-prev>السابق</button>
            <button type="button" class="l2-btn l2-btn-check" data-worked-next>التالي</button>
          </div>
          <div class="worked-step-card" data-worked-step>
            <h5>1. شدة المحصلة</h5>
            <p>الجهتان متعاكستان و 300 N أكبر، فنطرح:</p>
            ${calculation('F=F_{2}-F_{1}=300-200=100\\,\\mathrm{N}', 'F equals 300 minus 200 equals 100 newtons')}
          </div>
          <div class="worked-step-card" data-worked-step>
            <h5>2. العناصر — الشدة والجهة والحامل</h5>
            <ul class="worked-elements-list">
              <li><strong>الحامل:</strong> يوازي حاملي القوتين.</li>
              <li><strong>الجهة:</strong> بجهة القوة الأكبر ${V_F2}.</li>
              <li><strong>الشدة:</strong> ${tex('F=100\\,\\mathrm{N}', 'F equals 100 newtons')}.</li>
            </ul>
          </div>
          <div class="worked-step-card" data-worked-step>
            <h5>نقطة التأثير وحساب d1</h5>
            <p>تقع على المستقيم الواصل بين نقطتي تأثير القوتين وخارج القطعة المستقيمة ومن جهة القوة الأكبر، وتحقق:</p>
            ${formula('\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}=\\dfrac{F}{d}', 'F one over d two equals F two over d one equals F over d')}
            ${formula('\\dfrac{F_{2}}{d_{1}}=\\dfrac{F}{d}', 'F two over d one equals F over d')}
            ${calculation('300/d_{1}=100/60\\;\\Rightarrow\\;d_{1}=180\\,\\mathrm{cm}', '300 over d one equals 100 over 60, so d one equals 180 centimeters')}
          </div>
          <div class="worked-step-card" data-worked-step>
            <h5>تحقق الوحدة والموضع</h5>
            <p>المسافة المعطاة بالسنتيمتر فظهرت d1 بالسنتيمتر. القيمة 180 cm أكبر من 60 cm، وهذا ينسجم مع وقوع C خارج القطعة. بعد القوة الأكبر عن C يساوي 180 − 60 = 120 cm، و:</p>
            ${calculation('200\\times 180=300\\times 120=36000\\,\\mathrm{N\\cdot cm}', '200 times 180 equals 300 times 120')}
          </div>
        </div>
        ${diagramFigure('worked-opposite', 'C يساراً خارج القطعة، ثم B ثم A. F بجهة F2 إلى أسفل، و d1 = CA = 180 cm.', bookBadge('رسم الحل ص 68'))}
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 7 — ص 69
   * ========================================================================= */
  {
    page: 69,
    unitTitle: UNIT_TITLE,
    title: 'تعلّمت',
    stageTitle: 'خلاصة الدرس',
    summary: 'نجمع تعريف القوى المتوازية وعناصر المحصلة في الحالتين، مع جدول مقارنة وأخطاء شائعة وخريطة قرار من نصوص الكتاب فقط.',
    objectives: [
      'يسترجع التعريف وعناصر الحالتين مع شرط F2 أكبر.',
      'يقارن الشدة والجهة والموضع بين الجهة الواحدة والتعاكس.',
      'يتجنب الأخطاء المستنتجة مباشرة من قواعد الكتاب.',
    ],
    blocks: [
      `<section class="content-card source-summary">
        <div class="card-badges">${bookBadge('تعلّمت · ص 69')}</div>
        <h2>تعلّمت</h2>
        <ul class="source-list">
          <li><strong>القوى المتوازية:</strong> هي القوى التي تكون حواملها مستقيمات متوازية.</li>
          <li><strong>عناصر محصلة قوتين متوازيتين بجهة واحدة، ${tex('F_{2}>F_{1}', 'F two greater than F one')}:</strong>
            <ul>
              <li>نقطة تأثيرها: تقع على القطعة المستقيمة ${tex('(AB)', 'A B')} الواصلة بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر ${V_F2} وتحقق العلاقة ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one d one equals F two d two')}.</li>
              <li>حاملها: يوازي حاملي القوتين ${V_F1} ، ${V_F2}.</li>
              <li>جهتها: بجهة القوتين ${V_F1} ، ${V_F2}.</li>
              <li>شدتها: حاصل جمع شدتي القوتين: ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')}.</li>
            </ul>
          </li>
          <li><strong>عناصر محصلة قوتين متوازيتين وبجهتين متعاكستين، ${tex('F_{2}>F_{1}', 'F two greater than F one')}:</strong>
            <ul>
              <li>نقطة تأثيرها: تقع على امتداد القطعة المستقيمة ${tex('(AB)', 'A B')} الواصلة بين نقطتي تأثير القوتين ومن جهة القوة الأكبر ${V_F2} وتحقق العلاقة ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one d one equals F two d two')}.</li>
              <li>حاملها: يوازي حاملي القوتين ${V_F1} ، ${V_F2}.</li>
              <li>جهتها: بجهة القوة الأكبر ${V_F2}.</li>
              <li>شدتها: حاصل طرح شدتي القوتين: ${tex('F=F_{2}-F_{1}', 'F equals F two minus F one')}.</li>
            </ul>
          </li>
        </ul>
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${enrichBadge('تنظيم استنتاج الكتاب')}</div>
        <h2>جدول مقارنة من قواعد الصفحتين 65 و 67</h2>
        ${diagramFigure('sense-comparison', 'اليسار: C بين القوتين. اليمين: C خارج القطعة من جهة الأكبر.', enrichBadge('مقارنة بصرية'))}
        <table class="l2-compare-table">
          <thead><tr><th>العنصر</th><th>جهة واحدة</th><th>جهتان متعاكستان</th></tr></thead>
          <tbody>
            <tr><th>الشدة</th><td>${tex('F=F_{1}+F_{2}', 'sum')}</td><td>${tex('F=F_{2}-F_{1}', 'difference')}</td></tr>
            <tr><th>الجهة</th><td>جهة القوتين</td><td>جهة الأكبر</td></tr>
            <tr><th>الحامل</th><td>يوازي الحاملين</td><td>يوازي الحاملين</td></tr>
            <tr><th>الموضع</th><td>على AB وأقرب إلى الأكبر</td><td>على امتداد AB من جهة الأكبر</td></tr>
            <tr><th>الجداءان</th><td>${tex('F_{1}d_{1}=F_{2}d_{2}', 'products equal')}</td><td>${tex('F_{1}d_{1}=F_{2}d_{2}', 'products equal')}</td></tr>
          </tbody>
        </table>
        <div class="misconception-grid">
          <article class="misconception-card"><h3>جمع المتعاكستين</h3><p>الجمع للجهة الواحدة فقط. التعاكس يطرح الأصغر من الأكبر.</p></article>
          <article class="misconception-card"><h3>وضع C بين القوتين دائماً</h3><p>بينهما في الجهة الواحدة، وخارج القطعة في التعاكس.</p></article>
          <article class="misconception-card"><h3>البعد الأكبر للأكبر</h3><p>العكس: الأكبر يقابله البعد الأصغر عن C.</p></article>
          <article class="misconception-card"><h3>خلط التوازي بالاتزان</h3><p>التوازي صفة الحوامل. الاتزان شرط التجربة لتعيين المحصلة.</p></article>
        </div>
        <div class="callout-box callout-tip">
          <h3>خريطة قرار سريعة</h3>
          <ol>
            <li>هل الحوامل مستقيمات متوازية؟ إن لا، فليست قوى هذا الدرس.</li>
            <li>هل الجهتان واحدة أم متعاكستان؟</li>
            <li>للجهة الواحدة اجمع، وللتعاكس اطرح الأصغر من الأكبر.</li>
            <li>جهة المحصلة: جهة القوتين أو جهة الأكبر.</li>
            <li>عيّن الموضع من تساوي الجداءين، ثم تحقق: بين القوتين أم خارج القطعة؟</li>
          </ol>
        </div>
      </section>`,
    ],
  },

  /* =========================================================================
   * المرحلة 8 — ص 70
   * ========================================================================= */
  {
    page: 70,
    unitTitle: UNIT_TITLE,
    title: 'أختبر نفسي',
    stageTitle: 'اختبر نفسي',
    summary: 'نحل أسئلة الكتاب في الصفحة 70 تفاعلياً: أربع فقرات اختيار من متعدد ومسألتان عدديتان، ثم تدريب موجز على القيم نفسها.',
    objectives: [
      'يختار علاقة الشدة المناسبة بعد تحديد الجهة.',
      'يحسب d2 وطول المسطرة في المسألة الأولى.',
      'يحسب F و d2 في المسألة الثانية ويحدد العناصر بالرسم.',
    ],
    blocks: [
      `<section class="content-card self-check-section">
        <div class="card-badges">${bookBadge('أختبر نفسي · السؤال الأول · ص 70')}</div>
        <h2>اختر الإجابة الصحيحة لكلّ مما يأتي</h2>
        <div class="exam-question" data-selfcheck-item="70-1">
          <p><strong>1.</strong> محصلة قوتين متوازيتين وبجهة واحدة تحسب بالعلاقة:</p>
          <div class="options-grid">
            ${renderChoice('a', tex('F=F_{1}+F_{2}', 'F equals F one plus F two'))}
            ${renderChoice('b', tex('F=F_{1}-F_{2}', 'F equals F one minus F two'))}
            ${renderChoice('c', tex('F=F_{1}\\times F_{2}', 'F equals F one times F two'))}
            ${renderChoice('d', tex('F=F_{1}\\div F_{2}', 'F equals F one divided by F two'))}
          </div>
        </div>
        <div class="exam-question" data-selfcheck-item="70-2">
          <p><strong>2.</strong> محصلة قوتين متوازيتين وبجهتين متعاكستين (حيث ${tex('F_{2}', 'F two')} أكبر من ${tex('F_{1}', 'F one')}) تحسب بالعلاقة:</p>
          <div class="options-grid">
            ${renderChoice('a', tex('F=F_{1}+F_{2}', 'sum'))}
            ${renderChoice('b', tex('F=F_{1}-F_{2}', 'F one minus F two'))}
            ${renderChoice('c', tex('F=F_{2}-F_{1}', 'F two minus F one'))}
            ${renderChoice('d', tex('F=F_{1}\\div F_{2}', 'division'))}
          </div>
        </div>
        <div class="exam-question" data-selfcheck-item="70-3">
          <p><strong>3.</strong> ${V_F1} ، ${V_F2} قوتان شاقوليتان وبجهة واحدة شدتاهما ${qty(3, 'N')} و ${qty(4, 'N')} فإن شدة محصلتهما ${tex('F', 'F')} تساوي:</p>
          <div class="options-grid">
            ${renderChoice('a', qty(1, 'N'))}
            ${renderChoice('b', qty(5, 'N'))}
            ${renderChoice('c', qty(7, 'N'))}
            ${renderChoice('d', qty(12, 'N'))}
          </div>
        </div>
        <div class="exam-question" data-selfcheck-item="70-4">
          <p><strong>4.</strong> ${V_F1} ، ${V_F2} قوتان شاقوليتان وبجهة واحدة، بُعدا حامليهما عن حامل المحصلة ${tex('d_{1},d_{2}', 'd one, d two')} على الترتيب، فالبعد بين حامليهما ${tex('d', 'd')} يُعطى بالعلاقة:</p>
          <div class="options-grid">
            ${renderChoice('a', tex('d=d_{1}+d_{2}', 'd equals d one plus d two'))}
            ${renderChoice('b', tex('d=d_{1}-d_{2}', 'd equals d one minus d two'))}
            ${renderChoice('c', tex('d=d_{1}\\times d_{2}', 'product'))}
            ${renderChoice('d', tex('d=d_{1}\\div d_{2}', 'quotient'))}
          </div>
        </div>
      </section>`,

      `<section class="content-card">
        <div class="card-badges">${bookBadge('السؤال الثاني · ص 70')}</div>
        <h2>حل المسألتين الآتيتين</h2>
        <p>قيم الكتاب ووحداتها كما هي. حل كل مطلب ثم تحقق. الرسم يظهر بعد المحاولة ليُقارن بعناصرك المكتوبة.</p>
        ${renderProblemWorkbenches()}
      </section>`,

      renderPracticeDeck(),
    ],
  },
];

export const LESSON_2_META = Object.freeze({
  unit: 'الوحدة الأولى — الحركة والقوى',
  lesson: 'الدرس 2 — القوى المتوازية',
  pages: '63–70',
});

export function pageTextBlocks(page) {
  return page.blocks.join('\n').replace(/<[^>]+>/g, ' ');
}
