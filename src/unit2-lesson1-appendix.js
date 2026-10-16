/*
 * «مختبر الشحنات — اكتشف الكهرباء الساكنة»
 * Standalone enrichment appendix for Unit 2, Lesson 1 (textbook pages 73–86).
 *
 * The module mounts seven short stations, one on screen at a time, with a
 * station rail and a progress readout. Every station is an interaction first
 * and a text second:
 *
 *   1 puzzle    — predict, rub (or don't), lower the rod, watch the paper bits;
 *   2 charge    — a symbolic charge ledger: move electrons, read the net charge;
 *   3 methods   — walk the steps of friction, contact and induction, then compare;
 *   4 arena     — choose two signs, predict, reveal the force arrows, release them;
 *   5 coulomb   — sliders for q₁, q₂ and d, live F = K q₁q₂/d², ratio probes;
 *   6 detective — seven situational questions, evaluated only on explicit submit;
 *   7 summary   — a concept map whose nodes reopen the station that taught them.
 *
 * All physics comes from `unit2-lesson1-appendix-physics.js` (which delegates
 * the constants and the Coulomb relation to the published lesson model), all
 * authored copy comes from `unit2-lesson1-appendix-content.js`, and all
 * mathematics is rendered through the shared KaTeX layer in `math.js`.
 *
 * Nothing here is graded, stored, or sent anywhere: the appendix is local,
 * exploratory practice, separate from the lesson test and the teacher area.
 */

import { formula, tex } from './math.js';
import {
  APPENDIX_KEYWORDS,
  APPENDIX_OBJECTIVES,
  APPENDIX_STATIONS,
  ARENA_EQUAL_FORCES_NOTE_HTML,
  ARENA_FORCE_ELEMENTS_BOOK_HTML,
  ARENA_INTRO_HTML,
  ARENA_KIND_COPY,
  ARENA_MODEL_LIMITS,
  ARENA_PREDICTIONS,
  ARENA_PREDICTION_PROMPT,
  ARENA_RULE_BOOK_HTML,
  CHARGE_EXERCISE_SOLUTION,
  CHARGE_LEDGER_BODIES,
  CHARGE_LEDGER_INTRO_HTML,
  CHARGE_LEDGER_MODEL_LIMITS,
  CHARGE_NEUTRAL_VS_CHARGED,
  CHARGE_PLATFORM_EXERCISE,
  CHARGE_PROTON_NOTE_HTML,
  CHARGE_RULE_BOOK_HTML,
  CHARGE_BOOK_EXAMPLE,
  CHARGE_SYMBOLIC_NOTE_HTML,
  COULOMB_BEYOND_RANGE_NOTE,
  COULOMB_BOOK_EXAMPLE,
  COULOMB_INTRO_HTML,
  COULOMB_LAW_BOOK_HTML,
  COULOMB_MAGNITUDE_VS_DIRECTION_HTML,
  COULOMB_MODEL_LIMITS,
  COULOMB_PROBE_QUESTIONS,
  COULOMB_RATIO_CHOICES,
  COULOMB_SYMBOL_LEGEND,
  COULOMB_UNIT_NOTE_HTML,
  CONCEPT_MAP_INTRO_HTML,
  CONCEPT_NODES,
  DEFAULT_STATION_ID,
  DETECTIVE_ENCOURAGEMENT_HTML,
  DETECTIVE_FEEDBACK_CORRECT_HEADLINE,
  DETECTIVE_FEEDBACK_INCORRECT_HEADLINE,
  DETECTIVE_INTRO_HTML,
  DETECTIVE_QUESTIONS,
  DETECTIVE_RETRY_LABEL,
  ENRICHMENT_LABEL,
  EXTENSION_LABEL,
  HERO_DESCRIPTION_HTML,
  HOW_TO_USE_STEPS,
  KEY_IDEAS,
  METHOD_CARDS,
  METHOD_COMPARISON_ROWS,
  METHOD_COMPARISON_VALUES,
  METHOD_ELECTROSCOPE_NOTE_HTML,
  METHOD_MODEL_LIMITS,
  METHOD_STEP_COPY,
  MODEL_LABEL,
  PLATFORM_LABEL,
  PUZZLE_BOOK_HOOK_HTML,
  PUZZLE_INTRO_HTML,
  PUZZLE_MODEL_LIMITS,
  PUZZLE_OBSERVATION_VS_EXPLANATION,
  PUZZLE_OUTCOMES,
  PUZZLE_POLARIZATION_NOTE_HTML,
  PUZZLE_PREDICTIONS,
  PUZZLE_PREDICTION_PROMPT,
  SOURCE_LABEL,
  SUMMARY_CLOSING_HTML,
  findStation,
  probeExplanation,
} from './unit2-lesson1-appendix-content.js';
import {
  BOOK_COULOMB_STATE,
  COULOMB_FIELDS,
  DEFAULT_COULOMB_STATE,
  ELEMENTARY_CHARGE,
  METHOD_FRICTION,
  METHOD_IDS,
  METHOD_STEPS,
  PAPER_SCENE,
  arenaState,
  bodyState,
  chargeOfElectronCount,
  chargeTeX,
  coulombReading,
  createCoulombState,
  evaluateCoulombProbe,
  checkProbePrediction,
  findCoulombProbe,
  forceTeX,
  methodComparison,
  methodState,
  paperBitPositions,
  paperSceneOutcome,
  resetCoulombState,
  rodDrop,
  scaleCoulombInputs,
  transferElectrons,
  updateCoulombInput,
} from './unit2-lesson1-appendix-physics.js';
import {
  createQuizState,
  createStationFlow,
  goToStation,
  quizProgress,
  retryQuizQuestion,
  selectQuizChoice,
  stationHash,
  stationIdFromHash,
  stepStation,
  submitQuizAnswer,
} from './unit2-lesson1-appendix-flow.js';

/* ------------------------------------------------------------ small helpers */

const signGlyph = (sign) => (sign > 0 ? '+' : sign < 0 ? '−' : '');
const conditionWord = (condition) => (condition === 'neutral' ? 'متعادل' : condition === 'positive' ? 'مشحون بشحنة موجبة' : 'مشحون بشحنة سالبة');

const modelBadge = () => `<p class="u2l1a-model-badge">${MODEL_LABEL}</p>`;

const sourceCard = (label, bodyHtml) => `
  <aside class="u2l1a-card u2l1a-card-source">
    <p class="u2l1a-card-label"><span aria-hidden="true">◆</span> ${label}</p>
    <div class="u2l1a-card-body">${bodyHtml}</div>
  </aside>`;

const platformCard = (label, bodyHtml) => `
  <aside class="u2l1a-card u2l1a-card-platform">
    <p class="u2l1a-card-label"><span aria-hidden="true">✦</span> ${label}</p>
    <div class="u2l1a-card-body">${bodyHtml}</div>
  </aside>`;

const limitsCard = (title, items) => `
  <aside class="u2l1a-card u2l1a-card-limits">
    <p class="u2l1a-card-label"><span aria-hidden="true">⚠</span> ${title}</p>
    <ul class="u2l1a-limits">${items.map((item) => `<li>${item}</li>`).join('')}</ul>
  </aside>`;

/** A plain scientific-notation TeX string (no unit) for substitution lines. */
const sciTeX = (value, digits = 1) => {
  const number = Number(value);
  if (number === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(number)));
  const mantissa = Number((number / 10 ** exponent).toFixed(digits));
  return exponent === 0 ? String(mantissa) : `${mantissa}\\times 10^{${exponent}}`;
};

const readout = (label, valueHtml, extra = '') => `
  <div class="u2l1a-readout">
    <span class="u2l1a-readout-label">${label}</span>
    <output class="u2l1a-readout-value" ${extra}>${valueHtml}</output>
  </div>`;

/** A bounded animation loop; returns a cancel function. */
function animate(durationMs, onFrame, reducedMotion) {
  if (reducedMotion) {
    onFrame(1);
    return () => {};
  }
  let handle = 0;
  /* The start stamp is taken from the first frame itself, never from another
   * clock: the frame timestamp and `performance.now()` do not share an origin
   * in every environment, and a mismatch would freeze the animation at t = 0. */
  let start = null;
  const tick = (now) => {
    if (start === null) start = now;
    const t = Math.max(0, Math.min(1, (now - start) / durationMs));
    onFrame(t);
    if (t < 1) handle = requestAnimationFrame(tick);
  };
  handle = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(handle);
}

/* ==================================================================== shell */

function stationPanelMarkup(station, bodyHtml) {
  return `
  <section class="u2l1a-station" id="station-${station.id}" data-station="${station.id}" aria-labelledby="station-${station.id}-heading" hidden>
    <header class="u2l1a-station-head">
      <div class="u2l1a-station-count"><span dir="ltr">${String(station.index).padStart(2, '0')}</span><i aria-hidden="true">${station.icon}</i></div>
      <div class="u2l1a-station-heading-copy">
        <p class="u2l1a-section-kicker">${station.kicker}</p>
        <h2 id="station-${station.id}-heading" tabindex="-1">${station.title}</h2>
        <p class="u2l1a-station-goal"><strong>هدف المحطة:</strong> ${station.goal}</p>
      </div>
      <p class="u2l1a-station-objective"><span>من أهداف الدرس</span>${station.objective}</p>
    </header>
    <div class="u2l1a-station-body">${bodyHtml}</div>
  </section>`;
}

/* ================================================= station 1 · the puzzle */

function puzzleSceneMarkup() {
  const bits = PAPER_SCENE.bits.map((bit) => `<g class="u2l1a-bit" data-puzzle-bit="${bit.id}" transform="translate(${bit.x} ${bit.y})"><rect x="-11" y="-7" width="22" height="14" rx="3" /></g>`).join('');
  const marks = [0, 1, 2, 3].map((index) => `<text class="u2l1a-charge-mark" data-puzzle-mark="${index}" x="${404 + index * 18}" y="0" text-anchor="middle" opacity="0">−</text>`).join('');
  return `
  <figure class="u2l1a-scene">
    <div class="u2l1a-scene-canvas">
      <svg viewBox="0 0 720 320" role="img" aria-labelledby="puzzle-scene-title puzzle-scene-desc" data-puzzle-svg>
        <title id="puzzle-scene-title">ساق بلاستيكية فوق قصاصات ورق صغيرة</title>
        <desc id="puzzle-scene-desc" data-puzzle-desc>الساق غير مدلوكة فوق الطاولة، وقصاصات الورق ساكنة.</desc>
        <line class="u2l1a-bench" x1="70" y1="288" x2="650" y2="288" />
        <rect class="u2l1a-bench-shadow" x="70" y="288" width="580" height="10" rx="5" />
        <g class="u2l1a-wool" data-puzzle-wool>
          <ellipse cx="146" cy="120" rx="46" ry="30" />
          <text x="146" y="176" text-anchor="middle">قطعة صوف</text>
        </g>
        <g data-puzzle-rod transform="translate(0 0)">
          <rect class="u2l1a-rod-body" x="294" y="53" width="156" height="26" rx="13" />
          <g transform="translate(0 66)">${marks}</g>
          <text class="u2l1a-scene-label" x="372" y="36" text-anchor="middle">ساق بلاستيكية</text>
          <text class="u2l1a-scene-label u2l1a-scene-label-small" x="452" y="98" text-anchor="middle" data-puzzle-tip-label opacity="0">الطرف المدلوك</text>
        </g>
        ${bits}
        <text class="u2l1a-scene-label" x="372" y="310" text-anchor="middle">قصاصات ورق صغيرة معتدلة</text>
      </svg>
    </div>
    <figcaption data-puzzle-caption>المشهد قبل التشغيل: ساق بلاستيكية وقصاصات ورق معتدلة على الطاولة.</figcaption>
    ${modelBadge()}
  </figure>`;
}

