/* دفتر الطالب — الوحدة الأولى، الدرس الثاني: القوى المتوازية (ص 63–70).
 *
 * The notebook is the *final stage* of the Lesson 2 stepper (`LESSON_2_PAGES`
 * in `lesson-2-content.js`); it is not a separate page and not a shortcut card
 * in another section. It follows the markup contract of the Lesson 1 notebook
 * (same `student-notebook*` classes, same KaTeX helpers) so the two notebooks
 * look like one product, while this file holds only Lesson 2's own material.
 *
 * Every statement below is traceable to `src/lesson-2-content.js`,
 * `src/lesson-2-practice-data.js`, `src/lesson-2-physics.js` or
 * `docs/unit-1-lesson-2-source-audit.md` (pages 63–70). Nothing new is
 * introduced: no torque concept, no Pythagoras rule, and no third case.
 */

import { formula, tex, V_F, V_F1, V_F2, V_F3, V_W } from './math.js';

const law = (label, source, reading) => `
      <div class="student-notebook-law"><span>${label}</span><div class="student-notebook-formula">${formula(source, reading)}</div></div>`;

const definition = (term, text) => `
      <div class="student-notebook-definition"><strong>${term}:</strong> ${text}</div>`;

/* Escape the plain-text halves of a worked step. Control and RTL values that
   are TeX are always inserted through `tex()`/`formula()`, never as raw text. */
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

/** One labelled line: «القانون» then the equation, kept on a single line. */
const chain = (label, source, reading) => `
      <div class="student-notebook-step"><span>${label}</span><div>${tex(source, reading)}</div></div>`;

/** One plain sentence of a worked example. */
const line = (text) => `
      <p class="student-notebook-example-step">${text}</p>`;

const exampleTitle = (text) => `
      <h4 class="student-notebook-example-title">${text}</h4>`;

const section = (id, title, body) => `
    <section class="student-notebook-section" aria-labelledby="${id}">
      <h3 id="${id}">${title}</h3>${body}
    </section>`;

/* --- the laws, written once and reused inside the sections ---------------- */
const SAME_MAGNITUDE = law('الشدة', 'F=F_{1}+F_{2}', 'F equals F one plus F two');
const SAME_PRODUCTS = law('نقطة التأثير', 'F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two');
const SAME_SEGMENT = law('القطعة', 'd=d_{1}+d_{2}', 'd equals d one plus d two');
const OPPOSITE_MAGNITUDE = law('الشدة', 'F=F_{2}-F_{1}', 'F equals F two minus F one, with F two greater than F one');
const OPPOSITE_PRODUCTS = law('نقطة التأثير', 'F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two');
const OPPOSITE_SEGMENT = law('القطعة', 'd=d_{2}-d_{1}', 'd equals d two minus d one');
const PROPORTION_BASE = law('من الجداءين', '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}', 'F one over d two equals F two over d one');
const PROPORTION_CHAIN = law('السلسلة الكاملة', '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}=\\dfrac{F_{1}+F_{2}}{d_{2}+d_{1}}=\\dfrac{F}{d}', 'F one over d two equals F two over d one equals F over d');
const EQUILIBRIUM_FORCE = law('قوة الربيعة', '\\vec{F}_{3}=-\\vec{F}', 'vector F three is opposite to vector F');

