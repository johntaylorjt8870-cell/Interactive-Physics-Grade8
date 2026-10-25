/* Accessible SVG artwork for Unit 2 Lesson 4 (book pp107–120).
 *
 * Every figure is a teaching reconstruction, not a facsimile of the printed
 * artwork. Each one carries its own <title>, <desc>, a visible source page and a
 * caption that says it is platform artwork. The disputed p116 resistor is drawn
 * generically (A/B/C/D, no invented colour value); the p111 comparison avoids the
 * duplicated 3/6 Ω readings that make the printed figure ambiguous.
 */

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const figure = (id, page, svg, caption, className = '') => `<figure class="r4-figure ${className}" data-figure="${id}" data-source-page="p${page}">
  ${svg}
  <figcaption><span class="r4-figure-tag">رسم توضيحي من المنصة</span><span>${caption}</span><span class="r4-figure-page" dir="ltr">p${page}</span></figcaption>
</figure>`;

const titles = (key, title, desc) => `<title id="${key}-title">${escapeHtml(title)}</title><desc id="${key}-desc">${escapeHtml(desc)}</desc>`;
const svgOpen = (key, viewBox, extra = '') => `<svg class="${key.startsWith('graph') ? 'r4-graph-svg' : 'r4-svg'}" viewBox="${viewBox}" role="img" aria-labelledby="${key}-title ${key}-desc" ${extra}>`;

/* ------------------------------------------------------------------------- */
/* Reusable schematic parts                                                  */
/* ------------------------------------------------------------------------- */

const wire = (d) => `<path class="r4-wire" d="${d}"/>`;
const resistor = (x, y, label, w = 96, h = 34) => `<g class="r4-resistor" data-part="resistor-${label}">
  <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="4"/>
  <text class="r4-part-label" x="${x}" y="${y + 7}" text-anchor="middle" direction="ltr">${label}</text></g>`;
const meter = (cx, cy, letter, label, side = 'below') => `<g class="r4-meter" data-part="meter-${letter}">
  <circle cx="${cx}" cy="${cy}" r="24"/><text class="r4-meter-letter" x="${cx}" y="${cy + 7}" text-anchor="middle" direction="ltr">${letter}</text>
  ${side === 'right'
    ? `<text class="r4-part-label" x="${cx + 32}" y="${cy + 5}" text-anchor="start">${label}</text>`
    : side === 'above'
      ? `<text class="r4-part-label" x="${cx}" y="${cy - 32}" text-anchor="middle">${label}</text>`
      : `<text class="r4-part-label" x="${cx}" y="${cy + 46}" text-anchor="middle">${label}</text>`}</g>`;
const battery = (cx, cy, vertical = true) => `<g class="r4-battery" data-part="battery">
  <path class="r4-battery-long" d="${vertical ? `M${cx} ${cy - 26}v52` : `M${cx - 26} ${cy}h52`}"/>
  <path class="r4-battery-short" d="${vertical ? `M${cx + 18} ${cy - 15}v30` : `M${cx - 15} ${cy + 18}h30`}"/>
  <text class="r4-sign" x="${vertical ? cx - 6 : cx - 30}" y="${vertical ? cy - 34 : cy - 14}" text-anchor="middle">+</text>
  <text class="r4-sign" x="${vertical ? cx + 26 : cx + 30}" y="${vertical ? cy - 34 : cy + 30}" text-anchor="middle">−</text></g>`;
const switchPart = (x, y, label = 'قاطعة') => `<g class="r4-switch" data-part="switch">
  <circle cx="${x}" cy="${y}" r="5"/><circle cx="${x}" cy="${y + 52}" r="5"/>
  <path class="r4-switch-lever" d="M${x} ${y}l-26 34"/>
  <text class="r4-part-label" x="${x + 14}" y="${y + 24}" text-anchor="start">${label}</text></g>`;
/* Vertical switch with a real gap and a lever that is drawn CLOSED (the book's
   series experiment is performed with the switch closed). */
const switchClosed = (x, y, gap = 52, label = 'قاطعة') => `<g class="r4-switch" data-part="switch">
  <circle cx="${x}" cy="${y}" r="5"/><circle cx="${x}" cy="${y + gap}" r="5"/>
  <path class="r4-switch-lever" d="M${x} ${y}v${gap}"/>
  <text class="r4-part-label" x="${x - 16}" y="${y + gap / 2 + 5}" text-anchor="end">${label}</text></g>`;
const arrow = (d, head) => `<path class="r4-flow-arrow" d="${d}"/><path class="r4-flow-head" d="${head}"/>`;
const headLeft = (x, y) => `m${x} ${y} 14 -7 v14 z`;
const headRight = (x, y) => `m${x} ${y} -14 -7 v14 z`;
const headUp = (x, y) => `m${x} ${y} -7 14 h14 z`;
const headDown = (x, y) => `m${x} ${y} -7 -14 h14 z`;

/* ------------------------------------------------------------------------- */
/* Graph helper (kept public: tests and lesson pages use it)                  */
/* ------------------------------------------------------------------------- */

