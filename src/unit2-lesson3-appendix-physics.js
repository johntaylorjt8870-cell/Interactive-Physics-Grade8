/*
 * Pure electrical model for the Unit 2 Lesson 3 appendix —
 * «محطة الفولت — اكشف فرق الكمون» (textbook pages 97–106).
 *
 * Everything the appendix draws or reads comes from this module, so the whole
 * appendix can be exercised without a browser and every number on screen can be
 * traced back to one place:
 *
 *   1. three bench circuits (`series2`, `series3`, `parallel2`) described by
 *      nodes (the glowing measurement points) and elements (source, lamps,
 *      switch) with fixed screen coordinates, so the view and the geometry
 *      audit share one source of truth;
 *   2. an ideal-school model: ideal source (no internal resistance), ideal
 *      wires and closed switch (0 Ω), ideal voltmeter (draws no current), each
 *      lamp modelled by a representative resistance in ohms — labelled on the
 *      page as «نموذج تعليمي مبسّط» with its limits written next to it;
 *   3. node potentials referred to the source's negative terminal, from which
 *      every reading is a difference `V(a) − V(b)`. Changing the reference
 *      shifts every potential by the same amount and never changes a reading,
 *      which is itself one of the appendix's teaching points;
 *   4. the two printed relations, evaluated only where they hold: a closed
 *      series loop gives `U = U₁ + U₂ + …`, and parallel branches joined to the
 *      same two nodes give `U = U₁ = U₂`.
 *
 * The switch is always drawn on the return wire next to the negative terminal
 * (series) or right after the positive terminal (parallel). With the switch
 * open the current is zero, every passive element therefore has 0 V across it,
 * the whole conductor chain still joined to the positive terminal sits at the
 * source potential, and the open switch itself carries the full source
 * potential difference — exactly the readings the p100 experiment expects, and
 * never an invented number.
 */

/* ------------------------------------------------------------- validation */

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

/* ------------------------------------------------------- units and display */

/** The multiples and submultiples of the volt printed on p105 of the book. */
export const VOLTAGE_UNIT_IN_VOLTS = Object.freeze({ kV: 1000, V: 1, mV: 0.001 });
export const VOLTAGE_UNITS = Object.freeze(Object.keys(VOLTAGE_UNIT_IN_VOLTS));

export function convertVoltage(value, fromUnit, toUnit) {
  const magnitude = nonNegative(value, 'Potential difference');
  if (!Object.hasOwn(VOLTAGE_UNIT_IN_VOLTS, fromUnit) || !Object.hasOwn(VOLTAGE_UNIT_IN_VOLTS, toUnit)) {
    throw new RangeError('Supported units are kV, V, and mV.');
  }
  return magnitude * VOLTAGE_UNIT_IN_VOLTS[fromUnit] / VOLTAGE_UNIT_IN_VOLTS[toUnit];
}

/** A compact decimal string: `4` not `4.00`, `0.5` not `0.5000000001`. */
export function formatVoltage(value, digits = 4) {
  const number = finite(value, 'value');
  const rounded = Number(number.toFixed(digits));
  if (Object.is(rounded, -0)) return '0';
  return String(rounded);
}

/** The model's tolerance when two readings are compared for equality. */
export const EPS = 1e-9;
export const nearlyEqual = (a, b) => Math.abs(finite(a, 'a') - finite(b, 'b')) <= EPS;

/* ---------------------------------------------------------- bench geometry */

/** One drawing space for every bench scene; the view scales it responsively. */
export const BENCH_VIEW = Object.freeze({ width: 780, height: 450 });

/**
 * The two probe callouts drawn on the bench, with the pill wide enough for the
 * longer Arabic label at the scene font size (`12 characters × 11.5 px × 0.55`
 * ≈ 76 units of text, plus 4 units of padding on each side). The pill used to
 * be 52 units wide, so «المجس الأحمر» spilled over the white outline and onto
 * the neighbouring part labels.
 */
export const PROBE_LABEL_TEXT = Object.freeze({ red: 'المجس الأحمر', black: 'المجس الأسود' });

