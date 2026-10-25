/*
 * «محطة الفولت — اكشف فرق الكمون»
 * Standalone enrichment appendix for Unit 2, Lesson 3 (textbook pages 97–106).
 *
 * Seven short stations, one on screen at a time, built around one measurement
 * bench the student actually wires:
 *
 *   1 meaning    — a one-lamp circuit: click any part to read its role, measure
 *                  across the lamp, and separate potential difference from
 *                  current, charge and energy;
 *   2 probes     — the core lab: place the red and black probes on any two of
 *                  six glowing points (mouse or keyboard), change the source,
 *                  the lamp shares and the switch, watch the big digital
 *                  voltmeter, collect readings in a comparison table, try the
 *                  wrong (series) connection and reset;
 *   3 dipoles    — the p100 experiment as two trials per dipole, then classify
 *                  with the book's own basis;
 *   4 potentials — the potential of every point against a reference the student
 *                  chooses, with a live bar chart and a pair-comparison table;
 *   5 sum        — predict, then measure: the partial differences of a series
 *                  loop against the source, plus the parallel rule;
 *   6 detective  — seven graded tasks mixing probe placement, choice, ordering,
 *                  numeric and interpretation work;
 *   7 map        — a seven-node concept map plus the four-objective self-check.
 *
 * All physics comes from `unit2-lesson3-appendix-physics.js`, all authored copy
 * from `unit2-lesson3-appendix-content.js`, all state from
 * `unit2-lesson3-appendix-flow.js`, and every piece of mathematics is rendered
 * through the shared KaTeX layer in `math.js`.
 *
 * Nothing here is graded, stored, or sent anywhere: the appendix is local,
 * exploratory practice, separate from the lesson test and the teacher area.
 */

import { ltrText } from './math.js';
import {
  ALL_QUESTIONS,
  APPENDIX_KEYWORDS,
  APPENDIX_LESSON_LABEL,
  APPENDIX_OBJECTIVES,
  APPENDIX_STATIONS,
  CHECKLIST_DONE_HTML,
  CHECKLIST_HEADING,
  CHECKLIST_INTRO,
  CHECKLIST_ITEMS,
  CHECKLIST_PARTIAL_HTML,
  CONCEPT_INTRO_HTML,
  CONCEPT_LINKS,
  CONCEPT_MAP_LEGEND,
  CONCEPT_NODES,
  DETECTIVE_INTRO_HTML,
  DETECTIVE_ORDER_HINT,
  DETECTIVE_RETRY_LABEL,
  DIPOLES_BASIS_HTML,
  DIPOLES_BOOK_QUOTE_HTML,
  DIPOLES_INTRO_HTML,
  DIPOLES_PLATFORM_HTML,
  ENRICHMENT_LABEL,
  EXTENSION_LABEL,
  HERO_DESCRIPTION_HTML,
  HERO_NOTE,
  HOW_TO_USE_STEPS,
  LESSON_PAGES,
  MEANING_BOOK_QUOTE_HTML,
  MEANING_ENRICHMENT_HTML,
  MEANING_INTRO_HTML,
  MEANING_NOT_CURRENT_HTML,
  MEANING_PLATFORM_HTML,
  MODEL_LABEL,
  NOT_BOOK_LABEL,
  PARALLEL_RULE_HTML,
  PLATFORM_LABEL,
  POTENTIALS_ENRICHMENT_HTML,
  POTENTIALS_INTRO_HTML,
  POTENTIALS_PLATFORM_HTML,
  PROBES_INTRO_HTML,
  PROBES_MESSAGES,
  PROBES_PARALLEL_HTML,
  PROBES_SIGN_HTML,
  SCENE_LABEL,
  SCOPE_NOTES,
  SERIES_RULE_GENERAL_HTML,
  SERIES_RULE_HTML,
  SOURCE_LABEL,
  SUMMARY_CLOSING_HTML,
  SUM_BOOK_QUOTE_HTML,
  SUM_CONDITION_HTML,
  SUM_INTRO_HTML,
  SUM_PREDICT_COPY,
  findQuestion,
  findStation,
  objectivesOfStation,
  questionsOfStation,
} from './unit2-lesson3-appendix-content.js';
import {
  BENCH_DEFAULTS,
  BENCH_LAYOUT_IDS,
  BENCH_VIEW,
  BOOK_PARALLEL_PRESET,
  BOOK_SERIES_PRESET,
  EMF_RANGE,
  MODEL_LIMITS,
  PROBE_CALLOUT,
  PROBE_LABEL_TEXT,
  SHARE_RANGE,
  SCENE_LABEL_ANCHORS,
  createCircuit,
  dipoleTrials,
  formatVoltage,
  parallelRelation,
  potentialDifference,
  probeCalloutBox,
  receiverInsideDrivenLoop,
  seriesConnectionFault,
  seriesRelation,
  voltmeterReading,
  withReference,
} from './unit2-lesson3-appendix-physics.js';
import {
  answerIsReady,
  answerProgress,
  appendixCoverageReport,
  checklistProgress,
  createAnswerState,
  createChecklistState,
  createStationFlow,
  goToStation,
  moveOrderItem,
  nextStation,
  previousStation,
  questionsIntegrityReport,
  retryAnswer,
  selectAnswer,
  setNumberAnswer,
  setProbe,
  stationAnswerProgress,
  stationHash,
  stationIdFromHash,
  stationNeighbours,
  stepStation,
  submitAnswer,
  toggleChecklistItem,
} from './unit2-lesson3-appendix-flow.js';

/* ============================================================ small helpers */

const modelBadge = () => `<p class="u2l3a-model-badge">${MODEL_LABEL}</p>`;
const sceneBadge = () => `<p class="u2l3a-scene-badge">${SCENE_LABEL}</p>`;
const sourceCard = (bodyHtml) => `
<div class="u2l3a-voice-card is-book"><p class="u2l3a-voice-label">${SOURCE_LABEL}</p>${bodyHtml}</div>`;
const platformCard = (bodyHtml) => `
<div class="u2l3a-voice-card is-platform"><p class="u2l3a-voice-label">${PLATFORM_LABEL}</p>${bodyHtml}</div>`;
const enrichmentCard = (bodyHtml) => `
<div class="u2l3a-voice-card is-enrich"><p class="u2l3a-voice-label">${ENRICHMENT_LABEL}</p>${bodyHtml}</div>`;
const limitsCard = () => `
<div class="u2l3a-limits-card"><p class="u2l3a-voice-label">افتراضات النموذج المثالي</p><ul>${MODEL_LIMITS.map((limit) => `<li>${limit}</li>`).join('')}</ul></div>`;
const ltr = (text) => `<bdi dir="ltr">${text}</bdi>`;
const num = (value) => ltr(formatVoltage(value));

/** The shared digital voltmeter widget: one big screen, unit always visible. */
const dmmMarkup = (id, caption) => `
<div class="u2l3a-dmm" data-dmm="${id}" role="group" aria-label="مقياس فولت رقمي">
  <p class="u2l3a-dmm-caption">${caption}</p>
  <div class="u2l3a-dmm-screen">
    <span class="u2l3a-dmm-value" data-dmm-value dir="ltr">—</span>
    <span class="u2l3a-dmm-unit" dir="ltr">V</span>
  </div>
  <p class="u2l3a-dmm-status" data-dmm-status></p>
  <p class="u2l3a-dmm-points" data-dmm-points></p>
</div>`;

function paintDmm(scope, id, { value, status, points }) {
  const widget = scope.querySelector(`[data-dmm="${id}"]`);
  if (!widget) return;
  widget.querySelector('[data-dmm-value]').textContent = value;
  widget.querySelector('[data-dmm-status]').textContent = status ?? '';
  widget.querySelector('[data-dmm-points]').textContent = points ?? '';
}

/* ====================================================== the bench scene SVG */

const labelText = (anchor, value) =>
  `<text class="${anchor.className}" x="${anchor.x}" y="${anchor.y}" text-anchor="middle" direction="rtl">${value}</text>`;

function wirePaths(circuit) {
  const { corners, topology } = circuit;
  const paths = [`M ${corners.left} ${corners.top} H ${corners.right} V ${corners.bottom} H ${corners.left} Z`];
  if (topology === 'parallel') {
    for (const x of [430, 570]) paths.push(`M ${x} ${corners.top} V ${corners.bottom}`);
  }
  return paths;
}

function sourceMarkup(circuit) {
  const { from, to, y } = circuit.source;
  const mid = (from + to) / 2;
  return `
  <g class="u2l3a-source" data-part="source">
    <rect x="${from}" y="${y - 20}" width="${to - from}" height="40" rx="8" />
    <line x1="${mid - 8}" y1="${y - 11}" x2="${mid - 8}" y2="${y + 11}" class="u2l3a-source-plate is-plus" />
    <line x1="${mid + 8}" y1="${y - 6}" x2="${mid + 8}" y2="${y + 6}" class="u2l3a-source-plate is-minus" />
    <text class="u2l3a-symbol-plus" x="${to - 16}" y="${y + 6}" text-anchor="middle" direction="ltr">+</text>
    <text class="u2l3a-symbol-minus" x="${from + 16}" y="${y + 6}" text-anchor="middle" direction="ltr">−</text>
  </g>`;
}

function lampMarkup(element, lit) {
  const { x, y, r } = element;
  return `
  <g class="u2l3a-lamp${lit ? ' is-lit' : ''}" data-part="${element.id}">
    ${lit ? `<circle class="u2l3a-lamp-glow" cx="${x}" cy="${y}" r="${r + 14}" />` : ''}
    <circle class="u2l3a-lamp-body" cx="${x}" cy="${y}" r="${r}" />
    <line x1="${x - r * 0.68}" y1="${y - r * 0.68}" x2="${x + r * 0.68}" y2="${y + r * 0.68}" />
    <line x1="${x - r * 0.68}" y1="${y + r * 0.68}" x2="${x + r * 0.68}" y2="${y - r * 0.68}" />
  </g>`;
}

