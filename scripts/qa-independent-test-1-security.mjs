/* Security and gating QA for the single-page Test 1 implementation. */
import { createRequire } from 'node:module';
const requireFromQa = createRequire(process.env.QA_MODULE_DIR ? `${process.env.QA_MODULE_DIR}/` : import.meta.url);
const { chromium } = requireFromQa('playwright-core');
const BASE = process.env.QA_BASE_URL ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  executablePath: process.env.QA_CHROMIUM ?? '/tmp/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const checks = [];
const check = (name, ok, detail = '') => {
  checks.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const requests = [];
page.on('request', (request) => requests.push(request.url()));

await page.goto(`${BASE}/dist/independent-tests.html`, { waitUntil: 'networkidle' });
check('catalog has no answer-key material', !/ANSWER_KEY|answerKey|tolerance/.test(await page.content()));
check('catalog does not request solutions', !requests.some((url) => url.includes('it1-solutions')));
await page.click('.it-card-action');
await page.waitForSelector('[role="tablist"]');
check('opening test creates exactly 14 problem tabs', await page.locator('[role="tab"]').count() === 14);
check('assessment boot does not request answer module', !requests.some((url) => url.includes('it1-solutions')));
check('answer prose and solved figures are absent before submit',
  !/ANSWER_KEY|النتيجة:|الإجابة الصحيحة/.test(await page.locator('#it1-assessment').innerText())
  && await page.locator('.it1-solution-slot[hidden]').count() === 14);
check('no diagram is present in any pre-submit question panel', await page.locator('.it1-problem-panel .it1-diagram').count() === 0);

// A wrong first response and 38 omissions must earn zero. The answer key is
// fetched only by the explicit submit action; feedback/solution is post-submit.
await page.locator('#it1-tab-1').click();
await page.locator('[data-question-id="it1p01-magnitude"][type="text"]').fill('59');
await page.locator('[data-it1-submit]').click();
await page.waitForSelector('#it1-result-summary:not([hidden])', { timeout: 20000 });
check('submission is the first answer-module request', requests.some((url) => url.includes('it1-solutions')));
check('wrong plus unanswered responses score zero', (await page.locator('#it1-result-summary').innerText()).includes('0 / 39'));
check('solutions become visible only after submit', await page.locator('.it1-solution-slot:not([hidden])').count() === 14);
check('14 unique solution figures appear after submit',
  await page.locator('.it1-solution-slot .it1-diagram').count() === 14
  && await page.locator('.it1-solution-slot .it1-diagram').evaluateAll((nodes) => new Set(nodes.map((node) => node.querySelector('title')?.textContent)).size === 14));
check('unanswered and wrong fields receive post-submit feedback',
  await page.locator('[data-feedback-for="it1p01-magnitude"]').innerText().then((text) => text.includes('راجع الإجابة'))
  && await page.locator('[data-feedback-for="it1p01-d1"]').innerText().then((text) => text.includes('لم تتم الإجابة')));
check('all resultant labels use F and none use R for the resultant',
  !/\bR\s*=|المحصلة\s*R/u.test(await page.locator('#it1-assessment').innerText())
  && await page.locator('.it1-solution-slot .it1-force-solved').count() >= 14);

requests.length = 0;
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('[role="tablist"]');
check('reload resets the attempt and does not retain solution content',
  await page.locator('#it-test-view').evaluate((node) => !node.hidden)
  && await page.locator('.it1-solution-slot[hidden]').count() === 14
  && !/ANSWER_KEY|الإجابة الصحيحة/.test(await page.content())
  && !requests.some((url) => url.includes('it1-solutions')));
await browser.close();
const failed = checks.filter((item) => !item.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} security checks passed`);
if (failed.length) process.exitCode = 1;
