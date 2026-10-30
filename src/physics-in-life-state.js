/*
 * Shared interaction state for «الفيزياء في حياتنا» — Lesson 1.
 *
 * Three small, pure state machines (`Object.freeze`-d, no DOM):
 *
 *   quiz      — the station self-checks. Nothing is graded before the student
 *               presses «تحقق», a retry clears only that answer, and the score
 *               is computed from the submitted answers.
 *   predict   — «توقّع ثم جرّب»: choose a prediction, change the experiment,
 *               then reveal the result with an explanation.
 *   progress  — an in-page count of explored experiences. It is NOT saved
 *               anywhere and NOT shown to the teacher; the platform has no
 *               student-results storage.
 */

export function createQuizState(questions = []) {
  return Object.freeze({
    order: Object.freeze(questions.map((question) => question.id)),
    selected: Object.freeze({}),
    submitted: Object.freeze({}),
  });
}

function assertKnownQuestion(questionId, questions) {
  const question = questions.find((candidate) => candidate.id === questionId);
  if (!question) throw new RangeError(`Unknown question: ${questionId}`);
  return question;
}

export function selectChoice(state, questionId, choiceId, questions) {
  const question = assertKnownQuestion(questionId, questions);
  if (state.submitted[questionId]) return state;
  if (!question.choices.some((choice) => choice.id === choiceId)) {
    throw new RangeError(`Unknown choice ${choiceId} for ${questionId}`);
  }
  return Object.freeze({
    ...state,
    selected: Object.freeze({ ...state.selected, [questionId]: choiceId }),
  });
}

/** Grading happens only here, and only after an explicit submit. */
export function submitQuestion(state, questionId, questions) {
  const question = assertKnownQuestion(questionId, questions);
  const choiceId = state.selected[questionId];
  if (!choiceId || state.submitted[questionId]) return state;
  const correct = choiceId === question.correctId;
  const choice = question.choices.find((candidate) => candidate.id === choiceId);
  return Object.freeze({
    ...state,
    submitted: Object.freeze({
      ...state.submitted,
      [questionId]: Object.freeze({
        choiceId,
        correct,
        correctId: question.correctId,
        explanation: question.explanation,
        choiceLabel: choice?.label ?? '',
      }),
    }),
  });
}

export function retryQuestion(state, questionId) {
  if (!state.submitted[questionId]) return state;
  const selected = { ...state.selected };
  const submitted = { ...state.submitted };
  delete selected[questionId];
  delete submitted[questionId];
  return Object.freeze({
    ...state,
    selected: Object.freeze(selected),
    submitted: Object.freeze(submitted),
  });
}

export function resetQuiz(state) {
  return Object.freeze({ ...state, selected: Object.freeze({}), submitted: Object.freeze({}) });
}

export function quizScore(state, questions) {
  const total = questions.length;
  const answered = questions.filter((question) => Boolean(state.submitted[question.id])).length;
  const correct = questions.filter((question) => state.submitted[question.id]?.correct === true).length;
  return Object.freeze({
    total,
    answered,
    correct,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
    complete: answered === total,
  });
}

/* ------------------------------------------------------------- predict mode */

export function createPredictionState() {
  return Object.freeze({ selectedId: null, checked: false, correct: null });
}

export function choosePrediction(state, optionId) {
  if (state.checked) return state;
  return Object.freeze({ ...state, selectedId: optionId });
}

export function checkPrediction(state, correctId) {
  if (state.checked || !state.selectedId) return state;
  return Object.freeze({
    selectedId: state.selectedId,
    checked: true,
    correct: state.selectedId === correctId,
  });
}

export function resetPrediction() {
  return createPredictionState();
}

/* ---------------------------------------------------------------- progress  */

export function createProgress(experienceIds = []) {
  return Object.freeze({
    ids: Object.freeze([...experienceIds]),
    seen: Object.freeze([]),
  });
}

export function markExperience(progress, id, experienceIds) {
  if (!experienceIds.includes(id)) return progress;
  if (progress.seen.includes(id)) return progress;
  return Object.freeze({ ...progress, seen: Object.freeze([...progress.seen, id]) });
}

export function progressSummary(progress) {
  const total = progress.ids.length;
  const seen = progress.seen.length;
  return Object.freeze({
    seen,
    total,
    percent: total === 0 ? 0 : Math.round((seen / total) * 100),
  });
}

/* ------------------------------------------------------- gallery point pick */

/**
 * Evaluate a clicked point of effect. The model compares the point's meaning,
 * never its pixel offset; a wrong pick returns the reason authored for it.
 */
export function selectPointOfEffect(example, pointId) {
  const points = example.points ?? [];
  const point = points.find((candidate) => candidate.id === pointId);
  if (!point) return null;
  return Object.freeze({
    pointId,
    correct: pointId === example.correctPointId,
    message: pointId === example.correctPointId
      ? example.pointFeedback?.correct ?? 'أحسنت، هذه هي نقطة التأثير الصحيحة.'
      : point.wrongMessage ?? example.pointFeedback?.incorrect ?? 'أعد النظر: القوة تُرسم من النقطة التي تؤثر فيها فعلاً.',
    label: point.label,
  });
}