function switchMarkup(element, closed) {
  const { x, y, r } = element;
  const vertical = element.id === 'sw' && Math.abs(x - 120) < 1;
  if (vertical) {
    return `
    <g class="u2l3a-switch${closed ? ' is-closed' : ''}" data-part="sw">
      <circle class="u2l3a-switch-dot" cx="${x}" cy="${y - r}" r="4" />
      <circle class="u2l3a-switch-dot" cx="${x}" cy="${y + r}" r="4" />
      <line class="u2l3a-switch-blade" x1="${x}" y1="${y + r}" x2="${closed ? x : x + r * 1.15}" y2="${closed ? y - r : y - r * 0.75}" />
    </g>`;
  }
  return `
  <g class="u2l3a-switch${closed ? ' is-closed' : ''}" data-part="sw">
    <circle class="u2l3a-switch-dot" cx="${x - r}" cy="${y}" r="4" />
    <circle class="u2l3a-switch-dot" cx="${x + r}" cy="${y}" r="4" />
    <line class="u2l3a-switch-blade" x1="${x - r}" y1="${y}" x2="${closed ? x + r : x + r * 0.75}" y2="${closed ? y : y - r * 1.15}" />
  </g>`;
}

function nodeMarkup(point, { red, black, referenceId, interactive = true, showLetter = true }) {
  const classes = ['u2l3a-node'];
  if (red === point.id) classes.push('is-red');
  if (black === point.id) classes.push('is-black');
  if (referenceId === point.id) classes.push('is-reference');
  const tag = interactive ? 'g' : 'g';
  return `
  <${tag} class="${classes.join(' ')}" data-node="${point.id}" ${interactive ? 'role="button" tabindex="0"' : ''}
    aria-label="نقطة القياس ${point.letter}: ${point.label}${red === point.id ? ' — عليها المجس الأحمر' : ''}${black === point.id ? ' — عليها المجس الأسود' : ''}">
    <circle class="u2l3a-node-halo" cx="${point.x}" cy="${point.y}" r="16" />
    <circle class="u2l3a-node-dot" cx="${point.x}" cy="${point.y}" r="8" />
    ${showLetter ? `<text class="u2l3a-node-letter" x="${point.x}" y="${point.y + 4}" text-anchor="middle" direction="ltr">${point.letter}</text>` : ''}
  </${tag}>`;
}

function probeMarkup(point, kind) {
  const box = probeCalloutBox(point);
  return `
  <g class="u2l3a-probe is-${kind}" aria-hidden="true">
    <line x1="${point.x}" y1="${point.y}" x2="${box.hx}" y2="${box.hy}" />
    <rect x="${box.x1}" y="${box.y1}" width="${box.width}" height="${box.height}" rx="${PROBE_CALLOUT.radius}" />
    <text x="${box.hx}" y="${box.hy + 4}" text-anchor="middle" direction="rtl">${PROBE_LABEL_TEXT[kind]}</text>
  </g>`;
}

/**
 * One bench scene. The wires, parts and glowing points all come from the solved
 * circuit, so a label can never disagree with the model.
 */
function benchSceneMarkup(circuit, options = {}) {
  const { red = null, black = null, referenceId = null, interactive = true, sceneId = 'bench' } = options;
  const anchors = SCENE_LABEL_ANCHORS[circuit.layout];
  const lamps = circuit.elements.filter((element) => element.kind === 'lamp');
  const switchElement = circuit.elements.find((element) => element.kind === 'switch');
  const labels = [];
  if (anchors.sourceTitle) labels.push(labelText(anchors.sourceTitle, 'المولّد'));
  if (anchors.terminalPositive) labels.push(labelText(anchors.terminalPositive, 'القطب الموجب'));
  if (anchors.terminalNegative) labels.push(labelText(anchors.terminalNegative, 'القطب السالب'));
  if (anchors.lampOne && lamps[0]) labels.push(labelText(anchors.lampOne, lamps[0].label));
  if (anchors.lampTwo && lamps[1]) labels.push(labelText(anchors.lampTwo, lamps[1].label));
  if (anchors.lampThree && lamps[2]) labels.push(labelText(anchors.lampThree, lamps[2].label));
  if (anchors.switchLabel) labels.push(labelText(anchors.switchLabel, circuit.closed ? 'قاطعة مغلقة' : 'قاطعة مفتوحة'));
  const probes = [];
  if (red) probes.push(probeMarkup(circuit.nodes.find((point) => point.id === red), 'red'));
  if (black) probes.push(probeMarkup(circuit.nodes.find((point) => point.id === black), 'black'));
  return `
  <svg class="u2l3a-scene" data-scene="${sceneId}" viewBox="0 0 ${BENCH_VIEW.width} ${BENCH_VIEW.height}" role="img"
    aria-label="لوحة دارة ${circuit.layout === 'parallel2' ? 'متفرعة' : 'متسلسلة'} بنقاط قياس مضيئة؛ المجس الأحمر والأسود يلمسان نقطتين لقراءة فرق الكمون بينهما.">
    <title>لوحة الدارة ونقاط القياس</title>
    <desc>رسم إثرائي توضيحي من المنصة: مولّد ومصابيح وقاطعة وأسلاك، مع نقاط قياس مضيئة بحروف لاتينية.</desc>
    <g class="u2l3a-wires">${wirePaths(circuit).map((d) => `<path d="${d}" />`).join('')}</g>
    ${sourceMarkup(circuit)}
    ${lamps.map((lamp) => lampMarkup(lamp, circuit.closed && lamp.u > 0)).join('')}
    ${switchMarkup(switchElement, circuit.closed)}
    <g class="u2l3a-nodes">${circuit.nodes.map((point) => nodeMarkup(point, { red, black, referenceId, interactive })).join('')}</g>
    <g class="u2l3a-probes">${probes.join('')}</g>
    <g class="u2l3a-labels">${labels.join('')}</g>
  </svg>`;
}

/* ================================================== station 1 — the meaning */

const PART_ROLES = Object.freeze({
  source: 'المولّد: ثنائي قطب فعّال يمدّ الدارة بالطاقة ويحافظ على فرق الكمون بين قطبيه.',
  l1: 'المصباح: ثنائي قطب غير فعّال يستقبل الطاقة ويحوّلها ضوءاً وحرارة؛ فرق الكمون عليه يظهر بين طرفيه.',
  sw: 'القاطعة: تفتح الدارة وتغلقها؛ مفتوحةً لا تيار، ومغلقةً فرق الكمون عليها صفر في النموذج المثالي.',
  wire: 'السلك: ناقل مثالي في النموذج؛ فرق الكمون بين أي نقطتين عليه صفر.',
});

function meaningMarkup() {
  const circuit = createCircuit({ layout: 'single', closed: true });
  return `
  <div class="u2l3a-station-intro">${MEANING_INTRO_HTML}</div>
  <div class="u2l3a-lab-grid">
    <div class="u2l3a-lab-stage">
      ${modelBadge()}
      ${benchSceneMarkup(circuit, { red: 'lin', black: 'lout', sceneId: 'meaning' })}
      ${sceneBadge()}
      <div class="u2l3a-lab-controls">
        <button class="u2l3a-button is-primary" type="button" data-meaning-measure>اقس فرق الكمون بين طرفي المصباح</button>
        <button class="u2l3a-button" type="button" data-meaning-switch>افتح القاطعة</button>
        <button class="u2l3a-button" type="button" data-meaning-reset>إعادة الضبط</button>
      </div>
      <p class="u2l3a-hint-line">اضغط على أي جزء من الرسم (المولّد، المصباح، القاطعة، السلك) لتقرأ دوره.</p>
    </div>
    <aside class="u2l3a-lab-side">
      ${dmmMarkup('meaning', 'شاشة مقياس الفولت')}
      <div class="u2l3a-part-role" data-meaning-role hidden></div>
      <div class="u2l3a-measure-note" data-meaning-note hidden></div>
    </aside>
  </div>
  <div class="u2l3a-voice-row">
    ${sourceCard(MEANING_BOOK_QUOTE_HTML)}
    ${platformCard(MEANING_PLATFORM_HTML)}
  </div>
  <div class="u2l3a-voice-row">
    ${enrichmentCard(MEANING_ENRICHMENT_HTML)}
    <div class="u2l3a-voice-card is-warn"><p class="u2l3a-voice-label">انتبه</p>${MEANING_NOT_CURRENT_HTML}</div>
  </div>
  <div class="u2l3a-questions" data-questions="meaning"></div>`;
}

function mountMeaning(panel) {
  let closed = true;
  let measured = false;
  const redraw = () => {
    const circuit = createCircuit({ layout: 'single', closed });
    const old = panel.querySelector('[data-scene="meaning"]');
    old.outerHTML = benchSceneMarkup(circuit, { red: 'lin', black: 'lout', sceneId: 'meaning' });
    bindSceneClicks();
    const reading = voltmeterReading(circuit, 'lin', 'lout');
    paintDmm(panel, 'meaning', {
      value: measured ? formatVoltage(reading.value) : '—',
      status: measured
        ? (closed ? 'الدارة مغلقة: المقياس يقرأ فرق الكمون بين طرفي المصباح.' : 'الدارة مفتوحة: لا تيار، وفرق الكمون على المصباح صفر، بينما يبقى فرق كمون المولّد بين قطبيه.')
        : 'اضغط زر القياس لقراءة فرق الكمون بين النقطتين B وC.',
      points: 'المجس الأحمر: B (طرف المصباح الأول) · المجس الأسود: C (طرف المصباح الثاني)',
    });
  };
  const bindSceneClicks = () => {
    panel.querySelectorAll('[data-scene="meaning"] [data-part], [data-scene="meaning"] .u2l3a-wires').forEach((part) => {
      part.addEventListener('click', () => {
        const key = part.dataset.part ?? 'wire';
        const role = PART_ROLES[key] ?? PART_ROLES.wire;
        const box = panel.querySelector('[data-meaning-role]');
        box.hidden = false;
        box.innerHTML = `<p class="u2l3a-voice-label">دور الجزء</p><p>${role}</p>`;
      });
    });
  };
  panel.querySelector('[data-meaning-measure]').addEventListener('click', () => { measured = true; redraw(); });
  panel.querySelector('[data-meaning-switch]').addEventListener('click', (event) => {
    closed = !closed;
    event.currentTarget.textContent = closed ? 'افتح القاطعة' : 'أغلق القاطعة';
    redraw();
  });
  panel.querySelector('[data-meaning-reset]').addEventListener('click', () => {
    closed = true; measured = false;
    panel.querySelector('[data-meaning-switch]').textContent = 'افتح القاطعة';
    panel.querySelector('[data-meaning-role]').hidden = true;
    panel.querySelector('[data-meaning-note]').hidden = true;
    redraw();
  });
  bindSceneClicks();
  redraw();
}

