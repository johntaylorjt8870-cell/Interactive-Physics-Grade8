/*
 * Authored content for the Unit 2 Lesson 2 appendix —
 * «رحلة الشحنات — من المولّد إلى المصباح» (textbook pages 87–96).
 *
 * Three voices are kept strictly apart, exactly as the platform does elsewhere:
 *
 *   1. «من الكتاب» — objectives, keywords, the three «ألاحظ وأستنتج» questions
 *      and the conclusions of pages 87–96, each with its printed page. The
 *      audit of those pages is docs/unit-2-lesson-2-source-audit.md;
 *   2. «شرح المنصة» — the platform's own wording for what a model or a scene
 *      shows;
 *   3. «إثراء علمي من المنصة» — correct physics that goes beyond the printed
 *      page (drift speed versus the speed at which the effect spreads, energy
 *      transfer, what happens inside the generator). It is labelled, and it is
 *      never attributed to the book.
 *
 * No photograph, table or figure of the book is reproduced. The scenes are
 * platform drawings; the page reference tells the reader which printed element
 * the drawing is about, and the label «رسم إثرائي توضيحي» is shown on every
 * scene that re-draws a printed figure whose original image is not available.
 *
 * All mathematics is rendered through the shared KaTeX layer (`math.js`), so
 * fractions, units and subscripts are real typeset math inside LTR islands.
 */

import { formula, ltrText, tex } from './math.js';
import {
  CHARGE_FORM_TEX,
  RELATION_TEX,
  TIME_FORM_TEX,
} from './unit2-lesson2-appendix-physics.js';

/* ------------------------------------------------------------------ labels */

export const APPENDIX_TITLE = 'رحلة الشحنات';
export const APPENDIX_SUBTITLE = 'من المولّد إلى المصباح';
export const APPENDIX_LESSON_LABEL = 'الوحدة الثانية · الدرس 2 — التيّار الكهربائيّ المُتواصِل';
export const LESSON_PAGES = '87–96';
export const EXTENSION_LABEL = 'ملحق تفاعلي — Platform Extension';
export const MODEL_LABEL = 'نموذج تعليمي مبسّط — Educational simplified model';
export const SOURCE_LABEL = 'من الكتاب';
export const PLATFORM_LABEL = 'شرح المنصة · Platform Explanation';
export const ENRICHMENT_LABEL = 'إثراء علمي من المنصة';
export const NOTES_LABEL = 'تدقيق المصدر';
export const NOT_BOOK_LABEL = 'تحديات من إعداد المنصة · ليست أسئلة اختبار الدرس ولا جزءاً من منطقة المعلم';
export const SCENE_LABEL = 'رسم إثرائي توضيحي — ليس نقلاً مؤكداً لشكل الكتاب';
export const APPENDIX_HASH_PREFIX = '#station-';

/* The words the shared circuit scene draws inside its SVG. They live here (not
 * in the view) so the geometry audit can measure the very strings a browser
 * paints, and so no caption can ever disagree with the legend. */
export const SCENE_COPY = Object.freeze({
  generatorTitle: 'المولّد، مصدر الطاقة الكهربائية',
  terminalPositive: 'القطب الموجب',
  terminalNegative: 'القطب السالب',
  lampTitle: 'المصباح',
  lampSubtitle: 'الجهاز الذي يعمل في الدارة',
  lampTwoTitle: 'المصباح الثاني',
  switchTitle: 'المفتاح',
  switchSubtitle: 'يفتح الدارة ويغلقها',
  wireLabel: 'أسلاك التوصيل',
  energyLabel: 'الطاقة تنتقل إلى المصباح',
  /* readable names for the wire segments, used inside the arrow tooltips */
  segments: Object.freeze({
    'top-left': 'القطعة العلوية اليسرى من السلك',
    left: 'الفرع الأيسر من السلك',
    bottom: 'الفرع السفلي من السلك',
    right: 'الفرع الأيمن من السلك',
    'top-right': 'القطعة العلوية اليمنى من السلك',
    generator: 'داخل المولّد',
  }),
  /* the one arrow inside the generator names the conventional current only */
  generatorInteriorTitle: 'التيّار الاصطلاحي داخل المولّد: من القطب السالب إلى القطب الموجب',
  generatorInteriorCaption: 'داخل المولّد من السالب إلى الموجب',
});

/* The short caption that sits next to every drawn arrow. Each arrow carries
 * exactly one word, and the legend maps that word to its own concept, so the
 * two layers can never be read as the same thing. */
export const ARROW_CAPTION_COPY = Object.freeze({
  current: 'التيّار',
  electron: 'الإلكترونات',
});

/** Inline source reference in the platform's established wording. */
const ref = (page, note) => `<span class="u2l2a-ref"><bdi dir="ltr">Reference / See textbook — p${page}</bdi>${note ? ` · ${note}` : ''}</span>`;

/* -------------------------------------------------------------- symbols */

export const S_I = tex('I', 'I');
export const S_Q = tex('Q', 'Q');
export const S_Q_BOOK = tex('q', 'q as printed in the book');
export const S_T = tex('t', 't');
export const S_A = tex('\\mathrm{A}', 'ampere');
export const S_C = tex('\\mathrm{C}', 'coulomb');
export const S_S = tex('\\mathrm{s}', 'second');
export const S_MA = tex('\\mathrm{mA}', 'milliampere');
export const S_MIN = tex('\\mathrm{min}', 'minute');
export const S_ELECTRON = tex('e^{-}', 'electron');
export const S_AMPERE_DEF = tex('1\\,\\mathrm{A}=1\\,\\dfrac{\\mathrm{C}}{\\mathrm{s}}', 'one ampere equals one coulomb per second');
export const S_MA_CONVERSION = tex('200\\,\\mathrm{mA}=0.2\\,\\mathrm{A}', '200 milliamperes equal 0.2 ampere');

export const RELATION_HTML = formula(RELATION_TEX, 'I equals Q over t');
export const CHARGE_FORM_HTML = formula(CHARGE_FORM_TEX, 'Q equals I times t');
export const TIME_FORM_HTML = formula(TIME_FORM_TEX, 't equals Q over I');

/* ------------------------------------------------------------- objectives */

export const APPENDIX_OBJECTIVES = Object.freeze([
  Object.freeze({
    id: 'o1',
    text: 'يتعرّف التيّار الكهربائيّ المُتواصِل.',
    check: 'أستطيع أن أقول بأسلوبي ما التيّار الكهربائي المتواصل، وأشير إلى الإلكترونات الحرّة في الدارة.',
    stations: 'المحطة 1 والمحطة 2 والمحطة 7',
  }),
  Object.freeze({
    id: 'o2',
    text: 'يحدّد جهة التيّار الكهربائيّ المُتواصِل.',
    check: 'أستطيع أن أحدّد جهة التيار الاصطلاحية خارج المولّد، وأن أذكر أن جهة انجراف الإلكترونات عكسها.',
    stations: 'المحطة 3 والمحطة 7',
  }),
  Object.freeze({
    id: 'o3',
    text: 'يستنتج العلاقة بين شِدّة التيّار وكميّة الكهرباء وزمن مرورها.',
    check: 'أستطيع أن أستخدم I = Q/t وأن أفسّر ما يحدث لشِدّة التيار عند تغيير كمية الكهرباء أو الزمن.',
    stations: 'المحطة 4 والمحطة 5 والمحطة 7',
  }),
]);

export const APPENDIX_KEYWORDS = Object.freeze([
  Object.freeze({ id: 'free-electrons', label: 'الإلكترونات الحرّة', gloss: 'إلكترونات موجودة سلفاً في النّاقل، وحركتها هي التي تُكوّن التيّار.' }),
  Object.freeze({ id: 'current-intensity', label: 'شِدّة التيّار', gloss: 'كميّة الكهرباء المارّة عبر مقطع النّاقل خلال واحدة الزّمن.' }),
  Object.freeze({ id: 'electric-charge', label: 'كميّة الكهرباء', gloss: 'مقدار الكهرباء المارّة عبر مقطع النّاقل، وتُقاس بالكولوم.' }),
]);

/* --------------------------------------------------------------- stations */

export const APPENDIX_STATIONS = Object.freeze([
  Object.freeze({
    id: 'origin',
    index: 1,
    title: 'من أين تأتي الطاقة؟',
    navLabel: 'مصدر الطاقة',
    icon: '⌂',
    kicker: 'ألاحظ · أستنتج · أفسّر',
    goal: 'أن تحدّد مصدر الطاقة الكهربائية في الدارة، ودور المولّد فيها، وكيف تصل الطاقة إلى المصباح.',
    objective: 'الهدف الأول (والسؤالان الأول والثالث من «ألاحظ وأستنتج»)',
    objectiveIds: Object.freeze(['o1']),
    keywords: Object.freeze(['الإلكترونات الحرّة', 'شِدّة التيّار']),
  }),
  Object.freeze({
    id: 'electrons',
    index: 2,
    title: 'رحلة الإلكترونات الحرّة',
    navLabel: 'الإلكترونات الحرّة',
    icon: '↯',
    kicker: 'شغّل · أوقف · لاحظ الفرق',
    goal: 'أن تلاحظ الفرق بين حركة عشوائية للإلكترونات الحرّة وحركة منظّمة باتجاه واحد عند إغلاق الدارة.',
    objective: 'الهدف الأول (والسؤال الثاني من «ألاحظ وأستنتج»)',
    objectiveIds: Object.freeze(['o1']),
    keywords: Object.freeze(['الإلكترونات الحرّة', 'شِدّة التيّار']),
  }),
  Object.freeze({
    id: 'direction',
    index: 3,
    title: 'أيّ جهة يسير فيها التيّار؟',
    navLabel: 'جهة التيّار',
    icon: '↔',
    kicker: 'اصطلاح · مقارنة · تمييز',
    goal: 'أن تحدّد الجهة الاصطلاحية للتيّار الكهربائي، وأن تميّزها عن جهة انجراف الإلكترونات وعن اتجاه انتقال الطاقة.',
    objective: 'الهدف الثاني',
    objectiveIds: Object.freeze(['o2']),
    keywords: Object.freeze(['الإلكترونات الحرّة', 'شِدّة التيّار']),
  }),
  Object.freeze({
    id: 'ammeter',
    index: 4,
    title: 'مختبر شِدّة التيار',
    navLabel: 'مقياس الأمبير',
    icon: '◎',
    kicker: 'غيّر · قِس · قارن',
    goal: 'أن تعطي معنى لشِدّة التيار من قياس فعلي: كمية الكهرباء المارّة خلال زمن معلوم تُقرأ على مقياس الأمبير.',
    objective: 'الهدف الثالث',
    objectiveIds: Object.freeze(['o3']),
    keywords: Object.freeze(['شِدّة التيّار', 'كميّة الكهرباء']),
  }),
  Object.freeze({
    id: 'relation',
    index: 5,
    title: 'العلاقة بين شِدّة التيار وكمية الكهرباء والزمن',
    navLabel: 'الحاسبة والعلاقة',
    icon: '∑',
    kicker: 'علاقة · حاسبة · تحديات',
    goal: 'أن تستخدم العلاقة I = Q/t وصورتَيها المكافئتين، وأن تحسب أي كمية من الكميتين الأخريين.',
    objective: 'الهدف الثالث',
    objectiveIds: Object.freeze(['o3']),
    keywords: Object.freeze(['شِدّة التيّار', 'كميّة الكهرباء']),
  }),
  Object.freeze({
    id: 'detective',
    index: 6,
    title: 'المحقّق الكهربائي',
    navLabel: 'المحقّق الكهربائي',
    icon: '❖',
    kicker: 'سيناريو واحد · سبع مهام',
    goal: 'أن توظّف مفاهيم الرحلة كلها في مواقف جديدة، وأن تكتشف خطأً في تفسير علمي وتصحّحه.',
    objective: 'الأهداف الثلاثة في سياق واحد',
    objectiveIds: Object.freeze(['o1', 'o2', 'o3']),
    keywords: Object.freeze(['الإلكترونات الحرّة', 'شِدّة التيّار', 'كميّة الكهرباء']),
  }),
  Object.freeze({
    id: 'map',
    index: 7,
    title: 'خريطة الفهم',
    navLabel: 'خريطة الفهم',
    icon: '✺',
    kicker: 'اربط · افتح · راجع نفسك',
    goal: 'أن تربط مفاهيم الرحلة بعضها ببعض، وأن تقيس فهمك بنفسك على أهداف الدرس الثلاثة.',
    objective: 'الأهداف الثلاثة',
    objectiveIds: Object.freeze(['o1', 'o2', 'o3']),
    keywords: Object.freeze(['الإلكترونات الحرّة', 'شِدّة التيّار', 'كميّة الكهرباء']),
  }),
]);

