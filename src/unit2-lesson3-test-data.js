import { ltrText, tex } from './math.js';

const ltr = (value, label = value) => ltrText(value, label);
const trueFalse = Object.freeze([{ id: 'true', content: 'صح' }, { id: 'false', content: 'خطأ' }]);
const q = (id, difficulty, type, sourcePages, config) => Object.freeze({ id, lessonId: 'unit2-lesson3', difficulty, type, sourcePages, ...config });

export const UNIT2L3_TEST = Object.freeze({
  id: 'unit2-lesson3',
  unit: 'الوحدة الثانية — الكهرباء',
  lesson: 'الدرس 3 — فرق الكمون الكهربائي',
  sourcePages: Object.freeze([97, 98, 99, 100, 101, 102, 103, 104, 105, 106]),
  questions: Object.freeze([
    q('u2l3q01', 'basic', 'single-choice', [97, 99], { prompt: 'أي وصف يعبّر أفضل عن فرق الكمون بين نقطتين؟', options: [
      { id: 'energy-charge', content: `مقدار الطاقة المنتقلة لكل وحدة شحنة بين النقطتين ${tex('U=\\dfrac{\\Delta E}{q}', 'U يساوي تغير الطاقة مقسوماً على الشحنة')}.` },
      { id: 'charge-only', content: 'كمية الشحنة المخزونة في أحد النقطتين.' },
      { id: 'wire-resistance', content: 'مقاومة السلك الواصل بين النقطتين.' },
      { id: 'electron-count', content: 'عدد الإلكترونات الحرة في المولد.' },
    ] }),
    q('u2l3q02', 'basic', 'numeric', [97, 105], { numericUnit: 'V', prompt: `حوّل فرق الكمون ${ltr('3.6 kV')} إلى فولت.`, inputHint: 'استخدم 1 kV = 1000 V.' }),
    q('u2l3q03', 'basic', 'single-choice', [99, 100], { prompt: 'أين يوصل الفولتميتر لقياس فرق الكمون بين طرفي مصباح؟', options: [
      { id: 'parallel', content: 'على التفرع بين طرفي المصباح.' },
      { id: 'series', content: 'على التسلسل في مسار التيار.' },
      { id: 'source-only', content: 'بين قطبي المولد فقط، لا على المصباح.' },
      { id: 'open-wire', content: 'على طرف واحد من المصباح دون الطرف الآخر.' },
    ] }),
    q('u2l3q04', 'basic', 'true-false', [100, 104, 105], { prompt: 'عندما تفتح القاطعة يصبح فرق الكمون بين قطبي المولد صفراً بالضرورة.', options: trueFalse }),
    q('u2l3q05', 'basic', 'single-choice', [100, 104], { prompt: 'أي عنصر يزود الدارة بالطاقة ويحافظ على فرق الكمون؟', options: [
      { id: 'generator', content: 'المولد الكهربائي؛ وهو ثنائي قطب فعّال.' },
      { id: 'lamp', content: 'المصباح؛ وهو ثنائي قطب فعّال.' },
      { id: 'wire', content: 'سلك التوصيل وحده.' },
      { id: 'switch', content: 'القاطعة المفتوحة.' },
    ] }),
    q('u2l3q06', 'basic', 'multiple-select', [97, 105, 106], { prompt: 'اختر كل تحويل صحيح لفرق الكمون.', options: [
      { id: 'kv', content: ltr('1 kV = 1000 V') },
      { id: 'mv', content: ltr('1 V = 1000 mV') },
      { id: 'quarter', content: ltr('250 mV = 0.25 V') },
      { id: 'wrong', content: ltr('1 mV = 0.01 V') },
    ] }),

    q('u2l3q07', 'medium', 'numeric', [101, 102], { numericUnit: 'V', prompt: `في دارة تسلسلية فرق المولد ${ltr('15 V')} وفرق الكمون على المصباح الثاني ${ltr('4 V')}. احسب فرق الكمون على المصباح الأول.`, inputHint: 'اطرح فرق الكمون المعروف من فرق المولد.' }),
    q('u2l3q08', 'medium', 'numeric', [102, 103], { numericUnit: 'V', prompt: `مصباحان موصولان على التفرع إلى مولد ${ltr('6 V')}. ما فرق الكمون على طرفي المصباح الثاني؟`, inputHint: 'في التفرع، فرق الكمون في كل فرع يساوي فرق كمون المولد.' }),
    q('u2l3q09', 'medium', 'matching', [99, 100, 101, 102, 104], { prompt: 'طابق كل عنصر أو توصيل بالعلاقة المناسبة.', inputHint: 'استخدم كل وصف مرة واحدة.', fields: [
      { id: 'voltmeter', content: 'الفولتميتر' },
      { id: 'series', content: 'مصباحان على التسلسل' },
      { id: 'parallel', content: 'مصباحان على التفرع' },
      { id: 'source', content: 'المولد الكهربائي' },
    ], options: [
      { id: 'parallel-meter', content: 'يقاس به فرق الكمون ويوصل على التفرع.' },
      { id: 'sum', content: 'فرق المولد يساوي مجموع الفروق الجزئية.' },
      { id: 'equal', content: 'فرق الكمون متساوٍ في جميع الفروع.' },
      { id: 'active', content: 'ثنائي قطب فعّال يمد الدارة بالطاقة.' },
    ] }),
    q('u2l3q10', 'medium', 'error-analysis', [100, 104, 105], { prompt: 'قال طالب: «إذا انعدم التيار عند فتح القاطعة، فلا بد أن ينعدم فرق الكمون بين قطبي المولد أيضاً». ما التصحيح الأدق؟', options: [
      { id: 'source-stays', content: 'الخلط بين التيار وفرق الكمون؛ يبقى للمولد فرق كمون بين قطبيه عند فتح الدارة.' },
      { id: 'zero-always', content: 'كلامه صحيح؛ فرق الكمون لا يوجد إلا مع التيار.' },
      { id: 'lamp-source', content: 'المصباح هو الذي يعيد فرق الكمون للمولد.' },
      { id: 'parallel-issue', content: 'المشكلة أن الفولتميتر يوصل على التسلسل.' },
    ] }),
    q('u2l3q11', 'medium', 'diagram-interpretation', [102, 103], { diagram: 'parallel-readings', prompt: `يعرض الشكل دارة تفرع ومولداً ${ltr('9 V')}. ما القراءة المتوقعة للفولتميتر V₂ الموصول على طرفي المصباح الثاني؟`, options: [
      { id: 'nine', content: ltr('9 V') },
      { id: 'four-half', content: ltr('4.5 V') },
      { id: 'zero', content: ltr('0 V') },
      { id: 'eighteen', content: ltr('18 V') },
    ] }),
    q('u2l3q12', 'medium', 'ordering', [100, 101, 102], { prompt: 'رتّب خطوات قياس فرق الكمون على طرفي مصباح بأمان في الدارة التعليمية.', inputHint: 'أبقِ القاطعة مفتوحة أثناء تركيب الجهاز، ثم أغلقها للقراءة.', items: [
      { id: 'build', content: 'أركّب المولد والمصباح والقاطعة في الدارة والقاطعة مفتوحة.' },
      { id: 'parallel', content: 'أصل الفولتميتر على التفرع بين طرفي المصباح.' },
      { id: 'check', content: 'أتحقق من اختيار مجال القياس وقطبية التوصيل.' },
      { id: 'close-read', content: 'أغلق القاطعة وأسجل قراءة الفولتميتر.' },
    ] }),
    q('u2l3q13', 'medium', 'numeric', [105, 106], { numericUnit: 'V', prompt: `حوّل ${ltr('820 mV')} إلى فولت.`, inputHint: 'كل 1000 mV تساوي 1 V.' }),

    q('u2l3q14', 'advanced', 'numeric', [101, 104], { numericUnit: 'V', prompt: `في مسار تسلسلي، فروق الكمون على ثلاثة عناصر هي ${ltr('3.6 V')}, ${ltr('5.4 V')}, و${ltr('3 V')}. احسب فرق كمون المولد.`, inputHint: 'اجمع فروق الكمون الجزئية.' }),
    q('u2l3q15', 'advanced', 'numeric', [105, 106], { numericUnit: 'mV', prompt: `حوّل ${ltr('0.015 kV')} إلى ميلي فولت.`, inputHint: 'حوّل أولاً إلى فولت، ثم إلى ميلي فولت.' }),
    q('u2l3q16', 'advanced', 'numeric', [101, 102], { diagram: 'series-three-drops', numericUnit: 'V', prompt: `في الشكل، فرق المولد ${ltr('24 V')} وقراءتا المصباحين الأول والثاني ${ltr('8 V')} و${ltr('9 V')}. ما فرق الكمون على المصباح الثالث؟`, inputHint: 'في التسلسل، مجموع الفروق الجزئية يساوي فرق المولد.' }),
    q('u2l3q17', 'advanced', 'numeric', [103], { numericUnit: 'turns', prompt: `في محول مثالي يخفض الكمون من ${ltr('220 V')} إلى ${ltr('110 V')}, إذا كان الملف الثانوي يحوي ${ltr('180 turns')}, فكم لفة تقريباً في الملف الابتدائي؟`, inputHint: 'استخدم نسبة لفات الابتدائي إلى الثانوي 2:1.' }),

    q('u2l3q18', 'thinking', 'single-choice', [101, 102, 103, 104], { prompt: `قيس في دارة ذات مصباحين فرق كمون ${ltr('9 V')} على كل مصباح، كما أن فرق المولد ${ltr('9 V')}. أي تفسير ينسجم مع القياسات؟`, options: [
      { id: 'parallel-nodes', content: 'المصباحان على التفرع؛ كل منهما بين العقدتين نفسيهما.' },
      { id: 'series-add', content: 'المصباحان على التسلسل؛ فرق كل واحد يساوي المولد، والمجموع 18 V.' },
      { id: 'source-broken', content: 'المولد غير فعّال لأن القراءات متساوية.' },
      { id: 'meters-series', content: 'الفولتميتران موصولان على التسلسل، لذا لا معنى لأي قراءة.' },
    ] }),
    q('u2l3q19', 'thinking', 'true-false', [99, 100, 104], { prompt: `قد يقرأ فولتميتر بين قطبي المولد ${ltr('6 V')} مع فتح القاطعة في الوقت الذي يقرأ فيه الأمبيرمتر صفراً. لا يوجد تناقض؛ ففرق الكمون ليس هو التيار.`, options: trueFalse }),
    q('u2l3q20', 'thinking', 'single-choice', [103], { prompt: `جهاز مصمم للعمل على ${ltr('110 V')} ويُغذى من مصدر منزلي ${ltr('220 V')}. أي قرار يعبّر عن فهم مناسب للمحول والسلامة؟`, options: [
      { id: 'safe-stepdown', content: 'يحتاج إلى محول خافض مناسب؛ وفي المحول المثالي تكون نسبة لفات الابتدائي إلى الثانوي 2:1، ولا تُجرى تجربة مباشرة على كهرباء المنزل.' },
      { id: 'connect', content: 'يوصل مباشرة لأن المحول يرفع جميع الجهود تلقائياً.' },
      { id: 'resistor', content: 'يضاف سلك مقاومة عشوائي على التسلسل بدلاً من المحول.' },
      { id: 'dc', content: 'يُستخدم محول عادي مع أي مصدر مستمر، ولا يلزم الانتباه إلى نوع الخرج.' },
    ] }),
  ]),
});

export const UNIT2L3_QUESTIONS = UNIT2L3_TEST.questions;
