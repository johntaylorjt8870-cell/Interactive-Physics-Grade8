import { graph } from './unit2-lesson4-diagrams.js';
export function unit2AssessmentDiagram(question){
 if(question.diagram==='voltage-current')return graph([{i:1,u:3},{i:2,u:6},{i:3,u:9}],{id:'test-ui',maxI:4,maxU:12});
 if(question.diagram==='charge-time')return `<figure class="assessment-figure"><svg viewBox="0 0 580 280" role="img" aria-labelledby="qt-title qt-desc"><title id="qt-title">كمية الشحنة بدلالة الزمن</title><desc id="qt-desc">t أفقي بالثانية، q رأسي بالكولوم؛ مستقيم يمر بالأصل ونقطتي (2,6) و(4,12).</desc><g fill="none" stroke="#325f55" stroke-width="2"><path d="M60 25V235H525"/><path d="M60 235L460 35" stroke-width="4"/><path d="M260 135V235M460 35V235" stroke-dasharray="5 5"/></g><g font-size="17" fill="#143f31" text-anchor="middle"><text x="260" y="255">2</text><text x="460" y="255">4</text><text x="28" y="140">6</text><text x="28" y="40">12</text><text x="530" y="260">t (s)</text><text x="43" y="20">q (C)</text></g></svg><figcaption>رسم تدريبي من المنصة: q بدلالة t.</figcaption></figure>`;
 return '';
}
