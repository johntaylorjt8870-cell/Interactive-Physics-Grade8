import { calculation, formula, qty, tex, vector } from './math.js';

const V_F1 = vector('F', '1');
const V_F2 = vector('F', '2');
const V_F = vector('F');
const V_F_PRIME = tex("\\vec{F}'", 'vector F prime');
const S_F1 = tex('F_{1}', 'F one');
const S_F2 = tex('F_{2}', 'F two');
const S_F = tex('F', 'F');
const S_F_PRIME = tex("F'", 'F prime');
const S_D1 = tex('d_{1}', 'd one');
const S_D2 = tex('d_{2}', 'd two');
const S_D = tex('d', 'd');

const distance = (name, value) => tex(`${name}=${value}~\\mathrm{cm}`, `${name} equals ${value} centimeters`);
const force = (name, value) => tex(`${name}=${value}~\\mathrm{N}`, `${name} equals ${value} newtons`);
const bookOption = (letter, html) => `<li class="unit-question-option"><bdi class="unit-option-label" dir="ltr">${letter}.</bdi><span>${html}</span></li>`;

export const UNIT_QUESTIONS_META = Object.freeze({
  title: 'أسئلة الوحدة الأولى',
  unit: 'الوحدة الأولى — الحركة والقوى',
  sourcePages: Object.freeze([71, 72]),
  mainQuestionCount: 3,
  totalSubparts: 11,
  multipleChoiceItems: 4,
  writtenProblems: 2,
  requestedSubparts: Object.freeze({
    questionOne: 4,
    questionTwo: 1,
    problemOne: 3,
    problemTwo: 3,
  }),
});

/* Verbatim textbook blocks for Teacher Area source disclosures and provenance,
   split at the exact printed page boundary between page 71 and page 72. */
export const UNIT_QUESTION_SOURCE_BLOCKS = Object.freeze({
  questionOne: `
    <article class="unit-book-question" data-source-question="1" data-source-page="p71">
      <h3>السؤال الأوّل:</h3>
      <p>اخترْ الإجابة الصّحيحة لكلّ ممّا يأتي:</p>
      <ol class="unit-choice-items">
        <li data-source-subpart="1.1">
          <p>تُؤثِّر في جسمٍ صلب قوّتان شاقوليتان نحو الأسفل شدّتاهما ${force('F_{1}', 8)} ، ${force('F_{2}', 12)} فإنّ شدّة محصلتِهما تساوي:</p>
          <ul class="unit-question-options" aria-label="خيارات السؤال الأول، الفقرة الأولى">
            ${bookOption('a', qty(0, 'N'))}${bookOption('b', qty(4, 'N'))}${bookOption('c', qty(20, 'N'))}${bookOption('d', qty(96, 'N'))}
          </ul>
        </li>
        <li data-source-subpart="1.2">
          <p>${V_F1} ، ${V_F2} قوّتان متلاقيتان متعامدتان متساويتان بالشدّة (${tex('F_{1}=F_{2}', 'F one equals F two')})، تعطى شدّة محصلّتهما ${S_F} بالعلاقة:</p>
          <ul class="unit-question-options" aria-label="خيارات السؤال الأول، الفقرة الثانية">
            ${bookOption('a', tex('F=2F_{1}', 'F equals two F one'))}
            ${bookOption('b', tex('F=\\sqrt{2F_{1}}', 'F equals square root of two F one'))}
            ${bookOption('c', tex('F=2\\sqrt{F_{1}}', 'F equals two times square root of F one'))}
            ${bookOption('d', tex('F=F_{1}\\sqrt{2}', 'F equals F one times square root of two'))}
          </ul>
        </li>
        <li data-source-subpart="1.3">
          <p>${V_F1} ، ${V_F2} قوّتان شاقوليتان بجهتين متعاكستين وبُعْدا حامليهما عن حامل المحصّلة: ${distance('d_{1}', 2)} ، ${distance('d_{2}', 6)} على التّرتيب، فيكون البُعْد بين حاملَيهما:</p>
          <ul class="unit-question-options" aria-label="خيارات السؤال الأول، الفقرة الثالثة">
            ${bookOption('a', qty(12, 'cm'))}${bookOption('b', qty(8, 'cm'))}${bookOption('c', qty(4, 'cm'))}${bookOption('d', qty(3, 'cm'))}
          </ul>
        </li>
        <li data-source-subpart="1.4">
          <p>قوتان مُتعامدتان شدّة القوّة الأولى ${force('F_{1}', 6)} ، وشدّة محصّلتِهما ${force('F', 10)} فإنّ شدّة القوّة الثّانية تساوي:</p>
          <ul class="unit-question-options" aria-label="خيارات السؤال الأول، الفقرة الرابعة">
            ${bookOption('a', qty(2, 'N'))}${bookOption('b', qty(6, 'N'))}${bookOption('c', qty(14, 'N'))}${bookOption('d', qty(8, 'N'))}
          </ul>
        </li>
      </ol>
    </article>
  `,
  questionTwo: `
    <article class="unit-book-question" data-source-question="2" data-source-page="p71">
      <h3>السؤال الثاني:</h3>
      <p>حدِّدْ بالكتابة والرّسم عناصر مُحصّلة قوّتين شاقوليتين مختلفتين بالشدة تؤثران في طرفي مسطرة خفيفة بجهتين متعاكستين.</p>
    </article>
  `,
  questionThreePage71: `
    <article class="unit-book-question" data-source-question="3" data-source-page="p71" data-source-problem="1">
      <h3>السؤال الثالث:</h3>
      <p>حلّ المسألتين الآتيتين:</p>
      <h4>المسألة الأولى:</h4>
      <p>تؤثِّر في جسم قوّتان متعامدتان ${V_F1} ، ${V_F2} ، شدّة القوة الأولى ${qty(80, 'N')} وشدّة المحصّلة ${qty(100, 'N')} والمطلوب:</p>
      <ol class="unit-written-parts">
        <li data-source-subpart="3.1.1">احسبْ شدّة القوّة الثانية ${V_F2}.</li>
      </ol>
    </article>
  `,
  questionThreePage72: `
    <div class="unit-book-question unit-question-continuation" data-source-question="3" data-source-page="p72">
      <ol class="unit-written-parts" start="2">
        <li data-source-subpart="3.1.2">ارسمْ شكلاً يُمَثِّل القوّتين والمحصّلة بمقياس رسم مناسب.</li>
        <li data-source-subpart="3.1.3">مَثِّلْ على الرّسم القوة ${V_F_PRIME} المعاكسة مباشرة للمحصّلة ${V_F}.</li>
      </ol>
      <h4 data-source-problem="2">المسألة الثانية:</h4>
      <p>${V_F1} ، ${V_F2} قوّتان شاقوليتان وبجهتين متعاكستين شدّة محصّلتِهما ${tex('\\vec{F}=150~\\mathrm{N}', 'vector F equals 150 newtons')} تؤثِّران في طرفي ساق معدنيّة خفيفة طولها ${qty(1, 'm')} عموديّاً عليها، فإذا علمْتَ أنَّ بُعْد حامل القوّة الثّانية عن حامل المحصّلة ${qty(30, 'cm')} ، المطلوب:</p>
      <ol class="unit-written-parts">
        <li data-source-subpart="3.2.1">حدِّدْ أَيُّهُمَا القوّة الأكبر؟ ولماذا؟</li>
        <li data-source-subpart="3.2.2">احسبْ بُعْد حامل القوّة الأولى ${V_F1} عن حامل المحصّلة ${V_F}.</li>
        <li data-source-subpart="3.2.3">احسبْ شدّة كلّ من القوّتين.</li>
      </ol>
    </div>
  `,
});

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
      Object.freeze({ number: 2, subparts: 1, kind: 'تحديد كتابةً ورسماً' }),
      Object.freeze({ number: 3, subparts: 1, kind: 'المسألة الأولى، الفرع 1' }),
    ]),
    values: Object.freeze([
      'F₁ = 8 N', 'F₂ = 12 N', '0 N', '4 N', '20 N', '96 N',
      'F₁ = F₂', 'F = 2F₁', 'F = √(2F₁)', 'F = 2√F₁', 'F = F₁√2',
      'd₁ = 2 cm', 'd₂ = 6 cm', '12 cm', '8 cm', '4 cm', '3 cm',
      'F₁ = 6 N', 'F = 10 N', '2 N', '6 N', '14 N', '8 N',
      '80 N', '100 N',
    ]),
    drawings: 'لا يوجد رسم مطبوع؛ السؤالان 2 و3 يطلبان من الطالب إنشاء الرسم.',
    tables: 'لا توجد جداول.',
  }),
  72: Object.freeze({
    title: 'متابعة السؤال الثالث — الصفحة 72',
    questions: Object.freeze([
      Object.freeze({ number: '3/المسألة الأولى', subparts: 2, kind: 'رسم بمقياس مناسب ثم متجه معاكس' }),
      Object.freeze({ number: '3/المسألة الثانية', subparts: 3, kind: 'مسألة تحديد وحساب' }),
    ]),
    values: Object.freeze(['80 N', '100 N', 'F⃗ = 150 N', '1 m', '30 cm']),
    drawings: 'لا يوجد رسم مطبوع؛ المسألة الأولى تطلب رسم القوتين والمحصلة والقوة المعاكسة.',
    tables: 'لا توجد جداول.',
  }),
});

/* --------------------------------------------------------------------------
 * Complete structured inventory of the 11 textbook subparts (p71–p72)
 * -------------------------------------------------------------------------- */

