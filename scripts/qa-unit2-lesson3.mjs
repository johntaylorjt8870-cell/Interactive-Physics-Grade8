// Optional real-browser QA for Unit 2 Lesson 3 (pp97–106), in the same shape as
// scripts/qa-unit2-lesson2.mjs and scripts/qa-unit2-lesson4.mjs: install
// playwright-core and @sparticuz/chromium outside the repository, point
// QA_MODULE_DIR at that node_modules, and serve the production build on
// QA_BASE_URL (default http://127.0.0.1:4173).
//
//   npm run build
//   python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
//   QA_MODULE_DIR=/path/to/qa/node_modules node scripts/qa-unit2-lesson3.mjs
//
// It walks the ten study steps with «السابق» / «التالي» and the step list, checks
// that only the active book page is rendered, then exercises the ten interactive
// activities (pp98–106 quizzes, labs, blanks), the lab meters with their
// open-switch EMF behaviour, the answer-reveal rules (no key before an attempt,
// hints without reveals, locked solutions), reset scoping, the voltage-split
// calculator, the converter and water analogy, the teacher gate, and the
// lesson-test boot, at 1366×768, 1440×900 and 390×844, writing screenshots to
// docs/qa/unit2-lesson3/.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(process.env.QA_MODULE_DIR ? `${process.env.QA_MODULE_DIR}/qa-entry.cjs` : import.meta.url);
const { chromium: pw } = require('playwright-core');
const Chrome = (await import(require.resolve('@sparticuz/chromium'))).default;
/* Sandboxes without system NSS can point QA_CHROMIUM_PATH/LD_LIBRARY_PATH at a
   prepared runtime; otherwise the bundled @sparticuz/chromium binary is used. */
const launchEnv = {};
for (const key of ['LD_LIBRARY_PATH', 'LD_PRELOAD', 'FONTCONFIG_PATH']) if (process.env[key]) launchEnv[key] = process.env[key];
const browser = await pw.launch({
  executablePath: process.env.QA_CHROMIUM_PATH || (await Chrome.executablePath()),
  args: Chrome.args.filter((arg) => !['--single-process', '--disable-web-security', '--allow-running-insecure-content'].includes(arg)),
  headless: true,
  env: launchEnv,
});
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const out = new URL('../docs/qa/unit2-lesson3/', import.meta.url);
await mkdir(out, { recursive: true });

const results = [];
let checks = 0;
const failures = [];
const check = (condition, message) => {
  checks += 1;
  if (!condition) failures.push(message);
  assert.ok(condition, message);
};

/* The approved course order: one study step per printed page of pp97–106. */
const STEP_PAGES = [97, 98, 99, 100, 101, 102, 103, 104, 105, 106];
const HEADINGS = {
  97: 'تمهيد: فرق الكمون الكهربائي', 98: 'من فرق الارتفاع إلى فرق الكمون', 99: 'دور المولد في الدارة الكهربائية',
  100: 'ثنائي القطب الفعال وغير الفعال', 101: 'فرق الكمون في دارة متسلسلة', 102: 'فرق الكمون في دارة متفرعة',
  103: 'تطبيق التفرع ومهمة البحث', 104: 'خلاصة الدرس: تعلمت', 105: 'اختبر نفسي: السؤالان الأول والثاني',
  106: 'اختبر نفسي: السؤال الثالث',
};

