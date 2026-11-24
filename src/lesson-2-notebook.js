/* دفتر الطالب — الوحدة الأولى، الدرس الثاني: القوى المتوازية (ص 63–70).
 *
 * The notebook is the final stage of the Lesson 2 stepper. It keeps three
 * layers distinct in-place: printed textbook wording, platform explanations
 * and diagrams, and educational inferences/answers the book does not print.
 * Ambiguous scan text stays explicitly unresolved. The per-page coverage
 * matrix and image audit live in docs/; source scans are the authority.
 */

import { LESSON_2_DIAGRAMS } from './lesson-2-diagrams.js';
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

const sourceBlock = (page, body) => `
      <div class="student-notebook-source-block" data-source-page="${page}">
        <span class="curriculum-tag curriculum-tag-book">نص الكتاب · ص ${page}</span>${body}
      </div>`;

const inferenceBlock = (label, body) => `
      <div class="student-notebook-inference-block">
        <span class="curriculum-tag curriculum-tag-enrich">${label}</span>${body}
      </div>`;

const platformBlock = (label, body) => `
      <div class="student-notebook-platform-block">
        <span class="curriculum-tag curriculum-tag-enrich">${label}</span>${body}
      </div>`;

/** Lesson diagrams are pedagogical redrawings, not scans of the book figures. */
const notebookFigure = (key, page, caption) => {
  const entry = LESSON_2_DIAGRAMS[key];
  if (!entry) throw new Error(`Unknown Lesson 2 notebook diagram: ${key}`);
  const legend = entry.legend?.length
    ? `<ul class="diagram-legend" aria-label="مفتاح الرموز">${entry.legend
      .map((item) => `<li><span class="legend-dot legend-${item.color}" aria-hidden="true"></span>${item.symbol}</li>`)
      .join('')}</ul>`
    : '';
  return `
      <figure class="diagram-card student-notebook-figure" data-notebook-diagram="${key}" data-source-page="${page}">
        <div class="diagram-card-head"><strong>${entry.title}</strong><span class="curriculum-tag curriculum-tag-enrich">إعادة بناء تخطيطية من المنصة · ص ${page}</span></div>
        <div class="diagram-svg-wrap">${entry.svg}</div>
        ${legend}
        <figcaption>${caption}</figcaption>
      </figure>`;
};

/* --- the laws, written once and reused inside the sections ---------------- */
const SAME_MAGNITUDE = law('الشدة', 'F=F_{1}+F_{2}', 'F equals F one plus F two');
const SAME_PRODUCTS = law('نقطة التأثير', 'F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two');
const SAME_SEGMENT = law('القطعة', 'd=d_{1}+d_{2}', 'd equals d one plus d two');
const OPPOSITE_MAGNITUDE = law('الشدة · عندما F₂ أكبر', 'F=F_{2}-F_{1}', 'F equals F two minus F one, with F two greater than F one');
const OPPOSITE_PRODUCTS = law('نقطة التأثير', 'F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two');
const OPPOSITE_SEGMENT_F2 = law('البعد · عندما F₂>F₁', 'd=d_{1}-d_{2}', 'd equals d one minus d two when F two is greater');
const OPPOSITE_SEGMENT_F1 = law('البعد · عندما F₁>F₂', 'd=d_{2}-d_{1}', 'd equals d two minus d one when F one is greater');
const PROPORTION_BASE = law('من الجداءين', '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}', 'F one over d two equals F two over d one');
const PROPORTION_CHAIN = law('السلسلة الكاملة', '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}=\\dfrac{F_{1}+F_{2}}{d_{2}+d_{1}}=\\dfrac{F}{d}', 'F one over d two equals F two over d one equals F over d');
const PROPORTION_SHORT = law('الصيغة المختصرة في الكتاب', '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}=\\dfrac{F}{d}', 'F one over d two equals F two over d one equals F over d');
const EQUILIBRIUM_FORCE = law('قوة الربيعة', '\\vec{F}_{3}=-\\vec{F}', 'vector F three is opposite to vector F');

const tocEntries = [
  ['l2-nb-scope', 'الأهداف والكلمة المفتاحية · ص 63'],
  ['l2-nb-terms', 'التعريفات والمصطلحات · ص 64'],
  ['l2-nb-experiments', 'التجارب وأسئلتها · ص 64–67'],
  ['l2-nb-same', 'المحصلة بجهة واحدة · ص 65–66'],
  ['l2-nb-proportion', 'سلسلة التناسب · ص 66'],
  ['l2-nb-opposite', 'المحصلة بجهتين متعاكستين · ص 67–70'],
  ['l2-nb-compare', 'جدول الحالتين · ص 69'],
  ['l2-nb-examples', 'الأمثلة والمسائل المحلولة · ص 66–70'],
  ['l2-nb-symbols', 'الرموز والكميات والوحدات'],
  ['l2-nb-figures', 'أسئلة المصدر والرسوم · ص 63–70'],
  ['l2-nb-mistakes', 'أخطاء شائعة'],
  ['l2-nb-special', 'حالات خاصة وحدود المصدر'],
  ['l2-nb-answers', 'أختبر نفسي · ص 70'],
  ['l2-nb-plan', 'خريطة الحل وقائمة التحقق'],
];

export const LESSON_2_NOTEBOOK_BLOCK = `<article class="student-notebook l2-student-notebook" aria-labelledby="student-notebook-title">
  <header class="student-notebook-header">
    <p class="student-notebook-kicker">المرحلة ٩ · خلاصة الدرس ومرجعه الكامل</p>
    <h2 id="student-notebook-title">📒 دفتر الطالب</h2>
    <p>مرجع صفحةً بصفحة للكتاب ص 63–70. تُوسم الاقتباسات المطبوعة، وإعادة البناء التعليمية للرسوم، والاستنتاجات التي لا يطبعها الكتاب كلٌّ على حدة؛ وغموض المسح لا يُحسم بالتخمين.</p>
    <div class="student-notebook-tags">
      <span class="curriculum-tag curriculum-tag-book">نص الكتاب · مبيّن بمرجع الصفحة</span>
      <span class="curriculum-tag curriculum-tag-enrich">إثراء/استنتاج المنصة · مبيّن في موضعه</span>
      <span class="curriculum-tag curriculum-tag-enrich">الرسوم هنا إعادة بناء لا صور أصلية</span>
    </div>
    <nav class="student-notebook-toc" id="student-notebook-contents" aria-label="فهرس دفتر الطالب">
      <p class="student-notebook-toc-title">فهرس الدفتر · مرتّب حسب صفحات الكتاب</p>
      <ol>${tocEntries.map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`).join('')}</ol>
    </nav>
  </header>
  <div class="student-notebook-sheet">

