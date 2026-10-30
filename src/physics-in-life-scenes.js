/*
 * SVG scene builders for «الفيزياء في حياتنا» — Lesson 1.
 *
 * Every scene is a pure string function of its state: same inputs → same SVG.
 * Physics comes from physics-in-life-physics.js; this module only draws it.
 *
 * Rules kept in every drawing:
 *   - each force arrow starts at the point of effect and points along the force;
 *   - arrow length = magnitude × one fixed scale inside that scene;
 *   - helper/construction lines are dashed grey, never a force colour;
 *   - a force symbol is placed beside its arrow, never above an arrowhead or
 *     above another symbol, so nothing overlaps.
 */

import {
  compassDirection,
  concurrentResultant,
  inclineComponents,
  normalizeDegrees,
  perpendicularResultant,
  toPixels,
  angularDifference,
} from './physics-in-life-physics.js';

export const SCENE_COLORS = Object.freeze({
  f1: '#16706b',
  f2: '#46629f',
  resultant: '#c96a4f',
  parallel: '#9a6a22',
  perpendicular: '#7a4a72',
  weight: '#24304a',
  reaction: '#5b667d',
  helper: '#a4adbd',
  correct: '#2e7a55',
  student: '#b06a2c',
});

const INK = '#24304a';
const MUTED = '#68738a';

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const fmt = (value, digits = 0) => {
  if (!Number.isFinite(Number(value))) return '0';
  return Number(Number(value).toFixed(digits)).toString();
};

const rad = (degrees) => (Number(degrees) * Math.PI) / 180;

/** A point `length` pixels from `origin` at a mathematical angle (y-up). */
export function pointAt(origin, length, angleDegrees) {
  return {
    x: origin.x + length * Math.cos(rad(angleDegrees)),
    y: origin.y - length * Math.sin(rad(angleDegrees)),
  };
}

function markerDefs(prefix) {
  return Object.entries(SCENE_COLORS).map(([key, color]) => (
    `<marker id="${prefix}-${key}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="3.1" markerHeight="3.1" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}" /></marker>`
  )).join('');
}

