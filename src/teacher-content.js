import { LESSON_PAGES, pageTextBlocks } from './lesson-content.js';
import {
  formula,
  ltrText,
  mathML,
  V_F,
  V_F1,
  V_F2,
  V_F3,
  V_OM,
  V_OX,
  V_OY,
  V_W,
} from './math.js';
const sourcePage = (pageNumber) => LESSON_PAGES.find((page) => page.page === pageNumber);
const sourceDisclosure = (pageNumber) => {
  const page = sourcePage(pageNumber);
  if (!page) throw new RangeError(`No source text registered for p${pageNumber}.`);
  return `<details class="teacher-source-details" data-source-page="p${pageNumber}">
    <summary>محتوى الكتاب الأصلي · p${pageNumber}</summary>
    <div class="teacher-source-body"><div class="book-copy">${pageTextBlocks(page)}</div></div>
  </details>`;
};

const teacherExplanation = (pageNumber, content) => `<details class="teacher-explanation" data-teacher-explanation="p${pageNumber}">
  <summary>شرح المعلم</summary>
  <div class="teacher-explanation-body">${content}</div>
</details>`;

const subheading = (title, pageNumber, headingId = '') => `<div class="teacher-section-heading">
  <div><p class="teacher-section-kicker">شرح المعلم · الصفحات ${pageNumber}</p><h3${headingId ? ` id="${headingId}"` : ''}>${title}</h3></div>
  <span class="teacher-page-ref" dir="ltr">p${pageNumber}</span>
</div>`;
const formulaBox = (body, label, caption = '') => `<div class="teacher-formula">${formula(body, label)}</div>${caption ? `<p class="teacher-formula-caption">${caption}</p>` : ''}`;
const scalarSquare = (value) => `<msup><mn>${value}</mn><mn>2</mn></msup>`;
const arrow = (letter) => `<mover accent="true"><mi>${letter}</mi><mo stretchy="true">→</mo></mover>`;
const arrowSub = (letter, subscript) => `<msub>${arrow(letter)}<mn>${subscript}</mn></msub>`;
const mathDegrees = (degrees) => `<mn>${degrees}</mn><mo>°</mo>`;
const ltr = (text, label = text) => ltrText(text, label);

const p58AnalyticCheck = formulaBox(
  `<mi>F</mi><mo>=</mo><msqrt><mrow>${scalarSquare(4)}<mo>+</mo>${scalarSquare(3)}<mo>+</mo><mn>2</mn><mo>×</mo><mn>4</mn><mo>×</mo><mn>3</mn><mo>×</mo><mi>cos</mi><mo>(</mo>${mathDegrees(60)}<mo>)</mo></mrow></msqrt><mo>=</mo><msqrt><mn>37</mn></msqrt><mo>≈</mo><mn>6.08</mn><mtext>&nbsp;N</mtext>`,
  'Teacher-only check: F = square root of 4 squared plus 3 squared plus 2 times 4 times 3 times cosine 60 degrees, approximately 6.08 newtons',
  'تحقق رياضي إضافي للمعلم؛ لا يحل محل القياس والنتيجة المطبوعة في p58.',
);

const p59Arithmetic = formulaBox(
  `<mi>F</mi><mo>=</mo><msqrt><mrow>${scalarSquare(60)}<mo>+</mo>${scalarSquare(80)}</mrow></msqrt><mo>=</mo><msqrt><mn>10000</mn></msqrt><mo>=</mo><mn>100</mn><mtext>&nbsp;N</mtext>`,
  'Teacher arithmetic: F = square root of 60 squared plus 80 squared = square root of 10000 = 100 newtons',
  'حساب المعلم الموسّع، منفصل عن كتلة فيثاغورث المطبوعة ذات الأسطر الثلاثة أدناه في محتوى الكتاب · p59.',
);

const p62F1Calculation = formulaBox(
  `<msub><mi>F</mi><mn>1</mn></msub><mo>=</mo><msqrt><mrow>${scalarSquare(15)}<mo>−</mo>${scalarSquare(12)}</mrow></msqrt><mo>=</mo><msqrt><mn>81</mn></msqrt><mo>=</mo><mn>9</mn><mtext>&nbsp;N</mtext>`,
  'F one equals square root of 15 squared minus 12 squared equals 9 newtons',
);

const p62ResultDirection = formulaBox(
  `<mi>arctan</mi><mo>(</mo><mn>12</mn><mo>/</mo><mn>9</mn><mo>)</mo><mo>≈</mo><mn>53.1</mn><mo>°</mo>`,
  'arctangent of 12 divided by 9 is approximately 53.1 degrees',
  'زاوية مشتقة من جهة القوة 9 N نحو جهة القوة 12 N؛ لا تحدد اتجاهاً مطلقاً على الصفحة.',
);

