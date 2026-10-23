import { V_F, V_F1, V_F2, V_F3, V_W } from './math.js';

const COLORS = Object.freeze({
  f1: '#0f766e',
  f2: '#1d4ed8',
  result: '#c2410c',
  weight: '#b45309',
  spring: '#7c3aed',
  bar: '#334155',
  carrier: '#94a3b8',
  dim: '#64748b',
  ink: '#134e4a',
  paper: '#f8fafc',
});

const fmt = (value) => String(Number(Number(value).toFixed(2)));

function markerDefs(prefix) {
  const items = [
    ['f1', COLORS.f1],
    ['f2', COLORS.f2],
    ['result', COLORS.result],
    ['weight', COLORS.weight],
    ['spring', COLORS.spring],
  ];
  return `<defs>${items.map(([name, color]) => `
    <marker id="${prefix}-${name}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0 L10 5 L0 10 z" fill="${color}" />
    </marker>`).join('')}
  </defs>`;
}

function svgFrame(id, title, description, body, viewBox = '0 0 720 380') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="${id}-title ${id}-desc">
    <title id="${id}-title">${title}</title>
    <desc id="${id}-desc">${description}</desc>
    ${markerDefs(id)}
    <rect x="0" y="0" width="100%" height="100%" fill="${COLORS.paper}" rx="12" />
    ${body}
  </svg>`;
}

const line = (x1, y1, x2, y2, extra) =>
  `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(y2)}" ${extra} />`;

function forceArrow(prefix, x, yStart, yEnd, kind) {
  return line(x, yStart, x, yEnd, `class="l2-force l2-force-${kind}" marker-end="url(#${prefix}-${kind})"`);
}

function carrier(x, y1, y2) {
  return line(x, y1, x, y2, 'class="l2-carrier"');
}

function bar(x, y, width, height = 16) {
  return `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" rx="6" class="l2-bar" />`;
}

function point(x, y, label, dy = 26) {
  return `<g class="l2-point">
    <circle cx="${fmt(x)}" cy="${fmt(y)}" r="5" />
    <text x="${fmt(x)}" y="${fmt(y + dy)}" class="l2-point-label" text-anchor="middle" direction="ltr">${label}</text>
  </g>`;
}

function forceLabel(x, y, text, kind = 'ink') {
  return `<text x="${fmt(x)}" y="${fmt(y)}" class="l2-force-label l2-force-label-${kind}" text-anchor="middle" direction="ltr">${text}</text>`;
}

function dimLabel(x, y, text) {
  return `<text x="${fmt(x)}" y="${fmt(y)}" class="l2-dim-label" text-anchor="middle" direction="ltr">${text}</text>`;
}

function dimension(x1, x2, y, label) {
  const mid = (x1 + x2) / 2;
  return `<g class="l2-dimension">
    ${line(x1, y, x2, y, 'class="l2-dim-line"')}
    ${line(x1, y - 6, x1, y + 6, 'class="l2-dim-tick"')}
    ${line(x2, y - 6, x2, y + 6, 'class="l2-dim-tick"')}
    ${dimLabel(mid, y - 10, label)}
  </g>`;
}

const swingSvg = svgFrame(
  'swing-scene',
  'أرجوحة معلّقة بسلسلتين',
  'مقعد أرجوحة معلّق بسلسلتين شاقوليتين تقريباً، وقوتا الشد إلى أعلى على حاملين متوازيين، وثقل المقعد إلى أسفل.',
  `
  <line x1="210" y1="46" x2="210" y2="168" class="l2-chain" />
  <line x1="430" y1="46" x2="430" y2="168" class="l2-chain" />
  <rect x="188" y="38" width="44" height="12" rx="3" class="l2-support" />
  <rect x="408" y="38" width="44" height="12" rx="3" class="l2-support" />
  <rect x="186" y="168" width="268" height="18" rx="6" class="l2-bar" />
  ${carrier(210, 30, 300)}
  ${carrier(430, 30, 300)}
  ${forceArrow('swing-scene', 210, 168, 78, 'f1')}
  ${forceArrow('swing-scene', 430, 168, 78, 'f2')}
  ${forceArrow('swing-scene', 320, 186, 292, 'weight')}
  ${forceLabel(178, 72, 'F₁', 'f1')}
  ${forceLabel(462, 72, 'F₂', 'f2')}
  ${forceLabel(348, 304, 'w', 'weight')}
  ${point(320, 177, 'O', 28)}
  `,
);