export const LESSON_2_NOTEBOOK_BLOCK = `<article class="student-notebook l2-student-notebook" aria-labelledby="student-notebook-title">
  <header class="student-notebook-header">
    <p class="student-notebook-kicker">المرحلة ٩ · خلاصة الدرس ومرجعه الكامل</p>
    <h2 id="student-notebook-title">📒 دفتر الطالب</h2>
    <p>دفتر مرجعي للدرس الثاني كاملًا (ص 63–70): التعريفات، والتجارب، وعناصر المحصلة في الحالتين، وسلسلة التناسب، والأمثلة المحلولة، والرموز والوحدات، وقواعد قراءة الرسم، وأكثر الأخطاء شيوعًا.</p>
    <div class="student-notebook-tags">
      <span class="curriculum-tag curriculum-tag-book">محتوى الكتاب المدرسي · ص 63–70</span>
      <span class="curriculum-tag curriculum-tag-enrich">تنظيم وشرح من المنصة</span>
    </div>
  </header>
  <div class="student-notebook-sheet">

${section('l2-nb-scope', '١. ما يطلبه الدرس مني', `
      <ul class="student-notebook-list">
        <li>يتعرّف القوى المتوازية.</li>
        <li>يحدّد عناصر محصلة قوتين متوازيتين بجهة واحدة.</li>
        <li>يحدّد عناصر محصلة قوتين متوازيتين بجهتين متعاكستين.</li>
        <li>يمثّل بالرسم القوى المتوازية ومحصلتها.</li>
      </ul>
      <p><strong>الكلمات المفتاحية:</strong> قوتان متوازيتان · الحامل · المحصلة ${V_F} · نقطة التأثير.</p>
      <p class="student-notebook-note"><strong>خريطة الدرس:</strong> ص 63 مشهدان وأهداف ← ص 64 تعريف من التجربة ← ص 65 محصلة الجهة الواحدة ← ص 66 التناسب و«أفكر» وبداية التطبيق ← ص 67 تتمة الحل وحالة التعاكس ← ص 68 تطبيق التعاكس ← ص 69 «تعلّمت» ← ص 70 «أختبر نفسي».</p>`)}

${section('l2-nb-terms', '٢. التعريفات والمصطلحات', `
${definition('القوى المتوازية', 'هي القوى التي تكون حواملها مستقيمات متوازية (استنتاج ص 64). التعريف يصف <strong>وضع الحوامل</strong> لا تساوي الشدات ولا الاتزان.')}
${definition('الحامل', 'هو المستقيم الذي تعمل القوة على استقامته. وهو غير نقطة التأثير: نقطة التأثير موضع على الحامل، والحامل هو الخط كله.')}
${definition('نقطة التأثير', 'هي النقطة التي تؤثر فيها القوة في الجسم: ' + tex('A', 'A') + ' و ' + tex('B', 'B') + ' للقوتين، و ' + tex('C', 'C') + ' لمحصلتهما.')}
${definition('المحصلة', `قوة <strong>وحيدة</strong> تقوم مقام القوتين، وتُعيَّن بأربعة عناصر: الحامل، والجهة، والشدة، ونقطة التأثير.`) }
${definition('الجهة والشدة', 'الجهة: إلى أي ناحية يؤثر السهم. الشدة: مقدار القوة، وتُقاس بوحدة النيوتن ' + tex('\\mathrm{N}', 'newton') + '.')}
${definition('الجداءان', `الجداء ${tex('F_{1}\\times d_{1}', 'F one times d one')} والجداء ${tex('F_{2}\\times d_{2}', 'F two times d two')}؛ هما مفتاح تحديد موضع ${tex('C', 'C')}: يتساويان دائمًا في الحالتين.`) }
${definition('سلسلة التناسب', 'ترتيب للعلاقة نفسها يسمح بحساب بعد واحد إذا عُرفت المقادير الأخرى؛ ليست قانونًا جديدًا.')}
${definition('قوة الربيعة', `${V_F3} هي قراءة الربيعة في التجربة، وهي <strong>ليست</strong> المحصلة: لها الشدة نفسها والجهة المعاكسة.`) }
${definition('جسم/ساق/مسطرة مهملة الكتلة', 'لا يُحسب وزنها في المسألة، فلا تُضاف قوة وزن إضافية.')}
      <p class="student-notebook-note"><strong>لا تخلط:</strong> <strong>التوازي</strong> صفة هندسية للحوامل (مستقيمات لا تتقاطع)، و<strong>الاتزان</strong> صفة حركية (لا انتقال ولا دوران). قد تكون القوى متوازية وغير متزنة، أو متوازية ومتزنة معًا.`)}

${section('l2-nb-experiments', '٣. التجارب وخطواتها', `
      <p><strong>أدوات الصفحتين 64 و 65:</strong> لوح الربائع المغناطيسي — مسطرة خفيفة مثقّبة ومدرّجة — جسم (أجسام) مزوّد بخطّاف — ربائع — خيوط ربط — (حقيبة الميكانيك).</p>
      <p><strong>تجربة التعريف (ص 64):</strong></p>
      <ol class="student-notebook-list">
        <li>أعلّق جسمًا في خطّاف ربيعة، فيتأثر بقوة ثقله ${V_W}؛ حاملها <strong>شاقولي</strong> وجهتها <strong>إلى أسفل</strong>.</li>
        <li>أربط خطّافي ربيعتين بخيطين على لوح الربائع، وأعلّق كلًّا منهما بطرفي مسطرة خفيفة، وأعلّق خطاف الجسم في النقطة ${tex('C', 'C')} من المسطرة بحيث تبقى أفقية متوازنة.</li>
        <li>أرسم خطًّا على امتداد كل ربيعة، ثم أرفع الربائع والمسطرة: تبقى <strong>ثلاثة مستقيمات متوازية</strong>. وثقل الجسم يحافظ على حامله الشاقولي وجهته السفلية؛ يتغيّر موضع نقطة تأثيره (إلى ${tex('C', 'C')}) لا حامله.</li>
      </ol>
      <p><strong>تجربة الجهة الواحدة (ص 65)، تسع خطوات:</strong> أعلّق ثقلين مختلفين ${tex('w_{1}=F_{1}', 'w one equals F one')} و ${tex('w_{2}=F_{2}', 'w two equals F two')} في طرفي مسطرة طولها ${tex('d', 'd')} ← أبحث عن النقطة ${tex('C', 'C')} التي تبقى المسطرة عندها أفقية متوازنة ← أسجّل قراءة الربيعة ${V_F3} ← ألاحظ حاملها بالنسبة إلى حاملي الثقلين ← أرسم الحوامل الثلاثة والقوة ${V_F} التي تعاكس ${V_F3} ← أمثّل القوى ← أقيس ${tex('d_{1}=CA', 'd one equals C A')} و ${tex('d_{2}=CB', 'd two equals C B')} ← أحسب ${tex('F_{1}\\times d_{1}', 'F one times d one')} و ${tex('F_{2}\\times d_{2}', 'F two times d two')}.</p>
      <p><strong>قراءة التجربة (ص 67):</strong> أنزع الثقل ${tex('w_{1}=F_{1}', 'w one equals F one')} فتختل أفقية المسطرة لأن الجداءين لم يبقيا متعادلين حول ${tex('C', 'C')}؛ وإعادة الثقل تعيد الاتزان. لذلك يكون ${V_F1} هو القوة التي توازن ${V_F2} و ${V_F3} في هذه الحالة، أي أنه يُقابل ${V_F2} بالتعاكس.</p>
      <p>عند الاتزان تعادل الربيعة أثر الثقلين معًا، فتكون ${V_F3} معاكسة للمحصلة ومساوية لها شدة؛ والقوة ${V_F} التي تعاكس ${V_F3} مباشرةً هي محصلة القوتين المتوازيتين.</p>
