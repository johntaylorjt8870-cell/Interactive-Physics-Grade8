/*
 * Teacher Area content for «الفيزياء في حياتنا» — Lesson 1.
 * Lazily imported only after the existing teacher-password gate succeeds.
 */

import { formula, tex, vector } from './math.js';
import {
  DRAWING_CHALLENGES,
  EXAMPLES,
  GALLERY_GROUPS,
  OPENING_CHALLENGE,
  PREDICT_SCENARIO,
  STATIONS,
  STATION_QUIZZES,
} from './physics-in-life-content.js';
import {
  concurrentResultant,
  formatNumber,
  inclineComponents,
  nearestCompassDirection,
  perpendicularResultant,
} from './physics-in-life-physics.js';
import {
  concurrentStationScene,
  exampleScene,
  inclineStationScene,
  perpendicularStationScene,
} from './physics-in-life-scenes.js';

const V_F = vector('F');
const V_F1 = vector('F', '1');
const V_F2 = vector('F', '2');
const V_W = vector('w');
const W_PAR = tex('\\vec{w}_{\\parallel}', 'w parallel');
const W_PERP = tex('\\vec{w}_{\\perp}', 'w perpendicular');
const ALPHA = tex('\\alpha', 'alpha');
const THETA = tex('\\theta', 'theta');

const fmt = (value, digits = 1) => formatNumber(value, digits);

const heading = (title, kicker, id) => `<div class="teacher-section-heading"><div><p class="teacher-section-kicker">${kicker}</p><h3 id="${id}">${title}</h3></div><span class="teacher-page-ref">دليل المنصة</span></div>`;
const answer = (html) => `<div class="teacher-answer"><span class="teacher-answer-chip">الإجابة النموذجية</span><div class="teacher-answer-body">${html}</div></div>`;
const explanation = (html, label = 'شرح المعلم') => `<details class="teacher-explanation" open><summary>${label}</summary><div class="teacher-explanation-body">${html}</div></details>`;
const equation = (source, label) => `<div class="teacher-formula">${formula(source, label)}</div>`;

function overview() {
  return `<section class="teacher-section" id="pil-teacher-overview" aria-labelledby="pil-teacher-overview-heading">
    ${heading('خريطة الدرس وأهدافه', 'نظرة عامة · 3 محطات + معرض + رسم', 'pil-teacher-overview-heading')}
    <article class="teacher-subsection">
      <h4>أهداف التعلّم</h4>
      <ul class="teacher-objectives">
        <li>يحدّد نقطة تأثير قوتين متلاقيتين ويرسم القوتين والمحصلة من النقطة نفسها.</li>
        <li>يوظّف قاعدة متوازي الأضلاع، ويفهم أن المحصلة على منصف الزاوية حالة خاصة لتساوي المقدارين.</li>
        <li>يحسب محصلة قوتين متعامدتين بنظرية فيثاغورس، ويميّز ذلك عن الجمع العددي.</li>
        <li>يحلّل ثقل جسم على سطح مائل إلى مركبتين متعامدتين، ويميّز المركبة العمودية من رد الفعل العمودي.</li>
        <li>يميّز بين القوة والسرعة في مثال عبور النهر، وبين المحصلة الصفرية واتزان الجسم.</li>
        <li>يرسم سهماً لقوة أو محصلة من نقطة التأثير الصحيحة وفي الاتجاه الصحيح.</li>
      </ul>
      ${explanation(`<p><strong>تسلسل مقترح (حصة 45 دقيقة):</strong> التحدي الافتتاحي 5 د · المحطة الأولى 12 د · المحطة الثانية 8 د · المحطة الثالثة 10 د · «توقّع ثم جرّب» 5 د · معرض الحياة (مثالان أو ثلاثة) 5 د. أما التحدي والاختبارات القصيرة فتُستكمل في حصة تمارين.</p>
        <p><strong>مبدأ التصميم:</strong> لا تُعرض نتيجة قبل إجراء صريح من الطالب (اختيار، تحقق، إرسال). كل رقم في الواجهة يُحسب من القيم الحالية بدالة نقية، وليس قيمة مخزنة. لا تُحفظ النتائج في المنصة، ولا تُعرض هنا نتائج فردية؛ لقطة الشاشة أو النقاش الصفي هو ما يوثّق التعلّم.</p>`) }
      <p class="teacher-limit">لا تعتمد هذه الصفحة على تسجيل دخول ثانٍ: تستخدم بوابة المعلم نفسها وكلمة المرور ذاتها المعتمدة في بقية المنصة. الحماية على طرف العميل وليست صلاحية خادم.</p>
    </article>
  </section>`;
}