export const STATION_IDS = Object.freeze(APPENDIX_STATIONS.map((station) => station.id));
export const DEFAULT_STATION_ID = APPENDIX_STATIONS[0].id;

export function findStation(stationId) {
  const station = APPENDIX_STATIONS.find((candidate) => candidate.id === stationId);
  if (!station) throw new RangeError(`Unknown station: ${stationId}`);
  return station;
}

/** The three objectives a station serves, as full records. */
export const objectivesOfStation = (stationId) => {
  const station = findStation(stationId);
  return APPENDIX_OBJECTIVES.filter((objective) => station.objectiveIds.includes(objective.id));
};

/* ------------------------------------------------------------- page shell */

export const HERO_DESCRIPTION_HTML = `
  <p>ملحق إثرائي مستقلّ لدرس <strong>التيّار الكهربائيّ المُتواصِل</strong>. تتكوّن الرحلة من سبع محطات قصيرة: تبدأ من سؤال «من أين نحصل على الطاقة؟»، ثم تتابع الإلكترونات الحرّة داخل موصل، وتقارن جهة التيار الاصطلاحية بجهة انجرافها، وتقيس شِدّة التيار، وتستخدم العلاقة ${tex(RELATION_TEX, 'I equals Q over t')} في حاسبة تشرح خطواتها، وتنتهي بتحدٍّ وخريطة فهم.</p>
  <p>كل ما نُقل من الكتاب مكتوبٌ بجانبه «${SOURCE_LABEL}» مع رقم صفحته، وما أضفته المنصة موسوم بـ«${PLATFORM_LABEL}» أو «${ENRICHMENT_LABEL}». لا صور فوتوغرافية ولا أشكال منقولة: الرسوم كلها من إعداد المنصة وموسومة بذلك.</p>`;

export const HOW_TO_USE_STEPS = Object.freeze([
  Object.freeze({ title: 'اقرأ السؤال أولاً', body: 'كل محطة تبدأ بسؤال. توقّع الإجابة قبل أن تحرّك أي شيء: التوقّع يجعل الخطأ مفيداً.' }),
  Object.freeze({ title: 'شغّل التجربة بنفسك', body: 'أزرار التشغيل والإيقاف وإعادة الضبط موجودة في كل محطة، والمنزلقات وحقول الإدخال تعمل بلوحة المفاتيح وبأهداف لمس مريحة.' }),
  Object.freeze({ title: 'اقرأ التغذية الراجعة', body: 'لا تُعرض الإجابة قبل التحقّق، وبعد التحقّق يأتي تفسير الفكرة صحيحة كانت أو خاطئة، دون خصم ولا قفل.' }),
  Object.freeze({ title: 'راجع نفسك في النهاية', body: 'خريطة الفهم تربط المفاهيم، وقائمة التحقّق الذاتي تقيس ما أنجزته على أهداف الدرس الثلاثة.' }),
]);

export const HERO_NOTE = 'ملحق إثرائي مستقلّ: لا يغيّر صفحات الدرس المنشورة، ولا يُسجَّل ضمن اختبار الدرس ولا منطقة المعلم.';

export const FOOTER_NOTE = 'رحلة الشحنات · ملحق إثرائي للدرس الثاني من الوحدة الثانية — التيّار الكهربائي المتواصل · صفحات الكتاب 87–96';

/* ======================================================= station 1 · origin */

export const ORIGIN_INTRO_HTML = `
  <p>الدائرة أمامك تحوي مولّداً ومصباحين وأسلاكاً ومفتاحاً. جرّب المفتاح وراقب ما يحدث للمبة، ثم اضغط على أي جزء من أجزاء الدائرة لتقرأ دوره.</p>
  <p>هذه المحطة تجيب أسئلة «ألاحظ وأستنتج» المطبوعة في صفحة 87 واحداً بعد الآخر: من أين نحصل على الطاقة؟ ما دور المولّد؟ كيف وصلت الطاقة إلى المصباح؟</p>`;

export const ORIGIN_SCENE_NOTE = `${SCENE_LABEL}. الشكل المطبوع في ${ltrText('p87')} يحوي صورة فوتوغرافية لدائرة بمصباحين وبطاريتين ومفتاح؛ الصورة الأصلية غير متوفرة في المستودع، فالمشهد هنا رسم تخطيطي من إعداد المنصة استناداً إلى وصف الشكل في تدقيق المصدر.`;

export const ORIGIN_BOOK_QUESTIONS_HTML = `
  <h3>أسئلة «ألاحظ وأستنتج» كما في الكتاب — صفحة 87</h3>
  <ol>
    <li>من أين نحصل على الطاقة الكهربائية؟</li>
    <li>ما دور المولّد في الدّارة السّابقة؟</li>
    <li>كيف انتقلت الطّاقة الكهربائية من المولّد إلى المصباح؟</li>
  </ol>
  <p>${ref(87, 'الأسئلة مطبوعة بلا إجابات في الكتاب؛ الإجابات والتغذية الراجعة أدناه من إعداد المنصة.')}</p>`;

/* Roles of the circuit parts: each opens from its own button. `source` says
 * whether the wording is printed in the book or added by the platform. */
export const PART_CARDS = Object.freeze([
  Object.freeze({
    id: 'generator',
    title: 'المولّد (البطارية)',
    labelInScene: 'المولّد — مصدر الطاقة الكهربائية',
    source: 'book',
    pageRef: 87,
    bodyHtml: `<p>المولّد هو <strong>مصدر الطاقة الكهربائية</strong> في الدارة، وهو الذي يُسبّب حركة الإلكترونات الحرّة.</p>
      <p>${ref(87, 'الشكل المطبوع يحوي بطاريتين.')} ${ref(94, 'من بنود «تعلمتُ»: المولّد لا يُنتِج إلكترونات ولكن يُسبّب حركة الإلكترونات في الدّارة.')}</p>`,
  }),
  Object.freeze({
    id: 'terminals',
    title: 'قطبا المولّد: الموجب والسالب',
    labelInScene: 'القطب الموجب (+) والقطب السالب (−)',
    source: 'book',
    pageRef: 89,
    bodyHtml: `<p>للمولّد قطب موجب وقطب سالب. خارج المولّد تكون جهة التيّار الاصطلاحية من القطب الموجب إلى القطب السالب.</p>
      <p>${ref(89, 'اصطلاح أمبير.')}</p>`,
  }),
  Object.freeze({
    id: 'wires',
    title: 'الأسلاك: الموصل الكهربائي',
    labelInScene: 'موصل كهربائي (أسلاك التوصيل)',
    source: 'book',
    pageRef: 89,
    bodyHtml: `<p>الأسلاك هي <strong>الموصل الكهربائي</strong> الذي تتحرّك فيه الإلكترونات الحرّة بين أجزاء الدارة.</p>
      <p>${ref(89, 'الشكل المطبوع يسمّي الموصل الكهربائي.')}</p>`,
  }),
  Object.freeze({
    id: 'lamp',
    title: 'المصباح: الجهاز الكهربائي',
    labelInScene: 'مصباح — جهاز كهربائي يحوّل الطاقة',
    source: 'book',
    pageRef: 89,
    bodyHtml: `<p>المصباح هو الجهاز الذي يعمل في الدارة: تصل إليه الطاقة الكهربائية فيحوّل جزءاً منها إلى ضوء وحرارة.</p>
      <p>${ref(89, 'الشكل المطبوع يسمّي الجهاز الكهربائي.')}</p>
      <p class="u2l2a-inline-note">${ENRICHMENT_LABEL}: تحويل الطاقة في المصباح لا يعني أن الإلكترونات تُستهلك فيه؛ الإلكترونات تستمر في المسار.</p>`,
  }),
  Object.freeze({
    id: 'switch',
    title: 'المفتاح (القاطعة)',
    labelInScene: 'مفتاح — يفتح الدارة ويغلقها',
    source: 'book',
    pageRef: 94,
    bodyHtml: `<p>المفتاح يغلق الدارة فيمرّ التيّار، ويفتحها فينقطع. حتى يمرّ تيار في دارة ما يجب أن تحتوي على مولّد وأن تكون الدارة مغلقة.</p>
      <p>${ref(94, 'من بنود «تعلمتُ».')}</p>`,
  }),
  Object.freeze({
    id: 'energy-path',
    title: 'كيف تصل الطاقة إلى المصباح؟',
    labelInScene: 'مسار الطاقة: من المولّد عبر الموصل إلى المصباح',
    source: 'platform',
    pageRef: 87,
    bodyHtml: `<p>عند غلق الدارة تنتقل الطاقة الكهربائية من المولّد عبر الموصل إلى المصباح، فيحوّل المصباح جزءاً منها إلى ضوء وحرارة، وتستمر الإلكترونات الحرّة في المسار ولا تُستهلك.</p>
      <p>${ENRICHMENT_LABEL}: الطاقة لا يلزم أن يحملها إلكترون واحد بعينه إلى الطرف الآخر؛ الذي ينتشر في الدارة بسرعة كبيرة تقارب سرعة الضوء هو <em>تأثير</em> المولّد، أما الإلكترون نفسه فيزحف ببطء. وهذا لا يناقض ما في الدرس: «التيّار المتواصل انتقال مستمرّ للإلكترونات الحرّة باتجاه واحد».</p>`,
  }),
]);

export const ORIGIN_SCENE_STATES = Object.freeze({
  open: 'الدارة مفتوحة: المفتاح مرفوع، فلا يمرّ تيّار ولا يضيء المصباح.',
  closed: 'الدارة مغلقة: يمرّ التيّار في الدارة فيضيء المصباح، وتنتقل الطاقة من المولّد إلى المصباح.',
});

export const ORIGIN_MODEL_LIMITS = Object.freeze([
  'الرسم توضيحي: أطوال الأسلاك ومواضع الأجهزة لا تمثّل قياسات حقيقية.',
  'المشهد لا يمثّل مقاومة الأسلاك ولا حرارة المولّد ولا سطوع المصباح بدقّة عددية.',
  'الأثر الأزرق المتحرك يمثّل انتقال الطاقة من المولّد إلى المصباح، وهو رسم توضيحي لا صورة حقيقية للطاقة.',
]);

