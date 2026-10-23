import { calculation, formula, ltrText, qty, tex, V_F, V_F1, V_F2, V_F3, V_W } from './math.js';

const ltr = (text) => ltrText(text);
const heading = (title, pages, id) => `<div class="teacher-section-heading"><div><p class="teacher-section-kicker">شرح المعلم · الصفحات ${pages}</p><h3 id="${id}">${title}</h3></div><span class="teacher-page-ref" dir="ltr">p${pages}</span></div>`;
const answer = (html) => `<div class="teacher-book-answer"><span class="teacher-answer-chip">الحل الكامل</span><div class="teacher-answer-body">${html}</div></div>`;
const explanation = (number, html) => `<details class="teacher-explanation" data-teacher-explanation="p${number}" open><summary>شرح المعلم خطوة بخطوة</summary><div class="teacher-explanation-body">${html}</div></details>`;
const sourceDisclosure = (number, html) => `<details class="teacher-source-details" data-source-page="p${number}"><summary>محتوى الكتاب الأصلي · p${number}</summary><div class="teacher-source-body"><div class="book-copy">${html}</div></div></details>`;
const equation = (source, label) => `<div class="teacher-formula">${formula(source, label)}</div>`;

function overview() {
  return `<section class="teacher-section" id="teacher-overview" aria-labelledby="teacher-overview-heading">
    ${heading('الأهداف وخريطة الدرس', '63', 'teacher-overview-heading')}
    <article class="teacher-subsection" data-page-reference="p63">
      <h4>الأهداف المنقولة من المصدر</h4>
      <ul class="teacher-objectives">
        <li>يتعرّف القوى المتوازية.</li>
        <li>يحدّد عناصر محصلة قوتين متوازيتين بجهة واحدة.</li>
        <li>يحدّد عناصر محصلة قوتين متوازيتين بجهتين متعاكستين.</li>
        <li>يمثّل بالرسم القوى المتوازية ومحصلتها.</li>
      </ul>
      <h4>الكلمة المفتاحية</h4>
      <p class="teacher-keyword-line">قوتان متوازيتان.</p>
      ${explanation(63, `<p>ابدأ بمشهدي الأرجوحة والعربة. الإجابة المقصودة تمهّد لوجود قوى شد حواملها متوازية. لا تستنتج من صورة الأرجوحة مقادير الشد أو اتزاناً عددياً.</p>
        <ul>
          <li><strong>شد السلاسل:</strong> على امتداد السلسلتين، وحاملا القوتين متوازيان في التمثيل المقصود.</li>
          <li><strong>اتزان الأرجوحة:</strong> يتحقق عندما تتوازن القوى المؤثرة ولا يحدث دوران.</li>
          <li><strong>الحصانان:</strong> يشدان العربة بقوتين متوازيتين وبجهة واحدة في المشهد.</li>
        </ul>
        <p>تسلسل الشرح المعتمد: تمهيد ص 63 → تعريف وتجربة ص 64 → جهة واحدة ص 65–67 → تعاكس ص 67–68 → خلاصة ص 69 → أختبر نفسي ص 70.</p>`)}
      ${sourceDisclosure(63, `<p>الأهداف الأربعة والكلمة المفتاحية «قوتان متوازيتان» ومشهدا الأرجوحة والعربة والأسئلة الثلاثة: كيف تكون قوى شد السلاسل للأرجوحة؟ ما الذي يجعل الأرجوحة متوازنة؟ كيف يشد الحصانان العربة؟</p>`)}
    </article>
  </section>`;
}

