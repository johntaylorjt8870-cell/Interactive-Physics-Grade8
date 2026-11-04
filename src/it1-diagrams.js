/* ============================================================================
   Independent Test 1 — figures (SVG), generated from a small geometry table.
   ----------------------------------------------------------------------------
   Two families of figure, on purpose:

     it1GivenDiagram(question)   → drawn BEFORE submission. Shows only what the
                                   statement gives: the rod/beam, the two forces
                                   with their labels and senses, the points, and
                                   the distances that are actually given. It never
                                   draws the resultant, so it cannot leak the
                                   answer (position, sense, or magnitude).

     it1SolvedDiagram(problemId) → drawn AFTER submission (inside the review),
                                   and it is the only place where the resultant
                                   is drawn, labelled F, with its real position,
                                   sense, and value.

   Equal-force problems (9, 10, 13, 14) are described with a bisector, never
   with "القوة الكبرى" — the two forces are equal there.
   ========================================================================== */

const COLOR = Object.freeze({
  one: '#16706b',
  two: '#33568f',
  resultant: '#c0392b',
  rule: '#7c8697',
  ink: '#24304a',
  muted: '#5f6b84',
});

const rad = (degrees) => (degrees * Math.PI) / 180;

function arrowMarker(id, color) {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto"><path d="M0 0L10 5L0 10z" fill="${color}"/></marker>`;
}

function defs(uid, withResultant) {
  return `<defs>${arrowMarker(`${uid}-one`, COLOR.one)}${arrowMarker(`${uid}-two`, COLOR.two)}${withResultant ? arrowMarker(`${uid}-res`, COLOR.resultant) : ''}</defs>`;
}

/* The viewBox height is per figure: a tall solved figure must not crop its own
   distance labels, and a short givens figure must not carry dead space. */
function wrap(uid, title, desc, body, withResultant = false, viewBox = '0 0 640 300') {
  return `<figure class="it1-figure-inner">
    <svg class="it1-diagram" viewBox="${viewBox}" role="img" aria-labelledby="${uid}-title ${uid}-desc">
      <title id="${uid}-title">${title}</title>
      <desc id="${uid}-desc">${desc}</desc>
      ${defs(uid, withResultant)}
      ${body}
    </svg>
    <figcaption>${desc}</figcaption>
  </figure>`;
}

/* A labelled force arrow. `dir` is 'up' | 'down'; length is in px. */
function verticalArrow({ uid, x, y, dir, len, label, value, color, marker, solved, unknown = false }) {
  const sign = dir === 'up' ? -1 : 1;
  const tipY = y + sign * len;
  /* Labels sit clear of the arrowhead: the symbol above, the value below it,
     both outside the arrow's own span so a label can never cover the tip. */
  const labelY = dir === 'up' ? tipY - 38 : tipY + 24;
  const valueY = dir === 'up' ? tipY - 16 : tipY + 46;
  return `<g class="it1-force${solved ? ' it1-force-solved' : ''}">
    <line x1="${x}" y1="${y}" x2="${x}" y2="${tipY}" stroke="${color}" stroke-width="3.4" stroke-linecap="round"${unknown ? ' stroke-dasharray="8 6"' : ''} marker-end="url(#${uid}-${marker})"/>
    <circle cx="${x}" cy="${y}" r="4.6" fill="#fff" stroke="${color}" stroke-width="2.4"/>
    <text class="it1-label" x="${x}" y="${labelY}" text-anchor="middle" fill="${color}">${label}</text>
    <text class="it1-value" x="${x}" y="${valueY}" text-anchor="middle" fill="${color}" direction="ltr">${value}</text>
  </g>`;
}

function distanceSpan({ x1, x2, y, label, dashed = false }) {
  const mid = (x1 + x2) / 2;
  const tick = (x) => `<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}" stroke="${COLOR.rule}" stroke-width="1.6"/>`;
  return `<g class="it1-span">
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${COLOR.rule}" stroke-width="1.7"${dashed ? ' stroke-dasharray="7 6"' : ''}/>
    ${tick(x1)}${tick(x2)}
    <text class="it1-span-label" x="${mid}" y="${y + 24}" text-anchor="middle" fill="${COLOR.ink}" direction="ltr">${label}</text>
  </g>`;
}

function rod({ x1, x2, y }) {
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${COLOR.ink}" stroke-width="5" stroke-linecap="round"/>`;
}

