/*
 * Physics primitives for the Lesson 2 appendix: two parallel forces acting on a
 * light horizontal rod (the textbook's beam AB, pages 63–70).
 *
 * Conventions kept identical to Lesson 2:
 *   - positions are measured in centimetres along the rod from point A (left);
 *   - point B sits at the rod's far end, so the carriers are distinct vertical
 *     lines (a minimum separation is enforced instead of allowing them to merge);
 *   - force 1 keeps the positive (upward) sense in both modes, force 2 is
 *     upward in the same-sense mode and downward in the opposite-sense mode —
 *     exactly the `F1 up, F2 down` convention of the lesson;
 *   - the resultant's carrier is the line that preserves the lesson's moment
 *     relation F1 d1 = F2 d2, which is why its position is a weighted
 *     average of the two carrier positions.
 *
 * The two textbook cases themselves are delegated to `lesson-2-physics.js` so
 * this appendix can never drift from the published lesson model: the appendix
 * only translates the two carrier positions into the lesson's "distance between
 * the carriers" argument and adds the reporting the lab needs.
 */

import {
  momentProducts,
  oppositeSenseParallelResultant,
  sameSenseParallelResultant,
} from './lesson-2-physics.js';

export const SAME_SENSE = 'same';
export const OPPOSITE_SENSE = 'opposite';
export const SENSE_MODES = Object.freeze([SAME_SENSE, OPPOSITE_SENSE]);

/* Slider bounds of the interactive lab. They are wide enough for every
 * textbook-style case the appendix teaches and narrow enough that no state is
 * physically meaningless. */
export const LAB_FORCE_MIN_N = 5;
export const LAB_FORCE_MAX_N = 80;
export const LAB_FORCE_STEP_N = 5;
export const ROD_LENGTH_CM = 60;
export const LAB_POSITION_MIN_CM = 0;
export const LAB_POSITION_MAX_CM = ROD_LENGTH_CM;
export const LAB_POSITION_STEP_CM = 5;
/* Distinct carriers: two parallel forces never share one line in this lab. */
export const MIN_SEPARATION_CM = 10;

export const RESULTANT_EPSILON_N = 1e-9;
export const MOMENT_TOLERANCE = 1e-6;

/* Result kinds reported to the interface. `single` is the ordinary finite
 * resultant, `couple` is the equal-and-opposite limit case, and `zero` only
 * appears for a mathematically degenerate state (two zero same-sense forces)
 * that the sliders cannot reach. */
export const RESULT_SINGLE = 'single';
export const RESULT_COUPLE = 'couple';
export const RESULT_ZERO = 'zero';

export const LAB_FIELDS = Object.freeze({
  force1: Object.freeze({ label: 'شدة القوة الأولى', unit: 'N', min: LAB_FORCE_MIN_N, max: LAB_FORCE_MAX_N, step: LAB_FORCE_STEP_N }),
  force2: Object.freeze({ label: 'شدة القوة الثانية', unit: 'N', min: LAB_FORCE_MIN_N, max: LAB_FORCE_MAX_N, step: LAB_FORCE_STEP_N }),
  position1: Object.freeze({ label: 'موضع القوة الأولى على الساق', unit: 'cm', min: LAB_POSITION_MIN_CM, max: LAB_POSITION_MAX_CM, step: LAB_POSITION_STEP_CM }),
  position2: Object.freeze({ label: 'موضع القوة الثانية على الساق', unit: 'cm', min: LAB_POSITION_MIN_CM, max: LAB_POSITION_MAX_CM, step: LAB_POSITION_STEP_CM }),
});

export const DEFAULT_LAB_STATE = Object.freeze({
  mode: SAME_SENSE,
  force1: 20,
  force2: 30,
  position1: 0,
  position2: 50,
});

const finite = (value, label) => {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new RangeError(`${label} must be a finite number.`);
  return number;
};