function activities() {
  return `<section class="teacher-section" id="teacher-activities" aria-labelledby="teacher-activities-heading">
    ${heading('التجارب والأنشطة', '64–67', 'teacher-activities-heading')}
    <article class="teacher-subsection" id="teacher-p64" data-page-reference="p64">
      <h4>تجربة تعريف القوى المتوازية · p64</h4>
      ${answer(`<ol>
        <li>حامل الثقل شاقولي وجهته إلى أسفل.</li>
        <li>حاملا قوتي شد الربيعتين ليسا الاستقامة ذاتها؛ إنهما مستقيمان منفصلان متوازيان.</li>
        <li>لا تتغير جهة الثقل: تبقى شاقولياً إلى أسفل.</li>
        <li>بعد رفع الجهاز تبقى ثلاثة خطوط مرسومة، وضعها: مستقيمات متوازية.</li>
      </ol>
      <p><strong>الاستنتاج:</strong> القوى المتوازية هي القوى التي تكون حواملها مستقيمات متوازية.</p>
      <p><strong>أدوات التجربة كما في الكتاب:</strong> لوح الربائع المغناطيسي — مسطرة خفيفة مثقّبة ومدرّجة — جسم مزوّد بخطّاف — ربائع — خيوط ربط — (حقيبة الميكانيك).</p>`)}
      ${explanation(64, `<p>المطلوب وصف الحوامل لا حساب المقادير. مدّ كل سهم على استقامته. إذا كانت المسطرة أفقية والربيعتان شاقوليتين فالخطوط الثلاثة شاقولية ولا تتقاطع.</p>
        <p>لا تخلط بين «متوازية» و«متزنة»: التوازي وصف هندسي، والاتزان شرط للمحصلة.</p>
        <p>سؤال ختام الصفحة: هل يمكن إيجاد محصلة عدة قوى متوازية؟ يمهّد لتجربة الصفحة 65.</p>`)}
      ${sourceDisclosure(64, `<p>تعريف القوى المتوازية، تجربة الربيعة ثم الربيعتين والمسطرة، أسئلة أتساءل الأربعة، الاستنتاج، وسؤال: هل يمكن إيجاد محصلة عدة قوى متوازية؟</p>`)}
    </article>

    <article class="teacher-subsection" id="teacher-p65" data-page-reference="p65">
      <h4>تجربة محصلة قوتين بجهة واحدة · p65</h4>
      ${answer(`<ol>
        <li>علّق الثقلين المختلفين عند الطرفين، ثم حرّك نقطة تعليق الربيعة حتى تبقى المسطرة أفقية.</li>
        <li>تدل الربيعة على قوة ${V_F3} تساوي مجموع الثقلين عند الاتزان وتعاكس محصلتهما.</li>
        <li>حامل ${V_F3} بين حاملي الثقلين وأقرب إلى القوة الأكبر.</li>
        <li>القوة ${V_F} المعاكسة لـ ${V_F3} هي محصلة ${V_F1} و ${V_F2}، وجهتها جهتهما.</li>
        <li>يظهر القياس: ${tex('F_{1}\\\\times d_{1}=F_{2}\\\\times d_{2}', 'products equal')}.</li>
      </ol>`)}
      ${explanation(65, `<p>تحافظ المسطرة على عدم الدوران عندما يتساوى الجداءان حول C:</p>
        ${equation('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')}
        <p><strong>عناصر المحصلة:</strong> حامل موازٍ، وجهة القوتين، وشدة ${tex('F=F_{1}+F_{2}', 'sum')}، ونقطة بين القوتين وأقرب إلى الأكبر.</p>
        <p><strong>خطأ شائع:</strong> ربط البعد الأكبر بالقوة الأكبر. العلاقة عكسية.</p>`)}
      ${sourceDisclosure(65, `<p>تجربة الثقلين والربيعة بالخطوات 1–9، ثم استنتاج العناصر الأربعة مع العلاقة F = F1 + F2 و F1 × d1 = F2 × d2.</p>`)}
    </article>

    <article class="teacher-subsection" id="teacher-p66" data-page-reference="p66">
      <h4>علاقة التناسب وسؤال «أفكر» · p66</h4>
      ${answer(`<p>إذا كانت القوتان متساويتين، تستقر النقطة <span dir="ltr">C</span> في منتصف المسافة بينهما.</p>`)}
      ${explanation(66, `<p>من ${tex('F_{1}=F_{2}', 'equal')} والعلاقة ${tex('F_{1}d_{1}=F_{2}d_{2}', 'products')} نحصل على:</p>
        ${equation('d_{1}=d_{2}=\\\\frac{d}{2}', 'd one equals d two equals d over two')}
        <p>سلسلة التناسب في الكتاب:</p>
        ${equation('\\\\frac{F_{1}}{d_{2}}=\\\\frac{F_{2}}{d_{1}}=\\\\frac{F_{1}+F_{2}}{d_{2}+d_{1}}=\\\\frac{F}{d}', 'proportion chain')}`)}
      ${sourceDisclosure(66, `<p>ترتيب العلاقة، خصائص التناسب، سؤال أفكر، وبداية التطبيق المحلول AB = 0.5 m و F1 = 20 N و F2 = 30 N حتى F = 50 N.</p>`)}
    </article>

    <article class="teacher-subsection" id="teacher-p67" data-page-reference="p67">
      <h4>الانتقال إلى الجهتين المتعاكستين · p67</h4>
      ${answer(`<p>عند عكس جهة إحدى القوتين تصبح المحصلة بجهة القوة الأكبر، وشدتها فرق الشدتين، وتقع نقطة تأثيرها خارج القطعة الواصلة بين القوتين ومن جهة القوة الأكبر.</p>
        <p>تعليمات التجربة في الكتاب: أنزع الثقل w1 = F1، ماذا ألاحظ؟ أعيد الثقل F1، ما دور هذا الثقل؟ ماذا أسمّي هذا الثقل بالنسبة للقوتين F2 و F3؟</p>`)}
      ${explanation(67, `<p>لا يتغير توازي الحاملين، لكن تتغير الجهة. يُستبدل الجمع بالطرح:</p>
        ${equation('F=F_{2}-F_{1}\\\\quad(F_{2}>F_{1})', 'difference when F two greater')}
        <p>تبقى علاقة تساوي الجداءين صحيحة، لكن C تخرج من القطعة.</p>`)}
      ${sourceDisclosure(67, `<p>تتمة التطبيق (d2 = 0.2 m والعناصر) ثم فقرة التعاكس واستنتاج العناصر الأربعة مع F = F2 − F1.</p>`)}
    </article>
  </section>`;
}