function pointTag({ x, y, label, dy = 26, dx = 0 }) {
  if (!label) return `<circle cx="${x}" cy="${y}" r="4.6" fill="#fff" stroke="${COLOR.ink}" stroke-width="2.4"/>`;
  /* `dx` keeps a point letter clear of a force arrow that starts at the same
     point and points the same way as the letter (e.g. F₂ downward at B). */
  return `<text class="it1-point" x="${x + dx}" y="${y + dy}" text-anchor="middle" fill="${COLOR.ink}" direction="ltr">${label}</text>`;
}

/* --- concurrent-force geometry -------------------------------------------- */

/* Concurrent figures keep ONLY the symbol at each arrow tip; the values sit in
   a legend line under the drawing. With up to three arrows radiating from one
   origin, value labels placed beside the tips inevitably collide on a phone. */
function legendRow(items) {
  if (items.length === 0) return '';
  /* A value that already reads as an equation (e.g. "F = 20–80 N") is used as
     is; otherwise the symbol and the value are joined here. */
  const text = items.map((item) => (item.value.includes('=') ? item.value : `${item.label} = ${item.value}`)).join('   ·   ');
  return `<text class="it1-legend" x="320" y="280" text-anchor="middle" fill="${COLOR.muted}" direction="ltr">${text}</text>`;
}

function polarArrow({ uid, origin, angle, len, label, value, color, marker, solved, dashed = false }) {
  const x2 = origin.x + Math.cos(rad(angle)) * len;
  const y2 = origin.y - Math.sin(rad(angle)) * len;
  const lx = origin.x + Math.cos(rad(angle)) * (len + 26);
  const ly = origin.y - Math.sin(rad(angle)) * (len + 20);
  return `<g class="it1-force${solved ? ' it1-force-solved' : ''}">
    <line x1="${origin.x}" y1="${origin.y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3.6" stroke-linecap="round"${dashed ? ' stroke-dasharray="9 6"' : ''} marker-end="url(#${uid}-${marker})"/>
    <text class="it1-label" x="${lx}" y="${ly + 6}" text-anchor="middle" fill="${color}">${label}</text>
  </g>`;
}

function originPoint(origin, label = 'O') {
  return `<circle cx="${origin.x}" cy="${origin.y}" r="5" fill="#fff" stroke="${COLOR.ink}" stroke-width="2.6"/>
    <text class="it1-point" x="${origin.x - 22}" y="${origin.y + 26}" text-anchor="middle" fill="${COLOR.ink}" direction="ltr">${label}</text>`;
}

/* The angle label must never sit on the resultant shaft. Its position is
   computed, not guessed: the label is moved along the bisector until the
   perpendicular gap to the resultant line is at least LABEL_CLEARANCE, and it
   is kept inside the drawing box. */
const LABEL_CLEARANCE = 8;    // px of white space between label box and a shaft

/* Does a text box collide with any drawn shaft? Measured, not eyeballed. */
function boxHitsShafts(box, shafts) {
  for (const s of shafts) {
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    const len2 = dx * dx + dy * dy || 1;
    for (let x = box.x; x <= box.x + box.w; x += 2) {
      for (let y = box.y; y <= box.y + box.h; y += 2) {
        const t = Math.max(0, Math.min(1, ((x - s.x1) * dx + (y - s.y1) * dy) / len2));
        if (Math.hypot(x - (s.x1 + t * dx), y - (s.y1 + t * dy)) < LABEL_CLEARANCE) return true;
      }
    }
  }
  return false;
}

/* Approximate the rendered label box, so collision can be tested before the SVG
   exists. Arabic glyphs are wider per character than Latin ones. */
function labelBox(cx, cy, text) {
  const wide = /[\u0600-\u06FF]/.test(text);
  const w = text.length * (wide ? 8.6 : 7.4);
  return { x: cx - w / 2, y: cy - 10, w, h: 20 };
}

/* The angle label must never sit on the resultant or on a force arrow. Its
   position is searched, not guessed: pick the first candidate radius/orientation
   whose text box clears every shaft and stays inside the drawing. */