export const PROBE_CALLOUT = Object.freeze({
  width: 84,
  height: 22,
  radius: 7,
  fontSize: 11.5,
  /* how far the pill's centre sits from its measurement point, per lead side */
  distance: Object.freeze({ up: 58, down: 40, left: 64, right: 64 }),
  /* the glowing point's halo radius — the pill must stay clear of it */
  halo: 16,
});

/**
 * The box, handle centre and leader of one probe callout. The view draws from
 * this and the geometry test asserts on it, so a label can never drift onto a
 * part label, a drawn symbol or a measurement point again.
 */
export function probeCalloutBox(point) {
  if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
    throw new TypeError('A measurement point is required.');
  }
  const side = Object.hasOwn(PROBE_CALLOUT.distance, point.lead) ? point.lead : 'up';
  const distance = PROBE_CALLOUT.distance[side];
  const dx = side === 'left' ? -1 : side === 'right' ? 1 : 0;
  const dy = side === 'up' ? -1 : side === 'down' ? 1 : 0;
  const hx = point.x + dx * distance;
  const hy = point.y + dy * distance;
  const halfWidth = PROBE_CALLOUT.width / 2;
  const halfHeight = PROBE_CALLOUT.height / 2;
  return Object.freeze({
    side, distance, hx, hy,
    x1: hx - halfWidth, x2: hx + halfWidth,
    y1: hy - halfHeight, y2: hy + halfHeight,
    width: PROBE_CALLOUT.width, height: PROBE_CALLOUT.height,
  });
}

const node = (id, letter, label, x, y, role = 'wire', lead = 'up') =>
  Object.freeze({ id, letter, label, x, y, role, lead });

const lamp = (id, label, x, y) => Object.freeze({ id, kind: 'lamp', label, x, y, r: 27 });
const switchPart = (id, x, y) => Object.freeze({ id, kind: 'switch', label: 'القاطعة', x, y, r: 24 });
const sourcePart = (id, from, to, y) => Object.freeze({ id, kind: 'source', label: 'المولّد', from, to, y });

/* Series bench with two lamps: source on the top wire, lamp 1 on the right
 * wire, lamp 2 on the bottom wire, switch on the left wire next to the return
 * path to the negative terminal. */
const SERIES2 = Object.freeze({
  id: 'series2',
  topology: 'series',
  corners: Object.freeze({ left: 120, right: 660, top: 90, bottom: 350 }),
  source: sourcePart('src', 330, 450, 90),
  elements: Object.freeze([
    lamp('l1', 'المصباح الأول', 660, 165),
    lamp('l2', 'المصباح الثاني', 430, 350),
    switchPart('sw', 120, 250),
  ]),
  /* loop order, starting at the positive terminal */
  nodes: Object.freeze([
    node('pos', 'A', 'القطب الموجب للمولّد', 500, 90, 'source-plus', 'up'),
    node('w1', 'B', 'نقطة على السلك قبل المصباح الأول', 600, 90, 'wire', 'up'),
    node('mid', 'C', 'النقطة بين المصباحين', 660, 255, 'wire', 'right'),
    node('w2', 'D', 'نقطة على السلك بعد المصباح الثاني', 240, 350, 'wire', 'down'),
    node('w3', 'E', 'نقطة بعد القاطعة المفتوحة', 120, 150, 'wire', 'left'),
    node('neg', 'F', 'القطب السالب للمولّد (المرجع)', 270, 90, 'source-minus', 'up'),
  ]),
  /* which element sits between which pair of consecutive nodes */
  links: Object.freeze([
    Object.freeze({ from: 'pos', to: 'w1', element: null }),
    Object.freeze({ from: 'w1', to: 'mid', element: 'l1' }),
    Object.freeze({ from: 'mid', to: 'w2', element: 'l2' }),
    Object.freeze({ from: 'w2', to: 'w3', element: 'sw' }),
    Object.freeze({ from: 'w3', to: 'neg', element: null }),
    Object.freeze({ from: 'neg', to: 'pos', element: 'src' }),
  ]),
});

