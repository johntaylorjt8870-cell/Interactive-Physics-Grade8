/*
 * «رحلة الشحنات — من المولّد إلى المصباح»
 * Standalone enrichment appendix for Unit 2, Lesson 2 (textbook pages 87–96).
 *
 * Seven short stations, one on screen at a time, with a station rail and a
 * progress readout. Every station is an interaction first and a text second:
 *
 *   1 origin    — the p87 circuit: switch it on, click any part to read its
 *                 role, and answer the three printed «ألاحظ وأستنتج» questions;
 *   2 electrons — a seeded model of free electrons in a conductor: random walk
 *                 when the circuit is open, ordered drift when it is closed;
 *   3 direction — conventional current versus electron drift versus energy
 *                 transfer: three reveal switches, two questions, one warning;
 *   4 ammeter   — q and t sliders, a live I = q/t readout and a real dial;
 *   5 relation  — the three equivalent forms of the relation plus a calculator
 *                 that shows every substitution step, and four challenges;
 *   6 detective — seven graded-in-difficulty tasks in one workshop scenario;
 *   7 map       — a concept map whose nodes reopen the station that taught
 *                 them, plus a self-check list tied to the lesson objectives.
 *
 * All physics comes from `unit2-lesson2-appendix-physics.js`, all authored copy
 * from `unit2-lesson2-appendix-content.js`, all state from
 * `unit2-lesson2-appendix-flow.js`, and every piece of mathematics is rendered
 * through the shared KaTeX layer in `math.js`.
 *
 * Nothing here is graded, stored, or sent anywhere: the appendix is local,
 * exploratory practice, separate from the lesson test and the teacher area.
 */

import { formula, tex } from './math.js';
import {
  AMPERE_DEFINITION_HTML,
  APPENDIX_KEYWORDS,
  APPENDIX_LESSON_LABEL,
  APPENDIX_OBJECTIVES,
  APPENDIX_STATIONS,
  AMMETER_BOOK_VALUE,
  AMMETER_INTRO_HTML,
  AMMETER_MODEL_LIMITS,
  AMMETER_QUESTIONS,
  ARROW_CAPTION_COPY,
  CALCULATOR_COPY,
  CHECKLIST_DONE_HTML,
  CHECKLIST_HEADING,
  CHECKLIST_INTRO,
  CHECKLIST_ITEMS,
  CHECKLIST_PARTIAL_HTML,
  CONCEPT_INTRO_HTML,
  CONCEPT_LINKS,
  CONCEPT_MAP_LEGEND,
  CONCEPT_NODE_ACTION,
  CONCEPT_NODES,
  DETECTIVE_ENCOURAGEMENT_HTML,
  DETECTIVE_INTRO_HTML,
  DETECTIVE_ORDER_HINT,
  DETECTIVE_NUMBER_HINT,
  DETECTIVE_RETRY_LABEL,
  DETECTIVE_SCENARIO_HTML,
  DIRECTION_INSIDE_NOTE,
  DIRECTION_INTRO_HTML,
  DIRECTION_LEGEND,
  DIRECTION_LEGEND_NOTE,
  DIRECTION_MIX_CARD,
  DIRECTION_QUESTIONS,
  DIRECTION_TOGGLES,
  ELECTRONS_COMPARE,
  ELECTRONS_CONSERVATION_NOTE,
  ELECTRONS_DRIFT_NOTE,
  ELECTRONS_GENERATOR_NOTE,
  ELECTRONS_INTRO_HTML,
  ELECTRONS_MODEL_LIMITS,
  ELECTRONS_READOUT_COPY,
  ELECTRON_QUESTIONS,
  ENRICHMENT_LABEL,
  EXTENSION_LABEL,
  HERO_DESCRIPTION_HTML,
  HERO_NOTE,
  HOW_TO_USE_STEPS,
  KEY_IDEAS,
  LESSON_PAGES,
  MODEL_LABEL,
  NOTES_LABEL,
  NOT_BOOK_LABEL,
  ORIGIN_BOOK_QUESTIONS_HTML,
  ORIGIN_INTRO_HTML,
  ORIGIN_MODEL_LIMITS,
  ORIGIN_QUESTIONS,
  ORIGIN_SCENE_NOTE,
  ORIGIN_SCENE_STATES,
  PART_CARDS,
  PLATFORM_LABEL,
  RELATION_CHALLENGES,
  RELATION_FORMS,
  RELATION_INTRO_HTML,
  RELATION_MODEL_LIMITS,
  SCENE_COPY,
  SCENE_LABEL,
  SCOPE_NOTES,
  SOURCE_LABEL,
  SUMMARY_CLOSING_HTML,
  SYMBOL_LEGEND,
  findQuestion,
  findStation,
  objectivesOfStation,
  questionsOfStation,
} from './unit2-lesson2-appendix-content.js';
import {
  AMMETER,
  ARROW_CAPTIONS,
  ARROW_SPOTS,
  CALCULATOR_TARGETS,
  CIRCUIT,
  DIRECTION_ANGLE,
  FIELD_META,
  GENERATOR_INTERIOR,
  LAB_RANGE,
  SCENE_LABEL_ANCHORS,
  SCENE_LABEL_SETS,
  SEGMENT_DIRECTIONS,
  advanceDrift,
  ammeterReading,
  calculatorReport,
  createCalculatorState,
  createDriftState,
  driftSummary,
  electronPoint,
  formatNumber,
  insideGenerator,
  needleAngle,
  quantityTeX,
  resetCalculatorState,
  scaleLabInput,
  setCalculatorInput,
  setCalculatorTarget,
  setCalculatorUnit,
  setDriftClosed,
} from './unit2-lesson2-appendix-physics.js';
import {
  answerProgress,
  checklistProgress,
  createAnswerState,
  createChecklistState,
  createStationFlow,
  goToStation,
  moveOrderItem,
  retryAnswer,
  selectAnswer,
  setNumberAnswer,
  stationAnswerProgress,
  stationHash,
  stationIdFromHash,
  stationNeighbours,
  stepStation,
  submitAnswer,
  toggleChecklistItem,
} from './unit2-lesson2-appendix-flow.js';

/* ------------------------------------------------------------ small helpers */

const modelBadge = () => `<p class="u2l2a-model-badge">${MODEL_LABEL}</p>`;

const sourceCard = (label, bodyHtml) => `
  <aside class="u2l2a-card u2l2a-card-source">
    <p class="u2l2a-card-label"><span aria-hidden="true">◆</span> ${label}</p>
    <div class="u2l2a-card-body">${bodyHtml}</div>
  </aside>`;

const platformCard = (label, bodyHtml) => `
  <aside class="u2l2a-card u2l2a-card-platform">
    <p class="u2l2a-card-label"><span aria-hidden="true">✦</span> ${label}</p>
    <div class="u2l2a-card-body">${bodyHtml}</div>
  </aside>`;

const limitsCard = (title, items) => `
  <aside class="u2l2a-card u2l2a-card-limits">
    <p class="u2l2a-card-label"><span aria-hidden="true">⚠</span> ${title}</p>
    <ul class="u2l2a-limits">${items.map((item) => `<li>${item}</li>`).join('')}</ul>
  </aside>`;

const readout = (label, valueHtml, dataAttribute = '') => `
  <div class="u2l2a-readout">
    <span class="u2l2a-readout-label">${label}</span>
    <output class="u2l2a-readout-value" ${dataAttribute}>${valueHtml}</output>
  </div>`;

const ltr = (text) => `<bdi dir="ltr">${text}</bdi>`;

/*
 * The long name of every drawn arrow. It stays in the SVG <title> (the text a
 * mouse or a screen reader surfaces), while the short word from
 * `ARROW_CAPTION_COPY` is painted next to the arrow itself, so the two layers
 * can be told apart without relying on colour.
 */
const ARROW_TITLES = Object.freeze({
  current: 'جهة التيّار الاصطلاحية',
  electron: 'جهة انجراف الإلكترونات',
});

/** One block arrow, tagged with the physics it draws so tests can inspect it. */
function blockArrow(cx, cy, dir, flow, segment, extraClass = '', title = '') {
  const half = 20;
  const shaft = 6;
  const head = 13;
  const headLength = 16;
  const outline = [
    [-half, -shaft], [half - headLength, -shaft], [half - headLength, -head],
    [half, 0], [half - headLength, head], [half - headLength, shaft], [-half, shaft],
  ];
  const radians = (DIRECTION_ANGLE[dir] * Math.PI) / 180;
  const cos = Math.round(Math.cos(radians));
  const sin = Math.round(Math.sin(radians));
  const points = outline.map(([x, y]) => `${cx + x * cos - y * sin},${cy + x * sin + y * cos}`).join(' ');
  const label = title || `${ARROW_TITLES[flow]} — ${segmentLabel(segment)}`;
  return `<polygon class="u2l2a-arrow u2l2a-arrow-${flow}${extraClass ? ` ${extraClass}` : ''}" data-flow="${flow}" data-segment="${segment}" data-dir="${dir}" points="${points}"><title>${label}</title></polygon>`;
}

/* The readable name of every wire segment, used inside the arrow tooltips. */
const segmentLabel = (segment) => SCENE_COPY.segments[segment] || segment;

const arabicText = (x, y, value, className = 'u2l2a-part-label') => `<text class="${className}" x="${x}" y="${y}" text-anchor="middle" direction="rtl">${value}</text>`;

/**
 * The one-word label painted beside an arrow. Every arrow set therefore has a
 * visible name of its own («التيّار» for the copper arrows, «الإلكترونات» for
 * the teal ones), and the same word appears in the legend below the figure.
 */
const arrowCaption = (segment, kind) => {
  const spot = ARROW_CAPTIONS[segment][kind];
  const word = ARROW_CAPTION_COPY[kind];
  return `<text class="u2l2a-arrow-caption" data-caption data-flow="${kind}" data-segment="${segment}" x="${spot.x}" y="${spot.y}" text-anchor="middle" direction="rtl"><title>${word} — ${segmentLabel(segment)}</title>${word}</text>`;
};

/** One plain label of the shared circuit scene, placed from the model's anchors. */
const sceneLabel = (id) => {
  const anchor = SCENE_LABEL_ANCHORS[id];
  return arabicText(anchor.x, anchor.y, SCENE_COPY[id], anchor.className);
};
const latinText = (x, y, value, className = 'u2l2a-tick') => `<text class="${className}" x="${x}" y="${y}" text-anchor="middle" direction="ltr">${value}</text>`;

/* ==================================================== the shared circuit SVG */

const GENERATOR = Object.freeze({
  left: CIRCUIT.generator.from,
  right: CIRCUIT.generator.to,
  mid: (CIRCUIT.generator.from + CIRCUIT.generator.to) / 2,
});

/** The wires of the appendix loop, with the switch gap left open on purpose. */
function wireMarkup() {
  return `
    <path class="u2l2a-wire" d="M${GENERATOR.left} ${CIRCUIT.top} H${CIRCUIT.left}" />
    <path class="u2l2a-wire" d="M${CIRCUIT.left} ${CIRCUIT.top} V${CIRCUIT.bottom}" />
    <path class="u2l2a-wire" d="M${CIRCUIT.left} ${CIRCUIT.bottom} H${CIRCUIT.right}" />
    <path class="u2l2a-wire" d="M${CIRCUIT.right} ${CIRCUIT.bottom} V${CIRCUIT.switch.y + CIRCUIT.switch.r}" />
    <path class="u2l2a-wire" d="M${CIRCUIT.right} ${CIRCUIT.switch.y - CIRCUIT.switch.r} V${CIRCUIT.top}" />
    <path class="u2l2a-wire" d="M${CIRCUIT.right} ${CIRCUIT.top} H${GENERATOR.right}" />`;
}

