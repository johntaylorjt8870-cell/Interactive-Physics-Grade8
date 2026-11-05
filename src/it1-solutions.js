/* ============================================================================
   Independent Test 1 — ANSWER KEY, worked solutions, and solved figures.
   ----------------------------------------------------------------------------
   THIS MODULE IS THE ANSWER. It must never be imported by anything that runs
   before submission:

     - `independent-tests-data.js` does NOT import it (the registry stays public),
     - `it1-assessment.js` reaches it only through `loadSolutions: () => import(...)`,
       which the shared runtime awaits inside the confirm-submit handler.

   Conventions
     - the magnitude of the resultant is `F`, never `R`;
     - every requested item has exactly one entry here (1 mark each);
     - numeric answers carry an explicit tolerance, and `unit` matches the
       question's `numericUnit` (`null` for a pure number such as tan α).
   ========================================================================== */

import { calculation, qty, scalar, solutionSteps, tex } from './math.js';
import { it1SolvedDiagram } from './it1-diagrams.js';
import { IT1_PROBLEMS, IT1_QUESTIONS } from './it1-problems.js';

const S_F = scalar('F');
const S_F1 = scalar('F', '1');
const S_F2 = scalar('F', '2');
const S_D1 = scalar('d', '1');
const S_D2 = scalar('d', '2');
const S_D = scalar('d');

const N = (value) => qty(value, 'N');
const M = (value) => qty(value, 'm');
const eq = (source, label) => calculation(source, label);

/* Rows of the worked solution, in the platform's labelled style. */
const step = (label, html, kind = 'line') => ({ label, html, kind });
const answerHtml = (html) => `<span class="it1-final-answer">${html}</span>`;

/* A solution record: { problemId, number, steps[], answerSummaryHtml } */
const solution = (problemId, number, steps, summary) => Object.freeze({
  problemId,
  number,
  steps: Object.freeze(steps),
  answerSummaryHtml: summary,
});

