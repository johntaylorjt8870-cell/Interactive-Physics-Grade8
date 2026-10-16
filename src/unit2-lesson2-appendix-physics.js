/*
 * Pure model for the Unit 2 Lesson 2 appendix —
 * «رحلة الشحنات — من المولّد إلى المصباح» (textbook pages 87–96).
 *
 * Everything the appendix draws or computes comes from here, so the whole
 * appendix can be exercised without a browser:
 *
 *   1. the circuit geometry and the two directions — the conventional current
 *      of Ampère's convention (outside the generator: + → −) and the drift of
 *      the free electrons (outside the generator: − → +, the opposite way).
 *      The relation between the two is derived once, in `segmentDirections()`,
 *      and every arrow on screen is built from that single source of truth;
 *   2. the printed relation I = Q / t in its three equivalent forms, with hard
 *      input validation (finite, non-negative charge, strictly positive time)
 *      so a division by zero can never reach the screen;
 *   3. the interactive calculator state: which quantity is required, the raw
 *      text the student typed, the chosen unit for each known value, and the
 *      substitution steps rendered in LaTeX;
 *   4. the simplified electron-drift model of a metal conductor, seeded so the
 *      same run always produces the same numbers in tests.
 *
 * The book writes the charge as q (p90–p91); this appendix writes the same
 * quantity as Q in the general relation and says so on screen. The symbols
 * I, Q, t, A, C, s and the relation itself are the ones printed on p91.
 */

/* ------------------------------------------------------------ circuit shape */

/* The loop drawn by the appendix: generator on top, lamp on the left branch,
 * switch on the right branch — the layout of the p89/p92 platform
 * reconstructions, redrawn in this appendix's own grid. */
export const CIRCUIT = Object.freeze({
  left: 120,
  right: 600,
  top: 104,
  bottom: 344,
  generator: Object.freeze({ from: 300, to: 420, y: 104 }),
  lamp: Object.freeze({ x: 120, y: 224, r: 30 }),
  switch: Object.freeze({ x: 600, y: 224, r: 26 }),
});

/** Screen directions: SVG x grows to the right, y grows downwards. */
export const DIRECTION_ANGLE = Object.freeze({ right: 0, down: 90, left: 180, up: 270 });
export const OPPOSITE_DIRECTION = Object.freeze({ right: 'left', left: 'right', up: 'down', down: 'up' });

/** The conventional current outside the generator: it leaves + and returns to −. */
export const CONVENTIONAL_FLOW = Object.freeze({
  'top-left': 'left',
  left: 'down',
  bottom: 'right',
  right: 'up',
  'top-right': 'left',
});

/* The electron loop, listed in the direction the electrons move: they leave the
 * − terminal (right end of the generator), travel around the outside of the
 * circuit and return to the + terminal (left end), then pass through the
 * generator from + to − to close the loop. */
export const LOOP_PATH = Object.freeze([
  Object.freeze({ x: CIRCUIT.generator.to, y: CIRCUIT.top }),
  Object.freeze({ x: CIRCUIT.right, y: CIRCUIT.top }),
  Object.freeze({ x: CIRCUIT.right, y: CIRCUIT.bottom }),
  Object.freeze({ x: CIRCUIT.left, y: CIRCUIT.bottom }),
  Object.freeze({ x: CIRCUIT.left, y: CIRCUIT.top }),
  Object.freeze({ x: CIRCUIT.generator.from, y: CIRCUIT.top }),
]);

const SEGMENT_IDS = Object.freeze(['top-right', 'right', 'bottom', 'left', 'top-left', 'generator']);

/** Live view of every wire segment: extent, length and screen direction. */
export const LOOP_SEGMENTS = Object.freeze(LOOP_PATH.map((from, index) => {
  const to = LOOP_PATH[(index + 1) % LOOP_PATH.length];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
  return Object.freeze({ id: SEGMENT_IDS[index], index, from, to, dx, dy, length, direction });
}));

export const loopLength = () => LOOP_SEGMENTS.reduce((total, segment) => total + segment.length, 0);

/**
 * The positions of the arrows of the direction station, one pair per segment.
 * Coordinates come from the same circuit constants the wires use, so an arrow
 * can never drift away from the wire it explains.
 */
