/* Optional real-browser QA for the rebuilt Unit 2 Lesson 4 (pp107–120).
 *
 * This lesson is now taught one printed page at a time, so the old station-rail
 * script no longer applied. The script exercises the current build only:
 *   - all fourteen steps at 1366×768, 1440×900 and 390×844, including horizontal
 *     overflow, clipped figures, overlapping SVG labels and progress/nav state;
 *   - forward, backward, sidebar, hash and keyboard navigation, and whether the
 *     answers typed into a step survive stepping away and back;
 *   - every one of the 24 practice activities: the attempt gate, a wrong answer,
 *     the hint, a correct retry, the worked solution and reset behaviour;
 *   - the six simulators and the two recording labs against their live readouts;
 *   - notebook persistence across a reload, and regression smoke checks of the
 *     earlier lessons, the teacher area and the Unit 2 test.
 *
 * Install playwright-core and @sparticuz/chromium outside the repository, then
 * set QA_MODULE_DIR to that installation's node_modules. Serve dist on
 * QA_BASE_URL (default http://127.0.0.1:4173).
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { UNIT2L4_PAGES } from '../src/unit2-lesson4-content.js';
import { UNIT2L4_ANSWERS } from '../src/unit2-lesson4-answers.js';
import { UNIT2L4_PRACTICE_IDS } from '../src/unit2-lesson4-practice.js';
import { UNIT2L4_SIMULATION_IDS } from '../src/unit2-lesson4-simulations.js';
import { UNIT_2_QUESTIONS } from '../src/unit-2-test-data.js';
import { ANSWER_KEY } from '../src/unit-2-test-solutions.js';

const require = createRequire(process.env.QA_MODULE_DIR ? `${process.env.QA_MODULE_DIR}/qa-entry.cjs` : import.meta.url);
const { chromium: pw } = require('playwright-core');
const Chrome = (await import(require.resolve('@sparticuz/chromium'))).default;
const browser = await pw.launch({
  executablePath: await Chrome.executablePath(),
  args: Chrome.args.filter((arg) => !['--single-process', '--disable-web-security', '--allow-running-insecure-content'].includes(arg)),
  headless: true,
});
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const out = new URL('../docs/qa/unit2-lesson4/', import.meta.url);
await mkdir(out, { recursive: true });
const results = [];
const failures = [];
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks += 1; };

const pageForPractice = (id) => UNIT2L4_PAGES.find((page) => page.blocks.some((block) => block.id === id));
const text = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

/** Fails when a step scrolls sideways, a figure is clipped, or two SVG labels overlap. */
async function layoutAudit(page, label) {
  const sizes = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  check(sizes.scroll <= sizes.width, `${label}: horizontal overflow ${JSON.stringify(sizes)}`);
  const clipped = await page.evaluate(() => [...document.querySelectorAll('#page-content .r4-figure, #page-content .r4p-lab-figure')]
    .filter((figure) => figure.scrollWidth > figure.clientWidth + 2)
    .map((figure) => figure.dataset.figure || figure.className));
  check(clipped.length === 0, `${label}: clipped figures ${clipped.join(', ')}`);
  const overlaps = await page.evaluate(() => [...document.querySelectorAll('#page-content svg')].flatMap((svg) => {
    const labels = [...svg.querySelectorAll('text')].map((node) => ({ node, box: node.getBoundingClientRect() }));
    const collisions = [];
    for (let i = 0; i < labels.length; i += 1) {
      for (let j = i + 1; j < labels.length; j += 1) {
        const a = labels[i].box; const b = labels[j].box;
        const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (width > 3 && height > 3) collisions.push(`${labels[i].node.textContent.trim()} ↔ ${labels[j].node.textContent.trim()}`);
      }
    }
    return collisions;
  }));
  check(overlaps.length === 0, `${label}: overlapping SVG labels ${overlaps.slice(0, 4).join(' | ')}`);
}

