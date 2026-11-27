/* Source: docs/sources/unit2-lesson2/image-{6,7}.png (printed pp92–93).
 * The reference and the live board share the copper, including the gaps at
 * the instruments. Removing a lamp hides the component, never its two leads.
 * Only the live board has adjustable readings and distinguishes L₂ by name. */
const wire = (d) => `<path class="u2-wire" data-wire d="${d}"/>`;
const label = (x, y, text, attrs = '', dir = 'ltr') =>
  `<text class="u2l2-circuit-label" ${attrs} x="${x}" y="${y}" text-anchor="middle" direction="${dir}">${text}</text>`;
const sign = (x, y, positive) =>
  label(x, y, positive ? '+' : '−', `data-terminal="${positive ? 'positive' : 'negative'}"`);
const dot = (x, y) => `<circle class="u2l2-junction" data-junction="${x},${y}" cx="${x}" cy="${y}" r="4.5"/>`;

function meter(name, symbol, cx, cy, vertical = false) {
  const r = 22;
  const terminals = vertical ? `${cx},${cy - r} ${cx},${cy + r}` : `${cx - r},${cy} ${cx + r},${cy}`;
  return `<g data-part="ammeter" data-name="${name}" data-cx="${cx}" data-cy="${cy}" data-r="${r}" data-terminals="${terminals}">
    <circle class="u2-ammeter" cx="${cx}" cy="${cy}" r="${r}"/>${label(cx, cy + 5, symbol)}</g>`;
}

function lamp(name, symbol, cx, cy, number, live, above) {
  const r = 24,
    h = 17;
  return `<g data-part="lamp" data-name="${name}" data-cx="${cx}" data-cy="${cy}" data-r="${r}" ${live ? `data-lamp="${number}" ` : ''}data-terminals="${cx - r},${cy} ${cx + r},${cy}">
    <circle class="u2l2-lamp-glow" cx="${cx}" cy="${cy}" r="30"/>
    <circle class="u2l2-lamp" cx="${cx}" cy="${cy}" r="${r}"${live ? ` data-bulb="${number}"` : ''}/>
    <path class="u2l2-lamp-x" d="M${cx - h} ${cy - h}l34 34m-34 0l34 -34"/>
    ${label(cx, cy + (above ? -33 : 45), symbol)}</g>`;
}

export function seriesCircuit(live = false) {
  return `${wire('M105 146 V75 H213')}${wire('M257 75 H478')}${wire('M526 75 H621 V246 H524')}${wire('M480 246 H259')}${wire('M211 246 H105 V177')}
    <g data-part="generator" data-name="G" data-terminals="105,146 105,177">
      <path class="u2l2-plate-long" d="M83 146H127"/><path class="u2l2-plate-short" d="M93 177H117"/>
      ${sign(68, 150, true)}${sign(68, 182, false)}</g>
    ${meter('A1', 'A₁', 235, 75)}${sign(196, 59, true)}${sign(274, 59, false)}
    ${lamp('L1', 'L₁', 502, 75, 1, live, true)}
    ${meter('A2', 'A₂', 502, 246)}${sign(463, 272, false)}${sign(541, 272, true)}
    ${lamp('L2', 'L₂', 235, 246, 2, live, false)}
    ${label(235, 128, live ? '200 mA' : 'I = 200 mA', live ? 'data-series-a1' : '')}
    ${label(502, 202, live ? '200 mA' : 'I = 200 mA', live ? 'data-series-a2' : '')}
    ${live ? label(360, 319, 'مسار واحد مغلق: التيار نفسه في كل أجزائه', 'data-series-caption', 'rtl') : ''}`;
}

export function parallelCircuit(live = false) {
  return `${wire('M350 58 H224')}${wire('M184 58 H102 V92')}${wire('M102 136 V177')}
    ${wire('M102 177 H218')}${wire('M262 177 H478')}${wire('M526 177 H630')}
    ${wire('M102 177 V270 H218')}${wire('M262 270 H478')}${wire('M526 270 H630 V177')}${wire('M630 177 V58 H380')}
    ${dot(102, 177)}${dot(630, 177)}
    <g data-part="generator" data-name="G" data-terminals="350,58 380,58">
      <path class="u2l2-plate-long" d="M350 36V80"/><path class="u2l2-plate-short" d="M380 46V70"/>
      ${sign(350, 104, true)}${sign(380, 104, false)}</g>
    <g data-part="switch" data-name="K" data-terminals="184,58 224,58">
      <line class="u2l2-switch-lever" x1="184" y1="58" x2="224" y2="58"/>
      <circle class="u2l2-switch-contact" cx="184" cy="58" r="4.5"/><circle class="u2l2-switch-contact" cx="224" cy="58" r="4.5"/></g>
    ${meter('A', 'A', 102, 114, true)}${meter('A1', 'A₁', 240, 177)}${lamp('L1', 'L₁', 502, 177, 1, live, true)}
    ${meter('A2', 'A₂', 240, 270)}${lamp(live ? 'L2' : 'L1-lower', live ? 'L₂' : 'L₁', 502, 270, 2, live, true)}
    ${live ? label(170, 119, '300 mA', 'data-parallel-a') + label(240, 142, '200 mA', 'data-parallel-a1') + label(240, 235, '100 mA', 'data-parallel-a2') : ''}
    ${live ? label(360, 318, 'I = I₁ + I₂') : ''}`;
}
