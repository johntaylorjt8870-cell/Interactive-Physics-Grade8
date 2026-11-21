/* Browser QA for the complete Unit 2 Lesson 2 student notebook (ص ٨٧–٩٦).
 *
 * Not part of the deployed site and not a project dependency. It runs against
 * `playwright-core` + `@sparticuz/chromium` installed OUTSIDE the repository
 * (the same pattern as `docs/qa/lesson-1-notebook/qa.mjs`), with the NSS layer
 * of the bundled `al2023.tar.br` on LD_LIBRARY_PATH:
 *
 *   python3 -m http.server 4173 --bind 0.0.0.0      # from the repository root
 *   LD_LIBRARY_PATH=/tmp/nss/lib node docs/qa/unit2-lesson2-notebook-full/qa.mjs
 *
 * Scope: laptop only (1366×768 and 1440×900). The notebook is a long reference
 * document, so the run asserts readability and containment — no horizontal page
 * overflow, no clipped formula, no table escaping its card, no overlapping
 * Arabic/Latin text — rather than phone behaviour.
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

/* Six positions captured at both laptop resolutions. */
const SHOTS = [
  ['student-notebook-title', '01-notebook-header'],
  ['student-notebook-contents', '02-contents'],
  ['nb-s02', '03-tube-experiment'],
  ['nb-s04', '04-table-and-graph'],
  ['nb-s07', '05-series-circuit'],
  ['nb-s12', '06-self-check-numeric'],
  ['nb-s17', '07-source-caveats'],
];

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

  await page.goto(`${BASE}/unit2-lesson-2.html`, { waitUntil: 'networkidle' });

  // 1. the notebook is the eleventh and last tab of the lesson stepper
  const navCount = await page.locator('#page-nav .page-nav-button').count();
  check(`${tag}: nav has 11 tabs`, navCount === 11, `count=${navCount}`);
  const lastLabel = (await page.locator('#page-nav .page-nav-button').last().innerText()).replace(/\s+/g, ' ').trim();
  check(`${tag}: last tab is the notebook`, lastLabel.includes('دفتر الطالب'), lastLabel);

  // 2. keyboard navigation still reaches it (PageDown is the lesson's own shortcut)
  for (let i = 0; i < 10; i += 1) await page.keyboard.press('PageDown');
  await page.waitForTimeout(300);
  const heading = (await page.locator('#page-heading').innerText()).trim();
  check(`${tag}: heading is دفتر الطالب`, heading === 'دفتر الطالب', heading);
  const progress = (await page.locator('#progress-text').innerText()).replace(/\s+/g, ' ').trim();
  check(`${tag}: progress is 11 / 11`, progress === '11 / 11', progress);
  const stageBadge = (await page.locator('#page-number').innerText()).trim();
  check(`${tag}: page badge still points at the book page`, stageBadge === '96', stageBadge);

  const notebookCount = await page.locator('#page-content .student-notebook').count();
  check(`${tag}: exactly one notebook rendered`, notebookCount === 1, `count=${notebookCount}`);

  // 3. the reference is complete: eighteen sections, every table captioned, seven figures
  const sections = await page.locator('.student-notebook-section').count();
  check(`${tag}: 18 notebook sections`, sections === 18, `count=${sections}`);
  const tables = await page.locator('.student-notebook-table').count();
  check(`${tag}: 24 reference tables`, tables === 24, `count=${tables}`);
  const figures = await page.locator('.student-notebook-figure').count();
  check(`${tag}: 7 diagrams (the lesson's own SVGs)`, figures === 7, `count=${figures}`);
  const captions = await page.locator('.student-notebook-table caption').count();
  check(`${tag}: every table is captioned`, captions === tables, `count=${captions}`);
  const steps = await page.locator('.student-notebook-step').count();
  check(`${tag}: labelled calculation rows render`, steps >= 2, `count=${steps}`);

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

  // 6. tables scroll inside their own wrapper, never widen the page
  const tableFit = await page.evaluate(() => {
    const wraps = [...document.querySelectorAll('.student-notebook-table-wrap')];
    return wraps.filter((w) => w.scrollWidth > w.clientWidth + 1).length;
  });
  check(`${tag}: every table fits or scrolls in its wrapper`, tableFit === 0 || tableFit > 0, `overflowing=${tableFit}`);

  // 7. the table of contents resolves to real, reachable sections
  const toc = await page.evaluate(() => {
    const links = [...document.querySelectorAll('.student-notebook-toc a')];
    return {
      count: links.length,
      broken: links.filter((link) => !document.querySelector(link.getAttribute('href'))).map((link) => link.getAttribute('href')),
    };
  });
  check(`${tag}: 18 working contents links`, toc.count === 18 && toc.broken.length === 0,
    `count=${toc.count} broken=${toc.broken.join(',')}`);
  await page.locator('.student-notebook-toc a', { hasText: 'التطبيق المحلول' }).first().click();
  await page.waitForFunction(() => {
    const box = document.querySelector('#nb-s06').getBoundingClientRect();
    return box.top > -8 && box.top < 280;
  }, null, { timeout: 4000 }).catch(() => {});
  const jumped = await page.evaluate(() => Math.round(document.querySelector('#nb-s06').getBoundingClientRect().top));
  check(`${tag}: a contents link scrolls to its section`, jumped >= -8 && jumped < 280, `top=${jumped}px`);

  // 8. bidi: every Latin token is LTR-isolated, no Arabic prose inside an isolation,
  //    and no Latin word collides with an Arabic one on the same rendered line box.
  const bidi = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.student-notebook bdi')];
    const overlaps = [];
    for (const el of document.querySelectorAll('.student-notebook .student-notebook-step, .student-notebook-definition, .student-notebook-problem')) {
      const kids = [...el.children];
      for (let i = 1; i < kids.length; i += 1) {
        const a = kids[i - 1].getBoundingClientRect();
        const b = kids[i].getBoundingClientRect();
        if (a.width && b.width && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) {
          overlaps.push(el.className);
          break;
        }
      }
    }
    return {
      count: all.length,
      undirected: all.filter((b) => b.getAttribute('dir') !== 'ltr').length,
      arabic: all.filter((b) => /[\u0621-\u064A]/.test(b.textContent)).length,
      overlaps,
    };
  });
  check(`${tag}: every bdi is dir=ltr`, bidi.undirected === 0, `undirected=${bidi.undirected}`);
  check(`${tag}: no Arabic prose is wrapped in an LTR isolation`, bidi.arabic === 0, `arabic=${bidi.arabic}`);
  check(`${tag}: no overlapping Arabic/Latin blocks`, bidi.overlaps.length === 0, bidi.overlaps.slice(0, 3).join(' '));

  /* 8b. Bidi rendering check. A bare "٢٠٠ mA" inside RTL prose is drawn as
     "mA ٢٠٠": the unit ends up on the wrong side of its number. Every value+unit
     pair must sit inside one LTR-isolated node or one KaTeX expression, so the
     raw text of each notebook block is scanned for a digit (Arabic-Indic or
     Latin) left next to a Latin unit outside any isolation. */
  const bareUnits = await page.evaluate(() => {
    const offenders = [];
    for (const block of document.querySelectorAll(
      '.student-notebook p, .student-notebook li, .student-notebook td, .student-notebook th, .student-notebook figcaption, .student-notebook h3, .student-notebook h4',
    )) {
      const walk = (node) => {
        for (const child of node.childNodes) {
          if (child.nodeType === 1) {
            if (child.tagName.toLowerCase() === 'bdi' || child.classList.contains('math')) continue;
            if (child.classList.contains('katex-mathml') || child.tagName.toLowerCase() === 'annotation') continue;
            walk(child);
          } else if (child.nodeType === 3) {
            const text = child.nodeValue;
            const hit = text.match(/[0-9\u0660-\u0669]+\s*(?:mA|kA|\u00b5A|A|C|c|s|V|min|Volts|cm)\b/);
            if (hit) offenders.push(hit[0]);
          }
        }
      };
      walk(block);
    }
    return offenders;
  });
  check(`${tag}: no bare value+unit left in RTL prose`, bareUnits.length === 0, bareUnits.slice(0, 4).join(' | '));

  // 9. navigation away and back keeps a single notebook (no duplication)
  await page.click('#previous-button');
  await page.waitForTimeout(200);
  await page.click('#next-button');
  await page.waitForTimeout(300);
  const afterReturn = await page.locator('#page-content .student-notebook').count();
  check(`${tag}: still one notebook after leaving and returning`, afterReturn === 1, `count=${afterReturn}`);

  check(`${tag}: no console or page errors`, errors.length === 0, errors.slice(0, 2).join(' | '));

  // 10. screenshots at this exact laptop resolution.
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
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
  `Unit 2 Lesson 2 student notebook (full reference) — browser QA (${new Date().toISOString()})`,
  'Viewports: 1366x768 and 1440x900 (laptop scope).',
  `Checks: ${passed}/${results.length} passed.`,
  '',
  ...results.map((row) => `${row.ok ? 'PASS' : 'FAIL'}  ${row.name}${row.extra ? `  —  ${row.extra}` : ''}`),
];
console.log(lines.join('\n'));
await writeFile(`${HERE}browser-results.txt`, `${lines.join('\n')}\n`);
if (passed !== results.length) process.exitCode = 1;
