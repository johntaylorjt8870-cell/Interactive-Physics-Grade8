import { DIAGRAMS } from './diagrams.js';
import {
  formula,
  V_F1,
  V_F2,
  V_F,
  V_F_PRIME,
  V_W,
  V_R,
  V_OM,
  V_OX,
  V_OY,
  S_F1,
  S_F2,
  S_F,
  S_F_PRIME,
  LATIN_A,
} from './math.js';
import { SELF_CHECK_ANSWERS } from './self-check-answers.js';
import { PRACTICE_DECK } from './lesson-1-practice-data.js';

const eqLawCosines = formula(
  'F=\\sqrt{4^{2}+3^{2}+2(4)(3)\\cos 60^{\\circ}}=\\sqrt{16+9+12}=\\sqrt{37}\\approx 6.08\\,\\mathrm{N}',
  'F equals square root of 37 approximately 6.08 newtons',
);
const eqPyth59 = formula(
  'F=\\sqrt{60^{2}+80^{2}}=\\sqrt{3600+6400}=\\sqrt{10000}=100\\,\\mathrm{N}',
  'F equals 100 newtons',
);
const eqProb1 = formula(
  'F_{1}=\\sqrt{F^{2}-F_{2}^{2}}=\\sqrt{15^{2}-12^{2}}=\\sqrt{225-144}=\\sqrt{81}=9\\,\\mathrm{N}',
  'F1 equals 9 newtons',
);
const eqProb2 = formula(
  'F=\\sqrt{30^{2}+40^{2}}=\\sqrt{900+1600}=\\sqrt{2500}=50\\,\\mathrm{N}',
  'F equals 50 newtons',
);

