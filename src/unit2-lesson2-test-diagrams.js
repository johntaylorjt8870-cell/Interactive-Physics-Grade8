const wrap = (id, t, d, body) => `<figure class="assessment-figure"><svg class="assessment-diagram" viewBox="0 0 620 250" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${t}</title><desc id="${id}-desc">${d}</desc>${body}</svg><figcaption>${d}</figcaption></figure>`;
const directions = wrap('u2l2-dir', 'جهتا التيار والإلكترونات', 'مولّد ومسار مغلق: سهم أخضر من الموجب إلى السالب وسهم أحمر بالعكس.', `
  <rect x="240" y="30" width="140" height="40" rx="6" fill="#f4d27a" stroke="#8a6a20"/>
  <text x="310" y="55" text-anchor="middle">+     −</text>
  <path d="M240 50 H80 V200 H540 V50 H380" fill="none" stroke="#4a5a72" stroke-width="4"/>
  <line x1="120" y1="50" x2="180" y2="50" stroke="#2a7a5a" stroke-width="4"/>
  <line x1="180" y1="200" x2="120" y2="200" stroke="#c95348" stroke-width="4"/>
  <text x="150" y="40" text-anchor="middle" fill="#2a7a5a">I</text>
  <text x="150" y="230" text-anchor="middle" fill="#c95348">e</text>
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