${section('l2-nb-scope', '١. ما يطلبه الدرس مني', `
      ${sourceBlock(63, `
        <p><strong>أهداف الدرس:</strong></p>
        <ul class="student-notebook-list">
          <li>يتعرّف القوى المتوازية.</li>
          <li>يحدّد عناصر محصلة قوتين متوازيتين بجهة واحدة.</li>
          <li>يحدّد عناصر محصلة قوتين متوازيتين بجهتين متعاكستين.</li>
          <li>يمثّل بالرسم القوى المتوازية ومحصّلتها.</li>
        </ul>
        <p><strong>الكلمات المفتاحية:</strong> قوتان متوازيتان.</p>`)}
      ${platformBlock('تنظيم من المنصة', `<p><strong>خريطة الصفحات:</strong> ص 63 مشهدان وأهداف ← ص 64 تعريف من التجربة ← ص 65 محصلة الجهة الواحدة ← ص 66 التناسب و«أفكر» وبداية التطبيق ← ص 67 تتمة الحل وحالة التعاكس ← ص 68 تطبيق التعاكس ← ص 69 «تعلّمت» ← ص 70 «أختبر نفسي».</p>`)}
    `)}

${section('l2-nb-terms', '٢. التعريفات والمصطلحات', `
${definition('القوى المتوازية', 'هي القوى التي تكون حواملها مستقيمات متوازية. <span class="curriculum-tag curriculum-tag-book">نص الكتاب · ص 64</span>')}
${definition('الحامل', '<span class="curriculum-tag curriculum-tag-enrich">توضيح من المنصة</span> المستقيم الذي يقع عليه خط عمل القوة؛ وهو غير نقطة التأثير، التي هي موضع محدد على ذلك المستقيم.')}
${definition('نقطة التأثير', '<span class="curriculum-tag curriculum-tag-enrich">توضيح من المنصة</span> نقطة عمل القوة في الجسم: A و B للقوتين، و C للمحصلة في الرسوم التخطيطية.')}
${definition('المحصلة', '<span class="curriculum-tag curriculum-tag-enrich">توضيح من المنصة</span> قوة واحدة تكافئ تأثير القوتين في الحالة المدروسة؛ وتوصف بالحامل والجهة والشدة ونقطة التأثير.')}
${definition('الجهة والشدة', '<span class="curriculum-tag curriculum-tag-enrich">توضيح من المنصة</span> الجهة هي ناحية السهم، والشدة مقدار القوة ويُعبّر عنها بالنيوتن ' + tex('\\mathrm{N}', 'newton') + '.')}
${definition('الجداءان', '<span class="curriculum-tag curriculum-tag-book">علاقة الكتاب · ص 65 و67</span> ' + tex('F_{1}\\times d_{1}', 'F one times d one') + ' و ' + tex('F_{2}\\times d_{2}', 'F two times d two') + ' متساويان في الحالتين الواردتين في الاستنتاجين.')}
${definition('سلسلة التناسب', '<span class="curriculum-tag curriculum-tag-enrich">شرح من المنصة لعلاقة ص 66</span> إعادة ترتيب للتناسب تساعد على إيجاد مقدار مجهول؛ ليست قانون محصلة جديداً.')}
${definition('قوة الربيعة', '<span class="curriculum-tag curriculum-tag-enrich">استنتاج من التجربة</span> قراءة الربيعة F3 في التجربة تكون معاكسة للمحصلة F ومساوية لها شدةً عند الاتزان؛ لا تخلط بين سهم الربيعة وسهم المحصلة.')}
${definition('ساق أو مسطرة مهملة الكتلة', '<span class="curriculum-tag curriculum-tag-enrich">توضيح للمسائل</span> إهمال الكتلة يعني عدم إدخال وزن الساق أو المسطرة ضمن القوى المعطاة.')}
      ${inferenceBlock('توضيح تعليمي — ليس تعريفاً مطبوعاً', `<p><strong>التوازي</strong> صفة هندسية للحوامل، أمّا <strong>الاتزان</strong> فحالة التجربة. قد تكون قوى متوازية من دون أن تكون متزنة.</p>`)}`)}

