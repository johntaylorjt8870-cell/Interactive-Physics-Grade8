import { degrees, formula, qty, solutionSteps, tex, vector } from './math.js';
import {
  EDUCATIONAL_MASS_KG,
  MAX_FORCE_COUNT,
  MAX_FORCE_MAGNITUDE,
  RESULTANT_EPSILON,
  addForce,
  advanceMotion,
  createMotionState,
  evaluateResultantTarget,
  removeForce,
  resultantOfForces,
  updateForce,
} from './appendix-physics.js';
import {
  APPENDIX_EXTENSION_LABEL,
  EDUCATIONAL_MODEL_LABEL,
  FORCE_PRESETS,
  PRACTICE_QUESTIONS,
  WORKED_EXAMPLE,
  ZERO_RESULTANT_CHALLENGE,
  findPreset,
} from './lesson-1-appendix-content.js';
import {
  checkPracticeAnswer,
  createPracticeState,
  selectPracticeChoice,
} from './appendix-practice.js';

const FORCE_COLORS = ['#16706b', '#46629f', '#9a6a22'];
const CENTER = { x: 380, y: 260 };
const PIXELS_PER_METER = 70;
const MAX_VECTOR_PIXELS = 158;
const FORCE_MATH_SYMBOLS = Array.from({ length: MAX_FORCE_COUNT }, (_, index) => vector('F', String(index + 1)));
const RESULTANT_MATH_SYMBOL = vector('F');

const formatNumber = (value, digits = 2) => {
  if (!Number.isFinite(value)) return '0';
  return Number(value.toFixed(digits)).toString();
};

const forceCountLabel = (count) => count === 1 ? 'قوة واحدة' : count === 2 ? 'قوتان' : 'ثلاث قوى';

function escapedHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function mountAppendix(root) {
  const byId = (id) => root.querySelector(`#${id}`);
  const presetButtons = byId('preset-buttons');
  const presetObservation = byId('preset-observation');
  const forceControls = byId('force-controls');
  const forceLegend = byId('force-legend');
  const forceCount = byId('force-count');
  const resultMagnitude = byId('result-magnitude');
  const resultDirection = byId('result-direction');
  const resultAcceleration = byId('result-acceleration');
  const resultVectorSymbol = byId('result-vector-symbol');
  const forceVectorLayer = byId('force-vector-layer');
  const resultantVector = byId('resultant-vector');
  const resultantZero = byId('resultant-zero');
  const motionTrail = byId('motion-trail');
  const body = byId('lab-body');
  const diagramDescription = byId('force-diagram-description');
  const liveObservation = byId('live-observation');
  const labStatus = byId('lab-status');
  const toggleMotionButton = byId('toggle-motion');
  const motionButtonLabel = byId('motion-button-label');
  const addForceButton = byId('add-force');
  const workedSteps = byId('worked-example-steps');
  const workedProgress = byId('worked-example-progress');
  const nextExampleButton = byId('next-example-step');
  const resetExampleButton = byId('reset-example');
  const practiceRoot = byId('practice-questions');
  const challengeStatus = byId('challenge-status');
  const startChallengeButton = byId('start-challenge');
  const checkChallengeButton = byId('check-challenge');
  const resetChallengeButton = byId('reset-challenge');
  const summaryEquation = byId('summary-equation');

  if (![presetButtons, forceControls, forceVectorLayer, resultMagnitude, labStatus].every(Boolean)) return;

  const initialPreset = findPreset('angle-explorer');
  let forces = initialPreset.forces.map((force) => ({ ...force }));
  let currentPresetId = initialPreset.id;
  let currentResult = resultantOfForces(forces);
  let motion = createMotionState();
  let motionRunning = false;
  let frameHandle = null;
  let previousFrameTime = null;
  let challengeActive = false;
  let visibleExampleSteps = 1;
  const practiceStates = new Map(PRACTICE_QUESTIONS.map((question) => [question.id, createPracticeState(question.id)]));
  const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference?.matches === true;

  resultVectorSymbol.innerHTML = RESULTANT_MATH_SYMBOL;
  root.querySelector('#challenge-target-symbol').innerHTML = RESULTANT_MATH_SYMBOL;
  root.querySelector('#platform-concepts').innerHTML = renderPlatformConcepts();
  summaryEquation.innerHTML = formula('\\vec{F}_{R}=\\sum_{i=1}^{n}\\vec{F}_{i}', 'the resultant force vector equals the vector sum of all forces');

  function renderPlatformConcepts() {
    const concepts = [
      {
        title: 'القوة مقدار واتجاه',
        paragraphs: [
          `القوة تفاعل يؤثر في حركة جسم أو يحاول تغييرها. لذلك لا تكفي قيمة عددية واحدة لوصفها: نحتاج مقداراً واتجاهاً ونقطة تأثير. مقدار القوة يكتب بالنيوتن، واتجاهها يحدد أي مركبات ستسهم في المحصلة.`,
          `نستعمل ${vector('F', '1')} و${vector('F', '2')} لتسمية قوى مختلفة؛ السهم فوق الرمز علامة رياضية على أن ترتيب الاتجاه جزء من المعنى، وليس زينة فوق الحرف.`,
        ],
      },
      {
        title: 'اجمع المركبات على المحاور',
        paragraphs: [
          `عند اجتماع قوى من اتجاهات مختلفة، لا نجمع مقاديرها مباشرة. نفكك كل قوة إلى مركبتين على محورين متعامدين، ثم نجمع الإشارات والمقادير على المحور نفسه:`,
        ],
        equations: [
          formula('F_{Rx}=\\sum_{i=1}^{n}F_i\\cos\\theta_i', 'R x equals the sum of each force magnitude times cosine of its angle'),
          formula('F_{Ry}=\\sum_{i=1}^{n}F_i\\sin\\theta_i', 'R y equals the sum of each force magnitude times sine of its angle'),
          formula('F_R=\\sqrt{F_{Rx}^{2}+F_{Ry}^{2}}', 'resultant magnitude equals the square root of R x squared plus R y squared'),
        ],
      },
      {
        title: 'الزاوية تغيّر مساهمة القوة',
        paragraphs: [
          `تقاس الزاوية في هذا المختبر عكس عقارب الساعة ابتداءً من محور x الموجب: ${degrees(0)} إلى اليمين، ${degrees(90)} إلى الأعلى، ${degrees(180)} إلى اليسار، و${degrees(270)} إلى الأسفل. في SVG ينعكس اتجاه محور y بصرياً فقط كي تظهر القيم الموجبة إلى الأعلى.`,
          `عندما تدور القوة ويبقى مقدارها ثابتاً، يتغير كل من ${tex('F_x=F\\cos\\theta', 'F x equals F cosine theta')} و${tex('F_y=F\\sin\\theta', 'F y equals F sine theta')}. لهذا قد يتغير مقدار المحصلة واتجاهها معاً.`,
        ],
      },
      {
        title: 'المحصلة والتسارع في النموذج',
        paragraphs: [
          `يطبق المختبر ${tex('\\vec{a}=\\frac{\\vec{F}_{R}}{m}', 'acceleration vector equals resultant force divided by mass')} على كتلة تعليمية ثابتة مقدارها ${qty(EDUCATIONAL_MASS_KG, 'kg')}. لذلك يكون اتجاه التسارع في جهة المحصلة؛ ومقدار التسارع يتناسب معها في هذا النموذج.`,
          `النموذج انتقالي بلا احتكاك أو دوران أو تصادمات، ويضغط الزمن والمسافة بصرياً كي يظهر الأثر. إذا كانت المحصلة صفراً والجسم بدأ من السكون، يبقى ساكناً؛ أما جسم له سرعة سابقة فيستمر بها ما دام النموذج لا يضيف قوة مقاومة.`,
        ],
      },
      {
        title: 'تحقّق قبل اعتماد النتيجة',
        paragraphs: [
          'لا تعتمد على لون السهم وحده؛ اقرأ رمزه ومقداره وزاويته. قارن أيضاً بين المركبات قبل النظر إلى شكل الحركة.',
        ],
        errors: [
          'جمع المقادير دائماً حتى عندما تكون القوى متعاكسة.',
          'اعتبار الزاوية بين قوتين مساوية تلقائياً لزاوية كل منهما من محور x.',
          'استنتاج اتجاه المحصلة من أطول سهم من دون جمع المركبات.',
          'الخلط بين «محصلة صفر» و«سرعة صفر»؛ المحصلة تحدد التسارع، لا السرعة السابقة.',
        ],
        className: 'appendix-common-error',
      },
    ];
    return concepts.map((concept, index) => `<article class="appendix-concept-card ${concept.className ?? ''}">
      <h3><span class="appendix-concept-index" aria-hidden="true">0${index + 1}</span>${concept.title}</h3>
      ${concept.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}
      ${(concept.equations ?? []).join('')}
      ${concept.errors ? `<ul>${concept.errors.map((error) => `<li>${error}</li>`).join('')}</ul>` : ''}
    </article>`).join('');
  }

  function setLabStatus(message) {
    labStatus.textContent = message;
  }

  function updatePresetSelection() {
    for (const button of presetButtons.querySelectorAll('[data-preset-id]')) {
      button.setAttribute('aria-pressed', String(button.dataset.presetId === currentPresetId));
    }
  }

  function renderPresetButtons() {
    presetButtons.innerHTML = FORCE_PRESETS.map((preset) => `<button class="appendix-preset-button" type="button" data-preset-id="${escapedHtml(preset.id)}" aria-pressed="${preset.id === currentPresetId}" aria-describedby="preset-observation">
      <strong>${escapedHtml(preset.title)}</strong><small>${escapedHtml(preset.countLabel)} · منصة</small>
    </button>`).join('');
  }

  function renderForceControls(focusIndex = null) {
    forceControls.innerHTML = forces.map((force, index) => {
      const locked = challengeActive && index !== ZERO_RESULTANT_CHALLENGE.editableForceIndex;
      const forceNumber = index + 1;
      const magnitudeId = `force-magnitude-${index}`;
      const angleId = `force-angle-${index}`;
      const magnitudeTextId = `force-magnitude-value-${index}`;
      const angleTextId = `force-angle-value-${index}`;
      const helpId = `force-angle-help-${index}`;
      return `<fieldset class="appendix-force-card" data-force-card="${index}"${locked ? ' aria-disabled="true"' : ''}>
        <legend class="appendix-force-card-title" id="force-title-${index}">
          <span class="force-color-mark" style="--force-color:${FORCE_COLORS[index]}" aria-hidden="true"></span>
          <span>القوة ${FORCE_MATH_SYMBOLS[index]}</span>
        </legend>
        <div class="appendix-force-card-head">
          <button class="appendix-remove-force" type="button" data-remove-force="${index}" aria-label="حذف القوة رقم ${forceNumber}"${forces.length <= 1 || challengeActive ? ' disabled' : ''}>حذف القوة</button>
        </div>
        <div class="appendix-force-field">
          <div class="appendix-force-field-head"><label for="${magnitudeId}">المقدار</label><output id="${magnitudeTextId}" for="${magnitudeId}"><bdi dir="ltr">${formatNumber(force.magnitude, 1)} N</bdi></output></div>
          <input class="appendix-force-range" id="${magnitudeId}" type="range" min="0" max="${MAX_FORCE_MAGNITUDE}" step="0.5" value="${force.magnitude}" data-force-index="${index}" data-force-field="magnitude" aria-label="مقدار القوة رقم ${forceNumber} بالنيوتن" aria-valuetext="${formatNumber(force.magnitude, 1)} نيوتن" aria-describedby="force-title-${index}"${locked ? ' disabled' : ''} />
        </div>
        <div class="appendix-force-field">
          <div class="appendix-force-field-head"><label for="${angleId}">الاتجاه من محور x الموجب</label><output id="${angleTextId}" for="${angleId}"><bdi dir="ltr">${formatNumber(force.angleDegrees, 0)}°</bdi></output></div>
          <input class="appendix-force-range" id="${angleId}" type="range" min="0" max="359" step="1" value="${force.angleDegrees}" data-force-index="${index}" data-force-field="angleDegrees" aria-label="اتجاه القوة رقم ${forceNumber} بالدرجات عكس عقارب الساعة من محور x الموجب" aria-valuetext="${formatNumber(force.angleDegrees, 0)} درجة" aria-describedby="${helpId}"${locked ? ' disabled' : ''} />
          <p class="appendix-range-note" id="${helpId}"><bdi dir="ltr">0°</bdi> يمين · <bdi dir="ltr">90°</bdi> أعلى · <bdi dir="ltr">180°</bdi> يسار · <bdi dir="ltr">270°</bdi> أسفل</p>
        </div>
      </fieldset>`;
    }).join('');
    forceCount.textContent = forceCountLabel(forces.length);
    addForceButton.disabled = challengeActive || forces.length >= MAX_FORCE_COUNT;
    if (focusIndex !== null) {
      const focusTarget = forceControls.querySelector(`[data-force-index="${focusIndex}"][data-force-field="magnitude"]`)
        ?? forceControls.querySelector('[data-force-index][data-force-field="magnitude"]');
      focusTarget?.focus();
    }
  }

  function renderForceLegend(result) {
    const entries = forces.map((force, index) => `<li class="appendix-force-legend-item">
      <span class="legend-line ${index === 1 ? 'dashed' : index === 2 ? 'dotted' : ''}" style="--legend-color:${FORCE_COLORS[index]}" aria-hidden="true"></span>
      <span>${FORCE_MATH_SYMBOLS[index]}</span>
      <bdi dir="ltr">${formatNumber(force.magnitude, 1)} N · ${formatNumber(force.angleDegrees, 0)}°</bdi>
    </li>`);
    entries.push(`<li class="appendix-force-legend-item"><span class="legend-line result" aria-hidden="true"></span><span>${RESULTANT_MATH_SYMBOL}</span><strong>المحصلة</strong></li>`);
    forceLegend.innerHTML = `<ul>${entries.join('')}</ul>`;
  }

  function updateResults(result) {
    resultMagnitude.innerHTML = qty(formatNumber(result.magnitude), 'N');
    resultDirection.innerHTML = result.directionDegrees === null
      ? '<span dir="rtl">لا يوجد اتجاه للمحصلة</span>'
      : degrees(formatNumber(result.directionDegrees, 1));
    resultAcceleration.innerHTML = qty(formatNumber(result.magnitude / EDUCATIONAL_MASS_KG), 'm/s^{2}');
    renderForceLegend(result);
  }

  function updateDiagram(result) {
    const origin = {
      x: CENTER.x + motion.position.x * PIXELS_PER_METER,
      y: CENTER.y - motion.position.y * PIXELS_PER_METER,
    };
    const largestVector = Math.max(result.magnitude, ...forces.map((force) => force.magnitude), RESULTANT_EPSILON);
    const pixelsPerNewton = Math.min(18, MAX_VECTOR_PIXELS / largestVector);
    const forceMarkup = result.forces.map((force, index) => {
      const end = { x: origin.x + force.x * pixelsPerNewton, y: origin.y - force.y * pixelsPerNewton };
      const labelX = end.x + (force.x < 0 ? -10 : 10);
      const labelY = end.y + (force.y > 0 ? -8 : 15);
      const hidden = force.magnitude <= RESULTANT_EPSILON ? ' visibility="hidden"' : '';
      return `<g aria-hidden="true">
        <line class="lab-force-vector force-index-${index + 1}" x1="${origin.x.toFixed(2)}" y1="${origin.y.toFixed(2)}" x2="${end.x.toFixed(2)}" y2="${end.y.toFixed(2)}" stroke="${FORCE_COLORS[index]}" marker-end="url(#lab-force-arrow-${index + 1})"${hidden} />
        <text class="lab-force-label" x="${labelX.toFixed(2)}" y="${labelY.toFixed(2)}" direction="ltr"${hidden}>${index + 1}</text>
      </g>`;
    }).join('');
    forceVectorLayer.innerHTML = forceMarkup;

    if (result.magnitude > RESULTANT_EPSILON) {
      const endX = origin.x + result.components.x * pixelsPerNewton;
      const endY = origin.y - result.components.y * pixelsPerNewton;
      resultantVector.setAttribute('x1', origin.x.toFixed(2));
      resultantVector.setAttribute('y1', origin.y.toFixed(2));
      resultantVector.setAttribute('x2', endX.toFixed(2));
      resultantVector.setAttribute('y2', endY.toFixed(2));
      resultantVector.setAttribute('visibility', 'visible');
      resultantZero.setAttribute('visibility', 'hidden');
    } else {
      resultantVector.setAttribute('x1', origin.x.toFixed(2));
      resultantVector.setAttribute('y1', origin.y.toFixed(2));
      resultantVector.setAttribute('x2', origin.x.toFixed(2));
      resultantVector.setAttribute('y2', origin.y.toFixed(2));
      resultantVector.setAttribute('visibility', 'hidden');
      resultantZero.setAttribute('cx', origin.x.toFixed(2));
      resultantZero.setAttribute('cy', origin.y.toFixed(2));
      resultantZero.setAttribute('visibility', 'visible');
    }

    motionTrail.setAttribute('x1', CENTER.x);
    motionTrail.setAttribute('y1', CENTER.y);
    motionTrail.setAttribute('x2', origin.x.toFixed(2));
    motionTrail.setAttribute('y2', origin.y.toFixed(2));
    motionTrail.setAttribute('visibility', Math.hypot(origin.x - CENTER.x, origin.y - CENTER.y) > 1 ? 'visible' : 'hidden');
    body.setAttribute('transform', `translate(${origin.x.toFixed(2)} ${origin.y.toFixed(2)})`);

    const forceWords = ['الأولى', 'الثانية', 'الثالثة'];
    const description = forces.map((_, index) => `القوة ${forceWords[index]}`).join('، ');
    diagramDescription.textContent = `جسم عند نقطة تأثير مشتركة. تظهر ${description} في مفتاح المتجهات أسفل الرسم، ويظهر سهم المحصلة بلون ونمط مختلفين. اتجاه الزاوية يبدأ من محور x الموجب عكس عقارب الساعة؛ القيم العددية معزولة في المفتاح والنتيجة.`;
  }

  function updateObservation(result) {
    if (result.magnitude <= RESULTANT_EPSILON) {
      liveObservation.innerHTML = `تتلاشى المركبات الأفقية والرأسية في هذه الحالة، لذلك ${vector('F')} المحصلة تساوي صفراً ولا ينتج عنها تسارع. بدأ الجسم من السكون؛ لذا يبقى ساكناً ما دامت القوى متوازنة. في نموذج بلا احتكاك، لا يعني ذلك أن جسماً متحركاً سيتوقف تلقائياً.`;
      return;
    }
    const angle = degrees(formatNumber(result.directionDegrees, 1));
    const accel = qty(formatNumber(result.magnitude / EDUCATIONAL_MASS_KG), 'm/s^{2}');
    liveObservation.innerHTML = `المحصلة مقدارها ${qty(formatNumber(result.magnitude), 'N')} عند ${angle}، واتجاه التسارع ${vector('a')} نحو الجهة نفسها. في النموذج ذي الكتلة الثابتة ${qty(EDUCATIONAL_MASS_KG, 'kg')} يكون مقدار التسارع ${accel}. إذا كان للجسم سرعة سابقة فقد يختلف اتجاه حركته اللحظي عن اتجاه التسارع؛ لا يضيف هذا النموذج احتكاكاً لإيقافه.`;
  }

  function renderLab() {
    currentResult = resultantOfForces(forces);
    updateResults(currentResult);
    updateDiagram(currentResult);
    updateObservation(currentResult);
    updatePresetSelection();
  }

  function clearChallengeFeedback(message = '') {
    if (!challengeActive) return;
    if (message) challengeStatus.textContent = message;
    else challengeStatus.textContent = 'تغيّرت القوى؛ اجمع المركبات من جديد ثم تحقّق من هدف التحدي.';
  }

  function announceResult(prefix = 'تحدّثت الحالة.') {
    const result = resultantOfForces(forces);
    const direction = result.directionDegrees === null
      ? 'ولا يوجد اتجاه للمحصلة الصفرية'
      : `واتجاهها <bdi dir="ltr">${formatNumber(result.directionDegrees, 1)}°</bdi>`;
    labStatus.innerHTML = `${prefix} المحصلة <bdi dir="ltr">${formatNumber(result.magnitude)} N</bdi>، ${direction}.`;
  }

  function setForces(nextForces, { presetId = null, observation = '', focusControls = false } = {}) {
    pauseMotion(false);
    challengeActive = false;
    forces = nextForces.map((force) => ({ ...force }));
    motion = createMotionState();
    currentPresetId = presetId;
    renderForceControls(focusControls ? forces.length - 1 : null);
    renderLab();
    presetObservation.textContent = observation || 'تجربة حرة: عدّل مقداراً أو اتجاهاً، ثم فسّر أثره قبل تشغيل الحركة.';
    checkChallengeButton.hidden = true;
    resetChallengeButton.hidden = true;
    startChallengeButton.hidden = false;
  }

  function scrollToLabResults() {
    const heading = byId('scene-heading');
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function loadPreset(preset, { focusLab = true } = {}) {
    if (!preset) return;
    setForces(preset.forces, { presetId: preset.id, observation: `${preset.observation} ${preset.prediction}` });
    setLabStatus(`حُمّلت تجربة «${preset.title}». توقّع الاستجابة، ثم شغّل الحركة عندما تستعد للمقارنة.`);
    if (focusLab) scrollToLabResults();
  }

  function updateMotionButton() {
    toggleMotionButton.setAttribute('aria-pressed', String(motionRunning));
    motionButtonLabel.textContent = motionRunning ? 'أوقف الحركة مؤقتاً' : 'شغّل الحركة';
    toggleMotionButton.querySelector('.motion-play-mark').textContent = motionRunning ? 'Ⅱ' : '▶';
  }

  function pauseMotion(announce = true) {
    const wasRunning = motionRunning;
    motionRunning = false;
    previousFrameTime = null;
    if (frameHandle !== null && typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(frameHandle);
    frameHandle = null;
    updateMotionButton();
    if (announce && wasRunning) setLabStatus('أُوقفت الحركة مؤقتاً؛ بقيت القوى والمحصلة كما هما.');
  }

  function animationFrame(now) {
    if (!motionRunning) return;
    const elapsed = previousFrameTime === null ? 0 : Math.max(0, (now - previousFrameTime) / 1000);
    previousFrameTime = now;
    motion = advanceMotion(motion, currentResult, elapsed);
    updateDiagram(currentResult);
    if (motion.boundaryReached) {
      pauseMotion(false);
      setLabStatus('وصل الجسم إلى حد المشهد التعليمي؛ أعد التجربة للبدء من السكون. حد المشهد ليس مسافة فيزيائية.');
      return;
    }
    frameHandle = window.requestAnimationFrame(animationFrame);
  }

  function reducedMotionPreview() {
    motion = createMotionState();
    if (currentResult.magnitude > RESULTANT_EPSILON) {
      for (let frame = 0; frame < 18; frame += 1) motion = advanceMotion(motion, currentResult, 0.05);
    }
    updateDiagram(currentResult);
    if (currentResult.magnitude <= RESULTANT_EPSILON) {
      setLabStatus('عرض ثابت: المحصلة صفر، والجسم يبدأ من السكون؛ لا يوجد تسارع في هذه الحالة.');
    } else {
      setLabStatus('عرض ثابت لتقليل الحركة: تغيّر الموضع نحو جهة المحصلة. الرسم المكاني والزمني تعليمي وغير مقياسي.');
    }
  }

  function startMotion() {
    if (motionRunning) return;
    if (reducedMotion) {
      reducedMotionPreview();
      return;
    }
    if (currentResult.magnitude <= RESULTANT_EPSILON
        && Math.hypot(motion.velocity.x, motion.velocity.y) <= RESULTANT_EPSILON) {
      updateDiagram(currentResult);
      setLabStatus('المحصلة صفر والجسم يبدأ من السكون؛ لذلك لا يتسارع. غيّر قوة أو اتجاهاً لمشاهدة استجابة حركية.');
      return;
    }
    if (typeof window.requestAnimationFrame !== 'function') {
      setLabStatus('تعذّر تشغيل الحركة في هذا المتصفح؛ ما زال حساب المحصلة والرسم متاحين.');
      return;
    }
    motionRunning = true;
    previousFrameTime = null;
    updateMotionButton();
    setLabStatus('الحركة تعمل: التسارع يتجه مع المحصلة. الزمن والموقع على الشاشة ليسا بمقياس واقعي.');
    frameHandle = window.requestAnimationFrame(animationFrame);
  }

  function handleForceInput(input) {
    const index = Number(input.dataset.forceIndex);
    const field = input.dataset.forceField;
    const value = Number(input.value);
    const patch = field === 'magnitude' ? { magnitude: value } : { angleDegrees: value };
    forces = updateForce(forces, index, patch);
    currentPresetId = null;
    if (!motionRunning) motion = createMotionState();
    const outputId = field === 'magnitude' ? `force-magnitude-value-${index}` : `force-angle-value-${index}`;
    const output = byId(outputId);
    if (field === 'magnitude') {
      output.innerHTML = `<bdi dir="ltr">${formatNumber(value, 1)} N</bdi>`;
      input.setAttribute('aria-valuetext', `${formatNumber(value, 1)} نيوتن`);
    } else {
      output.innerHTML = `<bdi dir="ltr">${formatNumber(value, 0)}°</bdi>`;
      input.setAttribute('aria-valuetext', `${formatNumber(value, 0)} درجة`);
    }
    renderLab();
    presetObservation.innerHTML = `تجربة حرة: ${FORCE_MATH_SYMBOLS[index]} تغيّرت. قارن الآن مركباتها ومقدار المحصلة، ثم توقّع أثرها على التسارع.`;
    clearChallengeFeedback();
  }

  function loadPracticeCase(question) {
    if (question.applyPresetId) {
      const preset = findPreset(question.applyPresetId);
      loadPreset({ ...preset, observation: question.applyObservation, prediction: '' }, { focusLab: true });
      return;
    }
    setForces(question.applyForces, { presetId: null, observation: question.applyObservation });
    setLabStatus(`طُبقت الحالة التدريبية: ${question.applyObservation}`);
    scrollToLabResults();
  }

  function renderPracticeQuestions() {
    practiceRoot.innerHTML = PRACTICE_QUESTIONS.map((question, index) => `<article class="appendix-question-card" data-practice-card="${escapedHtml(question.id)}">
      <div class="appendix-question-heading"><span class="appendix-question-number" aria-hidden="true" dir="ltr">0${index + 1}</span><h3>${escapedHtml(question.title)}</h3></div>
      <div class="appendix-question-prompt">${question.promptHtml}</div>
      <fieldset class="appendix-choice-list">
        <legend>اختر توقعك؛ لن تظهر النتيجة حتى تتحقق منه.</legend>
        ${question.choices.map((choice) => `<label class="appendix-choice">
          <input type="radio" name="practice-${escapedHtml(question.id)}" value="${escapedHtml(choice.id)}" data-practice-choice="${escapedHtml(question.id)}" />
          <span>${choice.html}</span>
        </label>`).join('')}
      </fieldset>
      <div class="appendix-question-actions">
        <button class="appendix-button appendix-check-answer" type="button" data-check-practice="${escapedHtml(question.id)}">تحقق من الإجابة</button>
        <button class="appendix-button appendix-try-case" type="button" data-apply-practice="${escapedHtml(question.id)}">${escapedHtml(question.applyLabel)}</button>
      </div>
      <div class="appendix-practice-feedback" data-practice-feedback="${escapedHtml(question.id)}" role="status" aria-live="polite" aria-atomic="true" hidden></div>
    </article>`).join('');
  }

  function renderWorkedExample() {
    const visibleSteps = WORKED_EXAMPLE.steps.slice(0, visibleExampleSteps);
    workedSteps.innerHTML = solutionSteps(visibleSteps);
    workedProgress.innerHTML = `الخطوة <bdi dir="ltr">${visibleExampleSteps} / ${WORKED_EXAMPLE.steps.length}</bdi>`;
    nextExampleButton.disabled = visibleExampleSteps >= WORKED_EXAMPLE.steps.length;
    nextExampleButton.textContent = nextExampleButton.disabled ? 'اكتمل المثال' : visibleExampleSteps === 1 ? 'أظهر الخطوة التالية' : 'أظهر الخطوة التالية';
  }

  function startChallenge() {
    setForces(ZERO_RESULTANT_CHALLENGE.forces, { presetId: null, observation: 'التجربة بدأت من السكون: ثبّت القوتين الأولى والثانية، وعدّل القوة الثالثة فقط حتى يصبح مجموع المركبات صفراً.' });
    challengeActive = true;
    renderForceControls();
    startChallengeButton.hidden = true;
    checkChallengeButton.hidden = false;
    resetChallengeButton.hidden = false;
    challengeStatus.textContent = 'القوتان الأولى والثانية مثبتتان. حرّك مقدار القوة الثالثة واتجاهها، ثم اطلب التحقق.';
    setLabStatus('بدأ التحدي. القوتان الأولى والثانية ثابتتان؛ القوة الثالثة قابلة للتعديل.');
    scrollToLabResults();
  }

  function checkChallenge() {
    if (!challengeActive) return;
    const evaluation = evaluateResultantTarget(forces, ZERO_RESULTANT_CHALLENGE.target, ZERO_RESULTANT_CHALLENGE.tolerance);
    if (evaluation.complete) {
      const direction = evaluation.resultant.directionDegrees === null ? 'غير محدد' : `<bdi dir="ltr">${formatNumber(evaluation.resultant.directionDegrees, 1)}°</bdi>`;
      challengeStatus.innerHTML = `نجحت! مقدار المحصلة <bdi dir="ltr">${formatNumber(evaluation.resultant.magnitude)} N</bdi> واتجاهها ${direction} ضمن سماحية الرسم <bdi dir="ltr">${formatNumber(ZERO_RESULTANT_CHALLENGE.tolerance, 2)} N</bdi>. المحصلة الصفرية تعني تسارعاً صفرياً؛ أعد التجربة من السكون لملاحظة الجسم المتزن.`;
    } else {
      const direction = evaluation.resultant.directionDegrees === null ? 'غير محدد' : `<bdi dir="ltr">${formatNumber(evaluation.resultant.directionDegrees, 1)}°</bdi>`;
      challengeStatus.innerHTML = `لم تصل إلى الهدف بعد: المحصلة <bdi dir="ltr">${formatNumber(evaluation.resultant.magnitude)} N</bdi> عند ${direction}. اجمع مركبتي القوتين الثابتتين، ثم عدّل مقدار القوة الثالثة واتجاهها لتعويضهما.`;
    }
    if (evaluation.complete) setLabStatus('تحقق الهدف: محصلة القوى تساوي صفراً ضمن السماحية المحددة.');
    else labStatus.innerHTML = `ما زالت المحصلة <bdi dir="ltr">${formatNumber(evaluation.resultant.magnitude)} N</bdi>؛ تابع تعديل القوة الثالثة.`;
  }

  function resetChallenge() {
    startChallenge();
    challengeStatus.textContent = 'أُعيد إعداد التحدي من البداية. القوتان الأولى والثانية ثابتتان.';
  }

  renderPresetButtons();
  renderForceControls();
  renderPracticeQuestions();
  renderLab();
  renderWorkedExample();
  setLabStatus(`${APPENDIX_EXTENSION_LABEL}. ${EDUCATIONAL_MODEL_LABEL}. غيّر قيمة أو اختر تجربة؛ النتيجة تتحدث فوراً.`);

  root.addEventListener('input', (event) => {
    const input = event.target.closest?.('[data-force-index][data-force-field]');
    if (!input || input.disabled) return;
    handleForceInput(input);
  });

  root.addEventListener('change', (event) => {
    const input = event.target.closest?.('[data-force-index][data-force-field]');
    if (input && !input.disabled) {
      announceResult('تأكدت قيمة المدخل.');
      return;
    }
    const radio = event.target.closest?.('input[data-practice-choice]');
    if (!radio) return;
    const questionId = radio.dataset.practiceChoice;
    const state = practiceStates.get(questionId);
    practiceStates.set(questionId, selectPracticeChoice(state, radio.value));
    const feedback = root.querySelector(`[data-practice-feedback="${questionId}"]`);
    feedback.hidden = true;
    feedback.innerHTML = '';
  });

  root.addEventListener('click', (event) => {
    const presetButton = event.target.closest?.('[data-preset-id]');
    if (presetButton) {
      loadPreset(findPreset(presetButton.dataset.presetId));
      return;
    }

    const removeButton = event.target.closest?.('[data-remove-force]');
    if (removeButton && !removeButton.disabled) {
      const index = Number(removeButton.dataset.removeForce);
      const nextFocus = Math.max(0, Math.min(index, forces.length - 2));
      forces = removeForce(forces, index);
      currentPresetId = null;
      if (!motionRunning) motion = createMotionState();
      renderForceControls(nextFocus);
      renderLab();
      presetObservation.textContent = 'حُذفت قوة. قارن كيف تغيّر مجموع المركبات والمحصلة.';
      clearChallengeFeedback();
      announceResult('حُذفت القوة.');
      return;
    }

    if (event.target.closest?.('#add-force')) {
      if (forces.length >= MAX_FORCE_COUNT || challengeActive) return;
      forces = addForce(forces);
      currentPresetId = null;
      if (!motionRunning) motion = createMotionState();
      renderForceControls(forces.length - 1);
      renderLab();
      presetObservation.textContent = 'أُضيف متجه جديد من نقطة التأثير المشتركة. غيّر اتجاهه ومقداره ثم قارن.';
      announceResult('أُضيفت قوة جديدة.');
      return;
    }

    if (event.target.closest?.('#toggle-motion')) {
      if (motionRunning) pauseMotion();
      else startMotion();
      return;
    }

    if (event.target.closest?.('#reset-motion')) {
      pauseMotion(false);
      motion = createMotionState();
      updateDiagram(currentResult);
      setLabStatus('أُعيد الجسم إلى مركز المشهد ومن السكون؛ بقيت القوى الحالية كما هي.');
      return;
    }

    if (event.target.closest?.('#next-example-step')) {
      if (visibleExampleSteps < WORKED_EXAMPLE.steps.length) {
        visibleExampleSteps += 1;
        renderWorkedExample();
      }
      return;
    }

    if (event.target.closest?.('#reset-example')) {
      visibleExampleSteps = 1;
      renderWorkedExample();
      return;
    }

    const checkPracticeButton = event.target.closest?.('[data-check-practice]');
    if (checkPracticeButton) {
      const questionId = checkPracticeButton.dataset.checkPractice;
      const state = practiceStates.get(questionId);
      const checked = checkPracticeAnswer(state);
      const feedback = root.querySelector(`[data-practice-feedback="${questionId}"]`);
      feedback.hidden = false;
      if (checked.needsSelection) {
        feedback.dataset.correct = 'none';
        feedback.textContent = 'اختر توقعاً أولاً؛ لن نقيّمه قبل هذا الطلب الصريح.';
        return;
      }
      practiceStates.set(questionId, checked);
      feedback.dataset.correct = String(checked.isCorrect);
      feedback.innerHTML = checked.feedbackHtml;
      return;
    }

    const applyPracticeButton = event.target.closest?.('[data-apply-practice]');
    if (applyPracticeButton) {
      const question = PRACTICE_QUESTIONS.find((item) => item.id === applyPracticeButton.dataset.applyPractice);
      if (question) loadPracticeCase(question);
      return;
    }

    if (event.target.closest?.('#start-challenge')) {
      startChallenge();
      return;
    }
    if (event.target.closest?.('#check-challenge')) {
      checkChallenge();
      return;
    }
    if (event.target.closest?.('#reset-challenge')) resetChallenge();
  });

  motionPreference?.addEventListener?.('change', (event) => {
    reducedMotion = event.matches;
    if (reducedMotion && motionRunning) {
      pauseMotion(false);
      reducedMotionPreview();
    }
  });

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !challengeActive) return;
    challengeActive = false;
    setForces(initialPreset.forces, { presetId: initialPreset.id, observation: initialPreset.observation });
    challengeStatus.textContent = 'انتهى التحدي؛ عاد المختبر إلى تجربة الزاوية.';
    setLabStatus('انتهى وضع التحدي؛ عاد المختبر إلى تجربة الاستكشاف.');
  });
}

const appendixRoot = document.querySelector('[data-appendix-app]');
if (appendixRoot) mountAppendix(appendixRoot);
