import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LESSON_2_PAGES } from '../src/lesson-2-content.js';
import { SELF_CHECK_ITEMS } from '../src/lesson-2-practice-data.js';
import {
  LESSON_2_CHOICE_STORAGE_KEY,
  createLesson2ChoiceStore,
  lesson2ChoiceSpec,
} from '../src/lesson-2-choice-state.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const texOf = (html) => [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)]
  .map((match) => match[1]);
const page70Html = () => LESSON_2_PAGES.find((item) => item.page === 70).blocks.join('\n');

class FakeStorage {
  constructor(seed = null) {
    this.entries = new Map(seed === null ? [] : [[LESSON_2_CHOICE_STORAGE_KEY, seed]]);
  }
  getItem(key) { return this.entries.has(key) ? this.entries.get(key) : null; }
  setItem(key, value) { this.entries.set(key, String(value)); }
  removeItem(key) { this.entries.delete(key); }
}

/* `src/lesson-2-main.js` replaces #page-content on every step change. Before
   this fix, the four «اختر الإجابة» radios (and their verdict/hints) lived only
   in that DOM, so navigating away and back wiped the whole attempt. */
test('the choice spec mirrors the four printed p70 questions and their hint budgets', () => {
  const spec = lesson2ChoiceSpec(SELF_CHECK_ITEMS);
  assert.deepEqual(Object.keys(spec), ['70-1', '70-2', '70-3', '70-4']);
  for (const [key, item] of Object.entries(SELF_CHECK_ITEMS)) {
    assert.deepEqual([...spec[key].choices], ['a', 'b', 'c', 'd']);
    assert.equal(spec[key].hints, item.hints.length);
  }
});

test('a p70 attempt survives a step re-render and a page reload', () => {
  const storage = new FakeStorage();
  const firstMount = createLesson2ChoiceStore(SELF_CHECK_ITEMS, storage);
  assert.equal(firstMount.read('70-1').choice, null);
  firstMount.select('70-1', 'b');
  const verdict = firstMount.verify('70-1', 'b');
  assert.equal(verdict.checked, true);
  assert.equal(verdict.isCorrect, false);
  firstMount.hint('70-1');

  // A fresh store over the same storage is exactly what a re-render/reload does.
  const secondMount = createLesson2ChoiceStore(SELF_CHECK_ITEMS, storage);
  assert.deepEqual(secondMount.read('70-1'), {
    choice: 'b', checked: true, isCorrect: false, hintLevel: 1, revealed: false,
  });
});

test('nothing is graded before a pick, and changing a pick drops the old verdict', () => {
  const store = createLesson2ChoiceStore(SELF_CHECK_ITEMS, new FakeStorage());
  assert.equal(store.verify('70-2', null).checked, false);
  assert.equal(store.verify('70-2', 'not-an-option').choice, null);
  store.select('70-2', 'c');
  assert.equal(store.verify('70-2', 'c').isCorrect, true, 'c is the printed key');
  store.select('70-2', 'a');
  const changed = store.read('70-2');
  assert.equal(changed.choice, 'a');
  assert.equal(changed.checked, false);
  assert.equal(changed.isCorrect, false);
});

test('progressive hints are capped at the authored hints and retry clears everything', () => {
  const store = createLesson2ChoiceStore(SELF_CHECK_ITEMS, new FakeStorage());
  store.hint('70-3');
  store.hint('70-3');
  store.hint('70-3');
  assert.equal(store.read('70-3').hintLevel, SELF_CHECK_ITEMS['70-3'].hints.length);
  assert.deepEqual(store.reset('70-3'), {
    choice: null, checked: false, isCorrect: false, hintLevel: 0, revealed: false,
  });
});

test('corrupt storage and unknown keys read as untouched instead of throwing', () => {
  const store = createLesson2ChoiceStore(SELF_CHECK_ITEMS, new FakeStorage('{ not json'));
  assert.equal(store.read('70-1').choice, null);
  assert.equal(store.has('unknown-question'), false);
  assert.equal(store.select('unknown-question', 'a').choice, null);
  assert.equal(store.verify('unknown-question', 'a').checked, false);
});

