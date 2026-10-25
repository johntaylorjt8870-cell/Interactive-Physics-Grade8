// Before/after invariance check for the Lesson 1 reading measure (`lesson-1.html`).
// It compares a baseline build with a changed build, on every stage and viewport,
// and fails (exit code 1) if anything outside the intended change moved:
//
//   - the markup and the text of the lesson are identical;
//   - every element inside an interactive region (simulations, inquiry cards,
//     self-check batches, the practice deck, problem workbenches) has the same
//     computed style, position and size;
//   - every other element that is not running text keeps its width and position;
//   - running text (paragraphs and list items outside the interactive regions) had
//     no `max-width` in the baseline and has the reading-measure cap in the change,
//     so no existing cap was overwritten;
//   - the left rail, top bar and the intended scroll containers are unchanged.
//
// Vertical positions and heights of ordinary containers are NOT compared: they
// legitimately move when the running text above them reflows.
//
//   QA_MODULE_DIR=/path/to/qa/node_modules CHROMIUM_PATH=/tmp/chromium \
//     QA_BASELINE_URL=http://127.0.0.1:4190 QA_AFTER_URL=http://127.0.0.1:4191 \
//     node scripts/qa-lesson-1-reading-invariance.mjs
//
// Build the two sides from git (no branch is needed):
//   git archive <base-commit> | tar -x -C /tmp/base && (cd /tmp/base && node scripts/build.mjs)
//   npm run build   # for the changed tree
// and serve each `dist/` on its own port. Results go to
// docs/qa/lesson-1-reading-measure/visual-invariance-check.json (override with QA_OUT).
import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(process.env.QA_MODULE_DIR ? resolve(process.env.QA_MODULE_DIR, 'qa-entry.cjs') : import.meta.url);
const puppeteer = require('puppeteer-core');
const executablePath = process.env.CHROMIUM_PATH || (await (await import(require.resolve('@sparticuz/chromium'))).default.executablePath());

const BASELINE = process.env.QA_BASELINE_URL;
const AFTER = process.env.QA_AFTER_URL;
if (!BASELINE || !AFTER) {
  console.error('QA_BASELINE_URL and QA_AFTER_URL are required.');
  process.exit(2);
}
const OUT = process.env.QA_OUT || resolve(here, '..', 'docs', 'qa', 'lesson-1-reading-measure', 'visual-invariance-check.json');
const CAP_PX = 640; // 40rem at the 16px root size; the changed build must give running text this cap
const VIEWPORTS = [[1366, 768], [1440, 900], [1920, 1080], [1024, 768], [820, 768], [390, 844]];
const EXCLUDED = '.simulation-experience, .inquiry-card, .l1-practice-deck, .problem-workbench, [data-self-check]';

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