function svgOpen(prefix, { w, h, title, desc, className = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="pil-scene-svg ${className}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${prefix}-title ${prefix}-desc" preserveAspectRatio="xMidYMid meet">
    <title id="${prefix}-title">${escapeXml(title)}</title>
    <desc id="${prefix}-desc">${escapeXml(desc)}</desc>
    <defs>
      ${markerDefs(prefix)}
      <pattern id="${prefix}-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#e6ebf2" stroke-width="1" /></pattern>
      <linearGradient id="${prefix}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf2fa" /><stop offset="1" stop-color="#f6fafc" /></linearGradient>
      <linearGradient id="${prefix}-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3eff3" /><stop offset="1" stop-color="#cfe4ea" /></linearGradient>
      <linearGradient id="${prefix}-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fc" /><stop offset="1" stop-color="#dfeaf4" /></linearGradient>
      <linearGradient id="${prefix}-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1ece2" /><stop offset="1" stop-color="#e4dccd" /></linearGradient>
    </defs>`;
}

const svgClose = '</svg>';

/* --------------------------------------------------------------- primitives */

function arrow(prefix, { from, to, color = 'f1', width = 5, dashed = false, className = '' }) {
  if (!from || !to) return '';
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length < 2) return '';
  return `<line class="pil-vector ${className}" x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}" stroke="${SCENE_COLORS[color]}" stroke-width="${width}" ${dashed ? 'stroke-dasharray="8 7"' : ''} marker-end="url(#${prefix}-${color})" />`;
}

function helperLine({ from, to }) {
  return `<line class="pil-helper-line" x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}" />`;
}

function pointMarker({ x, y, color = INK, label = 'O', size = 5 }) {
  return `<g class="pil-origin" aria-hidden="true">
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size + 4}" fill="#ffffff" stroke="${color}" stroke-width="1.5" />
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" fill="${color}" />
    <text x="${(x + 12).toFixed(1)}" y="${(y - 10).toFixed(1)}" class="pil-svg-math" fill="${color}" font-size="17" direction="ltr">${escapeXml(label)}</text>
  </g>`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Symbol tag: italic symbol with a small subscript and the numeric value. */
function symbolTag({ x, y, symbol, sub = '', value = '', color = INK, width = 74, height = 44 }) {
  const left = x - width / 2;
  const top = y - height / 2;
  const subscript = sub
    ? `<tspan dy="4" font-size="14" class="pil-svg-sym">${escapeXml(sub)}</tspan>`
    : '';
  const valueLine = value
    ? `<text x="${x}" y="${(top + height - 9).toFixed(1)}" text-anchor="middle" class="pil-svg-value" fill="${color}" font-size="12.5" direction="ltr">${escapeXml(value)}</text>`
    : '';
  return `<g class="pil-vector-tag" aria-hidden="true">
    <rect x="${left.toFixed(1)}" y="${top.toFixed(1)}" width="${width}" height="${height}" rx="9" fill="#ffffff" fill-opacity="0.94" stroke="${color}" stroke-opacity="0.28" />
    <text x="${x}" y="${(top + (value ? 21 : height / 2 + 6)).toFixed(1)}" text-anchor="middle" class="pil-svg-math" fill="${color}" font-size="19" direction="ltr"><tspan font-style="italic">${escapeXml(symbol)}</tspan>${subscript}</text>
    ${valueLine}
  </g>`;
}

const SUBSCRIPT_DIGITS = Object.freeze({ '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' });
const SUBSCRIPT_RUN = /[₀-₉]+/g;

/**
 * Arabic notes may quote F₁ or v₂. Subscript code points are missing from the
 * Arabic and Latin faces, so they are drawn as real SVG subscripts instead of
 * relying on a system fallback font.
 */
function noteText(text, size) {
  const escaped = escapeXml(text);
  const segments = [];
  let lastIndex = 0;
  for (const match of escaped.matchAll(SUBSCRIPT_RUN)) {
    if (match.index > lastIndex) segments.push({ text: escaped.slice(lastIndex, match.index), dy: 0 });
    const digits = [...match[0]].map((character) => SUBSCRIPT_DIGITS[character] ?? character).join('');
    segments.push({ text: digits, dy: Number((size * 0.26).toFixed(1)), size: Number((size * 0.72).toFixed(1)) });
    lastIndex = match.index + match[0].length;
  }
  segments.push({ text: escaped.slice(lastIndex), dy: -Number((size * 0.26).toFixed(1)) });
  return segments.map((segment) => {
    const attributes = `${segment.dy ? ` dy="${segment.dy}"` : ''}${segment.size ? ` font-size="${segment.size}"` : ''}`;
    return `<tspan${attributes}>${segment.text}</tspan>`;
  }).join('');
}

function noteTag({ x, y, text, color = INK, size = 12.5, anchor = 'middle', background = '#ffffff' }) {
  const width = Math.max(46, text.length * size * 0.68 + 26);
  const left = anchor === 'middle' ? x - width / 2 : x;
  return `<g class="pil-note-tag" aria-hidden="true">
    <rect x="${left.toFixed(1)}" y="${(y - size - 5).toFixed(1)}" width="${width.toFixed(1)}" height="${(size + 13).toFixed(1)}" rx="7" fill="${background}" fill-opacity="0.9" stroke="${color}" stroke-opacity="0.18" />
    <text x="${anchor === 'middle' ? x : x + width / 2}" y="${(y - 2).toFixed(1)}" text-anchor="middle" direction="rtl" class="pil-svg-ar" fill="${color}" font-size="${size}">${noteText(text, size)}</text>
  </g>`;
}

/** Bounding boxes used by the label placer so two force tags never collide. */
const TAG_W = 74;
const TAG_H = 44;

function tagRect(x, y, w = TAG_W, h = TAG_H) {
  return { x: x - w / 2, y: y - h / 2, w, h };
}

function rectsOverlap(a, b, pad = 7) {
  return a.x < b.x + b.w + pad
    && a.x + a.w + pad > b.x
    && a.y < b.y + b.h + pad
    && a.y + a.h + pad > b.y;
}

function tagCandidates(from, to, { beyond = false } = {}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const px = -dy / length;
  const py = dx / length;
  const along = beyond ? [1.12, 1.0, 0.88, 0.74, 0.58, 1.3] : [0.68, 0.82, 0.54, 0.9, 0.44, 1.12, 1.35];
  const offsets = beyond ? [0, 34, -34, 58, -58, 84, -84] : [32, -32, 52, -52, 72, -72, 92, -92, 112, -112];
  const list = [];
  for (const t of along) {
    for (const offset of offsets) {
      list.push({ x: from.x + dx * t + px * offset, y: from.y + dy * t + py * offset });
    }
  }
  return list;
}

/**
 * Put each force label where it touches neither another label nor a reserved
 * area (hull, tugboat, angle arc). Falls back to the first candidate that is
 * merely inside the frame, so a label never disappears.
 */
function placeArrowTags(prefix, items, { viewW, viewH, obstacles = [] }) {
  const reserved = obstacles.map((box) => ({ weight: 1, ...box }));
  const html = [];
  for (const item of items) {
    const candidates = tagCandidates(item.from, item.to, { beyond: item.beyond });
    const anchor = { x: item.from.x + (item.to.x - item.from.x) * 0.7, y: item.from.y + (item.to.y - item.from.y) * 0.7 };
    let chosen = null;
    let bestScore = Infinity;
    for (const point of candidates) {
      if (point.x - TAG_W / 2 < 6 || point.x + TAG_W / 2 > viewW - 6) continue;
      if (point.y - TAG_H / 2 < 6 || point.y + TAG_H / 2 > viewH - 6) continue;
      const box = tagRect(point.x, point.y);
      const collisions = reserved.filter((other) => rectsOverlap(box, other));
      const distance = Math.hypot(point.x - anchor.x, point.y - anchor.y);
      const score = collisions.reduce((total, other) => total + (other.weight ?? 1), 0) * 1000 + distance;
      if (score < bestScore) {
        bestScore = score;
        chosen = point;
      }
      if (collisions.length === 0) break;
    }
    if (!chosen) chosen = candidates[0];
    if (bestScore >= 1000) {
      /* Crowded frame: take the free spot nearest the arrow instead of a collision. */
      let fallback = null;
      let fallbackDistance = Infinity;
      for (let y = 26; y <= viewH - 26; y += 8) {
        for (let x = 42; x <= viewW - 42; x += 8) {
          const box = tagRect(x, y);
          if (reserved.some((other) => rectsOverlap(box, other))) continue;
          const distance = Math.hypot(x - anchor.x, y - anchor.y);
          if (distance < fallbackDistance) {
            fallbackDistance = distance;
            fallback = { x, y };
          }
        }
      }
      if (fallback) chosen = fallback;
    }
    reserved.push({ ...tagRect(chosen.x, chosen.y), weight: 3 });
    html.push(symbolTag({
      x: chosen.x,
      y: chosen.y,
      symbol: item.symbol,
      sub: item.sub ?? '',
      value: item.value,
      color: SCENE_COLORS[item.color] ?? INK,
    }));
  }
  return html.join('');
}

/** The point where the angle label sits, so it can be reserved for the tags. */
function angleLabelPoint({ center, radius, fromDegrees, toDegrees }) {
  return pointAt(center, radius + 26, (fromDegrees + toDegrees) / 2);
}

function angleArc({ center, radius, fromDegrees, toDegrees, label, value, color = MUTED }) {
  const start = pointAt(center, radius, fromDegrees);
  const end = pointAt(center, radius, toDegrees);
  const sweep = toDegrees >= fromDegrees ? 0 : 1;
  const middle = pointAt(center, radius + 30, (fromDegrees + toDegrees) / 2);
  const text = value ? `${label} = ${value}` : label;
  const width = Math.max(34, text.length * 8.2 + 14);
  return `<g class="pil-angle" aria-hidden="true">
    <path d="M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${radius} ${radius} 0 0 ${sweep} ${end.x.toFixed(1)} ${end.y.toFixed(1)}" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="5 5" />
    <rect x="${(middle.x - width / 2).toFixed(1)}" y="${(middle.y - 11).toFixed(1)}" width="${width.toFixed(1)}" height="21" rx="6" fill="#ffffff" fill-opacity="0.82" />
    <text x="${middle.x.toFixed(1)}" y="${(middle.y + 5).toFixed(1)}" text-anchor="middle" direction="ltr" class="pil-svg-math" fill="${color}" font-size="14"><tspan class="pil-svg-greek">${escapeXml(label)}</tspan>${value ? `<tspan class="pil-svg-value"> = ${escapeXml(value)}</tspan>` : ''}</text>
  </g>`;
}

/** A 90° plate beside the right-angle mark, clear of the two arrows. */
function rightAngleLabel(origin) {
  const x = origin.x + 30;
  const y = origin.y - 96;
  return `<g class="pil-right-angle" aria-hidden="true">
    <rect x="${(x - 22).toFixed(1)}" y="${(y - 12).toFixed(1)}" width="44" height="22" rx="6" fill="#ffffff" fill-opacity="0.9" />
    <text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" direction="ltr" class="pil-svg-value" fill="${MUTED}" font-size="12">90°</text>
  </g>`;
}

function zeroResultantTag({ x, y, text = 'محصلة القوتين صفر' }) {
  return `<g class="pil-zero-resultant" aria-hidden="true">
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="#ffffff" fill-opacity="0.9" stroke="${SCENE_COLORS.resultant}" stroke-width="2" stroke-dasharray="4 4" />
    <text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle" fill="${SCENE_COLORS.resultant}" font-size="15" direction="ltr">0</text>
    <text x="${(x + 22).toFixed(1)}" y="${(y + 58).toFixed(1)}" text-anchor="middle" direction="rtl" class="pil-svg-ar" fill="${SCENE_COLORS.resultant}" font-size="12.5">${escapeXml(text)}</text>
  </g>`;
}

/* ------------------------------------------------------------------ station 1 */

const TUG_ORIGIN = Object.freeze({ x: 450, y: 320 });
const TUG_SCALE = 2.6;
const TUG_W = 900;
const TUG_H = 460;

function tugboat({ x, y, angle, color }) {
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(-angle).toFixed(1)})" aria-hidden="true">
    <path d="M -20 -9 L 14 -9 Q 24 0 14 9 L -20 9 Z" fill="#ffffff" stroke="${color}" stroke-width="2" />
    <rect x="-12" y="-5" width="16" height="10" rx="3" fill="${color}" fill-opacity="0.18" />
    <circle cx="6" cy="0" r="3" fill="${color}" />
  </g>`;
}

function shipHull(origin) {
  const { x, y } = origin;
  return `<g class="pil-ship" aria-hidden="true">
    <path d="M ${x} ${y} L ${x - 46} ${y - 20} L ${x - 158} ${y - 22} Q ${x - 172} ${y} ${x - 158} ${y + 22} L ${x - 46} ${y + 20} Z" fill="#fbfdfd" stroke="#46629f" stroke-width="2.2" />
    <path d="M ${x - 108} ${y - 18} L ${x - 108} ${y + 18}" stroke="#46629f" stroke-width="1.4" stroke-opacity="0.5" />
    <rect x="${x - 96}" y="${y - 12}" width="34" height="24" rx="5" fill="#46629f" fill-opacity="0.16" stroke="#46629f" stroke-width="1.2" />
    <circle cx="${x - 44}" cy="${y}" r="4.5" fill="#46629f" />
  </g>`;
}

function waterBackdrop(prefix, w, h) {
  return `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#${prefix}-water)" />
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${prefix}-grid)" opacity="0.55" />
    <g stroke="#a9ccd5" stroke-width="1.4" fill="none" opacity="0.75" aria-hidden="true">
      <path d="M 40 90 q 22 -8 44 0 t 44 0 t 44 0" />
      <path d="M 660 120 q 22 -8 44 0 t 44 0" />
      <path d="M 90 404 q 22 -8 44 0 t 44 0 t 44 0" />
      <path d="M 620 432 q 22 -8 44 0 t 44 0" />
      <path d="M 700 330 q 22 -8 44 0" />
    </g>`;
}

/**
 * Station 1: two tugboats pull one ship. `state` = {f1, f2, angle, direction,
 * showConstruction}.
 */
export function concurrentStationScene(state, prefix = 'pil-concurrent') {
  const { f1, f2, angle, direction = 15, showConstruction = true } = state;
  /* The scale is a drawing choice: it changes pixels per newton, never a value. */
  const scale = [1.6, 2.1, 2.6].includes(Number(state.scale)) ? Number(state.scale) : TUG_SCALE;
  const result = concurrentResultant({ f1, f2, angle, direction });
  const O = TUG_ORIGIN;
  const p1 = pointAt(O, toPixels(f1, scale), result.firstAngle);
  const p2 = pointAt(O, toPixels(f2, scale), result.secondAngle);
  const tip = pointAt(O, toPixels(result.magnitude, scale), result.directionDegrees ?? result.bisectorDegrees);

  const construction = showConstruction && !result.isZero
    ? `<g class="pil-construction" aria-hidden="true">
        <polygon points="${O.x},${O.y} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}" fill="${SCENE_COLORS.resultant}" fill-opacity="0.055" />
        ${helperLine({ from: p1, to: tip })}
        ${helperLine({ from: p2, to: tip })}
      </g>`
    : '';

  const firstArrow = f1 > 0 ? arrow(prefix, { from: O, to: p1, color: 'f1', width: 5.5 }) : '';
  const secondArrow = f2 > 0 ? arrow(prefix, { from: O, to: p2, color: 'f2', width: 5.5 }) : '';
  const resultantArrow = result.isZero
    ? zeroResultantTag({ x: O.x + 10, y: O.y + 66 })
    : arrow(prefix, { from: O, to: tip, color: 'resultant', width: 6.5, className: 'pil-resultant-vector' });

  const anglePoint = angleLabelPoint({ center: O, radius: 74, fromDegrees: result.firstAngle, toDegrees: result.secondAngle });
  const tagObstacles = [
    { x: O.x - 186, y: O.y - 34, w: 196, h: 68 },
    { x: anglePoint.x - 42, y: anglePoint.y - 16, w: 84, h: 32 },
  ];
  if (f1 > 4) tagObstacles.push({ x: p1.x - 30, y: p1.y - 22, w: 60, h: 44 });
  if (f2 > 4) tagObstacles.push({ x: p2.x - 30, y: p2.y - 22, w: 60, h: 44 });
  if (result.isZero) tagObstacles.push({ x: O.x - 70, y: O.y + 50, w: 150, h: 80 });
  const tagItems = [];
  if (f1 > 0) tagItems.push({ from: O, to: p1, color: 'f1', symbol: 'F', sub: '1', value: `${fmt(f1, 1)} N` });
  if (f2 > 0) tagItems.push({ from: O, to: p2, color: 'f2', symbol: 'F', sub: '2', value: `${fmt(f2, 1)} N` });
  if (!result.isZero) tagItems.push({ from: O, to: tip, color: 'resultant', symbol: 'F', value: `${fmt(result.magnitude, 1)} N`, beyond: true });
  const forceTags = placeArrowTags(prefix, tagItems, { viewW: TUG_W, viewH: TUG_H, obstacles: tagObstacles });

  return `${svgOpen(prefix, {
    w: TUG_W,
    h: TUG_H,
    title: 'سفينة تسحبها قاطرتان: القوتان والمحصلة ومتوازي الأضلاع',
    desc: 'قوتان تؤثران في مقدمة السفينة عند النقطة O. القوة الأولى باللون الأخضر والقوة الثانية بالأزرق والمحصلة بالبرتقالي، مع خطوط مساعدة متقطعة تكمل متوازي الأضلاع.',
    className: 'pil-scene-harbor',
  })}
    ${waterBackdrop(prefix, TUG_W, TUG_H)}
    ${shipHull(O)}
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${p1.x.toFixed(1)}" y2="${p1.y.toFixed(1)}" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" />
    ${f1 > 4 ? tugboat({ x: p1.x + Math.cos(rad(result.firstAngle)) * 20, y: p1.y - Math.sin(rad(result.firstAngle)) * 20, angle: result.firstAngle, color: SCENE_COLORS.f1 }) : ''}
    ${f2 > 4 ? tugboat({ x: p2.x + Math.cos(rad(result.secondAngle)) * 20, y: p2.y - Math.sin(rad(result.secondAngle)) * 20, angle: result.secondAngle, color: SCENE_COLORS.f2 }) : ''}
    ${construction}
    ${firstArrow}
    ${secondArrow}
    ${resultantArrow}
    ${forceTags}
    ${angleArc({ center: O, radius: 74, fromDegrees: result.firstAngle, toDegrees: result.secondAngle, label: 'θ', value: `${fmt(angle)}°` })}
    ${pointMarker({ x: O.x, y: O.y, color: INK, label: 'O' })}
  ${svgClose}`;
}

/* ------------------------------------------------------------------ station 2 */

const PERP_ORIGIN = Object.freeze({ x: 360, y: 350 });
const PERP_SCALE = 2.6;
const PERP_W = 760;
const PERP_H = 470;

function workshopBackdrop(prefix, w, h) {
  return `<rect x="0" y="0" width="${w}" height="${h}" fill="#fbfcfe" />
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${prefix}-grid)" />
    <rect x="0" y="${h - 58}" width="${w}" height="58" fill="#eef1f6" />
    <line x1="0" y1="${h - 58}" x2="${w}" y2="${h - 58}" stroke="#d7dee8" stroke-width="2" />`;
}

function cart(origin) {
  const { x, y } = origin;
  return `<g class="pil-cart" aria-hidden="true">
    <rect x="${x - 152}" y="${y - 24}" width="150" height="62" rx="10" fill="#f3f6fa" stroke="#46629f" stroke-width="2.2" />
    <path d="M ${x - 122} ${y - 24} L ${x - 108} ${y - 52} L ${x - 54} ${y - 52} L ${x - 40} ${y - 24}" fill="none" stroke="#46629f" stroke-width="2" />
    <circle cx="${x - 120}" cy="${y + 42}" r="13" fill="#ffffff" stroke="#24304a" stroke-width="2.4" />
    <circle cx="${x - 40}" cy="${y + 42}" r="13" fill="#ffffff" stroke="#24304a" stroke-width="2.4" />
    <circle cx="${x}" cy="${y}" r="5" fill="#46629f" />
  </g>`;
}

/** Station 2: perpendicular forces on one cart. `state` = {f1, f2}. */
export function perpendicularStationScene(state, prefix = 'pil-perpendicular') {
  const { f1, f2 } = state;
  const result = perpendicularResultant(f1, f2);
  const O = PERP_ORIGIN;
  const p1 = { x: O.x + toPixels(f1, PERP_SCALE), y: O.y };
  const p2 = { x: O.x, y: O.y - toPixels(f2, PERP_SCALE) };
  const tip = { x: p1.x, y: p2.y };

  return `${svgOpen(prefix, {
    w: PERP_W,
    h: PERP_H,
    title: 'عربة تُسحب بحبلين متعامدين والمحصلة هي قطر المستطيل',
    desc: 'تؤثر القوة الأولى أفقياً إلى اليمين والثانية شاقولياً إلى أعلى من نقطة ربط واحدة. المحصلة هي قطر المستطيل، ويُحسب مقدارها بنظرية فيثاغورس.',
    className: 'pil-scene-workshop',
  })}
    ${workshopBackdrop(prefix, PERP_W, PERP_H)}
    ${cart(O)}
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${p1.x}" y2="${p1.y}" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${p2.x}" y2="${p2.y}" />
    <g class="pil-construction" aria-hidden="true">
      <polygon points="${O.x},${O.y} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}" fill="${SCENE_COLORS.resultant}" fill-opacity="0.055" />
      ${helperLine({ from: p1, to: tip })}
      ${helperLine({ from: p2, to: tip })}
      <path d="M ${O.x + 22} ${O.y} L ${O.x + 22} ${O.y - 22} L ${O.x} ${O.y - 22}" fill="none" stroke="${MUTED}" stroke-width="1.5" />
    </g>
    ${f1 > 0 ? arrow(prefix, { from: O, to: p1, color: 'f1', width: 5.5 }) : ''}
    ${f2 > 0 ? arrow(prefix, { from: O, to: p2, color: 'f2', width: 5.5 }) : ''}
    ${result.isZero
    ? zeroResultantTag({ x: O.x + 74, y: O.y - 60, text: 'المحصلة = 0 N' })
    : arrow(prefix, { from: O, to: tip, color: 'resultant', width: 6.5, className: 'pil-resultant-vector' })}
    ${placeArrowTags(prefix, [
    ...(f1 > 0 ? [{ from: O, to: p1, color: 'f1', symbol: 'F', sub: '1', value: `${fmt(f1, 1)} N` }] : []),
    ...(f2 > 0 ? [{ from: O, to: p2, color: 'f2', symbol: 'F', sub: '2', value: `${fmt(f2, 1)} N` }] : []),
    ...(result.isZero ? [] : [{ from: O, to: tip, color: 'resultant', symbol: 'F', value: `${fmt(result.magnitude, 1)} N`, beyond: true }]),
  ], {
    viewW: PERP_W,
    viewH: PERP_H,
    obstacles: [
      { x: O.x - 158, y: O.y - 58, w: 160, h: 120 },
      { x: O.x - 4, y: O.y - 62, w: 70, h: 58 },
      ...(result.isZero ? [{ x: O.x + 20, y: O.y - 96, w: 150, h: 80 }] : []),
    ],
  })}
    ${pointMarker({ x: O.x, y: O.y, color: INK, label: 'O' })}
    ${rightAngleLabel(O)}
  ${svgClose}`;
}

/* ------------------------------------------------------------------ station 3 */

const INC_W = 800;
const INC_H = 560;
const INC_BASE = Object.freeze({ x: 100, y: 430 });
const INC_LENGTH = 480;
const INC_SCALE = 0.19;

function inclineGeometry(angle, weight, scale = INC_SCALE, base = INC_BASE, length = INC_LENGTH) {
  const alpha = normalizeDegrees(angle);
  const top = pointAt(base, length, alpha);
  const contact = pointAt(base, length * 0.58, alpha);
  /* Screen-frame unit vectors derived from the incline physics. */
  const components = inclineComponents(weight, angle);
  const outward = { x: -Math.sin(rad(alpha)), y: -Math.cos(rad(alpha)) };
  const center = { x: contact.x + outward.x * 26, y: contact.y + outward.y * 26 };
  const downSlope = { x: -Math.cos(rad(alpha)), y: Math.sin(rad(alpha)) };
  const intoSurface = { x: Math.sin(rad(alpha)), y: Math.cos(rad(alpha)) };
  return { alpha, top, contact, center, components, outward, downSlope, intoSurface };
}

function inclineBackdrop(prefix, w, h, base, top, kind) {
  const fillId = kind === 'ski' ? `${prefix}-snow` : `${prefix}-ground`;
  return `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#${prefix}-sky)" />
    <rect x="0" y="${base.y}" width="${w}" height="${h - base.y}" fill="url(#${fillId})" />
    <polygon points="${base.x},${base.y} ${top.x.toFixed(1)},${top.y.toFixed(1)} ${top.x.toFixed(1)},${base.y}" fill="${kind === 'ski' ? '#eef4fa' : '#efe9dd'}" stroke="none" />
    <line x1="${base.x - 40}" y1="${base.y}" x2="${w - 30}" y2="${base.y}" stroke="${kind === 'ski' ? '#b9cddf' : '#cfc4b1'}" stroke-width="2" />
    <line x1="${base.x}" y1="${base.y}" x2="${top.x.toFixed(1)}" y2="${top.y.toFixed(1)}" stroke="${kind === 'ski' ? '#a9c3da' : '#bfae93'}" stroke-width="12" stroke-linecap="round" />
    <line x1="${base.x}" y1="${base.y}" x2="${top.x.toFixed(1)}" y2="${top.y.toFixed(1)}" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="10 8" />
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${prefix}-grid)" opacity="0.25" />`;
}

