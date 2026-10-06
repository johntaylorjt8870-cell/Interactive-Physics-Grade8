/*
 * Lesson 2 appendix — parallel forces and the position of the resultant's
 * carrier.
 *
 * The module mounts a single interactive lab: a light horizontal rod with two
 * parallel forces whose intensities and carrier positions are editable, in the
 * same-sense and opposite-sense cases of the textbook. Every drawn value comes
 * from `lesson-2-appendix-physics.js`, and every equation is rendered through
 * the shared KaTeX layer in `math.js`.
 *
 * The interface is Arabic RTL; numbers, units, symbols and equations are
 * isolated LTR (KaTeX / <bdi dir="ltr">) so they can never be reordered.
 */

import { formula, qty, scalar, tex, vector } from './math.js';
import {
  LAB_FIELDS,
  OPPOSITE_SENSE,
  RESULT_COUPLE,
  RESULT_ZERO,
  ROD_LENGTH_CM,
  SAME_SENSE,
  createLabState,
  evaluateChallenge,
  parallelResultant,
  resultantDistanceFromLargerForce,
  updateLabInput,
} from './lesson-2-appendix-physics.js';
import {
  APPENDIX_EXTENSION_LABEL,
  BOOK_CASES,
  BOOK_SCOPE,
  BOOK_WORKED_EXAMPLE,
  CHALLENGES,
  DEFAULT_PRESET_ID,
  LAB_PRESETS,
  PLATFORM_CONCEPTS,
  findPreset,
} from './lesson-2-appendix-content.js';

const V_F1 = vector('F', '1');
const V_F2 = vector('F', '2');
const V_F = vector('F');
const D1 = scalar('d', '1');
const D2 = scalar('d', '2');
const D_SYMBOL = scalar('d');

/* The drawing is a fixed-geometry scene: the rod keeps its pixel length while
 * the resultant's carrier may leave the rod (and, in extreme states, leave the
 * drawn band — the lab then says so instead of pretending to draw it). */
const VIEW = Object.freeze({
  rodLeftPx: 250,
  rodRightPx: 640,
  pxPerCm: 6.5,
  rodTopPx: 242,
  rodBottomPx: 258,
  rodCenterPx: 250,
  carrierTopPx: 74,
  carrierBottomPx: 432,
  labelRowPx: 424,
  pointLabelRowPx: 286,
  distanceRowPx: 330,
  distanceRow2Px: 366,
  separationRowPx: 402,
  arrowMaxPx: 118,
  arrowMinPx: 10,
  bandMinPx: 58,
  bandMaxPx: 852,
  coupleArcRowPx: 330,
});

const formatNumber = (value, digits = 2) => {
  if (!Number.isFinite(value)) return '0';
  return Number(value.toFixed(digits)).toString();
};

const ltrValue = (value, digits = 2) => `<bdi dir="ltr">${formatNumber(value, digits)}</bdi>`;

const pxOf = (centimetres) => VIEW.rodLeftPx + centimetres * VIEW.pxPerCm;

const escapedHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const senseLabel = (result) => {
  if (result.kind === RESULT_COUPLE || result.sense === 0) return 'لا جهة — المحصلة صفر';
  if (result.mode === SAME_SENSE) return `إلى الأعلى (جهة ${V_F1} و${V_F2})`;
  if (result.mode === OPPOSITE_SENSE) {
    return result.sense > 0
      ? `إلى الأعلى (جهة ${V_F1} الأكبر)`
      : `إلى الأسفل (جهة ${V_F2} الأكبر)`;
  }
  return 'لا جهة — المحصلة صفر';
};

const positionSentence = (result) => {
  if (result.kind === RESULT_COUPLE) {
    return 'لا يوجد حامل مفرد للمحصلة: الشدتان متساويتان ومتعاكستان على حاملين مختلفين.';
  }
  const insideRod = result.resultantPosition >= 0 && result.resultantPosition <= ROD_LENGTH_CM;
  const place = insideRod ? 'داخل الساق' : 'خارج الساق على امتدادها';
  const relation = result.mode === SAME_SENSE
    ? 'بين حاملي القوتين'
    : `خارج القطعة من جهة ${result.largestForce === 1 ? V_F1 : V_F2} الأكبر`;
  return `${relation} · ${place} · على بعد ${ltrValue(result.resultantPosition)} <bdi dir="ltr">cm</bdi> من ${tex('A', 'point A')}`;
};

const observationText = (result) => {
  if (result.kind === RESULT_COUPLE) {
    return `المحصلة كقوة تساوي صفراً (${tex('F=0', 'F equals zero')}) لأن الشدتين متساويتان ومتعاكستان، ولا يوجد حامل مفرد يمكن أن تنطبق عليه المحصلة؛ ما بقي ظاهراً في الرسم هو القوتان وأثرهما الدوراني ${tex('F\\times d', 'F times d')} لأن الحاملين مختلفان.`;
  }
  if (result.kind === RESULT_ZERO) {
    return 'لا توجد قوة محصلة في هذه الحالة، أما الرسم فيبقي القوتين كما هما.';
  }
  const distanceToLarger = resultantDistanceFromLargerForce(result);
  const closer = result.largestForce === null ? '' : ` ويبعد حاملها عن حامل القوة ${result.largestForce === 1 ? 'الأولى' : 'الثانية'} الأكبر ${ltrValue(distanceToLarger)} <bdi dir="ltr">cm</bdi>.`;
  const where = result.mode === SAME_SENSE
    ? 'حامل المحصلة بين الحاملين، وهذا ما تتوقعه حالة الجهة الواحدة.'
    : 'حامل المحصلة خارج القطعة، وهذا ما تتوقعه حالة الجهتين المتعاكستين.';
  return `${where} شدة المحصلة ${qty(formatNumber(result.magnitude), 'N')} وجهتها ${senseLabel(result)}.${closer} لاحظ أن الجداءين ${tex('F_{1}\\times d_{1}', 'F one times d one')} و${tex('F_{2}\\times d_{2}', 'F two times d two')} متساويان: هذا ما يثبّت الموضع.`;
};

