import { DIAGRAMS } from './diagrams.js';
import { SELF_CHECK_ANSWERS } from './self-check-answers.js';
import { PRACTICE_DECK, PRACTICE_LEVELS, TEXTBOOK_PROBLEMS } from './lesson-1-practice-data.js';

/* --- 1. Enhanced Textbook Self-Check (pp. 61-62) ------------------------- */

function injectQuestionHintsAndFeedback(questionEl, key) {
  const answer = SELF_CHECK_ANSWERS[key];
  if (!answer || questionEl.dataset.l1Enhanced === 'true') return;
  questionEl.dataset.l1Enhanced = 'true';

  const optionsGrid = questionEl.querySelector('.options-grid');
  if (!optionsGrid) return;

  const RadioName = `self-check-${key}`;
  for (const option of optionsGrid.querySelectorAll('.option-card[data-option]')) {
    const code = option.dataset.option;
    if (option.querySelector('input[type="radio"]')) continue;
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

  const tools = document.createElement('div');
  tools.className = 'l1-question-tools';
  tools.innerHTML = `
    <div class="l1-question-tool-buttons">
      <button type="button" class="l1-btn l1-btn-hint" data-q-hint>تلميح تدريجي (١/٢)</button>
      <button type="button" class="l1-btn l1-btn-check" data-q-check>تحقّق من هذه الفقرة</button>
      <button type="button" class="l1-btn l1-btn-ghost" data-q-retry hidden>أعد المحاولة</button>
    </div>
    <div class="l1-hint-box" data-q-hint-box hidden></div>
    <div class="l1-item-feedback" data-q-feedback role="status" aria-live="polite" hidden></div>
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
    feedbackBox.className = 'l1-item-feedback';
  };

  const evaluateSingle = () => {
    clearVisuals();
    const checked = questionEl.querySelector('input[type="radio"]:checked');
    if (!checked) {
      feedbackBox.hidden = false;
      feedbackBox.className = 'l1-item-feedback is-warning';
      feedbackBox.textContent = 'اختر أحد البدائل أولاً قبل التحقق.';
      return null;
    }
    const chosen = checked.value;
    const isCorrect = chosen === answer.correct;
    const chosenCard = questionEl.querySelector(`.option-card[data-option="${chosen}"]`);
    chosenCard?.classList.add(isCorrect ? 'is-selected-correct' : 'is-selected-wrong');
    retryBtn.hidden = false;

    const specific = answer.optionFeedback?.[chosen] ?? '';
    feedbackBox.hidden = false;
    feedbackBox.className = `l1-item-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
    feedbackBox.innerHTML = isCorrect
      ? `<strong>إجابة صحيحة!</strong> ${specific}<div class="l1-explanation-sub">${answer.explanation}</div>`
      : `<strong>ليس هذا الاختيار الدقيق:</strong> ${specific}<div class="l1-explanation-sub">استعن بالتلميح إن احتجت ثم اختر بديلاً آخر واضغط «تحقّق».</div>`;
    return isCorrect;
  };

  questionEl._evaluateSingle = evaluateSingle;
  questionEl._resetSingle = () => {
    for (const r of questionEl.querySelectorAll('input[type="radio"]')) r.checked = false;
    clearVisuals();
    hintStage = 0;
    hintBox.hidden = true;
    hintBox.innerHTML = '';
    hintBtn.disabled = false;
    hintBtn.textContent = 'تلميح تدريجي (١/٢)';
    retryBtn.hidden = true;
  };

  for (const r of questionEl.querySelectorAll('input[type="radio"]')) {
    r.addEventListener('change', clearVisuals);
  }

  hintBtn.addEventListener('click', () => {
    if (!answer.hints?.length) return;
    hintStage = Math.min(answer.hints.length, hintStage + 1);
    hintBox.hidden = false;
    hintBox.innerHTML = answer.hints
      .slice(0, hintStage)
      .map((text, idx) => `<p><strong>تلميح ${idx + 1}:</strong> ${text}</p>`)
      .join('');
    if (hintStage >= answer.hints.length) {
      hintBtn.disabled = true;
      hintBtn.textContent = 'عُرض التلميحان (٢/٢)';
    } else {
      hintBtn.textContent = `اطلب التلميح الثاني (${hintStage + 1}/٢)`;
    }
  });

  checkBtn.addEventListener('click', evaluateSingle);
  retryBtn.addEventListener('click', () => questionEl._resetSingle());
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
      <button class="self-check-submit" type="submit">تحقّق من جميع اختيارات هذه الدفعة</button>
      <button class="self-check-reset" type="reset">إعادة ضبط الدفعة</button>
    `;

    const summary = document.createElement('div');
    summary.className = 'self-check-results';
    summary.setAttribute('role', 'region');
    summary.setAttribute('aria-live', 'polite');
    summary.hidden = true;

    form.append(actions, summary);
    section.append(form);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let correctCount = 0;
      let answeredCount = 0;
      for (const q of questions) {
        const checked = q.querySelector('input[type="radio"]:checked');
        if (checked) {
          answeredCount += 1;
          if (q._evaluateSingle?.()) correctCount += 1;
        } else {
          q._evaluateSingle?.();
        }
      }
      summary.hidden = false;
      summary.innerHTML = `<p class="self-check-score"><strong>ملخص الدفعة:</strong> أجبتَ عن <bdi dir="ltr">${answeredCount}</bdi> من <bdi dir="ltr">${questions.length}</bdi>، وعدد الإجابات الصحيحة الآن <bdi dir="ltr">${correctCount} / ${questions.length}</bdi>. راجع التغذية الراجعة التفصيلية أسفل كل فقرة.</p>`;
    });

    form.addEventListener('reset', () => {
      for (const q of questions) q._resetSingle?.();
      summary.hidden = true;
      summary.innerHTML = '';
    });
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

  const mastered = new Set();
  const progressText = deck.querySelector('[data-deck-progress-text]');
  const progressPercent = deck.querySelector('[data-deck-percent]');
  const progressFill = deck.querySelector('[data-deck-progress-fill]');

  const updateProgress = () => {
    const count = mastered.size;
    const total = PRACTICE_DECK.length;
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
    let hintStage = 0;
    const checkBtn = card.querySelector('[data-deck-check]');
    const hintBtn = card.querySelector('[data-deck-hint]');
    const retryBtn = card.querySelector('[data-deck-retry]');
    const hintBox = card.querySelector('[data-deck-hint-box]');
    const feedback = card.querySelector('[data-deck-feedback]');

    const clearStates = () => {
      for (const opt of card.querySelectorAll('[data-practice-opt]')) {
        opt.classList.remove('is-correct', 'is-wrong');
      }
      feedback.hidden = true;
      feedback.innerHTML = '';
    };

    for (const radio of card.querySelectorAll('input[type="radio"]')) {
      radio.addEventListener('change', clearStates);
    }

    checkBtn.addEventListener('click', () => {
      clearStates();
      const checked = card.querySelector('input[type="radio"]:checked');
      if (!checked) {
        feedback.hidden = false;
        feedback.className = 'l1-item-feedback is-warning';
        feedback.textContent = 'اختر إجابة أولاً قبل التحقق.';
        return;
      }
      const optObj = item.options.find((o) => o.id === checked.value);
      const isCorrect = checked.value === item.correct;
      const optLabel = card.querySelector(`[data-practice-opt="${checked.value}"]`);
      optLabel?.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
      retryBtn.hidden = false;
      feedback.hidden = false;
      feedback.className = `l1-item-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
      feedback.innerHTML = `<strong>${isCorrect ? 'إجابة صحيحة!' : 'تأمّل سبب الخطأ:'}</strong> ${optObj?.feedback ?? ''}`;
      if (isCorrect) {
        mastered.add(item.id);
        card.classList.add('is-mastered');
        updateProgress();
      }
    });

    hintBtn.addEventListener('click', () => {
      hintStage = Math.min(item.hints.length, hintStage + 1);
      hintBox.hidden = false;
      hintBox.innerHTML = item.hints
        .slice(0, hintStage)
        .map((h, i) => `<p><strong>تلميح ${i + 1}:</strong> ${h}</p>`)
        .join('');
      if (hintStage >= item.hints.length) {
        hintBtn.disabled = true;
        hintBtn.textContent = 'عُرض التلميحان (٢/٢)';
      } else {
        hintBtn.textContent = 'اطلب التلميح الثاني (٢/٢)';
      }
    });

    retryBtn.addEventListener('click', () => {
      for (const r of card.querySelectorAll('input[type="radio"]')) r.checked = false;
      clearStates();
      hintStage = 0;
      hintBox.hidden = true;
      hintBox.innerHTML = '';
      hintBtn.disabled = false;
      hintBtn.textContent = 'تلميح تدريجي (١/٢)';
      retryBtn.hidden = true;
    });
  }
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

    checkBtn.addEventListener('click', () => {
      const checked = card.querySelector('input[type="radio"]:checked');
      if (!checked) {
        feedback.hidden = false;
        feedback.className = 'l1-item-feedback is-warning';
        feedback.textContent = 'اختر إجابتك أولاً ثم اضغط «تحقّق وافتح التفسير».';
        return;
      }
      const isCorrect = checked.value === correct;
      const msg = checked.dataset.feedback || '';
      feedback.hidden = false;
      feedback.className = `l1-item-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
      feedback.innerHTML = `<strong>${isCorrect ? 'استنتاج سليم!' : 'فكّر مرة أخرى:'}</strong> ${msg}`;
    });
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
