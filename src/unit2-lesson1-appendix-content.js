/*
 * Authored content for the Unit 2 Lesson 1 appendix —
 * «مختبر الشحنات: اكتشف الكهرباء الساكنة» (textbook pages 73–86).
 *
 * Three voices are kept strictly apart, exactly as the platform does elsewhere:
 *
 *   1. «من الكتاب» — conclusions and values taken from the audited textbook
 *      pages of this lesson. The audit of those pages is
 *      docs/unit-2-lesson-1-source-audit.md; nothing is quoted here that the
 *      audit did not confirm, and every quotation carries its printed page.
 *   2. «شرح المنصة» — the platform's own explanation of what the model shows.
 *   3. «إثراء علمي من المنصة» — correct physics that goes beyond the printed
 *      page (polarization of a neutral body, the equality of the two forces,
 *      the sign left by a grounded induction). It is labelled as enrichment and
 *      is never presented as book wording.
 *
 * All mathematics is rendered through the shared KaTeX layer (`math.js`), so
 * exponents, fractions and units are real typeset math inside LTR islands.
 */

import { formula, ltrText, qty, tex } from './math.js';
import {
  ARENA_VIEW,
  ATTRACTION,
  BOOK_COULOMB_STATE,
  COULOMB_CONSTANT,
  COULOMB_FIELDS,
  CONDUCTOR,
  DEFAULT_COULOMB_STATE,
  ELEMENTARY_CHARGE,
  INSULATOR,
  METHOD_CONTACT,
  METHOD_FRICTION,
  METHOD_INDUCTION,
  RATIO_DOUBLE,
  RATIO_HALF,
  RATIO_OTHER,
  RATIO_QUADRUPLE,
  RATIO_QUARTER,
  RATIO_UNCHANGED,
  REPULSION,
  SYMBOLIC_PROTONS,
  chargeOfElectronCount,
  chargeTeX,
  countTeX,
  coulombReading,
} from './unit2-lesson1-appendix-physics.js';

/* ------------------------------------------------------------------ labels */

export const APPENDIX_TITLE = 'مختبر الشحنات';
export const APPENDIX_SUBTITLE = 'اكتشف الكهرباء الساكنة';
export const APPENDIX_LESSON_LABEL = 'ملحق الدرس الأول · الوحدة الثانية — الكهرباء الساكنة';
export const EXTENSION_LABEL = 'ملحق تفاعلي — Platform Extension';
export const MODEL_LABEL = 'نموذج تعليمي مبسّط — Educational simplified model';
export const SOURCE_LABEL = 'من الكتاب';
export const PLATFORM_LABEL = 'شرح المنصة · Platform Explanation';
export const ENRICHMENT_LABEL = 'إثراء علمي من المنصة';
export const LESSON_PAGES = '73–86';
export const NOT_BOOK_QUESTIONS_LABEL = 'تحديات من إعداد المنصة · ليست أسئلة الكتاب ولا جزءاً من اختبار الدرس';

/** Inline source reference in the platform's established wording. */
const ref = (page, note) => `<span class="u2l1a-ref"><bdi dir="ltr">Reference / See textbook — p${page}</bdi>${note ? ` · ${note}` : ''}</span>`;

const S_Q1 = tex('q_{1}', 'q one');
const S_Q2 = tex('q_{2}', 'q two');
const S_Q1Q2 = tex('q_{1}q_{2}', 'q one times q two');
const S_D = tex('d', 'd');
const S_F = tex('F', 'F');
const S_K = tex('K', 'K');
const S_N = tex('n', 'n');

export const COULOMB_LAW_TEX = 'F=K\\frac{q_{1}q_{2}}{d^{2}}';
export const COULOMB_LAW_HTML = formula(COULOMB_LAW_TEX, 'F equals K times q one times q two divided by d squared');
export const COULOMB_CONSTANT_HTML = tex('K=9\\times 10^{9}~\\mathrm{N\\cdot m^{2}\\cdot C^{-2}}', 'K equals nine times ten to the power nine newton metre squared per coulomb squared');

/* --------------------------------------------------------------- stations */

export const APPENDIX_STATIONS = Object.freeze([
  Object.freeze({
    id: 'puzzle',
    index: 1,
    title: 'لغز الكهرباء الساكنة',
    navLabel: 'اللغز',
    icon: '✦',
    kicker: 'توقّع · شغّل · لاحظ · فسّر',
    goal: 'أن تتعرّف الكهرباء الساكنة من ظاهرة تراها، وأن تفرّق بين ملاحظة الظاهرة وتفسير سبب حدوثها.',
    objective: 'الهدف الأول: يتعرّف الكهرباء الساكنة',
  }),
  Object.freeze({
    id: 'charge',
    index: 2,
    title: 'من أين تأتي الشحنة؟',
    navLabel: 'مصدر الشحنة',
    icon: '⊕',
    kicker: 'ميزان الشحنات',
    goal: 'أن تتعرّف الشحنات الكهربائية، وأن تميّز بين جسم مشحون وجسم غير مشحون (متعادل).',
    objective: 'الهدفان الثاني والثالث: الشحنات الكهربائية، والتمييز بين المشحون وغير المشحون',
  }),
  Object.freeze({
    id: 'methods',
    index: 3,
    title: 'ورشة طرائق التكهرب',
    navLabel: 'طرائق التكهرب',
    icon: '⚡',
    kicker: 'دلك · لمس · تأثير',
    goal: 'أن تفسّر طرائق التكهرب الثلاث، وأن تقارن بين ما تغيّر وما لم يتغيّر في كل طريقة.',
    objective: 'الهدف الرابع: يفسّر طرائق التكهرب',
  }),
  Object.freeze({
    id: 'forces',
    index: 4,
    title: 'ساحة التجاذب والتنافر',
    navLabel: 'التجاذب والتنافر',
    icon: '⇄',
    kicker: 'جهتا القوة على جسمين',
    goal: 'أن تفسّر قوى التنافر والتجاذب بين الشحنات، وأن تحدّد جهة القوة المؤثرة على كل جسم.',
    objective: 'الهدف الخامس: يفسّر قوى التنافر والتجاذب بين الشحنات',
  }),
  Object.freeze({
    id: 'coulomb',
    index: 5,
    title: 'تحدّي قانون كولوم',
    navLabel: 'قانون كولوم',
    icon: '∑',
    kicker: 'غيّر · قارن · استنتج',
    goal: 'أن تتعرّف قانون كولوم، وأن تكتشف أثر مقدار كل شحنة وأثر المسافة في شدة القوة الكهربائية.',
    objective: 'الهدف السادس: يتعرّف قانون كولوم',
  }),
  Object.freeze({
    id: 'detective',
    index: 6,
    title: 'تحدّي المحقّق الكهربائي',
    navLabel: 'المحقّق الكهربائي',
    icon: '❖',
    kicker: 'مواقف جديدة',
    goal: 'أن توظّف مفاهيم المحطات السابقة في مواقف جديدة، وأن تكتشف خطأً في تفسير علمي وتصحّحه.',
    objective: 'أهداف الدرس كلها في سياق واحد',
  }),
  Object.freeze({
    id: 'summary',
    index: 7,
    title: 'خلاصة الاكتشاف',
    navLabel: 'الخلاصة',
    icon: '✺',
    kicker: 'خريطة المفاهيم',
    goal: 'أن تربط المفاهيم الخمسة في خريطة واحدة، وأن تعود إلى أي محطة تريد مراجعتها.',
    objective: 'ترابط أفكار الدرس',
  }),
]);

export const STATION_IDS = Object.freeze(APPENDIX_STATIONS.map((station) => station.id));

export function findStation(stationId) {
  const station = APPENDIX_STATIONS.find((candidate) => candidate.id === stationId);
  if (!station) throw new RangeError(`Unknown station: ${stationId}`);
  return station;
}

export const APPENDIX_OBJECTIVES = Object.freeze([
  'يتعرّف الكهرباء الساكنة.',
  'يتعرّف الشحنات الكهربائية.',
  'يميّز بين الأجسام المشحونة والأجسام غير المشحونة.',
  'يفسّر طرائق التكهرب.',
  'يفسّر قوى التنافر والتجاذب بين الشحنات.',
  'يتعرّف قانون كولوم.',
]);

export const APPENDIX_KEYWORDS = Object.freeze([
  'الكهرباء الساكنة',
  'التكهرب',
  'قوى التنافر',
  'قوى التجاذب',
  'قانون كولوم',
]);

/* ============================================ station 1 · the static puzzle */

export const PUZZLE_INTRO_HTML = `
  <p>على الطاولة قصاصات ورق صغيرة معتدلة، وفوقها ساق بلاستيكية. عندك قطعتان من الصوف، ويمكنك أن تدلك الساق بها أو أن تقرّبها كما هي.</p>
  <p class="u2l1a-lead-question"><strong>اللغز:</strong> هل تحتاج الساق إلى أن تلامس القصاصات حتى تحرّكها؟ وما الذي تغيّر داخل الساق إن حدثت الحركة؟</p>`;

export const PUZZLE_BOOK_HOOK_HTML = `
  <p class="u2l1a-book-quote">في تجربة الدرس (ص75) تُقرِّب طرف ساق البلاستيك من قصاصات الورق <strong>قبل</strong> الدلك، ثم تدلك الطرف بقطعة الصوف وتقرّبه منها <strong>بعد</strong> الدلك، وتقارن بين الحالتين.</p>
  ${ref(75, 'خطوات «أجرّب وأستنتج»')}`;