export const ARROW_SPOTS = Object.freeze({
  'top-left': Object.freeze({ current: Object.freeze({ x: 236, y: CIRCUIT.top - 20 }), electron: Object.freeze({ x: 236, y: CIRCUIT.top + 20 }) }),
  left: Object.freeze({ current: Object.freeze({ x: CIRCUIT.left - 20, y: 282 }), electron: Object.freeze({ x: CIRCUIT.left + 20, y: 282 }) }),
  bottom: Object.freeze({ current: Object.freeze({ x: 360, y: CIRCUIT.bottom + 20 }), electron: Object.freeze({ x: 360, y: CIRCUIT.bottom - 20 }) }),
  right: Object.freeze({ current: Object.freeze({ x: CIRCUIT.right + 20, y: 282 }), electron: Object.freeze({ x: CIRCUIT.right - 20, y: 282 }) }),
  'top-right': Object.freeze({ current: Object.freeze({ x: 484, y: CIRCUIT.top - 20 }), electron: Object.freeze({ x: 484, y: CIRCUIT.top + 20 }) }),
});

/**
 * The two directions of every segment, derived from one another. The electrons
 * always drift opposite to the conventional current outside the generator.
 *
 * Inside the generator the roles swap, and the *pair* flips with them: the +
 * terminal is its left end and the − terminal its right end, so the electrons
 * run from + to − (left → right, the direction the drift model advances) and
 * the conventional current from − to + (right → left). That is the same
 * "opposite to each other" relation, so the current stays one closed
 * circulation with no break at the generator.
 */
export function segmentDirections() {
  const outside = Object.fromEntries(Object.entries(CONVENTIONAL_FLOW).map(([segment, current]) => [
    segment,
    Object.freeze({ segment, current, electron: OPPOSITE_DIRECTION[current] }),
  ]));
  outside.generator = Object.freeze({
    segment: 'generator',
    current: CONVENTIONAL_FLOW['top-left'],
    electron: OPPOSITE_DIRECTION[CONVENTIONAL_FLOW['top-left']],
  });
  return Object.freeze(outside);
}

export const SEGMENT_DIRECTIONS = segmentDirections();

/** Every outside segment must show the two directions opposite to each other. */
export function oppositeFlowReport() {
  return Object.freeze(Object.values(SEGMENT_DIRECTIONS).map((entry) => Object.freeze({
    segment: entry.segment,
    current: entry.current,
    electron: entry.electron,
    opposite: entry.electron === OPPOSITE_DIRECTION[entry.current],
    angleBetween: Math.abs(DIRECTION_ANGLE[entry.electron] - DIRECTION_ANGLE[entry.current]),
  })));
}

/** Position on the electron loop for an arc length s (wrapped into the loop). */
export function pointOnLoop(s) {
  const total = loopLength();
  const raw = Number(s);
  if (!Number.isFinite(raw)) throw new RangeError('arc length must be finite.');
  const wrapped = ((raw % total) + total) % total;
  let travelled = 0;
  for (const segment of LOOP_SEGMENTS) {
    if (wrapped <= travelled + segment.length) {
      const local = (wrapped - travelled) / segment.length;
      return Object.freeze({
        x: segment.from.x + segment.dx * local,
        y: segment.from.y + segment.dy * local,
        angle: DIRECTION_ANGLE[segment.direction],
        direction: segment.direction,
        segmentId: segment.id,
      });
    }
    travelled += segment.length;
  }
  const last = LOOP_SEGMENTS[LOOP_SEGMENTS.length - 1];
  return Object.freeze({ x: last.to.x, y: last.to.y, angle: DIRECTION_ANGLE[last.direction], direction: last.direction, segmentId: last.id });
}

/* --------------------------------------------------- I = Q / t and its forms */

export const RELATION_TEX = 'I=\\dfrac{Q}{t}';
export const RELATION_LABEL = 'I equals Q over t';
export const CHARGE_FORM_TEX = 'Q=I\\,t';
export const CHARGE_FORM_LABEL = 'Q equals I times t';
export const TIME_FORM_TEX = 't=\\dfrac{Q}{I}';
export const TIME_FORM_LABEL = 't equals Q over I';