function inclineAngleLabel(base, alpha) {
  const start = { x: base.x + 62, y: base.y };
  const end = pointAt(base, 62, alpha);
  const label = pointAt(base, 92, alpha / 2);
  return `<g class="pil-angle" aria-hidden="true">
    <path d="M ${start.x} ${start.y} A 62 62 0 0 0 ${end.x.toFixed(1)} ${end.y.toFixed(1)}" fill="none" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="5 5" />
    <rect x="${(label.x - 32).toFixed(1)}" y="${(label.y - 12).toFixed(1)}" width="64" height="23" rx="6" fill="#ffffff" fill-opacity="0.85" />
    <text x="${label.x.toFixed(1)}" y="${(label.y + 5).toFixed(1)}" text-anchor="middle" direction="ltr" class="pil-svg-math" fill="${MUTED}" font-size="14"><tspan class="pil-svg-greek">α</tspan><tspan class="pil-svg-value"> = ${fmt(alpha)}°</tspan></text>
  </g>`;
}

function sledder(center, alpha) {
  return `<g transform="translate(${center.x.toFixed(1)} ${center.y.toFixed(1)}) rotate(${(-alpha).toFixed(1)}) scale(1.25)" aria-hidden="true">
    <rect x="-30" y="20" width="58" height="7" rx="3.5" fill="#33568f" />
    <circle cx="-4" cy="-12" r="9" fill="#f7d7c6" stroke="#8a5b46" stroke-width="1.6" />
    <path d="M -4 0 L -4 14" stroke="#33568f" stroke-width="5" stroke-linecap="round" />
    <path d="M -12 6 L 4 2" stroke="#33568f" stroke-width="4" stroke-linecap="round" />
    <path d="M -6 14 L 10 19" stroke="#33568f" stroke-width="4" stroke-linecap="round" />
  </g>`;
}

/** Labels for station 3, placed so they clear the slope, the rider and each other. */
function inclineLabels({ center, weightTip, parallelTip, perpTip, reactionTip, components, weight, alpha, lengthParallel, lengthPerp, showReaction }) {
  const labelPoint = pointAt(INC_BASE, 92, alpha / 2);
  const reactionText = 'R: رد فعل السطح (ليست مركبة من الثقل)';
  const reactionWidth = Math.max(46, reactionText.length * 11.5 * 0.56 + 18);
  const reactionX = clamp(reactionTip.x, reactionWidth / 2 + 12, INC_W - reactionWidth / 2 - 12);
  const reactionY = clamp(reactionTip.y - 30, 30, INC_H - 30);
  const showNote = showReaction && lengthPerp > 3;

  const obstacles = [
    { x: center.x - 44, y: center.y - 54, w: 88, h: 92 },
    { x: labelPoint.x - 48, y: labelPoint.y - 18, w: 96, h: 36 },
  ];
  if (alpha > 5) {
    for (let t = 0.08; t <= 0.98; t += 0.12) {
      const point = pointAt(INC_BASE, INC_LENGTH * t, alpha);
      obstacles.push({ x: point.x - 28, y: point.y - 20, w: 56, h: 40 });
    }
  }
  if (showNote) {
    obstacles.push({ x: reactionX - reactionWidth / 2, y: reactionY - 22, w: reactionWidth, h: 32 });
  }

  const items = [
    { from: center, to: weightTip, color: 'weight', symbol: 'w', value: `${fmt(weight, 1)} N` },
    ...(lengthParallel > 3 ? [{ from: center, to: parallelTip, color: 'parallel', symbol: 'w', sub: '∥', value: `${fmt(components.parallel, 1)} N` }] : []),
    ...(lengthPerp > 3 ? [{ from: center, to: perpTip, color: 'perpendicular', symbol: 'w', sub: '⊥', value: `${fmt(components.perpendicular, 1)} N` }] : []),
  ];
  const tags = placeArrowTags('', items, { viewW: INC_W, viewH: INC_H, obstacles });
  const note = showNote
    ? noteTag({ x: reactionX, y: reactionY, text: reactionText, color: SCENE_COLORS.reaction, size: 11.5 })
    : '';
  return { tags, note };
}

