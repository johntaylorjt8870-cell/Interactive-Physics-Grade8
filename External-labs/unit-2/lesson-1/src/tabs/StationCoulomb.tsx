import { useMemo, useState } from "react";
import { Btn, Callout, Card, Panel, Slider, SourceTag, Stat } from "@/components/ui";
import { IconFormula, IconReset, IconSparkle } from "@/components/icons";
import { T, TEq, num, plainSci, sci } from "@/lib/math";
import { clamp, coulombForce } from "@/lib/physics";
import { cn } from "@/utils/cn";
import { DeepExplain } from "@/components/Explain";

const MEDIA = [
  { id: "air", name: "الهواء", eps: 1 },
  { id: "oil", name: "الزيت", eps: 2.5 },
  { id: "water", name: "الماء", eps: 80 },
] as const;

function ForceScene({
  q1,
  q2,
  d,
  force,
  showVectors,
  showGrid,
}: {
  q1: number;
  q2: number;
  d: number;
  force: number;
  showVectors: boolean;
  showGrid: boolean;
}) {
  const cx = 260;
  const half = clamp(d * 9, 30, 170);
  const r1 = clamp(11 + Math.abs(q1) * 0.85, 13, 30);
  const r2 = clamp(11 + Math.abs(q2) * 0.85, 13, 30);
  const arrow = clamp(20 + Math.log10(force * 1e9 + 1) * 22, 0, 92);
  const repel = q1 * q2 > 0;
  const y = 124;
  const color = (q: number) => (q > 0 ? "#e9a22b" : q < 0 ? "#2e9aa6" : "#9aaaa2");

  const arrowFor = (x: number, dirLeft: boolean) => {
    const x2 = dirLeft ? x - arrow : x + arrow;
    return (
      <g>
        <line x1={x} y1={y} x2={x2} y2={y} stroke="#c6493f" strokeWidth="4.5" strokeLinecap="round" />
        <polygon
          points={
            dirLeft
              ? `${x2 - 3},${y} ${x2 + 14},${y - 8} ${x2 + 14},${y + 8}`
              : `${x2 + 3},${y} ${x2 - 14},${y - 8} ${x2 - 14},${y + 8}`
          }
          fill="#c6493f"
        />
        <circle cx={x} cy={y} r="3" fill="#c6493f" />
      </g>
    );
  };

  return (
    <svg viewBox="0 0 520 232" className="w-full" role="img" aria-label="شحنتان نقطيتان ومتجها القوة بينهما">
      <title>مختبر قانون كولوم</title>
      <defs>
        <radialGradient id="spherePos" cx="33%" cy="28%">
          <stop offset="0%" stopColor="#ffe6b8" />
          <stop offset="52%" stopColor="#e9a22b" />
          <stop offset="100%" stopColor="#9c5e14" />
        </radialGradient>
        <radialGradient id="sphereNeg" cx="33%" cy="28%">
          <stop offset="0%" stopColor="#cdeff5" />
          <stop offset="52%" stopColor="#2e9aa6" />
          <stop offset="100%" stopColor="#0f4a54" />
        </radialGradient>
        <radialGradient id="sphereZero" cx="33%" cy="28%">
          <stop offset="0%" stopColor="#f1f5f3" />
          <stop offset="52%" stopColor="#9aaaa2" />
          <stop offset="100%" stopColor="#59685f" />
        </radialGradient>
        <radialGradient id="chargeHalo">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="520" height="232" rx="24" fill="#f6faf5" />
      {showGrid && (
        <g opacity="0.6">
          {Array.from({ length: 13 }).map((_, i) => (
            <line key={`v${i}`} x1={20 + i * 40} y1="14" x2={20 + i * 40} y2="188" stroke="#e3f4ec" />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`h${i}`} x1="18" y1={22 + i * 40} x2="502" y2={22 + i * 40} stroke="#e3f4ec" />
          ))}
        </g>
      )}

      {/* field lines */}
      {q1 !== 0 &&
        q2 !== 0 &&
        [-1, 1].map((sd) => (
          <path
            key={sd}
            d={`M${cx - half} ${y + sd * 16} C ${cx - half * 0.4} ${y + sd * (repel ? 62 : 34)}, ${cx + half * 0.4} ${
              y + sd * (repel ? 62 : 34)
            }, ${cx + half} ${y + sd * 16}`}
            fill="none"
            stroke={repel ? "#c4703f" : "#2fa07c"}
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeDasharray="6 7"
            className="anim-dash"
          />
        ))}

      {/* ruler */}
      <g>
        <line x1={cx - half} y1="184" x2={cx + half} y2="184" stroke="#c4703f" strokeWidth="2" />
        {[cx - half, cx + half].map((x) => (
          <line key={x} x1={x} y1="176" x2={x} y2="192" stroke="#c4703f" strokeWidth="2" />
        ))}
        {Array.from({ length: Math.max(2, d + 1) }).map((_, i) => {
          const x = cx - half + (i / Math.max(1, d)) * half * 2;
          return <line key={i} x1={x} y1="184" x2={x} y2={i % 5 === 0 ? 190 : 187} stroke="#c4703f" strokeOpacity="0.6" strokeWidth="1" />;
        })}
        <text x={cx} y={210} textAnchor="middle" fontSize="13" fontWeight="700" fill="#c4703f">
          d = {d} cm = {num(d / 100, 2)} m
        </text>
      </g>

      {[
        { x: cx - half, q: q1, r: r1, label: "q₁" },
        { x: cx + half, q: q2, r: r2, label: "q₂" },
      ].map((sp, i) => (
        <g key={i}>
          <circle cx={sp.x} cy={y} r={sp.r + 20} fill={color(sp.q)} opacity="0.1" />
          <circle cx={sp.x} cy={y} r={sp.r + 11} fill={color(sp.q)} opacity="0.16" />
          <circle
            cx={sp.x}
            cy={y}
            r={sp.r}
            fill={sp.q > 0 ? "url(#spherePos)" : sp.q < 0 ? "url(#sphereNeg)" : "url(#sphereZero)"}
            stroke="#05201b"
            strokeOpacity="0.2"
          />
          <ellipse cx={sp.x - sp.r * 0.32} cy={y - sp.r * 0.38} rx={sp.r * 0.3} ry={sp.r * 0.2} fill="#ffffff" opacity="0.5" transform={`rotate(-28 ${sp.x - sp.r * 0.32} ${y - sp.r * 0.38})`} />
          <text x={sp.x} y={y + 8} textAnchor="middle" fontSize="22" fontWeight="800" fill="#fff">
            {sp.q > 0 ? "+" : sp.q < 0 ? "−" : "0"}
          </text>
          <text x={sp.x} y={y - sp.r - 18} textAnchor="middle" fontSize="13" fontWeight="700" fill="#16241f">
            {sp.label} = {sp.q} nC
          </text>
        </g>
      ))}

      {showVectors && force > 0 && (
        <g>
          {arrowFor(cx - half - r1 - 8, repel)}
          {arrowFor(cx + half + r2 + 8, !repel)}
          <rect x={cx - 118} y={y - 78} width="236" height="26" rx="13" fill="#ffffff" opacity="0.9" />
          <text x={cx} y={y - 60} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#c6493f">
            {repel ? "قوتا تنافر متعاكستان" : "قوتا تجاذب متعاكستان"} — F = {plainSci(force, 2)} N
          </text>
        </g>
      )}
    </svg>
  );
}

