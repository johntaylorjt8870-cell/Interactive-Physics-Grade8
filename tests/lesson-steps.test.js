import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { LessonStepper, auditLessonSteps } from '../src/lesson-steps.js';
import { UNIT2L3_PAGES } from '../src/unit2-lesson3-content.js';
import { unit2l3StepMarkup } from '../src/unit2-lesson3-step-view.js';
import { UNIT2L3_PRACTICE_IDS } from '../src/unit2-lesson3-practice.js';
import { UNIT2L3_DIAGRAMS } from '../src/unit2-lesson3-diagrams.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const SRC = new URL('../src/', import.meta.url);

/* Published lessons that must always be audited, so a rename cannot quietly drop
   one of them from the shape-based discovery. */
const REQUIRED_STEP_LESSONS = ['unit2-lesson1-content.js', 'unit2-lesson2-content.js', 'unit2-lesson3-content.js', 'unit2-lesson4-content.js'];

/* Step controls every page-based student page must expose. */
const STEP_SHELL_HOOKS = ['id="page-nav"', 'id="page-content"', 'id="previous-button"', 'id="next-button"', 'id="progress-track"', 'id="page-heading"'];

/** Every exported "one entry per textbook page" array under src/, found by shape. */
async function discoverPageLessons() {
  const files = (await readdir(SRC)).filter((name) => /^unit\d+-lesson\d+-content\.js$/.test(name)).sort();
  const found = [];
  for (const file of files) {
    const module = await import(new URL(file, SRC).href);
    for (const [exportName, value] of Object.entries(module)) {
      if (!Array.isArray(value) || value.length === 0) continue;
      if (!value.every((entry) => entry && Number.isInteger(entry.page))) continue;
      /* declared coverage: a *_META.sourcePages object, or a bare sourcePages array */
      const meta = Object.values(module).find((candidate) => candidate && Array.isArray(candidate.sourcePages));
      const declared = Array.isArray(module.sourcePages) && module.sourcePages.every(Number.isInteger) ? module.sourcePages : null;
      found.push({ file, exportName, pages: value, sourcePages: meta?.sourcePages ?? declared ?? [] });
    }
  }
  return found;
}

/** The published student pages a lesson module could own, e.g. unit2-lesson3-content.js
    → unit2-lesson-3.html / unit2-lesson3.html. */
function shellCandidatesFor(moduleFile) {
  const stem = moduleFile.replace(/-content\.js$/, '');
  const dashed = stem.replace(/(lesson)(\d+)$/, '$1-$2');
  return [...new Set([`${dashed}.html`, `${stem}.html`])];
}

/** The first existing student page for a lesson module, or null when it is not published yet. */
function publishedShellFor(moduleFile) {
  return shellCandidatesFor(moduleFile).find((name) => existsSync(new URL(`../${name}`, import.meta.url))) ?? null;
}

test('LessonStepper moves one study step at a time and stops at both ends', () => {
  const pages = UNIT2L3_PAGES;
  const stepper = new LessonStepper(pages);

  assert.equal(stepper.total, pages.length);
  assert.equal(stepper.position, 1);
  assert.equal(stepper.page.page, 97);
  assert.equal(stepper.isFirst, true);
  assert.equal(stepper.isLast, false);
  assert.equal(stepper.previousPage, null);
  assert.equal(stepper.nextPage.page, 98);
  assert.deepEqual(stepper.progress, { current: 1, total: 10, percent: 10 });

  assert.equal(stepper.next(), true);
  assert.equal(stepper.page.page, 98);
  assert.equal(stepper.progress.percent, 20);

  assert.equal(stepper.previous(), true);
  assert.equal(stepper.page.page, 97);
  assert.equal(stepper.previous(), false, 'the first step cannot move further back');
  assert.equal(stepper.page.page, 97);

  assert.equal(stepper.goTo(9), true);
  assert.equal(stepper.isLast, true);
  assert.equal(stepper.page.page, 106);
  assert.equal(stepper.next(), false, 'the last step cannot move further forward');
  assert.equal(stepper.page.page, 106);
  assert.deepEqual(stepper.progress, { current: 10, total: 10, percent: 100 });

  assert.equal(stepper.goTo(9), false, 're-selecting the active step is not a move');
  assert.equal(stepper.goTo(4), true);
  assert.equal(stepper.goTo(99), true, 'out-of-range targets clamp to the last step');
  assert.equal(stepper.page.page, 106);
  assert.equal(stepper.goTo(-4), true);
  assert.equal(stepper.page.page, 97);

  assert.equal(stepper.labelFor('next'), pages[1].navLabel);
  assert.equal(stepper.labelFor('previous'), 'بداية الدرس');
  stepper.goTo(pages.length - 1);
  assert.equal(stepper.labelFor('next'), 'نهاية الدرس');
  assert.throws(() => stepper.labelFor('sideways'), RangeError);

  assert.throws(() => new LessonStepper([]), TypeError);
  assert.throws(() => new LessonStepper('not-a-list'), TypeError);
});