/* The three printed questions, each as a real interactive task. */
export const ORIGIN_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'origin-1',
    kind: 'choice',
    source: 'book',
    pageRef: 87,
    prompt: 'من أين نحصل على الطاقة الكهربائية؟',
    hintHtml: `<p>ارجع إلى الدارة في المشهد: أي جزء منها هو الذي يمدّ الدارة بالطاقة؟</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'generator',
        label: 'من المولّد في الدارة: البطارية أو الخلية الكهربائية أو الخلية الضوئية.',
        correct: true,
        feedbackHtml: `<p>صحيح: المولّد هو <strong>مصدر الطاقة الكهربائية</strong> في الدارة. في هذا الدرس تتحدّث الصفحة 89 عن بعض مولّدات التيّار المستمرّ: الخلايا الكهربائية البسيطة والخلايا الضوئيّة.</p>`,
      }),
      Object.freeze({
        id: 'lamp',
        label: 'من المصباح، لأنه هو الذي يضيء.',
        correct: false,
        feedbackHtml: `<p>المصباح <em>مستهلك</em> لا مصدر: يصل إليه التيّار فيضيء، لكنه لا يمدّ الدارة بالطاقة. المصدر في المشهد هو المولّد.</p>`,
      }),
      Object.freeze({
        id: 'wires',
        label: 'من الأسلاك وحدها، فمنها يمرّ التيّار.',
        correct: false,
        feedbackHtml: `<p>الأسلاك <em>موصل</em>: تتحرّك فيها الإلكترونات الحرّة، لكنها لا تُنتج طاقة. بدون مولّد لا يمرّ تيّار في الدارة.</p>`,
      }),
    ]),
    explanationHtml: `<p>الطاقة الكهربائية في الدارة تأتي من المولّد. الأشياء الأخرى (الأسلاك والمصباح والمفتاح) ليست مصادر: الأسلاك موصل، والمصباح جهاز يحوّل الطاقة، والمفتاح يفتح الدارة ويغلقها.</p>`,
  }),
  Object.freeze({
    id: 'origin-2',
    kind: 'order',
    source: 'book',
    pageRef: 88,
    prompt: 'ما دور المولّد في الدارة؟ رتّب الجمل الثلاث لتحصل على تفسير مترابط.',
    hintHtml: `<p>ابدأ بما هو موجود سلفاً في النّاقل، ثم اذكر ما يفعله المولّد به، ثم النتيجة في دارة مغلقة.</p>`,
    items: Object.freeze([
      Object.freeze({ id: 'motion', label: 'المولّد يُسبّب حركة هذه الإلكترونات الحرّة.', position: 1 }),
      Object.freeze({ id: 'exists', label: 'الإلكترونات الحرّة موجودة سلفاً في النّاقل: المولّد لا يُنتِج إلكترونات جديدة.', position: 0 }),
      Object.freeze({ id: 'result', label: 'فتصير حركة الإلكترونات مستمرّة باتجاه واحد في الدارة المغلقة.', position: 2 }),
    ]),
    explanationHtml: `<p>هذا هو الترتيب المنطقي: الشيء موجود سلفاً ← المولّد يُسبّب حركته ← فتستمرّ الحركة باتجاه واحد.</p>
      <p>${ref(88, 'أستنتج: يُسبّب المولّد الحركة السابقة للإلكترونات.')} ${ref(94, 'من بنود «تعلمتُ»: المولّد لا يُنتِج إلكترونات ولكن يُسبّب حركة الإلكترونات في الدّارة.')}</p>`,
  }),
  Object.freeze({
    id: 'origin-3',
    kind: 'choice',
    source: 'book',
    pageRef: 87,
    prompt: 'كيف انتقلت الطّاقة الكهربائية من المولّد إلى المصباح؟',
    hintHtml: `<p>المفتاح مغلق والدارة مغلقة. اسأل نفسك: هل يجب أن يسافر إلكترون واحد من المولّد إلى المصباح حتى يضيء؟</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'transfer',
        label: 'انتقلت الطاقة من المولّد عبر الدارة المغلقة إلى المصباح، فحوّل المصباح جزءاً منها إلى ضوء وحرارة، والإلكترونات الحرّة لم تُستهلك.',
        correct: true,
        feedbackHtml: `<p>صحيح وهذه هي الفكرة الدقيقة: المصباح جهاز <em>يحوّل</em> الطاقة، ولا يستهلك الإلكترونات. الإلكترونات الحرّة تستمرّ في المسار من الموصل إلى المصباح وإلى بقية الدارة ثم تعود إلى المولّد.</p>`,
      }),
      Object.freeze({
        id: 'electron-travel',
        label: 'سافر إلكترون واحد من المولّد إلى المصباح فاستُهلك فيه وأعطى الضوء.',
        correct: false,
        feedbackHtml: `<p>هذا تصوّر خاطئ: الإلكترونات <strong>لا تُستهلك</strong> في المصباح. الذي يحوّل الطاقة هو المصباح نفسه، والإلكترونات الحرّة تبقى في الدارة وتستمرّ في التحرّك.</p>
        <p>وتذكّر: الإلكترون نفسه يزحف ببطء، أما تأثير المولّد فينتشر في الدارة بسرعة كبيرة.</p>`,
      }),
      Object.freeze({
        id: 'only-closed',
        label: 'انتقلت الطاقة لأن المفتاح كان مفتوحاً فسمح لها بالمرور إلى المصباح.',
        correct: false,
        feedbackHtml: `<p>الخطأ هنا في حالة المفتاح: الطاقة تنتقل عندما تكون الدارة <strong>مغلقة</strong>. المفتاح المفتوح يقطع المسار فلا يمرّ تيّار ولا يضيء المصباح.</p>`,
      }),
      Object.freeze({
        id: 'reverse',
        label: 'المصباح هو الذي أرسل الطاقة إلى المولّد فأضاء.',
        correct: false,
        feedbackHtml: `<p>الاتجاه معكوس: المولّد هو المصدر، والمصباح هو الجهاز الذي يستقبل الطاقة ويحوّلها إلى ضوء وحرارة.</p>`,
      }),
    ]),
    explanationHtml: `<p>حتى يضيء المصباح: مولّد + دارة مغلقة + موصل. تنتقل الطاقة من المولّد إلى الجهاز، فيحوّل الجهاز جزءاً منها إلى ضوء وحرارة، وتستمر الإلكترونات الحرّة في المسار دون أن تُستهلك.</p>`,
  }),
]);

/* ==================================================== station 2 · electrons */

export const ELECTRONS_INTRO_HTML = `
  <p>في الأنبوب الشفّاف بالكتاب، دفعُ كرة جديدة يُخرج كرة من الطرف الآخر، والكرات تمثّل الإلكترونات الحرّة الموجودة سلفاً في السّلك النّاقل. هنا نرى الإلكترونات نفسها: افتح المفتاح وراقب حركتها، ثم أغلقه وراقب الفرق.</p>
  <p>${ref(88, 'تجربة الأنبوب والكرات، واستنتاج: التيّار المتواصل (المستمر) هو انتقال مستمرّ للإلكترونات الحرّة باتجاهٍ واحد في النّاقل الذي يمرّ فيه التيّار.')}</p>`;

export const ELECTRONS_COMPARE = Object.freeze([
  Object.freeze({
    id: 'open',
    title: 'الدارة مفتوحة',
    bodyHtml: `<p>الإلكترونات الحرّة تتحرّك دائماً بحركة عشوائية داخل النّاقل، لكنّها لا تنتقل انتقالاً صافياً في اتجاه واحد: بعضها يذهب يميناً وبعضها يساراً، والمعدّل العام يبقى قريباً من الصفر.</p>`,
  }),
  Object.freeze({
    id: 'closed',
    title: 'الدارة مغلقة',
    bodyHtml: `<p>تُضاف إلى الحركة العشوائية <strong>حركة منظّمة</strong> في اتجاه واحد: هذا هو الانجراف الذي يجعل التيّار الكهربائي متواصلاً. الإلكترونات نفسها لا تُستهلك في المصباح؛ تصل إليه وتستمرّ في المسار.</p>`,
  }),
]);

export const ELECTRONS_READOUT_COPY = Object.freeze({
  state: 'حالة الدارة',
  electrons: 'عدد الإلكترونات في الموصل',
  net: 'معدّل الانتقال الصافي',
  distance: 'معدّل المسافة المقطوعة',
  open: 'مفتوحة — لا تيّار',
  closed: 'مغلقة — تيّار متواصل',
});

export const ELECTRONS_DRIFT_NOTE = `
  <p>${ENRICHMENT_LABEL}: سرعة الانجراف الحقيقية للإلكترونات في سلك معدني صغيرة جداً (أجزاء من المليمتر في الثانية)، ومع ذلك يضيء المصباح في اللحظة التي تُغلق فيها الدارة، لأن <em>تأثير</em> المولّد ينتشر في الدارة بسرعة كبيرة تقارب سرعة الضوء.</p>
  <p>في هذا المشهد نُسرّع حركة الإلكترونات وانتقالها تسريعاً كبيراً لتراها بعينك؛ فالسرعة على الشاشة ليست قياساً فيزيائياً.</p>`;

/** The readout can never claim that electrons are consumed. */
export const ELECTRONS_CONSERVATION_NOTE = 'عدد الإلكترونات الحرّة يبقى ثابتاً قبل المصباح وبعده وفي كل أجزاء الدارة: المصباح يحوّل الطاقة لا الإلكترونات. ولا تُرسم الإلكترونات داخل المولّد نفسه: النموذج يتتبّعها في الأسلاك المعدنية وحدها، ثم تعود إلى الظهور عند الطرف الآخر بالعدد نفسه.';

/* Why the dots stop at the source: one short, honest sentence, printed next to
 * the conservation note and inside the model's limits. */
export const ELECTRONS_GENERATOR_NOTE = `لماذا لا نقاط داخل المولّد؟ لأن انتقال الشحنة داخل المصدر لا يجري كالانجراف في سلك معدني، ولم تحدّد صفحات الدرس جهة له. نكتفي بأن الطرف الموجب والطرف السالب يبقيان مختلفين فيمرّ التيّار، ونرسم مسار الإلكترونات في الأسلاك المعدنية خارج المولّد.`;

