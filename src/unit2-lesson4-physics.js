/* Physics model for Unit 2 Lesson 4 (resistance, pp107–120).
 *
 * Every function validates its inputs so a lab can never silently display NaN,
 * infinity, or a division by zero. Positive resistances only; the labs use the
 * idealised textbook relations, and the pages label those values as models, not
 * as measurements printed in the book.
 */

function positive(x, name) {
  if (!Number.isFinite(x) || x <= 0) throw new RangeError(`${name} must be positive`);
  return x;
}

/** Ideal source voltage U, fixed lamp resistance and an added series resistance. */
export function ohmCurrent(u, r) {
  if (!Number.isFinite(u) || u < 0) throw new RangeError('voltage must be non-negative');
  return u / positive(r, 'resistance');
}

export function wireResistance(rho, length, area) {
  return positive(rho, 'rho') * positive(length, 'length') / positive(area, 'area');
}

export function squareCentimetresToMetres(area) {
  return positive(area, 'area') * 1e-4;
}

export function squareMillimetresToMetres(area) {
  return positive(area, 'area') * 1e-6;
}

export function equivalentResistance(resistors, mode) {
  if (!Array.isArray(resistors) || !resistors.length) throw new RangeError('resistors required');
  resistors.forEach((r) => positive(r, 'resistance'));
  if (mode === 'series') return resistors.reduce((a, b) => a + b, 0);
  if (mode === 'parallel') return 1 / resistors.reduce((a, b) => a + 1 / b, 0);
  throw new RangeError('unknown mode');
}

export function network(u, r1, r2, mode) {
  const r = equivalentResistance([r1, r2], mode);
  const i = ohmCurrent(u, r);
  return {
    r, i,
    i1: mode === 'series' ? i : ohmCurrent(u, r1),
    i2: mode === 'series' ? i : ohmCurrent(u, r2),
    u1: mode === 'series' ? i * r1 : u,
    u2: mode === 'series' ? i * r2 : u,
  };
}

export function colourResistance(a, b, c) {
  if (![a, b, c].every((v) => Number.isInteger(v) && v >= 0 && v <= 9)) throw new RangeError('colour digits required');
  return (10 * a + b) * 10 ** c;
}

export function graphSlope(a, b) {
  if (b.i === a.i) throw new RangeError('vertical line');
  return (b.u - a.u) / (b.i - a.i);
}

/** p108 model: a 6 V source, a 6 Ω lamp and an added series resistor. */
export function heatLabModel(addedResistance, { source = 6, lamp = 6 } = {}) {
  const total = positive(lamp, 'lamp') + (Number.isFinite(addedResistance) && addedResistance >= 0 ? addedResistance : 0);
  const current = ohmCurrent(source, total);
  return Object.freeze({
    totalResistance: total,
    current,
    lampVoltage: current * lamp,
    lampPower: current ** 2 * lamp,
    brightness: Math.min(1, (current * lamp) / source),
  });
}

/** Metal-wire lab: rho in Ω·m, length in m, area in mm² → R in Ω. */
export function metalWireResistance(rho, length, areaMm2) {
  return wireResistance(rho, length, squareMillimetresToMetres(areaMm2));
}

/** Variable-resistor model: `fraction` (0–1) of a maximum track length is used. */
export function rheostatModel(fraction, { rho = 1.1e-6, length = 1, areaMm2 = 0.5, source = 6 } = {}) {
  if (!Number.isFinite(fraction) || fraction <= 0 || fraction > 1) throw new RangeError('fraction must be in (0, 1]');
  const resistance = metalWireResistance(rho, length * fraction, areaMm2);
  return Object.freeze({ resistance, current: ohmCurrent(source, resistance), fraction });
}

/* --- tolerant parsing used by numeric practice and lab records ------------- */

const ARABIC_INDIC = /[\u0660-\u0669]/g;
const EASTERN_ARABIC = /[\u06f0-\u06f9]/g;
const toLatinDigits = (text) => String(text)
  .replace(ARABIC_INDIC, (digit) => String(digit.charCodeAt(0) - 0x0660))
  .replace(EASTERN_ARABIC, (digit) => String(digit.charCodeAt(0) - 0x06f0));

export function parseNumeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN;
  const text = toLatinDigits(value ?? '')
    .trim()
    .replace(/[٠٫,،]/g, '.')
    .replace(/\u066b/g, '.')
    .replace(/\s+/g, '')
    .replace(/[^\d.+-]/g, '');
  if (!text || !/\d/.test(text)) return Number.NaN;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function numericMatches(value, expected, tolerance = 1e-9) {
  const parsed = parseNumeric(value);
  return Number.isFinite(parsed) && Math.abs(parsed - expected) <= Math.max(tolerance, Math.abs(expected) * 1e-9);
}

/** Lab recordings accept the same value with a small reading tolerance. */
export function readingMatches(value, expected) {
  const parsed = parseNumeric(value);
  if (!Number.isFinite(parsed)) return { ok: false, parsed };
  const tolerance = Math.max(Math.abs(expected) * 0.02, 0.011);
  return { ok: Math.abs(parsed - expected) <= tolerance, parsed };
}

export function formatNumber(value, maximumFractionDigits = 3) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-GB', { maximumFractionDigits }).format(value);
}