export const UNIT_QUESTIONS_SUBPARTS = Object.freeze([
  Object.freeze({
    id: '1.1',
    questionId: 'q1',
    problemId: null,
    page: 71,
    numberLabel: '1',
    badgeLabel: 'الفقرة 1 · اختيار من متعدد',
    type: 'mcq',
    promptHtml: `تُؤثِّر في جسمٍ صلب قوّتان شاقوليتان نحو الأسفل شدّتاهما ${force('F_{1}', 8)} ، ${force('F_{2}', 12)} فإنّ شدّة محصلتِهما تساوي:`,
    options: Object.freeze([
      Object.freeze({ key: 'a', html: qty(0, 'N') }),
      Object.freeze({ key: 'b', html: qty(4, 'N') }),
      Object.freeze({ key: 'c', html: qty(20, 'N') }),
      Object.freeze({ key: 'd', html: qty(96, 'N') }),
    ]),
    correct: 'c',
    hints: Object.freeze([
      `انتبه إلى اتجاه القوتين: كلتاهما شاقوليتان نحو الأسفل، أي لهما الجهة نفسها.`,
      `عندما تؤثر قوتان بجهة واحدة (سواء على حامل واحد أم متوازيتين)، تكون شدة المحصلة حاصل جمع الشدتين ${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')}.`,
    ]),
    optionFeedback: Object.freeze({
      a: `القيمة ${qty(0, 'N')} تنتج فقط عند قوتين متساويتين شدةً ومتعاكستين جهةً على حامل واحد، وليست هذه حالتنا.`,
      b: `القيمة ${qty(4, 'N')} هي فرق الشدتين (${tex('12-8=4~\\mathrm{N}', '12 minus 8 equals 4 N')})، والطرح يُستعمل عند تعاكس الجهتين لا اتحادهما.`,
      c: `القوتان بجهة واحدة نحو الأسفل، فتُجمع الشدتان وتكون المحصلة نحو الأسفل بشدة ${qty(20, 'N')}.`,
      d: `القيمة ${qty(96, 'N')} ناتجة عن ضرب الشدتين (${tex('8\\times12', '8 times 12')})، وشدة المحصلة لا تُحسب بالضرب.`,
    }),
    equationHtml: calculation('F = F_{1} + F_{2} = 8 + 12 = 20~\\mathrm{N}', 'F equals F one plus F two equals 8 plus 12 equals 20 newtons'),
  }),
  Object.freeze({
    id: '1.2',
    questionId: 'q1',
    problemId: null,
    page: 71,
    numberLabel: '2',
    badgeLabel: 'الفقرة 2 · اختيار من متعدد',
    type: 'mcq',
    promptHtml: `${V_F1} ، ${V_F2} قوّتان متلاقيتان متعامدتان متساويتان بالشدّة (${tex('F_{1}=F_{2}', 'F one equals F two')})، تعطى شدّة محصلّتهما ${S_F} بالعلاقة:`,
    options: Object.freeze([
      Object.freeze({ key: 'a', html: tex('F=2F_{1}', 'F equals two F one') }),
      Object.freeze({ key: 'b', html: tex('F=\\sqrt{2F_{1}}', 'F equals square root of two F one') }),
      Object.freeze({ key: 'c', html: tex('F=2\\sqrt{F_{1}}', 'F equals two times square root of F one') }),
      Object.freeze({ key: 'd', html: tex('F=F_{1}\\sqrt{2}', 'F equals F one times square root of two') }),
    ]),
    correct: 'd',
    hints: Object.freeze([
      `القوتان متلاقيتان ومتعامدتان؛ ابدأ من علاقة فيثاغورس ${tex('F=\\sqrt{F_{1}^{2}+F_{2}^{2}}', 'F equals square root of F1 squared plus F2 squared')}.`,
      `عوّض ${tex('F_{2}=F_{1}', 'F two equals F one')} تحت الجذر لتحصل على ${tex('\\sqrt{2F_{1}^{2}}', 'square root of 2 F1 squared')}، ثم أخرج ${tex('F_{1}^{2}', 'F1 squared')} من تحت الجذر.`,
    ]),
    optionFeedback: Object.freeze({
      a: `العلاقة ${tex('F=2F_{1}', 'F equals 2 F1')} تصلح لقوتين متساويتين على حامل واحد وبجهة واحدة، لا لقوتين متعامدتين.`,
      b: `في ${tex('F=\\sqrt{2F_{1}}', 'F equals square root of 2 F1')} تقع ${S_F1} داخل الجذر دون تربيع، فلا تخرج منه ولا تعطي وحدة نيوتن صحيحة.`,
      c: `في ${tex('F=2\\sqrt{F_{1}}', 'F equals 2 square root of F1')} خرج العدد 2 من الجذر وبقيت ${S_F1} تحته، وهو عكس التبسيط الصحيح لـ ${tex('\\sqrt{2F_{1}^{2}}', 'square root of 2 F1 squared')}.`,
      d: `من فيثاغورس نحصل على ${tex('\\sqrt{F_{1}^{2}+F_{1}^{2}}=\\sqrt{2F_{1}^{2}}=F_{1}\\sqrt{2}', 'F1 times square root of 2')}.`,
    }),
    equationHtml: calculation('F = \\sqrt{F_{1}^{2} + F_{2}^{2}} = \\sqrt{2F_{1}^{2}} = F_{1}\\sqrt{2}', 'F equals square root of F1 squared plus F2 squared equals F1 times square root of 2'),
  }),
  Object.freeze({
    id: '1.3',
    questionId: 'q1',
    problemId: null,
    page: 71,
    numberLabel: '3',
    badgeLabel: 'الفقرة 3 · اختيار من متعدد',
    type: 'mcq',
    promptHtml: `${V_F1} ، ${V_F2} قوّتان شاقوليتان بجهتين متعاكستين وبُعْدا حامليهما عن حامل المحصّلة: ${distance('d_{1}', 2)} ، ${distance('d_{2}', 6)} على التّرتيب، فيكون البُعْد بين حاملَيهما:`,
    options: Object.freeze([
      Object.freeze({ key: 'a', html: qty(12, 'cm') }),
      Object.freeze({ key: 'b', html: qty(8, 'cm') }),
      Object.freeze({ key: 'c', html: qty(4, 'cm') }),
      Object.freeze({ key: 'd', html: qty(3, 'cm') }),
    ]),
    correct: 'c',
    hints: Object.freeze([
      `تذكّر موضع نقطة تأثير المحصلة لقوتين متوازيتين بجهتين متعاكستين: هل يقع حامل المحصلة بين حاملي القوتين أم خارجهما؟`,
      `بما أن حامل المحصلة يقع خارج القطعة الواصلة بين الحاملين ومن جهة القوة الأكبر (${V_F1})، فإن الحاملين يقعان في جهة واحدة من حامل المحصلة، فيكون البعد بينهما فرق البعدين.`,
    ]),
    optionFeedback: Object.freeze({
      a: `القيمة ${qty(12, 'cm')} ناتجة عن ضرب البعدين (${tex('2\\times6', '2 times 6')})، والبعد الطولي لا يُحسب بضرب المسافتين.`,
      b: `القيمة ${qty(8, 'cm')} ناتجة عن الجمع (${tex('6+2=8~\\mathrm{cm}', '6 plus 2 equals 8 cm')})، والجمع يُستعمل حين تقع المحصلة بين القوتين (حالة الجهة الواحدة).`,
      c: `حامل المحصلة يقع خارج القطعة بين الحاملين ومن جهة ${V_F1} الأقرب إليه، لذا يساوي البعد بين الحاملين فرق بعديهما ${qty(4, 'cm')}.`,
      d: `القيمة ${qty(3, 'cm')} ناتجة عن القسمة (${tex('6\\div2', '6 divided by 2')})، وهي نسبة لا مسافة بين حاملين.`,
    }),
    equationHtml: calculation('d = d_{2} - d_{1} = 6 - 2 = 4~\\mathrm{cm}', 'd equals d2 minus d1 equals 6 minus 2 equals 4 centimeters'),
  }),
  Object.freeze({
    id: '1.4',
    questionId: 'q1',
    problemId: null,
    page: 71,
    numberLabel: '4',
    badgeLabel: 'الفقرة 4 · اختيار من متعدد',
    type: 'mcq',
    promptHtml: `قوتان مُتعامدتان شدّة القوّة الأولى ${force('F_{1}', 6)} ، وشدّة محصّلتِهما ${force('F', 10)} فإنّ شدّة القوّة الثّانية تساوي:`,
    options: Object.freeze([
      Object.freeze({ key: 'a', html: qty(2, 'N') }),
      Object.freeze({ key: 'b', html: qty(6, 'N') }),
      Object.freeze({ key: 'c', html: qty(14, 'N') }),
      Object.freeze({ key: 'd', html: qty(8, 'N') }),
    ]),
    correct: 'd',
    hints: Object.freeze([
      `القوتان متعامدتان والمحصلة هي الوتر في مثلث القوى القائم: ${tex('F^{2}=F_{1}^{2}+F_{2}^{2}', 'F squared equals F1 squared plus F2 squared')}.`,
      `اعزل ${tex('F_{2}^{2}=F^{2}-F_{1}^{2}', 'F2 squared equals F squared minus F1 squared')}، ثم عوّض ${qty(10, 'N')} و ${qty(6, 'N')} وخذ الجذر التربيعي.`,
    ]),
    optionFeedback: Object.freeze({
      a: `القيمة ${qty(2, 'N')} لا تحقق علاقة فيثاغورس لأن ${tex('\\sqrt{6^{2}+2^{2}}=\\sqrt{40}\\neq10', 'square root of 40 is not 10')}.`,
      b: `لو كانت ${tex('F_{2}=6~\\mathrm{N}', 'F2 equals 6 N')} لكانت المحصلة ${tex('6\\sqrt{2}\\approx8.49~\\mathrm{N}', '6 root 2')} لا ${qty(10, 'N')}.`,
      c: `في القوى المتعامدة تكون المحصلة أكبر من كلٍّ من القوتين؛ لا يمكن أن تكون ${S_F2} مساوية لـ ${qty(14, 'N')} أكبر من المحصلة ${qty(10, 'N')}.`,
      d: `بتطبيق فيثاغورس نجد ${tex('F_{2}=\\sqrt{10^{2}-6^{2}}=\\sqrt{64}=8~\\mathrm{N}', 'F2 equals 8 N')}.`,
    }),
    equationHtml: calculation('F_{2} = \\sqrt{F^{2} - F_{1}^{2}} = \\sqrt{10^{2} - 6^{2}} = \\sqrt{64} = 8~\\mathrm{N}', 'F2 equals square root of 10 squared minus 6 squared equals 8 newtons'),
  }),
  Object.freeze({
    id: '2.1',
    questionId: 'q2',
    problemId: null,
    page: 71,
    numberLabel: 'السؤال 2',
    badgeLabel: 'كتابة العناصر الأربعة + التمثيل بالرسم',
    type: 'elements-and-diagram',
    promptHtml: `حدِّدْ بالكتابة والرّسم عناصر مُحصّلة قوّتين شاقوليتين مختلفتين بالشدة تؤثران في طرفي مسطرة خفيفة بجهتين متعاكستين.`,
    hints: Object.freeze([
      `عناصر أي قوة أربعة: نقطة التأثير، الحامل، الجهة، والشدة. افترض مثلاً أن ${V_F2} أكبر من ${V_F1} دون اختراع أرقام غير معطاة.`,
      `في القوتين المتوازيتين المتعاكستين: الحامل يوازي الحاملين، والجهة بجهة القوة الأكبر، والشدة فرق الشدتين، ونقطة التأثير على امتداد المسطرة خارج القطعة ${tex('AB', 'A B')} وأقرب إلى القوة الأكبر.`,
    ]),
    equationHtml: calculation('F = F_{2} - F_{1}\\;(F_{2} > F_{1}),\\qquad F_{1}\\times d_{1} = F_{2}\\times d_{2}', 'F equals F2 minus F1 and F1 times d1 equals F2 times d2'),
  }),
  Object.freeze({
    id: '3.1.1',
    questionId: 'q3',
    problemId: 'p1',
    page: 71,
    numberLabel: '1',
    badgeLabel: 'المسألة الأولى · الفرع 1 (ص 71)',
    type: 'numeric-force',
    promptHtml: `احسبْ شدّة القوّة الثانية ${V_F2}.`,
    expectedValue: 60,
    expectedUnit: 'N',
    hints: Object.freeze([
      `القوتان ${V_F1} و ${V_F2} متعامدتان، لذا نربط شدة المحصلة بشدتي القوتين عبر علاقة فيثاغورس: ${tex('F^{2}=F_{1}^{2}+F_{2}^{2}', 'F squared equals F1 squared plus F2 squared')}.`,
      `رتّب العلاقة لإيجاد ${S_F2}: ${tex('F_{2}=\\sqrt{F^{2}-F_{1}^{2}}', 'F2 equals square root of F squared minus F1 squared')}، ثم عوّض ${tex('F=100~\\mathrm{N}', '100 N')} و ${tex('F_{1}=80~\\mathrm{N}', '80 N')}.`,
    ]),
    equationHtml: calculation('F_{2} = \\sqrt{F^{2} - F_{1}^{2}} = \\sqrt{100^{2} - 80^{2}} = \\sqrt{3600} = 60~\\mathrm{N}', 'F2 equals square root of 100 squared minus 80 squared equals 60 newtons'),
  }),
  Object.freeze({
    id: '3.1.2',
    questionId: 'q3',
    problemId: 'p1',
    page: 72,
    numberLabel: '2',
    badgeLabel: 'المسألة الأولى · الفرع 2 (ص 72)',
    type: 'scale-drawing',
    promptHtml: `ارسمْ شكلاً يُمَثِّل القوّتين والمحصّلة بمقياس رسم مناسب.`,
    hints: Object.freeze([
      `اختر مقياس رسم يجعل أطوال الأسهم أعداداً بسيطة ومريحة على الورقة، مثل تمثيل كل ${qty(20, 'N')} بـ ${qty(1, 'cm')}.`,
      `اقسم كل شدة (${qty(80, 'N')}، ${qty(60, 'N')}، ${qty(100, 'N')}) على قيمة المقياس المختار، ومثّل القوتين متعامدتين من مبدأ مشترك ${tex('O', 'O')} والمحصلة على قطر المستطيل.`,
    ]),
    equationHtml: calculation('1~\\mathrm{cm}\\leftrightarrow20~\\mathrm{N}\\;\\Rightarrow\\;L_{1}=4~\\mathrm{cm},\\;L_{2}=3~\\mathrm{cm},\\;L=5~\\mathrm{cm}', 'At scale 1 cm to 20 N: L1 is 4 cm, L2 is 3 cm, L is 5 cm'),
  }),
  Object.freeze({
    id: '3.1.3',
    questionId: 'q3',
    problemId: 'p1',
    page: 72,
    numberLabel: '3',
    badgeLabel: 'المسألة الأولى · الفرع 3 (ص 72)',
    type: 'opposite-vector',
    promptHtml: `مَثِّلْ على الرّسم القوة ${V_F_PRIME} المعاكسة مباشرة للمحصّلة ${V_F}.`,
    hints: Object.freeze([
      `القوة المعاكسة مباشرة لقوة ما تشترك معها في نقطة التأثير والحامل وتساويها بالشدة وتعاكسها بالجهة.`,
      `بما أن شدة المحصلة ${qty(100, 'N')}، فما شدة ${S_F_PRIME}؟ وكيف يُرسم سهمها من النقطة ${tex('O', 'O')} بالنسبة لحامل ${V_F}؟`,
    ]),
    equationHtml: calculation("\\vec{F}' = -\\vec{F},\\qquad F' = F = 100~\\mathrm{N}", 'vector F prime equals negative vector F, magnitude F prime equals 100 newtons'),
  }),
  Object.freeze({
    id: '3.2.1',
    questionId: 'q3',
    problemId: 'p2',
    page: 72,
    numberLabel: '1',
    badgeLabel: 'المسألة الثانية · الفرع 1 (ص 72)',
    type: 'larger-force-reasoning',
    promptHtml: `حدِّدْ أَيُّهُمَا القوّة الأكبر؟ ولماذا؟`,
    hints: Object.freeze([
      `قارن بُعد حامل القوة الثانية عن حامل المحصلة (${qty(30, 'cm')}) بطول الساق كاملةً (${tex('1~\\mathrm{m}=100~\\mathrm{cm}', '1 m equals 100 cm')}).`,
      `لو كانت ${V_F1} هي الأكبر لوقع حامل المحصلة خارج الساق من جهة ${V_F1}، فكان بعده عن ${V_F2} أكبر من ${qty(100, 'cm')}. ماذا تستنتج من كون ${tex('d_{2}=30~\\mathrm{cm}<100~\\mathrm{cm}', 'd2 less than 100 cm')}؟`,
    ]),
    equationHtml: calculation('d_{2} = 30~\\mathrm{cm} < 100~\\mathrm{cm}\\;\\Rightarrow\\;d_{2} < d_{1}\\;\\Rightarrow\\;F_{2} > F_{1}', 'd2 equals 30 cm is less than 100 cm so d2 is less than d1 and F2 is greater than F1'),
  }),
  Object.freeze({
    id: '3.2.2',
    questionId: 'q3',
    problemId: 'p2',
    page: 72,
    numberLabel: '2',
    badgeLabel: 'المسألة الثانية · الفرع 2 (ص 72)',
    type: 'numeric-distance',
    promptHtml: `احسبْ بُعْد حامل القوّة الأولى ${V_F1} عن حامل المحصّلة ${V_F}.`,
    hints: Object.freeze([
      `وحّد الوحدات أولاً: طول الساق ${tex('d=1~\\mathrm{m}=100~\\mathrm{cm}', 'd equals 1 m equals 100 cm')}، وبُعد حامل ${V_F2} عن المحصلة ${tex('d_{2}=30~\\mathrm{cm}=0.3~\\mathrm{m}', 'd2 equals 30 cm equals 0.3 m')}.`,
      `بما أن حامل المحصلة يقع خارج الساق من جهة ${V_F2}، فإن بُعد حامل ${V_F1} عن حامل المحصلة يساوي طول الساق مضافاً إليه ${S_D2}: ${tex('d_{1}=d+d_{2}', 'd1 equals d plus d2')}.`,
    ]),
    equationHtml: calculation('d_{1} = d + d_{2} = 100 + 30 = 130~\\mathrm{cm} = 1.3~\\mathrm{m}', 'd1 equals d plus d2 equals 100 plus 30 equals 130 cm equals 1.3 m'),
  }),
  Object.freeze({
    id: '3.2.3',
    questionId: 'q3',
    problemId: 'p2',
    page: 72,
    numberLabel: '3',
    badgeLabel: 'المسألة الثانية · الفرع 3 (ص 72)',
    type: 'dual-forces',
    promptHtml: `احسبْ شدّة كلّ من القوّتين.`,
    hints: Object.freeze([
      `استعمل سلسلة التناسب للقوتين المتوازيتين المتعاكستين: ${tex('\\dfrac{F_{1}}{d_{2}}=\\dfrac{F_{2}}{d_{1}}=\\dfrac{F}{d}', 'F1 over d2 equals F2 over d1 equals F over d')} مع توحيد وحدات المسافات.`,
      `لديك ${tex('F=150~\\mathrm{N}', '150 N')} و ${tex('d=100~\\mathrm{cm}', '100 cm')} و ${tex('d_{2}=30~\\mathrm{cm}', '30 cm')} و ${tex('d_{1}=130~\\mathrm{cm}', '130 cm')}. احسب ${S_F1} ثم ${S_F2}، وتحقّق أن ${tex('F_{2}-F_{1}=150~\\mathrm{N}', 'F2 minus F1 equals 150 N')}.`,
    ]),
    equationHtml: `
      ${calculation('\\dfrac{F_{1}}{30} = \\dfrac{F_{2}}{130} = \\dfrac{150}{100} = 1.5', 'F1 over 30 equals F2 over 130 equals 150 over 100 equals 1.5')}
      ${calculation('F_{1} = 1.5 \\times 30 = 45~\\mathrm{N},\\qquad F_{2} = 1.5 \\times 130 = 195~\\mathrm{N}', 'F1 equals 45 newtons and F2 equals 195 newtons')}
    `,
  }),
]);

