/*
 * Pure physics for «الفيزياء في حياتنا» — Lesson 1.
 *
 * No DOM, no rendering, no stored answers: every number the student sees is
 * derived here from the current inputs.
 *
 *   1. two concurrent forces (parallelogram rule, zero resultant, bisector);
 *   2. two perpendicular forces (Pythagoras + direction);
 *   3. force resolution on an inclined plane (W∥ = W sin α, W⊥ = W cos α);
 *   4. the drawing challenge: compass direction, point and classification,
 *      evaluated with tolerances instead of pixel positions.
 *
 * Angle convention (used everywhere in this section):
 *   angles are measured counter-clockwise from the +x axis, in degrees,
 *   in the mathematical (y-up) frame. Rendering converts to screen y-down.
 */

export const FORCE_EPSILON = 1e-6;
export const MIN_INCLINE_ANGLE = 0;
export const MAX_INCLINE_ANGLE = 90;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));

export const degToRad = (degrees) => (Number(degrees) * Math.PI) / 180;
export const radToDeg = (radians) => (Number(radians) * 180) / Math.PI;

export function normalizeDegrees(value) {
  const degrees = Number(value);
  if (!Number.isFinite(degrees)) return 0;
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Shortest signed rotation from `from` to `to`, in (-180, 180]. */
export function angularDifference(from, to) {
  const raw = normalizeDegrees(Number(to) - Number(from));
  return raw > 180 ? raw - 360 : raw;
}

export function forceComponents(magnitude, angleDegrees) {
  const size = Math.max(0, Number(magnitude) || 0);
  const angle = degToRad(Number(angleDegrees) || 0);
  return { x: size * Math.cos(angle), y: size * Math.sin(angle) };
}

/**
 * Resultant of exactly two concurrent forces.
 * `θ` is the angle between the force directions, in [0, 180].
 */
export function concurrentResultant({ f1 = 0, f2 = 0, angle = 0, direction = 0 } = {}) {
  const first = Math.max(0, Number(f1) || 0);
  const second = Math.max(0, Number(f2) || 0);
  const theta = clamp(Number.isFinite(Number(angle)) ? Number(angle) : 0, 0, 180);
  const baseDirection = Number(direction) || 0;

  const firstAngle = baseDirection;
  const secondAngle = baseDirection + theta;
  const v1 = forceComponents(first, firstAngle);
  const v2 = forceComponents(second, secondAngle);
  const components = { x: v1.x + v2.x, y: v1.y + v2.y };
  const magnitude = Math.hypot(components.x, components.y);
  const isZero = magnitude <= FORCE_EPSILON;
  const directionDegrees = isZero ? null : normalizeDegrees(radToDeg(Math.atan2(components.y, components.x)));

  const bisectorDegrees = normalizeDegrees(firstAngle + theta / 2);
  const deviationFromBisectorDegrees = isZero ? null : angularDifference(bisectorDegrees, directionDegrees);
  const equalMagnitudes = Math.abs(first - second) <= FORCE_EPSILON;

  return Object.freeze({
    f1: first,
    f2: second,
    angle: theta,
    baseDirection: normalizeDegrees(baseDirection),
    firstAngle: normalizeDegrees(firstAngle),
    secondAngle: normalizeDegrees(secondAngle),
    theta,
    bisectorDegrees,
    deviationFromBisectorDegrees,
    components: Object.freeze(components),
    magnitude,
    directionDegrees,
    isZero,
    equalMagnitudes,
    isOpposite: theta >= 180 - FORCE_EPSILON,
    /* True only in the special case the student must learn to recognize. */
    liesOnBisector: !isZero && equalMagnitudes && Math.abs(deviationFromBisectorDegrees) <= 0.75,
    v1: Object.freeze(v1),
    v2: Object.freeze(v2),
  });
}

/** Resultant magnitude of two perpendicular forces: F = √(F₁² + F₂²). */
export function perpendicularResultant(f1, f2) {
  const first = Math.max(0, Number(f1) || 0);
  const second = Math.max(0, Number(f2) || 0);
  const sumOfSquares = first * first + second * second;
  const magnitude = Math.sqrt(sumOfSquares);
  const angleFromFirstDegrees = magnitude <= FORCE_EPSILON
    ? null
    : normalizeDegrees(radToDeg(Math.atan2(second, first)));

  return Object.freeze({
    f1: first,
    f2: second,
    sumOfSquares,
    magnitude,
    angleFromFirstDegrees,
    /* Angle measured from F₂ back to F₁ — used to show the two complementary angles. */
    angleFromSecondDegrees: angleFromFirstDegrees === null ? null : 90 - angleFromFirstDegrees,
    isZero: magnitude <= FORCE_EPSILON,
  });
}

/**
 * Decompose a weight on a plane inclined by `alpha` degrees to the horizontal.
 * The plane rises towards +x. The parallel component points down the slope,
 * the perpendicular component points into the surface.
 */
export function inclineComponents(weight, alpha) {
  const w = Math.max(0, Number(weight) || 0);
  const angle = clamp(Number.isFinite(Number(alpha)) ? Number(alpha) : 0, MIN_INCLINE_ANGLE, MAX_INCLINE_ANGLE);
  const radians = degToRad(angle);
  const parallel = w * Math.sin(radians);
  const perpendicular = w * Math.cos(radians);

  return Object.freeze({
    weight: w,
    angle,
    parallel,
    perpendicular,
    sumOfSquares: parallel * parallel + perpendicular * perpendicular,
    /* Down-slope unit vector in the mathematical (y-up) frame. */
    parallelDirection: Object.freeze({ x: -Math.cos(radians), y: -Math.sin(radians) }),
    /* Unit vector from the body into the surface (mathematical frame). */
    perpendicularDirection: Object.freeze({ x: Math.sin(radians), y: -Math.cos(radians) }),
    /* Unit vector from the surface outwards — the normal reaction (y-up frame). */
    reactionDirection: Object.freeze({ x: -Math.sin(radians), y: Math.cos(radians) }),
    weightDirection: Object.freeze({ x: 0, y: -1 }),
  });
}

/* --------------------------------------------------------- drawing activity */

const COMPASS_POINTS = Object.freeze([
  { id: 'east', degrees: 0, label: 'شرقاً', short: 'E' },
  { id: 'north-east', degrees: 45, label: 'شمال شرق', short: 'NE' },
  { id: 'north', degrees: 90, label: 'شمالاً', short: 'N' },
  { id: 'north-west', degrees: 135, label: 'شمال غرب', short: 'NW' },
  { id: 'west', degrees: 180, label: 'غرباً', short: 'W' },
  { id: 'south-west', degrees: 225, label: 'جنوب غرب', short: 'SW' },
  { id: 'south', degrees: 270, label: 'جنوباً', short: 'S' },
  { id: 'south-east', degrees: 315, label: 'جنوب شرق', short: 'SE' },
]);

export const COMPASS_DIRECTIONS = COMPASS_POINTS;

export function nearestCompassDirection(angleDegrees) {
  if (angleDegrees === null || angleDegrees === undefined || !Number.isFinite(Number(angleDegrees))) return null;
  let best = COMPASS_POINTS[0];
  let bestDistance = Infinity;
  for (const point of COMPASS_POINTS) {
    const distance = Math.abs(angularDifference(point.degrees, angleDegrees));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = point;
    }
  }
  return best;
}

