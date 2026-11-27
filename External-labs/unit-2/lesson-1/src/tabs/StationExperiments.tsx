import { useEffect, useMemo, useRef, useState } from "react";
import { Btn, Callout, Card, Panel, Slider, SourceTag, Stat, useLocalStorage } from "@/components/ui";
import { IconCheck, IconDownload, IconFlask, IconPause, IconPlay, IconReset, IconShield, IconTimer } from "@/components/icons";
import { T, TEq, plainSci } from "@/lib/math";
import { coulombForce } from "@/lib/physics";
import { play } from "@/lib/sound";
import { cn } from "@/utils/cn";
import { ExperimentArt } from "@/components/art";
import { DeepExplain } from "@/components/Explain";

/* ------------------------------------------------------------------ */
/* inline simulations                                                  */
/* ------------------------------------------------------------------ */

function PaperSim() {
  const [rub, setRub] = useState(14);
  const [dist, setDist] = useState(3);
  const q = rub * 0.6;
  const force = coulombForce(q, q * 0.35, dist);
  const lifted = force > 1.2e-4;
  const combY = 8 + dist * 3.4;

  const bits = [
    { x: 62, rot: -12 },
    { x: 116, rot: 18 },
    { x: 170, rot: -22 },
    { x: 224, rot: 14 },
    { x: 278, rot: -6 },
  ];

  return (
    <div className="rounded-2xl border border-forest-200 bg-forest-50 p-4">
      <p className="text-xs font-bold text-forest-800">محاكاة مصغّرة: هل تقفز القصاصات؟</p>
      <svg viewBox="0 0 340 152" className="mt-2 w-full" role="img" aria-label="محاكاة جذب قصاصات الورق">
        <title>محاكاة المشط وقصاصات الورق</title>
        <defs>
          <linearGradient id="simComb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3fb08a" />
            <stop offset="50%" stopColor="#1e7f63" />
            <stop offset="100%" stopColor="#0d4a3a" />
          </linearGradient>
          <linearGradient id="simTable" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6ecd9" />
            <stop offset="100%" stopColor="#e6d3b3" />
          </linearGradient>
          <linearGradient id="simPaper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ece6d8" />
          </linearGradient>
        </defs>
        <rect width="340" height="152" rx="14" fill="#ffffff" />
        <rect x="0" y="132" width="340" height="20" fill="url(#simTable)" />
        <line x1="0" y1="132" x2="340" y2="132" stroke="#c4703f" strokeOpacity="0.4" />

        <g style={{ transform: `translateY(${combY}px)`, transition: "transform 320ms cubic-bezier(0.22,1,0.36,1)" }}>
          <rect x="70" y="4" width="200" height="16" rx="8" fill="url(#simComb)" />
          <rect x="76" y="7" width="188" height="4" rx="2" fill="#ffffff" opacity="0.3" />
          {Array.from({ length: 18 }).map((_, i) => (
            <path key={i} d={`M${78 + i * 10.5} 20 h5.6 l-1.2 18 h-3.2 z`} fill="url(#simComb)" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i}>
              <circle cx={88 + i * 33} cy={0} r="7" fill="#1f8fa6" opacity="0.16" />
              <circle cx={88 + i * 33} cy={0} r="4.2" fill="#1f8fa6" />
              <line x1={85.6 + i * 33} y1={0} x2={90.4 + i * 33} y2={0} stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {lifted &&
          [116, 170, 224].map((x) => (
            <path key={x} d={`M${x} ${combY + 44} C ${x - 4} ${combY + 56}, ${x + 3} ${combY + 66}, ${x} 118`} fill="none" stroke="#e9a22b" strokeWidth="1.4" strokeDasharray="4 5" className="anim-dash" opacity="0.8" />
          ))}

        {bits.map((b, i) => {
          const up = lifted && i > 0 && i < 4 ? 30 + (i % 3) * 12 : 0;
          return (
            <g key={b.x} style={{ transform: `translateY(${-up}px)`, transition: "transform 620ms cubic-bezier(0.34,1.56,0.64,1)" }}>
              <g transform={`translate(${b.x} 122) rotate(${b.rot})`}>
                <rect x="-13" y="-8" width="26" height="15" rx="2.5" fill="url(#simPaper)" stroke="#c9b58f" />
                <text x="-9" y="4" fontSize="9" fontWeight="800" fill="#e05a45">
                  +
                </text>
                <text x="3" y="4" fontSize="9" fontWeight="800" fill="#1f8fa6">
                  −
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="قوة الدلك" value={rub} min={0} max={30} onChange={setRub} valueTex={<T e={`${(rub * 0.6).toFixed(1)}\\ \\mathrm{nC}`} label="شحنة المشط" />} />
        <Slider label="بُعد المشط" value={dist} min={1} max={12} onChange={setDist} valueTex={<T e={`${dist}\\ \\mathrm{cm}`} label="المسافة" />} tone="lagoon" />
      </div>
      <p className={cn("mt-2 rounded-xl px-3 py-2 text-center text-sm font-bold transition-colors", lifted ? "bg-forest-100 text-forest-800" : "bg-white text-ink-500")}>
        {lifted ? `قفزت القصاصات! القوة التقريبية ${plainSci(force, 2)} نيوتن` : "القوة ما تزال أصغر من وزن القصاصة — زِد الدلك أو قرّب المشط."}
      </p>
    </div>
  );
}

function WaterSim() {
  const [q, setQ] = useState(10);
  const [dist, setDist] = useState(5);
  const bend = Math.min(52, (q / dist) * 10);

  return (
    <div className="rounded-2xl border border-forest-200 bg-forest-50 p-4">
      <p className="text-xs font-bold text-forest-800">محاكاة مصغّرة: انحراف خيط الماء</p>
      <svg viewBox="0 0 340 164" className="mt-2 w-full" role="img" aria-label="محاكاة انحراف خيط الماء نحو ساق مشحونة">
        <title>محاكاة خيط الماء والساق المشحونة</title>
        <defs>
          <linearGradient id="simMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2f7f5" />
            <stop offset="40%" stopColor="#b9c9c3" />
            <stop offset="100%" stopColor="#5e7268" />
          </linearGradient>
          <linearGradient id="simWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bfeaf1" />
            <stop offset="55%" stopColor="#7fcbd3" />
            <stop offset="100%" stopColor="#4fb0bd" />
          </linearGradient>
          <linearGradient id="simRod" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a9e2e8" />
            <stop offset="55%" stopColor="#2e9aa6" />
            <stop offset="100%" stopColor="#12505a" />
          </linearGradient>
        </defs>
        <rect width="340" height="164" rx="14" fill="#ffffff" />

        {/* faucet */}
        <rect x="30" y="14" width="16" height="34" rx="6" fill="url(#simMetal)" />
        <path d="M30 24 h44 a10 10 0 0 1 10 10 v8 h-14 v-5 a3 3 0 0 0 -3 -3 H30 z" fill="url(#simMetal)" />
        <circle cx="38" cy="10" r="8" fill="url(#simMetal)" />

        {/* stream */}
        <path
          d={`M74 44 C 74 84, ${74 + bend} 108, ${68 + bend * 1.5} 150`}
          stroke="url(#simWater)"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          style={{ transition: "d 320ms ease" }}
        />
        <path
          d={`M74 46 C 74 84, ${72 + bend} 106, ${66 + bend * 1.5} 146`}
          stroke="#ffffff"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
          style={{ transition: "d 320ms ease" }}
        />
        <ellipse cx={78 + bend * 1.4} cy="152" rx="54" ry="8" fill="#d7ece4" />

        {/* rod */}
        <g transform={`translate(${dist * 3} 0)`}>
          <rect x="196" y="86" width="112" height="18" rx="9" fill="url(#simRod)" />
          <rect x="202" y="89" width="100" height="4.5" rx="2.2" fill="#ffffff" opacity="0.3" />
          {Array.from({ length: 4 }).map((_, i) => (
            <g key={i}>
              <circle cx={212 + i * 26} cy={74} r="7.5" fill="#1f8fa6" opacity="0.16" />
              <circle cx={212 + i * 26} cy={74} r="4.6" fill="#1f8fa6" />
              <line x1={209.4 + i * 26} y1={74} x2={214.6 + i * 26} y2={74} stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}
          <text x="252" y="120" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#227f8c">
            ساق مشحونة
          </text>
        </g>
        <path d={`M${186 + dist * 3} 94 C ${150 + dist * 2} 100, ${120 + bend} 112, ${86 + bend} 128`} fill="none" stroke="#2e9aa6" strokeWidth="1.4" strokeDasharray="5 6" className="anim-dash" opacity="0.75" />
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="شحنة الساق" value={q} min={0} max={20} onChange={setQ} valueTex={<T e={`${q}\\ \\mathrm{nC}`} label="الشحنة" />} />
        <Slider label="المسافة" value={dist} min={2} max={14} onChange={setDist} valueTex={<T e={`${dist}\\ \\mathrm{cm}`} label="المسافة" />} tone="lagoon" />
      </div>
      <p className="mt-2 rounded-xl bg-white px-3 py-2 text-center text-sm font-bold text-forest-800">
        زاوية الانحراف التقريبية: <span className="num">{Math.round(bend)}</span>° — الماء متعادل لكنّ جزيئاته قطبية!
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* timer                                                               */
/* ------------------------------------------------------------------ */

function MiniTimer({ seconds, label }: { seconds: number; label: string }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          window.clearInterval(id);
          setRunning(false);
          play("spark");
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const pct = 1 - left / seconds;
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-forest-200 bg-white p-3">
      <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0">
        <circle cx="32" cy="32" r={R} fill="none" stroke="#e3f4ec" strokeWidth="7" />
        <circle
          cx="32"
          cy="32"
          r={R}
          fill="none"
          stroke={left === 0 ? "#e9a22b" : "#2fa07c"}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
        <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="700" fill="#16594a">
          {left}
        </text>
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-ink-700">{label}</p>
        <p className="text-[11px] text-ink-500">{left === 0 ? "انتهى الوقت — سجّل ملاحظتك!" : "مؤقّت التجربة"}</p>
        <div className="mt-1.5 flex gap-2">
          <Btn variant={running ? "ghost" : "primary"} onClick={() => setRunning((r) => !r)}>
            {running ? <IconPause className="h-3.5 w-3.5" /> : <IconPlay className="h-3.5 w-3.5" />}
            {running ? "إيقاف" : "تشغيل"}
          </Btn>
          <Btn
            variant="ghost"
            onClick={() => {
              setRunning(false);
              setLeft(seconds);
            }}
          >
            <IconReset className="h-3.5 w-3.5" />
            تصفير
          </Btn>
        </div>
      </div>
      <IconTimer className="h-5 w-5 shrink-0 text-forest-400" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* data                                                                */
/* ------------------------------------------------------------------ */

type Experiment = {
  id: string;
  title: string;
  hook: string;
  illo: string;
  tools: string[];
  steps: string[];
  observation: string;
  science: React.ReactNode;
  safety: string;
  timer?: { seconds: number; label: string };
  sim?: "paper" | "water";
  goto?: { tab: string; label: string };
};

const EXPERIMENTS: Experiment[] = [
  {
    id: "comb",
    title: "المشط وقصاصات الورق",
    hook: "أشهر تجربة في الدرس، وأنجحها في يوم جاف.",
    illo: "comb",
    tools: ["مشط بلاستيكي جاف", "قصاصات ورق صغيرة (٥ مم)", "قطعة صوف أو شعر جاف"],
    steps: [
      "قصّ ورقة إلى قصاصات صغيرة جداً وضعها على طاولة جافة.",
      "قرّب المشط من القصاصات قبل الدلك ولاحظ: لا شيء يحدث.",
      "دلك المشط بشعرك أو بالصوف مدة ٢٠ ثانية.",
      "قرّب المشط من القصاصات دون لمسها.",
      "كرّر التجربة بعد ترطيب المشط بالماء ولاحظ الفرق.",
    ],
    observation: "تقفز القصاصات وتلتصق بالمشط، ثم قد تسقط بعد لحظات لأنها اكتسبت شحنة مماثلة فتنافرت.",
    science: (
      <>
        المشط المدلوك يكتسب إلكترونات فيصبح سالباً، ويستقطب كل قصاصة: يقترب منها الجانب الموجب ويبتعد السالب. ولأن{" "}
        <T e="F \propto \dfrac{1}{d^{2}}" label="القوة تتناسب عكساً مع مربع المسافة" /> فإنّ تجاذب الجانب القريب يغلب
        تنافر الجانب البعيد.
      </>
    ),
    safety: "تجربة آمنة تماماً. تجنّب استعمال مشط مبلّل أو لمس مأخذ كهربائي.",
    timer: { seconds: 20, label: "زمن الدلك الموصى به" },
    sim: "paper",
    goto: { tab: "forces", label: "افتح مختبر التجاذب" },
  },
  {
    id: "water",
    title: "حَرْف مجرى الماء الرقيق",
    hook: "الماء متعادل… ومع ذلك ينجذب! لماذا؟",
    illo: "water",
    tools: ["صنبور ماء", "بالون أو مشط أو أنبوب PVC", "قطعة صوف"],
    steps: [
      "افتح الصنبور حتى تحصل على خيط ماء رفيع جداً ومستمر.",
      "دلك البالون بالصوف جيداً.",
      "قرّب البالون من خيط الماء على بعد سنتيمترات دون أن يلمسه.",
      "لاحظ اتجاه انحراف الخيط، وغيّر المسافة وراقب.",
    ],
    observation: "ينحرف خيط الماء بوضوح نحو البالون، ويزداد الانحراف كلما اقتربت.",
    science: (
      <>
        جزيء الماء <strong>قطبي</strong>: طرفه الموجب (الهيدروجين) وطرفه السالب (الأكسجين). عند اقتراب جسم سالب تدور
        الجزيئات فتُقدّم أطرافها الموجبة، فتتغلّب قوة التجاذب. الانحراف يوضح أنّ القوة تزداد بنقصان المسافة{" "}
        <T e="d" label="المسافة" />.
      </>
    ),
    safety: "لا تقرب أي جهاز كهربائي من الماء. اكتفِ بالصنبور والبالون.",
    sim: "water",
    goto: { tab: "coulomb", label: "افتح مختبر كولوم" },
  },
  {
    id: "balloon",
    title: "البالون الذي يقف الشعر ويلتصق بالجدار",
    hook: "تجربة تضحك العائلة وتشرح الاستقطاب في ثانية.",
    illo: "balloon",
    tools: ["بالون منفوخ", "شعر جاف ونظيف", "جدار مطلي أو مرآة"],
    steps: [
      "دلك البالون بشعرك ١٥ ثانية.",
      "أبعده قليلاً وراقب خصلات الشعر واقفة نحوه.",
      "ألصق البالون بالجدار واتركه: يبقى معلّقاً.",
      "احسب كم ثانية يبقى قبل أن يسقط، وسجّل الرقم.",
    ],
    observation: "يقف الشعر لأن كل خصلة اكتسبت شحنة مماثلة فتنافرت مع أخواتها وانجذبت للبالون، ويبقى البالون على الجدار بفعل استقطاب سطح الجدار.",
    science: (
      <>
        البالون يكتسب إلكترونات من الشعر: <T e="q_{\text{balloon}} = -q_{\text{hair}}" label="شحنة البالون تساوي سالب شحنة الشعر" />.
        الشعر الموجب تتنافر خصلاته فتتفرّق، والجدار المتعادل يُستقطب فيلتصق به البالون حتى تتسرّب الشحنة ببطء.
      </>
    ),
    safety: "احذر من فرقعة البالون قرب الأذن، ونظّف المكان بعد التجربة.",
    timer: { seconds: 15, label: "زمن دلك البالون" },
  },
  {
    id: "can",
    title: "سباق علبة الصودا الفارغة",
    hook: "حرّك جسماً معدنياً دون أن تلمسه.",
    illo: "can",
    tools: ["علبة معدنية فارغة وجافة", "بالون مدلوك أو أنبوب PVC", "طاولة ملساء"],
    steps: [
      "ضع العلبة على جنبها فوق طاولة أفقية ملساء.",
      "دلك البالون بالصوف جيداً.",
      "قرّب البالون من العلبة على بعد ٢ سم دون لمس.",
      "حرّك البالون ببطء إلى الأمام: ستتدحرج العلبة خلفه.",
      "جرّب تغيير المسافة وسجّل أبعد مسافة ما زالت العلبة تتحرّك عندها.",
    ],
    observation: "تتدحرج العلبة نحو البالون وتتبعه؛ وكلما ابتعد البالون ضعُف السحب حتى يتوقف.",
    science: (
      <>
        العلبة <strong>ناقل</strong> متعادل: عند اقتراب البالون السالب تهرب إلكتروناتها إلى الجهة البعيدة وتبقى الجهة
        القريبة موجبة، فيظهر تجاذب صافٍ. قارن مع{" "}
        <T e="F = K\dfrac{|q_1 q_2|}{d^{2}}" label="قانون كولوم" /> لترى لماذا يتوقف السحب بسرعة عند زيادة المسافة.
      </>
    ),
    safety: "احذر من حواف العلبة الحادّة، ولا تستعمل علباً ممتلئة.",
    goto: { tab: "forces", label: "افتح مختبر التجاذب" },
  },
  {
    id: "jar",
    title: "اصنع كاشفاً كهربائياً في البيت",
    hook: "أداة مخبرية حقيقية من برطمان وسلك.",
    illo: "jar",
    tools: ["برطمان زجاجي جاف", "سلك نحاسي سميك", "ورق ألمنيوم (رقاقتان)", "بالون مدلوك"],
    steps: [
      "اثقب غطاء البرطمان ومرّر السلك، واثنِ طرفه العلوي على شكل قرص.",
      "علّق في الطرف السفلي رقاقة ألمنيوم مثنية على شكل حرف V.",
      "أغلق البرطمان بإحكام وتأكد أنّ كل شيء جاف.",
      "قرّب بالوناً مدلوكاً من القرص وراقب انفراج الرقاقة.",
      "أبعد البالون ولاحظ: تنطبق الرقاقة (تكهرب بالحَثّ المؤقت).",
    ],
    observation: "تنفرج الرقاقة عند اقتراب الجسم المشحون، ويزداد الانفراج بازدياد الشحنة، وتنطبق عند إبعاده.",
    science: (
      <>
        هذا هو <strong>الكاشف الكهربائي</strong> نفسه المستعمل في المخبر: الشحنة المستحثّة تتوزّع على السلك والرقاقتين
        فتكتسبان الشحنة نفسها وتتنافران. جرّب النسخة التفاعلية في محطة الكاشف.
      </>
    ),
    safety: "استعمل برطماناً بلا غطاء حادّ، واطلب مساعدة بالغ عند الثقب.",
    goto: { tab: "forces", label: "جرّب الكاشف التفاعلي" },
  },
  {
    id: "pepper",
    title: "فصل الفلفل عن الملح بملعقة مشحونة",
    hook: "خدعة علمية سريعة ومقنعة.",
    illo: "pepper",
    tools: ["صحن", "ملح ناعم", "فلفل أسود مطحون", "ملعقة بلاستيكية", "قطعة صوف"],
    steps: [
      "اخلط ملعقة ملح مع ملعقة فلفل في الصحن.",
      "دلك الملعقة البلاستيكية بالصوف ١٥ ثانية.",
      "مرّر الملعقة فوق الخليط على ارتفاع ١–٢ سم.",
      "راقب: حبيبات الفلفل الأخف تقفز إلى الملعقة أولاً.",
      "أعِد التجربة بارتفاع أكبر ولاحظ أنّ الفشل يبدأ عند مسافة معيّنة.",
    ],
    observation: "يقفز الفلفل قبل الملح لأنّ حبيباته أخفّ، فيكفي مقدار صغير من القوة لرفعها.",
    science: (
      <>
        الشرط هو أن تتغلّب القوة الكهربائية على الوزن: <T e="F_{E} > mg" label="القوة الكهربائية أكبر من الوزن" />. كتلة
        حبيبة الفلفل أصغر، فتحتاج قوة أقل، وتُرفع من مسافة أكبر.
      </>
    ),
    safety: "لا تقرّب الملعقة كثيراً كي لا تلتصق الحبيبات ويصعب فصلها.",
    timer: { seconds: 15, label: "زمن دلك الملعقة" },
  },
  {
    id: "spark",
    title: "شرارة صغيرة في العتمة",
    hook: "شاهد الكهرباء الساكنة بعينك المجردة.",
    illo: "spark",
    tools: ["بطانية صوفية", "غرفة مظلمة", "مقبض باب معدني أو ملعقة"],
    steps: [
      "انتظر حتى المساء واجعل الغرفة مظلمة تماماً.",
      "امشِ على سجادة أو افرك البطانية الصوفية بحركة سريعة.",
      "قرّب إصبعك من مقبض معدني ببطء.",
      "راقب الشرارة الزرقاء الصغيرة واسمع الطقطقة.",
      "قِس طول الشرارة تقديرياً بالمليمترات وسجّلها.",
    ],
    observation: "ترى شرارة قصيرة وتسمع صوت طقطقة خفيفاً وتشعر بلسعة بسيطة غير مؤذية.",
    science: (
      <>
        يقفز الإلكترون عبر الهواء عندما يتجاوز الحقل الكهربائي عتبة الانهيار{" "}
        <T e="E_{\max} \approx 3\times 10^{6}\ \mathrm{V/m}" label="حقل الانهيار في الهواء" />. أي أنّ شرارة طولها{" "}
        <T e="1\ \mathrm{mm}" label="واحد مليمتر" /> تعني فرق جهد يقارب{" "}
        <T e="3000\ \mathrm{V}" label="ثلاثة آلاف فولت" /> — لكنها بتيار ضئيل جداً فلا تؤذي.
      </>
    ),
    safety: "لا تجرّب هذه التجربة قرب غاز أو بخار وقود أو مواد قابلة للاشتعال، ولا قرب أجهزة إلكترونية حساسة.",
  },
];

/* ------------------------------------------------------------------ */

export function StationExperiments({ onGoto }: { onGoto: (tab: string) => void }) {
  const [open, setOpen] = useState<string>("comb");
  const [done, setDone] = useLocalStorage<Record<string, boolean>>("lab.exp.steps", {});
  const [notes, setNotes] = useLocalStorage<Record<string, string>>("lab.exp.notes", {});
  const areaRef = useRef<HTMLDivElement | null>(null);

  const totalSteps = useMemo(() => EXPERIMENTS.reduce((s, e) => s + e.steps.length, 0), []);
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = Math.round((doneCount / totalSteps) * 100);

  const toggleStep = (expId: string, i: number) => {
    const key = `${expId}:${i}`;
    setDone((d) => ({ ...d, [key]: !d[key] }));
    play(done[key] ? "tick" : "correct");
  };

  const exportNotes = () => {
    const lines: string[] = [
      "سجلّ تجارب الكهرباء الساكنة — الوحدة الثانية / الدرس الأول",
      "إعداد: المهندس سومر شاهين — 0930215022",
      "",
    ];
    for (const exp of EXPERIMENTS) {
      const checked = exp.steps.filter((_, i) => done[`${exp.id}:${i}`]).length;
      lines.push(`■ ${exp.title}  (الخطوات المنجزة: ${checked}/${exp.steps.length})`);
      lines.push(`  الملاحظة المتوقعة: ${exp.observation}`);
      const note = notes[exp.id]?.trim();
      lines.push(`  ملاحظتي: ${note ? note : "— لم تُكتب ملاحظة بعد —"}`);
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "static-electricity-experiments.txt";
    a.click();
    URL.revokeObjectURL(url);
    play("spark");
  };

  return (
    <div className="space-y-8" ref={areaRef}>
      <Panel
        title="سبع تجارب حقيقية… بأدوات من بيتك"
        subtitle="لكل تجربة: أدوات، خطوات قابلة للتأشير، مؤقّت، تفسير علمي، ومكان لتسجيل ملاحظتك"
        icon={<IconFlask className="h-5 w-5" />}
        actions={
          <>
            <Btn variant="primary" onClick={exportNotes}>
              <IconDownload className="h-4 w-4" />
              تصدير سجلّ الملاحظات
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => {
                setDone({});
              }}
            >
              <IconReset className="h-4 w-4" />
              تصفير التقدّم
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex items-center justify-between text-sm font-bold text-forest-800">
              <span>تقدّمك في التجارب</span>
              <span>
                <span className="num">{doneCount}</span> / <span className="num">{totalSteps}</span> خطوة
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-forest-100">
              <div
                className="h-full rounded-full bg-gradient-to-l from-forest-700 via-forest-500 to-spark-400 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs leading-6 text-ink-500">
              تُحفظ خطواتك وملاحظاتك في متصفّحك تلقائياً، ويمكنك تصديرها ملفاً نصياً لتسليمها لمعلّمك.
            </p>
          </div>
          <Callout tone="warn" title="قبل أن تبدأ" icon={<IconShield className="h-4 w-4" />}>
            اختر يوماً <strong>جافاً</strong>، وجفّف الأدوات جيداً، وابتعد عن أي مأخذ كهربائي أو مادة قابلة للاشتعال.
            كل تجارب هذا الدرس تعتمد على شحنات ضئيلة وآمنة.
          </Callout>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        {EXPERIMENTS.map((exp) => {
          const isOpen = open === exp.id;
          const checked = exp.steps.filter((_, i) => done[`${exp.id}:${i}`]).length;
          return (
            <Card key={exp.id} className={cn("transition-all duration-300", isOpen && "ring-2 ring-forest-400 lg:col-span-2")}>
              <button
                type="button"
                onClick={() => {
                  setOpen(isOpen ? "" : exp.id);
                  play("tick");
                }}
                className="flex w-full items-center gap-4 text-right"
              >
                <span className="w-36 shrink-0 overflow-hidden rounded-2xl bg-forest-50 ring-1 ring-inset ring-forest-200 sm:w-44">
                  <ExperimentArt id={exp.illo} title={exp.title} className="h-full w-full" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-forest-900">{exp.title}</span>
                    <span className="rounded-full bg-forest-100 px-2 py-0.5 text-[11px] font-bold text-forest-700">
                      <span className="num">
                        {checked}/{exp.steps.length}
                      </span>{" "}
                      خطوة
                    </span>
                    {exp.sim && (
                      <span className="rounded-full bg-spark-50 px-2 py-0.5 text-[11px] font-bold text-spark-600">فيها محاكاة</span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm leading-7 text-ink-500">{exp.hook}</span>
                </span>
                <span className={cn("shrink-0 rounded-full bg-forest-100 px-2 py-1 text-xs font-bold text-forest-700 transition-transform", isOpen && "rotate-180")}>
                  ▾
                </span>
              </button>

              {isOpen && (
                <div className="anim-rise mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-forest-700">الأدوات</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {exp.tools.map((t) => (
                          <span key={t} className="rounded-xl bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-800 ring-1 ring-inset ring-forest-200">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-forest-700">الخطوات — أشّر على ما أنجزته</p>
                      <ol className="mt-2 space-y-2">
                        {exp.steps.map((s, i) => {
                          const key = `${exp.id}:${i}`;
                          const isDone = !!done[key];
                          return (
                            <li key={key}>
                              <button
                                type="button"
                                onClick={() => toggleStep(exp.id, i)}
                                className={cn(
                                  "flex w-full items-start gap-3 rounded-2xl border px-3 py-2.5 text-right transition-all",
                                  isDone ? "border-forest-300 bg-forest-50" : "border-forest-100 bg-white hover:border-forest-300",
                                )}
                              >
                                <span
                                  className={cn(
                                    "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-bold transition-colors",
                                    isDone ? "bg-forest-600 text-white" : "bg-forest-100 text-forest-700",
                                  )}
                                >
                                  {isDone ? <IconCheck className="h-3.5 w-3.5" /> : <span className="num">{i + 1}</span>}
                                </span>
                                <span className={cn("text-sm leading-7", isDone ? "text-ink-500 line-through" : "text-ink-700")}>{s}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    </div>

                    {exp.timer && <MiniTimer seconds={exp.timer.seconds} label={exp.timer.label} />}
                  </div>

                  <div className="space-y-4">
                    {exp.sim === "paper" && <PaperSim />}
                    {exp.sim === "water" && <WaterSim />}

                    <div className="rounded-2xl border border-forest-200 bg-white p-4">
                      <p className="text-xs font-bold text-forest-700">ماذا ستلاحظ؟</p>
                      <p className="mt-1 text-sm leading-7 text-ink-700">{exp.observation}</p>
                    </div>

                    <div className="rounded-2xl border border-spark-200 bg-spark-50 p-4">
                      <p className="text-xs font-bold text-spark-600">التفسير العلمي</p>
                      <p className="mt-1 text-sm leading-7 text-ink-700">{exp.science}</p>
                      {exp.id === "comb" && (
                        <TEq e="F_{\text{net}} = F_{\text{near}} - F_{\text{far}} > 0" label="محصّلة القوة تجاذب" />
                      )}
                    </div>

                    <Callout tone="danger" title="سلامة" icon={<IconShield className="h-4 w-4" />}>
                      {exp.safety}
                    </Callout>

                    <div>
                      <label className="text-xs font-bold text-forest-700" htmlFor={`note-${exp.id}`}>
                        ملاحظتي (تُحفظ تلقائياً)
                      </label>
                      <textarea
                        id={`note-${exp.id}`}
                        value={notes[exp.id] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [exp.id]: e.target.value }))}
                        rows={3}
                        placeholder="اكتب ما رأيته فعلاً: هل نجحت التجربة؟ ما الذي تغيّر عندما…"
                        className="mt-1.5 w-full rounded-2xl border border-forest-200 bg-white p-3 text-sm leading-7 text-ink-700 outline-none transition-colors focus:border-forest-400"
                      />
                    </div>

                    {exp.goto && (
                      <Btn variant="soft" onClick={() => onGoto(exp.goto!.tab)}>
                        {exp.goto.label} ↗
                      </Btn>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Stat label="عدد التجارب" value={<span className="num">{EXPERIMENTS.length}</span>} tone="forest" />
        <Stat label="خطوات قابلة للتأشير" value={<span className="num">{totalSteps}</span>} tone="spark" />
        <Stat label="نسبة الإنجاز" value={<span className="num">{pct}%</span>} tone="lagoon" />
      </div>

      <DeepExplain
        title="كيف تُجري تجربة علمية صحيحة… لا مجرّد «خدعة»؟"
        tone="tinted"
        intro="الفرق بين اللعب والتجربة هو المنهج. قبل أن تبدأ أي تجربة من هذه المحطة، حدّد ما الذي ستغيّره وما الذي ستثبّته وما الذي ستقيسه، ثم كرّر التجربة ثلاث مرات على الأقل قبل أن تحكم على النتيجة."
        parts={[
          {
            label: "١ — صُغ سؤالاً قابلاً للاختبار",
            body: (
              <>
                لا تسأل «هل ينجذب الورق؟» بل اسأل: <em>«كيف يتغيّر عدد القصاصات المرفوعة عندما أزيد زمن الدلك من ٥ إلى ٣٠ ثانية؟»</em>. السؤال الجيد يحتوي متغيّراً واحداً تغيّره ومتغيّراً واحداً تقيسه.
              </>
            ),
          },
          {
            label: "٢ — اضبط المتغيّرات",
            body: (
              <>
                المتغيّر المستقل: زمن الدلك (أو المسافة). المتغيّر التابع: عدد القصاصات المرفوعة أو زاوية انحراف الماء. الثوابت: نوع المشط، حجم القصاصات، جفاف الأدوات، والمكان نفسه. تغيير أمرين معاً يُفسد النتيجة لأنك لن تعرف أيّهما أثّر.
              </>
            ),
          },
          {
            label: "٣ — قِس بأداة، لا بالانطباع",
            body: (
              <>
                استعمل مسطرة لقياس المسافة بالسنتيمتر، ومؤقّت الهاتف لزمن الدلك، وعدّ القصاصات بدلاً من «كثير/قليل». سجّل الأرقام في جدول فوراً، فالذاكرة تخدع.
              </>
            ),
          },
          {
            label: "٤ — كرّر ثم استنتج",
            body: (
              <>
                ثلاث محاولات على الأقل، وخُذ المتوسط. إن تناقضت النتائج فابحث عن سبب مادي (رطوبة، شعر مبلّل، مشط لامس الطاولة) ولا تتجاهل المحاولة «الفاشلة» — غالباً هي أصدق دليل على شرط نجاح التجربة.
              </>
            ),
          },
          {
            label: "٥ — اربط النتيجة بالقانون",
            body: (
              <>
                كل تجربة هنا هي ترجمة حسّية لعلاقة رياضية: كلما اقترب المشط زادت القوة وفق{" "}
                <span className="font-bold text-forest-700">تناسب عكسي مع مربّع المسافة</span>، وكلما زدت الدلك زادت الشحنة{" "}
                <span className="font-bold text-forest-700">f = n·e</span> فارتفعت القوة طرداً.
              </>
            ),
          },
        ]}
        formula={"F \\propto \\dfrac{q_1 q_2}{d^{2}} \\quad\\Rightarrow\\quad \\text{rub more} \\uparrow q,\\; \\text{closer} \\downarrow d \\;\\Rightarrow\\; F \\uparrow"}
        formulaNote="زيادة الشحنة أو تقليل المسافة كلاهما يرفع القوة — لذلك تنجح التجربة أكثر عند الدلك الطويل والتقريب الشديد."
        life="جرّب تجربة المشط مرّتين: مرة في الصباح الباكر ومرة بعد الاستحمام في حمّام مليء بالبخار. ستجد فرقاً هائلاً، والسبب رطوبة الهواء لا المشط!"
        misconception="يعتقد كثيرون أنّ «فشل التجربة» يعني خطأ في القانون. الحقيقة أنّ الظاهرة حسّاسة للرطوبة ونظافة السطح، والفشل نفسه بيانات علمية تُخبرك عن الشروط اللازمة."
        check={{
          q: "في تجربة انحراف خيط الماء، ما المتغيّر الذي يجب أن تثبّته لتدرس أثر المسافة وحدها؟",
          a: "يجب تثبيت مقدار الشحنة (زمن الدلك نفسه ونوع المادتين) وقوة تدفّق الماء وسماكة الخيط، وتغيير المسافة فقط، ثم قياس زاوية الانحراف في كل مرة.",
        }}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SourceTag kind="platform" />
          <h4 className="mt-3 text-base font-bold text-forest-900">لماذا تنجح التجربة أحياناً وتفشل أحياناً؟</h4>
          <ul className="mt-2 space-y-2 text-sm leading-8 text-ink-700">
            <li>• <strong>الرطوبة:</strong> في يوم رطب تتسرّب الشحنات عبر طبقة الماء الرقيقة على الأسطح.</li>
            <li>• <strong>نظافة الأدوات:</strong> طبقة الدهن أو الغبار تجعل السطح ناقلاً ضعيفاً.</li>
            <li>• <strong>المسافة:</strong> القوة تتناقص مع مربّع المسافة، فسنتيمتر واحد يصنع فرقاً كبيراً.</li>
            <li>• <strong>نوع المادة:</strong> راجع سلّم التكهرب في المحطة الثانية لتختار أفضل ثنائي.</li>
            <li>• <strong>حجم الجسم المجذوب:</strong> كلما صغرت الكتلة كفت قوة أصغر لرفعه.</li>
          </ul>
        </Card>
        <Card className="bg-paper-warm">
          <SourceTag kind="enrich" />
          <h4 className="mt-3 text-base font-bold text-forest-900">جدول تسجيل جاهز لتقريرك المدرسي</h4>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-right text-[13px]">
              <thead>
                <tr className="bg-forest-800 text-forest-50">
                  <th className="rounded-r-xl px-3 py-2">المحاولة</th>
                  <th className="px-3 py-2">زمن الدلك (s)</th>
                  <th className="px-3 py-2">المسافة (cm)</th>
                  <th className="rounded-l-xl px-3 py-2">عدد القصاصات المرفوعة</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((n) => (
                  <tr key={n} className={n % 2 ? "bg-white" : "bg-forest-50/70"}>
                    <td className="num px-3 py-2 font-bold text-forest-800">{n}</td>
                    <td className="px-3 py-2 text-ink-300">……</td>
                    <td className="px-3 py-2 text-ink-300">……</td>
                    <td className="px-3 py-2 text-ink-300">……</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-6 text-ink-500">
            انقل هذا الجدول إلى دفترك، ثم اكتب استنتاجاً من سطر واحد يربط ما قسته بالعلاقة الرياضية.
          </p>
        </Card>
      </div>
    </div>
  );
}