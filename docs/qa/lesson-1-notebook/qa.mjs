/* Browser QA for the Lesson 1 student notebook (الوحدة الأولى · الدرس الأول).
 *
 * Not part of the deployed site and not a project dependency. It runs against
 * `playwright-core` + `@sparticuz/chromium` installed OUTSIDE the repository
 * (the same pattern as `docs/qa/lesson-2-notebook/qa.mjs`), with the NSS layer
 * of the bundled `al2023.tar.br` on LD_LIBRARY_PATH:
 *
 *   python3 -m http.server 4173 --bind 0.0.0.0      # from the repository root
 *   LD_LIBRARY_PATH=/tmp/nss/lib node docs/qa/lesson-1-notebook/qa.mjs
 *
 * The archived run is `browser-results.txt` next to this file; the archived
 * screenshots are the PNGs in `1366x768/` and `1440x900/`.
 *
 * Scope: laptop only. The notebook is a long reference document, so the run
 * asserts readability and containment (no horizontal page overflow, no clipped
 * formula, no table escaping its card) rather than mobile behaviour.
 */
import { chromium as pw } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = 'http://127.0.0.1:4173';
const HERE = new URL('./', import.meta.url).pathname;

const browser = await pw.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args,
  headless: true,
  timeout: 60000,
});

const results = [];
const check = (name, ok, extra = '') => results.push({ name, ok, extra });

/* The six positions captured at both laptop resolutions. Each entry is an
 * anchor id inside the notebook plus the file name of its screenshot. */
const SHOTS = [
  ['student-notebook-title', '01-notebook-header'],
  ['student-notebook-contents', '02-contents'],
  ['nb-s05', '03-parallelogram-rule'],
  ['nb-s08', '04-worked-example-2'],
  ['nb-s10', '05-inclined-plane'],
  ['nb-s12', '06-self-check'],
  ['nb-s13', '07-textbook-problems'],
];

/* One context for both resolutions: the bundled headless chromium runs in
 * single-process mode, where closing a context closes the browser. */
const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });

