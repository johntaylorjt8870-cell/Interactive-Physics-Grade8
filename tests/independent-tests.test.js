import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import {
  INDEPENDENT_TESTS,
  INDEPENDENT_TEST_SOLUTIONS,
  getTestById,
  getSolutionForTest,
  hasSolutionForTest,
  testIdsWithoutSolution,
  validateTestEntry,
} from '../src/independent-tests-data.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('Course Home exposes a clear «اختبارات مستقلة» entry inside the existing test area, keeping all current test cards', async () => {
  const home = await read('../index.html');
  assert.match(home, /id="available-tests"/);
  assert.match(home, /<article class="home-test-card independent-tests-card">/);
  assert.match(home, /<h3>اختبارات مستقلة<\/h3>/);
  assert.match(home, /href="\.\/independent-tests\.html">افتح منطقة الاختبارات المستقلة/);
  assert.equal((home.match(/class="home-test-card[ "]/g) ?? []).length, 8, '7 existing test cards + the new zone entry');
  for (const page of ['lesson-test.html', 'lesson-2-test.html', 'unit2-lesson-1-test.html', 'unit2-lesson-2-test.html', 'unit2-lesson-3-test.html', 'unit-1-test.html', 'unit-2-test.html']) {
    assert.match(home, new RegExp(`href="\\.\\/${page.replace('.', '\\.')}"`), `existing entry ${page} must remain`);
  }
});

test('the independent-tests page is the single central RTL page and opens test content in place', async () => {
  assert.equal(existsSync(new URL('../independent-tests.html', import.meta.url)), true);
  const page = await read('../independent-tests.html');
  assert.match(page, /<html lang="ar" dir="rtl">/);
  assert.match(page, /<title>اختبارات مستقلة \| Interactive Physics — Grade 8<\/title>/);
  assert.match(page, /href="\.\/src\/independent-tests\.css"/);
  assert.match(page, /src="\.\/src\/independent-tests\.js"/);
  assert.match(page, /id="it-tests-grid"/);
  assert.match(page, /id="it-test-view"[^>]*hidden/);
  assert.match(page, /id="it1-assessment"/);
  assert.doesNotMatch(page, /role="tab"/, 'no catalog/solution tabs are nested around the 14 problem tabs');
  assert.equal(existsSync(new URL('../independent-test-1.html', import.meta.url)), false);
  assert.match(page, /href="\.\/"/);
  assert.match(page, /href="\.\/#available-tests"/);
});

test('the central catalog lists the registered test without fake or duplicate entries', async () => {
  const page = await read('../independent-tests.html');
  assert.match(page, /id="it-tests-empty"/);
  assert.match(page, /لا توجد اختبارات مستقلة منشورة حالياً/);
  assert.match(page, /id="it-test-view"/);
  assert.match(page, /data-it-back/);
  // No sample/fabricated test content anywhere in the page markup.
  assert.doesNotMatch(page, /اختبار تجريبي|سؤال تجريبي|سؤال 1|سؤال ١|placeholder/i);
  // Stage 1 shipped empty states; the zone is now populated by real tests.
  // The empty states must stay in the markup as the fallback for a future
  // registry with no entries — they are toggled by `hidden`, never deleted.
  assert.ok(INDEPENDENT_TESTS.length >= 1, 'the registry must carry the published test');
  for (const test of INDEPENDENT_TESTS) {
    assert.doesNotThrow(() => validateTestEntry(test));
  }
});

test('the registry links every test to its solution by a stable id, never by order or title', () => {
  assert.equal(getTestById('anything'), undefined);
  assert.equal(getSolutionForTest('anything'), undefined);
  assert.equal(hasSolutionForTest('anything'), false);
  assert.deepEqual(testIdsWithoutSolution(), INDEPENDENT_TESTS
    .map((test) => test.id)
    .filter((id) => !hasSolutionForTest(id)));

  assert.throws(() => validateTestEntry(null), TypeError);
  assert.throws(() => validateTestEntry({ number: 1, title: 'x' }), /missing required field "id"/);
  assert.throws(() => validateTestEntry({ id: 'bad id!', number: 1, title: 'x' }), /stable slug/);
  assert.throws(() => validateTestEntry({ id: 'test-01', number: 0, title: 'x' }), /positive integer/);
  assert.throws(() => validateTestEntry({ id: 'test-01', number: 1, title: '  ' }), /non-empty title/);
  const entry = validateTestEntry({ id: 'test-01', number: 1, title: 'اختبار أول' });
  assert.equal(entry.id, 'test-01');
});