const p62TwelveSixteen = formulaBox(
  `<mi>F</mi><mo>=</mo><msqrt><mrow>${scalarSquare(12)}<mo>+</mo>${scalarSquare(16)}</mrow></msqrt><mo>=</mo><msqrt><mn>400</mn></msqrt><mo>=</mo><mn>20</mn><mtext>&nbsp;N</mtext>`,
  'F equals square root of 12 squared plus 16 squared equals 20 newtons',
);

const p62SecondMc = formulaBox(
  `<msub><mi>F</mi><mn>2</mn></msub><mo>=</mo><msqrt><mrow>${scalarSquare(50)}<mo>−</mo>${scalarSquare(40)}</mrow></msqrt><mo>=</mo><msqrt><mn>900</mn></msqrt><mo>=</mo><mn>30</mn><mtext>&nbsp;N</mtext>`,
  'F two equals square root of 50 squared minus 40 squared equals 30 newtons',
);

const p62BagResult = mathML(
  `<mi>F</mi><mo>=</mo><msqrt><mrow>${scalarSquare(30)}<mo>+</mo>${scalarSquare(40)}</mrow></msqrt><mo>=</mo><msqrt><mn>2500</mn></msqrt><mo>=</mo><mn>50</mn><mtext>&nbsp;N</mtext>`,
  'F equals square root of 30 squared plus 40 squared equals 50 newtons',
);

const p62BagAngle = mathML(
  `<mi>arctan</mi><mo>(</mo><mn>40</mn><mo>/</mo><mn>30</mn><mo>)</mo><mo>≈</mo><mn>53.1</mn><mo>°</mo>`,
  'arctangent of 40 divided by 30 is approximately 53.1 degrees',
);

const p60Components = formulaBox(
  `<msub><mi>W</mi><mtext>∥</mtext></msub><mo>=</mo><mi>W</mi><mi>sin</mi><mi mathvariant="italic">a</mi><mo>;</mo><mspace width="1em"/><msub><mi>W</mi><mo>⊥</mo></msub><mo>=</mo><mi>W</mi><mi>cos</mi><mi mathvariant="italic">a</mi>`,
  'If Latin lowercase a is the incline angle from the horizontal, W parallel equals W sine a and W perpendicular equals W cosine a',
  'علاقة تعليمية عامة لمقداري مركبتي الثقل، بشرط أن تكون a هي زاوية ميل المستوى عن الأفق كما يذكر النص؛ ليست قراءةً لاتجاه سهم أو تسمية غير واضحة في الشكل.',
);

const p60FigureReference = sourcePage(60).blocks.find((block) => block.type === 'platform' && block.title.includes('الصفحة 60'));

function renderOverview() {
  return `<section class="teacher-section" id="teacher-overview" aria-labelledby="teacher-overview-heading">
    ${subheading('نظرة عامة وأهداف الدرس', '55')}
    <div class="teacher-subsection" data-page-reference="p55">
      <h4 id="teacher-overview-heading">الأهداف التعليمية · المصدر p55</h4>
      <ul class="teacher-objectives">
        <li>يتعرّف القوى المتلاقية.</li>
        <li>يوضّح بالرسم القوى المتلاقية.</li>
        <li>يحدّد عناصر محصلة قوتين متلاقيتين.</li>
        <li>يحلّل القوة إلى مركبتين متعامدتين.</li>
      </ul>
      <h4>الكلمات المفتاحية · المصدر p55</h4>
      <p class="teacher-keyword-line">القوى المتلاقية – تحليل القوة.</p>
      <p class="teacher-section-endnote">الأهداف والكلمات المفتاحية أعلاه منقولة كما وردت في المصدر؛ الشروح والحلول الإضافية معنونة بوضوح بـ «شرح المعلم».</p>
    </div>
  </section>`;
}