export const ELECTRON_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'electrons-1',
    kind: 'choice',
    source: 'platform',
    pageRef: 88,
    prompt: 'ما الذي شاهدناه في الإلكترونات الحرّة عند إغلاق الدارة؟',
    hintHtml: `<p>شغّل النموذج مرّتين: مرّة والمفتاح مفتوح، ومرّة والمفتاح مغلق، وقارن «معدّل الانتقال الصافي».</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'drift-added',
        label: 'حركة عشوائية دائمة، ويُضاف إليها عند إغلاق الدارة انجراف منظّم في اتجاه واحد.',
        correct: true,
        feedbackHtml: `<p>صحيح. الحركة العشوائية لا تتوقف، والتيّار المتواصل هو <em>إضافة</em> انتقال منظّم باتجاه واحد إلى هذه الحركة، ولهذا نسمّيه «انتقالاً مستمرّاً باتجاهٍ واحد».</p>`,
      }),
      Object.freeze({
        id: 'created',
        label: 'الإلكترونات تُنشئها البطارية عند لحظة إغلاق المفتاح.',
        correct: false,
        feedbackHtml: `<p>لا: البطارية لا تُنتج إلكترونات. الإلكترونات الحرّة موجودة سلفاً في النّاقل، والمولّد يُسبّب حركتها كما في استنتاج صفحة 88.</p>`,
      }),
      Object.freeze({
        id: 'straight-line',
        label: 'الإلكترونات تسير في خطوط مستقيمة تماماً بلا أي حركة عشوائية.',
        correct: false,
        feedbackHtml: `<p>الإلكترونات في النّاقل لا تسير في خطوط مستقيمة منتظمة: حركتها تحوي دائماً مكوّناً عشوائياً، والذي يظهر في التيّار هو المعدّل العام في اتجاه واحد.</p>`,
      }),
    ]),
    explanationHtml: `<p>التيّار المتواصل (المستمر) هو انتقال مستمرّ للإلكترونات الحرّة باتجاهٍ واحد في النّاقل الذي يمرّ فيه التيّار. افتح المفتاح: يبقى الانتقال الصافي قريباً من الصفر. أغلقه: يزداد الانتقال الصافي باستمرار.</p>`,
  }),
  Object.freeze({
    id: 'electrons-2',
    kind: 'choice',
    source: 'platform',
    pageRef: 88,
    prompt: 'عند مرور الإلكترونات في المصباح، ماذا يحدث لها؟',
    hintHtml: `<p>راقب عدد الإلكترونات في القراءة أثناء دورانها في الدارة، قبل المصباح وبعده.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'kept',
        label: 'تستمرّ في المسار ولا تُستهلك؛ المصباح يحوّل جزءاً من الطاقة الكهربائية إلى ضوء وحرارة.',
        correct: true,
        feedbackHtml: `<p>إجابة دقيقة. عدد الإلكترونات الحرّة لا يتغيّر: يبقى كما هو قبل المصباح وبعده. والمصباح جهاز يحوّل الطاقة، لا مستهلك للإلكترونات.</p>`,
      }),
      Object.freeze({
        id: 'converted',
        label: 'تتحوّل كلّها إلى ضوء داخل المصباح فتختفي من الدارة.',
        correct: false,
        feedbackHtml: `<p>لو اختفت الإلكترونات لتوقّف التيّار بعد المصباح، لكن الكتاب يقول إن شِدّة التيّار ثابتة في كل أجزاء الدارة الموصولة على التسلسل (ص92). الإلكترونات تبقى، والذي يتغيّر هو شكل الطاقة.</p>`,
      }),
      Object.freeze({
        id: 'stored',
        label: 'تبقى محبوسة داخل المصباح بعد وصولها إليه.',
        correct: false,
        feedbackHtml: `<p>لا: لو بقيت الإلكترونات داخل المصباح لتوقّف المسار بعد لحظات. الإلكترونات تمرّ وتُكمل دورتها ثم تعود إلى المولّد.</p>`,
      }),
    ]),
    explanationHtml: `<p>${ELECTRONS_CONSERVATION_NOTE}</p><p class="u2l2a-inline-note">وهذا لا يعني أن الإلكترونات هي «مصدر الطاقة»: مصدر الطاقة هو المولّد، والمصباح هو الذي يحوّل جزءاً منها إلى ضوء وحرارة.</p>`,
  }),
]);

export const ELECTRONS_MODEL_LIMITS = Object.freeze([
  'النموذج يمثّل الإلكترونات بنقاط متحرّكة على مسار الدارة، ولا يمثّل الذرّات ولا التصادمات داخل الشبكة البلورية.',
  'سرعات الحركة على الشاشة مُكبَّرة بشكل كبير لتبدو مرئية.',
  'النموذج لا يمثّل مقاومة ولا علاقة الجهد بالتيّار، بل يقتصر على معنى التيّار المتواصل وجهة حركة الإلكترونات.',
  'النموذج لا يمثّل انتقال الشحنة داخل المولّد: لا تُرسم إلكترونات داخله ولا تُنسب إليها جهة هناك.',
]);

/* ==================================================== station 3 · direction */

export const DIRECTION_INTRO_HTML = `
  <p>اصطلح العالم أمبير أن جهة التيّار الكهربائي خارج المولّد من القطب الموجب إلى القطب السالب، وذلك عكس جهة حركة الإلكترونات في السلك المعدني.</p>
  <p>${ref(89, '«اصطلاح» — الشكل المطبوع يحوي دارة وأسهم e مع جهة التيار.')}</p>
  <p>استخدم المفاتيح الثلاثة لإظهار كل جهة على حدة أو معاً، ثم أجب عن السؤالين.</p>`;

export const DIRECTION_TOGGLES = Object.freeze([
  Object.freeze({ id: 'current', label: 'أظهر جهة التيّار الاصطلاحية', short: 'جهة التيّار' }),
  Object.freeze({ id: 'electrons', label: 'أظهر جهة انجراف الإلكترونات', short: 'جهة الإلكترونات' }),
  Object.freeze({ id: 'energy', label: 'أظهر اتجاه انتقال الطاقة إلى الجهاز', short: 'انتقال الطاقة' }),
]);

export const DIRECTION_LEGEND = Object.freeze([
  Object.freeze({
    id: 'current',
    swatch: 'current',
    title: 'التيّار الاصطلاحي',
    bodyHtml: `أسهم نحاسية مكتوب بجانب كل منها «${ARROW_CAPTION_COPY.current}»: جهة التيّار ${S_I} خارج المولّد من الموجب (+) إلى السالب (−) — اصطلاح أمبير. ${ref(89)}`,
  }),
  Object.freeze({
    id: 'electrons',
    swatch: 'electrons',
    title: 'انجراف الإلكترونات',
    bodyHtml: `أسهم زرقاء مكتوب بجانب كل منها «${ARROW_CAPTION_COPY.electron}»: جهة انجراف الإلكترونات الحرّة ${S_ELECTRON} خارج المولّد من السالب (−) إلى الموجب (+) — عكس جهة التيّار. ${ref(88)}`,
  }),
  Object.freeze({
    id: 'energy',
    swatch: 'energy',
    title: 'انتقال الطاقة',
    bodyHtml: `قوس ذهبي: الطاقة تنتقل من المولّد إلى الجهاز الذي يعمل في الدارة. ${ENRICHMENT_LABEL}: هذا سؤال مختلف عن جهة حركة الإلكترونات، فلا تستنتج أحدهما من الآخر.`,
  }),
]);

/* Printed under the direction figure: one sentence that says which word belongs
 * to which arrow, so colour is never the only key. */
export const DIRECTION_LEGEND_NOTE = `كل سهم يحمل اسمه: «${ARROW_CAPTION_COPY.current}» على الأسهم النحاسية لجهة التيّار الاصطلاحية، و«${ARROW_CAPTION_COPY.electron}» على الأسهم الزرقاء لجهة انجراف الإلكترونات الحرّة، والقوس الذهبي وحده يمثّل انتقال الطاقة إلى الجهاز. والسهمان على القطعة نفسها من السلك متعاكسان دائماً خارج المولّد.`;

export const DIRECTION_MIX_CARD = Object.freeze({
  title: 'ثلاثة أشياء لا تُخلط',
  rows: Object.freeze([
    Object.freeze({ id: 'conventional', title: 'جهة التيّار الاصطلاحية', bodyHtml: `خارج المولّد: من القطب الموجب إلى القطب السالب. ${ref(89)}` }),
    Object.freeze({ id: 'electron', title: 'جهة انجراف الإلكترونات الحرّة', bodyHtml: `خارج المولّد: من القطب السالب إلى القطب الموجب. ${ref(88)}` }),
    Object.freeze({ id: 'energy', title: 'اتجاه انتقال الطاقة إلى الجهاز', bodyHtml: 'من المولّد إلى الجهاز الذي يعمل: هذا اتجاه ثالث مستقلّ عن الاثنين السابقين.' }),
  ]),
});

/*
 * The one statement the appendix makes about the inside of the generator, and
 * the one it refuses to make. The current is a closed circulation, so it must
 * return from − to + inside the source; the *carriers* inside a source are not
 * the free electrons of a metal wire, the audited lesson never states their
 * direction, and no lesson objective needs it — so no electron arrow is drawn
 * there and no direction is claimed for one.
 */
export const DIRECTION_INSIDE_NOTE = `
  <p>التيّار الكهربائي دورة واحدة مغلقة: خارج المولّد من القطب الموجب إلى القطب السالب، ويعود <em>داخل</em> المولّد من القطب السالب إلى القطب الموجب، فيُغلق المسار بلا نقطة انقطاع. السهم الوحيد المرسوم داخل المولّد يمثّل هذه العودة.</p>
  <p>${ENRICHMENT_LABEL}: لا نرسم حركة الإلكترونات داخل المولّد ولا نحدّد لها جهة فيه، لأن انتقال الشحنة داخل المصدر يجري بآلية مختلفة عن الانجراف في السلك المعدني، وليس في أهداف هذا الدرس ولا في صفحاته (87–96) ما يحدّده. أمّا في الأسلاك المعدنية خارج المولّد فحركة الإلكترونات الحرّة موضّحة بأسهمها ومسماة باسمها.</p>`;

export const DIRECTION_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'direction-1',
    kind: 'choice',
    source: 'book',
    pageRef: 89,
    prompt: 'خارج المولّد، ما جهة التيّار الكهربائيّ الاصطلاحية؟',
    hintHtml: `<p>تذكّر اصطلاح أمبير في صفحة 89، ولا تخلطه بجهة حركة الإلكترونات.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'pos-to-neg',
        label: 'من القطب الموجب (+) إلى القطب السالب (−).',
        correct: true,
        feedbackHtml: `<p>صحيح: هذا هو اصطلاح أمبير، وهو أيضاً ما ورد في بنود «تعلمتُ» صفحة 94: جهة التيّار من القطب الموجب للمولّد إلى القطب السّالب خارج المولّد.</p>`,
      }),
      Object.freeze({
        id: 'neg-to-pos',
        label: 'من القطب السالب (−) إلى القطب الموجب (+).',
        correct: false,
        feedbackHtml: `<p>هذه هي جهة <strong>حركة الإلكترونات الحرّة</strong> خارج المولّد، لا جهة التيّار الاصطلاحية. الجهتان متعاكستان.</p>`,
      }),
      Object.freeze({
        id: 'random',
        label: 'لا توجد جهة محدّدة، لأن الحركة عشوائية.',
        correct: false,
        feedbackHtml: `<p>الحركة العشوائية موجودة على مستوى الإلكترون الواحد، لكن في التيّار المتواصل توجد جهة عامّة منظّمة، ويسمّيها الاصطلاح من الموجب إلى السالب خارج المولّد.</p>`,
      }),
    ]),
    explanationHtml: `<p>خارج المولّد: التيّار من الموجب إلى السالب، والإلكترونات من السالب إلى الموجب. الاثنان في الدارة نفسها، لكن في اتجاهين متعاكسين.</p>`,
  }),
  Object.freeze({
    id: 'direction-2',
    kind: 'choice',
    source: 'book',
    pageRef: 89,
    prompt: 'في موصل معدني، ما العلاقة بين جهة التيّار الاصطلاحية وجهة انجراف الإلكترونات الحرّة؟',
    hintHtml: `<p>ارسم في ذهنك سهماً لكل جهة على السلك نفسه في المشهد.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'opposite',
        label: 'متعاكستان: الإلكترونات تتحرّك عكس جهة التيّار الاصطلاحية.',
        correct: true,
        feedbackHtml: `<p>صحيح. الاصطلاح اختير قبل معرفة الإلكترون، ثم بقي لأن نتائج الحسابات لا تتغيّر في هذا المستوى. المهمّ أن تتذكّر التعاكس خارج المولّد.</p>`,
      }),
      Object.freeze({
        id: 'same',
        label: 'متماثلتان: الإلكترونات تتحرّك في جهة التيّار نفسها.',
        correct: false,
        feedbackHtml: `<p>غير صحيح: الكتاب ينصّ على أن جهة التيّار الاصطلاحية <em>عكس</em> جهة حركة الإلكترونات.</p>`,
      }),
      Object.freeze({
        id: 'unrelated',
        label: 'لا علاقة بينهما: كلّ جهة تخصّ ظاهرة مختلفة تماماً.',
        correct: false,
        feedbackHtml: `<p>هما ظاهرتان متلازمتان في الموصل نفسه: انجراف الإلكترونات هو ما يُكوّن التيّار، والاصطلاح يصف جهته بالعكس.</p>`,
      }),
    ]),
    explanationHtml: `<p>الجهتان تُرسمان على السلك نفسه: سهم نحاسي للتيّار الاصطلاحي، وسهم أزرق للإلكترونات، وكلٌّ منهما في الجهة المعاكسة للآخر.</p>`,
  }),
]);

