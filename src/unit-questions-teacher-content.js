import { calculation, formula, qty, solutionSteps, tex, vector } from './math.js';
import { renderUnitQuestionSourceDisclosure } from './unit-questions-content.js';

const V_F1 = vector('F', '1');
const V_F2 = vector('F', '2');
const V_F = vector('F');
const F1 = tex('F_{1}', 'F one');
const F2 = tex('F_{2}', 'F two');
const F = tex('F', 'F');
const answer = (html) => `<div class="teacher-book-answer"><span class="teacher-answer-chip">الحل الكامل</span><div class="teacher-answer-body">${html}</div></div>`;
const explanation = (html) => `<details class="teacher-explanation" open><summary>شرح المعلم خطوة بخطوة</summary><div class="teacher-explanation-body">${html}</div></details>`;
const heading = (title, pages, id) => `<div class="teacher-section-heading"><div><p class="teacher-section-kicker">حلول المعلم · الصفحات ${pages}</p><h3 id="${id}">${title}</h3></div><span class="teacher-page-ref" dir="ltr">p${pages}</span></div>`;
const eq = (source, label) => `<div class="teacher-formula">${formula(source, label)}</div>`;
const calc = (source, label) => `<div class="teacher-formula">${calculation(source, label)}</div>`;
const steps = (rows) => solutionSteps(rows.map(([kind, label, html]) => ({ kind, label, html })));

const oppositeForcesDiagram = `
  <figure class="unit-teacher-figure" data-platform-illustration="question-two-opposite-forces">
    <svg viewBox="0 0 660 285" role="img" aria-labelledby="opposite-force-title opposite-force-desc" focusable="false">
      <title id="opposite-force-title">تمثيل تعليمي للقوتين المتعاكستين ومحصّلتهما</title>
      <desc id="opposite-force-desc">قوتان متوازيتان متعاكستان تؤثران عند طرفي مسطرة. تظهر القوة الأكبر على اليمين، وتقع المحصلة خارج المسطرة من جهتها وبالاتجاه نفسه.</desc>
      <defs>
        <marker id="uq-q2-arrow-small" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#bb6a54" /></marker>
        <marker id="uq-q2-arrow-large" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#16706b" /></marker>
        <marker id="uq-q2-arrow-result" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#33568f" /></marker>
        <marker id="uq-q2-dimension" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#68738a" /></marker>
      </defs>
      <line x1="145" y1="142" x2="470" y2="142" class="uq-diagram-rod" />
      <line x1="145" y1="76" x2="145" y2="214" class="uq-diagram-carrier" />
      <line x1="470" y1="76" x2="470" y2="214" class="uq-diagram-carrier" />
      <line x1="145" y1="151" x2="145" y2="220" class="uq-diagram-force-small" marker-end="url(#uq-q2-arrow-small)" />
      <line x1="470" y1="132" x2="470" y2="50" class="uq-diagram-force-large" marker-end="url(#uq-q2-arrow-large)" />
      <line x1="560" y1="132" x2="560" y2="58" class="uq-diagram-resultant" marker-end="url(#uq-q2-arrow-result)" />
      <line x1="145" y1="244" x2="470" y2="244" class="uq-diagram-measure" marker-start="url(#uq-q2-dimension)" marker-end="url(#uq-q2-dimension)" />
      <line x1="470" y1="264" x2="560" y2="264" class="uq-diagram-measure" marker-start="url(#uq-q2-dimension)" marker-end="url(#uq-q2-dimension)" />
      <text x="307" y="237" text-anchor="middle" class="uq-diagram-caption">المسافة بين حاملي القوتين</text>
      <text x="515" y="258" text-anchor="middle" class="uq-diagram-caption">بعد إضافي</text>
      <text x="145" y="70" text-anchor="middle" class="uq-diagram-endpoint">طرف</text>
      <text x="470" y="70" text-anchor="middle" class="uq-diagram-endpoint">طرف</text>
    </svg>
    <div class="unit-diagram-legend" aria-label="مفتاح الرسم">
      <span><i class="legend-force-small" aria-hidden="true"></i> القوة الأصغر ${tex('F_{s}', 'F small')}</span>
      <span><i class="legend-force-large" aria-hidden="true"></i> القوة الأكبر ${tex('F_{L}', 'F large')}</span>
      <span><i class="legend-force-result" aria-hidden="true"></i> المحصلة ${V_F}</span>
    </div>
    <figcaption>رسم إرشادي من المنصة، لا رسم مطبوع من الكتاب، وغير مرسوم على مقياس. إذا كانت القوة الأكبر عند الطرف الآخر يُعكس اتجاه الرسم.</figcaption>
  </figure>`;

