import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSON_PAGES } from '../src/lesson-content.js';
import {
  concurrentDiagramGeometry,
  concurrentExperimentGeometry,
  forceResolutionDiagramGeometry,
  perpendicularDiagramGeometry,
  resolveForceIntoPerpendicularComponents,
  resultantOfConcurrentForces,
  resultantOfPerpendicularForces,
} from '../src/simulation-logic.js';
import { mountSimulationExperiences, simulationMarkup } from '../src/simulations.js';

const vectorBetween = (start, end) => ({ x: end.x - start.x, y: end.y - start.y });
const near = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
};
const dot = (first, second) => first.x * second.x + first.y * second.y;

class TestNode {
  constructor({ value = '', step = '', dataset = {} } = {}) {
    this.value = value;
    this.step = step;
    this.dataset = dataset;
    this.attributes = new Map();
    this.listeners = new Map();
    this.innerHTML = '';
    this.textContent = '';
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name); }
  addEventListener(name, callback) { this.listeners.set(name, callback); }
  emit(name) { this.listeners.get(name)?.({ target: this }); }
}

function fakeSimulationRoot(type) {
  const isConcurrent = type === 'concurrent';
  const prefix = isConcurrent ? 'sim-a' : 'sim-b';
  const inputValues = isConcurrent
    ? { f1: ['6', '0.5'], f2: ['4', '0.5'], angle: ['45', '1'] }
    : { f1: ['50', '1'], f2: ['70', '1'] };
  const inputs = Object.fromEntries(Object.entries(inputValues).map(([name, [value, step]]) => [name, new TestNode({ value, step })]));
  const ids = isConcurrent
    ? ['f1-value', 'f2-value', 'angle-value', 'vector-f1', 'vector-f2', 'vector-result', 'edge-f1', 'edge-f2', 'point-o', 'point-m', 'label-m', 'angle-arc', 'result', 'direction', 'status']
    : ['f1-value', 'f2-value', 'vector-f1', 'vector-f2', 'vector-result', 'edge-f1', 'edge-f2', 'point-o', 'point-m', 'label-m', 'triangle', 'right-angle-o', 'right-angle-triangle', 'result', 'direction', 'status'];
  const nodes = new Map(ids.map((id) => [`#${prefix}-${id}`, new TestNode()]));
  nodes.set('[data-role="diagram-description"]', new TestNode());
  const inputSelectors = new Map(Object.entries(inputs).map(([name, node]) => [`[data-input="${name}"]`, node]));
  const root = {
    dataset: { simulation: type },
    querySelector: (selector) => nodes.get(selector) ?? inputSelectors.get(selector) ?? null,
    querySelectorAll: (selector) => selector === 'input[type="range"]' ? Object.values(inputs) : [],
  };
  const container = { querySelectorAll: (selector) => selector === '[data-simulation]' ? [root] : [] };
  return { root, container, inputs, nodes };
}

function fakeConcurrentExperimentRoot() {
  const inputs = {
    horizontal: new TestNode({ value: '50', step: '1' }),
    vertical: new TestNode({ value: '50', step: '1' }),
  };
  const ids = [
    'horizontal-value', 'vertical-value', 'carrier-f1', 'carrier-f2', 'carrier-weight',
    'vector-f1', 'vector-f2', 'vector-weight', 'label-f1', 'label-f2', 'label-weight',
    'guide-f1', 'guide-f2', 'point-ring', 'point-o', 'label-o', 'status',
  ];
  const nodes = new Map(ids.map((id) => [`#sim-c-${id}`, new TestNode()]));
  nodes.set('[data-role="diagram-description"]', new TestNode());
  const inputSelectors = new Map(Object.entries(inputs).map(([name, node]) => [`[data-input="${name}"]`, node]));
  const root = {
    dataset: { simulation: 'spring-concurrency' },
    querySelector: (selector) => nodes.get(selector) ?? inputSelectors.get(selector) ?? null,
    querySelectorAll: (selector) => selector === 'input[type="range"]' ? Object.values(inputs) : [],
  };
  const container = { querySelectorAll: (selector) => selector === '[data-simulation]' ? [root] : [] };
  return { root, container, inputs, nodes };
}

