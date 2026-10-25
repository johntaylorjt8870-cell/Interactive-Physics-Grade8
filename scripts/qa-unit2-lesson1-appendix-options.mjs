// Optional real-browser QA for the answer options of the Unit 2 Lesson 1
// appendix («مختبر الشحنات»), in the same shape as the other scripts/qa-* files.
//
//   npm run build
//   python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
//   QA_MODULE_DIR=/path/to/qa/node_modules CHROMIUM_PATH=/tmp/chromium \
//     node scripts/qa-unit2-lesson1-appendix-options.mjs
//
// `QA_MODULE_DIR` must hold `puppeteer-core` and `@sparticuz/chromium`; nothing
// is added to this repository's package.json. `QA_BASE_URL` defaults to
// http://127.0.0.1:4173 (so serve `dist/`), `QA_PHASE` (default `after`) only
// names the screenshots, and `QA_OUT_DIR` (default the folder next to this
// file's QA notes) is where the PNGs and the results JSON are written.
//
// The checks are about one thing: on the dark field, can a student tell the
// resting option, the hovered one, the selected one and the keyboard-focused
// one apart, and is every label still readable and unclipped? Contrast is
// measured from real pixels of real screenshots (the border is sampled from a
// vertical scan across the option's top edge), not only from the CSS text, and
// the interactions are driven end to end so a styling change cannot pass while
// the lab stopped working.

import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(process.env.QA_MODULE_DIR ? resolve(process.env.QA_MODULE_DIR, 'qa-entry.cjs') : import.meta.url);
const puppeteer = require('puppeteer-core');

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const phase = process.env.QA_PHASE || 'after';
const outDir = process.env.QA_OUT_DIR || resolve(here, '..', 'docs', 'qa', 'unit2-lesson1-appendix-options');
const executablePath = process.env.CHROMIUM_PATH || (await import(require.resolve('@sparticuz/chromium'))).default.executablePath();
await mkdir(outDir, { recursive: true });

const pagePath = `${base}/unit2-lesson-1-appendix.html`;
const viewports = [{ width: 1366, height: 768 }, { width: 1440, height: 900 }];

const checks = [];
let failures = 0;
const check = (condition, message, detail) => {
  checks.push({ ok: Boolean(condition), message, ...(detail === undefined ? {} : { detail }) });
  if (!condition) failures += 1;
  return Boolean(condition);
};

/* WCAG 2.x relative luminance and contrast, on 0–255 sRGB triplets. */
const channel = (value) => { const c = value / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (a, b) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
};
const round2 = (value) => Math.round(value * 100) / 100;

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

/* --------------------------------------------------------------- helpers */

/** Screenshot an element and read pixels back inside the page itself. */
async function elementPixels(page, selector, points) {
  const element = await page.$(selector);
  if (!element) throw new Error(`missing element ${selector}`);
  await element.scrollIntoView();
  await new Promise((done) => setTimeout(done, 260));
  const buffer = await element.screenshot({ encoding: 'base64' });
  return page.evaluate(async ({ data, requests }) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);
    const read = (x, y) => {
      const [r, g, b, a] = context.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      return { r, g, b, a };
    };
    const largest = Math.max(...requests);
    const point = Math.max(0, Math.min(1, largest));
    return {
      width: bitmap.width,
      height: bitmap.height,
      values: requests.map((fraction) => read(bitmap.width * point, bitmap.height * fraction)),
    };
  }, { data: buffer, requests: points });
}

/** The brightest pixel in a vertical scan of the top edge is the border. */
async function measureOption(page, selector) {
  const element = await page.$(selector);
  if (!element) throw new Error(`missing element ${selector}`);
  const box = await element.boundingBox();
  const geometry = await page.$eval(selector, (node) => {
    const style = getComputedStyle(node);
    const label = node.querySelector('span');
    const input = node.querySelector('input');
    const dot = input ? getComputedStyle(input, '::before') : null;
    return {
      borderWidth: style.borderTopWidth,
      borderColor: style.borderTopColor,
      background: style.backgroundColor,
      textColor: getComputedStyle(label).color,
      outlineWidth: style.outlineWidth,
      outlineStyle: style.outlineStyle,
      outlineColor: style.outlineColor,
      boxShadow: style.boxShadow,
      radioBorder: input ? getComputedStyle(input).borderTopColor : null,
      radioAppearance: input ? getComputedStyle(input).appearance : null,
      radioChecked: input ? input.checked : null,
      radioDot: dot ? dot.transform : null,
      clippedVertically: node.scrollHeight - node.clientHeight,
      clippedHorizontally: node.scrollWidth - node.clientWidth,
      textClipped: label ? label.scrollWidth - label.clientWidth : 0,
    };
  });

  /* the border colour, sampled along a scan through the top edge */
  const scan = await elementPixels(page, selector, Array.from({ length: 9 }, (_, index) => index / 40));
  const brightest = scan.values
    .map(({ r, g, b }) => [r, g, b])
    .sort((a, b) => luminance(b) - luminance(a))[0];

  /* the fill, sampled well inside the top padding (never over a glyph) */
  const fillShot = await elementPixels(page, selector, [0.32]);
  const fill = (() => { const { r, g, b } = fillShot.values[0]; return [r, g, b]; })();

  return { box, geometry, border: brightest, fill, scan: scan.values.map(({ r, g, b }) => [r, g, b]) };
}

