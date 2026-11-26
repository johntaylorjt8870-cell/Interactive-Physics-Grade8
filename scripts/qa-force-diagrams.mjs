/* Chromium visual + DOM audit for the Unit 1 force-diagram fixes.
 *
 * LAPTOP ONLY: 1366×768 and 1440×900 (no Mobile / Tablet viewports).
 *
 * Requires an already-running static server, like the other qa-*.mjs scripts:
 *   npm start                         # python3 -m http.server 4173 (repo root)
 *   CHROMIUM_PATH=/tmp/chromium \
 *   QA_MODULE_DIR=<dir with playwright-core> \
 *     node scripts/qa-force-diagrams.mjs
 *
 * It verifies the p63 wagon traction is horizontal/forward and both Lesson 2
 * assessment figures obey F = F1 + F2 / F = |F2 − F1|, then writes reviewable
 * screenshots under docs/qa/force-diagrams-audit/<viewport>/.
 */
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const requireFromQa = createRequire(process.env.QA_MODULE_DIR ? `${process.env.QA_MODULE_DIR}/` : import.meta.url);
const { chromium } = requireFromQa('playwright-core');
const PORT = process.env.PORT ?? '4173';
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'qa', 'force-diagrams-audit');

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/tmp/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const check = (ok, message) => { if (!ok) throw new Error(message); };
const report = [];

for (const vp of [{ w: 1366, h: 768 }, { w: 1440, h: 900 }]) {
  const tag = `${vp.w}x${vp.h}`;
  const dir = join(OUT, tag);
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, locale: 'ar',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  /* ---- Lesson 2, printed page 63: the two horse-traction arrows ---- */
  await page.goto(`${BASE}/lesson-2.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('.page-nav-button[data-page="63"]')?.click());
  await page.waitForTimeout(200);
  const wagon = await page.evaluate(() => {
    const svg = [...document.querySelectorAll('svg')]
      .find((s) => (s.querySelector('title')?.textContent ?? '').includes('حصانان'));
    if (!svg) return null;
    return {
      forces: [...svg.querySelectorAll('line.l2-force')].map((l) => ({
        x1: +l.getAttribute('x1'), y1: +l.getAttribute('y1'),
        x2: +l.getAttribute('x2'), y2: +l.getAttribute('y2'),
      })),
      carriers: [...svg.querySelectorAll('line.l2-carrier')].map((l) => ({
        y1: +l.getAttribute('y1'), y2: +l.getAttribute('y2'),
      })),
      labels: [...svg.querySelectorAll('text')].map((t) => t.textContent),
    };
  });
  check(wagon, `${tag}: wagon SVG missing`);
  check(wagon.forces.length === 2, `${tag}: expected two traction arrows`);
  check(wagon.forces.every((f) => f.y1 === f.y2 && f.x2 > f.x1), `${tag}: traction must be horizontal and forward`);
  check(wagon.carriers.length === 2 && wagon.carriers.every((c) => c.y1 === c.y2), `${tag}: carriers horizontal`);
  check(wagon.carriers[0].y1 !== wagon.carriers[1].y1, `${tag}: carriers parallel and side-by-side`);
  check(wagon.labels.includes('F₁') && wagon.labels.includes('F₂'), `${tag}: F1/F2 labels visible`);
  await page.locator('svg:has(title:text-is("حصانان يشدّان عربة بقوتين متوازيتين"))').first()
    .screenshot({ path: join(dir, 'lesson2-p63-wagon.png') })
    .catch(() => page.screenshot({ path: join(dir, 'lesson2-p63-wagon.png') }));
  await page.screenshot({ path: join(dir, 'lesson2-p63-page.png') });
  report.push(`${tag} p63 wagon: horizontal forward traction on two parallel carriers — OK`);

  /* ---- Lesson 2 test: q04 same-parallel, q17 opposite-parallel ---- */
  await page.goto(`${BASE}/lesson-2-test.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('[data-action="start"]')?.click());
  await page.waitForTimeout(150);
  const gotoQ = async (index) => {
    await page.evaluate((i) => document
      .querySelector(`[data-action="go-question"][data-index="${i}"]`)?.click(), index);
    await page.waitForTimeout(150);
  };
  const readFigure = () => page.evaluate(() => {
    const svg = document.querySelector('.assessment-figure svg');
    if (!svg) return null;
    return {
      lines: [...svg.querySelectorAll('line')].map((l) => ({
        cls: l.getAttribute('class') ?? '',
        x1: +l.getAttribute('x1'), y1: +l.getAttribute('y1'),
        x2: +l.getAttribute('x2'), y2: +l.getAttribute('y2'),
      })),
      labels: [...svg.querySelectorAll('text')].map((t) => t.textContent.trim()),
    };
  });
  const span = (l) => Math.abs(l.y1 - l.y2);

  await gotoQ(3); // l2q04 → same-parallel
  const same = await readFigure();
  check(same, `${tag}: q04 figure missing`);
  const sf = same.lines.filter((l) => /assessment-force/.test(l.cls));
  const sr = same.lines.filter((l) => /assessment-resultant/.test(l.cls));
  check(sf.length === 2 && sr.length === 1, `${tag}: q04 needs 2 forces + 1 resultant`);
  check([...sf, ...sr].every((l) => l.y2 < l.y1), `${tag}: q04 all arrows up`);
  check(span(sr[0]) === sf.map(span).reduce((a, b) => a + b, 0), `${tag}: q04 F = F1 + F2`);
  check(['F₁', 'F₂', 'F'].every((s) => same.labels.includes(s)), `${tag}: q04 symbols visible`);
  await page.locator('.assessment-figure').first().screenshot({ path: join(dir, 'lesson2-test-q04-same.png') });
  report.push(`${tag} q04 same-sense: all up, resultant = F1 + F2 — OK`);

  await gotoQ(16); // l2q17 → opposite-parallel
  const opp = await readFigure();
  check(opp, `${tag}: q17 figure missing`);
  const of = opp.lines.filter((l) => /assessment-force/.test(l.cls));
  const or = opp.lines.filter((l) => /assessment-resultant/.test(l.cls));
  check(of.length === 2 && or.length === 1, `${tag}: q17 needs 2 forces + 1 resultant`);
  const small = of.reduce((a, b) => (span(a) < span(b) ? a : b));
  const large = of.reduce((a, b) => (span(a) > span(b) ? a : b));
  check(span(or[0]) === span(large) - span(small), `${tag}: q17 F = |F2 − F1|`);
  check((or[0].y2 > or[0].y1) === (large.y2 > large.y1), `${tag}: q17 resultant sense = larger force`);
  check(['F₁', 'F₂', 'F'].every((s) => opp.labels.includes(s)), `${tag}: q17 symbols visible`);
  await page.locator('.assessment-figure').first().screenshot({ path: join(dir, 'lesson2-test-q17-opposite.png') });
  report.push(`${tag} q17 opposite-sense: resultant = larger − smaller, correct sense — OK`);

  check(pageErrors.length === 0, `${tag}: page errors: ${pageErrors.join(' | ')}`);
  report.push(`${tag}: no page errors`);
  await context.close();
}

await browser.close();
console.log(report.join('\n'));
console.log('VISUAL_QA_OK');