/** The generator: two cells with + on the left and − on the right, as in p89. */
function generatorMarkup(ids) {
  const terminals = ids.includes('terminalPositive') ? `
    ${sceneLabel('terminalPositive')}
    ${sceneLabel('terminalNegative')}` : '';
  return `
    <g data-part="generator">
      <rect class="u2l2a-cell" x="${GENERATOR.left}" y="82" width="60" height="44" rx="6" />
      <rect class="u2l2a-cell" x="${GENERATOR.left + 60}" y="82" width="60" height="44" rx="6" />
      <rect class="u2l2a-terminal" x="${GENERATOR.left + 48}" y="78" width="6" height="52" rx="3" />
      <text class="u2l2a-sign" data-terminal="positive" x="${GENERATOR.left + 26}" y="112" text-anchor="middle" direction="ltr">+</text>
      <text class="u2l2a-sign" data-terminal="negative" x="${GENERATOR.right - 26}" y="112" text-anchor="middle" direction="ltr">−</text>
    </g>
    ${ids.includes('generatorTitle') ? sceneLabel('generatorTitle') : ''}${terminals}`;
}

/** A lamp: the glass bulb plus the glow that only exists while the current flows. */
const lampMarkup = (id, cx, cy, r) => `
  <g class="u2l2a-lamp" data-part="lamp" data-lamp="${id}" data-x="${cx}" data-y="${cy}">
    <circle class="u2l2a-lamp-halo" cx="${cx}" cy="${cy}" r="${r * 1.75}" />
    <circle class="u2l2a-lamp-body" cx="${cx}" cy="${cy}" r="${r}" />
    <path class="u2l2a-lamp-filament" d="M${cx - r * 0.5} ${cy + r * 0.45} L${cx - r * 0.2} ${cy - r * 0.4} L${cx + r * 0.2} ${cy + r * 0.4} L${cx + r * 0.5} ${cy - r * 0.45}" />
  </g>`;

/** The switch on the right branch: its lever is rotated when the circuit is open. */
const switchMarkup = (ids) => `
  <g class="u2l2a-switch" data-part="switch" data-switch>
    <line class="u2l2a-switch-lever" data-switch-lever x1="${CIRCUIT.right}" y1="${CIRCUIT.switch.y + CIRCUIT.switch.r}" x2="${CIRCUIT.right}" y2="${CIRCUIT.switch.y - CIRCUIT.switch.r}" />
    <circle class="u2l2a-switch-contact" cx="${CIRCUIT.right}" cy="${CIRCUIT.switch.y - CIRCUIT.switch.r}" r="6" />
    <circle class="u2l2a-switch-contact" cx="${CIRCUIT.right}" cy="${CIRCUIT.switch.y + CIRCUIT.switch.r}" r="6" />
  </g>
  ${ids.includes('switchTitle') ? sceneLabel('switchTitle') : ''}
  ${ids.includes('switchSubtitle') ? sceneLabel('switchSubtitle') : ''}`;

/** The lamp of the p89 loop sits on the left branch, on top of the wire. */
const lampOnLeftMarkup = (ids) => `
  ${lampMarkup('l1', CIRCUIT.lamp.x, CIRCUIT.lamp.y, CIRCUIT.lamp.r)}
  ${ids.includes('lampTitle') ? sceneLabel('lampTitle') : ''}
  ${ids.includes('lampSubtitle') ? sceneLabel('lampSubtitle') : ''}`;

const electronsLayerMarkup = (count) => Array.from({ length: count }, (_, index) => `
  <circle class="u2l2a-electron" data-electron="${index}" cx="0" cy="0" r="8" />`).join('');

const circuitScene = (options) => {
  const { id, title, description, extraLayers = '', height = 420, electrons = 0 } = options;
  /* every scene draws the same circuit but only the labels it needs */
  const ids = SCENE_LABEL_SETS[id] ?? [];
  return `
  <div class="u2l2a-scene-canvas">
    <svg class="u2l2a-scene-svg" viewBox="0 0 720 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" data-scene="${id}">
      <title id="${id}-title">${title}</title>
      <desc id="${id}-desc" data-scene-desc>${description}</desc>
      <defs>
        <marker id="${id}-energy-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" />
        </marker>
      </defs>
      ${wireMarkup()}
      ${generatorMarkup(ids)}
      ${switchMarkup(ids)}
      ${lampOnLeftMarkup(ids)}
      ${electronsLayerMarkup(electrons)}
      ${extraLayers}
      ${ids.includes('wireLabel') ? sceneLabel('wireLabel') : ''}
    </svg>
  </div>`;
};

/* ================================================= shading the two directions */

const directionArrowsMarkup = (kind) => Object.entries(ARROW_SPOTS).map(([segment, spots]) => {
  const entry = SEGMENT_DIRECTIONS[segment];
  const spot = spots[kind];
  return `<g class="u2l2a-arrow-group" data-arrow-segment="${segment}">${
    blockArrow(spot.x, spot.y, entry[kind], kind, segment, 'u2l2a-arrow-outside')
  }${arrowCaption(segment, kind)}</g>`;
}).join('');

/*
 * Inside the generator the appendix draws exactly one arrow — the conventional
 * current returning from − to + — and no electron arrow at all: charge
 * transport inside a source is not the drift of free electrons in a metal
 * wire, and the audited lesson never states a direction for it.
 */
const generatorInteriorMarkup = () => `${
  blockArrow(
    GENERATOR_INTERIOR.arrow.x,
    GENERATOR_INTERIOR.arrow.y,
    GENERATOR_INTERIOR.arrow.direction,
    'current',
    GENERATOR_INTERIOR.segment,
    'u2l2a-arrow-inside',
    SCENE_COPY.generatorInteriorTitle,
  )
}<text class="u2l2a-arrow-caption" data-caption data-flow="current" data-segment="${GENERATOR_INTERIOR.segment}" x="${GENERATOR_INTERIOR.caption.x}" y="${GENERATOR_INTERIOR.caption.y}" text-anchor="middle" direction="rtl"><title>${SCENE_COPY.generatorInteriorTitle}</title>${SCENE_COPY.generatorInteriorCaption}</text>`;

const energyArcMarkup = () => `
  <path class="u2l2a-energy-path" data-energy-path d="M${GENERATOR.left} ${CIRCUIT.top} H${CIRCUIT.left} V${CIRCUIT.lamp.y - 34}" marker-end="url(#direction-scene-energy-head)" />
  ${sceneLabel('energyLabel')}`;

/* ============================================================ station 1 · origin */

function originSceneMarkup() {
  return `
  <figure class="u2l2a-scene">
    ${circuitScene({
      id: 'origin-scene',
      title: 'دارة كهربائية بمولّد ومصباحين ومفتاح',
      description: `${ORIGIN_SCENE_STATES.open} الدارة مفتوحة الآن.`,
      extraLayers: `
        ${lampMarkup('l2', SCENE_LABEL_ANCHORS.lampTwoTitle.x, CIRCUIT.bottom, 26)}
        ${sceneLabel('lampTwoTitle')}
        <g class="u2l2a-energy-layer" data-origin-energy>
          <path class="u2l2a-energy-path" data-origin-energy-path d="M${GENERATOR.left} ${CIRCUIT.top} H${CIRCUIT.left} V${CIRCUIT.bottom} H360" marker-end="url(#origin-scene-energy-head)" />
        </g>`,
    })}
    <figcaption>
      <p><strong>المشهد:</strong> مولّد (بطاريتان) + أسلاك توصيل + مصباحان + مفتاح. اضغط زرّ «أغلق الدارة» في اللوح لترى ما يحدث.</p>
      <p class="u2l2a-scene-note">${ORIGIN_SCENE_NOTE}</p>
    </figcaption>
    ${modelBadge()}
  </figure>`;
}

function originMarkup() {
  const parts = PART_CARDS.map((card) => `
    <button class="u2l2a-part-button" type="button" data-part-button="${card.id}" aria-pressed="false">
      <span class="u2l2a-part-button-title">${card.title}</span>
      <small>${card.labelInScene}</small>
    </button>`).join('');
  const partPanels = PART_CARDS.map((card) => `
    <section class="u2l2a-part-card" data-part-card="${card.id}" hidden aria-labelledby="part-${card.id}-heading">
      <p class="u2l2a-card-label"><span aria-hidden="true">${card.source === 'book' ? '◆' : '✦'}</span> ${card.source === 'book' ? `${SOURCE_LABEL} · ص${card.pageRef}` : PLATFORM_LABEL}</p>
      <h3 id="part-${card.id}-heading">${card.title}</h3>
      <div class="u2l2a-card-body">${card.bodyHtml}</div>
    </section>`).join('');
  return `
  <div class="u2l2a-station-intro">${ORIGIN_INTRO_HTML}</div>
  <div class="u2l2a-lab">
    <section class="u2l2a-lab-controls" aria-label="ضوابط مشهد الدارة">
      <div class="u2l2a-button-row">
        <button class="u2l2a-action u2l2a-action-primary" type="button" data-origin-switch aria-pressed="false">أغلق الدارة (اضغط المفتاح)</button>
        <button class="u2l2a-action u2l2a-action-ghost" type="button" data-origin-reset>أعد المشهد كما كان</button>
      </div>
      <p class="u2l2a-status" role="status" aria-live="polite" data-origin-status>${ORIGIN_SCENE_STATES.open}</p>
      <div class="u2l2a-readout-grid">
        ${readout('حالة الدارة', 'مفتوحة — لا يمرّ تيّار', 'data-origin-state')}
        ${readout('مسار الطاقة', 'متوقّف', 'data-origin-energy')}
        ${readout('حالة المصباحين', 'منطفئان', 'data-origin-lamps')}
      </div>
      <fieldset class="u2l2a-part-picker">
        <legend>اضغط على أي جزء لتقرأ دوره في الدارة</legend>
        <div class="u2l2a-part-buttons">${parts}</div>
      </fieldset>
    </section>
    ${originSceneMarkup()}
    <div class="u2l2a-part-cards">${partPanels}</div>
    ${sourceCard(`${SOURCE_LABEL} · ص87`, ORIGIN_BOOK_QUESTIONS_HTML)}
    <section class="u2l2a-questions" aria-labelledby="origin-questions-heading" data-question-group="origin">
      <h3 id="origin-questions-heading">نشاط «ألاحظ وأستنتج» — الأسئلة الثلاثة</h3>
      <p class="u2l2a-questions-note">الأسئلة الثلاثة مطبوعة في الكتاب صفحة 87. أجب ثم اضغط «تحقّق» لتقرأ التفسير، ويمكنك إعادة المحاولة بلا حصر.</p>
      ${ORIGIN_QUESTIONS.map((question) => questionMarkup(question)).join('')}
    </section>
    ${limitsCard('حدود هذا المشهد', ORIGIN_MODEL_LIMITS)}
  </div>`;
}