/** Station 3: weight resolution on an inclined plane. */
export function inclineStationScene(state, prefix = 'pil-incline') {
  const { weight, angle, showReaction = false } = state;
  const geometry = inclineGeometry(angle, weight);
  const { alpha, top, contact, center, components, outward, downSlope, intoSurface } = geometry;
  const lengthWeight = toPixels(weight, INC_SCALE);
  const lengthParallel = toPixels(components.parallel, INC_SCALE);
  const lengthPerp = toPixels(components.perpendicular, INC_SCALE);

  const weightTip = { x: center.x, y: center.y + lengthWeight };
  const parallelTip = { x: center.x + downSlope.x * lengthParallel, y: center.y + downSlope.y * lengthParallel };
  const perpTip = { x: center.x + intoSurface.x * lengthPerp, y: center.y + intoSurface.y * lengthPerp };
  const reactionTip = { x: center.x + outward.x * lengthPerp, y: center.y + outward.y * lengthPerp };
  const labels = inclineLabels({
    center, weightTip, parallelTip, perpTip, reactionTip, components, weight, alpha, lengthParallel, lengthPerp, showReaction,
  });

  return `${svgOpen(prefix, {
    w: INC_W,
    h: INC_H,
    title: 'متزلج على منحدر وتحليل ثقله إلى مركبتين',
    desc: 'ثقل الجسم رأسياً إلى أسفل، والمركبة الموازية للسطح تتجه إلى أسفل المنحدر، والمركبة العمودية تتجه إلى داخل السطح. الخطوط المتقطعة مساعدة وليست قوى.',
    className: 'pil-scene-incline',
  })}
    ${inclineBackdrop(prefix, INC_W, INC_H, INC_BASE, top, 'ski')}
    ${inclineAngleLabel(INC_BASE, alpha)}
    ${sledder(center, alpha)}
    <g class="pil-construction" aria-hidden="true">
      ${helperLine({ from: parallelTip, to: weightTip })}
      ${helperLine({ from: perpTip, to: weightTip })}
    </g>
    ${arrow(prefix, { from: center, to: weightTip, color: 'weight', width: 5.5 })}
    ${lengthParallel > 3 ? arrow(prefix, { from: center, to: parallelTip, color: 'parallel', width: 5.5 }) : ''}
    ${lengthPerp > 3 ? arrow(prefix, { from: center, to: perpTip, color: 'perpendicular', width: 5.5 }) : ''}
    ${showReaction && lengthPerp > 3 ? arrow(prefix, { from: center, to: reactionTip, color: 'reaction', width: 3.5, dashed: true, className: 'pil-reaction-vector' }) : ''}
    ${labels.tags}
    ${labels.note}
    ${pointMarker({ x: center.x, y: center.y, color: INK, label: 'O' })}
    <circle class="pil-contact-point" cx="${contact.x.toFixed(1)}" cy="${contact.y.toFixed(1)}" r="4" />
  ${svgClose}`;
}

/* ------------------------------------------------------- opening / predict */

const OPENING_W = 760;
const OPENING_H = 430;
const OPENING_ORIGIN = Object.freeze({ x: 300, y: 285 });
const OPENING_SCALE = 2.2;

/** The opening scene: two people pull a crate; the resultant is optional. */
export function openingScene({ f1, f2, angle, direction = 20, showResultant = false }, prefix = 'pil-opening') {
  const result = concurrentResultant({ f1, f2, angle, direction });
  const O = OPENING_ORIGIN;
  const p1 = pointAt(O, toPixels(f1, OPENING_SCALE), result.firstAngle);
  const p2 = pointAt(O, toPixels(f2, OPENING_SCALE), result.secondAngle);
  const tip = pointAt(O, toPixels(result.magnitude, OPENING_SCALE), result.directionDegrees ?? result.bisectorDegrees);

  const personSpot = (point, angle) => pointAt(point, 46, angle);
  const ropeEnd = (point, angle) => pointAt(point, 22, angle);

  const anglePoint = angleLabelPoint({ center: O, radius: 56, fromDegrees: result.firstAngle, toDegrees: result.secondAngle });

  const person = (point, hue) => `<g transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})" aria-hidden="true">
    <circle cx="0" cy="-20" r="11" fill="#f7d7c6" stroke="#8a5b46" stroke-width="1.6" />
    <path d="M 0 -8 L 0 16" stroke="${hue}" stroke-width="8" stroke-linecap="round" />
    <path d="M 0 -2 L 14 8" stroke="${hue}" stroke-width="5" stroke-linecap="round" />
    <path d="M 0 16 L -10 34" stroke="${hue}" stroke-width="5" stroke-linecap="round" />
    <path d="M 0 16 L 10 34" stroke="${hue}" stroke-width="5" stroke-linecap="round" />
  </g>`;

  return `${svgOpen(prefix, {
    w: OPENING_W,
    h: OPENING_H,
    title: 'شخصان يسحبان صندوقاً بقوتين مختلفتين',
    desc: 'تؤثر القوتان في النقطة نفسها على الصندوق. يمكن إظهار المحصلة بعد تسجيل التوقع.',
    className: 'pil-scene-opening',
  })}
    <rect x="0" y="0" width="${OPENING_W}" height="${OPENING_H}" fill="url(#${prefix}-sky)" />
    <rect x="0" y="0" width="${OPENING_W}" height="${OPENING_H}" fill="url(#${prefix}-grid)" opacity="0.45" />
    <rect x="0" y="${OPENING_H - 62}" width="${OPENING_W}" height="62" fill="url(#${prefix}-ground)" />
    <g aria-hidden="true">
      <rect x="${O.x - 34}" y="${O.y - 30}" width="68" height="60" rx="8" fill="#f7f3ea" stroke="#8a6420" stroke-width="2.4" />
      <path d="M ${O.x - 34} ${O.y - 8} L ${O.x + 34} ${O.y - 8}" stroke="#8a6420" stroke-width="1.6" stroke-opacity="0.5" />
    </g>
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${ropeEnd(p1, result.firstAngle).x.toFixed(1)}" y2="${ropeEnd(p1, result.firstAngle).y.toFixed(1)}" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${ropeEnd(p2, result.secondAngle).x.toFixed(1)}" y2="${ropeEnd(p2, result.secondAngle).y.toFixed(1)}" />
    ${person(personSpot(p1, result.firstAngle), SCENE_COLORS.f1)}
    ${person(personSpot(p2, result.secondAngle), SCENE_COLORS.f2)}
    ${arrow(prefix, { from: O, to: p1, color: 'f1', width: 5 })}
    ${arrow(prefix, { from: O, to: p2, color: 'f2', width: 5 })}
    ${showResultant && !result.isZero ? arrow(prefix, { from: O, to: tip, color: 'resultant', width: 6, className: 'pil-resultant-vector' }) : ''}
    ${placeArrowTags(prefix, [
    { from: O, to: p1, color: 'f1', symbol: 'F', sub: '1', value: `${fmt(f1, 1)} N` },
    { from: O, to: p2, color: 'f2', symbol: 'F', sub: '2', value: `${fmt(f2, 1)} N` },
    ...(showResultant && !result.isZero ? [{ from: O, to: tip, color: 'resultant', symbol: 'F', value: `${fmt(result.magnitude, 1)} N`, beyond: true }] : []),
  ], {
    viewW: OPENING_W,
    viewH: OPENING_H,
    obstacles: [
      { x: O.x - 42, y: O.y - 38, w: 84, h: 76 },
      { x: personSpot(p1, result.firstAngle).x - 30, y: personSpot(p1, result.firstAngle).y - 44, w: 60, h: 88 },
      { x: personSpot(p2, result.secondAngle).x - 30, y: personSpot(p2, result.secondAngle).y - 44, w: 60, h: 88 },
      { x: anglePoint.x - 42, y: anglePoint.y - 18, w: 84, h: 36 },
      ...(showResultant && result.isZero ? [{ x: O.x - 70, y: O.y - 94, w: 150, h: 84 }] : []),
    ],
  })}
    ${showResultant && result.isZero ? zeroResultantTag({ x: O.x, y: O.y - 44 }) : ''}
    ${angleArc({ center: O, radius: 56, fromDegrees: result.firstAngle, toDegrees: result.secondAngle, label: 'θ', value: `${fmt(angle)}°` })}
    ${pointMarker({ x: O.x, y: O.y, color: INK, label: 'O' })}
    <text x="${(O.x + 6).toFixed(1)}" y="${(O.y + 58).toFixed(1)}" text-anchor="middle" direction="rtl" class="pil-svg-ar" fill="${MUTED}" font-size="12">نقطة تأثير القوتين</text>
  ${svgClose}`;
}

