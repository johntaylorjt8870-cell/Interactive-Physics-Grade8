import {
  canRevealResults,
  canRevealSolutions,
  createAssessmentState,
  questionIsAnswered,
  recordAnswer,
  restartAssessment,
  startAssessment,
  submitAssessment,
  validateAnswerKey,
} from './lesson-test-engine.js';
import { ltrText } from './math.js';

/** Shared accessible assessment UI used by Lesson 2 and Unit 1 tests. */
export function mountAssessment({
  test: LESSON_TEST,
  questions: QUESTIONS,
  diagramMarkup: assessmentDiagramMarkup = () => '',
  loadSolutions,
  welcome = {},
  solutionGroupSize = 5,
}) {
if (!LESSON_TEST || !Array.isArray(QUESTIONS) || !QUESTIONS.length || typeof loadSolutions !== 'function') {
  throw new TypeError('Assessment configuration is incomplete.');
}

const root = document.querySelector('#assessment-root');
const dialog = document.querySelector('#assessment-dialog');
const dialogTitle = document.querySelector('#assessment-dialog-title');
const dialogMessage = document.querySelector('#assessment-dialog-message');
const dialogActions = document.querySelector('#assessment-dialog-actions');
const numberFormat = new Intl.NumberFormat('ar');
const difficultyLabels = Object.freeze({ basic: 'أساسي', medium: 'متوسط', advanced: 'متقدم', thinking: 'تفكير' });
const questionTypeLabels = Object.freeze({
  'single-choice': 'اختيار من متعدد',
  'true-false': 'صح أو خطأ',
  'multiple-select': 'اختيارات متعددة',
  numeric: 'إجابة رقمية',
  ordering: 'ترتيب',
  matching: 'مطابقة',
  'error-analysis': 'تحليل خطأ',
  'diagram-interpretation': 'قراءة رسم',
});

let state = createAssessmentState();
let dialogReturnFocus = null;
let submissionLock = false;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll("'", '&#39;');
}

function arabicCount(value) {
  return numberFormat.format(value);
}

function answeredCount() {
  return QUESTIONS.filter((question) => questionIsAnswered(question, state.answers[question.id])).length;
}

function numericUnitLabel(question) {
  if (question.numericUnit === 'N') return ltrText('N', 'newtons');
  if (question.numericUnit === 'cm') return ltrText('cm', 'centimeters');
  return 'عدد بلا وحدة';
}

function renderWelcome() {
  root.innerHTML = `<section class="test-welcome" aria-labelledby="welcome-title">
    <div class="test-welcome-copy">
      <p class="assessment-kicker">منطقة مستقلة عن مسار الدرس</p>
      <h1 id="welcome-title">منطقة الاختبارات</h1>
      <h2>${escapeHtml(LESSON_TEST.lesson)}</h2>
      <p class="test-welcome-context">${escapeHtml(LESSON_TEST.unit)} · صفحات المصدر ${ltrText(welcome.sourceRange ?? LESSON_TEST.sourcePages.join('–'))}</p>
      <p class="test-welcome-description">${escapeHtml(welcome.description ?? `اختبار من ${QUESTIONS.length} سؤالاً يغطي محتوى المسار المحدد.`)}</p>
      <ul class="test-welcome-list" aria-label="موضوعات الاختبار">
        ${(welcome.topics ?? []).map((topic) => `<li>${escapeHtml(topic)}</li>`).join('')}
      </ul>
    </div>
    <div class="test-welcome-action">
      <span class="test-number-emphasis" aria-hidden="true">${ltrText(String(QUESTIONS.length))}</span>
      <span class="test-number-caption">سؤالاً من محتوى الدرس</span>
      <button class="test-button test-start-button" type="button" data-action="start">ابدأ الاختبار <span aria-hidden="true">←</span></button>
      <p class="test-welcome-help">لا تُعرض صحة الإجابات أو الدرجة إلا بعد التسليم النهائي.</p>
    </div>
  </section>`;
}

