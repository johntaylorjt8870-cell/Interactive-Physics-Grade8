import { calculation, formula, solutionSteps, tex } from './math.js';

const book = (html) => ({ type: 'book', html });
const diagram = (id) => ({ type: 'diagram', id });
const simulation = (id) => ({ type: 'simulation', id });
const platform = (title, html) => ({ type: 'platform', title, html });
const tag = (label = 'من الكتاب') => `<span class="u2-tag u2-tag-book">${label}</span>`;
const card = (title, body, className = '', badge = 'من الكتاب') => `<section class="u2-card ${className}"><div class="u2-card-heading"><h3>${title}</h3>${tag(badge)}</div>${body}</section>`;
const practiceSlot = (id) => `<div class="u2-practice-slot" data-u2-practice="${id}"></div>`;
const q = (source, label) => tex(source, label);
const COULOMB = 'F=K\\frac{q_{1}\\cdot q_{2}}{d^{2}}';
const COULOMB_LABEL = 'F equals K q1 q2 over d squared';

export const UNIT2_PAGES = [
  {
    page: 73,
    id: 'introduction',
    navLabel: 'التمهيد والأهداف',
    heading: 'الكهرباء الساكنة',
    summary: 'أهداف الدرس وكلماته المفتاحية ومشهد البرق الافتتاحي.',
    blocks: [
      book(`<section class="u2-lesson-hero">
        <div class="u2-hero-copy"><span class="u2-lesson-number" aria-hidden="true">1</span><p class="u2-kicker">الدرس الأول</p><h3>الكهرباء الساكنة</h3></div>
        <span class="u2-hero-charge" aria-hidden="true">±</span>
      </section>
      ${card('الأهداف', `<ul class="u2-objectives"><li>يتعرّف الكهرباء الساكنة.</li><li>يتعرّف الشحنات الكهربائية.</li><li>يميّز بين الأجسام المشحونة والأجسام غير المشحونة.</li><li>يفسّر طرائق التكهرب.</li><li>يفسّر قوى التنافر والتجاذب بين الشحنات.</li><li>يتعرّف قانون كولوم.</li></ul>`, 'u2-goals-card')}
      ${card('الكلمات المفتاحية', `<ul class="u2-keywords" aria-label="الكلمات المفتاحية"><li>الكهرباء الساكنة</li><li>التكهرب</li><li>قوى التنافر</li><li>قوى التجاذب</li><li>قانون كولوم</li></ul>`, 'u2-keywords-card')}
      <figure class="u2-source-photo u2-lightning-photo"><img src="./src/assets/unit2-lesson1/lightning.jpg" width="642" height="344" alt="صورة البرق الافتتاحية في الكتاب" loading="eager" /><figcaption>الصورة الافتتاحية في الكتاب · ص 73</figcaption></figure>`),
    ],
  },
  {
    page: 74,
    id: 'electroscope',
    navLabel: 'الكاشف الكهربائي',
    heading: 'الكاشف الكهربائي',
    summary: 'وظيفة الكاشف وأجزاؤه ومبدأ عمله في الحالتين المعتدلة والمشحونة.',
    blocks: [
      book(`<section class="u2-card"><p>يُعتبر البرق والصاعقة من أهم المظاهر الناتجة عن الكهرباء الساكنة، هل سألت نفسك يوماً ما سبب حدوث هذه الظواهر الطبيعية؟</p></section>
      ${card('الكاشف الكهربائي', `<p>الجهاز في الشكل المجاور يدل على الكاشف الكهربائي، أمعن النظر في الشكل وأجب عن الأسئلة الآتية:</p><ol class="u2-source-list"><li>لماذا أستخدم الكاشف الكهربائي؟</li><li>أعدد أجزاء الكاشف؟</li><li>أتعرف مبدأ عمله؟</li></ol>`)}`),
      diagram('electroscope-parts'),
      book(card('أستنتج', `<p class="u2-definition"><strong>الكاشف الكهربائي:</strong> جهاز يُستخدم لمعرفة إذا كان الجسم مشحوناً أم لا، ويُستخدم لمعرفة نوع شحنة الجسم.</p><p>تُصنع أجزاء الكاشف من مواد ناقلة للتيار الكهربائي، ويتكون من:</p><ol class="u2-source-list u2-parts-list"><li>قرص ناقل.</li><li>ساق ناقلة.</li><li>وريقتين ناقلتين خفيفتين.</li><li>وعاء زجاجي عازل.</li></ol><div class="u2-principle"><h4>مبدأ عمل هذا الجهاز</h4><p>نقرب الجسم المراد معرفة فيما إذا كان مشحوناً أو لا من قرص الكاشف، فإذا انفرجت الوريقتان (ابتعدتا عن بعضهما بعضاً) كان الجسم مشحوناً، وإذا بقيتا منطبقتين كان الجسم غير مشحون، كما في الشكل المجاور.</p></div>`, 'u2-conclusion')),
      diagram('electroscope-states'),
      simulation('electroscope-lab'),
    ],
  },
  {
    page: 75,
    id: 'rubbing',
    navLabel: 'التكهرب بالدلك',
    heading: 'التكهرب: أجرب وأستنتج',
    summary: 'مقارنة أثر ساق البلاستيك قبل الدلك وبعده على الكاشف وقصاصات الورق.',
    blocks: [
      book(card('أجرب وأستنتج', `<div class="u2-tools"><strong>أدوات التجربة:</strong> حقيبة الكهرباء الساكنة.</div><p class="u2-safety">(في كل تجارب الكهرباء الساكنة تُستخدم الأدوات بالحالة الجافة).</p><h4>خطوات التنفيذ</h4><ol class="u2-source-list u2-experiment-steps"><li>أقرب ساق البلاستيك من قرص الكاشف الكهربائي، ماذا ألاحظ؟</li><li>أقرب طرف ساق البلاستيك من قصاصات الورق، ماذا ألاحظ؟</li><li>أدلك طرف ساق البلاستيك بقطعة الصوف، ثم أقربه من قرص الكاشف الكهربائي، ماذا ألاحظ؟</li><li>أقرب طرف الساق المدلوك من قصاصات الورق، ماذا ألاحظ؟</li></ol>`)),
      simulation('rubbing-lab'),
    ],
  },
  {
    page: 76,
    id: 'charge',
    navLabel: 'الشحنة وكمّها',
    heading: 'التكهرب وشحنة الإلكترون',
    summary: 'انتقال الإلكترونات، علاقة الشحنة بعددها، تطبيق محلول ونشاط عددي.',
    blocks: [
      book(card('أستنتج', `<ul class="u2-source-list u2-conclusion-list"><li>تكتسب المواد العازلة خاصية جذب الأجسام الخفيفة عند دلك بعضها ببعض.</li><li>عند دلك مادتين مختلفتين ببعضهما البعض، ينتقل عدد من الإلكترونات، من إحداها إلى الأخرى، فالمادة التي تفقد إلكترونات تكتسب شحنة موجبة، بينما المادة التي تكتسب إلكترونات تصبح سالبة الشحنة، وهذا ما يُسمّى بالتكهرب.</li></ul><div class="u2-charge-rules"><p>فإذا فقدت المادة إلكتروناً فقط تصبح شحنتها: ${formula('q=+e^{-}', 'q equals plus e with the printed superscript minus')}</p><p>وإذا فقدت المادة إلكترونين تصبح شحنتها: ${formula('q=+2e^{-}', 'q equals plus 2e with the printed superscript minus')}</p><p>وإذا فقدت المادة ${q('n', 'n')} إلكترون تصبح شحنتها: ${formula('q=+ne', 'q equals plus n e')}</p><p>وبالمثل، إذا اكتسبت المادة ${q('n', 'n')} إلكترون: ${formula('q=-ne', 'q equals minus n e')}</p></div><ul class="u2-source-list u2-conclusion-list"><li>تتوضع الشحنات الكهربائية وتبقى ساكنة على الطرف المدلوك من المادة العازلة.</li><li>تبقى الشحنات ساكنة على الطرف المدلوك للمادة العازلة.</li></ul>`, 'u2-conclusion')),
      platform('توضيح اصطلاحي حول رمز e', '<p>نحافظ في المعادلات أعلاه على العلامة المرتفعة الظاهرة بجانب <bdi dir="ltr">e</bdi> في أول سطرين من صورة الكتاب. وفي التطبيق والنشاط أدناه نستخدم <bdi dir="ltr">e = 1.6×10⁻¹⁹ C</bdi> مقداراً موجباً كما ورد؛ أما إشارة شحنة الجسم فتتحدد من فقد الإلكترونات أو اكتسابها.</p>'),
      book(`<section class="u2-card u2-worked-card"><div class="u2-card-heading"><h3>تطبيق محلول</h3>${tag('مثال الكتاب المحلول')}</div><div class="u2-problem-statement"><p>دُلك جسم عازل فاكتسب شحنة موجبة قدرها ${q('q=+8\\times10^{-7}\\,\\mathrm{C}', 'q equals plus 8 times 10 to the minus 7 coulombs')}، فإذا علمت أن شحنة الإلكترون ${q('e=1.6\\times10^{-19}\\,\\mathrm{C}', 'e equals 1.6 times 10 to the minus 19 coulombs')}، <strong>المطلوب:</strong> احسب عدد الإلكترونات التي فقدها الجسم.</p></div><div class="u2-worked-solution"><h4>الحل</h4>${solutionSteps([
        { kind: 'law', label: 'العلاقة', html: formula('q=ne', 'q equals n e') },
        { kind: 'note', label: 'المعنى', html: '<p>شحنة الإلكترون × عدد الإلكترونات = الشحنة الكلية.</p>' },
        { kind: 'rearrange', label: 'إعادة الترتيب', html: formula('n=\\frac{q}{e}', 'n equals q over e') },
        { kind: 'substitute', label: 'التعويض والنتيجة', html: calculation('n=\\frac{8\\times10^{-7}}{1.6\\times10^{-19}}=5\\times10^{12}', 'n equals 8 times 10 to minus 7 over 1.6 times 10 to minus 19 equals 5 times 10 to 12') },
      ])}<p class="u2-final-answer">عدد الإلكترونات: ${q('n=5\\times10^{+12}', 'n equals 5 times 10 to the 12')}.</p></div></section>`),
      book(card('نشاط', `<p>احسب الشحنة التي يكتسبها جسم معتدل إذا فقد ${q('n=20\\times10^{+10}', 'n equals 20 times 10 to the 10')} إلكتروناً.</p><p>(${q('e=1.6\\times10^{-19}\\,\\mathrm{C}', 'e equals 1.6 times 10 to the minus 19 coulombs')})</p>${practiceSlot('charge-activity')}`, 'u2-activity-card')),
    ],
  },
  {
    page: 77,
    id: 'interactions',
    navLabel: 'تجاذب وتنافر الشحنات',
    heading: 'الأفعال المتبادلة بين الشحنات الكهربائية',
    summary: 'تجربة الكرة المعلقة والساق البلاستيكية والزجاجية، ثم قاعدتا التجاذب والتنافر.',
    blocks: [
      book(card('أجرب وأستنتج', `<div class="u2-tools"><strong>أدوات التجربة:</strong> كرة بلاستيكية – قطع صوف – ساق من الزجاج – ساق من البلاستيك – قطعة حرير.</div><h4>خطوات التنفيذ</h4><ol class="u2-source-list u2-experiment-steps"><li>أعلق الكرة البلاستيكية على حامل معزول.</li><li>أدلك الكرة البلاستيكية بقطعة الصوف.</li><li>أدلك ساق البلاستيك بقطعة أخرى من الصوف.</li><li>أقرب الطرف المدلوك للساق البلاستيكية من الكرة المدلوكة، ماذا ألاحظ؟</li><li>أدلك الساق الزجاجية بقطعة الحرير وأقربها من كرة البلاستيك المدلوكة بالصوف، ماذا ألاحظ؟</li></ol>`)),
      simulation('interaction-lab'),
      book(card('أستنتج', `<ul class="u2-source-list u2-conclusion-list"><li>الشحنات الكهربائية نوعان: سالبة (−) وموجبة (+).</li><li>الأفعال المتبادلة بين الشحنات الكهربائية الساكنة: تجاذب أو تنافر.</li><li>الشحنات الكهربائية المتماثلة تتنافر.</li><li>الشحنات الكهربائية المختلفة تتجاذب.</li></ul>`, 'u2-conclusion')),
    ],
  },
  {
    page: 78,
    id: 'contact',
    navLabel: 'التكهرب باللمس',
    heading: 'بعض طرق التكهرب: باللمس',
    summary: 'نقل الشحنة بالتماس بين الساق والكرة ثم الكشف عن بقائها بالكاشف.',
    blocks: [
      book(card('1 — التكهرب باللمس', `<h4>أجرب وأستنتج</h4><div class="u2-tools"><strong>أدوات التجربة:</strong> ساق بلاستيكية - كاشف كهربائي - كرة معدنية محمولة على عازل - قطعة صوف.</div><h4>خطوات العمل</h4><ol class="u2-source-list u2-experiment-steps"><li>أجعل الكرة تلامس قرص الكاشف، باستخدام سلك ناقل، ماذا ألاحظ؟</li><li>أدلك أحد طرفي ساق البلاستيك بقطعة صوف، ثم أجعله يلامس الكرة (باستخدام سلك معدني)، ماذا ألاحظ؟</li><li>أبعد الساق البلاستيكية عن الكرة.</li><li>أعيد من جديد ملامسة الكرة لقرص الكاشف، باستخدام سلك ناقل، ماذا ألاحظ؟</li></ol>`)),
      simulation('contact-lab'),
      book(card('أستنتج', `<ul class="u2-source-list u2-conclusion-list"><li>يتكهرب الجسم غير المشحون عندما يلامسه جسم مشحون كهربائياً، نتيجة انتقال بعض الشحنات الكهربائية بينهما.</li><li>التكهرب باللمس يُكسب غير المشحون شحنة مماثلة بالنوع لشحنة الجسم المشحون.</li></ul>`, 'u2-conclusion')),
    ],
  },
  {
    page: 79,
    id: 'induction',
    navLabel: 'التكهرب بالتأثير',
    heading: 'بعض طرق التكهرب: بالتأثير',
    summary: 'إعادة توزع الشحنات في الناقل دون ملامسة المؤثر، ثم الشحن بالتأثير.',
    blocks: [
      book(card('2 — التكهرب بالتأثير', `<h4>أجرب وأستنتج</h4><div class="u2-tools"><strong>أدوات التجربة:</strong> كاشف كهربائي - ساق بلاستيكية - قطعة صوف - كرة معدنية محمولة على عازل.</div><h4>خطوات العمل</h4><ol class="u2-source-list u2-experiment-steps"><li>أدلك أحد طرفي ساق البلاستيك بقطعة الصوف، ثم أقربه من قرص الكاشف دون ملامسته، ماذا ألاحظ؟</li><li>أبعد الساق البلاستيكية عن قرص الكاشف، ماذا ألاحظ؟</li><li>أقرب أحد طرفي الساق البلاستيكية المشحونة من قرص الكاشف دون ملامسته، وألمس قرص الكاشف بطرف الإصبع، ثم أبعد الإصبع والساق معاً، ماذا ألاحظ؟</li></ol>`)),
      simulation('induction-lab'),
      book(card('أستنتج', `<ul class="u2-source-list u2-conclusion-list"><li>يتكهرب الجسم الناقل غير المشحون عندما يجاوره جسم مشحون كهربائياً، نتيجة إعادة توزع الشحنات الكهربائية داخل الجسم الناقل.</li><li>تتجمع الشحنات الكهربائية المخالفة بالنوع في الطرف القريب من الجسم المشحون المؤثر، بينما الشحنات المماثلة بالنوع تتجمع في الطرف البعيد عنه.</li></ul>`, 'u2-conclusion')),
    ],
  },
  {
    page: 80,
    id: 'coulomb-law',
    navLabel: 'قانون كولوم',
    heading: 'قانون كولوم وعناصر قوته',
    summary: 'نشاط شحن الكاشف موجباً، ثم قانون كولوم وعناصر القوة ورسما التنافر والتجاذب.',
    blocks: [
      book(card('نشاط', `<p>كيف يمكن شحن الكاشف الكهربائي بشحنة موجبة؟</p>${practiceSlot('positive-electroscope')}`, 'u2-activity-card')),
      book(`${card('قانون كولوم', `<p>درس كولوم العوامل التي تؤثر على شدة القوة المتبادلة بين شحنتين نقطيتين، فإذا كان لدينا شحنتان كهربائيتان نقطيتان (${q('q_{1}', 'q1')}) و(${q('q_{2}', 'q2')})، تبعدان عن بعضهما مسافة (${q('d', 'd')})، يفصل بينهما الخلاء، فإن القوة المتبادلة بينهما (${q('F', 'F')})، والتي يمكن أن تكون قوة دفع أو قوة جذب، وُجد أنها:</p><ul class="u2-source-list"><li>تتناسب طرداً مع كل من الشحنتين ${q('q_{1}', 'q1')}، ${q('q_{2}', 'q2')}.</li><li>تتناسب عكساً مع مربع البعد بينهما ${q('d^{2}', 'd squared')}.</li></ul><p>وتوصل إلى العلاقة الآتية وتسمى <strong>بقانون كولوم</strong>:</p>${formula(COULOMB, COULOMB_LABEL)}<p>حيث ${q('k', 'k')}: ثابت التناسب ويسمى ثابت كولوم، يتعلق بالوحدات المستعملة وبالوسط العازل الفاصل بين الشحنتين، قيمته:</p>${formula('k=9\\times10^{9}\\,\\mathrm{N\\cdot m^{2}\\cdot C^{-2}}', 'k equals 9 times 10 to the 9 newton metre squared per coulomb squared')}`)}
      <aside class="u2-scientist-card"><img src="./src/assets/unit2-lesson1/coulomb.jpg" width="202" height="272" alt="شارل أوغستان دي كولوم" loading="lazy" /><div><span class="u2-tag u2-tag-book">من هامش الكتاب · ص 80</span><h3>شارل أوغستان دي كولوم <bdi dir="ltr">(1736–1806)</bdi></h3><p>هو فيزيائي فرنسي اكتشف القانون الذي يحمل اسمه (قانون كولوم) والمتعلق بالقوى الفاعلة بين الجسيمات المشحونة، كما سميت وحدة قياس الشحنة الكهربائية باسمه (كولوم).</p></div></aside>`),
      book(card('عناصر قوة كولوم', `<ol class="u2-force-elements"><li><strong>نقطة التأثير:</strong> الشحنة المتأثرة.</li><li><strong>الحامل:</strong> المستقيم المار من الشحنتين.</li><li><strong>الجهة:</strong> تجاذبية إذا كانت الشحنتان مختلفتين نوعاً، وتنافرية إذا كانت الشحنتان متماثلتين نوعاً.</li><li><strong>الشدة:</strong> تعطى بالعلاقة ${q(COULOMB, COULOMB_LABEL)}.</li></ol>`)),
      diagram('coulomb-pair'),
    ],
  },
  {
    page: 81,
    id: 'coulomb-example',
    navLabel: 'تطبيق قانون كولوم',
    heading: 'تطبيق محلول: قانون كولوم',
    summary: 'حساب القوة بين شحنتين وتمثيلها بالرسم، ثم مدخل التفريغ الكهربائي.',
    blocks: [
      book(`<section class="u2-card u2-worked-card"><div class="u2-card-heading"><h3>تطبيق محلول</h3>${tag('مثال الكتاب المحلول')}</div><div class="u2-problem-statement"><p>شحنتان نقطيتان ساكنتان (${q('q_{1}=50\\times10^{-6}\\,\\mathrm{C}', 'q1 equals 50 microcoulombs')}) و(${q('q_{2}=80\\times10^{-6}\\,\\mathrm{C}', 'q2 equals 80 microcoulombs')})، تبعدان عن بعضهما في الخلاء (${q('d=1\\,\\mathrm{m}', 'd equals 1 metre')})، علماً أن (${q('k=9\\times10^{9}\\,\\mathrm{N\\cdot m^{2}\\cdot C^{-2}}', 'k equals 9 times 10 to the 9 in SI units')}).</p><p><strong>والمطلوب:</strong> حساب شدة القوة الكهربائية المتبادلة بينهما موضحاً ذلك بالرسم؟</p></div><div class="u2-worked-solution"><h4>الحل</h4><div class="u2-givens-grid"><section><h5>المعطيات</h5><p>${q('q_{1}=50\\times10^{-6}\\,\\mathrm{C}', 'q1')}<br />${q('q_{2}=80\\times10^{-6}\\,\\mathrm{C}', 'q2')}<br />${q('d=1\\,\\mathrm{m}', 'd')}</p></section><section><h5>المجاهيل</h5><p>${q('F=F_{1/2}=F_{2/1}=?', 'F equals F1 over 2 equals F2 over 1, unknown')}</p><h5>تمثيل القوتين بالرسم</h5></section></div>${solutionSteps([
        { kind: 'law', label: 'القانون', html: formula(COULOMB, COULOMB_LABEL) },
        { kind: 'substitute', label: 'التعويض والنتيجة', html: calculation('F=9\\times10^{9}\\frac{(50\\times10^{-6})\\times(80\\times10^{-6})}{1^{2}}=36\\,\\mathrm{N}', 'F equals 9 times 10 to the 9 times 50 times 10 to minus 6 times 80 times 10 to minus 6 over 1 squared equals 36 newtons') },
      ])}</div></section>`),
      diagram('coulomb-example'),
      simulation('coulomb-lab'),
      book(card('التفريغ الكهربائي: ظاهرتا البرق والصاعقة', `<p>تُعد ظاهرة البرق من أكثر الظواهر الطبيعية إثارة، وتُعتبر من أهم الأمثلة التي توضح حادثة التفريغ الكهربائي.</p><p>انظر إلى الشكل التالي الذي يوضح كيفية تشكل ظاهرتي البرق والصاعقة.</p>`, 'u2-discharge-intro')),
    ],
  },
  {
    page: 82,
    id: 'discharge',
    navLabel: 'البرق والصاعقة',
    heading: 'التفريغ الكهربائي ومانعة الصواعق',
    summary: 'توزع الشحنات في السحب وعلى الأرض، ومعنى البرق والصاعقة وعمل مانعة الصواعق.',
    blocks: [
      diagram('storm-charges'),
      book(`<section class="u2-card"><ol class="u2-source-list u2-storm-notes"><li>خلال عاصفة رعدية، يرتفع الهواء مصحوباً بقطرات ماء وجليد داخل السحابة الرعدية، تكوّن نتيجة لذلك شحنات سالبة أسفل السحابة، وشحنات موجبة أعلاها.</li><li>جزءاً تكون شحنات مخالفة في مناطق مختلفة من السحب، قد يحدث البرق داخل هذه السحب.</li><li>تحثّ الشحنة السالبة الموجودة في أسفل السحابة شحنة موجبة على سطح الأرض ينتج من الاختلاف الكبير بين الشحنتين تفريغ كهربائي سريع يُسمّى البرق أو الصاعقة.</li></ol></section>
      ${card('أستنتج', `<ul class="u2-source-list u2-conclusion-list"><li>تنتج ظاهرة البرق عن التفريغ الكهربائي بين سحابتين مشحونتين.</li><li>إذا تم تفريغ الشحنة الكهربائية للسحب مع سطح الأرض سميت الظاهرة بالصاعقة.</li></ul>`, 'u2-conclusion')}`),
      diagram('lightning-rod'),
      book(`<section class="u2-card u2-light-card"><div class="u2-card-heading"><h3>إضاءة</h3>${tag('من الكتاب · ص 82')}</div><p>هل تعمل مانعة الصواعق على منع الصواعق من الحدوث، أم تقلل من الصواعق، أم أن لها عملاً آخر؟</p><details class="u2-book-details"><summary>اقرأ إجابة «إضاءة» بعد محاولتك</summary><p>مانعة الصواعق سلك مدبب من الطرفين، يوضع في أعلى المباني، ويصل إلى الأرض فتتفرغ الشحنات الكبيرة عبر السلك إلى الأرض، وبالتالي تُجنّب الأبنية التصدع والأضرار التي يمكن أن تلحق بها.</p></details></section>`),
    ],
  },
  {
    page: 83,
    id: 'summary',
    navLabel: 'هل تعلم؟ وتعلمت',
    heading: 'هل تعلم؟ وتعلمت',
    summary: 'بنجامين فرانكلين وملخص الأفكار والقوانين التي وردت في الدرس.',
    blocks: [
      book(`<aside class="u2-scientist-card u2-franklin-card"><img src="./src/assets/unit2-lesson1/franklin.jpg" width="218" height="214" alt="بنجامين فرانكلين" loading="lazy" /><div><span class="u2-tag u2-tag-book">هل تعلم؟ · ص 83</span><h3>بنجامين فرانكلين <bdi dir="ltr">(1706–1790)</bdi></h3><p>عالم فيزياء أمريكي، له إسهامات علمية رائدة في مجال الفيزياء، اخترع أول مانعة صواعق، وعداد المسافة، وهو أول من ابتكر كلمة <bdi dir="ltr">Electricity</bdi>.</p></div></aside>`),
      book(card('تعلمت', `<ul class="u2-source-list u2-summary-list"><li><strong>الكاشف الكهربائي:</strong> جهاز يستخدم لمعرفة إذا كان الجسم مشحوناً أم لا، تُصنع أجزاء الكاشف من مواد ناقلة للتيار الكهربائي.</li><li>تكتسب المواد العازلة خاصية جذب الأجسام الخفيفة عند دلكها ببعضها بعضاً.</li><li>الشحنات الكهربائية نوعان: سالبة (−) وموجبة (+).</li><li>التكهرب باللمس يُكسب الجسم غير المشحون شحنة مماثلة بالنوع لشحنة الجسم المشحون، نتيجة انتقال بعض الشحنات من الجسم المشحون إلى الجسم المعتدل.</li><li>يتكهرب الجسم الناقل غير المشحون بالتأثير عندما يجاوره جسم مشحون كهربائياً، نتيجة إعادة توزيع الشحنات الكهربائية داخل الجسم الناقل.</li><li>قانون كولوم ${q(COULOMB, COULOMB_LABEL)}.</li></ul>`, 'u2-summary-card')),
      platform('قبل الانتقال إلى «أختبر نفسي»', '<p>راجع الأفكار الست في «تعلمت»، ثم انتقل إلى أسئلة الكتاب. يمكنك العودة إلى أي تجربة من شريط المراحل؛ تبقى مدخلاتك محفوظة ما دمت في صفحة الدرس نفسها.</p>'),
    ],
  },
  {
    page: 84,
    id: 'self-check-concepts',
    navLabel: 'أختبر نفسي: المفاهيم',
    heading: 'أختبر نفسي: الأسئلة 1–3',
    summary: 'الفراغات، الصح والغلط مع التصحيح، وسؤال تكهرب الناقل بالدلك.',
    blocks: [
      book(`<section class="u2-card u2-selfcheck-card"><div class="u2-card-heading"><h3>أختبر نفسي</h3>${tag('أسئلة الكتاب · ص 84')}</div>
      <section class="u2-question-group" data-question-group="fill"><h4>السؤال الأول</h4><p>املأ الفراغات الآتية بالكلمات المناسبة:</p><ol class="u2-source-list u2-fill-list"><li data-fill-item="1">تتجاذب الشحنات الكهربائية إذا كانت من نوعين <span class="u2-blank">..........</span></li><li data-fill-item="2">الأفعال المتبادلة بين الشحنات الكهربائية المتماثلة بالنوع، تكون على شكل قوى <span class="u2-blank">..........</span></li><li data-fill-item="3">عند ملامسة جسم مشحون لجسم ثانٍ معتدل، يتكهرب الجسم الثاني بشحنة <span class="u2-blank">..........</span> بالنوع.</li><li data-fill-item="4">عند تقريب جسم مشحون لجسم ناقل معتدل، يتكهرب الجسم الناقل بطريقة <span class="u2-blank">..........</span></li><li data-fill-item="5">تنافر ورقتي الكاشف الكهربائي يدلّ على اكتساب كل منهما <span class="u2-blank">..........</span> كهربائية متماثلة.</li></ol>${practiceSlot('selfcheck-fill')}</section>
      <section class="u2-question-group" data-question-group="truth"><h4>السؤال الثاني</h4><p>ضع إشارة (صح) إلى جانب العبارة الصحيحة، وإشارة (غلط) إلى جانب العبارة غير الصحيحة ثم أصححها:</p><ol class="u2-source-list u2-truth-list"><li data-truth-item="1"><p>عند ملامسة ساق بلاستيكية معتدلة لساق معدنية تحوي إلكترونات حرة، تتكهرب الساق البلاستيكية باللمس بشحنة سالبة.</p></li><li data-truth-item="2"><p>عند دلك البلاستيك بالصوف يكتسب شحنة سالبة.</p></li><li data-truth-item="3"><p>في الذرة المعتدلة تكون شحنة الإلكترونات مساوية لشحنة البروتونات بالقيمة المطلقة.</p></li><li data-truth-item="4"><p>إذا تدافع جسمان مشحونان كهربائياً مع بعضهما فتكون شحنتهما موجبة.</p></li></ol>${practiceSlot('selfcheck-truth')}</section>
      <section class="u2-question-group" data-question-group="conductor"><h4>السؤال الثالث</h4><p>هل يمكن أن يتكهرب جسم ناقل بالدلك؟ وكيف يتم ذلك، إذا كان ممكناً؟</p>${practiceSlot('selfcheck-conductor')}</section>
      </section>`),
    ],
  },
  {
    page: 85,
    id: 'self-check-problems',
    navLabel: 'المطابقة والمسائل',
    heading: 'أختبر نفسي: السؤالان 4 و5',
    summary: 'مطابقة المفاهيم، وشحنة مول من الإلكترونات، وأثر تغيير المسافة في قوة كولوم.',
    blocks: [
      book(`<section class="u2-card u2-selfcheck-card"><div class="u2-card-heading"><h3>السؤال الرابع</h3>${tag('مطابقة الكتاب · ص 85')}</div><p>صل بخط بين العبارة في العمود (${q('A', 'A')}) وما يناسبها في العمود (${q('B', 'B')}).</p><div class="u2-match-columns"><section><h4>العمود A</h4><ol class="u2-source-list u2-match-list"><li data-match-item="1">تجمع الإلكترونات على جسم ما</li><li data-match-item="2">ابتعاد الكرة البلاستيكية عن ساق بلاستيكي</li><li data-match-item="3">أصغر شحنة موجبة في الطبيعة</li><li data-match-item="4">ظهور شرارات كهربائية خفيفة</li><li data-match-item="5">جسم إلكترونات ذراته السطحية قليل وشديدة الارتباط بالنواة</li></ol></section><section><h4>العمود B</h4><ul class="u2-source-list"><li>البروتون</li><li>عازل</li><li>تدافع</li><li>تكهرب</li><li>تفريغ</li><li>موجب</li></ul></section></div>${practiceSlot('selfcheck-matching')}</section>`),
      book(`<section class="u2-card u2-selfcheck-card"><div class="u2-card-heading"><h3>السؤال الخامس: حل المسائل الآتية</h3>${tag('مسائل الكتاب · ص 85')}</div><section class="u2-question-group"><h4>المسألة الأولى</h4><p>إذا علمت أن المول هو مقدار كمية من المادة تحوي عدداً محدداً من حبات المادة يساوي ${q('6.02\\times10^{23}', '6.02 times 10 to the 23')} حبة، والمطلوب: احسب شحنة مول من الإلكترونات؟ إذا علمت أن شحنة الإلكترون تساوي ${q('e=-1.6\\times10^{-19}\\,\\mathrm{c}', 'e equals minus 1.6 times 10 to the minus 19 coulombs, printed c')}.</p>${practiceSlot('mol-charge')}</section><section class="u2-question-group"><h4>المسألة الثانية</h4><p>شحنتان نقطيتان ساكنتان تبعدان عن بعضهما مسافة (${q('d_{1}', 'd1')})، فتكون القوة المتبادلة بينهما ${q('F_{1}=0.145\\,\\mathrm{N}', 'F1 equals 0.145 newtons')}. نقربهما من بعض حتى تصبح المسافة بينهما ربع ما كانت عليه، احسب شدة القوة المتبادلة بينهما عندئذ.</p>${practiceSlot('distance-force')}</section></section>`),
    ],
  },
  {
    page: 86,
    id: 'three-charges',
    navLabel: 'المسألة الثالثة',
    heading: 'أختبر نفسي: المسألة الثالثة',
    summary: 'قوتا كولوم على شحنة أولى ومحصلتهما وجهتها، مع نشاط رسم المتجهات.',
    blocks: [
      book(`<section class="u2-card u2-selfcheck-card"><div class="u2-card-heading"><h3>المسألة الثالثة</h3>${tag('مسألة الكتاب · ص 86')}</div><p>ثلاث شحنات نقطية ساكنة <span class="u2-math-sequence" dir="ltr">(${q('q_{1}=5\\,\\mu\\mathrm{c}', 'q1 equals 5 microcoulombs, printed c')}, ${q('q_{2}=6\\,\\mu\\mathrm{c}', 'q2 equals 6 microcoulombs, printed c')}, ${q('q_{3}=-8\\,\\mu\\mathrm{c}', 'q3 equals minus 8 microcoulombs, printed c')})</span> متوضعة على المستقيم نفسه كما في الشكل، بحيث: <span class="u2-math-sequence" dir="ltr">(${q('AB=20\\,\\mathrm{cm}', 'AB equals 20 centimetres')}, ${q('BC=40\\,\\mathrm{cm}', 'BC equals 40 centimetres')})</span>.</p></section>`),
      diagram('three-charges'),
      book(`<section class="u2-card u2-selfcheck-card"><div class="u2-card-heading"><h3>المطلوب</h3>${tag('جميع الفروع بترتيب الكتاب')}</div><ol class="u2-source-list u2-required-list"><li>احسب شدة القوة المتبادلة بين (${q('q_{1}', 'q1')}) و(${q('q_{2}', 'q2')})؟</li><li>احسب شدة القوة المتبادلة بين (${q('q_{1}', 'q1')}) و(${q('q_{3}', 'q3')})؟</li><li>احسب شدة محصلة القوى التي تخضع لها الشحنة (${q('q_{1}', 'q1')})؟ وحدد جهتها؟ موضحاً ذلك بالرسم؟</li></ol>${practiceSlot('three-charge-problem')}</section>`),
    ],
  },
];

export const UNIT2_META = Object.freeze({
  unit: 'الوحدة الثانية',
  lesson: 'الدرس 1 — الكهرباء الساكنة',
  pages: '73–86',
});

export const UNIT2_SOURCE_INVENTORY = Object.freeze({
  pages: 14,
  experiments: 4,
  workedExamples: 2,
  selfCheckMainQuestions: 5,
  selfCheckLeafTasks: 20,
  sourcePhotos: 3,
  diagrams: 7,
  simulations: 6,
  practiceMounts: 9,
  matchingTables: 1,
});
