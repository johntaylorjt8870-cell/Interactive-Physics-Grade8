import { useEffect, useRef, useState } from "react";
import { Btn, Callout, Card, Panel, Slider, SourceTag, Stat, useLocalStorage } from "@/components/ui";
import { IconCloudBolt, IconFactory, IconReset, IconShield, IconSparkle } from "@/components/icons";
import { T, TEq, num } from "@/lib/math";
import { play } from "@/lib/sound";
import { cn } from "@/utils/cn";
import { AppArt } from "@/components/art";
import { DeepExplain } from "@/components/Explain";

const SOUND_SPEED = 340; // m/s

/* ------------------------------------------------------------------ */
/* lightning distance calculator                                       */
/* ------------------------------------------------------------------ */

function LightningLab() {
  const [phase, setPhase] = useState<"idle" | "counting" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [manual, setManual] = useState(5);
  const [useManual, setUseManual] = useState(false);
  const startRef = useRef(0);

  useEffect(() => {
    if (phase !== "counting") return;
    const id = window.setInterval(() => setElapsed((performance.now() - startRef.current) / 1000), 100);
    return () => window.clearInterval(id);
  }, [phase]);

  const t = useManual ? manual : elapsed;
  const distance = SOUND_SPEED * t;
  const km = distance / 1000;

  const verdict =
    km < 3
      ? { text: "خطر شديد — العاصفة فوقك تقريباً: ادخل مبنى مغلقاً فوراً.", tone: "danger" as const }
      : km < 10
        ? { text: "خطر قريب — قاعدة 30/30 تقول: احتمِ الآن وانتظر ٣٠ دقيقة بعد آخر رعد.", tone: "warn" as const }
        : { text: "العاصفة بعيدة نسبياً، لكن تابع الرصد ولا تخرج إلى العراء.", tone: "info" as const };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-lagoon-600/40 p-6">
        <div className="absolute inset-0 grain opacity-[0.08]" />
        <div className="relative">
          <p className="text-xs font-bold text-forest-300">تجربة حقيقية أثناء العاصفة (من نافذتك!)</p>
          <h4 className="mt-1 text-xl font-bold text-white">كم تبعد عنك الصاعقة؟</h4>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Btn
              variant="spark"
              onClick={() => {
                startRef.current = performance.now();
                setElapsed(0);
                setPhase("counting");
                setUseManual(false);
              }}
              sound="none"
            >
              ⚡ رأيت البرق
            </Btn>
            <Btn
              variant="primary"
              disabled={phase !== "counting"}
              onClick={() => {
                setPhase("done");
                play("whoosh");
              }}
              sound="none"
            >
              🔊 سمعت الرعد
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => {
                setPhase("idle");
                setElapsed(0);
              }}
            >
              <IconReset className="h-4 w-4" />
              تصفير
            </Btn>
          </div>

          <div className="mt-5 rounded-2xl bg-forest-950/70 p-5 text-center ring-1 ring-inset ring-forest-700">
            <p className="text-xs font-bold text-forest-300">الزمن بين البرق والرعد</p>
            <p className="num mt-1 text-5xl font-bold text-spark-400">{t.toFixed(1)}<span className="text-2xl"> s</span></p>
            {phase === "counting" && <p className="mt-1 text-xs text-forest-300 anim-pulse-soft">العدّاد يعمل… انتظر صوت الرعد</p>}
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-xs font-bold text-forest-300">
              <input
                type="checkbox"
                checked={useManual}
                onChange={(e) => {
                  setUseManual(e.target.checked);
                  setPhase("done");
                }}
                className="h-4 w-4 accent-[#e9a22b]"
              />
              أو حرّك الزمن يدوياً للتدريب
            </label>
            <div className="mt-2 rounded-2xl bg-forest-950/50 p-3">
              <Slider
                label={<span className="text-forest-200">الزمن t</span>}
                value={manual}
                min={0.5}
                max={30}
                step={0.5}
                onChange={(v) => {
                  setManual(v);
                  setUseManual(true);
                }}
                valueTex={<span className="num text-spark-400">{manual} s</span>}
                tone="spark"
                disabled={!useManual}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-forest-200 bg-white p-5">
          <p className="text-xs font-bold text-forest-700">الحساب</p>
          <TEq e={`d = v_{\\text{sound}} \\cdot t = ${SOUND_SPEED} \\times ${t.toFixed(1)} = ${num(distance, 0)}\\ \\mathrm{m}`} label="المسافة تساوي سرعة الصوت مضروبة بالزمن" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Stat label="المسافة" value={<T e={`${num(km, 2)}\\ \\mathrm{km}`} label={`${num(km, 2)} كيلومتر`} />} tone="forest" />
            <Stat label="سرعة الصوت المستعملة" value={<T e={`340\\ \\mathrm{m/s}`} label="340 متر في الثانية" />} tone="lagoon" />
          </div>
        </div>

        <Callout tone={verdict.tone} title="تقدير الخطر" icon={<IconShield className="h-4 w-4" />}>
          {verdict.text}
        </Callout>

        <Card className="bg-paper-warm">
          <h4 className="text-base font-bold text-forest-900">لماذا نرى البرق قبل أن نسمع الرعد؟</h4>
          <p className="mt-2 text-sm leading-7 text-ink-700">
            الضوء يقطع الكيلومتر في نحو{" "}
            <T e="3.3\times 10^{-6}\ \mathrm{s}" label="3.3 ميكروثانية" /> أي فورياً بالنسبة لنا، بينما الصوت يحتاج نحو{" "}
            <T e="3\ \mathrm{s}" label="ثلاث ثوان" /> لكل كيلومتر. لذلك يكفي أن نعدّ الثواني ونقسمها على ثلاثة لنحصل على
            المسافة بالكيلومترات تقريباً.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* applications                                                        */
