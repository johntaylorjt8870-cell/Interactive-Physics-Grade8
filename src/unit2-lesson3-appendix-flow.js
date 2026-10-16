/*
 * Interaction state for the Unit 2 Lesson 3 appendix —
 * «محطة الفولت — اكشف فرق الكمون».
 *
 * Three pure state machines live here, so the appendix's behaviour can be
 * tested without a browser:
 *
 *   1. the station flow: which station is open, which ones have already been
 *      visited, and how far the student is. Stations stay mounted, so returning
 *      to one shows the student's own last state instead of a reset bench;
 *   2. the answer state of every question kind in this appendix — a choice, an
 *      ordering task, a numeric answer and the appendix's own `probe` kind, in
 *      which the student places two measurement points on a drawn bench and the
 *      model (never a stored key) decides which pairs are correct. Nothing is
 *      ever evaluated before an explicit submit, every wrong path still
 *      explains the physics, invalid input is reported as invalid (never as a
 *      wrong answer), and a retry clears the answer without any penalty;
 *   3. the self-check list of the concept-map station, a mirror of the four
 *      printed objectives and never a score.
 */

import {
  ALL_QUESTIONS,
  APPENDIX_KEYWORDS,
  APPENDIX_OBJECTIVES,
  APPENDIX_STATIONS,
  CHECKLIST_ITEMS,
  CONCEPT_LINKS,
  CONCEPT_NODES,
  DETECTIVE_FEEDBACK_CORRECT_HEADLINE,
  DETECTIVE_FEEDBACK_INCORRECT_HEADLINE,
  DETECTIVE_FEEDBACK_INVALID_HEADLINE,
  findQuestion,
  findStation,
  questionsOfStation,
} from './unit2-lesson3-appendix-content.js';
import { probePairsEqual, voltmeterReading, createCircuit } from './unit2-lesson3-appendix-physics.js';

/* ------------------------------------------------------------ station flow */

export const TOTAL_STATIONS = APPENDIX_STATIONS.length;

/** The flow starts on the first station, with it already counted as visited. */
export function createStationFlow(startId = APPENDIX_STATIONS[0].id) {
  const station = findStation(startId);
  const index = APPENDIX_STATIONS.findIndex((candidate) => candidate.id === station.id);
  return Object.freeze({
    stations: APPENDIX_STATIONS,
    activeId: station.id,
    activeIndex: index,
    total: TOTAL_STATIONS,
    station,
    visitedIds: Object.freeze([station.id]),
    visitedCount: 1,
    progressPercent: Math.round(((index + 1) / TOTAL_STATIONS) * 100),
    discoveryPercent: Math.round((1 / TOTAL_STATIONS) * 100),
    canGoBack: index > 0,
    canGoForward: index < TOTAL_STATIONS - 1,
  });
}

/**
 * Open a station by id or by index. Unknown ids are rejected loudly: a broken
 * deep link must never silently drop the student somewhere else.
 */
export function goToStation(flow, target) {
  const station = typeof target === 'number' ? APPENDIX_STATIONS[target] : findStation(target);
  if (!station) throw new RangeError(`Unknown station: ${target}`);
  const index = APPENDIX_STATIONS.findIndex((candidate) => candidate.id === station.id);
  const visited = flow.visitedIds.includes(station.id) ? flow.visitedIds : [...flow.visitedIds, station.id];
  return Object.freeze({
    ...flow,
    activeId: station.id,
    activeIndex: index,
    station,
    visitedIds: Object.freeze(visited),
    visitedCount: visited.length,
    progressPercent: Math.round(((index + 1) / flow.total) * 100),
    discoveryPercent: Math.round((visited.length / flow.total) * 100),
    canGoBack: index > 0,
    canGoForward: index < flow.total - 1,
  });
}

/** One step forward or back, clamped at both ends. */
export function stepStation(flow, delta) {
  const step = Number(delta);
  if (!Number.isInteger(step) || step === 0) throw new RangeError('Station step must be a non-zero integer.');
  const index = Math.max(0, Math.min(flow.total - 1, flow.activeIndex + step));
  return goToStation(flow, APPENDIX_STATIONS[index].id);
}

