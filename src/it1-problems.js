/* ============================================================================
   Independent Test 1 — «القوى المتلاقية والقوى المتوازية» (14 مسألة).
   ----------------------------------------------------------------------------
   SOURCE: three photographed pages of a graded problems worksheet for Grade 8
   (5 parallel-force problems on page 1, 5 concurrent-force problems on page 2,
   4 more concurrent-force problems on page 3). Every datum below is transcribed
   from those photographs; the values the earlier audit corrected are marked
   with  FIXED-6 / FIXED-7 / FIXED-9  in the problem comments.

   PUBLIC/PRIVATE SPLIT (the security boundary of this test):
     - THIS module holds only what a student may see before submitting:
       problem statements, givens, requested items, multiple-choice options,
       and the "givens only" figure id. It holds NO answer key, NO worked
       solution, and NO solved figure.
     - `it1-solutions.js` holds ANSWER_KEY, SOLUTIONS and the solved figures,
       and is loaded with a dynamic `import()` only after submission.

   NOTATION RULE: the magnitude of the resultant is always written `F`
   (never `R`), in prompts, figures, solutions, and feedback.
   ========================================================================== */

import { ltrText, scalar, tex } from './math.js';

/* --- fixed symbol vocabulary for this test -------------------------------- */
const S_F = scalar('F');
const S_F1 = scalar('F', '1');
const S_F2 = scalar('F', '2');
const S_D1 = scalar('d', '1');
const S_D2 = scalar('d', '2');
const S_D = scalar('d');
const S_ALPHA = tex('\\alpha', 'alpha');
const S_AB = tex('AB', 'segment A B');

/* Values inside statements are plain isolated LTR tokens: they read as one
   unbreakable unit on screen and stay searchable/assertable in tests. TeX is
   reserved for symbols and relations. */
const N = (value) => ltrText(`${value} N`);
const M = (value) => ltrText(`${value} m`);
const DEG = (value) => tex(`${value}^{\\circ}`, `${value}°`);

const ltr = (value) => ltrText(value);

const tfOptions = Object.freeze([
  { id: 'true', content: 'صح' },
  { id: 'false', content: 'خطأ' },
]);

const choice = (id, content) => Object.freeze({ id, content });
const fig = (id) => `<figure class="it1-figure" data-figure="${id}"></figure>`;

/* A problem is a frozen record: every "ask" below becomes exactly one graded
   field (one question) inside the assessment runtime. */
const problem = (config) => Object.freeze({
  lessonId: 'independent-test-1',
  unit: 'اختبار مستقل · أوراق مسائل',
  ...config,
  asks: Object.freeze(config.asks.map((ask) => Object.freeze(ask))),
});

/* ==========================================================================
   PAGE 1 — القوى المتوازية (مسائل 1–5)
   ========================================================================== */

