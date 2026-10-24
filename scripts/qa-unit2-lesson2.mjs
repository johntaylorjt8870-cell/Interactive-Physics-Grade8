// Optional real-browser QA for Unit 2 Lesson 2, in the same shape as
// scripts/qa-unit2-lesson4.mjs: install playwright-core and @sparticuz/chromium
// outside the repository, then point QA_MODULE_DIR at that node_modules and serve
// the production build on QA_BASE_URL (default http://127.0.0.1:4173).
//
//   npm run build
//   python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
//   QA_MODULE_DIR=/path/to/qa/node_modules node scripts/qa-unit2-lesson2.mjs
//
// It exercises the rebuilt activities (table, graph, terms, true/false, curves,
// the two numeric parts of p96), the three labs with their prediction and reset,
// the page navigation, the hidden answer module and the teacher gate, at
// 1366×768, 1440×900 and 390×844, and writes the screenshots to
// docs/qa/unit2-lesson2/.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(process.env.QA_MODULE_DIR ? `${process.env.QA_MODULE_DIR}/qa-entry.cjs` : import.meta.url);
const { chromium: pw } = require('playwright-core');
const Chrome = (await import(require.resolve('@sparticuz/chromium'))).default;
const browser = await pw.launch({
  executablePath: await Chrome.executablePath(),
  args: Chrome.args.filter((arg) => !['--single-process', '--disable-web-security', '--allow-running-insecure-content'].includes(arg)),
  headless: true,
});
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const out = new URL('../docs/qa/unit2-lesson2/', import.meta.url);
await mkdir(out, { recursive: true });

const results = [];
let checks = 0;
const failures = [];
const check = (condition, message) => {
  checks += 1;
  if (!condition) failures.push(message);
  assert.ok(condition, message);
};

