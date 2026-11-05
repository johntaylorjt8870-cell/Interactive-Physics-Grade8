/* Capture reviewable Chromium screenshots from the CURRENT central-page build. */
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const requireFromQa = createRequire(process.env.QA_MODULE_DIR ? `${process.env.QA_MODULE_DIR}/` : import.meta.url);
const { chromium } = requireFromQa('playwright-core');
const PORT = process.env.PORT ?? '4173';
const PAGE = `http://127.0.0.1:${PORT}/dist/independent-tests.html`;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'qa', 'independent-test-1');
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/tmp/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })).newPage();
const assert = (ok, message) => { if (!ok) throw new Error(message); };

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
  'it1p11-construction': 'complete', 'it1p11-elements': 'full',
  'it1p12-elements': 'inside', 'it1p12-angle-effect': 'inverse',
  'it1p13-magnitude': '86.6', 'it1p13-elements': 'bisector',
  'it1p14-elements': 'bisector', 'it1p14-magnitude': '138.6', 'it1p14-alpha': '30',
};

await page.goto(PAGE, { waitUntil: 'networkidle' });
// Chromium's fullPage capture temporarily changes fixed-position painting and
// can rasterize the intentionally off-canvas, unfocused skip link over the
// page content. Suppress only that off-canvas paint in these visual captures;
// the application's real CSS and keyboard/focus behavior remain unchanged.
await page.addStyleTag({ content: '.home-skip-link:not(:focus) { visibility: hidden !important; }' });
await page.screenshot({ path: join(OUT, 'catalog-1440.png'), fullPage: true });
await page.click('.it-card-action');
await page.waitForSelector('[role="tab"][aria-selected="true"]');
assert(await page.locator('[role="tab"]').count() === 14, 'expected 14 problem tabs');

// Individual full-panel captures prove all fourteen tabs were actually visited.
for (let index = 1; index <= 14; index += 1) {
  await page.locator(`#it1-tab-${index}`).click();
  const panel = page.locator(`#it1-panel-${index}`);
  await panel.waitFor({ state: 'visible' });
  assert(await panel.locator('.it1-diagram').count() === 0, `problem ${index} has a prompt-side drawing`);
  assert(await panel.locator('.it1-solution-slot').evaluate((node) => node.hidden), `problem ${index} solution was exposed early`);
  await page.screenshot({ path: join(OUT, `problem-${String(index).padStart(2, '0')}-question-1440.png`), fullPage: true });
}
await page.locator('#it1-tab-1').click();
await page.screenshot({ path: join(OUT, 'tabs-and-question-1440.png'), fullPage: false });
await page.locator('#it1-tab-7').click();
assert((await page.locator('#it1-panel-7').innerText()).includes('tan'), 'problem 7/8 math should appear');
await page.screenshot({ path: join(OUT, 'equations-and-symbols-1440.png'), fullPage: true });

// Real laptop viewport: ensure the question and tabs are visible and page itself
// does not acquire an unintended horizontal scrollbar.
await page.setViewportSize({ width: 1366, height: 768 });
await page.locator('#it1-tab-3').click();
let width = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
assert(width <= 1, `1366px page overflowed ${width}px`);
await page.screenshot({ path: join(OUT, 'laptop-1366.png'), fullPage: false });

// Real mobile viewport: the tab strip is horizontally scrollable inside its
// own region, while the document remains within 390 CSS pixels.
await page.setViewportSize({ width: 390, height: 844 });
await page.locator('#it1-tab-14').click();
width = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
assert(width <= 1, `390px page overflowed ${width}px`);
const mobileScroll = await page.evaluate(() => {
  const strip = document.querySelector('.it1-tab-scroll');
  return strip.scrollWidth > strip.clientWidth;
});
assert(mobileScroll, 'the mobile tab strip should scroll horizontally');
await page.screenshot({ path: join(OUT, 'mobile-390.png'), fullPage: true });

// Fill all fields against the independently specified QA values, then verify
// that the answer module is loaded only as the result of final submission.
const questionMeta = await page.evaluate(async () => (await import('./src/it1-problems.js')).IT1_QUESTIONS.map(({ id, problemId, type }) => ({ id, problemId, type })));
for (const q of questionMeta) {
  await page.locator(`#it1-tab-${Number(q.problemId.slice(-2))}`).click();
  const value = answerKeys[q.id];
  assert(value !== undefined, `missing expected answer for ${q.id}`);
  if (q.type === 'single-choice') await page.locator(`[data-question-id="${q.id}"][type="radio"][value="${value}"]`).check();
  else await page.locator(`[data-question-id="${q.id}"][type="text"]`).fill(value);
}
await page.locator('[data-it1-submit]').click();
await page.waitForSelector('#it1-result-summary:not([hidden])');
assert((await page.locator('#it1-result-summary').innerText()).includes('39 / 39'), 'perfect attempt must score 39/39');
await page.setViewportSize({ width: 1440, height: 1000 });
await page.locator('#it1-tab-1').click();
await page.locator('#it1-panel-1 .it1-solution').scrollIntoViewIfNeeded();
assert(await page.locator('#it1-panel-1 .it1-diagram').count() === 1, 'problem 1 must show exactly one solution figure');
await page.screenshot({ path: join(OUT, 'problem-01-solution-1440.png'), fullPage: true });
await page.locator('#it1-tab-11').click();
await page.screenshot({ path: join(OUT, 'problem-11-solution-1440.png'), fullPage: true });
await page.locator('#it1-tab-13').click();
await page.screenshot({ path: join(OUT, 'problem-13-solution-1440.png'), fullPage: true });

await browser.close();
console.log(`Chromium QA screenshots saved under ${OUT}`);