function mountOrigin(panel) {
  const switchButton = panel.querySelector('[data-origin-switch]');
  const status = panel.querySelector('[data-origin-status]');
  const scene = panel.querySelector('[data-scene="origin-scene"]');
  const desc = panel.querySelector('[data-scene-desc]');
  const lever = panel.querySelector('[data-switch-lever]');
  const energyPath = panel.querySelector('[data-origin-energy-path]');
  const stateOut = panel.querySelector('[data-origin-state]');
  const energyOut = panel.querySelector('[data-origin-energy]');
  const lampsOut = panel.querySelector('[data-origin-lamps]');
  let closed = false;

  function paint() {
    scene.dataset.closed = closed ? 'true' : 'false';
    switchButton.setAttribute('aria-pressed', closed ? 'true' : 'false');
    switchButton.textContent = closed ? 'افتح الدارة (اضغط المفتاح)' : 'أغلق الدارة (اضغط المفتاح)';
    lever.setAttribute('transform', closed ? `rotate(0 ${CIRCUIT.right} ${CIRCUIT.switch.y + CIRCUIT.switch.r})` : `rotate(-38 ${CIRCUIT.right} ${CIRCUIT.switch.y + CIRCUIT.switch.r})`);
    energyPath.classList.toggle('is-flowing', closed);
    status.textContent = closed ? ORIGIN_SCENE_STATES.closed : ORIGIN_SCENE_STATES.open;
    stateOut.textContent = closed ? 'مغلقة — يمرّ التيّار' : 'مفتوحة — لا يمرّ تيّار';
    energyOut.textContent = closed ? 'يعمل: من المولّد عبر الموصل إلى المصباح' : 'متوقّف';
    lampsOut.textContent = closed ? 'مضيئان' : 'منطفئان';
    desc.textContent = closed
      ? 'دارة مغلقة: المفتاح مغلق، والمصباحان مضيئان، والطاقة تنتقل من المولّد عبر الموصل إلى المصباحين.'
      : 'دارة مفتوحة: المفتاح مرفوع، فلا يمرّ تيّار في الدارة والمصباحان منطفئان.';
  }

  switchButton.addEventListener('click', () => { closed = !closed; paint(); });
  panel.querySelector('[data-origin-reset]').addEventListener('click', () => {
    closed = false;
    panel.querySelectorAll('[data-part-button]').forEach((button) => {
      button.setAttribute('aria-pressed', 'false');
      panel.querySelector(`[data-part-card="${button.dataset.partButton}"]`).hidden = true;
    });
    paint();
    status.textContent = 'أُعيد المشهد إلى البداية: الدارة مفتوحة. جرّب الآن أن تُغلقها.';
  });

  const buttons = [...panel.querySelectorAll('[data-part-button]')];
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.partButton;
      const open = button.getAttribute('aria-pressed') !== 'true';
      panel.querySelectorAll('[data-part-button]').forEach((other) => {
        const same = other === button && open;
        other.setAttribute('aria-pressed', same ? 'true' : 'false');
        panel.querySelector(`[data-part-card="${other.dataset.partButton}"]`).hidden = !same;
      });
      if (open) {
        const card = panel.querySelector(`[data-part-card="${id}"]`);
        card.querySelector('h3')?.focus?.({ preventScroll: true });
      }
    });
  });

  paint();
}

/* ========================================================= station 2 · electrons */

function electronsMarkup() {
  const compare = ELECTRONS_COMPARE.map((card) => `
    <section class="u2l2a-info-card">
      <h3>${card.title}</h3>
      ${card.bodyHtml}
    </section>`).join('');
  return `
  <div class="u2l2a-station-intro">${ELECTRONS_INTRO_HTML}</div>
  <div class="u2l2a-lab">
    <section class="u2l2a-lab-controls" aria-label="ضوابط محاكاة الإلكترونات">
      <div class="u2l2a-button-row">
        <button class="u2l2a-action u2l2a-action-primary" type="button" data-drift-play aria-pressed="false">تشغيل المحاكاة</button>
        <button class="u2l2a-action" type="button" data-drift-step hidden>خطوة واحدة</button>
        <button class="u2l2a-action" type="button" data-drift-circuit aria-pressed="false">أغلق الدارة</button>
        <button class="u2l2a-action u2l2a-action-ghost" type="button" data-drift-reset>إعادة الضبط</button>
      </div>
      <p class="u2l2a-status" role="status" aria-live="polite" data-drift-status>المحاكاة متوقّفة والدارة مفتوحة: الإلكترونات تتحرّك عشوائياً بلا انتقال صافٍ. اضغط «تشغيل المحاكاة» ثم «أغلق الدارة» ولاحظ الفرق.</p>
      <div class="u2l2a-readout-grid">
        ${readout(ELECTRONS_READOUT_COPY.state, '<span data-drift-state>مفتوحة — لا تيّار</span>')}
        ${readout(ELECTRONS_READOUT_COPY.electrons, '<span data-drift-count>—</span>')}
        ${readout(ELECTRONS_READOUT_COPY.net, '<span data-drift-net>0</span>')}
        ${readout(ELECTRONS_READOUT_COPY.distance, '<span data-drift-distance>0</span>')}
      </div>
      <p class="u2l2a-inline-note">${ELECTRONS_CONSERVATION_NOTE}</p>
    </section>
    <figure class="u2l2a-scene">
      ${circuitScene({
        id: 'electrons-scene',
        title: 'إلكترونات حرّة داخل موصل في دارة مغلقة',
        description: 'دارة مغلقة وفيها مصباح على الفرع الأيسر ومفتاح على الفرع الأيمن، ونقاط متحرّكة تمثّل الإلكترونات الحرّة داخل الموصل.',
        electrons: 16,
      })}
      <figcaption>
        <p><strong>ما نراه:</strong> نقاط تمثّل الإلكترونات الحرّة داخل الموصل. المفتاح يفتح المسار ويغلقه، والمصباح يضيء في الدارة المغلقة.</p>
        <p class="u2l2a-scene-note">${SCENE_LABEL}. مواضع الأجهزة في هذا الرسم من إعداد المنصة ولا تنقل شكلاً مطبوعاً حرفيّاً.</p>
        <p class="u2l2a-inline-note">${ELECTRONS_GENERATOR_NOTE}</p>
      </figcaption>
      ${modelBadge()}
    </figure>
    <div class="u2l2a-result-pair">${compare}</div>
    <section class="u2l2a-questions" aria-labelledby="electron-questions-heading" data-question-group="electrons">
      <h3 id="electron-questions-heading">أسئلة قصيرة على ما شاهدتَه</h3>
      ${ELECTRON_QUESTIONS.map((question) => questionMarkup(question)).join('')}
    </section>
    ${platformCard(ENRICHMENT_LABEL, ELECTRONS_DRIFT_NOTE)}
    ${limitsCard('حدود هذا النموذج', ELECTRONS_MODEL_LIMITS)}
  </div>`;
}

function mountElectrons(panel, context) {
  const scene = panel.querySelector('[data-scene="electrons-scene"]');
  const desc = panel.querySelector('[data-scene-desc]');
  const lever = panel.querySelector('[data-switch-lever]');
  const nodes = [...panel.querySelectorAll('[data-electron]')];
  const playButton = panel.querySelector('[data-drift-play]');
  const stepButton = panel.querySelector('[data-drift-step]');
  const circuitButton = panel.querySelector('[data-drift-circuit]');
  const status = panel.querySelector('[data-drift-status]');
  const stateOut = panel.querySelector('[data-drift-state]');
  const countOut = panel.querySelector('[data-drift-count]');
  const netOut = panel.querySelector('[data-drift-net]');
  const distanceOut = panel.querySelector('[data-drift-distance]');

  let state = createDriftState({ electronCount: nodes.length });
  let running = false;
  let frame = null;
  let lastStamp = null;

  function paint() {
    state.electrons.forEach((electron, index) => {
      const node = nodes[index];
      if (!node) return;
      const point = electronPoint(electron);
      node.setAttribute('cx', point.x.toFixed(1));
      node.setAttribute('cy', point.y.toFixed(1));
      node.dataset.segment = point.segmentId;
      /* an open switch is a real gap: no electron is drawn inside it */
      const inGap = !state.closed && point.segmentId === 'right' && Math.abs(point.y - CIRCUIT.switch.y) < CIRCUIT.switch.r + 8;
      /* and the source itself is never crossed by a drawn carrier */
      const inSource = insideGenerator(point);
      node.setAttribute('opacity', inGap || inSource ? '0' : '1');
    });
    const summary = driftSummary(state);
    scene.dataset.closed = state.closed ? 'true' : 'false';
    lever.setAttribute('transform', state.closed ? `rotate(0 ${CIRCUIT.right} ${CIRCUIT.switch.y + CIRCUIT.switch.r})` : `rotate(-38 ${CIRCUIT.right} ${CIRCUIT.switch.y + CIRCUIT.switch.r})`);
    circuitButton.setAttribute('aria-pressed', state.closed ? 'true' : 'false');
    circuitButton.textContent = state.closed ? 'افتح الدارة' : 'أغلق الدارة';
    playButton.setAttribute('aria-pressed', running ? 'true' : 'false');
    playButton.textContent = running ? 'إيقاف المحاكاة مؤقتاً' : (context.reducedMotion ? 'خطوة واحدة (حركة مقلّلة)' : 'تشغيل المحاكاة');
    stateOut.textContent = state.closed ? ELECTRONS_READOUT_COPY.closed : ELECTRONS_READOUT_COPY.open;
    countOut.innerHTML = `${summary.count} <span class="u2l2a-unit-note">(ثابت قبل المصباح وبعده)</span>`;
    netOut.innerHTML = `<bdi dir="ltr">${formatNumber(summary.meanNetDisplacement, 2)}</bdi>`;
    distanceOut.innerHTML = `<bdi dir="ltr">${formatNumber(summary.meanDistance, 2)}</bdi>`;
    desc.textContent = state.closed
      ? 'دارة مغلقة: الإلكترونات تتحرّك عشوائياً ويُضاف إلى حركتها انجراف منظّم في اتجاه واحد داخل الموصل.'
      : 'دارة مفتوحة: الإلكترونات تتحرّك عشوائياً داخل الموصل دون انتقال صافٍ في اتجاه واحد.';
  }

  function stop(message) {
    running = false;
    if (frame !== null) {
      context.cancelFrame(frame);
      frame = null;
    }
    lastStamp = null;
    if (message) status.textContent = message;
    paint();
  }

  function tick(stamp) {
    if (!running) return;
    if (lastStamp === null) lastStamp = stamp;
    const dt = Math.min(0.05, Math.max(0, (stamp - lastStamp) / 1000));
    lastStamp = stamp;
    if (dt > 0) state = advanceDrift(state, Math.max(dt, 0.01));
    paint();
    const summary = driftSummary(state);
    if (summary.elapsed > 0.5 && state.closed) {
      status.textContent = `الدارة مغلقة: معدّل الانتقال الصافي يزداد باستمرار (${formatNumber(summary.meanNetDisplacement, 2)} بكسل حتى الآن)، وعدد الإلكترونات يبقى ${summary.count} كما هو.`;
    } else if (summary.elapsed > 0.5) {
      status.textContent = `الدارة مفتوحة: الإلكترونات تتحرّك في كل اتجاه، ومعدّل الانتقال الصافي يبقى قريباً من الصفر (${formatNumber(summary.meanNetDisplacement, 2)} بكسل).`;
    }
    frame = context.requestFrame(tick);
  }

  function start() {
    if (context.reducedMotion) {
      state = advanceDrift(state, 0.12);
      paint();
      status.textContent = `${context.reducedMotionLabel} تقدّمت المحاكاة خطوة واحدة: راقب معدّل الانتقال الصافي والمسافة المقطوعة بدل الحركة على الشاشة.`;
      return;
    }
    running = true;
    lastStamp = null;
    status.textContent = state.closed
      ? 'المحاكاة تعمل والدارة مغلقة: لاحظ الانجراف المنظّم الذي يُضاف إلى الحركة العشوائية.'
      : 'المحاكاة تعمل والدارة مفتوحة: لاحظ أن الحركة عشوائية في كل الاتجاهات. أغلِق الدارة لتقارن.';
    paint();
    frame = context.requestFrame(tick);
  }

  playButton.addEventListener('click', () => {
    if (context.reducedMotion) { start(); return; }
    if (running) stop('أُوقفت المحاكاة مؤقتاً. يمكنك تشغيلها من جديد أو إعادة الضبط.');
    else start();
  });
  stepButton.hidden = !context.reducedMotion;
  stepButton.addEventListener('click', () => {
    state = advanceDrift(state, 0.12);
    paint();
    status.textContent = `${context.reducedMotionLabel} خطوة واحدة إضافية.`;
  });
  circuitButton.addEventListener('click', () => {
    state = setDriftClosed(state, !state.closed);
    paint();
    status.textContent = state.closed
      ? 'أغلقتَ الدارة: أُضيف إلى الحركة العشوائية انجراف منظّم باتجاه واحد. راقب زيادة الانتقال الصافي.'
      : 'فتحت الدارة: توقّف الانجراف المنظّم وبقيت الحركة العشوائية وحدها، والانتقال الصافي يتوقّف عن الزيادة.';
  });
  panel.querySelector('[data-drift-reset]').addEventListener('click', () => {
    stop();
    state = createDriftState({ electronCount: nodes.length });
    paint();
    status.textContent = 'أُعيد الضبط: الدارة مفتوحة، وعدّادات الانتقال صفر، وعدد الإلكترونات كما هو.';
  });

  paint();
  return { stop };
}

