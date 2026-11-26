/* Scientific audit tests for the Unit 1 force diagrams.
 *
 * These assert PHYSICS, not styling: the direction of every force arrow, the
 * point of application, arrow length vs magnitude, force symbols/units with
 * RTL safety, and the resultant's direction, magnitude and position against
 * the textbook laws (pp. 55–70):
 *   same sense      F = F1 + F2, C between A and B, closer to the larger force
 *   opposite sense  F = |F2 − F1|, sense = larger force, C outside beyond it
 *   BOTH senses     F1 × d1 = F2 × d2 at C, within a half-pixel tolerance
 *   resolution      w = F1 + F2 on an incline, R = −F2, w vertical
 *   equilibrium     F′ = −F, and a zero resultant is drawn as no single arrow
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DIAGRAMS } from '../src/diagrams.js';
import { LESSON_2_DIAGRAMS } from '../src/lesson-2-diagrams.js';
import { lesson2AssessmentDiagram } from '../src/lesson-2-test-diagrams.js';
import {
  IT1_FIGURE_IDS,
  it1GivenDiagram,
  it1SolvedDiagram,
  parallelFacts,
} from '../src/it1-diagrams.js';

const attrs = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]),
);
const linesOf = (svg) => [...svg.matchAll(/<line\b([^>]*)\/>/g)].map((m) => attrs(m[1]));
const textsOf = (svg) => [...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)]
  .map((m) => ({ ...attrs(m[1]), content: m[2].trim() }));
const num = (v) => Number(v);
const nearly = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;

/* A label must never be printed ON a force shaft (misleading placement). */
function labelOnShaft(texts, forceLines) {
  for (const t of texts) {
    const tx = num(t.x);
    const ty = num(t.y);
    if (!Number.isFinite(tx) || !Number.isFinite(ty)) continue;
    for (const l of forceLines) {
      const x = num(l.x1);
      const y1 = num(l.y1);
      const y2 = num(l.y2);
      if (Math.abs(tx - x) > 6) continue;
      const lo = Math.min(y1, y2) + 6;
      const hi = Math.max(y1, y2) - 6;
      if (ty > lo && ty < hi) return `«${t.content}» sits on the shaft at x=${x}`;
    }
  }
  return null;
}

