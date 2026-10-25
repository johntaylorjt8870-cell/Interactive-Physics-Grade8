// Reading-measure QA for the Lesson 1 prose (`lesson-1.html`). It measures the
// rendered line length of running text and checks horizontal overflow, text that
// is clipped by its own box, and boxes outside the lesson column, on each stage.
//
// This script is a GATE: it exits with code 1 when any check fails, so it can be
// run before and after a change. The limit is read from the live `--l1-reading-measure`
// variable (falling back to 40rem, the value this change specifies, when the
// variable is absent, e.g. on the pre-fix build). Interactive regions are not part
// of the prose measure: the same exclusion list is used here and in `src/lesson-1.css`.
//
//   npm run build
//   python3 -m http.server 4176 --bind 0.0.0.0 --directory dist
//   QA_MODULE_DIR=/path/to/qa/node_modules CHROMIUM_PATH=/tmp/chromium \
//     QA_BASE_URL=http://127.0.0.1:4176 QA_PHASE=after node scripts/qa-lesson-1-reading-measure.mjs
//
// `QA_MODULE_DIR` must hold `puppeteer-core` and `@sparticuz/chromium`; nothing is
// added to this repository's package.json. Results are written to
// docs/qa/lesson-1-reading-measure/browser-results-<phase>.json (override with QA_OUT).
// Clipping of intended scroll containers (equations, self-check options) is recorded
// as `clipped` for information; it is compared with the baseline by
// scripts/qa-lesson-1-reading-invariance.mjs, not gated here.
import { writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(process.env.QA_MODULE_DIR ? resolve(process.env.QA_MODULE_DIR, 'qa-entry.cjs') : import.meta.url);
const puppeteer = require('puppeteer-core');
const chromium = { executablePath: async () => process.env.CHROMIUM_PATH || (await (await import(require.resolve('@sparticuz/chromium'))).default.executablePath()) };

const BASE = process.env.QA_BASE_URL || process.env.BASE || 'http://127.0.0.1:4173';
const PHASE = process.env.QA_PHASE || process.env.PHASE || 'after';
const OUT = process.env.QA_OUT || resolve(here, '..', 'docs', 'qa', 'lesson-1-reading-measure', `browser-results-${PHASE}.json`);
await mkdir(dirname(OUT), { recursive: true });
const VIEWPORTS = (process.env.VIEWPORTS || '1366x768,1440x900,1920x1080,1024x768,820x768,390x844')
  .split(',').map((s) => { const [w, h] = s.split('x').map(Number); return { width: w, height: h }; });

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

// Runs inside the page: measures real rendered text lines.
const pageProbe = () => {
  const root = document.querySelector('#page-content');
  const main = document.querySelector('.lesson-main');
  const r = (el) => el.getBoundingClientRect();

  // Actual line boxes of every text node inside a text block (excludes KaTeX/SVG).
  const TEXT_BLOCKS = 'p, li, h3, h4, h5, .stage-summary, .stage-objectives li, .source-list li';
  const lineWidths = [];
  const proseLineWidths = [];
  const perSelector = {};
  const blocks = [...root.querySelectorAll(TEXT_BLOCKS)].filter((el) => !el.closest('.katex, svg, .equation, table, .comparison-table-wrap'));
  for (const block of blocks) {
    const sel = block.tagName.toLowerCase() + (block.closest('.platform-body') ? '@platform' : block.closest('.book-copy') ? '@book' : block.closest('.stage-hero-card') ? '@hero' : '');
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const byLine = new Map();
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      if (node.parentElement.closest('.katex, svg, .equation')) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.width < 1) continue;
        const key = Math.round(rect.top / 4);
        const cur = byLine.get(key) || { left: Infinity, right: -Infinity };
        cur.left = Math.min(cur.left, rect.left);
        cur.right = Math.max(cur.right, rect.right);
        byLine.set(key, cur);
      }
    }
    const excluded = !!block.closest('.simulation-experience, .inquiry-card, .l1-practice-deck, .problem-workbench, [data-self-check]');
    for (const line of byLine.values()) {
      const w = line.right - line.left;
      lineWidths.push(w);
      if (!excluded) proseLineWidths.push(w);
      const s = perSelector[sel] || (perSelector[sel] = { lines: 0, max: 0, sum: 0 });
      s.lines += 1; s.max = Math.max(s.max, w); s.sum += w;
    }
  }
  const cplSamples = [];
  for (const block of blocks) {
    if (block.closest('.simulation-experience, .inquiry-card, .l1-practice-deck, .problem-workbench, [data-self-check]')) continue;
    const lh = parseFloat(getComputedStyle(block).lineHeight);
    if (!lh) continue;
    const lines = Math.round(block.getBoundingClientRect().height / lh);
    if (lines >= 2) cplSamples.push(block.textContent.replace(/\s+/g, ' ').trim().length / lines);
  }
  cplSamples.sort((a, b) => a - b);
  const cplPick = (p) => cplSamples.length ? Math.round(cplSamples[Math.min(cplSamples.length - 1, Math.floor(p * cplSamples.length))]) : 0;
  lineWidths.sort((a, b) => a - b);
  const pick = (p) => lineWidths.length ? Math.round(lineWidths[Math.min(lineWidths.length - 1, Math.floor(p * lineWidths.length))]) : 0;

  // Horizontal overflow of the document and of the lesson column.
  const docOverflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  const mainBox = r(main);
  const offenders = [];
  for (const el of main.querySelectorAll('*')) {
    if (el.closest('.katex, svg')) continue;
    const b = r(el);
    if (!b.width) continue;
    if (b.right > mainBox.right + 0.5 || b.left < mainBox.left - 0.5) {
      offenders.push({ tag: el.tagName.toLowerCase(), cls: String(el.className.baseVal ?? el.className).slice(0, 60), left: Math.round(b.left), right: Math.round(b.right) });
      if (offenders.length > 20) break;
    }
  }
  // Clipped content: scroll containers whose content is wider than the box (not intended scrollers).
  const clipped = [];
  for (const el of root.querySelectorAll('*')) {
    if (el.closest('.katex, svg')) continue;
    const cs = getComputedStyle(el);
    if (!/(hidden|clip)/.test(cs.overflowX) && cs.overflowX !== 'visible') continue;
    if (el.scrollWidth - el.clientWidth > 1) clipped.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 60), sw: el.scrollWidth, cw: el.clientWidth });
  }
  // Text elements whose text overflows their own box (clipped by overflow hidden/ellipsis excluded).
  const textClipped = [];
  for (const el of root.querySelectorAll(TEXT_BLOCKS + ', button, strong, small, span')) {
    if (el.closest('.katex, svg')) continue;
    if (el.children.length === 0 && el.scrollWidth - el.clientWidth > 1 && getComputedStyle(el).textOverflow !== 'ellipsis') {
      textClipped.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 40), text: el.textContent.trim().slice(0, 40) });
      if (textClipped.length > 20) break;
    }
  }

  const measureVar = getComputedStyle(document.querySelector('.l1-page') || document.documentElement).getPropertyValue('--l1-reading-measure').trim();
  return {
    measureVar,
    rootPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
    mainWidth: Math.round(mainBox.width),
    mainLeft: Math.round(mainBox.left),
    pageContentWidth: Math.round(r(root).width),
    cpl: { blocks: cplSamples.length, median: cplPick(0.5), p90: cplPick(0.9), max: cplPick(0.9999) },
    prose: { lines: proseLineWidths.length, max: Math.round(Math.max(0, ...proseLineWidths)), p90: Math.round([...proseLineWidths].sort((a, b) => a - b)[Math.floor(0.9 * (proseLineWidths.length - 1))] ?? 0) },
    lines: { count: lineWidths.length, min: pick(0), median: pick(0.5), p90: pick(0.9), max: pick(0.9999) },
    perSelector: Object.fromEntries(Object.entries(perSelector).map(([k, v]) => [k, { lines: v.lines, avg: Math.round(v.sum / v.lines), max: Math.round(v.max) }])),
    docOverflowX,
    offenders,
    clipped,
    textClipped,
  };
};