function angleArc({ origin, from, to, radius = 52, label, solved, shafts = [] }) {
  const a1 = rad(from);
  const a2 = rad(to);
  const x1 = origin.x + Math.cos(a1) * radius;
  const y1 = origin.y - Math.sin(a1) * radius;
  const x2 = origin.x + Math.cos(a2) * radius;
  const y2 = origin.y - Math.sin(a2) * radius;
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  const mid = (from + to) / 2;

  let lx = origin.x + Math.cos(rad(mid)) * (radius + 22);
  let ly = origin.y - Math.sin(rad(mid)) * (radius + 22);

  const candidates = [];
  for (const swing of [0, 10, -10, 20, -20, 30, -30, 42, -42]) {
    for (const r of [radius + 22, radius + 34, radius + 48, radius + 62, radius + 78]) {
      candidates.push({ ang: mid + swing, r });
    }
  }
  for (const { ang, r } of candidates) {
    const cx = origin.x + Math.cos(rad(ang)) * r;
    const cy = origin.y - Math.sin(rad(ang)) * r;
    const box = labelBox(cx, cy, label);
    if (box.x < 6 || box.x + box.w > 634 || box.y < 6 || box.y + box.h > 294) continue;
    if (boxHitsShafts(box, shafts)) continue;
    lx = cx;
    ly = cy;
    break;
  }

  return `<g class="it1-angle${solved ? ' it1-angle-solved' : ''}">
    <path d="M${x1} ${y1} A${radius} ${radius} 0 ${large} 0 ${x2} ${y2}" fill="none" stroke="${COLOR.muted}" stroke-width="1.8" stroke-dasharray="5 5"/>
    <text class="it1-angle-label" x="${lx}" y="${ly + 5}" text-anchor="middle" fill="${COLOR.muted}" direction="ltr">${label}</text>
  </g>`;
}

/* ==========================================================================
   Parallel-force geometry — DERIVED from the givens, never hand-placed.
   --------------------------------------------------------------------------
   Positions come from the two laws the chapter teaches, so a drawing can no
   longer disagree with its own arithmetic:

     same sense      F = F₁ + F₂      d₁/d₂ = F₂/F₁   resultant BETWEEN
     opposite sense  F = |F₂ − F₁|    d₁/d₂ = F₂/F₁   resultant OUTSIDE,
                                                      beyond the larger force

   `d` is the distance between the two points of application, `d₁` is measured
   from F₁, `d₂` from F₂. Every arrow in a figure shares one px-per-newton
   scale, so 50 N can never be drawn as long as 200 N.
   ========================================================================== */

const PAR_MIN_ARROW = 40;    // px, the shortest legible arrow in a figure
const PAR_UNKNOWN_ARROW = 78; // px, neutral length for a force of unknown magnitude
const PAR_ROD_PX = 380;      // length of the longest rod, in px
const PAR_VIEW_H = 300;      // height of every figure's viewBox

/* The six parallel problems, stated the way the paper states them. `d` is the
   distance printed as AB (p03 asks for it instead of giving it). */
