import { useMemo, useState } from "react";
import { Btn, Callout, Card, Panel, SourceTag, Stat } from "@/components/ui";
import { IconCheck, IconQuiz, IconReset, IconSparkle, IconX } from "@/components/icons";
import { T, TEq } from "@/lib/math";
import { ConceptMap } from "@/components/ConceptMap";
import { DeepExplain } from "@/components/Explain";
import { play } from "@/lib/sound";
import { cn } from "@/utils/cn";

type Question =
  | { id: number; level: string; kind: "mcq"; text: React.ReactNode; options: string[]; correct: number; explain: React.ReactNode }
  | { id: number; level: string; kind: "tf"; text: React.ReactNode; correct: boolean; explain: React.ReactNode }
  | { id: number; level: string; kind: "num"; text: React.ReactNode; answer: number; tolerance?: number; unit?: string; explain: React.ReactNode };

const QUESTIONS: Question[] = [
  {
    id: 1,
    level: "أساسي",
    kind: "mcq",
    text: "عند دلك مسطرة بلاستيكية بقطعة صوف، فإنّ المسطرة:",
    options: ["تكتسب إلكترونات وتُشحن سالباً", "تفقد إلكترونات وتُشحن موجباً", "تكتسب بروتونات وتُشحن موجباً", "تبقى متعادلة"],
    correct: 0,
    explain: "البلاستيك أقرب إلى قاع سلّم التكهرب، فينتزع الإلكترونات من الصوف ويصبح سالباً، بينما يصبح الصوف موجباً بالمقدار نفسه.",
  },
  {
    id: 2,
    level: "أساسي",
    kind: "tf",
    text: "الجسم المشحون موجباً هو الذي اكتسب إلكترونات إضافية.",
    correct: false,
    explain: "العكس: الجسم الذي يفقد إلكترونات يصبح موجباً، لأنّ شحنات البروتونات الموجبة تزيد عن الإلكترونات السالبة.",
  },
  {
    id: 3,
    level: "أساسي",
    kind: "mcq",
    text: "وحدة قياس الشحنة الكهربائية في الجملة الدولية هي:",
    options: ["النيوتن N", "الكولوم C", "الفولت V", "الأمبير A"],
    correct: 1,
    explain: (
      <>
        الشحنة تُقاس بالكولوم، وشحنة الإلكترون <T e="e = 1.6\times 10^{-19}\ \mathrm{C}" label="شحنة الإلكترون" />.
      </>
    ),
  },
  {
    id: 4,
    level: "متوسط",
    kind: "num",
    text: (
      <>
        كم إلكتروناً يلزم ليكون مقدار الشحنة <T e="3.2\times 10^{-18}\ \mathrm{C}" label="3.2 في 10 أس ناقص 18 كولوم" />؟
      </>
    ),
    answer: 20,
    explain: (
      <>
        <TEq e="n = \dfrac{q}{e} = \dfrac{3.2\times 10^{-18}}{1.6\times 10^{-19}} = 20" label="عدد الإلكترونات" />
      </>
    ),
  },
  {
    id: 5,
    level: "أساسي",
    kind: "mcq",
    text: "شحنتان موجبتان قُرِّبتا إحداهما من الأخرى، فإنّهما:",
    options: ["تتجاذبان", "تتنافران", "لا تتأثران", "تتعادلان"],
    correct: 1,
    explain: "الشحنتان المتماثلتان تتنافران دائماً، والمختلفتان تتجاذبان.",
  },
  {
    id: 6,
    level: "متقدم",
    kind: "mcq",
    text: (
      <>
        شحنتان <T e="q_1 = 4\ \mathrm{nC}" label="4 نانوكولوم" /> و<T e="q_2 = 9\ \mathrm{nC}" label="9 نانوكولوم" /> تفصل
        بينهما مسافة <T e="6\ \mathrm{cm}" label="6 سنتيمترات" /> في الهواء. مقدار القوة المتبادلة:
      </>
    ),
    options: ["9×10⁻⁵ N", "9×10⁻⁴ N", "3.6×10⁻³ N", "9×10⁻⁹ N"],
    correct: 0,
    explain: (
      <>
        <TEq e="F = 9\times 10^{9}\cdot\dfrac{(4\times 10^{-9})(9\times 10^{-9})}{(0.06)^{2}} = 9\times 10^{-5}\ \mathrm{N}" label="حساب القوة" />
      </>
    ),
  },
  {
    id: 7,
    level: "متوسط",
    kind: "mcq",
    text: "إذا ضاعفنا المسافة بين شحنتين نقطيتين مع ثبات مقدارهما، فإنّ القوة بينهما:",
    options: ["تتضاعف", "تبقى ثابتة", "تصبح ربع قيمتها", "تصبح نصف قيمتها"],
    correct: 2,
    explain: (
      <>
        لأنّ <T e="F \propto \dfrac{1}{d^{2}}" label="تناسب عكسي مع مربع المسافة" />، فعند مضاعفة{" "}
        <T e="d" label="المسافة" /> تصبح القوة <T e="\dfrac{F}{4}" label="ربع القوة" />.
      </>
    ),
  },
  {
    id: 8,
    level: "متوسط",
    kind: "tf",
    text: "في التكهرب بالحَثّ يُشحن الجسم بشحنة مماثلة لشحنة الجسم المؤثّر.",
    correct: false,
    explain: "الحَثّ يُعطي شحنة مخالفة لشحنة الساق، بينما اللمس هو الذي يُعطي شحنة مماثلة.",
  },
  {
    id: 9,
    level: "أساسي",
    kind: "mcq",
    text: "أيّ المواد التالية عازلة للكهرباء؟",
    options: ["النحاس", "الماء المالح", "الزجاج الجاف", "الألمنيوم"],
    correct: 2,
    explain: "الزجاج الجاف عازل، ولهذا تُصنع منه حوامل التجارب، أمّا المعادن والماء المالح فنواقل.",
  },
  {
    id: 10,
    level: "تفكير",
    kind: "mcq",
    text: "تنجذب قصاصات الورق المتعادلة نحو مشط مشحون بسبب:",
    options: [
      "انتقال شحنة المشط إلى الورق",
      "الاستقطاب: اقتراب الشحنات المخالفة وابتعاد المماثلة",
      "قوة الجاذبية الأرضية",
      "ارتفاع درجة حرارة الورق",
    ],
    correct: 1,
    explain: "الاستقطاب يجعل السطح القريب مخالف الشحنة والبعيد مماثلها، ولأن القوة تضعف مع المسافة يغلب التجاذب.",
  },
  {
    id: 11,
    level: "أساسي",
    kind: "tf",
    text: "الشحنة الكهربائية لا تُستحدث ولا تفنى، وإنما تنتقل من جسم إلى آخر.",
    correct: true,
    explain: "هذا هو مبدأ انحفاظ الشحنة، ولذلك يظهر على الجسمين المدلوكين شحنتان متساويتان في المقدار ومتعاكستان.",
  },
  {
    id: 12,
    level: "متقدم",
    kind: "num",
    text: (
      <>
        كم إلكتروناً في شحنة مقدارها <T e="1.6\times 10^{-16}\ \mathrm{C}" label="1.6 في 10 أس ناقص 16 كولوم" />؟
      </>
    ),
    answer: 1000,
    explain: (
      <>
        <TEq e="n = \dfrac{1.6\times 10^{-16}}{1.6\times 10^{-19}} = 10^{3} = 1000" label="عدد الإلكترونات" />
      </>
    ),
  },
  {
    id: 13,
    level: "متوسط",
    kind: "mcq",
    text: "وظيفة مانعة الصواعق هي:",
    options: [
      "منع تكوّن الشحنات في السحب",
      "توصيل الشحنات إلى الأرض بأمان عبر ناقل سميك",
      "زيادة مقاومة الهواء للتفريغ",
      "تخزين طاقة الصاعقة لاستعمالها",
    ],
    correct: 1,
    explain: "المانعة لا تمنع الصاعقة، بل توفّر لها طريقاً منخفض المقاومة إلى الأرض بعيداً عن البناء وسكّانه.",
  },
  {
    id: 14,
    level: "تفكير",
    kind: "mcq",
    text: "لماذا تفشل تجارب الكهرباء الساكنة غالباً في يوم رطب؟",
    options: [
      "لأنّ الهواء الرطب يزيد قوة كولوم",
      "لأنّ الإلكترونات تختفي",
      "لأنّ طبقة الماء الرقيقة على الأسطح توصّل الشحنات فتتسرّب",
      "لأنّ درجة الحرارة تُلغي الشحنة",
    ],
    correct: 2,
    explain: "بخار الماء يشكّل طبقة ناقلة رقيقة على الأسطح، فتتسرّب الشحنة قبل أن تتراكم.",
  },
];