const perpendicularForcesDiagram = `
  <figure class="unit-teacher-figure" data-platform-illustration="problem-one-perpendicular-forces">
    <svg viewBox="0 0 740 315" role="img" aria-labelledby="perpendicular-title perpendicular-desc" focusable="false">
      <title id="perpendicular-title">مثلث محصلة قوتين متعامدتين ومقارنة المحصلة بالقوة المعاكسة</title>
      <desc id="perpendicular-desc">مثلث قائم بأطوال رسم 4 و3 و5 سنتيمترات، يقابله سهمان متساويان متعاكسان يمثلان المحصلة والقوة المعاكسة مباشرة لها.</desc>
      <defs>
        <marker id="uq-p1-arrow-f1" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#16706b" /></marker>
        <marker id="uq-p1-arrow-f2" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#bb6a54" /></marker>
        <marker id="uq-p1-arrow-result" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#33568f" /></marker>
        <marker id="uq-p1-arrow-opposite" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#8a6420" /></marker>
      </defs>
      <line x1="66" y1="235" x2="265" y2="235" class="uq-diagram-force-small" marker-end="url(#uq-p1-arrow-f1)" />
      <line x1="66" y1="235" x2="66" y2="86" class="uq-diagram-force-large" marker-end="url(#uq-p1-arrow-f2)" />
      <line x1="66" y1="235" x2="265" y2="86" class="uq-diagram-resultant" marker-end="url(#uq-p1-arrow-result)" />
      <line x1="265" y1="235" x2="265" y2="86" class="uq-diagram-guide" />
      <path d="M66 217 L84 217 L84 235" class="uq-diagram-right-angle" />
      <text x="165" y="258" text-anchor="middle" class="uq-diagram-caption">4 cm</text>
      <text x="44" y="160" text-anchor="middle" class="uq-diagram-caption">3 cm</text>
      <text x="180" y="142" text-anchor="middle" class="uq-diagram-caption">5 cm</text>
      <line x1="405" y1="115" x2="610" y2="115" class="uq-diagram-resultant" marker-end="url(#uq-p1-arrow-result)" />
      <line x1="610" y1="190" x2="405" y2="190" class="uq-diagram-force-opposite" marker-end="url(#uq-p1-arrow-opposite)" />
      <text x="508" y="98" text-anchor="middle" class="uq-diagram-caption">5 cm</text>
      <text x="508" y="221" text-anchor="middle" class="uq-diagram-caption">5 cm</text>
      <text x="508" y="151" text-anchor="middle" class="uq-diagram-caption">اتجاهان متعاكسان</text>
    </svg>
    <div class="unit-diagram-legend" aria-label="مفتاح رسم القوى">
      <span><i class="legend-force-small" aria-hidden="true"></i> ${V_F1}</span>
      <span><i class="legend-force-large" aria-hidden="true"></i> ${V_F2}</span>
      <span><i class="legend-force-result" aria-hidden="true"></i> ${V_F}</span>
      <span><i class="legend-force-opposite" aria-hidden="true"></i> ${tex("\\vec{F}'", 'vector F prime')}</span>
    </div>
    <figcaption>رسم تعليمي من المنصة بمقياس اختير للحل: ${tex('1~\\mathrm{cm}=20~\\mathrm{N}', 'one centimeter represents twenty newtons')}. المثلث هو تمثيل متجهي للقوتين والمحصلة؛ والسهمان على اليمين متساويان طولاً ومتعاكسان اتجاهاً.</figcaption>
  </figure>`;