function puzzleMarkup() {
  const predictions = PUZZLE_PREDICTIONS.map((choice) => `
    <label class="u2l1a-choice">
      <input type="radio" name="puzzle-prediction" value="${choice.id}" data-puzzle-prediction="${choice.id}" />
      <span>${choice.label}</span>
    </label>`).join('');
  return `
  <div class="u2l1a-station-intro">${PUZZLE_INTRO_HTML}</div>
  <div class="u2l1a-lab">
    <section class="u2l1a-lab-controls" aria-label="ضوابط تجربة القصاصات">
      <fieldset class="u2l1a-choice-set">
        <legend>${PUZZLE_PREDICTION_PROMPT}</legend>
        <div class="u2l1a-choice-list">${predictions}</div>
      </fieldset>
      <div class="u2l1a-button-row">
        <button class="u2l1a-action" type="button" data-puzzle-rub aria-pressed="false">ادلك الساق بقطعة الصوف</button>
        <button class="u2l1a-action u2l1a-action-primary" type="button" data-puzzle-approach>قرّب الساق من القصاصات</button>
        <button class="u2l1a-action u2l1a-action-ghost" type="button" data-puzzle-reset>أعد التجربة من البداية</button>
      </div>
      <p class="u2l1a-status" role="status" aria-live="polite" data-puzzle-status>اختر توقّعك، ثم قرّر هل تدلك الساق أم لا، ثم قرّبها من القصاصات.</p>
    </section>
    ${puzzleSceneMarkup()}
    <div class="u2l1a-result-pair">
      <section class="u2l1a-result-card" data-puzzle-observation hidden aria-labelledby="puzzle-observation-heading">
        <p class="u2l1a-card-label"><span aria-hidden="true">◉</span> ما لاحظتَه</p>
        <h3 id="puzzle-observation-heading">الملاحظة</h3>
        <div data-puzzle-observation-body></div>
      </section>
      <section class="u2l1a-result-card" data-puzzle-explanation hidden aria-labelledby="puzzle-explanation-heading">
        <p class="u2l1a-card-label"><span aria-hidden="true">✦</span> ${PLATFORM_LABEL}</p>
        <h3 id="puzzle-explanation-heading">التفسير العلمي</h3>
        <div data-puzzle-explanation-body></div>
      </section>
    </div>
    <div class="u2l1a-result-pair">
      ${PUZZLE_OBSERVATION_VS_EXPLANATION.map((card) => `
        <section class="u2l1a-info-card">
          <h3>${card.title}</h3>
          ${card.bodyHtml}
        </section>`).join('')}
    </div>
    ${sourceCard(`${SOURCE_LABEL} · ص75`, PUZZLE_BOOK_HOOK_HTML)}
    ${platformCard(ENRICHMENT_LABEL, PUZZLE_POLARIZATION_NOTE_HTML)}
    ${limitsCard('حدود هذا النموذج', PUZZLE_MODEL_LIMITS)}
  </div>`;
}

function mountPuzzle(panel, context) {
  const rod = panel.querySelector('[data-puzzle-rod]');
  const marks = [...panel.querySelectorAll('[data-puzzle-mark]')];
  const tipLabel = panel.querySelector('[data-puzzle-tip-label]');
  const bits = [...panel.querySelectorAll('[data-puzzle-bit]')];
  const desc = panel.querySelector('[data-puzzle-desc]');
  const caption = panel.querySelector('[data-puzzle-caption]');
  const status = panel.querySelector('[data-puzzle-status]');
  const observation = panel.querySelector('[data-puzzle-observation]');
  const explanation = panel.querySelector('[data-puzzle-explanation]');
  const observationBody = panel.querySelector('[data-puzzle-observation-body]');
  const explanationBody = panel.querySelector('[data-puzzle-explanation-body]');
  const rubButton = panel.querySelector('[data-puzzle-rub]');

  let rubbed = false;
  let approach = 0;
  let cancelAnimation = null;
  let revealed = false;

  const paint = () => {
    const drop = rodDrop(approach);
    rod.setAttribute('transform', `translate(0 ${drop.toFixed(1)})`);
    marks.forEach((mark) => mark.setAttribute('opacity', rubbed ? '1' : '0'));
    tipLabel.setAttribute('opacity', rubbed ? '1' : '0');
    const positions = paperBitPositions({ rubbed, approachProgress: approach });
    positions.forEach((position) => {
      const bit = bits.find((node) => node.dataset.puzzleBit === position.id);
      if (bit) bit.setAttribute('transform', `translate(${position.x.toFixed(1)} ${position.y.toFixed(1)}) rotate(${position.rotate.toFixed(1)})`);
    });
    const outcome = paperSceneOutcome({ rubbed, approachProgress: approach });
    caption.textContent = !rubbed
      ? 'الساق غير مدلوكة (معتدلة): القصاصات في مكانها.'
      : approach < 0.25
        ? 'الساق مدلوكة ومشحونة، لكنها ما تزال بعيدة عن القصاصات.'
        : `الساق المدلوكة جذبت ${positions.filter((position) => position.attached).length} من القصاصات نحو طرفها المدلوك.`;
    desc.textContent = outcome.outcomeKey === 'charged-rod-attraction'
      ? 'ساق بلاستيكية مشحونة بشحنة سالبة اقتربت من قصاصات ورق معتدلة فارتفعت القصاصات نحوها.'
      : outcome.outcomeKey === 'neutral-rod'
        ? 'ساق بلاستيكية معتدلة فوق قصاصات ورق ساكنة دون أي أثر.'
        : 'ساق مشحونة ما تزال بعيدة عن قصاصات الورق.';
    return outcome;
  };

  const reveal = (outcome) => {
    const copy = PUZZLE_OUTCOMES[outcome.outcomeKey];
    observationBody.innerHTML = copy.observationHtml;
    explanationBody.innerHTML = copy.explanationHtml;
    observation.hidden = outcome.outcomeKey === 'charged-rod-held-above';
    explanation.hidden = outcome.outcomeKey === 'charged-rod-held-above';
    revealed = outcome.outcomeKey !== 'charged-rod-held-above';
    const picked = panel.querySelector('input[data-puzzle-prediction]:checked')?.value ?? null;
    if (revealed && picked) {
      const expected = outcome.attracted ? 'attract' : (outcome.outcomeKey === 'neutral-rod' ? 'nothing' : null);
      const matched = expected !== null && picked === expected;
      const pickedLabel = PUZZLE_PREDICTIONS.find((choice) => choice.id === picked)?.label ?? '';
      status.textContent = matched
        ? `توقعتَ «${pickedLabel}» وحدث ذلك فعلاً. اقرأ الآن الفرق بين الملاحظة والتفسير.`
        : `توقعتَ «${pickedLabel}»، لكن ما حدث هو: ${outcome.attracted ? 'انجذاب القصاصات إلى الساق' : 'بقاء القصاصات في مكانها'}. التفسير أسفل المشهد يبيّن السبب.`;
    } else if (revealed) {
      status.textContent = outcome.attracted
        ? 'انجذبت القصاصات إلى الطرف المدلوك. افتح لوحتَي الملاحظة والتفسير وقارن بينهما.'
        : 'لم تتحرّك القصاصات. هذه هي حالة المقارنة: ساق غير مشحونة لا تُحدث أثراً.';
    } else {
      status.textContent = 'الساق مشحونة الآن لكنها ما تزال مرتفعة؛ اضغط «قرّب الساق من القصاصات» مرة أخرى لإنزالها.';
    }
  };

  const reset = () => {
    cancelAnimation?.();
    cancelAnimation = null;
    rubbed = false;
    approach = 0;
    revealed = false;
    rubButton.setAttribute('aria-pressed', 'false');
    rubButton.textContent = 'ادلك الساق بقطعة الصوف';
    panel.querySelectorAll('input[data-puzzle-prediction]').forEach((input) => { input.checked = false; });
    observation.hidden = true;
    explanation.hidden = true;
    paint();
    status.textContent = 'أُعيدت التجربة إلى بدايتها: توقّع من جديد، وقرّر هل تدلك الساق أم لا.';
  };

  rubButton.addEventListener('click', () => {
    rubbed = !rubbed;
    rubButton.setAttribute('aria-pressed', rubbed ? 'true' : 'false');
    rubButton.textContent = rubbed ? 'الساق مدلوكة (اضغط لإلغاء الدلك)' : 'ادلك الساق بقطعة الصوف';
    approach = 0;
    revealed = false;
    observation.hidden = true;
    explanation.hidden = true;
    paint();
    status.textContent = rubbed
      ? 'دَلَكتَ الساق بالصوف: انتقلت إليها إلكترونات فصارت سالبة الشحنة (ظهرت علامات − على طرفها المدلوك). قرّبها الآن من القصاصات.'
      : 'ألغيتَ الدلك: الساق معتدلة من جديد. جرّب أن تقرّبها من القصاصات وقارن النتيجة.';
  });

  panel.querySelector('[data-puzzle-approach]').addEventListener('click', () => {
    cancelAnimation?.();
    const from = approach;
    cancelAnimation = animate(1100, (t) => {
      approach = from + (1 - from) * t;
      const outcome = paint();
      if (t >= 1) reveal(outcome);
    }, context.reducedMotion);
  });

  panel.querySelector('[data-puzzle-reset]').addEventListener('click', reset);

  panel.addEventListener('change', (event) => {
    if (!event.target.matches?.('input[data-puzzle-prediction]')) return;
    if (revealed) status.textContent = 'غيّرتَ توقّعك بعد ظهور النتيجة؛ أعد التجربة من البداية لتختبر توقّعك الجديد.';
  });

  paint();
}

/* ================================================ station 2 · charge ledger */

/* Twelve fixed slots: the symbolic pair can never hold more than twelve
 * electrons between them, so every possible state is drawable. */
const ELECTRON_SLOTS = Object.freeze(Array.from({ length: 12 }, (_, index) => {
  const angle = (-90 + index * 30) * (Math.PI / 180);
  return Object.freeze({ x: 120 + Math.cos(angle) * 86, y: 104 + Math.sin(angle) * 80 });
}));

/** One KaTeX line for a body's net charge: q = ±ne = ±value C. */
function chargeLineTeX(electronDelta) {
  if (electronDelta === 0) return 'q=0~\\mathrm{C}';
  const sign = electronDelta > 0 ? '-' : '+';
  return `q=${sign}${Math.abs(electronDelta)}e=${chargeTeX(-electronDelta * ELEMENTARY_CHARGE)}`;
}
const PROTON_SLOTS = Object.freeze([
  { x: 92, y: 86 }, { x: 120, y: 86 }, { x: 148, y: 86 },
  { x: 92, y: 118 }, { x: 120, y: 118 }, { x: 148, y: 118 },
]);

function ledgerBodyMarkup(body) {
  const protons = PROTON_SLOTS.map((slot) => `<circle class="u2l1a-proton" cx="${slot.x}" cy="${slot.y}" r="12" /><text class="u2l1a-proton-sign" x="${slot.x}" y="${slot.y + 5}" text-anchor="middle">+</text>`).join('');
  const electrons = ELECTRON_SLOTS.map((slot, index) => `<g class="u2l1a-electron-slot" data-ledger-electron="${body.id}-${index}"><circle class="u2l1a-electron" cx="${slot.x}" cy="${slot.y}" r="9" /><text class="u2l1a-electron-sign" x="${slot.x}" y="${slot.y + 4}" text-anchor="middle">−</text></g>`).join('');
  return `
  <article class="u2l1a-body-card" data-ledger-body="${body.id}">
    <header>
      <h4>${body.label}</h4>
      <span class="u2l1a-chip u2l1a-chip-material">${body.materialLabel}</span>
    </header>
    <svg viewBox="0 0 240 200" role="img" aria-labelledby="ledger-${body.id}-title ledger-${body.id}-desc">
      <title id="ledger-${body.id}-title">تمثيل شحنات ${body.label}</title>
      <desc id="ledger-${body.id}-desc" data-ledger-desc="${body.id}">جسم متعادل: ستة بروتونات موجبة وستة إلكترونات سالبة.</desc>
      <rect class="u2l1a-nucleus-box" x="72" y="68" width="96" height="68" rx="18" />
      ${protons}
      ${electrons}
    </svg>
    <dl class="u2l1a-readouts">
      ${readout('عدد البروتونات (ثابت)', `<bdi dir="ltr" data-ledger-protons="${body.id}">${body.protons}</bdi>`)}
      ${readout('عدد الإلكترونات', `<bdi dir="ltr" data-ledger-electrons="${body.id}">${body.protons}</bdi>`)}
      ${readout('الشحنة الصافية', `<span data-ledger-charge="${body.id}"></span>`)}
      ${readout('الحالة', `<span data-ledger-condition="${body.id}">متعادل</span>`)}
    </dl>
  </article>`;
}

