/* Assessment force diagrams for the Lesson 2 / Unit 1 tests (source pp. 65,
 * 67–68). Scientific audit: the previous static figures drew the resultant
 * arrow at an arbitrary length — SHORTER than the larger force in the
 * same-sense figure (contradicting F = F1 + F2) and LONGER than the larger
 * force in the opposite-sense figure (contradicting F = |F2 − F1|). The
 * F1/F2/F symbols were missing and the B/C point labels sat on the arrow
 * shafts. Both figures now use ONE px-per-unit scale so every drawn arrow
 * satisfies the textbook law, and every force carries an RTL-safe LTR symbol.
 *
 * PR #58 scientific-note follow-up: the resultant's carrier C must ALSO
 * satisfy the law of moments F1 × d1 = F2 × d2 (textbook pp. 65, 68) — not
 * merely lie between A and B / outside on the larger force's side. C is now
 * derived from that law as the force-weighted mean of the two carriers and
 * rounded to the nearest whole pixel; see parallelGeometry() below and the
 * half-pixel tolerance asserted in tests/force-diagrams-scientific.test.js.
 *
 * These are intentionally source-neutral schematics: NO numeric magnitudes
 * are printed, so no answer is leaked before the question is graded. */

const arrow = (id, color) => `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${color}"/></marker>`;

const wrap = (id, title, desc, body) => `<figure class="assessment-figure"><svg class="assessment-diagram" viewBox="0 0 620 250" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${title}</title><desc id="${id}-desc">${desc}</desc><defs>${arrow(id + 'a', '#16706b')}${arrow(id + 'b', '#33568f')}${arrow(id + 'c', '#c95348')}</defs>${body}</svg><figcaption>${desc}</figcaption></figure>`;

/* A vertical force arrow from its point of application (rod) to its tip.
 * y2 < y1 → upward, y2 > y1 → downward. */
const vec = (x, y1, y2, cls, marker) =>
  `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" class="${cls}" marker-end="url(#${marker})" />`;

/* All symbols/letters are Latin, so they are pinned LTR to stay stable inside
 * the RTL page. CSS `.assessment-figure text` centres and colours them. */
const lab = (x, y, text) =>
  `<text x="${x}" y="${y}" direction="ltr">${text}</text>`;

/* Law of moments (textbook pp. 65 and 68): F1 × d1 = F2 × d2, where d1 is the
 * distance from C to the carrier of F1 (at A) and d2 from C to that of F2
 * (at B). For two parallel forces, C is the force-weighted mean of the two
 * carriers using SIGNED magnitudes (up = +, down = −):
 *     C = (s1·A + s2·B)/(s1 + s2),  |s1| = F1, |s2| = F2, |s1 + s2| = F.
 * Same sense → both signs alike → C between A and B. Opposite sense (s2<0)
 * → C outside AB on the larger force's side. SVG x is rounded to a whole
 * pixel, so the residual |F1·d1 − F2·d2| is at most F × 0.5 px; that is the
 * exact tolerance checked by the scientific tests. */
const parallelGeometry = ({ rodY, A, B, F1, F2, s2Sign }) => {
  const s1 = F1;
  const s2 = s2Sign * F2;
  return Object.freeze({
    rodY, A, B, F1, F2,
    F: Math.abs(s1 + s2),
    C: Math.round((s1 * A + s2 * B) / (s1 + s2)),
  });
};

/* Same sense: F = F1 + F2 = 45 + 75 = 120 px. Exact C = 351.875 → 352 px;
 * d1 = 197, d2 = 118 ⇒ 45 × 197 = 8865 ≈ 75 × 118 = 8850 (residual 15 ≤ 60). */
const SAME = parallelGeometry({ rodY: 165, A: 155, B: 470, F1: 45, F2: 75, s2Sign: +1 });

const same = wrap('test-same', 'قوتان في جهة واحدة',
  'قوتان متوازيتان إلى أعلى عند A وB، ومحصلتهما إلى أعلى عند C بينهما.', `
  <line x1="90" y1="${SAME.rodY}" x2="530" y2="${SAME.rodY}" class="assessment-axis" />
  ${vec(SAME.A, SAME.rodY, SAME.rodY - SAME.F1, 'assessment-force assessment-force-one', 'test-samea')}
  ${vec(SAME.B, SAME.rodY, SAME.rodY - SAME.F2, 'assessment-force assessment-force-two', 'test-samec')}
  ${vec(SAME.C, SAME.rodY, SAME.rodY - SAME.F, 'assessment-resultant', 'test-sameb')}
  ${lab(SAME.A, SAME.rodY - SAME.F1 - 12, 'F₁')}
  ${lab(SAME.B, SAME.rodY - SAME.F2 - 12, 'F₂')}
  ${lab(SAME.C, SAME.rodY - SAME.F - 12, 'F')}
  ${lab(SAME.A, 195, 'A')}${lab(SAME.C, 195, 'C')}${lab(SAME.B, 195, 'B')}
`);

/* Opposite sense: F = F2 − F1 = 95 − 50 = 45 px; the larger force (at B) acts
 * downward, so the resultant also acts downward and C lies outside AB beyond
 * B. Exact C = 111.1… → 111 px; d1 = 359, d2 = 189 ⇒ 50 × 359 = 17950 ≈
 * 95 × 189 = 17955 (residual 5 ≤ 22.5). The dashed carrier shows C is on the
 * extension of AB rather than on the rod itself. */
const OPP = parallelGeometry({ rodY: 130, A: 470, B: 300, F1: 50, F2: 95, s2Sign: -1 });

const opposite = wrap('test-opp', 'قوتان متعاكستان',
  'قوة صغيرة إلى أعلى عند A وقوة أكبر إلى أسفل عند B، والمحصلـة خارج القطعة بعد B وفي جهة القوة الأكبر.', `
  <line x1="250" y1="${OPP.rodY}" x2="535" y2="${OPP.rodY}" class="assessment-axis" />
  <line x1="${OPP.C}" y1="${OPP.rodY}" x2="250" y2="${OPP.rodY}" class="assessment-carrier" />
  ${vec(OPP.A, OPP.rodY, OPP.rodY - OPP.F1, 'assessment-force assessment-force-one', 'test-oppa')}
  ${vec(OPP.B, OPP.rodY, OPP.rodY + OPP.F2, 'assessment-force assessment-force-two', 'test-oppc')}
  ${vec(OPP.C, OPP.rodY, OPP.rodY + OPP.F, 'assessment-resultant', 'test-oppb')}
  ${lab(OPP.A, OPP.rodY - OPP.F1 - 12, 'F₁')}
  ${lab(OPP.B + 32, OPP.rodY + OPP.F2 - 8, 'F₂')}
  ${lab(OPP.C - 32, OPP.rodY + OPP.F + 12, 'F')}
  ${lab(OPP.A, 152, 'A')}${lab(OPP.B, 245, 'B')}${lab(OPP.C - 32, 152, 'C')}
`);

export function lesson2AssessmentDiagram(question) {
  if (question.diagram === 'same-parallel') return same;
  if (question.diagram === 'opposite-parallel') return opposite;
  return '';
}
