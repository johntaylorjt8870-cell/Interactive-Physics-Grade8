import { formula, qty, tex, vector } from './math.js';

const force = (magnitude, angleDegrees) => Object.freeze({ magnitude, angleDegrees });

export const APPENDIX_EXTENSION_LABEL = 'ملحق تفاعلي — Platform Extension';
export const EDUCATIONAL_MODEL_LABEL = 'نموذج تعليمي مبسّط — Educational simplified model';

/** Each scenario has its own mathematical purpose and an observation prompt. */
export const FORCE_PRESETS = Object.freeze([
  Object.freeze({
    id: 'same-direction',
    title: 'قوتان في الاتجاه نفسه',
    countLabel: 'قوتان',
    forces: Object.freeze([force(5, 0), force(3, 0)]),
    observation: 'لاحظ أن المتجهين يشيران إلى اليمين؛ مركبتاهما تتجمعان، فتكون المحصلة في الاتجاه نفسه وبمقدار مجموعهما.',
    prediction: 'قبل التشغيل: هل تتوقع أن تكون المحصلة أكبر من كل قوة منفردة أم أصغر؟',
  }),
  Object.freeze({
    id: 'opposite',
    title: 'قوتان متعاكستان',
    countLabel: 'قوتان',
    forces: Object.freeze([force(8, 0), force(5, 180)]),
    observation: 'اتجاه القوتين متعاكس. لا نجمع المقدارين مباشرة: تطرح المركبتان، ويحدد اتجاه القوة الأكبر جهة المحصلة.',
    prediction: 'راقب أي القوتين أطول، ثم قارن جهة المحصلة بجهتها.',
  }),
  Object.freeze({
    id: 'equal-perpendicular',
    title: 'قوتان متساويتان ومتعامدتان',
    countLabel: 'قوتان',
    forces: Object.freeze([force(5, 0), force(5, 90)]),
    observation: 'المقداران متساويان والزاوية بينهما قائمة؛ يقع اتجاه المحصلة في منتصف الاتجاهين، ومقدارها ليس جمع المقدارين مباشرة.',
    prediction: 'هل تتجه المحصلة أقرب إلى اليمين أم إلى الأعلى، أم تقع بينهما؟',
  }),
  Object.freeze({
    id: 'angled-pair',
    title: 'قوتان بزاوية مختلفة',
    countLabel: 'قوتان',
    forces: Object.freeze([force(8, 0), force(6, 60)]),
    observation: 'تتغير مركبات القوة الثانية مع زاويتها. غيّر مقدارها أو زاويتها ثم قارن طول المحصلة واتجاهها.',
    prediction: 'تتبّع طرف كل سهم: المحصلة هي جمع المتجهين من نقطة التأثير المشتركة.',
  }),
  Object.freeze({
    id: 'three-forces',
    title: 'ثلاث قوى متلاقية',
    countLabel: 'ثلاث قوى',
    forces: Object.freeze([force(4, 0), force(3, 90), force(4, 180)]),
    observation: 'القوتان الأفقيتان غير متساويتين؛ بعد جمع مركبات اليمين واليسار تبقى مركبة متجهة إلى الأعلى.',
    prediction: 'تحقق من المركبة الأفقية أولاً: ماذا يبقى بعد طرح القوتين المتعاكستين؟',
  }),
  Object.freeze({
    id: 'angle-explorer',
    title: 'غيّر الزاوية واستكشف',
    countLabel: 'قوتان',
    forces: Object.freeze([force(6, 0), force(6, 60)]),
    observation: 'غيّر زاوية القوة الثانية وحدها. مقدارها ثابت، لكن مركبتيها الأفقية والرأسية تتغيران، لذلك تتغير المحصلة.',
    prediction: 'حرّك زاوية القوة الثانية عبر نصف دورة ولاحظ تغير المحصلة.',
  }),
  Object.freeze({
    id: 'balanced-three',
    title: 'ثلاث قوى متزنة',
    countLabel: 'ثلاث قوى',
    forces: Object.freeze([force(6, 0), force(6, 120), force(6, 240)]),
    observation: 'ثلاثة متجهات متساوية تتوزع بانتظام حول نقطة التأثير؛ مجموع مركبات x ومجموع مركبات y يساويان صفراً.',
    prediction: 'إذا بدأت التجربة من السكون، فهل يتسارع الجسم عندما تكون المحصلة صفراً؟',
  }),
]);

export const PRESET_BY_ID = new Map(FORCE_PRESETS.map((preset) => [preset.id, preset]));

