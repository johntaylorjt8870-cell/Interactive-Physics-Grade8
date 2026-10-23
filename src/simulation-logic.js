const assertMagnitude = (value, name) => {
  const magnitude = Number(value);
  if (!Number.isFinite(magnitude) || magnitude < 0) {
    throw new RangeError(`${name} must be a finite, non-negative force magnitude.`);
  }
  return magnitude;
};

const assertAngle = (value) => {
  const angle = Number(value);
  if (!Number.isFinite(angle) || angle < 0 || angle > 180) {
    throw new RangeError('The simulation angle must be between 0 and 180 degrees.');
  }
  return angle;
};

const cleanZero = (value) => (Math.abs(value) < 1e-12 ? 0 : value);

export function resultantOfConcurrentForces(force1Magnitude, force2Magnitude, angleDegrees) {
  const force1 = assertMagnitude(force1Magnitude, 'F1');
  const force2 = assertMagnitude(force2Magnitude, 'F2');
  const angle = assertAngle(angleDegrees);
  const radians = angle * Math.PI / 180;

  // Mathematical y-up coordinate system. The SVG renderer flips y for screen coordinates.
  const F1 = { x: force1, y: 0 };
  const F2 = {
    x: force2 * Math.cos(radians),
    y: force2 * Math.sin(radians),
  };
  const resultant = {
    x: cleanZero(F1.x + F2.x),
    y: cleanZero(F1.y + F2.y),
  };
  const magnitude = Math.hypot(resultant.x, resultant.y);
  const directionDegrees = magnitude < 1e-12
    ? null
    : ((Math.atan2(resultant.y, resultant.x) * 180 / Math.PI) + 360) % 360;
  const equilibrantDirectionDegrees = directionDegrees === null
    ? null
    : ((directionDegrees + 180) % 360);

  return {
    F1,
    F2,
    resultant,
    equilibrant: {
      x: cleanZero(-resultant.x),
      y: cleanZero(-resultant.y),
      magnitude,
      directionDegrees: equilibrantDirectionDegrees === null ? null : cleanZero(equilibrantDirectionDegrees),
    },
    magnitude,
    directionDegrees: directionDegrees === null ? null : cleanZero(directionDegrees),
    angleDegrees: angle,
    shape: classifyParallelogramShape(force1, force2, angle),
  };
}

export function classifyParallelogramShape(force1Magnitude, force2Magnitude, angleDegrees) {
  const f1 = assertMagnitude(force1Magnitude, 'F1');
  const f2 = assertMagnitude(force2Magnitude, 'F2');
  const angle = assertAngle(angleDegrees);
  if (f1 < 1e-9 || f2 < 1e-9) {
    return { id: 'single-or-zero', labelAr: 'شعاع منفرد أو معدوم (لا يتشكل رباعي)' };
  }
  if (Math.abs(angle) < 1e-9) {
    return { id: 'collinear-same', labelAr: 'على حامل واحد وبجهة واحدة (F = F₁ + F₂)' };
  }
  if (Math.abs(angle - 180) < 1e-9) {
    return { id: 'collinear-opposite', labelAr: 'على حامل واحد وبجهتين متعاكستين (F = |F₁ − F₂|)' };
  }
  const equalMagnitudes = Math.abs(f1 - f2) < 1e-9;
  const rightAngle = Math.abs(angle - 90) < 1e-9;
  if (rightAngle && equalMagnitudes) {
    return { id: 'square', labelAr: 'مربّع (تعامد + تساوي الشدتين)' };
  }
  if (rightAngle) {
    return { id: 'rectangle', labelAr: 'مستطيل (تعامد مع اختلاف الشدتين)' };
  }
  if (equalMagnitudes) {
    return { id: 'rhombus', labelAr: 'معيّن (تساوي الشدتين من دون تعامد)' };
  }
  return { id: 'parallelogram', labelAr: 'متوازي أضلاع عام' };
}