/* ============================================== station 2 — the probe bench */

function probesMarkup() {
  const circuit = createCircuit({ layout: 'series2', ...BENCH_DEFAULTS.series2 });
  return `
  <div class="u2l3a-station-intro">${PROBES_INTRO_HTML}</div>
  <div class="u2l3a-lab-grid is-wide">
    <div class="u2l3a-lab-stage">
      ${modelBadge()}
      <div data-probes-scene>${benchSceneMarkup(circuit, { sceneId: 'probes' })}</div>
      ${sceneBadge()}
      <div class="u2l3a-lab-controls">
        <button class="u2l3a-button is-warn" type="button" data-probes-fault>جرّب التوصيل الخاطئ (على التسلسل)</button>
        <button class="u2l3a-button" type="button" data-probes-add>أضف القراءة إلى جدول المقارنة</button>
        <button class="u2l3a-button" type="button" data-probes-reset>إعادة ضبط التجربة</button>
      </div>
    </div>
    <aside class="u2l3a-lab-side">
      ${dmmMarkup('probes', 'شاشة مقياس الفولت الكبيرة')}
      <div class="u2l3a-probe-pickers">
        <label class="u2l3a-picker is-red">المجس الأحمر
          <select data-probe-select="red"></select>
        </label>
        <label class="u2l3a-picker is-black">المجس الأسود
          <select data-probe-select="black"></select>
        </label>
        <p class="u2l3a-hint-line">أو اضغط نقطة مضيئة على اللوحة: الضغطة الأولى للأحمر والثانية للأسود.</p>
      </div>
      <div class="u2l3a-slider-block">
        <label>قوة المولّد (فرق الكمون بين قطبيه) <span data-probes-emf-out dir="ltr">6 V</span>
          <input type="range" data-probes-emf min="${EMF_RANGE.min}" max="${EMF_RANGE.max}" step="${EMF_RANGE.step}" value="6" />
        </label>
        <label>حصة المصباح الأول (مقاومة تمثيلية بالأوم) <span data-probes-share1-out dir="ltr">4 Ω</span>
          <input type="range" data-probes-share1 min="${SHARE_RANGE.min}" max="${SHARE_RANGE.max}" step="${SHARE_RANGE.step}" value="4" />
        </label>
        <label>حصة المصباح الثاني (مقاومة تمثيلية بالأوم) <span data-probes-share2-out dir="ltr">2 Ω</span>
          <input type="range" data-probes-share2 min="${SHARE_RANGE.min}" max="${SHARE_RANGE.max}" step="${SHARE_RANGE.step}" value="2" />
        </label>
        <label class="u2l3a-switch-row">
          <input type="checkbox" data-probes-closed checked />
          <span>القاطعة مغلقة (الدارة تعمل)</span>
        </label>
      </div>
      <div class="u2l3a-probe-message" data-probes-message aria-live="polite"></div>
    </aside>
  </div>
  <div class="u2l3a-table-block">
    <h3>جدول مقارنة القراءات</h3>
    <p class="u2l3a-hint-line">كل قراءة تُسجَّل مع نقطتيها وحالة الدارة، لتقارن بنفسك متى تتغير القراءة ومتى تثبت.</p>
    <table class="u2l3a-compare-table">
      <thead><tr><th>#</th><th>المجس الأحمر</th><th>المجس الأسود</th><th>القراءة (V)</th><th>حالة الدارة</th></tr></thead>
      <tbody data-probes-table><tr class="is-empty"><td colspan="5">لا قراءات بعد — ضع المجسّين ثم اضغط «أضف القراءة».</td></tr></tbody>
    </table>
  </div>
  <div class="u2l3a-voice-row">
    ${platformCard(PROBES_PARALLEL_HTML)}
    ${platformCard(PROBES_SIGN_HTML)}
  </div>
  ${limitsCard()}
  <div class="u2l3a-questions" data-questions="probes"></div>`;
}

function mountProbes(panel) {
  let state = {
    layout: 'series2',
    emf: 6,
    shares: [4, 2],
    closed: true,
    red: 'w1',
    black: 'mid',
    arm: 'black',
    fault: false,
    rows: [],
  };
  const sceneHost = panel.querySelector('[data-probes-scene]');
  const message = panel.querySelector('[data-probes-message]');
  const say = (text) => { message.innerHTML = `<p>${text}</p>`; };

  const circuit = () => createCircuit({ layout: state.layout, emf: state.emf, shares: state.shares, closed: state.closed });

  const fillSelects = () => {
    const nodes = circuit().nodes;
    for (const kind of ['red', 'black']) {
      const select = panel.querySelector(`[data-probe-select="${kind}"]`);
      select.innerHTML = nodes.map((point) => `<option value="${point.id}">${point.letter} — ${point.label}</option>`).join('');
      select.value = state[kind] ?? '';
    }
  };

  const describe = (reading) => {
    const c = circuit();
    const between = (a, b) => {
      const ids = [a, b].sort();
      return ids.join('-');
    };
    const pair = between(state.red, state.black);
    if (state.fault) return 'التوصيل على التسلسل قطع الدارة: المصباحان انطفأا والمقياس يقرأ فرق كمون المولّد كله تقريباً. أعد المقياس إلى التفرع.';
    if (!state.closed) return PROBES_MESSAGES.openCircuitZero;
    if (reading.equal) return PROBES_MESSAGES.sameWire;
    if (pair === between('pos', 'neg') || pair === between('neg', 'pos')) return PROBES_MESSAGES.acrossSource;
    if (pair.includes('w2') && pair.includes('w3')) return PROBES_MESSAGES.acrossOpenSwitch;
    return PROBES_MESSAGES.acrossLamp;
  };

  const redraw = (note) => {
    const c = circuit();
    const reading = state.fault ? null : voltmeterReading(c, state.red, state.black);
    sceneHost.innerHTML = benchSceneMarkup(c, { red: state.fault ? null : state.red, black: state.fault ? null : state.black, sceneId: 'probes' });
    paintDmm(panel, 'probes', {
      value: state.fault ? formatVoltage(seriesConnectionFault(c).meterReading) : formatVoltage(reading.value),
      status: state.fault
        ? 'توصيل خاطئ على التسلسل: الدارة مقطوعة والمصباحان مطفآن.'
        : describe(reading),
      points: state.fault
        ? 'المقياس داخل المسار — وهذا خطأ توصيل'
        : `المجس الأحمر: ${letterOf(state.red)} · المجس الأسود: ${letterOf(state.black)}`,
    });
    if (note) say(note);
  };

  const letterOf = (id) => circuit().nodes.find((point) => point.id === id)?.letter ?? '—';

  /* one delegated listener per scene host survives every redraw */
  const placeFromEvent = (event) => {
    const nodeEl = event.target.closest?.('[data-node]');
    if (!nodeEl) return;
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (event.type === 'keydown') event.preventDefault();
    const id = nodeEl.dataset.node;
    if (state.fault) { state.fault = false; panel.querySelector('[data-probes-fault]').classList.remove('is-active'); }
    if (state.arm === 'red') {
      state.red = id;
      if (state.black === id) state.black = null;
      state.arm = 'black';
      say(`المجس الأحمر عند النقطة ${letterOf(state.red)}. الآن اختر نقطة للمجس الأسود.`);
    } else {
      state.black = id;
      if (state.red === id) state.red = null;
      state.arm = 'red';
      say(`المجس الأسود عند النقطة ${letterOf(state.black)}. القراءة على الشاشة فرق الكمون بينهما.`);
    }
    syncSelects();
    redraw();
  };
  sceneHost.addEventListener('click', placeFromEvent);
  sceneHost.addEventListener('keydown', placeFromEvent);

  const syncSelects = () => {
    panel.querySelector('[data-probe-select="red"]').value = state.red ?? '';
    panel.querySelector('[data-probe-select="black"]').value = state.black ?? '';
  };

  fillSelects();
  for (const kind of ['red', 'black']) {
    panel.querySelector(`[data-probe-select="${kind}"]`).addEventListener('change', (event) => {
      const value = event.target.value;
      if (kind === 'red') { state.red = value; if (state.black === value) state.black = null; }
      else { state.black = value; if (state.red === value) state.red = null; }
      redraw(`نقل المجس ${kind === 'red' ? 'الأحمر' : 'الأسود'} إلى النقطة ${letterOf(value)}: القراءة الآن فرق الكمون بين النقطتين الجديدتين.`);
    });
  }
  panel.querySelector('[data-probes-emf]').addEventListener('input', (event) => {
    state.emf = Number(event.target.value);
    panel.querySelector('[data-probes-emf-out]').textContent = `${formatVoltage(state.emf)} V`;
    redraw(PROBES_MESSAGES.changedEmf);
  });
  for (const [index, key] of [['1', 0], ['2', 1]]) {
    panel.querySelector(`[data-probes-share${index}]`).addEventListener('input', (event) => {
      state.shares[key] = Number(event.target.value);
      panel.querySelector(`[data-probes-share${index}-out]`).textContent = `${event.target.value} Ω`;
      redraw(PROBES_MESSAGES.changedShare);
    });
  }
  panel.querySelector('[data-probes-closed]').addEventListener('change', (event) => {
    state.closed = event.target.checked;
    redraw(state.closed ? 'أُغلقت الدارة: عاد التيار إلى النموذج وعادت فروق الكمون على المصابيح.' : PROBES_MESSAGES.openCircuitZero);
  });
  panel.querySelector('[data-probes-fault]').addEventListener('click', (event) => {
    state.fault = !state.fault;
    event.currentTarget.classList.toggle('is-active', state.fault);
    redraw(state.fault
      ? 'وُصل المقياس داخل المسار (على التسلسل): قاطعَ الدارة تقريباً، فانطفأ المصباحان وقرأ المقياس فرق كمون المولّد. هذا سبب قاعدة التوصيل على التفرع.'
      : 'أُعيد المقياس إلى التوصيل الصحيح على التفرع بين النقطتين المختارتين.');
  });
  panel.querySelector('[data-probes-add]').addEventListener('click', () => {
    if (state.fault || !state.red || !state.black) { say('ضع المجسّين على نقطتين مختلفتين أولاً (وأعد المقياس إلى التفرع).'); return; }
    const c = circuit();
    const reading = voltmeterReading(c, state.red, state.black);
    state.rows = [...state.rows, { red: state.red, black: state.black, value: reading.value, closed: state.closed }];
    const body = panel.querySelector('[data-probes-table]');
    body.innerHTML = state.rows.map((row, index) => `<tr>
      <td dir="ltr">${index + 1}</td>
      <td>${letterOf(row.red)} — ${c.nodes.find((point) => point.id === row.red)?.label ?? ''}</td>
      <td>${letterOf(row.black)} — ${c.nodes.find((point) => point.id === row.black)?.label ?? ''}</td>
      <td dir="ltr">${formatVoltage(row.value)}</td>
      <td>${row.closed ? 'مغلقة' : 'مفتوحة'}</td></tr>`).join('');
    say('سُجّلت القراءة في جدول المقارنة مع نقطتيها وحالة الدارة.');
  });
  panel.querySelector('[data-probes-reset]').addEventListener('click', () => {
    state = { layout: 'series2', emf: 6, shares: [4, 2], closed: true, red: 'w1', black: 'mid', arm: 'black', fault: false, rows: [] };
    panel.querySelector('[data-probes-emf]').value = '6';
    panel.querySelector('[data-probes-emf-out]').textContent = '6 V';
    panel.querySelector('[data-probes-share1]').value = '4';
    panel.querySelector('[data-probes-share1-out]').textContent = '4 Ω';
    panel.querySelector('[data-probes-share2]').value = '2';
    panel.querySelector('[data-probes-share2-out]').textContent = '2 Ω';
    panel.querySelector('[data-probes-closed]').checked = true;
    panel.querySelector('[data-probes-fault]').classList.remove('is-active');
    panel.querySelector('[data-probes-table]').innerHTML = '<tr class="is-empty"><td colspan="5">لا قراءات بعد — ضع المجسّين ثم اضغط «أضف القراءة».</td></tr>';
    fillSelects();
    redraw('أُعيد ضبط التجربة: مولّد 6 V، حصتان 4 و2، قاطعة مغلقة، والمجسّان على B وC.');
  });
  redraw('المجسّان موضوعان على B وC: القراءة فرق الكمون على المصباح الأول. غيّر ما شئت وراقب الشاشة.');
}