function stations() {
  const first = STATIONS[0];
  const second = STATIONS[1];
  const third = STATIONS[2];
  const firstDefault = concurrentResultant(first.defaults);
  const secondDefault = perpendicularResultant(second.defaults.f1, second.defaults.f2);
  const thirdDefault = inclineComponents(third.defaults.weight, third.defaults.angle);

  return `<section class="teacher-section" id="pil-teacher-stations" aria-labelledby="pil-teacher-stations-heading">
    ${heading('المحطات الثلاث: ماذا يحدث ولماذا', 'تجربة بتجربة · قيم افتراضية وحسابات', 'pil-teacher-stations-heading')}

    <article class="teacher-subsection">
      <h4>المحطة ١ — محصلة قوتين متلاقيتين (سفينة وقاطرتان)</h4>
      <p>القيم الافتراضية: ${V_F1} = ${fmt(first.defaults.f1, 0)} N، ${V_F2} = ${fmt(first.defaults.f2, 0)} N، ${THETA} = ${fmt(first.defaults.angle, 0)}°، اتجاه الزوج ${fmt(first.defaults.direction, 0)}°. الناتج المحسوب: ${V_F} ≈ ${fmt(firstDefault.magnitude, 1)} N بزاوية ${fmt(firstDefault.directionDegrees, 1)}° عن المحور الأفقي.</p>
      <ul>
        <li><strong>ما يتغيّر:</strong> مقدارا القوتين، الزاوية بينهما (0°–180°)، اتجاه الزوج حول O، وإظهار/إخفاء البناء الهندسي.</li>
        <li><strong>ما يبقى ثابتاً:</strong> مقياس الرسم 1 N = 2 px، ونقطة التأثير O عند مقدمة السفينة.</li>
        <li><strong>الحساب:</strong> يجمع المكوّنان الأفقي والرأسي لكل قوة، ثم تُحسب المحصلة بالجذر التربيعي. لا تُخزَّن قيمة للمحصلة.</li>
        <li><strong>ملاحظة تعليمية:</strong> عندما تتساوى القوتان تنصف المحصلة الزاوية. عندما تختلفان تنحرف نحو الأكبر. الطالب يرى الفرق في القراءة «انحراف F عن منصف الزاوية».</li>
        <li><strong>حالة حدّية:</strong> قوتان متساويتان بزاوية 180° تعطيان محصلة صفرية، ويعرض المشهد رمز المحصلة الصفرية بدل سهم وهمي.</li>
      </ul>
      ${equation('F=\\sqrt{F_{x}^{2}+F_{y}^{2}}', 'F equals root of F x squared plus F y squared')}
      ${explanation(`<p><strong>أخطاء شائعة:</strong> جمع المقدارين عددياً؛ افتراض أن المحصلة على المنصف دائماً؛ رسم القوتين من نقطتين مختلفتين؛ الخلط بين المحصلة الصفرية واتزان السفينة (مقاومة الماء والرياح قوى أخرى). اطلب من الطالب أن يجعل القوتين متساويتين ثم مختلفتين ويقارن زاوية المحصلة مع المنصف.</p>`)}
    </article>

    <article class="teacher-subsection">
      <h4>المحطة ٢ — قوتان متعامدتان (عربة وحبلان)</h4>
      <p>القيم الافتراضية: ${V_F1} = ${fmt(second.defaults.f1, 0)} N أفقياً، ${V_F2} = ${fmt(second.defaults.f2, 0)} N شاقولياً. المحصلة ≈ ${fmt(secondDefault.magnitude, 1)} N، والزاوية مع ${V_F1} ≈ ${fmt(secondDefault.angleFromFirstDegrees, 1)}°.</p>
      <ul>
        <li><strong>ما يتغيّر:</strong> المقداران فقط؛ الزاوية ثابتة 90°.</li>
        <li><strong>خيار الإخفاء:</strong> يخفي النص العددي والمعادلة دون إخفاء الرسم، حتى يتوقع الطالب أولاً. هذا خيار تعليمي لا يغيّر الحساب.</li>
        <li><strong>التحقق العددي:</strong> ${tex('\\sqrt{50^{2}+70^{2}}\\approx86.0\\,\\mathrm{N}', 'root 50 squared plus 70 squared is about 86 N')}. مجموع المقدارين 120 N خطأ.</li>
        <li><strong>إثراء:</strong> زاوية ${tex('\\tan^{-1}(F_{2}/F_{1})', 'inverse tangent')} مذكورة كإثراء رياضي فقط، وليست مطلوبة للحفظ. ما يهم في الصف الثامن: القطر أقرب إلى القوة الأكبر.</li>
      </ul>
      ${equation('F=\\sqrt{F_{1}^{2}+F_{2}^{2}}', 'Pythagoras for perpendicular forces')}
      ${explanation(`<p><strong>أخطاء شائعة:</strong> كتابة 6 + 8 = 14؛ اعتبار أن المحصلة تنصف الزاوية القائمة دائماً؛ الخلط بين اتجاه السهم ومقدار القوة. اسأل: إذا صفرت إحدى القوتين، ماذا تبقى؟ الجواب: القوة الأخرى نفسها.</p>`)}
    </article>

    <article class="teacher-subsection">
      <h4>المحطة ٣ — تحليل الثقل على سطح مائل (متزلج)</h4>
      <p>القيم الافتراضية: ${V_W} = ${fmt(third.defaults.weight, 0)} N، ${ALPHA} = ${fmt(third.defaults.angle, 0)}°. المركبة الموازية ≈ ${fmt(thirdDefault.parallel, 1)} N والعمودية ≈ ${fmt(thirdDefault.perpendicular, 1)} N.</p>
      <ul>
        <li><strong>تعريف الزاوية:</strong> ${ALPHA} زاوية ميل السطح عن الأفق، لا الزاوية بين الثقل والسطح.</li>
        <li><strong>الصيغتان:</strong> ${W_PAR} = ${V_W} sin ${ALPHA}، و ${W_PERP} = ${V_W} cos ${ALPHA}. عند 0°: الموازية صفر والعمودية تساوي الوزن. عند 90°: العكس.</li>
        <li><strong>ما يتغيّر:</strong> الوزن (200–800 N) والزاوية (0°–60°) وإظهار/إخفاء رد الفعل العمودي R.</li>
        <li><strong>دقة المفهوم:</strong> المركبة العمودية جزء من ثقل الجسم وتؤثر فيه إلى داخل السطح. رد الفعل العمودي قوة يبذلها السطح على الجسم في الاتجاه المعاكس. قد يتساوى مقداراهما أحياناً، لكنهما ليستا القوة نفسها.</li>
        <li><strong>الحركة:</strong> لا يجوز استنتاج التسارع من المركبة الموازية وحدها، لأن الاحتكاك أو الفرامل أو قوى أخرى قد تؤثر.</li>
      </ul>
      ${equation('w_{\\parallel}=w\\sin\\alpha\\;,\\qquad w_{\\perp}=w\\cos\\alpha', 'w parallel equals w sine alpha and w perpendicular equals w cos alpha')}
      ${explanation(`<p><strong>أخطاء شائعة:</strong> رسم المركبة العمودية عمودية على الأفق بدل السطح؛ تسميتها «رد الفعل»؛ استنتاج أن الجسم يتسارع حتماً؛ استخدام الزاوية المتممة بدل ${ALPHA}. اطلب من الطالب تثبيت الوزن وتغيير الزاوية فقط ورصد اتجاه تغيّر كل مركبة.</p>`)}
    </article>
  </section>`;
}