function renderActivities() {
  return `<section class="teacher-section" id="teacher-activities" aria-labelledby="teacher-activities-heading">
    ${subheading('مدخل الدرس والأنشطة والاستنتاجات', '55–60', 'teacher-activities-heading')}
    <article class="teacher-subsection" id="teacher-p55" data-page-reference="p55">
      <h4>مدخل المظلي · p55</h4>
      ${teacherExplanation(55, `
        <p>استخدم أسئلة الكتاب لربط الدرس بقوى تؤثر في جسم واحد، مع إظهار ما يثبته النص وما يتطلب الرجوع إلى الصورة الأصلية.</p>
        <ul>
          <li><strong>الارتباط:</strong> يذكر النص حبال المظلة ويسأل عن اتصالها بالمظلي؛ يمكن توضيح فكرة حبال التعليق والاتصال بالمظلي، لكن صورة الصفحة غير متاحة في المشروع، لذلك لا نحدد عدد الحبال أو عقدة اجتماعها أو موضعها الدقيق من النص وحده.</li>
          <li><strong>القوى:</strong> ثقل المظلي يتجه رأسياً إلى أسفل، وتؤثر قوى شد الحبال على امتداد الحبال وفي اتجاه السحب. لا تتوفر في النص قياسات أو اتجاهات مرسومة تسمح بتعيين محصلة عددية أو مقدار كل شد.</li>
          <li><strong>إدارة الإجابة:</strong> اعرض شكل الكتاب الأصلي عند توافره لقبول وصف موضع اتصال الحبال؛ لا تستبدل غياب الصورة بتخمين هندسي أو صورة غير مصدرية.</li>
        </ul>
        <div class="teacher-limit"><strong>حدّ المصدر:</strong> موضع التقاء الحبال تفصيلاً غير محسوم هنا من دون صورة p55؛ تُترك الإجابة المكانية للصورة الأصلية.</div>
      `)}
      ${sourceDisclosure(55)}
    </article>

    <article class="teacher-subsection" id="teacher-p56" data-page-reference="p56">
      <h4>تجربة الربيعتين وحوامل القوى · p56</h4>
      ${teacherExplanation(56, `
        <p>وجّه الطلاب إلى التمييز بين <strong>شعاع القوة</strong> (مقداره وجهته) و<strong>حاملها</strong> (الخط الممتد في اتجاهها). يصف النص تعليق جسم بربيعة، ثم استعمال ربيعتين وخيط لرسم الحوامل.</p>
        <ol>
          <li><strong>الثقل:</strong> ارسم ${V_W} عمودياً إلى أسفل من نقطة تأثيره على الجسم؛ حامله رأسي وجهته نحو الأرض.</li>
          <li><strong>ربيعة واحدة:</strong> قوة توتر الربيعة على امتدادها. إذا كان الجسم ساكناً والربيعة رأسية، تتطابق حاملة التوتر مع حاملة الثقل وتتعاكس الجهتان؛ اربط هذا الحكم بشرط السكون/القراءة الثابتة.</li>
          <li><strong>ربيعتان:</strong> عند نقطة تعليق الجسم، يلتقي حامل الشد الأول والثاني بحامل الثقل في نقطة الجسم. لا يلزم أن يكون حاملا الشدين على استقامة واحدة معاً؛ المقصود أن امتداد الخطوط يمر بنقطة مشتركة.</li>
          <li><strong>مقارنة الثقل:</strong> يبقى اتجاه الثقل رأسياً إلى أسفل. وحامله في كل وضع هو الخط الرأسي المار بنقطة الجسم في ذلك الوضع؛ قد يتغير موضع الخط في المكان إذا تحرك الجسم.</li>
          <li><strong>الأثر على اللوح:</strong> مدّ الخطين على امتداد الربيعتين وباتجاه نقطة التعليق، وارسم حامل الثقل، ثم ارفع الجهاز. تبقى الخطوط المرسومة أثراً هندسياً للحوامل لا قوى فعلية بعد إزالة الجسم.</li>
          <li><strong>الاستنتاج:</strong> الخطوط الثلاثة تلتقي عند نقطة تعليق الجسم في الرسم المقصود. تعرّف القوى المتلاقية بأن حواملها تلتقي في نقطة واحدة؛ التلاقي وحده لا يثبت الاتزان.</li>
        </ol>
        <div class="teacher-source-note"><strong>تنبيه مصدر p56:</strong> عبارة خطوة ربط الربيعتين بالخيط غير محسومة في صورة المصدر؛ أبقها كما هي في النص ولا تخمّن كلماتها أو شكل اللوح. كما أن رسم الحوامل لا يعطي مقادير الشد.</div>
      `)}
      ${sourceDisclosure(56)}
    </article>

    <article class="teacher-subsection" id="teacher-p57" data-page-reference="p57">
      <h4>محصلة قوتين متلاقيتين · p57</h4>
      ${teacherExplanation(57, `
        <p>ابنِ متوازي الأضلاع على شعاعي ${V_F1} و${V_F2} من نقطة التأثير المشتركة. القطر المرسوم من تلك النقطة هو شعاع المحصلة، لا مجموعاً حسابياً لمقداري القوتين:</p>
        ${formulaBox(`${arrow('F')}<mo>=</mo>${arrowSub('F', '1')}<mo>+</mo>${arrowSub('F', '2')}`, 'Vector F equals vector F one plus vector F two')}
        <ul>
          <li><strong>نقطة التأثير:</strong> نقطة التقاء القوتين (O في الرسم النموذجي).</li>
          <li><strong>الحامل:</strong> خط القطر المار من O، المنشأ على القوتين.</li>
          <li><strong>الجهة:</strong> من O إلى الرأس المقابل للمتوازي.</li>
          <li><strong>الشدة:</strong> تستنتج من طول القطر وفق مقياس رسم معلوم؛ p57 لا يقدّم مقادير أو زاوية عددية كافية لحساب قيمة عددية.</li>
        </ul>
        <p>في تجربة الجسم الساكن، تكون قوة الموازنة معاكسة لمحصلة الشدين؛ إذا كان الجسم متزناً بالفعل، تقابل محصلة الشدين قوة الثقل مقداراً وتعاكسها اتجاهاً. هذه نتيجة شرط الاتزان، وليست كمية تحسبها محاكاة تلاقي الحوامل.</p>
        ${formulaBox(`<msub>${arrow('F')}<mtext>balance</mtext></msub><mo>=</mo><mo>−</mo><msub>${arrow('F')}<mtext>resultant</mtext></msub>`, 'The balancing force vector is opposite to the resultant force vector', 'الرمزان السفليان للتوضيح من المعلم فقط؛ يستخدم النص الأصلي F للمحصلة ولا يحدد الرمز R هنا.')}
        <div class="teacher-limit"><strong>حدّ المصدر:</strong> لا تُعطَ قيمة عددية للمحصلة من p57 وحدها؛ لا تُختلق قيمة للقوتين أو زاوية بينهما.</div>
      `)}
      ${sourceDisclosure(57)}
    </article>

    <article class="teacher-subsection" id="teacher-p60-resolution" data-page-reference="p60">
      <h4>نشاط تحليل القوة إلى مركبتين متعامدتين · p60</h4>
      ${teacherExplanation(60, `
        <p>ابدأ بقوة واحدة ${V_OM} عند O، وارسم من النقطة نفسها محورين متعامدين ${V_OX} و${V_OY}. أسقط من رأس القوة عموداً على كل محور؛ المسقطان هما مركبتا القوة. جمع المركبتين متجهياً يعيد القوة الأصلية:</p>
        <div class="teacher-formula">${formula(`<mover accent="true"><mrow><mi>O</mi><mi>M</mi></mrow><mo stretchy="true">→</mo></mover><mo>=</mo><mover accent="true"><mrow><mi>O</mi><mi>X</mi></mrow><mo stretchy="true">→</mo></mover><mo>+</mo><mover accent="true"><mrow><mi>O</mi><mi>Y</mi></mrow><mo stretchy="true">→</mo></mover>`, 'vector OM equals vector OX plus vector OY')}</div>
        <ul>
          <li>المركبتان متعامدتان لأن حامليهما ${V_OX} و${V_OY} متعامدان، وتبدآن من نقطة التأثير نفسها في تمثيل متوازي الأضلاع/المستطيل.</li>
          <li>تُحدَّد شدة كل مركبة من طول مسقطها مع مقياس رسم معلوم، أو بالحساب إذا عُرف مقدار القوة وزاويتها. لا يورد نص النشاط قيمة عددية أو زاوية محددة.</li>
          <li>يمكن وصف المحصلة هندسياً بقطر المستطيل؛ وعند وضع المتجهات رأساً لذيل تظهر علاقة مثلث قائم بين المتجهين المتعامدين والمحصلة.</li>
        </ul>
        <div class="teacher-misconception"><strong>مفهوم شائع يحتاج تصحيحاً:</strong> التحليل ليس حذف القوة الأصلية أو جعل المركبتين قوتين مستقلتين بلا علاقة؛ إنهما تمثيل متعامد مكافئ للقوة نفسها، ومجموعهما المتجهي يساويها.</div>
      `)}
      ${sourceDisclosure(60)}
    </article>

    <article class="teacher-subsection" id="teacher-p60-incline" data-page-reference="p60">
      <h4>نشاط المستوى المائل الأملس · p60</h4>
      ${teacherExplanation(60, `
        <p>يعطي النص مستوى أملساً يميل عن الأفق بزاوية، ويطلب رسم القوى وتحليل قوة الثقل. ابدأ بمخطط جسم حر مستقل، وارسم الثقل رأسياً إلى أسفل. في النموذج المثالي الأملس لا تُضاف قوة احتكاك؛ ويؤثر السطح بقوة تماس عمودية عليه.</p>
        <p>إذا كانت <bdi dir="ltr">W</bdi> شدة الثقل، وكانت <bdi dir="ltr">a</bdi> الزاوية المبيّنة في النص هي زاوية ميل المستوى عن الأفق، فمقدارا مركبتي الثقل المعتادتان بالنسبة إلى المستوى هما:</p>
        ${p60Components}
        <p>المركبتان متعامدتان؛ وبجمع متجهيهما نحصل على الثقل. إذا مثلناهما رأساً لذيل مع الثقل تتكون علاقة مثلث قائم، وإذا بنينا متوازي الأضلاع من نقطة واحدة نحصل على مستطيل.</p>
        <div class="teacher-limit"><strong>حدّ الشكل الممسوح:</strong> الرمز الظاهر <bdi dir="ltr">a</bdi> هو حرف لاتيني صغير، ويعرض مرجع المنصة الرمز ${mathML('<mover accent="true"><mi>R</mi><mo stretchy="true">→</mo></mover>', 'vector R')} كما هو مقروء؛ لكن اتجاه السهم ومطابقة الرمز لقوة بعينها غير محسومين بصرياً. راجع الشكل الأصلي ولا تنسب ${mathML('<mover accent="true"><mi>R</mi><mo stretchy="true">→</mo></mover>', 'vector R')} إلى قوة محددة من التخمين. كذلك فإن مساواة رد الفعل العمودي للمركبة العمودية من الثقل تتطلب عدم وجود تسارع عمودي على السطح.</div>
      `)}
      ${p60FigureReference ? `<details class="teacher-source-details" data-source-page="p60-figure"><summary>مرجع شكل من المنصة، لا نص من الكتاب · p60</summary><div class="teacher-source-body"><div class="teacher-platform-reference"><p><strong>معالجة مرجعية للشكل:</strong> النص التالي ملاحظة توضيحية من المنصة، وليس نصاً أصلياً من الكتاب.</p>${p60FigureReference.html}</div></div></details>` : ''}
    </article>
  </section>`;
}