function workedExamples() {
  return `<section class="teacher-section" id="teacher-examples" aria-labelledby="teacher-examples-heading">
    ${heading('التطبيقات المحلولة', '66–68', 'teacher-examples-heading')}
    <article class="teacher-subsection" data-page-reference="p66 p67">
      <h4>تطبيق الجهة الواحدة · p66–p67</h4>
      ${answer(`<p><strong>المعطيات:</strong> ${ltr('d = 0.5 m')}، ${ltr('F₁ = 20 N')}، ${ltr('F₂ = 30 N')}.</p>
        <p><strong>المطلوب:</strong> الشدة، بعد حامل القوة الثانية، العناصر، الرسم.</p>
        <p><strong>القانون والتعويض:</strong></p>
        ${calculation('F=F_{1}+F_{2}=20+30=50\\\\,\\\\mathrm{N}', '50 N')}
        ${calculation('\\\\frac{F}{d}=\\\\frac{F_{1}}{d_{2}}\\\\Rightarrow\\\\frac{50}{0.5}=\\\\frac{20}{d_{2}}\\\\Rightarrow d_{2}=0.2\\\\,\\\\mathrm{m}', 'd two equals 0.2 m')}
        <p><strong>العناصر:</strong> نقطة التأثير بين القوتين، على بعد ${ltr('0.2 m')} من حامل القوة الثانية لأنها الأكبر؛ الحامل موازٍ؛ الجهة جهة القوتين؛ الشدة ${ltr('50 N')}.</p>
        <p><strong>الرسم:</strong> ${V_F1} و ${V_F2} متوازيان في جهة واحدة عند A و B، ثم ${V_F} بينهما عند C مع ${ltr('d₂ = 0.2 m')} و ${ltr('d₁ = 0.3 m')}.</p>`)}
      ${explanation(67, `<p><strong>التحقق:</strong></p>${equation('20\\\\times0.3=30\\\\times0.2=6\\\\,\\\\mathrm{N\\\\,m}', '6 N m')}<p>مجموع البعدين ${ltr('0.3 + 0.2 = 0.5 m')}.</p>`)}
    </article>
    <article class="teacher-subsection" data-page-reference="p68">
      <h4>تطبيق الجهتين المتعاكستين · p68</h4>
      ${answer(`<p><strong>المعطيات:</strong> ${ltr('d = 60 cm')}، ${ltr('F₁ = 200 N')}، ${ltr('F₂ = 300 N')}، والجهتان متعاكستان.</p>
        ${calculation('F=F_{2}-F_{1}=300-200=100\\\\,\\\\mathrm{N}', '100 N')}
        ${calculation('\\\\frac{F_{2}}{d_{1}}=\\\\frac{F}{d}\\\\Rightarrow\\\\frac{300}{d_{1}}=\\\\frac{100}{60}\\\\Rightarrow d_{1}=180\\\\,\\\\mathrm{cm}', 'd one equals 180 cm')}
        <p><strong>العناصر:</strong> الشدة ${ltr('100 N')}، والجهة جهة ${V_F2} الأكبر، والحامل موازٍ، ونقطة التأثير خارج القطعة من جهة ${V_F2}.</p>`)}
      ${explanation(68, `<p><strong>التحقق العددي:</strong> بعد القوة الأكبر عن المحصلة ${ltr('d₂ = 180 − 60 = 120 cm')}.</p>
        ${equation('200\\\\times180=300\\\\times120=36000\\\\,\\\\mathrm{N\\\\,cm}', '36000 N cm')}
        <p>المحصلة أصغر من الأكبر واتجاهها اتجاهه وموضعها خارج القطعة.</p>`)}
      ${sourceDisclosure(68, `<p>ساق طويلة مهملة الكتلة، البعد 60 cm، F1 = 200 N، F2 = 300 N، الحل F = 100 N و d1 = 180 cm.</p>`)}
    </article>
  </section>`;
}

