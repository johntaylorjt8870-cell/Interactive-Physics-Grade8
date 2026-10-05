import {
  formula,
  ltrText,
  mathML,
  V_F1,
  V_F2,
  V_F3,
  V_F,
  V_W,
  V_R,
  V_OM,
  V_OX,
  V_OY,
  S_F2,
  S_F,
} from './math.js';

const O = mathML('<mi>O</mi>', 'O');
const M = mathML('<mi>M</mi>', 'M');
const X = mathML('<mi>x</mi>', 'x');
const Y = mathML('<mi>y</mi>', 'y');
const latinA = mathML('<mi mathvariant="italic">a</mi>', 'Latin lowercase a');

const textBlock = (html) => ({ type: 'book', html });
const platformBlock = (title, html, kind = 'note') => ({ type: 'platform', title, html, kind });
const diagramBlock = (id) => ({ type: 'diagram', id });
const simulationBlock = (id) => ({ type: 'simulation', id });

export const PYTHAGORAS_LINES = [
  'F = √(F₁² + F₂²)',
  'F = √((60)² + (80)²)',
  'F = 100 N',
];

const pythagorasBlock = () => {
  const f1Squared = `<msup><msub><mi>F</mi><mn>1</mn></msub><mn>2</mn></msup>`;
  const f2Squared = `<msup><msub><mi>F</mi><mn>2</mn></msub><mn>2</mn></msup>`;
  const sixtySquared = `<msup><mrow><mo>(</mo><mn>60</mn><mo>)</mo></mrow><mn>2</mn></msup>`;
  const eightySquared = `<msup><mrow><mo>(</mo><mn>80</mn><mo>)</mo></mrow><mn>2</mn></msup>`;
  const line1 = formula(`<mi>F</mi><mo>=</mo><msqrt><mrow>${f1Squared}<mo>+</mo>${f2Squared}</mrow></msqrt>`, PYTHAGORAS_LINES[0]);
  const line2 = formula(`<mi>F</mi><mo>=</mo><msqrt><mrow>${sixtySquared}<mo>+</mo>${eightySquared}</mrow></msqrt>`, PYTHAGORAS_LINES[1]);
  const line3 = formula('<mi>F</mi><mo>=</mo><mn>100</mn><mtext>&nbsp;N</mtext>', PYTHAGORAS_LINES[2]);
  return `<div class="formula-stack pythagoras-source-block" data-source-formula="pythagoras" role="group" aria-label="كتلة فيثاغورث المطبوعة من ثلاثة أسطر">${
    [line1, line2, line3].map((line, index) => `<div class="formula-line" data-source-line="${PYTHAGORAS_LINES[index]}">${line}</div>`).join('')
  }</div>`;
};

const forceResultEquation = (lhs, rhs, label) => mathML(`${lhs}<mo>=</mo>${rhs}`, label);