/* ====================================================== station 4 · ammeter */

export const AMMETER_INTRO_HTML = `
  <p>تقاس شِدّة التيّار الكهربائي عمليّاً باستخدام مقياس الأمبير الذي يُوصل على التّسلسُل في الدارة الكهربائية.</p>
  <p>${ref(92, 'نصّ الصفحة، والشكل يبيّن مقياساً بمدرّج وقطبين.')}</p>
  <p>شِدّة التيّار هي كمية الكهرباء المارّة عبر مقطع النّاقل خلال واحدة الزّمن؛ غيّر كمية الكهرباء أو الزمن وراقب مؤشّر المقياس.</p>`;

export const AMMETER_BOOK_VALUE = Object.freeze({
  current: 0.2,
  label: '200 mA في دارة التسلسل — قيمة مطبوعة في الكتاب، صفحة 92',
  noteHtml: `في دارة التسلسل بالصفحة 92 يقرأ المقياسان ${S_MA_CONVERSION}. زرّ «اضبط المقياس على قيمة الكتاب» يجعل المقياس يشير إلى هذه القيمة نفسها، أما قيمتا كمية الكهرباء والزمن في النموذج فهما من إعداد المنصة (20 C خلال 100 s) لإظهار القراءة المطبوعة.`,
});

export const AMMETER_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'ammeter-1',
    kind: 'choice',
    source: 'platform',
    pageRef: 90,
    prompt: 'ماذا يحدث لشِدّة التيّار عند زيادة كمية الكهرباء المارّة خلال الزمن نفسه؟',
    hintHtml: `<p>ارفع المنزلق الخاص بكمية الكهرباء دون أن تلمس منزلق الزمن، وراقب مؤشّر المقياس.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'increase',
        label: 'تزيد شِدّة التيّار.',
        correct: true,
        feedbackHtml: `<p>صحيح. شِدّة التيّار هي كمية الكهرباء في واحدة الزمن: إذا كبر البسط ${S_Q} وبقي المقام ${S_T}، يكبر الكسر.</p>`,
      }),
      Object.freeze({
        id: 'decrease',
        label: 'تقلّ شِدّة التيّار.',
        correct: false,
        feedbackHtml: `<p>الكمية الأكبر في الزمن نفسه تعني كهرباء أكثر تمرّ كل ثانية، أي شِدّة أكبر لا أصغر. جرّب المنزلق وراقب المؤشّر.</p>`,
      }),
      Object.freeze({
        id: 'unchanged',
        label: 'لا تتغيّر شِدّة التيّار.',
        correct: false,
        feedbackHtml: `<p>تتغيّر: النسبة بين كمية الكهرباء والزمن تتغيّر مع كمية الكهرباء، وشِدّة التيّار هي هذه النسبة نفسها.</p>`,
      }),
    ]),
    explanationHtml: `<p>قاعدة مفيدة: <strong>تزيد الكمية مع ثبات الزمن ⇒ تزيد شِدّة التيّار</strong>، بنسبة الزيادة نفسها.</p>`,
  }),
  Object.freeze({
    id: 'ammeter-2',
    kind: 'choice',
    source: 'platform',
    pageRef: 90,
    prompt: 'ماذا يحدث لشِدّة التيّار عند زيادة الزمن مع ثبات كمية الكهرباء؟',
    hintHtml: `<p>ارفع منزلق الزمن فقط، ولاحظ مؤشّر المقياس.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'decrease',
        label: 'تقلّ شِدّة التيّار.',
        correct: true,
        feedbackHtml: `<p>صحيح. الزمن نفسه صار أطول لكمية الكهرباء نفسها، فتمرّ كل ثانية كمية أقلّ: شِدّة التيّار تقلّ.</p>`,
      }),
      Object.freeze({
        id: 'increase',
        label: 'تزيد شِدّة التيّار.',
        correct: false,
        feedbackHtml: `<p>الزمن في المقام: زيادة المقام مع ثبات البسط تُصغّر النسبة، فشِدّة التيّار تقلّ لا تزيد.</p>`,
      }),
      Object.freeze({
        id: 'unchanged',
        label: 'لا تتغيّر شِدّة التيّار.',
        correct: false,
        feedbackHtml: `<p>تقلّ: كمية الكهرباء هي نفسها لكن توزّعت على زمن أطول، فصارت الحصّة في الثانية أصغر.</p>`,
      }),
    ]),
    explanationHtml: `<p>قاعدة مفيدة: <strong>يزيد الزمن مع ثبات الكمية ⇒ تقلّ شِدّة التيّار</strong>.</p>`,
  }),
  Object.freeze({
    id: 'ammeter-3',
    kind: 'choice',
    source: 'platform',
    pageRef: 91,
    prompt: 'كيف نفسّر قراءة مقياس التيّار في هذا النموذج؟',
    hintHtml: `<p>انظر إلى التعويض المكتوب تحت اللوح: ما البسط؟ وما المقام؟</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'divide',
        label: `نقسم كمية الكهرباء المارّة على الزمن، ${tex('I=\\dfrac{Q}{t}', 'I equals Q over t')}، ثم نعطي الناتج بوحدة الأمبير على تدريج المقياس.`,
        correct: true,
        feedbackHtml: `<p>هذا هو التفسير الصحيح، وهو معنى تعريف الأمبير في الصفحة 91: ${S_AMPERE_DEF} — أي كولوم واحد في الثانية الواحدة.</p>`,
      }),
      Object.freeze({
        id: 'multiply',
        label: `نضرب كمية الكهرباء في الزمن، ${tex('I=Q\\times t', 'I equals Q times t')}.`,
        correct: false,
        feedbackHtml: `<p>الضرب يعطي كمية الكهرباء ${S_Q} عندما نعرف ${S_I} و${S_T}، ولا يعطي شِدّة التيّار. شِدّة التيّار نسبة: قسمة لا ضرب.</p>`,
      }),
      Object.freeze({
        id: 'readonly',
        label: 'نقرأ الرقم المكتوب على المقياس نفسه دون أي حساب.',
        correct: false,
        feedbackHtml: `<p>قراءة المقياس نتيجة، وسببها حساب: المؤشّر يشير إلى قيمة النسبة بين كمية الكهرباء والزمن. السؤال «كيف فسّرناها» يريد هذا الحساب.</p>`,
      }),
    ]),
    explanationHtml: `<p>قراءة المقياس ليست رقماً عشوائياً: هي ناتج ${tex('Q \\div t', 'Q divided by t')} بوحدة الأمبير، ويمكن أن تُعرض بمضاعفاتها مثل الميلي أمبير كما في ${ref(92)}.</p>`,
  }),
  Object.freeze({
    id: 'ammeter-connection',
    kind: 'choice',
    source: 'book',
    pageRef: 92,
    prompt: 'أين يُوصل مقياس الأمبير في الدارة؟',
    hintHtml: `<p>الكتاب يذكر صراحةً طريقة الوصل في صفحة 92.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'series',
        label: 'على التّسلسُل في الدارة، حتى يمرّ فيه التيّار المقيس نفسه.',
        correct: true,
        feedbackHtml: `<p>صحيح: النصّ المطبوع ينصّ على أن مقياس الأمبير يُوصل على التّسلسُل في الدّارة الكهربائيّة.</p>`,
      }),
      Object.freeze({
        id: 'parallel',
        label: 'على التفرّع مع المصباح، بجانبه.',
        correct: false,
        feedbackHtml: `<p>الوصل على التفرّع يجعل المقياس مساراً جانبياً، فلا يمرّ فيه التيّار المقيس كما ينبغي. الكتاب يطلب الوصل على التّسلسُل.</p>`,
      }),
      Object.freeze({
        id: 'never',
        label: 'لا يوصل أبداً في الدارة، بل يقاس من بعيد.',
        correct: false,
        feedbackHtml: `<p>يوصل داخل الدارة على التّسلسُل. القياس يحتاج أن يكون المقياس جزءاً من المسار.</p>`,
      }),
    ]),
    explanationHtml: `<p>لماذا التّسلسُل؟ لأنّ شِدّة التيّار يجب أن تُقاس في المسار نفسه الذي يمرّ فيه التيّار، ولأنّ شِدّة التيّار ثابتة في كل أجزاء الدارة الموصولة على التّسلسُل.</p>`,
  }),
]);

export const AMMETER_MODEL_LIMITS = Object.freeze([
  'المنزلقات تتحرّك بخطوات تعليمية (10 C و10 s) لتبقى النتائج واضحة، ولا تمثّل قياساً حقيقياً في مختبر.',
  'مقياس الأمبير هنا رسم توضيحي بمدرّج من 0 إلى 12 A؛ الأجهزة الحقيقية تختلف في المدى والدقّة.',
  `القيمة ${S_MA_CONVERSION} مطبوعة في الكتاب (ص92)، أما أزواج القيم الأخرى فهي أمثلة إثرائية من إعداد المنصة.`,
]);

/* ===================================================== station 5 · relation */

export const RELATION_INTRO_HTML = `
  <p>شِدّة التيّار الكهربائي ${S_I} هي كمية الكهرباء ${S_Q} المارّة عبر مقطع دارة كهربائية خلال واحدة الزمن ${S_T}. وتُحسب من العلاقة المطبوعة في صفحة 91.</p>
  <p>${ref(91, 'العلاقة والوحدات وتعريف الأمبير.')}</p>`;

export const RELATION_FORMS = Object.freeze([
  Object.freeze({
    id: 'current',
    title: 'إذا كانت المطلوبة شِدّة التيّار',
    html: RELATION_HTML,
    bodyHtml: `<p>نقسم كمية الكهرباء المارّة على زمن مرورها.</p>`,
    target: 'I',
  }),
  Object.freeze({
    id: 'charge',
    title: 'إذا كانت المطلوبة كمية الكهرباء',
    html: CHARGE_FORM_HTML,
    bodyHtml: `<p>نضرب شِدّة التيّار في الزمن. ملاحظة: يجب أن يكون الزمن بالثواني قبل الضرب.</p>`,
    target: 'Q',
  }),
  Object.freeze({
    id: 'time',
    title: 'إذا كان المطلوب الزمن',
    html: TIME_FORM_HTML,
    bodyHtml: `<p>نقسم كمية الكهرباء على شِدّة التيّار، ولا يصحّ القسمة على شِدّة تيّار صفرية.</p>`,
    target: 't',
  }),
]);