function summary() {
  return `<section class="teacher-section" id="teacher-summary" aria-labelledby="teacher-summary-heading">
    ${heading('الخلاصة ومعايير التحقق', '69', 'teacher-summary-heading')}
    <article class="teacher-subsection" data-page-reference="p69">
      ${explanation(69, `<table class="teacher-compare-table"><thead><tr><th>الحالة</th><th>الشدة</th><th>الجهة</th><th>الموضع</th></tr></thead>
        <tbody>
          <tr><td>جهة واحدة</td><td>${tex('F=F_{1}+F_{2}', 'sum')}</td><td>جهة القوتين</td><td>بينهما، أقرب إلى الأكبر</td></tr>
          <tr><td>جهتان متعاكستان</td><td>${tex('F=|F_{1}-F_{2}|', 'difference')}</td><td>جهة الأكبر</td><td>خارج القطعة من جهة الأكبر</td></tr>
        </tbody></table>
        <p>في الحالتين: حامل المحصلة موازٍ، والموضع يحقق تساوي الجداءين. الكتاب يفترض ${tex('F_{2}>F_{1}', 'F two greater')}.</p>`)}
      ${sourceDisclosure(69, `<p>صندوق تعلّمت: التعريف + عناصر الجهة الواحدة + عناصر التعاكس مع الشرط F2 &gt; F1.</p>`)}
    </article>
  </section>`;
}