/* ================================================= station 3 — the dipoles */

function dipolesMarkup() {
  return `
  <div class="u2l3a-station-intro">${DIPOLES_INTRO_HTML}</div>
  <div class="u2l3a-lab-grid">
    <div class="u2l3a-lab-stage">
      ${modelBadge()}
      <div class="u2l3a-dipole-pick" role="group" aria-label="اختر ثنائي القطب">
        <button class="u2l3a-dipole-tab is-active" type="button" data-dipole="source">المولّد</button>
        <button class="u2l3a-dipole-tab" type="button" data-dipole="lamp">المصباح</button>
      </div>
      <div class="u2l3a-dipole-symbol" data-dipole-symbol></div>
      <div class="u2l3a-lab-controls">
        <button class="u2l3a-button is-primary" type="button" data-dipole-trial-a>التجربة 1: قِس بين قطبيه وهو وحده</button>
        <button class="u2l3a-button" type="button" data-dipole-trial-b>التجربة 2: هل يسبب تياراً في دارة مغلقة؟</button>
        <button class="u2l3a-button" type="button" data-dipole-reset>إعادة الضبط</button>
      </div>
      ${sceneBadge()}
    </div>
    <aside class="u2l3a-lab-side">
      ${dmmMarkup('dipoles', 'فرق الكمون بين قطبي الثنائي')}
      <div class="u2l3a-trial-log" data-dipole-log aria-live="polite"></div>
      <div class="u2l3a-driven-note" data-dipole-driven hidden></div>
    </aside>
  </div>
  <div class="u2l3a-voice-row">
    ${sourceCard(DIPOLES_BOOK_QUOTE_HTML)}
    ${platformCard(DIPOLES_BASIS_HTML)}
  </div>
  ${enrichmentCard(DIPOLES_PLATFORM_HTML)}
  <div class="u2l3a-questions" data-questions="dipoles"></div>`;
}

const DIPPOLE_SYMBOLS = Object.freeze({
  source: `<svg viewBox="0 0 220 120" role="img" aria-label="رمز المولّد: دائرتان طويلتان وقصيرتان تمثلان قطبيه">
    <title>رمز المولّد</title>
    <line x1="20" y1="60" x2="80" y2="60" class="u2l3a-sym-wire" />
    <line x1="80" y1="26" x2="80" y2="94" class="u2l3a-sym-plate is-long" />
    <line x1="100" y1="42" x2="100" y2="78" class="u2l3a-sym-plate is-short" />
    <line x1="120" y1="26" x2="120" y2="94" class="u2l3a-sym-plate is-long" />
    <line x1="140" y1="42" x2="140" y2="78" class="u2l3a-sym-plate is-short" />
    <line x1="140" y1="60" x2="200" y2="60" class="u2l3a-sym-wire" />
    <text x="70" y="18" class="u2l3a-sym-sign" direction="ltr">+</text>
    <text x="146" y="18" class="u2l3a-sym-sign" direction="ltr">−</text>
  </svg>`,
  lamp: `<svg viewBox="0 0 220 120" role="img" aria-label="رمز المصباح: دائرة داخلها تقاطع">
    <title>رمز المصباح</title>
    <line x1="20" y1="60" x2="70" y2="60" class="u2l3a-sym-wire" />
    <circle cx="110" cy="60" r="40" class="u2l3a-sym-lamp" />
    <line x1="82" y1="32" x2="138" y2="88" class="u2l3a-sym-wire" />
    <line x1="82" y1="88" x2="138" y2="32" class="u2l3a-sym-wire" />
    <line x1="150" y1="60" x2="200" y2="60" class="u2l3a-sym-wire" />
  </svg>`,
});

function mountDipoles(panel) {
  let kind = 'source';
  const trials = { a: false, b: false };
  const log = panel.querySelector('[data-dipole-log]');
  const driven = panel.querySelector('[data-dipole-driven]');

  const refresh = () => {
    panel.querySelector('[data-dipole-symbol]').innerHTML = DIPPOLE_SYMBOLS[kind];
    panel.querySelectorAll('[data-dipole]').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.dipole === kind));
    const profile = dipoleTrials(kind, { emf: 6, lampResistance: 4 });
    const open = profile.trials[0];
    paintDmm(panel, 'dipoles', {
      value: trials.a ? formatVoltage(open.voltage) : '—',
      status: trials.a ? open.note : 'اضغط التجربة 1 لقياس فرق الكمون بين قطبي الثنائي وهو وحده.',
      points: kind === 'source' ? 'ثنائي قطب: مولّد' : 'ثنائي قطب: مصباح',
    });
    const lines = [];
    if (trials.a) lines.push(`<li><strong>التجربة 1:</strong> ${open.note} القراءة: ${num(open.voltage)} فولت.</li>`);
    if (trials.b) {
      const second = profile.trials[1];
      lines.push(`<li><strong>التجربة 2:</strong> ${second.note}${second.drivesCurrent ? ` التيّار في النموذج: ${num(second.current)} أمبير.` : ''}</li>`);
    }
    log.innerHTML = lines.length ? `<p class="u2l3a-voice-label">سجل التجربتين</p><ul>${lines.join('')}</ul>` : '';
    if (trials.a && trials.b) {
      const inside = receiverInsideDrivenLoop(kind, { emf: 6, lampResistance: 4, otherResistance: 2 });
      driven.hidden = false;
      driven.innerHTML = `<p class="u2l3a-voice-label">ولكن انتبه</p><p>${inside.note}
        ${kind === 'lamp' ? `في النموذج: ${num(inside.voltage)} فولت بين طرفيه.` : ''}</p>`;
    } else {
      driven.hidden = true;
    }
  };

  panel.querySelectorAll('[data-dipole]').forEach((tab) => tab.addEventListener('click', () => {
    kind = tab.dataset.dipole;
    trials.a = false; trials.b = false;
    refresh();
  }));
  panel.querySelector('[data-dipole-trial-a]').addEventListener('click', () => { trials.a = true; refresh(); });
  panel.querySelector('[data-dipole-trial-b]').addEventListener('click', () => { trials.b = true; refresh(); });
  panel.querySelector('[data-dipole-reset]').addEventListener('click', () => { trials.a = false; trials.b = false; refresh(); });
  refresh();
}

/* ============================================== station 4 — potential map */