test('p70 options use inline single-line math with real multiplication/division symbols', () => {
  const html = page70Html();
  const cards = [...html.matchAll(/<div class="option-card" data-option="[a-d]">[\s\S]*?<\/div>/g)]
    .map((match) => match[0]);
  assert.equal(cards.length, 16, 'four questions × four options');
  assert.equal((html.match(/data-selfcheck-item/g) ?? []).length, 4);
  for (const card of cards) {
    assert.match(card, /class="math math-inline"/, 'option math is inline');
    assert.doesNotMatch(card, /math-display|katex-display|linebreak="newline"/, 'no block equation inside a label');
  }
  const sources = texOf(html);
  for (const symbol of ['F=F_{1}\\times F_{2}', 'F=F_{1}\\div F_{2}', 'd=d_{1}\\times d_{2}', 'd=d_{1}\\div d_{2}']) {
    assert.ok(sources.includes(symbol), `option renders ${symbol}`);
  }
});

test('Lesson 2 keeps choice state outside the re-rendered DOM and labels the radio group', async () => {
  const [main, practice, content] = await Promise.all([
    read('../src/lesson-2-main.js'),
    read('../src/lesson-2-practice.js'),
    read('../src/lesson-2-content.js'),
  ]);
  assert.match(main, /pageContent\.innerHTML\s*=/);
  assert.match(practice, /createLesson2ChoiceStore/);
  assert.match(practice, /choiceStore\.read\(key\)/, 'state is restored after re-mount');
  assert.match(practice, /radiogroup/);
  assert.match(practice, /is-choice/, 'the whole option is a hit area');
  assert.doesNotMatch(content, /renderChoice\([^)]*formula\(/, 'options never contain a block equation');
});

const NO_JSDOM = 'jsdom is not installed here (developer-only package), so the DOM run is skipped rather than faked';

test('DOM: a p70 choice, verdict and hint survive a full step re-render', async (t) => {
  let JSDOM;
  try {
    ({ JSDOM } = await import('jsdom'));
  } catch {
    t.skip(NO_JSDOM);
    return;
  }
  const dom = new JSDOM('<!doctype html><html lang="ar" dir="rtl"><body></body></html>', {
    url: 'https://example.test/lesson-2.html',
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.Event = dom.window.Event;

  const { enhanceLesson2SelfCheck } = await import('../src/lesson-2-practice.js');
  const selfCheckBlock = LESSON_2_PAGES.find((item) => item.page === 70).blocks[0];
  const mount = () => {
    dom.window.document.body.innerHTML = `<div id="page-content">${selfCheckBlock}</div>`;
    const container = dom.window.document.querySelector('#page-content');
    enhanceLesson2SelfCheck(container);
    return container;
  };

  let container = mount();
  let question = container.querySelector('[data-selfcheck-item="70-1"]');
  assert.equal(question.querySelector('.options-grid').getAttribute('role'), 'radiogroup');
  question.querySelector('input[type="radio"][value="c"]').click();
  question.querySelector('[data-q-check]').click();
  assert.match(question.querySelector('[data-q-feedback]').textContent, /ليس هذا الاختيار/);
  question.querySelector('[data-q-hint]').click();
  assert.equal(question.querySelectorAll('[data-q-hint-box] p').length, 1);

  // Simulate a step change: the whole stage markup is replaced and re-enhanced.
  container = mount();
  question = container.querySelector('[data-selfcheck-item="70-1"]');
  assert.equal(question.querySelector('input[type="radio"][value="c"]').checked, true, 'choice restored');
  assert.match(question.querySelector('[data-q-feedback]').textContent, /ليس هذا الاختيار/, 'verdict restored');
  assert.equal(question.querySelectorAll('[data-q-hint-box] p').length, 1, 'hint level restored');
  assert.equal(question.querySelector('[data-q-retry]').hidden, false);

  question.querySelector('input[type="radio"][value="a"]').click();
  assert.equal(question.querySelector('[data-q-feedback]').hidden, true, 'a new pick clears the old verdict');
  question.querySelector('[data-q-check]').click();
  assert.match(question.querySelector('[data-q-feedback]').textContent, /إجابة صحيحة/);

  question.querySelector('[data-q-retry]').click();
  assert.equal(question.querySelector('input[type="radio"][value="a"]').checked, false);
  assert.equal(question.querySelector('[data-q-hint-box]').hidden, true);

  const untouched = container.querySelector('[data-selfcheck-item="70-2"]');
  untouched.querySelector('[data-q-check]').click();
  assert.match(untouched.querySelector('[data-q-feedback]').textContent, /اختر أحد البدائل/, 'check refuses an empty pick');
});