function renderQuestionIndex(question, index, active) {
  const isAnswered = questionIsAnswered(question, state.answers[question.id]);
  const statusLabel = isAnswered ? 'تمت الإجابة' : 'بلا إجابة';
  return `<li><button class="question-index-button${active ? ' is-current' : ''}${isAnswered ? ' is-answered' : ''}"
      type="button" data-action="go-question" data-index="${index}"
      aria-label="السؤال ${arabicCount(index + 1)}، ${statusLabel}"${active ? ' aria-current="step"' : ''}>
      <span>${arabicCount(index + 1)}</span>${isAnswered ? '<span class="index-check" aria-hidden="true">●</span>' : ''}
    </button></li>`;
}

function renderChoiceAnswers(question, answer) {
  const multiple = question.type === 'multiple-select';
  const answerIds = multiple && Array.isArray(answer) ? answer : [];
  const selected = multiple ? answerIds : answer;
  const radioLabel = multiple ? 'اختر كل الإجابات المناسبة' : 'اختر إجابة واحدة';
  return `<fieldset class="answer-fieldset" aria-describedby="question-prompt question-instruction">
    <legend class="visually-hidden">${radioLabel}</legend>
    <ul class="answer-list">
      ${question.options.map((option) => {
        const inputId = `${question.id}-${option.id}`;
        const checked = multiple ? answerIds.includes(option.id) : selected === option.id;
        return `<li class="answer-option"><label for="${escapeHtml(inputId)}">
          <input id="${escapeHtml(inputId)}" type="${multiple ? 'checkbox' : 'radio'}" name="${escapeHtml(question.id)}"
            value="${escapeHtml(option.id)}" data-answer-control="${multiple ? 'multiple' : 'choice'}" data-answer-option="${escapeHtml(option.id)}"${checked ? ' checked' : ''} />
          <span class="answer-choice-copy">${option.content}</span>
        </label></li>`;
      }).join('')}
    </ul>
  </fieldset>`;
}

function renderNumericAnswer(question, answer) {
  const unit = numericUnitLabel(question);
  return `<div class="answer-number-wrap">
    <label for="${escapeHtml(question.id)}-numeric-answer">الإجابة بوحدة ${unit}</label>
    <input class="answer-number-input" id="${escapeHtml(question.id)}-numeric-answer" type="text" inputmode="decimal" autocomplete="off" spellcheck="false"
      dir="ltr" aria-describedby="question-prompt question-instruction ${escapeHtml(question.id)}-numeric-help" data-answer-control="numeric" value="${escapeHtml(answer ?? '')}" />
    <p class="answer-number-help" id="${escapeHtml(question.id)}-numeric-help">${question.inputHint}</p>
  </div>`;
}

function renderOrderingAnswer(question, answer) {
  const order = Array.isArray(answer) ? answer : [];
  return `<fieldset class="answer-fieldset" aria-describedby="question-prompt question-instruction">
    <legend class="visually-hidden">رتب الخطوات باختيار موضع لكل خطوة</legend>
    <ol class="ordering-list">
      ${question.items.map((item) => {
        const selectedPosition = order.indexOf(item.id);
        const options = question.items.map((_, position) => {
          const value = position + 1;
          return `<option value="${value}"${selectedPosition === position ? ' selected' : ''}>الموضع ${arabicCount(value)}</option>`;
        }).join('');
        const selectId = `${question.id}-order-${item.id}`;
        const itemLabelId = `${selectId}-item-label`;
        const selectLabelId = `${selectId}-position-label`;
        return `<li class="ordering-row">
          <span class="ordering-item-label" id="${escapeHtml(itemLabelId)}">${item.content}</span>
          <span class="ordering-position">
            <label id="${escapeHtml(selectLabelId)}" for="${escapeHtml(selectId)}">اختر موضعها</label>
            <select class="choice-select" id="${escapeHtml(selectId)}" data-answer-control="ordering" data-order-item="${escapeHtml(item.id)}" aria-labelledby="${escapeHtml(itemLabelId)} ${escapeHtml(selectLabelId)}">
              <option value=""${selectedPosition < 0 ? ' selected' : ''}>اختر الترتيب</option>${options}
            </select>
          </span>
        </li>`;
      }).join('')}
    </ol>
    <p class="answer-number-help">${question.inputHint} إذا اخترت موضعاً مستخدماً، يتبادل العنصران موضعيهما.</p>
  </fieldset>`;
}