function stationQuizKeys() {
  return `<section class="teacher-section" id="pil-teacher-quizzes" aria-labelledby="pil-teacher-quizzes-heading">
    ${heading('حلول الاختبارات القصيرة (16 سؤالاً)', 'لا تظهر للطالب قبل الضغط على «تحقق»', 'pil-teacher-quizzes-heading')}
    ${STATIONS.map((station) => {
    const questions = STATION_QUIZZES[station.id];
    return `<article class="teacher-subsection">
      <h4>${station.code} — ${station.shortTitle}</h4>
      ${questions.map((question, index) => {
      const correct = question.choices.find((choice) => choice.id === question.correctId);
      return `<div class="pil-teacher-key" style="margin-bottom:14px">
          <div class="pil-key-row"><b>${index + 1}.</b><div>${question.prompt}</div></div>
          <div class="pil-key-row"><span class="pil-key-ok">الإجابة:</span><div>${correct?.label ?? ''}</div></div>
          <div class="pil-key-row"><span>التفسير:</span><div>${question.explanation}</div></div>
          <div class="pil-key-row"><span>الخيارات:</span><div>${question.choices.map((choice) => `${choice.label}${choice.id === question.correctId ? ' ✓' : ' ✕'}`).join(' — ')}</div></div>
        </div>`;
    }).join('')}
    </article>`;
  }).join('')}
    ${explanation(`<p><strong>الدرجة:</strong> تُحسب من الإجابات المُسلَّمة فقط: صح/المجموع. إعادة المحاولة تمسح إجابة السؤال وحده دون خصم. لا تُحفظ النتائج، ولا تُرسل إلى المعلم. السؤال الذي يعتمد على قراءة الرسم (مثل موقع المحصلة) يُقيَّم بالمعنى لا بموضع النقر.</p>`)}
  </section>`;
}