for (const [width, height] of [[1366, 768], [1440, 900]]) {
  const tag = `${width}x${height}`;
  const outDir = `${HERE}${tag}`;
  await mkdir(outDir, { recursive: true });

  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto(`${BASE}/lesson-1.html`, { waitUntil: 'networkidle' });

  // 1. the notebook is the ninth and last tab of the lesson stepper
  const navCount = await page.locator('#page-nav .page-nav-button').count();
  check(`${tag}: nav has 9 tabs`, navCount === 9, `count=${navCount}`);
  const lastLabel = (await page.locator('#page-nav .page-nav-button').last().innerText()).replace(/\s+/g, ' ').trim();
  check(`${tag}: last tab is the notebook`, lastLabel.includes('دفتر الطالب'), lastLabel);

  // 2. keyboard navigation still reaches it (PageDown, the lesson's own shortcut)
  for (let i = 0; i < 8; i += 1) await page.keyboard.press('PageDown');
  await page.waitForTimeout(300);
  const heading = (await page.locator('#page-heading').innerText()).trim();
  check(`${tag}: heading is دفتر الطالب`, heading === 'دفتر الطالب', heading);
  const progress = (await page.locator('#progress-text').innerText()).replace(/\s+/g, ' ').trim();
  check(`${tag}: progress is 9 / 9`, progress === '9 / 9', progress);
  const stageBadge = (await page.locator('#page-number').innerText()).trim();
  check(`${tag}: page badge still points at the book page`, stageBadge === '62', stageBadge);

  const notebookCount = await page.locator('#page-content .student-notebook').count();
  check(`${tag}: exactly one notebook rendered`, notebookCount === 1, `count=${notebookCount}`);

  // 3. the reference is complete: seventeen sections, twelve tables, ten figures
  const sections = await page.locator('.student-notebook-section').count();
  check(`${tag}: 17 notebook sections`, sections === 17, `count=${sections}`);
  const tables = await page.locator('.student-notebook-table').count();
  check(`${tag}: 12 reference tables`, tables === 12, `count=${tables}`);
  const figures = await page.locator('.student-notebook-figure').count();
  check(`${tag}: 10 diagrams and scale drawings`, figures === 10, `count=${figures}`);
  const captions = await page.locator('.student-notebook-table caption').count();
  check(`${tag}: every table is captioned`, captions === 12, `count=${captions}`);

  // 4. maths: KaTeX typeset everything and nothing is clipped
  const katex = await page.locator('.student-notebook .katex').count();
  const katexErrors = await page.locator('.student-notebook .katex-error').count();
  check(`${tag}: KaTeX typeset every formula`, katex > 100 && katexErrors === 0, `katex=${katex} errors=${katexErrors}`);
  const clipped = await page.evaluate(() => {
    const out = [];
    for (const box of document.querySelectorAll('.student-notebook-formula')) {
      if (box.scrollWidth > box.clientWidth + 1) out.push(`${box.scrollWidth}>${box.clientWidth}`);
    }
    return out;
  });
  check(`${tag}: no display equation is clipped`, clipped.length === 0, clipped.slice(0, 3).join(' '));

  // 5. containment: the page never scrolls sideways and no block escapes the sheet
  const geometry = await page.evaluate(() => {
    const nb = document.querySelector('.student-notebook');
    const offenders = [];
    for (const el of nb.querySelectorAll('.student-notebook-section > *')) {
      if (el.closest('.katex-mathml')) continue;
      const box = el.getBoundingClientRect();
      if (box.width > 0 && (box.right > window.innerWidth + 1 || box.left < -1)) {
        offenders.push(`${el.tagName}.${String(el.className).slice(0, 30)}`);
      }
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      height: document.documentElement.scrollHeight,
      sheet: Math.round(document.querySelector('.student-notebook-sheet').getBoundingClientRect().width),
      offenders,
    };
  });
  check(`${tag}: no horizontal page scroll`, geometry.scrollWidth <= geometry.innerWidth, `${geometry.scrollWidth} <= ${geometry.innerWidth}`);
  check(`${tag}: no section block escapes the sheet`, geometry.offenders.length === 0, geometry.offenders.slice(0, 4).join(' '));

  // 6. reading measure: running text stays inside the 40rem cap, tables may be wider
  const lineMeasure = await page.evaluate(() => {
    const widthOf = (selector) => Math.round(document.querySelector(selector).getBoundingClientRect().width);
    return {
      paragraph: widthOf('[aria-labelledby="nb-s10"] > p'),
      table: widthOf('[aria-labelledby="nb-s10"] .student-notebook-table'),
      rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
    };
  });
  check(`${tag}: notebook prose respects the reading measure`,
    lineMeasure.paragraph <= 40 * lineMeasure.rem + 2,
    `paragraph=${lineMeasure.paragraph}px cap=${40 * lineMeasure.rem}px`);
  check(`${tag}: tables use the full reference width`, lineMeasure.table > lineMeasure.paragraph,
    `table=${lineMeasure.table}px`);

  // 7. the table of contents resolves to real, reachable sections
  const toc = await page.evaluate(() => {
    const links = [...document.querySelectorAll('.student-notebook-toc a')];
    return {
      count: links.length,
      broken: links.filter((link) => !document.querySelector(link.getAttribute('href'))).map((link) => link.getAttribute('href')),
    };
  });
  check(`${tag}: 17 working contents links`, toc.count === 17 && toc.broken.length === 0,
    `count=${toc.count} broken=${toc.broken.join(',')}`);
  await page.locator('.student-notebook-toc a', { hasText: 'السطح المائل' }).first().click();
  await page.waitForFunction(() => {
    const box = document.querySelector('#nb-s10').getBoundingClientRect();
    return box.top > -8 && box.top < 260;
  }, null, { timeout: 4000 }).catch(() => {});
  const jumped = await page.evaluate(() => {
    const box = document.querySelector('#nb-s10').getBoundingClientRect();
    return Math.round(box.top);
  });
  check(`${tag}: a contents link scrolls to its section`, jumped >= -8 && jumped < 260, `top=${jumped}px`);

  // 8. bidi: every Latin token is LTR-isolated, every Arabic bdi is not
  const bidi = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.student-notebook bdi')];
    return {
      count: all.length,
      undirected: all.filter((b) => b.getAttribute('dir') !== 'ltr').length,
      arabic: all.filter((b) => /[\u0621-\u064A]/.test(b.textContent)).length,
    };
  });
  check(`${tag}: every bdi is dir=ltr`, bidi.undirected === 0, `undirected=${bidi.undirected}`);
  check(`${tag}: no Arabic prose is wrapped in an LTR isolation`, bidi.arabic === 0, `arabic=${bidi.arabic}`);

  // 9. navigation away and back keeps a single notebook (no duplication)
  await page.click('#previous-button');
  await page.waitForTimeout(200);
  await page.click('#next-button');
  await page.waitForTimeout(300);
  const afterReturn = await page.locator('#page-content .student-notebook').count();
  check(`${tag}: still one notebook after leaving and returning`, afterReturn === 1, `count=${afterReturn}`);

  check(`${tag}: no console or page errors`, errors.length === 0, errors.slice(0, 2).join(' | '));

  // 10. screenshots at this exact laptop resolution.
  /* The stepper scrolls with `behavior: 'smooth'`; an instant scroll issued
   * while that animation is still running is swallowed by it, so wait until
   * the scroll position stops changing before every capture. Disabling the
   * animation here also keeps the capture deterministic. */
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
  /* A 24 000px document exceeds the single-capture texture limit of headless
   * chromium, so the viewport is captured through CDP with
   * `captureBeyondViewport: false`; Playwright's own screenshot helper tries a
   * full-page capture first and returns blank bands on this page. */
  const cdp = await context.newCDPSession(page);
  const capture = async (file) => {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(file, Buffer.from(data, 'base64'));
  };
  const settle = async () => {
    await page.waitForFunction(() => {
      const y = Math.round(window.scrollY);
      const settled = window.__qaLastY === y;
      window.__qaLastY = y;
      return settled;
    }, null, { timeout: 4000, polling: 100 }).catch(() => {});
    await page.waitForTimeout(150);
  };
  await settle();
  for (const [id, name] of SHOTS) {
    await page.evaluate((anchor) => {
      const target = document.getElementById(anchor);
      const top = target.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    }, id);
    await settle();
    await capture(`${outDir}/${name}.png`);
  }
  console.log(`${tag}: document is ${geometry.height}px tall, sheet ${geometry.sheet}px wide`);

  await page.close();
}

await context.close();
await browser.close();

const passed = results.filter((row) => row.ok).length;
const lines = [
  `Lesson 1 student notebook — browser QA (${new Date().toISOString()})`,
  `Viewports: 1366x768 and 1440x900 (laptop scope).`,
  `Checks: ${passed}/${results.length} passed.`,
  '',
  ...results.map((row) => `${row.ok ? 'PASS' : 'FAIL'}  ${row.name}${row.extra ? `  —  ${row.extra}` : ''}`),
];
console.log(lines.join('\n'));
if (passed !== results.length) process.exitCode = 1;
