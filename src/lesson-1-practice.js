import { DIAGRAMS } from './diagrams.js';
import { SELF_CHECK_ANSWERS } from './self-check-answers.js';
import { PRACTICE_DECK, PRACTICE_LEVELS, TEXTBOOK_PROBLEMS } from './lesson-1-practice-data.js';
import {
  clearChoice,
  clearChoices,
  commitChoice,
  loadChoices,
  readChoice,
  revealCorrection,
  revealHint,
  saveChoices,
  selectChoice,
  summarizeChoices,
} from './lesson-1-choice-state.js';

/* --- 0. Shared answer state for every «اختر الإجابة» widget in Lesson 1 ----
   `src/main.js` re-renders the whole stage on each step change, so a radio that
   is only checked in the DOM loses the choice, the verdict and the hint level as
   soon as the student navigates away and back. The state lives in
   `lesson-1-choice-state.js` (pure reducers) plus a module-level map here, and is
   mirrored to localStorage best-effort so a reload does not wipe the attempt
   either. Nothing is graded before the student presses a check button. */

let choiceState = loadChoices();

function setChoiceState(next) {
  choiceState = next;
  saveChoices(choiceState);
}

const selfCheckStateKey = (key) => `selfcheck:${key}`;
const deckStateKey = (id) => `deck:${id}`;
const inquiryStateKey = (name) => `inquiry:${name}`;

const ARABIC_DIGITS = Object.freeze(['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']);