/* The same bench with a third lamp on the left wire. */
const SERIES3 = Object.freeze({
  id: 'series3',
  topology: 'series',
  corners: Object.freeze({ left: 120, right: 660, top: 90, bottom: 350 }),
  source: sourcePart('src', 330, 450, 90),
  elements: Object.freeze([
    lamp('l1', 'المصباح الأول', 660, 165),
    lamp('l2', 'المصباح الثاني', 430, 350),
    lamp('l3', 'المصباح الثالث', 120, 285),
    switchPart('sw', 120, 165),
  ]),
  nodes: Object.freeze([
    node('pos', 'A', 'القطب الموجب للمولّد', 500, 90, 'source-plus', 'up'),
    node('w1', 'B', 'نقطة على السلك قبل المصباح الأول', 600, 90, 'wire', 'up'),
    node('mid1', 'C', 'النقطة بين المصباحين الأول والثاني', 660, 255, 'wire', 'right'),
    node('mid2', 'D', 'النقطة بين المصباحين الثاني والثالث', 220, 350, 'wire', 'down'),
    node('w2', 'E', 'نقطة بعد المصباح الثالث', 120, 225, 'wire', 'left'),
    node('w3', 'F', 'نقطة بعد القاطعة المفتوحة', 120, 120, 'wire', 'left'),
    node('neg', 'G', 'القطب السالب للمولّد (المرجع)', 270, 90, 'source-minus', 'up'),
  ]),
  links: Object.freeze([
    Object.freeze({ from: 'pos', to: 'w1', element: null }),
    Object.freeze({ from: 'w1', to: 'mid1', element: 'l1' }),
    Object.freeze({ from: 'mid1', to: 'mid2', element: 'l2' }),
    Object.freeze({ from: 'mid2', to: 'w2', element: 'l3' }),
    Object.freeze({ from: 'w2', to: 'w3', element: 'sw' }),
    Object.freeze({ from: 'w3', to: 'neg', element: null }),
    Object.freeze({ from: 'neg', to: 'pos', element: 'src' }),
  ]),
});

/* Parallel bench: two lamp branches between the same two rails, the switch on
 * the top rail between the positive terminal and the branch junction. */
const PARALLEL2 = Object.freeze({
  id: 'parallel2',
  topology: 'parallel',
  corners: Object.freeze({ left: 110, right: 700, top: 90, bottom: 350 }),
  source: sourcePart('src', 180, 300, 90),
  elements: Object.freeze([
    lamp('l1', 'المصباح الأول (الفرع 1)', 430, 220),
    lamp('l2', 'المصباح الثاني (الفرع 2)', 570, 220),
    switchPart('sw', 360, 90),
  ]),
  nodes: Object.freeze([
    node('pos', 'A', 'القطب الموجب للمولّد', 330, 90, 'source-plus', 'up'),
    node('jtop', 'B', 'الوصلة العليا بعد القاطعة', 640, 90, 'wire', 'up'),
    node('ain', 'C', 'مدخل الفرع الأول', 430, 140, 'wire', 'right'),
    node('aout', 'D', 'مخرج الفرع الأول', 430, 300, 'wire', 'left'),
    node('bin', 'E', 'مدخل الفرع الثاني', 570, 140, 'wire', 'right'),
    node('bout', 'F', 'مخرج الفرع الثاني', 570, 300, 'wire', 'right'),
    node('jbot', 'G', 'الوصلة السفلى', 650, 350, 'wire', 'down'),
    node('neg', 'H', 'القطب السالب للمولّد (المرجع)', 140, 90, 'source-minus', 'up'),
  ]),
  links: Object.freeze([
    Object.freeze({ from: 'pos', to: 'jtop', element: 'sw' }),
    Object.freeze({ from: 'jtop', to: 'ain', element: null }),
    Object.freeze({ from: 'ain', to: 'aout', element: 'l1' }),
    Object.freeze({ from: 'aout', to: 'jbot', element: null }),
    Object.freeze({ from: 'jtop', to: 'bin', element: null }),
    Object.freeze({ from: 'bin', to: 'bout', element: 'l2' }),
    Object.freeze({ from: 'bout', to: 'jbot', element: null }),
    Object.freeze({ from: 'jbot', to: 'neg', element: null }),
    Object.freeze({ from: 'neg', to: 'pos', element: 'src' }),
  ]),
});