const wagonSvg = svgFrame(
  'wagon-scene',
  'حصانان يشدّان عربة بقوتين متوازيتين',
  'سهمان متوازيان بجهة واحدة يمثّلان شد الحصانين للعربة، وحاملا القوتين مستقيمان متوازيان لا يتقاطعان.',
  `
  <rect x="300" y="150" width="250" height="90" rx="10" class="l2-wagon" />
  <circle cx="340" cy="248" r="18" class="l2-wheel" />
  <circle cx="510" cy="248" r="18" class="l2-wheel" />
  ${carrier(140, 70, 300)}
  ${carrier(220, 70, 300)}
  ${forceArrow('wagon-scene', 140, 196, 86, 'f1')}
  ${forceArrow('wagon-scene', 220, 196, 86, 'f2')}
  ${line(140, 196, 300, 196, 'class="l2-trace"')}
  ${line(220, 196, 300, 176, 'class="l2-trace"')}
  ${forceLabel(140, 72, 'F₁', 'f1')}
  ${forceLabel(220, 72, 'F₂', 'f2')}
  <text x="425" y="204" class="l2-caption" text-anchor="middle">العربة</text>
  `,
);

const singleSpringSvg = svgFrame(
  'single-spring',
  'جسم معلّق في ربيعة واحدة',
  'ربيعة شاقولية يتدلى منها جسم، وقوة ثقله w نحو الأسفل على حامل شاقولي.',
  `
  <rect x="330" y="36" width="60" height="14" rx="3" class="l2-support" />
  <rect x="348" y="50" width="24" height="70" rx="6" class="l2-spring-body" />
  ${carrier(360, 30, 330)}
  ${forceArrow('single-spring', 360, 154, 280, 'weight')}
  <rect x="338" y="132" width="44" height="28" rx="4" class="l2-mass" />
  ${forceLabel(392, 272, 'w', 'weight')}
  <text x="360" y="350" class="l2-caption" text-anchor="middle">الحامل شاقولي · الجهة إلى أسفل</text>
  `,
);

const twoSpringBarSvg = svgFrame(
  'two-spring-bar',
  'مسطرة أفقية معلّقة بربيعتين وثقل عند C',
  'قوتا شد الربيعتين F1 و F2 إلى أعلى عند الطرفين، وثقل الجسم w إلى أسفل عند النقطة C، والحوامل الثلاثة شاقولية متوازية.',
  `
  <rect x="148" y="36" width="44" height="12" rx="3" class="l2-support" />
  <rect x="528" y="36" width="44" height="12" rx="3" class="l2-support" />
  <rect x="162" y="48" width="16" height="78" rx="5" class="l2-spring-body" />
  <rect x="542" y="48" width="16" height="78" rx="5" class="l2-spring-body" />
  ${carrier(170, 28, 330)}
  ${carrier(360, 28, 330)}
  ${carrier(550, 28, 330)}
  ${bar(150, 148, 420, 18)}
  ${forceArrow('two-spring-bar', 170, 148, 70, 'f2')}
  ${forceArrow('two-spring-bar', 550, 148, 70, 'f1')}
  ${forceArrow('two-spring-bar', 360, 166, 278, 'weight')}
  <rect x="338" y="166" width="44" height="26" rx="4" class="l2-mass" />
  ${forceLabel(142, 64, 'F₂', 'f2')}
  ${forceLabel(582, 64, 'F₁', 'f1')}
  ${forceLabel(392, 290, 'w', 'weight')}
  ${point(360, 157, 'C', 22)}
  `,
  '0 0 720 360',
);