function renderMatchingAnswer(question, answer) {
  const mapping = answer && typeof answer === 'object' ? answer : {};
  return `<fieldset class="answer-fieldset" aria-describedby="question-prompt question-instruction">
    <legend class="visually-hidden">طابق كل عنصر مع وصف واحد مختلف</legend>
    <ul class="matching-list">
      ${question.fields.map((field) => {
        const fieldId = `${question.id}-match-${field.id}`;
        const selectedElsewhere = new Set(question.fields.filter((candidate) => candidate.id !== field.id).map((candidate) => mapping[candidate.id]).filter(Boolean));
        const options = question.options.map((option) => `<option value="${escapeHtml(option.id)}"${mapping[field.id] === option.id ? ' selected' : ''}${selectedElsewhere.has(option.id) ? ' disabled' : ''}>${escapeHtml(option.selectLabel ?? option.content)}</option>`).join('');
        return `<li class="matching-row">
          <span class="matching-term" id="${escapeHtml(fieldId)}-label">${field.content}</span>
          <select class="choice-select" id="${escapeHtml(fieldId)}" data-answer-control="matching" data-match-field="${escapeHtml(field.id)}" aria-labelledby="${escapeHtml(fieldId)}-label">
            <option value=""${mapping[field.id] ? '' : ' selected'}>اختر الوصف</option>${options}
          </select>
        </li>`;
      }).join('')}
    </ul>
    <p class="answer-number-help">${question.inputHint} كل وصف يستخدم مرة واحدة.</p>
  </fieldset>`;
}

function renderAnswerControl(question, answer) {
  if (['single-choice', 'true-false', 'multiple-select', 'error-analysis', 'diagram-interpretation'].includes(question.type)) {
    return renderChoiceAnswers(question, answer);
  }
  if (question.type === 'numeric') return renderNumericAnswer(question, answer);
  if (question.type === 'ordering') return renderOrderingAnswer(question, answer);
  if (question.type === 'matching') return renderMatchingAnswer(question, answer);
  return '<p role="alert">تعذر عرض هذا النوع من الأسئلة.</p>';
}

function renderQuestion(question, index) {
  const answer = state.answers[question.id];
  const diagram = assessmentDiagramMarkup(question);
  const pages = question.sourcePages.map(String).join('، ');
  return `<section class="test-question-panel" aria-labelledby="question-heading">
    <article class="test-question">
      <div class="question-heading-row">
        <h2 id="question-heading" tabindex="-1">السؤال ${arabicCount(index + 1)} من ${arabicCount(QUESTIONS.length)}</h2>
        <div class="question-badges" aria-label="معلومات السؤال">
          <span class="question-badge difficulty-${escapeHtml(question.difficulty)}">المستوى: ${escapeHtml(difficultyLabels[question.difficulty])}</span>
          <span class="question-badge">${escapeHtml(questionTypeLabels[question.type])}</span>
        </div>
      </div>
      <p class="question-prompt" id="question-prompt">${question.prompt}</p>
      <p class="question-instruction" id="question-instruction">${question.inputHint ?? (question.type === 'multiple-select' ? 'يمكن اختيار أكثر من إجابة.' : 'اختر الإجابة التي تراها صحيحة.')}</p>
      <p class="question-source-ref">مرجع من الدرس: <bdi dir="rtl">ص ${ltrText(pages)}</bdi></p>
      ${diagram}
      ${renderAnswerControl(question, answer)}
      <div class="question-actions">
        <div class="question-actions-group">
          <button class="test-button quiet" type="button" data-action="previous"${index === 0 ? ' disabled' : ''} aria-label="الانتقال إلى السؤال السابق">السابق</button>
          ${index < QUESTIONS.length - 1
            ? '<button class="test-button secondary" type="button" data-action="next" aria-label="الانتقال إلى السؤال التالي">التالي</button>'
            : '<button class="test-button submit-test-button" type="button" data-action="attempt-submit">مراجعة التسليم</button>'}
        </div>
        <span class="question-actions-note">لا تظهر النتيجة قبل التسليم.</span>
      </div>
    </article>
  </section>`;
}