${EQUILIBRIUM_FORCE}
      <p class="student-notebook-note"><strong>النتيجة الحسابية للتجربة:</strong> الجداءان متساويان دائمًا: ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')}، وموضع ${tex('C', 'C')} يتحرك حتى يتحقق ذلك.`)}

${section('l2-nb-same', '٤. محصلة قوتين متوازيتين بجهة واحدة', `
      <p>المحصلة قوة وحيدة ${V_F} عناصرها الأربعة كما في استنتاج ص 65:</p>
      <ol class="student-notebook-list">
        <li><strong>الحامل:</strong> يوازي حاملي القوتين ${V_F1} و ${V_F2}.</li>
        <li><strong>الجهة:</strong> بجهة القوتين نفسها.</li>
        <li><strong>الشدة:</strong> حاصل جمع شدتي القوتين.</li>
        <li><strong>نقطة التأثير:</strong> تقع على القطعة المستقيمة ${tex('(AB)', 'A B')} الواصلة بين نقطتي تأثير القوتين، وأقرب إلى القوة الأكبر، وتحقق تساوي الجداءين.</li>
      </ol>
${SAME_MAGNITUDE}
${SAME_PRODUCTS}
${SAME_SEGMENT}
      <p><strong>لماذا تقترب ${tex('C', 'C')} من الأكبر؟</strong> لأن الجداءين يجب أن يبقيا متساويين؛ فالقوة الأكبر تحتاج بعدًا أصغر، والقوة الأصغر تحتاج بعدًا أكبر. العلاقة <strong>عكسية</strong> بين الشدة والبعد عن حامل المحصلة.</p>
      <p class="student-notebook-note"><strong>حالة تساوي الشدتين:</strong> من ${tex('F_{1}=F_{2}', 'F one equals F two')} و ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')} يلزم ${tex('d_{1}=d_{2}', 'd one equals d two')}، فتستقر ${tex('C', 'C')} في <strong>منتصف</strong> المسافة بين نقطتي التأثير («أفكر» ص 66).`)}

${section('l2-nb-proportion', '٥. من الجداءين إلى سلسلة التناسب', `
      <p>بترتيب ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one d one equals F two d two')} نحصل على أول صورتين، ثم نستخدم خاصية التناسب في الرياضيات:</p>
${PROPORTION_BASE}
${law('خاصية التناسب', '\\dfrac{A}{B}=\\dfrac{C}{D}=\\dfrac{A+C}{B+D}', 'A over B equals C over D equals A plus C over B plus D')}
${PROPORTION_CHAIN}
      <p>حيث ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')} و ${tex('d=d_{1}+d_{2}', 'd equals d one plus d two')} في حالة <strong>الجهة الواحدة</strong> فقط.</p>
      <p><strong>خطوات الحل بسلسلة التناسب:</strong></p>
      <ol class="student-notebook-list">
        <li>حدّد الجهتين أولًا: واحدة أم متعاكستان.</li>
        <li>احسب الشدة ${tex('F', 'F')} بالجمع أو بالطرح.</li>
        <li>اكتب السلسلة واختر منها الكسرين الذين يحويان المجهول والمعلوم فقط.</li>
        <li>حلّ التناسب، ثم تحقق بالجداءين: ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')}.</li>
        <li>تحقق من موضع ${tex('C', 'C')}: بين القوتين في الجهة الواحدة، وخارج القطعة في التعاكس.</li>
      </ol>
      <p class="student-notebook-note"><strong>تنبيه وحدات:</strong> إذا كانت المسافة بالسنتيمتر بقيت الأبعاد بالسنتيمتر، وإذا كانت بالمتر بقيت بالمتر. لا تخلط الوحدتين في المسألة نفسها.</p>`)}

${section('l2-nb-opposite', '٦. محصلة قوتين متوازيتين بجهتين متعاكستين', `
      <p><strong>الشرط:</strong> يفترض الكتاب أن ${tex('F_{2}>F_{1}', 'F two greater than F one')}، فالجهة جهة القوة الأكبر ${V_F2}.</p>
      <ol class="student-notebook-list">
        <li><strong>الحامل:</strong> يوازي حاملي القوتين ${V_F1} و ${V_F2} (لا ينطبق على أحدهما).</li>
        <li><strong>الجهة:</strong> بجهة القوة الأكبر ${V_F2}.</li>
        <li><strong>الشدة:</strong> حاصل طرح شدتي القوتين (الأصغر من الأكبر).</li>
        <li><strong>نقطة التأثير:</strong> تقع على <strong>امتداد</strong> القطعة ${tex('(AB)', 'A B')}، خارج القطعة، ومن جهة القوة الأكبر، وتحقق تساوي الجداءين.</li>
      </ol>
${OPPOSITE_MAGNITUDE}
${OPPOSITE_PRODUCTS}
${OPPOSITE_SEGMENT}
      <p>ومن الهندسة نفسها: ${tex('d_{2}=d_{1}+d', 'd two equals d one plus d')}، والبعد الأكبر هو دائمًا بعد القوة الأصغر عن ${tex('C', 'C')}.</p>
      <p><strong>ما الذي يتغير عند عكس جهة إحدى القوتين؟</strong> تتغير ثلاثة أشياء فقط: عملية الشدة (طرح بدل جمع)، وجهة المحصلة (جهة الأكبر)، وموضع ${tex('C', 'C')} (خارج القطعة بدل بينها). أمّا التوازي وعلاقة الجداءين فلا يتغيران.</p>`)}