export function compassDirection(id) {
  return COMPASS_POINTS.find((point) => point.id === id) ?? null;
}

/**
 * Evaluate «أنت رسّام القوى».
 *
 * The verdict depends on the chosen point, the force symbol, a sector-based
 * direction (`toleranceDegrees`, never pixels) and the physical classification.
 * A direction that falls in the right sector but near its edge is reported as
 * «قريب» so the feedback can teach instead of simply failing the student.
 */
export function evaluateForceDrawing(challenge, answer = {}) {
  const tolerance = Number(challenge?.directionToleranceDegrees ?? 30);
  const pointOk = answer.pointId === challenge?.correctPointId;
  const symbolOk = answer.symbolId === challenge?.correctSymbolId;
  const classificationOk = answer.classificationId === challenge?.correctClassificationId;

  let direction = { ok: false, status: 'missing', errorDegrees: null };
  if (answer.directionId) {
    const chosen = compassDirection(answer.directionId);
    if (chosen) {
      const error = Math.abs(angularDifference(challenge?.correctDirectionDegrees ?? 0, chosen.degrees));
      direction = {
        ok: error <= tolerance,
        status: error <= tolerance ? 'correct' : error <= tolerance * 2 ? 'close' : 'wrong',
        errorDegrees: error,
      };
    }
  }

  const parts = {
    point: { ok: pointOk, correctId: challenge?.correctPointId ?? null },
    symbol: { ok: symbolOk, correctId: challenge?.correctSymbolId ?? null },
    direction,
    classification: { ok: classificationOk, correctId: challenge?.correctClassificationId ?? null },
  };
  const correctCount = [pointOk, symbolOk, direction.ok, classificationOk].filter(Boolean).length;

  return Object.freeze({
    ...parts,
    correctCount,
    total: 4,
    allCorrect: correctCount === 4,
  });
}

/* --------------------------------------------------------------- utilities */

export function toPixels(magnitude, pixelsPerNewton) {
  const value = Math.max(0, Number(magnitude) || 0) * Math.max(0, Number(pixelsPerNewton) || 0);
  return Number.isFinite(value) ? value : 0;
}

export function formatNumber(value, digits = 1) {
  if (!Number.isFinite(Number(value))) return '0';
  const rounded = Number(value).toFixed(digits);
  return Number(rounded).toString();
}

export function formatDegrees(value, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—';
  return `${formatNumber(value, digits)}°`;
}