function renderSession({ focusHeading = false, focusSelector = null } = {}) {
  const currentQuestion = QUESTIONS[state.currentIndex];
  const count = answeredCount();
  const percentage = Math.round((count / QUESTIONS.length) * 100);
  root.innerHTML = `<section class="quiz-session" aria-labelledby="attempt-title">
    <h1 class="visually-hidden" id="attempt-title">اختبار ${escapeHtml(LESSON_TEST.lesson)}</h1>
    <div class="quiz-toolbar">
      <div class="quiz-toolbar-copy">
        <p class="quiz-attempt-label">${escapeHtml(LESSON_TEST.lesson)} · اختبار قيد الحل</p>
        <p class="quiz-progress-copy" id="quiz-progress-copy">تمت الإجابة عن ${arabicCount(count)} من ${arabicCount(QUESTIONS.length)}</p>
        <div class="quiz-progress-track" role="progressbar" aria-label="تقدم تسجيل الإجابات، وليس الدرجة" aria-valuemin="0" aria-valuemax="${QUESTIONS.length}" aria-valuenow="${count}" aria-valuetext="${arabicCount(count)} من ${arabicCount(QUESTIONS.length)} سؤالاً تمت الإجابة عنه">
          <span class="quiz-progress-fill" style="width:${percentage}%"></span>
        </div>
      </div>
      <div class="quiz-toolbar-actions">
        <span class="question-badge">${arabicCount(QUESTIONS.length)} سؤالاً</span>
        <button class="test-button quiet" type="button" data-action="restart">إعادة الاختبار</button>
      </div>
    </div>
    <div class="quiz-layout">
      <nav class="question-navigation" aria-label="التنقل بين أسئلة الاختبار">
        <h2>أسئلة الاختبار</h2>
        <p class="question-navigation-note">اختر رقماً للانتقال.</p>
        <ol class="question-index">${QUESTIONS.map((question, index) => renderQuestionIndex(question, index, index === state.currentIndex)).join('')}</ol>
        <div class="question-navigation-key" aria-label="مفتاح حالة الإجابة">
          <span><i class="key-swatch current" aria-hidden="true"></i> السؤال الحالي</span>
          <span><i class="key-swatch answered" aria-hidden="true"></i> تمت الإجابة</span>
        </div>
        <button class="test-button question-nav-submit" type="button" data-action="attempt-submit">تسليم الاختبار</button>
        <p class="question-nav-remaining" aria-live="polite">بلا إجابة: ${arabicCount(QUESTIONS.length - count)}</p>
      </nav>
      <div class="quiz-content">
        <p class="question-status" role="status" aria-live="polite">السؤال ${arabicCount(state.currentIndex + 1)} من ${arabicCount(QUESTIONS.length)}. لا تُعرض صحة الإجابة قبل التسليم النهائي.</p>
        ${renderQuestion(currentQuestion, state.currentIndex)}
      </div>
    </div>
  </section>`;
  if (focusHeading) root.querySelector('#question-heading')?.focus();
  if (focusSelector) root.querySelector(focusSelector)?.focus();
}