${section('l2-nb-compare', '٧. جدول يجمع الحالتين', `
      <table class="l2-compare-table">
        <thead><tr><th>العنصر</th><th>جهة واحدة</th><th>جهتان متعاكستان (${tex('F_{2}>F_{1}', 'F two greater than F one')})</th></tr></thead>
        <tbody>
          <tr><th>الشدة</th><td>${tex('F=F_{1}+F_{2}', 'sum')}</td><td>${tex('F=F_{2}-F_{1}', 'difference')}</td></tr>
          <tr><th>الجهة</th><td>جهة القوتين</td><td>جهة القوة الأكبر</td></tr>
          <tr><th>الحامل</th><td>يوازي الحاملين</td><td>يوازي الحاملين</td></tr>
          <tr><th>نقطة التأثير</th><td>على ${tex('AB', 'A B')} وأقرب إلى الأكبر</td><td>على امتداد ${tex('AB', 'A B')} من جهة الأكبر</td></tr>
          <tr><th>الجداءان</th><td>${tex('F_{1}d_{1}=F_{2}d_{2}', 'products equal')}</td><td>${tex('F_{1}d_{1}=F_{2}d_{2}', 'products equal')}</td></tr>
          <tr><th>علاقة الأبعاد</th><td>${tex('d=d_{1}+d_{2}', 'd equals d one plus d two')}</td><td>${tex('d=d_{2}-d_{1}', 'd equals d two minus d one')}</td></tr>
        </tbody>
      </table>`)}

