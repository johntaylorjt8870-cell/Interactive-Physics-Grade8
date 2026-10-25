// Optional real-browser QA for the Lesson 1 step sidebar (`lesson-1.html`), in
// the same shape as the other scripts/qa-* files.
//
//   npm run build
//   python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
//   QA_MODULE_DIR=/path/to/qa/node_modules CHROMIUM_PATH=/tmp/chromium \
//     node scripts/qa-lesson-1-sidebar.mjs
//
// `QA_MODULE_DIR` must hold `puppeteer-core` and `@sparticuz/chromium`; nothing
// is added to this repository's package.json. `QA_BASE_URL` defaults to
// http://127.0.0.1:4173 (so serve `dist/`), `QA_PHASE` (default `after`) only
// names the screenshots and the results JSON, and `QA_OUT_DIR` (default the
// folder next to this file's QA notes) is where the PNGs are written.
//
// The checks are about one thing: on a 1366×768 laptop the step rail is 849px
// tall and cannot scroll inside itself, so step 8 («المسائل والتدريب الشامل»)
// and the curriculum key (`.sidebar-footer`) sit below the fold for the whole
// lesson. Every measurement below is taken from the live layout, so this script
// fails on the pre-fix stylesheet and passes on the fixed one; the 1440×900,
// 1920×1080, 820×768 and 390×844 runs guard the other sizes against a change.

import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(process.env.QA_MODULE_DIR ? resolve(process.env.QA_MODULE_DIR, 'qa-entry.cjs') : import.meta.url);
const puppeteer = require('puppeteer-core');

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const phase = process.env.QA_PHASE || 'after';
const outDir = process.env.QA_OUT_DIR || resolve(here, '..', 'docs', 'qa', 'lesson-1-sidebar');
const executablePath = process.env.CHROMIUM_PATH || await (await import(require.resolve('@sparticuz/chromium'))).default.executablePath();
await mkdir(outDir, { recursive: true });

const pagePath = `${base}/lesson-1.html`;
const STEPS = 8;
/** The rail is sticky under a 76px top bar; 400px of scroll pins it to `top: 24px`. */
const STUCK_SCROLL = 400;

const checks = [];
let failures = 0;
const check = (condition, message, detail) => {
  checks.push({ ok: Boolean(condition), message, ...(detail === undefined ? {} : { detail }) });
  if (!condition) failures += 1;
  return Boolean(condition);
};

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

/* --------------------------------------------------------------- helpers */

const measurements = {};

/** Everything the checks need, read from the live layout in one round trip. */
async function readSidebar(page) {
  return page.evaluate(() => {
    const box = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { top: Math.round(rect.top), bottom: Math.round(rect.bottom), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width), height: Math.round(rect.height) };
    };
    const sidebar = document.querySelector('.lesson-sidebar');
    const nav = document.querySelector('#page-nav');
    const footer = document.querySelector('.sidebar-footer');
    const active = nav?.querySelector('[aria-current="step"]');
    const sidebarStyle = sidebar ? getComputedStyle(sidebar) : null;
    const navStyle = nav ? getComputedStyle(nav) : null;
    const buttons = [...(nav?.querySelectorAll('.page-nav-button') ?? [])];
    const clippedLabels = buttons.flatMap((button) => {
      const label = button.querySelector('.page-nav-copy strong');
      const small = button.querySelector('.page-nav-copy small');
      const problems = [];
      if (label && label.scrollWidth > label.clientWidth + 1) problems.push(label.textContent.trim());
      if (small && small.getBoundingClientRect().height < 8) problems.push(`${small.textContent.trim()} (collapsed)`);
      return problems;
    });
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      scrollY: Math.round(window.scrollY),
      documentScrollsSideways: document.documentElement.scrollWidth > window.innerWidth + 1,
      sidebar: box(sidebar),
      sidebarStyle: { position: sidebarStyle?.position, maxHeight: sidebarStyle?.maxHeight, overflowY: sidebarStyle?.overflowY },
      nav: nav ? { ...box(nav), scrollHeight: nav.scrollHeight, clientHeight: nav.clientHeight, scrollTop: Math.round(nav.scrollTop), overflowY: navStyle?.overflowY } : null,
      footer: box(footer),
      active: box(active),
      activeLabel: active?.querySelector('.page-nav-copy strong')?.textContent.trim() ?? null,
      stepCount: buttons.length,
      buttonWidths: [...new Set(buttons.map((button) => Math.round(button.getBoundingClientRect().width)))],
      clippedLabels,
      navNeedsScroll: nav ? nav.scrollHeight > nav.clientHeight + 1 : false,
    };
  });
}

