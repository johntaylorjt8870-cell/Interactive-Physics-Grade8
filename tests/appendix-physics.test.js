import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EDUCATIONAL_MASS_KG,
  MAX_FORCE_COUNT,
  MAX_FORCE_MAGNITUDE,
  MOTION_LIMIT_METERS,
  addForce,
  advanceMotion,
  createMotionState,
  evaluateResultantTarget,
  forceComponents,
  isBalanced,
  removeForce,
  resultantOfForces,
  updateForce,
} from '../src/appendix-physics.js';
import { FORCE_PRESETS, ZERO_RESULTANT_CHALLENGE } from '../src/lesson-1-appendix-content.js';

const near = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected} by more than ${tolerance}`);
};
const force = (magnitude, angleDegrees) => ({ magnitude, angleDegrees });

function preset(id) {
  const selected = FORCE_PRESETS.find((item) => item.id === id);
  assert.ok(selected, `expected preset ${id}`);
  return selected;
}

test('zero magnitude has zero components and no defined resultant direction', () => {
  assert.deepEqual(forceComponents(force(0, 137)), { x: 0, y: 0 });
  const result = resultantOfForces([force(0, 0)]);
  assert.deepEqual(result.components, { x: 0, y: 0 });
  assert.equal(result.magnitude, 0);
  assert.equal(result.directionDegrees, null);
  assert.equal(isBalanced([force(0, 219)]), true);
});

test('a single force retains its magnitude and Cartesian direction', () => {
  const right = resultantOfForces([force(7, 0)]);
  near(right.components.x, 7);
  near(right.components.y, 0);
  near(right.magnitude, 7);
  near(right.directionDegrees, 0);

  const upward = resultantOfForces([force(4, 90)]);
  near(upward.components.x, 0);
  near(upward.components.y, 4);
  near(upward.magnitude, 4);
  near(upward.directionDegrees, 90);
});

test('equal opposite forces cancel exactly within floating-point tolerance', () => {
  const result = resultantOfForces([force(9, 0), force(9, 180)]);
  near(result.components.x, 0);
  near(result.components.y, 0);
  near(result.magnitude, 0);
  assert.equal(result.directionDegrees, null);
  assert.equal(isBalanced([force(9, 0), force(9, 180)]), true);
});

test('perpendicular forces use vector addition for magnitude and direction', () => {
  const result = resultantOfForces([force(3, 0), force(4, 90)]);
  near(result.components.x, 3);
  near(result.components.y, 4);
  near(result.magnitude, 5);
  near(result.directionDegrees, Math.atan2(4, 3) * 180 / Math.PI);
});

test('three concurrent forces add signed x and y components independently', () => {
  const result = resultantOfForces([force(4, 0), force(3, 90), force(4, 180)]);
  near(result.components.x, 0);
  near(result.components.y, 3);
  near(result.magnitude, 3);
  near(result.directionDegrees, 90);
  assert.equal(result.forces.length, 3);
});

test('adding a force returns a new three-force state without mutating the original', () => {
  const original = [force(2, 0), force(3, 90)];
  const added = addForce(original, force(4, 180));
  assert.equal(original.length, 2);
  assert.equal(added.length, 3);
  assert.notEqual(added, original);
  assert.deepEqual(added[2], force(4, 180));
  assert.throws(() => addForce(added), RangeError, 'the model caps the lesson lab at three forces');
});

test('removing a force preserves order and never permits an empty lab', () => {
  const original = [force(2, 0), force(3, 90), force(4, 180)];
  const remaining = removeForce(original, 1);
  assert.deepEqual(remaining, [force(2, 0), force(4, 180)]);
  assert.equal(original.length, 3);
  assert.throws(() => removeForce([force(1, 0)], 0), RangeError);
  assert.throws(() => removeForce(original, 3), RangeError);
});

test('changing magnitude updates only that force and updates the resultant', () => {
  const original = [force(3, 0), force(4, 90)];
  const changed = updateForce(original, 0, { magnitude: 6 });
  assert.deepEqual(original[0], force(3, 0));
  assert.deepEqual(changed, [force(6, 0), force(4, 90)]);
  const result = resultantOfForces(changed);
  near(result.components.x, 6);
  near(result.components.y, 4);
  near(result.magnitude, Math.hypot(6, 4));
  assert.throws(() => updateForce(original, 0, { magnitude: MAX_FORCE_MAGNITUDE + 1 }), RangeError);
});

test('changing angle immediately changes components, magnitude, and direction', () => {
  const original = [force(6, 0), force(6, 60)];
  const before = resultantOfForces(original);
  near(before.magnitude, 6 * Math.sqrt(3));
  near(before.directionDegrees, 30);
  const changed = updateForce(original, 1, { angleDegrees: 180 });
  const after = resultantOfForces(changed);
  near(after.components.x, 0);
  near(after.components.y, 0);
  near(after.magnitude, 0);
  assert.equal(after.directionDegrees, null);
  assert.throws(() => updateForce(original, 1, { angleDegrees: 360 }), RangeError);
});

test('all seven presets describe their actual mathematical states', () => {
  assert.equal(FORCE_PRESETS.length, 7);
  assert.deepEqual(FORCE_PRESETS.map((item) => item.id), [
    'same-direction', 'opposite', 'equal-perpendicular', 'angled-pair',
    'three-forces', 'angle-explorer', 'balanced-three',
  ]);
  assert.ok(FORCE_PRESETS.every((item) => item.observation.length > 30 && item.prediction.length > 20));

  const same = resultantOfForces(preset('same-direction').forces);
  near(same.magnitude, 8);
  near(same.directionDegrees, 0);

  const opposite = resultantOfForces(preset('opposite').forces);
  near(opposite.magnitude, 3);
  near(opposite.directionDegrees, 0);

  const equal = resultantOfForces(preset('equal-perpendicular').forces);
  near(equal.magnitude, 5 * Math.sqrt(2));
  near(equal.directionDegrees, 45);

  const angled = resultantOfForces(preset('angled-pair').forces);
  near(angled.components.x, 11);
  near(angled.components.y, 3 * Math.sqrt(3));
  near(angled.magnitude, Math.sqrt(148));

  const three = resultantOfForces(preset('three-forces').forces);
  near(three.components.x, 0);
  near(three.components.y, 3);
  near(three.magnitude, 3);
  near(three.directionDegrees, 90);

  const balanced = resultantOfForces(preset('balanced-three').forces);
  near(balanced.magnitude, 0);
  assert.equal(balanced.directionDegrees, null);
});

test('balanced three-force preset stays at rest from a reset and proves its resultant is zero', () => {
  const result = resultantOfForces(preset('balanced-three').forces);
  const still = advanceMotion(createMotionState(), result, 0.05);
  assert.deepEqual(still.position, { x: 0, y: 0 });
  assert.deepEqual(still.velocity, { x: 0, y: 0 });
  assert.equal(still.boundaryReached, false);
});

test('the challenge begins unsolved and accepts a force that cancels the fixed resultant', () => {
  const start = evaluateResultantTarget(ZERO_RESULTANT_CHALLENGE.forces, ZERO_RESULTANT_CHALLENGE.target, ZERO_RESULTANT_CHALLENGE.tolerance);
  assert.equal(start.complete, false);
  assert.ok(start.errorMagnitude > 1);

  const solution = [force(4, 0), force(3, 90), force(5, 217)];
  const achieved = evaluateResultantTarget(solution, ZERO_RESULTANT_CHALLENGE.target, ZERO_RESULTANT_CHALLENGE.tolerance);
  assert.equal(achieved.complete, true);
  assert.ok(achieved.errorMagnitude <= ZERO_RESULTANT_CHALLENGE.tolerance);
});

test('the simplified motion model accelerates in the resultant direction from rest', () => {
  assert.equal(EDUCATIONAL_MASS_KG, 2);
  const east = advanceMotion(createMotionState(), resultantOfForces([force(2, 0)]), 0.05);
  assert.ok(east.position.x > 0);
  assert.equal(east.position.y, 0);
  assert.ok(east.velocity.x > 0);
  assert.equal(east.velocity.y, 0);

  const north = advanceMotion(createMotionState(), resultantOfForces([force(4, 90)]), 0.05);
  assert.equal(north.position.x, 0);
  assert.ok(north.position.y > 0);
  assert.ok(north.velocity.y > 0);
});

test('frame duration is bounded and the visual arena clamps the demonstration', () => {
  const result = resultantOfForces([force(MAX_FORCE_MAGNITUDE, 45), force(MAX_FORCE_MAGNITUDE, 45), force(MAX_FORCE_MAGNITUDE, 45)]);
  let state = createMotionState();
  for (let frame = 0; frame < 200; frame += 1) state = advanceMotion(state, result, 0.05);
  assert.ok(Math.hypot(state.position.x, state.position.y) <= MOTION_LIMIT_METERS + 1e-12);
  assert.ok(state.boundaryReached);
  assert.deepEqual(state.velocity, { x: 0, y: 0 });
});

test('force list and angle validation reject non-physical or unsupported inputs', () => {
  assert.equal(MAX_FORCE_COUNT, 3);
  assert.throws(() => resultantOfForces([]), RangeError);
  assert.throws(() => resultantOfForces([force(-1, 0)]), RangeError);
  assert.throws(() => resultantOfForces([force(1, 360)]), RangeError);
  assert.throws(() => resultantOfForces([force(1, 0), force(1, 0), force(1, 0), force(1, 0)]), RangeError);
  assert.throws(() => updateForce([force(1, 0)], 0, { label: 'not a force property' }), TypeError);
});
