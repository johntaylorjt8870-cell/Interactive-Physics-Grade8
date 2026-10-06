const finitePositive = (value, name, allowZero = false) => {
  const number = Number(value);
  if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
    throw new RangeError(`${name} must be ${allowZero ? 'non-negative' : 'positive'}.`);
  }
  return number;
};

/** Resultant of two parallel forces acting in the same sense at x=0 and x=distance. */
export function sameSenseParallelResultant(force1, force2, distance) {
  const F1 = finitePositive(force1, 'F1', true);
  const F2 = finitePositive(force2, 'F2', true);
  const d = finitePositive(distance, 'distance');
  const magnitude = F1 + F2;
  if (magnitude === 0) return { magnitude: 0, position: d / 2, distanceFromF1: d / 2, distanceFromF2: d / 2, sense: 0 };
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
  const F1 = finitePositive(force1, 'F1', true);
  const F2 = finitePositive(force2, 'F2', true);
  const d = finitePositive(distance, 'distance');
  const signedMagnitude = F1 - F2;
  if (Math.abs(signedMagnitude) < 1e-12) {
    return { magnitude: 0, signedMagnitude: 0, position: null, distanceFromF1: null, distanceFromF2: null, sense: 0, hasFiniteResultant: false };
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
  const F1 = finitePositive(force1, 'F1', true);
  const d1 = finitePositive(distance1, 'd1', true);
  const F2 = finitePositive(force2, 'F2', true);
  const d2 = finitePositive(distance2, 'd2', true);
  return { first: F1 * d1, second: F2 * d2, balanced: Math.abs(F1 * d1 - F2 * d2) < 1e-9 };
}
