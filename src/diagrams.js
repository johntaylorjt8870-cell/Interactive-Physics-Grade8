import { V_F1, V_F2, V_F, V_F_PRIME, V_W, V_R } from './math.js';

const fmt = (value) => String(Number(value.toFixed(3)));
const add = (point, vector) => ({ x: point.x + vector.x, y: point.y + vector.y });
const subtract = (end, start) => ({ x: end.x - start.x, y: end.y - start.y });
const length = (vector) => Math.hypot(vector.x, vector.y);
const unit = (vector) => {
  const magnitude = length(vector);
  return { x: vector.x / magnitude, y: vector.y / magnitude };
};

const MARKER_COLORS = {
  blue: '#3b5fc0',
  teal: '#168782',
  coral: '#d55b43',
  plum: '#7a4a72',
  slate: '#334155',
};

function markerDefs(prefix) {
  return `<defs>${Object.entries(MARKER_COLORS).map(([name, color]) => `
    <marker id="${prefix}-${name}-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${color}" />
    </marker>`).join('')}
  </defs>`;
}

function line(x1, y1, x2, y2, className, extra = '') {
  return `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" class="${className}" ${extra} />`;
}

function vectorLine(prefix, start, end, color) {
  return line(start.x, start.y, end.x, end.y, `vector-line force-${color}`, `marker-end="url(#${prefix}-${color}-arrow)"`);
}

function pointMarker(pointValue, label, offset = { x: -14, y: 24 }) {
  return `<g class="point-marker">
    <circle cx="${fmt(pointValue.x)}" cy="${fmt(pointValue.y)}" r="5" />
    <text x="${fmt(pointValue.x + offset.x)}" y="${fmt(pointValue.y + offset.y)}" class="diagram-point-label" direction="ltr">${label}</text>
  </g>`;
}

/* Force symbols are drawn inside the SVG as explicit LTR groups: the vector arrow is a
   path placed above the letter it belongs to, and the subscript/prime is anchored to
   that same letter regardless of surrounding RTL layout. */
const SYMBOL_WIDTHS = { F: 12.4, w: 16.2, R: 13.6 };

export function forceSymbol(x, y, { letter = 'F', subscript = null, prime = false, color = 'blue', arrow = true } = {}) {
  const letterWidth = SYMBOL_WIDTHS[letter] ?? 13;
  const arrowSpan = prime ? letterWidth + 4.4 : letterWidth;
  const arrowY = y - 13.6;
  const head = 3.5;
  const arrowPath = arrow
    ? `<path class="force-vec-arrow" stroke="currentColor" d="M ${fmt(x - 0.8)} ${fmt(arrowY)} H ${fmt(x + arrowSpan + 0.8)} m 0 0 l ${fmt(-head)} ${fmt(-head * 0.7)} m ${fmt(head)} ${fmt(head * 0.7)} l ${fmt(-head)} ${fmt(head * 0.7)}" />`
    : '';
  const primeMarkup = prime
    ? `<text class="force-prime" fill="currentColor" x="${fmt(x + letterWidth - 0.2)}" y="${fmt(y - 3.2)}" direction="ltr">′</text>`
    : '';
  const subscriptMarkup = subscript === null
    ? ''
    : `<text class="force-sub" fill="currentColor" x="${fmt(x + letterWidth - 0.4)}" y="${fmt(y + 5.6)}" direction="ltr">${subscript}</text>`;
  return `<g class="force-symbol-group sym-${color}">
    ${arrowPath}
    <text class="force-symbol" fill="currentColor" x="${fmt(x)}" y="${fmt(y)}" direction="ltr">${letter}</text>
    ${primeMarkup}
    ${subscriptMarkup}
  </g>`;
}