/** True when the active step is reachable: inside the rail box and inside the window. */
const activeStepReachable = (state) => Boolean(state.active && state.nav)
  && state.active.top >= state.nav.top - 1
  && state.active.bottom <= state.nav.bottom + 1
  && state.active.top >= 0
  && state.active.bottom <= state.viewport.height + 1;

async function openSidebarPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
  await page.goto(pagePath, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#page-nav .page-nav-button');
  return page;
}

async function stepForward(page, expected) {
  await page.evaluate(() => document.querySelector('#next-button').click());
  await page.waitForFunction((page_number) => document.querySelector('#page-number')?.textContent.trim() === String(page_number), {}, expected);
  // the reveal runs synchronously after the render; the step change then smooth-scrolls
  // the window back to the top, so wait for that to settle before measuring
  await page.evaluate(async () => {
    const started = Date.now();
    let last = -1;
    let stable = 0;
    while (Date.now() - started < 2500) {
      await new Promise((done) => requestAnimationFrame(done));
      const y = Math.round(window.scrollY);
      stable = y === last ? stable + 1 : 0;
      last = y;
      if (stable >= 3) return;
    }
  });
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
}

/* ------------------------------------------------------- 1366×768 laptop */

{
  const width = 1366;
  const height = 768;
  const page = await openSidebarPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#page-nav .page-nav-button');

  check(!(await readSidebar(page)).documentScrollsSideways, `${width}×${height}: the page does not scroll sideways`);

  const steps = [];
  for (let step = 1; step <= STEPS; step += 1) {
    if (step > 1) await stepForward(page, step + 54);
    const state = await readSidebar(page);
    steps.push({
      step,
      label: state.activeLabel,
      active: state.active,
      nav: { ...state.nav },
      scrollY: state.scrollY,
      reachable: activeStepReachable(state),
    });
    check(state.stepCount === STEPS, `${width}×${height}: step ${step} keeps ${STEPS} rail buttons`, state.stepCount);
    check(activeStepReachable(state), `${width}×${height}: step ${step} «${state.activeLabel}» is reachable without scrolling the window`, state.active);
  }

  // the rail is pinned under the top bar once the reader scrolls
  await page.evaluate((top) => window.scrollTo(0, top), STUCK_SCROLL);
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
  const stuck = await readSidebar(page);

  check(stuck.sidebar.top >= -1 && stuck.sidebar.bottom <= height + 1,
    `${width}×${height}: the pinned rail fits the window`, stuck.sidebar);
  check(Boolean(stuck.footer) && stuck.footer.top >= 0 && stuck.footer.bottom <= height + 1,
    `${width}×${height}: the curriculum key stays visible while reading`, stuck.footer);
  check(Boolean(stuck.nav) && stuck.nav.overflowY !== 'visible' && stuck.navNeedsScroll,
    `${width}×${height}: the rail scrolls inside itself instead of overflowing`, { overflowY: stuck.nav?.overflowY, scrollHeight: stuck.nav?.scrollHeight, clientHeight: stuck.nav?.clientHeight });
  check(stuck.navNeedsScroll && stuck.nav.scrollTop > 0,
    `${width}×${height}: reaching the last step scrolls the rail, not the window`, { scrollTop: stuck.nav?.scrollTop, windowScrollY: stuck.scrollY });
  check(stuck.buttonWidths.length === 1 && stuck.buttonWidths[0] === 256,
    `${width}×${height}: every rail button keeps its 256px width`, stuck.buttonWidths);
  check(stuck.clippedLabels.length === 0,
    `${width}×${height}: no rail label is clipped`, stuck.clippedLabels);

  // the window still returns to the top of the step (the lesson's own behaviour)
  await page.evaluate(() => document.querySelectorAll('.page-nav-button')[0].click());
  await page.waitForFunction(() => document.querySelector('#page-number')?.textContent.trim() === '55');
  await page.evaluate((top) => window.scrollTo(0, top), STUCK_SCROLL);
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
  const before = await readSidebar(page);
  await stepForward(page, 56);
  const after = await readSidebar(page);
  check(before.scrollY > 0 && after.scrollY <= 1,
    `${width}×${height}: changing step still moves the reader to the step heading`,
    { before: before.scrollY, after: after.scrollY });

  // and the rail-scroll reveal survived that jump
  check(activeStepReachable(after), `${width}×${height}: the new step is revealed after the jump`, after.active);

  // final state for the screenshots: the last step, rail pinned and scrolled
  for (let step = 3; step <= STEPS; step += 1) await stepForward(page, step + 54);
  await page.evaluate((top) => window.scrollTo(0, top), STUCK_SCROLL);
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
  await page.screenshot({ path: resolve(outDir, `${phase}-${width}x${height}.png`) });
  const sidebarClip = await page.evaluate(() => {
    const rect = document.querySelector('.lesson-sidebar').getBoundingClientRect();
    return { x: Math.max(0, Math.round(rect.left) - 10), y: 0, width: Math.min(Math.round(rect.width) + 20, window.innerWidth - Math.round(rect.left)), height: window.innerHeight };
  });
  await page.screenshot({ path: resolve(outDir, `${phase}-${width}x${height}-sidebar.png`), clip: sidebarClip });

  measurements[`${width}x${height}`] = { steps, stuck };
  await page.close();
}