export const PUZZLE_PREDICTIONS = Object.freeze([
  Object.freeze({ id: 'attract', label: 'تنجذب القصاصات إلى الساق وترتفع نحوها' }),
  Object.freeze({ id: 'nothing', label: 'لا يحدث شيء وتبقى القصاصات مكانها' }),
  Object.freeze({ id: 'repel', label: 'تبتعد القصاصات عن الساق' }),
]);

export const PUZZLE_PREDICTION_PROMPT = 'قبل أن تشغّل التجربة: ماذا تتوقّع أن يحدث عند تقريب الساق المدلوكة من قصاصات الورق؟';

/**
 * What the student sees (observation) and what it means (explanation) are two
 * separate texts for every possible outcome of their own choices.
 */
export const PUZZLE_OUTCOMES = Object.freeze({
  'neutral-rod': Object.freeze({
    observationHtml: `<p>قرّبتَ الساق من القصاصات <strong>وهي غير مدلوكة</strong>: لم تتحرّك أي قصاصة، وبقيت مستقرة على الطاولة.</p>`,
    explanationHtml: `<p>الساق غير المشحونة متعادلة كهربائياً: فيها شحنات موجبة وسالبة متوازنة إجمالاً، فلا يظهر حولها أثر كهربائي ملحوظ يجذب القصاصات.</p>
      <p>هذه الحالة هي <strong>المقارنة الضابطة</strong> في التجربة: لولاها لما عرفنا أن الدلك هو الذي أحدث التغيير.</p>`,
  }),
  'charged-rod-held-above': Object.freeze({
    observationHtml: `<p>الساق مدلوكة الآن، لكنها ما تزال بعيدة عن القصاصات: لم تلاحظ بعد أي أثر.</p>`,
    explanationHtml: `<p>الشحنات التي اكتسبتها الساق بالدلك ساكنة على طرفها المدلوك، وأثرها يظهر عندما يقترب هذا الطرف من القصاصات. أنزل الساق لتكمل الملاحظة.</p>`,
  }),
  'charged-rod-attraction': Object.freeze({
    observationHtml: `<p>عندما اقترب الطرف المدلوك من القصاصات <strong>ارتفعت قصاصات نحو الساق والتصقت بها</strong>، وبقيت قصاصات أخرى في مكانها.</p>`,
    explanationHtml: `<p>الدلك نقل عدداً من الإلكترونات من الصوف إلى الساق البلاستيكية، فأصبحت الساق <strong>سالبة الشحنة</strong> والصوف <strong>موجب الشحنة</strong>.</p>
      <p>القصاصات نفسها بقيت <strong>معتدلة</strong>؛ لكن الشحنة السالبة القريبة أعادت توزيع الشحنات داخل كل قصاصة: صارت الجهة القريبة من الساق موجبة والجهة البعيدة سالبة، والتجاذب بين الشحنة القريبة المخالفة والساق هو الذي رفع القصاصات.</p>`,
  }),
});

export const PUZZLE_OBSERVATION_VS_EXPLANATION = Object.freeze([
  Object.freeze({
    id: 'observation',
    title: 'الملاحظة',
    bodyHtml: `<p>وصفٌ لما رأيته فقط: «ارتفعت القصاصات نحو الطرف المدلوك». لا تتحدّث الملاحظة عن شحنات أو إلكترونات؛ فهي ما تسجّله حواسّك أو أداة القياس.</p>`,
  }),
  Object.freeze({
    id: 'explanation',
    title: 'التفسير',
    bodyHtml: `<p>ربطُ الملاحظة بسببها: انتقال إلكترونات بالدلك، ثم إعادة توزيع الشحنات داخل القصاصات المعتدلة. التفسير يستخدم نموذجاً للشحنة، وقد يتطوّر كلما عرفنا أكثر.</p>`,
  }),
]);

export const PUZZLE_POLARIZATION_NOTE_HTML = `
  <p>انجذاب جسم <strong>متعادل</strong> إلى جسم مشحون يسمى أثر <strong>الاستقطاب</strong>: إعادة توزيع مؤقتة للشحنات داخل الجسم المعتدل، دون أن تتغيّر شحنته الصافية.</p>
  <p>قد تلاحظ في الواقع أن بعض القصاصات تلتصق لحظاً ثم تسقط أو تبتعد؛ فبعد التلامس قد تنتقل إليها شحنات من النوع نفسه فتتنافر مع الساق. هذا التفصيل يحدث في التجربة الحقيقية، ولا يرسمه هذا النموذج خطوة بخطوة.</p>`;

export const PUZZLE_MODEL_LIMITS = Object.freeze([
  'المشهد رسم تمثيلي: لا يقيس كمية الشحنة، ولا يعرض عدد الإلكترونات الحقيقي (وهو عدد هائل).',
  'لا يمثّل أثر رطوبة الهواء أو شكل القصاصات أو مادتها، وهي عوامل تُضعف الظاهرة في المختبر الحقيقي.',
  'الحركة المعروضة تقريبية لأغراض الشرح؛ زمنها ومواقعها ليسا قياساً لواقع.',
  'المشهد لا يغني عن تنفيذ تجربة الكتاب بأدواتها الحقيقية (حقيبة الكهرباء الساكنة وأدوات جافة).',
]);

/* ================================================ station 2 · charge ledger */

export const CHARGE_LEDGER_BODIES = Object.freeze({
  a: Object.freeze({ id: 'a', label: 'الجسم (أ) — ساق بلاستيكية', material: INSULATOR, materialLabel: 'عازل', protons: SYMBOLIC_PROTONS }),
  b: Object.freeze({ id: 'b', label: 'الجسم (ب) — قطعة صوف', material: INSULATOR, materialLabel: 'عازل', protons: SYMBOLIC_PROTONS }),
});

export const CHARGE_LEDGER_INTRO_HTML = `
  <p>أمامك جسمان، في كل منهما ${tex(String(SYMBOLIC_PROTONS), 'six')} بروتونات موجبة داخل النوى وعدد مساوٍ من الإلكترونات السالبة حولها.</p>
  <p>انقل إلكترونات من جسم إلى الآخر — إلكتروناً واحداً في كل ضغطة — وراقب الشحنة الصافية لكل جسم، وحالته: متعادل أم مشحون؟</p>`;

export const CHARGE_NEUTRAL_VS_CHARGED = Object.freeze([
  Object.freeze({
    id: 'neutral',
    title: 'جسم متعادل (غير مشحون)',
    bodyHtml: `<p>عدد الإلكترونات = عدد البروتونات، فالشحنة الصافية صفر.</p>
      <p><strong>انتبه:</strong> المتعادل ليس خالياً من الشحنات؛ فيه شحنات موجبة وسالبة كثيرة، لكنها <strong>متوازنة إجمالاً</strong>.</p>`,
  }),
  Object.freeze({
    id: 'charged',
    title: 'جسم مشحون',
    bodyHtml: `<p>عدد الإلكترونات ≠ عدد البروتونات، فتظهر شحنة صافية موجبة أو سالبة.</p>
      <p>الشحنة الصافية تأتي من <strong>فرق</strong> العددَين، لا من اختفاء أحد النوعين.</p>`,
  }),
]);

export const CHARGE_PROTON_NOTE_HTML = `
  <p>في أمثلة التكهرب المعتادة <strong>الإلكترونات وحدها هي التي تنتقل</strong> بين الأجسام؛ فهي الأخفّ والأبعد عن النواة في المواد العازلة والناقلة.</p>
  <p>أما <strong>البروتونات</strong> فمرتبطة داخل النوى ولا تسافر من جسم إلى آخر. لهذا رسمناها ثابتة داخل الجسم، ورسمنا أسهم الانتقال للإلكترونات فقط.</p>`;

export const CHARGE_SYMBOLIC_NOTE_HTML = `
  <p>الأعداد في هذا الميزان <strong>رمزية ومصغّرة</strong> (${tex(String(SYMBOLIC_PROTONS), 'six')} بروتونات وإلكترونات) حتى ترى كل إلكترون ينتقل. الأجسام الحقيقية تحتوي أعداداً هائلة من الشحنات، والشحنات التي نتعامل معها في التمارين أصغر بكثير من كولوم واحد.</p>`;

export const CHARGE_RULE_BOOK_HTML = `
  <p class="u2l1a-book-quote">إذا فقدت المادة ${S_N} إلكترونات اكتسبت شحنة موجبة، وإذا اكتسبت ${S_N} إلكترونات أصبحت سالبة الشحنة:</p>
  ${formula('q=+ne\\quad(\\text{فقد }n\\text{ إلكتروناً})', 'q equals plus n e when the body loses n electrons')}
  ${formula('q=-ne\\quad(\\text{اكتسب }n\\text{ إلكتروناً})', 'q equals minus n e when the body gains n electrons')}
  <p>وشحنة الإلكترون الواحد: ${qty(`1.6\\times 10^{-19}`, 'C')} ${ref(76, 'قاعدة التكهرب وشحنة الإلكترون')}</p>`;

