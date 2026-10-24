// Loaded only after a learner asks for a hint, a check, or a solution.
// These are platform-derived aids for the printed questions, not additional book text.
export const UNIT2_SELF_CHECK_ANSWERS = Object.freeze({
  'charge-activity': {
    kind: 'numeric', expected: 3.2e-8, unit: 'C',
    hint: 'الفقد يعني شحنة موجبة. استخدم q = n e مع e = 1.6×10⁻¹⁹ C، وانتبه إلى أن n = 20×10¹⁰.',
    solution: [
      { label: 'القانون', tex: 'q=ne' },
      { label: 'التعويض', tex: 'q=(20\\times10^{10})(1.6\\times10^{-19})=+3.2\\times10^{-8}\\,\\mathrm{C}' },
      { label: 'الإشارة', text: 'الجسم فقد إلكترونات، لذلك تكون شحنته موجبة.' },
    ],
    note: 'ملاحظة من المنصة: نستخدم e هنا مقداراً موجباً لشحنة الإلكترون، كما في تطبيق الكتاب؛ إشارة الشحنة الناتجة تحدد من الفقد أو الاكتساب.',
  },
  'positive-electroscope': {
    kind: 'choice', correct: 'negative-induction',
    hint: 'للحصول على شحنة موجبة بالتأثير، نحتاج إلى مؤثر سالب وتأريض مؤقت، مع بقاء المؤثر قريباً أثناء اللمس.',
    solution: [
      { label: 'الطريقة', text: 'نقرب ساقاً سالبة من قرص الكاشف دون ملامسته، ثم نلمس القرص بالإصبع، ثم نبعد الإصبع والساق معاً.' },
      { label: 'التفسير', text: 'يتجمع المخالف للمؤثر في الطرف القريب، ويغادر المماثل عبر التأريض؛ بعد الإبعاد تبقى شحنة موجبة.' },
    ],
  },
  'selfcheck-fill': {
    kind: 'fill', items: ['مختلفين', 'تنافر', 'مماثلة', 'التأثير', 'شحنة'],
    hint: 'راجع تعريفي التجاذب والتنافر، ثم فرّق بين اللمس والتأثير؛ الفراغ الأخير اسم ما تكتسبه الوريقتان.',
    solution: [
      { label: 'الإجابات بالترتيب', text: 'مختلفين؛ تنافر؛ مماثلة؛ التأثير؛ شحنة.' },
    ],
  },
  'selfcheck-truth': {
    kind: 'truth',
    items: [
      { truth: false, correction: 'insulator' },
      { truth: true },
      { truth: true },
      { truth: false, correction: 'same-sign' },
    ],
    hint: 'لا تبحث عن كلمة موجبة كلما قرأت تدافعاً؛ المهم تماثل النوع. وتذكّر أن البلاستيك عازل.',
    solution: [
      { label: '1', text: 'غلط: الساق البلاستيكية عازلة، فلا تتكهرب باللمس بهذه الصورة.' },
      { label: '2', text: 'صح: دلك البلاستيك بالصوف يكسبه شحنة سالبة.' },
      { label: '3', text: 'صح: في الذرة المعتدلة تتساوى شحنة الإلكترونات وشحنة البروتونات بالقيمة المطلقة.' },
      { label: '4', text: 'غلط: التدافع يعني أن الشحنتين متماثلتان، وقد تكونان موجبتين أو سالبتين.' },
    ],
  },
  'selfcheck-conductor': {
    kind: 'choice', correct: 'isolated-rubbing',
    hint: 'فكّر في مصير الشحنة إذا كان الناقل متصلاً بالأرض، وما الذي يغيّره وجود مقبض عازل.',
    solution: [
      { label: 'الإجابة', text: 'نعم، يمكن أن يتكهرب الناقل بالدلك إذا كان معزولاً، مثل حمله بمقبض عازل، حتى لا تتسرب الشحنة إلى الأرض.' },
    ],
  },
  'selfcheck-matching': {
    kind: 'matching', items: ['تكهرب', 'تدافع', 'البروتون', 'تفريغ', 'عازل'],
    hint: 'اربط ظهور الشرارات بالتفريغ، والابتعاد بين الجسمين المتماثلين بالتدافع، ثم أكمل الباقي.',
    solution: [
      { label: 'المطابقة', text: '1 ← تكهرب، 2 ← تدافع، 3 ← البروتون، 4 ← تفريغ، 5 ← عازل. يبقى «موجب» دون استخدام.' },
    ],
  },
  'mol-charge': {
    kind: 'numeric', expected: -96320, unit: 'C',
    hint: 'اضرب عدد الإلكترونات في شحنة الإلكترون الواحد، واحتفظ بالإشارة السالبة.',
    solution: [
      { label: 'القانون', tex: 'q=Ne' },
      { label: 'التعويض', tex: 'q=(6.02\\times10^{23})(-1.6\\times10^{-19})=-9.632\\times10^{4}\\,\\mathrm{C}' },
      { label: 'النتيجة', text: 'شحنة مول من الإلكترونات تساوي −96320 C، أي −9.632×10⁴ C.' },
    ],
  },
  'distance-force': {
    kind: 'numeric', expected: 2.32, unit: 'N',
    hint: 'المسافة الجديدة d₂ = d₁/4. بما أن F تتناسب عكساً مع d²، اضرب القوة الابتدائية في 16.',
    solution: [
      { label: 'النسبة', tex: '\\frac{F_{2}}{F_{1}}=\\left(\\frac{d_{1}}{d_{2}}\\right)^{2}=4^{2}=16' },
      { label: 'التعويض', tex: 'F_{2}=0.145\\times16=2.32\\,\\mathrm{N}' },
    ],
  },
  'three-charge-problem': {
    kind: 'vectors', expected: { f12: 6.75, f13: 1, resultant: 5.75 },
    directions: { f12: 'left', f13: 'right', resultant: 'left' },
    hint: 'احسب AC = AB + BC أولاً. على q₁: تنافر q₂ إلى اليسار، وتجاذب q₃ إلى اليمين؛ اطرح الشدتين المتعاكستين.',
    solution: [
      { label: 'المسافات', tex: 'AC=AB+BC=20+40=60\\,\\mathrm{cm}=0.60\\,\\mathrm{m}' },
      { label: 'القوة بين q₁ وq₂', tex: 'F_{12}=9\\times10^{9}\\frac{(5\\times10^{-6})(6\\times10^{-6})}{(0.20)^{2}}=6.75\\,\\mathrm{N}' },
      { label: 'القوة بين q₁ وq₃', tex: 'F_{13}=9\\times10^{9}\\frac{(5\\times10^{-6})(8\\times10^{-6})}{(0.60)^{2}}=1\\,\\mathrm{N}' },
      { label: 'المحصلة', tex: 'F_{net}=6.75-1=5.75\\,\\mathrm{N}' },
      { label: 'الجهة والرسم', text: 'القوة 6.75 N على q₁ إلى اليسار (تنافراً عن q₂)، والقوة 1 N إلى اليمين (تجاذباً نحو q₃). المحصلة 5.75 N إلى اليسار، بعيداً عن q₂ وC/q₃.' },
    ],
  },
});

export function unit2SelfCheckAnswer(key) {
  return UNIT2_SELF_CHECK_ANSWERS[key] ?? null;
}