export const SUBPART_BY_ID = Object.freeze(
  Object.fromEntries(UNIT_QUESTIONS_SUBPARTS.map((item) => [item.id, item])),
);

/* --------------------------------------------------------------------------
 * Pure state, number parsing, evaluation, and multi-branch summary engine
 * -------------------------------------------------------------------------- */

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_INDIC = '۰۱۲۳۴۵۶۷۸۹';

function normalizeDigits(text) {
  return String(text)
    .replace(/[٠-٩]/g, (ch) => String(ARABIC_INDIC.indexOf(ch)))
    .replace(/[۰-۹]/g, (ch) => String(EASTERN_INDIC.indexOf(ch)))
    .replace(/٫/g, '.');
}

/**
 * Parses a student numeric input safely.
 * Supports ASCII and Arabic-Indic digits, optional decimal comma (e.g. "1,3"),
 * and optional trailing unit token ("N", "cm", "m") without accepting arbitrary text.
 */
export function parseFlexibleNumber(raw) {
  if (raw === null || raw === undefined) return { ok: false, reason: 'empty' };
  let cleaned = normalizeDigits(raw).trim();
  if (!cleaned) return { ok: false, reason: 'empty' };

  let embeddedUnit = null;
  const unitMatch = cleaned.match(/^([+-]?\d+(?:[.,]\d+)?)\s*(N|cm|m|نيوتن|سم|م)$/i);
  if (unitMatch) {
    cleaned = unitMatch[1];
    const token = unitMatch[2].toLowerCase();
    if (token === 'n' || token === 'نيوتن') embeddedUnit = 'N';
    else if (token === 'cm' || token === 'سم') embeddedUnit = 'cm';
    else if (token === 'm' || token === 'م') embeddedUnit = 'm';
  }

  if (/^[+-]?\d+,\d{1,2}$/.test(cleaned)) {
    cleaned = cleaned.replace(',', '.');
  }

  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(cleaned)) {
    return { ok: false, reason: 'format' };
  }

  const value = Number(cleaned);
  if (!Number.isFinite(value)) return { ok: false, reason: 'format' };
  return { ok: true, value, embeddedUnit };
}

export function defaultResponseFor(subpartId) {
  switch (subpartId) {
    case '1.1':
    case '1.2':
    case '1.3':
    case '1.4':
      return { choice: '' };
    case '2.1':
      return {
        carrier: '',
        sense: '',
        magnitude: '',
        point: '',
        diagramPos: '',
        diagramSense: '',
        note: '',
      };
    case '3.1.1':
      return { value: '' };
    case '3.1.2':
      return { scale: '20', l1: '', l2: '', lr: '', angle: '' };
    case '3.1.3':
      return { fPrimeMag: '', fPrimeDir: '' };
    case '3.2.1':
      return { largerForce: '', reason: '' };
    case '3.2.2':
      return { d1Value: '', d1Unit: 'cm' };
    case '3.2.3':
      return { f1Value: '', f2Value: '' };
    default:
      return {};
  }
}

export function createInitialUnitQuestionsState() {
  const branches = {};
  for (const item of UNIT_QUESTIONS_SUBPARTS) {
    branches[item.id] = {
      response: defaultResponseFor(item.id),
      checked: false,
      isCorrect: false,
      feedbackHtml: '',
      hintLevel: 0,
    };
  }
  return { branches };
}

export function isSubpartAnswered(subpartId, response = {}) {
  switch (subpartId) {
    case '1.1':
    case '1.2':
    case '1.3':
    case '1.4':
      return Boolean(response.choice);
    case '2.1':
      return Boolean(
        response.carrier || response.sense || response.magnitude || response.point
        || response.diagramPos || response.diagramSense || String(response.note ?? '').trim(),
      );
    case '3.1.1':
      return Boolean(String(response.value ?? '').trim());
    case '3.1.2':
      return Boolean(
        String(response.l1 ?? '').trim()
        || String(response.l2 ?? '').trim()
        || String(response.lr ?? '').trim()
        || response.angle,
      );
    case '3.1.3':
      return Boolean(String(response.fPrimeMag ?? '').trim() || response.fPrimeDir);
    case '3.2.1':
      return Boolean(response.largerForce || response.reason);
    case '3.2.2':
      return Boolean(String(response.d1Value ?? '').trim());
    case '3.2.3':
      return Boolean(String(response.f1Value ?? '').trim() || String(response.f2Value ?? '').trim());
    default:
      return false;
  }
}

export function getSubpartStatus(branchState, subpartId) {
  if (branchState?.checked) {
    return branchState.isCorrect ? 'correct' : 'incorrect';
  }
  return isSubpartAnswered(subpartId, branchState?.response) ? 'answered' : 'unanswered';
}

export function statusLabelFor(status) {
  switch (status) {
    case 'correct':
      return 'تم التحقق · إجابة صحيحة';
    case 'incorrect':
      return 'تم التحقق · تحتاج مراجعة';
    case 'answered':
      return 'أُجيب عنه · بانتظار التحقق';
    default:
      return 'لم يُجب عنه';
  }
}

const approxEqual = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

