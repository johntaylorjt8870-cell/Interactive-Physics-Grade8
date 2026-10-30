/*
 * «الفيزياء في حياتنا» — Lesson 1 mount.
 *
 * Everything visual is derived from `state` + the pure physics module; the
 * authored wording lives in physics-in-life-content.js and every scene in
 * physics-in-life-scenes.js. No answer is graded before an explicit submit,
 * no number is hard-coded, and progress stays in this page only.
 */

import { formula, vector } from './math.js';
import {
  DRAWING_CHALLENGES,
  EXAMPLES,
  GALLERY_GROUPS,
  LESSON_META,
  LESSON_STEPS,
  OPENING_CHALLENGE,
  PREDICT_SCENARIO,
  SESSION_NOTE,
  STATIONS,
  STATION_QUIZZES,
  STATION_THEORY,
  findExample,
} from './physics-in-life-content.js';
import { LessonStepper } from './lesson-steps.js';
import { createMotionController } from './physics-in-life-motion.js';
import {
  COMPASS_DIRECTIONS,
  angularDifference,
  compassDirection,
  concurrentResultant,
  evaluateForceDrawing,
  formatNumber,
  inclineComponents,
  nearestCompassDirection,
  perpendicularResultant,
} from './physics-in-life-physics.js';
import {
  checkPrediction,
  choosePrediction,
  createPredictionState,
  createProgress,
  createQuizState,
  markExperience,
  progressSummary,
  quizScore,
  resetPrediction,
  retryQuestion,
  selectChoice,
  selectPointOfEffect,
  submitQuestion,
} from './physics-in-life-state.js';
import {
  concurrentStationScene,
  drawingScene,
  exampleScene,
  inclineStationScene,
  openingScene,
  perpendicularStationScene,
  predictScene,
} from './physics-in-life-scenes.js';

const $ = (id) => document.getElementById(id);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const TOTAL_STATION_QUESTIONS = Object.values(STATION_QUIZZES)
  .reduce((sum, questions) => sum + questions.length, 0);
const EXPERIENCE_IDS = [
  'station-concurrent',
  'station-perpendicular',
  'station-incline',
  'predict',
  ...EXAMPLES.map((example) => `example-${example.id}`),
  'drawing',
];

const fmt = (value, digits = 1) => formatNumber(value, digits);
const N = (value) => `${fmt(value, 1)} N`;
const DEG = (value) => `${fmt(value, 1)}°`;

const GROUP_TITLES = Object.fromEntries(GALLERY_GROUPS.map((group) => [group.id, group.title]));

/* --------------------------------------------------------------- utilities */

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function choiceButton(choice, index) {
  return `<button class="pil-choice" type="button" data-choice="${escapeHtml(choice.id)}" aria-pressed="false">
    <span class="pil-choice-mark" aria-hidden="true">${index + 1}</span>
    <span class="pil-choice-text">${choice.label}</span>
  </button>`;
}

function feedbackBox(node, { kind = 'neutral', headline = '', detail = '' }) {
  node.className = `pil-feedback is-${kind}`;
  node.innerHTML = `${headline ? `<strong>${headline}</strong>` : ''}${detail ? `<span class="pil-feedback-detail">${detail}</span>` : ''}`;
  node.hidden = false;
}

function hideFeedback(node) {
  node.hidden = true;
  node.innerHTML = '';
}

/* ------------------------------------------------------------ quiz control */

function createQuizController(questions, { title = 'تحقق سريع', intro = '', compact = false, state = null, onChange = null } = {}) {
  let quiz = state ?? createQuizState(questions);
  let container = null;

  const record = (questionId) => container?.querySelector(`[data-question-card="${questionId}"]`);

  function paintQuestion(question) {
    const card = record(question.id);
    if (!card) return;
    const selected = quiz.selected[question.id];
    const submitted = quiz.submitted[question.id];
    qsa('[data-choice]', card).forEach((button) => {
      const choiceId = button.dataset.choice;
      button.disabled = Boolean(submitted);
      button.setAttribute('aria-pressed', String(!submitted && selected === choiceId));
      if (submitted) {
        if (choiceId === submitted.correctId) button.dataset.result = 'correct';
        else if (choiceId === submitted.choiceId) button.dataset.result = 'wrong';
        else delete button.dataset.result;
      } else {
        delete button.dataset.result;
      }
    });
    const check = card.querySelector('[data-check]');
    const retry = card.querySelector('[data-retry]');
    if (check) check.disabled = Boolean(submitted) || !selected;
    if (retry) retry.hidden = !submitted;
    const box = card.querySelector('[data-feedback]');
    if (submitted) {
      feedbackBox(box, {
        kind: submitted.correct ? 'correct' : 'wrong',
        headline: submitted.correct ? 'إجابة صحيحة.' : `إجابة غير صحيحة. الإجابة الصحيحة: ${escapeHtml(question.choices.find((choice) => choice.id === submitted.correctId)?.label ?? '')}`,
        detail: question.explanation,
      });
    } else {
      hideFeedback(box);
    }
  }

  function updateScore() {
    const score = quizScore(quiz, questions);
    if (!container) return;
    const scoreNode = container.querySelector('[data-score]');
    const progressNode = container.querySelector('[data-score-progress]');
    if (scoreNode) scoreNode.textContent = String(score.correct);
    if (progressNode) progressNode.textContent = `${score.answered} من ${score.total} مُجاب`;
    onChange?.(score);
  }

  function render() {
    if (!container) return;
    container.innerHTML = `
      ${compact ? '' : `<div class="pil-quiz-heading">
        <div><p class="pil-kicker">اختبار قصير</p><h3>${escapeHtml(title)}</h3><p>${escapeHtml(intro)}</p></div>
        <div class="pil-quiz-score"><b data-score>0</b> / ${questions.length}<br><span data-score-progress>0 من ${questions.length} مُجاب</span></div>
      </div>`}
      ${questions.map((question, index) => `
        <article class="pil-question-card" data-question-card="${escapeHtml(question.id)}">
          <p class="pil-question-prompt"><span class="pil-question-index" aria-hidden="true">${index + 1}</span><span>${question.prompt}</span></p>
          <div class="pil-choices" role="group" aria-label="خيارات السؤال ${index + 1}">
            ${question.choices.map(choiceButton).join('')}
          </div>
          <div class="pil-question-actions">
            <button class="pil-btn is-primary" type="button" data-check>تحقق</button>
            <button class="pil-btn" type="button" data-retry hidden>إعادة المحاولة</button>
          </div>
          <div class="pil-feedback" data-feedback role="status" aria-live="polite" hidden></div>
        </article>`).join('')}`;
    questions.forEach(paintQuestion);
    updateScore();
  }

  function attach(target) {
    container = target;
    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-choice]');
      const card = event.target.closest('[data-question-card]');
      if (!card) return;
      const question = questions.find((candidate) => candidate.id === card.dataset.questionCard);
      if (!question) return;
      if (button) {
        if (quiz.submitted[question.id]) return;
        quiz = selectChoice(quiz, question.id, button.dataset.choice, questions);
        paintQuestion(question);
        updateScore();
        return;
      }
      if (event.target.closest('[data-check]')) {
        quiz = submitQuestion(quiz, question.id, questions);
        paintQuestion(question);
        updateScore();
        return;
      }
      if (event.target.closest('[data-retry]')) {
        quiz = retryQuestion(quiz, question.id);
        paintQuestion(question);
        updateScore();
      }
    });
    render();
  }

  return {
    attach,
    getState: () => quiz,
    score: () => quizScore(quiz, questions),
    render,
  };
}

/* ------------------------------------------------------------------- mount */