/* ------------------------------------- 1440×900, 1920×1080: no change here */

for (const [width, height] of [[1440, 900], [1920, 1080]]) {
  const page = await openSidebarPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#page-nav .page-nav-button');
  await page.evaluate((top) => window.scrollTo(0, top), STUCK_SCROLL);
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
  const state = await readSidebar(page);

  check(!state.navNeedsScroll, `${width}×${height}: the rail does not scroll when every step fits`, { scrollHeight: state.nav?.scrollHeight, clientHeight: state.nav?.clientHeight });
  check(state.sidebar.top >= -1 && state.sidebar.bottom <= height + 1, `${width}×${height}: the pinned rail fits the window`, state.sidebar);
  check(Boolean(state.footer) && state.footer.bottom <= height + 1, `${width}×${height}: the curriculum key is visible`, state.footer);
  check(state.buttonWidths.length === 1 && state.buttonWidths[0] === 256, `${width}×${height}: every rail button keeps its 256px width`, state.buttonWidths);
  check(state.clippedLabels.length === 0, `${width}×${height}: no rail label is clipped`, state.clippedLabels);
  check(state.stepCount === STEPS, `${width}×${height}: all ${STEPS} steps are listed`, state.stepCount);

  for (let step = 1; step <= STEPS; step += 1) {
    if (step > 1) await stepForward(page, step + 54);
    const current = await readSidebar(page);
    check(activeStepReachable(current) && current.nav.scrollTop === 0,
      `${width}×${height}: step ${step} is reachable with the rail unscrolled`, { active: current.active, scrollTop: current.nav?.scrollTop });
  }

  await page.screenshot({ path: resolve(outDir, `${phase}-${width}x${height}.png`) });
  measurements[`${width}x${height}`] = { state };
  await page.close();
}

/* ---------------------------- 820×768 and 390×844: the stacked sidebar ---- */

for (const [width, height] of [[820, 768], [390, 844]]) {
  const page = await openSidebarPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('#page-nav .page-nav-button');
  await page.evaluate((top) => window.scrollTo(0, top), STUCK_SCROLL);
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
  const state = await readSidebar(page);

  check(!state.documentScrollsSideways, `${width}×${height}: the page does not scroll sideways`);
  check(state.sidebarStyle.position === 'static', `${width}×${height}: the stacked rail stays in the flow`, state.sidebarStyle);
  check(state.sidebarStyle.maxHeight === 'none', `${width}×${height}: the stacked rail is not height-bound`, state.sidebarStyle);
  check(state.nav.overflowY === 'visible', `${width}×${height}: the stacked rail keeps its old overflow`, state.nav?.overflowY);
  check(state.clippedLabels.length === 0, `${width}×${height}: no rail label is clipped`, state.clippedLabels);

  await page.screenshot({ path: resolve(outDir, `${phase}-${width}x${height}.png`) });
  measurements[`${width}x${height}`] = { state };
  await page.close();
}

await browser.close();

const report = {
  phase,
  base: pagePath,
  generatedAt: new Date().toISOString(),
  checks: checks.length,
  failures,
  measurements,
  results: checks,
};
await writeFile(resolve(outDir, `browser-results-${phase}.json`), `${JSON.stringify(report, null, 2)}\n`);

for (const result of checks.filter((entry) => !entry.ok)) {
  console.log(`FAIL ${result.message} ${result.detail === undefined ? '' : JSON.stringify(result.detail)}`);
}
console.log(`${checks.length} checks, ${failures} failure(s) — screenshots and browser-results-${phase}.json in ${outDir}`);
if (failures > 0) {
  process.exitCode = 1;
}