export function graph(points, { id = 'r4-ohm-graph', maxI = 4, maxU = 16, active = null, xLabel = 'I (A)', yLabel = 'U (V)', extension = null } = {}) {
  const left = 64, right = 556, top = 30, bottom = 252;
  const x = (i) => left + (i / maxI) * (right - left);
  const y = (u) => bottom - (u / maxU) * (bottom - top);
  const grid = Array.from({ length: 6 }, (_, n) => {
    const gy = bottom - (n * (bottom - top)) / 5;
    const gx = left + (n * (right - left)) / 5;
    return `<path class="r4-grid" d="M${left} ${gy}H${right} M${gx} ${top}V${bottom}"/>
      <text class="r4-axis-tick" x="${gx}" y="${bottom + 19}" text-anchor="middle">${+(n * maxI / 5).toFixed(2)}</text>
      <text class="r4-axis-tick" x="${left - 10}" y="${gy + 5}" text-anchor="end">${+(n * maxU / 5).toFixed(2)}</text>`;
  }).join('');
  const sorted = [...points].sort((a, b) => a.i - b.i);
  const lineEnd = sorted.at(-1);
  const extrapolated = extension && !sorted.some((p) => p.i === extension.i);
  return `<svg class="r4-graph-svg" viewBox="0 0 620 318" role="img" aria-labelledby="${id}-title ${id}-desc">
    ${titles(id, 'خط بياني لفرق الكمون بدلالة شدة التيار', `المحور الأفقي ${xLabel} والرأسي ${yLabel}. النقاط: ${points.map((p) => `I=${p.i} A، U=${p.u} V`).join('؛ ')}`)}
    <rect class="r4-graph-back" x="14" y="10" width="592" height="292" rx="8"/>
    ${grid}
    <path class="r4-axis" d="M${left} ${top - 6}V${bottom}H${right + 10}"/>
    <path class="r4-plot-line" d="M${left} ${bottom}L${x(lineEnd.i)} ${y(lineEnd.u)}"/>
    ${sorted.map((p) => `<circle class="r4-plot-point" cx="${x(p.i)}" cy="${y(p.u)}" r="5.5"><title>I = ${p.i} A، U = ${p.u} V</title></circle>`).join('')}
    ${extension ? `<circle class="r4-plot-extension" cx="${x(extension.i)}" cy="${y(extension.u)}" r="7"><title>${extrapolated ? 'نقطة استيفاء' : 'امتداد'}: I = ${extension.i} A، U = ${extension.u} V</title></circle>
      <path class="r4-extension-line" d="M${left} ${y(extension.u)}H${x(extension.i)}V${bottom}"/>
      <text class="r4-annotation" x="${x(extension.i) - 10}" y="${y(extension.u) - 14}" text-anchor="end">${extrapolated ? 'قراءة استيفاء' : 'امتداد'} <tspan direction="ltr" unicode-bidi="isolate">(${extension.i} A, ${extension.u} V)</tspan></text>` : ''}
    ${active ? `<circle class="r4-plot-active" cx="${x(active.i)}" cy="${y(active.u)}" r="10"><title>الوضع الحالي I = ${active.i} A، U = ${active.u} V</title></circle>
      <path class="r4-active-line" d="M${left} ${y(active.u)}H${x(active.i)}V${bottom}"/>` : ''}
    <text class="r4-axis-label" x="${(left + right) / 2}" y="302" text-anchor="middle" direction="ltr">${xLabel}</text>
    <text class="r4-axis-label" x="17" y="20" text-anchor="start" direction="ltr">${yLabel}</text>
  </svg>`;
}

/* ------------------------------------------------------------------------- */
/* Figure builders                                                           */
/* ------------------------------------------------------------------------- */

function devicesFigure(key) {
  /* Three appliances in one row with a single statement underneath, so the note
     never sits on top of an appliance card (the earlier draft overlapped the
     middle card). The shared part is shown by the heat element drawn inside each
     appliance, not by a leader line. */
  const appliance = (x, label, detail) => `<g class="r4-appliance" transform="translate(${x} 34)">
    <rect class="r4-appliance-body" x="0" y="0" width="150" height="150" rx="16"/>
    <rect class="r4-heat-element" x="34" y="62" width="82" height="44" rx="8"/>
    <path class="r4-heat-wave" d="M42 84q12-14 24 0t24 0t24 0"/>
    <text class="r4-appliance-label" x="75" y="36" text-anchor="middle">${label}</text>
    <text class="r4-appliance-detail" x="75" y="132" text-anchor="middle">${detail}</text>
  </g>`;
  return figure('devices', 107, `${svgOpen(key, '0 0 620 320')}
    ${titles(key, 'ثلاثة أجهزة منزلية تحوّل الطاقة الكهربائية إلى حرارة', 'سخان ماء ومدفأة ومكواة، ويُبرز العنصر المقاوم المشترك الذي يسخن عند مرور التيار.')}
    <rect class="r4-canvas" x="10" y="10" width="600" height="292" rx="10"/>
    ${appliance(45, 'سخّان ماء', 'عنصر تسخين')}
    ${appliance(235, 'مدفأة', 'سلك مقاوم')}
    ${appliance(425, 'مكواة', 'لوح مقاوم')}
    <path class="r4-flow-arrow" d="M262 236H358"/><path class="r4-flow-head" d="${headLeft(262, 236)}"/>
    <text class="r4-axis-label" x="310" y="216" text-anchor="middle">كهرباء ← حرارة</text>
    <text class="r4-axis-label" x="310" y="278" text-anchor="middle">العنصر المشترك: ناقل مقاوم يمرّ فيه التيار فيسخن</text>
  </svg>`, 'الأجهزة الثلاثة تحوّل الطاقة الكهربائية إلى طاقة حرارية في عنصر مقاوم.');
}

