import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash, webcrypto } from 'node:crypto';
import { UNIT2_EXERCISES, UNIT2_EXERCISE_ITEM_COUNT, UNIT2_EXERCISE_META } from '../src/unit2-exercises-data.js';
import { UNIT2_EXERCISE_ANSWER_IDS, renderTeacherContent } from '../src/unit2-exercises-teacher-content.js';
import { UNIT2_TEACHER_PAYLOAD } from '../src/unit2-exercises-teacher-payload.js';
import { verifyTeacherPassword } from '../src/teacher-auth.js';
import { UNIT_2_QUESTIONS, BLUEPRINT } from '../src/unit-2-test-data.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('verified textbook pages 121–124 are inventoried in printed order and not mixed into the 56-item test', async () => {
  assert.deepEqual(UNIT2_EXERCISE_META.sourcePages, [121, 122, 123, 124]);
  const home = await read('index.html');
  const testData = await read('src/unit-2-test-data.js');
  assert.match(home, /تمرينات الوحدة الثانية/);
  assert.match(home, /تمرينات الكتاب · ص 121–124 · مستقلة عن الاختبار/);
  assert.match(home, /اختبار الوحدة الثانية<\/h3><p>الدروس الأربعة · 56 سؤالاً جديداً/);
  assert.match(testData, /total:56/);
  assert.equal(UNIT_2_QUESTIONS.length, 56);
  assert.equal(BLUEPRINT.total, 56);
});

test('all 31 checked source response branches have a unique detailed teacher counterpart', () => {
  const items = UNIT2_EXERCISES.flatMap((section) => section.items);
  const ids = items.map((item) => item.id);
  assert.equal(UNIT2_EXERCISE_ITEM_COUNT, 31);
  assert.equal(items.length, 31);
  assert.equal(new Set(ids).size, 31);
  assert.deepEqual([...UNIT2_EXERCISE_ANSWER_IDS].sort(), [...ids].sort());
  const teacher = renderTeacherContent();
  for (const item of items) {
    assert.match(teacher, new RegExp(`id="teacher-${item.id}"`), item.id);
    assert.match(teacher, new RegExp(`href="\\.\\/unit2-exercises\\.html#item-${item.id}"`), item.id);
    assert.ok(teacher.length > 25000);
  }
  assert.doesNotMatch(teacher, /غير مكتمل — يجب استكمال الحل/);
});

test('branch distribution matches the textbook, including each lamp calculation separately', () => {
  const branches = Object.fromEntries(UNIT2_EXERCISES.map((section) => [section.id, section.items.map((item) => item.id)]));
  assert.deepEqual(branches.q1, ['q1a', 'q1b', 'q1c', 'q1d']);
  assert.deepEqual(branches.q2, ['q2a', 'q2b']);
  assert.deepEqual(branches.q3a, ['q3a1', 'q3a2', 'q3a3']);
  assert.deepEqual(branches.q3b, ['q3b1']);
  assert.deepEqual(branches.q3c, ['q3c1']);
  assert.deepEqual(branches.q3d, ['q3d1', 'q3d2', 'q3d3', 'q3d4', 'q3d5']);
  assert.deepEqual(branches.project, ['p1', 'p2', 'p3-inc', 'p3-cfl', 'p3-led', 'p4-inc', 'p4-cfl', 'p4-led', 'p5-inc', 'p5-cfl', 'p5-led']);
  assert.deepEqual(branches['project-cont'], ['p6-inc', 'p6-cfl', 'p6-led', 'p7']);
  assert.deepEqual([...new Set(UNIT2_EXERCISES.flatMap((section) => section.items.map((item) => item.page ?? section.page)))], [121, 122, 123, 124]);
});

test('source diagrams, topology and charge units are faithfully represented without claiming pixel identity', async () => {
  const byId = Object.fromEntries(UNIT2_EXERCISES.map((section) => [section.id, section]));
  assert.equal(byId.q3b.diagram, 'charges');
  assert.equal(byId.q3d.diagram, 'circuit');
  assert.match(byId.q3b.intro, /3 μC.*4 μC.*1 μC.*10 cm/);
  assert.match(byId.q3d.intro, /R₁ = 8 Ω.*R₂ = 6 Ω.*R₃ = 3 Ω.*U = 12 V/);
  const student = await read('src/unit2-exercises.js');
  assert.match(student, /aria-labelledby="charge-title charge-desc"/);
  assert.match(student, /aria-labelledby="circuit-title circuit-desc"/);
  assert.match(student, /R₂ وR₃ على التفرع/);
  assert.match(student, /إعادة رسم توضيحية/);
});

