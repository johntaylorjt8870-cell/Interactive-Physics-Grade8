import { UNIT2L2_PAGES } from './unit2-lesson2-content.js';
import { formula, tex } from './math.js';
const src = (n) => UNIT2L2_PAGES.find((p) => p.page === n)?.blocks.filter((b) => b.type === 'book').map((b) => b.html).join('') ?? '';
const disc = (n) => `<details class="teacher-source-details" data-source-page="p${n}"><summary>محتوى الكتاب الأصلي · p${n}</summary><div class="teacher-source-body"><div class="book-copy">${src(n)}</div></div></details>`;
const expl = (n, html) => `<details class="teacher-explanation" data-teacher-explanation="p${n}" open><summary>شرح المعلم خطوة بخطوة</summary><div class="teacher-explanation-body">${html}</div></details>`;
const ans = (html) => `<div class="teacher-book-answer"><span class="teacher-answer-chip">الحل الكامل</span><div class="teacher-answer-body">${html}</div></div>`;
const head = (t, pages, id) => `<div class="teacher-section-heading"><div><p class="teacher-section-kicker">شرح المعلم · الصفحات ${pages}</p><h3 id="${id}">${t}</h3></div><span class="teacher-page-ref" dir="ltr">p${pages}</span></div>`;
const eq = (s, l) => `<div class="teacher-formula">${formula(s, l)}</div>`;

