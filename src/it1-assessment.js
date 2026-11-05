/* Independent Test 1 is hosted inside the central independent-tests page.
 * One panel/tab contains one complete problem; answer keys, worked solutions,
 * and solved diagrams are dynamically imported only after submission.
 */
import {
  createAssessmentState,
  questionIsAnswered,
  recordAnswer,
  startAssessment,
  submitAssessment,
} from './lesson-test-engine.js';
import { IT1_PROBLEMS, IT1_QUESTIONS, IT1_TOTAL_MARKS } from './it1-problems.js';

const ORDINALS = Object.freeze([
  'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة',
  'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة', 'الثانية عشرة',
  'الثالثة عشرة', 'الرابعة عشرة',
]);
const byQuestionId = new Map(IT1_QUESTIONS.map((question) => [question.id, question]));
let state = createAssessmentState();
let currentProblem = 0;
let submitted = false;
let solutionModule = null;

const htmlEscape = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function questionFor(problem, ask) {
  return byQuestionId.get(`${problem.id}-${ask.id}`);
}

function responseMarkup(question, ask, problemNumber) {
  const id = `it1-answer-${question.id}`;
  const hintId = `${id}-hint`;
  const label = ask.label;
  if (question.type === 'numeric') {
    const unit = question.numericUnit
      ? `<span class="it1-answer-unit" dir="ltr">${htmlEscape(question.numericUnit)}</span>`
      : '';
    return `<div class="it1-answer-control it1-numeric-control">
      <label class="visually-hidden" for="${id}">${label}</label>
      <input id="${id}" name="${id}" type="text" inputmode="decimal" autocomplete="off" dir="ltr"
        data-answer-control data-question-id="${question.id}" aria-describedby="${hintId}" />
      ${unit}
    </div><p class="it1-answer-hint" id="${hintId}">${ask.inputHint}</p>`;
  }
  const options = (question.options ?? []).map((option, index) => {
    const optionId = `${id}-option-${index + 1}`;
    return `<label class="it1-choice-option" for="${optionId}">
      <input id="${optionId}" type="radio" name="${id}" value="${htmlEscape(option.id)}"
        data-answer-control data-question-id="${question.id}" />
      <span>${option.content}</span>
    </label>`;
  }).join('');
  return `<fieldset class="it1-choice-group" aria-describedby="${hintId}">
    <legend class="visually-hidden">إجابة المطلوب ${problemNumber}</legend>${options}
  </fieldset><p class="it1-answer-hint" id="${hintId}">${ask.inputHint}</p>`;
}

function problemPanel(problem, index) {
  const number = index + 1;
  const askRows = problem.asks.map((ask, askIndex) => {
    const question = questionFor(problem, ask);
    return `<li class="it1-task" data-question-id="${question.id}">
      <div class="it1-task-prompt">${ask.label}</div>
      <div class="it1-task-answer">${responseMarkup(question, ask, askIndex + 1)}</div>
      <p class="it1-answer-feedback" data-feedback-for="${question.id}" hidden></p>
    </li>`;
  }).join('');
  const givenItems = problem.givens.map((value) => `<li><bdi dir="ltr" class="it1-given-value">${htmlEscape(value)}</bdi></li>`).join('');
  return `<section class="it1-problem-panel" role="tabpanel" id="it1-panel-${number}"
      aria-labelledby="it1-tab-${number}" data-problem-panel="${index}"${index === 0 ? '' : ' hidden'}>
    <header class="it1-problem-heading">
      <span class="it1-problem-number" dir="ltr">${String(number).padStart(2, '0')}</span>
      <div><p class="it1-current-count">المسألة <bdi dir="ltr">${number} من 14</bdi></p>
        <h3>المسألة ${ORDINALS[index]}</h3></div>
    </header>
    <section class="it1-question-statement" aria-labelledby="it1-statement-title-${number}">
      <h4 id="it1-statement-title-${number}">نص المسألة</h4>
      <p>${problem.intro}</p>
    </section>
    <section class="it1-givens-block" aria-labelledby="it1-givens-title-${number}">
      <h4 id="it1-givens-title-${number}">المعطيات</h4>
      <ul class="it1-givens-list">${givenItems}</ul>
      ${problem.conditions ? `<p class="it1-condition">${problem.conditions}</p>` : ''}
    </section>
    <section class="it1-asks-block" aria-labelledby="it1-asks-title-${number}">
      <h4 id="it1-asks-title-${number}">المطلوب والإجابة</h4>
      <ol class="it1-task-list">${askRows}</ol>
    </section>
    <section class="it1-solution-slot" data-solution-slot="${problem.id}" aria-label="حل ${ORDINALS[index]}" hidden></section>
  </section>`;
}