function galleryKeys() {
  return `<section class="teacher-section" id="pil-teacher-gallery" aria-labelledby="pil-teacher-gallery-heading">
    ${heading('مفاتيح معرض الحياة: 10 أمثلة', 'نقطة التأثير · اتجاهات القوى · سؤال كل بطاقة', 'pil-teacher-gallery-heading')}
    ${GALLERY_GROUPS.map((group) => `<article class="teacher-subsection">
      <h4>${group.title} (${group.range})</h4>
      <p>${group.note}</p>
      ${EXAMPLES.filter((example) => example.group === group.id).map((example) => {
    const point = example.points.find((candidate) => candidate.id === example.correctPointId);
    const quiz = example.quiz;
    const correct = quiz.choices.find((choice) => choice.id === quiz.correctId);
    return `<div class="pil-teacher-key" style="margin-bottom:16px">
          <div class="pil-key-row"><b>${example.number}. ${example.title}</b><div>${example.subtitle}</div></div>
          <div class="pil-key-row"><span class="pil-key-ok">نقطة التأثير:</span><div>${point?.label ?? ''}</div></div>
          <div class="pil-key-row"><span>القوى:</span><div>${example.forceLegend.map((force) => `${force.symbol}: ${force.label} — ${force.direction}`).join(' · ')}</div></div>
          <div class="pil-key-row"><span>شرح مختصر:</span><div>${example.explanation}</div></div>
          <div class="pil-key-row"><b>سؤال البطاقة:</b><div>${quiz.prompt}</div></div>
          <div class="pil-key-row"><span class="pil-key-ok">الإجابة:</span><div>${correct?.label ?? ''}</div></div>
          <div class="pil-key-row"><span>التفسير:</span><div>${quiz.explanation}</div></div>
          <div class="pil-key-row"><span>حدود النموذج:</span><div>${example.note}</div></div>
        </div>`;
  }).join('')}
    </article>`).join('')}
    ${explanation(`<p><strong>تنبيهات علمية للتقويم:</strong> مثال القارب يعبّر عن تركيب سرعات (m/s) لا عن محصلة قوى. في المظلة، الشد عند التقاء الحبال والثقل في مركز ثقل النظام. في السلة، الحبلان يلتقيان عند الحلقة؛ إن أمسك كل شخص بجانب منفصل صارت القوتان متوازيتين لا متلاقيتين. لا تفترض أن الرياح عمودية على الخيط في مثال الطائرة الورقية.</p>`)}
  </section>`;
}

