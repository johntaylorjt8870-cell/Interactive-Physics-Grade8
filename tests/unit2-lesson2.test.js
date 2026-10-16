import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT2L2_PAGES, UNIT2L2_META } from '../src/unit2-lesson2-content.js';
import { currentFromChargeTime, chargeFromCurrentTime, seriesCurrents, parallelTotal, milliampereToAmpere } from '../src/unit2-lesson2-physics.js';
import { UNIT2L2_DIAGRAMS } from '../src/unit2-lesson2-diagrams.js';
import { UNIT2L2_QUESTIONS, UNIT2L2_TEST } from '../src/unit2-lesson2-test-data.js';
import { unit2l2AssessmentDiagram } from '../src/unit2-lesson2-test-diagrams.js';
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
/* Remove every expression rendered by src/math.js (balanced wrapper element), keeping prose only;
   `replace` may substitute each removed element (it receives the element's HTML). */
const withoutMath = (html, replace = () => '') => {
  const open = /<(span|div) class="math math-(?:inline|display)[^"]*"[^>]*>/g;
  let out = '';
  let from = 0;
  for (let m; (m = open.exec(html));) {
    out += html.slice(from, m.index);
    const tag = new RegExp(`<(/?)${m[1]}\\b[^>]*>`, 'g');
    tag.lastIndex = open.lastIndex;
    for (let depth = 1, t; depth && (t = tag.exec(html));) depth += t[1] ? -1 : 1;
    out += replace(html.slice(m.index, tag.lastIndex));
    from = open.lastIndex = tag.lastIndex;
  }
  return out + html.slice(from);
};
/* Polylines of SVG wires drawn with M/H/V commands only. */
const wirePolylines = (svg) => [...svg.matchAll(/data-wire d="([^"]+)"/g)].map(([, d]) => {
  const pts = [];
  for (const [, cmd, args] of d.matchAll(/([MHV])\s*([\d.\s]+)/g)) {
    const n = args.trim().split(/\s+/).map(Number);
    const [x, y] = pts.at(-1) ?? [0, 0];
    pts.push(cmd === 'M' ? [n[0], n[1]] : cmd === 'H' ? [n[0], y] : [x, n[0]]);
  }
  return pts;
});
const renderedBlock = (block) => {
  if (block.type === 'simulation') return unit2l2SimulationMarkup(block.id);
  if (block.type === 'diagram') {
    const d = UNIT2L2_DIAGRAMS[block.id];
    return [d.platformNote, d.description, ...(d.legend ?? []).map((l) => l.symbol)].join(' ');
  }
  return block.html;
};
const pageHtml = (n) => UNIT2L2_PAGES.find((p) => p.page === n).blocks.map(renderedBlock).join('');
/* Teacher-written part of the article for one book page: solutions and explanation,
   stopping before the article's own "original textbook content" disclosure. */
const teacherArticle = (html, n) => {
  const start = html.indexOf(`data-page-reference="p${n}"`);
  assert.ok(start > -1, `teacher article p${n}`);
  const end = html.indexOf(`data-source-page="p${n}"`, start);
  assert.ok(end > start && end < html.indexOf('</article>', start), `source disclosure inside teacher article p${n}`);
  return html.slice(start, end);
};