const P1 = problem({
  id: 'it1p01', number: 1, page: 1, difficulty: 'basic', topic: 'متوازية · جهة واحدة',
  title: 'ساق أفقية مهملة الوزن — جهة واحدة',
  figure: 'p01',
  intro: `ساق أفقية مهملة الوزن طولها ${S_AB} = ${M(2)}، تؤثر في طرفيها ${tex('A', 'point A')} و${tex('B', 'point B')} قوتان متوازيتان وفي جهة واحدة شدتاهما ${S_F1} = ${N(15)} و${S_F2} = ${N(45)}.`,
  asks: [
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F}.`,
      inputHint: `اكتب الشدة بالنيوتن كعدد فقط، مثل ${ltr('60')}.`,
    },
    {
      id: 'd1', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `احسب بعد نقطة تأثير المحصلة عن نقطة تأثير القوة الأولى ${S_D1}.`,
      inputHint: `اكتب المسافة بالمتر كعدد فقط، مثل ${ltr('1.5')}.`,
    },
    {
      id: 'd2', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `احسب بعد نقطة تأثير المحصلة عن نقطة تأثير القوة الثانية ${S_D2}.`,
      inputHint: `اكتب المسافة بالمتر كعدد فقط، مثل ${ltr('0.5')}.`,
    },
  ],
});

const P2 = problem({
  id: 'it1p02', number: 2, page: 1, difficulty: 'basic', topic: 'متوازية · جهة واحدة · عناصر المحصلة',
  title: 'عارضة أفقية — ذكر عناصر المحصلة',
  figure: 'p02',
  intro: `عارضة أفقية مهملة الوزن طولها ${S_AB} = ${M(0.8)}، تؤثر عند طرفيها ${tex('A', 'point A')} و${tex('B', 'point B')} قوتان متوازيتان وفي جهة واحدة شدتاهما ${S_F1} = ${N(60)} و${S_F2} = ${N(20)}.`,
  asks: [
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F}.`,
      inputHint: 'اكتب الشدة بالنيوتن كعدد فقط.',
    },
    {
      id: 'elements', kind: 'choice', points: 1,
      label: `اذكر عناصر المحصلة ${S_F} (نقطة التأثير، الحامل، الجهة، الشدة) وصفاً كاملاً.`,
      inputHint: 'اختر الوصف الذي يجمع العناصر الأربعة كلها بشكل صحيح.',
      options: [
        choice('full', 'نقطة التأثير بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر، والحامل موازٍ لحاملي القوتين، والجهة جهة القوتين نفسها، والشدة تساوي مجموع الشدتين.'),
        choice('closer-small', 'نقطة التأثير بين القوتين وأقرب إلى القوة الأصغر، والجهة جهة القوتين.'),
        choice('outside', 'نقطة التأثير خارج القطعة من جهة القوة الأكبر، والحامل موازٍ للقوتين.'),
        choice('perpendicular', 'الحامل عمودي على القوتين، والشدة تساوي الفرق بين الشدتين.'),
      ],
    },
    {
      id: 'd1', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `احسب بعد نقطة تأثير المحصلة عن نقطة تأثير القوة الأولى ${S_D1}.`,
      inputHint: 'اكتب المسافة بالمتر كعدد فقط.',
    },
    {
      id: 'd2', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `احسب بعد نقطة تأثير المحصلة عن نقطة تأثير القوة الثانية ${S_D2}.`,
      inputHint: 'اكتب المسافة بالمتر كعدد فقط.',
    },
  ],
});

const P3 = problem({
  id: 'it1p03', number: 3, page: 1, difficulty: 'medium', topic: 'متوازية · جهة واحدة · طول العارضة',
  title: 'عارضة خشبية — استنتاج الطول الكلي',
  figure: 'p03',
  intro: `تؤثر قوتان متوازيتان وفي جهة واحدة شدتاهما ${S_F1} = ${N(100)} و${S_F2} = ${N(300)} في نهايتي عارضة خشبية. إذا علمت أن نقطة تأثير المحصلة تبعد عن القوة الأولى مسافة ${S_D1} = ${M(0.75)}.`,
  asks: [
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F}.`,
      inputHint: 'اكتب الشدة بالنيوتن كعدد فقط.',
    },
    {
      id: 'd2', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `احسب بعد نقطة تأثير المحصلة عن القوة الثانية ${S_D2} باستعمال القانون ${tex('\\dfrac{d_{1}}{d_{2}}=\\dfrac{F_{2}}{F_{1}}', 'd one over d two equals F two over F one')}.`,
      inputHint: 'اكتب المسافة بالمتر كعدد فقط.',
    },
    {
      id: 'total', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `استنتج الطول الكلي للعارضة ${S_D}.`,
      inputHint: 'طول العارضة يساوي مجموع البعدين عن نقطتي تأثير القوتين.',
    },
  ],
});

const P4 = problem({
  id: 'it1p04', number: 4, page: 1, difficulty: 'medium', topic: 'متوازية · جهتان متعاكستان',
  title: 'ساق معدنية — جهتان متعاكستان',
  figure: 'p04',
  intro: `ساق معدنية مهملة الوزن طولها ${S_AB} = ${M(0.6)}، تؤثر في طرفيها ${tex('A', 'point A')} و${tex('B', 'point B')} قوتان متوازيتان وفي جهتين متعاكستين شدتاهما ${S_F1} = ${N(30)} و${S_F2} = ${N(90)}.`,
  asks: [
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F}.`,
      inputHint: 'اكتب الشدة بالنيوتن كعدد فقط.',
    },
    {
      id: 'd1', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `حدد بعد نقطة تأثير المحصلة عن نقطة تأثير القوة الأولى ${S_D1} باحتساب البعد.`,
      inputHint: 'اكتب المسافة بالمتر كعدد فقط.',
    },
    {
      id: 'd2', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `حدد بعد نقطة تأثير المحصلة عن نقطة تأثير القوة الثانية ${S_D2} باحتساب البعد.`,
      inputHint: 'اكتب المسافة بالمتر كعدد فقط.',
    },
  ],
});