/** Arabic-Indic digits, to match the printed lesson counters. */
function arabicDigits(value) {
  return String(value).replace(/[0-9]/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

/** The answer key already opens some option feedback with the verdict; the
    wrapper adds it too, so strip the duplicate instead of repeating it. */
function withoutLead(text, lead) {
  const value = String(text ?? '').trim();
  return value.startsWith(lead) ? value.slice(lead.length).trim() : value;
}

/* --- 1. Enhanced Textbook Self-Check (pp. 61-62) ------------------------- */

function injectQuestionHintsAndFeedback(questionEl, key) {
  const answer = SELF_CHECK_ANSWERS[key];
  if (!answer || questionEl.dataset.l1Enhanced === 'true') return;
  questionEl.dataset.l1Enhanced = 'true';

  const optionsGrid = questionEl.querySelector('.options-grid');
  if (!optionsGrid) return;

  const RadioName = `self-check-${key}`;
  const stateKey = selfCheckStateKey(key);
  const optionCards = [...optionsGrid.querySelectorAll('.option-card[data-option]')];
  const codes = optionCards.map((card) => card.dataset.option);

  for (const option of optionCards) {
    const code = option.dataset.option;
    if (option.querySelector('input[type="radio"]')) continue;
    // The card becomes one big hit area: the whole label fills it, so a tap near
    // the border is a real tap instead of a dead zone (worst on phones).
    option.classList.add('is-choice');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.className = 'self-check-radio';
    radio.name = RadioName;
    radio.value = code;
    const textWrap = document.createElement('span');
    textWrap.className = 'self-check-option-text';
    while (option.firstChild) textWrap.append(option.firstChild);
    const label = document.createElement('label');
    label.className = 'self-check-option-label';
    label.append(radio, textWrap);
    option.append(label);
  }

  // name the radio group after the printed question so screen readers read it
  const promptEl = questionEl.querySelector(':scope > p');
  if (promptEl) {
    if (!promptEl.id) promptEl.id = `self-check-prompt-${key}`;
    optionsGrid.setAttribute('role', 'radiogroup');
    optionsGrid.setAttribute('aria-labelledby', promptEl.id);
  }

  const tools = document.createElement('div');
  tools.className = 'l1-question-tools';
  tools.innerHTML = `
    <div class="l1-question-tool-buttons">
      <button type="button" class="l1-btn l1-btn-hint" data-q-hint>تلميح تدريجي (١/٢)</button>
      <button type="button" class="l1-btn l1-btn-check" data-q-check>تحقّق من هذه الفقرة</button>
      <button type="button" class="l1-btn l1-btn-ghost" data-q-reveal hidden>اعرض التصحيح</button>
      <button type="button" class="l1-btn l1-btn-ghost" data-q-retry hidden>أعد المحاولة</button>
    </div>
    <div class="l1-hint-box" data-q-hint-box hidden></div>
    <div class="l1-item-feedback" data-q-feedback role="status" aria-live="polite" hidden></div>
  `;
  questionEl.append(tools);

  const hintBtn = tools.querySelector('[data-q-hint]');
  const checkBtn = tools.querySelector('[data-q-check]');
  const revealBtn = tools.querySelector('[data-q-reveal]');
  const retryBtn = tools.querySelector('[data-q-retry]');
  const hintBox = tools.querySelector('[data-q-hint-box]');
  const feedbackBox = tools.querySelector('[data-q-feedback]');
  const totalHints = answer.hints?.length ?? 0;

  const entryOf = () => readChoice(choiceState, stateKey, codes, totalHints);

  const syncSelection = (entry) => {
    for (const card of optionCards) {
      card.classList.toggle('is-selected', card.dataset.option === entry.choice);
    }
    for (const radio of questionEl.querySelectorAll('input[type="radio"]')) {
      radio.checked = radio.value === entry.choice;
    }
  };

  const clearVerdict = () => {
    for (const card of optionCards) {
      card.classList.remove('is-selected-correct', 'is-selected-wrong', 'is-correct-answer');
    }
    feedbackBox.hidden = true;
    feedbackBox.innerHTML = '';
    feedbackBox.className = 'l1-item-feedback';
    retryBtn.hidden = true;
    revealBtn.hidden = true;
  };

  /* The worked correction — the key option plus the book explanation. It is
     rendered from the stored `revealed` flag, so it is still there after the
     student walks to another stage and comes back. */
  const appendCorrection = () => {
    questionEl.querySelector(`.option-card[data-option="${answer.correct}"]`)?.classList.add('is-correct-answer');
    revealBtn.hidden = true;
    if (feedbackBox.querySelector('[data-q-correction]')) return;
    const note = document.createElement('div');
    note.className = 'l1-correction-note l1-explanation-sub';
    note.dataset.qCorrection = 'true';
    note.innerHTML = `<strong>التصحيح:</strong> الإجابة الصحيحة هي
      <span class="l1-correction-answer" dir="auto">${answer.answerLabel}</span>.
      <div class="l1-explanation-sub">${answer.explanation}</div>`;
    feedbackBox.append(note);
  };

  const renderVerdict = (entry) => {
    clearVerdict();
    if (!entry.checked || entry.choice === null) return;
    const chosenCard = questionEl.querySelector(`.option-card[data-option="${entry.choice}"]`);
    const specific = answer.optionFeedback?.[entry.choice] ?? '';
    retryBtn.hidden = false;
    feedbackBox.hidden = false;
    if (entry.isCorrect) {
      chosenCard?.classList.add('is-selected-correct');
      feedbackBox.className = 'l1-item-feedback is-correct';
      feedbackBox.innerHTML = `<strong>إجابة صحيحة!</strong> ${withoutLead(specific, 'إجابة صحيحة!')}
        <div class="l1-explanation-sub">${answer.explanation}</div>`;
      return;
    }
    chosenCard?.classList.add('is-selected-wrong');
    feedbackBox.className = 'l1-item-feedback is-wrong';
    feedbackBox.innerHTML = `<strong>ليس هذا الاختيار الدقيق:</strong> ${specific}
      <div class="l1-explanation-sub">صحّح اختيارك أو اطلب تلميحاً وأعد المحاولة، أو اعرض التصحيح الكامل بعد أن جرّبت.</div>`;
    if (entry.revealed) appendCorrection();
    else revealBtn.hidden = false;
  };

  /* Revealed on demand — only after a committed wrong attempt, so the key is
     never on screen before the student has answered. */
  const renderCorrection = () => {
    setChoiceState(revealCorrection(choiceState, stateKey, codes, totalHints));
    renderVerdict(entryOf());
  };

  /* The batch score is derived state, so it must follow every single-question
     verdict too, not only the «تحقّق من جميع الاختيارات» press. */
  const refreshSectionSummary = () => {
    questionEl.closest('[data-self-check]')?._renderSelfCheckSummary?.();
  };

  const renderHints = (level) => {
    if (!totalHints || level <= 0) {
      hintBox.hidden = true;
      hintBox.innerHTML = '';
      hintBtn.disabled = false;
      hintBtn.textContent = `تلميح تدريجي (١/${arabicDigits(totalHints || 2)})`;
      return;
    }
    hintBox.hidden = false;
    hintBox.innerHTML = answer.hints
      .slice(0, level)
      .map((text, idx) => `<p><strong>تلميح ${idx + 1}:</strong> ${text}</p>`)
      .join('');
    hintBtn.disabled = level >= totalHints;
    hintBtn.textContent = level >= totalHints
      ? `عُرض التلميحان (${arabicDigits(totalHints)}/${arabicDigits(totalHints)})`
      : `اطلب التلميح التالي (${arabicDigits(level + 1)}/${arabicDigits(totalHints)})`;
  };

  const evaluateSingle = () => {
    clearVerdict();
    const checked = questionEl.querySelector('input[type="radio"]:checked');
    if (!checked) {
      feedbackBox.hidden = false;
      feedbackBox.className = 'l1-item-feedback is-warning';
      feedbackBox.textContent = 'اختر أحد البدائل أولاً قبل التحقق.';
      return null;
    }
    setChoiceState(selectChoice(choiceState, stateKey, checked.value, codes, totalHints));
    setChoiceState(commitChoice(choiceState, stateKey, answer.correct, codes, totalHints));
    const entry = entryOf();
    syncSelection(entry);
    renderVerdict(entry);
    refreshSectionSummary();
    return entry.isCorrect;
  };

  questionEl._evaluateSingle = evaluateSingle;
  questionEl._resetSingle = () => {
    setChoiceState(clearChoice(choiceState, stateKey));
    for (const radio of questionEl.querySelectorAll('input[type="radio"]')) radio.checked = false;
    for (const card of optionCards) card.classList.remove('is-selected');
    clearVerdict();
    renderHints(0);
    refreshSectionSummary();
  };

  for (const radio of questionEl.querySelectorAll('input[type="radio"]')) {
    radio.addEventListener('change', () => {
      setChoiceState(selectChoice(choiceState, stateKey, radio.value, codes, totalHints));
      const entry = entryOf();
      syncSelection(entry);
      renderVerdict(entry);
      refreshSectionSummary();
    });
  }

  /* The label fills the card, but a click on the card's border ring or on the
     wrapper itself would otherwise be a dead tap. Forward it to the radio. */
  for (const card of optionCards) {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.self-check-option-label, input')) return;
      const radio = card.querySelector('input[type="radio"]');
      if (radio && !radio.checked) radio.click();
    });
  }

  hintBtn.addEventListener('click', () => {
    if (!totalHints) return;
    setChoiceState(revealHint(choiceState, stateKey, totalHints, codes));
    renderHints(entryOf().hintLevel);
  });

  checkBtn.addEventListener('click', evaluateSingle);
  revealBtn.addEventListener('click', renderCorrection);
  retryBtn.addEventListener('click', () => questionEl._resetSingle());

  // Restore whatever this question already holds after a re-render or a reload.
  const restored = entryOf();
  syncSelection(restored);
  renderHints(restored.hintLevel);
  renderVerdict(restored);
}

