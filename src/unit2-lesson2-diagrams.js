import { tex } from './math.js';

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
   lamp on the left branch, switch on the right branch, wires closing the loop.
   Conventional current (yellow, outside the loop) leaves + and returns to −;
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
const electronSymbol = (x, y) => `<text x="${x}" y="${y}" class="u2l2-sym u2l2-sym-electron" text-anchor="middle" direction="ltr">e<tspan dy="-8" font-size="14">−</tspan></text>`;
const currentSymbol = (x, y) => `<text x="${x}" y="${y}" class="u2l2-sym u2l2-sym-current" text-anchor="middle" direction="ltr">I</text>`;
const CURRENT_DIRECTION_SVG = `
      <path class="u2-wire" d="M302 ${LOOP.top} H${LOOP.left} V192"/>
      <path class="u2-wire" d="M${LOOP.left} 248 V${LOOP.bottom} H${LOOP.right} V246"/>
      <path class="u2-wire" d="M410 ${LOOP.top} H${LOOP.right} V194"/>
      <g data-part="generator" data-x="360" data-y="${LOOP.top}">
        <rect class="u2l2-battery-cap" x="300" y="101" width="11" height="18" rx="3"/>
        <rect class="u2l2-battery-pos" x="310" y="88" width="50" height="44" rx="6"/>
        <rect class="u2l2-battery-neg" x="360" y="88" width="50" height="44" rx="6"/>
        <text class="u2l2-terminal-sign" data-terminal="positive" x="335" y="119" text-anchor="middle">+</text>
        <text class="u2l2-terminal-sign" data-terminal="negative" x="385" y="119" text-anchor="middle">−</text>
      </g>
      ${arTxt(335, 154, 'موجب', 'u2l2-part-sub')}${arTxt(385, 154, 'سالب', 'u2l2-part-sub')}
      ${arTxt(360, 48, 'المولّد', 'u2l2-part-label is-title')}${arTxt(360, 72, 'مصدر الطاقة الكهربائية', 'u2l2-part-sub')}
      <g data-part="lamp" data-x="${LOOP.left}" data-y="220">
        <circle class="u2l2-lamp-glow" cx="${LOOP.left}" cy="220" r="40"/>
        <circle class="u2l2-lamp" cx="${LOOP.left}" cy="220" r="28"/>
        <path class="u2l2-lamp-x" d="M150.2 200.2 L189.8 239.8 M189.8 200.2 L150.2 239.8"/>
      </g>
      ${arTxt(78, 212, 'جهاز كهربائي')}${arTxt(78, 234, 'مستهلك (مصباح)')}
      <g data-part="switch" data-x="${LOOP.right}" data-y="220">
        <line class="u2l2-switch-lever" x1="${LOOP.right}" y1="246" x2="${LOOP.right}" y2="194"/>
        <circle class="u2l2-switch-contact" cx="${LOOP.right}" cy="194" r="5.5"/>
        <circle class="u2l2-switch-contact" cx="${LOOP.right}" cy="246" r="5.5"/>
      </g>
      ${arTxt(640, 214, 'مفتاح (قاطعة)')}${arTxt(640, 236, 'مغلق', 'u2l2-part-sub')}
      ${arTxt(360, 402, 'موصل كهربائي (أسلاك التوصيل)')}
      ${flowArrows}
      ${currentSymbol(236, 68)}${currentSymbol(314, 357)}
      ${electronSymbol(236, 166)}${electronSymbol(312, 317)}
    `;

/* p92 series circuit: one closed loop, generator -> A1 -> L1 -> L2 -> A2 -> generator.
   The order follows the p92 textbook reference text in the lesson (A1, then L1 and L2,
   then A2) and the original component placement. Every wire ends exactly on a
   component terminal; data-terminals records those points so tests can verify the
   loop geometrically (no gaps, nothing merely drawn next to the wire). */