function lampCircuitFigure(key) {
  /* Physics check: the added resistor of figure (2) is in the SAME series path —
     it is spliced into the top wire between the lamp and the right-hand lead, so
     there is exactly one path from the cell round the loop and back. The switch
     has a real gap (closed lever) on the bottom wire and its label sits below it.
     All labels are placed in empty regions: lamp below the lamp, ammeter to the
     right of the meter, resistor above the top wire. */
  const panel = (offsetX, title, extra) => `<g transform="translate(${offsetX} 26)">
    <rect class="r4-canvas" x="10" y="10" width="300" height="250" rx="10"/>
    <text class="r4-panel-label" x="160" y="36" text-anchor="middle">${title}</text>
    ${wire('M60 80H100')}
    <circle class="r4-lamp" cx="120" cy="80" r="20"/>
    <path class="r4-lamp-cross" d="M107 67l26 26m0-26-26 26"/>
    ${wire('M140 80H164')}
    ${extra
      ? `<g class="r4-resistor" data-part="resistor-extra"><rect x="164" y="63" width="56" height="34" rx="4"/><text class="r4-part-label" x="192" y="85" text-anchor="middle" direction="ltr">R</text></g>${wire('M220 80H262')}`
      : `${wire('M140 80H262')}`}
    ${wire('M262 80V108')}
    ${meter(262, 132, 'A', '')}
    ${wire('M262 156V190')}
    ${wire('M262 190H206')}
    <circle class="r4-switch" cx="200" cy="190" r="5"/><circle class="r4-switch" cx="148" cy="190" r="5"/>
    <path class="r4-switch-lever" d="M148 190l44-20"/>
    ${wire('M148 190H60V80')}
    ${battery(60, 135)}
    <text class="r4-part-label" x="120" y="122" text-anchor="middle">مصباح</text>
    <text class="r4-part-label" x="236" y="118" text-anchor="end">أمبيرمتر</text>
    <text class="r4-part-label" x="174" y="214" text-anchor="middle">قاطعة</text>
    <text class="r4-part-label" x="160" y="242" text-anchor="middle">${extra ? 'مقاومة مضافة على التسلسل' : 'بلا مقاومة مضافة'}</text>
  </g>`;
  return figure('lamp-circuit', 108, `${svgOpen(key, '0 0 660 310')}
    ${titles(key, 'دارتا تجربة ص108: مصباح وخلية وأمبيرمتر، ثم إضافة مقاومة على التسلسل', 'الشكل واحد: دارة المصباح والخلية والأمبيرمتر والقاطعة. الشكل اثنان: مقاومة مضافة في المسار نفسه بين المصباح وطرف الخلية.')}
    ${panel(340, 'الشكل (1)', false)}
    ${panel(10, 'الشكل (2)', true)}
    <text class="r4-axis-label" x="330" y="300" text-anchor="middle">في الشكلين مسار واحد مغلق: المقاومة المضافة تقع في المسار نفسه.</text>
  </svg>`, 'إعادة بناء للشكلين (1) و(2): إضافة مقاومة إلى مسار المصباح تقلّل التيار عادةً عند ثبات الخلية.');
}

function ohmSetupFigure(key) {
  return figure('ohm-setup', 109, `${svgOpen(key, '0 0 640 370')}
    ${titles(key, 'دارة تجربة أوم: مولد وقاطعة وأمبيرمتر ومقاومة وفولتميتر', 'المولد يساراً، والأمبيرمتر على التسلسل في المسار، والفولتميتر على التفرع بين طرفي المقاومة، والقاطعة على التسلسل.')}
    <rect class="r4-canvas" x="10" y="10" width="620" height="340" rx="10"/>
    ${wire('M110 90H530V280H110V90')}
    ${battery(110, 185)}
    ${meter(320, 90, 'A', 'أمبيرمتر على التسلسل', 'above')}
    ${resistor(450, 90, 'R')}
    ${wire('M402 90V56H498V90')}
    ${meter(450, 56, 'V', 'فولتميتر على التفرع', 'above')}
    ${switchPart(530, 150)}
    <text class="r4-axis-label" x="320" y="320" text-anchor="middle">يغيّر الطالب فرق كمون المولد، ويقرأ شدة التيار في المقاومة.</text>
    <text class="r4-part-label" x="260" y="72" text-anchor="middle">I</text>
    <path class="r4-flow-arrow" d="M240 90H288"/><path class="r4-flow-head" d="${headRight(288, 90)}"/>
  </svg>`, 'الدارة المعاد بناؤها لص109: A على التسلسل، وV بين طرفي R، والقاطعة مفتوحة أثناء التركيب.');
}

