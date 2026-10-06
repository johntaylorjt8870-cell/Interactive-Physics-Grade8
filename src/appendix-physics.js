/*
 * Physics primitives for the Lesson 1 appendix only.
 *
 * Force directions are measured counter-clockwise from the positive x-axis:
 * 0° = right/east, 90° = up/north, 180° = left/west, 270° = down/south.
 * The vector sum is exact up to floating-point precision. Motion is a separate,
 * explicitly simplified teaching model (fixed mass, no drag or collisions).
 */

export const MIN_FORCE_COUNT = 1;
export const MAX_FORCE_COUNT = 3;
export const MAX_FORCE_MAGNITUDE = 20;
export const MAX_FORCE_ANGLE = 359;
export const RESULTANT_EPSILON = 1e-9;
export const EDUCATIONAL_MASS_KG = 2;
export const MOTION_TIME_SCALE = 0.6;
export const MOTION_LIMIT_METERS = 1.4;

const cleanZero = (value) => (Math.abs(value) < RESULTANT_EPSILON ? 0 : value);

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new RangeError(`${label} must be a finite number.`);
  return number;
}

export function validateForce(force) {
  if (!force || typeof force !== 'object') throw new TypeError('A force must be an object.');
  const magnitude = finiteNumber(force.magnitude, 'Force magnitude');
  const angleDegrees = finiteNumber(force.angleDegrees, 'Force angle');
  if (magnitude < 0 || magnitude > MAX_FORCE_MAGNITUDE) {
    throw new RangeError(`Force magnitude must be between 0 and ${MAX_FORCE_MAGNITUDE} N.`);
  }
  if (angleDegrees < 0 || angleDegrees > MAX_FORCE_ANGLE) {
    throw new RangeError(`Force angle must be between 0 and ${MAX_FORCE_ANGLE} degrees.`);
  }
  return { magnitude, angleDegrees };
}

function validateForceList(forces) {
  if (!Array.isArray(forces)) throw new TypeError('Forces must be an array.');
  if (forces.length < MIN_FORCE_COUNT || forces.length > MAX_FORCE_COUNT) {
    throw new RangeError(`The appendix lab supports ${MIN_FORCE_COUNT} to ${MAX_FORCE_COUNT} forces.`);
  }
  return forces.map(validateForce);
}

/** Convert one polar force into Cartesian components (mathematical y points up). */
export function forceComponents(force) {
  const { magnitude, angleDegrees } = validateForce(force);
  const radians = angleDegrees * Math.PI / 180;
  return {
    x: cleanZero(magnitude * Math.cos(radians)),
    y: cleanZero(magnitude * Math.sin(radians)),
  };
}

/**
 * Add all concurrent forces by summing their x/y components.
 * `directionDegrees` is null when the resultant is zero and otherwise lies in
 * [0, 360), measured counter-clockwise from +x.
 */
export function resultantOfForces(forces) {
  const normalizedForces = validateForceList(forces);
  const vectors = normalizedForces.map((force) => ({
    ...force,
    ...forceComponents(force),
  }));
  const components = vectors.reduce((sum, force) => ({
    x: cleanZero(sum.x + force.x),
    y: cleanZero(sum.y + force.y),
  }), { x: 0, y: 0 });
  const magnitude = cleanZero(Math.hypot(components.x, components.y));
  let directionDegrees = magnitude <= RESULTANT_EPSILON
    ? null
    : (Math.atan2(components.y, components.x) * 180 / Math.PI + 360) % 360;
  if (directionDegrees !== null) {
    directionDegrees = cleanZero(directionDegrees);
    if (Math.abs(directionDegrees - 360) < RESULTANT_EPSILON) directionDegrees = 0;
  }
  return { forces: vectors, components, magnitude, directionDegrees };
}

/** Return a new list with one additional force; inputs are never mutated. */
export function addForce(forces, force = { magnitude: 4, angleDegrees: 135 }) {
  const current = validateForceList(forces);
  if (current.length >= MAX_FORCE_COUNT) throw new RangeError('The lab already contains the maximum of three forces.');
  const added = validateForce(force);
  return [...current, added];
}

