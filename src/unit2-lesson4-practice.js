/* Interactive practice layer for Unit 2 Lesson 4 (book pp107–120).
 *
 * One card per task the book actually asks, in reading order:
 *   p107  intro questions          p108  series-resistance observations
 *   p109  the five U/I ratios      p110  slope + worked example
 *   p111  length / area / material p112  resistivity example
 *   p113  «أفكر» + «أتساءل» + the series recording lab
 *   p114  the parallel recording lab
 *   p115  derivation + the 12 V example
 *   p116  colour-code training + the unresolved printed figure
 *   p117  LED / variable resistor  p118  consolidation
 *   p119  self-check Q1–Q2         p120  Q3–Q5
 *
 * Enforced rules:
 *   - no answer, hint or solution ships in the initial markup: they are loaded
 *     lazily from unit2-lesson4-answers.js on the first explicit action;
 *   - a wrong attempt never reveals the key; it gets a scientific hint;
 *   - the model solution unlocks only after a checked attempt;
 *   - editing any input re-arms the card;
 *   - the two labs read from a labelled ideal model, because the book prints no
 *     numeric readings for those experiments.
 */
import { formula } from './math.js';
import { formatNumber, network, numericMatches, readingMatches } from './unit2-lesson4-physics.js';

const PLATFORM_TAG = '<span class="r4p-tag">نشاط تفاعلي من المنصة · مبني على مطلوب الكتاب</span>';
const MODEL_TAG = '<span class="r4p-tag r4p-tag-model">نموذج رقمي · قراءات مثالية للتدريب</span>';
const HINT_TAG = '<span class="r4p-tag">تلميح من المنصة</span>';
const SOLUTION_TAG = '<span class="r4p-tag">حل نموذجي · يُعرض بعد المحاولة فقط</span>';

const esc = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const num = (value) => formatNumber(value, 3);

const actionBar = () => `<div class="r4p-actions">
  <button class="r4-action-button" type="button" data-r4p-action="check">تحقّق من الإجابة</button>
  <button class="r4-quiet-button" type="button" data-r4p-action="hint">تلميح</button>
  <button class="r4-quiet-button" type="button" data-r4p-action="solution">الحل النموذجي بعد المحاولة</button>
  <button class="r4-quiet-button" type="button" data-r4p-action="reset">إعادة المحاولة</button>
</div>
<output class="r4p-score" data-r4p-score aria-live="polite"></output>
<output class="r4p-feedback" data-r4p-feedback role="status" aria-live="polite"></output>
<div class="r4p-hint" data-r4p-hint hidden></div>
<div class="r4p-solution" data-r4p-solution hidden></div>`;

const shell = (id, page, title, lead, body, tag = PLATFORM_TAG) => `<section class="r4-interactive r4p-activity" data-u2l4-practice="${id}" aria-label="${esc(title)}">
  <header class="r4p-head">${tag}<p class="r4p-source">موضعها في الكتاب: صفحة <bdi dir="ltr">${page}</bdi></p>
    <h3>${title}</h3><p>${lead}</p></header>
  <form data-r4p-form novalidate>${body}${actionBar()}</form>
</section>`;

const itemShell = (id, prompt, inner, hintLabel = '') => `<fieldset class="r4p-item" data-r4p-item="${id}">
  <legend class="r4p-prompt">${prompt}${hintLabel ? `<small class="r4p-item-note">${hintLabel}</small>` : ''}</legend>
  ${inner}
  <output class="r4p-item-feedback" data-r4p-item-feedback role="status" aria-live="polite"></output>
</fieldset>`;

const quizOptions = (activityId, id, options, letters = null) => `<div class="r4p-options">${options.map(([value, copy], index) => `<label class="r4p-choice">
  <input type="radio" name="r4p-${activityId}-${id}" value="${value}" />
  <span class="r4p-choice-body">${letters ? `<bdi class="r4p-letter" dir="ltr">${letters[index]}</bdi>` : ''}<span>${copy}</span></span>
</label>`).join('')}</div>`;

const numericItem = (activityId, id, prompt, unit) => itemShell(id, prompt, `<div class="r4p-numeric-row">
  <input class="r4p-numeric" type="text" inputmode="decimal" autocomplete="off" id="r4p-${activityId}-${id}" data-r4p-numeric="${id}" aria-label="${esc(prompt)}" />
  <span class="r4p-unit" dir="ltr">${unit}</span></div>`);

const matchItem = (id, prompt, options) => itemShell(id, prompt, `<label class="r4p-match-row">
  <span class="r4p-match-label">الخيار المناسب</span>
  <select data-r4p-match="${id}"><option value="">— اختر —</option>${options.map(([value, copy]) => `<option value="${value}">${copy}</option>`).join('')}</select>
</label>`);

const openItem = (activityId, id, prompt) => itemShell(id, prompt, `<label class="r4p-open-label" for="r4p-${activityId}-${id}">إجابتي</label>
  <textarea class="r4p-open" id="r4p-${activityId}-${id}" data-r4p-open="${id}" rows="4" placeholder="اكتب تفسيرك بأسلوبك…"></textarea>
  <p class="r4p-open-note">تُقارن إجابتك بالحل النموذجي بعد تسجيل محاولتك؛ لا يوجد تصحيح آلي للنص الحر.</p>`);

/* ------------------------------------------------------------------------- */
/* p107–p112                                                                  */
/* ------------------------------------------------------------------------- */

function p107Intro() {
  return shell('p107-intro', 107, 'لماذا تسخن هذه الأجهزة؟',
    'ابدأ من الملاحظة اليومية: ما المشترك بين السخان والمدفأة والمكواة؟ ثم اختبر فكرتك.',
    `<div class="r4p-items">
      ${itemShell('p107-common', 'ما العنصر المشترك في السخان والمدفأة والمكواة الذي يحوّل الطاقة الكهربائية إلى طاقة حرارية؟', quizOptions('p107-intro', 'p107-common', [
        ['resistive-element', 'ناقل مقاوم يمرّ فيه التيار الكهربائي.'],
        ['motor', 'محرك يدور بفعل التيار.'],
        ['led', 'ثنائي ضوئي يصدر ضوءاً.'],
        ['capacitor', 'مكثف يخزّن الشحنة.'],
      ]))}
      ${itemShell('p107-heat-set', 'أي مجموعة من الأجهزة التالية كلّها تحوّل الطاقة الكهربائية أساساً إلى حرارة؟', quizOptions('p107-intro', 'p107-heat-set', [
        ['heat-set', 'فرن كهربائي، محمصة خبز، مجفف شعر.'],
        ['motion-set', 'مروحة، خلاط، مكبس صوت.'],
        ['light-set', 'مصباح LED، شاشة، هاتف.'],
      ]), 'سؤال تدريبي من المنصة')}
    </div>`);
}

function p108Observe() {
  return shell('p108-observe', 108, 'ماذا يحدث عند إضافة مقاومة؟',
    'ركّب في ذهنك دارة ص108: خلية ومصباح وأمبيرمتر وقاطعة. أضف مقاومة على التسلسل، ثم أجب.',
    `<div class="r4p-items">
      ${itemShell('p108-2a', 'بعد إضافة مقاومة مناسبة على التسلسل عند ثبات الخلية، تصبح قراءة الأمبيرمتر…', quizOptions('p108-observe', 'p108-2a', [
        ['lower', 'أصغر من قراءتها قبل الإضافة.'],
        ['higher', 'أكبر من قراءتها قبل الإضافة.'],
        ['same', 'لا تتغيّر أبداً.'],
      ]))}
      ${itemShell('p108-2b', 'بعد إغلاق القاطعة، قرّبتَ يدك من المصباح دون لمسه. ماذا تشعر؟', quizOptions('p108-observe', 'p108-2b', [
        ['heat', 'بحرارة تتصاعد من المصباح.'],
        ['cold', 'ببرودة واضحة.'],
        ['none', 'لا شيء مطلقاً.'],
      ]))}
      ${itemShell('p108-2c', 'ما التفسير العلمي لارتفاع حرارة الناقل عند مرور التيار فيه؟', quizOptions('p108-observe', 'p108-2c', [
        ['collisions', 'تصطدم الإلكترونات الحرة بذرات الناقل، فيتحوّل جزء من طاقتها الحركية إلى طاقة حرارية.'],
        ['consumed', 'تُستهلك الإلكترونات داخل المقاومة وتتحوّل كلها إلى حرارة.'],
        ['blocked', 'توقف المقاومة التيار تماماً فيرتفع ضغط الشحنات.'],
      ]))}
    </div>`);
}