const finite = (value, name) => {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new RangeError(`${name} must be a finite number.`);
  return number;
};

const nonNegative = (value, name) => {
  const number = finite(value, name);
  if (number < 0) throw new RangeError(`${name} must not be negative.`);
  return number;
};

const positive = (value, name) => {
  const number = finite(value, name);
  if (number <= 0) throw new RangeError(`${name} must be greater than zero.`);
  return number;
};

/** I = Q / t : current in amperes, charge in coulombs, time in seconds. */
export function currentFromChargeTime(chargeC, timeS) {
  const charge = nonNegative(chargeC, 'charge');
  const time = positive(timeS, 'time');
  return Object.freeze({ current: charge / time, charge, time });
}

/** Q = I · t */
export function chargeFromCurrentTime(currentA, timeS) {
  const current = nonNegative(currentA, 'current');
  const time = positive(timeS, 'time');
  return Object.freeze({ charge: current * time, current, time });
}

/** t = Q / I — refuses a zero current, because that division is undefined. */
export function timeFromChargeCurrent(chargeC, currentA) {
  const charge = nonNegative(chargeC, 'charge');
  const current = positive(currentA, 'current');
  return Object.freeze({ time: charge / current, charge, current });
}

/* Unit conversion — the multiples and submultiples printed on p91. */
export const milliampereToAmpere = (mA) => finite(mA, 'milliamperes') * 1e-3;
export const ampereToMilliampere = (A) => finite(A, 'amperes') * 1e3;
export const microampereToAmpere = (uA) => finite(uA, 'microamperes') * 1e-6;
export const kiloampereToAmpere = (kA) => finite(kA, 'kiloamperes') * 1e3;

/* ------------------------------------------------------------ number display */

/** A compact decimal string: no trailing noise, scientific when it helps. */
export function formatNumber(value, digits = 4) {
  const number = finite(value, 'value');
  if (number === 0) return '0';
  const magnitude = Math.abs(number);
  if (magnitude >= 1e5 || magnitude < 1e-3) {
    const [mantissa, exponent] = number.toExponential(digits - 1).split('e');
    const trimmed = mantissa.includes('.') ? mantissa.replace(/0+$/, '').replace(/\.$/, '') : mantissa;
    return `${trimmed}e${Number(exponent)}`;
  }
  return String(Number(number.toFixed(digits)));
}

/** The same value as a LaTeX literal, so 1.2e-4 becomes 1.2·10⁻⁴ inside KaTeX. */
export function numberTeX(value, digits = 4) {
  const text = formatNumber(value, digits);
  const match = text.match(/^(-?[\d.]+)e(-?\d+)$/);
  return match ? `${match[1]}\\times 10^{${match[2]}}` : text;
}

/** A value with its unit inside one LTR math island: 2 A, 200 mA, 0.1 C. */
export function quantityTeX(value, unitSymbol, digits = 4) {
  return `${numberTeX(value, digits)}\\,\\mathrm{${unitSymbol}}`;
}

const unitSymbols = Object.freeze({ A: 'A', mA: 'mA', C: 'C', s: 's', min: 'min' });
const unitSymbolTeX = (unit) => {
  const symbol = unitSymbols[unit];
  if (!symbol) throw new RangeError(`unknown unit: ${unit}`);
  return symbol;
};

/** Normalise a typed value to SI: amperes, coulombs, seconds. */
export function toSeconds(value, unit) {
  const number = finite(value, 'time');
  if (unit === 's') return nonNegative(number, 'time');
  if (unit === 'min') return nonNegative(number * 60, 'time');
  throw new RangeError(`unknown time unit: ${unit}`);
}

export function toAmperes(value, unit) {
  const number = finite(value, 'current');
  if (unit === 'A') return nonNegative(number, 'current');
  if (unit === 'mA') return nonNegative(number * 1e-3, 'current');
  throw new RangeError(`unknown current unit: ${unit}`);
}

export const TIME_UNITS = Object.freeze(['s', 'min']);
export const CURRENT_UNITS = Object.freeze(['A', 'mA']);
export const CHARGE_UNITS = Object.freeze(['C']);

/* ------------------------------------------------------------- the calculator */