function updateSessionProgress() {
  if (state.status !== 'in-progress') return;
  const count = answeredCount();
  const remaining = QUESTIONS.length - count;
  const percentage = Math.round((count / QUESTIONS.length) * 100);
  const progressCopy = root.querySelector('#quiz-progress-copy');
  const progressBar = root.querySelector('[role="progressbar"]');
  const progressFill = root.querySelector('.quiz-progress-fill');
  const remainingText = root.querySelector('.question-nav-remaining');
  if (progressCopy) progressCopy.textContent = `تمت الإجابة عن ${arabicCount(count)} من ${arabicCount(QUESTIONS.length)}`;
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', String(count));
    progressBar.setAttribute('aria-valuetext', `${arabicCount(count)} من ${arabicCount(QUESTIONS.length)} سؤالاً تمت الإجابة عنه`);
  }
  if (progressFill) progressFill.style.width = `${percentage}%`;
  if (remainingText) remainingText.textContent = `بلا إجابة: ${arabicCount(remaining)}`;
  QUESTIONS.forEach((question, index) => {
    const button = root.querySelector(`[data-action="go-question"][data-index="${index}"]`);
    if (!button) return;
    const isAnswered = questionIsAnswered(question, state.answers[question.id]);
    button.classList.toggle('is-answered', isAnswered);
    button.setAttribute('aria-label', `السؤال ${arabicCount(index + 1)}، ${isAnswered ? 'تمت الإجابة' : 'بلا إجابة'}`);
    let check = button.querySelector('.index-check');
    if (isAnswered && !check) {
      check = document.createElement('span');
      check.className = 'index-check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = '●';
      button.append(check);
    } else if (!isAnswered && check) {
      check.remove();
    }
  });
}

function renderStudentAnswer(question, answer) {
  if (!questionIsAnswered(question, answer)) {
    if (answer === undefined || answer === null || answer === '' || (Array.isArray(answer) && answer.every((entry) => !entry))) return '<span>لم تُسجّل إجابة.</span>';
  }
  if (['single-choice', 'true-false', 'error-analysis', 'diagram-interpretation'].includes(question.type)) {
    return question.options.find((option) => option.id === answer)?.content ?? '<span>إجابة غير صالحة.</span>';
  }
  if (question.type === 'multiple-select') {
    const options = (Array.isArray(answer) ? answer : []).map((id) => question.options.find((option) => option.id === id)).filter(Boolean);
    return options.length ? `<ul>${options.map((option) => `<li>${option.content}</li>`).join('')}</ul>` : '<span>لم تُسجّل إجابة مكتملة.</span>';
  }
  if (question.type === 'numeric') {
    const unit = question.numericUnit ? ` ${escapeHtml(question.numericUnit)}` : '';
    return `<bdi dir="ltr">${escapeHtml(answer)}${unit}</bdi>`;
  }
  if (question.type === 'ordering') {
    const items = Array.isArray(answer) ? answer.map((id) => question.items.find((item) => item.id === id)).filter(Boolean) : [];
    return items.length ? `<ol>${items.map((item) => `<li>${item.content}</li>`).join('')}</ol>` : '<span>لم تُسجّل إجابة مكتملة.</span>';
  }
  if (question.type === 'matching') {
    const pairs = question.fields.map((field) => ({ field, option: question.options.find((option) => option.id === answer?.[field.id]) })).filter((pair) => pair.option);
    return pairs.length ? `<ul>${pairs.map(({ field, option }) => `<li><strong>${field.content}:</strong> ${option.content}</li>`).join('')}</ul>` : '<span>لم تُسجّل إجابة مكتملة.</span>';
  }
  return '<span>لم تُسجّل إجابة.</span>';
}