const SPEC_REM = 40;       // the reading measure this change specifies (used only if the variable is absent)
const TOLERANCE_PX = 1;    // sub-pixel rounding of line boxes

/** Converts the computed variable (e.g. "40rem" or "640px") to CSS pixels. */
function toPx(value, rootPx) {
  const n = parseFloat(value);
  if (value.endsWith('rem')) return n * rootPx;
  if (value.endsWith('px')) return n;
  return null;
}

/** Every failed check, with the measured value and the limit it broke. Empty means pass. */
function judge(data) {
  const failures = [];
  for (const [viewport, stages] of Object.entries(data.viewports)) {
    for (const s of stages) {
      const where = { viewport, stage: s.stage };
      const rootPx = s.rootPx || 16;
      const measure = toPx(s.measureVar, rootPx) ?? SPEC_REM * rootPx;
      const limit = measure + TOLERANCE_PX;
      if (s.prose.lines === 0) failures.push({ ...where, check: 'prose-measured', detail: 'no running-text line was measured, so the check would be vacuous' });
      if (s.prose.max > limit) failures.push({ ...where, check: 'reading-measure', value: s.prose.max, limit: Math.round(limit) });
      if (s.docOverflowX > 0) failures.push({ ...where, check: 'horizontal-overflow', value: s.docOverflowX, limit: 0 });
      if (s.offenders.length > 0) failures.push({ ...where, check: 'outside-column', value: s.offenders.length, limit: 0 });
      if (s.textClipped.length > 0) failures.push({ ...where, check: 'text-clipped', value: s.textClipped.length, limit: 0 });
    }
  }
  return failures;
}