function p109Table() {
  return shell('p109-table', 109, 'أكمل نسب الجدول: كم تساوي U/I؟',
    'القيم المطبوعة في جدول ص109 خمسة أزواج. احسب النسبة في كل عمود ثم تحقّق. الوحدة أوم.',
    `<p class="r4p-lead-note">الجدول الأصلي: U = (2، 4، 6، 8، 12) V و I = (0.5، 1، 1.5، 2، 3) A. لا تُعرض نتيجة النسبة قبل محاولتك.</p>
    <div class="r4p-items r4p-items-two">
      ${numericItem('p109-table', 'p109-3a', 'العمود 1: U = 2 V، I = 0.5 A', 'Ω')}
      ${numericItem('p109-table', 'p109-3b', 'العمود 2: U = 4 V، I = 1 A', 'Ω')}
      ${numericItem('p109-table', 'p109-3c', 'العمود 3: U = 6 V، I = 1.5 A', 'Ω')}
      ${numericItem('p109-table', 'p109-3d', 'العمود 4: U = 8 V، I = 2 A', 'Ω')}
      ${numericItem('p109-table', 'p109-3e', 'العمود 5: U = 12 V، I = 3 A', 'Ω')}
    </div>`);
}

function p110Slope() {
  return shell('p110-slope', 110, 'احسب ميل الخط البياني',
    'من الرسم: النقطتان (1 A، 4 V) و(4 A، 16 V) على الخط نفسه. أحسب الميل وحدّد ما يمثّله.',
    numericItem('p110-slope', 'p110-5', 'ميل الخط: ΔU/ΔI', 'Ω'));
}

function p110Example() {
  return shell('p110-example', 110, 'تطبيق الكتاب: 6 V و3 A',
    'فرق كمون 6 V بين طرفي ناقل، ويمرّ فيه تيار شدته 3 A. احسب المقاومة.',
    numericItem('p110-example', 'p110-example', 'المقاومة الكهربائية R', 'Ω'));
}

function p111Factors() {
  return shell('p111-factors', 111, 'ما علاقة المقاومة بالطول والمقطع والمادة؟',
    'هذه ملاحظات تجربة ص111. اختر النتيجة الصحيحة لكل مقارنة مع تثبيت العاملين الآخرين.',
    `<div class="r4p-items">
      ${itemShell('p111-3', 'سلكان من النوع نفسه والمقطع نفسه، وطول الثاني ضعف طول الأول. مقاومة السلك الثاني…', quizOptions('p111-factors', 'p111-3', [
        ['double', 'تساوي ضعف مقاومة الأول.'],
        ['half', 'تساوي نصف مقاومة الأول.'],
        ['same', 'تساوي مقاومة الأول نفسها.'],
      ]))}
      ${itemShell('p111-4', 'سلكان من النوع نفسه والطول نفسه، ومساحة مقطع الثاني ضعف مساحة الأول. مقاومة السلك الثاني…', quizOptions('p111-factors', 'p111-4', [
        ['half', 'تساوي نصف مقاومة الأول.'],
        ['double', 'تساوي ضعف مقاومة الأول.'],
        ['same', 'تساوي مقاومة الأول نفسها.'],
      ]))}
      ${itemShell('p111-5', 'سلكان بالطول والمقطع نفسيهما لكن من مادتين مختلفتين. ماذا تستنتج؟', quizOptions('p111-factors', 'p111-5', [
        ['material', 'تختلف مقاومتهما باختلاف نوع المادة، ولا نحدّد أيّهما أكبر دون معرفة المقاومتين النوعيتين.'],
        ['same', 'تكون مقاومتهما متساوية دائماً لأن الطول والمقطع متساويان.'],
        ['longer', 'يكون السلك الأثقل وزناً هو الأكبر مقاومة دائماً.'],
      ]))}
    </div>`);
}

function p112Example() {
  return shell('p112-example', 112, 'حساب المقاومة النوعية',
    'ناقل أسطواني: S = 30 cm²، R = 1000 Ω، ℓ = 3 m. حوّل المساحة أولاً، ثم اعزل ρ.',
    numericItem('p112-example', 'p112-example', 'المقاومة النوعية ρ', 'Ω·m'));
}

/* ------------------------------------------------------------------------- */
/* p113–p115                                                                  */
/* ------------------------------------------------------------------------- */

function p113Think() {
  return shell('p113-think', 113, 'أفكّر: كيف نصل المقاومات؟',
    'سؤال الصفحة 113 ممتداً إلى مقارنة سريعة بين الطريقتين.',
    `<div class="r4p-items">
      ${itemShell('p113-think-1', 'كيف يمكن وصل المقاومتين في الدارة مع المولد؟', quizOptions('p113-think', 'p113-think-1', [
        ['both', 'إما على التسلسل في مسار واحد، أو على التفرع بين العقدتين نفسيهما.'],
        ['series-only', 'على التسلسل فقط، ولا توجد طريقة أخرى.'],
        ['parallel-only', 'على التفرع فقط، ولا توجد طريقة أخرى.'],
      ]))}
      ${itemShell('p113-think-2', 'عند وصل مقاومتين على التسلسل، فإن المقاومة المكافئة…', quizOptions('p113-think', 'p113-think-2', [
        ['increase', 'تزداد وتساوي مجموع المقاومتين.'],
        ['decrease', 'تنقص وتصبح أصغر من كل مقاومة.'],
        ['same', 'تبقى مساوية لإحداهما.'],
      ]))}
    </div>`);
}

function p113Wonder() {
  return shell('p113-wonder', 113, 'أتساءل: قيمة مقاومة غير متوفرة',
    'كيف نستبدل عدة مقاومات بمقاومة وحيدة؟ اكتب فكرتك أولاً، ثم قارنها بالحل النموذجي.',
    openItem('p113-wonder', 'p113-wonder', 'اقترح كيف نحصل على مقاومة مكافئة لقيمة غير متوفرة، وما الذي يجب أن يبقى متساوياً بعد الاستبدال.'));
}

function p115Derive() {
  return shell('p115-derive', 115, 'أستنتج: اشتقاق مكافئة التفرع',
    'ابدأ من جمع التيارات واستخدم قانون أوم لكل فرع. اكتب خطوات الاشتقاق ثم قارن.',
    openItem('p115-derive', 'p115-derive', 'استنتج علاقة 1/Req = 1/R₁ + 1/R₂ انطلاقاً من I = I₁ + I₂.'));
}

function p115Example() {
  return shell('p115-example', 115, 'تطبيق الكتاب: 12 V ومقاومتان 3 Ω',
    'القيم نفسها في التسلسل والتفرع. أدخل المكافئة والتيار لكل حالة؛ لا تجمع المقاومات في التفرع مباشرة.',
    `<div class="r4p-items r4p-items-two">
      ${numericItem('p115-example', 'p115-example1-req', 'التسلسل: المقاومة المكافئة', 'Ω')}
      ${numericItem('p115-example', 'p115-example1-i', 'التسلسل: شدة التيار', 'A')}
      ${numericItem('p115-example', 'p115-example2-req', 'التفرع: المقاومة المكافئة', 'Ω')}
      ${numericItem('p115-example', 'p115-example2-i', 'التفرع: شدة التيار الكلي', 'A')}
    </div>`);
}

