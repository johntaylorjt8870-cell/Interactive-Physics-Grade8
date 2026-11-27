import { tex } from './math.js';
import { seriesCircuit, parallelCircuit } from './unit2-lesson2-circuits.js';

const defs = (id) => `<defs><marker id="${id}-i" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#2a7a5a"/></marker><marker id="${id}-e" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#c95348"/></marker></defs>`;
const frame = (id, t, d, body, height = 360) => `<svg viewBox="0 0 720 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${id}-title">${t}</title><desc id="${id}-desc">${d}</desc>${defs(id)}${body}</svg>`;
const txt = (x, y, s, cls = 'u2-label') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="middle" direction="ltr">${s}</text>`;
/* Arabic SVG label: RTL base direction so punctuation such as parentheses stays in place. */
const arTxt = (x, y, s, cls = 'u2l2-part-label') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="middle" direction="rtl">${s}</text>`;

/* Book-style block arrow centred on (cx, cy). The data-* attributes record the physics
   (which flow, which wire segment, which direction) so tests can check the convention. */
const ARROW_ANGLE = Object.freeze({ right: 0, down: 90, left: 180, up: 270 });
function blockArrow(cx, cy, dir, flow, segment) {
  const half = 22; const shaft = 5.5; const head = 12; const headLength = 17;
  const outline = [[-half, -shaft], [half - headLength, -shaft], [half - headLength, -head], [half, 0], [half - headLength, head], [half - headLength, shaft], [-half, shaft]];
  const rad = (ARROW_ANGLE[dir] * Math.PI) / 180;
  const cos = Math.round(Math.cos(rad)); const sin = Math.round(Math.sin(rad));
  const points = outline.map(([x, y]) => `${cx + x * cos - y * sin},${cy + x * sin + y * cos}`).join(' ');
  const cls = flow === 'current' ? 'u2l2-arrow-current' : 'u2l2-arrow-electron';
  return `<polygon class="${cls}" data-flow="${flow}" data-segment="${segment}" data-dir="${dir}" points="${points}"/>`;
}

/* p89 circuit, laid out as in the textbook figure: generator on top (+ left, − right),
   lamp then switch along the lower return, wires closing the loop.
   Conventional current (blue, outside the loop) leaves + and returns to −;
   electrons e⁻ (red, inside the loop) move the opposite way on every segment. */
