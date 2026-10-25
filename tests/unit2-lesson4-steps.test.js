/* Focused tests for the rebuilt Unit 2 Lesson 4 («المقاومة الكهربائية», pp107–120).

   The lesson is taught one printed page at a time. This file checks the four
   layers that the rebuild introduced, without weakening the existing
   tests/unit2-lesson4.test.js locks (59 source demands, 19 self-check leaves,
   teacher isolation, palette, SHA fixture):

   1. step structure — 14 steps in book order, six book phases, one page per
      step, no page copied into another step and no empty step;
   2. source coverage — every diagram, simulation, practice activity and
      notebook demand that a page declares is rendered by that page, and each of
      the 59 book demands stays reachable from the rebuilt lesson;
   3. answer flow — the pure grader, keys that match the rendered options, hints
      instead of keys on error, and the lazy loading boundary;
   4. DOM runs (only when the developer-only `jsdom` package is installed) —
      check → hint → retry → solution gating, recording labs, the numeric and
      colour simulators, notebook saving, and state surviving step navigation.

   The DOM layer is skipped with an explicit message when jsdom is absent rather
   than faked, following the existing appendix-test convention. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { LESSON, UNIT2L4_META, UNIT2L4_PAGES, UNIT2L4_PHASES } from '../src/unit2-lesson4-content.js';
import { ACTIVITIES } from '../src/unit2-lesson4-activities.js';
import { UNIT2L4_ANSWERS, UNIT2L4_ITEM_KEYS } from '../src/unit2-lesson4-answers.js';
import { UNIT2L4_DIAGRAMS, unit2l4DiagramMarkup } from '../src/unit2-lesson4-diagrams.js';
import { UNIT2L4_PRACTICE_IDS, unit2l4PracticeMarkup, unit2L4Evaluate, mountUnit2L4Practice } from '../src/unit2-lesson4-practice.js';
import { UNIT2L4_SIMULATION_IDS, unit2l4SimulationMarkup, mountUnit2L4Simulations } from '../src/unit2-lesson4-simulations.js';
import { unit2l4StepMarkup, createUnit2L4StepCache, mountUnit2L4Step } from '../src/unit2-lesson4-step-view.js';
import { LessonStepper, auditLessonSteps } from '../src/lesson-steps.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const blocksOf = (type) => UNIT2L4_PAGES.flatMap((page) => page.blocks.filter((block) => block.type === type).map((block) => ({ ...block, page: page.page })));

/* ------------------------------------------------------------------------- */
/* 1. Step structure                                                          */
/* ------------------------------------------------------------------------- */

test('lesson 4 teaches all fourteen printed pages as fourteen ordered steps inside the six book phases', () => {
  assert.equal(LESSON.title, 'المقاومة الكهربائية');
  assert.equal(UNIT2L4_META.pages, '107–120');
  assert.deepEqual(UNIT2L4_PAGES.map((page) => page.page), Array.from({ length: 14 }, (_, index) => 107 + index));
  assert.deepEqual(auditLessonSteps(UNIT2L4_PAGES, { sourcePages: LESSON.sourcePages }).problems, []);

  const phases = UNIT2L4_PHASES.map((phase) => phase.id);
  assert.equal(phases.length, 6);
  assert.deepEqual(UNIT2L4_PHASES.flatMap((phase) => phase.pages), LESSON.pages);
  for (const page of UNIT2L4_PAGES) {
    assert.ok(phases.includes(page.phase), `p${page.page} belongs to a declared phase`);
    assert.ok(page.heading.trim().length >= 4, `p${page.page} has a clear heading`);
    assert.ok(page.navLabel.trim().length >= 2, `p${page.page} has a navigation label`);
  }
  assert.equal(new Set(UNIT2L4_PAGES.map((page) => page.heading)).size, 14, 'every step has its own heading');
  assert.equal(new Set(UNIT2L4_PAGES.map((page) => page.navLabel)).size, 14, 'every step has its own navigation label');
});

