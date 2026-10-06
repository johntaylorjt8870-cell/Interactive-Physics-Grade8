import { V_F, V_F1, V_F2, V_F3, V_W } from './math.js';

const defs = (id) => `<defs>
  <marker id="${id}-up" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#168b78"/></marker>
  <marker id="${id}-down" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#d45f50"/></marker>
  <marker id="${id}-blue" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#33568f"/></marker>
</defs>`;

const frame = (id, title, desc, body) => `<svg viewBox="0 0 720 360" role="img" aria-labelledby="${id}-title ${id}-desc" xmlns="http://www.w3.org/2000/svg">
<title id="${id}-title">${title}</title><desc id="${id}-desc">${desc}</desc>${defs(id)}${body}</svg>`;
const line = (x1, y1, x2, y2, cls, marker = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" ${marker}/>`;
const label = (x, y, text, cls = 'parallel-label') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="middle" direction="ltr">${text}</text>`;
const carrier = (x) => line(x, 34, x, 332, 'carrier-line');
const point = (x, y, text) => `<circle cx="${x}" cy="${y}" r="5" class="parallel-point"/>${label(x, y + 27, text, 'diagram-point-label')}`;

const definitionSvg = frame('parallel-definition', 'تعريف القوى المتوازية', 'مسطرة أفقية تؤثر فيها قوتا شد إلى أعلى وقوة ثقل إلى أسفل، وحوامل القوى الثلاث مستقيمات رأسية متوازية.', `
  ${carrier(180)}${carrier(360)}${carrier(540)}
  <rect x="135" y="166" width="450" height="22" rx="8" class="parallel-bar"/>
  ${line(180,166,180,68,'parallel-force parallel-force-up','marker-end="url(#parallel-definition-up)"')}
  ${line(540,166,540,68,'parallel-force parallel-force-up','marker-end="url(#parallel-definition-up)"')}
  ${line(360,188,360,298,'parallel-force parallel-force-down','marker-end="url(#parallel-definition-down)"')}
  ${label(155,60,'F₂')}${label(565,60,'F₁')}${label(386,310,'w')}${label(360,151,'C')}
`);

const sameSvg = frame('same-sense', 'محصلة قوتين متوازيتين بجهة واحدة', 'قوتان متوازيتان متجهتان إلى أعلى عند A وB، ومحصلتهما بينهما عند C وأقرب إلى القوة الأكبر.', `
  ${carrier(145)}${carrier(408)}${carrier(585)}
  <rect x="110" y="205" width="510" height="18" rx="7" class="parallel-bar"/>
  ${line(145,205,145,105,'parallel-force parallel-force-up','marker-end="url(#same-sense-up)"')}
  ${line(585,205,585,62,'parallel-force parallel-force-up','marker-end="url(#same-sense-up)"')}
  ${line(408,205,408,78,'parallel-force parallel-resultant','marker-end="url(#same-sense-blue)"')}
  ${point(145,214,'B')}${point(408,214,'C')}${point(585,214,'A')}
  ${label(120,95,'F₂')}${label(610,54,'F₁')}${label(430,72,'F')}
  ${line(145,276,408,276,'distance-line')}${line(408,276,585,276,'distance-line')}
  ${label(276,304,'d₂','diagram-measure')}${label(497,304,'d₁','diagram-measure')}
`);

const oppositeSvg = frame('opposite-sense', 'محصلة قوتين متوازيتين بجهتين متعاكستين', 'قوة صغيرة إلى أعلى عند A وقوة أكبر إلى أسفل عند B، والمحصلـة إلى أسفل خارج القطعة من جهة القوة الأكبر عند C.', `
  ${carrier(112)}${carrier(380)}${carrier(590)}
  <rect x="345" y="174" width="280" height="18" rx="7" class="parallel-bar"/>
  ${line(590,174,590,66,'parallel-force parallel-force-up','marker-end="url(#opposite-sense-up)"')}
  ${line(380,192,380,302,'parallel-force parallel-force-down','marker-end="url(#opposite-sense-down)"')}
  ${line(112,192,112,326,'parallel-force parallel-resultant-down','marker-end="url(#opposite-sense-down)"')}
  ${point(112,183,'C')}${point(380,183,'B')}${point(590,183,'A')}
  ${label(617,58,'F₁')}${label(405,316,'F₂')}${label(137,338,'F')}
  ${line(112,112,380,112,'distance-line')}${line(380,112,590,112,'distance-line')}
  ${label(246,101,'d₂','diagram-measure')}${label(485,101,'d','diagram-measure')}
`);

export const LESSON_2_DIAGRAMS = Object.freeze({
  'parallel-definition': {
    title: 'حوامل ثلاث قوى متوازية',
    platformNote: 'الخطوط المتقطعة تمثل الحوامل الممتدة؛ توازيها — لا تساوي مقادير القوى — هو الخاصية التي يعرّف بها الكتاب القوى المتوازية.',
    description: 'إعادة بناء متجهية للرسم المرجعي في الصفحة 64.',
    svg: definitionSvg,
    legend: [{ color: 'teal', symbol: `${V_F1} و${V_F2}: قوتا شد` }, { color: 'coral', symbol: `${V_W}: ثقل الجسم` }],
  },
  'same-sense': {
    title: 'موضع محصلة قوتين بجهة واحدة',
    platformNote: 'تقع نقطة التأثير بين القوتين، وتقترب من القوة الأكبر حتى يتحقق تساوي جداء القوة في بعدها عن المحصلة على الجانبين.',
    description: 'إعادة بناء للعلاقة الهندسية في الصفحتين 65 و66.',
    svg: sameSvg,
    legend: [{ color: 'teal', symbol: `${V_F1} و${V_F2}` }, { color: 'blue', symbol: `${V_F}: المحصلة` }],
  },
  'opposite-sense': {
    title: 'موضع محصلة قوتين بجهتين متعاكستين',
    platformNote: 'تقع نقطة التأثير خارج القطعة الواصلة بين القوتين ومن جهة القوة الأكبر، وتتجه المحصلة بجهة تلك القوة.',
    description: 'إعادة بناء للعلاقة الهندسية في الصفحتين 67 و68.',
    svg: oppositeSvg,
    legend: [{ color: 'teal', symbol: `${V_F1}: القوة الأصغر` }, { color: 'coral', symbol: `${V_F2}: القوة الأكبر و${V_F}: المحصلة` }],
  },
});
