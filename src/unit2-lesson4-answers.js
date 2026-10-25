/* Answer keys, hints and model solutions for Unit 2 Lesson 4.
 *
 * Loaded only by a dynamic import after the student presses «تحقق من الإجابة»,
 * «تلميح» or «الحل النموذجي» (see unit2-lesson4-practice.js). No key ships in the
 * initial markup; a wrong attempt yields a scientific hint, never the key; the
 * model solution stays locked until a checked attempt.
 *
 * Every key comes from the textbook pages 107–120 (printed values, conclusions,
 * self-check) or, where marked, from a platform training item built on the same
 * relation. The p116 figure is deliberately left unresolved.
 */
export const UNIT2L4_ANSWERS = Object.freeze({

  /* ---------------------------------------------------------------- p107 */
  'p107-intro': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p107-common', correct: 'resistive-element', hint: 'ما الذي يسخن فعلياً في السخان والمكواة؟ ليس المحرك ولا الشاشة، بل عنصر يمرّ فيه التيار.' }),
      Object.freeze({ id: 'p107-heat-set', correct: 'heat-set', hint: 'ابحث عن الأجهزة التي الغرض الأساسي منها توليد الحرارة، لا تحريك الهواء أو عرض الصورة.' }),
    ]),
    hint: 'الأجهزة الحرارية تشترك في ناقل مقاوم يمرّ فيه التيار فيسخن. الشحنات لا تُستهلك، والطاقة تتحوّل.',
    solution: Object.freeze({
      title: 'العنصر المشترك في أجهزة التسخين',
      steps: Object.freeze([
        Object.freeze({ label: '1 · العنصر المشترك', text: 'عنصر تسخين مقاوم يمرّ فيه التيار الكهربائي، فيتحوّل جزء من الطاقة الكهربائية إلى طاقة حرارية.' }),
        Object.freeze({ label: '2 · أمثلة حرارية', text: 'فرن كهربائي، محمصة خبز، مجفف شعر: أجهزة غرضها الأساسي توليد الحرارة من الكهرباء.' }),
        Object.freeze({ label: '3 · تنبيه', text: 'المروحة تحوّل معظم الطاقة إلى حركة، والليد إلى ضوء؛ لا نصنّفها أجهزة تسخين.' }),
      ]),
      note: 'أمثلة الأجهزة إضافة من المنصة، أما العبارة العلمية للعنصر المشترك فهي فكرة الصفحة 107.',
    }),
  }),

  /* ---------------------------------------------------------------- p108 */
  'p108-observe': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p108-2a', correct: 'lower', hint: 'أضفنا مقاومة إلى المسار نفسه مع بقاء الخلية. ما أثر ذلك في المقاومة الكلية والتيار؟' }),
      Object.freeze({ id: 'p108-2b', correct: 'heat', hint: 'المصباح يضيء ويسخن. لا تلمسه؛ قرّب يدك فقط.' }),
      Object.freeze({ id: 'p108-2c', correct: 'collisions', hint: 'لا يفنى التيار داخل المقاومة؛ ما الذي يحدث لطاقة الإلكترونات عند تصادمها مع ذرات الناقل؟' }),
    ]),
    hint: 'المقاومة المضافة تزيد المقاومة الكلية عند ثبات المصدر فتقل الشدة. الحرارة تأتي من تحوّل الطاقة الحركية للإلكترونات عند الاصطدام، لا من «استهلاك» الشحنة.',
    solution: Object.freeze({
      title: 'مقارنة دارتي ص108 وتفسير الحرارة',
      steps: Object.freeze([
        Object.freeze({ label: 'الملاحظة 1', text: 'بعد إضافة المقاومة على التسلسل تصبح قراءة الأمبيرمتر أصغر من قبل، ويضعف إضاءة المصباح عادةً عند ثبات الخلية.' }),
        Object.freeze({ label: 'الملاحظة 2', text: 'عند تقريب اليد من المصباح نشعر بالحرارة. المصباح يحوّل جزءاً من الطاقة الكهربائية إلى حرارة وضوء.' }),
        Object.freeze({ label: 'التفسير', text: 'تتصادم الإلكترونات الحرة مع ذرات الناقل، فتنقل إليها طاقة، فتزداد الطاقة الحرارية للناقل وترتفع درجة حرارته. عدد الشحنات والتيار المستقر لا «يُستهلك» في المقاومة.' }),
      ]),
      note: 'الكتاب لا يعطي قيمة عددية لتيار هذه التجربة؛ لا نستبدلها بقراءة من النموذج.',
    }),
  }),

  /* ---------------------------------------------------------------- p109 */
  'p109-table': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p109-3a', correct: 4, hint: 'اقسم فرق الكمون على شدة التيار في العمود الأول: 2 ÷ 0.5.' }),
      Object.freeze({ id: 'p109-3b', correct: 4, hint: '4 ÷ 1.' }),
      Object.freeze({ id: 'p109-3c', correct: 4, hint: '6 ÷ 1.5.' }),
      Object.freeze({ id: 'p109-3d', correct: 4, hint: '8 ÷ 2.' }),
      Object.freeze({ id: 'p109-3e', correct: 4, hint: '12 ÷ 3.' }),
    ]),
    hint: 'النسبة U/I هي المقاومة. احسبها في كل عمود بصورة مستقلة، ولا تفترض النتيجة قبل القسمة.',
    solution: Object.freeze({
      title: 'نسب الجدول المطبوع · ص109',
      steps: Object.freeze([
        Object.freeze({ label: 'العمود 1', tex: '\\dfrac{2}{0.5}=4\\,\\Omega' }),
        Object.freeze({ label: 'العمود 2', tex: '\\dfrac{4}{1}=4\\,\\Omega' }),
        Object.freeze({ label: 'العمود 3', tex: '\\dfrac{6}{1.5}=4\\,\\Omega' }),
        Object.freeze({ label: 'العمود 4', tex: '\\dfrac{8}{2}=4\\,\\Omega' }),
        Object.freeze({ label: 'العمود 5', tex: '\\dfrac{12}{3}=4\\,\\Omega' }),
      ]),
      note: 'ثبات النسبة 4 أوم يبيّن أن المقاومة ثابتة ضمن شروط التجربة، وهو معنى قانون أوم.',
    }),
  }),

  /* ---------------------------------------------------------------- p110 */
  'p110-slope': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p110-5', correct: 4, hint: 'خذ نقطتين واضحتين على الخط: (1 A، 4 V) و(4 A، 16 V). الميل = ΔU/ΔI.' }),
    ]),
    hint: 'الميل هنا ΔU/ΔI، وليس ΔI/ΔU. النقطتان (1،4) و(4،16) موجودتان على الخط.',
    solution: Object.freeze({
      title: 'ميل الخط البياني في ص110',
      steps: Object.freeze([
        Object.freeze({ label: 'القانون', tex: 'm=\\dfrac{\\Delta U}{\\Delta I}' }),
        Object.freeze({ label: 'التعويض', tex: 'm=\\dfrac{16-4}{4-1}=\\dfrac{12}{3}=4' }),
        Object.freeze({ label: 'الوحدة والدلالة', text: 'الوحدة فولت لكل أمبير، أي أوم. الميل يمثّل المقاومة الكهربائية للناقل، ومقدارها 4 Ω.' }),
      ]),
      note: 'لو وضعنا I على المحور الرأسي وU على الأفقي لكان الميل مقلوب المقاومة.',
    }),
  }),

  'p110-example': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p110-example', correct: 2, hint: 'المطلوب المقاومة، لذلك نقسم فرق الكمون على شدة التيار.' }),
    ]),
    hint: 'R = U / I. عوّض 6 فولت و3 أمبير.',
    solution: Object.freeze({
      title: 'تطبيق ص110 المحلول',
      steps: Object.freeze([
        Object.freeze({ label: 'المعطيات', text: 'U = 6 V، I = 3 A.' }),
        Object.freeze({ label: 'القانون', tex: 'R=\\dfrac{U}{I}' }),
        Object.freeze({ label: 'التعويض', tex: 'R=\\dfrac{6}{3}=2\\,\\Omega' }),
        Object.freeze({ label: 'التحقق', tex: 'U=R\\times I=2\\times3=6\\,\\mathrm V' }),
      ]),
      note: 'الأوم = فولت لكل أمبير.',
    }),
  }),

  /* ---------------------------------------------------------------- p111 */
  'p111-factors': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p111-3', correct: 'double', hint: 'ثبّتنا النوع والمقطع، وغيّرنا الطول إلى الضعف. ما العلاقة الطردية بين الطول والمقاومة؟' }),
      Object.freeze({ id: 'p111-4', correct: 'half', hint: 'ثبّتنا الطول والنوع، وضاعفنا مساحة المقطع. العلاقة عكسية مع المساحة.' }),
      Object.freeze({ id: 'p111-5', correct: 'material', hint: 'الطول والمقطع ثابتان، والمادة مختلفة. هل يمكن معرفة أي السلكين أكبر دون معرفة المادتين؟' }),
    ]),
    hint: 'المقاومة تتناسب طرداً مع الطول وعكساً مع مساحة المقطع، وتتغيّر بنوع المادة. لا تستنتج نسبة عددية لمادتين مجهولتين.',
    solution: Object.freeze({
      title: 'استنتاجات تجربة ص111',
      steps: Object.freeze([
        Object.freeze({ label: 'الطول', text: 'عند ثبات النوع والمقطع، مضاعفة الطول تضاعف المقاومة؛ العلاقة طردية.' }),
        Object.freeze({ label: 'المقطع', text: 'عند ثبات الطول والنوع، مضاعفة مساحة المقطع تنقص المقاومة إلى النصف؛ العلاقة عكسية.' }),
        Object.freeze({ label: 'النوع', text: 'المقاومة تختلف باختلاف المادة. لا نستطيع تحديد أي المادتين أكبر مقاومة دون معرفة المقاومة النوعية لكل منهما.' }),
      ]),
      note: 'أرقام 3 و6 المتكررة في رسوم الصفحة لا تُستخدم لاستنتاج نسبة المقطع؛ الرسم غير منضبط في هذه الناحية.',
    }),
  }),

  /* ---------------------------------------------------------------- p112 */
  'p112-example': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p112-example', correct: 1, hint: 'حوّل 30 cm² إلى m² أولاً (×10⁻⁴)، ثم عزل ρ من R = ρℓ/S.' }),
    ]),
    hint: '30 cm² = 30 × 10⁻⁴ m² = 0.003 m². ثم ρ = R·S / ℓ.',
    solution: Object.freeze({
      title: 'تطبيق ص112 المحلول',
      steps: Object.freeze([
        Object.freeze({ label: 'تحويل المساحة', tex: 'S=30\\times10^{-4}=0.003\\,\\mathrm m^{2}' }),
        Object.freeze({ label: 'عزل ρ', tex: 'R=\\rho\\dfrac{\\ell}{S}\\;\\Longrightarrow\\;\\rho=\\dfrac{RS}{\\ell}' }),
        Object.freeze({ label: 'التعويض', tex: '\\rho=\\dfrac{1000\\times0.003}{3}=1\\,\\Omega\\cdot\\mathrm m' }),
        Object.freeze({ label: 'الوحدة', text: 'أوم·متر، وليست أوم لكل متر.' }),
      ]),
      note: 'هذه أرقام التطبيق المطبوع، وليست مقاومة نوعية مقيسة لمادة سمّاها الكتاب.',
    }),
  }),

  /* ---------------------------------------------------------------- p113 */
  'p113-lab': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p113-relation', correct: 'series-sum', hint: 'في المسار الواحد يمرّ التيار نفسه، ويتوزّع فرق الكمون الكلي بين المقاومتين: U = U₁ + U₂.' }),
    ]),
    hint: 'اقرأ I وU₁ وU₂ بعد إغلاق القاطعة، ثم تحقّق: هل U = U₁ + U₂؟ وهل التيار نفسه في كل موضع من المسار؟',
    solution: Object.freeze({
      title: 'استنتاج تجربة التسلسل · ص113',
      steps: Object.freeze([
        Object.freeze({ label: 'التيار', text: 'المقاومتان في المسار نفسه، فلا يوجد تفرّع بينهما: I = I₁ = I₂، والأمبيرمتر يقيس هذه القيمة نفسها.' }),
        Object.freeze({ label: 'فرق الكمون', text: 'فرق الكمون الكلي على المقاومتين معاً يساوي مجموعهما: U = U₁ + U₂.' }),
        Object.freeze({ label: 'المقاومة المكافئة', tex: 'R_{eq}=R_{1}+R_{2}' }),
        Object.freeze({ label: 'التحقق العددي', text: 'اجمع القراءتين U₁ وU₂ وقارن مجموعهما بالقراءة الكلية، ثم اقسم U على I لتتحقق من R₁ + R₂.' }),
      ]),
      note: 'القراءات ناتجة عن النموذج الرقمي الذي اخترته، وليست أرقاماً مطبوعة في الكتاب.',
    }),
  }),

  'p113-think': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p113-think-1', correct: 'both', hint: 'الصفحة نفسها تذكر طريقتين: الوصل على التسلسل ثم الوصل على التفرع.' }),
      Object.freeze({ id: 'p113-think-2', correct: 'increase', hint: 'في التسلسل نضيف مقاومة بعد مقاومة في المسار نفسه. ماذا يحدث للمقاومة الكلية؟' }),
    ]),
    hint: 'يمكن وصل المقاومات على التسلسل أو على التفرع. في التسلسل تُجمع المقاومات فتصبح المكافئة أكبر.',
    solution: Object.freeze({
      title: 'إجابات «أفكّر» في ص113',
      steps: Object.freeze([
        Object.freeze({ label: 'طريقتا الوصل', text: 'يمكن وصل المقاومات مع المولد على التسلسل (مسار واحد) أو على التفرع (بين العقدتين نفسيهما).' }),
        Object.freeze({ label: 'أثر التسلسل', text: 'المقاومة المكافئة في التسلسل تساوي مجموع المقاومات، فتكون أكبر من كل مقاومة مفردة.' }),
        Object.freeze({ label: 'الفائدة', text: 'الحصول على مقاومة كبيرة غير متوفرة كقطعة واحدة، أو استبدال مجموعة مقاومات بمقاومة واحدة مكافئة.' }),
      ]),
      note: 'قد تُستعمل الطريقتان معاً في تطبيقات أعقد، لكن تجربتي الصفحتين 113 و114 تعالجان الحالتين الأساسيتين.',
    }),
  }),

  'p113-wonder': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p113-wonder', model: 'نستبدل عدة مقاومات بمقاومة وحيدة مكافئة تحافظ على التيار الكلي وفرق الكمون الخارجي عند القيم نفسها؛ يعتمد مقدارها على قيم المقاومات وطريقة وصلها، ولا يمكن إعطاء رقم دون معطيات.' }),
    ]),
    hint: 'المقاومة المكافئة لا تُلغى ولا تُضاف اعتباطاً؛ يجب أن تحافظ على العلاقة بين التيار الكلي وفرق الكمون الخارجي.',
    solution: Object.freeze({
      title: 'معنى المقاومة المكافئة',
      steps: Object.freeze([
        Object.freeze({ label: 'الفكرة', text: 'نبحث عن مقاومة واحدة تُوضع مكان مجموعة المقاومات، فيبقى التيار الكلي وفرق الكمون الخارجي كما هما.' }),
        Object.freeze({ label: 'المقدار', text: 'يعتمد على قيم المقاومات وطريقة وصلها: مجموع في التسلسل، ومجموع المقلوبات في التفرع.' }),
        Object.freeze({ label: 'لماذا؟', text: 'لأن الشركات تصنع قيماً محددة، وقد نحتاج قيمة غير متوفرة، فنركّبها من قيم متوفرة.' }),
      ]),
      note: 'لا يمكن إعطاء قيمة عددية من دون معرفة المقاومات وطريقة وصلها.',
    }),
  }),

  /* ---------------------------------------------------------------- p114 */
  'p114-lab': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p114-relation', correct: 'parallel-sum-currents', hint: 'عند عقدة التفرع: الشحنة محفوظة، فماذا يساوي تيار المولد بالنسبة لتياري الفرعين؟' }),
    ]),
    hint: 'في التفرع: U = U₁ = U₂، والتيار الكلي I = I₁ + I₂. سجّل القراءات من المقاييس أولاً.',
    solution: Object.freeze({
      title: 'استنتاج تجربة التفرع · ص114–115',
      steps: Object.freeze([
        Object.freeze({ label: 'فرق الكمون', text: 'المقاومتان بين العقدتين نفسيهما، لذلك يقيس الفولتميتر القيمة نفسها على الفرعين وعلى المولد: U = U₁ = U₂.' }),
        Object.freeze({ label: 'التيار', text: 'التيار يتوزّع بين الفرعين، ومجموعه يعود إلى المولد: I = I₁ + I₂.' }),
        Object.freeze({ label: 'التحقق العددي', text: 'اجمع القراءتين المسجلتين I₁ وI₂ وقارن مجموعهما بقراءة تيار المولد التي سجّلتها.' }),
      ]),
      note: 'القراءات ناتجة عن النموذج الذي اخترته، وليست أرقاماً مطبوعة في الكتاب.',
    }),
  }),

  /* ---------------------------------------------------------------- p115 */
  'p115-derive': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p115-derive', model: 'نجمع تيارات الفروع I=I₁+I₂، ونعوّض I=U/Req وI₁=U/R₁ وI₂=U/R₂، ثم نقسم على U غير الصفري فنحصل على 1/Req = 1/R₁ + 1/R₂.' }),
    ]),
    hint: 'ابدأ من جمع التيارات عند العقدة، ثم استخدم I = U/R لكل فرع، واقسم على U.',
    solution: Object.freeze({
      title: 'اشتقاق مكافئة التفرع · ص115',
      steps: Object.freeze([
        Object.freeze({ label: 'جمع التيارات', tex: 'I=I_{1}+I_{2}' }),
        Object.freeze({ label: 'قانون أوم لكل فرع', tex: 'I_{1}=\\dfrac{U}{R_{1}},\\quad I_{2}=\\dfrac{U}{R_{2}},\\quad I=\\dfrac{U}{R_{eq}}' }),
        Object.freeze({ label: 'التعويض', tex: '\\dfrac{U}{R_{eq}}=\\dfrac{U}{R_{1}}+\\dfrac{U}{R_{2}}' }),
        Object.freeze({ label: 'القسمة على U', tex: '\\dfrac{1}{R_{eq}}=\\dfrac{1}{R_{1}}+\\dfrac{1}{R_{2}}' }),
      ]),
      note: 'تمتد العلاقة لأي عدد من الفروع. حالة U = 0 تُعالج بالتعريف أو بالحد، وليست قسماً على صفر.',
    }),
  }),

  'p115-example': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p115-example1-req', correct: 6, hint: 'في التسلسل اجمع المقاومتين مباشرة.' }),
      Object.freeze({ id: 'p115-example1-i', correct: 2, hint: 'بعد إيجاد المكافئة 6 Ω، اقسم 12 V عليها.' }),
      Object.freeze({ id: 'p115-example2-req', correct: 1.5, hint: '1/3 + 1/3 = 2/3، ثم اقلب الناتج. لا تجمع 3+3.' }),
      Object.freeze({ id: 'p115-example2-i', correct: 8, hint: 'بعد المكافئة 1.5 Ω، اقسم 12 V عليها.' }),
    ]),
    hint: 'التسلسل: مجموع مباشر. التفرع: مجموع المقلوبات ثم قلب الناتج. التيار من قانون أوم للدارة.',
    solution: Object.freeze({
      title: 'تطبيق ص115 المحلول',
      steps: Object.freeze([
        Object.freeze({ label: 'التسلسل · المكافئة', tex: 'R_{eq}=3+3=6\\,\\Omega' }),
        Object.freeze({ label: 'التسلسل · التيار', tex: 'I=\\dfrac{12}{6}=2\\,\\mathrm A' }),
        Object.freeze({ label: 'التفرع · المكافئة', tex: '\\dfrac{1}{R_{eq}}=\\dfrac13+\\dfrac13=\\dfrac23\\;\\Longrightarrow\\;R_{eq}=1.5\\,\\Omega' }),
        Object.freeze({ label: 'التفرع · التيار', tex: 'I=\\dfrac{12}{1.5}=8\\,\\mathrm A' }),
      ]),
      note: 'تحقق: في التفرع تيار كل فرع 4 A ومجموعهما 8 A؛ وفي التسلسل فرق الكمون على كل مقاومة 6 V.',
    }),
  }),

  /* ---------------------------------------------------------------- p116 */
  'p116-code': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p116-code-1', correct: 4700, hint: 'أصفر = 4، بنفسجي = 7، أحمر = 2. طبّق R = (10A+B)×10^C.' }),
      Object.freeze({ id: 'p116-code-2', correct: 220, hint: 'أحمر = 2، أحمر = 2، بني = 1.' }),
      Object.freeze({ id: 'p116-code-3', correct: 10000, hint: 'بني = 1، أسود = 0، برتقالي = 3.' }),
    ]),
    hint: 'الألوان أرقام من 0 إلى 9 بالترتيب: أسود، بني، أحمر، برتقالي، أصفر، أخضر، أزرق، بنفسجي، رمادي، أبيض.',
    solution: Object.freeze({
      title: 'تدريب الترميز اللوني',
      steps: Object.freeze([
        Object.freeze({ label: '4700 Ω', text: 'أصفر (4)، بنفسجي (7)، أحمر (2): (10×4+7)×10² = 4700 Ω.' }),
        Object.freeze({ label: '220 Ω', text: 'أحمر (2)، أحمر (2)، بني (1): (10×2+2)×10¹ = 220 Ω.' }),
        Object.freeze({ label: '10000 Ω', text: 'بني (1)، أسود (0)، برتقالي (3): (10×1+0)×10³ = 10000 Ω.' }),
      ]),
      note: 'هذه تدريبات مستقلة على نموذج الأربع حلقات؛ لا تُنسب إلى الشكل الأصلي المتعارض.',
    }),
  }),

  'p116-figure': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p116-2', model: 'لا نجزم بقيمة القطعة المرسومة: النص يشرح أربع حلقات، لكن الصورة المكبّرة تُظهر خمس مناطق لونية. نذكر الاحتمال الخماسي 47000 Ω فقط إذا أكّد المعلم أن المقاومة خماسية الحلقات، مع بقاء التعارض موثقاً.' }),
    ]),
    hint: 'اقرأ عدد المناطق اللونية في الصورة أولاً، ثم قارنه بعدد الحلقات الذي يشرحه النص. هل يتطابقان؟',
    solution: Object.freeze({
      title: 'كيف نتعامل مع تعارض ص116؟',
      steps: Object.freeze([
        Object.freeze({ label: 'المشكلة', text: 'النص يشرح نموذج أربع حلقات: A وB وC وD. الصورة المكبّرة تُظهر خمس مناطق لونية تبدو أصفر وبنفسجي وأسود وأحمر وبني.' }),
        Object.freeze({ label: 'الموقف العلمي', text: 'لا نُنشئ قراءة مؤكدة من صورة غير منضبطة. نعرض التعارض ونطلب تأكيد المعلم.' }),
        Object.freeze({ label: 'إثراء مشروط', text: 'إذا كانت المقاومة خماسية الحلقات، فقراءة 470 مع مضاعف 100 تعطي 47000 Ω؛ لكن هذا إثراء خارج جدول الكتاب وليس جواباً مؤكداً للصورة.' }),
      ]),
      note: 'تدريب 4700 Ω في النشاط السابق صحيح لنموذج الأربع حلقات، لكنه ليس قراءة مؤكدة للرسم.',
    }),
  }),

  /* ---------------------------------------------------------------- p117 */
  'p117-concept': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p117-led-mech', correct: 'recombination', hint: 'الليد ليس فتيلاً يُسخّن حتى يتوهّج. كيف تنتقل الإلكترونات بين حزم الطاقة في مادة نصف ناقلة؟' }),
      Object.freeze({ id: 'p117-led-polarity', correct: 'directional', hint: 'الليد قطبي، ويحتاج تحديداً للتيار. هل يمكن توصيله مباشرة بأي مصدر؟' }),
      Object.freeze({ id: 'p117-rheostat', correct: 'length', hint: 'الزلاقة تغيّر الجزء المستعمل من الناقل. ماذا يحدث للمقاومة عند زيادة هذا الطول؟' }),
    ]),
    hint: 'الليد يصدر الضوء بإعادة اتحاد حوامل الشحنة، ويحتاج قطباً صحيحاً وتحديداً للتيار. المقاومة المتغيرة تغيّر طول الجزء الفعّال.',
    solution: Object.freeze({
      title: 'تصحيح وتثبيت مفاهيم ص117',
      steps: Object.freeze([
        Object.freeze({ label: 'آلية الليد', text: 'تنتقل الإلكترونات بين حزم الطاقة، وتعيد اتحاد حوامل الشحنة، فتنطلق فوتونات. ليست الإضاءة ناتجة عن تسخين فتيل.' }),
        Object.freeze({ label: 'الاستخدام الآمن', text: 'الليد قطبي وغير خطي؛ يحتاج توصيلاً صحيحاً ومقاومة لتحديد التيار أو دارة قيادة، ولا يوصل مباشرة بالشبكة.' }),
        Object.freeze({ label: 'المقاومة المتغيرة', text: 'تحريك الزلاقة يغيّر طول الجزء المستعمل من الناقل، فتتغيّر المقاومة والتيار. تُستخدم للتحكم في التيار أو التوتر.' }),
      ]),
      note: 'عبارة «عند تسخينها» في فقرة الكتاب مختصرة؛ التصحيح معلن بوضوح كتوضيح من المنصة.',
    }),
  }),

  /* ---------------------------------------------------------------- p118 */
  'p118-summary': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'p118-q1', correct: '2', hint: 'اجمع المقاومتين 2+4=6 Ω، ثم اقسم 12 V على 6 Ω.' }),
      Object.freeze({ id: 'p118-q2', correct: 'ohm-metre', hint: 'من R = ρℓ/S، وحدة ρ = Ω·m²/m = Ω·m.' }),
      Object.freeze({ id: 'p118-q3', correct: '2', hint: '1/6 + 1/3 = 1/2، ثم اقلب الناتج.' }),
      Object.freeze({ id: 'p118-q4', correct: 'double', hint: 'العلاقة طردية بين المقاومة والطول عند ثبات المقطع والمادة.' }),
      Object.freeze({ id: 'p118-q5', correct: 'recombination', hint: 'إعادة اتحاد حوامل الشحنة، لا تسخين فتيل.' }),
    ]),
    hint: 'راجع بطاقات «تعلّمت» في الصفحة: قانون أوم، قانون السلك، مجموع التسلسل، ومجموع المقلوبات في التفرع.',
    solution: Object.freeze({
      title: 'تحقق ختامي من قوانين الدرس',
      steps: Object.freeze([
        Object.freeze({ label: '1', text: 'مقاومتان 2 Ω و4 Ω على التسلسل: Req = 6 Ω، وشدة التيار 12/6 = 2 A.' }),
        Object.freeze({ label: '2', text: 'وحدة المقاومة النوعية Ω·m.' }),
        Object.freeze({ label: '3', text: 'تفرع 6 Ω و3 Ω: 1/Req = 1/6 + 1/3 = 1/2، إذن Req = 2 Ω.' }),
        Object.freeze({ label: '4', text: 'مضاعفة الطول مع ثبات المقطع والمادة تضاعف المقاومة.' }),
        Object.freeze({ label: '5', text: 'الليد يصدر الضوء بإعادة اتحاد حوامل الشحنة، لا بتوهّج فتيل.' }),
      ]),
      note: 'أسئلة هذا النشاط من المنصة لتثبيت الخلاصة؛ ليست أسئلة مطبوعة في ص118.',
    }),
  }),

  /* ---------------------------------------------------------------- p119 */
  'p119-mcq': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'q1a', correct: 'b', hint: 'مقاومتان متماثلتان على التفرع: المكافئة = 2/2 = 1 Ω. ثم I = U/Req = 12/1. وتيار كل فرع 6 A وليس هو التيار الكلي.' }),
      Object.freeze({ id: 'q1b', correct: 'd', hint: 'من قانون السلك: Ω = ρ·m²/m، فما وحدة ρ؟' }),
      Object.freeze({ id: 'q1c', correct: 'b', hint: 'ست مقاومات متساوية على التفرع: Req = R/n. لا تجمعها كما في التسلسل.' }),
    ]),
    hint: 'قبل الاختيار: هل المقاومات على التسلسل أم على التفرع؟ ثم طبّق القانون المناسب.',
    solution: Object.freeze({
      title: 'حل السؤال الأول · ص119',
      steps: Object.freeze([
        Object.freeze({ label: '1 · الخيار b', tex: 'R_{eq}=\\dfrac{2}{2}=1\\,\\Omega,\\quad I=\\dfrac{12}{1}=12\\,\\mathrm A' }),
        Object.freeze({ label: '2 · الخيار d', tex: '\\rho=\\dfrac{RS}{\\ell}\\;\\Longrightarrow\\;[\\rho]=\\Omega\\cdot\\mathrm m' }),
        Object.freeze({ label: '3 · الخيار b', tex: 'R_{eq}=\\dfrac{R}{n}=\\dfrac{6}{6}=1\\,\\Omega' }),
      ]),
      note: '36 Ω نتيجة جمع المقاومات على التسلسل، وهي ليست حالة السؤال الثالث.',
    }),
  }),

  'p119-graph-read': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'q2a', correct: 'ohm-law', hint: 'ما الكمية على المحور الأفقي؟ وما الكمية على الرأسي؟ مستقيم يمرّ بالأصل يعني تناسباً طردياً.' }),
    ]),
    hint: 'المحور الأفقي I والمحور الرأسي U، والخط مستقيم يمرّ بالأصل: علاقة تناسب طردي بين U وI.',
    solution: Object.freeze({
      title: 'ماذا يمثل المخطط؟',
      steps: Object.freeze([
        Object.freeze({ label: 'التمثيل', text: 'تغيّر فرق الكمون الكهربائي بين طرفي ناقل أومي بدلالة شدة التيار المار فيه.' }),
        Object.freeze({ label: 'الدلالة', text: 'المستقيم المار بالأصل يمثل تناسباً طردياً في ظروف ثابتة، وميله المقاومة.' }),
      ]),
      note: 'المخطط أعيد رسمه من بيانات الكتاب؛ ليس صورة مطابقة للصفحة.',
    }),
  }),

  'p119-graph-values': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'q2b', correct: 30, hint: 'عند 5 A يكون U = 25 V، وعند 7 A يكون 35 V. المخطط خط مستقيم، فما القيمة عند 6 A؟' }),
      Object.freeze({ id: 'q2c', correct: 5, hint: 'خذ نقطة مطبوعة مثل (2 A، 10 V) واقسم U على I.' }),
    ]),
    hint: 'النقاط المطبوعة تحقق U = 5I. استخدم نقطة واضحة لحساب المقاومة، والاستيفاء لقيمة 6 A.',
    solution: Object.freeze({
      title: 'قراءة المخطط وحساب المقاومة',
      steps: Object.freeze([
        Object.freeze({ label: 'الاستيفاء', text: '6 A تقع بين 5 A و7 A؛ على الخط المستقيم تكون U = 5×6 = 30 V.' }),
        Object.freeze({ label: 'المقاومة', tex: 'R=\\dfrac{U}{I}=\\dfrac{10}{2}=5\\,\\Omega' }),
        Object.freeze({ label: 'التحقق', tex: '\\dfrac{45}{9}=5\\,\\Omega' }),
      ]),
      note: 'قيمة 6 A ليست نقطة مطبوعة؛ هي قراءة استيفاء خطي وليست قياساً أصلياً.',
    }),
  }),

  /* ---------------------------------------------------------------- p120 */
  'p120-match': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'q3a', correct: 'resistance', hint: 'نسبة التوتر إلى شدة التيار هي كمية لها وحدة الأوم.' }),
      Object.freeze({ id: 'q3b', correct: 'ohm', hint: 'فولت واحد لكل أمبير واحد هو تعريف وحدة، لا اسم كمية.' }),
      Object.freeze({ id: 'q3c', correct: 'series', hint: 'في أي طريقة وصل تكون المكافئة مجموع المقاومات؟' }),
      Object.freeze({ id: 'q3d', correct: 'area', hint: 'العلاقة عكسية مع مساحة المقطع؛ زيادة الطول تزيد المقاومة لا تنقصها.' }),
    ]),
    hint: 'فرّق بين الكمية (المقاومة)، ووحدتها (الأوم)، وطريقة الوصل، والعامل الهندسي. أحد الخيارات لا يُستخدم.',
    solution: Object.freeze({
      title: 'حل المطابقة · ص120',
      steps: Object.freeze([
        Object.freeze({ label: '1', text: 'نسبة التوتر إلى شدة التيار ← المقاومة الكهربائية.' }),
        Object.freeze({ label: '2', text: 'مقاومة ناقل عند 1 V و1 A ← الأوم.' }),
        Object.freeze({ label: '3', text: 'المكافئة أكبر ← وصل المقاومات على التسلسل.' }),
        Object.freeze({ label: '4', text: 'تنقص المقاومة بزيادة مساحة مقطع سلك الناقل.' }),
        Object.freeze({ label: 'خيار زائد', text: 'طول سلك الناقل؛ زيادته تزيد المقاومة، فلا يناسب عبارة النقصان.' }),
      ]),
      note: 'خيار «طول سلك الناقل» زائد كما في السؤال المطبوع.',
    }),
  }),

  'p120-explain': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'q4a', model: 'لكل ناقل وأجهزة مقاومة فعلية غير معدومة، وهي تحدد شدة التيار وتحوّل جزءاً من الطاقة إلى حرارة أو ضوء. الإعاقة لا تعني المنع التام؛ يمر تيار غير صفري تحت فرق كمون مناسب، والأسلاك المثالية صفرية المقاومة تبسيط حسابي.' }),
      Object.freeze({ id: 'q4b', model: 'الليد ينتج إضاءة مناسبة بتيار صغير، فيوفر الطاقة مقارنة بمصباح الفتيل. ينتج الضوء بإعادة اتحاد حوامل الشحنة لا بتوهّج فتيل، ويحتاج قطبية صحيحة وتحديداً للتيار.' }),
      Object.freeze({ id: 'q4c', model: 'على التفرع يأخذ كل مصباح فرق كمون المصدر نفسه، ويعمل مستقلاً؛ تعطّل مصباح في فرع لا يقطع الفروع الأخرى. لا تعني هذه الاستقلالية الاستغناء عن الحماية والسلامة.' }),
    ]),
    hint: 'اربط كل تفسير بالكمية أو العلاقة المناسبة: مقاومة حقيقية غير معدومة، آلية إصدار الضوء، واستقلال الفروع على التفرع.',
    solution: Object.freeze({
      title: 'التفسيرات العلمية الثلاثة · ص120',
      steps: Object.freeze([
        Object.freeze({ label: '1 · لماذا لا تخلو دارة من مقاومة؟', text: 'المقاومة خاصية فعلية للنواقل والأجهزة. وجودها يحدد التيار ويحوّل الطاقة إلى صور نافعة، لكنه لا يمنع التيار منعاً تاماً.' }),
        Object.freeze({ label: '2 · لماذا الليد؟', text: 'كفاءة إضاءة أعلى وطاقة أقل، لأن الضوء ناتج عن انتقالات إلكترونية وإعادة اتحاد حوامل الشحنة، لا عن تسخين فتيل.' }),
        Object.freeze({ label: '3 · لماذا المصابيح على التفرع؟', text: 'كل فرع يحصل على فرق كمون المصدر نفسه، ويعمل مستقلاً عن الآخر. تعطل فرع لا يقطع بقية الفروع.' }),
      ]),
      note: 'هذه إجابات نموذجية؛ قارن أفكارك بها بعد كتابة محاولتك، لا قبلها.',
    }),
  }),

  'p120-problem1': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'q5a1', correct: 300, hint: 'على التسلسل: Req = R₁ + R₂ = 100 + 200.' }),
      Object.freeze({ id: 'q5a2', correct: 0.1, hint: 'I = U/Req = 30/300.' }),
      Object.freeze({ id: 'q5a3-u1', correct: 10, hint: 'U₁ = I×R₁ = 0.1×100.' }),
      Object.freeze({ id: 'q5a3-u2', correct: 20, hint: 'U₂ = I×R₂ = 0.1×200. تحقق أن مجموعهما 30 V.' }),
    ]),
    hint: 'المسألة تسلسل: اجمع المقاومتين، ثم أوجد التيار من قانون أوم للدارة، ثم اضرب التيار نفسه في كل مقاومة.',
    solution: Object.freeze({
      title: 'المسألة الأولى · ص120',
      steps: Object.freeze([
        Object.freeze({ label: 'المكافئة', tex: 'R_{eq}=100+200=300\\,\\Omega' }),
        Object.freeze({ label: 'التيار', tex: 'I=\\dfrac{30}{300}=0.1\\,\\mathrm A' }),
        Object.freeze({ label: 'الكمون على كل مقاومة', tex: 'U_{1}=0.1\\times100=10\\,\\mathrm V,\\quad U_{2}=0.1\\times200=20\\,\\mathrm V' }),
        Object.freeze({ label: 'التحقق', tex: '10+20=30\\,\\mathrm V' }),
      ]),
      note: 'التيار نفسه في المقاومتين لأنهما على التسلسل.',
    }),
  }),

  'p120-problem2': Object.freeze({
    items: Object.freeze([
      Object.freeze({ id: 'q5b1', correct: 20, hint: 'كل فرع عليه 40 V و2 A. استخدم R = U/I لكل فرع.' }),
      Object.freeze({ id: 'q5b2', correct: 8, hint: 'أربعة فروع متماثلة، كل فرع 2 A. اجمع التيارات، لا تقسمها.' }),
      Object.freeze({ id: 'q5b3', correct: 5, hint: 'من الدارة الكلية: Req = U/I = 40/8، أو للمتساويات Req = R/4.' }),
    ]),
    hint: 'في التفرع فرق الكمون نفسه على كل فرع (40 V). التيار الكلي مجموع تيارات الفروع، والمكافئة من U/I للدارة.',
    solution: Object.freeze({
      title: 'المسألة الثانية · ص120',
      steps: Object.freeze([
        Object.freeze({ label: 'مقاومة الفرع', tex: 'R=\\dfrac{U}{I_{branch}}=\\dfrac{40}{2}=20\\,\\Omega' }),
        Object.freeze({ label: 'التيار الكلي', tex: 'I=4\\times2=8\\,\\mathrm A' }),
        Object.freeze({ label: 'المكافئة', tex: 'R_{eq}=\\dfrac{40}{8}=5\\,\\Omega=\\dfrac{20}{4}' }),
      ]),
      note: 'المقاومات متماثلة، لذا يمكن استخدام Req = R/n للتحقق.',
    }),
  }),
});

/* Answer keys are also exported in a flat map so tests can assert every graded
 * item has exactly one key and every key is valid for its item type. */
export const UNIT2L4_ITEM_KEYS = Object.freeze(Object.fromEntries(
  Object.entries(UNIT2L4_ANSWERS).flatMap(([activityId, spec]) => spec.items
    .filter((item) => item.correct !== undefined)
    .map((item) => [`${activityId}#${item.id}`, Object.freeze({ activityId, ...item })])),
));
