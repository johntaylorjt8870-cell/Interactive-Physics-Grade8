const defs = (id) => `<defs><marker id="${id}-i" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#2a7a5a"/></marker><marker id="${id}-e" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#c95348"/></marker></defs>`;
const frame = (id, t, d, body) => `<svg viewBox="0 0 720 360" role="img" aria-labelledby="${id}-title ${id}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${id}-title">${t}</title><desc id="${id}-desc">${d}</desc>${defs(id)}${body}</svg>`;
const txt = (x, y, s, cls = 'u2-label') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="middle" direction="ltr">${s}</text>`;

export const UNIT2L2_DIAGRAMS = Object.freeze({
  'current-direction': {
    title: 'جهة التيار وحركة الإلكترونات',
    platformNote: 'إعادة بناء تخطيطية من المنصة لشكل الكتاب ص89: اصطلاح أمبير — التيار خارج المولّد من الموجب إلى السالب، والإلكترونات بالعكس. Educational simplified model.',
    description: 'دارة مغلقة بمولّد ومصباح ومفتاح. أسهم خضراء لجهة التيار الاصطلاحية وأسهم حمراء لحركة الإلكترونات.',
    svg: frame('current-direction', 'جهة التيار والإلكترونات', 'تيار اصطلاحي من الموجب إلى السالب خارج المولد، وإلكترونات بالعكس.', `
      <rect x="300" y="40" width="120" height="48" rx="8" class="u2-cell"/>${txt(360, 70, '+  −')}
      ${txt(360, 28, 'مولّد')}
      <circle cx="120" cy="200" r="36" class="u2-bulb"/>${txt(120, 206, 'مصباح')}
      <rect x="520" y="180" width="70" height="28" rx="4" fill="#ddd" stroke="#555"/>${txt(555, 199, 'مفتاح')}
      <path class="u2-wire" d="M300 64 H120 V164"/><path class="u2-wire" d="M120 236 V300 H590 V208"/>
      <path class="u2-wire" d="M420 64 H590 V180"/>
      <path class="u2-arrow-i" marker-end="url(#current-direction-i)" d="M200 64 L250 64"/>
      <path class="u2-arrow-e" marker-end="url(#current-direction-e)" d="M250 300 L200 300"/>
      ${txt(225, 52, 'I')} ${txt(225, 330, 'e')}
    `),
    legend: [{ color: 'teal', symbol: 'جهة التيار الاصطلاحية (+ → − خارج المولّد)' }, { color: 'coral', symbol: 'حركة الإلكترونات (− → + خارج المولّد)' }],
  },
  'qt-graph': {
    title: 'الخط البياني لكمية الكهرباء بدلالة الزمن',
    platformNote: 'إعادة بناء لشبكة الكتاب ص90 بنقاط (5,20) (10,40) (15,60) (20,80) (25,100). الخط المستقيم يعني q/t ثابتة.',
    description: 'نقاط على خط مستقيم صاعد: كمية الكهرباء تتناسب طرداً مع الزمن عند تيار متواصل ثابت.',
    svg: frame('qt-graph', 'q versus t', 'نقاط منتظمة على خط مستقيم من (5,20) إلى (25,100).', `
      <line class="u2-axis" x1="80" y1="300" x2="680" y2="300"/><line class="u2-axis" x1="80" y1="300" x2="80" y2="40"/>
      ${[0,1,2,3,4,5,6].map((i)=>`<line class="u2-grid" x1="${80+i*80}" y1="300" x2="${80+i*80}" y2="50"/>`).join('')}
      ${[0,1,2,3,4,5,6].map((i)=>`<line class="u2-grid" x1="80" y1="${300-i*40}" x2="640" y2="${300-i*40}"/>`).join('')}
      ${txt(40, 50, 'q (C)')}${txt(680, 320, 't (s)')}
      <polyline fill="none" stroke="#33568f" stroke-width="3" points="160,260 240,220 320,180 400,140 480,100"/>
      ${[[160,260],[240,220],[320,180],[400,140],[480,100]].map(([x,y])=>`<circle class="u2-plot" cx="${x}" cy="${y}" r="6"/>`).join('')}
    `),
    legend: [{ color: 'blue', symbol: 'نقاط الكتاب: تيار ثابت 4 A' }],
  },
  'series-circuit': {
    title: 'دارة على التسلسل',
    platformNote: 'تخطيط من المنصة لشكل الكتاب ص92: مصباحان ومقياسا أمبير والتيار 200 mA في الجزأين. Educational simplified model.',
    description: 'مسار واحد: التيار نفسه 200 mA عند A1 و A2.',
    svg: frame('series-circuit', 'وصل على التسلسل', 'مسار واحد يمر فيه التيار نفسه في كل الأجهزة.', `
      <rect x="40" y="150" width="70" height="40" class="u2-cell"/>${txt(75, 175, '+ −')}
      <circle cx="200" cy="80" r="22" class="u2-ammeter"/>${txt(200, 85, 'A1')}
      <circle cx="360" cy="80" r="28" class="u2-bulb"/>${txt(360, 85, 'L1')}
      <circle cx="520" cy="80" r="28" class="u2-bulb"/>${txt(520, 85, 'L2')}
      <circle cx="640" cy="170" r="22" class="u2-ammeter"/>${txt(640, 175, 'A2')}
      <path class="u2-wire" d="M110 170 H640 V102"/><path class="u2-wire" d="M640 192 V280 H75 V190"/>
      <path class="u2-wire" d="M200 102 V80"/><path class="u2-wire" d="M40 170 H75"/>
      ${txt(360, 330, 'I = 200 mA = Const')}
    `),
    legend: [{ color: 'blue', symbol: 'I ثابت في كل أجزاء الدارة المغلقة على التسلسل' }],
  },
  'parallel-circuit': {
    title: 'دارة على التفرع',
    platformNote: 'تخطيط من المنصة لشكل الكتاب ص93: فرعان بمصباحين ومقاييس. في المصدر المصباح الثاني مكتوب L1؛ الرسم يحفظ التفرع دون اختلاق قيم لم تُطبع.',
    description: 'فرعان متوازيان؛ التيار الأصلي مجموع تياري الفرعين.',
    svg: frame('parallel-circuit', 'وصل على التفرع', 'تيار المصدر ينقسم إلى فرعين ثم يلتقي.', `
      <rect x="40" y="160" width="70" height="40" class="u2-cell"/>${txt(75, 185, '+ −')}
      <circle cx="160" cy="180" r="20" class="u2-ammeter"/>${txt(160, 185, 'A')}
      <circle cx="280" cy="80" r="20" class="u2-ammeter"/>${txt(280, 85, 'A1')}
      <circle cx="440" cy="80" r="28" class="u2-bulb"/>${txt(440, 85, 'L1')}
      <circle cx="280" cy="280" r="20" class="u2-ammeter"/>${txt(280, 285, 'A2')}
      <circle cx="440" cy="280" r="28" class="u2-bulb"/>${txt(440, 285, 'L1')}
      <path class="u2-wire" d="M110 180 H160"/><path class="u2-wire" d="M180 180 H220 V80 H500 V180 H220 V280 H500 V180"/>
      ${txt(560, 180, 'I = I1 + I2')}
    `),
    legend: [{ color: 'teal', symbol: 'التيار الأصلي = مجموع تياري الفرعين' }],
  },
});