export function evaluateSubpart(subpartId, response = {}) {
  const item = SUBPART_BY_ID[subpartId];
  if (!item) throw new Error(`Unknown subpart: ${subpartId}`);

  if (item.type === 'mcq') {
    const choice = String(response.choice ?? '').trim();
    if (!['a', 'b', 'c', 'd'].includes(choice)) {
      return { valid: false, message: 'اختر أحد البدائل الأربعة (a أو b أو c أو d) أولاً قبل التحقق.' };
    }
    const isCorrect = choice === item.correct;
    const detail = item.optionFeedback[choice] ?? '';
    const feedbackHtml = isCorrect
      ? `<p class="uq-fb-lead"><strong>إجابة صحيحة (${choice}).</strong> ${detail}</p><div class="uq-fb-math">${item.equationHtml}</div>`
      : `<p class="uq-fb-lead"><strong>الخيار (${choice}) غير دقيق.</strong> ${detail}</p><p class="uq-fb-sub">راجع العلاقة الفيزيائية أو استعن بالتلميح ثم جرّب مجدداً.</p>`;
    return { valid: true, isCorrect, feedbackHtml };
  }

  if (subpartId === '2.1') {
    const { carrier, sense, magnitude, point, diagramPos, diagramSense } = response;
    if (!carrier || !sense || !magnitude || !point || !diagramPos || !diagramSense) {
      return {
        valid: false,
        message: 'حدّد عناصر المحصلة الأربعة (الحامل والجهة والشدة ونقطة التأثير) واختر موضع الحامل وجهته على الرسم التخطيطي قبل التحقق.',
      };
    }
    const issues = [];
    if (carrier !== 'parallel') issues.push('<strong>الحامل:</strong> يجب أن يكون شاقولياً يوازي حاملي القوتين المتوازيتين.');
    if (sense !== 'larger') issues.push('<strong>الجهة:</strong> تتبع دائماً جهة القوة الأكبر شدةً.');
    if (magnitude !== 'difference') issues.push(`<strong>الشدة:</strong> في الجهتين المتعاكستين نطرح الشدتين (${tex('F=F_{\\text{الأكبر}}-F_{\\text{الأصغر}}', 'F equals larger minus smaller')}) ولا نجمعهما.`);
    if (point !== 'outside-larger') issues.push(`<strong>نقطة التأثير:</strong> تقع على امتداد المسطرة خارج القطعة ${tex('AB', 'A B')} وأقرب إلى القوة الأكبر بحيث ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F1 times d1 equals F2 times d2')}.`);
    if (diagramPos !== 'outside-larger') issues.push('<strong>موضع الرسم:</strong> حامل المحصلة على الرسم يجب أن يقع خارج طرفي المسطرة من جهة القوة الأكبر.');
    if (diagramSense !== 'larger') issues.push('<strong>اتجاه سهم المحصلة في الرسم:</strong> يجب أن يطابق اتجاه سهم القوة الأكبر.');

    const isCorrect = issues.length === 0;
    const summaryList = `
      <ul class="uq-elements-summary">
        <li><strong>نقطة التأثير:</strong> على امتداد القطعة المستقيمة ${tex('AB', 'A B')} خارج طرفي المسطرة ومن جهة القوة الأكبر، وتحقق ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F1 d1 equals F2 d2')}.</li>
        <li><strong>الحامل:</strong> شاقولي يوازي حاملي القوتين ${V_F1} و ${V_F2}.</li>
        <li><strong>الجهة:</strong> بجهة القوة الأكبر شدةً.</li>
        <li><strong>الشدة:</strong> حاصل طرح شدتي القوتين ${tex('F=F_{2}-F_{1}', 'F equals F2 minus F1')} (بفرض ${tex('F_{2}>F_{1}', 'F2 greater than F1')}).</li>
      </ul>`;
    const feedbackHtml = isCorrect
      ? `<p class="uq-fb-lead"><strong>أحسنت! حدّدت عناصر المحصلة الأربعة ومثّلتها بالرسم بدقة علمية.</strong></p>${summaryList}<div class="uq-fb-math">${item.equationHtml}</div>`
      : `<p class="uq-fb-lead"><strong>بعض العناصر أو اختيارات الرسم تحتاج تصحيحاً:</strong></p><ul class="uq-fb-issues">${issues.map((entry) => `<li>${entry}</li>`).join('')}</ul>`;
    return { valid: true, isCorrect, feedbackHtml };
  }

  if (subpartId === '3.1.1') {
    const parsed = parseFlexibleNumber(response.value);
    if (!parsed.ok) {
      return {
        valid: false,
        message: parsed.reason === 'empty'
          ? 'أدخل قيمة شدة القوة الثانية بالنيوتن قبل التحقق.'
          : 'أدخل قيمة عددية صالحة (مثل 60) بوحدة النيوتن N.',
      };
    }
    if (parsed.embeddedUnit && parsed.embeddedUnit !== 'N') {
      return {
        valid: true,
        isCorrect: false,
        feedbackHtml: `<p class="uq-fb-lead"><strong>انتبه للوحدة:</strong> شدة القوة تُقاس بالنيوتن ${tex('\\mathrm{N}', 'N')} لا بوحدة المسافة.</p>`,
      };
    }
    if (parsed.value < 0) {
      return {
        valid: true,
        isCorrect: false,
        feedbackHtml: `<p class="uq-fb-lead"><strong>الشدة مقدار موجب دائماً:</strong> لا تأخذ شدة القوة قيمة سالبة.</p>`,
      };
    }
    const isCorrect = approxEqual(parsed.value, 60, 1e-4);
    let hintWhy = 'طبّق علاقة فيثاغورس للقوتين المتعامدتين ثم خذ الجذر التربيعي لفرق المربعين.';
    if (approxEqual(parsed.value, 20, 1e-4)) {
      hintWhy = `طرحتَ ${tex('100-80=20~\\mathrm{N}', '100 minus 80')} مباشرةً؛ الطرح المباشر خاص بالقوى على حامل واحد، أمّا هنا فالقوتان متعامدتان.`;
    } else if (approxEqual(parsed.value, 180, 1e-4)) {
      hintWhy = `جمعتَ ${tex('100+80=180~\\mathrm{N}', '100 plus 80')}؛ في القوى المتعامدة تكون المحصلة هي الوتر الأكبر ولا نجمع الشدتين خطياً.`;
    } else if (approxEqual(parsed.value, 3600, 1e-2)) {
      hintWhy = `القيمة ${tex('3600', '3600')} هي ${tex('F_{2}^{2}', 'F2 squared')} قبل أخذ الجذر التربيعي! خذ ${tex('\\sqrt{3600}', 'square root of 3600')}.`;
    }
    const feedbackHtml = isCorrect
      ? `<p class="uq-fb-lead"><strong>إجابة صحيحة!</strong> شدة القوة الثانية تساوي ${qty(60, 'N')}.</p><div class="uq-fb-math">${item.equationHtml}</div>`
      : `<p class="uq-fb-lead"><strong>القيمة المدخلة غير صحيحة.</strong> ${hintWhy}</p>`;
    return { valid: true, isCorrect, feedbackHtml };
  }

  if (subpartId === '3.1.2') {
    const scaleNum = Number(response.scale || 20);
    const p1 = parseFlexibleNumber(response.l1);
    const p2 = parseFlexibleNumber(response.l2);
    const pr = parseFlexibleNumber(response.lr);
    const angle = String(response.angle ?? '').trim();
    if (!p1.ok || !p2.ok || !pr.ok || !angle) {
      return {
        valid: false,
        message: 'أدخل أطوال الأسهم الثلاثة بالسنتيمتر واختر وضع التمثيل الهندسي قبل التحقق.',
      };
    }
    const exp1 = 80 / scaleNum;
    const exp2 = 60 / scaleNum;
    const expr = 100 / scaleNum;
    const badUnit = [p1, p2, pr].some((p) => p.embeddedUnit && p.embeddedUnit !== 'cm');
    const ok1 = !badUnit && approxEqual(p1.value, exp1, 1e-4);
    const ok2 = !badUnit && approxEqual(p2.value, exp2, 1e-4);
    const okr = !badUnit && approxEqual(pr.value, expr, 1e-4);
    const okAngle = angle === '90';
    const isCorrect = ok1 && ok2 && okr && okAngle;

    const issues = [];
    if (badUnit) issues.push(`أطوال الأسهم على الرسم تُكتب بالسنتيمتر ${tex('\\mathrm{cm}', 'cm')}.`);
    if (!ok1) issues.push(`طول سهم ${V_F1} (${qty(80, 'N')}) وفق المقياس المختار (${tex(`1~\\mathrm{cm}\\leftrightarrow${scaleNum}~\\mathrm{N}`, `1 cm to ${scaleNum} N`)}) يجب أن يساوي ${qty(exp1, 'cm')}.`);
    if (!ok2) issues.push(`طول سهم ${V_F2} (${qty(60, 'N')}) وفق المقياس المختار يجب أن يساوي ${qty(exp2, 'cm')}.`);
    if (!okr) issues.push(`طول سهم المحصلة ${V_F} (${qty(100, 'N')}) وفق المقياس المختار يجب أن يساوي ${qty(expr, 'cm')}.`);
    if (!okAngle) issues.push(`القوتان متلاقيتان متعامدتان، فيجب رسمهما بزاوية قائمة ${tex('90^{\\circ}', '90 degrees')} من المبدأ ${tex('O', 'O')} والمحصلة قطر المستطيل.`);

    const dynamicEq = calculation(
      `1~\\mathrm{cm}\\leftrightarrow${scaleNum}~\\mathrm{N}\\;\\Rightarrow\\;L_{1}=${exp1}~\\mathrm{cm},\\;L_{2}=${exp2}~\\mathrm{cm},\\;L=${expr}~\\mathrm{cm}`,
      `At 1 cm to ${scaleNum} N: L1 equals ${exp1} cm, L2 equals ${exp2} cm, L equals ${expr} cm`,
    );
    const feedbackHtml = isCorrect
      ? `<p class="uq-fb-lead"><strong>تمثيل متجهي سليم بمقياس رسم متناسق!</strong></p><div class="uq-fb-math">${dynamicEq}</div>`
      : `<p class="uq-fb-lead"><strong>راجع أبعاد التمثيل على الرسم:</strong></p><ul class="uq-fb-issues">${issues.map((entry) => `<li>${entry}</li>`).join('')}</ul>`;
    return { valid: true, isCorrect, feedbackHtml };
  }

  if (subpartId === '3.1.3') {
    const parsedMag = parseFlexibleNumber(response.fPrimeMag);
    const dir = String(response.fPrimeDir ?? '').trim();
    if (!parsedMag.ok || !dir) {
      return {
        valid: false,
        message: `أدخل شدة القوة ${S_F_PRIME} بالنيوتن وحدّد اتجاه تمثيلها على الرسم قبل التحقق.`,
      };
    }
    const unitOk = !parsedMag.embeddedUnit || parsedMag.embeddedUnit === 'N';
    const magOk = unitOk && approxEqual(parsedMag.value, 100, 1e-4);
    const dirOk = dir === 'opposite-collinear';
    const isCorrect = magOk && dirOk;
    const issues = [];
    if (!unitOk) issues.push(`تُقاس شدة ${S_F_PRIME} بوحدة النيوتن ${tex('\\mathrm{N}', 'N')}.`);
    else if (!magOk) issues.push(`القوة المعاكسة مباشرة للمحصلة تساوي المحصلة بالشدة، أي ${qty(100, 'N')} (وبطول رسم مساوٍ لطول ${V_F}).`);
    if (!dirOk) issues.push(`يجب أن تقع ${V_F_PRIME} على حامل المحصلة ${V_F} نفسه من النقطة ${tex('O', 'O')} وبجهة معاكسة مباشرة لها (${tex('180^{\\circ}', '180 degrees')}).`);

    const feedbackHtml = isCorrect
      ? `<p class="uq-fb-lead"><strong>إجابة صحيحة!</strong> القوة ${V_F_PRIME} تقع على حامل ${V_F} نفسه وبجهة معاكسة وشدتها ${qty(100, 'N')}، فمحصلتهما معدومة.</p><div class="uq-fb-math">${item.equationHtml}</div>`
      : `<p class="uq-fb-lead"><strong>تحقّق من شرطي القوة المعاكسة مباشرة:</strong></p><ul class="uq-fb-issues">${issues.map((entry) => `<li>${entry}</li>`).join('')}</ul>`;
    return { valid: true, isCorrect, feedbackHtml };
  }

  if (subpartId === '3.2.1') {
    const larger = String(response.largerForce ?? '').trim();
    const reason = String(response.reason ?? '').trim();
    if (!larger || !reason) {
      return {
        valid: false,
        message: 'حدّد أيهما القوة الأكبر واختر التعليل الفيزيائي المناسب قبل التحقق.',
      };
    }
    const okForce = larger === 'F2';
    const okReason = reason === 'outside-near-f2';
    const isCorrect = okForce && okReason;
    const issues = [];
    if (!okForce) {
      issues.push(`لو كانت ${V_F1} هي الأكبر لوقع حامل المحصلة خارج الساق من جهة ${V_F1}، فكان بعده عن حامل ${V_F2} أكبر من طول الساق (${qty(1, 'm')} = ${qty(100, 'cm')})، وهذا يناقض المعطى ${qty(30, 'cm')}. إذن ${V_F2} هي الأكبر.`);
    }
    if (!okReason) {
      issues.push(`التعليل الصحيح يعتمد على أن حامل محصلة القوتين المتعاكستين يقع خارج القطعة بين الحاملين ومن جهة القوة الأكبر؛ وبما أن ${tex('30~\\mathrm{cm}<100~\\mathrm{cm}', '30 cm less than 100 cm')} فإن الحامل يقع خارج الساق من جهة ${V_F2}، أي ${tex('d_{2}<d_{1}', 'd2 less than d1')} ومنه ${tex('F_{2}>F_{1}', 'F2 greater than F1')}.`);
    }
    const feedbackHtml = isCorrect
      ? `<p class="uq-fb-lead"><strong>استنتاج فيزيائي دقيق!</strong> القوة الثانية ${V_F2} هي الأكبر لأن حامل المحصلة خارج الساق من جهتها ${tex('(30~\\mathrm{cm}<100~\\mathrm{cm})', '30 cm less than 100 cm')}.</p><div class="uq-fb-math">${item.equationHtml}</div>`
      : `<p class="uq-fb-lead"><strong>راجع تحديد القوة الأكبر أو تعليله:</strong></p><ul class="uq-fb-issues">${issues.map((entry) => `<li>${entry}</li>`).join('')}</ul>`;
    return { valid: true, isCorrect, feedbackHtml };
  }

  if (subpartId === '3.2.2') {
    const parsed = parseFlexibleNumber(response.d1Value);
    if (!parsed.ok) {
      return {
        valid: false,
        message: parsed.reason === 'empty'
          ? `أدخل بُعد حامل القوة الأولى ${V_F1} عن حامل المحصلة قبل التحقق.`
          : 'أدخل قيمة عددية صحيحة التنسيق (مثل 130 مع cm أو 1.3 مع m).',
      };
    }
    const effectiveUnit = parsed.embeddedUnit || (response.d1Unit === 'm' ? 'm' : 'cm');
    if (effectiveUnit !== 'cm' && effectiveUnit !== 'm') {
      return {
        valid: true,
        isCorrect: false,
        feedbackHtml: `<p class="uq-fb-lead"><strong>وحدة غير مناسبة:</strong> البُعد مسافة تُقاس بالسنتيمتر ${tex('\\mathrm{cm}', 'cm')} أو بالمتر ${tex('\\mathrm{m}', 'm')}.</p>`,
      };
    }
    const valueInCm = effectiveUnit === 'm' ? parsed.value * 100 : parsed.value;
    const isCorrect = approxEqual(valueInCm, 130, 1e-3);

    let diagnostic = 'وحّد الوحدات أولاً ثم اجمع طول الساق مع بُعد القوة الثانية عن المحصلة.';
    if (approxEqual(valueInCm, 70, 1e-3)) {
      diagnostic = `القيمة ${effectiveUnit === 'm' ? qty(0.7, 'm') : qty(70, 'cm')} ناتجة عن الطرح (${tex('100-30', '100 minus 30')}) كما لو أن المحصلة بين القوتين؛ لكن القوتين متعاكستان وحامل المحصلة خارج الساق من جهة ${V_F2}، فنجمع ${tex('100+30=130~\\mathrm{cm}', '100 plus 30 equals 130 cm')}.`;
    } else if (approxEqual(parsed.value, 31, 1e-3)) {
      diagnostic = `جمعتَ ${tex('1+30=31', '1 plus 30 equals 31')} دون توحيد الوحدات بين المتر والسنتيمتر! حوّل ${tex('1~\\mathrm{m}=100~\\mathrm{cm}', '1 m equals 100 cm')} أو ${tex('30~\\mathrm{cm}=0.3~\\mathrm{m}', '30 cm equals 0.3 m')} قبل الجمع.`;
    } else if ((effectiveUnit === 'm' && approxEqual(parsed.value, 130, 1e-3)) || (effectiveUnit === 'cm' && approxEqual(parsed.value, 1.3, 1e-3))) {
      diagnostic = `العدد صحيح لكن الوحدة المختارة لا تطابقه: تذكّر أن ${tex('130~\\mathrm{cm}=1.3~\\mathrm{m}', '130 cm equals 1.3 m')}.`;
    }

    const feedbackHtml = isCorrect
      ? `<p class="uq-fb-lead"><strong>إجابة صحيحة!</strong> بُعد حامل ${V_F1} عن حامل المحصلة يساوي ${qty(130, 'cm')} (أي ${qty(1.3, 'm')}).</p><div class="uq-fb-math">${item.equationHtml}</div>`
      : `<p class="uq-fb-lead"><strong>البُعد المحسوب غير دقيق.</strong> ${diagnostic}</p>`;
    return { valid: true, isCorrect, feedbackHtml };
  }

  if (subpartId === '3.2.3') {
    const pF1 = parseFlexibleNumber(response.f1Value);
    const pF2 = parseFlexibleNumber(response.f2Value);
    if (!pF1.ok || !pF2.ok) {
      return {
        valid: false,
        message: `أدخل قيمتي شدتي القوتين ${S_F1} و ${S_F2} بالنيوتن قبل التحقق.`,
      };
    }
    const unitBad = (pF1.embeddedUnit && pF1.embeddedUnit !== 'N') || (pF2.embeddedUnit && pF2.embeddedUnit !== 'N');
    const okF1 = !unitBad && approxEqual(pF1.value, 45, 1e-3);
    const okF2 = !unitBad && approxEqual(pF2.value, 195, 1e-3);
    const isCorrect = okF1 && okF2;

    const issues = [];
    if (unitBad) {
      issues.push(`تُقاس شدة كل قوة بوحدة النيوتن ${tex('\\mathrm{N}', 'N')}.`);
    } else if (approxEqual(pF1.value, 195, 1e-3) && approxEqual(pF2.value, 45, 1e-3)) {
      issues.push(`عكستَ القيمتين بين ${S_F1} و ${S_F2}! وجدنا في الفرع الأول أن ${tex('F_{2}>F_{1}', 'F2 greater than F1')}، لذا ${tex('F_{1}=45~\\mathrm{N}', 'F1 equals 45 N')} و ${tex('F_{2}=195~\\mathrm{N}', 'F2 equals 195 N')}.`);
    } else {
      if (!okF1) issues.push(`شدة القوة الأولى ${S_F1} غير صحيحة؛ طبّق التناسب ${tex('\\dfrac{F_{1}}{d_{2}}=\\dfrac{F}{d}', 'F1 over d2 equals F over d')} مع ${tex('d_{2}=30~\\mathrm{cm}', '30 cm')} و ${tex('d=100~\\mathrm{cm}', '100 cm')}.`);
      if (!okF2) issues.push(`شدة القوة الثانية ${S_F2} غير صحيحة؛ تذكّر أن ${tex('F_{2}-F_{1}=150~\\mathrm{N}', 'F2 minus F1 equals 150 N')} أي ${tex('F_{2}=F+F_{1}', 'F2 equals F plus F1')}.`);
    }

    const feedbackHtml = isCorrect
      ? `<p class="uq-fb-lead"><strong>حل متكامل وصحيح!</strong> ${tex('F_{1}=45~\\mathrm{N}', 'F1 equals 45 N')} و ${tex('F_{2}=195~\\mathrm{N}', 'F2 equals 195 N')}، والفرق ${tex('195-45=150~\\mathrm{N}', '150 N')} يطابق شدة المحصلة.</p><div class="uq-fb-math">${item.equationHtml}</div>`
      : `<p class="uq-fb-lead"><strong>راجع حساب الشدتين:</strong></p><ul class="uq-fb-issues">${issues.map((entry) => `<li>${entry}</li>`).join('')}</ul>`;
    return { valid: true, isCorrect, feedbackHtml };
  }

  return { valid: false, message: 'نوع فرع غير معروف.' };
}