function ledgerMarkup() {
  return `
  <div class="u2l1a-station-intro">${CHARGE_LEDGER_INTRO_HTML}</div>
  <div class="u2l1a-lab">
    <section class="u2l1a-lab-controls" aria-label="ضوابط ميزان الشحنات">
      <div class="u2l1a-button-row">
        <button class="u2l1a-action u2l1a-action-primary" type="button" data-ledger-transfer="a">انقل إلكتروناً من (ب) إلى (أ)</button>
        <button class="u2l1a-action u2l1a-action-primary" type="button" data-ledger-transfer="b">انقل إلكتروناً من (أ) إلى (ب)</button>
        <button class="u2l1a-action u2l1a-action-ghost" type="button" data-ledger-reset>أعد الضبط (جسمان متعادلان)</button>
      </div>
      <p class="u2l1a-status" role="status" aria-live="polite" data-ledger-status>الجسمان متعادلان: عدد الإلكترونات يساوي عدد البروتونات في كلٍّ منهما.</p>
      <p class="u2l1a-flow-note" data-ledger-flow>لم ينتقل أي إلكترون بعد. أسهم الانتقال تظهر هنا عند نقل الإلكترونات.</p>
    </section>
    <div class="u2l1a-ledger-grid">
      ${ledgerBodyMarkup(CHARGE_LEDGER_BODIES.a)}
      ${ledgerBodyMarkup(CHARGE_LEDGER_BODIES.b)}
    </div>
    <div class="u2l1a-ledger-total">
      ${readout('مجموع شحنتَي الجسمين', `<span data-ledger-total></span>`)}
      <p class="u2l1a-note-inline">المجموع يبقى صفراً: الشحنة لا تُستحدث ولا تفنى، بل تنتقل من جسم إلى آخر.</p>
    </div>
    <div class="u2l1a-result-pair">
      ${CHARGE_NEUTRAL_VS_CHARGED.map((card) => `<section class="u2l1a-info-card"><h3>${card.title}</h3>${card.bodyHtml}</section>`).join('')}
    </div>
    ${platformCard(PLATFORM_LABEL, CHARGE_PROTON_NOTE_HTML + CHARGE_SYMBOLIC_NOTE_HTML)}
    ${sourceCard(`${SOURCE_LABEL} · ص76`, CHARGE_RULE_BOOK_HTML)}
    <section class="u2l1a-card u2l1a-card-example" aria-labelledby="ledger-example-heading">
      <p class="u2l1a-card-label"><span aria-hidden="true">◆</span> ${CHARGE_BOOK_EXAMPLE.label}</p>
      <h3 id="ledger-example-heading">تطبيق محلول من الدرس</h3>
      ${CHARGE_BOOK_EXAMPLE.statementHtml}
      <button class="u2l1a-action" type="button" data-ledger-example>اعرض خطوات الحل</button>
      <ol class="u2l1a-solution-steps" data-ledger-example-steps hidden>
        ${CHARGE_BOOK_EXAMPLE.steps.map((step) => `<li><span class="u2l1a-step-label">${step.label}</span><div class="u2l1a-step-body">${step.html}</div></li>`).join('')}
      </ol>
    </section>
    <section class="u2l1a-card u2l1a-card-example" aria-labelledby="ledger-exercise-heading">
      <p class="u2l1a-card-label"><span aria-hidden="true">✦</span> ${CHARGE_PLATFORM_EXERCISE.label}</p>
      <h3 id="ledger-exercise-heading">تمرين قصير</h3>
      ${CHARGE_PLATFORM_EXERCISE.statementHtml}
      <button class="u2l1a-action" type="button" data-ledger-exercise>اعرض الحل</button>
      <ol class="u2l1a-solution-steps" data-ledger-exercise-steps hidden>
        ${CHARGE_EXERCISE_SOLUTION.steps.map((step) => `<li><span class="u2l1a-step-label">${step.label}</span><div class="u2l1a-step-body">${step.html}</div></li>`).join('')}
      </ol>
    </section>
    ${limitsCard('حدود هذا النموذج', CHARGE_LEDGER_MODEL_LIMITS)}
  </div>`;
}

function mountLedger(panel) {
  const status = panel.querySelector('[data-ledger-status]');
  const flowNote = panel.querySelector('[data-ledger-flow]');
  const totalNode = panel.querySelector('[data-ledger-total]');
  const bodies = {
    a: { ...CHARGE_LEDGER_BODIES.a, electronDelta: 0 },
    b: { ...CHARGE_LEDGER_BODIES.b, electronDelta: 0 },
  };

  const paint = () => {
    for (const key of ['a', 'b']) {
      const state = bodyState({
        label: bodies[key].label,
        material: bodies[key].material,
        protons: bodies[key].protons,
        electronDelta: bodies[key].electronDelta,
      });
      const slots = [...panel.querySelectorAll(`[data-ledger-electron^="${key}-"]`)];
      slots.forEach((slot, index) => { slot.style.opacity = index < state.electrons ? '1' : '0.12'; });
      panel.querySelector(`[data-ledger-protons="${key}"]`).textContent = String(state.protons);
      panel.querySelector(`[data-ledger-electrons="${key}"]`).textContent = String(state.electrons);
      panel.querySelector(`[data-ledger-charge="${key}"]`).innerHTML =
        tex(chargeLineTeX(state.electronDelta), `net charge ${state.electronDelta === 0 ? 'zero' : `${state.electronDelta > 0 ? 'minus' : 'plus'} ${Math.abs(state.electronDelta)} e`}`);
      const conditionNode = panel.querySelector(`[data-ledger-condition="${key}"]`);
      conditionNode.textContent = conditionWord(state.condition);
      conditionNode.dataset.condition = state.condition;
      panel.querySelector(`[data-ledger-desc="${key}"]`).textContent = `${bodies[key].label}: ${state.protons} بروتونات موجبة و${state.electrons} إلكترونات سالبة، ${conditionWord(state.condition)}.`;
      panel.querySelector(`[data-ledger-body="${key}"]`).dataset.state = state.condition;
    }
    const totalDelta = bodies.a.electronDelta + bodies.b.electronDelta;
    const total = chargeOfElectronCount(totalDelta);
    totalNode.innerHTML = tex(chargeTeX(total.charge), `system total charge ${total.charge} coulombs`);
    return total;
  };

  const transfer = (to) => {
    if (to !== 'a' && to !== 'b') throw new RangeError('Transfer target must be a or b.');
    const from = to === 'a' ? 'b' : 'a';
    const pair = {
      a: bodyState({ label: bodies.a.label, material: bodies.a.material, protons: bodies.a.protons, electronDelta: bodies.a.electronDelta }),
      b: bodyState({ label: bodies.b.label, material: bodies.b.material, protons: bodies.b.protons, electronDelta: bodies.b.electronDelta }),
    };
    let moved;
    try {
      moved = transferElectrons(pair, 1, from);
    } catch {
      status.textContent = 'لا يمكن نقل إلكترون: الجسم المعطي لم يعد يملك إلكترونات في هذا النموذج الرمزي.';
      return;
    }
    bodies.a.electronDelta = moved.a.electronDelta;
    bodies.b.electronDelta = moved.b.electronDelta;
    paint();
    const receiverState = moved[to];
    const donorState = moved[from];
    flowNote.innerHTML = `انتقل إلكترون واحد من <strong>${CHARGE_LEDGER_BODIES[from].label}</strong> إلى <strong>${CHARGE_LEDGER_BODIES[to].label}</strong> — اتجاه الانتقال: من المعطي إلى المكتسب.`;
    status.textContent = `${CHARGE_LEDGER_BODIES[to].label} صار ${conditionWord(receiverState.condition)} (${receiverState.electrons} إلكترونات)، و${CHARGE_LEDGER_BODIES[from].label} صار ${conditionWord(donorState.condition)}. البروتونات لم تتحرّك.`;
  };

  panel.querySelectorAll('[data-ledger-transfer]').forEach((button) => {
    button.addEventListener('click', () => transfer(button.dataset.ledgerTransfer));
  });

  panel.querySelector('[data-ledger-reset]').addEventListener('click', () => {
    bodies.a.electronDelta = 0;
    bodies.b.electronDelta = 0;
    paint();
    flowNote.textContent = 'لم ينتقل أي إلكترون بعد. أسهم الانتقال تظهر هنا عند نقل الإلكترونات.';
    status.textContent = 'أُعيد الضبط: الجسمان متعادلان من جديد، ومجموع الشحنات صفر.';
  });

  panel.querySelector('[data-ledger-example]').addEventListener('click', (event) => {
    const steps = panel.querySelector('[data-ledger-example-steps]');
    steps.hidden = !steps.hidden;
    event.target.textContent = steps.hidden ? 'اعرض خطوات الحل' : 'أخفِ خطوات الحل';
  });

  panel.querySelector('[data-ledger-exercise]').addEventListener('click', (event) => {
    const steps = panel.querySelector('[data-ledger-exercise-steps]');
    steps.hidden = !steps.hidden;
    event.target.textContent = steps.hidden ? 'اعرض الحل' : 'أخفِ الحل';
  });

  paint();
}

/* ============================================== station 3 · charging methods */

function methodSceneMarkup(method) {
  const card = METHOD_CARDS[method];
  return `
  <figure class="u2l1a-scene">
    <div class="u2l1a-scene-canvas">
      <svg viewBox="0 0 720 300" role="img" aria-labelledby="method-${method}-title method-${method}-desc" data-method-svg="${method}">
        <title id="method-${method}-title">مشهد ${card.title}</title>
        <desc id="method-${method}-desc" data-method-desc="${method}">${card.bodies.a.name} و${card.bodies.b.name} قبل بدء الخطوات.</desc>
        <g data-method-body-a>
          <rect class="u2l1a-method-rod" x="120" y="120" width="170" height="34" rx="17" />
          <text class="u2l1a-scene-label" x="205" y="106" text-anchor="middle">${card.bodies.a.name}</text>
          <g data-method-marks-a transform="translate(0 137)"></g>
        </g>
        <g data-method-body-b>
          <circle class="u2l1a-method-ball" cx="530" cy="137" r="46" />
          <text class="u2l1a-scene-label" x="530" y="212" text-anchor="middle">${card.bodies.b.name}</text>
          <g data-method-marks-b></g>
          <text class="u2l1a-pole" data-method-near="${method}" x="500" y="142" text-anchor="middle" opacity="0">+</text>
          <text class="u2l1a-pole" data-method-far="${method}" x="562" y="142" text-anchor="middle" opacity="0">−</text>
        </g>
        <g data-method-flow="${method}" opacity="0">
          <line class="u2l1a-flow-line" x1="300" y1="137" x2="470" y2="137" marker-end="url(#u2l1a-arrow-${method})" />
          <text class="u2l1a-scene-label u2l1a-scene-label-small" x="385" y="122" text-anchor="middle" data-method-flow-label="${method}">إلكترونات</text>
        </g>
        <g data-method-ground="${method}" opacity="0">
          <line class="u2l1a-ground-line" x1="530" y1="185" x2="530" y2="248" />
          <line class="u2l1a-ground-bar" x1="504" y1="248" x2="556" y2="248" />
          <line class="u2l1a-ground-bar" x1="514" y1="258" x2="546" y2="258" />
          <line class="u2l1a-ground-bar" x1="524" y1="268" x2="536" y2="268" />
          <text class="u2l1a-scene-label u2l1a-scene-label-small" x="596" y="252" text-anchor="middle">الأرض (إصبع)</text>
        </g>
        <defs>
          <marker id="u2l1a-arrow-${method}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0L10 5L0 10z" class="u2l1a-arrow-head" />
          </marker>
        </defs>
      </svg>
    </div>
    <figcaption data-method-caption="${method}">الحالة الابتدائية: جسمان قبل تنفيذ الخطوات.</figcaption>
    ${modelBadge()}
  </figure>`;
}

function methodMarkup(method) {
  const card = METHOD_CARDS[method];
  const steps = card.steps.map((step, index) => `
    <li>
      <button class="u2l1a-step-button" type="button" data-method-step="${step.id}" data-method-step-index="${index}"${index === 0 ? ' aria-current="step"' : ''}>
        <span class="u2l1a-step-index" dir="ltr">${index + 1}</span>
        <span class="u2l1a-step-copy"><strong>${step.label}</strong><small>${step.action}</small></span>
      </button>
    </li>`).join('');
  return `
  <section class="u2l1a-method" data-method-panel="${method}"${method === METHOD_FRICTION ? '' : ' hidden'}>
    <div class="u2l1a-method-head">
      <h4>${card.title}</h4>
      <p>${card.subtitle}</p>
      <p class="u2l1a-key-difference"><strong>ما يميّز هذه الطريقة:</strong> ${card.keyDifference}</p>
    </div>
    <ol class="u2l1a-step-list" data-method-steps="${method}" aria-label="خطوات ${card.title}">${steps}</ol>
    <div class="u2l1a-button-row">
      <button class="u2l1a-action u2l1a-action-ghost" type="button" data-method-reset="${method}">أعد هذه الطريقة من الخطوة الأولى</button>
    </div>
    ${methodSceneMarkup(method)}
    <div class="u2l1a-result-pair">
      <section class="u2l1a-result-card">
        <p class="u2l1a-card-label"><span aria-hidden="true">◉</span> الملاحظة</p>
        <h4>ماذا ترى في النموذج؟</h4>
        <p data-method-observation="${method}">الجسمان قبل بدء الخطوات.</p>
      </section>
      <section class="u2l1a-result-card">
        <p class="u2l1a-card-label"><span aria-hidden="true">✦</span> ${PLATFORM_LABEL}</p>
        <h4>ماذا حدث في الداخل؟</h4>
        <p data-method-explanation="${method}">نفّذ خطوة لتظهر النتيجة وتفسيرها.</p>
      </section>
    </div>
    <div class="u2l1a-state-grid">
      <section class="u2l1a-state-card" aria-label="حالة الأجسام قبل التجربة">
        <h5>قبل</h5>
        <dl data-method-before="${method}"></dl>
      </section>
      <section class="u2l1a-state-card" aria-label="حالة الأجسام بعد الخطوة الحالية">
        <h5>بعد</h5>
        <dl data-method-after="${method}"></dl>
      </section>
      <section class="u2l1a-state-card" aria-label="ما تغيّر وما لم يتغيّر">
        <h5>ما تغيّر / ما لم يتغيّر</h5>
        <div data-method-delta="${method}"></div>
      </section>
      <section class="u2l1a-state-card" aria-label="ميزان حفظ الشحنة">
        <h5>ميزان الشحنة (رمزي)</h5>
        <dl data-method-conservation="${method}"></dl>
      </section>
    </div>
    <p class="u2l1a-status" role="status" aria-live="polite" data-method-status="${method}">اختر طريقة ثم نفّذ خطواتها بالترتيب.</p>
  </section>`;
}

