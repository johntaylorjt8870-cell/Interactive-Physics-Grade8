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

  // Use a mathematical y-up coordinate system. The SVG renderer flips y for screen coordinates.
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

  return {
    F1,
    F2,
    resultant,
    magnitude,
    directionDegrees: directionDegrees === null ? null : cleanZero(directionDegrees),
    angleDegrees: angle,
  };
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

export function concurrentDiagramGeometry(result, scale = 19, origin = { x: 220, y: 290 }) {
  const toScreen = (vector) => ({
    x: origin.x + vector.x * scale,
    y: origin.y - vector.y * scale,
  });
  const F1Tip = toScreen(result.F1);
  const F2Tip = toScreen(result.F2);
  const resultantTip = toScreen(result.resultant);
  return {
    origin: { ...origin },
    F1Tip,
    F2Tip,
    resultantTip,
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