export const IT1_SOLUTIONS = Object.freeze([
  /* ---------------------------------------------------------------- 1 ---- */
  solution('it1p01', 1, [
    step('المعطى', `${S_F1} = ${N(15)}، ${S_F2} = ${N(45)}، ${tex('AB=2~\\mathrm{m}', 'AB equals 2 m')}، والجهتان واحدة.`),
    step('القانون', `${tex('F=F_{1}+F_{2}', 'F equals F one plus F two')} للجهة الواحدة، و${tex('F_{1}d_{1}=F_{2}d_{2}', 'F one d one equals F two d two')} لتعيين نقطة التأثير.`),
    step('الشدة', eq('F=15+45=60~\\mathrm{N}', 'F equals 15 plus 45 equals 60 newtons')),
    step('التوزيع', eq('\\dfrac{d_{1}}{d_{2}}=\\dfrac{F_{2}}{F_{1}}=\\dfrac{45}{15}=3', 'd one over d two equals 45 over 15 equals 3')),
    step('الأبعاد', eq('d_{1}=3d_{2} \\Rightarrow 3d_{2}+d_{2}=2~\\mathrm{m}', 'd one equals 3 d two so 4 d two equals 2 metres')
      + eq('4d_{2}=2 \\Rightarrow d_{2}=0.5~\\mathrm{m},\\ d_{1}=1.5~\\mathrm{m}', 'd two equals 0.5 metres and d one equals 1.5 metres')),
  ], answerHtml(`${S_F} = ${N(60)}، ${S_D1} = ${M('1.5')}، ${S_D2} = ${M('0.5')}. المحصلة بين القوتين وأقرب إلى القوة الكبرى ${S_F2}.`)),

  /* ---------------------------------------------------------------- 2 ---- */
  solution('it1p02', 2, [
    step('المعطى', `${S_F1} = ${N(60)}، ${S_F2} = ${N(20)}، ${tex('AB=0.8~\\mathrm{m}', 'AB equals 0.8 m')}، والجهتان واحدة.`),
    step('الشدة', eq('F=60+20=80~\\mathrm{N}', 'F equals 60 plus 20 equals 80 newtons')),
    step('التوزيع', eq('\\dfrac{d_{1}}{d_{2}}=\\dfrac{20}{60}=\\dfrac13', 'd one over d two equals 20 over 60 equals one third')),
    step('الأبعاد', eq('d_{2}=3d_{1} \\Rightarrow d_{1}+d_{2}=4d_{1}=0.8~\\mathrm{m}', 'd two equals 3 d one so 4 d one equals 0.8 metres')
      + eq('d_{1}=0.2~\\mathrm{m},\\ d_{2}=0.6~\\mathrm{m}', 'd one equals 0.2 metres and d two equals 0.6 metres')),
    step('العناصر', `نقطة التأثير بين ${tex('A', 'point A')} و${tex('B', 'point B')} وأقرب إلى القوة الأكبر ${S_F1}، والحامل موازٍ لحاملي القوتين، والجهة جهة القوتين.`),
  ], answerHtml(`${S_F} = ${N(80)}، ${S_D1} = ${M('0.2')}، ${S_D2} = ${M('0.6')}.`)),

  /* ---------------------------------------------------------------- 3 ---- */
  solution('it1p03', 3, [
    step('المعطى', `${S_F1} = ${N(100)}، ${S_F2} = ${N(300)}، ${S_D1} = ${M('0.75')}، والجهتان واحدة.`),
    step('الشدة', eq('F=100+300=400~\\mathrm{N}', 'F equals 100 plus 300 equals 400 newtons')),
    step('القانون المعطى', eq('\\dfrac{F_{1}}{F_{2}}=\\dfrac{d_{2}}{d_{1}} \\Rightarrow \\dfrac{100}{300}=\\dfrac{d_{2}}{0.75}', 'F one over F two equals d two over d one, then 100 over 300 equals d two over 0.75')),
    step('البعد الثاني', eq('d_{2}=0.25~\\mathrm{m}', 'd two equals 0.25 metres')),
    step('الطول الكلي', eq('d=d_{1}+d_{2}=0.75+0.25=1~\\mathrm{m}', 'd equals 0.75 plus 0.25 equals 1 metre')),
  ], answerHtml(`${S_F} = ${N(400)}، ${S_D2} = ${M('0.25')}، ${S_D} = ${M(1)}.`)),

  /* ---------------------------------------------------------------- 4 ---- */
  solution('it1p04', 4, [
    step('المعطى', `${S_F1} = ${N(30)}، ${S_F2} = ${N(90)}، ${tex('AB=0.6~\\mathrm{m}', 'AB equals 0.6 m')}، والجهتان متعاكستان.`),
    step('الشدة', eq('F=F_{2}-F_{1}=90-30=60~\\mathrm{N}', 'F equals 90 minus 30 equals 60 newtons')),
    step('الموضع', `المحصلة خارج القطعة من جهة القوة الكبرى ${S_F2}، ولذلك ${tex('d_{1}=d_{2}+AB', 'd one equals d two plus A B')}.`),
    step('التوزيع', eq('\\dfrac{d_{1}}{d_{2}}=\\dfrac{F_{2}}{F_{1}}=\\dfrac{90}{30}=3', 'd one over d two equals 90 over 30 equals 3')),
    step('الأبعاد', eq('d_{1}=3d_{2} \\Rightarrow 3d_{2}-d_{2}=0.6~\\mathrm{m}', 'd one equals 3 d two so 2 d two equals 0.6 metres')
      + eq('2d_{2}=0.6 \\Rightarrow d_{2}=0.3~\\mathrm{m},\\ d_{1}=0.9~\\mathrm{m}', 'd two equals 0.3 metres and d one equals 0.9 metres')),
  ], answerHtml(`${S_F} = ${N(60)} جهة ${S_F2}، ${S_D1} = ${M('0.9')}، ${S_D2} = ${M('0.3')}.`)),

  /* ---------------------------------------------------------------- 5 ---- */
  solution('it1p05', 5, [
    step('المعطى', `${S_F} = ${N(120)} ، ${S_F1} = ${N(40)} ، ${S_D2} = ${M('0.2')} ، ${tex('F_{1}<F_{2}', 'F one less than F two')} والجهتان متعاكستان.`),
    step('القوة الكبرى', eq('F=F_{2}-F_{1} \\Rightarrow 120=F_{2}-40 \\Rightarrow F_{2}=160~\\mathrm{N}', 'F equals F two minus F one so 120 equals F two minus 40 and F two equals 160 newtons')),
    step('العناصر', `الجهة جهة القوة الكبرى ${S_F2}، والحامل على امتداد حاملي القوتين، ونقطة التأثير خارج القطعة من جهة ${S_F2}.`),
    step('التوزيع', eq('\\dfrac{d_{1}}{d_{2}}=\\dfrac{F_{2}}{F_{1}}=\\dfrac{160}{40}=4', 'd one over d two equals 160 over 40 equals 4')),
    step('الأبعاد', eq('d_{1}=4d_{2}=4\\times0.2=0.8~\\mathrm{m}', 'd one equals 4 times 0.2 equals 0.8 metres')
      + eq('d=d_{1}-d_{2}=0.8-0.2=0.6~\\mathrm{m}', 'd equals 0.8 minus 0.2 equals 0.6 metres')),
  ], answerHtml(`${S_F2} = ${N(160)}، ${S_D1} = ${M('0.8')}، ${S_D} = ${M('0.6')}.`)),

  /* ---------------------------------------------------------------- 6 ---- */
  solution('it1p06', 6, [
    step('المعطى', `${S_F1} = ${N(50)}، ${S_F2} = ${N(200)}، ${S_F} = ${N(150)}، ${S_D1} = ${M(2)}، والجهتان متعاكستان.`),
    step('العناصر', `الشدة ${N(150)}، والجهة جهة القوة الكبرى ${S_F2}، والحامل موازٍ لحاملي القوتين، ونقطة التأثير خارج القطعة من جهة ${S_F2}.`),
    step('التوزيع', eq('\\dfrac{d_{1}}{d_{2}}=\\dfrac{F_{2}}{F_{1}}=\\dfrac{200}{50}=4', 'd one over d two equals 200 over 50 equals 4')),
    step('البعد الثاني', eq('d_{2}=\\dfrac{d_{1}}{4}=\\dfrac{2}{4}=0.5~\\mathrm{m}', 'd two equals 2 over 4 equals 0.5 metres')),
    step('البعد بين القوتين', eq('d=d_{1}-d_{2}=2-0.5=1.5~\\mathrm{m}', 'd equals 2 minus 0.5 equals 1.5 metres')),
    step('تحقق', eq('50\\times2=100=200\\times0.5', '50 times 2 equals 100 and 200 times 0.5 equals 100, so the two moments agree')),
  ], answerHtml(`${S_D2} = ${M('0.5')}، ${S_D} = ${M('1.5')}.`)),

  /* ---------------------------------------------------------------- 7 ---- */
  solution('it1p07', 7, [
    step('المعطى', `${S_F1} = ${N(3)}، ${S_F2} = ${N(4)}، والزاوية بينهما ${tex('90^{\\circ}', '90 degrees')}.`),
    step('العناصر', `نقطة التأثير هي ${tex('O', 'point O')} نفسها، والحامل هو القطر الخارج من ${tex('O', 'point O')} داخل الزاوية القائمة، والجهة من ${tex('O', 'point O')} نحو الرأس المقابل.`),
    step('الشدة', eq('F=\\sqrt{3^{2}+4^{2}}=\\sqrt{25}=5~\\mathrm{N}', 'F equals the square root of 3 squared plus 4 squared equals 5 newtons')),
    step('زاوية الميل', eq('\\tan\\alpha=\\dfrac{F_{2}}{F_{1}}=\\dfrac43=1.333 \\Rightarrow \\alpha \\approx 53.1^{\\circ}', 'tangent alpha equals 4 over 3 so alpha is about 53.1 degrees')),
  ], answerHtml(`${S_F} = ${N(5)}، ${tex('\\alpha \\approx 53.1^{\\circ}', 'alpha is about 53.1 degrees')}.`)),

  /* ---------------------------------------------------------------- 8 ---- */
  solution('it1p08', 8, [
    step('المعطى', `${S_F1} = ${N(16)}، ${S_F2} = ${N(12)}، والزاوية ${tex('90^{\\circ}', '90 degrees')}.`),
    step('الشدة', eq('F=\\sqrt{16^{2}+12^{2}}=\\sqrt{256+144}=\\sqrt{400}=20~\\mathrm{N}', 'F equals the square root of 400 equals 20 newtons')),
    step('ظل الزاوية', eq('\\tan\\alpha=\\dfrac{12}{16}=0.75', 'tangent alpha equals 12 over 16 equals 0.75')),
    step('ملاحظة', `المحصلة ${N(20)} والميل ${tex('\\alpha \\approx 36.9^{\\circ}', 'alpha is about 36.9 degrees')} عن حامل ${S_F1}.`),
  ], answerHtml(`${S_F} = ${N(20)}، ${tex('\\tan\\alpha = 0.75', 'tangent alpha equals 0.75')}.`)),

  /* ---------------------------------------------------------------- 9 ---- */
  solution('it1p09', 9, [
    step('المعطى', `${tex('F_{1}=F_{2}=6~\\mathrm{N}', 'F one equals F two equals 6 newtons')}، والزاوية بينهما ${tex('90^{\\circ}', '90 degrees')}.`),
    step('العناصر', `القوتان متساويتان، فمتوازي الأضلاع مربع، وحامل المحصلة منصّف الزاوية القائمة أي يصنع ${tex('45^{\\circ}', '45 degrees')} مع حامل كل قوة.`),
    step('الشدة', eq('F=\\sqrt{6^{2}+6^{2}}=\\sqrt{72}=6\\sqrt{2}\\approx 8.49~\\mathrm{N}', 'F equals the square root of 72 equals 6 root 2 which is about 8.49 newtons')),
    step('زاوية الميل', eq('\\tan\\alpha=\\dfrac{6}{6}=1 \\Rightarrow \\alpha=45^{\\circ}', 'tangent alpha equals 1 so alpha equals 45 degrees')),
  ], answerHtml(`${S_F} \\approx ${N('8.49')}، ${tex('\\alpha = 45^{\\circ}', 'alpha equals 45 degrees')} عن حامل كل من القوتين.`)),

  /* --------------------------------------------------------------- 10 ---- */
  solution('it1p10', 10, [
    step('المعطى', `${tex('F_{1}=F_{2}=20~\\mathrm{N}', 'F one equals F two equals 20 newtons')}، والزاوية بينهما ${tex('90^{\\circ}', '90 degrees')}.`),
    step('الشكل الهندسي', `القوتان متساويتان ومتعامدتان، فمتوازي الأضلاع مربع، وقطره هو المحصلة ${S_F} الخارج من ${tex('O', 'point O')}، وحامله منصّف الزاوية القائمة.`),
    step('الشدة', eq('F=\\sqrt{20^{2}+20^{2}}=20\\sqrt{2}\\approx 28.28~\\mathrm{N}', 'F equals 20 root 2 which is about 28.28 newtons')),
  ], answerHtml(`${S_F} \\approx ${N('28.28')}، والشكل مربع وقطره المحصلة.`)),

  /* --------------------------------------------------------------- 11 ---- */
  solution('it1p11', 11, [
    step('الإنشاء', `نرسم الشعاعين ${S_F1} و${S_F2} من ${tex('O', 'point O')}، ثم نكمل متوازي الأضلاع، فالمحصلة هي القطر الخارج من ${tex('O', 'point O')} إلى الرأس المقابل.`),
    step('العناصر', `نقطة التأثير ${tex('O', 'point O')}، والحامل القطر داخل الزاوية، والجهة نحو الرأس المقابل، والشدة تُقاس بطول القطر وفق مقياس الرسم.`),
    step('الشدة', eq('F=\\sqrt{10^{2}+15^{2}+2\\times10\\times15\\cos45^{\\circ}}', 'F equals the square root of 100 plus 225 plus 300 cosine 45 degrees')),
    step('الحساب', eq('F=\\sqrt{325+212.1}=\\sqrt{537.1}\\approx 23.2~\\mathrm{N}', 'F equals the square root of 537.1 which is about 23.2 newtons')),
  ], answerHtml(`${S_F} \\approx ${N('23.2')}، وحاملها القطر الخارج من ${tex('O', 'point O')}.`)),

  /* --------------------------------------------------------------- 12 ---- */
  solution('it1p12', 12, [
    step('العناصر', `نقطة التأثير ${tex('O', 'point O')}، والحامل القطر داخل الزاوية الحادة بين الحاملين، والجهة من ${tex('O', 'point O')} نحو الرأس المقابل.`),
    step('حدود الشدة', eq('|F_{2}-F_{1}|<F<F_{1}+F_{2}', 'the magnitude of F lies between the difference and the sum')),
    step('الأرقام', `${tex('20~\\mathrm{N}<F<80~\\mathrm{N}', 'F is greater than 20 newtons and less than 80 newtons')}.`),
    step('أثر الزاوية', `عند زيادة الزاوية تقل شدة المحصلة، وعند نقصانها تزيد، وتصل إلى ${N(80)} عند انعدام الزاوية.`),
  ], answerHtml(`${S_F} بين ${N(20)} و${N(80)}, وتقل بزيادة الزاوية.`)),

  /* --------------------------------------------------------------- 13 ---- */
  solution('it1p13', 13, [
    step('المعطى', `${tex('F_{1}=F_{2}=50~\\mathrm{N}', 'F one equals F two equals 50 newtons')}، والزاوية بينهما ${tex('60^{\\circ}', '60 degrees')}.`),
    step('الفكرة الهندسية', `المثلث المساعد ذو ضلعي القوتين والضلع الواصل بين رأسيهما متساوي الأضلاع. متوسطه طوله ${tex('\\frac{50\\sqrt{3}}{2}~\\mathrm{N}', 'the median is 50 square root of 3 over 2 newtons')}; والمحصلة، قطر متوازي الأضلاع، تساوي ضعفي المتوسط.`),
    step('الشدة', eq('F=2\\times50\\times\\cos30^{\\circ}=50\\sqrt{3}\\approx 86.6~\\mathrm{N}', 'F equals 2 times 50 times cosine 30 degrees equals 50 root 3 which is about 86.6 newtons')),
    step('العناصر', `حامل المحصلة منصّف الزاوية ${tex('60^{\\circ}', '60 degrees')}، أي يصنع ${tex('30^{\\circ}', '30 degrees')} مع حامل كل قوة، ونقطة تأثيرها ${tex('O', 'point O')}.`),
  ], answerHtml(`${S_F} \\approx ${N('86.6')}، وحاملها منصّف الزاوية بين القوتين المتساويتين.`)),

  /* --------------------------------------------------------------- 14 ---- */
  solution('it1p14', 14, [
    step('المعطى', `${tex('F_{1}=F_{2}=80~\\mathrm{N}', 'F one equals F two equals 80 newtons')}، والزاوية بين الحاملين ${tex('60^{\\circ}', '60 degrees')}.`),
    step('الشدة', eq('F=2\\times80\\times\\cos30^{\\circ}=80\\sqrt{3}\\approx 138.6~\\mathrm{N}', 'F equals 2 times 80 times cosine 30 degrees equals 80 root 3 which is about 138.6 newtons')),
    step('العناصر', `نقطة التأثير النقطة المشتركة، والحامل منصّف الزاوية بين الحاملين، والجهة داخل الزاوية نحو الرأس المقابل.`),
    step('زاوية الميل', eq('\\alpha=\\dfrac{60^{\\circ}}{2}=30^{\\circ}', 'alpha equals 60 over 2 equals 30 degrees')),
  ], answerHtml(`${S_F} \\approx ${N('138.6')}، ${tex('\\alpha=30^{\\circ}', 'alpha equals 30 degrees')} عن حامل كل قوة.`)),
]);