/* One-lamp bench for the opening station: source on the top wire, one lamp on
 * the right wire, switch on the left wire; the two glowing points that matter
 * are the lamp's own terminals. */
const SINGLE = Object.freeze({
  id: 'single',
  topology: 'series',
  corners: Object.freeze({ left: 120, right: 660, top: 90, bottom: 350 }),
  source: sourcePart('src', 330, 450, 90),
  elements: Object.freeze([
    lamp('l1', 'المصباح', 660, 210),
    switchPart('sw', 120, 250),
  ]),
  nodes: Object.freeze([
    node('pos', 'A', 'القطب الموجب للمولّد', 500, 90, 'source-plus', 'up'),
    node('lin', 'B', 'طرف المصباح الأول (نقطة القياس 1)', 660, 140, 'wire', 'right'),
    node('lout', 'C', 'طرف المصباح الثاني (نقطة القياس 2)', 660, 280, 'wire', 'right'),
    node('w2', 'D', 'نقطة على السلك السفلي', 300, 350, 'wire', 'down'),
    node('w3', 'E', 'نقطة بعد القاطعة', 120, 150, 'wire', 'left'),
    node('neg', 'F', 'القطب السالب للمولّد', 270, 90, 'source-minus', 'up'),
  ]),
  links: Object.freeze([
    Object.freeze({ from: 'pos', to: 'lin', element: null }),
    Object.freeze({ from: 'lin', to: 'lout', element: 'l1' }),
    Object.freeze({ from: 'lout', to: 'w2', element: null }),
    Object.freeze({ from: 'w2', to: 'w3', element: 'sw' }),
    Object.freeze({ from: 'w3', to: 'neg', element: null }),
    Object.freeze({ from: 'neg', to: 'pos', element: 'src' }),
  ]),
});

export const BENCH_LAYOUTS = Object.freeze({
  single: SINGLE,
  series2: SERIES2,
  series3: SERIES3,
  parallel2: PARALLEL2,
});
export const BENCH_LAYOUT_IDS = Object.freeze(Object.keys(BENCH_LAYOUTS));

/** The part labels each scene draws, with the CSS class that sizes them. */
export const SCENE_LABEL_ANCHORS = Object.freeze({
  single: Object.freeze({
    sourceTitle: Object.freeze({ x: 390, y: 42, className: 'u2l3a-part-label is-title' }),
    terminalPositive: Object.freeze({ x: 462, y: 62, className: 'u2l3a-part-sub' }),
    terminalNegative: Object.freeze({ x: 318, y: 62, className: 'u2l3a-part-sub' }),
    /* inside the loop, to the left of the lamp: the two probe callouts sit on
     * the right wire above and below this height, so the lamp label keeps a
     * clear gap from «المجس الأحمر» instead of being sandwiched under it. */
    lampOne: Object.freeze({ x: 596, y: 210, className: 'u2l3a-part-label' }),
    switchLabel: Object.freeze({ x: 196, y: 246, className: 'u2l3a-part-label' }),
  }),
  series2: Object.freeze({
    sourceTitle: Object.freeze({ x: 390, y: 42, className: 'u2l3a-part-label is-title' }),
    terminalPositive: Object.freeze({ x: 462, y: 62, className: 'u2l3a-part-sub' }),
    terminalNegative: Object.freeze({ x: 318, y: 62, className: 'u2l3a-part-sub' }),
    lampOne: Object.freeze({ x: 660, y: 122, className: 'u2l3a-part-label' }),
    lampTwo: Object.freeze({ x: 430, y: 398, className: 'u2l3a-part-label' }),
    switchLabel: Object.freeze({ x: 196, y: 246, className: 'u2l3a-part-label' }),
  }),
  series3: Object.freeze({
    sourceTitle: Object.freeze({ x: 390, y: 42, className: 'u2l3a-part-label is-title' }),
    terminalPositive: Object.freeze({ x: 462, y: 62, className: 'u2l3a-part-sub' }),
    terminalNegative: Object.freeze({ x: 318, y: 62, className: 'u2l3a-part-sub' }),
    lampOne: Object.freeze({ x: 660, y: 122, className: 'u2l3a-part-label' }),
    lampTwo: Object.freeze({ x: 430, y: 398, className: 'u2l3a-part-label' }),
    lampThree: Object.freeze({ x: 60, y: 330, className: 'u2l3a-part-label' }),
    switchLabel: Object.freeze({ x: 196, y: 161, className: 'u2l3a-part-label' }),
  }),
  parallel2: Object.freeze({
    sourceTitle: Object.freeze({ x: 240, y: 42, className: 'u2l3a-part-label is-title' }),
    terminalPositive: Object.freeze({ x: 312, y: 62, className: 'u2l3a-part-sub' }),
    terminalNegative: Object.freeze({ x: 168, y: 62, className: 'u2l3a-part-sub' }),
    lampOne: Object.freeze({ x: 430, y: 176, className: 'u2l3a-part-label' }),
    lampTwo: Object.freeze({ x: 570, y: 176, className: 'u2l3a-part-label' }),
    switchLabel: Object.freeze({ x: 300, y: 132, className: 'u2l3a-part-label' }),
  }),
});