function renderSolutionItem(question, solution, index, correctIds) {
  const correct = correctIds.has(question.id);
  const answer = state.answers[question.id];
  const answered = questionIsAnswered(question, answer);
  const verdict = correct ? 'إجابة صحيحة' : answered ? 'إجابة غير صحيحة' : 'لم تتم الإجابة';
  const diagram = assessmentDiagramMarkup(question);
  return `<article class="solution-item" aria-labelledby="solution-${question.id}-heading">
    <h3 class="solution-item-heading" id="solution-${question.id}-heading">
      <span>السؤال ${arabicCount(index + 1)}</span><span class="solution-verdict">${verdict}</span>
    </h3>
    <p class="solution-question-prompt">${question.prompt}</p>
    ${diagram}
    <p class="solution-student-answer"><strong>إجابتك:</strong> ${renderStudentAnswer(question, answer)}</p>
    <p class="solution-correct-answer"><strong>الإجابة الصحيحة:</strong> ${solution.answerHtml}</p>
    <div class="solution-explanation">${solution.explanationHtml}</div>
  </article>`;
}

function renderResults(solutionModule, { focusHeading = false } = {}) {
  if (!canRevealResults(state) || !canRevealSolutions(state)) return;
  const { SOLUTION_GROUPS, SOLUTIONS } = solutionModule;
  const correctIds = new Set(state.results.correctQuestionIds);
  const groupsMarkup = SOLUTION_GROUPS.map((group, groupIndex) => {
    const itemsMarkup = group.items.map((solution) => {
      const questionIndex = QUESTIONS.findIndex((question) => question.id === solution.questionId);
      const question = QUESTIONS[questionIndex];
      return renderSolutionItem(question, SOLUTIONS[question.id], questionIndex, correctIds);
    }).join('');
    return `<details class="solution-group"${groupIndex === 0 ? ' open' : ''}>
      <summary>${escapeHtml(group.title)}</summary>
      <div class="solution-group-body">${itemsMarkup}</div>
    </details>`;
  }).join('');
  root.innerHTML = `<section class="assessment-results" aria-labelledby="results-title">
    <div class="result-hero">
      <div class="result-hero-copy">
        <p class="assessment-kicker">تم التسليم بنجاح</p>
        <h1 id="results-title" tabindex="-1">${escapeHtml(welcome.resultTitle ?? `نتيجة اختبار ${LESSON_TEST.lesson}`)}</h1>
        <p>هذه النتيجة تظهر بعد التسليم النهائي فقط. اقرأ خطوات الحل في المجموعات الصغيرة أدناه.</p>
      </div>
      <div class="result-score" role="group" aria-label="ملخص النتيجة">
        <div class="result-score-main"><strong>${ltrText(`${state.results.correct}/${state.results.total}`)}</strong><span>الدرجة</span></div>
        <span class="result-score-divider" aria-hidden="true"></span>
        <div class="result-stat"><strong>${ltrText(String(state.results.correct))}</strong><span>صحيحة</span></div>
        <div class="result-stat"><strong>${ltrText(String(state.results.incorrect))}</strong><span>غير صحيحة</span></div>
        <div class="result-stat"><strong>${ltrText(`${state.results.percentage}%`)}</strong><span>النسبة</span></div>
      </div>
    </div>
    <div class="result-review-heading">
      <h2>الإجابات والحلول التفسيرية</h2>
      <p>التقسيم حسب أرقام الأسئلة؛ افتح المجموعة لقراءة الحلول.</p>
    </div>
    <div class="solution-groups">${groupsMarkup}</div>
    <div class="results-restart-row"><button class="test-button secondary" type="button" data-action="restart">إعادة الاختبار</button></div>
  </section>`;
  if (focusHeading) root.querySelector('#results-title')?.focus();
}