function potentialsMarkup() {
  const circuit = createCircuit({ layout: 'series2', ...BENCH_DEFAULTS.series2 });
  return `
  <div class="u2l3a-station-intro">${POTENTIALS_INTRO_HTML}</div>
  <div class="u2l3a-lab-grid is-wide">
    <div class="u2l3a-lab-stage">
      ${modelBadge()}
      <div data-pot-scene>${benchSceneMarkup(circuit, { referenceId: 'neg', sceneId: 'potentials' })}</div>
      ${sceneBadge()}
      <div class="u2l3a-lab-controls">
        <label class="u2l3a-picker">النقطة المرجعية (كمونها صفر)
          <select data-pot-reference></select>
        </label>
        <button class="u2l3a-button" type="button" data-pot-add>أضف الزوج إلى جدول المقارنة</button>
      </div>
    </div>
    <aside class="u2l3a-lab-side">
      <div class="u2l3a-probe-pickers">
        <label class="u2l3a-picker is-red">النقطة الأولى
          <select data-pot-select="first"></select>
        </label>
        <label class="u2l3a-picker is-black">النقطة الثانية
          <select data-pot-select="second"></select>
        </label>
      </div>
      ${dmmMarkup('potentials', 'فرق الكمون بين النقطتين المختارتين')}
      <div class="u2l3a-pot-bars" data-pot-bars role="img" aria-label="أعمدة كمون النقاط بالنسبة إلى المرجع المختار"></div>
      <p class="u2l3a-hint-line" data-pot-hint></p>
    </aside>
  </div>
  <div class="u2l3a-table-block">
    <h3>مقارنة فروق الكمون بين أزواج النقاط</h3>
    <table class="u2l3a-compare-table">
      <thead><tr><th>#</th><th>النقطة الأولى</th><th>النقطة الثانية</th><th>فرق الكمون (V)</th></tr></thead>
      <tbody data-pot-table><tr class="is-empty"><td colspan="4">اختر نقطتين ثم أضف الزوج للمقارنة.</td></tr></tbody>
    </table>
  </div>
  <div class="u2l3a-voice-row">
    ${platformCard(POTENTIALS_PLATFORM_HTML)}
    ${enrichmentCard(POTENTIALS_ENRICHMENT_HTML)}
  </div>
  <div class="u2l3a-questions" data-questions="potentials"></div>`;
}

function mountPotentials(panel) {
  let state = { reference: 'neg', first: 'pos', second: 'mid', arm: 'second', rows: [] };
  const circuit = () => withReference(createCircuit({ layout: 'series2', ...BENCH_DEFAULTS.series2 }), state.reference);
  const sceneHost = panel.querySelector('[data-pot-scene]');
  const letterOf = (id) => createCircuit({ layout: 'series2' }).nodes.find((point) => point.id === id)?.letter ?? '—';

  const fillSelects = () => {
    const nodes = createCircuit({ layout: 'series2' }).nodes;
    const referenceSelect = panel.querySelector('[data-pot-reference]');
    referenceSelect.innerHTML = nodes.map((point) => `<option value="${point.id}">${point.letter} — ${point.label}</option>`).join('');
    referenceSelect.value = state.reference;
    for (const [key, select] of [['first', '[data-pot-select="first"]'], ['second', '[data-pot-select="second"]']]) {
      const element = panel.querySelector(select);
      element.innerHTML = nodes.map((point) => `<option value="${point.id}">${point.letter} — ${point.label}</option>`).join('');
      element.value = state[key];
    }
  };

  const bars = (c) => {
    const max = Math.max(...c.nodes.map((point) => Math.abs(point.potential)), 1);
    return c.nodes.map((point) => {
      const height = Math.round((Math.abs(point.potential) / max) * 84);
      const negative = point.potential < -1e-9;
      return `<div class="u2l3a-pot-bar${negative ? ' is-negative' : ''}" title="${point.label}: ${formatVoltage(point.potential)} V">
        <span class="u2l3a-pot-bar-value" dir="ltr">${formatVoltage(point.potential)}</span>
        <span class="u2l3a-pot-bar-fill" style="height:${Math.max(4, height)}px"></span>
        <span class="u2l3a-pot-bar-letter" dir="ltr">${point.letter}</span>
      </div>`;
    }).join('');
  };

  const redraw = () => {
    const c = circuit();
    sceneHost.innerHTML = benchSceneMarkup(c, { referenceId: state.reference, red: state.first, black: state.second, sceneId: 'potentials' });
    const value = potentialDifference(c, state.first, state.second);
    paintDmm(panel, 'potentials', {
      value: formatVoltage(value),
      status: `كمون ${letterOf(state.first)} ناقص كمون ${letterOf(state.second)} بالنسبة إلى المرجع ${letterOf(state.reference)}.`,
      points: `المرجع: ${letterOf(state.reference)} · الأولى: ${letterOf(state.first)} · الثانية: ${letterOf(state.second)}`,
    });
    panel.querySelector('[data-pot-bars]').innerHTML = bars(c);
    panel.querySelector('[data-pot-hint]').textContent = 'غيّر المرجع: الأعمدة تنزح كلها معاً، وقراءة فرق الكمون فوق لا تتغير.';
  };

  const pickFromEvent = (event) => {
    const nodeEl = event.target.closest?.('[data-node]');
    if (!nodeEl) return;
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (event.type === 'keydown') event.preventDefault();
    const id = nodeEl.dataset.node;
    if (state.arm === 'first') {
      state.first = id;
      if (state.second === id) state.second = null;
      state.arm = 'second';
    } else {
      state.second = id;
      if (state.first === id) state.first = null;
      state.arm = 'first';
    }
    syncSelects();
    redraw();
  };
  sceneHost.addEventListener('click', pickFromEvent);
  sceneHost.addEventListener('keydown', pickFromEvent);

  const syncSelects = () => {
    panel.querySelector('[data-pot-select="first"]').value = state.first ?? '';
    panel.querySelector('[data-pot-select="second"]').value = state.second ?? '';
  };

  fillSelects();
  panel.querySelector('[data-pot-reference]').addEventListener('change', (event) => { state.reference = event.target.value; redraw(); });
  panel.querySelector('[data-pot-select="first"]').addEventListener('change', (event) => {
    state.first = event.target.value;
    if (state.second === state.first) state.second = null;
    redraw();
  });
  panel.querySelector('[data-pot-select="second"]').addEventListener('change', (event) => {
    state.second = event.target.value;
    if (state.second === state.first) state.first = null;
    redraw();
  });
  panel.querySelector('[data-pot-add]').addEventListener('click', () => {
    if (!state.first || !state.second) return;
    const c = circuit();
    const value = potentialDifference(c, state.first, state.second);
    state.rows = [...state.rows, { first: state.first, second: state.second, value }];
    panel.querySelector('[data-pot-table]').innerHTML = state.rows.map((row, index) => `<tr>
      <td dir="ltr">${index + 1}</td><td>${letterOf(row.first)}</td><td>${letterOf(row.second)}</td>
      <td dir="ltr">${formatVoltage(row.value)}</td></tr>`).join('');
  });
  redraw();
}

/* ====================================== station 5 — total versus partial */

function sumMarkup() {
  const circuit = createCircuit({ layout: 'series2', ...BENCH_DEFAULTS.series2 });
  return `
  <div class="u2l3a-station-intro">${SUM_INTRO_HTML}</div>
  <div class="u2l3a-lab-grid is-wide">
    <div class="u2l3a-lab-stage">
      ${modelBadge()}
      <div class="u2l3a-dipole-pick" role="group" aria-label="اختر شكل الدارة">
        <button class="u2l3a-dipole-tab is-active" type="button" data-sum-layout="series2">مصباحان على التسلسل</button>
        <button class="u2l3a-dipole-tab" type="button" data-sum-layout="series3">ثلاثة على التسلسل</button>
        <button class="u2l3a-dipole-tab" type="button" data-sum-layout="parallel2">مصباحان على التفرع</button>
      </div>
      <div data-sum-scene>${benchSceneMarkup(circuit, { sceneId: 'sum' })}</div>
      ${sceneBadge()}
      <div class="u2l3a-lab-controls">
        <button class="u2l3a-button" type="button" data-sum-book-series>نشاط الكتاب ص102 (12 V و5 V)</button>
        <button class="u2l3a-button" type="button" data-sum-book-parallel>نشاط الكتاب ص103 (6 V)</button>
        <button class="u2l3a-button" type="button" data-sum-reset>إعادة الضبط</button>
      </div>
    </div>
    <aside class="u2l3a-lab-side">
      <div class="u2l3a-slider-block" data-sum-sliders></div>
      <div class="u2l3a-predict-block">
        <p class="u2l3a-voice-label">${SUM_PREDICT_COPY.prompt}</p>
        <div class="u2l3a-predict-row">
          <input type="text" inputmode="decimal" data-sum-predict aria-label="توقعك بوحدة الفولت" />
          <span dir="ltr">V</span>
          <button class="u2l3a-button is-primary" type="button" data-sum-predict-submit>سجّل التوقع</button>
        </div>
        <button class="u2l3a-button" type="button" data-sum-measure>${SUM_PREDICT_COPY.reveal}</button>
        <div class="u2l3a-predict-result" data-sum-result aria-live="polite"></div>
      </div>
    </aside>
  </div>
  <div class="u2l3a-relation-block" data-sum-relation></div>
  <div class="u2l3a-voice-row">
    ${sourceCard(SUM_BOOK_QUOTE_HTML)}
    ${platformCard(SUM_CONDITION_HTML)}
  </div>
  <div class="u2l3a-questions" data-questions="sum"></div>`;
}

