/* ============================================================================
   Independent Test 1 — page entry.
   ----------------------------------------------------------------------------
   Reuses the platform's shared assessment runtime (`mountAssessment`) exactly
   as lesson-1/2 and unit-1/2 do; nothing about grading is re-implemented here.

   What is public before submission:
     IT1_TEST + IT1_QUESTIONS (statements, givens, options, givens-only figures)
   What is private until submission:
     it1-solutions.js — ANSWER_KEY + SOLUTIONS + solved figures, reached only
     through `loadSolutions: () => import('./it1-solutions.js')`, which the
     runtime awaits inside its confirm-submit handler. No static import of the
     key module exists anywhere in the pre-submission module graph.
   ========================================================================== */

import { mountAssessment } from './assessment-runtime.js';
import { it1GivenDiagram } from './it1-diagrams.js';
import { IT1_MARKS, IT1_PROBLEMS, IT1_QUESTIONS, IT1_TEST, IT1_TOTAL_MARKS } from './it1-problems.js';

/* Must stay in sync with the runtime's integrity check (groups × items). */
const SOLUTION_GROUP_SIZE = 5;

const el = (id) => document.getElementById(id);

/* ---------------------------------------------------------------- overview */
function renderOverview() {
  const host = el('it1-overview');
  if (!host) return;
  /* Collapsible by default on small screens: the test itself must stay close
     to the top of the page. */
  host.innerHTML = `
    <details class="it1-overview-details" open>
    <summary><span>بنية الاختبار والعلامات</span><span class="it1-overview-summary-meta">14 مسألة · ${IT1_QUESTIONS.length} مطلوباً · ${IT1_TOTAL_MARKS} علامة</span></summary>
    <div class="it1-overview-head">
      <h2>بنية الاختبار</h2>
      <p>${IT1_PROBLEMS.length} مسألة موزّعة كما في أوراق المصدر: 5 مسائل متوازية في الصفحة الأولى، و5 مسائل متلاقية في الصفحة الثانية، و4 مسائل متلاقية في الصفحة الثالثة. كل مطلوب في المسألة يُصحَّح مستقلاً.</p>
    </div>
    <ol class="it1-overview-list">
      ${IT1_MARKS.map((row) => {
        const problem = IT1_PROBLEMS.find((item) => item.id === row.problemId);
        return `<li class="it1-overview-item">
          <span class="it1-overview-num" dir="ltr">${String(row.number).padStart(2, '0')}</span>
          <div class="it1-overview-body">
            <p class="it1-overview-title">${problem.title}</p>
            <p class="it1-overview-meta">${problem.topic} · ${problem.asks.length} مطلوباً</p>
          </div>
          <span class="it1-overview-marks">${row.marks} ${row.marks === 1 ? 'علامة' : 'علامات'}</span>
        </li>`;
      }).join('')}
    </ol>
    <p class="it1-overview-total">مجموع العلامات: <strong>${IT1_TOTAL_MARKS}</strong> على ${IT1_QUESTIONS.length} مطلوباً.</p>
    </details>`;
}

/* ------------------------------------------------------- post-submit review */
/* The runtime renders its own per-question review; this panel adds the full
   worked solution for each of the 14 problems, with the solved figures. */
async function mountWorkedSolutions() {
  const section = el('it1-solutions');
  const root = el('assessment-root');
  if (!section || !root) return;
  section.hidden = false;
  const body = el('it1-solutions-body');
  if (body && !body.dataset.ready) {
    body.innerHTML = '<p class="it1-solutions-loading">جارٍ تحميل الحلول التفصيلية…</p>';
  }
  const module = await import('./it1-solutions.js');
  if (!body) return;
  body.innerHTML = module.allWorkedSolutionsHtml();
  body.dataset.ready = 'true';
  const heading = el('it1-solutions-title');
  heading?.focus({ preventScroll: true });
}

function wireReviewWatch() {
  const root = el('assessment-root');
  const section = el('it1-solutions');
  if (!root || !section) return;
  let loading = false;
  const sync = () => {
    const submitted = root.querySelector('#results-title') !== null;
    if (!submitted) {
      // Restarting (or any return to the test) must take the solutions away.
      section.hidden = true;
      return;
    }
    if (!section.hidden) return;
    if (loading) return;
    loading = true;
    void mountWorkedSolutions().finally(() => { loading = false; });
  };
  new MutationObserver(sync).observe(root, { childList: true, subtree: false });
  sync();
}

/* -------------------------------------------------------------------- boot */
renderOverview();
/* On phones the marks table starts collapsed so the test begins near the top. */
if (window.matchMedia('(max-width: 720px)').matches) {
  document.querySelector('.it1-overview-details')?.removeAttribute('open');
}

mountAssessment({
  test: IT1_TEST,
  questions: IT1_QUESTIONS,
  diagramMarkup: it1GivenDiagram,
  loadSolutions: () => import('./it1-solutions.js'),
  solutionGroupSize: SOLUTION_GROUP_SIZE,
  welcome: {
    sourceRange: '1–3',
    description: 'اختبار من 14 مسألة محسوبة: شدة محصلة قوتين متوازيتين بجهة واحدة وبجهتين متعاكستين، وموضع نقطة تأثير المحصلة وأبعادها، ثم محصلة قوتين متلاقيتين متعامدتين وبينهما زاوية حادة، مع الرسوم والإنشاء الهندسي.',
    topics: ['القوى المتوازية', 'القوى المتلاقية', 'نقطة التأثير', 'فيثاغورس', 'متوازي الأضلاع'],
    resultTitle: 'نتيجة الاختبار الأول — القوى المتلاقية والمتوازية',
  },
});

wireReviewWatch();