export const SYMBOL_LEGEND = Object.freeze([
  Object.freeze({ symbol: S_I, name: 'شِدّة التيّار الكهربائي', unit: `${S_A} — أمبير`, bookNote: `الرمز ${S_I} مطبوع في الكتاب.` }),
  Object.freeze({ symbol: S_Q, name: 'كميّة الكهرباء (الشحنة المارّة)', unit: `${S_C} — كولوم`, bookNote: `الكتاب يرمز إليها بـ ${S_Q_BOOK} في الصفحتين 90 و91؛ ${ltrText('Q')} و${S_Q_BOOK} هنا الكمية نفسها.` }),
  Object.freeze({ symbol: S_T, name: 'الزمن', unit: `${S_S} — ثانية`, bookNote: `الرمز ${S_T} مطبوع في الكتاب، والوحدة الثانية.` }),
]);

export const AMPERE_DEFINITION_HTML = `
  <p>الأمبير: شِدّة تيّار كهربائي ناتج عن مرور كمية من الكهرباء قدرها ${tex('1\\,\\mathrm{C}', 'one coulomb')} خلال ${tex('1\\,\\mathrm{s}', 'one second')} عبر مقطع الدارة.</p>
  <p>${ref(91)} مضاعفات الأمبير: كيلو أمبير ${tex('1\\,\\mathrm{kA}=10^{3}\\,\\mathrm{A}', 'one kiloampere equals ten to the three amperes')}، وأجزاؤه: ميلي أمبير ${tex('1\\,\\mathrm{mA}=10^{-3}\\,\\mathrm{A}', 'one milliampere equals ten to the minus three amperes')}، وميكرو أمبير ${tex('1\\,\\mu\\mathrm{A}=10^{-6}\\,\\mathrm{A}', 'one microampere equals ten to the minus six amperes')}.`;

export const CALCULATOR_COPY = Object.freeze({
  heading: 'حاسبة I و Q و t',
  intro: 'اختر الكمية المطلوبة، أدخل القيمتين المعروفتين ووحدتيهما، ثم اقرأ خطوات الحلّ واحدة بعد الأخرى.',
  targetLegend: 'الكمية المطلوبة',
  compute: 'احسب',
  reset: 'إعادة الضبط',
  stepsHeading: 'خطوات التعويض والحساب',
  liveNote: 'تتحدّث النتائج مباشرةً عند تغيير أي قيمة، ويبقى زرّ «احسب» لإعادة الحساب والتأكيد.',
  invalidHeading: 'راجع المدخلات',
  validHeading: 'النتيجة',
  unitLabel: 'الوحدة',
  graphNote: 'القيم الابتدائية مأخوذة من التطبيق المحلول في الكتاب صفحة 91: كمية كهرباء 60 C خلال 30 s ⇒ شِدّة تيّار 2 A.',
  labels: Object.freeze({ Q: 'كمية الكهرباء Q', I: 'شِدّة التيار I', t: 'الزمن t' }),
  unitNames: Object.freeze({ A: 'أمبير (A)', mA: 'ميلي أمبير (mA)', C: 'كولوم (C)', s: 'ثانية (s)', min: 'دقيقة (min)' }),
  exactNote: 'كل النتائج محسوبة من I = Q/t مباشرةً داخل الحاسبة، والقيم غير الابتدائية أمثلة إثرائية من إعداد المنصة.',
});