test('pages 87-96 in order, meta, entries, build, completed unit-2 test', async () => {
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
  assert.match(home, /unit-2-test\.html/);
  assert.match(home, /أربعة دروس · الوحدة مكتملة/);
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

test('p92 series circuit is one closed loop: generator, A1, L1, L2, A2 really wired in series', () => {
  const svg = UNIT2L2_DIAGRAMS['series-circuit'].svg;
  const key = ([x, y]) => `${x},${y}`;
  // Wires use only M/H/V commands: rebuild their polylines.
  const wires = [...svg.matchAll(/data-wire d="([^"]+)"/g)].map(([, d]) => {
    const pts = [];
    for (const [, cmd, args] of d.matchAll(/([MHV])\s*([\d.\s]+)/g)) {
      const n = args.trim().split(/\s+/).map(Number);
      const [x, y] = pts.at(-1) ?? [0, 0];
      pts.push(cmd === 'M' ? [n[0], n[1]] : cmd === 'H' ? [n[0], y] : [x, n[0]]);
    }
    return pts;
  });
  assert.equal(wires.length, 5);
  assert.doesNotMatch(svg.replace(/<path class="u2-wire" data-wire d="[^"]+"\/>/g, ''), /class="u2-wire"/, 'no stray wire stubs');
  const parts = [...svg.matchAll(/<g data-part="(\w+)" data-name="(\w+)"([^>]*)data-terminals="([\d.]+),([\d.]+) ([\d.]+),([\d.]+)"/g)]
    .map(([, part, name, rest, ax, ay, bx, by]) => {
      const num = (a) => Number(rest.match(new RegExp(`data-${a}="([\\d.]+)"`))?.[1]);
      return { part, name, a: [Number(ax), Number(ay)], b: [Number(bx), Number(by)], cx: num('cx'), cy: num('cy'), r: num('r') };
    });
  assert.deepEqual(parts.map((p) => `${p.part}:${p.name}`), ['generator:G', 'ammeter:A1', 'lamp:L1', 'lamp:L2', 'ammeter:A2']);
  // Terminals of round symbols lie exactly on their outline, so wires meet the symbol edge.
  for (const p of parts.filter((x) => x.r)) for (const t of [p.a, p.b]) assert.equal(Math.hypot(t[0] - p.cx, t[1] - p.cy), p.r, `${p.name} terminal on outline`);
  // Every terminal is met by exactly one wire end and every wire end by exactly one terminal.
  const ends = wires.flatMap((w) => [key(w[0]), key(w.at(-1))]);
  const terminals = parts.flatMap((p) => [key(p.a), key(p.b)]);
  assert.deepEqual([...ends].sort(), [...terminals].sort(), 'no gaps and no dangling wires');
  assert.equal(new Set(terminals).size, terminals.length);
  // No wire runs through the inside of a symbol (the old drawing ran a wire through A2).
  for (const w of wires) for (let i = 1; i < w.length; i++) {
    const [[x1, y1], [x2, y2]] = [w[i - 1], w[i]];
    for (const p of parts.filter((x) => x.r)) {
      const cx = Math.max(Math.min(p.cx, Math.max(x1, x2)), Math.min(x1, x2));
      const cy = Math.max(Math.min(p.cy, Math.max(y1, y2)), Math.min(y1, y2));
      assert.ok(Math.hypot(p.cx - cx, p.cy - cy) >= p.r, `wire segment ${x1},${y1}-${x2},${y2} crosses ${p.name}`);
    }
  }
  // Walk the loop leaving the generator through its + terminal: one cycle in the order of the p92 reference text.
  const wireFrom = new Map(wires.flatMap((w) => [[key(w[0]), key(w.at(-1))], [key(w.at(-1)), key(w[0])]]));
  const partAt = new Map(parts.flatMap((p) => [[key(p.a), p], [key(p.b), p]]));
  const order = [];
  let at = key(parts[0].b); // arrive at the − terminal, so the first step leaves through +
  for (let step = 0; step < parts.length; step++) {
    const p = partAt.get(at);
    order.push(p.name);
    at = wireFrom.get(key(p.a) === at ? key(p.b) : key(p.a));
  }
  assert.deepEqual(order, ['G', 'A1', 'L1', 'L2', 'A2']);
  assert.equal(at, key(parts[0].b), 'the loop closes back at the generator');
  assert.match(svg, /data-terminal="positive"/);
  assert.match(svg, /data-terminal="negative"/);
  assert.ok(svg.includes('I = 200 mA = Const'));
});

test('p90 q-t graph: axis ticks from the textbook ranges, aligned with the plotted book points', () => {
  const svg = UNIT2L2_DIAGRAMS['qt-graph'].svg;
  const ticks = [...svg.matchAll(/class="u2l2-tick" data-axis="(\w+)" data-value="(\d+)" x="([\d.]+)" y="([\d.]+)" text-anchor="(\w+)" dominant-baseline="\w+" direction="ltr">(\d+)</g)]
    .map(([, axis, value, x, y, anchor, label]) => ({ axis, value: Number(value), x: Number(x), y: Number(y), anchor, label }));
  const values = (axis) => ticks.filter((t) => t.axis === axis).map((t) => t.value);
  // p90 reference text: q axis 0..120, t axis 0..35; steps are the existing grid spacing (5 s, 20 C).
  assert.deepEqual(values('t'), [5, 10, 15, 20, 25, 30, 35]);
  assert.deepEqual(values('q'), [20, 40, 60, 80, 100, 120]);
  assert.deepEqual(values('origin'), [0]);
  assert.ok(ticks.every((t) => String(t.value) === t.label));
  const xOf = (t) => 80 + 16 * t;
  const yOf = (q) => 300 - 2 * q;
  for (const t of ticks.filter((k) => k.axis === 't')) assert.equal(t.x, xOf(t.value));
  for (const t of ticks.filter((k) => k.axis === 'q')) assert.equal(t.y, yOf(t.value));
  for (const t of ticks.filter((k) => k.axis === 't')) assert.ok(t.y > 300, 't numbers below the axis');
  // The plotted points are exactly the book's (t, q) pairs on the same scale as the ticks.
  const points = [...svg.matchAll(/<circle class="u2-plot" cx="([\d.]+)" cy="([\d.]+)"/g)].map(([, x, y]) => [Number(x), Number(y)]);
  assert.deepEqual(points, [[5, 20], [10, 40], [15, 60], [20, 80], [25, 100]].map(([t, q]) => [xOf(t), yOf(q)]));
  assert.match(svg, />q \(C\)</);
  assert.match(svg, />t \(s\)</);
});

test('teacher p96: arithmetic typeset left-to-right, fraction vertical, values and answers unchanged', () => {
  const article = teacherArticle(renderTeacherContent(), 96);
  const t = texOf(article);
  for (const expected of [
    '5\\,\\mathrm{min}=300\\,\\mathrm{s}',
    '\\dfrac{5}{2}=2.5',
    '12\\times2.5=30\\,\\mathrm{C}',
    'I=\\dfrac{q}{t}',
    'I=\\frac{q}{t}=\\frac{12}{120}=0.1\\,\\mathrm{A}',
    'q=It=0.1\\times300=30\\,\\mathrm{C}',
    '12\\,\\mathrm{c}',
  ]) assert.ok(t.includes(expected), expected);
  assert.match(article, /<mfrac>/);
  const prose = visible(withoutMath(article));
  assert.doesNotMatch(prose, /[A-Za-z0-9]\s*\/\s*[A-Za-z0-9]/, 'no slash fractions such as 5/2 or I=q/t');
  assert.doesNotMatch(prose, /\d\s*[×x]\s*\d/, 'no plain-text multiplication');
  assert.doesNotMatch(prose, /\d+(?:\.\d+)?\s*(?:min|mA|A|C|c|s)(?![A-Za-z])/, 'no bare number + unit left in the Arabic prose');
  assert.ok(article.includes('<span class="math math-inline" dir="ltr"'));
  assert.ok(article.includes('خطأ شائع: القسمة على 2 بدل 120.'));
});

test('u2l2q04: the arrow colours named in the prompt and figure text are the colours drawn (p89 yellow and red); key and options unchanged', async () => {
  const q = UNIT2L2_QUESTIONS.find((x) => x.id === 'u2l2q04');
  const svg = unit2l2AssessmentDiagram(q);
  const css = await read('../src/unit2-lesson2.css');
  const cssFill = (cls) => css.match(new RegExp(`\\.${cls}\\{fill:(#[0-9a-f]{6})`))[1];
  const fills = Object.fromEntries([...svg.matchAll(/<polygon data-flow="(\w+)"[^>]*? fill="(#[0-9a-f]{6})"/g)].map(([, flow, fill]) => [flow, fill]));
  assert.deepEqual(Object.keys(fills).sort(), ['current', 'electron']);
  assert.equal(fills.current, cssFill('u2l2-arrow-current'), 'same yellow as the p89 current arrows');
  assert.equal(fills.electron, cssFill('u2l2-arrow-electron'), 'same red as the p89 electron arrows');
  // A colour change in the drawing must come with the matching word in the text, and vice versa.
  const COLOUR_NAMES = { '#f6c700': 'أصفر', '#d32f2f': 'أحمر' };
  const name = (flow) => COLOUR_NAMES[fills[flow]] ?? assert.fail(`no Arabic name for ${fills[flow]}: update the prompt with the drawing`);
  const desc = svg.match(/<desc[^>]*>([^<]*)<\/desc>/)[1];
  const caption = svg.match(/<figcaption>([^<]*)<\/figcaption>/)[1];
  for (const text of [q.prompt, desc, caption]) {
    assert.ok(text.includes(`سهم ${name('current')} من الموجب إلى السالب`), text);
    assert.ok(text.includes(`سهم ${name('electron')} بالعكس`), text);
    for (const word of ['أخضر', 'أزرق', 'أصفر', 'أحمر', 'أسود', 'برتقالي']) {
      if (text.includes(word)) assert.ok([name('current'), name('electron')].includes(word), `«${word}» is not drawn: ${text}`);
    }
  }
  // The question asks about the current arrow, which is what the key 'conv' means.
  assert.ok(q.prompt.endsWith(`ماذا يمثّل ال${name('current')}؟`), q.prompt);
  assert.equal(ANSWER_KEY.u2l2q04, 'conv');
  assert.deepEqual(q.options.map((o) => [o.id, o.content]), [['conv', 'جهة التيار الاصطلاحية.'], ['elec', 'جهة حركة الإلكترونات.'], ['heat', 'اتجاه الحرارة فقط.'], ['none', 'لا معنى فيزيائي له.']]);
  assert.deepEqual([q.difficulty, q.type, q.diagram, [...q.sourcePages]], ['basic', 'diagram-interpretation', 'directions', [89]]);
});

test('u2l2q04 drawing: + and − poles, arrowheads and directions follow the circuit (current from + to − outside the generator, electrons opposite)', () => {
  const svg = unit2l2AssessmentDiagram({ diagram: 'directions' });
  const rect = (pole) => {
    const [x, y, w, h] = svg.match(new RegExp(`<rect data-pole="${pole}" x="([\\d.]+)" y="([\\d.]+)" width="([\\d.]+)" height="([\\d.]+)"`)).slice(1).map(Number);
    return { x, y, x2: x + w, y2: y + h };
  };
  const [cap, pos, neg] = ['cap', 'positive', 'negative'].map(rect);
  const sign = (pole) => {
    const m = svg.match(new RegExp(`<text data-terminal="${pole}" x="([\\d.]+)"[^>]*>([^<]*)</text>`));
    return { x: Number(m[1]), s: m[2] };
  };
  const plus = sign('positive');
  const minus = sign('negative');
  // One element per sign, inside its own half: nothing for the bidi algorithm to reorder.
  assert.equal(plus.s, '+');
  assert.equal(minus.s, '−');
  assert.ok(plus.x > pos.x && plus.x < pos.x2, '+ inside the positive half');
  assert.ok(minus.x > neg.x && minus.x < neg.x2, '− inside the negative half');
  assert.doesNotMatch(svg, />[^<]*\+[^<]*−[^<]*</, 'no text element holds both signs');
  // As in the lesson's p89 drawing: + on the left with the terminal cap, − on the right.
  assert.ok(pos.x2 <= neg.x, '+ half left of the − half');
  assert.ok(cap.x < pos.x && cap.x2 > pos.x, 'terminal cap on the + half');
  // One closed path: it leaves the + cap, goes round the loop and enters the − half.
  const wires = wirePolylines(svg);
  assert.equal(wires.length, 1);
  const path = wires[0];
  const [[sx, sy], [ex, ey]] = [path[0], path.at(-1)];
  assert.ok(sx >= cap.x && sx <= cap.x2 && sy > cap.y && sy < cap.y2, 'wire starts on the + cap');
  assert.ok(ex === neg.x2 && ey > neg.y && ey < neg.y2, 'wire ends on the − half');
  const xs = path.map((p) => p[0]);
  const ys = path.map((p) => p[1]);
  const loop = { x: Math.min(...xs), x2: Math.max(...xs), y: Math.min(...ys), y2: Math.max(...ys) };
  const UNIT = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
  const along = (p, u) => p[0] * u[0] + p[1] * u[1];
  const segments = path.slice(1).map((q, i) => ({ p: path[i], q, u: [Math.sign(q[0] - path[i][0]), Math.sign(q[1] - path[i][1])] }));
  const arrows = [...svg.matchAll(/<polygon data-flow="(\w+)" data-dir="(\w+)" points="([^"]+)"/g)].map(([, flow, dir, p]) => {
    const v = p.trim().split(/\s+/).map((xy) => xy.split(',').map(Number));
    return { flow, dir, v, c: [v.reduce((s, q) => s + q[0], 0) / v.length, v.reduce((s, q) => s + q[1], 0) / v.length] };
  });
  assert.deepEqual(arrows.map((a) => a.flow).sort(), ['current', 'electron']);
  for (const a of arrows) {
    const u = UNIT[a.dir];
    // Arrowhead: a 7-point block arrow with a single vertex furthest along its direction.
    assert.equal(a.v.length, 7, `${a.flow} arrow has a head`);
    const tip = Math.max(...a.v.map((q) => along(q, u)));
    assert.equal(a.v.filter((q) => along(q, u) === tip).length, 1, `${a.flow} arrowhead points ${a.dir}`);
    // The wire segment it runs along: parallel, beside it (≤ 25 px), the whole arrow within the segment.
    const normal = [Math.abs(u[1]), Math.abs(u[0])];
    const seg = segments.find((s) => Math.abs(s.u[0]) === Math.abs(u[0]) && Math.abs(s.u[1]) === Math.abs(u[1])
      && Math.abs(along(a.c, normal) - along(s.p, normal)) <= 25
      && Math.min(...a.v.map((q) => along(q, s.u))) >= along(s.p, s.u)
      && Math.max(...a.v.map((q) => along(q, s.u))) <= along(s.q, s.u));
    assert.ok(seg, `${a.flow} arrow lies along a wire`);
    // Walking the wire from + to −: the current arrow points the same way, the electron arrow the opposite way.
    assert.equal(u[0] === seg.u[0] && u[1] === seg.u[1], a.flow === 'current', `${a.flow} arrow direction`);
    // p89 convention: current arrows outside the loop, electron arrows inside.
    const inside = a.c[0] > loop.x && a.c[0] < loop.x2 && a.c[1] > loop.y && a.c[1] < loop.y2;
    assert.equal(inside, a.flow === 'electron', `${a.flow} arrow side of the wire`);
  }
  // I labels the current arrow and e⁻ the electron arrow.
  const at = (re) => svg.match(re).slice(1, 3).map(Number);
  const nearest = (p) => arrows.reduce((b, a) => (Math.hypot(a.c[0] - p[0], a.c[1] - p[1]) < Math.hypot(b.c[0] - p[0], b.c[1] - p[1]) ? a : b)).flow;
  assert.equal(nearest(at(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>I<\/text>/)), 'current');
  assert.equal(nearest(at(/<text x="([\d.]+)" y="([\d.]+)"[^>]*>e<tspan/)), 'electron');
});

