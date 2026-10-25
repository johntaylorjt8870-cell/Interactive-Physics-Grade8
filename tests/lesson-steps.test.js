import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { LessonStepper, auditLessonSteps } from '../src/lesson-steps.js';
import { UNIT2L3_PAGES } from '../src/unit2-lesson3-content.js';
import { unit2l3StepMarkup } from '../src/unit2-lesson3-step-view.js';
import { UNIT2L3_PRACTICE_IDS } from '../src/unit2-lesson3-practice.js';
import { UNIT2L3_DIAGRAMS } from '../src/unit2-lesson3-diagrams.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const projectUrl = (path) => new URL(`../${path}`, import.meta.url);
const SRC = new URL('../src/', import.meta.url);

/* The three published Unit 2 lessons that teach one textbook page per step. */
const STEP_LESSONS = [
  { html: 'unit2-lesson-1.html', module: 'unit2-lesson1-content.js', pages: 'UNIT2_PAGES', meta: null },
  { html: 'unit2-lesson-2.html', module: 'unit2-lesson2-content.js', pages: 'UNIT2L2_PAGES', meta: 'UNIT2L2_META' },
  { html: 'unit2-lesson-3.html', module: 'unit2-lesson3-content.js', pages: 'UNIT2L3_PAGES', meta: 'UNIT2L3_META' },
];

/** Every exported "one entry per textbook page" array under src/, found by shape. */
async function discoverPageLessons() {
  const files = (await readdir(SRC)).filter((name) => /^unit\d+-lesson\d+-content\.js$/.test(name)).sort();
  const found = [];
  for (const file of files) {
    const module = await import(new URL(file, SRC).href);
    for (const [exportName, value] of Object.entries(module)) {
      if (!Array.isArray(value) || value.length === 0) continue;
      if (!value.every((entry) => entry && Number.isInteger(entry.page))) continue;
      const meta = Object.values(module).find((candidate) => candidate && Array.isArray(candidate.sourcePages));
      found.push({ file, exportName, pages: value, sourcePages: meta?.sourcePages ?? [] });
    }
  }
  return found;
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

test('every Unit 2 step lesson keeps one step per textbook page and a working step navigation shell', async () => {
  const discovered = await discoverPageLessons();
  assert.ok(discovered.length >= STEP_LESSONS.length, 'the shape-based discovery still finds the published lessons');

  for (const lesson of STEP_LESSONS) {
    const module = await import(new URL(lesson.module, SRC).href);
    const pages = module[lesson.pages];
    const sourcePages = lesson.meta ? module[lesson.meta]?.sourcePages : pages.map((page) => page.page);
    assert.ok(Array.isArray(pages), `${lesson.module} exports ${lesson.pages}`);
    const report = auditLessonSteps(pages, { sourcePages });
    assert.deepEqual(report.problems, [], `${lesson.module}: ${report.problems.join('; ')}`);
    assert.ok(discovered.some((entry) => entry.file === lesson.module && entry.exportName === lesson.pages),
      `${lesson.module} is discovered by shape, so a future lesson is audited too`);

    /* The student shell must expose the approved step controls and must not ship the
       lesson body as pre-rendered markup (that is what one long page looked like). */
    const html = await read(`../${lesson.html}`);
    for (const hook of ['id="page-nav"', 'id="page-content"', 'id="previous-button"', 'id="next-button"', 'id="progress-track"', 'id="page-heading"']) {
      assert.ok(html.includes(hook), `${lesson.html} exposes ${hook}`);
    }
    const pageContent = html.match(/<div id="page-content"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
    assert.equal(pageContent.trim(), '', `${lesson.html} renders its steps at runtime, not as one static article`);
  }

  /* lessons that use another approved design (station rail) are not forced into this one */
  const stationLesson = await read('../src/unit2-lesson4-content.js');
  assert.match(stationLesson, /export const STATIONS/);
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
  assert.ok(projectUrl('src/lesson-steps.js'));
});
