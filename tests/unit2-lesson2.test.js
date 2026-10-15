import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT2L2_PAGES, UNIT2L2_META } from '../src/unit2-lesson2-content.js';
import { currentFromChargeTime, chargeFromCurrentTime, seriesCurrents, parallelTotal, milliampereToAmpere } from '../src/unit2-lesson2-physics.js';
import { UNIT2L2_DIAGRAMS } from '../src/unit2-lesson2-diagrams.js';
import { UNIT2L2_QUESTIONS, UNIT2L2_TEST } from '../src/unit2-lesson2-test-data.js';
import { ANSWER_KEY, SOLUTIONS, SOLUTION_GROUPS } from '../src/unit2-lesson2-test-solutions.js';
import { validateAnswerKey, startAssessment, createAssessmentState, recordAnswer, submitAssessment, restartAssessment } from '../src/lesson-test-engine.js';
import { renderTeacherContent } from '../src/unit2-lesson2-teacher-content.js';

const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');
const source = (n) => UNIT2L2_PAGES.find((p) => p.page === n)?.blocks.filter((b) => b.type === 'book').map((b) => b.html).join('') ?? '';

test('pages 87-96 in order, meta, entries, build, no unit-2 test', async () => {
  assert.deepEqual(UNIT2L2_PAGES.map((p) => p.page), [87, 88, 89, 90, 91, 92, 93, 94, 95, 96]);
  assert.equal(UNIT2L2_META.pages, '87–96');
  const [html, build, home] = await Promise.all([read('../unit2-lesson-2.html'), read('../scripts/build.mjs'), read('../index.html')]);
  assert.match(html, /<html lang="ar" dir="rtl">/);
  assert.match(html, /التيار الكهربائي المتواصل/);
  assert.match(html, /unit2-lesson2-main\.js/);
  assert.match(html, /unit2-lesson-2-test\.html/);
  assert.match(html, /unit2-lesson-2-teacher\.html/);
  assert.match(build, /'unit2-lesson-2\.html'/);
  assert.match(home, /unit2-lesson-2\.html/);
  assert.match(home, /التيار الكهربائي المتواصل/);
  assert.doesNotMatch(home, /unit-2-test|أسئلة الوحدة الثانية|اختبار الوحدة الثانية/);
  assert.match(home, /الوحدة غير مكتملة/);
});

test('all textbook elements present', () => {
  for (const phrase of ['يتعرّف التيّار الكهربائيّ المُتواصِل', 'الإلكترونات الحرّة']) assert.ok(source(87).includes(phrase), phrase);
  assert.ok(source(88).includes('أنبوب بلاستيكي'));
  assert.ok(source(88).includes('انتقال مستمرٌّ للإلكترونات الحرّة'));
  assert.ok(source(89).includes('اصطلح العالم أمبير'));
  assert.ok(source(90).includes('أُتمِّمُ الجدول'));
  assert.ok(source(91).includes('I=\\\\frac{q}{t}') || source(91).includes('q}{t}'));
  assert.ok(source(91).includes('360'));
  assert.ok(source(92).includes('200'));
  assert.ok(source(92).includes('الوصلة على التَّسلسُل') || source(92).includes('التَّسلسُل'));
  assert.ok(source(93).includes('التفرّع') || source(93).includes('التفرع'));
  assert.ok(source(94).includes('I=I_{1}+I_{2}') || source(94).includes('I_1'));
  assert.ok(source(95).includes('السؤال الأول'));
  assert.ok(source(96).includes('السؤال الخامس'));
  assert.ok(source(96).includes('12'));
});

test('physics: I=q/t, series, parallel, conversions', () => {
  assert.equal(currentFromChargeTime(60, 30).current, 2);
  assert.equal(chargeFromCurrentTime(2, 180).charge, 360);
  assert.equal(currentFromChargeTime(12, 120).current, 0.1);
  assert.equal(chargeFromCurrentTime(0.1, 300).charge, 30);
  assert.deepEqual(seriesCurrents(200, 2).currents, [200, 200]);
  assert.equal(parallelTotal([120, 80]).total, 200);
  assert.equal(milliampereToAmpere(200), 0.2);
  assert.throws(() => currentFromChargeTime(1, 0), RangeError);
});

