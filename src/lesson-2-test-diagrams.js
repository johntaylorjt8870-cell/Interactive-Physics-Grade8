/* Assessment force diagrams for the Lesson 2 / Unit 1 tests (source pp. 65,
 * 67–68). Scientific audit: the previous static figures drew the resultant
 * arrow at an arbitrary length — SHORTER than the larger force in the
 * same-sense figure (contradicting F = F1 + F2) and LONGER than the larger
 * force in the opposite-sense figure (contradicting F = |F2 − F1|). The
 * F1/F2/F symbols were missing and the B/C point labels sat on the arrow
 * shafts. Both figures now use ONE px-per-unit scale so every drawn arrow
 * satisfies the textbook law, and every force carries an RTL-safe LTR symbol.
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

/* Same sense: F = F1 + F2. 45 + 75 = 120 px; C is between A and B and closer
 * to the larger force (at B), consistent with F1 × d1 = F2 × d2. */
const SAME = Object.freeze({ rodY: 165, A: 155, C: 350, B: 470, F1: 45, F2: 75, F: 120 });

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

/* Opposite sense: F = F2 − F1. 95 − 50 = 45 px; the larger force (at B) acts
 * downward, so the resultant also acts downward, and C lies outside AB on the
 * larger force's side (beyond B). The dashed carrier shows it is on the
 * extension of AB rather than on the rod itself. */
const OPP = Object.freeze({ rodY: 130, A: 470, B: 300, C: 120, F1: 50, F2: 95, F: 45 });

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