/* ------------------------------------------------------------------ */

const APPS = [
  {
    title: "مانعة الصواعق",
    principle: "تأريض + تفريغ هادئ",
    body: "ساق معدنية مدبّبة أعلى البناء موصولة بناقل سميك إلى الأرض. الشحنة المستحثّة تتسرّب عبر السنّ المدبّب نحو الأرض تدريجياً، وإن ضربت الصاعقة فإنها تجد طريقاً آمناً بعيداً عن هيكل البناء وسكّانه.",
    artId: "rod",
  },
  {
    title: "الطلاء الكهروستاتيكي",
    principle: "تجاذب الشحنات المخالفة",
    body: "تُشحن قطرات الطلاء بشحنة، ويُشحن جسم السيارة بالشحنة المخالفة، فتنجذب القطرات وتلتفّ حتى حول الحواف والخلف، فيقلّ الهدر ويصبح الطلاء متجانساً وسميكاً بالتساوي.",
    artId: "paint",
  },
  {
    title: "آلة التصوير والطابعة الليزرية",
    principle: "استقطاب + مسحوق مشحون",
    body: "تُشحن أسطوانة حسّاسة للضوء بشحنة منتظمة، فيُزيل الضوء الشحنة من المناطق البيضاء فقط. يبقى «الظلّ الكهربائي» للحروف مشحوناً فيلتصق به مسحوق الحبر المشحون، ثم يُنقل إلى الورق ويُثبَّت بالحرارة.",
    artId: "copier",
  },
  {
    title: "مُرشِّح الغبار الكهروستاتيكي",
    principle: "شحن الجسيمات ثم جذبها",
    body: "في مداخن المعامل تمرّ ذرّات الدخان قرب أسلاك مشحونة بجهد عالٍ فتكتسب شحنة، ثم تنجذب إلى ألواح مخالفة الشحنة فتلتصق بها، ويخرج الهواء أنظف بنسبة تتجاوز ٩٩٪.",
    artId: "filter",
  },
  {
    title: "مولّد فان دي غراف",
    principle: "نقل الشحنات إلى سطح ناقل",
    body: "حزام متحرّك ينقل الشحنات إلى داخل كرة معدنية كبيرة، فتتجمّع على سطحها الخارجي. تتراكم شحنات هائلة تجعل شعر من يلمسها يقف: كل خصلة تحمل الشحنة نفسها فتتنافر مع أخواتها.",
    artId: "vdg",
  },
  {
    title: "شاشة اللمس السعوية",
    principle: "تغيّر السعة الكهربائية",
    body: "تحت زجاج الشاشة شبكة تحمل شحنة صغيرة. إصبعك ناقل، فعند لمسه يسحب جزءاً من الشحنة فيتغيّر الجهد في تلك النقطة، ويحسب المتحكّم الإحداثيات. لهذا لا تعمل الشاشة بقفّاز عادي.",
    artId: "touch",
  },
];