const problemTwoDiagram = `
  <figure class="unit-teacher-figure" data-platform-illustration="problem-two-resultant-position">
    <svg viewBox="0 0 650 310" role="img" aria-labelledby="problem-two-diagram-title problem-two-diagram-desc" focusable="false">
      <title id="problem-two-diagram-title">موضع محصلة القوتين في المسألة الثانية</title>
      <desc id="problem-two-diagram-desc">قوتان متعاكستان عند طرفي ساق طولها متر. القوة الثانية أكبر؛ تقع المحصلة خارج الساق من جهة القوة الثانية، على بعد ثلاثين سنتيمتراً من حاملها.</desc>
      <defs>
        <marker id="uq-p2-arrow-f1" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#bb6a54" /></marker>
        <marker id="uq-p2-arrow-f2" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#16706b" /></marker>
        <marker id="uq-p2-arrow-result" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#33568f" /></marker>
        <marker id="uq-p2-dimension" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#68738a" /></marker>
      </defs>
      <line x1="130" y1="145" x2="410" y2="145" class="uq-diagram-rod" />
      <line x1="130" y1="68" x2="130" y2="214" class="uq-diagram-carrier" />
      <line x1="410" y1="68" x2="410" y2="214" class="uq-diagram-carrier" />
      <line x1="494" y1="68" x2="494" y2="214" class="uq-diagram-carrier-result" />
      <line x1="130" y1="153" x2="130" y2="204" class="uq-diagram-force-small" marker-end="url(#uq-p2-arrow-f1)" />
      <line x1="410" y1="137" x2="410" y2="55" class="uq-diagram-force-large" marker-end="url(#uq-p2-arrow-f2)" />
      <line x1="494" y1="137" x2="494" y2="77" class="uq-diagram-resultant" marker-end="url(#uq-p2-arrow-result)" />
      <line x1="130" y1="242" x2="410" y2="242" class="uq-diagram-measure" marker-start="url(#uq-p2-dimension)" marker-end="url(#uq-p2-dimension)" />
      <line x1="410" y1="270" x2="494" y2="270" class="uq-diagram-measure" marker-start="url(#uq-p2-dimension)" marker-end="url(#uq-p2-dimension)" />
      <text x="270" y="234" text-anchor="middle" class="uq-diagram-caption" direction="ltr">1.00 m</text>
      <text x="452" y="262" text-anchor="middle" class="uq-diagram-caption" direction="ltr">0.30 m</text>
      <text x="130" y="58" text-anchor="middle" class="uq-diagram-endpoint">القوة الأولى</text>
      <text x="410" y="45" text-anchor="middle" class="uq-diagram-endpoint">القوة الثانية</text>
      <text x="494" y="66" text-anchor="middle" class="uq-diagram-endpoint">المحصلة</text>
    </svg>
    <div class="unit-diagram-legend" aria-label="قيم القوى في الرسم">
      <span><i class="legend-force-small" aria-hidden="true"></i> ${V_F1} = ${qty(45, 'N')}</span>
      <span><i class="legend-force-large" aria-hidden="true"></i> ${V_F2} = ${qty(195, 'N')}</span>
      <span><i class="legend-force-result" aria-hidden="true"></i> ${V_F} = ${qty(150, 'N')}</span>
    </div>
    <figcaption>تمثيل من المنصة للحل، لا شكل مطبوع من الكتاب. مواضع الحوامل والمسافات مرسومة وفق المعطيات؛ أطوال الأسهم تخطيطية وليست مقياساً للقوى.</figcaption>
  </figure>`;