function fakeForceResolutionRoot() {
  const inputs = {
    force: new TestNode({ value: '8', step: '0.5' }),
    angle: new TestNode({ value: '35', step: '1' }),
  };
  const ids = [
    'force-value', 'angle-value', 'x-value', 'y-value', 'rectangle', 'projection-x', 'projection-y',
    'component-x', 'component-y', 'force-vector', 'origin', 'point-x', 'point-y', 'point-m',
    'label-x', 'label-y', 'label-m', 'status',
  ];
  const nodes = new Map(ids.map((id) => [`#sim-d-${id}`, new TestNode()]));
  nodes.set('[data-role="diagram-description"]', new TestNode());
  const inputSelectors = new Map(Object.entries(inputs).map(([name, node]) => [`[data-input="${name}"]`, node]));
  const root = {
    dataset: { simulation: 'force-resolution' },
    querySelector: (selector) => nodes.get(selector) ?? inputSelectors.get(selector) ?? null,
    querySelectorAll: (selector) => selector === 'input[type="range"]' ? Object.values(inputs) : [],
  };
  const container = { querySelectorAll: (selector) => selector === '[data-simulation]' ? [root] : [] };
  return { root, container, inputs, nodes };
}

function expectVectorAddition(result) {
  near(result.resultant.x, result.F1.x + result.F2.x);
  near(result.resultant.y, result.F1.y + result.F2.y);
  near(result.magnitude, Math.hypot(result.resultant.x, result.resultant.y));
}

test('only the page 56 and page 60 experiences plus the two approved Phase 3A simulations are in the lesson flow', () => {
  const ids = LESSON_PAGES.flatMap((item) => item.blocks
    .filter((block) => block.type === 'simulation')
    .map((block) => [item.page, block.id]));
  assert.deepEqual(ids, [[56, 'spring-concurrency'], [57, 'concurrent'], [59, 'perpendicular'], [60, 'force-resolution']]);
});

test('Simulation A: changing F1 magnitude changes the computed resultant and drawn endpoint', () => {
  const original = resultantOfConcurrentForces(6, 4, 45);
  const changed = resultantOfConcurrentForces(7, 4, 45);
  const originalGeometry = concurrentDiagramGeometry(original);
  const changedGeometry = concurrentDiagramGeometry(changed);
  assert.notEqual(changed.magnitude, original.magnitude);
  assert.notEqual(changedGeometry.F1Tip.x, originalGeometry.F1Tip.x);
  assert.notEqual(changedGeometry.resultantTip.x, originalGeometry.resultantTip.x);
  expectVectorAddition(changed);
});

test('Simulation A: changing F2 magnitude changes the computed resultant and drawn endpoint', () => {
  const original = resultantOfConcurrentForces(6, 4, 45);
  const changed = resultantOfConcurrentForces(6, 5, 45);
  const originalGeometry = concurrentDiagramGeometry(original);
  const changedGeometry = concurrentDiagramGeometry(changed);
  assert.notEqual(changed.magnitude, original.magnitude);
  assert.notEqual(changedGeometry.F2Tip.x, originalGeometry.F2Tip.x);
  assert.notEqual(changedGeometry.F2Tip.y, originalGeometry.F2Tip.y);
  assert.notEqual(changedGeometry.resultantTip.y, originalGeometry.resultantTip.y);
  expectVectorAddition(changed);
});