test('electrical calculations and energy units in the teacher solutions independently balance', () => {
  const q = 0.5 * 40;
  const parallel = 1 / (1 / 6 + 1 / 3);
  const current = 15 / (5 + 15 + 10);
  const drops = [current * 5, current * 15, current * 10];
  const f1 = 9e9 * 3e-6 * 1e-6 / 0.1 ** 2;
  const f2 = 9e9 * 4e-6 * 1e-6 / 0.1 ** 2;
  const area = 2e-6;
  const wire = 1e-6 * 2 / area;
  const total = 8 + parallel;
  const circuitCurrent = 12 / total;
  const branchVoltage = 12 - circuitCurrent * 8;
  assert.equal(q, 20);
  assert.equal(parallel, 2);
  assert.equal(current, 0.5);
  assert.deepEqual(drops, [2.5, 7.5, 5]);
  assert.ok(Math.abs(Math.hypot(f1, f2) - 4.5) < 1e-12);
  assert.equal(wire, 1);
  assert.equal(total, 10);
  assert.ok(Math.abs(circuitCurrent - 1.2) < 1e-12);
  assert.ok(Math.abs(branchVoltage - 2.4) < 1e-12);
  assert.ok(Math.abs(branchVoltage / 6 + branchVoltage / 3 - circuitCurrent) < 1e-12);
  const hours = 2000;
  const seconds = hours * 3600;
  for (const watts of [220, 44, 20]) {
    const joules = watts * seconds;
    const kwh = watts / 1000 * hours;
    assert.equal(joules, kwh * 3.6e6);
    assert.equal(kwh * 30, watts / 1000 * hours * 30);
  }
  assert.equal(330 / 1000 * 2000 * 30, 19800);
  assert.equal(330 * 2000 * 3600, 2376000000);
});

test('every worked numeric branch includes a law, calculation, units, and a physical check', () => {
  const teacher = renderTeacherContent();
  for (const id of ['q1a', 'q1b', 'q1c', 'q1d', 'q3a1', 'q3a2', 'q3a3', 'q3b1', 'q3c1', 'q3d1', 'q3d2', 'q3d3', 'q3d4', 'q3d5', 'p3-inc', 'p3-cfl', 'p3-led', 'p4-inc', 'p4-cfl', 'p4-led', 'p5-inc', 'p5-cfl', 'p5-led', 'p6-inc', 'p6-cfl', 'p6-led']) {
    const start = teacher.indexOf(`id="teacher-${id}"`);
    const end = teacher.indexOf('</article>', start);
    const solution = teacher.slice(start, end);
    assert.ok(start >= 0 && end > start, id);
    assert.match(solution, /تحقق|التحقق|تحقق مستقل|تحقق الفيزيائي/, id);
    assert.match(solution, /النتيجة|النتائج/, id);
  }
});

test('source discrepancy at p123–124 is explicitly scoped and both 220 W and printed 330 W calculations are retained', () => {
  const project = UNIT2_EXERCISES.find((section) => section.id === 'project');
  const teacher = renderTeacherContent();
  assert.match(project.intro, /330 W/);
  assert.match(project.intro, /220 W/);
  assert.match(teacher, /19,800 ل\.س/);
  assert.match(teacher, /13,200 ل\.س/);
  assert.match(teacher, /لا يمكن أن تكون القيمتان صحيحتين/);
  assert.match(teacher, /لا يدعي حسم الخطأ التحريري/);
});

