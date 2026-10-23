import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mountTeacherArea } from '../src/teacher-area.js';
import { verifyTeacherPassword } from '../src/teacher-auth.js';
import { renderTeacherContent } from '../src/teacher-content.js';
import { V_F_PRIME, V_OX, V_OY, V_OM, V_R } from '../src/math.js';

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

test('Teacher Area is a separate accessible page with a client-side password gate and honest security disclosure', async () => {
  const [studentPage, teacherPage, studentEntry, teacherBootstrap] = await Promise.all([
    readFile(new URL('../lesson-1.html', import.meta.url), 'utf8'),
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

  // Honest architectural disclosure: never claim static client-side gating is server-side security
  assert.match(teacherPage, /ولا تمثّل حماية خادم خلفية/);
  assert.match(teacherMarkup, /ولا يجوز اعتبارها حماية خادم خلفية/);
});

test('PBKDF2 verifier accepts somer173 and rejects retired or wrong passwords', async () => {
  const authSource = await readFile(new URL('../src/teacher-auth.js', import.meta.url), 'utf8');
  assert.doesNotMatch(authSource, /Teacher-L1-55-62!/);
  assert.equal(await verifyTeacherPassword(RETIRED_TEACHER_PASSPHRASE), false);
  assert.equal(await verifyTeacherPassword(TEACHER_PASSPHRASE), true);
  assert.equal(await verifyTeacherPassword('not-the-teacher-passphrase'), false);
  assert.equal(await verifyTeacherPassword(null), false);
});

test('incorrect password keeps teacher content unloaded and leaves workspace locked; right password unlocks and supports logout', async () => {
  let loadCount = 0;
  const gate = fakeGate(
    verifyTeacherPassword,
    async () => {
      loadCount += 1;
      return import('../src/teacher-content.js');
    },
  );

  gate.passwordInput.value = 'incorrect';
  await gate.form.submit();
  assert.equal(loadCount, 0);
  assert.equal(gate.workspace.hidden, true);
  assert.match(gate.feedback.textContent, /غير صحيحة/);

  gate.passwordInput.value = TEACHER_PASSPHRASE;
  await gate.form.submit();
  assert.equal(loadCount, 1);
  assert.equal(gate.workspace.hidden, false);
  assert.equal(gate.workspace.innerHTML, teacherMarkup);
  assert.equal(gate.passwordInput.value, '');
  assert.equal(gate.heading.focused, true);

  await gate.logoutButton.click();
  assert.equal(gate.workspace.hidden, true);
  assert.equal(gate.workspace.innerHTML, '');
});

test('Teacher Area covers learning objectives, all activities (pp. 55-60), all self-check items, and both written problems with F-prime', () => {
  for (const id of ['teacher-p55', 'teacher-p56', 'teacher-p57', 'teacher-p60-resolution', 'teacher-p60-incline']) {
    assert.ok(teacherMarkup.includes(`id="${id}"`), `Missing activity solution block ${id}`);
  }
  assert.ok(teacherMarkup.includes(V_OX));
  assert.ok(teacherMarkup.includes(V_OY));
  assert.ok(teacherMarkup.includes(V_OM));
  assert.ok(teacherMarkup.includes(V_R));
  assert.ok(teacherMarkup.includes(V_F_PRIME));
  assert.match(teacherMarkup, /<annotation encoding="application\/x-tex">a<\/annotation>/);

  // Self-check keys and written problem results (including equilibrant F' = 15 N and scale lengths)
  for (const key of ['61-1', '61-2', '62-1', '62-2', '62-3', '62-4']) {
    assert.ok(teacherMarkup.includes(key), `Missing self-check solution ${key}`);
  }
  for (const value of ['9', '15 N', '30 N', '40 N', '50 N', '1 cm', '3 N', '10 N']) {
    assert.ok(teacherMarkup.includes(value), `Missing worked problem value: ${value}`);
  }
});

test('Teacher Area includes misconception remediation, facilitation guides for all 4 simulations, and source-coverage matrix', async () => {
  assert.match(teacherMarkup, /id="t-misconceptions"/);
  assert.match(teacherMarkup, /id="t-simulations-guide"/);
  assert.match(teacherMarkup, /id="t-source-matrix"/);
  for (const [pageNumber, simId] of [
    [56, 'spring-concurrency'],
    [57, 'concurrent'],
    [59, 'perpendicular'],
    [60, 'force-resolution'],
  ]) {
    assert.ok(teacherMarkup.includes(`data-simulation-reference="${simId}"`));
    assert.ok(teacherMarkup.includes(`data-page-reference="p${pageNumber}"`));
  }
  const buildScript = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  assert.match(buildScript, /teacher\.html/);
});
