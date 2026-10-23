import { LESSON_2_DIAGRAMS } from './lesson-2-diagrams.js';
import { SELF_CHECK_ITEMS, PRACTICE_DECK, PRACTICE_LEVELS, TEXTBOOK_PROBLEMS } from './lesson-2-practice-data.js';

function injectQuestionTools(questionEl, answer) {
  if (!answer || questionEl.dataset.l2Enhanced === 'true') return;
  questionEl.dataset.l2Enhanced = 'true';

  const optionsGrid = questionEl.querySelector('.options-grid');
  if (!optionsGrid) return;

  const name = `l2-self-${questionEl.dataset.selfcheckItem ?? Math.random().toString(36).slice(2)}`;
  for (const option of optionsGrid.querySelectorAll('.option-card[data-option]')) {
    if (option.querySelector('input[type="radio"]')) continue;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.className = 'self-check-radio';
    radio.name = name;
    radio.value = option.dataset.option;
    const textWrap = document.createElement('span');
    textWrap.className = 'self-check-option-text';
    while (option.firstChild) textWrap.append(option.firstChild);
    const label = document.createElement('label');
    label.className = 'self-check-option-label';
    label.append(radio, textWrap);
    option.append(label);
  }

  const tools = document.createElement('div');
  tools.className = 'l2-question-tools';
  tools.innerHTML = `
    <div class="l2-question-tool-buttons">
      <button type="button" class="l2-btn l2-btn-hint" data-q-hint>تلميح تدريجي (١/٢)</button>
      <button type="button" class="l2-btn l2-btn-check" data-q-check>تحقّق من هذه الفقرة</button>
      <button type="button" class="l2-btn l2-btn-ghost" data-q-retry hidden>أعد المحاولة</button>
    </div>
    <div class="l2-hint-box" data-q-hint-box hidden></div>
    <div class="l2-item-feedback" data-q-feedback role="status" aria-live="polite" hidden></div>
  `;
  questionEl.append(tools);

  let hintStage = 0;
  const hintBtn = tools.querySelector('[data-q-hint]');
  const checkBtn = tools.querySelector('[data-q-check]');
  const retryBtn = tools.querySelector('[data-q-retry]');
  const hintBox = tools.querySelector('[data-q-hint-box]');
  const feedbackBox = tools.querySelector('[data-q-feedback]');

  const clearVisuals = () => {
    for (const card of questionEl.querySelectorAll('.option-card[data-option]')) {
      card.classList.remove('is-selected-correct', 'is-selected-wrong', 'is-correct-answer');
    }
    feedbackBox.hidden = true;
    feedbackBox.innerHTML = '';
    feedbackBox.className = 'l2-item-feedback';
  };

  const evaluate = () => {
    clearVisuals();
    const checked = questionEl.querySelector('input[type="radio"]:checked');
    if (!checked) {
      feedbackBox.hidden = false;
      feedbackBox.className = 'l2-item-feedback is-warning';
      feedbackBox.textContent = 'اختر أحد البدائل أولاً قبل التحقق.';
      return;
    }
    const chosen = checked.value;
    const isCorrect = chosen === answer.correct;
    const chosenCard = questionEl.querySelector(`.option-card[data-option="${chosen}"]`);
    chosenCard?.classList.add(isCorrect ? 'is-selected-correct' : 'is-selected-wrong');
    retryBtn.hidden = false;
    const specific = answer.optionFeedback?.[chosen] ?? '';
    feedbackBox.hidden = false;
    feedbackBox.className = `l2-item-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
    feedbackBox.innerHTML = isCorrect
      ? `<strong>إجابة صحيحة.</strong> ${specific}<div class="l2-explanation-sub">${answer.explanation}</div>`
      : `<strong>ليس هذا الاختيار الدقيق:</strong> ${specific}<div class="l2-explanation-sub">استعن بالتلميح إن احتجت ثم اختر بديلاً آخر.</div>`;
  };

  for (const radio of questionEl.querySelectorAll('input[type="radio"]')) {
    radio.addEventListener('change', clearVisuals);
  }
  checkBtn.addEventListener('click', evaluate);
  hintBtn.addEventListener('click', () => {
    hintStage = Math.min(answer.hints.length, hintStage + 1);
    hintBox.hidden = false;
    hintBox.innerHTML = answer.hints.slice(0, hintStage).map((h, i) => `<p><strong>تلميح ${i + 1}:</strong> ${h}</p>`).join('');
    hintBtn.textContent = hintStage >= answer.hints.length ? 'عُرض التلميحان (٢/٢)' : 'تلميح (٢/٢)';
    if (hintStage >= answer.hints.length) hintBtn.disabled = true;
  });
  retryBtn.addEventListener('click', () => {
    for (const radio of questionEl.querySelectorAll('input[type="radio"]')) radio.checked = false;
    clearVisuals();
    hintStage = 0;
    hintBox.hidden = true;
    hintBox.innerHTML = '';
    hintBtn.disabled = false;
    hintBtn.textContent = 'تلميح تدريجي (١/٢)';
    retryBtn.hidden = true;
  });
}

export function enhanceLesson2SelfCheck(container) {
  for (const questionEl of container.querySelectorAll('[data-selfcheck-item]')) {
    const key = questionEl.dataset.selfcheckItem;
    injectQuestionTools(questionEl, SELF_CHECK_ITEMS[key]);
  }
}

export function mountInquiryCards(container) {
  for (const card of container.querySelectorAll('[data-inquiry-card]')) {
    if (card.dataset.mounted === 'true') continue;
    card.dataset.mounted = 'true';
    const checkBtn = card.querySelector('[data-inquiry-check]');
    const feedback = card.querySelector('[data-inquiry-feedback]');
    const correct = card.dataset.correct;
    const radios = [...card.querySelectorAll('input[type="radio"]')];
    radios.forEach((radio) => {
      radio.addEventListener('change', () => {
        feedback.hidden = true;
        feedback.innerHTML = '';
        feedback.className = 'l2-item-feedback';
      });
    });
    checkBtn?.addEventListener('click', () => {
      const chosen = card.querySelector('input[type="radio"]:checked');
      if (!chosen) {
        feedback.hidden = false;
        feedback.className = 'l2-item-feedback is-warning';
        feedback.textContent = 'اختر إجابة أولاً.';
        return;
      }
      const ok = chosen.value === correct;
      const note = chosen.closest('label')?.querySelector('[data-feedback]')?.dataset.feedback
        ?? chosen.dataset.feedback
        ?? '';
      feedback.hidden = false;
      feedback.className = `l2-item-feedback ${ok ? 'is-correct' : 'is-wrong'}`;
      feedback.innerHTML = ok
        ? `<strong>استنتاج مناسب.</strong> ${note}`
        : `<strong>راجع المشهد.</strong> ${note}`;
    });
  }
}

function renderProblemWorkbench(problem) {
  const diagram = problem.id === 'p70-problem-1' ? LESSON_2_DIAGRAMS['problem-1'] : LESSON_2_DIAGRAMS['problem-2'];
  return `<article class="l2-workbench" data-problem-bench="${problem.id}">
    <h3>${problem.title}</h3>
    <p>${problem.lead}</p>
    ${problem.sourceNote ? `<div class="callout-box callout-tip">${problem.sourceNote}</div>` : ''}
    <div class="problem-box">
      <strong>المعطيات</strong>
      <ul>${problem.givens.map((item) => `<li>${item}</li>`).join('')}</ul>
    </div>
    <section class="problem-interactive-steps" aria-label="تدرّب على الحل خطوة بخطوة">
      <div class="problem-interactive-banner">جرّب كل مطلب بنفسك مع تلميحين غير كاشفين، ثم قارن بالرسم.</div>
      ${problem.interactiveSteps.map((step) => `
        <div class="problem-step-box" data-problem-step="${step.stepId}">
          <label class="problem-step-label" for="input-${step.stepId}">${step.label}</label>
          <div class="problem-step-controls">
            <div class="problem-input-group" dir="ltr">
              <input id="input-${step.stepId}" type="number" step="any" inputmode="decimal" class="problem-num-input" placeholder="?" aria-label="${step.label}" />
              <span class="problem-unit-pill">${step.unit}</span>
            </div>
            <button type="button" class="l2-btn l2-btn-check" data-step-check>تحقّق</button>
            <button type="button" class="l2-btn l2-btn-hint" data-step-hint>تلميح (١/٢)</button>
            <button type="button" class="l2-btn l2-btn-ghost" data-step-reset hidden>إعادة</button>
          </div>
          <div class="l2-hint-box" data-step-hint-box hidden></div>
          <div class="l2-item-feedback" data-step-feedback role="status" aria-live="polite" hidden></div>
        </div>
      `).join('')}
    </section>
    <figure class="diagram-card">
      <div class="diagram-card-head"><strong>${diagram.title}</strong></div>
      <div class="diagram-svg-wrap">${diagram.svg}</div>
      <figcaption>${diagram.description}</figcaption>
    </figure>
  </article>`;
}

export function renderProblemWorkbenches() {
  return `<section class="l2-problem-stack" data-problem-workbenches>
    ${TEXTBOOK_PROBLEMS.map(renderProblemWorkbench).join('')}
  </section>`;
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
        feedback.className = 'l2-item-feedback is-warning';
        feedback.textContent = 'أدخل قيمة عددية أولاً ثم اضغط «تحقّق».';
        return;
      }
      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) {
        feedback.hidden = false;
        feedback.className = 'l2-item-feedback is-warning';
        feedback.textContent = 'يرجى إدخال عدد صالح (مثل 120 أو 53.33).';
        return;
      }
      resetBtn.hidden = false;
      const ok = Math.abs(numeric - config.expected) <= config.tolerance;
      feedback.hidden = false;
      feedback.className = `l2-item-feedback ${ok ? 'is-correct' : 'is-wrong'}`;
      feedback.innerHTML = ok
        ? `<strong>إجابة صحيحة.</strong> ${config.successMsg}`
        : `<strong>راجع خطوة الحساب:</strong> ${config.diagnose(numeric)}`;
    };

    checkBtn.addEventListener('click', checkValue);
    input.addEventListener('input', () => {
      feedback.hidden = true;
      feedback.innerHTML = '';
      feedback.className = 'l2-item-feedback';
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        checkValue();
      }
    });
    hintBtn.addEventListener('click', () => {
      hintLevel = Math.min(config.hints.length, hintLevel + 1);
      hintBox.hidden = false;
      hintBox.innerHTML = config.hints.slice(0, hintLevel).map((h, i) => `<p><strong>تلميح ${i + 1}:</strong> ${h}</p>`).join('');
      hintBtn.textContent = hintLevel >= config.hints.length ? 'عُرض التلميحان (٢/٢)' : 'تلميح (٢/٢)';
      if (hintLevel >= config.hints.length) hintBtn.disabled = true;
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

export function renderPracticeDeck() {
  return `<section class="l2-practice-deck" data-practice-deck aria-labelledby="l2-deck-heading">
    <header class="l2-deck-header">
      <div class="l2-deck-badges">
        <span class="curriculum-tag curriculum-tag-enrich">تدريب تكويني من المنصة · قيم الكتاب فقط</span>
        <span class="l2-scope-note">مستقل عن اختبار الدرس واختبار الوحدة</span>
      </div>
      <h2 id="l2-deck-heading">تدريب موجّز على مفاهيم الصفحات 63–70</h2>
      <p>ستة أسئلة من تعريف الكتاب وأمثلته المرقّمة. لكل سؤال تلميحان وتفسير لكل بديل.</p>
      <div class="l2-deck-progress" aria-live="polite">
        <div class="l2-deck-progress-meta">
          <strong data-deck-progress-text>أتقنتَ 0 من ${PRACTICE_DECK.length}</strong>
          <span data-deck-percent><bdi dir="ltr">0%</bdi></span>
        </div>
        <div class="l2-deck-progress-track" aria-hidden="true">
          <span class="l2-deck-progress-fill" data-deck-progress-fill style="width: 0%"></span>
        </div>
      </div>
      <div class="l2-level-tabs" role="tablist" aria-label="تصفية بحسب المستوى">
        <button type="button" class="sim-chip is-active" data-level-filter="all">الكل (${PRACTICE_DECK.length})</button>
        ${PRACTICE_LEVELS.map((lvl) => `<button type="button" class="sim-chip" data-level-filter="${lvl.id}">${lvl.badge}: ${lvl.title}</button>`).join('')}
      </div>
    </header>
    <div class="l2-deck-items">
      ${PRACTICE_DECK.map((item) => {
        const level = PRACTICE_LEVELS.find((entry) => entry.id === item.levelId);
        return `<article class="l2-practice-card" data-practice-item="${item.id}" data-practice-level="${item.levelId}">
          <div class="l2-practice-card-top">
            <span class="l2-level-pill">${level?.badge ?? ''} · ${item.kindLabel}</span>
          </div>
          <p class="l2-practice-prompt">${item.prompt}</p>
          <div class="options-grid">
            ${item.options.map((opt) => `<label class="option-card" data-option="${opt.id}"><input type="radio" name="pr-${item.id}" value="${opt.id}" /> <span>${opt.label}</span></label>`).join('')}
          </div>
          <div class="l2-question-tool-buttons">
            <button type="button" class="l2-btn l2-btn-hint" data-pr-hint>تلميح (١/٢)</button>
            <button type="button" class="l2-btn l2-btn-check" data-pr-check>تحقّق</button>
            <button type="button" class="l2-btn l2-btn-ghost" data-pr-retry hidden>أعد المحاولة</button>
          </div>
          <div class="l2-hint-box" data-pr-hint-box hidden></div>
          <div class="l2-item-feedback" data-pr-feedback hidden role="status" aria-live="polite"></div>
        </article>`;
      }).join('')}
    </div>
  </section>`;
}

export function mountPracticeDeck(container) {
  const deck = container.querySelector('[data-practice-deck]');
  if (!deck || deck.dataset.mounted === 'true') return;
  deck.dataset.mounted = 'true';
  const mastered = new Set();
  const fill = deck.querySelector('[data-deck-progress-fill]');
  const text = deck.querySelector('[data-deck-progress-text]');
  const percent = deck.querySelector('[data-deck-percent]');

  const refresh = () => {
    const ratio = mastered.size / PRACTICE_DECK.length;
    fill.style.width = `${(ratio * 100).toFixed(0)}%`;
    text.textContent = `أتقنتَ ${mastered.size} من ${PRACTICE_DECK.length}`;
    percent.innerHTML = `<bdi dir="ltr">${Math.round(ratio * 100)}%</bdi>`;
  };

  for (const card of deck.querySelectorAll('[data-practice-item]')) {
    const item = PRACTICE_DECK.find((entry) => entry.id === card.dataset.practiceItem);
    if (!item) continue;
    const hintBtn = card.querySelector('[data-pr-hint]');
    const checkBtn = card.querySelector('[data-pr-check]');
    const retryBtn = card.querySelector('[data-pr-retry]');
    const hintBox = card.querySelector('[data-pr-hint-box]');
    const feedback = card.querySelector('[data-pr-feedback]');
    let hintStage = 0;

    card.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        feedback.hidden = true;
        feedback.innerHTML = '';
        feedback.className = 'l2-item-feedback';
      });
    });
    checkBtn.addEventListener('click', () => {
      const chosen = card.querySelector('input[type="radio"]:checked');
      if (!chosen) {
        feedback.hidden = false;
        feedback.className = 'l2-item-feedback is-warning';
        feedback.textContent = 'اختر بديلاً أولاً.';
        return;
      }
      const ok = chosen.value === item.correct;
      feedback.hidden = false;
      feedback.className = `l2-item-feedback ${ok ? 'is-correct' : 'is-wrong'}`;
      feedback.innerHTML = ok
        ? `<strong>صحيح.</strong> ${item.optionFeedback[chosen.value]}`
        : `<strong>ليس هذا:</strong> ${item.optionFeedback[chosen.value]}`;
      retryBtn.hidden = false;
      if (ok) {
        mastered.add(item.id);
        refresh();
      }
    });
    hintBtn.addEventListener('click', () => {
      hintStage = Math.min(item.hints.length, hintStage + 1);
      hintBox.hidden = false;
      hintBox.innerHTML = item.hints.slice(0, hintStage).map((h, i) => `<p><strong>تلميح ${i + 1}:</strong> ${h}</p>`).join('');
      hintBtn.textContent = hintStage >= item.hints.length ? 'عُرض التلميحان (٢/٢)' : 'تلميح (٢/٢)';
      if (hintStage >= item.hints.length) hintBtn.disabled = true;
    });
    retryBtn.addEventListener('click', () => {
      card.querySelectorAll('input[type="radio"]').forEach((input) => { input.checked = false; });
      hintStage = 0;
      hintBox.hidden = true;
      hintBtn.disabled = false;
      hintBtn.textContent = 'تلميح (١/٢)';
      feedback.hidden = true;
      retryBtn.hidden = true;
    });
  }

  for (const tab of deck.querySelectorAll('[data-level-filter]')) {
    tab.addEventListener('click', () => {
      const level = tab.dataset.levelFilter;
      deck.querySelectorAll('[data-level-filter]').forEach((btn) => btn.classList.toggle('is-active', btn === tab));
      for (const card of deck.querySelectorAll('[data-practice-item]')) {
        card.hidden = level !== 'all' && card.dataset.practiceLevel !== level;
      }
    });
  }
}

export function mountWorkedStepper(container) {
  for (const stepper of container.querySelectorAll('[data-worked-stepper]')) {
    if (stepper.dataset.mounted === 'true') continue;
    stepper.dataset.mounted = 'true';
    const cards = [...stepper.querySelectorAll('[data-worked-step]')];
    let index = 0;
    const show = () => {
      cards.forEach((card, i) => { card.hidden = i > index; });
      const next = stepper.querySelector('[data-worked-next]');
      const prev = stepper.querySelector('[data-worked-prev]');
      if (next) next.disabled = index >= cards.length - 1;
      if (prev) prev.disabled = index <= 0;
    };
    stepper.querySelector('[data-worked-next]')?.addEventListener('click', () => {
      index = Math.min(cards.length - 1, index + 1);
      show();
    });
    stepper.querySelector('[data-worked-prev]')?.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      show();
    });
    show();
  }
}

export function renderChoice(code, html) {
  return `<div class="option-card" data-option="${code}">
    <span class="option-code" dir="ltr">${code})</span>
    <span>${html}</span>
  </div>`;
}