/** Solid boxes of each scene, for the geometry audit of the labels. */
export function sceneSolidBoxes(layoutId) {
  const layout = BENCH_LAYOUTS[layoutId];
  if (!layout) throw new RangeError(`Unknown bench layout: ${layoutId}`);
  const boxes = {
    source: Object.freeze({ x1: layout.source.from - 14, y1: layout.source.y - 22, x2: layout.source.to + 14, y2: layout.source.y + 22 }),
  };
  for (const element of layout.elements) {
    boxes[element.id] = Object.freeze({ x1: element.x - element.r, y1: element.y - element.r, x2: element.x + element.r, y2: element.y + element.r });
  }
  return Object.freeze(boxes);
}

export const boxesOverlap = (a, b) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
/** Largest gap between two boxes; negative means they overlap. */
export const boxGap = (a, b) => Math.max(a.x1 - b.x2, b.x1 - a.x2, a.y1 - b.y2, b.y1 - a.y2);

/* ------------------------------------------------------------- the circuit */

export const MODEL_LIMITS = Object.freeze([
  'المولّد مثالي: لا مقاومة داخلية، لذا فرق الكمون بين قطبيه ثابت ويساوي قوته المحركة الكهربائية.',
  'الأسلاك والقاطعة المغلقة مثالية: فرق الكمون بين طرفيها صفر.',
  'مقياس الفولت مثالي: لا يسحب تياراً، فلا يغيّر الدارة التي يقيسها.',
  'كل مصباح مُمَثَّل بمقاومة تمثيلية بالأوم؛ توزيع فرق الكمون يتبع نسب هذه المقاومات (تفصيل قانون أوم درس لاحق).',
]);

export const BENCH_DEFAULTS = Object.freeze({
  single: Object.freeze({ emf: 4.5, shares: Object.freeze([3]) }),
  series2: Object.freeze({ emf: 6, shares: Object.freeze([4, 2]) }),
  series3: Object.freeze({ emf: 9, shares: Object.freeze([2, 4, 3]) }),
  parallel2: Object.freeze({ emf: 6, shares: Object.freeze([4, 8]) }),
});

/** The preset that reproduces the printed activity of p102 (12 V and 5 V). */
export const BOOK_SERIES_PRESET = Object.freeze({ layout: 'series2', emf: 12, shares: Object.freeze([7, 5]), page: 102 });
/** The preset that reproduces the printed activity of p103 (6 V on each branch). */
export const BOOK_PARALLEL_PRESET = Object.freeze({ layout: 'parallel2', emf: 6, shares: Object.freeze([4, 8]), page: 103 });

export const EMF_RANGE = Object.freeze({ min: 1, max: 15, step: 0.5 });
export const SHARE_RANGE = Object.freeze({ min: 1, max: 12, step: 1 });

