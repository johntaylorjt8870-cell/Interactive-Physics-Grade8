import { LESSON_2_PAGES } from './lesson-2-content.js';
import { V_F, V_F1, V_F2, V_F3, V_W, calculation, formula, ltrText, qty, tex } from './math.js';

const ltr = (text) => ltrText(text);
const page = (number) => LESSON_2_PAGES.find((item) => item.page === number);
const sourceHtml = (number) => page(number)?.blocks.filter((block) => block.type === 'book').map((block) => block.html).join('') ?? '';
const sourceDisclosure = (number) => `<details class="teacher-source-details" data-source-page="p${number}"><summary>محتوى الكتاب الأصلي · p${number}</summary><div class="teacher-source-body"><div class="book-copy">${sourceHtml(number)}</div></div></details>`;
const explanation = (number, html) => `<details class="teacher-explanation" data-teacher-explanation="p${number}" open><summary>شرح المعلم خطوة بخطوة</summary><div class="teacher-explanation-body">${html}</div></details>`;
const answer = (html) => `<div class="teacher-book-answer"><span class="teacher-answer-chip">الحل الكامل</span><div class="teacher-answer-body">${html}</div></div>`;
const heading = (title, pages, id) => `<div class="teacher-section-heading"><div><p class="teacher-section-kicker">شرح المعلم · الصفحات ${pages}</p><h3 id="${id}">${title}</h3></div><span class="teacher-page-ref" dir="ltr">p${pages}</span></div>`;
const equation = (source, label) => `<div class="teacher-formula">${formula(source, label)}</div>`;

function overview() {
  return `<section class="teacher-section" id="teacher-overview" aria-labelledby="teacher-overview-heading">
    ${heading('الأهداف وخريطة الدرس', '63', 'teacher-overview-heading')}
    <article class="teacher-subsection" data-page-reference="p63">
      <h4>الأهداف المنقولة من المصدر</h4>
      <ul class="teacher-objectives"><li>يتعرّف القوى المتوازية.</li><li>يحدّد عناصر محصلة قوتين متوازيتين بجهة واحدة.</li><li>يحدّد عناصر محصلة قوتين متوازيتين بجهتين متعاكستين.</li><li>يمثّل بالرسم القوى المتوازية ومحصلتها.</li></ul>
      <h4>الكلمة المفتاحية</h4><p class="teacher-keyword-line">قوتان متوازيتان.</p>
      ${explanation(63, `<p>ابدأ بمشهدي الأرجوحة والعربة. الإجابة المقصودة تمهّد لوجود قوى شد حواملها متوازية. لا تستنتج من صورة الأرجوحة وحدها مقادير الشد أو اتزاناً عددياً؛ سؤال «ما الذي يجعل الأرجوحة متوازنة؟» يقود إلى تعادل التأثيرات لا إلى تساوي كل شد بالضرورة.</p><ul><li><strong>شد السلاسل:</strong> على امتداد السلسلتين، وحاملا القوتين متوازيان في التمثيل المقصود.</li><li><strong>اتزان الأرجوحة:</strong> يتحقق عندما تتوازن القوى المؤثرة ولا يحدث دوران.</li><li><strong>الحصانان:</strong> يشدان العربة بقوتين متوازيتين وبجهة واحدة في المشهد.</li></ul>`)}
      ${sourceDisclosure(63)}
    </article>
  </section>`;
}