export const nextStation = (flow) => stepStation(flow, 1);
export const previousStation = (flow) => stepStation(flow, -1);

/** The neighbour labels used by the previous/next controls. */
export function stationNeighbours(flow) {
  return Object.freeze({
    previous: flow.activeIndex > 0 ? APPENDIX_STATIONS[flow.activeIndex - 1] : null,
    next: flow.activeIndex < flow.total - 1 ? APPENDIX_STATIONS[flow.activeIndex + 1] : null,
  });
}

/** Read a station id out of a location hash such as `#station-sum`. */
export function stationIdFromHash(hash) {
  const raw = String(hash ?? '').replace(/^#/, '');
  if (!raw.startsWith('station-')) return null;
  const id = raw.slice('station-'.length);
  return APPENDIX_STATIONS.some((station) => station.id === id) ? id : null;
}

export const stationHash = (stationId) => `#station-${stationId}`;

/* ------------------------------------------------------------- answer state */

/**
 * The starting order of an ordering task: the correct sequence rotated by one,
 * so it is never already solved, and it is the same on every visit.
 */
export function initialOrder(question) {
  const sorted = [...question.items].sort((a, b) => a.position - b.position).map((item) => item.id);
  if (sorted.length < 2) return sorted;
  return Object.freeze([...sorted.slice(1), sorted[0]]);
}

const parseNumberAnswer = (raw) => {
  const text = String(raw ?? '').trim();
  if (text === '') return Object.freeze({ status: 'empty' });
  const normalised = text
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\u066B/g, '.')
    .replace(/,/g, '.')
    .replace(/\s+/g, '');
  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i.test(normalised)) return Object.freeze({ status: 'unreadable' });
  const value = Number(normalised);
  if (!Number.isFinite(value)) return Object.freeze({ status: 'unreadable' });
  return Object.freeze({ status: 'ok', value });
};

/** A fresh answer: nothing chosen, nothing revealed, no attempts yet. */
export function createAnswerState(questionId) {
  const question = findQuestion(questionId);
  if (!question) throw new RangeError(`Unknown question: ${questionId}`);
  const base = {
    questionId: question.id,
    kind: question.kind,
    submitted: false,
    status: null,
    feedbackHtml: '',
    attempts: 0,
    needsInput: false,
  };
  if (question.kind === 'choice') return Object.freeze({ ...base, choiceId: null });
  if (question.kind === 'order') return Object.freeze({ ...base, order: initialOrder(question) });
  if (question.kind === 'number') return Object.freeze({ ...base, numberRaw: '' });
  if (question.kind === 'probe') return Object.freeze({ ...base, red: null, black: null });
  throw new RangeError(`Unsupported question kind: ${question.kind}`);
}

/** Picking or changing an option never evaluates it. */
export function selectAnswer(state, choiceId) {
  const question = findQuestion(state?.questionId);
  if (question.kind !== 'choice') throw new RangeError(`${question.id} is not a choice question.`);
  if (!question.choices.some((choice) => choice.id === choiceId)) {
    throw new RangeError(`Unknown choice "${choiceId}" for question ${question.id}.`);
  }
  return Object.freeze({ ...state, choiceId, submitted: false, status: null, feedbackHtml: '', needsInput: false });
}

/** Typing a numeric answer never evaluates it either. */
export function setNumberAnswer(state, raw) {
  const question = findQuestion(state?.questionId);
  if (question.kind !== 'number') throw new RangeError(`${question.id} is not a numeric question.`);
  return Object.freeze({ ...state, numberRaw: String(raw ?? ''), submitted: false, status: null, feedbackHtml: '', needsInput: false });
}

/** Move one statement up or down inside an ordering task. */
export function moveOrderItem(state, itemId, delta) {
  const question = findQuestion(state?.questionId);
  if (question.kind !== 'order') throw new RangeError(`${question.id} is not an ordering question.`);
  const index = state.order.indexOf(itemId);
  if (index < 0) throw new RangeError(`Unknown item "${itemId}" for question ${question.id}.`);
  const step = Number(delta);
  if (!Number.isInteger(step) || step === 0) throw new RangeError('Order step must be a non-zero integer.');
  const target = Math.max(0, Math.min(state.order.length - 1, index + step));
  if (target === index) return state;
  const order = [...state.order];
  order.splice(index, 1);
  order.splice(target, 0, itemId);
  return Object.freeze({ ...state, order: Object.freeze(order), submitted: false, status: null, feedbackHtml: '', needsInput: false });
}