export const CALCULATOR_TARGETS = Object.freeze([
  Object.freeze({ id: 'I', symbol: 'I', name: 'شِدّة التيّار', unit: 'A', unitName: 'أمبير', required: Object.freeze(['Q', 't']) }),
  Object.freeze({ id: 'Q', symbol: 'Q', name: 'كميّة الكهرباء', unit: 'C', unitName: 'كولوم', required: Object.freeze(['I', 't']) }),
  Object.freeze({ id: 't', symbol: 't', name: 'الزمن', unit: 's', unitName: 'ثانية', required: Object.freeze(['Q', 'I']) }),
]);

export function findCalculatorTarget(targetId) {
  const target = CALCULATOR_TARGETS.find((candidate) => candidate.id === targetId);
  if (!target) throw new RangeError(`Unknown calculator target: ${targetId}`);
  return target;
}

/** Inputs of each target: the two known quantities and their default units. */
const TARGET_INPUTS = Object.freeze({
  I: Object.freeze([Object.freeze({ field: 'Q', unit: 'C' }), Object.freeze({ field: 't', unit: 's' })]),
  Q: Object.freeze([Object.freeze({ field: 'I', unit: 'A' }), Object.freeze({ field: 't', unit: 's' })]),
  t: Object.freeze([Object.freeze({ field: 'Q', unit: 'C' }), Object.freeze({ field: 'I', unit: 'A' })]),
});

export const FIELD_META = Object.freeze({
  Q: Object.freeze({ field: 'Q', symbol: 'Q', name: 'كميّة الكهرباء', units: CHARGE_UNITS, baseUnit: 'C' }),
  I: Object.freeze({ field: 'I', symbol: 'I', name: 'شِدّة التيّار', units: CURRENT_UNITS, baseUnit: 'A' }),
  t: Object.freeze({ field: 't', symbol: 't', name: 'الزمن', units: TIME_UNITS, baseUnit: 's' }),
});

export const CALCULATOR_START = Object.freeze({ Q: '60', t: '30' });

/**
 * A fresh calculator: the target defaults to I, and the values are the ones the
 * book's own worked application on p91 uses (60 C in 30 s ⇒ 2 A), so the first
 * screen a student sees is a verified pair of numbers.
 */
export function createCalculatorState(targetId = 'I', values = CALCULATOR_START) {
  const target = findCalculatorTarget(targetId);
  const inputs = TARGET_INPUTS[target.id].map(({ field, unit }) => Object.freeze({
    field,
    unit,
    raw: Object.prototype.hasOwnProperty.call(values, field) ? String(values[field]) : '',
  }));
  return Object.freeze({ target: target.id, inputs: Object.freeze(inputs), touched: false });
}

export function setCalculatorTarget(state, targetId) {
  const target = findCalculatorTarget(targetId);
  const previous = new Map(state.inputs.map((input) => [input.field, input]));
  const inputs = TARGET_INPUTS[target.id].map(({ field, unit }) => {
    const carried = previous.get(field);
    return Object.freeze({ field, unit: carried?.unit ?? unit, raw: carried?.raw ?? '' });
  });
  return Object.freeze({ target: target.id, inputs: Object.freeze(inputs), touched: state.touched });
}

export function setCalculatorInput(state, field, raw) {
  const next = state.inputs.map((input) => (input.field === field ? Object.freeze({ ...input, raw: String(raw ?? '') }) : input));
  return Object.freeze({ target: state.target, inputs: Object.freeze(next), touched: true });
}

export function setCalculatorUnit(state, field, unit) {
  const meta = FIELD_META[field];
  if (!meta) throw new RangeError(`unknown field: ${field}`);
  if (!meta.units.includes(unit)) throw new RangeError(`${field} has no unit ${unit}.`);
  const next = state.inputs.map((input) => (input.field === field ? Object.freeze({ ...input, unit }) : input));
  return Object.freeze({ target: state.target, inputs: Object.freeze(next), touched: true });
}

export const resetCalculatorState = (state, values = CALCULATOR_START) => createCalculatorState(state.target, values);