test('the test view provides 14 accessible problem tabs and the catalog deep-links by stable id', async () => {
  const script = await read('../src/it1-assessment.js');
  const hub = await read('../src/independent-tests.js');
  assert.match(script, /role="tablist"/);
  assert.match(script, /role="tab"/);
  assert.match(script, /role="tabpanel"/);
  assert.match(script, /ArrowLeft/);
  assert.match(script, /ArrowRight/);
  assert.match(script, /Home/);
  assert.match(script, /End/);
  assert.match(script, /aria-selected/);
  assert.match(script, /tabIndex = active \? 0 : -1/);
  assert.match(script, /data-problem-tab/);
  assert.match(hub, /window\.location\.hash/);
  assert.match(hub, /hashchange/);
  assert.match(hub, /dataset\.testId/);
});
test('styles keep keyboard focus visible, stay responsive, and respect reduced motion', async () => {
  const css = await read('../src/independent-tests.css');
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.it1-problem-tab\[aria-selected=\"true\"\]/);
  assert.match(css, /\.it-tests-grid/);
  assert.match(css, /\.it-empty/);
  assert.match(css, /overflow-x: auto/);
  assert.match(css, /unicode-bidi: isolate/);
});

test('static build copies one central independent-tests page and keeps every existing entry page', async () => {
  const build = await read('../scripts/build.mjs');
  assert.ok(build.includes("resolve(projectDirectory, 'independent-tests.html')"), 'build must copy independent-tests.html');
  assert.doesNotMatch(build, /independent-test-1\.html/, 'test 1 must not ship as a separate HTML page');
  for (const page of ['index.html', 'lesson-1.html', 'appendices.html', 'unit-questions.html', 'lesson-test.html', 'unit-1-test.html', 'teacher.html']) {
    assert.ok(build.includes(`resolve(projectDirectory, '${page}')`), `build must keep ${page}`);
  }
  assert.ok(build.includes("'unit-2-test.html'"), 'build must keep unit-2-test.html (batch-copied entry)');
  assert.match(build, /resolve\(projectDirectory, 'src'\)/);
});


test('the catalog keeps the original stable registration and reports 14 problems', () => {
  const test1 = getTestById('test-01');
  assert.ok(test1);
  assert.equal(test1.href, './independent-tests.html#test-01');
  assert.equal(test1.problemCount, 14);
  assert.equal(test1.questionCount, 39);
  assert.equal(getSolutionForTest('test-01').testId, 'test-01');
});

test('only the active assessment owns the 14 tab controls', async () => {
  const page = await read('../independent-tests.html');
  const assessment = await read('../src/it1-assessment.js');
  assert.doesNotMatch(page, /role="tab"/);
  assert.match(assessment, /IT1_PROBLEMS\.map\(\(_, index\) => tabMarkup\(index\)\)/);
  assert.match(assessment, /IT1_PROBLEMS\.length/);
  assert.match(assessment, /المسألة \$\{ORDINALS\[index\]\}/);
});

test('the shared test suite keeps previous assessment entries while the independent test uses no extra route', async () => {
  const home = await read('../index.html');
  const build = await read('../scripts/build.mjs');
  assert.ok(home.includes('href="./independent-tests.html">افتح منطقة الاختبارات المستقلة'));
  assert.ok(build.includes('independent-tests.html'));
  assert.doesNotMatch(home, /independent-test-1\\.html/);
  for (const existing of ['lesson-test.html', 'lesson-2-test.html', 'unit-1-test.html', 'unit-2-test.html']) {
    assert.ok(home.includes(existing), `existing test entry ${existing} must stay`);
  }
});