const PARALLEL_SPECS = Object.freeze([
  {
    id: 'p01', F1: 15, F2: 45, d: 2, sense: 'same',
    title: 'ساق أفقية مهملة الوزن',
    givenDesc: 'ساق أفقية طرفاها A وB، قوة F₁ إلى أعلى عند A وقوة F₂ إلى أعلى عند B، والطول AB يساوي مترين.',
    solvedDesc: 'المحصلة F إلى أعلى بين A وB وأقرب إلى القوة الكبرى F₂، وشدتها 60 N، وبعدها d₁ يساوي 1.5 m عن A وd₂ يساوي 0.5 m عن B.',
  },
  {
    id: 'p02', F1: 60, F2: 20, d: 0.8, sense: 'same',
    title: 'عارضة أفقية مهملة الوزن',
    givenDesc: 'عارضة أفقية طرفاها A وB، قوة F₁ إلى أعلى عند A وقوة F₂ إلى أعلى عند B، والطول AB يساوي 0.8 m.',
    solvedDesc: 'المحصلة F إلى أعلى بين A وB وأقرب إلى القوة الكبرى F₁، وشدتها 80 N، وبعدها d₁ يساوي 0.2 m عن A وd₂ يساوي 0.6 m عن B.',
  },
  {
    /* d = 1 m (asked for, not printed): the 3 : 1 ratio puts the resultant at
       0.75 m from F₁, exactly as the statement fixes it. */
    id: 'p03', F1: 100, F2: 300, d: 1, sense: 'same', dGiven: false,
    title: 'عارضة خشبية تؤثر في نهايتها قوتان بجهة واحدة',
    givenDesc: 'عارضة خشبية طرفاها A وB، قوة F₁ إلى أعلى عند A وقوة F₂ إلى أعلى عند B، والطول الكلي مجهول، وبعد نقطة تأثير المحصلة عن القوة الأولى d₁ يساوي 0.75 m.',
    solvedDesc: 'المحصلة F إلى أعلى بين A وB وأقرب إلى القوة الكبرى F₂، وشدتها 400 N، وبعدها d₁ يساوي 0.75 m عن F₁ وd₂ يساوي 0.25 m عن F₂، والطول الكلي للعارضة 1 m.',
  },
  {
    id: 'p04', F1: 30, F2: 90, d: 0.6, sense: 'opposite',
    title: 'ساق معدنية تؤثر في طرفيها قوتان متعاكستان',
    givenDesc: 'ساق معدنية طرفاها A وB، قوة F₁ إلى أعلى عند A وقوة F₂ إلى أسفل عند B، والطول AB يساوي 0.6 m.',
    solvedDesc: 'المحصلة F إلى أسفل جهة القوة الكبرى F₂، وتقع على امتداد الساق خارج القطعة من جهة B، وشدتها 60 N، وبعدها d₁ يساوي 0.9 m عن A وd₂ يساوي 0.3 m عن B.',
  },
  {
    /* Print: F = 120 N, F₁ = 40 N, and d₂ = 0.2 m measured from the larger
       force ⇒ F₂ = F + F₁ = 160 N, d₁ = 4 × 0.2 = 0.8 m, d = 0.6 m. */
    id: 'p05', F1: 40, F2: 160, d: 0.6, sense: 'opposite', unknownForces: ['F₂'], dGiven: false,
    title: 'عارضة مهملة الوزن وقوتان متعاكستان',
    givenDesc: 'عارضة مهملة الوزن، قوة صغرى F₁ تساوي 40 N وقوة كبرى F₂ مجهولة، والجهتان متعاكستان، وشدة المحصلة 120 N، وبعدها عن القوة الكبرى d₂ يساوي 0.2 m.',
    solvedDesc: 'القوة الكبرى F₂ تساوي 160 N، والمحصلة F إلى أسفل جهة F₂، وتقع خارج القطعة من جهتها، وبعدها d₁ يساوي 0.8 m عن F₁، والمسافة بين القوتين d تساوي 0.6 m.',
  },
  {
    id: 'p06', F1: 50, F2: 200, d: 1.5, sense: 'opposite', dGiven: false,
    title: 'قوتان متوازيتان متعاكستان على ساق أفقية',
    /* The paper names no point on this rod: dots only, no letters. */
    points: false,
    givenDesc: 'ساق أفقية، القوة الصغرى F₁ تساوي 50 N والقوة الكبرى F₂ تساوي 200 N في جهتين متعاكستين، وشدة المحصلة 150 N، وبعد نقطة تأثيرها عن القوة الصغرى d₁ يساوي 2 m.',
    solvedDesc: 'المحصلة F جهة القوة الكبرى F₂، وتقع خارج القطعة من جهتها، وشدتها 150 N، وبعدها عن F₂ هو d₂ = 0.5 m، والمسافة بين القوتين d تساوي 1.5 m.',
  },
]);

const parNum = (value) => {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace(/\.0+$/, '');
};

/* Physics for one parallel problem: magnitude, the two distances, the side. */
export function parallelFacts(spec) {
  const { F1, F2, d, sense } = spec;
  const F = sense === 'same' ? F1 + F2 : Math.abs(F2 - F1);
  const d1 = sense === 'same' ? (F2 / F) * d : d + (F1 / F) * d;
  const d2 = sense === 'same' ? (F1 / F) * d : (F1 / F) * d;
  return { F, d1, d2, d };
}

