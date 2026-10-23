/**
 * Pure parallel-force model for Unit 1 Lesson 2 (textbook pp. 63–70).
 *
 * Same sense: F = F1 + F2, C lies on segment AB, closer to the larger force,
 * with F1 × d1 = F2 × d2 and d = d1 + d2.
 * Opposite sense (F2 > F1 in the book’s convention, generalised here):
 * F = |F2 − F1|, C lies on the extension of AB on the side of the larger force,
 * with the same product relation and d = |d2 − d1|.
 *
 * No named “torque” concept is introduced; the products are the book’s جداء.
 */

const finiteNumber = (value, name, { allowZero = false, allowNegative = false } = {}) => {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new RangeError(`${name} must be a finite number.`);
  }
  if (!allowNegative && (allowZero ? number < 0 : number <= 0)) {
    throw new RangeError(`${name} must be ${allowZero ? 'non-negative' : 'positive'}.`);
  }
  return number;
};

/** Resultant of two parallel forces acting in the same sense at x=0 (F1) and x=distance (F2). */
export function sameSenseParallelResultant(force1, force2, distance) {
  const F1 = finiteNumber(force1, 'F1', { allowZero: true });
  const F2 = finiteNumber(force2, 'F2', { allowZero: true });
  const d = finiteNumber(distance, 'distance');
  const magnitude = F1 + F2;
  if (magnitude === 0) {
    return { magnitude: 0, position: d / 2, distanceFromF1: d / 2, distanceFromF2: d / 2, sense: 0 };
  }
  const position = (F2 * d) / magnitude;
  return {
    magnitude,
    position,
    distanceFromF1: position,
    distanceFromF2: d - position,
    sense: 1,
  };
}

/**
 * Resultant of opposite parallel forces. F1 acts in the positive sense at x=0;
 * F2 acts in the negative sense at x=distance. The point lies outside the segment.
 */
export function oppositeSenseParallelResultant(force1, force2, distance) {
  const F1 = finiteNumber(force1, 'F1', { allowZero: true });
  const F2 = finiteNumber(force2, 'F2', { allowZero: true });
  const d = finiteNumber(distance, 'distance');
  const signedMagnitude = F1 - F2;
  if (Math.abs(signedMagnitude) < 1e-12) {
    return {
      magnitude: 0,
      signedMagnitude: 0,
      position: null,
      distanceFromF1: null,
      distanceFromF2: null,
      sense: 0,
      hasFiniteResultant: false,
    };
  }
  const position = (-F2 * d) / signedMagnitude;
  return {
    magnitude: Math.abs(signedMagnitude),
    signedMagnitude,
    position,
    distanceFromF1: Math.abs(position),
    distanceFromF2: Math.abs(position - d),
    sense: Math.sign(signedMagnitude),
    hasFiniteResultant: true,
  };
}

export function momentProducts(force1, distance1, force2, distance2) {
  const F1 = finiteNumber(force1, 'F1', { allowZero: true });
  const d1 = finiteNumber(distance1, 'd1', { allowZero: true });
  const F2 = finiteNumber(force2, 'F2', { allowZero: true });
  const d2 = finiteNumber(distance2, 'd2', { allowZero: true });
  return { first: F1 * d1, second: F2 * d2, balanced: Math.abs(F1 * d1 - F2 * d2) < 1e-9 };
}

/** Same-sense: given F1, F2 and d1 (distance of F1 from C), recover d2, d and F. */
export function sameSenseFromD1(force1, force2, distanceFromF1) {
  const F1 = finiteNumber(force1, 'F1');
  const F2 = finiteNumber(force2, 'F2');
  const d1 = finiteNumber(distanceFromF1, 'd1');
  const d2 = (F1 * d1) / F2;
  return {
    magnitude: F1 + F2,
    d1,
    d2,
    d: d1 + d2,
    closerTo: F1 === F2 ? 'mid' : (F1 > F2 ? 'F1' : 'F2'),
  };
}

/**
 * Opposite-sense with F1 > F2: C is outside AB on the F1 side.
 * d = AB, d1 = distance of F1 from C, d2 = distance of F2 from C = d1 + d.
 */
export function oppositeSenseFromLength(force1, force2, segmentLength) {
  const F1 = finiteNumber(force1, 'F1');
  const F2 = finiteNumber(force2, 'F2');
  const d = finiteNumber(segmentLength, 'd');
  const larger = Math.max(F1, F2);
  const smaller = Math.min(F1, F2);
  const magnitude = larger - smaller;
  if (magnitude === 0) {
    return { magnitude: 0, d1: null, d2: null, d, hasFiniteResultant: false, larger: 'none' };
  }
  const dNear = (smaller * d) / magnitude;
  const dFar = (larger * d) / magnitude;
  const largerName = F1 > F2 ? 'F1' : 'F2';
  return {
    magnitude,
    d,
    d1: F1 > F2 ? dNear : dFar,
    d2: F1 > F2 ? dFar : dNear,
    hasFiniteResultant: true,
    larger: largerName,
  };
}

export function proportionChain(F1, F2, d1, d2) {
  const f1 = finiteNumber(F1, 'F1', { allowZero: true });
  const f2 = finiteNumber(F2, 'F2', { allowZero: true });
  const D1 = finiteNumber(d1, 'd1', { allowZero: true });
  const D2 = finiteNumber(d2, 'd2', { allowZero: true });
  const F = f1 + f2;
  const d = D1 + D2;
  const left = D2 === 0 ? null : f1 / D2;
  const right = D1 === 0 ? null : f2 / D1;
  const mid = d === 0 ? null : F / d;
  return { F, d, left, right, mid, consistent: left !== null && right !== null && Math.abs(left - right) < 1e-9 };
}

/** Textbook worked example 1 (pp. 66–67): same sense, AB = 0.5 m, F1 = 20 N, F2 = 30 N. */
export const BOOK_EXAMPLE_SAME = Object.freeze({
  F1: 20,
  F2: 30,
  d: 0.5,
  F: 50,
  d2: 0.2,
  d1: 0.3,
  unitForce: 'N',
  unitLength: 'm',
});

/** Textbook worked example 2 (p. 68): opposite sense, AB = 60 cm, F1 = 200 N, F2 = 300 N. */
export const BOOK_EXAMPLE_OPPOSITE = Object.freeze({
  F1: 200,
  F2: 300,
  d: 60,
  F: 100,
  d1: 180,
  d2: 120,
  unitForce: 'N',
  unitLength: 'cm',
});

/** Textbook self-check problem 1 (p. 70). */
export const BOOK_PROBLEM_1 = Object.freeze({
  F1: 40,
  F2: 10,
  d1: 30,
  d2: 120,
  d: 150,
  F: 50,
  unitForce: 'N',
  unitLength: 'cm',
});

/** Textbook self-check problem 2 (p. 70). */
export const BOOK_PROBLEM_2 = Object.freeze({
  F1: 80,
  F2: 20,
  d: 40,
  F: 60,
  d1: 40 / 3,
  d2: 160 / 3,
  unitForce: 'N',
  unitLength: 'cm',
});
