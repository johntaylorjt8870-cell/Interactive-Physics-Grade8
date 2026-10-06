import { qty, tex, vector } from './math.js';

const V_F1 = vector('F', '1');
const V_F2 = vector('F', '2');
const V_F = vector('F');
const distance = (name, value) => tex(`${name}=${value}~\\mathrm{cm}`, `${name} equals ${value} centimeters`);
const force = (name, value) => tex(`${name}=${value}~\\mathrm{N}`, `${name} equals ${value} newtons`);
const option = (letter, html) => `<li class="unit-question-option"><bdi class="unit-option-label" dir="ltr">${letter}.</bdi><span>${html}</span></li>`;

export const UNIT_QUESTIONS_META = Object.freeze({
  title: 'أسئلة الوحدة الأولى',
  unit: 'الوحدة الأولى — الحركة والقوى',
  sourcePages: Object.freeze([71, 72]),
  mainQuestionCount: 3,
  multipleChoiceItems: 4,
  writtenProblems: 2,
  requestedSubparts: Object.freeze({
    questionOne: 4,
    questionTwo: 1,
    problemOne: 3,
    problemTwo: 3,
  }),
});

/* Verbatim question blocks, split only where the printed question continues
   from page 71 onto page 72. The full-book page numbering is preserved as
   provenance; the platform's unit identity is explicitly Unit 1. */
export const UNIT_QUESTION_SOURCE_BLOCKS = Object.freeze({
  questionOne: `
    <article class="unit-book-question" data-source-question="1" data-source-page="p71">
      <h3>السؤال الأول:</h3>
      <p>اختر الإجابة الصحيحة لكل مما يأتي:</p>
      <ol class="unit-choice-items">
        <li data-source-subpart="1.1">
          <p>تؤثر في جسم صلب قوتان شاقوليتان نحو الأسفل شدّتاهما ${force('F_{1}', 8)}، ${force('F_{2}', 12)}، فإن شدة محصلتهما تساوي:</p>
          <ul class="unit-question-options" aria-label="خيارات السؤال الأول، الفقرة الأولى">
            ${option('a', qty(0, 'N'))}${option('b', qty(4, 'N'))}${option('c', qty(20, 'N'))}${option('d', qty(96, 'N'))}
          </ul>
        </li>
        <li data-source-subpart="1.2">
          <p>قوتان متلاقيتان متعامدتان ${V_F1}، ${V_F2} متساويتان بالشدة (${tex('F_{1}=F_{2}', 'F one equals F two')})، تعطى شدة محصلتهما ${tex('F', 'F')} بالعلاقة:</p>
          <ul class="unit-question-options" aria-label="خيارات السؤال الأول، الفقرة الثانية">
            ${option('a', tex('F=2F_{1}', 'F equals two F one'))}
            ${option('b', tex('F=\\sqrt{2}F_{1}', 'F equals square root of two times F one'))}
            ${option('c', tex('F=2\\sqrt{F_{1}}', 'F equals two times square root of F one'))}
            ${option('d', tex('F=\\sqrt{2F_{1}}', 'F equals square root of two F one'))}
          </ul>
        </li>
        <li data-source-subpart="1.3">
          <p>قوتان شاقوليتان متعاكستان بجهتيهما، وبُعدا حامليهما عن حامل المحصلة: ${distance('d_{2}', 6)}، ${distance('d_{1}', 2)} على الترتيب، فيكون البعد بين حامليهما:</p>
          <ul class="unit-question-options" aria-label="خيارات السؤال الأول، الفقرة الثالثة">
            ${option('a', qty(12, 'cm'))}${option('b', qty(8, 'cm'))}${option('c', qty(4, 'cm'))}${option('d', qty(3, 'cm'))}
          </ul>
        </li>
        <li data-source-subpart="1.4">
          <p>قوتان متعامدتان شدة القوة الأولى ${force('F_{1}', 6)}، وشدة محصلتهما ${force('F', 10)}، فإن شدة القوة الثانية تساوي:</p>
          <ul class="unit-question-options" aria-label="خيارات السؤال الأول، الفقرة الرابعة">
            ${option('a', qty(2, 'N'))}${option('b', qty(6, 'N'))}${option('c', qty(14, 'N'))}${option('d', qty(8, 'N'))}
          </ul>
        </li>
      </ol>
    </article>
  `,
  questionTwo: `
    <article class="unit-book-question" data-source-question="2" data-source-page="p71">
      <h3>السؤال الثاني:</h3>
      <p>حدّد بالكتابة والرسم عناصر محصلة قوتين شاقوليتين مختلفتين بالشدة تؤثران في طرفي مسطرة خفيفة بجهتين متعاكستين.</p>
    </article>
  `,
  questionThreePage71: `
    <article class="unit-book-question" data-source-question="3" data-source-page="p71" data-source-problem="1">
      <h3>السؤال الثالث:</h3>
      <p>حل المسألتين الآتيتين:</p>
      <h4>المسألة الأولى:</h4>
      <p>تؤثر في جسم قوتان متعامدتان ${V_F1}، ${V_F2}، شدة القوة الأولى ${qty(80, 'N')} وشدة المحصلة ${qty(100, 'N')}، والمطلوب:</p>
      <ol class="unit-written-parts">
        <li data-source-subpart="3.1.1">احسب شدة القوة الثانية ${V_F2}.</li>
      </ol>
    </article>
  `,
  questionThreePage72: `
    <div class="unit-book-question unit-question-continuation" data-source-question="3" data-source-page="p72">
      <ol class="unit-written-parts" start="2">
        <li data-source-subpart="3.1.2">ارسم شكلاً يمثل القوتين والمحصلة بمقياس رسم مناسب.</li>
        <li data-source-subpart="3.1.3">مثل على الرسم القوة ${tex("\\vec{F}'", 'vector F prime')} المعاكسة مباشرة للمحصلة ${V_F}.</li>
      </ol>
      <h4 data-source-problem="2">المسألة الثانية:</h4>
      <p>قوتان شاقوليتان ${V_F1}، ${V_F2} متعاكستان بجهتيهما، شدة محصلتهما ${force('F', 150)}، تؤثران في طرفي ساق معدنية خفيفة طولها ${qty(1, 'm')} عمودياً عليها، فإذا علمت أن بعد حامل القوة الثانية عن حامل المحصلة ${qty(30, 'cm')}، المطلوب:</p>
      <ol class="unit-written-parts">
        <li data-source-subpart="3.2.1">حدّد أيهما القوة الأكبر؟ ولماذا؟</li>
        <li data-source-subpart="3.2.2">احسب بعد حامل القوة الأولى ${V_F1} عن حامل المحصلة ${V_F}.</li>
        <li data-source-subpart="3.2.3">احسب شدة كل من القوتين.</li>
      </ol>
    </div>
  `,
});

