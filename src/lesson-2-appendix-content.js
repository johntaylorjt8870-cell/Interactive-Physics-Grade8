/*
 * Authored content for the Lesson 2 appendix (القوى المتوازية, صفحات 63–70).
 *
 * The module separates the two voices the platform has to keep apart:
 *   - material attributed to the textbook (pages, relations, worked values)
 *     is quoted from Lesson 2's own conclusions and labelled «من الكتاب»;
 *   - everything the platform adds on top (the interactive model, the
 *     derivation of the resultant's carrier position, the couple note for
 *     equal-and-opposite forces) is labelled «Platform Explanation».
 *
 * All mathematics goes through `math.js` (KaTeX), never through Unicode or CSS.
 */

import { formula, qty, scalar, tex, vector } from './math.js';
import { OPPOSITE_SENSE, SAME_SENSE } from './lesson-2-appendix-physics.js';

export const APPENDIX_EXTENSION_LABEL = 'ملحق تفاعلي — Platform Extension';
export const EDUCATIONAL_MODEL_LABEL = 'نموذج تعليمي مبسّط — Educational simplified model';
export const SOURCE_LABEL = 'من الكتاب';
export const PLATFORM_LABEL = 'شرح المنصة · Platform Explanation';

const V_F1 = vector('F', '1');
const V_F2 = vector('F', '2');
const V_F = vector('F');
const S_F1 = scalar('F', '1');
const S_F2 = scalar('F', '2');
const S_F = scalar('F');
const D1 = scalar('d', '1');
const D2 = scalar('d', '2');
const D = scalar('d');
const X1 = scalar('x', '1');
const X2 = scalar('x', '2');
const P_A = tex('A', 'point A');
const P_B = tex('B', 'point B');

/** Same inline source-reference convention Lesson 2 already uses. */
const ref = (page, note) => `<span class="source-reference-inline"><bdi dir="ltr">Reference / See textbook — p${page}</bdi>${note ? ` · ${note}` : ''}</span>`;

export const BOOK_SCOPE = Object.freeze({
  pages: '63–70',
  relationTex: 'F_{1}\\times d_{1}=F_{2}\\times d_{2}',
  relationHtml: tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two'),
  definition: 'القوى المتوازية: هي القوى التي تكون حواملها مستقيمات متوازية.',
});

/** The two textbook cases, kept word-for-word in meaning with pages 65–69. */
export const BOOK_CASES = Object.freeze([
  Object.freeze({
    id: 'same-sense',
    mode: SAME_SENSE,
    title: 'قوتان متوازيتان بجهة واحدة',
    badgeTex: 'F_{1}\\!\\uparrow\\quad F_{2}\\!\\uparrow',
    badgeLabel: 'القوة الأولى إلى الأعلى والقوة الثانية إلى الأعلى',
    source: ref(65, 'الاستنتاج · ص 65، وتكراره في خلاصة ص 69'),
    elements: Object.freeze([
      Object.freeze({ label: 'الحامل', html: `يوازي حاملي القوتين ${V_F1}، ${V_F2}.` }),
      Object.freeze({ label: 'الجهة', html: `بجهة القوتين ${V_F1}، ${V_F2}.` }),
      Object.freeze({ label: 'الشدة', html: `حاصل جمع شدتي القوتين: ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')}.` }),
      Object.freeze({
        label: 'نقطة التأثير',
        html: `تقع على القطعة المستقيمة ${tex('AB', 'segment A B')} الواصلة بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر ${V_F2}، وتحقق العلاقة ${BOOK_SCOPE.relationHtml}.`,
      }),
    ]),
    proportional: Object.freeze([
      formula('\\frac{F_{1}}{d_{2}}=\\frac{F_{2}}{d_{1}}=\\frac{F}{d}', 'F one over d two equals F two over d one equals F over d'),
    ]),
  }),
  Object.freeze({
    id: 'opposite-sense',
    mode: OPPOSITE_SENSE,
    title: 'قوتان متوازيتان بجهتين متعاكستين',
    badgeTex: 'F_{1}\\!\\uparrow\\quad F_{2}\\!\\downarrow',
    badgeLabel: 'القوة الأولى إلى الأعلى والقوة الثانية إلى الأسفل',
    source: ref(67, 'الاستنتاج · ص 67، وتكراره في خلاصة ص 69'),
    elements: Object.freeze([
      Object.freeze({ label: 'الحامل', html: `يوازي حاملي القوتين ${V_F1}، ${V_F2}.` }),
      Object.freeze({ label: 'الجهة', html: `بجهة القوة الأكبر ${V_F2}.` }),
      Object.freeze({ label: 'الشدة', html: `حاصل طرح شدتي القوتين: ${tex('F=F_{2}-F_{1}', 'F equals F two minus F one')} حيث ${tex('F_{2}>F_{1}', 'F two greater than F one')}.` }),
      Object.freeze({
        label: 'نقطة التأثير',
        html: `تقع على امتداد القطعة المستقيمة ${tex('(AB)', 'line A B')} ومن جهة القوة الأكبر ${V_F2}، وتحقق العلاقة ${BOOK_SCOPE.relationHtml}.`,
      }),
    ]),
    proportional: Object.freeze([
      formula('\\frac{F_{2}}{d_{1}}=\\frac{F}{d}', 'F two over d one equals F over d'),
      formula('\\frac{F_{1}}{d_{2}}=\\frac{F_{2}}{d_{1}}=\\frac{F}{d}', 'F one over d two equals F two over d one equals F over d'),
    ]),
  }),
]);