/** «توقّع ثم جرّب» scene — the resultant stays hidden until the check. */
export function predictScene({ f1, f2, angle, direction = 25, reveal = false }, prefix = 'pil-predict') {
  const result = concurrentResultant({ f1, f2, angle, direction });
  const w = 640;
  const h = 420;
  const O = { x: 240, y: 250 };
  const scale = 2;
  const p1 = pointAt(O, toPixels(f1, scale), result.firstAngle);
  const p2 = pointAt(O, toPixels(f2, scale), result.secondAngle);
  const tip = pointAt(O, toPixels(result.magnitude, scale), result.directionDegrees ?? result.bisectorDegrees);
  const anglePoint = angleLabelPoint({ center: O, radius: 52, fromDegrees: result.firstAngle, toDegrees: result.secondAngle });

  return `${svgOpen(prefix, {
    w,
    h,
    title: 'قوتان متلاقيتان لاختبار التوقع',
    desc: 'تظهر القوتان فقط قبل التحقق. بعد الضغط على تحقق تظهر المحصلة المحسوبة من القيم الحالية.',
    className: 'pil-scene-predict',
  })}
    <rect x="0" y="0" width="${w}" height="${h}" fill="#fbfcfe" />
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#${prefix}-grid)" />
    <circle cx="${O.x}" cy="${O.y}" r="26" fill="#ffffff" stroke="${INK}" stroke-width="2" />
    <circle cx="${O.x}" cy="${O.y}" r="8" fill="${INK}" />
    ${arrow(prefix, { from: O, to: p1, color: 'f1', width: 5 })}
    ${arrow(prefix, { from: O, to: p2, color: 'f2', width: 5 })}
    ${reveal && !result.isZero ? arrow(prefix, { from: O, to: tip, color: 'resultant', width: 6, className: 'pil-resultant-vector' }) : ''}
    ${placeArrowTags(prefix, [
    { from: O, to: p1, color: 'f1', symbol: 'F', sub: '1', value: `${fmt(f1, 1)} N` },
    { from: O, to: p2, color: 'f2', symbol: 'F', sub: '2', value: `${fmt(f2, 1)} N` },
    ...(reveal && !result.isZero ? [{ from: O, to: tip, color: 'resultant', symbol: 'F', value: `${fmt(result.magnitude, 1)} N`, beyond: true }] : []),
  ], {
    viewW: w,
    viewH: h,
    obstacles: [
      { x: O.x - 30, y: O.y - 30, w: 60, h: 60 },
      { x: anglePoint.x - 42, y: anglePoint.y - 18, w: 84, h: 36 },
      ...(reveal && result.isZero ? [{ x: O.x - 70, y: O.y + 10, w: 150, h: 84 }] : []),
    ],
  })}
    ${reveal && result.isZero ? zeroResultantTag({ x: O.x, y: O.y + 40 }) : ''}
    ${angleArc({ center: O, radius: 52, fromDegrees: result.firstAngle, toDegrees: result.secondAngle, label: 'θ', value: `${fmt(angle)}°` })}
    ${!reveal ? `<g aria-hidden="true"><circle cx="${O.x}" cy="${O.y}" r="58" fill="none" stroke="${SCENE_COLORS.resultant}" stroke-width="1.5" stroke-dasharray="6 8" opacity="0.55" /><text x="${O.x}" y="${O.y - 74}" text-anchor="middle" direction="rtl" class="pil-svg-ar" fill="${SCENE_COLORS.resultant}" font-size="13">المحصلة مخفية</text></g>` : ''}
    ${pointMarker({ x: O.x, y: O.y, color: INK, label: 'O' })}
  ${svgClose}`;
}

/* -------------------------------------------------------------- life examples */

function hotspot(point, index, { selectedId, correctId, disabled = false }) {
  const selected = selectedId === point.id;
  const isCorrect = selected && selectedId === correctId;
  const isWrong = selected && selectedId !== correctId;
  const stateClass = isCorrect ? 'is-correct' : isWrong ? 'is-wrong' : selected ? 'is-selected' : '';
  const stroke = isCorrect ? SCENE_COLORS.correct : isWrong ? '#ab4a33' : selected ? '#33568f' : '#5f6b84';
  return `<g class="pil-hotspot ${stateClass}" data-point="${escapeXml(point.id)}" ${disabled ? '' : 'tabindex="0" role="button"'} aria-label="${escapeXml(point.label)}" transform="translate(${point.x} ${point.y})">
    <title>${escapeXml(point.label)}</title>
    <circle class="pil-hotspot-pulse" r="24" fill="${stroke}" fill-opacity="0.08" />
    <circle class="pil-hotspot-ring" r="15" fill="#ffffff" fill-opacity="0.94" stroke="${stroke}" stroke-width="2" />
    <text class="pil-hotspot-number" y="4.5" text-anchor="middle" fill="${stroke}" font-size="12.5" direction="ltr">${index + 1}</text>
  </g>`;
}

function hotspotLayer(points, options) {
  if (!points?.length) return '';
  return `<g class="pil-hotspot-layer">${points.map((point, index) => hotspot(point, index, options)).join('')}</g>`;
}

const EXAMPLE_W = 800;
const EXAMPLE_H = 420;

function exampleFrame(prefix, example, inner, className = '') {
  return `${svgOpen(prefix, {
    w: EXAMPLE_W,
    h: EXAMPLE_H,
    title: example.title,
    desc: `${example.summary} استخدم النقاط المرقمة لتحديد نقطة التأثير.`,
    className: `pil-scene-example ${className}`,
  })}
    ${inner}
  ${svgClose}`;
}

function baseHotspots(example, options) {
  if (options.thumbnail) return '';
  const points = options.points ?? example.points ?? [];
  return hotspotLayer(points, {
    selectedId: options.selectedPointId,
    correctId: options.pointCorrect === true ? options.selectedPointId : '__none__',
    disabled: options.thumbnail,
  });
}

/** The resultant of the arrows actually drawn in the scene (same vector scale). */
function drawnResultantTip(origin, tips) {
  const sum = tips.reduce((total, tip) => ({ x: total.x + (tip.x - origin.x), y: total.y + (tip.y - origin.y) }), { x: 0, y: 0 });
  return { x: origin.x + sum.x, y: origin.y + sum.y, magnitudePixels: Math.hypot(sum.x, sum.y) };
}

function drawnResultantArrow(prefix, origin, tips, { width = 6 } = {}) {
  const tip = drawnResultantTip(origin, tips);
  if (tip.magnitudePixels < 3) return '';
  return `${arrow(prefix, { from: origin, to: tip, color: 'resultant', width, dashed: true })}
    ${symbolTag({ x: clamp(tip.x + 58, 54, EXAMPLE_W - 54), y: clamp(tip.y - 6, 28, EXAMPLE_H - 28), symbol: 'F', value: 'المحصلة', color: SCENE_COLORS.resultant, width: 96 })}`;
}

function revealed(example, options, html) {
  return options.revealed || options.thumbnail ? html : '';
}

function parachuteScene(prefix, example, options) {
  const O = { x: 400, y: 268 };
  const inner = `<rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-sky)" />
    <rect x="0" y="400" width="${EXAMPLE_W}" height="20" fill="url(#${prefix}-ground)" />
    <path d="M 250 128 Q 400 -12 550 128 Q 400 168 250 128 Z" fill="#f3b7a4" stroke="#b06a4f" stroke-width="2.4" />
    <path d="M 306 126 Q 352 96 400 126 Q 448 96 494 126" fill="none" stroke="#b06a4f" stroke-width="1.6" opacity="0.6" />
    <g stroke="#8d97ac" stroke-width="1.5" fill="none">
      <path d="M 274 124 L 400 268" /><path d="M 356 141 L 400 268" /><path d="M 444 141 L 400 268" /><path d="M 526 124 L 400 268" />
    </g>
    <circle cx="400" cy="288" r="15" fill="#f7d7c6" stroke="#8a5b46" stroke-width="1.8" />
    <path d="M 400 303 L 400 334" stroke="#33568f" stroke-width="7" stroke-linecap="round" />
    <path d="M 400 310 L 380 326 M 400 310 L 420 326" stroke="#33568f" stroke-width="4" stroke-linecap="round" />
    <path d="M 400 334 L 386 366 M 400 334 L 414 366" stroke="#33568f" stroke-width="4" stroke-linecap="round" />
    ${revealed(example, options, `
      ${arrow(prefix, { from: O, to: { x: 400, y: 146 }, color: 'f1', width: 5 })}
      ${noteTag({ x: 560, y: 206, text: 'شد الحبال إلى أعلى', color: SCENE_COLORS.f1, size: 12 })}
      ${arrow(prefix, { from: { x: 400, y: 318 }, to: { x: 400, y: 398 }, color: 'weight', width: 5 })}
      ${symbolTag({ x: 500, y: 352, symbol: 'w', value: '600 N', color: SCENE_COLORS.weight, width: 74 })}
      ${noteTag({ x: 650, y: 322, text: 'ثقل المظلي والمظلة', color: SCENE_COLORS.weight, size: 11.5 })}
    `)}
    ${baseHotspots(example, options)}`;
  return exampleFrame(prefix, example, inner);
}

function tugsScene(prefix, example, options) {
  const O = { x: 330, y: 240 };
  const t1 = { x: 520, y: 160 };
  const t2 = { x: 520, y: 320 };
  const inner = `<rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-water)" />
    <rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-grid)" opacity="0.4" />
    <g stroke="#a9ccd5" stroke-width="1.4" fill="none" opacity="0.8">
      <path d="M 60 330 q 22 -8 44 0 t 44 0" /><path d="M 620 330 q 22 -8 44 0 t 44 0" /><path d="M 180 90 q 22 -8 44 0" />
    </g>
    <path d="M ${O.x} ${O.y} L ${O.x - 46} ${O.y - 20} L ${O.x - 158} ${O.y - 22} Q ${O.x - 172} ${O.y} ${O.x - 158} ${O.y + 22} L ${O.x - 46} ${O.y + 20} Z" fill="#fbfdfd" stroke="#46629f" stroke-width="2.2" />
    <rect x="${O.x - 104}" y="${O.y - 12}" width="34" height="24" rx="5" fill="#46629f" fill-opacity="0.16" stroke="#46629f" stroke-width="1.2" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${t1.x}" y2="${t1.y}" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${t2.x}" y2="${t2.y}" />
    ${tugboat({ x: t1.x, y: t1.y, angle: 202, color: SCENE_COLORS.f1 })}
    ${tugboat({ x: t2.x, y: t2.y, angle: 158, color: SCENE_COLORS.f2 })}
    ${revealed(example, options, `
      ${arrow(prefix, { from: O, to: t1, color: 'f1', width: 5.5 })}
      ${arrow(prefix, { from: O, to: t2, color: 'f2', width: 5.5 })}
      ${noteTag({ x: 404, y: 112, text: 'F₁ شد الحبل الأول', color: SCENE_COLORS.f1, size: 12 })}
      ${noteTag({ x: 404, y: 372, text: 'F₂ شد الحبل الثاني', color: SCENE_COLORS.f2, size: 12 })}
      ${drawnResultantArrow(prefix, O, [t1, t2], { width: 6 })}
    `)}
    ${baseHotspots(example, options)}`;
  return exampleFrame(prefix, example, inner);
}

function slingshotScene(prefix, example, options) {
  const O = { x: 250, y: 264 };
  const left = { x: 206, y: 172 };
  const right = { x: 294, y: 172 };
  const inner = `<rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-sky)" />
    <rect x="0" y="352" width="${EXAMPLE_W}" height="68" fill="url(#${prefix}-ground)" />
    <path d="M 250 360 L 250 268" stroke="#8a6420" stroke-width="12" stroke-linecap="round" />
    <path d="M 250 268 L 206 172" stroke="#8a6420" stroke-width="10" stroke-linecap="round" />
    <path d="M 250 268 L 294 172" stroke="#8a6420" stroke-width="10" stroke-linecap="round" />
    <path d="M 206 172 L 250 264" stroke="#ab4a33" stroke-width="5" stroke-linecap="round" />
    <path d="M 294 172 L 250 264" stroke="#ab4a33" stroke-width="5" stroke-linecap="round" />
    <rect x="238" y="254" width="24" height="20" rx="7" fill="#5b667d" />
    <circle cx="250" cy="264" r="9" fill="#8d97ac" stroke="#5b667d" stroke-width="2" />
    <path d="M 250 300 q -6 20 0 34" stroke="#929bad" stroke-width="1.6" fill="none" stroke-dasharray="4 4" opacity="0.7" />
    ${revealed(example, options, `
      ${arrow(prefix, { from: O, to: left, color: 'f1', width: 5 })}
      ${arrow(prefix, { from: O, to: right, color: 'f2', width: 5 })}
      ${noteTag({ x: 104, y: 208, text: 'F₁ شد المطاط', color: SCENE_COLORS.f1, size: 12 })}
      ${noteTag({ x: 380, y: 208, text: 'F₂ شد المطاط', color: SCENE_COLORS.f2, size: 12 })}
      ${drawnResultantArrow(prefix, O, [left, right], { width: 6 })}
    `)}
    ${baseHotspots(example, options)}`;
  return exampleFrame(prefix, example, inner);
}

