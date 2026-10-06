import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LESSON_PAGES, PYTHAGORAS_LINES, pageTextBlocks } from '../src/lesson-content.js';
import { mountTeacherArea } from '../src/teacher-area.js';
import { verifyTeacherPassword } from '../src/teacher-auth.js';
import { renderTeacherContent } from '../src/teacher-content.js';
import { V_F, V_F1, V_F2, V_F3, V_OM, V_OX, V_OY } from '../src/math.js';

const page = (number) => LESSON_PAGES.find((item) => item.page === number);
const teacherMarkup = renderTeacherContent();
const TEACHER_PASSPHRASE = 'somer173';
const RETIRED_TEACHER_PASSPHRASE = 'Teacher-L1-55-62!';

class FakeElement {
  constructor() {
    this.value = '';
    this.hidden = false;
    this.disabled = false;
    this.innerHTML = '';
    this.textContent = '';
    this.attributes = new Map();
    this.listeners = new Map();
    this.queries = new Map();
    this.focused = false;
    this.selected = false;
  }
  addEventListener(name, callback) { this.listeners.set(name, callback); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  querySelector(selector) { return this.queries.get(selector) ?? null; }
  replaceChildren() { this.innerHTML = ''; }
  focus() { this.focused = true; }
  select() { this.selected = true; }
  async submit() {
    const callback = this.listeners.get('submit');
    assert.ok(callback, 'submit listener is registered');
    return callback({ preventDefault() { this.prevented = true; } });
  }
  async click() {
    const callback = this.listeners.get('click');
    assert.ok(callback, 'click listener is registered');
    return callback({ preventDefault() {} });
  }
}

function fakeGate(verifyPassword, loadContent) {
  const form = new FakeElement();
  const passwordInput = new FakeElement();
  const feedback = new FakeElement();
  const workspace = new FakeElement();
  const submitButton = new FakeElement();
  const logoutButton = new FakeElement();
  const heading = new FakeElement();
  workspace.queries.set('[data-teacher-logout]', logoutButton);
  workspace.queries.set('#teacher-workspace-heading', heading);
  mountTeacherArea({ form, passwordInput, feedback, workspace, submitButton, verifyPassword, loadContent });
  return { form, passwordInput, feedback, workspace, submitButton, logoutButton, heading };
}

test('Teacher Area is a separate accessible page with a password gate and hidden workspace', async () => {
  const [studentPage, teacherPage, studentEntry, teacherBootstrap] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../teacher.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/teacher.js', import.meta.url), 'utf8'),
  ]);

  assert.match(studentPage, /href="\.\/teacher\.html"[^>]*>منطقة المعلم/);
  assert.match(teacherPage, /<title>منطقة المعلم — القوى المتلاقية<\/title>/);
  assert.match(teacherPage, /type="password"[^>]*autocomplete="current-password"/);
  assert.match(teacherPage, /id="teacher-auth-message"[^>]*role="alert"/);
  assert.match(teacherPage, /id="teacher-workspace"[^>]*hidden/);
  assert.match(teacherPage, /src="\.\/src\/teacher\.js"/);
  assert.match(teacherBootstrap, /loadContent: \(\) => import\('\.\/teacher-content\.js'\)/);
  assert.doesNotMatch(studentEntry, /teacher-content\.js|teacher-auth\.js/);
  assert.doesNotMatch(studentPage, /Teacher-L1-55-62!|2069af38a374c2af|somer173|b767bb650abe5563/);
  assert.doesNotMatch(teacherPage, /Teacher-L1-55-62!|2069af38a374c2af|somer173|b767bb650abe5563/);
  assert.doesNotMatch(studentPage, /حل المسألة الأولى|قوة الموازنة.*15 N/);
});

test('the retired teacher passphrase is gone from the verifier and no longer unlocks', async () => {
  const authSource = await readFile(new URL('../src/teacher-auth.js', import.meta.url), 'utf8');
  assert.doesNotMatch(authSource, /Teacher-L1-55-62!/);
  assert.doesNotMatch(authSource, /2069af38a374c2af211e05a30a7549bfa4fc09985886f07c99edbbe7829e3abc/);
  assert.equal(await verifyTeacherPassword(RETIRED_TEACHER_PASSPHRASE), false);
  assert.equal(await verifyTeacherPassword(TEACHER_PASSPHRASE), true);
});

test('incorrect password keeps teacher content unloaded and leaves the workspace locked', async () => {
  let loadCount = 0;
  const gate = fakeGate(
    async (candidate) => candidate === TEACHER_PASSPHRASE,
    async () => { loadCount += 1; return { renderTeacherContent: () => '<p>private teacher material</p>' }; },
  );

  assert.equal(gate.workspace.hidden, true);
  gate.passwordInput.value = 'incorrect';
  await gate.form.submit();

  assert.equal(loadCount, 0);
  assert.equal(gate.form.hidden, false);
  assert.equal(gate.workspace.hidden, true);
  assert.match(gate.feedback.textContent, /غير صحيحة/);
  assert.equal(gate.feedback.hidden, false);
  assert.equal(gate.passwordInput.selected, true);
  assert.equal(gate.submitButton.disabled, false);
  assert.equal(gate.form.attributes.get('aria-busy'), 'false');
});