function methodsMarkup() {
  const tabs = METHOD_IDS.map((method) => `
    <button class="u2l1a-tab" type="button" data-method-tab="${method}" aria-pressed="${method === METHOD_FRICTION ? 'true' : 'false'}">
      <span class="u2l1a-tab-index" dir="ltr">${METHOD_IDS.indexOf(method) + 1}</span>
      <span>${METHOD_CARDS[method].title}</span>
    </button>`).join('');
  const comparisonHead = METHOD_IDS.map((method) => `<th scope="col"><button class="u2l1a-table-method" type="button" data-compare-method="${method}">${METHOD_CARDS[method].title}</button></th>`).join('');
  const comparisonRows = METHOD_COMPARISON_ROWS.map((row) => `
    <tr data-compare-row="${row.id}"><th scope="row">${row.label}</th>${METHOD_IDS.map((method) => `<td data-compare-cell="${method}"></td>`).join('')}</tr>`).join('');
  return `
  <div class="u2l1a-station-intro">
    <p>ثلاث طرائق يدرسها الدرس لتكهرب الأجسام. اختر طريقة، ونفّذ خطواتها بالترتيب داخل النموذج، وراقب حالة الأجسام <strong>قبل</strong> و<strong>بعد</strong>، ثم قارن بين الطرائق الثلاث في الجدول الأخير.</p>
  </div>
  <div class="u2l1a-lab">
    <div class="u2l1a-tabs" role="group" aria-label="طرائق التكهرب">${tabs}</div>
    ${METHOD_IDS.map(methodMarkup).join('')}
    ${METHOD_IDS.map((method) => sourceCard(`${SOURCE_LABEL} · ${METHOD_CARDS[method].title}`, METHOD_CARDS[method].bookHtml)
    + (METHOD_CARDS[method].platformHtml ? platformCard(`${PLATFORM_LABEL} · ${METHOD_CARDS[method].title}`, METHOD_CARDS[method].platformHtml) : '')).join('')}
    ${sourceCard(`${SOURCE_LABEL} · ص74`, METHOD_ELECTROSCOPE_NOTE_HTML)}
    <section class="u2l1a-comparison" aria-labelledby="method-comparison-heading">
      <p class="u2l1a-card-label"><span aria-hidden="true">✦</span> مقارنة محسوبة من النموذج نفسه</p>
      <h3 id="method-comparison-heading">قارن بين الطرائق الثلاث</h3>
      <p>اضغط على اسم أي طريقة في رأس الجدول لتعود إلى حالتها النهائية في المختبر.</p>
      <div class="u2l1a-table-scroll">
        <table class="u2l1a-table">
          <caption class="u2l1a-visually-hidden">مقارنة بين التكهرب بالدلك واللمس والتأثير</caption>
          <thead><tr><th scope="col">وجه المقارنة</th>${comparisonHead}</tr></thead>
          <tbody>${comparisonRows}</tbody>
        </table>
      </div>
    </section>
    ${limitsCard('حدود هذا النموذج', METHOD_MODEL_LIMITS)}
  </div>`;
}

const DELTA_LABELS = Object.freeze({
  'net-charge': 'الشحنة الصافية',
  'electron-count': 'عدد الإلكترونات',
  'proton-count': 'عدد البروتونات',
  'total-charge-of-system': 'مجموع شحنات المنظومة',
  'net-charge-of-partner': 'الشحنة الصافية للجسم الثاني',
  'charge-of-rod-magnitude': 'مقدار شحنة الساق',
  'sign-of-rod': 'نوع شحنة الساق',
  'charge-distribution-of-partner': 'توزيع الشحنات على الجسم الثاني',
  'electron-count-of-partner': 'عدد إلكترونات الجسم الثاني',
  'charge-of-rod': 'شحنة الساق',
  'electrons-transferred-from-rod': 'الإلكترونات المنتقلة من الساق إلى الجسم الثاني',
});

function stateRow(label, valueHtml) {
  return `<div class="u2l1a-state-row"><dt>${label}</dt><dd>${valueHtml}</dd></div>`;
}

function mountMethods(panel, context) {
  const comparison = methodComparison();
  let activeMethod = METHOD_FRICTION;
  const stepIndexes = Object.fromEntries(METHOD_IDS.map((method) => [method, 0]));

  const paintState = (method, stepId) => {
    const state = methodState(method, stepId);
    const before = methodState(method, 'before');
    const card = METHOD_CARDS[method];
    const bodyRow = (label, body) => stateRow(label, `${conditionWord(body.condition)} <span class="u2l1a-charge-tex">${tex(chargeTeX(body.charge), `charge ${body.charge}`)}</span>`);
    panel.querySelector(`[data-method-before="${method}"]`).innerHTML =
      bodyRow(card.bodies.a.name, before.a) + bodyRow(card.bodies.b.name, before.b);
    panel.querySelector(`[data-method-after="${method}"]`).innerHTML =
      bodyRow(card.bodies.a.name, state.a) + bodyRow(card.bodies.b.name, state.b)
      + (state.ground !== 0 ? stateRow('الأرض (عبر الإصبع)', tex(chargeTeX(-state.ground * ELEMENTARY_CHARGE), 'ground charge')) : '');

    const changed = state.changed.map((key) => `<li class="u2l1a-delta-changed">${DELTA_LABELS[key] ?? key} <span>تغيّر</span></li>`).join('');
    const unchanged = state.unchanged.map((key) => `<li class="u2l1a-delta-same">${DELTA_LABELS[key] ?? key} <span>لم يتغيّر</span></li>`).join('');
    panel.querySelector(`[data-method-delta="${method}"]`).innerHTML = `<ul class="u2l1a-delta-list">${changed}${unchanged}</ul>`;

    panel.querySelector(`[data-method-conservation="${method}"]`).innerHTML =
      stateRow('الساق', `${state.a.electronDelta >= 0 ? '+' : '−'}${Math.abs(state.a.electronDelta)} إلكترون`)
      + stateRow('الجسم الثاني', `${state.b.electronDelta >= 0 ? '+' : '−'}${Math.abs(state.b.electronDelta)} إلكترون`)
      + stateRow('الأرض', `${state.ground >= 0 ? '+' : '−'}${Math.abs(state.ground)} إلكترون`)
      + stateRow('المجموع', `${state.conservation.total >= 0 ? '+' : '−'}${Math.abs(state.conservation.total)} إلكترون ${state.conservation.balanced ? '(محفوظ)' : ''}`);

    /* scene */
    const svg = panel.querySelector(`[data-method-svg="${method}"]`);
    const marksA = svg.querySelector('[data-method-marks-a]');
    const marksB = svg.querySelector('[data-method-marks-b]');
    const drawMarks = (node, body, originX) => {
      const count = Math.min(4, Math.abs(body.electronDelta));
      node.innerHTML = body.electronDelta === 0 ? '' : Array.from({ length: count }, (_, index) => `
        <text class="u2l1a-charge-mark ${body.sign > 0 ? 'is-positive' : 'is-negative'}" x="${originX + index * 20}" y="0" text-anchor="middle">${signGlyph(body.sign)}</text>`).join('');
    };
    drawMarks(marksA, state.a, 180);
    drawMarks(marksB, state.b, 500);
    svg.querySelector(`[data-method-near="${method}"]`).setAttribute('opacity', state.b.polarized ? '1' : '0');
    svg.querySelector(`[data-method-far="${method}"]`).setAttribute('opacity', state.b.polarized ? '1' : '0');
    svg.querySelector(`[data-method-ground="${method}"]`).setAttribute('opacity', state.grounded ? '1' : '0');
    const flow = svg.querySelector(`[data-method-flow="${method}"]`);
    const flowLabel = svg.querySelector(`[data-method-flow-label="${method}"]`);
    if (state.flow) {
      const toGround = state.flow.to === 'ground';
      flow.setAttribute('opacity', '1');
      if (toGround) {
        flow.querySelector('line').setAttribute('x1', '530');
        flow.querySelector('line').setAttribute('y1', '185');
        flow.querySelector('line').setAttribute('x2', '530');
        flow.querySelector('line').setAttribute('y2', '244');
        flowLabel.setAttribute('x', '596');
        flowLabel.setAttribute('y', '216');
        flowLabel.textContent = `${state.flow.count} إلكترون إلى الأرض`;
      } else {
        const leftToRight = state.flow.from === 'a';
        flow.querySelector('line').setAttribute('x1', leftToRight ? '300' : '470');
        flow.querySelector('line').setAttribute('y1', '137');
        flow.querySelector('line').setAttribute('x2', leftToRight ? '470' : '300');
        flow.querySelector('line').setAttribute('y2', '137');
        flowLabel.setAttribute('x', '385');
        flowLabel.setAttribute('y', '122');
        flowLabel.textContent = `${state.flow.count} إلكترون`;
      }
    } else {
      flow.setAttribute('opacity', '0');
    }
    svg.querySelector(`[data-method-desc="${method}"]`).textContent =
      `${card.bodies.a.name}: ${conditionWord(state.a.condition)}، ${card.bodies.b.name}: ${conditionWord(state.b.condition)}${state.b.polarized ? ' مع استقطاب داخلي (طرف قريب موجب وطرف بعيد سالب)' : ''}.`;

    const copy = METHOD_STEP_COPY[state.summaryKey];
    panel.querySelector(`[data-method-observation="${method}"]`).textContent = copy.observation;
    panel.querySelector(`[data-method-explanation="${method}"]`).innerHTML = copy.explanation;
    panel.querySelector(`[data-method-caption="${method}"]`).textContent = `${card.steps[stepIndexes[method]].label}: ${conditionWord(state.b.condition)} — ${METHOD_COMPARISON_VALUES[state.mechanism]}.`;
    panel.querySelector(`[data-method-status="${method}"]`).textContent =
      `الخطوة ${stepIndexes[method] + 1} من ${card.steps.length} في ${card.title}. ${copy.observation}`;
    return state;
  };

  const paintComparison = () => {
    for (const row of METHOD_COMPARISON_ROWS) {
      const computed = comparison.rows.find((candidate) => candidate.id === row.id);
      for (const method of METHOD_IDS) {
        const cell = panel.querySelector(`[data-compare-row="${row.id}"] [data-compare-cell="${method}"]`);
        const value = computed.values[method];
        cell.textContent = METHOD_COMPARISON_VALUES[value] ?? value;
        cell.dataset.value = value;
      }
    }
  };

  function showMethod(method) {
    activeMethod = method;
    METHOD_IDS.forEach((candidate) => {
      panel.querySelector(`[data-method-panel="${candidate}"]`).hidden = candidate !== method;
      panel.querySelector(`[data-method-tab="${candidate}"]`).setAttribute('aria-pressed', candidate === method ? 'true' : 'false');
    });
    paintState(method, METHOD_STEPS[method][stepIndexes[method]]);
  }

  METHOD_IDS.forEach((method) => {
    const card = METHOD_CARDS[method];
    panel.querySelector(`[data-method-tab="${method}"]`).addEventListener('click', () => showMethod(method));
    panel.querySelector(`[data-method-steps="${method}"]`).addEventListener('click', (event) => {
      const button = event.target.closest('[data-method-step]');
      if (!button) return;
      const index = Number(button.dataset.methodStepIndex);
      if (index > stepIndexes[method] + 1) {
        panel.querySelector(`[data-method-status="${method}"]`).textContent = 'نفّذ الخطوات بالترتيب: الخطوة التالية مباشرة هي المتاحة الآن.';
        return;
      }
      stepIndexes[method] = index;
      panel.querySelectorAll(`[data-method-steps="${method}"] [data-method-step]`).forEach((node) => {
        if (node === button) node.setAttribute('aria-current', 'step');
        else node.removeAttribute('aria-current');
      });
      paintState(method, card.steps[index].id);
    });
    panel.querySelector(`[data-method-reset="${method}"]`).addEventListener('click', () => {
      stepIndexes[method] = 0;
      panel.querySelectorAll(`[data-method-steps="${method}"] [data-method-step]`).forEach((node, index) => {
        if (index === 0) node.setAttribute('aria-current', 'step');
        else node.removeAttribute('aria-current');
      });
      paintState(method, 'before');
      panel.querySelector(`[data-method-status="${method}"]`).textContent = `أُعيدت طريقة ${card.title} إلى خطوتها الأولى.`;
    });
    panel.querySelector(`[data-compare-method="${method}"]`).addEventListener('click', () => {
      stepIndexes[method] = METHOD_STEPS[method].length - 1;
      panel.querySelectorAll(`[data-method-steps="${method}"] [data-method-step]`).forEach((node, index) => {
        if (index === stepIndexes[method]) node.setAttribute('aria-current', 'step');
        else node.removeAttribute('aria-current');
      });
      showMethod(method);
      const heading = panel.querySelector('#station-methods-heading');
      heading?.focus?.({ preventScroll: true });
      panel.querySelector(`[data-method-status="${method}"]`).textContent = `عرضتَ الحالة النهائية لطريقة ${METHOD_CARDS[method].title} كما في جدول المقارنة.`;
    });
  });

  paintComparison();
  showMethod(activeMethod);
}