function buildParallel(spec) {
  const { F1, F2, d, sense } = spec;
  const { F, d1, d2 } = parallelFacts(spec);

  /* px per metre: the rod plus whatever sticks out beyond it must fit the
     drawing width, so the scale is set by the whole extent, not the rod alone. */
  const extent = sense === 'same' ? d : d + d2;
  const scale = PAR_ROD_PX / extent;
  const left = 130;
  const right = left + d * scale;
  const px = (metres) => metres * scale;

  /* F₁ always sits at A (left), F₂ at B (right) — every problem's wording. */
  const xF1 = left;
  const xF2 = right;
  const largerIsF2 = F2 >= F1;

  /* Same sense → resultant between the two, d₁ from F₁.
     Opposite     → resultant outside, on the larger force's side, d₂ away. */
  const xRes = sense === 'same'
    ? xF1 + px(d1)
    : (largerIsF2 ? xF2 + px(d2) : xF1 - px(d2));

  const dir = { F1: 'up', F2: sense === 'same' ? 'up' : 'down' };
  const resDir = sense === 'same' ? 'up' : dir.F2;

  /* One px-per-newton scale for the whole figure, chosen so the SMALLEST force
     is still a legible arrow while the largest stays inside the drawing.
     Proportionality is exact; nothing here is eyeballed. */
  const lenScale = PAR_MIN_ARROW / Math.min(F1, F2, F);
  const len = (force) => Math.round(force * lenScale);

  const marked = (force, extra) => ({
    x: force.x, dir: force.dir, len: force.len, label: force.label,
    value: force.value, marker: force.marker, color: force.color, ...extra,
  });

  const trueForces = [
    marked({ x: xF1, dir: dir.F1, len: len(F1), label: 'F₁', value: `${F1} N`, marker: 'one', color: COLOR.one }),
    marked({ x: xF2, dir: dir.F2, len: len(F2), label: 'F₂', value: `${F2} N`, marker: 'two', color: COLOR.two }),
  ];
  const resultant = marked({ x: xRes, dir: resDir, len: len(F), label: 'F', value: `${F} N`, color: COLOR.resultant });

  /* Pre-submission: an unknown force is dashed, carries "؟", and is drawn at a
     neutral length — its magnitude must not be readable off the drawing. */
  const givenForces = trueForces.map((force) => (
    spec.unknownForces?.includes(force.label)
      ? { ...force, value: '؟', len: PAR_UNKNOWN_ARROW, unknown: true }
      : force
  ));

  /* A distance the statement does not give is never printed: p03, p05 and p06
     ask the student for the total length themselves. */
  const gapSpan = spec.dGiven === false
    ? { x1: left, x2: right, y: 0, label: 'd = ?', dashed: true }
    : { x1: left, x2: right, y: 0, label: `AB = ${parNum(d)} m` };

  const points = spec.points === false
    ? [{ x: xF1, label: '', dx: 0 }, { x: xF2, label: '', dx: 0 }]
    : [
        { x: xF1, label: 'A', dx: -20 },
        { x: xF2, label: 'B', dx: dir.F2 === 'down' ? -20 : 20 },
      ];

  /* Each figure is composed from the arrows it actually draws, so neither one
     reserves space for the other's rows. */
  const compose = (drawn, solved) => {
    const upSpan = Math.max(0, ...drawn.filter((f) => f.dir === 'up').map((f) => f.len),
      ...(solved && resDir === 'up' ? [resultant.len] : []));
    const downSpan = Math.max(0, ...drawn.filter((f) => f.dir === 'down').map((f) => f.len),
      ...(solved && resDir === 'down' ? [resultant.len] : []));

    const rodY = 78 + upSpan;
    const rowA = rodY + (downSpan > 0 ? downSpan + 64 : 64);
    /* A span label sits 24 px under its own rule and is ~18 px tall, so the
       next row must start well below it or the label is struck through. */
    const SPAN_ROW = 54;
    const rowB = rowA + SPAN_ROW;
    const rowC = rowB + SPAN_ROW;

    const spans = [];
    if (!solved) {
      spans.push({ ...gapSpan, y: rowA });
    } else if (sense === 'same') {
      spans.push({ x1: xF1, x2: xRes, y: rowA, label: `d₁ = ${parNum(d1)} m` });
      spans.push({ x1: xRes, x2: xF2, y: rowA, label: `d₂ = ${parNum(d2)} m` });
      /* p03 asks for the whole length, so the figure shows it beside its parts. */
      if (spec.id === 'p03') {
        spans.push({ x1: left, x2: right, y: rowB, label: `d = ${parNum(d)} m`, dashed: true });
      }
    } else {
      spans.push({ x1: left, x2: right, y: rowA, label: `d = ${parNum(d)} m`, dashed: true });
      spans.push({ x1: xF1, x2: xRes, y: rowB, label: `d₁ = ${parNum(d1)} m` });
      spans.push({ x1: xF2, x2: xRes, y: rowC, label: `d₂ = ${parNum(d2)} m` });
    }

    const lowest = Math.max(...spans.map((span) => span.y)) + 30;
    const floor = solved ? PAR_VIEW_H : 240;
    return {
      rodY,
      spans,
      viewBox: `0 0 640 ${Math.max(floor, Math.ceil(lowest / 20) * 20)}`,
    };
  };

  const givenLayout = compose(givenForces, false);
  const solvedLayout = compose(trueForces, true);

  return {
    rod: { x1: left, x2: right },
    points,
    givenForces,
    forces: trueForces,
    resultant,
    spanRows: { given: givenLayout, solved: solvedLayout },
    viewBox: givenLayout.viewBox,
    solvedViewBox: solvedLayout.viewBox,
    rodYs: { given: givenLayout.rodY, solved: solvedLayout.rodY },
    title: spec.title,
    givenDesc: spec.givenDesc,
    solvedDesc: spec.solvedDesc,
  };
}

