export const ELEMENTARY_CHARGE = 1.6e-19;
export const COULOMB_CONSTANT = 9e9;

const positive = (value, name) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new RangeError(`${name} must be positive.`);
  return number;
};
const finite = (value, name) => {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new RangeError(`${name} must be finite.`);
  return number;
};

/** q = n·e with sign: lost electrons → positive, gained electrons → negative. */
export function chargeFromElectrons(count, mode) {
  const n = positive(count, 'electron count');
  if (!['lost', 'gained'].includes(mode)) throw new RangeError('mode must be lost or gained.');
  const magnitude = n * ELEMENTARY_CHARGE;
  return { count: n, charge: mode === 'lost' ? magnitude : -magnitude, sign: mode === 'lost' ? 1 : -1, magnitude };
}

export function electronCountFromCharge(chargeC) {
  const charge = finite(chargeC, 'charge');
  if (charge === 0) return { count: 0, charge: 0, sign: 0 };
  return { count: Math.abs(charge) / ELEMENTARY_CHARGE, charge, sign: Math.sign(charge) };
}

/** Coulomb magnitude F = K|q1q2|/d². Charges are C and distance is m. */
export function coulombForce(q1, q2, distanceM) {
  const a = finite(q1, 'q1');
  const b = finite(q2, 'q2');
  const d = positive(distanceM, 'distance');
  const magnitude = COULOMB_CONSTANT * Math.abs(a * b) / (d * d);
  const kind = a === 0 || b === 0 ? 'none' : (Math.sign(a) === Math.sign(b) ? 'repulsion' : 'attraction');
  return { magnitude, kind, signedProduct: a * b };
}

export function coulombForceScaled(q1, q2, distanceM, factor) {
  const base = coulombForce(q1, q2, distanceM);
  const scale = positive(factor, 'scale factor');
  return { ...base, magnitude: base.magnitude * scale };
}

/** Force on a target charge from collinear charges. Positive x points right. */
export function netForceOnCharge(target, others) {
  let net = 0;
  const parts = others.map((other) => {
    const dx = other.position - target.position;
    const distance = Math.abs(dx);
    const { magnitude, kind } = coulombForce(target.charge, other.charge, distance);
    const direction = kind === 'attraction' ? Math.sign(dx) : kind === 'repulsion' ? -Math.sign(dx) : 0;
    const signed = magnitude * direction;
    net += signed;
    return { ...other, magnitude, kind, signed };
  });
  return { net, magnitude: Math.abs(net), direction: Math.sign(net), parts };
}

/** Qualitative electroscope display only; the angle is not a calibrated measurement. */
export function electroscopeState(netChargeMicroC) {
  const charge = finite(netChargeMicroC, 'net charge');
  const angle = Math.min(62, Math.abs(charge) * 9);
  return { netCharge: charge, angle, diverged: Math.abs(charge) > 0.01, sign: Math.sign(charge) };
}

export function forceAfterDistanceScale(initialForce, distanceRatio) {
  const force = positive(initialForce, 'initial force');
  const ratio = positive(distanceRatio, 'distance ratio');
  return force / (ratio * ratio);
}

const DIGITS = Object.freeze({
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
});
const SUPERSCRIPTS = Object.freeze({ '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' });

/**
 * Parses equivalent student notations without evaluating arbitrary expressions:
 * 6.75, 6,75, 6.75e0, 3.2×10^-8, Arabic-Indic digits and superscripts.
 */
export function parseNumericInput(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  let text = String(value).trim();
  if (!text) return null;
  text = [...text].map((character) => DIGITS[character] ?? SUPERSCRIPTS[character] ?? character).join('');
  text = text.replaceAll('−', '-').replaceAll('٫', '.').replaceAll('٬', '').replaceAll(/\s+/g, '');
  if (text.includes(',') && !text.includes('.')) text = text.replace(',', '.');
  text = text.replace(/[×xX*]10\^?([+-]?\d+)$/i, 'e$1');
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export const UNIT_SCALES = Object.freeze({
  C: 1,
  kC: 1e3,
  MC: 1e6,
  mC: 1e-3,
  'μC': 1e-6,
  'µC': 1e-6,
  uC: 1e-6,
  nC: 1e-9,
  N: 1,
  kN: 1e3,
  mN: 1e-3,
});

// The supplied pp. 85–86 print c/μc; accept those book spellings as input aliases,
// while retaining the standard SI symbols in the selectable answer units.
const UNIT_ALIASES = Object.freeze({ c: 'C', 'μc': 'μC', 'µc': 'µC', uc: 'uC' });
const canonicalUnit = (unit) => UNIT_ALIASES[unit] ?? unit;

export function convertQuantity(value, fromUnit, toUnit) {
  const number = finite(value, 'quantity');
  const from = UNIT_SCALES[canonicalUnit(fromUnit)];
  const to = UNIT_SCALES[canonicalUnit(toUnit)];
  if (!from || !to) throw new RangeError('unsupported unit');
  return number * from / to;
}

/** Relative comparison uses the expected magnitude, so tiny charges never compare with an absolute 1 C tolerance. */
export function nearlyEqual(actual, expected, relativeTolerance = 1e-6, absoluteTolerance = 0) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false;
  const tolerance = Math.max(Math.abs(expected) * relativeTolerance, absoluteTolerance);
  return Math.abs(actual - expected) <= tolerance;
}

const quantityUnits = [...new Set([...Object.keys(UNIT_SCALES), ...Object.keys(UNIT_ALIASES)])].sort((a, b) => b.length - a.length);
const baseUnit = (unit) => {
  const canonical = canonicalUnit(unit);
  return canonical?.endsWith('C') ? 'C' : canonical?.endsWith('N') ? 'N' : null;
};

/** Parse a number with an optional typed unit, or use the unit selected beside the input. */
export function parseQuantityInput(value, selectedUnit) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const compact = String(value).trim().replaceAll(/\s+/g, '');
  const typedUnit = quantityUnits.find((unit) => compact.endsWith(unit));
  const numericText = typedUnit ? compact.slice(0, -typedUnit.length) : compact;
  const number = parseNumericInput(numericText);
  const enteredUnit = typedUnit || selectedUnit;
  const unit = canonicalUnit(enteredUnit);
  const base = baseUnit(unit);
  if (number === null || !base || !UNIT_SCALES[unit]) return null;
  return { value: convertQuantity(number, unit, base), unit: base, enteredUnit };
}

/** Compare in SI while accepting equivalent units and retaining charge/force dimension checks. */
export function checkEquivalentQuantity(value, selectedUnit, expected, expectedUnit, relativeTolerance = 1e-6) {
  const parsed = parseQuantityInput(value, selectedUnit);
  const expectedBase = baseUnit(expectedUnit);
  if (!parsed || !expectedBase || parsed.unit !== expectedBase) return { correct: false, parsed };
  const expectedValue = convertQuantity(expected, expectedUnit, expectedBase);
  return { correct: nearlyEqual(parsed.value, expectedValue, relativeTolerance), parsed, expected: expectedValue, unit: expectedBase };
}
