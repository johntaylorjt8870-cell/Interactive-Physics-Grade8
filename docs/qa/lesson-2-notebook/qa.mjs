/* Browser QA for the Lesson 2 student notebook (الوحدة الأولى · الدرس الثاني).
 *
 * Not part of the deployed site and not a project dependency. It runs against
 * `playwright-core` + `@sparticuz/chromium` installed OUTSIDE the repository
 * (the same pattern as `scripts/qa-unit2-lesson4.mjs`), with the NSS layer of
 * the bundled `al2023.tar.br` on LD_LIBRARY_PATH:
 *
 *   python3 -m http.server 4173 --bind 0.0.0.0      # from the repository root
 *   LD_LIBRARY_PATH=/tmp/nss/lib node docs/qa/lesson-2-notebook/qa.mjs
 *
 * The archived run is `browser-results.txt` next to this file.
 */
import { chromium as pw } from 'playwright-core';
import chromium from '@sparticuz/chromium';

const BASE = 'http://127.0.0.1:4173';
const browser = await pw.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args,
  headless: true,
  timeout: 60000,
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

const results = [];
const check = (name, ok, extra = '') => results.push({ name, ok, extra });

for (const [w, h, tag] of [[1440, 900, '1440'], [1366, 768, '1366'], [390, 844, '390']]) {
  const page = await context.newPage();
  await page.setViewportSize({ width: w, height: h });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  await page.goto(`${BASE}/lesson-2.html`, { waitUntil: 'networkidle' });

  const navCount = await page.locator('#page-nav .page-nav-button').count();
  check(`${tag}: nav has 9 tabs`, navCount === 9, `count=${navCount}`);
  const lastLabel = (await page.locator('#page-nav .page-nav-button').last().innerText()).replace(/\s+/g, ' ').trim();
  check(`${tag}: last tab is the notebook`, lastLabel.includes('دفتر الطالب'), lastLabel);

  // walk to the final stage with the next button
  for (let i = 0; i < 8; i += 1) await page.click('#next-button');
  await page.waitForTimeout(250);

  const heading = (await page.locator('#page-heading').innerText()).trim();
  check(`${tag}: heading is دفتر الطالب`, heading === 'دفتر الطالب', heading);
  const nbCount = await page.locator('#page-content .student-notebook').count();
  check(`${tag}: exactly one notebook rendered`, nbCount === 1, `count=${nbCount}`);
  const progress = (await page.locator('#progress-text').innerText()).trim();
  check(`${tag}: progress is 9 / 9`, progress.replace(/\s+/g, ' ') === '9 / 9', progress);
  const nextDisabled = await page.locator('#next-button').isDisabled();
  check(`${tag}: next is disabled on the final stage`, nextDisabled === true);
  const prevEnabled = !(await page.locator('#previous-button').isDisabled());
  check(`${tag}: previous is enabled on the final stage`, prevEnabled);
  const active = (await page.locator('#page-nav [aria-current="step"]').innerText()).replace(/\s+/g, ' ').trim();
  check(`${tag}: last nav tab is current`, active.includes('دفتر الطالب'), active);

  const sections = await page.locator('#page-content .student-notebook-section').count();
  check(`${tag}: 14 notebook sections`, sections === 14, `count=${sections}`);

  const katexErrors = await page.locator('.katex-error').count();
  check(`${tag}: no katex errors`, katexErrors === 0, `count=${katexErrors}`);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${tag}: no horizontal page overflow`, overflow <= 2, `delta=${overflow}`);

  // every equation inside the notebook is horizontally readable (scrollable, not clipped)
  const clipped = await page.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll('#page-content .student-notebook .katex-display')) {
      const box = el.closest('.student-notebook-formula, .student-notebook-step > div, .student-notebook-section');
      if (!box) continue;
      const style = getComputedStyle(box);
      if (el.scrollWidth > box.clientWidth + 1 && !['auto', 'scroll'].includes(style.overflowX)) {
        bad.push(box.className + ':' + el.scrollWidth + '>' + box.clientWidth);
      }
    }
    return bad.slice(0, 5);
  });
  check(`${tag}: wide equations stay scrollable, never clipped`, clipped.length === 0, clipped.join(' | '));

  // every rendered equation is one line (no TeX line breaks rendered as rows)
  const emptyRuns = await page.evaluate(() => document.querySelectorAll('.katex .katex-newline').length);
  check(`${tag}: no forced line breaks inside equations`, emptyRuns === 0, `count=${emptyRuns}`);


  // go back: previous returns to page 70 and next returns to the notebook
  await page.click('#previous-button');
  await page.waitForTimeout(150);
  const backHeading = (await page.locator('#page-heading').innerText()).trim();
  check(`${tag}: previous returns to the p70 stage`, backHeading === 'أختبر نفسي', backHeading);
  check(`${tag}: notebook leaves the DOM when navigating back`, (await page.locator('.student-notebook').count()) === 0);
  await page.click('#next-button');
  await page.waitForTimeout(150);
  check(`${tag}: next returns to the notebook`, (await page.locator('#page-content .student-notebook').count()) === 1);

  // keyboard: PageUp leaves the notebook, PageDown comes back
  await page.keyboard.press('PageUp');
  await page.waitForTimeout(150);
  check(`${tag}: PageUp leaves the notebook`, (await page.locator('.student-notebook').count()) === 0);
  await page.keyboard.press('PageDown');
  await page.waitForTimeout(150);
  check(`${tag}: PageDown returns to the notebook`, (await page.locator('.student-notebook').count()) === 1);

  check(`${tag}: no console/page errors`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await page.close();
}

// Lesson 1 is untouched: 9 tabs, notebook is stage 9 and page numbers unchanged
const l1 = await context.newPage();
const l1errors = [];
l1.on('pageerror', (e) => l1errors.push(e.message));
await l1.goto(`${BASE}/lesson-1.html`, { waitUntil: 'networkidle' });
check('lesson 1 still has 9 tabs', (await l1.locator('#page-nav .page-nav-button').count()) === 9);
for (let i = 0; i < 8; i += 1) await l1.click('#next-button');
await l1.waitForTimeout(200);
check('lesson 1 notebook is still its own final stage',
  (await l1.locator('#page-content .student-notebook').count()) === 1 &&
  !(await l1.locator('.l2-student-notebook').count()));
check('lesson 1 has no lesson-2 notebook content',
  (await l1.locator('#page-content').innerText()).includes('القوى المتوازية') === false);
check('lesson 1 loads without page errors', l1errors.length === 0, l1errors.join(' | '));
await l1.close();

// the notebook is not on any other page
for (const path of ['/index.html', '/lesson-1.html', '/lesson-2-appendix.html', '/lesson-2-teacher.html', '/lesson-2-test.html', '/appendices.html', '/physics-in-life-lesson-1.html', '/unit-questions.html', '/unit-1-test.html']) {
  const p = await context.newPage();
  await p.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  const lessonTwo = await p.locator('.l2-student-notebook, .student-notebook-step, .student-notebook-tags').count();
  const lessonOneNotebook = await p.locator('.student-notebook').count();
  const rendered = path === '/lesson-1.html' ? lessonTwo === 0 && lessonOneNotebook === 0 : lessonTwo === 0 && lessonOneNotebook === 0;
  check(`no notebook rendered on ${path}`, rendered, `l2=${lessonTwo} l1=${lessonOneNotebook}`);
  await p.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.extra ? '  → ' + r.extra : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