test('PBKDF2 verifier accepts the configured teacher passphrase and rejects a wrong one', async () => {
  assert.equal(await verifyTeacherPassword(TEACHER_PASSPHRASE), true);
  assert.equal(await verifyTeacherPassword('not-the-teacher-passphrase'), false);
  assert.equal(await verifyTeacherPassword(null), false);
});

test('authorized access loads teacher-only content, clears the password, and supports logout', async () => {
  let loadCount = 0;
  const gate = fakeGate(
    verifyTeacherPassword,
    async () => {
      loadCount += 1;
      return import('../src/teacher-content.js');
    },
  );
  gate.passwordInput.value = TEACHER_PASSPHRASE;
  await gate.form.submit();

  assert.equal(loadCount, 1);
  assert.equal(gate.workspace.hidden, false);
  assert.equal(gate.workspace.innerHTML, teacherMarkup);
  assert.equal(gate.form.hidden, true);
  assert.equal(gate.passwordInput.value, '');
  assert.equal(gate.heading.focused, true);
  assert.equal(gate.submitButton.disabled, false);

  await gate.logoutButton.click();
  assert.equal(gate.workspace.hidden, true);
  assert.equal(gate.workspace.innerHTML, '');
  assert.equal(gate.form.hidden, false);
  assert.equal(gate.passwordInput.focused, true);
});

test('overview reproduces p55 objectives and keywords exactly', () => {
  const original = pageTextBlocks(page(55));
  const expectedObjectives = [
    'يتعرّف القوى المتلاقية.',
    'يوضّح بالرسم القوى المتلاقية.',
    'يحدّد عناصر محصلة قوتين متلاقيتين.',
    'يحلّل القوة إلى مركبتين متعامدتين.',
  ];
  for (const phrase of expectedObjectives) {
    assert.ok(original.includes(phrase));
    assert.ok(teacherMarkup.includes(`<li>${phrase}</li>`));
  }
  const keywords = 'القوى المتلاقية – تحليل القوة.';
  assert.ok(original.includes(keywords));
  assert.ok(teacherMarkup.includes(`<p class="teacher-keyword-line">${keywords}</p>`));
  assert.match(teacherMarkup, /الكلمات المفتاحية · المصدر p55/);
});

test('teacher source disclosures include original book wording for every page p55–p62', () => {
  for (let pageNumber = 55; pageNumber <= 62; pageNumber += 1) {
    assert.ok(teacherMarkup.includes(`data-source-page="p${pageNumber}"`), `Missing source disclosure for p${pageNumber}`);
    assert.ok(teacherMarkup.includes(`محتوى الكتاب الأصلي · p${pageNumber}`), `Missing visible page reference p${pageNumber}`);
    const original = pageTextBlocks(page(pageNumber)).trim();
    assert.ok(teacherMarkup.includes(original), `Original source HTML for p${pageNumber} is not included verbatim`);
  }
});

test('source values and p59 Pythagoras block remain exact; teacher arithmetic is separate', () => {
  const p58 = pageTextBlocks(page(58));
  const p59 = pageTextBlocks(page(59));
  for (const phrase of ['F₁ = 4 N', 'F₂ = 3 N', '60°', '1 cm = 1 N', '6 cm', 'F = 6 × 1 = 6 N', 'F₁ = 60 N', 'F₂ = 80 N']) {
    assert.ok(p58.includes(phrase) || p59.includes(phrase), `Missing source value ${phrase}`);
    assert.ok(teacherMarkup.includes(phrase), `Teacher Area omitted source value ${phrase}`);
  }
  for (const line of PYTHAGORAS_LINES) {
    assert.ok(p59.includes(`data-source-line="${line}"`));
    assert.ok(teacherMarkup.includes(`data-source-line="${line}"`), `Pythagoras source line changed: ${line}`);
  }
  assert.ok(teacherMarkup.includes('تحقق رياضي إضافي للمعلم'));
  assert.ok(teacherMarkup.includes('حساب المعلم الموسّع'));
  assert.match(teacherMarkup, /تحقق رياضي إضافي للمعلم[^]*لا يحل محل القياس والنتيجة المطبوعة/);
});