function drawingKeys() {
  return `<section class="teacher-section" id="pil-teacher-drawing" aria-labelledby="pil-teacher-drawing-heading">
    ${heading('مفاتيح «أنت رسّام القوى»', 'تقييم نقطة + رمز + اتجاه + تصنيف', 'pil-teacher-drawing-heading')}
    ${DRAWING_CHALLENGES.map((challenge) => {
    const point = challenge.points.find((candidate) => candidate.id === challenge.correctPointId);
    const symbol = challenge.symbols.find((candidate) => candidate.id === challenge.correctSymbolId);
    const classification = challenge.classifications.find((candidate) => candidate.id === challenge.correctClassificationId);
    const direction = nearestCompassDirection(challenge.correctDirectionDegrees);
    return `<article class="teacher-subsection">
        <h4>${challenge.title}</h4>
        <p>${challenge.situation}</p>
        <div class="pil-teacher-key">
          <div class="pil-key-row"><span class="pil-key-ok">نقطة التأثير:</span><div>${point?.label ?? ''}</div></div>
          <div class="pil-key-row"><span class="pil-key-ok">الرمز:</span><div>${symbol?.label ?? ''}</div></div>
          <div class="pil-key-row"><span class="pil-key-ok">الاتجاه:</span><div>${direction?.label ?? ''} (${fmt(challenge.correctDirectionDegrees, 0)}°) بسماحية ±${challenge.directionToleranceDegrees}°</div></div>
          <div class="pil-key-row"><span class="pil-key-ok">التصنيف:</span><div>${classification?.label ?? ''}</div></div>
          <div class="pil-key-row"><span>التفسير:</span><div>${challenge.explanation}</div></div>
        </div>
      </article>`;
  }).join('')}
    ${explanation(`<p><strong>كيف يُقيَّم:</strong> أربعة أجزاء مستقلة. النقطة تُقارن بمعرّف النقطة لا بإحداثيات النقر؛ الاتجاه يُقبل ضمن قطاع بسماحية 30° حول الاتجاه الصحيح (ويُصنَّف «قريب» حتى 60°) لتجنّب مطالب البكسل. الطالب يرى نتيجة كل جزء والاتجاه الصحيح مرسوماً حتى لو أخطأ. لا تُحفظ النتيجة.</p>`)}
  </section>`;
}