const pageMarker = (page) => `<p class="unit-source-marker" role="note"><span>من الكتاب</span><bdi dir="ltr">p${page}</bdi></p>`;
const platformExplanation = (title, html) => `<aside class="unit-platform-explanation" aria-label="شرح المنصة: ${title}"><div class="unit-platform-label">شرح المنصة — Platform Explanation</div><h3>${title}</h3><div class="unit-platform-copy">${html}</div></aside>`;

export function renderUnitQuestions() {
  return `
    <section class="unit-question-section" id="question-one" aria-labelledby="question-one-heading" data-question-order="1">
      <div class="unit-question-section-heading"><div><p class="unit-question-index">01</p><h2 id="question-one-heading">السؤال الأول</h2></div><span class="unit-page-range" dir="ltr">p71</span></div>
      <div class="unit-book-source">${pageMarker(71)}${UNIT_QUESTION_SOURCE_BLOCKS.questionOne}</div>
      ${platformExplanation('اختيار العلاقة الفيزيائية', `<p>ابدأ بتحديد اتجاه القوتين: في الفقرة الأولى القوتان على خط واحد وبجهة واحدة؛ في الثانية القوتان متعامدتان؛ وفي الثالثة القوتان متعاكستان. حدّد المعطى والمطلوب قبل اختيار قانون المحصلة، ثم راجع أبعاد الناتج ووحدته.</p><p>في المسألتين المتعامدتين، تربط نظرية فيثاغورس بين شدتي المركبتين وشدة المحصلة. وعند معرفة المحصلة وإحدى القوتين يمكن إعادة ترتيب العلاقة لإيجاد القوة الأخرى.</p>`)}
    </section>

    <section class="unit-question-section" id="question-two" aria-labelledby="question-two-heading" data-question-order="2">
      <div class="unit-question-section-heading"><div><p class="unit-question-index">02</p><h2 id="question-two-heading">السؤال الثاني</h2></div><span class="unit-page-range" dir="ltr">p71</span></div>
      <div class="unit-book-source">${pageMarker(71)}${UNIT_QUESTION_SOURCE_BLOCKS.questionTwo}</div>
      ${platformExplanation('عناصر المحصلة للقوى المتعاكسة', `<p>سمِّ القوة الأكبر أولاً، ثم حدّد شدة المحصلة من الفرق بين الشدتين واتجاهها من جهة القوة الأكبر. لأن الشدتين تؤثران عند طرفي المسطرة، ارسم الحاملين المتوازيين والمسافة بينهما، ثم استخدم توازن العزم لتحديد حامل المحصلة خارج المسافة بين القوتين. دوّن بوضوح الحامل والجهة والشدة والموضع.</p><p class="unit-platform-aside">لا يتضمن المصدر رسماً جاهزاً لهذه المسألة؛ المطلوب أن ينشئ الطالب الرسم بنفسه.</p>`)}
    </section>

    <section class="unit-question-section" id="question-three" aria-labelledby="question-three-heading" data-question-order="3">
      <div class="unit-question-section-heading"><div><p class="unit-question-index">03</p><h2 id="question-three-heading">السؤال الثالث</h2></div><span class="unit-page-range" dir="ltr">p71–p72</span></div>
      <div class="unit-book-source">
        ${pageMarker(71)}${UNIT_QUESTION_SOURCE_BLOCKS.questionThreePage71}
        <div class="unit-page-continuation" aria-label="متابعة السؤال الثالث في الصفحة 72">${pageMarker(72)}${UNIT_QUESTION_SOURCE_BLOCKS.questionThreePage72}</div>
      </div>
      ${platformExplanation('خطة حل المسألتين', `<ul><li><strong>المسألة الأولى:</strong> استخدم علاقة المحصلة للقوتين المتعامدتين، ثم اختر مقياساً يسهل تحويل القوى إلى أطوال على الرسم. القوة المعاكسة مباشرة للمحصلة لها طول مساوٍ واتجاه معاكس.</li><li><strong>المسألة الثانية:</strong> ارسم حاملي القوتين على طرفي الساق أولاً. يقع حامل المحصلة خارج الساق من جهة القوة الأكبر؛ استخدم هذا الترتيب الهندسي قبل حساب المسافات، ثم اجمع معادلة فرق القوتين مع علاقة تساوي العزوم.</li></ul>`)}
    </section>
  `;
}

