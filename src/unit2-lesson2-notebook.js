/* دفتر الطالب — الوحدة الثانية، الدرس الثاني: التيار الكهربائي المتواصل (ص 87–96).
 *
 * هذا الدفتر هو *المرحلة الحادية عشرة والأخيرة* في مسار `UNIT2L2_PAGES`
 * (`src/unit2-lesson2-content.js`)، وليس صفحة مستقلة ولا تبويباً في الملحق أو
 * منطقة المعلم أو «الفيزياء في حياتنا». يتبع عقد الوسوم نفسه في دفاتر الدروس
 * السابقة (`student-notebook*`، معادلات KaTeX عبر `src/math.js`، كل معادلة في
 * سطر واحد)، لكنه يحمل مادة هذا الدرس وحدها.
 *
 * قاعدة الانتقاء: يُكتب هنا ما يحتاج الطالب إلى حفظه أو استخدامه في مسألة أو
 * تمييزه في سؤال امتحاني — الفكرة، التعريفات، القوانين بشروطها ووحداتها، قراءة
 * الرسوم، خطوة الحل، خلاصة التجارب، الأخطاء الشائعة، والخلاصة. أُهمل الشرح
 * المطوّل، ووصف التجارب خطوة بخطوة، ونصوص «ألاحظ وأستنتج»، والصور الفوتوغرافية،
 * وأمثلة الجهود التي ليست قانوناً لشدة التيار.
 *
 * المصدر: `src/unit2-lesson2-content.js` (نص الكتاب ص 87–96 وشروح المنصة)،
 * `src/unit2-lesson2-diagrams.js`، `src/unit2-lesson2-answers.js`،
 * `src/unit2-lesson2-teacher-content.js`،
 * و`docs/unit-2-lesson-2-source-audit.md`. كل رقم ووحدة وقانون هنا موجود في
 * درس الصفحة؛ وما جاء من شرح المنصة مُوسوم بذلك ولا يُنسب إلى الكتاب.
 */

import { formula, tex } from './math.js';

const law = (label, source, reading) => `<div class="student-notebook-law"><span>${label}</span><div class="student-notebook-formula">${formula(source, reading)}</div></div>`;
const step = (label, source, reading) => `<div class="student-notebook-step"><span>${label}</span><div>${formula(source, reading)}</div></div>`;
const inline = (source, reading) => tex(source, reading);
const definition = (term, text) => `<div class="student-notebook-definition"><strong>${term}:</strong> ${text}</div>`;
const note = (text) => `<p class="student-notebook-note">${text}</p>`;
const line = (text) => `<p class="student-notebook-example-step">${text}</p>`;
const sub = (text) => `<h4 class="student-notebook-example-title">${text}</h4>`;
const list = (items) => `<ul class="student-notebook-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
const numbered = (items) => `<ol class="student-notebook-list">${items.map((item) => `<li>${item}</li>`).join('')}</ol>`;
const symbols = (items) => `<ul class="student-notebook-symbols">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
const table = (head, rows, caption) => `<div class="student-notebook-table-wrap"><table class="student-notebook-table">${caption ? `<caption>${caption}</caption>` : ''}<thead><tr>${head.map((cell) => `<th scope="col">${cell}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const section = (id, title, body) => `<section class="student-notebook-section" aria-labelledby="${id}"><h3 id="${id}">${title}</h3>${body}</section>`;

/* written once, reused in the law cards and in the worked examples */
const CURRENT = 'I=\\dfrac{q}{t}';
const CHARGE = 'q=I\\,t';
const TIME = 't=\\dfrac{q}{I}';
const RATIO = '\\dfrac{q}{t}=\\mathrm{const}\\;\\Rightarrow\\;q\\propto t';
const SERIES = 'I=\\mathrm{Const}';
const PARALLEL = 'I=I_{1}+I_{2}';

export const UNIT2L2_NOTEBOOK_TITLE = '📒 دفتر الطالب';

