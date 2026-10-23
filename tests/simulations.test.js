import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSON_PAGES } from '../src/lesson-content.js';
import {
  classifyParallelogramShape,
  concurrentDiagramGeometry,
  concurrentExperimentGeometry,
  forceResolutionDiagramGeometry,
  inclinedPlaneDiagramGeometry,
  inclinedPlaneResolution,
  perpendicularDiagramGeometry,
  perpendicularScaleModel,
  resolveForceIntoPerpendicularComponents,
  resultantOfConcurrentForces,
  resultantOfPerpendicularForces,
  solveMissingPerpendicularForce,
  springBoardEquilibrium,
} from '../src/simulation-logic.js';
import { mountSimulationExperiences, SIM_PREDICTIONS, simulationMarkup } from '../src/simulations.js';

const near = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} to be within ${tolerance} of ${expected}`);
};
const vectorBetween = (start, end) => ({ x: end.x - start.x, y: end.y - start.y });
const dot = (first, second) => first.x * second.x + first.y * second.y;

class TestNode {
  constructor(attributes = {}) {
    this.attributes = new Map(Object.entries(attributes).map(([key, value]) => [key, String(value)]));
    this.dataset = {};
    this.listeners = new Map();
    this.innerHTML = '';
    this.textContent = '';
    this.value = attributes.value ? String(attributes.value) : '';
    this.step = attributes.step ? String(attributes.step) : '1';
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }

  addEventListener(type, listener) {
    const existing = this.listeners.get(type) ?? [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }

  emit(type) {
    for (const listener of this.listeners.get(type) ?? []) listener({ target: this });
  }
}

function fakeConcurrentRoot() {
  const nodes = new Map([
    ['#sim-a-f1-value', new TestNode()],
    ['#sim-a-f2-value', new TestNode()],
    ['#sim-a-angle-value', new TestNode()],
    ['#sim-a-vector-f1', new TestNode()],
    ['#sim-a-vector-f2', new TestNode()],
    ['#sim-a-vector-result', new TestNode()],
    ['#sim-a-vector-eq', new TestNode()],
    ['#sim-a-edge-f1', new TestNode()],
    ['#sim-a-edge-f2', new TestNode()],
    ['#sim-a-point-o', new TestNode()],
    ['#sim-a-point-m', new TestNode()],
    ['#sim-a-label-m', new TestNode()],
    ['#sim-a-label-eq', new TestNode()],
    ['#sim-a-angle-arc', new TestNode()],
    ['#sim-a-result', new TestNode()],
    ['#sim-a-direction', new TestNode()],
    ['#sim-a-shape', new TestNode()],
    ['#sim-a-status', new TestNode()],
    ['[data-role="why-changed"]', new TestNode()],
    ['[data-role="diagram-description"]', new TestNode()],
  ]);
  const f1 = new TestNode({ value: '6', step: '0.5' });
  const f2 = new TestNode({ value: '4', step: '0.5' });
  const angle = new TestNode({ value: '45', step: '1' });
  nodes.set('[data-input="f1"]', f1);
  nodes.set('[data-input="f2"]', f2);
  nodes.set('[data-input="angle"]', angle);
  const root = {
    dataset: { simulation: 'concurrent' },
    querySelector: (selector) => nodes.get(selector),
    querySelectorAll: (selector) => (selector === 'input[type="range"]' ? [f1, f2, angle] : []),
  };
  return {
    container: { querySelectorAll: () => [root] },
    root,
    inputs: { f1, f2, angle },
    nodes,
  };
}

function fakePerpendicularRoot() {
  const nodes = new Map([
    ['#sim-b-f1-value', new TestNode()],
    ['#sim-b-f2-value', new TestNode()],
    ['#sim-b-vector-f1', new TestNode()],
    ['#sim-b-vector-f2', new TestNode()],
    ['#sim-b-vector-result', new TestNode()],
    ['#sim-b-edge-f1', new TestNode()],
    ['#sim-b-edge-f2', new TestNode()],
    ['#sim-b-point-o', new TestNode()],
    ['#sim-b-point-m', new TestNode()],
    ['#sim-b-label-m', new TestNode()],
    ['#sim-b-triangle', new TestNode()],
    ['#sim-b-right-angle-o', new TestNode()],
    ['#sim-b-right-angle-triangle', new TestNode()],
    ['#sim-b-result', new TestNode()],
    ['#sim-b-direction', new TestNode()],
    ['#sim-b-steps', new TestNode()],
    ['#sim-b-status', new TestNode()],
    ['[data-role="why-changed"]', new TestNode()],
    ['[data-role="diagram-description"]', new TestNode()],
  ]);
  const f1 = new TestNode({ value: '50', step: '1' });
  const f2 = new TestNode({ value: '70', step: '1' });
  nodes.set('[data-input="f1"]', f1);
  nodes.set('[data-input="f2"]', f2);
  const root = {
    dataset: { simulation: 'perpendicular' },
    querySelector: (selector) => nodes.get(selector),
    querySelectorAll: (selector) => (selector === 'input[type="range"]' ? [f1, f2] : []),
  };
  return {
    container: { querySelectorAll: () => [root] },
    inputs: { f1, f2 },
    nodes,
  };
}

function fakeConcurrentExperimentRoot() {
  const nodes = new Map([
    ['#sim-c-horizontal-value', new TestNode()],
    ['#sim-c-vertical-value', new TestNode()],
    ['#sim-c-carrier-f1', new TestNode()],
    ['#sim-c-carrier-f2', new TestNode()],
    ['#sim-c-carrier-weight', new TestNode()],
    ['#sim-c-vector-f1', new TestNode()],
    ['#sim-c-vector-f2', new TestNode()],
    ['#sim-c-vector-weight', new TestNode()],
    ['#sim-c-point-ring', new TestNode()],
    ['#sim-c-point-o', new TestNode()],
    ['#sim-c-guide-f1', new TestNode()],
    ['#sim-c-guide-f2', new TestNode()],
    ['#sim-c-label-o', new TestNode()],
    ['#sim-c-label-f1', new TestNode()],
    ['#sim-c-label-f2', new TestNode()],
    ['#sim-c-label-weight', new TestNode()],
    ['#sim-c-status', new TestNode()],
    ['[data-role="why-changed"]', new TestNode()],
    ['[data-role="diagram-description"]', new TestNode()],
  ]);
  const horizontal = new TestNode({ value: '50', step: '1' });
  const vertical = new TestNode({ value: '50', step: '1' });
  nodes.set('[data-input="horizontal"]', horizontal);
  nodes.set('[data-input="vertical"]', vertical);
  const root = {
    dataset: { simulation: 'spring-concurrency' },
    querySelector: (selector) => nodes.get(selector),
    querySelectorAll: (selector) => (selector === 'input[type="range"]' ? [horizontal, vertical] : []),
  };
  return {
    container: { querySelectorAll: () => [root] },
    inputs: { horizontal, vertical },
    nodes,
  };
}

function fakeForceResolutionRoot() {
  const nodes = new Map([
    ['#sim-d-force-value', new TestNode()],
    ['#sim-d-angle-value', new TestNode()],
    ['#sim-d-rectangle', new TestNode()],
    ['#sim-d-component-x', new TestNode()],
    ['#sim-d-component-y', new TestNode()],
    ['#sim-d-force-vector', new TestNode()],
    ['#sim-d-projection-x', new TestNode()],
    ['#sim-d-projection-y', new TestNode()],
    ['#sim-d-origin', new TestNode()],
    ['#sim-d-point-x', new TestNode()],
    ['#sim-d-point-y', new TestNode()],
    ['#sim-d-point-m', new TestNode()],
    ['#sim-d-label-x', new TestNode()],
    ['#sim-d-label-y', new TestNode()],
    ['#sim-d-label-m', new TestNode()],
    ['#sim-d-x-value', new TestNode()],
    ['#sim-d-y-value', new TestNode()],
    ['#sim-d-status', new TestNode()],
    ['[data-role="why-changed"]', new TestNode()],
    ['[data-role="diagram-description"]', new TestNode()],
  ]);
  const force = new TestNode({ value: '8', step: '0.5' });
  const angle = new TestNode({ value: '35', step: '1' });
  nodes.set('[data-input="force"]', force);
  nodes.set('[data-input="angle"]', angle);
  const root = {
    dataset: { simulation: 'force-resolution' },
    querySelector: (selector) => nodes.get(selector),
    querySelectorAll: (selector) => (selector === 'input[type="range"]' ? [force, angle] : []),
  };
  return {
    container: { querySelectorAll: () => [root] },
    inputs: { force, angle },
    nodes,
  };
}

test('all 4 interactive labs appear on their respective stages (pp. 56, 57, 59, 60)', () => {
  const found = [];
  for (const stage of LESSON_PAGES) {
    const html = stage.blocks.join('\n');
    for (const match of html.matchAll(/data-simulation="([^"]+)"/g)) {
      found.push({ page: stage.page, id: match[1] });
    }
  }
  assert.deepEqual(found, [
    { page: 56, id: 'spring-concurrency' },
    { page: 57, id: 'concurrent' },
    { page: 59, id: 'perpendicular' },
    { page: 60, id: 'force-resolution' },
  ]);
  assert.equal(simulationMarkup('unapproved-simulation'), '');
});

test('Lab 1 static equilibrium model satisfies ∑Fx = 0 and ∑Fy = 0 for all knot positions', () => {
  for (const [h, v, w] of [[50, 50, 6], [15, 35, 8], [85, 75, 10], [0, 100, 4]]) {
    const eq = springBoardEquilibrium({ weightNewtons: w, horizontalPercent: h, verticalPercent: v, mode: 'double' });
    assert.ok(eq.tension1Newtons > 0 && eq.tension2Newtons > 0);
    const fx = eq.tension1Newtons * eq.directions.F1.x + eq.tension2Newtons * eq.directions.F2.x;
    const fy = eq.tension1Newtons * eq.directions.F1.y + eq.tension2Newtons * eq.directions.F2.y + w;
    near(fx, 0, 1e-8);
    near(fy, 0, 1e-8);
  }
  const single = springBoardEquilibrium({ weightNewtons: 7, mode: 'single' });
  near(single.tension1Newtons, 7);
  near(single.tension2Newtons, 0);
});

test('Lab 2 resultant, equilibrant, and quadrilateral classifier agree across all geometric cases', () => {
  const oblique = resultantOfConcurrentForces(4, 3, 60);
  near(oblique.magnitude, Math.sqrt(37));
  near(oblique.resultant.x + oblique.equilibrant.x, 0);
  near(oblique.resultant.y + oblique.equilibrant.y, 0);
  assert.equal(oblique.shape.id, 'parallelogram');

  assert.equal(classifyParallelogramShape(5, 5, 60).id, 'rhombus');
  assert.equal(classifyParallelogramShape(6, 8, 90).id, 'rectangle');
  assert.equal(classifyParallelogramShape(5, 5, 90).id, 'square');
  assert.equal(classifyParallelogramShape(6, 4, 0).id, 'collinear-same');
  assert.equal(classifyParallelogramShape(6, 4, 180).id, 'collinear-opposite');

  const zero = resultantOfConcurrentForces(5, 5, 180);
  near(zero.magnitude, 0);
  assert.equal(zero.directionDegrees, null);
  assert.throws(() => resultantOfConcurrentForces(-1, 3, 45), RangeError);
  assert.throws(() => resultantOfConcurrentForces(3, 4, 181), RangeError);
});

test('Lab 3 perpendicular scale model and inverse Pythagoras solver verify textbook examples and problems', () => {
  const ex2 = perpendicularScaleModel(60, 80, 20);
  near(ex2.cmF1, 3);
  near(ex2.cmF2, 4);
  near(ex2.cmResultant, 5);
  near(ex2.magnitude, 100);
  assert.equal(ex2.shapeLabel, 'مستطيل');

  const p1 = solveMissingPerpendicularForce(15, 12);
  near(p1.unknown, 9);
  const q5 = solveMissingPerpendicularForce(50, 40);
  near(q5.unknown, 30);
  assert.throws(() => solveMissingPerpendicularForce(10, 12), RangeError);
});

test('Lab 4 orthogonal resolution and smooth inclined-plane model conserve original force magnitude', () => {
  const axes = resolveForceIntoPerpendicularComponents(8, 35);
  near(Math.hypot(axes.componentX, axes.componentY), 8);

  for (const angle of [0, 25, 45, 60]) {
    const inc = inclinedPlaneResolution(10, angle);
    near(inc.reconstructedWeight, 10);
    near(inc.normalReactionR, inc.normalF2);
    const geo = inclinedPlaneDiagramGeometry(inc);
    const v1 = vectorBetween(geo.origin, geo.f1Tip);
    const v2 = vectorBetween(geo.origin, geo.f2Tip);
    near(dot(v1, v2), 0, 1e-7);
  }
  assert.throws(() => inclinedPlaneResolution(8, 70), RangeError);
});

test('mounted simulation experiences update live SVG vectors, causal explanations, and aria-valuetext', () => {
  const simA = fakeConcurrentRoot();
  simA.root.dataset.showEquilibrant = 'true';
  mountSimulationExperiences(simA.container);
  simA.inputs.f1.value = '4';
  simA.inputs.f2.value = '3';
  simA.inputs.angle.value = '60';
  simA.inputs.angle.emit('input');
  assert.equal(simA.nodes.get('#sim-a-result').innerHTML, '<bdi dir="ltr">6.08 N</bdi>');
  assert.equal(simA.nodes.get('#sim-a-vector-eq').getAttribute('visibility'), 'visible');
  assert.match(simA.nodes.get('[data-role="why-changed"]').innerHTML, /ما الذي تغيّر ولماذا/);

  const simB = fakePerpendicularRoot();
  mountSimulationExperiences(simB.container);
  simB.inputs.f1.value = '60';
  simB.inputs.f2.value = '80';
  simB.inputs.f2.emit('input');
  assert.equal(simB.nodes.get('#sim-b-result').innerHTML, '<bdi dir="ltr">100 N</bdi>');
  assert.match(simB.nodes.get('#sim-b-steps').innerHTML, /100 N/);

  const simC = fakeConcurrentExperimentRoot();
  mountSimulationExperiences(simC.container);
  simC.inputs.horizontal.value = '80';
  simC.inputs.vertical.value = '25';
  simC.inputs.vertical.emit('input');
  const expectedC = concurrentExperimentGeometry(80, 25);
  near(Number(simC.nodes.get('#sim-c-point-o').getAttribute('cx')), expectedC.origin.x);
  near(Number(simC.nodes.get('#sim-c-point-o').getAttribute('cy')), expectedC.origin.y);

  const simD = fakeForceResolutionRoot();
  mountSimulationExperiences(simD.container);
  simD.inputs.force.value = '9.5';
  simD.inputs.angle.value = '60';
  simD.inputs.angle.emit('input');
  const expectedD = forceResolutionDiagramGeometry(resolveForceIntoPerpendicularComponents(9.5, 60));
  near(Number(simD.nodes.get('#sim-d-force-vector').getAttribute('x2')), expectedD.resultantTip.x);
  assert.equal(simD.inputs.angle.getAttribute('aria-valuetext'), '60 درجة');
});

test('every simulation markup includes reset controls, live status, causal explanation slot, and a Predict-Observe-Explain card', () => {
  for (const id of ['spring-concurrency', 'concurrent', 'perpendicular', 'force-resolution']) {
    const markup = simulationMarkup(id);
    assert.match(markup, /data-sim-reset/, `${id} has reset control`);
    assert.match(markup, /data-role="why-changed"/, `${id} has dynamic causal explanation box`);
    assert.match(markup, new RegExp(`data-sim-prediction="${id}"`), `${id} has prediction inquiry card`);
    assert.match(markup, /role="status" aria-live="polite"/, `${id} announces live status`);
    assert.ok(SIM_PREDICTIONS[id].options.length === 3, `${id} prediction has 3 options with diagnostic feedback`);
  }
});