const P5 = problem({
  id: 'it1p05', number: 5, page: 1, difficulty: 'advanced', topic: 'متوازية · جهتان متعاكستان · مجهولان',
  title: 'عارضة — القوة الكبرى والطول الكلي',
  figure: 'p05',
  intro: `عارضة مهملة الوزن تؤثر فيها قوتان متوازيتان وفي جهتين متعاكستين ${S_F1} و${S_F2} حيث ${tex('F_{1}<F_{2}', 'F one less than F two')}. إذا علمت أن شدة المحصلة ${S_F} = ${N(120)} وشدة القوة الصغرى ${S_F1} = ${N(40)}، وأن نقطة تأثير المحصلة تبعد عن القوة الكبرى مسافة ${S_D2} = ${M(0.2)}.`,
  asks: [
    {
      id: 'f2', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة القوة الكبرى ${S_F2}.`,
      inputHint: 'اكتب الشدة بالنيوتن كعدد فقط.',
    },
    {
      id: 'elements', kind: 'choice', points: 1,
      label: `اذكر عناصر المحصلة ${S_F}.`,
      inputHint: 'اختر الوصف الكامل لعناصر المحصلة.',
      options: [
        choice('outside-larger', 'جهتها جهة القوة الكبرى، وحاملها على امتداد حاملي القوتين، وتقع خارج القطعة الواصلة بين نقطتي التأثير من جهة القوة الكبرى.'),
        choice('between', 'تقع بين نقطتي تأثير القوتين وأقرب إلى القوة الصغرى.'),
        choice('outside-smaller', 'تقع خارج القطعة من جهة القوة الصغرى.'),
        choice('midpoint', 'تقع في منتصف المسافة بين القوتين دائماً.'),
      ],
    },
    {
      id: 'd1', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `احسب بعد نقطة تأثير المحصلة عن القوة الصغرى ${S_D1}.`,
      inputHint: 'اكتب المسافة بالمتر كعدد فقط.',
    },
    {
      id: 'total', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `احسب الطول الكلي للعارضة ${S_D}.`,
      inputHint: `المسافة بين القوتين تساوي ${ltr('d₁ − d₂')} في هذه الحالة.`,
    },
  ],
});

/* ==========================================================================
   PAGE 2 — القوى المتلاقية (مسائل 6–10)
   ========================================================================== */

const P6 = problem({
  id: 'it1p06', number: 6, page: 2, difficulty: 'advanced', topic: 'متوازية · جهتان متعاكستان · المجهول المسافات',
  title: 'قوتان متعاكستان على ساق أفقية',
  figure: 'p06',
  /* FIXED-6: the audit values d₁ = 2 m (the earlier build said 0.2 m). */
  intro: `تؤثر قوتان متوازيتان وفي جهتين متعاكستين شدتاهما ${S_F1} = ${N(50)} و${S_F2} = ${N(200)} في نقطتين من ساق أفقية. إذا كانت شدة المحصلة ${S_F} = ${N(150)}، ونقطة تأثيرها تبعد عن القوة الصغرى مسافة ${S_D1} = ${M(2)}.`,
  asks: [
    {
      id: 'elements', kind: 'choice', points: 1,
      label: `اكتب عناصر المحصلة ${S_F}.`,
      inputHint: 'اختر الوصف الكامل لعناصر المحصلة.',
      options: [
        choice('full', `الشدة ${ltr('150 N')}، والجهة جهة القوة الكبرى ${S_F2}، والحامل موازٍ لحاملي القوتين، ونقطة التأثير خارج القطعة من جهة القوة الكبرى ${S_F2}.`),
        choice('smaller-sense', `الشدة ${ltr('150 N')}، والجهة جهة القوة الصغرى ${S_F1}، ونقطة التأثير بين القوتين.`),
        choice('sum', `الشدة تساوي ${ltr('250 N')} أي مجموع الشدتين.`),
        choice('between', 'نقطة التأثير بين نقطتي تأثير القوتين وأقرب إلى القوة الكبرى.'),
      ],
    },
    {
      id: 'd2', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `احسب بعد نقطة تأثير المحصلة عن القوة الكبرى ${S_D2}.`,
      inputHint: 'اكتب المسافة بالمتر كعدد فقط.',
    },
    {
      id: 'total', kind: 'numeric', numericUnit: 'm', points: 1,
      label: `استنتج البعد ${S_D} بين نقطتي تأثير القوتين.`,
      inputHint: `انتبه: المحصلة خارج القطعة، لذا ${ltr('d = d₁ − d₂')}.`,
    },
  ],
});

const P7 = problem({
  id: 'it1p07', number: 7, page: 2, difficulty: 'basic', topic: 'متلاقية · متعامدتان',
  title: 'قوتان متعامدتان عند نقطة واحدة',
  figure: 'p07',
  /* FIXED-7: the audit values F₂ = 4 N (the earlier build said 7 N). */
  intro: `تؤثر قوتان متلاقيتان ومتعامدتان في نقطة واحدة ${tex('O', 'point O')} شدتاهما ${S_F1} = ${N(3)} و${S_F2} = ${N(4)}.`,
  asks: [
    {
      id: 'elements', kind: 'choice', points: 1,
      label: `اذكر عناصر المحصلة ${S_F}.`,
      inputHint: 'اختر الوصف الصحيح لعناصر المحصلة.',
      options: [
        choice('diagonal', `نقطة تأثيرها ${tex('O', 'point O')} نفسها، وحاملها القطر الخارج من ${tex('O', 'point O')} في متوازي الأضلاع داخل الزاوية القائمة، وجهتها من ${tex('O', 'point O')} نحو الرأس المقابل.`),
        choice('bisector', 'حاملها ينصف الزاوية القائمة دائماً لأن القوتين متعامدتان.'),
        choice('sum', `شدتها ${ltr('7 N')} لأننا نجمع الشدتين.`),
        choice('carrier-f1', `حاملها منطبق على حامل ${S_F1}.`),
      ],
    },
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F} باستعمال العلاقة ${tex('F=\\sqrt{F_{1}^{2}+F_{2}^{2}}', 'F equals square root of F one squared plus F two squared')}.`,
      inputHint: 'اكتب الشدة بالنيوتن كعدد فقط.',
    },
    {
      id: 'alpha', kind: 'numeric', numericUnit: null, points: 1,
      label: `احسب زاوية ميل المحصلة عن حامل القوة الأولى ${S_ALPHA} بالدرجات.`,
      inputHint: 'استعمل tan α = F₂ ÷ F₁، واكتب الزاوية بالدرجات كعدد فقط (مثل 53.1).',
    },
  ],
});

