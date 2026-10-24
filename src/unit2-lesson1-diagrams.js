const svgText = (x, y, value, className = 'u2-svg-label', anchor = 'middle') => `<text x="${x}" y="${y}" class="${className}" text-anchor="${anchor}" dir="auto">${value}</text>`;
const mathText = (x, y, value, className = 'u2-svg-math', anchor = 'middle') => `<text x="${x}" y="${y}" class="${className}" text-anchor="${anchor}" direction="ltr">${value}</text>`;
const forceText = (x, y, subscript, className = 'u2-svg-force') => `<text x="${x}" y="${y}" class="${className}" text-anchor="middle" direction="ltr">F<tspan baseline-shift="sub" font-size="12">${subscript}</tspan></text>`;
const charge = (x, y, sign, kind = sign === '+' ? 'positive' : 'negative', radius = 14) => `<g class="u2-charge u2-charge-${kind}"><circle cx="${x}" cy="${y}" r="${radius}" />${mathText(x, y + 6, sign, 'u2-svg-charge-sign')}</g>`;
const numbered = (x, y, value) => `<g class="u2-diagram-number"><circle cx="${x}" cy="${y}" r="15" />${svgText(x, y + 5, value, 'u2-svg-number')}</g>`;

function markers(id) {
  return `<defs>
    <marker id="${id}-navy" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#294c7a" /></marker>
    <marker id="${id}-red" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#b84b44" /></marker>
    <marker id="${id}-gold" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#a96d13" /></marker>
    <marker id="${id}-dimension" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#56627a" /></marker>
  </defs>`;
}

function frame(id, title, description, body, viewBox = '0 0 720 420', extraDefs = '') {
  return `<svg class="u2-diagram-svg" viewBox="${viewBox}" role="img" aria-labelledby="${id}-title ${id}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${id}-title">${title}</title><desc id="${id}-desc">${description}</desc>${markers(id)}${extraDefs ? `<defs>${extraDefs}</defs>` : ''}${body}</svg>`;
}

function electroscope(cx, cy, diverged, id, scale = 1) {
  const left = diverged ? -34 : -4;
  const right = diverged ? 34 : 4;
  return `<g class="u2-electroscope" transform="translate(${cx} ${cy}) scale(${scale})">
    <rect x="-72" y="40" width="144" height="202" rx="48" class="u2-scope-jar" />
    <rect x="-20" y="33" width="40" height="18" rx="5" class="u2-scope-stopper" />
    <ellipse cx="0" cy="16" rx="24" ry="9" class="u2-scope-disc" />
    <line x1="0" y1="25" x2="0" y2="137" class="u2-scope-stem" />
    <line x1="0" y1="137" x2="${left}" y2="211" class="u2-scope-leaf" />
    <line x1="0" y1="137" x2="${right}" y2="211" class="u2-scope-leaf" />
    <rect x="-60" y="239" width="120" height="16" rx="8" class="u2-scope-base" />
  </g>`;
}

function dimension(id, x1, x2, y, label, extensionY) {
  return `<g class="u2-dimension"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" marker-start="url(#${id}-dimension)" marker-end="url(#${id}-dimension)" /><line x1="${x1}" y1="${y + 7}" x2="${x1}" y2="${extensionY}" class="u2-extension" /><line x1="${x2}" y1="${y + 7}" x2="${x2}" y2="${extensionY}" class="u2-extension" />${mathText((x1 + x2) / 2, y - 12, label, 'u2-svg-dimension')}</g>`;
}

const ELECTROSCOPE_PARTS = frame('electroscope-parts-svg', 'أجزاء الكاشف الكهربائي', 'رسم موسوم للقرص المعدني والسدادة والساق المعدنية والوريقتين المعدنيتين الرقيقتين والإناء الزجاجي.', `
  ${electroscope(360, 48, false, 'parts', 1.05)}
  <g class="u2-leaders"><line x1="218" y1="55" x2="334" y2="65" /><line x1="218" y1="116" x2="339" y2="96" /><line x1="218" y1="177" x2="357" y2="156" /><line x1="238" y1="318" x2="342" y2="250" /><line x1="502" y1="192" x2="435" y2="192" /></g>
  ${svgText(202, 60, 'قرص معدني', 'u2-svg-label', 'end')}
  ${svgText(202, 121, 'سدادة', 'u2-svg-label', 'end')}
  ${svgText(202, 182, 'ساق معدنية', 'u2-svg-label', 'end')}
  ${svgText(222, 310, 'ورقتين معدنيتين', 'u2-svg-label', 'end')}
  ${svgText(222, 334, 'رقيقتين', 'u2-svg-label', 'end')}
  ${svgText(518, 197, 'إناء زجاجي', 'u2-svg-label', 'start')}
`, '0 0 720 400');