/** Place one of the two probes of a probe question on a measurement point. */
export function setProbe(state, probe, nodeId) {
  const question = findQuestion(state?.questionId);
  if (question.kind !== 'probe') throw new RangeError(`${question.id} is not a probe question.`);
  if (probe !== 'red' && probe !== 'black') throw new RangeError('A probe is either red or black.');
  const circuit = createCircuit(question.circuit);
  if (!circuit.nodes.some((point) => point.id === nodeId)) {
    throw new RangeError(`Unknown measurement point "${nodeId}" on the bench of ${question.id}.`);
  }
  const next = { ...state, [probe]: nodeId, submitted: false, status: null, feedbackHtml: '', needsInput: false };
  /* the two probes may never touch the same point */
  if (next.red && next.red === next.black) {
    next[probe === 'red' ? 'black' : 'red'] = null;
  }
  return Object.freeze(next);
}

const tick = (ok) => (ok ? '<span class="u2l3a-tick" aria-hidden="true">✓</span>' : '<span class="u2l3a-cross" aria-hidden="true">✗</span>');

const POSITION_WORDS = Object.freeze(['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة']);
const positionWord = (index) => POSITION_WORDS[index] ?? `رقم ${index + 1}`;

function evaluateChoice(question, state) {
  const choice = question.choices.find((candidate) => candidate.id === state.choiceId);
  const correct = choice.correct === true;
  const headline = correct ? DETECTIVE_FEEDBACK_CORRECT_HEADLINE : DETECTIVE_FEEDBACK_INCORRECT_HEADLINE;
  const feedback = [
    `<p class="u2l3a-feedback-headline">${headline}</p>`,
    choice.feedbackHtml,
    question.explanationHtml ? `<div class="u2l3a-feedback-explain"><p class="u2l3a-feedback-label">التفسير العلمي</p>${question.explanationHtml}</div>` : '',
  ].join('');
  return { status: correct ? 'correct' : 'incorrect', feedbackHtml: feedback };
}

function evaluateOrder(question, state) {
  const correctOrder = [...question.items].sort((a, b) => a.position - b.position).map((item) => item.id);
  const rows = state.order.map((itemId, index) => {
    const item = question.items.find((candidate) => candidate.id === itemId);
    const ok = correctOrder.indexOf(itemId) === index;
    return `<li class="u2l3a-order-row${ok ? ' is-correct' : ' is-wrong'}">${tick(ok)}<span>${item.label}</span><small>موضعه الصحيح: المرتبة ${positionWord(correctOrder.indexOf(itemId))}</small></li>`;
  }).join('');
  const correct = state.order.every((itemId, index) => correctOrder[index] === itemId);
  const headline = correct ? DETECTIVE_FEEDBACK_CORRECT_HEADLINE : DETECTIVE_FEEDBACK_INCORRECT_HEADLINE;
  const feedback = [
    `<p class="u2l3a-feedback-headline">${headline}</p>`,
    `<ol class="u2l3a-order-check">${rows}</ol>`,
    question.explanationHtml ? `<div class="u2l3a-feedback-explain"><p class="u2l3a-feedback-label">التفسير العلمي</p>${question.explanationHtml}</div>` : '',
  ].join('');
  return { status: correct ? 'correct' : 'incorrect', feedbackHtml: feedback };
}