${section('l2-nb-experiments', '٣. التجارب وخطواتها', `
      ${sourceBlock(64, `
        <p><strong>أدوات التجربة:</strong> لوح الربائع المغناطيسي — مسطرة خفيفة مثقبة ومدرّجة — جسم مزوّد بخطّاف — ربائع — خيوط ربط — (حقيبة الميكانيك).</p>
        <p><strong>خطوات التجربة كما طُبعت:</strong></p>
        <ol class="student-notebook-list">
          <li>أعلّق جسماً في خطّاف ربيعة فيتأثر بقوة ثقله w؛ ما حامل هذه القوة؟ وما جهتها؟</li>
          <li>أربط خطّافي ربيعتين بخيطين باستخدام لوح الربائع، وأعلّق كلّاً منهما بطرفي مسطرة خفيفة، وأعلّق خطّاف الجسم بالنقطة C من المسطرة بحيث تبقى المسطرة أفقية متوازنة كما في الشكل.</li>
        </ol>
        <p><strong>وأسأل:</strong></p>
        <ul class="student-notebook-list">
          <li>هل حاملا قوتي شد الربيعتين الاستقامة ذاتها؟</li>
          <li>هل يتغير حامل قوة ثقل الجسم في هذه الحالة عما كان عليه في الحالة الأولى؟</li>
          <li>أرسم على اللوح ثلاثة خطوط على امتداد كل ربيعة، تمثل كل منها حامل قوة، ثم أرفع الربائع والمسطرة؛ ماذا ألاحظ؟</li>
          <li>ما وضع الخطوط الممثلة لحوامل القوى الثلاث؟</li>
        </ul>`)}
      ${inferenceBlock('استنتاج تعليمي لأسئلة ص 64 — لا يطبع الكتاب هذه الإجابات', `<p>في التمثيل المثالي تمثّل القوى ثلاثة مستقيمات متوازية. قوة الثقل تبقى على حامل شاقولي وجهتها إلى أسفل؛ الذي يتغير هو موضع تأثيرها عند تعليق الجسم في C.</p>`)}
      ${sourceBlock(64, `<p><strong>السؤال الختامي المطبوع:</strong> هل يمكن إيجاد محصلة عدة قوى متوازية؟ وكيف يتم ذلك؟</p>`)}
      ${platformBlock('حدّ المصدر', `<p>تطرح الصفحات 63–70 هذا السؤال ولا تقدّم فيها قاعدةً عامة لعدة قوى؛ لذلك لا نعمّم قانون القوتين هنا.</p>`)}

      ${sourceBlock(65, `
        <p><strong>أدوات التجربة:</strong> لوح الربائع المغناطيسي — مسطرة خفيفة مثقبة ومدرّجة — أجسام مزوّدة بخطّاف — ربائع — خيوط ربط.</p>
        <p><strong>الخطوات التسع كما طُبعت:</strong></p>
        <ol class="student-notebook-list">
          <li>أعلّق في طرفي مسطرة طولها d ثقلين مختلفين (w₂ = F₂) و(w₁ = F₁).</li>
          <li>أبحث عن النقطة C التي أعلّق المسطرة عندها بواسطة ربيعة لتبقى المسطرة متوازنة أفقياً.</li>
          <li>أسجّل دلالة مؤشر الربيعة وليكن F₃؛ ماذا ألاحظ؟</li>
          <li>ألاحظ حامل F₃ بالنسبة لحاملي الثقلين.</li>
          <li>أرسم حوامل القوى الثلاث مع المسطرة، وأرسم حامل القوة F التي تعاكس مباشرة القوة F₃.</li>
          <li>أمثّل القوى بالرسم.</li>
          <li>أقيس بُعد النقطة C عن النقطة A وليكن d₁.</li>
          <li>أقيس بُعد النقطة C عن النقطة B وليكن d₂.</li>
          <li>أحسب الجداء (F₁ × d₁) والجداء (F₂ × d₂).</li>
        </ol>`)}
      ${inferenceBlock('استنتاج تجريبي — صياغة وتفسير من المنصة', `<p>استنتاج ص 65 المطبوع للحالة الناتجة: ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')} و ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')}. وفي قراءة نموذج الربيعة عند الاتزان، تكون قوة F₃ معاكسة لقوة المحصلة F؛ هذا تفسير متجهي للقياسات، لا اقتباس حرفي من خطوات التجربة.</p>${EQUILIBRIUM_FORCE}`)}

      ${sourceBlock(67, `
        <p><strong>أسئلة المتابعة في التجربة السابقة:</strong></p>
        <ol class="student-notebook-list">
          <li>أنزع الثقل w₁ = F₁؛ ماذا ألاحظ؟</li>
          <li>أعيد الثقل F₁؛ ما دور هذا الثقل؟</li>
          <li>ماذا أسمّي هذا الثقل بالنسبة للقوتين F₂ و F₃؟</li>
        </ol>`)}
      ${inferenceBlock('استنتاج تعليمي من شرط الاتزان — لا جواب مطبوع', `<p>في نموذج القوى، عند إعادة F₁ يعود الاتزان. ومتجه F₁ يعاكس محصلة F₂ وF₃ ويساويها شدةً؛ لذلك فهو <strong>قوة موازِنة</strong> لها، لا المحصلة نفسها ذات الجهة ذاتها. هذه قراءة تفسيرية للأسئلة، لا عبارة منقولة عن الكتاب.</p>`)}
    `)}

