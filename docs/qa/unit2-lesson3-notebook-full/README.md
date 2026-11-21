# الفحص البصري — دفتر الطالب الكامل، الدرس الثالث من الوحدة الثانية

**النطاق:** حاسوب محمول فقط (`1366×768` و`1440×900`). لا هاتف ولا لوح (خارج نطاق هذه المهمة).

| البند | القيمة |
|---|---|
| المقاسات | `1366×768` و`1440×900` |
| المحرّك | Chromium headless عبر `playwright-core` + `@sparticuz/chromium` (خارج المستودع في `/tmp/qaenv`) |
| السكربت | `qa.mjs` |
| النتيجة | **52/52 فحصاً ناجحاً، صفر إخفاق** |
| السجلّ | `browser-results.txt` |
| الصفحة | `http://127.0.0.1:4173/unit2-lesson-3.html` |

## تشغيله

```bash
# 1. خدمة المستودع على المنفذ 4173
python3 -m http.server 4173 --bind 0.0.0.0

# 2. بيئة المتصفح (خارج المستودع)
mkdir -p /tmp/qaenv && cd /tmp/qaenv
npm init -y && npm install playwright-core @sparticuz/chromium
# فك حزمة al2023.tar.br إلى /tmp/nss ثم
export LD_LIBRARY_PATH=/tmp/nss/lib

# 3. التشغيل
cd /home/user/Interactive-Physics-Grade8
node docs/qa/unit2-lesson3-notebook-full/qa.mjs
```

## أبرز ما كشفه وأصلحه التدقيق البصري

1. **إصلاح قوس `@media (max-width: 700px) {` غير المغلق في `src/unit2-lesson3.css` (سطر 382):** كان يحبس قواعد `.p3-student-notebook` داخل استعلام الشاشات الصغيرة، فتم إغلاقه وتفعيل التصميم الكامل على شاشات Laptop.
2. **إصلاح وعاء الماء الثاني في رسم `water-levels`:** أُضيف تنسيق `path:nth-child(2)` داخل `.p3-student-notebook` لإزالة التعبئة السوداء الافتراضية.
3. **إصلاح `figcaption` داخل رسوم الدفتر:** تحويل `display: grid` الموروث من `.p3-figure` إلى `display: block` حتى لا ينفصل `<bdi dir="ltr">` إلى سطر مستقل.

## اللقطات (`1366x768/` و`1440x900/`)

| الملف | ما يُظهره |
|---|---|
| `01-notebook-header.png` | رأس الدفتر وشارات المصادر والفهرس |
| `02-contents.png` | الفهرس الكامل ذو الـ18 رابطاً |
| `03-water-and-charge.png` | تجربة الأوعية المائية والشكلان (1) و(2) |
| `04-active-dipole-emf.png` | تجربة ص 100 ومصطلح القوة المحركة الكهربائية ومخطط الدارة |
| `05-series-worked.png` | نشاط التسلسل المحلول خطوة بخطوة (`12 - 5 = 7 V`) |
| `06-transformer-safety.png` | قضيّة البحث عن المحوّل الخافض (`220 V` → `110 V`) ورسم المحوّل |
| `07-self-check-p105.png` | «أختبر نفسي» ص 105 ومعادلات التحويل |
| `08-source-caveats.png` | جدول قيود المصدر والغموض الموثّق (ص 97–106) |
