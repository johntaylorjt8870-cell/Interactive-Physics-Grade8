/*
 * Physics model for the Unit 2 Lesson 1 appendix — «مختبر الشحنات: اكتشف الكهرباء الساكنة».
 *
 * The appendix is an independent platform extension of the published lesson
 * (الكهرباء الساكنة, textbook pages 73–86). It never edits the lesson model:
 * the elementary charge, Coulomb's constant and the Coulomb magnitude/kind
 * relation are delegated to `unit2-lesson1-physics.js` so the appendix cannot
 * drift from the published lesson, exactly like the Lesson 2 appendix delegates
 * to `lesson-2-physics.js`.
 *
 * What this module owns:
 *   - a symbolic charge ledger (station 2): protons stay put, only electrons
 *     move, and the net charge of a body is q = -(excess electrons)·e;
 *   - the three charging methods of the lesson (station 3): friction, contact
 *     and induction, each as an ordered set of state transitions that keeps
 *     charge conserved (including the Earth as a reservoir for induction);
 *   - the paper-bits scene (station 1) and the attraction/repulsion arena
 *     (station 4) as bounded, deterministic educational geometry — positions
 *     are drawing positions, never real-world measurements;
 *   - the Coulomb lab (station 5): slider-legal states, the magnitude
 *     F = K|q1 q2|/d², the sign-driven kind (attraction/repulsion), and the
 *     comparison probes (doubling a charge doubles F, doubling d quarters F).
 *
 * Sign convention used everywhere:
 *   electronDelta > 0  → the body GAINED electrons → net charge is NEGATIVE;
 *   electronDelta < 0  → the body LOST electrons   → net charge is POSITIVE;
 *   electronDelta = 0  → the body is electrically NEUTRAL (not charge-free:
 *                        its protons and electrons still balance exactly).
 */

import { COULOMB_CONSTANT, ELEMENTARY_CHARGE, coulombForce } from './unit2-lesson1-physics.js';

/* Re-exported so the appendix has one import surface for its constants. */
export { COULOMB_CONSTANT, ELEMENTARY_CHARGE };

export const INSULATOR = 'insulator';
export const CONDUCTOR = 'conductor';

/* Counts drawn in the model. They are small symbolic numbers chosen so a
 * student can see every electron that moves; the interface says so explicitly.
 * They are never presented as a measurement of a real body. */
export const SYMBOLIC_PROTONS = 6;
export const SYMBOLIC_ELECTRONS_MOVED = 2;

const finite = (value, label) => {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new RangeError(`${label} must be a finite number.`);
  return number;
};

const positive = (value, label) => {
  const number = finite(value, label);
  if (number <= 0) throw new RangeError(`${label} must be positive.`);
  return number;
};