function Chart({
  mode,
  q1,
  q2,
  d,
  eps,
}: {
  mode: "d" | "q";
  q1: number;
  q2: number;
  d: number;
  eps: number;
}) {
  const w = 460;
  const h = 210;
  const pad = 40;

  const pts = useMemo(() => {
    const arr: { x: number; y: number }[] = [];
    if (mode === "d") {
      for (let i = 1; i <= 20; i += 0.25) arr.push({ x: i, y: coulombForce(q1, q2, i, eps) });
    } else {
      for (let i = 0.5; i <= 20; i += 0.25) arr.push({ x: i, y: coulombForce(i, q2, d, eps) });
    }
    return arr;
  }, [mode, q1, q2, d, eps]);

  const maxY = Math.max(...pts.map((p) => p.y), 1e-9);
  const maxX = 20;
  const sx = (v: number) => pad + (v / maxX) * (w - pad - 16);
  const sy = (v: number) => h - pad - (v / maxY) * (h - pad - 22);

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const area = `${line} L${sx(pts[pts.length - 1].x)},${h - pad} L${sx(pts[0].x)},${h - pad} Z`;
  const curX = mode === "d" ? d : Math.abs(q1);
  const curY = mode === "d" ? coulombForce(q1, q2, d, eps) : coulombForce(Math.abs(q1), q2, d, eps);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={mode === "d" ? "منحنى القوة مع المسافة" : "منحنى القوة مع الشحنة"}>
      <title>{mode === "d" ? "القوة تتناسب عكساً مع مربّع المسافة" : "القوة تتناسب طرداً مع الشحنة"}</title>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2c14e" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#f2c14e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <rect width={w} height={h} rx="18" fill="#05201b" />
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={pad} y1={sy(maxY * f)} x2={w - 16} y2={sy(maxY * f)} stroke="#16594a" strokeWidth="1" strokeDasharray="4 6" />
          <text x={pad - 6} y={sy(maxY * f) + 3} textAnchor="end" fontSize="8.5" fill="#56c39c">
            {plainSci(maxY * f, 1)}
          </text>
        </g>
      ))}
      {[5, 10, 15, 20].map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={h - pad} x2={sx(v)} y2={h - pad + 4} stroke="#56c39c" strokeWidth="1" />
          <text x={sx(v)} y={h - pad + 15} textAnchor="middle" fontSize="9" fill="#8fd9be">
            {v}
          </text>
        </g>
      ))}
      <line x1={pad} y1={h - pad} x2={w - 16} y2={h - pad} stroke="#56c39c" strokeWidth="1.5" />
      <line x1={pad} y1={18} x2={pad} y2={h - pad} stroke="#56c39c" strokeWidth="1.5" />
      <path d={area} fill="url(#chartFill)" />
      <path d={line} fill="none" stroke="#f2c14e" strokeWidth="2.8" strokeLinecap="round" />
      <line x1={sx(curX)} y1={sy(curY)} x2={sx(curX)} y2={h - pad} stroke="#2fa07c" strokeWidth="1.2" strokeDasharray="3 4" />
      <line x1={pad} y1={sy(curY)} x2={sx(curX)} y2={sy(curY)} stroke="#2fa07c" strokeWidth="1.2" strokeDasharray="3 4" />
      <circle cx={sx(curX)} cy={sy(curY)} r="6.5" fill="#2fa07c" stroke="#ffffff" strokeWidth="2" />
      <rect x={Math.min(sx(curX) + 10, w - 92)} y={Math.max(sy(curY) - 26, 6)} width="84" height="20" rx="10" fill="#0a2f28" stroke="#2fa07c" />
      <text x={Math.min(sx(curX) + 52, w - 50)} y={Math.max(sy(curY) - 12, 20)} textAnchor="middle" fontSize="10" fontWeight="700" fill="#e3f4ec">
        {plainSci(curY, 2)} N
      </text>
      <text x={w / 2} y={h - 4} textAnchor="middle" fontSize="10" fill="#8fd9be">
        {mode === "d" ? "المسافة d بالسنتيمتر" : "الشحنة |q₁| بالنانوكولوم"}
      </text>
      <text x={12} y={14} fontSize="10" fill="#8fd9be">
        F (N)
      </text>
    </svg>
  );
}