function mountSum(panel) {
  let state = { layout: 'series2', emf: 6, shares: [4, 2], prediction: null, revealed: false };
  const sceneHost = panel.querySelector('[data-sum-scene]');
  const slidersHost = panel.querySelector('[data-sum-sliders]');
  const relationHost = panel.querySelector('[data-sum-relation]');
  const result = panel.querySelector('[data-sum-result]');

  const lampCount = () => (state.layout === 'series3' ? 3 : 2);
  const circuit = () => createCircuit({ layout: state.layout, emf: state.emf, shares: state.shares.slice(0, lampCount()) });

  const sliders = () => {
    slidersHost.innerHTML = `
      <label>قوة المولّد <span data-sum-emf-out dir="ltr">${formatVoltage(state.emf)} V</span>
        <input type="range" data-sum-emf min="${EMF_RANGE.min}" max="${EMF_RANGE.max}" step="${EMF_RANGE.step}" value="${state.emf}" />
      </label>
      ${state.shares.slice(0, lampCount()).map((share, index) => `
      <label>حصة المصباح ${index + 1} (أوم) <span data-sum-share-out="${index}" dir="ltr">${share} Ω</span>
        <input type="range" data-sum-share="${index}" min="${SHARE_RANGE.min}" max="${SHARE_RANGE.max}" step="${SHARE_RANGE.step}" value="${share}" />
      </label>`).join('')}`;
    slidersHost.querySelector('[data-sum-emf]').addEventListener('input', (event) => {
      state.emf = Number(event.target.value);
      state.revealed = false;
      slidersHost.querySelector('[data-sum-emf-out]').textContent = `${formatVoltage(state.emf)} V`;
      redraw();
    });
    slidersHost.querySelectorAll('[data-sum-share]').forEach((input) => input.addEventListener('input', (event) => {
      const index = Number(event.target.dataset.sumShare);
      state.shares[index] = Number(event.target.value);
      state.revealed = false;
      slidersHost.querySelector(`[data-sum-share-out="${index}"]`).textContent = `${event.target.value} Ω`;
      redraw();
    }));
  };

  const relation = () => {
    const c = circuit();
    if (c.topology === 'series') {
      const rel = seriesRelation(c);
      const partialLines = rel.partials.map((partial, index) =>
        `<li>فرق الكمون على المصباح ${index + 1} (${ltr(`U_{${index + 1}}`)}): <strong dir="ltr">${state.revealed ? `${formatVoltage(partial.value)} V` : '؟'}</strong></li>`).join('');
      return `
      <div class="u2l3a-relation-card">
        <h3>العلاقة في الدارة المتسلسلة ${state.revealed ? '' : '(القراءة مخفية حتى تقيس)'}</h3>
        ${SERIES_RULE_GENERAL_HTML}
        <ul class="u2l3a-relation-list">${partialLines}
          <li>مجموع الفروق الجزئية: <strong dir="ltr">${state.revealed ? `${formatVoltage(rel.total)} V` : '؟'}</strong></li>
          <li>فرق الكمون بين قطبي المولّد: <strong dir="ltr">${state.revealed ? `${formatVoltage(rel.sourceVoltage)} V` : '؟'}</strong></li>
        </ul>
        <p class="u2l3a-relation-verdict">${state.revealed ? (rel.holds ? '✓ العلاقة محققة: المجموع يساوي فرق كمون المولّد.' : rel.reason) : 'اضغط «قِس الآن» لكشف القراءات ومقارنتها بتوقعك.'}</p>
      </div>`;
    }
    const rel = parallelRelation(c);
    return `
    <div class="u2l3a-relation-card">
      <h3>العلاقة في الدارة المتفرعة</h3>
      ${PARALLEL_RULE_HTML}
      <ul class="u2l3a-relation-list">
        ${rel.branches.map((branch, index) => `<li>فرق الكمون على الفرع ${index + 1}: <strong dir="ltr">${formatVoltage(branch.value)} V</strong></li>`).join('')}
        <li>فرق الكمون بين قطبي المولّد: <strong dir="ltr">${formatVoltage(rel.total)} V</strong></li>
      </ul>
      <p class="u2l3a-relation-verdict">${rel.reason} هنا لا تُجمع الفروق: كل فرع بين العقدتين نفسيهما.</p>
    </div>`;
  };

  const redraw = () => {
    const c = circuit();
    sceneHost.innerHTML = benchSceneMarkup(c, { sceneId: 'sum' });
    relationHost.innerHTML = relation();
  };

  panel.querySelectorAll('[data-sum-layout]').forEach((tab) => tab.addEventListener('click', () => {
    state.layout = tab.dataset.sumLayout;
    state.revealed = false;
    state.prediction = null;
    result.innerHTML = '';
    panel.querySelectorAll('[data-sum-layout]').forEach((other) => other.classList.toggle('is-active', other === tab));
    sliders();
    redraw();
  }));
  panel.querySelector('[data-sum-book-series]').addEventListener('click', () => {
    state = { ...state, layout: 'series2', emf: BOOK_SERIES_PRESET.emf, shares: [...BOOK_SERIES_PRESET.shares], revealed: true };
    panel.querySelectorAll('[data-sum-layout]').forEach((other) => other.classList.toggle('is-active', other.dataset.sumLayout === 'series2'));
    sliders();
    redraw();
    result.innerHTML = `<p>ضُبط النموذج على قيم نشاط الكتاب ص102: مولّد ${num(12)} فولت، وعلى المصباح الثاني ${num(5)} فولت، فيقرأ الأول ${num(7)} فولت — والتحقق ${ltr('7+5=12')}.</p>`;
  });
  panel.querySelector('[data-sum-book-parallel]').addEventListener('click', () => {
    state = { ...state, layout: 'parallel2', emf: BOOK_PARALLEL_PRESET.emf, shares: [...BOOK_PARALLEL_PRESET.shares], revealed: true };
    panel.querySelectorAll('[data-sum-layout]').forEach((other) => other.classList.toggle('is-active', other.dataset.sumLayout === 'parallel2'));
    sliders();
    redraw();
    result.innerHTML = `<p>ضُبط النموذج على نشاط الكتاب ص103: مولّد ${num(6)} فولت، وفرق الكمون على كل فرع ${num(6)} فولت.</p>`;
  });
  panel.querySelector('[data-sum-reset]').addEventListener('click', () => {
    state = { layout: 'series2', emf: 6, shares: [4, 2], prediction: null, revealed: false };
    panel.querySelectorAll('[data-sum-layout]').forEach((other) => other.classList.toggle('is-active', other.dataset.sumLayout === 'series2'));
    panel.querySelector('[data-sum-predict]').value = '';
    result.innerHTML = '';
    sliders();
    redraw();
  });
  panel.querySelector('[data-sum-predict-submit]').addEventListener('click', () => {
    const raw = panel.querySelector('[data-sum-predict]').value.trim();
    if (raw === '') { result.innerHTML = `<p>اكتب توقعك عدداً أولاً (مثال: 6).</p>`; return; }
    const value = Number(raw.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))));
    if (!Number.isFinite(value)) { result.innerHTML = '<p>المدخل غير صالح: اكتب رقماً بالأرقام فقط.</p>'; return; }
    state.prediction = value;
    result.innerHTML = `<p>سُجّل توقعك: ${num(value)} فولت. اضغط «${SUM_PREDICT_COPY.reveal}» ثم قارن.</p>`;
  });
  panel.querySelector('[data-sum-measure]').addEventListener('click', () => {
    state.revealed = true;
    const c = circuit();
    const rel = c.topology === 'series' ? seriesRelation(c) : parallelRelation(c);
    const total = c.topology === 'series' ? rel.total : rel.total;
    if (state.prediction === null) {
      result.innerHTML = `<p>القراءة المحسوبة: المجموع ${num(total)} فولت. لم تسجّل توقعاً هذه المرة — جرّب مرة أخرى وتوقّع قبل القياس.</p>`;
    } else {
      const diff = Math.abs(state.prediction - total);
      result.innerHTML = diff < 1e-9
        ? `<p>${SUM_PREDICT_COPY.correct} توقعك ${num(state.prediction)} والقراءة ${num(total)} فولت.</p>`
        : `<p>${SUM_PREDICT_COPY.wrong} توقعك ${num(state.prediction)} والقراءة ${num(total)} فولت، والفرق ${num(diff)} فولت. ${SUM_PREDICT_COPY.hint}</p>`;
    }
    redraw();
  });
  sliders();
  redraw();
}

/* ================================================= station 7 — concept map */