/**
 * Computes honest multi-branch summary for a question ('q1', 'q2', 'q3') or problem ('p1', 'p2').
 * A multi-branch group is ONLY `allCorrect` when EVERY branch in it has been checked AND is correct.
 */
export function computeQuestionGroupSummary(state, groupKey) {
  const items = UNIT_QUESTIONS_SUBPARTS.filter(
    (item) => item.questionId === groupKey || item.problemId === groupKey,
  );
  const total = items.length;
  let answeredCount = 0;
  let checkedCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  for (const item of items) {
    const b = state.branches[item.id];
    const st = getSubpartStatus(b, item.id);
    if (st !== 'unanswered') answeredCount += 1;
    if (b?.checked) {
      checkedCount += 1;
      if (b.isCorrect) correctCount += 1;
      else incorrectCount += 1;
    }
  }

  const allChecked = total > 0 && checkedCount === total;
  const allCorrect = allChecked && correctCount === total;
  let status = 'unanswered';
  let badgeText = `0/${total}`;

  if (allCorrect) {
    status = 'correct';
    badgeText = `مكتمل وصحيح (${correctCount}/${total})`;
  } else if (allChecked) {
    status = 'partial';
    badgeText = `تم التحقق · الصحيحة ${correctCount}/${total}`;
  } else if (checkedCount > 0) {
    status = incorrectCount > 0 ? 'partial' : 'in-progress';
    badgeText = `تحقّقت من ${checkedCount}/${total}`;
  } else if (answeredCount > 0) {
    status = 'answered';
    badgeText = `أُجيب عن ${answeredCount}/${total}`;
  } else {
    badgeText = `لم يُجب (0/${total})`;
  }

  return {
    groupKey,
    total,
    answeredCount,
    checkedCount,
    correctCount,
    incorrectCount,
    allChecked,
    allCorrect,
    status,
    badgeText,
    shortBadge: allCorrect ? `✓ ${correctCount}/${total}` : `${checkedCount}/${total}`,
  };
}

export function computeOverallSummary(state) {
  const overall = {
    total: UNIT_QUESTIONS_SUBPARTS.length,
    answeredCount: 0,
    checkedCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    uncheckedAnsweredIds: [],
  };

  for (const item of UNIT_QUESTIONS_SUBPARTS) {
    const b = state.branches[item.id];
    const answered = isSubpartAnswered(item.id, b?.response);
    if (answered) overall.answeredCount += 1;
    if (b?.checked) {
      overall.checkedCount += 1;
      if (b.isCorrect) overall.correctCount += 1;
      else overall.incorrectCount += 1;
    } else if (answered) {
      overall.uncheckedAnsweredIds.push(item.id);
    }
  }

  overall.isFinal = overall.checkedCount === overall.total;
  overall.groups = {
    q1: computeQuestionGroupSummary(state, 'q1'),
    q2: computeQuestionGroupSummary(state, 'q2'),
    q3: computeQuestionGroupSummary(state, 'q3'),
    p1: computeQuestionGroupSummary(state, 'p1'),
    p2: computeQuestionGroupSummary(state, 'p2'),
  };
  return overall;
}

/* --------------------------------------------------------------------------
 * Physics SVG Diagrams (clear labels, zero collisions, explicit provenance)
 * -------------------------------------------------------------------------- */

function uqForceSymbol(x, y, { subscript = null, prime = false, color = 'blue', extra = '' } = {}) {
  const w = 13.5;
  const arrowSpan = prime ? w + 4.5 : w;
  const arrowY = y - 19.5;
  const h = 3.6;
  const subX = x + w;
  const afterX = subscript !== null ? subX + 12 : (prime ? x + w + 9 : x + w + 6);
  const symName = `F${prime ? "'" : ''}${subscript ?? ''}`;
  return `<g class="uq-vec-sym sym-${color}" data-force-symbol="${symName}" direction="ltr">
    <text class="force-symbol" fill="currentColor" x="${x}" y="${y}" text-anchor="start" direction="ltr">F</text>
    ${prime ? `<text class="force-prime" fill="currentColor" x="${x + w}" y="${y - 3}" text-anchor="start" direction="ltr">′</text>` : ''}
    ${subscript !== null ? `<text class="force-sub" fill="currentColor" x="${subX}" y="${y + 4.8}" text-anchor="start" direction="ltr">${subscript}</text>` : ''}
    <path class="force-vec-arrow" stroke="currentColor" d="M ${x + 0.5} ${arrowY} H ${x + arrowSpan + 1.2} m 0 0 l ${-h} ${-h * 0.72} m ${h} ${h * 0.72} l ${-h} ${h * 0.72}" />
    ${extra ? `<text class="uq-svg-math-inline" fill="currentColor" x="${afterX}" y="${y}" text-anchor="start" direction="ltr">${extra}</text>` : ''}
  </g>`;
}

export function renderQuestionTwoDiagram(response = {}, isChecked = false) {
  const pos = response.diagramPos || '';
  const sense = response.diagramSense || '';

  let resultantMarkup = `
    <rect x="454" y="18" width="212" height="30" rx="15" fill="#eef2f9" stroke="#d4deee" />
    <text x="560" y="38" text-anchor="middle" class="uq-svg-note">اختر موضع الحامل وجهته لتمثيل المحصلة</text>
  `;

  if (pos) {
    const xMap = { 'outside-larger': 548, inside: 295, 'outside-smaller': 64 };
    const cx = xMap[pos] ?? 548;
    const isUp = sense !== 'smaller';
    const yStart = isUp ? 144 : 156;
    const yEnd = isUp ? 72 : 228;
    const symX = cx === 64 ? 24 : cx + 18;
    const symY = isUp ? 98 : 210;

    const extLine = pos === 'outside-larger'
      ? `<line x1="430" y1="150" x2="572" y2="150" class="uq-svg-ext" />`
      : pos === 'outside-smaller'
        ? `<line x1="42" y1="150" x2="150" y2="150" class="uq-svg-ext" />`
        : '';

    const dims = (isChecked && pos === 'outside-larger' && sense === 'larger')
      ? `
        <g class="uq-svg-dims">
          <line x1="430" y1="252" x2="548" y2="252" class="uq-svg-dim" marker-start="url(#uq-q2-dim)" marker-end="url(#uq-q2-dim)" />
          <text x="489" y="244" text-anchor="middle" class="uq-svg-math" direction="ltr">d₂</text>
          <line x1="150" y1="278" x2="548" y2="278" class="uq-svg-dim" marker-start="url(#uq-q2-dim)" marker-end="url(#uq-q2-dim)" />
          <text x="349" y="270" text-anchor="middle" class="uq-svg-math" direction="ltr">d₁</text>
        </g>`
      : '';

    resultantMarkup = `
      ${extLine}
      <line x1="${cx}" y1="48" x2="${cx}" y2="242" class="uq-svg-carrier-res" />
      <circle cx="${cx}" cy="150" r="5" fill="#fff" stroke="#33568f" stroke-width="2.5" />
      <text x="${cx - 15}" y="138" text-anchor="middle" class="uq-svg-point" direction="ltr">C</text>
      <line x1="${cx}" y1="${yStart}" x2="${cx}" y2="${yEnd}" class="uq-svg-vec-res" marker-end="url(#uq-q2-res)" />
      ${uqForceSymbol(symX, symY, { color: 'blue' })}
      ${dims}
    `;
  }

  return `
    <figure class="uq-physics-figure" data-uq-diagram="q2" data-platform-illustration="question-two-interactive">
      <div class="uq-figure-topbar">
        <span class="uq-figure-badge">مساحة الرسم التخطيطي التفاعلي · من المنصة</span>
        <span class="uq-figure-scale-note">بدون مقادير عددية · غير مرسوم بمقياس</span>
      </div>
      <svg class="uq-svg" direction="ltr" viewBox="0 0 680 296" role="img" aria-labelledby="uq-q2-svg-title uq-q2-svg-desc" focusable="false">
        <title id="uq-q2-svg-title">تمثيل تفاعلي لمحصلة قوتين شاقوليتين متعاكستين تؤثران في طرفي مسطرة خفيفة</title>
        <desc id="uq-q2-svg-desc">مسطرة أفقية خفيفة AB تؤثر في طرفها الأيسر A قوة شاقولية نحو الأسفل F1 أصغر شدة، وفي طرفها الأيمن B قوة شاقولية نحو الأعلى F2 أكبر شدة، مع تمثيل موضع المحصلة F وجهتها بحسب اختيار الطالب.</desc>
        <defs>
          <marker id="uq-q2-f1" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#bb6a54" /></marker>
          <marker id="uq-q2-f2" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#16706b" /></marker>
          <marker id="uq-q2-res" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#33568f" /></marker>
          <marker id="uq-q2-dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b" /></marker>
        </defs>
        <rect x="0" y="0" width="680" height="296" rx="12" fill="#fbfcfe" />
        <line x1="150" y1="48" x2="150" y2="242" class="uq-svg-carrier" />
        <line x1="430" y1="48" x2="430" y2="242" class="uq-svg-carrier" />
        <rect x="146" y="144" width="288" height="12" rx="6" class="uq-svg-rod" />
        <text x="290" y="135" text-anchor="middle" class="uq-svg-caption">مسطرة خفيفة</text>

        <circle cx="150" cy="150" r="4.5" fill="#fff" stroke="#475569" stroke-width="2" />
        <text x="131" y="138" text-anchor="middle" class="uq-svg-point" direction="ltr">A</text>
        <line x1="150" y1="156" x2="150" y2="222" class="uq-svg-vec-f1" marker-end="url(#uq-q2-f1)" />
        ${uqForceSymbol(104, 196, { subscript: '1', color: 'coral' })}
        <text x="114" y="218" text-anchor="middle" class="uq-svg-subnote">(الأصغر)</text>

        <circle cx="430" cy="150" r="4.5" fill="#fff" stroke="#475569" stroke-width="2" />
        <text x="411" y="176" text-anchor="middle" class="uq-svg-point" direction="ltr">B</text>
        <line x1="430" y1="144" x2="430" y2="54" class="uq-svg-vec-f2" marker-end="url(#uq-q2-f2)" />
        ${uqForceSymbol(382, 86, { subscript: '2', color: 'teal' })}
        <text x="392" y="108" text-anchor="middle" class="uq-svg-subnote">(الأكبر)</text>

        ${resultantMarkup}
      </svg>
      <figcaption>بفرض ${tex('F_{2}>F_{1}', 'F2 greater than F1')} عند الطرف ${tex('B', 'B')} للتوضيح (وإذا كانت الكبرى عند ${tex('A', 'A')} ينعكس موضع المحصلة إلى اليسار). الكتاب لم يطبع شكلاً جاهزاً بل طلب من الطالب الرسم.</figcaption>
    </figure>
  `;
}