const results = { phase: PHASE, base: BASE, date: new Date().toISOString(), viewports: {} };
for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ ...vp, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/lesson-1.html`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const stages = [];
  for (let i = 0; i < 8; i += 1) {
    await page.evaluate((index) => document.querySelectorAll('.page-nav-button')[index].click(), i);
    await new Promise((res) => setTimeout(res, 250));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((res) => setTimeout(res, 100));
    const data = await page.evaluate(pageProbe);
    stages.push({ stage: i + 1, ...data });
  }
  results.viewports[`${vp.width}x${vp.height}`] = stages;
  await page.close();
}
await browser.close();
const failures = judge(results);
results.failures = failures;
results.passed = failures.length === 0;
await writeFile(OUT, JSON.stringify(results, null, 2));

// Human-readable summary
for (const [name, stages] of Object.entries(results.viewports)) {
  console.log(`\n== ${name}`);
  console.log('prose max line per stage (outside interactive zones): ' + stages.map((s) => s.prose.max).join(' '));
  console.log('cpl(multi-line blocks) per stage: ' + stages.map((s) => s.cpl.median + '/' + s.cpl.p90).join('  '));
  console.log('stage | main | content | lines(n) min med p90 max | docOverflowX | offenders | clipped | textClipped');
  for (const s of stages) {
    console.log(`  ${s.stage}   | ${s.mainWidth} | ${s.pageContentWidth} | ${s.lines.count} ${s.lines.min} ${s.lines.median} ${s.lines.p90} ${s.lines.max} | ${s.docOverflowX} | ${s.offenders.length} | ${s.clipped.length} | ${s.textClipped.length}`);
  }
}

console.log(`\nRESULT ${results.passed ? 'PASS' : 'FAIL'}: ${failures.length} failed check(s). Results: ${OUT}`);
for (const f of failures.slice(0, 30)) console.log(`  FAIL ${f.viewport} stage ${f.stage} ${f.check}: value ${f.value ?? f.detail} limit ${f.limit ?? ''}`);
process.exitCode = results.passed ? 0 : 1;