function renderWorkedExamples() {
  return `<section class="teacher-section" id="teacher-examples" aria-labelledby="teacher-examples-heading">
    ${subheading('أمثلة محلولة وتحليل القوى', '58–59', 'teacher-examples-heading')}
    <article class="teacher-subsection" id="teacher-p58-example" data-page-reference="p58">
      <h4>مثال القوتين بزاوية ${ltr('60°')} · ${ltr('p58')}</h4>
      ${teacherExplanation(58, `
        <p><strong>المعطيات كما وردت:</strong> ${ltr('F₁ = 4 N')}، ${ltr('F₂ = 3 N')}، والزاوية المحصورة ${ltr('60°')}، ومقياس الرسم ${ltr('1 cm = 1 N')}.</p>
        <ol>
          <li>ارسم القوتين من O بطولي ${ltr('4 cm')} و${ltr('3 cm')} مع الزاوية المحددة، ثم أكمل متوازي الأضلاع.</li>
          <li>ارسم القطر من O، وقِس طوله في الرسم. النتيجة المطبوعة: نحو ${ltr('6 cm')}، ثم ${ltr('F = 6 × 1 = 6 N')}.</li>
          <li>عناصر المحصلة: نقطة التأثير O، والحامل هو قطر متوازي الأضلاع، والجهة من O إلى الرأس المقابل، والشدة ${ltr('6 N')} بحسب القياس ومقياس الرسم.</li>
        </ol>
        <div class="teacher-answer"><strong>تحقق تحليلي للمعلم — منفصل عن جواب الكتاب:</strong> باستعمال قانون جيب التمام لمقدار محصلة قوتين بينهما ${ltr('60°')}:</div>
        ${p58AnalyticCheck}
        <p>القيمة التحليلية نحو ${ltr('6.08 N')}؛ لذلك فقراءة القطر الرسومية «نحو ${ltr('6 cm')}» تعطي الجواب التقريبي المنشور ${ltr('6 N')}. لا تستبدل قيمة المصدر المقيسة بالتحقق التحليلي ولا تعرضهما كأنهما نص واحد.</p>
      `)}
      ${sourceDisclosure(58)}
    </article>

    <article class="teacher-subsection" id="teacher-p59-example" data-page-reference="p59">
      <h4>مثال القوتين المتعامدتين ${ltr('60 N')} و${ltr('80 N')} · ${ltr('p58–p59')}</h4>
      ${teacherExplanation(59, `
        <p><strong>المعطيات:</strong> ${ltr('F₁ = 60 N')} و${ltr('F₂ = 80 N')} متعامدتان. في الرسم استخدم المقياس المطبوع في الحل: ${ltr('1 cm = 20 N')}.</p>
        <ul>
          <li>طول شعاع ${ltr('60 N')} هو ${ltr('3 cm')}، وطول شعاع ${ltr('80 N')} هو ${ltr('4 cm')}.</li>
          <li>القطر في المثلث القائم ${ltr('5 cm')}؛ وبمقياس الرسم تكون المحصلة ${ltr('F = 5 × 20 = 100 N')}.</li>
          <li>نقطة التأثير هي نقطة التقاء القوتين، والحامل قطر المستطيل، والجهة من نقطة التأثير إلى الرأس المقابل. لا يحدد النص محوراً مطلقاً أو رسماً بعينه لاتجاه القطر.</li>
        </ul>
        ${p59Arithmetic}
        <p><strong>كتلة فيثاغورث الأصلية ذات الأسطر الثلاثة محفوظة حرفياً في مرجع الكتاب ${ltr('p59')} أدناه.</strong> الحساب الموسع أعلاه شرح معلم منفصل. إن أمكن، اطلب من الطلاب التحقق من تطابق الطريقة البيانية والحسابية.</p>
        <div class="teacher-misconception"><strong>تذكير:</strong> لمقدارين متعامدين نستخدم مجموع المربعين تحت الجذر؛ لا نجمع ${ltr('60')} و${ltr('80')} مباشرة ولا نربع الناتج مرة أخرى.</div>
      `)}
      ${sourceDisclosure(59)}
    </article>
  </section>`;
}