export const WORKED_EXAMPLE = Object.freeze({
  title: 'قوتان متعامدتان: من المركبات إلى المحصلة',
  introduction: 'مثال تدريبي مستقل من المنصة، وليس مثالاً من صفحات الكتاب.',
  steps: Object.freeze([
    Object.freeze({
      kind: 'given',
      label: 'المعطيات',
      html: `<p>تؤثر عند نقطة واحدة ${vector('F', '1')} مقدارها ${qty(3, 'N')} نحو الشرق، و${vector('F', '2')} مقدارها ${qty(4, 'N')} نحو الشمال. الزاوية بينهما قائمة.</p>`,
    }),
    Object.freeze({
      kind: 'required',
      label: 'المطلوب',
      html: `<p>إيجاد مقدار المحصلة ${vector('F')} واتجاهها مقاساً من محور x الموجب.</p>`,
    }),
    Object.freeze({
      kind: 'law',
      label: 'القانون',
      html: `<p>نجمع المركبات على كل محور، ثم نستخدم فيثاغورس للمقدار:</p>${formula('F=\\sqrt{F_x^{2}+F_y^{2}}', 'F = square root of F x squared plus F y squared')}
        <p>وللاتجاه: ${tex('\\theta=\\tan^{-1}(F_y/F_x)', 'theta equals inverse tangent of F y over F x')}.</p>`,
    }),
    Object.freeze({
      kind: 'substitution',
      label: 'التعويض',
      html: `<p>${tex('F_x=3~\\mathrm{N}', 'F x equals 3 newtons')}، و${tex('F_y=4~\\mathrm{N}', 'F y equals 4 newtons')}.</p>
        <p>${tex('F=\\sqrt{3^{2}+4^{2}}', 'F equals square root of 3 squared plus 4 squared')}، و${tex('\\theta=\\tan^{-1}(4/3)', 'theta equals inverse tangent of 4 over 3')}.</p>`,
    }),
    Object.freeze({
      kind: 'arithmetic',
      label: 'الحساب',
      html: `<p>${tex('F=\\sqrt{9+16}=5~\\mathrm{N}', 'F equals square root of 9 plus 16 equals 5 newtons')}.</p>
        <p>${tex('\\theta\\approx53.1^{\\circ}', 'theta is approximately 53.1 degrees')}.</p>`,
    }),
    Object.freeze({
      kind: 'unit',
      label: 'الوحدة',
      html: `<p>مقدار المحصلة يقاس بالنيوتن؛ الزاوية مقدارها ${tex('53.1^{\\circ}', '53.1 degrees')} وليست قوة.</p>`,
    }),
    Object.freeze({
      kind: 'check',
      label: 'التحقق',
      html: `<p>${qty(5, 'N')} أكبر من كل من ${qty(3, 'N')} و${qty(4, 'N')} وأصغر من مجموعهما ${qty(7, 'N')}، وهذا متوقع لقوتين متعامدتين. واتجاهها في الربع الأول لأن المركبتين موجبتان.</p>`,
    }),
  ]),
});