function openDialog({ title, message, actions, returnFocus = document.activeElement }) {
  dialogReturnFocus = returnFocus;
  dialogTitle.textContent = title;
  dialogMessage.textContent = message;
  dialogActions.replaceChildren();
  actions.forEach((action) => {
    const button = document.createElement('button');
    button.className = `test-button ${action.style ?? 'quiet'}`;
    button.type = 'button';
    button.dataset.dialogAction = action.id;
    button.textContent = action.label;
    dialogActions.append(button);
  });
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  dialogActions.querySelector('button')?.focus();
}

function closeDialog() {
  if (typeof dialog.close === 'function' && dialog.open) dialog.close();
  else dialog.removeAttribute('open');
  const target = dialogReturnFocus;
  dialogReturnFocus = null;
  if (target?.isConnected) target.focus();
}

function confirmSubmit() {
  if (state.status !== 'in-progress' || submissionLock) return;
  const completed = answeredCount();
  const unanswered = QUESTIONS.length - completed;
  const missingMessage = unanswered
    ? ` لم تتم الإجابة عن ${arabicCount(unanswered)} سؤالاً؛ ستُحتسب بلا إجابة ضمن الإجابات غير الصحيحة.`
    : ' أجبت عن جميع الأسئلة.';
  openDialog({
    title: 'تأكيد تسليم الاختبار',
    message: `${missingMessage} بعد التسليم ستظهر الدرجة والإجابات الصحيحة والحلول، ولن تتمكن من تعديل المحاولة الحالية.`,
    actions: [
      { id: 'cancel-submit', label: 'العودة إلى الاختبار', style: 'quiet' },
      { id: 'confirm-submit', label: 'تأكيد التسليم', style: 'secondary' },
    ],
  });
}

function confirmRestart() {
  const submitted = state.status === 'submitted';
  openDialog({
    title: 'إعادة الاختبار من البداية؟',
    message: submitted
      ? 'سيُمحى ملخص النتيجة والإجابات الحالية وتبدأ محاولة جديدة من السؤال الأول. لا يمكن استعادة هذه المحاولة.'
      : 'سيُمحى كل ما أدخلته في هذه المحاولة وتبدأ من السؤال الأول. لا يمكن استعادة الإجابات بعد المسح.',
    actions: [
      { id: 'cancel-restart', label: 'متابعة المحاولة الحالية', style: 'quiet' },
      { id: 'confirm-restart', label: 'مسح الإجابات والبدء من جديد', style: 'secondary' },
    ],
  });
}

async function finalizeSubmission() {
  if (state.status !== 'in-progress' || submissionLock) return;
  submissionLock = true;
  const confirmButton = dialogActions.querySelector('[data-dialog-action="confirm-submit"]');
  if (confirmButton) {
    confirmButton.disabled = true;
    confirmButton.textContent = 'جارٍ التسليم…';
  }
  try {
    const solutionModule = await loadSolutions();
    const invalidKeys = QUESTIONS.filter((question) => !validateAnswerKey(question, solutionModule.ANSWER_KEY?.[question.id]));
    const groupsAreValid = Array.isArray(solutionModule.SOLUTION_GROUPS)
      && solutionModule.SOLUTION_GROUPS.length === Math.ceil(QUESTIONS.length / solutionGroupSize)
      && solutionModule.SOLUTION_GROUPS.every((group, index) => group.items?.length === Math.min(solutionGroupSize, QUESTIONS.length - index * solutionGroupSize))
      && QUESTIONS.every((question) => Boolean(solutionModule.SOLUTIONS?.[question.id]?.explanationHtml));
    if (invalidKeys.length > 0 || !groupsAreValid) throw new Error('Assessment content failed integrity validation.');
    const previousState = state;
    const submitted = submitAssessment(state, QUESTIONS, solutionModule.ANSWER_KEY);
    if (submitted.status !== 'submitted') throw new Error('Submission was not accepted.');
    state = submitted;
    try {
      renderResults(solutionModule);
    } catch (error) {
      state = previousState;
      throw error;
    }
    closeDialog();
    root.querySelector('#results-title')?.focus();
  } catch (error) {
    submissionLock = false;
    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.textContent = 'تأكيد التسليم';
    }
    dialogMessage.textContent = 'تعذر إتمام التسليم الآن. لم تُعرض نتيجة؛ أغلق هذه النافذة وحاول مرة أخرى.';
  }
}