const P8 = problem({
  id: 'it1p08', number: 8, page: 2, difficulty: 'medium', topic: 'متلاقية · متعامدتان · فيثاغورس',
  title: 'فيثاغورس وظل الزاوية',
  figure: 'p08',
  intro: `تؤثر قوتان متلاقيتان ومتعامدتان في نقطة واحدة ${tex('O', 'point O')} شدتاهما ${S_F1} = ${N(16)} و${S_F2} = ${N(12)}.`,
  asks: [
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F} بالتعويض في مبرهنة فيثاغورس ${tex('F=\\sqrt{F_{1}^{2}+F_{2}^{2}}', 'F equals square root of F one squared plus F two squared')}.`,
      inputHint: 'اكتب الشدة بالنيوتن كعدد فقط.',
    },
    {
      id: 'tan', kind: 'numeric', numericUnit: null, points: 1,
      label: `احسب ظل زاوية ميل المحصلة عن حامل القوة الأولى ${tex('\\tan\\alpha=\\dfrac{F_{2}}{F_{1}}', 'tangent alpha equals F two over F one')}.`,
      inputHint: 'اكتب قيمة الظل كعدد عشري فقط (بلا وحدة).',
    },
  ],
});

const P9 = problem({
  id: 'it1p09', number: 9, page: 2, difficulty: 'medium', topic: 'متلاقية · متعامدتان متساويتان',
  title: 'قوتان متساويتان ومتعامدتان',
  figure: 'p09',
  /* FIXED-9: the audit values F₁ = F₂ = 6 N (the earlier build said 12 N). */
  intro: `تؤثر قوتان متلاقيتان ومتعامدتان في نقطة واحدة ${tex('O', 'point O')} ومتساويتان بالشدة ${N(6)}.`,
  asks: [
    {
      id: 'elements', kind: 'choice', points: 1,
      label: `اكتب عناصر المحصلة ${S_F}.`,
      inputHint: 'القوتان متساويتان، فانتبه إلى وصف الحامل والاتجاه.',
      options: [
        choice('bisector', `حاملها ينصف الزاوية بين حاملي القوتين وتقع داخل الزاوية القائمة عند ${tex('O', 'point O')}، لأن الشدتين متساويتان.`),
        choice('larger', 'حاملها أقرب إلى إحدى القوتين لأن القوتين مختلفتان في الشدة.'),
        choice('carrier-f1', `حاملها منطبق على حامل ${S_F1}.`),
        choice('opposite', 'محصلتها صفر لأن القوتين متساويتان.'),
      ],
    },
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F} باستعمال ${tex('F=\\sqrt{6^{2}+6^{2}}', 'F equals square root of 6 squared plus 6 squared')}.`,
      inputHint: 'اكتب الشدة بالنيوتن مقرّبة إلى منزلتين عشريتين.',
    },
    {
      id: 'alpha', kind: 'numeric', numericUnit: null, points: 1,
      label: `حدد زاوية ميل المحصلة عن حامل كل من القوتين بالدرجات.`,
      inputHint: 'اكتب الزاوية بالدرجات كعدد فقط.',
    },
  ],
});