const clamp = (value, range, name) => {
  const number = finite(value, name);
  return Math.min(range.max, Math.max(range.min, number));
};

/** Lamp resistances of a layout: one ohm per share unit. */
function lampResistances(layout, shares) {
  const lampIds = layout.elements.filter((element) => element.kind === 'lamp').map((element) => element.id);
  if (!Array.isArray(shares) || shares.length !== lampIds.length) {
    throw new RangeError(`${layout.id} expects ${lampIds.length} share values.`);
  }
  return Object.freeze(Object.fromEntries(lampIds.map((id, index) => [id, positive(shares[index], `share of ${id}`)])));
}

/**
 * Solve one bench circuit. Potentials are referred to the source's negative
 * terminal; with the switch open the current is zero, every lamp therefore has
 * 0 V across it, and the conductor chain still joined to the positive terminal
 * sits at the source potential while the open switch carries the whole of it.
 */
export function createCircuit({ layout = 'series2', emf = BENCH_DEFAULTS[layout]?.emf ?? 6, shares, closed = true } = {}) {
  const bench = BENCH_LAYOUTS[layout];
  if (!bench) throw new RangeError(`Unknown bench layout: ${layout}`);
  const source = positive(emf, 'emf');
  const isOpen = closed === false;
  const resistances = lampResistances(bench, shares ?? BENCH_DEFAULTS[layout].shares);
  const lampIds = Object.keys(resistances);

  const potentials = Object.fromEntries(bench.nodes.map((point) => [point.id, 0]));
  const elementVoltages = Object.fromEntries(bench.elements.map((element) => [element.id, 0]));
  let current = 0;
  const branchCurrents = Object.freeze({});

  if (bench.topology === 'series') {
    const totalResistance = lampIds.reduce((sum, id) => sum + resistances[id], 0);
    const elementById = Object.fromEntries([...bench.elements, bench.source].map((element) => [element.id, element]));
    if (!isOpen) {
      current = source / totalResistance;
      for (const lampElement of bench.elements.filter((element) => element.kind === 'lamp')) {
        elementVoltages[lampElement.id] = current * resistances[lampElement.id];
      }
    } else {
      current = 0;
      /* the open switch carries the whole source potential difference */
      elementVoltages.sw = source;
    }
    /* walk the loop once from the positive terminal: wires and a closed switch
     * keep the potential, every lamp drops its share, and the source link
     * closes the cycle back onto the starting value. */
    let potential = source;
    potentials[bench.nodes[0].id] = potential;
    for (const link of bench.links) {
      const element = link.element ? elementById[link.element] : null;
      if (isOpen && element?.kind === 'switch') potential = 0;
      else if (!isOpen && element?.kind === 'lamp') potential -= elementVoltages[element.id];
      if (element?.kind === 'source') potential += source;
      potentials[link.to] = potential;
    }
    if (!nearlyEqual(potentials[bench.nodes[0].id], source)) {
      throw new RangeError('series solution did not return to the source potential');
    }
  } else {
    /* parallel: both branches hang between the same two rails */
    if (!isOpen) {
      potentials.pos = source;
      potentials.jtop = source;
      potentials.ain = source;
      potentials.bin = source;
      potentials.aout = 0;
      potentials.bout = 0;
      potentials.jbot = 0;
      potentials.neg = 0;
      elementVoltages.l1 = source;
      elementVoltages.l2 = source;
      const branches = { l1: source / resistances.l1, l2: source / resistances.l2 };
      current = branches.l1 + branches.l2;
      return freezeCircuit(bench, { source, isOpen, resistances, potentials, elementVoltages, current, branchCurrents: Object.freeze(branches) });
    }
    current = 0;
    potentials.pos = source;
    for (const point of bench.nodes) if (point.id !== 'pos') potentials[point.id] = 0;
    elementVoltages.sw = source;
  }

  return freezeCircuit(bench, { source, isOpen, resistances, potentials, elementVoltages, current, branchCurrents });
}