function renderSelfCheck() {
  return `<section class="teacher-section" id="teacher-self-check" aria-labelledby="teacher-self-check-heading">
    ${subheading('حل أسئلة الكتاب والمسائل الكتابية', '61–62', 'teacher-self-check-heading')}
    <article class="teacher-subsection" id="teacher-p61" data-page-reference="p61">
      <h4>أختبر نفسي · السؤال الأول، الفقرتان 1–2 · p61</h4>
      ${teacherExplanation(61, `
        <ol>
          <li><strong>الإجابة: متوازي أضلاع.</strong> زاوية القوتين حادة ومقداراهما مختلفان؛ لا شرط تعامد أو تساوٍ يبرر مستطيلاً أو مربعاً أو معيناً. قطر متوازي الأضلاع من نقطة التلاقي يمثل المحصلة.</li>
          <li><strong>الإجابة: مستطيل.</strong> حاملَا القوتين متعامدان ومقدارهما مختلف؛ لذلك يكون الشكل متوازي الأضلاع ذو زاوية قائمة، وليس مربعاً.</li>
        </ol>
        <div class="teacher-misconception"><strong>وجّه الانتباه:</strong> «متعامدتان» تحدد زاوية قائمة، و«مختلفتان شدة» تمنع استنتاج تساوي الضلعين.</div>
      `)}
      ${sourceDisclosure(61)}
    </article>

    <article class="teacher-subsection" id="teacher-p62-check" data-page-reference="p62">
      <h4>أختبر نفسي · السؤال الأول، الفقرات 3–6 · p62</h4>
      ${teacherExplanation(62, `
        <ol start="3">
          <li><strong>الإجابة: مربع.</strong> قوتان متعامدتان ومتساويتان تبنيان ضلعين متساويين وزاوية قائمة؛ الشكل مربع.</li>
          <li><strong>الإجابة: ${ltr('20 N')}.</strong> ${p62TwelveSixteen}.</li>
          <li><strong>الإجابة: ${ltr('30 N')}.</strong> من العلاقة القائمة نحصل على القوة الثانية بطرح مربع ${ltr('40')} من مربع ${ltr('50')} ثم أخذ الجذر: ${p62SecondMc}.</li>
          <li><strong>الإجابة: علاقة فيثاغورث.</strong> لمحصلة قوتين متعامدتين مختلفتي الشدة: ${formulaBox(`<mi>F</mi><mo>=</mo><msqrt><mrow><msup><msub><mi>F</mi><mn>1</mn></msub><mn>2</mn></msup><mo>+</mo><msup><msub><mi>F</mi><mn>2</mn></msub><mn>2</mn></msup></mrow></msqrt>`, 'F = square root of F one squared plus F two squared')}.</li>
        </ol>
      `)}
      ${sourceDisclosure(62)}
    </article>

    <article class="teacher-subsection" id="teacher-p62-problem-one" data-page-reference="p62">
      <h4>السؤال الثاني · المسألة الأولى · p62</h4>
      ${teacherExplanation(62, `
        <p><strong>المعطيات:</strong> قوتان متعامدتان عند O، ${ltr('F₂ = 12 N')}، ومقدار المحصلة ${ltr('15 N')}.</p>
        <ol>
          <li><strong>شدة القوة الأولى:</strong> ${p62F1Calculation}; إذن ${ltr('F₁ = 9 N')}.</li>
          <li><strong>عناصر المحصلة:</strong> نقطة التأثير O، وحاملها القطر من O في متوازي الأضلاع (أو وتر مثلث جمع المتجهات)، وجهتها من O إلى الرأس المقابل، وشدتها ${ltr('15 N')}. اتجاهها النسبي بين القوتين المتعامدتين، ويمكن تحديد زاويتها من جهة ${V_F1} إلى جهة ${V_F2} هكذا: ${p62ResultDirection}. لا يعطي المصدر رسماً يحدد اتجاههما المطلق على الصفحة.</li>
          <li><strong>القوة التي توازن الجسم:</strong> مقدارها ${ltr('15 N')}، وحاملها حامل المحصلة نفسه، لكن جهتها معاكسة؛ عندها يكون مجموعها المتجهي مع المحصلة صفراً.</li>
          <li><strong>تمثيل القوى:</strong> ترتيب المجموعة في نص الكتاب محفوظ: <span class="teacher-exact-source" dir="ltr" aria-label="F one, F two, F, F three">{${V_F1}, ${V_F2}, ${V_F}, ${V_F3}}</span>. وفق الفقرة السابقة تمثل ${V_F} قوة الموازنة، لكن المصدر لا يعرّف ${V_F3} ولا يعطي له مقداراً أو اتجاهاً؛ لذلك لا يمكن إكمال تمثيل ${V_F3} أو الجزم به. كما لا يفرض الكتاب مقياس رسم أو اتجاهاً مطلقاً. للقوى المحددة فقط يمكن للمعلم اختيار مقياس معلن ومناسب، مثلاً ${ltr('1 cm = 3 N')}؛ وهذا اقتراح رسم لا مقياس مطبوع.</li>
        </ol>
        <div class="teacher-limit"><strong>حدّ المصدر:</strong> لا تخترع قيمة أو دوراً لـ ${V_F3}، ولا تضف سهماً رابعاً مستنتجاً. لا تُحوّل الاقتراح الاختياري للمقياس إلى نص من الكتاب.</div>
      `)}
    </article>

    <article class="teacher-subsection" id="teacher-p62-problem-two" data-page-reference="p62">
      <h4>السؤال الثاني · المسألة الثانية، حمل الحقيبة · p62</h4>
      ${teacherExplanation(62, `
        <p><strong>المعطيات:</strong> قوتا الحبلين متعامدتان؛ المقداران ${ltr('30 N')} و${ltr('40 N')}.</p>
        <p><strong>شدة المحصلة:</strong> ${p62BagResult}؛ وهي وتر مثلث قائم ${ltr('3–4–5')} بعد ضرب الأطوال في ${ltr('10')}.</p>
        <p><strong>الجهة النسبية:</strong> تقع المحصلة بين اتجاهي الحبلين وتميل أكثر نحو قوة ${ltr('40 N')}. من جهة الحبل ذي القوة ${ltr('30 N')} يكون القياس المشتق ${p62BagAngle}; ومن جهة ${ltr('40 N')} تكون قرابة ${ltr('36.9°')}. لا يحدد النص اتجاه المحصلة بالنسبة إلى أفق أو محور خارجي.</p>
        <p><strong>تمثيل بمقياس مناسب:</strong> اختر واكتب أي مقياس مناسب بوضوح؛ على سبيل المثال ${ltr('1 cm = 10 N')} يجعل الشعاعين ${ltr('3 cm')} و${ltr('4 cm')} متعامدين والقطر ${ltr('5 cm')}. هذا مثال لمقياس يختاره المعلم، لا قيمة مفروضة في المصدر. في نموذج القوى المتلاقية ارسمهما من نقطة مشتركة؛ أما مواضع ربط الحبلين الدقيقة على الحقيبة وخط العمل الفعلي فلا يحددهما النص، فتُراجعان من شكل أو وصف إضافي عند الحاجة.</p>
      `)}
    </article>
  </section>`;
}