/* ------------------------------------------------------------------------- */
/* p116–p118                                                                  */
/* ------------------------------------------------------------------------- */

function p116Code() {
  return shell('p116-code', 116, 'تدرّب على الترميز اللوني',
    'اختر الحلقات الثلاث A وB وC، ثم احسب القيمة. هذه تدريبات مستقلة على نموذج الأربع حلقات.',
    `<div class="r4p-items r4p-items-two">
      ${numericItem('p116-code', 'p116-code-1', 'أصفر، بنفسجي، أحمر', 'Ω')}
      ${numericItem('p116-code', 'p116-code-2', 'أحمر، أحمر، بني', 'Ω')}
      ${numericItem('p116-code', 'p116-code-3', 'بني، أسود، برتقالي', 'Ω')}
    </div>
    <p class="r4p-lead-note">رموز الأرقام: أسود 0، بني 1، أحمر 2، برتقالي 3، أصفر 4، أخضر 5، أزرق 6، بنفسجي 7، رمادي 8، أبيض 9.</p>`);
}

function p116Figure() {
  return shell('p116-figure', 116, 'الشكل الأصلي: هل نستطيع الجزم بالقيمة؟',
    'انظر إلى الشكل وتذكّر أن النص يشرح أربع حلقات. اكتب موقفك العلمي من القراءة، ثم قارنه.',
    openItem('p116-figure', 'p116-2', 'ما القيمة التي يمكن نسبتها إلى المقاومة المرسومة؟ ولماذا لا نجزم؟'));
}

function p117Concept() {
  return shell('p117-concept', 117, 'الليد والمقاومة المتغيرة',
    'ثلاثة أسئلة تثبّت الفرق بين آلية إصدار الضوء، وشروط استخدام الليد، وعمل الزلاقة.',
    `<div class="r4p-items">
      ${itemShell('p117-led-mech', 'كيف يصدر الليد الضوء فعلياً؟', quizOptions('p117-concept', 'p117-led-mech', [
        ['recombination', 'بإعادة اتحاد حوامل الشحنة وانتقالات إلكترونية بين حزم الطاقة، لا بتوهّج فتيل.'],
        ['heating', 'بتسخين فتيل حتى يبيضّ من الحرارة.'],
        ['burning', 'باحتراق مادة نصف ناقلة داخل الغلاف.'],
      ]))}
      ${itemShell('p117-led-polarity', 'أي وصف يناسب توصيل الليد؟', quizOptions('p117-concept', 'p117-led-polarity', [
        ['directional', 'قطبي وغير خطي؛ يحتاج قطباً صحيحاً وتحديداً للتيار بمقاومة أو دارة قيادة.'],
        ['either-way', 'يعمل بأي اتجاه وبأي تيار مباشرة من الشبكة.'],
        ['ohmic', 'مقاومة خطية يمكن تطبيق I = U/R عليها بقيمة ثابتة.'],
      ]))}
      ${itemShell('p117-rheostat', 'كيف تغيّر المقاومة المتغيرة شدة التيار؟', quizOptions('p117-concept', 'p117-rheostat', [
        ['length', 'تحريك الزلاقة يغيّر طول الجزء المستعمل من الناقل، فتتغيّر المقاومة والتيار.'],
        ['voltage', 'تولّد توتراً جديداً من تلقاء نفسها.'],
        ['cooling', 'تبرّد الناقل فتنقص مقاومته دائماً.'],
      ]))}
    </div>`);
}

function p118Summary() {
  return shell('p118-summary', 118, 'تحقّق ختامي من قوانين الدرس',
    'خمسة أسئلة من المنصة لتثبيت خلاصة «تعلّمت». ليست أسئلة مطبوعة في ص118.',
    `<div class="r4p-items">
      ${itemShell('p118-q1', 'مقاومتان 2 Ω و4 Ω على التسلسل مع مولد 12 V. شدة التيار:', quizOptions('p118-summary', 'p118-q1', [
        ['2', '2 A'], ['6', '6 A'], ['0.5', '0.5 A'],
      ]))}
      ${itemShell('p118-q2', 'وحدة قياس المقاومة النوعية ρ:', quizOptions('p118-summary', 'p118-q2', [
        ['ohm-metre', 'Ω·m'], ['ohm', 'Ω فقط'], ['ohm-per-metre', 'Ω/m'],
      ]))}
      ${itemShell('p118-q3', 'مقاومتان 6 Ω و3 Ω على التفرع. المقاومة المكافئة:', quizOptions('p118-summary', 'p118-q3', [
        ['2', '2 Ω'], ['9', '9 Ω'], ['4.5', '4.5 Ω'],
      ]))}
      ${itemShell('p118-q4', 'سلك معدني ثُبّت مقطعه ومادته وضاعفنا طوله. مقاومته:', quizOptions('p118-summary', 'p118-q4', [
        ['double', 'تتضاعف'], ['half', 'تنقص إلى النصف'], ['same', 'تبقى كما هي'],
      ]))}
      ${itemShell('p118-q5', 'أي تفسير لآلية إضاءة الليد هو الأدق علمياً؟', quizOptions('p118-summary', 'p118-q5', [
        ['recombination', 'إعادة اتحاد حوامل الشحنة في المادة نصف الناقلة.'],
        ['filament', 'توهّج فتيل تنغستن.'],
        ['gas', 'تفريغ غازي كالفلورسنت.'],
      ]))}
    </div>`);
}

/* ------------------------------------------------------------------------- */
/* p119–p120 self-check                                                       */
/* ------------------------------------------------------------------------- */

function p119Mcq() {
  const letters = ['a', 'b', 'c', 'd'];
  const options = (activityId, id, copies) => quizOptions(activityId, id, copies.map((copy, index) => [letters[index], copy]), letters);
  return shell('p119-mcq', 119, 'اختبر نفسي · السؤال الأول',
    'أسئلة الكتاب الثلاثة كما وردت. اختر الإجابة ثم تحقّق؛ التلميح لا يكشف الخيار الصحيح.',
    `<div class="r4p-items">
      ${itemShell('q1a', '1 · مولد 12 V ومقاومتان متماثلتان 2 Ω على التفرع. شدة التيار الكهربائي في الدارة:', options('p119-mcq', 'q1a', ['8 A', '12 A', '9 A', '6 A']))}
      ${itemShell('q1b', '2 · وحدة قياس المقاومة الكهربائية النوعية:', options('p119-mcq', 'q1b', ['Ω', 'Ω·m⁻¹', 'm·Ω⁻¹', 'Ω·m']))}
      ${itemShell('q1c', '3 · ست مقاومات متماثلة 6 Ω على التفرع. المقاومة المكافئة:', options('p119-mcq', 'q1c', ['36 Ω', '1 Ω', '3 Ω', '8 Ω']))}
    </div>`);
}

function p119GraphRead() {
  return shell('p119-graph-read', 119, 'اختبر نفسي · السؤال الثاني (1)',
    'المخطط في الصفحة يعرض U بدلالة I. ماذا يمثل؟',
    itemShell('q2a', 'ماذا يمثل هذا المخطط؟', quizOptions('p119-graph-read', 'q2a', [
      ['ohm-law', 'تغيّر فرق الكمون بين طرفي ناقل أومي بدلالة شدة التيار المار فيه.'],
      ['power', 'تغيّر القدرة الكهربائية بدلالة الزمن.'],
      ['resistance-temp', 'تغيّر المقاومة بدلالة درجة الحرارة.'],
    ])));
}