function activities() {
  return `<section class="teacher-section" id="teacher-activities" aria-labelledby="teacher-activities-heading">
    ${heading('التجارب والأنشطة', '64–67', 'teacher-activities-heading')}
    <article class="teacher-subsection" id="teacher-p64" data-page-reference="p64">
      <h4>تجربة تعريف القوى المتوازية · p64</h4>
      ${answer(`<ol><li>حامل الثقل رأسي وجهته إلى أسفل.</li><li>حاملا قوتي شد الربيعتين ليسا الاستقامة ذاتها؛ إنهما مستقيمان منفصلان متوازيان.</li><li>لا تتغير جهة الثقل: تبقى رأسياً إلى أسفل.</li><li>بعد رفع الجهاز تبقى ثلاثة خطوط مرسومة، وضعها: مستقيمات متوازية.</li></ol><p><strong>الاستنتاج:</strong> القوى المتوازية هي القوى التي تكون حواملها مستقيمات متوازية.</p>`)}
      ${explanation(64, `<p><strong>المعطيات التجريبية:</strong> مسطرة أفقية، شدان إلى أعلى وثقل إلى أسفل. <strong>المطلوب:</strong> وصف الحوامل لا حساب المقادير.</p><p>مد كل سهم على استقامته. إذا كانت المسطرة أفقية والربيعتان رأسيتين، تصبح الخطوط الثلاثة رأسية ولا تتقاطع. يجب ألا يخلط الطالب بين «متوازية» و«متزنة»: التوازي وصف هندسي، والاتزان شرط للمحصلة والعزم.</p><div class="teacher-limit"><strong>حد المصدر:</strong> اسم الأداة الأولى في القائمة غير مقروء بثقة من الصورة؛ استخدم <bdi dir="ltr">Reference / See textbook — p64</bdi> ولا تخمّن الاسم.</div>`)}
      ${sourceDisclosure(64)}
    </article>

    <article class="teacher-subsection" id="teacher-p65" data-page-reference="p65">
      <h4>تجربة محصلة قوتين بجهة واحدة · p65</h4>
      ${answer(`<ol><li>علّق الثقلين المختلفين عند الطرفين، ثم حرّك نقطة تعليق الربيعة حتى تبقى المسطرة أفقية.</li><li>تدل الربيعة على قوة ${V_F3} تساوي مجموع الثقلين عند الاتزان وتعاكس محصلتهما.</li><li>حامل ${V_F3} بين حاملي الثقلين وأقرب إلى القوة الأكبر.</li><li>القوة ${V_F} المعاكسة لـ${V_F3} هي محصلة ${V_F1} و${V_F2}، وجهتها جهتهما.</li><li>يظهر القياس: ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}','F one times d one equals F two times d two')}.</li></ol>`)}
      ${explanation(65, `<p><strong>الفكرة:</strong> تحافظ المسطرة على عدم الدوران عندما يتساوى أثرا الدوران حول C. لذلك:</p>${equation('F_{1}d_{1}=F_{2}d_{2}','F one d one equals F two d two')}<p><strong>عناصر المحصلة:</strong> حامل موازٍ، وجهة القوتين، وشدة ${tex('F=F_{1}+F_{2}','F equals F one plus F two')}، ونقطة بين القوتين وأقرب إلى الأكبر.</p><p><strong>خطأ شائع:</strong> ربط البعد الأكبر بالقوة الأكبر. العلاقة عكسية: القوة الأكبر يكون بعدها عن حامل المحصلة أصغر.</p>`)}
      ${sourceDisclosure(65)}
    </article>

    <article class="teacher-subsection" id="teacher-p66" data-page-reference="p66">
      <h4>علاقة التناسب وسؤال «أفكر» · p66</h4>
      ${answer(`<p>إذا كانت القوتان متساويتين، تستقر النقطة <span dir="ltr">C</span> في منتصف المسافة بينهما.</p>`)}
      ${explanation(66, `<p>من ${tex('F_{1}=F_{2}','F one equals F two')} والعلاقة ${tex('F_{1}d_{1}=F_{2}d_{2}','F one d one equals F two d two')} نحصل على:</p>${equation('d_{1}=d_{2}=\\frac{d}{2}','d one equals d two equals d over two')}<p>وهذا تحقق هندسي: لا توجد قوة أكبر تجذب موضع المحصلة نحوها.</p>`)}
      ${sourceDisclosure(66)}
    </article>

    <article class="teacher-subsection" id="teacher-p67" data-page-reference="p67">
      <h4>الانتقال إلى الجهتين المتعاكستين · p67</h4>
      ${answer(`<p>عند عكس جهة إحدى القوتين تصبح المحصلة بجهة القوة الأكبر، وشدتها فرق الشدتين، وتقع نقطة تأثيرها خارج القطعة الواصلة بين القوتين ومن جهة القوة الأكبر.</p>`)}
      ${explanation(67, `<p>اعرض التغيير على الرسم: لا يتغير توازي الحاملين، لكن تتغير الجهة. لذلك يُستبدل الجمع بالطرح:</p>${equation('F=F_{2}-F_{1}\\quad(F_{2}>F_{1})','F equals F two minus F one when F two is greater than F one')}<p>تبقى علاقة تساوي جداء القوة في بعدها صحيحة، لكن نقطة المحصلة تنتقل خارج القطعة.</p><div class="teacher-limit"><strong>حد المصدر:</strong> بعض ألفاظ تعليمات تبديل الثقل في p67 صغيرة وغير محسومة؛ لا تعِد صياغتها كنص كتاب حرفي. راجع الصفحة الأصلية للتلاوة، واستعمل الاستنتاج الواضح للحل.</div>`)}
      ${sourceDisclosure(67)}
    </article>
  </section>`;
}

function workedExamples() {
  return `<section class="teacher-section" id="teacher-examples" aria-labelledby="teacher-examples-heading">
    ${heading('التطبيقات المحلولة', '66–68', 'teacher-examples-heading')}
    <article class="teacher-subsection" data-page-reference="p66 p67">
      <h4>تطبيق الجهة الواحدة · p66–p67</h4>
      ${answer(`<p><strong>المعطيات:</strong> ${ltr('d = 0.5 m')}، ${ltr('F₁ = 20 N')}، ${ltr('F₂ = 30 N')}.</p><p><strong>المطلوب:</strong> الشدة، بعد حامل القوة الثانية، العناصر، الرسم.</p>
        <p><strong>القانون والتعويض:</strong></p>${calculation('F=F_{1}+F_{2}=20+30=50~\\mathrm{N}','F equals 20 plus 30 equals 50 newtons')}
        ${calculation('\\frac{F}{d}=\\frac{F_{1}}{d_{2}}\\Rightarrow\\frac{50}{0.5}=\\frac{20}{d_{2}}\\Rightarrow d_{2}=0.2~\\mathrm{m}','50 over 0.5 equals 20 over d two, therefore d two equals 0.2 meters')}
        <p><strong>العناصر:</strong> نقطة التأثير بين القوتين، على بعد ${ltr('0.2 m')} من حامل القوة الثانية والأقرب إليها لأنها الأكبر؛ الحامل موازٍ؛ الجهة جهة القوتين؛ الشدة ${ltr('50 N')}.</p><p><strong>الرسم:</strong> مثّل ${V_F1} و${V_F2} متوازيين في جهة واحدة عند A وB، ثم ${V_F} بينهما عند C، وأظهر ${ltr('d₂ = 0.2 m')} و${ltr('d₁ = 0.3 m')}.</p>`)}
      ${explanation(67, `<p><strong>التحقق:</strong></p>${equation('20\\times0.3=30\\times0.2=6~\\mathrm{N\\,m}','20 times 0.3 equals 30 times 0.2 equals 6 newton meters')}<p>الوحدتان متسقتان، ومجموع البعدين ${ltr('0.3 + 0.2 = 0.5 m')}. كما تقع النقطة أقرب إلى ${ltr('30 N')}، فيؤيد الموضع النتيجة.</p>`)}
    </article>

    <article class="teacher-subsection" data-page-reference="p68">
      <h4>تطبيق الجهتين المتعاكستين · p68</h4>
      ${answer(`<p><strong>المعطيات:</strong> ${ltr('d = 60 cm')}، ${ltr('F₁ = 200 N')}، ${ltr('F₂ = 300 N')}، والجهتان متعاكستان.</p><p><strong>المطلوب:</strong> الشدة، العناصر، الرسم.</p>
        ${calculation('F=F_{2}-F_{1}=300-200=100~\\mathrm{N}','F equals 300 minus 200 equals 100 newtons')}
        ${calculation('\\frac{F_{2}}{d_{1}}=\\frac{F}{d}\\Rightarrow\\frac{300}{d_{1}}=\\frac{100}{60}\\Rightarrow d_{1}=180~\\mathrm{cm}','300 over d one equals 100 over 60, therefore d one equals 180 centimeters')}
        <p><strong>العناصر:</strong> الشدة ${ltr('100 N')}، والجهة جهة ${V_F2} الأكبر، والحامل موازٍ، ونقطة التأثير خارج القطعة من جهة ${V_F2}. الرسم يضع المحصلة على امتداد AB بعد B.</p>`)}
      ${explanation(68, `<p><strong>التحقق العددي:</strong> بعد القوة الأكبر عن المحصلة ${ltr('d₂ = 180 − 60 = 120 cm')}.</p>${equation('200\\times180=300\\times120=36000~\\mathrm{N\\,cm}','200 times 180 equals 300 times 120 equals 36000 newton centimeters')}<p><strong>تحقق منطقي:</strong> المحصلة أصغر من القوة الأكبر واتجاهها اتجاه الأكبر، وموضعها خارج القطعة؛ الشروط الثلاثة متوافقة.</p>`)}
      ${sourceDisclosure(68)}
    </article>
  </section>`;
}

function summary() {
  return `<section class="teacher-section" id="teacher-summary" aria-labelledby="teacher-summary-heading">${heading('الخلاصة ومعايير التحقق', '69', 'teacher-summary-heading')}<article class="teacher-subsection" data-page-reference="p69">${explanation(69, `<table class="teacher-compare-table"><thead><tr><th>الحالة</th><th>الشدة</th><th>الجهة</th><th>الموضع</th></tr></thead><tbody><tr><td>جهة واحدة</td><td>${tex('F=F_{1}+F_{2}','F equals F one plus F two')}</td><td>جهة القوتين</td><td>بينهما، أقرب إلى الأكبر</td></tr><tr><td>جهتان متعاكستان</td><td>${tex('F=|F_{1}-F_{2}|','F equals the absolute difference')}</td><td>جهة الأكبر</td><td>خارج القطعة من جهة الأكبر</td></tr></tbody></table><p>في الحالتين: حامل المحصلة موازٍ للحاملين، والموضع يحقق تساوي جداء القوة في بعدها عن حامل المحصلة.</p>`)}${sourceDisclosure(69)}</article></section>`;
}

function textbookQuestions() {
  return `<section class="teacher-section" id="teacher-questions" aria-labelledby="teacher-questions-heading">
    ${heading('جميع أسئلة الكتاب وحلولها', '70', 'teacher-questions-heading')}
    <article class="teacher-subsection" data-page-reference="p70">
      <h4>السؤال الأول · الاختيارات الأربعة</h4>
      ${answer(`<ol><li><strong>a:</strong> ${tex('F=F_{1}+F_{2}','F equals F one plus F two')}، لأن الجهتين واحدة.</li><li><strong>c:</strong> ${tex('F=F_{2}-F_{1}','F equals F two minus F one')}، لأن ${tex('F_{2}>F_{1}','F two greater than F one')} والجهتين متعاكستان.</li><li><strong>c:</strong> ${calculation('F=3+4=7~\\mathrm{N}','F equals 3 plus 4 equals 7 newtons')}</li><li><strong>a:</strong> ${tex('d=d_{1}+d_{2}','d equals d one plus d two')} لأن المحصلة بين القوتين.</li></ol>`)}
      ${explanation(70, `<p>اطلب من الطالب تحديد «الجهة» قبل اختيار العملية. السؤال الرابع هندسي: في حالة الجهة الواحدة يقسم حامل المحصلة المسافة الكلية إلى جزأين، لذلك تجمع المسافتان.</p>`)}

      <h4>السؤال الثاني · المسألة الأولى</h4>
      ${answer(`<p><strong>المعطيات:</strong> ${ltr('F₁ = 40 N')}، ${ltr('F₂ = 10 N')}، ${ltr('d₁ = 30 cm')}، القوتان بجهة واحدة.</p><p><strong>المطلوب 1 — الشدة:</strong></p>
        ${calculation('F=F_{1}+F_{2}=40+10=50~\\mathrm{N}','F equals 40 plus 10 equals 50 newtons')}
        <p><strong>المطلوب 2 — طول المسطرة:</strong></p>
        ${calculation('F_{1}d_{1}=F_{2}d_{2}\\Rightarrow40\\times30=10d_{2}\\Rightarrow d_{2}=120~\\mathrm{cm}','40 times 30 equals 10 d two, therefore d two equals 120 centimeters')}
        ${calculation('d=d_{1}+d_{2}=30+120=150~\\mathrm{cm}','d equals 30 plus 120 equals 150 centimeters')}
        <p><strong>المطلوب 3 — العناصر:</strong> الشدة ${ltr('50 N')}؛ الجهة جهة القوتين؛ الحامل موازٍ لهما؛ نقطة التأثير بينهما، على بعد ${ltr('30 cm')} من القوة الأكبر ${V_F1} و${ltr('120 cm')} من ${V_F2}. في الرسم توضع المحصلة بين الطرفين وأقرب إلى ${V_F1}.</p><p><strong>التحقق:</strong> ${ltr('40 × 30 = 10 × 120 = 1200 N·cm')}.</p>`)}

      <h4>السؤال الثاني · المسألة الثانية</h4>
      ${answer(`<p><strong>المعطيات:</strong> ${ltr('F₁ = 80 N')}، ${ltr('F₂ = 20 N')}، ${ltr('d = 40 cm')}، الجهتان متعاكستان.</p><p><strong>المطلوب 1 — الشدة:</strong></p>
        ${calculation('F=F_{1}-F_{2}=80-20=60~\\mathrm{N}','F equals 80 minus 20 equals 60 newtons')}
        <p><strong>المطلوب 2 — بعد حامل القوة الثانية عن المحصلة:</strong> ليكن هذا البعد ${tex('x','x')}، فيكون بعد القوة الأولى عن المحصلة ${tex('x-40','x minus 40')}.</p>
        ${calculation('80(x-40)=20x\\Rightarrow60x=3200\\Rightarrow x=\\frac{160}{3}~\\mathrm{cm}\\approx53.3~\\mathrm{cm}','80 times x minus 40 equals 20 x, therefore x equals 160 over 3 centimeters, approximately 53.3 centimeters')}
        <p><strong>المطلوب 3 — العناصر:</strong> الشدة ${ltr('60 N')}؛ الجهة جهة ${V_F1} الأكبر؛ الحامل موازٍ؛ نقطة التأثير خارج القطعة من جهة ${V_F1}. في الرسم تكون المسافة من ${V_F2} إلى المحصلة ${ltr('53.3 cm')}، ومن ${V_F1} إلى المحصلة ${ltr('13.3 cm')}.</p><p><strong>التحقق:</strong> ${ltr('80 × 13.3 ≈ 20 × 53.3')}، ومع الكسر الدقيق يتساوى الطرفان تماماً.</p>`)}
      ${explanation(70, `<p><strong>أخطاء شائعة:</strong> جمع القوتين المتعاكستين؛ وضع محصلتهما بين الحاملين؛ استعمال ${ltr('40 cm')} مباشرة بوصفها بعد القوة الأكبر عن المحصلة؛ إسقاط الوحدة؛ أو تقريب المسافة في وسط الحساب. احتفظ بالكسر ${tex('\\frac{160}{3}','160 over 3')} حتى النهاية.</p><p><strong>معيار الرسم:</strong> يجب أن تظهر الأسهم والحوامل والجهات والنقاط والمسافات، لا أن يكون الرسم زخرفياً فقط.</p>`)}
      ${sourceDisclosure(70)}
    </article>
  </section>`;
}

function simulationGuide() {
  return `<section class="teacher-section" id="teacher-simulation" aria-labelledby="teacher-simulation-heading">${heading('دليل التجربة التفاعلية', '65–68', 'teacher-simulation-heading')}<article class="teacher-simulation-note" data-simulation-reference="parallel-resultant-lab" data-page-reference="p65-p68"><h4>مختبر موضع المحصلة</h4><p><strong>ما يفعله:</strong> يغيّر ${V_F1} و${V_F2} والمسافة، ويحسب الشدة والموضع للحالتين. زر الحركة يمسح قيمة القوة الثانية، ويُحترم تفضيل تقليل الحركة.</p><p><strong>ما لا يفعله:</strong> لا يحاكي مرونة المسطرة أو قراءات ربيعة حقيقية أو احتكاكاً. إنه <bdi dir="ltr">Educational simplified model</bdi>.</p><p><strong>نشاط صفّي:</strong> ثبّت المسافة والقوة الأولى، ثم زد الثانية. اطلب من الطلاب توقع اتجاه حركة C قبل الضغط، وبعده تحقق من علاقة الجداءين.</p></article></section>`;
}

export function renderTeacherContent() {
  return `<header class="teacher-workspace-header"><div><p class="teacher-workspace-eyebrow">دليل المعلم · المصدر p63–p70</p><h2 id="teacher-workspace-heading" tabindex="-1">القوى المتوازية</h2><p>الصف الثامن · الوحدة الأولى — الحركة والقوى · حلول وأنشطة موثقة الصفحة</p></div><button class="teacher-logout-button" type="button" data-teacher-logout>إنهاء الجلسة</button></header>
  <div class="teacher-workspace-layout"><nav class="teacher-nav" aria-label="التنقل في دليل المعلم"><p class="teacher-nav-title">أقسام الدليل</p><a href="#teacher-overview">الأهداف</a><a href="#teacher-activities">التجارب</a><a href="#teacher-examples">التطبيقات المحلولة</a><a href="#teacher-summary">الخلاصة</a><a href="#teacher-questions">أسئلة الكتاب</a><a href="#teacher-simulation">التفاعل</a></nav><div class="teacher-content">${overview()}${activities()}${workedExamples()}${summary()}${textbookQuestions()}${simulationGuide()}</div></div>`;
}
