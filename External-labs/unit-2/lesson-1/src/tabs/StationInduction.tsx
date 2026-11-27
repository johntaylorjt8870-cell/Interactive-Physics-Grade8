import { useEffect, useMemo, useState } from "react";
import { Btn, Callout, Card, Panel, SourceTag, Stat } from "@/components/ui";
import { IconLayers, IconPause, IconPlay, IconReset } from "@/components/icons";
import { T, TEq } from "@/lib/math";
import { play } from "@/lib/sound";
import { cn } from "@/utils/cn";
import { DeepExplain } from "@/components/Explain";

/* ------------------------------------------------------------------ */
/* induction stage machine                                             */
/* ------------------------------------------------------------------ */

const STAGES = [
  {
    title: "١ — ناقل متعادل على حامل عازل",
    text: "الناقل المعدني متعادل: عدد الإلكترونات الحرة يساوي عدد الشحنات الموجبة في الشبكة البلورية، وموزّعة بانتظام.",
    formula: "q_{\\text{net}} = 0",
  },
  {
    title: "٢ — نُقرّب ساقاً مشحونة سالباً (دون لمس)",
    text: "تنفر الإلكترونات الحرة من الساق وتتراكم في الجهة البعيدة، فتبقى الجهة القريبة موجبة. الشحنة الصافية ما تزال صفراً: هذا هو انفصال الشحنات.",
    formula: "q_{\\text{net}} = 0 \\;\\;(\\text{separated})",
  },
  {
    title: "٣ — تأريض الناقل (لمسه بالإصبع)",
    text: "الإلكترونات المنفصلة تجد طريقاً إلى الأرض عبر جسمنا فتهرب، ويبقى على الناقل عجزٌ في الإلكترونات أي شحنة موجبة.",
    formula: "q_{\\text{net}} = +q \\;\\;(\\text{electrons left})",
  },
  {
    title: "٤ — نرفع الإصبع والساق ما تزال قريبة",
    text: "انقطع طريق الأرض، فبقيت الشحنة الموجبة محبوسة على الناقل، والساق تحجزها في الجهة القريبة.",
    formula: "q_{\\text{net}} = +q \\;\\;(\\text{isolated})",
  },
  {
    title: "٥ — نُبعد الساق",
    text: "تتوزّع الشحنة الموجبة على كامل سطح الناقل. حصلنا على جسم مشحون بشحنة مخالفة لشحنة الساق، دون أن نفقد من شحنة الساق شيئاً.",
    formula: "q_{\\text{net}} = +q \\;\\;(\\text{spread on surface})",
  },
  {
    title: "٦ — النتيجة: التكهرب بالحَثّ",
    text: "الحَثّ يشحن الجسم بشحنة مخالفة للساق ويحافظ على شحنة الساق، بينما اللمس يشحنه بشحنة مماثلة ويُنقص شحنة الساق.",
    formula: "q_{\\text{body}} = -\\,q_{\\text{rod}} \\;\\;(\\text{induction})",
  },
] as const;

const ELECTRONS = 10;

function positionsFor(stage: number) {
  const cx = 300;
  const cy = 128;
  const rx = 96;
  const ry = 66;
  const pts: { x: number; y: number; opacity: number }[] = [];
  const gone = stage >= 2 ? Math.floor(ELECTRONS / 2) : 0;

  for (let i = 0; i < ELECTRONS; i++) {
    const isLeaving = i < gone;
    if (isLeaving) {
      pts.push({ x: cx + (i - gone / 2) * 16, y: 300, opacity: 0 });
      continue;
    }
    if (stage === 1 || stage === 2 || stage === 3) {
      // pushed to the far (right) side
      const t = (i - gone) / Math.max(1, ELECTRONS - gone - 1);
      const a = -Math.PI / 2.6 + t * (Math.PI / 1.3);
      pts.push({ x: cx + Math.cos(a) * rx * 0.82 + 22, y: cy + Math.sin(a) * ry * 0.82, opacity: 1 });
    } else {
      const a = (i / ELECTRONS) * Math.PI * 2;
      pts.push({ x: cx + Math.cos(a) * rx * 0.78, y: cy + Math.sin(a) * ry * 0.72, opacity: 1 });
    }
  }
  return pts;
}

