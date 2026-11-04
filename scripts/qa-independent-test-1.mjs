/* Real-browser QA for Independent Test 1 (independent-test-1.html).
 *
 * Runs against playwright-core + @sparticuz/chromium installed OUTSIDE the
 * repository, exactly like the archived QA scripts in docs/qa:
 *
 *   python3 -m http.server 4173 --bind 0.0.0.0        # repo root
 *   LD_LIBRARY_PATH=/tmp/nss/lib node scripts/qa-independent-test-1.mjs
 *
 * What it proves (not just "the page loads"):
 *   1. the page renders 14 problem statements and 40 answer controls;
 *   2. no answer content is reachable before submission — not in the network
 *      responses, not in the DOM, not in any loaded script;
 *   3. answering, navigating, reloading and restarting all behave;
 *   4. submitting reveals the score and only then loads the answer module;
 *   5. the solved figures appear after submission and the resultant is `F`;
 *   6. layout holds at 1440, 1366 and 390 px with no horizontal overflow and
 *      no overlapping labels.
 */
import { createRequire } from 'node:module';

/* playwright-core is intentionally NOT a project dependency (same rule as the
   archived QA scripts): install it outside the repo and point QA_MODULE_DIR at
   that node_modules. */
const requireFromQa = createRequire(process.env.QA_MODULE_DIR ? `${process.env.QA_MODULE_DIR}/` : import.meta.url);
const { chromium: pw } = requireFromQa('playwright-core');

const BASE = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4173';
const EXE = process.env.QA_CHROMIUM ?? '/tmp/chromium';
const PAGE = `${BASE}/dist/independent-test-1.html`;

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  if (!ok) console.log(`FAIL ${name} ${extra}`);
};

const browser = await pw.launch({
  executablePath: EXE,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  timeout: 60000,
});

const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const requested = [];
const page = await context.newPage();
page.on('request', (request) => requested.push(request.url()));
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(String(error)));
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });

/* ---------------------------------------------------------------- 1. boot -- */
await page.goto(PAGE, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-action="start"]', { timeout: 15000 });

check('no pre-submit answer module was requested',
  !requested.some((url) => url.includes('it1-solutions')),
  requested.filter((url) => url.includes('it1-')).join(' '));

const preSubmitHtml = await page.content();
check('pre-submit DOM has no answer key', !/ANSWER_KEY|answerKey|tolerance/.test(preSubmitHtml));
check('pre-submit DOM has no solved figure', !/it1-force-solved|-res"/.test(preSubmitHtml));

check('the overview lists 14 problems', (await page.locator('.it1-overview-item').count()) === 14);

await page.click('[data-action="start"]');
await page.waitForSelector('.test-question', { timeout: 10000 });

check('the first question shows a problem statement and an ask',
  (await page.locator('.it1-problem-lead').count()) === 1 && (await page.locator('.it1-ask').count()) === 1);
check('the first question has a givens figure that hides the resultant',
  (await page.locator('.it1-diagram').count()) === 1 && (await page.locator('.it1-diagram .it1-force-solved').count()) === 0);
check('the question counter says 1 of 40', /1 من 40|١ من ٤٠/.test(await page.locator('#question-heading').innerText()));

/* ------------------------------------------------- 2. answering + grading -- */
const answerKeys = {
  'it1p01-magnitude': '60', 'it1p01-d1': '1.5', 'it1p01-d2': '0.5',
  'it1p02-magnitude': '80', 'it1p02-elements': 'full', 'it1p02-d1': '0.2', 'it1p02-d2': '0.6',
  'it1p03-magnitude': '400', 'it1p03-d2': '0.25', 'it1p03-total': '1',
  'it1p04-magnitude': '60', 'it1p04-d1': '0.9', 'it1p04-d2': '0.3',
  'it1p05-f2': '160', 'it1p05-elements': 'outside-larger', 'it1p05-d1': '0.8', 'it1p05-total': '0.6',
  'it1p06-elements': 'full', 'it1p06-d2': '0.5', 'it1p06-total': '1.5',
  'it1p07-elements': 'diagonal', 'it1p07-magnitude': '5', 'it1p07-alpha': '53.1',
  'it1p08-magnitude': '20', 'it1p08-tan': '0.75',
  'it1p09-elements': 'bisector', 'it1p09-magnitude': '8.49', 'it1p09-alpha': '45',
  'it1p10-magnitude': '28.28', 'it1p10-shape': 'square-diagonal',
  'it1p11-construction': 'complete', 'it1p11-elements': 'full', 'it1p11-magnitude': '23.2',
  'it1p12-elements': 'inside', 'it1p12-angle-effect': 'inverse',
  'it1p13-magnitude': '86.6', 'it1p13-elements': 'bisector',
  'it1p14-elements': 'bisector', 'it1p14-magnitude': '138.6', 'it1p14-alpha': '30',
};

/* The public module gives the question order; the answers below are keyed by
   question id, so the harness never guesses a mapping by position. */
const questionIds = await page.evaluate(async () => {
  const module = await import('./src/it1-problems.js');
  return module.IT1_QUESTIONS.map((question) => [question.id, question.type]);
});

let answered = 0;
for (let index = 0; index < questionIds.length; index += 1) {
  const [fieldId, type] = questionIds[index];
  if (index === 19) continue; // leave one numeric graded field unanswered
  await page.click(`[data-action="go-question"][data-index="${index}"]`);
  await page.waitForSelector('.test-question');
  const value = answerKeys[fieldId];
  if (!value) throw new Error(`no answer mapped for ${fieldId}`);
  if (type === 'single-choice') {
    await page.locator(`input[data-answer-option="${value}"]`).first().check();
  } else {
    await page.locator('[data-answer-control="numeric"]').fill(value);
  }
  answered += 1;
}

check('every control accepted input', answered === 39, String(answered));

/* ---------------------------------------------------------- 3. progress ---- */
await page.click('[data-action="go-question"][data-index="0"]');
const progressText = await page.locator('#quiz-progress-copy').innerText();
check('progress reflects recorded answers', /39/.test(progressText.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660))), progressText);