function evaluateNumber(question, state) {
  const parsed = parseNumberAnswer(state.numberRaw);
  if (parsed.status !== 'ok' || parsed.value < 0) {
    const message = parsed.status === 'empty'
      ? 'اكتب قيمة عددية أولاً، ثم اضغط «تحقّق».'
      : parsed.status === 'unreadable'
        ? 'المدخل غير صالح: اكتب رقماً بالأرقام فقط (مثال: 7 أو 0.5).'
        : 'القيمة سالبة: فروق الكمون في هذه المسائل مقادير غير سالبة.';
    return {
      status: 'invalid',
      feedbackHtml: `<p class="u2l3a-feedback-headline">${DETECTIVE_FEEDBACK_INVALID_HEADLINE}</p><p>${message}</p>${question.hintHtml ? `<div class="u2l3a-feedback-hint"><p class="u2l3a-feedback-label">تلميح</p>${question.hintHtml}</div>` : ''}`,
    };
  }
  const tolerance = question.tolerance ?? 1e-9;
  const correct = Math.abs(parsed.value - question.expected) <= Math.max(tolerance, Math.abs(question.expected) * 1e-6);
  const headline = correct ? DETECTIVE_FEEDBACK_CORRECT_HEADLINE : DETECTIVE_FEEDBACK_INCORRECT_HEADLINE;
  const feedback = [
    `<p class="u2l3a-feedback-headline">${headline}</p>`,
    correct ? '' : '<p>الحلّ الصحيح خطوة بخطوة:</p>',
    question.solutionHtml ?? '',
    question.explanationHtml ? `<div class="u2l3a-feedback-explain"><p class="u2l3a-feedback-label">التفسير العلمي</p>${question.explanationHtml}</div>` : '',
  ].join('');
  return { status: correct ? 'correct' : 'incorrect', feedbackHtml: feedback };
}

/**
 * The probe kind is graded by the electrical model itself: the chosen pair of
 * measurement points is read with `voltmeterReading`, and it is correct when
 * the pair is one of the question's accepted pairs — which the model confirms
 * by giving the expected reading on it.
 */
function evaluateProbe(question, state) {
  const circuit = createCircuit(question.circuit);
  const reading = voltmeterReading(circuit, state.red, state.black);
  const accepted = probePairsEqual([state.red, state.black], question.correctPairs);
  const nodeLabel = (id) => circuit.nodes.find((point) => point.id === id)?.label ?? id;
  const nodeLetter = (id) => circuit.nodes.find((point) => point.id === id)?.letter ?? id;
  const rows = [
    `<li>المجسّ الأحمر عند النقطة <bdi dir="ltr">${nodeLetter(state.red)}</bdi>: ${nodeLabel(state.red)}</li>`,
    `<li>المجسّ الأسود عند النقطة <bdi dir="ltr">${nodeLetter(state.black)}</bdi>: ${nodeLabel(state.black)}</li>`,
    `<li>قراءة النموذج على هذا التوصيل: <bdi dir="ltr">${reading.magnitude} V</bdi>${accepted ? ` — وهي القراءة المطلوبة (${question.expectedReading} V).` : ` — بينما القراءة المطلوبة ${question.expectedReading} V.`}</li>`,
  ].join('');
  const headline = accepted ? DETECTIVE_FEEDBACK_CORRECT_HEADLINE : DETECTIVE_FEEDBACK_INCORRECT_HEADLINE;
  const feedback = [
    `<p class="u2l3a-feedback-headline">${headline}</p>`,
    `<ul class="u2l3a-probe-check">${rows}</ul>`,
    question.explanationHtml ? `<div class="u2l3a-feedback-explain"><p class="u2l3a-feedback-label">التفسير العلمي</p>${question.explanationHtml}</div>` : '',
  ].join('');
  return { status: accepted ? 'correct' : 'incorrect', feedbackHtml: feedback };
}

/** Evaluation happens only on an explicit submit, and always explains itself. */
export function submitAnswer(state) {
  const question = findQuestion(state?.questionId);
  if (question.kind === 'choice') {
    if (!state.choiceId) {
      return Object.freeze({ ...state, submitted: false, status: null, feedbackHtml: '', needsInput: true });
    }
    return Object.freeze({ ...state, ...evaluateChoice(question, state), submitted: true, needsInput: false, attempts: state.attempts + 1 });
  }
  if (question.kind === 'number') {
    const result = evaluateNumber(question, state);
    return Object.freeze({
      ...state,
      ...result,
      submitted: result.status === 'invalid' ? false : true,
      needsInput: result.status === 'invalid',
      attempts: result.status === 'invalid' ? state.attempts : state.attempts + 1,
    });
  }
  if (question.kind === 'order') {
    return Object.freeze({ ...state, ...evaluateOrder(question, state), submitted: true, needsInput: false, attempts: state.attempts + 1 });
  }
  if (question.kind === 'probe') {
    if (!state.red || !state.black) {
      return Object.freeze({ ...state, submitted: false, status: null, feedbackHtml: '', needsInput: true });
    }
    return Object.freeze({ ...state, ...evaluateProbe(question, state), submitted: true, needsInput: false, attempts: state.attempts + 1 });
  }
  throw new RangeError(`Unsupported question kind: ${question.kind}`);
}