function InductionScene({ stage }: { stage: number }) {
  const pts = positionsFor(stage);
  const rodNear = stage >= 1 && stage <= 3;
  const grounded = stage === 2;
  const positive = stage >= 2;
  const remaining = ELECTRONS - (stage >= 2 ? Math.floor(ELECTRONS / 2) : 0);

  return (
    <svg viewBox="0 0 560 348" className="w-full" role="img" aria-label={`مرحلة التكهرب بالحَثّ رقم ${stage + 1}`}>
      <title>التكهرب بالحَثّ خطوة بخطوة</title>
      <defs>
        <radialGradient id="metalBody" cx="36%" cy="26%">
          <stop offset="0%" stopColor="#f4f9f7" />
          <stop offset="42%" stopColor="#c2d2cc" />
          <stop offset="78%" stopColor="#8b9f97" />
          <stop offset="100%" stopColor="#546a61" />
        </radialGradient>
        <linearGradient id="rodNeg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9e2e8" />
          <stop offset="55%" stopColor="#2e9aa6" />
          <stop offset="100%" stopColor="#12505a" />
        </linearGradient>
        <linearGradient id="standGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e7f63" />
          <stop offset="50%" stopColor="#0f3a31" />
          <stop offset="100%" stopColor="#1e7f63" />
        </linearGradient>
        <radialGradient id="bodyGlow">
          <stop offset="0%" stopColor="#f2c14e" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f2c14e" stopOpacity="0" />
        </radialGradient>
        <pattern id="groundHatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#f2c14e" strokeWidth="2" opacity="0.35" />
        </pattern>
      </defs>

      <rect width="560" height="348" rx="24" fill="#05201b" />
      <g opacity="0.22">
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`v${i}`} x1={20 + i * 40} y1="10" x2={20 + i * 40} y2="338" stroke="#0f4438" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="10" y1={20 + i * 44} x2="550" y2={20 + i * 44} stroke="#0f4438" />
        ))}
      </g>

      {/* rod */}
      <g style={{ transform: `translateX(${rodNear ? 0 : -170}px)`, transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)" }}>
        <rect x="20" y="112" width="156" height="24" rx="12" fill="url(#rodNeg2)" />
        <rect x="28" y="116" width="140" height="6" rx="3" fill="#ffffff" opacity="0.3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i}>
            <circle cx={38 + i * 30} cy={100} r="8.5" fill="#2e9aa6" opacity="0.22" />
            <circle cx={38 + i * 30} cy={100} r="5.2" fill="#1f8fa6" />
            <line x1={35 + i * 30} y1={100} x2={41 + i * 30} y2={100} stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ))}
        <text x="98" y="156" textAnchor="middle" fontSize="11.5" fill="#8fd9be">
          ساق مشحونة سالباً
        </text>
      </g>

      {/* field lines while the rod is close */}
      {rodNear &&
        [96, 124, 152].map((y0) => (
          <path
            key={y0}
            d={`M180 ${y0} C 210 ${y0 + (124 - y0) * 0.4}, 232 ${124 + (y0 - 124) * 0.3}, 250 ${124 + (y0 - 124) * 0.25}`}
            fill="none"
            stroke="#7fcbd3"
            strokeOpacity="0.5"
            strokeWidth="1.4"
            strokeDasharray="5 6"
            className="anim-dash"
          />
        ))}

      {/* conductor */}
      {positive && <ellipse cx="300" cy="128" rx="150" ry="106" fill="url(#bodyGlow)" />}
      <ellipse cx="300" cy="128" rx="112" ry="78" fill="url(#metalBody)" stroke="#05201b" strokeOpacity="0.35" strokeWidth="2" />
      <ellipse cx="262" cy="92" rx="34" ry="17" fill="#ffffff" opacity="0.4" transform="rotate(-22 262 92)" />
      <text x="300" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="#e3f4ec">
        ناقل معدني على حامل عازل
      </text>

      {/* fixed positive lattice */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.4;
        const x = 300 + Math.cos(a) * 62;
        const y = 128 + Math.sin(a) * 40;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="8.5" fill="#e05a45" opacity="0.18" />
            <circle cx={x} cy={y} r="5" fill="#e05a45" opacity="0.85" />
            <line x1={x - 2.6} y1={y} x2={x + 2.6} y2={y} stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
            <line x1={x} y1={y - 2.6} x2={x} y2={y + 2.6} stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        );
      })}

      {/* electrons */}
      {pts.map((pt, i) => (
        <g
          key={i}
          style={{
            transform: `translate(${pt.x - 300}px, ${pt.y - 128}px)`,
            opacity: pt.opacity,
            transition: "transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 600ms ease",
          }}
        >
          <circle cx="300" cy="128" r="12" fill="#2e9aa6" opacity="0.22" />
          <circle cx="300" cy="128" r="7.6" fill="#1f8fa6" />
          <circle cx="297.6" cy="125.6" r="2" fill="#ffffff" opacity="0.6" />
          <line x1="296" y1="128" x2="304" y2="128" stroke="#05201b" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </g>
      ))}

      {/* stand */}
      <rect x="286" y="200" width="28" height="66" rx="9" fill="url(#standGrad)" />
      <rect x="292" y="204" width="6" height="58" rx="3" fill="#ffffff" opacity="0.16" />
      <rect x="232" y="264" width="136" height="16" rx="8" fill="#0f3a31" stroke="#1e7f63" />
      <text x="300" y="296" textAnchor="middle" fontSize="11" fill="#56c39c">
        حامل عازل (زجاج)
      </text>

      {/* grounding */}
      <g style={{ opacity: grounded ? 1 : 0, transition: "opacity 400ms ease" }}>
        <path d="M402 152 C 444 172, 458 214, 458 244" stroke="#f2c14e" strokeWidth="4" fill="none" strokeDasharray="8 7" className="anim-dash" />
        <rect x="424" y="248" width="68" height="16" rx="4" fill="url(#groundHatch)" stroke="#f2c14e" strokeWidth="1.4" />
        <line x1="428" y1="248" x2="488" y2="248" stroke="#f2c14e" strokeWidth="3.4" strokeLinecap="round" />
        <text x="458" y="284" textAnchor="middle" fontSize="11.5" fill="#f2c14e">
          تأريض بالإصبع
        </text>
      </g>

      {/* readouts */}
      <g>
        <rect x="20" y="20" width="150" height="30" rx="15" fill="#0a2f28" stroke="#16594a" />
        <circle cx="40" cy="35" r="6" fill="#1f8fa6" />
        <text x="54" y="39" fontSize="12" fontWeight="700" fill="#a9e2e8">
          إلكترونات حرّة: {remaining}
        </text>
      </g>
      <g style={{ opacity: positive ? 1 : 0.35, transition: "opacity 500ms ease" }}>
        <rect x="392" y="20" width="148" height="30" rx="15" fill="#0a2f28" stroke={positive ? "#f2c14e" : "#16594a"} />
        <circle cx="412" cy="35" r="6" fill="#e05a45" />
        <text x="426" y="39" fontSize="12" fontWeight="700" fill={positive ? "#f2c14e" : "#56c39c"}>
          {positive ? "الشحنة الصافية: موجبة" : "الشحنة الصافية: صفر"}
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* conductors vs insulators sorting game                               */
/* ------------------------------------------------------------------ */

