/* Answer keys, hints and model solutions for Unit 2 Lesson 3 activities.
 *
 * This module is loaded with a dynamic import ONLY after the student presses an
 * explicit button («تحقق من الإجابة» / «تلميح» / «الحل النموذجي»), exactly like
 * the Lesson 2 practice layer: no answer ships inside the initial markup, a hint
 * never reveals the key, and the model solution stays locked until an attempt
 * has been checked. Hints describe the *thinking*, solutions justify the answer.
 *
 * Every key is anchored in the textbook pages 97–106: the conclusions («أستنتج»),
 * the printed activities of p102/p103, and the self-check of p105–p106. Where
 * the platform adds its own training items, the text says so explicitly.
 */
export const UNIT2L3_ANSWERS = Object.freeze({

  /* --- p98 · observing the two water pictures and charge transfer -------- */
  'p98-observe': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'levels-1', correct: 'equal' }),
      Object.freeze({ id: 'levels-2', correct: 'a-higher' }),
      Object.freeze({ id: 'flow-2', correct: 'high-to-low' }),
      Object.freeze({ id: 'charges', correct: 'transfer' }),
    ]),
    hint: 'قارن سطحي الماء في كل صورة أولاً، ثم اسأل: هل يوجد فرق في الارتفاع يدفع الماء؟ عُد إلى سؤال الكتاب نفسه: الماء ينتقل من السوية الأعلى إلى الأدنى بسبب فرق الارتفاع.',
    solution: Object.freeze({
      title: 'إجابة أسئلة التأمل في ص98',
      steps: Object.freeze([
        Object.freeze({ label: 'الشكل (1)', text: 'سويتا الماء في الأنبوبين متساويتان الارتفاع؛ لذلك عند فتح الصنبور لا يحدث جريان صافٍ بين الوعاءين.' }),
        Object.freeze({ label: 'الشكل (2)', text: 'سوية الماء في الأنبوب (أ) أعلى منها في الأنبوب (ب). عند فتح الصنبور يجري الماء من الأنبوب الأعلى (أ) إلى الأدنى (ب) بسبب فرق الارتفاع، حتى يتساوى المنسوبان.' }),
        Object.freeze({ label: 'الربط بالكهرباء', text: 'بالقياس على الشكل (3): إذا وصل ناقلان مشحونان مختلفان كموناً بسلك ناقل، انتقلت الشحنات الكهربائية من أحدهما إلى الآخر، كما ينتقل الماء بين المنسوبين المختلفين.' }),
      ]),
      note: 'هذه المطابقة تفسير تشبيهي: فرق الارتفاع يقابل فرق الكمون، والماء يقابل الشحنات في سلوك الانتقال فقط.',
    }),
  }),

  /* --- p99 · the six «أفكر وأستنتج» questions --------------------------- */
  'p99-think': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'pump-role', correct: 'drives' }),
      Object.freeze({ id: 'pump-amount', correct: 'same' }),
      Object.freeze({ id: 'water-cause', correct: 'level-diff' }),
      Object.freeze({ id: 'generator-role', correct: 'energizes' }),
      Object.freeze({ id: 'generator-amount', correct: 'no-change' }),
      Object.freeze({ id: 'charge-cause', correct: 'potential-diff' }),
    ]),
    hint: 'قارن المضخة بالمولد: هل تصنع المضخة ماءً جديداً؟ وماذا يصنع المولد: طاقة أم شحنات؟ ولاحظ أن الانتقال بين (أ) و(ب) يحتاج إلى فرق بين السطحين.',
    solution: Object.freeze({
      title: 'إجابات «أفكر وأستنتج» الستة · ص99',
      steps: Object.freeze([
        Object.freeze({ label: '1 · دور المضخة', text: 'تحرّك الماء في الدارة المائية وتزوّده بالطاقة ليستمر جريانه في حلقة مغلقة.' }),
        Object.freeze({ label: '2 · كمية الماء', text: 'لا تزيد المضخة كمية الماء ولا تنقصها؛ إنما تحرّك الماء الموجود أصلاً في الأنابيب.' }),
        Object.freeze({ label: '3 · سبب انتقال الماء', text: 'وجود فرق في الارتفاع (الضغط) بين منسوبي السطحين؛ يجري الماء من (أ) الأعلى إلى (ب) الأدنى.' }),
        Object.freeze({ label: '4 · دور المولد', text: 'يحرّك الشحنات الكهربائية الموجودة في الناقل ويزوّدها بالطاقة اللازمة لتكمل دورة كاملة عبر الدارة.' }),
        Object.freeze({ label: '5 · كمية الشحنات', text: 'لا يزيد المولد كمية الشحنات ولا ينقصها؛ يزوّدها بالطاقة فقط.' }),
        Object.freeze({ label: '6 · سبب تحرك الشحنات', text: 'وجود فرق في الكمون بين نقطتين من الدارة مع اكتمال المسار الناقل (دارة مغلقة).' }),
      ]),
      note: 'الخلاصة المطبوعة في الكتاب: لا يسري التيار بين نقطتين إلا بوجود فرق في الكمون بينهما.',
    }),
  }),

  /* --- p100 · active/passive dipole lab --------------------------------- */
  'p100-lab': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'ammeter-open', correct: 'zero' }),
      Object.freeze({ id: 'voltmeter-lamp-open', correct: 'zero' }),
      Object.freeze({ id: 'voltmeter-source-open', correct: 'stays' }),
      Object.freeze({ id: 'lamp-kind', correct: 'passive' }),
      Object.freeze({ id: 'generator-kind', correct: 'active' }),
    ]),
    hint: 'افتح القاطعة في المختبر واقرأ الأجهزة الثلاثة: ماذا حدث للتيار؟ وماذا حدث لفرق كمون المولد؟ تذكّر أن فرق الكمون ليس هو التيار.',
    solution: Object.freeze({
      title: 'ملاحظات تجربة ص100 المتوقعة',
      steps: Object.freeze([
        Object.freeze({ label: 'عند الإغلاق', text: 'تكتمل الدارة فيمر تيار (دلالة الأمبير غير صفرية)، ويضيء المصباح، وتكون قراءة فولتميتر المصباح موافقة لفرق الكمون عليه.' }),
        Object.freeze({ label: 'عند الفتح', text: 'تنعدم قراءة الأمبير وتنعدم قراءة فولتميتر المصباح، لكن قراءة فولتميتر المولد لا تنعدم: يبقى فرق كمون بين قطبي المولد يسمى القوة المحركة الكهربائية للمولد.' }),
        Object.freeze({ label: 'التمييز', text: 'المصباح ثنائي قطب غير فعّال لأنه لا يسبب مرور التيار في دارة مغلقة؛ والمولد ثنائي قطب فعّال لأنه يسبب مرور التيار في دارة مغلقة.' }),
      ]),
      note: 'قيم القراءات العددية في المختبر نموذج مبسّط من المنصة؛ الكتاب لا يطبع أرقاماً لهذه التجربة.',
    }),
  }),

  /* --- p101 · series lab ------------------------------------------------- */
  'p101-series-lab': Object.freeze({
    items: Object.freeze([Object.freeze({ id: 'relation', correct: 'sum' })]),
    hint: 'اجمع قراءة فولتميتر المصباح الأول مع قراءة المصباح الثاني وقارن الناتج بقراءة فولتميتر المولد. في المختبر المبسّط المصباحان متماثلان فيتقاسمان فرق المولد بالتساوي.',
    solution: Object.freeze({
      title: 'استنتاج دارة التسلسل · ص101',
      steps: Object.freeze([
        Object.freeze({ label: 'القراءات', text: 'تُسجَّل دلالات المقاييس الثلاثة كما تُقرأ فعلياً من الأجهزة بعد إغلاق القاطعة؛ لا يطبع الكتاب أرقاماً جاهزة.' }),
        Object.freeze({ label: 'العلاقة', text: 'فرق الكمون بين قطبي المولد يساوي مجموع فروق الكمون الجزئية على المصباحين.', tex: 'U=U_{1}+U_{2}' }),
        Object.freeze({ label: 'مثال النموذج', text: 'إذا قرأت 12 V على المولد، فإن المصباحين المتماثلين يقرآن 6 V و6 V، والمجموع 6 + 6 = 12 V.', tex: '6+6=12\\,\\mathrm{V}' }),
      ]),
      note: 'قراءات المختبر قيم مثالية من نموذج المنصة للتدريب على التسجيل؛ ما يثبته الكتاب هو العلاقة نفسها.',
    }),
  }),

  /* --- p102 · book series activity (12 V, 5 V) --------------------------- */
  'p102-series-activity': Object.freeze({
    items: Object.freeze([Object.freeze({ id: 'u1', correct: 7 })]),
    hint: 'اكتب قانون التسلسل أولاً: فرق كمون المولد يساوي مجموع الفرقين. المعطيات 12 V و5 V؛ المعادلة U₁ = U − U₂ = 12 − 5.',
    solution: Object.freeze({
      title: 'حل نشاط التسلسل · ص102',
      steps: Object.freeze([
        Object.freeze({ label: 'المعطيات', tex: 'U=12\\,\\mathrm{V},\\;U_{2}=5\\,\\mathrm{V}' }),
        Object.freeze({ label: 'القانون', tex: 'U=U_{1}+U_{2}' }),
        Object.freeze({ label: 'التعويض والناتج', tex: 'U_{1}=U-U_{2}=12-5=7\\,\\mathrm{V}' }),
        Object.freeze({ label: 'التحقق', tex: '7+5=12\\,\\mathrm{V}' }),
      ]),
      note: '',
    }),
  }),

  /* --- p102 · parallel lab ---------------------------------------------- */
  'p102-parallel-lab': Object.freeze({
    items: Object.freeze([Object.freeze({ id: 'relation', correct: 'equal' })]),
    hint: 'طرفا كل مصباح متصلان بالعقدتين نفسيهما المتصلتين بقطبي المولد؛ قارن القراءات الثلاث: هل تتساوى أم تتجمع؟',
    solution: Object.freeze({
      title: 'استنتاج دارة التفرع · ص102–103',
      steps: Object.freeze([
        Object.freeze({ label: 'القراءات', text: 'تُسجَّل دلالة كل مقياس فولت من الأجهزة بعد إغلاق القاطعة، وتلاحظ تساويها في النموذج المثالي.' }),
        Object.freeze({ label: 'العلاقة', text: 'فرق الكمون الكلي بين قطبي المولد يساوي فرق الكمون في كل فرع من فروع الدارة.', tex: 'U=U_{1}=U_{2}' }),
      ]),
      note: '',
    }),
  }),

  /* --- p103 · book parallel activity (6 V) ------------------------------- */
  'p103-parallel-activity': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'branch-1', correct: 6 }),
      Object.freeze({ id: 'branch-2', correct: 6 }),
    ]),
    hint: 'في التفرع لا يتقاسم الفرعان فرق الكمون؛ فرق الكمون في كل فرع يساوي فرق كمون المولد نفسه: U = U₁ = U₂.',
    solution: Object.freeze({
      title: 'حل نشاط التفرع · ص103',
      steps: Object.freeze([
        Object.freeze({ label: 'المعطى', tex: 'U=6\\,\\mathrm{V}' }),
        Object.freeze({ label: 'القانون', tex: 'U=U_{1}=U_{2}' }),
        Object.freeze({ label: 'الناتج', tex: 'U_{1}=6\\,\\mathrm{V},\\;U_{2}=6\\,\\mathrm{V}' }),
      ]),
      note: 'فرق الكمون على كل من فرعي المصباحين 6 V.',
    }),
  }),

  /* --- p105 · self-check: four multiple-choice questions ----------------- */
  'p105-mcq': Object.freeze({
    items: Object.freeze([
      Object.freeze({
        id: 'mcq-1', correct: 'c',
        hint: '1 kV = 1000 V؛ اضرب 25 في 1000. احذر من القسمة بدل الضرب هنا.',
        why: '25 × 1000 = 25000 V، فالخيار c هو الصحيح.',
      }),
      Object.freeze({
        id: 'mcq-2', correct: 'd',
        hint: 'الفولتميتر يقيس فرق الكمون بين أي نقطتين يوصل بينهما على التفرع؛ فهل يقتصر على المصباح أو على المولد؟',
        why: 'يقيس الفولتميتر فرق الكمون بين طرفي المصباح وبين طرفي المولد، وعند فتح الدارة بين قطبي المولد تكون قراءته القوة المحركة الكهربائية؛ لذلك كل الإجابات السابقة صحيحة (d).',
      }),
      Object.freeze({
        id: 'mcq-3', correct: 'b',
        hint: '1 V = 1000 mV؛ اضرب 2.4 في 1000 ولا تقسم.',
        why: '2.4 × 1000 = 2400 mV، فالخيار b هو الصحيح.',
      }),
      Object.freeze({
        id: 'mcq-4', correct: 'b',
        hint: 'كولوم للشحنة، وأوم للمقاومة، وأمبير لشدة التيار؛ فأيها يقيس الكمون؟',
        why: 'وحدة قياس فرق الكمون هي الفولت، فالخيار b هو الصحيح.',
      }),
    ]),
    hint: 'لكل فقرة تلميحها الخاص؛ أعد التحقق بعد مراجعة التحويل بين الوحدات kV وV وmV وتعريف مقياس الفولت.',
    solution: Object.freeze({
      title: 'حل السؤال الأول · ص105',
      steps: Object.freeze([
        Object.freeze({ label: '1 · c', tex: '25\\,\\mathrm{kV}=25\\times1000=25000\\,\\mathrm{V}' }),
        Object.freeze({ label: '2 · d', text: 'مقياس الفولت يقيس فرق الكمون بين أي نقطتين يوصل بينهما على التفرع: طرفا مصباح، أو قطبا مولد، وقراءته عند الدارة المفتوحة هي القوة المحركة الكهربائية؛ كل الإجابات السابقة صحيحة.' }),
        Object.freeze({ label: '3 · b', tex: '2.4\\,\\mathrm{V}=2.4\\times1000=2400\\,\\mathrm{mV}' }),
        Object.freeze({ label: '4 · b', text: 'يقاس الكمون الكهربائي بوحدة الفولت.' }),
      ]),
      note: '',
    }),
  }),

  /* --- p105 · self-check: four true/false statements --------------------- */
  'p105-true-false': Object.freeze({
    items: Object.freeze([
      Object.freeze({
        id: 'tf-1', correct: 'false',
        hint: 'ميّز بين التيار وفرق الكمون: فتح القاطعة يوقف التيار، فهل يلغي فرق كمون المولد؟',
        why: 'غلط: فرق الكمون بين قطبي المولد لا ينعدم عند فتح الدارة؛ إنه القوة المحركة الكهربائية.',
      }),
      Object.freeze({
        id: 'tf-2', correct: 'false',
        hint: 'التعادل يعني أن صافي الشحنة صفر؛ فهل يحدد ذلك قيمة الكمون بالنسبة إلى مرجع ما؟',
        why: 'غلط بصيغتها العامة: الكمون خاصية نسبية تحتاج مرجعاً، والتعادل الكهربائي وحده لا يعني أن الكمون صفر.',
      }),
      Object.freeze({
        id: 'tf-3', correct: 'false',
        hint: 'كيف يوصل مقياس فولت ليقرأ فرق الكمون بين طرفي عنصر؟ راجع خلاصة ص99.',
        why: 'غلط: يوصل مقياس الفولت على التفرع بين طرفي المصباح، لا على التسلسل.',
      }),
      Object.freeze({
        id: 'tf-4', correct: 'false',
        hint: 'كلمة «ميلي» تعني جزءاً من ألف؛ احسب 1 ÷ 1000.',
        why: 'غلط: 1 mV = 0.001 V وليس 0.0001 V.',
      }),
    ]),
    hint: 'افحص كل عبارة على حدة وقارنها بخلاصات «تعلمت» في ص104.',
    solution: Object.freeze({
      title: 'حل السؤال الثاني · ص105',
      steps: Object.freeze([
        Object.freeze({ label: '1 · غلط', text: 'فتح القاطعة يعدم التيار فقط؛ فرق كمون المولد يبقى (القوة المحركة الكهربائية).' }),
        Object.freeze({ label: '2 · غلط', text: 'الناقل المعتدل صافي شحنته صفر، لكن كمونه يتعلق بالحالة والمرجع المختار، لا بالتعادل وحده.' }),
        Object.freeze({ label: '3 · غلط', text: 'يوصل الفولتميتر على التفرع مع العنصر المراد قياس فرق كمونه.' }),
        Object.freeze({ label: '4 · غلط', tex: '1\\,\\mathrm{mV}=0.001\\,\\mathrm{V}' }),
      ]),
      note: '',
    }),
  }),

  /* --- p106 · self-check: fill the blanks -------------------------------- */
  'p106-blanks': Object.freeze({
    items: Object.freeze([
      Object.freeze({
        id: 'blank-1a',
        accepted: Object.freeze(['فرق الكمون', 'فرق الكمون الكهربائي', 'فرق في الكمون', 'فرق الجهد', 'فرق جهد', 'فرق الجهد الكهربائي', 'الجهد الكهربائي']),
        hint: 'ما الذي لا يسري التيار بين نقطتين إلا بوجوده؟',
      }),
      Object.freeze({
        id: 'blank-1b',
        accepted: Object.freeze(['المولد', 'المولد الكهربائي', 'البطارية', 'مصدر الجهد', 'المصدر', 'مصدر الطاقة']),
        hint: 'من هو ثنائي القطب الفعّال الذي يحافظ على فرق الكمون؟',
      }),
      Object.freeze({
        id: 'blank-2a',
        accepted: Object.freeze(['المرتفع', 'الأعلى', 'العالي', 'الاعلى', 'الكبير']),
        hint: 'اتجاه التيار الاصطلاحي من الكمون…؟',
      }),
      Object.freeze({
        id: 'blank-2b',
        accepted: Object.freeze(['المنخفض', 'الأدنى', 'الادني', 'الصغير', 'الواطي']),
        hint: '…إلى الكمون؟',
      }),
      Object.freeze({
        id: 'blank-3',
        accepted: Object.freeze(['التفرع', 'التوازي', 'على التفرع', 'التفرع مع العنصر', 'التوازي مع العنصر']),
        hint: 'مقابل التسلسل: الفولتميتر لا يدخل مسار التيار نفسه.',
      }),
      Object.freeze({
        id: 'blank-4a',
        accepted: Object.freeze(['مجموع', 'مجموع فروق', 'جمع', 'ناتج جمع']),
        hint: 'في التسلسل، الكلّي يساوي … الفروق؟',
      }),
      Object.freeze({
        id: 'blank-4b',
        accepted: Object.freeze(['الجزئية', 'الجزئيه', 'الجزئي', 'الجزيئية', 'الفروع الجزئية']),
        hint: 'فروق كل عنصر على حدة تسمى فروقاً…',
      }),
    ]),
    hint: 'ابحث في قسم «تعلمت» (ص104) عن الجمل الثماني؛ كل فراغ مقتبس منها تقريباً.',
    solution: Object.freeze({
      title: 'جواب السؤال الثالث · ص106',
      steps: Object.freeze([
        Object.freeze({ label: '1', text: 'يمر تيار كهربائي في دارة مغلقة بتأثير فرق الكمون بين قطبي المولد.' }),
        Object.freeze({ label: '2', text: 'يسري التيار الكهربائي في الدارة الكهربائية من الكمون المرتفع إلى الكمون المنخفض.' }),
        Object.freeze({ label: '3', text: 'يوصل مقياس الفولت في الدارات الكهربائية على التفرع.' }),
        Object.freeze({ label: '4', text: 'يكون فرق الكمون بين قطبي المولد في الدارة المغلقة التسلسلية يساوي مجموع فروق الكمون الجزئية في تلك الدارة.' }),
      ]),
      note: 'تُقبل الصيغ العربية المكافئة (مثل «فرق الجهد» أو «الأعلى/الأدنى») ما دام المعنى الفيزيائي صحيحاً.',
    }),
  }),
});