function slopeGraphFigure(key) {
  const points = [{ i: 0.5, u: 2 }, { i: 1, u: 4 }, { i: 1.5, u: 6 }, { i: 2, u: 8 }, { i: 3, u: 12 }];
  return figure('ohm-slope-graph', 110, `${graph(points, { id: key, maxI: 4, maxU: 16, extension: { i: 4, u: 16 } })}
    <div class="r4-graph-note"><span>نقطتان على الخط: <bdi dir="ltr">(1 A، 4 V)</bdi> و<bdi dir="ltr">(4 A، 16 V)</bdi></span>
    <span>الميل <bdi dir="ltr">ΔU/ΔI = (16 − 4) / (4 − 1) = 4 Ω</bdi></span></div>`,
  'الخط البياني لص110: النقاط المطبوعة والامتداد إلى (4 A، 16 V)، والميل يساوي المقاومة 4 Ω.', 'r4-graph-figure');
}

function wireCompareFigure(key) {
  /* Two controlled comparisons, stacked so nothing can collide:
       (1) same material and cross-section, length ℓ then 2ℓ;
       (2) same material and length, cross-section S then 2S.
     The printed book asks for the second comparison too; the first draft only
     described it in the caption. Labels sit at the free END of each wire, outside
     the drawn wire itself. */
  const row = (y, length, width, label) => `<g>
    <path class="r4-metal-wire" d="M150 ${y}h${length}" style="stroke-width:${width}"/>
    <text class="r4-part-label" x="150" y="${y - 16}" text-anchor="start">${label}</text>
  </g>`;
  return figure('wire-compare', 111, `${svgOpen(key, '0 0 640 400')}
    ${titles(key, 'مقارنة أسلاك متجانسة: الطول ومساحة المقطع', 'الجزء الأول: سلكان من المادة نفسها ومساحة المقطع نفسها، وطول الثاني ضعف الأول. الجزء الثاني: سلكان من المادة نفسها والطول نفسه، ومساحة مقطع الثاني ضعف الأول.')}
    <rect class="r4-canvas" x="10" y="10" width="620" height="378" rx="10"/>
    <text class="r4-panel-label" x="320" y="46" text-anchor="middle">1) المادة ومساحة المقطع ثابتتان</text>
    ${row(84, 120, 10, 'الطول ℓ')}
    ${row(140, 240, 10, 'الطول 2ℓ')}
    <text class="r4-part-label" x="320" y="180" text-anchor="middle">الطول يتغيّر وحده: R يتناسب طرداً مع ℓ</text>
    <path class="r4-divider" d="M60 208H580"/>
    <text class="r4-panel-label" x="320" y="242" text-anchor="middle">2) المادة والطول ثابتان</text>
    ${row(280, 200, 6, 'مقطع S')}
    ${row(340, 200, 20, 'مقطع 2S')}
    <text class="r4-part-label" x="320" y="378" text-anchor="middle">المقطع يتغيّر وحده: R يتناسب عكساً مع S</text>
  </svg>`, 'مقارنة الطول مع تثبيت المقطع، والمقطع مع تثبيت الطول. النوع يُقارن بالطريقة نفسها.');
}

function rhoWireFigure(key) {
  return figure('rho-wire', 112, `${svgOpen(key, '0 0 620 300')}
    ${titles(key, 'ناقل أسطواني ورمز الطول ومساحة المقطع والمقاومة النوعية', 'أسطوانة ناقل بطول ℓ ومساحة مقطع S، ويشير السهم إلى المقاومة النوعية رو للمادة.')}
    <rect class="r4-canvas" x="10" y="10" width="600" height="270" rx="10"/>
    <path class="r4-cylinder" d="M110 96h360v96H110z"/>
    <ellipse class="r4-cylinder-face" cx="470" cy="144" rx="34" ry="48"/>
    <ellipse class="r4-cylinder-face r4-cylinder-front" cx="110" cy="144" rx="22" ry="48"/>
    <path class="r4-dimension" d="M110 264H470"/>
    <path class="r4-dimension-tick" d="M110 254v20M470 254v20"/>
    <text class="r4-dimension-label" x="290" y="292" text-anchor="middle" direction="ltr">ℓ</text>
    <path class="r4-radius-line" d="M470 144h34"/>
    <text class="r4-part-label" x="510" y="148" text-anchor="start" direction="ltr">S</text>
    <text class="r4-part-label" x="292" y="82" text-anchor="middle" direction="ltr">ρ</text>
    <text class="r4-axis-label" x="292" y="212" text-anchor="middle">R = ρ ℓ / S</text>
    <text class="r4-axis-label" x="292" y="240" text-anchor="middle">ρ بوحدة أوم·متر</text>
  </svg>`, 'الناقل الأسطواني: الطول ℓ ومساحة المقطع S والمقاومة النوعية ρ. الوحدة أوم·متر.');
}

