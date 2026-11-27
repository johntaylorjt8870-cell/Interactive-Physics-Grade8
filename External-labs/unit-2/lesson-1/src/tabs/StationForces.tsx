import { useMemo, useState } from "react";
import { Btn, Callout, Card, Panel, Slider, SourceTag, Stat } from "@/components/ui";
import { IconBolt, IconMagnet, IconReset, IconSparkle } from "@/components/icons";
import { T, TEq, num, plainSci, sci } from "@/lib/math";
import { clamp, coulombForce } from "@/lib/physics";
import { play } from "@/lib/sound";
import { cn } from "@/utils/cn";
import { DeepExplain } from "@/components/Explain";

/* ------------------------------------------------------------------ */
/* two suspended balls                                                 */
/* ------------------------------------------------------------------ */

function BallsScene({
  qA,
  qB,
  dCm,
  angle,
  attract,
  force,
}: {
  qA: number;
  qB: number;
  dCm: number;
  angle: number;
  attract: boolean;
  force: number;
}) {
  const half = clamp(dCm * 7, 18, 150);
  const cx = 260;
  const pivotY = 54;
  const len = 118;
  const aDeg = attract ? -angle : angle;

  const ball = (pivotX: number, deg: number, q: number, label: string) => {
    const rad = (deg * Math.PI) / 180;
    const x = pivotX + Math.sin(rad) * len;
    const y = pivotY + Math.cos(rad) * len;
    const color = q > 0 ? "url(#ballPos)" : q < 0 ? "url(#ballNeg)" : "url(#ballNeutral)";
    const flat = q > 0 ? "#e9a22b" : q < 0 ? "#2e9aa6" : "#9aaaa2";
    const dirRight = attract ? pivotX < cx : pivotX > cx;
    return (
      <g style={{ transition: "all 420ms cubic-bezier(0.22,1,0.36,1)" }}>
        <line x1={pivotX} y1={pivotY} x2={x} y2={y} stroke="#6b7d75" strokeWidth="1.8" />
        <circle cx={pivotX} cy={pivotY} r="4" fill="#0a2f28" />
        <ellipse cx={x} cy={214} rx={18} ry={5} fill="#20342c" opacity="0.16" />
        <circle cx={x} cy={y} r="26" fill={flat} opacity="0.14" />
        <circle cx={x} cy={y} r="18" fill={color} stroke="#05201b" strokeOpacity="0.2" />
        <ellipse cx={x - 6} cy={y - 7} rx="5.4" ry="3.8" fill="#ffffff" opacity="0.45" transform={`rotate(-28 ${x - 6} ${y - 7})`} />
        <text x={x} y={y + 7} textAnchor="middle" fontSize="19" fontWeight="800" fill="#fff">
          {q > 0 ? "+" : q < 0 ? "−" : "0"}
        </text>
        {force > 0 && (
          <g>
            <line
              x1={dirRight ? x + 22 : x - 22}
              y1={y}
              x2={dirRight ? x + 22 + 34 : x - 22 - 34}
              y2={y}
              stroke="#c6493f"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <polygon
              points={
                dirRight
                  ? `${x + 62},${y} ${x + 50},${y - 6} ${x + 50},${y + 6}`
                  : `${x - 62},${y} ${x - 50},${y - 6} ${x - 50},${y + 6}`
              }
              fill="#c6493f"
            />
          </g>
        )}
        <text x={x} y={y + 44} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#16241f">
          {label}
        </text>
      </g>
    );
  };

  return (
    <svg viewBox="0 0 520 250" className="w-full" role="img" aria-label="كرتان معلقتان بخيطين تتجاذبان أو تتنافران">
      <title>التجاذب والتنافر بين شحنتين</title>
      <defs>
        <radialGradient id="ballPos" cx="34%" cy="30%">
          <stop offset="0%" stopColor="#ffe0a8" />
          <stop offset="55%" stopColor="#e9a22b" />
          <stop offset="100%" stopColor="#a5651a" />
        </radialGradient>
        <radialGradient id="ballNeg" cx="34%" cy="30%">
          <stop offset="0%" stopColor="#c6eef4" />
          <stop offset="55%" stopColor="#2e9aa6" />
          <stop offset="100%" stopColor="#12505a" />
        </radialGradient>
        <radialGradient id="ballNeutral" cx="34%" cy="30%">
          <stop offset="0%" stopColor="#eef4f1" />
          <stop offset="55%" stopColor="#9aaaa2" />
          <stop offset="100%" stopColor="#5e7268" />
        </radialGradient>
        <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e7f63" />
          <stop offset="100%" stopColor="#0a2f28" />
        </linearGradient>
      </defs>

      <rect width="520" height="250" rx="24" fill="#f6faf5" />
      <g opacity="0.5">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={i} x1={20 + i * 40} y1="12" x2={20 + i * 40} y2="238" stroke="#e3f4ec" />
        ))}
      </g>

      {/* support beam */}
      <rect x="62" y="34" width="396" height="16" rx="8" fill="url(#beamGrad)" />
      <rect x="62" y="34" width="396" height="5" rx="2.5" fill="#ffffff" opacity="0.18" />
      {[80, 440].map((x) => (
        <circle key={x} cx={x} cy={42} r="3.4" fill="#8fd9be" opacity="0.6" />
      ))}

      {ball(cx - half, -aDeg, qA, "الكرة A")}
      {ball(cx + half, aDeg, qB, "الكرة B")}

      {/* ruler */}
      <g>
        <rect x={cx - half} y="212" width={half * 2} height="8" rx="4" fill="#f8f2e4" stroke="#c4703f" strokeOpacity="0.5" />
        {Array.from({ length: Math.max(2, dCm + 1) }).map((_, i) => {
          const x = cx - half + (i / Math.max(1, dCm)) * half * 2;
          return <line key={i} x1={x} y1="212" x2={x} y2={i % 5 === 0 ? 204 : 208} stroke="#c4703f" strokeWidth="1.2" />;
        })}
        <text x={cx} y={236} textAnchor="middle" fontSize="12" fontWeight="700" fill="#c4703f">
          d = {dCm} cm
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* electroscope                                                        */
/* ------------------------------------------------------------------ */