/* ========================================================= station 3 · direction */

function directionMarkup() {
  const toggles = DIRECTION_TOGGLES.map((toggle) => `
    <button class="u2l2a-toggle" type="button" data-direction-toggle="${toggle.id}" aria-pressed="${toggle.id === 'current' ? 'true' : 'false'}">
      ${toggle.label}
    </button>`).join('');
  const legend = DIRECTION_LEGEND.map((entry) => `
    <li class="u2l2a-legend-row" data-legend="${entry.id}">
      <span class="u2l2a-legend-swatch u2l2a-legend-${entry.swatch}" aria-hidden="true"></span>
      <div><strong>${entry.title}</strong>${entry.bodyHtml}</div>
    </li>`).join('');
  const mixRows = DIRECTION_MIX_CARD.rows.map((row) => `
    <li><strong>${row.title}:</strong> ${row.bodyHtml}</li>`).join('');
  return `
  <div class="u2l2a-station-intro">${DIRECTION_INTRO_HTML}</div>
  <div class="u2l2a-lab">
    <section class="u2l2a-lab-controls" aria-label="ضوابط طبقات الاتجاه">
      <fieldset class="u2l2a-toggle-set">
        <legend>أظهر أو أخفِ كل جهة على حدة</legend>
        <div class="u2l2a-toggle-row">${toggles}</div>
      </fieldset>
      <p class="u2l2a-status" role="status" aria-live="polite" data-direction-status>طبقة جهة التيّار الاصطلاحية ظاهرة. أظهر طبقة الإلكترونات لتقارن بنفسك.</p>
    </section>
    <figure class="u2l2a-scene">
      ${circuitScene({
        id: 'direction-scene',
        title: 'دارة مغلقة مع أسهم جهة التيّار وجهة انجراف الإلكترونات',
        description: 'دارة مغلقة: المولّد في الأعلى وقطبه الموجب يساراً والسالب يميناً، والمصباح على الفرع الأيسر والمفتاح على الفرع الأيمن؛ أسهم نحاسية مكتوب بجانب كل منها «التيّار» لجهة التيّار الاصطلاحية وأسهم زرقاء مكتوب بجانب كل منها «الإلكترونات» لجهة انجراف الإلكترونات، وسهم واحد داخل المولّد يمثّل عودة التيّار من السالب إلى الموجب. لا تُرسم إلكترونات داخل المولّد.',
        extraLayers: `
          <g class="u2l2a-layer" data-layer="current">${directionArrowsMarkup('current')}${generatorInteriorMarkup()}</g>
          <g class="u2l2a-layer" data-layer="electrons" hidden>${directionArrowsMarkup('electron')}</g>
          <g class="u2l2a-layer" data-layer="energy" hidden>${energyArcMarkup()}</g>`,
      })}
      <figcaption>
        <p><strong>المشهد مغلق:</strong> المولّد في الأعلى، والمصباح على الفرع الأيسر، والمفتاح على الفرع الأيمن — وهو ترتيب الشكل المطبوع في صفحة 89 كما يصفه تدقيق المصدر.</p>
        <p class="u2l2a-scene-note">${SCENE_LABEL}. الصورة الأصلية غير متوفرة في المستودع، والسهمان المرسومان على كل قطعة سلك هما من إعداد المنصة، والسهم الوحيد داخل المولّد من إعداد المنصة أيضاً.</p>
      </figcaption>
      ${modelBadge()}
    </figure>
    <p class="u2l2a-legend-note">${DIRECTION_LEGEND_NOTE}</p>
    <ul class="u2l2a-legend">${legend}</ul>
    <div class="u2l2a-result-pair">
      <section class="u2l2a-info-card u2l2a-mix-card">
        <h3>${DIRECTION_MIX_CARD.title}</h3>
        <ul class="u2l2a-mix-list">${mixRows}</ul>
      </section>
      ${platformCard(ENRICHMENT_LABEL, DIRECTION_INSIDE_NOTE)}
    </div>
    <section class="u2l2a-questions" aria-labelledby="direction-questions-heading" data-question-group="direction">
      <h3 id="direction-questions-heading">سؤالان على الجهة</h3>
      ${DIRECTION_QUESTIONS.map((question) => questionMarkup(question)).join('')}
    </section>
  </div>`;
}

function mountDirection(panel) {
  const scene = panel.querySelector('[data-scene="direction-scene"]');
  const status = panel.querySelector('[data-direction-status]');
  const layers = {
    current: scene.querySelector('[data-layer="current"]'),
    electrons: scene.querySelector('[data-layer="electrons"]'),
    energy: scene.querySelector('[data-layer="energy"]'),
  };
  const visible = { current: true, electrons: false, energy: false };

  function applyVisibility() {
    Object.entries(layers).forEach(([id, group]) => { group.hidden = !visible[id]; });
    scene.querySelectorAll('[data-direction-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', visible[button.dataset.directionToggle] ? 'true' : 'false');
    });
    const shown = Object.entries(visible).filter(([, value]) => value).map(([key]) => (
      key === 'current' ? 'جهة التيّار الاصطلاحية' : key === 'electrons' ? 'جهة انجراف الإلكترونات' : 'اتجاه انتقال الطاقة'
    ));
    status.textContent = shown.length === 0
      ? 'كل الطبقات مخفية. أظهر طبقة واحدة على الأقل لتقرأ الجهة.'
      : `الطبقات الظاهرة الآن: ${shown.join(' + ')}.`;
  }

  panel.querySelectorAll('[data-direction-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.directionToggle;
      visible[id] = !visible[id];
      applyVisibility();
      if (id === 'electrons' && visible.electrons && visible.current) {
        status.textContent = 'الطبقتان ظاهرتان: قارن السهمين على القطعة نفسها من السلك، فستجد كلّ سهم في الجهة المعاكسة للآخر.';
      }
    });
  });

  applyVisibility();
}

/* ========================================================== station 4 · ammeter */

function dialMarkup() {
  const cx = 220;
  const cy = 210;
  const radius = 150;
  const ticks = AMMETER.labels.map((value) => {
    const { angle } = needleAngle(value);
    const radians = (angle * Math.PI) / 180;
    const inner = { x: cx + Math.sin(radians) * (radius - 14), y: cy - Math.cos(radians) * (radius - 14) };
    const outer = { x: cx + Math.sin(radians) * radius, y: cy - Math.cos(radians) * radius };
    const label = { x: cx + Math.sin(radians) * (radius - 34), y: cy - Math.cos(radians) * (radius - 34) + 5 };
    return `<line class="u2l2a-dial-tick" x1="${inner.x.toFixed(1)}" y1="${inner.y.toFixed(1)}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" />`
      + latinText(label.x.toFixed(1), label.y.toFixed(1), String(value), 'u2l2a-dial-number');
  }).join('');
  const arc = { start: needleAngle(AMMETER.minA), end: needleAngle(AMMETER.maxA) };
  const startPoint = { x: cx + Math.sin((arc.start.angle * Math.PI) / 180) * radius, y: cy - Math.cos((arc.start.angle * Math.PI) / 180) * radius };
  const endPoint = { x: cx + Math.sin((arc.end.angle * Math.PI) / 180) * radius, y: cy - Math.cos((arc.end.angle * Math.PI) / 180) * radius };
  return `
  <svg class="u2l2a-dial-svg" viewBox="0 0 440 300" role="img" aria-labelledby="dial-title dial-desc">
    <title id="dial-title">مقياس أمبير بمدرّج من صفر إلى اثني عشر أمبيراً</title>
    <desc id="dial-desc" data-dial-desc>مؤشّر مقياس الأمبير يشير إلى بداية المدرّج عند صفر أمبير.</desc>
    <path class="u2l2a-dial-arc" d="M${startPoint.x.toFixed(1)} ${startPoint.y.toFixed(1)} A ${radius} ${radius} 0 0 1 ${endPoint.x.toFixed(1)} ${endPoint.y.toFixed(1)}" />
    ${ticks}
    ${latinText(cx, cy - radius + 62, 'A', 'u2l2a-dial-unit')}
    <g class="u2l2a-dial-needle" data-dial-needle transform="rotate(-60 ${cx} ${cy})">
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - radius + 18}" />
      <circle cx="${cx}" cy="${cy}" r="9" />
    </g>
    <circle class="u2l2a-dial-hub" cx="${cx}" cy="${cy}" r="4" />
    ${arabicText(cx, cy + 52, 'مقياس الأمبير — يوصل على التّسلسُل', 'u2l2a-part-label')}
  </svg>`;
}