/* --- answer key ----------------------------------------------------------- */
/* One entry per graded field. Numeric keys carry value + tolerance + unit;
   choice keys carry the option id. */
export const ANSWER_KEY = Object.freeze({
  'it1p01-magnitude': { value: 60, tolerance: 0.01, unit: 'N' },
  'it1p01-d1': { value: 1.5, tolerance: 0.01, unit: 'm' },
  'it1p01-d2': { value: 0.5, tolerance: 0.01, unit: 'm' },

  'it1p02-magnitude': { value: 80, tolerance: 0.01, unit: 'N' },
  'it1p02-elements': 'full',
  'it1p02-d1': { value: 0.2, tolerance: 0.01, unit: 'm' },
  'it1p02-d2': { value: 0.6, tolerance: 0.01, unit: 'm' },

  'it1p03-magnitude': { value: 400, tolerance: 0.01, unit: 'N' },
  'it1p03-d2': { value: 0.25, tolerance: 0.01, unit: 'm' },
  'it1p03-total': { value: 1, tolerance: 0.01, unit: 'm' },

  'it1p04-magnitude': { value: 60, tolerance: 0.01, unit: 'N' },
  'it1p04-d1': { value: 0.9, tolerance: 0.01, unit: 'm' },
  'it1p04-d2': { value: 0.3, tolerance: 0.01, unit: 'm' },

  'it1p05-f2': { value: 160, tolerance: 0.01, unit: 'N' },
  'it1p05-elements': 'outside-larger',
  'it1p05-d1': { value: 0.8, tolerance: 0.01, unit: 'm' },
  'it1p05-total': { value: 0.6, tolerance: 0.01, unit: 'm' },

  /* FIXED-6: d₁ = 2 m (not 0.2 m) → d₂ = 0.5 m, d = 1.5 m. */
  'it1p06-elements': 'full',
  'it1p06-d2': { value: 0.5, tolerance: 0.01, unit: 'm' },
  'it1p06-total': { value: 1.5, tolerance: 0.01, unit: 'm' },

  /* FIXED-7: F₂ = 4 N (not 7 N) → F = 5 N, α = 53.1°. */
  'it1p07-elements': 'diagonal',
  'it1p07-magnitude': { value: 5, tolerance: 0.01, unit: 'N' },
  'it1p07-alpha': { value: 53.13, tolerance: 0.3, unit: null },

  'it1p08-magnitude': { value: 20, tolerance: 0.01, unit: 'N' },
  'it1p08-tan': { value: 0.75, tolerance: 0.005, unit: null },

  /* FIXED-9: F₁ = F₂ = 6 N (not 12 N) → F = 8.49 N, α = 45°. */
  'it1p09-elements': 'bisector',
  'it1p09-magnitude': { value: 8.49, tolerance: 0.02, unit: 'N' },
  'it1p09-alpha': { value: 45, tolerance: 0.5, unit: null },

  'it1p10-magnitude': { value: 28.28, tolerance: 0.02, unit: 'N' },
  'it1p10-shape': 'square-diagonal',

  'it1p11-construction': 'complete',
  'it1p11-elements': 'full',

  'it1p12-elements': 'inside',
  'it1p12-angle-effect': 'inverse',

  'it1p13-magnitude': { value: 86.6, tolerance: 0.3, unit: 'N' },
  'it1p13-elements': 'bisector',

  'it1p14-elements': 'bisector',
  'it1p14-magnitude': { value: 138.6, tolerance: 0.3, unit: 'N' },
  'it1p14-alpha': { value: 30, tolerance: 0.5, unit: null },
});