function assessmentScope() {
  return `<section class="teacher-section" id="pil-teacher-scope" aria-labelledby="pil-teacher-scope-heading">
    ${heading('التقويم وحدود النموذج', 'ما يُقيَّم فعلاً وما لا يُقيَّم', 'pil-teacher-scope-heading')}
    <article class="teacher-subsection">
      <h4>مكوّنات التقويم</h4>
      <ul class="teacher-checklist">
        <li>16 سؤالاً قصيراً (5 + 5 + 6) بتغذية راجعة وتفسير بعد التحقق، وإعادة محاولة بلا خصم.</li>
        <li>«توقّع ثم جرّب»: يُقيَّم التوقع وفق العلاقة بين القيمتين الحاليتين، ويُقبل «أقرب إلى الأكبر» أو «المنصف» أو «صفرية» بحسب الحالة الفعلية بعد تغيير القيم.</li>
        <li>معرض الحياة: 10 أسئلة اختيار من متعدد، لكل سؤال تفسير بعد الاختيار.</li>
        <li>تحدي الرسم: أربعة أجزاء لكل مشهد (نقطة، رمز، اتجاه، تصنيف).</li>
        <li>عدّاد تقدم محلي (15 تجربة) لا يُحفظ ولا يُعرض للمعلم.</li>
      </ul>
      ${answer(`<p><strong>لا توجد نتائج محفوظة:</strong> المنصة ثابتة (Static) ولا خادم، وجميع الحالات في الذاكرة. لا تدّعِ للطلاب أن إجاباتهم «مسجَّلة لدى المعلم». إن أردت توثيقاً، استخدم مناقشة صفية أو لقطة شاشة يدوية.</p>`)}
      <h4>حدود النماذج</h4>
      <ul class="teacher-limit">
        <li>الرسوم تخطيطية تعليمية، وليست قياساً هندسياً دقيقاً. أطوال الأسهم تتبع مقياساً ثابتاً داخل المشهد نفسه.</li>
        <li>في المحطة الأولى والثانية والثالثة يبقى الجسم ساكناً في المشهد؛ لا تُنمذج الحركة أو التسارع.</li>
        <li>مشهد المظلة يعامل المظلي والمظلة كنظام واحد، ويعرض القوتين على الاستقامة الرأسية نفسها.</li>
        <li>لا يُنمذج الاحتكاك كمقدار رقمي في أي تجربة؛ يُذكر فقط كقوة قد تؤثر، ويظهر رمزياً في مثال الطريق.</li>
        <li>مشهد القارب للسرعات فقط؛ لا يُستخدم كمثال محصلة قوى متعامدة.</li>
      </ul>
      <h4>إتاحة</h4>
      <ul>
        <li>كل رسم SVG يحمل عنواناً ووصفاً. نقاط التأثير أزرار قابلة للتركيز من لوحة المفاتيح ولها تسميات نصية بديلة في القائمة.</li>
        <li>المعادلات تُرسم عبر KaTeX مع تسميات لفظية، والأرقام معزولة باتجاه LTR.</li>
        <li>حركات الانتقال تُلغى عند تفعيل <bdi dir="ltr">prefers-reduced-motion</bdi>.</li>
      </ul>
    </article>
  </section>`;
}

function previewScene() {
  const first = STATIONS[0].defaults;
  const second = STATIONS[1].defaults;
  const third = STATIONS[2].defaults;
  return `<section class="teacher-section" id="pil-teacher-preview" aria-labelledby="pil-teacher-preview-heading">
    ${heading('معاينة المشاهد كما يراها الطالب', 'رسوم ثابتة بالقيم الافتراضية', 'pil-teacher-preview-heading')}
    <article class="teacher-subsection">
      <h4>المحطات الثلاث</h4>
      <div class="pil-teacher-live">
        <figure data-preview="station-concurrent">
          ${concurrentStationScene({ ...first, showConstruction: true }, 'tch-st1')}
          <figcaption>المحطة ١: ${V_F1} = ${fmt(first.f1, 0)} N، ${V_F2} = ${fmt(first.f2, 0)} N، ${THETA} = ${fmt(first.angle, 0)}°.</figcaption>
        </figure>
        <figure data-preview="station-perpendicular">
          ${perpendicularStationScene(second, 'tch-st2')}
          <figcaption>المحطة ٢: ${V_F1} = ${fmt(second.f1, 0)} N، ${V_F2} = ${fmt(second.f2, 0)} N، الزاوية 90°.</figcaption>
        </figure>
        <figure data-preview="station-incline">
          ${inclineStationScene({ ...third, showReaction: true }, 'tch-st3')}
          <figcaption>المحطة ٣: ${V_W} = ${fmt(third.weight, 0)} N، ${ALPHA} = ${fmt(third.angle, 0)}° (مع إظهار R اختيارياً).</figcaption>
        </figure>
        <figure data-preview="predict">
          <div class="pil-teacher-note">موديل «توقّع ثم جرّب» يبدأ بمحصلة مخفية، ولا يكشفها إلا بعد زر التحقق. القيم الافتراضية: ${V_F1} = ${PREDICT_SCENARIO.defaults.f1} N، ${V_F2} = ${PREDICT_SCENARIO.defaults.f2} N، ${THETA} = ${PREDICT_SCENARIO.defaults.angle}°.</div>
        </figure>
      </div>
      <h4>معرض الحياة</h4>
      <div class="pil-teacher-live">
        ${EXAMPLES.map((example) => `<figure data-preview="example-${example.id}">
          ${exampleScene(example, { thumbnail: true, points: [] }, `tch-ex-${example.id}`)}
          <figcaption>${example.number}. ${example.title}</figcaption>
        </figure>`).join('')}
      </div>
      <p class="teacher-limit">هذه معاينات ثابتة للرسوم نفسها المستخدمة في صفحة الطالب. التفاعل الكامل (تحريك القيم والنقر على النقاط) متاح في صفحة الدرس.</p>
    </article>
  </section>`;
}