function ammeterMarkup() {
  const charge = LAB_RANGE.charge;
  const time = LAB_RANGE.time;
  return `
  <div class="u2l2a-station-intro">${AMMETER_INTRO_HTML}</div>
  <div class="u2l2a-lab">
    <section class="u2l2a-lab-controls" aria-label="ضوابط مختبر شِدّة التيار">
      <div class="u2l2a-slider">
        <div class="u2l2a-slider-head"><label for="u2l2a-charge">كمية الكهرباء Q</label><output for="u2l2a-charge" data-lab-charge-out><bdi dir="ltr">60 C</bdi></output></div>
        <input class="u2l2a-range" id="u2l2a-charge" type="range" min="${charge.min}" max="${charge.max}" step="${charge.step}" value="${charge.start}" data-lab-charge />
        <div class="u2l2a-range-ends" aria-hidden="true"><bdi dir="ltr">${charge.min} C</bdi><bdi dir="ltr">${charge.max} C</bdi></div>
      </div>
      <div class="u2l2a-slider">
        <div class="u2l2a-slider-head"><label for="u2l2a-time">الزمن t</label><output for="u2l2a-time" data-lab-time-out><bdi dir="ltr">30 s</bdi></output></div>
        <input class="u2l2a-range" id="u2l2a-time" type="range" min="${time.min}" max="${time.max}" step="${time.step}" value="${time.start}" data-lab-time />
        <div class="u2l2a-range-ends" aria-hidden="true"><bdi dir="ltr">${time.min} s</bdi><bdi dir="ltr">${time.max} s</bdi></div>
      </div>
      <div class="u2l2a-button-row">
        <button class="u2l2a-action" type="button" data-lab-scale-charge>ضاعف كمية الكهرباء</button>
        <button class="u2l2a-action" type="button" data-lab-scale-time>ضاعف الزمن</button>
        <button class="u2l2a-action" type="button" data-lab-book>اضبط المقياس على قيمة الكتاب (200 mA)</button>
        <button class="u2l2a-action u2l2a-action-ghost" type="button" data-lab-reset>إعادة الضبط</button>
      </div>
      <p class="u2l2a-status" role="status" aria-live="polite" data-lab-status>—</p>
      <div class="u2l2a-readout-grid">
        ${readout('قراءة المقياس', '<span data-lab-reading>—</span>')}
        ${readout('بالميلي أمبير', '<span data-lab-milli>—</span>')}
        ${readout('نسبة القسمة', '<span data-lab-ratio>—</span>')}
      </div>
      <div class="u2l2a-equation-slot" data-lab-equation></div>
      <p class="u2l2a-inline-note">${AMMETER_BOOK_VALUE.noteHtml}</p>
    </section>
    <figure class="u2l2a-scene u2l2a-scene-dial">
      <p class="u2l2a-dial-heading">${AMMETER_BOOK_VALUE.label}</p>
      ${dialMarkup()}
      <figcaption>المقياس رسم توضيحي من إعداد المنصة: المؤشّر يقيس النسبة بين كمية الكهرباء والزمن على مدرّج من ${ltr('0')} إلى ${ltr('12 A')}.</figcaption>
      ${modelBadge()}
    </figure>
    <section class="u2l2a-questions" aria-labelledby="ammeter-questions-heading" data-question-group="ammeter">
      <h3 id="ammeter-questions-heading">أسئلة المختبر الأربعة</h3>
      ${AMMETER_QUESTIONS.map((question) => questionMarkup(question)).join('')}
    </section>
    ${limitsCard('حدود هذا المقياس', AMMETER_MODEL_LIMITS)}
  </div>`;
}

function mountAmmeter(panel) {
  const chargeInput = panel.querySelector('[data-lab-charge]');
  const timeInput = panel.querySelector('[data-lab-time]');
  const chargeOut = panel.querySelector('[data-lab-charge-out]');
  const timeOut = panel.querySelector('[data-lab-time-out]');
  const status = panel.querySelector('[data-lab-status]');
  const readingOut = panel.querySelector('[data-lab-reading]');
  const milliOut = panel.querySelector('[data-lab-milli]');
  const ratioOut = panel.querySelector('[data-lab-ratio]');
  const equationSlot = panel.querySelector('[data-lab-equation]');
  const needle = panel.querySelector('[data-dial-needle]');
  const dialDesc = panel.querySelector('[data-dial-desc]');
  let previousReading = null;

  function update(message) {
    const reading = ammeterReading(Number(chargeInput.value), Number(timeInput.value));
    chargeOut.innerHTML = `<bdi dir="ltr">${reading.charge} C</bdi>`;
    timeOut.innerHTML = `<bdi dir="ltr">${reading.time} s</bdi>`;
    readingOut.innerHTML = reading.current >= 1
      ? `<bdi dir="ltr">${formatNumber(reading.current)} A</bdi>`
      : `<bdi dir="ltr">${formatNumber(reading.current, 3)} A</bdi>`;
    milliOut.innerHTML = `<bdi dir="ltr">${formatNumber(reading.milli, 1)} mA</bdi>`;
    ratioOut.innerHTML = `<bdi dir="ltr">${formatNumber(reading.charge)} ÷ ${formatNumber(reading.time)}</bdi>`;
    equationSlot.innerHTML = formula(
      `I=\\dfrac{Q}{t}=\\dfrac{${quantityTeX(reading.charge, 'C')}}{${quantityTeX(reading.time, 's')}}=${quantityTeX(reading.current, 'A')}`,
      `I equals Q over t equals ${formatNumber(reading.charge)} coulomb over ${formatNumber(reading.time)} seconds equals ${formatNumber(reading.current)} ampere`,
    );
    needle.setAttribute('transform', `rotate(${reading.needle.angle.toFixed(2)} 220 210)`);
    dialDesc.textContent = `مؤشّر مقياس الأمبير يشير إلى ${formatNumber(reading.current)} أمبير، أي ${formatNumber(reading.milli, 1)} ميلي أمبير.`;
    if (message) {
      status.innerHTML = message;
    } else if (previousReading === null) {
      status.textContent = `القراءة الابتدائية: ${formatNumber(reading.charge)} C خلال ${formatNumber(reading.time)} s ⇒ المقياس يشير إلى ${formatNumber(reading.current)} A.`;
    } else {
      const direction = reading.current > previousReading ? 'زادت' : reading.current < previousReading ? 'قلّت' : 'بقيت كما هي';
      status.textContent = `القراءة الآن ${formatNumber(reading.current)} A بدل ${formatNumber(previousReading)} A: ${direction} شِدّة التيّار.`;
    }
    previousReading = reading.current;
    return reading;
  }

  chargeInput.addEventListener('input', () => update());
  timeInput.addEventListener('input', () => update());
  panel.querySelector('[data-lab-scale-charge]').addEventListener('click', () => {
    const before = Number(chargeInput.value);
    chargeInput.value = String(scaleLabInput(before, LAB_RANGE.charge, 2));
    const reading = update();
    status.innerHTML = `ضاعفتَ كمية الكهرباء من ${ltr(`${before} C`)} إلى ${ltr(`${reading.charge} C`)} مع بقاء الزمن ${ltr(`${reading.time} s`)}: شِدّة التيّار الآن ${ltr(`${formatNumber(reading.current)} A`)} — أكبر من قبل، لأن الكمية في البسط.`;
  });
  panel.querySelector('[data-lab-scale-time]').addEventListener('click', () => {
    const before = Number(timeInput.value);
    timeInput.value = String(scaleLabInput(before, LAB_RANGE.time, 2));
    const reading = update();
    status.innerHTML = `ضاعفتَ الزمن من ${ltr(`${before} s`)} إلى ${ltr(`${reading.time} s`)} مع بقاء كمية الكهرباء ${ltr(`${reading.charge} C`)}: شِدّة التيّار الآن ${ltr(`${formatNumber(reading.current)} A`)} — أصغر من قبل، لأن الزمن في المقام.`;
  });
  panel.querySelector('[data-lab-book]').addEventListener('click', () => {
    chargeInput.value = String(20);
    timeInput.value = String(100);
    const reading = update();
    status.innerHTML = `قيمة الكتاب: ${ltr('200 mA')} = ${ltr(`${formatNumber(AMMETER_BOOK_VALUE.current)} A`)}. في النموذج اخترنا ${ltr('20 C')} خلال ${ltr('100 s')} لنحصل على القراءة نفسها؛ الزمن وكمية الكهرباء هنا قيم تعليمية من إعداد المنصة. القراءة الحالية ${ltr(`${formatNumber(reading.current)} A`)}.`;
  });
  panel.querySelector('[data-lab-reset]').addEventListener('click', () => {
    chargeInput.value = String(LAB_RANGE.charge.start);
    timeInput.value = String(LAB_RANGE.time.start);
    previousReading = null;
    update();
    status.textContent = 'أُعيد الضبط إلى القراءة الابتدائية.';
  });

  update();
}

/* ========================================================= station 5 · relation */

function relationMarkup() {
  const targetButtons = CALCULATOR_TARGETS.map((target) => `
    <button class="u2l2a-target" type="button" data-calc-target="${target.id}" aria-pressed="${target.id === 'I' ? 'true' : 'false'}">
      <span class="u2l2a-target-symbol">${target.symbol}</span>
      <span class="u2l2a-target-copy"><strong>${target.name}</strong><small>${target.unitName} (${target.unit})</small></span>
    </button>`).join('');
  const forms = RELATION_FORMS.map((form) => `
    <section class="u2l2a-form-card" data-form-card="${form.id}">
      <h3>${form.title}</h3>
      ${form.html}
      ${form.bodyHtml}
      <button class="u2l2a-action u2l2a-action-small" type="button" data-form-target="${form.target}">اجعل الحاسبة تحسب ${form.target}</button>
    </section>`).join('');
  const legend = SYMBOL_LEGEND.map((row) => `
    <tr>
      <th scope="row">${row.symbol}</th>
      <td>${row.name}</td>
      <td>${row.unit}</td>
      <td>${row.bookNote}</td>
    </tr>`).join('');
  const fields = ['Q', 'I', 't'].map((field) => {
    const meta = FIELD_META[field];
    const options = meta.units.map((unitName) => `<option value="${unitName}"${unitName === meta.baseUnit ? ' selected' : ''}>${CALCULATOR_COPY.unitNames[unitName]}</option>`).join('');
    return `
      <div class="u2l2a-calc-field" data-calc-field="${field}">
        <label for="u2l2a-calc-${field}">${CALCULATOR_COPY.labels[field]}</label>
        <div class="u2l2a-calc-input-row">
          <input class="u2l2a-calc-input" id="u2l2a-calc-${field}" type="text" inputmode="decimal" autocomplete="off" data-calc-input="${field}" aria-describedby="u2l2a-calc-${field}-error" />
          <span class="u2l2a-calc-unit-wrap"><label class="u2l2a-visually-hidden" for="u2l2a-calc-${field}-unit">${CALCULATOR_COPY.unitLabel} ${CALCULATOR_COPY.labels[field]}</label>
          <select class="u2l2a-calc-unit" id="u2l2a-calc-${field}-unit" data-calc-unit="${field}">${options}</select></span>
        </div>
        <p class="u2l2a-calc-error" id="u2l2a-calc-${field}-error" data-calc-error="${field}" role="alert" hidden></p>
      </div>`;
  }).join('');
  return `
  <div class="u2l2a-station-intro">${RELATION_INTRO_HTML}</div>
  <div class="u2l2a-lab">
    <section class="u2l2a-relation-forms" aria-label="صور العلاقة الثلاث">
      ${forms}
    </section>
    <section class="u2l2a-symbol-table-wrap">
      <h3>رموز العلاقة ووحداتها</h3>
      <div class="u2l2a-table-scroll">
        <table class="u2l2a-symbol-table">
          <caption>الرموز والوحدات كما في صفحة 91 من الكتاب</caption>
          <thead><tr><th scope="col">الرمز</th><th scope="col">المقدار</th><th scope="col">الوحدة</th><th scope="col">ملاحظة المصدر</th></tr></thead>
          <tbody>${legend}</tbody>
        </table>
      </div>
      <div class="u2l2a-card-body">${AMPERE_DEFINITION_HTML}</div>
    </section>

    <section class="u2l2a-calculator" aria-labelledby="calculator-heading">
      <header class="u2l2a-calculator-head">
        <h3 id="calculator-heading">${CALCULATOR_COPY.heading}</h3>
        <p>${CALCULATOR_COPY.intro}</p>
      </header>
      <fieldset class="u2l2a-target-set">
        <legend>${CALCULATOR_COPY.targetLegend}</legend>
        <div class="u2l2a-target-row" role="group">${targetButtons}</div>
      </fieldset>
      <form class="u2l2a-calc-form" data-calc-form novalidate>
        <div class="u2l2a-calc-fields">${fields}</div>
        <div class="u2l2a-button-row">
          <button class="u2l2a-action u2l2a-action-primary" type="submit" data-calc-compute>${CALCULATOR_COPY.compute}</button>
          <button class="u2l2a-action u2l2a-action-ghost" type="button" data-calc-reset>${CALCULATOR_COPY.reset}</button>
        </div>
      </form>
      <p class="u2l2a-status" role="status" aria-live="polite" data-calc-status>${CALCULATOR_COPY.liveNote}</p>
      <div class="u2l2a-calc-issues" data-calc-issues role="alert" hidden></div>
      <div class="u2l2a-calc-output" data-calc-output hidden>
        <p class="u2l2a-card-label"><span aria-hidden="true">✦</span> ${CALCULATOR_COPY.validHeading}</p>
        <div class="u2l2a-calc-result" data-calc-result></div>
        <h4>${CALCULATOR_COPY.stepsHeading}</h4>
        <ol class="u2l2a-calc-steps" data-calc-steps></ol>
      </div>
      <p class="u2l2a-inline-note">${CALCULATOR_COPY.graphNote} ${CALCULATOR_COPY.exactNote}</p>
    </section>

    <section class="u2l2a-questions" aria-labelledby="relation-questions-heading" data-question-group="relation">
      <h3 id="relation-questions-heading">تحديات على العلاقة</h3>
      <p class="u2l2a-questions-note">${NOT_BOOK_LABEL}. استخدم الحاسبة أعلاه إن احتجت.</p>
      ${RELATION_CHALLENGES.map((question) => questionMarkup(question)).join('')}
    </section>
    ${limitsCard('حدود هذه الحاسبة', RELATION_MODEL_LIMITS)}
  </div>`;
}

