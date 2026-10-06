import { LATIN_A, P_M, P_O, formula, ltrText, tex, V_F, V_F1, V_F2, V_OM, V_OX, V_OY, V_R } from './math.js';

const pointO = P_O;
const pointM = P_M;
const latinA = LATIN_A;
const eq = (source, label) => `<div class="assessment-formula">${formula(source, label)}</div>`;
const ltr = (text) => ltrText(text);
const vectorRelation = formula(
  '\\vec{\\mathrm{OM}}=\\vec{\\mathrm{OX}}+\\vec{\\mathrm{OY}}',
  'vector OM equals vector OX plus vector OY',
);

export const SOLUTION_GROUPS = Object.freeze([
  {
    id: 'group-1',
    title: 'الأسئلة 1–5',
    questionIds: ['q01', 'q02', 'q03', 'q04', 'q05'],
    items: [
      {
        questionId: 'q01', answerKey: 'concurrent', answerHtml: 'القوى المتلاقية.',
        explanationHtml: '<p>تُعرّف القوى المتلاقية من خلال حواملها: يمر حامل كل قوة بالنقطة المشتركة. لا يشترط التعريف أن تكون القوى متساوية أو متزنة.</p>',
      },
      {
        questionId: 'q02', answerKey: 'false', answerHtml: 'خطأ.',
        explanationHtml: '<p>التلاقي وصف هندسي لخطوط عمل القوى. قد تلتقي الحوامل ولا تتعادل القوى؛ إثبات الاتزان يحتاج إلى معرفة القوى ومقاديرها واتجاهاتها، لا إلى نقطة الالتقاء وحدها.</p>',
      },
      {
        questionId: 'q03', answerKey: ['common-point', 'different-directions'], answerHtml: '<p>يمر كل حامل بالنقطة المشتركة، ويمكن أن تختلف اتجاهات الحوامل.</p>',
        explanationHtml: '<p>الحامل خط يمتد على اتجاه القوة، ولذلك يمكن لعدة حوامل مختلفة الاتجاه أن تلتقي عند نقطة واحدة. طول السهم يدل على مقدار في تمثيل محدد، لكنه ليس شرطاً للتلاقي؛ كما أن التلاقي لا يعني أن المحصلة صفر.</p>',
      },
      {
        questionId: 'q04', answerKey: 'all-carriers-meet', answerHtml: `حوامل القوى الثلاث تمر بالنقطة ${pointO}.`,
        explanationHtml: `<p>امتدادات الحوامل المتقطعة والأسهم في الرسم تلتقي عند ${pointO}، فيمثل ذلك قوى متلاقية. لا يعرض الرسم مقادير تكفي لإثبات الاتزان أو تساوي القوى.</p>`,
      },
      {
        questionId: 'q05', answerKey: { value: 6, tolerance: 0.05, unit: 'N' }, answerHtml: `نحو ${ltr('6 N')}.`,
        explanationHtml: `<p><strong>المعطيات:</strong> القطر المقاس نحو ${ltr('6 cm')}، ومقياس الرسم ${ltr('1 cm = 1 N')}.</p>
          <p><strong>المطلوب:</strong> مقدار المحصلة كما في المثال البياني.</p>
          ${eq('F\\approx 6\\times 1=6~\\mathrm{N}', 'F approximately equals 6 centimeters times 1 newton per centimeter, approximately 6 newtons')}
          <p>إذن النتيجة المطبوعة تقريبية: نحو ${ltr('6 N')}. المطلوب هنا قراءة الحل البياني نفسه، لا استبداله بحساب تحليلي آخر.</p>`,
      },
    ],
  },
  {
    id: 'group-2',
    title: 'الأسئلة 6–10',
    questionIds: ['q06', 'q07', 'q08', 'q09', 'q10'],
    items: [
      {
        questionId: 'q06', answerKey: ['draw-forces', 'complete-parallelogram', 'draw-resultant'],
        answerHtml: `<ol><li>ارسم القوتين من ${pointO}.</li><li>أكمل متوازي الأضلاع.</li><li>ارسم القطر من ${pointO} إلى الرأس المقابل.</li></ol>`,
        explanationHtml: '<p>يبدأ الإنشاء من نقطة التأثير المشتركة. بعد إكمال متوازي الأضلاع، يمثل القطر الخارج من تلك النقطة محصلة القوتين.</p>',
      },
      {
        questionId: 'q07',
        answerKey: {
          application: 'common-point',
          carrier: 'diagonal-line',
          sense: 'from-origin',
          magnitude: 'scaled-length',
        },
        answerHtml: `<ul><li>نقطة التأثير: النقطة المشتركة.</li><li>الحامل: خط القطر.</li><li>الجهة: من ${pointO} إلى الرأس المقابل.</li><li>الشدة: طول القطر مع مقياس الرسم.</li></ul>`,
        explanationHtml: '<p>عناصر المحصلة الأربعة تصف موضع تأثيرها، وخط عملها، والجهة التي يشير إليها سهمها، ومقدارها. لا يساوي «الحامل» الجهة؛ الحامل خط كامل والجهة تحدد أي اتجاه على هذا الخط.</p>',
      },
      {
        questionId: 'q08', answerKey: 'from-common-point', answerHtml: `القطر من ${pointO} إلى الرأس المقابل.`,
        explanationHtml: `<p>قاعدة متوازي الأضلاع ترسم القوتين من نقطة التأثير ${pointO}، ثم يكون القطر الذي يبدأ من ${pointO} ويتجه إلى الرأس المقابل هو شعاع المحصلة. عكس القطر يعكس الجهة، والضلع يمثل إحدى القوتين لا المحصلة.</p>`,
      },
      {
        questionId: 'q09', answerKey: 'false', answerHtml: 'خطأ؛ العلاقة لمقدارين متعامدين هي علاقة فيثاغورث.',
        explanationHtml: `${eq('F=\\sqrt{F_{1}^{2}+F_{2}^{2}}', 'F equals the square root of F one squared plus F two squared')}
          <p>لأن القوتين متعامدتان، تشكلان ضلعي مثلث قائم والمحصلة وتره؛ لذلك لا نجمع المقدارين خطياً.</p>`,
      },
      {
        questionId: 'q10', answerKey: ['perpendicular-projections', 'sum-is-original'],
        answerHtml: `المركبتان متعامدتان، ومجموعهما المتجهي يعيد ${V_OM}.`,
        explanationHtml: `<p>تحليل القوة هو تمثيلها بمركبتين على الحاملين المتعامدين ${V_OX} و${V_OY}. يبقى مجموعهما المتجهي مساوياً للقوة الأصلية؛ ليستا قوتين منفصلتين بلا علاقة بها.</p>
          <div class="assessment-formula">${vectorRelation}</div>`,
      },
    ],
  },
  {
    id: 'group-3',
    title: 'الأسئلة 11–15',
    questionIds: ['q11', 'q12', 'q13', 'q14', 'q15'],
    items: [
      {
        questionId: 'q11', answerKey: { value: 100, tolerance: 0.05, unit: 'N' }, answerHtml: `${ltr('100 N')}.`,
        explanationHtml: `<p><strong>المعطيات:</strong> ${ltr('F₁ = 60 N')}، ${ltr('F₂ = 80 N')}، والقوتان متعامدتان.</p>
          <p><strong>المطلوب:</strong> مقدار المحصلة.</p>
          <p><strong>القانون:</strong> علاقة فيثاغورث للقوتين المتعامدتين.</p>
          ${eq('F=\\sqrt{60^{2}+80^{2}}=\\sqrt{10000}=100~\\mathrm{N}', 'F equals square root of 60 squared plus 80 squared equals 100 newtons')}
          <p><strong>النتيجة والتفسير:</strong> ${ltr('100 N')}. وهذا يطابق القياس البياني ذي القطر ${ltr('5 cm')} عند مقياس ${ltr('1 cm = 20 N')}.</p>`,
      },
      {
        questionId: 'q12', answerKey: 'ignored-angle', answerHtml: `جمع المقدارين مباشرة يهمل الزاوية، ونتيجة المثال البياني نحو ${ltr('6 N')}.`,
        explanationHtml: `<p>المحصلة كمية متجهة، ولذلك تعتمد على مقدار القوتين والزاوية بينهما. في مثال الكتاب تُنشأ هندسياً بمتوازي الأضلاع ويقاس القطر نحو ${ltr('6 cm')}، فيكون الجواب المنشور نحو ${ltr('6 N')} وفق المقياس. لا يصح استبدال هذا القياس بجمع ${ltr('4 N + 3 N')} على أنه جواب دقيق، ولا ينبغي تقديم قيمة تحليلية إضافية على أنها جواب الكتاب.</p>`,
      },
      {
        questionId: 'q13', answerKey: 'vector-sum', answerHtml: vectorRelation,
        explanationHtml: `<p>في الشكل، ضلعَا المستطيل من ${pointO} يمثلان مركبتي القوة على الحاملين المتعامدين، والقطر من ${pointO} إلى ${pointM} يمثل القوة الأصلية. لذلك تعيد المحصلة المتجهية للمركبتين القوة ${V_OM}.</p>
          <div class="assessment-formula">${vectorRelation}</div>`,
      },
      {
        questionId: 'q14', answerKey: { value: 9, tolerance: 0.05, unit: 'N' }, answerHtml: `${ltr('9 N')}.`,
        explanationHtml: `<p><strong>المعطيات:</strong> المحصلة ${ltr('F = 15 N')}، والقوة المعروفة ${ltr('F₂ = 12 N')}، والقوتان متعامدتان.</p>
          <p><strong>المطلوب:</strong> ${V_F1}.</p>
          <p><strong>القانون بعد إعادة الترتيب:</strong> نطرح مربع القوة المعروفة من مربع المحصلة، ثم نأخذ الجذر.</p>
          ${eq('F_{1}=\\sqrt{15^{2}-12^{2}}=\\sqrt{81}=9~\\mathrm{N}', 'F one equals square root of 15 squared minus 12 squared equals 9 newtons')}
          <p><strong>النتيجة:</strong> ${ltr('9 N')}. وهي ضلع قائم يكمل مع ${ltr('12 N')} وتر المثلث ${ltr('15 N')}.</p>`,
      },
      {
        questionId: 'q15', answerKey: 'equal-opposite', answerHtml: 'مساوية للمحصلة مقداراً، ومعاكسة لها اتجاهاً وعلى حاملها نفسه.',
        explanationHtml: `<p>حتى تكون محصلة القوة الأصلية وقوة الموازنة صفراً، يجب أن تكون القوتان متساويتين مقداراً ومتعاكستين اتجاهاً وعلى الحامل نفسه. لذلك تكون شدة قوة الموازنة ${ltr('15 N')} عندما تكون شدة المحصلة ${ltr('15 N')}.</p>`,
      },
    ],
  },
  {
    id: 'group-4',
    title: 'الأسئلة 16–20',
    questionIds: ['q16', 'q17', 'q18', 'q19', 'q20'],
    items: [
      {
        questionId: 'q16', answerKey: {
          'sixty-eighty': 'result-100-and-5cm',
          'thirty-forty': 'result-50',
          'fifty-forty': 'force2-30',
          'twelve-sixteen': 'result-20',
        },
        answerHtml: `<ul><li>${ltr('60 N')} و${ltr('80 N')}: ${ltr('100 N')}، والقطر ${ltr('5 cm')}.</li><li>${ltr('30 N')} و${ltr('40 N')}: ${ltr('50 N')}.</li><li>محصلة ${ltr('50 N')} مع ${ltr('40 N')}: القوة الثانية ${ltr('30 N')}.</li><li>${ltr('12 N')} و${ltr('16 N')}: ${ltr('20 N')}.</li></ul>`,
        explanationHtml: `<p>كل زوج متعامد، لذا نستخدم فيثاغورث للمحصلة، أو نعيد ترتيب العلاقة لإيجاد ضلع مجهول. في الحالة الأولى يعطي مقياس الرسم ${ltr('1 cm = 20 N')} طول قطر ${ltr('5 cm')} للمحصلة ${ltr('100 N')}.</p>
          ${eq('\\sqrt{60^{2}+80^{2}}=100~\\mathrm{N}', 'square root of 60 squared plus 80 squared equals 100 newtons')}
          ${eq('\\sqrt{30^{2}+40^{2}}=50~\\mathrm{N}', 'square root of 30 squared plus 40 squared equals 50 newtons')}
          ${eq('F_{2}=\\sqrt{50^{2}-40^{2}}=30~\\mathrm{N}', 'F two equals the square root of 50 squared minus 40 squared equals 30 newtons')}
          ${eq('\\sqrt{12^{2}+16^{2}}=20~\\mathrm{N}', 'square root of 12 squared plus 16 squared equals 20 newtons')}`,
      },
      {
        questionId: 'q17', answerKey: 'preserve-a-review-r', answerHtml: `أبقِ ${latinA} حرفاً لاتينياً صغيراً، وارجع إلى الرسم قبل تعيين معنى ${V_R} أو اتجاهه.`,
        explanationHtml: `
          <p>يُحافظ على الرمز المطبوع ${LATIN_A} كما هو. لا يكفي ظهور ${V_R} في رسم غير واضح لنعرف القوة التي يمثلها أو اتجاهها؛ تُراجع الصورة الأصلية بدلاً من اختلاق تسمية أو سهم.</p>`,
      },
      {
        questionId: 'q18', answerKey: ['definition-supported', 'location-question-only'],
        answerHtml: 'تعريف التلاقي هو اجتماع الحوامل في نقطة، وسؤال موضع التقاء الحبال لا يورد جواباً تفصيلياً في النص المكتوب.',
        explanationHtml: `<p>يصرّح الدرس بأن القوى المتلاقية هي القوى التي تتلاقى حواملها في نقطة واحدة، كما يطرح تمهيد الصفحة ${ltr('55')} سؤالاً عن مكان التقاء الحبال. لكنه لا يحدد موضعاً تفصيلياً أو مقدار شد في النص؛ لذلك لا يصح استنتاج الاتزان من الوصف وحده أو تخمين ما قد تعرضه الصورة.</p>`,
      },
      {
        questionId: 'q19', answerKey: { value: 0.6, tolerance: 0.000001, unit: null }, answerHtml: `${ltr('3/5 = 0.6')}.`,
        explanationHtml: `<p><strong>المعطيات:</strong> ${ltr('F₁ = 60 N')} و${ltr('F = 100 N')}.</p>
          <p><strong>المطلوب:</strong> النسبة ${tex('\\dfrac{F_{1}}{F}', 'F one over F')} بلا وحدة.</p>
          ${eq('\\dfrac{60}{100}=\\dfrac{3}{5}=0.6', '60 over 100 equals 3 over 5 equals 0.6')}
          <p>إذن الكسر المبسط ${ltr('3/5')}، وهو يساوي العدد العشري ${ltr('0.6')}؛ لا تُكتب وحدة للنسبة.</p>`,
      },
      {
        questionId: 'q20', answerKey: ['choose-origin', 'draw-original-force', 'draw-axes', 'project-tip', 'identify-components'],
        answerHtml: `<ol><li>حدد ${pointO}.</li><li>ارسم القوة من ${pointO}.</li><li>ارسم المحورين المتعامدين.</li><li>أسقط ${pointM} عمودياً.</li><li>سمّ المسقطين مركبتين وتحقق أن جمعهما يعيد القوة.</li></ol>`,
        explanationHtml: `<p>يتبع الترتيب نشاط ${ltr('p60')}: تحديد ${pointO}، ثم رسم ${V_OM}، ثم إنشاء المحورين المتعامدين ${V_OX} و${V_OY}، ثم إسقاط ${pointM} عمودياً عليهما. في النهاية تمثل المساقط المركبتين، ومجموعهما المتجهي يعيد ${V_F}.</p>`, 
      },
    ],
  },
]);

export const ANSWER_KEY = Object.freeze(Object.fromEntries(
  SOLUTION_GROUPS.flatMap((group) => group.items.map((item) => [item.questionId, item.answerKey])),
));

export const SOLUTIONS = Object.freeze(Object.fromEntries(
  SOLUTION_GROUPS.flatMap((group) => group.items.map((item) => [item.questionId, item])),
));