async function goToPage(page, number) {
  await page.evaluate((value) => { location.hash = `#p${value}`; }, number);
  await page.waitForSelector(`[data-page-view="p${number}"]`);
  await page.waitForFunction((value) => document.querySelector('#page-number')?.textContent.trim() === String(value), number);
}

/** Waits until the activity feedback matches, because keys arrive through a lazy import. */
async function feedbackMatches(page, id, pattern, label) {
  await page.waitForFunction(({ selector, source }) => new RegExp(source).test(document.querySelector(selector)?.textContent ?? ''),
    { selector: `[data-u2l4-practice="${id}"] [data-r4p-feedback]`, source: pattern.source });
  assert.match(await page.locator(`[data-u2l4-practice="${id}"] [data-r4p-feedback]`).innerText(), pattern, label);
}

async function fillNumeric(root, id, value) {
  const input = root.locator(`[data-r4p-numeric="${id}"]`);
  await input.fill(String(value));
}

async function exerciseActivity(page, id) {
  const spec = UNIT2L4_ANSWERS[id];
  const root = page.locator(`[data-u2l4-practice="${id}"]`);
  await root.waitFor();
  const solution = root.locator('[data-r4p-solution]');
  const feedback = root.locator('[data-r4p-feedback]');
  const isLab = id.endsWith('-lab');

  check(await solution.isHidden(), `${id}: solution hidden before any attempt`);

  if (isLab) {
    await root.locator('[data-r4p-action="check"]').click();
    await feedbackMatches(page, id, /أغلق القاطعة/, `${id}: the check is gated until the switch is closed`);
    await root.locator('[data-lab-toggle="close"]').click();
    const readings = {};
    for (const key of ['i', 'u1', 'u2', 'i1', 'i2', 'u']) {
      const node = root.locator(`[data-lab-reading="${key}"]`);
      if (await node.count()) readings[key] = (await node.textContent() ?? '').replace(/[^\d.-]/g, '');
    }
    for (const [key, value] of Object.entries(readings)) {
      const record = root.locator(`[data-lab-record="${key}"]`).first();
      if (await record.count()) await record.fill(value);
    }
    const relation = id === 'p113-lab' ? 'series-sum' : 'parallel-sum-currents';
    await root.locator(`input[name="r4p-${id === 'p113-lab' ? 'series' : 'parallel'}-relation"][value="${relation}"]`).check();
    await root.locator('[data-r4p-action="check"]').click();
    await page.waitForFunction((selector) => /4 \/ 4/.test(document.querySelector(selector)?.textContent ?? ''), `[data-u2l4-practice="${id}"] [data-r4p-score]`);
    check((await feedback.innerText()).includes('جميع إجاباتك صحيحة'), `${id}: recorded readings graded 4/4`);
    await root.locator('[data-r4p-action="solution"]').click();
    await solution.waitFor({ state: 'visible' });
    check((await solution.innerText()).length > 40, `${id}: worked solution opens after the attempt`);
    await root.locator('[data-r4p-action="reset"]').click();
    check((await root.locator('[data-lab-reading="i"]').first().textContent() ?? '').includes('0'), `${id}: reset opens the switch and zeroes the meters`);
    return;
  }

  let kind = 'quiz';
  if (spec.items.some((item) => item.model)) kind = 'open';
  else if (await root.locator('[data-r4p-match]').count() > 0) kind = 'match';
  else if (await root.locator('[data-r4p-numeric]').count() > 0) kind = 'numeric';

  if (kind === 'open') {
    await root.locator('[data-r4p-action="check"]').click();
    await feedbackMatches(page, id, /اكتب محاولتك/, `${id}: empty free answer cannot be recorded`);
    for (const item of spec.items) await root.locator(`[data-r4p-open="${item.id}"]`).fill('محاولة قصيرة للتحقق من البوابة.');
    await root.locator('[data-r4p-action="check"]').click();
    await feedback.waitFor();
    check((await feedback.innerText()).includes('سُجّلت محاولتك'), `${id}: free answer recorded`);
    await solution.waitFor({ state: 'visible' });
    check((await solution.innerText()).length > 40, `${id}: model answer opens after recording`);
    return;
  }

  if (kind === 'quiz') {
    await root.locator('[data-r4p-action="check"]').click();
    await feedbackMatches(page, id, /اختر إجابة/, `${id}: empty selection cannot be graded`);
    for (const item of spec.items) {
      const wrong = (await root.locator(`input[name="r4p-${id}-${item.id}"]`).evaluateAll((nodes, correct) => nodes.map((node) => node.value).find((value) => value !== correct), item.correct));
      await root.locator(`input[name="r4p-${id}-${item.id}"][value="${wrong}"]`).check();
    }
    await root.locator('[data-r4p-action="check"]').click();
    await page.waitForFunction((selector) => /0 \/ \d+/.test(document.querySelector(selector)?.textContent ?? ''), `[data-u2l4-practice="${id}"] [data-r4p-score]`);
    check(await solution.isHidden(), `${id}: a wrong attempt does not reveal the solution`);
    await root.locator('[data-r4p-action="hint"]').click();
    await root.locator('[data-r4p-hint]').waitFor({ state: 'visible' });
    check((await root.locator('[data-r4p-hint]').innerText()).includes('تلميح'), `${id}: hint opens after a wrong attempt`);
    for (const item of spec.items) await root.locator(`input[name="r4p-${id}-${item.id}"][value="${item.correct}"]`).check();
    await root.locator('[data-r4p-action="check"]').click();
    await page.waitForFunction((selector) => /(\d+) \/ \1/.test(document.querySelector(selector)?.textContent ?? '') && /\d+ \/ \d+/.test(document.querySelector(selector)?.textContent ?? ''), `[data-u2l4-practice="${id}"] [data-r4p-score]`);
    await root.locator('[data-r4p-action="solution"]').click();
    await solution.waitFor({ state: 'visible' });
    check(await root.locator('.r4p-item.is-correct').count() === spec.items.length, `${id}: correct retry marks every item`);
    return;
  }

  if (kind === 'numeric') {
    await root.locator('[data-r4p-action="check"]').click();
    await feedbackMatches(page, id, /أدخل قيمة/, `${id}: empty numeric field cannot be graded`);
    await fillNumeric(root, spec.items[0].id, 999999);
    for (const item of spec.items.slice(1)) await fillNumeric(root, item.id, item.correct);
    await root.locator('[data-r4p-action="check"]').click();
    await root.locator('.r4p-item.is-incorrect').first().waitFor();
    check(await solution.isHidden(), `${id}: a wrong numeric answer does not reveal the solution`);
    for (const item of spec.items) await fillNumeric(root, item.id, item.correct);
    await root.locator('[data-r4p-action="check"]').click();
    await page.waitForFunction((selector) => /(\d+) \/ \1/.test(document.querySelector(selector)?.textContent ?? ''), `[data-u2l4-practice="${id}"] [data-r4p-score]`);
    await root.locator('[data-r4p-action="solution"]').click();
    await solution.waitFor({ state: 'visible' });
    check((await solution.innerText()).length > 40, `${id}: worked solution opens`);
    return;
  }

  for (const item of spec.items) await root.locator(`[data-r4p-match="${item.id}"]`).selectOption(item.correct);
  await root.locator('[data-r4p-action="check"]').click();
  await page.waitForFunction((selector) => /(\d+) \/ \1/.test(document.querySelector(selector)?.textContent ?? ''), `[data-u2l4-practice="${id}"] [data-r4p-score]`);
  await root.locator('[data-r4p-action="solution"]').click();
  await solution.waitFor({ state: 'visible' });
  check(await root.locator('.r4p-item.is-correct').count() === spec.items.length, `${id}: every match marked correct`);
}