export function resultantOfPerpendicularForces(force1Magnitude, force2Magnitude) {
  const force1 = assertMagnitude(force1Magnitude, 'F1');
  const force2 = assertMagnitude(force2Magnitude, 'F2');
  const F1 = { x: force1, y: 0 };
  const F2 = { x: 0, y: force2 };
  const resultant = { x: force1, y: force2 };
  const magnitude = Math.hypot(force1, force2);
  const directionDegrees = magnitude < 1e-12
    ? null
    : Math.atan2(force2, force1) * 180 / Math.PI;

  return { F1, F2, resultant, magnitude, directionDegrees, angleDegrees: 90 };
}

export function perpendicularScaleModel(force1Magnitude, force2Magnitude, newtonsPerCm = 20) {
  const f1 = assertMagnitude(force1Magnitude, 'F1');
  const f2 = assertMagnitude(force2Magnitude, 'F2');
  const scale = Number(newtonsPerCm);
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new RangeError('Drawing scale (N per cm) must be a positive finite number.');
  }
  const base = resultantOfPerpendicularForces(f1, f2);
  return {
    ...base,
    newtonsPerCm: scale,
    cmF1: cleanZero(f1 / scale),
    cmF2: cleanZero(f2 / scale),
    cmResultant: cleanZero(base.magnitude / scale),
    f1Squared: cleanZero(f1 * f1),
    f2Squared: cleanZero(f2 * f2),
    sumOfSquares: cleanZero(f1 * f1 + f2 * f2),
    shapeLabel: f1 > 0 && f2 > 0
      ? (Math.abs(f1 - f2) < 1e-9 ? 'مربّع' : 'مستطيل')
      : 'على محور واحد',
  };
}

export function solveMissingPerpendicularForce(resultantMagnitude, knownForceMagnitude) {
  const resultant = assertMagnitude(resultantMagnitude, 'Resultant F');
  const known = assertMagnitude(knownForceMagnitude, 'Known force');
  if (known > resultant + 1e-12) {
    throw new RangeError('Known perpendicular component cannot exceed the resultant hypotenuse.');
  }
  const diff = Math.max(0, resultant * resultant - known * known);
  return {
    resultant,
    known,
    resultantSquared: cleanZero(resultant * resultant),
    knownSquared: cleanZero(known * known),
    differenceOfSquares: cleanZero(diff),
    unknown: cleanZero(Math.sqrt(diff)),
  };
}

export function concurrentDiagramGeometry(result, scale = 15, origin = { x: 250, y: 265 }) {
  const toScreen = (vector) => ({
    x: origin.x + vector.x * scale,
    y: origin.y - vector.y * scale,
  });
  const F1Tip = toScreen(result.F1);
  const F2Tip = toScreen(result.F2);
  const resultantTip = toScreen(result.resultant);
  const equilibrantTip = result.equilibrant
    ? toScreen({ x: result.equilibrant.x, y: result.equilibrant.y })
    : { ...origin };
  return {
    origin: { ...origin },
    F1Tip,
    F2Tip,
    resultantTip,
    equilibrantTip,
    scale,
  };
}

export function perpendicularDiagramGeometry(result, scale = 2.1, origin = { x: 100, y: 330 }) {
  const toScreen = (vector) => ({
    x: origin.x + vector.x * scale,
    y: origin.y - vector.y * scale,
  });
  return {
    origin: { ...origin },
    F1Tip: toScreen(result.F1),
    F2Tip: toScreen(result.F2),
    resultantTip: toScreen(result.resultant),
    scale,
  };
}

const assertPercent = (value, name) => {
  const percent = Number(value);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new RangeError(`${name} must be between 0 and 100 percent.`);
  }
  return percent;
};