const parseInput = (input) => {
  const raw = String(input.raw ?? '').trim();
  if (raw === '') return Object.freeze({ status: 'empty' });
  const normalised = raw.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/,/g, '.');
  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i.test(normalised)) {
    return Object.freeze({ status: 'unreadable' });
  }
  const value = Number(normalised);
  if (!Number.isFinite(value)) return Object.freeze({ status: 'unreadable' });
  return Object.freeze({ status: 'ok', value });
};

/**
 * The whole calculator, computed from the raw state. It never throws on student
 * input: every problem comes back as a labelled message instead, and `steps`
 * stays empty until the two known values of the chosen target are usable.
 */
export function calculatorReport(state) {
  const target = findCalculatorTarget(state.target);
  const parsed = new Map(state.inputs.map((input) => [input.field, Object.freeze({ input, ...parseInput(input) })]));
  const issues = [];

  for (const { input, ...entry } of parsed.values()) {
    const meta = FIELD_META[input.field];
    if (entry.status === 'empty') issues.push(Object.freeze({ field: input.field, message: `أدخل قيمة ${meta.name} (${input.field}).` }));
    else if (entry.status === 'unreadable') issues.push(Object.freeze({ field: input.field, message: `${meta.name} يجب أن تكون رقماً مكتوباً بالأرقام (مثال: 60).` }));
    else if (entry.value < 0) issues.push(Object.freeze({ field: input.field, message: `${meta.name} لا تكون سالبة في هذا النموذج.` }));
  }

  /* The time is an input of the I and Q targets only; a zero time is the
   * division by zero this appendix must never perform. */
  const timeEntry = parsed.get('t');
  if (timeEntry?.status === 'ok' && timeEntry.value === 0) {
    issues.push(Object.freeze({ field: 't', message: 'الزمن يجب أن يكون أكبر من صفر؛ القسمة على زمن صفري غير معرّفة.' }));
  }
  const currentEntry = parsed.get('I');
  if (target.id === 't' && currentEntry?.status === 'ok' && currentEntry.value === 0) {
    issues.push(Object.freeze({ field: 'I', message: 'قسمة كمية الكهرباء على شِدّة تيار صفرية غير معرّفة: اجعل شِدّة التيار أكبر من صفر.' }));
  }

  if (issues.length > 0) {
    return Object.freeze({
      status: 'invalid',
      target: target.id,
      targetMeta: target,
      issues: Object.freeze(issues),
      steps: Object.freeze([]),
      result: null,
    });
  }

  const invalid = (field, message) => Object.freeze({
    status: 'invalid',
    target: target.id,
    targetMeta: target,
    issues: Object.freeze([Object.freeze({ field, message })]),
    steps: Object.freeze([]),
    result: null,
  });

  const conversions = [];
  let siTime = null;
  if (timeEntry) {
    try {
      siTime = toSeconds(timeEntry.value, timeEntry.input.unit);
    } catch (error) {
      /* Defensive: a value the validation above did not expect must still come
       * back as a readable message instead of breaking the station. */
      return invalid('t', 'الزمن يجب أن يكون رقماً موجباً أكبر من صفر.');
    }
    if (timeEntry.input.unit === 'min' && timeEntry.value !== 0) {
      conversions.push(Object.freeze({
        label: 'تحويل الزمن إلى الثواني',
        tex: `t=${numberTeX(timeEntry.value)}\\,\\mathrm{min}=${numberTeX(timeEntry.value)}\\times 60\\,\\mathrm{s}=${quantityTeX(siTime, 's')}`,
        plain: `t equals ${formatNumber(timeEntry.value)} minutes equals ${formatNumber(siTime)} seconds`,
      }));
    }
  }

  let siCurrent = null;
  if (currentEntry) {
    try {
      siCurrent = toAmperes(currentEntry.value, currentEntry.input.unit);
    } catch (error) {
      return invalid('I', 'شِدّة التيّار يجب أن تكون رقماً غير سالب.');
    }
    if (currentEntry.input.unit === 'mA' && currentEntry.value !== 0) {
      conversions.push(Object.freeze({
        label: 'تحويل شِدّة التيار إلى الأمبير',
        tex: `I=${numberTeX(currentEntry.value)}\\,\\mathrm{mA}=${numberTeX(currentEntry.value)}\\times 10^{-3}\\,\\mathrm{A}=${quantityTeX(siCurrent, 'A')}`,
        plain: `I equals ${formatNumber(currentEntry.value)} milliamperes equals ${formatNumber(siCurrent)} amperes`,
      }));
    }
  }

  let steps = [];
  let result = null;
  let resultUnit = target.unit;
  let alternate = null;

  if (target.id === 'I') {
    const reading = currentFromChargeTime(parsed.get('Q').value, siTime);
    result = reading.current;
    resultUnit = 'A';
    steps = [
      Object.freeze({ label: 'العلاقة', tex: RELATION_TEX, plain: RELATION_LABEL }),
      ...conversions,
      Object.freeze({
        label: 'التعويض',
        tex: `I=\\dfrac{${quantityTeX(reading.charge, 'C')}}{${quantityTeX(reading.time, 's')}}`,
        plain: `I equals ${formatNumber(reading.charge)} coulomb over ${formatNumber(reading.time)} seconds`,
      }),
      Object.freeze({
        label: 'الناتج',
        tex: `I=${quantityTeX(reading.current, 'A')}`,
        plain: `I equals ${formatNumber(reading.current)} ampere`,
      }),
    ];
    /* A reading far from the ampere is easier to place with its submultiple. */
    if (reading.current !== 0 && (reading.current < 1 || reading.current >= 1000)) {
      alternate = Object.freeze({ value: ampereToMilliampere(reading.current), unit: 'mA' });
    }
  }

  if (target.id === 'Q') {
    const reading = chargeFromCurrentTime(siCurrent, siTime);
    result = reading.charge;
    resultUnit = 'C';
    steps = [
      Object.freeze({ label: 'الصورة المكافئة للعلاقة', tex: CHARGE_FORM_TEX, plain: CHARGE_FORM_LABEL }),
      ...conversions,
      Object.freeze({
        label: 'التعويض',
        tex: `Q=${quantityTeX(reading.current, 'A')}\\times ${quantityTeX(reading.time, 's')}`,
        plain: `Q equals ${formatNumber(reading.current)} ampere times ${formatNumber(reading.time)} seconds`,
      }),
      Object.freeze({
        label: 'الناتج',
        tex: `Q=${quantityTeX(reading.charge, 'C')}`,
        plain: `Q equals ${formatNumber(reading.charge)} coulomb`,
      }),
    ];
  }

  if (target.id === 't') {
    const reading = timeFromChargeCurrent(parsed.get('Q').value, siCurrent);
    result = reading.time;
    resultUnit = 's';
    steps = [
      Object.freeze({ label: 'الصورة المكافئة للعلاقة', tex: TIME_FORM_TEX, plain: TIME_FORM_LABEL }),
      ...conversions,
      Object.freeze({
        label: 'التعويض',
        tex: `t=\\dfrac{${quantityTeX(reading.charge, 'C')}}{${quantityTeX(reading.current, 'A')}}`,
        plain: `t equals ${formatNumber(reading.charge)} coulomb over ${formatNumber(reading.current)} ampere`,
      }),
      Object.freeze({
        label: 'الناتج',
        tex: `t=${quantityTeX(reading.time, 's')}`,
        plain: `t equals ${formatNumber(reading.time)} seconds`,
      }),
    ];
    if (reading.time >= 60) alternate = Object.freeze({ value: reading.time / 60, unit: 'min' });
  }

  return Object.freeze({
    status: 'ok',
    target: target.id,
    targetMeta: target,
    issues: Object.freeze([]),
    steps: Object.freeze(steps),
    result,
    resultUnit,
    alternate,
    si: Object.freeze({
      charge: parsed.get('Q')?.value ?? null,
      current: siCurrent,
      time: siTime,
    }),
  });
}