export function enhanceLesson1SelfCheck(container) {
  for (const section of container.querySelectorAll('[data-self-check]')) {
    if (section.dataset.l1FormMounted === 'true') continue;
    section.dataset.l1FormMounted = 'true';

    const questions = [...section.querySelectorAll('.exam-question[data-self-check-key]')];
    for (const q of questions) {
      injectQuestionHintsAndFeedback(q, q.dataset.selfCheckKey);
    }

    const form = document.createElement('form');
    form.className = 'self-check-form';
    form.noValidate = true;

    const heading = section.querySelector('h2, h3');
    const note = section.querySelector('.self-check-note');
    for (const node of [...section.children]) {
      if (node !== heading && node !== note) form.append(node);
    }

    const actions = document.createElement('div');
    actions.className = 'self-check-actions';
    actions.innerHTML = `
      <button class="self-check-submit l1-btn l1-btn-check" type="submit">تحقّق من جميع اختيارات هذه الدفعة</button>
      <button class="self-check-reset l1-btn l1-btn-ghost" type="reset">إعادة ضبط الدفعة</button>
    `;

    const summary = document.createElement('div');
    summary.className = 'self-check-results';
    summary.setAttribute('role', 'region');
    summary.setAttribute('aria-live', 'polite');
    summary.hidden = true;

    form.append(actions, summary);
    section.append(form);

    const sectionKeys = questions.map((q) => selfCheckStateKey(q.dataset.selfCheckKey));
    const sectionSpec = Object.fromEntries(questions.map((q) => [
      selfCheckStateKey(q.dataset.selfCheckKey),
      { choices: [...q.querySelectorAll('.option-card[data-option]')].map((card) => card.dataset.option) },
    ]));

    /* The batch result is derived from the stored answers, not from a DOM
       snapshot, so it is still accurate after the stage is re-rendered. */
    const renderSummary = () => {
      const batch = summarizeChoices(choiceState, sectionKeys, sectionSpec);
      if (!batch.checked) {
        summary.hidden = true;
        summary.innerHTML = '';
        return;
      }
      summary.hidden = false;
      summary.innerHTML = `<p class="self-check-score"><strong>ملخص الدفعة:</strong> أجبتَ عن <bdi dir="ltr">${batch.answered}</bdi> من <bdi dir="ltr">${batch.total}</bdi>، وعدد الإجابات الصحيحة الآن <bdi dir="ltr">${batch.correct} / ${batch.total}</bdi>. راجع التغذية الراجعة التفصيلية أسفل كل فقرة.</p>`;
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      // Each question grades its own stored pick; an unanswered one only warns.
      for (const q of questions) q._evaluateSingle?.();
      renderSummary();
    });

    form.addEventListener('reset', () => {
      setChoiceState(clearChoices(choiceState, sectionKeys));
      for (const q of questions) q._resetSingle?.();
      summary.hidden = true;
      summary.innerHTML = '';
    });

    section._renderSelfCheckSummary = renderSummary;
    renderSummary();
  }
}