function p119GraphValues() {
  return shell('p119-graph-values', 119, 'اختبر نفسي · السؤال الثاني (2 و3)',
    'استخدم النقاط المطبوعة: (2، 10)، (3، 15)، (5، 25)، (7، 35)، (9، 45).',
    `<div class="r4p-items r4p-items-two">
      ${numericItem('p119-graph-values', 'q2b', 'عند I = 6 A، قيمة فرق الكمون U', 'V')}
      ${numericItem('p119-graph-values', 'q2c', 'مقدار المقاومة الكهربائية من المخطط', 'Ω')}
    </div>`);
}

function p120Match() {
  const options = [
    ['area', 'مساحة مقطع سلك الناقل'],
    ['series', 'وصل المقاومات على التسلسل'],
    ['ohm', 'الأوم'],
    ['resistance', 'المقاومة الكهربائية'],
    ['length', 'طول سلك الناقل'],
  ];
  return shell('p120-match', 120, 'اختبر نفسي · السؤال الثالث (المطابقة)',
    'ضع الخيار المناسب لكل عبارة. أحد الخيارات لا يُستخدم؛ لا تكشف الإجابة قبل التحقق.',
    `<div class="r4p-items">
      ${matchItem('q3a', '1 · نسبة التوتر الكهربائي إلى شدة التيار الكهربائي هي …', options)}
      ${matchItem('q3b', '2 · مقاومة ناقل طُبّق بين طرفيه توتر 1 V فمرّ فيه تيار 1 A هي …', options)}
      ${matchItem('q3c', '3 · تكون قيمة المقاومة المكافئة أكبر عند …', options)}
      ${matchItem('q3d', '4 · تنقص مقاومة ناقل أسطواني بزيادة …', options)}
    </div>`);
}

function p120Explain() {
  return shell('p120-explain', 120, 'اختبر نفسي · السؤال الرابع (تفسير علمي)',
    'اكتب تفسيرك لكل عبارة في المساحة المخصصة، ثم سجّل المحاولة لتظهر الإجابات النموذجية للمقارنة.',
    `<div class="r4p-items">
      ${openItem('p120-explain', 'q4a', '1 · المقاومة تعيق مرور التيار، ومع ذلك لا تخلو دارة كهربائية من مقاومة. فسّر.')}
      ${openItem('p120-explain', 'q4b', '2 · لماذا يُفضّل استخدام مصباح الليد في الإنارة؟')}
      ${openItem('p120-explain', 'q4c', '3 · لماذا يُفضّل في المنزل وصل المصابيح على التفرع؟')}
    </div>`);
}

function p120Problem1() {
  return shell('p120-problem1', 120, 'اختبر نفسي · المسألة الأولى',
    'R₁ = 100 Ω وR₂ = 200 Ω على التسلسل، وفرق الكمون الكلي 30 V.',
    `<div class="r4p-items r4p-items-two">
      ${numericItem('p120-problem1', 'q5a1', '1 · المقاومة المكافئة', 'Ω')}
      ${numericItem('p120-problem1', 'q5a2', '2 · شدة التيار في الدارة', 'A')}
      ${numericItem('p120-problem1', 'q5a3-u1', '3 · فرق الكمون على R₁', 'V')}
      ${numericItem('p120-problem1', 'q5a3-u2', '3 · فرق الكمون على R₂', 'V')}
    </div>`);
}

function p120Problem2() {
  return shell('p120-problem2', 120, 'اختبر نفسي · المسألة الثانية',
    'أربع مقاومات متماثلة على التفرع مع مولد 40 V، وكل فرع يحمل 2 A.',
    `<div class="r4p-items r4p-items-two">
      ${numericItem('p120-problem2', 'q5b1', '1 · مقاومة كل فرع', 'Ω')}
      ${numericItem('p120-problem2', 'q5b2', '2 · التيار الكلي الذي يعطيه المولد', 'A')}
      ${numericItem('p120-problem2', 'q5b3', '3 · المقاومة المكافئة للدارة الخارجية', 'Ω')}
    </div>`);
}

/* ------------------------------------------------------------------------- */
/* Recording labs (series pp113–114, parallel p114)                           */
/* ------------------------------------------------------------------------- */

const meterFace = (cx, cy, letter, readingId = '') => `<g class="r4p-meter">
  <circle cx="${cx}" cy="${cy}" r="23"/><text class="r4p-meter-letter" x="${cx}" y="${cy + 7}" text-anchor="middle" direction="ltr">${letter}</text>
  ${readingId ? `<text class="r4p-reading" x="${cx}" y="${cy + 44}" text-anchor="middle" direction="ltr" data-lab-reading="${readingId}">—</text>` : ''}</g>`;

const labSwitch = (x, y, openStrokeSuffix = 'l-24 32') => `<g class="r4p-switch">
  <circle class="r4p-contact" cx="${x}" cy="${y}" r="5"/><circle class="r4p-contact" cx="${x}" cy="${y + 48}" r="5"/>
  <path class="r4p-lever" data-lab-lever data-open="l-24 32" data-closed="v48" d="M${x} ${y}${openStrokeSuffix}"/></g>`;