const nonNegative = (value, label) => {
  const number = finite(value, label);
  if (number < 0) throw new RangeError(`${label} cannot be negative.`);
  return number;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const snapToStep = (value, step, min) => {
  const steps = Math.round((value - min) / step);
  return Number((min + steps * step).toFixed(6));
};

const normalizeMode = (mode) => {
  if (mode === SAME_SENSE || mode === OPPOSITE_SENSE) return mode;
  throw new RangeError(`Unknown sense mode: ${mode}`);
};

/** Snap one slider value to its own grid (used by both UI and presets). */
export function snapField(field, value) {
  const spec = LAB_FIELDS[field];
  if (!spec) throw new RangeError(`Unknown lab field: ${field}`);
  const requested = finite(value, spec.label);
  return clamp(snapToStep(requested, spec.step, spec.min), spec.min, spec.max);
}

/**
 * Keep the two carriers apart. Moving one carrier pushes it back instead of
 * moving the other, so dragging a slider never produces a surprising jump in an
 * untouched control. `index` is 1 for the first force and 2 for the second.
 */
export function clampPosition(index, value, otherPosition) {
  const other = Number(otherPosition);
  if (index === 1) {
    return clamp(value, LAB_POSITION_MIN_CM, Math.min(LAB_POSITION_MAX_CM, other - MIN_SEPARATION_CM));
  }
  if (index === 2) {
    return clamp(value, Math.max(LAB_POSITION_MIN_CM, other + MIN_SEPARATION_CM), LAB_POSITION_MAX_CM);
  }
  throw new RangeError('Position index must be 1 or 2.');
}

/** A validated, slider-legal lab state. Out-of-grid values snap to the nearest legal one. */
export function createLabState(patch = {}) {
  const mode = normalizeMode(patch.mode ?? DEFAULT_LAB_STATE.mode);
  const force1 = snapField('force1', patch.force1 ?? DEFAULT_LAB_STATE.force1);
  const force2 = snapField('force2', patch.force2 ?? DEFAULT_LAB_STATE.force2);
  /* Resolve the order once, deterministically: the first carrier is placed
   * inside the rod with room for the minimum separation, then the second one is
   * placed at or after it. */
  const rawPosition1 = snapField('position1', patch.position1 ?? DEFAULT_LAB_STATE.position1);
  const position1 = clamp(rawPosition1, LAB_POSITION_MIN_CM, LAB_POSITION_MAX_CM - MIN_SEPARATION_CM);
  const rawPosition2 = snapField('position2', patch.position2 ?? DEFAULT_LAB_STATE.position2);
  const position2 = clamp(rawPosition2, position1 + MIN_SEPARATION_CM, LAB_POSITION_MAX_CM);
  return { mode, force1, force2, position1, position2 };
}

/** Update one slider of the lab, returning a fresh legal state. */
export function updateLabInput(state, field, value) {
  const current = createLabState(state);
  if (!LAB_FIELDS[field] && field !== 'mode') throw new RangeError(`Unknown lab field: ${field}`);
  if (field === 'mode') return createLabState({ ...current, mode: value });
  const snapped = snapField(field, value);
  if (field === 'position1') {
    return createLabState({ ...current, position1: clampPosition(1, snapped, current.position2) });
  }
  if (field === 'position2') {
    return createLabState({ ...current, position2: clampPosition(2, snapped, current.position1) });
  }
  return createLabState({ ...current, [field]: snapped });
}

/**
 * The full description of the two parallel forces and their resultant.
 *
 * `resultantPosition` is the position of the resultant's carrier measured from
 * point A along the rod; it may fall outside the rod (the opposite-sense case)
 * and it is `null` for the equal-and-opposite limit, where the two forces have
 * no single finite resultant carrier but do produce a rotational effect.
 */
export function parallelResultant(state) {
  const lab = createLabState(state);
  const separation = lab.position2 - lab.position1;
  if (separation <= 0) throw new RangeError('The two carriers must stay apart.');

  const sameSense = lab.mode === SAME_SENSE;
  const lessonResult = sameSense
    ? sameSenseParallelResultant(lab.force1, lab.force2, separation)
    : oppositeSenseParallelResultant(lab.force1, lab.force2, separation);

  const magnitude = lessonResult.magnitude;
  const netUpward = sameSense ? magnitude : lessonResult.signedMagnitude;
  const sense = Math.abs(netUpward) <= RESULTANT_EPSILON_N ? 0 : Math.sign(netUpward);

  const couple = !sameSense && !lessonResult.hasFiniteResultant;
  const zeroMagnitude = magnitude <= RESULTANT_EPSILON_N && !couple;
  const kind = couple ? RESULT_COUPLE : zeroMagnitude ? RESULT_ZERO : RESULT_SINGLE;

  let resultantPosition = null;
  if (kind === RESULT_SINGLE) {
    resultantPosition = Number((lab.position1 + lessonResult.position).toFixed(9));
  } else if (kind === RESULT_ZERO) {
    resultantPosition = Number(((lab.position1 + lab.position2) / 2).toFixed(9));
  }

  const distanceFromForce1 = resultantPosition === null ? null : Math.abs(resultantPosition - lab.position1);
  const distanceFromForce2 = resultantPosition === null ? null : Math.abs(lab.position2 - resultantPosition);

  const moments = distanceFromForce1 === null
    ? { first: null, second: null, balanced: false }
    : (() => {
      const products = momentProducts(lab.force1, distanceFromForce1, lab.force2, distanceFromForce2);
      return {
        first: Number(products.first.toFixed(9)),
        second: Number(products.second.toFixed(9)),
        balanced: Math.abs(products.first - products.second) <= MOMENT_TOLERANCE,
      };
    })();

  return {
    ...lab,
    separation,
    magnitude,
    sense,
    kind,
    resultantPosition,
    distanceFromForce1,
    distanceFromForce2,
    moments,
    /* Equal-and-opposite forces on distinct carriers: zero net force, but the
     * two effects do not share one line, so the pair has a rotational effect
     * F d and no single finite resultant carrier. */
    couple: couple ? { netForce: 0, moment: Number((lab.force1 * separation).toFixed(9)), separation } : null,
    largestForce: lab.force1 === lab.force2 ? null : (lab.force1 > lab.force2 ? 1 : 2),
    netUpward,
  };
}

/** Convenience: how far the resultant's carrier sits from the larger force's carrier. */
export function resultantDistanceFromLargerForce(result) {
  if (!result || result.largestForce === null || result.resultantPosition === null) return null;
  const carrier = result.largestForce === 1 ? result.position1 : result.position2;
  return Math.abs(result.resultantPosition - carrier);
}

/* ----------------------------------------------------------- challenges -- */

/*
 * A challenge is data: a start state, optional locks, and a target that is
 * evaluated only when the student asks for verification. Every numeric target
 * is proven reachable on the slider grid by the test suite.
 */

/* Challenge messages are Arabic prose: every number and unit inside them is
 * isolated LTR so an RTL sentence can never reorder or shift it. */
const ltrQty = (value, unit) => `<bdi dir="ltr">${value} ${unit}</bdi>`;
const POINT_A = '<bdi dir="ltr">A</bdi>';

export function evaluateChallenge(challenge, state, sessionStart = null) {
  if (!challenge || typeof challenge !== 'object') throw new TypeError('A challenge definition is required.');
  const result = parallelResultant(state);
  const target = challenge.target;
  if (!target || typeof target !== 'object') throw new TypeError('A challenge target is required.');

  if (target.type === 'nearest-carrier') {
    if (result.mode !== (challenge.mode ?? SAME_SENSE)) {
      return { complete: false, missing: 'mode', message: 'هذا التحدي يخص حالتين متوازيتين بالجهة نفسها.' };
    }
    if (result.largestForce === null) {
      return { complete: false, missing: 'difference', message: 'اجعل إحدى القوتين أكبر من الأخرى أولاً.' };
    }
    const difference = Math.abs(result.force1 - result.force2);
    const distance = resultantDistanceFromLargerForce(result);
    if (difference < target.minDifferenceN) {
      return { complete: false, missing: 'difference', difference, distance, message: `فرق الشدتين الحالي ${ltrQty(difference, 'N')}؛ يلزم ${ltrQty(target.minDifferenceN, 'N')} على الأقل.` };
    }
    if (distance === null || distance > target.maxDistanceCm) {
      return { complete: false, missing: 'distance', difference, distance, message: `بعد حامل المحصلة عن حامل القوة الأكبر ${distance === null ? 'غير محدد' : ltrQty(Number(distance.toFixed(2)), 'cm')}؛ المطلوب ${ltrQty(target.maxDistanceCm, 'cm')} أو أقل.` };
    }
    return { complete: true, difference, distance, message: `أصبح حامل المحصلة على بعد ${ltrQty(Number(distance.toFixed(2)), 'cm')} من حامل القوة الأكبر.` };
  }

  if (target.type === 'balanced-opposite') {
    if (result.mode !== OPPOSITE_SENSE) {
      return { complete: false, missing: 'mode', message: 'حوّل المختبر إلى وضع الجهتين المتعاكستين.' };
    }
    const difference = Math.abs(result.force1 - result.force2);
    if (difference > target.toleranceN) {
      return { complete: false, missing: 'difference', difference, message: `فرق الشدتين ${ltrQty(Number(difference.toFixed(2)), 'N')}؛ المطلوب أن تتساوى الشدتان.` };
    }
    return { complete: true, difference, message: 'الشدتان متساويتان ومتعاكستان؛ محصلة القوى صفر مع أثر دوران، ولا يوجد حامل مفرد محدود للمحصلة.' };
  }

  if (target.type === 'increase-and-observe') {
    if (!sessionStart) return { complete: false, missing: 'session', message: 'ابدأ التحدي من زر البدء حتى تُسجَّل الحالة الابتدائية.' };
    const before = parallelResultant(sessionStart);
    const growth = result[challenge.watchedField] - before[challenge.watchedField];
    if (result.mode !== (challenge.mode ?? SAME_SENSE)) {
      return { complete: false, missing: 'mode', message: 'أعد التحدي: هذا التحدي يخص وضع الجهة الواحدة.' };
    }
    if (growth < target.deltaN) {
      return { complete: false, missing: 'growth', growth, message: `أضفت ${ltrQty(Number(Math.max(0, growth).toFixed(2)), 'N')} حتى الآن؛ المطلوب ${ltrQty(target.deltaN, 'N')} على الأقل.` };
    }
    if (before.distanceFromForce2 === null || result.distanceFromForce2 === null) {
      return { complete: false, missing: 'distance', growth, message: 'لا يمكن قياس حركة حامل المحصلة في هذه الحالة.' };
    }
    const decrease = before.distanceFromForce2 - result.distanceFromForce2;
    if (decrease < target.minDecreaseCm) {
      return { complete: false, missing: 'distance', growth, decrease, message: `اقترب الحامل ${ltrQty(Number(Math.max(0, decrease).toFixed(2)), 'cm')}؛ المطلوب ${ltrQty(target.minDecreaseCm, 'cm')} على الأقل.` };
    }
    return { complete: true, growth, decrease, message: `زادت الشدة ${ltrQty(Number(growth.toFixed(2)), 'N')} فاقترب حامل المحصلة من القوة الثانية ${ltrQty(Number(decrease.toFixed(2)), 'cm')}.` };
  }

  if (target.type === 'target-position') {
    if (result.mode !== (challenge.mode ?? SAME_SENSE)) {
      return { complete: false, missing: 'mode', message: 'هذا التحدي يخص وضع الجهة الواحدة.' };
    }
    if (result.resultantPosition === null) {
      return { complete: false, missing: 'position', message: 'لا يوجد حامل مفرد للمحصلة في هذه الحالة.' };
    }
    const error = Math.abs(result.resultantPosition - target.targetCm);
    if (error > target.toleranceCm) {
      return {
        complete: false,
        missing: 'position',
        error,
        message: `حامل المحصلة الآن عند ${ltrQty(Number(result.resultantPosition.toFixed(2)), 'cm')} من النقطة ${POINT_A}؛ المطلوب ${ltrQty(target.targetCm, 'cm')} بسماحية ${ltrQty(target.toleranceCm, 'cm')}.`,
      };
    }
    return { complete: true, error, message: `حامل المحصلة عند ${ltrQty(Number(result.resultantPosition.toFixed(2)), 'cm')} من النقطة ${POINT_A}؛ هذا هو الهدف.` };
  }

  throw new RangeError(`Unknown challenge target: ${target.type}`);
}