export function StationCoulomb() {
  const [q1, setQ1] = useState(12);
  const [q2, setQ2] = useState(-8);
  const [d, setD] = useState(6);
  const [medium, setMedium] = useState<(typeof MEDIA)[number]["id"]>("air");
  const [showVectors, setShowVectors] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [chartMode, setChartMode] = useState<"d" | "q">("d");
  const [step, setStep] = useState(0);

  const eps = MEDIA.find((m) => m.id === medium)!.eps;
  const force = coulombForce(q1, q2, d, eps);
  const forceDoubleD = coulombForce(q1, q2, d * 2, eps);
  const forceDoubleQ = coulombForce(q1 * 2, q2, d, eps);

  const steps = [
    { title: "المعطيات", body: <T e={`q_1 = 5\\ \\mathrm{nC},\\quad q_2 = 5\\ \\mathrm{nC},\\quad d = 3\\ \\mathrm{cm} = 0.03\\ \\mathrm{m}`} label="المعطيات" /> },
    { title: "المطلوب", body: <span>حساب مقدار القوة المتبادلة بين الشحنتين وتحديد نوعها.</span> },
    { title: "القانون", body: <T e="F = K\dfrac{|q_1 q_2|}{d^{2}}" label="قانون كولوم" /> },
    {
      title: "التعويض",
      body: <T e="F = 9\times 10^{9}\cdot\dfrac{(5\times 10^{-9})(5\times 10^{-9})}{(0.03)^{2}}" label="التعويض في قانون كولوم" />,
    },
    {
      title: "الحساب",
      body: <T e="F = 9\times 10^{9}\cdot\dfrac{25\times 10^{-18}}{9\times 10^{-4}} = 2.5\times 10^{-4}\ \mathrm{N}" label="نتيجة الحساب" />,
    },
    { title: "التحقّق", body: <span>الشحنتان متماثلتان بالإشارة، فالقوة قوة <strong>تنافر</strong>، والقوّتان متساويتان في المقدار ومتعاكستان في الاتجاه.</span> },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="border-s-4 border-s-forest-700">
          <SourceTag kind="book" page={80} />
          <h3 className="mt-3 text-lg font-bold text-forest-900">قانون كولوم</h3>
          <p className="mt-3 text-[15px] leading-8 text-ink-700">
            القوة الكهربائية بين شحنتين نقطيتين تتناسب طرداً مع جداء مقداري الشحنتين، وعكساً مع مربّع المسافة بينهما:
          </p>
          <TEq e="F = K\,\dfrac{\left|q_{1}\, q_{2}\right|}{d^{2}}" label="قانون كولوم" />
          <p className="text-sm leading-7 text-ink-500">
            حيث <T e="K = 9\times 10^{9}\ \mathrm{N\cdot m^{2}/C^{2}}" label="ثابت كولوم" /> في الهواء، والشحنتان
            بالكولوم والمسافة بالمتر.
          </p>
        </Card>
        <Card>
          <SourceTag kind="platform" />
          <h3 className="mt-3 text-lg font-bold text-forest-900">ثلاث ملاحظات تصنع الفرق</h3>
          <ul className="mt-3 space-y-2.5 text-sm leading-7 text-ink-700">
            <li>
              • نأخذ <strong>القيمة المطلقة</strong> للجداء لحساب المقدار، ونحدّد النوع (تجاذب/تنافر) من الإشارتين.
            </li>
            <li>
              • المسافة تُحوَّل إلى المتر قبل التعويض: <T e="1\ \mathrm{cm} = 10^{-2}\ \mathrm{m}" label="تحويل السنتيمتر إلى متر" />.
            </li>
            <li>
              • القوّتان المتبادلتان متساويتان في المقدار ومتعاكستان في الاتجاه، حتى لو كانت إحدى الشحنتين أكبر بكثير.
            </li>
          </ul>
        </Card>
      </div>

      <Panel
        title="مختبر كولوم: قِس القوة بنفسك"
        subtitle="كل حركة منزلق تُحدِث الرسم والحساب والخطوات في اللحظة نفسها"
        icon={<IconFormula className="h-5 w-5" />}
        actions={
          <>
            <Btn variant="ghost" onClick={() => setShowVectors((v) => !v)} active={showVectors}>
              متجهات القوة
            </Btn>
            <Btn variant="ghost" onClick={() => setShowGrid((v) => !v)} active={showGrid}>
              الشبكة
            </Btn>
            <Btn
              variant="soft"
              onClick={() => {
                setQ1(12);
                setQ2(-8);
                setD(6);
                setMedium("air");
              }}
            >
              <IconReset className="h-4 w-4" />
              إعادة الضبط
            </Btn>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-forest-200">
              <ForceScene q1={q1} q2={q2} d={d} force={force} showVectors={showVectors} showGrid={showGrid} />
            </div>

            <div className="rounded-3xl bg-forest-950 p-5 text-forest-100">
              <p className="text-xs font-bold text-spark-400">الحلّ خطوة بخطوة (تُقرأ من اليسار إلى اليمين)</p>
              <TEq e={`F = K\\dfrac{|q_1 q_2|}{d^{2}}`} label="القانون" className="text-white" />
              <TEq
                e={`F = ${eps === 1 ? "" : `\\dfrac{1}{${eps}}\\cdot `}9\\times 10^{9}\\cdot\\dfrac{\\left|${q1}\\times 10^{-9}\\times(${q2})\\times 10^{-9}\\right|}{(${num(d / 100, 3)})^{2}}`}
                label="التعويض"
                className="text-white"
              />
              <TEq e={`F = ${sci(force, 3)}\\ \\mathrm{N}`} label="النتيجة" className="text-white" />
              <p className="mt-2 text-center text-xs text-forest-300">
                {q1 * q2 > 0 ? "الشحنتان متماثلتان ⇒ تنافر" : q1 * q2 < 0 ? "الشحنتان مختلفتان ⇒ تجاذب" : "إحدى الشحنتين صفر ⇒ لا توجد قوة"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <Slider
              label="الشحنة الأولى q₁"
              value={q1}
              min={-20}
              max={20}
              onChange={setQ1}
              valueTex={<T e={`${q1}\\ \\mathrm{nC}`} label={`${q1} نانوكولوم`} />}
              tone={q1 >= 0 ? "spark" : "lagoon"}
            />
            <Slider
              label="الشحنة الثانية q₂"
              value={q2}
              min={-20}
              max={20}
              onChange={setQ2}
              valueTex={<T e={`${q2}\\ \\mathrm{nC}`} label={`${q2} نانوكولوم`} />}
              tone={q2 >= 0 ? "spark" : "lagoon"}
            />
            <Slider
              label="المسافة d"
              value={d}
              min={1}
              max={20}
              onChange={setD}
              valueTex={<T e={`${d}\\ \\mathrm{cm}`} label={`${d} سنتيمتر`} />}
              tone="forest"
            />

            <div>
              <p className="mb-2 text-sm font-semibold text-ink-700">الوسط بين الشحنتين (إثراء)</p>
              <div className="flex flex-wrap gap-2">
                {MEDIA.map((m) => (
                  <Btn key={m.id} variant={medium === m.id ? "primary" : "ghost"} onClick={() => setMedium(m.id)}>
                    {m.name} <span className="num text-[11px] opacity-70">εr = {m.eps}</span>
                  </Btn>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="القوة الحالية" value={<T e={`${sci(force, 2)}\\ \\mathrm{N}`} label="القوة الحالية" />} tone="forest" />
              <Stat
                label="نوع القوة"
                value={q1 * q2 > 0 ? "تنافر" : q1 * q2 < 0 ? "تجاذب" : "معدومة"}
                tone={q1 * q2 > 0 ? "berry" : q1 * q2 < 0 ? "lagoon" : "neutral"}
              />
            </div>

            <div className="rounded-2xl border border-forest-200 bg-forest-50 p-4">
              <p className="text-xs font-bold text-forest-800">ماذا لو…؟</p>
              <div className="mt-2 grid gap-2 text-sm text-ink-700">
                <div className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                  <span>ضاعفنا المسافة</span>
                  <T e={`F' = \\dfrac{F}{4} = ${sci(forceDoubleD, 2)}\\ \\mathrm{N}`} label="القوة عند مضاعفة المسافة" />
                </div>
                <div className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                  <span>ضاعفنا q₁</span>
                  <T e={`F' = 2F = ${sci(forceDoubleQ, 2)}\\ \\mathrm{N}`} label="القوة عند مضاعفة الشحنة الأولى" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-forest-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-forest-900">الرسم البياني الحيّ</p>
              <div className="flex gap-2">
                <Btn variant={chartMode === "d" ? "primary" : "ghost"} onClick={() => setChartMode("d")}>
                  F مع d
                </Btn>
                <Btn variant={chartMode === "q" ? "primary" : "ghost"} onClick={() => setChartMode("q")}>
                  F مع q₁
                </Btn>
              </div>
            </div>
            <Chart mode={chartMode} q1={q1} q2={q2} d={d} eps={eps} />
            <p className="mt-2 text-xs leading-6 text-ink-500">
              {chartMode === "d"
                ? "منحنٍ متناقص بسرعة: مضاعفة المسافة تُنقص القوة إلى الربع، لأن العلاقة عكسية مع مربّع المسافة."
                : "خط مستقيم: القوة تتناسب طرداً مع مقدار الشحنة الأولى عند ثبات المسافة والشحنة الثانية."}
            </p>
          </div>

          <div className="rounded-3xl border border-forest-200 bg-gradient-to-br from-white to-forest-50 p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-bold text-forest-900">
                <IconSparkle className="h-4 w-4 text-spark-500" />
                مثال محلول — اكشف الخطوات
              </p>
              <div className="flex gap-2">
                <Btn variant="soft" onClick={() => setStep((s) => Math.min(steps.length, s + 1))} disabled={step >= steps.length}>
                  الخطوة التالية
                </Btn>
                <Btn variant="ghost" onClick={() => setStep(0)} disabled={step === 0}>
                  إعادة
                </Btn>
              </div>
            </div>
            <p className="mt-2 text-sm leading-7 text-ink-700">
              شحنتان <T e="q_1 = q_2 = 5\ \mathrm{nC}" label="شحنتان متساويتان 5 نانوكولوم" /> تفصل بينهما مسافة{" "}
              <T e="3\ \mathrm{cm}" label="ثلاثة سنتيمترات" />. احسب القوة المتبادلة.
            </p>
            <ol className="mt-3 space-y-2">
              {steps.slice(0, step).map((s, i) => (
                <li key={s.title} className={cn("rounded-2xl border border-forest-200 bg-white p-3", i === step - 1 && "anim-rise")}>
                  <p className="text-[11px] font-bold text-forest-600">{s.title}</p>
                  <div className="mt-1 text-sm leading-7 text-ink-700">{s.body}</div>
                </li>
              ))}
              {step === 0 && (
                <li className="rounded-2xl border border-dashed border-forest-300 bg-white/60 p-4 text-center text-sm text-ink-500">
                  اضغط «الخطوة التالية» ليظهر الحلّ مرتّباً كما في دفتر الفيزياء.
                </li>
              )}
            </ol>
          </div>
        </div>
      </Panel>

      <Callout tone="warn" title="حدود هذا النموذج">
        القانون مكتوب لشحنتين <strong>نقطيتين</strong> ساكنتين في وسط متجانس. عند وجود أجسام موصّلة قريبة تتوزّع الشحنات
        من جديد فلا تعود المسافة بين «مركزين» كافية للوصف، ويصبح الحساب تقريبياً. أمّا معامل الوسط{" "}
        <T e="\varepsilon_r" label="إبسيلون النسبي" /> فإضافة إثرائية: في الماء مثلاً تضعف القوة نحو{" "}
        <T e="80" label="ثمانين" /> مرة.
      </Callout>

      <Card>
        <h4 className="text-base font-bold text-forest-900">لماذا لا نلاحظ هذه القوة يومياً؟</h4>
        <p className="mt-2 text-sm leading-7 text-ink-700">
          لأن الأجسام متعادلة عادة: أعداد الشحنات الموجبة والسالبة متساوية فتتلاشى آثارها. لكن عند الدلك نُزيح هذا
          التوازن قليلاً، فتظهر قوى قادرة على رفع قصاصة ورق رغم ثقلها الصغير — أي أنّ القوة الكهربائية أقوى بكثير من
          الجاذبية على المقياس الصغير. قارن: قوة كولوم بين شحنتين{" "}
          <T e="10\ \mathrm{nC}" label="عشر نانوكولوم" /> على بعد <T e="1\ \mathrm{cm}" label="واحد سنتيمتر" /> تساوي{" "}
          <T e={`${sci(coulombForce(10, 10, 1), 1)}\ \mathrm{N}`} label="القوة المحسوبة" />، وهي كافية لرفع كتلة صغيرة
          جداً بوضوح.
        </p>
      </Card>
      <DeepExplain
        title="كيف تقرأ قانون كولوم رمزاً رمزاً؟"
        tone="tinted"
        intro="القانون ليس سلسلة رموز تُحفظ، بل جملة كاملة لها معنى. اقرأه ببطء مرة واحدة وستتذكّره إلى الأبد."
        parts={[
          {
            label: "K — ثابت كولوم",
            body: (
              <>
                <span className="font-bold text-forest-700">K = 9×10⁹ N·m²/C²</span> في الهواء (أو الفراغ). هو «معامل التحويل» الذي يجعل الوحدات تتّسق ويعطي الحجم الحقيقي للقوة. وجوده كبير جداً يعني أنّ القوة الكهربائية بين الشحنات ضخمة بطبيعتها، ولهذا لا نلاحظها إلا عند اختلال التوازن.
              </>
            ),
          },
          {
            label: "|q₁q₂| — القيمة المطلقة للجداء",
            body: (
              <>
                نضرب مقدارَي الشحنتين ونأخذ القيمة المطلقة لأنّ القانون يحسب <strong>المقدار</strong> فقط. أمّا الاتجاه (تجاذب أم تنافر) فنستنتجه من الإشارتين قبل الحساب: متماثلتان ← تنافر، مختلفتان ← تجاذب.
              </>
            ),
          },
          {
            label: "d² — مربّع المسافة بين المركزين",
            body: (
              <>
                المسافة بالمتر بين مركزي الشحنتين، ثم تُربَّع. التربيع هو مصدر الحساسية الشديدة: مضاعفة المسافة تُنقص القوة إلى الربع، وتثليتها تُنقصها إلى التسع.
              </>
            ),
          },
          {
            label: "F — قوّتان لا قوّة واحدة",
            body: (
              <>
                القانون يعطي مقدار القوة على كلٍّ من الشحنتين: القوّتان متساويتان في المقدار ومتعاكستان في الاتجاه (قانون نيوتن الثالث)، حتى لو كانت إحداهما أكبر ألف مرة من الأخرى.
              </>
            ),
          },
          {
            label: "شرط الصلاحية: شحنتان نقطيتان",
            body: (
              <>
                «نقطية» تعني أنّ حجم الجسم صغير جداً مقارنة بالمسافة بين الجسمين، فتُعامل الشحنة كأنها مركّزة في نقطة. عند تقارب كرتين مشحونتين جداً يعاد توزيع الشحنة على سطحيهما ويصبح الحساب تقريبياً.
              </>
            ),
          },
        ]}
        formula={"F = K\\,\\dfrac{|q_1 q_2|}{d^{2}} \\quad,\\quad K = 9\\times 10^{9}\\ \\mathrm{N\\cdot m^{2}/C^{2}}"}
        life="قوّة كولوم بين شحنتين مقدار كل منهما 1 كولوم على بعد متر واحد تساوي 9×10⁹ نيوتن — أي وزن نحو مليون طن! هذا يوضّح لماذا يستحيل تجميع كولوم كامل من الشحنة الساكنة."
        misconception="لا تُدخل المسافة بالسنتيمتر في القانون. أكثر خطأ متكرّر هو نسيان القسمة على 100، فتخرج القوة أكبر بعشرة آلاف مرة من الصحيح."
        check={{
          q: "إذا أصبحت المسافة ثلث ما كانت، فبكم تتضاعف القوة؟",
          a: "تسع مرات، لأن القوة تتناسب عكساً مع مربّع المسافة: (1 ÷ (1/3)²) = 9.",
        }}
      />

      <DeepExplain
        title="لماذا «مربّع» المسافة بالذات؟"
        intro="سؤال ذكي يتجاوز الكتاب: لماذا ليست القوة عكسية مع المسافة فقط، بل مع مربّعها؟ الجواب هندسي بحت."
        parts={[
          {
            label: "١ — التأثير ينتشر في كل الاتجاهات",
            body: (
              <>
                تخيّل أنّ الشحنة تُرسل «تأثيرها» بالتساوي في كل الاتجاهات. عند مسافة d يكون هذا التأثير موزّعاً على سطح كرة مساحته 4πd².
              </>
            ),
          },
          {
            label: "٢ — المساحة تتناسب مع مربّع نصف القطر",
            body: (
              <>
                إذا ضاعفت المسافة فإنّ مساحة الكرة تتضاعف أربع مرات، فيتوزّع التأثير نفسه على أربعة أضعاف المساحة، أي يضعف إلى الربع. هذا هو مربّع المسافة.
              </>
            ),
          },
          {
            label: "٣ — القانون نفسه يحكم الجاذبية والصوت والضوء",
            body: (
              <>
                قانون الجذب العام لنيوتن، وشدّة الإضاءة، وشدّة الصوت — كلها تتبع النمط نفسه لأنّها كلها تأثيرات تنتشر من مصدر نقطي في الفراغ ثلاثي الأبعاد.
              </>
            ),
          },
        ]}
        formula={"F \\propto \\dfrac{1}{4\\pi d^{2}} \\;\\Longrightarrow\\; F \\propto \\dfrac{1}{d^{2}}"}
        formulaNote="التربيع ليس صدفة رياضية، بل نتيجة مباشرة لكون الفضاء ثلاثي الأبعاد."
        life="لهذا يضعف ضوء المصباح بسرعة كلما ابتعدت: مضاعفة البعد تعني ربع الإضاءة على الصفحة."
        check={{
          q: "هل يبقى قانون التربيع صحيحاً داخل الماء؟",
          a: "نعم، تبقى العلاقة العكسية مع مربّع المسافة صحيحة، لكن المقدار يضعف بمعامل يُسمّى ثابت العزل النسبي للوسط (نحو 80 في الماء)، ولهذا تُقسم القوة عليه.",
        }}
      />

      <DeepExplain
        title="خطوات حلّ أي مسألة كولوم — بلا حفظ"
        intro="رتّب حلّك دائماً بالترتيب نفسه، فتتحوّل المسألة من «مفاجأة» إلى إجراء تعرفه."
        parts={[
          {
            label: "١ — المعطيات مع الوحدات",
            body: <>اكتب الشحنتين والمسافة كما وردت، ثم حوّل: نانوكولوم ← كولوم بالضرب في 10⁻⁹، وسنتيمتر ← متر بالقسمة على 100.</>,
          },
          {
            label: "٢ — المطلوب ونوعه",
            body: <>هل المطلوب مقدار القوة؟ أم مسافة مجهولة؟ أم شحنة مجهولة؟ تحديد المجهول يحدّد شكل التعويض.</>,
          },
          {
            label: "٣ — القانون ثم الاشتقاق",
            body: (
              <>
                اكتب القانون الأصلي أولاً، ثم اشتقّ منه المجهول قبل التعويض بالأرقام:{" "}
                <span className="font-bold text-forest-700">d = √(K|q₁q₂|/F)</span> مثلاً. الاشتقاق الرمزي يقلّل الأخطاء الحسابية.
              </>
            ),
          },
          {
            label: "٤ — التعويض ثم الحساب",
            body: <>عوّض بالوحدات الأساسية، واحسب الأعداد ثم قوى العشرة كلٌّ على حدة، واكتب النتيجة بالصيغة العلمية مع الوحدة.</>,
          },
          {
            label: "٥ — التحقّق المنطقي",
            body: <>هل النوع (تجاذب/تنافر) موافق للإشارتين؟ هل المقدار معقول؟ هل الوحدة نيوتن؟ سطر واحد من التحقّق ينقذ درجات كثيرة.</>,
          },
        ]}
        formula={"F = K\\dfrac{|q_1q_2|}{d^2} \\;,\\; d = \\sqrt{\\dfrac{K|q_1q_2|}{F}} \\;,\\; |q_1| = \\dfrac{F d^{2}}{K|q_2|}"}
        misconception="عند استخراج المسافة لا تنسَ الجذر التربيعي؛ كثيرون يحسبون d² ويتوقفون عندها فتخرج النتيجة خاطئة تماماً."
        check={{
          q: "شحنتان مقدارهما 6 nC و 6 nC والقوة بينهما 9×10⁻⁵ N. كم المسافة بينهما؟",
          a: "d² = K|q₁q₂|/F = (9×10⁹ × 36×10⁻¹⁸) ÷ (9×10⁻⁵) = 3.6×10⁻³ m²، ومنه d ≈ 0.06 m أي 6 سنتيمترات.",
        }}
      />
    </div>
  );
}