const SERIES = Object.freeze({ left: 75, right: 640, top: 80, bottom: 280 });
const circuitPart = (name, cx, cy, r, cls, vertical = false, label = name) => {
  const terminals = vertical ? `${cx},${cy - r} ${cx},${cy + r}` : `${cx - r},${cy} ${cx + r},${cy}`;
  return `<g data-part="${cls === 'u2-bulb' ? 'lamp' : 'ammeter'}" data-name="${name}" data-cx="${cx}" data-cy="${cy}" data-r="${r}" data-terminals="${terminals}"><circle cx="${cx}" cy="${cy}" r="${r}" class="${cls}"/><text x="${cx}" y="${cy}" class="u2l2-circuit-label" text-anchor="middle" dominant-baseline="central" direction="ltr">${label}</text></g>`;
};
const SERIES_CIRCUIT_SVG = `
      <path class="u2-wire" data-wire d="M${SERIES.left} 140 V${SERIES.top} H178"/>
      <path class="u2-wire" data-wire d="M222 ${SERIES.top} H332"/>
      <path class="u2-wire" data-wire d="M388 ${SERIES.top} H492"/>
      <path class="u2-wire" data-wire d="M548 ${SERIES.top} H${SERIES.right} V158"/>
      <path class="u2-wire" data-wire d="M${SERIES.right} 202 V${SERIES.bottom} H${SERIES.left} V210"/>
      <g data-part="generator" data-name="G" data-terminals="${SERIES.left},140 ${SERIES.left},210">
        <rect class="u2l2-battery-cap" x="67" y="140" width="16" height="11" rx="3"/>
        <rect class="u2l2-battery-pos" x="55" y="150" width="40" height="30" rx="5"/>
        <rect class="u2l2-battery-neg" x="55" y="180" width="40" height="30" rx="5"/>
        <text class="u2l2-terminal-sign" data-terminal="positive" x="${SERIES.left}" y="174" text-anchor="middle">+</text>
        <text class="u2l2-terminal-sign" data-terminal="negative" x="${SERIES.left}" y="204" text-anchor="middle">−</text>
      </g>
      ${arTxt(140, 186, 'المولّد', 'u2l2-series-gen')}
      ${circuitPart('A1', 200, SERIES.top, 22, 'u2-ammeter')}
      ${circuitPart('L1', 360, SERIES.top, 28, 'u2-bulb')}
      ${circuitPart('L2', 520, SERIES.top, 28, 'u2-bulb')}
      ${circuitPart('A2', SERIES.right, 180, 22, 'u2-ammeter', true)}
      ${txt(360, 330, 'I = 200 mA = Const', 'u2l2-circuit-label')}
    `;

/* p93 parallel circuit. Topology from the lesson text (p93 reference, platform note, teacher
   solution): ammeter A in the main line; upper branch A1 with lamp L1; lower branch A2 with a
   lamp that the source also prints as L1 (label kept). Component positions and the + − marking
   of the generator are those of the original platform drawing; the textbook figure itself is
   not in the repository. Each wire runs between a component terminal and a junction
   (data-junction), so tests can rebuild the netlist: no gaps, no short, one return path. */
const PARALLEL_CIRCUIT_SVG = `
      <path class="u2-wire" data-wire d="M110 180 H140"/>
      <path class="u2-wire" data-wire d="M180 180 H220"/>
      <path class="u2-wire" data-wire d="M220 180 V80 H260"/>
      <path class="u2-wire" data-wire d="M300 80 H412"/>
      <path class="u2-wire" data-wire d="M468 80 H500 V280"/>
      <path class="u2-wire" data-wire d="M220 180 V280 H260"/>
      <path class="u2-wire" data-wire d="M300 280 H412"/>
      <path class="u2-wire" data-wire d="M468 280 H500"/>
      <path class="u2-wire" data-wire d="M500 280 V330 H20 V180 H40"/>
      <circle class="u2l2-junction" data-junction="220,180" cx="220" cy="180" r="5"/>
      <circle class="u2l2-junction" data-junction="500,280" cx="500" cy="280" r="5"/>
      <g data-part="generator" data-name="G" data-terminals="40,180 110,180">
        <rect class="u2-cell" x="40" y="160" width="70" height="40"/>
        <text class="u2l2-circuit-label" data-terminal="positive" x="62" y="180" text-anchor="middle" dominant-baseline="central" direction="ltr">+</text>
        <text class="u2l2-circuit-label" data-terminal="negative" x="88" y="180" text-anchor="middle" dominant-baseline="central" direction="ltr">−</text>
      </g>
      ${circuitPart('A', 160, 180, 20, 'u2-ammeter')}
      ${circuitPart('A1', 280, 80, 20, 'u2-ammeter')}
      ${circuitPart('L1', 440, 80, 28, 'u2-bulb')}
      ${circuitPart('A2', 280, 280, 20, 'u2-ammeter')}
      ${circuitPart('L1-lower', 440, 280, 28, 'u2-bulb', false, 'L1')}
      ${txt(580, 180, 'I = I1 + I2', 'u2l2-circuit-label')}
    `;