export function renderProblemOneDiagram(state) {
  const b2 = state?.branches?.['3.1.2'];
  const b3 = state?.branches?.['3.1.3'];
  const scaleNum = Number(b2?.response?.scale || 20);
  const expL1 = 80 / scaleNum;
  const expL2 = 60 / scaleNum;
  const expLr = 100 / scaleNum;

  const ox = 310;
  const oy = 185;
  const dx = 152;
  const dy = 114;

  const gridLines = [];
  for (let gx = 44; gx <= 652; gx += 38) {
    gridLines.push(`<line x1="${gx}" y1="18" x2="${gx}" y2="322" class="uq-svg-grid" />`);
  }
  for (let gy = 33; gy <= 300; gy += 38) {
    gridLines.push(`<line x1="24" y1="${gy}" x2="656" y2="${gy}" class="uq-svg-grid" />`);
  }

  const showResultant = Boolean(b2?.checked || isSubpartAnswered('3.1.2', b2?.response));
  const fPrimeDir = b3?.response?.fPrimeDir || '';

  let fPrimeSvg = '';
  if (fPrimeDir === 'opposite-collinear') {
    fPrimeSvg = `
      <line x1="${ox - dx - 18}" y1="${oy + dy + 13.5}" x2="${ox + dx + 18}" y2="${oy - dy - 13.5}" class="uq-svg-carrier-res" />
      <line x1="${ox}" y1="${oy}" x2="${ox - dx}" y2="${oy + dy}" class="uq-svg-vec-opp" marker-end="url(#uq-p1-opp)" />
      ${uqForceSymbol(ox - 138, oy + 52, { prime: true, color: 'gold', extra: '(100 N)' })}
    `;
  } else if (fPrimeDir === 'same-collinear') {
    fPrimeSvg = `
      <line x1="${ox}" y1="${oy + 8}" x2="${ox + dx}" y2="${oy - dy + 8}" class="uq-svg-vec-opp" marker-end="url(#uq-p1-opp)" />
      ${uqForceSymbol(ox + 102, oy - 30, { prime: true, color: 'gold' })}
    `;
  } else if (fPrimeDir === 'perpendicular') {
    fPrimeSvg = `
      <line x1="${ox}" y1="${oy}" x2="${ox - dy}" y2="${oy - dx * 0.75}" class="uq-svg-vec-opp" marker-end="url(#uq-p1-opp)" />
      ${uqForceSymbol(ox - 96, oy - 72, { prime: true, color: 'gold' })}
    `;
  } else if (fPrimeDir === 'opposite-f1') {
    fPrimeSvg = `
      <line x1="${ox}" y1="${oy}" x2="${ox - dx}" y2="${oy}" class="uq-svg-vec-opp" marker-end="url(#uq-p1-opp)" />
      ${uqForceSymbol(ox - 92, oy - 14, { prime: true, color: 'gold' })}
    `;
  }

  const resultantSvg = showResultant
    ? `
      <line x1="${ox + dx}" y1="${oy}" x2="${ox + dx}" y2="${oy - dy}" class="uq-svg-guide" />
      <line x1="${ox}" y1="${oy - dy}" x2="${ox + dx}" y2="${oy - dy}" class="uq-svg-guide" />
      <line x1="${ox}" y1="${oy}" x2="${ox + dx}" y2="${oy - dy}" class="uq-svg-vec-res" marker-end="url(#uq-p1-res)" />
      ${uqForceSymbol(ox + 28, oy - 82, { color: 'blue', extra: b2?.checked && b2?.isCorrect ? `(${expLr} cm)` : '(100 N)' })}
    `
    : '';

  const f2Extra = b2?.checked && b2?.isCorrect
    ? `(${expL2} cm)`
    : (state?.branches?.['3.1.1']?.checked && state.branches['3.1.1'].isCorrect ? '(60 N)' : '(؟)');

  return `
    <figure class="uq-physics-figure" data-uq-diagram="p1" data-platform-illustration="problem-one-interactive">
      <div class="uq-figure-topbar">
        <span class="uq-figure-badge">شبكة الرسم المتجهي بمقياس · المسألة الأولى (الفرعان 2 و3)</span>
        <span class="uq-figure-scale-note" dir="ltr">1 cm ↔ ${scaleNum} N</span>
      </div>
      <svg class="uq-svg" direction="ltr" viewBox="0 0 680 336" role="img" aria-labelledby="uq-p1-svg-title uq-p1-svg-desc" focusable="false">
        <title id="uq-p1-svg-title">تمثيل بمقياس رسم للقوتين المتعامدتين F1 و F2 والمحصلة F والقوة المعاكسة مباشرة F فتحة</title>
        <desc id="uq-p1-svg-desc">من النقطة المشتركة O تنطلق القوة F1 أفقياً بشدة 80 نيوتن والقوة F2 شاقولياً بزاوية قائمة، وتمثل المحصلة F بقطر المستطيل، بينما تقع القوة المعاكسة مباشرة F فتحة على حامل F نفسه وبجهة معاكسة.</desc>
        <defs>
          <marker id="uq-p1-f1" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#16706b" /></marker>
          <marker id="uq-p1-f2" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#bb6a54" /></marker>
          <marker id="uq-p1-res" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#33568f" /></marker>
          <marker id="uq-p1-opp" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#8a6420" /></marker>
        </defs>
        <rect x="0" y="0" width="680" height="336" rx="12" fill="#fbfcfe" />
        ${gridLines.join('')}

        <rect x="34" y="24" width="166" height="44" rx="8" fill="#ffffff" stroke="#dce3ee" />
        <line x1="48" y1="49" x2="86" y2="49" stroke="#334155" stroke-width="2.5" />
        <line x1="48" y1="44" x2="48" y2="54" stroke="#334155" stroke-width="2" />
        <line x1="86" y1="44" x2="86" y2="54" stroke="#334155" stroke-width="2" />
        <text x="140" y="51" text-anchor="middle" class="uq-svg-math" direction="ltr">1 cm = ${scaleNum} N</text>

        <path d="M ${ox} ${oy - 18} L ${ox + 18} ${oy - 18} L ${ox + 18} ${oy}" fill="none" stroke="#8a6420" stroke-width="2" />

        <line x1="${ox}" y1="${oy}" x2="${ox + dx}" y2="${oy}" class="uq-svg-vec-f2" marker-end="url(#uq-p1-f1)" />
        ${uqForceSymbol(ox + 46, oy + 28, { subscript: '1', color: 'teal', extra: b2?.checked && b2?.isCorrect ? `(${expL1} cm)` : '(80 N)' })}

        <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy - dy}" class="uq-svg-vec-f1" marker-end="url(#uq-p1-f2)" />
        ${uqForceSymbol(ox - 102, oy - 54, { subscript: '2', color: 'coral', extra: f2Extra })}

        ${resultantSvg}
        ${fPrimeSvg}

        <circle cx="${ox}" cy="${oy}" r="5.5" fill="#ffffff" stroke="#1a2438" stroke-width="2.6" />
        <text x="${ox - 16}" y="${oy - 10}" text-anchor="middle" class="uq-svg-point" direction="ltr">O</text>
      </svg>
      <div class="uq-diagram-legend" aria-label="مفتاح متجهات المسألة الأولى">
        <span><i class="uq-swatch-teal" aria-hidden="true"></i> ${V_F1} أفقية</span>
        <span><i class="uq-swatch-coral" aria-hidden="true"></i> ${V_F2} شاقولية متعامدة</span>
        <span><i class="uq-swatch-blue" aria-hidden="true"></i> ${V_F} المحصلة</span>
        <span><i class="uq-swatch-gold" aria-hidden="true"></i> ${V_F_PRIME} المعاكسة مباشرة</span>
      </div>
      <figcaption>رسم متجهي تفاعلي من المنصة يعكس اختيارك لمقياس الرسم واتجاه ${V_F_PRIME} من النقطة المشتركة ${tex('O', 'O')}.</figcaption>
    </figure>
  `;
}

export function renderProblemTwoDiagram(state) {
  const c1 = Boolean(state?.branches?.['3.2.1']?.checked && state.branches['3.2.1'].isCorrect);
  const c2 = Boolean(state?.branches?.['3.2.2']?.checked && state.branches['3.2.2'].isCorrect);
  const c3 = Boolean(state?.branches?.['3.2.3']?.checked && state.branches['3.2.3'].isCorrect);

  const f1EndY = c1 ? 204 : 214;
  const f2EndY = c1 ? 52 : 76;

  const revealedResultant = c1
    ? `
      <line x1="430" y1="145" x2="538" y2="145" class="uq-svg-ext" />
      <line x1="520" y1="48" x2="520" y2="238" class="uq-svg-carrier-res" />
      <circle cx="520" cy="145" r="4.5" fill="#fff" stroke="#33568f" stroke-width="2.3" />
      <text x="504" y="135" text-anchor="middle" class="uq-svg-point" direction="ltr">C</text>
      <line x1="520" y1="139" x2="520" y2="68" class="uq-svg-vec-res" marker-end="url(#uq-p2-res)" />
      ${uqForceSymbol(534, 92, { color: 'blue', extra: '(150 N)' })}

      <line x1="430" y1="230" x2="520" y2="230" class="uq-svg-dim" marker-start="url(#uq-p2-dim)" marker-end="url(#uq-p2-dim)" />
      <text x="475" y="222" text-anchor="middle" class="uq-svg-math" direction="ltr">d₂ = 30 cm</text>

      <line x1="130" y1="264" x2="520" y2="264" class="uq-svg-dim" marker-start="url(#uq-p2-dim)" marker-end="url(#uq-p2-dim)" />
      <text x="325" y="256" text-anchor="middle" class="uq-svg-math" direction="ltr">${c2 ? 'd₁ = 130 cm (1.3 m)' : 'd₁ = ؟'}</text>
    `
    : `
      <rect x="454" y="18" width="212" height="30" rx="15" fill="#f9f3e6" stroke="#e6d9bc" />
      <text x="560" y="38" text-anchor="middle" class="uq-svg-note-warm">يظهر حامل المحصلة بعد حل الفرع 1</text>
    `;

  return `
    <figure class="uq-physics-figure" data-uq-diagram="p2" data-platform-illustration="problem-two-schematic">
      <div class="uq-figure-topbar">
        <span class="uq-figure-badge">رسم تخطيطي لنظام المسألة الثانية · من المنصة</span>
        <span class="uq-figure-scale-note">أطوال الأسهم تخطيطية غير مرسومة بمقياس للقوى</span>
      </div>
      <svg class="uq-svg" direction="ltr" viewBox="0 0 680 288" role="img" aria-labelledby="uq-p2-svg-title uq-p2-svg-desc" focusable="false">
        <title id="uq-p2-svg-title">ساق معدنية خفيفة طولها متر واحد تؤثر في طرفيها قوتان شاقوليتان متعاكستان</title>
        <desc id="uq-p2-svg-desc">ساق أفقية خفيفة AB طولها 1 متر، تؤثر عمودياً في طرفها A القوة F1 وفي طرفها B القوة F2 بجهتين متعاكستين، مع إظهار حامل المحصلة بعد تحقق الطالب من القوة الأكبر.</desc>
        <defs>
          <marker id="uq-p2-f1" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#bb6a54" /></marker>
          <marker id="uq-p2-f2" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#16706b" /></marker>
          <marker id="uq-p2-res" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#33568f" /></marker>
          <marker id="uq-p2-dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b" /></marker>
        </defs>
        <rect x="0" y="0" width="680" height="288" rx="12" fill="#fbfcfe" />

        <line x1="130" y1="48" x2="130" y2="238" class="uq-svg-carrier" />
        <line x1="430" y1="48" x2="430" y2="238" class="uq-svg-carrier" />
        <rect x="126" y="139" width="308" height="12" rx="6" class="uq-svg-rod" />

        <path d="M 130 163 L 143 163 L 143 151" fill="none" stroke="#8a6420" stroke-width="1.8" />
        <path d="M 417 139 L 417 127 L 430 127" fill="none" stroke="#8a6420" stroke-width="1.8" />

        <circle cx="130" cy="145" r="4.5" fill="#fff" stroke="#475569" stroke-width="2" />
        <text x="112" y="134" text-anchor="middle" class="uq-svg-point" direction="ltr">A</text>
        <line x1="130" y1="151" x2="130" y2="${f1EndY}" class="uq-svg-vec-f1" marker-end="url(#uq-p2-f1)" />
        ${uqForceSymbol(c3 ? 34 : 92, 190, { subscript: '1', color: 'coral', extra: c3 ? '(45 N)' : '' })}

        <circle cx="430" cy="145" r="4.5" fill="#fff" stroke="#475569" stroke-width="2" />
        <text x="412" y="170" text-anchor="middle" class="uq-svg-point" direction="ltr">B</text>
        <line x1="430" y1="139" x2="430" y2="${f2EndY}" class="uq-svg-vec-f2" marker-end="url(#uq-p2-f2)" />
        ${uqForceSymbol(c3 ? 326 : 386, 86, { subscript: '2', color: 'teal', extra: c3 ? '(195 N)' : '' })}

        <line x1="130" y1="230" x2="430" y2="230" class="uq-svg-dim" marker-start="url(#uq-p2-dim)" marker-end="url(#uq-p2-dim)" />
        <text x="280" y="222" text-anchor="middle" class="uq-svg-math" direction="ltr">d = 1 m (100 cm)</text>

        ${revealedResultant}
      </svg>
      <figcaption>ساق معدنية خفيفة طولها ${qty(1, 'm')} عمودية على حاملي ${V_F1} و ${V_F2}؛ يتحدث الرسم تدريجياً مع تقدمك في فروع المسألة دون كشف الحل مسبقاً.</figcaption>
    </figure>
  `;
}

