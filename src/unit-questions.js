import {
  SUBPART_BY_ID,
  UNIT_QUESTIONS_SUBPARTS,
  computeOverallSummary,
  computeQuestionGroupSummary,
  createInitialUnitQuestionsState,
  defaultResponseFor,
  evaluateSubpart,
  getSubpartStatus,
  renderProblemOneDiagram,
  renderProblemTwoDiagram,
  renderQuestionTwoDiagram,
  renderUnitQuestions,
  statusLabelFor,
} from './unit-questions-content.js';

const STORAGE_KEY = 'physics8.unit1.questions.v2';

function loadPersistedState() {
  const fresh = createInitialUnitQuestionsState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.branches !== 'object') return fresh;
    for (const item of UNIT_QUESTIONS_SUBPARTS) {
      const saved = parsed.branches[item.id];
      if (!saved || typeof saved !== 'object') continue;
      fresh.branches[item.id] = {
        response: { ...defaultResponseFor(item.id), ...(saved.response ?? {}) },
        checked: Boolean(saved.checked),
        isCorrect: Boolean(saved.isCorrect),
        feedbackHtml: typeof saved.feedbackHtml === 'string' ? saved.feedbackHtml : '',
        hintLevel: Math.max(0, Math.min(item.hints.length, Number(saved.hintLevel) || 0)),
      };
    }
  } catch {
    /* Storage unavailable or malformed: continue safely in memory */
  }
  return fresh;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Private mode / quota exceeded: interactive session remains functional */
  }
}

const content = document.querySelector('#unit-question-content');
if (!content) throw new Error('Unit Questions content mount point is missing.');

let state = loadPersistedState();

function refreshDiagramsFor(subpartId) {
  if (subpartId === '2.1') {
    const card = content.querySelector('[data-source-subpart="2.1"]');
    const oldFig = card?.querySelector('[data-uq-diagram="q2"]');
    if (oldFig) {
      const b = state.branches['2.1'];
      oldFig.outerHTML = renderQuestionTwoDiagram(b.response, b.checked && b.isCorrect);
    }
  } else if (subpartId.startsWith('3.1.')) {
    const slot = content.querySelector('[data-diagram-slot="p1"]');
    if (slot) slot.innerHTML = renderProblemOneDiagram(state);
  } else if (subpartId.startsWith('3.2.')) {
    const slot = content.querySelector('[data-diagram-slot="p2"]');
    if (slot) slot.innerHTML = renderProblemTwoDiagram(state);
  }
}

function syncCardVisualState(subpartId, warningMessage = null) {
  const card = content.querySelector(`[data-source-subpart="${subpartId}"]`);
  if (!card) return;
  const item = SUBPART_BY_ID[subpartId];
  const branch = state.branches[subpartId];
  const status = getSubpartStatus(branch, subpartId);

  card.dataset.subpartStatus = status;
  card.className = `uq-subpart-card status-${status}`;

  const pill = card.querySelector('[data-status-pill]');
  if (pill) {
    pill.className = `uq-status-pill status-${status}`;
    pill.textContent = statusLabelFor(status);
  }

  if (item.type === 'mcq') {
    const chosen = branch.response?.choice || '';
    for (const optLi of card.querySelectorAll('[data-option-card]')) {
      const key = optLi.dataset.optionCard;
      const isSelected = key === chosen;
      optLi.classList.toggle('is-selected', isSelected);
      optLi.classList.toggle('is-checked-correct', Boolean(branch.checked && isSelected && branch.isCorrect));
      optLi.classList.toggle('is-checked-wrong', Boolean(branch.checked && isSelected && !branch.isCorrect));
    }
  }

  const hintBtn = card.querySelector('[data-action="hint"]');
  const hintBox = card.querySelector('[data-uq-hints]');
  const shown = branch.hintLevel || 0;
  const totalHints = item.hints.length;
  if (hintBtn) {
    hintBtn.disabled = shown >= totalHints;
    hintBtn.innerHTML = shown === 0
      ? `تلميح (<bdi dir="ltr">1/${totalHints}</bdi>)`
      : shown < totalHints
        ? `التلميح التالي (<bdi dir="ltr">${shown + 1}/${totalHints}</bdi>)`
        : `عُرض التلميحان (<bdi dir="ltr">${totalHints}/${totalHints}</bdi>)`;
  }
  if (hintBox) {
    if (shown > 0) {
      hintBox.hidden = false;
      hintBox.innerHTML = `<span class="uq-platform-chip">تلميح تعليمي من المنصة — لا يُحتسب إجابة</span>${
        item.hints.slice(0, shown).map((h, idx) => `<p><strong>تلميح ${idx + 1}:</strong> ${h}</p>`).join('')
      }`;
    } else {
      hintBox.hidden = true;
      hintBox.innerHTML = '';
    }
  }

  const resetBtn = card.querySelector('[data-action="reset-subpart"]');
  if (resetBtn) {
    resetBtn.hidden = status === 'unanswered' && shown === 0;
  }

  const fb = card.querySelector('[data-uq-feedback]');
  if (fb) {
    if (warningMessage) {
      fb.hidden = false;
      fb.className = 'uq-feedback is-warning';
      fb.innerHTML = `<p class="uq-fb-lead">${warningMessage}</p>`;
    } else if (branch.checked && branch.feedbackHtml) {
      fb.hidden = false;
      fb.className = `uq-feedback ${branch.isCorrect ? 'is-correct' : 'is-incorrect'}`;
      fb.innerHTML = branch.feedbackHtml;
    } else {
      fb.hidden = true;
      fb.className = 'uq-feedback';
      fb.innerHTML = '';
    }
  }
}