${section('l2-nb-examples', '٨. الأمثلة المحلولة — بقيم الكتاب كما هي', `
      <p class="student-notebook-note"><strong>طريقة العرض في كل مثال:</strong> القانون، ثم التعويض العددي، ثم النتيجة النهائية بالوحدة. وكل عملية في سطر واحد.

${exampleTitle('المثال 1 — ساق مهملة الكتلة، قوتان بجهة واحدة (ص 66–67)')}
${line(`<strong>المعطيات:</strong> ${tex('AB=0.5\\,\\mathrm{m}', 'A B equals 0.5 metres')} ، ${tex('F_{1}=20\\,\\mathrm{N}', 'F one equals 20 newtons')} ، ${tex('F_{2}=30\\,\\mathrm{N}', 'F two equals 30 newtons')} ، والجهتان واحدة.`)}
${line('<strong>المطلوب:</strong> الشدة، وبعد حامل القوة الثانية عن حامل المحصلة، وعناصر المحصلة، والرسم.')}
${chain('1 الشدة — القانون', 'F=F_{1}+F_{2}', 'F equals F one plus F two')}
${chain('التعويض', 'F=20+30', 'F equals 20 plus 30')}
${chain('النتيجة', 'F=50\\,\\mathrm{N}', 'F equals 50 newtons')}
${chain('2 بعد القوة الثانية — القانون', '\\dfrac{F}{d}=\\dfrac{F_{1}}{d_{2}}', 'F over d equals F one over d two')}
${chain('التعويض', '\\dfrac{50}{0.5}=\\dfrac{20}{d_{2}}', '50 over 0.5 equals 20 over d two')}
${chain('النتيجة', 'd_{2}=0.2\\,\\mathrm{m}', 'd two equals 0.2 metres')}
${chain('3 بعد القوة الأولى', 'd_{1}=0.5-0.2=0.3\\,\\mathrm{m}', 'd one equals 0.5 minus 0.2 equals 0.3 metres')}
${chain('3 التحقق', '20\\times 0.3=30\\times 0.2=6\\,\\mathrm{N\\cdot m}', '20 times 0.3 equals 30 times 0.2 equals 6 newton metres')}
${line(`فالجداءان متساويان، و ${tex('d_{2}=0.2\\,\\mathrm{m}', 'd two equals 0.2 metres')} أصغر من ${tex('d_{1}=0.3\\,\\mathrm{m}', 'd one equals 0.3 metres')}، ولذلك تقع ${tex('C', 'C')} أقرب إلى القوة الأكبر ${tex('30\\,\\mathrm{N}', '30 newtons')}.`)}
${line(`<strong>4 عناصر المحصلة:</strong> الحامل يوازي الحاملين · الجهة جهة القوتين · الشدة ${tex('50\\,\\mathrm{N}', '50 newtons')} · نقطة التأثير على القطعة ${tex('AB', 'A B')} وأقرب إلى ${tex('30\\,\\mathrm{N}', '30 newtons')} وعلى بعد ${tex('0.2\\,\\mathrm{m}', '0.2 metres')} من حامل القوة الثانية.`)}

${exampleTitle('المثال 2 — ساق مهملة الكتلة، قوتان بجهتين متعاكستين (ص 68)')}
${line(`<strong>المعطيات:</strong> ${tex('AB=60\\,\\mathrm{cm}', 'A B equals 60 centimetres')} ، ${tex('F_{1}=200\\,\\mathrm{N}', 'F one equals 200 newtons')} ، ${tex('F_{2}=300\\,\\mathrm{N}', 'F two equals 300 newtons')} ، والجهتان متعاكستان.`)}
${chain('1 الشدة — القانون', 'F=F_{2}-F_{1}', 'F equals F two minus F one')}
${chain('التعويض', 'F=300-200', 'F equals 300 minus 200')}
${chain('النتيجة', 'F=100\\,\\mathrm{N}', 'F equals 100 newtons')}
${chain('2 نقطة التأثير — القانون', '\\dfrac{F_{2}}{d_{1}}=\\dfrac{F}{d}', 'F two over d one equals F over d')}
${chain('التعويض', '\\dfrac{300}{d_{1}}=\\dfrac{100}{60}', '300 over d one equals 100 over 60')}
${chain('النتيجة', 'd_{1}=180\\,\\mathrm{cm}', 'd one equals 180 centimetres')}
${line(`القيمة ${tex('180\\,\\mathrm{cm}', '180 centimetres')} أكبر من ${tex('60\\,\\mathrm{cm}', '60 centimetres')}، وهذا ينسجم مع وقوع ${tex('C', 'C')} <strong>خارج</strong> القطعة من جهة القوة الأكبر.`)}
${chain('3 بعد القوة الأكبر عن C', '180-60=120\\,\\mathrm{cm}', '180 minus 60 equals 120 centimetres')}
${chain('3 التحقق', '200\\times 180=300\\times 120=36000\\,\\mathrm{N\\cdot cm}', '200 times 180 equals 300 times 120 equals 36000 newton centimetres')}

${exampleTitle('المثال 3 — المسألة الأولى ص 70 (قوتان بجهة واحدة)')}
${line(`<strong>المعطيات:</strong> ${tex('F_{1}=40\\,\\mathrm{N}', 'F one equals 40 newtons')} ، ${tex('F_{2}=10\\,\\mathrm{N}', 'F two equals 10 newtons')} ، ${tex('d_{1}=30\\,\\mathrm{cm}', 'd one equals 30 centimetres')} ، والجهتان واحدة.`)}
${line('<strong>المطلوب:</strong> بعد حامل القوة الثانية عن حامل المحصلة، ثم طول المسطرة، ثم عناصر المحصلة.')}
${chain('1 من تساوي الجداءين', 'F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two')}
${chain('التعويض', '40\\times 30=10\\times d_{2}', '40 times 30 equals 10 times d two')}
${chain('النتيجة', 'd_{2}=120\\,\\mathrm{cm}', 'd two equals 120 centimetres')}
${chain('2 طول المسطرة', 'd=d_{1}+d_{2}=30+120=150\\,\\mathrm{cm}', 'd equals 30 plus 120 equals 150 centimetres')}
${chain('3 الشدة', 'F=F_{1}+F_{2}=40+10=50\\,\\mathrm{N}', 'F equals 40 plus 10 equals 50 newtons')}
${line(`<strong>العناصر:</strong> الحامل موازٍ للحاملين · الجهة جهة القوتين · الشدة ${tex('50\\,\\mathrm{N}', '50 newtons')} · نقطة التأثير بين القوتين وأقرب إلى ${tex('40\\,\\mathrm{N}', '40 newtons')}، أي على ${tex('120\\,\\mathrm{cm}', '120 centimetres')} من حامل القوة الأصغر.`)}

${exampleTitle('المثال 4 — المسألة الثانية ص 70 (قوتان بجهتين متعاكستين)')}
${line(`<strong>المعطيات:</strong> ${tex('F_{1}=80\\,\\mathrm{N}', 'F one equals 80 newtons')} ، ${tex('F_{2}=20\\,\\mathrm{N}', 'F two equals 20 newtons')} ، ${tex('d=40\\,\\mathrm{cm}', 'd equals 40 centimetres')} ، والجهتان متعاكستان.`)}
${chain('1 الشدة', 'F=F_{1}-F_{2}=80-20=60\\,\\mathrm{N}', 'F equals 80 minus 20 equals 60 newtons')}
${line(`والجهة جهة القوة الأكبر ${tex('80\\,\\mathrm{N}', '80 newtons')}، والحامل يوازي الحاملين.`)}
${chain('2 بعد القوة الثانية — القانون', '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F}{d}', 'F one over d two equals F over d')}
${chain('التعويض', '\\dfrac{80}{d_{2}}=\\dfrac{60}{40}', '80 over d two equals 60 over 40')}
${chain('النتيجة', 'd_{2}=\\dfrac{160}{3}\\approx 53.33\\,\\mathrm{cm}', 'd two equals 160 over 3, about 53.33 centimetres')}
${chain('3 بعد القوة الأكبر عن C', 'd_{1}=d_{2}-d=\\dfrac{40}{3}\\approx 13.33\\,\\mathrm{cm}', 'd one equals 40 over 3, about 13.33 centimetres')}
${chain('3 التحقق', '80\\times\\dfrac{40}{3}=20\\times\\dfrac{160}{3}=\\dfrac{3200}{3}', 'both products equal 3200 over 3')}
${line(`فالجداءان متساويان، و ${tex('C', 'C')} خارج القطعة من جهة ${tex('80\\,\\mathrm{N}', '80 newtons')}.`)}

${exampleTitle('حالة تساوٍ تأكيدية (من «أفكر» ص 66 وقيم المختبر)')}
${line(`إذا كانت ${tex('F_{1}=F_{2}=20\\,\\mathrm{N}', 'both forces equal 20 newtons')} و ${tex('d=40\\,\\mathrm{cm}', 'd equals 40 centimetres')} بجهة واحدة، فإن ${tex('F=20+20=40\\,\\mathrm{N}', 'F equals 40 newtons')}، ويستلزم تساوي الجداءين ${tex('d_{1}=d_{2}=20\\,\\mathrm{cm}', 'd one equals d two equals 20 centimetres')}؛ أي أن ${tex('C', 'C')} في منتصف ${tex('AB', 'A B')} تمامًا.`)}`)}
${section('l2-nb-symbols', '٩. الرموز والكميات والوحدات', `
      <table class="l2-compare-table">
        <thead><tr><th>الرمز</th><th>الدلالة</th><th>الوحدة</th></tr></thead>
        <tbody>
          <tr><td>${V_F1}</td><td>القوة الأولى (أو الثقل الأول ${tex('w_{1}', 'w one')})</td><td>${tex('\\mathrm{N}', 'newton')}</td></tr>
          <tr><td>${V_F2}</td><td>القوة الثانية (أو الثقل الثاني ${tex('w_{2}', 'w two')})</td><td>${tex('\\mathrm{N}', 'newton')}</td></tr>
          <tr><td>${V_F3}</td><td>قراءة الربيعة في التجربة (غير المحصلة)</td><td>${tex('\\mathrm{N}', 'newton')}</td></tr>
          <tr><td>${V_F}</td><td>المحصلة (الشدة ${tex('F', 'F')})</td><td>${tex('\\mathrm{N}', 'newton')}</td></tr>
          <tr><td>${tex('A,\\ B', 'A and B')}</td><td>نقطتا تأثير القوتين</td><td>—</td></tr>
          <tr><td>${tex('C', 'C')}</td><td>نقطة تأثير المحصلة</td><td>—</td></tr>
          <tr><td>${tex('d', 'd')}</td><td>البعد بين حاملي القوتين ${tex('(AB)', 'A B')}</td><td>${tex('\\mathrm{m}', 'metre')} أو ${tex('\\mathrm{cm}', 'centimetre')}</td></tr>
          <tr><td>${tex('d_{1}', 'd one')}</td><td>بعد حامل القوة الأولى عن حامل المحصلة ${tex('(CA)', 'C A')}</td><td>${tex('\\mathrm{m}', 'metre')} أو ${tex('\\mathrm{cm}', 'centimetre')}</td></tr>
          <tr><td>${tex('d_{2}', 'd two')}</td><td>بعد حامل القوة الثانية عن حامل المحصلة ${tex('(CB)', 'C B')}</td><td>${tex('\\mathrm{m}', 'metre')} أو ${tex('\\mathrm{cm}', 'centimetre')}</td></tr>
          <tr><td>${tex('F\\times d', 'F times d')}</td><td>الجداء المستخدم في تساوي الجداءين</td><td>${tex('\\mathrm{N\\cdot m}', 'newton metre')} أو ${tex('\\mathrm{N\\cdot cm}', 'newton centimetre')}</td></tr>
        </tbody>
      </table>
      <ul class="student-notebook-symbols">
        <li>${tex('1\\,\\mathrm{m}=100\\,\\mathrm{cm}', 'one metre equals 100 centimetres')} — حوّل قبل الحساب إن اختلفت الوحدات.</li>
        <li>${tex('0.5\\,\\mathrm{m}', '0.5 metre')} تساوي ${tex('50\\,\\mathrm{cm}', '50 centimetres')} كما في مثال ص 66.</li>
        <li>الأبعاد ${tex('d,d_{1},d_{2}', 'd, d one, d two')} مقاييس مسافات موجبة، ولا تُكتب بإشارة سالبة.</li>
        <li>الجداء بوحدة ${tex('\\mathrm{N\\cdot m}', 'newton metre')} لا ${tex('\\mathrm{N}', 'newton')}: لا تخلط بين وحدة الشدة ووحدة الجداء.</li>
      </ul>`)}