test('diagrams and simulations labelled, accessible, reduced motion', async () => {
  assert.deepEqual(Object.keys(UNIT2L2_DIAGRAMS), ['current-direction', 'qt-graph', 'series-circuit', 'parallel-circuit']);
  for (const d of Object.values(UNIT2L2_DIAGRAMS)) {
    assert.match(d.svg, /role="img"/);
    assert.match(d.svg, /<title/);
    assert.ok(d.description.length > 20);
    assert.doesNotMatch(d.svg, /<img/);
  }
  const [sim, css] = await Promise.all([read('../src/unit2-lesson2-simulation.js'), read('../src/unit2-lesson2.css')]);
  assert.match(sim, /Educational simplified model/);
  assert.match(sim, /aria-live="polite"/);
  assert.match(sim, /data-current-reset/);
  assert.match(sim, /data-circuit-reset/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.equal(UNIT2L2_PAGES.flatMap((p) => p.blocks).filter((b) => b.type === 'simulation').length, 2);
  const main = await read('../src/unit2-lesson2-main.js');
  assert.match(main, /Platform Explanation · شرح المنصة/);
});

test('teacher covers every page and every exercise with steps', () => {
  const m = renderTeacherContent();
  for (let p = 87; p <= 96; p++) assert.ok(m.includes(`data-source-page="p${p}"`), `p${p}`);
  for (const phrase of ['ألاحظ وأستنتج', 'تجربة الأنبوب', 'تطبيق محلول', '200', '360', 'السؤال الأول', 'السؤال الثاني', 'السؤال الثالث', 'السؤال الرابع', 'السؤال الخامس', '0.1', 'المطلوب 1', 'المطلوب 2', 'المعطيات', 'التحقق']) {
    assert.ok(m.includes(phrase), phrase);
  }
});

test('test: exactly 20, distribution 6/7/4/3, hidden keys, groups of 5, no instant score, restart', async () => {
  assert.equal(UNIT2L2_QUESTIONS.length, 20);
  assert.equal(new Set(UNIT2L2_QUESTIONS.map((q) => q.id)).size, 20);
  assert.deepEqual(Object.fromEntries(['basic', 'medium', 'advanced', 'thinking'].map((l) => [l, UNIT2L2_QUESTIONS.filter((q) => q.difficulty === l).length])), { basic: 6, medium: 7, advanced: 4, thinking: 3 });
  assert.ok(new Set(UNIT2L2_QUESTIONS.map((q) => q.type)).size >= 7);
  assert.deepEqual(UNIT2L2_TEST.sourcePages, [87, 88, 89, 90, 91, 92, 93, 94, 95, 96]);
  assert.deepEqual(SOLUTION_GROUPS.map((g) => g.items.length), [5, 5, 5, 5]);
  assert.equal(Object.keys(ANSWER_KEY).length, 20);
  for (const q of UNIT2L2_QUESTIONS) {
    assert.equal(validateAnswerKey(q, ANSWER_KEY[q.id]), true, q.id);
    assert.ok(SOLUTIONS[q.id].explanationHtml.length > 40, q.id);
  }
  const app = await read('../src/unit2-lesson2-assessment.js');
  assert.match(app, /loadSolutions: \(\) => import\('\.\/unit2-lesson2-test-solutions\.js'\)/);
  assert.doesNotMatch(app, /ANSWER_KEY/);
  let st = startAssessment(createAssessmentState());
  st = recordAnswer(st, UNIT2L2_QUESTIONS[0], ANSWER_KEY[UNIT2L2_QUESTIONS[0].id]);
  assert.equal(st.results, null);
  const sub = submitAssessment(st, UNIT2L2_QUESTIONS, ANSWER_KEY);
  assert.equal(sub.results.correct, 1);
  assert.deepEqual(restartAssessment(sub), { status: 'not-started', currentIndex: 0, answers: {}, results: null });
});

test('teacher gate unchanged and no plain password in new pages', async () => {
  const [th, auth] = await Promise.all([read('../unit2-lesson-2-teacher.html'), read('../src/teacher-auth.js')]);
  assert.match(th, /type="password"/);
  assert.match(th, /unit2-lesson2-teacher\.js/);
  assert.doesNotMatch(th, /somer173/);
  assert.doesNotMatch(auth, /somer173/);
  const boot = await read('../src/unit2-lesson2-teacher.js');
  assert.match(boot, /verifyTeacherPassword/);
});
