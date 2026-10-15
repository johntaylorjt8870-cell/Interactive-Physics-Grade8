const wrap = (id, t, d, body) => `<figure class="assessment-figure"><svg class="assessment-diagram" viewBox="0 0 620 250" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${t}</title><desc id="${id}-desc">${d}</desc>${body}</svg><figcaption>${d}</figcaption></figure>`;
/* u2l2q04 follows the lesson's p89 drawing: generator on top with + on the left (pink half,
   terminal cap) and − on the right (blue half); conventional current I (yellow, outside the
   loop) leaves + and returns to −; electrons e⁻ (red, inside the loop) move the opposite way
   on the same wire. Colours are those of .u2l2-arrow-current / .u2l2-arrow-electron, inlined
   because the test page does not load the lesson stylesheet. The prompt names these colours,
   so the drawing and the prompt must change together (tests check this). */
const FLOW = Object.freeze({
  current: Object.freeze({ fill: '#f6c700', stroke: '#7a5b00', text: '#7a5b00' }),
  electron: Object.freeze({ fill: '#d32f2f', stroke: '#7f1414', text: '#b3261e' }),
});
const ANGLE = Object.freeze({ right: 0, down: 90, left: 180, up: 270 });
const flowArrow = (cx, cy, dir, flow) => {
  const half = 30; const shaft = 6; const head = 13; const headLength = 18;
  const outline = [[-half, -shaft], [half - headLength, -shaft], [half - headLength, -head], [half, 0], [half - headLength, head], [half - headLength, shaft], [-half, shaft]];
  const rad = (ANGLE[dir] * Math.PI) / 180;
  const cos = Math.round(Math.cos(rad)); const sin = Math.round(Math.sin(rad));
  const points = outline.map(([x, y]) => `${cx + x * cos - y * sin},${cy + x * sin + y * cos}`).join(' ');
  return `<polygon data-flow="${flow}" data-dir="${dir}" points="${points}" fill="${FLOW[flow].fill}" stroke="${FLOW[flow].stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
};
/* Inline style, not attributes: lesson-test.css sets fill and font on every .assessment-figure text. */
const flowSymbol = (x, y, flow, body) => `<text x="${x}" y="${y}" text-anchor="middle" direction="ltr" style="fill:${FLOW[flow].text};font:italic 400 24px KaTeX_Math,Georgia,'Times New Roman',serif">${body}</text>`;
const poleSign = (x, pole, sign) => `<text data-terminal="${pole}" x="${x}" y="79" text-anchor="middle" style="fill:#24304a;font:800 26px var(--font-latin)">${sign}</text>`;
const directions = wrap('u2l2-dir', 'جهتا التيار والإلكترونات', 'مولّد ومسار مغلق: سهم أصفر من الموجب إلى السالب وسهم أحمر بالعكس.', `
  <path data-wire d="M230 70 H80 V220 H540 V70 H378" fill="none" stroke="#4a5a72" stroke-width="4"/>
  <g data-part="generator">
    <rect data-pole="cap" x="228" y="60" width="12" height="20" rx="3" fill="#bdb6a6" stroke="#5a5446" stroke-width="1.5"/>
    <rect data-pole="positive" x="238" y="48" width="70" height="44" rx="6" fill="#f7d0c7" stroke="#8a3b2e" stroke-width="2"/>
    <rect data-pole="negative" x="308" y="48" width="70" height="44" rx="6" fill="#cddcf1" stroke="#2f4d7e" stroke-width="2"/>
    ${poleSign(273, 'positive', '+')}${poleSign(343, 'negative', '−')}
  </g>
  ${flowArrow(155, 48, 'left', 'current')}${flowArrow(155, 92, 'right', 'electron')}
  ${flowSymbol(155, 26, 'current', 'I')}${flowSymbol(155, 130, 'electron', 'e<tspan dy="-9" style="font:400 16px var(--font-latin)">−</tspan>')}
`);
const qt = wrap('u2l2-qt', 'q بدلالة t', 'ثلاث نقاط على خط مستقيم صاعد.', `
  <line x1="60" y1="200" x2="560" y2="200" stroke="#24304a"/><line x1="60" y1="200" x2="60" y2="30" stroke="#24304a"/>
  <polyline fill="none" stroke="#33568f" stroke-width="3" points="140,160 260,120 380,80"/>
  <circle cx="140" cy="160" r="6" fill="#33568f"/><circle cx="260" cy="120" r="6" fill="#33568f"/><circle cx="380" cy="80" r="6" fill="#33568f"/>
`);
export function unit2l2AssessmentDiagram(q) {
  if (q.diagram === 'directions') return directions;
  if (q.diagram === 'qt') return qt;
  return '';
}