test('Simulation A: changing the included angle changes F2 direction and resultant', () => {
  const acute = resultantOfConcurrentForces(6, 4, 45);
  const obtuse = resultantOfConcurrentForces(6, 4, 120);
  const acuteGeometry = concurrentDiagramGeometry(acute);
  const obtuseGeometry = concurrentDiagramGeometry(obtuse);
  assert.notEqual(acute.magnitude, obtuse.magnitude);
  assert.notEqual(acute.directionDegrees, obtuse.directionDegrees);
  assert.notEqual(acuteGeometry.F2Tip.x, obtuseGeometry.F2Tip.x);
  assert.notEqual(acuteGeometry.F2Tip.y, obtuseGeometry.F2Tip.y);
  expectVectorAddition(obtuse);
});

test('Simulation A: zero resultant reports an undefined direction; angle and magnitude inputs are validated', () => {
  const cancelled = resultantOfConcurrentForces(5, 5, 180);
  assert.equal(cancelled.magnitude, 0);
  assert.equal(cancelled.directionDegrees, null);
  assert.throws(() => resultantOfConcurrentForces(-1, 2, 45), RangeError);
  assert.throws(() => resultantOfConcurrentForces(1, 2, 181), RangeError);
});

test('Simulation A: parallelogram points and resultant remain the vector sum', () => {
  const result = resultantOfConcurrentForces(6, 4, 70);
  const geometry = concurrentDiagramGeometry(result);
  const firstScreenVector = vectorBetween(geometry.origin, geometry.F1Tip);
  const secondScreenVector = vectorBetween(geometry.origin, geometry.F2Tip);
  const resultantScreenVector = vectorBetween(geometry.origin, geometry.resultantTip);
  near(resultantScreenVector.x, firstScreenVector.x + secondScreenVector.x);
  near(resultantScreenVector.y, firstScreenVector.y + secondScreenVector.y);
  near(geometry.F1Tip.x + secondScreenVector.x, geometry.resultantTip.x);
  near(geometry.F1Tip.y + secondScreenVector.y, geometry.resultantTip.y);
  near(geometry.F2Tip.x + firstScreenVector.x, geometry.resultantTip.x);
  near(geometry.F2Tip.y + firstScreenVector.y, geometry.resultantTip.y);
});

test('Simulation B: changing either perpendicular force updates the hypotenuse result', () => {
  const base = resultantOfPerpendicularForces(50, 70);
  const changedF1 = resultantOfPerpendicularForces(60, 70);
  const changedF2 = resultantOfPerpendicularForces(50, 80);
  assert.notEqual(changedF1.magnitude, base.magnitude);
  assert.notEqual(changedF2.magnitude, base.magnitude);
  near(base.magnitude, Math.sqrt(50 ** 2 + 70 ** 2));
  near(changedF1.magnitude, Math.sqrt(60 ** 2 + 70 ** 2));
  near(changedF2.magnitude, Math.sqrt(50 ** 2 + 80 ** 2));
});

test('Simulation B: force vectors remain perpendicular and the triangle diagonal matches their sum', () => {
  const result = resultantOfPerpendicularForces(50, 70);
  const geometry = perpendicularDiagramGeometry(result);
  near(dot(result.F1, result.F2), 0);
  near(dot(
    vectorBetween(geometry.origin, geometry.F1Tip),
    vectorBetween(geometry.origin, geometry.F2Tip),
  ), 0);
  const screenResult = vectorBetween(geometry.origin, geometry.resultantTip);
  const screenF1 = vectorBetween(geometry.origin, geometry.F1Tip);
  const screenF2 = vectorBetween(geometry.origin, geometry.F2Tip);
  near(screenResult.x, screenF1.x + screenF2.x);
  near(screenResult.y, screenF1.y + screenF2.y);
  expectVectorAddition(result);
});

test('Simulation B: magnitude and displayed mathematical model agree for varied inputs', () => {
  for (const [f1, f2] of [[0, 0], [3, 4], [50, 70], [100, 100]]) {
    const result = resultantOfPerpendicularForces(f1, f2);
    near(result.magnitude, Math.hypot(f1, f2));
    near(result.magnitude ** 2, f1 ** 2 + f2 ** 2);
    assert.equal(result.angleDegrees, 90);
  }
});