const P10 = problem({
  id: 'it1p10', number: 10, page: 2, difficulty: 'basic', topic: 'متلاقية · متعامدتان متساويتان · الشكل الهندسي',
  title: 'متوازي الأضلاع ومربع القوتين',
  figure: 'p10',
  intro: `تؤثر قوتان متلاقيتان ومتعامدتان ومتساويتان بالشدة ${S_F1} = ${S_F2} = ${N(20)} في جسم صلب عند النقطة ${tex('O', 'point O')}.`,
  asks: [
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F}.`,
      inputHint: 'اكتب الشدة بالنيوتن مقرّبة إلى منزلتين عشريتين.',
    },
    {
      id: 'shape', kind: 'choice', points: 1,
      label: 'اذكر خواص المحصلة الناتجة من الشكل التخطيطي بطريقة متوازي الأضلاع.',
      inputHint: 'اختر الوصف الهندسي الصحيح للشكل ولقطره.',
      options: [
        choice('square-diagonal', 'الشكل مربع لأن القوتين متساويتان ومتعامدتان، والمحصلة قطره الخارج من O، وحاملها منصف الزاوية القائمة.'),
        choice('rectangle-diagonal', 'الشكل مستطيل ليس مربعاً لأن القوتين متساويتان، والمحصلة قطره.'),
        choice('rhombus-outside', 'الشكل معيّن، والمحصلة تقع خارج الزاوية بين القوتين.'),
        choice('sum', `الشكل مثلث، وشدتها ${ltr('40 N')} مجموع الشدتين.`),
      ],
    },
  ],
});

/* ==========================================================================
   PAGE 3 — القوى المتلاقية (مسائل 11–14)
   ========================================================================== */

const P11 = problem({
  id: 'it1p11', number: 11, page: 3, difficulty: 'advanced', topic: 'متلاقية · زاوية 45°',
  title: 'إنشاء المحصلة بطريقة متوازي الأضلاع',
  figure: 'p11',
  intro: `تؤثر قوتان متلاقيتان في نقطة ${tex('O', 'point O')} بينهما زاوية حادة ${tex('\\theta=45^{\\circ}', 'theta equals 45 degrees')} شدتاهما ${S_F1} = ${N(10)} و${S_F2} = ${N(15)}.`,
  asks: [
    {
      id: 'construction', kind: 'choice', points: 1,
      label: 'اشرح كيفية إنشاء المحصلة هندسياً بطريقة متوازي الأضلاع.',
      inputHint: 'اختر تسلسل الخطوات الصحيح.',
      options: [
        choice('complete', `نرسم الشعاعين ${S_F1} و${S_F2} من ${tex('O', 'point O')}، ثم نكمل متوازي الأضلاع برسم موازٍ لكل منهما من طرف الآخر، فالمحصلة هي القطر الخارج من ${tex('O', 'point O')} إلى الرأس المقابل.`),
        choice('triangle', 'نصل بين طرفي الشعاعين بقطعة مستقيمة، وهذه القطعة هي المحصلة نفسها.'),
        choice('bisector', 'نرسم منصف الزاوية بين الشعاعين، وهو المحصلة.'),
        choice('sum', 'نجمع الطولين جمعاً عددياً ونرسم قطعة بهذا الطول في أي اتجاه.'),
      ],
    },
    {
      id: 'elements', kind: 'choice', points: 1,
      label: `اذكر العناصر الكاملة للمحصلة ${S_F}.`,
      inputHint: 'اختر الوصف الذي يحدد النقطة والحامل والجهة والشدة.',
      options: [
        choice('full', `نقطة تأثيرها ${tex('O', 'point O')}، وحاملها القطر الخارج من ${tex('O', 'point O')} داخل الزاوية، وجهتها من ${tex('O', 'point O')} نحو الرأس المقابل، وشدتها تقاس بطول هذا القطر وفق مقياس الرسم.`),
        choice('outside', 'تقع خارج الزاوية بين القوتين في كل الحالات.'),
        choice('magnitude-sum', `شدتها ${ltr('25 N')} دائماً لأن الزاوية حادة.`),
        choice('parallel-f1', `حاملها يوازي حامل ${S_F1}.`),
      ],
    },
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F} باستعمال ${tex('F=\\sqrt{F_{1}^{2}+F_{2}^{2}+2F_{1}F_{2}\\cos\\theta}', 'F equals square root of F one squared plus F two squared plus 2 F one F two cosine theta')}.`,
      inputHint: 'اكتب الشدة بالنيوتن مقرّبة إلى منزلة عشرية واحدة.',
    },
  ],
});