function freezeCircuit(bench, solved) {
  const nodes = Object.freeze(bench.nodes.map((point) => Object.freeze({
    ...point,
    potential: solved.potentials[point.id],
  })));
  const elements = Object.freeze(bench.elements.map((element) => Object.freeze({
    ...element,
    u: solved.elementVoltages[element.id] ?? 0,
    resistance: element.kind === 'lamp' ? solved.resistances[element.id] : null,
  })));
  return Object.freeze({
    layout: bench.id,
    topology: bench.topology,
    corners: bench.corners,
    source: bench.source,
    links: bench.links,
    emf: solved.source,
    closed: !solved.isOpen,
    open: solved.isOpen,
    nodes,
    elements,
    resistances: solved.resistances,
    current: solved.current,
    branchCurrents: solved.branchCurrents ?? null,
  });
}

/** The potential of one node, referred to the circuit's own reference. */
export function nodePotential(circuit, nodeId) {
  const point = circuit.nodes.find((candidate) => candidate.id === nodeId);
  if (!point) throw new RangeError(`Unknown measurement point: ${nodeId}`);
  return point.potential;
}

/**
 * Re-refer the whole circuit to another node. Every potential shifts by the
 * same constant, so no potential difference — and no reading — can change.
 */
export function withReference(circuit, referenceId) {
  const shift = nodePotential(circuit, referenceId);
  const nodes = Object.freeze(circuit.nodes.map((point) => Object.freeze({
    ...point,
    potential: point.potential - shift,
    role: point.id === referenceId ? 'reference' : point.role,
  })));
  return Object.freeze({ ...circuit, referenceId, nodes });
}

/** U(a→b) = V(a) − V(b), the signed potential difference between two points. */
export function potentialDifference(circuit, firstId, secondId) {
  return nodePotential(circuit, firstId) - nodePotential(circuit, secondId);
}

/**
 * What the voltmeter shows when its red probe touches `redId` and its black
 * probe touches `blackId`, connected on the branch (in parallel) between them.
 * A negative value means the probes are reversed; the magnitude is the same
 * potential difference.
 */
export function voltmeterReading(circuit, redId, blackId) {
  if (redId === blackId) throw new RangeError('The two probes must touch two different points.');
  const value = potentialDifference(circuit, redId, blackId);
  return Object.freeze({
    red: redId,
    black: blackId,
    value,
    magnitude: Math.abs(value),
    redIsHigher: value > EPS,
    blackIsHigher: value < -EPS,
    equal: nearlyEqual(value, 0),
    connection: 'parallel',
  });
}

/**
 * The classic wiring mistake: the voltmeter inserted *inside* the path (in
 * series). An ideal voltmeter draws no current, so the loop is broken exactly
 * like an open switch: the lamp goes dark with 0 V across it while the meter
 * itself reads the whole source potential difference.
 */
export function seriesConnectionFault(circuit) {
  return Object.freeze({
    connection: 'series',
    meterReading: circuit.emf,
    lampVoltages: Object.freeze(Object.fromEntries(circuit.elements
      .filter((element) => element.kind === 'lamp')
      .map((element) => [element.id, 0]))),
    current: 0,
    lampLit: false,
  });
}

/* --------------------------------------------------- total versus partial */

/** `U = U₁ + U₂ + …` for a closed series loop, with each partial measured. */
export function seriesRelation(circuit) {
  if (circuit.topology !== 'series') throw new RangeError('The additive relation holds on a series bench.');
  const lamps = circuit.elements.filter((element) => element.kind === 'lamp');
  const partials = Object.freeze(lamps.map((element) => Object.freeze({
    elementId: element.id,
    label: element.label,
    value: element.u,
  })));
  const total = partials.reduce((sum, partial) => sum + partial.value, 0);
  return Object.freeze({
    topology: 'series',
    closed: circuit.closed,
    partials,
    total,
    sourceVoltage: circuit.emf,
    holds: circuit.closed && nearlyEqual(total, circuit.emf),
    reason: circuit.closed
      ? 'الدارة مغلقة: مجموع الفروق الجزئية يساوي فرق الكمون بين قطبي المولّد.'
      : 'الدارة مفتوحة: لا تيار، فالفروق الجزئية صفر والعلاقة لا تُطبَّق؛ يبقى فرق الكمون بين قطبي المولّد قائماً.',
  });
}