function tabMarkup(index) {
  const number = index + 1;
  return `<button type="button" class="it1-problem-tab" role="tab" id="it1-tab-${number}"
    aria-controls="it1-panel-${number}" aria-selected="${index === 0 ? 'true' : 'false'}"
    tabindex="${index === 0 ? '0' : '-1'}" data-problem-tab="${index}">
    <span class="it1-tab-number" dir="ltr">${number}</span>
    <span>المسألة ${ORDINALS[index]}</span>
  </button>`;
}

function renderApp(root) {
  root.classList.add('it1-page');
  root.innerHTML = `<section class="it1-assessment" dir="rtl" aria-label="الاختبار الأول: القوى المتلاقية والمتوازية">
    <header class="it1-exam-header" aria-label="ملخص الاختبار">
      <span>14 مسألة</span><span><bdi dir="ltr">${IT1_TOTAL_MARKS}</bdi> مطلوباً مُقيّماً</span><span>الإجابات والحلول بعد التسليم</span>
    </header>
    <p class="it1-live-status" id="it1-live-status" role="status" aria-live="polite">المسألة 1 من 14</p>
    <div class="it1-tab-scroll" tabindex="0" aria-label="شريط تبويبات المسائل">
      <div class="it1-problem-tabs" role="tablist" aria-label="مسائل الاختبار الأربع عشرة" data-it1-tablist>
        ${IT1_PROBLEMS.map((_, index) => tabMarkup(index)).join('')}
      </div>
    </div>
    <div class="it1-panels">${IT1_PROBLEMS.map(problemPanel).join('')}</div>
    <footer class="it1-submit-row" data-submit-row>
      <p class="it1-progress-copy" id="it1-progress-copy" aria-live="polite">تمت الإجابة عن 0 من ${IT1_QUESTIONS.length} مطلوباً.</p>
      <button type="button" class="it1-submit-button" data-it1-submit>تسليم الإجابات</button>
    </footer>
    <section class="it1-result-summary" id="it1-result-summary" role="status" aria-live="polite" tabindex="-1" hidden></section>
  </section>`;
  wireTabs(root);
  wireAnswers(root);
  root.querySelector('[data-it1-submit]')?.addEventListener('click', () => void submit(root));
  syncProgress(root);
}

function activateProblem(root, index, { focus = false } = {}) {
  const safeIndex = Math.max(0, Math.min(index, IT1_PROBLEMS.length - 1));
  currentProblem = safeIndex;
  root.querySelectorAll('[data-problem-tab]').forEach((tab, tabIndex) => {
    const active = tabIndex === safeIndex;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });
  root.querySelectorAll('[data-problem-panel]').forEach((panel, panelIndex) => {
    panel.hidden = panelIndex !== safeIndex;
  });
  const status = root.querySelector('#it1-live-status');
  if (status) status.textContent = `المسألة ${safeIndex + 1} من ${IT1_PROBLEMS.length}`;
}

function wireTabs(root) {
  const tablist = root.querySelector('[data-it1-tablist]');
  tablist?.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-problem-tab]');
    if (tab) activateProblem(root, Number(tab.dataset.problemTab));
  });
  tablist?.addEventListener('keydown', (event) => {
    const tab = event.target.closest('[data-problem-tab]');
    if (!tab) return;
    const current = Number(tab.dataset.problemTab);
    let next = null;
    if (event.key === 'ArrowLeft') next = (current + 1) % IT1_PROBLEMS.length;
    if (event.key === 'ArrowRight') next = (current - 1 + IT1_PROBLEMS.length) % IT1_PROBLEMS.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = IT1_PROBLEMS.length - 1;
    if (next !== null) {
      event.preventDefault();
      activateProblem(root, next, { focus: true });
    }
  });
}