const ELECTROSCOPE_STATES = frame('electroscope-states-svg', 'الكاشف المعتدل والمشحون', 'كاشفان يوضحان انطباق الوريقتين في الحالة المعتدلة وانفراجهما في الحالة المشحونة.', `
  ${electroscope(210, 35, false, 'neutral', 0.9)}
  ${electroscope(510, 35, true, 'charged', 0.9)}
  ${svgText(210, 310, 'معتدل: الوريقتان منطبقتان', 'u2-svg-label')}
  ${svgText(510, 310, 'مشحون: الوريقتان منفرجتان', 'u2-svg-label')}
`, '0 0 720 340');

const COULOMB_PAIR = frame('coulomb-pair-svg', 'قوتا كولوم في التنافر والتجاذب', 'في الشكل a شحنتان موجبتان q1 وq2 وسهمان متساويان متعاكسان F21 وF12. في الشكل b شحنة موجبة وأخرى سالبة وسهمان متجهان أحدهما نحو الآخر. البعد d موضح في الشكلين.', `
  ${mathText(55, 62, '(a)', 'u2-svg-panel')}
  ${dimension('coulomb-pair-svg', 220, 500, 82, 'd', 138)}
  <line x1="220" y1="150" x2="500" y2="150" class="u2-force-carrier" />
  ${charge(220, 150, '+', 'positive', 23)}${charge(500, 150, '+', 'positive', 23)}
  <line x1="196" y1="150" x2="106" y2="150" class="u2-force-red" marker-end="url(#coulomb-pair-svg-red)" />
  <line x1="524" y1="150" x2="614" y2="150" class="u2-force-red" marker-end="url(#coulomb-pair-svg-red)" />
  ${forceText(116, 126, '21')}${forceText(604, 126, '12')}
  ${mathText(220, 190, 'q₁')}${mathText(500, 190, 'q₂')}
  ${mathText(55, 296, '(b)', 'u2-svg-panel')}
  ${dimension('coulomb-pair-svg', 220, 500, 316, 'd', 372)}
  <line x1="220" y1="384" x2="500" y2="384" class="u2-force-carrier" />
  ${charge(220, 384, '+', 'positive', 23)}${charge(500, 384, '−', 'negative', 23)}
  <line x1="244" y1="384" x2="334" y2="384" class="u2-force-navy" marker-end="url(#coulomb-pair-svg-navy)" />
  <line x1="476" y1="384" x2="386" y2="384" class="u2-force-navy" marker-end="url(#coulomb-pair-svg-navy)" />
  ${forceText(294, 360, '21')}${forceText(426, 360, '12')}
  ${mathText(220, 424, 'q₁')}${mathText(500, 424, 'q₂')}
`, '0 0 720 460');

const COULOMB_EXAMPLE = frame('coulomb-example-svg', 'تمثيل قوتي التطبيق المحلول', 'الشحنتان q1 وq2 موجبتان وتتنافران. القوة على q1 باتجاه اليسار F2/1 والقوة على q2 باتجاه اليمين F1/2، ولهما الشدة نفسها 36 نيوتن والبعد 1 متر.', `
  ${dimension('coulomb-example-svg', 220, 500, 65, 'd = 1 m', 132)}
  <line x1="220" y1="150" x2="500" y2="150" class="u2-force-carrier" />
  ${charge(220, 150, '+', 'positive', 19)}${charge(500, 150, '+', 'positive', 19)}
  <line x1="198" y1="150" x2="98" y2="150" class="u2-force-red" marker-end="url(#coulomb-example-svg-red)" />
  <line x1="522" y1="150" x2="622" y2="150" class="u2-force-red" marker-end="url(#coulomb-example-svg-red)" />
  ${forceText(112, 125, '2/1')}${forceText(608, 125, '1/2')}
  ${mathText(220, 188, 'q₁ = 50 × 10⁻⁶ C')}${mathText(500, 188, 'q₂ = 80 × 10⁻⁶ C')}
  ${mathText(112, 208, '36 N', 'u2-svg-value')}${mathText(608, 208, '36 N', 'u2-svg-value')}
`, '0 0 720 250');

