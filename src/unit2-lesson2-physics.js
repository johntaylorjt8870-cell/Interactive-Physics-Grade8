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

/* ---------------------------------------------------------------------------
   Shared pure helpers for the lesson's interactive activities.
   Everything here is unit-tested and contains no answer key: the answers live
   in src/unit2-lesson2-answers.js, which the student page loads only after an
   explicit request.
   ------------------------------------------------------------------------- */

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const EXTENDED_ARABIC_INDIC = '۰۱۲۳۴۵۶۷۸۹';

/** Convert Arabic-Indic digits and a decimal comma to what Number() understands. */
export function normalizeDigits(text) {
  return String(text)
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_INDIC.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(EXTENDED_ARABIC_INDIC.indexOf(digit)))
    .replace(/٫/g, '.')
    .replace(/٬/g, '')
    .replace(/,/g, '.');
}

/**
 * Parse a student-typed number: Arabic digits, decimal comma, ×10⁻³ and 1e-3
 * notation, a leading sign and an optional trailing unit. Returns null when the
 * text is not a number (so the caller can show a neutral message, not "wrong").
 */
export function parseNumericInput(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const compact = normalizeDigits(value).trim().replace(/\s+/g, '').replace(/−/g, '-');
  if (!compact) return null;
  const scientific = compact.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:[x×*]10\^?([+-]?\d+)|e([+-]?\d+))$/i);
  if (scientific) {
    const mantissa = Number(scientific[1]);
    const exponent = Number(scientific[2] ?? scientific[3]);
    const result = mantissa * 10 ** exponent;
    return Number.isFinite(result) ? result : null;
  }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(compact)) return null;
  const result = Number(compact);
  return Number.isFinite(result) ? result : null;
}

/* Unit table for the lesson's quantities. `base` is the unit every value is
   compared in, `factor` converts the unit to the base. */
export const LESSON_UNITS = Object.freeze({
  A: Object.freeze({ base: 'A', factor: 1, kind: 'current' }),
  mA: Object.freeze({ base: 'A', factor: 1e-3, kind: 'current' }),
  'μA': Object.freeze({ base: 'A', factor: 1e-6, kind: 'current' }),
  kA: Object.freeze({ base: 'A', factor: 1e3, kind: 'current' }),
  C: Object.freeze({ base: 'C', factor: 1, kind: 'charge' }),
  mC: Object.freeze({ base: 'C', factor: 1e-3, kind: 'charge' }),
  'μC': Object.freeze({ base: 'C', factor: 1e-6, kind: 'charge' }),
  kC: Object.freeze({ base: 'C', factor: 1e3, kind: 'charge' }),
  s: Object.freeze({ base: 's', factor: 1, kind: 'time' }),
  min: Object.freeze({ base: 's', factor: 60, kind: 'time' }),
});

/**
 * Compare a typed quantity with the expected value while accepting every
 * equivalent unit offered by the lesson (e.g. 0.1 A = 100 mA).
 */
export function checkQuantity(value, unit, expected, expectedUnit, relativeTolerance = 1e-9) {
  const parsed = parseNumericInput(value);
  const typed = LESSON_UNITS[unit];
  const target = LESSON_UNITS[expectedUnit];
  if (parsed === null || !typed || !target || typed.kind !== target.kind) {
    return { correct: false, parsed, reason: parsed === null ? 'unparsed' : 'unit' };
  }
  const expectedBase = expected * target.factor;
  const actualBase = parsed * typed.factor;
  const tolerance = Math.max(Math.abs(expectedBase) * relativeTolerance, 1e-12);
  return { correct: Math.abs(actualBase - expectedBase) <= tolerance, parsed, expectedBase, actualBase };
}

/* ---------- p90: the table the book asks the student to complete ---------- */

export const P90_CHARGE_C = Object.freeze([20, 40, 60, 80, 100]);
export const P90_TIME_S = Object.freeze([5, 10, 15, 20, 25]);
export const P90_RATIO = Object.freeze([4, 4, 4, 4, 4]);

/* Cells left empty on p90: the times of the 60 C and 100 C columns, and the
   ratio of the 40 C, 80 C and 100 C columns. The printed cells stay printed. */