/** `U = U₁ = U₂` for branches joined to the same two nodes. */
export function parallelRelation(circuit) {
  if (circuit.topology !== 'parallel') throw new RangeError('The equal-branch relation holds on a parallel bench.');
  const lamps = circuit.elements.filter((element) => element.kind === 'lamp');
  const branches = Object.freeze(lamps.map((element) => Object.freeze({
    elementId: element.id,
    label: element.label,
    value: element.u,
  })));
  const allEqual = branches.every((branch) => nearlyEqual(branch.value, circuit.emf));
  return Object.freeze({
    topology: 'parallel',
    closed: circuit.closed,
    branches,
    total: circuit.emf,
    holds: circuit.closed && allEqual,
    reason: circuit.closed
      ? 'الفروع موصولة بين العقدتين نفسيهما، لذا فرق الكمون على كل فرع يساوي فرق كمون المولّد.'
      : 'الدارة مفتوحة: لا تيار في الفروع وفروق الكمون عليها صفر.',
  });
}

/* ------------------------------------------------------- dipole laboratory */

/**
 * The two trials the classification rests on, mirroring the p100 experiment:
 * the potential difference across the dipole's own terminals while nothing
 * else is connected, and whether the dipole drives a current through a closed
 * loop. A single reading never classifies a dipole.
 */
export function dipoleTrials(kind, { emf = 6, lampResistance = 4 } = {}) {
  const source = positive(emf, 'emf');
  const load = positive(lampResistance, 'lampResistance');
  if (kind === 'source') {
    return Object.freeze({
      kind,
      trials: Object.freeze([
        Object.freeze({ id: 'open-terminals', voltage: source, drivesCurrent: false, note: 'الثنائي وحده والدارة مفتوحة: المقياس بين قطبيه يقرأ قوة المولد.' }),
        Object.freeze({ id: 'closed-loop', voltage: source, drivesCurrent: true, current: source / load, note: 'في دارة مغلقة مع مصباح: يمرّ تيار ويضيء المصباح.' }),
      ]),
      classification: 'active',
    });
  }
  if (kind === 'lamp') {
    return Object.freeze({
      kind,
      trials: Object.freeze([
        Object.freeze({ id: 'open-terminals', voltage: 0, drivesCurrent: false, note: 'الثنائي وحده والدارة مفتوحة: لا فرق كمون بين طرفيه.' }),
        Object.freeze({ id: 'closed-loop', voltage: 0, drivesCurrent: false, current: 0, note: 'في دارة مغلقة بلا مولّد: لا يمرّ تيار ولا يضيء شيء.' }),
      ]),
      classification: 'passive',
    });
  }
  throw new RangeError(`Unknown dipole kind: ${kind}`);
}

/** A receiver inside a *driven* closed loop does show a potential difference. */
export function receiverInsideDrivenLoop(kind, { emf = 6, lampResistance = 4, otherResistance = 2 } = {}) {
  const source = positive(emf, 'emf');
  const load = positive(lampResistance, 'lampResistance');
  const other = positive(otherResistance, 'otherResistance');
  if (kind === 'lamp') {
    const current = source / (load + other);
    return Object.freeze({ kind, voltage: current * load, current, note: 'داخل دارة مغلقة يقودها مولّد يظهر فرق كمون بين طرفي المصباح، مع أنه ثنائي قطب غير فعّال.' });
  }
  return Object.freeze({ kind, voltage: source, current: source / load, note: 'المولّد داخل دارته يحافظ على فرق الكمون بين قطبيه.' });
}

/* --------------------------------------------------- probe-question helper */

/** The unordered pair a probe question accepts, in both probe orders. */
export function probePairsEqual(chosen, expected) {
  if (!Array.isArray(chosen) || chosen.length !== 2) return false;
  const [a, b] = chosen;
  return expected.some((pair) => (pair[0] === a && pair[1] === b) || (pair[0] === b && pair[1] === a));
}