/* ================================================== station 4 · force arena */

function arenaMarkup() {
  const predictions = ARENA_PREDICTIONS.map((choice) => `
    <label class="u2l1a-choice">
      <input type="radio" name="arena-prediction" value="${choice.id}" data-arena-prediction="${choice.id}" />
      <span>${choice.label}</span>
    </label>`).join('');
  return `
  <div class="u2l1a-station-intro">${ARENA_INTRO_HTML}</div>
  <div class="u2l1a-lab">
    <section class="u2l1a-lab-controls" aria-label="ضوابط ساحة التجاذب والتنافر">
      <div class="u2l1a-sign-row" role="group" aria-label="إشارة شحنة كل جسم">
        <div class="u2l1a-sign-control">
          <span class="u2l1a-mini-label">إشارة شحنة الجسم (أ)</span>
          <div class="u2l1a-sign-buttons">
            <button class="u2l1a-sign-button" type="button" data-arena-sign="a" data-sign="1" aria-pressed="true">موجبة +</button>
            <button class="u2l1a-sign-button" type="button" data-arena-sign="a" data-sign="-1" aria-pressed="false">سالبة −</button>
          </div>
        </div>
        <div class="u2l1a-sign-control">
          <span class="u2l1a-mini-label">إشارة شحنة الجسم (ب)</span>
          <div class="u2l1a-sign-buttons">
            <button class="u2l1a-sign-button" type="button" data-arena-sign="b" data-sign="1" aria-pressed="false">موجبة +</button>
            <button class="u2l1a-sign-button" type="button" data-arena-sign="b" data-sign="-1" aria-pressed="true">سالبة −</button>
          </div>
        </div>
        <label class="u2l1a-toggle">
          <input type="checkbox" data-arena-unequal />
          <span>اجعل مقدار إحدى الشحنتين أكبر (قارن طولَي السهمين)</span>
        </label>
      </div>
      <fieldset class="u2l1a-choice-set">
        <legend>${ARENA_PREDICTION_PROMPT}</legend>
        <div class="u2l1a-choice-list">${predictions}</div>
      </fieldset>
      <div class="u2l1a-button-row">
        <button class="u2l1a-action u2l1a-action-primary" type="button" data-arena-reveal>اكشف النتيجة</button>
        <button class="u2l1a-action" type="button" data-arena-run disabled>شغّل الحركة</button>
        <button class="u2l1a-action" type="button" data-arena-flip>بدّل إشارة الجسم (ب)</button>
        <button class="u2l1a-action u2l1a-action-ghost" type="button" data-arena-reset>أعد الضبط</button>
      </div>
      <p class="u2l1a-status" role="status" aria-live="polite" data-arena-status>اختر إشارتَي الشحنتين، توقّع النتيجة، ثم اكشفها.</p>
    </section>
    <figure class="u2l1a-scene">
      <div class="u2l1a-scene-canvas">
        <svg viewBox="0 0 720 300" role="img" aria-labelledby="arena-title arena-desc" data-arena-svg>
          <title id="arena-title">جسمان مشحونان على مستقيم واحد وقوى التجاذب أو التنافر بينهما</title>
          <desc id="arena-desc" data-arena-desc>جسم موجب وجسم سالب قبل كشف النتيجة.</desc>
          <line class="u2l1a-axis" x1="40" y1="214" x2="680" y2="214" />
          <text class="u2l1a-scene-label u2l1a-scene-label-small" x="40" y="238">الحامل: المستقيم المارّ بالشحنتين</text>
          <g data-arena-arrow-group opacity="0">
            <line class="u2l1a-leader" data-arena-leader="a" x1="252" y1="92" x2="252" y2="176" />
            <line class="u2l1a-leader" data-arena-leader="b" x1="468" y1="148" x2="468" y2="176" />
            <line class="u2l1a-force-arrow" data-arena-arrow="a" x1="252" y1="84" x2="330" y2="84" marker-end="url(#u2l1a-arena-head)" />
            <line class="u2l1a-force-arrow" data-arena-arrow="b" x1="468" y1="140" x2="390" y2="140" marker-end="url(#u2l1a-arena-head)" />
            <text class="u2l1a-scene-label u2l1a-scene-label-small" data-arena-arrow-label="a" x="252" y="70" text-anchor="middle">القوة المؤثرة على (أ)</text>
            <text class="u2l1a-scene-label u2l1a-scene-label-small" data-arena-arrow-label="b" x="468" y="164" text-anchor="middle">القوة المؤثرة على (ب)</text>
          </g>
          <circle class="u2l1a-sphere u2l1a-sphere-a" data-arena-sphere="a" cx="252" cy="214" r="34" />
          <circle class="u2l1a-sphere u2l1a-sphere-b" data-arena-sphere="b" cx="468" cy="214" r="34" />
          <text class="u2l1a-sphere-sign" data-arena-sign-label="a" x="252" y="224" text-anchor="middle">+</text>
          <text class="u2l1a-sphere-sign" data-arena-sign-label="b" x="468" y="224" text-anchor="middle">−</text>
          <defs>
            <marker id="u2l1a-arena-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0L10 5L0 10z" class="u2l1a-arrow-head" />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption data-arena-caption>اختر الإشارتين ثم اكشف النتيجة لترى جهة القوة على كل جسم.</figcaption>
      ${modelBadge()}
    </figure>
    <div class="u2l1a-result-pair">
      <section class="u2l1a-result-card" data-arena-kind-card hidden>
        <p class="u2l1a-card-label"><span aria-hidden="true">◉</span> النتيجة</p>
        <h3 data-arena-kind-headline>—</h3>
        <div data-arena-kind-body></div>
      </section>
      <section class="u2l1a-result-card" data-arena-prediction-card hidden>
        <p class="u2l1a-card-label"><span aria-hidden="true">✦</span> توقّعك</p>
        <h3>قارن توقّعك بالنتيجة</h3>
        <p data-arena-prediction-body></p>
      </section>
    </div>
    ${sourceCard(`${SOURCE_LABEL} · ص77`, ARENA_RULE_BOOK_HTML)}
    ${sourceCard(`${SOURCE_LABEL} · ص80`, ARENA_FORCE_ELEMENTS_BOOK_HTML)}
    ${platformCard(ENRICHMENT_LABEL, ARENA_EQUAL_FORCES_NOTE_HTML)}
    ${limitsCard('حدود هذا النموذج', ARENA_MODEL_LIMITS)}
  </div>`;
}

function mountArena(panel, context) {
  const svg = panel.querySelector('[data-arena-svg]');
  const arrowGroup = panel.querySelector('[data-arena-arrow-group]');
  const status = panel.querySelector('[data-arena-status]');
  const caption = panel.querySelector('[data-arena-caption]');
  const desc = panel.querySelector('[data-arena-desc]');
  const runButton = panel.querySelector('[data-arena-run]');
  const kindCard = panel.querySelector('[data-arena-kind-card]');
  const predictionCard = panel.querySelector('[data-arena-prediction-card]');

  let signA = 1;
  let signB = -1;
  let unequal = false;
  let progress = 0;
  let revealed = false;
  let cancelAnimation = null;

  const paint = () => {
    const state = arenaState({ signA, signB, unequal, progress: revealed ? progress : 0 });
    for (const key of ['a', 'b']) {
      const sphere = svg.querySelector(`[data-arena-sphere="${key}"]`);
      const sign = key === 'a' ? signA : signB;
      const x = key === 'a' ? state.positions.ax : state.positions.bx;
      sphere.setAttribute('cx', String(x));
      sphere.setAttribute('r', String(state.radii[key]));
      sphere.dataset.sign = String(sign);
      const label = svg.querySelector(`[data-arena-sign-label="${key}"]`);
      label.setAttribute('x', String(x));
      label.textContent = signGlyph(sign);
      const arrow = svg.querySelector(`[data-arena-arrow="${key}"]`);
      const drawn = state.arrows.find((candidate) => candidate.body === key);
      arrow.setAttribute('x1', String(drawn.x1));
      arrow.setAttribute('x2', String(drawn.x2));
      arrow.setAttribute('y1', String(drawn.y1));
      arrow.setAttribute('y2', String(drawn.y2));
      arrow.dataset.kind = state.kind;
      const leader = svg.querySelector(`[data-arena-leader="${key}"]`);
      leader.setAttribute('x1', String(drawn.leaderX));
      leader.setAttribute('x2', String(drawn.leaderX));
      leader.setAttribute('y1', String(drawn.leaderY1));
      leader.setAttribute('y2', String(state.positions.y - state.radii[key] - 4));
      const arrowLabel = svg.querySelector(`[data-arena-arrow-label="${key}"]`);
      arrowLabel.setAttribute('x', String(drawn.x1));
      arrowLabel.setAttribute('y', String(drawn.y1 - 14));
    }
    arrowGroup.setAttribute('opacity', revealed ? '1' : '0');
    const kindWord = state.kind === 'attraction' ? 'تتجاذبان' : state.kind === 'repulsion' ? 'تتنافران' : 'لا قوة بينهما';
    desc.textContent = `${signA > 0 ? 'الجسم (أ) موجب' : 'الجسم (أ) سالب'} و${signB > 0 ? 'الجسم (ب) موجب' : 'الجسم (ب) سالب'}: ${revealed ? kindWord : 'لم تُكشف النتيجة بعد'}.`;
    caption.textContent = revealed
      ? `${kindWord}: السهمان يمثّلان القوة المؤثرة على كل جسم، وطولاهما متساويان وجهتاهما متعاكستان.`
      : 'اختر الإشارتين ثم اكشف النتيجة لترى جهة القوة على كل جسم.';
    return state;
  };

  const reveal = () => {
    revealed = true;
    progress = 0;
    const state = paint();
    const copy = ARENA_KIND_COPY[state.kind];
    kindCard.hidden = false;
    panel.querySelector('[data-arena-kind-headline]').textContent = copy.headline;
    panel.querySelector('[data-arena-kind-body]').innerHTML = copy.bodyHtml;
    const picked = panel.querySelector('input[data-arena-prediction]:checked')?.value ?? null;
    if (picked) {
      predictionCard.hidden = false;
      const matched = picked === state.kind;
      panel.querySelector('[data-arena-prediction-body]').innerHTML = matched
        ? `<p>توقعتَ <strong>${ARENA_PREDICTIONS.find((choice) => choice.id === picked).label}</strong> وهذا ما حدث فعلاً.</p>`
        : `<p>توقعتَ <strong>${ARENA_PREDICTIONS.find((choice) => choice.id === picked).label}</strong>، والنتيجة هي <strong>${copy.headline}</strong>. بدّل إحدى الإشارتين ولاحظ الفرق.</p>`;
    } else {
      predictionCard.hidden = true;
    }
    runButton.disabled = false;
    status.textContent = `النتيجة: ${copy.headline}. شغّل الحركة لترى الجسمين يتحركان في الجهة نفسها التي تشير إليها الأسهم.`;
  };

  panel.querySelectorAll('[data-arena-sign]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.arenaSign;
      const value = Number(button.dataset.sign);
      if (key === 'a') signA = value;
      else signB = value;
      panel.querySelectorAll(`[data-arena-sign="${key}"]`).forEach((node) => node.setAttribute('aria-pressed', node === button ? 'true' : 'false'));
      progress = 0;
      paint();
      if (revealed) reveal();
      else status.textContent = `غيّرتَ إشارة الجسم (${key === 'a' ? 'أ' : 'ب'}): ${value > 0 ? 'موجبة' : 'سالبة'}. ما توقّعك الآن؟`;
    });
  });

  panel.querySelector('[data-arena-flip]').addEventListener('click', () => {
    signB = -signB;
    panel.querySelectorAll('[data-arena-sign="b"]').forEach((node) => node.setAttribute('aria-pressed', Number(node.dataset.sign) === signB ? 'true' : 'false'));
    progress = 0;
    paint();
    if (revealed) reveal();
    status.textContent = `بدّلتَ إشارة الجسم (ب) فصارت ${signB > 0 ? 'موجبة' : 'سالبة'}: قارن جهة السهمين الآن بما كانت عليه.`;
  });

  panel.querySelector('[data-arena-unequal]').addEventListener('change', (event) => {
    unequal = event.target.checked;
    progress = 0;
    paint();
    status.textContent = unequal
      ? 'جعلتَ مقدار إحدى الشحنتين أكبر: لاحظ أن طولَي السهمين بقيَا متساويين، فلكل جسم قوته الخاصة بهما معاً.'
      : 'أعدتَ الشحنتين إلى المقدار نفسه.';
  });

  panel.querySelector('[data-arena-reveal]').addEventListener('click', reveal);

  runButton.addEventListener('click', () => {
    cancelAnimation?.();
    progress = 0;
    cancelAnimation = animate(1400, (t) => {
      progress = t;
      paint();
    }, context.reducedMotion);
    status.textContent = 'الحركة المعروضة تقريبية ومحدودة بإطار الرسم، وهي متسقة مع جهة القوة: تقارب عند التجاذب وتباعد عند التنافر.';
  });

  panel.querySelector('[data-arena-reset]').addEventListener('click', () => {
    cancelAnimation?.();
    signA = 1;
    signB = -1;
    unequal = false;
    progress = 0;
    revealed = false;
    panel.querySelector('[data-arena-unequal]').checked = false;
    panel.querySelectorAll('input[data-arena-prediction]').forEach((input) => { input.checked = false; });
    panel.querySelectorAll('[data-arena-sign]').forEach((node) => {
      const current = node.dataset.arenaSign === 'a' ? signA : signB;
      node.setAttribute('aria-pressed', Number(node.dataset.sign) === current ? 'true' : 'false');
    });
    kindCard.hidden = true;
    predictionCard.hidden = true;
    runButton.disabled = true;
    paint();
    status.textContent = 'أُعيدت الساحة إلى حالتها الأولى: الجسم (أ) موجب والجسم (ب) سالب.';
  });

  paint();
}