/** The lesson's own worked example, page 76, reproduced with real KaTeX steps. */
export const CHARGE_BOOK_EXAMPLE = Object.freeze({
  label: `${SOURCE_LABEL} · ص76`,
  statementHtml: `<p>دُلك جسم عازل فاكتسب شحنة موجبة قدرها ${tex('q=+8\\times 10^{-7}~\\mathrm{C}', 'q equals plus eight times ten to the power minus seven coulombs')}، فإذا علمت أن شحنة الإلكترون ${tex('e=1.6\\times 10^{-19}~\\mathrm{C}', 'e equals 1.6 times ten to the power minus nineteen coulombs')}، احسب عدد الإلكترونات التي فقدها الجسم.</p>`,
  steps: Object.freeze([
    Object.freeze({ label: 'المعطيات', html: `<p>${tex('q=+8\\times 10^{-7}~\\mathrm{C}', 'q given')}${tex('\\;,\\quad', 'and')} ${tex('e=1.6\\times 10^{-19}~\\mathrm{C}', 'e given')}</p>` }),
    Object.freeze({ label: 'المطلوب', html: `<p>عدد الإلكترونات المفقودة ${S_N}.</p>` }),
    Object.freeze({ label: 'القانون', html: formula('q=ne\\;\\Rightarrow\\;n=\\frac{q}{e}', 'n equals q over e') }),
    Object.freeze({ label: 'التعويض', html: formula('n=\\frac{8\\times 10^{-7}}{1.6\\times 10^{-19}}', 'n equals eight times ten to the minus seven over 1.6 times ten to the minus nineteen') }),
    Object.freeze({ label: 'الحساب', html: formula('n=5\\times 10^{12}\\;\\text{إلكترون}', 'n equals five times ten to the power twelve electrons') }),
    Object.freeze({ label: 'التحقق', html: `<p>الإشارة الموجبة تعني <strong>فقد</strong> إلكترونات، وهو ما ينطبق على جسم عازل دُلك فأصبح موجباً.</p>` }),
  ]),
});

/** Platform exercise built on the lesson's own activity (p76), computed live. */
export const CHARGE_PLATFORM_EXERCISE = Object.freeze({
  label: `${ENRICHMENT_LABEL} · مبني على نشاط ص76`,
  electronCount: 20e10,
  statementHtml: `<p>جسم معتدل فقد ${tex('n=20\\times 10^{10}', 'n equals twenty times ten to the power ten')} إلكتروناً. احسب الشحنة التي يكتسبها، ثم تحقّق من جوابك بالضغط على «اعرض الحل».</p>`,
});

export const CHARGE_EXERCISE_SOLUTION = (() => {
  const lost = -CHARGE_PLATFORM_EXERCISE.electronCount;
  const { charge } = chargeOfElectronCount(lost);
  return Object.freeze({
    charge,
    steps: Object.freeze([
      Object.freeze({ label: 'القانون', html: formula('q=+ne', 'q equals plus n e for lost electrons') }),
      Object.freeze({ label: 'التعويض', html: formula(`q=20\\times 10^{10}\\times 1.6\\times 10^{-19}`, 'q equals twenty times ten to the ten times 1.6 times ten to the minus nineteen') }),
      Object.freeze({ label: 'الحساب', html: formula(`q=${countTeX(20e10)}\\times ${chargeTeX(1.6e-19).replace('~\\mathrm{C}', '')}`, 'q equals the product') }),
      Object.freeze({ label: 'النتيجة', html: formula(`q=${chargeTeX(charge)}`, `q equals ${charge.toExponential(1)} coulombs, positive`) }),
      Object.freeze({ label: 'الإشارة', html: `<p>موجبة لأن الجسم <strong>فقد</strong> إلكترونات، أي صار عدد بروتوناته أكبر من عدد إلكتروناته.</p>` }),
    ]),
  });
})();

export const CHARGE_LEDGER_MODEL_LIMITS = Object.freeze([
  'الأعداد رمزية: ليست قياساً لشحنة جسم حقيقي، ولا تمثل توزيع الإلكترونات في مداراتها الحقيقية.',
  'الرسم لا يصوّر الذرة بدقة؛ الغرض هو إظهار الفرق بين العددَين فقط.',
  'الشحنة الصافية المحسوبة من الفرق مضروبة في شحنة الإلكترون، وهي علاقة صحيحة لكنها هنا على أعداد رمزية.',
]);

/* ============================================= station 3 · charging methods */

export const METHOD_CARDS = Object.freeze({
  [METHOD_FRICTION]: Object.freeze({
    title: 'التكهرب بالدلك',
    subtitle: 'مادتان عازلتان مختلفتان تُحكّان إحداهما بالأخرى',
    bodies: Object.freeze({
      a: Object.freeze({ name: 'ساق بلاستيكية', materialLabel: 'عازل', startsCharged: false }),
      b: Object.freeze({ name: 'قطعة صوف', materialLabel: 'عازل', startsCharged: false }),
    }),
    steps: Object.freeze([
      Object.freeze({ id: 'before', label: 'قبل الدلك', action: 'لاحظ الجسمين وهما معتدلان' }),
      Object.freeze({ id: 'rub', label: 'ادلك', action: 'ادلك الساق بقطعة الصوف' }),
      Object.freeze({ id: 'test', label: 'اختبر', action: 'قرّب الطرف المدلوك من قصاصات الورق' }),
    ]),
    bookHtml: `<p class="u2l1a-book-quote">عند دلك مادتين مختلفتين إحداهما بالأخرى ينتقل عدد من الإلكترونات من إحداهما إلى الأخرى: فالمادة التي <strong>تفقد</strong> إلكترونات تكتسب شحنة موجبة، والمادة التي <strong>تكتسب</strong> إلكترونات تصبح سالبة الشحنة، وهذا ما يسمى بالتكهرب. وتبقى الشحنات ساكنة على الطرف المدلوك من المادة العازلة.</p>${ref(76, 'استنتاج التكهرب بالدلك')}`,
    keyDifference: 'الطريقة الوحيدة التي تبدأ من جسمين معتدلين كليهما، وتنتهي بشحنتين متساويتين ومتخالفتين.',
  }),
  [METHOD_CONTACT]: Object.freeze({
    title: 'التكهرب باللمس',
    subtitle: 'جسم مشحون يلامس جسماً ناقلاً معتدلاً',
    bodies: Object.freeze({
      a: Object.freeze({ name: 'ساق بلاستيكية مشحونة سالبة', materialLabel: 'عازل', startsCharged: true }),
      b: Object.freeze({ name: 'كرة معدنية على عازل', materialLabel: 'ناقل', startsCharged: false }),
    }),
    steps: Object.freeze([
      Object.freeze({ id: 'before', label: 'قبل اللمس', action: 'لاحظ الساق المشحونة والكرة المعتدلة' }),
      Object.freeze({ id: 'touch', label: 'لامس', action: 'اجعل الساق تلامس الكرة' }),
      Object.freeze({ id: 'separate', label: 'افصل', action: 'أبعد الساق عن الكرة' }),
    ]),
    bookHtml: `<p class="u2l1a-book-quote">يتكهرب الجسم غير المشحون عندما يلامسه جسم مشحون كهربائياً، نتيجة انتقال بعض الشحنات الكهربائية بينهما. والتكهرب باللمس يُكسب الجسم غير المشحون شحنة <strong>مماثلة بالنوع</strong> لشحنة الجسم المشحون.</p>${ref(78, 'استنتاج التكهرب باللمس')}`,
    keyDifference: 'الجسم المعتدل يأخذ من شحنة الجسم المشحون نفسها، فيصبح من النوع نفسه، وتقل شحنة الجسم المشحون قليلاً.',
  }),
  [METHOD_INDUCTION]: Object.freeze({
    title: 'التكهرب بالتأثير',
    subtitle: 'جسم مشحون يقترب من ناقل معتدل دون أن يلامسه',
    bodies: Object.freeze({
      a: Object.freeze({ name: 'ساق بلاستيكية مشحونة سالبة', materialLabel: 'عازل', startsCharged: true }),
      b: Object.freeze({ name: 'كرة معدنية على عازل', materialLabel: 'ناقل', startsCharged: false }),
    }),
    steps: Object.freeze([
      Object.freeze({ id: 'before', label: 'قبل التقريب', action: 'لاحظ الساق المشحونة والكرة المعتدلة' }),
      Object.freeze({ id: 'approach', label: 'قرّب دون لمس', action: 'قرّب الساق من الكرة دون ملامسة' }),
      Object.freeze({ id: 'ground', label: 'أرِّض', action: 'المس الكرة بطرف إصبعك والساق قريبة' }),
      Object.freeze({ id: 'unground', label: 'أبعد الإصبع', action: 'أبعد إصبعك أولاً والساق ما تزال قريبة' }),
      Object.freeze({ id: 'withdraw', label: 'أبعد الساق', action: 'ثم أبعد الساق عن الكرة' }),
    ]),
    bookHtml: `<p class="u2l1a-book-quote">يتكهرب الجسم الناقل غير المشحون عندما يجاوره جسم مشحون كهربائياً، نتيجة <strong>إعادة توزّع</strong> الشحنات الكهربائية داخل الجسم الناقل: تتجمع الشحنات المخالفة بالنوع في الطرف القريب من الجسم المشحون المؤثر، بينما تتجمع الشحنات المماثلة بالنوع في الطرف البعيد عنه.</p>${ref(79, 'استنتاج التكهرب بالتأثير')}`,
    platformHtml: `<p>خطوات التجربة في الكتاب (ص79) تنتهي بأن تُبعد الإصبع ثم الساق معاً. ما الذي يبقى على الكرة عندئذ؟</p>
      <p>عند التأريض بالإصبع تخرج الإلكترونات المتدافعة في الطرف البعيد إلى الأرض، فإذا أبعدتَ الإصبع صارت الكرة <strong>موجبة</strong>، وإذا أبعدتَ الساق afterward انتشرت هذه الشحنة على سطحها وبقيت <strong>مخالفة بالنوع</strong> لشحنة الساق المؤثرة.</p>
      <p>هذه النتيجة (إشارة الشحنة بعد التأريض) <strong>شرح من المنصة</strong> مبني على مبدأ حفظ الشحنة، وليست نصاً حرفياً من استنتاج الكتاب.</p>`,
    keyDifference: 'لا ينتقل أي إلكترون بين الجسمين؛ الانتقال يحدث بين الكرة والأرض، وتبقى شحنة الساق كما هي.',
  }),
});