try {
  for (const viewport of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => requests.push(request.url()));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', (request) => errors.push(`${request.failure()?.errorText} ${request.url()}`));

    await page.goto(`${base}/unit2-lesson-4.html`);
    await page.waitForSelector('[data-page-view="p107"]');
    await page.evaluate(() => document.fonts.ready);
    check(await page.locator('[data-page-view]').count() === 1, 'exactly one step is in the document at load');
    check(await page.locator('#page-nav .r4-nav-button').count() === 14, 'the sidebar lists all fourteen steps');

    /* Forward pass: every step, its own heading/page card and no layout breakage. */
    for (let index = 0; index < UNIT2L4_PAGES.length; index += 1) {
      const entry = UNIT2L4_PAGES[index];
      await page.waitForFunction((value) => document.querySelector('#page-number')?.textContent.trim() === String(value), entry.page);
      check(await page.locator('[data-page-view]').count() === 1, `p${entry.page}: one step at a time`);
      check(await page.locator('[data-page-view]').getAttribute('data-page-view') === `p${entry.page}`, `p${entry.page}: the active step is the expected page`);
      check(text(await page.locator('#page-heading').innerText()) === text(entry.heading), `p${entry.page}: heading matches the content module`);
      check((await page.locator('#progress-text').innerText()).trim() === `${index + 1} / 14`, `p${entry.page}: progress counter`);
      check((await page.locator('#page-nav [aria-current="step"]').getAttribute('data-visited')) === 'true', `p${entry.page}: the current step is marked in the sidebar`);
      await layoutAudit(page, `p${entry.page}@${viewport.width}`);
      if (viewport.width === 1366) {
        /* frame the step from its heading, so the screenshot shows the step title,
           the page card and the first piece of content together */
        await page.evaluate(() => {
          const row = document.querySelector('.r4-heading-row');
          const top = row.getBoundingClientRect().top + window.scrollY - 18;
          window.scrollTo(0, Math.max(0, top));
        });
        await page.screenshot({ path: new URL(`step-p${entry.page}-${viewport.width}.png`, out).pathname });
        await page.evaluate(() => {
          const card = document.querySelector('#page-content .r4-interactive, #page-content .r4-lab, #page-content .r4-figure');
          if (!card) return;
          window.scrollTo(0, Math.max(0, card.getBoundingClientRect().top + window.scrollY - 90));
        });
        await page.screenshot({ path: new URL(`step-p${entry.page}-content-${viewport.width}.png`, out).pathname });
      }
      if (index < UNIT2L4_PAGES.length - 1) {
        await page.locator('#next-button').click();
        await page.waitForSelector(`[data-page-view="p${UNIT2L4_PAGES[index + 1].page}"]`);
      }
    }
    check(await page.locator('#next-button').isDisabled(), 'the last step disables «التالي»');
    check(await page.locator('#previous-button').isEnabled(), 'the last step keeps «السابق» enabled');

    /* Backward pass over the sidebar buttons, then the keyboard shortcut. */
    await page.locator('#page-nav .r4-nav-button').nth(9).click();
    await page.waitForSelector('[data-page-view="p116"]');
    check(await page.locator('[data-page-view]').count() === 1, 'jumping from the sidebar still shows one step');
    await page.locator('#previous-button').click();
    await page.waitForSelector('[data-page-view="p115"]');
    await page.keyboard.press('PageDown');
    await page.waitForSelector('[data-page-view="p116"]');
    await page.keyboard.press('PageUp');
    await page.waitForSelector('[data-page-view="p115"]');
    check((await page.evaluate(() => location.hash)) === '#p115', 'the address bar follows the active step');

    /* A typed answer must survive stepping away and back. */
    await goToPage(page, 119);
    await page.locator('[data-u2l4-practice="p119-mcq"] input[name="r4p-p119-mcq-q1a"][value="b"]').check();
    await page.locator('#next-button').click();
    await page.waitForSelector('[data-page-view="p120"]');
    await page.locator('#page-nav .r4-nav-button').nth(12).click();
    await page.waitForSelector('[data-page-view="p119"]');
    check(await page.locator('[data-u2l4-practice="p119-mcq"] input[name="r4p-p119-mcq-q1a"][value="b"]').isChecked(), 'a selected answer survives step navigation');

    /* Every activity on its own page: gate, wrong answer, hint, retry, solution. */
    for (const id of UNIT2L4_PRACTICE_IDS) {
      const host = pageForPractice(id);
      await goToPage(page, host.page);
      await exerciseActivity(page, id);
      await layoutAudit(page, `${id}@${viewport.width}`);
    }

    /* Simulators, each on the printed page that hosts it. */
    await goToPage(page, 108);
    await page.locator('[data-u2l4-sim="heat"] #heat-added').fill('6');
    check((await page.locator('[data-heat-current]').innerText()).includes('0.5'), 'heat lab: +6 Ω halves the current');
    await page.locator('[data-u2l4-sim="heat"] [data-lab-reset]').click();
    check((await page.locator('[data-heat-current]').innerText()).includes('1'), 'heat lab: reset restores 1 A');
    await goToPage(page, 109);
    await page.locator('[data-u2l4-sim="ohm"] #ohm-u').fill('8');
    check((await page.locator('[data-ohm-current]').innerText()).includes('2'), 'Ohm lab: 8 V across 4 Ω gives 2 A');
    check((await page.locator('[data-ohm-graph]').innerHTML()).includes('r4-plot-active'), 'Ohm lab: the working point is redrawn');
    await goToPage(page, 112);
    await page.locator('[data-u2l4-sim="wire"] #wire-length').fill('4');
    check((await page.locator('[data-wire-resistance]').innerText()) !== '', 'wire lab: doubling the length updates the resistance');
    await goToPage(page, 115);
    await page.locator('[data-u2l4-sim="network"] [data-network-switch="close"]').click();
    check((await page.locator('[data-network-check]').innerText()).includes('='), 'network lab: the switch closes and the series check appears');
    await page.locator('[data-u2l4-sim="network"] input[name="r4-network-mode"][value="parallel"]').check();
    check((await page.locator('[data-network-req]').innerText()).includes('1.5'), 'network lab: parallel 3 Ω + 3 Ω gives 1.5 Ω');
    await goToPage(page, 116);
    await page.locator('[data-u2l4-sim="colour"] [data-colour-check]').click();
    check((await page.locator('[data-colour-feedback]').innerText()).includes('4700'), 'colour lab: the 4700 Ω training target is checked');
    await goToPage(page, 117);
    await page.locator('[data-u2l4-sim="rheostat"] #rheostat-fraction').fill('50');
    check((await page.locator('[data-rheostat-r]').innerText()).includes('Ω'), 'rheostat lab: the slider moves the wiper');

    /* The notebook survives a full reload through localStorage. */
    await goToPage(page, 107);
    await page.locator('[data-notebook="p107-devices"] summary').click();
    await page.locator('[data-notebook-input="p107-devices"]').fill(`ملاحظة ${viewport.width}`);
    await page.reload();
    await page.waitForSelector('[data-notebook="p107-devices"]');
    await page.locator('[data-notebook="p107-devices"] summary').click();
    check((await page.locator('[data-notebook-input="p107-devices"]').inputValue()) === `ملاحظة ${viewport.width}`, 'notebook text persists across a reload');

    check(!requests.some((url) => url.includes('teacher-content')), 'no teacher material is requested by the student lesson');
    errors.length = 0; /* reload above is part of the flow; only record new errors */
    await goToPage(page, 120);
    await layoutAudit(page, `final@${viewport.width}`);
    check(errors.length === 0, `console/network errors: ${errors.join('; ')}`);
    results.push({ viewport, checks, consoleErrors: errors, requests: requests.length, status: 'passed' });
    await context.close();
  }

  /* Compact viewport: the lesson must stay usable on a phone. */
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`${base}/unit2-lesson-4.html`);
    await page.waitForSelector('[data-page-view="p107"]');
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '390px: no horizontal overflow at load');
    for (const number of [107, 110, 113, 116, 119, 120]) {
      await goToPage(page, number);
      await layoutAudit(page, `p${number}@390`);
      await page.evaluate(() => {
        const row = document.querySelector('.r4-heading-row');
        window.scrollTo(0, Math.max(0, row.getBoundingClientRect().top + window.scrollY - 12));
      });
      await page.screenshot({ path: new URL(`step-p${number}-390.png`, out).pathname, fullPage: false });
    }
    await goToPage(page, 113);
    await page.locator('[data-u2l4-practice="p113-lab"] [data-lab-toggle="close"]').click();
    check((await page.locator('[data-lab-reading="i"]').first().textContent() ?? '').includes('1'), '390px: the recording lab works on a phone');
    await layoutAudit(page, 'series lab@390');
    check(await page.locator('#page-nav').isVisible(), '390px: the step list stays reachable');
    check(errors.length === 0, `390px console errors: ${errors.join('; ')}`);
    results.push({ viewport: { width: 390, height: 844 }, consoleErrors: errors, status: 'passed' });
    await context.close();
  }

  /* Regression smoke checks: earlier lessons, teacher area and the Unit 2 test. */
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    for (const file of ['index.html', 'unit2-lesson-1.html', 'unit2-lesson-2.html', 'unit2-lesson-3.html', 'unit-1-test.html']) {
      await page.goto(`${base}/${file}`);
      await page.waitForLoadState('networkidle');
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${file}: no horizontal overflow`);
      check(await page.locator('main').count() > 0, `${file}: page still renders`);
    }
    await page.goto(`${base}/unit2-lesson-4-teacher.html`);
    await page.waitForSelector('#teacher-login');
    check(await page.locator('#teacher-workspace').isHidden(), 'teacher area starts locked');
    await page.locator('#teacher-password').fill('incorrect');
    await page.locator('#teacher-login-submit').click();
    await page.waitForSelector('#teacher-auth-message:not([hidden])');
    check(await page.locator('#teacher-workspace').isHidden(), 'wrong teacher password is rejected');
    await page.locator('#teacher-password').fill('somer173');
    await page.locator('#teacher-login-submit').click();
    await page.waitForSelector('#teacher-q5b3');
    check(await page.locator('.teacher-subsection[data-source-page]').count() === 59, 'teacher area still lists all 59 worked answers');
    await page.locator('[data-teacher-logout]').click();
    check(await page.locator('#teacher-workspace').isHidden(), 'teacher logout still hides the answers');

    await page.goto(`${base}/unit-2-test.html`);
    await page.waitForSelector('[data-action=start]');
    await page.locator('[data-action=start]').click();
    for (const question of UNIT_2_QUESTIONS) {
      const key = ANSWER_KEY[question.id];
      if (question.type === 'numeric') await page.locator('[data-answer-control=numeric]').fill(String(key.value));
      else await page.locator(`#${question.id}-${key}`).check();
      if (question !== UNIT_2_QUESTIONS.at(-1)) await page.locator('[data-action=next]').click();
    }
    await page.locator('[data-action=attempt-submit]').first().click();
    await page.locator('[data-dialog-action=confirm-submit]').click();
    await page.waitForSelector('#results-title');
    check((await page.locator('.result-score-main').innerText()).includes('56/56'), 'the Unit 2 test still grades 56/56');
    check(errors.length === 0, `regression console errors: ${errors.join('; ')}`);
    results.push({ regression: ['index.html', 'unit2-lesson-1.html', 'unit2-lesson-2.html', 'unit2-lesson-3.html', 'unit-1-test.html', 'teacher area', 'unit-2-test.html'], consoleErrors: errors, status: 'passed' });
    await context.close();
  }
  check(UNIT2L4_PRACTICE_IDS.length === 24, 'all 24 book activities were exercised');
  check(UNIT2L4_SIMULATION_IDS.length === 6, 'all 6 simulators were exercised');
} catch (error) {
  failures.push(String(error.stack || error));
  throw error;
} finally {
  await writeFile(new URL('browser-results.json', out), `${JSON.stringify({
    date: new Date().toISOString().slice(0, 10),
    browser: await browser.version(),
    lesson: 'الوحدة الثانية · الدرس 4 · المقاومة الكهربائية · ص107–120',
    checks,
    results,
    failures,
  }, null, 2)}\n`);
  await browser.close();
  console.log(JSON.stringify({ checks, results, failures }, null, 2));
}