test('the mounted Simulation A range event updates the result, aria-valuetext, and SVG vectors', () => {
  const { container, inputs, nodes } = fakeSimulationRoot('concurrent');
  mountSimulationExperiences(container);
  const previousTip = nodes.get('#sim-a-vector-f1').getAttribute('x2');
  inputs.f1.value = '7';
  inputs.f1.emit('input');
  const expected = Math.sqrt(7 ** 2 + 4 ** 2 + 2 * 7 * 4 * Math.cos(Math.PI / 4));
  assert.ok(nodes.get('#sim-a-result').innerHTML.includes(`${Number(expected.toFixed(2)).toString()} N`));
  assert.notEqual(nodes.get('#sim-a-vector-f1').getAttribute('x2'), previousTip);
  assert.equal(inputs.f1.getAttribute('aria-valuetext'), '7 نيوتن');
  assert.ok(nodes.get('#sim-a-status').innerHTML.includes('نتيجة المحاكاة'));
});

test('the mounted Simulation B range event updates the Pythagorean output and triangle geometry', () => {
  const { container, inputs, nodes } = fakeSimulationRoot('perpendicular');
  mountSimulationExperiences(container);
  const previousTriangle = nodes.get('#sim-b-triangle').getAttribute('points');
  inputs.f2.value = '80';
  inputs.f2.emit('input');
  const expected = Math.hypot(50, 80);
  assert.ok(nodes.get('#sim-b-result').innerHTML.includes(`${Number(expected.toFixed(2)).toString()} N`));
  assert.notEqual(nodes.get('#sim-b-triangle').getAttribute('points'), previousTriangle);
  assert.equal(inputs.f2.getAttribute('aria-valuetext'), '80 نيوتن');
  assert.ok(nodes.get('#sim-b-status').innerHTML.includes('نتيجة المحاكاة'));
});

test('page 56 experiment geometry keeps all three lines of action concurrent as the point moves', () => {
  const initial = concurrentExperimentGeometry(50, 50);
  const moved = concurrentExperimentGeometry(85, 70);
  assert.notEqual(moved.origin.x, initial.origin.x);
  assert.notEqual(moved.origin.y, initial.origin.y);
  assert.notEqual(moved.arrowTips.F1.x, initial.arrowTips.F1.x);
  assert.notEqual(moved.arrowTips.F2.y, initial.arrowTips.F2.y);
  for (const geometry of [initial, moved]) {
    for (const carrier of Object.values(geometry.carriers)) {
      const line = vectorBetween(carrier.start, carrier.end);
      const toOrigin = vectorBetween(carrier.start, geometry.origin);
      near(line.x * toOrigin.y - line.y * toOrigin.x, 0, 1e-7);
    }
    near(geometry.carriers.W.start.x, geometry.origin.x);
    near(geometry.carriers.W.end.x, geometry.origin.x);
  }
  assert.throws(() => concurrentExperimentGeometry(-1, 50), RangeError);
  assert.throws(() => concurrentExperimentGeometry(50, 101), RangeError);
});