function multipleChoiceSolutions() {
  const rows = [
    {
      id: 'teacher-unit-q1-part1',
      title: 'الفقرة 1 · المحصلة بجهة واحدة',
      answer: steps([
        ['givens', 'المعطيات', `<p>${F1} = ${qty(8, 'N')}، ${F2} = ${qty(12, 'N')}، والقوتان إلى الأسفل وعلى خط واحد.</p>`],
        ['required', 'المطلوب', `<p>شدة المحصلة وتحديد خيارها.</p>`],
        ['law', 'القانون', `<p>نجمع شدتي قوتين على الخط نفسه وبالجهة نفسها.</p>${eq('F=F_{1}+F_{2}', 'F equals F one plus F two')}`],
        ['substitution', 'التعويض', `<p>نعوّض القيم المعطاة بالنيوتن.</p>${calc('F=8+12=20~\\mathrm{N}', 'F equals eight plus twelve equals twenty newtons')}`],
        ['calculation', 'الحساب', `<p>المجموع العددي هو ${qty(20, 'N')}.</p>`],
        ['unit', 'الوحدة', `<p>تبقى الوحدة نيوتن لأننا نجمع قوتين.</p>`],
        ['check', 'التحقق', `<p>المحصلة أكبر من كل قوة منفردة واتجاهها إلى الأسفل؛ إذن الخيار <strong>c</strong>.</p>`],
      ]),
      explanation: `<p>لا نطرح لمجرد أن القوتين رأسيّتان؛ العمليّة يحددها اتجاههما، وهنا الجهة واحدة.</p>`,
    },
    {
      id: 'teacher-unit-q1-part2',
      title: 'الفقرة 2 · قوتان متعامدتان ومتساويتان',
      answer: steps([
        ['givens', 'المعطيات', `<p>القوتان متعامدتان، و${tex('F_{1}=F_{2}', 'F one equals F two')}.</p>`],
        ['required', 'المطلوب', `<p>صيغة شدة المحصلة ${F} بدلالة ${F1}.</p>`],
        ['law', 'القانون', `<p>للقوتين المتعامدتين نستخدم فيثاغورس.</p>${eq('F=\\sqrt{F_{1}^{2}+F_{2}^{2}}', 'F equals the square root of F one squared plus F two squared')}`],
        ['substitution', 'التعويض', `${eq('F=\\sqrt{F_{1}^{2}+F_{1}^{2}}=\\sqrt{2F_{1}^{2}}', 'F equals the square root of two F one squared')}`],
        ['calculation', 'التبسيط', `${eq('F=\\sqrt{2}F_{1}', 'F equals square root of two times F one')}`],
        ['unit', 'الوحدة', `<p>تحتفظ ${F} بوحدة القوة نفسها التي لدى ${F1}؛ معامل ${tex('\\sqrt{2}', 'square root of two')} بلا وحدة.</p>`],
        ['check', 'التحقق', `<p>عند تساوي قوتين متعامدتين تكون المحصلة أكبر من كل واحدة بمعامل ${tex('\\sqrt{2}', 'square root of two')}، لذلك الخيار <strong>b</strong>.</p>`],
      ]),
      explanation: `<p>لا نجمع المقدارين مباشرة؛ فالجمع الحسابي البسيط يصلح للقوتين على خط واحد وفي الجهة نفسها، لا لمتجهين متعامدين.</p>`,
    },
    {
      id: 'teacher-unit-q1-part3',
      title: 'الفقرة 3 · المسافة بين حاملَي القوتين',
      answer: steps([
        ['givens', 'المعطيات', `<p>${distanceLabel('d_{2}', 6)}، ${distanceLabel('d_{1}', 2)}، والقوتان متعاكستان.</p>`],
        ['required', 'المطلوب', `<p>البعد بين الحاملين.</p>`],
        ['law', 'القانون', `<p>عندما يقع الحاملان على الجهة نفسها من حامل المحصلة، يساوي الفصل بينهما فرق بُعديهما عن ذلك الحامل.</p>${eq('d=d_{2}-d_{1}', 'd equals d two minus d one')}`],
        ['substitution', 'التعويض', `${calc('d=6-2=4~\\mathrm{cm}', 'd equals six minus two equals four centimeters')}`],
        ['calculation', 'الحساب', `<p>${tex('6-2=4', 'six minus two equals four')}.</p>`],
        ['unit', 'الوحدة', `<p>كلا البعدين بالسنتيمتر؛ الناتج ${qty(4, 'cm')}.</p>`],
        ['check', 'التحقق', `<p>فرق البعدين موجب، وهو فصل الحاملين؛ الخيار <strong>c</strong>.</p>`],
      ]),
      explanation: `<p>في القوة المحصلة لقوتين متعاكستين، يكون حامل المحصلة خارج المسافة بين الحاملين. لذلك نأخذ الفرق بين بعدي الحاملين عن المحصلة، لا مجموعهما.</p>`,
    },
    {
      id: 'teacher-unit-q1-part4',
      title: 'الفقرة 4 · إيجاد القوة الثانية',
      answer: steps([
        ['givens', 'المعطيات', `<p>${F1} = ${qty(6, 'N')}، ${F} = ${qty(10, 'N')}، والقوتان متعامدتان.</p>`],
        ['required', 'المطلوب', `<p>شدة ${F2}.</p>`],
        ['law', 'القانون', `${eq('F^{2}=F_{1}^{2}+F_{2}^{2}', 'F squared equals F one squared plus F two squared')}`],
        ['substitution', 'التعويض', `${eq('F_{2}=\\sqrt{F^{2}-F_{1}^{2}}=\\sqrt{10^{2}-6^{2}}', 'F two equals square root of ten squared minus six squared')}`],
        ['calculation', 'الحساب', `${calc('F_{2}=\\sqrt{100-36}=\\sqrt{64}=8~\\mathrm{N}', 'F two equals square root of sixty-four equals eight newtons')}`],
        ['unit', 'الوحدة', `<p>شدة القوة الثانية ${qty(8, 'N')}.</p>`],
        ['check', 'التحقق', `${eq('\\sqrt{6^{2}+8^{2}}=\\sqrt{36+64}=10~\\mathrm{N}', 'square root of six squared plus eight squared equals ten newtons')}<p>تعود المحصلة إلى القيمة المعطاة؛ الخيار <strong>d</strong>.</p>`],
      ]),
      explanation: `<p>استخدمنا فيثاغورس لأن القوتين متعامدتان. نطرح مربعي الشدة المعروفة من مربع المحصلة، ثم نأخذ الجذر الموجب لأن الشدة مقدار غير سالب.</p>`,
    },
  ];

  return `<section class="teacher-section" id="teacher-q1" aria-labelledby="teacher-q1-heading">
    ${heading('السؤال الأول · الاختيارات الأربعة', '71', 'teacher-q1-heading')}
    ${rows.map((row) => `<article class="teacher-subsection unit-teacher-question" id="${row.id}" data-page-reference="p71" data-teacher-question="${row.id}"><h4>${row.title}</h4>${answer(row.answer)}${explanation(row.explanation)}</article>`).join('')}
  </section>`;
}