function mountRelation(panel, context) {
  const form = panel.querySelector('[data-calc-form]');
  const inputs = [...panel.querySelectorAll('[data-calc-input]')];
  const units = [...panel.querySelectorAll('[data-calc-unit]')];
  const targets = [...panel.querySelectorAll('[data-calc-target]')];
  const status = panel.querySelector('[data-calc-status]');
  const issuesBox = panel.querySelector('[data-calc-issues]');
  const output = panel.querySelector('[data-calc-output]');
  const resultBox = panel.querySelector('[data-calc-result]');
  const stepsList = panel.querySelector('[data-calc-steps]');
  let state = createCalculatorState('I');

  function syncFields() {
    const fields = state.inputs.map((input) => input.field);
    panel.querySelectorAll('[data-calc-field]').forEach((field) => {
      const name = field.dataset.calcField;
      const active = fields.includes(name);
      field.hidden = !active;
      if (!active) return;
      const input = state.inputs.find((candidate) => candidate.field === name);
      const inputNode = field.querySelector('[data-calc-input]');
      const unitNode = field.querySelector('[data-calc-unit]');
      if (inputNode.value !== input.raw) inputNode.value = input.raw;
      unitNode.value = input.unit;
    });
    targets.forEach((button) => button.setAttribute('aria-pressed', button.dataset.calcTarget === state.target ? 'true' : 'false'));
  }

  function render(message) {
    const report = calculatorReport(state);
    syncFields();
    panel.querySelectorAll('[data-calc-error]').forEach((node) => { node.hidden = true; node.textContent = ''; });
    if (report.status === 'invalid') {
      report.issues.forEach((issue) => {
        const node = panel.querySelector(`[data-calc-error="${issue.field}"]`);
        if (node) {
          node.hidden = false;
          node.textContent = issue.message;
        }
      });
      issuesBox.hidden = false;
      issuesBox.innerHTML = `<p class="u2l2a-card-label"><span aria-hidden="true">⚠</span> ${CALCULATOR_COPY.invalidHeading}</p><ul>${report.issues.map((issue) => `<li>${issue.message}</li>`).join('')}</ul>`;
      output.hidden = true;
      status.textContent = 'المدخلات تحتاج مراجعة قبل الحساب؛ التفاصيل في التنبيه أسفل الحقول.';
      return report;
    }
    issuesBox.hidden = true;
    output.hidden = false;
    resultBox.innerHTML = `
      <span class="u2l2a-calc-result-symbol">${report.targetMeta.symbol}</span>
      <span class="u2l2a-calc-result-value">${tex(quantityTeX(report.result, report.resultUnit), `${report.targetMeta.symbol} equals ${formatNumber(report.result)} ${report.resultUnit}`)}</span>
      <span class="u2l2a-calc-result-name">${report.targetMeta.name} بوحدة ${report.targetMeta.unitName}</span>
      ${report.alternate ? `<span class="u2l2a-calc-result-alt">أي ${tex(quantityTeX(report.alternate.value, report.alternate.unit, 3), `also ${formatNumber(report.alternate.value, 3)} ${report.alternate.unit}`)}</span>` : ''}`;
    stepsList.innerHTML = report.steps.map((step) => `
      <li class="u2l2a-calc-step">
        <span class="u2l2a-step-label">${step.label}</span>
        <div class="u2l2a-step-body">${formula(step.tex, step.plain)}</div>
      </li>`).join('');
    status.textContent = message ?? `حُسبت ${report.targetMeta.name}: ${formatNumber(report.result)} ${report.resultUnit}. الخطوات كاملة أسفل الحقول.`;
    return report;
  }

  targets.forEach((button) => button.addEventListener('click', () => {
    state = setCalculatorTarget(state, button.dataset.calcTarget);
    render();
  }));
  panel.querySelectorAll('[data-form-target]').forEach((button) => button.addEventListener('click', () => {
    state = setCalculatorTarget(state, button.dataset.formTarget);
    render();
    panel.querySelector('[data-calc-form]')?.scrollIntoView?.({ block: 'center', behavior: context.reducedMotion ? 'auto' : 'smooth' });
  }));
  inputs.forEach((input) => input.addEventListener('input', () => {
    state = setCalculatorInput(state, input.dataset.calcInput, input.value);
    const report = calculatorReport(state);
    const everyFieldFilled = state.inputs.every((candidate) => String(candidate.raw).trim() !== '');
    /* while a field is still being typed, only a usable calculation redraws the
     * output; a filled-but-wrong value does show its own message immediately */
    if (report.status === 'ok' || everyFieldFilled) render();
  }));
  inputs.forEach((input) => input.addEventListener('change', () => render()));
  units.forEach((unit) => unit.addEventListener('change', () => {
    state = setCalculatorUnit(state, unit.dataset.calcUnit, unit.value);
    render();
  }));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    render();
  });
  panel.querySelector('[data-calc-reset]').addEventListener('click', () => {
    state = resetCalculatorState(state);
    render('أُعيدت الحاسبة إلى القيم الابتدائية: كمية الكهرباء 60 C والزمن 30 s.');
  });

  render();
}

/* ======================================================== station 6 · detective */

function detectiveMarkup() {
  return `
  <div class="u2l2a-station-intro">${DETECTIVE_INTRO_HTML}</div>
  ${sourceCard(PLATFORM_LABEL, DETECTIVE_SCENARIO_HTML)}
  <div class="u2l2a-lab">
    <section class="u2l2a-detective-head" aria-labelledby="detective-progress-heading">
      <h3 id="detective-progress-heading">تقدّمك في المهام</h3>
      <div class="u2l2a-progress-track u2l2a-progress-track-small" role="progressbar" aria-labelledby="detective-progress-heading" aria-valuemin="0" aria-valuemax="7" aria-valuenow="0" data-detective-track>
        <span data-detective-fill></span>
      </div>
      <p class="u2l2a-progress-readout"><span data-detective-count>0 من 7</span> ${DETECTIVE_ENCOURAGEMENT_HTML}</p>
    </section>
    <section class="u2l2a-questions" aria-labelledby="detective-questions-heading" data-question-group="detective">
      <h3 id="detective-questions-heading">المهام السبع</h3>
      ${questionsOfStationForDetective().map((question) => questionMarkup(question)).join('')}
    </section>
  </div>`;
}

const questionsOfStationForDetective = () => questionsOfStation('detective');

function mountDetective(panel, context) {
  const track = panel.querySelector('[data-detective-track]');
  const fill = panel.querySelector('[data-detective-fill]');
  const count = panel.querySelector('[data-detective-count]');
  context.onAnswerProgress.push((states) => {
    const progress = stationAnswerProgress('detective', states);
    track.setAttribute('aria-valuenow', String(progress.solved));
    track.setAttribute('aria-valuetext', `${progress.solved} من ${progress.total} مهمة مكتملة`);
    fill.style.width = `${progress.percent}%`;
    count.textContent = progress.solved === progress.total
      ? `${progress.solved} من ${progress.total} — أكملت المهام كلها`
      : `${progress.solved} من ${progress.total}`;
  });
}

/* ============================================================== station 7 · map */

const mapNodePositions = Object.fromEntries(CONCEPT_NODES.map((node) => [node.id, { x: node.x, y: node.y }]));

function mapLinkMarkup(link) {
  const from = mapNodePositions[link.from];
  const to = mapNodePositions[link.to];
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const controlX = midX - (dy / length) * link.curved;
  const controlY = midY + (dx / length) * link.curved;
  return `
    <g class="u2l2a-map-link" data-link="${link.from}-${link.to}">
      <path d="M${from.x} ${from.y} Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${to.x} ${to.y}" />
      <text x="${controlX.toFixed(1)}" y="${(controlY - 6).toFixed(1)}" text-anchor="middle" direction="rtl">${link.label}</text>
    </g>`;
}

function mapSvgMarkup() {
  const nodes = CONCEPT_NODES.map((node) => `
    <g class="u2l2a-map-node" data-map-node="${node.id}" data-active="false">
      <title>${node.label}</title>
      <circle cx="${node.x}" cy="${node.y}" r="62" />
      <text x="${node.x}" y="${node.y + 6}" text-anchor="middle" direction="rtl" class="u2l2a-map-node-short">${node.short}</text>
    </g>`).join('');
  return `
  <svg class="u2l2a-map-svg" viewBox="0 0 660 420" role="img" aria-labelledby="map-title map-desc" data-map-svg>
    <title id="map-title">خريطة مفاهيم الدرس الثاني</title>
    <desc id="map-desc">ستّة مفاهيم موصولة بخطوط: المولّد والطاقة الكهربائية، والدارة المغلقة، والإلكترونات الحرّة، وجهة التيّار، وشِدّة التيّار، وكمية الكهرباء والزمن.</desc>
    ${CONCEPT_LINKS.map(mapLinkMarkup).join('')}
    ${nodes}
  </svg>`;
}