/** Runs in the page: one row per element, plus the page-level facts. */
const snapshotInPage = (EXCLUDED) => {
  const rect = (el) => { const b = el.getBoundingClientRect(); return [b.left, b.top, b.width, b.height].map((v) => Math.round(v * 10) / 10); };
  const kindOf = (el) => {
    if (el.closest(EXCLUDED)) return 'interactive';
    if ((el.tagName === 'P' || el.tagName === 'LI') && el.closest('#page-content, .stage-hero-card')) return 'prose';
    // inline pieces inside running text (strong, bdi, KaTeX spans) move with the line wrap
    if (el.parentElement && el.parentElement.closest('p, li') && el.parentElement.closest('#page-content, .stage-hero-card')) return 'text-flow';
    return 'other';
  };
  const rows = [...document.querySelectorAll('body *')].map((el) => {
    const cs = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    return {
      kind: kindOf(el),
      tag: el.tagName,
      cls: String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className).slice(0, 80),
      left: Math.round(b.left * 100) / 100,
      width: Math.round(b.width * 100) / 100,
      height: Math.round(b.height * 100) / 100,
      maxWidth: cs.maxWidth,
      style: [cs.fontSize, cs.lineHeight, cs.padding, cs.margin, cs.display, cs.overflowX, cs.textAlign].join('|'),
    };
  });
  // intended scroll containers that hide overflow, as in the QA measure
  const clipped = [];
  for (const el of document.querySelectorAll('#page-content *')) {
    if (el.closest('.katex, svg')) continue;
    const cs = getComputedStyle(el);
    if (!/(hidden|clip)/.test(cs.overflowX) && cs.overflowX !== 'visible') continue;
    const excess = el.scrollWidth - el.clientWidth;
    if (excess > 1) clipped.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} +${excess}`);
  }
  const sidebar = document.querySelector('.lesson-sidebar');
  const header = document.querySelector('.topbar');
  return {
    markup: document.body.innerHTML,
    text: document.querySelector('#page-content').textContent.replace(/\s+/g, ' ').trim(),
    rows,
    clipped: clipped.sort(),
    sidebar: sidebar ? rect(sidebar) : null,
    header: header ? rect(header) : null,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
};

async function snapshots(base, width, height) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`${base}/lesson-1.html`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const out = [];
  for (let i = 0; i < 8; i += 1) {
    await page.evaluate((k) => document.querySelectorAll('.page-nav-button')[k].click(), i);
    await new Promise((r) => setTimeout(r, 250));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 100));
    out.push(await page.evaluate(snapshotInPage, EXCLUDED));
  }
  await page.close();
  return out;
}

const sha = (s) => createHash('sha1').update(s).digest('hex');
const diffs = [];
const summary = {};

for (const [width, height] of VIEWPORTS) {
  const key = `${width}x${height}`;
  const base = await snapshots(BASELINE, width, height);
  const after = await snapshots(AFTER, width, height);
  const counts = { stages: 8, interactiveElements: 0, interactiveText: 0, proseElements: 0, proseCapped: 0, textFlowElements: 0, otherElements: 0, markupSame: 0, textSame: 0, clippedSame: 0 };

  for (let i = 0; i < 8; i += 1) {
    const tag = `${key} stage ${i + 1}`;
    const a = base[i], b = after[i];
    const fail = (check, detail) => diffs.push({ where: tag, check, detail });

    if (sha(a.markup) === sha(b.markup)) counts.markupSame += 1; else fail('markup', 'the HTML of the lesson changed');
    if (a.text === b.text) counts.textSame += 1; else fail('text', 'the lesson text changed');
    if (a.overflowX !== 0 || b.overflowX !== 0) fail('horizontal-overflow', { baseline: a.overflowX, after: b.overflowX });
    if (JSON.stringify(a.clipped) === JSON.stringify(b.clipped)) counts.clippedSame += 1;
    else fail('clipped-containers', { baseline: a.clipped, after: b.clipped });
    if (JSON.stringify(a.sidebar) !== JSON.stringify(b.sidebar)) fail('sidebar', { baseline: a.sidebar, after: b.sidebar });
    if (JSON.stringify(a.header) !== JSON.stringify(b.header)) fail('header', { baseline: a.header, after: b.header });
    if (a.rows.length !== b.rows.length) { fail('element-count', { baseline: a.rows.length, after: b.rows.length }); continue; }

    a.rows.forEach((ra, k) => {
      const rb = b.rows[k];
      const where = `${tag} <${ra.tag.toLowerCase()}.${ra.cls.split(' ')[0]}>`;
      if (ra.kind === 'interactive') {
        counts.interactiveElements += 1;
        if ((ra.tag === 'P' || ra.tag === 'LI') && rb.width > 0) counts.interactiveText += 1; // visible running text inside an interactive zone (kept at its previous width)
        if (ra.maxWidth !== rb.maxWidth || ra.left !== rb.left || ra.width !== rb.width || ra.height !== rb.height || ra.style !== rb.style) {
          fail('interactive-region', { where, baseline: [ra.maxWidth, ra.left, ra.width, ra.height, ra.style], after: [rb.maxWidth, rb.left, rb.width, rb.height, rb.style] });
        }
      } else if (ra.kind === 'prose') {
        counts.proseElements += 1;
        // running text must have had no cap before, and must have the reading-measure cap now
        if (ra.maxWidth !== 'none') fail('existing-cap', { where, baseline: ra.maxWidth });
        if (rb.maxWidth === `${CAP_PX}px`) counts.proseCapped += 1;
        else fail('prose-cap', { where, after: rb.maxWidth });
      } else if (ra.kind === 'text-flow') {
        // same style as before; position follows the line wrap, so it is not compared
        counts.textFlowElements += 1;
        if (ra.style !== rb.style || ra.maxWidth !== rb.maxWidth) {
          fail('text-flow-style', { where, baseline: [ra.maxWidth, ra.style], after: [rb.maxWidth, rb.style] });
        }
      } else {
        counts.otherElements += 1;
        if (ra.maxWidth !== rb.maxWidth || ra.left !== rb.left || ra.width !== rb.width) {
          fail('other-element', { where, baseline: [ra.maxWidth, ra.left, ra.width], after: [rb.maxWidth, rb.left, rb.width] });
        }
      }
    });
  }
  summary[key] = counts;
}

const passed = diffs.length === 0;
await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify({ baseline: BASELINE, after: AFTER, date: new Date().toISOString(), capPx: CAP_PX, passed, differences: diffs.length, summary, diffs: diffs.slice(0, 200) }, null, 2));
await browser.close();

console.log(`RESULT ${passed ? 'PASS' : 'FAIL'}: ${diffs.length} difference(s) over ${VIEWPORTS.length} viewports x 8 stages. Results: ${OUT}`);
for (const [key, c] of Object.entries(summary)) {
  console.log(`${key}: markup ${c.markupSame}/8, text ${c.textSame}/8, clipped ${c.clippedSame}/8, interactive elements ${c.interactiveElements} (visible text blocks ${c.interactiveText}), prose ${c.proseElements} (capped ${c.proseCapped}), inline text ${c.textFlowElements}, other ${c.otherElements}`);
}
for (const d of diffs.slice(0, 20)) console.log(`  DIFF ${d.where} ${d.check} ${JSON.stringify(d.detail)}`);
process.exitCode = passed ? 0 : 1;
