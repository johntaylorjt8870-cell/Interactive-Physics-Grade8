import { V_F1, V_F2, V_F, V_W } from './math.js';

const fmt = (value) => String(Number(value.toFixed(3)));
const add = (point, vector) => ({ x: point.x + vector.x, y: point.y + vector.y });
const subtract = (end, start) => ({ x: end.x - start.x, y: end.y - start.y });
const length = (vector) => Math.hypot(vector.x, vector.y);
const unit = (vector) => {
  const magnitude = length(vector);
  return { x: vector.x / magnitude, y: vector.y / magnitude };
};
const sum = (first, second) => ({ x: first.x + second.x, y: first.y + second.y });

const MARKER_COLORS = {
  blue: '#536fc4',
  teal: '#1b9e9a',
  coral: '#db7059',
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

function pointMarker(pointValue, label) {
  return `<g class="point-marker">
    <circle cx="${fmt(pointValue.x)}" cy="${fmt(pointValue.y)}" r="5" />
    <text x="${fmt(pointValue.x - 14)}" y="${fmt(pointValue.y + 24)}" class="diagram-point-label" direction="ltr">${label}</text>
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
  const bisector = unit(sum(firstUnit, secondUnit));
  const label = add(origin, { x: bisector.x * (radius + 23), y: bisector.y * (radius + 23) });
  return `<path d="M ${fmt(start.x)} ${fmt(start.y)} A ${fmt(radius)} ${fmt(radius)} 0 0 0 ${fmt(end.x)} ${fmt(end.y)}" class="angle-arc" />
    <text x="${fmt(label.x)}" y="${fmt(label.y)}" class="diagram-measure" direction="ltr" text-anchor="middle">${angleDegrees}°</text>`;
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
  return {
    svg: svgFrame(id, title, description, `${construction}
      ${vectorLine(id, origin, firstTip, 'teal')}
      ${vectorLine(id, origin, secondTip, 'coral')}
      ${vectorLine(id, origin, result, 'blue')}
      ${angle}${labels}
      ${pointMarker(origin, 'O')}${resultLabel}`),
    result,
  };
}

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
    ${pointMarker(concurrentGeometry.origin, 'O')}`,
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
const rightAngleMarkerSize = 21;
const firstUnit = unit(firstRightVector);
const secondUnit = unit(secondRightVector);
const rightAngleA = add(rightAngleGeometry.origin, { x: firstUnit.x * rightAngleMarkerSize, y: firstUnit.y * rightAngleMarkerSize });
const rightAngleC = add(rightAngleGeometry.origin, { x: (firstUnit.x + secondUnit.x) * rightAngleMarkerSize, y: (firstUnit.y + secondUnit.y) * rightAngleMarkerSize });
const rightAngleB = add(rightAngleGeometry.origin, { x: secondUnit.x * rightAngleMarkerSize, y: secondUnit.y * rightAngleMarkerSize });
const rightAngleSvg = svgFrame(
  'right-angle',
  'محصلة قوتين متعامدتين',
  'شعاعا F₁ وF₂ ينطلقان من O بزاوية قائمة؛ أطوالهما 3 cm و4 cm، والقطر من O إلى M طوله 5 cm.',
  `${line(rightAngleGeometry.firstTip.x, rightAngleGeometry.firstTip.y, rightResult.x, rightResult.y, 'construction-line')}
    ${line(rightAngleGeometry.secondTip.x, rightAngleGeometry.secondTip.y, rightResult.x, rightResult.y, 'construction-line')}
    ${vectorLine('right-angle', rightAngleGeometry.origin, rightAngleGeometry.firstTip, 'teal')}
    ${vectorLine('right-angle', rightAngleGeometry.origin, rightAngleGeometry.secondTip, 'blue')}
    ${vectorLine('right-angle', rightAngleGeometry.origin, rightResult, 'coral')}
    <path d="M ${fmt(rightAngleA.x)} ${fmt(rightAngleA.y)} L ${fmt(rightAngleC.x)} ${fmt(rightAngleC.y)} L ${fmt(rightAngleB.x)} ${fmt(rightAngleB.y)}" class="right-angle-mark" />
    <text x="205" y="268" class="diagram-measure" direction="ltr" text-anchor="middle">3 cm</text>
    <text x="407" y="263" class="diagram-measure" direction="ltr" text-anchor="middle">4 cm</text>
    <text x="362" y="184" class="diagram-measure" direction="ltr" text-anchor="middle">5 cm</text>
    ${pointMarker(rightAngleGeometry.origin, 'O')}${pointMarker(rightResult, 'M')}`,
);

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
    ${pointMarker(componentsGeometry.origin, 'O')}${pointMarker(componentsGeometry.result, 'M')}
    <text x="565" y="329" class="diagram-axis-label" direction="ltr">x</text>
    <text x="105" y="42" class="diagram-axis-label" direction="ltr">y</text>`,
);

const DIAGRAMS = {
  concurrent: {
    title: 'القوى المتلاقية عند O',
    platformNote: 'إعادة رسم تخطيطية من المنصة لخطوط القوى الظاهرة في الصفحة 56؛ لا تحاكي شكل الجهاز أو الصورة حرفياً.',
    description: 'اتجاهات الأسهم واضحة، وحوامل القوى الثلاث تمر بالنقطة O.',
    svg: concurrentSvg,
    geometry: concurrentGeometry,
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
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
    platformNote: 'إعادة رسم تخطيطية من المنصة: النسبة الهندسية للشعاعين 4:3 والزاوية 60°. الرسم لا يقيس القطر؛ القيمة التقريبية المطبوعة في الكتاب تبقى المرجع.',
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
    platformNote: 'إعادة رسم تخطيطية من المنصة للمثلث القائم ذي أطوال 3 cm و4 cm و5 cm الواردة في المثال.',
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
    platformNote: 'رسم تخطيطي من المنصة للبناء الهندسي الواضح في شكل تحليل القوة بالصفحة 59.',
    description: 'محور x أفقي ومحور y عمودي ينطلقان من O؛ المركبتان على المحورين والقطر يصل إلى M.',
    svg: componentsSvg,
    geometry: componentsGeometry,
    legend: [
      { symbol: V_F1, color: 'teal' },
      { symbol: V_F2, color: 'blue' },
      { symbol: V_F, color: 'coral' },
    ],
  },
};

export { DIAGRAMS };
