/* Security / submission-path QA for Independent Test 1.
 *
 *   python3 -m http.server 4173 --bind 0.0.0.0        # repo root, serves dist/
 *   QA_MODULE_DIR=/tmp/qa/node_modules LD_LIBRARY_PATH=/tmp/nss/lib \
 *     node scripts/qa-independent-test-1-security.mjs
 *
 * Proves behaviour, not markup:
 *   - before submission the key module is never requested and no answer prose
 *     or solved figure is present in the document (all 40 question cards);
 *   - the review exists only after submission, one correct-answer line and one
 *     explanation per graded item, with the solved figures;
 *   - restarting, reloading mid-test and reloading after submission all leave
 *     no score and no solutions in the new document;
 *   - grading is real: a wrong numeric answer scores 0, unanswered items are
 *     reported as unanswered.
 */
import { createRequire } from 'node:module';
const requireFromQa = createRequire('/tmp/qa/node_modules/');
const { chromium } = requireFromQa('playwright-core');
const BASE = 'http://127.0.0.1:4173';
const b = await chromium.launch({ executablePath: '/tmp/chromium', headless: true, args: ['--no-sandbox'] });
const results = [];
const check = (n, ok, extra='') => { results.push({n, ok}); console.log(`${ok?'OK  ':'FAIL'} ${n} ${extra}`); };

async function fresh(viewport = { width: 1440, height: 900 }) {
  const ctx = await b.newContext({ viewport });
  const page = await ctx.newPage();
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  return { ctx, page, reqs };
}

/* A. every resource the page is allowed to fetch before submission */
{
  const { ctx, page, reqs } = await fresh();
  await page.goto(`${BASE}/dist/independent-test-1.html`, { waitUntil: 'networkidle' });
  const solutions = reqs.filter((u) => u.includes('it1-solutions'));
  check('welcome: no it1-solutions request', solutions.length === 0, solutions.join(','));
  const html = await page.content();
  check('welcome: no key material in DOM', !/ANSWER_KEY|tolerance|it1-force-solved|الإجابة الصحيحة/.test(html));
  check('welcome: the solutions panel exists but is hidden',
    (await page.locator('#it1-solutions').getAttribute('hidden')) !== null);

  await page.click('[data-action="start"]');
  await page.waitForSelector('.test-question');
  // Walk every question and capture the DOM of each one.
  let leaked = [];
  for (let i = 0; i < 40; i += 1) {
    await page.click(`[data-action="go-question"][data-index="${i}"]`);
    await page.waitForSelector('.test-question');
    const dom = await page.locator('.test-question').innerHTML();
    if (/it1-force-solved|-res"|ANSWER_KEY/.test(dom)) leaked.push(i);
    // the answer prose must not appear in any question card before submission
    if (/النتيجة:|الإجابة الصحيحة/.test(dom)) leaked.push(`prose-${i}`);
  }
  check('in-test: no solved figure or answer prose in any of the 40 cards', leaked.length === 0, leaked.join(','));
  check('in-test: still no it1-solutions request', reqs.filter((u) => u.includes('it1-solutions')).length === 0);
  await ctx.close();
}

/* B. a direct hit on the module URL itself is the only way to get the key —
      and the page never issues it; record what a curious student would see */
{
  const { ctx, page } = await fresh();
  const res = await page.goto(`${BASE}/dist/src/it1-solutions.js`);
  check('the solutions module does exist as a static file (server-side load is required)', res.status() === 200, String(res.status()));
  const zonePage = await ctx.newPage();
  await zonePage.goto(`${BASE}/dist/independent-tests.html`, { waitUntil: 'networkidle' });
  const zone = await zonePage.content();
  check('zone page does not embed any key', !/ANSWER_KEY|tolerance/.test(zone));
  await ctx.close();
}

/* C. after submission the review is complete and restart closes it again */
{
  const { ctx, page } = await fresh();
  await page.goto(`${BASE}/dist/independent-test-1.html`, { waitUntil: 'networkidle' });
  await page.click('[data-action="start"]');
  await page.waitForSelector('.test-question');
  await page.click('[data-action="attempt-submit"]');
  await page.click('[data-dialog-action="confirm-submit"]');
  await page.waitForSelector('#results-title');
  await page.waitForSelector('.it1-solution');
  const reviewItems = await page.locator('.solution-item').count();
  check('review renders one card per graded item', reviewItems === 40, String(reviewItems));
  const correctLines = await page.locator('.solution-correct-answer').count();
  check('every graded item shows its correct answer', correctLines === 40, String(correctLines));
  const exp = await page.locator('.solution-explanation').count();
  check('every graded item shows an explanation', exp === 40, String(exp));
  const solvedFigs = await page.locator('.it1-solution .it1-force-solved').count();
  check('solved figures: one per problem (14)', solvedFigs >= 14, String(solvedFigs));
  const steps = await page.locator('.it1-solution .solution-row').count();
  check('worked steps are rendered', steps >= 60, String(steps));

  await page.click('.results-restart-row [data-action="restart"]');
  await page.click('[data-dialog-action="confirm-restart"]');
  await page.waitForSelector('.test-question');
  check('restart hides the solutions section', await page.locator('#it1-solutions').evaluate((n) => n.hidden));
  check('restart leaves no visible solution block',
    (await page.locator('.it1-solution:visible').count()) === 0);
  await ctx.close();
}

/* D. reload mid-test and after submission */
{
  const { ctx, page } = await fresh();
  await page.goto(`${BASE}/dist/independent-test-1.html`, { waitUntil: 'networkidle' });
  await page.click('[data-action="start"]');
  await page.waitForSelector('.test-question');
  await page.reload({ waitUntil: 'networkidle' });
  check('reload mid-test: back to welcome, no key in DOM', (await page.locator('[data-action="start"]').count()) === 1 && !/ANSWER_KEY/.test(await page.content()));
  await page.click('[data-action="start"]');
  await page.waitForSelector('.test-question');
  await page.click('[data-action="attempt-submit"]');
  await page.click('[data-dialog-action="confirm-submit"]');
  await page.waitForSelector('#results-title');
  await page.reload({ waitUntil: 'networkidle' });
  check('reload after submission: no score and no solutions in the new document',
    (await page.locator('#results-title').count()) === 0 && (await page.locator('.it1-solution').count()) === 0);
  await ctx.close();
}

/* E. the graded score is real: wrong answers must be counted wrong */
{
  const { ctx, page } = await fresh();
  await page.goto(`${BASE}/dist/independent-test-1.html`, { waitUntil: 'networkidle' });
  await page.click('[data-action="start"]');
  await page.waitForSelector('.test-question');
  await page.click('[data-action="go-question"][data-index="0"]');
  await page.locator('[data-answer-control="numeric"]').fill('59');   // wrong
  await page.click('[data-action="attempt-submit"]');
  await page.click('[data-dialog-action="confirm-submit"]');
  await page.waitForSelector('#results-title');
  const score = (await page.locator('.result-score-main strong').innerText()).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660));
  check('a wrong numeric answer scores 0/40', score === '0/40', score);
  await page.evaluate(() => document.querySelectorAll('details.solution-group').forEach((d) => { d.open = true; }));
  const verdicts = await page.locator('.solution-verdict').allInnerTexts();
  check('the wrong item is marked "إجابة غير صحيحة"', verdicts[0].includes('غير صحيحة'), verdicts[0]);
  check('unanswered items are marked "لم تتم الإجابة"', verdicts.slice(1).every((v) => v.includes('لم تتم')), verdicts[1]);
  await ctx.close();
}

await b.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} security checks passed`);
if (failed.length) process.exitCode = 1;