/** Return a new list with the selected force removed (at least one must remain). */
export function removeForce(forces, index) {
  const current = validateForceList(forces);
  const forceIndex = Number(index);
  if (!Number.isInteger(forceIndex) || forceIndex < 0 || forceIndex >= current.length) {
    throw new RangeError('Force index is outside the current force list.');
  }
  if (current.length <= MIN_FORCE_COUNT) throw new RangeError('At least one force must remain in the lab.');
  return current.filter((_, itemIndex) => itemIndex !== forceIndex);
}

/** Change a force magnitude or angle by index, returning a fresh force list. */
export function updateForce(forces, index, patch) {
  const current = validateForceList(forces);
  const forceIndex = Number(index);
  if (!Number.isInteger(forceIndex) || forceIndex < 0 || forceIndex >= current.length) {
    throw new RangeError('Force index is outside the current force list.');
  }
  if (!patch || typeof patch !== 'object') throw new TypeError('A force update must be an object.');
  const allowed = new Set(['magnitude', 'angleDegrees']);
  if (Object.keys(patch).some((key) => !allowed.has(key))) throw new TypeError('Only magnitude and angleDegrees can be changed.');
  const updated = { ...current[forceIndex], ...patch };
  validateForce(updated);
  return current.map((force, itemIndex) => itemIndex === forceIndex ? updated : { ...force });
}

export function isBalanced(forces, tolerance = 0.05) {
  const allowedError = finiteNumber(tolerance, 'Balance tolerance');
  if (allowedError < 0) throw new RangeError('Balance tolerance cannot be negative.');
  return resultantOfForces(forces).magnitude <= allowedError;
}

/** A reusable target-resultant evaluator for the appendix challenge. */
export function evaluateResultantTarget(forces, target = { x: 0, y: 0 }, tolerance = 0.15) {
  const result = resultantOfForces(forces);
  const targetX = finiteNumber(target?.x, 'Target x component');
  const targetY = finiteNumber(target?.y, 'Target y component');
  const allowedError = finiteNumber(tolerance, 'Target tolerance');
  if (allowedError < 0) throw new RangeError('Target tolerance cannot be negative.');
  const errorMagnitude = Math.hypot(result.components.x - targetX, result.components.y - targetY);
  return {
    complete: errorMagnitude <= allowedError,
    errorMagnitude,
    resultant: result,
    target: { x: targetX, y: targetY },
    tolerance: allowedError,
  };
}

/** Start each trial from rest at the centre of the visual field. */
export function createMotionState() {
  return {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    boundaryReached: false,
  };
}

/**
 * Advance the teaching motion by one frame. Position and velocity use SI units;
 * elapsedSeconds is real frame time, scaled for a short screen demonstration.
 */
export function advanceMotion(state, resultant, elapsedSeconds) {
  if (!state?.position || !state?.velocity || !resultant?.components) {
    throw new TypeError('Motion state and a force resultant are required.');
  }
  const elapsed = finiteNumber(elapsedSeconds, 'Elapsed time');
  if (elapsed < 0) throw new RangeError('Elapsed time cannot be negative.');
  const dt = Math.min(elapsed, 0.05) * MOTION_TIME_SCALE;
  const ax = finiteNumber(resultant.components.x, 'Resultant x component') / EDUCATIONAL_MASS_KG;
  const ay = finiteNumber(resultant.components.y, 'Resultant y component') / EDUCATIONAL_MASS_KG;
  const x = finiteNumber(state.position.x, 'Motion x position') + finiteNumber(state.velocity.x, 'Motion x velocity') * dt + 0.5 * ax * dt * dt;
  const y = finiteNumber(state.position.y, 'Motion y position') + finiteNumber(state.velocity.y, 'Motion y velocity') * dt + 0.5 * ay * dt * dt;
  let nextPosition = { x, y };
  let nextVelocity = {
    x: finiteNumber(state.velocity.x, 'Motion x velocity') + ax * dt,
    y: finiteNumber(state.velocity.y, 'Motion y velocity') + ay * dt,
  };
  let boundaryReached = false;
  const distance = Math.hypot(x, y);
  if (distance >= MOTION_LIMIT_METERS) {
    const scale = MOTION_LIMIT_METERS / distance;
    nextPosition = { x: x * scale, y: y * scale };
    nextVelocity = { x: 0, y: 0 };
    boundaryReached = true;
  }
  return { position: nextPosition, velocity: nextVelocity, boundaryReached };
}