${section('l2-nb-figures', '١٠. قراءة الرسوم والأسهم والتسميات', `
      <ul class="student-notebook-list">
        <li><strong>مشهد الأرجوحة (ص 63):</strong> كل سلسلة تشد على استقامتها؛ السهمان على السلسلتين لقوتي الشد، وحاملاهما مستقيمان متوازيان لا يتقاطعان عند المقعد. وثقل المقعد سهم شاقولي إلى أسفل.</li>
        <li><strong>مشهد العربة (ص 63):</strong> الحصانان يشدان العربتان بقوتين متوازيتين و<strong>بجهة واحدة</strong> نحو الأمام.</li>
        <li><strong>شكل ص 64 (الربيعة الواحدة ثم الربيعتان):</strong> في الحالة الأولى سهم ثقل واحد شاقولي إلى أسفل. وفي الحالة الثانية سهمان إلى أعلى عند طرفي المسطرة وسهم إلى أسفل عند ${tex('C', 'C')}؛ الحوامل الثلاثة مستقيمات متوازية.</li>
        <li><strong>شكل ص 65:</strong> الثقلان ${tex('w_{1}', 'w one')} و ${tex('w_{2}', 'w two')} إلى أسفل عند ${tex('A', 'A')} و ${tex('B', 'B')}، والربيعة ${V_F3} إلى أعلى عند ${tex('C', 'C')}. ثم يُرسم ${V_F} <strong>معاكسًا</strong> لـ ${V_F3} (إلى أسفل) بجهة القوتين، و ${tex('d_{1}=CA', 'd one equals C A')}، ${tex('d_{2}=CB', 'd two equals C B')}، ${tex('d=AB', 'd equals A B')}.</li>
        <li><strong>شكل ص 67 (الجهة الواحدة):</strong> الترتيب في الرسم: ${V_F2} عند ${tex('B', 'B')}، ثم ${tex('C', 'C')}، ثم ${V_F1} عند ${tex('A', 'A')}؛ ${tex('C', 'C')} أقرب إلى ${V_F2}، والأسهم كلها في جهة واحدة. اعتمد على التسميات لا على يمين الصفحة أو يسارها.</li>
        <li><strong>شكل ص 67 (التعاكس):</strong> ${V_F1} إلى أعلى عند ${tex('A', 'A')}، و ${V_F2} الأكبر إلى أسفل عند ${tex('B', 'B')}، و ${V_F} إلى أسفل عند ${tex('C', 'C')} <strong>خارج</strong> ${tex('AB', 'A B')} من جهة ${V_F2}.</li>
        <li><strong>شكل ص 68:</strong> الترتيب ${tex('C', 'C')} ثم ${tex('B', 'B')} ثم ${tex('A', 'A')}؛ ${tex('C', 'C')} خارج القطعة، و ${tex('d_{1}=CA=180\\,\\mathrm{cm}', 'd one equals C A equals 180 centimetres')}.</li>
        <li><strong>قاعدة قراءة أي مشهد:</strong> اقرأ <strong>وضع الحوامل</strong> و<strong>الجهة</strong> فقط؛ فإن لم تُطبع قيم عددية فلا تُخترع لها شدّات.</li>
        <li><strong>اتجاه الأسهم:</strong> طول السهم يمثل الشدة، ورأسه يمثل الجهة، وبدايته نقطة التأثير. ولذلك يجب أن يتوافق رسم المحصلة مع الجهة المحسوبة، ومع موضع ${tex('C', 'C')} الذي حُسب من الجداءين.</li>
      </ul>`)}