const PARALLEL = Object.fromEntries(PARALLEL_SPECS.map((spec) => [spec.id, buildParallel(spec)]));

const CONCURRENT = {
  p07: {
    title: 'قوتان متعامدتان عند نقطة واحدة',
    forces: [
      { angle: 0, len: 78, label: 'F₁', value: '3 N', marker: 'one', color: COLOR.one },
      { angle: 90, len: 104, label: 'F₂', value: '4 N', marker: 'two', color: COLOR.two },
    ],
    arc: { from: 0, to: 90, label: '90°' },
    resultant: { angle: 53.13, len: 130, label: 'F', value: '5 N' },
    givenDesc: 'قوتان متلاقيتان عند O، F₁ شدتها 3 N أفقياً وF₂ شدتها 4 N شاقولياً، والزاوية بينهما قائمة.',
    solvedDesc: 'المحصلة F تنطلق من O على القطر الخارج من متوازي الأضلاع، وشدتها 5 N، وتميل عن حامل F₁ بزاوية α حيث tan α يساوي F₂ على F₁.',
  },
  p08: {
    title: 'قوتان متعامدتان وشدة كل منهما معروفة',
    forces: [
      { angle: 0, len: 118, label: 'F₁', value: '16 N', marker: 'one', color: COLOR.one },
      { angle: 90, len: 90, label: 'F₂', value: '12 N', marker: 'two', color: COLOR.two },
    ],
    arc: { from: 0, to: 90, label: '90°' },
    resultant: { angle: 36.87, len: 150, label: 'F', value: '20 N' },
    givenDesc: 'قوتان متلاقيتان عند O، F₁ شدتها 16 N أفقياً وF₂ شدتها 12 N شاقولياً، والزاوية بينهما قائمة.',
    solvedDesc: 'المحصلة F وتر المثلث القائم، وشدتها 20 N، وظل زاويتها عن حامل F₁ يساوي 12 على 16 أي 0.75.',
  },
  p09: {
    title: 'قوتان متساويتان ومتعامدتان',
    forces: [
      { angle: 0, len: 88, label: 'F₁', value: '6 N', marker: 'one', color: COLOR.one },
      { angle: 90, len: 88, label: 'F₂', value: '6 N', marker: 'two', color: COLOR.two },
    ],
    arc: { from: 0, to: 90, label: '90°' },
    resultant: { angle: 45, len: 124, label: 'F', value: '8.49 N' },
    givenDesc: 'قوتان متساويتان شدتاهما 6 N ومتعامدتان عند O.',
    solvedDesc: 'القوتان متساويتان، لذلك يكون متوازي الأضلاع مربعاً وحامل المحصلة F منصّفاً للزاوية القائمة؛ وشدتها 8.49 N أي 6 في جذر 2.',
  },
  p10: {
    title: 'قوتان متساويتان ومتعامدتان في جسم صلب',
    forces: [
      { angle: 0, len: 100, label: 'F₁', value: '20 N', marker: 'one', color: COLOR.one },
      { angle: 90, len: 100, label: 'F₂', value: '20 N', marker: 'two', color: COLOR.two },
    ],
    arc: { from: 0, to: 90, label: '90°' },
    resultant: { angle: 45, len: 141, label: 'F', value: '28.28 N' },
    givenDesc: 'قوتان متساويتان شدتاهما 20 N ومتعامدتان عند O، والشكل التخطيطي متوازي أضلاع.',
    solvedDesc: 'بما أن القوتين متساويتان ومتعامدتان فالشكل مربع، والمحصلة F قطره الخارج من O، وشدتها 28.28 N، وحاملها منصّف للزاوية القائمة.',
  },
  p11: {
    title: 'قوتان بينهما زاوية حادة 45 درجة',
    forces: [
      { angle: 0, len: 84, label: 'F₁', value: '10 N', marker: 'one', color: COLOR.one },
      { angle: 45, len: 126, label: 'F₂', value: '15 N', marker: 'two', color: COLOR.two },
    ],
    arc: { from: 0, to: 45, label: 'θ = 45°' },
    resultant: { angle: 27, len: 200, label: 'F', value: '23.2 N' },
    givenDesc: 'قوتان متلاقيتان في O، F₁ شدتها 10 N، وF₂ شدتها 15 N، والزاوية بينهما 45 درجة.',
    solvedDesc: 'تُبنى المحصلة F بتمام متوازي الأضلاع، وهي القطر الخارج من O، وشدتها 23.2 N.',
  },
  p12: {
    title: 'قوتان بينهما زاوية حادة',
    forces: [
      { angle: 0, len: 96, label: 'F₁', value: '30 N', marker: 'one', color: COLOR.one },
      { angle: 60, len: 160, label: 'F₂', value: '50 N', marker: 'two', color: COLOR.two },
    ],
    arc: { from: 0, to: 60, label: 'زاوية حادة' },
    resultant: { angle: 38, len: 235, label: 'F', value: 'F = 20–80 N' },
    givenDesc: 'قوتان متلاقيتان في O، F₁ شدتها 30 N وF₂ شدتها 50 N، وتحصّران بينهما زاوية حادة مجهولة.',
    solvedDesc: 'المحصلة F تقع حاملها داخل الزاوية بين الحاملين، وشدتها بين فرق الشدتين 20 N ومجموعهما 80 N، وتزيد كلما صغرت الزاوية.',
  },
  p13: {
    title: 'قوتان متساويتان بينهما 60 درجة',
    forces: [
      { angle: 0, len: 120, label: 'F₁', value: '50 N', marker: 'one', color: COLOR.one },
      { angle: 60, len: 120, label: 'F₂', value: '50 N', marker: 'two', color: COLOR.two },
    ],
    arc: { from: 0, to: 60, label: '60°' },
    resultant: { angle: 30, len: 208, label: 'F', value: '86.6 N' },
    givenDesc: 'قوتان متساويتان شدتاهما 50 N، والزاوية بينهما 60 درجة، والعقدة عند O.',
    solvedDesc: 'القوتان متساويتان، لذلك يكون الشكل معيّناً ومثلث القوتين متساوي الأضلاع؛ والمحصلة F منصّف الزاوية 60 درجة، وشدتها 86.6 N.',
  },
  p14: {
    title: 'قوتان متساويتان بينهما 60 درجة عند نقطة واحدة',
    forces: [
      { angle: 0, len: 140, label: 'F₁', value: '80 N', marker: 'one', color: COLOR.one },
      { angle: 60, len: 140, label: 'F₂', value: '80 N', marker: 'two', color: COLOR.two },
    ],
    arc: { from: 0, to: 60, label: '60°' },
    resultant: { angle: 30, len: 242, label: 'F', value: '138.6 N' },
    givenDesc: 'قوتان متساويتان شدتاهما 80 N تؤثران في نقطة واحدة، والزاوية بين حامليهما 60 درجة.',
    solvedDesc: 'المحصلة F منصّف الزاوية بين القوتين المتساويتين، وشدتها 138.6 N، وتميل بزاوية 30 درجة عن حامل كل من القوتين.',
  },
};