function distanceLabel(symbol, value) {
  return tex(`${symbol}=${value}~\\mathrm{cm}`, `${symbol} equals ${value} centimeters`);
}

function oppositeParallelSolution() {
  return `<section class="teacher-section" id="teacher-q2" aria-labelledby="teacher-q2-heading">
    ${heading('السؤال الثاني · محصلة قوتين متعاكستين', '71', 'teacher-q2-heading')}
    <article class="teacher-subsection unit-teacher-question" data-page-reference="p71" data-teacher-question="question-two">
      <h4>عناصر المحصلة والرسم التوضيحي</h4>
      ${answer(steps([
        ['givens', 'المعطيات', `<p>قوتان شاقوليتان متوازيتان، مختلفتان بالشدة، متعاكستان بالجهة، تؤثران عند طرفي مسطرة خفيفة. لا يعطي السؤال قيمتي الشدتين أو المسافة بين الطرفين.</p>`],
        ['required', 'المطلوب', `<p>تحديد الحامل والجهة والشدة وموضع محصلة القوتين وتمثيلها.</p>`],
        ['law', 'القانون', `${eq('F_{R}=F_{L}-F_{s}\\quad(F_{L}>F_{s})', 'F resultant equals F large minus F small')}`],
        ['substitution', 'التعويض', `<p>لأن الكتاب لم يذكر مقادير عددية، نستخدم الرمزين ${tex('F_{L}', 'F large')} للقوة الأكبر، و${tex('F_{s}', 'F small')} للأصغر، و${tex('L', 'L')} للمسافة بين الحاملين.</p>`],
        ['calculation', 'تحديد الموضع', `${eq('F_{L}x=F_{s}(L+x)\\Rightarrow x=\\frac{F_{s}L}{F_{L}-F_{s}}', 'F large times x equals F small times L plus x; x equals F small L over F large minus F small')}<p>حامل المحصلة يقع خارج القطعة الواصلة بين حاملي القوتين من جهة القوة الأكبر، وعلى مسافة ${tex('x', 'x')} من حاملها.</p>`],
        ['unit', 'الوحدة', `<p>تكون وحدة ${tex('x', 'x')} هي وحدة ${tex('L', 'L')} نفسها. لا يمكن إعطاء طول عددي من دون قيمة المسافة والمقدارين.</p>`],
        ['check', 'التحقق', `<p>المحصلة موازية للقوتين، وجهتها جهة القوة الأكبر، وشدتها الفرق بين الشدتين. وعند حاملها يتساوى عزما القوتين: ${tex('F_{L}x=F_{s}(L+x)', 'F large x equals F small times L plus x')}.</p>`],
      ]))}
      ${explanation(`<p>رسم المعلم أدناه يختار القوة الأكبر عند الطرف الأيمن للتوضيح فقط. إذا كانت القوة الأكبر عند الطرف المقابل، ينعكس موضع المحصلة والرسم أفقياً. الرسم من المنصة وليس جزءاً مطبوعاً في الصفحة.</p>${oppositeForcesDiagram}`)}
    </article>
  </section>`;
}