/** The textbook's own worked application (pages 66–67), reproduced with its values. */
export const BOOK_WORKED_EXAMPLE = Object.freeze({
  id: 'book-example-p66',
  title: 'تطبيق الكتاب المحلول (ص 66–67)',
  source: ref(66, 'ساق طولها <bdi dir="ltr">AB = 0.5 m</bdi>، قوتان بجهة واحدة <bdi dir="ltr">20 N</bdi> و<bdi dir="ltr">30 N</bdi>'),
  introduction: `ساق مهملة الكتلة طولها ${tex('AB=0.5~\\mathrm{m}', 'AB equals 0.5 meters')} تؤثر في طرفيها قوتان متوازيتان وبجهة واحدة شدتهما ${tex('F_{1}=20~\\mathrm{N}', 'F one equals 20 newtons')} و${tex('F_{2}=30~\\mathrm{N}', 'F two equals 30 newtons')}.`,
  steps: Object.freeze([
    Object.freeze({
      label: 'شدة المحصلة',
      html: `${formula('F=F_{1}+F_{2}=20+30=50~\\mathrm{N}', 'F equals F one plus F two equals 20 plus 30 equals 50 newtons')}`,
    }),
    Object.freeze({
      label: 'بعد حامل القوة الثانية',
      html: `${formula('\\frac{F}{d}=\\frac{F_{1}}{d_{2}}', 'F over d equals F one over d two')}${formula('\\frac{50}{0.5}=\\frac{20}{d_{2}}\\quad\\Longrightarrow\\quad d_{2}=0.2~\\mathrm{m}', '50 over 0.5 equals 20 over d two, therefore d two equals 0.2 meters')}`,
    }),
    Object.freeze({
      label: 'التحقق',
      html: `<p>وبالمثل ${tex('d_{1}=0.3~\\mathrm{m}', 'd one equals 0.3 meters')}، فيتحقق ${BOOK_SCOPE.relationHtml} عند ${tex('20\\times0.3=30\\times0.2=6', '20 times 0.3 equals 30 times 0.2 equals 6')}.</p>`,
    }),
  ]),
  labState: Object.freeze({ mode: SAME_SENSE, force1: 20, force2: 30, position1: 0, position2: 50 }),
});

/*
 * Platform explanations. Each card is a separate idea with its own equations,
 * so nothing here reads as a law quoted from the textbook.
 */