/* ------------------------------------------------------------- the ammeter lab */

/** The dial of the appendix's ammeter: 0 … 12 A, needle from −60° to +60°. */
export const AMMETER = Object.freeze({
  minA: 0,
  maxA: 12,
  startAngle: -60,
  sweep: 120,
  labels: Object.freeze([0, 2, 4, 6, 8, 10, 12]),
});

export function needleAngle(currentA, dial = AMMETER) {
  const current = nonNegative(currentA, 'current');
  const fraction = Math.max(0, Math.min(1, current / dial.maxA));
  return Object.freeze({ angle: dial.startAngle + fraction * dial.sweep, fraction });
}

/** Clamp a lab control to its declared range (used by the sliders and by tests). */
export function clampValue(value, min, max, step = 1) {
  const number = finite(value, 'value');
  const lower = finite(min, 'min');
  const upper = finite(max, 'max');
  const increment = finite(step, 'step');
  if (upper <= lower) throw new RangeError('max must be greater than min.');
  if (increment <= 0) throw new RangeError('step must be greater than zero.');
  const stepped = Math.round((number - lower) / increment) * increment + lower;
  return Math.max(lower, Math.min(upper, Number(stepped.toFixed(6))));
}

export const LAB_RANGE = Object.freeze({
  charge: Object.freeze({ min: 10, max: 120, step: 10, start: 60, unit: 'C' }),
  time: Object.freeze({ min: 10, max: 120, step: 10, start: 30, unit: 's' }),
});