function renderSimulationGuide() {
  return `<section class="teacher-section" id="teacher-simulations" aria-labelledby="teacher-simulations-heading">
    ${subheading('شرح المعلم للمحاكاة الموجودة', '56، 57، 59، 60', 'teacher-simulations-heading')}
    <p class="teacher-section-endnote">هذه ملاحظات لاستخدام التفاعلات الموجودة في صفحات الطالب؛ لم تُضف أو تُعدّل محاكاة في مرحلة منطقة المعلم.</p>

    <article class="teacher-simulation-note" data-simulation-reference="spring-concurrency" data-page-reference="p56">
      <h4>تفاعل الحوامل الهندسي · <span>p56</span></h4>
      <p><strong>ما يفعله:</strong> يحرّك موضع O أفقياً ورأسياً ضمن المجال المعروض، ويعيد رسم حاملَي الشد وحامل الوزن الرأسي، مع بقاء الخطوط الثلاثة ملتقية عند O. الأسهم توضيحية لاتجاهات الرسم، وليست مقياساً للمقادير.</p>
      <p><strong>ما لا يفعله:</strong> لا يحسب قراءات الربيعتين أو شدّ النابضين، ولا يختبر اتزان الجسم. التلاقي مضمَّن هندسياً في إنشاء الخطوط؛ فلا تقدمه كبرهان على الاتزان أو كبديل للتجربة العملية.</p>
      <p><strong>سؤال توجيهي:</strong> ميّز بين اتجاه السهم وحامله الممتد، ثم اشرح لماذا لا تكفي معرفة نقطة الالتقاء وحدها لإثبات أن محصلة القوى تساوي صفراً.</p>
    </article>

    <article class="teacher-simulation-note" data-simulation-reference="concurrent" data-page-reference="p57">
      <h4>تفاعل محصلة قوتين بمتوازي الأضلاع · <span>p57</span></h4>
      <p><strong>ما يفعله:</strong> يغيّر مقدارَي القوتين والزاوية بينهما، ويحدّث متوازي الأضلاع، ومقدار المحصلة واتجاهها بالنسبة إلى ${V_F1}. مجال كل قوة ${ltr('0–10 N')} بخطوة ${ltr('0.5 N')}، والزاوية ${ltr('0–180°')}. قيمة البداية ${ltr('6 N')} و${ltr('4 N')} و${ltr('45°')} للاستكشاف وليست معطيات مثال ${ltr('p58')}.</p>
      ${formulaBox(`${arrow('F')}<mo>=</mo><msqrt><mrow><msup><msub><mi>F</mi><mn>1</mn></msub><mn>2</mn></msup><mo>+</mo><msup><msub><mi>F</mi><mn>2</mn></msub><mn>2</mn></msup><mo>+</mo><mn>2</mn><msub><mi>F</mi><mn>1</mn></msub><msub><mi>F</mi><mn>2</mn></msub><mi>cos</mi><mo>(</mo><mi>θ</mi><mo>)</mo></mrow></msqrt>`, 'F equals square root of F one squared plus F two squared plus 2 F one F two cosine theta')}
      <p><strong>استخدام صفي:</strong> غيّر زاوية واحدة مع تثبيت المقدارين، واطلب وصف تغير القطر. قارِن المدخلات بقيم ${ltr('p58')} فقط بعد إدخالها عمداً، ولا تنسب قيم البدء إلى الكتاب.</p>
    </article>

    <article class="teacher-simulation-note" data-simulation-reference="perpendicular" data-page-reference="p59">
      <h4>تفاعل المحصلة للقوتين المتعامدتين · <span>p59</span></h4>
      <p><strong>ما يفعله:</strong> يعرض قوتين متعامدتين، ومثلث جمع متجهات، ومقدار المحصلة واتجاهها. مجال كل مقدار ${ltr('0–100 N')} بخطوة ${ltr('1 N')}؛ قيم البداية ${ltr('50 N')} و${ltr('70 N')}، وليست مثال ${ltr('p58–p59')}. يمكن إدخال ${ltr('60 N')} و${ltr('80 N')} لمراجعة نتيجة ${ltr('100 N')}.</p>
      ${formulaBox(`<mi>F</mi><mo>=</mo><msqrt><mrow><msup><msub><mi>F</mi><mn>1</mn></msub><mn>2</mn></msup><mo>+</mo><msup><msub><mi>F</mi><mn>2</mn></msub><mn>2</mn></msup></mrow></msqrt>`, 'F equals the square root of F one squared plus F two squared')}
      <p><strong>سؤال توجيهي:</strong> أدخل ${ltr('60 N')} و${ltr('80 N')}، ثم قارِن طول القطر مع نتيجة كتلة فيثاغورث المطبوعة في ${ltr('p59')}.</p>
    </article>

    <article class="teacher-simulation-note" data-simulation-reference="force-resolution" data-page-reference="p60">
      <h4>تفاعل تحليل القوة على ${V_OX} و${V_OY} · <span>p60</span></h4>
      <p><strong>ما يفعله:</strong> يغيّر مقدار القوة الأصلية من ${ltr('0')} إلى ${ltr('10 N')} بخطوة ${ltr('0.5 N')} وزاويتها من ${ltr('0°')} إلى ${ltr('90°')} بخطوة ${ltr('1°')}، ثم يعرض مسقطيها المتعامدين على ${V_OX} و${V_OY} والمستطيل الناتج. البداية ${ltr('8 N')} و${ltr('35°')} للاستكشاف فقط.</p>
      <p><strong>حدود المطابقة:</strong> هذا تفاعل عام للتحليل على محورين؛ لا يعيد رسم المستوى المائل في p60 ولا يحسم رموز الأسهم الصغيرة فيه. لا تستخدمه لتخمين معنى ${mathML('<mover accent="true"><mi>R</mi><mo stretchy="true">→</mo></mover>', 'vector R')} أو اتجاهه في الشكل الأصلي. مجاله في الربع الأول فقط، فلا يمثل مركبات سالبة.</p>
      <p><strong>سؤال توجيهي:</strong> جرّب الزاويتين الطرفيتين ${ltr('0°')} و${ltr('90°')}، واطلب تحديد أي مسقط يساوي صفراً في كل حالة، ثم اربط ذلك بإسقاط القوة على حاملين متعامدين.</p>
    </article>
  </section>`;
}