const parallelDefinitionSvg = svgFrame(
  'parallel-definition',
  'تعريف القوى المتوازية: ثلاثة حوامل مستقيمة متوازية',
  'ثلاثة مستقيمات شاقولية متوازية تمثّل حوامل F2 إلى أعلى، و w إلى أسفل، و F1 إلى أعلى. الخطوط لا تتقاطع.',
  `
  ${carrier(180, 30, 340)}
  ${carrier(360, 30, 340)}
  ${carrier(540, 30, 340)}
  ${forceArrow('parallel-definition', 180, 200, 70, 'f2')}
  ${forceArrow('parallel-definition', 540, 200, 70, 'f1')}
  ${forceArrow('parallel-definition', 360, 200, 310, 'weight')}
  ${forceLabel(150, 64, 'F₂', 'f2')}
  ${forceLabel(574, 64, 'F₁', 'f1')}
  ${forceLabel(392, 322, 'w', 'weight')}
  `,
  '0 0 720 360',
);

const sameSenseExperimentSvg = svgFrame(
  'same-sense-experiment',
  'تجربة محصلة قوتين متوازيتين بجهة واحدة',
  'مسطرة A–C–B: الثقل W1 إلى أسفل عند A، والثقل W2 إلى أسفل عند B، والربيعة F3 إلى أعلى عند C.',
  `
  <rect x="328" y="28" width="44" height="12" rx="3" class="l2-support" />
  <rect x="342" y="40" width="16" height="70" rx="5" class="l2-spring-body" />
  ${carrier(160, 40, 330)}
  ${carrier(350, 24, 330)}
  ${carrier(540, 40, 330)}
  ${bar(140, 132, 420, 16)}
  ${forceArrow('same-sense-experiment', 350, 110, 48, 'spring')}
  ${forceArrow('same-sense-experiment', 160, 148, 250, 'weight')}
  ${forceArrow('same-sense-experiment', 540, 148, 268, 'weight')}
  <rect x="142" y="250" width="36" height="28" rx="4" class="l2-mass" />
  <rect x="522" y="268" width="36" height="28" rx="4" class="l2-mass" />
  ${forceLabel(382, 46, 'F₃', 'spring')}
  ${forceLabel(128, 268, 'W₁', 'weight')}
  ${forceLabel(580, 286, 'W₂', 'weight')}
  ${point(160, 140, 'A', 22)}
  ${point(350, 140, 'C', 22)}
  ${point(540, 140, 'B', 22)}
  `,
);

const sameSenseConstructionSvg = svgFrame(
  'same-sense-construction',
  'رسم حوامل التجربة والقوة F المعاكسة لـ F3',
  'A يساراً و B يميناً و C بينهما. F1 و F2 إلى أسفل، F3 إلى أعلى عند C، والمحصلة F إلى أسفل معاكسة لـ F3. المسافات d1 = CA و d2 = CB و d = AB.',
  `
  ${carrier(150, 24, 350)}
  ${carrier(360, 24, 350)}
  ${carrier(560, 24, 350)}
  ${bar(130, 168, 450, 14)}
  ${forceArrow('same-sense-construction', 360, 168, 46, 'spring')}
  ${forceArrow('same-sense-construction', 150, 182, 280, 'f1')}
  ${forceArrow('same-sense-construction', 560, 182, 300, 'f2')}
  ${forceArrow('same-sense-construction', 360, 182, 318, 'result')}
  ${forceLabel(386, 44, 'F₃', 'spring')}
  ${forceLabel(118, 292, 'F₁', 'f1')}
  ${forceLabel(592, 312, 'F₂', 'f2')}
  ${forceLabel(386, 336, 'F', 'result')}
  ${point(150, 175, 'A', 20)}
  ${point(360, 175, 'C', 20)}
  ${point(560, 175, 'B', 20)}
  ${dimension(150, 360, 88, 'd₁')}
  ${dimension(360, 560, 88, 'd₂')}
  ${dimension(150, 560, 64, 'd')}
  `,
);