export function renderTeacherContent() {
  return `
    <header class="teacher-workspace-header">
      <div>
        <p class="teacher-workspace-eyebrow">دليل المعلم الشامل · الوحدة الأولى · الدرس الأول (ص 55–62)</p>
        <h2 id="teacher-workspace-heading" tabindex="-1">القوى المتلاقية وتحليل القوة — التوجيه التربوي والحلول الكاملة</h2>
        <p>مرجع علمي وتربوي متكامل للمعلم يغطي الأهداف، التأسيس المفهومي، حلول جميع الأنشطة والأسئلة والمسائل بفقراتها الفرعية، معالجة الأخطاء الشائعة، وتوظيف المحاكيات الأربع.</p>
      </div>
      <button type="button" class="teacher-logout-button" data-teacher-logout>إغلاق منطقة المعلم</button>
    </header>

    <div class="teacher-limit" role="note">
      <strong>إفصاح معماري صريح حول بوابة كلمة المرور:</strong> تعمل هذه المنصة كموقع ويب ثابت (Static Client-Side Web App) بلا خادم خلفي؛ وتؤدي كلمة المرور (<bdi dir="ltr">PBKDF2-SHA256</bdi> مع التحميل الكسول لوحدة المعلم) وظيفة <strong>الفصل التربوي والتنظيمي</strong> عن واجهة الطالب، ولا يجوز اعتبارها حماية خادم خلفية (Server-Side Security) ضد الفحص التقني لملفات الواجهة.
    </div>

    <div class="teacher-workspace-layout">
      <nav class="teacher-nav" aria-label="أقسام دليل المعلم">
        <p class="teacher-nav-title">أقسام الدليل</p>
        <a href="#t-overview">١. الأهداف وخطة التدريس</a>
        <a href="#t-scientific-notes">٢. الشرح المعمّق وتدقيق المصدر</a>
        <a href="#t-activities-solutions">٣. حلول الأنشطة والأمثلة (ص 55–60)</a>
        <a href="#t-selfcheck-solutions">٤. حلول أختبر نفسي والمسألتين (ص 61–62)</a>
        <a href="#t-practice-key">٥. مفتاح بنك التدريب المتدرج</a>
        <a href="#t-misconceptions">٦. معالجة الأخطاء الشائعة</a>
        <a href="#t-simulations-guide">٧. دليل توظيف المحاكيات</a>
        <a href="#t-source-matrix">٨. مصفوفة التحقق من شمول المصدر</a>
      </nav>

      <div class="teacher-content">
        <!-- Section 1 -->
        <section class="teacher-section" id="t-overview">
          <div class="teacher-section-heading">
            <div>
              <p class="teacher-section-kicker">القسم الأول</p>
              <h3>الأهداف التعليمية، الكلمات المفتاحية، وخطة توزيع الحصص</h3>
            </div>
            <span class="teacher-page-ref">p55–p62</span>
          </div>

          <div class="teacher-subsection">
            <h4>أهداف التعلّم الرسمية (المصدر ص 55) ومؤشرات الأداء</h4>
            <ul class="teacher-objectives">
              <li><strong>يتعرّف القوى المتلاقية:</strong> يتحقق هندسياً وتجريبياً من التقاء حوامل القوى في نقطة واحدة <bdi dir="ltr">O</bdi> ويميّزها عن القوى المتوازية.</li>
              <li><strong>يوضّح بالرسم القوى المتلاقية:</strong> يختار مقياس رسم صريحاً (<bdi dir="ltr">1 cm : k N</bdi>) ويمثّل العناصر الأربعة لشعاع القوة بدقة.</li>
              <li><strong>يحدّد عناصر محصلة قوتين متلاقيتين:</strong> ينشئ متوازي الأضلاع في الحالة العامة والمستطيل/المربع عند التعامد ويطبق نظرية فيثاغورث.</li>
              <li><strong>يحلّل القوة إلى مركبتين متعامدتين:</strong> يسقط شعاع القوة عمودياً على محورين متعامدين ويفسر أثر الثقل على مستوى مائل أملس.</li>
            </ul>
            <p><strong>الكلمات المفتاحية (ص 55):</strong> <span class="teacher-keyword-line">القوى المتلاقية – تحليل القوّة.</span></p>
          </div>

          <div class="teacher-subsection">
            <h4>خطة التدريس المقترحة (حصتان دراسيتان × ٤٥ دقيقة)</h4>
            <ul>
              <li><strong>الحصة الأولى (المراحل ١–٤ · ص 55–58):</strong> تمهيد القوة ككمية شعاعية + استكشاف المظلّي (٧ د) ← تجربة لوح الربائع المغناطيسي والمحاكاة الأولى (١٣ د) ← استنتاج قاعدة متوازي الأضلاع من التوازن والمحاكاة الثانية (١٥ د) ← حل مثال ص 58 بالمسطرة والمقياس (١٠ د).</li>
              <li><strong>الحصة الثانية (المراحل ٥–٨ · ص 58–62):</strong> حالة التعامد ومثال ص 59 بالرسم وفيثاغورث مع المحاكاة الثالثة (١٢ د) ← تحليل القوة ونشاط المستوى المائل الأملس مع المحاكاة الرابعة (١٥ د) ← خريطة المفاهيم وحلّ «أختبر نفسي» ومسألتَي ص 62 (١٨ د).</li>
            </ul>
          </div>
        </section>

        <!-- Section 2 -->
        <section class="teacher-section" id="t-scientific-notes">
          <div class="teacher-section-heading">
            <div>
              <p class="teacher-section-kicker">القسم الثاني</p>
              <h3>ملاحظات علمية معمّقة وتوثيق التدقيق المصدري</h3>
            </div>
            <span class="teacher-page-ref">Audit Notes</span>
          </div>

          <div class="teacher-subsection">
            <h4>١. الإطار الفيزيائي الدقيق للمعلم</h4>
            <ul>
              <li><strong>القوة شعاع مقيد بالحامل على الجسم الصلب:</strong> على الرغم من أن القوى قد تؤثر في نقاط مادية متباعدة على جسم صلب (كربط الخيوط بحافات الجسم)، فإن خاصية انزلاق الشعاع على حامله في الميكانيك الصلب تسمح بنقل نقاط التأثير على امتداد الحوامل إلى نقطة تلاقيها <bdi dir="ltr">O</bdi> متى كانت الحوامل متلاقية.</li>
              <li><strong>المثال الأول (ص 58 — الزاوية <bdi dir="ltr">60°</bdi>):</strong> في منهج الصف الثامن يعتمد القياس البياني بالمسطرة (<bdi dir="ltr">OM ≈ 6 cm , F = 6 N</bdi>) لأن علاقة جيب التمام غير مقررة في هذا الصف. وللمعلم: القيمة التحليلية الدقيقة هي:
                <div class="teacher-formula">${eqLawCosines}</div>
                وتميل المحصلة عن ${V_F1} بزاوية <bdi dir="ltr">arctan((3 sin 60°)/(4 + 3 cos 60°)) ≈ 25.3°</bdi>. كما ننبّه المعلم إلى أن الرسم المطبوع في الكتاب المدرسي ص 58 تخطيطي غير محجّم بالسنتيمتر الحقيقي، بينما أعيد رسمه في المنصة بنسبة <bdi dir="ltr">4 : 3</bdi> وزاوية <bdi dir="ltr">60°</bdi> دقيقة.</li>
              <li><strong>نشاط المستوى المائل الأملس (ص 60):</strong> أملس تعني إهمال الاحتكاك، لذا يكون ردّ الفعل ${V_R} عمودياً تماماً على سطح المستوي، فيوازن المركبة الناظمية للثقل (<bdi dir="ltr">R = F₂ = w cos a</bdi>)، وتبقى المركبة الموازية (<bdi dir="ltr">F₁ = w sin a</bdi>) محصلةً وحيدةً تسبب تسارع الجسم نحو أسفل المستوي. وقد التزمنا بالرمز اللاتيني الصغير المطبوع في الكتاب (${LATIN_A}) لزاوية الميل.</li>
            </ul>
          </div>

          <div class="teacher-subsection">
            <h4>٢. توثيق التدقيق المصدري من الصور المدرسية عالية الدقة (ص 55–62)</h4>
            <ul>
              <li><strong>ترقيم الوحدة:</strong> يظهر في رأس ص 55 «الوحدة الثانية: الحركة والقوى» لأن الكتاب الوزاري يجمع الفيزياء والكيمياء معاً؛ وتُعتمَد «الوحدة الأولى: الحركة والقوى» في فهرس الفيزياء المستقل في المنصة.</li>
              <li><strong>أدوات ص 56:</strong> نص الكتاب الواضح هو: «لوح الربائع المغناطيسي - ربائع - جسم مزود بخطاف - خيوط ربط».</li>
              <li><strong>الفقرة 5 من أولاً (ص 62):</strong> ورد في بدائل الطبعة المدرسية الرمز <bdi dir="ltr">F = 90 N, F = 30 N, ...</bdi> سهواً مطبعياً مع أن نص السؤال يطلب صراحةً «شدة القوة الثانية <bdi dir="ltr">F₂</bdi>»، وقد نُبِّه الطالب والمعلم إلى ذلك بشفافية دون تحريف الأصل.</li>
              <li><strong>المسألة الأولى — الطلبان 3 و4 (ص 62):</strong> الرمز المطبوع في الكتاب للقوة الثالثة الموازِنة هو ${V_F_PRIME} (فتحة فوق <bdi dir="ltr">F</bdi>) ومجموعة التمثيل في الطلب الرابع هي <bdi dir="ltr">(${V_F_PRIME}, ${V_F}, ${V_F1}, ${V_F2})</bdi>، فعناصر ${V_F_PRIME} متعيّنة بالكامل من شرط التوازن (<bdi dir="ltr">${S_F_PRIME} = 15 N</bdi> وبجهة معاكسة لـ ${V_F} على الحامل <bdi dir="ltr">OM</bdi>).</li>
            </ul>
          </div>
        </section>

        <!-- Section 3 -->
        <section class="teacher-section" id="t-activities-solutions">
          <div class="teacher-section-heading">
            <div>
              <p class="teacher-section-kicker">القسم الثالث</p>
              <h3>حلول جميع أنشطة الاستكشاف والتجارب والأمثلة (ص 55–60)</h3>
            </div>
            <span class="teacher-page-ref">p55–p60</span>
          </div>

          <div class="teacher-subsection" id="teacher-p55">
            <h4>١. حلول أسئلة استكشاف مشهد المظلّي (ص 55)</h4>
            <div class="teacher-book-answer">
              <span class="teacher-answer-chip">الإجابات النموذجية لأسئلة ص 55</span>
              <div class="teacher-answer-body">
                <ol>
                  <li><strong>القوى المؤثرة في المظلّي:</strong> قوة ثقله الشاقولية نحو الأسفل ${V_W}، وقوى شدّ حبال المظلة المائلة نحو الأعلى (الناقلة لقوة مقاومة الهواء في قبة المظلة).</li>
                  <li><strong>تحديد حامل كل قوة:</strong> حامل كل قوة شدّ ينطبق على استقامة الخيط المشدود الموافق لها، وحامل قوة ثقل المظلّي هو المستقيم الشاقولي المار بمركز ثقله.</li>
                  <li><strong>هل تتلاقى الحوامل في نقطة واحدة؟</strong> نعم؛ تلتقي حبال التعليق وامتداد الحامل الشاقولي للثقل في نقطة تجمع مشتركة واحدة <bdi dir="ltr">O</bdi>، ولذلك تُعدّ قوى متلاقية.</li>
                </ol>
              </div>
            </div>
          </div>

          <div class="teacher-subsection" id="teacher-p56">
            <h4>٢. إجابات وتفسيرات تجربة لوح الربائع المغناطيسي (ص 56)</h4>
            <div class="teacher-book-answer">
              <span class="teacher-answer-chip">إجابات خطوات التجربة ص 56</span>
              <div class="teacher-answer-body">
                <ul>
                  <li><strong>الخطوة 2 (ربيعة واحدة):</strong> حامل قوة الثقل وحامل قوة توتر نابض الربيعة منطبقان على المستقيم الشاقولي الواحد، وجهتاهما متعاكستان، وشدتاهما متساويتان.</li>
                  <li><strong>الخطوة 4 (ربيعتان مائلتان):</strong> حاملا قوتي توتر نابضي الربيعتين ليس لهما الاستقامة ذاتها (كل منهما مائل بزاوية نحو ربيعته)، وحامل الثقل شاقولي.</li>
                  <li><strong>الخطوة 6 (بعد رفع الربيعتين والجسم):</strong> نلاحظ على اللوح ثلاثة مستقيمات مرسومة تتقاطع جميعاً في النقطة الواحدة المشتركة <bdi dir="ltr">O</bdi>.</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="teacher-subsection" id="teacher-p57">
            <h4>٣. إجابة «أتساءل» واستنتاج متوازي الأضلاع (ص 57)</h4>
            <p><strong>الجواب العلمي:</strong> نعم، يمكن استبدال قوتين متلاقيتين ${V_F1} و${V_F2} بقوة وحيدة هي محصلتهما ${V_F}. ولأن الجسم متوازن تحت تأثير ${V_F1} و${V_F2} والثقل ${V_W}، فإن المحصلة المكافئة للربيعتين يجب أن توازن ${V_W} (تساويها شدةً وتعاكسها جهةً شاقولياً للأعلى)، وعند الرسم بالمقياس نجدها تنطبق على القطر <bdi dir="ltr">OM</bdi> في متوازي الأضلاع.</p>
          </div>

          <div class="teacher-subsection" id="teacher-p60-resolution">
            <h4>٤. إجابة «أتساءل» في تحليل القوة (ص 60)</h4>
            <p><strong>الجواب العلمي:</strong> نعم، كل قوة مائلة ${V_OM} يمكن استبدالها بمركبتين متعامدتين ${V_OX} و${V_OY} نحصل عليهما بإسقاط نهاية الشعاع <bdi dir="ltr">M</bdi> عمودياً على المحورين المتعامدين، فيتشكل مستطيل قطره القوة الأصلية.</p>
          </div>

          <div class="teacher-subsection" id="teacher-p60-incline">
            <h4>٥. الحل الكامل لنشاط المستوى المائل الأملس (ص 60)</h4>
            <div class="teacher-book-answer">
              <span class="teacher-answer-chip">حل نشاط ص 60 بشقّيه</span>
              <div class="teacher-answer-body">
                <ol>
                  <li><strong>تحليل قوة الثقل ${V_W}:</strong> نرسم من مركز ثقل الجسم <bdi dir="ltr">O</bdi> محورين متعامدين: أحدهما موازٍ لسطح المستوي المائل والآخر عمودي عليه. نسقط نهاية شعاع الثقل الشاقولي ${V_W} عمودياً على المحور الموازي فنحصل على المركبة الأولى ${V_F1} المتجهة نحو أسفل المستوي، ونسقطها عمودياً على المحور الناظم فنحصل على المركبة الثانية ${V_F2} الضاغطة عمودياً على المستوي.</li>
                  <li><strong>نوع الشكل الهندسي ودور المركبتين:</strong> الشكل الهندسي الناتج هو <strong>مستطيل</strong> لأن المركبتين متعامدتان (<bdi dir="ltr">90°</bdi>) وقطره هو شعاع الثقل ${V_W} (ويصبح المستطيل <strong>مربعاً</strong> في الحالة الخاصة <bdi dir="ltr">a = 45°</bdi> حيث تتساوى <bdi dir="ltr">F₁ = F₂</bdi>). فيزيائياً: توازن ردّ الفعل العمودية ${V_R} المركبةَ العمودية ${V_F2}، وتبقى المركبة الموازية ${V_F1} غير متوازنة فتسبّب انزلاق الجسم على المستوي الأملس.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4 -->
        <section class="teacher-section" id="t-selfcheck-solutions">
          <div class="teacher-section-heading">
            <div>
              <p class="teacher-section-kicker">القسم الرابع</p>
              <h3>الحلول الكاملة لـ «أختبر نفسي» والمسألتين (ص 61–62)</h3>
            </div>
            <span class="teacher-page-ref">p61–p62</span>
          </div>

          <div class="teacher-subsection">
            <h4>أولاً: حلول الاختيار من متعدد (الفقرات ١–٦) مع تعليل البدائل</h4>
            <ol>
              ${['61-1', '61-2', '62-1', '62-2', '62-3', '62-4'].map((key) => {
                const item = SELF_CHECK_ANSWERS[key];
                return `<li>
                  <div class="teacher-book-answer">
                    <span class="teacher-answer-chip">مفتاح الفقرة (${key}): ${item.answerLabel}</span>
                    <div class="teacher-answer-body"><p>${item.explanation}</p></div>
                  </div>
                </li>`;
              }).join('')}
            </ol>
          </div>

          <div class="teacher-subsection">
            <h4>ثانياً — حل المسألة الأولى كاملاً (ص 62) بفقراتها الأربع</h4>
            <p class="teacher-page-question"><strong>المعطيات:</strong> قوتان متلاقيتان في <bdi dir="ltr">O</bdi> حاملاهما متعامدان (<bdi dir="ltr">90°</bdi>)، <bdi dir="ltr">${S_F2} = 12 N</bdi>، وشدة المحصلة <bdi dir="ltr">${S_F} = 15 N</bdi>.</p>

            <div class="teacher-book-answer">
              <span class="teacher-answer-chip">الحل النموذجي المفصّل للمسألة الأولى</span>
              <div class="teacher-answer-body">
                <ol>
                  <li><strong>حساب شدة القوة الأولى ${V_F1}:</strong> لأن حاملي القوتين متعامدان فالشكل مستطيل وقطره المحصلة ${V_F} وتر لمثلث قائم الزاوية. من نظرية فيثاغورث <bdi dir="ltr">F² = F₁² + F₂²</bdi> نعزل <bdi dir="ltr">F₁</bdi>:
                    <div class="teacher-formula">${eqProb1}</div>
                  </li>
                  <li><strong>عناصر محصلة القوتين ${V_F}:</strong>
                    <ul>
                      <li><strong>نقطة التأثير:</strong> نقطة التلاقي المشتركة <bdi dir="ltr">O</bdi>.</li>
                      <li><strong>الحامل:</strong> المستقيم الحامل لقطر المستطيل <bdi dir="ltr">OM</bdi> المنشأ على الشعاعين ${V_F1} و${V_F2} (وللمعلم: يصنع زاوية <bdi dir="ltr">arctan(12/9) ≈ 53.1°</bdi> مع حامل ${V_F1} و<bdi dir="ltr">36.9°</bdi> مع حامل ${V_F2}).</li>
                      <li><strong>الجهة:</strong> من النقطة <bdi dir="ltr">O</bdi> نحو الرأس المقابل <bdi dir="ltr">M</bdi> بين حاملي القوتين.</li>
                      <li><strong>الشدة:</strong> <bdi dir="ltr">${S_F} = 15 N</bdi>.</li>
                    </ul>
                  </li>
                  <li><strong>عناصر القوة الثالثة الموازِنة ${V_F_PRIME}:</strong> لكي تتوازن ${V_F_PRIME} مع القوتين ${V_F1} و${V_F2} في النقطة <bdi dir="ltr">O</bdi> يجب أن توازن محصلتهما ${V_F}، فتكون عناصرها:
                    <ul>
                      <li><strong>نقطة التأثير:</strong> النقطة <bdi dir="ltr">O</bdi> نفسها.</li>
                      <li><strong>الحامل:</strong> المستقيم القطري <bdi dir="ltr">OM</bdi> نفسه (منطبق على حامل المحصلة ${V_F}).</li>
                      <li><strong>الجهة:</strong> معاكسة تماماً لجهة المحصلة ${V_F} ابتداءً من <bdi dir="ltr">O</bdi> نحو الخارج.</li>
                      <li><strong>الشدة:</strong> <bdi dir="ltr">${S_F_PRIME} = ${S_F} = 15 N</bdi>.</li>
                    </ul>
                  </li>
                  <li><strong>تمثيل القوى الأربع <bdi dir="ltr">(${V_F_PRIME}, ${V_F}, ${V_F1}, ${V_F2})</bdi> بمقياس رسم مناسب:</strong>
                    بما أن الشدات <bdi dir="ltr">(9 N, 12 N, 15 N, 15 N)</bdi> قواسمها المشتركة تقبل القسمة على <bdi dir="ltr">3</bdi>، نختار المقياس: <strong>كل <bdi dir="ltr">1 cm</bdi> يقابل <bdi dir="ltr">3 N</bdi></strong> (ويقبل من الطالب أي مقياس سليم آخر مثل <bdi dir="ltr">1 cm : 5 N</bdi> يعطي <bdi dir="ltr">1.8 cm, 2.4 cm, 3 cm</bdi>):
                    <ul>
                      <li>طول شعاع ${V_F1}: <bdi dir="ltr">9 ÷ 3 = 3 cm</bdi>.</li>
                      <li>طول شعاع ${V_F2} العمودي عليه: <bdi dir="ltr">12 ÷ 3 = 4 cm</bdi>.</li>
                      <li>طول قطر المحصلة ${V_F}: <bdi dir="ltr">15 ÷ 3 = 5 cm</bdi> من <bdi dir="ltr">O</bdi> إلى <bdi dir="ltr">M</bdi>.</li>
                      <li>طول شعاع الموازنة ${V_F_PRIME}: <bdi dir="ltr">15 ÷ 3 = 5 cm</bdi> من <bdi dir="ltr">O</bdi> على امتداد <bdi dir="ltr">MO</bdi> بالجهة المعاكسة.</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
            <div class="diagram-svg-wrap">${DIAGRAMS['problem1-scale'].svg}</div>
          </div>

          <div class="teacher-subsection">
            <h4>ثالثاً — حل المسألة الثانية كاملاً: حمل الحقيبة بحبلين متعامدين (ص 62)</h4>
            <p class="teacher-page-question"><strong>المعطيات:</strong> حبلان متعامدان (<bdi dir="ltr">90°</bdi>) مربوطان بالحقيبة عند <bdi dir="ltr">O</bdi>؛ <bdi dir="ltr">${S_F1} = 30 N</bdi> و<bdi dir="ltr">${S_F2} = 40 N</bdi>.</p>

            <div class="teacher-book-answer">
              <span class="teacher-answer-chip">الحل النموذجي المفصّل للمسألة الثانية</span>
              <div class="teacher-answer-body">
                <ol>
                  <li><strong>حساب شدة المحصلة ${V_F}:</strong> لتعامد حاملي قوتي الشد نطبق نظرية فيثاغورث:
                    <div class="teacher-formula">${eqProb2}</div>
                  </li>
                  <li><strong>تحديد عناصر المحصلة ${V_F}:</strong>
                    <ul>
                      <li><strong>نقطة التأثير:</strong> عقدة التقاء الحبلين في الحقيبة <bdi dir="ltr">O</bdi>.</li>
                      <li><strong>الحامل:</strong> المستقيم الحامل لقطر المستطيل <bdi dir="ltr">OM</bdi> المنشأ على شعاعي القوتين (وللمعلم: يميل بزاوية <bdi dir="ltr">53.1°</bdi> عن حامل القوة <bdi dir="ltr">30 N</bdi> و<bdi dir="ltr">36.9°</bdi> عن حامل القوة <bdi dir="ltr">40 N</bdi>).</li>
                      <li><strong>الجهة:</strong> من <bdi dir="ltr">O</bdi> نحو الرأس المقابل <bdi dir="ltr">M</bdi> بين الحبلين في جهة سحب الشخصين.</li>
                      <li><strong>الشدة:</strong> <bdi dir="ltr">${S_F} = 50 N</bdi>.</li>
                    </ul>
                  </li>
                  <li><strong>التمثيل بمقياس رسم مناسب:</strong> نختار <strong>كل <bdi dir="ltr">1 cm</bdi> يقابل <bdi dir="ltr">10 N</bdi></strong>، فنرسم ${V_F1} بطول <bdi dir="ltr">3 cm</bdi>، و${V_F2} عمودياً عليه بطول <bdi dir="ltr">4 cm</bdi>، ونكمل المستطيل فيكون القطر <bdi dir="ltr">OM</bdi> بطول <bdi dir="ltr">5 cm</bdi> ممثلاً لـ <bdi dir="ltr">50 N</bdi>. (ملاحظة تربوية: لا يفرض نص المسألة اتجاهاً مطلقاً للحبلين في الفراغ، فيُقبل رسم الضلعين المتعامدين أفقياً/شاقولياً أو مائلين بزاوية قائمة بينهما).</li>
                </ol>
              </div>
            </div>
            <div class="diagram-svg-wrap">${DIAGRAMS['problem2-scale'].svg}</div>
          </div>
        </section>

        <!-- Section 5 -->
        <section class="teacher-section" id="t-practice-key">
          <div class="teacher-section-heading">
            <div>
              <p class="teacher-section-kicker">القسم الخامس</p>
              <h3>مفتاح إجابات بنك التدريب التفاعلي المتدرج (١٠ تمارين إثرائية)</h3>
            </div>
            <span class="teacher-page-ref">Formative Bank</span>
          </div>
          <div class="teacher-subsection">
            <ol>
              ${PRACTICE_DECK.map((item) => {
                const rightOpt = item.options.find((o) => o.id === item.correct);
                return `<li><strong>(${item.kindLabel})</strong> ${item.prompt}<br />
                  <span class="teacher-keyword-line">الجواب الصحيح: ${item.correct}) ${rightOpt?.label ?? ''}</span></li>`;
              }).join('')}
            </ol>
          </div>
        </section>

        <!-- Section 6 -->
        <section class="teacher-section" id="t-misconceptions">
          <div class="teacher-section-heading">
            <div>
              <p class="teacher-section-kicker">القسم السادس</p>
              <h3>تشخيص الأخطاء الشائعة لدى الطلاب واستراتيجيات المعالجة</h3>
            </div>
            <span class="teacher-page-ref">Pedagogy</span>
          </div>

          <div class="teacher-subsection">
            <div class="teacher-misconception">
              <strong>١. جمع الشدات عددياً (<bdi dir="ltr">F = F₁ + F₂</bdi>) أياً كانت الزاوية:</strong> يظهر في كتابة <bdi dir="ltr">28 N</bdi> بدلاً من <bdi dir="ltr">20 N</bdi> أو <bdi dir="ltr">70 N</bdi> في مسألة الحقيبة. <em>المعالجة:</em> اطلب من الطالب ضبط <bdi dir="ltr">6 N</bdi> و<bdi dir="ltr">4 N</bdi> في المحاكاة الثانية ثم تحريك الزاوية من <bdi dir="ltr">0°</bdi> إلى <bdi dir="ltr">180°</bdi> ليلاحظ أن <bdi dir="ltr">10 N</bdi> لا تتحقق إلا عند <bdi dir="ltr">0°</bdi>.
            </div>
            <div class="teacher-misconception">
              <strong>٢. جمع المربعين بدل طرحهما عند إيجاد مركبة مجهولة:</strong> يظهر في المسألة الأولى (<bdi dir="ltr">√(15² + 12²)</bdi> بدلاً من <bdi dir="ltr">√(15² − 12²)</bdi>). <em>المعالجة:</em> ذكّر الطالب بأن الوتر (المحصلة) هو أطول أضلاع المثلث القائم دائماً، فإذا كان المعلوم هو الوتر وجب أن تكون القوة المجهولة أصغر منه.
            </div>
            <div class="teacher-misconception">
              <strong>٣. الطرح العددي المباشر من دون تربيع وجذر (<bdi dir="ltr">15 − 12 = 3 N</bdi>):</strong> شائع جداً في الفقرة 5 والمسألة 1. <em>المعالجة:</em> وضّح أن الطرح المباشر يخص الزاوية <bdi dir="ltr">180°</bdi> فقط، أما التعامد فيخضع لعلاقة المساحات المربعة في فيثاغورث.
            </div>
            <div class="teacher-misconception">
              <strong>٤. الخلط بين المربّع والمستطيل والمعيّن:</strong> يظن بعض الطلاب أن كل قوتين متعامدتين تشكلان مربعاً أو أن كل قوتين متساويتين تشكلان مربعاً. <em>المعالجة:</em> استعمل مخطط الحالات الأربع في ص 58 وجدول المقارنة في ص 61 لإثبات أن المربع يشترط اجتماع التعامد وتساوي الشدتين معاً.
            </div>
            <div class="teacher-misconception">
              <strong>٥. الخلط بين المحصلة ${V_F} وقوة الموازنة ${V_F_PRIME}:</strong> يرسم الطالب ${V_F_PRIME} منطبقةً على ${V_F} بالجهة نفسها. <em>المعالجة:</em> فعّل خانة «أضف قوة الموازنة ${V_F_PRIME}» في المحاكاة الثانية ليرى السهمين متعاكسين من <bdi dir="ltr">O</bdi>.
            </div>
            <div class="teacher-misconception">
              <strong>٦. رسم قوة الثقل عموديةً على المستوى المائل بدلاً من شاقولية:</strong> خطأ كلاسيكي في نشاط ص 60. <em>المعالجة:</em> استخدم تبويب المستوى المائل في المحاكاة الرابعة وأمل السطح أمام الطلاب مع مراقبة بقاء السهم الأحمر ${V_W} شاقولياً دائماً نحو مركز الأرض.
            </div>
          </div>
        </section>

        <!-- Section 7 -->
        <section class="teacher-section" id="t-simulations-guide">
          <div class="teacher-section-heading">
            <div>
              <p class="teacher-section-kicker">القسم السابع</p>
              <h3>دليل توظيف المحاكيات التفاعلية الأربع وحدود كل نموذج</h3>
            </div>
            <span class="teacher-page-ref">4 Interactive Labs</span>
          </div>

          <div class="teacher-subsection">
            <div class="teacher-simulation-note" data-simulation-reference="spring-concurrency" data-page-reference="p56">
              <h4>١. مختبر لوح الربائع المغناطيسي <span>spring-concurrency · p56</span></h4>
              <p><strong>توظيفه الصفي:</strong> ابدأ بوضع «ربيعة واحدة شاقولية» لتأكيد انطباق الحاملين، ثم انتقل إلى «ربيعتان مائلتان» وحرّك النقطة <bdi dir="ltr">O</bdi> أفقياً ليسأل الطلاب: أي ربيعة تتحمل شداً أكبر ولماذا؟ أخيراً اضغط «الخطوة 6: ارفع الربيعتين والجسم» لتجسيد تقاطع الحوامل الثلاثة.</p>
            </div>

            <div class="teacher-simulation-note" data-simulation-reference="concurrent" data-page-reference="p57">
              <h4>٢. مختبر متوازي الأضلاع والتوازن <span>concurrent · p57–p58</span></h4>
              <p><strong>توظيفه الصفي:</strong> اعرض البناء على ثلاث خطوات متدرجة (١. الشعاعان ← ٢. إكمال المتوازي ← ٣. القطر والمحصلة)، ثم اضغط الحالة الجاهزة لمثال ص 58 (<bdi dir="ltr">4 N, 3 N, 60°</bdi>) وقارن القيمة الدقيقة <bdi dir="ltr">6.08 N</bdi> بقراءة المسطرة المقررة <bdi dir="ltr">6 N</bdi>، ثم فعّل ${V_F_PRIME} لشرح التوازن.</p>
            </div>

            <div class="teacher-simulation-note" data-simulation-reference="perpendicular" data-page-reference="p59">
              <h4>٣. مختبر القوتين المتعامدتين ومقياس الرسم <span>perpendicular · p58–p59</span></h4>
              <p><strong>توظيفه الصفي:</strong> بدّل بين الحالات الجاهزة لأمثلة ومسائل الكتاب (<bdi dir="ltr">60 N, 80 N</bdi> بمقياس <bdi dir="ltr">20 N/cm</bdi>، وحقيبة <bdi dir="ltr">30 N, 40 N</bdi> بمقياس <bdi dir="ltr">10 N/cm</bdi>، والمسألة الأولى <bdi dir="ltr">9 N, 12 N</bdi> بمقياس <bdi dir="ltr">3 N/cm</bdi>) لمطابقة الرسم مع فيثاغورث.</p>
            </div>

            <div class="teacher-simulation-note" data-simulation-reference="force-resolution" data-page-reference="p60">
              <h4>٤. مختبر تحليل القوة والمستوى المائل الأملس <span>force-resolution · p60</span></h4>
              <p><strong>توظيفه الصفي:</strong> في التبويب الأول اختبر الزوايا الحدية <bdi dir="ltr">0°</bdi> و<bdi dir="ltr">90°</bdi> ليرى الطلاب متى تنعدم إحدى المركبتين، ثم افتح التبويب الثاني «نشاط المستوى المائل الأملس» وأمل السطح تدريجياً من <bdi dir="ltr">0°</bdi> إلى <bdi dir="ltr">60°</bdi> لتفسير زيادة مركبة الانزلاق ${V_F1} ونقصان المركبة الضاغطة ${V_F2}.</p>
            </div>
          </div>
        </section>

        <!-- Section 8 -->
        <section class="teacher-section" id="t-source-matrix">
          <div class="teacher-section-heading">
            <div>
              <p class="teacher-section-kicker">القسم الثامن</p>
              <h3>مصفوفة التحقق من شمول صفحات الكتاب المدرسي (ص 55–62)</h3>
            </div>
            <span class="teacher-page-ref">100% Coverage</span>
          </div>

          <div class="teacher-subsection">
            <ul class="teacher-checklist">
              <li><strong>ص 55:</strong> العنوان، الأهداف الأربعة، الكلمات المفتاحية، تمثيل مشهد المظلّي وأسئلة الاستقصاء الثلاثة + تأسيس القوة ككمية شعاعية ومقياس الرسم (المرحلة ١).</li>
              <li><strong>ص 56:</strong> الأدوات الكاملة (لوح الربائع المغناطيسي...)، الخطوات السبع بمرحلتي ربيعة واحدة وربيعتين، التعريف الرسمي، مقارنة المتلاقية بغير المتلاقية، والمحاكاة الأولى (المرحلة ٢).</li>
              <li><strong>ص 57:</strong> سؤال «أتساءل»، ربط المحصلة بموازنة الثقل، إنشاء متوازي الأضلاع والقطر <bdi dir="ltr">OM</bdi>، العناصر الأربعة للمحصلة، والمحاكاة الثانية (المرحلة ٣).</li>
              <li><strong>ص 58:</strong> المثال المحلول الأول (<bdi dir="ltr">4 N, 3 N, 60° : 6 N</bdi> تقريباً) في ٨ خطوات، وتمهيد حالة التعامد ومقارنة الأشكال الرباعية الأربعة (المرحلة ٤).</li>
              <li><strong>ص 59:</strong> المثال المحلول الثاني (<bdi dir="ltr">60 N, 80 N : 100 N</bdi>) بالرسم وبفيثاغورث، بطاقة تذكير فيثاغورث، العلاقة العكسية، المحاكاة الثالثة، وتمهيد التحليل (المرحلة ٥).</li>
              <li><strong>ص 60:</strong> سؤال «أتساءل»، خطوات الإسقاط العمودي على <bdi dir="ltr">OX, OY</bdi> ومرتسم النقطة، استنتاجا التحليل، نشاط المستوى المائل الأملس بشقيه ومخططه بزاوية ${LATIN_A}، والمحاكاة الرابعة المزدوجة (المرحلة ٦).</li>
              <li><strong>ص 61:</strong> خلاصة «تعلّمتُ» ببنودها الأربعة، خريطة المفاهيم الشاملة، جدول المقارنة، والفقرتان ١–٢ من «أختبر نفسي» (المرحلة ٧).</li>
              <li><strong>ص 62:</strong> الفقرات ٣–٦ من «أختبر نفسي»، ورشة الحل والتمثيل المقياسي للمسألتين الأولى (شاملة ${V_F_PRIME}) والثانية، وبنك التدريب التفاعلي المتدرج (المرحلة ٨).</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  `;
}