function perpendicularProblemSolution() {
  return `<section class="teacher-section" id="teacher-problem-one" aria-labelledby="teacher-problem-one-heading">
    ${heading('السؤال الثالث · المسألة الأولى', '71–72', 'teacher-problem-one-heading')}
    <article class="teacher-subsection unit-teacher-question" data-page-reference="p71 p72" data-teacher-question="problem-one">
      <h4>القوتان المتعامدتان والرسم بمقياس</h4>
      ${answer(steps([
        ['givens', 'المعطيات', `<p>${F1} = ${qty(80, 'N')}، ${F} = ${qty(100, 'N')}، والقوتان متعامدتان.</p>`],
        ['required', 'المطلوب', `<p>شدة ${F2}، ثم تمثيل القوتين والمحصلة بمقياس مناسب، ورسم القوة ${tex("\\vec{F}'", 'vector F prime')} المعاكسة مباشرة للمحصلة.</p>`],
        ['law', 'القانون', `${eq('F^{2}=F_{1}^{2}+F_{2}^{2}', 'F squared equals F one squared plus F two squared')}`],
        ['substitution', 'التعويض', `${eq('F_{2}=\\sqrt{F^{2}-F_{1}^{2}}=\\sqrt{100^{2}-80^{2}}', 'F two equals square root of one hundred squared minus eighty squared')}`],
        ['calculation', 'الحساب', `${calc('F_{2}=\\sqrt{10000-6400}=\\sqrt{3600}=60~\\mathrm{N}', 'F two equals square root of three thousand six hundred equals sixty newtons')}`],
        ['unit', 'الوحدة', `<p>إذن شدة القوة الثانية ${qty(60, 'N')}.</p>`],
        ['check', 'التحقق', `${eq('\\sqrt{80^{2}+60^{2}}=\\sqrt{6400+3600}=100~\\mathrm{N}', 'square root of eighty squared plus sixty squared equals one hundred newtons')}<p>تطابق النتيجة شدة المحصلة المعطاة. وللرسم نختار ${tex('1~\\mathrm{cm}=20~\\mathrm{N}', 'one centimeter represents twenty newtons')}: ${V_F1} بطول ${qty(4, 'cm')}، و${V_F2} بطول ${qty(3, 'cm')}، و${V_F} بطول ${qty(5, 'cm')}.</p><p>القوة المعاكسة مباشرة هي ${tex("\\vec{F}'=-\\vec{F}", 'vector F prime equals negative vector F')}: مقدارها ${qty(100, 'N')}، وطولها على الرسم ${qty(5, 'cm')}، واتجاهها معاكس لاتجاه ${V_F}.</p>`],
      ]))}
      ${explanation(`<p>تُرسم القوتان من نقطة مشتركة وبزاوية قائمة، ثم تمثل المحصلة بقطر متوازي الأضلاع (أو وتر المثلث القائم). مقياس الرسم اختيار تعليمي مناسب، وليس معطى من نص الكتاب.</p>${perpendicularForcesDiagram}<p><strong>ملاحظة فيزيائية:</strong> «القوة المعاكسة مباشرة» تعني متجهًا مساوياً للمحصلة مقداراً ومعاكساً لها اتجاهاً؛ جمعهما يعطي محصلة صفرية.</p>`)}
    </article>
  </section>`;
}

