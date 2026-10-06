import {
  V_F, V_F1, V_F2, V_F3, V_W,
  formula, calculation, ltrText, qty, tex,
} from './math.js';

const textBlock = (html) => ({ type: 'book', html });
const platformBlock = (title, html, kind = 'note') => ({ type: 'platform', title, html, kind });
const diagramBlock = (id) => ({ type: 'diagram', id });
const simulationBlock = (id) => ({ type: 'simulation', id });
const ref = (page, note) => `<span class="source-reference-inline"><bdi dir="ltr">Reference / See textbook — p${page}</bdi>${note ? ` · ${note}` : ''}</span>`;
const relation = (source, label) => tex(source, label);
const SAME_MOMENT = relation('F_{1}\\times d_{1}=F_{2}\\times d_{2}', 'F one times d one equals F two times d two');
const SAME_SUM = relation('F=F_{1}+F_{2}', 'F equals F one plus F two');
const OPPOSITE_DIFF = relation('F=F_{2}-F_{1}', 'F equals F two minus F one');
const P_A = tex('A', 'point A');
const P_B = tex('B', 'point B');
const P_C = tex('C', 'point C');
const SEGMENT_AB = tex('AB', 'segment A B');
const LINE_AB = tex('(AB)', 'line A B');

export const LESSON_2_PAGES = [
  {
    page: 63,
    navLabel: 'التمهيد والأهداف',
    heading: 'تمهيد الدرس',
    blocks: [
      textBlock(`
        <section class="source-title-block">
          <h3>القوى المتوازية</h3>
        </section>
        <section class="source-section">
          <h4>الأهداف:</h4>
          <ul class="source-list objectives-list">
            <li>يتعرّف القوى المتوازية.</li>
            <li>يحدّد عناصر محصلة قوتين متوازيتين بجهة واحدة.</li>
            <li>يحدّد عناصر محصلة قوتين متوازيتين بجهتين متعاكستين.</li>
            <li>يمثّل بالرسم القوى المتوازية ومحصلتها.</li>
          </ul>
        </section>
        <section class="source-section keywords-section">
          <h4>الكلمات المفتاحية:</h4>
          <p>قوتان متوازيتان.</p>
        </section>
        <section class="source-section">
          <h4>ألاحظ وأتساءل وأجيب:</h4>
          <div class="source-scene-grid" aria-label="المشهدان المرجعيان في الصفحة 63">
            <div class="source-scene-card"><span aria-hidden="true">⌁</span><strong>أرجوحة معلقة بسلسلتين</strong><small>تمثيل تعليمي للمشهد · راجع صورة الكتاب ص 63</small></div>
            <div class="source-scene-card"><span aria-hidden="true">⇉</span><strong>حصانان يشدان عربة</strong><small>تمثيل تعليمي للمشهد · راجع صورة الكتاب ص 63</small></div>
          </div>
          <ul class="source-list source-question-list">
            <li>كيف تكون قوى شد السلاسل للأرجوحة؟</li>
            <li>ما الذي يجعل الأرجوحة متوازنة؟</li>
            <li>كيف يشد الحصانان العربة؟</li>
          </ul>
        </section>
      `),
      platformBlock('من المشهد إلى الفكرة الفيزيائية', `
        <p>في الأرجوحة، تتجه قوتا شد السلسلتين على خطين منفصلين لهما الاتجاه العام نفسه ولا يتقاطعان. وفي العربة يمكن أن يشد الحصانان في اتجاهين متوازيين تقريباً. يركز الدرس على <strong>حوامل القوى</strong>: هل هي مستقيمات متوازية؟ ثم يسأل: إذا استبدلنا قوتين بقوة واحدة، فما شدتها وأين يقع حاملها؟</p>
        <p>سنميز دائماً بين حالتين: قوتان <strong>بجهة واحدة</strong> فتجمع الشدتان، وقوتان <strong>بجهتين متعاكستين</strong> فتطرح الشدة الأصغر من الأكبر. موضع المحصلة لا يختار عشوائياً؛ يحدده تساوي أثر الدوران حول حامل المحصلة.</p>
      `),
    ],
  },
  {
    page: 64,
    navLabel: 'التعريف والتجربة',
    heading: 'تعريف القوى المتوازية',
    blocks: [
      textBlock(`
        <section class="source-section">
          <h3>تعريف القوى المتوازية:</h3>
          <h4>أجرّب وأستنتج:</h4>
          <h5>أدوات التجربة:</h5>
          <p>${ref(64, 'اسم الأداة الأولى غير محسوم بصرياً')} — مسطرة خفيفة مثقبة ومدرّجة — جسم مزود بخطاف — ربائع — خيوط ربط — صفيحة الميكانو.</p>
          <h4>خطوات التجربة:</h4>
          <ol class="source-list experiment-list">
            <li>أعلّق جسماً في خطاف ربيعة، فيتأثر بقوة ثقله ${V_W}، ما حامل هذه القوة؟ وما جهتها؟</li>
            <li>أربط خطافي ربيعتين بخيطين باستخدام ${ref(64, 'اسم اللوح في هذه الخطوة غير محسوم بصرياً')}، وأعلّق كل منهما بطرفي مسطرة خفيفة، وأعلّق خطاف الجسم بالنقطة ${P_C} من المسطرة بحيث تبقى المسطرة أفقية متوازنة كما في الشكل.</li>
          </ol>
          <h4>أتساءل:</h4>
          <ul class="source-list">
            <li>هل لحاملي قوتي شد الربيعتين الاستقامة ذاتها؟</li>
            <li>هل يتغير حامل قوة ثقل الجسم في هذه الحالة عما كان عليه في الحالة الأولى؟</li>
            <li>أرسم على اللوح ثلاثة خطوط على امتداد كل ربيعة، تمثل كل منها حامل قوة، ثم أرفع الربائع والمسطرة، ماذا ألاحظ؟</li>
            <li>ما وضع الخطوط الممثلة لحوامل القوى الثلاث؟</li>
          </ul>
        </section>
        <section class="source-section source-conclusion">
          <h4>أستنتج:</h4>
          <p><strong>القوى المتوازية:</strong> هي القوى التي تكون حواملها مستقيمات متوازية.</p>
        </section>
      `),
      diagramBlock('parallel-definition'),
      platformBlock('قراءة التجربة من دون الخلط بين التوازي والاتزان', `
        <p>تبقى المسطرة أفقية عندما تتوازن تأثيرات القوى عليها، لكن تعريف «القوى المتوازية» نفسه لا يقول إن القوى متساوية أو أن محصلتها صفر؛ إنه يصف وضع حواملها فقط.</p>
        <p>في الرسم تمتد حوامل شد الربيعتين وحامل ثقل الجسم رأسياً. لا تتلاقى هذه الخطوط، بل تحافظ على المسافة بينها؛ لذلك هي مستقيمات متوازية.</p>
        <p><strong>خطأ شائع:</strong> القول إن القوتين متوازيتان لمجرد أن السهمين متجاوران. يجب أن يكون <em>الحاملان</em> مستقيمين متوازيين، وأن نحدد أيضاً هل الجهتان واحدة أم متعاكستان.</p>
      `),
    ],
  },
  {
    page: 65,
    navLabel: 'جهة واحدة',
    heading: 'محصلة قوتين بجهة واحدة',
    blocks: [
      textBlock(`
        <section class="source-section">
          <h3>محصلة قوتين متوازيتين بجهة واحدة:</h3>
          <h4>أجرّب وأستنتج:</h4>
          <h5>أدوات التجربة:</h5>
          <p>${ref(65, 'اسم الأداة الأولى يتبع قائمة ص 64')} — مسطرة خفيفة مثقبة ومدرّجة — أجسام مزودة بخطاف — ربائع — خيوط ربط.</p>
          <h4>خطوات التجربة:</h4>
          <ol class="source-list experiment-list">
            <li>أعلّق في طرفي مسطرة طولها ${relation('d','d')} ثقلين مختلفين ${relation('w_{1}=F_{1}','w one equals F one')}، ${relation('w_{2}=F_{2}','w two equals F two')}.</li>
            <li>أبحث عن النقطة ${P_C} التي أعلّق المسطرة عندها بوساطة ربيعة لتبقى المسطرة متوازنة أفقية.</li>
            <li>أسجّل دلالة مؤشر الربيعة ولتكن ${V_F3}. ماذا ألاحظ؟</li>
            <li>ألاحظ حامل ${V_F3} بالنسبة لحاملي الثقلين.</li>
            <li>أرسم حوامل القوى الثلاث مع المسطرة، وأرسم حامل القوة ${V_F} التي تعاكس مباشرة القوة ${V_F3}.</li>
            <li>أمثّل القوى بالرسم.</li>
            <li>أقيس بعد النقطة ${P_C} عن النقطة ${P_A} وليكن ${relation('d_{1}','d one')}.</li>
            <li>أقيس بعد النقطة ${P_C} عن النقطة ${P_B} وليكن ${relation('d_{2}','d two')}.</li>
            <li>أحسب الجداءين ${relation('F_{1}\\times d_{1}','F one times d one')} و${relation('F_{2}\\times d_{2}','F two times d two')}.</li>
          </ol>
        </section>
        <section class="source-section source-conclusion">
          <h4>أستنتج:</h4>
          <p>محصلة قوتين متوازيتين وبجهة واحدة هي قوة وحيدة ${V_F} عناصرها:</p>
          <ol class="source-list">
            <li><strong>الحامل:</strong> يوازي حاملي القوتين ${V_F1}، ${V_F2}.</li>
            <li><strong>الجهة:</strong> بجهة القوتين ${V_F1}، ${V_F2}.</li>
            <li><strong>الشدة:</strong> حاصل جمع شدتي القوتين: ${SAME_SUM}.</li>
            <li><strong>نقطة التأثير:</strong> تقع على القطعة المستقيمة ${SEGMENT_AB} الواصلة بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر ${V_F2} وتحقق العلاقة: ${SAME_MOMENT}.</li>
          </ol>
        </section>
      `),
      diagramBlock('same-sense'),
      simulationBlock('parallel-resultant-lab'),
      platformBlock('لماذا تقترب المحصلة من القوة الأكبر؟', `
        <p>لكل قوة قابلية لإدارة المسطرة حول نقطة ما. حول حامل المحصلة يجب أن يتعادل أثرا الدوران، لذلك يكون حاصل ضرب كل قوة في بعدها عن ذلك الحامل مساوياً للآخر: ${SAME_MOMENT}.</p>
        <p>إذا كانت ${V_F2} أكبر، فلا تحتاج إلى بعد كبير لتساوي أثر القوة الأصغر؛ لذلك تقع النقطة ${P_C} أقرب إليها. هذه العلاقة تحدد <strong>الموضع</strong>، بينما ${SAME_SUM} تحدد <strong>الشدة</strong>.</p>
      `),
    ],
  },
  {
    page: 66,
    navLabel: 'التناسب والتطبيق',
    heading: 'علاقات التناسب وتطبيق محلول',
    blocks: [
      textBlock(`
        <section class="source-section">
          <p>بترتيب العلاقة: ${SAME_MOMENT}</p>
          ${formula('\\frac{F_{1}}{d_{2}}=\\frac{F_{2}}{d_{1}}','F one over d two equals F two over d one')}
          <p>وحسب خواص التناسب نكتب:</p>
          ${formula('\\frac{F_{1}}{d_{2}}=\\frac{F_{2}}{d_{1}}=\\frac{F_{1}+F_{2}}{d_{2}+d_{1}}=\\frac{F}{d}','F one over d two equals F two over d one equals F one plus F two over d two plus d one equals F over d')}
          ${formula('\\frac{F_{1}}{d_{2}}=\\frac{F_{2}}{d_{1}}=\\frac{F}{d}','F one over d two equals F two over d one equals F over d')}
        </section>
        <section class="source-section question-lead">
          <h4>أفكّر:</h4>
          <p>أين تستقر النقطة ${P_C} إذا كانت القوتان متوازيتين وبجهة واحدة ومتساويتين شدة؟</p>
        </section>
        <section class="source-section worked-source-example">
          <h3>تطبيق محلول:</h3>
          <p>ساق مهملة الكتلة طولها ${relation('AB=0.5~\\mathrm{m}','AB equals 0.5 meters')} تؤثر في طرفيها قوتان متوازيتان وبجهة واحدة شدتهما: ${relation('F_{1}=20~\\mathrm{N}','F one equals 20 newtons')}، ${relation('F_{2}=30~\\mathrm{N}','F two equals 30 newtons')}، المطلوب:</p>
          <ol class="source-list">
            <li>احسب شدة محصلة هاتين القوتين.</li>
            <li>احسب بعد حامل القوة الثانية عن حامل المحصلة.</li>
            <li>اكتب عناصر المحصلة.</li>
            <li>ارسم كلاً من ${relation('(F_{1},F_{2},F,d_{1},d_{2})','F one, F two, F, d one, d two')}.</li>
          </ol>
          <h4>الحل:</h4>
          <p>1. حساب شدة ${V_F} محصلة القوتين:</p>
          ${calculation('F=F_{1}+F_{2}=20+30=50~\\mathrm{N}','F equals F one plus F two equals 20 plus 30 equals 50 newtons')}
        </section>
      `),
      platformBlock('فحص نتيجة «أفكر»', `
        <p>إذا كانت القوتان متساويتين، فإن ${relation('F_{1}=F_{2}','F one equals F two')}. وبما أن ${SAME_MOMENT}، فلا بد أن يكون ${relation('d_{1}=d_{2}','d one equals d two')}. إذن تستقر ${P_C} في منتصف المسافة بين القوتين.</p>
      `),
    ],
  },
  {
    page: 67,
    navLabel: 'التعاكس',
    heading: 'تتمة التطبيق والجهتان المتعاكستان',
    blocks: [
      textBlock(`
        <section class="source-section worked-source-example">
          <p>2. حساب ${relation('d_{2}','d two')} بعد حامل القوة الثانية عن حامل المحصلة:</p>
          ${formula('\\frac{F}{d}=\\frac{F_{1}}{d_{2}}=\\frac{F_{2}}{d_{1}}','F over d equals F one over d two equals F two over d one')}
          ${calculation('\\frac{50}{0.5}=\\frac{20}{d_{2}}\\quad\\Longrightarrow\\quad d_{2}=0.2~\\mathrm{m}','50 over 0.5 equals 20 over d two, therefore d two equals 0.2 meters')}
          <p>3. عناصر المحصلة:</p>
          <ul class="source-list">
            <li><strong>نقطة التأثير:</strong> تقع على القطعة المستقيمة ${SEGMENT_AB} الواصلة بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر ${V_F2}، وعلى بعد ${qty(0.2,'m')} من حامل القوة الثانية.</li>
            <li><strong>حاملها:</strong> يوازي حاملي القوتين ${V_F1}، ${V_F2}.</li>
            <li><strong>جهتها:</strong> بجهة القوتين ${V_F1}، ${V_F2}.</li>
            <li><strong>شدتها:</strong> ${relation('F=50~\\mathrm{N}','F equals 50 newtons')}.</li>
          </ul>
        </section>
        <section class="source-section">
          <h3>محصلة قوتين متوازيتين بجهتين متعاكستين:</h3>
          <p>في التجربة السابقة:</p>
          <ul class="source-list">
            <li>${ref(67, 'فعل التعليمة الأولى المتعلق بالثقل غير محسوم بصرياً')} ${relation('w_{1}=F_{1}','w one equals F one')}، ماذا ألاحظ؟</li>
            <li>أعيد الثقل ${V_F1}، ما دور هذا الثقل؟</li>
            <li>ماذا أسمّي هذا الثقل بالنسبة للقوتين ${V_F2}، ${V_F3}؟</li>
          </ul>
        </section>
        <section class="source-section source-conclusion">
          <h4>أستنتج:</h4>
          <p><strong>عناصر محصلة قوتين متوازيتين وبجهتين متعاكستين:</strong></p>
          <ul class="source-list">
            <li><strong>نقطة تأثيرها:</strong> تقع على امتداد القطعة المستقيمة ${LINE_AB} الواصلة بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر ${V_F2} وتحقق العلاقة: ${SAME_MOMENT}.</li>
            <li><strong>حاملها:</strong> يوازي حاملي القوتين ${V_F1}، ${V_F2}.</li>
            <li><strong>جهتها:</strong> بجهة القوة الأكبر ${V_F2}.</li>
            <li><strong>شدتها:</strong> حاصل طرح شدتي القوتين: ${OPPOSITE_DIFF}.</li>
          </ul>
        </section>
      `),
      diagramBlock('opposite-sense'),
      platformBlock('ما الذي يتغير عند عكس إحدى الجهتين؟', `
        <p>الشدة تصبح فرق القوتين بدلاً من مجموعهما، والجهة تكون جهة القوة الأكبر. أما نقطة التأثير فلا تبقى بين القوتين؛ تقع على امتداد الخط الواصل بينهما، خارج القطعة، ومن جهة القوة الأكبر.</p>
        <p><strong>حالة حدّية:</strong> إذا تساوت قوتان متوازيتان متعاكستان ولهما حاملان مختلفان، فإن قانون الفرق يعطي صفراً، لكنهما تصنعان أثراً دورانياً لا تمثله قوة محصلة مفردة محدودة الموضع. هذا تنبيه من المنصة، وليس نصاً مضافاً إلى استنتاج الكتاب.</p>
      `),
    ],
  },
  {
    page: 68,
    navLabel: 'تطبيق متعاكس',
    heading: 'تطبيق محلول: قوتان متعاكستان',
    blocks: [
      textBlock(`
        <section class="source-section worked-source-example">
          <h3>تطبيق محلول:</h3>
          <p>${ref(68, 'مطلع وصف الساق قبل تحديد النقطتين غير محسوم حرفياً')} النقطتان ${P_A}، ${P_B} البعد بينهما ${qty(60,'cm')}، تؤثر في كل من النقطتين ${P_A}، ${P_B} قوتان متوازيتان ومتعاكستان شدتهما ${relation('F_{1}=200~\\mathrm{N}','F one equals 200 newtons')}، ${relation('F_{2}=300~\\mathrm{N}','F two equals 300 newtons')}، المطلوب:</p>
          <ol class="source-list">
            <li>احسب شدة محصلة القوتين.</li>
            <li>اكتب عناصر محصلة القوتين.</li>
            <li>ارسم كلاً من القوى ${relation('(F_{1},F_{2},F,d_{1})','F one, F two, F, d one')}.</li>
          </ol>
          <h4>الحل:</h4>
          <p>1. حساب شدة محصلة القوتين:</p>
          ${calculation('F=F_{2}-F_{1}=300-200=100~\\mathrm{N}','F equals F two minus F one equals 300 minus 200 equals 100 newtons')}
          <p>2. عناصر محصلة القوتين:</p>
          <ul class="source-list">
            <li><strong>الحامل:</strong> يوازي حاملي القوتين.</li>
            <li><strong>الجهة:</strong> بجهة القوة الأكبر ${V_F2}.</li>
            <li><strong>الشدة:</strong> ${relation('F=100~\\mathrm{N}','F equals 100 newtons')}.</li>
            <li><strong>نقطة التأثير:</strong> تقع على المستقيم الواصل بين نقطتي تأثير القوتين وخارج القطعة المستقيمة ومن جهة القوة الأكبر وتحقق العلاقة:</li>
          </ul>
          ${formula('\\frac{F_{1}}{d_{2}}=\\frac{F_{2}}{d_{1}}=\\frac{F}{d}','F one over d two equals F two over d one equals F over d')}
          ${formula('\\frac{F_{2}}{d_{1}}=\\frac{F}{d}','F two over d one equals F over d')}
          ${calculation('\\frac{300}{d_{1}}=\\frac{100}{60}\\quad\\Longrightarrow\\quad d_{1}=180~\\mathrm{cm}','300 over d one equals 100 over 60, therefore d one equals 180 centimeters')}
        </section>
      `),
      diagramBlock('opposite-sense'),
      platformBlock('تحقق بالوحدة وبالموضع', `
        <p><strong>الوحدة:</strong> لأن المسافة المعطاة ${qty(60,'cm')} بقيت بالسنتيمتر، تظهر ${relation('d_{1}=180~\\mathrm{cm}','d one equals 180 centimeters')} بالوحدة نفسها.</p>
        <p><strong>الموضع:</strong> القيمة ${qty(180,'cm')} أكبر من المسافة ${qty(60,'cm')} بين القوتين، وهذا ينسجم مع وقوع المحصلة خارج القطعة ومن جهة القوة الأكبر.</p>
        <p><strong>التحقق بالعزوم:</strong> بعد القوة الأكبر عن المحصلة هو ${qty(120,'cm')}، ومن ثم ${relation('200\\times180=300\\times120','200 times 180 equals 300 times 120')}.</p>
      `),
    ],
  },
  {
    page: 69,
    navLabel: 'خلاصة الدرس',
    heading: 'تعلّمت',
    blocks: [
      textBlock(`
        <section class="source-section source-summary">
          <h3>تعلّمت:</h3>
          <ul class="source-list">
            <li><strong>القوى المتوازية:</strong> هي القوى التي تكون حواملها مستقيمات متوازية.</li>
            <li><strong>عناصر محصلة قوتين متوازيتين بجهة واحدة، ${relation('F_{2}>F_{1}','F two greater than F one')}:</strong>
              <ul>
                <li>نقطة تأثيرها: تقع على القطعة المستقيمة ${LINE_AB} الواصلة بين نقطتي تأثير القوتين وأقرب إلى القوة الأكبر ${V_F2} وتحقق العلاقة ${SAME_MOMENT}.</li>
                <li>حاملها: يوازي حاملي القوتين ${V_F1}، ${V_F2}.</li>
                <li>جهتها: بجهة القوتين ${V_F1}، ${V_F2}.</li>
                <li>شدتها: حاصل جمع شدتي القوتين: ${SAME_SUM}.</li>
              </ul>
            </li>
            <li><strong>عناصر محصلة قوتين متوازيتين وبجهتين متعاكستين، ${relation('F_{2}>F_{1}','F two greater than F one')}:</strong>
              <ul>
                <li>نقطة تأثيرها: تقع على امتداد القطعة المستقيمة ${LINE_AB} الواصلة بين نقطتي تأثير القوتين ومن جهة القوة الأكبر ${V_F2} وتحقق العلاقة ${SAME_MOMENT}.</li>
                <li>حاملها: يوازي حاملي القوتين ${V_F1}، ${V_F2}.</li>
                <li>جهتها: بجهة القوة الأكبر ${V_F2}.</li>
                <li>شدتها: حاصل طرح شدتي القوتين: ${OPPOSITE_DIFF}.</li>
              </ul>
            </li>
          </ul>
        </section>
      `),
      platformBlock('خريطة قرار سريعة', `
        <ol>
          <li>تحقق أولاً أن الحوامل متوازية.</li>
          <li>حدد الجهتين: واحدة أم متعاكستان؟</li>
          <li>للجهة الواحدة اجمع، وللجهتين المتعاكستين اطرح الأصغر من الأكبر.</li>
          <li>حدد جهة المحصلة، ثم موقعها من علاقة ${SAME_MOMENT}.</li>
          <li>تحقق: في الجهة الواحدة يقع الموقع بين القوتين، وفي الجهتين المتعاكستين يقع خارج القطعة من جهة القوة الأكبر.</li>
        </ol>
      `),
    ],
  },
  {
    page: 70,
    navLabel: 'اختبر نفسي',
    heading: 'اختبر نفسي',
    blocks: [
      textBlock(`
        <section class="source-section self-check-section">
          <h3>اختبر نفسي:</h3>
          <h4>السؤال الأول:</h4>
          <p>اختر الإجابة الصحيحة لكل مما يأتي:</p>
          <ol class="source-list question-list">
            <li class="question-item">محصلة قوتين متوازيتين وبجهة واحدة تحسب بالعلاقة:
              <ul class="option-list">
                <li>${relation('F=F_{1}+F_{2}','F equals F one plus F two')}</li>
                <li>${relation('F=F_{1}-F_{2}','F equals F one minus F two')}</li>
                <li>${relation('F=F_{1}\\times F_{2}','F equals F one times F two')}</li>
                <li>${relation('F=F_{1}\\div F_{2}','F equals F one divided by F two')}</li>
              </ul>
            </li>
            <li class="question-item">محصلة قوتين متوازيتين وبجهتين متعاكستين (حيث ${relation('F_{2}>F_{1}','F two greater than F one')}) تحسب بالعلاقة:
              <ul class="option-list">
                <li>${relation('F=F_{1}+F_{2}','F equals F one plus F two')}</li>
                <li>${relation('F=F_{1}-F_{2}','F equals F one minus F two')}</li>
                <li>${relation('F=F_{2}-F_{1}','F equals F two minus F one')}</li>
                <li>${relation('F=F_{1}\\div F_{2}','F equals F one divided by F two')}</li>
              </ul>
            </li>
            <li class="question-item">قوتان متوازيتان وبجهة واحدة شدتاهما ${qty(3,'N')} و${qty(4,'N')}، فإن شدة محصلتهما ${relation('F','F')} تساوي:
              <ul class="option-list"><li>${qty(1,'N')}</li><li>${qty(5,'N')}</li><li>${qty(7,'N')}</li><li>${qty(12,'N')}</li></ul>
            </li>
            <li class="question-item">${V_F1}، ${V_F2} قوتان شاقوليتان وبجهة واحدة، بُعدا حامليهما عن حامل المحصلة ${relation('d_{1},d_{2}','d one, d two')} على الترتيب، فالبعد بين حامليهما ${relation('d','d')} يُعطى بالعلاقة:
              <ul class="option-list">
                <li>${relation('d=d_{1}+d_{2}','d equals d one plus d two')}</li>
                <li>${relation('d=d_{1}-d_{2}','d equals d one minus d two')}</li>
                <li>${relation('d=d_{1}\\times d_{2}','d equals d one times d two')}</li>
                <li>${relation('d=d_{1}\\div d_{2}','d equals d one divided by d two')}</li>
              </ul>
            </li>
          </ol>
        </section>
        <section class="source-section">
          <h4>السؤال الثاني:</h4>
          <p>حل المسألتين الآتيتين:</p>
          <h5>المسألة الأولى:</h5>
          <p>قوتان شاقوليتان وبجهة واحدة شدتهما ${relation('F_{1}=40~\\mathrm{N}','F one equals 40 newtons')}، ${relation('F_{2}=10~\\mathrm{N}','F two equals 10 newtons')} تؤثران في طرفي مسطرة خفيفة أفقية، فإذا علمت أن بعد حامل القوة الأولى عن حامل المحصلة ${qty(30,'cm')}، المطلوب:</p>
          <ol class="source-list"><li>احسب شدة محصلة القوتين.</li><li>احسب طول المسطرة.</li><li>حدّد بالكتابة والرسم عناصر محصلة القوتين.</li></ol>
          <h5>المسألة الثانية:</h5>
          <p>قوتان شاقوليتان بجهتين متعاكستين شدتهما ${relation('F_{1}=80~\\mathrm{N}','F one equals 80 newtons')}، ${relation('F_{2}=20~\\mathrm{N}','F two equals 20 newtons')} تؤثران في طرفي مسطرة خفيفة أفقية طولها ${qty(40,'cm')}، المطلوب:</p>
          <ol class="source-list"><li>احسب شدة محصلة القوتين.</li><li>احسب بعد حامل القوة الثانية عن حامل المحصلة.</li><li>حدّد بالكتابة والرسم عناصر محصلة هاتين القوتين.</li></ol>
        </section>
      `),
      platformBlock('قبل الحل', `
        <p>أسئلة الكتاب أعلاه محفوظة بقيمها ووحداتها. جرّب الحل كتابةً ورسماً أولاً، ثم راجع الحل الكامل المتدرج في منطقة المعلم. أما اختبار الدرس المستقل فيحتوي على أسئلة جديدة لا تكرر هذه الصياغات.</p>
      `),
    ],
  },
];

export const LESSON_2_META = Object.freeze({
  unit: 'الوحدة الأولى — الحركة والقوى',
  lesson: 'الدرس 2 — القوى المتوازية',
  pages: '63–70',
});