/** Per-step observation and explanation, keyed `${method}:${stepId}`. */
export const METHOD_STEP_COPY = Object.freeze({
  'friction:before': Object.freeze({
    observation: 'الجسمان معتدلان: في كل منهما شحنات موجبة وسالبة متوازنة، ولا يظهر أي أثر كهربائي.',
    explanation: 'قبل الدلك لا يوجد سبب لانتقال الإلكترونات؛ فالمادتان في حالتهما العادية متعادلتان.',
  }),
  'friction:rub': Object.freeze({
    observation: 'انتقلت إلكترونات من قطعة الصوف إلى الساق البلاستيكية: صارت الساق سالبة وصار الصوف موجباً.',
    explanation: 'الدلك قرّب سطحَي المادتين المختلفتين، فانتقل عدد من الإلكترونات من إحداهما إلى الأخرى. السالب اكتسب إلكترونات والموجب فقدها، والشحنتان متساويتان في المقدار ومتخالفتان في النوع.',
  }),
  'friction:test': Object.freeze({
    observation: 'الطرف المدلوك وحده هو الذي يجذب القصاصات الخفيفة، وتبقى الشحنات ساكنة عليه.',
    explanation: 'في العازل لا تتحرك الشحنات بحرية، فتستقر حيث وُضعت: على الطرف المدلوك. لهذا نقول «كهرباء ساكنة».',
  }),
  'contact:before': Object.freeze({
    observation: 'الساق مشحونة بشحنة سالبة، والكرة المعدنية معتدلة.',
    explanation: 'الكرة ناقل: فيها إلكترونات حرة تستطيع الحركة داخلها، لكن شحنتها الصافية ما تزال صفراً.',
  }),
  'contact:touch': Object.freeze({
    observation: 'عند التلامس انتقل جزء من إلكترونات الساق الزائدة إلى الكرة، فانتشرت على سطحها.',
    explanation: 'التلامس وفرّ طريقاً لانتقال الشحنات بين الجسمين، فاكتسبت الكرة شحنة من النوع نفسه (سالبة)، ونقصت شحنة الساق قليلاً لأن بعض إلكتروناتها انتقل.',
  }),
  'contact:separate': Object.freeze({
    observation: 'بعد الفصل بقيت الكرة سالبة الشحنة، وبقيت الساق سالبة لكن بشحنة أقل.',
    explanation: 'الشحنة التي انتقلت لا تعود وحدها بعد الفصل؛ لذلك يحتفظ كل جسم بما صار عنده. مجموع شحنَتَي الجسمين لم يتغيّر: الشحنة لا تُستحدث ولا تفنى.',
  }),
  'induction:before': Object.freeze({
    observation: 'الساق مشحونة سالبة، والكرة المعدنية معتدلة وشحناتها موزعة بانتظام.',
    explanation: 'لم يقترب أي جسم مشحون بعد، فلا سبب لإعادة توزيع الشحنات داخل الناقل.',
  }),
  'induction:approach': Object.freeze({
    observation: 'اقتربت الساق دون لمس: تجمّعت الشحنات الموجبة في الطرف القريب من الساق، والسالبة في الطرف البعيد.',
    explanation: 'الإلكترونات الحرة داخل الناقل تدافعت مع الشحنة السالبة القريبة فابتعدت عنها. الشحنة الصافية للكرة ما تزال <strong>صفراً</strong>: لم يدخل إليها إلكترون ولم يخرج منها.',
  }),
  'induction:ground': Object.freeze({
    observation: 'لمستَ الكرة بإصبعك والساق قريبة: خرجت إلكترونات من الكرة إلى الأرض عبر إصبعك.',
    explanation: 'الأرض مستودع هائل للشحنات، والطريق المفتوح سمح للإلكترونات المتدافعة في الطرف البعيد بمغادرة الكرة. الآن صارت الشحنة الصافية للكرة موجبة، وما زالت الساق سالبة كما هي.',
  }),
  'induction:unground': Object.freeze({
    observation: 'أبعدتَ إصبعك والساق ما تزال قريبة: بقيت الكرة بشحنتها الموجبة.',
    explanation: 'بإغلاق طريق الأرض لم يعد أمام الشحنات مخرج؛ فالكرة صارت مشحونة فعلاً، لا متأثرة فقط.',
  }),
  'induction:withdraw': Object.freeze({
    observation: 'أبعدتَ الساق: انتشرت الشحنة الموجبة على سطح الكرة وبقيت لها.',
    explanation: 'بزوال المؤثر ينتهي الاستقطاب، وتبقى الشحنة التي اكتُسبت بالتأثير مع التأريض. لاحظ أن <strong>شحنتها مخالفة بالنوع</strong> لشحنة الجسم المؤثر، وأن الساق لم تفقد أي إلكترون.',
  }),
});

export const METHOD_COMPARISON_ROWS = Object.freeze([
  Object.freeze({ id: 'electrons-between-bodies', label: 'هل انتقلت إلكترونات بين الجسمين؟' }),
  Object.freeze({ id: 'net-charge-of-partner-changed', label: 'هل تغيّرت الشحنة الصافية للجسم المعتدل؟' }),
  Object.freeze({ id: 'partner-sign-vs-rod', label: 'إشارة شحنة الجسم الثاني مقارنة بالساق' }),
  Object.freeze({ id: 'rod-keeps-its-charge', label: 'هل احتفظت الساق بشحنتها كاملة؟' }),
  Object.freeze({ id: 'final-distribution', label: 'أين تستقر الشحنات على الجسم الثاني؟' }),
  Object.freeze({ id: 'mechanism', label: 'الآلية' }),
  Object.freeze({ id: 'system-charge-conserved', label: 'هل بقي مجموع شحنات المنظومة محفوظاً؟' }),
]);

export const METHOD_COMPARISON_VALUES = Object.freeze({
  yes: 'نعم',
  no: 'لا',
  same: 'مماثلة بالنوع',
  opposite: 'مخالفة بالنوع',
  neutral: 'متعادل',
  'localized-at-rubbed-end': 'على الطرف المدلوك (عازل)',
  'spread-over-surface': 'منتشرة على السطح (ناقل)',
  uniform: 'موزعة بانتظام',
  'transfer-between-bodies': 'انتقال إلكترونات بين جسمين',
  'transfer-with-ground': 'انتقال إلكترونات مع الأرض',
  'redistribution-only': 'إعادة توزيع داخل الجسم',
  'no-transfer': 'لا انتقال',
});

export const METHOD_ELECTROSCOPE_NOTE_HTML = `
  <p>في تجارب الكتاب يُستعمل <strong>الكاشف الكهربائي</strong> بدل الكرة المعدنية في بعض الخطوات: قرص ناقل، وساق ناقلة، ووريقتان ناقلتان خفيفتان داخل وعاء زجاجي عازل.</p>
  <p>انفراج الوريقتين يدل على أن الجسم <strong>مشحون</strong>؛ أما نوع الشحنة فلا يُعرف من الانفراج وحده.</p>
  ${ref(74, 'الكاشف الكهربائي ومبدأ عمله')}`;

export const METHOD_MODEL_LIMITS = Object.freeze([
  'أعداد الإلكترونات المعروضة رمزية ومصغّرة، والغرض إظهار الاتجاه والمقدار النسبي لا القيمة الحقيقية.',
  'النموذج لا يمثّل زمن الانتقال ولا كمية الشحنة الحقيقية ولا أثر رطوبة الهواء.',
  'في اللمس تعتمد الكمية المنتقلة فعلياً على شكل الجسمين ومادتهما؛ هنا نعرض إلكتروناً واحداً رمزياً.',
  'التأريض بالإصبع مبسّط: الأرض مستودع ضخم للشحنات، ولا يرسم النموذج مسار الإلكترونات داخل الجسم.',
]);

/* ================================================ station 4 · force arena */

export const ARENA_INTRO_HTML = `
  <p>في الساحة جسمان مشحونان على مستقيم واحد. اختر إشارة شحنة كل جسم، ثم توقّع ما سيحدث قبل أن تكشف النتيجة.</p>
  <p>السهمان المرسومان يمثّلان <strong>القوة المؤثرة على كل جسم</strong>: انتبه إلى جهتهما وطولهما.</p>`;

export const ARENA_PREDICTION_PROMPT = 'توقّع أولاً: ماذا يحدث بين الجسمين عند تحريرهما؟';

export const ARENA_PREDICTIONS = Object.freeze([
  Object.freeze({ id: ATTRACTION, label: 'يتجاذبان ويقترب أحدهما من الآخر' }),
  Object.freeze({ id: REPULSION, label: 'يتنافران ويبتعد أحدهما عن الآخر' }),
]);

export const ARENA_RULE_BOOK_HTML = `
  <p class="u2l1a-book-quote">الشحنات الكهربائية المتماثلة <strong>تتنافر</strong>، والشحنات الكهربائية المختلفة <strong>تتجاذب</strong>.</p>
  ${ref(77, 'الأفعال المتبادلة بين الشحنات')}`;