const LOOP = Object.freeze({ left: 170, right: 550, top: 110, bottom: 330 });
const CURRENT_FLOW = Object.freeze({ 'top-left': 'left', left: 'down', bottom: 'right', right: 'up', 'top-right': 'left' });
const OPPOSITE = Object.freeze({ left: 'right', right: 'left', up: 'down', down: 'up' });
const ARROW_SPOTS = Object.freeze({
  'top-left': { current: [236, 90], electron: [236, 130] },
  left: { current: [150, 290], electron: [190, 290] },
  bottom: { current: [360, 350], electron: [360, 310] },
  right: { current: [570, 290], electron: [530, 290] },
  'top-right': { current: [482, 90], electron: [482, 130] },
});
const flowArrows = Object.entries(ARROW_SPOTS).map(([segment, spot]) => `${blockArrow(...spot.current, CURRENT_FLOW[segment], 'current', segment)}${blockArrow(...spot.electron, OPPOSITE[CURRENT_FLOW[segment]], 'electron', segment)}`).join('');
const electronSymbol = (x, y) => `<text x="${x}" y="${y}" class="u2l2-sym u2l2-sym-electron" text-anchor="middle" direction="ltr">e</text>`;
const currentSymbol = (x, y) => `<text x="${x}" y="${y}" class="u2l2-sym u2l2-sym-current" text-anchor="middle" direction="ltr">I</text>`;
const CURRENT_DIRECTION_SVG = `
      <path class="u2-wire" d="M302 ${LOOP.top} H${LOOP.left} V${LOOP.bottom} H217"/>
      <path class="u2-wire" d="M273 ${LOOP.bottom} H449"/>
      <path class="u2-wire" d="M410 ${LOOP.top} H${LOOP.right} V${LOOP.bottom} H495"/>
      <g data-part="generator" data-x="360" data-y="${LOOP.top}">
        <rect class="u2l2-battery-cap" x="300" y="101" width="11" height="18" rx="3"/>
        <rect class="u2l2-battery-pos" x="310" y="88" width="50" height="44" rx="6"/>
        <rect class="u2l2-battery-neg" x="360" y="88" width="50" height="44" rx="6"/>
        <text class="u2l2-terminal-sign" data-terminal="positive" x="335" y="119" text-anchor="middle">+</text>
        <text class="u2l2-terminal-sign" data-terminal="negative" x="385" y="119" text-anchor="middle">−</text>
      </g>
      ${arTxt(335, 154, 'موجب', 'u2l2-part-sub')}${arTxt(385, 154, 'سالب', 'u2l2-part-sub')}
      ${arTxt(360, 48, 'المولّد', 'u2l2-part-label is-title')}${arTxt(360, 72, 'مصدر الطاقة الكهربائية', 'u2l2-part-sub')}
      <g data-part="lamp" data-x="245" data-y="330">
        <circle class="u2l2-lamp-glow" cx="245" cy="330" r="37"/><circle class="u2l2-lamp" cx="245" cy="330" r="28"/>
        <path class="u2l2-lamp-x" d="M225.2 310.2l39.6 39.6m-39.6 0l39.6 -39.6"/>
      </g>
      ${arTxt(245, 387, 'جهاز كهربائي')}${arTxt(245, 408, 'مستهلك (مصباح)')}
      <g data-part="switch" data-x="472" data-y="330">
        <line class="u2l2-switch-lever" x1="449" y1="330" x2="495" y2="330"/>
        <circle class="u2l2-switch-contact" cx="449" cy="330" r="5.5"/><circle class="u2l2-switch-contact" cx="495" cy="330" r="5.5"/>
      </g>
      ${arTxt(472, 387, 'مفتاح (قاطعة)')}${arTxt(472, 408, 'مغلق', 'u2l2-part-sub')}
      ${arTxt(97, 201, 'موصل كهربائي')}${arTxt(97, 224, '(أسلاك التوصيل)', 'u2l2-part-sub')}
      ${flowArrows}
      ${currentSymbol(236, 68)}${currentSymbol(314, 357)}
      ${electronSymbol(236, 166)}${electronSymbol(312, 317)}
    `;

/* p90: 5 s and 20 C per grid step. The scan labels its charge axis q (c);
   use SI C in the explanation and exercise, not as a different quantity. */
const QT_TICKS_T = Object.freeze([5, 10, 15, 20, 25, 30, 35]);
const QT_TICKS_Q = Object.freeze([20, 40, 60, 80, 100, 120]);
const qtX = (t) => 80 + t * 16;
const qtY = (q) => 300 - q * 2;
/* t numbers hang below the axis and q numbers are centred on their tick, so the
   spacing holds when the font is enlarged on small screens. */
const tick = (axis, value, x, y, anchor, baseline) => `<text class="u2l2-tick" data-axis="${axis}" data-value="${value}" x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="${baseline}" direction="ltr">${value}</text>`;
const QT_TICKS = [
  ...QT_TICKS_T.map((t) => `<line class="u2l2-tick-mark" x1="${qtX(t)}" y1="300" x2="${qtX(t)}" y2="307"/>${tick('t', t, qtX(t), 313, 'middle', 'hanging')}`),
  ...QT_TICKS_Q.map((q) => `<line class="u2l2-tick-mark" x1="73" y1="${qtY(q)}" x2="80" y2="${qtY(q)}"/>${tick('q', q, 67, qtY(q), 'end', 'central')}`),
  tick('origin', 0, 67, 313, 'end', 'hanging'),
].join('');


/* p87 opening scene. The book prints two photographs (a falling domino row and a
   circuit with two lamps, two cells and a switch). Photographs are not reproduced;
   the platform redraws the same physical situation as a labelled schematic. */