const sameSenseResultantSvg = svgFrame(
  'same-sense',
  'محصلة قوتين متوازيتين بجهة واحدة',
  'B يساراً بقوة F2 إلى أعلى، و A يميناً بقوة F1 إلى أعلى، والمحصلة F إلى أعلى عند C بينهما وأقرب إلى القوة الأكبر F2. d2 بين B و C، و d1 بين C و A.',
  `
  ${carrier(150, 28, 330)}
  ${carrier(330, 28, 330)}
  ${carrier(560, 28, 330)}
  ${bar(130, 200, 450, 16)}
  ${forceArrow('same-sense', 150, 200, 96, 'f2')}
  ${forceArrow('same-sense', 560, 200, 128, 'f1')}
  ${forceArrow('same-sense', 330, 200, 58, 'result')}
  ${forceLabel(118, 88, 'F₂', 'f2')}
  ${forceLabel(592, 120, 'F₁', 'f1')}
  ${forceLabel(356, 50, 'F', 'result')}
  ${point(150, 208, 'B', 24)}
  ${point(330, 208, 'C', 24)}
  ${point(560, 208, 'A', 24)}
  ${dimension(150, 330, 268, 'd₂')}
  ${dimension(330, 560, 268, 'd₁')}
  ${dimension(150, 560, 302, 'd')}
  `,
);

const workedSameSvg = svgFrame(
  'worked-same',
  'تطبيق محلول: F1 = 20 N و F2 = 30 N على ساق طولها 0.5 m',
  'F2 = 30 N إلى أعلى عند B، و F1 = 20 N إلى أعلى عند A، والمحصلة F = 50 N إلى أعلى عند C على بعد d2 = 0.2 m من B و d1 = 0.3 m من A.',
  `
  ${carrier(140, 24, 330)}
  ${carrier(300, 24, 330)}
  ${carrier(560, 24, 330)}
  ${bar(120, 200, 460, 16)}
  ${forceArrow('worked-same', 140, 200, 88, 'f2')}
  ${forceArrow('worked-same', 560, 200, 132, 'f1')}
  ${forceArrow('worked-same', 300, 200, 48, 'result')}
  ${forceLabel(96, 80, 'F₂ = 30 N', 'f2')}
  ${forceLabel(600, 124, 'F₁ = 20 N', 'f1')}
  ${forceLabel(330, 40, 'F = 50 N', 'result')}
  ${point(140, 208, 'B', 24)}
  ${point(300, 208, 'C', 24)}
  ${point(560, 208, 'A', 24)}
  ${dimension(140, 300, 270, 'd₂ = 0.2 m')}
  ${dimension(300, 560, 270, 'd₁ = 0.3 m')}
  ${dimension(140, 560, 308, 'd = 0.5 m')}
  `,
);

const oppositeSenseSvg = svgFrame(
  'opposite-sense',
  'محصلة قوتين متوازيتين بجهتين متعاكستين',
  'F1 إلى أعلى عند A، و F2 الأكبر إلى أسفل عند B، والمحصلة F إلى أسفل عند C خارج القطعة AB ومن جهة القوة الأكبر. d1 بين C و A عبر B، و d2 بين C و B.',
  `
  ${carrier(110, 24, 350)}
  ${carrier(300, 24, 350)}
  ${carrier(560, 24, 350)}
  ${bar(280, 176, 300, 16)}
  ${forceArrow('opposite-sense', 560, 176, 64, 'f1')}
  ${forceArrow('opposite-sense', 300, 192, 310, 'f2')}
  ${forceArrow('opposite-sense', 110, 192, 330, 'result')}
  ${forceLabel(592, 58, 'F₁', 'f1')}
  ${forceLabel(332, 328, 'F₂', 'f2')}
  ${forceLabel(138, 348, 'F', 'result')}
  ${point(110, 184, 'C', 22)}
  ${point(300, 184, 'B', 22)}
  ${point(560, 184, 'A', 22)}
  ${dimension(110, 300, 86, 'd₂')}
  ${dimension(300, 560, 54, 'd')}
  `,
);

