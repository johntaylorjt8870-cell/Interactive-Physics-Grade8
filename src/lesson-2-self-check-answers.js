import { SELF_CHECK_ITEMS } from './lesson-2-practice-data.js';

export const LESSON_2_SELF_CHECK_ANSWERS = Object.freeze({
  '70-1': Object.freeze({ correct: 'a' }),
  '70-2': Object.freeze({ correct: 'c' }),
  '70-3': Object.freeze({ correct: 'c' }),
  '70-4': Object.freeze({ correct: 'a' }),
});

export function lesson2SelfCheckAnswer(key) {
  return SELF_CHECK_ITEMS[key] ?? LESSON_2_SELF_CHECK_ANSWERS[key] ?? null;
}