const STORM_CHARGES = frame('storm-charges-svg', 'الشحنات في السحابة الرعدية والأرض', 'شحنات موجبة أعلى السحب وسالبة أسفلها، وشحنات موجبة على سطح الأرض. برق بين سحابتين وصاعقة بين السحاب والأرض. الأرقام واحد واثنان وثلاثة تربط الرسم بشروح الكتاب.', `
  <linearGradient id="storm-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dce6f3" /><stop offset="1" stop-color="#f4e6cf" /></linearGradient>
  <rect width="720" height="420" fill="url(#storm-sky)" rx="18" />
  <path d="M0 342 Q130 302 260 342 T520 338 T720 330 V420 H0Z" class="u2-storm-ground" />
  <g class="u2-cloud"><ellipse cx="250" cy="120" rx="160" ry="65" /><ellipse cx="170" cy="130" rx="95" ry="52" /><ellipse cx="340" cy="135" rx="110" ry="50" /><ellipse cx="505" cy="166" rx="135" ry="58" /><ellipse cx="560" cy="178" rx="86" ry="43" /></g>
  <path d="M330 192 300 236 326 232 294 286" class="u2-lightning-bolt" />
  <path d="M516 220 488 268 514 260 478 335" class="u2-lightning-bolt" />
  ${charge(170, 82, '+')}${charge(250, 65, '+')}${charge(330, 88, '+')}${charge(470, 126, '+')}${charge(550, 136, '+')}
  ${charge(150, 164, '−')}${charge(230, 174, '−')}${charge(310, 170, '−')}${charge(470, 198, '−')}${charge(550, 204, '−')}
  ${charge(180, 356, '+')}${charge(260, 356, '+')}${charge(340, 356, '+')}${charge(420, 356, '+')}${charge(500, 356, '+')}
  ${numbered(630, 58, '1')}${numbered(76, 262, '2')}${numbered(626, 302, '3')}
`, '0 0 720 420');

const LIGHTNING_ROD = frame('lightning-rod-svg', 'مكونات مانعة الصواعق وتوصيلها بالأرض', 'مبنى يحمل هوائياً ومانع صواعق متصلاً بسلك نحاسي ينتهي عند نقطة الاتصال بالأرضي، ثم ساق تأريض تحيط بها مادة. الأرقام من واحد إلى ستة موضحة في مفتاح الرسم.', `
  <rect x="0" y="370" width="720" height="130" class="u2-soil" />
  <path d="M0 370 Q180 348 360 370 T720 362 V390 H0Z" class="u2-grass" />
  <rect x="275" y="145" width="180" height="225" class="u2-building" />
  <path d="M275 145 365 112 455 145" class="u2-roof" />
  <g class="u2-building-windows"><rect x="300" y="175" width="30" height="35" /><rect x="350" y="175" width="30" height="35" /><rect x="400" y="175" width="30" height="35" /><rect x="300" y="235" width="30" height="35" /><rect x="350" y="235" width="30" height="35" /><rect x="400" y="235" width="30" height="35" /><rect x="300" y="295" width="30" height="35" /><rect x="350" y="295" width="30" height="35" /><rect x="400" y="295" width="30" height="35" /></g>
  <line x1="330" y1="130" x2="330" y2="72" class="u2-antenna" /><line x1="315" y1="82" x2="345" y2="82" class="u2-antenna" />
  <line x1="405" y1="126" x2="405" y2="58" class="u2-copper" />
  <path d="M505 20 462 70 486 67 423 119" class="u2-lightning-bolt" />
  <path d="M405 126 V366 Q405 386 425 386 H480 V462" class="u2-copper" />
  <rect x="456" y="396" width="48" height="78" rx="8" class="u2-ground-material" />
  <line x1="480" y1="386" x2="480" y2="468" class="u2-ground-rod" />
  <circle cx="480" cy="386" r="7" class="u2-ground-contact" />
  ${numbered(330, 52, '1')}${numbered(405, 38, '2')}${numbered(405, 260, '3')}${numbered(516, 382, '4')}${numbered(532, 440, '5')}${numbered(450, 462, '6')}
`, '0 0 720 500');