function seriesLab() {
  return shell('p113-lab', 113, 'مختبر التسلسل: سجّل القراءات بنفسك',
    'اختر فرق كمون المولد والمقاومتين، أغلق القاطعة، اقرأ I وU₁ وU₂، ثم سجّلها واستنتج العلاقة.',
    `<div class="r4p-lab">
      <div class="r4p-lab-stage">
        <figure class="r4p-lab-figure">
          <svg class="r4p-svg" viewBox="0 0 640 340" role="img" aria-labelledby="r4p-series-title r4p-series-desc">
            <title id="r4p-series-title">دارة تسلسل رقمية: مولد ومقاومتان وأمبيرمتر وفولتميتر وقاطعة</title>
            <desc id="r4p-series-desc">القاطعة مفتوحة؛ لم تُؤخذ قراءة بعد.</desc>
            <rect class="r4p-circuit-back" x="12" y="10" width="616" height="318" rx="20"/>
            <path class="r4p-wire" d="M80 96H560V120"/>
            <path class="r4p-wire" d="M560 168V272H80V96"/>
            <path class="r4p-battery-long" d="M80 164v60"/><path class="r4p-battery-short" d="M62 176v36"/>
            <text class="r4p-sign" x="52" y="160" text-anchor="end">+</text><text class="r4p-sign" x="88" y="160" text-anchor="start">−</text>
            <rect class="r4p-resistor" x="190" y="80" width="92" height="32" rx="4"/><text class="r4p-part" x="236" y="102" text-anchor="middle" direction="ltr">R₁</text>
            <rect class="r4p-resistor" x="380" y="80" width="92" height="32" rx="4"/><text class="r4p-part" x="426" y="102" text-anchor="middle" direction="ltr">R₂</text>
            ${meterFace(330, 96, 'A', 'i')}
            ${meterFace(330, 210, 'V', 'u')}
            <path class="r4p-wire" d="M236 96V60H424V80"/>
            <path class="r4p-wire" d="M190 96V210H307M353 210H470V96"/>
            <text class="r4p-reading" x="236" y="148" text-anchor="middle" direction="ltr" data-lab-reading="u1">—</text>
            <text class="r4p-reading" x="426" y="148" text-anchor="middle" direction="ltr" data-lab-reading="u2">—</text>
            ${labSwitch(560, 120)}
            <text class="r4p-part" x="580" y="152" text-anchor="start">قاطعة</text>
            <text class="r4p-caption" x="320" y="304" text-anchor="middle">التيار نفسه في المسار الواحد، وV يقيس فرق الكمون الكلي</text>
          </svg>
          <figcaption>${MODEL_TAG} قراءات مثالية للتدريب؛ الكتاب لا يطبع أرقاماً لهذه التجربة.</figcaption>
        </figure>
        <div class="r4p-lab-controls">
          <label class="r4p-field">فرق كمون المولد
            <select data-lab-source>${[6, 12, 18].map((v) => `<option value="${v}"${v === 12 ? ' selected' : ''}>${v} V</option>`).join('')}</select>
          </label>
          <label class="r4p-field">R₁ <output data-lab-r1-value>4</output> Ω
            <input type="range" min="1" max="12" step="1" value="4" data-lab-r1 />
          </label>
          <label class="r4p-field">R₂ <output data-lab-r2-value>8</output> Ω
            <input type="range" min="1" max="12" step="1" value="8" data-lab-r2 />
          </label>
          <div class="r4p-switch-row" role="group" aria-label="حالة القاطعة">
            <button class="r4-action-button" type="button" data-lab-toggle="close" aria-pressed="false">أغلق القاطعة</button>
            <button class="r4-quiet-button" type="button" data-lab-toggle="open" aria-pressed="true">افتح القاطعة</button>
          </div>
          <output class="r4p-live" data-lab-status role="status" aria-live="polite">القاطعة مفتوحة؛ أغلقها لقراءة المقاييس.</output>
        </div>
      </div>
      <h4 class="r4p-subhead">سجّل ما تقرأه في المقاييس</h4>
      <div class="r4p-record-grid">
        <label>شدة التيار I <span class="r4p-unit" dir="ltr">A</span><input data-lab-record="i" inputmode="decimal" autocomplete="off" /></label>
        <label>فرق الكمون على R₁ <span class="r4p-unit" dir="ltr">V</span><input data-lab-record="u1" inputmode="decimal" autocomplete="off" /></label>
        <label>فرق الكمون على R₂ <span class="r4p-unit" dir="ltr">V</span><input data-lab-record="u2" inputmode="decimal" autocomplete="off" /></label>
      </div>
      <fieldset class="r4p-relation"><legend>ما العلاقة التي تحقّقت من قراءاتك بعد الاستبدال بمقاومة واحدة؟</legend>
        <label><input type="radio" name="r4p-series-relation" value="series-sum" /> U = U₁ + U₂، والتيار نفسه في التسلسل.</label>
        <label><input type="radio" name="r4p-series-relation" value="parallel-equal" /> U = U₁ = U₂.</label>
        <label><input type="radio" name="r4p-series-relation" value="current-sum" /> I = I₁ + I₂.</label>
      </fieldset>
      <output class="r4p-relation-result" data-lab-relation role="status" aria-live="polite"></output>
    </div>`, MODEL_TAG);
}

function parallelLab() {
  return shell('p114-lab', 114, 'مختبر التفرع: سجّل التيارات',
    'اختر المولد والمقاومتين، أغلق القاطعة، اقرأ I₁ وI₂ وتيار المولد، ثم سجّلها واستنتج.',
    `<div class="r4p-lab">
      <div class="r4p-lab-stage">
        <figure class="r4p-lab-figure">
          <svg class="r4p-svg" viewBox="0 0 660 370" role="img" aria-labelledby="r4p-parallel-title r4p-parallel-desc">
            <title id="r4p-parallel-title">دارة تفرع رقمية: مقاومتان بين العقدتين مع مولد وقاطعة وأمبيرمترات</title>
            <desc id="r4p-parallel-desc">القاطعة مفتوحة؛ لم تُؤخذ قراءة بعد.</desc>
            <rect class="r4p-circuit-back" x="12" y="10" width="636" height="348" rx="20"/>
            <path class="r4p-wire" d="M190 150V64H500V150"/>
            <path class="r4p-wire" d="M190 150V246H500V150"/>
            <path class="r4p-wire" d="M190 150H96M96 198V300H500V150"/>
            <rect class="r4p-resistor" x="300" y="48" width="92" height="32" rx="4"/><text class="r4p-part" x="346" y="70" text-anchor="middle" direction="ltr">R₁</text>
            <rect class="r4p-resistor" x="300" y="230" width="92" height="32" rx="4"/><text class="r4p-part" x="346" y="252" text-anchor="middle" direction="ltr">R₂</text>
            ${meterFace(250, 64, 'A₁', 'i1')}${meterFace(250, 246, 'A₂', 'i2')}
            ${meterFace(346, 150, 'V', 'u')}
            <path class="r4p-wire" d="M190 150H323M369 150H400"/>
            <path class="r4p-battery-long" d="M96 214v52"/><path class="r4p-battery-short" d="M78 226v28"/>
            <text class="r4p-sign" x="68" y="210" text-anchor="end">+</text><text class="r4p-sign" x="104" y="210" text-anchor="start">−</text>
            ${meterFace(430, 300, 'A', 'i')}
            ${labSwitch(96, 150, 'l-24 32')}
            <circle class="r4p-node" cx="190" cy="150" r="6"/><circle class="r4p-node" cx="500" cy="150" r="6"/>
            <text class="r4p-caption" x="268" y="336" text-anchor="middle">الفرعان بين العقدتين نفسيهما</text>
            <text class="r4p-caption" x="268" y="352" text-anchor="middle">والفولتميتر يقيس الكمون نفسه على الفرعين</text>
          </svg>
          <figcaption>${MODEL_TAG} قراءات مثالية للتدريب؛ الكتاب لا يطبع أرقاماً لهذه التجربة.</figcaption>
        </figure>
        <div class="r4p-lab-controls">
          <label class="r4p-field">فرق كمون المولد
            <select data-lab-source>${[6, 12, 18].map((v) => `<option value="${v}"${v === 12 ? ' selected' : ''}>${v} V</option>`).join('')}</select>
          </label>
          <label class="r4p-field">R₁ <output data-lab-r1-value>6</output> Ω
            <input type="range" min="1" max="12" step="1" value="6" data-lab-r1 />
          </label>
          <label class="r4p-field">R₂ <output data-lab-r2-value>3</output> Ω
            <input type="range" min="1" max="12" step="1" value="3" data-lab-r2 />
          </label>
          <div class="r4p-switch-row" role="group" aria-label="حالة القاطعة">
            <button class="r4-action-button" type="button" data-lab-toggle="close" aria-pressed="false">أغلق القاطعة</button>
            <button class="r4-quiet-button" type="button" data-lab-toggle="open" aria-pressed="true">افتح القاطعة</button>
          </div>
          <output class="r4p-live" data-lab-status role="status" aria-live="polite">القاطعة مفتوحة؛ أغلقها لقراءة المقاييس.</output>
        </div>
      </div>
      <h4 class="r4p-subhead">سجّل ما تقرأه في المقاييس</h4>
      <div class="r4p-record-grid">
        <label>تيار الفرع الأول I₁ <span class="r4p-unit" dir="ltr">A</span><input data-lab-record="i1" inputmode="decimal" autocomplete="off" /></label>
        <label>تيار الفرع الثاني I₂ <span class="r4p-unit" dir="ltr">A</span><input data-lab-record="i2" inputmode="decimal" autocomplete="off" /></label>
        <label>تيار المولد I <span class="r4p-unit" dir="ltr">A</span><input data-lab-record="i" inputmode="decimal" autocomplete="off" /></label>
      </div>
      <fieldset class="r4p-relation"><legend>ما العلاقة التي تحقّقت من قراءاتك؟</legend>
        <label><input type="radio" name="r4p-parallel-relation" value="parallel-equal" /> U = U₁ = U₂ فقط.</label>
        <label><input type="radio" name="r4p-parallel-relation" value="parallel-sum-currents" /> I = I₁ + I₂، مع U = U₁ = U₂.</label>
        <label><input type="radio" name="r4p-parallel-relation" value="series-sum" /> U = U₁ + U₂، والتيار نفسه.</label>
      </fieldset>
      <output class="r4p-relation-result" data-lab-relation role="status" aria-live="polite"></output>
    </div>`, MODEL_TAG);
}