/* =================================================== station 5 · Coulomb lab */

function coulombMarkup() {
  const FIELD_TEX = Object.freeze({ q1: 'q_{1}', q2: 'q_{2}', d: 'd' });
  const slider = (field, id) => {
    const spec = COULOMB_FIELDS[field];
    const value = DEFAULT_COULOMB_STATE[field];
    return `
    <div class="u2l1a-slider-control">
      <div class="u2l1a-slider-head">
        <label for="${id}">${spec.label} ${tex(FIELD_TEX[field], field)}</label>
        <output class="u2l1a-slider-value" for="${id}" data-coulomb-value="${field}"><bdi dir="ltr">${value} ${spec.unit}</bdi></output>
      </div>
      <input class="u2l1a-slider" id="${id}" type="range" min="${spec.min}" max="${spec.max}" step="${spec.step}" value="${value}" data-coulomb-input="${field}" aria-label="${spec.label}" />
      <div class="u2l1a-slider-ends" aria-hidden="true"><bdi dir="ltr">${spec.min} ${spec.unit}</bdi><bdi dir="ltr">${spec.max} ${spec.unit}</bdi></div>
      <p class="u2l1a-slider-note" data-coulomb-note="${field}"></p>
    </div>`;
  };
  const signControl = (field, id) => `
    <div class="u2l1a-sign-control">
      <span class="u2l1a-mini-label" id="${id}-label">إشارة ${field === 'q1Sign' ? 'الشحنة الأولى' : 'الشحنة الثانية'}</span>
      <div class="u2l1a-sign-buttons" role="group" aria-labelledby="${id}-label">
        <button class="u2l1a-sign-button" type="button" data-coulomb-sign="${field}" data-sign="1" aria-pressed="true">موجبة +</button>
        <button class="u2l1a-sign-button" type="button" data-coulomb-sign="${field}" data-sign="-1" aria-pressed="false">سالبة −</button>
      </div>
    </div>`;
  const probes = COULOMB_PROBE_QUESTIONS.map((probe) => `
    <article class="u2l1a-probe" data-probe-card="${probe.id}">
      <h4>${probe.promptHtml}</h4>
      <div class="u2l1a-choice-list u2l1a-choice-list-inline" role="group" aria-label="توقّعك لأثر التغيير في شدة القوة">
        ${COULOMB_RATIO_CHOICES.map((choice) => `
          <label class="u2l1a-choice u2l1a-choice-pill">
            <input type="radio" name="probe-${probe.id}" value="${choice.id}" data-probe-choice="${probe.id}" data-choice="${choice.id}" />
            <span>${choice.label}</span>
          </label>`).join('')}
      </div>
      <div class="u2l1a-button-row">
        <button class="u2l1a-action u2l1a-action-primary" type="button" data-probe-check="${probe.id}">تحقّق من توقّعي</button>
        <button class="u2l1a-action" type="button" data-probe-apply="${probe.id}">طبّق التغيير في المختبر</button>
      </div>
      <div class="u2l1a-probe-result" data-probe-result="${probe.id}" role="status" aria-live="polite" hidden></div>
    </article>`).join('');
  return `
  <div class="u2l1a-station-intro">${COULOMB_INTRO_HTML}</div>
  <div class="u2l1a-lab">
    <section class="u2l1a-lab-controls" aria-label="ضوابط مختبر قانون كولوم">
      <div class="u2l1a-coulomb-grid">
        ${signControl('q1Sign', 'coulomb-q1-sign')}
        ${slider('q1', 'coulomb-q1')}
        ${signControl('q2Sign', 'coulomb-q2-sign')}
        ${slider('q2', 'coulomb-q2')}
        ${slider('d', 'coulomb-d')}
      </div>
      <div class="u2l1a-button-row">
        <button class="u2l1a-action" type="button" data-coulomb-book>حمّل حالة الكتاب (ص81)</button>
        <button class="u2l1a-action u2l1a-action-ghost" type="button" data-coulomb-reset>أعد الضبط إلى الحالة الابتدائية</button>
      </div>
      <p class="u2l1a-status" role="status" aria-live="polite" data-coulomb-status>الحالة الابتدائية: شحنتان موجبتان مقدار كلٍّ منهما 5 ميكروكولوم، والمسافة بينهما 50 سم.</p>
    </section>
    <section class="u2l1a-coulomb-results" aria-labelledby="coulomb-results-heading">
      <h3 id="coulomb-results-heading" class="u2l1a-visually-hidden">نتائج مختبر كولوم</h3>
      <div class="u2l1a-force-panel">
        <span class="u2l1a-mini-label">شدة القوة الكهربائية F (مقدار)</span>
        <p class="u2l1a-force-value" data-coulomb-force></p>
        <p class="u2l1a-force-meter"><span data-coulomb-meter></span></p>
        <p class="u2l1a-meter-note">الشريط تمثيل تقريبي للشدة على مقياس لوغاريتمي، وليس محور قياس معايراً.</p>
      </div>
      <div class="u2l1a-force-side">
        ${readout('نوع القوة (من الإشارتين)', '<span data-coulomb-kind></span>')}
        ${readout('التحويل إلى النظام الدولي', '<span data-coulomb-converted></span>')}
        <div class="u2l1a-substitution">
          <span class="u2l1a-readout-label">التعويض في القانون</span>
          <div data-coulomb-substitution></div>
        </div>
      </div>
      <div class="u2l1a-warning" data-coulomb-warning hidden>${COULOMB_BEYOND_RANGE_NOTE}</div>
    </section>
    <figure class="u2l1a-scene u2l1a-scene-compact">
      <div class="u2l1a-scene-canvas">
        <svg viewBox="0 0 720 190" role="img" aria-labelledby="coulomb-scene-title coulomb-scene-desc" data-coulomb-svg>
          <title id="coulomb-scene-title">شحنتان نقطيتان تفصل بينهما مسافة</title>
          <desc id="coulomb-scene-desc" data-coulomb-desc>شحنتان موجبتان مقدار كلٍّ منهما 5 ميكروكولوم والمسافة بينهما 50 سم.</desc>
          <circle class="u2l1a-sphere u2l1a-sphere-a" cx="180" cy="86" r="30" data-coulomb-sphere="1" />
          <circle class="u2l1a-sphere u2l1a-sphere-b" cx="540" cy="86" r="30" data-coulomb-sphere="2" />
          <text class="u2l1a-sphere-sign" x="180" y="96" text-anchor="middle" data-coulomb-sign-text="1">+</text>
          <text class="u2l1a-sphere-sign" x="540" y="96" text-anchor="middle" data-coulomb-sign-text="2">+</text>
          <line class="u2l1a-dimension" x1="180" y1="146" x2="540" y2="146" />
          <line class="u2l1a-dimension-tick" x1="180" y1="138" x2="180" y2="154" />
          <line class="u2l1a-dimension-tick" x1="540" y1="138" x2="540" y2="154" />
          <text class="u2l1a-scene-label" x="360" y="176" text-anchor="middle" data-coulomb-dimension-label>d = 50 cm</text>
          <line class="u2l1a-force-arrow" data-coulomb-arrow="1" x1="180" y1="86" x2="110" y2="86" marker-end="url(#u2l1a-coulomb-head)" />
          <line class="u2l1a-force-arrow" data-coulomb-arrow="2" x1="540" y1="86" x2="610" y2="86" marker-end="url(#u2l1a-coulomb-head)" />
          <defs>
            <marker id="u2l1a-coulomb-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0L10 5L0 10z" class="u2l1a-arrow-head" />
            </marker>
          </defs>
        </svg>
      </div>
      <figcaption>جهة السهمين هنا تمثّل نوع القوة فقط (تجاذب أو تنافر)؛ أما الشدة فتُقرأ من اللوحة أعلاه. ${MODEL_LABEL}</figcaption>
    </figure>
    <section class="u2l1a-probes" aria-labelledby="coulomb-probes-heading">
      <p class="u2l1a-card-label"><span aria-hidden="true">✦</span> تحدّيات النسب — محسوبة من قيمك أنت</p>
      <h3 id="coulomb-probes-heading">ماذا يحدث لشدة القوة إذا…؟</h3>
      <p>اختر توقّعك ثم تحقّق. الأرقام التي تظهر مأخوذة من حالتك الحالية في المختبر، وليست نتائج محفوظة.</p>
      <div class="u2l1a-probe-list">${probes}</div>
      <p class="u2l1a-status" role="status" aria-live="polite" data-probe-status>لم تتحقّق من أي تحدٍّ بعد.</p>
    </section>
    <section class="u2l1a-card u2l1a-card-legend" aria-labelledby="coulomb-legend-heading">
      <p class="u2l1a-card-label"><span aria-hidden="true">◆</span> الرموز والوحدات</p>
      <h3 id="coulomb-legend-heading">اقرأ القانون بدقة</h3>
      <dl class="u2l1a-legend">
        ${COULOMB_SYMBOL_LEGEND.map((entry) => `
          <div class="u2l1a-legend-row"><dt>${entry.symbol}</dt><dd><span>${entry.meaning}</span><small>${typeof entry.unitText === 'string' ? entry.unitText : entry.unitText}</small></dd></div>`).join('')}
      </dl>
      ${COULOMB_UNIT_NOTE_HTML}
      ${COULOMB_MAGNITUDE_VS_DIRECTION_HTML}
    </section>
    ${sourceCard(`${SOURCE_LABEL} · ص80`, COULOMB_LAW_BOOK_HTML)}
    <section class="u2l1a-card u2l1a-card-example" aria-labelledby="coulomb-example-heading">
      <p class="u2l1a-card-label"><span aria-hidden="true">◆</span> ${COULOMB_BOOK_EXAMPLE.label}</p>
      <h3 id="coulomb-example-heading">تطبيق الكتاب المحلول</h3>
      ${COULOMB_BOOK_EXAMPLE.statementHtml}
      <button class="u2l1a-action" type="button" data-coulomb-example>اعرض خطوات الحل</button>
      <ol class="u2l1a-solution-steps" data-coulomb-example-steps hidden>
        ${COULOMB_BOOK_EXAMPLE.steps.map((step) => `<li><span class="u2l1a-step-label">${step.label}</span><div class="u2l1a-step-body">${step.html}</div></li>`).join('')}
      </ol>
      <p class="u2l1a-note-inline">اضغط «حمّل حالة الكتاب (ص81)» في الأعلى ليرسم المختبر هذه القيم نفسها ويعطيك النتيجة نفسها.</p>
    </section>
    ${limitsCard('حدود هذا النموذج', COULOMB_MODEL_LIMITS)}
  </div>`;
}