function openingAndPredictKeys() {
  const correct = OPENING_CHALLENGE.options.find((option) => option.id === OPENING_CHALLENGE.correctId);
  const predictCorrect = PREDICT_SCENARIO.options.find((option) => option.id === PREDICT_SCENARIO.correctId);
  return `<section class="teacher-section" id="pil-teacher-opening" aria-labelledby="pil-teacher-opening-heading">
    ${heading('التحدي الافتتاحي و«توقّع ثم جرّب»', 'مدخل الدرس ونمط التنبؤ', 'pil-teacher-opening-heading')}
    <article class="teacher-subsection">
      <h4>التحدي الافتتاحي</h4>
      <p>${OPENING_CHALLENGE.question}</p>
      ${answer(`<p><strong>الإجابة:</strong> ${correct?.label ?? ''}</p><p>${OPENING_CHALLENGE.feedbackCorrect}</p>`)}
      <p>لا تُكشف الإجابة قبل زر «قارن توقعي». يمكن للطالب تغيير القوتين بعد تسجيل التوقع ومقارنة اتجاه المحصلة قبل المقارنة وبعدها.</p>
    </article>
    <article class="teacher-subsection">
      <h4>نمط التنبؤ</h4>
      <p>${PREDICT_SCENARIO.question}</p>
      ${answer(`<p><strong>الإجابة:</strong> ${predictCorrect?.label ?? ''}</p><p>${PREDICT_SCENARIO.explanation}</p>`)}
      <p><strong>ملاحظة تقويم:</strong> بعد تغيير القيم يصبح التقييم وفق الحالة الحالية: إذا صار المقداران متساويين فالإجابة «المنصف»، وإذا انعكس الأكبر فالإجابة «أقرب إلى الأكبر» تبقى هي الصحيحة. هذا يمنع تعارض التغذية الراجعة مع الرسم المعروض.</p>
    </article>
  </section>`;
}

export function renderTeacherContent() {
  return `<header class="teacher-workspace-header">
      <div>
        <p class="teacher-workspace-eyebrow">دليل المعلم · الفيزياء في حياتنا · الدرس الأول</p>
        <h2 id="teacher-workspace-heading" tabindex="-1">القوى المتلاقية وتحليل القوة</h2>
        <p>حلول المحطات والأمثلة وتحدي الرسم، مع التفسيرات العلمية وحدود النماذج. لا تُعرض نتائج طلاب فردية.</p>
      </div>
      <button class="teacher-logout-button" type="button" data-teacher-logout>إنهاء الجلسة</button>
    </header>
    <div class="teacher-workspace-layout">
      <nav class="teacher-nav" aria-label="التنقل في دليل المعلم">
        <p class="teacher-nav-title">أقسام الدليل</p>
        <a href="#pil-teacher-overview">الأهداف</a>
        <a href="#pil-teacher-opening">التحدي والتنبؤ</a>
        <a href="#pil-teacher-stations">المحطات</a>
        <a href="#pil-teacher-quizzes">حلول الاختبارات</a>
        <a href="#pil-teacher-gallery">معرض الحياة</a>
        <a href="#pil-teacher-drawing">تحدي الرسم</a>
        <a href="#pil-teacher-scope">التقويم والحدود</a>
        <a href="#pil-teacher-preview">معاينة المشاهد</a>
      </nav>
      <div class="teacher-content">
        ${overview()}
        ${openingAndPredictKeys()}
        ${stations()}
        ${stationQuizKeys()}
        ${galleryKeys()}
        ${drawingKeys()}
        ${assessmentScope()}
        ${previewScene()}
      </div>
    </div>`;
}