export function renderTeacherContent() {
  return `<header class="teacher-workspace-header">
    <div>
      <p class="teacher-workspace-eyebrow">دليل المعلم · المصدر p55–p62</p>
      <h2 id="teacher-workspace-heading" tabindex="-1">القوى المتلاقية</h2>
      <p>الصف الثامن · الوحدة الثانية — الحركة والقوى · شرح، حلول، وحدود موثقة للمصدر</p>
    </div>
    <button class="teacher-logout-button" type="button" data-teacher-logout>إنهاء الجلسة</button>
  </header>
  <div class="teacher-workspace-layout">
    <nav class="teacher-nav" aria-label="التنقل في دليل المعلم">
      <p class="teacher-nav-title">أقسام الدليل</p>
      <a href="#teacher-overview">نظرة عامة والأهداف</a>
      <a href="#teacher-activities">الأنشطة والاستنتاجات</a>
      <a href="#teacher-examples">الأمثلة المحلولة</a>
      <a href="#teacher-self-check">أسئلة الكتاب</a>
      <a href="#teacher-simulations">المحاكاة الموجودة</a>
    </nav>
    <div class="teacher-content">
      ${renderOverview()}
      ${renderActivities()}
      ${renderWorkedExamples()}
      ${renderSelfCheck()}
      ${renderSimulationGuide()}
    </div>
  </div>`;
}