test('student p96 hint: the conversions and the printed 12 c are LTR math; Arabic wording and punctuation unchanged', () => {
  const note = UNIT2L2_PAGES.find((p) => p.page === 96).blocks.find((b) => b.type === 'platform' && b.title === 'تلميح دون كشف الناتج').html;
  assert.deepEqual(texOf(note), ['2\\,\\mathrm{min}=120\\,\\mathrm{s}', '5\\,\\mathrm{min}=300\\,\\mathrm{s}', '12\\,\\mathrm{c}']);
  assert.equal((note.match(/<span class="math math-inline" dir="ltr"/g) ?? []).length, 3, 'each expression is an isolated LTR span');
  const prose = visible(withoutMath(note)).replace(/\s+/g, ' ').trim();
  assert.doesNotMatch(prose, /[0-9A-Za-z]/, 'no number or unit left in the Arabic text');
  assert.ok(prose.includes('ثوانٍ (، ).'), 'parentheses and Arabic comma stay outside the math');
  // Each conversion stays on one line with its own punctuation: "(…،" and "…)." cannot be orphaned.
  assert.match(note, /<span class="u2l2-keep">\(<span class="math math-inline"[\s\S]*?،<\/span> <span class="u2l2-keep"><span class="math math-inline"[\s\S]*?\)\.<\/span>/);
  // Reading each expression back as plain text restores the original sentence word for word.
  const plain = (s) => s.replace(/\\,/g, ' ').replace(/\\mathrm\{([^}]*)\}/g, '$1').replace(/=/g, ' = ');
  const restored = visible(withoutMath(note, (span) => plain(texOf(span)[0]))).replace(/\s+/g, ' ').trim();
  assert.equal(restored, 'حوّل الدقائق إلى ثوانٍ (2 min = 120 s، 5 min = 300 s). الوحدة المطبوعة 12 c هي كمية الكهرباء بالكولوم كما في اصطلاح الصفحة. لا تخلط بين المولّد الذي يسبب الحركة والمصباح الذي يحوّل الطاقة.');
});