export const P90_BLANK_CELLS = Object.freeze([
  Object.freeze({ row: 'time', column: 2 }),
  Object.freeze({ row: 'time', column: 4 }),
  Object.freeze({ row: 'ratio', column: 1 }),
  Object.freeze({ row: 'ratio', column: 3 }),
  Object.freeze({ row: 'ratio', column: 4 }),
]);

/**
 * Grade the five blank cells. The expected values are supplied by the caller
 * (src/unit2-lesson2-answers.js), so this module — which the student page does
 * load — never contains an answer.
 */
export function gradePlaceholderTable(values, answers) {
  if (!Array.isArray(answers) || answers.length !== P90_BLANK_CELLS.length) {
    throw new RangeError('answers must provide one value per blank cell.');
  }
  return P90_BLANK_CELLS.map((cell, index) => {
    const parsed = parseNumericInput(values?.[index]);
    return Object.freeze({
      ...cell,
      index,
      parsed,
      correct: parsed !== null && Math.abs(parsed - answers[index]) < 1e-9,
    });
  });
}

/* ---------- p90: the graph of q against t ---------- */

export const P90_GRAPH_POINTS = Object.freeze([
  Object.freeze([5, 20]),
  Object.freeze([10, 40]),
  Object.freeze([15, 60]),
  Object.freeze([20, 80]),
  Object.freeze([25, 100]),
]);
export const P90_GRAPH_T_TICKS = Object.freeze([5, 10, 15, 20, 25, 30, 35]);
export const P90_GRAPH_Q_TICKS = Object.freeze([20, 40, 60, 80, 100, 120]);

/** Compare a plotted set of [t, q] points with the book's points. */
export function gradeGraphPoints(points) {
  const key = ([t, q]) => `${Number(t)},${Number(q)}`;
  const expected = new Set(P90_GRAPH_POINTS.map(key));
  const given = new Set((points ?? []).map(key));
  const missing = P90_GRAPH_POINTS.filter((p) => !given.has(key(p)));
  const extra = (points ?? []).filter((p) => !expected.has(key(p)));
  return Object.freeze({
    correct: missing.length === 0 && extra.length === 0,
    complete: missing.length === 0 && given.size === expected.size,
    missing,
    extra,
    placed: given.size,
    total: expected.size,
  });
}

/* ---------- p93 / p94: batteries on series and on parallel ---------- */

/**
 * Emf of a bank of identical cells. On series the positives are chained to the
 * following negatives, so the emfs add up; on parallel every cell is connected
 * between the same two points, so the bank keeps the emf of one cell.
 */
export function batteryBankVoltage({ cells, cellVoltage, mode }) {
  const count = Number(cells);
  const emf = Number(cellVoltage);
  if (!Number.isInteger(count) || count < 1) throw new RangeError('cells must be a positive integer.');
  if (!Number.isFinite(emf) || emf <= 0) throw new RangeError('cellVoltage must be positive.');
  if (mode !== 'series' && mode !== 'parallel') throw new RangeError("mode must be 'series' or 'parallel'.");
  return Object.freeze({
    mode,
    cells: count,
    cellVoltage: emf,
    voltage: mode === 'series' ? count * emf : emf,
  });
}

/* ---------- p96: question 5 (12 C in 2 min, then 5 min) ---------- */

export const P96_DATA = Object.freeze({ chargeC: 12, timeMin: 2, laterMin: 5 });

/** Printed data of p96 question 5: I = 12 C / 120 s = 0.1 A; q = 0.1 × 300 s = 30 C. */
export function solveP96Question5() {
  const seconds = P96_DATA.timeMin * 60;
  const laterSeconds = P96_DATA.laterMin * 60;
  const current = currentFromChargeTime(P96_DATA.chargeC, seconds).current;
  const charge = chargeFromCurrentTime(current, laterSeconds).charge;
  return Object.freeze({ seconds, laterSeconds, current, charge });
}

/* ---------- matching a typed scientific term ---------- */

const TASHKEEL = /[\u064B-\u0652\u0670\u0640]/g;

/** Fold a typed term to a comparable form: no diacritics, unified letters, no punctuation. */
export function normalizeTermText(text) {
  return String(text ?? '')
    .replace(TASHKEEL, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0621-\u064Aa-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** True when the typed term matches one of the accepted forms (Arabic or Latin). */
export function matchesTerm(text, accepted) {
  const typed = normalizeTermText(text);
  if (!typed) return false;
  return accepted.some((form) => normalizeTermText(form) === typed);
}