/* --------------------------------------------------------------------------
 * Interactive Student Area Rendering
 * -------------------------------------------------------------------------- */

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function renderActionBar(item, branchState, status) {
  const hintCount = item.hints.length;
  const shown = branchState.hintLevel || 0;
  const hintLabel = shown === 0
    ? `تلميح (<bdi dir="ltr">1/${hintCount}</bdi>)`
    : shown < hintCount
      ? `التلميح التالي (<bdi dir="ltr">${shown + 1}/${hintCount}</bdi>)`
      : `عُرض التلميحان (<bdi dir="ltr">${hintCount}/${hintCount}</bdi>)`;
  const canReset = status !== 'unanswered' || shown > 0;

  const hintHtml = shown > 0
    ? `<div class="uq-hint-box" data-uq-hints>
        <span class="uq-platform-chip">تلميح تعليمي من المنصة — لا يُحتسب إجابة</span>
        ${item.hints.slice(0, shown).map((h, idx) => `<p><strong>تلميح ${idx + 1}:</strong> ${h}</p>`).join('')}
      </div>`
    : `<div class="uq-hint-box" data-uq-hints hidden></div>`;

  const feedbackClass = branchState.checked
    ? (branchState.isCorrect ? 'uq-feedback is-correct' : 'uq-feedback is-incorrect')
    : 'uq-feedback';
  const feedbackHtml = branchState.checked && branchState.feedbackHtml
    ? `<div class="${feedbackClass}" data-uq-feedback role="status" aria-live="polite">${branchState.feedbackHtml}</div>`
    : `<div class="uq-feedback" data-uq-feedback role="status" aria-live="polite" hidden></div>`;

  return `
    <div class="uq-branch-actions">
      <button type="button" class="uq-btn uq-btn-check" data-action="check" data-subpart="${item.id}">تحقّق من الإجابة</button>
      <button type="button" class="uq-btn uq-btn-hint" data-action="hint" data-subpart="${item.id}" ${shown >= hintCount ? 'disabled' : ''}>${hintLabel}</button>
      <button type="button" class="uq-btn uq-btn-ghost" data-action="reset-subpart" data-subpart="${item.id}" ${canReset ? '' : 'hidden'}>إعادة المحاولة</button>
    </div>
    ${hintHtml}
    ${feedbackHtml}
  `;
}

function renderMcqWorkspace(item, branchState) {
  const chosen = branchState.response?.choice || '';
  return `
    <div class="uq-answer-zone" role="group" aria-label="خيارات الفقرة ${item.numberLabel}">
      <ul class="unit-question-options uq-interactive-options">
        ${item.options.map((opt) => {
          const isSelected = chosen === opt.key;
          let stateClass = isSelected ? 'is-selected' : '';
          if (branchState.checked && isSelected) {
            stateClass += branchState.isCorrect ? ' is-checked-correct' : ' is-checked-wrong';
          }
          const inputId = `uq-${item.id.replace(/\./g, '-')}-${opt.key}`;
          return `<li class="unit-question-option ${stateClass}" data-option-card="${opt.key}">
            <label class="uq-option-label" for="${inputId}">
              <input type="radio" id="${inputId}" name="uq-mcq-${item.id}" value="${opt.key}" data-field="choice" ${isSelected ? 'checked' : ''} />
              <bdi class="unit-option-label" dir="ltr">${opt.key}.</bdi>
              <span class="uq-option-content">${opt.html}</span>
            </label>
          </li>`;
        }).join('')}
      </ul>
    </div>
  `;
}

function renderQuestionTwoWorkspace(item, branchState) {
  const r = branchState.response || defaultResponseFor('2.1');
  return `
    ${renderQuestionTwoDiagram(r, branchState.checked && branchState.isCorrect)}
    <div class="uq-answer-zone uq-q2-workspace">
      <div class="uq-workspace-title"><span>1</span> تحديد عناصر المحصلة الأربعة (كتابةً)</div>
      <div class="uq-select-grid">
        <div class="uq-field">
          <label for="uq-q2-carrier">الحامل</label>
          <select id="uq-q2-carrier" data-field="carrier">
            <option value="" ${r.carrier === '' ? 'selected' : ''}>— اختر حامل المحصلة —</option>
            <option value="parallel" ${r.carrier === 'parallel' ? 'selected' : ''}>شاقولي يوازي حاملي القوتين F₁ و F₂</option>
            <option value="perpendicular" ${r.carrier === 'perpendicular' ? 'selected' : ''}>أفقي منطبق على المسطرة عمودياً على القوتين</option>
            <option value="inclined" ${r.carrier === 'inclined' ? 'selected' : ''}>مائل يقطع حاملي القوتين بزاوية حادة</option>
          </select>
        </div>
        <div class="uq-field">
          <label for="uq-q2-sense">الجهة</label>
          <select id="uq-q2-sense" data-field="sense">
            <option value="" ${r.sense === '' ? 'selected' : ''}>— اختر جهة المحصلة —</option>
            <option value="larger" ${r.sense === 'larger' ? 'selected' : ''}>بجهة القوة الأكبر شدةً</option>
            <option value="smaller" ${r.sense === 'smaller' ? 'selected' : ''}>بجهة القوة الأصغر شدةً</option>
            <option value="upward-always" ${r.sense === 'upward-always' ? 'selected' : ''}>نحو الأعلى دائماً مهما كانت الشدتان</option>
          </select>
        </div>
        <div class="uq-field">
          <label for="uq-q2-magnitude">الشدة</label>
          <select id="uq-q2-magnitude" data-field="magnitude">
            <option value="" ${r.magnitude === '' ? 'selected' : ''}>— اختر علاقة شدة المحصلة —</option>
            <option value="difference" ${r.magnitude === 'difference' ? 'selected' : ''}>حاصل طرح الشدتين: F = F_الأكبر − F_الأصغر</option>
            <option value="sum" ${r.magnitude === 'sum' ? 'selected' : ''}>حاصل جمع الشدتين: F = F₁ + F₂</option>
            <option value="pythagoras" ${r.magnitude === 'pythagoras' ? 'selected' : ''}>الجذر التربيعي لمجموع المربعين: √(F₁² + F₂²)</option>
          </select>
        </div>
        <div class="uq-field">
          <label for="uq-q2-point">نقطة التأثير</label>
          <select id="uq-q2-point" data-field="point">
            <option value="" ${r.point === '' ? 'selected' : ''}>— اختر موضع نقطة التأثير —</option>
            <option value="outside-larger" ${r.point === 'outside-larger' ? 'selected' : ''}>على امتداد المسطرة خارج القطعة AB وأقرب للقوة الأكبر (F₁·d₁ = F₂·d₂)</option>
            <option value="inside-larger" ${r.point === 'inside-larger' ? 'selected' : ''}>داخل القطعة المستقيمة AB بين القوتين وأقرب للقوة الأكبر</option>
            <option value="midpoint" ${r.point === 'midpoint' ? 'selected' : ''}>في منتصف المسطرة تماماً بين الطرفين</option>
          </select>
        </div>
      </div>

      <div class="uq-workspace-title"><span>2</span> تمثيل المحصلة على الرسم التخطيطي</div>
      <div class="uq-select-grid">
        <div class="uq-field">
          <label for="uq-q2-diag-pos">موضع حامل المحصلة ${tex('C', 'C')} على الرسم</label>
          <select id="uq-q2-diag-pos" data-field="diagramPos">
            <option value="" ${r.diagramPos === '' ? 'selected' : ''}>— اختر موضع الحامل على الرسم —</option>
            <option value="outside-larger" ${r.diagramPos === 'outside-larger' ? 'selected' : ''}>خارج طرفي المسطرة من جهة القوة الأكبر</option>
            <option value="inside" ${r.diagramPos === 'inside' ? 'selected' : ''}>داخل المسطرة بين حاملي القوتين</option>
            <option value="outside-smaller" ${r.diagramPos === 'outside-smaller' ? 'selected' : ''}>خارج طرفي المسطرة من جهة القوة الأصغر</option>
          </select>
        </div>
        <div class="uq-field">
          <label for="uq-q2-diag-sense">اتجاه سهم المحصلة ${V_F} على الرسم</label>
          <select id="uq-q2-diag-sense" data-field="diagramSense">
            <option value="" ${r.diagramSense === '' ? 'selected' : ''}>— اختر اتجاه السهم —</option>
            <option value="larger" ${r.diagramSense === 'larger' ? 'selected' : ''}>بجهة سهم القوة الأكبر (نحو الأعلى في الرسم)</option>
            <option value="smaller" ${r.diagramSense === 'smaller' ? 'selected' : ''}>بجهة سهم القوة الأصغر (نحو الأسفل في الرسم)</option>
          </select>
        </div>
      </div>

      <div class="uq-field uq-note-field">
        <label for="uq-q2-note">مسودة صياغتك الكتابية (اختيارية — للمراجعة الذاتية دون تصحيح نصي هش)</label>
        <textarea id="uq-q2-note" rows="2" data-field="note" placeholder="اكتب صياغتك الخاصة لعناصر المحصلة الأربعة لمقارنتها بالخلاصة العلمية بعد التحقق…">${escapeHtml(r.note)}</textarea>
      </div>
    </div>
  `;
}