export const ARENA_FORCE_ELEMENTS_BOOK_HTML = `
  <p class="u2l1a-book-quote">عناصر قوة كولوم: <strong>نقطة التأثير</strong> — الشحنة المتأثرة، <strong>الحامل</strong> — المستقيم المارّ من الشحنتين، <strong>الجهة</strong> — تجاذبية إذا كانت الشحنتان مختلفتين نوعاً وتنافرية إذا كانت متماثلتين نوعاً، <strong>الشدة</strong> — تُعطى بالعلاقة ${S_F}${tex('=', 'equals')}${S_K}${S_Q1Q2}${tex('/', 'over')}${S_D}${tex('^{2}', 'squared')}.</p>
  ${ref(80, 'عناصر قوة كولوم')}`;

export const ARENA_KIND_COPY = Object.freeze({
  [ATTRACTION]: Object.freeze({
    headline: 'تجاذب',
    bodyHtml: `<p>الشحنتان مختلفتان في النوع، فكل جسم يُسحب نحو الجسم الآخر. السهم المرسوم على كل جسم يشير <strong>نحو</strong> الجسم الآخر، والحامل هو المستقيم نفسه الذي يصل بينهما.</p>`,
  }),
  [REPULSION]: Object.freeze({
    headline: 'تنافر',
    bodyHtml: `<p>الشحنتان متماثلتان في النوع، فكل جسم يُدفع بعيداً عن الآخر. السهم المرسوم على كل جسم يشير <strong>بعيداً</strong> عن الجسم الآخر، على الحامل نفسه.</p>`,
  }),
  none: Object.freeze({
    headline: 'لا قوة',
    bodyHtml: `<p>إحدى الشحنتين صفر: لا تظهر قوة كهربائية متبادلة.</p>`,
  }),
});

export const ARENA_EQUAL_FORCES_NOTE_HTML = `
  <p>لاحظ أن <strong>طولَي السهمين متساويان دائماً</strong> في الساحة، حتى حين تجعل مقدار إحدى الشحنتين أكبر من الأخرى.</p>
  <p>السبب: القوتان المتبادلتان بين جسمين متساويتان في الشدة ومتعاكستان في الجهة، وتؤثر كل منهما في <strong>جسم مختلف</strong>. الشحنة الأكبر لا تعني قوة أكبر على الجسم الآخر وحده.</p>
  <p class="u2l1a-label-inline">${ENRICHMENT_LABEL}</p>`;

export const ARENA_MODEL_LIMITS = Object.freeze([
  'الحركة المعروضة تقريبية ومحدودة بإطار الرسم: لا تحسب كتلة ولا تسارعاً ولا احتكاكاً.',
  'الأجسام مرسومة كرتين، والقوى تُحسب كما لو كانت الشحنات نقطية على المستقيم الواصل بينهما.',
  'المسافة والزمن في الرسم ليست قياسات حقيقية؛ الغرض إظهار الجهة والاتساق معها.',
]);

/* ================================================== station 5 · Coulomb lab */

export const COULOMB_INTRO_HTML = `
  <p>غيّر مقدار ${S_Q1} و${S_Q2} وإشارتيهما والمسافة ${S_D} بين الشحنتين، ثم لاحظ كيف تتغيّر شدة القوة ${S_F}. كل رقم تراه محسوب من قيمك أنت.</p>`;

export const COULOMB_LAW_BOOK_HTML = `
  <p class="u2l1a-book-quote">درس كولوم العوامل التي تؤثر على شدة القوة المتبادلة بين شحنتين نقطيتين ${S_Q1} و${S_Q2} تبعدان عن بعضهما مسافة ${S_D} ويفصل بينهما الخلاء، فوجد أن القوة ${S_F}: تتناسب <strong>طرداً</strong> مع كل من الشحنتين، وتتناسب <strong>عكساً</strong> مع مربع البعد بينهما:</p>
  ${COULOMB_LAW_HTML}
  <p>وثابت التناسب ${S_K} يسمى ثابت كولوم، ويتعلق بالوحدات المستعملة وبالوسط الفاصل بين الشحنتين، وقيمته في الخلاء: ${COULOMB_CONSTANT_HTML}</p>
  ${ref(80, 'قانون كولوم وثابته')}`;

export const COULOMB_SYMBOL_LEGEND = Object.freeze([
  Object.freeze({ id: 'F', symbol: S_F, meaning: 'شدة القوة الكهربائية المتبادلة (مقدار موجب دائماً)', unitText: 'نيوتن N' }),
  Object.freeze({ id: 'q1', symbol: S_Q1, meaning: 'مقدار الشحنة الأولى مع إشارتها', unitText: 'كولوم C (في المختبر ميكروكولوم μC)' }),
  Object.freeze({ id: 'q2', symbol: S_Q2, meaning: 'مقدار الشحنة الثانية مع إشارتها', unitText: 'كولوم C (في المختبر ميكروكولوم μC)' }),
  Object.freeze({ id: 'd', symbol: S_D, meaning: 'المسافة بين الشحنتين', unitText: 'متر m (في المختبر سنتيمتر cm)' }),
  Object.freeze({ id: 'K', symbol: S_K, meaning: 'ثابت كولوم، ويتعلق بالوحدات والوسط الفاصل', unitText: tex('9\\times 10^{9}~\\mathrm{N\\cdot m^{2}\\cdot C^{-2}}', 'K value') }),
]);

export const COULOMB_UNIT_NOTE_HTML = `
  <p>قبل التعويض في القانون نحوّل الوحدات إلى النظام الدولي: ${tex('1~\\mu\\mathrm{C}=10^{-6}~\\mathrm{C}', 'one microcoulomb equals ten to the minus six coulombs')} و${tex('1~\\mathrm{cm}=10^{-2}~\\mathrm{m}', 'one centimetre equals ten to the minus two metres')}. المختبر يعرض التحويل تحت كل منزلق.</p>`;

export const COULOMB_MAGNITUDE_VS_DIRECTION_HTML = `
  <p>العلاقة ${COULOMB_LAW_HTML} تحسب <strong>مقدار</strong> القوة، وهو رقم موجب دائماً.</p>
  <p>أما <strong>الجهة</strong> (تجاذب أم تنافر) فتحددها إشارتا الشحنتين: متماثلتان ⇒ تنافر، مختلفتان ⇒ تجاذب. لهذا يعرض المختبر المقدار والنوع في خانتين منفصلتين.</p>`;

/** The lesson's own worked example (p81) — the lab can load it and must return 36 N. */
export const COULOMB_BOOK_EXAMPLE = Object.freeze({
  label: `${SOURCE_LABEL} · ص81`,
  state: BOOK_COULOMB_STATE,
  statementHtml: `<p>شحنتان نقطيتان ساكنتان ${tex('q_{1}=50\\times 10^{-6}~\\mathrm{C}', 'q one')} و${tex('q_{2}=80\\times 10^{-6}~\\mathrm{C}', 'q two')} تبعدان عن بعضهما في الخلاء مسافة ${tex('d=1~\\mathrm{m}', 'd one metre')}. احسب شدة القوة الكهربائية المتبادلة بينهما.</p>`,
  expectedForceN: 36,
  steps: Object.freeze([
    Object.freeze({ label: 'المعطيات', html: `<p>${tex('q_{1}=50\\times 10^{-6}~\\mathrm{C},\\; q_{2}=80\\times 10^{-6}~\\mathrm{C},\\; d=1~\\mathrm{m}', 'given values')}</p>` }),
    Object.freeze({ label: 'القانون', html: COULOMB_LAW_HTML }),
    Object.freeze({ label: 'التعويض', html: formula('F=9\\times 10^{9}\\times\\frac{(50\\times 10^{-6})(80\\times 10^{-6})}{1^{2}}', 'substitution into Coulomb law') }),
    Object.freeze({ label: 'الحساب', html: formula('F=36~\\mathrm{N}', 'F equals thirty-six newtons') }),
    Object.freeze({ label: 'الجهة', html: `<p>الشحنتان موجبتان (متماثلتان) ⇒ القوة <strong>تنافرية</strong>، وحاملها المستقيم المارّ بالشحنتين.</p>` }),
  ]),
});

export const COULOMB_FIELD_COPY = Object.freeze({
  q1: Object.freeze({ hint: 'الشحنة الأولى على يسار الرسم' }),
  q2: Object.freeze({ hint: 'الشحنة الثانية على يمين الرسم' }),
  d: Object.freeze({ hint: 'المسافة بين مركزي الشحنتين' }),
});

