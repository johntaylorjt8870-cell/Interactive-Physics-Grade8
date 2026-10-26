/**
 * Re-render-safe answer state for the «اختر الإجابة» widgets of Lesson 1.
 *
 * `src/main.js` replaces the whole stage markup on every step change
 * (`pageContent.innerHTML = …`), so a radio that is merely checked in the DOM
 * loses both the choice and the verdict as soon as the student visits another
 * stage and comes back. The lesson therefore keeps the answers outside the DOM:
 * one flat map keyed by widget id, reduced by the pure functions below so the
 * contract can be tested with `node --test` (no browser, no jsdom).
 *
 * Entry shape:
 *   { choice, checked, isCorrect, hintLevel, revealed }
 *
 * Invariants that matter for the student experience:
 *   1. `commitChoice` refuses to grade a question with no choice, so the answer
 *      can never be revealed before the student actually picks an option.
 *   2. `selectChoice` always clears `checked`/`isCorrect`/`revealed`: changing an
 *      answer must not keep an old verdict (or an old correction) attached to
 *      the new choice.
 *   3. `revealCorrection` only opens the worked correction for a committed wrong
 *      attempt, so the full solution is never on screen on its own.
 */

export const CHOICE_STORAGE_KEY = 'physics8.lesson1.choice.v1';

const clampHintLevel = (value, totalHints = Number.POSITIVE_INFINITY) => {
  const numeric = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
  return Math.min(Math.max(numeric, 0), Math.max(0, totalHints));
};

export function emptyChoiceState() {
  return {};
}

/** Normalized read; unknown/malformed entries read as untouched. */
export function readChoice(state, key, allowedChoices = null, totalHints = null) {
  const entry = { choice: null, checked: false, isCorrect: false, hintLevel: 0, revealed: false };
  const raw = state?.[key];
  if (!raw || typeof raw !== 'object') return entry;
  const allowed = Array.isArray(allowedChoices) ? allowedChoices : null;
  if (typeof raw.choice === 'string' && (!allowed || allowed.includes(raw.choice))) {
    entry.choice = raw.choice;
  }
  entry.hintLevel = clampHintLevel(raw.hintLevel, totalHints ?? undefined);
  entry.checked = Boolean(raw.checked) && entry.choice !== null;
  entry.isCorrect = entry.checked && Boolean(raw.isCorrect);
  entry.revealed = entry.checked && !entry.isCorrect && Boolean(raw.revealed);
  return entry;
}

/** Records a pick. Any previous verdict is dropped on purpose. */
export function selectChoice(state, key, choice, allowedChoices = null, totalHints = null) {
  const allowed = Array.isArray(allowedChoices) ? allowedChoices : null;
  if (typeof choice !== 'string' || (allowed && !allowed.includes(choice))) return state;
  const current = readChoice(state, key, allowed, totalHints);
  return {
    ...state,
    [key]: { choice, checked: false, isCorrect: false, hintLevel: current.hintLevel, revealed: false },
  };
}

/** Grades the recorded pick. No choice → no verdict (never reveals early). */
export function commitChoice(state, key, correctChoice, allowedChoices = null, totalHints = null) {
  const current = readChoice(state, key, allowedChoices, totalHints);
  if (current.choice === null) return state;
  const isCorrect = current.choice === correctChoice;
  return {
    ...state,
    // a correct pick never carries a correction; a repeated wrong pick keeps it
    [key]: { ...current, checked: true, isCorrect, revealed: isCorrect ? false : Boolean(current.revealed) },
  };
}

/** Opens the worked correction — only for a committed wrong answer. */
export function revealCorrection(state, key, allowedChoices = null, totalHints = null) {
  const current = readChoice(state, key, allowedChoices, totalHints);
  if (!current.checked || current.isCorrect) return state;
  return { ...state, [key]: { ...current, revealed: true } };
}

/** Advances the progressive hint counter, capped at the number of hints. */
export function revealHint(state, key, totalHints, allowedChoices = null) {
  const current = readChoice(state, key, allowedChoices, totalHints);
  const hintLevel = clampHintLevel(current.hintLevel + 1, totalHints);
  return { ...state, [key]: { ...current, hintLevel } };
}

export function clearChoice(state, key) {
  if (!state || !(key in state)) return state ?? emptyChoiceState();
  const next = { ...state };
  delete next[key];
  return next;
}

export function clearChoices(state, keys) {
  return keys.reduce((acc, key) => clearChoice(acc, key), state ?? emptyChoiceState());
}

/** Counts for a batch summary or the practice-deck progress meter. */
export function summarizeChoices(state, keys, spec = {}) {
  const summary = { total: keys.length, answered: 0, checked: 0, correct: 0 };
  for (const key of keys) {
    const entry = readChoice(state, key, spec[key]?.choices ?? null, spec[key]?.hints ?? null);
    if (entry.choice !== null) summary.answered += 1;
    if (entry.checked) summary.checked += 1;
    if (entry.checked && entry.isCorrect) summary.correct += 1;
  }
  return summary;
}

/** Drops everything that is not a known key with a valid choice. */
export function normalizeChoices(raw, spec = {}) {
  const next = emptyChoiceState();
  if (!raw || typeof raw !== 'object') return next;
  for (const [key, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== 'object') continue;
    const allowed = spec[key]?.choices ?? null;
    const choice = typeof entry.choice === 'string' && (!allowed || allowed.includes(entry.choice)) ? entry.choice : null;
    if (choice === null && !Number.isFinite(Number(entry.hintLevel))) continue;
    next[key] = {
      choice,
      checked: Boolean(entry.checked) && choice !== null,
      isCorrect: Boolean(entry.checked) && Boolean(entry.isCorrect) && choice !== null,
      hintLevel: clampHintLevel(entry.hintLevel, spec[key]?.hints ?? undefined),
      revealed: Boolean(entry.revealed)
        && Boolean(entry.checked) && Boolean(entry.isCorrect) === false && choice !== null,
    };
  }
  return next;
}

export function parseStoredChoices(rawText, spec = {}) {
  if (typeof rawText !== 'string' || !rawText) return emptyChoiceState();
  try {
    return normalizeChoices(JSON.parse(rawText), spec);
  } catch {
    return emptyChoiceState();
  }
}

function resolveStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadChoices(storage = null, spec = {}, storageKey = CHOICE_STORAGE_KEY) {
  const store = resolveStorage(storage);
  if (!store) return emptyChoiceState();
  try {
    return parseStoredChoices(store.getItem(storageKey), spec);
  } catch {
    return emptyChoiceState();
  }
}

/** Best effort: private mode or a full quota must not break the lesson. */
export function saveChoices(state, storage = null, storageKey = CHOICE_STORAGE_KEY) {
  const store = resolveStorage(storage);
  if (!store) return false;
  try {
    store.setItem(storageKey, JSON.stringify(state ?? emptyChoiceState()));
    return true;
  } catch {
    return false;
  }
}