function ElectroscopeScene({
  leafAngle,
  sign,
  rodNear,
  rodSign,
  rodQ,
  netQ,
}: {
  leafAngle: number;
  sign: number;
  rodNear: boolean;
  rodSign: number;
  rodQ: number;
  netQ: number;
}) {
  const leafColor = sign > 0 ? "#e9a22b" : sign < 0 ? "#2e9aa6" : "#b9c9c3";
  const mark = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "0");
  const capSign = netQ !== 0 ? Math.sign(netQ) : rodNear ? -rodSign : 0;

  return (
    <svg viewBox="0 0 420 348" className="w-full" role="img" aria-label="كاشف كهربائي ذا ورقتين معدنيتين">
      <title>الكاشف الكهربائي</title>
      <defs>
        <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="42%" stopColor="#dcefe8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#9fd3c3" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4d7a8" />
          <stop offset="45%" stopColor="#c4703f" />
          <stop offset="100%" stopColor="#7d451f" />
        </linearGradient>
        <radialGradient id="capGrad" cx="34%" cy="28%">
          <stop offset="0%" stopColor="#f2f7f5" />
          <stop offset="55%" stopColor="#b9c9c3" />
          <stop offset="100%" stopColor="#5e7268" />
        </radialGradient>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="45%" stopColor={leafColor} />
          <stop offset="100%" stopColor="#3c4a44" />
        </linearGradient>
        <linearGradient id="rodGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={rodSign > 0 ? "#f8dc9c" : "#a9e2e8"} />
          <stop offset="55%" stopColor={rodSign > 0 ? "#e9a22b" : "#2e9aa6"} />
          <stop offset="100%" stopColor={rodSign > 0 ? "#a5651a" : "#12505a"} />
        </linearGradient>
        <filter id="esShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#20342c" floodOpacity="0.22" />
        </filter>
      </defs>

      <rect width="420" height="348" rx="24" fill="#f6faf5" />

      {/* base */}
      <ellipse cx="210" cy="300" rx="104" ry="12" fill="#20342c" opacity="0.12" />
      <rect x="118" y="286" width="184" height="16" rx="8" fill="#0f3a31" />
      <rect x="118" y="286" width="184" height="5" rx="2.5" fill="#ffffff" opacity="0.14" />

      {/* jar */}
      <g filter="url(#esShadow)">
        <path d="M122 136 h176 v138 a18 18 0 0 1 -18 18 h-140 a18 18 0 0 1 -18 -18 z" fill="url(#jarGlass)" stroke="#8fd9be" strokeWidth="2" />
        <path d="M138 148 v126" stroke="#ffffff" strokeWidth="7" opacity="0.5" strokeLinecap="round" />
        <path d="M282 152 v116" stroke="#ffffff" strokeWidth="3" opacity="0.3" strokeLinecap="round" />
        <rect x="112" y="116" width="196" height="24" rx="11" fill="#16594a" />
        <rect x="112" y="116" width="196" height="7" rx="3.5" fill="#ffffff" opacity="0.18" />
      </g>

      {/* cap + stem */}
      <circle cx="210" cy="92" r="28" fill="url(#capGrad)" stroke="#4b5f57" strokeOpacity="0.5" />
      <ellipse cx="200" cy="82" rx="9" ry="6" fill="#ffffff" opacity="0.5" transform="rotate(-25 200 82)" />
      <text x="210" y="97" textAnchor="middle" fontSize="12" fontWeight="700" fill="#22332c">
        {mark(capSign)}
      </text>
      <rect x="205" y="118" width="10" height="86" rx="5" fill="url(#brass)" />

      {/* leaves */}
      <g>
        <g transform={`rotate(${-leafAngle} 210 204)`}>
          <path d="M206 204 h9 l3 74 h-12 z" fill="url(#leafGrad)" stroke="#5e7268" strokeOpacity="0.4" strokeWidth="0.8" />
        </g>
        <g transform={`rotate(${leafAngle} 210 204)`}>
          <path d="M206 204 h9 l3 74 h-12 z" fill="url(#leafGrad)" stroke="#5e7268" strokeOpacity="0.4" strokeWidth="0.8" opacity="0.92" />
        </g>
        <circle cx="210" cy="204" r="5" fill="#c4703f" />
      </g>

      {leafAngle > 4 &&
        [-1, 1].map((sd) => (
          <text key={sd} x={210 + sd * (24 + leafAngle * 1.1)} y={262} textAnchor="middle" fontSize="15" fontWeight="800" fill={leafColor}>
            {mark(sign)}
          </text>
        ))}

      {/* rod */}
      <g
        style={{
          transform: `translateX(${rodNear ? 0 : -130}px)`,
          transition: "transform 520ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <g transform="rotate(26 96 56)" filter="url(#esShadow)">
          <rect x="26" y="44" width="140" height="22" rx="11" fill="url(#rodGrad2)" />
          <rect x="34" y="48" width="122" height="5" rx="2.5" fill="#ffffff" opacity="0.32" />
        </g>
        {Array.from({ length: 4 }).map((_, i) => (
          <text key={i} x={44 + i * 26} y={34 + i * 11} fontSize="15" fontWeight="800" fill={rodSign > 0 ? "#c9821a" : "#227f8c"}>
            {rodSign > 0 ? "+" : "−"}
          </text>
        ))}
        <text x="46" y="20" fontSize="11.5" fontWeight="700" fill={rodSign > 0 ? "#c9821a" : "#227f8c"}>
          ساق مشحونة ({rodSign > 0 ? "+" : "−"}
          {rodQ} nC)
        </text>
      </g>

      {/* field lines while the rod is close */}
      {rodNear &&
        ["M150 74 C 170 82, 186 86, 196 90", "M146 92 C 166 98, 180 100, 192 102"].map((d) => (
          <path key={d} d={d} fill="none" stroke={rodSign > 0 ? "#e9a22b" : "#2e9aa6"} strokeWidth="1.6" strokeDasharray="5 6" className="anim-dash" opacity="0.8" />
        ))}

      {/* labels */}
      {[
        { x: 322, y: 92, text: "قرص معدني" },
        { x: 322, y: 168, text: "ساق ناقلة" },
        { x: 322, y: 250, text: "ورقتان" },
        { x: 322, y: 296, text: "حامل عازل" },
      ].map((l) => (
        <g key={l.text}>
          <line x1={l.x - 8} y1={l.y - 4} x2={l.x - 30} y2={l.y - 4} stroke="#9aaaa2" strokeWidth="1" strokeDasharray="3 3" />
          <text x={l.x} y={l.y} fontSize="11" fill="#5e7268">
            {l.text}
          </text>
        </g>
      ))}

      <text x="210" y="332" textAnchor="middle" fontSize="12" fill="#5e7268">
        {leafAngle < 3 ? "الورقتان منطبقتان: لا توجد شحنة صافية" : `انفراج الورقتين: ${Math.round(leafAngle)}°`}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export function StationForces() {
  // two-ball lab
  const [qA, setQA] = useState(8);
  const [qB, setQB] = useState(6);
  const [d, setD] = useState(10);

  // electroscope
  const [rodSign, setRodSign] = useState<1 | -1>(-1);
  const [rodQ, setRodQ] = useState(10);
  const [rodNear, setRodNear] = useState(false);
  const [netQ, setNetQ] = useState(0);
  const [log, setLog] = useState<string[]>(["الكاشف متعادل والورقتان منطبقتان."]);

  const force = useMemo(() => coulombForce(qA, qB, d), [qA, qB, d]);
  const sameSign = qA * qB > 0;
  const neutralCase = qA === 0 || qB === 0;
  const angle = clamp(38 * (force / (force + 6e-5)), 0, 38) * (neutralCase ? 0.25 : 1);

  const induced = rodNear ? (rodQ * 26) / (rodQ * 26 + 40) : 0;
  const leafAngle = clamp(Math.abs(netQ) * 2.6 + induced * 14, 0, 44);
  const leafSign = netQ !== 0 ? Math.sign(netQ) : rodNear ? rodSign : 0;

  const pushLog = (line: string) => setLog((l) => [line, ...l].slice(0, 5));

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="border-s-4 border-s-forest-700">
          <SourceTag kind="book" page={77} />
          <h3 className="mt-3 text-lg font-bold text-forest-900">قانون التجاذب والتنافر</h3>
          <p className="mt-3 text-[15px] leading-8 text-ink-700">
            الشحنتان المتماثلتان (موجبة مع موجبة، أو سالبة مع سالبة) <strong>تتنافران</strong>، والشحنتان المختلفتان
            (موجبة مع سالبة) <strong>تتجاذبان</strong>. ويزداد مقدار القوة بازدياد مقدار الشحنتين، ويتناقص بازدياد
            المسافة بينهما.
          </p>
        </Card>
        <Card>
          <SourceTag kind="platform" />
          <h3 className="mt-3 text-lg font-bold text-forest-900">ولماذا ينجذب الجسم المتعادل؟</h3>
          <p className="mt-3 text-[15px] leading-8 text-ink-700">
            عند تقريب جسم مشحون من جسم متعادل، تنجذب شحنات الجسم المتعادل المخالفة نحو الساق وتبتعد المماثلة، فيصبح سطحه
            القريب مخالف الشحنة والسطح البعيد مماثلها. ولأن القوة تضعف مع المسافة، يكون التجاذب مع السطح القريب أكبر من
            التنافر مع السطح البعيد، فتكون المحصّلة <strong>تجاذباً</strong> دائماً. تُسمّى هذه الظاهرة{" "}
            <strong className="text-forest-700">الاستقطاب</strong>.
          </p>
        </Card>
      </div>

      {/* --------- balls lab --------- */}
      <Panel
        title="مختبر الكرتين المعلّقتين"
        subtitle="غيّر الشحنتين والمسافة وراقب اتجاه الخيطين ومقدار القوة"
        icon={<IconMagnet className="h-5 w-5" />}
        actions={<SourceTag kind="platform" />}
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-3xl border border-forest-200">
            <BallsScene qA={qA} qB={qB} dCm={d} angle={angle} attract={!sameSign && !neutralCase} force={force} />
          </div>
          <div className="space-y-4">
            <Slider
              label="شحنة الكرة A"
              value={qA}
              min={-14}
              max={14}
              onChange={setQA}
              valueTex={<T e={`${qA}\\ \\mathrm{nC}`} label={`${qA} نانوكولوم`} />}
              tone={qA >= 0 ? "spark" : "lagoon"}
            />
            <Slider
              label="شحنة الكرة B"
              value={qB}
              min={-14}
              max={14}
              onChange={setQB}
              valueTex={<T e={`${qB}\\ \\mathrm{nC}`} label={`${qB} نانوكولوم`} />}
              tone={qB >= 0 ? "spark" : "lagoon"}
            />
            <Slider
              label="المسافة بين المركزين"
              value={d}
              min={2}
              max={20}
              onChange={setD}
              valueTex={<T e={`${d}\\ \\mathrm{cm}`} label={`${d} سنتيمتر`} />}
              tone="forest"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                label="نوع التأثير"
                value={neutralCase ? "تجاذب ضعيف (استقطاب)" : sameSign ? "تنافر" : "تجاذب"}
                tone={neutralCase ? "neutral" : sameSign ? "berry" : "forest"}
              />
              <Stat label="مقدار القوة" value={<T e={`${sci(force, 2)}\\ \\mathrm{N}`} label={`${plainSci(force, 2)} نيوتن`} />} tone="spark" />
            </div>

            <div className="rounded-2xl bg-forest-50 p-4">
              <TEq
                e={`F = K\\dfrac{|q_1 q_2|}{d^{2}} = 9\\times 10^{9}\\cdot\\dfrac{|${qA}\\times 10^{-9} \\times ${qB}\\times 10^{-9}|}{(${num(d / 100, 2)})^{2}} = ${sci(force, 2)}\\ \\mathrm{N}`}
                label="حساب القوة بين الكرتين"
              />
            </div>

            <Callout tone={sameSign && !neutralCase ? "danger" : "success"} title="لاحظ">
              {neutralCase
                ? "إحدى الكرتين متعادلة، ومع ذلك يوجد تجاذب ضعيف بسبب الاستقطاب — وهذه هي حالة قصاصات الورق مع المشط."
                : sameSign
                  ? "الشحنتان متماثلتان، فابتعدت الكرتان وانفرج الخيطان إلى الخارج."
                  : "الشحنتان مختلفتان، فاقتربت الكرتان ومال الخيطان إلى الداخل."}
            </Callout>
          </div>
        </div>
      </Panel>

      {/* --------- electroscope --------- */}
      <Panel
        title="الكاشف الكهربائي: كشف الشحنة بالإشارة والمقدار"
        subtitle="قرّب، المس، أرّض، ثم أبعِد… وراقب الورقتين"
        icon={<IconBolt className="h-5 w-5" />}
        tone="deep"
        actions={<SourceTag kind="platform" className="bg-forest-800 text-forest-100 ring-forest-700" />}
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-3xl bg-white/95 p-2">
            <ElectroscopeScene leafAngle={leafAngle} sign={leafSign} rodNear={rodNear} rodSign={rodSign} rodQ={rodQ} netQ={netQ} />
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat
                label="صافي شحنة الكاشف"
                value={<T e={`${netQ > 0 ? "+" : ""}${num(netQ, 1)}\\ \\mathrm{nC}`} label={`${num(netQ, 1)} نانوكولوم`} />}
                tone={netQ > 0 ? "spark" : netQ < 0 ? "lagoon" : "neutral"}
              />
              <Stat
                label="حالة الورقتين"
                value={leafAngle < 3 ? "منطبقتان" : `منفرجتان ${Math.round(leafAngle)}°`}
                tone={leafAngle < 3 ? "neutral" : "forest"}
              />
            </div>

            <div className="rounded-2xl bg-forest-800/60 p-4 ring-1 ring-inset ring-forest-700">
              <p className="text-xs font-bold text-forest-300">أدوات التجربة</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Btn
                  variant={rodNear ? "ghost" : "spark"}
                  onClick={() => {
                    setRodNear(!rodNear);
                    pushLog(
                      !rodNear
                        ? "قرّبنا الساق المشحونة من القرص: انفصلت الشحنات وانفرجت الورقتان دون أن تتغيّر شحنة الكاشف الصافية."
                        : "أبعدنا الساق: عادت الشحنات إلى توزّعها فانسحبت الورقتان (إن لم يكن الكاشف مشحوناً).",
                    );
                    play("whoosh");
                  }}
                  sound="none"
                >
                  {rodNear ? "أبعِد الساق" : "قرّب الساق"}
                </Btn>
                <Btn
                  variant="soft"
                  onClick={() => {
                    const gained = Number((rodSign * rodQ * 0.5).toFixed(1));
                    setNetQ(gained);
                    setRodNear(true);
                    pushLog("لمسنا القرص بالساق (تكهرب باللمس): انتقلت شحنة من الساق، فأصبح الكاشف مشحوناً بالإشارة نفسها.");
                    play("spark");
                  }}
                  sound="none"
                >
                  المس القرص بالساق
                </Btn>
                <Btn
                  variant="soft"
                  onClick={() => {
                    if (rodNear) {
                      const gained = Number((-rodSign * rodQ * 0.4).toFixed(1));
                      setNetQ(gained);
                      pushLog("أرّضنا الكاشف بالإصبع والساق قريبة: هربت الشحنات المماثلة إلى الأرض، فبقيت على الكاشف شحنة مخالفة للساق.");
                    } else {
                      setNetQ(0);
                      pushLog("أرّضنا الكاشف والساق بعيدة: عاد متعادلاً وانطبقت الورقتان.");
                    }
                    play("transfer");
                  }}
                  sound="none"
                >
                  أرّض بالإصبع
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setNetQ(0);
                    setRodNear(false);
                    setLog(["أعدنا الكاشف إلى حالته المتعادلة."]);
                  }}
                >
                  <IconReset className="h-4 w-4" />
                  إعادة الضبط
                </Btn>
              </div>

              <div className="mt-4 space-y-3">
                <Slider
                  label={<span className="text-forest-100">مقدار شحنة الساق</span>}
                  value={rodQ}
                  min={2}
                  max={20}
                  onChange={(v) => {
                    setRodQ(v);
                  }}
                  valueTex={<T e={`${rodQ}\\ \\mathrm{nC}`} label={`${rodQ} نانوكولوم`} />}
                  tone="spark"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-forest-300">إشارة الساق:</span>
                  <Btn variant={rodSign > 0 ? "spark" : "ghost"} onClick={() => setRodSign(1)}>
                    موجبة +
                  </Btn>
                  <Btn variant={rodSign < 0 ? "spark" : "ghost"} onClick={() => setRodSign(-1)}>
                    سالبة −
                  </Btn>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-forest-950/70 p-4 ring-1 ring-inset ring-forest-800">
              <p className="text-xs font-bold text-spark-400">سجلّ الملاحظات</p>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-6 text-forest-200">
                {log.map((line, i) => (
                  <li key={`${line}-${i}`} className={cn("flex gap-2", i === 0 && "anim-rise text-white")}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-spark-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-forest-800/50 p-4 ring-1 ring-inset ring-forest-700">
            <h4 className="flex items-center gap-2 text-sm font-bold text-white">
              <IconSparkle className="h-4 w-4 text-spark-400" /> ماذا نستنتج؟
            </h4>
            <p className="mt-2 text-[13px] leading-7 text-forest-200">
              انفراج الورقتين يدلّ على وجود شحنة، ومقدار الانفراج يدلّ على مقدارها، أمّا الإشارة فنحدّدها بمقارنة سلوك
              الكاشف مع ساق معلومة الشحنة.
            </p>
          </div>
          <div className="rounded-2xl bg-forest-800/50 p-4 ring-1 ring-inset ring-forest-700">
            <h4 className="text-sm font-bold text-white">مهمّة استكشاف ١</h4>
            <p className="mt-2 text-[13px] leading-7 text-forest-200">
              قرّب ساقاً سالبة ثم أبعدها دون لمس. هل تغيّرت شحنة الكاشف الصافية؟ (الجواب: لا — الانفراج كان بسبب انفصال
              الشحنات فقط).
            </p>
          </div>
          <div className="rounded-2xl bg-forest-800/50 p-4 ring-1 ring-inset ring-forest-700">
            <h4 className="text-sm font-bold text-white">مهمّة استكشاف ٢</h4>
            <p className="mt-2 text-[13px] leading-7 text-forest-200">
              أرّض الكاشف والساق قريبة، ثم أبعِد الساق. ستجد أنّ الكاشف احتفظ بشحنة <strong>مخالفة</strong> لإشارة الساق:
              هذا هو التكهرب بالحَثّ.
            </p>
          </div>
        </div>
      </Panel>
      <DeepExplain
        title="الاستقطاب: لماذا ينجذب جسمٌ متعادل نحو جسم مشحون؟"
        tone="tinted"
        intro="هذه أكثر فكرة يسأل عنها الطلاب: الورقة متعادلة، والمشط مشحون، فمن أين جاء التجاذب؟ الجواب أنّ «متعادلاً» لا تعني «بلا شحنات»، بل «شحنات متساوية موزّعة بانتظام» — وهذا التوزيع يمكن أن يختلّ."
        parts={[
          {
            label: "١ — الجسم المتعادل مليء بالشحنات",
            body: (
              <>
                في كل قصاصة ورق تريليونات البروتونات الموجبة والإلكترونات السالبة، مجموعها صفر. لكن هذه الشحنات ليست ملتصقة بمكانها: في النواقل تتحرّك الإلكترونات بحرية، وفي العوازل تنزاح قليلاً داخل كل جزيء.
              </>
            ),
          },
          {
            label: "٢ — الجسم المشحون يعيد الترتيب",
            body: (
              <>
                عند تقريب مشط سالب: تنفر إلكترونات الورقة فتبتعد إلى الجهة البعيدة، وتبقى الجهة القريبة موجبة. صار للورقة «وجهان»: قريب مخالف وبعيد مماثل.
              </>
            ),
          },
          {
            label: "٣ — المسافة تحسم النتيجة",
            body: (
              <>
                الشحنات المخالفة قريبة والمماثلة بعيدة، ولأنّ القوة تتناسب عكساً مع مربّع المسافة فإنّ التجاذب مع القريب أكبر من التنافر مع البعيد. المحصّلة إذاً <strong>تجاذب دائماً</strong>، أياً كانت إشارة الجسم المشحون.
              </>
            ),
          },
          {
            label: "٤ — لماذا تسقط القصاصة بعد لحظات؟",
            body: (
              <>
                عند التلامس تنتقل بعض الإلكترونات إلى القصاصة فتصبح مشحونة بالإشارة نفسها، وعندها يتحوّل التجاذب إلى تنافر فتُقذف بعيداً. هذه الظاهرة نفسها تراها في مختبر الكاشف عند الضغط على «المس القرص بالساق».
              </>
            ),
          },
        ]}
        formula={"F_{\\text{net}} = K\\,\\dfrac{|q\\,q_{\\text{near}}|}{d_{\\text{near}}^{2}} - K\\,\\dfrac{|q\\,q_{\\text{far}}|}{d_{\\text{far}}^{2}} > 0"}
        formulaNote="الحدّ الأول (تجاذب) أكبر لأنّ مسافته أصغر، فتكون المحصّلة تجاذباً."
        life="خيط الماء الرقيق ينجذب إلى البالون رغم أنّ الماء متعادل، لأنّ جزيء الماء قطبي أصلاً فيدور مقدّماً طرفه الموجب — وهذا استقطاب من نوع خاص يُسمّى التوجّه."
        misconception="لا تقل «الجسم المتعادل لا يتأثر بالمجال الكهربائي». الصحيح أنه يتأثر وينجذب دائماً، لكنه لا يتنافر أبداً مع جسم مشحون."
        check={{
          q: "هل يمكن لجسمين متعادلين أن يتجاذبا كهربائياً؟",
          a: "لا؛ فالاستقطاب يحتاج جسماً مشحوناً يُحدث إعادة التوزيع. جسمان متعادلان تماماً لا توجد بينهما قوة كهربائية صافية.",
        }}
      />

      <DeepExplain
        title="الكاشف الكهربائي: كيف نعرف أنّ جسماً مشحون، وما إشارته؟"
        intro="الكاشف أبسط أداة قياس في هذا الدرس، وأذكى ما فيه أنّه يحوّل «شحنة غير مرئية» إلى «زاوية انفراج مرئية» يمكن مقارنتها."
        parts={[
          {
            label: "١ — التركيب",
            body: (
              <>
                قرص معدني في الأعلى، متصل بساق ناقلة تمرّ عبر سدادة عازلة إلى داخل وعاء زجاجي، وفي أسفلها ورقتان معدنيتان رقيقتان جداً. الزجاج يعزل الداخل ويحميه من تيارات الهواء، والسدادة تمنع تسرّب الشحنة إلى الهيكل.
              </>
            ),
          },
          {
            label: "٢ — عند التقريب (بلا لمس)",
            body: (
              <>
                تُستقطب منظومة القرص–الساق–الورقتين: تنفر الإلكترونات إلى الورقتين (إن كانت الساق سالبة) فتكتسبان الشحنة نفسها وتتنافران فتنفرجان. الشحنة الصافية للكاشف تبقى صفراً، ولهذا تنطبق الورقتان فور إبعاد الساق.
              </>
            ),
          },
          {
            label: "٣ — عند اللمس",
            body: (
              <>
                تنتقل شحنة حقيقية من الساق إلى الكاشف، فتصبح له شحنة صافية بالإشارة نفسها. الآن تبقى الورقتان منفرجتين حتى بعد إبعاد الساق، ولا تعودان إلا بالتأريض.
              </>
            ),
          },
          {
            label: "٤ — كيف نحدّد الإشارة؟",
            body: (
              <>
                نشحن الكاشف أولاً بشحنة معلومة (مثلاً سالباً)، ثم نقرّب الجسم المجهول: إن زاد الانفراج فالجسم سالب مثل الكاشف، وإن نقصّ فالجسم موجب. الكاشف إذاً يقيس الإشارة بالمقارنة لا بالمطلق.
              </>
            ),
          },
          {
            label: "٥ — حدود الأداة",
            body: (
              <>
                الكاشف لا يعطي قيمة رقمية للشحنة، بل مقارنة تقريبية. كما أنّ شحنته تتسرّب مع الزمن خصوصاً في الجو الرطب، فلا تصلح للقياسات الدقيقة.
              </>
            ),
          },
        ]}
        formula={"\\theta \\uparrow \\;\\Longleftrightarrow\\; |q| \\uparrow \\qquad,\\qquad q_{\\text{net}} = 0 \\;\\text{(induction only)}"}
        formulaNote="زاوية الانفراج مقياس نوعي لمقدار الشحنة، لا مقياس عدّي مضبوط."
        life="الكاشف المنزلي في محطة التجارب (برطمان + سلك + رقاقة ألمنيوم) هو النسخة المبسّطة نفسها، ويعمل فعلاً مع بالون مدلوك."
        misconception="انفراج الورقتين لا يعني دائماً أنّ الكاشف اكتسب شحنة؛ في حالة التقريب فقط يكون الانفراج بسبب إعادة توزيع الشحنات الداخلية."
        check={{
          q: "قرّبنا ساقاً مجهولة من كاشف مشحون سالباً فقلّ الانفراج. ما إشارة الساق؟",
          a: "موجبة؛ لأنها تجذب إلكترونات الكاشف إلى أعلى نحو القرص، فتقلّ الشحنة على الورقتين ويقلّ التنافر بينهما.",
        }}
      />
    </div>
  );
}