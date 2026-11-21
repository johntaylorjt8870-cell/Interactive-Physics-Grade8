/* Browser QA for the complete Unit 2 Lesson 3 student notebook (ص 97–106).
 *
 * Not part of the deployed site and not a project dependency. Runs against
 * `playwright-core` + `@sparticuz/chromium` installed OUTSIDE the repository
 * (e.g. /tmp/qaenv) with NSS libraries from al2023.tar.br on LD_LIBRARY_PATH:
 *
 *   python3 -m http.server 4173 --bind 0.0.0.0      # from repo root
 *   LD_LIBRARY_PATH=/tmp/nss/lib NODE_PATH=/tmp/qaenv/node_modules \
 *     node docs/qa/unit2-lesson3-notebook-full/qa.mjs
 *
 * Scope: laptop only (1366×768 and 1440×900). No mobile or tablet audit.
 */
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium: pw } = require('/tmp/qaenv/node_modules/playwright-core');
const { default: chromium } = await import('/tmp/qaenv/node_modules/@sparticuz/chromium/build/esm/index.js').catch(async () => {
  const mod = await import('/tmp/qaenv/node_modules/@sparticuz/chromium/build/index.js');
  return mod;
});

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

/* Key positions captured at both laptop resolutions (1366×768 and 1440×900). */
const SHOTS = [
  ['u2l3-notebook-title', '01-notebook-header'],
  ['u2l3-notebook-contents', '02-contents'],
  ['nb3-s02', '03-water-and-charge'],
  ['nb3-s04', '04-active-dipole-emf'],
  ['nb3-s06', '05-series-worked'],
  ['nb3-s08', '06-transformer-safety'],
  ['nb3-s11', '07-self-check-p105'],
  ['nb3-s17', '08-source-caveats'],
];

const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });

for (const [width, height] of [[1366, 768], [1440, 900]]) {
  const tag = `${width}x${height}`;
  const outDir = `${HERE}${tag}`;
  await mkdir(outDir, { recursive: true });

  const page = await context.newPage();
  await page.setViewportSize({ width, height });
  const errors = [];
  const failedRequests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('response', (res) => { if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url()}`); });

  await page.goto(`${BASE}/unit2-lesson-3.html`, { waitUntil: 'networkidle' });

  // 1. the notebook is the eleventh and last tab of the lesson stepper
  const navCount = await page.locator('#page-nav .page-nav-button').count();
  check(`${tag}: nav has 11 tabs`, navCount === 11, `count=${navCount}`);
  const lastLabel = (await page.locator('#page-nav .page-nav-button').last().innerText()).replace(/\s+/g, ' ').trim();
  check(`${tag}: last tab is the notebook`, lastLabel.includes('دفتر الطالب'), lastLabel);

  // 2. keyboard navigation reaches step 11 (PageDown × 10)
  for (let i = 0; i < 10; i += 1) await page.keyboard.press('PageDown');
  await page.waitForTimeout(300);
  const heading = (await page.locator('#page-heading').innerText()).trim();
  check(`${tag}: heading is دفتر الطالب: فرق الكمون الكهربائي`, heading.includes('دفتر الطالب'), heading);
  const progress = (await page.locator('#progress-text').innerText()).replace(/\s+/g, ' ').trim();
  check(`${tag}: progress is 11 / 11`, progress === '11 / 11', progress);
  const stageBadge = (await page.locator('#page-number').innerText()).trim();
  check(`${tag}: page badge references final book page 106`, stageBadge === '106', stageBadge);

  const notebookCount = await page.locator('#page-content .student-notebook').count();
  check(`${tag}: exactly one notebook rendered`, notebookCount === 1, `count=${notebookCount}`);

  // 3. complete reference: 18 sections, 14 captioned tables, 9 visible SVG diagrams
  const sections = await page.locator('.student-notebook-section').count();
  check(`${tag}: 18 notebook sections`, sections === 18, `count=${sections}`);
  const tables = await page.locator('.student-notebook-table').count();
  check(`${tag}: 14 reference tables`, tables === 14, `count=${tables}`);
  const captions = await page.locator('.student-notebook-table caption').count();
  check(`${tag}: every table is captioned`, captions === tables, `count=${captions}`);

  const svgCheck = await page.evaluate(() => {
    const figs = [...document.querySelectorAll('.student-notebook-figure')];
    const broken = figs.filter((fig) => {
      const svg = fig.querySelector('svg');
      if (!svg) return true;
      const box = svg.getBoundingClientRect();
      return box.width < 100 || box.height < 50;
    });
    return { total: figs.length, broken: broken.length };
  });
  check(`${tag}: 9 visible SVG diagrams from UNIT2L3_DIAGRAMS`, svgCheck.total === 9 && svgCheck.broken === 0,
    `total=${svgCheck.total} broken=${svgCheck.broken}`);

  // 4. KaTeX maths: every equation rendered cleanly, zero errors, zero clipping
  const katex = await page.locator('.student-notebook .katex').count();
  const katexErrors = await page.locator('.student-notebook .katex-error').count();
  check(`${tag}: KaTeX typeset every formula with zero errors`, katex >= 100 && katexErrors === 0,
    `katex=${katex} errors=${katexErrors}`);
  const clipped = await page.evaluate(() => {
    const out = [];
    for (const box of document.querySelectorAll('.student-notebook-formula')) {
      if (box.scrollWidth > box.clientWidth + 1) out.push(`${box.scrollWidth}>${box.clientWidth}`);
    }
    return out;
  });
  check(`${tag}: no display equation is clipped`, clipped.length === 0, clipped.slice(0, 3).join(' '));

  // 5. containment: no horizontal page overflow, no block escapes sheet
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
  check(`${tag}: no horizontal page scroll`, geometry.scrollWidth <= geometry.innerWidth,
    `${geometry.scrollWidth} <= ${geometry.innerWidth}`);
  check(`${tag}: no section block escapes the sheet`, geometry.offenders.length === 0,
    geometry.offenders.slice(0, 4).join(' '));

  // 6. strict table wrapper & scroll contract (non-tautological, checked per table)
  const tableFit = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.student-notebook-table')];
    const wraps = [...document.querySelectorAll('.student-notebook-table-wrap')];
    const sheet = document.querySelector('.student-notebook-sheet');
    const problems = [];
    let fits = 0;
    let scrolls = 0;
    for (const [index, table] of all.entries()) {
      const label = `#${index + 1}`;
      const wrap = table.parentElement;
      const caption = (table.querySelector('caption')?.textContent ?? '').trim().slice(0, 28);
      if (!wrap || !wrap.classList.contains('student-notebook-table-wrap')) {
        problems.push(`${label} not wrapped (${caption})`);
        continue;
      }
      if (wrap.querySelectorAll('.student-notebook-table').length !== 1) problems.push(`${label} shares its wrapper`);
      if (!sheet || !sheet.contains(wrap) || wrap.closest('td, th')) problems.push(`${label} wrapper misplaced`);
      const wrapBox = wrap.getBoundingClientRect();
      const sheetBox = sheet.getBoundingClientRect();
      if (wrapBox.width > sheetBox.width + 1) problems.push(`${label} wrapper wider than sheet`);
      if (wrapBox.right > window.innerWidth + 1) problems.push(`${label} wrapper past viewport`);
      const overflowX = getComputedStyle(wrap).overflowX;
      const scrollable = overflowX === 'auto' || overflowX === 'scroll';
      if (!scrollable) problems.push(`${label} wrapper not scrollable (${overflowX})`);
      if (wrap.scrollWidth > wrap.clientWidth + 1) {
        if (wrap.scrollWidth < table.scrollWidth - 1) problems.push(`${label} clipped`);
        scrolls += 1;
      } else {
        if (table.scrollWidth > wrap.clientWidth + 1) problems.push(`${label} wider than wrapper`);
        fits += 1;
      }
    }
    for (const [index, wrap] of wraps.entries()) {
      if (!wrap.querySelector('.student-notebook-table')) problems.push(`wrap #${index + 1} empty`);
    }
    const bare = [...document.querySelectorAll('.student-notebook table')]
      .filter((t) => !t.classList.contains('student-notebook-table'));
    return {
      tables: all.length,
      wraps: wraps.length,
      bare: bare.length,
      fits,
      scrolls,
      problems,
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  check(`${tag}: every table sits in its own wrapper`,
    tableFit.tables === tableFit.wraps && tableFit.tables === 14 && tableFit.bare === 0 && tableFit.problems.length === 0,
    `tables=${tableFit.tables} wraps=${tableFit.wraps} unclassified=${tableFit.bare} ${tableFit.problems.slice(0, 3).join(' | ')}`);
  check(`${tag}: every table fits or scrolls inside a scrollable wrapper`,
    tableFit.problems.length === 0 && tableFit.fits + tableFit.scrolls === tableFit.tables,
    `fits=${tableFit.fits} scrolls=${tableFit.scrolls}`);
  check(`${tag}: no table widens the page`, tableFit.pageOverflow <= 0, `overflow=${tableFit.pageOverflow}px`);

  // 7. TOC: 18 working anchor links and real jump scroll to #nb3-s04 (EMF)
  const toc = await page.evaluate(() => {
    const links = [...document.querySelectorAll('.student-notebook-toc a')];
    return {
      count: links.length,
      broken: links.filter((link) => !document.querySelector(link.getAttribute('href'))).map((link) => link.getAttribute('href')),
    };
  });
  check(`${tag}: 18 working TOC links`, toc.count === 18 && toc.broken.length === 0,
    `count=${toc.count} broken=${toc.broken.join(',')}`);
  await page.locator('.student-notebook-toc a', { hasText: 'القوة المحركة الكهربائية' }).first().click();
  await page.waitForFunction(() => {
    const box = document.querySelector('#nb3-s04').getBoundingClientRect();
    return box.top > -12 && box.top < 320;
  }, null, { timeout: 4000 }).catch(() => {});
  const jumped = await page.evaluate(() => Math.round(document.querySelector('#nb3-s04').getBoundingClientRect().top));
  check(`${tag}: TOC link jumps to #nb3-s04 (القوة المحركة الكهربائية)`, jumped >= -12 && jumped < 320, `top=${jumped}px`);

  // 8. bidi & RTL/LTR checks
  const bidi = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.student-notebook bdi')];
    const overlaps = [];
    for (const el of document.querySelectorAll('.student-notebook .student-notebook-step, .student-notebook-definition, .student-notebook-problem, .student-notebook-qa')) {
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
  check(`${tag}: every bdi is dir=ltr`, bidi.undirected === 0 && bidi.count >= 100,
    `count=${bidi.count} undirected=${bidi.undirected}`);
  check(`${tag}: no Arabic prose inside LTR bdi`, bidi.arabic === 0, `arabic=${bidi.arabic}`);
  check(`${tag}: no overlapping sibling blocks`, bidi.overlaps.length === 0, bidi.overlaps.slice(0, 3).join(' '));

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
            const hit = child.nodeValue.match(/[0-9\u0660-\u0669]+\s*(?:mV|kV|V|v|kv|mA|kA|A|C|J|Ω)\b/);
            if (hit) offenders.push(hit[0]);
          }
        }
      };
      walk(block);
    }
    return offenders;
  });
  check(`${tag}: no bare value+unit in RTL prose`, bareUnits.length === 0, bareUnits.slice(0, 4).join(' | '));

  // 9. navigating away and back keeps one notebook
  await page.click('#previous-button');
  await page.waitForTimeout(200);
  await page.click('#next-button');
  await page.waitForTimeout(300);
  const afterReturn = await page.locator('#page-content .student-notebook').count();
  check(`${tag}: still one notebook after leaving and returning`, afterReturn === 1, `count=${afterReturn}`);

  check(`${tag}: zero console or page errors`, errors.length === 0, errors.slice(0, 2).join(' | '));
  check(`${tag}: zero failed network requests`, failedRequests.length === 0, failedRequests.slice(0, 2).join(' | '));

  // 10. capture laptop screenshots
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
  `Unit 2 Lesson 3 student notebook (full reference) — browser QA (${new Date().toISOString()})`,
  'Viewports: 1366x768 and 1440x900 (laptop scope only).',
  `Checks: ${passed}/${results.length} passed.`,
  '',
  ...results.map((row) => `${row.ok ? 'PASS' : 'FAIL'}  ${row.name}${row.extra ? `  —  ${row.extra}` : ''}`),
];
console.log(lines.join('\n'));
await writeFile(`${HERE}browser-results.txt`, `${lines.join('\n')}\n`);
if (passed !== results.length) process.exitCode = 1;