const DOMINO_SVG = (() => {
  const pieces = Array.from({ length: 5 }, (_, i) => {
    const angle = i < 2 ? 0 : i === 2 ? -18 : i === 3 ? -48 : -68;
    const x = 76 + i * 46;
    return `<g class="u2l2-domino${i >= 3 ? ' is-falling' : ''}" transform="rotate(${angle} ${x} 150)">
      <rect x="${x - 9}" y="150" width="18" height="60" rx="4"/><line x1="${x - 9}" y1="180" x2="${x + 9}" y2="180"/>
    </g>`;
  }).join('');
  return `${pieces}
    <path class="u2l2-domino-arrow" d="M60 244 H262 M262 244 l-13 -6 v12 z"/>
    ${arTxt(160, 270, 'دفعة واحدة تُسقط الصف كله بالتتابع', 'u2l2-part-sub')}
    ${arTxt(160, 70, 'صف دومينو', 'u2l2-part-label')}`;
})();

/* The photograph shows two cells in a holder. Only its external leads are
   visible: don't invent a series/parallel connection inside the holder. */
const INTRO_CIRCUIT_SVG = `
  <path class="u2-wire" d="M460 145H484V112H520 M580 112H674V205H636 M604 205H554 M522 205H484V173H460"/>
  <g data-part="generator"><rect class="u2l2-holder" x="378" y="133" width="82" height="52" rx="5"/>
    <rect class="u2l2-holder-cell" x="384" y="137" width="68" height="18" rx="6"/><rect class="u2l2-holder-cell" x="384" y="162" width="68" height="18" rx="6"/></g>
  ${[538, 620].map((x) => `<g data-part="lamp"><circle class="u2l2-lamp-glow" cx="${x}" cy="205" r="23"/><circle class="u2l2-lamp" cx="${x}" cy="205" r="16"/><path class="u2l2-lamp-x" d="M${x-11} 194l22 22m-22 0l22 -22"/></g>`).join('')}
  <g data-part="switch"><line class="u2l2-switch-lever" x1="520" y1="112" x2="580" y2="112"/><circle class="u2l2-switch-contact" cx="520" cy="112" r="5"/><circle class="u2l2-switch-contact" cx="580" cy="112" r="5"/></g>
  ${arTxt(419, 112, 'حامل خليتين', 'u2l2-part-sub')}${arTxt(550, 93, 'مفتاح مغلق', 'u2l2-part-sub')}
  ${arTxt(579, 252, 'مصباحان', 'u2l2-part-sub')}${arTxt(556, 58, 'دارة كهربائية', 'u2l2-part-label')}`;

/* pp93–94: on BOTH pages every printed cell has + at the top and − at the
   bottom. The leads, not alternating cell orientations, distinguish the banks. */
const BANK_X = Object.freeze([130, 270, 410, 550]);

function cellSymbol(x, topY, bottomY, index, bank) {
  const inset = bank === 'series' ? 16 : 14;
  const bodyTop = topY + inset;
  const bodyBottom = bottomY - inset;
  return `<g class="u2l2-cell-symbol" data-cell="${index + 1}" data-bank="${bank}" data-x="${x}" data-top="${topY}" data-bottom="${bottomY}">
    <line class="u2l2-cell-stub" x1="${x}" y1="${topY}" x2="${x}" y2="${bodyTop}"/>
    <line class="u2l2-cell-stub" x1="${x}" y1="${bodyBottom}" x2="${x}" y2="${bottomY}"/>
    <rect class="u2l2-cell-body" x="${x - 21}" y="${bodyTop}" width="42" height="${bodyBottom - bodyTop}" rx="7"/>
    <rect class="u2l2-cell-band" x="${x - 21}" y="${bodyTop + 8}" width="42" height="10"/>
    <text class="u2l2-terminal-sign u2l2-cell-sign" data-terminal="positive" data-cell-terminal="positive" x="${x}" y="${bodyTop + 22}" text-anchor="middle" direction="ltr">+</text>
    <text class="u2l2-terminal-sign u2l2-cell-sign" data-terminal="negative" data-cell-terminal="negative" x="${x}" y="${bodyBottom - 6}" text-anchor="middle" direction="ltr">−</text>
    ${arTxt(x, bottomY + (bank === 'series' ? 67 : 46), `خلية ${index + 1}`, 'u2l2-part-sub')}
  </g>`;
}