const ORIGIN = Object.freeze({ x: 210, y: 215 });

function parallelBody(geometry, uid, { solved }) {
  const rodY = geometry.rodYs[solved ? 'solved' : 'given'];
  const rows = geometry.spanRows[solved ? 'solved' : 'given'];
  const shown = solved ? geometry.forces : geometry.givenForces;

  const parts = [rod({ x1: geometry.rod.x1, x2: geometry.rod.x2, y: rodY })];
  parts.push(...geometry.points.map((item) => pointTag({ x: item.x, y: rodY, label: item.label, dx: item.dx ?? 0 })));
  for (const force of shown) {
    parts.push(verticalArrow({
      uid, x: force.x, y: rodY, dir: force.dir, len: force.len, label: force.label,
      value: force.value, color: force.color, marker: force.marker, solved: false,
      unknown: force.unknown === true,
    }));
  }
  if (solved && geometry.resultant) {
    const res = geometry.resultant;
    parts.push(verticalArrow({ uid, x: res.x, y: rodY, dir: res.dir, len: res.len, label: res.label, value: res.value, color: COLOR.resultant, marker: 'res', solved: true }));
    parts.push(`<line x1="${res.x}" y1="${rodY - 14}" x2="${res.x}" y2="${rodY + 14}" stroke="${COLOR.resultant}" stroke-width="2" stroke-dasharray="4 4"/>`);
  }
  parts.push(...rows.spans.map((span) => distanceSpan(span)));
  return parts.join('');
}