/* --- 2. Interactive Guided Workbenches for p. 62 Problems ---------------- */

export function renderProblemWorkbench(problem) {
  const diagramSvg = problem.diagramKey && DIAGRAMS[problem.diagramKey]
    ? `<figure class="problem-scale-figure">
        <div class="diagram-svg-wrap">${DIAGRAMS[problem.diagramKey].svg}</div>
        <figcaption>${problem.diagramCaption}</figcaption>
      </figure>`
    : '';

  return `<article class="problem-workbench" data-problem-workbench="${problem.id}">
    <header class="problem-workbench-head">
      <span class="curriculum-tag curriculum-tag-book">${problem.badge}</span>
      <h3>${problem.title}</h3>
    </header>
    <div class="problem-statement">${problem.statementHtml}</div>

    <section class="problem-interactive-steps" aria-label="تدرّب على الحل خطوة بخطوة">
      <div class="problem-interactive-banner">
        <strong>ورشة الحل التفاعلي الموجّه:</strong> جرّب حساب المطاليب بنفسك أولاً مع تلميحات غير كاشفة وتشخيص للأخطاء الشائعة، ثم افتح الحل النموذجي الكامل للمقارنة.
      </div>
      ${problem.interactiveSteps.map((step) => `
        <div class="problem-step-box" data-problem-step="${step.stepId}">
          <label class="problem-step-label" for="input-${step.stepId}">${step.label}</label>
          <div class="problem-step-controls">
            <div class="problem-input-group" dir="ltr">
              <input id="input-${step.stepId}" type="number" step="any" inputmode="decimal" class="problem-num-input" placeholder="?" aria-label="${step.label}" />
              <span class="problem-unit-pill">${step.unit}</span>
            </div>
            <button type="button" class="l1-btn l1-btn-check" data-step-check>تحقّق</button>
            <button type="button" class="l1-btn l1-btn-hint" data-step-hint>تلميح (١/٢)</button>
            <button type="button" class="l1-btn l1-btn-ghost" data-step-reset hidden>إعادة</button>
          </div>
          <div class="l1-hint-box" data-step-hint-box hidden></div>
          <div class="l1-item-feedback" data-step-feedback role="status" aria-live="polite" hidden></div>
        </div>
      `).join('')}
    </section>

    <details class="worked-solution-details">
      <summary class="worked-solution-summary">اعرض الحل النموذجي الكامل (الخطوات الثماني + التمثيل المقياسي)</summary>
      <div class="worked-solution-body">
        ${problem.workedSolutionHtml}
        ${diagramSvg}
      </div>
    </details>
  </article>`;
}