function mountCoulomb(panel) {
  const state = { current: createCoulombState() };
  const forceNode = panel.querySelector('[data-coulomb-force]');
  const meterNode = panel.querySelector('[data-coulomb-meter]');
  const kindNode = panel.querySelector('[data-coulomb-kind]');
  const convertedNode = panel.querySelector('[data-coulomb-converted]');
  const substitutionNode = panel.querySelector('[data-coulomb-substitution]');
  const warning = panel.querySelector('[data-coulomb-warning]');
  const status = panel.querySelector('[data-coulomb-status]');
  const probeStatus = panel.querySelector('[data-probe-status]');
  const desc = panel.querySelector('[data-coulomb-desc]');
  const dimensionLabel = panel.querySelector('[data-coulomb-dimension-label]');
  const solvedProbes = new Set();

  const paint = (message) => {
    const reading = coulombReading(state.current);
    forceNode.innerHTML = formula(forceTeX(reading.magnitude), `F equals ${reading.magnitude} newtons`);
    const meter = Math.max(0.04, Math.min(1, (Math.log10(reading.magnitude) + 6) / 11));
    meterNode.style.width = `${(meter * 100).toFixed(1)}%`;
    kindNode.textContent = reading.kind === 'repulsion' ? 'تنافر (الشحنتان متماثلتان)' : reading.kind === 'attraction' ? 'تجاذب (الشحنتان مختلفتان)' : 'لا قوة';
    convertedNode.innerHTML = `${tex(chargeTeX(reading.q1C), 'q one in coulombs')} ${tex(',', 'comma')} ${tex(chargeTeX(reading.q2C), 'q two in coulombs')} ${tex(',', 'comma')} ${tex(`${reading.dM}~\\mathrm{m}`, 'distance in metres')}`;
    substitutionNode.innerHTML = formula(
      `F=9\\times 10^{9}\\times\\frac{(${sciTeX(Math.abs(reading.q1C))})(${sciTeX(Math.abs(reading.q2C))})}{(${sciTeX(reading.dM)})^{2}}=${forceTeX(reading.magnitude)}`,
      `F equals nine times ten to the nine times the product of the two charge magnitudes over the distance squared, which is ${reading.formatted}`,
    );
    warning.hidden = !reading.beyondModelRange;
    for (const field of ['q1', 'q2', 'd']) {
      const spec = COULOMB_FIELDS[field];
      panel.querySelector(`[data-coulomb-value="${field}"]`).innerHTML = `<bdi dir="ltr">${state.current[field]} ${spec.unit}</bdi>`;
      const note = panel.querySelector(`[data-coulomb-note="${field}"]`);
      note.innerHTML = field === 'd'
        ? `بالنظام الدولي: ${tex(`${reading.dM}~\\mathrm{m}`, 'distance in metres')}`
        : `بالنظام الدولي: ${tex(chargeTeX(field === 'q1' ? reading.q1C : reading.q2C), 'charge in coulombs')}`;
    }
    for (const key of ['1', '2']) {
      const sign = key === '1' ? state.current.q1Sign : state.current.q2Sign;
      panel.querySelector(`[data-coulomb-sign-text="${key}"]`).textContent = signGlyph(sign);
      panel.querySelector(`[data-coulomb-sphere="${key}"]`).dataset.sign = String(sign);
      const arrow = panel.querySelector(`[data-coulomb-arrow="${key}"]`);
      const outward = reading.kind === 'repulsion';
      const base = key === '1' ? 180 : 540;
      const direction = key === '1' ? (outward ? -1 : 1) : (outward ? 1 : -1);
      arrow.setAttribute('x1', String(base));
      arrow.setAttribute('x2', String(base + direction * 70));
      arrow.dataset.kind = reading.kind;
    }
    dimensionLabel.textContent = `d = ${state.current.d} cm`;
    desc.textContent = `شحنتان مقداراهما ${state.current.q1} و${state.current.q2} ميكروكولوم بإشارتين ${state.current.q1Sign > 0 ? 'موجبة' : 'سالبة'} و${state.current.q2Sign > 0 ? 'موجبة' : 'سالبة'}، والمسافة بينهما ${state.current.d} سم، وشدة القوة ${reading.formatted} ونوعها ${reading.kind === 'repulsion' ? 'تنافر' : 'تجاذب'}.`;
    if (message) status.textContent = message;
    return reading;
  };

  panel.querySelectorAll('[data-coulomb-input]').forEach((input) => {
    const handler = () => {
      state.current = updateCoulombInput(state.current, input.dataset.coulombInput, Number(input.value));
      paint(`غيّرتَ ${COULOMB_FIELDS[input.dataset.coulombInput].label}: شدة القوة الآن ${coulombReading(state.current).formatted}.`);
    };
    input.addEventListener('input', handler);
    input.addEventListener('change', handler);
  });

  panel.querySelectorAll('[data-coulomb-sign]').forEach((button) => {
    button.addEventListener('click', () => {
      const field = button.dataset.coulombSign;
      state.current = updateCoulombInput(state.current, field, Number(button.dataset.sign));
      panel.querySelectorAll(`[data-coulomb-sign="${field}"]`).forEach((node) => node.setAttribute('aria-pressed', node === button ? 'true' : 'false'));
      const reading = paint();
      status.textContent = `غيّرتَ الإشارة: المقدار بقي ${reading.formatted} لأن القانون يحسب المقدار بالقيم المطلقة، أما النوع فصار ${reading.kind === 'repulsion' ? 'تنافراً' : 'تجاذباً'}.`;
    });
  });

  const applyState = (next, message) => {
    state.current = createCoulombState(next);
    panel.querySelectorAll('[data-coulomb-input]').forEach((input) => {
      input.value = String(state.current[input.dataset.coulombInput]);
    });
    panel.querySelectorAll('[data-coulomb-sign]').forEach((button) => {
      const field = button.dataset.coulombSign;
      button.setAttribute('aria-pressed', Number(button.dataset.sign) === state.current[field] ? 'true' : 'false');
    });
    paint(message);
  };

  panel.querySelector('[data-coulomb-book]').addEventListener('click', () => {
    applyState(BOOK_COULOMB_STATE, 'حمّلتَ تطبيق الكتاب (ص81): الشحنتان 50 و80 ميكروكولوم والمسافة 1 متر، والنتيجة يجب أن تكون 36 نيوتن كما في الكتاب.');
  });

  panel.querySelector('[data-coulomb-reset]').addEventListener('click', () => {
    applyState(resetCoulombState(), 'أُعيد المختبر إلى حالته الابتدائية: شحنتان موجبتان 5 ميكروكولوم والمسافة 50 سم.');
  });

  panel.querySelector('[data-coulomb-example]').addEventListener('click', (event) => {
    const steps = panel.querySelector('[data-coulomb-example-steps]');
    steps.hidden = !steps.hidden;
    event.target.textContent = steps.hidden ? 'اعرض خطوات الحل' : 'أخفِ خطوات الحل';
  });

  COULOMB_PROBE_QUESTIONS.forEach((probe) => {
    const resultNode = panel.querySelector(`[data-probe-result="${probe.id}"]`);
    panel.querySelector(`[data-probe-check="${probe.id}"]`).addEventListener('click', () => {
      const picked = panel.querySelector(`input[data-probe-choice="${probe.id}"]:checked`)?.value ?? null;
      if (!picked) {
        resultNode.hidden = false;
        resultNode.innerHTML = '<p>اختر توقّعاً أولاً من الخيارات الخمسة، ثم اضغط «تحقّق من توقّعي».</p>';
        return;
      }
      const verdict = checkProbePrediction(state.current, probe.id, picked);
      const result = evaluateCoulombProbe(state.current, probe.id);
      const pickedLabel = COULOMB_RATIO_CHOICES.find((choice) => choice.id === picked).label;
      resultNode.hidden = false;
      resultNode.dataset.verdict = verdict.isCorrect ? 'correct' : 'incorrect';
      resultNode.innerHTML = `
        <p class="u2l1a-verdict ${verdict.isCorrect ? 'is-correct' : 'is-incorrect'}">${verdict.isCorrect ? 'توقّعك صحيح' : `توقّعتَ «${pickedLabel}» — لنحسبها معاً`}</p>
        ${probeExplanation(probe.id, result)}
        <p class="u2l1a-note-inline">الحالة المستخدمة في هذا التحقّق هي حالتك الحالية في المختبر، لذلك تتغيّر الأرقام كلما غيّرت المنزلق.</p>`;
      if (verdict.isCorrect) solvedProbes.add(probe.id);
      probeStatus.textContent = `تحقّقتَ من ${solvedProbes.size} من ${COULOMB_PROBE_QUESTIONS.length} تحدّيات بنجاح. أعد أي تحدٍّ بعد تغيير القيم لترى أرقاماً جديدة.`;
    });

    panel.querySelector(`[data-probe-apply="${probe.id}"]`).addEventListener('click', () => {
      const scaled = scaleCoulombInputs(state.current, findCoulombProbe(probe.id).change);
      if (scaled.outsideGrid) {
        probeStatus.textContent = 'هذا التغيير يخرج عن مدى المنزلقات في حالتك الحالية؛ صغّر القيمة أولاً ثم طبّق التغيير لتراه في المختبر.';
        return;
      }
      applyState(scaled, 'طبّقتَ التغيير على المنزلقات: قارن شدة القوة الآن بما كانت عليه قبل التغيير.');
    });
  });

  paint();
}

/* ============================================== station 6 · detective quiz */

function detectiveMarkup() {
  const cards = DETECTIVE_QUESTIONS.map((question, index) => {
    const station = findStation(question.stationRef);
    return `
    <article class="u2l1a-question" data-question-card="${question.id}">
      <header>
        <span class="u2l1a-question-index" dir="ltr">${String(index + 1).padStart(2, '0')}</span>
        <div>
          <p class="u2l1a-question-context">${question.context}</p>
          <h4 class="u2l1a-question-prompt">${question.prompt}</h4>
        </div>
      </header>
      <div class="u2l1a-choice-list" role="group" aria-label="خيارات السؤال ${index + 1}">
        ${question.choices.map((choice) => `
          <label class="u2l1a-choice" data-question-choice="${choice.id}">
            <input type="radio" name="question-${question.id}" value="${choice.id}" data-question-input="${question.id}" />
            <span>${choice.label}</span>
          </label>`).join('')}
      </div>
      <div class="u2l1a-button-row">
        <button class="u2l1a-action u2l1a-action-primary" type="button" data-question-submit="${question.id}">تحقّق من جوابي</button>
        <button class="u2l1a-action u2l1a-action-ghost" type="button" data-question-retry="${question.id}" hidden>${DETECTIVE_RETRY_LABEL}</button>
        <button class="u2l1a-action u2l1a-action-link" type="button" data-question-review="${question.id}">راجع المحطة ${station.index}: ${station.title}</button>
      </div>
      <div class="u2l1a-feedback" data-question-feedback="${question.id}" hidden></div>
    </article>`;
  }).join('');
  return `
  <div class="u2l1a-station-intro">${DETECTIVE_INTRO_HTML}</div>
  <div class="u2l1a-lab">
    <div class="u2l1a-quiz-progress">
      <div class="u2l1a-progress-track u2l1a-progress-track-small" role="progressbar" aria-label="التقدّم في تحدّي المحقّق" aria-valuemin="0" aria-valuemax="7" aria-valuenow="0" data-quiz-track>
        <span data-quiz-fill></span>
      </div>
      <p class="u2l1a-progress-readout"><span data-quiz-label>لم تجب عن أي سؤال بعد</span><bdi dir="ltr" data-quiz-value>0%</bdi></p>
    </div>
    <div class="u2l1a-question-list">${cards}</div>
    ${platformCard(PLATFORM_LABEL, DETECTIVE_ENCOURAGEMENT_HTML)}
  </div>`;
}

function mountDetective(panel, context) {
  const states = Object.fromEntries(DETECTIVE_QUESTIONS.map((question) => [question.id, createQuizState(question.id)]));

  const paintProgress = () => {
    const progress = quizProgress(states);
    panel.querySelector('[data-quiz-track]').setAttribute('aria-valuenow', String(progress.solved));
    panel.querySelector('[data-quiz-fill]').style.width = `${progress.percent}%`;
    panel.querySelector('[data-quiz-label]').textContent = progress.solved === 0
      ? 'لم تُجب إجابة صحيحة بعد — ابدأ بأي سؤال'
      : `أجبت إجابة صحيحة عن ${progress.solved} من ${progress.total} مواقف${progress.remaining > 0 ? `، وبقي ${progress.remaining}` : ' — اكتمل التحدي'}`;
    panel.querySelector('[data-quiz-value]').textContent = `${progress.percent}%`;
  };

  DETECTIVE_QUESTIONS.forEach((question) => {
    const feedback = panel.querySelector(`[data-question-feedback="${question.id}"]`);
    const retryButton = panel.querySelector(`[data-question-retry="${question.id}"]`);
    const card = panel.querySelector(`[data-question-card="${question.id}"]`);

    panel.querySelectorAll(`input[data-question-input="${question.id}"]`).forEach((input) => {
      input.addEventListener('change', () => {
        states[question.id] = selectQuizChoice(states[question.id], input.value);
        feedback.hidden = true;
        feedback.innerHTML = '';
        card.dataset.state = 'answered';
      });
    });

    panel.querySelector(`[data-question-submit="${question.id}"]`).addEventListener('click', () => {
      const result = submitQuizAnswer(states[question.id]);
      states[question.id] = result;
      if (result.needsSelection) {
        feedback.hidden = false;
        feedback.dataset.verdict = 'pending';
        feedback.innerHTML = '<p>اختر جواباً من القائمة أولاً؛ لن يظهر أي تصحيح قبل محاولتك.</p>';
        return;
      }
      feedback.hidden = false;
      feedback.dataset.verdict = result.isCorrect ? 'correct' : 'incorrect';
      feedback.innerHTML = `
        <p class="u2l1a-verdict ${result.isCorrect ? 'is-correct' : 'is-incorrect'}">${result.isCorrect ? DETECTIVE_FEEDBACK_CORRECT_HEADLINE : DETECTIVE_FEEDBACK_INCORRECT_HEADLINE}</p>
        ${result.feedbackHtml}
        <p class="u2l1a-note-inline">عدد محاولاتك في هذا السؤال: ${result.attempts} — معلومة لك فقط، لا تؤثر في شيء.</p>`;
      retryButton.hidden = false;
      card.dataset.state = result.isCorrect ? 'solved' : 'attempted';
      paintProgress();
    });

    retryButton.addEventListener('click', () => {
      states[question.id] = retryQuizQuestion(states[question.id]);
      panel.querySelectorAll(`input[data-question-input="${question.id}"]`).forEach((input) => { input.checked = false; });
      feedback.hidden = true;
      feedback.innerHTML = '';
      retryButton.hidden = true;
      card.dataset.state = 'open';
    });

    panel.querySelector(`[data-question-review="${question.id}"]`).addEventListener('click', () => {
      context.openStation(question.stationRef);
    });
  });

  paintProgress();
}