function basketScene(prefix, example, options) {
  const O = { x: 400, y: 226 };
  const leftHand = { x: 232, y: 182 };
  const rightHand = { x: 568, y: 182 };
  const inner = `<rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-sky)" />
    <rect x="0" y="352" width="${EXAMPLE_W}" height="68" fill="url(#${prefix}-ground)" />
    <g aria-hidden="true">
      <circle cx="${leftHand.x}" cy="${leftHand.y}" r="13" fill="#f7d7c6" stroke="#8a5b46" stroke-width="1.6" />
      <circle cx="${rightHand.x}" cy="${rightHand.y}" r="13" fill="#f7d7c6" stroke="#8a5b46" stroke-width="1.6" />
      <path d="M 232 170 q -34 -10 -40 18" stroke="#33568f" stroke-width="8" fill="none" stroke-linecap="round" />
      <path d="M 568 170 q 34 -10 40 18" stroke="#33568f" stroke-width="8" fill="none" stroke-linecap="round" />
    </g>
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${leftHand.x}" y2="${leftHand.y}" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${rightHand.x}" y2="${rightHand.y}" />
    <circle cx="${O.x}" cy="${O.y}" r="8" fill="#fbfdfd" stroke="#8a6420" stroke-width="2.4" />
    <path d="M 340 258 L 460 258 L 446 344 L 354 344 Z" fill="#eadcc1" stroke="#8a6420" stroke-width="2.4" />
    <path d="M 344 282 L 456 282" stroke="#8a6420" stroke-width="2" opacity="0.55" />
    <path d="M 400 226 L 354 258 M 400 226 L 446 258" stroke="#8a6420" stroke-width="2" />
    ${revealed(example, options, `
      ${arrow(prefix, { from: O, to: leftHand, color: 'f1', width: 5 })}
      ${arrow(prefix, { from: O, to: rightHand, color: 'f2', width: 5 })}
      ${noteTag({ x: 238, y: 140, text: 'F₁ شد الحبل', color: SCENE_COLORS.f1, size: 12 })}
      ${noteTag({ x: 566, y: 140, text: 'F₂ شد الحبل', color: SCENE_COLORS.f2, size: 12 })}
      ${drawnResultantArrow(prefix, O, [leftHand, rightHand], { width: 6 })}
      ${arrow(prefix, { from: { x: 400, y: 268 }, to: { x: 400, y: 356 }, color: 'weight', width: 4.5 })}
      ${noteTag({ x: 492, y: 300, text: 'ثقل السلة', color: SCENE_COLORS.weight, size: 11.5 })}
    `)}
    ${baseHotspots(example, options)}`;
  return exampleFrame(prefix, example, inner);
}

function towScene(prefix, example, options) {
  const O = { x: 324, y: 266 };
  const t1 = { x: 104, y: 142 };
  const t2 = { x: 700, y: 156 };
  const inner = `<rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-ground)" />
    <rect x="0" y="312" width="${EXAMPLE_W}" height="108" fill="#8a6b45" opacity="0.25" />
    <g aria-hidden="true">
      <rect x="326" y="238" width="150" height="58" rx="12" fill="#f3f6fa" stroke="#33568f" stroke-width="2.4" />
      <path d="M 360 238 L 378 206 L 434 206 L 452 238" fill="none" stroke="#33568f" stroke-width="2.2" />
      <circle cx="352" cy="304" r="15" fill="#ffffff" stroke="#24304a" stroke-width="2.6" />
      <circle cx="452" cy="304" r="15" fill="#ffffff" stroke="#24304a" stroke-width="2.6" />
      <path d="M 240 330 q 22 -8 44 0 t 44 0" stroke="#6b5335" stroke-width="2" fill="none" opacity="0.6" />
    </g>
    <g aria-hidden="true">
      <rect x="54" y="112" width="86" height="42" rx="8" fill="#eef2f9" stroke="${SCENE_COLORS.f1}" stroke-width="2" />
      <rect x="62" y="92" width="42" height="24" rx="6" fill="#eef2f9" stroke="${SCENE_COLORS.f1}" stroke-width="2" />
      <circle cx="76" cy="160" r="11" fill="#fff" stroke="#24304a" stroke-width="2" />
      <circle cx="126" cy="160" r="11" fill="#fff" stroke="#24304a" stroke-width="2" />
      <rect x="666" y="120" width="86" height="42" rx="8" fill="#eef2f9" stroke="${SCENE_COLORS.f2}" stroke-width="2" />
      <rect x="674" y="100" width="42" height="24" rx="6" fill="#eef2f9" stroke="${SCENE_COLORS.f2}" stroke-width="2" />
      <circle cx="688" cy="168" r="11" fill="#fff" stroke="#24304a" stroke-width="2" />
      <circle cx="738" cy="168" r="11" fill="#fff" stroke="#24304a" stroke-width="2" />
    </g>
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${t1.x}" y2="${t1.y}" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${t2.x}" y2="${t2.y}" />
    ${revealed(example, options, `
      ${arrow(prefix, { from: O, to: t1, color: 'f1', width: 5.5 })}
      ${arrow(prefix, { from: O, to: t2, color: 'f2', width: 5.5 })}
      ${noteTag({ x: 232, y: 190, text: 'F₁ شد الحبل', color: SCENE_COLORS.f1, size: 12 })}
      ${noteTag({ x: 566, y: 206, text: 'F₂ شد الحبل', color: SCENE_COLORS.f2, size: 12 })}
      ${drawnResultantArrow(prefix, O, [t1, t2], { width: 6 })}
    `)}
    ${baseHotspots(example, options)}`;
  return exampleFrame(prefix, example, inner);
}

function riverScene(prefix, example, options) {
  const O = { x: 330, y: 270 };
  const boatTip = { x: 330, y: 148 };
  const currentTip = { x: 482, y: 270 };
  const resultTip = { x: 482, y: 148 };
  const inner = `<rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="#eef4f7" />
    <rect x="0" y="84" width="${EXAMPLE_W}" height="252" fill="url(#${prefix}-water)" />
    <line x1="0" y1="84" x2="${EXAMPLE_W}" y2="84" stroke="#9fbea6" stroke-width="10" />
    <line x1="0" y1="336" x2="${EXAMPLE_W}" y2="336" stroke="#9fbea6" stroke-width="10" />
    <g stroke="#9fc4cd" stroke-width="2" fill="none" opacity="0.75">
      <path d="M 90 130 q 26 -8 52 0 t 52 0" /><path d="M 550 300 q 26 -8 52 0" /><path d="M 640 190 q 26 -8 52 0" />
    </g>
    <g aria-hidden="true">
      <path d="M 316 268 L 342 268 L 350 286 L 308 286 Z" fill="#fbfdfd" stroke="#33568f" stroke-width="2" />
      <path d="M 330 268 L 330 248" stroke="#33568f" stroke-width="2" />
    </g>
    ${arrow(prefix, { from: O, to: boatTip, color: 'f1', width: 5.5 })}
    ${arrow(prefix, { from: O, to: currentTip, color: 'f2', width: 5.5 })}
    ${arrow(prefix, { from: O, to: resultTip, color: 'resultant', width: 5.5, dashed: true })}
    ${noteTag({ x: 218, y: 196, text: 'v₁ سرعة القارب', color: SCENE_COLORS.f1, size: 12 })}
    ${noteTag({ x: 578, y: 262, text: 'v₂ سرعة التيار', color: SCENE_COLORS.f2, size: 12 })}
    ${noteTag({ x: 588, y: 188, text: 'v السرعة الناتجة', color: SCENE_COLORS.resultant, size: 12 })}
    <g aria-hidden="true"><path d="M 436 146 L 482 148 L 480 192" fill="none" stroke="${MUTED}" stroke-width="1.4" stroke-dasharray="4 4" /><path d="M 330 148 L 482 148 L 482 270" fill="none" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="4 4" /></g>
    ${baseHotspots(example, options)}`;
  return exampleFrame(prefix, example, inner, 'pil-scene-river');
}

function kiteScene(prefix, example, options) {
  const O = { x: 560, y: 150 };
  const hand = { x: 200, y: 340 };
  const inner = `<rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-sky)" />
    <rect x="0" y="366" width="${EXAMPLE_W}" height="54" fill="#d9e8d8" />
    <g stroke="#b7cde2" stroke-width="2" fill="none" opacity="0.65">
      <path d="M 660 98 q 40 -10 80 0" /><path d="M 690 132 q 36 -9 72 0" /><path d="M 640 166 q 36 -9 72 0" />
    </g>
    <path d="M ${O.x} 100 L 614 150 L ${O.x} 200 L 506 150 Z" fill="#f3b7a4" stroke="#b06a4f" stroke-width="2.4" />
    <path d="M ${O.x} 100 L ${O.x} 200 M 506 150 L 614 150" stroke="#b06a4f" stroke-width="1.4" opacity="0.7" />
    <path d="M ${O.x} 200 q -14 40 -46 56 q 28 12 20 34" fill="none" stroke="#b06a4f" stroke-width="2.2" stroke-dasharray="5 5" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${hand.x}" y2="${hand.y}" />
    <circle cx="${hand.x}" cy="${hand.y}" r="11" fill="#f7d7c6" stroke="#8a5b46" stroke-width="1.6" />
    <path d="M ${hand.x} ${hand.y + 11} L ${hand.x} ${hand.y + 56}" stroke="#33568f" stroke-width="7" stroke-linecap="round" />
    ${arrow(prefix, { from: O, to: hand, color: 'f1', width: 4.5 })}
    ${noteTag({ x: 300, y: 268, text: 'شد الخيط', color: SCENE_COLORS.f1, size: 12 })}
    ${arrow(prefix, { from: O, to: { x: 692, y: 108 }, color: 'f2', width: 5 })}
    ${noteTag({ x: 646, y: 76, text: 'قوة الرياح', color: SCENE_COLORS.f2, size: 12 })}
    ${arrow(prefix, { from: O, to: { x: 560, y: 252 }, color: 'weight', width: 4.5 })}
    ${symbolTag({ x: 660, y: 250, symbol: 'w', value: 'ثقل الطائرة', color: SCENE_COLORS.weight, width: 96 })}
    ${baseHotspots(example, options)}`;
  return exampleFrame(prefix, example, inner);
}