const LEVEL_TONE: Record<string, string> = {
  أساسي: "bg-forest-100 text-forest-800",
  متوسط: "bg-lagoon-500/10 text-lagoon-600",
  متقدم: "bg-spark-50 text-spark-600",
  تفكير: "bg-berry-100 text-berry-600",
};

function normalizeDigits(input: string) {
  const map: Record<string, string> = { "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9" };
  return input.replace(/[٠-٩]/g, (d) => map[d]).replace(/[^\d.\-]/g, "");
}

export function StationQuiz({ onGoto }: { onGoto: (tab: string) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { value: string; correct: boolean }>>({});
  const [draft, setDraft] = useState("");
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[index];
  const record = answers[q.id];
  const score = useMemo(() => Object.values(answers).filter((a) => a.correct).length, [answers]);

  const evaluate = (): boolean => {
    if (q.kind === "mcq") return Number(draft) === q.correct;
    if (q.kind === "tf") return (draft === "true") === q.correct;
    const val = Number(normalizeDigits(draft));
    if (!Number.isFinite(val)) return false;
    const tol = q.tolerance ?? Math.max(0.01, Math.abs(q.answer) * 0.02);
    return Math.abs(val - q.answer) <= tol;
  };

  const check = () => {
    if (draft === "" || checked) return;
    const ok = evaluate();
    setAnswers((a) => ({ ...a, [q.id]: { value: draft, correct: ok } }));
    setChecked(true);
    play(ok ? "correct" : "wrong");
  };

  const next = () => {
    if (index === QUESTIONS.length - 1) {
      setFinished(true);
      play("spark");
      return;
    }
    setIndex((i) => i + 1);
    setDraft("");
    setChecked(false);
  };

  const restart = () => {
    setIndex(0);
    setAnswers({});
    setDraft("");
    setChecked(false);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div className="space-y-6">
        <Panel title="نتيجتك في اختبار الدرس" subtitle="راجع كل سؤال مع تفسيره، ثم أعِد المحاولة إن أحببت" icon={<IconQuiz className="h-5 w-5" />}>
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="الإجابات الصحيحة" value={<span className="num">{score} / {QUESTIONS.length}</span>} tone="forest" />
            <Stat label="النسبة المئوية" value={<span className="num">{pct}%</span>} tone="spark" />
            <Stat
              label="التقدير"
              value={pct >= 85 ? "ممتاز" : pct >= 70 ? "جيد جداً" : pct >= 50 ? "جيد" : "يحتاج مراجعة"}
              tone={pct >= 70 ? "lagoon" : "berry"}
            />
            <Stat label="أسئلة التفكير" value={<span className="num">{QUESTIONS.filter((x) => x.level === "تفكير").length}</span>} tone="neutral" />
          </div>

          <ol className="mt-6 space-y-3">
            {QUESTIONS.map((item, i) => {
              const a = answers[item.id];
              const ok = a?.correct;
              return (
                <li key={item.id} className={cn("rounded-2xl border p-4", ok ? "border-forest-200 bg-forest-50" : "border-berry-500/30 bg-berry-100/40")}>
                  <div className="flex items-start gap-3">
                    <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-xl text-white", ok ? "bg-forest-600" : "bg-berry-500")}>
                      {ok ? <IconCheck className="h-4 w-4" /> : <IconX className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-forest-900">
                        <span className="num">{i + 1}.</span> {item.text}
                      </p>
                      <div className="mt-1 text-sm leading-7 text-ink-700">{item.explain}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex flex-wrap gap-3">
            <Btn variant="primary" onClick={restart}>
              <IconReset className="h-4 w-4" />
              إعادة الاختبار
            </Btn>
          </div>
        </Panel>

        <Card>
          <SourceTag kind="platform" />
          <h4 className="mt-3 flex items-center gap-2 text-base font-bold text-forest-900">
            <IconSparkle className="h-4 w-4 text-spark-500" />
            بطاقة المراجعة السريعة
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { t: "الشحنة", f: "q = n\\cdot e,\\quad e = 1.6\\times 10^{-19}\\ \\mathrm{C}" },
              { t: "قانون كولوم", f: "F = K\\dfrac{|q_1 q_2|}{d^{2}},\\quad K = 9\\times 10^{9}" },
              { t: "التحويل", f: "1\\ \\mathrm{nC} = 10^{-9}\\ \\mathrm{C},\\quad 1\\ \\mathrm{cm} = 10^{-2}\\ \\mathrm{m}" },
              { t: "الحَثّ مقابل اللمس", f: "q_{\\text{induction}} = -q_{\\text{rod}},\\quad q_{\\text{contact}} = +q_{\\text{rod}}" },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-forest-200 bg-white p-3">
                <p className="text-xs font-bold text-forest-700">{c.t}</p>
                <TEq e={c.f} label={c.t} />
              </div>
            ))}
          </div>
        </Card>

        <ConceptMap onGoto={onGoto} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Panel
        title={`السؤال ${index + 1} من ${QUESTIONS.length}`}
        subtitle="اختر إجابتك ثم اضغط «تحقّق» — لا تُكشف الإجابة قبل المحاولة"
        icon={<IconQuiz className="h-5 w-5" />}
        actions={<span className={cn("rounded-full px-3 py-1 text-xs font-bold", LEVEL_TONE[q.level])}>{q.level}</span>}
      >
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-forest-100">
          <div
            className="h-full rounded-full bg-gradient-to-l from-forest-700 to-spark-400 transition-all duration-500"
            style={{ width: `${((index + (checked ? 1 : 0)) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <p className="text-lg font-bold leading-9 text-forest-950">{q.text}</p>

        <div className="mt-5 space-y-2.5">
          {q.kind === "mcq" &&
            q.options.map((opt, i) => {
              const selected = draft === String(i);
              const isCorrect = checked && i === q.correct;
              const isWrong = checked && selected && i !== q.correct;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={checked}
                  onClick={() => {
                    setDraft(String(i));
                    play("tick");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-right text-sm font-semibold transition-all",
                    isCorrect
                      ? "border-forest-500 bg-forest-100 text-forest-900"
                      : isWrong
                        ? "border-berry-500 bg-berry-100 text-berry-600 anim-shake"
                        : selected
                          ? "border-forest-400 bg-forest-50 text-forest-900"
                          : "border-forest-200 bg-white text-ink-700 hover:border-forest-300 hover:bg-forest-50",
                  )}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-forest-100 text-xs font-bold text-forest-700">
                    {["أ", "ب", "ج", "د"][i]}
                  </span>
                  {opt}
                </button>
              );
            })}

          {q.kind === "tf" && (
            <div className="flex flex-wrap gap-3">
              {[
                { v: "true", label: "صحيحة", tone: "forest" },
                { v: "false", label: "خاطئة", tone: "berry" },
              ].map((o) => {
                const selected = draft === o.v;
                const reveal = checked && ((o.v === "true") === q.correct);
                return (
                  <button
                    key={o.v}
                    type="button"
                    disabled={checked}
                    onClick={() => {
                      setDraft(o.v);
                      play("tick");
                    }}
                    className={cn(
                      "min-w-32 rounded-2xl border px-6 py-3 text-sm font-bold transition-all",
                      reveal
                        ? "border-forest-500 bg-forest-100 text-forest-900"
                        : selected
                          ? "border-forest-400 bg-forest-50 text-forest-900"
                          : "border-forest-200 bg-white text-ink-700 hover:border-forest-300",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {q.kind === "num" && (
            <div className="flex flex-wrap items-center gap-3">
              <input
                dir="ltr"
                inputMode="decimal"
                disabled={checked}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="اكتب العدد هنا"
                className="num w-48 rounded-2xl border border-forest-200 bg-white px-4 py-3 text-center text-lg font-bold text-forest-900 outline-none transition-colors focus:border-forest-400"
              />
              <span className="text-sm text-ink-500">تُقبل الأرقام العربية والإنكليزية</span>
            </div>
          )}
        </div>

        {checked && (
          <div className="anim-rise mt-5">
            <Callout tone={record?.correct ? "success" : "danger"} title={record?.correct ? "إجابة صحيحة 🎉" : "إجابة غير صحيحة"}>
              {q.explain}
            </Callout>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Btn variant="primary" onClick={check} disabled={checked || draft === ""}>
            تحقّق من الإجابة
          </Btn>
          <Btn variant="spark" onClick={next} disabled={!checked}>
            {index === QUESTIONS.length - 1 ? "عرض النتيجة" : "السؤال التالي"}
          </Btn>
          <Btn variant="ghost" onClick={restart}>
            <IconReset className="h-4 w-4" />
            إعادة من البداية
          </Btn>
          <span className="mr-auto rounded-full bg-forest-100 px-3 py-1 text-xs font-bold text-forest-800">
            النتيجة الحالية: <span className="num">{score}</span>
          </span>
        </div>
      </Panel>

      <ConceptMap onGoto={onGoto} />
      <DeepExplain
        title="كيف تذاكر هذا الدرس وتحلّ أسئلته بثقة؟"
        tone="tinted"
        intro="أسئلة الكهرباء الساكنة في الامتحان ثلاثة أنواع فقط. إذا عرفت النوع عرفت الطريق قبل أن تقرأ آخر سطر من السؤال."
        parts={[
          {
            label: "النوع الأول — أسئلة التعليل",
            body: (
              <>
                «لماذا ينجذب الورق؟»، «لماذا يفشل الدلك في يوم رطب؟». الإجابة النموذجية جملة واحدة تحتوي: الظاهرة (استقطاب/تسرّب) + السبب الفيزيائي (القوة تضعف مع المسافة / الماء ناقل) + النتيجة. لا تكتب سطرين بلا كلمة مفتاحية.
              </>
            ),
          },
          {
            label: "النوع الثاني — أسئلة المقارنة",
            body: (
              <>
                الدلك/اللمس/الحَثّ، أو النواقل/العوازل. ارسم جدولاً ذهنيّاً من ثلاثة أعمدة: هل يلزم التلامس؟ ما إشارة الشحنة الناتجة؟ ماذا يحدث لشحنة الجسم المؤثّر؟ الإجابة الكاملة تذكر الأعمدة الثلاثة.
              </>
            ),
          },
          {
            label: "النوع الثالث — المسائل الحسابية",
            body: (
              <>
                إما q = n·e (عدّ إلكترونات)، أو F = K|q₁q₂|/d² (قوة). في كلتيهما المعركة الحقيقية هي التحويل: نانوكولوم ← كولوم، سنتيمتر ← متر. اكتب التحويل في سطر مستقل قبل التعويض.
              </>
            ),
          },
          {
            label: "خطة مراجعة من ٢٠ دقيقة",
            body: (
              <>
                ٥ دقائق لخريطة المفاهيم أعلاه، ٥ دقائق لجدول طرائق التكهرب، ٥ دقائق لحل مسألتين حسابيتين بيدك دون نظر إلى الحل، ٥ دقائق لتجربة المشط والورق فعلياً على طاولتك — التجربة ترسّخ الفكرة أكثر من القراءة عشر مرات.
              </>
            ),
          },
        ]}
        formula={"q = n\\,e \\qquad\\text{and}\\qquad F = K\\dfrac{|q_1q_2|}{d^{2}}"}
        formulaNote="قانونان فقط في هذا الدرس — وكل الأسئلة الحسابية تخرج منهما."
        misconception="لا تحفظ النتائج دون التجربة الذهنية: اسأل نفسك دائماً «إلى أين ذهبت الإلكترونات؟» في كل خطوة، فالإجابة على هذا السؤال تحلّ 90% من أسئلة الدرس."
        check={{
          q: "سؤال امتحاني: «جسمان تجاذبا، هل يلزم أن يكونا مشحونين بشحنتين مختلفتين؟»",
          a: "لا يلزم؛ فقد يكون أحدهما مشحوناً والآخر متعادلاً فينجذبان بالاستقطاب. التجاذب لا يثبت وجود شحنتين، لكنّ التنافر يثبت ذلك قطعاً — لأنّ التنافر لا يحدث إلا بين شحنتين متماثلتين.",
        }}
      />
    </div>
  );
}