export function mountProblemWorkbenches(container) {
  const byId = new Map();
  for (const problem of TEXTBOOK_PROBLEMS) {
    for (const step of problem.interactiveSteps) byId.set(step.stepId, step);
  }

  for (const stepEl of container.querySelectorAll('[data-problem-step]')) {
    if (stepEl.dataset.mounted === 'true') continue;
    stepEl.dataset.mounted = 'true';
    const config = byId.get(stepEl.dataset.problemStep);
    if (!config) continue;

    const input = stepEl.querySelector('input');
    const checkBtn = stepEl.querySelector('[data-step-check]');
    const hintBtn = stepEl.querySelector('[data-step-hint]');
    const resetBtn = stepEl.querySelector('[data-step-reset]');
    const hintBox = stepEl.querySelector('[data-step-hint-box]');
    const feedback = stepEl.querySelector('[data-step-feedback]');
    let hintLevel = 0;

    const checkValue = () => {
      const raw = input.value.trim();
      if (!raw) {
        feedback.hidden = false;
        feedback.className = 'l1-item-feedback is-warning';
        feedback.textContent = 'أدخل قيمة عددية أولاً ثم اضغط «تحقّق».';
        return;
      }
      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) {
        feedback.hidden = false;
        feedback.className = 'l1-item-feedback is-warning';
        feedback.textContent = 'يرجى إدخال عدد صالح باللغة الإنجليزية (مثل 9 أو 15).';
        return;
      }
      resetBtn.hidden = false;
      const ok = Math.abs(numeric - config.expected) <= config.tolerance;
      feedback.hidden = false;
      feedback.className = `l1-item-feedback ${ok ? 'is-correct' : 'is-wrong'}`;
      feedback.innerHTML = ok
        ? `<strong>إجابة صحيحة!</strong> ${config.successMsg}`
        : `<strong>راجع خطوة الحساب:</strong> ${config.diagnose(numeric)}`;
    };

    checkBtn.addEventListener('click', checkValue);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkValue();
      }
    });

    hintBtn.addEventListener('click', () => {
      hintLevel = Math.min(config.hints.length, hintLevel + 1);
      hintBox.hidden = false;
      hintBox.innerHTML = config.hints
        .slice(0, hintLevel)
        .map((h, i) => `<p><strong>تلميح ${i + 1}:</strong> ${h}</p>`)
        .join('');
      if (hintLevel >= config.hints.length) {
        hintBtn.disabled = true;
        hintBtn.textContent = 'عُرض التلميحان (٢/٢)';
      } else {
        hintBtn.textContent = 'تلميح (٢/٢)';
      }
    });

    resetBtn.addEventListener('click', () => {
      input.value = '';
      hintLevel = 0;
      hintBox.hidden = true;
      hintBox.innerHTML = '';
      hintBtn.disabled = false;
      hintBtn.textContent = 'تلميح (١/٢)';
      feedback.hidden = true;
      feedback.innerHTML = '';
      resetBtn.hidden = true;
    });
  }
}

/* --- 3. Graduated 4-Level Formative Practice Deck ------------------------ */