test('p93 parallel circuit (geometric check of the SVG): closed, A in the main line, branches A1–L1 and A2–lamp between the same two junctions, no short', () => {
  const svg = UNIT2L2_DIAGRAMS['parallel-circuit'].svg;
  const key = ([x, y]) => `${x},${y}`;
  const wires = wirePolylines(svg);
  const parts = [...svg.matchAll(/<g data-part="(\w+)" data-name="([\w-]+)"([^>]*?)data-terminals="([\d.]+),([\d.]+) ([\d.]+),([\d.]+)">([\s\S]*?)<\/g>/g)]
    .map(([, part, name, rest, ax, ay, bx, by, inner]) => {
      const num = (a) => Number(rest.match(new RegExp(`data-${a}="([\\d.]+)"`))?.[1]);
      return { part, name, a: [Number(ax), Number(ay)], b: [Number(bx), Number(by)], cx: num('cx'), cy: num('cy'), r: num('r'), inner };
    });
  assert.deepEqual(parts.map((p) => `${p.part}:${p.name}`), ['generator:G', 'ammeter:A', 'ammeter:A1', 'lamp:L1', 'ammeter:A2', 'lamp:L1-lower']);
  const [gen, ...round] = parts;
  const byName = Object.fromEntries(parts.map((p) => [p.name, p]));
  const [gx, gy, gw, gh] = gen.inner.match(/<rect class="u2-cell" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/).slice(1).map(Number);
  // Terminals sit on the symbol outlines: circle edge, or the generator's left and right sides.
  for (const p of round) for (const t of [p.a, p.b]) assert.equal(Math.hypot(t[0] - p.cx, t[1] - p.cy), p.r, `${p.name} terminal on outline`);
  assert.deepEqual([gen.a, gen.b], [[gx, gy + gh / 2], [gx + gw, gy + gh / 2]]);
  // + and − are separate signs, + next to the first (positive) terminal.
  const signX = (pole) => Number(gen.inner.match(new RegExp(`data-terminal="${pole}" x="([\\d.]+)"[^>]*>([^<]*)<`))[1]);
  assert.match(gen.inner, /data-terminal="positive"[^>]*>\+</);
  assert.match(gen.inner, /data-terminal="negative"[^>]*>−</);
  assert.ok(Math.abs(signX('positive') - gen.a[0]) < Math.abs(signX('negative') - gen.a[0]));
  // Every wire end is a terminal or a junction; each terminal meets one wire; junctions meet three or more, with a dot.
  const ends = wires.flatMap((w) => [key(w[0]), key(w.at(-1))]);
  const count = (k) => ends.filter((e) => e === k).length;
  const terminals = parts.flatMap((p) => [key(p.a), key(p.b)]);
  const dots = [...svg.matchAll(/data-junction="([\d.]+),([\d.]+)" cx="([\d.]+)" cy="([\d.]+)"/g)].map(([, x, y, cx, cy]) => {
    assert.equal(`${cx},${cy}`, `${x},${y}`);
    return `${x},${y}`;
  });
  for (const t of terminals) assert.equal(count(t), 1, `terminal ${t} meets exactly one wire`);
  for (const e of ends) assert.ok(terminals.includes(e) || dots.includes(e), `wire end ${e} is connected`);
  assert.deepEqual([...new Set(ends.filter((e) => count(e) >= 3))].sort(), [...dots].sort(), 'a dot at every junction and nowhere else');
  // No wire runs through a symbol (the old drawing ran wires through A, A1, L1, A2 and the lower lamp).
  for (const w of wires) for (let i = 1; i < w.length; i++) {
    const [[x1, y1], [x2, y2]] = [w[i - 1], w[i]];
    for (const p of round) {
      const cx = Math.max(Math.min(p.cx, Math.max(x1, x2)), Math.min(x1, x2));
      const cy = Math.max(Math.min(p.cy, Math.max(y1, y2)), Math.min(y1, y2));
      assert.ok(Math.hypot(p.cx - cx, p.cy - cy) >= p.r, `wire ${x1},${y1}-${x2},${y2} crosses ${p.name}`);
    }
    const len = Math.hypot(x2 - x1, y2 - y1);
    for (let s = 0; s <= len; s++) {
      const [x, y] = [x1 + ((x2 - x1) * s) / len, y1 + ((y2 - y1) * s) / len];
      assert.ok(!(x > gx && x < gx + gw && y > gy && y < gy + gh), `wire ${x1},${y1}-${x2},${y2} crosses the generator`);
    }
  }
  // Netlist: each wire joins its two ends; parts touching the same conductor share a node.
  const parent = new Map();
  const find = (k) => ((parent.get(k) ?? k) === k ? k : find(parent.get(k)));
  for (const w of wires) parent.set(find(key(w[0])), find(key(w.at(-1))));
  const nodes = new Map();
  for (const p of parts) for (const t of [p.a, p.b]) nodes.set(find(key(t)), [...(nodes.get(find(key(t))) ?? []), p.name]);
  assert.deepEqual([...nodes.values()].map((names) => names.sort().join(' ')).sort(), [
    'A A1 A2', // junction after the main ammeter: both branches start here
    'A G', // main line: generator to A
    'A1 L1', // upper branch: A1 in series with L1
    'A2 L1-lower', // lower branch: A2 in series with the lower lamp
    'G L1 L1-lower', // both branches return to the generator's other terminal
  ]);
  // Upper branch A1–L1 above the lower branch A2–lamp; the lower lamp keeps the source's printed label L1.
  assert.ok(byName.A1.cy === byName.L1.cy && byName.A2.cy === byName['L1-lower'].cy && byName.A1.cy < byName.A2.cy);
  for (const p of round) assert.match(p.inner, new RegExp(`>${p.name === 'L1-lower' ? 'L1' : p.name}</text>`));
  assert.ok(svg.includes('I = I1 + I2'));
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