async function scrollTop(page) { await page.evaluate(() => window.scrollTo(0, 0)); }

/** Save a compact element screenshot, so the QA folder stays small. */
async function shot(page, selector, name) {
  const element = await page.$(selector);
  if (!element) return false;
  await element.scrollIntoView();
  await new Promise((done) => setTimeout(done, 260));
  await element.screenshot({ path: resolve(outDir, name) });
  return true;
}

/* ------------------------------------------------------------------ run */

const results = [];
for (const viewport of viewports) {
  const tag = `${viewport.width}x${viewport.height}`;
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.failure()?.errorText} ${request.url()}`));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`http ${response.status()} ${response.url()}`); });
  await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
  await page.goto(pagePath, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((done) => setTimeout(done, 200));

  const noOverflow = async (label) => {
    const size = await page.evaluate(() => ({ inner: window.innerWidth, scroll: document.documentElement.scrollWidth }));
    check(size.scroll <= size.inner + 1, `${tag} ${label}: no unintended horizontal page scroll`, size);
  };

  await noOverflow('hero');

  /* ------------------------------------------------- station 1 · resting */
  const first = '[data-station="puzzle"] .u2l1a-choice-list .u2l1a-choice:nth-of-type(1)';
  const options = await page.$$('[data-station="puzzle"] .u2l1a-choice-list .u2l1a-choice');
  const resting = await measureOption(page, first);
  await shot(page, '[data-station="puzzle"] .u2l1a-lab-controls', `station1-options-resting-${phase}-${tag}.png`);

  check(resting.geometry.borderWidth === '1px', `${tag} resting option keeps a 1px edge`, resting.geometry.borderWidth);
  const edgeRatio = contrast(resting.border, resting.fill);
  check(edgeRatio >= 3, `${tag} resting option edge ≥ 3:1 against its own fill`, round2(edgeRatio));
  const textRatio = contrast(resting.geometry.textColor.match(/\d+/g).slice(0, 3).map(Number), resting.fill);
  check(textRatio >= 4.5, `${tag} resting option label ≥ 4.5:1`, round2(textRatio));
  const radioRatio = contrast(resting.geometry.radioBorder.match(/\d+/g).slice(0, 3).map(Number), resting.fill);
  check(radioRatio >= 3, `${tag} resting radio ring ≥ 3:1`, round2(radioRatio));
  check(resting.geometry.clippedVertically <= 1 && resting.geometry.clippedHorizontally <= 1 && resting.geometry.textClipped <= 1,
    `${tag} resting option label is not clipped`, resting.geometry);
  check(options.length >= 3, `${tag} station 1 offers its prediction options`, options.length);

  /* every option has to be equally legible, not only the first one */
  for (let index = 0; index < options.length; index += 1) {
    const measured = await measureOption(page, `[data-station="puzzle"] .u2l1a-choice-list .u2l1a-choice:nth-of-type(${index + 1})`);
    check(contrast(measured.border, measured.fill) >= 3, `${tag} option ${index + 1} edge ≥ 3:1`, round2(contrast(measured.border, measured.fill)));
  }

  /* --------------------------------------------------------- hover state */
  await page.hover(first);
  await new Promise((done) => setTimeout(done, 260));
  const hovered = await measureOption(page, first);
  check(hovered.geometry.borderColor !== resting.geometry.borderColor, `${tag} hover changes the edge colour`, hovered.geometry.borderColor);
  check(contrast(hovered.border, hovered.fill) >= 3, `${tag} hovered edge ≥ 3:1`, round2(contrast(hovered.border, hovered.fill)));
  await shot(page, '[data-station="puzzle"] .u2l1a-choice-set', `station1-options-hover-${phase}-${tag}.png`);

  /* ----------------------------------------------------- selected state */
  await page.click(first);
  await page.mouse.move(2, 2);
  await new Promise((done) => setTimeout(done, 260));
  const selected = await measureOption(page, first);
  check(selected.geometry.radioChecked === true, `${tag} clicking an option selects it`, selected.geometry.radioChecked);
  check(selected.geometry.radioDot !== resting.geometry.radioDot, `${tag} the selected radio shows its dot`, selected.geometry.radioDot);
  const selectedFillRatio = contrast(selected.fill, resting.fill);
  check(selectedFillRatio >= 1.25, `${tag} selected fill differs visibly from the resting fill`, round2(selectedFillRatio));
  check(contrast(selected.border, selected.fill) >= 3, `${tag} selected edge ≥ 3:1 on its own fill`, round2(contrast(selected.border, selected.fill)));
  check(contrast(selected.border, resting.fill) >= 3, `${tag} selected edge ≥ 3:1 against the resting fill`, round2(contrast(selected.border, resting.fill)));
  check(/inset/.test(selected.geometry.boxShadow), `${tag} selected option adds an inset ring, so its weight changes too`, selected.geometry.boxShadow);
  const selectedTextRatio = contrast(selected.geometry.textColor.match(/\d+/g).slice(0, 3).map(Number), selected.fill);
  check(selectedTextRatio >= 4.5, `${tag} selected label ≥ 4.5:1`, round2(selectedTextRatio));
  await shot(page, '[data-station="puzzle"] .u2l1a-lab-controls', `station1-options-selected-${phase}-${tag}.png`);

  /* ------------------------------------------------------ keyboard focus */
  await page.mouse.move(2, 2);
  await page.$eval('[data-station="puzzle"] .u2l1a-choice-set', (node) => node.scrollIntoView({ block: 'center' }));
  await page.evaluate(() => document.querySelector('[data-station="puzzle"] .u2l1a-choice input').focus());
  await page.keyboard.press('ArrowDown');
  await new Promise((done) => setTimeout(done, 260));
  const focusedSelector = await page.evaluate(() => {
    const input = document.querySelector('[data-station="puzzle"] .u2l1a-choice input:focus');
    if (!input) return null;
    const label = input.closest('.u2l1a-choice');
    const index = [...label.parentElement.querySelectorAll('.u2l1a-choice')].indexOf(label);
    return `[data-station="puzzle"] .u2l1a-choice-list .u2l1a-choice:nth-of-type(${index + 1})`;
  });
  check(Boolean(focusedSelector), `${tag} arrow keys move focus between the options`, focusedSelector);
  if (focusedSelector) {
    const focused = await measureOption(page, focusedSelector);
    check(focused.geometry.outlineWidth === '3px' && focused.geometry.outlineStyle === 'solid',
      `${tag} keyboard focus draws a 3px ring on the whole option`, `${focused.geometry.outlineWidth} ${focused.geometry.outlineStyle}`);
    check(focused.geometry.outlineColor === 'rgb(88, 205, 242)', `${tag} the focus ring uses the page accent`, focused.geometry.outlineColor);
    const pageBackground = await page.evaluate(() => {
      const node = document.querySelector('[data-station="puzzle"] .u2l1a-lab-controls');
      const style = getComputedStyle(node);
      return style.backgroundColor;
    });
    const ringRatio = contrast(focused.geometry.outlineColor.match(/\d+/g).slice(0, 3).map(Number), [11, 19, 34]);
    check(ringRatio >= 3, `${tag} the focus ring clears 3:1 on the dark lab panel`, { ratio: round2(ringRatio), pageBackground });
    check(await page.evaluate(() => {
      const input = document.querySelector('[data-station="puzzle"] .u2l1a-choice input:focus');
      return input ? getComputedStyle(input).outlineStyle === 'none' : false;
    }), `${tag} the input does not draw a second ring inside the option`);
    await shot(page, '[data-station="puzzle"] .u2l1a-choice-set', `station1-options-focus-${phase}-${tag}.png`);
  }

  /* --------------------------------------- the lab itself still behaves */
  await page.evaluate(() => {
    document.querySelector('[data-puzzle-prediction="attract"]')?.click();
  });
  await page.click('[data-puzzle-rub]');
  await page.click('[data-puzzle-approach]');
  /* the scene lowers the rod over 1.1 s and reveals the two cards only when it
     lands, so the reveal is awaited instead of sampled after a fixed delay */
  await page.waitForFunction(() => {
    const observation = document.querySelector('[data-puzzle-observation]');
    return observation && !observation.hidden;
  }, { timeout: 8000 }).catch(() => {});
  const puzzleState = await page.evaluate(() => ({
    status: document.querySelector('[data-puzzle-status]')?.textContent?.trim() ?? '',
    observationShown: !document.querySelector('[data-puzzle-observation]')?.hidden,
    explanationShown: !document.querySelector('[data-puzzle-explanation]')?.hidden,
  }));
  check(puzzleState.observationShown && puzzleState.explanationShown,
    `${tag} predict → rub → approach still reveals observation and explanation`, puzzleState);
  check(puzzleState.status.length > 10, `${tag} the live status still reports the scene`, puzzleState.status);
  await noOverflow('station 1');

  /* ------------------------------------------------ station 5 · probes */
  await page.evaluate(() => { window.location.hash = '#station-coulomb'; });
  await new Promise((done) => setTimeout(done, 420));
  await shot(page, '[data-station="coulomb"] .u2l1a-probe', `station5-probes-${phase}-${tag}.png`);
  const probes = await page.evaluate(() => [...document.querySelectorAll('[data-station="coulomb"] .u2l1a-choice-pill')].map((node) => {
    const style = getComputedStyle(node);
    return { border: style.borderColor, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height };
  }));
  check(probes.length >= 4, `${tag} the Coulomb probe pills are present`, probes.length);
  check(probes.every((probe) => probe.height >= 44), `${tag} the pills keep their 44px touch height`, probes.map((probe) => Math.round(probe.height)));
  await noOverflow('station 5');

  /* --------------------------------------------- station 6 · detective */
  await page.evaluate(() => { window.location.hash = '#station-detective'; });
  await new Promise((done) => setTimeout(done, 420));
  const firstCard = '[data-station="detective"] [data-question-card]';
  const firstCardId = await page.$eval(firstCard, (node) => node.dataset.questionCard);
  const choiceId = await page.$eval(`${firstCard} [data-question-choice] input`, (node) => node.value);
  await page.click(`${firstCard} [data-question-choice] input`);
  await page.mouse.move(2, 2);
  await new Promise((done) => setTimeout(done, 200));
  const picked = await measureOption(page, `${firstCard} [data-question-choice="${choiceId}"]`);
  check(picked.geometry.radioChecked === true, `${tag} station 6 marks the chosen answer`, picked.geometry.radioChecked);
  check(contrast(picked.fill, resting.fill) >= 1.25, `${tag} station 6 selection differs from a resting option`, round2(contrast(picked.fill, resting.fill)));
  await shot(page, firstCard, `station6-options-selected-${phase}-${tag}.png`);
  await page.click(`[data-station="detective"] [data-question-submit="${firstCardId}"]`);
  await new Promise((done) => setTimeout(done, 300));
  const verdict = await page.$eval(`[data-station="detective"] [data-question-feedback="${firstCardId}"]`, (node) => ({
    hidden: node.hidden,
    verdict: node.dataset.verdict,
    text: node.textContent.trim().slice(0, 60),
  }));
  check(!verdict.hidden && ['correct', 'incorrect'].includes(verdict.verdict), `${tag} submitting still reveals the explained verdict`, verdict);
  await shot(page, firstCard, `station6-options-verdict-${phase}-${tag}.png`);
  await page.click(`[data-station="detective"] [data-question-retry="${firstCardId}"]`);
  await new Promise((done) => setTimeout(done, 260));
  const retried = await page.evaluate((cardId) => ({
    hidden: document.querySelector(`[data-question-feedback="${cardId}"]`).hidden,
    checked: document.querySelectorAll('[data-question-card] [data-question-choice] input:checked').length,
    state: document.querySelector(`[data-question-card="${cardId}"]`).dataset.state,
  }), firstCardId);
  check(retried.hidden && retried.checked === 0, `${tag} retry still clears the answer and the feedback`, retried);
  check(retried.state === 'open', `${tag} retry returns the card to its open state`, retried.state);
  await noOverflow('station 6');

  check(errors.length === 0, `${tag} no console error, failed request or 4xx response`, errors);
  results.push({
    viewport,
    checks: checks.length,
    failures: failures,
    errors,
    measurements: {
      restingEdge: round2(edgeRatio),
      restingText: round2(textRatio),
      restingRadio: round2(radioRatio),
      hoverEdge: round2(contrast(hovered.border, hovered.fill)),
      selectedFillVsResting: round2(selectedFillRatio),
      selectedEdge: round2(contrast(selected.border, selected.fill)),
      selectedText: round2(selectedTextRatio),
      restingBorder: resting.border,
      restingFill: resting.fill,
      selectedBorder: selected.border,
      selectedFill: selected.fill,
    },
  });
  await scrollTop(page);
  await new Promise((done) => setTimeout(done, 200));
  await page.screenshot({ path: resolve(outDir, `page-${phase}-${tag}.png`) });
  await page.close();
}

await browser.close();

const report = {
  page: pagePath,
  phase,
  base,
  checks: checks.length,
  failures,
  results,
  failed: checks.filter((entry) => !entry.ok),
};
await writeFile(resolve(outDir, `browser-results-${phase}.json`), `${JSON.stringify(report, null, 2)}\n`);
console.log(`${checks.length} checks, ${failures} failure(s) — screenshots and browser-results-${phase}.json in ${outDir}`);
if (failures > 0) {
  for (const failure of report.failed) console.log(`FAIL ${failure.message} ${failure.detail === undefined ? '' : JSON.stringify(failure.detail)}`);
  process.exitCode = 1;
}