export function renderPracticeDeck() {
  return `<section class="l1-practice-deck" data-practice-deck aria-labelledby="l1-deck-heading">
    <header class="l1-deck-header">
      <div class="l1-deck-badges">
        <span class="curriculum-tag curriculum-tag-enrich">إثراء تدريبي من المنصة · تقييم تكويني داخل الدرس</span>
        <span class="l1-scope-note">مستقل عن «أسئلة الوحدة» و«اختبار الوحدة»</span>
      </div>
      <h2 id="l1-deck-heading">بنك التدريب التفاعلي المتدرّج (١٠ تمارين عبر ٤ مستويات)</h2>
      <p>تدرّب بالتدرج من المفاهيم الأساسية إلى القراءة البيانية والمسائل العددية والتنبؤ الحياتي. لكل تمرين تلميحان تدريجيان لا يكشفان الجواب مباشرةً وتغذية راجعة تشرح سبب الخطأ.</p>

      <div class="l1-deck-progress" aria-live="polite">
        <div class="l1-deck-progress-meta">
          <strong data-deck-progress-text>التقدم في التدريب: أتقنتَ 0 من ${PRACTICE_DECK.length} تمارين</strong>
          <span data-deck-percent><bdi dir="ltr">0%</bdi></span>
        </div>
        <div class="l1-deck-progress-track" aria-hidden="true">
          <span class="l1-deck-progress-fill" data-deck-progress-fill style="width: 0%"></span>
        </div>
      </div>

      <div class="l1-level-tabs" role="tablist" aria-label="تصفية التمارين بحسب المستوى">
        <button type="button" class="sim-chip is-active" role="tab" aria-selected="true" data-level-filter="all">جميع المستويات (${PRACTICE_DECK.length})</button>
        ${PRACTICE_LEVELS.map((lvl) => `<button type="button" class="sim-chip" role="tab" aria-selected="false" data-level-filter="${lvl.id}">${lvl.badge}: ${lvl.title}</button>`).join('')}
      </div>
    </header>

    <div class="l1-deck-items">
      ${PRACTICE_DECK.map((item, idx) => {
        const level = PRACTICE_LEVELS.find((l) => l.id === item.levelId);
        const diagramHtml = item.diagramKey && DIAGRAMS[item.diagramKey]
          ? `<div class="l1-practice-diagram">${DIAGRAMS[item.diagramKey].svg}</div>`
          : '';
        return `<article class="l1-practice-card" data-practice-item="${item.id}" data-practice-level="${item.levelId}">
          <div class="l1-practice-card-top">
            <span class="l1-level-pill">${level?.badge ?? ''} · ${item.kindLabel}</span>
            <span class="l1-item-num">تمرين ${idx + 1} من ${PRACTICE_DECK.length}</span>
          </div>
          <h3 class="l1-practice-prompt">${item.prompt}</h3>
          ${diagramHtml}
          <div class="l1-practice-options" role="radiogroup" aria-label="خيارات التمرين ${idx + 1}">
            ${item.options.map((opt) => `
              <label class="l1-practice-option" data-practice-opt="${opt.id}">
                <input type="radio" name="deck-${item.id}" value="${opt.id}" />
                <span class="l1-opt-code" dir="ltr">${opt.id})</span>
                <span>${opt.label}</span>
              </label>
            `).join('')}
          </div>
          <div class="l1-question-tool-buttons">
            <button type="button" class="l1-btn l1-btn-check" data-deck-check>تحقّق من إجابتي</button>
            <button type="button" class="l1-btn l1-btn-hint" data-deck-hint>تلميح تدريجي (١/٢)</button>
            <button type="button" class="l1-btn l1-btn-ghost" data-deck-retry hidden>أعد المحاولة</button>
          </div>
          <div class="l1-hint-box" data-deck-hint-box hidden></div>
          <div class="l1-item-feedback" data-deck-feedback role="status" aria-live="polite" hidden></div>
        </article>`;
      }).join('')}
    </div>
  </section>`;
}