function inclineExample(prefix, example, options) {
  const angle = options.angle ?? example.interactiveAngle?.initial ?? 35;
  const weight = example.weight ?? 300;
  const kind = example.scene;
  const base = { x: 130, y: 360 };
  const length = 560;
  const geometry = inclineGeometry(angle, weight, 1, base, length);
  const { alpha, top, contact, center, components, outward, downSlope, intoSurface } = geometry;
  /* One scale inside this scene: the full weight is 128 px. */
  const fullLength = 128;
  const lengthWeight = fullLength;
  const lengthParallel = components.weight > 0 ? (components.parallel / components.weight) * fullLength : 0;
  const lengthPerp = components.weight > 0 ? (components.perpendicular / components.weight) * fullLength : 0;
  const weightTip = { x: center.x, y: center.y + lengthWeight };
  const parallelTip = { x: center.x + downSlope.x * lengthParallel, y: center.y + downSlope.y * lengthParallel };
  const perpTip = { x: center.x + intoSurface.x * lengthPerp, y: center.y + intoSurface.y * lengthPerp };
  const reactionTip = { x: center.x + outward.x * lengthPerp, y: center.y + outward.y * lengthPerp };
  const frictionTip = { x: center.x - downSlope.x * 82, y: center.y - downSlope.y * 82 };

  const body = kind === 'slide'
    ? `<g transform="translate(${center.x.toFixed(1)} ${center.y.toFixed(1)}) rotate(${(-alpha).toFixed(1)})" aria-hidden="true">
        <rect x="-26" y="18" width="52" height="6" rx="3" fill="#33568f" />
        <circle cx="-2" cy="-13" r="10" fill="#f7d7c6" stroke="#8a5b46" stroke-width="1.6" />
        <path d="M -2 0 L -2 14" stroke="#33568f" stroke-width="5" stroke-linecap="round" />
        <path d="M -12 6 L 6 4" stroke="#33568f" stroke-width="4" stroke-linecap="round" />
        <path d="M -4 14 L 12 18" stroke="#33568f" stroke-width="4" stroke-linecap="round" />
      </g>`
    : kind === 'road'
      ? `<g transform="translate(${center.x.toFixed(1)} ${center.y.toFixed(1)}) rotate(${(-alpha).toFixed(1)})" aria-hidden="true">
          <rect x="-38" y="-12" width="76" height="26" rx="8" fill="#f3f6fa" stroke="#33568f" stroke-width="2.2" />
          <path d="M -22 -12 L -12 -28 L 12 -28 L 22 -12" fill="none" stroke="#33568f" stroke-width="2" />
          <circle cx="-22" cy="16" r="9" fill="#24304a" /><circle cx="22" cy="16" r="9" fill="#24304a" />
        </g>`
      : `<g transform="translate(${center.x.toFixed(1)} ${center.y.toFixed(1)}) rotate(${(-alpha).toFixed(1)})" aria-hidden="true">
          <rect x="-30" y="18" width="58" height="6" rx="3" fill="#33568f" />
          <circle cx="-2" cy="-14" r="9" fill="#f7d7c6" stroke="#8a5b46" stroke-width="1.6" />
          <path d="M -2 0 L -2 14" stroke="#33568f" stroke-width="5" stroke-linecap="round" />
          <path d="M -12 4 L 6 2" stroke="#33568f" stroke-width="4" stroke-linecap="round" />
          <path d="M -6 16 L 8 19" stroke="#33568f" stroke-width="4" stroke-linecap="round" />
        </g>`;

  const inner = `${inclineBackdrop(prefix, EXAMPLE_W, EXAMPLE_H, base, top, kind === 'ski' ? 'ski' : 'ground')}
    ${inclineAngleLabel(base, alpha)}
    ${body}
    <g class="pil-construction" aria-hidden="true">
      ${helperLine({ from: parallelTip, to: weightTip })}
      ${helperLine({ from: perpTip, to: weightTip })}
    </g>
    ${arrow(prefix, { from: center, to: weightTip, color: 'weight', width: 4.8 })}
    ${lengthParallel > 2 ? arrow(prefix, { from: center, to: parallelTip, color: 'parallel', width: 4.8 }) : ''}
    ${lengthPerp > 2 ? arrow(prefix, { from: center, to: perpTip, color: 'perpendicular', width: 4.8 }) : ''}
    ${kind === 'slide' ? arrow(prefix, { from: center, to: reactionTip, color: 'reaction', width: 3.2, dashed: true }) : ''}
    ${kind === 'road' ? arrow(prefix, { from: contact, to: frictionTip, color: 'reaction', width: 3.6, dashed: true }) : ''}
    ${inclineExampleTags(prefix, { center, weightTip, parallelTip, perpTip, reactionTip, contact, weight, components, lengthParallel, lengthPerp, kind, alpha })}
    <circle class="pil-contact-point" cx="${contact.x.toFixed(1)}" cy="${contact.y.toFixed(1)}" r="4" />
    ${baseHotspots(example, { ...options, points: resolvedInclinePoints(example, { base, top, center, contact, alpha }) })}`;
  return exampleFrame(prefix, example, inner, `pil-scene-${kind}`);
}

/** Gallery incline scenes: three placed force tags plus the R / braking notes. */
function inclineExampleTags(prefix, { center, weightTip, parallelTip, perpTip, reactionTip, contact, weight, components, lengthParallel, lengthPerp, kind, alpha }) {
  const slopeBoxes = [];
  for (let t = 0.1; t <= 0.95; t += 0.12) {
    const point = pointAt({ x: 130, y: 360 }, 560 * t, alpha);
    slopeBoxes.push({ x: point.x - 34, y: point.y - 24, w: 68, h: 48 });
  }
  const reactionNote = kind === 'slide'
    ? { x: clamp(reactionTip.x + 6, 104, EXAMPLE_W - 104), y: clamp(reactionTip.y - 32, 28, EXAMPLE_H - 28) }
    : null;
  const brakeNote = kind === 'road'
    ? { x: 250, y: EXAMPLE_H - 26 }
    : null;
  const notes = [];
  const obstacles = [
    { x: center.x - 46, y: center.y - 50, w: 92, h: 96 },
    ...slopeBoxes,
  ];
  if (reactionNote) {
    obstacles.push({ x: reactionNote.x - 96, y: reactionNote.y - 24, w: 192, h: 36 });
    notes.push(noteTag({ ...reactionNote, text: 'R رد الفعل العمودي', color: SCENE_COLORS.reaction, size: 11 }));
  }
  if (brakeNote) {
    obstacles.push({ x: brakeNote.x - 134, y: brakeNote.y - 24, w: 268, h: 36 });
    notes.push(noteTag({ ...brakeNote, text: 'الاحتكاك (ليست مركبة من الثقل)', color: SCENE_COLORS.reaction, size: 11 }));
  }
  const tags = placeArrowTags(prefix, [
    { from: center, to: weightTip, color: 'weight', symbol: 'w', value: `${fmt(weight)} N` },
    ...(lengthParallel > 2 ? [{ from: center, to: parallelTip, color: 'parallel', symbol: 'w', sub: '∥', value: `${fmt(components.parallel, 1)} N` }] : []),
    ...(lengthPerp > 2 ? [{ from: center, to: perpTip, color: 'perpendicular', symbol: 'w', sub: '⊥', value: `${fmt(components.perpendicular, 1)} N` }] : []),
  ], { viewW: EXAMPLE_W, viewH: EXAMPLE_H, obstacles });
  return `${tags}${notes.join('')}`;
}

export function resolvedInclinePoints(example, { base, top, center, contact, alpha = 0 }) {
  return (example.points ?? []).map((point) => {
    if (point.anchor === 'body') return { ...point, x: center.x, y: center.y };
    if (point.anchor === 'contact') {
      return { ...point, x: contact.x - Math.cos(alpha * Math.PI / 180) * 30, y: contact.y + Math.sin(alpha * Math.PI / 180) * 30 };
    }
    if (point.anchor === 'top') return { ...point, x: top.x - 18, y: top.y + 26 };
    return { ...point, x: base.x + 34, y: base.y - 26 };
  });
}

export function resolvedDrawingPoints(challenge) {
  const map = {
    'draw-tugs': {
      bow: { x: 330, y: 250 },
      stern: { x: 172, y: 258 },
      tug: { x: 560, y: 150 },
    },
    'draw-incline': (() => {
      const base = { x: 130, y: 360 };
      const alpha = 35;
      const geometry = inclineGeometry(alpha, 600, 1, base, 540);
      return {
        body: geometry.center,
        contact: {
          x: geometry.contact.x - Math.cos(35 * Math.PI / 180) * 32,
          y: geometry.contact.y + Math.sin(35 * Math.PI / 180) * 32,
        },
        top: { x: geometry.top.x - 18, y: geometry.top.y + 26 },
      };
    })(),
    'draw-perpendicular': {
      hitch: { x: 320, y: 300 },
      wheel: { x: 250, y: 350 },
      'anchor-east': { x: 660, y: 300 },
    },
  };
  return (challenge.points ?? []).map((point) => ({ ...point, ...(map[challenge.scene]?.[point.anchor] ?? { x: 400, y: 210 }) }));
}

function drawingFrame(prefix, challenge, inner) {
  return `${svgOpen(prefix, {
    w: EXAMPLE_W,
    h: EXAMPLE_H,
    title: challenge.title,
    desc: challenge.prompt,
    className: `pil-scene-example pil-scene-drawing pil-scene-${challenge.scene}`,
  })}
    ${inner}
  ${svgClose}`;
}