const workedOppositeSvg = svgFrame(
  'worked-opposite',
  'تطبيق محلول: F1 = 200 N و F2 = 300 N والبعد 60 cm',
  'F1 = 200 N إلى أعلى عند A، و F2 = 300 N إلى أسفل عند B، والمحصلة F = 100 N إلى أسفل عند C خارج القطعة من جهة F2. d1 = 180 cm من C إلى A.',
  `
  ${carrier(90, 24, 350)}
  ${carrier(300, 24, 350)}
  ${carrier(560, 24, 350)}
  ${bar(280, 176, 300, 16)}
  ${forceArrow('worked-opposite', 560, 176, 70, 'f1')}
  ${forceArrow('worked-opposite', 300, 192, 308, 'f2')}
  ${forceArrow('worked-opposite', 90, 192, 328, 'result')}
  ${forceLabel(600, 64, 'F₁ = 200 N', 'f1')}
  ${forceLabel(338, 326, 'F₂ = 300 N', 'f2')}
  ${forceLabel(118, 348, 'F = 100 N', 'result')}
  ${point(90, 184, 'C', 22)}
  ${point(300, 184, 'B', 22)}
  ${point(560, 184, 'A', 22)}
  ${dimension(90, 300, 86, 'd₂ = 120 cm')}
  ${dimension(300, 560, 54, 'd = 60 cm')}
  <text x="325" y="368" class="l2-caption" text-anchor="middle" direction="ltr">d₁ = CA = 180 cm</text>
  `,
);

const problem1Svg = svgFrame(
  'problem-1',
  'المسألة الأولى ص 70: قوتان بجهة واحدة 40 N و 10 N',
  'F1 = 40 N إلى أعلى عند الطرف الأقرب للمحصلة، و F2 = 10 N إلى أعلى عند الطرف الآخر، و F = 50 N بينهما على بعد 30 cm من القوة الأكبر و 120 cm من الأصغر.',
  `
  ${carrier(150, 28, 330)}
  ${carrier(270, 28, 330)}
  ${carrier(580, 28, 330)}
  ${bar(130, 200, 470, 16)}
  ${forceArrow('problem-1', 150, 200, 70, 'f1')}
  ${forceArrow('problem-1', 580, 200, 150, 'f2')}
  ${forceArrow('problem-1', 270, 200, 48, 'result')}
  ${forceLabel(110, 62, 'F₁ = 40 N', 'f1')}
  ${forceLabel(610, 142, 'F₂ = 10 N', 'f2')}
  ${forceLabel(300, 40, 'F = 50 N', 'result')}
  ${point(150, 208, 'A', 24)}
  ${point(270, 208, 'C', 24)}
  ${point(580, 208, 'B', 24)}
  ${dimension(150, 270, 270, 'd₁ = 30 cm')}
  ${dimension(270, 580, 270, 'd₂ = 120 cm')}
  ${dimension(150, 580, 308, 'd = 150 cm')}
  `,
);