/* ==========================================================================
   Review layer — everything below is rendered ONLY inside the post-submission
   results screen, so it may safely state the correct answers in prose.
   ========================================================================== */

const solutionById = new Map(IT1_SOLUTIONS.map((entry) => [entry.problemId, entry]));

export function solutionForProblem(problemId) {
  return solutionById.get(problemId) ?? null;
}

/** Correct-answer prose per graded field (review only). */
export const ANSWER_PROSE = Object.freeze({
  'it1p01-magnitude': 'F = 60 N',
  'it1p01-d1': 'd₁ = 1.5 m',
  'it1p01-d2': 'd₂ = 0.5 m',

  'it1p02-magnitude': 'F = 80 N',
  'it1p02-elements': 'نقطة التأثير بين A وB وأقرب إلى القوة الأكبر F₁، والحامل موازٍ للحاملين، والجهة جهة القوتين، والشدة مجموع الشدتين = 80 N.',
  'it1p02-d1': 'd₁ = 0.2 m',
  'it1p02-d2': 'd₂ = 0.6 m',

  'it1p03-magnitude': 'F = 400 N',
  'it1p03-d2': 'd₂ = 0.25 m',
  'it1p03-total': 'd = d₁ + d₂ = 1 m',

  'it1p04-magnitude': 'F = 60 N (الجهة جهة F₂)',
  'it1p04-d1': 'd₁ = 0.9 m',
  'it1p04-d2': 'd₂ = 0.3 m',

  'it1p05-f2': 'F₂ = 120 + 40 = 160 N',
  'it1p05-elements': 'الجهة جهة القوة الكبرى F₂، والحامل على امتداد الحاملين، ونقطة التأثير خارج القطعة من جهة F₂.',
  'it1p05-d1': 'd₁ = 4 × 0.2 = 0.8 m',
  'it1p05-total': 'd = d₁ − d₂ = 0.6 m',

  'it1p06-elements': 'الشدة 150 N، والجهة جهة القوة الكبرى F₂، والحامل موازٍ للحاملين، ونقطة التأثير خارج القطعة من جهة F₂.',
  'it1p06-d2': 'd₂ = d₁ ÷ 4 = 0.5 m',
  'it1p06-total': 'd = d₁ − d₂ = 1.5 m',

  'it1p07-elements': 'نقطة التأثير O، والحامل القطر الخارج من O في متوازي الأضلاع، والجهة نحو الرأس المقابل.',
  'it1p07-magnitude': 'F = √(3² + 4²) = 5 N',
  'it1p07-alpha': 'α = 53.1°',

  'it1p08-magnitude': 'F = √(16² + 12²) = 20 N',
  'it1p08-tan': 'tan α = 12 ÷ 16 = 0.75',

  'it1p09-elements': 'القوتان متساويتان، فحامل المحصلة منصّف الزاوية بين الحاملين (45°)، ولا وجود لقوة كبرى هنا.',
  'it1p09-magnitude': 'F = √(6² + 6²) = 8.49 N',
  'it1p09-alpha': 'α = 45°',

  'it1p10-magnitude': 'F = 20√2 ≈ 28.28 N',
  'it1p10-shape': 'الشكل مربع، والمحصلة قطره الخارج من O وحاملها منصّف الزاوية القائمة.',

  'it1p11-construction': 'رسم الشعاعين من O، ثم إكمال متوازي الأضلاع، فالمحصلة هي القطر الخارج من O إلى الرأس المقابل.',
  'it1p11-elements': 'نقطة التأثير O، والحامل القطر داخل الزاوية، والجهة نحو الرأس المقابل، والشدة تُبيّن بطول قطر متوازي الأضلاع وفق مقياس الرسم.',

  'it1p12-elements': 'نقطة التأثير O، والحامل داخل الزاوية الحادة، والشدة بين فرق الشدتين ومجموعهما.',
  'it1p12-angle-effect': 'زيادة الزاوية تُنقص الشدة، ونقصانها يزيد الشدة حتى تبلغ المجموع عند انعدام الزاوية.',

  'it1p13-magnitude': 'F = 2 × 50 × cos 30° = 86.6 N',
  'it1p13-elements': 'القوتان متساويتان، فحامل المحصلة منصّف الزاوية ويصنع 30° مع حامل كل قوة.',

  'it1p14-elements': 'نقطة التأثير النقطة المشتركة، والحامل منصّف الزاوية، والجهة داخل الزاوية.',
  'it1p14-magnitude': 'F = 2 × 80 × cos 30° ≈ 138.6 N',
  'it1p14-alpha': 'α = 30°',
});

