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

export const UNIT2L2_DIAGRAMS = Object.freeze({
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
    svg: frame('qt-graph', 'q versus t', 'نقاط منتظمة على خط مستقيم من (5,20) إلى (25,100).', `
      <line class="u2-axis" x1="80" y1="300" x2="680" y2="300"/><line class="u2-axis" x1="80" y1="300" x2="80" y2="40"/>
      ${[0,1,2,3,4,5,6].map((i)=>`<line class="u2-grid" x1="${80+i*80}" y1="300" x2="${80+i*80}" y2="50"/>`).join('')}
      ${[0,1,2,3,4,5,6].map((i)=>`<line class="u2-grid" x1="80" y1="${300-i*40}" x2="640" y2="${300-i*40}"/>`).join('')}
      ${txt(40, 50, 'q (C)')}${txt(680, 320, 't (s)')}
      <polyline fill="none" stroke="#33568f" stroke-width="3" points="160,260 240,220 320,180 400,140 480,100"/>
      ${[[160,260],[240,220],[320,180],[400,140],[480,100]].map(([x,y])=>`<circle class="u2-plot" cx="${x}" cy="${y}" r="6"/>`).join('')}
    `),
    legend: [{ color: 'blue', symbol: `نقاط الكتاب: تيار ثابت ${tex('4\\,\\mathrm{A}', '4 A')}` }],
  },
  'series-circuit': {
    title: 'دارة على التسلسل',
    platformNote: `تخطيط من المنصة لشكل الكتاب ص92: مصباحان ومقياسا أمبير والتيار ${tex('200\\,\\mathrm{mA}', '200 mA')} في الجزأين. Educational simplified model.`,
    description: `مسار واحد: التيار نفسه ${tex('200\\,\\mathrm{mA}', '200 mA')} عند A1 و A2.`,
    svg: frame('series-circuit', 'وصل على التسلسل', 'مسار واحد يمر فيه التيار نفسه في كل الأجهزة.', `
      <rect x="40" y="150" width="70" height="40" class="u2-cell"/>${txt(75, 175, '+ −')}
      <circle cx="200" cy="80" r="22" class="u2-ammeter"/>${txt(200, 85, 'A1')}
      <circle cx="360" cy="80" r="28" class="u2-bulb"/>${txt(360, 85, 'L1')}
      <circle cx="520" cy="80" r="28" class="u2-bulb"/>${txt(520, 85, 'L2')}
      <circle cx="640" cy="170" r="22" class="u2-ammeter"/>${txt(640, 175, 'A2')}
      <path class="u2-wire" d="M110 170 H640 V102"/><path class="u2-wire" d="M640 192 V280 H75 V190"/>
      <path class="u2-wire" d="M200 102 V80"/><path class="u2-wire" d="M40 170 H75"/>
      ${txt(360, 330, 'I = 200 mA = Const')}
    `),
    legend: [{ color: 'blue', symbol: 'I ثابت في كل أجزاء الدارة المغلقة على التسلسل' }],
  },
  'parallel-circuit': {
    title: 'دارة على التفرع',
    platformNote: 'تخطيط من المنصة لشكل الكتاب ص93: فرعان بمصباحين ومقاييس. في المصدر المصباح الثاني مكتوب L1؛ الرسم يحفظ التفرع دون اختلاق قيم لم تُطبع.',
    description: 'فرعان متوازيان؛ التيار الأصلي مجموع تياري الفرعين.',
    svg: frame('parallel-circuit', 'وصل على التفرع', 'تيار المصدر ينقسم إلى فرعين ثم يلتقي.', `
      <rect x="40" y="160" width="70" height="40" class="u2-cell"/>${txt(75, 185, '+ −')}
      <circle cx="160" cy="180" r="20" class="u2-ammeter"/>${txt(160, 185, 'A')}
      <circle cx="280" cy="80" r="20" class="u2-ammeter"/>${txt(280, 85, 'A1')}
      <circle cx="440" cy="80" r="28" class="u2-bulb"/>${txt(440, 85, 'L1')}
      <circle cx="280" cy="280" r="20" class="u2-ammeter"/>${txt(280, 285, 'A2')}
      <circle cx="440" cy="280" r="28" class="u2-bulb"/>${txt(440, 285, 'L1')}
      <path class="u2-wire" d="M110 180 H160"/><path class="u2-wire" d="M180 180 H220 V80 H500 V180 H220 V280 H500 V180"/>
      ${txt(560, 180, 'I = I1 + I2')}
    `),
    legend: [{ color: 'teal', symbol: 'التيار الأصلي = مجموع تياري الفرعين' }],
  },
});