const problem2Svg = svgFrame(
  'problem-2',
  'المسألة الثانية ص 70: قوتان متعاكستان 80 N و 20 N',
  'F1 = 80 N إلى أعلى عند A، و F2 = 20 N إلى أسفل عند B، والمحصلة F = 60 N إلى أعلى خارج القطعة من جهة القوة الأكبر. البعد بين الحاملين 40 cm.',
  `
  ${carrier(120, 24, 350)}
  ${carrier(250, 24, 350)}
  ${carrier(540, 24, 350)}
  ${bar(230, 176, 330, 16)}
  ${forceArrow('problem-2', 250, 176, 58, 'f1')}
  ${forceArrow('problem-2', 540, 192, 300, 'f2')}
  ${forceArrow('problem-2', 120, 176, 70, 'result')}
  ${forceLabel(278, 50, 'F₁ = 80 N', 'f1')}
  ${forceLabel(572, 318, 'F₂ = 20 N', 'f2')}
  ${forceLabel(86, 62, 'F = 60 N', 'result')}
  ${point(120, 184, 'C', 22)}
  ${point(250, 184, 'A', 22)}
  ${point(540, 184, 'B', 22)}
  ${dimension(120, 250, 96, 'd₁ ≈ 13.3 cm')}
  ${dimension(250, 540, 54, 'd = 40 cm')}
  <text x="330" y="368" class="l2-caption" text-anchor="middle" direction="ltr">d₂ ≈ 53.3 cm</text>
  `,
);

const comparisonSvg = svgFrame(
  'sense-comparison',
  'مقارنة موضع المحصلة في الجهتين',
  'اليسار: جهتان واحدة، المحصلة بين القوتين وأقرب إلى الأكبر. اليمين: جهتان متعاكستان، المحصلة خارج القطعة من جهة الأكبر.',
  `
  <text x="180" y="36" class="l2-caption" text-anchor="middle">جهة واحدة</text>
  <text x="520" y="36" class="l2-caption" text-anchor="middle">جهتان متعاكستان</text>
  ${carrier(80, 50, 330)}
  ${carrier(170, 50, 330)}
  ${carrier(280, 50, 330)}
  ${bar(70, 190, 220, 12)}
  ${forceArrow('sense-comparison', 80, 190, 100, 'f2')}
  ${forceArrow('sense-comparison', 280, 190, 130, 'f1')}
  ${forceArrow('sense-comparison', 170, 190, 70, 'result')}
  ${forceLabel(80, 88, 'F₂', 'f2')}
  ${forceLabel(280, 118, 'F₁', 'f1')}
  ${forceLabel(188, 62, 'F', 'result')}
  ${point(80, 196, 'B', 22)}
  ${point(170, 196, 'C', 22)}
  ${point(280, 196, 'A', 22)}
  ${carrier(390, 50, 340)}
  ${carrier(500, 50, 340)}
  ${carrier(630, 50, 340)}
  ${bar(490, 176, 160, 12)}
  ${forceArrow('sense-comparison', 630, 176, 80, 'f1')}
  ${forceArrow('sense-comparison', 500, 188, 290, 'f2')}
  ${forceArrow('sense-comparison', 390, 188, 310, 'result')}
  ${forceLabel(650, 72, 'F₁', 'f1')}
  ${forceLabel(524, 308, 'F₂', 'f2')}
  ${forceLabel(410, 328, 'F', 'result')}
  ${point(390, 182, 'C', 22)}
  ${point(500, 182, 'B', 22)}
  ${point(630, 182, 'A', 22)}
  `,
  '0 0 720 360',
);

