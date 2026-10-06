import { LATIN_A, P_M, P_O, ltrText, tex, V_F, V_F1, V_F2, V_OM, V_OX, V_OY, V_R } from './math.js';

const latinA = LATIN_A;
const pointO = P_O;
const pointM = P_M;
const forceComponents = `${V_F1} و${V_F2}`;

export const LESSON_TEST = Object.freeze({
  id: 'unit2-lesson1',
  unit: 'الوحدة الأولى — الحركة والقوى',
  lesson: 'الدرس 1 — القوى المتلاقية',
  sourcePages: Object.freeze([55, 56, 57, 58, 59, 60, 61, 62]),
  questions: Object.freeze([
    {
      id: 'q01', lessonId: 'unit2-lesson1', sourcePages: [56, 61], difficulty: 'basic', type: 'single-choice',
      prompt: 'أي وصف يعرّف القوى المتلاقية بدقة؟',
      options: [
        { id: 'balanced', content: 'قوى يكون مجموعها دائماً صفراً.' },
        { id: 'collinear', content: 'قوى تؤثر كلها على حامل واحد فقط.' },
        { id: 'concurrent', content: 'قوى تلتقي حواملها عند نقطة مشتركة.' },
        { id: 'equal', content: 'قوى متساوية الشدة وفي الاتجاه نفسه.' },
      ],
    },
    {
      id: 'q02', lessonId: 'unit2-lesson1', sourcePages: [56], difficulty: 'basic', type: 'true-false',
      prompt: 'إذا التقت حوامل عدة قوى عند نقطة واحدة، فهذا وحده يثبت أن الجسم متزن.',
      options: [
        { id: 'true', content: 'صح' },
        { id: 'false', content: 'خطأ' },
      ],
    },
    {
      id: 'q03', lessonId: 'unit2-lesson1', sourcePages: [56, 61], difficulty: 'basic', type: 'multiple-select',
      prompt: 'اختر كل العبارات الصحيحة عن حوامل القوى المتلاقية.',
      options: [
        { id: 'common-point', content: 'يمر حامل كل قوة بالنقطة المشتركة نفسها.' },
        { id: 'equal-arrows', content: 'يجب أن تكون أسهم القوى متساوية الطول.' },
        { id: 'different-directions', content: 'قد تختلف اتجاهات الحوامل مع بقائها متلاقية.' },
        { id: 'zero-resultant', content: 'تلاقي الحوامل يعني بالضرورة أن المحصلة صفر.' },
      ],
    },
    {
      id: 'q04', lessonId: 'unit2-lesson1', sourcePages: [56], difficulty: 'basic', type: 'diagram-interpretation', diagram: 'concurrent-carriers',
      prompt: 'يمثل الرسم ثلاثة أسهم مرسومة من نقطة واحدة مع امتدادات متقطعة لحواملها. ما الذي يمكن استنتاجه من الرسم وحده؟',
      options: [
        { id: 'same-direction', content: 'القوى الثلاث متجهة إلى الجهة نفسها.' },
        { id: 'balanced', content: 'الجسم متزن لأن الحوامل تتلاقى.' },
        { id: 'all-carriers-meet', content: `حوامل القوى الثلاث تمر بالنقطة ${pointO}.` },
        { id: 'equal-magnitudes', content: 'مقادير القوى الثلاث متساوية.' },
      ],
    },
    {
      id: 'q05', lessonId: 'unit2-lesson1', sourcePages: [58], difficulty: 'basic', type: 'numeric', numericUnit: 'N',
      prompt: `في المثال البياني المطبوع، طول قطر متوازي الأضلاع نحو ${ltrText('6 cm')} ومقياس الرسم ${ltrText('1 cm = 1 N')}. ما مقدار المحصلة الذي يورده المثال؟`,
      inputHint: `أدخل المقدار بالنيوتن؛ يمكن كتابة الرقم وحده أو إلحاق ${ltrText('N')} به.`,
    },
    {
      id: 'q06', lessonId: 'unit2-lesson1', sourcePages: [57], difficulty: 'basic', type: 'ordering',
      prompt: `رتّب خطوات إنشاء محصلة قوتين ${forceComponents} بطريقة متوازي الأضلاع.`,
      inputHint: 'اختر موضعاً لكل خطوة؛ لا يلزم سحب العناصر.',
      items: [
        { id: 'draw-forces', content: `رسم ${V_F1} و${V_F2} من نقطة التأثير المشتركة.` },
        { id: 'complete-parallelogram', content: 'إكمال الشكل إلى متوازي أضلاع.' },
        { id: 'draw-resultant', content: `رسم القطر من نقطة التأثير إلى الرأس المقابل ليمثل ${V_F}.` },
      ],
    },
    {
      id: 'q07', lessonId: 'unit2-lesson1', sourcePages: [57, 61], difficulty: 'medium', type: 'matching',
      prompt: 'طابق كل عنصر من عناصر المحصلة مع وصفه.',
      fields: [
        { id: 'application', content: 'نقطة التأثير' },
        { id: 'carrier', content: 'الحامل' },
        { id: 'sense', content: 'الجهة' },
        { id: 'magnitude', content: 'الشدة' },
      ],
      options: [
        { id: 'common-point', content: 'النقطة المشتركة التي تؤثر عندها القوتان.' },
        { id: 'diagonal-line', content: 'خط القطر المنشأ على القوتين والمار بنقطة تأثيرهما.' },
        { id: 'from-origin', content: 'من نقطة التأثير إلى الرأس المقابل.' },
        { id: 'scaled-length', content: 'طول القطر بعد تفسيره بمقياس رسم.' },
      ],
      inputHint: 'اختر وصفاً واحداً لكل عنصر.',
    },
    {
      id: 'q08', lessonId: 'unit2-lesson1', sourcePages: [57], difficulty: 'medium', type: 'single-choice',
      prompt: `في إنشاء متوازي الأضلاع على قوتين تبدآن من ${pointO}، أي قطر يمثل المحصلة وفق قاعدة الكتاب؟`,
      options: [
        { id: 'between-tips', content: 'القطر الذي يصل رأسي السهمين فقط.' },
        { id: 'reverse-diagonal', content: `القطر من الرأس المقابل عائداً إلى ${pointO}، مع عكس جهة المحصلة.` },
        { id: 'from-common-point', content: `القطر الذي يبدأ من ${pointO} ويتجه إلى الرأس المقابل.` },
        { id: 'side-of-f1', content: 'أحد الضلعين الموازيين لـ' + ` ${V_F1}.` },
      ],
    },
    {
      id: 'q09', lessonId: 'unit2-lesson1', sourcePages: [59, 61], difficulty: 'medium', type: 'true-false',
      prompt: `عندما تكون ${V_F1} و${V_F2} متعامدتين، تكون شدة المحصلة دائماً ${ltrText('F₁ + F₂')} دون استخدام المربعات.`,
      options: [
        { id: 'true', content: 'صح' },
        { id: 'false', content: 'خطأ' },
      ],
    },
    {
      id: 'q10', lessonId: 'unit2-lesson1', sourcePages: [60], difficulty: 'medium', type: 'multiple-select',
      prompt: `أي العبارات تصف تحليل القوة ${V_OM} على المحورين المتعامدين ${V_OX} و${V_OY}؟ اختر كل ما ينطبق.`,
      options: [
        { id: 'perpendicular-projections', content: 'المركبتان مسقطان على حاملين متعامدين.' },
        { id: 'sum-is-original', content: `مجموع المركبتين المتجهي يعيد القوة ${V_OM}.` },
        { id: 'same-carrier', content: 'يجب أن تكون المركبتان على الحامل نفسه.' },
        { id: 'unrelated-forces', content: 'المركبتان قوتان غير مرتبطتين بالقوة الأصلية.' },
      ],
    },
    {
      id: 'q11', lessonId: 'unit2-lesson1', sourcePages: [58, 59], difficulty: 'medium', type: 'numeric', numericUnit: 'N',
      prompt: `تؤثر قوتان متعامدتان مقدارهما ${ltrText('60 N')} و${ltrText('80 N')}. احسب مقدار محصلتهما باستعمال علاقة فيثاغورث.`,
      inputHint: `أدخل المقدار بالنيوتن؛ يمكن كتابة الرقم وحده أو إلحاق ${ltrText('N')} به.`,
    },
    {
      id: 'q12', lessonId: 'unit2-lesson1', sourcePages: [58], difficulty: 'medium', type: 'error-analysis',
      prompt: `قال طالب عن مثال الكتاب: «القوتان ${ltrText('4 N')} و${ltrText('3 N')}، إذن المحصلة ${ltrText('7 N')} بالضبط؛ نجمع المقدارين مهما كانت الزاوية». ما التشخيص الأدق؟`,
      options: [
        { id: 'wrong-units', content: 'الخطأ الوحيد هو أن النيوتن لا يمكن استعماله مع الرسم.' },
        { id: 'ignored-angle', content: `جمع المقدارين مباشرة يهمل الزاوية بين القوتين؛ ونتيجة الرسم في المثال نحو ${ltrText('6 N')}.` },
        { id: 'wrong-point', content: `ينبغي أن يبدأ القطر من رأس أحد السهمين لا من ${pointO}.` },
        { id: 'exact-seven', content: 'الاستنتاج صحيح لأن مقدار المحصلة يساوي مجموع الشدتين دائماً.' },
      ],
    },
    {
      id: 'q13', lessonId: 'unit2-lesson1', sourcePages: [60], difficulty: 'medium', type: 'diagram-interpretation', diagram: 'perpendicular-components',
      prompt: `يُظهر الرسم مركبتين متعامدتين تنطلقان من ${pointO}، وقطراً يصل ${pointO} بالنقطة ${pointM}. أي علاقة متجهية يوضحها؟`,
      options: [
        { id: 'vector-difference', content: tex('\\vec{\\mathrm{OM}}=\\vec{\\mathrm{OX}}-\\vec{\\mathrm{OY}}', 'vector OM equals vector OX minus vector OY') },
        { id: 'equal-components', content: `${V_OX} = ${V_OY}` },
        { id: 'vector-sum', content: tex('\\vec{\\mathrm{OM}}=\\vec{\\mathrm{OX}}+\\vec{\\mathrm{OY}}', 'vector OM equals vector OX plus vector OY') },
        { id: 'collinear', content: `${V_OX} و${V_OY} على حامل واحد.` },
      ],
    },
    {
      id: 'q14', lessonId: 'unit2-lesson1', sourcePages: [62], difficulty: 'advanced', type: 'numeric', numericUnit: 'N',
      prompt: `قوتان متعامدتان محصلتهما ${ltrText('15 N')}، وإحداهما ${ltrText('12 N')}. ما مقدار القوة الأخرى؟`,
      inputHint: 'أدخل المقدار بالنيوتن؛ اطرح مربع القوة المعروفة من مربع المحصلة ثم خذ الجذر.',
    },
    {
      id: 'q15', lessonId: 'unit2-lesson1', sourcePages: [57, 62], difficulty: 'advanced', type: 'single-choice',
      prompt: `إذا كانت محصلة قوتين مقدارها ${ltrText('15 N')}، فما وصف القوة ${V_F} التي تعاكس هذه المحصلة لتوازن الجسم؟`,
      options: [
        { id: 'equal-same', content: `مقدارها ${ltrText('15 N')} وعلى الحامل نفسه وفي جهة المحصلة.` },
        { id: 'equal-opposite', content: `مقدارها ${ltrText('15 N')}، وعلى حامل المحصلة نفسه، وجهتها معاكسة.` },
        { id: 'perpendicular', content: `مقدارها ${ltrText('15 N')} لكنها عمودية على المحصلة.` },
        { id: 'zero', content: `مقدارها ${ltrText('0 N')} لأن الحوامل متلاقية.` },
      ],
    },
    {
      id: 'q16', lessonId: 'unit2-lesson1', sourcePages: [59, 62], difficulty: 'advanced', type: 'matching',
      prompt: 'طابق كل حالة مع النتيجة المناسبة لها من أمثلة الدرس.',
      fields: [
        { id: 'sixty-eighty', content: `قوتان متعامدتان ${ltrText('60 N')} و${ltrText('80 N')}، والمقياس ${ltrText('1 cm = 20 N')}.` },
        { id: 'thirty-forty', content: `قوتان متعامدتان ${ltrText('30 N')} و${ltrText('40 N')}.` },
        { id: 'fifty-forty', content: `محصلة ${ltrText('50 N')}، وإحدى القوتين ${ltrText('40 N')}؛ القوتان متعامدتان.` },
        { id: 'twelve-sixteen', content: `قوتان متعامدتان ${ltrText('12 N')} و${ltrText('16 N')}.` },
      ],
      options: [
        { id: 'result-100-and-5cm', content: `محصلة ${ltrText('100 N')} وقطر رسم ${ltrText('5 cm')}.`, selectLabel: 'محصلة مئة نيوتن، وقطر رسم خمسة سنتيمترات.' },
        { id: 'result-50', content: `محصلة مقدارها ${ltrText('50 N')}.`, selectLabel: 'محصلة مقدارها خمسون نيوتن.' },
        { id: 'force2-30', content: `القوة الثانية ${ltrText('30 N')}.`, selectLabel: 'القوة الثانية مقدارها ثلاثون نيوتن.' },
        { id: 'result-20', content: `محصلة مقدارها ${ltrText('20 N')}.`, selectLabel: 'محصلة مقدارها عشرون نيوتن.' },
      ],
      inputHint: 'اختر نتيجة واحدة لكل حالة.',
    },
    {
      id: 'q17', lessonId: 'unit2-lesson1', sourcePages: [60], difficulty: 'advanced', type: 'error-analysis',
      prompt: `في نشاط المستوى المائل يظهر الرمز ${latinA}، ويظهر الرمز ${V_R} في مرجع الشكل، لكن اتجاه السهم غير واضح. أي مراجعة تتجنب التخمين؟`,
      options: [
        { id: 'replace-a', content: `استبدال الحرف المطبوع ${latinA} برمز زاوية آخر وتعيين معنى ${V_R} من المعتاد.` },
        { id: 'r-is-resultant', content: `اعتبار ${V_R} محصلة القوة دون دليل من اتجاه السهم.` },
        { id: 'a-is-force', content: `اعتبار ${latinA} اسم قوة لأن الشكل مائل.` },
        { id: 'preserve-a-review-r', content: `الإبقاء على ${latinA} حرفاً لاتينياً صغيراً، والرجوع إلى الشكل الأصلي قبل تعيين معنى ${V_R} أو اتجاهه.` },
      ],
    },
    {
      id: 'q18', lessonId: 'unit2-lesson1', sourcePages: [55, 56], difficulty: 'thinking', type: 'multiple-select',
      prompt: `بالاعتماد على نص التمهيد في ${ltrText('p55')} وتعريف الدرس، اختر العبارات التي يسندها النص من دون استنتاج تفاصيل من الصورة.`,
      options: [
        { id: 'balanced-certain', content: 'وصف المظلي وحده يثبت أن محصلة القوى عليه تساوي صفراً.' },
        { id: 'location-question-only', content: 'يسأل التمهيد أين تلتقي حبال المظلة، لكنه لا يحدد موضعاً تفصيلياً في النص المكتوب.' },
        { id: 'tension-magnitudes', content: 'يعطي نص التمهيد مقدار شد كل حبل.' },
        { id: 'definition-supported', content: 'تعريف القوى المتلاقية: تتلاقى حواملها في نقطة واحدة.' },
      ],
    },
    {
      id: 'q19', lessonId: 'unit2-lesson1', sourcePages: [59], difficulty: 'thinking', type: 'numeric', numericUnit: null,
      prompt: `في مثال القوتين المتعامدتين، ${ltrText('F₁ = 60 N')} والمحصلة ${ltrText('F = 100 N')}. اكتب النسبة ${ltrText('F₁/F')} في صورة كسر مبسط أو عدد عشري.`,
      inputHint: `يمكن كتابة ${ltrText('3/5')} أو ${ltrText('0.6')}؛ لا تكتب وحدة لأن المطلوب نسبة.`,
    },
    {
      id: 'q20', lessonId: 'unit2-lesson1', sourcePages: [60], difficulty: 'thinking', type: 'ordering',
      prompt: `رتّب خطوات تحليل القوة ${V_OM} إلى مركبتين على ${V_OX} و${V_OY} بحسب نشاط ${ltrText('p60')}.`,
      inputHint: 'اختر موضعاً لكل خطوة؛ لا يلزم سحب العناصر.',
      items: [
        { id: 'choose-origin', content: `تحديد النقطة ${pointO} على اللوح.` },
        { id: 'draw-original-force', content: `رسم القوة ${V_F} من ${pointO} وجعلها ${V_OM}.` },
        { id: 'draw-axes', content: `رسم المحورين المتعامدين ${V_OX} و${V_OY} من ${pointO}.` },
        { id: 'project-tip', content: `إسقاط النقطة ${pointM} عمودياً على المحورين.` },
        { id: 'identify-components', content: `تحديد المسقطين بوصفهما ${V_F1} و${V_F2}، وجمعهما متجهياً لإعادة القوة الأصلية.` },
      ],
    },
  ]),
});

export const QUESTIONS = LESSON_TEST.questions;
export const LESSON_ID = 'unit2-lesson1';
