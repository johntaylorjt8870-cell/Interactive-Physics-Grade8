/* Answer key, hints and model solutions for the Unit 2 Lesson 2 activities.
 *
 * This module is never imported by the student page's static graph: it is
 * fetched with a dynamic `import()` only after the student presses «تحقق»,
 * «تلميح» or «الحل النموذجي» in one activity. Nothing here is rendered into the
 * lesson markup, so no correct answer is visible before an attempt.
 *
 * Physics values are computed from src/unit2-lesson2-physics.js where possible
 * so the printed numbers and the checked numbers cannot drift apart.
 */
import { formula, tex } from './math.js';
import {
  P90_GRAPH_POINTS,
  P96_DATA,
  solveP96Question5,
} from './unit2-lesson2-physics.js';

const unit = (text) => `<bdi dir="ltr">${text}</bdi>`;

/* Accepted wording for the four terms of p95 question 1. Every variant is
   normalised by normalizeTermText before comparison, so diacritics, hamza
   forms, the ta-marbuta and punctuation never decide the result. */
const TERMS = Object.freeze([
  Object.freeze({
    id: 'current-intensity',
    label: 'كمية الشحنة التي تجتاز مقطع الناقل في الثانية الواحدة',
    accepted: Object.freeze(['شدة التيار', 'شدة التيار الكهربائي', 'شدة التيار الكهربائى', 'شدة التيار المستمر', 'current intensity', 'current strength']),
    answer: 'شِدّة التيّار الكهربائيّ',
    note: 'التعريف في الكتاب ص91: كمية الكهرباء المارّة عبر مقطع دارة كهربائية خلال واحدة الزمن.',
  }),
  Object.freeze({
    id: 'ampere',
    label: 'شحنة قدرها كولوم واحد تجتاز مقطع الناقل في ثانية واحدة',
    accepted: Object.freeze(['الامبير', 'امبير', 'امبير واحد', 'ampere', 'amp', 'a']),
    answer: 'الأمبير',
    note: 'تعريف الأمبير كما في الكتاب ص91، ورمزه A.',
  }),
  Object.freeze({
    id: 'ammeter',
    label: 'جهاز يستخدم لقياس شدة التيار ويوصل في الدارة على التسلسل',
    accepted: Object.freeze(['مقياس الامبير', 'الاميتر', 'اميتر', 'مقياس التيار', 'مقياس التيار الكهربائي', 'ammeter']),
    answer: 'مقياس الأمبير',
    note: 'يُوصل على التسلسل لكي يمر فيه التيار نفسه (ص92).',
  }),
  Object.freeze({
    id: 'continuous-current',
    label: 'حركة مستمرة ومباشرة للإلكترونات في دارة كهربائية مغلقة من القطب السالب إلى الموجب',
    accepted: Object.freeze([
      'التيار الكهربائي المتواصل', 'التيار المتواصل', 'التيار الكهربائي المستمر', 'التيار المستمر',
      'تيار متواصل', 'تيار مستمر', 'continuous current', 'direct current',
    ]),
    answer: 'التيّار الكهربائيّ المُتواصِل (المستمر)',
    note: 'التعريف المطبوع في ص88: انتقال مستمرّ للإلكترونات الحرّة باتجاه واحد، وجهتها خارج المولّد من السالب إلى الموجب.',
  }),
]);