export const RELATION_CHALLENGES = Object.freeze([
  Object.freeze({
    id: 'relation-change-q',
    kind: 'choice',
    source: 'platform',
    pageRef: 91,
    prompt: 'ثبّتنا الزمن، وزِدنا كمية الكهرباء المارّة خلاله. ماذا يحدث لشِدّة التيّار؟',
    hintHtml: `<p>افتح الحاسبة، واضبط المطلوب على ${S_I}، ثم ضاعف قيمة ${S_Q} واترك ${S_T} كما هو.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'increase',
        label: 'تزيد شِدّة التيّار بنسبة الزيادة نفسها.',
        correct: true,
        feedbackHtml: `<p>صحيح: ${S_I} و${S_Q} متناسبان طرداً عند ثبات ${S_T}. ضاعف الكمية ⇒ تتضاعف شِدّة التيّار.</p>`,
      }),
      Object.freeze({
        id: 'decrease',
        label: 'تقلّ شِدّة التيّار.',
        correct: false,
        feedbackHtml: `<p>الكمية في البسط: زيادتها تزيد النسبة. جرّب في الحاسبة: ${tex('I=\\dfrac{120}{30}=4\\,\\mathrm{A}', 'I equals 120 over 30 equals 4 A')} بعد أن كانت ${tex('2\\,\\mathrm{A}', '2 A')}.</p>`,
      }),
      Object.freeze({
        id: 'unchanged',
        label: 'لا تتغيّر، لأن الزمن لم يتغيّر.',
        correct: false,
        feedbackHtml: `<p>ثبات الزمن لا يمنع التغيّر: الكمية هي المقسوم عليه، فتغيّرها يغيّر الناتج.</p>`,
      }),
    ]),
    explanationHtml: `<p>عند ثبات الزمن: <strong>${tex('Q \\times 2 \\Rightarrow I \\times 2', 'doubling Q doubles I')}</strong>، وكذلك الضرب في أي معامل موجب.</p>`,
  }),
  Object.freeze({
    id: 'relation-change-t',
    kind: 'choice',
    source: 'platform',
    pageRef: 91,
    prompt: 'ثبّتنا كمية الكهرباء، وزِدنا الزمن. ماذا يحدث لشِدّة التيّار؟',
    hintHtml: `<p>اضبط المطلوب على ${S_I}، ثم ضاعف قيمة ${S_T} واترك ${S_Q} كما هو.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'decrease',
        label: 'تقلّ شِدّة التيّار بنسبة زيادة الزمن.',
        correct: true,
        feedbackHtml: `<p>صحيح: الزمن في المقام. ${tex('I=\\dfrac{60}{60}=1\\,\\mathrm{A}', 'I equals 60 over 60 equals 1 A')} بعد أن كانت ${tex('2\\,\\mathrm{A}', '2 A')} عند زمن نصفه.</p>`,
      }),
      Object.freeze({
        id: 'increase',
        label: 'تزيد شِدّة التيّار.',
        correct: false,
        feedbackHtml: `<p>زيادة المقام مع ثبات البسط تصغّر الناتج، فشِدّة التيّار تقلّ.</p>`,
      }),
      Object.freeze({
        id: 'unchanged',
        label: 'لا تتغيّر، لأن كمية الكهرباء هي نفسها.',
        correct: false,
        feedbackHtml: `<p>الكمية نفسها لكن في زمن أطول: الحصّة في الثانية الواحدة تصغر، وشِدّة التيّار هي هذه الحصّة.</p>`,
      }),
    ]),
    explanationHtml: `<p>عند ثبات كمية الكهرباء: <strong>يتناسب الزمن عكساً مع شِدّة التيّار</strong>.</p>`,
  }),
  Object.freeze({
    id: 'relation-number',
    kind: 'number',
    source: 'platform',
    pageRef: 91,
    prompt: 'مثال إثرائي من إعداد المنصة: مرّت كمية من الكهرباء قدرها 45 C خلال 15 s في دارة تيّار متواصل. احسب شِدّة التيّار بالأمبير.',
    unit: 'A',
    expected: 3,
    tolerance: 1e-9,
    hintHtml: `<p>استخدم ${tex('I=\\dfrac{Q}{t}', 'I equals Q over t')} ثم أدخل الناتج في الحقل.</p>`,
    solutionHtml: `<p>${tex('I=\\dfrac{45\\,\\mathrm{C}}{15\\,\\mathrm{s}}=3\\,\\mathrm{A}', 'I equals 45 coulomb over 15 seconds equals 3 A')}</p>`,
    explanationHtml: `<p>قسمة كمية الكهرباء على الزمن تعطي شِدّة التيّار: 45 على 15 يساوي 3، والوحدة أمبير.</p>`,
  }),
  Object.freeze({
    id: 'relation-units',
    kind: 'choice',
    source: 'book',
    pageRef: 91,
    prompt: 'ما وحدة قياس شِدّة التيّار، وما وحدة قياس كمية الكهرباء؟',
    hintHtml: `<p>الوحدات مكتوبة صراحةً في صفحة 91 بجانب كل رمز.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'a-c',
        label: `شِدّة التيّار ${S_A} (أمبير)، وكمية الكهرباء ${S_C} (كولوم).`,
        correct: true,
        feedbackHtml: `<p>صحيح، وهذا هو تعريف الأمبير: ${S_AMPERE_DEF}.</p>`,
      }),
      Object.freeze({
        id: 'c-a',
        label: `شِدّة التيّار ${S_C} (كولوم)، وكمية الكهرباء ${S_A} (أمبير).`,
        correct: false,
        feedbackHtml: `<p>مقلوب: الأمبير لشِدّة التيّار، والكولوم لكمية الكهرباء. لا تخلط الرمزين: ${S_I} بالأمبير و${S_Q} بالكولوم.</p>`,
      }),
      Object.freeze({
        id: 's-c',
        label: `شِدّة التيّار ${S_S} (ثانية)، وكمية الكهرباء ${S_C} (كولوم).`,
        correct: false,
        feedbackHtml: `<p>الثانية وحدة الزمن ${S_T} لا وحدة شِدّة التيّار. شِدّة التيّار ${S_I} تُقاس بالأمبير.</p>`,
      }),
    ]),
    explanationHtml: `<p>${S_I} بالأمبير، ${S_Q} بالكولوم، ${S_T} بالثانية؛ ومن هذه الوحدات تُبنى العلاقة: كولوم ÷ ثانية = أمبير.</p>`,
  }),
]);

export const RELATION_MODEL_LIMITS = Object.freeze([
  'الحاسبة نموذج تعليمي: تفترض تياراً متواصلاً ثابتاً في دارة مغلقة، ولا تمثّل مقاومة ولا حرارة.',
  'النتائج تُعرض بعدد محدود من المنازل العشرية، ولذلك قد تظهر قيمة قرينة مثل 0.3333 بدل الكسر الدوري.',
  'الأعداد الابتدائية من الكتاب (ص91)، وما عداها أمثلة إثرائية من إعداد المنصة ومكتوب بجانبها ذلك.',
]);

/* ===================================================== station 6 · detective */

export const DETECTIVE_INTRO_HTML = `
  <p>سبع مهامّ في سيناريو واحد: ورشة صغيرة فيها دائرة بمولّد ومصباح ومفتاح ومقياس أمبير. ابدأ من الأسهل ثم تدرّج. لا تُكشف الإجابة قبل ضغط «تحقّق»، وبعدها يأتي التفسير كاملاً.</p>
  <p>${ref(87)} هذا التحدّي من إعداد المنصة (${NOT_BOOK_LABEL})، ولا يُسجَّل ضمن اختبار الدرس ولا منطقة المعلم.</p>`;

export const DETECTIVE_SCENARIO_HTML = `
  <h3>السيناريو</h3>
  <p>في ورشة المدرسة دارة كهربائية بمولّد ومصباح ومفتاح ومقياس أمبير موضوع على التّسلسُل. طُلب منك أن تشرح لزملائك ما يجري في هذه الدارة: من أين تأتي الطاقة؟ ما الذي يفعل المولّد؟ وفي أي جهة يسير التيّار؟ ثم أن تحسب كمية الكهرباء.</p>`;

export const DETECTIVE_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'detective-1',
    kind: 'choice',
    source: 'book',
    pageRef: 87,
    prompt: '١) في هذه الورشة، ما هو مصدر الطاقة الكهربائية في الدارة؟',
    hintHtml: `<p>ابحث عن العنصر الذي يمثّل مولّداً في السيناريو.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'generator',
        label: 'المولّد في الدارة.',
        correct: true,
        feedbackHtml: `<p>صحيح: المولّد هو مصدر الطاقة الكهربائية، وهو الذي يُسبّب حركة الإلكترونات الحرّة في الدارة.</p>`,
      }),
      Object.freeze({
        id: 'ammeter',
        label: 'مقياس الأمبير، لأنه يقرأ التيّار.',
        correct: false,
        feedbackHtml: `<p>مقياس الأمبير جهاز قياس: يقيس شِدّة التيّار ولا يمدّ الدارة بطاقة.</p>`,
      }),
      Object.freeze({
        id: 'lamp',
        label: 'المصباح، لأن الضوء طاقة.',
        correct: false,
        feedbackHtml: `<p>المصباح يحوّل الطاقة التي تصله إلى ضوء وحرارة، لكنه لا يُنتج الطاقة ولا يمدّ الدارة بها.</p>`,
      }),
    ]),
    explanationHtml: `<p>ترتيب الأدوار في الدارة: المولّد مصدر، والأسلاك موصل، والمصباح جهاز يحوّل الطاقة، والمفتاح يفتح ويغلق، والمقياس يقيس.</p>`,
  }),
  Object.freeze({
    id: 'detective-2',
    kind: 'choice',
    source: 'book',
    pageRef: 94,
    prompt: '٢) أحد الزملاء قال: «المولّد يُنتج الإلكترونات التي يدفعها في الأسلاك». ما التصحيح العلمي؟',
    hintHtml: `<p>هذا البند مكتوب حرفياً في قائمة «تعلمتُ» صفحة 94.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'causes',
        label: 'المولّد لا يُنتِج إلكترونات، لكنه يُسبّب حركة الإلكترونات الموجودة في الدارة.',
        correct: true,
        feedbackHtml: `<p>هذا هو التصحيح نفسه الذي ورد في بنود «تعلمتُ»: المولّد لا يُنتِج إلكترونات ولكن يُسبّب حركة الإلكترونات في الدّارة.</p>`,
      }),
      Object.freeze({
        id: 'produces',
        label: 'المولّد يُنتج إلكترونات جديدة عند كل ثانية، ولهذا يستمرّ التيّار.',
        correct: false,
        feedbackHtml: `<p>غير صحيح: الإلكترونات الحرّة موجودة سلفاً في النّاقل، واستنتاج صفحة 88 يذكر أن المولّد يُسبّب حركتها.</p>`,
      }),
      Object.freeze({
        id: 'consumes',
        label: 'المولّد يستهلك إلكترونات المصباح ويعيد إنتاجها.',
        correct: false,
        feedbackHtml: `<p>لا يوجد استهلاك للإلكترونات في الدارة، لا في المصباح ولا في المولّد. الذي يتغيّر هو شكل الطاقة.</p>`,
      }),
    ]),
    explanationHtml: `<p>الإلكترونات الحرّة موجودة سلفاً في النّاقل، والمولّد يمنحها حركة منظّمة مستمرّة باتجاه واحد.</p>`,
  }),
  Object.freeze({
    id: 'detective-3',
    kind: 'choice',
    source: 'book',
    pageRef: 94,
    prompt: '٣) المفتاح مفتوح. أراد زميلك أن يمرّ التيّار في الدارة. ما الشرط اللازم؟',
    hintHtml: `<p>من بنود «تعلمتُ»: حتى يمرّ تيّار في دارة ما يجب أن تحتوي على مولّد وأن تكون الدّارة مغلقة.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'closed',
        label: 'أن تكون الدارة مغلقة ويوجد مولّد في الدارة.',
        correct: true,
        feedbackHtml: `<p>صحيح. المولّد وحده لا يكفي، والدائرة المغلقة وحدها لا تكفي: الاثنان شرطان معاً.</p>`,
      }),
      Object.freeze({
        id: 'more-lamps',
        label: 'أن نضيف مصباحاً آخر إلى الدارة.',
        correct: false,
        feedbackHtml: `<p>إضافة جهاز لا تُغلق المسار. المطلوب مسار مغلق يحتوي مولّداً.</p>`,
      }),
      Object.freeze({
        id: 'bigger-wire',
        label: 'أن نستبدل الأسلاك بأسلاك أثخن.',
        correct: false,
        feedbackHtml: `<p>السلك الأثخن لا يغلق دارة مفتوحة. الشرط هو وجود مولّد ودارة مغلقة.</p>`,
      }),
    ]),
    explanationHtml: `<p>الشرطان معاً: مولّد + دارة مغلقة. ولا تنسَ أن فتح أي جزء في دارة موصولة على التّسلسُل يقطع التيّار عن الدارة كلّها.</p>`,
  }),
  Object.freeze({
    id: 'detective-4',
    kind: 'order',
    source: 'platform',
    pageRef: 88,
    prompt: '٤) رتّب ما يحدث في الدارة المغلقة من المولّد حتى المصباح ثم العودة.',
    hintHtml: `<p>ابدأ بما يفعله المولّد، ثم انتقال الطاقة إلى الجهاز، ثم ما يفعله الجهاز، وانتهِ بحركة الإلكترونات بعد المصباح.</p>`,
    items: Object.freeze([
      Object.freeze({ id: 'transfer', label: 'تنتقل الطاقة الكهربائية عبر الموصل إلى المصباح.', position: 1 }),
      Object.freeze({ id: 'lamp', label: 'يحوّل المصباح جزءاً من الطاقة إلى ضوء وحرارة.', position: 2 }),
      Object.freeze({ id: 'causes', label: 'يُسبّب المولّد حركة الإلكترونات الحرّة في الدارة.', position: 0 }),
      Object.freeze({ id: 'return', label: 'تعود الإلكترونات الحرّة في الدارة ولا تُستهلك في المصباح.', position: 3 }),
    ]),
    explanationHtml: `<p>المولّد يُسبّب الحركة ← تنتقل الطاقة إلى المصباح ← يحوّل المصباح جزءاً منها إلى ضوء وحرارة ← الإلكترونات تكمل دورتها وتعود، فلا تُستهلك.</p>`,
  }),
  Object.freeze({
    id: 'detective-5',
    kind: 'choice',
    source: 'book',
    pageRef: 89,
    prompt: '٥) رسَم زميلك سهماً على السلك خارج المولّد من القطب السالب إلى القطب الموجب وسمّاه «جهة التيّار الاصطلاحية». ما تقييمك؟',
    hintHtml: `<p>ارجع إلى اصطلاح أمبير في صفحة 89.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'wrong-electron',
        label: 'التسمية خاطئة: هذا السهم يمثّل جهة انجراف الإلكترونات، أمّا جهة التيّار الاصطلاحية فمن الموجب إلى السالب.',
        correct: true,
        feedbackHtml: `<p>صحيح تماماً: السهم المرسوم صحيح في مكانه لكن تسميته مقلوبة. جهة التيّار الاصطلاحية من الموجب إلى السالب خارج المولّد، والإلكترونات بالعكس.</p>`,
      }),
      Object.freeze({
        id: 'right',
        label: 'التسمية صحيحة: جهة التيّار الاصطلاحية من السالب إلى الموجب.',
        correct: false,
        feedbackHtml: `<p>هذا يخالف اصطلاح أمبير المطبوع في صفحة 89: الجهة من الموجب إلى السالب خارج المولّد.</p>`,
      }),
      Object.freeze({
        id: 'either',
        label: 'لا فرق: الجهتان تعطيان النتيجة نفسها دائماً، فيصحّ أيّ اختيار.',
        correct: false,
        feedbackHtml: `<p>الاصطلاحان مختلفان في الجهة، والخطأ في تحديد الجهة خطأ علمي حتى لو بقيت الحسابات في هذا المستوى صحيحة.</p>`,
      }),
    ]),
    explanationHtml: `<p>على السلك نفسه: سهم نحاسي للتيّار الاصطلاحي (من + إلى −)، وسهم أزرق للإلكترونات (من − إلى +). الجهتان متعاكستان خارج المولّد.</p>`,
  }),
  Object.freeze({
    id: 'detective-6',
    kind: 'choice',
    source: 'platform',
    pageRef: 91,
    prompt: '٦) في الدارة نفسها، صارت كمية الكهرباء المارّة خلال الزمن نفسه ثلاثة أمثالها. ماذا تتوقّع أن يصير لشِدّة التيّار؟',
    hintHtml: `<p>استخدم الحاسبة: ${tex('I=\\dfrac{Q}{t}', 'I equals Q over t')} مع ثبات ${S_T}.</p>`,
    choices: Object.freeze([
      Object.freeze({
        id: 'triple',
        label: 'تصير ثلاثة أمثالها.',
        correct: true,
        feedbackHtml: `<p>صحيح: عند ثبات الزمن تتناسب شِدّة التيّار طرداً مع كمية الكهرباء، فمضاعفة الكمية بمقدار ثلاث تعني ثلاث أمثال شِدّة التيّار.</p>`,
      }),
      Object.freeze({
        id: 'third',
        label: 'تصير ثلثها.',
        correct: false,
        feedbackHtml: `<p>هذا يحدث لو تضاعف الزمن مع بقاء الكمية، أو لو قسمنا على ثلاثة لا ضربنا. هنا الكمية هي التي كبرت.</p>`,
      }),
      Object.freeze({
        id: 'same',
        label: 'تبقى كما هي لأن الدارة نفسها.',
        correct: false,
        feedbackHtml: `<p>الدارة نفسها لا تعني القراءة نفسها: تغيير كمية الكهرباء المارّة في الزمن نفسه يغيّر شِدّة التيّار.</p>`,
      }),
    ]),
    explanationHtml: `<p>عند ثبات الزمن: ${ltrText('I ∝ Q', 'I is proportional to Q')}.</p>`,
  }),
  Object.freeze({
    id: 'detective-7',
    kind: 'number',
    source: 'platform',
    pageRef: 91,
    prompt: '٧) حساب ختامي: مرّت في الدارة كمية من الكهرباء قدرها 90 C خلال 3 min. احسب شِدّة التيّار بالأمبير. (انتبه إلى الوحدة قبل التعويض.)',
    unit: 'A',
    expected: 0.5,
    tolerance: 1e-9,
    hintHtml: `<p>حوّل الدقائق إلى ثوانٍ أولاً: ${tex('3\\,\\mathrm{min}=180\\,\\mathrm{s}', 'three minutes equal 180 seconds')}.</p>`,
    solutionHtml: `<p>${tex('I=\\dfrac{90\\,\\mathrm{C}}{180\\,\\mathrm{s}}=0.5\\,\\mathrm{A}', 'I equals 90 coulomb over 180 seconds equals 0.5 A')}</p><p>والقيمة نفسها ${tex('500\\,\\mathrm{mA}', '500 milliamperes')}.</p>`,
    explanationHtml: `<p>الخطأ الشائع هنا هو القسمة على 3 بدل 180: الدقيقة يجب تحويلها إلى ثوانٍ قبل التعويض.</p>`,
  }),
]);

export const DETECTIVE_FEEDBACK_CORRECT_HEADLINE = 'أحسنت — إجابتك موافقة';
export const DETECTIVE_FEEDBACK_INCORRECT_HEADLINE = 'لنرَ معاً أين الفرق';
export const DETECTIVE_FEEDBACK_INVALID_HEADLINE = 'أكمل إجابتك أولاً';
export const DETECTIVE_RETRY_LABEL = 'أعد المحاولة';
export const DETECTIVE_ORDER_HINT = 'استخدم سهمَي الترتيب لتحريك كل جملة، ثم اضغط «تحقّق».';
export const DETECTIVE_NUMBER_HINT = 'اكتب الرقم في الحقل ثم اضغط «تحقّق».';
export const DETECTIVE_ENCOURAGEMENT_HTML = '<p>عدد المحاولات معلومة لك فقط: لا درجة ولا خصم ولا قفل. جرّب، واقرأ التفسير، ثم أعد المحاولة إن أحببت.</p>';

/* ========================================================== station 7 · map */

export const CONCEPT_INTRO_HTML = `
  <p>ستّة مفاهيم من الرحلة، وخطوط تربطها ببعضها. اختر أي مفهوم لتقرأ شرحاً قصيراً، وافتح المحطة التي علّمته إن أردت مراجعتها.</p>`;

export const CONCEPT_NODES = Object.freeze([
  Object.freeze({
    id: 'generator',
    label: 'المولّد والطاقة الكهربائية',
    short: 'المصدر',
    x: 96,
    y: 92,
    stationId: 'origin',
    bodyHtml: `<p>المولّد هو مصدر الطاقة الكهربائية في الدارة، وهو الذي يُسبّب حركة الإلكترونات الحرّة. لا يُنتِج إلكترونات، لكنه يمنحها حركة منظّمة.</p>
      <p>${ref(87)} ${ref(94)}</p>`,
  }),
  Object.freeze({
    id: 'closed-circuit',
    label: 'الدارة المغلقة',
    short: 'شرط المرور',
    x: 330,
    y: 60,
    stationId: 'origin',
    bodyHtml: `<p>حتى يمرّ تيار في دارة ما يجب أن تحتوي على مولّد وأن تكون الدارة مغلقة. فتح أي جزء في دارة موصولة على التّسلسُل يقطع التيّار عن الدارة كلّها.</p>
      <p>${ref(94)} ${ref(92)}</p>`,
  }),
  Object.freeze({
    id: 'free-electrons',
    label: 'الإلكترونات الحرّة',
    short: 'الحاملات',
    x: 560,
    y: 92,
    stationId: 'electrons',
    bodyHtml: `<p>إلكترونات موجودة سلفاً في النّاقل، تتحرّك بحركة عشوائية، ويُضاف إليها عند إغلاق الدارة انجراف منظّم باتجاه واحد. هذا هو التيّار المتواصل.</p>
      <p>${ref(88)}</p>`,
  }),
  Object.freeze({
    id: 'current-direction',
    label: 'جهة التيّار',
    short: 'اصطلاح أمبير',
    x: 560,
    y: 300,
    stationId: 'direction',
    bodyHtml: `<p>خارج المولّد: جهة التيّار الاصطلاحية من الموجب إلى السالب، وجهة انجراف الإلكترونات عكسها من السالب إلى الموجب. الجهتان متعاكستان.</p>
      <p>${ref(89)} ${ref(88)}</p>`,
  }),
  Object.freeze({
    id: 'current-intensity',
    label: 'شِدّة التيّار',
    short: 'الأمبير',
    x: 330,
    y: 330,
    stationId: 'ammeter',
    bodyHtml: `<p>شِدّة التيّار هي كمية الكهرباء المارّة عبر مقطع دارة كهربائية خلال واحدة الزمن، وتُقاس بالأمبير بمقياس يوصل على التّسلسُل.</p>
      <p>${ref(91)} ${ref(92)}</p>`,
  }),
  Object.freeze({
    id: 'charge-time',
    label: 'كمية الكهرباء والزمن',
    short: 'Q و t',
    x: 96,
    y: 300,
    stationId: 'relation',
    bodyHtml: `<p>كمية الكهرباء ${S_Q} تُقاس بالكولوم، والزمن ${S_T} بالثانية. ومنهما نحسب شِدّة التيّار: ${tex(RELATION_TEX, 'I equals Q over t')}، وصورتها المكافئة ${tex(CHARGE_FORM_TEX, 'Q equals I times t')}.</p>
      <p>${ref(91)}</p>`,
  }),
]);

export const CONCEPT_LINKS = Object.freeze([
  Object.freeze({ from: 'generator', to: 'closed-circuit', label: 'يُبقي قطبيه مختلفين فيمرّ التيّار في دارة مغلقة', curved: 26 }),
  Object.freeze({ from: 'generator', to: 'free-electrons', label: 'يُسبّب حركتها المنظّمة', curved: -34 }),
  Object.freeze({ from: 'closed-circuit', to: 'current-intensity', label: 'شرط مرور التيّار', curved: -20 }),
  Object.freeze({ from: 'free-electrons', to: 'current-direction', label: 'انجرافها عكس جهة التيّار الاصطلاحية', curved: 24 }),
  Object.freeze({ from: 'current-direction', to: 'charge-time', label: 'الجهتان تُرسمان على المسار نفسه', curved: -22 }),
  /* SVG text can only hold plain text: an inline KaTeX fragment would be parsed
   * as markup and would break the scene. The relation itself is typeset in the
   * concept card and in the relation station, not inside the map's lines. */
  Object.freeze({ from: 'charge-time', to: 'current-intensity', label: 'علاقة شِدّة التيّار بكمية الكهرباء والزمن', curved: -18 }),
]);

export const CONCEPT_NODE_ACTION = 'افتح محطة هذا المفهوم';
export const CONCEPT_MAP_LEGEND = 'الخطوط في الخريطة تبيّن علاقة مفهوم بمفهوم آخر؛ والشرح الكامل مكتوب في البطاقة عند الاختيار.';

export const KEY_IDEAS = Object.freeze([
  'التيّار الكهربائي المتواصل (المستمر) هو انتقال مستمرّ للإلكترونات الحرّة باتجاهٍ واحد في النّاقل الذي يمرّ فيه التيّار.',
  'المولّد لا يُنتِج إلكترونات، لكنه يُسبّب حركتها؛ ويلزم مولّد ودارة مغلقة ليمرّ التيّار.',
  'خارج المولّد: جهة التيّار الاصطلاحية من الموجب إلى السالب، وجهة انجراف الإلكترونات عكسها.',
  `شِدّة التيّار ${tex(RELATION_TEX, 'I equals Q over t')}، وتُقاس بالأمبير، وكمية الكهرباء بالكولوم، والزمن بالثانية.`,
  'الإلكترونات لا تُستهلك في المصباح: الجهاز يحوّل الطاقة، والإلكترونات تكمل دورتها.',
]);

export const CHECKLIST_HEADING = 'قائمة تحقّق ذاتية على أهداف الدرس';
export const CHECKLIST_INTRO = '<p>ضع علامة أمام ما تستطيع أن تفعله فعلاً. هذه قائمة شخصية بلا درجة وبلا تسجيل: الغرض أن تعرف أي هدف يحتاج مراجعة، وأي محطة تعود إليها.</p>';
export const CHECKLIST_ITEMS = Object.freeze([
  Object.freeze({
    id: 'check-o1',
    objectiveId: 'o1',
    label: 'أستطيع أن أشرح بأسلوبي ما التيّار الكهربائي المتواصل، وأشير إلى الإلكترونات الحرّة.',
    stationId: 'electrons',
    stationLabel: 'المحطة 2',
  }),
  Object.freeze({
    id: 'check-o2',
    objectiveId: 'o2',
    label: 'أستطيع أن أحدّد جهة التيّار الاصطلاحية خارج المولّد، وأن أذكر أن جهة انجراف الإلكترونات عكسها.',
    stationId: 'direction',
    stationLabel: 'المحطة 3',
  }),
  Object.freeze({
    id: 'check-o3',
    objectiveId: 'o3',
    label: 'أستطيع أن أستخدم I = Q/t وأن أتوقّع أثر تغيير كمية الكهرباء أو الزمن في شِدّة التيّار.',
    stationId: 'relation',
    stationLabel: 'المحطة 5',
  }),
]);

export const CHECKLIST_DONE_HTML = '<p>أنجزتَ الأهداف الثلاثة في هذه الرحلة. يمكنك العودة إلى أي محطة في أي وقت؛ الملحق مفتوح دائماً.</p>';
export const CHECKLIST_PARTIAL_HTML = '<p>ما زال أمامك هدف تحتاج إلى مراجعته. اضغط على اسم المحطة بجانب الهدف لتعود إليها مباشرةً، ثم عُد إلى هذه القائمة وأكملها.</p>';
export const SUMMARY_CLOSING_HTML = `<p>انتهت رحلة الشحنات. ما نقلناه من الكتاب موسوم بـ«${SOURCE_LABEL}» مع رقم الصفحة، وما أضفناه من شرح أو مثال موسوم بـ«${PLATFORM_LABEL}» أو «${ENRICHMENT_LABEL}»، وكل رسم في الملحق من إعداد المنصة.</p>`;

/* ------------------------------------------- the shared question registry */

/** Every authored question of the appendix, in one place. */
export const ALL_QUESTIONS = Object.freeze([
  ...ORIGIN_QUESTIONS,
  ...ELECTRON_QUESTIONS,
  ...DIRECTION_QUESTIONS,
  ...AMMETER_QUESTIONS,
  ...RELATION_CHALLENGES,
  ...DETECTIVE_QUESTIONS,
]);

export function findQuestion(questionId) {
  const question = ALL_QUESTIONS.find((candidate) => candidate.id === questionId);
  if (!question) throw new RangeError(`Unknown question: ${questionId}`);
  return question;
}

/** The questions of one station, in the order they are asked. */
export function questionsOfStation(stationId) {
  const groups = {
    origin: ORIGIN_QUESTIONS,
    electrons: ELECTRON_QUESTIONS,
    direction: DIRECTION_QUESTIONS,
    ammeter: AMMETER_QUESTIONS,
    relation: RELATION_CHALLENGES,
    detective: DETECTIVE_QUESTIONS,
    map: Object.freeze([]),
  };
  const group = groups[stationId];
  if (!group) throw new RangeError(`Unknown station: ${stationId}`);
  return group;
}

/* ------------------------------------------------------------- scope notes */

export const SCOPE_NOTES = Object.freeze([
  'هذا الملحق إثرائي مستقلّ: لا يعدّل صفحات الدرس، ولا يُسجَّل ضمن اختبار الدرس (unit2-lesson-2-test.html) ولا حلول الاختبارات ولا منطقة المعلم.',
  'لا تُعاد طباعة أي صورة فوتوغرافية أو جدول من الكتاب؛ الرسوم كلها من إعداد المنصة وموسومة بذلك.',
  'كل نتيجة عددية في الملحق محسوبة من I = Q/t، والقيم غير المطبوعة في الكتاب موسومة بأنها أمثلة إثرائية من إعداد المنصة.',
  'كلمة مرور منطقة المعلم لم تُلمس، وقواعد اختبارات الوحدات لم تتغيّر.',
]);