function seriesCircuitFigure(key) {
  /* Physics check (why this wiring, not the earlier draft):
     - the ammeter must be IN the conducting path, so it is spliced into the top
       wire between R₁ and R₂ with a real gap on both sides;
     - the voltmeter must be ACROSS the two resistors, so its branch leaves the
       top wire before R₁ and returns after R₂ — it is not spliced into the path;
     - the switch has a real gap with a closed lever, so it cannot look like a
       plain piece of wire. */
  return figure('series-circuit', 113, `${svgOpen(key, '0 0 700 400')}
    ${titles(key, 'دارة التسلسل: مقاومتان في مسار واحد ومقياسا أمبير وفولط', 'المولد على اليمين، والمقاومتان R1 وR2 على التسلسل في المسار العلوي، والأمبيرمتر في المسار نفسه، والفولتميتر على التفرع بين طرفي المقاومتين.')}
    <rect class="r4-canvas" x="10" y="10" width="680" height="370" rx="10"/>
    ${wire('M90 110H182')}
    ${resistor(230, 110, 'R₁')}
    ${wire('M278 110H316')}
    ${meter(340, 110, 'A', 'أمبيرمتر في المسار')}
    ${wire('M364 110H402')}
    ${resistor(450, 110, 'R₂')}
    ${wire('M498 110H620V150')}
    ${switchClosed(620, 150, 52, 'قاطعة')}
    ${wire('M620 202V300H90V110')}
    ${battery(90, 205)}
    ${wire('M170 110V214H316M364 214H520V110')}
    ${meter(340, 214, 'V', 'فولتميتر بين طرفي R₁ وR₂')}
    <circle class="r4-node" cx="170" cy="110" r="5"/><circle class="r4-node" cx="520" cy="110" r="5"/>
    <text class="r4-part-label" x="345" y="368" text-anchor="middle">مسار واحد: التيار نفسه في كل عنصر</text>
    <path class="r4-flow-arrow" d="M110 110H150"/><path class="r4-flow-head" d="${headRight(158, 110)}"/>
    <path class="r4-flow-arrow" d="M372 96H396"/><path class="r4-flow-head" d="${headRight(404, 96)}"/>
  </svg>`, 'التسلسل: R₁ وR₂ في مسار واحد، والأمبيرمتر في المسار نفسه، وV على التفرع بين طرفي المقاومتين.');
}

function parallelCircuitFigure(key) {
  /* Physics check (why this wiring):
     - R₁ and R₂ are the two branches between the SAME pair of nodes, each with its
       own ammeter spliced into that branch;
     - the voltmeter is a third branch across the same two nodes, so it reads the
       common potential difference — it is never spliced into a resistor branch;
     - the generator and its main ammeter sit on the outer loop, so I = I₁ + I₂ is
       readable from the three meters.
     The previous draft drew V on top of the right node and left a stray wire
     crossing it; that has been replaced by explicit branch leads. */
  return figure('parallel-circuit', 114, `${svgOpen(key, '0 0 700 420')}
    ${titles(key, 'دارة التفرع: مقاومتان بين العقدتين نفسيهما ومقياسان لكل فرع', 'المقاومتان R1 وR2 بين العقدتين نفسيهما، لكل فرع أمبيرمتر، وفولتميتر على فرع ثالث بين العقدتين، والمولد مع أمبيرمتر رئيسي في الحلقة الخارجية.')}
    <rect class="r4-canvas" x="10" y="10" width="680" height="400" rx="10"/>
    ${wire('M170 80V270')}
    ${wire('M530 80V270')}
    ${wire('M170 80H227')}
    ${meter(250, 80, 'A₁', '')}
    ${wire('M273 80H374')}
    ${resistor(420, 80, 'R₁')}
    ${wire('M466 80H530')}
    ${wire('M170 270H227')}
    ${meter(250, 270, 'A₂', '')}
    ${wire('M273 270H374')}
    ${resistor(420, 270, 'R₂')}
    ${wire('M466 270H530')}
    ${wire('M170 170H326')}
    ${meter(350, 170, 'V', 'بين العقدتين')}
    ${wire('M374 170H530')}
    ${wire('M170 170H96V244')}
    ${battery(96, 270)}
    ${wire('M96 296V370H327')}
    ${meter(350, 370, 'A', 'تيار المولد', 'above')}
    ${wire('M373 370H604V170H530')}
    <circle class="r4-node" cx="170" cy="170" r="6"/><circle class="r4-node" cx="530" cy="170" r="6"/>
  </svg>`, 'التفرع: R₁ وR₂ بين العقدتين نفسيهما، فيتساوى فرق الكمون على الفرعين، ويتوزّع التيار.');
}