export const PLATFORM_CONCEPTS = Object.freeze([
  Object.freeze({
    id: 'magnitude',
    title: 'لماذا تتغير شدة المحصلة عندما أغيّر إحدى القوتين؟',
    paragraphs: [
      `في وضع الجهة الواحدة تدفع القوتان الساق في الجهة نفسها؛ لذلك تتراكم شدتاهما وتصلح قوة واحدة لتلعب دورهما: ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')}. إذا زدت ${S_F2} وحدها، تزداد ${S_F} بمقدار الزيادة نفسها.`,
      `أما في وضع الجهتين المتعاكستين فتؤثر إحداهما إلى الأعلى والأخرى إلى الأسفل؛ فلا تجمع الشدتان، بل يبقى ما فضل من الأكبر: ${tex('F=F_{2}-F_{1}', 'F equals F two minus F one')}. ولهذا قد تنقص شدة المحصلة عندما تزيد إحدى القوتين، وهذه أول نقطة يُخطئ فيها كثير من الطلبة.`,
    ],
    equations: [formula('F=F_{1}+F_{2}\\qquad\\text{(جهة واحدة)}', 'F equals F one plus F two, same sense'), formula('F=F_{2}-F_{1}\\qquad\\text{(جهتان متعاكستان)}', 'F equals F two minus F one, opposite senses')],
  }),
  Object.freeze({
    id: 'distances',
    title: 'ما معنى المسافتين الواردتين في علاقة العزم؟',
    paragraphs: [
      `${D1} ليست نصف الساق ولا المسافة بين القوتين؛ إنها البعد بين <strong>حامل المحصلة</strong> وحامل ${V_F1}، و${D2} هي البعد بين حامل المحصلة وحامل ${V_F2}. أما ${D} فهي البعد بين حاملي القوتين نفسه، وتساوي ${tex('d=d_{1}+d_{2}', 'd equals d one plus d two')} في وضع الجهة الواحدة.`,
      `المسافة تُقاس دائمًا بين <em>حاملين</em> متوازيين، أي بين خطين رأسيين في هذا المختبر، ولهذا تبقى مفهومة حتى عندما يخرج حامل المحصلة من الساق في الحالة المتعاكسة.`,
    ],
    equations: [formula('d=d_{1}+d_{2}', 'd equals d one plus d two')],
  }),
  Object.freeze({
    id: 'position',
    title: 'لماذا يتغير موضع حامل المحصلة؟',
    paragraphs: [
      `لكل قوة قابلية لإدارة الساق حول أي نقطة: حاصل ضرب الشدة في البعد عن تلك النقطة. وحول حامل المحصلة يجب أن يتعادل أثرا الدوران، فيتحقق ما ورد في الكتاب ${BOOK_SCOPE.relationHtml}. من هذه العلاقة نستنتج ${tex('\\frac{d_{1}}{d_{2}}=\\frac{F_{2}}{F_{1}}', 'd one over d two equals F two over F one')}: البعد ينقص كلما زادت الشدة، ولذلك يقترب حامل المحصلة من القوة الأكبر.`,
      `<strong>Platform Explanation:</strong> بترتيب العلاقة نفسها يمكن كتابة موضع الحامل بالنسبة إلى النقطة ${P_A} عندما تكون القوة الأولى عند ${X1} والثانية عند ${X2}:`,
    ],
    equations: [
      formula('x_{C}=\\frac{F_{1}x_{1}+F_{2}x_{2}}{F_{1}+F_{2}}', 'x C equals F one x one plus F two x two over F one plus F two'),
      formula('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two'),
    ],
    note: 'الصيغة الأولى اشتقاق من المنصة لتسهيل القراءة من الرسم؛ وهي تعبير آخر عن علاقة الكتاب نفسها، وليست نصاً إضافياً في الكتاب.',
  }),
  Object.freeze({
    id: 'link',
    title: 'كيف ترتبط الشدة بالموضع؟',
    paragraphs: [
      `ثبّت ${X1} و${X2} ثم زد ${S_F2} وحدها: تكبر ${D2}؟ لا، بل تصغر، لأن ${tex('F_{2}\\times d_{2}', 'F two times d two')} يجب أن يبقى مساوياً ${tex('F_{1}\\times d_{1}', 'F one times d one')}. زيادة الشدة يعني حاجة أقل إلى البعد.`,
      `لكن الموضع لا يعتمد على الشدة وحدها: تحريك أحد الحاملين يغيّر ${D} كلها، فيتغير معها موضع الحامل الذي يتعادل عنده الأثران. في المختبر يمكنك فصل الأثرين: جرّب تغيير شدة فقط، ثم تغيير موضع فقط.`,
    ],
    equations: [formula('d_{1}=\\frac{F_{2}}{F_{1}+F_{2}}\\;d', 'd one equals F two over F one plus F two, times d')],
  }),
  Object.freeze({
    id: 'opposite',
    title: 'لماذا تتغير النتيجة كلياً في الحالة المتعاكسة؟',
    paragraphs: [
      `عندما تعكس جهة إحدى القوتين يصبح لجهة القوة الأكبر دور في تحديد جهة المحصلة، وتصبح الشدة فرقاً لا مجموعاً. والأهم أن حامل المحصلة لم يبقَ بين الحاملين: إنه يقع على امتداد ${tex('(AB)', 'line A B')} خارج القطعة، ومن جهة القوة الأكبر، لأن التعادل ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two')} لا يمكن أن يتحقق بين الحاملين مع قوتين مختلفتي الجهة.`,
      `افترض أن ${S_F2} هي الأكبر: تكون جهة المحصلة إلى الأسفل (جهة ${V_F2})، ويقع حاملها إلى ما بعد ${P_B}. وإذا صارت ${S_F1} هي الأكبر انقلبت الجهة والجهة الأخرى من القطعة. وكلما تقاربت الشدتان تقارب فرقهما، واحتاج الحامل إلى بعد أكبر حتى يبقى الجداء متساوياً.`,
    ],
    equations: [formula('x_{C}=\\frac{F_{1}x_{1}-F_{2}x_{2}}{F_{1}-F_{2}}', 'x C equals F one x one minus F two x two over F one minus F two')],
    note: 'هذه الصيغة اشتقاق من المنصة للقراءة من الرسم؛ عناصر المحصلة نفسها هي الواردة في استنتاج الكتاب ص 67 وخلاصة ص 69.',
  }),
  Object.freeze({
    id: 'zero',
    title: 'ماذا يعني أن المحصلة تساوي صفراً؟',
    paragraphs: [
      `في وضع الجهتين المتعاكستين، إذا تساوت الشدتان فإن ${tex('F=F_{2}-F_{1}=0', 'F equals F two minus F one equals zero')}. أي أنه لا توجد قوة واحدة تصلح لتحل محل القوتين في دفعهما الانتقالي؛ فلا محصلة كقوة، ولا <em>حامل مفرد</em> يمكن تعليق النتيجة عليه.`,
      `لكن الحاملين مختلفان في هذا المختبر، ولهذا يبقى للقوتين أثر دوران مقداره ${tex('F\\times d', 'F times d')} يدوران به الساق في الجهة نفسها؛ ولهذا لا نجد حاملاً يتعادل عنده الأثران. تنبيه الكتاب (طبقة المنصة، ص 67) يقول الشيء نفسه: القانون يعطي صفراً، لكن القوتين تصنعان أثراً دورانياً لا تمثله قوة محصلة مفردة محدودة الموضع.`,
      `لاحظ أن الصفر هنا هو صفر <strong>المحصلة</strong>، وليس صفر كل شيء: الشدتان موجودتان، والرسم يعرضهما كاملتين، وما اختفى هو قوة واحدة تعادلهما.`,
    ],
    equations: [formula('F_{1}=F_{2}\\;\\Rightarrow\\;F=0\\quad\\text{مع}\\quad F\\times d\\neq0', 'F one equals F two implies F equals zero, while F times d is not zero')],
    note: 'لم يضف هذا البند حالة جديدة على الدرس؛ هو قراءة تفاعلية للحالة الحدّية المذكورة في شرح المنصة على صفحة 67.',
  }),
  Object.freeze({
    id: 'reading',
    title: 'كيف تقرأ الرسم؟',
    paragraphs: [
      `الساق الأفقية هي ${tex('AB', 'segment A B')}، والحوامل خطوط رأسية متقطعة، ونقاط التأثير دوائر صغيرة على الساق. لكل قوة لونها ورمزها ${V_F1} أو ${V_F2}، وللمحصلة رمز ${V_F} ولون مختلف وخط مختلف؛ لذلك لا تعتمد القراءة على اللون وحده: اقرأ الرمز والاتجاه والرقم أيضًا.`,
      `الأسهم مرسومة بمقياس واحد داخل المشهد يتكيف مع أكبر شدة، وطول السهم يدل على الشدة لا على المسافة. أما إشارة الأرقام فتظهر معزولة من اليسار إلى اليمين (N وcm) حتى تبقى واضحة داخل النص العربي.`,
    ],
    equations: [],
    isReadingGuide: true,
  }),
  Object.freeze({
    id: 'model',
    title: 'ما الذي يبسّطه هذا النموذج؟',
    paragraphs: [
      `${EDUCATIONAL_MODEL_LABEL}: الساق مهملة الكتلة، والقوتان شاقوليتان متوازيتان في مستويها فقط، ولا يحاكي المختبر مرونة الساق ولا وزنها ولا ثقل الأجسام المعلّقة ولا الربائع ولا الاحتكاك، كما أنه لا يرسم دوران الساق فعليًا بل يوضح هندسة الحوامل والمسافات.`,
      `الغرض أن ترى أين يقع حامل المحصلة ومقدارها، لا أن يمثل الرسم كل تفاصيل التجربة الواقعية.`,
    ],
    equations: [],
  }),
]);