/**
 * The runtime's grouping contract: `ceil(questions / solutionGroupSize)` groups,
 * each carrying `items` whose length is `min(size, remaining)` and whose
 * `questionId`s follow question order. Built here from the public question
 * list, so the order can never drift from the test itself.
 */
export function buildSolutionGroups(questions, groupSize = 5) {
  const titles = [
    'المسائل 1–5 · القوى المتوازية · 17 علامة',
    'المسائل 6–10 · 13 علامة',
    'المسائل 11–14 · 9 علامات',
    'الحلول التكميلية',
  ];
  const groups = [];
  for (let start = 0, index = 0; start < questions.length; start += groupSize, index += 1) {
    const slice = questions.slice(start, start + groupSize);
    groups.push({
      id: `it1-group-${index + 1}`,
      title: titles[index] ?? `الأسئلة ${start + 1}–${start + slice.length}`,
      questionIds: slice.map((question) => question.id),
      items: slice.map((question) => SOLUTIONS[question.id]),
    });
  }
  return groups;
}

/**
 * Per-question review entries keyed by question id — the shape the runtime
 * renders (`answerHtml` + `explanationHtml`). The explanation is the worked
 * solution of the parent problem, which is why it also carries the solved
 * figure: this object only ever exists after submission.
 */
/* Compact per-question explanation: the correct answer plus the worked steps
   of its problem (KaTeX only). The illustrated version — with the solved
   figure — is rendered once per problem in the page's solutions panel, so the
   39 answer fields do not each carry a duplicate SVG. */