const THREE_CHARGES = frame('three-charges-svg', 'ثلاث شحنات على مستقيم واحد', 'الشحنة q1 عند A وq2 عند B وq3 عند C. المسافة AB تساوي 20 سنتيمتراً وBC تساوي 40 سنتيمتراً، والنسبة بين القطعتين في الرسم واحد إلى اثنين.', `
  ${dimension('three-charges-svg', 100, 300, 58, 'AB = 20 cm', 142)}
  ${dimension('three-charges-svg', 300, 700, 58, 'BC = 40 cm', 142)}
  <line x1="60" y1="160" x2="730" y2="160" class="u2-charge-line" />
  ${charge(100, 160, '+', 'positive', 14)}${charge(300, 160, '+', 'positive', 14)}${charge(700, 160, '−', 'negative', 14)}
  ${mathText(100, 132, 'A')}${mathText(300, 132, 'B')}${mathText(700, 132, 'C')}
  ${mathText(100, 202, 'q₁ = 5 μc')}${mathText(300, 202, 'q₂ = 6 μc')}${mathText(700, 202, 'q₃ = −8 μc')}
`, '0 0 760 240');

export const UNIT2_DIAGRAMS = Object.freeze({
  'electroscope-parts': { page: 74, title: 'أجزاء الكاشف كما في شكل الكتاب', description: 'التسميات الظاهرة في صورة الجهاز ص 74، مع إبراز الوريقتين داخل الإناء الزجاجي.', svg: ELECTROSCOPE_PARTS },
  'electroscope-states': { page: 74, title: 'مبدأ العمل: معتدل ومشحون', description: 'الشكلان المرفقان بمبدأ العمل في الكتاب ص 74؛ الانطباق يدل على جسم غير مشحون والانفراج يدل على جسم مشحون.', svg: ELECTROSCOPE_STATES },
  'coulomb-pair': { page: 80, title: 'عناصر قوة كولوم: التنافر والتجاذب', description: 'إعادة رسم للشكلين (a) و(b) ص 80. الأسهم متساوية ومتعاكسة في كل زوج، والحامل هو المستقيم المار بالشحنتين.', svg: COULOMB_PAIR },
  'coulomb-example': { page: 81, title: 'تمثيل القوتين في التطبيق المحلول', description: 'شحنتان موجبتان تتنافران؛ سهما القوتين متساويان في الطول لأنهما متساويتان في الشدة، والرسم تخطيطي لا مقياس رسم.', svg: COULOMB_EXAMPLE },
  'storm-charges': { page: 82, title: 'البرق داخل السحب والصاعقة نحو الأرض', description: 'إعادة رسم تخطيطية لشكل ص 82. استخدم الأرقام 1 و2 و3 لمطابقة مواضع الرسم مع الشروح الثلاثة أسفله.', svg: STORM_CHARGES },
  'lightning-rod': { page: 82, title: 'مانعة الصواعق ومسار التفريغ إلى الأرض', description: 'إعادة رسم تخطيطية لشكل «إضاءة» ص 82 مع مفتاح لجميع التسميات الصغيرة الست.', svg: LIGHTNING_ROD, legend: ['الهوائي', 'مانع الصواعق', 'سلك نحاسي', 'نقطة الاتصال بالأرضي', 'مادة محيطة بساق التأريض', 'ساق التأريض'] },
  'three-charges': { page: 86, title: 'توضع الشحنات والمسافتان في المسألة الثالثة', description: 'الشكل الأصلي قبل الحل: A ثم B ثم C على مستقيم واحد، مع الحفاظ على نسبة AB إلى BC مقدارها 1:2.', svg: THREE_CHARGES },
});