function beginNewAttempt() {
  submissionLock = false;
  state = startAssessment(restartAssessment());
  closeDialog();
  renderSession({ focusHeading: true });
}

function goToQuestion(index) {
  if (state.status !== 'in-progress') return;
  state = { ...state, currentIndex: index };
  renderSession({ focusHeading: true });
}

root.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  const action = actionButton.dataset.action;
  if (action === 'start') {
    state = startAssessment(state);
    renderSession({ focusHeading: true });
  } else if (action === 'go-question') {
    goToQuestion(Number(actionButton.dataset.index));
  } else if (action === 'previous') {
    goToQuestion(Math.max(0, state.currentIndex - 1));
  } else if (action === 'next') {
    goToQuestion(Math.min(QUESTIONS.length - 1, state.currentIndex + 1));
  } else if (action === 'attempt-submit') {
    confirmSubmit();
  } else if (action === 'restart') {
    confirmRestart();
  }
});

root.addEventListener('change', (event) => {
  if (state.status !== 'in-progress') return;
  const control = event.target.closest('[data-answer-control]');
  if (!control) return;
  const question = QUESTIONS[state.currentIndex];
  const mode = control.dataset.answerControl;
  if (mode === 'choice') {
    state = recordAnswer(state, question, control.value);
    updateSessionProgress();
  } else if (mode === 'multiple') {
    const values = [...root.querySelectorAll('[data-answer-control="multiple"]:checked')].map((input) => input.value);
    state = recordAnswer(state, question, values);
    updateSessionProgress();
  } else if (mode === 'ordering') {
    const current = Array.isArray(state.answers[question.id]) ? [...state.answers[question.id]] : Array(question.items.length).fill('');
    const itemId = control.dataset.orderItem;
    const currentPosition = current.indexOf(itemId);
    const nextPosition = control.value === '' ? -1 : Number(control.value) - 1;
    if (currentPosition >= 0 && nextPosition < 0) current[currentPosition] = '';
    else if (nextPosition >= 0 && nextPosition < current.length) {
      const displaced = current[nextPosition];
      if (currentPosition >= 0 && currentPosition !== nextPosition) {
        current[currentPosition] = displaced || '';
      } else if (currentPosition < 0 && displaced) {
        const emptyPosition = current.findIndex((value, index) => index !== nextPosition && !value);
        if (emptyPosition >= 0) current[emptyPosition] = displaced;
      }
      current[nextPosition] = itemId;
    }
    state = recordAnswer(state, question, current);
    renderSession({ focusSelector: `[data-order-item="${itemId}"]` });
  } else if (mode === 'matching') {
    const current = state.answers[question.id] && typeof state.answers[question.id] === 'object' ? { ...state.answers[question.id] } : {};
    current[control.dataset.matchField] = control.value;
    state = recordAnswer(state, question, current);
    renderSession({ focusSelector: `[data-match-field="${control.dataset.matchField}"]` });
  }
});

root.addEventListener('input', (event) => {
  if (state.status !== 'in-progress') return;
  const input = event.target.closest('[data-answer-control="numeric"]');
  if (!input) return;
  const question = QUESTIONS[state.currentIndex];
  state = recordAnswer(state, question, input.value);
  updateSessionProgress();
});

dialogActions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-dialog-action]');
  if (!button) return;
  switch (button.dataset.dialogAction) {
    case 'cancel-submit':
    case 'cancel-restart':
      closeDialog();
      break;
    case 'confirm-submit':
      void finalizeSubmission();
      break;
    case 'confirm-restart':
      beginNewAttempt();
      break;
    default:
      break;
  }
});

dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeDialog();
});

renderWelcome();
}