export function renderTeacherContent() {
  return `<div class="teacher-workspace-heading-row"><div><p class="teacher-eyebrow">منطقة المعلم · الوحدة الثانية</p><h2 id="teacher-workspace-heading" tabindex="-1">التيار الكهربائي المتواصل — حلول وشرح كامل</h2><p>كل تجربة ونشاط وسؤال في الصفحات 87–96 بحل معلل. الصور الفوتوغرافية وخلايا الجدول الفارغة موثّقة دون تخمين.</p></div><button class="teacher-logout" type="button" data-teacher-logout>تسجيل الخروج</button></div>

<section class="teacher-section">${head('الأهداف والملاحظة','87–88','t-open')}
<article class="teacher-subsection" data-page-reference="p87"><h4>ألاحظ وأستنتج · p87</h4>
${ans(`<ol>
<li><strong>مصدر الطاقة الكهربائية:</strong> المولّد (البطاريات في الدارة المصوّرة) يحوّل طاقة كيميائية إلى كهربائية.</li>
<li><strong>دور المولّد:</strong> يسبب حركة الإلكترونات الحرة في الناقل ويحافظ على فرق بين القطبين؛ لا يخلق إلكترونات.</li>
<li><strong>انتقال الطاقة:</strong> عبر الأسلاك المغلقة عندما يغلق المفتاح؛ الطاقة تنتقل بالحقل والتيار إلى المصباح فيضيء.</li>
</ol><p>صورة الدومينو تشبيه لحركة متتابعة داخل صف ممتلئ مسبقاً.</p>`)}
${expl(87, `<p>لا تكشف للطالب أن التيار «شيء يجري في السلك» قبل تجربة الأنبوب. اربط المفتاح بالدارة المغلقة شرطاً لمرور التيار.</p>`)}${disc(87)}</article>
<article class="teacher-subsection" data-page-reference="p88"><h4>تجربة الأنبوب · p88</h4>
${ans(`<ol>
<li>الأنبوب أفقي ممتلئ بالكرات.</li>
<li>دفع كرة من طرف يُخرج كرة من الطرف الآخر فوراً تقريباً.</li>
<li>دفع عدد من الكرات يزيح الصف بالاتجاه نفسه.</li>
<li>التشبيه: الإلكترونات الحرة موجودة في الناقل؛ المولّد يدفعها باتجاه واحد.</li>
</ol>
<p><strong>الاستنتاج:</strong> التيار المتواصل انتقال مستمر للإلكترونات الحرة باتجاه واحد. جهتها خارج المولّد من السالب إلى الموجب. المولّد يسبب الحركة.</p>`)}
${expl(88, `<p>نموذج تعليمي مبسّط: لا يمثّل سرعة الانجراف ولا المقاومة. خطأ شائع: الإلكترون يقطع الدارة بسرعة الضوء.</p>`)}${disc(88)}</article></section>

<section class="teacher-section">${head('الاصطلاح وشدة التيار','89–91','t-current')}
<article class="teacher-subsection" data-page-reference="p89"><h4>اصطلاح أمبير · p89</h4>
${ans(`<p>جهة التيار خارج المولّد من الموجب إلى السالب، عكس حركة الإلكترونات. الإثراء: الخلايا الكهربائية البسيطة والخلايا الضوئية مولّدات تيار مستمر.</p>`)}
${expl(89, `<p>فرّق دائماً بين الجهتين على السبورة بلونين. أمبير عالم فيزيائي ورياضي فرنسي كما في الكتاب.</p>`)}${disc(89)}</article>
<article class="teacher-subsection" data-page-reference="p90"><h4>الجدول والخط البياني · p90</h4>
${ans(`<p>من ثبات ${tex('q/t=4', 'ratio 4')} ونقاط الرسم:</p>
<table class="u2l2-data-table"><tr><th>q (C)</th><td>20</td><td>40</td><td>60</td><td>80</td><td>100</td></tr>
<tr><th>t (s)</th><td>5</td><td>10</td><td>15</td><td>20</td><td>25</td></tr>
<tr><th>q/t</th><td>4</td><td>4</td><td>4</td><td>4</td><td>4</td></tr></table>
<p>الخط البياني مستقيم صاعد: تناسب طردي، والميل هو شدة التيار 4 A.</p>`)}
${expl(90, `<p>الخلايا الفارغة لم تُطبع في الكتاب؛ الأرقام 15 و 25 وبقية النسب مستنتجة من النقاط المطبوعة وثبات 4. وثّق ذلك للطلاب.</p>`)}${disc(90)}</article>
<article class="teacher-subsection" data-page-reference="p91"><h4>تطبيق محلول · p91</h4>
${ans(`<p><strong>المعطيات:</strong> ${tex('q=60\\\\,\\\\mathrm{C},\\\\;t=30\\\\,\\\\mathrm{s}', 'givens')}. <strong>المطلوب 1:</strong> I. <strong>القانون:</strong> ${tex('I=q/t', 'I equals q over t')} لأن التيار متواصل والكمية عبر مقطع في زمن معلوم.</p>
${eq('I=\\\\frac{60}{30}=2\\\\,\\\\mathrm{A}', 'I equals 2 A')}
<p><strong>المطلوب 2:</strong> كمية الكهرباء خلال 3 min. حوّل: ${tex('3\\\\times60=180\\\\,\\\\mathrm{s}', '180 s')}. ${tex('q=It', 'q equals I t')}</p>
${eq('q=2\\\\times180=360\\\\,\\\\mathrm{C}', 'q equals 360 C')}
<p><strong>التحقق:</strong> 180/30 = 6 أمثال الزمن فستة أمثال 60 C = 360 C. خطأ شائع: ${tex('2\\\\times3=6\\\\,\\\\mathrm{C}', 'wrong 6 C')} دون تحويل الدقائق.</p>`)}
${expl(91, `<p>الأمبير = 1 C في 1 s. kA و mA و μA كما في الكتاب. التفاعل في صفحة الطالب يعيد قيم هذا التطبيق عند إعادة الضبط.</p>`)}${disc(91)}</article></section>

<section class="teacher-section">${head('التسلسل والتفرع','92–94','t-circuits')}
<article class="teacher-subsection" data-page-reference="p92"><h4>تجربة التسلسل · p92</h4>
${ans(`<ol>
<li>قراءتا A1 و A2 متساويتان: ${tex('I=200\\\\,\\\\mathrm{mA}', '200 mA')} في الجزأين.</li>
<li>نزع مصباح يقطع التيار فتنطفئ الدارة كلها.</li>
</ol>
<p><strong>الاستنتاج:</strong> I = Const في كل أجزاء التسلسل. مقياس الأمبير يوصل على التسلسل.</p>`)}
${expl(92, `<p>200 mA = 0.2 A. لا توصل الأمبير على التفرع.</p>`)}${disc(92)}</article>
<article class="teacher-subsection" data-page-reference="p93"><h4>مولدات وتفرع · p93</h4>
${ans(`<p><strong>مثال التسلسل:</strong> موجب كل مولّد إلى سالب الذي يليه؛ الشكل 6 Volts لأربع خلايا.</p>
<ol>
<li>A يقيس تيار المصدر؛ A1 و A2 يقيسان فرعي المصباحين.</li>
<li>قراءة A تساوي مجموع قراءتي الفرعين.</li>
<li>نزع مصباح يطفئ فرعه فقط ويبقى الآخر.</li>
</ol>
<p>قيد: المصباح الثاني مطبوع L1 في المصدر.</p>`)}
${expl(93, `<p>الأدوات: مولّد، مصباحان مختلفان، ثلاثة مقاييس، أسلاك. لا تخترع قراءات لم تُطبع.</p>`)}${disc(93)}</article>
<article class="teacher-subsection" data-page-reference="p94"><h4>استنتاج التفرع وتعلمت · p94</h4>
${ans(`<ul>
<li>شدات التيار مختلفة على التفرع.</li>
<li>${tex('I=I_{1}+I_{2}', 'sum')}.</li>
<li>نزع جهاز من فرع يبقي التيار في بقية الفروع.</li>
</ul>
<p>مثال التفرع: خلايا متماثلة على التفرع، الشكل 1.5 Volts. بنود «تعلمت» السبعة كما في الكتاب.</p>`)}
${expl(94, `<p>شرط مرور التيار: مولّد ودارة مغلقة. المولّد لا ينتج إلكترونات.</p>`)}${disc(94)}</article></section>

<section class="teacher-section">${head('حلول اختبر نفسي','95–96','t-self')}
<article class="teacher-subsection" data-page-reference="p95"><h4>السؤال الأول · p95</h4>
${ans(`<ol>
<li><strong>شِدّة التيّار الكهربائيّ.</strong></li>
<li><strong>الأمبير</strong> (تعريف وحدة الشدة).</li>
<li><strong>مقياس الأمبير</strong> (الأميتر).</li>
<li><strong>التيّار الكهربائيّ المتواصل (المستمر)</strong> — حركة الإلكترونات من السالب إلى الموجب كما صاغ الكتاب العبارة.</li>
</ol>`)}
<h4>السؤال الثاني · p95</h4>
${ans(`<ol>
<li><strong>خطأ.</strong> التصحيح: جهة التيار الاصطلاحية خارج المولّد من الموجب إلى السالب. العبارة تصف جهة حركة الإلكترونات لا جهة التيار.</li>
<li><strong>صح.</strong> يوصل مقياس الأمبير على التسلسل.</li>
</ol>`)}
<h4>السؤال الثالث · 1 · p95</h4>
${ans(`<p>الإجابة <strong>d</strong>: خط أفقي، شدة ثابتة مع الزمن. a تناقص، b متناوب، c قفزات، ليست تعريفاً للتيار المتواصل الثابت في الدرس.</p>`)}
${expl(95, `<p>العبارة 4 في السؤال الأول تصف حركة الإلكترونات؛ لا تخلطها مع اصطلاح أمبير.</p>`)}${disc(95)}</article>
<article class="teacher-subsection" data-page-reference="p96"><h4>السؤال الثالث · 2 · p96</h4>
${ans(`<p>المسبب لحركة الإلكترونات هو <strong>b. المولّد الكهربائيّ</strong>. المصباح يستهلك؛ القاطعة تغلق/تفتح؛ المقياس يقيس.</p>`)}
<h4>السؤال الرابع · p96</h4>
${ans(`<ol>
<li><strong>القاصمة المنصهرة:</strong> سلك يذوب إذا جاوز التيار حدّاً آمناً فيفتح الدارة ويحمي الجهاز من التلف والحريق. ترتبط بفكرة أن Excess I يعني كمية شحنة كبيرة في زمن قصير.</li>
<li><strong>ناقلية المعادن:</strong> تحوي إلكترونات حرة تتحرك باتجاه واحد عند وجود مولّد ودارة مغلقة. العوازل إلكتروناتها مرتبطة فلا يتكوّن تيار متواصل فيها.</li>
</ol>`)}
<h4>السؤال الخامس · p96</h4>
${ans(`<p><strong>المعطيات:</strong> ${tex('q=12\\\\,\\\\mathrm{C}', '12 C')} خلال ${tex('2\\\\,\\\\mathrm{min}=120\\\\,\\\\mathrm{s}', '120 s')} (الكتاب طبع 12 c).</p>
<p><strong>1. شدة التيار:</strong></p>
${eq('I=\\\\frac{q}{t}=\\\\frac{12}{120}=0.1\\\\,\\\\mathrm{A}', 'I equals 0.1 A')}
<p><strong>2. خلال 5 min = 300 s</strong> والتيار ثابت:</p>
${eq('q=It=0.1\\\\times300=30\\\\,\\\\mathrm{C}', 'q equals 30 C')}
<p><strong>التحقق:</strong> 5/2 = 2.5 فكمية الكهرباء 12 × 2.5 = 30 C. خطأ شائع: القسمة على 2 بدل 120.</p>`)}
${expl(96, `<p>حلول التفاعل: مختبر I=q/t عند 60 C و 30 s يعطي 2 A؛ التسلسل نزع يصفّر التيار؛ التفرع يجمع الفرعين.</p>`)}${disc(96)}</article></section>`;
}
