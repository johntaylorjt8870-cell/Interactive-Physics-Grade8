/*
 * Interaction state for the Unit 2 Lesson 1 appendix — «مختبر الشحنات».
 *
 * Two state machines live here, both pure so they can be unit-tested without a
 * browser:
 *
 *   1. the station flow: which station is open, which ones the student has
 *      already visited, and how far they have got. Stations are kept mounted, so
 *      going back to a station shows the student's own last state instead of a
 *      reset scene;
 *   2. the detective challenge: an answer is never evaluated before an explicit
 *      submit, every choice carries its own explanation, and a retry clears the
 *      answer without any penalty — the attempt counter is information only and
 *      never lowers a score.
 */

import { APPENDIX_STATIONS, DETECTIVE_QUESTIONS, findDetectiveQuestion, findStation } from './unit2-lesson1-appendix-content.js';

/* ------------------------------------------------------------ station flow */

/** The flow starts on the first station, with it already counted as visited. */
export function createStationFlow(startId = APPENDIX_STATIONS[0].id) {
  const station = findStation(startId);
  const index = APPENDIX_STATIONS.findIndex((candidate) => candidate.id === station.id);
  return Object.freeze({
    stations: APPENDIX_STATIONS,
    activeId: station.id,
    activeIndex: index,
    total: APPENDIX_STATIONS.length,
    station,
    visitedIds: Object.freeze([station.id]),
    visitedCount: 1,
    progressPercent: Math.round(((index + 1) / APPENDIX_STATIONS.length) * 100),
    discoveryPercent: Math.round((1 / APPENDIX_STATIONS.length) * 100),
    canGoBack: index > 0,
    canGoForward: index < APPENDIX_STATIONS.length - 1,
  });
}

/**
 * Open a station by id or by index. Unknown ids are rejected loudly: a broken
 * deep link must never silently drop the student somewhere else.
 */
export function goToStation(flow, target) {
  const station = typeof target === 'number'
    ? APPENDIX_STATIONS[target]
    : findStation(target);
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

/** The neighbour labels used by the prev/next controls. */
export function stationNeighbours(flow) {
  return Object.freeze({
    previous: flow.activeIndex > 0 ? APPENDIX_STATIONS[flow.activeIndex - 1] : null,
    next: flow.activeIndex < flow.total - 1 ? APPENDIX_STATIONS[flow.activeIndex + 1] : null,
  });
}

/** Read a station id out of a location hash such as `#station-coulomb`. */
export function stationIdFromHash(hash) {
  const raw = String(hash ?? '').replace(/^#/, '');
  if (!raw.startsWith('station-')) return null;
  const id = raw.slice('station-'.length);
  return APPENDIX_STATIONS.some((station) => station.id === id) ? id : null;
}

export const stationHash = (stationId) => `#station-${stationId}`;

/* ------------------------------------------------- detective challenge flow */

/** A fresh answer: nothing selected, nothing revealed, no attempts yet. */
export function createQuizState(questionId) {
  const question = findDetectiveQuestion(questionId);
  return Object.freeze({
    questionId: question.id,
    selectedChoice: null,
    submitted: false,
    isCorrect: null,
    feedbackHtml: '',
    attempts: 0,
  });
}

/** Picking or changing an option never evaluates it. */
export function selectQuizChoice(state, choiceId) {
  const question = findDetectiveQuestion(state?.questionId);
  if (!question.choices.some((choice) => choice.id === choiceId)) {
    throw new RangeError(`Unknown choice "${choiceId}" for question ${question.id}.`);
  }
  return Object.freeze({ ...state, selectedChoice: choiceId, submitted: false, isCorrect: null, feedbackHtml: '' });
}

/** Evaluation happens only on an explicit submit, and always explains itself. */
export function submitQuizAnswer(state) {
  const question = findDetectiveQuestion(state?.questionId);
  if (!state.selectedChoice) {
    return Object.freeze({ ...state, submitted: false, isCorrect: null, feedbackHtml: '', needsSelection: true });
  }
  const choice = question.choices.find((candidate) => candidate.id === state.selectedChoice);
  const isCorrect = choice.id === question.correctChoice;
  return Object.freeze({
    ...state,
    submitted: true,
    isCorrect,
    feedbackHtml: choice.feedbackHtml,
    needsSelection: false,
    attempts: state.attempts + 1,
  });
}

/**
 * Retry: the selection and the revealed feedback disappear, the attempt counter
 * stays as plain information. Nothing is subtracted, nothing is locked.
 */
export function retryQuizQuestion(state) {
  return Object.freeze({
    questionId: state.questionId,
    selectedChoice: null,
    submitted: false,
    isCorrect: null,
    feedbackHtml: '',
    attempts: state.attempts,
    needsSelection: false,
  });
}

/** Whole-challenge progress, reported without any grading pressure. */
export function quizProgress(states) {
  const list = Object.values(states ?? {});
  const answered = list.filter((state) => state.submitted);
  const correct = answered.filter((state) => state.isCorrect === true);
  return Object.freeze({
    total: DETECTIVE_QUESTIONS.length,
    attempted: new Set(answered.map((state) => state.questionId)).size,
    solved: new Set(correct.map((state) => state.questionId)).size,
    remaining: DETECTIVE_QUESTIONS.length - new Set(correct.map((state) => state.questionId)).size,
    percent: Math.round((new Set(correct.map((state) => state.questionId)).size / DETECTIVE_QUESTIONS.length) * 100),
  });
}

/** Every question must be answerable and must explain every choice. */
export function quizIntegrityReport() {
  return Object.freeze(DETECTIVE_QUESTIONS.map((question) => Object.freeze({
    id: question.id,
    stationRef: question.stationRef,
    choices: question.choices.length,
    correctChoice: question.correctChoice,
    everyChoiceExplained: question.choices.every((choice) => (choice.feedbackHtml ?? '').length > 40),
    correctChoiceIsPresent: question.choices.some((choice) => choice.id === question.correctChoice),
    contextsDistinct: question.context.trim().length > 20,
  })));
}
