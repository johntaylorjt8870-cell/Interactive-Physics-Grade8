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

test('the independent-tests page is a standalone RTL page with two accessible internal tabs and return navigation', async () => {
  assert.equal(existsSync(new URL('../independent-tests.html', import.meta.url)), true);
  const page = await read('../independent-tests.html');
  assert.match(page, /<html lang="ar" dir="rtl">/);
  assert.match(page, /<title>اختبارات مستقلة \| Interactive Physics — Grade 8<\/title>/);
  assert.match(page, /href="\.\/src\/independent-tests\.css"/);
  assert.match(page, /src="\.\/src\/independent-tests\.js"/);
  assert.match(page, /role="tablist"/);
  assert.equal((page.match(/role="tab"/g) ?? []).length, 2);
  assert.match(page, /aria-controls="it-panel-tests"[^>]*>\s*.*الاختبارات المستقلة/s);
  assert.match(page, /الاختبارات المستقلة/);
  assert.match(page, /حلول الاختبارات/);
  assert.equal((page.match(/role="tabpanel"/g) ?? []).length, 2);
  assert.match(page, /id="it-panel-solutions"[^>]*hidden/);
  assert.match(page, /href="\.\/"/);
  assert.match(page, /href="\.\/#available-tests"/);
});

test('both tabs ship designed, intentional empty states and no fake tests, questions, or solutions', async () => {
  const page = await read('../independent-tests.html');
  assert.match(page, /ستُضاف الاختبارات المستقلة هنا/);
  assert.match(page, /ستظهر حلول الاختبارات هنا/);
  assert.match(page, /لا توجد اختبارات تجريبية الآن/);
  assert.match(page, /لا توجد حلول تجريبية الآن/);
  assert.match(page, /id="it-tests-empty"/);
  assert.match(page, /id="it-solutions-empty"/);
  // No sample/fabricated test content anywhere in the page markup.
  assert.doesNotMatch(page, /اختبار تجريبي|سؤال تجريبي|سؤال 1|سؤال ١|placeholder/i);
  assert.equal(INDEPENDENT_TESTS.length, 0, 'stage 1 registry must stay empty');
  assert.deepEqual(Object.keys(INDEPENDENT_TEST_SOLUTIONS), [], 'stage 1 solutions registry must stay empty');
});

test('the registry links every test to its solution by a stable id, never by order or title', () => {
  assert.equal(getTestById('anything'), undefined);
  assert.equal(getSolutionForTest('anything'), undefined);
  assert.equal(hasSolutionForTest('anything'), false);
  assert.deepEqual(testIdsWithoutSolution(), []);

  assert.throws(() => validateTestEntry(null), TypeError);
  assert.throws(() => validateTestEntry({ number: 1, title: 'x' }), /missing required field "id"/);
  assert.throws(() => validateTestEntry({ id: 'bad id!', number: 1, title: 'x' }), /stable slug/);
  assert.throws(() => validateTestEntry({ id: 'test-01', number: 0, title: 'x' }), /positive integer/);
  assert.throws(() => validateTestEntry({ id: 'test-01', number: 1, title: '  ' }), /non-empty title/);
  const entry = validateTestEntry({ id: 'test-01', number: 1, title: 'اختبار أول' });
  assert.equal(entry.id, 'test-01');
});

test('tab behaviour module wires ARIA tabs with keyboard support and hash deep-links', async () => {
  const script = await read('../src/independent-tests.js');
  assert.match(script, /role|data-it-tablist/);
  assert.match(script, /ArrowLeft/);
  assert.match(script, /ArrowRight/);
  assert.match(script, /Home/);
  assert.match(script, /End/);
  assert.match(script, /aria-selected/);
  assert.match(script, /tabIndex = active \? 0 : -1/);
  assert.match(script, /'#tests'/);
  assert.match(script, /'#solutions'/);
  assert.match(script, /hashchange/);
  assert.match(script, /dataset\.testId = test\.id/);
});

test('styles keep keyboard focus visible, stay responsive, and respect reduced motion', async () => {
  const css = await read('../src/independent-tests.css');
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 880px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.it-tab\[aria-selected='true'\]/);
  assert.match(css, /\.it-tests-grid/);
  assert.match(css, /\.it-empty/);
});

test('static build copies the new area page and keeps every existing entry page', async () => {
  const build = await read('../scripts/build.mjs');
  assert.ok(build.includes("resolve(projectDirectory, 'independent-tests.html')"), 'build must copy independent-tests.html');
  for (const page of ['index.html', 'lesson-1.html', 'appendices.html', 'unit-questions.html', 'lesson-test.html', 'unit-1-test.html', 'teacher.html']) {
    assert.ok(build.includes(`resolve(projectDirectory, '${page}')`), `build must keep ${page}`);
  }
  assert.ok(build.includes("'unit-2-test.html'"), 'build must keep unit-2-test.html (batch-copied entry)');
  assert.match(build, /resolve\(projectDirectory, 'src'\)/);
});