function syncOverallAndGroupUI() {
  const summary = computeOverallSummary(state);

  for (const key of ['q1', 'q2', 'q3', 'p1', 'p2']) {
    const group = summary.groups[key];
    for (const badge of document.querySelectorAll(`[data-group-badge="${key}"]`)) {
      badge.className = `uq-group-status status-${group.status}`;
      badge.textContent = group.badgeText;
    }
    for (const rail of document.querySelectorAll(`[data-rail-badge="${key}"]`)) {
      rail.className = `uq-rail-badge status-${group.status}`;
      rail.textContent = group.shortBadge;
    }
  }

  const checkedEl = document.querySelector('#uq-checked-count');
  const answeredStat = document.querySelector('#uq-answered-stat');
  const checkedStat = document.querySelector('#uq-checked-stat');
  const statusText = document.querySelector('#uq-progress-status');
  const fill = document.querySelector('#uq-progress-fill');
  const meter = document.querySelector('.uq-progress-meter');
  const checkAnsweredBtn = document.querySelector('#uq-check-answered');
  const finalChip = document.querySelector('#uq-final-chip');
  const finalValue = document.querySelector('#uq-final-value');
  const finalSummary = document.querySelector('#uq-final-summary');

  if (checkedEl) checkedEl.textContent = String(summary.checkedCount);
  if (answeredStat) answeredStat.textContent = `${summary.answeredCount} / ${summary.total}`;
  if (checkedStat) checkedStat.textContent = `${summary.checkedCount} / ${summary.total}`;
  if (meter) meter.setAttribute('aria-valuenow', String(summary.checkedCount));
  if (fill) fill.style.width = `${(summary.checkedCount / summary.total) * 100}%`;
  if (checkAnsweredBtn) checkAnsweredBtn.disabled = summary.uncheckedAnsweredIds.length === 0;

  if (summary.isFinal) {
    if (finalChip) finalChip.dataset.finalState = summary.correctCount === summary.total ? 'perfect' : 'complete';
    if (finalValue) finalValue.textContent = `${summary.correctCount} / ${summary.total}`;
    if (statusText) {
      statusText.textContent = summary.correctCount === summary.total
        ? `اكتمل التحقق من جميع الفروع الـ ${summary.total} — جميع إجاباتك صحيحة (${summary.correctCount}/${summary.total})!`
        : `اكتمل التحقق من جميع الفروع الـ ${summary.total} — النتيجة النهائية ${summary.correctCount} من ${summary.total}. يمكنك مراجعة الفروع غير الصحيحة وإعادة المحاولة.`;
    }
    if (finalSummary) {
      finalSummary.hidden = false;
      finalSummary.innerHTML = `
        <div class="uq-final-breakdown">
          <strong>تفصيل النتيجة النهائية (${summary.correctCount} / ${summary.total}):</strong>
          <span>السؤال الأول: <bdi dir="ltr">${summary.groups.q1.correctCount}/4</bdi></span>
          <span>السؤال الثاني: <bdi dir="ltr">${summary.groups.q2.correctCount}/1</bdi></span>
          <span>المسألة الأولى: <bdi dir="ltr">${summary.groups.p1.correctCount}/3</bdi></span>
          <span>المسألة الثانية: <bdi dir="ltr">${summary.groups.p2.correctCount}/3</bdi></span>
        </div>
      `;
    }
  } else {
    if (finalChip) finalChip.dataset.finalState = 'pending';
    if (finalValue) finalValue.textContent = 'بعد إتمام الفروع';
    if (finalSummary) {
      finalSummary.hidden = true;
      finalSummary.innerHTML = '';
    }
    if (statusText) {
      if (summary.checkedCount === 0 && summary.answeredCount === 0) {
        statusText.textContent = 'حالة التقييم: قيد الحل — أجب عن الفروع وتحقّق منها واحداً تلو الآخر لإظهار النتيجة النهائية.';
      } else {
        const remaining = summary.total - summary.checkedCount;
        statusText.textContent = `حالة التقييم: قيد المراجعة — تحقّقتَ من ${summary.checkedCount} من ${summary.total} (الصحيحة حالياً: ${summary.correctCount}). بقي ${remaining} لإظهار النتيجة النهائية.`;
      }
    }
  }
}