const SERIES_TOP = 130;
const SERIES_BOTTOM = 230;
const SERIES_BANK_SVG = `
  <rect class="u2l2-bank-box" x="70" y="70" width="540" height="230" rx="18"/>
  ${BANK_X.map((x, i) => cellSymbol(x, SERIES_TOP, SERIES_BOTTOM, i, 'series')).join('')}
  ${BANK_X.slice(0, -1).map((x, i) => {
    const next = BANK_X[i + 1];
    return `<path class="u2-wire" data-bank-wire="chain-${i + 1}" data-wire d="M${x} ${SERIES_TOP} V104 H${(x+next)/2} V248 H${next} V${SERIES_BOTTOM}"/>`;
  }).join('')}
  <path class="u2-wire" data-wire d="M${BANK_X[0]} ${SERIES_BOTTOM} V268 H622"/>
  <path class="u2-wire" data-wire d="M${BANK_X[3]} ${SERIES_TOP} V104 H622"/>
  <path class="u2l2-voltage-bracket" d="M622 104 H632 V268 H622"/>
  ${txt(672, 192, '6 Volts', 'u2l2-voltage-label')}
  ${arTxt(340, 44, 'وصل مجموعة مولّدات متماثلة على التسلسل', 'u2l2-part-label')}
  ${arTxt(340, 340, 'موجب كل خلية إلى سالب الخلية التي تليها، فتضاف الجهود', 'u2l2-part-sub')}
`;

const PARALLEL_TOP = 118;
const PARALLEL_BOTTOM = 236;
const PARALLEL_BANK_SVG = `
  <rect class="u2l2-bank-box" x="70" y="70" width="540" height="230" rx="18"/>
  <path class="u2-wire" data-wire d="M${BANK_X[0]} ${PARALLEL_TOP} H622"/>
  <path class="u2-wire" data-wire d="M${BANK_X[0]} ${PARALLEL_BOTTOM} H622"/>
  ${BANK_X.map((x, i) => cellSymbol(x, PARALLEL_TOP, PARALLEL_BOTTOM, i, 'parallel')).join('')}
  <path class="u2l2-voltage-bracket" d="M622 ${PARALLEL_TOP} H632 V${PARALLEL_BOTTOM} H622"/>
  ${txt(676, (PARALLEL_TOP + PARALLEL_BOTTOM) / 2 + 6, '1.5 Volts', 'u2l2-voltage-label')}
  ${arTxt(340, 44, 'وصل عدة مولّدات متماثلة على التفرع', 'u2l2-part-label')}
  ${arTxt(340, 340, 'جميع الأقطاب الموجبة على خط واحد، وجميع السالبة على خط واحد', 'u2l2-part-sub')}
`;

