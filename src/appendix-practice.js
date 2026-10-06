import { findPracticeQuestion } from './lesson-1-appendix-content.js';

/** A fresh response starts unanswered and without any revealed evaluation. */
export function createPracticeState(questionId) {
  const question = findPracticeQuestion(questionId);
  if (!question) throw new RangeError(`Unknown practice question: ${questionId}`);
  return { questionId, selectedChoice: null, submitted: false, feedbackHtml: '' };
}

/** Selecting/changing an option never evaluates it or reveals correctness. */
export function selectPracticeChoice(state, choiceId) {
  const question = findPracticeQuestion(state?.questionId);
  if (!question) throw new RangeError('Practice state does not refer to a known question.');
  const valid = question.choices.some((choice) => choice.id === choiceId);
  if (!valid) throw new RangeError(`Unknown choice for ${question.id}: ${choiceId}`);
  return { questionId: question.id, selectedChoice: choiceId, submitted: false, feedbackHtml: '' };
}

/** Evaluation is an explicit submit action and always returns explanatory feedback. */
export function checkPracticeAnswer(state) {
  const question = findPracticeQuestion(state?.questionId);
  if (!question) throw new RangeError('Practice state does not refer to a known question.');
  if (!state.selectedChoice) return { ...state, submitted: false, feedbackHtml: '', needsSelection: true };
  const isCorrect = state.selectedChoice === question.correctChoice;
  return {
    questionId: question.id,
    selectedChoice: state.selectedChoice,
    submitted: true,
    isCorrect,
    feedbackHtml: isCorrect ? question.feedbackCorrectHtml : question.feedbackIncorrectHtml,
    needsSelection: false,
  };
}