const countInteger = (value, label) => {
  const number = finite(value, label);
  if (!Number.isInteger(number)) throw new RangeError(`${label} must be an integer.`);
  return number;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * q = -(electron excess) × e.
 *
 * Written out explicitly so a neutral body reports the number `0` and never the
 * signed zero `-0`, which would otherwise reach the interface and print as
 * "-0.0 C" in some renderings.
 */
const chargeOfDelta = (delta) => (delta === 0 ? 0 : -delta * ELEMENTARY_CHARGE);

/* ------------------------------------------------------------------ bodies */

/**
 * The electrical state of one body.
 *
 * `protons` is fixed: in rubbing, contact and induction the protons stay bound
 * inside the nuclei and never travel between bodies. Only electrons move, so
 * the net charge is decided by the electron balance alone.
 */
export function bodyState({ label, material, protons = SYMBOLIC_PROTONS, electronDelta = 0, distribution = 'uniform', polarized = null }) {
  const nucleusProtons = countInteger(protons, 'proton count');
  if (nucleusProtons < 1) throw new RangeError('A body needs at least one proton.');
  const delta = countInteger(electronDelta, 'electron delta');
  const electrons = nucleusProtons + delta;
  if (electrons < 0) throw new RangeError('A body cannot hold a negative number of electrons.');
  if (material !== INSULATOR && material !== CONDUCTOR) throw new RangeError('material must be insulator or conductor.');
  const charge = chargeOfDelta(delta);
  const sign = delta === 0 ? 0 : (delta > 0 ? -1 : 1);
  return Object.freeze({
    label,
    material,
    protons: nucleusProtons,
    electrons,
    electronDelta: delta,
    /** Net charge in coulombs: q = -(electron excess) × e. */
    charge,
    sign,
    condition: sign === 0 ? 'neutral' : (sign > 0 ? 'positive' : 'negative'),
    distribution,
    polarized,
  });
}

/** Net charge of a body from a signed electron count (q = n·e, with sign). */
export function chargeOfElectronCount(electronDelta) {
  const delta = countInteger(electronDelta, 'electron delta');
  return Object.freeze({
    electronDelta: delta,
    charge: chargeOfDelta(delta),
    magnitude: Math.abs(delta) * ELEMENTARY_CHARGE,
    sign: delta === 0 ? 0 : (delta > 0 ? -1 : 1),
  });
}

/**
 * Number of electrons behind a net charge — the q = n·e reading used by the
 * lesson's worked example (n = q / e).
 */
export function electronCountOfCharge(chargeCoulombs) {
  const charge = finite(chargeCoulombs, 'charge');
  if (charge === 0) return Object.freeze({ count: 0, sign: 0, magnitude: 0 });
  const count = Math.abs(charge) / ELEMENTARY_CHARGE;
  return Object.freeze({ count, magnitude: count, sign: charge > 0 ? -1 : 1 });
}

/** A neutral pair of bodies: equal protons and electrons in each one. */
export function neutralPair({ labelA, labelB, materialA, materialB, protons = SYMBOLIC_PROTONS }) {
  return Object.freeze({
    a: bodyState({ label: labelA, material: materialA, protons }),
    b: bodyState({ label: labelB, material: materialB, protons }),
  });
}

/**
 * Move whole electrons from one body of a pair to the other.
 *
 * `from` is the donor ('a' or 'b'). The system's total charge never changes:
 * whatever one body loses the other gains. Protons are untouched.
 */
export function transferElectrons(pair, count, from) {
  if (!pair?.a || !pair?.b) throw new RangeError('A pair of bodies is required.');
  if (from !== 'a' && from !== 'b') throw new RangeError("from must be 'a' or 'b'.");
  const moved = countInteger(count, 'electron count');
  if (moved < 0) throw new RangeError('Electron count cannot be negative.');
  const donor = pair[from];
  const receiver = pair[from === 'a' ? 'b' : 'a'];
  if (moved > donor.electrons) throw new RangeError('A body cannot give away more electrons than it holds.');
  const next = Object.freeze({
    a: bodyState({ ...pair.a, electronDelta: pair.a.electronDelta + (from === 'a' ? -moved : moved) }),
    b: bodyState({ ...pair.b, electronDelta: pair.b.electronDelta + (from === 'b' ? -moved : moved) }),
  });
  return Object.freeze({
    ...next,
    moved,
    from,
    to: from === 'a' ? 'b' : 'a',
    /** Charge before and after the transfer: identical, as it must be. */
    systemChargeBefore: donor.charge + receiver.charge,
    systemChargeAfter: next.a.charge + next.b.charge,
    conserved: Math.abs((donor.charge + receiver.charge) - (next.a.charge + next.b.charge)) < 1e-24,
  });
}

/** Total charge of a pair (and of the Earth when induction grounds a body). */
export function systemCharge(parts) {
  const bodies = Array.isArray(parts) ? parts : [parts?.a, parts?.b].filter(Boolean);
  const total = bodies.reduce((sum, body) => sum + finite(body?.charge ?? 0, 'body charge'), 0);
  return Object.freeze({ total, balanced: Math.abs(total) < 1e-24 });
}

/* ------------------------------------------------- station 1: paper bits */

/* Fixed drawing geometry of the «rod over paper bits» scene. The rod hangs
 * above a table; its rubbed end is the right-hand end in the LTR drawing. */
export const PAPER_SCENE = Object.freeze({
  width: 720,
  height: 320,
  rodTopY: 66,
  rodDropPx: 96,
  rodHalfWidth: 78,
  rodCenterX: 372,
  rodHalfHeight: 13,
  tableY: 274,
  bits: Object.freeze([
    Object.freeze({ id: 'bit-1', x: 300, y: 268 }),
    Object.freeze({ id: 'bit-2', x: 342, y: 270 }),
    Object.freeze({ id: 'bit-3', x: 384, y: 267 }),
    Object.freeze({ id: 'bit-4', x: 424, y: 270 }),
    Object.freeze({ id: 'bit-5', x: 322, y: 258 }),
    Object.freeze({ id: 'bit-6', x: 404, y: 258 }),
  ]),
});

const normalizeProgress = (value, label) => clamp(finite(value, label), 0, 1);

/** Vertical offset of the rod while it is lowered toward the paper bits. */
export function rodDrop(approachProgress) {
  return normalizeProgress(approachProgress, 'approach progress') * PAPER_SCENE.rodDropPx;
}

/**
 * Where every paper bit is drawn.
 *
 * A neutral rod leaves the bits exactly where they are: rubbing is what makes
 * the difference, and the drawing must show that. A rubbed (charged) rod
 * polarizes each bit, so the bits rise toward it — the nearest ones first, the
 * farthest ones a little later — until they hang just under the rubbed end.
 */
export function paperBitPositions({ rubbed = false, approachProgress = 0 } = {}) {
  const approach = normalizeProgress(approachProgress, 'approach progress');
  const rodBottomY = PAPER_SCENE.rodTopY + rodDrop(approach) + PAPER_SCENE.rodHalfHeight;
  return PAPER_SCENE.bits.map((bit, index) => {
    if (!rubbed) {
      return Object.freeze({ id: bit.id, x: bit.x, y: bit.y, rotate: 0, lift: 0, attached: false });
    }
    /* staggered lift: each bit starts a little after the previous one */
    const start = index * 0.07;
    const local = clamp((approach - start) / 0.5, 0, 1);
    const targetX = PAPER_SCENE.rodCenterX - 54 + index * 21;
    const targetY = rodBottomY + 5;
    return Object.freeze({
      id: bit.id,
      x: bit.x + (targetX - bit.x) * local,
      y: bit.y + (targetY - bit.y) * local,
      rotate: (index % 3 - 1) * 16 * local,
      lift: local,
      attached: local >= 1,
    });
  });
}

/**
 * The scene's outcome, as keys the content module turns into Arabic copy.
 * `attracted` is true only when the rod was charged AND lowered: the student's
 * own choices decide which of the three outcomes is shown.
 */
export function paperSceneOutcome({ rubbed = false, approachProgress = 0 } = {}) {
  const approach = normalizeProgress(approachProgress, 'approach progress');
  const attracted = Boolean(rubbed) && approach > 0.25;
  const lifted = paperBitPositions({ rubbed, approachProgress: approach }).some((bit) => bit.lift > 0);
  return Object.freeze({
    rubbed: Boolean(rubbed),
    approach,
    attracted,
    lifted,
    rodCharge: rubbed ? chargeOfElectronCount(SYMBOLIC_ELECTRONS_MOVED) : chargeOfElectronCount(0),
    outcomeKey: !rubbed ? 'neutral-rod' : attracted ? 'charged-rod-attraction' : 'charged-rod-held-above',
  });
}

/* ------------------------------------------ station 3: charging methods */

export const METHOD_FRICTION = 'friction';
export const METHOD_CONTACT = 'contact';
export const METHOD_INDUCTION = 'induction';
export const METHOD_IDS = Object.freeze([METHOD_FRICTION, METHOD_CONTACT, METHOD_INDUCTION]);

/* Ordered steps of each method. The student walks them one at a time. */
export const METHOD_STEPS = Object.freeze({
  [METHOD_FRICTION]: Object.freeze(['before', 'rub', 'test']),
  [METHOD_CONTACT]: Object.freeze(['before', 'touch', 'separate']),
  [METHOD_INDUCTION]: Object.freeze(['before', 'approach', 'ground', 'unground', 'withdraw']),
});

export const MECHANISM_NONE = 'no-transfer';
export const MECHANISM_TRANSFER = 'transfer-between-bodies';
export const MECHANISM_REDISTRIBUTION = 'redistribution-only';
export const MECHANISM_GROUND = 'transfer-with-ground';

const ROD_LABEL = 'rod';
const PARTNER_LABEL = 'partner';

/**
 * The full state of one charging method at one step.
 *
 * Every method starts from the same two bodies — an insulating rod and a
 * second body — and ends somewhere different, which is the point of the
 * station: friction moves electrons between two insulators and leaves equal
 * and opposite charges; contact hands part of the rod's own charge to a
 * conductor, so both end up with the SAME sign; induction only redistributes
 * charge inside the conductor, and a grounded induction ends with the OPPOSITE
 * sign without a single electron crossing from the rod.
 */
/**
 * The full state of one charging method at one step, with its electron ledger.
 *
 * Charge conservation is checked against the SAME method's `before` step, not
 * against zero: contact and induction both start from an already charged rod,
 * so the invariant is «the total electron excess never changes», which is the
 * statement that actually holds in every step of every method.
 */
export function methodState(method, stepId) {
  const state = computeMethodState(method, stepId);
  const initial = stepId === 'before' ? state : computeMethodState(method, 'before');
  const initialTotal = initial.a.electronDelta + initial.b.electronDelta + initial.ground;
  const total = state.a.electronDelta + state.b.electronDelta + state.ground;
  return Object.freeze({
    ...state,
    conservation: Object.freeze({
      rod: state.a.electronDelta,
      partner: state.b.electronDelta,
      ground: state.ground,
      total,
      initialTotal,
      balanced: total === initialTotal,
    }),
  });
}

function computeMethodState(method, stepId) {
  if (!METHOD_IDS.includes(method)) throw new RangeError(`Unknown charging method: ${method}`);
  const steps = METHOD_STEPS[method];
  if (!steps.includes(stepId)) throw new RangeError(`Unknown step "${stepId}" for method ${method}.`);
  const stepIndex = steps.indexOf(stepId);

  const chargedRod = () => bodyState({
    label: ROD_LABEL,
    material: INSULATOR,
    electronDelta: SYMBOLIC_ELECTRONS_MOVED * 2,
    distribution: 'localized-at-rubbed-end',
  });

  if (method === METHOD_FRICTION) {
    if (stepId === 'before') {
      return finalize({
        method,
        stepId,
        stepIndex,
        a: bodyState({ label: ROD_LABEL, material: INSULATOR }),
        b: bodyState({ label: PARTNER_LABEL, material: INSULATOR }),
        ground: 0,
        flow: null,
        mechanism: MECHANISM_NONE,
        changed: [],
        unchanged: ['net-charge', 'electron-count'],
      });
    }
    /* Rubbing: electrons leave the wool and stay on the rubbed end of the
     * plastic rod (the lesson's own conclusion, p76). */
    const moved = transferElectrons(
      {
        a: bodyState({ label: ROD_LABEL, material: INSULATOR }),
        b: bodyState({ label: PARTNER_LABEL, material: INSULATOR }),
      },
      SYMBOLIC_ELECTRONS_MOVED,
      'b',
    );
    return finalize({
      method,
      stepId,
      stepIndex,
      a: bodyState({ ...moved.a, distribution: 'localized-at-rubbed-end' }),
      b: bodyState({ ...moved.b, distribution: 'localized-at-rubbed-end' }),
      ground: 0,
      flow: Object.freeze({ from: 'b', to: 'a', count: moved.moved, carrier: 'electrons' }),
      mechanism: MECHANISM_TRANSFER,
      changed: ['net-charge', 'electron-count'],
      unchanged: ['proton-count', 'total-charge-of-system'],
      oppositeSigns: true,
    });
  }

  if (method === METHOD_CONTACT) {
    if (stepId === 'before') {
      return finalize({
        method,
        stepId,
        stepIndex,
        a: chargedRod(),
        b: bodyState({ label: PARTNER_LABEL, material: CONDUCTOR }),
        ground: 0,
        flow: null,
        mechanism: MECHANISM_NONE,
        changed: [],
        unchanged: ['net-charge-of-partner'],
      });
    }
    /* Touching: some of the rod's extra electrons cross into the conductor and
     * spread over its surface, so the partner takes the SAME sign (p78). */
    const before = { a: chargedRod(), b: bodyState({ label: PARTNER_LABEL, material: CONDUCTOR }) };
    const moved = transferElectrons(before, 1, 'a');
    return finalize({
      method,
      stepId,
      stepIndex,
      a: bodyState({ ...moved.a, distribution: 'localized-at-rubbed-end' }),
      b: bodyState({ ...moved.b, distribution: 'spread-over-surface' }),
      ground: 0,
      flow: Object.freeze({ from: 'a', to: 'b', count: moved.moved, carrier: 'electrons' }),
      mechanism: MECHANISM_TRANSFER,
      changed: ['net-charge-of-partner', 'charge-of-rod-magnitude'],
      unchanged: ['proton-count', 'total-charge-of-system', 'sign-of-rod'],
      sameSign: true,
    });
  }

  /* Induction. */
  const rod = chargedRod();
  if (stepId === 'before') {
    return finalize({
      method,
      stepId,
      stepIndex,
      a: rod,
      b: bodyState({ label: PARTNER_LABEL, material: CONDUCTOR }),
      ground: 0,
      flow: null,
      mechanism: MECHANISM_NONE,
      changed: [],
      unchanged: ['net-charge-of-partner'],
    });
  }
  if (stepId === 'approach') {
    /* No contact: the free electrons inside the conductor only move to the far
     * side, so the near end reads positive and the far end negative while the
     * net charge stays exactly zero (p79). */
    return finalize({
      method,
      stepId,
      stepIndex,
      a: rod,
      b: bodyState({
        label: PARTNER_LABEL,
        material: CONDUCTOR,
        polarized: Object.freeze({ nearEnd: 'positive', farEnd: 'negative', cause: rod.condition }),
      }),
      ground: 0,
      flow: null,
      mechanism: MECHANISM_REDISTRIBUTION,
      changed: ['charge-distribution-of-partner'],
      unchanged: ['net-charge-of-partner', 'electron-count', 'proton-count', 'charge-of-rod'],
      nearRod: true,
    });
  }
  if (stepId === 'ground') {
    /* Finger on the far end: the repelled electrons leave into the Earth. */
    return finalize({
      method,
      stepId,
      stepIndex,
      a: rod,
      b: bodyState({
        label: PARTNER_LABEL,
        material: CONDUCTOR,
        electronDelta: -SYMBOLIC_ELECTRONS_MOVED,
        polarized: Object.freeze({ nearEnd: 'positive', farEnd: 'negative', cause: rod.condition }),
      }),
      ground: SYMBOLIC_ELECTRONS_MOVED,
      flow: Object.freeze({ from: 'b', to: 'ground', count: SYMBOLIC_ELECTRONS_MOVED, carrier: 'electrons' }),
      mechanism: MECHANISM_GROUND,
      changed: ['net-charge-of-partner', 'electron-count-of-partner'],
      unchanged: ['proton-count', 'charge-of-rod', 'electrons-transferred-from-rod'],
      nearRod: true,
      grounded: true,
    });
  }
  if (stepId === 'unground') {
    return finalize({
      method,
      stepId,
      stepIndex,
      a: rod,
      b: bodyState({
        label: PARTNER_LABEL,
        material: CONDUCTOR,
        electronDelta: -SYMBOLIC_ELECTRONS_MOVED,
        polarized: Object.freeze({ nearEnd: 'positive', farEnd: 'negative', cause: rod.condition }),
      }),
      ground: SYMBOLIC_ELECTRONS_MOVED,
      flow: null,
      mechanism: MECHANISM_GROUND,
      changed: ['net-charge-of-partner'],
      unchanged: ['proton-count', 'charge-of-rod', 'electrons-transferred-from-rod'],
      nearRod: true,
      grounded: false,
    });
  }
  /* withdraw: the rod leaves, the remaining deficit spreads over the surface. */
  return finalize({
    method,
    stepId,
    stepIndex,
    a: rod,
    b: bodyState({
      label: PARTNER_LABEL,
      material: CONDUCTOR,
      electronDelta: -SYMBOLIC_ELECTRONS_MOVED,
      distribution: 'spread-over-surface',
    }),
    ground: SYMBOLIC_ELECTRONS_MOVED,
    flow: null,
    mechanism: MECHANISM_GROUND,
    changed: ['net-charge-of-partner', 'charge-distribution-of-partner'],
    unchanged: ['proton-count', 'charge-of-rod', 'electrons-transferred-from-rod'],
    nearRod: false,
    grounded: false,
    oppositeSigns: true,
  });
}

function finalize(state) {
  return Object.freeze({
    ...state,
    ground: state.ground ?? 0,
    summaryKey: `${state.method}:${state.stepId}`,
  });
}

/** The last step of a method — its finished, comparable outcome. */
export function methodFinalState(method) {
  const steps = METHOD_STEPS[method];
  return methodState(method, steps[steps.length - 1]);
}

/**
 * The comparison matrix of the three methods, computed from the model itself
 * (never typed by hand), so the table can never contradict the workshop.
 */
export function methodComparison() {
  const finals = Object.fromEntries(METHOD_IDS.map((method) => [method, methodFinalState(method)]));
  const yesNo = (value) => (value ? 'yes' : 'no');
  const rows = [
    Object.freeze({
      id: 'electrons-between-bodies',
      values: Object.freeze({
        [METHOD_FRICTION]: yesNo(finals[METHOD_FRICTION].flow?.to === 'a'),
        [METHOD_CONTACT]: yesNo(finals[METHOD_CONTACT].flow?.to === 'b'),
        [METHOD_INDUCTION]: yesNo(finals[METHOD_INDUCTION].flow?.to === 'b'),
      }),
    }),
    Object.freeze({
      id: 'net-charge-of-partner-changed',
      values: Object.freeze(Object.fromEntries(METHOD_IDS.map((method) => [method, yesNo(finals[method].b.electronDelta !== 0)]))),
    }),
    Object.freeze({
      id: 'partner-sign-vs-rod',
      values: Object.freeze(Object.fromEntries(METHOD_IDS.map((method) => {
        const { a, b } = finals[method];
        const relation = b.sign === 0 ? 'neutral' : (b.sign === a.sign ? 'same' : 'opposite');
        return [method, relation];
      }))),
    }),
    Object.freeze({
      id: 'rod-keeps-its-charge',
      values: Object.freeze(Object.fromEntries(METHOD_IDS.map((method) => {
        const first = methodState(method, 'before');
        return [method, yesNo(finals[method].a.electronDelta === first.a.electronDelta)];
      }))),
    }),
    Object.freeze({
      id: 'final-distribution',
      values: Object.freeze(Object.fromEntries(METHOD_IDS.map((method) => [method, finals[method].b.distribution]))),
    }),
    Object.freeze({
      id: 'mechanism',
      values: Object.freeze(Object.fromEntries(METHOD_IDS.map((method) => [method, finals[method].mechanism]))),
    }),
    Object.freeze({
      id: 'system-charge-conserved',
      values: Object.freeze(Object.fromEntries(METHOD_IDS.map((method) => [method, yesNo(finals[method].conservation.balanced)]))),
    }),
  ];
  return Object.freeze({ finals, rows });
}

/* ------------------------------------------- station 4: force arena */

export const ARENA_VIEW = Object.freeze({
  width: 720,
  height: 300,
  /* The two spheres sit on one horizontal line (the lesson's «الحامل»). */
  axisY: 214,
  aX: 252,
  bX: 468,
  radius: 34,
  radiusUnequalA: 27,
  radiusUnequalB: 44,
  /* Bodies never touch and never leave the drawing. */
  minGapPx: 14,
  edgeMarginPx: 20,
  /* Each force arrow lives on its own lane above the spheres, connected to its
   * body by a dashed leader, so an arrow can never be swallowed by a sphere or
   * collide with the other arrow. Both arrows always keep the same length: the
   * two forces are equal in magnitude and opposite in direction. */
  arrowLaneA: 84,
  arrowLaneB: 140,
  arrowLengthPx: 78,
});

export const ATTRACTION = 'attraction';
export const REPULSION = 'repulsion';

/** The kind of interaction two signs produce. */
export function interactionKind(signA, signB) {
  const a = Math.sign(finite(signA, 'sign A'));
  const b = Math.sign(finite(signB, 'sign B'));
  if (a === 0 || b === 0) return 'none';
  return a === b ? REPULSION : ATTRACTION;
}

/**
 * The arena state: two charged spheres on one line, the force arrow drawn ON
 * each sphere, and (optionally) where they have moved to.
 *
 * Both arrows always have the same length: the two forces are an action and a
 * reaction, equal in magnitude and opposite in direction, even when the two
 * charges have different magnitudes. Only the spheres' radii change with the
 * «different magnitudes» switch, never the arrow lengths.
 */
export function arenaState({ signA = 1, signB = -1, unequal = false, progress = 0 } = {}) {
  const kind = interactionKind(signA, signB);
  const p = normalizeProgress(progress, 'motion progress');
  const radiusA = unequal ? ARENA_VIEW.radiusUnequalA : ARENA_VIEW.radius;
  const radiusB = unequal ? ARENA_VIEW.radiusUnequalB : ARENA_VIEW.radius;

  let ax = ARENA_VIEW.aX;
  let bx = ARENA_VIEW.bX;
  if (kind === ATTRACTION) {
    const travel = Math.max(0, (ARENA_VIEW.bX - ARENA_VIEW.aX - radiusA - radiusB - ARENA_VIEW.minGapPx) / 2);
    ax = ARENA_VIEW.aX + travel * p;
    bx = ARENA_VIEW.bX - travel * p;
  } else if (kind === REPULSION) {
    /* Leave room for each arrow, which starts at its own sphere's centre. */
    const travel = Math.max(0, Math.min(
      ARENA_VIEW.aX - ARENA_VIEW.arrowLengthPx - ARENA_VIEW.edgeMarginPx,
      ARENA_VIEW.width - ARENA_VIEW.bX - ARENA_VIEW.arrowLengthPx - ARENA_VIEW.edgeMarginPx,
      ARENA_VIEW.aX - radiusA - ARENA_VIEW.edgeMarginPx,
      ARENA_VIEW.width - ARENA_VIEW.bX - radiusB - ARENA_VIEW.edgeMarginPx,
    ));
    ax = ARENA_VIEW.aX - travel * p;
    bx = ARENA_VIEW.bX + travel * p;
  }

  const y = ARENA_VIEW.axisY;
  const len = ARENA_VIEW.arrowLengthPx;
  /* Direction of the force ON body A: repulsion pushes A away from B (to the
   * left in the LTR drawing), attraction pulls A toward B (to the right).
   * Body B is mirrored, so the two arrows are always opposite. */
  const aDirection = kind === ATTRACTION ? 1 : kind === REPULSION ? -1 : 0;
  const arrows = Object.freeze([
    Object.freeze({
      id: 'force-on-a',
      body: 'a',
      x1: ax,
      y1: ARENA_VIEW.arrowLaneA,
      x2: ax + aDirection * len,
      y2: ARENA_VIEW.arrowLaneA,
      leaderX: ax,
      leaderY1: ARENA_VIEW.arrowLaneA + 8,
      leaderY2: y - radiusA - 4,
      pointsTowardOther: aDirection === 1,
    }),
    Object.freeze({
      id: 'force-on-b',
      body: 'b',
      x1: bx,
      y1: ARENA_VIEW.arrowLaneB,
      x2: bx - aDirection * len,
      y2: ARENA_VIEW.arrowLaneB,
      leaderX: bx,
      leaderY1: ARENA_VIEW.arrowLaneB + 8,
      leaderY2: y - radiusB - 4,
      pointsTowardOther: aDirection === -1,
    }),
  ]);

  return Object.freeze({
    kind,
    signA: Math.sign(signA),
    signB: Math.sign(signB),
    unequal,
    progress: p,
    radii: Object.freeze({ a: radiusA, b: radiusB }),
    positions: Object.freeze({ ax, bx, y }),
    arrows,
    insideView: arrows.every((arrow) => Math.min(arrow.x1, arrow.x2) >= ARENA_VIEW.edgeMarginPx - 20
        && Math.max(arrow.x1, arrow.x2) <= ARENA_VIEW.width - ARENA_VIEW.edgeMarginPx + 20)
      && ax - radiusA >= 0 && bx + radiusB <= ARENA_VIEW.width && bx - ax >= radiusA + radiusB,
    arrowLengthsEqual: Math.abs(Math.hypot(arrows[0].x2 - arrows[0].x1, arrows[0].y2 - arrows[0].y1)
      - Math.hypot(arrows[1].x2 - arrows[1].x1, arrows[1].y2 - arrows[1].y1)) < 1e-9,
    movedCloser: kind === ATTRACTION && bx - ax < ARENA_VIEW.bX - ARENA_VIEW.aX,
    movedApart: kind === REPULSION && bx - ax > ARENA_VIEW.bX - ARENA_VIEW.aX,
    gapPx: bx - ax - radiusA - radiusB,
  });
}

/* --------------------------------------------- station 5: Coulomb lab */

export const COULOMB_FIELDS = Object.freeze({
  q1: Object.freeze({ label: 'مقدار الشحنة الأولى', unit: 'μC', min: 1, max: 80, step: 1 }),
  q2: Object.freeze({ label: 'مقدار الشحنة الثانية', unit: 'μC', min: 1, max: 80, step: 1 }),
  d: Object.freeze({ label: 'المسافة بين الشحنتين', unit: 'cm', min: 20, max: 200, step: 10 }),
});

export const DEFAULT_COULOMB_STATE = Object.freeze({ q1Sign: 1, q2Sign: 1, q1: 5, q2: 5, d: 50 });

/* The lesson's own worked example (p81): 50 μC and 80 μC one metre apart in
 * vacuum give F = 36 N. The lab can load it and must reproduce it exactly. */
export const BOOK_COULOMB_STATE = Object.freeze({ q1Sign: 1, q2Sign: 1, q1: 50, q2: 80, d: 100 });

/** Forces above this are flagged: the point-charge model in vacuum is being
 * pushed past anything a real static-electricity setup would hold in air. */
export const MODEL_FORCE_LIMIT_N = 500;

const normalizeSign = (value, label) => {
  const sign = Math.sign(finite(value, label));
  if (sign === 0) throw new RangeError(`${label} must be +1 or -1.`);
  return sign;
};

const snapToStep = (value, spec) => {
  const steps = Math.round((value - spec.min) / spec.step);
  return Number((spec.min + steps * spec.step).toFixed(6));
};

export function snapCoulombField(field, value) {
  const spec = COULOMB_FIELDS[field];
  if (!spec) throw new RangeError(`Unknown Coulomb lab field: ${field}`);
  return clamp(snapToStep(positive(value, spec.label), spec), spec.min, spec.max);
}

/** A slider-legal lab state; anything off-grid snaps to the nearest legal value. */
export function createCoulombState(patch = {}) {
  return Object.freeze({
    q1Sign: normalizeSign(patch.q1Sign ?? DEFAULT_COULOMB_STATE.q1Sign, 'q1 sign'),
    q2Sign: normalizeSign(patch.q2Sign ?? DEFAULT_COULOMB_STATE.q2Sign, 'q2 sign'),
    q1: snapCoulombField('q1', patch.q1 ?? DEFAULT_COULOMB_STATE.q1),
    q2: snapCoulombField('q2', patch.q2 ?? DEFAULT_COULOMB_STATE.q2),
    d: snapCoulombField('d', patch.d ?? DEFAULT_COULOMB_STATE.d),
  });
}

export function resetCoulombState() {
  return createCoulombState(DEFAULT_COULOMB_STATE);
}

/** Update one control. Signs accept +1/-1; magnitudes snap to their own grid. */
export function updateCoulombInput(state, field, value) {
  const current = createCoulombState(state);
  if (field === 'q1Sign' || field === 'q2Sign') {
    return createCoulombState({ ...current, [field]: normalizeSign(value, field) });
  }
  if (!COULOMB_FIELDS[field]) throw new RangeError(`Unknown Coulomb lab field: ${field}`);
  return createCoulombState({ ...current, [field]: snapCoulombField(field, value) });
}

/** Multiply inputs without clamping — used only by the comparison probes. */
export function scaleCoulombInputs(state, { q1Factor = 1, q2Factor = 1, dFactor = 1 } = {}) {
  const current = createCoulombState(state);
  const scaled = {
    q1Sign: current.q1Sign,
    q2Sign: current.q2Sign,
    q1: positive(current.q1 * positive(q1Factor, 'q1 factor'), 'scaled q1'),
    q2: positive(current.q2 * positive(q2Factor, 'q2 factor'), 'scaled q2'),
    d: positive(current.d * positive(dFactor, 'd factor'), 'scaled d'),
  };
  const outsideGrid = ['q1', 'q2', 'd'].some((field) => {
    const spec = COULOMB_FIELDS[field];
    return scaled[field] < spec.min || scaled[field] > spec.max
      || Math.abs(scaled[field] - snapToStep(scaled[field], spec)) > 1e-9;
  });
  return Object.freeze({ ...scaled, outsideGrid });
}

const inGrid = (field, value) => {
  const spec = COULOMB_FIELDS[field];
  return value >= spec.min && value <= spec.max && Math.abs(value - snapToStep(value, spec)) < 1e-9;
};

/**
 * The complete reading of the Coulomb lab.
 *
 * The MAGNITUDE comes from F = K|q1 q2|/d² and is always positive; the KIND
 * (attraction/repulsion) comes from the two signs and is reported separately —
 * the appendix never mixes a magnitude with a direction.
 */
export function coulombReading(state) {
  const current = createCoulombState(state);
  const q1C = current.q1Sign * current.q1 * 1e-6;
  const q2C = current.q2Sign * current.q2 * 1e-6;
  const dM = current.d / 100;
  const { magnitude, kind } = coulombForce(q1C, q2C, dM);
  return Object.freeze({
    state: current,
    q1C,
    q2C,
    dM,
    productC2: q1C * q2C,
    magnitude,
    kind,
    signProduct: Math.sign(q1C * q2C),
    /** True when a slider value sits outside the published grid (probe states). */
    exactGrid: inGrid('q1', current.q1) && inGrid('q2', current.q2) && inGrid('d', current.d),
    beyondModelRange: magnitude > MODEL_FORCE_LIMIT_N,
    formatted: formatForce(magnitude),
    inverseSquareCheck: Object.freeze({
      doubleDistanceRatio: coulombForce(q1C, q2C, dM).magnitude / coulombForce(q1C, q2C, 2 * dM).magnitude,
      doubleChargeRatio: coulombForce(2 * q1C, q2C, dM).magnitude / coulombForce(q1C, q2C, dM).magnitude,
    }),
  });
}

/** A reading of an unclamped (probe) state. */
export function scaledCoulombReading(scaled) {
  const q1C = scaled.q1Sign * scaled.q1 * 1e-6;
  const q2C = scaled.q2Sign * scaled.q2 * 1e-6;
  const dM = scaled.d / 100;
  const { magnitude, kind } = coulombForce(q1C, q2C, dM);
  return Object.freeze({ state: scaled, q1C, q2C, dM, magnitude, kind, formatted: formatForce(magnitude), outsideGrid: Boolean(scaled.outsideGrid) });
}

export const COULOMB_PROBES = Object.freeze([
  Object.freeze({ id: 'double-q1', change: Object.freeze({ q1Factor: 2 }) }),
  Object.freeze({ id: 'double-q2', change: Object.freeze({ q2Factor: 2 }) }),
  Object.freeze({ id: 'double-both-charges', change: Object.freeze({ q1Factor: 2, q2Factor: 2 }) }),
  Object.freeze({ id: 'double-distance', change: Object.freeze({ dFactor: 2 }) }),
  Object.freeze({ id: 'halve-distance', change: Object.freeze({ dFactor: 0.5 }) }),
]);

export function findCoulombProbe(probeId) {
  const probe = COULOMB_PROBES.find((candidate) => candidate.id === probeId);
  if (!probe) throw new RangeError(`Unknown Coulomb probe: ${probeId}`);
  return probe;
}

export const RATIO_QUADRUPLE = 'quadruple';
export const RATIO_DOUBLE = 'double';
export const RATIO_UNCHANGED = 'unchanged';
export const RATIO_HALF = 'half';
export const RATIO_QUARTER = 'quarter';
export const RATIO_OTHER = 'other';

/** Classify a force ratio so the interface can answer in words, not numbers. */
export function classifyRatio(ratio) {
  const value = positive(ratio, 'ratio');
  const near = (target) => Math.abs(value - target) <= 1e-6 * Math.max(1, target);
  if (near(4)) return RATIO_QUADRUPLE;
  if (near(2)) return RATIO_DOUBLE;
  if (near(1)) return RATIO_UNCHANGED;
  if (near(0.5)) return RATIO_HALF;
  if (near(0.25)) return RATIO_QUARTER;
  return RATIO_OTHER;
}

/**
 * Run one probe on the CURRENT state: nothing is hard-coded, so the answer the
 * student gets is always computed from the values they set themselves.
 */
export function evaluateCoulombProbe(state, probeId) {
  const probe = findCoulombProbe(probeId);
  const current = createCoulombState(state);
  const base = coulombReading(current);
  const scaled = scaleCoulombInputs(current, probe.change);
  const next = scaledCoulombReading(scaled);
  const ratio = next.magnitude / base.magnitude;
  return Object.freeze({
    probeId: probe.id,
    base,
    next,
    ratio,
    ratioClass: classifyRatio(ratio),
    outsideGrid: scaled.outsideGrid,
  });
}

/**
 * Grade a student's prediction for a probe. The expected answer is derived from
 * the computed ratio, never stored as a fixed key, so it stays correct for any
 * starting state.
 */
export function checkProbePrediction(state, probeId, choiceId) {
  const result = evaluateCoulombProbe(state, probeId);
  const expected = result.ratioClass === RATIO_OTHER ? RATIO_OTHER : result.ratioClass;
  const isCorrect = choiceId === expected;
  return Object.freeze({ ...result, choiceId, expected, isCorrect });
}

/* ------------------------------------------------------ number rendering */

/** Consistent, unit-safe rendering of a force magnitude in newtons. */
export function formatForce(newtons) {
  const value = finite(newtons, 'force');
  if (value === 0) return '0 N';
  if (value >= 1e5 || value < 1e-2) {
    return `${value.toExponential(2).replace('e+', '×10^').replace('e-', '×10^-')} N`;
  }
  const rounded = Number(value.toFixed(value < 10 ? 3 : 1));
  return `${rounded} N`;
}

/** A charge in coulombs rendered with a power of ten (μC inputs stay μC). */
export function formatChargeCoulombs(coulombs) {
  const value = finite(coulombs, 'charge');
  if (value === 0) return '0 C';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / 10 ** exponent;
  const mantissaText = Number(mantissa.toFixed(2)).toString();
  return `${mantissaText}×10^${exponent} C`;
}

/* --- TeX twins of the formatters -------------------------------------------
 * The interface renders every number through KaTeX, so each formatter has a
 * TeX counterpart that produces the same value with a real typeset power of ten
 * and an upright unit. Plain-text versions stay for aria-labels and live regions.
 */

const texPowerOfTen = (value, unitSymbol, digits = 2) => {
  const number = finite(value, 'value');
  if (number === 0) return `0~\\mathrm{${unitSymbol}}`;
  const exponent = Math.floor(Math.log10(Math.abs(number)));
  const mantissa = number / 10 ** exponent;
  const mantissaText = Number(mantissa.toFixed(digits)).toString();
  if (exponent === 0) return `${mantissaText}~\\mathrm{${unitSymbol}}`;
  return `${mantissaText}\\times 10^{${exponent}}~\\mathrm{${unitSymbol}}`;
};

/** Force magnitude as TeX, e.g. `0.9~\mathrm{N}` or `1.44\times 10^{3}~\mathrm{N}`. */
export function forceTeX(newtons) {
  const value = finite(newtons, 'force');
  if (value !== 0 && value < 1e5 && value >= 1e-2) {
    const rounded = Number(value.toFixed(value < 10 ? 3 : 1));
    return `${rounded}~\\mathrm{N}`;
  }
  return texPowerOfTen(value, 'N');
}

/** A charge in coulombs as TeX. */
export function chargeTeX(coulombs) {
  return texPowerOfTen(finite(coulombs, 'charge'), 'C');
}

/** A pure count (electrons) as TeX — no unit. */
export function countTeX(count) {
  const value = finite(count, 'count');
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = Number((value / 10 ** exponent).toFixed(2));
  return exponent === 0 ? String(mantissa) : `${mantissa}\\times 10^{${exponent}}`;
}

/** A distance in metres as TeX. */
export function distanceTeX(metres) {
  const value = finite(metres, 'distance');
  return value >= 1 ? `${Number(value.toFixed(3))}~\\mathrm{m}` : texPowerOfTen(value, 'm');
}

/** Count of electrons rendered as a power of ten. */
export function formatElectronCount(count) {
  const value = finite(count, 'electron count');
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = Number((value / 10 ** exponent).toFixed(2));
  return exponent === 0 ? String(mantissa) : `${mantissa}×10^${exponent}`;
}