try {
  for (const viewport of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    const requested = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => requested.push(request.url()));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', (request) => errors.push(`${request.failure()?.errorText} ${request.url()}`));

    const overflow = async (label) => {
      const size = await page.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }));
      check(size.scrollWidth <= size.innerWidth + 1, `${label}: unintended horizontal scroll ${JSON.stringify(size)}`);
    };
    /* Every graded activity fetches its answer module on demand, so the result
       appears a tick after the click: wait for the state, never sample it. */
    const graded = async (scope) => {
      await scope.locator('[data-practice-feedback][data-kind], [data-prediction-feedback][data-kind]').first().waitFor({ timeout: 15000 });
      await page.waitForTimeout(60);
    };
    const kindOf = async (locator) => locator.getAttribute('data-kind');
    const stage = async (index) => {
      await page.locator('#page-nav button').nth(index).click();
      await page.waitForTimeout(120);
    };

    await page.goto(`${base}/unit2-lesson-2.html`);
    await page.waitForSelector('#page-content .book-copy');
    await page.evaluate(() => document.fonts.ready);
    await overflow('opening');
    check(!requested.some((url) => url.includes('unit2-lesson2-answers')), 'no answers requested before an attempt');
    await page.screenshot({ path: new URL(`lesson-${viewport.width}.png`, out).pathname });

    // p90: table and graph.
    await stage(3);
    const table = page.locator('[data-u2l2-practice="p90-table"]');
    await table.locator('[data-practice-action="solution"]').click();
    await graded(table);
    check(await table.locator('[data-practice-solution]').isHidden(), 'solution locked before an attempt');
    check((await kindOf(table.locator('[data-practice-feedback]'))) === 'error', 'locked solution explains why');
    const cells = [15, 25, 4, 4, 4];
    for (let i = 0; i < cells.length; i += 1) await table.locator(`[data-practice-cell="${i}"]`).fill(String(cells[i] === 15 ? 20 : 4));
    await table.locator('[data-practice-action="check"]').click();
    await graded(table);
    check((await kindOf(table.locator('[data-practice-feedback]'))) === 'incorrect', 'wrong table rejected');
    check((await table.locator('[data-practice-score]').innerText()).includes('3 / 5'), 'three of five cells are counted right');
    await table.locator('[data-practice-cell="0"]').fill('15');
    await table.locator('[data-practice-cell="1"]').fill('25');
    await table.locator('[data-practice-action="check"]').click();
    await graded(table);
    check((await kindOf(table.locator('[data-practice-feedback]'))) === 'correct', 'correct table accepted');
    await table.locator('[data-practice-action="solution"]').click();
    await table.locator('[data-practice-solution]:visible').waitFor({ timeout: 15000 });
    check(await table.locator('[data-practice-solution] .u2l2-data-table').count() > 0, 'the model solution shows the completed table');
    await overflow('table');

    const graph = page.locator('[data-u2l2-practice="p90-graph"]');
    for (const key of ['5,20', '10,40', '15,60', '20,80', '25,100']) await graph.locator(`[data-graph-point="${key}"] .u2l2-graph-hit`).click();
    await graph.locator('[data-practice-action="check"]').click();
    await graded(graph);
    check((await kindOf(graph.locator('[data-practice-feedback]'))) === 'correct', 'graph points accepted');
    await graph.locator('[data-practice-action="reset"]').click();
    check((await graph.locator('[data-graph-status]').innerText()).includes('لم تُوضع'), 'graph reset clears only itself');
    check((await kindOf(table.locator('[data-practice-feedback]'))) === 'correct', 'the table keeps its own result');
    await page.screenshot({ path: new URL(`activities-${viewport.width}.png`, out).pathname });

    // p95 and p96 activities.
    await stage(8);
    const terms = page.locator('[data-u2l2-practice="p95-q1"]');
    for (const [i, value] of ['شدة التيار', 'الأمبير', 'مقياس الأمبير', 'التيار المتواصل'].entries()) await terms.locator(`[data-term-input="${i}"]`).fill(value);
    await terms.locator('[data-practice-action="check"]').click();
    await graded(terms);
    check((await kindOf(terms.locator('[data-practice-feedback]'))) === 'correct', 'terms accepted with diacritic-free spelling');
    await overflow('terms');

    await stage(9);
    const steps = page.locator('[data-u2l2-practice="p96-q5"]');
    await steps.locator('[data-step-value="current"]').fill('100');
    await steps.locator('[data-step-unit="current"]').selectOption('mA');
    await steps.locator('[data-step-value="charge"]').fill('30');
    await steps.locator('[data-practice-action="check"]').click();
    await graded(steps);
    check((await kindOf(steps.locator('[data-practice-feedback]'))) === 'correct', '100 mA is accepted for 0.1 A');
    await overflow('p96');

    // The three labs.
    await stage(1);
    const tube = page.locator('[data-u2l2-sim="tube"]');
    await tube.locator('[data-prediction] input[value="three"]').check();
    await tube.locator('[data-prediction-submit]').click();
    await graded(tube);
    check((await kindOf(tube.locator('[data-prediction-feedback]'))) === 'correct', 'tube prediction checked');
    await tube.locator('[data-tube-push="3"]').click();
    check((await tube.locator('[data-tube-exited]').innerText()) === '3', 'three balls leave immediately');
    await tube.locator('[data-tube-reset]').click();
    check((await tube.locator('[data-tube-exited]').innerText()) === '0', 'tube reset');
    await overflow('tube');

    await stage(6);
    const circuit = page.locator('[data-u2l2-sim="circuit"]');
    await circuit.locator('[data-circuit-mode="parallel"]').click();
    check((await circuit.locator('[data-circuit-src]').innerText()).includes('300'), 'parallel source current');
    await circuit.locator('[data-circuit-remove]').click();
    check((await circuit.locator('[data-circuit-src]').innerText()).includes('200'), 'removing a branch keeps the other');
    await circuit.locator('[data-circuit-reset]').click();
    check((await circuit.locator('[data-circuit-src]').innerText()).includes('200'), 'circuit reset');
    await overflow('circuit');
    await page.screenshot({ path: new URL(`labs-${viewport.width}.png`, out).pathname });

    check((await page.locator('.katex-error').count()) === 0, 'no KaTeX errors');
    check(!requested.some((url) => url.includes('teacher-content')), 'no teacher material requested by the student page');
    check(errors.length === 0, `console/network errors: ${errors.join(' | ')}`);

    // Teacher gate.
    const teacherRequests = [];
    const teacher = await context.newPage();
    teacher.on('request', (request) => teacherRequests.push(request.url()));
    await teacher.goto(`${base}/unit2-lesson-2-teacher.html`);
    await teacher.waitForSelector('#teacher-login');
    check(await teacher.locator('#teacher-workspace').isHidden(), 'teacher area locked');
    await teacher.locator('#teacher-password').fill('not-the-password');
    await teacher.locator('#teacher-login-submit').click();
    await teacher.waitForSelector('#teacher-auth-message:not([hidden])', { timeout: 20000 });
    check(await teacher.locator('#teacher-workspace').isHidden(), 'wrong password rejected');
    check(!teacherRequests.some((url) => url.includes('unit2-lesson2-teacher-content')), 'solutions not fetched before login');
    await teacher.locator('#teacher-password').fill('somer173');
    await teacher.locator('#teacher-login-submit').click();
    await teacher.waitForSelector('#teacher-workspace:not([hidden])', { timeout: 20000 });
    // The teacher area has one article per book page (data-page-reference) plus a
    // «محتوى الكتاب الأصلي» disclosure per page (data-source-page).
    check(await teacher.locator('.teacher-subsection[data-page-reference]').count() === 14, 'teacher has one response per task');
    const teacherPages = await teacher.locator('[data-source-page]').evaluateAll((nodes) => nodes.map((node) => node.dataset.sourcePage));
    for (let page = 87; page <= 96; page++) check(teacherPages.includes(`p${page}`), `teacher quotes the source of p${page}`);
    const teacherOverflow = await teacher.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    check(teacherOverflow.scrollWidth <= teacherOverflow.innerWidth + 1, 'teacher: unintended horizontal scroll');
    await teacher.screenshot({ path: new URL(`teacher-${viewport.width}.png`, out).pathname });
    await teacher.locator('[data-teacher-logout]').click();
    check(await teacher.locator('#teacher-workspace').isHidden(), 'logout hides the solutions');
    await teacher.close();
    await context.close();

    results.push({ viewport, checks, failures: [...failures] });
  }
} finally {
  await browser.close();
  await writeFile(new URL('browser-results.json', out), `${JSON.stringify({ base, checks, failures, results }, null, 2)}\n`);
}

console.log(`Unit 2 Lesson 2 browser QA passed: ${checks} checks.`);