function mountLesson2Appendix(root) {
  const byId = (id) => root.querySelector(`#${id}`);
  const presetButtons = byId('preset-buttons');
  const presetObservation = byId('preset-observation');
  const carrierLayer = byId('carrier-layer');
  const forceLayer = byId('force-layer');
  const distanceLayer = byId('distance-layer');
  const zeroLayer = byId('zero-layer');
  const edgeLayer = byId('edge-layer');
  const pointLayer = byId('point-layer');
  const resultantLayer = byId('resultant-layer');
  const resultantVector = byId('resultant-vector');
  const resultantPoint = byId('resultant-point');
  const resultantTag = byId('resultant-tag');
  const legend = byId('parallel-legend');
  const diagramDescription = byId('parallel-diagram-desc');
  const magnitudeOutput = byId('result-magnitude');
  const senseOutput = byId('result-sense');
  const positionOutput = byId('result-position');
  const distance1Output = byId('result-distance-1');
  const distance2Output = byId('result-distance-2');
  const momentsOutput = byId('result-moments');
  const resultNote = byId('result-note');
  const liveEquations = byId('live-equations');
  const liveObservation = byId('live-observation');
  const labStatus = byId('lab-status');
  const sweepButton = byId('sweep-lab');
  const resetButton = byId('reset-lab');
  const challengeList = byId('challenge-list');

  const inputs = {
    force1: byId('force-1-magnitude'),
    force2: byId('force-2-magnitude'),
    position1: byId('force-1-position'),
    position2: byId('force-2-position'),
  };
  const outputs = {
    force1: byId('force-1-magnitude-output'),
    force2: byId('force-2-magnitude-output'),
    position1: byId('force-1-position-output'),
    position2: byId('force-2-position-output'),
  };
  const modeRadios = [...root.querySelectorAll('[data-lab-mode]')];

  if (![presetButtons, carrierLayer, forceLayer, resultantLayer, magnitudeOutput, liveEquations, labStatus].every(Boolean)) return;

  const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference?.matches === true;
  let state = createLabState(findPreset(DEFAULT_PRESET_ID)?.state ?? {});
  let currentPresetId = DEFAULT_PRESET_ID;
  let activeChallenge = null;
  let sweepHandle = null;

  /* ------------------------------------------------------ static content -- */

  function renderBookSection() {
    byId('book-definition').innerHTML = `<strong>تعريف القوى المتوازية:</strong> ${escapedHtml(BOOK_SCOPE.definition.replace('القوى المتوازية: ', ''))}`;
    byId('book-cases').innerHTML = BOOK_CASES.map((item) => `<article class="parallel-source-card" data-source-case="${escapedHtml(item.id)}">
      <header class="parallel-source-card-head">
        <h3>${escapedHtml(item.title)}</h3>
        <span class="parallel-sense-glyphs" aria-hidden="true" dir="ltr">${tex(item.badgeTex, item.badgeLabel)}</span>
      </header>
      <dl class="parallel-source-elements">
        ${item.elements.map((element) => `<div><dt>${escapedHtml(element.label)}</dt><dd>${element.html}</dd></div>`).join('')}
      </dl>
      <div class="parallel-source-laws">${item.proportional.join('')}</div>
      <p class="parallel-source-ref">${item.source}</p>
    </article>`).join('');
    byId('summary-equations').innerHTML = [
      formula('F=F_{1}+F_{2}\\quad\\text{وبجهة القوتين}', 'same sense: F equals F one plus F two, in the direction of the two forces'),
      formula('F=F_{2}-F_{1}\\quad\\text{وبجهة القوة الأكبر}', 'opposite senses: F equals F two minus F one, in the direction of the larger force'),
      formula('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'the position relation: F one times d one equals F two times d two'),
    ].join('');
  }

  function renderPlatformConcepts() {
    byId('platform-concepts').innerHTML = PLATFORM_CONCEPTS.map((concept, index) => `<article class="appendix-concept-card parallel-concept-card">
      <h3><span class="appendix-concept-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>${escapedHtml(concept.title)}</h3>
      ${concept.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}
      ${(concept.equations ?? []).join('')}
      ${concept.note ? `<p class="parallel-concept-note">${concept.note}</p>` : ''}
    </article>`).join('');
  }

  function renderBookExample() {
    byId('book-example').innerHTML = `
      <div class="parallel-example-head">
        <div>
          <h3>${escapedHtml(BOOK_WORKED_EXAMPLE.title)}</h3>
          <p>${BOOK_WORKED_EXAMPLE.introduction}</p>
        </div>
        <span class="parallel-source-badge"><span aria-hidden="true">◆</span> ${BOOK_WORKED_EXAMPLE.source}</span>
      </div>
      <ol class="parallel-example-steps">
        ${BOOK_WORKED_EXAMPLE.steps.map((step) => `<li>
          <span class="parallel-example-label">${escapedHtml(step.label)}</span>
          <div class="parallel-example-body">${step.html}</div>
        </li>`).join('')}
      </ol>
      <div class="parallel-example-actions">
        <button class="appendix-button appendix-play-button" type="button" id="load-book-example">حمّل حالة الكتاب في المختبر</button>
        <span class="parallel-example-hint">في المختبر تُقاس المسافات بالسنتيمتر: <bdi dir="ltr">0.5 m = 50 cm</bdi> و<bdi dir="ltr">0.2 m = 20 cm</bdi>.</span>
      </div>`;
  }

  /* Symbols that belong to the static markup are filled here, so every symbol
   * in the appendix — labels included — comes from the shared KaTeX layer. */
  function renderStaticSymbols() {
    for (const slot of root.querySelectorAll('[data-tex]')) {
      slot.innerHTML = tex(slot.dataset.tex, slot.dataset.aria || 'رمز رياضي');
    }
  }

  function renderPresetButtons() {
    presetButtons.innerHTML = LAB_PRESETS.map((preset) => `<button class="appendix-preset-button parallel-preset-button" type="button" data-preset-id="${escapedHtml(preset.id)}" aria-pressed="${preset.id === currentPresetId}" aria-describedby="preset-observation">
      <strong>${escapedHtml(preset.title)}</strong><small>${escapedHtml(preset.badge)}</small>
    </button>`).join('');
  }

  /* `brief`, `hint` and `startObservation` are authored platform strings that
   * embed the shared KaTeX output, so they are inserted as markup — exactly
   * like the preset observations above. Titles, labels and ids stay escaped. */
  function renderChallenges() {
    challengeList.innerHTML = CHALLENGES.map((challenge) => `<article class="parallel-challenge-card" data-challenge-card="${escapedHtml(challenge.id)}">
      <header class="parallel-challenge-head">
        <span class="parallel-challenge-index" aria-hidden="true" dir="ltr">${escapedHtml(challenge.index)}</span>
        <h3>${escapedHtml(challenge.title)}</h3>
        <span class="parallel-challenge-state" data-challenge-state="${escapedHtml(challenge.id)}">غير مُفعّل</span>
      </header>
      <p class="parallel-challenge-brief">${challenge.brief}</p>
      <p class="parallel-challenge-hint">${challenge.hint}</p>
      <div class="parallel-challenge-actions">
        <button class="appendix-button appendix-play-button" type="button" data-challenge-start="${escapedHtml(challenge.id)}">ابدأ التحدي في المختبر</button>
        <button class="appendix-button appendix-reset-button" type="button" data-challenge-check="${escapedHtml(challenge.id)}" hidden>تحقّق من الهدف</button>
        <button class="appendix-button appendix-reset-button" type="button" data-challenge-reset="${escapedHtml(challenge.id)}" hidden>أعد الحالة الابتدائية</button>
      </div>
      <p class="parallel-challenge-status" data-challenge-status="${escapedHtml(challenge.id)}" role="status" aria-live="polite" aria-atomic="true">${challenge.startObservation}</p>
    </article>`).join('');
  }

  /* --------------------------------------------------------- lab drawing -- */

  function arrowScale(result) {
    const largest = Math.max(result.force1, result.force2, result.magnitude, 1);
    return VIEW.arrowMaxPx / largest;
  }

  function renderCarriers(result) {
    const carriers = [
      { index: 1, cm: result.position1, className: 'parallel-carrier parallel-carrier-1', label: 'x₁' },
      { index: 2, cm: result.position2, className: 'parallel-carrier parallel-carrier-2', label: 'x₂' },
    ];
    carrierLayer.innerHTML = carriers.map((carrier) => {
      const x = pxOf(carrier.cm).toFixed(2);
      return `<g aria-hidden="true">
        <line class="${carrier.className}" x1="${x}" y1="${VIEW.carrierTopPx}" x2="${x}" y2="${VIEW.carrierBottomPx}" />
        <text class="parallel-carrier-label" x="${x}" y="${VIEW.labelRowPx}" direction="ltr">${carrier.label}</text>
      </g>`;
    }).join('');
    pointLayer.innerHTML = `
      <circle class="parallel-endpoint" cx="${VIEW.rodLeftPx}" cy="${VIEW.rodCenterPx}" r="4" />
      <circle class="parallel-endpoint" cx="${VIEW.rodRightPx}" cy="${VIEW.rodCenterPx}" r="4" />
      <text class="parallel-point-label" x="${VIEW.rodLeftPx}" y="${VIEW.pointLabelRowPx}" direction="ltr">A</text>
      <text class="parallel-point-label" x="${VIEW.rodRightPx}" y="${VIEW.pointLabelRowPx}" direction="ltr">B</text>`;
  }

  function renderForceArrows(result) {
    const scale = arrowScale(result);
    const forces = [
      { index: 1, magnitude: result.force1, cm: result.position1, sense: 1, symbol: 'F₁', className: 'parallel-force-vector force-1', marker: 'parallel-arrow-force-1' },
      { index: 2, magnitude: result.force2, cm: result.position2, sense: result.mode === SAME_SENSE ? 1 : -1, symbol: 'F₂', className: 'parallel-force-vector force-2', marker: 'parallel-arrow-force-2' },
    ];
    forceLayer.innerHTML = forces.map((force) => {
      const x = pxOf(force.cm);
      const length = Math.max(VIEW.arrowMinPx, force.magnitude * scale);
      const startY = force.sense > 0 ? VIEW.rodTopPx : VIEW.rodBottomPx;
      const endY = force.sense > 0 ? startY - length : startY + length;
      const labelY = force.sense > 0 ? endY - 13 : endY + 25;
      return `<g class="${force.className}">
        <line class="parallel-force-line" x1="${x.toFixed(2)}" y1="${startY}" x2="${x.toFixed(2)}" y2="${endY.toFixed(2)}" marker-end="url(#${force.marker})" />
        <text class="parallel-force-label" x="${x.toFixed(2)}" y="${labelY.toFixed(2)}" direction="ltr">${force.symbol}</text>
      </g>`;
    }).join('');
  }

  function dimensionLine(x1, x2, y, label, className) {
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const middle = (left + right) / 2;
    const textAnchor = right - left < 54 ? 'middle' : 'middle';
    return `<g class="parallel-dimension ${className}" aria-hidden="true">
      <line x1="${left.toFixed(2)}" y1="${y}" x2="${right.toFixed(2)}" y2="${y}" />
      <line x1="${left.toFixed(2)}" y1="${y - 6}" x2="${left.toFixed(2)}" y2="${y + 6}" />
      <line x1="${right.toFixed(2)}" y1="${y - 6}" x2="${right.toFixed(2)}" y2="${y + 6}" />
      <text x="${middle.toFixed(2)}" y="${y - 9}" text-anchor="${textAnchor}" direction="ltr">${label}</text>
    </g>`;
  }

  function renderDistances(result) {
    const x1 = pxOf(result.position1);
    const x2 = pxOf(result.position2);
    const rows = [dimensionLine(x1, x2, VIEW.separationRowPx, 'd', 'parallel-dimension-separation')];
    if (result.resultantPosition !== null) {
      const xc = pxOf(result.resultantPosition);
      rows.unshift(dimensionLine(x1, xc, VIEW.distanceRowPx, 'd₁', 'parallel-dimension-1'));
      rows.push(dimensionLine(xc, x2, VIEW.distanceRow2Px, 'd₂', 'parallel-dimension-2'));
    }
    distanceLayer.innerHTML = rows.join('');
  }

  function nearBand(cm) {
    const x = pxOf(cm);
    return x >= VIEW.bandMinPx && x <= VIEW.bandMaxPx;
  }

  function renderResultant(result) {
    if (result.kind === RESULT_COUPLE || result.resultantPosition === null) {
      resultantLayer.setAttribute('visibility', 'hidden');
      resultantLayer.setAttribute('aria-hidden', 'true');
      return;
    }
    const x = pxOf(result.resultantPosition);
    const drawable = nearBand(result.resultantPosition);
    const clampedX = Math.min(VIEW.bandMaxPx, Math.max(VIEW.bandMinPx, x));
    const transform = `translate(${(drawable ? x : clampedX).toFixed(2)} 0)`;
    resultantLayer.setAttribute('transform', transform);
    resultantLayer.style.transform = transform;
    resultantLayer.setAttribute('visibility', 'visible');
    resultantLayer.removeAttribute('aria-hidden');

    const scale = arrowScale(result);
    const length = Math.max(VIEW.arrowMinPx, result.magnitude * scale);
    const upward = result.sense > 0;
    const startY = upward ? VIEW.rodTopPx : VIEW.rodBottomPx;
    const endY = upward ? startY - length : startY + length;
    resultantVector.setAttribute('x1', '0');
    resultantVector.setAttribute('x2', '0');
    resultantVector.setAttribute('y1', String(startY));
    resultantVector.setAttribute('y2', endY.toFixed(2));
    resultantVector.setAttribute('visibility', 'visible');
    /* The tag sits at the top of the carrier: away from the arrows long enough
     * to stay readable at every magnitude. */
    resultantTag.setAttribute('y', '64');
    resultantTag.setAttribute('x', '0');
    resultantPoint.setAttribute('cx', '0');
    resultantPoint.setAttribute('cy', String(VIEW.rodCenterPx));
  }

  function renderZeroState(result) {
    if (result.kind !== RESULT_COUPLE) {
      zeroLayer.innerHTML = result.kind === RESULT_ZERO
        ? `<g aria-hidden="true"><circle class="parallel-zero-marker" cx="${pxOf((result.position1 + result.position2) / 2).toFixed(2)}" cy="${VIEW.rodCenterPx}" r="12" /><text class="parallel-zero-text" x="${pxOf((result.position1 + result.position2) / 2).toFixed(2)}" y="${VIEW.rodCenterPx + 5}" text-anchor="middle" direction="ltr">0</text></g>`
        : '';
      return;
    }
    const x1 = pxOf(result.position1);
    const x2 = pxOf(result.position2);
    const radius = Math.max(30, (x2 - x1) / 2);
    const middle = (x1 + x2) / 2;
    zeroLayer.innerHTML = `<g class="parallel-couple" aria-hidden="true">
      <path class="parallel-couple-arc" d="M ${x1.toFixed(2)} ${VIEW.coupleArcRowPx} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 0 1 ${x2.toFixed(2)} ${VIEW.coupleArcRowPx}" marker-start="url(#parallel-arrow-result)" marker-end="url(#parallel-arrow-result)" />
      <text class="parallel-couple-text" x="${middle.toFixed(2)}" y="${(VIEW.coupleArcRowPx - radius - 12).toFixed(2)}" text-anchor="middle" direction="rtl">أثر دوران بلا حامل مفرد</text>
      <text class="parallel-zero-text parallel-zero-couple" x="${middle.toFixed(2)}" y="${VIEW.rodCenterPx + 5}" text-anchor="middle" direction="ltr">F = 0</text>
      <circle class="parallel-zero-marker" cx="${middle.toFixed(2)}" cy="${VIEW.rodCenterPx}" r="17" />
    </g>`;
  }

  function renderEdgeNotice(result) {
    if (result.resultantPosition === null || nearBand(result.resultantPosition)) {
      edgeLayer.innerHTML = '';
      return;
    }
    const beyondRight = pxOf(result.resultantPosition) > VIEW.bandMaxPx;
    const x = beyondRight ? VIEW.bandMaxPx - 10 : VIEW.bandMinPx + 10;
    edgeLayer.innerHTML = `<g class="parallel-edge-notice" aria-hidden="true">
      <text x="${x.toFixed(2)}" y="48" text-anchor="${beyondRight ? 'end' : 'start'}" direction="rtl">حامل المحصلة خارج مجال الرسم ←</text>
    </g>`;
  }

  function renderLegend(result) {
    const items = [
      `<li class="appendix-force-legend-item"><span class="legend-line" style="--legend-color:#16706b" aria-hidden="true"></span><span>${V_F1}</span><bdi dir="ltr">${formatNumber(result.force1)} N · ${formatNumber(result.position1)} cm</bdi></li>`,
      `<li class="appendix-force-legend-item"><span class="legend-line dashed" style="--legend-color:#46629f" aria-hidden="true"></span><span>${V_F2}</span><bdi dir="ltr">${formatNumber(result.force2)} N · ${formatNumber(result.position2)} cm</bdi></li>`,
    ];
    if (result.kind === RESULT_COUPLE) {
      items.push(`<li class="appendix-force-legend-item"><span class="legend-line result" aria-hidden="true"></span><span>${V_F}</span><strong>صفر — أثر دوران</strong></li>`);
      items.push(`<li class="appendix-force-legend-item"><span class="legend-line" style="--legend-color:#c96a4f" aria-hidden="true"></span><span>${D_SYMBOL}</span><bdi dir="ltr">${formatNumber(result.separation)} cm</bdi></li>`);
    } else {
      items.push(`<li class="appendix-force-legend-item"><span class="legend-line result" aria-hidden="true"></span><span>${V_F}</span><strong>المحصلة</strong><bdi dir="ltr">${formatNumber(result.magnitude)} N</bdi></li>`);
      items.push(`<li class="appendix-force-legend-item"><span class="legend-line" style="--legend-color:#8792a6" aria-hidden="true"></span><span>${D1}</span><bdi dir="ltr">${formatNumber(result.distanceFromForce1)} cm</bdi></li>`);
      items.push(`<li class="appendix-force-legend-item"><span class="legend-line dashed" style="--legend-color:#8792a6" aria-hidden="true"></span><span>${D2}</span><bdi dir="ltr">${formatNumber(result.distanceFromForce2)} cm</bdi></li>`);
    }
    legend.innerHTML = `<ul>${items.join('')}</ul>`;
  }

  function renderDiagramDescription(result) {
    const base = 'ساق أفقية من A إلى B طولها 60 سنتيمتراً، وعليها قوتان متوازيتان شاقوليتان.';
    if (result.kind === RESULT_COUPLE) {
      diagramDescription.textContent = `${base} الشدتان متساويتان ومتعاكستان على حاملين مختلفين، فلا توجد محصلة كقوة ولا حامل مفرد لها؛ ويظهر في الرسم أثر دوران.`;
      return;
    }
    const outside = result.resultantPosition < 0 || result.resultantPosition > ROD_LENGTH_CM;
    diagramDescription.textContent = `${base} القوة الأولى ${formatNumber(result.force1)} نيوتن عند ${formatNumber(result.position1)} سنتيمتر من A، والقوة الثانية ${formatNumber(result.force2)} نيوتن عند ${formatNumber(result.position2)} سنتيمتر من A. المحصلة ${formatNumber(result.magnitude)} نيوتن عند ${formatNumber(result.resultantPosition)} سنتيمتر من A${outside ? ' (خارج الساق على امتدادها)' : ''}، وبُعد حامل المحصلة عن القوة الأولى ${formatNumber(result.distanceFromForce1)} سنتيمتراً وعن القوة الثانية ${formatNumber(result.distanceFromForce2)} سنتيمتر. القيم التفصيلية مذكورة أيضاً في لوحة النتائج والمفتاح أسفل الرسم.`;
  }

  /* ------------------------------------------------------- result panel -- */

  function renderResults(result) {
    magnitudeOutput.innerHTML = result.kind === RESULT_COUPLE || result.sense === 0
      ? `${qty(0, 'N')} <span class="parallel-zero-word">صفر</span>`
      : qty(formatNumber(result.magnitude), 'N');
    senseOutput.innerHTML = senseLabel(result);

    if (result.kind === RESULT_COUPLE) {
      positionOutput.innerHTML = '<span class="parallel-undefined">غير محدَّد — لا حامل مفرد</span>';
      distance1Output.innerHTML = '<span class="parallel-undefined">—</span>';
      distance2Output.innerHTML = '<span class="parallel-undefined">—</span>';
      momentsOutput.innerHTML = `<span class="parallel-undefined">لا تعادل حول حامل مفرد</span> · ${tex('F\\times d', 'F times d')} = ${ltrValue(result.couple.moment, 1)} <bdi dir="ltr">N·cm</bdi>`;
      resultNote.innerHTML = `محصلة القوى صفر كقوة، لكن الحاملين مختلفان: يبقى أثر دوران مقداره ${tex('F\\times d', 'F times d')} = ${ltrValue(result.couple.moment, 1)} <bdi dir="ltr">N·cm</bdi>، ولا يوجد حامل مفرد تنطبق عليه المحصلة.`;
      return;
    }
    positionOutput.innerHTML = positionSentence(result);
    distance1Output.innerHTML = `${ltrValue(result.distanceFromForce1)} <bdi dir="ltr">cm</bdi>`;
    distance2Output.innerHTML = `${ltrValue(result.distanceFromForce2)} <bdi dir="ltr">cm</bdi>`;
    momentsOutput.innerHTML = `${tex('F_{1}\\times d_{1}', 'F one times d one')} = ${ltrValue(result.moments.first, 1)} و${tex('F_{2}\\times d_{2}', 'F two times d two')} = ${ltrValue(result.moments.second, 1)} <bdi dir="ltr">N·cm</bdi>`;
    const insideRod = result.resultantPosition >= 0 && result.resultantPosition <= ROD_LENGTH_CM;
    resultNote.innerHTML = result.mode === SAME_SENSE
      ? `الحامل بين القوتين، وأقرب إلى القوة الأكبر. الجداءان متساويان كما في علاقة الكتاب ${tex('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two')}.`
      : `الحامل على امتداد ${tex('(AB)', 'line A B')} ${insideRod ? 'عند طرف الساق' : 'خارج القطعة'} من جهة القوة ${result.largestForce === 1 ? 'الأولى' : 'الثانية'} الأكبر، وتحققت علاقة الكتاب للعزم.`;
  }

  function equationRow(source, bodyHtml) {
    const tag = source === 'book' ? 'من الكتاب' : 'شرح المنصة';
    return `<li class="parallel-equation-row" data-source="${source}">
      <span class="parallel-equation-tag">${tag}</span>
      <div class="parallel-equation-body">${bodyHtml}</div>
    </li>`;
  }

  function intensityRow(result) {
    if (result.mode === SAME_SENSE) {
      const law = formula('F=F_{1}+F_{2}', 'F equals F one plus F two');
      const substitution = formula(
        `F=${formatNumber(result.force1)}+${formatNumber(result.force2)}=${formatNumber(result.magnitude)}~\\mathrm{N}`,
        'F equals the first intensity plus the second intensity',
      );
      const note = '<p class="parallel-equation-note">الشدتان في الجهة نفسها تُجمعان، فتكون المحصلة في جهة القوتين معاً.</p>';
      return equationRow('book', `${law}${substitution}${note}`);
    }
    const larger = Math.max(result.force1, result.force2);
    const smaller = Math.min(result.force1, result.force2);
    const law = formula('F=F_{2}-F_{1}\\quad(F_{2}>F_{1})', 'F equals F two minus F one, with F two larger than F one');
    const substitution = formula(
      `F=${formatNumber(larger)}-${formatNumber(smaller)}=${formatNumber(result.magnitude)}~\\mathrm{N}`,
      'F equals the larger intensity minus the smaller intensity',
    );
    const note = `<p class="parallel-equation-note">الشدتان متعاكستان؛ وهنا استُبدل الرمزان بحسب القوة الأكبر في هذه الحالة (الكتاب يكتبها ${tex('F_{2}>F_{1}', 'F two greater than F one')}).</p>`;
    return equationRow('book', `${law}${substitution}${note}`);
  }

  function positionRow(result) {
    if (result.mode === SAME_SENSE) {
      const law = formula('x_{C}=\\frac{F_{1}x_{1}+F_{2}x_{2}}{F_{1}+F_{2}}', 'x C equals F one x one plus F two x two over F one plus F two');
      const substitution = formula(
        `x_{C}=\\frac{${formatNumber(result.force1)}\\times${formatNumber(result.position1)}+${formatNumber(result.force2)}\\times${formatNumber(result.position2)}}{${formatNumber(result.force1)}+${formatNumber(result.force2)}}=${formatNumber(result.resultantPosition)}~\\mathrm{cm}`,
        'substituting the current state gives the position of the resultant carrier',
      );
      const lead = `<p>موضع حامل المحصلة من النقطة ${tex('A', 'point A')} هو المتوسط الموزون لموضعي الحاملين:</p>`;
      return equationRow('platform', `${lead}${law}${substitution}`);
    }
    const law = formula('x_{C}=\\frac{F_{1}x_{1}-F_{2}x_{2}}{F_{1}-F_{2}}', 'x C equals F one x one minus F two x two over F one minus F two');
    const lead = '<p>في الحالة المتعاكسة يخرج الحامل من القطعة، ويُحسب من العلاقة نفسها:</p>';
    if (result.kind === RESULT_COUPLE) {
      const coupleNote = '<p>وعند تساوي الشدتين يصبح المقام صفراً؛ فلا يوجد حامل مفرد للمحصلة، وهذا ما يعرضه الرسم بوساطة الأثر الدوراني.</p>';
      return equationRow('platform', `${lead}${law}${coupleNote}`);
    }
    const substitution = formula(
      `x_{C}=\\frac{${formatNumber(result.force1)}\\times${formatNumber(result.position1)}-${formatNumber(result.force2)}\\times${formatNumber(result.position2)}}{${formatNumber(result.force1)}-${formatNumber(result.force2)}}=${formatNumber(result.resultantPosition)}~\\mathrm{cm}`,
      'substituting the current state gives the position of the resultant carrier',
    );
    return equationRow('platform', `${lead}${law}${substitution}`);
  }

  function momentRow(result) {
    const law = formula('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two');
    if (result.kind === RESULT_COUPLE) {
      const couple = tex('F\\times d', 'F times d');
      const note = `<p class="parallel-equation-note">لا يمكن كتابة الجداءين هنا لعدم وجود حامل مفرد؛ بقيت الشدتان متساويتين، وظهر أثر دوران مقداره ${couple} = ${ltrValue(result.couple.moment, 1)} <bdi dir="ltr">N·cm</bdi>.</p>`;
      return equationRow('book', `${law}${note}`);
    }
    const substitution = formula(
      `${formatNumber(result.force1)}\\times${formatNumber(result.distanceFromForce1, 2)}=${formatNumber(result.force2)}\\times${formatNumber(result.distanceFromForce2, 2)}`,
      'the two moment products of the current state',
    );
    const note = `<p class="parallel-equation-note">الجداءان متساويان (بوحدة <bdi dir="ltr">N·cm</bdi>)، وهذا هو معنى علاقة الكتاب ${BOOK_SCOPE.relationHtml}.</p>`;
    return equationRow('book', `${law}${substitution}${note}`);
  }

  function renderEquations(result) {
    const rows = [intensityRow(result), positionRow(result), momentRow(result)];
    liveEquations.innerHTML = `<ol class="parallel-equation-list">${rows.join('')}</ol>`;
  }

  function renderControls() {
    for (const field of Object.keys(LAB_FIELDS)) {
      const input = inputs[field];
      const output = outputs[field];
      if (!input || !output) continue;
      if (Number(input.value) !== Number(state[field])) input.value = String(state[field]);
      const unit = LAB_FIELDS[field].unit;
      output.innerHTML = `<bdi dir="ltr">${formatNumber(state[field])} ${unit}</bdi>`;
      input.setAttribute('aria-valuetext', `${formatNumber(state[field])} ${unit === 'N' ? 'نيوتن' : 'سنتيمتر'}`);
      input.setAttribute('aria-valuenow', String(state[field]));
      const locked = activeChallenge?.locks.includes(field) === true;
      input.disabled = locked;
      const slider = input.closest('.parallel-slider');
      slider?.toggleAttribute('data-locked', locked);
      const help = root.querySelector(`#${input.getAttribute('aria-describedby')}`);
      const existingNote = help?.querySelector('.parallel-lock-note');
      if (locked && help && !existingNote) {
        const note = document.createElement('span');
        note.className = 'parallel-lock-note';
        note.textContent = ' مثبّت في التحدي الحالي.';
        help.append(note);
      } else if (!locked) {
        existingNote?.remove();
      }
    }
    for (const radio of modeRadios) radio.checked = radio.value === state.mode;
  }

  function renderPresetState() {
    for (const button of presetButtons.querySelectorAll('[data-preset-id]')) {
      button.setAttribute('aria-pressed', String(button.dataset.presetId === currentPresetId));
    }
  }

  function render() {
    const result = parallelResultant(state);
    renderControls();
    renderCarriers(result);
    renderForceArrows(result);
    renderDistances(result);
    renderResultant(result);
    renderZeroState(result);
    renderEdgeNotice(result);
    renderLegend(result);
    renderResults(result);
    renderEquations(result);
    renderDiagramDescription(result);
    liveObservation.innerHTML = observationText(result);
    renderPresetState();
    return result;
  }

  /* --------------------------------------------------------- interaction -- */

  function setStatus(message) {
    labStatus.innerHTML = message;
  }

  function announceResult(prefix = 'تحدّثت الحالة.') {
    const result = parallelResultant(state);
    const position = result.resultantPosition === null
      ? 'ولا يوجد حامل مفرد للمحصلة'
      : `وحاملها على بعد <bdi dir="ltr">${formatNumber(result.resultantPosition)} cm</bdi> من <bdi dir="ltr">A</bdi>`;
    setStatus(`${prefix} شدة المحصلة <bdi dir="ltr">${formatNumber(result.magnitude)} N</bdi>، ${senseLabel(result)}، ${position}.`);
  }

  function cancelSweep() {
    if (sweepHandle !== null && typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(sweepHandle);
    sweepHandle = null;
    sweepButton.setAttribute('aria-pressed', 'false');
  }

  function applyState(nextState, { presetId = null, observation = '', status = '' } = {}) {
    cancelSweep();
    state = createLabState(nextState);
    currentPresetId = presetId;
    if (observation) presetObservation.innerHTML = observation;
    render();
    if (status) setStatus(status);
  }

  function exitChallenge({ silent = false } = {}) {
    if (!activeChallenge) return;
    const { challenge } = activeChallenge;
    activeChallenge = null;
    const card = challengeList.querySelector(`[data-challenge-card="${challenge.id}"]`);
    card?.querySelector('[data-challenge-state]')?.replaceChildren(document.createTextNode('غير مُفعّل'));
    card?.setAttribute('data-active', 'false');
    card?.querySelector('[data-challenge-check]')?.setAttribute('hidden', '');
    card?.querySelector('[data-challenge-reset]')?.setAttribute('hidden', '');
    if (!silent) render();
  }

  function startChallenge(challenge) {
    if (!challenge) return;
    exitChallenge({ silent: true });
    activeChallenge = { challenge, locks: [...challenge.locks], startState: createLabState(challenge.startState) };
    applyState(challenge.startState, {
      presetId: null,
      observation: challenge.startObservation,
      status: `بدأ التحدي «${challenge.title}». ${challenge.locks.length ? 'بعض الضوابط مثبتة في هذا التحدي.' : 'كل الضوابط متاحة لك.'}`,
    });
    for (const other of CHALLENGES) {
      const card = challengeList.querySelector(`[data-challenge-card="${other.id}"]`);
      const isActive = other.id === challenge.id;
      card?.setAttribute('data-active', String(isActive));
      card?.querySelector('[data-challenge-state]')?.replaceChildren(document.createTextNode(isActive ? 'نشط الآن' : 'غير مُفعّل'));
      card?.querySelector('[data-challenge-check]')?.toggleAttribute('hidden', !isActive);
      card?.querySelector('[data-challenge-reset]')?.toggleAttribute('hidden', !isActive);
    }
    const sceneHeading = byId('scene-heading');
    sceneHeading?.focus({ preventScroll: true });
    sceneHeading?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function checkChallenge(challenge) {
    if (!challenge || activeChallenge?.challenge.id !== challenge.id) return;
    const evaluation = evaluateChallenge(challenge, state, activeChallenge.startState);
    const status = challengeList.querySelector(`[data-challenge-status="${challenge.id}"]`);
    const prefix = evaluation.complete ? 'تحقق الهدف: ' : 'لم يكتمل الهدف بعد: ';
    status.innerHTML = `${prefix}${evaluation.message}${evaluation.complete ? ` ${challenge.successNote}` : ''}`;
    status.dataset.complete = String(evaluation.complete === true);
    setStatus(`${prefix}${evaluation.message}`);
  }

  function resetChallenge(challenge) {
    if (!challenge) return;
    const wasActive = activeChallenge?.challenge.id === challenge.id;
    if (!wasActive) {
      startChallenge(challenge);
    } else {
      applyState(challenge.startState, { presetId: null, observation: challenge.startObservation });
      const status = challengeList.querySelector(`[data-challenge-status="${challenge.id}"]`);
      status.dataset.complete = 'false';
      status.innerHTML = `${challenge.startObservation} أُعيدت الحالة الابتدائية.`;
      setStatus(`أُعيدت الحالة الابتدائية للتحدي «${challenge.title}».`);
    }
  }

  function handleInput(input) {
    const field = input.dataset.labInput;
    if (!field || input.disabled) return;
    state = updateLabInput(state, field, Number(input.value));
    currentPresetId = null;
    const result = render();
    presetObservation.innerHTML = `تجربة حرة: تغيّرت ${LAB_FIELDS[field].label}. راقب الجداءين والموضع قبل أن تستنتج.`;
    if (activeChallenge) {
      const status = challengeList.querySelector(`[data-challenge-status="${activeChallenge.challenge.id}"]`);
      if (status) {
        status.dataset.complete = 'false';
        status.textContent = 'تغيّرت الحالة؛ اضغط «تحقّق من الهدف» عندما تصل إلى ما تريد.';
      }
    }
    if (result.kind === RESULT_COUPLE) {
      setStatus('الشدتان متساويتان ومتعاكستان: المحصلة صفر، ولا يوجد حامل مفرد؛ ما يظهر في الرسم هو الأثر الدوراني.');
    } else {
      /* The panel, the drawing and the live status move together while the
       * student drags, so the change is announced without waiting for a blur. */
      announceResult('تحدّثت الحالة');
    }
  }

  function sweep() {
    if (sweepHandle !== null) {
      cancelSweep();
      setStatus('أُوقف عرض حركة حامل المحصلة؛ بقيت الشدتان والموضعان كما هما.');
      return;
    }
    const min = Number(inputs.force2.min);
    const max = Number(inputs.force2.max);
    if (reducedMotion) {
      state = updateLabInput(state, 'force2', max);
      currentPresetId = null;
      render();
      setStatus(`عرض ثابت لتقليل الحركة: ضُبطت شدة القوة الثانية على <bdi dir="ltr">${formatNumber(max)} N</bdi> في خطوة واحدة، وانتقل حامل المحصلة مباشرة. حرّك المنزلق لمتابعة بقية القيم.`);
      inputs.force2.focus();
      return;
    }
    const duration = 4200;
    let startTime = null;
    sweepButton.setAttribute('aria-pressed', 'true');
    setStatus('عرض متحرك: تزداد شدة القوة الثانية تدريجياً ثم تعود، فينتقل حامل المحصلة وفق علاقة الكتاب. اضغط مرة أخرى لإيقافه.');
    const tick = (now) => {
      if (startTime === null) startTime = now;
      const progress = Math.min(1, (now - startTime) / duration);
      const wave = progress <= 0.5 ? progress * 2 : (1 - progress) * 2;
      state = updateLabInput(state, 'force2', min + (max - min) * wave);
      currentPresetId = null;
      render();
      if (progress < 1) {
        sweepHandle = window.requestAnimationFrame(tick);
        return;
      }
      cancelSweep();
      announceResult('انتهى العرض المتحرك.');
    };
    if (typeof window.requestAnimationFrame !== 'function') {
      setStatus('تعذّر تشغيل العرض المتحرك في هذا المتصفح؛ ما زال تحريك المنزلق متاحاً.');
      sweepButton.setAttribute('aria-pressed', 'false');
      return;
    }
    sweepHandle = window.requestAnimationFrame(tick);
  }

  renderStaticSymbols();
  renderBookSection();
  renderPlatformConcepts();
  renderBookExample();
  renderPresetButtons();
  renderChallenges();
  render();
  setStatus(`${APPENDIX_EXTENSION_LABEL}. المختبر جاهز: غيّر الشدة أو الموضع أو الجهة، وستتحدث النتيجة والرسم معاً.`);

  root.addEventListener('input', (event) => {
    const input = event.target.closest?.('[data-lab-input]');
    if (input) handleInput(input);
  });

  root.addEventListener('change', (event) => {
    const input = event.target.closest?.('[data-lab-input]');
    if (input && !input.disabled) {
      cancelSweep();
      announceResult('تأكدت قيمة المدخل.');
      return;
    }
    const radio = event.target.closest?.('[data-lab-mode]');
    if (radio) {
      state = updateLabInput(state, 'mode', radio.value);
      currentPresetId = null;
      render();
      const modeText = state.mode === SAME_SENSE ? 'الجهة الواحدة: القوتان إلى الأعلى' : 'الجهتان المتعاكستان: الأولى إلى الأعلى والثانية إلى الأسفل';
      presetObservation.innerHTML = `تجربة حرة: ${modeText}. توقّع الآن شدة المحصلة وجهتها قبل النظر إلى اللوحة.`;
      announceResult('تغيّرت جهتا القوتين.');
    }
  });

  root.addEventListener('click', (event) => {
    const presetButton = event.target.closest?.('[data-preset-id]');
    if (presetButton) {
      const preset = findPreset(presetButton.dataset.presetId);
      if (!preset) return;
      exitChallenge();
      applyState(preset.state, {
        presetId: preset.id,
        observation: `${preset.observation} ${preset.prediction}`,
        status: `حُمّلت الحالة «${preset.title}». ${preset.observation}`,
      });
      return;
    }

    const startButton = event.target.closest?.('[data-challenge-start]');
    if (startButton) {
      startChallenge(CHALLENGES.find((item) => item.id === startButton.dataset.challengeStart));
      return;
    }
    const checkButton = event.target.closest?.('[data-challenge-check]');
    if (checkButton) {
      checkChallenge(CHALLENGES.find((item) => item.id === checkButton.dataset.challengeCheck));
      return;
    }
    const challengeReset = event.target.closest?.('[data-challenge-reset]');
    if (challengeReset) {
      resetChallenge(CHALLENGES.find((item) => item.id === challengeReset.dataset.challengeReset));
      return;
    }

    if (event.target.closest?.('#load-book-example')) {
      exitChallenge();
      applyState(BOOK_WORKED_EXAMPLE.labState, {
        presetId: DEFAULT_PRESET_ID,
        observation: 'حُمّل تطبيق الكتاب المحلول: قوتان بجهة واحدة 20 N و30 N على ساق طولها 50 cm.',
        status: 'حُمّل تطبيق الكتاب المحلول في المختبر. قارن الأرقام المعروضة بحل الكتاب: 50 N و0.2 m.',
      });
      return;
    }

    if (event.target.closest?.('#sweep-lab')) {
      sweep();
      return;
    }

    if (event.target.closest?.('#reset-lab')) {
      exitChallenge({ silent: true });
      const preset = findPreset(DEFAULT_PRESET_ID);
      activeChallenge = null;
      for (const other of CHALLENGES) {
        const card = challengeList.querySelector(`[data-challenge-card="${other.id}"]`);
        card?.setAttribute('data-active', 'false');
        card?.querySelector('[data-challenge-state]')?.replaceChildren(document.createTextNode('غير مُفعّل'));
        card?.querySelector('[data-challenge-check]')?.setAttribute('hidden', '');
        card?.querySelector('[data-challenge-reset]')?.setAttribute('hidden', '');
      }
      applyState(preset.state, {
        presetId: preset.id,
        observation: `${preset.observation} ${preset.prediction}`,
        status: 'أُعيد ضبط المختبر على حالة الكتاب، وكل الضوابط صارت متاحة من جديد.',
      });
    }
  });

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (sweepHandle !== null) {
      cancelSweep();
      setStatus('أُوقف العرض المتحرك بمفتاح Escape.');
      return;
    }
    if (activeChallenge) {
      exitChallenge();
      setStatus('انتهى وضع التحدي بمفتاح Escape؛ بقيت الحالة الحالية في المختبر وكل الضوابط متاحة.');
    }
  });

  motionPreference?.addEventListener?.('change', (event) => {
    reducedMotion = event.matches;
    if (reducedMotion) cancelSweep();
  });
}

const appendixRoot = document.querySelector('[data-lesson-2-appendix]');
if (appendixRoot) mountLesson2Appendix(appendixRoot);