const P12 = problem({
  id: 'it1p12', number: 12, page: 3, difficulty: 'medium', topic: 'متلاقية · أثر الزاوية',
  title: 'قوتان بينهما زاوية حادة',
  figure: 'p12',
  intro: `تؤثر قوتان متلاقيتان في نقطة ${tex('O', 'point O')} شدتاهما ${S_F1} = ${N(30)} و${S_F2} = ${N(50)}، وتحصّران بينهما زاوية حادة.`,
  asks: [
    {
      id: 'elements', kind: 'choice', points: 1,
      label: `اكتب عناصر المحصلة ${S_F}.`,
      inputHint: 'اختر الوصف الصحيح دون معرفة قيمة الزاوية.',
      options: [
        choice('inside', `نقطة تأثيرها ${tex('O', 'point O')}، وحاملها القطر الخارج من ${tex('O', 'point O')} داخل الزاوية بين الحاملين، وشدتها محصورة بين فرق الشدتين ومجموعهما.`),
        choice('outside', 'حاملها خارج الزاوية بين الحاملين دائماً.'),
        choice('sum', 'شدتها تساوي مجموع الشدتين في كل الأحوال.'),
        choice('difference', 'شدتها تساوي فرق الشدتين لأن الزاوية حادة.'),
      ],
    },
    {
      id: 'angle-effect', kind: 'choice', points: 1,
      label: `بيّن كيف تتغير شدة المحصلة ${S_F} عند زيادة أو نقصان الزاوية بين القوتين.`,
      inputHint: 'اختر العلاقة الصحيحة بين الزاوية والشدة.',
      options: [
        choice('inverse', 'عند زيادة الزاوية تقل شدة المحصلة، وعند نقصانها تزيد الشدة، وتصل إلى مجموع الشدتين عندما تنعدم الزاوية.'),
        choice('direct', 'عند زيادة الزاوية تزيد شدة المحصلة دائماً.'),
        choice('constant', 'شدة المحصلة لا تتغير بتغير الزاوية.'),
        choice('zero', 'تصبح شدة المحصلة صفراً عند أي زاوية حادة.'),
      ],
    },
  ],
});