/*
 * Authored lab presets. Every preset is a real, slider-legal state whose
 * numbers are re-derived from the physics module in the test suite, so a claim
 * printed next to a preset can never drift from what the lab computes.
 */
export const LAB_PRESETS = Object.freeze([
  Object.freeze({
    id: 'book-example',
    title: 'مثال الكتاب (ص 66)',
    badge: 'جهة واحدة · قوتان مختلفتان',
    state: Object.freeze({ mode: SAME_SENSE, force1: 20, force2: 30, position1: 0, position2: 50 }),
    observation: `هذه هي حالة التطبيق المحلول: ${tex('F_{1}=20~\\mathrm{N}', 'F one equals 20 newtons')} عند ${P_A} و${tex('F_{2}=30~\\mathrm{N}', 'F two equals 30 newtons')} عند ${P_B}، والمسافة ${tex('AB=50~\\mathrm{cm}', 'AB equals 50 centimeters')}.`,
    prediction: 'قبل النظر إلى النتيجة: هل سيكون حامل المحصلة في منتصف الساق أم أقرب إلى القوة الثانية؟ ولماذا؟',
  }),
  Object.freeze({
    id: 'same-sense-far-carriers',
    title: 'قوتان بجهة واحدة',
    badge: 'جهة واحدة · القوة الثانية أكبر',
    state: Object.freeze({ mode: SAME_SENSE, force1: 20, force2: 60, position1: 0, position2: 60 }),
    observation: 'الحاملان على طرفي الساق والشدتان مختلفتان؛ راقب الجداءين: هل يظهر العدد نفسه على الجانبين؟',
    prediction: 'أي القوتين يبعد حامل المحصلة عنها أقل؟ توقّع ثم قارن البعدين.',
  }),
  Object.freeze({
    id: 'closer-to-larger',
    title: 'المحصلة ملتصقة بالأكبر',
    badge: 'جهة واحدة · فرق كبير',
    state: Object.freeze({ mode: SAME_SENSE, force1: 5, force2: 80, position1: 50, position2: 60 }),
    observation: `فرق الشدتين كبير (${tex('80-5=75~\\mathrm{N}', '80 minus 5 equals 75 newtons')}) بينما المسافة بين الحاملين صغيرة (${qty(10, 'cm')})؛ لاحظ كيف يقترب الحامل من القوة الثانية.`,
    prediction: 'إذا صغّرت الفرق بالمنزلق، فهل يقترب الحامل من القوة الثانية أم يبتعد عنها؟',
  }),
  Object.freeze({
    id: 'opposite-sense',
    title: 'جهتان متعاكستان',
    badge: 'متعاكستان · القوة الثانية أكبر',
    state: Object.freeze({ mode: OPPOSITE_SENSE, force1: 20, force2: 80, position1: 20, position2: 60 }),
    observation: `القوة الأولى إلى الأعلى والقوة الثانية إلى الأسفل وأكبر منها؛ المحصلة إلى الأسفل، وحاملها على امتداد ${tex('(AB)', 'line A B')} خارج القطعة من جهة القوة الأكبر.`,
    prediction: `قبل التحريك: هل يقع حامل المحصلة في هذه الحالة داخل القطعة ${tex('AB', 'segment A B')} أم خارجها؟`,
  }),
  Object.freeze({
    id: 'equal-opposite',
    title: 'متساويتان ومتعاكستان',
    badge: 'متعاكستان · المحصلة صفر',
    state: Object.freeze({ mode: OPPOSITE_SENSE, force1: 20, force2: 20, position1: 10, position2: 50 }),
    observation: `الشدتان متساويتان ومتعاكستان وعلى حاملين مختلفين، فالمحصلة ${tex('F=0', 'F equals zero')}، ويظهر الرسم بقاء الأثر الدوراني بدل حامل مفرد للمحصلة.`,
    prediction: 'إذا كانت المحصلة صفراً، فهل تختفي القوتان من الرسم؟ توقّع ما ستراه ثم شغّل التجربة.',
  }),
]);