const stepsHtmlByProblem = new Map(IT1_SOLUTIONS.map((entry) => [entry.problemId, solutionSteps(entry.steps)]));

export const SOLUTIONS = Object.freeze(Object.fromEntries(IT1_QUESTIONS.map((question) => {
  const prose = ANSWER_PROSE[question.id] ?? '';
  const problem = IT1_PROBLEMS.find((item) => item.id === question.problemId);
  const steps = stepsHtmlByProblem.get(question.problemId) ?? '';
  return [question.id, Object.freeze({
    questionId: question.id,
    answerHtml: prose,
    explanationHtml: `<p>${prose}</p>${steps}`,
    problemTitle: problem?.title ?? '',
  })];
})));
/** Full worked solution for one problem (review only). */
export function workedSolutionHtml(problemId) {
  const entry = solutionById.get(problemId);
  const problem = IT1_PROBLEMS.find((item) => item.id === problemId);
  if (!entry || !problem) return '';
  return `<article class="it1-solution" data-solution="${problemId}">
    <header class="it1-solution-head">
      <span class="it1-solution-number" dir="ltr">${String(entry.number).padStart(2, '0')}</span>
      <div>
        <h3>المسألة ${entry.number} — ${problem.title}</h3>
        <p class="it1-solution-given">${problem.intro}</p>
      </div>
    </header>
    ${it1SolvedDiagram(problemId)}
    ${solutionSteps(entry.steps)}
    <p class="it1-solution-final"><strong>النتيجة:</strong> ${entry.answerSummaryHtml}</p>
  </article>`;
}

/** The 14 review blocks, in worksheet order. */
export function allWorkedSolutionsHtml() {
  return IT1_PROBLEMS.map((problem) => workedSolutionHtml(problem.id)).join('');
}

/**
 * The exact export the shared runtime validates at submission time.
 * Built from the public question list with the same group size the page hands
 * to `mountAssessment`, so the two can never disagree.
 */
export const SOLUTION_GROUPS = Object.freeze(buildSolutionGroups(IT1_QUESTIONS, 5).map((group) => Object.freeze({
  ...group,
  questionIds: Object.freeze(group.questionIds),
  items: Object.freeze(group.items),
})));