function handleFieldUpdate(target) {
  const field = target.dataset?.field;
  if (!field) return;
  const card = target.closest('[data-source-subpart]');
  if (!card) return;
  const id = card.dataset.sourceSubpart;
  const branch = state.branches[id];
  if (!branch) return;

  branch.response[field] = target.value;
  if (branch.checked) {
    branch.checked = false;
    branch.isCorrect = false;
    branch.feedbackHtml = '';
  }

  saveState(state);
  syncCardVisualState(id);
  refreshDiagramsFor(id);
  syncOverallAndGroupUI();
}

function runCheckOnSubpart(id) {
  const branch = state.branches[id];
  if (!branch) return;
  const result = evaluateSubpart(id, branch.response);
  if (!result.valid) {
    syncCardVisualState(id, result.message);
    return;
  }
  branch.checked = true;
  branch.isCorrect = result.isCorrect;
  branch.feedbackHtml = result.feedbackHtml;
  saveState(state);
  syncCardVisualState(id);
  refreshDiagramsFor(id);
  syncOverallAndGroupUI();
}

function resetSubpartInputsInDom(card, id) {
  const defaults = defaultResponseFor(id);
  for (const radio of card.querySelectorAll('input[type="radio"]')) {
    radio.checked = false;
  }
  for (const input of card.querySelectorAll('input[type="text"], textarea, select')) {
    const field = input.dataset.field;
    if (field && Object.hasOwn(defaults, field)) {
      input.value = defaults[field];
    }
  }
}

function mountAll() {
  content.innerHTML = renderUnitQuestions(state);
  content.setAttribute('aria-busy', 'false');
  syncOverallAndGroupUI();
}

content.addEventListener('input', (event) => {
  if (event.target.matches('input[type="text"], textarea')) {
    handleFieldUpdate(event.target);
  }
});

content.addEventListener('change', (event) => {
  if (event.target.matches('input[type="radio"], select')) {
    handleFieldUpdate(event.target);
  }
});

content.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.matches('input[type="text"]')) {
    event.preventDefault();
    const card = event.target.closest('[data-source-subpart]');
    if (card) runCheckOnSubpart(card.dataset.sourceSubpart);
  }
});

content.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.subpart;
  if (!id || !state.branches[id]) return;

  if (action === 'check') {
    runCheckOnSubpart(id);
  } else if (action === 'hint') {
    const item = SUBPART_BY_ID[id];
    const branch = state.branches[id];
    branch.hintLevel = Math.min(item.hints.length, (branch.hintLevel || 0) + 1);
    saveState(state);
    syncCardVisualState(id);
  } else if (action === 'reset-subpart') {
    state.branches[id] = {
      response: defaultResponseFor(id),
      checked: false,
      isCorrect: false,
      feedbackHtml: '',
      hintLevel: 0,
    };
    const card = content.querySelector(`[data-source-subpart="${id}"]`);
    if (card) resetSubpartInputsInDom(card, id);
    saveState(state);
    syncCardVisualState(id);
    refreshDiagramsFor(id);
    syncOverallAndGroupUI();
  }
});

document.querySelector('#uq-check-answered')?.addEventListener('click', () => {
  const summary = computeOverallSummary(state);
  for (const id of summary.uncheckedAnsweredIds) {
    runCheckOnSubpart(id);
  }
});

const resetConfirmBox = document.querySelector('#uq-reset-confirm');
document.querySelector('#uq-reset-all')?.addEventListener('click', () => {
  if (resetConfirmBox) {
    resetConfirmBox.hidden = false;
    document.querySelector('#uq-confirm-reset')?.focus();
  }
});

document.querySelector('#uq-cancel-reset')?.addEventListener('click', () => {
  if (resetConfirmBox) resetConfirmBox.hidden = true;
  document.querySelector('#uq-reset-all')?.focus();
});

document.querySelector('#uq-confirm-reset')?.addEventListener('click', () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  state = createInitialUnitQuestionsState();
  if (resetConfirmBox) resetConfirmBox.hidden = true;
  mountAll();
  document.querySelector('#uq-reset-all')?.focus();
});

mountAll();