function mapMarkup() {
  const buttons = CONCEPT_NODES.map((node) => `
    <button class="u2l2a-map-button" type="button" data-concept-button="${node.id}" aria-pressed="false">
      <span class="u2l2a-map-button-short">${node.short}</span>
      <span class="u2l2a-map-button-label">${node.label}</span>
    </button>`).join('');
  const panels = CONCEPT_NODES.map((node) => `
    <section class="u2l2a-concept-card" data-concept-card="${node.id}" hidden aria-labelledby="concept-${node.id}-heading">
      <h3 id="concept-${node.id}-heading">${node.label}</h3>
      <div class="u2l2a-card-body">${node.bodyHtml}</div>
      <button class="u2l2a-action u2l2a-action-small" type="button" data-concept-open="${node.stationId}">${CONCEPT_NODE_ACTION}</button>
    </section>`).join('');
  const checklist = CHECKLIST_ITEMS.map((item) => `
    <li class="u2l2a-check-row">
      <div class="u2l2a-check-main">
        <input type="checkbox" id="u2l2a-${item.id}" data-checklist-item="${item.id}" />
        <label for="u2l2a-${item.id}">${item.label}</label>
      </div>
      <button class="u2l2a-action u2l2a-action-small" type="button" data-checklist-open="${item.stationId}">${item.stationLabel}: ${findStation(item.stationId).title}</button>
    </li>`).join('');
  return `
  <div class="u2l2a-station-intro">${CONCEPT_INTRO_HTML}</div>
  <div class="u2l2a-lab">
    <figure class="u2l2a-scene u2l2a-scene-map">
      ${mapSvgMarkup()}
      <figcaption>${CONCEPT_MAP_LEGEND}</figcaption>
      ${modelBadge()}
    </figure>
    <div class="u2l2a-map-buttons">${buttons}</div>
    <div class="u2l2a-concept-cards">${panels}</div>
    <section class="u2l2a-key-ideas" aria-labelledby="key-ideas-heading">
      <h3 id="key-ideas-heading">ما يجب أن يبقى معك</h3>
      <ul>${KEY_IDEAS.map((idea) => `<li>${idea}</li>`).join('')}</ul>
    </section>
    <section class="u2l2a-checklist" aria-labelledby="checklist-heading">
      <h3 id="checklist-heading">${CHECKLIST_HEADING}</h3>
      ${CHECKLIST_INTRO}
      <ul class="u2l2a-check-list">${checklist}</ul>
      <div class="u2l2a-progress-track u2l2a-progress-track-small" role="progressbar" aria-labelledby="checklist-heading" aria-valuemin="0" aria-valuemax="${CHECKLIST_ITEMS.length}" aria-valuenow="0" data-checklist-track><span data-checklist-fill></span></div>
      <p class="u2l2a-status" role="status" aria-live="polite" data-checklist-status>لم تضع أي علامة بعد: هذه قائمة شخصية بلا درجة.</p>
      <div class="u2l2a-button-row">
        <button class="u2l2a-action u2l2a-action-ghost" type="button" data-checklist-reset>أفرغ قائمة التحقّق</button>
        <button class="u2l2a-action" type="button" data-map-restart>أعد الرحلة من المحطة الأولى</button>
      </div>
    </section>
    ${sourceCard(NOTES_LABEL, `<ul class="u2l2a-limits">${SCOPE_NOTES.map((note) => `<li>${note}</li>`).join('')}</ul>`)}
    ${platformCard(PLATFORM_LABEL, SUMMARY_CLOSING_HTML)}
  </div>`;
}

function mountMap(panel, context) {
  const buttons = [...panel.querySelectorAll('[data-concept-button]')];
  const svg = panel.querySelector('[data-map-svg]');
  const track = panel.querySelector('[data-checklist-track]');
  const fill = panel.querySelector('[data-checklist-fill]');
  const checklistStatus = panel.querySelector('[data-checklist-status]');
  let checklist = createChecklistState();

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.conceptButton;
      const open = button.getAttribute('aria-pressed') !== 'true';
      buttons.forEach((other) => {
        const same = other === button && open;
        other.setAttribute('aria-pressed', same ? 'true' : 'false');
        panel.querySelector(`[data-concept-card="${other.dataset.conceptButton}"]`).hidden = !same;
        svg.querySelector(`[data-map-node="${other.dataset.conceptButton}"]`).dataset.active = same ? 'true' : 'false';
      });
      if (open) panel.querySelector(`[data-concept-card="${id}"] h3`)?.focus?.({ preventScroll: true });
    });
  });

  panel.querySelectorAll('[data-concept-open]').forEach((button) => {
    button.addEventListener('click', () => context.openStation(button.dataset.conceptOpen, true));
  });
  panel.querySelectorAll('[data-checklist-open]').forEach((button) => {
    button.addEventListener('click', () => context.openStation(button.dataset.checklistOpen, true));
  });
  panel.querySelector('[data-map-restart]').addEventListener('click', () => context.openStation(APPENDIX_STATIONS[0].id, true));

  function paintChecklist(message) {
    const progress = checklistProgress(checklist);
    track.setAttribute('aria-valuenow', String(progress.done));
    track.setAttribute('aria-valuetext', `${progress.done} من ${progress.total} أهداف`);
    fill.style.width = `${progress.percent}%`;
    if (message) {
      checklistStatus.textContent = message;
      return;
    }
    checklistStatus.innerHTML = progress.complete
      ? `${CHECKLIST_DONE_HTML}`
      : progress.done === 0
        ? 'لم تضع أي علامة بعد: هذه قائمة شخصية بلا درجة.'
        : `${CHECKLIST_PARTIAL_HTML}`;
  }

  panel.querySelectorAll('[data-checklist-item]').forEach((input) => {
    input.addEventListener('change', () => {
      checklist = toggleChecklistItem(checklist, input.dataset.checklistItem);
      paintChecklist();
    });
  });
  panel.querySelector('[data-checklist-reset]').addEventListener('click', () => {
    checklist = createChecklistState();
    panel.querySelectorAll('[data-checklist-item]').forEach((input) => { input.checked = false; });
    paintChecklist('أُفرغت قائمة التحقّق. يمكنك إعادة تقييم نفسك في أي وقت.');
  });

  paintChecklist();
}

/* ========================================================= the shared question */

function questionMarkup(question) {
  const badge = question.source === 'book'
    ? `<span class="u2l2a-question-tag is-book">${SOURCE_LABEL} · ص${question.pageRef}</span>`
    : `<span class="u2l2a-question-tag is-platform">${PLATFORM_LABEL}</span>`;
  const hint = question.hintHtml
    ? `<details class="u2l2a-hint"><summary>تلميح</summary>${question.hintHtml}</details>`
    : '';
  let body = '';
  if (question.kind === 'choice') {
    body = `<fieldset class="u2l2a-choice-set">
        <legend class="u2l2a-visually-hidden">اختر إجابة واحدة</legend>
        <div class="u2l2a-choice-list">
          ${question.choices.map((choice) => `
            <label class="u2l2a-choice">
              <input type="radio" name="answer-${question.id}" value="${choice.id}" data-choice="${choice.id}" />
              <span>${choice.label}</span>
            </label>`).join('')}
        </div>
      </fieldset>`;
  } else if (question.kind === 'order') {
    body = `<ol class="u2l2a-order-list" data-order-list>
        ${question.items.map((item) => `
          <li class="u2l2a-order-item" data-order-item="${item.id}">
            <span class="u2l2a-order-text">${item.label}</span>
            <span class="u2l2a-order-controls">
              <button class="u2l2a-order-button" type="button" data-order-move="${item.id}" data-order-delta="-1" aria-label="حرّك هذه الجملة إلى أعلى">▲</button>
              <button class="u2l2a-order-button" type="button" data-order-move="${item.id}" data-order-delta="1" aria-label="حرّك هذه الجملة إلى أسفل">▼</button>
            </span>
          </li>`).join('')}
      </ol>
      <p class="u2l2a-order-hint">${DETECTIVE_ORDER_HINT}</p>`;
  } else if (question.kind === 'number') {
    body = `<div class="u2l2a-number-row">
        <label for="u2l2a-number-${question.id}">الجواب</label>
        <input class="u2l2a-number-input" id="u2l2a-number-${question.id}" type="text" inputmode="decimal" autocomplete="off" data-number-input="${question.id}" />
        <span class="u2l2a-number-unit">${tex(`\\mathrm{${question.unit}}`, question.unit)}</span>
      </div>
      <p class="u2l2a-number-hint">${DETECTIVE_NUMBER_HINT}</p>`;
  }
  return `
  <article class="u2l2a-question" data-question="${question.id}" data-question-kind="${question.kind}">
    <header class="u2l2a-question-head">
      <h4 class="u2l2a-question-prompt">${question.prompt}</h4>
      ${badge}
    </header>
    ${hint}
    ${body}
    <div class="u2l2a-button-row u2l2a-question-actions">
      <button class="u2l2a-action u2l2a-action-primary" type="button" data-question-submit>تحقّق</button>
      <button class="u2l2a-action u2l2a-action-ghost" type="button" data-question-retry>${DETECTIVE_RETRY_LABEL}</button>
    </div>
    <div class="u2l2a-feedback" data-question-feedback role="status" aria-live="polite" tabindex="-1" hidden></div>
  </article>`;
}

function mountQuestions(panel, context) {
  panel.querySelectorAll('[data-question]').forEach((node) => {
    const questionId = node.dataset.question;
    const question = findQuestion(questionId);
    let state = createAnswerState(questionId);
    const feedback = node.querySelector('[data-question-feedback]');
    const submitButton = node.querySelector('[data-question-submit]');
    const orderList = node.querySelector('[data-order-list]');

    function paintOrder() {
      if (!orderList) return;
      state.order.forEach((itemId) => {
        const item = orderList.querySelector(`[data-order-item="${itemId}"]`);
        if (item) orderList.append(item);
      });
      [...orderList.children].forEach((child, index) => {
        child.dataset.position = String(index + 1);
        child.querySelector('[data-order-delta="-1"]').disabled = index === 0;
        child.querySelector('[data-order-delta="1"]').disabled = index === orderList.children.length - 1;
      });
    }

    function paint(message) {
      node.dataset.status = state.status ?? (state.needsInput ? 'needs-input' : 'idle');
      if (state.status && state.feedbackHtml) {
        feedback.hidden = false;
        feedback.className = `u2l2a-feedback is-${state.status}`;
        feedback.innerHTML = state.feedbackHtml;
      } else if (state.needsInput) {
        feedback.hidden = false;
        feedback.className = 'u2l2a-feedback is-invalid';
        feedback.innerHTML = `<p class="u2l2a-feedback-headline">أكمل إجابتك أولاً</p><p>${question.kind === 'choice' ? 'اختر إجابة أولاً ثم اضغط «تحقّق».' : question.kind === 'number' ? 'اكتب قيمة عددية أولاً ثم اضغط «تحقّق».' : 'رتّب الجمل ثم اضغط «تحقّق».'}</p>`;
      } else {
        feedback.hidden = true;
        feedback.innerHTML = '';
      }
      if (message) feedback.insertAdjacentHTML('afterbegin', `<p class="u2l2a-feedback-note">${message}</p>`);
      paintOrder();
    }

    if (question.kind === 'choice') {
      node.querySelectorAll('[data-choice]').forEach((input) => {
        input.addEventListener('change', () => {
          state = selectAnswer(state, input.value);
          paint();
        });
      });
    }
    if (question.kind === 'number') {
      const input = node.querySelector('[data-number-input]');
      input.addEventListener('input', () => { state = setNumberAnswer(state, input.value); });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          state = submitAnswer(state);
          paint();
          context.onAnswerChange(questionId, state);
        }
      });
    }
    if (question.kind === 'order') {
      node.querySelectorAll('[data-order-move]').forEach((button) => {
        button.addEventListener('click', () => {
          state = moveOrderItem(state, button.dataset.orderMove, Number(button.dataset.orderDelta));
          paint();
        });
      });
    }

    submitButton.addEventListener('click', () => {
      if (question.kind === 'number') state = setNumberAnswer(state, node.querySelector('[data-number-input]').value);
      const before = state.attempts;
      state = submitAnswer(state);
      paint();
      if (state.attempts > before) context.onAnswerChange(questionId, state);
      feedback.focus?.({ preventScroll: true });
    });
    node.querySelector('[data-question-retry]').addEventListener('click', () => {
      state = retryAnswer(state);
      if (question.kind === 'choice') node.querySelectorAll('[data-choice]').forEach((input) => { input.checked = false; });
      if (question.kind === 'number') node.querySelector('[data-number-input]').value = '';
      paint('أُعيدت المحاولة: لا خصم ولا قفل، جرّب من جديد.');
      context.onAnswerChange(questionId, state);
    });

    paint();
    context.registerAnswer(questionId, state);
  });
}

