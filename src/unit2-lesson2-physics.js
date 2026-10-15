/** I = q / t. Charge in C, time in s. Educational model of continuous current. */
export function currentFromChargeTime(chargeC, timeS) {
  const q = Number(chargeC);
  const t = Number(timeS);
  if (!Number.isFinite(q)) throw new RangeError('charge must be finite.');
  if (!Number.isFinite(t) || t <= 0) throw new RangeError('time must be positive.');
  return { current: q / t, charge: q, time: t };
}

export function chargeFromCurrentTime(currentA, timeS) {
  const I = Number(currentA);
  const t = Number(timeS);
  if (!Number.isFinite(I)) throw new RangeError('current must be finite.');
  if (!Number.isFinite(t) || t <= 0) throw new RangeError('time must be positive.');
  return { charge: I * t, current: I, time: t };
}

/** Series: same current in every part. */
export function seriesCurrents(sourceCurrentA, branchCount) {
  const I = Number(sourceCurrentA);
  const n = Number(branchCount);
  if (!Number.isFinite(I)) throw new RangeError('current must be finite.');
  if (!Number.isInteger(n) || n < 1) throw new RangeError('branchCount must be a positive integer.');
  return { currents: Array.from({ length: n }, () => I), constant: true };
}

/** Parallel: I = I1 + I2 + … */
export function parallelTotal(branchCurrents) {
  if (!Array.isArray(branchCurrents) || branchCurrents.length < 1) {
    throw new RangeError('need at least one branch current.');
  }
  const currents = branchCurrents.map((v, i) => {
    const x = Number(v);
    if (!Number.isFinite(x)) throw new RangeError(`branch ${i} current must be finite.`);
    return x;
  });
  return { total: currents.reduce((s, v) => s + v, 0), currents };
}

export function milliampereToAmpere(mA) {
  const x = Number(mA);
  if (!Number.isFinite(x)) throw new RangeError('mA must be finite.');
  return x * 1e-3;
}