function mapMarkup() {
  return `
  <div class="u2l3a-map-wrap">
    ${CONCEPT_INTRO_HTML ? `<div class="u2l3a-map-intro">${CONCEPT_INTRO_HTML}</div>` : ''}
    <div class="u2l3a-map-grid">
      <svg class="u2l3a-map-svg" viewBox="0 0 780 490" role="img" aria-label="خريطة مفاهيم الدرس: سبع عقد وروابطها">
        <title>خريطة مفاهيم فرق الكمون</title>
        <g class="u2l3a-map-links">${CONCEPT_LINKS.map((link) => {
    const from = CONCEPT_NODES.find((node) => node.id === link.from);
    const to = CONCEPT_NODES.find((node) => node.id === link.to);
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />
      <text class="u2l3a-map-link-label" x="${mx}" y="${my - 6}" text-anchor="middle" direction="rtl">${link.label}</text>`;
  }).join('')}</g>
        <g class="u2l3a-map-nodes">${CONCEPT_NODES.map((node, index) => `
          <g class="u2l3a-map-node is-${node.source}${index === 0 ? ' is-active' : ''}" data-map-node="${node.id}" role="button" tabindex="0" aria-label="المفهوم: ${node.label}">
            <rect x="${node.x - 92}" y="${node.y - 26}" width="184" height="52" rx="12" />
            <text x="${node.x}" y="${node.y - 2}" text-anchor="middle" direction="rtl">${node.label}</text>
            <text class="u2l3a-map-node-hint" x="${node.x}" y="${node.y + 16}" text-anchor="middle" direction="rtl">${CONCEPT_MAP_LEGEND.nodeHint}</text>
          </g>`).join('')}</g>
      </svg>
      <div class="u2l3a-map-cards">
        <p class="u2l3a-map-legend"><span class="is-book"></span> ${CONCEPT_MAP_LEGEND.book} · <span class="is-platform"></span> ${CONCEPT_MAP_LEGEND.platform}</p>
        ${CONCEPT_NODES.map((node, index) => `
        <div class="u2l3a-map-card is-${node.source}" data-map-card="${node.id}"${index === 0 ? '' : ' hidden'}>
          <h3>${node.label}</h3>
          <p>${node.summary}</p>
          <p class="u2l3a-map-example"><strong>مثال:</strong> ${node.example}</p>
          <p class="u2l3a-voice-label">${node.source === 'book' ? SOURCE_LABEL + (node.page ? ` · ص${node.page}` : '') : PLATFORM_LABEL}</p>
          <button class="u2l3a-button" type="button" data-map-open="${node.stationId}">افتح المحطة التي تدرّب عليه</button>
        </div>`).join('')}
      </div>
    </div>
    <section class="u2l3a-checklist" aria-labelledby="checklist-heading">
      <h3 id="checklist-heading">${CHECKLIST_HEADING}</h3>
      <p>${CHECKLIST_INTRO}</p>
      <div class="u2l3a-checklist-track" role="progressbar" aria-label="التحقق الذاتي من الأهداف" aria-valuemin="0" aria-valuemax="4" aria-valuenow="0">
        <span data-checklist-fill></span>
      </div>
      <p class="u2l3a-checklist-count" data-checklist-count>0 من 4</p>
      <ul class="u2l3a-checklist-list">
        ${CHECKLIST_ITEMS.map((item) => `
        <li>
          <label class="u2l3a-check-row">
            <input type="checkbox" data-checklist-item="${item.id}" />
            <span>${item.label}</span>
          </label>
          <button class="u2l3a-check-open" type="button" data-checklist-open="${item.stationId}">عد إلى المحطة</button>
        </li>`).join('')}
      </ul>
      <div class="u2l3a-checklist-verdict" data-checklist-verdict></div>
      ${SUMMARY_CLOSING_HTML}
    </section>
  </div>`;
}

function mountMap(panel, context) {
  let checklist = createChecklistState();
  const paintChecklist = () => {
    const progress = checklistProgress(checklist);
    panel.querySelector('[data-checklist-count]').textContent = `${progress.done} من ${progress.total}`;
    panel.querySelector('.u2l3a-checklist-track').setAttribute('aria-valuenow', String(progress.done));
    panel.querySelector('[data-checklist-fill]').style.width = `${progress.percent}%`;
    panel.querySelector('[data-checklist-verdict]').innerHTML = progress.complete ? CHECKLIST_DONE_HTML : CHECKLIST_PARTIAL_HTML;
  };
  panel.querySelectorAll('[data-map-node]').forEach((nodeEl) => {
    const open = () => {
      const id = nodeEl.dataset.mapNode;
      panel.querySelectorAll('[data-map-card]').forEach((card) => { card.hidden = card.dataset.mapCard !== id; });
      panel.querySelectorAll('[data-map-node]').forEach((other) => other.classList.toggle('is-active', other === nodeEl));
    };
    nodeEl.addEventListener('click', open);
    nodeEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
  });
  panel.querySelectorAll('[data-map-open]').forEach((button) => button.addEventListener('click', () => context.openStation(button.dataset.mapOpen, true)));
  panel.querySelectorAll('[data-checklist-open]').forEach((button) => button.addEventListener('click', () => context.openStation(button.dataset.checklistOpen, true)));
  panel.querySelectorAll('[data-checklist-item]').forEach((input) => input.addEventListener('change', () => {
    checklist = toggleChecklistItem(checklist, input.dataset.checklistItem);
    paintChecklist();
  }));
  paintChecklist();
}

/* ==================================================== shared question block */

function probeQuestionScene(question, state) {
  const circuit = createCircuit(question.circuit);
  return `
  <div class="u2l3a-probe-question">
    <div class="u2l3a-probe-arms" role="group" aria-label="اختر المجس الذي ستضعه">
      <button class="u2l3a-button is-red${state.arm === 'red' ? ' is-active' : ''}" type="button" data-probe-arm="red">أمسك المجس الأحمر</button>
      <button class="u2l3a-button is-black${state.arm === 'black' ? ' is-active' : ''}" type="button" data-probe-arm="black">أمسك المجس الأسود</button>
    </div>
    <div data-probe-scene>${benchSceneMarkup(circuit, { red: state.red, black: state.black, sceneId: `q-${question.id}` })}</div>
    ${sceneBadge()}
    <div class="u2l3a-probe-pickers">
      <label class="u2l3a-picker is-red">المجس الأحمر<select data-probe-select="red"></select></label>
      <label class="u2l3a-picker is-black">المجس الأسود<select data-probe-select="black"></select></label>
    </div>
  </div>`;
}

function questionMarkup(question) {
  const badge = question.source === 'book'
    ? `<span class="u2l3a-q-badge is-book">${SOURCE_LABEL}${question.pageRef ? ` · ص${question.pageRef}` : ''}</span>`
    : `<span class="u2l3a-q-badge is-platform">من إعداد المنصة</span>`;
  let body = '';
  if (question.kind === 'choice') {
    body = `<div class="u2l3a-choices" role="group" aria-label="خيارات الإجابة">
      ${question.choices.map((item) => `
      <label class="u2l3a-choice">
        <input type="radio" name="q-${question.id}" data-choice="${item.id}" />
        <span>${item.html}</span>
      </label>`).join('')}
    </div>`;
  } else if (question.kind === 'order') {
    body = `<ol class="u2l3a-order" data-order>${'{ITEMS}'}</ol>
      <p class="u2l3a-hint-line">${DETECTIVE_ORDER_HINT}</p>`;
  } else if (question.kind === 'number') {
    body = `<div class="u2l3a-number-row">
      <input type="text" inputmode="decimal" data-number-input aria-label="إجابتك العددية" />
      <span class="u2l3a-number-unit" dir="ltr">${question.unit}</span>
    </div>`;
  } else if (question.kind === 'probe') {
    body = '{PROBE}';
  }
  return `
  <article class="u2l3a-question" data-question="${question.id}" data-kind="${question.kind}">
    <header class="u2l3a-question-head">${badge}<h4>${question.prompt}</h4></header>
    ${body}
    <div class="u2l3a-question-actions">
      <button class="u2l3a-button is-primary" type="button" data-question-submit>تحقّق</button>
      <button class="u2l3a-button" type="button" data-question-retry>${DETECTIVE_RETRY_LABEL}</button>
    </div>
    <div class="u2l3a-feedback" data-question-feedback aria-live="polite"></div>
  </article>`;
}

function mountQuestions(panel, context) {
  const host = panel.querySelector('.u2l3a-questions');
  if (!host) return;
  const stationId = host.dataset.questions;
  const questions = questionsOfStation(stationId);
  const states = {};

  host.innerHTML = `<h3 class="u2l3a-questions-title">أسئلة المحطة وتفسيراتها</h3>` + questions.map((question) => {
    let markup = questionMarkup(question);
    if (question.kind === 'order') {
      const state = createAnswerState(question.id);
      markup = markup.replace('{ITEMS}', state.order.map((itemId) => orderRowMarkup(question, itemId)).join(''));
    }
    if (question.kind === 'probe') {
      const state = { ...createAnswerState(question.id), arm: 'red' };
      markup = markup.replace('{PROBE}', probeQuestionScene(question, state));
    }
    return markup;
  }).join('');

  function orderRowMarkup(question, itemId) {
    const item = question.items.find((candidate) => candidate.id === itemId);
    return `<li class="u2l3a-order-item" data-order-item="${itemId}">
      <span>${item.label}</span>
      <span class="u2l3a-order-controls">
        <button class="u2l3a-icon-button" type="button" data-order-delta="-1" aria-label="انقل العبارة لأعلى">▲</button>
        <button class="u2l3a-icon-button" type="button" data-order-delta="1" aria-label="انقل لأسفل">▼</button>
      </span>
    </li>`;
  }

  const articleOf = (questionId) => host.querySelector(`[data-question="${questionId}"]`);

  const paintProbe = (question, state) => {
    const article = articleOf(question.id);
    const sceneHost = article.querySelector('[data-probe-scene]');
    const circuit = createCircuit(question.circuit);
    sceneHost.innerHTML = benchSceneMarkup(circuit, { red: state.red, black: state.black, sceneId: `q-${question.id}` });
    for (const kind of ['red', 'black']) {
      const select = article.querySelector(`[data-probe-select="${kind}"]`);
      select.innerHTML = circuit.nodes.map((point) => `<option value="${point.id}">${point.letter} — ${point.label}</option>`).join('');
      select.value = state[kind] ?? '';
    }
    article.querySelectorAll('[data-probe-arm]').forEach((button) => button.classList.toggle('is-active', button.dataset.probeArm === state.arm));
  };

  /* delegated placement: survives every scene repaint */
  const bindProbeQuestion = (question) => {
    const article = articleOf(question.id);
    const sceneHost = article.querySelector('[data-probe-scene]');
    const place = (event) => {
      const nodeEl = event.target.closest?.('[data-node]');
      if (!nodeEl) return;
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      if (event.type === 'keydown') event.preventDefault();
      const arm = states[question.id].arm;
      states[question.id] = setProbe(states[question.id], arm, nodeEl.dataset.node);
      states[question.id] = { ...states[question.id], arm: arm === 'red' ? 'black' : 'red' };
      article.querySelector('[data-question-feedback]').innerHTML = '';
      delete article.dataset.status;
      paintProbe(question, states[question.id]);
    };
    sceneHost.addEventListener('click', place);
    sceneHost.addEventListener('keydown', place);
    for (const kind of ['red', 'black']) {
      article.querySelector(`[data-probe-select="${kind}"]`).addEventListener('change', (event) => {
        states[question.id] = setProbe(states[question.id], kind, event.target.value);
        paintProbe(question, states[question.id]);
      });
    }
    article.querySelectorAll('[data-probe-arm]').forEach((button) => button.addEventListener('click', () => {
      states[question.id] = { ...states[question.id], arm: button.dataset.probeArm };
      paintProbe(question, states[question.id]);
    }));
  };

  const paintOrder = (question, state) => {
    const list = articleOf(question.id).querySelector('[data-order]');
    list.innerHTML = state.order.map((itemId) => orderRowMarkup(question, itemId)).join('');
    bindOrder(question, state);
  };

  const bindOrder = (question, state) => {
    articleOf(question.id).querySelectorAll('[data-order-item]').forEach((row) => {
      row.querySelectorAll('[data-order-delta]').forEach((button) => button.addEventListener('click', () => {
        states[question.id] = moveOrderItem(states[question.id], row.dataset.orderItem, Number(button.dataset.orderDelta));
        paintOrder(question, states[question.id]);
      }));
    });
  };

  for (const question of questions) {
    states[question.id] = question.kind === 'probe'
      ? { ...createAnswerState(question.id), arm: 'red' }
      : createAnswerState(question.id);
    const article = articleOf(question.id);
    if (question.kind === 'choice') {
      article.querySelectorAll('[data-choice]').forEach((input) => input.addEventListener('change', () => {
        states[question.id] = selectAnswer(states[question.id], input.dataset.choice);
        article.querySelector('[data-question-feedback]').innerHTML = '';
        delete article.dataset.status;
      }));
    } else if (question.kind === 'number') {
      article.querySelector('[data-number-input]').addEventListener('input', (event) => {
        states[question.id] = setNumberAnswer(states[question.id], event.target.value);
        article.querySelector('[data-question-feedback]').innerHTML = '';
        delete article.dataset.status;
      });
    } else if (question.kind === 'order') {
      bindOrder(question, states[question.id]);
    } else if (question.kind === 'probe') {
      paintProbe(question, states[question.id]);
      bindProbeQuestion(question);
    }
    article.querySelector('[data-question-submit]').addEventListener('click', () => {
      states[question.id] = submitAnswer(states[question.id]);
      const state = states[question.id];
      article.dataset.status = state.status ?? 'needs-input';
      article.querySelector('[data-question-feedback]').innerHTML = state.needsInput
        ? '<p class="u2l3a-feedback-headline">أكمل الإدخال أولاً: اختر إجابة أو ضع المجسّين أو اكتب قيمة.</p>'
        : state.feedbackHtml;
      context.registerAnswer(question.id, state);
    });
    article.querySelector('[data-question-retry]').addEventListener('click', () => {
      states[question.id] = retryAnswer(states[question.id]);
      const article2 = articleOf(question.id);
      delete article2.dataset.status;
      article2.querySelector('[data-question-feedback]').innerHTML = '';
      if (question.kind === 'choice') article2.querySelectorAll('[data-choice]').forEach((input) => { input.checked = false; });
      if (question.kind === 'number') article2.querySelector('[data-number-input]').value = '';
      if (question.kind === 'order') paintOrder(question, states[question.id]);
      if (question.kind === 'probe') paintProbe(question, states[question.id]);
      context.registerAnswer(question.id, states[question.id]);
    });
  }
}

/* ============================================================= shell/mount */

function stationPanelMarkup(station, bodyHtml) {
  const objectives = objectivesOfStation(station.id);
  const keywords = station.keywords.map((keyword) => `<li>${keyword}</li>`).join('');
  return `
  <section class="u2l3a-station" id="station-${station.id}" data-station="${station.id}" aria-labelledby="station-${station.id}-heading" hidden>
    <header class="u2l3a-station-head">
      <div class="u2l3a-station-count"><span dir="ltr">${String(station.index).padStart(2, '0')}</span><i aria-hidden="true">${station.icon}</i></div>
      <div class="u2l3a-station-heading-copy">
        <p class="u2l3a-section-kicker">${station.kicker}</p>
        <h2 id="station-${station.id}-heading" tabindex="-1">${station.title}</h2>
        <p class="u2l3a-station-goal"><strong>هدف المحطة:</strong> ${station.goal}</p>
      </div>
      <div class="u2l3a-station-meta">
        <p class="u2l3a-station-objective"><span>من أهداف الدرس</span>${station.objective}</p>
        <p class="u2l3a-station-objective"><span>الأهداف المرتبطة</span>${objectives.map((objective) => objective.text).join(' · ')}</p>
        <ul class="u2l3a-station-keywords" aria-label="الكلمات المفتاحية في هذه المحطة">${keywords}</ul>
      </div>
    </header>
    <div class="u2l3a-station-body">${bodyHtml}</div>
  </section>`;
}

export function mountVoltageAppendix(root) {
  const view = root.ownerDocument.defaultView;

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

  const context = {
    openStation: (stationId, moveFocus = false) => goTo(stationId, moveFocus),
    registerAnswer: (questionId, state) => {
      answerStates[questionId] = state;
      answerListeners.forEach((listener) => listener(answerStates));
    },
  };

  root.querySelector('#hero-description').innerHTML = HERO_DESCRIPTION_HTML;
  root.querySelector('#hero-note').textContent = HERO_NOTE;
  const [extensionArabic, extensionLatin] = EXTENSION_LABEL.split('—').map((part) => part.trim());
  root.querySelector('#hero-extension').innerHTML = `<span aria-hidden="true">⌁</span> ${extensionArabic} — ${ltr(extensionLatin)}`;
  root.querySelector('#hero-lesson-label').textContent = `${APPENDIX_LESSON_LABEL} · صفحات الكتاب ${LESSON_PAGES}`;
  keywordRow.innerHTML = APPENDIX_KEYWORDS.map((keyword) => `<li title="${keyword.gloss}"><span>${keyword.label}</span></li>`).join('');
  objectivesList.innerHTML = APPENDIX_OBJECTIVES.map((objective) => `
    <li><strong>${objective.text}</strong><small>${objective.check}</small><em>${objective.stations}</em></li>`).join('');
  howtoList.innerHTML = HOW_TO_USE_STEPS.map((step, index) => `
    <li><span dir="ltr">${String(index + 1).padStart(2, '0')}</span><strong>${step.title}</strong><small>${step.body}</small></li>`).join('');
  root.querySelector('#scope-notes').innerHTML = SCOPE_NOTES.map((note) => `<li>${note}</li>`).join('');

  nav.innerHTML = APPENDIX_STATIONS.map((station) => `
    <button class="u2l3a-station-chip" type="button" data-station-link="${station.id}" aria-label="المحطة ${station.index}: ${station.title}">
      <span class="u2l3a-chip-index" dir="ltr">${station.index}</span>
      <span class="u2l3a-chip-copy"><strong>${station.title}</strong><small>${station.navLabel}</small></span>
    </button>`).join('');

  const bodies = {
    meaning: meaningMarkup,
    probes: probesMarkup,
    dipoles: dipolesMarkup,
    potentials: potentialsMarkup,
    sum: sumMarkup,
    detective: () => `<div class="u2l3a-detective-intro">${DETECTIVE_INTRO_HTML}<p class="u2l3a-not-book">${NOT_BOOK_LABEL}</p></div>
      <div class="u2l3a-detective-progress" >
        <div class="u2l3a-detective-track" id="detective-track" role="progressbar" aria-label="تقدمك في مهام المحقق" aria-valuemin="0" aria-valuemax="7" aria-valuenow="0"><span id="detective-fill"></span></div>
        <p class="u2l3a-detective-count" data-detective-count>0 من 7 مهام</p>
      </div>
      <div class="u2l3a-questions" data-questions="detective"></div>`,
    map: mapMarkup,
  };
  panelsHost.innerHTML = APPENDIX_STATIONS.map((station) => stationPanelMarkup(station, bodies[station.id]())).join('');

  let flow = createStationFlow(stationIdFromHash(view?.location?.hash) ?? APPENDIX_STATIONS[0].id);
  const panels = Object.fromEntries(APPENDIX_STATIONS.map((station) => [station.id, panelsHost.querySelector(`[data-station="${station.id}"]`)]));

  mountMeaning(panels.meaning);
  mountProbes(panels.probes);
  mountDipoles(panels.dipoles);
  mountPotentials(panels.potentials);
  mountSum(panels.sum);
  mountMap(panels.map, context);
  APPENDIX_STATIONS.forEach((station) => mountQuestions(panels[station.id], context));

  answerListeners.push((states) => {
    const progress = answerProgress(states);
    const readout = root.querySelector('#answer-progress');
    if (readout) {
      readout.textContent = progress.solved === progress.total
        ? `${progress.solved} من ${progress.total} — أنجزت كل الأسئلة`
        : `${progress.solved} من ${progress.total} سؤالاً`;
    }
    const detective = stationAnswerProgress('detective', states);
    const detectiveCount = root.querySelector('[data-detective-count]');
    if (detectiveCount) detectiveCount.textContent = `${detective.solved} من ${detective.total} مهام`;
    const detectiveTrack = root.querySelector('#detective-track');
    if (detectiveTrack) {
      detectiveTrack.setAttribute('aria-valuenow', String(detective.solved));
      root.querySelector('#detective-fill').style.width = `${detective.percent}%`;
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
    previousLabel.textContent = previous ? `${previous.index}. ${previous.navLabel}` : 'بداية المحطات';
    nextLabel.textContent = next ? `${next.index}. ${next.navLabel}` : 'نهاية المحطات';
    if (moveFocus) {
      const heading = panels[flow.activeId].querySelector('h2');
      heading?.focus?.({ preventScroll: true });
      heading?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
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
  previousButton.addEventListener('click', () => { flow = previousStation(flow); applyFlow(true); });
  nextButton.addEventListener('click', () => { flow = nextStation(flow); applyFlow(true); });
  root.querySelector('#start-first-station').addEventListener('click', () => goTo(APPENDIX_STATIONS[0].id, true));

  const onKeydown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target?.closest?.('input, select, textarea, [contenteditable="true"]')) return;
    if (event.key === 'PageDown') { event.preventDefault(); flow = nextStation(flow); applyFlow(true); }
    if (event.key === 'PageUp') { event.preventDefault(); flow = previousStation(flow); applyFlow(true); }
    if (event.key === 'Home' && !event.shiftKey) { event.preventDefault(); goTo(APPENDIX_STATIONS[0].id, true); }
    if (event.key === 'End') { event.preventDefault(); goTo(APPENDIX_STATIONS[APPENDIX_STATIONS.length - 1].id, true); }
  };
  view?.addEventListener?.('keydown', onKeydown);
  const onHashChange = () => {
    const id = stationIdFromHash(view.location.hash);
    if (id && id !== flow.activeId) goTo(id, false);
  };
  view?.addEventListener?.('hashchange', onHashChange);

  applyFlow(false);
  answerListeners.forEach((listener) => listener(answerStates));

  return Object.freeze({
    goToStation: goTo,
    get flow() { return flow; },
    panels,
    integrity: () => Object.freeze({ coverage: appendixCoverageReport(), questions: questionsIntegrityReport() }),
    dispose() {
      view?.removeEventListener?.('keydown', onKeydown);
      view?.removeEventListener?.('hashchange', onHashChange);
    },
  });
}

/* ------------------------------------------------------------- bootstrap */

const appendixRoot = typeof document !== 'undefined' ? document.querySelector('[data-unit2-lesson3-appendix]') : null;
if (appendixRoot) mountVoltageAppendix(appendixRoot);