export const COULOMB_PROBE_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'double-q1',
    promptHtml: `ماذا يحدث لشدة القوة ${S_F} إذا <strong>ضاعفتَ مقدار ${S_Q1}</strong> وأبقيت ${S_Q2} والمسافة ${S_D} كما هما؟`,
    why: `الشدة تتناسب طرداً مع كل من الشحنتين: مضاعفة ${S_Q1} وحدها تضاعف البسط، فتتضاعف ${S_F}.`,
  }),
  Object.freeze({
    id: 'double-q2',
    promptHtml: `ماذا يحدث لشدة القوة ${S_F} إذا <strong>ضاعفتَ مقدار ${S_Q2}</strong> وأبقيت ${S_Q1} والمسافة ${S_D} كما هما؟`,
    why: `القانون لا يفرّق بين ${S_Q1} و${S_Q2}: أيّهما تضاعف، تتضاعف الشدة.`,
  }),
  Object.freeze({
    id: 'double-both-charges',
    promptHtml: `ماذا يحدث لشدة القوة ${S_F} إذا <strong>ضاعفتَ الشحنتين معاً</strong> وأبقيت المسافة ${S_D} كما هي؟`,
    why: `مضاعفة كل شحنة تسهم بعامل 2، والعاملان يتضاربون: ${tex('2\\times 2=4', 'two times two equals four')} ⇒ الشدة تصبح أربعة أضعاف.`,
  }),
  Object.freeze({
    id: 'double-distance',
    promptHtml: `ماذا يحدث لشدة القوة ${S_F} إذا <strong>ضاعفتَ المسافة ${S_D}</strong> وأبقيت الشحنتين كما هما؟`,
    why: `المسافة في <strong>المقام ومربّعة</strong>: مضاعفتها تجعل المقام أربعة أمثاله، فتصبح الشدة الربع.`,
  }),
  Object.freeze({
    id: 'halve-distance',
    promptHtml: `ماذا يحدث لشدة القوة ${S_F} إذا جعلتَ <strong>المسافة ${S_D} نصف</strong> ما كانت عليه وأبقيت الشحنتين كما هما؟`,
    why: `تنصيف المسافة يجعل المقام ربعاً، فتصبح الشدة أربعة أضعاف.`,
  }),
]);

export const COULOMB_RATIO_CHOICES = Object.freeze([
  Object.freeze({ id: RATIO_QUADRUPLE, label: 'تصبح أربعة أضعاف' }),
  Object.freeze({ id: RATIO_DOUBLE, label: 'تتضاعف' }),
  Object.freeze({ id: RATIO_UNCHANGED, label: 'لا تتغيّر' }),
  Object.freeze({ id: RATIO_HALF, label: 'تصبح النصف' }),
  Object.freeze({ id: RATIO_QUARTER, label: 'تصبح الربع' }),
]);

export const COULOMB_RATIO_TEXT = Object.freeze({
  [RATIO_QUADRUPLE]: 'أربعة أضعاف',
  [RATIO_DOUBLE]: 'الضعف',
  [RATIO_HALF]: 'النصف',
  [RATIO_QUARTER]: 'الربع',
  [RATIO_UNCHANGED]: 'بلا تغيّر',
  [RATIO_OTHER]: 'نسبة أخرى',
});

/**
 * The explanation of one probe is always built from the numbers the student
 * actually set, never from a fixed sentence: base force, new force, ratio.
 */
export function probeExplanation(probeId, result) {
  const question = COULOMB_PROBE_QUESTIONS.find((candidate) => candidate.id === probeId);
  if (!question) throw new RangeError(`Unknown probe: ${probeId}`);
  const base = result.base.formatted;
  const next = result.next.formatted;
  const ratioText = COULOMB_RATIO_TEXT[result.ratioClass] ?? `×${Number(result.ratio.toFixed(3))}`;
  const outside = result.outsideGrid
    ? `<p class="u2l1a-note-inline">القيمة المضاعفة تقع خارج مدى المنزلقات، لذلك حُسبت المقارنة رياضياً على القيم نفسها دون تحريك المؤشر.</p>`
    : '';
  return `
    <p>قبل التغيير: ${ltrText(base)} — بعد التغيير: ${ltrText(next)} ⇒ الشدة صارت <strong>${ratioText}</strong> ما كانت عليه.</p>
    <p>${question.why}</p>
    ${outside}`;
}

export const COULOMB_MODEL_LIMITS = Object.freeze([
  'الشحنتان تُعتبران نقطيتين، والمسافة d هي بين مركزيهما، والوسط المفروض هو الخلاء كما في نص القانون.',
  'القانون يعطي مقدار القوة فقط؛ الجهة تُستنتج من إشارتَي الشحنتين ولا تدخل في الحساب.',
  'القيم الكبيرة جداً أو المسافات الصغيرة جداً تخرج عن قصد النموذج: في الهواء الحقيقي قد يحدث تفريغ كهربائي (شرارة) قبل بلوغها.',
  'لا يدخل في الحساب أي أثر للجسم الحامل أو لرطوبة الهواء أو لشحنات أخرى قريبة.',
]);

export const COULOMB_BEYOND_RANGE_NOTE = 'قيمة كبيرة جداً بالنسبة إلى نموذج الشحنات النقطية في الخلاء: في الواقع قد يحدث تفريغ كهربائي قبل الوصول إليها. غيّر القيم لتبقى داخل نطاق معقول.';

/* ============================================ station 6 · detective challenge */

export const DETECTIVE_INTRO_HTML = `
  <p>سبعة مواقف قصيرة تجمع ما اكتشفته في المحطات السابقة. اقرأ الموقف، اختر جوابك، ثم اضغط «تحقّق من جوابي».</p>
  <p>لن ترى أي تصحيح قبل محاولتك، وبعد كل محاولة يظهر تفسير قصير. يمكنك إعادة المحاولة في أي وقت دون أي خصم.</p>
  <p class="u2l1a-label-inline">${NOT_BOOK_QUESTIONS_LABEL}</p>`;