/* ------------------------------------------------------------------------- */
/* Public markup API                                                          */
/* ------------------------------------------------------------------------- */

const BUILDERS = Object.freeze({
  'p107-intro': p107Intro,
  'p108-observe': p108Observe,
  'p109-table': p109Table,
  'p110-slope': p110Slope,
  'p110-example': p110Example,
  'p111-factors': p111Factors,
  'p112-example': p112Example,
  'p113-lab': seriesLab,
  'p113-think': p113Think,
  'p113-wonder': p113Wonder,
  'p114-lab': parallelLab,
  'p115-derive': p115Derive,
  'p115-example': p115Example,
  'p116-code': p116Code,
  'p116-figure': p116Figure,
  'p117-concept': p117Concept,
  'p118-summary': p118Summary,
  'p119-mcq': p119Mcq,
  'p119-graph-read': p119GraphRead,
  'p119-graph-values': p119GraphValues,
  'p120-match': p120Match,
  'p120-explain': p120Explain,
  'p120-problem1': p120Problem1,
  'p120-problem2': p120Problem2,
});

export const UNIT2L4_PRACTICE_IDS = Object.freeze(Object.keys(BUILDERS));

export function unit2l4PracticeMarkup(id) {
  const build = BUILDERS[id];
  if (!build) throw new RangeError(`Unknown Unit 2 Lesson 4 practice activity: ${id}`);
  return build();
}

/* ------------------------------------------------------------------------- */
/* Mounting, grading, hints, solutions, recording labs                        */
/* ------------------------------------------------------------------------- */

const KIND_BY_ID = Object.freeze({
  'p107-intro': 'quiz',
  'p108-observe': 'quiz',
  'p109-table': 'numeric',
  'p110-slope': 'numeric',
  'p110-example': 'numeric',
  'p111-factors': 'quiz',
  'p112-example': 'numeric',
  'p113-lab': 'lab-series',
  'p113-think': 'quiz',
  'p113-wonder': 'open',
  'p114-lab': 'lab-parallel',
  'p115-derive': 'open',
  'p115-example': 'numeric',
  'p116-code': 'numeric',
  'p116-figure': 'open',
  'p117-concept': 'quiz',
  'p118-summary': 'quiz',
  'p119-mcq': 'quiz',
  'p119-graph-read': 'quiz',
  'p119-graph-values': 'numeric',
  'p120-match': 'match',
  'p120-explain': 'open',
  'p120-problem1': 'numeric',
  'p120-problem2': 'numeric',
});

const states = new WeakMap();
const initialLab = () => ({ closed: false, seenClosed: false, seenOpen: false });
const stateFor = (root) => {
  if (!states.has(root)) states.set(root, { attempted: false, request: 0, answers: null, lastWrongHints: [], lab: initialLab() });
  return states.get(root);
};
const out = (root, selector) => root.querySelector(selector);
const setFeedback = (root, text, kind = '') => {
  const node = out(root, '[data-r4p-feedback]');
  if (!node) return;
  node.textContent = text;
  if (kind) node.dataset.kind = kind; else node.removeAttribute('data-kind');
};
const setScore = (root, text) => {
  const node = out(root, '[data-r4p-score]');
  if (node) node.textContent = text;
};
const itemFeedback = (root, id, text, ok) => {
  const host = root.querySelector(`[data-r4p-item="${id}"]`) ?? null;
  if (!host) return;
  const outputNode = host.querySelector('[data-r4p-item-feedback]');
  if (outputNode) {
    outputNode.textContent = text;
    if (text) outputNode.dataset.kind = ok ? 'correct' : 'incorrect';
    else outputNode.removeAttribute('data-kind');
  }
  host.classList.toggle('is-correct', Boolean(ok) && Boolean(text));
  host.classList.toggle('is-incorrect', !ok && Boolean(text));
};

async function withAnswers(root, apply) {
  const state = stateFor(root);
  const request = state.request + 1;
  state.request = request;
  root.setAttribute('aria-busy', 'true');
  try {
    if (!state.answers) state.answers = import('./unit2-lesson4-answers.js').then((module) => module.UNIT2L4_ANSWERS);
    const answers = await state.answers;
    if (request !== state.request) return;
    apply(answers[root.dataset.u2l4Practice]);
  } catch {
    if (request === state.request) setFeedback(root, 'تعذّر تحميل مفاتيح الإجابة الآن؛ أعد المحاولة.', 'error');
  } finally {
    if (request === state.request) root.removeAttribute('aria-busy');
  }
}

function clearResult(root) {
  const state = stateFor(root);
  state.attempted = false;
  state.request += 1;
  setFeedback(root, '');
  setScore(root, '');
  for (const node of root.querySelectorAll('[data-r4p-item-feedback]')) {
    node.textContent = '';
    node.removeAttribute('data-kind');
  }
  for (const item of root.querySelectorAll('.r4p-item')) item.classList.remove('is-correct', 'is-incorrect');
  const relation = out(root, '[data-lab-relation]');
  if (relation) { relation.textContent = ''; relation.removeAttribute('data-kind'); }
  out(root, '[data-r4p-hint]')?.setAttribute('hidden', '');
  const solution = out(root, '[data-r4p-solution]');
  if (solution) { solution.setAttribute('hidden', ''); solution.replaceChildren(); }
}

const reading = (root, item) => {
  const selected = root.querySelector(`input[name="r4p-${root.dataset.u2l4Practice}-${item.id}"]:checked`)?.value ?? null;
  return selected;
};

/**
 * Pure grader shared by the DOM layer and the test suite.
 *
 * `values` maps an item id to what the student submitted (a radio value, a
 * numeric string, a select value or free text). The result carries only whether
 * each item was answered, whether it matched, and the hint for a wrong answer —
 * never the expected value — so a caller cannot leak the key by rendering it.
 * Open items have no automatic key: they only report that an attempt was written.
 */
export function unit2L4Evaluate(kind, spec, values = {}) {
  if (!spec || !Array.isArray(spec.items) || spec.items.length === 0) {
    throw new TypeError('unit2L4Evaluate needs an answer specification with items.');
  }
  const items = spec.items.map((item) => {
    const raw = values[item.id];
    const text = raw === null || raw === undefined ? '' : String(raw).trim();
    if (kind === 'open') {
      return Object.freeze({ id: item.id, answered: text.length > 0, ok: text.length > 0, hint: '' });
    }
    const ok = text.length > 0 && (kind === 'numeric' ? numericMatches(text, item.correct) : text === item.correct);
    return Object.freeze({ id: item.id, answered: text.length > 0, ok, hint: ok ? '' : (item.hint ?? '') });
  });
  const hints = [...new Set(items.filter((item) => !item.ok && item.hint).map((item) => item.hint))];
  return Object.freeze({
    items: Object.freeze(items),
    answered: items.filter((item) => item.answered).length,
    right: items.filter((item) => item.ok).length,
    total: items.length,
    wrongHints: Object.freeze(hints),
  });
}

const FEEDBACK_COPY = Object.freeze({
  quiz: { right: '✓ إجابة صحيحة', wrong: 'تحتاج مراجعة؛ استخدم التلميح' },
  numeric: { right: '✓ قيمة صحيحة', wrong: 'راجع القيمة أو الوحدة', blank: 'أدخل قيمة' },
  match: { right: '✓ مطابقة صحيحة', wrong: 'راجع المطابقة؛ أحد الخيارات زائد' },
});

