import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CHOICE_STORAGE_KEY,
  clearChoice,
  clearChoices,
  commitChoice,
  emptyChoiceState,
  loadChoices,
  normalizeChoices,
  parseStoredChoices,
  readChoice,
  revealHint,
  saveChoices,
  selectChoice,
  summarizeChoices,
} from '../src/lesson-1-choice-state.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const CODES = ['a', 'b', 'c', 'd'];

/* Lesson 1 re-renders its whole stage on every step change, so the «اختر
   الإجابة» answers must live in this reducer state instead of in the DOM.
   These tests pin the two behaviours students depend on: an answer is never
   graded before it is picked, and a pick keeps its verdict across re-renders. */

test('a question is never graded before the student picks an option', () => {
  const untouched = commitChoice(emptyChoiceState(), 'selfcheck:61-1', 'd', CODES);
  assert.deepEqual(readChoice(untouched, 'selfcheck:61-1', CODES), {
    choice: null,
    checked: false,
    isCorrect: false,
    hintLevel: 0,
  });

  // a forged entry cannot carry a verdict without a real, known option
  const forged = normalizeChoices({ 'selfcheck:61-1': { choice: null, checked: true, isCorrect: true } });
  assert.equal(readChoice(forged, 'selfcheck:61-1', CODES).checked, false);
  const unknown = normalizeChoices({ 'selfcheck:61-1': { choice: 'z', checked: true, isCorrect: true } });
  assert.equal(readChoice(unknown, 'selfcheck:61-1', CODES).choice, null);
});

test('picking an option records it and drops any previous verdict', () => {
  let state = selectChoice(emptyChoiceState(), 'selfcheck:61-2', 'a', CODES);
  assert.deepEqual(readChoice(state, 'selfcheck:61-2', CODES), {
    choice: 'a',
    checked: false,
    isCorrect: false,
    hintLevel: 0,
  });

  state = commitChoice(state, 'selfcheck:61-2', 'b', CODES);
  assert.equal(readChoice(state, 'selfcheck:61-2', CODES).checked, true);
  assert.equal(readChoice(state, 'selfcheck:61-2', CODES).isCorrect, false);

  // changing the answer must not keep the old verdict attached to the new choice
  state = selectChoice(state, 'selfcheck:61-2', 'b', CODES);
  assert.deepEqual(readChoice(state, 'selfcheck:61-2', CODES), {
    choice: 'b',
    checked: false,
    isCorrect: false,
    hintLevel: 0,
  });

  state = commitChoice(state, 'selfcheck:61-2', 'b', CODES);
  assert.equal(readChoice(state, 'selfcheck:61-2', CODES).isCorrect, true);
});

test('options outside the rendered set are rejected, so the stored pick always maps to a real radio', () => {
  const state = selectChoice(emptyChoiceState(), 'deck:p1', 'z', ['a', 'b', 'c', 'd']);
  assert.equal(readChoice(state, 'deck:p1', CODES).choice, null);
  assert.deepEqual(state, emptyChoiceState());
});

test('progressive hints survive a re-render and stay capped at the two book hints', () => {
  let state = revealHint(emptyChoiceState(), 'selfcheck:62-2', 2);
  assert.equal(readChoice(state, 'selfcheck:62-2', CODES).hintLevel, 1);
  state = revealHint(state, 'selfcheck:62-2', 2);
  state = revealHint(state, 'selfcheck:62-2', 2);
  assert.equal(readChoice(state, 'selfcheck:62-2', CODES).hintLevel, 2);

  // asking for a hint must not disturb a pick or its verdict
  state = selectChoice(state, 'selfcheck:62-2', 'b', CODES);
  state = commitChoice(state, 'selfcheck:62-2', 'b', CODES);
  assert.equal(readChoice(state, 'selfcheck:62-2', CODES).hintLevel, 2);
  assert.equal(readChoice(state, 'selfcheck:62-2', CODES).isCorrect, true);

  const clamped = normalizeChoices(
    { 'selfcheck:62-2': { choice: 'b', hintLevel: 99 } },
    { 'selfcheck:62-2': { choices: CODES, hints: 2 } },
  );
  assert.equal(readChoice(clamped, 'selfcheck:62-2', CODES, 2).hintLevel, 2);
});