function textbookQuestions() {
  return `<section class="teacher-section" id="teacher-questions" aria-labelledby="teacher-questions-heading">
    ${heading('جميع أسئلة الكتاب وحلولها', '70', 'teacher-questions-heading')}
    <article class="teacher-subsection" data-page-reference="p70">
      <h4>السؤال الأول · الاختيارات الأربعة</h4>
      ${answer(`<ol>
        <li><strong>a:</strong> ${tex('F=F_{1}+F_{2}', 'sum')} لأن الجهتين واحدة.</li>
        <li><strong>c:</strong> ${tex('F=F_{2}-F_{1}', 'difference')} لأن ${tex('F_{2}>F_{1}', 'F two greater')} والجهتين متعاكستان.</li>
        <li><strong>c:</strong> ${calculation('F=3+4=7\\\\,\\\\mathrm{N}', '7 N')} (5 N مشتت فيثاغورث من الدرس السابق).</li>
        <li><strong>a:</strong> ${tex('d=d_{1}+d_{2}', 'sum of distances')} لأن المحصلة بين القوتين.</li>
      </ol>`)}
      ${explanation(70, `<p>اطلب تحديد الجهة قبل العملية. السؤال الرابع هندسي: في الجهة الواحدة يقسم حامل المحصلة المسافة إلى جزأين.</p>`)}

      <h4>السؤال الثاني · المسألة الأولى</h4>
      ${answer(`<p><strong>المعطيات:</strong> ${ltr('F₁ = 40 N')}، ${ltr('F₂ = 10 N')}، ${ltr('d₁ = 30 cm')}، القوتان بجهة واحدة.</p>
        <p><strong>المطلوب 1 — بعد حامل القوة الثانية عن حامل المحصلة:</strong></p>
        ${calculation('F_{1}d_{1}=F_{2}d_{2}\\\\Rightarrow40\\\\times30=10d_{2}\\\\Rightarrow d_{2}=120\\\\,\\\\mathrm{cm}', 'd two equals 120 cm')}
        <p><strong>المطلوب 2 — طول المسطرة:</strong></p>
        ${calculation('d=d_{1}+d_{2}=30+120=150\\\\,\\\\mathrm{cm}', 'd equals 150 cm')}
        <p><strong>المطلوب 3 — العناصر:</strong> الشدة ${calculation('F=40+10=50\\\\,\\\\mathrm{N}', '50 N')}؛ الجهة جهة القوتين؛ الحامل موازٍ؛ نقطة التأثير بينهما، على بعد ${ltr('30 cm')} من القوة الأكبر ${V_F1} و ${ltr('120 cm')} من ${V_F2}.</p>
        <p><strong>التحقق:</strong> ${ltr('40 × 30 = 10 × 120 = 1200 N·cm')}.</p>`)}

      <h4>السؤال الثاني · المسألة الثانية</h4>
      ${answer(`<p><strong>المعطيات:</strong> ${ltr('F₁ = 80 N')}، ${ltr('F₂ = 20 N')}، ${ltr('d = 40 cm')}، الجهتان متعاكستان.</p>
        <p><strong>المطلوب 1 — الشدّة F (قراءة كلمة المسح غير محسومة؛ القيمة بقانون التعاكس):</strong></p>
        ${calculation('F=F_{1}-F_{2}=80-20=60\\\\,\\\\mathrm{N}', '60 N')}
        <p><strong>المطلوب 2 — بعد حامل القوة الثانية عن المحصلة:</strong></p>
        ${calculation('\\\\frac{F_{1}}{d_{2}}=\\\\frac{F}{d}\\\\Rightarrow\\\\frac{80}{d_{2}}=\\\\frac{60}{40}\\\\Rightarrow d_{2}=\\\\frac{160}{3}\\\\,\\\\mathrm{cm}\\\\approx53.3\\\\,\\\\mathrm{cm}', '160 over 3 cm')}
        <p><strong>المطلوب 3 — العناصر:</strong> الشدة ${ltr('60 N')}؛ الجهة جهة ${V_F1} الأكبر؛ الحامل موازٍ؛ نقطة التأثير خارج القطعة من جهة ${V_F1}. المسافة من ${V_F1} إلى المحصلة ${ltr('13.3 cm')}.</p>
        <p>لا ننسب إلى الكتاب في هذا الطلب كلمة «محصّلة» ولا «وصلة». القيمة 60 N تلزم الطلب 2 عبر F/d = 60/40، فلا تناقض بين المطاليب.</p>
        <p><strong>التحقق:</strong> بالكسر الدقيق ${tex('80\\\\times\\\\frac{40}{3}=20\\\\times\\\\frac{160}{3}', 'products equal')}.</p>`) }
      ${explanation(70, `<p><strong>أخطاء شائعة:</strong> جمع القوتين المتعاكستين؛ وضع محصلتهما بين الحاملين؛ استعمال ${ltr('40 cm')} مباشرة بوصفها بعد القوة الأكبر عن المحصلة؛ إسقاط الوحدة؛ أو تقريب المسافة في وسط الحساب. احتفظ بالكسر ${tex('\\\\frac{160}{3}', '160 over 3')} حتى النهاية.</p>
        <p><strong>معيار الرسم:</strong> يجب أن تظهر الأسهم والحوامل والجهات والنقاط والمسافات.</p>
        <p><strong>حدّ قراءة المسح ص 70 الطلب 1:</strong> عند تكبير صورة الصفحة تُقرأ العبارة «احسب شدّة وصلة القوتين». لم تُحسم الحروف بما يكفي لإثبات أن المطبوعة هي «محصّلة» أو أن «وصلة» مصطلح مقصود. لا تُدرَّس «وصلة». الكمية 60 N هي شدة المحصلة بقانون ص 67، وهي ما يستخدمه الطلبان 2 و 3.</p>`)}
      ${sourceDisclosure(70, `<p>السؤال الأول أربع فقرات، والمسألة الأولى (بعد القوة الثانية ثم طول المسطرة ثم العناصر) والمسألة الثانية (الشدة ثم بعد القوة الثانية ثم العناصر) بالقيم 40 N و 10 N و 30 cm و 80 N و 20 N و 40 cm.</p>`)}
    </article>
  </section>`;
}