/* ------------------------------------------------------------------ */

const SAFETY = [
  "ادخل مبنى مغلقاً أو سيارة مغلقة النوافذ عند سماع الرعد.",
  "ابتعد عن الأشجار المنفردة والأعمدة والأسطح المكشوفة.",
  "لا تستحم ولا تستعمل هاتفاً موصولاً بالشاحن أثناء العاصفة.",
  "افصل الأجهزة الحسّاسة قبل العاصفة إن أمكن.",
  "انتظر ٣٠ دقيقة بعد آخر صوت رعد قبل العودة إلى الخارج.",
  "لا تحتمِ تحت مظلة معدنية أو قرب سياج معدني طويل.",
];

export function StationApps() {
  const [checked, setChecked] = useLocalStorage<Record<string, boolean>>("lab.safety", {});
  const [open, setOpen] = useState<number | null>(0);
  const doneCount = SAFETY.filter((_, i) => checked[`s${i}`]).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="border-s-4 border-s-forest-700">
          <SourceTag kind="book" page={85} />
          <h3 className="mt-3 text-lg font-bold text-forest-900">الصاعقة: كهرباء ساكنة بمقياس السماء</h3>
          <p className="mt-3 text-[15px] leading-8 text-ink-700">
            تتكوّن في السحب الركامية شحنات هائلة نتيجة احتكاك قطرات الماء وبلورات الثلج، فيُشحن أسفل السحابة غالباً
            بشحنة سالبة، ويُستحثّ على الأرض تحتها شحنة موجبة. وعندما يتجاوز الحقل الكهربائي قدرة الهواء على العزل يحدث
            التفريغ: <strong>الصاعقة</strong>. وتحمي المبانيَ <strong>مانعة الصواعق</strong> التي تُوصل السحابة بالأرض
            بناقل سميك.
          </p>
        </Card>
        <Card>
          <SourceTag kind="enrich" />
          <h3 className="mt-3 text-lg font-bold text-forest-900">أرقام تُدهش</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Stat label="تيار الصاعقة النموذجي" value={<T e="3\times 10^{4}\ \mathrm{A}" label="ثلاثون ألف أمبير" />} tone="berry" />
            <Stat label="حرارة قناة الصاعقة" value={<T e="\approx 30000\ \mathrm{K}" label="ثلاثون ألف كلفن" />} tone="spark" />
            <Stat label="زمن التفريغ" value={<T e="\approx 30\ \mathrm{\mu s}" label="ثلاثون ميكروثانية" />} tone="lagoon" />
            <Stat label="حقل انهيار الهواء" value={<T e="3\times 10^{6}\ \mathrm{V/m}" label="ثلاثة ملايين فولت لكل متر" />} tone="forest" />
          </div>
          <p className="mt-3 text-sm leading-7 text-ink-700">
            لهذا لا يمكن «تخزين» صاعقة: طاقتها هائلة لكنها تنطلق في جزء من مئة ألف من الثانية.
          </p>
        </Card>
      </div>

      <Panel
        title="حاسبة مسافة الصاعقة"
        subtitle="عُدَّ الثواني بين رؤية البرق وسماع الرعد، واحسب المسافة كما يفعل خبراء الأرصاد"
        icon={<IconCloudBolt className="h-5 w-5" />}
        actions={<SourceTag kind="enrich" />}
      >
        <LightningLab />
      </Panel>

      <Panel
        title="ستّ تقنيات تعمل بالكهرباء الساكنة"
        subtitle="اضغط أي بطاقة لتفتح شرحها"
        icon={<IconFactory className="h-5 w-5" />}
        actions={<SourceTag kind="enrich" />}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {APPS.map((app, i) => (
            <button
              key={app.title}
              type="button"
              onClick={() => {
                setOpen(open === i ? null : i);
                play("tick");
              }}
              className={cn(
                "group rounded-3xl border p-4 text-right transition-all duration-300",
                open === i ? "border-forest-400 bg-forest-50 shadow-[0_18px_40px_-28px_rgba(6,46,39,1)]" : "border-forest-200 bg-white hover:-translate-y-0.5",
              )}
            >
              <div className="overflow-hidden rounded-2xl ring-1 ring-inset ring-forest-800/40">
                <AppArt id={app.artId} title={app.title} className="h-32 w-full" />
              </div>
              <h4 className="mt-3 text-base font-bold text-forest-900">{app.title}</h4>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-spark-50 px-2 py-0.5 text-[11px] font-bold text-spark-600">
                <IconSparkle className="h-3 w-3" />
                {app.principle}
              </p>
              {open === i && <p className="anim-rise mt-2 text-sm leading-7 text-ink-700">{app.body}</p>}
              {open !== i && <p className="mt-2 text-xs text-ink-500">اضغط للقراءة…</p>}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel title="قائمة السلامة أثناء العواصف" subtitle="أشّر على ما التزمت به في العاصفة القادمة" icon={<IconShield className="h-5 w-5" />}>
          <ul className="space-y-2">
            {SAFETY.map((s, i) => {
              const key = `s${i}`;
              const isDone = !!checked[key];
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => {
                      setChecked((c) => ({ ...c, [key]: !c[key] }));
                      play(isDone ? "tick" : "correct");
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-3 py-2.5 text-right text-sm leading-7 transition-all",
                      isDone ? "border-forest-300 bg-forest-50 text-ink-500" : "border-forest-100 bg-white text-ink-700 hover:border-forest-300",
                    )}
                  >
                    <span className={cn("mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-md text-[11px] font-bold", isDone ? "bg-forest-600 text-white" : "bg-forest-100 text-forest-700")}>
                      {isDone ? "✓" : ""}
                    </span>
                    {s}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-ink-500">
            التزمت بـ <span className="num">{doneCount}</span> من <span className="num">{SAFETY.length}</span> بنود.
          </p>
        </Panel>

        <div className="space-y-4">
          <Card className="bg-paper-warm">
            <h4 className="text-base font-bold text-forest-900">لماذا تُؤرَّض صهاريج الوقود؟</h4>
            <p className="mt-2 text-sm leading-7 text-ink-700">
              أثناء التفريغ يتدفّق الوقود في الأنبوب فيُشحن بالدلك مع جدرانه. لو تراكمت الشحنة لقفت شرارة أشعلت البخار.
              لذلك يُوصل الصهريج بالأرض بناقل سميك قبل فتح الصمّام، فتتسرّب الشحنات بأمان.
            </p>
          </Card>
          <Card>
            <h4 className="text-base font-bold text-forest-900">ولماذا لا تؤذيك لسعة الباب؟</h4>
            <p className="mt-2 text-sm leading-7 text-ink-700">
              فرق الجهد قد يبلغ آلاف الفولتات، لكن كمية الشحنة والتيار صغيرتان جداً وزمن التفريغ ميكروثوانٍ، فلا تكفي
              الطاقة لإحداث أذى. الخطر يبدأ حين يكون المصدر قادراً على تمرير تيار مستمر مثل الشبكة المنزلية.
            </p>
          </Card>
          <Callout tone="danger" title="تحذير حاسم" icon={<IconShield className="h-4 w-4" />}>
            كل تجارب هذا الدرس تُجرى بأدوات منزلية آمنة (مشط، بالون، ورق، ماء). <strong>يُمنع منعاً باتاً</strong> الاقتراب
            من مأخذ الكهرباء المنزلي أو فتح أي جهاز كهربائي.
          </Callout>
        </div>
      </div>
      <DeepExplain
        title="كيف تتكوّن الصاعقة؟ قصّة شحنة عمرها دقائق"
        tone="tinted"
        intro="الصاعقة ليست «غضباً من السماء» بل تفريغ كهربائي ضخم تسبقه سلسلة أحداث منظّمة داخل السحابة. فهم هذه السلسلة يفسّر لماذا تُصيب الصاعقة الأماكن المرتفعة والمدبّبة تحديداً."
        parts={[
          {
            label: "١ — فصل الشحنات داخل السحابة",
            body: (
              <>
                في السحابة الركامية تيارات صاعدة قوية تحمل قطرات الماء إلى أعلى حيث تتجمّد. احتكاك بلورات الثلج الخفيفة الصاعدة بالحبيبات الثقيلة الهابطة ينزع الإلكترونات: تصعد الشحنات الموجبة إلى قمّة السحابة، وتهبط الشحنات السالبة إلى قاعدتها. هذه كهرباء ساكنة على مقياس الكيلومترات.
              </>
            ),
          },
          {
            label: "٢ — استقطاب الأرض",
            body: (
              <>
                القاعدة السالبة للسحابة تدفع إلكترونات سطح الأرض بعيداً، فتُستقطب الأرض تحتها بشحنة موجبة. وتتجمّع هذه الشحنة الموجبة على الأطراف المدبّبة والمرتفعة: قمم الأشجار، الأبراج، أطراف الصواري — لأن كثافة الشحنة تزداد عند الانحناء الحادّ.
              </>
            ),
          },
          {
            label: "٣ — القائد المتدرّج (Stepped Leader)",
            body: (
              <>
                عندما يتجاوز الحقل الكهربائي قدرة الهواء على العزل يبدأ الهواء بالتأيّن، وينزل من السحابة مسار متأين خافت على شكل خطوات طول كل منها نحو <span className="num">50</span> متراً، يتفرّع بحثاً عن أسهل طريق.
              </>
            ),
          },
          {
            label: "٤ — القائد الصاعد والالتقاء",
            body: (
              <>
                من الطرف المدبّب على الأرض ينطلق تيار صاعد لملاقاته. عند التقاء المسارين تكتمل قناة موصّلة بين السحابة والأرض — وهنا فقط تحدث الصاعقة المرئية.
              </>
            ),
          },
          {
            label: "٥ — الضربة العائدة والرعد",
            body: (
              <>
                يندفع تيار هائل (عشرات آلاف الأمبيرات) في جزء من مئة ألف من الثانية، فترتفع حرارة القناة إلى نحو <span className="num">30000</span> كلفن. يتمدّد الهواء انفجارياً فيولّد موجة ضغط نسمعها رعدها. أمّا الضوء فيصلنا فوراً لأنّ سرعة الضوء أكبر بنحو مليون مرة من سرعة الصوت.
              </>
            ),
          },
          {
            label: "٦ — لماذا تحمي مانعة الصواعق؟",
            body: (
              <>
                السنّ المدبّب يسمح للشحنة بأن تتسرّب بهدوء إلى الهواء (تفريغ الهالة) فتخفّف الفارق، وإن ضربت الصاعقة فإنّ الناقل السميك يقدّم مساراً منخفض المقاومة إلى الأرض بدل مرور التيار في جدران البناء أو تمديداته.
              </>
            ),
          },
        ]}
        formula={"d = v_{\\text{sound}}\\cdot t \\approx 340\\,t \\;\\Rightarrow\\; t = 3\\ \\mathrm{s} \\Rightarrow d \\approx 1\\ \\mathrm{km}"}
        formulaNote="اقسم عدد الثواني بين البرق والرعد على ثلاثة لتحصل على المسافة بالكيلومترات تقريباً."
        life="إذا رأيت البرق وسمعت الرعد بعد ٩ ثوانٍ فالعاصفة تبعد نحو ٣ كم فقط: أنت داخل نطاق الخطر ويجب أن تحتمي فوراً."
        misconception="خرافة شائعة: «الصاعقة لا تضرب المكان نفسه مرّتين». الحقيقة أنّ الأماكن المرتفعة والمدبّبة تُضرب مراراً، ومبنى إمباير ستيت يُضرب عشرات المرات سنوياً."
        check={{
          q: "لماذا يجب الانتظار ٣٠ دقيقة بعد آخر صوت رعد قبل الخروج؟",
          a: "لأنّ السحابة تبقى مشحونة وقد تتحرك نحوك، والصاعقة قد تضرب على بعد يصل إلى ١٥ كم من مركز العاصفة (ما يسمّى «الصاعقة من السماء الصافية»). ثلاثون دقيقة تضمن ابتعاد الخلية المشحونة.",
        }}
      />

      <DeepExplain
        title="التأريض: لماذا يحمي سلكٌ واحد كل هذا الجهاز؟"
        intro="كلمة «التأريض» تتكرّر في هذا الدرس: في الكاشف، وفي الصهريج، وفي مانعة الصواعق، وفي سوار فنّي الإلكترونيات. المبدأ واحد في كل الحالات."
        parts={[
          {
            label: "الأرض خزان شحنات لا نهائي عملياً",
            body: (
              <>
                حجم الأرض هائل مقارنة بأي جسم في المختبر، فإضافة مليار إلكترون إليها أو سحبها منها لا يغيّر حالتها. لذلك تصبح مرجعاً نعتبر جهده صفراً، وتستطيع أن تقبل أو تمنح إلكترونات دون حدود عملية.
              </>
            ),
          },
          {
            label: "الشحنة الزائدة تبحث عن أقصر طريق",
            body: (
              <>
                عند وصل جسم مشحون بناقل إلى الأرض، تتنافر شحناته المتماثلة وتنتشر على أكبر سطح متاح — والأرض أكبر سطح ممكن. خلال جزء من الثانية يعود الجسم متعادلاً.
              </>
            ),
          },
          {
            label: "منع التراكم أأمن من تفريغه",
            body: (
              <>
                في صهريج الوقود، الخطر ليس الشحنة نفسها بل الشرارة الناتجة عن تفريغها دفعة واحدة قرب البخار. التوصيل المستمر بالأرض يمنع التراكم أصلاً، فلا تنشأ شرارة.
              </>
            ),
          },
          {
            label: "ولماذا سوار المعصم في الإلكترونيات؟",
            body: (
              <>
                قطعة إلكترونية قد تتلف بتفريغ لا يشعر به الإنسان (بضع مئات من الفولتات). السوار المؤرَّض يسحب شحنة جسمك أولاً بأول فلا تصل إلى القطعة.
              </>
            ),
          },
        ]}
        formula={"V_{\\text{earth}} = 0 \\quad\\Rightarrow\\quad q_{\\text{excess}} \\longrightarrow 0"}
        life="لاحظ السلك الأخضر–الأصفر في مقابس بيتك: هو سلك التأريض الذي يصرّف أي شحنة أو تيار شارد إلى الأرض بدل جسمك."
        misconception="التأريض لا «يمحو» الشحنة من الوجود، بل ينقلها إلى جسم ضخم فتتوزّع فيه؛ فمبدأ انحفاظ الشحنة يبقى صحيحاً دائماً."
        check={{
          q: "هل يفيد تأريض جسم موضوع على حامل عازل في تجربة الحَثّ؟",
          a: "نعم، وهو أساس التكهرب بالحَثّ: التأريض اللحظي أثناء وجود الساق يسمح للإلكترونات المنفصلة بالهرب، فيبقى الجسم مشحوناً بشحنة مخالفة بعد رفع الإصبع ثم إبعاد الساق.",
        }}
      />
    </div>
  );
}