test('page 56 position controls update the common point, force carriers, and accessible status', () => {
  const { container, inputs, nodes } = fakeConcurrentExperimentRoot();
  mountSimulationExperiences(container);
  const initialX = Number(nodes.get('#sim-c-point-o').getAttribute('cx'));
  inputs.horizontal.value = '80';
  inputs.horizontal.emit('input');
  inputs.vertical.value = '70';
  inputs.vertical.emit('input');
  const expected = concurrentExperimentGeometry(80, 70);
  near(Number(nodes.get('#sim-c-point-o').getAttribute('cx')), expected.origin.x);
  near(Number(nodes.get('#sim-c-point-o').getAttribute('cy')), expected.origin.y);
  assert.notEqual(expected.origin.x, initialX);
  assert.equal(inputs.horizontal.getAttribute('aria-valuetext'), '80 بالمئة');
  assert.equal(inputs.vertical.getAttribute('aria-valuetext'), '70 بالمئة');
  assert.match(nodes.get('#sim-c-status').innerHTML, /تلتقي حوامل قوتي الشد وقوة الثقل/);
  assert.match(nodes.get('[data-role="diagram-description"]').textContent, /تلتقي عند O/);
  for (const [name, id] of [['F1', 'f1'], ['F2', 'f2'], ['W', 'weight']]) {
    const line = nodes.get(`#sim-c-carrier-${id}`);
    const start = { x: Number(line.getAttribute('x1')), y: Number(line.getAttribute('y1')) };
    const end = { x: Number(line.getAttribute('x2')), y: Number(line.getAttribute('y2')) };
    const segment = vectorBetween(start, end);
    const toOrigin = vectorBetween(start, expected.origin);
    near(segment.x * toOrigin.y - segment.y * toOrigin.x, 0, 1e-7);
    assert.equal(line.getAttribute('visibility'), 'visible', `${name} carrier should be visible`);
  }
});

test('page 56 interactive markup remains a schematic source reference with keyboard-accessible controls', () => {
  const markup = simulationMarkup('spring-concurrency');
  assert.match(markup, /محاكاة تفاعلية من المنصة/);
  assert.match(markup, /لا يعيد بناء اللوح أو ترتيب الأدوات الملتبس/);
  assert.match(markup, /aria-label="تحريك نقطة التأثير أفقياً"/);
  assert.match(markup, /aria-label="تحريك نقطة التأثير رأسياً"/);
  assert.match(markup, /aria-valuetext=/);
  assert.match(markup, /role="status" aria-live="polite"/);
  assert.match(markup, /<math[^>]+dir="ltr"/);
  assert.equal((markup.match(/type="range"/g) ?? []).length, 2);
  assert.match(markup, /simulation-concurrency-carrier/);
  assert.match(markup, /sim-vector-weight/);
  assert.doesNotMatch(markup, /<button\b/);
});

test('page 60 force resolution projects the force onto perpendicular components', () => {
  const horizontal = resolveForceIntoPerpendicularComponents(10, 0);
  const vertical = resolveForceIntoPerpendicularComponents(10, 90);
  const oblique = resolveForceIntoPerpendicularComponents(8, 35);
  near(horizontal.componentX, 10);
  near(horizontal.componentY, 0);
  near(vertical.componentX, 0);
  near(vertical.componentY, 10);
  near(oblique.componentX, 8 * Math.cos(35 * Math.PI / 180));
  near(oblique.componentY, 8 * Math.sin(35 * Math.PI / 180));
  near(Math.hypot(oblique.componentX, oblique.componentY), oblique.magnitude);
  assert.throws(() => resolveForceIntoPerpendicularComponents(-1, 35), RangeError);
  assert.throws(() => resolveForceIntoPerpendicularComponents(8, 91), RangeError);
});

test('page 60 component vectors form the rectangle and reconstruct the original force', () => {
  const components = resolveForceIntoPerpendicularComponents(8, 35);
  const geometry = forceResolutionDiagramGeometry(components);
  const componentX = vectorBetween(geometry.origin, geometry.XTip);
  const componentY = vectorBetween(geometry.origin, geometry.YTip);
  const originalForce = vectorBetween(geometry.origin, geometry.resultantTip);
  near(dot(componentX, componentY), 0);
  near(originalForce.x, componentX.x + componentY.x);
  near(originalForce.y, componentX.y + componentY.y);
  near(geometry.XTip.x, geometry.resultantTip.x);
  near(geometry.YTip.y, geometry.resultantTip.y);
});