function markersResolve(svg, label) {
  const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of svg.matchAll(/url\(#([^)]+)\)/g)) {
    assert.ok(ids.has(m[1]), `${label}: unresolved marker #${m[1]}`);
  }
}

/* --------------------------------------------------------------------------
 * 1. p63 wagon scene — the traction is horizontal/forward, not vertical.
 * ------------------------------------------------------------------------ */
test('wagon scene: horse traction is horizontal in the direction of motion on two parallel carriers', () => {
  const entry = LESSON_2_DIAGRAMS['wagon-scene'];
  const svg = entry.svg;
  const forces = linesOf(svg).filter((l) => /l2-force-(f1|f2)/.test(l.class ?? ''));
  const carriers = linesOf(svg).filter((l) => (l.class ?? '') === 'l2-carrier');

  assert.equal(forces.length, 2, 'exactly the two traction arrows');
  for (const f of forces) {
    assert.equal(num(f.y1), num(f.y2), 'a traction arrow must be horizontal (not vertical)');
    assert.ok(num(f.x2) > num(f.x1), 'both arrows point forward, the same direction');
    assert.match(f['marker-end'] ?? '', /url\(#wagon-scene-f[12]\)/);
  }
  assert.equal(forces.length, new Set(forces.map((f) => f['marker-end'])).size, 'each force keeps its own arrowhead');
  assert.equal(num(forces[0].x1), num(forces[1].x1), 'both forces start at the same hitch (point of application)');
  assert.equal(num(forces[0].x2), num(forces[1].x2), 'equal lengths — the photo gives no magnitudes');

  assert.equal(carriers.length, 2, 'two carriers');
  for (const c of carriers) assert.equal(num(c.y1), num(c.y2), 'carriers are horizontal');
  assert.notEqual(num(carriers[0].y1), num(carriers[1].y1), 'carriers are parallel and side-by-side, not coincident/intersecting');

  const labels = textsOf(svg).map((t) => t.content);
  assert.ok(labels.includes('F₁') && labels.includes('F₂'), 'F₁/F₂ symbols present');
  for (const t of textsOf(svg)) {
    if (/F[₁₂]/.test(t.content)) assert.equal(t.direction, 'ltr', 'force symbol is RTL-safe');
  }
  assert.doesNotMatch(svg, /\d+\s*(N|نيوتن|cm|m\b)/, 'no invented numeric magnitude from a photo with none');
  assert.match(svg, /أفقي|نحو الأمام/);
  assert.match(entry.platformNote, /أفقي/);
  markersResolve(svg, 'wagon-scene');
});

/* --------------------------------------------------------------------------
 * 2. Same-sense assessment diagram — F = F1 + F2, drawn to one scale.
 * ------------------------------------------------------------------------ */
test('same-sense assessment diagram: all arrows up, resultant = F1 + F2, C between and closer to the larger force', () => {
  const svg = lesson2AssessmentDiagram({ diagram: 'same-parallel' });
  const lines = linesOf(svg);
  const forces = lines.filter((l) => /assessment-force/.test(l.class ?? ''));
  const resultants = lines.filter((l) => /assessment-resultant/.test(l.class ?? ''));
  assert.equal(forces.length, 2);
  assert.equal(resultants.length, 1);

  const rodY = num(forces[0].y1);
  for (const l of [...forces, ...resultants]) {
    assert.equal(num(l.x1), num(l.x2), 'force arrows are vertical');
    assert.equal(num(l.y1), rodY, 'every arrow starts at its point of application on the rod');
    assert.ok(num(l.y2) < num(l.y1), 'all three arrows point up (same sense)');
  }
  const len = (l) => Math.abs(num(l.y1) - num(l.y2));
  const fLens = forces.map(len).sort((a, b) => a - b);
  const resLen = len(resultants[0]);
  assert.equal(resLen, fLens[0] + fLens[1], 'resultant drawn length equals F1 + F2');
  assert.ok(resLen > fLens[1], 'resultant is longer than each component');

  const byX = (l) => num(l.x1);
  const A = Math.min(...forces.map(byX));
  const B = Math.max(...forces.map(byX));
  const C = byX(resultants[0]);
  const largerX = byX(forces.find((l) => len(l) === fLens[1]));
  assert.ok(C > A && C < B, 'resultant carrier lies between A and B');
  assert.ok(Math.abs(C - largerX) < Math.abs(C - (largerX === B ? A : B)), 'C is closer to the larger force');

  const texts = textsOf(svg);
  const labels = texts.map((t) => t.content);
  for (const sym of ['F₁', 'F₂', 'F', 'A', 'B', 'C']) assert.ok(labels.includes(sym), `label ${sym}`);
  for (const t of texts) assert.equal(t.direction, 'ltr', 'all symbols are LTR inside the RTL page');
  assert.equal(labelOnShaft(texts, [...forces, ...resultants]), null, 'no label sits on a force shaft');
  assert.doesNotMatch(svg, /\d+\s*N/, 'source-neutral: no numeric magnitude is leaked');
  assert.match(svg, /<title/);
  assert.match(svg, /role="img"/);
  markersResolve(svg, 'same-parallel');
});

/* --------------------------------------------------------------------------
 * 3. Opposite-sense assessment diagram — F = |F2 − F1|, sense = larger.
 * ------------------------------------------------------------------------ */
test('opposite-sense assessment diagram: resultant = larger − smaller, points with the larger force, lies outside beyond it', () => {
  const svg = lesson2AssessmentDiagram({ diagram: 'opposite-parallel' });
  const lines = linesOf(svg);
  const forces = lines.filter((l) => /assessment-force/.test(l.class ?? ''));
  const resultants = lines.filter((l) => /assessment-resultant/.test(l.class ?? ''));
  assert.equal(forces.length, 2);
  assert.equal(resultants.length, 1);

  const len = (l) => Math.abs(num(l.y1) - num(l.y2));
  const sense = (l) => (num(l.y2) < num(l.y1) ? 'up' : 'down');
  const small = forces.reduce((a, b) => (len(a) < len(b) ? a : b));
  const large = forces.reduce((a, b) => (len(a) > len(b) ? a : b));
  const res = resultants[0];
  assert.notEqual(sense(small), sense(large), 'the two forces are opposite');
  assert.equal(sense(res), sense(large), 'resultant has the sense of the larger force');
  assert.equal(len(res), len(large) - len(small), 'resultant drawn length equals |F2 − F1|');
  assert.ok(len(res) < len(large), 'resultant is shorter than the larger force');

  const xSmall = num(small.x1);
  const xLarge = num(large.x1);
  const xRes = num(res.x1);
  assert.ok(xRes < Math.min(xSmall, xLarge) || xRes > Math.max(xSmall, xLarge), 'C is outside segment AB');
  assert.ok(Math.abs(xRes - xLarge) < Math.abs(xRes - xSmall), 'C is beyond the larger force, on its side');
  assert.ok(lines.some((l) => (l.class ?? '') === 'assessment-carrier'), 'extension carrier drawn to show C is on the line of AB');

  const texts = textsOf(svg);
  const labels = texts.map((t) => t.content);
  for (const sym of ['F₁', 'F₂', 'F', 'A', 'B', 'C']) assert.ok(labels.includes(sym), `label ${sym}`);
  for (const t of texts) assert.equal(t.direction, 'ltr');
  assert.equal(labelOnShaft(texts, [...forces, ...resultants]), null, 'no label sits on a force shaft');
  assert.doesNotMatch(svg, /\d+\s*N/, 'source-neutral: no numeric magnitude is leaked');
  markersResolve(svg, 'opposite-parallel');
});

/* --------------------------------------------------------------------------
 * 3b. Law of moments for BOTH assessment schematics (textbook pp. 65, 68):
 *     F1 × d1 = F2 × d2, with d1 = |C − A|, d2 = |C − B|.
 * Every quantity is measured from the RENDERED SVG, not from the module's
 * constants: shifting C without re-balancing the moments fails these tests.
 * ------------------------------------------------------------------------ */
function assessmentMomentGeometry(svg) {
  const lines = linesOf(svg);
  const forces = lines.filter((l) => /assessment-force/.test(l.class ?? ''));
  const resultants = lines.filter((l) => /assessment-resultant/.test(l.class ?? ''));
  assert.equal(forces.length, 2, 'two component forces');
  assert.equal(resultants.length, 1, 'one resultant');
  const f1 = forces.find((l) => /assessment-force-one/.test(l.class ?? ''));
  const f2 = forces.find((l) => /assessment-force-two/.test(l.class ?? ''));
  assert.ok(f1 && f2, 'F1/F2 carriers are identified by their semantic classes');

  const span = (l) => Math.abs(num(l.y1) - num(l.y2));
  /* Signed vertical component: up (y2 < y1) is +, down is −. */
  const signed = (l) => (num(l.y2) < num(l.y1) ? 1 : -1) * span(l);
  return {
    xA: num(f1.x1), xB: num(f2.x1), xC: num(resultants[0].x1),
    F1: span(f1), F2: span(f2), F: span(resultants[0]),
    s1: signed(f1), s2: signed(f2), sRes: signed(resultants[0]),
  };
}

/* Moment imbalance |F1·d1 − F2·d2| if the resultant carrier were at xC. */
const residualAt = (g, xC) => Math.abs(
  g.F1 * Math.abs(xC - g.xA) - g.F2 * Math.abs(xC - g.xB),
);

/* C is rounded to a whole SVG pixel. A displacement δ changes the residual by
 * |s1 + s2|·δ = F·δ, so |δ| ≤ 0.5 px bounds the residual by F × 0.5. This is
 * the physically derived tolerance — not an arbitrary loose epsilon. */
const pixelTolerance = (g) => 0.5 * g.F + 1e-9;

function assertMomentBalanced(g, label) {
  const d1 = Math.abs(g.xC - g.xA);
  const d2 = Math.abs(g.xC - g.xB);
  assert.ok(d1 > 0 && d2 > 0, `${label}: both moment arms are non-zero`);
  assert.equal(g.F, Math.abs(g.s1 + g.s2), `${label}: F is the signed sum of the components`);
  assert.equal(g.sRes, g.s1 + g.s2, `${label}: the resultant's sense is the signed sum`);

  /* (1) C equals the force-weighted mean of the two carriers (exact law),
   *     up to the half-pixel rounding of the drawn x coordinate. */
  const exactC = (g.s1 * g.xA + g.s2 * g.xB) / (g.s1 + g.s2);
  assert.ok(Math.abs(g.xC - exactC) <= 0.5 + 1e-9,
    `${label}: C=${g.xC} must be the moment-balanced carrier ${exactC} ± 0.5 px`);

  /* (2) The two moments about C balance within the pixel-rounding tolerance. */
  const residual = residualAt(g, g.xC);
  const tol = pixelTolerance(g);
  assert.ok(residual <= tol,
    `${label}: F1·d1=${g.F1 * d1} vs F2·d2=${g.F2 * d2}; residual ${residual} must be ≤ ${tol}`);
  assert.ok(residual / (g.F1 * d1) < 0.01, `${label}: relative moment error < 1%`);

  /* (3) Not a vacuous "C is closer / outside" check: moving C by 5 px breaks
   *     the balance by a wide margin, so this test really measures the law. */
  assert.ok(residualAt(g, g.xC + 5) > tol, `${label}: a 5 px displacement of C is detected`);
  assert.ok(residualAt(g, g.xC - 5) > tol, `${label}: a 5 px displacement of C is detected`);
  return { d1, d2, residual, tol };
}

test('same-parallel: C balances the moments F1×d1 = F2×d2 (not merely closer to the larger force)', () => {
  const g = assessmentMomentGeometry(lesson2AssessmentDiagram({ diagram: 'same-parallel' }));
  assert.equal(g.F, g.F1 + g.F2, 'resultant magnitude F = F1 + F2');
  assert.ok(g.s1 > 0 && g.s2 > 0, 'both forces act upward (same sense)');
  const { d1, d2 } = assertMomentBalanced(g, 'same-parallel');
  assert.ok(g.xC > Math.min(g.xA, g.xB) && g.xC < Math.max(g.xA, g.xB), 'C still lies between A and B');
  assert.ok(d1 > d2, 'the smaller force has the longer moment arm');
});

test('opposite-parallel: C balances the moments F1×d1 = F2×d2 outside AB (not merely outside)', () => {
  const g = assessmentMomentGeometry(lesson2AssessmentDiagram({ diagram: 'opposite-parallel' }));
  assert.equal(g.F, Math.abs(g.F2 - g.F1), 'resultant magnitude F = |F2 − F1|');
  assert.ok(g.s1 * g.s2 < 0, 'the two forces are opposite in sense');
  const { d1, d2 } = assertMomentBalanced(g, 'opposite-parallel');
  assert.ok(g.xC < Math.min(g.xA, g.xB) || g.xC > Math.max(g.xA, g.xB), 'C lies outside AB');
  assert.ok(d2 < d1, 'the larger force has the shorter moment arm');
  assert.ok(Math.abs(g.xC - g.xB) < Math.abs(g.xC - g.xA), 'C is beyond the larger force, on its side');
});

/* --------------------------------------------------------------------------
 * 4. Worked / problem diagrams — printed magnitudes obey the textbook law.
 * ------------------------------------------------------------------------ */
test('lesson 2 worked/problem diagrams: labelled magnitudes satisfy F=F1+F2 or F=|F2−F1| with N units', () => {
  const cases = [
    { key: 'worked-same', f1: 20, f2: 30, f: 50, law: 'sum' },
    { key: 'problem-1', f1: 40, f2: 10, f: 50, law: 'sum' },
    { key: 'worked-opposite', f1: 200, f2: 300, f: 100, law: 'diff' },
    { key: 'problem-2', f1: 80, f2: 20, f: 60, law: 'diff' },
  ];
  for (const { key, f1, f2, f, law } of cases) {
    const svg = LESSON_2_DIAGRAMS[key].svg;
    const texts = textsOf(svg);
    const joined = texts.map((t) => t.content).join(' ');
    assert.match(joined, new RegExp(`F₁ = ${f1} N`), `${key}: F₁ label`);
    assert.match(joined, new RegExp(`F₂ = ${f2} N`), `${key}: F₂ label`);
    assert.match(joined, new RegExp(`F = ${f} N`), `${key}: F label`);
    assert.equal(f, law === 'sum' ? f1 + f2 : Math.abs(f2 - f1), `${key}: resultant magnitude law`);
    for (const t of texts) {
      if (/F\s*=/.test(t.content)) assert.equal(t.direction, 'ltr', `${key}: magnitude label is RTL-safe`);
    }
    markersResolve(svg, key);
  }
});

/* --------------------------------------------------------------------------
 * 5. p60 inclined plane — direction of w, F1, F2, R and vector resolution.
 * ------------------------------------------------------------------------ */
test('p60 inclined-plane diagram: w vertical down, F1 down-slope, F2 into the surface, R = −F2, and w = F1 + F2', () => {
  const g = DIAGRAMS['inclined-plane'].geometry;
  const o = g.origin;
  const w = { x: g.weightTip.x - o.x, y: g.weightTip.y - o.y };
  const f1 = { x: g.f1Tip.x - o.x, y: g.f1Tip.y - o.y };
  const f2 = { x: g.f2Tip.x - o.x, y: g.f2Tip.y - o.y };
  const r = { x: g.normalTip.x - o.x, y: g.normalTip.y - o.y };

  assert.ok(nearly(w.x, 0) && w.y > 0, 'weight w is vertical downward');
  assert.ok(f1.x < 0 && f1.y > 0, 'F1 is parallel to the plane, down the slope');
  assert.ok(f2.x > 0 && f2.y > 0, 'F2 is perpendicular into the surface');
  assert.ok(r.x < 0 && r.y < 0, 'reaction R is perpendicular out of the surface (up)');
  assert.ok(nearly(w.x, f1.x + f2.x) && nearly(w.y, f1.y + f2.y), 'w is the diagonal: w = F1 + F2');
  assert.ok(nearly(r.x, -f2.x) && nearly(r.y, -f2.y), 'R balances the perpendicular component: R = −F2');
  assert.ok(nearly(f1.x * f2.x + f1.y * f2.y, 0), 'F1 ⟂ F2 (rectangle, not a generic parallelogram)');

  const svg = DIAGRAMS['inclined-plane'].svg;
  const symbols = textsOf(svg).map((t) => t.content);
  for (const s of ['R', 'F', 'w']) assert.ok(symbols.some((x) => x === s), `${s} symbol present`);
  markersResolve(svg, 'inclined-plane');
});

/* --------------------------------------------------------------------------
 * 6. Independent Test 1 — resultant physics and no answer leaking in givens.
 * ------------------------------------------------------------------------ */
test('parallelFacts obeys both textbook laws and F1·d1 = F2·d2 for every parallel problem', () => {
  const specs = [
    { F1: 15, F2: 45, d: 2, sense: 'same' },
    { F1: 60, F2: 20, d: 0.8, sense: 'same' },
    { F1: 100, F2: 300, d: 1, sense: 'same' },
    { F1: 30, F2: 90, d: 0.6, sense: 'opposite' },
    { F1: 40, F2: 160, d: 0.6, sense: 'opposite' },
    { F1: 50, F2: 200, d: 1.5, sense: 'opposite' },
  ];
  for (const s of specs) {
    const { F, d1, d2, d } = parallelFacts(s);
    assert.equal(F, s.sense === 'same' ? s.F1 + s.F2 : Math.abs(s.F2 - s.F1));
    assert.ok(nearly(s.F1 * d1, s.F2 * d2, 1e-9), 'the two جداء are equal');
    assert.equal(d, s.d);
    assert.ok(d1 > 0 && d2 > 0);
  }
});

test('independent-test solved figures: magnitudes satisfy the law, resultant sense follows the larger force, givens never leak F', () => {
  const parallel = IT1_FIGURE_IDS.filter((id) => /^p0[1-6]$/.test(id));
  for (const id of parallel) {
    const solved = it1SolvedDiagram(`it1${id}`);
    const values = [...solved.matchAll(/class="it1-value"[^>]*>([\d.]+)\s*N<\/text>/g)]
      .map((m) => Number(m[1])).sort((a, b) => b - a);
    assert.equal(values.length, 3, `${id}: F₁, F₂ and the resultant are labelled in N`);
    assert.equal(values[0], values[1] + values[2], `${id}: largest magnitude = sum of the other two`);

    const resLine = solved.match(/<line[^>]*stroke="#c0392b"[^>]*marker-end="url\(#[^"]*-res\)"[^>]*\/>/);
    assert.ok(resLine, `${id}: a resultant arrow is drawn after submission`);
    const a = attrs(resLine[0]);
    const isSame = /^p0[1-3]$/.test(id);
    assert.equal(num(a.y2) < num(a.y1), isSame, `${id}: resultant sense (up same / down opposite)`);
  }
  for (const id of IT1_FIGURE_IDS) {
    const given = it1GivenDiagram({ diagram: id });
    assert.doesNotMatch(given, /-res\)|stroke="#c0392b"/, `${id}: givens never reveal the resultant`);
    assert.match(it1SolvedDiagram(`it1${id}`), /-res\)/, `${id}: solved figure exposes the resultant`);
  }
});

/* --------------------------------------------------------------------------
 * 7. Light cross-library invariants: accessible labels + resolvable markers.
 * ------------------------------------------------------------------------ */
test('every static force diagram is accessible and every arrow marker resolves', () => {
  for (const [group, lib] of [['DIAGRAMS', DIAGRAMS], ['LESSON_2_DIAGRAMS', LESSON_2_DIAGRAMS]]) {
    for (const [key, entry] of Object.entries(lib)) {
      const { svg } = entry;
      assert.match(svg, /role="img"/, `${group}.${key}: role`);
      assert.match(svg, /<title/, `${group}.${key}: title`);
      assert.match(svg, /<desc/, `${group}.${key}: desc`);
      markersResolve(svg, `${group}.${key}`);
    }
  }
});