test('a lesson with many pages cannot be published as one long step', () => {
  const oneLongStep = [{ page: 97, heading: 'فرق الكمون الكهربائي', navLabel: 'الدرس كامل', blocks: [{ type: 'book', html: '<p>كل المحتوى</p>' }] }];
  const single = auditLessonSteps(oneLongStep, { sourcePages: UNIT2L3_PAGES.map((page) => page.page) });
  assert.equal(single.ok, false);
  assert.ok(single.problems.some((problem) => problem.includes('steps for')), 'a 10-page lesson in one step is reported');

  const ok = auditLessonSteps(UNIT2L3_PAGES, { sourcePages: UNIT2L3_PAGES.map((page) => page.page) });
  assert.deepEqual(ok.problems, []);

  const withoutHeading = UNIT2L3_PAGES.map((page, index) => (index === 3 ? { ...page, heading: '' } : page));
  assert.ok(auditLessonSteps(withoutHeading).problems.some((problem) => problem.includes('no clear heading')));

  const withoutLabel = UNIT2L3_PAGES.map((page, index) => (index === 4 ? { ...page, navLabel: '' } : page));
  assert.ok(auditLessonSteps(withoutLabel).problems.some((problem) => problem.includes('no navigation label')));

  const withoutBook = UNIT2L3_PAGES.map((page, index) => (index === 5
    ? { ...page, blocks: page.blocks.filter((block) => block.type !== 'book') }
    : page));
  assert.ok(auditLessonSteps(withoutBook).problems.some((problem) => problem.includes('no textbook content')));

  const repeated = UNIT2L3_PAGES.map((page, index) => (index === 6 ? { ...page, page: 100 } : page));
  const repeatedReport = auditLessonSteps(repeated);
  assert.equal(repeatedReport.ok, false);
  assert.ok(repeatedReport.problems.some((problem) => problem.includes('same textbook page')));

  const shuffled = [UNIT2L3_PAGES[1], UNIT2L3_PAGES[0], ...UNIT2L3_PAGES.slice(2)];
  assert.ok(auditLessonSteps(shuffled).problems.some((problem) => problem.includes('page order')));

  assert.deepEqual(auditLessonSteps([]).problems, ['the lesson defines no study steps']);
});

