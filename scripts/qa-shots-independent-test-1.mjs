/**
 * Regenerates the four review screenshots in docs/qa/independent-test-1/.
 *
 * These are the images a reviewer looks at, so they must always be captured
 * from the CURRENT build. Every capture below runs against dist/, after
 * `npm run build`, and asserts the state it claims to show.
 *
 * Usage (a static server must be serving the repo root on PORT):
 *   QA_MODULE_DIR=/tmp/qa/node_modules LD_LIBRARY_PATH=/tmp/nss/lib \
 *     node scripts/qa-shots-independent-test-1.mjs
 */
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const requireFromQa = createRequire(process.env.QA_MODULE_DIR ? `${process.env.QA_MODULE_DIR}/` : import.meta.url);
const { chromium } = requireFromQa('playwright-core');

const PORT = process.env.PORT ?? 4173;
const BASE = `http://127.0.0.1:${PORT}/dist/independent-test-1.html`;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'qa', 'independent-test-1');

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/tmp/chromium',
  headless: true,
  args: ['--no-sandbox'],
});

const submit = async (page) => {
  await page.evaluate(() => document.querySelectorAll('.question-index-button')[39].click());
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('[data-action="attempt-submit"]').click());
  await page.waitForTimeout(300);
  const confirm = await page.$('[data-dialog-action="confirm-submit"]');
  if (confirm) await confirm.click();
  await page.waitForSelector('.it1-solution', { timeout: 20000 });
};

/* 1 and 2 — all fourteen figures, givens then solved. */
{
  const page = await (await browser.newContext({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 1 })).newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('[data-action="start"]');
  await page.waitForSelector('.test-question');

  /* Collect one figure per problem, straight from the rendered cards. */
  const figures = [];
  for (let n = 1; n <= 40; n++) {
    await page.evaluate((i) => document.querySelectorAll('.question-index-button')[i - 1].click(), n);
    await page.waitForTimeout(60);
    const html = await page.evaluate(() => document.querySelector('.test-question .it1-figure-inner')?.outerHTML ?? '');
    if (html && !figures.includes(html)) figures.push(html);
  }
  const sheet = (items) => `<html dir="rtl"><head><meta charset="utf-8">
    <link rel="stylesheet" href="http://127.0.0.1:${PORT}/dist/src/it1.css">
    <link rel="stylesheet" href="http://127.0.0.1:${PORT}/dist/src/lesson-test.css">
    <style>body{margin:0;padding:18px;background:#f4f5f8;direction:rtl}
      .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
      .cell{background:#fff;border-radius:12px;padding:10px}
      .cell .it1-figure-inner{width:100%;max-width:none}
      .cap{font:600 13px sans-serif;color:#555;direction:ltr;margin-bottom:6px}</style></head>
    <body><div class="grid">${items.map((html, i) => `<div class="cell"><div class="cap">problem ${i + 1} — givens</div>${html}</div>`).join('')}</div></body></html>`;
  const sheet2 = sheet(figures);
  await page.setContent(sheet2, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, 'figures-givens.png'), fullPage: true });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('[data-action="start"]');
  await page.waitForSelector('.test-question');
  await submit(page);
  const solved = await page.evaluate(() => [...document.querySelectorAll('.it1-solution')]
    .map((s) => s.querySelector('.it1-figure-inner').outerHTML));
  await page.setContent(sheet(solved).replace(/— givens/g, '— solved'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, 'figures-solved.png'), fullPage: true });
  await page.close();
}

/* 3 — problem 1 after submission, whole solution block. */
{
  const page = await (await browser.newContext({ viewport: { width: 1300, height: 900 }, deviceScaleFactor: 1 })).newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('[data-action="start"]');
  await page.waitForSelector('.test-question');
  await submit(page);
  const block = page.locator('[data-solution="it1p01"]');
  await block.scrollIntoViewIfNeeded();
  await block.screenshot({ path: join(OUT, 'solution-problem-1.png') });
  await page.close();
}

/* 4 — phone 390px, mid-test, on a card whose figure is drawn to scale. */
{
  const page = await (await browser.newContext({ viewport: { width: 390, height: 1400 }, deviceScaleFactor: 2 })).newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('[data-action="start"]');
  await page.waitForSelector('.test-question');
  await page.evaluate(() => document.querySelectorAll('.question-index-button')[7].click());
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (overflow > 0) throw new Error(`phone layout overflows by ${overflow}px`);
  await page.screenshot({ path: join(OUT, 'mobile-390.png') });
  await page.close();
}

await browser.close();
console.log('screenshots written to docs/qa/independent-test-1/');