/* ==================================================================== shell */

function stationPanelMarkup(station, bodyHtml) {
  const objectives = objectivesOfStation(station.id);
  const keywords = station.keywords.map((keyword) => `<li>${keyword}</li>`).join('');
  return `
  <section class="u2l2a-station" id="station-${station.id}" data-station="${station.id}" aria-labelledby="station-${station.id}-heading" hidden>
    <header class="u2l2a-station-head">
      <div class="u2l2a-station-count"><span dir="ltr">${String(station.index).padStart(2, '0')}</span><i aria-hidden="true">${station.icon}</i></div>
      <div class="u2l2a-station-heading-copy">
        <p class="u2l2a-section-kicker">${station.kicker}</p>
        <h2 id="station-${station.id}-heading" tabindex="-1">${station.title}</h2>
        <p class="u2l2a-station-goal"><strong>هدف المحطة:</strong> ${station.goal}</p>
      </div>
      <div class="u2l2a-station-meta">
        <p class="u2l2a-station-objective"><span>من أهداف الدرس</span>${station.objective}</p>
        <p class="u2l2a-station-objective"><span>الأهداف المرتبطة</span>${objectives.map((objective) => objective.text).join(' · ')}</p>
        <ul class="u2l2a-station-keywords" aria-label="الكلمات المفتاحية في هذه المحطة">${keywords}</ul>
      </div>
    </header>
    <div class="u2l2a-station-body">${bodyHtml}</div>
  </section>`;
}

export function mountJourneyAppendix(root) {
  const view = root.ownerDocument.defaultView;
  const motionQuery = typeof view?.matchMedia === 'function' ? view.matchMedia('(prefers-reduced-motion: reduce)') : null;
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
  const objectivesList = root.querySelector('#objective-list');
  const keywordRow = root.querySelector('#keyword-row');
  const howtoList = root.querySelector('#howto-steps');
  const answerStates = {};
  const answerListeners = [];
  const frameHandles = new Set();
  const cancellers = [];
  let running = true;

  const context = {
    get reducedMotion() { return reducedMotion; },
    reducedMotionLabel: 'تقليل الحركة مفعّل:',
    requestFrame: (callback) => {
      const handle = view.requestAnimationFrame((stamp) => {
        frameHandles.delete(handle);
        if (running) callback(stamp);
      });
      frameHandles.add(handle);
      return handle;
    },
    cancelFrame: (handle) => {
      frameHandles.delete(handle);
      view.cancelAnimationFrame(handle);
    },
    openStation: (stationId, moveFocus = false) => goTo(stationId, moveFocus),
    registerAnswer: (questionId, state) => {
      answerStates[questionId] = state;
      answerListeners.forEach((listener) => listener(answerStates));
    },
    onAnswerChange: (questionId, state) => context.registerAnswer(questionId, state),
    onAnswerProgress: answerListeners,
  };

  /* hero, objectives, keywords and the how-to list come from the content module */
  root.querySelector('#hero-description').innerHTML = HERO_DESCRIPTION_HTML;
  root.querySelector('#hero-note').textContent = HERO_NOTE;
  /* the Latin half of the label is isolated, so it cannot reorder the Arabic */
  const [extensionArabic, extensionLatin] = EXTENSION_LABEL.split('—').map((part) => part.trim());
  root.querySelector('#hero-extension').innerHTML = `<span aria-hidden="true">⚡</span> ${extensionArabic} — ${ltr(extensionLatin)}`;
  root.querySelector('#hero-lesson-label').textContent = `${APPENDIX_LESSON_LABEL} · صفحات الكتاب ${LESSON_PAGES}`;
  keywordRow.innerHTML = APPENDIX_KEYWORDS.map((keyword) => `<li title="${keyword.gloss}"><span>${keyword.label}</span></li>`).join('');
  objectivesList.innerHTML = APPENDIX_OBJECTIVES.map((objective) => `
    <li><strong>${objective.text}</strong><small>${objective.check}</small><em>${objective.stations}</em></li>`).join('');
  howtoList.innerHTML = HOW_TO_USE_STEPS.map((step, index) => `
    <li><span dir="ltr">${String(index + 1).padStart(2, '0')}</span><strong>${step.title}</strong><small>${step.body}</small></li>`).join('');

  /* the station rail and the panels */
  nav.innerHTML = APPENDIX_STATIONS.map((station) => `
    <button class="u2l2a-station-chip" type="button" data-station-link="${station.id}" aria-label="المحطة ${station.index}: ${station.title}">
      <span class="u2l2a-chip-index" dir="ltr">${station.index}</span>
      <span class="u2l2a-chip-copy"><strong>${station.title}</strong><small>${station.navLabel}</small></span>
    </button>`).join('');

  const bodies = {
    origin: originMarkup,
    electrons: electronsMarkup,
    direction: directionMarkup,
    ammeter: ammeterMarkup,
    relation: relationMarkup,
    detective: detectiveMarkup,
    map: mapMarkup,
  };
  panelsHost.innerHTML = APPENDIX_STATIONS.map((station) => stationPanelMarkup(station, bodies[station.id]())).join('');

  let flow = createStationFlow(stationIdFromHash(view?.location?.hash) ?? APPENDIX_STATIONS[0].id);
  const panels = Object.fromEntries(APPENDIX_STATIONS.map((station) => [station.id, panelsHost.querySelector(`[data-station="${station.id}"]`)]));

  mountOrigin(panels.origin);
  const electronsSession = mountElectrons(panels.electrons, context);
  mountDirection(panels.direction);
  mountAmmeter(panels.ammeter);
  mountRelation(panels.relation, context);
  mountDetective(panels.detective, context);
  mountMap(panels.map, context);
  APPENDIX_STATIONS.forEach((station) => mountQuestions(panels[station.id], context));

  answerListeners.push(() => {
    const progress = answerProgress(answerStates);
    const readout = root.querySelector('#answer-progress');
    if (readout) {
      readout.textContent = progress.solved === progress.total
        ? `${progress.solved} من ${progress.total} — أنجزت كل الأسئلة`
        : `${progress.solved} من ${progress.total} سؤالاً`;
    }
  });

  function applyFlow(moveFocus) {
    APPENDIX_STATIONS.forEach((station) => {
      const panel = panels[station.id];
      const isActive = station.id === flow.activeId;
      panel.hidden = !isActive;
      panel.dataset.visited = flow.visitedIds.includes(station.id) ? 'true' : 'false';
      if (isActive) panel.dataset.active = 'true';
      else delete panel.dataset.active;
    });
    nav.querySelectorAll('[data-station-link]').forEach((chip) => {
      const isActive = chip.dataset.stationLink === flow.activeId;
      if (isActive) chip.setAttribute('aria-current', 'step');
      else chip.removeAttribute('aria-current');
      chip.dataset.visited = flow.visitedIds.includes(chip.dataset.stationLink) ? 'true' : 'false';
    });
    progressTrack.setAttribute('aria-valuenow', String(flow.activeIndex + 1));
    progressTrack.setAttribute('aria-valuetext', `المحطة ${flow.activeIndex + 1} من ${flow.total}: ${flow.station.title}`);
    progressFill.style.width = `${flow.progressPercent}%`;
    progressLabel.textContent = `المحطة ${flow.activeIndex + 1} من ${flow.total} · ${flow.station.title}`;
    progressValue.textContent = `${flow.discoveryPercent}%`;
    controlCenter.textContent = `المحطة ${flow.activeIndex + 1} من ${flow.total}`;
    const { previous, next } = stationNeighbours(flow);
    previousButton.disabled = !previous;
    nextButton.disabled = !next;
    previousLabel.textContent = previous ? `${previous.index}. ${previous.navLabel}` : 'بداية الرحلة';
    nextLabel.textContent = next ? `${next.index}. ${next.navLabel}` : 'نهاية الرحلة';
    if (moveFocus) {
      const heading = panels[flow.activeId].querySelector('h2');
      heading?.focus?.({ preventScroll: true });
      heading?.scrollIntoView?.({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }

  function goTo(stationId, moveFocus = false) {
    flow = goToStation(flow, stationId);
    if (view?.history?.replaceState && view.location) view.history.replaceState(null, '', stationHash(stationId));
    applyFlow(moveFocus);
  }

  nav.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-station-link]');
    if (chip) goTo(chip.dataset.stationLink, true);
  });
  previousButton.addEventListener('click', () => { flow = stepStation(flow, -1); applyFlow(true); });
  nextButton.addEventListener('click', () => { flow = stepStation(flow, 1); applyFlow(true); });
  root.querySelector('#start-first-station').addEventListener('click', () => goTo(APPENDIX_STATIONS[0].id, true));

  const onKeydown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target?.closest?.('input, select, textarea, [contenteditable="true"]')) return;
    if (event.key === 'PageDown') { event.preventDefault(); flow = stepStation(flow, 1); applyFlow(true); }
    if (event.key === 'PageUp') { event.preventDefault(); flow = stepStation(flow, -1); applyFlow(true); }
    if (event.key === 'Home' && !event.shiftKey) { event.preventDefault(); goTo(APPENDIX_STATIONS[0].id, true); }
    if (event.key === 'End') { event.preventDefault(); goTo(APPENDIX_STATIONS[APPENDIX_STATIONS.length - 1].id, true); }
  };
  view?.addEventListener?.('keydown', onKeydown);
  const onHashChange = () => {
    const id = stationIdFromHash(view.location.hash);
    if (id && id !== flow.activeId) goTo(id, false);
  };
  view?.addEventListener?.('hashchange', onHashChange);
  cancellers.push(() => view?.removeEventListener?.('keydown', onKeydown));
  cancellers.push(() => view?.removeEventListener?.('hashchange', onHashChange));

  applyFlow(false);
  answerListeners.forEach((listener) => listener(answerStates));

  return Object.freeze({
    goToStation: goTo,
    get flow() { return flow; },
    panels,
    dispose() {
      running = false;
      frameHandles.forEach((handle) => view.cancelAnimationFrame(handle));
      frameHandles.clear();
      cancellers.forEach((cancel) => cancel());
      electronsSession.stop();
    },
  });
}

/* ------------------------------------------------------------- bootstrap */

const appendixRoot = typeof document !== 'undefined' ? document.querySelector('[data-unit2-lesson2-appendix]') : null;
if (appendixRoot) mountJourneyAppendix(appendixRoot);
