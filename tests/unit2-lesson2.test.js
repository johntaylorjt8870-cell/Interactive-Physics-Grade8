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
import { unit2l2SimulationMarkup, createTubeState, pushBalls, markedSlot, TUBE_CAPACITY } from '../src/unit2-lesson2-simulation.js';

const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');
const source = (n) => UNIT2L2_PAGES.find((p) => p.page === n)?.blocks.filter((b) => b.type === 'book').map((b) => b.html).join('') ?? '';
/* TeX sources that KaTeX embedded in the rendered HTML (MathML annotation). */
const texOf = (html) => [...html.matchAll(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/g)].map((m) => m[1]);
/* Text a reader sees: drop TeX annotations and tags. */
const visible = (html) => html.replace(/<annotation[\s\S]*?<\/annotation>/g, '').replace(/<[^>]+>/g, ' ');
const renderedBlock = (block) => {
  if (block.type === 'simulation') return unit2l2SimulationMarkup(block.id);
  if (block.type === 'diagram') {
    const d = UNIT2L2_DIAGRAMS[block.id];
    return [d.platformNote, d.description, ...(d.legend ?? []).map((l) => l.symbol)].join(' ');
  }
  return block.html;
};
const pageHtml = (n) => UNIT2L2_PAGES.find((p) => p.page === n).blocks.map(renderedBlock).join('');
const teacherArticle = (html, n) => {
  const start = html.indexOf(`data-source-page="p${n}"`);
  const end = html.indexOf('data-source-page="p', start + 1);
  return html.slice(start, end === -1 ? undefined : end);
};

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
  assert.ok(texOf(source(91)).includes('I=\\dfrac{q}{t}'));
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
  assert.deepEqual(UNIT2L2_PAGES.flatMap((p) => p.blocks.filter((b) => b.type === 'simulation').map((b) => `${p.page}:${b.id}`)), ['88:tube-lab', '91:current-lab', '93:circuit-lab']);
  const currentLab = unit2l2SimulationMarkup('current-lab');
  for (const hook of ['id="cq"', 'id="ct"', 'data-current-reset', 'data-current-i', 'data-current-q3', 'data-current-status', 'data-current-equation']) assert.ok(currentLab.includes(hook), hook);
  assert.ok(texOf(currentLab).includes('I=\\dfrac{q}{t}=\\dfrac{60\\,\\mathrm{C}}{30\\,\\mathrm{s}}=2\\,\\mathrm{A}'));
  const circuitLab = unit2l2SimulationMarkup('circuit-lab');
  for (const hook of ['data-circuit-mode="series"', 'data-circuit-mode="parallel"', 'data-circuit-remove', 'data-circuit-reset', 'data-circuit-status']) assert.ok(circuitLab.includes(hook), hook);
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

test('KaTeX: real fractions on pages 90-92, no leaked TeX line breaks anywhere in the lesson', () => {
  const teacher = renderTeacherContent();
  const everything = [...UNIT2L2_PAGES.map((p) => pageHtml(p.page)), teacher, ...Object.values(SOLUTIONS).map((s) => s.explanationHtml)];
  for (const html of everything) {
    // A doubled backslash becomes a LaTeX line break (\\) and prints "dfracqt", "mathrmConst"...
    assert.doesNotMatch(html, /linebreak="newline"/);
    for (const t of texOf(html)) assert.ok(!t.includes('\\\\'), `TeX line break in: ${t}`);
  }
  const [p90, p91, p92] = [90, 91, 92].map(pageHtml);
  assert.ok(texOf(p90).includes('\\dfrac{q}{t}'), 'p90 table header');
  assert.ok(texOf(p90).includes('\\dfrac{q}{t}=4'), 'p90 note');
  assert.ok(texOf(p91).includes('I=\\dfrac{q}{t}'), 'p91 relation');
  assert.ok(texOf(p92).includes('I=\\mathrm{Const}'), 'p92 conclusion');
  assert.ok(texOf(p92).includes('200\\,\\mathrm{mA}=0.2\\,\\mathrm{A}'), 'p92 conversion');
  for (const html of [p90, p91]) assert.match(html, /<mfrac>/);
  assert.ok(texOf(teacherArticle(teacher, 90)).includes('\\dfrac{q}{t}'), 'teacher p90 table');
  assert.match(teacherArticle(teacher, 90), /<mfrac>/);
  assert.ok(texOf(teacherArticle(teacher, 91)).includes('I=\\dfrac{q}{t}'), 'teacher p91 law');
  assert.ok(texOf(teacherArticle(teacher, 92)).includes('I=\\mathrm{Const}'), 'teacher p92 conclusion');
  // No flat slash fractions such as q/t or 180/30 left in what students or teachers read
  // (the bilingual tag "Reference / See textbook" is not a fraction).
  const slashFraction = /[A-Za-z0-9]\s*\/\s*[A-Za-z0-9]/;
  const prose = (html) => visible(html).replaceAll('Reference / See textbook', '');
  for (const n of [90, 91, 92]) {
    assert.doesNotMatch(prose(pageHtml(n)), slashFraction, `student p${n}`);
    assert.doesNotMatch(prose(teacherArticle(teacher, n)), slashFraction, `teacher p${n}`);
  }
  // Equations are isolated left-to-right inside the RTL text.
  assert.ok(p91.includes('<span class="math math-inline" dir="ltr"'));
});