export function mountPracticeDeck(container) {
  const deck = container.querySelector('[data-practice-deck]');
  if (!deck || deck.dataset.mounted === 'true') return;
  deck.dataset.mounted = 'true';

  const progressText = deck.querySelector('[data-deck-progress-text]');
  const progressPercent = deck.querySelector('[data-deck-percent]');
  const progressFill = deck.querySelector('[data-deck-progress-fill]');

  const deckSpec = Object.fromEntries(PRACTICE_DECK.map((item) => [
    deckStateKey(item.id),
    { choices: item.options.map((option) => option.id) },
  ]));
  const deckKeys = Object.keys(deckSpec);

  /* Mastery is derived from the stored answers, so the meter is still correct
     after the stage is re-rendered or the page is reloaded. */
  const updateProgress = () => {
    const total = PRACTICE_DECK.length;
    const count = summarizeChoices(choiceState, deckKeys, deckSpec).correct;
    const pct = Math.round((count / total) * 100);
    if (progressText) progressText.textContent = `التقدم في التدريب: أتقنتَ ${count} من ${total} تمارين`;
    if (progressPercent) progressPercent.innerHTML = `<bdi dir="ltr">${pct}%</bdi>`;
    if (progressFill) progressFill.style.width = `${pct}%`;
  };

  for (const filterBtn of deck.querySelectorAll('[data-level-filter]')) {
    filterBtn.addEventListener('click', () => {
      const target = filterBtn.dataset.levelFilter;
      for (const b of deck.querySelectorAll('[data-level-filter]')) {
        const active = b === filterBtn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      }
      for (const card of deck.querySelectorAll('[data-practice-item]')) {
        card.hidden = target !== 'all' && card.dataset.practiceLevel !== target;
      }
    });
  }

  const byId = new Map(PRACTICE_DECK.map((item) => [item.id, item]));
  for (const card of deck.querySelectorAll('[data-practice-item]')) {
    const item = byId.get(card.dataset.practiceItem);
    if (!item) continue;
    const stateKey = deckStateKey(item.id);
    const codes = item.options.map((option) => option.id);
    const optionLabels = [...card.querySelectorAll('[data-practice-opt]')];
    const checkBtn = card.querySelector('[data-deck-check]');
    const hintBtn = card.querySelector('[data-deck-hint]');
    const retryBtn = card.querySelector('[data-deck-retry]');
    const hintBox = card.querySelector('[data-deck-hint-box]');
    const feedback = card.querySelector('[data-deck-feedback]');
    const totalHints = item.hints.length;

    const entryOf = () => readChoice(choiceState, stateKey, codes, totalHints);

    const syncSelection = (entry) => {
      for (const label of optionLabels) {
        label.classList.toggle('is-selected', label.dataset.practiceOpt === entry.choice);
      }
      for (const radio of card.querySelectorAll('input[type="radio"]')) {
        radio.checked = radio.value === entry.choice;
      }
    };

    const renderHints = (level) => {
      if (level <= 0) {
        hintBox.hidden = true;
        hintBox.innerHTML = '';
        hintBtn.disabled = false;
        hintBtn.textContent = `تلميح تدريجي (١/${arabicDigits(totalHints)})`;
        return;
      }
      hintBox.hidden = false;
      hintBox.innerHTML = item.hints
        .slice(0, level)
        .map((h, i) => `<p><strong>تلميح ${i + 1}:</strong> ${h}</p>`)
        .join('');
      hintBtn.disabled = level >= totalHints;
      hintBtn.textContent = level >= totalHints
        ? `عُرض التلميحان (${arabicDigits(totalHints)}/${arabicDigits(totalHints)})`
        : `اطلب التلميح التالي (${arabicDigits(level + 1)}/${arabicDigits(totalHints)})`;
    };

    const renderVerdict = (entry) => {
      for (const opt of optionLabels) opt.classList.remove('is-correct', 'is-wrong');
      card.classList.remove('is-mastered');
      feedback.hidden = true;
      feedback.innerHTML = '';
      feedback.className = 'l1-item-feedback';
      retryBtn.hidden = true;
      if (!entry.checked || entry.choice === null) return;
      const chosen = item.options.find((option) => option.id === entry.choice);
      card.querySelector(`[data-practice-opt="${entry.choice}"]`)?.classList.add(entry.isCorrect ? 'is-correct' : 'is-wrong');
      retryBtn.hidden = false;
      feedback.hidden = false;
      feedback.className = `l1-item-feedback ${entry.isCorrect ? 'is-correct' : 'is-wrong'}`;
      feedback.innerHTML = entry.isCorrect
        ? `<strong>إجابة صحيحة!</strong> ${chosen?.feedback ?? ''}`
        : `<strong>تأمّل سبب الخطأ:</strong> ${chosen?.feedback ?? ''}
           <div class="l1-explanation-sub">يمكنك تعديل اختيارك والمحاولة مرة أخرى.</div>`;
      if (entry.isCorrect) card.classList.add('is-mastered');
    };

    for (const radio of card.querySelectorAll('input[type="radio"]')) {
      radio.addEventListener('change', () => {
        setChoiceState(selectChoice(choiceState, stateKey, radio.value, codes, totalHints));
        const entry = entryOf();
        syncSelection(entry);
        renderVerdict(entry);
        updateProgress();
      });
    }

    checkBtn.addEventListener('click', () => {
      const checked = card.querySelector('input[type="radio"]:checked');
      if (!checked) {
        for (const opt of optionLabels) opt.classList.remove('is-correct', 'is-wrong');
        feedback.hidden = false;
        feedback.className = 'l1-item-feedback is-warning';
        feedback.textContent = 'اختر إجابة أولاً قبل التحقق.';
        return;
      }
      setChoiceState(selectChoice(choiceState, stateKey, checked.value, codes, totalHints));
      setChoiceState(commitChoice(choiceState, stateKey, item.correct, codes, totalHints));
      const entry = entryOf();
      syncSelection(entry);
      renderVerdict(entry);
      updateProgress();
    });

    hintBtn.addEventListener('click', () => {
      setChoiceState(revealHint(choiceState, stateKey, totalHints, codes));
      renderHints(entryOf().hintLevel);
    });

    retryBtn.addEventListener('click', () => {
      setChoiceState(clearChoice(choiceState, stateKey));
      for (const radio of card.querySelectorAll('input[type="radio"]')) radio.checked = false;
      const entry = entryOf();
      syncSelection(entry);
      renderVerdict(entry);
      renderHints(0);
      updateProgress();
    });

    // Restore the stored pick, verdict and hint level after a re-render.
    const restored = entryOf();
    syncSelection(restored);
    renderHints(restored.hintLevel);
    renderVerdict(restored);
  }

  updateProgress();
}