function readControlValue(root, question) {
  if (question.type === 'numeric') {
    return root.querySelector(`[data-answer-control][data-question-id="${question.id}"]`)?.value ?? '';
  }
  return root.querySelector(`[data-answer-control][data-question-id="${question.id}"]:checked`)?.value ?? '';
}

function wireAnswers(root) {
  root.addEventListener('input', (event) => {
    const control = event.target.closest('[data-answer-control]');
    if (!control || submitted) return;
    const question = byQuestionId.get(control.dataset.questionId);
    if (!question) return;
    state = recordAnswer(state, question, readControlValue(root, question));
    syncProgress(root);
  });
  root.addEventListener('change', (event) => {
    const control = event.target.closest('[data-answer-control]');
    if (!control || submitted || control.type !== 'radio') return;
    const question = byQuestionId.get(control.dataset.questionId);
    if (!question) return;
    state = recordAnswer(state, question, readControlValue(root, question));
    syncProgress(root);
  });
}

function syncProgress(root) {
  const count = IT1_QUESTIONS.filter((question) => questionIsAnswered(question, state.answers[question.id])).length;
  const copy = root.querySelector('#it1-progress-copy');
  if (copy) copy.textContent = `تمت الإجابة عن ${count} من ${IT1_QUESTIONS.length} مطلوباً.`;
}

async function submit(root) {
  if (submitted) return;
  const button = root.querySelector('[data-it1-submit]');
  if (button) {
    button.disabled = true;
    button.textContent = 'جارٍ تصحيح الإجابات…';
  }
  try {
    // The answer key and the code that creates solved figures are not requested
    // or present in the pre-submit module graph.
    solutionModule = await import('./it1-solutions.js');
    for (const question of IT1_QUESTIONS) {
      if (!solutionModule.ANSWER_KEY[question.id]) throw new Error(`Missing key: ${question.id}`);
    }
    state = submitAssessment(state, IT1_QUESTIONS, solutionModule.ANSWER_KEY);
    submitted = true;

    for (const problem of IT1_PROBLEMS) {
      const slot = root.querySelector(`[data-solution-slot="${problem.id}"]`);
      if (!slot) continue;
      slot.innerHTML = solutionModule.workedSolutionHtml(problem.id);
      slot.hidden = false;
    }
    for (const question of IT1_QUESTIONS) {
      const feedback = root.querySelector(`[data-feedback-for="${question.id}"]`);
      if (!feedback) continue;
      const answer = solutionModule.ANSWER_PROSE[question.id] ?? '';
      const correct = state.results.correctQuestionIds.includes(question.id);
      feedback.textContent = `${correct ? 'إجابة صحيحة' : (state.answers[question.id] ? 'راجع الإجابة' : 'لم تتم الإجابة')}. ${answer}`;
      feedback.hidden = false;
    }
    root.querySelectorAll('[data-answer-control]').forEach((control) => { control.disabled = true; });
    if (button) button.remove();
    const summary = root.querySelector('#it1-result-summary');
    if (summary) {
      summary.innerHTML = `<h3>نتيجة الاختبار</h3><p>الإجابات الصحيحة: <bdi dir="ltr">${state.results.correct} / ${state.results.total}</bdi> · النسبة: <bdi dir="ltr">${state.results.percentage}%</bdi></p><p>ظهرت الحلول والرسومات بعد التسليم.</p>`;
      summary.hidden = false;
      summary.focus?.({ preventScroll: true });
    }
    root.querySelectorAll('[data-problem-tab]').forEach((tab) => { tab.disabled = false; });
  } catch (error) {
    console.error('Independent Test 1 submission failed', error);
    if (button) {
      button.disabled = false;
      button.textContent = 'تعذّر التصحيح — أعد المحاولة';
    }
  }
}

export function mountIndependentTest1(root) {
  if (!root) return;
  state = startAssessment(createAssessmentState());
  currentProblem = 0;
  submitted = false;
  solutionModule = null;
  renderApp(root);
  activateProblem(root, 0);
}

export { ORDINALS };