/* p90 q-t graph ticks. Scale = the existing grid (80 px per 5 s, 40 px per 20 C), on which
   the book points (5,20)...(25,100) already sit. Ranges follow the p90 textbook reference
   text in the lesson (q from 0 to 120, t from 0 to 35); units come from the existing axis
   labels q (C) and t (s); steps are the existing grid spacing (5 s, 20 C). */
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

/* Right-hand panel of p87: one closed loop, generator on the left, two lamps on
   the branch, switch on the outer branch. */
const INTRO_CIRCUIT_SVG = `
  <path class="u2-wire" d="M470 130 H650 V196 H560"/>
  <path class="u2-wire" d="M560 196 H470 V160"/>
  <g data-part="generator"><rect class="u2l2-battery-pos" x="424" y="112" width="38" height="36" rx="5"/><rect class="u2l2-battery-cap" x="416" y="122" width="9" height="16" rx="3"/>
    <text class="u2l2-terminal-sign" x="442" y="138" text-anchor="middle">+</text></g>
  <g data-part="lamp"><circle class="u2l2-lamp-glow" cx="560" cy="130" r="24"/><circle class="u2l2-lamp" cx="560" cy="130" r="16"/><path class="u2l2-lamp-x" d="M549 119 L571 141 M571 119 L549 141"/></g>
  <g data-part="lamp"><circle class="u2l2-lamp-glow" cx="560" cy="196" r="24"/><circle class="u2l2-lamp" cx="560" cy="196" r="16"/><path class="u2l2-lamp-x" d="M549 185 L571 207 M571 185 L549 207"/></g>
  <g data-part="switch"><line class="u2l2-switch-lever" x1="650" y1="172" x2="630" y2="152"/><circle class="u2l2-switch-contact" cx="650" cy="172" r="5"/><circle class="u2l2-switch-contact" cx="650" cy="196" r="5"/></g>
  ${arTxt(404, 100, 'مولّد', 'u2l2-part-sub')}
  ${arTxt(430, 176, 'مصباحان', 'u2l2-part-sub')}
  ${arTxt(700, 168, 'مفتاح', 'u2l2-part-sub')}
  ${arTxt(556, 70, 'دارة كهربائية', 'u2l2-part-label')}
  ${arTxt(556, 262, 'دارة مغلقة تنتقل فيها الطاقة من المولّد إلى المصباحين', 'u2l2-part-sub')}`;

/* p93 / p94: identical cells connected on series and on parallel.
   The printed figures carry only the total («6 Volts» on p93, «1.5 Volts» on
   p94) and the cell symbols; the + and − signs and the cell numbers below are the
   platform's own labelling, added so every part is identifiable.
   The geometry is data-driven and recorded in data-* attributes, so tests can
   check that the series chain really runs − of one cell into + of the next, and
   that the parallel bank really joins every + to one rail and every − to the other. */
const BANK_CELLS = 4;
const BANK_X = Object.freeze([130, 270, 410, 550]);

/* A single cell of the bank. `flipped` turns the cell upside down so its + cap is
   at the bottom; the series chain needs this to run − of one cell into + of the
   next along one level, without a wire crossing a cell. */
function cellSymbol(x, topY, bottomY, index, bank, flipped = false) {
  const inset = bank === 'series' ? 16 : 14;
  const bodyTop = topY + inset;
  const bodyBottom = bottomY - inset;
  const positiveY = flipped ? bodyBottom - 6 : bodyTop + 22;
  const negativeY = flipped ? bodyTop + 22 : bodyBottom - 6;
  return `<g class="u2l2-cell-symbol" data-cell="${index + 1}" data-bank="${bank}" data-x="${x}" data-top="${topY}" data-bottom="${bottomY}" data-flipped="${flipped}">
    <line class="u2l2-cell-stub" x1="${x}" y1="${topY}" x2="${x}" y2="${bodyTop}"/>
    <line class="u2l2-cell-stub" x1="${x}" y1="${bodyBottom}" x2="${x}" y2="${bottomY}"/>
    <rect class="u2l2-cell-body" x="${x - 21}" y="${bodyTop}" width="42" height="${bodyBottom - bodyTop}" rx="7"/>
    <rect class="u2l2-cell-band" x="${x - 21}" y="${bodyTop + 8}" width="42" height="10"/>
    <text class="u2l2-terminal-sign u2l2-cell-sign" data-terminal="positive" data-cell-terminal="positive" x="${x}" y="${positiveY}" text-anchor="middle" direction="ltr">+</text>
    <text class="u2l2-terminal-sign u2l2-cell-sign" data-terminal="negative" data-cell-terminal="negative" x="${x}" y="${negativeY}" text-anchor="middle" direction="ltr">−</text>
    ${arTxt(x, bottomY + 46, `خلية ${index + 1}`, 'u2l2-part-sub')}
  </g>`;
}