function simulationGuide() {
  return `<section class="teacher-section" id="teacher-simulation" aria-labelledby="teacher-simulation-heading">
    ${heading('دليل الرسوم والأنشطة التفاعلية', '64–70', 'teacher-simulation-heading')}
    <article class="teacher-simulation-note" data-simulation-reference="parallel-definition-lab" data-page-reference="p64">
      <h4>مختبر التعريف</h4>
      <p>أربع خطوات تطابق تجربة ص 64: ربيعة واحدة، ربيعتان ومسطرة، رسم الحوامل، رفع الجهاز. تنبؤ قبل الخطوة 4. النموذج <bdi dir="ltr">Educational simplified model</bdi>.</p>
    </article>
    <article class="teacher-simulation-note" data-simulation-reference="parallel-resultant-lab" data-page-reference="p65-p68">
      <h4>مختبر موضع المحصلة</h4>
      <p>يغيّر ${V_F1} و ${V_F2} والمسافة والجهتين، ويعرض الشدة والبعدين والجداءين وسبب التغيّر. أزرار أمثلة الكتاب: 20 N و 30 N، قوتان متساويتان، ونسبة 2:3 للتعاكس. احترم تقليل الحركة.</p>
      <p><strong>نشاط صفّي:</strong> ثبّت المسافة والقوة الأولى واطلب توقع اتجاه حركة C قبل زر المسح.</p>
    </article>
    <article class="teacher-simulation-note" data-page-reference="p70">
      <h4>أسئلة الصفحة 70 والتدريب</h4>
      <p>الاختيار من متعدد بتغذية راجعة لكل بديل وتلميحين. المسألتان بورشة عددية. ستة أسئلة تكوينية تستخدم قيم الكتاب فقط، ومستقلة عن اختبار الدرس.</p>
    </article>
    <p class="teacher-gate-help">حماية كلمة المرور تعمل داخل المتصفح فقط، وليست نظام صلاحيات من جهة الخادم.</p>
  </section>`;
}

export function renderTeacherContent() {
  return `<header class="teacher-workspace-header"><div><p class="teacher-workspace-eyebrow">دليل المعلم · المصدر p63–p70</p><h2 id="teacher-workspace-heading" tabindex="-1">القوى المتوازية</h2><p>الصف الثامن · الوحدة الأولى — الحركة والقوى · حلول وأنشطة موثقة الصفحة</p></div><button class="teacher-logout-button" type="button" data-teacher-logout>إنهاء الجلسة</button></header>
  <div class="teacher-workspace-layout"><nav class="teacher-nav" aria-label="التنقل في دليل المعلم"><p class="teacher-nav-title">أقسام الدليل</p><a href="#teacher-overview">الأهداف</a><a href="#teacher-activities">التجارب</a><a href="#teacher-examples">التطبيقات المحلولة</a><a href="#teacher-summary">الخلاصة</a><a href="#teacher-questions">أسئلة الكتاب</a><a href="#teacher-simulation">التفاعل</a></nav><div class="teacher-content">${overview()}${activities()}${workedExamples()}${summary()}${textbookQuestions()}${simulationGuide()}</div></div>`;
}