test('every page-based lesson keeps one step per textbook page and a working step navigation shell', async () => {
  const discovered = await discoverPageLessons();
  const files = new Set(discovered.map((entry) => entry.file));
  for (const required of REQUIRED_STEP_LESSONS) {
    assert.ok(files.has(required), `${required} is discovered by shape and therefore audited`);
  }

  /* Every lesson that ships a page-per-page array is audited, including one added
     later: a new lesson cannot be published as one long step, lose a page, freeze
     the book order, or ship without the step controls. */
  for (const lesson of discovered) {
    const report = auditLessonSteps(lesson.pages, { sourcePages: lesson.sourcePages });
    assert.deepEqual(report.problems, [], `${lesson.file}:${lesson.exportName}: ${report.problems.join('; ')}`);

    const shell = publishedShellFor(lesson.file);
    if (!shell) continue; /* written but not published yet */
    const html = await read(`../${shell}`);
    for (const hook of STEP_SHELL_HOOKS) {
      assert.ok(html.includes(hook), `${lesson.file} → ${shell} exposes ${hook}`);
    }
    const pageContent = html.match(/<div id="page-content"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
    assert.equal(pageContent.trim(), '', `${shell} renders its steps at runtime, not as one static article`);
    assert.equal(/<article[^>]*data-book-copy=|<div class="book-copy"/.test(html), false,
      `${shell} does not pre-render book copy outside the step renderer`);
  }

  /* Lesson 4 was the one station-rail exception. It is now taught one textbook
     page at a time like lessons 1–3, so the exception is retired: the lesson is
     discovered by shape and audited by the same rule as every other lesson, and
     its six book phases are checked through UNIT2L4_PAGES rather than STATIONS. */
  const lesson4 = discovered.find((entry) => entry.file === 'unit2-lesson4-content.js');
  assert.ok(lesson4, 'lesson 4 is discovered by shape and therefore audited');
  assert.equal(lesson4.exportName, 'UNIT2L4_PAGES');
  assert.equal(discovered.some((entry) => entry.file === 'unit2-lesson4-content.js' && entry.exportName === 'STATIONS'), false,
    'the retired station array is not mistaken for a page-per-page lesson');
});


test('Lesson 3 renders exactly one textbook page per step, with that page\'s own activities', () => {
  const diagramIdsByPage = new Map();
  for (const [id, diagram] of Object.entries(UNIT2L3_DIAGRAMS)) {
    if (!diagramIdsByPage.has(diagram.page)) diagramIdsByPage.set(diagram.page, []);
    diagramIdsByPage.get(diagram.page).push(id);
  }

  for (const page of UNIT2L3_PAGES) {
    const markup = unit2l3StepMarkup(page);
    const otherPages = UNIT2L3_PAGES.filter((candidate) => candidate.page !== page.page);

    const ownBookBlocks = page.blocks.filter((block) => block.type === 'book').length;
    const renderedBookBlocks = (markup.match(/data-book-copy=/g) ?? []).length;
    assert.equal(renderedBookBlocks, ownBookBlocks, `p${page.page} renders each of its own book blocks once`);
    assert.equal((markup.match(new RegExp(`data-book-copy="p${page.page}"`, 'g')) ?? []).length, ownBookBlocks);
    assert.ok(markup.includes(`data-page-view="p${page.page}"`), 'the step is tagged with its own page');
    assert.ok(markup.includes(page.heading.replaceAll('"', '&quot;')) || markup.includes(page.heading), 'the step shows its heading');
    for (const other of otherPages) {
      assert.equal(markup.includes(`data-page-view="p${other.page}"`), false, `p${page.page} does not embed p${other.page}`);
      assert.equal(markup.includes(`data-book-copy="p${other.page}"`), false, `p${page.page} does not embed p${other.page} book copy`);
    }

    /* every interactive activity the content assigns to this step is mounted by it,
       and no activity of another page leaks in */
    const ownPractice = page.blocks.filter((block) => block.type === 'practice').map((block) => block.id);
    const ownSimulations = page.blocks.filter((block) => block.type === 'simulation').map((block) => block.id);
    const ownDiagrams = page.blocks.filter((block) => block.type === 'diagram').map((block) => block.id);
    for (const id of ownPractice) assert.ok(markup.includes(`data-u2l3-practice="${id}"`), `p${page.page} mounts ${id}`);
    for (const id of ownSimulations) assert.ok(markup.includes(`data-u2l3-sim="${id}"`), `p${page.page} mounts ${id}`);
    assert.equal((markup.match(/data-u2l3-practice="/g) ?? []).length, ownPractice.length, `p${page.page} mounts no foreign activity`);
    assert.equal((markup.match(/data-u2l3-sim="/g) ?? []).length, ownSimulations.length, `p${page.page} mounts no foreign simulation`);
    assert.equal((markup.match(/<figure class="p3-figure"/g) ?? []).length, ownDiagrams.length, `p${page.page} draws its own figures only`);

    for (const [pageNumber, ids] of diagramIdsByPage) {
      if (pageNumber === page.page) continue;
      for (const id of ids) {
        if (ownDiagrams.includes(id)) continue;
        assert.equal(markup.includes(`figure-${id}`), false, `p${page.page} does not draw p${pageNumber} figure ${id}`);
      }
    }
    assert.throws(() => unit2l3StepMarkup({ page: 'x' }), TypeError);
  }

  assert.deepEqual(new Set(UNIT2L3_PRACTICE_IDS).size, UNIT2L3_PRACTICE_IDS.length);
});

test('Lesson 3 bootstrap teaches through the shared step model instead of one scrolling page', async () => {
  const [boot, view, css] = await Promise.all([
    read('../src/unit2-lesson3-main.js'), read('../src/unit2-lesson3-step-view.js'), read('../src/unit2-lesson3.css'),
  ]);
  assert.match(boot, /import \{ LessonStepper \} from '\.\/lesson-steps\.js'/);
  assert.match(boot, /new LessonStepper\(UNIT2L3_PAGES\)/);
  assert.match(boot, /unit2l3StepMarkup/);
  assert.match(boot, /replaceChildren\(buildStep\(stepper\.index\)\)/, 'the content region holds the active step only');
  assert.doesNotMatch(boot, /UNIT2L3_PAGES\.map\(/, 'the bootstrap never renders every page in one pass');
  assert.doesNotMatch(boot, /IntersectionObserver|scrollIntoView\(\{ block: 'start' \}\)\s*\}\);\s*$/m);
  for (const hook of ['#previous-button', '#next-button', '#progress-track', '#page-nav']) {
    assert.ok(boot.includes(hook), `bootstrap wires ${hook}`);
  }
  assert.match(view, /export function mountUnit2l3Step/);
  /* the step layout rules live in the lesson stylesheet, mobile included */
  for (const rule of ['.p3-step-view', '.p3-step-source', '.potential-lesson-page .page-nav']) {
    assert.ok(css.includes(rule), `css ${rule}`);
  }
  assert.equal(/\.p3-station\b/.test(css), false, 'the retired single-page station layout is gone');
  assert.ok(existsSync(new URL('../src/lesson-steps.js', import.meta.url)), 'the shared step model is shipped in src/');
});