function equivalentSummaryFigure(key) {
  return figure('equivalent-summary', 115, `${svgOpen(key, '0 0 700 330')}
    ${titles(key, 'ملخص المقاومة المكافئة في التسلسل والتفرع', 'على اليمين دارة تسلسل ومقاومتها المكافئة مجموع المقاومتين. على اليسار دارة تفرع ومقلوب مكافئتها مجموع مقلوبي المقاومتين.')}
    <rect class="r4-canvas" x="10" y="10" width="330" height="300" rx="10"/>
    <rect class="r4-canvas" x="360" y="10" width="330" height="300" rx="10"/>
    <text class="r4-panel-label" x="175" y="48" text-anchor="middle">على التسلسل</text>
    ${resistor(110, 120, 'R₁', 70, 30)}${resistor(235, 120, 'R₂', 70, 30)}
    <path class="r4-wire" d="M60 120H75M145 120H200M270 120H300"/>
    <text class="r4-formula-text" x="175" y="204" text-anchor="middle" direction="ltr">R_eq = R₁ + R₂</text>
    <text class="r4-axis-label" x="175" y="244" text-anchor="middle">المكافئة أكبر من كل مقاومة</text>
    <text class="r4-axis-label" x="175" y="276" text-anchor="middle">التيار نفسه في المسار</text>
    <text class="r4-panel-label" x="525" y="48" text-anchor="middle">على التفرع</text>
    <path class="r4-wire" d="M430 105H620M430 175H620"/>
    ${resistor(525, 105, 'R₁', 80, 28)}${resistor(525, 175, 'R₂', 80, 28)}
    <text class="r4-formula-text" x="525" y="240" text-anchor="middle" direction="ltr">1/R_eq = 1/R₁ + 1/R₂</text>
    <text class="r4-axis-label" x="525" y="278" text-anchor="middle">المكافئة أصغر من أصغر مقاومة</text>
  </svg>`, 'مقارنة العلاقتين: مجموع المقاومات في التسلسل، ومجموع المقلوبات في التفرع.');
}

function resistorBandsFigure(key) {
  return figure('resistor-bands', 116, `${svgOpen(key, '0 0 640 260')}
    ${titles(key, 'مقاومة بأربع حلقات مسمّاة A وB وC وD', 'شكل رمادي عام لمقاومة كربونية بأربع حلقات. A وB رقمان، وC أس المضاعف، وD حلقة التفاوت معزولة. لا يُنسب إلى الشكل أي لون أو قيمة محددة.')}
    <rect class="r4-canvas" x="10" y="10" width="620" height="230" rx="10"/>
    <path class="r4-lead" d="M40 120H130"/><path class="r4-lead" d="M510 120H600"/>
    <rect class="r4-resistor-body" x="130" y="82" width="380" height="76" rx="30"/>
    <rect class="r4-band" x="190" y="82" width="18" height="76"/><text class="r4-band-label" x="199" y="190" text-anchor="middle" direction="ltr">A</text>
    <rect class="r4-band" x="235" y="82" width="18" height="76"/><text class="r4-band-label" x="244" y="190" text-anchor="middle" direction="ltr">B</text>
    <rect class="r4-band" x="300" y="82" width="18" height="76"/><text class="r4-band-label" x="309" y="190" text-anchor="middle" direction="ltr">C</text>
    <rect class="r4-band r4-band-tolerance" x="446" y="82" width="18" height="76"/><text class="r4-band-label" x="455" y="190" text-anchor="middle" direction="ltr">D</text>
    <text class="r4-axis-label" x="320" y="220" text-anchor="middle">A وB: رقمان · C: أس المضاعف · D: التفاوت (معزولة)</text>
    <text class="r4-axis-label" x="320" y="60" text-anchor="middle" direction="ltr">R = (10A + B) × 10^C</text>
  </svg>`, 'شكل عام لقراءة الأربع حلقات؛ ألوان الشكل الأصلي غير محسومة، فلا تُنسب إليه قيمة محددة.', 'r4-band-figure');
}

function rheostatFigure(key) {
  return figure('rheostat', 117, `${svgOpen(key, '0 0 640 300')}
    ${titles(key, 'مقاومة متغيرة بمنزلق، يتغيّر طول الجزء الفعال من المسار', 'سلك مقاوم على قضيب، ومنزلق يتحرك ليغيّر طول الجزء المستعمل من المقاومة، فيتغيّر التيار.')}
    <rect class="r4-canvas" x="10" y="10" width="620" height="270" rx="10"/>
    <path class="r4-rheostat-track" d="M110 154H520"/>
    <path class="r4-rheostat-shade" d="M110 132H300V176H110z"/>
    <rect class="r4-slider" x="286" y="92" width="30" height="84" rx="6"/>
    <path class="r4-slider-handle" d="M301 92V54"/>
    <path class="r4-flow-arrow" d="M301 40h64"/><path class="r4-flow-head" d="${headRight(365, 40)}"/>
    <text class="r4-part-label" x="372" y="46" text-anchor="start">تحريك الزلاقة</text>
    <text class="r4-part-label" x="110" y="206" text-anchor="start">الطول الفعّال ℓ</text>
    <path class="r4-dimension" d="M110 186H286"/>
    <text class="r4-axis-label" x="320" y="252" text-anchor="middle">R = ρ ℓ / S: تقليل الطول الفعّال يقلّل المقاومة ويزيد التيار</text>
  </svg>`, 'المقاومة المتغيرة: الزلاقة تغيّر طول الجزء المستعمل من الناقل، فيتغيّر التيار.');
}