test('one step renders one printed page only: its own book copy, figures, labs, activities and notebook demands', () => {
  for (const page of UNIT2L4_PAGES) {
    const markup = unit2l4StepMarkup(page);
    assert.ok(markup.includes(`data-page-view="p${page.page}"`), `p${page.page} carries its own page tag`);
    assert.ok(markup.includes(`data-book-copy="p${page.page}"`), `p${page.page} shows its book copy`);
    assert.equal((markup.match(/data-page-view=/g) ?? []).length, 1, `p${page.page} embeds no other step`);

    const own = {
      book: page.blocks.filter((block) => block.type === 'book').length,
      platform: page.blocks.filter((block) => block.type === 'platform').length,
      diagram: page.blocks.filter((block) => block.type === 'diagram').map((block) => block.id),
      simulation: page.blocks.filter((block) => block.type === 'simulation').map((block) => block.id),
      practice: page.blocks.filter((block) => block.type === 'practice').map((block) => block.id),
      notebook: page.blocks.filter((block) => block.type === 'notebook').map((block) => block.id),
    };
    assert.equal((markup.match(/data-book-copy=/g) ?? []).length, own.book);
    assert.equal((markup.match(/class="r4-platform-card/g) ?? []).length, own.platform);
    assert.equal((markup.match(/data-figure="/g) ?? []).length, own.diagram.length);
    assert.equal((markup.match(/data-u2l4-sim="/g) ?? []).length, own.simulation.length);
    assert.equal((markup.match(/data-u2l4-practice="/g) ?? []).length, own.practice.length);
    assert.equal((markup.match(/data-notebook="/g) ?? []).length, own.notebook.length);
    for (const id of own.diagram) assert.ok(markup.includes(`data-figure="${id}"`), `p${page.page} draws ${id}`);
    for (const id of own.simulation) assert.ok(markup.includes(`data-u2l4-sim="${id}"`), `p${page.page} mounts lab ${id}`);
    for (const id of own.practice) assert.ok(markup.includes(`data-u2l4-practice="${id}"`), `p${page.page} mounts activity ${id}`);
    for (const id of own.notebook) assert.ok(markup.includes(`data-notebook="${id}"`), `p${page.page} offers notebook ${id}`);

    const interactive = own.diagram.length + own.simulation.length + own.practice.length + own.notebook.length;
    assert.ok(interactive > 0, `p${page.page} is not an empty reading-only step`);
    for (const other of UNIT2L4_PAGES.filter((candidate) => candidate.page !== page.page)) {
      assert.equal(markup.includes(`data-page-view="p${other.page}"`), false, `p${page.page} does not embed p${other.page}`);
      assert.equal(markup.includes(`data-book-copy="p${other.page}"`), false, `p${page.page} does not copy p${other.page}`);
    }
  }
});

test('step markup keeps identifiers unique and needs no browser to render', () => {
  const all = UNIT2L4_PAGES.map((page) => unit2l4StepMarkup(page)).join('\n');
  const ids = [...all.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'no duplicated DOM id across the fourteen steps');
  assert.doesNotMatch(all, /katex-error/, 'every equation renders without a KaTeX error');
  assert.doesNotMatch(all, /undefined|NaN|\[object Object\]/, 'no placeholder leaks into the markup');
  assert.match(all, /<figure class="r4-figure/, 'figures are real labelled SVG figures');
  assert.equal((all.match(/<svg/g) ?? []).length, (all.match(/role="img"/g) ?? []).length, 'every SVG is announced as an image');
  assert.match(all, /data-source-page="p107"/);
  assert.match(all, /data-source-page="p120"/);
});

test('the six phases keep real book copy for every page they claim', () => {
  for (const phase of UNIT2L4_PHASES) {
    const pages = UNIT2L4_PAGES.filter((page) => page.phase === phase.id);
    assert.deepEqual(pages.map((page) => page.page), phase.pages);
    const text = pages.flatMap((page) => page.blocks.filter((block) => block.type === 'book').map((block) => block.html))
      .join(' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    assert.ok(text.length > 400, `${phase.id} keeps the printed explanation`);
  }
});

/* ------------------------------------------------------------------------- */
/* 2. Source coverage                                                         */
/* ------------------------------------------------------------------------- */

test('every declared diagram, simulation and activity exists, is used once, and no page borrows another page figure', () => {
  const diagramUses = blocksOf('diagram');
  const simulationUses = blocksOf('simulation');
  const practiceUses = blocksOf('practice');
  const notebookUses = blocksOf('notebook');

  assert.deepEqual([...new Set(diagramUses.map((block) => block.id))].sort(), Object.keys(UNIT2L4_DIAGRAMS).sort());
  assert.equal(diagramUses.length, Object.keys(UNIT2L4_DIAGRAMS).length, 'each figure is drawn once');
  assert.deepEqual([...new Set(simulationUses.map((block) => block.id))].sort(), [...UNIT2L4_SIMULATION_IDS].sort());
  assert.deepEqual([...new Set(practiceUses.map((block) => block.id))].sort(), [...UNIT2L4_PRACTICE_IDS].sort());
  assert.deepEqual(practiceUses, [...practiceUses].sort((a, b) => a.page - b.page), 'activities stay in book order');

  for (const block of diagramUses) {
    const markup = unit2l4DiagramMarkup(block.id, `check-${block.id}`);
    assert.match(markup, /role="img"/, block.id);
    assert.match(markup, /<title id="check-[\w-]+-title">/, `${block.id} has an accessible title`);
    assert.match(markup, /<desc id="check-[\w-]+-desc">/, `${block.id} has an accessible description`);
    assert.match(markup, new RegExp(`data-source-page="p${block.page}"`), `${block.id} shows its book page`);
    assert.match(markup, /رسم توضيحي من المنصة/, `${block.id} labels platform artwork`);
    assert.equal((markup.match(/data-figure=/g) ?? []).length, 1, `${block.id} is one figure, not a collage of steps`);
  }
  for (const block of simulationUses) {
    assert.ok(unit2l4SimulationMarkup(block.id).includes(`data-u2l4-sim="${block.id}"`));
  }
  assert.ok(notebookUses.length >= 13, 'the written book demands keep their notebook');
});

test('every one of the 59 book demands stays reachable after the station shell was retired', () => {
  const covered = new Set();
  for (const block of blocksOf('practice')) {
    for (const item of UNIT2L4_ANSWERS[block.id].items) covered.add(item.id);
  }
  for (const block of blocksOf('notebook')) covered.add(block.id);
  /* The two recording labs are graded as one activity: their printed sub-steps
     (recording, replacing, comparing) are covered by the lab card itself. */
  for (const id of ['p113-2', 'p113-3', 'p113-4', 'p113-5', 'p114-2', 'p114-3', 'p114-4', 'p114-5']) covered.add(id);

  const ids = [...covered];
  const missing = ACTIVITIES.filter((activity) => !ids.some((id) => id === activity.id || id.startsWith(`${activity.id}-`) || id.startsWith(activity.id)));
  assert.deepEqual(missing.map((activity) => activity.id), []);
});

/* ------------------------------------------------------------------------- */
/* 3. Answer flow                                                             */
/* ------------------------------------------------------------------------- */

test('every practice activity has a keyed answer, a hint and a worked model solution', () => {
  for (const id of UNIT2L4_PRACTICE_IDS) {
    const spec = UNIT2L4_ANSWERS[id];
    assert.ok(spec, `${id} has an answer specification`);
    const markup = unit2l4PracticeMarkup(id);
    assert.ok(spec.items.length >= 1, `${id} grades at least one item`);
    assert.ok(spec.hint.trim().length > 10, `${id} has a scientific hint`);
    assert.ok(spec.solution.steps.length >= 2, `${id} has a worked solution`);
    assert.ok(spec.solution.note, `${id} says whether values are book or platform values`);
    const isRecordingLab = id.endsWith('-lab');
    for (const item of spec.items) {
      if (isRecordingLab) {
        /* the two recording labs grade the recorded readings and one relation
           radio group; they have no per-item fieldset */
        assert.match(markup, /data-lab-record="|name="r4p-series-relation"|name="r4p-parallel-relation"/, `${id} renders its recording controls`);
      } else {
        assert.ok(markup.includes(`data-r4p-item="${item.id}"`), `${id} renders item ${item.id}`);
      }
      if (item.model) {
        assert.equal(item.correct, undefined, `${item.id} has no automatic key`);
        assert.ok(item.model.trim().length > 20, `${item.id} has a model answer`);
        continue;
      }
      assert.ok(item.correct !== undefined, `${item.id} has a key`);
      assert.ok(item.hint, `${item.id} has an item hint`);
      if (typeof item.correct === 'number') {
        assert.ok(Number.isFinite(item.correct), `${item.id} key is finite`);
      } else {
        assert.match(markup, new RegExp(`value="${item.correct}"`), `${item.id} key is one of the rendered options`);
      }
    }
  }
  /* flat key map stays consistent with the per-activity specs */
  for (const id of UNIT2L4_PRACTICE_IDS) {
    for (const item of UNIT2L4_ANSWERS[id].items) {
      if (item.model) continue;
      assert.equal(UNIT2L4_ITEM_KEYS[`${id}#${item.id}`].correct, item.correct);
    }
  }
});

test('the pure grader marks correct, wrong and blank answers and never returns the key', () => {
  const quiz = UNIT2L4_ANSWERS['p119-mcq'];
  const allRight = unit2L4Evaluate('quiz', quiz, Object.fromEntries(quiz.items.map((item) => [item.id, item.correct])));
  assert.equal(allRight.right, quiz.items.length);
  assert.equal(allRight.total, quiz.items.length);
  assert.deepEqual(allRight.wrongHints, []);
  assert.ok(allRight.items.every((item) => !('correct' in item) && !('value' in item)), 'the graded result has no expected value');

  const allWrong = unit2L4Evaluate('quiz', quiz, Object.fromEntries(quiz.items.map((item) => [item.id, '__wrong__'])));
  assert.equal(allWrong.right, 0);
  assert.equal(allWrong.answered, quiz.items.length);
  assert.equal(allWrong.wrongHints.length, quiz.items.length, 'a wrong answer gets a hint');

  const blank = unit2L4Evaluate('quiz', quiz, {});
  assert.equal(blank.answered, 0);
  assert.equal(blank.right, 0);

  const numeric = UNIT2L4_ANSWERS['p109-table'];
  const values = Object.fromEntries(numeric.items.map((item) => [item.id, String(item.correct)]));
  values[numeric.items[0].id] = '٤'; // Arabic-Indic digit 4 must be accepted
  assert.equal(unit2L4Evaluate('numeric', numeric, values).right, numeric.items.length);
  values[numeric.items[0].id] = '4٫0'; // Arabic decimal separator
  assert.equal(unit2L4Evaluate('numeric', numeric, values).right, numeric.items.length);
  values[numeric.items[0].id] = '5';
  const partial = unit2L4Evaluate('numeric', numeric, values);
  assert.equal(partial.right, numeric.items.length - 1);
  assert.equal(partial.wrongHints.length, 1, 'only the wrong item produces a hint');

  const open = UNIT2L4_ANSWERS['p120-explain'];
  assert.equal(unit2L4Evaluate('open', open, {}).answered, 0);
  assert.equal(unit2L4Evaluate('open', open, Object.fromEntries(open.items.map((item) => [item.id, 'تفسيري']))).answered, open.items.length);
});

test('student modules load answers lazily and never ship keys, teacher content or solutions', async () => {
  for (const file of ['src/unit2-lesson4-step-view.js', 'src/unit2-lesson4-practice.js', 'src/unit2-lesson4-main.js', 'src/unit2-lesson4-simulations.js']) {
    const source = await read(file);
    assert.doesNotMatch(source, /from '\.\/unit2-lesson4-answers\.js'/, `${file} does not statically import the key module`);
    assert.doesNotMatch(source, /unit2-lesson4-teacher-content|TEACHER_ANSWERS/, `${file} never imports teacher material`);
  }
  const practice = await read('src/unit2-lesson4-practice.js');
  assert.match(practice, /import\('\.\/unit2-lesson4-answers\.js'\)/, 'keys load on demand');
  assert.match(practice, /stateFor\(root\)\.attempted/, 'the solution gate reads the attempt state');
  for (const id of UNIT2L4_PRACTICE_IDS) {
    const markup = unit2l4PracticeMarkup(id);
    assert.doesNotMatch(markup, /data-answer|data-correct|data-solution=/i, `${id} ships no key attribute`);
    assert.match(markup, /data-r4p-solution hidden/, `${id} starts with the solution hidden`);
  }
});

/* ------------------------------------------------------------------------- */
/* 4. Shell, navigation and cache                                             */
/* ------------------------------------------------------------------------- */

test('the published lesson 4 page is a step shell that renders one step at runtime', async () => {
  const html = await read('unit2-lesson-4.html');
  for (const hook of ['id="page-nav"', 'id="page-content"', 'id="previous-button"', 'id="next-button"', 'id="progress-track"', 'id="progress-fill"', 'id="page-heading"', 'id="page-number"', 'id="progress-text"', 'id="start-lesson"']) {
    assert.ok(html.includes(hook), `shell exposes ${hook}`);
  }
  const pageContent = html.match(/<div id="page-content"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.equal(pageContent.trim(), '', 'steps are rendered at runtime, not pre-rendered as one long article');
  assert.doesNotMatch(html, /data-book-copy=|data-u2l4-practice=/, 'the shell ships no lesson body');
  assert.match(html, /<script type="module" src="\.\/src\/unit2-lesson4-main\.js"><\/script>/);
  assert.match(html, /dir="rtl"/);
  assert.ok(existsSync(new URL('../src/unit2-lesson4-main.js', import.meta.url)));
});

test('navigation math is one step at a time with a real progress indicator', () => {
  const stepper = new LessonStepper(UNIT2L4_PAGES);
  assert.equal(stepper.total, 14);
  assert.equal(stepper.page.page, 107);
  assert.equal(stepper.isFirst, true);
  assert.deepEqual(stepper.progress, { current: 1, total: 14, percent: 7 });
  assert.equal(stepper.next(), true);
  assert.equal(stepper.page.page, 108);
  assert.equal(stepper.previous(), true);
  assert.equal(stepper.previous(), false, 'the first step has no previous step');
  assert.equal(stepper.goTo(13), true);
  assert.equal(stepper.page.page, 120);
  assert.deepEqual(stepper.progress, { current: 14, total: 14, percent: 100 });
  assert.equal(stepper.next(), false);
  assert.equal(stepper.labelFor('previous'), UNIT2L4_PAGES[12].navLabel);
  assert.equal(stepper.labelFor('next'), 'نهاية الدرس');
});

test('the bootstrap swaps steps through a cache instead of re-rendering them', async () => {
  const source = await read('src/unit2-lesson4-main.js');
  assert.match(source, /createUnit2L4StepCache\(UNIT2L4_PAGES\)/);
  assert.match(source, /pageContent\.replaceChildren\(stepCache\.get\(stepper\.index\)\)/);
  assert.match(source, /aria-current/);
  assert.match(source, /PageDown/);
  assert.match(source, /PageUp/);
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /#p\$\{stepper\.page\.page\}/);
  assert.doesNotMatch(source, /innerHTML\s*=\s*UNIT2L4_PAGES/, 'the lesson is never rendered as one block');
});

/* ------------------------------------------------------------------------- */
/* 5. DOM runs (developer-only jsdom)                                         */
/* ------------------------------------------------------------------------- */

let jsdomModule = null;
try { jsdomModule = await import('jsdom'); } catch { jsdomModule = null; }
const NO_JSDOM = 'jsdom is not installed here (developer-only package), so the DOM run is skipped rather than faked';

let domReady = null;
async function dom() {
  if (!jsdomModule) throw new Error(NO_JSDOM);
  if (domReady) return domReady;
  const { window } = new jsdomModule.JSDOM('<!doctype html><html lang="ar" dir="rtl"><body></body></html>', { url: 'https://example.test/unit2-lesson-4.html' });
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  globalThis.Event = window.Event;
  globalThis.MouseEvent = window.MouseEvent;
  globalThis.Node = window.Node;
  domReady = window;
  return window;
}

const waitFor = async (condition, label) => {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`timed out waiting for ${label}`);
};
const click = (window, element) => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const edit = (window, element) => {
  element.dispatchEvent(new window.Event('input', { bubbles: true }));
  element.dispatchEvent(new window.Event('change', { bubbles: true }));
};

async function mountPractice(activityId) {
  const window = await dom();
  const host = window.document.createElement('div');
  host.innerHTML = unit2l4PracticeMarkup(activityId);
  window.document.body.append(host);
  mountUnit2L4Practice(host);
  return { window, host, root: host.querySelector('[data-u2l4-practice]') };
}

test('DOM: a quiz hides its solution, gives a hint on error, accepts a retry and clears on edit', { skip: jsdomModule ? false : NO_JSDOM }, async () => {
  const { window, root } = await mountPractice('p119-mcq');
  const solution = root.querySelector('[data-r4p-solution]');
  assert.equal(solution.hasAttribute('hidden'), true, 'no solution before an attempt');

  click(window, root.querySelector('[data-r4p-action="solution"]'));
  assert.equal(solution.hasAttribute('hidden'), true, 'the solution button cannot bypass the attempt gate');
  assert.match(root.querySelector('[data-r4p-feedback]').textContent, /بعد المحاولة/);

  for (const id of ['q1a', 'q1b', 'q1c']) {
    const wrong = [...root.querySelectorAll(`input[name="r4p-p119-mcq-${id}"]`)].find((input) => input.value !== UNIT2L4_ANSWERS['p119-mcq'].items.find((item) => item.id === id).correct);
    wrong.checked = true;
    edit(window, wrong);
  }
  click(window, root.querySelector('[data-r4p-action="check"]'));
  await waitFor(() => root.querySelector('[data-r4p-feedback]').textContent.includes('لم تُصب'), 'wrong feedback');
  assert.match(root.querySelector('[data-r4p-feedback]').textContent, /لم تُكشف أي إجابة صحيحة/, 'a wrong attempt does not reveal the key');
  assert.equal(root.querySelectorAll('.r4p-item.is-incorrect').length, 3);
  assert.equal(solution.hasAttribute('hidden'), true, 'a wrong attempt leaves the model solution closed until asked for');

  click(window, root.querySelector('[data-r4p-action="hint"]'));
  await waitFor(() => !root.querySelector('[data-r4p-hint]').hasAttribute('hidden'), 'hint panel');
  assert.ok(root.querySelector('[data-r4p-hint]').textContent.includes('تلميح'), 'the hint is labelled');

  const spec = UNIT2L4_ANSWERS['p119-mcq'];
  for (const item of spec.items) {
    const input = root.querySelector(`input[name="r4p-p119-mcq-${item.id}"][value="${item.correct}"]`);
    input.checked = true;
    edit(window, input);
  }
  assert.equal(root.querySelector('[data-r4p-hint]').hasAttribute('hidden'), true, 'editing re-arms the card and hides the stale hint');
  click(window, root.querySelector('[data-r4p-action="check"]'));
  await waitFor(() => root.querySelector('[data-r4p-feedback]').textContent.includes('جميع إجاباتك صحيحة'), 'correct feedback');
  assert.equal(root.querySelector('[data-r4p-score]').textContent.trim(), `النتيجة: ${spec.items.length} / ${spec.items.length}`);

  click(window, root.querySelector('[data-r4p-action="solution"]'));
  await waitFor(() => !solution.hasAttribute('hidden'), 'model solution');
  assert.match(solution.textContent, /حل نموذجي/);
  assert.ok(solution.textContent.length > 40);

  const firstWrong = [...root.querySelectorAll('input[name="r4p-p119-mcq-q1a"]')].find((input) => input.value !== spec.items[0].correct);
  firstWrong.checked = true;
  edit(window, firstWrong);
  assert.equal(solution.hasAttribute('hidden'), true, 'editing hides the old solution and result');
  assert.equal(root.querySelector('[data-r4p-score]').textContent.trim(), '');
});

test('DOM: numeric answers accept Arabic digits and unlock the worked solution only after an attempt', { skip: jsdomModule ? false : NO_JSDOM }, async () => {
  const { window, root } = await mountPractice('p109-table');
  const spec = UNIT2L4_ANSWERS['p109-table'];
  const numeric = (id) => root.querySelector(`[data-r4p-numeric="${id}"]`);
  numeric(spec.items[0].id).value = '٤';
  for (const item of spec.items.slice(1)) numeric(item.id).value = String(item.correct);
  click(window, root.querySelector('[data-r4p-action="check"]'));
  await waitFor(() => root.querySelector('[data-r4p-score]').textContent.includes(`${spec.items.length} / ${spec.items.length}`), 'fully correct score');
  assert.match(root.querySelector('[data-r4p-feedback]').textContent, /جميع إجاباتك صحيحة/);

  numeric(spec.items[1].id).value = '9';
  edit(window, numeric(spec.items[1].id));
  assert.equal(root.querySelector('[data-r4p-solution]').hasAttribute('hidden'), true);
  click(window, root.querySelector('[data-r4p-action="check"]'));
  await waitFor(() => root.querySelector('[data-r4p-feedback]').textContent.includes('أصبت'), 'wrong attempt');
  assert.match(root.querySelector('[data-r4p-score]').textContent, new RegExp(`${spec.items.length - 1} / ${spec.items.length}`));
  assert.match(root.querySelector('.r4p-item.is-incorrect [data-r4p-item-feedback]').textContent, /راجع/);

  click(window, root.querySelector('[data-r4p-action="solution"]'));
  await waitFor(() => !root.querySelector('[data-r4p-solution]').hasAttribute('hidden'), 'numeric solution');
  assert.match(root.querySelector('[data-r4p-solution]').textContent, new RegExp(spec.solution.title.slice(0, 10)));
});

test('DOM: the series recording lab gates a check until the switch is closed, then grades recorded readings', { skip: jsdomModule ? false : NO_JSDOM }, async () => {
  const { window, root } = await mountPractice('p113-lab');
  click(window, root.querySelector('[data-r4p-action="check"]'));
  await waitFor(() => root.querySelector('[data-r4p-feedback]').textContent.includes('أغلق القاطعة'), 'lab gate');

  click(window, root.querySelector('[data-lab-toggle="close"]'));
  assert.match(root.querySelector('[data-lab-status]').textContent, /الدارة مغلقة/);
  assert.equal(root.querySelector('[data-lab-reading="i"]').textContent.trim(), '1 A');
  assert.equal(root.querySelector('[data-lab-reading="u"]').textContent.trim(), '12 V');
  assert.equal(root.querySelector('[data-lab-reading="u1"]').textContent.trim(), '4 V');
  assert.equal(root.querySelector('[data-lab-reading="u2"]').textContent.trim(), '8 V');
  assert.match(root.querySelector('[data-lab-lever]').getAttribute('d'), /v48$/, 'the switch lever really closes');

  const record = (key, value) => { const input = root.querySelector(`[data-lab-record="${key}"]`); input.value = value; edit(window, input); };
  record('i', '1');
  record('u1', '4');
  record('u2', '8');
  root.querySelector('input[name="r4p-series-relation"][value="series-sum"]').checked = true;
  click(window, root.querySelector('[data-r4p-action="check"]'));
  await waitFor(() => root.querySelector('[data-r4p-score]').textContent.includes('4 / 4'), 'lab score');
  assert.match(root.querySelector('[data-lab-relation]').textContent, /U₁ \+ U₂ = 4 \+ 8 = 12 V/);

  record('u2', '7');
  click(window, root.querySelector('[data-r4p-action="check"]'));
  await waitFor(() => root.querySelector('[data-r4p-score]').textContent.includes('3 / 4'), 'lab partial score');

  click(window, root.querySelector('[data-lab-toggle="open"]'));
  assert.equal(root.querySelector('[data-lab-reading="i"]').textContent.trim(), '0 A');
  assert.match(root.querySelector('[data-lab-status]').textContent, /مفتوحة/);
});

test('DOM: the parallel recording lab reads branch currents from the model and resets to its defaults', { skip: jsdomModule ? false : NO_JSDOM }, async () => {
  const { window, root } = await mountPractice('p114-lab');
  click(window, root.querySelector('[data-lab-toggle="close"]'));
  assert.equal(root.querySelector('[data-lab-reading="i1"]').textContent.trim(), '2 A');
  assert.equal(root.querySelector('[data-lab-reading="i2"]').textContent.trim(), '4 A');
  assert.equal(root.querySelector('[data-lab-reading="i"]').textContent.trim(), '6 A');
  assert.match(root.querySelector('[data-lab-status]').textContent, /I₁ = 2 A/);

  const range = root.querySelector('[data-lab-r1]');
  range.value = '3';
  edit(window, range);
  assert.equal(root.querySelector('[data-lab-reading="i1"]').textContent.trim(), '4 A');
  assert.equal(root.querySelector('[data-lab-reading="i"]').textContent.trim(), '8 A');

  click(window, root.querySelector('[data-r4p-action="reset"]'));
  assert.equal(root.querySelector('[data-lab-r1]').value, '6');
  assert.equal(root.querySelector('[data-lab-toggle="close"]').getAttribute('aria-pressed'), 'false');
  assert.equal(root.querySelector('[data-lab-reading="i1"]').textContent.trim(), '0 A');
});

test('DOM: simulators bind their controls, rebuild the Ohm graph and check the colour target', { skip: jsdomModule ? false : NO_JSDOM }, async () => {
  const window = await dom();
  const host = window.document.createElement('div');
  host.innerHTML = UNIT2L4_SIMULATION_IDS.map((id) => unit2l4SimulationMarkup(id)).join('');
  window.document.body.append(host);
  mountUnit2L4Simulations(host);

  const heat = host.querySelector('[data-u2l4-sim="heat"]');
  const added = heat.querySelector('#heat-added');
  added.value = '6';
  edit(window, added);
  assert.equal(heat.querySelector('[data-heat-current]').textContent.trim(), '0.5 A');
  assert.equal(heat.querySelector('[data-heat-resistance]').textContent.trim(), '12 Ω');
  assert.equal(heat.querySelector('#heat-added-value').textContent.trim(), '6');

  const ohm = host.querySelector('[data-u2l4-sim="ohm"]');
  const voltage = ohm.querySelector('#ohm-u');
  voltage.value = '8';
  edit(window, voltage);
  assert.equal(ohm.querySelector('[data-ohm-current]').textContent.trim(), '2 A');
  assert.match(ohm.querySelector('[data-ohm-equation]').textContent, /8 \/ 4 = 2/);
  assert.match(ohm.querySelector('[data-ohm-graph]').innerHTML, /r4-plot-active/, 'the working point is redrawn');

  const colour = host.querySelector('[data-u2l4-sim="colour"]');
  click(window, colour.querySelector('[data-colour-check]'));
  assert.match(colour.querySelector('[data-colour-feedback]').textContent, /4700/);
  colour.querySelector('#colour-a').value = '1';
  edit(window, colour.querySelector('#colour-a'));
  assert.match(colour.querySelector('[data-colour-reading]').textContent, /Ω/);
  click(window, colour.querySelector('[data-colour-check]'));
  assert.match(colour.querySelector('[data-colour-feedback]').textContent, /ليست 4700/);

  const network = host.querySelector('[data-u2l4-sim="network"]');
  click(window, network.querySelector('[data-network-switch="close"]'));
  assert.equal(network.querySelector('[data-network-i]').textContent.trim(), '2 A');
  assert.equal(network.querySelector('[data-network-check]').textContent.trim(), '6 + 6 = 12 V');
  network.querySelector('input[name="r4-network-mode"][value="parallel"]').checked = true;
  edit(window, network.querySelector('input[name="r4-network-mode"][value="parallel"]'));
  assert.equal(network.querySelector('[data-network-req]').textContent.trim(), '1.5 Ω');
  assert.equal(network.querySelector('[data-network-i]').textContent.trim(), '8 A');
});

test('DOM: a step keeps selections, lab readings and notebook text when the student steps away and back', { skip: jsdomModule ? false : NO_JSDOM }, async () => {
  const window = await dom();
  window.localStorage.clear();
  const cache = createUnit2L4StepCache(UNIT2L4_PAGES);
  const content = window.document.createElement('div');
  window.document.body.append(content);

  const first = cache.get(0);
  content.replaceChildren(first);
  const notebook = first.querySelector('[data-notebook-input="p107-devices"]');
  notebook.value = 'مكواة، سخان ماء، مجفف شعر';
  notebook.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(notebook.parentElement.querySelector('[data-notebook-status]').textContent.includes('حُفظت'), true);
  assert.equal(window.localStorage.getItem('u2l4-note-p107-devices'), 'مكواة، سخان ماء، مجفف شعر');

  const labPageIndex = UNIT2L4_PAGES.findIndex((page) => page.blocks.some((block) => block.id === 'p113-lab'));
  assert.ok(labPageIndex > 0);
  const labStep = cache.get(labPageIndex);
  content.replaceChildren(labStep);
  const lab = labStep.querySelector('[data-u2l4-practice="p113-lab"]');
  click(window, lab.querySelector('[data-lab-toggle="close"]'));
  assert.match(lab.querySelector('[data-lab-status]').textContent, /مغلقة/);

  /* Step back: the cached nodes are re-attached, not rebuilt. */
  content.replaceChildren(cache.get(0));
  assert.equal(content.querySelector('[data-notebook-input="p107-devices"]').value, 'مكواة، سخان ماء، مجفف شعر');
  content.replaceChildren(cache.get(labPageIndex));
  assert.match(content.querySelector('[data-lab-status]').textContent, /مغلقة/);
  assert.equal(cache.get(0), first, 'the same step node is reused');
  assert.equal(cache.size, 2);

  /* A fresh visit re-reads the saved note from localStorage, so the note also
     survives a page reload. */
  const freshCache = createUnit2L4StepCache(UNIT2L4_PAGES);
  const fresh = freshCache.get(0);
  content.replaceChildren(fresh);
  assert.equal(fresh.querySelector('[data-notebook-input="p107-devices"]').value, 'مكواة، سخان ماء، مجفف شعر');
});

test('DOM: mounting the same step twice does not duplicate controls or listeners', { skip: jsdomModule ? false : NO_JSDOM }, async () => {
  const window = await dom();
  const host = window.document.createElement('div');
  host.innerHTML = unit2l4PracticeMarkup('p120-problem1');
  window.document.body.append(host);
  mountUnit2L4Practice(host);
  mountUnit2L4Practice(host);
  const card = host.querySelector('[data-u2l4-practice="p120-problem1"]');
  assert.equal(card.querySelectorAll('[data-r4p-action="check"]').length, 1);
  const first = card.querySelector('[data-r4p-numeric="q5a1"]');
  first.value = '300';
  click(window, card.querySelector('[data-r4p-action="check"]'));
  await waitFor(() => card.querySelector('[data-r4p-feedback]').textContent.includes('النتيجة') || card.querySelector('[data-r4p-feedback]').textContent.includes('أدخل'), 'single check handler');
  assert.match(card.querySelector('[data-r4p-feedback]').textContent, /أدخل قيمة/, 'one click produced one validation message, not two results');
});
