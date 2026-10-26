/**
 * Re-render-safe answer state for the «اختر الإجابة» widgets of Lesson 2 (p70).
 *
 * `src/lesson-2-main.js` replaces `#page-content` on every step change, so the
 * four self-check radios — and their verdict, hint level and retry state — used
 * to disappear as soon as the student visited another page and came back. The
 * same pure reducers that fixed Lesson 1 in PR #34 are reused here with their
 * own storage key; no grading happens before the student presses «تحقّق» and a
 * changed answer always drops the old verdict.
 *
 * The store is deliberately DOM-free so the whole contract can be tested with
 * `node --test`, including the "leave the step and come back" case.
 */

import {
  clearChoice,
  loadChoices,
  readChoice,
  revealHint,
  saveChoices,
  selectChoice,
  verifyChoice,
} from './lesson-1-choice-state.js';

export const LESSON_2_CHOICE_STORAGE_KEY = 'physics8.lesson2.choice.v1';
export const LESSON_2_CHOICE_CODES = Object.freeze(['a', 'b', 'c', 'd']);

/** Normalized spec: one entry per printed question, with its hint budget. */
export function lesson2ChoiceSpec(items) {
  return Object.freeze(Object.fromEntries(
    Object.entries(items ?? {}).map(([key, item]) => [key, Object.freeze({
      choices: LESSON_2_CHOICE_CODES,
      hints: item?.hints?.length ?? 0,
    })]),
  ));
}

/**
 * @param {object} items SELF_CHECK_ITEMS (keys match data-selfcheck-item)
 * @param {Storage|null} storage injectable for tests; defaults to localStorage
 * @param {string} storageKey separate namespace from Lesson 1
 */
export function createLesson2ChoiceStore(items, storage = null, storageKey = LESSON_2_CHOICE_STORAGE_KEY) {
  const spec = lesson2ChoiceSpec(items);
  let state = loadChoices(storage, spec, storageKey);

  const settings = (key) => spec[key] ?? { choices: null, hints: null };
  const has = (key) => Object.hasOwn(spec, key);
  const read = (key) => {
    const { choices, hints } = settings(key);
    return readChoice(state, key, choices, hints);
  };
  const commit = (next) => {
    state = next;
    saveChoices(state, storage, storageKey);
  };

  return Object.freeze({
    /** Known, ungraded key? Unknown keys read as untouched. */
    has,
    read,
    /** Record a pick; any previous verdict is intentionally dropped. */
    select(key, code) {
      if (!has(key)) return read(key);
      const { choices, hints } = settings(key);
      commit(selectChoice(state, key, code, choices, hints));
      return read(key);
    },
    /** Grade the current pick. An empty/invalid pick leaves the state alone. */
    verify(key, code, correctChoice = items?.[key]?.correct) {
      if (!has(key)) return read(key);
      const { choices, hints } = settings(key);
      commit(verifyChoice(state, key, code, correctChoice, choices, hints));
      return read(key);
    },
    /** Advance the progressive hint counter, capped at the authored hints. */
    hint(key) {
      if (!has(key)) return read(key);
      const { choices, hints } = settings(key);
      commit(revealHint(state, key, hints, choices));
      return read(key);
    },
    /** «أعد المحاولة» clears choice, verdict, hints and retry state. */
    reset(key) {
      if (!has(key)) return read(key);
      commit(clearChoice(state, key));
      return read(key);
    },
  });
}