/* Every shaft drawn in a concurrent figure, as segments in drawing coordinates.
   The angle label is placed against these, so it can never sit on an arrow. */
function concurrentShafts(geometry, origin) {
  const shafts = geometry.forces.map((force) => ({
    x1: origin.x,
    y1: origin.y,
    x2: origin.x + Math.cos(rad(force.angle)) * force.len,
    y2: origin.y - Math.sin(rad(force.angle)) * force.len,
  }));
  if (geometry.resultant) {
    shafts.push({
      x1: origin.x,
      y1: origin.y,
      x2: origin.x + Math.cos(rad(geometry.resultant.angle)) * geometry.resultant.len,
      y2: origin.y - Math.sin(rad(geometry.resultant.angle)) * geometry.resultant.len,
    });
  }
  return shafts;
}

function concurrentBody(geometry, uid, { solved }) {
  const parts = [originPoint(ORIGIN, 'O')];
  for (const force of geometry.forces) {
    parts.push(polarArrow({ uid, origin: ORIGIN, angle: force.angle, len: force.len, label: force.label, value: force.value, color: force.color, marker: force.marker }));
  }
  if (geometry.arc) {
    parts.push(angleArc({
      origin: ORIGIN,
      from: geometry.arc.from,
      to: geometry.arc.to,
      label: geometry.arc.label,
      shafts: concurrentShafts(geometry, ORIGIN),
    }));
  }
  if (solved && geometry.resultant) {
    const res = geometry.resultant;
    parts.push(polarArrow({ uid, origin: ORIGIN, angle: res.angle, len: res.len, label: res.label, value: res.value, color: COLOR.resultant, marker: 'res', solved: true, dashed: true }));
  }
  const legend = geometry.forces.map((force) => ({ label: force.label, value: force.value }));
  if (solved && geometry.resultant) legend.push({ label: geometry.resultant.label, value: geometry.resultant.value });
  parts.push(legendRow(legend));
  return parts.join('');
}

function buildProblemFigure(id, geometry, { solved }) {
  const uid = `${id}-${solved ? 'solved' : 'given'}`;
  const body = geometry.forces[0].dir === undefined
    ? concurrentBody(geometry, uid, { solved })
    : parallelBody(geometry, uid, { solved });
  const title = solved ? `${geometry.title} — الرسم المحلول` : geometry.title;
  const desc = solved ? geometry.solvedDesc : geometry.givenDesc;
  const viewBox = (solved ? geometry.solvedViewBox : geometry.viewBox) ?? '0 0 640 300';
  return wrap(uid, title, desc, body, solved, viewBox);
}

const cache = new Map();

/** Pre-submission figure: givens only, never the resultant. */
export function it1GivenDiagram(question) {
  const id = question?.diagram;
  if (!id) return '';
  const geometry = PARALLEL[id] ?? CONCURRENT[id];
  if (!geometry) return '';
  if (!cache.has(`${id}-given`)) cache.set(`${id}-given`, buildProblemFigure(id, geometry, { solved: false }));
  return cache.get(`${id}-given`);
}

/** Post-submission figure: includes the resultant F with its true geometry. */
export function it1SolvedDiagram(problemId) {
  const id = String(problemId).replace(/^it1/, '');
  const geometry = PARALLEL[id] ?? CONCURRENT[id];
  if (!geometry) return '';
  if (!cache.has(id)) cache.set(id, buildProblemFigure(id, geometry, { solved: true }));
  return cache.get(id);
}

export const IT1_FIGURE_IDS = Object.freeze([...Object.keys(PARALLEL), ...Object.keys(CONCURRENT)]);