function ledFigure(key) {
  /* Physics check: the triangle points from the ANODE to the CATHODE bar, and the
     cell's + plate is on the anode side, so the diode is drawn forward-biased.
     The loop is closed, the current-limiting resistor is in series, and the light
     arrows leave the junction rather than the metal lead. */
  return figure('led', 117, `${svgOpen(key, '0 0 640 330')}
    ${titles(key, 'ثنائي ضوئي LED مع مقاومة تحديد تيار وقطبية صحيحة', 'دارة مغلقة: مصباح ليد بمصعد ومهبط ومقاومة تحديد تيار على التسلسل مع خلية، والمصعد متصل بقطب الخلية الموجب.')}
    <rect class="r4-canvas" x="10" y="10" width="620" height="300" rx="10"/>
    ${wire('M70 110H150')}
    ${resistor(200, 110, 'R', 78, 32)}
    ${wire('M239 110H300')}
    <path class="r4-diode-body" d="M300 78L360 110L300 142z"/>
    <path class="r4-diode-bar" d="M360 76V144"/>
    ${wire('M360 110H576V250H70V150')}
    ${battery(70, 200)}
    <path class="r4-photon" d="M372 72l22-22M382 92l26-12M376 108l34-4"/>
    <path class="r4-photon-head" d="m394 50 10-3-4 10z"/>
    <text class="r4-part-label" x="294" y="62" text-anchor="end">مصعد (+)</text>
    <text class="r4-part-label" x="374" y="176" text-anchor="start">مهبط (−)</text>
    <text class="r4-part-label" x="200" y="152" text-anchor="middle">مقاومة تحديد التيار</text>
    <text class="r4-part-label" x="296" y="176" text-anchor="middle">LED</text>
    <text class="r4-axis-label" x="320" y="286" text-anchor="middle">القطبية الصحيحة شرط للإضاءة، ومقاومة التسلسل تحدد التيار</text>
  </svg>`, 'الليد قطبي: المصعد نحو القطب الموجب والمهبط نحو السالب، ويحتاج مقاومة تحديد تيار. لا يُعامل مقاومة أومية خطية.');
}

function summaryMapFigure(key) {
  const node = (x, y, title, body) => `<g class="r4-map-node" transform="translate(${x} ${y})">
    <rect x="0" y="0" width="186" height="88" rx="10"/>
    <text class="r4-map-title" x="93" y="28" text-anchor="middle">${title}</text>
    <text class="r4-map-body" x="93" y="54" text-anchor="middle" direction="ltr">${body}</text>
  </g>`;
  return figure('summary-map', 118, `${svgOpen(key, '0 0 700 330')}
    ${titles(key, 'خريطة قوانين الدرس الأربعة', 'قانون أوم، قانون السلك، المكافئة في التسلسل، والمكافئة في التفرع، مع تحويل الطاقة إلى حرارة.')}
    <rect class="r4-canvas" x="10" y="10" width="680" height="300" rx="10"/>
    ${node(80, 40, 'قانون أوم', 'R = U / I')}
    ${node(430, 40, 'قانون السلك', 'R = ρ ℓ / S')}
    ${node(80, 190, 'التسلسل', 'R_eq = R₁ + R₂')}
    ${node(430, 190, 'التفرع', '1/R_eq = 1/R₁ + 1/R₂')}
    <path class="r4-map-arrow" d="M270 84H426"/>
    <path class="r4-map-arrow" d="M173 136V186"/>
    <path class="r4-map-arrow" d="M523 136V186"/>
    <text class="r4-map-caption" x="350" y="80" text-anchor="middle">حرارة = طاقة كهربائية متحوّلة</text>
    <text class="r4-map-caption" x="350" y="166" text-anchor="middle">مقاومة واحدة مكافئة</text>
  </svg>`, 'خريطة مفاهيم الدرس: القوانين الأربعة ومصدر الحرارة في الناقل.');
}