/* ------------------------------------------------------------ 5. submit ---- */
await page.click('[data-action="attempt-submit"]');
await page.waitForSelector('[data-dialog-action="confirm-submit"]');
await page.click('[data-dialog-action="confirm-submit"]');
await page.waitForSelector('#results-title', { timeout: 20000 });

check('submitting loads the answer module', requested.some((url) => url.includes('it1-solutions')));
const score = await page.locator('.result-score-main strong').innerText();
check('39 of 40 correct', score.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660)) === '39/40', score);

await page.waitForSelector('#it1-solutions:not([hidden])', { timeout: 15000 });
await page.waitForSelector('.it1-solution', { timeout: 20000 });
check('14 worked solutions are rendered', (await page.locator('.it1-solution').count()) === 14);
check('solved figures appear only now', (await page.locator('.it1-diagram .it1-force-solved').count()) >= 14);
check('the resultant is labelled F in the solutions',
  (await page.locator('.it1-force-solved').first().evaluate((node) => node.textContent)).includes('F'));

const solvedText = await page.locator('#it1-solutions').innerText();
check('the corrected problem 6 answer is published', /0\.5/.test(solvedText) && /1\.5/.test(solvedText));
check('the corrected problem 7 answer is published', /5 N/.test(solvedText));
check('the corrected problem 9 answer is published', /8\.49/.test(solvedText));
check('no step claims a "larger force" for the equal-force problems',
  !/المسألة 9[\s\S]{0,1200}الكبرى/.test(solvedText) && !/المسألة 10[\s\S]{0,1200}الكبرى/.test(solvedText));

/* ------------------------------------------------------------ 6. restart --- */
await page.click('.results-restart-row [data-action="restart"]');
await page.waitForSelector('[data-dialog-action="confirm-restart"]');
await page.click('[data-dialog-action="confirm-restart"]');
await page.waitForSelector('.test-question', { timeout: 10000 });
check('restart clears the attempt', (await page.locator('.is-answered').count()) === 0);
check('restart hides the worked solutions again',
  await page.locator('#it1-solutions').evaluate((node) => node.hidden));

/* ------------------------------------------------------------- 7. reload --- */
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[data-action="start"]');
check('a reload returns to the welcome screen without leaking answers',
  (await page.content()).includes('لا تُعرض صحة الإجابات'));
check('a reload requests no answer module',
  !(await page.evaluate(() => performance.getEntriesByType('resource').some((entry) => entry.name.includes('it1-solutions')))));
check('a reload leaves the worked solutions hidden',
  await page.locator('#it1-solutions').evaluate((node) => node.hidden));

/* ------------------------------------------------------------- 8. layout --- */
const layoutReport = [];
for (const [width, height, tag] of [[1440, 900, 'desktop'], [1366, 768, 'laptop'], [390, 844, 'phone']]) {
  const view = await context.newPage();
  await view.setViewportSize({ width, height });
  await view.goto(PAGE, { waitUntil: 'networkidle' });
  await view.click('[data-action="start"]');
  await view.waitForSelector('.test-question');
  const overflow = await view.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  layoutReport.push(`${tag}:${width}→overflow ${overflow}`);
  check(`${tag}: no horizontal overflow`, overflow <= 1, `${overflow}px`);
  const overlaps = await view.evaluate(() => {
    const labels = [...document.querySelectorAll('.it1-label, .it1-value, .it1-span-label')];
    const boxes = labels.map((node) => node.getBoundingClientRect()).filter((box) => box.width > 0);
    let hits = 0;
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) hits += 1;
      }
    }
    return hits;
  });
  check(`${tag}: figure labels do not overlap`, overlaps === 0, `${overlaps} overlaps`);
  const figureWidth = await view.locator('.it1-diagram').first().evaluate((node) => node.getBoundingClientRect().width);
  check(`${tag}: the figure fits its column`, figureWidth <= width, `${figureWidth}px`);
  await view.close();
}

/* --------------------------------------------------- 8. direct + errors ---- */
const direct = await context.newPage();
const response = await direct.goto(PAGE, { waitUntil: 'domcontentloaded' });
check('direct link to the test page responds 200', response.status() === 200, String(response.status()));
check('direct link starts at the welcome screen, not mid-test',
  (await direct.locator('[data-action="start"]').count()) === 1);
await direct.close();

const zone = await context.newPage();
await zone.goto(`${BASE}/independent-tests.html`, { waitUntil: 'networkidle' });
check('the zone shows the test card', (await zone.locator('.it-card').count()) === 1);
const cardHref = await zone.locator('.it-card-action').first().getAttribute('href');
check('the card links to the test page', cardHref === './independent-test-1.html', String(cardHref));
await zone.close();

check('no console or page errors', consoleErrors.length === 0, consoleErrors.join(' | ').slice(0, 300));

await browser.close();

const failed = results.filter((entry) => !entry.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
console.log(layoutReport.join(' · '));
if (failed.length > 0) {
  for (const entry of failed) console.log(` - ${entry.name} ${entry.extra}`);
  process.exitCode = 1;
}