export const UNIT2L2_NOTEBOOK_BLOCK = `<article class="student-notebook u2l2-student-notebook" aria-labelledby="student-notebook-title">
  <header class="student-notebook-header">
    <p class="student-notebook-kicker">المرحلة ١١ · خلاصة انتقائية للدرس الثاني (ص 87–96)</p>
    <h2 id="student-notebook-title">${UNIT2L2_NOTEBOOK_TITLE}</h2>
    <p>ما يحتاج الطالب إلى حفظه واستخدامه في المسائل والامتحان من درس «التيار الكهربائي المتواصل»، مرتباً للمراجعة السريعة. الشرح المطوّل والمختبرات وأنشطة الكتاب تبقى في مراحل الدرس نفسها.</p>
    <div class="student-notebook-tags">
      <span class="curriculum-tag curriculum-tag-book">من الكتاب · ص 87–96</span>
      <span class="curriculum-tag curriculum-tag-enrich">تنظيم وشرح من المنصة</span>
    </div>
  </header>
  <div class="student-notebook-sheet">

${section('u2l2nb-idea', '١. الفكرة الأساسية', `
${list([
  '<strong>الموضوع:</strong> التيار الكهربائي المتواصل (المستمر) = انتقال مستمر للإلكترونات الحرّة باتجاه واحد في الناقل (ص 88).',
  '<strong>شرطاه:</strong> مولّد + دارة مغلقة. المولّد يُسبّب حركة الإلكترونات ولا يُنتجها (ص 94).',
  `<strong>أهم نتيجة:</strong> شدة التيار هي كمية الكهرباء التي تعبر مقطع الدارة في واحدة الزمن، ${inline(CURRENT, 'I equals q over t')}، والنسبة ${inline('\\dfrac{q}{t}', 'q over t')} ثابتة في هذا الدرس (ص 90–91).`,
])}
${note('<strong>الجهتان:</strong> جهة التيار الاصطلاحية خارج المولّد من الموجب إلى السالب، وجهة حركة الإلكترونات من السالب إلى الموجب. هما متعاكستان دائماً (ص 88–89).')}`)}

${section('u2l2nb-terms', '٢. تعريفات ومصطلحات لا تُنسى', `
${definition('التيار الكهربائي المتواصل (ص 88)', 'انتقال مستمر للإلكترونات الحرّة باتجاه واحد في الناقل الذي يمرّ فيه التيار.')}
${definition('شدة التيار I (ص 91)', 'كمية الكهرباء q المارّة عبر مقطع دارة كهربائية خلال واحدة الزمن؛ تُقاس بالأمبير A.')}
${definition('الأمبير A (ص 91)', `شدة تيار يمرّ فيه ${inline('1\\,\\mathrm{C}', 'one coulomb')} خلال ${inline('1\\,\\mathrm{s}', 'one second')} عبر مقطع الدارة؛ أي ${inline('1\\,\\mathrm{A}=\\dfrac{1\\,\\mathrm{C}}{1\\,\\mathrm{s}}', 'one ampere equals one coulomb per second')}.`)}
${definition('مقياس الأمبير (ص 92)', 'جهاز يقيس شدة التيار عملياً، ويُوصل في الدارة على التسلسل حتى يمرّ فيه التيار المراد قياسه.')}
${table(['لا تخلط بين', 'و', 'الفرق الحاسم'], [
  ['شدة التيار (كمية)', 'الأمبير (وحدة)', 'الكمية تُقاس، والوحدة تُكتب بجانب الرقم؛ ومقياس الأمبير هو الجهاز لا أيٌّ منهما.'],
  ['جهة التيار الاصطلاحية', 'جهة حركة الإلكترونات', 'الأولى من + إلى − خارج المولّد (اصطلاح أمبير)، والثانية بالعكس (ص 89).'],
  ['الوصل على التسلسل', 'الوصل على التفرّع', 'مسار واحد بتيار ثابت، مقابل فروع تتجمع شداتها في الخط الأصلي (ص 92–94).'],
  ['المولّد', 'المصباح / القاطعة / المقياس', 'المولّد يُسبّب الحركة؛ المصباح يستهلك، والقاطعة تفتح وتغلق، والمقياس يقيس (ص 96).'],
], 'فروق يكثر السؤال عنها')}
${line('<strong>مولّدات تيار مستمر وردت في الدرس (ص 89):</strong> الخلايا الكهربائية البسيطة والخلايا الضوئية.')}`)}

${section('u2l2nb-laws', '٣. القوانين والعلاقات: الرموز والوحدات والشروط', `
${law('القانون الأساسي', CURRENT, 'I equals q over t')}
${law('كمية الكهرباء', CHARGE, 'q equals I times t')}
${law('الزمن (مشتقة)', TIME, 't equals q over I')}
${law('التناسب الطردي', RATIO, 'q over t is constant, so q is proportional to t')}
${law('على التسلسل', SERIES, 'I is constant in a series circuit')}
${law('على التفرّع', PARALLEL, 'I equals I one plus I two')}
${symbols([
  `${inline('q', 'q')} : كمية الكهرباء عبر مقطع الناقل، بالكولوم ${inline('\\mathrm{C}', 'coulomb')}.`,
  `${inline('t', 't')} : زمن المرور، بالثانية ${inline('\\mathrm{s}', 'second')}، ولا يكون صفراً.`,
  `${inline('I', 'I')} : شدة التيار، بالأمبير ${inline('\\mathrm{A}', 'ampere')}.`,
  `${inline('I_{1},I_{2}', 'I one and I two')} : شدة تيار الفرعين، بالأمبير أيضاً.`,
])}
${table(['التحويل', 'القيمة', 'متى أحتاجه'], [
  ['مضاعفات وأجزاء الأمبير (ص 91)', `${inline('1\\,\\mathrm{kA}=10^{3}\\,\\mathrm{A}', 'one kiloampere')} · ${inline('1\\,\\mathrm{mA}=10^{-3}\\,\\mathrm{A}', 'one milliampere')} · ${inline('1\\,\\mu\\mathrm{A}=10^{-6}\\,\\mathrm{A}', 'one microampere')}`, 'عند قراءة تدريج أو كتابة النتيجة بوحدة مكافئة.'],
  ['الدقائق إلى ثوانٍ (ص 91، 96)', `${inline('1\\,\\mathrm{min}=60\\,\\mathrm{s}', 'one minute equals sixty seconds')} · ${inline('2\\,\\mathrm{min}=120\\,\\mathrm{s}', 'two minutes')} · ${inline('3\\,\\mathrm{min}=180\\,\\mathrm{s}', 'three minutes')} · ${inline('5\\,\\mathrm{min}=300\\,\\mathrm{s}', 'five minutes')}`, 'قبل كل تعويض في قانون الشدة.'],
  ['قيمتا الدرس (ص 92، 96)', `${inline('200\\,\\mathrm{mA}=0.2\\,\\mathrm{A}', 'two hundred milliamperes equals zero point two amperes')} · ${inline('0.1\\,\\mathrm{A}=100\\,\\mathrm{mA}', 'zero point one ampere equals one hundred milliamperes')}`, 'قراءة مقياس التسلسل، ونتيجة السؤال الخامس.'],
], 'تحويلات لا تسقط في المسألة')}
${note(`<strong>شروط التطبيق:</strong> الدرس يطبّق ${inline(CURRENT, 'I equals q over t')} على تيار متواصل ثابت في دارة مغلقة، و${inline('q', 'q')} عبر مقطع واحد خلال ${inline('t', 't')} بالثانية. الصيغتان ${inline(CHARGE, 'q equals I t')} و${inline(TIME, 't equals q over I')} مشتقتان من القانون نفسه (تنظيم المنصة). في التفرّع يُجمع تيارا الفرعين في الخط الأصلي، وعلى التسلسل لا تُجمع الشدات لأنها واحدة في كل نقطة.`)}
${line(`<strong>أي قانون متى؟</strong> عرفت ${inline('q,t', 'q and t')} فاحسب ${inline(CURRENT, 'I equals q over t')}؛ عرفت ${inline('I,t', 'I and t')} فاحسب ${inline(CHARGE, 'q equals I t')}؛ في التفرّع استخدم ${inline(PARALLEL, 'I equals I one plus I two')}؛ وعلى التسلسل استخدم ${inline(SERIES, 'I is constant')}.`)}`)}

${section('u2l2nb-figures', '٤. ما أرسمه وما أقرأه في الرسوم', `
${table(['الرسم (الصفحة)', 'ما أرسمه / أنتبه إليه', 'القراءة العلمية'], [
  ['دارة مغلقة (ص 89)', `مولّد بطرفيه ${inline('+,-', 'plus and minus')}، مفتاح، مصباح، أسلاك. سهم أصفر للتيار من + إلى − <strong>خارج المولّد</strong>، وسهم أحمر لـ ${inline('e^{-}', 'electrons')} بالعكس.`, 'الجهتان متعاكستان؛ لا ترسم سهم الإلكترونات داخل المولّد.'],
  ['خط q مقابل t (ص 90)', `المحور الأفقي ${inline('t\\,(\\mathrm{s})', 't in seconds')} والرأسي ${inline('q\\,(\\mathrm{C})', 'q in coulombs')}؛ نقاط (5,20) و(10,40) و(15,60) و(20,80) و(25,100).`, `خط مستقيم من المبدأ = تناسب طردي، وميله ${inline('\\dfrac{q}{t}=4\\,\\mathrm{A}', 'q over t equals four amperes')} هو شدة التيار.`],
  ['دارة التسلسل (ص 92)', `مسار واحد: مولّد ← ${inline('A_{1}', 'A one')} ← مصباحان ← ${inline('A_{2}', 'A two')}.`, `قراءتان متساويتان ${inline('200\\,\\mathrm{mA}', 'two hundred milliamperes')}؛ نزع مصباح يفتح المسار كله.`],
  ['دارة التفرّع (ص 93–94)', `فرعان بين نقطتين؛ ${inline('A', 'A')} في الخط الأصلي و${inline('A_{1},A_{2}', 'A one and A two')} في الفرعين.`, `${inline(PARALLEL, 'I equals I one plus I two')}؛ نزع فرع لا يوقف الفرع الآخر.`],
  ['منحنيات I–t (ص 95)', 'أربعة منحنيات: a تناقص، b موجة، c درجات، d خط أفقي.', 'التيار المتواصل ثابت الشدة ⇒ المنحنى d فقط.'],
], 'خمسة رسوم تكفي؛ لا تُنسخ صور الكتاب الأخرى')}
${note('<strong>حذارٍ من شكلي المولّدات (ص 93–94):</strong> أربع خلايا على التسلسل تعطي 6 V، وعلى التفرّع 1.5 V. هما مثالان على الجهد، <strong>وليسا قانوناً لشدة التيار</strong>؛ لا تُدخل قيمتهما في حساب I.')}`)}

${section('u2l2nb-solving', '٥. خطوات الحل ونمطان مهمان', `
${numbered([
  'حدّد المعطيات والمطلوب، واكتب رمز كل كمية.',
  `حوّل الوحدات أولاً: الدقائق إلى ثوانٍ، و${inline('\\mathrm{mA}', 'milliampere')} إلى ${inline('\\mathrm{A}', 'ampere')} عند الحاجة.`,
  `اختر القانون: ${inline(CURRENT, 'I equals q over t')} أو ${inline(CHARGE, 'q equals I t')} أو علاقة الوصل.`,
  'عوّض في سطر واحد، ثم اكتب النتيجة بالوحدة الصحيحة.',
  'تحقّق بالتناسب: عند ثبات I، مضاعفة الزمن تضاعف كمية الكهرباء.',
])}
${sub('نمط 1 · التطبيق المحلول ص 91')}
${line(`المعطيات: ${inline('q=60\\,\\mathrm{C}', 'sixty coulombs')} في ${inline('t=30\\,\\mathrm{s}', 'thirty seconds')}. المطلوب: الشدة، ثم كمية الكهرباء في ثلاث دقائق.`)}
${step('القانون', CURRENT, 'I equals q over t')}
${step('التعويض 1', 'I=\\dfrac{60}{30}=2\\,\\mathrm{A}', 'I equals sixty over thirty equals two amperes')}
${step('التحويل', '3\\,\\mathrm{min}=180\\,\\mathrm{s}', 'three minutes equals one hundred eighty seconds')}
${step('التعويض 2', 'q=2\\times180=360\\,\\mathrm{C}', 'q equals two times one hundred eighty equals three hundred sixty coulombs')}
${sub('نمط 2 · السؤال الخامس ص 96 (تحويل الوحدات)')}
${line(`المعطيات: ${inline('12\\,\\mathrm{c}', 'twelve coulombs as printed')} في دقيقتين؛ المطلوب الشدة ثم الكمية في خمس دقائق.`)}
${step('التحويل', '2\\,\\mathrm{min}=120\\,\\mathrm{s}\\;,\\quad5\\,\\mathrm{min}=300\\,\\mathrm{s}', 'two minutes is one hundred twenty seconds and five minutes is three hundred seconds')}
${step('الشدة', 'I=\\dfrac{12}{120}=0.1\\,\\mathrm{A}=100\\,\\mathrm{mA}', 'I equals twelve over one hundred twenty equals zero point one ampere')}
${step('الكمية', 'q=0.1\\times300=30\\,\\mathrm{C}', 'q equals zero point one times three hundred equals thirty coulombs')}
${note(`<strong>لماذا هذان المثالان فقط؟</strong> الأول يثبّت القانون وتحويل الدقائق، والثاني يثبّت النمط الامتحاني الأخطر: القسمة على 120 لا على 2. الحل ${inline('I=2\\,\\mathrm{A}', 'two amperes')} و${inline('360\\,\\mathrm{C}', 'three hundred sixty coulombs')} ثم ${inline('0.1\\,\\mathrm{A}', 'zero point one ampere')} و${inline('30\\,\\mathrm{C}', 'thirty coulombs')}؛ لا حاجة لنسخ بقية التمارين.`)}`)}

${section('u2l2nb-experiments', '٦. التجارب: الهدف، الأدوات، النتيجة', `
${table(['التجربة (الصفحة)', 'الأدوات والخطوة الجوهرية', 'الملاحظة ← الاستنتاج'], [
  ['الأنبوب (ص 88)', 'أنبوب شفاف أفقي مملوء بكرات؛ أدفع كرة ثم عدة كرات من الطرف نفسه.', 'يخرج العدد نفسه من الطرف الآخر فوراً ← الإلكترونات الحرّة موجودة سلفاً في الناقل، والمولّد يدفعها باتجاه واحد. الذي ينتقل فوراً هو أثر الدفع لا الإلكترون نفسه (شرح المنصة).'],
  ['التسلسل (ص 92)', `مولّد تيار مستمر، مصباحان ${inline('L_{1},L_{2}', 'L one and L two')}، مقياسا أمبير ${inline('A_{1},A_{2}', 'A one and A two')}، أسلاك؛ أقرأ ثم أنزع مصباحاً.`, `${inline('A_{1}=A_{2}=200\\,\\mathrm{mA}', 'both ammeters read two hundred milliamperes')}، ونزع مصباح يقطع التيار كله ← ${inline(SERIES, 'I is constant')} في كل الأجزاء، والمسار واحد.`],
  ['التفرّع (ص 93–94)', 'مولّد، مصباحان مختلفان، ثلاثة مقاييس أمبير، أسلاك؛ أقارن قراءة الأصل بقراءتي الفرعين ثم أنزع مصباحاً.', `التيار يبقى في بقية الفروع ← ${inline(PARALLEL, 'I equals I one plus I two')}، وشدات التيار تختلف بين الفروع لا داخل الفرع الواحد.`],
], 'ثلاث تجارب: أحتفظ بالهدف والنتيجة لا بسرد الخطوات')}
${note('<strong>قاعدة مشتركة:</strong> مقياس الأمبير في الدارتين يُوصل على التسلسل؛ وصله على التفرّع يجعله مساراً جانبياً فيفسد القياس (شرح المنصة ص 92).')}`)}

${section('u2l2nb-exam', '٧. ملاحظات امتحانية وأخطاء شائعة', `
${numbered([
  '<strong>الجهة:</strong> «من السالب إلى الموجب» تصف حركة الإلكترونات لا جهة التيار؛ عبارة «صح/خطأ» في ص 95 خاطئة وتُصحَّح بتبديل الجهة، مع قيد «خارج المولّد».',
  `<strong>التمييز الثلاثي:</strong> شدة التيار كمية، والأمبير وحدة، ومقياس الأمبير جهاز على التسلسل. المصطلحات الأربعة في ص 95 تقيس هذا بالضبط.`,
  '<strong>التحويل قبل التعويض:</strong> القسمة على 2 بدل 120 تعطي 6 A خطأ؛ ص 91 وص 96 كلتاهما تطلبان الثواني أولاً.',
  `<strong>رمز مطبعي:</strong> ص 96 تكتب ${inline('12\\,\\mathrm{c}', 'twelve c as printed')} بحرف لاتيني صغير والمقصود 12 كولوم؛ لا تقرأها وحدة أخرى.`,
  `<strong>الوحدات:</strong> ${inline('q', 'q')} بالكولوم و${inline('t', 't')} بالثانية و${inline('I', 'I')} بالأمبير؛ ${inline('200\\,\\mathrm{mA}=0.2\\,\\mathrm{A}', 'two hundred milliamperes')} و${inline('0.1\\,\\mathrm{A}=100\\,\\mathrm{mA}', 'one tenth ampere')} مكافئتان.`,
  '<strong>الوصل:</strong> على التسلسل I ثابت ونزع أي جزء يقطع الكل؛ على التفرّع تجمع الفروع ونزع فرع لا يطفئ الباقي. لا تعكس الحالتين.',
  '<strong>المنحنى:</strong> التيار المتواصل يمثّله الخط الأفقي d؛ a وb وc تصف شدّة متغيّرة مع الزمن (ص 95).',
  '<strong>شرط التيار:</strong> مولّد + دارة مغلقة؛ المسبّب لحركة الإلكترونات هو المولّد (الخيار b في ص 96)، لا المصباح ولا القاطعة ولا المقياس.',
  '<strong>سؤال التفسير ص 96:</strong> القاصمة المنصهرة تقطع الدارة عند زيادة الشدة فتحمي الجهاز؛ والمعادن توصل لكثرة إلكتروناتها الحرّة بينما إلكترونات العوازل مرتبطة. الصياغة هنا «حل نموذجي من المنصة»؛ الكتاب يطلب التفسير ولا يطبعه.',
  '<strong>ليست قانوناً لشدة التيار:</strong> 6 V و1.5 V في شكلي المولّدات مثالان على الجهد، لا تُستخدمان في حساب I.',
])}
${note('<strong>قيد مصدر:</strong> خلايا الجدول الفارغة في ص 90 لم تُطبع قيمها في الكتاب؛ استُنتجت من ثبات النسبة 4 ومن نقاط الرسم المطبوعة على الصفحة نفسها. لا تُضف أرقاماً من خارج الدرس.')}`)}

${section('u2l2nb-summary', '٨. خلاصة الدرس للمراجعة السريعة', `
${list([
  `${inline(CURRENT, 'I equals q over t')} و${inline(CHARGE, 'q equals I t')} بوحدات ${inline('\\mathrm{C},\\mathrm{s},\\mathrm{A}', 'coulomb, second, ampere')}، مع تحويل الدقائق إلى ثوانٍ.`,
  `${inline('\\dfrac{q}{t}', 'q over t')} ثابتة ⇒ خط ${inline('q', 'q')} مقابل ${inline('t', 't')} مستقيم من المبدأ، وميله هو ${inline('I', 'I')}.`,
  'التيار الاصطلاحي من + إلى − خارج المولّد؛ الإلكترونات بالعكس؛ والمولّد يُسبّب الحركة ولا يخلقها.',
  `التسلسل: ${inline(SERIES, 'I is constant')}، وفتح أي جزء يقطع الدارة كلها.`,
  `التفرّع: ${inline(PARALLEL, 'I equals I one plus I two')}، ونزع فرع لا يوقف بقية الفروع.`,
  'مقياس الأمبير على التسلسل، والمنحنى الأفقي هو التيار المتواصل، وشرط المرور مولّد ودارة مغلقة.',
])}
${line('<strong>ترتيب المراجعة قبل الامتحان:</strong> التعريفات ← القانون ووحداته ← الرسم والجهتان ← خطوة التحويل ← التسلسل والتفرّع ← الأخطاء الشائعة.')}`)}

  </div>
</article>`;