/* ================================================= station 7 · concept map */

function summaryMarkup() {
  const nodes = CONCEPT_NODES.map((node, index) => `
    <li class="u2l1a-concept-item">
      <button class="u2l1a-concept-node" type="button" data-concept-node="${node.id}" aria-expanded="false" aria-controls="concept-panel">
        <span class="u2l1a-concept-index" dir="ltr">${index + 1}</span>
        <span>${node.title}</span>
      </button>
      ${index < CONCEPT_NODES.length - 1 ? '<span class="u2l1a-concept-link" aria-hidden="true">←</span>' : ''}
    </li>`).join('');
  const jumpButtons = APPENDIX_STATIONS.map((station) => `
    <li><button class="u2l1a-action u2l1a-action-ghost" type="button" data-summary-jump="${station.id}">المحطة ${station.index}: ${station.title}</button></li>`).join('');
  return `
  <div class="u2l1a-station-intro">${CONCEPT_MAP_INTRO_HTML}</div>
  <div class="u2l1a-lab">
    <ol class="u2l1a-concept-map" aria-label="خريطة مفاهيم الكهرباء الساكنة">${nodes}</ol>
    <section class="u2l1a-concept-panel" id="concept-panel" data-concept-panel hidden aria-live="polite"></section>
    <section class="u2l1a-card u2l1a-card-keyideas" aria-labelledby="key-ideas-heading">
      <p class="u2l1a-card-label"><span aria-hidden="true">✦</span> الأفكار الأساسية</p>
      <h3 id="key-ideas-heading">ثماني أفكار تكفي لتلخيص الدرس</h3>
      <ol class="u2l1a-key-ideas">${KEY_IDEAS.map((idea) => `<li>${idea}</li>`).join('')}</ol>
    </section>
    <section class="u2l1a-card u2l1a-card-objectives" aria-labelledby="appendix-objectives-heading">
      <p class="u2l1a-card-label"><span aria-hidden="true">◆</span> أهداف الدرس التي عملت عليها</p>
      <h3 id="appendix-objectives-heading">الأهداف الستة</h3>
      <ol class="u2l1a-key-ideas">${APPENDIX_OBJECTIVES.map((objective) => `<li>${objective}</li>`).join('')}</ol>
    </section>
    <section class="u2l1a-card" aria-labelledby="summary-jump-heading">
      <p class="u2l1a-card-label"><span aria-hidden="true">↺</span> مراجعة وإعادة</p>
      <h3 id="summary-jump-heading">عد إلى أي محطة، أو أعد الملحق من أوله</h3>
      <ul class="u2l1a-jump-list">${jumpButtons}</ul>
      <div class="u2l1a-button-row">
        <button class="u2l1a-action u2l1a-action-primary" type="button" data-summary-restart>أعد الملحق من المحطة الأولى</button>
      </div>
    </section>
    <p class="u2l1a-closing">${SUMMARY_CLOSING_HTML}</p>
    <p class="u2l1a-note-inline">${EXTENSION_LABEL} · هذا الملحق إثراء مستقل، ولا يُعد جزءاً من اختبار الدرس أو من منطقة المعلم.</p>
  </div>`;
}

function mountSummary(panel, context) {
  const conceptPanel = panel.querySelector('[data-concept-panel]');
  panel.querySelectorAll('[data-concept-node]').forEach((button) => {
    button.addEventListener('click', () => {
      const node = CONCEPT_NODES.find((candidate) => candidate.id === button.dataset.conceptNode);
      const station = findStation(node.stationRef);
      const wasOpen = button.getAttribute('aria-expanded') === 'true';
      panel.querySelectorAll('[data-concept-node]').forEach((other) => other.setAttribute('aria-expanded', 'false'));
      if (wasOpen) {
        conceptPanel.hidden = true;
        conceptPanel.innerHTML = '';
        return;
      }
      button.setAttribute('aria-expanded', 'true');
      conceptPanel.hidden = false;
      conceptPanel.innerHTML = `
        <h4>${node.title}</h4>
        <p class="u2l1a-card-label"><span aria-hidden="true">◆</span> ${node.sourceLabel}</p>
        ${node.summaryHtml}
        ${node.relationHtml}
        <div class="u2l1a-button-row">
          <button class="u2l1a-action u2l1a-action-primary" type="button" data-concept-goto="${node.stationRef}">عد إلى المحطة ${station.index}: ${station.title}</button>
        </div>`;
      conceptPanel.querySelector('[data-concept-goto]').addEventListener('click', () => context.openStation(node.stationRef));
    });
  });

  panel.querySelectorAll('[data-summary-jump]').forEach((button) => {
    button.addEventListener('click', () => context.openStation(button.dataset.summaryJump));
  });

  panel.querySelector('[data-summary-restart]').addEventListener('click', () => {
    context.openStation(APPENDIX_STATIONS[0].id);
  });
}

/* ================================================================== mount */

export function mountChargesAppendix(root) {
  const motionQuery = typeof root.ownerDocument.defaultView?.matchMedia === 'function'
    ? root.ownerDocument.defaultView.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let reducedMotion = motionQuery?.matches ?? false;
  motionQuery?.addEventListener?.('change', (event) => { reducedMotion = event.matches; });

  const nav = root.querySelector('#station-nav');
  const panelsHost = root.querySelector('#station-panels');
  const progressTrack = root.querySelector('#station-progress-track');
  const progressFill = root.querySelector('#station-progress-fill');
  const progressLabel = root.querySelector('#station-progress-label');
  const progressValue = root.querySelector('#station-progress-value');
  const previousButton = root.querySelector('#previous-station');
  const nextButton = root.querySelector('#next-station');
  const previousLabel = root.querySelector('#previous-station-label');
  const nextLabel = root.querySelector('#next-station-label');
  const controlCenter = root.querySelector('#control-center');

  /* hero + how-to are rendered from the same content module as the stations */
  root.querySelector('#hero-description').innerHTML = HERO_DESCRIPTION_HTML;
  root.querySelector('#keyword-row').innerHTML = APPENDIX_KEYWORDS.map((word) => `<li><span>${word}</span></li>`).join('');
  root.querySelector('#howto-steps').innerHTML = HOW_TO_USE_STEPS.map((step, index) => `
    <li><span dir="ltr">${String(index + 1).padStart(2, '0')}</span><strong>${step.title}</strong><small>${step.body}</small></li>`).join('');

  /* the station rail */
  nav.innerHTML = APPENDIX_STATIONS.map((station) => `
    <button class="u2l1a-station-chip" type="button" data-station-link="${station.id}" aria-label="المحطة ${station.index}: ${station.title}">
      <span class="u2l1a-chip-index" dir="ltr">${station.index}</span>
      <span class="u2l1a-chip-copy"><strong>${station.title}</strong><small>${station.navLabel}</small></span>
    </button>`).join('');

  /* every station is built once and kept, so returning to it keeps the
   * student's own state instead of resetting the scene */
  const bodies = {
    puzzle: puzzleMarkup,
    charge: ledgerMarkup,
    methods: methodsMarkup,
    forces: arenaMarkup,
    coulomb: coulombMarkup,
    detective: detectiveMarkup,
    summary: summaryMarkup,
  };
  panelsHost.innerHTML = APPENDIX_STATIONS.map((station) => stationPanelMarkup(station, bodies[station.id]())).join('');

  const context = {
    get reducedMotion() { return reducedMotion; },
    openStation: (stationId) => goTo(stationId, true),
  };

  let flow = createStationFlow(stationIdFromHash(root.ownerDocument.defaultView?.location?.hash) ?? DEFAULT_STATION_ID);

  const panels = Object.fromEntries(APPENDIX_STATIONS.map((station) => [station.id, panelsHost.querySelector(`[data-station="${station.id}"]`)]));

  mountPuzzle(panels.puzzle, context);
  mountLedger(panels.charge);
  mountMethods(panels.methods, context);
  mountArena(panels.forces, context);
  mountCoulomb(panels.coulomb);
  mountDetective(panels.detective, context);
  mountSummary(panels.summary, context);

  function applyFlow(moveFocus) {
    APPENDIX_STATIONS.forEach((station) => {
      panels[station.id].hidden = station.id !== flow.activeId;
      panels[station.id].dataset.visited = flow.visitedIds.includes(station.id) ? 'true' : 'false';
    });
    nav.querySelectorAll('[data-station-link]').forEach((chip) => {
      const isActive = chip.dataset.stationLink === flow.activeId;
      const isVisited = flow.visitedIds.includes(chip.dataset.stationLink);
      if (isActive) chip.setAttribute('aria-current', 'step');
      else chip.removeAttribute('aria-current');
      chip.dataset.visited = isVisited ? 'true' : 'false';
    });
    progressTrack.setAttribute('aria-valuenow', String(flow.activeIndex + 1));
    progressTrack.setAttribute('aria-valuetext', `المحطة ${flow.activeIndex + 1} من ${flow.total}: ${flow.station.title}`);
    progressFill.style.width = `${flow.progressPercent}%`;
    progressLabel.textContent = `المحطة ${flow.activeIndex + 1} من ${flow.total} · ${flow.station.title}`;
    progressValue.textContent = `${flow.discoveryPercent}%`;
    controlCenter.textContent = `المحطة ${flow.activeIndex + 1} من ${flow.total}`;
    const previous = flow.activeIndex > 0 ? APPENDIX_STATIONS[flow.activeIndex - 1] : null;
    const next = flow.activeIndex < flow.total - 1 ? APPENDIX_STATIONS[flow.activeIndex + 1] : null;
    previousButton.disabled = !previous;
    nextButton.disabled = !next;
    previousLabel.textContent = previous ? `${previous.index}. ${previous.navLabel}` : 'بداية الملحق';
    nextLabel.textContent = next ? `${next.index}. ${next.navLabel}` : 'نهاية الملحق';
    if (moveFocus) {
      const heading = panels[flow.activeId].querySelector('h2');
      heading?.focus?.({ preventScroll: true });
      heading?.scrollIntoView?.({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }

  function goTo(stationId, moveFocus = false) {
    flow = goToStation(flow, stationId);
    const view = root.ownerDocument.defaultView;
    if (view?.history?.replaceState && view.location) {
      view.history.replaceState(null, '', stationHash(stationId));
    }
    applyFlow(moveFocus);
  }

  nav.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-station-link]');
    if (chip) goTo(chip.dataset.stationLink, true);
  });
  previousButton.addEventListener('click', () => {
    flow = stepStation(flow, -1);
    applyFlow(true);
  });
  nextButton.addEventListener('click', () => {
    flow = stepStation(flow, 1);
    applyFlow(true);
  });
  root.querySelector('#start-first-station').addEventListener('click', () => goTo(APPENDIX_STATIONS[0].id, true));

  const view = root.ownerDocument.defaultView;
  view?.addEventListener?.('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target?.closest?.('input, select, textarea, [contenteditable="true"]')) return;
    if (event.key === 'PageDown') { event.preventDefault(); flow = stepStation(flow, 1); applyFlow(true); }
    if (event.key === 'PageUp') { event.preventDefault(); flow = stepStation(flow, -1); applyFlow(true); }
    if (event.key === 'Home') { event.preventDefault(); goTo(APPENDIX_STATIONS[0].id, true); }
    if (event.key === 'End') { event.preventDefault(); goTo(APPENDIX_STATIONS[APPENDIX_STATIONS.length - 1].id, true); }
  });
  view?.addEventListener?.('hashchange', () => {
    const id = stationIdFromHash(view.location.hash);
    if (id && id !== flow.activeId) goTo(id, false);
  });

  applyFlow(false);
  return Object.freeze({ goToStation: goTo, get flow() { return flow; }, panels });
}

const appendixRoot = typeof document !== 'undefined' ? document.querySelector('[data-unit2-lesson1-appendix]') : null;
if (appendixRoot) mountChargesAppendix(appendixRoot);