export const DETECTIVE_QUESTIONS = Object.freeze([
  Object.freeze({
    id: 'electroscope-reading',
    stationRef: 'charge',
    context: 'قرّبتَ جسماً مجهولاً من قرص كاشف كهربائي معتدل، فانفرجت وريقتاه وابتعدت إحداهما عن الأخرى.',
    prompt: 'ماذا تستنتج من هذه الملاحظة وحدها؟',
    correctChoice: 'charged-sign-unknown',
    choices: Object.freeze([
      Object.freeze({ id: 'charged-sign-unknown', label: 'الجسم مشحون، لكن نوع شحنته لا يُحدَّد من هذه الملاحظة وحدها.', feedbackHtml: '<p><strong>صحيح.</strong> انفراج الوريقتين يعني أن كلتيهما اكتسبت شحنة من النوع نفسه فتدافعتا، وهذا يدل على أن الجسم المقرَّب مشحون. أما نوع الشحنة فيحتاج مقارنة بجسم معلوم الشحنة.</p>' }),
      Object.freeze({ id: 'positive-only', label: 'الجسم مشحون بشحنة موجبة بالتأكيد.', feedbackHtml: '<p><strong>غير صحيح.</strong> الوريقتان تنفرجان مع الشحنة الموجبة ومع الشحنة السالبة على السواء؛ الانفراج يدل على وجود شحنة لا على نوعها.</p>' }),
      Object.freeze({ id: 'neutral-body', label: 'الجسم معتدل لأن الوريقتين تحركتا.', feedbackHtml: '<p><strong>غير صحيح.</strong> لو كان الجسم معتدلاً لبقيت الوريقتان منطبقتين. الانفراج نفسه هو دليل وجود الشحنة.</p>' }),
      Object.freeze({ id: 'opposite-leaves', label: 'الوريقتان اكتسبتا شحنتين مخالفتين فتجاذبتا.', feedbackHtml: '<p><strong>غير صحيح.</strong> الوريقتان انفرجتا أي ابتعدتا، وهذا تنافر بين شحنتين متماثلتين، لا تجاذب بين مخالفتين.</p>' }),
    ]),
  }),
  Object.freeze({
    id: 'induction-sign',
    stationRef: 'methods',
    context: 'كرة معدنية معتدلة محمولة على عازل. قرّبتَ منها ساقاً بلاستيكية مشحونة بشحنة سالبة <strong>دون أن تلمسها</strong>، ثم لمستَ الكرة بطرف إصبعك لحظة، ثم أبعدتَ إصبعك، وبعده أبعدتَ الساق.',
    prompt: 'ما طريقة التكهرب، وما شحنة الكرة في النهاية؟',
    correctChoice: 'induction-positive',
    choices: Object.freeze([
      Object.freeze({ id: 'induction-positive', label: 'تكهرب بالتأثير (مع التأريض بالإصبع)، وشحنة الكرة موجبة.', feedbackHtml: '<p><strong>صحيح.</strong> الاقتراب دون لمس أعاد توزيع الشحنات داخل الناقل، والإصبع فتح طريقاً خرجت منه الإلكترونات المتدافعة إلى الأرض. بعد إبعاد الإصبع ثم الساق تبقى الكرة بشحنة مخالفة بالنوع لشحنة الساق المؤثرة: موجبة.</p>' }),
      Object.freeze({ id: 'contact-negative', label: 'تكهرب باللمس، وشحنة الكرة سالبة.', feedbackHtml: '<p><strong>غير صحيح.</strong> لم يحدث تلامس بين الساق والكرة، واللمس يستلزم تماساً مباشراً ينتقل فيه جزء من شحنة الجسم المشحون إلى الجسم المعتدل.</p>' }),
      Object.freeze({ id: 'induction-negative', label: 'تكهرب بالتأثير، وشحنة الكرة سالبة.', feedbackHtml: '<p><strong>غير صحيح.</strong> الطريقة صحيحة لكن الإشارة معكوسة: في التأثير مع التأريض يكتسب الناقل شحنة مخالفة للنوع، لا مماثلة.</p>' }),
      Object.freeze({ id: 'friction-positive', label: 'تكهرب بالدلك، وشحنة الكرة موجبة.', feedbackHtml: '<p><strong>غير صحيح.</strong> لا يوجد هنا حكّ بين مادتين مختلفتين؛ الدلك يحتاج دلك سطحين أحدهما بالآخر.</p>' }),
    ]),
  }),
  Object.freeze({
    id: 'glass-and-plastic',
    stationRef: 'forces',
    context: 'ساق زجاجية دُلكت بقطعة حرير فأصبحت موجبة الشحنة، وكرة بلاستيكية دُلكت بالصوف فأصبحت سالبة الشحنة، وكلتاهما معلّقة بخيط عازل. قرّبتَ الساق من الكرة.',
    prompt: 'ماذا تتوقّع أن يحدث، ولماذا؟',
    correctChoice: 'attract-unlike',
    choices: Object.freeze([
      Object.freeze({ id: 'attract-unlike', label: 'تتجاذبان لأن شحنتيهما مختلفتان في النوع.', feedbackHtml: '<p><strong>صحيح.</strong> الشحنات المختلفة تتجاذب. ولاحظ أن الدلك نقل إلكترونات من الزجاج إلى الحرير ومن الصوف إلى البلاستيك، فصار الزجاج موجباً والبلاستيك سالباً.</p>' }),
      Object.freeze({ id: 'repel-both-charged', label: 'تتنافران لأن كلاً منهما مشحونة.', feedbackHtml: '<p><strong>غير صحيح.</strong> كون الجسمين مشحونين لا يكفي للتنافر؛ التنافر يحتاج شحنتين متماثلتين في النوع، وهما هنا مختلفة.</p>' }),
      Object.freeze({ id: 'nothing-static', label: 'لا يحدث شيء لأن الشحنات ساكنة.', feedbackHtml: '<p><strong>غير صحيح.</strong> «ساكنة» تعني أنها لا تسري في سلك، لا أنها بلا أثر؛ القوى بين الشحنات الساكنة موجودة وتُحدث تجاذباً أو تنافراً.</p>' }),
      Object.freeze({ id: 'attract-lost-protons', label: 'تتجاذبان لأن الزجاج فقد بروتونات فأصبح موجباً.', feedbackHtml: '<p><strong>غير صحيح.</strong> النتيجة صحيحة لكن التعليل خاطئ: البروتونات لا تنتقل بالدلك، بل الإلكترونات؛ والزجاج صار موجباً لأنه فقد إلكترونات.</p>' }),
    ]),
  }),
  Object.freeze({
    id: 'compare-two-setups',
    stationRef: 'coulomb',
    context: `شحنتان نقطيتان ${tex('q', 'q')} و${tex('q', 'q')} تفصل بينهما مسافة ${tex('d', 'd')}، وشدة القوة بينهما ${tex('F', 'F')}. في حالة ثانية جعلنا الشحنة الأولى ${tex('2q', 'two q')} وأبقينا الثانية ${tex('q', 'q')}، وجعلنا المسافة ${tex('2d', 'two d')}.`,
    prompt: 'كيف تصبح شدة القوة في الحالة الثانية؟',
    correctChoice: 'half',
    choices: Object.freeze([
      Object.freeze({ id: 'half', label: `${tex('F/2', 'F over two')} أي نصف ما كانت عليه.`, feedbackHtml: `<p><strong>صحيح.</strong> مضاعفة إحدى الشحنتين تضاعف الشدة (عامل 2)، ومضاعفة المسافة تجعل الشدة ربعاً لأن ${tex('d', 'd')} مربّعة في المقام (عامل ${tex('1/4', 'one quarter')}). المحصلة: ${tex('2\\times\\frac{1}{4}=\\frac{1}{2}', 'two times one quarter equals one half')}.</p>` }),
      Object.freeze({ id: 'unchanged', label: `${tex('F', 'F')} نفسها لأن الزيادة والنقصان يتعوضان.`, feedbackHtml: '<p><strong>غير صحيح.</strong> التعويض ليس بهذه البساطة: المسافة تدخل مربّعة، فأثر مضاعفتها (÷4) أكبر من أثر مضاعفة الشحنة (×2).</p>' }),
      Object.freeze({ id: 'double', label: `${tex('2F', 'two F')}`, feedbackHtml: '<p><strong>غير صحيح.</strong> هذا جواب من ينسى أثر المسافة؛ مضاعفة d تقلّل الشدة إلى الربع، فلا تبقى النتيجة ضعفاً.</p>' }),
      Object.freeze({ id: 'quarter', label: `${tex('F/4', 'F over four')}`, feedbackHtml: '<p><strong>غير صحيح.</strong> هذا أثر المسافة وحدها؛ بقي أن الشحنة الأولى تضاعفت أيضاً فيجب ضرب النتيجة في 2.</p>' }),
    ]),
  }),
  Object.freeze({
    id: 'find-the-error',
    stationRef: 'charge',
    context: 'قال زميلك: «عند دلك ساق البلاستيك بقطعة الصوف انتقلت <strong>بروتونات</strong> من الصوف إلى البلاستيك، ولذلك اكتسب البلاستيك شحنة سالبة».',
    prompt: 'أين الخطأ في تفسيره؟',
    correctChoice: 'electrons-move',
    choices: Object.freeze([
      Object.freeze({ id: 'electrons-move', label: 'الخطأ في نوع الجسيمات: الذي ينتقل بالدلك هو الإلكترونات لا البروتونات، واكتساب البلاستيك إلكترونات هو ما يجعله سالباً.', feedbackHtml: '<p><strong>صحيح.</strong> البروتونات مرتبطة داخل النوى ولا تنتقل بين الأجسام في هذه الأمثلة. انتقال إلكترونات من الصوف إلى البلاستيك يجعل البلاستيك سالباً والصوف موجباً، والشحنتان متساويتان في المقدار.</p>' }),
      Object.freeze({ id: 'sign-flipped', label: 'الخطأ أن البلاستيك يصبح موجباً لا سالباً.', feedbackHtml: '<p><strong>غير صحيح.</strong> البلاستيك المدلوك بالصوف يصبح سالباً فعلاً لأنه يكتسب إلكترونات؛ الخطأ الحقيقي في كلام زميلك هو ذكر البروتونات.</p>' }),
      Object.freeze({ id: 'nothing-moves', label: 'الخطأ أنه لا تنتقل أي جسيمات بين الجسمين.', feedbackHtml: '<p><strong>غير صحيح.</strong> الدلك ينقل إلكترونات فعلاً من إحدى المادتين إلى الأخرى؛ ولولا هذا الانتقال لما ظهرت شحنة على أيٍّ منهما.</p>' }),
      Object.freeze({ id: 'unequal-charges', label: 'الخطأ أن الشحنتين الناتجتين غير متساويتين في المقدار.', feedbackHtml: '<p><strong>غير صحيح.</strong> الشحنتان الناتجتان متساويتان في المقدار ومتخالفتان في النوع؛ هذا ليس موضع الخطأ في كلام زميلك.</p>' }),
    ]),
  }),
  Object.freeze({
    id: 'paper-bits-why',
    stationRef: 'puzzle',
    context: 'قصاصات ورق معتدلة انجذبت إلى ساق بلاستيكية مشحونة عند تقريبها منها، قبل أن تلامسها.',
    prompt: 'أي تفسير يصف ما حدث داخل القصاصات وصفاً صحيحاً؟',
    correctChoice: 'polarization',
    choices: Object.freeze([
      Object.freeze({ id: 'polarization', label: 'أعادت الشحنة توزيع الشحنات داخل القصاصات (استقطاب)، فصارت الجهة القريبة مخالفة للساق فتجاذبتا، وبقيت القصاصات معتدلة إجمالاً.', feedbackHtml: '<p><strong>صحيح.</strong> الجسم المعتدل يمكن أن ينجذب إلى جسم مشحون دون أن يكتسب شحنة صافية؛ الذي يحدث هو إعادة توزيع داخلية مؤقتة للشحنات تسمى الاستقطاب.</p>' }),
      Object.freeze({ id: 'contact-first', label: 'القصاصات اكتسبت شحنة مخالفة باللمس قبل أن تنجذب.', feedbackHtml: '<p><strong>غير صحيح.</strong> الانجذاب يحدث قبل أي تلامس؛ اللمس يأتي لاحقاً وقد يجعل القصاصات تبتعد بعد ذلك.</p>' }),
      Object.freeze({ id: 'always-charged', label: 'القصاصات مشحونة دائماً، ولذلك تنجذب إلى أي ساق.', feedbackHtml: '<p><strong>غير صحيح.</strong> القصاصات معتدلة في حالتها العادية، والدليل أنها لا تنجذب إلى ساق غير مدلوكة (وهي الحالة التي جرّبتها في المحطة الأولى).</p>' }),
      Object.freeze({ id: 'gravity-cause', label: 'السبب قوة الجاذبية بين الساق والقصاصات.', feedbackHtml: '<p><strong>غير صحيح.</strong> الجاذبية بين هذه الأجسام ضئيلة جداً؛ القوة الملحوظة هنا كهربائية ولا تظهر إلا بعد شحن الساق.</p>' }),
    ]),
  }),
  Object.freeze({
    id: 'neutral-meaning',
    stationRef: 'charge',
    context: 'وصفتَ جسماً بأنه «متعادل كهربائياً».',
    prompt: 'ماذا يعني هذا الوصف بدقّة؟',
    correctChoice: 'balanced',
    choices: Object.freeze([
      Object.freeze({ id: 'balanced', label: 'أن مجموع شحناته الموجبة والسالبة متوازن إجمالاً، لا أنه خالٍ من الشحنات.', feedbackHtml: '<p><strong>صحيح.</strong> كل جسم يحتوي عدداً هائلاً من الشحنات الموجبة والسالبة؛ التعادل يعني أن أثرها الإجمالي متوازن، أي أن الشحنة الصافية صفر.</p>' }),
      Object.freeze({ id: 'empty-of-charge', label: 'أن الجسم لا يحتوي أي شحنات كهربائية.', feedbackHtml: '<p><strong>غير صحيح.</strong> لا يوجد جسم عادي خالٍ من الشحنات؛ فالمادة مكوّنة من ذرات فيها بروتونات وإلكترونات.</p>' }),
      Object.freeze({ id: 'no-electrons', label: 'أن الجسم لا يحتوي إلكترونات.', feedbackHtml: '<p><strong>غير صحيح.</strong> غياب الإلكترونات عن جسم يعني شحنة موجبة هائلة، لا تعادلاً.</p>' }),
      Object.freeze({ id: 'never-any-force', label: 'أنه لا يؤثر بأي قوة كهربائية في أي جسم آخر إطلاقاً.', feedbackHtml: '<p><strong>غير دقيق.</strong> الجسم المتعادل لا يظهر قوة صافية في الحالات البسيطة، لكنه قد ينجذب إلى جسم مشحون بسبب الاستقطاب، كما رأيت في المحطة الأولى.</p>' }),
    ]),
  }),
]);