const SERIES_TOP = 130;
const SERIES_BOTTOM = 230;
const SERIES_BANK_SVG = `
  <rect class="u2l2-bank-box" x="70" y="70" width="540" height="230" rx="18"/>
  ${BANK_X.map((x, i) => cellSymbol(x, SERIES_TOP, SERIES_BOTTOM, i, 'series', i % 2 === 1)).join('')}
  ${BANK_X.slice(0, -1).map((x, i) => {
    const next = BANK_X[i + 1];
    const y = i % 2 === 0 ? SERIES_BOTTOM : SERIES_TOP;
    return `<path class="u2-wire" data-bank-wire="chain-${i + 1}" data-wire data-from="cell${i + 1}-negative" data-to="cell${i + 2}-positive" data-level="${y}" d="M${x} ${y} H${next}"/>`;
  }).join('')}
  <path class="u2l2-voltage-bracket" d="M${BANK_X[0]} ${SERIES_TOP} V96 H${BANK_X[3]} V${SERIES_TOP}"/>
  ${txt((BANK_X[0] + BANK_X[3]) / 2, 84, '6 Volts', 'u2l2-voltage-label')}
  ${arTxt(340, 44, 'وصل مجموعة مولّدات متماثلة على التسلسل', 'u2l2-part-label')}
  ${arTxt(340, 340, 'موجب كل خلية إلى سالب الخلية التي تليها، فتضاف الجهود', 'u2l2-part-sub')}
`;

const PARALLEL_TOP = 118;
const PARALLEL_BOTTOM = 236;
const PARALLEL_BANK_SVG = `
  <rect class="u2l2-bank-box" x="70" y="70" width="540" height="230" rx="18"/>
  <path class="u2-wire" data-wire d="M${BANK_X[0]} ${PARALLEL_TOP} H634"/>
  <path class="u2-wire" data-wire d="M${BANK_X[0]} ${PARALLEL_BOTTOM} H634"/>
  ${BANK_X.map((x, i) => cellSymbol(x, PARALLEL_TOP, PARALLEL_BOTTOM, i, 'parallel')).join('')}
  <path class="u2l2-voltage-bracket" d="M634 ${PARALLEL_TOP} H648 M648 ${PARALLEL_TOP} V${PARALLEL_BOTTOM} M634 ${PARALLEL_BOTTOM} H648"/>
  ${txt(676, (PARALLEL_TOP + PARALLEL_BOTTOM) / 2 + 6, '1.5 Volts', 'u2l2-voltage-label')}
  ${arTxt(340, 44, 'وصل عدة مولّدات متماثلة على التفرع', 'u2l2-part-label')}
  ${arTxt(340, 340, 'جميع الأقطاب الموجبة على خط واحد، وجميع السالبة على خط واحد', 'u2l2-part-sub')}
`;