function secondProblemSolution() {
  return `<section class="teacher-section" id="teacher-problem-two" aria-labelledby="teacher-problem-two-heading">
    ${heading('السؤال الثالث · المسألة الثانية', '72', 'teacher-problem-two-heading')}
    <article class="teacher-subsection unit-teacher-question" data-page-reference="p72" data-teacher-question="problem-two">
      <h4>تحديد القوة الأكبر ثم إيجاد الشدتين</h4>
      ${answer(steps([
        ['givens', 'المعطيات', `<p>${V_F} = ${qty(150, 'N')}، طول الساق ${qty(1, 'm')}، وبعد حامل ${V_F2} عن حامل المحصلة ${qty(30, 'cm')}، والقوتان متوازيتان متعاكستان.</p>`],
        ['required', 'المطلوب', `<p>أي القوتين أكبر، وبعد حامل ${V_F1} عن حامل المحصلة، وشدتا القوتين.</p>`],
        ['law', 'القانون', `<p>في قوتين متوازيتين متعاكستين، تتجه المحصلة بجهة القوة الأكبر، وتقع خارج القطعة من جهتها. كما أن ${tex('F=F_{2}-F_{1}', 'F equals F two minus F one')} حين تكون ${F2} أكبر، ويتساوى العزمان حول حامل المحصلة.</p>${eq('F_{1}d_{1}=F_{2}d_{2}', 'F one times d one equals F two times d two')}`],
        ['substitution', 'التعويض', `<p>لا يمكن أن يقع حامل المحصلة على بعد ${qty(30, 'cm')} من ${V_F2} جهة ${V_F1}؛ فالمسافة بين الحاملين ${qty(1, 'm')}، وهي أكبر. لذلك يقع الحامل خارج الساق من جهة ${V_F2}، وتكون ${V_F2} الأكبر.</p>${calc('d_{1}=1.00~\\mathrm{m}+0.30~\\mathrm{m}=1.30~\\mathrm{m}', 'd one equals one meter plus zero point three meters equals one point three meters')}`],
        ['calculation', 'الحساب', `${eq('F_{1}(1.30~\\mathrm{m})=F_{2}(0.30~\\mathrm{m})', 'F one times one point three meters equals F two times zero point three meters')}${eq('F_{2}-F_{1}=150~\\mathrm{N}\\Rightarrow F_{2}=F_{1}+150~\\mathrm{N}', 'F two minus F one equals one hundred fifty newtons')}<p>نعوّض في علاقة العزوم:</p>${calc('1.30~\\mathrm{m}\\,F_{1}=0.30~\\mathrm{m}(F_{1}+150~\\mathrm{N})\\Rightarrow F_{1}=45~\\mathrm{N}', 'one point three meters times F one equals zero point three meters times F one plus one hundred fifty newtons; F one equals forty-five newtons')}${calc('F_{2}=45+150=195~\\mathrm{N}', 'F two equals forty-five plus one hundred fifty equals one hundred ninety-five newtons')}`],
        ['unit', 'الوحدة', `<p>${F1} = ${qty(45, 'N')}، و${F2} = ${qty(195, 'N')}، وبعد ${V_F1} عن المحصلة ${qty(1.30, 'm')}.</p>`],
        ['check', 'التحقق', `${eq('195-45=150~\\mathrm{N}', 'one hundred ninety-five minus forty-five equals one hundred fifty newtons')}${eq('45~\\mathrm{N}\\times1.30~\\mathrm{m}=195~\\mathrm{N}\\times0.30~\\mathrm{m}=58.5~\\mathrm{N\\,m}', 'forty-five newtons times one point three meters equals one hundred ninety-five newtons times zero point three meters equals fifty-eight point five newton meters')}<p>فرق القوتين يعيد المحصلة المعطاة، وعزما القوتين متساويان حول حامل المحصلة؛ لذلك اتجاهها وموضعها متسقان فيزيائياً.</p>`],
      ]))}
      ${explanation(`<p><strong>سبب اختيار ${V_F2} الأكبر:</strong> لو كانت ${V_F1} الأكبر لوقع حامل المحصلة خارج الساق من جهتها، وكان بعده عن حامل ${V_F2} لا يقل عن طول الساق (${qty(1, 'm')}). لكن المعطى ${qty(30, 'cm')} أصغر من ${qty(1, 'm')}؛ لذا يقع الحامل خارج الساق من جهة ${V_F2}، فتكون هي الأكبر.</p>${problemTwoDiagram}`)}
    </article>
  </section>`;
}