/** True when the student has given something the appendix is allowed to check. */
export function answerIsReady(state) {
  const question = findQuestion(state?.questionId);
  if (question.kind === 'choice') return Boolean(state.choiceId);
  if (question.kind === 'number') return String(state.numberRaw ?? '').trim() !== '';
  if (question.kind === 'probe') return Boolean(state.red && state.black);
  return true;
}

/**
 * Retry: the answer and the revealed feedback disappear, the attempt counter
 * stays as plain information. Nothing is subtracted and nothing is locked.
 */
export function retryAnswer(state) {
  const question = findQuestion(state?.questionId);
  return Object.freeze({
    ...state,
    choiceId: question.kind === 'choice' ? null : state.choiceId,
    numberRaw: question.kind === 'number' ? '' : state.numberRaw,
    order: question.kind === 'order' ? initialOrder(question) : state.order,
    red: question.kind === 'probe' ? null : state.red,
    black: question.kind === 'probe' ? null : state.black,
    submitted: false,
    status: null,
    feedbackHtml: '',
    needsInput: false,
  });
}

/** Whole-challenge progress, reported without any grading pressure. */
export function answerProgress(states) {
  const list = Object.values(states ?? {});
  const answered = list.filter((state) => state.submitted);
  const solvedIds = new Set(answered.filter((state) => state.status === 'correct').map((state) => state.questionId));
  const attemptedIds = new Set(answered.map((state) => state.questionId));
  return Object.freeze({
    total: ALL_QUESTIONS.length,
    attempted: attemptedIds.size,
    solved: solvedIds.size,
    remaining: ALL_QUESTIONS.length - solvedIds.size,
    percent: Math.round((solvedIds.size / ALL_QUESTIONS.length) * 100),
  });
}

/** Progress inside the detective station alone. */
export function stationAnswerProgress(stationId, states) {
  const questions = questionsOfStation(stationId);
  const solved = new Set(questions
    .map((question) => states?.[question.id])
    .filter((state) => state?.submitted && state.status === 'correct')
    .map((state) => state.questionId));
  const attempted = new Set(questions
    .map((question) => states?.[question.id])
    .filter((state) => state?.submitted)
    .map((state) => state.questionId));
  return Object.freeze({
    total: questions.length,
    attempted: attempted.size,
    solved: solved.size,
    percent: questions.length === 0 ? 0 : Math.round((solved.size / questions.length) * 100),
  });
}

/** Every question must be answerable and must explain every path. */
export function questionsIntegrityReport() {
  return Object.freeze(ALL_QUESTIONS.map((question) => Object.freeze({
    id: question.id,
    kind: question.kind,
    pageRef: question.pageRef ?? null,
    source: question.source ?? 'platform',
    promptIsSubstantive: String(question.prompt ?? '').trim().length > 20,
    explanationIsSubstantive: String(question.explanationHtml ?? '').length > 40,
    everyChoiceExplained: question.kind !== 'choice'
      || question.choices.every((choice) => (choice.feedbackHtml ?? '').length > 60),
    exactlyOneCorrectChoice: question.kind !== 'choice'
      || question.choices.filter((choice) => choice.correct).length === 1,
    orderPositionsComplete: question.kind !== 'order'
      || [...question.items].map((item) => item.position).sort((a, b) => a - b).join(',') === question.items.map((_, index) => index).join(','),
    numericTargetDeclared: question.kind !== 'number'
      || (Number.isFinite(question.expected) && typeof question.unit === 'string'),
    probePairsReachable: question.kind !== 'probe'
      || (question.correctPairs.length > 0
        && question.correctPairs.every((pair) => {
          const nodes = createCircuit(question.circuit).nodes;
          return nodes.some((node) => node.id === pair[0]) && nodes.some((node) => node.id === pair[1]);
        })),
    probeReadingConsistent: question.kind !== 'probe'
      || question.correctPairs.every((pair) => Math.abs(Math.abs(voltmeterReading(createCircuit(question.circuit), pair[0], pair[1]).value) - question.expectedReading) < 1e-9),
  })));
}