test('p89 circuit follows the textbook layout and the current/electron conventions', async () => {
  const d = UNIT2L2_DIAGRAMS['current-direction'];
  const part = (name) => d.svg.match(new RegExp(`<g data-part="${name}" data-x="([\\d.]+)" data-y="([\\d.]+)"`)).slice(1).map(Number);
  const [gx, gy] = part('generator');
  const [lx, ly] = part('lamp');
  const [sx, sy] = part('switch');
  assert.ok(gy < ly && gy < sy, 'generator on top');
  assert.ok(lx < gx && gx < sx, 'lamp on the left, switch on the right');
  const terminal = (sign) => Number(d.svg.match(new RegExp(`data-terminal="${sign}" x="([\\d.]+)"`))[1]);
  assert.ok(terminal('positive') < terminal('negative'), '+ on the left, − on the right');
  const arrows = [...d.svg.matchAll(/<polygon class="([\w-]+)" data-flow="(\w+)" data-segment="([\w-]+)" data-dir="(\w+)"/g)].map(([, cls, flow, segment, dir]) => ({ cls, flow, segment, dir }));
  // Conventional current leaves + (left of the generator) and returns to −: lamp branch down, switch branch up.
  const expected = { 'top-left': 'left', left: 'down', bottom: 'right', right: 'up', 'top-right': 'left' };
  const opposite = { left: 'right', right: 'left', up: 'down', down: 'up' };
  for (const [segment, dir] of Object.entries(expected)) {
    assert.deepEqual(arrows.filter((a) => a.flow === 'current' && a.segment === segment).map((a) => a.dir), [dir], `current on ${segment}`);
    assert.deepEqual(arrows.filter((a) => a.flow === 'electron' && a.segment === segment).map((a) => a.dir), [opposite[dir]], `electrons on ${segment}`);
  }
  assert.equal(arrows.length, 10);
  assert.ok(arrows.every((a) => a.cls === (a.flow === 'current' ? 'u2l2-arrow-current' : 'u2l2-arrow-electron')));
  assert.doesNotMatch(d.svg, /marker-end/);
  const css = await read('../src/unit2-lesson2.css');
  assert.match(css, /\.u2l2-arrow-current\{fill:#f6c700/, 'current arrows are yellow');
  assert.match(css, /\.u2l2-arrow-electron\{fill:#d32f2f/, 'electron arrows are red');
  for (const label of ['المولّد', 'مصدر الطاقة الكهربائية', 'موصل كهربائي', 'جهاز كهربائي', 'مستهلك (مصباح)', 'مفتاح (قاطعة)', 'موجب', 'سالب']) assert.ok(d.svg.includes(label), label);
  assert.match(d.svg, />e<tspan[^>]*>−<\/tspan><\/text>/, 'e⁻ label');
  assert.deepEqual(d.legend.map((l) => l.color), ['yellow', 'red']);
  assert.match(css, /\.legend-swatch\.yellow\{/);
  assert.match(css, /\.legend-swatch\.red\{/);
});

test('tube lab: pushing one or several balls immediately pushes the same number out of the far end', () => {
  let st = createTubeState();
  assert.equal(st.balls.length, TUBE_CAPACITY);
  assert.equal(markedSlot(st), 0);
  st = pushBalls(st, 1);
  assert.deepEqual([st.pushed, st.exited, st.lastIn.length, st.lastOut.length], [1, 1, 1, 1]);
  assert.notDeepEqual(st.lastOut, st.lastIn, 'the ball that leaves is not the ball pushed in');
  assert.equal(st.balls.length, TUBE_CAPACITY, 'tube stays full');
  assert.equal(markedSlot(st), 1, 'the marked ball advances one slot only');
  st = pushBalls(st, 3);
  assert.deepEqual([st.pushed, st.exited, st.lastIn.length, st.lastOut.length], [4, 4, 3, 3]);
  assert.equal(st.balls.length, TUBE_CAPACITY);
  assert.equal(markedSlot(st), 4);
  assert.ok(st.lastIn.every((id) => st.balls.includes(id)));
  assert.ok(st.lastOut.every((id) => !st.balls.includes(id)));
  // The effect reached the far end on the first push; the marked ball needs a whole tube of pushes.
  st = pushBalls(pushBalls(st, 3), 1);
  assert.equal(markedSlot(st), TUBE_CAPACITY - 1);
  st = pushBalls(st, 1);
  assert.equal(markedSlot(st), -1);
  assert.equal(st.pushed, TUBE_CAPACITY);
  assert.throws(() => pushBalls(st, 0), RangeError);
  assert.throws(() => pushBalls(st, 1.5), RangeError);
  assert.deepEqual(createTubeState(), createTubeState(), 'reset returns the same full tube');
  const html = unit2l2SimulationMarkup('tube-lab');
  assert.match(html, /class="u2l2-model-notice" role="note"/);
  assert.ok(html.includes('نموذج تعليمي مبسّط'));
  assert.ok(html.includes('انتقال التأثير'));
  assert.ok(html.includes('لا يعني ذلك أن الإلكترونات نفسها تنتقل فوراً'));
  for (const hook of ['data-tube-push="1"', 'data-tube-push="3"', 'data-tube-reset', 'role="status" aria-live="polite" data-tube-status']) assert.ok(html.includes(hook), hook);
  assert.equal((html.match(/class="u2l2-ball/g) ?? []).length, TUBE_CAPACITY);
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