${section('l2-nb-same', '٤. محصلة قوتين متوازيتين بجهة واحدة', `
      ${sourceBlock(65, `
        <p><strong>عناصر محصلة قوتين متوازيتين وبجهة واحدة:</strong></p>
        <ol class="student-notebook-list">
          <li><strong>الحامل:</strong> يوازي حاملي القوتين F₁ وF₂.</li>
          <li><strong>الجهة:</strong> بجهة القوتين F₁ وF₂.</li>
          <li><strong>الشدة:</strong> حاصل جمع شدتي القوتين: ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')}.</li>
          <li><strong>نقطة التأثير:</strong> تقع على القطعة المستقيمة AB الواصلة بين نقطتي تأثير القوتين، وأقرب إلى القوة الأكبر F₂، وتحقق العلاقة ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two')}.</li>
        </ol>`)}
${SAME_MAGNITUDE}
${SAME_PRODUCTS}
${SAME_SEGMENT}
      ${inferenceBlock('شرح موضع النقطة C — استنتاج من الجداءين', `<p>بما أن ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')}، فالقوة الأكبر يقابلها بُعد أصغر عن حامل المحصلة. لذلك تقع C بين A وB وأقرب إلى القوة الأكبر. وعند تساوي الشدتين، تتساوى المسافتان.</p>`)}
      ${sourceBlock(66, `<p><strong>سؤال «أفكر» كما طُبع:</strong> أين تستقر النقطة C إذا كانت القوتان متوازيتين وبجهة واحدة ومتساويتين شدة؟</p>`)}
      ${inferenceBlock('إجابة استنتاجية — لا يطبعها الكتاب', `<p>من تساوي الجداءين مع ${tex('F_{1}=F_{2}', 'F one equals F two')} ينتج ${tex('d_{1}=d_{2}', 'd one equals d two')}؛ أي تستقر C في منتصف AB.</p>`)}`)}

${section('l2-nb-proportion', '٥. من الجداءين إلى سلسلة التناسب', `
      ${sourceBlock(66, `
        <p>بترتيب العلاقة ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two')} نجد:</p>
${PROPORTION_BASE}
        <p><strong>من خصائص التناسب في الرياضيات:</strong></p>
${law('خاصية التناسب كما في الهامش', '\\dfrac{A}{B}=\\dfrac{C}{D}=\\dfrac{A+C}{B+D}=\\dfrac{K}{L}', 'A over B equals C over D equals A plus C over B plus D equals K over L')}
        <p><strong>ويؤدي ذلك إلى:</strong></p>
${law('الصيغة المختصرة في الهامش', '\\dfrac{A}{B}=\\dfrac{C}{D}=\\dfrac{K}{L}', 'A over B equals C over D equals K over L')}
        <p><strong>وبحسب خصائص التناسب نكتب للقوى:</strong></p>
${PROPORTION_CHAIN}
${PROPORTION_SHORT}`)}
      ${platformBlock('تنبيه مجال العلاقة', `<p>في سلسلة ص 66، ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')} و${tex('d=d_{1}+d_{2}', 'd equals d one plus d two')} تخصّان حالة الجهة الواحدة. لا تنقل جمع المسافات إلى حالة التعاكس.</p>`)}
      ${inferenceBlock('طريقة حل منظّمة من المنصة', `<ol class="student-notebook-list"><li>حدّد الجهتين أولاً.</li><li>احسب الشدة بالجمع أو بالطرح وفق الحالة.</li><li>اختر من التناسب العلاقة التي تضم المجهول والمعلوم.</li><li>تحقّق من ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')}، ثم من موضع C.</li></ol><p><strong>الوحدات:</strong> وحّدها قبل الحساب، ولا تخلط السنتيمتر بالمتر.</p>`)}`)}

${section('l2-nb-opposite', '٦. محصلة قوتين متوازيتين بجهتين متعاكستين', `
      ${sourceBlock(67, `
        <p><strong>عناصر محصلة قوتين متوازيتين وبجهتين متعاكستين، مع الشرط المطبوع ${tex('F_{2}>F_{1}', 'F two greater than F one')}:</strong></p>
        <ol class="student-notebook-list">
          <li><strong>نقطة تأثيرها:</strong> تقع على امتداد القطعة المستقيمة (AB) الواصلة بين نقطتي تأثير القوتين، ومن جهة القوة الأكبر F₂، وتحقق العلاقة ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two')}.</li>
          <li><strong>حاملها:</strong> يوازي حاملي القوتين F₁ وF₂.</li>
          <li><strong>جهتها:</strong> بجهة القوة الأكبر F₂.</li>
          <li><strong>شدتها:</strong> حاصل طرح شدتي القوتين: ${tex('F=F_{2}-F_{1}', 'F equals F two minus F one')}.</li>
        </ol>`)}
${OPPOSITE_MAGNITUDE}
${OPPOSITE_PRODUCTS}
${OPPOSITE_SEGMENT_F2}
      ${inferenceBlock('هندسة المسافات عند F₂>F₁ — استنتاج من تعريف d₁ وd₂', `<p>التعريفات ثابتة: ${tex('d_{1}=CA', 'd one equals C A')}، و${tex('d_{2}=CB', 'd two equals C B')}، و${tex('d=AB', 'd equals A B')}. عندما تقع C خارج AB من جهة B، يكون ${tex('d_{1}>d_{2}', 'd one greater than d two')}، ولذلك ${tex('d=d_{1}-d_{2}', 'd equals d one minus d two')}، أو ${tex('d_{1}=d_{2}+d', 'd one equals d two plus d')}.</p>`)}
      ${inferenceBlock('إذا كانت القوة الأكبر F₁ — استنتاج هندسي لحالة مسألة ص 70', `<p>تنتقل C إلى خارج AB من جهة A، فيصبح ${tex('d_{2}>d_{1}', 'd two greater than d one')}:</p>
${OPPOSITE_SEGMENT_F1}
        <p>أي ${tex('d_{2}=d_{1}+d', 'd two equals d one plus d')}. إذن لا توجد صيغة طرح واحدة صالحة للترتيبين.</p>`)}
      ${platformBlock('ما يتغير وما يبقى', `<p>يتغير جمع الشدة إلى طرح الأصغر من الأكبر، وتتجه المحصلة جهة القوة الأكبر، وتخرج C من القطعة. يبقى توازي الحوامل وعلاقة الجداءين.</p>`)}`)}

${section('l2-nb-compare', '٧. جدول يجمع الحالتين', `
      ${sourceBlock(69, `<p><strong>ملخّص الكتاب:</strong> يورد الشرط ${tex('F_{2}>F_{1}', 'F two greater than F one')} في عنوان حالتي الجهة الواحدة والتعاكس؛ ويذكر العناصر والعلاقات الآتية:</p>
      <table class="l2-compare-table">
        <thead><tr><th>العنصر</th><th>جهة واحدة</th><th>جهتان متعاكستان، F₂&gt;F₁</th></tr></thead>
        <tbody>
          <tr><th>الشدة</th><td>${tex('F=F_{1}+F_{2}', 'sum')}</td><td>${tex('F=F_{2}-F_{1}', 'difference')}</td></tr>
          <tr><th>الجهة</th><td>جهة القوتين</td><td>جهة القوة الأكبر F₂</td></tr>
          <tr><th>الحامل</th><td>يوازي الحاملين</td><td>يوازي الحاملين</td></tr>
          <tr><th>نقطة التأثير</th><td>على AB وأقرب إلى القوة الأكبر F₂</td><td>على امتداد AB من جهة القوة الأكبر F₂</td></tr>
          <tr><th>الجداءان</th><td>${tex('F_{1}d_{1}=F_{2}d_{2}', 'products equal')}</td><td>${tex('F_{1}d_{1}=F_{2}d_{2}', 'products equal')}</td></tr>
        </tbody>
      </table>`)}
      ${inferenceBlock('علاقة المسافات — مع إظهار ترتيب القوتين', `<p>في الجهة الواحدة: ${tex('d=d_{1}+d_{2}', 'd equals d one plus d two')}. وفي التعاكس عندما ${tex('F_{2}>F_{1}', 'F two greater than F one')}: ${tex('d=d_{1}-d_{2}', 'd equals d one minus d two')}. أمّا عندما ${tex('F_{1}>F_{2}', 'F one greater than F two')} — كما في مسألة ص 70 — فالعلاقة ${tex('d=d_{2}-d_{1}', 'd equals d two minus d one')}.</p>`)}
      ${inferenceBlock('تنبيه تحريري حول عنوان ص 69', `<p>شرط ${tex('F_{2}>F_{1}', 'F two greater than F one')} مطبوع في عنوان ملخص الجهة الواحدة أيضاً. وهو ترتيب لتسمية القوة الأكبر في نص الملخص؛ أما قانون الجمع في الجهة الواحدة فلا يتطلب أن تكون F₂ أكبر.</p>`)}`)}

${section('l2-nb-examples', '٨. الأمثلة المحلولة — نص المسألة ثم الحل', `
      ${platformBlock('طريقة القراءة', `<p>ترد أولاً مسألة الكتاب بنصها ومطالبها، ثم يُفصل الحل المطبوع عن التحقق أو الرسم الذي تضيفه المنصة.</p>`)}

${exampleTitle('المثال 1 — قوتان بجهة واحدة (ص 66–67)')}
      ${sourceBlock(66, `
        <p>ساق مهملة الكتلة طولها ${tex('AB=0.5\\,\\mathrm{m}', 'A B equals 0.5 metres')}, تؤثر في طرفيها قوتان متوازيتان وبجهة واحدة شدتهما ${tex('F_{1}=20\\,\\mathrm{N}', 'F one equals 20 newtons')} و${tex('F_{2}=30\\,\\mathrm{N}', 'F two equals 30 newtons')}. المطلوب:</p>
        <ol class="student-notebook-list">
          <li>احسب شدة محصلة هاتين القوتين.</li>
          <li>احسب بُعد حامل القوة الثانية عن حامل المحصلة.</li>
          <li>اكتب عناصر المحصلة.</li>
          <li>ارسم كلاً من (d₁, d₂, F, F₂, F₁).</li>
        </ol>`)}
      ${sourceBlock(66, `<p><strong>الحل المطبوع — الشدة:</strong></p>
${chain('القانون', 'F=F_{1}+F_{2}', 'F equals F one plus F two')}
${chain('التعويض', 'F=20+30', 'F equals 20 plus 30')}
${chain('النتيجة', 'F=50\\,\\mathrm{N}', 'F equals 50 newtons')}`)}
      ${sourceBlock(67, `<p><strong>الحل المطبوع — بُعد القوة الثانية عن حامل المحصلة:</strong></p>
${law('التناسب', '\\dfrac{F}{d}=\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}', 'F over d equals F one over d two equals F two over d one')}
${chain('التعويض', '\\dfrac{50}{0.5}=\\dfrac{20}{d_{2}}', '50 over 0.5 equals 20 over d two')}
${chain('النتيجة', 'd_{2}=0.2\\,\\mathrm{m}', 'd two equals 0.2 metres')}
        <p><strong>عناصر المحصلة كما وردت في الحل:</strong></p>
        <ul class="student-notebook-list">
          <li>نقطة التأثير على القطعة المستقيمة AB، بين نقطتي تأثير القوتين، وأقرب إلى القوة الأكبر F₂؛ وعلى بُعد d₂ = 0.2 m من حامل القوة الثانية.</li>
          <li>حاملها يوازي حاملي القوتين F₁ وF₂.</li>
          <li>جهتها جهة القوتين.</li>
          <li>شدتها F = 50 N.</li>
        </ul>`)}
      ${inferenceBlock('تحقّق حسابي من المنصة — ليس خطوة مطبوعة إضافية', `<p>من ${tex('AB=0.5\\,\\mathrm{m}', 'A B equals 0.5 metres')} و${tex('d_{2}=0.2\\,\\mathrm{m}', 'd two equals 0.2 metres')} ينتج ${tex('d_{1}=0.3\\,\\mathrm{m}', 'd one equals 0.3 metres')}؛ وبالفعل ${tex('20\\times0.3=30\\times0.2', 'both products equal six')}.</p>`)}

${exampleTitle('المثال 2 — قوتان متعاكستان وF₂ الأكبر (ص 68)')}
      ${sourceBlock(68, `
        <p>ساق طويلة مهملة الكتلة تُحدَّد عليها النقطتان A وB، البُعد بينهما ${tex('AB=60\\,\\mathrm{cm}', 'A B equals 60 centimetres')}. تؤثر في كل من A وB قوتان متوازيتان متعاكستان بالجهة، شدتاهما ${tex('F_{1}=200\\,\\mathrm{N}', 'F one equals 200 newtons')} و${tex('F_{2}=300\\,\\mathrm{N}', 'F two equals 300 newtons')}. المطلوب:</p>
        <ol class="student-notebook-list">
          <li>احسب شدة محصلة القوتين.</li>
          <li>اكتب عناصر محصلة القوتين.</li>
          <li>ارسم كلاً من القوى (F₁, F₂, F, d₁).</li>
        </ol>`)}
      ${sourceBlock(68, `<p><strong>الحل المطبوع — الشدة:</strong></p>
${chain('القانون', 'F=F_{2}-F_{1}', 'F equals F two minus F one')}
${chain('التعويض', 'F=300-200', 'F equals 300 minus 200')}
${chain('النتيجة', 'F=100\\,\\mathrm{N}', 'F equals 100 newtons')}
        <p><strong>نقطة التأثير والتناسب:</strong> تقع خارج القطعة من جهة القوة الأكبر، وتحقق سلسلة التناسب الآتية:</p>
${law('التناسب المطبوع', '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}=\\dfrac{F}{d}', 'F one over d two equals F two over d one equals F over d')}
${chain('المعادلة', '\\dfrac{F_{2}}{d_{1}}=\\dfrac{F}{d}', 'F two over d one equals F over d')}
${chain('التعويض', '\\dfrac{300}{d_{1}}=\\dfrac{100}{60}', '300 over d one equals 100 over 60')}
${chain('النتيجة', 'd_{1}=180\\,\\mathrm{cm}', 'd one equals 180 centimetres')}
        <p><strong>عناصر المحصلة كما وردت:</strong> حاملها يوازي حاملي القوتين؛ جهتها جهة القوة الأكبر F₂؛ شدتها F = 100 N؛ ونقطة تأثيرها على المستقيم الواصل بين نقطتي التأثير، خارج القطعة ومن جهة القوة الأكبر.</p>`)}
      ${inferenceBlock('إكمال هندسي للتحقق — استنتاج من تعريف الأبعاد', `<p>هنا F₂ &gt; F₁، وC خارج AB من جهة B: ${tex('d_{1}=180\\,\\mathrm{cm}', 'd one equals 180 centimetres')} و${tex('d=60\\,\\mathrm{cm}', 'd equals 60 centimetres')}، لذلك ${tex('d_{2}=d_{1}-d=120\\,\\mathrm{cm}', 'd two equals 120 centimetres')}. ويتحقق ${tex('200\\times180=300\\times120', 'both products equal thirty six thousand')}.</p>`)}

${exampleTitle('المثال 3 — المسألة الأولى ص 70، جهة واحدة')}
      ${sourceBlock(70, `
        <p>قوتان شاقوليتان بجهة واحدة شدتهما ${tex('F_{1}=40\\,\\mathrm{N}', 'F one equals 40 newtons')} و${tex('F_{2}=10\\,\\mathrm{N}', 'F two equals 10 newtons')}، تؤثران في طرفي مسطرة خفيفة أفقية. إذا علمت أن بُعد حامل القوة الأولى عن حامل المحصلة ${tex('d_{1}=30\\,\\mathrm{cm}', 'd one equals 30 centimetres')}، فالمطلوب:</p>
        <ol class="student-notebook-list">
          <li>احسب بُعد حامل القوة الثانية عن حامل المحصلة.</li>
          <li>احسب طول المسطرة.</li>
          <li>حدّد كتابةً وبالرسم عناصر محصلة القوتين.</li>
        </ol>`)}
      ${inferenceBlock('حل المسألة — تطبيق لقانوني ص 65، وإجابة لا يطبعها سؤال التدريب', `<p>من ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one times d one equals F two times d two')} ينتج:</p>
${chain('التعويض', '40\\times30=10\\times d_{2}', '40 times 30 equals 10 times d two')}
${chain('البعد الثاني', 'd_{2}=120\\,\\mathrm{cm}', 'd two equals 120 centimetres')}
${chain('طول المسطرة', 'd=d_{1}+d_{2}=30+120=150\\,\\mathrm{cm}', 'd equals 150 centimetres')}
${chain('شدة المحصلة', 'F=F_{1}+F_{2}=40+10=50\\,\\mathrm{N}', 'F equals 50 newtons')}
        <p>عناصرها: حامل موازٍ للحاملين، وجهة القوتين، وشدة 50 N، ونقطة تأثير بين القوتين أقرب إلى F₁ = 40 N. الرسم التخطيطي في قسم الرسوم إعادة بناء من المنصة، لا رسم الكتاب المنسوخ.</p>`)}

${exampleTitle('المثال 4 — المسألة الثانية ص 70، F₁ الأكبر')}
      ${sourceBlock(70, `
        <p>قوتان شاقوليتان متعاكستان بجهتين، شدتهما ${tex('F_{2}=20\\,\\mathrm{N}', 'F two equals 20 newtons')} و${tex('F_{1}=80\\,\\mathrm{N}', 'F one equals 80 newtons')}، تؤثران في طرفي مسطرة خفيفة أفقية طولها ${tex('d=40\\,\\mathrm{cm}', 'd equals 40 centimetres')}. المطلوب:</p>
        <ol class="student-notebook-list">
          <li>احسب شدة <strong>[كلمة غير محسومة في المسح]</strong> القوتين.</li>
          <li>احسب بُعد حامل القوة الثانية عن حامل المحصلة.</li>
          <li>حدّد كتابةً وبالرسم عناصر محصلة هاتين القوتين.</li>
        </ol>
        <p class="student-notebook-note">في التكبير تبدو الكلمة بين «شدة» و«القوتين» كأنها «وصلة»، لكن دقة الصورة لا تحسم قراءتها؛ لا نثبتها حرفياً ولا نصححها إلى «محصلة».</p>`)}
      ${inferenceBlock('حل مستنتج من قانون التعاكس في ص 67؛ لا يُنسب إلى لفظ الطلب الغامض', `<p>بما أن F₁ &gt; F₂، تكون المحصلة جهة F₁، وتقع C خارج AB من جهة A. في هذا الترتيب ${tex('d_{2}>d_{1}', 'd two greater than d one')} و${tex('d=d_{2}-d_{1}', 'd equals d two minus d one')}.</p>
${chain('الشدة', 'F=F_{1}-F_{2}=80-20=60\\,\\mathrm{N}', 'F equals 60 newtons')}
${chain('التناسب لحساب d₂', '\\dfrac{F_{1}}{d_{2}}=\\dfrac{F}{d}', 'F one over d two equals F over d')}
${chain('التعويض', '\\dfrac{80}{d_{2}}=\\dfrac{60}{40}', '80 over d two equals 60 over 40')}
${chain('بُعد القوة الثانية', 'd_{2}=\\dfrac{160}{3}\\approx53.33\\,\\mathrm{cm}', 'd two equals 160 over 3, about 53.33 centimetres')}
${chain('بُعد القوة الأولى', 'd_{1}=d_{2}-d=\\dfrac{40}{3}\\approx13.33\\,\\mathrm{cm}', 'd one equals 40 over 3, about 13.33 centimetres')}
        <p>عناصرها: حامل موازٍ للحاملين، جهة القوة الأكبر F₁، شدة 60 N، ونقطة تأثير خارج AB من جهة F₁. والرسم في قسم الرسوم إعادة بناء تخطيطية.</p>`)}

    `)}

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

${section('l2-nb-figures', '١٠. أسئلة المصدر والرسوم التخطيطية', `
      ${sourceBlock(63, `
        <p><strong>ألاحظ الصور ثم أجيب:</strong></p>
        <ol class="student-notebook-list">
          <li>كيف تكون قوى شد السلاسل للأرجوحة؟</li>
          <li>ما الذي يجعل الأرجوحة متوازنة؟</li>
          <li>كيف يشد الحصانان العربة؟</li>
        </ol>`)}
      ${inferenceBlock('قراءة تعليمية للمشهدين — ليست إجابة مطبوعة', `<p>قوتا شد السلسلتين تعملان على امتداد السلسلتين؛ والصورة لا تعطي شدّاً عددياً ولا تثبت تساوي الشدّين. رسم العربة يوضح اتجاهي الشدّ في المشهد، لا مقدار كل قوة. لا تُستنتج أرقام من الصور.</p>`)}
      <div class="dual-diagram-row">
${notebookFigure('swing-scene', 63, 'إعادة بناء تخطيطية لمشهد الأرجوحة في ص 63. السهمان يوضّحان اتجاه الشدّ على السلسلتين والثقل إلى أسفل؛ لا يمثّلان قيماً مقاسة.')}
${notebookFigure('wagon-scene', 63, 'إعادة بناء للمشهد المصوّر في ص 63. الأسهم تمثل شدّ الحصانين في اتجاه واحد؛ وليست الصورة الفوتوغرافية الأصلية.')}
      </div>

      <h4 class="student-notebook-example-title">ص 64 — تجربة التعريف والحوامل المتوازية</h4>
      <div class="dual-diagram-row">
${notebookFigure('single-spring', 64, 'تمثيل القوة على الجسم المعلّق في خطوة التجربة الأولى.')}
${notebookFigure('two-spring-bar', 64, 'إعادة بناء لتجربة المسطرة الأفقية والثقل عند C؛ الأسهم المرسومة تمثيل تعليمي للقوى.')}
      </div>
${notebookFigure('parallel-definition', 64, 'إعادة بناء لشكل الاستنتاج: حوامل قوى مختلفة متوازية، لا متطابقة بالضرورة.')}

      <h4 class="student-notebook-example-title">ص 65 — تجربة الجهة الواحدة واستنتاجها</h4>
      <div class="dual-diagram-row">
${notebookFigure('same-sense-experiment', 65, 'إعادة بناء لشكل التجربة: الثقلان عند A وB، وقراءة الربيعة عند C.')}
${notebookFigure('same-sense-construction', 65, 'إعادة بناء لخطوات الرسم؛ F تعاكس F₃. الأبعاد d₁ وd₂ وd ظاهرة في المخطط.')}
      </div>
${notebookFigure('same-sense', 65, 'إعادة بناء لاستنتاج ص 65: C على AB، أقرب إلى F₂ الأكبر؛ الأسهم في جهة واحدة.')}

      <h4 class="student-notebook-example-title">ص 67–70 — التطبيق والتعاكس والمسائل</h4>
      <div class="dual-diagram-row">
${notebookFigure('worked-same', 67, 'إعادة بناء تخطيطية لرسم حل المثال بجهة واحدة؛ قيمه مأخوذة من الكتاب.')}
${notebookFigure('opposite-sense', 67, 'إعادة بناء لحالة التعاكس المطبوعة مع F₂ أكبر: C خارج AB من جهة B.')}
      </div>
${notebookFigure('worked-opposite', 68, 'إعادة بناء لرسم الحل المطبوع: C ثم B ثم A؛ d₁ = CA = 180 cm.')}
${notebookFigure('sense-comparison', 69, 'مقارنة توضيحية من المنصة لموضعي C في الحالتين؛ ليست شكلاً منقولاً من صفحة «تعلّمت».')}
      <div class="dual-diagram-row">
${notebookFigure('problem-1', 70, 'حلٌّ مرسوم من المنصة لمسألة الجهة الواحدة بعد تعيين d₂ وF.')}
${notebookFigure('problem-2', 70, 'حلٌّ مرسوم من المنصة لمسألة ص 70 عندما F₁ أكبر: C خارج AB من جهة A.')}
      </div>

      ${platformBlock('قاعدة قراءة الرسوم', `<ul class="student-notebook-list">
        <li>الخط المتقطع هو حامل القوة الممتد؛ افحص التوازي، ثم ميّز جهة الأسهم.</li>
        <li>في تجربة ص 65، ${tex('d_{1}=CA', 'd one equals C A')} و${tex('d_{2}=CB', 'd two equals C B')} و${tex('d=AB', 'd equals A B')}.</li>
        <li>طول السهم في هذه الرسوم التخطيطية ليس مقياساً عددياً ما لم تُذكر قيمة أو مقياس صراحة.</li>
        <li>كل SVG أعلاه إعادة بناء تعليمية معنونة بصفحتها؛ لا تدّعي مطابقة الصورة أو الرسم المطبوع حرفياً.</li>
      </ul>`)}`)}

${section('l2-nb-mistakes', '١١. أخطاء شائعة وفروق يجب الانتباه إليها', `
      <ol class="student-notebook-list">
        <li><strong>جمع الشدتين عند التعاكس:</strong> ${tex('200+300=500\\,\\mathrm{N}', '200 plus 300 equals 500 newtons')} خطأ للمثال ص 68؛ الصحيح ${tex('300-200=100\\,\\mathrm{N}', '300 minus 200 equals 100 newtons')}. الجمع للجهة الواحدة فقط.</li>
        <li><strong>عكس طرح الشدتين:</strong> اطرح الأصغر من الأكبر، واكتب جهة المحصلة جهة القوة الأكبر.</li>
        <li><strong>استعمال علاقة أبعاد واحدة لكل حالات التعاكس:</strong> مع التعريفين ${tex('d_{1}=CA', 'd one equals C A')} و${tex('d_{2}=CB', 'd two equals C B')}: إذا ${tex('F_{2}>F_{1}', 'F two greater than F one')} فـ${tex('d=d_{1}-d_{2}', 'd equals d one minus d two')}; وإذا ${tex('F_{1}>F_{2}', 'F one greater than F two')} فـ${tex('d=d_{2}-d_{1}', 'd equals d two minus d one')}.</li>
        <li><strong>وضع ${tex('C', 'C')} بين القوتين دائماً:</strong> تكون بينهما في الجهة الواحدة، وخارج AB في التعاكس من جهة القوة الأكبر.</li>
        <li><strong>«البعد الأكبر للقوة الأكبر»:</strong> العكس صحيح؛ القوة الأكبر تقابلها مسافة أصغر عن حامل المحصلة، وفق تساوي الجداءين.</li>
        <li><strong>خلط التوازي بالاتزان:</strong> التوازي وصف للحوامل، والاتزان شرط تجربة تعيين الموضع.</li>
        <li><strong>استخدام قاعدة فيثاغورث:</strong> ${tex('\\sqrt{3^{2}+4^{2}}=5', 'square root of 3 squared plus 4 squared equals 5')} لقوتين متعامدتين من الدرس الأول؛ أما القوتان المتوازيتان بجهة واحدة فمحصلتهما ${tex('3+4=7\\,\\mathrm{N}', 'three plus four equals 7 newtons')} (سؤال ص 70، الفقرة 3).</li>
        <li><strong>الخلط بين ${V_F3} و${V_F}:</strong> F₃ قراءة الربيعة في التجربة؛ ويكون سهمها عكس سهم المحصلة عند الاتزان.</li>
        <li><strong>الخلط بين الجداء والتناسب:</strong> ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')} تعيد ترتيبها إلى ${tex('\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}', 'F one over d two equals F two over d one')}؛ إنها علاقة واحدة.</li>
        <li><strong>إضافة وزن لساق مهملة الكتلة:</strong> لا تضف قوة لم يطلبها النموذج.</li>
        <li><strong>اعتبار المحصلة على حامل إحدى القوتين تلقائياً:</strong> حاملها يوازي الحاملين، وموقعه يحدَّد من العلاقة الهندسية.</li>
        <li><strong>استنتاج شدّين متساويين من صورة الأرجوحة:</strong> صور ص 63 لا تعطي قيماً عددية ولا تقول إن الشدين متساويان.</li>
      </ol>`)}

${section('l2-nb-special', '١٢. حالات خاصة واستثناءات وحدود المصدر', `
      <ul class="student-notebook-list">
        <li><strong>شدتان متساويتان بجهة واحدة:</strong> تتساوى d₁ وd₂، فتقع C في منتصف AB؛ جواب استنتاجي لسؤال «أفكر» في ص 66، لا جواب مطبوع تحته.</li>
        <li><strong>ترتيب الشدتين في التعاكس:</strong> ملخص ص 67 و69 يذكر ${tex('F_{2}>F_{1}', 'F two greater than F one')}. مسألة ص 70 الثانية ترتّب القيم بالعكس (${tex('F_{1}>F_{2}', 'F one greater than F two')})، ولذلك يجب عكس ترتيب طرح المسافات كما هو موضح في القسمين 6 و8.</li>
        <li><strong>السؤال عن عدة قوى:</strong> نصّه في ص 64 هو «هل يمكن إيجاد محصلة عدة قوى متوازية؟ وكيف يتم ذلك؟». الصفحات 63–70 لا تجيب عنه بقانون عام؛ يظل خارج نطاق هذا المرجع.</li>
        <li><strong>غموض الطلب الأول في مسألة ص 70 الثانية:</strong> الكلمة بعد «احسب شدة» غير محسومة بصرياً؛ تبدو في التكبير كأنها «وصلة»، لكن لا تُثبت هذه القراءة ولا تُنسب «محصلة» إلى النص. حساب 60 N هنا استنتاج من قانون ص 67 ومن الطلبين 2 و3 اللذين يذكران حامل/عناصر المحصلة صراحة.</li>
        <li><strong>مقادير المسائل كما في الكتاب:</strong> 20 N و30 N مع AB = 0.5 m؛ 200 N و300 N مع AB = 60 cm؛ 40 N و10 N وd₁ = 30 cm؛ و80 N و20 N مع d = 40 cm.</li>
        <li><strong>حالة تساوي قوتين متعاكستين:</strong> لا يوردها استنتاج الكتاب، الذي يكتب حالة F₂ الأكبر. لا نعمّم صيغة الطرح الواردة على حالة لم يغطّها الملخص.</li>
      </ul>`)}

${section('l2-nb-answers', '١٣. أسئلة «أختبر نفسي» ص 70 وإجاباتها', `
      ${sourceBlock(70, `
        <p><strong>السؤال الأول — اختر الإجابة الصحيحة لكل مما يأتي:</strong></p>
        <div class="student-notebook-mcq">
          <p><strong>1.</strong> محصلة قوتين متوازيتين وبجهة واحدة تحسب بالعلاقة:</p>
          <ol class="student-notebook-options" type="a">
            <li>${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')}</li>
            <li>${tex('F=F_{1}-F_{2}', 'F equals F one minus F two')}</li>
            <li>${tex('F=F_{1}\\times F_{2}', 'F equals F one times F two')}</li>
            <li>${tex('F=F_{1}\\div F_{2}', 'F equals F one divided by F two')}</li>
          </ol>
          <p><strong>2.</strong> محصلة قوتين متوازيتين وبجهتين متعاكستين (حيث F₂ أكبر من F₁) تحسب بالعلاقة:</p>
          <ol class="student-notebook-options" type="a">
            <li>${tex('F=F_{1}+F_{2}', 'sum')}</li>
            <li>${tex('F=F_{1}-F_{2}', 'F one minus F two')}</li>
            <li>${tex('F=F_{2}-F_{1}', 'F two minus F one')}</li>
            <li>${tex('F=F_{1}\\div F_{2}', 'division')}</li>
          </ol>
          <p><strong>3.</strong> F₁ وF₂ قوتان شاقوليتان وبجهة واحدة، شدتاهما 3 N و4 N؛ فإن شدة محصلتهما F تساوي:</p>
          <ol class="student-notebook-options" type="a">
            <li>1 N</li><li>5 N</li><li>7 N</li><li>12 N</li>
          </ol>
          <p><strong>4.</strong> F₁ وF₂ قوتان شاقوليتان وبجهة واحدة، بُعدا حامليهما عن حامل المحصلة d₁ وd₂ على الترتيب؛ فالبُعد بين حامليهما d يُعطى بالعلاقة:</p>
          <ol class="student-notebook-options" type="a">
            <li>${tex('d=d_{1}+d_{2}', 'd equals d one plus d two')}</li>
            <li>${tex('d=d_{1}-d_{2}', 'd equals d one minus d two')}</li>
            <li>${tex('d=d_{1}\\times d_{2}', 'product')}</li>
            <li>${tex('d=d_{1}\\div d_{2}', 'quotient')}</li>
          </ol>
        </div>`)}
      ${inferenceBlock('مفتاح الإجابة — استنتاج تعليمي، لا نصّ الخيارات الصحيح وحده', `<table class="l2-compare-table">
        <thead><tr><th>الفقرة</th><th>الاختيار</th><th>التعليل</th></tr></thead>
        <tbody>
          <tr><th>1</th><td>a</td><td>جمع شدتي القوتين في الجهة الواحدة.</td></tr>
          <tr><th>2</th><td>c</td><td>عندما F₂ &gt; F₁، تساوي الشدة F₂ − F₁.</td></tr>
          <tr><th>3</th><td>c، 7 N</td><td>${tex('3+4=7', '3 plus 4 equals 7')}؛ لا قاعدة فيثاغورث لقوتين متوازيتين.</td></tr>
          <tr><th>4</th><td>a</td><td>${tex('d=d_{1}+d_{2}', 'd equals d one plus d two')} في الجهة الواحدة.</td></tr>
        </tbody>
      </table>
      <p><strong>المسائل العددية:</strong> حلّا المسألتين ومطالبهما الثلاثة، بما فيها عناصر المحصلة والرسم، معروضان في المثالين 3 و4 من القسم السابق. جواب الشدة 60 N للمسألة الثانية مستنتج من القانون؛ لفظ الطلب الأول يظل غير محسوم كما وُثّق هناك.</p>`)}`)}

${section('l2-nb-plan', '١٤. خريطة القرار وقائمة تحقق قبل التسليم', `
      ${platformBlock('خريطة الحل من المنصة', `<ol class="student-notebook-list">
        <li>تأكد أولاً أن الحوامل مستقيمات متوازية.</li>
        <li>ميّز الجهة الواحدة من الجهتين المتعاكستين.</li>
        <li>في الجهة الواحدة اجمع الشدتين؛ وفي التعاكس اطرح الأصغر من الأكبر واتجه جهة القوة الأكبر.</li>
        <li>ثبّت التعريفات: ${tex('d_{1}=CA', 'd one equals C A')}، ${tex('d_{2}=CB', 'd two equals C B')}، ${tex('d=AB', 'd equals A B')}.</li>
        <li>في التعاكس لا تخمّن ترتيب الطرح: إذا ${tex('F_{2}>F_{1}', 'F two greater than F one')} فاكتب ${tex('d=d_{1}-d_{2}', 'd equals d one minus d two')}; وإذا ${tex('F_{1}>F_{2}', 'F one greater than F two')} فاكتب ${tex('d=d_{2}-d_{1}', 'd equals d two minus d one')}.</li>
        <li>استخدم ${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')} لتعيين موضع C، ثم افحص أنه بين النقطتين أو خارج AB من جهة الأكبر كما تقتضي الحالة.</li>
      </ol>`)}
      <p><strong>قبل كتابة الجواب:</strong></p>
      <ul class="student-notebook-list">
        <li>اكتب القانون، والتعويض، والنتيجة، والوحدة.</li>
        <li>وحّد الوحدات قبل الحساب (${tex('\\mathrm{cm}', 'centimetre')} مع ${tex('\\mathrm{cm}', 'centimetre')}، أو ${tex('\\mathrm{m}', 'metre')} مع ${tex('\\mathrm{m}', 'metre')}).</li>
        <li>اكتب العناصر الأربعة: الحامل، والجهة، والشدة، ونقطة التأثير.</li>
        <li>إذا رسمت، بيّن A وB وC والأسهم والمسافات، وسمِّ الرسم إعادة بناء إذا لم يكن صورة الكتاب الأصلية.</li>
        <li>افصل نص الكتاب عن الإجابة المستنتجة وعن أي إثراء من المنصة؛ ولا تحسم عبارة المصدر غير الواضحة.</li>
      </ul>`)}
  </div>
</article>`;