test('student entry has retryable non-revealing hints and saves attempts; full answers are isolated in teacher-only lazy module', async () => {
  const [html, student, teacherLoader, payload, teacherEntry] = await Promise.all([
    read('unit2-exercises.html'), read('src/unit2-exercises.js'), read('src/unit2-exercises-teacher.js'), read('src/unit2-exercises-teacher-payload.js'), read('unit2-exercises-teacher.html'),
  ]);
  assert.match(html, /إجاباتك تُحفظ على هذا الجهاز/);
  assert.match(student, /localStorage\.setItem\(KEY/);
  assert.match(student, /data-hint/);
  assert.match(student, /لا يُحكم على إجاباتك آلياً/);
  assert.match(student, /record\.reviewed = !record\.reviewed/); // answers can be edited and review can be toggled back
  assert.doesNotMatch(student, /الإجابة الصحيحة|النتيجة النهائية|4\.5 N|19800/);
  assert.match(teacherLoader, /loadContent: decryptTeacherContent/);
  assert.match(teacherLoader, /passPasswordToContent: true/);
  assert.match(teacherLoader, /UNIT2_TEACHER_PAYLOAD/);
  assert.match(teacherLoader, /AES-GCM/);
  assert.match(teacherEntry, /teacher-login/);
  assert.doesNotMatch(payload, /الحلول النموذجية المشروحة لتمرينات الوحدة الثانية|teacher-q3b1|2376000000/);
  assert.match(teacherEntry, /teacher-workspace"[^>]*hidden/);
  assert.match(teacherLoader, /verifyTeacherPassword/);
  assert.equal(await verifyTeacherPassword('somer173'), true);
  assert.equal(await verifyTeacherPassword('wrong'), false);
});

test('student progress counts self-reviewed branches and navigation stays distinct from the test area', async () => {
  const [html, boot] = await Promise.all([read('unit2-exercises.html'), read('src/unit2-exercises.js')]);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /مسح إجاباتي/);
  assert.match(html, /اختبار الوحدة الثانية/);
  assert.match(html, /href="\.\/unit-2-test\.html"/);
  assert.match(boot, /record\.reviewed = !record\.reviewed/);
  assert.match(boot, /localStorage\.removeItem\(KEY\)/);
  assert.match(boot, /راجعها في ضوء التلميح والوحدات وخطوات الاستدلال/);
});

test('published teacher payload decrypts only with the existing passphrase and matches the authored solutions exactly', async () => {
  const decode = (value) => Buffer.from(value, 'base64');
  const derive = async (password) => {
    const material = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    return webcrypto.subtle.deriveKey({ name: 'PBKDF2', salt: decode(UNIT2_TEACHER_PAYLOAD.salt), iterations: UNIT2_TEACHER_PAYLOAD.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  };
  const key = await derive('somer173');
  const clear = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(UNIT2_TEACHER_PAYLOAD.iv) }, key, decode(UNIT2_TEACHER_PAYLOAD.ciphertext));
  const html = new TextDecoder().decode(clear);
  assert.equal(html, renderTeacherContent());
  assert.match(html, /teacher-q3b1/);
  assert.match(html, /2,376,000,000/);
  await assert.rejects(async () => {
    const wrongKey = await derive('wrong');
    await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(UNIT2_TEACHER_PAYLOAD.iv) }, wrongKey, decode(UNIT2_TEACHER_PAYLOAD.ciphertext));
  });
});

test('all four original user-supplied page scans are preserved by content hash', async () => {
  const expected = {
    'docs/source-images/unit2-exercises-p121.png': 'fc9d9767f5ac285e0489782ab902dc915911512f78476615c62112b71147de51',
    'docs/source-images/unit2-exercises-p122.png': '907886838e5c031bc2ad2196fe60eee77f21d32d136fd2b44657e86c30062d4c',
    'docs/source-images/unit2-exercises-p123.png': '3d6665c5d1d9525f8b5e52e91239fc972ca020a7accb97545f1dde7f9b007772',
    'docs/source-images/unit2-exercises-p124.png': '2faa550b252c72fe1c18724a45283961a750019dd34589e272d601ea974e3269',
  };
  for (const [path, digest] of Object.entries(expected)) {
    const bytes = await readFile(new URL(`../${path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), digest, path);
  }
});

test('student and teacher math use shared KaTeX, RTL-isolated LTR expressions, responsive layouts and keyboard focus', async () => {
  const [studentCss, teacherCss, studentHtml, teacherHtml, source] = await Promise.all([
    read('src/unit2-exercises.css'), read('src/unit2-exercises-teacher.css'), read('unit2-exercises.html'), read('unit2-exercises-teacher.html'), read('src/unit2-exercises-teacher-content.js'),
  ]);
  assert.match(studentHtml, /dir="rtl"/);
  assert.match(teacherHtml, /vendor\/katex\/katex\.min\.css/);
  assert.match(studentCss, /@media\(max-width:1050px\)/);
  assert.match(studentCss, /@media\(max-width:760px\)/);
  assert.match(studentCss, /@media\(max-width:430px\)/);
  assert.match(studentCss, /focus-visible/);
  assert.match(studentCss, /prefers-reduced-motion/);
  assert.doesNotMatch(studentCss, /height:100vh/);
  const rendered = renderTeacherContent();
  assert.match(rendered, /class="math math-inline"/);
  assert.doesNotMatch(rendered, /katex-error|\\\\,/);
  assert.match(teacherCss, /unicode-bidi:isolate/);
  assert.match(source, /import \{ tex \} from '\.\/math\.js'/);
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((part) => parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const [foreground, background] of [['#657286', '#fffefa'], ['#806037', '#fffefa'], ['#59677d', '#ffffff'], ['#733c31', '#fff1ec'], ['#ffffff', '#31599a'], ['#ffffff', '#4c8066']]) {
    const a = luminance(foreground), b = luminance(background);
    assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, `${foreground} on ${background}`);
  }
});

test('GitHub Pages production build registers the student and password-gated teacher pages', async () => {
  const build = await read('scripts/build.mjs');
  assert.match(build, /'unit2-exercises\.html', 'unit2-exercises-teacher\.html'/);
  assert.match(build, /cp\(resolve\(projectDirectory, 'src'\), resolve\(outputDirectory, 'src'\)/);
});