/** Reading of the lab: I = Q / t, shown in amperes, milliamperes and on the dial. */
export function ammeterReading(chargeC, timeS, dial = AMMETER) {
  const reading = currentFromChargeTime(clampValue(chargeC, LAB_RANGE.charge.min, LAB_RANGE.charge.max, LAB_RANGE.charge.step), clampValue(timeS, LAB_RANGE.time.min, LAB_RANGE.time.max, LAB_RANGE.time.step));
  const needle = needleAngle(reading.current, dial);
  const milliampere = ampereToMilliampere(reading.current);
  return Object.freeze({
    charge: reading.charge,
    time: reading.time,
    current: reading.current,
    milli: milliampere,
    predominantUnit: reading.current >= 1 ? 'A' : 'mA',
    predominantValue: reading.current >= 1 ? reading.current : milliampere,
    needle,
  });
}

/** The two lab buttons double or halve the value inside the slider grid. */
export function scaleLabInput(value, range, factor) {
  const multiplier = finite(factor, 'factor');
  if (multiplier === 0) throw new RangeError('factor must not be zero.');
  return clampValue(finite(value, 'value') * multiplier, range.min, range.max, range.step);
}

/* ------------------------------------------------- the electron-drift model */

export const DRIFT_DEFAULTS = Object.freeze({
  electronCount: 16,
  driftSpeed: 40,       // px per second along the wire — a drawing speed, not the physical one
  thermalSpeed: 90,     // px per second of random walk along the wire
  jitterAmplitude: 7,   // px across the wire
  seed: 20261016,
});

const nextRandom = (seed) => {
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return Object.freeze({ seed: nextSeed, value: nextSeed / 4294967296 });
};

/**
 * A conductor full of free electrons. Each electron has an arc-length position
 * on the loop, a small cross-wire offset, and the net distance it has travelled
 * since the last reset. Nothing is created or destroyed: `electronCount` stays
 * the same through every step, including the steps where the electron passes
 * through the lamp — the lamp converts energy, it does not consume electrons.
 */
export function createDriftState(options = {}) {
  const config = { ...DRIFT_DEFAULTS, ...options };
  const count = Number(config.electronCount);
  if (!Number.isInteger(count) || count < 4 || count > 60) throw new RangeError('electronCount must be an integer between 4 and 60.');
  const total = loopLength();
  const spacing = total / count;
  const electrons = Array.from({ length: count }, (_, index) => Object.freeze({
    id: index,
    s: Number((index * spacing).toFixed(3)),
    offset: 0,
    travelled: 0,
  }));
  return Object.freeze({
    electrons: Object.freeze(electrons),
    loopLength: total,
    seed: Number(config.seed) >>> 0,
    closed: false,
    running: false,
    elapsed: 0,
    thermalSpeed: Number(config.thermalSpeed),
    driftSpeed: Number(config.driftSpeed),
    jitterAmplitude: Number(config.jitterAmplitude),
  });
}

export function setDriftClosed(state, closed) {
  return Object.freeze({ ...state, closed: Boolean(closed) });
}

export function setDriftRunning(state, running) {
  return Object.freeze({ ...state, running: Boolean(running) });
}

