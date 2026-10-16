const figure = (id, title, description, body) => `<figure class="assessment-figure"><svg class="assessment-diagram u2l3-assessment-diagram" viewBox="0 0 640 270" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${title}</title><desc id="${id}-desc">${description}</desc>${body}</svg><figcaption>${description}</figcaption></figure>`;
const wire = (name, d) => `<path data-wire="${name}" d="${d}" fill="none" stroke="#3667bd" stroke-width="4" stroke-linecap="square" stroke-linejoin="round"/>`;
const text = (x, y, value, style = '') => `<text x="${x}" y="${y}" text-anchor="middle" direction="ltr" style="fill:#202949;font:700 15px Manrope,Arial,sans-serif;${style}">${value}</text>`;

const parallelReadings = figure(
  'u2l3-test-parallel',
  'دارة تفرع مع فولتميتر على طرفي المصباح الثاني',
  'مولد فرق كمونه 9 فولت ومصباحان على فرعين متوازيين؛ V2 موصول على التفرع مع المصباح الثاني.',
  `${wire('parallel-top-rail', 'M90 55 H550')}${wire('parallel-bottom-rail', 'M90 215 H550')}
   ${wire('parallel-source-top', 'M90 55 V103')}${wire('parallel-source-bottom', 'M90 163 V215')}
   ${wire('parallel-lamp-1-top', 'M270 55 V112')}${wire('parallel-lamp-1-bottom', 'M270 154 V215')}
   ${wire('parallel-lamp-2-top', 'M430 55 V112')}${wire('parallel-lamp-2-bottom', 'M430 154 V215')}
   ${wire('parallel-v2-top', 'M430 112 H510 V115')}${wire('parallel-v2-bottom', 'M510 151 V154 H430')}
   <g data-part="generator" data-terminals="90,103 90,163"><path d="M70 119h40m-40 26h40" fill="none" stroke="#bf4939" stroke-width="4"/><text x="114" y="121" direction="ltr" style="fill:#202949;font:800 15px Manrope,Arial,sans-serif">+</text><text x="114" y="165" direction="ltr" style="fill:#202949;font:800 15px Manrope,Arial,sans-serif">−</text></g>
   <g data-part="lamp-1" data-terminals="270,112 270,154"><circle cx="270" cy="133" r="21" fill="#fff4c3" stroke="#a77a25" stroke-width="3"/><path d="M258 121l24 24m0-24-24 24" stroke="#9f6331" stroke-width="2.5"/></g>
   <g data-part="lamp-2" data-terminals="430,112 430,154"><circle cx="430" cy="133" r="21" fill="#fff4c3" stroke="#a77a25" stroke-width="3"/><path d="M418 121l24 24m0-24-24 24" stroke="#9f6331" stroke-width="2.5"/></g>
   <g data-part="voltmeter-v2" data-terminals="510,115 510,151"><circle cx="510" cy="133" r="18" fill="#fff" stroke="#2d4eae" stroke-width="3"/><text x="510" y="139" direction="ltr" style="fill:#1c2860;font:800 16px Manrope,Arial,sans-serif">V₂</text></g>
   ${text(150, 40, 'U = 9 V')}${text(270, 196, 'L₁')}${text(430, 196, 'L₂')}`,
);

const seriesThreeDrops = figure(
  'u2l3-test-series',
  'ثلاثة مصابيح على التسلسل مع فرق كمون معلوم',
  'مسار تسلسلي واحد، مصدر 24 فولت، وفروق كمون 8 فولت و9 فولت على المصباحين الأول والثاني؛ فرق المصباح الثالث مجهول.',
  `${wire('series-left', 'M80 70 V220')}${wire('series-top-1', 'M80 70 H160')}${wire('series-top-2', 'M200 70 H300')}${wire('series-top-3', 'M340 70 H440')}${wire('series-top-4', 'M480 70 H570')}
   ${wire('series-right', 'M570 70 V220')}${wire('series-bottom-left', 'M80 220 H280')}${wire('series-bottom-right', 'M360 220 H570')}
   <g data-part="lamp-1" data-terminals="160,70 200,70"><circle cx="180" cy="70" r="20" fill="#fff4c3" stroke="#a77a25" stroke-width="3"/><path d="M168 58l24 24m0-24-24 24" stroke="#9f6331" stroke-width="2.5"/></g>
   <g data-part="lamp-2" data-terminals="300,70 340,70"><circle cx="320" cy="70" r="20" fill="#fff4c3" stroke="#a77a25" stroke-width="3"/><path d="M308 58l24 24m0-24-24 24" stroke="#9f6331" stroke-width="2.5"/></g>
   <g data-part="lamp-3" data-terminals="440,70 480,70"><circle cx="460" cy="70" r="20" fill="#fff4c3" stroke="#a77a25" stroke-width="3"/><path d="M448 58l24 24m0-24-24 24" stroke="#9f6331" stroke-width="2.5"/></g>
   <g data-part="generator" data-terminals="280,220 360,220"><path d="M280 220h30m40 0h10" fill="none" stroke="#3667bd" stroke-width="4"/><path d="M320 201v38m18-30v22" stroke="#bf4939" stroke-width="4"/><text x="305" y="205" direction="ltr" style="fill:#202949;font:800 15px Manrope,Arial,sans-serif">+</text><text x="345" y="205" direction="ltr" style="fill:#202949;font:800 15px Manrope,Arial,sans-serif">−</text></g>
   ${text(180, 115, 'U₁ = 8 V')}${text(320, 115, 'U₂ = 9 V')}${text(460, 115, 'U₃ = ?')}${text(320, 254, 'U = 24 V')}`,
);

export function unit2l3AssessmentDiagram(question) {
  if (question?.diagram === 'parallel-readings') return parallelReadings;
  if (question?.diagram === 'series-three-drops') return seriesThreeDrops;
  return '';
}