test('retry clears one question only and the batch reset clears the whole batch', () => {
  let state = emptyChoiceState();
  state = selectChoice(state, 'selfcheck:61-1', 'd', CODES);
  state = commitChoice(state, 'selfcheck:61-1', 'd', CODES);
  state = selectChoice(state, 'selfcheck:61-2', 'a', CODES);

  const afterRetry = clearChoice(state, 'selfcheck:61-1');
  assert.equal(readChoice(afterRetry, 'selfcheck:61-1', CODES).choice, null);
  assert.equal(readChoice(afterRetry, 'selfcheck:61-2', CODES).choice, 'a');

  const afterReset = clearChoices(afterRetry, ['selfcheck:61-1', 'selfcheck:61-2']);
  assert.deepEqual(afterReset, emptyChoiceState());
});

test('batch summaries and the practice meter are derived from the stored answers', () => {
  let state = emptyChoiceState();
  const keys = ['selfcheck:61-1', 'selfcheck:61-2'];
  const spec = Object.fromEntries(keys.map((key) => [key, { choices: CODES }]));

  assert.deepEqual(summarizeChoices(state, keys, spec), { total: 2, answered: 0, checked: 0, correct: 0 });

  state = selectChoice(state, 'selfcheck:61-1', 'd', CODES);
  state = commitChoice(state, 'selfcheck:61-1', 'd', CODES);
  state = selectChoice(state, 'selfcheck:61-2', 'a', CODES);

  assert.deepEqual(summarizeChoices(state, keys, spec), { total: 2, answered: 2, checked: 1, correct: 1 });
});

test('stored answers are read back defensively', () => {
  assert.deepEqual(parseStoredChoices('not json'), emptyChoiceState());
  assert.deepEqual(parseStoredChoices(''), emptyChoiceState());
  assert.deepEqual(parseStoredChoices('null'), emptyChoiceState());
  assert.deepEqual(parseStoredChoices('{"selfcheck:61-1":"x"}'), emptyChoiceState());

  const restored = parseStoredChoices(JSON.stringify({
    'selfcheck:61-1': { choice: 'd', checked: true, isCorrect: true, hintLevel: 0 },
  }));
  assert.deepEqual(readChoice(restored, 'selfcheck:61-1', CODES), {
    choice: 'd',
    checked: true,
    isCorrect: true,
    hintLevel: 0,
  });
});

test('storage round-trip is best-effort and never breaks the lesson', () => {
  const memory = new Map();
  const storage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  };
  const state = selectChoice(emptyChoiceState(), 'inquiry:inq-55-1', 'b', ['a', 'b']);
  assert.equal(saveChoices(state, storage), true);
  assert.equal(memory.has(CHOICE_STORAGE_KEY), true);

  const reloaded = loadChoices(storage);
  assert.equal(readChoice(reloaded, 'inquiry:inq-55-1', ['a', 'b']).choice, 'b');

  const hostile = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('quota'); },
  };
  assert.deepEqual(loadChoices(hostile), emptyChoiceState());
  assert.equal(saveChoices(state, hostile), false);
  assert.equal(saveChoices(state, { getItem: () => null }), false);
});

test('the lesson wires every «اختر الإجابة» widget to the shared answer state', async () => {
  const practice = await read('../src/lesson-1-practice.js');
  for (const hook of ['readChoice', 'selectChoice', 'commitChoice', 'revealHint', 'loadChoices', 'saveChoices', 'summarizeChoices']) {
    assert.match(practice, new RegExp(`\\b${hook}\\(`), `${hook} must be used by the lesson widgets`);
  }
  // The correction is student-requested and gated on a committed answer.
  const correctionStart = practice.indexOf('const renderCorrection = () => {');
  assert.notEqual(correctionStart, -1, 'the self-check exposes a correction renderer');
  assert.match(
    practice.slice(correctionStart, correctionStart + 220),
    /if \(!entry\.checked \|\| entry\.isCorrect\) return;/,
    'the key is never rendered before a wrong answer is committed',
  );

  const css = await read('../src/lesson-1.css');
  // The selected option must be visible, the card must be one hit area, and the
  // revealed key must read as a correction rather than as a second selection.
  for (const selector of [
    '.option-card.is-selected {',
    '.option-card.is-choice .self-check-option-label {',
    '.option-card.is-correct-answer {',
    '.option-card.is-choice:hover {',
    '.option-card:focus-within {',
    '.inquiry-opt.is-selected {',
    '.l1-practice-option.is-selected {',
    '.self-check-actions {',
  ]) {
    assert.ok(css.includes(selector), `${selector} must exist in the lesson stylesheet`);
  }
});