function selfCheckGraphFigure(key) {
  return figure('self-check-graph', 119, `${graph([{ i: 2, u: 10 }, { i: 3, u: 15 }, { i: 5, u: 25 }, { i: 7, u: 35 }, { i: 9, u: 45 }], { id: key, maxI: 10, maxU: 50, extension: { i: 6, u: 30 } })}
    <div class="r4-graph-note"><span>نقاط المخطط المطبوعة: <bdi dir="ltr">(2، 10)</bdi>، <bdi dir="ltr">(3، 15)</bdi>، <bdi dir="ltr">(5، 25)</bdi>، <bdi dir="ltr">(7، 35)</bdi>، <bdi dir="ltr">(9، 45)</bdi></span>
    <span>الاستيفاء عند <bdi dir="ltr">I = 6 A</bdi> يعطي <bdi dir="ltr">U = 30 V</bdi>.</span></div>`,
  'مخطط ص119 بعد إعادة رسمه: مستقيم يمر بالأصل، والنقاط المطبوعة عليه. قراءة 6 A استيفاء لا نقطة أصلية.', 'r4-graph-figure');
}

/* ------------------------------------------------------------------------- */
/* Public registry                                                           */
/* ------------------------------------------------------------------------- */

export const UNIT2L4_DIAGRAMS = Object.freeze({
  devices: Object.freeze({ page: 107, title: 'أجهزة تتحول فيها الكهرباء إلى حرارة', description: 'سخان ماء ومدفأة ومكواة مع إبراز العنصر المقاوم المشترك.' }),
  'lamp-circuit': Object.freeze({ page: 108, title: 'دارتا المصباح قبل المقاومة وبعدها', description: 'الشكل واحد دون مقاومة مضافة، والشكل اثنان مع مقاومة على التسلسل.' }),
  'ohm-setup': Object.freeze({ page: 109, title: 'دارة قياس قانون أوم', description: 'مولد وقاطعة وأمبيرمتر على التسلسل وفولتميتر بين طرفي المقاومة.' }),
  'ohm-slope-graph': Object.freeze({ page: 110, title: 'ميل خط فرق الكمون', description: 'نقاط جدول ص109 مع امتداد الخط إلى النقطة 4 أمبير و16 فولت.' }),
  'wire-compare': Object.freeze({ page: 111, title: 'مقارنة أسلاك متجانسة', description: 'تثبيت النوع والمقطع وتغيير الطول، بلا قراءات أوم مخترعة.' }),
  'rho-wire': Object.freeze({ page: 112, title: 'ناقل أسطواني وقانون السلك', description: 'الطول ومساحة المقطع والمقاومة النوعية ووحداتها.' }),
  'series-circuit': Object.freeze({ page: 113, title: 'دارة التسلسل', description: 'مقاومتان في مسار واحد وأمبيرمتر وفولتميتر.' }),
  'parallel-circuit': Object.freeze({ page: 114, title: 'دارة التفرع', description: 'مقاومتان بين العقدتين نفسيهما مع قياس التيار والكمون.' }),
  'equivalent-summary': Object.freeze({ page: 115, title: 'ملخص المكافئة', description: 'مقارنة علاقة التسلسل وعلاقة التفرع.' }),
  'resistor-bands': Object.freeze({ page: 116, title: 'حلقات المقاومة A B C D', description: 'شكل عام بلا نسبة لونية إلى الرسم الأصلي المتعارض.' }),
  rheostat: Object.freeze({ page: 117, title: 'المقاومة المتغيرة', description: 'زلاقة تغيّر الطول الفعال، ومن ثم المقاومة والتيار.' }),
  led: Object.freeze({ page: 117, title: 'الثنائي الضوئي LED', description: 'قطبية ومقاومة تحديد تيار وإصدار ضوء.' }),
  'summary-map': Object.freeze({ page: 118, title: 'خريطة قوانين الدرس', description: 'القوانين الأربعة وتحوّل الطاقة إلى حرارة.' }),
  'self-check-graph': Object.freeze({ page: 119, title: 'مخطط اختبر نفسي', description: 'مستقيم U بدلالة I ونقاط المخطط المطبوعة والاستيفاء عند 6 أمبير.' }),
});

const BUILDERS = Object.freeze({
  devices: devicesFigure,
  'lamp-circuit': lampCircuitFigure,
  'ohm-setup': ohmSetupFigure,
  'ohm-slope-graph': slopeGraphFigure,
  'wire-compare': wireCompareFigure,
  'rho-wire': rhoWireFigure,
  'series-circuit': seriesCircuitFigure,
  'parallel-circuit': parallelCircuitFigure,
  'equivalent-summary': equivalentSummaryFigure,
  'resistor-bands': resistorBandsFigure,
  rheostat: rheostatFigure,
  led: ledFigure,
  'summary-map': summaryMapFigure,
  'self-check-graph': selfCheckGraphFigure,
});

export function unit2l4DiagramMarkup(id, key = `r4-${id}`) {
  const build = BUILDERS[id];
  if (!build) throw new RangeError(`Unknown Unit 2 Lesson 4 diagram: ${id}`);
  return build(key);
}

/* Backwards-compatible public helpers used by tests and older callers. */
export function circuit(mode = 'series') {
  return unit2l4DiagramMarkup(mode === 'parallel' ? 'parallel-circuit' : 'series-circuit', `r4-circuit-${mode}`);
}
export function ohmCircuit() {
  return unit2l4DiagramMarkup('ohm-setup', 'r4-ohm-setup');
}