function drawTugsScene(prefix, challenge, options) {
  const points = resolvedDrawingPoints(challenge);
  const O = { x: 330, y: 250 };
  const firstTip = pointAt(O, 250, 20);
  const secondTip = pointAt(O, 170, 80);
  const answer = options.answer;
  const inner = `<rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-water)" />
    <rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-grid)" opacity="0.35" />
    <path d="M ${O.x} ${O.y} L ${O.x - 46} ${O.y - 20} L ${O.x - 158} ${O.y - 22} Q ${O.x - 172} ${O.y} ${O.x - 158} ${O.y + 22} L ${O.x - 46} ${O.y + 20} Z" fill="#fbfdfd" stroke="#46629f" stroke-width="2.2" />
    <rect x="${O.x - 104}" y="${O.y - 12}" width="34" height="24" rx="5" fill="#46629f" fill-opacity="0.16" stroke="#46629f" stroke-width="1.2" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${firstTip.x.toFixed(1)}" y2="${firstTip.y.toFixed(1)}" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${secondTip.x.toFixed(1)}" y2="${secondTip.y.toFixed(1)}" />
    ${tugboat({ x: firstTip.x, y: firstTip.y, angle: 200, color: SCENE_COLORS.f1 })}
    ${tugboat({ x: secondTip.x, y: secondTip.y, angle: 260, color: SCENE_COLORS.f2 })}
    ${arrow(prefix, { from: O, to: firstTip, color: 'f1', width: 5 })}
    ${arrow(prefix, { from: O, to: secondTip, color: 'f2', width: 5 })}
    ${noteTag({ x: 560, y: 224, text: 'القوة الأولى 20°', color: SCENE_COLORS.f1, size: 12 })}
    ${noteTag({ x: 246, y: 74, text: 'القوة الثانية 80°', color: SCENE_COLORS.f2, size: 12 })}
    ${options.submitted ? answerOverlay(prefix, O, options) : ''}
    ${hotspotLayer(points, { selectedId: options.answer?.pointId, correctId: options.answer?.pointId === challenge.correctPointId ? challenge.correctPointId : '__none__' })}`;
  return drawingFrame(prefix, challenge, inner);
}

function drawInclineScene(prefix, challenge, options) {
  const points = resolvedDrawingPoints(challenge);
  const angle = 35;
  const weight = 600;
  const base = { x: 130, y: 360 };
  const geometry = inclineGeometry(angle, weight, 1, base, 540);
  const { alpha, top, contact, center } = geometry;
  const O = center;
  const inner = `${inclineBackdrop(prefix, EXAMPLE_W, EXAMPLE_H, base, top, 'ground')}
    ${inclineAngleLabel(base, alpha)}
    <g transform="translate(${center.x.toFixed(1)} ${center.y.toFixed(1)}) rotate(${(-alpha).toFixed(1)})" aria-hidden="true">
      <rect x="-24" y="16" width="48" height="8" rx="3" fill="#8a6420" />
      <rect x="-18" y="-12" width="36" height="30" rx="7" fill="#eadcc1" stroke="#8a6420" stroke-width="2" />
    </g>
    ${noteTag({ x: 430, y: 52, text: 'جسم على سطح مائل، وزنه 600 N', color: MUTED, size: 12 })}
    ${options.submitted ? answerOverlay(prefix, O, options) : ''}
    ${hotspotLayer(points, { selectedId: options.answer?.pointId, correctId: options.answer?.pointId === challenge.correctPointId ? challenge.correctPointId : '__none__' })}`;
  return drawingFrame(prefix, challenge, inner);
}

function drawPerpendicularScene(prefix, challenge, options) {
  const points = resolvedDrawingPoints(challenge);
  const O = { x: 320, y: 300 };
  const east = { x: 620, y: 300 };
  const north = { x: 320, y: 96 };
  const inner = `<rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="#fbfcfe" />
    <rect x="0" y="0" width="${EXAMPLE_W}" height="${EXAMPLE_H}" fill="url(#${prefix}-grid)" />
    <rect x="0" y="${EXAMPLE_H - 58}" width="${EXAMPLE_W}" height="58" fill="#eef1f6" />
    <g aria-hidden="true">
      <rect x="${O.x - 128}" y="${O.y - 20}" width="126" height="56" rx="9" fill="#f3f6fa" stroke="#46629f" stroke-width="2.2" />
      <circle cx="${O.x - 100}" cy="${O.y + 42}" r="12" fill="#fff" stroke="#24304a" stroke-width="2.2" />
      <circle cx="${O.x - 32}" cy="${O.y + 42}" r="12" fill="#fff" stroke="#24304a" stroke-width="2.2" />
    </g>
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${east.x}" y2="${east.y}" />
    <line class="pil-rope" x1="${O.x}" y1="${O.y}" x2="${north.x}" y2="${north.y}" />
    <path d="M ${O.x + 22} ${O.y} L ${O.x + 22} ${O.y - 22} L ${O.x} ${O.y - 22}" fill="none" stroke="${MUTED}" stroke-width="1.5" />
    ${arrow(prefix, { from: O, to: east, color: 'f1', width: 5 })}
    ${arrow(prefix, { from: O, to: north, color: 'f2', width: 5 })}
    ${noteTag({ x: 620, y: 344, text: '6 N شرقاً', color: SCENE_COLORS.f1, size: 12 })}
    ${noteTag({ x: 420, y: 96, text: '8 N شمالاً', color: SCENE_COLORS.f2, size: 12 })}
    ${options.submitted ? answerOverlay(prefix, O, options) : ''}
    ${hotspotLayer(points, { selectedId: options.answer?.pointId, correctId: options.answer?.pointId === challenge.correctPointId ? challenge.correctPointId : '__none__' })}`;
  return drawingFrame(prefix, challenge, inner);
}

function answerOverlay(prefix, origin, options) {
  const chosen = compassDirection(options.answer?.directionId);
  if (!chosen) return '';
  const length = 150;
  const studentTip = pointAt(origin, length, chosen.degrees);
  const correctTip = pointAt(origin, length, options.challenge.correctDirectionDegrees);
  const studentOk = Math.abs(angularDifference(chosen.degrees, options.challenge.correctDirectionDegrees)) <= options.challenge.directionToleranceDegrees;
  return `<g class="pil-answer-overlay" aria-hidden="true">
    ${arrow(prefix, { from: origin, to: studentTip, color: studentOk ? 'correct' : 'student', width: 5, dashed: !studentOk })}
    ${noteTag({ x: clamp(studentTip.x, 80, EXAMPLE_W - 80), y: clamp(studentTip.y - 18, 26, EXAMPLE_H - 24), text: 'سهمك', color: studentOk ? SCENE_COLORS.correct : SCENE_COLORS.student, size: 11.5 })}
    ${studentOk ? '' : `${arrow(prefix, { from: origin, to: correctTip, color: 'correct', width: 4, dashed: true })}${noteTag({ x: clamp(correctTip.x, 80, EXAMPLE_W - 80), y: clamp(correctTip.y - 44, 26, EXAMPLE_H - 24), text: 'الاتجاه الصحيح', color: SCENE_COLORS.correct, size: 11.5 })}`}
  </g>`;
}

/* ------------------------------------------------------------- public router */

const EXAMPLE_SCENES = {
  parachute: parachuteScene,
  tugs: tugsScene,
  slingshot: slingshotScene,
  basket: basketScene,
  tow: towScene,
  river: riverScene,
  kite: kiteScene,
  slide: inclineExample,
  road: inclineExample,
  ski: inclineExample,
};

export function exampleScene(example, options = {}, prefix = `pil-${example.scene}`) {
  const builder = EXAMPLE_SCENES[example.scene];
  if (!builder) throw new RangeError(`Unknown example scene: ${example.scene}`);
  return builder(prefix, example, options);
}

export function drawingScene(challenge, options = {}, prefix = `pil-${challenge.scene}`) {
  const scene = {
    'draw-tugs': drawTugsScene,
    'draw-incline': drawInclineScene,
    'draw-perpendicular': drawPerpendicularScene,
  }[challenge.scene];
  if (!scene) throw new RangeError(`Unknown drawing scene: ${challenge.scene}`);
  return scene(prefix, challenge, options);
}

/** Small, non-interactive artwork used by the landing cards. */
export function lessonCardScene(sceneId, prefix = 'pil-card') {
  if (sceneId !== 'tugboats') return '';
  const O = { x: 180, y: 130 };
  const p1 = { x: 280, y: 105 };
  const p2 = { x: 280, y: 155 };
  const tip = { x: O.x + (p1.x - O.x) + (p2.x - O.x), y: O.y + (p1.y - O.y) + (p2.y - O.y) };
  return `${svgOpen(prefix, {
    w: 420,
    h: 240,
    title: 'سفينة تجرّها قاطرتان',
    desc: 'رسم توضيحي لقوتين متلاقيتين عند مقدمة السفينة ومحصلة القوتين.',
    className: 'pil-card-svg',
  })}
    <rect x="0" y="0" width="420" height="240" fill="url(#${prefix}-water)" />
    <g stroke="#a9ccd5" stroke-width="1.2" fill="none" opacity="0.8"><path d="M 30 196 q 18 -6 36 0 t 36 0" /><path d="M 310 212 q 18 -6 36 0" /></g>
    <path d="M ${O.x} ${O.y} L ${O.x - 42} ${O.y - 18} L ${O.x - 148} ${O.y - 20} Q ${O.x - 160} ${O.y} ${O.x - 148} ${O.y + 20} L ${O.x - 42} ${O.y + 18} Z" fill="#fbfdfd" stroke="#46629f" stroke-width="2" />
    <line x1="${O.x}" y1="${O.y}" x2="${p1.x}" y2="${p1.y}" stroke="#8a6420" stroke-width="1.6" />
    <line x1="${O.x}" y1="${O.y}" x2="${p2.x}" y2="${p2.y}" stroke="#8a6420" stroke-width="1.6" />
    ${tugboat({ x: p1.x + 10, y: p1.y, angle: 166, color: SCENE_COLORS.f1 })}
    ${tugboat({ x: p2.x + 10, y: p2.y, angle: 194, color: SCENE_COLORS.f2 })}
    ${arrow(prefix, { from: O, to: p1, color: 'f1', width: 4 })}
    ${arrow(prefix, { from: O, to: p2, color: 'f2', width: 4 })}
    ${arrow(prefix, { from: O, to: tip, color: 'resultant', width: 4.4 })}
    <circle cx="${O.x}" cy="${O.y}" r="5" fill="${INK}" />
    <text x="${O.x + 10}" y="${O.y - 9}" fill="${INK}" font-size="13" direction="ltr" font-style="italic">O</text>
    <text x="${p1.x + 14}" y="${p1.y - 16}" fill="${SCENE_COLORS.f1}" font-size="12" direction="ltr">F<tspan dy="3" font-size="9">1</tspan></text>
    <text x="${p2.x + 14}" y="${p2.y + 22}" fill="${SCENE_COLORS.f2}" font-size="12" direction="ltr">F<tspan dy="3" font-size="9">2</tspan></text>
    <text x="${tip.x - 16}" y="${tip.y - 10}" fill="${SCENE_COLORS.resultant}" font-size="13" direction="ltr" font-style="italic">F</text>
  ${svgClose}`;
}

export { EXAMPLE_W, EXAMPLE_H };