const submittedValues = (root, kind, spec) => {
  const values = {};
  for (const item of spec.items) {
    if (kind === 'quiz') values[item.id] = reading(root, item);
    else if (kind === 'numeric') values[item.id] = root.querySelector(`[data-r4p-numeric="${item.id}"]`)?.value ?? '';
    else values[item.id] = root.querySelector(`[data-r4p-match="${item.id}"]`)?.value ?? '';
  }
  return values;
};

function gradeWithDom(root, kind, spec) {
  const result = unit2L4Evaluate(kind, spec, submittedValues(root, kind, spec));
  const copy = FEEDBACK_COPY[kind];
  for (const entry of result.items) {
    const message = entry.ok ? copy.right : (kind === 'numeric' && !entry.answered ? copy.blank : copy.wrong);
    itemFeedback(root, entry.id, message, entry.ok);
  }
  return result;
}

function completionCheck(root, spec, kind) {
  if (kind === 'quiz') {
    const missing = spec.items.some((item) => !root.querySelector(`input[name="r4p-${root.dataset.u2l4Practice}-${item.id}"]:checked`));
    return missing ? 'اختر إجابة لكل فقرة قبل التحقق.' : '';
  }
  if (kind === 'numeric') {
    const missing = spec.items.some((item) => !(root.querySelector(`[data-r4p-numeric="${item.id}"]`)?.value ?? '').trim());
    return missing ? 'أدخل قيمة عددية في كل حقل قبل التحقق.' : '';
  }
  if (kind === 'match') {
    const missing = spec.items.some((item) => !(root.querySelector(`[data-r4p-match="${item.id}"]`)?.value ?? ''));
    return missing ? 'اختر خياراً لكل عبارة قبل التحقق.' : '';
  }
  if (kind === 'open') {
    const missing = spec.items.some((item) => !(root.querySelector(`[data-r4p-open="${item.id}"]`)?.value ?? '').trim());
    return missing ? 'اكتب محاولتك في كل حقل قبل تسجيلها.' : '';
  }
  return '';
}

function applyResult(root, result, wrongHints = []) {
  setScore(root, `النتيجة: ${result.right} / ${result.total}`);
  stateFor(root).lastWrongHints = wrongHints;
  if (result.right === result.total) {
    setFeedback(root, '✓ جميع إجاباتك صحيحة. افتح الحل النموذجي لمراجعة التفسير العلمي.', 'correct');
  } else {
    setFeedback(root, result.right === 0
      ? 'لم تُصب في هذه المحاولة. لم تُكشف أي إجابة صحيحة؛ استخدم التلميح ثم أعد المحاولة.'
      : `أصبت ${result.right} من ${result.total}. لم تُكشف الإجابات الصحيحة؛ راجع البنود المعلَّمة ثم أعد المحاولة.`, 'incorrect');
  }
}

/* --- recording labs -------------------------------------------------------- */

const LAB_KINDS = Object.freeze(new Set(['lab-series', 'lab-parallel']));

const labSource = (root) => Number(root.querySelector('[data-lab-source]')?.value ?? Number.NaN);
const labResistance = (root, which) => Number(root.querySelector(`[data-lab-r${which}]`)?.value ?? Number.NaN);

function labModel(root, kind) {
  const u = labSource(root);
  const r1 = labResistance(root, 1);
  const r2 = labResistance(root, 2);
  if (![u, r1, r2].every(Number.isFinite)) return null;
  try {
    return network(u, r1, r2, kind === 'lab-series' ? 'series' : 'parallel');
  } catch {
    return null;
  }
}

function renderLab(root, kind) {
  const state = stateFor(root);
  const closed = state.lab.closed;
  const model = labModel(root, kind);
  for (const button of root.querySelectorAll('[data-lab-toggle]')) {
    button.setAttribute('aria-pressed', String((button.dataset.labToggle === 'close') === closed));
  }
  for (const [selector, text] of [['[data-lab-r1-value]', root.querySelector('[data-lab-r1]')?.value], ['[data-lab-r2-value]', root.querySelector('[data-lab-r2]')?.value]]) {
    const node = out(root, selector);
    if (node) node.textContent = String(text ?? '—');
  }
  const write = (id, text) => {
    const node = root.querySelector(`[data-lab-reading="${id}"]`);
    if (node) node.textContent = text;
  };
  if (!model) return;
  if (kind === 'lab-series') {
    write('i', closed ? `${num(model.i)} A` : '0 A');
    write('u', closed ? `${num(model.u1 + model.u2)} V` : '0 V');
    write('u1', closed ? `${num(model.u1)} V` : '0 V');
    write('u2', closed ? `${num(model.u2)} V` : '0 V');
  } else {
    write('i1', closed ? `${num(model.i1)} A` : '0 A');
    write('i2', closed ? `${num(model.i2)} A` : '0 A');
    write('i', closed ? `${num(model.i)} A` : '0 A');
    write('u', closed ? `${num(model.u)} V` : '0 V');
  }
  const lever = out(root, '[data-lab-lever]');
  if (lever) {
    const match = /^M([\d.]+) ([\d.]+)/.exec(lever.getAttribute('d') ?? '');
    if (match) lever.setAttribute('d', `M${match[1]} ${match[2]}${closed ? (lever.dataset.closed ?? 'v48') : (lever.dataset.open ?? 'l-24 32')}`);
  }
  out(root, '[data-lab-flow]')?.toggleAttribute('hidden', !closed);
  const status = out(root, '[data-lab-status]');
  if (status) {
    status.textContent = closed
      ? (kind === 'lab-series'
        ? `الدارة مغلقة: I = ${num(model.i)} A، U₁ = ${num(model.u1)} V، U₂ = ${num(model.u2)} V. سجّل القراءات.`
        : `الدارة مغلقة: I₁ = ${num(model.i1)} A، I₂ = ${num(model.i2)} A، وتيار المولد ${num(model.i)} A. سجّل القراءات.`)
      : 'القاطعة مفتوحة: المقاييس على الصفر؛ أغلق القاطعة لقراءة القيم.';
  }
  const desc = out(root, '.r4p-svg desc');
  if (desc && status) desc.textContent = status.textContent;
}