test('p60 keeps OX, OY and lowercase Latin a; p62 force-set order and F3 limit are preserved', () => {
  assert.ok(teacherMarkup.includes(V_OX));
  assert.ok(teacherMarkup.includes(V_OY));
  assert.ok(teacherMarkup.includes(V_OM));
  assert.match(teacherMarkup, /<annotation encoding="application\/x-tex">a<\/annotation>/);
  const p60Section = teacherMarkup.slice(
    teacherMarkup.indexOf('data-teacher-explanation="p60"'),
    teacherMarkup.indexOf('data-teacher-explanation="p58"'),
  );
  assert.doesNotMatch(p60Section, /[αθ]/, 'the p60 figure reference never substitutes a Greek angle symbol for the printed Latin a');
  const orderedSet = '\\{\\vec{F}_{1},\\ \\vec{F}_{2},\\ \\vec{F},\\ \\vec{F}_{3}\\}';
  assert.ok(pageTextBlocks(page(62)).includes(orderedSet));
  assert.ok(teacherMarkup.includes(orderedSet));
  assert.ok(teacherMarkup.includes('المصدر لا يعرّف'));
  assert.ok(teacherMarkup.includes('ولا يعطي له مقداراً أو اتجاهاً'));
  assert.ok(teacherMarkup.includes(`لا تخترع قيمة أو دوراً لـ ${V_F3}`));
});

test('p61–p62 self-check and written problems have teacher-labelled worked solutions and source limits', () => {
  for (const answer of ['الإجابة: متوازي أضلاع', 'الإجابة: مستطيل', 'الإجابة: مربع', 'الإجابة: علاقة فيثاغورث']) {
    assert.ok(teacherMarkup.includes(answer), `Missing teacher solution: ${answer}`);
  }
  assert.match(teacherMarkup, /الإجابة: <bdi[^>]*>20 N<\/bdi>/);
  assert.match(teacherMarkup, /الإجابة: <bdi[^>]*>30 N<\/bdi>/);
  for (const result of ['9', '15 N', '30 N', '40 N', '50 N', '53.1', '36.9']) {
    assert.ok(teacherMarkup.includes(result), `Missing supported written-problem result: ${result}`);
  }
  assert.match(teacherMarkup, /data-teacher-explanation="p61"/);
  assert.match(teacherMarkup, /data-teacher-explanation="p62"/);
  assert.match(teacherMarkup, /مواضع ربط الحبلين الدقيقة[\s\S]*?لا يحددهما النص/);
  assert.match(teacherMarkup, /لا يفرض الكتاب مقياس رسم أو اتجاهاً مطلقاً/);
});

test('p55 parachutist, p56 experiment, p57 resultant and both p60 activities are covered', () => {
  for (const reference of ['teacher-p55', 'teacher-p56', 'teacher-p57', 'teacher-p60-resolution', 'teacher-p60-incline']) {
    assert.ok(teacherMarkup.includes(`id="${reference}"`), `Missing teacher coverage: ${reference}`);
  }
  assert.match(teacherMarkup, /تتلاقى حواملها في نقطة واحدة/);
  assert.match(teacherMarkup, /ثقل المظلي يتجه رأسياً إلى أسفل/);
  assert.match(teacherMarkup, /القوة التي توازن الجسم/);
  assert.match(teacherMarkup, /مستوى أملساً يميل عن الأفق بزاوية/);
  assert.ok(teacherMarkup.includes('مقداري مركبتي الثقل'));
});

test('teacher guidance accurately references only the four existing student interactions and states limitations', () => {
  const expected = [
    [56, 'spring-concurrency'],
    [57, 'concurrent'],
    [59, 'perpendicular'],
    [60, 'force-resolution'],
  ];
  const studentReferences = LESSON_PAGES.flatMap((item) => item.blocks
    .filter((block) => block.type === 'simulation')
    .map((block) => [item.page, block.id]));
  assert.deepEqual(studentReferences, expected);
  for (const [pageNumber, id] of expected) {
    assert.ok(teacherMarkup.includes(`data-simulation-reference="${id}"`));
    assert.ok(teacherMarkup.includes(`data-page-reference="p${pageNumber}"`));
  }
  assert.match(teacherMarkup, /لا يحسب قراءات الربيعتين أو شدّ النابضين، ولا يختبر اتزان الجسم/);
  assert.match(teacherMarkup, /قيمة البداية <bdi[^>]*>6 N<\/bdi> و<bdi[^>]*>4 N<\/bdi> و<bdi[^>]*>45°<\/bdi> للاستكشاف/);
  assert.match(teacherMarkup, /يمكن إدخال <bdi[^>]*>60 N<\/bdi> و<bdi[^>]*>80 N<\/bdi> لمراجعة نتيجة <bdi[^>]*>100 N<\/bdi>/);
  assert.match(teacherMarkup, /لا يعيد رسم المستوى المائل في p60/);
  assert.match(teacherMarkup, /لم تُضف أو تُعدّل محاكاة/);
});

test('static production build copies the separate Teacher Area entry page', async () => {
  const buildScript = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  assert.match(buildScript, /teacher\.html/);
});