function renderSubpartCard(item, state) {
  const branchState = state.branches[item.id];
  const status = getSubpartStatus(branchState, item.id);
  let workspaceHtml = '';

  if (item.type === 'mcq') {
    workspaceHtml = renderMcqWorkspace(item, branchState);
  } else if (item.id === '2.1') {
    workspaceHtml = renderQuestionTwoWorkspace(item, branchState);
  } else if (item.id === '3.1.1') {
    const val = branchState.response?.value ?? '';
    workspaceHtml = `
      <div class="uq-answer-zone">
        <div class="uq-numeric-row">
          <label for="uq-input-3-1-1">شدة القوة الثانية ${S_F2}:</label>
          <div class="uq-input-with-unit">
            <input id="uq-input-3-1-1" type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-field="value" value="${escapeHtml(val)}" placeholder="أدخل القيمة العددية" />
            <span class="uq-unit-pill" dir="ltr">${tex('\\mathrm{N}', 'N')}</span>
          </div>
        </div>
      </div>
    `;
  } else if (item.id === '3.1.2') {
    const r = branchState.response || defaultResponseFor('3.1.2');
    workspaceHtml = `
      <div class="uq-answer-zone">
        <div class="uq-select-grid">
          <div class="uq-field">
            <label for="uq-p1-scale">اختر مقياس الرسم المناسب</label>
            <select id="uq-p1-scale" data-field="scale" dir="ltr">
              <option value="20" ${r.scale === '20' ? 'selected' : ''}>1 cm ↔ 20 N</option>
              <option value="10" ${r.scale === '10' ? 'selected' : ''}>1 cm ↔ 10 N</option>
              <option value="40" ${r.scale === '40' ? 'selected' : ''}>1 cm ↔ 40 N</option>
            </select>
          </div>
          <div class="uq-field">
            <label for="uq-p1-angle">الوضع الهندسي للمتجهات من النقطة ${tex('O', 'O')}</label>
            <select id="uq-p1-angle" data-field="angle">
              <option value="" ${r.angle === '' ? 'selected' : ''}>— اختر طريقة الرسم —</option>
              <option value="90" ${r.angle === '90' ? 'selected' : ''}>قوتان متعامدتان (90°) والمحصلة قطر المستطيل</option>
              <option value="same-line" ${r.angle === 'same-line' ? 'selected' : ''}>قوتان على حامل واحد وبجهة واحدة</option>
              <option value="opposite-line" ${r.angle === 'opposite-line' ? 'selected' : ''}>قوتان على حامل واحد وبجهتين متعاكستين</option>
            </select>
          </div>
        </div>
        <div class="uq-triple-inputs">
          <div class="uq-field">
            <label for="uq-p1-l1">طول سهم ${V_F1} (${qty(80, 'N')})</label>
            <div class="uq-input-with-unit">
              <input id="uq-p1-l1" type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-field="l1" value="${escapeHtml(r.l1)}" placeholder="الطول" />
              <span class="uq-unit-pill" dir="ltr">${tex('\\mathrm{cm}', 'cm')}</span>
            </div>
          </div>
          <div class="uq-field">
            <label for="uq-p1-l2">طول سهم ${V_F2}</label>
            <div class="uq-input-with-unit">
              <input id="uq-p1-l2" type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-field="l2" value="${escapeHtml(r.l2)}" placeholder="الطول" />
              <span class="uq-unit-pill" dir="ltr">${tex('\\mathrm{cm}', 'cm')}</span>
            </div>
          </div>
          <div class="uq-field">
            <label for="uq-p1-lr">طول سهم المحصلة ${V_F} (${qty(100, 'N')})</label>
            <div class="uq-input-with-unit">
              <input id="uq-p1-lr" type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-field="lr" value="${escapeHtml(r.lr)}" placeholder="الطول" />
              <span class="uq-unit-pill" dir="ltr">${tex('\\mathrm{cm}', 'cm')}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (item.id === '3.1.3') {
    const r = branchState.response || defaultResponseFor('3.1.3');
    workspaceHtml = `
      <div class="uq-answer-zone">
        <div class="uq-select-grid">
          <div class="uq-field">
            <label for="uq-p1-fprime-mag">شدة القوة المعاكسة مباشرة ${S_F_PRIME}</label>
            <div class="uq-input-with-unit">
              <input id="uq-p1-fprime-mag" type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-field="fPrimeMag" value="${escapeHtml(r.fPrimeMag)}" placeholder="الشدة" />
              <span class="uq-unit-pill" dir="ltr">${tex('\\mathrm{N}', 'N')}</span>
            </div>
          </div>
          <div class="uq-field">
            <label for="uq-p1-fprime-dir">تمثيل سهم ${V_F_PRIME} على الرسم أعلاه</label>
            <select id="uq-p1-fprime-dir" data-field="fPrimeDir">
              <option value="" ${r.fPrimeDir === '' ? 'selected' : ''}>— اختر تمثيل المتجه على الرسم —</option>
              <option value="opposite-collinear" ${r.fPrimeDir === 'opposite-collinear' ? 'selected' : ''}>على حامل المحصلة F نفسه من O وبجهة معاكسة وطول مساوٍ</option>
              <option value="same-collinear" ${r.fPrimeDir === 'same-collinear' ? 'selected' : ''}>على حامل المحصلة F نفسه وبنفس جهتها</option>
              <option value="perpendicular" ${r.fPrimeDir === 'perpendicular' ? 'selected' : ''}>عمودية على حامل المحصلة F بزاوية 90°</option>
              <option value="opposite-f1" ${r.fPrimeDir === 'opposite-f1' ? 'selected' : ''}>على حامل القوة الأولى F₁ وبجهة معاكسة لها</option>
            </select>
          </div>
        </div>
      </div>
    `;
  } else if (item.id === '3.2.1') {
    const r = branchState.response || defaultResponseFor('3.2.1');
    workspaceHtml = `
      <div class="uq-answer-zone">
        <div class="uq-select-grid">
          <div class="uq-field">
            <label for="uq-p2-larger">أيهما القوة الأكبر شدةً؟</label>
            <select id="uq-p2-larger" data-field="largerForce">
              <option value="" ${r.largerForce === '' ? 'selected' : ''}>— اختر القوة الأكبر —</option>
              <option value="F1" ${r.largerForce === 'F1' ? 'selected' : ''}>القوة الأولى F₁</option>
              <option value="F2" ${r.largerForce === 'F2' ? 'selected' : ''}>القوة الثانية F₂</option>
              <option value="equal" ${r.largerForce === 'equal' ? 'selected' : ''}>القوتان متساويتان بالشدة</option>
            </select>
          </div>
          <div class="uq-field">
            <label for="uq-p2-reason">ولماذا؟ (التعليل الفيزيائي)</label>
            <select id="uq-p2-reason" data-field="reason">
              <option value="" ${r.reason === '' ? 'selected' : ''}>— اختر التعليل العلمي الدقيق —</option>
              <option value="outside-near-f2" ${r.reason === 'outside-near-f2' ? 'selected' : ''}>لأن المحصلة خارج الساق من جهة الكبرى، وبما أن 30 cm أصغر من 1 m فهي خارج الساق جهة F₂ فيكون d₂ &lt; d₁</option>
              <option value="inside-rod" ${r.reason === 'inside-rod' ? 'selected' : ''}>لأن حامل المحصلة يقع داخل الساق بين القوتين على بعد 30 cm من F₂ و 70 cm من F₁</option>
              <option value="smaller-closer" ${r.reason === 'smaller-closer' ? 'selected' : ''}>لأن القوة الأقرب إلى حامل المحصلة تكون دائماً الأصغر شدةً</option>
              <option value="sum-150" ${r.reason === 'sum-150' ? 'selected' : ''}>لأن شدة المحصلة 150 N تساوي مجموع شدتي القوتين</option>
            </select>
          </div>
        </div>
      </div>
    `;
  } else if (item.id === '3.2.2') {
    const r = branchState.response || defaultResponseFor('3.2.2');
    workspaceHtml = `
      <div class="uq-answer-zone">
        <div class="uq-numeric-row">
          <label for="uq-input-3-2-2">بُعد حامل القوة الأولى عن حامل المحصلة ${S_D1}:</label>
          <div class="uq-input-with-unit uq-input-unit-select">
            <input id="uq-input-3-2-2" type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-field="d1Value" value="${escapeHtml(r.d1Value)}" placeholder="أدخل البُعد" />
            <label class="uq-sr-only" for="uq-unit-3-2-2">وحدة البعد</label>
            <select id="uq-unit-3-2-2" data-field="d1Unit" dir="ltr">
              <option value="cm" ${r.d1Unit !== 'm' ? 'selected' : ''}>cm</option>
              <option value="m" ${r.d1Unit === 'm' ? 'selected' : ''}>m</option>
            </select>
          </div>
        </div>
      </div>
    `;
  } else if (item.id === '3.2.3') {
    const r = branchState.response || defaultResponseFor('3.2.3');
    workspaceHtml = `
      <div class="uq-answer-zone">
        <div class="uq-select-grid">
          <div class="uq-field">
            <label for="uq-input-f1">شدة القوة الأولى ${S_F1}</label>
            <div class="uq-input-with-unit">
              <input id="uq-input-f1" type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-field="f1Value" value="${escapeHtml(r.f1Value)}" placeholder="قيمة F₁" />
              <span class="uq-unit-pill" dir="ltr">${tex('\\mathrm{N}', 'N')}</span>
            </div>
          </div>
          <div class="uq-field">
            <label for="uq-input-f2">شدة القوة الثانية ${S_F2}</label>
            <div class="uq-input-with-unit">
              <input id="uq-input-f2" type="text" inputmode="decimal" dir="ltr" autocomplete="off" data-field="f2Value" value="${escapeHtml(r.f2Value)}" placeholder="قيمة F₂" />
              <span class="uq-unit-pill" dir="ltr">${tex('\\mathrm{N}', 'N')}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <article class="uq-subpart-card status-${status}" id="subpart-${item.id.replace(/\./g, '-')}" data-source-subpart="${item.id}" data-subpart-status="${status}" data-source-page="p${item.page}">
      <header class="uq-subpart-header">
        <div class="uq-subpart-meta">
          <span class="uq-subpart-num" dir="ltr">${item.numberLabel}</span>
          <span class="uq-subpart-kind">${item.badgeLabel}</span>
          <span class="uq-subpart-page" dir="ltr">p${item.page}</span>
        </div>
        <span class="uq-status-pill status-${status}" data-status-pill="${item.id}">${statusLabelFor(status)}</span>
      </header>
      <div class="uq-book-prompt unit-book-question">
        <p>${item.promptHtml}</p>
      </div>
      ${workspaceHtml}
      ${renderActionBar(item, branchState, status)}
    </article>
  `;
}

const pageMarker = (page) => `<p class="unit-source-marker" role="note"><span>من الكتاب</span><bdi dir="ltr">p${page}</bdi></p>`;

export function renderUnitQuestions(customState = null) {
  const state = customState ?? createInitialUnitQuestionsState();
  const q1Summary = computeQuestionGroupSummary(state, 'q1');
  const q2Summary = computeQuestionGroupSummary(state, 'q2');
  const q3Summary = computeQuestionGroupSummary(state, 'q3');
  const p1Summary = computeQuestionGroupSummary(state, 'p1');
  const p2Summary = computeQuestionGroupSummary(state, 'p2');

  const q1Items = UNIT_QUESTIONS_SUBPARTS.filter((item) => item.questionId === 'q1');
  const q2Item = SUBPART_BY_ID['2.1'];

  return `
    <section class="unit-question-section" id="question-one" aria-labelledby="question-one-heading" data-question-order="1" data-source-question="1" data-source-page="p71">
      <div class="unit-question-section-heading">
        <div>
          <p class="unit-question-index" dir="ltr">01</p>
          <div>
            <h2 id="question-one-heading">السؤال الأوّل</h2>
            <p class="uq-section-subtitle">اخترْ الإجابة الصّحيحة لكلّ ممّا يأتي:</p>
          </div>
        </div>
        <div class="uq-section-badges">
          <span class="uq-group-status status-${q1Summary.status}" data-group-badge="q1">${q1Summary.badgeText}</span>
          <span class="unit-page-range" dir="ltr">p71</span>
        </div>
      </div>
      <div class="unit-book-source">
        ${pageMarker(71)}
        <div class="uq-subparts-stack">
          ${q1Items.map((item) => renderSubpartCard(item, state)).join('')}
        </div>
      </div>
    </section>

    <section class="unit-question-section" id="question-two" aria-labelledby="question-two-heading" data-question-order="2" data-source-question="2" data-source-page="p71">
      <div class="unit-question-section-heading">
        <div>
          <p class="unit-question-index" dir="ltr">02</p>
          <div>
            <h2 id="question-two-heading">السؤال الثاني</h2>
            <p class="uq-section-subtitle">تحديد عناصر المحصلة الأربعة كتابةً وتمثيلها بالرسم التخطيطي</p>
          </div>
        </div>
        <div class="uq-section-badges">
          <span class="uq-group-status status-${q2Summary.status}" data-group-badge="q2">${q2Summary.badgeText}</span>
          <span class="unit-page-range" dir="ltr">p71</span>
        </div>
      </div>
      <div class="unit-book-source">
        ${pageMarker(71)}
        ${renderSubpartCard(q2Item, state)}
      </div>
    </section>

    <section class="unit-question-section" id="question-three" aria-labelledby="question-three-heading" data-question-order="3" data-source-question="3">
      <div class="unit-question-section-heading">
        <div>
          <p class="unit-question-index" dir="ltr">03</p>
          <div>
            <h2 id="question-three-heading">السؤال الثالث</h2>
            <p class="uq-section-subtitle">حلّ المسألتين الآتيتين:</p>
          </div>
        </div>
        <div class="uq-section-badges">
          <span class="uq-group-status status-${q3Summary.status}" data-group-badge="q3">${q3Summary.badgeText}</span>
          <span class="unit-page-range" dir="ltr">p71–p72</span>
        </div>
      </div>

      <div class="unit-book-source">
        <div class="uq-problem-block" id="problem-one" data-source-problem="1">
          <div class="uq-problem-header">
            <div>
              ${pageMarker(71)}
              <h3>المسألة الأولى:</h3>
            </div>
            <span class="uq-group-status status-${p1Summary.status}" data-group-badge="p1">${p1Summary.badgeText}</span>
          </div>
          <div class="uq-problem-stem unit-book-question" data-source-page="p71">
            <p>تؤثِّر في جسم قوّتان متعامدتان ${V_F1} ، ${V_F2} ، شدّة القوة الأولى ${qty(80, 'N')} وشدّة المحصّلة ${qty(100, 'N')} والمطلوب:</p>
            <div class="uq-givens-strip" aria-label="معطيات المسألة الأولى">
              <span>المعطيات:</span>
              <span class="uq-given-pill">${V_F1} ⊥ ${V_F2}</span>
              <span class="uq-given-pill">${force('F_{1}', 80)}</span>
              <span class="uq-given-pill">${force('F', 100)}</span>
            </div>
          </div>

          <div class="uq-subparts-stack">
            ${renderSubpartCard(SUBPART_BY_ID['3.1.1'], state)}
          </div>

          <div class="unit-page-continuation" aria-label="متابعة المسألة الأولى في الصفحة 72" data-source-page="p72">
            ${pageMarker(72)}
            <div data-diagram-slot="p1">${renderProblemOneDiagram(state)}</div>
            <div class="uq-subparts-stack">
              ${renderSubpartCard(SUBPART_BY_ID['3.1.2'], state)}
              ${renderSubpartCard(SUBPART_BY_ID['3.1.3'], state)}
            </div>
          </div>
        </div>

        <div class="uq-problem-block uq-problem-two-block" id="problem-two" data-source-problem="2" data-source-page="p72">
          <div class="uq-problem-header">
            <div>
              ${pageMarker(72)}
              <h3>المسألة الثانية:</h3>
            </div>
            <span class="uq-group-status status-${p2Summary.status}" data-group-badge="p2">${p2Summary.badgeText}</span>
          </div>
          <div class="uq-problem-stem unit-book-question">
            <p>${V_F1} ، ${V_F2} قوّتان شاقوليتان وبجهتين متعاكستين شدّة محصّلتِهما ${tex('\\vec{F}=150~\\mathrm{N}', 'vector F equals 150 newtons')} تؤثِّران في طرفي ساق معدنيّة خفيفة طولها ${qty(1, 'm')} عموديّاً عليها، فإذا علمْتَ أنَّ بُعْد حامل القوّة الثّانية عن حامل المحصّلة ${qty(30, 'cm')} ، المطلوب:</p>
            <div class="uq-givens-strip" aria-label="معطيات المسألة الثانية">
              <span>المعطيات:</span>
              <span class="uq-given-pill">شاقوليتان متعاكستان</span>
              <span class="uq-given-pill">${force('F', 150)}</span>
              <span class="uq-given-pill">${tex('d=1~\\mathrm{m}', 'd equals 1 m')}</span>
              <span class="uq-given-pill">${distance('d_{2}', 30)}</span>
            </div>
          </div>

          <div data-diagram-slot="p2">${renderProblemTwoDiagram(state)}</div>

          <div class="uq-subparts-stack">
            ${renderSubpartCard(SUBPART_BY_ID['3.2.1'], state)}
            ${renderSubpartCard(SUBPART_BY_ID['3.2.2'], state)}
            ${renderSubpartCard(SUBPART_BY_ID['3.2.3'], state)}
          </div>
        </div>
      </div>
    </section>
  `;
}
