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
// It exercises the ten interactive activities (pp98–106 quizzes, labs, blanks),
// the lab meters with their open-switch EMF behaviour, the answer-reveal rules
// (no key before an attempt, hints without reveals, locked solutions), reset
// scoping, the voltage-split calculator, the converter and water analogy, the
// teacher gate, and the lesson-test boot, at 1366×768, 1440×900 and 390×844,
// writing screenshots to docs/qa/unit2-lesson3/.
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
    const goStation = async (id) => {
      await page.evaluate((target) => document.querySelector(`[data-lesson-station="${target}"]`)?.scrollIntoView({ block: 'start' }), id);
      await page.waitForTimeout(120);
    };

    await page.goto(`${base}/unit2-lesson-3.html`);
    await page.waitForSelector('[data-u2l3-practice="p98-observe"]');
    await page.evaluate(() => document.fonts.ready);
    check(await page.locator('[data-u2l3-practice]').count() === 10, 'all ten practice activities mounted');
    check(!requested.some((url) => url.includes('unit2-lesson3-answers')), 'no answers requested before any attempt');
    await overflow('opening');
    await page.screenshot({ path: new URL(`student-${viewport.width}.png`, out).pathname });

    /* Station navigation + progress. */
    const stationLink = page.locator('[data-station-link="measure"]');
    await stationLink.click();
    await page.waitForTimeout(200);
    check((await stationLink.getAttribute('aria-current')) === 'step', 'station link marks current step');
    const progressText = await page.locator('#station-progress-value').innerText();
    check(/%$/.test(progressText.trim()), `progress percent visible: ${progressText}`);

    /* p105 MCQ: lock, completion gate, wrong→hint (no reveal), correct→solution. */
    const mcq = page.locator('[data-u2l3-practice="p105-mcq"]');
    await mcq.scrollIntoViewIfNeeded();
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

    /* p98 observation quiz. */
    const observe = page.locator('[data-u2l3-practice="p98-observe"]');
    await observe.scrollIntoViewIfNeeded();
    for (const [name, value] of [['levels-1', 'equal'], ['levels-2', 'a-higher'], ['flow-2', 'high-to-low'], ['charges', 'transfer']]) {
      await observe.locator(`input[name="p3p-${name}"][value="${value}"]`).check();
    }
    await observe.locator('[data-p3p-action="check"]').click();
    await waitGraded(observe);
    check((await feedbackKind(observe)) === 'correct', 'p98 observation quiz accepted');

    /* p99 six-question quiz: one wrong item among correct ones yields a hint, not a key. */
    const think = page.locator('[data-u2l3-practice="p99-think"]');
    await think.scrollIntoViewIfNeeded();
    for (const [name, value] of [
      ['pump-role', 'drives'], ['pump-amount', 'same'], ['water-cause', 'tube-size'],
      ['generator-role', 'energizes'], ['generator-amount', 'no-change'], ['charge-cause', 'potential-diff'],
    ]) await think.locator(`input[name="p3p-${name}"][value="${value}"]`).check();
    await think.locator('[data-p3p-action="check"]').click();
    await waitGraded(think);
    check((await feedbackKind(think)) === 'incorrect', 'p99 catches the single wrong answer');
    check((await think.locator('[data-p3p-score]').innerText()).includes('5 / 6'), 'p99 partial score 5 / 6');
    const perItemText = await think.locator('[data-p3p-item="water-cause"] [data-p3p-item-feedback]').innerText();
    check(perItemText.includes('مراجعة'), 'wrong p99 item flagged without a key');

    /* p100 live lab: open/close behaviour then observations. */
    const dipole = page.locator('[data-u2l3-practice="p100-lab"]');
    await dipole.scrollIntoViewIfNeeded();
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
    const seriesLab = page.locator('[data-u2l3-practice="p101-series-lab"]');
    await seriesLab.scrollIntoViewIfNeeded();
    await seriesLab.locator('[data-lab-record="u"]').fill('8');
    await seriesLab.locator('[data-p3p-action="check"]').click();
    await waitGraded(seriesLab);
    check((await feedbackKind(seriesLab)) === 'error', 'series lab refuses grading before closing the switch');
    await seriesLab.locator('[data-lab-source]').selectOption('8');
    await seriesLab.locator('[data-lab-toggle="close"]').click();
    check((await seriesLab.locator('[data-lab-reading="u"]').textContent()) === '8 V', 'series: U reads the source');
    check((await seriesLab.locator('[data-lab-reading="u1"]').textContent()) === '4 V', 'series: U1 reads the equal share');
    check((await seriesLab.locator('[data-lab-reading="u2"]').textContent()) === '4 V', 'series: U2 reads the equal share');
    await seriesLab.locator('[data-lab-record="u"]').fill('8');
    await seriesLab.locator('[data-lab-record="u1"]').fill('4');
    await seriesLab.locator('[data-lab-record="u2"]').fill('5');
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
    check((await seriesLab.locator('[data-lab-reading="u"]').textContent()) === '6 V', 'series reset restores the default 6 V source reading');
    check((await seriesLab.locator('[data-lab-reading="u1"]').textContent()) === '0 V', 'series reset zeroes the lamp meters');
    check((await seriesLab.locator('[data-lab-record="u"]').inputValue()) === '', 'series reset clears only its own records');
    check((await feedbackKind(mcq)) === 'correct', 'the MCQ activity keeps its own result after the lab reset');

    /* p102 numeric activity then parallel lab. */
    const seriesActivity = page.locator('[data-u2l3-practice="p102-series-activity"]');
    await seriesActivity.scrollIntoViewIfNeeded();
    await seriesActivity.locator('[data-p3p-numeric="u1"]').fill('6');
    await seriesActivity.locator('[data-p3p-action="check"]').click();
    await waitGraded(seriesActivity);
    check((await feedbackKind(seriesActivity)) === 'incorrect', '6 V rejected for U1 = 12 − 5');
    await seriesActivity.locator('[data-p3p-numeric="u1"]').fill('7');
    await seriesActivity.locator('[data-p3p-action="check"]').click();
    await waitGraded(seriesActivity);
    check((await feedbackKind(seriesActivity)) === 'correct', '7 V accepted for the p102 series activity');

    const parallelLab = page.locator('[data-u2l3-practice="p102-parallel-lab"]');
    await parallelLab.scrollIntoViewIfNeeded();
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
    await page.screenshot({ path: new URL(`labs-${viewport.width}.png`, out).pathname });

    /* p103 parallel activity + voltage-split calculator states. */
    const parallelActivity = page.locator('[data-u2l3-practice="p103-parallel-activity"]');
    await parallelActivity.scrollIntoViewIfNeeded();
    await parallelActivity.locator('[data-p3p-numeric="branch-1"]').fill('6');
    await parallelActivity.locator('[data-p3p-numeric="branch-2"]').fill('6');
    await parallelActivity.locator('[data-p3p-action="check"]').click();
    await waitGraded(parallelActivity);
    check((await feedbackKind(parallelActivity)) === 'correct', 'p103 parallel activity accepted');

    const split = page.locator('[data-u2l3-sim="voltage-split"]');
    const splitInitial = await split.locator('[data-voltage-result]').innerText();
    check(!splitInitial.includes('7 V'), 'voltage split starts without a computed answer');
    await split.locator('[data-voltage-calculate]').click();
    check((await split.locator('[data-voltage-result]').innerText()).includes('= 7 V'), 'explicit calculate yields 12 − 5 = 7 V');
    await split.locator('[data-voltage-mode]').selectOption('parallel');
    check(await split.locator('[data-known-voltage]').isDisabled(), 'known value disabled in parallel mode');
    await split.locator('[data-voltage-calculate]').click();
    check((await split.locator('[data-voltage-result]').innerText()).includes('U₁ = U₂ = 12 V'), 'parallel calculation states the equality');
    await split.locator('[data-voltage-reset]').click();
    check((await split.locator('[data-total-voltage]').inputValue()) === '12', 'calculator reset restores the book values');

    /* Converter + water analogy + quick practice (no answer reveal). */
    const converter = page.locator('[data-u2l3-sim="conversion"]');
    await converter.locator('[data-convert-from]').selectOption('kV');
    await converter.locator('[data-convert-to]').selectOption('V');
    await converter.locator('[data-convert-submit]').click();
    check((await converter.locator('[data-convert-result]').innerText()).includes('700 V'), '0.7 kV converts to 700 V');

    const water = page.locator('[data-u2l3-sim="water-flow"]');
    await water.locator('[data-water-level="b"]').fill('9');
    await water.locator('[data-water-tap="open"]').click();
    check((await water.locator('[data-water-status]').innerText()).includes('(ب)'), 'water runs from the higher vessel (b) toward (a)');

    const quick = page.locator('[data-u2l3-sim="quick-practice"]');
    await quick.locator('[data-practice-series]').fill('13');
    await quick.locator('[data-practice-topology]').selectOption('series');
    await quick.locator('[data-practice-meter]').selectOption('true');
    await quick.locator('[data-practice-submit]').click();
    const quickResult = await quick.locator('[data-practice-result]').innerText();
    check(quickResult.includes('0 من 3'), 'quick practice reports all three wrong');
    check(!quickResult.includes('11') && !quickResult.includes('الإجابة الصحيحة'), 'quick practice never reveals the correct values on a wrong attempt');

    /* p106 blanks: variant spellings accepted, model sentence shown. */
    const blanks = page.locator('[data-u2l3-practice="p106-blanks"]');
    await blanks.scrollIntoViewIfNeeded();
    for (const [id, value] of [
      ['blank-1a', 'فرق الجهد'], ['blank-1b', 'البطارية'], ['blank-2a', 'المرتفع'], ['blank-2b', 'المنخفض'],
      ['blank-3', 'التوازي'], ['blank-4a', 'مجموع'], ['blank-4b', 'الجزئية'],
    ]) await blanks.locator(`[data-p3p-blank="${id}"]`).fill(value);
    await blanks.locator('[data-p3p-action="check"]').click();
    await waitGraded(blanks);
    check((await feedbackKind(blanks)) === 'correct', 'p106 blanks accept documented equivalent wording');
    check((await blanks.locator('[data-p3p-score]').innerText()).includes('7 / 7'), 'p106 score 7 / 7');

    await overflow('student-page');
    check((await page.locator('.katex-error').count()) === 0, 'no KaTeX errors');
    check(!requested.some((url) => url.includes('teacher-content')), 'no teacher material requested by the student page');
    check(errors.length === 0, `console/network errors: ${errors.join(' | ')}`);
    await page.screenshot({ path: new URL(`complete-${viewport.width}.png`, out).pathname, fullPage: false });

    /* Teacher gate. */
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

    /* Lesson test boot (engine pattern smoke). */
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