export const UNIT2L2_ANSWERS = Object.freeze({
  /* Prediction checkpoints of the three labs. They are delivered with the rest
     of the answers, after the student has committed to a prediction. */
  'sim-tube': Object.freeze({
    kind: 'prediction',
    correct: 'three',
    correctFeedback: 'صحيح: ما دام الأنبوب ممتلئاً، دفع ثلاث كرات يُخرج ثلاث كرات من الطرف الآخر في اللحظة نفسها، لأن الذي ينتقل هو أثر الدفع.',
    incorrectFeedback: 'الأنبوب ممتلئ سلفاً، فدفع ثلاث كرات يزيح الصف كله ويُخرج ثلاث كرات من الطرف الآخر فوراً. جرّب «ادفع 3 كرات معاً» وراقب الطرف الآخر.',
  }),
  'sim-current': Object.freeze({
    kind: 'prediction',
    correct: 'double',
    correctFeedback: 'صحيح: العلاقة I = q/t خطية في q، فمضاعفة q مع بقاء t تضاعف شدة التيار.',
    incorrectFeedback: 'اربط التنبّؤ بالعلاقة I = q/t: q في البسط، فمضاعفتها مع بقاء t تضاعف I. جرّب في المختبر بمضاعفة q وحدها.',
  }),
  'sim-circuit': Object.freeze({
    kind: 'prediction',
    correct: 'equal',
    correctFeedback: 'صحيح: في الوصل على التسلسل المسار واحد، فشدة التيار واحدة في كل أجزاء الدارة، ومنها A₁ و A₂.',
    incorrectFeedback: 'على التسلسل يمر التيار نفسه في كل نقطة من المسار الواحد، لأن الشحنة لا تتجمع ولا تتناقص؛ فقراءة A₂ تساوي قراءة A₁.',
  }),
  'p90-table': Object.freeze({
    kind: 'table',
    values: Object.freeze([15, 25, 4, 4, 4]),
    hint: `<p>كل خانات الجدول تتبع النسبة نفسها المطبوعة في العمود الأول: ${tex('\\dfrac{q}{t}=4', 'q over t equals 4')}. للتوقّع: ${tex('t=\\dfrac{q}{4}', 't equals q over 4')} وللنسبة ${tex('\\dfrac{q}{t}', 'q over t')}.</p>`,
    solution: Object.freeze({
      title: 'إتمام الجدول',
      steps: Object.freeze([
        { label: 'الزمن عند q = 60 C', tex: 't=\\dfrac{60}{4}=15\\,\\mathrm{s}', text: '' },
        { label: 'الزمن عند q = 100 C', tex: 't=\\dfrac{100}{4}=25\\,\\mathrm{s}', text: '' },
        { label: 'النسبة في كل عمود', tex: '\\dfrac{20}{5}=\\dfrac{40}{10}=\\dfrac{60}{15}=\\dfrac{80}{20}=\\dfrac{100}{25}=4', text: '' },
      ]),
      note: 'الخلايا الفارغة لم تُطبع قيمها في الكتاب؛ القيم مستنتجة من ثبات النسبة 4 ومن نقاط الرسم المطبوعة على الصفحة نفسها، لا من خارجها.',
      table: Object.freeze({
        charge: Object.freeze([20, 40, 60, 80, 100]),
        time: Object.freeze([5, 10, 15, 20, 25]),
        ratio: Object.freeze([4, 4, 4, 4, 4]),
      }),
    }),
  }),

  'p90-graph': Object.freeze({
    kind: 'graph',
    points: P90_GRAPH_POINTS,
    hint: '<p>ابدأ من المبدأ وارفع خمس نقاط فقط، كل نقطة عند تقاطع زمن من مضاعفات 5 s مع كمية من مضاعفات 20 C. تحقق من نقطة واحدة: عند 10 s يجب أن تكون الكمية 40 C.</p>',
    solution: Object.freeze({
      title: 'رسم الخط البياني',
      steps: Object.freeze([
        { label: 'النقاط', text: 'النقاط المطبوعة في الكتاب: (5, 20) و(10, 40) و(15, 60) و(20, 80) و(25, 100).' },
        { label: 'الخط', tex: '\\dfrac{q}{t}=4\\,\\mathrm{A}', text: 'خط مستقيم يمر بالمبدأ: تناسب طردي بين q و t.' },
      ]),
      note: 'الخط المستقيم المار من المبدأ يعني أن شدة التيار ثابتة؛ ميل الخط هو شدة التيار 4 A.',
    }),
  }),

  'p95-q1': Object.freeze({
    kind: 'terms',
    terms: TERMS,
    hint: '<p>التعريفان الأول والثاني يختلفان في المفهوم لا في الوحدة: الأول اسم الكمية المقيسة، والثاني اسم وحدتها. والفقرة الرابعة تسمّي نوع التيار لا جهازه.</p>',
    solution: Object.freeze({
      title: 'المصطلحات العلمية',
      steps: TERMS.map((term) => ({ label: term.label, text: `<strong>${term.answer}</strong> — ${term.note}` })),
      note: 'تُقبل صيغ مكافئة للمصطلح نفسه إذا كان المعنى العلمي صحيحاً.',
    }),
  }),

  'p95-q2': Object.freeze({
    kind: 'truefalse',
    values: Object.freeze(['false', 'true']),
    hint: '<p>رجعت إلى اصطلاح أمبير في ص89: جهة التيار الاصطلاحية خارج المولّد من الموجب إلى السالب. أما وصل مقياس الأمبير فقد ورد صريحاً في ص92.</p>',
    solution: Object.freeze({
      title: 'صح أم خطأ',
      steps: Object.freeze([
        { label: 'العبارة 1', text: '<strong>خطأ.</strong> جهة التيار الاصطلاحية في الدارة المغلقة خارج المولّد من القطب الموجب إلى القطب السالب، عكس جهة حركة الإلكترونات. (المصدر: ص89)' },
        { label: 'العبارة 2', text: '<strong>صح.</strong> يُوصل مقياس الأمبير على التسلسل في الدارة الكهربائية. (المصدر: ص92)' },
      ]),
      note: 'العبارة المغلوطة تُصحَّح بتبديل الجهة لا بحذف العبارة: «جهة التيار … من الموجب إلى السالب خارج المولّد».',
    }),
  }),

  'p95-q3': Object.freeze({
    kind: 'choice',
    correct: 'd',
    hint: '<p>في التيار المتواصل تبقى شدة التيار ثابتة مع الزمن؛ ابحث عن منحنى قيمته لا تتغير مهما تغيّر الزمن.</p>',
    solution: Object.freeze({
      title: 'المنحنى الممثّل للتيار المتواصل',
      steps: Object.freeze([
        { label: 'الاختيار', text: '<strong>d</strong>: خط أفقي ثابت يعني شدة تيار لا تتغير مع الزمن.' },
        { label: 'لماذا لا غيرها', text: 'a تناقص أسّي و b موجة متغيرة الاتجاه و c درجات متقطعة؛ كلها تصف تغيّر الشدة مع الزمن، فلا تمثّل تياراً متواصلاً.' },
      ]),
      note: 'المصدر: ص95، السؤال الثالث، الفقرة 1.',
    }),
  }),

  'p96-q3b': Object.freeze({
    kind: 'choice',
    correct: 'b',
    hint: '<p>ارجع إلى استنتاج ص88: المولّد يُسبّب الحركة السابقة للإلكترونات، ولا يُنتج إلكترونات جديدة.</p>',
    solution: Object.freeze({
      title: 'المسبّب لحركة الإلكترونات',
      steps: Object.freeze([
        { label: 'الاختيار', text: '<strong>b. المولّد الكهربائي.</strong>' },
        { label: 'التعليل', text: 'المولّد يحافظ على فرق بين قطبية طرفيه فيدفع الإلكترونات الحرة في الناقل باتجاه واحد؛ المصباح والقاطعة ومقياس الأمبير لا تُسبّب هذه الحركة.' },
      ]),
      note: 'المصدر: ص96، تتمة السؤال الثالث، الفقرة 2.',
    }),
  }),

  'p96-q4': Object.freeze({
    kind: 'explain',
    criteria: Object.freeze({
      1: Object.freeze([
        'تذكر أن القاصمة المنصهرة جزء من الدارة يقطع التيار عند ارتفاعه.',
        'تربط القطع بحماية الأجهزة من التلف أو من الحريق.',
      ]),
      2: Object.freeze([
        'تذكر وجود إلكترونات حرة في المعادن.',
        'تذكر افتقار العوازل إلى إلكترونات حرة (أو ارتباطها الشديد بالذرات).',
      ]),
    }),
    model: Object.freeze({
      1: 'القاصمة المنصهرة سلك رقيق يُوضع على التسلسل في الدارة؛ فإذا زادت شدة التيار عن حدّ معين ارتفعت حرارته فانصهر فقطع الدارة، فيحمي الأجهزة من التلف ويقي من الحريق.',
      2: 'المعادن ناقلة لأن ذراتها تحتوي إلكترونات حرة كثيرة تتحرك في الشبكة الباعثة للتيار، أما العوازل فإلكتروناتها مرتبطة بنواتها ولا تتحرك بحرية، فلا تمرّر التيار الكهربائي.',
    }),
    hint: '<p>لكل تفسير مطلوب سببان مترابطان: الأول سبب فيزيائي (ماذا يحدث)، والثاني أثر عملي (لماذا يهمّنا). ابدأ من مفردات ص88 وص92.</p>',
    note: 'هذا سؤال تفسير؛ لا يصحّحه التطبيق آلياً. اكتب تفسيرك أولاً ثم قارنه بالمعايير والإجابة النموذجية، وقيّم بنفسك أي المعايير تحقّقت.',
  }),

  'p96-q5': Object.freeze({
    kind: 'numeric-steps',
    data: P96_DATA,
    parts: Object.freeze([
      Object.freeze({ id: 'current', label: 'شدة التيار المارّة في الدارة', expected: 0.1, unit: 'A', acceptedUnits: Object.freeze(['A', 'mA']) }),
      Object.freeze({ id: 'charge', label: 'كمية الكهرباء خلال 5 min', expected: 30, unit: 'C', acceptedUnits: Object.freeze(['C', 'mC']) }),
    ]),
    hint: `<p>حوّل الزمن إلى ثوانٍ أولاً: ${tex('2\\,\\mathrm{min}=120\\,\\mathrm{s}', '2 min equals 120 s')}. استخدم ${tex('I=\\dfrac{q}{t}', 'I equals q over t')} للجزء الأول، ثم ${tex('q=I\\,t', 'q equals I t')} للجزء الثاني مع ${tex('5\\,\\mathrm{min}=300\\,\\mathrm{s}', '5 min equals 300 s')}.</p>`,
    solution: Object.freeze({
      title: 'السؤال الخامس',
      steps: Object.freeze([
        { label: 'المعطيات', tex: `q=${P96_DATA.chargeC}\\,\\mathrm{C}\\;,\\;t=2\\,\\mathrm{min}=${P96_DATA.timeMin * 60}\\,\\mathrm{s}`, text: '' },
        { label: 'المطلوب 1', tex: 'I=\\dfrac{q}{t}=\\dfrac{12}{120}=0.1\\,\\mathrm{A}', text: '' },
        { label: 'المطلوب 2', tex: `q=I\\,t=0.1\\times300=${solveP96Question5().charge}\\,\\mathrm{C}`, text: '' },
      ]),
      note: `النتيجتان: ${unit('0.1 A = 100 mA')} و${unit('30 C')}. خطأ شائع: القسمة على 2 بدل 120 فتُقرأ الشدة ${unit('6 A')}، وهذا يخالف معطيات الصفحة ويجعل الجزء الثاني بلا معنى.`,
    }),
  }),
});

/** Answer, hint and solution for one activity; null when the id is unknown. */
export function unit2l2Answer(key) {
  return UNIT2L2_ANSWERS[key] ?? null;
}

export { TERMS as UNIT2L2_TERMS };