const P13 = problem({
  id: 'it1p13', number: 13, page: 3, difficulty: 'medium', topic: 'متلاقية · متساويتان · زاوية 60°',
  title: 'مثلث متساوي الأضلاع',
  figure: 'p13',
  intro: `تؤثر قوتان متلاقيتان ومتساويتان بالشدة في نقطة ${tex('O', 'point O')} حيث ${S_F1} = ${S_F2} = ${N(50)}، والزاوية بينهما حادة وتساوي ${DEG(60)}.`,
  asks: [
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب شدة المحصلة ${S_F} بالاستفادة من خواص المثلث متساوي الأضلاع الناتج عن الإنشاء الهندسي.`,
      inputHint: 'اكتب الشدة بالنيوتن مقرّبة إلى منزلة عشرية واحدة.',
    },
    {
      id: 'elements', kind: 'choice', points: 1,
      label: `اكتب عناصر المحصلة ${S_F}.`,
      inputHint: 'القوتان متساويتان، فوصف «القوة الكبرى» غير وارد هنا.',
      options: [
        choice('bisector', `حاملها منصف الزاوية بين القوتين، وتصنع مع حامل كل قوة زاوية ${DEG(30)}، ونقطة تأثيرها ${tex('O', 'point O')}.`),
        choice('larger', 'حاملها أقرب إلى القوة الكبرى.'),
        choice('carrier-f2', `حاملها منطبق على حامل ${S_F2}.`),
        choice('zero', 'محصلتها صفر لأن الزاوية أقل من قائمة.'),
      ],
    },
  ],
});

const P14 = problem({
  id: 'it1p14', number: 14, page: 3, difficulty: 'advanced', topic: 'متلاقية · متساويتان · زاوية 60°',
  title: 'زاوية المحصلة مع كل من القوتين',
  figure: 'p14',
  intro: `قوتان متلاقيتان ومتساويتان بالشدة ${S_F1} = ${S_F2} = ${N(80)} تؤثران في نقطة واحدة، والزاوية بين حامليهما ${DEG(60)}.`,
  asks: [
    {
      id: 'elements', kind: 'choice', points: 1,
      label: `اذكر عناصر المحصلة ${S_F}.`,
      inputHint: 'اختر الوصف الكامل للعناصر.',
      options: [
        choice('bisector', `نقطة تأثيرها النقطة المشتركة، وحاملها منصف الزاوية بين الحاملين، وجهتها داخل الزاوية نحو الرأس المقابل.`),
        choice('larger', 'حاملها أقرب إلى إحدى القوتين لأن القوتين مختلفتان في الشدة.'),
        choice('outside', 'حاملها خارج الزاوية بين الحاملين.'),
        choice('sum', `شدتها ${ltr('160 N')} مجموع الشدتين.`),
      ],
    },
    {
      id: 'magnitude', kind: 'numeric', numericUnit: 'N', points: 1,
      label: `احسب قيمة شدة المحصلة ${S_F}.`,
      inputHint: 'اكتب الشدة بالنيوتن مقرّبة إلى منزلة عشرية واحدة.',
    },
    {
      id: 'alpha', kind: 'numeric', numericUnit: null, points: 1,
      label: `حدد زاوية ميل المحصلة بالنسبة إلى حامل كل من القوتين بالدرجات.`,
      inputHint: 'اكتب الزاوية بالدرجات كعدد فقط.',
    },
  ],
});

/* ==========================================================================
   The 14 problems, in worksheet order (page 1 → page 3).
   ========================================================================== */
export const IT1_PROBLEMS = Object.freeze([P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14]);

export const IT1_TEST = Object.freeze({
  id: 'test-01',
  number: 1,
  unit: 'اختبار مستقل · الوحدة الأولى: الحركة والقوى',
  lesson: 'اختبار 1 — القوى المتلاقية والقوى المتوازية',
  sourcePages: Object.freeze([1, 2, 3]),
  questionCount: IT1_PROBLEMS.reduce((total, item) => total + item.asks.length, 0),
  problems: IT1_PROBLEMS,
});

/* ==========================================================================
   Question derivation — one runtime question per requested item.
   The runtime only needs: id, type, prompt, options, numericUnit, inputHint,
   sourcePages, difficulty. Nothing here reveals an answer.
   ========================================================================== */
function promptFor(item, ask, askIndex) {
  const part = item.asks.length > 1
    ? `<span class="it1-part-label">المطلوب ${askIndex + 1} من ${item.asks.length}</span>`
    : '';
  return `<span class="it1-problem-lead">${item.intro}</span>${part}<span class="it1-ask">${ask.label}</span>`;
}

export const IT1_QUESTIONS = Object.freeze(IT1_PROBLEMS.flatMap((item) => item.asks.map((ask, askIndex) => Object.freeze({
  id: `${item.id}-${ask.id}`,
  problemId: item.id,
  askId: ask.id,
  lessonId: 'independent-test-1',
  difficulty: item.difficulty,
  type: ask.kind === 'numeric' ? 'numeric' : 'single-choice',
  numericUnit: ask.kind === 'numeric' ? ask.numericUnit : undefined,
  sourcePages: Object.freeze([item.page]),
  prompt: promptFor(item, ask, askIndex),
  inputHint: ask.inputHint,
  options: ask.options,
  diagram: item.figure,
  points: ask.points,
}))));

/* --- marks ----------------------------------------------------------------- */
export const IT1_MARKS = Object.freeze(IT1_PROBLEMS.map((item) => Object.freeze({
  problemId: item.id,
  number: item.number,
  marks: item.asks.reduce((total, ask) => total + ask.points, 0),
})));

export const IT1_TOTAL_MARKS = IT1_MARKS.reduce((total, row) => total + row.marks, 0);

/** Sanity helpers used by the tests and by the welcome screen. */
export function problemsByPage(page) {
  return IT1_PROBLEMS.filter((item) => item.page === page);
}

export function questionById(id) {
  return IT1_QUESTIONS.find((question) => question.id === id) ?? null;
}