function mountLesson() {
  const root = document.querySelector('[data-pil-app], .pil-page');
  if (!root) return;

  let progress = createProgress(EXPERIENCE_IDS);
  const stationState = {
    concurrent: { ...STATIONS[0].defaults, showConstruction: true, scale: 2.6, reveal: 1 },
    perpendicular: { ...STATIONS[1].defaults, hideResult: false, reveal: 1 },
    incline: { ...STATIONS[2].defaults, showReaction: false, reveal: 1 },
  };
  const quizControllers = {};
  const motions = {};
  const STATION_MOTION_UI = {
    concurrent: { play: 'st1-motion-play', pause: 'st1-motion-pause', status: 'st1-motion-status', bar: 'st1-motion-bar', fill: 'st1-motion-fill' },
    perpendicular: { play: 'st2-motion-play', pause: 'st2-motion-pause', status: 'st2-motion-status', bar: 'st2-motion-bar', fill: 'st2-motion-fill' },
    incline: { play: 'st3-motion-play', pause: 'st3-motion-pause', status: 'st3-motion-status', bar: 'st3-motion-bar', fill: 'st3-motion-fill' },
  };
  const prefersReducedMotion = () => typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------- progress */

  function updateProgress() {
    const summary = progressSummary(progress);
    const seenSet = new Set(progress.seen);
    const fill = $('pil-progress-fill');
    const percent = $('pil-progress-percent');
    const caption = $('pil-progress-caption');
    const bar = $('pil-progress-bar');
    if (fill) fill.style.width = `${summary.percent}%`;
    if (percent) percent.textContent = `${summary.percent}%`;
    if (caption) caption.textContent = `${summary.seen} من ${summary.total} تجربة — يبقى التقدم في هذه الصفحة ولا يُحفظ.`;
    if (bar) bar.setAttribute('aria-valuenow', String(summary.percent));

    const quizTotal = Object.values(quizControllers)
      .reduce((sum, controller) => sum + controller.score().correct, 0);
    const examplesSeen = EXAMPLES.filter((example) => seenSet.has(`example-${example.id}`)).length;
    const experienceNode = $('pil-complete-experiences');
    const quizNode = $('pil-complete-quiz');
    const examplesNode = $('pil-complete-examples');
    if (experienceNode) experienceNode.textContent = `${summary.seen}/${summary.total}`;
    if (quizNode) quizNode.textContent = `${quizTotal}/${TOTAL_STATION_QUESTIONS}`;
    if (examplesNode) examplesNode.textContent = `${examplesSeen}/${EXAMPLES.length}`;
  }

  function touchExperience(id) {
    progress = markExperience(progress, id, EXPERIENCE_IDS);
    updateProgress();
  }

  /* ------------------------------------------------------ «حرّك القوى» clock */

  function motionMessage(info) {
    if (info.playing) return 'جارٍ بناء الرسم من القيم والزوايا الحالية…';
    if (info.status === 'paused') return 'الحركة متوقفة. اضغط «متابعة الحركة» أو «إعادة التجربة».';
    if (info.reduced) return 'عُرض الرسم كاملاً مباشرة احتراماً لإعداد تقليل الحركة.';
    if (info.status === 'done') return 'اكتمل العرض: الرسم مطابق للقيم والزوايا الحالية.';
    return 'جاهز — اضغط «حرّك القوى» لبناء الرسم.';
  }

  function paintMotion(key) {
    const controller = motions[key];
    if (!controller) return;
    const ui = STATION_MOTION_UI[key];
    const info = controller.getState();
    const play = $(ui.play);
    const pause = $(ui.pause);
    const status = $(ui.status);
    const bar = $(ui.bar);
    const fill = $(ui.fill);
    if (play) {
      play.disabled = info.playing;
      play.textContent = info.playing
        ? 'جارٍ التحريك…'
        : info.status === 'paused' ? 'متابعة الحركة' : info.status === 'done' ? 'أعد العرض' : 'حرّك القوى';
    }
    if (pause) pause.disabled = !info.playing;
    const percent = Math.round(info.reveal * 100);
    if (bar) bar.setAttribute('aria-valuenow', String(percent));
    if (fill) fill.style.width = `${percent}%`;
    if (status) {
      const message = motionMessage(info);
      /* The live region only receives phase changes, never a per-frame count. */
      if (status.textContent !== message) status.textContent = message;
    }
  }

  /**
   * Wire one experiment's motion clock. `render` rebuilds the scene from
   * `stationState[key]`, so every frame shows the real values of the current
   * inputs and the physical numbers can never drift from the drawing.
   */
  function initMotion(key, render) {
    const ui = STATION_MOTION_UI[key];
    let lastRendered = -1;
    const controller = createMotionController({
      reducedMotion: prefersReducedMotion,
      onFrame: (reveal) => {
        stationState[key].reveal = reveal;
        const percent = Math.round(reveal * 100);
        const fill = $(ui.fill);
        const bar = $(ui.bar);
        if (fill) fill.style.width = `${percent}%`;
        if (bar) bar.setAttribute('aria-valuenow', String(percent));
        /* About 28 fps of SVG rebuilds: visibly smooth, light on the DOM. */
        if (reveal === 0 || reveal === 1 || Math.abs(reveal - lastRendered) >= 0.02) {
          lastRendered = reveal;
          render();
        }
      },
      onStateChange: () => paintMotion(key),
    });
    motions[key] = controller;
    $(ui.play)?.addEventListener('click', () => {
      controller.play();
      paintMotion(key);
    });
    $(ui.pause)?.addEventListener('click', () => {
      controller.pause();
      paintMotion(key);
    });
    paintMotion(key);
  }

  function stopInactiveMotions(activeStation = null) {
    Object.entries(motions).forEach(([key, controller]) => {
      if (key === activeStation) return;
      const info = controller.getState();
      if (info.playing || info.paused) controller.stop({ settle: true });
    });
  }

  /* ---------------------------------------------------------------- opening */

  const opening = {
    ...OPENING_CHALLENGE.defaults,
    selectedId: null,
    compared: false,
  };

  function paintOpening() {
    const scene = $('pil-opening-scene');
    if (scene) {
      scene.innerHTML = openingScene({
        f1: opening.f1,
        f2: opening.f2,
        angle: opening.angle,
        direction: opening.direction,
        showResultant: opening.compared,
      }, 'pil-opening-live');
    }
    qsa('#pil-opening-choices [data-choice]').forEach((button) => {
      button.setAttribute('aria-pressed', String(opening.selectedId === button.dataset.choice));
    });
    const compare = $('pil-opening-compare');
    if (compare) {
      compare.disabled = !opening.selectedId || opening.compared;
      compare.textContent = opening.compared ? 'تمت المقارنة ✓' : 'قارن توقعي';
    }
    const sliders = $('pil-opening-sliders');
    if (sliders) sliders.hidden = !opening.selectedId;
    const f1Value = $('pil-opening-f1-value');
    const f2Value = $('pil-opening-f2-value');
    if (f1Value) f1Value.textContent = N(opening.f1);
    if (f2Value) f2Value.textContent = N(opening.f2);
  }

  function initOpening() {
    const container = $('pil-opening-choices');
    if (!container) return;
    container.innerHTML = OPENING_CHALLENGE.options.map(choiceButton).join('');
    const status = $('pil-opening-status');
    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-choice]');
      if (!button || opening.compared) return;
      opening.selectedId = button.dataset.choice;
      paintOpening();
      if (status) {
        feedbackBox(status, {
          kind: 'neutral',
          headline: 'تم تسجيل توقعك.',
          detail: 'يمكنك الآن تغيير القوتين في المشهد، ثم اضغط «قارن توقعي» لترى المحصلة المحسوبة والتفسير.',
        });
      }
    });

    const compare = $('pil-opening-compare');
    compare?.addEventListener('click', () => {
      if (!opening.selectedId) return;
      opening.compared = true;
      paintOpening();
      const feedback = $('pil-opening-feedback');
      const correct = opening.selectedId === OPENING_CHALLENGE.correctId;
      if (feedback) {
        feedbackBox(feedback, {
          kind: correct ? 'correct' : 'wrong',
          headline: correct ? 'توقعك متوافق مع الفيزياء.' : 'توقعك يحتاج تعديلاً.',
          detail: `${correct ? OPENING_CHALLENGE.feedbackCorrect : OPENING_CHALLENGE.feedbackIncorrect}<br><br>${OPENING_CHALLENGE.followUp}`,
        });
      }
      if (status) hideFeedback(status);
    });

    const f1 = $('pil-opening-f1');
    const f2 = $('pil-opening-f2');
    f1?.addEventListener('input', () => {
      opening.f1 = Number(f1.value);
      paintOpening();
    });
    f2?.addEventListener('input', () => {
      opening.f2 = Number(f2.value);
      paintOpening();
    });

    paintOpening();
  }

  /* -------------------------------------------------------------- station 1 */

  function renderExplore(container, station) {
    if (!container) return;
    container.innerHTML = `<h3>أسئلة استكشاف</h3>${station.exploration.map((item, index) => `
      <details>
        <summary>${escapeHtml(item.question)}</summary>
        <p>${item.answer}</p>
      </details>`).join('')}`;
  }

  function renderNotes(container, station) {
    if (!container) return;
    container.innerHTML = station.notes.map((note) => `<p class="pil-note">${escapeHtml(note)}</p>`).join('');
  }

  function renderConcurrent() {
    const state = stationState.concurrent;
    const result = concurrentResultant(state);
    const scene = $('pil-scene-concurrent');
    if (scene) {
      scene.innerHTML = concurrentStationScene({
        ...state,
        showConstruction: state.showConstruction,
        scale: state.scale,
        reveal: state.reveal,
      }, 'pil-station-concurrent');
    }
    setScaleButtons(state.scale);
    const setOut = (id, text) => {
      const node = $(id);
      if (node) node.textContent = text;
    };
    setOut('st1-f1-value', N(state.f1));
    setOut('st1-f2-value', N(state.f2));
    setOut('st1-angle-value', `${fmt(state.angle, 0)}°`);
    setOut('st1-direction-value', `${fmt(state.direction, 0)}°`);
    setOut('st1-result-theta', `${fmt(result.theta, 0)}°`);
    setOut('st1-result-magnitude', result.isZero ? '0 N' : N(result.magnitude));

    const fromFirst = result.isZero ? null : Math.abs(angularDifference(result.firstAngle, result.directionDegrees));
    setOut('st1-result-from-f1', fromFirst === null ? '—' : `${fmt(fromFirst, 1)}°`);
    const deviationNode = $('st1-result-deviation');
    if (deviationNode) {
      if (result.isZero) {
        deviationNode.textContent = '—';
      } else if (Math.abs(result.deviationFromBisectorDegrees) < 0.05) {
        deviationNode.textContent = '0° (على المنصف)';
      } else {
        const toward = result.deviationFromBisectorDegrees > 0 ? 'F₂' : 'F₁';
        deviationNode.textContent = `${fmt(Math.abs(result.deviationFromBisectorDegrees), 1)}° نحو ${toward}`;
      }
    }

    const equation = $('st1-equation');
    if (equation) {
      equation.innerHTML = [
        formula('\\vec{F}=\\vec{F}_{1}+\\vec{F}_{2}', 'the resultant vector equals the vector sum of the two forces'),
        formula(
          `F_{x}=${fmt(state.f1, 0)}\\cos${fmt(result.firstAngle, 0)}^{\\circ}+${fmt(state.f2, 0)}\\cos${fmt(result.secondAngle, 0)}^{\\circ}=${fmt(result.components.x, 1)}\\,\\mathrm{N}`,
          `F x equals ${fmt(state.f1, 0)} cos ${fmt(result.firstAngle, 0)} plus ${fmt(state.f2, 0)} cos ${fmt(result.secondAngle, 0)} equals ${fmt(result.components.x, 1)} newtons`,
        ),
        formula(
          `F_{y}=${fmt(state.f1, 0)}\\sin${fmt(result.firstAngle, 0)}^{\\circ}+${fmt(state.f2, 0)}\\sin${fmt(result.secondAngle, 0)}^{\\circ}=${fmt(result.components.y, 1)}\\,\\mathrm{N}`,
          `F y equals ${fmt(result.components.y, 1)} newtons`,
        ),
        formula(
          `F=\\sqrt{(${fmt(result.components.x, 1)})^{2}+(${fmt(result.components.y, 1)})^{2}}=${fmt(result.magnitude, 1)}\\,\\mathrm{N}`,
          `F equals the square root of F x squared plus F y squared equals ${fmt(result.magnitude, 1)} newtons`,
        ),
      ].join('');
    }

    const observation = $('st1-observation');
    if (observation) {
      if (result.isZero) {
        observation.textContent = 'المحصلة صفرية لأن القوتين متساويتان ومتعاكستان. هذا لا يعني بالضرورة أن السفينة متزنة، لأن قوى أخرى مثل مقاومة الماء قد تؤثر فيها.';
      } else if (result.equalMagnitudes) {
        observation.textContent = `المقداران متساويان، لذلك تقع المحصلة على منصف الزاوية (${fmt(result.bisectorDegrees, 1)}°) بمقدار ${N(result.magnitude)}.`;
      } else {
        const larger = state.f1 > state.f2 ? 'F₁' : 'F₂';
        observation.textContent = `المقداران مختلفان، لذلك انحرفت المحصلة نحو القوة الأكبر ${larger} بمقدار ${fmt(Math.abs(result.deviationFromBisectorDegrees), 1)}° عن منصف الزاوية. مقدار المحصلة ${N(result.magnitude)}.`;
      }
    }

    const toggle = $('st1-toggle-construction');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(state.showConstruction));
      toggle.textContent = state.showConstruction ? 'إخفاء البناء الهندسي' : 'إظهار البناء الهندسي';
    }
  }

  function setScaleButtons(scale) {
    qsa('[data-st1-scale]').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.st1Scale) === Number(scale)));
    });
    const caption = $('st1-scale-caption');
    if (caption) caption.textContent = `1 N = ${fmt(Number(scale), 1)} px`;
  }

  function initConcurrent() {
    initMotion('concurrent', renderConcurrent);
    const binding = [
      ['st1-f1', (value) => { stationState.concurrent.f1 = value; }],
      ['st1-f2', (value) => { stationState.concurrent.f2 = value; }],
      ['st1-angle', (value) => { stationState.concurrent.angle = value; }],
      ['st1-direction', (value) => { stationState.concurrent.direction = value; }],
    ];
    binding.forEach(([id, setter]) => {
      const input = $(id);
      input?.addEventListener('input', () => {
        setter(Number(input.value));
        renderConcurrent();
        touchExperience('station-concurrent');
      });
    });
    qsa('[data-st1-scale]').forEach((button) => {
      button.addEventListener('click', () => {
        stationState.concurrent.scale = Number(button.dataset.st1Scale);
        renderConcurrent();
        touchExperience('station-concurrent');
      });
    });
    $('st1-toggle-construction')?.addEventListener('click', () => {
      stationState.concurrent.showConstruction = !stationState.concurrent.showConstruction;
      renderConcurrent();
      touchExperience('station-concurrent');
    });
    $('st1-reset')?.addEventListener('click', () => {
      stationState.concurrent = { ...STATIONS[0].defaults, showConstruction: true, scale: 2.6, reveal: 1 };
      $('st1-f1').value = stationState.concurrent.f1;
      $('st1-f2').value = stationState.concurrent.f2;
      $('st1-angle').value = stationState.concurrent.angle;
      $('st1-direction').value = stationState.concurrent.direction;
      motions.concurrent?.reset();
      paintMotion('concurrent');
    });

    const symbol = $('st1-result-symbol');
    if (symbol) symbol.innerHTML = vector('F');
    renderExplore($('st1-explore'), STATIONS[0]);
    renderNotes($('st1-notes'), STATIONS[0]);
    renderConcurrent();
  }

  /* -------------------------------------------------------------- station 2 */

  function renderPerpendicular() {
    const state = stationState.perpendicular;
    const result = perpendicularResultant(state.f1, state.f2);
    const scene = $('pil-scene-perpendicular');
    if (scene) {
      scene.innerHTML = perpendicularStationScene({ ...state, reveal: state.reveal }, 'pil-station-perpendicular');
    }
    const setOut = (id, text) => {
      const node = $(id);
      if (node) node.textContent = text;
    };
    setOut('st2-f1-value', N(state.f1));
    setOut('st2-f2-value', N(state.f2));
    setOut('st2-result-magnitude', state.hideResult ? 'مخفية' : N(result.magnitude));
    setOut('st2-result-angle', state.hideResult ? 'مخفية' : (result.isZero ? '—' : `${fmt(result.angleFromFirstDegrees, 1)}°`));

    const equation = $('st2-equation');
    if (equation) {
      equation.innerHTML = state.hideResult
        ? `<p class="pil-equation-caption">النتيجة العددية مخفية. توقّع مقدار المحصلة أولاً، ثم أظهرها لتقارن.</p>`
        : [
          formula('F=\\sqrt{F_{1}^{2}+F_{2}^{2}}', 'F equals the square root of F1 squared plus F2 squared'),
          formula(
            `F=\\sqrt{${fmt(state.f1, 0)}^{2}+${fmt(state.f2, 0)}^{2}}=\\sqrt{${fmt(result.sumOfSquares, 0)}}=${fmt(result.magnitude, 1)}\\,\\mathrm{N}`,
            `F equals root of ${fmt(state.f1, 0)} squared plus ${fmt(state.f2, 0)} squared equals ${fmt(result.magnitude, 1)} newtons`,
          ),
          formula(
            `\\theta=\\tan^{-1}\\left(\\dfrac{F_{2}}{F_{1}}\\right)\\approx${fmt(result.angleFromFirstDegrees, 1)}^{\\circ}`,
            `theta equals inverse tangent of F2 over F1, about ${fmt(result.angleFromFirstDegrees, 1)} degrees`,
          ),
        ].join('');
    }
    const maskNote = $('st2-mask-note');
    if (maskNote) maskNote.hidden = !state.hideResult;
    const hideButton = $('st2-hide-result');
    if (hideButton) {
      hideButton.setAttribute('aria-pressed', String(state.hideResult));
      hideButton.textContent = state.hideResult ? 'إظهار النتيجة العددية' : 'إخفاء النتيجة العددية';
    }

    const observation = $('st2-observation');
    if (observation) {
      if (state.hideResult) {
        observation.textContent = 'الرسم يوضح الاتجاه فقط، والمقدار العددي مخفي. حاول تقدير المحصلة من فيثاغورس ثم أظهر النتيجة.';
      } else if (Math.abs(state.f1 - state.f2) < 1e-6) {
        observation.textContent = `القوتان متساويتان ومتعامدتان، لذلك تصنع المحصلة 45° مع كل منهما. زاوية إثرائية: المحصلة أقرب إلى منصف الزاوية القائمة.`;
      } else {
        const larger = state.f1 > state.f2 ? 'F₁' : 'F₂';
        observation.textContent = `القوة ${larger} أكبر، لذلك تكون المحصلة أقرب إليها: الزاوية مع F₁ ≈ ${fmt(result.angleFromFirstDegrees, 1)}°. لا نجمع 50 + 70 مباشرة لأن القوتين متعامدتان.`;
      }
    }
  }

  function initPerpendicular() {
    initMotion('perpendicular', renderPerpendicular);
    ['st2-f1', 'st2-f2'].forEach((id) => {
      const input = $(id);
      input?.addEventListener('input', () => {
        stationState.perpendicular[id === 'st2-f1' ? 'f1' : 'f2'] = Number(input.value);
        renderPerpendicular();
        touchExperience('station-perpendicular');
      });
    });
    $('st2-hide-result')?.addEventListener('click', () => {
      stationState.perpendicular.hideResult = !stationState.perpendicular.hideResult;
      renderPerpendicular();
      touchExperience('station-perpendicular');
    });
    $('st2-reset')?.addEventListener('click', () => {
      stationState.perpendicular = { ...STATIONS[1].defaults, hideResult: false, reveal: 1 };
      $('st2-f1').value = stationState.perpendicular.f1;
      $('st2-f2').value = stationState.perpendicular.f2;
      motions.perpendicular?.reset();
      paintMotion('perpendicular');
    });
    const symbol = $('st2-result-symbol');
    if (symbol) symbol.innerHTML = vector('F');
    renderExplore($('st2-explore'), STATIONS[1]);
    renderNotes($('st2-notes'), STATIONS[1]);
    renderPerpendicular();
  }

  /* -------------------------------------------------------------- station 3 */

  function renderIncline() {
    const state = stationState.incline;
    const components = inclineComponents(state.weight, state.angle);
    const scene = $('pil-scene-incline');
    if (scene) {
      scene.innerHTML = inclineStationScene({
        weight: state.weight,
        angle: state.angle,
        showReaction: state.showReaction,
        reveal: state.reveal,
      }, 'pil-station-incline');
    }
    const setOut = (id, text) => {
      const node = $(id);
      if (node) node.textContent = text;
    };
    setOut('st3-weight-value', N(state.weight));
    setOut('st3-angle-value', `${fmt(state.angle, 0)}°`);
    setOut('st3-result-parallel', N(components.parallel));
    setOut('st3-result-perpendicular', N(components.perpendicular));
    setOut('st3-result-weight', N(state.weight));
    setOut('st3-result-angle', `${fmt(state.angle, 0)}°`);

    const equation = $('st3-equation');
    if (equation) {
      equation.innerHTML = [
        formula('w_{\\parallel}=w\\sin\\alpha', 'w parallel equals w sine alpha'),
        formula(
          `w_{\\parallel}=${fmt(state.weight, 0)}\\sin${fmt(state.angle, 0)}^{\\circ}=${fmt(components.parallel, 1)}\\,\\mathrm{N}`,
          `w parallel equals ${fmt(state.weight, 0)} sine ${fmt(state.angle, 0)} equals ${fmt(components.parallel, 1)} newtons`,
        ),
        formula(
          `w_{\\perp}=${fmt(state.weight, 0)}\\cos${fmt(state.angle, 0)}^{\\circ}=${fmt(components.perpendicular, 1)}\\,\\mathrm{N}`,
          `w perpendicular equals ${fmt(components.perpendicular, 1)} newtons`,
        ),
      ].join('');
    }
    const observation = $('st3-observation');
    if (observation) {
      if (state.angle === 0) {
        observation.textContent = 'عند زاوية 0° يكون السطح أفقياً: المركبة الموازية تساوي صفراً، والمركبة العمودية تساوي ثقل الجسم كاملاً.';
      } else {
        observation.textContent = `عند α = ${fmt(state.angle, 0)}°: المركبة الموازية ${N(components.parallel)} والعمودية ${N(components.perpendicular)}. كلما زادت الزاوية من 0° إلى 90° زادت w∥ وتناقصت w⊥. المركبة العمودية ليست قوة رد الفعل العمودي، والتسارع لا يُستنتج منها وحدها.`;
      }
    }
    const reaction = $('st3-toggle-reaction');
    if (reaction) {
      reaction.setAttribute('aria-pressed', String(state.showReaction));
      reaction.textContent = state.showReaction ? 'إخفاء رد الفعل العمودي R' : 'إظهار رد الفعل العمودي R';
    }
  }

  function initIncline() {
    initMotion('incline', renderIncline);
    $('st3-weight')?.addEventListener('input', (event) => {
      stationState.incline.weight = Number(event.target.value);
      renderIncline();
      touchExperience('station-incline');
    });
    $('st3-angle')?.addEventListener('input', (event) => {
      stationState.incline.angle = Number(event.target.value);
      renderIncline();
      touchExperience('station-incline');
    });
    $('st3-toggle-reaction')?.addEventListener('click', () => {
      stationState.incline.showReaction = !stationState.incline.showReaction;
      renderIncline();
      touchExperience('station-incline');
    });
    $('st3-reset')?.addEventListener('click', () => {
      stationState.incline = { ...STATIONS[2].defaults, showReaction: false, reveal: 1 };
      $('st3-weight').value = stationState.incline.weight;
      $('st3-angle').value = stationState.incline.angle;
      motions.incline?.reset();
      paintMotion('incline');
    });
    const symbol = $('st3-result-symbol');
    if (symbol) symbol.innerHTML = vector('w');
    renderExplore($('st3-explore'), STATIONS[2]);
    renderNotes($('st3-notes'), STATIONS[2]);
    renderIncline();
  }

  /* ---------------------------------------------------------------- predict */

  const predict = {
    ...PREDICT_SCENARIO.defaults,
    state: createPredictionState(),
  };

  function predictCorrectId(result) {
    if (result.isZero) return 'zero';
    if (result.equalMagnitudes) return 'bisector';
    return 'near-larger';
  }

  function paintPredict() {
    const result = concurrentResultant({
      f1: predict.f1,
      f2: predict.f2,
      angle: predict.angle,
      direction: predict.direction,
    });
    const scene = $('pil-predict-scene');
    if (scene) {
      scene.innerHTML = predictScene({
        f1: predict.f1,
        f2: predict.f2,
        angle: predict.angle,
        direction: predict.direction,
        reveal: predict.state.checked,
      }, 'pil-predict-live');
    }
    const values = $('pil-predict-values');
    if (values) {
      values.innerHTML = `<span>F₁ = ${N(predict.f1)}</span><span>F₂ = ${N(predict.f2)}</span><span>θ = ${fmt(predict.angle, 0)}°</span>`;
    }
    qsa('#pil-predict-choices [data-choice]').forEach((button) => {
      button.setAttribute('aria-pressed', String(predict.state.selectedId === button.dataset.choice));
      button.disabled = predict.state.checked;
    });
    const check = $('pil-predict-check');
    if (check) {
      check.disabled = !predict.state.selectedId || predict.state.checked;
      check.textContent = predict.state.checked ? 'تم التحقق ✓' : 'تحقق واكشف المحصلة';
    }
    const stateChip = $('pil-predict-state');
    if (stateChip) {
      stateChip.textContent = predict.state.checked
        ? (predict.state.correct ? 'توقع صحيح' : 'توقع يحتاج مراجعة')
        : predict.state.selectedId ? 'توقع مسجّل — لم يُتحقق بعد' : 'لم يُسجّل توقع';
    }
    ['pil-predict-f1', 'pil-predict-f2', 'pil-predict-angle'].forEach((id) => {
      const input = $(id);
      if (input) input.disabled = predict.state.checked;
    });
    const labels = {
      'pil-predict-f1-value': N(predict.f1),
      'pil-predict-f2-value': N(predict.f2),
      'pil-predict-angle-value': `${fmt(predict.angle, 0)}°`,
    };
    Object.entries(labels).forEach(([id, text]) => {
      const node = $(id);
      if (node) node.textContent = text;
    });
    return result;
  }

  function initPredict() {
    const container = $('pil-predict-choices');
    if (!container) return;
    container.innerHTML = PREDICT_SCENARIO.options.map(choiceButton).join('');

    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-choice]');
      if (!button || predict.state.checked) return;
      predict.state = choosePrediction(predict.state, button.dataset.choice);
      paintPredict();
    });

    ['pil-predict-f1', 'pil-predict-f2', 'pil-predict-angle'].forEach((id) => {
      $(id)?.addEventListener('input', (event) => {
        const key = id === 'pil-predict-f1' ? 'f1' : id === 'pil-predict-f2' ? 'f2' : 'angle';
        predict[key] = Number(event.target.value);
        paintPredict();
      });
    });

    $('pil-predict-check')?.addEventListener('click', () => {
      if (!predict.state.selectedId || predict.state.checked) return;
      const result = concurrentResultant({
        f1: predict.f1,
        f2: predict.f2,
        angle: predict.angle,
        direction: predict.direction,
      });
      const correctId = predictCorrectId(result);
      predict.state = checkPrediction(predict.state, correctId);
      paintPredict();
      const feedback = $('pil-predict-feedback');
      const correct = predict.state.correct;
      const detail = result.isZero
        ? 'القوتان متساويتان ومتعاكستان، لذلك المحصلة صفرية. لا يمكن تحديد اتجاه لمتجه صفري.'
        : `المحصلة المحسوبة الآن: ${N(result.magnitude)} بزاوية ${fmt(result.directionDegrees, 1)}°، ومنصف الزاوية عند ${fmt(result.bisectorDegrees, 1)}°. ${result.equalMagnitudes ? 'المقداران متساويان، لذلك تقع المحصلة على المنصف.' : `المقداران مختلفان، فالمحصلة أقرب إلى القوة الأكبر (${predict.f1 > predict.f2 ? 'F₁' : 'F₂'}).`}`;
      if (feedback) {
        feedbackBox(feedback, {
          kind: correct ? 'correct' : 'wrong',
          headline: correct ? 'توقعك صحيح.' : 'لاحظ الفرق بين التوقع والنتيجة.',
          detail: `${detail}<br><br>${PREDICT_SCENARIO.explanation}`,
        });
      }
      touchExperience('predict');
    });

    $('pil-predict-reset')?.addEventListener('click', () => {
      predict.f1 = PREDICT_SCENARIO.defaults.f1;
      predict.f2 = PREDICT_SCENARIO.defaults.f2;
      predict.angle = PREDICT_SCENARIO.defaults.angle;
      predict.state = resetPrediction();
      $('pil-predict-f1').value = predict.f1;
      $('pil-predict-f2').value = predict.f2;
      $('pil-predict-angle').value = predict.angle;
      const feedback = $('pil-predict-feedback');
      if (feedback) hideFeedback(feedback);
      paintPredict();
    });

    paintPredict();
  }

  /* ---------------------------------------------------------------- gallery */

  const gallery = {
    openId: null,
    points: {},
    angles: {},
    quizzes: new Map(),
  };

  /**
   * The point buttons only need ids and labels; the drawn hotspot positions are
   * resolved once inside physics-in-life-scenes.js, so no geometry is copied here.
   */
  function pointOptions(example) {
    return example.points ?? [];
  }

  function galleryScene(example, options = {}) {
    const angle = gallery.angles[example.id] ?? example.interactiveAngle?.initial ?? 35;
    return exampleScene(example, { angle, ...options }, `ex-${example.id}`);
  }

  function renderGalleryCards() {
    const container = $('pil-gallery-groups');
    if (!container) return;
    container.innerHTML = GALLERY_GROUPS.map((group) => `
      <section class="pil-gallery-group" aria-labelledby="pil-group-${group.id}">
        <div class="pil-gallery-group-heading">
          <h3 id="pil-group-${group.id}">${group.title}</h3>
          <span>${group.range}</span>
          <p>${group.note}</p>
        </div>
        <div class="pil-example-grid">
          ${EXAMPLES.filter((example) => example.group === group.id).map((example) => `
            <button class="pil-example-card${progress.seen.includes(`example-${example.id}`) ? ' is-seen' : ''}" type="button" data-example="${example.id}" aria-controls="pil-gallery-detail">
              <span class="pil-example-art" aria-hidden="true">
                ${exampleScene(example, { thumbnail: true, points: [] }, `thumb-${example.id}`)}
                <span class="pil-example-number">${example.number}</span>
              </span>
              <span class="pil-example-body">
                <strong>${example.title}</strong>
                <span>${example.subtitle}</span>
              </span>
            </button>`).join('')}
        </div>
      </section>`).join('');
  }

  function pointButtons(example) {
    return `<div class="pil-point-options" role="group" aria-label="${escapeHtml(example.pointPrompt)}">
      ${pointOptions(example).map((point, index) => `
        <button class="pil-draw-option" type="button" data-point-option="${escapeHtml(point.id)}" aria-pressed="${gallery.points[example.id] === point.id}">
          <span class="pil-compass-arrow" aria-hidden="true">${index + 1}</span>${escapeHtml(point.label)}
        </button>`).join('')}
    </div>`;
  }

  function renderDetail() {
    const detail = $('pil-gallery-detail');
    if (!detail) return;
    if (!gallery.openId) {
      detail.hidden = true;
      detail.innerHTML = '';
      return;
    }
    const example = findExample(gallery.openId);
    const selectedPointId = gallery.points[example.id] ?? null;
    const pointResult = selectedPointId ? selectPointOfEffect(example, selectedPointId) : null;
    const revealed = pointResult?.correct === true;
    const angle = gallery.angles[example.id] ?? example.interactiveAngle?.initial ?? 35;
    const components = example.interactiveAngle ? inclineComponents(example.weight ?? 300, angle) : null;

    const quizQuestion = { ...example.quiz, id: `example-${example.id}-quiz` };
    let controller = gallery.quizzes.get(example.id);
    if (!controller) {
      controller = createQuizController([quizQuestion], { compact: true, onChange: updateProgress });
      gallery.quizzes.set(example.id, controller);
    }

    detail.innerHTML = `
      <div class="pil-detail-head">
        <div>
          <p class="pil-kicker">المثال ${example.number} · ${GROUP_TITLES[example.group]}</p>
          <h3 id="pil-gallery-detail-title">${example.title}</h3>
          <p>${example.subtitle}</p>
        </div>
        <div class="pil-actions">
          <button class="pil-btn is-quiet" type="button" data-detail-close>إغلاق ✕</button>
        </div>
      </div>
      <div class="pil-detail-grid">
        <figure class="pil-detail-scene">
          <div id="pil-detail-scene">${galleryScene(example, {
            selectedPointId,
            pointCorrect: revealed,
            revealed,
          })}</div>
          <figcaption class="pil-scene-caption">
            <span class="pil-scale-note"><span class="pil-scale-dot" aria-hidden="true"></span> أطوال الأسهم متناسبة داخل المشهد نفسه</span>
            <span>انقر على النقاط المرقمة لتحديد نقطة التأثير</span>
          </figcaption>
        </figure>
        <div class="pil-detail-side">
          <p>${example.curiosity}</p>
          <div>
            <h4 id="pil-point-prompt">${example.pointPrompt}</h4>
            <p>اختر النقطة بالنقر على المشهد أو من القائمة.</p>
            ${pointButtons(example)}
            <div class="pil-point-feedback" role="status" aria-live="polite" ${pointResult ? '' : 'hidden'}>
              ${pointResult ? `<div class="pil-feedback ${pointResult.correct ? 'is-correct' : 'is-wrong'}"><strong>${pointResult.correct ? 'نقطة صحيحة.' : 'ليست نقطة التأثير.'}</strong><span class="pil-feedback-detail">${pointResult.message}</span></div>` : ''}
            </div>
          </div>
          ${components ? `
            <div class="pil-angle-control">
              <label for="pil-detail-angle">${example.interactiveAngle.label}: <b>${fmt(angle, 0)}°</b></label>
              <input id="pil-detail-angle" type="range" min="${example.interactiveAngle.min}" max="${example.interactiveAngle.max}" step="1" value="${angle}" />
              <div class="pil-angle-values">
                <span>w = ${N(example.weight ?? 300)}</span>
                <span>w∥ ≈ ${N(components.parallel)}</span>
                <span>w⊥ ≈ ${N(components.perpendicular)}</span>
              </div>
            </div>` : ''}
          <div>
            <h4>القوى في المشهد</h4>
            <ul class="pil-legend">
              ${example.forceLegend.map((item) => `<li><span class="pil-legend-swatch" style="background:${legendColor(item.color)}" aria-hidden="true"></span><b>${item.symbol}</b> ${item.label} — ${item.direction}</li>`).join('')}
            </ul>
            ${revealed ? '' : '<p class="pil-note">تُظهر الأسهم بعد اختيار نقطة التأثير الصحيحة.</p>'}
          </div>
          <p>${example.explanation}</p>
          <div class="pil-detail-quiz" id="pil-detail-quiz"></div>
          <p class="pil-detail-note">${example.note}</p>
        </div>
      </div>
      <div class="pil-detail-footer">
        <button class="pil-btn" type="button" data-detail-prev>المثال السابق</button>
        <button class="pil-btn" type="button" data-detail-next>المثال التالي</button>
        <button class="pil-btn is-quiet" type="button" data-detail-close>العودة إلى المعرض</button>
      </div>`;
    detail.hidden = false;

    const quizMount = detail.querySelector('#pil-detail-quiz');
    if (quizMount) controller.attach(quizMount);
  }

  function openExample(id) {
    const example = findExample(id);
    gallery.openId = id;
    touchExperience(`example-${example.id}`);
    renderGalleryCards();
    renderDetail();
    const detail = $('pil-gallery-detail');
    detail?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => detail?.querySelector('[data-detail-close]')?.focus({ preventScroll: true }), 260);
  }

  function refreshDetailScene() {
    const example = findExample(gallery.openId);
    const selectedPointId = gallery.points[example.id] ?? null;
    const pointResult = selectedPointId ? selectPointOfEffect(example, selectedPointId) : null;
    const revealed = pointResult?.correct === true;
    const scene = $('pil-detail-scene');
    if (scene) {
      scene.innerHTML = galleryScene(example, {
        selectedPointId,
        pointCorrect: revealed,
        revealed,
      });
    }
    const feedback = document.querySelector('.pil-detail-side .pil-point-feedback');
    if (feedback) {
      if (pointResult) {
        feedback.hidden = false;
        feedback.innerHTML = `<div class="pil-feedback ${pointResult.correct ? 'is-correct' : 'is-wrong'}"><strong>${pointResult.correct ? 'نقطة صحيحة.' : 'ليست نقطة التأثير.'}</strong><span class="pil-feedback-detail">${pointResult.message}</span></div>`;
      } else {
        feedback.hidden = true;
        feedback.innerHTML = '';
      }
    }
    qsa('[data-point-option]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.pointOption === selectedPointId));
    });
  }

  function chooseGalleryPoint(pointId) {
    const example = findExample(gallery.openId);
    gallery.points[example.id] = pointId;
    const result = selectPointOfEffect(example, pointId);
    gallery.points[example.id] = pointId;
    void result;
    /* Re-render once so the arrows appear only after a correct point. */
    renderDetail();
    const feedback = document.querySelector('.pil-detail-side .pil-point-feedback');
    feedback?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function initGallery() {
    renderGalleryCards();
    const groups = $('pil-gallery-groups');
    groups?.addEventListener('click', (event) => {
      const card = event.target.closest('[data-example]');
      if (card) openExample(card.dataset.example);
    });

    const detail = $('pil-gallery-detail');
    detail?.addEventListener('click', (event) => {
      const hotspot = event.target.closest('[data-point]');
      if (hotspot) {
        chooseGalleryPoint(hotspot.dataset.point);
        return;
      }
      const option = event.target.closest('[data-point-option]');
      if (option) {
        chooseGalleryPoint(option.dataset.pointOption);
        return;
      }
      if (event.target.closest('[data-detail-close]')) {
        const previousId = gallery.openId;
        const detailPanel = $('pil-gallery-detail');
        detailPanel.hidden = true;
        detailPanel.innerHTML = '';
        gallery.openId = null;
        renderGalleryCards();
        const card = document.querySelector(`[data-example="${previousId}"]`);
        card?.focus({ preventScroll: true });
        return;
      }
      if (event.target.closest('[data-detail-prev]') || event.target.closest('[data-detail-next]')) {
        const index = EXAMPLES.findIndex((example) => example.id === gallery.openId);
        const delta = event.target.closest('[data-detail-prev]') ? -1 : 1;
        const next = (index + delta + EXAMPLES.length) % EXAMPLES.length;
        openExample(EXAMPLES[next].id);
      }
    });

    detail?.addEventListener('keydown', (event) => {
      const hotspot = event.target.closest('[data-point]');
      if (hotspot && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        chooseGalleryPoint(hotspot.dataset.point);
      }
    });

    detail?.addEventListener('input', (event) => {
      if (event.target.id !== 'pil-detail-angle') return;
      const example = findExample(gallery.openId);
      gallery.angles[example.id] = Number(event.target.value);
      const angle = gallery.angles[example.id];
      const label = document.querySelector('.pil-angle-control label b');
      if (label) label.textContent = `${fmt(angle, 0)}°`;
      const components = inclineComponents(example.weight ?? 300, angle);
      const chips = qsa('.pil-angle-values span');
      if (chips.length === 3) {
        chips[0].textContent = `w = ${N(example.weight ?? 300)}`;
        chips[1].textContent = `w∥ ≈ ${N(components.parallel)}`;
        chips[2].textContent = `w⊥ ≈ ${N(components.perpendicular)}`;
      }
      refreshDetailScene();
    });
  }

  function legendColor(key) {
    const colors = {
      f1: '#16706b',
      f2: '#46629f',
      resultant: '#c96a4f',
      parallel: '#9a6a22',
      perpendicular: '#7a4a72',
      weight: '#24304a',
      reaction: '#5b667d',
    };
    return colors[key] ?? '#24304a';
  }

  /* ---------------------------------------------------------------- drawing */

  const drawing = {
    index: 0,
    answer: { pointId: null, symbolId: null, directionId: null, classificationId: null },
    submitted: false,
    result: null,
  };

  function currentChallenge() {
    return DRAWING_CHALLENGES[drawing.index];
  }

  function drawingComplete() {
    const answer = drawing.answer;
    return Boolean(answer.pointId && answer.symbolId && answer.directionId && answer.classificationId);
  }

  function buildDrawingSteps(challenge) {
    const indexChip = $('pil-drawing-index');
    if (indexChip) indexChip.textContent = `التحدي ${drawing.index + 1} من ${DRAWING_CHALLENGES.length}`;
    const situation = $('pil-drawing-situation');
    if (situation) {
      situation.innerHTML = `<h4><span class="pil-step-count">٠</span>${escapeHtml(challenge.title)}</h4><p class="pil-note">${escapeHtml(challenge.situation)}</p><p class="pil-predict-question">${escapeHtml(challenge.prompt)}</p>`;
    }
    const pointStep = $('pil-drawing-point-step');
    if (pointStep) {
      pointStep.innerHTML = `<h4><span class="pil-step-count">١</span>حدّد نقطة التأثير O</h4>
        <div class="pil-drawing-options">
          ${challenge.points.map((point, index) => `<button class="pil-draw-option" type="button" data-draw-point="${escapeHtml(point.id)}" aria-pressed="false"><span class="pil-compass-arrow" aria-hidden="true">${index + 1}</span>${escapeHtml(point.label)}</button>`).join('')}
        </div>`;
    }
    const symbolStep = $('pil-drawing-symbol-step');
    if (symbolStep) {
      symbolStep.innerHTML = `<h4><span class="pil-step-count">٢</span>اختر رمز القوة</h4>
        <div class="pil-drawing-options">
          ${challenge.symbols.map((symbol) => `<button class="pil-draw-option" type="button" data-draw-symbol="${escapeHtml(symbol.id)}" aria-pressed="false">${escapeHtml(symbol.label)}</button>`).join('')}
        </div>`;
    }
    const directionStep = $('pil-drawing-direction-step');
    if (directionStep) {
      directionStep.innerHTML = `<h4><span class="pil-step-count">٣</span>اختر اتجاه السهم</h4>
        <div class="pil-compass" role="group" aria-label="اتجاه السهم">
          ${COMPASS_DIRECTIONS.map((direction) => `<button class="pil-draw-option" type="button" data-draw-direction="${direction.id}" aria-pressed="false"><span class="pil-compass-arrow" aria-hidden="true">${compassGlyph(direction.degrees)}</span>${direction.label}</button>`).join('')}
        </div>`;
    }
    const classificationStep = $('pil-drawing-classification-step');
    if (classificationStep) {
      classificationStep.innerHTML = `<h4><span class="pil-step-count">٤</span>صنّف القوى</h4>
        <div class="pil-drawing-options">
          ${challenge.classifications.map((item) => `<button class="pil-draw-option" type="button" data-draw-classification="${escapeHtml(item.id)}" aria-pressed="false">${escapeHtml(item.label)}</button>`).join('')}
        </div>`;
    }
  }

  function paintDrawing() {
    const challenge = currentChallenge();
    const scene = $('pil-drawing-scene');
    if (scene) {
      scene.innerHTML = drawingScene(challenge, {
        answer: drawing.answer,
        challenge,
        submitted: drawing.submitted,
      }, `draw-${challenge.id}`);
    }
    qsa('[data-draw-point]').forEach((button) => {
      button.setAttribute('aria-pressed', String(drawing.answer.pointId === button.dataset.drawPoint));
      button.disabled = drawing.submitted;
    });
    qsa('[data-draw-symbol]').forEach((button) => {
      button.setAttribute('aria-pressed', String(drawing.answer.symbolId === button.dataset.drawSymbol));
      button.disabled = drawing.submitted;
    });
    qsa('[data-draw-direction]').forEach((button) => {
      button.setAttribute('aria-pressed', String(drawing.answer.directionId === button.dataset.drawDirection));
      button.disabled = drawing.submitted;
    });
    qsa('[data-draw-classification]').forEach((button) => {
      button.setAttribute('aria-pressed', String(drawing.answer.classificationId === button.dataset.drawClassification));
      button.disabled = drawing.submitted;
    });
    const submit = $('pil-drawing-submit');
    if (submit) submit.disabled = !drawingComplete() || drawing.submitted;
    const retry = $('pil-drawing-retry');
    if (retry) retry.textContent = drawing.submitted ? 'أعد المحاولة' : 'امسح إجاباتي';
    const feedback = $('pil-drawing-feedback');
    if (feedback) {
      feedback.innerHTML = drawing.submitted && drawing.result ? renderDrawingResult(challenge) : '';
    }
  }

  function renderDrawing() {
    buildDrawingSteps(currentChallenge());
    paintDrawing();
  }

  function compassGlyph(degrees) {
    return { 0: '→', 45: '↗', 90: '↑', 135: '↖', 180: '←', 225: '↙', 270: '↓', 315: '↘' }[degrees] ?? '·';
  }

  function renderDrawingResult(challenge) {
    const result = drawing.result;
    const point = challenge.points.find((candidate) => candidate.id === result.point.correctId);
    const symbol = challenge.symbols.find((candidate) => candidate.id === result.symbol.correctId);
    const classification = challenge.classifications.find((candidate) => candidate.id === result.classification.correctId);
    const direction = nearestCompassDirection(challenge.correctDirectionDegrees);
    const directionMessage = result.direction.ok
      ? 'الاتجاه صحيح ضمن مجال القبول.'
      : result.direction.status === 'close'
        ? `الاتجاه قريب (فرق ${fmt(result.direction.errorDegrees, 0)}°) لكن الاختيار الأدق هو ${direction?.label ?? ''} (${fmt(challenge.correctDirectionDegrees, 0)}°).`
        : `الاتجاه غير صحيح: المطلوب ${direction?.label ?? ''} (${fmt(challenge.correctDirectionDegrees, 0)}°).`;
    const rows = [
      { ok: result.point.ok, label: 'نقطة التأثير', text: result.point.ok ? 'صحيحة.' : `غير صحيحة — الصحيحة: ${point?.label ?? ''}.` },
      { ok: result.symbol.ok, label: 'رمز القوة', text: result.symbol.ok ? 'صحيح.' : `غير صحيح — الصحيح: ${symbol?.label ?? ''}.` },
      { ok: result.direction.ok, label: 'اتجاه السهم', text: directionMessage },
      { ok: result.classification.ok, label: 'تصنيف القوى', text: result.classification.ok ? 'صحيح.' : `غير صحيح — الصحيح: ${classification?.label ?? ''}.` },
    ];
    return `<div class="pil-feedback ${result.allCorrect ? 'is-correct' : 'is-wrong'}">
        <strong>${result.allCorrect ? 'رسمك مطابق تماماً.' : `أصبت ${result.correctCount} من 4 أجزاء.`}</strong>
        <span class="pil-feedback-detail">${challenge.explanation}</span>
      </div>
      <div class="pil-drawing-checks">
        ${rows.map((row) => `<div class="pil-check-row ${row.ok ? 'is-ok' : 'is-no'}"><span class="pil-check-mark" aria-hidden="true">${row.ok ? '✓' : '✕'}</span><span><b>${row.label}:</b> ${row.text}</span></div>`).join('')}
      </div>`;
  }

  function initDrawing() {
    const container = $('pil-drawing');
    container?.addEventListener('click', (event) => {
      if (drawing.submitted) return;
      if (event.target.closest('[data-draw-point]')) {
        drawing.answer.pointId = event.target.closest('[data-draw-point]').dataset.drawPoint;
        paintDrawing();
        return;
      }
      if (event.target.closest('[data-draw-symbol]')) {
        drawing.answer.symbolId = event.target.closest('[data-draw-symbol]').dataset.drawSymbol;
        paintDrawing();
        return;
      }
      if (event.target.closest('[data-draw-direction]')) {
        drawing.answer.directionId = event.target.closest('[data-draw-direction]').dataset.drawDirection;
        paintDrawing();
        return;
      }
      if (event.target.closest('[data-draw-classification]')) {
        drawing.answer.classificationId = event.target.closest('[data-draw-classification]').dataset.drawClassification;
        paintDrawing();
      }
    });

    $('pil-drawing-scene')?.addEventListener('click', (event) => {
      const hotspot = event.target.closest('[data-point]');
      if (!hotspot || drawing.submitted) return;
      drawing.answer.pointId = hotspot.dataset.point;
      paintDrawing();
    });
    $('pil-drawing-scene')?.addEventListener('keydown', (event) => {
      const hotspot = event.target.closest('[data-point]');
      if (!hotspot || drawing.submitted || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      drawing.answer.pointId = hotspot.dataset.point;
      paintDrawing();
    });

    $('pil-drawing-submit')?.addEventListener('click', () => {
      if (!drawingComplete() || drawing.submitted) return;
      const challenge = currentChallenge();
      const direction = compassDirection(drawing.answer.directionId);
      drawing.result = evaluateForceDrawing(challenge, {
        pointId: drawing.answer.pointId,
        symbolId: drawing.answer.symbolId,
        classificationId: drawing.answer.classificationId,
        directionId: drawing.answer.directionId,
        directionDegrees: direction?.degrees ?? null,
      });
      drawing.submitted = true;
      paintDrawing();
      touchExperience('drawing');
      $('pil-drawing-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    $('pil-drawing-retry')?.addEventListener('click', () => {
      drawing.answer = { pointId: null, symbolId: null, directionId: null, classificationId: null };
      drawing.submitted = false;
      drawing.result = null;
      renderDrawing();
    });

    $('pil-drawing-next')?.addEventListener('click', () => {
      drawing.index = (drawing.index + 1) % DRAWING_CHALLENGES.length;
      drawing.answer = { pointId: null, symbolId: null, directionId: null, classificationId: null };
      drawing.submitted = false;
      drawing.result = null;
      renderDrawing();
    });

    renderDrawing();
  }

  /* ------------------------------------------------- content for the steps */

  function renderTheory() {
    Object.values(STATION_THEORY).forEach((theory) => {
      const id = theory.station;
      const question = $(`pil-theory-${id}-question`);
      const lead = $(`pil-theory-${id}-lead`);
      const points = $(`pil-theory-${id}-points`);
      const formulaNode = $(`pil-theory-${id}-formula`);
      if (question) question.textContent = theory.question;
      if (lead) lead.textContent = theory.lead;
      if (points) {
        points.innerHTML = theory.points.map((point) => `<li><strong>${escapeHtml(point.title)}</strong><span>${escapeHtml(point.body)}</span></li>`).join('');
      }
      if (formulaNode) formulaNode.innerHTML = formula(theory.formula.tex, theory.formula.aria);
    });

    const objectives = $('pil-objectives-list');
    if (objectives) objectives.innerHTML = LESSON_META.objectives.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('');

    [STATION_THEORY.concurrent, STATION_THEORY.perpendicular, STATION_THEORY.incline].forEach((theory, index) => {
      const node = $(`pil-summary-formula-${index + 1}`);
      if (node) node.innerHTML = formula(theory.formula.tex, theory.formula.aria);
    });
  }

  /* ------------------------------------------------------------- station ui */

  function initStations() {
    $('st1-scene-name').textContent = `المشهد: ${STATIONS[0].scene}`;
    $('st2-scene-name').textContent = `المشهد: ${STATIONS[1].scene}`;
    $('st3-scene-name').textContent = `المشهد: ${STATIONS[2].scene}`;
    $('st1-title').textContent = STATIONS[0].title;
    $('st2-title').textContent = STATIONS[1].title;
    $('st3-title').textContent = STATIONS[2].title;

    initConcurrent();
    initPerpendicular();
    initIncline();

    const quizMounts = [
      ['st1-quiz', 'concurrent', 'اختبار المحطة الأولى'],
      ['st2-quiz', 'perpendicular', 'اختبار المحطة الثانية'],
      ['st3-quiz', 'incline', 'اختبار المحطة الثالثة'],
    ];
    quizMounts.forEach(([id, stationId, title]) => {
      const container = $(id);
      if (!container) return;
      const controller = createQuizController(STATION_QUIZZES[stationId], {
        title,
        intro: 'أجب ثم اضغط «تحقق». لا تظهر الإجابة قبل التحقق، ولكل سؤال تفسير بعد الإجابة.',
        onChange: updateProgress,
      });
      controller.attach(container);
      quizControllers[stationId] = controller;
    });
  }

  /* ------------------------------------------------------- twelve-step stepper */

  const stepper = new LessonStepper(LESSON_STEPS);
  const visitedSteps = new Set([LESSON_STEPS[0].id]);

  function stepState(step, index) {
    if (index === stepper.index) return 'current';
    return visitedSteps.has(step.id) ? 'complete' : 'upcoming';
  }

  function paintStepNav() {
    qsa('#pil-step-nav [data-step-index]').forEach((button) => {
      const index = Number(button.dataset.stepIndex);
      const step = LESSON_STEPS[index];
      if (!step) return;
      const state = stepState(step, index);
      if (state === 'current') button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      const marker = button.querySelector('[data-step-state]');
      if (marker) {
        marker.dataset.stepState = state;
        marker.textContent = state === 'current' ? 'أنت هنا' : state === 'complete' ? 'تمت ✓' : 'قادمة';
      }
    });
  }

  function buildStepNav() {
    const nav = $('pil-step-nav');
    if (!nav) return;
    nav.innerHTML = LESSON_STEPS.map((step, index) => `
      <button class="page-nav-button" type="button" data-step-index="${index}">
        <span class="nav-page-number" dir="ltr">${index + 1}</span>
        <span class="nav-page-copy"><strong>${escapeHtml(step.navLabel)}</strong><small>${escapeHtml(step.kindLabel)}</small></span>
        <span class="pil-step-state" data-step-state="upcoming">قادمة</span>
      </button>`).join('');

    nav.addEventListener('click', (event) => {
      const button = event.target.closest('[data-step-index]');
      if (!button) return;
      showStep(Number(button.dataset.stepIndex), { focusHeading: true });
    });

    nav.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = stepper.index;
      if (event.key === 'ArrowDown') next = (stepper.index + 1) % LESSON_STEPS.length;
      if (event.key === 'ArrowUp') next = (stepper.index - 1 + LESSON_STEPS.length) % LESSON_STEPS.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = LESSON_STEPS.length - 1;
      showStep(next, { focusHeading: true });
      qsa('#pil-step-nav [data-step-index]')[next]?.focus({ preventScroll: true });
    });
  }

  /**
   * Show exactly one station. Every section stays mounted so slider values,
   * answers and quiz state survive navigation; only visibility changes.
   */
  function showStep(index, { focusHeading = false, updateHash = true } = {}) {
    stepper.goTo(index);
    const step = stepper.page;
    visitedSteps.add(step.id);
    stopInactiveMotions(step.kind === 'lab' ? step.station : null);

    qsa('#pil-step-content [data-step-id]').forEach((section) => {
      section.hidden = section.dataset.stepId !== step.id;
    });

    const heading = $('pil-step-heading');
    if (heading) heading.textContent = step.title;
    const kicker = $('pil-step-kicker');
    if (kicker) kicker.textContent = `المحطة ${stepper.position} من ${stepper.total}`;
    const badge = $('pil-step-badge');
    if (badge) badge.textContent = String(stepper.position);
    const counter = $('progress-text');
    if (counter) counter.textContent = `${visitedSteps.size} / ${stepper.total}`;
    const fill = $('progress-fill');
    if (fill) fill.style.width = `${(visitedSteps.size / stepper.total) * 100}%`;
    const track = $('progress-track');
    if (track) {
      track.setAttribute('aria-valuemax', String(stepper.total));
      track.setAttribute('aria-valuenow', String(visitedSteps.size));
    }

    const previousButton = $('previous-button');
    const nextButton = $('next-button');
    if (previousButton) previousButton.disabled = stepper.isFirst;
    if (nextButton) nextButton.disabled = stepper.isLast;
    const previousLabel = $('previous-label');
    const nextLabel = $('next-label');
    if (previousLabel) previousLabel.textContent = stepper.isFirst ? 'بداية الدرس' : stepper.labelFor('previous');
    if (nextLabel) nextLabel.textContent = stepper.isLast ? 'نهاية الدرس' : stepper.labelFor('next');
    const center = $('control-center');
    if (center) center.textContent = `المحطة ${stepper.position} من ${stepper.total}`;

    paintStepNav();

    if (updateHash) {
      try { history.replaceState(null, '', `#${step.id}`); } catch { /* file:// or sandboxed frame */ }
    }
    if (focusHeading) {
      heading?.focus({ preventScroll: true });
      try {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      } catch { /* very old browser */ }
    }
  }

  function initSteps() {
    buildStepNav();
    $('previous-button')?.addEventListener('click', () => showStep(stepper.index - 1, { focusHeading: true }));
    $('next-button')?.addEventListener('click', () => showStep(stepper.index + 1, { focusHeading: true }));

    $('pil-content')?.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-goto-step]');
      if (!trigger) return;
      const index = LESSON_STEPS.findIndex((step) => step.id === trigger.dataset.gotoStep);
      if (index >= 0) showStep(index, { focusHeading: true });
    });

    document.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
      const tag = event.target?.tagName;
      if (event.target?.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;
      if (event.key === 'PageUp' || event.key === 'ArrowRight') {
        event.preventDefault();
        showStep(stepper.index - 1, { focusHeading: true });
      } else if (event.key === 'PageDown' || event.key === 'ArrowLeft') {
        event.preventDefault();
        showStep(stepper.index + 1, { focusHeading: true });
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) Object.values(motions).forEach((controller) => controller.pause());
    });
    window.addEventListener('pagehide', () => {
      Object.values(motions).forEach((controller) => controller.destroy());
    });

    /* Keep the old in-page anchors working for bookmarks and shared links. */
    const LEGACY_HASHES = {
      'pil-stations': 'lab-concurrent',
      'pil-predict': 'predict',
      'pil-gallery': 'gallery',
      'pil-drawing': 'drawing',
    };
    const rawHash = window.location?.hash?.replace('#', '') ?? '';
    const hash = LEGACY_HASHES[rawHash] ?? rawHash;
    const start = LESSON_STEPS.findIndex((step) => step.id === hash);
    showStep(start > 0 ? start : 0, { updateHash: true });
  }

  /* ------------------------------------------------------------------- boot */

  const sessionNote = $('pil-session-note');
  if (sessionNote) sessionNote.textContent = SESSION_NOTE;
  const kicker = $('pil-lesson-kicker');
  if (kicker) kicker.textContent = `${LESSON_META.section} · الدرس الأول`;
  const openingCopy = $('pil-lesson-opening');
  if (openingCopy) openingCopy.textContent = LESSON_META.opening;
  const lead = $('pil-lesson-lead');
  if (lead) lead.textContent = LESSON_META.intro;

  renderTheory();
  initSteps();
  initStations();
  initOpening();
  initPredict();
  initGallery();
  initDrawing();
  updateProgress();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountLesson, { once: true });
} else {
  mountLesson();
}