function gradeLab(root, spec, kind) {
  const state = stateFor(root);
  if (!state.lab.seenClosed) {
    return { gated: true, gateMessage: 'أغلق القاطعة أولاً واقرأ المقاييس، ثم سجّل القراءات بنفسك قبل التحقق.' };
  }
  const model = labModel(root, kind);
  if (!model) return { gated: true, gateMessage: 'أعد اختيار قيم المولد والمقاومتين ثم أغلق القاطعة.' };
  const seriesLabKind = kind === 'lab-series';
  const sourceVoltage = labSource(root);
  const expected = seriesLabKind
    ? { i: model.i, u1: model.u1, u2: model.u2 }
    : { i1: model.i1, i2: model.i2, i: model.i };
  const labels = seriesLabKind ? { i: 'I', u1: 'U₁', u2: 'U₂' } : { i1: 'I₁', i2: 'I₂', i: 'I' };
  let right = 0;
  let blanks = 0;
  const misses = [];
  for (const [key, expectedValue] of Object.entries(expected)) {
    const input = root.querySelector(`[data-lab-record="${key}"]`);
    const value = input?.value ?? '';
    if (!value.trim()) {
      blanks += 1;
      itemFeedback(root, key, 'أدخل القراءة', false);
      misses.push(labels[key]);
      continue;
    }
    const check = readingMatches(value, expectedValue);
    if (check.ok) right += 1; else misses.push(labels[key]);
    itemFeedback(root, key, check.ok ? '✓ مطابقة لقراءة المقياس' : 'قارن بقراءة المقياس المعروضة', check.ok);
  }
  if (blanks) {
    return { gated: true, gateMessage: `أكمل تسجيل القراءات الناقصة: ${misses.join('، ')}.` };
  }
  const selectedRelation = root.querySelector(`input[name="r4p-${seriesLabKind ? 'series' : 'parallel'}-relation"]:checked`)?.value ?? null;
  if (!selectedRelation) return { gated: true, gateMessage: 'اختر العلاقة المستنتجة بعد تسجيل القراءات.' };
  const relationSpec = spec.items[0];
  const relationOk = selectedRelation === relationSpec.correct;
  itemFeedback(root, relationSpec.id, relationOk ? '✓ العلاقة صحيحة' : 'راجع العلاقة؛ ابدأ من قراءاتك المسجلة', relationOk);
  const relationLine = out(root, '[data-lab-relation]');
  if (relationLine) {
    if (right === 3) {
      relationLine.textContent = seriesLabKind
        ? `تحقّق: U₁ + U₂ = ${num(model.u1)} + ${num(model.u2)} = ${num(sourceVoltage)} V، والتيار ${num(model.i)} A نفسه في المسار.`
        : `تحقّق: I₁ + I₂ = ${num(model.i1)} + ${num(model.i2)} = ${num(model.i)} A، وفرق الكمون ${num(sourceVoltage)} V على الفرعين.`;
      relationLine.dataset.kind = 'correct';
    } else {
      relationLine.textContent = `راجع القراءات غير المطابقة: ${misses.join('، ')}.`;
      relationLine.dataset.kind = 'incorrect';
    }
  }
  return { right: right + (relationOk ? 1 : 0), total: 4, wrongHints: [spec.hint] };
}

function handleCheck(root, kind) {
  withAnswers(root, (spec) => {
    if (!spec) {
      setFeedback(root, 'هذا النشاط بلا مفتاح تصحيح معرّف.', 'error');
      return;
    }
    if (kind === 'open') {
      const incomplete = completionCheck(root, spec, kind);
      if (incomplete) { setFeedback(root, incomplete, 'error'); return; }
      stateFor(root).attempted = true;
      renderSolution(root, spec);
      setScore(root, 'سُجّلت محاولتك · قارن بالمحاولة النموذجية');
      setFeedback(root, 'سُجّلت محاولتك. لم تُكشف أي إجابة قبل كتابتك؛ قارن الآن أفكارك بالحل النموذجي أدناه.', 'neutral');
      spec.items.forEach((item) => itemFeedback(root, item.id, 'سُجّلت المحاولة', true));
      return;
    }
    if (LAB_KINDS.has(kind)) {
      const result = gradeLab(root, spec, kind);
      if (result.gated) { setFeedback(root, result.gateMessage, 'error'); return; }
      stateFor(root).attempted = true;
      stateFor(root).lastWrongHints = result.wrongHints ?? [];
      applyResult(root, result, result.wrongHints ?? []);
      return;
    }
    const incomplete = completionCheck(root, spec, kind);
    if (incomplete) { setFeedback(root, incomplete, 'error'); return; }
    const result = gradeWithDom(root, kind, spec);
    stateFor(root).attempted = true;
    applyResult(root, result, result.wrongHints ?? []);
  });
}

function renderHint(root, spec) {
  const panel = out(root, '[data-r4p-hint]');
  if (!panel) return;
  const wrong = [];
  for (const item of spec.items) {
    if (!item.hint) continue;
    if (root.querySelector(`[data-r4p-open="${item.id}"]`)) { wrong.push(item.hint); continue; }
    const radio = root.querySelector(`input[name="r4p-${root.dataset.u2l4Practice}-${item.id}"]:checked`);
    const select = root.querySelector(`[data-r4p-match="${item.id}"]`);
    const numeric = root.querySelector(`[data-r4p-numeric="${item.id}"]`);
    if (radio && radio.value !== item.correct) wrong.push(item.hint);
    else if (select && select.value && select.value !== item.correct) wrong.push(item.hint);
    else if (numeric && numeric.value.trim() && !numericMatches(numeric.value, item.correct)) wrong.push(item.hint);
  }
  panel.innerHTML = `${HINT_TAG}<div class="r4p-hint-body"><p>${spec.hint}</p>${wrong.length ? `<ul>${[...new Set(wrong)].map((hint) => `<li>${hint}</li>`).join('')}</ul>` : ''}</div>`;
  panel.removeAttribute('hidden');
}

function renderSolution(root, spec) {
  const panel = out(root, '[data-r4p-solution]');
  if (!panel) return;
  const steps = spec.solution.steps.map((step) => `<div class="r4p-solution-step"><span class="r4p-solution-label">${step.label}</span>${step.tex ? formula(step.tex, step.label) : `<p>${step.text ?? ''}</p>`}</div>`).join('');
  panel.innerHTML = `<div class="r4p-solution-heading">${SOLUTION_TAG}<h4>${spec.solution.title}</h4></div><div class="r4p-solution-steps">${steps}</div>${spec.solution.note ? `<p class="r4p-solution-note">${spec.solution.note}</p>` : ''}`;
  panel.removeAttribute('hidden');
}

function mountActivity(root) {
  if (root.dataset.mounted === 'true') return;
  root.dataset.mounted = 'true';
  const id = root.dataset.u2l4Practice;
  const kind = KIND_BY_ID[id] ?? 'quiz';
  const form = root.querySelector('[data-r4p-form]');
  form?.addEventListener('submit', (event) => event.preventDefault());
  const onEdit = () => clearResult(root);
  form?.addEventListener('input', onEdit);
  form?.addEventListener('change', (event) => {
    if (event.target.matches?.('[data-lab-source], [data-lab-r1], [data-lab-r2]') && LAB_KINDS.has(kind)) renderLab(root, kind);
    onEdit();
  });
  root.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-lab-toggle]');
    if (toggle) {
      const state = stateFor(root);
      state.lab.closed = toggle.dataset.labToggle === 'close';
      if (state.lab.closed) state.lab.seenClosed = true;
      else state.lab.seenOpen = true;
      renderLab(root, kind);
      clearResult(root);
      setFeedback(root, state.lab.closed ? 'الدارة مغلقة؛ اقرأ المقاييس وسجّل القراءات.' : 'الدارة مفتوحة؛ المقاييس على الصفر.', 'neutral');
      return;
    }
    const action = event.target.closest('[data-r4p-action]');
    if (!action) return;
    const mode = action.dataset.r4pAction;
    if (mode === 'reset') {
      const state = stateFor(root);
      state.lab = initialLab();
      form?.reset();
      if (LAB_KINDS.has(kind)) renderLab(root, kind);
      clearResult(root);
      setFeedback(root, 'أُعيد ضبط هذا النشاط وحده؛ عادت الحقول والقاطعة إلى حالتها الابتدائية.', 'neutral');
      return;
    }
    if (mode === 'hint') {
      withAnswers(root, (spec) => { if (spec) renderHint(root, spec); });
      return;
    }
    if (mode === 'solution') {
      if (!stateFor(root).attempted) {
        setFeedback(root, 'قدّم محاولتك واضغط «تحقّق من الإجابة» أولاً؛ الحل النموذجي يُفتح بعد المحاولة.', 'error');
        return;
      }
      withAnswers(root, (spec) => { if (spec) renderSolution(root, spec); });
      return;
    }
    if (mode === 'check') handleCheck(root, kind);
  });
  if (LAB_KINDS.has(kind)) renderLab(root, kind);
}

export function mountUnit2L4Practice(scope = document) {
  scope.querySelectorAll('[data-u2l4-practice]').forEach(mountActivity);
}

/* exported for focused unit tests */
export const __internals = Object.freeze({ KIND_BY_ID, LAB_KINDS });
