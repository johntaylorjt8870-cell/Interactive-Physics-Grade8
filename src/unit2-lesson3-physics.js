const VOLTAGE_UNIT_IN_VOLTS = Object.freeze({ kV: 1000, V: 1, mV: 0.001 });

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be a finite number.`);
  return number;
}

function nonNegativeNumber(value, label) {
  const number = finiteNumber(value, label);
  if (number < 0) throw new RangeError(`${label} must not be negative.`);
  return number;
}

/** Convert a potential difference among the lesson's kV, V, and mV units. */
export function convertPotentialDifference(value, fromUnit, toUnit) {
  const magnitude = nonNegativeNumber(value, 'Potential difference');
  if (!Object.hasOwn(VOLTAGE_UNIT_IN_VOLTS, fromUnit) || !Object.hasOwn(VOLTAGE_UNIT_IN_VOLTS, toUnit)) {
    throw new RangeError('Supported units are kV, V, and mV.');
  }
  return magnitude * VOLTAGE_UNIT_IN_VOLTS[fromUnit] / VOLTAGE_UNIT_IN_VOLTS[toUnit];
}

/** Total potential difference across components in a simple series loop. */
export function sumSeriesPotentialDifferences(values) {
  if (!Array.isArray(values) || values.length < 2) {
    throw new TypeError('A series circuit requires at least two partial potential differences.');
  }
  return values.reduce((total, value, index) => total + nonNegativeNumber(value, `Partial difference ${index + 1}`), 0);
}

/** Find the unmeasured series drop from the total and one measured component. */
export function missingSeriesPotentialDifference(total, known) {
  const source = nonNegativeNumber(total, 'Total potential difference');
  const measured = nonNegativeNumber(known, 'Known partial potential difference');
  if (measured > source) throw new RangeError('A partial drop cannot exceed the total in this simplified passive series circuit.');
  return source - measured;
}

/** Every parallel branch joins the same two nodes and has the same U. */
export function parallelPotentialDifferences(total, branchCount = 2) {
  const source = nonNegativeNumber(total, 'Total potential difference');
  if (!Number.isInteger(branchCount) || branchCount < 1 || branchCount > 20) {
    throw new RangeError('branchCount must be an integer from 1 to 20.');
  }
  return Object.freeze(Array.from({ length: branchCount }, () => source));
}

/** Water-level comparison used by the labelled teaching analogy, not a voltage model. */
export function waterFlowDirection(levelA, levelB, tapOpen) {
  const a = nonNegativeNumber(levelA, 'Level A');
  const b = nonNegativeNumber(levelB, 'Level B');
  if (typeof tapOpen !== 'boolean') throw new TypeError('tapOpen must be boolean.');
  if (!tapOpen) return 'closed';
  if (a === b) return 'balanced';
  return a > b ? 'a-to-b' : 'b-to-a';
}

/* ----------------------------------------------------------------------- */
/* Simplified teaching-lab models (platform models, not printed readings).  */
/* The book prints no meter values for the p100–p102 experiments; the labs  */
/* below expose an idealised, clearly labelled model so students can read    */
/* meters and *record* the values themselves, exactly as the book asks.     */
/* ----------------------------------------------------------------------- */

/** p100 experiment: source + lamp + switch, ideal meters, lamp R = 6 Ω model. */
export function dipoleExperimentReadings(emf, switchClosed, lampResistance = 6) {
  const source = nonNegativeNumber(emf, 'Source emf');
  const resistance = finiteNumber(lampResistance, 'Lamp resistance');
  if (resistance <= 0) throw new RangeError('Lamp resistance must be positive.');
  if (typeof switchClosed !== 'boolean') throw new TypeError('switchClosed must be boolean.');
  if (!switchClosed) {
    /* Open loop: no current, nothing across the lamp, source keeps its emf. */
    return Object.freeze({ sourceVoltage: source, lampVoltage: 0, current: 0 });
  }
  return Object.freeze({ sourceVoltage: source, lampVoltage: source, current: source / resistance });
}

/** p101 experiment: identical lamps share the source equally in series. */
export function seriesLabReadings(sourceVoltage, lampCount = 2) {
  const source = nonNegativeNumber(sourceVoltage, 'Source potential difference');
  if (!Number.isInteger(lampCount) || lampCount < 1 || lampCount > 6) {
    throw new RangeError('lampCount must be an integer from 1 to 6.');
  }
  const each = source / lampCount;
  return Object.freeze({
    sourceVoltage: source,
    lampVoltages: Object.freeze(Array.from({ length: lampCount }, () => each)),
    totalMatchesSum: Math.abs(each * lampCount - source) < 1e-9,
  });
}

/** p102 experiment: every branch of a parallel layout sits on the same nodes. */
export function parallelLabReadings(sourceVoltage, lampCount = 2) {
  const source = nonNegativeNumber(sourceVoltage, 'Source potential difference');
  if (!Number.isInteger(lampCount) || lampCount < 1 || lampCount > 6) {
    throw new RangeError('lampCount must be an integer from 1 to 6.');
  }
  return Object.freeze({
    sourceVoltage: source,
    lampVoltages: Object.freeze(Array.from({ length: lampCount }, () => source)),
    branchesEqual: true,
  });
}

/* ----------------------------------------------------------------------- */
/* Arabic answer normalisation for the printed fill-in questions of p106.   */
/* ----------------------------------------------------------------------- */

const ARABIC_DIACRITICS = /[ً-ٰٟۖ-ۭ]/g;

/**
 * Normalises a free-text Arabic answer: trims, unifies alef/ya/ta-marbuta
 * forms, drops diacritics and tatweel, and collapses whitespace, so honest
 * orthographic variants of the same term are accepted without leaking a key.
 */
export function normalizeArabicAnswer(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(ARABIC_DIACRITICS, '')
    .replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[.,;:!?؟…()«»"'’/\\|+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when the student's text matches any accepted variant of the blank. */
export function matchesBlankAnswer(input, accepted) {
  if (!Array.isArray(accepted) || accepted.length === 0) {
    throw new TypeError('accepted must be a non-empty array of variants.');
  }
  const normalised = normalizeArabicAnswer(input);
  if (!normalised) return false;
  return accepted.some((variant) => normalizeArabicAnswer(variant) === normalised);
}

/** Numeric reading check for the labs' record tables (school precision). */
export function readingMatches(input, expected, tolerance = 0.051) {
  const parsed = Number(String(input).trim().replace(',', '.').replace('٫', '.'));
  if (!Number.isFinite(parsed)) return { ok: false, parsed: null };
  return { ok: Math.abs(parsed - expected) <= tolerance, parsed };
}

export const VOLTAGE_UNITS = Object.freeze(Object.keys(VOLTAGE_UNIT_IN_VOLTS));