export function concurrentExperimentGeometry(horizontalPercent = 50, verticalPercent = 50) {
  const horizontal = assertPercent(horizontalPercent, 'Horizontal position');
  const vertical = assertPercent(verticalPercent, 'Vertical position');
  const origin = {
    x: 250 + horizontal * 1.8,
    y: 145 + vertical * 1.2,
  };
  const guidePoints = {
    F1: { x: 140, y: 62 },
    F2: { x: 540, y: 62 },
  };
  const unitToward = (point) => {
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    const magnitude = Math.hypot(dx, dy);
    return { x: dx / magnitude, y: dy / magnitude };
  };
  const directions = {
    F1: unitToward(guidePoints.F1),
    F2: unitToward(guidePoints.F2),
    W: { x: 0, y: 1 },
  };
  const arrowTip = (direction, length) => ({
    x: origin.x + direction.x * length,
    y: origin.y + direction.y * length,
  });
  const carrierThrough = (direction, extension = 620) => ({
    start: {
      x: origin.x - direction.x * extension,
      y: origin.y - direction.y * extension,
    },
    end: {
      x: origin.x + direction.x * extension,
      y: origin.y + direction.y * extension,
    },
  });

  return {
    horizontalPercent: horizontal,
    verticalPercent: vertical,
    origin,
    guidePoints,
    directions,
    arrowTips: {
      F1: arrowTip(directions.F1, 78),
      F2: arrowTip(directions.F2, 78),
      W: arrowTip(directions.W, 78),
    },
    carriers: {
      F1: carrierThrough(directions.F1),
      F2: carrierThrough(directions.F2),
      W: { start: { x: origin.x, y: 18 }, end: { x: origin.x, y: 372 } },
    },
  };
}

export function springBoardEquilibrium({
  weightNewtons = 6,
  horizontalPercent = 50,
  verticalPercent = 50,
  mode = 'double',
} = {}) {
  const weight = assertMagnitude(weightNewtons, 'Weight w');
  if (weight > 20) {
    throw new RangeError('Weight w in the spring-board lab must not exceed 20 N.');
  }
  const geometry = concurrentExperimentGeometry(horizontalPercent, verticalPercent);
  if (mode === 'single') {
    const singleOrigin = { x: geometry.origin.x, y: geometry.origin.y };
    const singleAnchor = { x: singleOrigin.x, y: 54 };
    const vectorScale = 12;
    const lengthPx = Math.max(36, weight * vectorScale);
    return {
      mode: 'single',
      weightNewtons: weight,
      tension1Newtons: weight,
      tension2Newtons: 0,
      includedAngleDegrees: 0,
      origin: singleOrigin,
      anchors: { F1: singleAnchor, F2: null },
      carriers: {
        F1: { start: { x: singleOrigin.x, y: 18 }, end: { x: singleOrigin.x, y: 372 } },
        F2: null,
        W: { start: { x: singleOrigin.x, y: 18 }, end: { x: singleOrigin.x, y: 372 } },
      },
      arrowTips: {
        F1: { x: singleOrigin.x, y: singleOrigin.y - lengthPx },
        F2: { ...singleOrigin },
        W: { x: singleOrigin.x, y: singleOrigin.y + lengthPx },
      },
    };
  }

  const u1 = geometry.directions.F1; // up-left: u1.x < 0, u1.y < 0
  const u2 = geometry.directions.F2; // up-right: u2.x > 0, u2.y < 0
  const determinant = u1.x * u2.y - u2.x * u1.y; // strictly positive
  const tension1 = cleanZero((weight * u2.x) / determinant);
  const tension2 = cleanZero((weight * (-u1.x)) / determinant);
  const cosIncluded = Math.max(-1, Math.min(1, u1.x * u2.x + u1.y * u2.y));
  const includedAngleDegrees = cleanZero(Math.acos(cosIncluded) * 180 / Math.PI);
  const vectorScale = 12;
  const clampLen = (n) => (n < 1e-9 ? 0 : Math.min(115, Math.max(34, n * vectorScale)));

  return {
    mode: 'double',
    weightNewtons: weight,
    tension1Newtons: tension1,
    tension2Newtons: tension2,
    includedAngleDegrees,
    origin: geometry.origin,
    anchors: geometry.guidePoints,
    directions: geometry.directions,
    carriers: geometry.carriers,
    arrowTips: {
      F1: {
        x: geometry.origin.x + u1.x * clampLen(tension1),
        y: geometry.origin.y + u1.y * clampLen(tension1),
      },
      F2: {
        x: geometry.origin.x + u2.x * clampLen(tension2),
        y: geometry.origin.y + u2.y * clampLen(tension2),
      },
      W: {
        x: geometry.origin.x,
        y: geometry.origin.y + clampLen(weight),
      },
    },
  };
}