export const UNIT2L2_DIAGRAMS = Object.freeze({
  'intro-scenes': {
    title: 'مشهدا الافتتاح: صف الدومينو والدارة المغلقة',
    platformNote: 'إعادة بناء تخطيطية من المنصة لصورتَي ص87: صف دومينو يتساقط بالتتابع، ودارة بمصباحين وحامل خليتين ومفتاح مغلق؛ لا يظهر توصيل الحامل الداخلي. الصور الفوتوغرافية في الكتاب لا تُعاد طباعتها، والرسم يوضّح الوضع نفسه لا الصورة نفسها.',
    description: 'على اليسار صف من قطع الدومينو تسقط بالتتابع بعد دفعة واحدة، وعلى اليمين دارة كهربائية مغلقة فيها حامل خليتين ومصباحان ومفتاح مغلق.',
    svg: frame('intro-scenes', 'دومينو ودارة', 'صف دومينو يتساقط بالتتابع، ودارة كهربائية مغلقة فيها حامل خليتين ومصباحان متتاليان ومفتاح.', `${DOMINO_SVG}${INTRO_CIRCUIT_SVG}`, 320),
    legend: [{ color: 'coral', symbol: 'المشهدان يفتحان أسئلة ص87: من أين نحصل على الطاقة الكهربائية، وكيف تنتقل إلى المصباح؟' }],
  },
  'current-direction': {
    title: 'جهة التيار وحركة الإلكترونات',
    platformNote: `إعادة بناء تخطيطية من المنصة لشكل الكتاب ص89: المولّد في الأعلى (القطب الموجب يساراً والسالب يميناً)، والمصباح أسفل اليسار والقاطعة أسفل اليمين. اختُصر تكرار الأسهم: الزرقاء لجهة التيار الاصطلاحية، والحمراء المسمّاة ${tex('e', 'electron')} لحركة الإلكترونات في الاتجاه المعاكس. Educational simplified model.`,
    description: 'دارة مغلقة: المولّد (مصدر الطاقة الكهربائية) في الأعلى، والمصباح (الجهاز الكهربائي المستهلك) يساراً، والمفتاح (القاطعة) يميناً، وتصل بينها أسلاك التوصيل (الموصل الكهربائي). الأسهم الزرقاء خارج الحلقة تبيّن جهة التيار الاصطلاحية، والأسهم الحمراء داخلها تبيّن حركة الإلكترونات بالاتجاه المعاكس.',
    svg: frame('current-direction', 'جهة التيار الاصطلاحية وحركة الإلكترونات', 'المولّد في الأعلى وقطبه الموجب يساراً والسالب يميناً، والمصباح يساراً والمفتاح يميناً. أسهم زرقاء للتيار الاصطلاحي من القطب الموجب إلى القطب السالب خارج المولّد، وأسهم حمراء للإلكترونات بالاتجاه المعاكس.', CURRENT_DIRECTION_SVG, 420),
    legend: [
      { color: 'sky', symbol: `أسهم زرقاء: جهة التيار الاصطلاحية ${tex('I', 'I')} — من القطب الموجب (+) إلى القطب السالب (−) خارج المولّد` },
      { color: 'red', symbol: `أسهم حمراء: حركة الإلكترونات ${tex('e^{-}', 'electrons')} — من القطب السالب (−) إلى القطب الموجب (+) خارج المولّد، عكس جهة التيار` },
    ],
  },
  'qt-graph': {
    title: 'الخط البياني لكمية الكهرباء بدلالة الزمن',
    platformNote: 'شبكة ص90 كما طُبعت: خمس نقاط فقط. يُطلب من الطالب رسم المستقيم؛ لا يوجد خطّ واصل مطبوع. وحدة الشحنة هي الكولوم (c في الشكل، وC في الترميز المعياري).',
    description: 'خمس نقاط منتظمة تمثّل كمية الكهرباء بدلالة الزمن. لا نقطة قياس إضافية عند المبدأ.',
    svg: frame('qt-graph', 'q versus t', 'المحور الأفقي t من 0 إلى 35 s والمحور العمودي q من 0 إلى 120 C؛ نقاط منتظمة على خط مستقيم من (5,20) إلى (25,100).', `
      <line class="u2-axis" x1="80" y1="300" x2="680" y2="300"/><line class="u2-axis" x1="80" y1="300" x2="80" y2="40"/>
      ${[0,1,2,3,4,5,6,7].map((i)=>`<line class="u2-grid" x1="${80+i*80}" y1="300" x2="${80+i*80}" y2="60"/>`).join('')}
      ${[0,1,2,3,4,5,6].map((i)=>`<line class="u2-grid" x1="80" y1="${300-i*40}" x2="640" y2="${300-i*40}"/>`).join('')}
      <polygon fill="#24304a" points="680,300 670,296 670,304"/><polygon fill="#24304a" points="80,40 76,50 84,50"/>
      ${QT_TICKS}
      ${txt(80, 28, 'q (c)', 'u2l2-axis-label')}${txt(684, 288, 't (s)', 'u2l2-axis-label')}
      ${[[160,260],[240,220],[320,180],[400,140],[480,100]].map(([x,y])=>`<circle class="u2-plot" cx="${x}" cy="${y}" r="6"/>`).join('')}
    `),
    legend: [{ color: 'blue', symbol: `من ميل النقاط المطبوعة نستنتج تياراً ثابتاً شدته ${tex('4\\,\\mathrm{A}', '4 A')}` }],
  },
  'series-circuit': {
    title: 'دارة على التسلسل',
    platformNote: `تخطيط من المنصة لشكل الكتاب ص92: مصباحان ومقياسا أمبير والتيار ${tex('200\\,\\mathrm{mA}', '200 mA')} في الجزأين. Educational simplified model.`,
    description: `مسار واحد: التيار نفسه ${tex('200\\,\\mathrm{mA}', '200 mA')} عند A1 و A2.`,
    svg: frame('series-circuit', 'وصل على التسلسل', 'من موجب المولّد إلى A₁ ثم L₁ أعلى الدارة، ثم A₂ فـL₂ على مسار العودة. يدخل التيار من يسار A₁ ومن يمين A₂؛ كلاهما يقرأ 200 mA.', seriesCircuit()),
    legend: [{ color: 'blue', symbol: 'I ثابت في كل أجزاء الدارة المغلقة على التسلسل' }],
  },
  'parallel-circuit': {
    title: 'دارة على التفرع',
    platformNote: 'تخطيط من المنصة لشكل الكتاب ص93: فرعان بمصباحين ومقاييس. في المصدر المصباح الثاني مكتوب L1؛ الرسم يحفظ التفرع دون اختلاق قيم لم تُطبع.',
    description: 'فرعان متوازيان؛ التيار الأصلي مجموع تياري الفرعين.',
    svg: frame('parallel-circuit', 'وصل على التفرع', 'دارة مغلقة: من القطب الموجب يسار المولّد عبر القاطعة المغلقة ثم المقياس A إلى فرعين متوازيين: في الأعلى A1 مع المصباح L1، وفي الأسفل A2 مع مصباح مطبوع عليه L1 في المصدر؛ يلتقي الفرعان ويعود التيار إلى المولّد.', parallelCircuit()),
    legend: [{ color: 'teal', symbol: 'استنتاج ص94: I = I₁ + I₂ — التيار الأصلي مجموع تياري الفرعين' }],
  },
  'batteries-series': {
    title: 'مولّدات متماثلة على التسلسل',
    platformNote: 'إعادة بناء تخطيطية من المنصة لشكل الكتاب ص93: أربع خلايا متماثلة، موجب كل خلية إلى سالب التي تليها، والمجموع المطبوع في الكتاب 6 Volts. علامتا + و− مطبوعتان على كل خلية، وأرقام الخلايا فقط من المنصة.',
    description: 'أربع خلايا متماثلة موصولة على التسلسل: يصل سلك من القطب الموجب لكل خلية إلى القطب السالب للخلية التالية، ويقاس مجموع الجهود بين طرفي السلسلة فيكون 6 Volts.',
    svg: frame('batteries-series', 'وصل على التسلسل', 'سلسلة من أربع خلايا: القطب الموجب لكل خلية موصول بالقطب السالب للخلية التالية، وقوس على اليمين يبيّن مجموع الجهود 6 Volts.', SERIES_BANK_SVG, 370),
    legend: [
      { color: 'blue', symbol: 'القطب الموجب (+) والسالب (−) على كل خلية، وكلها موجَبها أعلى وسالبها أسفل' },
      { color: 'yellow', symbol: `المجموع المطبوع في الكتاب: ${tex('6\\,\\mathrm{Volts}', '6 volts')} لأربع خلايا متماثلة` },
    ],
  },
  'batteries-parallel': {
    title: 'مولّدات متماثلة على التفرع',
    platformNote: 'إعادة بناء تخطيطية من المنصة لشكل الكتاب ص94: أربع خلايا متماثلة على التفرع، والجهد المطبوع 1.5 Volts. علامتا + و− مطبوعتان على كل خلية، والترقيم من المنصة.',
    description: 'أربع خلايا متماثلة موصولة على التفرع: جميع الأقطاب الموجبة على خط ناقل واحد وجميع السالبة على خط آخر، فيبقى الجهد بين طرفي المجموعة 1.5 Volts.',
    svg: frame('batteries-parallel', 'وصل على التفرع', 'مجموعة على التفرع: خط أعلى يجمع الأقطاب الموجبة وخط أسفل يجمع السالبة، وقوس على اليمين يبيّن 1.5 Volts.', PARALLEL_BANK_SVG, 370),
    legend: [
      { color: 'blue', symbol: 'القطب الموجب (+) والسالب (−) على كل خلية' },
      { color: 'teal', symbol: `الجهد المطبوع في الكتاب: ${tex('1.5\\,\\mathrm{Volts}', '1.5 volts')} كما في خلية واحدة` },
    ],
  },
});