export function renderUnitQuestionSourceDisclosure(page) {
  const blocks = page === 71
    ? [UNIT_QUESTION_SOURCE_BLOCKS.questionOne, UNIT_QUESTION_SOURCE_BLOCKS.questionTwo, UNIT_QUESTION_SOURCE_BLOCKS.questionThreePage71]
    : page === 72
      ? [UNIT_QUESTION_SOURCE_BLOCKS.questionThreePage72]
      : [];
  if (blocks.length === 0) return '';
  return `<details class="teacher-source-details" data-source-page="p${page}"><summary>محتوى الكتاب الأصلي · p${page}</summary><div class="teacher-source-body"><div class="book-copy">${blocks.join('')}</div></div></details>`;
}

export const UNIT_QUESTIONS_PAGE_AUDIT = Object.freeze({
  71: Object.freeze({
    title: 'أسئلة الوحدة — الصفحة 71',
    questions: Object.freeze([
      Object.freeze({ number: 1, subparts: 4, kind: 'اختيار من متعدد' }),
      Object.freeze({ number: 2, subparts: 1, kind: 'تحديد ورسم' }),
      Object.freeze({ number: 3, subparts: 1, kind: 'مسألة أولى، الجزء 1' }),
    ]),
    values: Object.freeze(['F₁ = 8 N', 'F₂ = 12 N', '0 N', '4 N', '20 N', '96 N', 'F₁ = F₂', 'F = 2F₁', 'F = √2F₁', 'F = 2√F₁', 'F = √(2F₁)', 'd₂ = 6 cm', 'd₁ = 2 cm', '12 cm', '8 cm', '4 cm', '3 cm', 'F₁ = 6 N', 'F = 10 N', '2 N', '6 N', '14 N', '8 N', '80 N', '100 N']),
    drawings: 'لا يوجد رسم مطبوع؛ السؤالان 2 و3/المسألة الأولى يطلبان من الطالب الرسم.',
    tables: 'لا توجد جداول.',
  }),
  72: Object.freeze({
    title: 'متابعة السؤال الثالث — الصفحة 72',
    questions: Object.freeze([
      Object.freeze({ number: '3/المسألة الأولى', subparts: 2, kind: 'رسم بمقياس مناسب ثم متجه معاكس' }),
      Object.freeze({ number: '3/المسألة الثانية', subparts: 3, kind: 'مسألة حسابية' }),
    ]),
    values: Object.freeze(['F₁ = 80 N', 'F = 100 N', 'F = 150 N', '1 m', '30 cm']),
    drawings: 'لا يوجد رسم مطبوع؛ المسألة الأولى تطلب رسم القوتين والمحصلة والقوة المعاكسة.',
    tables: 'لا توجد جداول.',
  }),
});