export const UNIT2L2_DIAGRAMS = Object.freeze({
  'intro-scenes': {
    title: 'مشهدا الافتتاح: صف الدومينو والدارة المغلقة',
    platformNote: 'إعادة بناء تخطيطية من المنصة لصورتَي ص87: صف دومينو يتساقط بالتتابع، ودارة بمصباحين ومولّد ومفتاح مغلق. الصور الفوتوغرافية في الكتاب لا تُعاد طباعتها، والرسم يوضّح الوضع نفسه لا الصورة نفسها.',
    description: 'على اليسار صف من قطع الدومينو تسقط بالتتابع بعد دفعة واحدة، وعلى اليمين دارة كهربائية مغلقة فيها مولّد ومصباحان ومفتاح مغلق.',
    svg: frame('intro-scenes', 'دومينو ودارة', 'صف دومينو يتساقط بالتتابع، ودارة كهربائية مغلقة فيها مولّد ومصباحان ومفتاح.', `${DOMINO_SVG}${INTRO_CIRCUIT_SVG}`, 320),
    legend: [{ color: 'coral', symbol: 'المشهدان يفتحان أسئلة ص87: من أين نحصل على الطاقة الكهربائية، وكيف تنتقل إلى المصباح؟' }],
  },
  'current-direction': {
    title: 'جهة التيار وحركة الإلكترونات',
    platformNote: `إعادة بناء تخطيطية من المنصة لشكل الكتاب ص89: المولّد في الأعلى (القطب الموجب يساراً والسالب يميناً)، والمصباح يساراً والقاطعة يميناً. الأسهم الصفراء لجهة التيار الاصطلاحية (اصطلاح أمبير)، والأسهم الحمراء ${tex('e^{-}', 'electrons')} لحركة الإلكترونات في الاتجاه المعاكس. Educational simplified model.`,
    description: 'دارة مغلقة: المولّد (مصدر الطاقة الكهربائية) في الأعلى، والمصباح (الجهاز الكهربائي المستهلك) يساراً، والمفتاح (القاطعة) يميناً، وتصل بينها أسلاك التوصيل (الموصل الكهربائي). الأسهم الصفراء خارج الحلقة تبيّن جهة التيار الاصطلاحية، والأسهم الحمراء داخلها تبيّن حركة الإلكترونات بالاتجاه المعاكس.',
    svg: frame('current-direction', 'جهة التيار الاصطلاحية وحركة الإلكترونات', 'المولّد في الأعلى وقطبه الموجب يساراً والسالب يميناً، والمصباح يساراً والمفتاح يميناً. أسهم صفراء للتيار الاصطلاحي من القطب الموجب إلى القطب السالب خارج المولّد، وأسهم حمراء للإلكترونات بالاتجاه المعاكس.', CURRENT_DIRECTION_SVG, 420),
    legend: [
      { color: 'yellow', symbol: `أسهم صفراء: جهة التيار الاصطلاحية ${tex('I', 'I')} — من القطب الموجب (+) إلى القطب السالب (−) خارج المولّد` },
      { color: 'red', symbol: `أسهم حمراء: حركة الإلكترونات ${tex('e^{-}', 'electrons')} — من القطب السالب (−) إلى القطب الموجب (+) خارج المولّد، عكس جهة التيار` },
    ],
  },
  'qt-graph': {
    title: 'الخط البياني لكمية الكهرباء بدلالة الزمن',
    platformNote: `إعادة بناء لشبكة الكتاب ص90 بنقاط (5,20) (10,40) (15,60) (20,80) (25,100). الخط المستقيم يعني أن ${tex('\\dfrac{q}{t}', 'q over t')} ثابتة.`,
    description: 'نقاط على خط مستقيم صاعد: كمية الكهرباء تتناسب طرداً مع الزمن عند تيار متواصل ثابت.',
    svg: frame('qt-graph', 'q versus t', 'المحور الأفقي t من 0 إلى 35 s والمحور العمودي q من 0 إلى 120 C؛ نقاط منتظمة على خط مستقيم من (5,20) إلى (25,100).', `
      <line class="u2-axis" x1="80" y1="300" x2="680" y2="300"/><line class="u2-axis" x1="80" y1="300" x2="80" y2="40"/>
      ${[0,1,2,3,4,5,6,7].map((i)=>`<line class="u2-grid" x1="${80+i*80}" y1="300" x2="${80+i*80}" y2="50"/>`).join('')}
      ${[0,1,2,3,4,5,6].map((i)=>`<line class="u2-grid" x1="80" y1="${300-i*40}" x2="640" y2="${300-i*40}"/>`).join('')}
      ${QT_TICKS}
      ${txt(80, 28, 'q (C)', 'u2l2-axis-label')}${txt(684, 288, 't (s)', 'u2l2-axis-label')}
      <polyline fill="none" stroke="#33568f" stroke-width="3" points="160,260 240,220 320,180 400,140 480,100"/>
      ${[[160,260],[240,220],[320,180],[400,140],[480,100]].map(([x,y])=>`<circle class="u2-plot" cx="${x}" cy="${y}" r="6"/>`).join('')}
    `),
    legend: [{ color: 'blue', symbol: `نقاط الكتاب: تيار ثابت ${tex('4\\,\\mathrm{A}', '4 A')}` }],
  },
  'series-circuit': {
    title: 'دارة على التسلسل',
    platformNote: `تخطيط من المنصة لشكل الكتاب ص92: مصباحان ومقياسا أمبير والتيار ${tex('200\\,\\mathrm{mA}', '200 mA')} في الجزأين. Educational simplified model.`,
    description: `مسار واحد: التيار نفسه ${tex('200\\,\\mathrm{mA}', '200 mA')} عند A1 و A2.`,
    svg: frame('series-circuit', 'وصل على التسلسل', 'مسار واحد مغلق: المولّد ثم مقياس الأمبير A1 ثم المصباحان L1 و L2 ثم مقياس الأمبير A2 والعودة إلى المولّد؛ يمر التيار نفسه في كل الأجهزة.', SERIES_CIRCUIT_SVG),
    legend: [{ color: 'blue', symbol: 'I ثابت في كل أجزاء الدارة المغلقة على التسلسل' }],
  },
  'parallel-circuit': {
    title: 'دارة على التفرع',
    platformNote: 'تخطيط من المنصة لشكل الكتاب ص93: فرعان بمصباحين ومقاييس. في المصدر المصباح الثاني مكتوب L1؛ الرسم يحفظ التفرع دون اختلاق قيم لم تُطبع.',
    description: 'فرعان متوازيان؛ التيار الأصلي مجموع تياري الفرعين.',
    svg: frame('parallel-circuit', 'وصل على التفرع', 'دارة مغلقة: من المولّد إلى مقياس الأمبير A في الخط الأصلي، ثم فرعان متوازيان: في الأعلى A1 مع المصباح L1، وفي الأسفل A2 مع مصباح مطبوع عليه L1 في المصدر؛ يلتقي الفرعان ويعود التيار إلى المولّد.', PARALLEL_CIRCUIT_SVG),
    legend: [{ color: 'teal', symbol: 'التيار الأصلي = مجموع تياري الفرعين' }],
  },
  'batteries-series': {
    title: 'مولّدات متماثلة على التسلسل',
    platformNote: 'إعادة بناء تخطيطية من المنصة لشكل الكتاب ص93: أربع خلايا متماثلة، موجب كل خلية إلى سالب التي تليها، والمجموع المطبوع في الكتاب 6 Volts. أرقام الخلايا وعلامتا + و− تسميات من المنصة لتحديد الأجزاء، وليست مطبوعة في الصورة.',
    description: 'أربع خلايا متماثلة موصولة على التسلسل: يصل سلك من القطب السالب لكل خلية إلى القطب الموجب للخلية التالية، ويقاس مجموع الجهود بين طرفي السلسلة فيكون 6 Volts.',
    svg: frame('batteries-series', 'وصل على التسلسل', 'سلسلة من أربع خلايا: القطب السالب لكل خلية موصول بالقطب الموجب للخلية التالية، وقوس في الأعلى يبيّن مجموع الجهود 6 Volts.', SERIES_BANK_SVG, 370),
    legend: [
      { color: 'blue', symbol: 'القطب الموجب (+) والسالب (−) على كل خلية، والخلايا تتناوب اتجاهها لتصل السلسلة' },
      { color: 'yellow', symbol: `المجموع المطبوع في الكتاب: ${tex('6\\,\\mathrm{Volts}', '6 volts')} لأربع خلايا متماثلة` },
    ],
  },
  'batteries-parallel': {
    title: 'مولّدات متماثلة على التفرع',
    platformNote: 'إعادة بناء تخطيطية من المنصة لشكل الكتاب ص94: أربع خلايا متماثلة على التفرع، والجهد المطبوع 1.5 Volts. أرقام الخلايا وعلامتا + و− تسميات من المنصة لتحديد الأجزاء.',
    description: 'أربع خلايا متماثلة موصولة على التفرع: جميع الأقطاب الموجبة على خط ناقل واحد وجميع السالبة على خط آخر، فيبقى الجهد بين طرفي المجموعة 1.5 Volts.',
    svg: frame('batteries-parallel', 'وصل على التفرع', 'مجموعة على التفرع: خط أعلى يجمع الأقطاب الموجبة وخط أسفل يجمع السالبة، وقوس على اليمين يبيّن 1.5 Volts.', PARALLEL_BANK_SVG, 370),
    legend: [
      { color: 'blue', symbol: 'القطب الموجب (+) والسالب (−) على كل خلية' },
      { color: 'teal', symbol: `الجهد المطبوع في الكتاب: ${tex('1.5\\,\\mathrm{Volts}', '1.5 volts')} كما في خلية واحدة` },
    ],
  },
});