export const LESSON_2_DIAGRAMS = Object.freeze({
  'swing-scene': {
    title: 'قوى شد سلاسل الأرجوحة',
    platformNote: 'السهمان على السلسلتين يمثلان قوتي الشد، وحاملاهما مستقيمان متوازيان تقريباً ولا يتقاطعان عند المقعد.',
    description: 'إعادة بناء تخطيطية لمشهد الأرجوحة في الصفحة 63.',
    svg: swingSvg,
    legend: [
      { color: 'teal', symbol: `${V_F1} و ${V_F2}: قوتا شد السلسلتين` },
      { color: 'coral', symbol: `${V_W}: ثقل المقعد` },
    ],
  },
  'wagon-scene': {
    title: 'حصانان يشدّان العربة',
    platformNote: 'الشدّان متوازيان وبجهة واحدة في المشهد المقصود من الكتاب، لذلك تُجمع الشّدتان لاحقاً عند دراسة المحصلة.',
    description: 'إعادة بناء تخطيطية لمشهد العربة في الصفحة 63.',
    svg: wagonSvg,
    legend: [{ color: 'teal', symbol: `${V_F1} و ${V_F2}: قوتان متوازيتان بجهة واحدة` }],
  },
  'single-spring': {
    title: 'الحالة الأولى: ربيعة واحدة',
    platformNote: 'حامل الثقل شاقولي وجهته إلى أسفل، سواء عُلّق الجسم في ربيعة واحدة أم في المسطرة لاحقاً.',
    description: 'إعادة بناء للخطوة 1 من تجربة الصفحة 64.',
    svg: singleSpringSvg,
    legend: [{ color: 'coral', symbol: `${V_W}: قوة الثقل` }],
  },
  'two-spring-bar': {
    title: 'مسطرة متوازنة أفقياً بربيعتين وثقل',
    platformNote: 'حاملا الشدّين ليسا الاستقامة ذاتها: هما مستقيمان منفصلان متوازيان. حامل الثقل يبقى شاقولياً إلى أسفل.',
    description: 'إعادة بناء للخطوة 2 والشكل العلوي في الصفحة 64.',
    svg: twoSpringBarSvg,
    legend: [
      { color: 'teal', symbol: `${V_F1} و ${V_F2}: قوتا الشد` },
      { color: 'coral', symbol: `${V_W}: ثقل الجسم عند C` },
    ],
  },
  'parallel-definition': {
    title: 'حوامل ثلاث قوى متوازية',
    platformNote: 'الخطوط المتقطعة هي الحوامل الممتدة. توازيها — لا تساوي المقادير — هو الخاصية التي يعرّف بها الكتاب القوى المتوازية.',
    description: 'إعادة بناء لشكل الاستنتاج في الصفحة 64.',
    svg: parallelDefinitionSvg,
    legend: [
      { color: 'teal', symbol: `${V_F1} و ${V_F2}: قوتا الشد` },
      { color: 'coral', symbol: `${V_W}: ثقل الجسم` },
    ],
  },
  'same-sense-experiment': {
    title: 'أدوات تجربة الجهة الواحدة',
    platformNote: 'الثقلان إلى أسفل عند الطرفين، والربيعة عند C إلى أعلى. عند الاتزان الأفقي تكون قراءة الربيعة مساوية لمجموع الثقلين.',
    description: 'إعادة بناء للشكل التجريبي في أعلى الصفحة 65.',
    svg: sameSenseExperimentSvg,
    legend: [
      { color: 'coral', symbol: `${V_W}₁ و ${V_W}₂: الثقلان` },
      { color: 'plum', symbol: `${V_F3}: قراءة الربيعة` },
    ],
  },
  'same-sense-construction': {
    title: 'حوامل القوى الثلاث والقوة المعاكسة لـ F3',
    platformNote: 'القوة F التي تعاكس F3 مباشرة هي محصلة الثقلين، وجهتها جهتهما (إلى أسفل في التجربة).',
    description: 'إعادة بناء لخطوات الرسم 5–9 في الصفحة 65.',
    svg: sameSenseConstructionSvg,
    legend: [
      { color: 'teal', symbol: `${V_F1} و ${V_F2}` },
      { color: 'coral', symbol: `${V_F}: المحصلة` },
      { color: 'plum', symbol: `${V_F3}: قوة الربيعة` },
    ],
  },
  'same-sense': {
    title: 'موضع محصلة قوتين بجهة واحدة',
    platformNote: 'بعد تمثيل القوى، تُرسم الأسهم في جهة واحدة. تقع C على AB وأقرب إلى القوة الأكبر حتى يتحقق F1 × d1 = F2 × d2.',
    description: 'إعادة بناء لشكل الاستنتاج في أسفل الصفحة 65.',
    svg: sameSenseResultantSvg,
    legend: [
      { color: 'teal', symbol: `${V_F1} و ${V_F2}` },
      { color: 'coral', symbol: `${V_F}: المحصلة` },
    ],
  },
  'worked-same': {
    title: 'رسم التطبيق المحلول بجهة واحدة',
    platformNote: 'القيم من الكتاب: F1 = 20 N و F2 = 30 N و AB = 0.5 m فتكون F = 50 N و d2 = 0.2 m.',
    description: 'إعادة بناء لرسم حل التطبيق في الصفحتين 66–67.',
    svg: workedSameSvg,
    legend: [
      { color: 'teal', symbol: `${V_F1} = 20 N ، ${V_F2} = 30 N` },
      { color: 'coral', symbol: `${V_F} = 50 N` },
    ],
  },
  'opposite-sense': {
    title: 'موضع محصلة قوتين بجهتين متعاكستين',
    platformNote: 'C خارج القطعة AB ومن جهة القوة الأكبر، والمحصلة بجهة تلك القوة. تبقى علاقة الجداءين صحيحة.',
    description: 'إعادة بناء للشكل في الصفحة 67.',
    svg: oppositeSenseSvg,
    legend: [
      { color: 'teal', symbol: `${V_F1}: القوة الأصغر` },
      { color: 'coral', symbol: `${V_F2}: الأكبر و ${V_F}: المحصلة` },
    ],
  },
  'worked-opposite': {
    title: 'رسم التطبيق المحلول بجهتين متعاكستين',
    platformNote: 'القيم من الكتاب: 200 N و 300 N والبعد 60 cm، فتكون F = 100 N و d1 = 180 cm.',
    description: 'إعادة بناء لرسم حل التطبيق في الصفحة 68.',
    svg: workedOppositeSvg,
    legend: [
      { color: 'teal', symbol: `${V_F1} = 200 N` },
      { color: 'coral', symbol: `${V_F2} = 300 N و ${V_F} = 100 N` },
    ],
  },
  'problem-1': {
    title: 'رسم المسألة الأولى ص 70',
    platformNote: 'المحصلة بين القوتين وأقرب إلى 40 N. طول المسطرة 150 cm.',
    description: 'تمثيل عناصر محصلة المسألة الأولى في الصفحة 70.',
    svg: problem1Svg,
    legend: [
      { color: 'teal', symbol: `${V_F1} = 40 N ، ${V_F2} = 10 N` },
      { color: 'coral', symbol: `${V_F} = 50 N` },
    ],
  },
  'problem-2': {
    title: 'رسم المسألة الثانية ص 70',
    platformNote: 'المحصلة خارج القطعة من جهة 80 N، وشدتها 60 N، وبعد القوة الثانية عن حاملها 160/3 cm.',
    description: 'تمثيل عناصر محصلة المسألة الثانية في الصفحة 70.',
    svg: problem2Svg,
    legend: [
      { color: 'teal', symbol: `${V_F1} = 80 N` },
      { color: 'coral', symbol: `${V_F2} = 20 N و ${V_F} = 60 N` },
    ],
  },
  'sense-comparison': {
    title: 'موضع C في الحالتين',
    platformNote: 'الجهة الواحدة تضع C بين القوتين؛ والتعاكس يضعها خارج القطعة من جهة الأكبر. الحامل موازٍ في الحالتين.',
    description: 'مقارنة بصرية لاستنتاجي الصفحتين 65 و 67.',
    svg: comparisonSvg,
    legend: [
      { color: 'teal', symbol: `${V_F1} و ${V_F2}` },
      { color: 'coral', symbol: `${V_F}` },
    ],
  },
});
