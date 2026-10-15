import { formula, ltrText } from './math.js';
const ltr = (v) => ltrText(v);
const eq = (s, l) => `<div class="assessment-formula">${formula(s, l)}</div>`;
const item = (questionId, answerKey, answerHtml, explanationHtml) => Object.freeze({ questionId, answerKey, answerHtml, explanationHtml });
const all = [
  item('u2l2q01', 'flow', 'انتقال مستمر للإلكترونات الحرة باتجاه واحد.', '<p>تعريف الكتاب ص88 و94: التيار المتواصل انتقال مستمر للإلكترونات الحرة باتجاه واحد في الناقل.</p>'),
  item('u2l2q02', 'true', 'صح.', '<p>اصطلاح أمبير ص89: الجهة خارج المولّد من الموجب إلى السالب، عكس الإلكترونات.</p>'),
  item('u2l2q03', 'amp', 'الأمبير (A).', '<p>I تقدر بالأمبير؛ الكولوم وحدة الكمية q.</p>'),
  item('u2l2q04', 'conv', 'جهة التيار الاصطلاحية.', '<p>السهم من + إلى − خارج المولّد هو اصطلاح أمبير؛ الأحمر لحركة الإلكترونات.</p>'),
  item('u2l2q05', { value: 4, tolerance: 0.01, unit: 'A' }, ltr('4 A'), `${eq('I=\\frac{40}{10}=4\\,\\mathrm{A}', 'I equals 4 A')}<p>نفس نسبة جدول ص90.</p>`),
  item('u2l2q06', ['same', 'open', 'amm'], 'تيار ثابت، ونزع يقطع الكل، والأمبير على التسلسل.', '<p>مجموع الفرعين قانون التفرع لا التسلسل.</p>'),
  item('u2l2q07', { symI: 'current', symQ: 'charge', ammeter: 'meter', gen: 'cause' }, 'I شدة؛ q كمية؛ الأمبير قياس تسلسلي؛ المولّد يسبب الحركة.', '<p>I شدة التيار بالأمبير، وq كمية الكهرباء بالكولوم، ومقياس الأمبير يوصل على التسلسل، والمولّد يسبب حركة الإلكترونات ولا ينتجها كما في ص94.</p>'),
  item('u2l2q08', { value: 360, tolerance: 1, unit: 'C' }, ltr('360 C'), `${eq('q=2\\times(3\\times60)=360\\,\\mathrm{C}', 'q equals 360 C')}<p>تطبيق الكتاب ص91.</p>`),
  item('u2l2q09', 'mix', 'خلط الجهتين.', '<p>الإلكترونات من السالب إلى الموجب؛ التيار الاصطلاحي بالعكس.</p>'),
  item('u2l2q10', 'closed', 'مولّد ودارة مغلقة.', '<p>حتى يمر تيار يجب أن تحتوي الدارة مولّداً وأن تكون مغلقة، وهذا بند صريح في «تعلمت» ص94.</p>'),
  item('u2l2q11', { value: 0.2, tolerance: 0.001, unit: 'A' }, ltr('0.2 A'), `${eq('200\\times10^{-3}=0.2\\,\\mathrm{A}', '0.2 A')}<p>قراءة شكل ص92.</p>`),
  item('u2l2q12', 'false', 'خطأ.', '<p>على التفرع الشدات مختلفة؛ المجموع يساوي الأصل.</p>'),
  item('u2l2q13', ['place', 'fill', 'one', 'many'], 'أفقي، ملء، كرة، ثم عدد من الكرات.', '<p>ترتيب الكتاب ص88: سطح أفقي ثم الملء ثم دفع كرة ثم دفع عدد من الكرات من الطرف نفسه.</p>'),
  item('u2l2q14', 'const', 'q/t ثابتة.', '<p>الميل 4 A وخط مستقيم يعني تياراً متواصلاً ثابتاً.</p>'),
  item('u2l2q15', { value: 0.1, tolerance: 0.01, unit: 'A' }, ltr('0.1 A'), `${eq('I=\\frac{12}{120}=0.1\\,\\mathrm{A}', '0.1 A')}<p>مسألة ص96 بعد تحويل الدقيقتين.</p>`),
  item('u2l2q16', 'time', 'نسيان تحويل الدقائق.', '<p>ثلاث دقائق تساوي 180 ثانية لا 3 ثوانٍ؛ لذلك q = 2×180 = 360 C كما في تطبيق ص91.</p>'),
  item('u2l2q17', ['diff', 'sum', 'keep'], 'شدات مختلفة، والمجموع للأصل، ونزع فرع لا يطفئ الباقي.', '<p>استنتاج ص94: الشدات مختلفة على التفرع، وI = I1 + I2، ونزع جهاز من فرع يبقي التيار في البقية.</p>'),
  item('u2l2q18', 'field', 'الإلكترونات موجودة سلفاً في الناقل.', '<p>تشبيه الأنبوب: الصف ممتلئ والدفع يظهر في الطرف الآخر دون سفر كرة واحدة عبر كل الطول بسرعة الضوء.</p>'),
  item('u2l2q19', ['ser', 'ser-off', 'par', 'par-off'], 'تسلسل وقياسه ثم قطعه؛ تفرع ومجموعه ثم نزع فرع.', '<p>تجربتا ص92–93 بالترتيب التعليمي للمقارنة.</p>'),
  item('u2l2q20', { value: 200, tolerance: 1, unit: 'mA' }, ltr('200 mA'), `${eq('I=120+80=200\\,\\mathrm{mA}', '200 mA')}<p>I = I1 + I2 على التفرع.</p>`),
];
export const SOLUTION_GROUPS = Object.freeze(Array.from({ length: 4 }, (_, i) => Object.freeze({
  id: `unit2l2-group-${i + 1}`,
  title: `الأسئلة ${i * 5 + 1}–${i * 5 + 5}`,
  questionIds: Object.freeze(all.slice(i * 5, i * 5 + 5).map((e) => e.questionId)),
  items: Object.freeze(all.slice(i * 5, i * 5 + 5)),
})));
export const ANSWER_KEY = Object.freeze(Object.fromEntries(all.map((e) => [e.questionId, e.answerKey])));
export const SOLUTIONS = Object.freeze(Object.fromEntries(all.map((e) => [e.questionId, e])));