/* --- 4. Interactive Inquiry Cards & Stepper Worked Examples -------------- */

export function mountInquiryCards(container) {
  for (const card of container.querySelectorAll('[data-inquiry-card]')) {
    if (card.dataset.mounted === 'true') continue;
    card.dataset.mounted = 'true';
    const correct = card.dataset.correct;
    const checkBtn = card.querySelector('[data-inquiry-check]');
    const feedback = card.querySelector('[data-inquiry-feedback]');
    if (!checkBtn || !feedback) continue;

    const radios = [...card.querySelectorAll('input[type="radio"]')];
    if (!radios.length) continue;
    const codes = radios.map((radio) => radio.value);
    const stateKey = inquiryStateKey(radios[0].name || card.dataset.inquiryCard || 'card');
    const optionLabels = [...card.querySelectorAll('.inquiry-opt')];

    const entryOf = () => readChoice(choiceState, stateKey, codes);

    const renderVerdict = (entry) => {
      for (const label of optionLabels) {
        label.classList.remove('is-selected', 'is-checked-correct', 'is-checked-wrong');
        const radio = label.querySelector('input[type="radio"]');
        const isSelected = Boolean(radio) && radio.value === entry.choice;
        label.classList.toggle('is-selected', isSelected);
        if (isSelected) radio.checked = true;
        if (isSelected && entry.checked) {
          label.classList.add(entry.isCorrect ? 'is-checked-correct' : 'is-checked-wrong');
        }
      }
      feedback.hidden = true;
      feedback.innerHTML = '';
      feedback.className = 'l1-item-feedback';
      if (!entry.checked || entry.choice === null) return;
      const chosen = radios.find((radio) => radio.value === entry.choice);
      feedback.hidden = false;
      feedback.className = `l1-item-feedback ${entry.isCorrect ? 'is-correct' : 'is-wrong'}`;
      feedback.innerHTML = `<strong>${entry.isCorrect ? 'استنتاج سليم!' : 'فكّر مرة أخرى:'}</strong> ${chosen?.dataset.feedback ?? ''}`;
    };

    checkBtn.addEventListener('click', () => {
      const checked = card.querySelector('input[type="radio"]:checked');
      if (!checked) {
        feedback.hidden = false;
        feedback.className = 'l1-item-feedback is-warning';
        feedback.textContent = 'اختر إجابتك أولاً ثم اضغط «تحقّق وافتح التفسير».';
        return;
      }
      setChoiceState(selectChoice(choiceState, stateKey, checked.value, codes));
      setChoiceState(commitChoice(choiceState, stateKey, correct, codes));
      renderVerdict(entryOf());
    });

    // Changing the pick must not leave the previous verdict on screen.
    for (const radio of radios) {
      radio.addEventListener('change', () => {
        setChoiceState(selectChoice(choiceState, stateKey, radio.value, codes));
        renderVerdict(entryOf());
      });
    }

    renderVerdict(entryOf());
  }

  for (const stepper of container.querySelectorAll('[data-worked-stepper]')) {
    if (stepper.dataset.mounted === 'true') continue;
    stepper.dataset.mounted = 'true';
    const steps = [...stepper.querySelectorAll('[data-w-step]')];
    const nextBtn = stepper.querySelector('[data-w-next]');
    const allBtn = stepper.querySelector('[data-w-all]');
    const resetBtn = stepper.querySelector('[data-w-reset]');
    if (!steps.length || !nextBtn || !allBtn || !resetBtn) continue;

    let visibleCount = steps.length;
    const syncSteps = () => {
      steps.forEach((el, idx) => {
        el.hidden = idx >= visibleCount;
      });
      nextBtn.disabled = visibleCount >= steps.length;
      nextBtn.textContent = visibleCount >= steps.length
        ? 'جميع الخطوات معروضة'
        : `اكشف الخطوة التالية (${visibleCount + 1}/${steps.length})`;
    };

    resetBtn.addEventListener('click', () => {
      visibleCount = 1;
      syncSteps();
    });
    nextBtn.addEventListener('click', () => {
      visibleCount = Math.min(steps.length, visibleCount + 1);
      syncSteps();
    });
    allBtn.addEventListener('click', () => {
      visibleCount = steps.length;
      syncSteps();
    });
  }
}