function svgFrame(id, title, description, body, viewBox = '0 0 640 380') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="${id}-title ${id}-desc">
    <title id="${id}-title">${title}</title>
    <desc id="${id}-desc">${description}</desc>
    ${markerDefs(id)}
    ${body}
  </svg>`;
}

function angleMarkup(origin, firstVector, secondVector, angleDegrees, radius = 50) {
  const firstUnit = unit(firstVector);
  const secondUnit = unit(secondVector);
  const start = add(origin, { x: secondUnit.x * radius, y: secondUnit.y * radius });
  const end = add(origin, { x: firstUnit.x * radius, y: firstUnit.y * radius });
  const labelDirection = unit(add({ x: secondUnit.x * 0.68, y: secondUnit.y * 0.68 }, { x: firstUnit.x * 0.32, y: firstUnit.y * 0.32 }));
  const label = add(origin, { x: labelDirection.x * (radius + 26), y: labelDirection.y * (radius + 26) });
  return `<path d="M ${fmt(start.x)} ${fmt(start.y)} A ${fmt(radius)} ${fmt(radius)} 0 0 0 ${fmt(end.x)} ${fmt(end.y)}" class="angle-arc" />
    <text x="${fmt(label.x)}" y="${fmt(label.y)}" class="diagram-measure" direction="ltr" text-anchor="middle">${angleDegrees}°</text>`;
}

function rightAngleSquare(origin, u1, u2, size = 18) {
  const a = add(origin, { x: u1.x * size, y: u1.y * size });
  const c = add(origin, { x: (u1.x + u2.x) * size, y: (u1.y + u2.y) * size });
  const b = add(origin, { x: u2.x * size, y: u2.y * size });
  return `<path d="M ${fmt(a.x)} ${fmt(a.y)} L ${fmt(c.x)} ${fmt(c.y)} L ${fmt(b.x)} ${fmt(b.y)}" class="right-angle-mark" />`;
}

function parallelogramSvg(id, title, description, geometry, measurements = []) {
  const { origin, firstTip, secondTip } = geometry;
  const firstVector = subtract(firstTip, origin);
  const secondVector = subtract(secondTip, origin);
  const result = add(firstTip, secondVector);
  const construction = [
    line(firstTip.x, firstTip.y, result.x, result.y, 'construction-line'),
    line(secondTip.x, secondTip.y, result.x, result.y, 'construction-line'),
  ].join('');
  const angle = geometry.angleDegrees
    ? angleMarkup(origin, firstVector, secondVector, geometry.angleDegrees, 48)
    : '';
  const labels = measurements.map(({ x, y, value }) =>
    `<text x="${fmt(x)}" y="${fmt(y)}" class="diagram-measure" direction="ltr" text-anchor="middle">${value}</text>`).join('');
  const resultLabel = pointMarker(result, 'M');
  const beyond = (tip, vector, distance = 30) => {
    const direction = unit(vector);
    return add(tip, { x: direction.x * distance - 4, y: direction.y * distance + 6 });
  };
  const firstLabel = beyond(firstTip, firstVector);
  const secondLabel = beyond(secondTip, secondVector);
  const resultVector = subtract(result, origin);
  const resultLabelPosition = beyond(result, resultVector, 32);
  return {
    svg: svgFrame(id, title, description, `${construction}
      ${vectorLine(id, origin, firstTip, 'teal')}
      ${vectorLine(id, origin, secondTip, 'coral')}
      ${vectorLine(id, origin, result, 'blue')}
      ${angle}${labels}
      ${forceSymbol(firstLabel.x, firstLabel.y, { letter: 'F', subscript: '1', color: 'teal' })}
      ${forceSymbol(secondLabel.x, secondLabel.y, { letter: 'F', subscript: '2', color: 'coral' })}
      ${forceSymbol(resultLabelPosition.x, resultLabelPosition.y, { letter: 'F', color: 'blue' })}
      ${pointMarker(origin, 'O')}${resultLabel}`),
    result,
  };
}

/* --- 0. Stage 1: Force Vector Anatomy & Parachutist Schematic ------------ */

const vectorAnatomySvg = svgFrame(
  'vector-anatomy',
  'عناصر متجه القوة الأربعة وتمثيله بمقياس رسم',
  'شعاع القوة F ينطلق من نقطة التأثير O على حامله المتقطع باتجاه الرأس M بطول 4 سنتيمترات يمثل 20 نيوتن وفق مقياس 1 cm لكل 5 N.',
  `
    <rect x="28" y="24" width="196" height="58" rx="10" fill="#eef2f9" stroke="#cbd5e8" />
    <text x="126" y="47" class="diagram-caption-ar" text-anchor="middle">مقياس الرسم المختار</text>
    <text x="126" y="69" class="diagram-measure" direction="ltr" text-anchor="middle">1 cm : 5 N  |  4 cm = 20 N</text>

    ${line(58, 286, 592, 108, 'carrier-line')}
    <text x="515" y="114" class="diagram-caption-ar" text-anchor="middle">الحامل (المنحى): المستقيم الممتد</text>

    ${vectorLine('vector-anatomy', { x: 170, y: 248.667 }, { x: 454.605, y: 153.798 }, 'blue')}
    ${[1, 2, 3].map((step) => {
      const px = 170 + step * 71.151;
      const py = 248.667 - step * 23.717;
      return `<line x1="${fmt(px - 3.2)}" y1="${fmt(py - 9.5)}" x2="${fmt(px + 3.2)}" y2="${fmt(py + 9.5)}" stroke="#26406e" stroke-width="2" />
        <text x="${fmt(px + 9)}" y="${fmt(py + 24)}" class="diagram-measure" direction="ltr" text-anchor="middle">${step} cm</text>`;
    }).join('')}
    <text x="462" y="182" class="diagram-measure" direction="ltr">4 cm</text>

    ${forceSymbol(312, 174, { letter: 'F', color: 'blue' })}
    ${pointMarker({ x: 170, y: 248.667 }, 'O', { x: -18, y: -12 })}
    ${pointMarker({ x: 454.605, y: 153.798 }, 'M', { x: 12, y: -10 })}

    <g class="diagram-callout">
      <line x1="170" y1="258" x2="170" y2="338" stroke="#64748b" stroke-dasharray="4 3" />
      <text x="170" y="360" class="diagram-caption-ar" text-anchor="middle">١. نقطة التأثير O (بداية السهم)</text>
    </g>
    <g class="diagram-callout">
      <line x1="336" y1="215" x2="352" y2="294" stroke="#64748b" stroke-dasharray="4 3" />
      <text x="358" y="316" class="diagram-caption-ar" text-anchor="middle">٢. الشدة: طول السهم × المقياس (20 N)</text>
    </g>
    <g class="diagram-callout">
      <line x1="455" y1="142" x2="478" y2="78" stroke="#64748b" stroke-dasharray="4 3" />
      <text x="478" y="64" class="diagram-caption-ar" text-anchor="middle">٣. الجهة: من O نحو رأس السهم M</text>
    </g>
  `,
);

const parachutistSvg = svgFrame(
  'parachutist-vectors',
  'تمثيل تخطيطي للقوى وتلاقي امتدادات حبال المظلة',
  'مظلة مفتوحة تمتد منها حبال التعليق نحو حمالة المظلي عند النقطة المشتركة O، حيث تؤثر قوى شد الحبال نحو الأعلى وقوة ثقل المظلي w شاقولياً نحو الأسفل.',
  `
    <path d="M 155 110 C 195 36, 445 36, 485 110 C 440 94, 395 98, 368 110 C 336 96, 304 96, 272 110 C 245 98, 200 94, 155 110 Z" fill="#fef3c7" stroke="#d97706" stroke-width="2.4" />
    <path d="M 155 110 C 195 54, 248 54, 272 110 Z" fill="#fca5a5" opacity="0.7" />
    <path d="M 368 110 C 392 54, 445 54, 485 110 Z" fill="#fca5a5" opacity="0.7" />

    ${line(175, 110, 320, 226, 'carrier-line')}
    ${line(240, 106, 320, 226, 'carrier-line')}
    ${line(400, 106, 320, 226, 'carrier-line')}
    ${line(465, 110, 320, 226, 'carrier-line')}
    ${line(320, 42, 320, 360, 'carrier-line')}

    ${vectorLine('parachutist-vectors', { x: 320, y: 226 }, { x: 238, y: 160.4 }, 'teal')}
    ${vectorLine('parachutist-vectors', { x: 320, y: 226 }, { x: 402, y: 160.4 }, 'blue')}
    ${vectorLine('parachutist-vectors', { x: 320, y: 226 }, { x: 320, y: 342 }, 'coral')}

    <circle cx="320" cy="246" r="9" fill="#334155" />
    <path d="M 308 258 H 332 L 328 286 H 312 Z" fill="#1e3a8a" />
    ${pointMarker({ x: 320, y: 226 }, 'O', { x: 14, y: 4 })}

    ${forceSymbol(204, 155, { letter: 'F', subscript: '2', color: 'teal' })}
    ${forceSymbol(414, 155, { letter: 'F', subscript: '1', color: 'blue' })}
    ${forceSymbol(334, 344, { letter: 'w', color: 'coral' })}

    <text x="122" y="218" class="diagram-caption-ar" text-anchor="middle">حبال التعليق تمتد</text>
    <text x="122" y="238" class="diagram-caption-ar" text-anchor="middle">حواملها لتلتقي في O</text>
    <text x="514" y="302" class="diagram-caption-ar" text-anchor="middle">ثقل المظلي شاقولي</text>
    <text x="514" y="322" class="diagram-caption-ar" text-anchor="middle">نحو مركز الأرض</text>
  `,
);

/* --- 1. Stage 2: Concurrent Forces & Comparison -------------------------- */

const concurrentGeometry = {
  origin: { x: 320, y: 178 },
  forceTips: {
    F1: { x: 505, y: 58 },
    F2: { x: 133, y: 55 },
    w: { x: 320, y: 328 },
  },
  carriers: [
    { start: { x: 60, y: 8 }, end: { x: 580, y: 348 } },
    { start: { x: 60, y: 348 }, end: { x: 580, y: 8 } },
    { start: { x: 320, y: 22 }, end: { x: 320, y: 347 } },
  ],
};

const concurrentSvg = svgFrame(
  'concurrent',
  'القوى المتلاقية',
  'ثلاثة متجهات تبدأ من النقطة O: القوة F₁ إلى أعلى اليمين، والقوة F₂ إلى أعلى اليسار، والوزن w إلى أسفل. حواملها تلتقي عند O.',
  `${concurrentGeometry.carriers.map(({ start, end }) => line(start.x, start.y, end.x, end.y, 'carrier-line')).join('')}
    ${vectorLine('concurrent', concurrentGeometry.origin, concurrentGeometry.forceTips.F1, 'teal')}
    ${vectorLine('concurrent', concurrentGeometry.origin, concurrentGeometry.forceTips.F2, 'blue')}
    ${vectorLine('concurrent', concurrentGeometry.origin, concurrentGeometry.forceTips.w, 'coral')}
    ${forceSymbol(516, 52, { letter: 'F', subscript: '1', color: 'teal' })}
    ${forceSymbol(88, 46, { letter: 'F', subscript: '2', color: 'blue' })}
    ${forceSymbol(334, 330, { letter: 'w', color: 'coral' })}
    ${pointMarker(concurrentGeometry.origin, 'O')}`,
);

const concurrentComparisonSvg = svgFrame(
  'concurrent-comparison',
  'مقارنة بين القوى المتلاقية والقوى غير المتلاقية',
  'على اليمين ثلاث قوى تلتقي امتدادات حواملها في نقطة واحدة O فهي متلاقية حتى لو لم تتلامس بدايات أسهمها، وعلى اليسار ثلاث قوى تتقاطع حواملها مثنى مثنى في ثلاث نقاط مختلفة فهي غير متلاقية.',
  `
    <rect x="336" y="20" width="284" height="336" rx="14" fill="#f0fdf4" stroke="#86efac" />
    <text x="478" y="48" class="diagram-caption-ar" text-anchor="middle" font-weight="700">قوى متلاقية (تشترك في O)</text>
    ${line(358, 92, 598, 292, 'carrier-line')}
    ${line(358, 292, 598, 92, 'carrier-line')}
    ${line(478, 66, 478, 326, 'carrier-line')}
    ${vectorLine('concurrent-comparison', { x: 514, y: 162 }, { x: 586, y: 102 }, 'teal')}
    ${vectorLine('concurrent-comparison', { x: 442, y: 162 }, { x: 370, y: 102 }, 'blue')}
    ${vectorLine('concurrent-comparison', { x: 478, y: 218 }, { x: 478, y: 314 }, 'coral')}
    ${pointMarker({ x: 478, y: 192 }, 'O', { x: 12, y: 5 })}
    <text x="478" y="344" class="diagram-caption-ar" text-anchor="middle">امتدادات الحوامل تمر كلها بنقطة واحدة</text>

    <rect x="20" y="20" width="284" height="336" rx="14" fill="#fef2f2" stroke="#fca5a5" />
    <text x="162" y="48" class="diagram-caption-ar" text-anchor="middle" font-weight="700">قوى غير متلاقية (لا توجد نقطة واحدة)</text>
    ${line(40, 232, 282, 232, 'carrier-line')}
    ${line(68, 306, 206, 76, 'carrier-line')}
    ${line(256, 306, 118, 76, 'carrier-line')}
    ${vectorLine('concurrent-comparison', { x: 106, y: 232 }, { x: 224, y: 232 }, 'teal')}
    ${vectorLine('concurrent-comparison', { x: 112.4, y: 232 }, { x: 166.4, y: 142 }, 'blue')}
    ${vectorLine('concurrent-comparison', { x: 162, y: 149.333 }, { x: 211.6, y: 232 }, 'coral')}
    <circle cx="112.4" cy="232" r="4.5" fill="#dc2626" />
    <circle cx="211.6" cy="232" r="4.5" fill="#dc2626" />
    <circle cx="162" cy="149.333" r="4.5" fill="#dc2626" />
    <text x="162" y="344" class="diagram-caption-ar" text-anchor="middle">الحوامل شكّلت مثلثاً من 3 نقاط تقاطع منفصلة</text>
  `,
);

/* --- 2. Stage 3: Equilibrium + Parallelogram ----------------------------- */

const equilibriumParallelogramSvg = svgFrame(
  'equilibrium-parallelogram',
  'توازن الجسم المعلق ومقارنة محصلة الشدين بثقل الجسم',
  'من نقطة التعليق O تنطلق قوتا الشد F₁ وF₂ ويكتمل متوازي الأضلاع فيكون قطره F شاقولياً نحو الأعلى مساوياً بالشدة ومعاكساً بالجهة لقوة الثقل w الشاقولية نحو الأسفل.',
  `
    ${line(320, 24, 320, 358, 'carrier-line')}
    ${line(428, 126, 320, 52, 'construction-line')}
    ${line(212, 126, 320, 52, 'construction-line')}
    ${vectorLine('equilibrium-parallelogram', { x: 320, y: 200 }, { x: 428, y: 126 }, 'teal')}
    ${vectorLine('equilibrium-parallelogram', { x: 320, y: 200 }, { x: 212, y: 126 }, 'blue')}
    ${vectorLine('equilibrium-parallelogram', { x: 320, y: 200 }, { x: 320, y: 52 }, 'plum')}
    ${vectorLine('equilibrium-parallelogram', { x: 320, y: 200 }, { x: 320, y: 348 }, 'coral')}
    ${forceSymbol(442, 126, { letter: 'F', subscript: '1', color: 'teal' })}
    ${forceSymbol(174, 126, { letter: 'F', subscript: '2', color: 'blue' })}
    ${forceSymbol(284, 62, { letter: 'F', color: 'plum' })}
    ${forceSymbol(338, 344, { letter: 'w', color: 'coral' })}
    ${pointMarker({ x: 320, y: 200 }, 'O', { x: 14, y: 6 })}
    ${pointMarker({ x: 320, y: 52 }, 'M', { x: 14, y: 4 })}
    <text x="498" y="76" class="diagram-caption-ar" text-anchor="middle">قطر متوازي الأضلاع OM</text>
    <text x="498" y="98" class="diagram-caption-ar" text-anchor="middle">يعاكس الثقل مباشرة ويساويه شدةً</text>
  `,
);

const parallelogramGeometry = {
  origin: { x: 120, y: 290 },
  firstTip: { x: 282, y: 67 },
  secondTip: { x: 373, y: 290 },
};
const parallelogramDrawing = parallelogramSvg(
  'parallelogram',
  'متوازي الأضلاع ومحصلة قوتين',
  'القوتان تبدآن من O، ويكتمل متوازي الأضلاع؛ قطر O إلى M هو المحصلة.',
  parallelogramGeometry,
);

/* --- 3. Stage 4 & 5: Oblique 60° and Right-Angle 3-4-5 ------------------- */

const obliqueGeometry = {
  origin: { x: 120, y: 285 },
  firstTip: { x: 240, y: 77.154 }, // 4 units at 60 degrees; display scale is 60 px per cm.
  secondTip: { x: 300, y: 285 },  // 3 units at the display scale.
  angleDegrees: 60,
  scalePixelsPerCentimeter: 60,
  sourceMagnitudesCentimeters: { F1: 4, F2: 3 },
};
const obliqueDrawing = parallelogramSvg(
  'oblique',
  'مثال قوتين بينهما زاوية 60°',
  'شعاع F₁ أطول من شعاع F₂ بنسبة 4 إلى 3، والزاوية بينهما 60 درجة؛ القطر لا يُستخدم لقياس النتيجة التقريبية المطبوعة.',
  obliqueGeometry,
  [
    { x: 168, y: 174, value: '4 cm' },
    { x: 219, y: 321, value: '3 cm' },
  ],
);

const rightAngleGeometry = {
  origin: { x: 320, y: 320 },
  firstTip: { x: 230, y: 200 },
  secondTip: { x: 480, y: 200 },
  sourceMagnitudesCentimeters: { F1: 3, F2: 4, resultant: 5 },
  angleDegrees: 90,
};
const firstRightVector = subtract(rightAngleGeometry.firstTip, rightAngleGeometry.origin);
const secondRightVector = subtract(rightAngleGeometry.secondTip, rightAngleGeometry.origin);
const rightResult = add(rightAngleGeometry.firstTip, secondRightVector);
const firstUnit = unit(firstRightVector);
const secondUnit = unit(secondRightVector);
const rightAngleSvg = svgFrame(
  'right-angle',
  'محصلة قوتين متعامدتين',
  'شعاعا F₁ وF₂ ينطلقان من O بزاوية قائمة؛ أطوالهما 3 cm و4 cm، والقطر من O إلى M طوله 5 cm.',
  `${line(rightAngleGeometry.firstTip.x, rightAngleGeometry.firstTip.y, rightResult.x, rightResult.y, 'construction-line')}
    ${line(rightAngleGeometry.secondTip.x, rightAngleGeometry.secondTip.y, rightResult.x, rightResult.y, 'construction-line')}
    ${vectorLine('right-angle', rightAngleGeometry.origin, rightAngleGeometry.firstTip, 'teal')}
    ${vectorLine('right-angle', rightAngleGeometry.origin, rightAngleGeometry.secondTip, 'blue')}
    ${vectorLine('right-angle', rightAngleGeometry.origin, rightResult, 'coral')}
    ${rightAngleSquare(rightAngleGeometry.origin, firstUnit, secondUnit, 21)}
    <text x="205" y="268" class="diagram-measure" direction="ltr" text-anchor="middle">3 cm</text>
    <text x="407" y="263" class="diagram-measure" direction="ltr" text-anchor="middle">4 cm</text>
    <text x="330" y="192" class="diagram-measure" direction="ltr" text-anchor="middle">5 cm</text>
    ${forceSymbol(192, 172, { letter: 'F', subscript: '1', color: 'teal' })}
    ${forceSymbol(498, 190, { letter: 'F', subscript: '2', color: 'blue' })}
    ${forceSymbol(394, 57, { letter: 'F', color: 'coral' })}
    ${pointMarker(rightAngleGeometry.origin, 'O')}${pointMarker(rightResult, 'M', { x: 12, y: 6 })}`,
);

/* --- 4. Stage 6: Orthogonal Components & Smooth Inclined Plane ----------- */

const componentsGeometry = {
  origin: { x: 115, y: 320 },
  firstTip: { x: 440, y: 320 },
  secondTip: { x: 115, y: 90 },
  result: { x: 440, y: 90 },
};
const componentsSvg = svgFrame(
  'components',
  'تحليل القوة إلى مركبتين',
  'محورا x وy متعامدان عند O؛ المركبتان على المحورين والقطر يصل O إلى M.',
  `${line(componentsGeometry.origin.x, componentsGeometry.origin.y, 550, 320, 'axis-line', 'marker-end="url(#components-blue-arrow)"')}
    ${line(componentsGeometry.origin.x, componentsGeometry.origin.y, 115, 52, 'axis-line', 'marker-end="url(#components-blue-arrow)"')}
    ${line(componentsGeometry.firstTip.x, componentsGeometry.firstTip.y, componentsGeometry.result.x, componentsGeometry.result.y, 'construction-line')}
    ${line(componentsGeometry.secondTip.x, componentsGeometry.secondTip.y, componentsGeometry.result.x, componentsGeometry.result.y, 'construction-line')}
    ${vectorLine('components', componentsGeometry.origin, componentsGeometry.firstTip, 'teal')}
    ${vectorLine('components', componentsGeometry.origin, componentsGeometry.secondTip, 'blue')}
    ${vectorLine('components', componentsGeometry.origin, componentsGeometry.result, 'coral')}
    ${forceSymbol(452, 344, { letter: 'F', subscript: '1', color: 'teal' })}
    ${forceSymbol(66, 82, { letter: 'F', subscript: '2', color: 'blue' })}
    ${forceSymbol(452, 78, { letter: 'F', color: 'coral' })}
    ${pointMarker(componentsGeometry.origin, 'O')}${pointMarker(componentsGeometry.result, 'M', { x: 12, y: 24 })}
    <text x="565" y="329" class="diagram-axis-label" direction="ltr">x</text>
    <text x="105" y="42" class="diagram-axis-label" direction="ltr">y</text>`,
);

const inclineDeg = 22;
const inclineRad = inclineDeg * Math.PI / 180;
const cosA = Math.cos(inclineRad);
const sinA = Math.sin(inclineRad);
const inclineBase = { x: 68, y: 312 };
const inclineTop = { x: 68 + 476 * cosA, y: 312 - 476 * sinA };
const blockOrigin = { x: 318, y: 184 };
const weightLength = 144;
const f1Length = weightLength * sinA;
const f2Length = weightLength * cosA;
const downPlaneUnit = { x: -cosA, y: sinA };
const intoPlaneUnit = { x: sinA, y: cosA };
const outPlaneUnit = { x: -sinA, y: -cosA };
const weightTip = { x: blockOrigin.x, y: blockOrigin.y + weightLength };
const f1Tip = add(blockOrigin, { x: downPlaneUnit.x * f1Length, y: downPlaneUnit.y * f1Length });
const f2Tip = add(blockOrigin, { x: intoPlaneUnit.x * f2Length, y: intoPlaneUnit.y * f2Length });
const normalTip = add(blockOrigin, { x: outPlaneUnit.x * f2Length, y: outPlaneUnit.y * f2Length });

const inclinedPlaneGeometry = {
  inclineAngleDegrees: inclineDeg,
  origin: blockOrigin,
  weightTip,
  f1Tip,
  f2Tip,
  normalTip,
};

const inclinedPlaneSvg = svgFrame(
  'inclined-plane',
  'القوى المؤثرة على جسم فوق مستو مائل أملس وتحليل قوة ثقله',
  'جسم صلب على مستو مائل أملس يميل عن الأفق بزاوية a؛ يؤثر فيه ثقله w شاقولياً نحو الأسفل ورد فعل المستوي R عمودياً على السطح نحو الأعلى، وتحلل قوة الثقل w إلى مركبتين متعامدتين F₁ موازية للمستوي وF₂ عمودية عليه فيتشكل مستطيل قطره w.',
  `
    ${line(inclineBase.x, inclineBase.y, 558, inclineBase.y, 'axis-line')}
    ${line(inclineBase.x, inclineBase.y, inclineTop.x, inclineTop.y, 'axis-line')}
    <path d="M ${fmt(inclineBase.x + 66)} ${fmt(inclineBase.y)} A 66 66 0 0 0 ${fmt(inclineBase.x + 66 * cosA)} ${fmt(inclineBase.y - 66 * sinA)}" class="angle-arc" />
    <text x="${fmt(inclineBase.x + 82)}" y="${fmt(inclineBase.y - 10)}" class="diagram-measure" direction="ltr">a</text>

    <g transform="translate(${fmt(blockOrigin.x)} ${fmt(blockOrigin.y)}) rotate(${fmt(-inclineDeg)})">
      <rect x="-34" y="-18" width="68" height="36" rx="5" fill="#fde68a" stroke="#b45309" stroke-width="2" />
    </g>

    ${line(blockOrigin.x - downPlaneUnit.x * 130, blockOrigin.y - downPlaneUnit.y * 130, blockOrigin.x + downPlaneUnit.x * 150, blockOrigin.y + downPlaneUnit.y * 150, 'carrier-line')}
    ${line(normalTip.x - outPlaneUnit.x * 16, normalTip.y - outPlaneUnit.y * 16, f2Tip.x + intoPlaneUnit.x * 24, f2Tip.y + intoPlaneUnit.y * 24, 'carrier-line')}

    ${line(f1Tip.x, f1Tip.y, weightTip.x, weightTip.y, 'construction-line')}
    ${line(f2Tip.x, f2Tip.y, weightTip.x, weightTip.y, 'construction-line')}
    ${rightAngleSquare(blockOrigin, downPlaneUnit, intoPlaneUnit, 15)}

    <path d="M ${fmt(blockOrigin.x)} ${fmt(blockOrigin.y + 62)} A 62 62 0 0 0 ${fmt(blockOrigin.x + 62 * sinA)} ${fmt(blockOrigin.y + 62 * cosA)}" class="angle-arc" />
    <text x="${fmt(blockOrigin.x + 15)}" y="${fmt(blockOrigin.y + 82)}" class="diagram-measure" direction="ltr">a</text>

    ${vectorLine('inclined-plane', blockOrigin, normalTip, 'slate')}
    ${vectorLine('inclined-plane', blockOrigin, f1Tip, 'teal')}
    ${vectorLine('inclined-plane', blockOrigin, f2Tip, 'blue')}
    ${vectorLine('inclined-plane', blockOrigin, weightTip, 'coral')}

    ${forceSymbol(normalTip.x + 12, normalTip.y + 8, { letter: 'R', color: 'slate' })}
    ${forceSymbol(f1Tip.x - 42, f1Tip.y + 4, { letter: 'F', subscript: '1', color: 'teal' })}
    ${forceSymbol(f2Tip.x + 14, f2Tip.y + 4, { letter: 'F', subscript: '2', color: 'blue' })}
    ${forceSymbol(weightTip.x - 32, weightTip.y + 8, { letter: 'w', color: 'coral' })}
    ${pointMarker(blockOrigin, 'O', { x: 14, y: -8 })}

  `,
);

/* --- 5. Stage 7: Four Quadrilateral Cases Comparison --------------------- */

const quadrilateralCasesSvg = svgFrame(
  'quadrilateral-cases',
  'مقارنة الأشكال الرباعية الأربعة المنشأة على حاملي قوتين متلاقيتين',
  'أربعة أشكال توضح متى يكون الشكل متوازي أضلاع عاماً، أو مستطيلاً، أو مربعاً، أو معيناً تبعاً للزاوية بين القوتين وتساوي أو اختلاف شدتهما.',
  `
    <g transform="translate(336, 18)">
      <rect x="0" y="0" width="284" height="162" rx="12" fill="#ffffff" stroke="#d8d4ca" />
      <text x="142" y="26" class="diagram-caption-ar" text-anchor="middle" font-weight="700">١. متوازي أضلاع (زاوية غير قائمة، F₁ ≠ F₂)</text>
      ${line(92, 58, 212, 58, 'construction-line')}
      ${line(166, 128, 212, 58, 'construction-line')}
      ${vectorLine('quadrilateral-cases', { x: 46, y: 128 }, { x: 92, y: 58 }, 'teal')}
      ${vectorLine('quadrilateral-cases', { x: 46, y: 128 }, { x: 166, y: 128 }, 'coral')}
      ${vectorLine('quadrilateral-cases', { x: 46, y: 128 }, { x: 212, y: 58 }, 'blue')}
      <text x="142" y="150" class="diagram-caption-ar" text-anchor="middle">الحالة العامة (مثل الفقرة 1 · ص 61)</text>
    </g>

    <g transform="translate(20, 18)">
      <rect x="0" y="0" width="284" height="162" rx="12" fill="#ffffff" stroke="#d8d4ca" />
      <text x="142" y="26" class="diagram-caption-ar" text-anchor="middle" font-weight="700">٢. مستطيل (زاوية قائمة 90°، F₁ ≠ F₂)</text>
      ${line(60, 56, 196, 56, 'construction-line')}
      ${line(196, 128, 196, 56, 'construction-line')}
      ${rightAngleSquare({ x: 60, y: 128 }, { x: 1, y: 0 }, { x: 0, y: -1 }, 13)}
      ${vectorLine('quadrilateral-cases', { x: 60, y: 128 }, { x: 60, y: 56 }, 'teal')}
      ${vectorLine('quadrilateral-cases', { x: 60, y: 128 }, { x: 196, y: 128 }, 'coral')}
      ${vectorLine('quadrilateral-cases', { x: 60, y: 128 }, { x: 196, y: 56 }, 'blue')}
      <text x="142" y="150" class="diagram-caption-ar" text-anchor="middle">فيثاغورث مباشر (الفقرة 2 · ص 61)</text>
    </g>

    <g transform="translate(336, 198)">
      <rect x="0" y="0" width="284" height="162" rx="12" fill="#ffffff" stroke="#d8d4ca" />
      <text x="142" y="26" class="diagram-caption-ar" text-anchor="middle" font-weight="700">٣. مربّع (زاوية قائمة 90°، F₁ = F₂)</text>
      ${line(86, 52, 164, 52, 'construction-line')}
      ${line(164, 130, 164, 52, 'construction-line')}
      ${rightAngleSquare({ x: 86, y: 130 }, { x: 1, y: 0 }, { x: 0, y: -1 }, 13)}
      ${vectorLine('quadrilateral-cases', { x: 86, y: 130 }, { x: 86, y: 52 }, 'teal')}
      ${vectorLine('quadrilateral-cases', { x: 86, y: 130 }, { x: 164, y: 130 }, 'coral')}
      ${vectorLine('quadrilateral-cases', { x: 86, y: 130 }, { x: 164, y: 52 }, 'blue')}
      <text x="142" y="150" class="diagram-caption-ar" text-anchor="middle">تعامد + تساوٍ بالشدة (الفقرة 3 · ص 62)</text>
    </g>

    <g transform="translate(20, 198)">
      <rect x="0" y="0" width="284" height="162" rx="12" fill="#ffffff" stroke="#d8d4ca" />
      <text x="142" y="26" class="diagram-caption-ar" text-anchor="middle" font-weight="700">٤. معيّن (زاوية غير قائمة، F₁ = F₂)</text>
      ${line(110, 56, 198, 56, 'construction-line')}
      ${line(152, 128, 198, 56, 'construction-line')}
      ${vectorLine('quadrilateral-cases', { x: 64, y: 128 }, { x: 110, y: 56 }, 'teal')}
      ${vectorLine('quadrilateral-cases', { x: 64, y: 128 }, { x: 152, y: 128 }, 'coral')}
      ${vectorLine('quadrilateral-cases', { x: 64, y: 128 }, { x: 198, y: 56 }, 'blue')}
      <text x="142" y="150" class="diagram-caption-ar" text-anchor="middle">تساوٍ بالشدة من دون تعامد</text>
    </g>
  `,
);

/* --- 6. Stage 8 / Teacher Area: Scale Drawings for p62 Problems 1 & 2 ---- */

const p1Origin = { x: 300, y: 196 };
const p1Scale = 34; // 1 cm = 34 px, scale 1 cm ↔ 3 N => F1=3cm, F2=4cm, F=5cm, F'=5cm
const p1F1Tip = { x: p1Origin.x + 3 * p1Scale, y: p1Origin.y };
const p1F2Tip = { x: p1Origin.x, y: p1Origin.y - 4 * p1Scale };
const p1FTip = { x: p1Origin.x + 3 * p1Scale, y: p1Origin.y - 4 * p1Scale };
const p1FPrimeTip = { x: p1Origin.x - 3 * p1Scale, y: p1Origin.y + 4 * p1Scale };

const problem1ScaleSvg = svgFrame(
  'problem1-scale',
  'تمثيل المسألة الأولى بمقياس رسم 1 cm لكل 3 N',
  'من النقطة O تنطلق القوتان المتعامدتان F₁ بطول 3 cm (9 N) وF₂ بطول 4 cm (12 N)، والمحصلة F قطر المستطيل بطول 5 cm (15 N) نحو M، وقوة التوازن F′ بطول 5 cm على الحامل نفسه وبجهة معاكسة نحو M′.',
  `
    <rect x="24" y="20" width="188" height="44" rx="9" fill="#eef2f9" stroke="#cbd5e8" />
    <text x="118" y="47" class="diagram-measure" direction="ltr" text-anchor="middle">1 cm : 3 N</text>

    ${line(p1FPrimeTip.x - 18, p1FPrimeTip.y + 24, p1FTip.x + 18, p1FTip.y - 24, 'carrier-line')}
    ${line(p1F1Tip.x, p1F1Tip.y, p1FTip.x, p1FTip.y, 'construction-line')}
    ${line(p1F2Tip.x, p1F2Tip.y, p1FTip.x, p1FTip.y, 'construction-line')}
    ${rightAngleSquare(p1Origin, { x: 1, y: 0 }, { x: 0, y: -1 }, 16)}

    ${vectorLine('problem1-scale', p1Origin, p1F1Tip, 'teal')}
    ${vectorLine('problem1-scale', p1Origin, p1F2Tip, 'blue')}
    ${vectorLine('problem1-scale', p1Origin, p1FTip, 'coral')}
    ${vectorLine('problem1-scale', p1Origin, p1FPrimeTip, 'plum')}

    <text x="${fmt(p1Origin.x + 52)}" y="${fmt(p1Origin.y + 50)}" class="diagram-measure" direction="ltr" text-anchor="middle">3 cm (9 N)</text>
    <text x="${fmt(p1Origin.x - 48)}" y="${fmt(p1Origin.y - 64)}" class="diagram-measure" direction="ltr" text-anchor="middle">4 cm (12 N)</text>
    <text x="${fmt(p1Origin.x + 82)}" y="${fmt(p1Origin.y - 78)}" class="diagram-measure" direction="ltr" text-anchor="middle">5 cm (15 N)</text>
    <text x="${fmt(p1Origin.x - 90)}" y="${fmt(p1Origin.y + 78)}" class="diagram-measure" direction="ltr" text-anchor="middle">5 cm (15 N)</text>

    ${forceSymbol(p1F1Tip.x + 12, p1F1Tip.y + 5, { letter: 'F', subscript: '1', color: 'teal' })}
    ${forceSymbol(p1F2Tip.x - 30, p1F2Tip.y - 8, { letter: 'F', subscript: '2', color: 'blue' })}
    ${forceSymbol(p1FTip.x + 14, p1FTip.y - 4, { letter: 'F', color: 'coral' })}
    ${forceSymbol(p1FPrimeTip.x - 36, p1FPrimeTip.y + 18, { letter: 'F', prime: true, color: 'plum' })}

    ${pointMarker(p1Origin, 'O', { x: 10, y: 22 })}
    ${pointMarker(p1FTip, 'M', { x: -20, y: -8 })}
  `,
);

const p2Origin = { x: 320, y: 312 };
const p2F1Tip = { x: 218, y: 184 }; // length ~163.9? Let's keep exact 3:4:5 at 40 px/cm!
// Exact rotated 3:4:5 right triangle pointing up (carrying a bag upward with two ropes at 90°):
// Let u1 = (-0.8, -0.6) -> length 3*44 = 132 => dx = -105.6, dy = -79.2
// Let u2 = (0.6, -0.8)  -> length 4*44 = 176 => dx = +105.6, dy = -140.8
// Check u1 · u2 = (-0.8)(0.6) + (-0.6)(-0.8) = -0.48 + 0.48 = 0!
// Resultant = (-105.6 + 105.6, -79.2 - 140.8) = (0, -220) = 5 * 44 px straight up!
const bagScale = 44;
const bagOrigin = { x: 320, y: 318 };
const bagF1Tip = { x: bagOrigin.x - 0.8 * 3 * bagScale, y: bagOrigin.y - 0.6 * 3 * bagScale };
const bagF2Tip = { x: bagOrigin.x + 0.6 * 4 * bagScale, y: bagOrigin.y - 0.8 * 4 * bagScale };
const bagFTip = { x: bagOrigin.x, y: bagOrigin.y - 5 * bagScale };

const problem2ScaleSvg = svgFrame(
  'problem2-scale',
  'تمثيل المسألة الثانية (حمل الحقيبة) بمقياس رسم 1 cm لكل 10 N',
  'من النقطة O تنطلق قوتا الحبلين المتعامدتين: F₁ بطول 3 cm (30 N) وF₂ بطول 4 cm (40 N)، ويكتمل المستطيل فيكون القطر OM بطول 5 cm يمثل محصلة شدتها 50 N.',
  `
    <rect x="24" y="20" width="196" height="44" rx="9" fill="#eef2f9" stroke="#cbd5e8" />
    <text x="122" y="47" class="diagram-measure" direction="ltr" text-anchor="middle">1 cm : 10 N</text>

    ${line(bagF1Tip.x, bagF1Tip.y, bagFTip.x, bagFTip.y, 'construction-line')}
    ${line(bagF2Tip.x, bagF2Tip.y, bagFTip.x, bagFTip.y, 'construction-line')}
    ${rightAngleSquare(bagOrigin, { x: -0.8, y: -0.6 }, { x: 0.6, y: -0.8 }, 18)}

    ${vectorLine('problem2-scale', bagOrigin, bagF1Tip, 'teal')}
    ${vectorLine('problem2-scale', bagOrigin, bagF2Tip, 'blue')}
    ${vectorLine('problem2-scale', bagOrigin, bagFTip, 'coral')}

    <text x="${fmt(bagOrigin.x - 90)}" y="${fmt(bagOrigin.y - 7)}" class="diagram-measure" direction="ltr" text-anchor="middle">3 cm (30 N)</text>
    <text x="${fmt(bagOrigin.x + 88)}" y="${fmt(bagOrigin.y - 58)}" class="diagram-measure" direction="ltr" text-anchor="middle">4 cm (40 N)</text>
    <text x="${fmt(bagOrigin.x + 42)}" y="${fmt(bagOrigin.y - 118)}" class="diagram-measure" direction="ltr" text-anchor="middle">5 cm (50 N)</text>

    ${forceSymbol(bagF1Tip.x - 36, bagF1Tip.y - 6, { letter: 'F', subscript: '1', color: 'teal' })}
    ${forceSymbol(bagF2Tip.x + 14, bagF2Tip.y - 4, { letter: 'F', subscript: '2', color: 'blue' })}
    ${forceSymbol(bagFTip.x - 32, bagFTip.y - 8, { letter: 'F', color: 'coral' })}

    ${pointMarker(bagOrigin, 'O', { x: 10, y: 24 })}
    ${pointMarker(bagFTip, 'M', { x: 12, y: 4 })}
  `,
);

const DIAGRAMS = {
  'force-vector-anatomy': {
    title: 'بطاقة قراءة متجه القوة ومقياس الرسم',
    platformNote: 'رسم تعليمي من المنصة يوضّح كيف نقرأ عناصر متجه القوة الأربعة من السهم المرسوم.',
    description: 'نقطة التأثير O في بداية السهم، والحامل هو المستقيم المتقطع الممتد، والجهة نحو رأس السهم M، والشدة تساوي طول السهم مضروباً في مقياس الرسم.',
    svg: vectorAnatomySvg,
    geometry: { origin: { x: 170, y: 248.667 }, tip: { x: 454.605, y: 153.798 } },
    legend: [{ symbol: V_F, color: 'blue' }],
  },
  'parachutist-vectors': {
    title: 'تلاقي حوامل قوى الشدّ وثقل المظليّ',
    platformNote: 'رسم تخطيطي تفسيري من المنصة لمشهد المظلي في الصفحة 55 (الأطوال توضيحية؛ لا يورد الكتاب قياسات عددية للحبال).',
    description: 'حبال المظلة تجتمع عند عقدة الربط بحمّالة المظلي، فتمتد حوامل قوى الشد وحامل قوة الثقل الشاقولية لتلتقي في منطقة التقاء مشتركة O.',
    svg: parachutistSvg,
    geometry: { origin: { x: 320, y: 226 } },
    legend: [
      { symbol: V_F1, color: 'blue' },
      { symbol: V_F2, color: 'teal' },
      { symbol: V_W, color: 'coral' },
    ],
  },
  concurrent: {
    title: 'القوى المتلاقية عند O',
    platformNote: 'إعادة رسم تخطيطية من المنصة لخطوط القوى وحواملها الظاهرة في الصفحة 56.',
    description: 'اتجاهات الأسهم واضحة، وحوامل القوى الثلاث تمر بالنقطة المشتركة O.',
    svg: concurrentSvg,
    geometry: concurrentGeometry,
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
      { symbol: V_W, color: 'coral' },
    ],
  },
  'concurrent-comparison': {
    title: 'متى تكون القوى متلاقية ومتى لا تكون؟',
    platformNote: 'رسم مقارن من المنصة يعالج الخطأ الشائع حول الخلط بين تقاطع الأسهم وتلاقي امتدادات الحوامل.',
    description: 'العبرة بتلاقي الخطوط المستقيمة الحاملة للقوى في نقطة واحدة O، لا بتلامس الأسهم المرسومة.',
    svg: concurrentComparisonSvg,
    geometry: { concurrentOrigin: { x: 478, y: 192 } },
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
      { symbol: V_W, color: 'coral' },
    ],
  },
  'equilibrium-parallelogram': {
    title: 'محصلة قوتي الشدّ تعاكس قوة الثقل عند التوازن',
    platformNote: 'رسم تخطيطي من المنصة يربط تجربة الصفحة 56 بإنشاء متوازي الأضلاع في الصفحة 57.',
    description: 'قطر متوازي الأضلاع المنشأ على F₁ وF₂ يمثل محصلتهما F، وعند توازن الجسم المعلق تنطبق حاملته على حامل الثقل w ويعاكسه مباشرة بالجهة ويساويه بالشدة.',
    svg: equilibriumParallelogramSvg,
    geometry: { origin: { x: 320, y: 200 }, result: { x: 320, y: 52 } },
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
      { symbol: V_F, color: 'plum' },
      { symbol: V_W, color: 'coral' },
    ],
  },
  parallelogram: {
    title: 'متوازي الأضلاع وقطره',
    platformNote: 'إعادة رسم تخطيطية من المنصة لبناء متوازي الأضلاع والقطر المار من O إلى M.',
    description: 'القوتان من O، والقطر O إلى M هو القطر المنطلق من نقطة التأثير المشتركة.',
    svg: parallelogramDrawing.svg,
    geometry: { ...parallelogramGeometry, result: parallelogramDrawing.result },
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'coral' },
      { symbol: V_F, color: 'blue' },
    ],
  },
  'oblique-example': {
    title: 'الرسم السلمي للمثال ذي الزاوية 60°',
    platformNote: 'إعادة رسم تخطيطية من المنصة: النسبة الهندسية للشعاعين 4:3 والزاوية 60°. الرسم لا يقيس القطر بديلاً عن نص الكتاب؛ القيمة التقريبية المطبوعة في الكتاب (6 cm أي 6 N) تبقى المرجع.',
    description: 'شعاعا F₁ وF₂ من O، مع متوازي الأضلاع وقطر OM؛ أطوال الشعاعين موضّحة بالسنتيمتر.',
    svg: obliqueDrawing.svg,
    geometry: { ...obliqueGeometry, result: obliqueDrawing.result },
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'coral' },
      { symbol: V_F, color: 'blue' },
    ],
  },
  'right-angle-resultant': {
    title: 'إنشاء المستطيل والقطر OM',
    platformNote: 'إعادة رسم تخطيطية من المنصة للمستطيل والمثلث القائم ذي أطوال 3 cm و4 cm و5 cm الواردة في المثال.',
    description: 'الشعاعان المتعامدان بطولي 3 cm و4 cm، والقطر OM بطول 5 cm وفق بناء المثال.',
    svg: rightAngleSvg,
    geometry: { ...rightAngleGeometry, result: rightResult },
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
      { symbol: V_F, color: 'coral' },
    ],
  },
  'components-xy': {
    title: 'المحوران x وy ومركبتا القوة',
    platformNote: 'رسم تخطيطي من المنصة للبناء الهندسي الواضح في شكل تحليل القوة بالصفحتين 59–60.',
    description: 'محور x أفقي ومحور y عمودي ينطلقان من O؛ المركبتان على المحورين والقطر يصل إلى M.',
    svg: componentsSvg,
    geometry: componentsGeometry,
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
      { symbol: V_F, color: 'coral' },
    ],
  },
  'inclined-plane': {
    title: 'تحليل قوة الثقل على مستوٍ مائل أملس',
    platformNote: 'إعادة رسم تعليمية من المنصة لشكل نشاط الصفحة 60 تبين القوى المؤثرة على الجسم الصلب ومركّبتي قوة الثقل المتعامدتين.',
    description: 'يخضع الجسم لقوة ثقله w الشاقولية نحو الأسفل ولرد فعل المستوي الأملس R العمودي على السطح؛ ويُحلَّل الثقل w إلى مركبة موازية للمستوي F₁ تسبب الانزلاق ومركبة عمودية عليه F₂ تضغط على السطح، فيتشكل مستطيل قطره w.',
    svg: inclinedPlaneSvg,
    geometry: inclinedPlaneGeometry,
    legend: [
      { symbol: V_W, color: 'coral' },
      { symbol: V_R, color: 'slate' },
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
    ],
  },
  'quadrilateral-cases': {
    title: 'متى يكون الشكل متوازي أضلاع أو مستطيلاً أو مربعاً أو معيناً؟',
    platformNote: 'ملخص بصري مقارن من المنصة يربط الزاوية والشدتين بنوع الشكل الرباعي المنشأ على القوتين.',
    description: 'الزاوية القائمة تحول متوازي الأضلاع إلى مستطيل، وتساوي الشدتين مع التعامد يحوله إلى مربع، أما تساوي الشدتين بزاوية غير قائمة فيعطي معيناً.',
    svg: quadrilateralCasesSvg,
    geometry: {},
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'coral' },
      { symbol: V_F, color: 'blue' },
    ],
  },
  'problem1-scale': {
    title: 'الرسم القياسي للمسألة الأولى (ص 62)',
    platformNote: 'رسم قياسي من المنصة بمقياس مختار 1 cm : 3 N يمثل القوى الأربع (F₁, F₂, F, F′).',
    description: 'شعاع F₁ بطول 3 cm، وشعاع F₂ بطول 4 cm متعامدان في O، والمحصلة F بطول 5 cm، وقوة الموازنة F′ بطول 5 cm على الحامل نفسه وبجهة معاكسة.',
    svg: problem1ScaleSvg,
    geometry: { origin: p1Origin, f1Tip: p1F1Tip, f2Tip: p1F2Tip, fTip: p1FTip, fPrimeTip: p1FPrimeTip },
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
      { symbol: V_F, color: 'coral' },
      { symbol: V_F_PRIME, color: 'plum' },
    ],
  },
  'problem2-scale': {
    title: 'الرسم القياسي للمسألة الثانية — حمل الحقيبة (ص 62)',
    platformNote: 'رسم قياسي من المنصة بمقياس مختار 1 cm : 10 N يمثل قوتي الحبلين المتعامدتين ومحصلتهما.',
    description: 'شعاع القوة الأولى بطول 3 cm (30 N)، وشعاع القوة الثانية بطول 4 cm (40 N) بينهما زاوية 90°، وقطر المستطيل OM بطول 5 cm يمثل محصلة شدتها 50 N.',
    svg: problem2ScaleSvg,
    geometry: { origin: bagOrigin, f1Tip: bagF1Tip, f2Tip: bagF2Tip, fTip: bagFTip },
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
      { symbol: V_F, color: 'coral' },
    ],
  },
};

export { DIAGRAMS };
