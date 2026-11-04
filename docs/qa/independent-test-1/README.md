# الاختبار الأول — القوى المتلاقية والقوى المتوازية (14 مسألة)

منطقة «اختبارات مستقلة» · معرّف ثابت: `test-01`

## الملفات

| ملف | الدور |
|---|---|
| `independent-test-1.html` | صفحة الاختبار (RTL، تعيد استخدام هيكل اختبارات المنصة) |
| `src/it1-problems.js` | بيانات المسائل الأربع عشرة: المعطيات والمطلوبات والخيارات — **بلا إجابات** |
| `src/it1-diagrams.js` | الرسوم: `it1GivenDiagram` (قبل التسليم، بلا محصلة) و`it1SolvedDiagram` (بعد التسليم فقط) |
| `src/it1-solutions.js` | مفتاح الإجابات + خطوات الحل + العناصر الصحيحة + الرسوم المحلولة — **يُحمَّل ديناميكياً بعد التسليم** |
| `src/it1-assessment.js` | نقطة الدخول: `mountAssessment` من `assessment-runtime.js` + لوحة الحلول بعد التسليم |
| `src/it1.css` | تنسيقات الصفحة فقط |
| `src/independent-tests-data.js` | تسجيل `test-01` في السجلّ وبطاقته |
| `tests/independent-test-1.test.js` | 32 اختباراً آلياً سلوكياً (منها 5 تتحقّق من **هندسة** الرسوم لا من نصوصها) |
| `scripts/qa-independent-test-1.mjs` | 37 فحصاً في متصفح حقيقي |
| `scripts/qa-independent-test-1-security.mjs` | 19 فحصاً للحماية ومسار التسليم |
| `scripts/qa-shots-independent-test-1.mjs` | يعيد توليد اللقطات الأربع من البناء الحالي |

## البنية الأمنية

- السجلّ العام (`independent-tests-data.js`) لا يستورد مفتاح الإجابات.
- `it1-solutions.js` لا يظهر في الرسم البياني للاستيراد الساكن من `it1-assessment.js`
  (يتحقّق من ذلك اختبار آلي)، ويُطلب فقط عبر
  `loadSolutions: () => import('./it1-solutions.js')`، وهو ما ينفّذه
  `assessment-runtime.js` داخل `finalizeSubmission()` بعد تأكيد التسليم.
- لا يوجد في الصفحة أي عنصر يحتوي إجابة قبل التسليم؛ الرسوم قبل التسليم لا ترسم المحصلة.

## الرموز

شدة المحصلة تُكتب **`F`** لا `R` في نص المطلوب والرسوم وخطوات الحل والإجابة النهائية والتغذية الراجعة.
(ملاحظة: في كود المصدر تظهر `R` فقط داخل `F₂` لرمز القوة الثانية، وليس رمزاً للمحصلة.)

## التشغيل والتحقق

```bash
npm test                                     # 446 اختباراً (6 إخفاقات خط أساس موثّقة + 13 تخطياً)
npm run build                                # dist/
QA_MODULE_DIR=/tmp/qa/node_modules \
  LD_LIBRARY_PATH=/tmp/nss/lib node scripts/qa-independent-test-1.mjs
QA_MODULE_DIR=/tmp/qa/node_modules \
  LD_LIBRARY_PATH=/tmp/nss/lib node scripts/qa-independent-test-1-security.mjs
```

`playwright-core` و`@sparticuz/chromium` ليستا اعتماديات للمشروع (كما في بقية سكربتات QA)؛
تُثبَّتان خارج المستودع ويُشار إليهما عبر `QA_MODULE_DIR`.

## الرسوم: كيف تُبنى

الرسوم الستة للقوى المتوازية **تُحسب من المعطيات** لا تُرسم يدوياً
(`buildParallel` في `src/it1-diagrams.js`): الموضع يأتي من `d₁/d₂ = F₂/F₁`،
والجهة من قاعدة «خارج القطعة من جهة القوة الكبرى» عند التعاكس، وطول كل سهم من
مقياس `px/N` واحد لكل شكل. لذلك لا يمكن أن يخالف الرسمُ حسابه.

- المجهول لا يُطبع قبل التسليم: `F₂` في المسألة 5 يُرسم **متقطّعاً بعلامة «؟»**،
  و`d` في المسائل 3 و5 و6 يُكتب `d = ?`.
- تسمية الزاوية في الرسوم المتلاقية تُبحث عن موضع خالٍ من كل الأسهم
  (`angleArc` + `boxHitsShafts`)، فلا تلامس أي سهم.
- ارتفاع `viewBox` يُحسب لكل شكل على حدة، فلا يُقصّ أي تسمية.

## لقطات مرجعية

تُولَّد كلها بالأمر:
`QA_MODULE_DIR=/tmp/qa/node_modules LD_LIBRARY_PATH=/tmp/nss/lib node scripts/qa-shots-independent-test-1.mjs`

- `figures-givens.png` — الرسوم قبل التسليم (14 مسألة).
- `figures-solved.png` — الرسوم المحلولة (المحصلة `F` بموضعها واتجاهها).
- `solution-problem-1.png` — حل المسألة 1 كاملاً بعد التسليم.
- `mobile-390.png` — العرض على هاتف 390px أثناء الاختبار.