/* ------------------------------------------------------- self-check list */

export function createChecklistState() {
  return Object.freeze(Object.fromEntries(CHECKLIST_ITEMS.map((item) => [item.id, false])));
}

export function toggleChecklistItem(state, itemId) {
  if (!Object.prototype.hasOwnProperty.call(state, itemId)) throw new RangeError(`Unknown checklist item: ${itemId}`);
  return Object.freeze({ ...state, [itemId]: !state[itemId] });
}

export function checklistProgress(state) {
  const done = CHECKLIST_ITEMS.filter((item) => state[item.id] === true);
  return Object.freeze({
    total: CHECKLIST_ITEMS.length,
    done: done.length,
    remaining: CHECKLIST_ITEMS.length - done.length,
    percent: Math.round((done.length / CHECKLIST_ITEMS.length) * 100),
    complete: done.length === CHECKLIST_ITEMS.length,
    doneObjectiveIds: Object.freeze(done.map((item) => item.objectiveId)),
  });
}

/* -------------------------------------------------------- scope integrity */

/**
 * The appendix may only show what it can justify: every objective, keyword,
 * station, question and concept node has to be wired into the product, and the
 * four printed objectives must each be served by at least one station and one
 * self-check row.
 */
export function appendixCoverageReport() {
  const stationIds = APPENDIX_STATIONS.map((station) => station.id);
  const objectiveIds = APPENDIX_OBJECTIVES.map((objective) => objective.id);
  const keywordLabels = APPENDIX_KEYWORDS.map((keyword) => keyword.label);
  const stationKeywordCoverage = APPENDIX_STATIONS.map((station) => Object.freeze({
    station: station.id,
    keywords: station.keywords.length,
    objectives: station.objectiveIds.length,
    allKeywordsKnown: station.keywords.every((keyword) => keywordLabels.includes(keyword)),
    allObjectivesKnown: station.objectiveIds.every((objectiveId) => objectiveIds.includes(objectiveId)),
  }));
  const nodeStations = CONCEPT_NODES.map((node) => node.stationId);
  return Object.freeze({
    stationCount: stationIds.length,
    objectiveCount: objectiveIds.length,
    keywordCount: keywordLabels.length,
    questionCount: ALL_QUESTIONS.length,
    questionKinds: Object.freeze([...new Set(ALL_QUESTIONS.map((question) => question.kind))].sort()),
    stationKeywordCoverage: Object.freeze(stationKeywordCoverage),
    everyStationServesAnObjective: APPENDIX_STATIONS.every((station) => station.objectiveIds.length > 0),
    everyKeywordTaughtSomewhere: keywordLabels.every((keyword) => APPENDIX_STATIONS.some((station) => station.keywords.includes(keyword))),
    everyObjectiveHasAStation: objectiveIds.every((objectiveId) => APPENDIX_STATIONS.some((station) => station.objectiveIds.includes(objectiveId))),
    everyObjectiveHasAChecklistItem: objectiveIds.every((objectiveId) => CHECKLIST_ITEMS.some((item) => item.objectiveId === objectiveId)),
    everyConceptNodeOpensAStation: nodeStations.every((stationId) => stationIds.includes(stationId)),
    everyLinkConnectsKnownNodes: CONCEPT_LINKS.every((link) => (
      CONCEPT_NODES.some((node) => node.id === link.from) && CONCEPT_NODES.some((node) => node.id === link.to)
    )),
    linksDoNotSelfLoop: CONCEPT_LINKS.every((link) => link.from !== link.to),
  });
}