/**
 * Advance the model by `dtSeconds`. Returns a new frozen state; the pseudo
 * random sequence is carried in the state, so a seeded run is reproducible.
 *
 *   - circuit open  : only the random thermal motion acts, so the electrons
 *                     wander and their mean net displacement stays around zero;
 *   - circuit closed: the same random motion plus a drift in one direction, so
 *                     the mean net displacement grows steadily.
 */
export function advanceDrift(state, dtSeconds, options = {}) {
  const dt = finite(dtSeconds, 'dt');
  if (dt <= 0 || dt > 0.5) throw new RangeError('dt must be a positive number of seconds no larger than 0.5.');
  const closed = options.closed ?? state.closed;
  let seed = state.seed;
  const electrons = state.electrons.map((electron) => {
    const randomStep = nextRandom(seed);
    seed = randomStep.seed;
    const randomJitter = nextRandom(seed);
    seed = randomJitter.seed;

    const thermal = (randomStep.value - 0.5) * state.thermalSpeed * dt * (closed ? 0.45 : 1.4);
    const drift = closed ? state.driftSpeed * dt : 0;
    const step = thermal + drift;
    const nextS = ((electron.s + step) % state.loopLength + state.loopLength) % state.loopLength;
    const targetOffset = (randomJitter.value - 0.5) * 2 * state.jitterAmplitude * (closed ? 0.35 : 1);
    const offset = electron.offset * 0.6 + targetOffset * 0.4;
    return Object.freeze({ id: electron.id, s: nextS, offset, travelled: electron.travelled + step });
  });
  return Object.freeze({
    ...state,
    electrons: Object.freeze(electrons),
    seed,
    closed,
    elapsed: state.elapsed + dt,
  });
}

export function resetDriftState(state) {
  const base = createDriftState({
    electronCount: state.electrons.length,
    seed: DRIFT_DEFAULTS.seed,
    driftSpeed: state.driftSpeed,
    thermalSpeed: state.thermalSpeed,
    jitterAmplitude: state.jitterAmplitude,
  });
  return setDriftClosed(base, state.closed);
}

/** What the readouts show: how far the electron cloud has moved, on average. */
export function driftSummary(state) {
  const count = state.electrons.length;
  const meanNet = state.electrons.reduce((total, electron) => total + electron.travelled, 0) / count;
  const spread = state.electrons.reduce((total, electron) => total + Math.abs(electron.travelled), 0) / count;
  return Object.freeze({
    count,
    closed: state.closed,
    elapsed: state.elapsed,
    meanNetDisplacement: meanNet,
    meanDistance: spread,
    ordered: state.closed && Math.abs(meanNet) > 1,
    electronsConserved: count,
  });
}

/** Screen coordinates of one electron, including its cross-wire offset. */
export function electronPoint(electron) {
  const point = pointOnLoop(electron.s);
  const radians = (point.angle * Math.PI) / 180;
  const normalX = Math.cos(radians + Math.PI / 2);
  const normalY = Math.sin(radians + Math.PI / 2);
  return Object.freeze({
    x: point.x + normalX * electron.offset,
    y: point.y + normalY * electron.offset,
    angle: point.angle,
    segmentId: point.segmentId,
  });
}

/* ------------------------------------------------------------- consistency */

/**
 * Sanity report used by the test suite: every printed relation must agree with
 * every other one, and the lamp must never remove an electron.
 */
export function consistencyReport() {
  const pairs = [
    Object.freeze({ charge: 60, time: 30 }),
    Object.freeze({ charge: 12, time: 120 }),
    Object.freeze({ charge: 45, time: 15 }),
    Object.freeze({ charge: 200, time: 1000 }),
    Object.freeze({ charge: 0, time: 5 }),
  ];
  return Object.freeze(pairs.map(({ charge, time }) => {
    const forward = currentFromChargeTime(charge, time);
    const back = chargeFromCurrentTime(forward.current, time);
    const timing = forward.current > 0 ? timeFromChargeCurrent(charge, forward.current) : null;
    return Object.freeze({
      charge,
      time,
      current: forward.current,
      chargeReturns: Math.abs(back.charge - charge) <= 1e-9,
      timeReturns: timing === null || Math.abs(timing.time - time) <= 1e-9,
    });
  }));
}