/* The appendix opens on the textbook's own solved application. */
export const DEFAULT_PRESET_ID = 'book-example';

export const PRESET_BY_ID = new Map(LAB_PRESETS.map((preset) => [preset.id, preset]));

export function findPreset(id) {
  return PRESET_BY_ID.get(id) ?? null;
}

/*
 * Exploratory challenges: no instant grading, an explicit verification button,
 * and every numeric target proven reachable on the slider grid (5 N, 5 cm) by
 * `tests/lesson-2-appendix.test.js`.
 */
export const CHALLENGES = Object.freeze([
  Object.freeze({
    id: 'near-the-larger',
    index: '01',
    title: 'ضع حامل المحصلة قريباً من القوة الأكبر',
    brief: `في وضع الجهة الواحدة: اجعل إحدى الشدتين أكبر بمقدار ${qty(20, 'N')} على الأقل، ثم اجعل بعد حامل المحصلة عن حامل القوة الأكبر ${qty(10, 'cm')} أو أقل.`,
    hint: 'الفرق الكبير بين الشدتين يسمح للحامل بالاقتراب من القوة الأكبر حتى لو كان الحاملان متباعدين.',
    mode: SAME_SENSE,
    startState: Object.freeze({ mode: SAME_SENSE, force1: 20, force2: 20, position1: 0, position2: 50 }),
    locks: Object.freeze([]),
    target: Object.freeze({ type: 'nearest-carrier', maxDistanceCm: 10, minDifferenceN: 20 }),
    startObservation: 'ابدأ بالحالة المعروضة: شدتان متساويتان؛ لا تتحقق شروط التحدي بعد. غيّر الشدتين والموضعين كما تشاء.',
    successNote: 'لاحظ أن المحصلة بقيت بين الحاملين: هذا شرط حالة الجهة الواحدة، والقرب من الأكبر هو ما تغيّر.',
  }),
  Object.freeze({
    id: 'equal-opposite',
    index: '02',
    title: 'اجعل القوتين متساويتين ومتعاكستين',
    brief: `في وضع الجهتين المتعاكستين: اجعل ${qty(20, 'N')} في القوة الأولى تساوي القوة الثانية، فتكون المحصلة ${qty(0, 'N')}.`,
    hint: 'انتبه إلى أن تساوي الشدتين لا يعني اختفاء القوتين؛ راقب ما يحدث للرسم وللأثر الدوراني.',
    mode: OPPOSITE_SENSE,
    startState: Object.freeze({ mode: OPPOSITE_SENSE, force1: 40, force2: 20, position1: 20, position2: 60 }),
    locks: Object.freeze([]),
    target: Object.freeze({ type: 'balanced-opposite', toleranceN: 1 }),
    startObservation: 'الشدة الأولى أكبر؛ المحصلة الآن إلى الأعلى. عدّل الشدتين حتى تتساويا.',
    successNote: 'المحصلة كقوة صفر، ولا يوجد حامل مفرد محدود الموضع؛ ما بقي هو الأثر الدوراني لأن الحاملين مختلفان.',
  }),
  Object.freeze({
    id: 'change-one-force',
    index: '03',
    title: 'غيّر إحدى القوتين ولاحظ حركة الحامل',
    brief: `ثبّت القوة الأولى والموضعين، ثم زد القوة الثانية بمقدار ${qty(20, 'N')} على الأقل، ولاحظ أن حامل المحصلة يقترب منها بمقدار ${qty(3, 'cm')} على الأقل.`,
    hint: 'كلما زادت شدة القوة الثانية قلّ البعد اللازم لها ليعادل أثر القوة الأولى.',
    mode: SAME_SENSE,
    startState: Object.freeze({ mode: SAME_SENSE, force1: 20, force2: 20, position1: 10, position2: 60 }),
    locks: Object.freeze(['force1', 'position1', 'position2']),
    target: Object.freeze({ type: 'increase-and-observe', deltaN: 20, minDecreaseCm: 3 }),
    watchedField: 'force2',
    startObservation: 'القوة الأولى والموضعان مثبتة في هذا التحدي؛ المتغير الوحيد هو شدة القوة الثانية.',
    successNote: 'الشدة زادت فقلّ البعد: هذا هو معنى أن الحامل يتبع الشدة الأكبر، لا أن الشدتين تتقاسمان المسافة بالتساوي.',
  }),
  Object.freeze({
    id: 'target-point',
    index: '04',
    title: 'ضع حامل المحصلة عند نقطة محددة',
    brief: `في وضع الجهة الواحدة: اجعل حامل المحصلة عند ${qty(45, 'cm')} من النقطة ${tex('A', 'point A')} بسماحية ${qty(1, 'cm')}.`,
    hint: `إذا تساوت الشدتان وقع الحامل في منتصف المسافة بين الحاملين؛ فهل يمكن أن يكون منتصف المسافة هو ${qty(45, 'cm')}؟`,
    mode: SAME_SENSE,
    startState: Object.freeze({ mode: SAME_SENSE, force1: 20, force2: 30, position1: 0, position2: 50 }),
    locks: Object.freeze([]),
    target: Object.freeze({ type: 'target-position', targetCm: 45, toleranceCm: 1 }),
    startObservation: `الحالة الابتدائية هي مثال الكتاب: الحامل عند ${qty(30, 'cm')}؛ حرّك الشدتين والموضعين حتى تصل إلى ${qty(45, 'cm')}.`,
    successNote: `تحقق الهدف: الحامل بين الحاملين كما يجب في وضع الجهة الواحدة، وعند النقطة المطلوبة قياساً من ${tex('A', 'point A')}.`,
  }),
]);

export function findChallenge(id) {
  return CHALLENGES.find((challenge) => challenge.id === id) ?? null;
}