${section('l2-nb-mistakes', '١١. أخطاء شائعة وفروق يجب الانتباه إليها', `
      <ol class="student-notebook-list">
        <li><strong>جمع الشدتين عند التعاكس:</strong> ${tex('200+300=500\\,\\mathrm{N}', '200 plus 300 equals 500 newtons')} خطأ؛ الصحيح ${tex('300-200=100\\,\\mathrm{N}', '300 minus 200 equals 100 newtons')}. والجمع للجهة الواحدة فقط.</li>
        <li><strong>كتابة ${tex('F_{1}-F_{2}', 'F one minus F two')} مع ${tex('F_{2}>F_{1}', 'F two greater than F one')}:</strong> تعطي إشارة سالبة؛ يُطرح الأصغر من الأكبر.</li>
        <li><strong>وضع ${tex('C', 'C')} بين القوتين دائمًا:</strong> بينهما في الجهة الواحدة فقط، أمّا في التعاكس فتقع على امتداد القطعة خارجها من جهة الأكبر.</li>
        <li><strong>«البعد الأكبر للقوة الأكبر»:</strong> العكس هو الصحيح؛ الأكبر يقابله بعد أصغر عن حامل المحصلة.</li>
        <li><strong>خلط التوازي بالاتزان:</strong> التوازي صفة الحوامل، والاتزان شرط إجراء التجربة لتعيين المحصلة.</li>
        <li><strong>استخدام قاعدة فيثاغورث:</strong> ${tex('\\sqrt{3^{2}+4^{2}}=5', 'square root of 3 squared plus 4 squared equals 5')} صحيحة لقوتين <strong>متعامدتين متلاقيتين</strong> في الدرس الأول، وأمّا القوتان المتوازيتان بجهة واحدة فمحصلتهما ${tex('3+4=7\\,\\mathrm{N}', 'three plus four equals 7 newtons')} (سؤال ص 70 رقم 3).</li>
        <li><strong>حساب الشدة بالمتوسط أو بالجداء:</strong> ${tex('25\\,\\mathrm{N}', '25 newtons')} و ${tex('600\\,\\mathrm{N}', '600 newtons')} ليستا شدة المحصلة؛ الشدة جمع أو طرح فقط.</li>
        <li><strong>الخلط بين ${V_F3} و ${V_F}</strong>: ${V_F3} قراءة الربيعة، و ${V_F} المحصلة؛ لهما الشدة نفسها والجهة المعاكسة.</li>
        <li><strong>نسيان علاقة الأبعاد:</strong> في التعاكس ${tex('d=d_{2}-d_{1}', 'd equals d two minus d one')} لا ${tex('d=d_{1}+d_{2}', 'd equals d one plus d two')}.</li>
        <li><strong>الخلط بين صورتَي العلاقة نفسها:</strong> ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')} هي نفسها ${tex('\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}', 'F one over d two equals F two over d one')}؛ لا قانونان.</li>
        <li><strong>إهمال أن الساق «مهملة الكتلة»:</strong> لا يُضاف وزن للساق أو المسطرة إلى القوى.</li>
        <li><strong>اعتبار المحصلة على أحد الحاملين:</strong> حامل المحصلة يوازي الحاملين ولا ينطبق على أحدهما إلا في حالات خاصة.</li>
        <li><strong>وصف القوتين بأنهما متوازيتان «لأن السهمين متجاوران»:</strong> القاعدة أن يُمدّ كل سهم على استقامته؛ فإن كان الحاملان مستقيمين متوازيين فالقوتان متوازيتان، ثم نسأل هل الجهتان واحدة أم متعاكستان.</li>
        <li><strong>افتراض تساوي شدّي سلسلتي الأرجوحة:</strong> مشهدا ص 63 لا يعطيان أي قيم عددية، ولا يُستنتج أن الشدّين متساويان ولا أنهما يساويان الوزن كلٌّ على حدة.</li>
      </ol>`)}