export const LESSON_PAGES = [
  {
    page: 55,
    navLabel: 'التمهيد والأهداف',
    heading: 'تمهيد الدرس',
    blocks: [
      textBlock(`
        <section class="source-title-block">
          <p class="source-unit-title">الوحدة الثانية — الحركة والقوى</p>
          <h3>القوى المتلاقية</h3>
        </section>
        <section class="source-section">
          <h4>الأهداف:</h4>
          <ul class="source-list objectives-list">
            <li>يتعرّف القوى المتلاقية.</li>
            <li>يوضّح بالرسم القوى المتلاقية.</li>
            <li>يحدّد عناصر محصلة قوتين متلاقيتين.</li>
            <li>يحلّل القوة إلى مركبتين متعامدتين.</li>
          </ul>
        </section>
        <section class="source-section keywords-section">
          <h4>الكلمات المفتاحية:</h4>
          <p>القوى المتلاقية – تحليل القوة.</p>
        </section>
      `),
      platformBlock(
        'موضع صورة الكتاب · الصفحة 55',
        `<div class="source-image-slot" role="group" aria-label="موضع صورة المظلي في الصفحة 55">
          <span class="slot-kicker">موضع الصورة الأصلية</span>
          <strong>المظلي بمظلته</strong>
          <p>ملف الصورة الأصلي غير موجود ضمن ملفات المشروع المتاحة؛ لم أستبدله بصورة غير مصدرية.</p>
        </div>`,
        'source-slot',
      ),
      textBlock(`
        <section class="source-section source-caption">
          <p>يستخدم المظليّ الذي يهبط من طائرة على ارتفاع ما من سطح الأرض مظلّةً من أجل الوصول إلى الأرض بسلامة وأمان.</p>
          <p>كيف يرتبط المظليّ بمظلّته؟ ما القوى المؤثّرة على المظليّ؟ أين تلتقي حبال المظلّة؟</p>
        </section>
      `),
    ],
  },
  {
    page: 56,
    navLabel: 'التعريف والتجربة',
    heading: 'تعريف القوى المتلاقية',
    blocks: [
      textBlock(`
        <section class="source-section">
          <h3>تعريف القوى المتلاقية:</h3>
          <h4>أجرّب وأستنتج:</h4>
          <h5>أدوات التجربة:</h5>
          <p class="source-apparatus-line"><span class="source-gap" title="شرح المنصة: بداية سطر الأدوات واسم اللوح غير محسومين في صورة المصدر"><strong>شرح المنصة:</strong> بداية سطر الأدوات/اسم اللوح غير محسوم في صورة المصدر</span> - جسم مزود بخطاف - خيوط ربط.</p>
        </section>
      `),
      platformBlock(
        'ملاحظة مصدرية',
        `<p>عبارة قائمة الأدوات واسم اللوح في الخطوة الثالثة غير واضحين بما يكفي للنسخ الحرفي من صورة الصفحة؛ لم أستبدل الكلمة الملتبسة بتخمين.</p>`,
      ),
      textBlock(`
        <section class="source-section">
          <h4>خطوات التجربة:</h4>
          <ol class="source-list experiment-list">
            <li>أعلّق جسماً في خطاف ربيعة، فيتأثر بقوة ثقله ${V_W}، ما حامل هذه القوة؟ وما جهتها؟</li>
            <li>أسمي القوة التي يشد بها نابض الربيعة الجسم قوة توتر النابض، هل ينطبق حاملها على حامل قوة الثقل؟ وما جهتها؟</li>
            <li>أربط خطافي ربيعتين بخيط باستخدام <span class="source-gap" title="شرح المنصة: هذا الموضع غير محسوم في صورة المصدر">〔عبارة اللوح غير محسومة في صورة المصدر〕</span>، وأعلّق خطاف الجسم بمنتصف الخيط كما في الشكل، هل لحاملي قوتي شد الربيعتين استقامة ذاتها؟</li>
            <li>هل يتغير حامل قوة ثقل الجسم في هذه الحالة عما كان عليه في الحالة الأولى؟</li>
            <li>أرسم على اللوح خطين على امتداد كل ربيعة وباتجاه نقطة تعليق الجسم بعد أن يتوازن، ثم أرسم خطاً منطبقاً على حامل قوة ثقل الجسم.</li>
            <li>أرفع الربيعتين والجسم، ماذا ألاحظ؟</li>
            <li>أين تلتقي الخطوط الممثلة لحوامل القوى الثلاث؟</li>
          </ol>
        </section>
        <section class="source-section source-conclusion">
          <h4>أستنتج:</h4>
          <p><strong>القوى المتلاقية:</strong> هي القوى التي تتلاقى حواملها في نقطة واحدة.</p>
        </section>
      `),
      diagramBlock('concurrent'),
      simulationBlock('spring-concurrency'),
    ],
  },
  {
    page: 57,
    navLabel: 'محصلة قوتين',
    heading: 'محصلة قوتين متلاقيتين',
    blocks: [
      textBlock(`
        <section class="source-section question-lead">
          <h4>أتساءل:</h4>
          <p>هل يمكن إيجاد محصلة عدة قوى متلاقية؟ وكيف يتم ذلك؟</p>
        </section>
        <section class="source-section">
          <h3>محصلة قوتين متلاقيتين:</h3>
          <p>في التجربة السابقة:</p>
          <ul class="source-list">
            <li>أرسم القوة ${V_F} التي تعاكس مباشرة قوة ثقل الجسم ${V_W}.</li>
            <li>أرسم هندسياً متوازي الأضلاع المنشأ على القوتين ${V_F1} و${V_F2}.</li>
            <li>أرسم قطر متوازي الأضلاع المار من نقطة تلاقي القوتين، وأقارن النتائج.</li>
            <li>أحدد عناصر ${V_F} محصلة القوتين السابقتين.</li>
          </ul>
        </section>
      `),
      diagramBlock('parallelogram'),
      textBlock(`
        <section class="source-section source-conclusion">
          <h4>أستنتج:</h4>
          <ul class="source-list conclusion-list">
            <li>قطر متوازي الأضلاع يمثل محصلة القوتين المتلاقيتين المار من نقطة تلاقيهما.</li>
            <li>محصلة قوتين متلاقيتين تقعان في مستوى واحد، هي قوة وحيدة.</li>
          </ul>
          <h5>عناصرها:</h5>
          <ul class="source-list definition-list">
            <li><strong>نقطة التأثير:</strong> نقطة تأثير القوتين ${O}.</li>
            <li><strong>الحامل:</strong> قطر متوازي الأضلاع ${V_OM} المنشأ على القوتين.</li>
            <li><strong>الجهة:</strong> من ${O} إلى الرأس المقابل ${M}.</li>
            <li><strong>الشدة:</strong> تمثل طول قطر متوازي الأضلاع.</li>
          </ul>
        </section>
      `),
      simulationBlock('concurrent'),
    ],
  },
  {
    page: 58,
    navLabel: 'التطبيق المحلول',
    heading: 'تطبيق محلول',
    blocks: [
      textBlock(`
        <section class="source-section worked-example">
          <h3>تطبيق محلول:</h3>
          <p>قوتان ${V_F2}، ${V_F1} متلاقيتان في النقطة ${O} بين حامليهما الزاوية ${ltrText('60°')} شدتهما: ${forceResultEquation('<msub><mi>F</mi><mn>2</mn></msub>', '<mn>3</mn><mtext>&nbsp;N</mtext>', 'F₂ = 3 N')}، ${forceResultEquation('<msub><mi>F</mi><mn>1</mn></msub>', '<mn>4</mn><mtext>&nbsp;N</mtext>', 'F₁ = 4 N')}.</p>
          <h4>المطلوب:</h4>
          <ol class="source-list">
            <li>أمثل القوتين بمقياس رسم مناسب (${ltrText('1 cm = 1 N')}).</li>
            <li>أحدد بالرسم والكتابة عناصر محصلة هاتين القوتين.</li>
          </ol>
          <h4>الحل:</h4>
          <p>أمثل القوتين بالرسم:</p>
          <ul class="source-list">
            <li>أرسم شعاع القوة الأولى بطول ${ltrText('4 cm')}، بدايته ${O}.</li>
            <li>أرسم من ${O} شعاع القوة الثانية بطول ${ltrText('3 cm')}، يصنع حاملها زاوية ${ltrText('60°')} مع حامل القوة الأولى.</li>
            <li>أكمل الشكل إلى متوازي أضلاع.</li>
            <li>أرسم القطر ${V_OM}.</li>
            <li>أقيس طول القطر ${V_OM}، أجده يساوي تقريباً ${ltrText('6 cm')}.</li>
            <li>أحسب قيمة شدة المحصلة حسب مقياس الرسم: ${forceResultEquation('<mi>F</mi>', '<mn>6</mn><mo>×</mo><mn>1</mn><mtext>&nbsp;=&nbsp;6&nbsp;N</mtext>', 'F = 6 × 1 = 6 N')}.</li>
          </ul>
          <h4>عناصر ${V_F} محصلة هاتين القوتين:</h4>
          <ul class="source-list definition-list">
            <li><strong>نقطة التأثير:</strong> نقطة تأثير القوتين ${O}.</li>
            <li><strong>الحامل:</strong> قطر متوازي الأضلاع ${V_OM} المنشأ على القوتين.</li>
            <li><strong>الجهة:</strong> من ${O} إلى الرأس المقابل ${M}.</li>
            <li><strong>الشدة:</strong> ${forceResultEquation('<mi>F</mi>', '<mn>6</mn><mtext>&nbsp;N</mtext>', 'F = 6 N')}.</li>
          </ul>
        </section>
      `),
      diagramBlock('oblique-example'),
      textBlock(`
        <section class="source-section worked-example perpendicular-example">
          <h3>عناصر محصلة قوتين متعامدتين:</h3>
          <p>قوتان ${V_F1}، ${V_F2} متلاقيتان متعامدتان تؤثران في النقطة ${O} شدتهما ${forceResultEquation('<msub><mi>F</mi><mn>1</mn></msub>', '<mn>60</mn><mtext>&nbsp;N</mtext>', 'F₁ = 60 N')}، ${forceResultEquation('<msub><mi>F</mi><mn>2</mn></msub>', '<mn>80</mn><mtext>&nbsp;N</mtext>', 'F₂ = 80 N')}.</p>
          <h4>المطلوب:</h4>
          <ol class="source-list">
            <li>أمثل القوتين (${V_F1}، ${V_F2}) بمقياس رسم مناسب.</li>
            <li>أحسب شدة محصلة هاتين القوتين.</li>
            <li>حدد بالكتابة عناصر محصلة هاتين القوتين.</li>
          </ol>
        </section>
      `),
    ],
  },
  {
    page: 59,
    navLabel: 'التعامد وتحليل القوة',
    heading: 'محصلة قوتين متعامدتين وتحليل القوة',
    blocks: [
      textBlock(`
        <section class="source-section worked-example">
          <h3>الحل:</h3>
          <ol class="source-list solution-steps">
            <li>أختار مقياس رسم مناسب كل ${ltrText('1 cm')} يمثل ${ltrText('20 N')}.<br />ثم أرسم القوة الأولى بشعاع طوله ${ltrText('3 cm')}، وأرسم القوة الثانية بشعاع طوله ${ltrText('4 cm')}.</li>
            <li>أحسب شدة محصلة القوتين:
              <p>لإيجاد المحصلة أكمل الشكل إلى مستطيل ثم أرسم القطر المار من النقطة ${O} وليكن ${V_OM}.</p>
              <p>بقياس طول القطر ${V_OM} أجده مساوياً ${ltrText('5 cm')} وبحسب مقياس الرسم تكون شدة المحصلة:</p>
              <div class="formula-stack scale-result-stack" role="group" aria-label="حساب شدة المحصلة بمقياس الرسم">
                <div class="formula-line">${forceResultEquation('<mi>F</mi>', '<mn>5</mn><mo>×</mo><mn>20</mn>', 'F = 5 × 20')}</div>
                <div class="formula-line">${forceResultEquation('<mi>F</mi>', '<mn>100</mn><mtext>&nbsp;N</mtext>', 'F = 100 N')}</div>
              </div>
              <p>ويمكن أن نحسب شدة المحصلة لقوتين متعامدتين بتطبيق قانون فيثاغورث في المثلث القائم:</p>
              ${pythagorasBlock()}
            </li>
            <li>عناصر ${V_F} محصلة القوتين المتعامدتين السابقتين:
              <ul class="source-list definition-list">
                <li><strong>نقطة التأثير:</strong> النقطة المشتركة بين القوتين ${O}.</li>
                <li><strong>الحامل:</strong> قطر المستطيل ${V_OM} المنشأ على القوتين.</li>
                <li><strong>الجهة:</strong> من ${O} إلى الرأس المقابل ${M}.</li>
                <li><strong>الشدة:</strong> ${forceResultEquation('<mi>F</mi>', '<mn>100</mn><mtext>&nbsp;N</mtext>', 'F = 100 N')}.</li>
              </ul>
            </li>
          </ol>
        </section>
        <aside class="source-side-note">
          <span class="side-note-title">الفيزياء والرياضيات</span>
          <strong>نظرية فيثاغورث:</strong>
          <p>في المثلث القائم مربع الوتر يساوي مجموع مربعي الضلعين القائمين.</p>
        </aside>
      `),
      diagramBlock('right-angle-resultant'),
      textBlock(`
        <section class="source-section">
          <h3>تحليل القوة إلى مركبتين متعامدتين:</h3>
          <p>لإيجاد محصلة القوة ${V_F} محصلة قوتين متعامدتين (${V_F2}، ${V_F1}) نكمل الشكل إلى مستطيل ونرسم قطره المنشأ على القوتين والمار من نقطة التأثير ذاتها فيكون هذا القطر هو الممثل لمحصلة القوتين ${V_F}.</p>
        </section>
      `),
      diagramBlock('components-xy'),
      simulationBlock('perpendicular'),
    ],
  },
  {
    page: 60,
    navLabel: 'التحليل والنشاط',
    heading: 'تحليل القوة إلى مركبتين متعامدتين',
    blocks: [
      textBlock(`
        <section class="source-section question-lead">
          <h4>أتساءل:</h4>
          <p>هل يمكن تحليل القوة ${V_F} إلى مركبتين متعامدتين (${V_F1}، ${V_F2}) وكيف يتم ذلك؟</p>
        </section>
        <section class="source-section">
          <h3>أجرّب وأستنتج:</h3>
          <h4>خطوات التجربة:</h4>
          <ol class="source-list experiment-list">
            <li>أحدد ${O} نقطة على لوح الرقائقي.</li>
            <li>أرسم منها شعاع القوة ${V_F} ليكن الشعاع ${V_OM}.</li>
            <li>أرسم من ${O} محورين متعامدين ${V_OX} و${V_OY} يمثلان حاملي القوتين ${V_F1}، ${V_F2}.</li>
            <li>أرسم من النقطة ${M} عمودين على هذين المحورين (مرسمي النقطة).</li>
            <li>يتشكل مستطيل قطراه المار من النقطة ${O} يمثل المحصلة ${V_F}.</li>
            <li>المساقط على المحورين ${V_OX}، ${V_OY} يمثلان المركبتين ${V_F1}، ${V_F2}.</li>
          </ol>
        </section>
        <section class="source-section source-conclusion">
          <h4>أستنتج:</h4>
          <ul class="source-list conclusion-list">
            <li>يمكن الاستعاضة عن القوة ${V_F} بقوتين متعامدتين ${V_F1}، ${V_F2} تقومان مقامها تسميان مركبتيها.</li>
            <li>عملية تحليل القوة إلى مركبتين متعامدتين عملية معاكسة لعملية إيجاد محصلة قوتين متعامدتين.</li>
          </ul>
        </section>
      `),
      textBlock(`
        <section class="source-section activity-section">
          <h3>نشاط:</h3>
          <p>إذا وضع جسم صلب فوق مستوى مائل أملس يميل عن الأفق بزاوية، والمطلوب:</p>
          <ol class="source-list">
            <li>أحدد بالرسم القوى المؤثرة عليه.</li>
            <li>أحلل قوة ثقله إلى مركبتين متعامدتين، ما الشكل الذي أحصل عليه؟</li>
          </ol>
        </section>
      `),
      platformBlock(
        'مرجع شكل النشاط · الصفحة 60',
        `<div class="reference-treatment">
          <span class="reference-mark" aria-hidden="true">مرجع شكلي</span>
          <p>المستوى المائل والجسم والأسهم الصغيرة تُراجع في رسم الكتاب الأصلي. لم أعد رسم اتجاهات أو تسميات غير واضحة.</p>
          <p class="reference-symbol">الرمز المقروء في الشكل: ${V_R}. اتجاهه الهندسي يُراجع في الرسم الأصلي.</p>
          <p class="angle-reference">رمز الزاوية المطبوع في الشكل: ${latinA}</p>
        </div>`,
        'source-slot',
      ),
      simulationBlock('force-resolution'),
    ],
  },
  {
    page: 61,
    navLabel: 'التلخيص والسؤالان 1–2',
    heading: 'تعلّم وأختبر نفسي',
    blocks: [
      textBlock(`
        <section class="source-section summary-section">
          <h3>تعلّم:</h3>
          <ul class="source-list summary-list">
            <li><strong>القوى المتلاقية:</strong> هي القوى التي تتلاقى حواملها في نقطة واحدة.</li>
            <li>
              <strong>عناصر محصلة قوتين متلاقيتين تقعان في مستوى واحد:</strong>
              <ul class="source-list definition-list">
                <li><strong>نقطة التأثير:</strong> نقطة تأثير القوتين ${O}.</li>
                <li><strong>الحامل:</strong> قطر متوازي الأضلاع ${V_OM} المنشأ على القوتين والمار من نقطة التأثير المشتركة.</li>
                <li><strong>الجهة:</strong> من ${O} إلى الرأس المقابل ${M}.</li>
                <li><strong>الشدة:</strong> تمثل طول قطر متوازي الأضلاع.</li>
              </ul>
            </li>
            <li>
              <strong>عناصر محصلة قوتين متعامدتين:</strong>
              <ul class="source-list definition-list">
                <li><strong>نقطة التأثير:</strong> النقطة المشتركة للقوتين ${O}.</li>
                <li><strong>الحامل:</strong> قطر المستطيل ${V_OM} المنشأ على القوتين.</li>
                <li><strong>الجهة:</strong> من ${O} إلى الرأس المقابل ${M}.</li>
                <li><strong>الشدة:</strong> تحسب من العلاقة: ${formula(`<mi>F</mi><mo>=</mo><msqrt><mrow><msup><msub><mi>F</mi><mn>1</mn></msub><mn>2</mn></msup><mo>+</mo><msup><msub><mi>F</mi><mn>2</mn></msub><mn>2</mn></msup></mrow></msqrt>`, 'F = √(F₁² + F₂²)')} أو من الرسم.</li>
              </ul>
            </li>
            <li>
              <strong>تحليل قوة إلى مركبتين متعامدتين:</strong>
              <ul class="source-list definition-list">
                <li>عملية تحليل القوة إلى مركبتين متعامدتين عملية معاكسة لعملية إيجاد محصلة قوتين متعامدتين.</li>
                <li>يمكن الاستعاضة عن القوة ${V_F} بقوتين متعامدتين ${V_F1}، ${V_F2} تقومان مقامها تسميان مركبتيها.</li>
              </ul>
            </li>
          </ul>
        </section>
      `),
      diagramBlock('parallelogram'),
      textBlock(`
        <section class="source-section self-check-section">
          <h3>أختبر نفسي:</h3>
          <h4>السؤال الأول:</h4>
          <p>اختر الإجابة الصحيحة لكل مما يأتي، وانقلها إلى دفترك:</p>
          <ol class="source-list question-list">
            <li class="question-item">
              <p>${V_F1}، ${V_F2} قوتان متلاقيتان مختلفتان شدة، بينهما زاوية حادة، حامل محصلتهما هو قطر لشكل هندسي رباعي ينشأ على حاملي هاتين القوتين ويمر من نقطة تلاقيهما، وهذا الشكل هو:</p>
              <ol class="option-list" type="a"><li>مربع.</li><li>مستطيل.</li><li>معين.</li><li>متوازي أضلاع.</li></ol>
            </li>
            <li class="question-item">
              <p>${V_F1}، ${V_F2} قوتان متعامدتان متلاقيتان مختلفتان شدة، حامل محصلتهما هو قطر لشكل هندسي رباعي ينشأ على حاملي هاتين القوتين ويمر من نقطة تلاقيهما، وهذا الشكل هو:</p>
              <ol class="option-list" type="a"><li>مربع.</li><li>مستطيل.</li><li>معين.</li><li>متوازي أضلاع.</li></ol>
            </li>
          </ol>
        </section>
      `),
    ],
  },
  {
    page: 62,
    navLabel: 'بقية الأسئلة والمسائل',
    heading: 'أختبر نفسي · تابع',
    blocks: [
      textBlock(`
        <section class="source-section self-check-section continuation-section">
          <h3>السؤال الأول:</h3>
          <ol class="source-list question-list" start="3">
            <li class="question-item">
              <p>${V_F1}، ${V_F2} قوتان متعامدتان متلاقيتان متساويتان شدة، حامل محصلتهما هو قطر لشكل هندسي رباعي ينشأ على حاملي هاتين القوتين ويمر من نقطة تلاقيهما، وهذا الشكل هو:</p>
              <ol class="option-list" type="a"><li>مربع.</li><li>مستطيل.</li><li>معين.</li><li>متوازي أضلاع.</li></ol>
            </li>
            <li class="question-item">
              <p>قوتان ${V_F1}، ${V_F2} متلاقيتان متعامدتان شدتهما ${ltrText('12 N')}، ${ltrText('16 N')} تؤثران في نقطة ${O} من جسم صلب شدة محصلتهما ${S_F} مساوية:</p>
              <ol class="option-list" type="a">
                <li>${forceResultEquation('<mi>F</mi>', '<mn>4</mn><mtext>&nbsp;N</mtext>', 'F = 4 N')}.</li>
                <li>${forceResultEquation('<mi>F</mi>', '<mn>20</mn><mtext>&nbsp;N</mtext>', 'F = 20 N')}.</li>
                <li>${forceResultEquation('<mi>F</mi>', '<mn>28</mn><mtext>&nbsp;N</mtext>', 'F = 28 N')}.</li>
                <li>${forceResultEquation('<mi>F</mi>', '<mn>192</mn><mtext>&nbsp;N</mtext>', 'F = 192 N')}.</li>
              </ol>
            </li>
            <li class="question-item">
              <p>قوتان متعامدتان تؤثران في نقطة ${O} من جسم صلب شدة محصلتهما ${forceResultEquation('<mi>F</mi>', '<mn>50</mn><mtext>&nbsp;N</mtext>', 'F = 50 N')} شدة القوة الأولى ${forceResultEquation('<msub><mi>F</mi><mn>1</mn></msub>', '<mn>40</mn><mtext>&nbsp;N</mtext>', 'F₁ = 40 N')} فتكون شدة القوة الثانية ${S_F2} مساوية:</p>
              <ol class="option-list" type="a">
                <li>${forceResultEquation('<msub><mi>F</mi><mn>2</mn></msub>', '<mn>90</mn><mtext>&nbsp;N</mtext>', 'F₂ = 90 N')}.</li>
                <li>${forceResultEquation('<msub><mi>F</mi><mn>2</mn></msub>', '<mn>30</mn><mtext>&nbsp;N</mtext>', 'F₂ = 30 N')}.</li>
                <li>${forceResultEquation('<msub><mi>F</mi><mn>2</mn></msub>', '<mn>2000</mn><mtext>&nbsp;N</mtext>', 'F₂ = 2000 N')}.</li>
                <li>${forceResultEquation('<msub><mi>F</mi><mn>2</mn></msub>', '<mn>10</mn><mtext>&nbsp;N</mtext>', 'F₂ = 10 N')}.</li>
              </ol>
            </li>
            <li class="question-item">
              <p>قوتان ${V_F1}، ${V_F2} متلاقيتان متعامدتان مختلفتان شدة، تؤثران في نقطة ${O} من جسم صلب، فإن شدة محصلتهما تحسب من العلاقة:</p>
              <ol class="option-list" type="a">
                <li>${forceResultEquation('<mi>F</mi>', '<msub><mi>F</mi><mn>1</mn></msub><mo>+</mo><msub><mi>F</mi><mn>2</mn></msub>', 'F = F₁ + F₂')}.</li>
                <li>${forceResultEquation('<mi>F</mi>', '<msub><mi>F</mi><mn>1</mn></msub><mo>−</mo><msub><mi>F</mi><mn>2</mn></msub>', 'F = F₁ − F₂')}.</li>
                <li>${formula(`<mi>F</mi><mo>=</mo><msqrt><mrow><msup><msub><mi>F</mi><mn>1</mn></msub><mn>2</mn></msup><mo>+</mo><msup><msub><mi>F</mi><mn>2</mn></msub><mn>2</mn></msup></mrow></msqrt>`, 'F = √(F₁² + F₂²')}.</li>
                <li>${forceResultEquation('<mi>F</mi>', '<msup><msub><mi>F</mi><mn>1</mn></msub><mn>2</mn></msup><mo>+</mo><msup><msub><mi>F</mi><mn>2</mn></msub><mn>2</mn></msup>', 'F = F₁² + F₂²')}.</li>
              </ol>
            </li>
          </ol>
        </section>
        <section class="source-section textbook-problems">
          <h3>السؤال الثاني:</h3>
          <p>حل المسألتين الآتيتين:</p>
          <h4>المسألة الأولى:</h4>
          <p>تؤثر قوتان متعامدتان ${V_F1}، ${V_F2} في نقطة (${O}) من جسم صلب، شدة القوة الثانية ${ltrText('12 N')} وشدة محصلتهما ${ltrText('15 N')}، المطلوب:</p>
          <ol class="source-list problem-list">
            <li>احسب شدة القوة الأولى ${V_F1}.</li>
            <li>حدد بالكتابة عناصر محصلة هاتين القوتين.</li>
            <li>ما قوة ${V_F} التي أثرت في النقطة ${O} إذا جعلت الجسم متوازناً، ثم اكتب عناصرها.</li>
            <li>مثل بمقياس رسم مناسب كلا من القوى <span class="notation-set" dir="ltr" aria-label="F one, F two, F, F three">{${V_F1}, ${V_F2}, ${V_F}, ${V_F3}}</span>.</li>
          </ol>
          <h4>المسألة الثانية:</h4>
          <p>يحمل شخصان حقيبة بواسطة حبلين بينهما زاوية ${ltrText('90°')} شدة قوة الأول ${ltrText('30 N')} وشدة قوة الثاني ${ltrText('40 N')}.</p>
          <h5>المطلوب:</h5>
          <ol class="source-list problem-list">
            <li>احسب شدة محصلة هاتين القوتين.</li>
            <li>حدد بالكتابة عناصر محصلة هاتين القوتين.</li>
            <li>مثل هاتين القوتين بمقياس رسم مناسب.</li>
          </ol>
        </section>
      `),
    ],
  },
];

export function pageTextBlocks(page) {
  return page.blocks.filter((block) => block.type === 'book').map((block) => block.html).join('\n');
}
