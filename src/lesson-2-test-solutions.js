import { V_F2, formula, ltrText, tex } from './math.js';
const ltr = (value) => ltrText(value);
const eq = (source,label) => `<div class="assessment-formula">${formula(source,label)}</div>`;
const item = (questionId, answerKey, answerHtml, explanationHtml) => Object.freeze({ questionId, answerKey, answerHtml, explanationHtml });
const all = [
  item('l2q01','parallel-carriers','حواملها مستقيمات متوازية.','<p>التعريف هندسي ويتعلق بالحوامل. لا يشترط تساوي القوى أو اتزانها.</p>'),
  item('l2q02','true','صح.',`<p>عندما تتفق الجهتان تجمع الشدتان: ${tex('F=F_{1}+F_{2}','F equals F one plus F two')}.</p>`),
  item('l2q03',['between','same-sense','parallel'],'بين القوتين، وبجهتهما، وحاملها موازٍ.',`<p>تقع المحصلة بين القوتين وأقرب إلى الأكبر، وتتجه بجهتهما. الخيار «أقرب إلى الأصغر» يعكس العلاقة ${tex('F_{1}d_{1}=F_{2}d_{2}','F one d one equals F two d two')}.</p>`),
  item('l2q04','same','القوتان متوازيتان وبجهة واحدة.','<p>الحاملان رأسيان متوازيان والسهمان إلى أعلى، لذا الجهة واحدة. وجود محصلة بينهما لا يعني أنها صفر.</p>'),
  item('l2q05',{value:45,tolerance:0.01,unit:'N'},ltr('45 N'),`${eq('F=18+27=45~\\mathrm{N}','F equals 18 plus 27 equals 45 newtons')}<p>الوحدة نيوتن لأننا جمعنا شدتي قوتين.</p>`),
  item('l2q06',['identify','sum','locate','check'],'تحديد الجهة، ثم الجمع، ثم الموضع، ثم التحقق.','<p>اختيار القانون يتبع تحديد الجهتين. بعد الشدة نستخدم تساوي الجداءين للموقع، وأخيراً نتحقق من وقوعه بين القوتين وأقرب إلى الأكبر.</p>'),
  item('l2q07',{magnitude:'sum',sense:'forces-sense',carrier:'parallel',point:'inside'},'الشدة: المجموع؛ الجهة: جهة القوتين؛ الحامل: موازٍ؛ النقطة: بينهما.', '<p>هذه العناصر الأربعة تصف القوة المكافئة كاملة. لا تكفي الشدة وحدها لتمثيل المحصلة.</p>'),
  item('l2q08',{value:50,tolerance:0.01,unit:'cm'},ltr('50 cm'),`${eq('F=15+25=40~\\mathrm{N}','F equals 40 newtons')}${eq('d_{A}=\\frac{F_{2}d}{F}=\\frac{25\\times80}{40}=50~\\mathrm{cm}','distance from A equals 25 times 80 over 40 equals 50 centimeters')}<p>تبعد عن B مقدار ${ltr('30 cm')}، فتكون أقرب إلى القوة الأكبر ${ltr('25 N')}.</p>`),
  item('l2q09','inverse','العلاقة عكسية؛ القوة الأكبر يكون بعدها أصغر.','<p>لكي يتساوى الجداءان، يعوض المقدار الأكبر بعد أصغر. لذلك تقترب C من القوة الأكبر لا من الأصغر.</p>'),
  item('l2q10','outside-larger',`خارج القطعة ومن جهة القوة الأكبر.`,'<p>عند تعاكس الجهتين لا تقع المحصلة بين القوتين. تنتقل إلى امتداد AB من جهة القوة الأكبر وتتجه بجهتها.</p>'),
  item('l2q11',{value:45,tolerance:0.01,unit:'N'},ltr('45 N'),`${eq('F=75-30=45~\\mathrm{N}','F equals 75 minus 30 equals 45 newtons')}<p>نطرح لأن الجهتين متعاكستان، وتكون الجهة جهة ${ltr('75 N')}.</p>`),
  item('l2q12',{value:90,tolerance:0.05,unit:'cm'},ltr('90 cm'),`<p>لتكن المسافة من القوة ${ltr('90 N')} إلى المحصلة ${tex('x','x')}. عندئذ المسافة من ${ltr('30 N')} هي ${tex('x+60','x plus 60')}.</p>${eq('90x=30(x+60)\\Rightarrow60x=1800\\Rightarrow x=30~\\mathrm{cm}','90 x equals 30 times x plus 60, therefore x equals 30 centimeters')}${eq('x+60=90~\\mathrm{cm}','x plus 60 equals 90 centimeters')}<p>المطلوب بعد حامل القوة الأصغر، لذلك الجواب ${ltr('90 cm')}.</p>`),
  item('l2q13','true','صح.','<p>طرفا العلاقة لهما وحدة قوة × مسافة. تحويل إحدى المسافتين أو توحيد الوحدات يمنع مقارنة أعداد بوحدتين مختلفتين.</p>'),
  item('l2q14',{'same-12-8':'20','opp-55-15':'40','equal-same':'mid','larger-side':'outside'},`<ul><li>${ltr('12 + 8 = 20 N')}</li><li>${ltr('55 − 15 = 40 N')}</li><li>القوتان المتساويتان في جهة واحدة: المنتصف.</li><li>المتعاكستان المختلفتان: خارج القطعة من جهة الأكبر.</li></ul>`,'<p>تحدد الجهتان العملية، ويحدد اختلاف الشدتين موضع النقطة: التساوي في الجهة الواحدة يعطي بعدين متساويين.</p>'),
  item('l2q15',{value:36,tolerance:0.02,unit:'N'},ltr('36 N'),`<p>المسافة من ${V_F2 ?? 'F₂'} إلى المحصلة ${ltr('72 − 24 = 48 cm')}.</p>${eq('F_{1}\\times24=18\\times48\\Rightarrow F_{1}=36~\\mathrm{N}','F one times 24 equals 18 times 48, therefore F one equals 36 newtons')}<p>القوة الأولى أكبر، ولذلك تقع المحصلة أقرب إليها عند ${ltr('24 cm')}.</p>`),
  item('l2q16','couple','يبقى أثر دوراني ولا توجد قوة مفردة محدودة الموضع.','<p>طرح الشدتين يعطي صفراً للقوة الانتقالية، لكن القوتين على حاملين مختلفين تصنعان عزماً. افتراض نقطة محصلة بينهما يخالف علاقة الموضع التي لا تعطي حلاً محدوداً عند تساوي القوتين المتعاكستين.</p>'),
  item('l2q17','larger','المحصلة بجهة القوة الأكبر وخارج القطعة من جهتها.','<p>السهم الناتج يتجه إلى أسفل مثل القوة الأكبر، ويقع حامله بعد B خارج AB. شدته فرق القوتين لا مجموعهما.</p>'),
  item('l2q18',['same-inside','opp-outside','moment'],'الفحوص الثلاثة: داخل القطعة للجهة الواحدة، وخارجها للتعاكس، وتساوي الجداءين.','<p>الشدة لا تكون مجموعاً في الحالتين؛ هي فرق في حالة التعاكس. بقية الخيارات تفحص موضع المحصلة وأثر الدوران.</p>'),
  item('l2q19',['balance','mark','measure','products','conclude'],'الموازنة، تعيين الحوامل، القياس، مقارنة الجداءين، الاستنتاج.','<p>لا يمكن قياس الأبعاد قبل تعيين C والحوامل. المقارنة العددية تأتي بعد القياس، ثم تتحول الملاحظة المتكررة إلى العلاقة العامة.</p>'),
  item('l2q20',{value:60,tolerance:0.02,unit:'N'},ltr('60 N'),`<p>لتكن القوة الأكبر ${tex('L','L')} والأصغر ${tex('S','S')}.</p>${eq('15L=45S\\Rightarrow L=3S','15 L equals 45 S, therefore L equals 3 S')}${eq('L-S=40\\Rightarrow3S-S=40\\Rightarrow S=20~\\mathrm{N},\\ L=60~\\mathrm{N}','L minus S equals 40, therefore S equals 20 newtons and L equals 60 newtons')}<p>التحقق: ${ltr('60 − 20 = 40 N')}، و${ltr('60 × 15 = 20 × 45')}.</p>`),
];

export const SOLUTION_GROUPS = Object.freeze(Array.from({length:4},(_,index)=>Object.freeze({
  id:`lesson2-group-${index+1}`, title:`الأسئلة ${index*5+1}–${index*5+5}`,
  questionIds:Object.freeze(all.slice(index*5,index*5+5).map((entry)=>entry.questionId)),
  items:Object.freeze(all.slice(index*5,index*5+5)),
})));
export const ANSWER_KEY = Object.freeze(Object.fromEntries(all.map((entry)=>[entry.questionId,entry.answerKey])));
export const SOLUTIONS = Object.freeze(Object.fromEntries(all.map((entry)=>[entry.questionId,entry])));