${section('l2-nb-special', '١٢. حالات خاصة واستثناءات وحدود المصدر', `
      <ul class="student-notebook-list">
        <li><strong>شدتان متساويتان بجهة واحدة:</strong> ${tex('F=2F_{1}', 'F equals twice F one')}، وتستقر ${tex('C', 'C')} في منتصف ${tex('AB', 'A B')} لأن ${tex('d_{1}=d_{2}', 'd one equals d two')}.</li>
        <li><strong>شدتان متساويتان بجهتين متعاكستان:</strong> ${tex('F=F_{2}-F_{1}=0', 'F equals zero')}، فلا توجد قوة وحيدة محدودة الموضع تمثل المحصلة. هذا خارج صياغة استنتاج الكتاب الذي يشترط ${tex('F_{2}>F_{1}', 'F two greater than F one')}.</li>
        <li><strong>قوة صفرية أو شدتان متساويتان:</strong> لا تُستخدم سلسلة التناسب لأن ${tex('F=0', 'F equals zero')} يجعل القسمة على صفر.</li>
        <li><strong>حدود الدرس:</strong> القوانين هنا لقوتين متوازيتين فقط. سؤال «هل يمكن إيجاد محصلة عدة قوى متوازية؟» مطروح في ص 64 <strong>دون</strong> أن يعطي الكتاب قانونًا له في هذه الصفحات؛ تُترك الإجابة لما بعدها ولا تُخترع هنا.</li>
        <li><strong>ملاحظة مصدر مسجّلة:</strong> في ص 70 (المسألة الثانية، الطلب 1) قراءة العبارة المطبوعة غير محسومة، ولا تُنسب كلمة «محصّلة» أو «وصلة» إلى الكتاب. نُحسب الشدة ${tex('F', 'F')} بقانون التعاكس في ص 67 لأن الطلبين 2 و 3 يستعملان صراحةً «حامل المحصلة» و«عناصر محصلة هاتين القوتين».</li>
        <li><strong>قيم الكتاب لا تُغيَّر:</strong> 20 و 30 مع ${tex('0.5\\,\\mathrm{m}', '0.5 metre')}؛ 200 و 300 مع ${tex('60\\,\\mathrm{cm}', '60 centimetres')}؛ 40 و 10 مع ${tex('30\\,\\mathrm{cm}', '30 centimetres')}؛ 80 و 20 مع ${tex('40\\,\\mathrm{cm}', '40 centimetres')}.</li>
      </ul>`)}

${section('l2-nb-answers', '١٣. أسئلة «أختبر نفسي» ص 70 وإجاباتها', `
      <table class="l2-compare-table">
        <thead><tr><th>السؤال</th><th>الإجابة</th><th>سبب مختصر</th></tr></thead>
        <tbody>
          <tr><td>1. محصلة قوتين متوازيتين بجهة واحدة</td><td>a) ${tex('F=F_{1}+F_{2}', 'sum')}</td><td>استنتاج ص 65: الشدة حاصل الجمع.</td></tr>
          <tr><td>2. محصلة قوتين متعاكستين و ${tex('F_{2}>F_{1}', 'F two greater than F one')}</td><td>c) ${tex('F=F_{2}-F_{1}', 'difference')}</td><td>استنتاج ص 67: طرح الأصغر من الأكبر.</td></tr>
          <tr><td>3. قوتان شاقوليتان بجهة واحدة ${tex('3\\,\\mathrm{N}', '3 newtons')} و ${tex('4\\,\\mathrm{N}', '4 newtons')}</td><td>c) ${tex('7\\,\\mathrm{N}', '7 newtons')}</td><td>${tex('3+4=7', '3 plus 4 equals 7')}؛ و ${tex('5\\,\\mathrm{N}', '5 newtons')} جمع متعامد من الدرس الأول.</td></tr>
          <tr><td>4. البعد بين حاملَي القوتين في الجهة الواحدة</td><td>a) ${tex('d=d_{1}+d_{2}', 'd one plus d two')}</td><td>حامل المحصلة يقسم ${tex('AB', 'A B')} إلى جزأين.</td></tr>
        </tbody>
      </table>
      <p><strong>المسائل:</strong> المسألة الأولى ${tex('d_{2}=120\\,\\mathrm{cm}', 'd two equals 120 centimetres')}, ${tex('d=150\\,\\mathrm{cm}', 'd equals 150 centimetres')}, ${tex('F=50\\,\\mathrm{N}', 'F equals 50 newtons')}. والمسألة الثانية ${tex('F=60\\,\\mathrm{N}', 'F equals 60 newtons')}, ${tex('d_{2}=\\dfrac{160}{3}\\approx 53.33\\,\\mathrm{cm}', 'd two about 53.33 centimetres')}.</p>`)}

${section('l2-nb-plan', '١٤. خريطة القرار وقائمة تحقق قبل التسليم', `
      <ol class="student-notebook-list">
        <li>هل الحوامل مستقيمات متوازية؟ إن لا، فليست من قوى هذا الدرس.</li>
        <li>هل الجهتان واحدة أم متعاكستان؟ (هذا يحدد العملية).</li>
        <li>الشدة: اجمع في الجهة الواحدة، واطرح الأصغر من الأكبر في التعاكس.</li>
        <li>الجهة: جهة القوتين، أو جهة القوة الأكبر.</li>
        <li>الموضع: عيّن ${tex('C', 'C')} من تساوي الجداءين، ثم تحقق هل هو بين القوتين أم خارج القطعة.</li>
      </ol>
      <p><strong>قبل كتابة الجواب:</strong></p>
      <ul class="student-notebook-list">
        <li>اكتب القانون، ثم التعويض، ثم النتيجة، ثم الوحدة.</li>
        <li>تأكد أن الوحدات موحّدة (${tex('\\mathrm{cm}', 'centimetre')} مع ${tex('\\mathrm{cm}', 'centimetre')}، و${tex('\\mathrm{m}', 'metre')} مع ${tex('\\mathrm{m}', 'metre')}).</li>
        <li>تحقق أن ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')} بعد الحساب.</li>
        <li>تحقق أن ${tex('C', 'C')} أقرب إلى القوة الأكبر، وأن ${tex('F_{2}>F_{1}', 'F two greater than F one')} في حالة التعاكس.</li>
        <li>اكتب العناصر الأربعة كاملة: الحامل، والجهة، والشدة، ونقطة التأثير — ولا تكتفِ بالشدة.</li>
      </ul>`)}
  </div>
</article>`;
