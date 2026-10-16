const label = (x, y, text, options = {}) => `<text x="${x}" y="${y}" class="${options.className ?? 'p3-label'}" text-anchor="${options.anchor ?? 'middle'}" direction="${options.direction ?? 'rtl'}">${text}</text>`;
const wire = (name, path) => `<path class="p3-wire" data-wire="${name}" d="${path}"/>`;

const DIAGRAMS = Object.freeze({
  'daily-devices': {
    page: 97,
    title: 'أجهزة تعمل بالطاقة الكهربائية',
    description: 'ثلاثة أمثلة يومية: مصابيح، بطارية، وحاسوب؛ تحتاج الأجهزة إلى نقل الطاقة الكهربائية.',
    caption: 'إعادة بناء توضيحية لصور التمهيد في الكتاب: مصابيح وبطارية وحاسوب.',
    svg: (id) => `<svg class="p3-svg p3-device-svg" viewBox="0 0 760 280" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${DIAGRAMS['daily-devices'].title}</title><desc id="${id}-desc">${DIAGRAMS['daily-devices'].description}</desc>
      <defs><linearGradient id="${id}-glow" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff6c5"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
      <rect class="p3-device-card" x="18" y="22" width="724" height="236" rx="26"/>
      <g transform="translate(115 52)"><path class="p3-bulb-glass" d="M28 9C6 9 0 29 7 43c4 7 10 11 11 22h20c1-11 7-15 11-22C56 29 50 9 28 9Z"/><path class="p3-bulb-wire" d="M20 65h17M20 72h17M22 79h13"/><path class="p3-bulb-filament" d="M20 28l16 22M36 28 20 50M28 26v28"/><path class="p3-screw" d="M24 82h9v19h-9z"/><path class="p3-bulb-base" d="M23 101h11v8H23z"/><circle class="p3-spark" cx="6" cy="9" r="3"/><circle class="p3-spark" cx="50" cy="14" r="3"/></g>
      <g transform="translate(322 76)"><rect class="p3-battery" x="0" y="36" width="156" height="74" rx="33"/><rect class="p3-battery-cap" x="137" y="56" width="18" height="34" rx="4"/><rect class="p3-battery-cap" x="-6" y="56" width="18" height="34" rx="4"/><text class="p3-battery-sign" x="40" y="83" direction="ltr">−</text><text class="p3-battery-sign" x="106" y="83" direction="ltr">+</text><path class="p3-battery-band" d="M56 39v68"/></g>
      <g transform="translate(548 58)"><rect class="p3-monitor" x="0" y="0" width="152" height="106" rx="12"/><rect class="p3-screen" x="11" y="11" width="130" height="80" rx="7"/><path class="p3-stand" d="M63 106v25h28v8H52v-8h11"/><rect class="p3-keyboard" x="19" y="148" width="136" height="12" rx="5"/><g class="p3-key-dots"><circle cx="35" cy="154" r="1.5"/><circle cx="47" cy="154" r="1.5"/><circle cx="59" cy="154" r="1.5"/><circle cx="71" cy="154" r="1.5"/><circle cx="83" cy="154" r="1.5"/><circle cx="95" cy="154" r="1.5"/><circle cx="107" cy="154" r="1.5"/><circle cx="119" cy="154" r="1.5"/></g></g>
      ${label(142, 218, 'مصابيح')}${label(400, 218, 'بطارية')}${label(625, 218, 'حاسوب')}
    </svg>`,
  },
  'water-levels': {
    page: 98,
    title: 'أوعية متصلة: فرق منسوب الماء',
    description: 'مقارنتان لماء في وعاءين متصلين: تساوي السطحين لا يدفع جرياناً صافياً، واختلاف الارتفاعين يسبب انتقال الماء من الأعلى إلى الأدنى عند فتح الصنبور.',
    caption: 'إعادة بناء للشكلين (1) و(2) في ص98. المستوى المائي تشبيه للفرق، وليس قياساً كهربائياً.',
    svg: (id) => `<svg class="p3-svg" viewBox="0 0 760 330" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${DIAGRAMS['water-levels'].title}</title><desc id="${id}-desc">${DIAGRAMS['water-levels'].description}</desc>
      <rect class="p3-panel" x="18" y="18" width="350" height="294" rx="22"/><rect class="p3-panel" x="392" y="18" width="350" height="294" rx="22"/>
      ${label(193, 52, 'الحالة الأولى · مستويان متساويان', { className: 'p3-panel-title' })}${label(567, 52, 'الحالة الثانية · منسوبان مختلفان', { className: 'p3-panel-title' })}
      <g class="p3-vessel"><path d="M85 88v143q0 14 14 14h54q14 0 14-14V88"/><path d="M217 88v143q0 14 14 14h54q14 0 14-14V88"/><path class="p3-water" d="M89 148h74v83q0 10-10 10H99q-10 0-10-10z"/><path class="p3-water" d="M221 148h74v83q0 10-10 10h-54q-10 0-10-10z"/><path class="p3-water-surface" d="M89 148h74M221 148h74"/><path class="p3-pipe" d="M122 244v20h140v-20"/><path class="p3-tap" d="M181 264v19m-12 0h24m-18-19h12"/></g>
      <text x="340" y="171" class="p3-number" direction="ltr">(1)</text>
      <g class="p3-vessel" transform="translate(374 0)"><path d="M85 88v143q0 14 14 14h54q14 0 14-14V88"/><path d="M217 88v143q0 14 14 14h54q14 0 14-14V88"/><path class="p3-water" d="M89 184h74v47q0 10-10 10H99q-10 0-10-10z"/><path class="p3-water" d="M221 108h74v123q0 10-10 10h-54q-10 0-10-10z"/><path class="p3-water-surface" d="M89 184h74M221 108h74"/><path class="p3-pipe" d="M122 244v20h140v-20"/><path class="p3-tap" d="M181 264v19m-12 0h24m-18-19h12"/><path class="p3-flow-arrow" d="M246 256h-90"/><path class="p3-flow-head" d="m155 256 13-8v16z"/></g>
      <text x="714" y="171" class="p3-number" direction="ltr">(2)</text>
      ${label(193, 292, 'الصنبور مغلق / منسوبان متساويان', { className: 'p3-panel-note' })}${label(567, 292, 'عند فتح الصنبور يجري الماء من الأعلى إلى الأدنى', { className: 'p3-panel-note' })}
    </svg>`,
  },
  'charge-transfer': {
    page: 98,
    title: 'انتقال الشحنات بين ناقلين مختلفي الكمون',
    description: 'ناقل ذو كمون مرتفع متصل بساق ناقلة بناقل ذي كمون منخفض؛ الأسهم تبين انتقال الشحنات كما في الشكل التعليمي.',
    caption: 'إعادة بناء للشكل (3) في ص98؛ يبين الاتصال الناقل والاتجاه المرتبط بفرق الكمون.',
    svg: (id) => `<svg class="p3-svg" viewBox="0 0 720 290" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${DIAGRAMS['charge-transfer'].title}</title><desc id="${id}-desc">${DIAGRAMS['charge-transfer'].description}</desc>
      <rect class="p3-panel" x="16" y="16" width="688" height="258" rx="26"/>
      <text x="145" y="60" class="p3-panel-title">كمون كهربائي منخفض</text><text x="575" y="60" class="p3-panel-title">كمون كهربائي مرتفع</text>
      <path class="p3-conductor" d="M200 145H520"/><path class="p3-insulator" d="M218 146v84m286-84v84"/>
      <ellipse class="p3-sphere" cx="170" cy="143" rx="52" ry="48"/><ellipse class="p3-sphere" cx="550" cy="143" rx="52" ry="48"/>
      <g class="p3-charge-minus"><circle cx="151" cy="127" r="7"/><circle cx="185" cy="146" r="7"/><circle cx="154" cy="164" r="7"/><circle cx="181" cy="120" r="7"/></g>
      <g class="p3-charge-plus"><circle cx="530" cy="125" r="8"/><circle cx="565" cy="143" r="8"/><circle cx="535" cy="163" r="8"/><circle cx="569" cy="119" r="8"/><circle cx="552" cy="177" r="8"/></g>
      <path class="p3-transfer-arrow" d="M474 213H247"/><path class="p3-transfer-head" d="m247 213 17-10v20z"/>
      ${label(360, 247, 'انتقال عبر ساق ناقلة من الكمون المرتفع إلى المنخفض', { className: 'p3-panel-note' })}
    </svg>`,
  },
  'pump-circuit': {
    page: 99,
    title: 'المضخة والمولد: تشبيه انتقال الماء والشحنات',
    description: 'لوحتان تقارنان دورة الماء بمضخة مع دارة كهربائية مغلقة يقودها مولد؛ الأسهم تبين اتجاه الدوران، والفولتميتر الإضافي على التفرع عبر المولد.',
    caption: 'رسم توضيحي من المنصة مرتبط بتشبيه ص99. أضيف فولتميتر موصول على التفرع لإظهار طريقة القياس؛ لا يمثل قراءة مطبوعة. الماء لا يماثل الشحنة في كل خواصها.',
    svg: (id) => `<svg class="p3-svg" viewBox="0 0 780 390" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${DIAGRAMS['pump-circuit'].title}</title><desc id="${id}-desc">${DIAGRAMS['pump-circuit'].description}</desc>
      <rect class="p3-panel" x="14" y="18" width="366" height="354" rx="24"/><rect class="p3-panel" x="400" y="18" width="366" height="354" rx="24"/>
      ${label(197, 55, 'دارة مائية', { className: 'p3-panel-title' })}${label(583, 55, 'دارة كهربائية', { className: 'p3-panel-title' })}
      <path class="p3-water-pipe" d="M80 130H300V280H80V130"/><rect class="p3-water-tank" x="106" y="96" width="72" height="112" rx="18"/><rect class="p3-water-tank" x="218" y="176" width="72" height="112" rx="18"/><path class="p3-water" d="M110 151h64v53h-64z"/><path class="p3-water" d="M222 231h64v53h-64z"/>
      <g class="p3-pump"><circle cx="80" cy="205" r="28"/><path d="M68 190l24 15-24 15z"/></g>
      <path class="p3-flow-arrow" d="M110 280h160"/><path class="p3-flow-head" d="m270 280-16-9v18z"/><path class="p3-flow-arrow" d="M300 255V144"/><path class="p3-flow-head" d="m300 144-9 16h18z"/>
      ${label(142, 91, 'الوعاء (أ)')}${label(254, 171, 'الوعاء (ب)')}${label(80, 253, 'مضخة', { className: 'p3-small-label' })}
      ${wire('electric-top', 'M454 128H712')}${wire('electric-right-upper', 'M712 128V179')}${wire('electric-right-lower', 'M712 234V284')}${wire('electric-bottom-right', 'M712 284H578')}${wire('electric-bottom-left', 'M550 284H454')}${wire('electric-left', 'M454 284V128')}
      <g class="p3-resistor"><path d="M712 179l-10 7 20 7-20 7 20 7-20 7 20 7-10 13"/></g>
      <g class="p3-generator" data-part="generator-analogy" data-terminals="550,284 578,284"><path class="p3-battery-long" d="M550 263v42"/><path class="p3-battery-short" d="M578 271v26"/><text class="p3-sign" x="538" y="259" direction="ltr">+</text><text class="p3-sign" x="580" y="259" direction="ltr">−</text></g>
      ${wire('voltmeter-upper', 'M550 284V335H546')}${wire('voltmeter-lower', 'M578 284V335H582')}
      <g data-part="voltmeter-generator" data-terminals="546,335 582,335"><circle class="p3-voltmeter" cx="564" cy="335" r="18"/><text class="p3-meter-letter" x="564" y="341" direction="ltr">V</text></g>
      <path class="p3-flow-arrow" d="M554 128H674"/><path class="p3-flow-head" d="m674 128-16-9v18z"/><path class="p3-flow-arrow" d="M712 150V260"/><path class="p3-flow-head" d="m712 260-9-16h18z"/><path class="p3-flow-arrow" d="M676 284H610"/><path class="p3-flow-head" d="m610 284 16-9v18z"/><path class="p3-flow-arrow" d="M454 258V150"/><path class="p3-flow-head" d="m454 150-9 16h18z"/>
      ${label(564, 370, 'الفولتميتر على التفرع عبر المولد · شرح المنصة', { className: 'p3-small-label' })}${label(588, 90, 'مقاومة / مصباح', { className: 'p3-small-label' })}
    </svg>`,
  },
  'source-circuit': {
    page: 100,
    title: 'قياس فرق الكمون في دارة بمولد ومصباح',
    description: 'دارة فيها مصباح وأمبيرمتر على التسلسل ومفتاح ومولد؛ فولتميتران موصولان على التفرع عبر المصباح وعبر المولد.',
    caption: 'إعادة بناء تجربة ص100: الأمبيرمتر على التسلسل، والفولتميتران على التفرع. لا توجد قراءات رقمية مطبوعة.',
    svg: (id) => `<svg class="p3-svg p3-circuit-svg" viewBox="0 0 720 490" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${DIAGRAMS['source-circuit'].title}</title><desc id="${id}-desc">${DIAGRAMS['source-circuit'].description}</desc>
      <rect class="p3-circuit-back" x="18" y="20" width="684" height="448" rx="26"/>
      ${wire('s-top-left', 'M150 110 H338')}${wire('s-top-right', 'M382 110 H620')}
      ${wire('s-right-upper', 'M620 110 V200')}${wire('s-right-lower', 'M620 240 V340')}
      ${wire('s-bottom-left', 'M150 340 H320')}${wire('s-bottom-right', 'M420 340 H620')}
      ${wire('s-left-upper', 'M150 110 V198')}${wire('s-left-lower', 'M150 242 V340')}
      ${wire('s-lamp-v-top', 'M150 198 H70 V200')}${wire('s-lamp-v-bottom', 'M70 240 H95 V242 H150')}
      ${wire('s-source-v-left', 'M320 340 V420 H350')}${wire('s-source-v-right', 'M390 420 H420 V340')}
      <g class="p3-part" data-part="ammeter" data-terminals="338,110 382,110"><circle class="p3-meter" cx="360" cy="110" r="22"/><text class="p3-meter-letter" x="360" y="117" direction="ltr">A</text></g>
      <g class="p3-part" data-part="lamp" data-terminals="150,198 150,242"><circle class="p3-lamp-symbol" cx="150" cy="220" r="22"/><path class="p3-lamp-cross" d="M137 207l26 26m0-26-26 26"/></g>
      <g class="p3-part" data-part="switch" data-terminals="620,200 620,240"><circle class="p3-contact" cx="620" cy="200" r="5"/><circle class="p3-contact" cx="620" cy="240" r="5"/><path class="p3-switch-lever" d="M620 200l-20 18"/></g>
      <g class="p3-part" data-part="generator" data-terminals="320,340 420,340"><path class="p3-battery-wire" d="M320 340H360M400 340H420"/><path class="p3-battery-long" d="M370 319v42"/><path class="p3-battery-short" d="M390 327v26"/><text class="p3-sign" x="360" y="317" direction="ltr">+</text><text class="p3-sign" x="402" y="317" direction="ltr">−</text></g>
      <g class="p3-part" data-part="voltmeter-lamp" data-terminals="70,200 70,240"><circle class="p3-meter" cx="70" cy="220" r="20"/><text class="p3-meter-letter" x="70" y="227" direction="ltr">V</text></g>
      <g class="p3-part" data-part="voltmeter-source" data-terminals="350,420 390,420"><circle class="p3-meter" cx="370" cy="420" r="20"/><text class="p3-meter-letter" x="370" y="427" direction="ltr">V</text></g>
      ${label(422, 78, 'A · أمبيرمتر', { className: 'p3-schematic-label' })}${label(101, 288, 'مصباح', { className: 'p3-schematic-label' })}${label(638, 224, 'قاطعة', { className: 'p3-schematic-label', anchor: 'start' })}${label(370, 387, 'المولد', { className: 'p3-schematic-label' })}
      <text x="70" y="260" class="p3-meter-caption" direction="rtl" text-anchor="middle">عبر المصباح</text><text x="370" y="462" class="p3-meter-caption" direction="rtl" text-anchor="middle">عبر المولد</text>
    </svg>`,
  },
  'series-circuit': {
    page: 101,
    title: 'دارة متسلسلة وقياس فرق الكمون الكلي والجزئي',
    description: 'مصدر ومصباحان موصولان في مسار واحد؛ الفولتميترات V1 وV2 على طرفي المصباحين وV على طرفي المولد.',
    caption: 'إعادة بناء رسم ص101؛ كل فولتميتر موصول على التفرع عبر العنصر الذي يقيسه.',
    svg: (id) => `<svg class="p3-svg p3-circuit-svg" viewBox="0 0 760 500" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${DIAGRAMS['series-circuit'].title}</title><desc id="${id}-desc">${DIAGRAMS['series-circuit'].description}</desc>
      <rect class="p3-circuit-back" x="18" y="16" width="724" height="464" rx="26"/>
      ${wire('ser-left', 'M130 110 V350')}${wire('ser-top-left', 'M130 110 H221')}${wire('ser-between', 'M269 110 H391')}${wire('ser-top-right', 'M439 110 H630')}
      ${wire('ser-right-upper', 'M630 110 V205')}${wire('ser-right-lower', 'M630 245 V350')}
      ${wire('ser-bottom-left', 'M130 350 H320')}${wire('ser-bottom-right', 'M440 350 H630')}
      ${wire('ser-v1-left', 'M221 110 V50 H225')}${wire('ser-v1-right', 'M265 50 H269 V110')}
      ${wire('ser-v2-left', 'M391 110 V50 H395')}${wire('ser-v2-right', 'M435 50 H439 V110')}
      ${wire('ser-v-source-left', 'M320 350 V420 H360')}${wire('ser-v-source-right', 'M400 420 H440 V350')}
      <g class="p3-part" data-part="lamp-1" data-terminals="221,110 269,110"><circle class="p3-lamp-symbol" cx="245" cy="110" r="24"/><path class="p3-lamp-cross" d="M231 96l28 28m0-28-28 28"/></g>
      <g class="p3-part" data-part="lamp-2" data-terminals="391,110 439,110"><circle class="p3-lamp-symbol" cx="415" cy="110" r="24"/><path class="p3-lamp-cross" d="M401 96l28 28m0-28-28 28"/></g>
      <g class="p3-part" data-part="switch" data-terminals="630,205 630,245"><circle class="p3-contact" cx="630" cy="205" r="5"/><circle class="p3-contact" cx="630" cy="245" r="5"/><path class="p3-switch-closed" d="M630 205v40"/></g>
      <g class="p3-part" data-part="generator" data-terminals="320,350 440,350"><path class="p3-battery-wire" d="M320 350H365M395 350H440"/><path class="p3-battery-long" d="M375 329v42"/><path class="p3-battery-short" d="M390 337v26"/><text class="p3-sign" x="354" y="328" direction="ltr">+</text><text class="p3-sign" x="398" y="328" direction="ltr">−</text></g>
      <g class="p3-part" data-part="voltmeter-lamp-1" data-terminals="225,50 265,50"><circle class="p3-meter" cx="245" cy="50" r="20"/><text class="p3-meter-letter" x="245" y="57" direction="ltr">V₁</text></g>
      <g class="p3-part" data-part="voltmeter-lamp-2" data-terminals="395,50 435,50"><circle class="p3-meter" cx="415" cy="50" r="20"/><text class="p3-meter-letter" x="415" y="57" direction="ltr">V₂</text></g>
      <g class="p3-part" data-part="voltmeter-source" data-terminals="360,420 400,420"><circle class="p3-meter" cx="380" cy="420" r="20"/><text class="p3-meter-letter" x="380" y="427" direction="ltr">V</text></g>
      ${label(245, 24, 'U₁', { className: 'p3-voltage-label', direction: 'ltr' })}${label(415, 24, 'U₂', { className: 'p3-voltage-label', direction: 'ltr' })}${label(380, 458, 'U', { className: 'p3-voltage-label', direction: 'ltr' })}
      ${label(245, 160, 'المصباح الأول', { className: 'p3-schematic-label' })}${label(415, 160, 'المصباح الثاني', { className: 'p3-schematic-label' })}${label(380, 390, 'المولد', { className: 'p3-schematic-label' })}${label(650, 230, 'قاطعة', { className: 'p3-schematic-label', anchor: 'start' })}
    </svg>`,
  },
  'parallel-circuit': {
    page: 102,
    title: 'دارة متفرعة وقياس فرق الكمون في كل فرع',
    description: 'مصدر على المسار الرئيسي ومصباحان في فرعين متوازيين؛ الفولتميترات V1 وV2 عبر المصباحين، وV عبر المولد.',
    caption: 'إعادة بناء رسم ص102؛ طرفا كل مصباح متصلان بالعقدتين نفسيهما، لذا يقاس الكمون عبر كل فرع على حدة.',
    svg: (id) => `<svg class="p3-svg p3-circuit-svg" viewBox="0 0 760 500" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${DIAGRAMS['parallel-circuit'].title}</title><desc id="${id}-desc">${DIAGRAMS['parallel-circuit'].description}</desc>
      <rect class="p3-circuit-back" x="18" y="16" width="724" height="464" rx="26"/>
      ${wire('par-top-rail', 'M130 120 H630')}${wire('par-bottom-rail', 'M130 350 H630')}
      ${wire('par-source-top', 'M130 120 V190')}${wire('par-source-bottom', 'M130 270 V350')}
      ${wire('par-lamp-1-top', 'M300 120 V198')}${wire('par-lamp-1-bottom', 'M300 242 V350')}
      ${wire('par-lamp-2-top', 'M470 120 V198')}${wire('par-lamp-2-bottom', 'M470 242 V350')}
      ${wire('par-switch-top', 'M630 120 V205')}${wire('par-switch-bottom', 'M630 245 V350')}
      ${wire('par-v-source-top', 'M130 190 H70 V210')}${wire('par-v-source-bottom', 'M70 250 V270 H130')}
      ${wire('par-v1-top', 'M300 198 H230 V200')}${wire('par-v1-bottom', 'M230 240 V259 H300 V242')}
      ${wire('par-v2-top', 'M470 198 H540 V200')}${wire('par-v2-bottom', 'M540 240 V259 H470 V242')}
      <g class="p3-part" data-part="generator" data-terminals="130,190 130,270"><path class="p3-battery-long" d="M109 220h42"/><path class="p3-battery-short" d="M117 240h26"/><text class="p3-sign" x="151" y="218" direction="ltr">+</text><text class="p3-sign" x="151" y="258" direction="ltr">−</text></g>
      <g class="p3-part" data-part="lamp-1" data-terminals="300,198 300,242"><circle class="p3-lamp-symbol" cx="300" cy="220" r="22"/><path class="p3-lamp-cross" d="M287 207l26 26m0-26-26 26"/></g>
      <g class="p3-part" data-part="lamp-2" data-terminals="470,198 470,242"><circle class="p3-lamp-symbol" cx="470" cy="220" r="22"/><path class="p3-lamp-cross" d="M457 207l26 26m0-26-26 26"/></g>
      <g class="p3-part" data-part="switch" data-terminals="630,205 630,245"><circle class="p3-contact" cx="630" cy="205" r="5"/><circle class="p3-contact" cx="630" cy="245" r="5"/><path class="p3-switch-closed" d="M630 205v40"/></g>
      <g class="p3-part" data-part="voltmeter-source" data-terminals="70,210 70,250"><circle class="p3-meter" cx="70" cy="230" r="20"/><text class="p3-meter-letter" x="70" y="237" direction="ltr">V</text></g>
      <g class="p3-part" data-part="voltmeter-lamp-1" data-terminals="230,200 230,240"><circle class="p3-meter" cx="230" cy="220" r="20"/><text class="p3-meter-letter" x="230" y="227" direction="ltr">V₁</text></g>
      <g class="p3-part" data-part="voltmeter-lamp-2" data-terminals="540,200 540,240"><circle class="p3-meter" cx="540" cy="220" r="20"/><text class="p3-meter-letter" x="540" y="227" direction="ltr">V₂</text></g>
      ${label(70, 185, 'U', { className: 'p3-voltage-label', direction: 'ltr' })}${label(230, 185, 'U₁', { className: 'p3-voltage-label', direction: 'ltr' })}${label(540, 185, 'U₂', { className: 'p3-voltage-label', direction: 'ltr' })}
      ${label(130, 166, 'المولد', { className: 'p3-schematic-label' })}${label(300, 288, 'المصباح الأول', { className: 'p3-schematic-label' })}${label(470, 288, 'المصباح الثاني', { className: 'p3-schematic-label' })}${label(650, 230, 'قاطعة', { className: 'p3-schematic-label', anchor: 'start' })}
    </svg>`,
  },
  'transformer': {
    page: 103,
    title: 'محول خافض للكمون',
    description: 'ملف ابتدائي بعدد لفات أكبر وملف ثانوي بعدد لفات أقل على قلب حديدي؛ ينتج المحول الخافض جهداً متناوباً أقل في جهة الخرج.',
    caption: 'رسم توضيحي من المنصة لفكرة المحول الخافض الواردة في مهمة البحث بص103؛ لا يُوصَل بمصدر الكهرباء المنزلية في نشاط مدرسي.',
    svg: (id) => `<svg class="p3-svg" viewBox="0 0 760 340" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">${DIAGRAMS['transformer'].title}</title><desc id="${id}-desc">${DIAGRAMS['transformer'].description}</desc>
      <rect class="p3-panel" x="20" y="20" width="720" height="300" rx="26"/>
      <path class="p3-core" d="M280 78h200v184H280v-38h162V116H280z"/>
      <path class="p3-coil-primary" d="M210 85c-44 0-44 26 0 26s44 26 0 26  -44 26 0 26 44 26 0 26 -44 26 0 26 44 26 0 26"/>
      <path class="p3-coil-secondary" d="M550 119c-40 0-40 28 0 28s40 28 0 28-40 28 0 28 40 28 0 28"/>
      <path class="p3-ac-line" d="M118 114h42m-42 114h42M600 144h42m-42 114h42"/><text x="137" y="99" class="p3-transformer-value" direction="ltr">220 V~</text><text x="623" y="129" class="p3-transformer-value" direction="ltr">110 V~</text>
      <path class="p3-terminal-line" d="M160 114h50M160 228h50M550 144h50M550 258h50"/>
      ${label(210, 294, 'الملف الابتدائي · لفات أكثر', { className: 'p3-panel-note' })}${label(550, 294, 'الملف الثانوي · لفات أقل', { className: 'p3-panel-note' })}${label(380, 57, 'قلب حديدي مشترك', { className: 'p3-small-label' })}
    </svg>`,
  },
});

export const UNIT2L3_DIAGRAMS = DIAGRAMS;

export function unit2l3DiagramMarkup(id, uniqueId = `u2l3-${id}`) {
  const diagram = DIAGRAMS[id];
  if (!diagram) throw new RangeError(`Unknown Unit 2 Lesson 3 diagram: ${id}`);
  return `<figure class="p3-figure" data-source-figure="p${diagram.page}" data-diagram-id="${id}">
    <div class="p3-figure-visual">${diagram.svg(uniqueId)}</div>
    <figcaption><span class="p3-figure-kicker">رسم توضيحي من المنصة · مرجع ص${diagram.page}</span><span>${diagram.caption}</span></figcaption>
  </figure>`;
}