export const PRACTICE_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'reduce-one-force',
    title: 'توقّع ثم غيّر مقدار قوة',
    promptHtml: `<p>في تجربة <strong>ثلاث قوى متزنة</strong>: ${vector('F', '1')} و${vector('F', '2')} مقدارهما ${qty(6, 'N')} عند ${tex('0^{\\circ}', '0 degrees')} و${tex('120^{\\circ}', '120 degrees')}. مقدار ${vector('F', '3')} هو ${qty(6, 'N')} عند ${tex('240^{\\circ}', '240 degrees')}.</p>
      <p>قبل لمس المختبر: إذا خُفّض مقدار ${vector('F', '3')} إلى ${qty(3, 'N')} وبقي اتجاهه كما هو، فما المحصلة الجديدة؟</p>`,
    choices: Object.freeze([
      Object.freeze({ id: 'three-at-60', html: `${qty(3, 'N')} عند ${tex('60^{\\circ}', '60 degrees')} من محور x الموجب` }),
      Object.freeze({ id: 'three-at-240', html: `${qty(3, 'N')} عند ${tex('240^{\\circ}', '240 degrees')} من محور x الموجب` }),
      Object.freeze({ id: 'still-zero', html: `${qty(0, 'N')}؛ تبقى القوى متزنة` }),
    ]),
    correctChoice: 'three-at-60',
    feedbackCorrectHtml: `<p><strong>صحيح، والسبب هو جمع المركبات.</strong> كان مجموع ${vector('F', '1')} و${vector('F', '2')} يساوي ${qty(6, 'N')} عند ${tex('60^{\\circ}', '60 degrees')}. تقليل القوة الثالثة المتجهة عند ${tex('240^{\\circ}', '240 degrees')} من ${qty(6, 'N')} إلى ${qty(3, 'N')} يترك محصلة ${qty(3, 'N')} عند ${tex('60^{\\circ}', '60 degrees')}.</p>`,
    feedbackIncorrectHtml: `<p><strong>راجع المركبات بدلاً من جمع المقادير وحدها.</strong> المتجهان الأول والثاني يجمعان إلى ${qty(6, 'N')} عند ${tex('60^{\\circ}', '60 degrees')}. القوة الثالثة بعد التغيير مقدارها ${qty(3, 'N')} عند ${tex('240^{\\circ}', '240 degrees')}، أي تعاكس جزءاً من ذلك المتجه؛ لذلك تبقى محصلة إلى جهة ${tex('60^{\\circ}', '60 degrees')} ولا تساوي صفراً.</p>`,
    applyLabel: 'طبّق التغيير في المختبر',
    applyForces: Object.freeze([force(6, 0), force(6, 120), force(3, 240)]),
    applyObservation: 'خُفّضت القوة الثالثة فقط وبقي اتجاهها ثابتاً. توقّع المحصلة الجديدة، ثم شغّل الحركة وقارنها بتنبؤك.',
  }),
  Object.freeze({
    id: 'opposite-error',
    title: 'اكتشف الخطأ في القوى المتعاكسة',
    promptHtml: `<p>في تجربة القوتين المتعاكستين تؤثر ${vector('F', '1')} بمقدار ${qty(8, 'N')} عند ${tex('0^{\\circ}', '0 degrees')}، وتؤثر ${vector('F', '2')} بمقدار ${qty(5, 'N')} عند ${tex('180^{\\circ}', '180 degrees')}.</p>
      <p>كتب طالب أن المحصلة ${qty(13, 'N')} نحو الشرق لأنه جمع المقدارين. ما التصحيح؟</p>`,
    choices: Object.freeze([
      Object.freeze({ id: 'three-east', html: `${qty(3, 'N')} نحو الشرق؛ نطرح المتعاكسين ويتبع الاتجاه القوة الأكبر` }),
      Object.freeze({ id: 'thirteen-east', html: `${qty(13, 'N')} نحو الشرق؛ تجمع المقادير دائماً` }),
      Object.freeze({ id: 'three-west', html: `${qty(3, 'N')} نحو الغرب؛ اتجاه القوة الأصغر هو الحاسم` }),
    ]),
    correctChoice: 'three-east',
    feedbackCorrectHtml: `<p><strong>صحيح.</strong> على محور x تكون المحصلة ${tex('R_x=8-5=3~\\mathrm{N}', 'R x equals 8 minus 5 equals 3 newtons')} نحو الشرق. جمع ${qty(8, 'N')} و${qty(5, 'N')} مباشرة يتجاهل أن الاتجاهين متعاكسان.</p>`,
    feedbackIncorrectHtml: `<p><strong>الفكرة التي تكشف الخطأ هي اتجاه المركبات.</strong> القوتان على المحور نفسه لكن بإشارتين متعاكستين؛ إذن ${tex('R_x=8-5=3~\\mathrm{N}', 'R x equals 8 minus 5 equals 3 newtons')}. الإشارة الموجبة تعني الشرق، وهو اتجاه القوة الأكبر.</p>`,
    applyLabel: 'حمّل تجربة القوتين المتعاكستين',
    applyPresetId: 'opposite',
    applyObservation: 'شغّل الحركة بعد التحميل، ثم عدّل إحدى القوتين ولاحظ تغير المحصلة.',
  }),
]);

export const ZERO_RESULTANT_CHALLENGE = Object.freeze({
  id: 'balance-the-forces',
  title: 'اجعل المحصلة صفراً',
  forces: Object.freeze([force(4, 0), force(3, 90), force(5, 180)]),
  target: Object.freeze({ x: 0, y: 0 }),
  tolerance: 0.15,
  editableForceIndex: 2,
});

export function findPreset(id) {
  return PRESET_BY_ID.get(id) ?? null;
}

export function findPracticeQuestion(id) {
  return PRACTICE_QUESTIONS.find((question) => question.id === id) ?? null;
}
