# QA للاختبار الأول المستقل

يوجد الاختبار داخل صفحة منطقة الاختبارات المستقلة المركزية (`independent-tests.html`) تحت المعرّف الثابت `test-01`. لا توجد صفحة HTML مستقلة لكل اختبار أو مسألة.

## مرجع المصدر

- `SOURCE-AUDIT.md`: مطابقة الصور الأربع عشرة، المعطيات والمطلوبات والحلول المحسوبة، وملاحظة الرمز.
- الصور المرفقة المحفوظة في `docs/source-images/independent-test-1/problem-1.png` إلى `problem-14.png` (ترقيم الملف يطابق رقم الصورة).
- الصور المصدرية تستخدم `R` للمحصلة؛ تطبيع التنفيذ إلى `F` قرار صريح لصاحب المشروع، كما يوثق سجل المطابقة.

## بنية التنفيذ

- `independent-tests.html`: الصفحة المركزية الوحيدة لمنطقة الاختبارات؛ تعرض السجل وتفتح الاختبار في الصفحة نفسها.
- `src/independent-tests-data.js`: سجل الاختبارات الحالي؛ `test-01` ثابت ومربوط بسجل الحلول نفسه.
- `src/it1-problems.js`: 14 مسألة، مع نص المسألة والمعطيات والمطلوبات والحقول المصححة. يحتوي أسئلة الصورة 11 على مطلبين فقط، بلا طلب حساب زائد.
- `src/it1-assessment.js`: يعرض 14 تبويب ARIA، تبويباً واحداً لكل مسألة، ويجمع مطالب المسألة في لوحة واحدة.
- `src/it1-solutions.js`: مفتاح التصحيح والحلول؛ يُستورد ديناميكياً عند تسليم الطالب.
- `src/it1-diagrams.js`: هندسة الرسوم التعليمية. يستدعيها مسار الحل فقط، وتظهر رسمة واحدة في قسم الحل المقابل بعد التسليم.
- `src/lesson-test-engine.js`: محرك التقييم المشترك؛ لم تتغير آلية التقييم الأساسية.
- `src/independent-tests.css` و`src/it1.css`: واجهة المنطقة ومسائل الاختبار ورسوم الحل.
- `tests/independent-test-1.test.js` و`tests/independent-tests.test.js`: الاختبارات الأصلية محفوظة وموسعة دون إنشاء مجموعة موازية أو حذف اختبارات سابقة.

## نتائج التحقق الحالية — 5 نوفمبر 2026

- `npm run build`: ناجح؛ أُنشئ البناء الثابت في `dist/`.
- الاختبارات المستهدفة (`node --test tests/independent-test-1.test.js tests/independent-tests.test.js`): **46/46 ناجحة**.
- `qa-independent-test-1.mjs`: **201/201** فحص متصفح ناجح.
- `qa-independent-test-1-security.mjs`: **13/13** فحص أمني ناجح.
- `qa-shots-independent-test-1.mjs`: اكتمل؛ أُعيد إنشاء لقطات 1440 و1366 و390 بكسل أدناه من البناء الحالي.
- `npm test`: **434 ناجحاً، 6 إخفاقات، 13 متخطاة من 453**. الإخفاقات الستة تقع في اختبارات قديمة خارج نطاق هذا التغيير (اختبار إعادة ضبط max-width للدرس 1، توقعات مراحل/صفحات الدرس 1، وملفات physics-in-life ودفاتر Unit 2 Lesson 1 وLesson 3)؛ خط الأساس السابق كان يسجل الإخفاقات الستة نفسها. لا تُعرض نتيجة المجموعة الكاملة على أنها خضراء.

تفاصيل الفحوص والأوامر موثقة في `QA-REPORT.md`.

## فحوص المتصفح

بعد البناء وخدمة جذر المشروع على المنفذ 4173:

```bash
npm run build
QA_MODULE_DIR=/tmp/qa/node_modules QA_CHROMIUM=/tmp/chromium node scripts/qa-independent-test-1.mjs
QA_MODULE_DIR=/tmp/qa/node_modules QA_CHROMIUM=/tmp/chromium node scripts/qa-independent-test-1-security.mjs
QA_MODULE_DIR=/tmp/qa/node_modules CHROMIUM_PATH=/tmp/chromium node scripts/qa-shots-independent-test-1.mjs
```

اللقطات المُولّدة من البناء الحالي:

- `problem-01-question-1440.png` … `problem-14-question-1440.png`: زيارة كل تبويب؛ السؤال والمعطيات بلا رسم.
- `problem-01-solution-1440.png` و`problem-11-solution-1440.png` و`problem-13-solution-1440.png`: حلول بعد التسليم مع رسوم المسائل؛ لقطة 13 تشمل المعادلة الهندسية المصححة.
- `tabs-and-question-1440.png`: التبويبات على سطح المكتب.
- `equations-and-symbols-1440.png`: رموز ومعادلات المسألة 7.
- `laptop-1366.png`: عرض 1366 بكسل.
- `mobile-390.png`: عرض الهاتف وشريط التبويبات القابل للتمرير داخلياً.
- `catalog-1440.png`: قائمة الاختبارات المركزية.

يجب إعادة تشغيل سكربت اللقطات بعد أي تعديل بصري. اللقطات الإضافية القديمة `figures-givens.png` و`figures-solved.png` و`solution-problem-1.png` محفوظة من جولة سابقة ولا تدخل ضمن تقرير اللقطات الحالية.