test('page 60 force and angle controls update the projections, vector diagram, and live status', () => {
  const { container, inputs, nodes } = fakeForceResolutionRoot();
  mountSimulationExperiences(container);
  const oldForceTip = nodes.get('#sim-d-force-vector').getAttribute('x2');
  inputs.force.value = '9.5';
  inputs.force.emit('input');
  inputs.angle.value = '60';
  inputs.angle.emit('input');
  const components = resolveForceIntoPerpendicularComponents(9.5, 60);
  const geometry = forceResolutionDiagramGeometry(components);
  near(Number(nodes.get('#sim-d-force-vector').getAttribute('x2')), geometry.resultantTip.x);
  near(Number(nodes.get('#sim-d-force-vector').getAttribute('y2')), geometry.resultantTip.y);
  near(Number(nodes.get('#sim-d-component-x').getAttribute('x2')), geometry.XTip.x);
  near(Number(nodes.get('#sim-d-component-y').getAttribute('y2')), geometry.YTip.y);
  assert.notEqual(nodes.get('#sim-d-force-vector').getAttribute('x2'), oldForceTip);
  assert.equal(inputs.force.getAttribute('aria-valuetext'), '9.5 نيوتن');
  assert.equal(inputs.angle.getAttribute('aria-valuetext'), '60 درجة');
  assert.equal(nodes.get('#sim-d-projection-x').getAttribute('visibility'), 'visible');
  assert.equal(nodes.get('#sim-d-projection-y').getAttribute('visibility'), 'visible');
  assert.match(nodes.get('#sim-d-status').innerHTML, /جمعهما المتجهي يعيد القوة الأصلية/);
  assert.match(nodes.get('[data-role="diagram-description"]').textContent, /زاوية 60 درجة/);
});

test('page 60 markup uses isolated OX and OY vector notation and labeled native controls', () => {
  const markup = simulationMarkup('force-resolution');
  assert.match(markup, /محاكاة تفاعلية من المنصة/);
  assert.match(markup, /aria-label="مقدار القوة الأصلية بوحدة النيوتن"/);
  assert.match(markup, /aria-label="زاوية القوة من محور OX بالدرجات"/);
  assert.match(markup, /aria-valuetext=/);
  assert.match(markup, /role="status" aria-live="polite"/);
  assert.match(markup, /<math[^>]+dir="ltr"/);
  assert.match(markup, /aria-label="vector OM equals vector OX plus vector OY"/);
  assert.match(markup, /aria-label="vector O X"/);
  assert.match(markup, /aria-label="vector O Y"/);
  assert.match(markup, /simulation-resolution-axis/);
  assert.match(markup, /simulation-construction/);
  assert.equal((markup.match(/type="range"/g) ?? []).length, 2);
  assert.doesNotMatch(markup, /[αθ]/);
  assert.doesNotMatch(markup, /<button\b/);
});

test('simulation controls are native accessible ranges and results are announced', () => {
  const concurrent = simulationMarkup('concurrent');
  const perpendicular = simulationMarkup('perpendicular');
  for (const markup of [concurrent, perpendicular]) {
    assert.match(markup, /محاكاة تفاعلية من المنصة/);
    assert.match(markup, /type="range"/);
    assert.match(markup, /aria-valuetext=/);
    assert.match(markup, /role="status" aria-live="polite"/);
    assert.doesNotMatch(markup, /<button\b/);
  }
  assert.equal((concurrent.match(/type="range"/g) ?? []).length, 3);
  assert.equal((perpendicular.match(/type="range"/g) ?? []).length, 2);
  assert.match(concurrent, /aria-label="الزاوية بين F1 وF2 بالدرجات"/);
  assert.match(concurrent, /aria-labelledby="sim-a-result-label"/);
  assert.match(perpendicular, /aria-labelledby="sim-b-result-label"/);
  assert.match(concurrent, /marker-end="url\(#sim-a-result-arrow\)"/);
  assert.match(concurrent, /simulation-construction/);
  assert.match(perpendicular, /شرح المنصة/);
  assert.match(perpendicular, /msqrt/);
  assert.match(perpendicular, /simulation-triangle-fill/);
  assert.match(perpendicular, /simulation-right-angle/);
});