export function findDetectiveQuestion(questionId) {
  const question = DETECTIVE_QUESTIONS.find((candidate) => candidate.id === questionId);
  if (!question) throw new RangeError(`Unknown detective question: ${questionId}`);
  return question;
}

export const DETECTIVE_FEEDBACK_CORRECT_HEADLINE = 'أحسنت — جوابك صحيح';
export const DETECTIVE_FEEDBACK_INCORRECT_HEADLINE = 'لم يُصب جوابك — لنرَ السبب';
export const DETECTIVE_RETRY_LABEL = 'أعد المحاولة';
export const DETECTIVE_ENCOURAGEMENT_HTML = '<p>عدد المحاولات معلومة لك فقط: لا توجد درجة ولا خصم ولا قفل. جرّب، ثم اقرأ التفسير، ثم أعد المحاولة إن أحببت.</p>';

/* ================================================ station 7 · concept map */

export const CONCEPT_MAP_INTRO_HTML = `
  <p>خمسة مفاهيم بنتها المحطات واحدة فوق الأخرى. افتح أي عقدة لترى خلاصتها، أو لتعود إلى المحطة التي شرحتها.</p>`;

export const CONCEPT_NODES = Object.freeze([
  Object.freeze({
    id: 'static-electricity',
    title: 'الكهرباء الساكنة',
    stationRef: 'puzzle',
    sourceLabel: `${SOURCE_LABEL} · ص73–76`,
    summaryHtml: `<p>شحنات كهربائية تستقر على الأجسام ولا تسري في سلك. تظهر آثارها بعد الدلك أو عند تقريب جسم مشحون، ومن أبرز مظاهرها البرق والصاعقة.</p>`,
    relationHtml: `<p>اسمها من <strong>سكون</strong> الشحنات على الجسم، مقابل الكهرباء التي تسري في ناقل.</p>`,
  }),
  Object.freeze({
    id: 'electric-charges',
    title: 'الشحنات الكهربائية',
    stationRef: 'charge',
    sourceLabel: `${SOURCE_LABEL} · ص76–77`,
    summaryHtml: `<p>نوعان: موجبة ${tex('+', 'plus')} وسالبة ${tex('-', 'minus')}. الإلكترون سالب الشحنة والبروتون موجبها، ومقدار شحنة الإلكترون ${tex('e=1.6\\times 10^{-19}~\\mathrm{C}', 'elementary charge')}.</p>`,
    relationHtml: `<p>الجسم المتعادل: عدد الإلكترونات = عدد البروتونات. والمشحون: ${tex('q=\\pm ne', 'q equals plus or minus n e')}.</p>`,
  }),
  Object.freeze({
    id: 'charging-methods',
    title: 'التكهرب',
    stationRef: 'methods',
    sourceLabel: `${SOURCE_LABEL} · ص76، 78، 79`,
    summaryHtml: `<p>ثلاث طرائق: <strong>الدلك</strong> (انتقال إلكترونات بين مادتين مختلفتين)، <strong>اللمس</strong> (انتقال شحنة من جسم مشحون إلى معتدل فيكتسب النوع نفسه)، <strong>التأثير</strong> (إعادة توزيع داخل ناقل، ومع التأريض يكتسب نوعاً مخالفاً).</p>`,
    relationHtml: `<p>في الطرائق الثلاث الذي يتحرّك هو <strong>الإلكترونات</strong>، ومجموع الشحنات يبقى محفوظاً.</p>`,
  }),
  Object.freeze({
    id: 'attraction-repulsion',
    title: 'التجاذب والتنافر',
    stationRef: 'forces',
    sourceLabel: `${SOURCE_LABEL} · ص77، 80`,
    summaryHtml: `<p>الشحنات المتماثلة تتنافر، والمختلفة تتجاذب. ولكل قوة نقطة تأثير هي الشحنة المتأثرة، وحامل هو المستقيم المارّ بالشحنتين، وجهة تجاذبية أو تنافرية، وشدة.</p>`,
    relationHtml: `<p>القوتان المتبادلتان متساويتان في الشدة ومتعاكستان في الجهة ${tex('(F_{12}=F_{21})', 'F one two equals F two one')} — ${ENRICHMENT_LABEL}.</p>`,
  }),
  Object.freeze({
    id: 'coulomb-law',
    title: 'قانون كولوم',
    stationRef: 'coulomb',
    sourceLabel: `${SOURCE_LABEL} · ص80–81`,
    summaryHtml: `<p>شدة القوة بين شحنتين نقطيتين في الخلاء تتناسب طرداً مع كل من الشحنتين وعكساً مع مربع المسافة بينهما:</p>`,
    relationHtml: COULOMB_LAW_HTML + `<p>وفي الخلاء ${COULOMB_CONSTANT_HTML}.</p>`,
  }),
]);

export const KEY_IDEAS = Object.freeze([
  'الكهرباء الساكنة: شحنات تستقر على الجسم ولا تسري في ناقل.',
  'الجسم المتعادل يحتوي شحنات موجبة وسالبة متوازنة إجمالاً، وليس خالياً من الشحنات.',
  'الإلكترونات هي التي تنتقل في التكهرب؛ أما البروتونات فتبقى مرتبطة داخل النوى.',
  'فقد إلكترونات ⇒ شحنة موجبة، واكتساب إلكترونات ⇒ شحنة سالبة، والمقدار q = ne.',
  'الدلك يُنشئ شحنتين متساويتين ومتخالفتين، واللمس يُكسب النوع نفسه، والتأثير يعيد التوزيع أولاً.',
  'الشحنات المتماثلة تتنافر، والمختلفة تتجاذب، والقوتان على الحامل نفسه ومتساويتان في الشدة.',
  'شدة القوة F = K q₁q₂ / d²: تتضاعف مع تضاعف أي شحنة، وتصبح الربع عند مضاعفة المسافة.',
  'الكاشف الكهربائي يدل على وجود الشحنة بانفراج وريقتيه، ولا يدل وحده على نوعها.',
]);

export const SUMMARY_CLOSING_HTML = `
  <p>أنجزت المحطات السبع: من لغز القصاصات إلى قانون كولوم. كل ما في هذا الملحق نموذج تعليمي مبسّط يساعدك على التفكير، ولا يغني عن تجارب الكتاب الحقيقية وأسئلة الدرس.</p>`;

/* ------------------------------------------------- shared small copy bits */

export const HERO_DESCRIPTION_HTML = `
  <p>هذا ملحق إثرائي مستقل للدرس الأول من الوحدة الثانية (الكهرباء الساكنة، صفحات الكتاب ${LESSON_PAGES})، وليس درساً جديداً ولا بديلاً من صفحة الدرس.</p>
  <p>سبع محطات قصيرة: تتوقّع، تشغّل، تلاحظ، تفسّر، ثم تحسب — وقراراتك هي التي تغيّر ما تراه.</p>`;

export const HOW_TO_USE_STEPS = Object.freeze([
  Object.freeze({ id: 'predict', title: 'توقّع', body: 'قبل كل تجربة يوجد سؤال توقّع قصير. أجب بحدسك أولاً.' }),
  Object.freeze({ id: 'run', title: 'شغّل', body: 'نفّذ الخطوات بنفسك؛ فالمشهد يتغيّر وفق اختياراتك لا وفق نص ثابت.' }),
  Object.freeze({ id: 'observe', title: 'لاحظ', body: 'سجّل ما تراه فعلاً: حركة، انفراج، رقم، جهة سهم.' }),
  Object.freeze({ id: 'explain', title: 'فسّر', body: 'قارن ملاحظتك بالتفسير العلمي، ثم انتقل إلى المحطة التالية.' }),
]);

export const DEFAULT_STATION_ID = APPENDIX_STATIONS[0].id;
export const DEFAULT_COULOMB_STATE_COPY = Object.freeze({
  q1: COULOMB_FIELDS.q1,
  q2: COULOMB_FIELDS.q2,
  d: COULOMB_FIELDS.d,
  state: DEFAULT_COULOMB_STATE,
  reading: coulombReading(DEFAULT_COULOMB_STATE),
});

export const ARENA_VIEW_COPY = ARENA_VIEW;
export const CONSTANTS_COPY = Object.freeze({
  elementaryChargeC: ELEMENTARY_CHARGE,
  coulombConstant: COULOMB_CONSTANT,
});
