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

export const VOLTAGE_UNITS = Object.freeze(Object.keys(VOLTAGE_UNIT_IN_VOLTS));