try {
  for (const viewport of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    const requested = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', (request) => requested.push(request.url()));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`Error ${response.status()}: ${response.url()}`); });
    page.on('requestfailed', (request) => errors.push(`${request.failure()?.errorText} ${request.url()}`));

    const overflow = async (label) => {
      const size = await page.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }));
      check(size.scrollWidth <= size.innerWidth + 1, `${label}: unintended horizontal scroll ${JSON.stringify(size)}`);
    };
    const feedbackKind = async (scope) => scope.locator('[data-p3p-feedback]').getAttribute('data-kind');
    const waitGraded = async (scope) => {
      await scope.locator('[data-p3p-feedback][data-kind]').first().waitFor({ timeout: 15000 });
      await page.waitForTimeout(60);
    };
    const state = async () => page.evaluate(() => ({
      badge: document.querySelector('#page-number').textContent.trim(),
      heading: document.querySelector('#page-heading').textContent.trim(),
      center: document.querySelector('#control-center').textContent.trim(),
      progress: document.querySelector('#progress-text').textContent.trim(),
      now: document.querySelector('#progress-track').getAttribute('aria-valuenow'),
      max: document.querySelector('#progress-track').getAttribute('aria-valuemax'),
      fill: document.querySelector('#progress-fill').style.width,
      previousDisabled: document.querySelector('#previous-button').disabled,
      nextDisabled: document.querySelector('#next-button').disabled,
      previousLabel: document.querySelector('#previous-label').textContent.trim(),
      nextLabel: document.querySelector('#next-label').textContent.trim(),
      views: [...document.querySelectorAll('#page-content [data-page-view]')].map((node) => node.dataset.pageView),
      current: [...document.querySelectorAll('#page-nav [aria-current="step"]')].map((node) => node.textContent.trim()),
      steps: document.querySelectorAll('#page-nav button').length,
      bookCopies: [...document.querySelectorAll('#page-content [data-book-copy]')].map((node) => node.dataset.bookCopy),
      activities: document.querySelectorAll('#page-content [data-u2l3-practice]').length,
      simulations: document.querySelectorAll('#page-content [data-u2l3-sim]').length,
      figures: document.querySelectorAll('#page-content figure.p3-figure').length,
      katexErrors: document.querySelectorAll('.katex-error').length,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    /* Move to a step by its printed page number, through the sidebar list. */
    const gotoStep = async (pageNumber) => {
      await page.locator('#page-nav button').nth(STEP_PAGES.indexOf(pageNumber)).click();
      await page.waitForTimeout(140);
    };
    const expectStep = async (pageNumber, label) => {
      const snapshot = await state();
      check(snapshot.badge === String(pageNumber), `${label}: book page ${pageNumber}, got ${snapshot.badge}`);
      check(snapshot.heading === HEADINGS[pageNumber], `${label}: heading «${HEADINGS[pageNumber]}», got «${snapshot.heading}»`);
      check(snapshot.views.length === 1 && snapshot.views[0] === `p${pageNumber}`, `${label}: exactly one rendered step (#page-content holds ${JSON.stringify(snapshot.views)})`);
      check(snapshot.bookCopies.every((copy) => copy === `p${pageNumber}`), `${label}: only p${pageNumber} book copy is on screen`);
      check(snapshot.current.length === 1, `${label}: exactly one current step in the list`);
      check(snapshot.max === String(STEP_PAGES.length), `${label}: progress maximum is ${STEP_PAGES.length}`);
      check(snapshot.now === String(STEP_PAGES.indexOf(pageNumber) + 1), `${label}: progress value ${STEP_PAGES.indexOf(pageNumber) + 1}`);
      check(snapshot.progress === `${STEP_PAGES.indexOf(pageNumber) + 1} / ${STEP_PAGES.length}`, `${label}: progress text`);
      check(snapshot.fill === `${Math.round(((STEP_PAGES.indexOf(pageNumber) + 1) / STEP_PAGES.length) * 100)}%`, `${label}: progress bar width`);
      check(snapshot.center === `الخطوة ${STEP_PAGES.indexOf(pageNumber) + 1} من ${STEP_PAGES.length} · صفحة ${pageNumber}`, `${label}: control centre «${snapshot.center}»`);
      check(snapshot.previousDisabled === (pageNumber === STEP_PAGES[0]), `${label}: previous button state`);
      check(snapshot.nextDisabled === (pageNumber === STEP_PAGES.at(-1)), `${label}: next button state`);
      check(snapshot.katexErrors === 0, `${label}: no KaTeX errors`);
      await overflow(label);
      return snapshot;
    };

    await page.goto(`${base}/unit2-lesson-3.html`);
    await page.waitForSelector('[data-u2l3-practice="p98-observe"]', { state: 'detached' }).catch(() => {});
    await page.waitForSelector('#page-content [data-page-view]');
    await page.evaluate(() => document.fonts.ready);

    /* 1. Opening step: one book page, ten steps in the list, no early answers. */
    const opening = await expectStep(97, 'opening');
    check(opening.steps === 10, `the step list holds ten steps, got ${opening.steps}`);
    check(opening.previousLabel === 'بداية الدرس', `first previous label: ${opening.previousLabel}`);
    check(opening.nextLabel === 'منسوب الماء والشحنات', `next label previews the following step: ${opening.nextLabel}`);
    check(opening.simulations === 1, 'p97 carries the kV/V converter');
    check(opening.figures === 1, 'p97 shows the daily-devices figure');
    check(!requested.some((url) => url.includes('unit2-lesson3-answers')), 'no answers requested before any attempt');
    check(!requested.some((url) => url.includes('teacher-content')), 'no teacher material requested by the student page');
    await page.screenshot({ path: new URL(`student-${viewport.width}.png`, out).pathname });

    /* 2. Walk every step forward with «التالي», verifying the single-step contract. */
    for (const pageNumber of STEP_PAGES.slice(1)) {
      await page.locator('#next-button').click();
      await page.waitForTimeout(140);
      const snapshot = await expectStep(pageNumber, `next → p${pageNumber}`);
      if ([98, 101, 105, 106].includes(pageNumber)) {
        await page.screenshot({ path: new URL(`step-${pageNumber}-${viewport.width}.png`, out).pathname });
      }
      if (pageNumber === STEP_PAGES.at(-1)) {
        check(snapshot.nextLabel === 'نهاية الدرس', `last next label: ${snapshot.nextLabel}`);
        await page.locator('#next-button').click({ force: true }).catch(() => {});
        check((await state()).badge === '106', 'the last step cannot advance further');
      }
    }

    /* The previous/next controls and the progress bar at the end of a step. */
    await gotoStep(102);
    await page.evaluate(() => document.querySelector('.lesson-controls').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForTimeout(160);
    const controlsBefore = await state();
    await page.screenshot({ path: new URL(`controls-${viewport.width}.png`, out).pathname });
    check(controlsBefore.nextLabel === 'تطبيق وبحث' && controlsBefore.previousLabel === 'دارة التسلسل', 'the controls preview the neighbouring steps');
    await page.locator('#next-button').click();
    await page.waitForTimeout(140);
    await expectStep(103, 'controls → p103');
    await page.locator('#previous-button').click();
    await page.waitForTimeout(140);
    await expectStep(102, 'controls → p102');

    /* 3. Walk back with «السابق», then jump with the step list. */
    await gotoStep(STEP_PAGES.at(-1));
    for (const pageNumber of STEP_PAGES.slice(0, -1).reverse()) {
      await page.locator('#previous-button').click();
      await page.waitForTimeout(120);
      const snapshot = await state();
      check(snapshot.badge === String(pageNumber), `previous → p${pageNumber}, got ${snapshot.badge}`);
      check(snapshot.views.length === 1 && snapshot.views[0] === `p${pageNumber}`, `previous → p${pageNumber}: single step`);
      if (pageNumber === STEP_PAGES[0]) check(snapshot.previousLabel === 'بداية الدرس', 'first previous label after walking back');
    }
    const firstBackState = await state();
    check(firstBackState.progress === '1 / 10', `progress returns to the first step: ${firstBackState.progress}`);
    await page.locator('#previous-button').click({ force: true }).catch(() => {});
    check((await state()).badge === '97', 'the first step cannot go back further');

    await gotoStep(101);
    const jumped = await state();
    check(jumped.badge === '101' && jumped.current.length === 1, 'the step list jumps straight to a page');
    check(jumped.current[0].includes('101'), `the current step is marked in the list: ${jumped.current[0]}`);

    /* 4. Keyboard paging (PageDown / PageUp) keeps the same step contract. */
    await page.evaluate(() => document.body.focus());
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(160);
    check((await state()).badge === '102', 'PageDown moves to the next step');
    await page.keyboard.press('PageUp');
    await page.waitForTimeout(160);
    check((await state()).badge === '101', 'PageUp moves to the previous step');

    /* 5. Activities, each on its own step. */
    /* p98 observation quiz. */
    await gotoStep(98);
    const observe = page.locator('[data-u2l3-practice="p98-observe"]');
    check(await observe.isVisible(), 'p98 activity is mounted on its own step');
    for (const [name, value] of [['levels-1', 'equal'], ['levels-2', 'a-higher'], ['flow-2', 'high-to-low'], ['charges', 'transfer']]) {
      await observe.locator(`input[name="p3p-${name}"][value="${value}"]`).check();
    }
    await observe.locator('[data-p3p-action="check"]').click();
    await waitGraded(observe);
    check((await feedbackKind(observe)) === 'correct', 'p98 observation quiz accepted');

    /* p99 six-question quiz: one wrong item among correct ones yields a hint, not a key. */
    await gotoStep(99);
    const think = page.locator('[data-u2l3-practice="p99-think"]');
    for (const [name, value] of [
      ['pump-role', 'drives'], ['pump-amount', 'same'], ['water-cause', 'tube-size'],
      ['generator-role', 'energizes'], ['generator-amount', 'no-change'], ['charge-cause', 'potential-diff'],
    ]) await think.locator(`input[name="p3p-${name}"][value="${value}"]`).check();
    await think.locator('[data-p3p-action="check"]').click();
    await waitGraded(think);
    check((await feedbackKind(think)) === 'incorrect', 'p99 catches the single wrong answer');
    check((await think.locator('[data-p3p-score]').innerText()).includes('5 / 6'), 'p99 partial score 5 / 6');
    await think.locator('[data-p3p-action="hint"]').click();
    await think.locator('[data-p3p-hint]:not([hidden])').waitFor();
    const thinkHint = await think.locator('[data-p3p-hint]').innerText();
    check(!thinkHint.includes('الإجابة الصحيحة هي'), 'p99 hint never reveals the key');
    check((await think.locator('[data-p3p-item="water-cause"] [data-p3p-item-feedback]').innerText()).includes('مراجعة'), 'wrong p99 item flagged without a key');

    /* p100 live lab: open/close behaviour then observations. */
    await gotoStep(100);
    const dipole = page.locator('[data-u2l3-practice="p100-lab"]');
    check((await dipole.locator('[data-lab-reading="current"]').textContent()) === '0 A', 'open switch: ammeter already reads 0 A');
    check((await dipole.locator('[data-lab-reading="source"]').textContent()) === '4.5 V', 'open switch: source voltmeter reads the EMF of the default 4.5 V');
    await dipole.locator('[data-p3p-action="check"]').click();
    await waitGraded(dipole);
    check((await feedbackKind(dipole)) === 'error', 'p100 gates grading until the switch was opened and closed');
    await dipole.locator('[data-lab-source]').selectOption('6');
    await dipole.locator('[data-lab-toggle="close"]').click();
    check((await dipole.locator('[data-lab-reading="current"]').textContent()) === '1 A', 'ammeter reads 1 A for 6 V across the 6 Ω model lamp');
    check((await dipole.locator('[data-lab-reading="lamp"]').textContent()) === '6 V', 'lamp voltmeter reads the source when closed');
    check((await dipole.locator('[data-lab-lamp="main"]').getAttribute('class')).includes('is-lit'), 'lamp lights when the loop closes');
    check(await dipole.locator('[data-lab-flow]').isVisible(), 'conventional-current arrows show when closed');
    await dipole.locator('[data-lab-toggle="open"]').click();
    check((await dipole.locator('[data-lab-reading="current"]').textContent()) === '0 A', 'opening zeroes the ammeter');
    check((await dipole.locator('[data-lab-reading="lamp"]').textContent()) === '0 V', 'opening zeroes the lamp voltmeter');
    check((await dipole.locator('[data-lab-reading="source"]').textContent()) === '6 V', 'source voltmeter stays at the EMF when open');
    for (const [name, value] of [
      ['ammeter-open', 'zero'], ['voltmeter-lamp-open', 'zero'], ['voltmeter-source-open', 'stays'], ['lamp-kind', 'passive'], ['generator-kind', 'active'],
    ]) await dipole.locator(`input[name="p3p-${name}"][value="${value}"]`).check();
    await dipole.locator('[data-p3p-action="check"]').click();
    await waitGraded(dipole);
    check((await feedbackKind(dipole)) === 'correct', 'p100 observations accepted');

    /* p101 series lab: gate, readings, record grading, relation, reset. */
    await gotoStep(101);
    const seriesLab = page.locator('[data-u2l3-practice="p101-series-lab"]');
    await seriesLab.locator('[data-lab-record="u"]').fill('8');
    await seriesLab.locator('[data-p3p-action="check"]').click();
    await waitGraded(seriesLab);
    check((await feedbackKind(seriesLab)) === 'error', 'series lab refuses grading before closing the switch');
    await seriesLab.locator('[data-lab-source]').selectOption('8');
    await seriesLab.locator('[data-lab-toggle="close"]').click();
    check((await seriesLab.locator('[data-lab-reading="u"]').textContent()) === '8 V', 'series: U reads the source');
    check((await seriesLab.locator('[data-lab-reading="u1"]').textContent()) === '4 V', 'series: U1 reads the equal share');
    check((await seriesLab.locator('[data-lab-reading="u2"]').textContent()) === '4 V', 'series: U2 reads the equal share');
    for (const [key, value] of [['u', '8'], ['u1', '4'], ['u2', '5']]) await seriesLab.locator(`[data-lab-record="${key}"]`).fill(value);
    await seriesLab.locator('input[name="p3p-relation"][value="sum"]').check();
    await seriesLab.locator('[data-p3p-action="check"]').click();
    await waitGraded(seriesLab);
    check((await seriesLab.locator('[data-p3p-score]').innerText()).includes('3 / 4'), 'one mistyped reading costs exactly one point');
    check((await feedbackKind(seriesLab)) === 'incorrect', 'series lab rejects the bad reading');
    await seriesLab.locator('[data-lab-record="u2"]').fill('4');
    await seriesLab.locator('[data-p3p-action="check"]').click();
    await waitGraded(seriesLab);
    check((await feedbackKind(seriesLab)) === 'correct', 'series lab accepts matching readings and the sum relation');
    const liveCheck = await seriesLab.locator('[data-lab-relation]').innerText();
    check(liveCheck.includes('4') && liveCheck.includes('8'), 'series live-check restates the recorded numbers');
    await seriesLab.locator('[data-p3p-action="reset"]').click();
    check((await seriesLab.locator('[data-lab-toggle="open"]').getAttribute('aria-pressed')) === 'true', 'series reset re-opens the switch');
    await gotoStep(98);
    check((await feedbackKind(observe)) === 'correct', 'the p98 result survives later steps and another lab reset');
    await gotoStep(101);
    check((await seriesLab.locator('[data-lab-reading="u"]').textContent()) === '6 V', 'series reset restores the default 6 V source reading');
    check((await seriesLab.locator('[data-lab-reading="u1"]').textContent()) === '0 V', 'series reset zeroes the lamp meters');
    check((await seriesLab.locator('[data-lab-record="u"]').inputValue()) === '', 'series reset clears only its own records');
    await page.screenshot({ path: new URL(`labs-${viewport.width}.png`, out).pathname });

    /* p102 numeric activity then parallel lab. */
    await gotoStep(102);
    check((await state()).activities === 2, 'p102 carries both the numeric activity and the parallel lab');
    const seriesActivity = page.locator('[data-u2l3-practice="p102-series-activity"]');
    await seriesActivity.locator('[data-p3p-numeric="u1"]').fill('6');
    await seriesActivity.locator('[data-p3p-action="check"]').click();
    await waitGraded(seriesActivity);
    check((await feedbackKind(seriesActivity)) === 'incorrect', '6 V rejected for U1 = 12 − 5');
    await seriesActivity.locator('[data-p3p-numeric="u1"]').fill('7');
    await seriesActivity.locator('[data-p3p-action="check"]').click();
    await waitGraded(seriesActivity);
    check((await feedbackKind(seriesActivity)) === 'correct', '7 V accepted for the p102 series activity');

    const parallelLab = page.locator('[data-u2l3-practice="p102-parallel-lab"]');
    await parallelLab.locator('[data-lab-source]').selectOption('9');
    await parallelLab.locator('[data-lab-toggle="close"]').click();
    for (const key of ['u', 'u1', 'u2']) {
      check((await parallelLab.locator(`[data-lab-reading="${key}"]`).textContent()) === '9 V', `parallel: ${key} reads 9 V`);
    }
    for (const key of ['u', 'u1', 'u2']) await parallelLab.locator(`[data-lab-record="${key}"]`).fill('9');
    await parallelLab.locator('input[name="p3p-relation"][value="equal"]').check();
    await parallelLab.locator('[data-p3p-action="check"]').click();
    await waitGraded(parallelLab);
    check((await feedbackKind(parallelLab)) === 'correct', 'parallel lab accepted with the equality relation');

    /* p103 parallel activity + voltage-split calculator states. */
    await gotoStep(103);
    const parallelActivity = page.locator('[data-u2l3-practice="p103-parallel-activity"]');
    await parallelActivity.locator('[data-p3p-numeric="branch-1"]').fill('6');
    await parallelActivity.locator('[data-p3p-numeric="branch-2"]').fill('6');
    await parallelActivity.locator('[data-p3p-action="check"]').click();
    await waitGraded(parallelActivity);
    check((await feedbackKind(parallelActivity)) === 'correct', 'p103 parallel activity accepted');

    const split = page.locator('[data-u2l3-sim="voltage-split"]');
    check(!(await split.locator('[data-voltage-result]').innerText()).includes('7 V'), 'voltage split starts without a computed answer');
    await split.locator('[data-voltage-calculate]').click();
    check((await split.locator('[data-voltage-result]').innerText()).includes('= 7 V'), 'explicit calculate yields 12 − 5 = 7 V');
    await split.locator('[data-voltage-mode]').selectOption('parallel');
    check(await split.locator('[data-known-voltage]').isDisabled(), 'known value disabled in parallel mode');
    await split.locator('[data-voltage-calculate]').click();
    check((await split.locator('[data-voltage-result]').innerText()).includes('U₁ = U₂ = 12 V'), 'parallel calculation states the equality');
    await split.locator('[data-voltage-reset]').click();
    check((await split.locator('[data-total-voltage]').inputValue()) === '12', 'calculator reset restores the book values');

    /* p104 summary step: the eight book conclusions, no activities. */
    await gotoStep(104);
    const summary = await state();
    check(summary.activities === 0 && summary.figures === 0, 'p104 is the summary step without activities');
    check((await page.locator('#page-content .p3-book-summary li').count()) === 8, 'p104 keeps all eight «تعلمت» statements');

    /* p105 MCQ: lock, completion gate, wrong→hint (no reveal), correct→solution. */
    await gotoStep(105);
    const mcq = page.locator('[data-u2l3-practice="p105-mcq"]');
    await mcq.locator('[data-p3p-action="solution"]').click();
    await waitGraded(mcq);
    check((await feedbackKind(mcq)) === 'error', 'solution locked before any attempt');
    check(await mcq.locator('[data-p3p-solution]').isHidden(), 'no solution panel before attempt');
    await mcq.locator('[data-p3p-action="check"]').click();
    await waitGraded(mcq);
    check((await feedbackKind(mcq)) === 'error', 'check without answers gated');
    for (const name of ['mcq-1', 'mcq-2', 'mcq-3', 'mcq-4']) await mcq.locator(`input[name="p3p-${name}"][value="a"]`).check();
    await mcq.locator('[data-p3p-action="check"]').click();
    await waitGraded(mcq);
    check((await feedbackKind(mcq)) === 'incorrect', 'wrong MCQ answers reported');
    check((await mcq.locator('[data-p3p-score]').innerText()).includes('0 / 4'), 'score 0 / 4 on all-wrong submission');
    await mcq.locator('[data-p3p-action="hint"]').click();
    await mcq.locator('[data-p3p-hint]:not([hidden])').waitFor();
    const hintText = await mcq.locator('[data-p3p-hint]').innerText();
    check(!/[cd]\s*·/.test(hintText) && !hintText.includes('الإجابة الصحيحة هي'), 'hint never reveals the correct option');
    check(!hintText.includes('25000'), 'hint does not hand over the conversion result');
    for (const [name, value] of [['mcq-1', 'c'], ['mcq-2', 'd'], ['mcq-3', 'b'], ['mcq-4', 'b']]) await mcq.locator(`input[name="p3p-${name}"][value="${value}"]`).check();
    await mcq.locator('[data-p3p-action="check"]').click();
    await waitGraded(mcq);
    check((await feedbackKind(mcq)) === 'correct', 'correct MCQ answers accepted');
    check((await mcq.locator('[data-p3p-score]').innerText()).includes('4 / 4'), 'score 4 / 4 when all correct');
    await mcq.locator('[data-p3p-action="solution"]').click();
    await mcq.locator('[data-p3p-solution]:not([hidden])').waitFor({ timeout: 15000 });
    check(true, 'solution opens after the attempt');

    /* p105 true/false: all four statements are false in the book's own judgement. */
    const tf = page.locator('[data-u2l3-practice="p105-true-false"]');
    for (let i = 1; i <= 4; i += 1) await tf.locator(`input[name="p3p-tf-${i}"][value="false"]`).check();
    await tf.locator('[data-p3p-action="check"]').click();
    await waitGraded(tf);
    check((await feedbackKind(tf)) === 'correct', 'true/false items all graded correct when false is chosen');
    check((await tf.locator('[data-p3p-score]').innerText()).includes('4 / 4'), 'true/false score 4 / 4');
    await page.screenshot({ path: new URL(`activities-${viewport.width}.png`, out).pathname });
    check(requested.some((url) => url.includes('unit2-lesson3-answers')), 'answers fetched lazily on first check');

    /* 6. Student state survives step changes: answer on p105, leave, come back. */
    await gotoStep(97);
    await gotoStep(106);
    await gotoStep(105);
    check(await page.locator('input[name="p3p-mcq-1"][value="c"]').isChecked(), 'the chosen MCQ option survives leaving and returning to its step');
    check((await page.locator('[data-u2l3-practice="p105-mcq"] [data-p3p-score]').innerText()).includes('4 / 4'), 'the graded score survives leaving and returning to its step');

    /* p106 blanks + quick practice (no answer reveal). */
    await gotoStep(106);
    const blanks = page.locator('[data-u2l3-practice="p106-blanks"]');
    for (const [id, value] of [
      ['blank-1a', 'فرق الجهد'], ['blank-1b', 'البطارية'], ['blank-2a', 'المرتفع'], ['blank-2b', 'المنخفض'],
      ['blank-3', 'التوازي'], ['blank-4a', 'مجموع'], ['blank-4b', 'الجزئية'],
    ]) await blanks.locator(`[data-p3p-blank="${id}"]`).fill(value);
    await blanks.locator('[data-p3p-action="check"]').click();
    await waitGraded(blanks);
    check((await feedbackKind(blanks)) === 'correct', 'p106 blanks accept documented equivalent wording');
    check((await blanks.locator('[data-p3p-score]').innerText()).includes('7 / 7'), 'p106 score 7 / 7');

    const quick = page.locator('[data-u2l3-sim="quick-practice"]');
    await quick.locator('[data-practice-series]').fill('13');
    await quick.locator('[data-practice-topology]').selectOption('series');
    await quick.locator('[data-practice-meter]').selectOption('true');
    await quick.locator('[data-practice-submit]').click();
    const quickResult = await quick.locator('[data-practice-result]').innerText();
    check(quickResult.includes('0 من 3'), 'quick practice reports all three wrong');
    check(!quickResult.includes('11') && !quickResult.includes('الإجابة الصحيحة'), 'quick practice never reveals the correct values on a wrong attempt');

    /* 7. Converter and water analogy live on their own steps. */
    await gotoStep(97);
    const converter = page.locator('[data-u2l3-sim="conversion"]');
    await converter.locator('[data-convert-from]').selectOption('kV');
    await converter.locator('[data-convert-to]').selectOption('V');
    await converter.locator('[data-convert-submit]').click();
    check((await converter.locator('[data-convert-result]').innerText()).includes('700 V'), '0.7 kV converts to 700 V');

    await gotoStep(98);
    const water = page.locator('[data-u2l3-sim="water-flow"]');
    await water.locator('[data-water-level="b"]').fill('9');
    await water.locator('[data-water-tap="open"]').click();
    check((await water.locator('[data-water-status]').innerText()).includes('(ب)'), 'water runs from the higher vessel (b) toward (a)');

    check((await page.locator('.katex-error').count()) === 0, 'no KaTeX errors after the full walk');
    await overflow('student-page');
    check(errors.length === 0, `console/network errors: ${errors.join(' | ')}`);
    await page.screenshot({ path: new URL(`complete-${viewport.width}.png`, out).pathname });

    /* 8. Previous Unit 2 step lessons still navigate with their own controls. */
    for (const [url, firstHeading] of [
      [`${base}/unit2-lesson-1.html`, 'الكهرباء الساكنة'],
      [`${base}/unit2-lesson-2.html`, 'تمهيد الدرس: التيار الكهربائي المتواصل'],
    ]) {
      const previous = await context.newPage();
      const previousErrors = [];
      previous.on('pageerror', (error) => previousErrors.push(error.message));
      await previous.goto(url);
      await previous.waitForSelector('#page-content > *', { timeout: 20000 });
      const before = await previous.locator('#page-heading').innerText();
      check(before === firstHeading, `${url}: first step heading «${firstHeading}», got «${before}»`);
      const beforeProgress = await previous.locator('#progress-text').innerText();
      await previous.locator('#next-button').click();
      await previous.waitForTimeout(200);
      const after = await previous.locator('#page-heading').innerText();
      check(after !== before, `${url}: «التالي» shows the next step`);
      check((await previous.locator('#progress-text').innerText()) !== beforeProgress, `${url}: progress advances`);
      check(previousErrors.length === 0, `${url}: no page errors ${previousErrors.join(' | ')}`);
      await previous.close();
    }

    /* 9. Teacher gate. */
    const teacher = await context.newPage();
    const teacherRequests = [];
    teacher.on('request', (request) => teacherRequests.push(request.url()));
    await teacher.goto(`${base}/unit2-lesson-3-teacher.html`);
    await teacher.waitForSelector('#teacher-login');
    check(await teacher.locator('#teacher-workspace').isHidden(), 'teacher area locked');
    await teacher.locator('#teacher-password').fill('not-the-password');
    await teacher.locator('#teacher-login-submit').click();
    await teacher.waitForSelector('#teacher-auth-message:not([hidden])', { timeout: 20000 });
    check(await teacher.locator('#teacher-workspace').isHidden(), 'wrong password rejected');
    check(!teacherRequests.some((url) => url.includes('unit2-lesson3-teacher-content')), 'teacher content fetched only after login');
    await teacher.locator('#teacher-password').fill('somer173');
    await teacher.locator('#teacher-login-submit').click();
    await teacher.waitForSelector('#teacher-workspace:not([hidden])', { timeout: 20000 });
    check((await teacher.locator('.teacher-subsection[data-page-reference]').count()) === 10, 'teacher has one response per printed page');
    check((await teacher.locator('[data-source-page]').count()) === 10, 'teacher quotes each printed page verbatim');
    check((await teacher.locator('#teacher-workspace').innerText()).includes('مفاتيح الأنشطة التفاعلية'), 'teacher holds the interactive-activity keys');
    const teacherOverflow = await teacher.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    check(teacherOverflow.scrollWidth <= teacherOverflow.innerWidth + 1, 'teacher: unintended horizontal scroll');
    await teacher.screenshot({ path: new URL(`teacher-${viewport.width}.png`, out).pathname });
    await teacher.locator('[data-teacher-logout]').click();
    check(await teacher.locator('#teacher-workspace').isHidden(), 'logout hides the solutions');
    await teacher.close();

    /* 10. Lesson test boot (engine pattern smoke). */
    const quiz = await context.newPage();
    quiz.on('pageerror', (error) => errors.push(`test-page: ${error.message}`));
    await quiz.goto(`${base}/unit2-lesson-3-test.html`);
    await quiz.waitForSelector('#assessment-root [data-action="start"]');
    await quiz.locator('[data-action="start"]').click();
    const heading = quiz.locator('#question-heading');
    await heading.waitFor({ timeout: 15000 });
    check(await heading.innerText() !== '', 'question surface opened');
    check(/السؤال/.test(await heading.innerText()), 'Arabic question heading rendered');
    await quiz.locator('#assessment-root input[type="radio"]').first().check();
    await quiz.locator('[data-action="next"]').click();
    await quiz.waitForFunction(() => document.querySelectorAll('#assessment-root [aria-label*="تمت الإجابة"]').length >= 1, { timeout: 15000 });
    check(true, 'answered marker appears in the navigator after answering q1');
    check(errors.filter((line) => line.startsWith('test-page:')).length === 0, 'no errors on the test page boot');
    await quiz.close();

    await context.close();
    results.push({ viewport, checks, failures: [...failures] });
  }
} finally {
  await browser.close();
  await writeFile(new URL('browser-results.json', out), `${JSON.stringify({ base, checks, failures, results }, null, 2)}\n`);
}

console.log(`Unit 2 Lesson 3 browser QA passed: ${checks} checks.`);