function sourcePages() {
  return `<section class="teacher-section" id="teacher-source-pages" aria-labelledby="teacher-source-pages-heading">
    ${heading('النص الأصلي كما في الكتاب', '71–72', 'teacher-source-pages-heading')}
    <p class="teacher-section-endnote">تعرض الإفصاحات التالية نص المصدر مجزّأً بحسب رقم الصفحة المطبوع، مع الحفاظ على ترتيب المسائل وأجزائها.</p>
    ${renderUnitQuestionSourceDisclosure(71)}
    ${renderUnitQuestionSourceDisclosure(72)}
  </section>`;
}

export function renderTeacherContent() {
  return `<header class="teacher-workspace-header"><div><p class="teacher-workspace-eyebrow">دليل المعلم · المصدر p71–p72</p><h2 id="teacher-workspace-heading" tabindex="-1">أسئلة الوحدة الأولى — الحلول</h2><p>الوحدة الأولى · الحركة والقوى · أسئلة الكتاب الأصلية وحلولها المفصلة</p></div><button class="teacher-logout-button" type="button" data-teacher-logout>إنهاء الجلسة</button></header>
    <div class="teacher-workspace-layout">
      <nav class="teacher-nav" aria-label="التنقل في حلول أسئلة الوحدة"><p class="teacher-nav-title">أقسام الحلول</p><a href="#teacher-q1">السؤال الأول</a><a href="#teacher-q2">السؤال الثاني</a><a href="#teacher-problem-one">المسألة الأولى</a><a href="#teacher-problem-two">المسألة الثانية</a><a href="#teacher-source-pages">نص المصدر</a></nav>
      <div class="teacher-content">${multipleChoiceSolutions()}${oppositeParallelSolution()}${perpendicularProblemSolution()}${secondProblemSolution()}${sourcePages()}</div>
    </div>`;
}
