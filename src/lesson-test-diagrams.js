import { V_OM, V_OX, V_OY } from './math.js';

function concurrencyDiagram(questionId) {
  const id = `diagram-${questionId}`;
  return `<figure class="assessment-figure" aria-labelledby="${id}-caption">
    <svg class="assessment-diagram" viewBox="0 0 420 250" role="img" aria-labelledby="${id}-title ${id}-description">
      <title id="${id}-title">حوامل قوى تلتقي عند O</title>
      <desc id="${id}-description">ثلاثة حوامل متقطعة مختلفة الاتجاه تمر جميعها بالنقطة O. ترسم ثلاثة أسهم من O على الحوامل، ولا يبين الشكل مقادير أو اتزاناً.</desc>
      <defs>
        <marker id="${id}-arrow-one" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
        <marker id="${id}-arrow-two" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
        <marker id="${id}-arrow-three" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
      </defs>
      <line class="assessment-carrier" x1="75" y1="215" x2="345" y2="35" />
      <line class="assessment-carrier" x1="75" y1="35" x2="345" y2="215" />
      <line class="assessment-carrier" x1="210" y1="22" x2="210" y2="230" />
      <line class="assessment-force force-one" x1="210" y1="125" x2="126" y2="181" marker-end="url(#${id}-arrow-one)" />
      <line class="assessment-force force-two" x1="210" y1="125" x2="294" y2="181" marker-end="url(#${id}-arrow-two)" />
      <line class="assessment-force force-three" x1="210" y1="125" x2="210" y2="198" marker-end="url(#${id}-arrow-three)" />
      <circle class="assessment-point" cx="210" cy="125" r="6" />
      <text class="assessment-point-label" x="224" y="119" direction="ltr">O</text>
    </svg>
    <figcaption id="${id}-caption">الخطوط المتقطعة تمثل الحوامل، ورؤوس الأسهم توضح الجهات فقط؛ لا يستنتج من الرسم تساوي القوى أو اتزان الجسم.</figcaption>
  </figure>`;
}

function perpendicularComponentsDiagram(questionId) {
  const id = `diagram-${questionId}`;
  return `<figure class="assessment-figure" aria-labelledby="${id}-caption">
    <svg class="assessment-diagram components-diagram" viewBox="0 0 420 260" role="img" aria-labelledby="${id}-title ${id}-description">
      <title id="${id}-title">قوة أصلية ومركبتان متعامدتان</title>
      <desc id="${id}-description">من O يمتد ضلع أفقي إلى X وضلع رأسي إلى Y، ويصل القطر O إلى M بين النقطتين X وY. الضلعان متعامدان.</desc>
      <defs>
        <marker id="${id}-arrow-x" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
        <marker id="${id}-arrow-y" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
        <marker id="${id}-arrow-m" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" /></marker>
      </defs>
      <line class="assessment-construction" x1="95" y1="205" x2="310" y2="205" />
      <line class="assessment-construction" x1="310" y1="205" x2="310" y2="65" />
      <line class="assessment-construction" x1="95" y1="65" x2="310" y2="65" />
      <line class="assessment-construction" x1="95" y1="205" x2="95" y2="65" />
      <line class="assessment-force force-one" x1="95" y1="205" x2="310" y2="205" marker-end="url(#${id}-arrow-x)" />
      <line class="assessment-force force-two" x1="95" y1="205" x2="95" y2="65" marker-end="url(#${id}-arrow-y)" />
      <line class="assessment-force force-result" x1="95" y1="205" x2="310" y2="65" marker-end="url(#${id}-arrow-m)" />
      <path class="assessment-right-angle" d="M 119 205 L 119 181 L 95 181" />
      <circle class="assessment-point" cx="95" cy="205" r="5" />
      <circle class="assessment-point" cx="310" cy="205" r="4" />
      <circle class="assessment-point" cx="95" cy="65" r="4" />
      <circle class="assessment-point" cx="310" cy="65" r="5" />
      <text class="assessment-point-label" x="78" y="228" direction="ltr">O</text>
      <text class="assessment-point-label" x="315" y="229" direction="ltr">X</text>
      <text class="assessment-point-label" x="76" y="60" direction="ltr">Y</text>
      <text class="assessment-point-label" x="316" y="60" direction="ltr">M</text>
    </svg>
    <figcaption id="${id}-caption">من O إلى M تمثل ${V_OM}، والضلعان المتعامدان تمثلان ${V_OX} و${V_OY}. هذا شكل ثابت للتفسير وليس محاكاة.</figcaption>
  </figure>`;
}

export function assessmentDiagramMarkup(question) {
  if (question.diagram === 'concurrent-carriers') return concurrencyDiagram(question.id);
  if (question.diagram === 'perpendicular-components') return perpendicularComponentsDiagram(question.id);
  return '';
}