const ITEMS = [
  { name: "النحاس", conductor: true, why: "معدن: إلكترونات حرة كثيرة تنتقل بسهولة." },
  { name: "الماء المالح", conductor: true, why: "الشوارد الذائبة تنقل الشحنة." },
  { name: "جسم الإنسان", conductor: true, why: "لهذا نؤرّض الأجسام بلمسها بالإصبع." },
  { name: "الألمنيوم", conductor: true, why: "معدن خفيف، تُصنع منه أوراق الكاشف." },
  { name: "الغرافيت (سنّ القلم)", conductor: true, why: "شكل من الكربون يوصّل الكهرباء." },
  { name: "البلاستيك", conductor: false, why: "لا توجد إلكترونات حرة، فتبقى الشحنة مكانها." },
  { name: "الزجاج الجاف", conductor: false, why: "عازل ممتاز، يُستعمل حاملاً للنواقل." },
  { name: "المطاط", conductor: false, why: "يغلّف الأسلاك لحمايتنا." },
  { name: "الخشب الجاف", conductor: false, why: "عازل، لكنه يصبح ناقلاً إذا ابتلّ." },
  { name: "الهواء الجاف", conductor: false, why: "عازل، ولهذا تبقى الشحنة على الجسم المدلوك." },
];

function SortingGame() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const item = ITEMS[index % ITEMS.length];
  const finished = index >= ITEMS.length;

  const answer = (isConductor: boolean) => {
    const ok = isConductor === item.conductor;
    setScore((s) => s + (ok ? 1 : 0));
    setFeedback({ ok, text: `${ok ? "إجابة صحيحة — " : "ليست دقيقة — "}${item.why}` });
    play(ok ? "correct" : "wrong");
    window.setTimeout(() => {
      setFeedback(null);
      setIndex((i) => i + 1);
    }, 1400);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-700">
          المادة <span className="num">{Math.min(index + 1, ITEMS.length)}</span> من <span className="num">{ITEMS.length}</span>
        </p>
        <p className="rounded-full bg-forest-100 px-3 py-1 text-xs font-bold text-forest-800">
          النتيجة: <span className="num">{score}</span>
        </p>
      </div>

      {finished ? (
        <div className="mt-4 rounded-2xl border border-forest-200 bg-forest-50 p-5 text-center">
          <p className="text-lg font-bold text-forest-900">
            أنهيت التصنيف — نتيجتك <span className="num">{score}</span> من <span className="num">{ITEMS.length}</span>
          </p>
          <p className="mt-1 text-sm text-ink-700">
            {score >= 8 ? "ممتاز! تميّز بين النواقل والعوازل بثقة." : "أعِد المحاولة وركّز على وجود الإلكترونات الحرة في المعدن."}
          </p>
          <Btn
            variant="primary"
            className="mt-3"
            onClick={() => {
              setIndex(0);
              setScore(0);
              setFeedback(null);
            }}
          >
            <IconReset className="h-4 w-4" />
            إعادة اللعب
          </Btn>
        </div>
      ) : (
        <>
          <div className={cn("mt-4 rounded-3xl border-2 border-dashed border-forest-300 bg-white p-6 text-center", feedback && (feedback.ok ? "border-forest-500 bg-forest-50" : "border-berry-500 bg-berry-100/50"))}>
            <p className="text-2xl font-bold text-forest-900">{item.name}</p>
            <p className="mt-1 text-xs text-ink-500">هل هي ناقلة أم عازلة للشحنة الكهربائية؟</p>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Btn variant="primary" onClick={() => answer(true)} disabled={!!feedback}>
              ناقلة
            </Btn>
            <Btn variant="spark" onClick={() => answer(false)} disabled={!!feedback}>
              عازلة
            </Btn>
          </div>
          {feedback && (
            <p className={cn("anim-rise mt-3 rounded-2xl px-4 py-2 text-center text-sm font-semibold", feedback.ok ? "bg-forest-100 text-forest-800" : "bg-berry-100 text-berry-600")}>
              {feedback.text}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function StationInduction() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setStage((s) => {
        if (s >= STAGES.length - 1) {
          setPlaying(false);
          return s;
        }
        play("transfer");
        return s + 1;
      });
    }, 2400 / speed);
    return () => window.clearInterval(id);
  }, [playing, speed]);

  const current = useMemo(() => STAGES[stage], [stage]);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-s-4 border-s-forest-700">
          <SourceTag kind="book" page={83} />
          <h3 className="mt-3 text-lg font-bold text-forest-900">طرائق التكهرب الثلاث</h3>
          <ul className="mt-3 space-y-2 text-[15px] leading-8 text-ink-700">
            <li>
              <strong className="text-forest-700">بالدلك:</strong> انتقال إلكترونات بين مادتين مختلفتين، فيُشحن الجسمان
              بشحنتين متعاكستين.
            </li>
            <li>
              <strong className="text-forest-700">باللمس:</strong> عند لمس جسم مشحون بناقل متعادل تنتقل إليه شحنة من
              الإشارة نفسها.
            </li>
            <li>
              <strong className="text-forest-700">بالحَثّ (التأثير):</strong> دون لمس؛ يُشحن الجسم بشحنة مخالفة لشحنة
              الجسم المؤثّر.
            </li>
          </ul>
        </Card>
        <Card>
          <SourceTag kind="platform" />
          <h3 className="mt-3 text-lg font-bold text-forest-900">المفتاح: أين تذهب الإلكترونات؟</h3>
          <p className="mt-3 text-[15px] leading-8 text-ink-700">
            في كل طريقة لا يحدث شيء سوى انتقال إلكترونات أو إعادة توزيعها. تتبّع الإلكترونات في المشهد التالي خطوة بخطوة،
            وستفهم لماذا يُعطي الحَثّ شحنة <strong>مخالفة</strong> بينما يُعطي اللمس شحنة <strong>مماثلة</strong>.
          </p>
        </Card>
      </div>

      <Panel
        title="مشهد متحرّك: التكهرب بالحَثّ خطوة بخطوة"
        subtitle="شغّل المشهد أو تنقّل بين المراحل يدوياً"
        icon={<IconLayers className="h-5 w-5" />}
        tone="deep"
        actions={
          <>
            <Btn variant={playing ? "ghost" : "spark"} onClick={() => setPlaying((p) => !p)}>
              {playing ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
              {playing ? "إيقاف مؤقت" : "تشغيل"}
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => {
                setPlaying(false);
                setStage(0);
              }}
            >
              <IconReset className="h-4 w-4" />
              من البداية
            </Btn>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-3xl ring-1 ring-forest-700">
            <InductionScene stage={stage} />
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-forest-800/60 p-5 ring-1 ring-inset ring-forest-700">
              <p className="text-xs font-bold text-spark-400">
                المرحلة <span className="num">{stage + 1}</span> / <span className="num">{STAGES.length}</span>
              </p>
              <h4 className="mt-2 text-lg font-bold text-white">{current.title}</h4>
              <p className="mt-2 text-[14px] leading-8 text-forest-200">{current.text}</p>
              <div className="mt-3 rounded-2xl bg-forest-950/70 px-3 py-2">
                <TEq e={current.formula} label="حالة الشحنة في هذه المرحلة" className="text-white" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Btn variant="soft" onClick={() => setStage((s) => Math.max(0, s - 1))} disabled={stage === 0}>
                السابق
              </Btn>
              <Btn variant="soft" onClick={() => setStage((s) => Math.min(STAGES.length - 1, s + 1))} disabled={stage === STAGES.length - 1}>
                التالي
              </Btn>
              <span className="text-xs font-bold text-forest-300">السرعة:</span>
              {[0.5, 1, 2].map((s) => (
                <Btn key={s} variant={speed === s ? "spark" : "ghost"} onClick={() => setSpeed(s)}>
                  <span className="num">×{s}</span>
                </Btn>
              ))}
            </div>

            <div className="flex gap-1.5">
              {STAGES.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  aria-label={`الانتقال إلى المرحلة ${i + 1}`}
                  onClick={() => {
                    setStage(i);
                    setPlaying(false);
                  }}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all duration-300",
                    i <= stage ? "bg-spark-400" : "bg-forest-700",
                  )}
                />
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="طريقة التكهرب" value="بالحَثّ (دون لمس)" tone="spark" />
              <Stat label="شحنة الساق بعد العملية" value="لم تتغيّر" tone="lagoon" />
            </div>
          </div>
        </div>
      </Panel>

      {/* comparison table */}
      <Panel title="جدول المقارنة بين طرائق التكهرب" subtitle="احفظه جيداً: أكثر ما يُسأل عنه في الامتحان" icon={<IconLayers className="h-5 w-5" />} actions={<SourceTag kind="platform" />}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-right text-sm">
            <thead>
              <tr className="bg-forest-800 text-forest-100">
                <th className="rounded-r-2xl px-4 py-3 font-bold">الطريقة</th>
                <th className="px-4 py-3 font-bold">هل يلزم التلامس؟</th>
                <th className="px-4 py-3 font-bold">شحنة الجسم الناتجة</th>
                <th className="rounded-l-2xl px-4 py-3 font-bold">ماذا يحدث لشحنة الجسم المؤثّر؟</th>
              </tr>
            </thead>
            <tbody>
              {[
                { m: "الدلك", touch: "نعم (احتكاك)", sign: "مخالفة للمادة الأخرى", other: "تكتسب المادة الأخرى شحنة مساوية ومعاكسة" },
                { m: "اللمس", touch: "نعم", sign: "مماثلة لشحنة الجسم المشحون", other: "تنقص شحنته لأنه أعطى جزءاً منها" },
                { m: "الحَثّ", touch: "لا", sign: "مخالفة لشحنة الساق", other: "لا تتغيّر إطلاقاً" },
              ].map((row, i) => (
                <tr key={row.m} className={cn("border-b border-forest-100", i % 2 === 0 ? "bg-white" : "bg-forest-50/60")}>
                  <td className="px-4 py-3 font-bold text-forest-800">{row.m}</td>
                  <td className="px-4 py-3 text-ink-700">{row.touch}</td>
                  <td className="px-4 py-3 text-ink-700">{row.sign}</td>
                  <td className="px-4 py-3 text-ink-700">{row.other}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="info" className="mt-4" title="قاعدة سريعة">
          اللمس يُعطي الإشارة <strong>نفسها</strong>، والحَثّ يُعطي الإشارة <strong>المعاكسة</strong>. وفي الحالتين تبقى
          الشحنة الكلية محفوظة: <T e="\sum q = \text{const}" label="مجموع الشحنات ثابت" />.
        </Callout>
      </Panel>

      {/* conductors & insulators */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel title="ناقلة أم عازلة؟ لعبة تصنيف سريعة" subtitle="عشر مواد، وقرار واحد لكل مادة" icon={<IconLayers className="h-5 w-5" />} actions={<SourceTag kind="enrich" />}>
          <SortingGame />
        </Panel>

        <div className="space-y-4">
          <Card>
            <SourceTag kind="book" page={84} />
            <h4 className="mt-3 text-base font-bold text-forest-900">النواقل والعوازل</h4>
            <p className="mt-2 text-sm leading-7 text-ink-700">
              <strong>النواقل</strong> مواد تسمح بانتقال الشحنات خلالها (المعادن، جسم الإنسان، الماء المالح)، و
              <strong>العوازل</strong> مواد لا تسمح بذلك (البلاستيك، الزجاج الجاف، المطاط، الهواء الجاف). لهذا تُصنع
              حوامل التجارب من الزجاج، وتُغلَّف الأسلاك بالمطاط.
            </p>
          </Card>
          <Card className="bg-paper-warm">
            <h4 className="text-base font-bold text-forest-900">التأريض في حياتنا</h4>
            <ul className="mt-2 space-y-2 text-sm leading-7 text-ink-700">
              <li>• صهريج الوقود يُوصل بالأرض قبل التفريغ لتصريف الشحنات الساكنة بأمان.</li>
              <li>• مانعة الصواعق سلك سميك يوصل السحابة المشحونة بالأرض فيحمي البناء.</li>
              <li>• فنّي الإلكترونيات يلبس سواراً مؤرَّضاً كي لا تُتلف شرارةٌ صغيرة القطع الحسّاسة.</li>
            </ul>
          </Card>
          <Callout tone="warn" title="انتبه">
            التأريض يعني وصلاً كهربائياً بالأرض، والأرض خزان ضخم يقبل الشحنات أو يعطيها دون أن يتغيّر حالها العملية.
          </Callout>
        </div>
      </div>
      <DeepExplain
        title="التكهرب باللمس: لماذا يخرج الجسمان بالإشارة نفسها؟"
        tone="tinted"
        intro="اللمس أبسط الطرائق الثلاث وأسهلها فهماً، لكنه يحمل تفصيلاً مهماً: الشحنة لا تنتقل كلها، بل تتوزّع بين الجسمين حسب حجميهما."
        parts={[
          {
            label: "١ — التلامس يوحّد الناقلَين",
            body: (
              <>
                عند لمس ناقل مشحون بناقل آخر متعادل يصبح الجسمان جسماً واحداً من الناحية الكهربائية. الشحنات الزائدة المتنافرة تجد الآن سطحاً أكبر لتنتشر عليه، فتتوزّع بين الجسمين.
              </>
            ),
          },
          {
            label: "٢ — التوزيع حسب الحجم",
            body: (
              <>
                إذا كان الجسمان متماثلين تماماً تتقاسم الشحنة مناصفة: كلٌّ يأخذ نصفها. وإذا كان أحدهما أكبر بكثير (كالأرض مثلاً) أخذ الحصة الأكبر، ويكاد الجسم الصغير يفقد شحنته كلها — وهذا هو التأريض.
              </>
            ),
          },
          {
            label: "٣ — النتيجة: الإشارة نفسها",
            body: (
              <>
                بعد الفصل يحمل الجسمان شحنة بالإشارة نفسها، ولذلك يتنافران. هذه أوضح طريقة للتمييز: اللمس ← تنافر بعد الفصل، الحَثّ ← تجاذب بعد الفصل.
              </>
            ),
          },
          {
            label: "٤ — الجسم المؤثّر يفقد جزءاً من شحنته",
            body: (
              <>
                خلاف الحَثّ، تنقص شحنة الساق الأصلية في كل لمسة. لهذا إذا لمست كاشفاً مشحوناً عدة مرات متتالية يقلّ الانفراج تدريجياً.
              </>
            ),
          },
        ]}
        formula={"q_1' = q_2' = \\dfrac{q}{2} \\quad\\text{(two identical conductors)}"}
        formulaNote="مبدأ انحفاظ الشحنة يحكم كل خطوة: المجموع قبل اللمس = المجموع بعده."
        life="عندما تلمس مقبض باب معدني بعد المشي على سجادة، أنت تؤرّض نفسك: تنتقل شحنتك الزائدة إلى المعدن ثم إلى الأرض، فتشعر بلسعة."
        misconception="لا يُشترط الدلك في التكهرب باللمس؛ الدلك طريقة لتوليد الشحنة، واللمس طريقة لنقلها من جسم إلى آخر."
        check={{
          q: "كرتان معدنيتان متماثلتان، إحداهما مشحونة بـ 8 nC والأخرى متعادلة. بعد التلامس والفصل، كم شحنة كل منهما؟",
          a: "4 nC لكل منهما، لأن الشحنة تتوزّع بالتساوي بين ناقلين متماثلين: 8 ÷ 2 = 4 نانوكولوم.",
        }}
      />

      <DeepExplain
        title="التكهرب بالحَثّ: شحنٌ بلا تلامس… وبلا ثمن"
        intro="أذكى طرائق التكهرب وأكثرها سؤالاً في الامتحانات، لأنّها تجمع بين الاستقطاب والتأريض في تسلسل دقيق لا يجوز خلط ترتيبه."
        parts={[
          {
            label: "١ — التقريب: انفصال بلا شحنة صافية",
            body: (
              <>
                نُقرّب الساق السالبة من ناقل معزول، فتنفر إلكتروناته الحرة إلى الجهة البعيدة. الجهة القريبة تصبح موجبة والبعيدة سالبة، لكن المجموع ما يزال صفراً. لو أبعدنا الساق الآن لعاد كل شيء كما كان.
              </>
            ),
          },
          {
            label: "٢ — التأريض: منح الإلكترونات مخرجاً",
            body: (
              <>
                نلمس الناقل بالإصبع (أو نوصله بناقل إلى الأرض) والساق ما تزال قريبة. الإلكترونات المنفصلة، وهي منجذبة بعيداً أصلاً، تجد طريقاً إلى الأرض فتهرب. الآن صار على الناقل عجز حقيقي في الإلكترونات.
              </>
            ),
          },
          {
            label: "٣ — رفع الإصبع قبل إبعاد الساق (ترتيب حاسم!)",
            body: (
              <>
                نقطع طريق الأرض أولاً. الشحنة الموجبة تصبح محبوسة على الناقل، والساق السالبة تمسكها في الجهة القريبة فلا تتوزّع بعد.
              </>
            ),
          },
          {
            label: "٤ — إبعاد الساق: تتوزّع الشحنة",
            body: (
              <>
                بزوال المؤثّر تنتشر الشحنة الموجبة على كامل سطح الناقل. النتيجة: جسم مشحون بشحنة <strong>مخالفة</strong> لشحنة الساق، وشحنة الساق لم تنقص إطلاقاً.
              </>
            ),
          },
          {
            label: "٥ — لماذا الترتيب مهم؟",
            body: (
              <>
                لو أبعدنا الساق قبل رفع الإصبع، لعادت الإلكترونات من الأرض إلى الناقل عبر الإصبع ولبقي متعادلاً. جرّب ذلك في المشهد المتحرّك أعلاه ولن تحصل على أي شحنة.
              </>
            ),
          },
        ]}
        formula={"q_{\\text{body}} = -\\,q_{\\text{rod}} \\quad,\\quad q_{\\text{rod}} = \\text{unchanged}"}
        life="هذه الظاهرة نفسها تعمل داخل مولّد فان دي غراف وفي أجهزة شحن بعض المستشعرات: شحنٌ متحكَّم به دون تلامس مباشر."
        misconception="الحَثّ لا «يسرق» شحنة من الساق. مصدر الشحنة هو الأرض نفسها، والساق مجرّد مؤثّر يعيد الترتيب."
        check={{
          q: "في تجربة الحَثّ، ماذا يحدث لو أبعدنا الساق أولاً ثم رفعنا الإصبع؟",
          a: "يعود الناقل متعادلاً: فبمجرد إبعاد الساق تزول قوة التنافر، فتعود الإلكترونات التي هربت إلى الأرض عبر الإصبع، ولا تبقى شحنة صافية.",
        }}
      />

      <DeepExplain
        title="النواقل والعوازل: لماذا تبقى الشحنة على البلاستيك ولا تبقى على المعدن؟"
        intro="كل تجربة في هذا الدرس تعتمد على التمييز بين نوعين من المواد. الفهم الصحيح يبدأ من سؤال واحد: هل توجد إلكترونات حرّة؟"
        parts={[
          {
            label: "١ — في المعدن: بحر من الإلكترونات الحرة",
            body: (
              <>
                ذرّات المعدن تتخلّى عن إلكتروناتها الخارجية بسهولة فتسبح بينها بحرية. لذلك تنتقل أي شحنة تُعطى للمعدن إلى كامل سطحه فوراً، وتتسرّب إلى الأرض إن كان ممسوكاً باليد.
              </>
            ),
          },
          {
            label: "٢ — في العازل: الإلكترونات مقيّدة",
            body: (
              <>
                في البلاستيك والزجاج والمطاط ترتبط الإلكترونات بذراتها ارتباطاً قوياً، فلا تنتقل. لهذا تبقى الشحنة محصورة في المكان الذي دلكتَه بالضبط، ويمكن أن تشحن منطقة واحدة من مسطرة وتبقى بقية المسطرة متعادلة.
              </>
            ),
          },
          {
            label: "٣ — الاستقطاب يحدث في الحالتين",
            body: (
              <>
                في الناقل تتحرّك الإلكترونات فعلياً إلى الجهة البعيدة، أمّا في العازل فتنزاح قليلاً داخل كل جزيء دون أن تغادره. النتيجة واحدة: تجاذب مع الأجسام المشحونة.
              </>
            ),
          },
          {
            label: "٤ — أشباه النواقل والحالات الوسطى",
            body: (
              <>
                الماء النقي عازل تقريباً، والماء المالح ناقل جيد بسبب الشوارد. الخشب الجاف عازل، والمبتلّ ناقل. الرطوبة تحوّل أسطح العوازل إلى نواقل ضعيفة — ولهذا تفشل التجارب في الجو الرطب.
              </>
            ),
          },
        ]}
        life="مقبض المفك بلاستيكي وسنّه معدني: الجزء المعدني يوصل حيث نحتاج، والجزء البلاستيكي يعزل حيث نحمي أنفسنا."
        misconception="«العازل لا يوصل الكهرباء إطلاقاً» عبارة تقريبية: عند جهود عالية جداً ينهار أي عازل ويصبح ناقلاً — وهذا بالضبط ما يحدث في الصاعقة داخل الهواء."
        check={{
          q: "لماذا تُصنع حوامل التجارب الكهربائية من الزجاج أو البلاستيك؟",
          a: "لأنّها عوازل تمنع تسرّب شحنة الجسم المدروس إلى الأرض أو إلى الحامل، فتبقى الشحنة على الجسم مدة كافية للملاحظة والقياس.",
        }}
      />
    </div>
  );
}