export function resolveForceIntoPerpendicularComponents(forceMagnitude, angleDegrees) {
  const magnitude = assertMagnitude(forceMagnitude, 'Force');
  const angle = Number(angleDegrees);
  if (!Number.isFinite(angle) || angle < 0 || angle > 90) {
    throw new RangeError('The resolution angle must be between 0 and 90 degrees.');
  }
  const radians = angle * Math.PI / 180;
  return {
    magnitude,
    angleDegrees: angle,
    componentX: cleanZero(magnitude * Math.cos(radians)),
    componentY: cleanZero(magnitude * Math.sin(radians)),
  };
}

export function forceResolutionDiagramGeometry(components, scale = 31, origin = { x: 160, y: 370 }) {
  const componentX = assertMagnitude(components.componentX, 'OX component');
  const componentY = assertMagnitude(components.componentY, 'OY component');
  const XTip = { x: origin.x + componentX * scale, y: origin.y };
  const YTip = { x: origin.x, y: origin.y - componentY * scale };
  const resultantTip = { x: XTip.x, y: YTip.y };
  return {
    origin: { ...origin },
    XTip,
    YTip,
    resultantTip,
    componentX,
    componentY,
    scale,
  };
}

export function inclinedPlaneResolution(weightNewtons = 8, inclineAngleDegrees = 25) {
  const weight = assertMagnitude(weightNewtons, 'Weight w');
  const angle = Number(inclineAngleDegrees);
  if (!Number.isFinite(angle) || angle < 0 || angle > 60) {
    throw new RangeError('Incline angle a must be between 0 and 60 degrees.');
  }
  const rad = angle * Math.PI / 180;
  const parallelF1 = cleanZero(weight * Math.sin(rad));
  const normalF2 = cleanZero(weight * Math.cos(rad));
  return {
    weightNewtons: weight,
    inclineAngleDegrees: angle,
    parallelF1,
    normalF2,
    normalReactionR: normalF2,
    reconstructedWeight: cleanZero(Math.hypot(parallelF1, normalF2)),
  };
}

export function inclinedPlaneDiagramGeometry(model, scale = 14) {
  const angle = model.inclineAngleDegrees;
  const rad = angle * Math.PI / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const baseStart = { x: 76, y: 334 };
  const rampLength = 460;
  const rampEnd = {
    x: baseStart.x + rampLength * cosA,
    y: baseStart.y - rampLength * sinA,
  };
  const along = 250;
  const surfacePoint = {
    x: baseStart.x + along * cosA,
    y: baseStart.y - along * sinA,
  };
  const outNormal = { x: -sinA, y: -cosA };
  const intoNormal = { x: sinA, y: cosA };
  const downRamp = { x: -cosA, y: sinA };
  const origin = {
    x: surfacePoint.x + outNormal.x * 18,
    y: surfacePoint.y + outNormal.y * 18,
  };
  const wPx = model.weightNewtons * scale;
  const f1Px = model.parallelF1 * scale;
  const f2Px = model.normalF2 * scale;
  return {
    baseStart,
    baseEnd: { x: 566, y: baseStart.y },
    rampEnd,
    origin,
    inclineAngleDegrees: angle,
    downRamp,
    intoNormal,
    outNormal,
    weightTip: { x: origin.x, y: origin.y + wPx },
    f1Tip: { x: origin.x + downRamp.x * f1Px, y: origin.y + downRamp.y * f1Px },
    f2Tip: { x: origin.x + intoNormal.x * f2Px, y: origin.y + intoNormal.y * f2Px },
    normalTip: { x: origin.x + outNormal.x * f2Px, y: origin.y + outNormal.y * f2Px },
  };
}
