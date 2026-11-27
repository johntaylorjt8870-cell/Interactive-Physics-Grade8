import { useMemo, useRef, useState } from "react";
import { Btn, Callout, Card, Panel, Slider, SourceTag, Stat } from "@/components/ui";
import { IconBolt, IconReset, IconRub, IconSparkle } from "@/components/icons";
import { T, TEq, plainSci, sci } from "@/lib/math";
import { TRIBO, electronsFor, rubCharge } from "@/lib/physics";
import { play } from "@/lib/sound";
import { cn } from "@/utils/cn";
import { DeepExplain } from "@/components/Explain";

const byId = (id: string) => TRIBO.find((m) => m.id === id)!;

function MaterialPicker({
  title,
  value,
  onChange,
  exclude,
  tone,
}: {
  title: string;
  value: string;
  onChange: (id: string) => void;
  exclude: string;
  tone: "spark" | "lagoon";
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink-700">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {TRIBO.map((m) => (
          <button
            key={m.id}
            type="button"
            title={m.hint}
            onClick={() => {
              play("tick");
              onChange(m.id);
            }}
            className={cn(
              "rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-200",
              value === m.id
                ? tone === "spark"
                  ? "bg-spark-500 text-forest-950 shadow-[0_8px_18px_-12px_rgba(233,162,43,1)]"
                  : "bg-lagoon-500 text-white shadow-[0_8px_18px_-12px_rgba(46,154,166,1)]"
                : m.id === exclude
                  ? "bg-white/60 text-ink-300 ring-1 ring-inset ring-ink-300/40"
                  : "bg-white text-ink-700 ring-1 ring-inset ring-forest-200 hover:bg-forest-50 hover:text-forest-700",
            )}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}

type TextureKind = "fiber" | "gloss" | "grain" | "smooth";

function textureOf(id: string): TextureKind {
  if (["fur", "hair", "wool", "silk", "cotton", "skin"].includes(id)) return "fiber";
  if (["glass", "plastic", "pvc", "teflon", "rubber"].includes(id)) return "gloss";
  if (["wood", "paper"].includes(id)) return "grain";
  return "smooth";
}

function Surface({
  id,
  x,
  y,
  w,
  h,
  positive,
  label,
  charge,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  positive: boolean;
  label: string;
  charge: number;
}) {
  const kind = textureOf(id);
  const gradId = positive ? "matPos" : "matNeg";
  const marks = Math.min(9, Math.round(charge / 1.1));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="12" fill={`url(#${gradId})`} />
      {kind === "gloss" && <rect x={x + 8} y={y + 5} width={w - 16} height="7" rx="3.5" fill="#ffffff" opacity="0.32" />}
      {kind === "grain" &&
        [0.3, 0.55, 0.8].map((f) => (
          <path
            key={f}
            d={`M${x + 10} ${y + h * f} q ${w * 0.25} -6 ${w * 0.5} 0 t ${w * 0.4} 0`}
            stroke="#ffffff"
            strokeOpacity="0.18"
            strokeWidth="2"
            fill="none"
          />
        ))}
      {kind === "fiber" &&
        Array.from({ length: 22 }).map((_, i) => (
          <path
            key={i}
            d={`M${x + 10 + i * ((w - 20) / 21)} ${y + 6} q 4 ${h / 2} -2 ${h - 12}`}
            stroke="#ffffff"
            strokeOpacity="0.16"
            strokeWidth="1.6"
            fill="none"
          />
        ))}
      {kind === "smooth" && <rect x={x + 8} y={y + h - 12} width={w - 16} height="5" rx="2.5" fill="#05201b" opacity="0.12" />}
      <rect x={x} y={y} width={w} height={h} rx="12" fill="none" stroke="#05201b" strokeOpacity="0.18" />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#05201b">
        {label}
      </text>
      {Array.from({ length: marks }).map((_, i) => (
        <g key={i}>
          <circle cx={x + 18 + i * 30} cy={positive ? y - 14 : y + h + 14} r="9" fill={positive ? "#e05a45" : "#1f8fa6"} opacity="0.16" />
          <circle cx={x + 18 + i * 30} cy={positive ? y - 14 : y + h + 14} r="5.4" fill={positive ? "#e05a45" : "#1f8fa6"} />
          <line
            x1={x + 15 + i * 30}
            y1={positive ? y - 14 : y + h + 14}
            x2={x + 21 + i * 30}
            y2={positive ? y - 14 : y + h + 14}
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {positive && (
            <line x1={x + 18 + i * 30} y1={y - 17} x2={x + 18 + i * 30} y2={y - 11} stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </g>
      ))}
    </g>
  );
}

function RubScene({
  aId,
  bId,
  aName,
  bName,
  aPositive,
  strokes,
  rubbing,
  charge,
}: {
  aId: string;
  bId: string;
  aName: string;
  bName: string;
  aPositive: boolean;
  strokes: number;
  rubbing: boolean;
  charge: number;
}) {
  const electrons = Math.min(11, Math.round(charge));
  const down = aPositive;
  const meter = Math.min(1, charge / 12);

  return (
    <svg viewBox="0 0 520 286" className="w-full" role="img" aria-label={`دلك ${aName} بـ ${bName}`}>
      <title>ورشة الدلك</title>
      <desc>
        {aName} يُدلك بـ {bName}؛ تنتقل الإلكترونات من {aPositive ? aName : bName} إلى {aPositive ? bName : aName}.
      </desc>
      <defs>
        <linearGradient id="matPos" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8dc9c" />
          <stop offset="55%" stopColor="#e9a22b" />
          <stop offset="100%" stopColor="#b9741a" />
        </linearGradient>
        <linearGradient id="matNeg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9e2e8" />
          <stop offset="55%" stopColor="#2e9aa6" />
          <stop offset="100%" stopColor="#14545f" />
        </linearGradient>
        <radialGradient id="rubGlow">
          <stop offset="0%" stopColor="#f2c14e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f2c14e" stopOpacity="0" />
        </radialGradient>
        <filter id="rubShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#062e27" floodOpacity="0.28" />
        </filter>
      </defs>

      <rect x="0" y="0" width="520" height="286" rx="24" fill="#f6faf5" />
      <g opacity="0.55">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`v${i}`} x1={20 + i * 40} y1="14" x2={20 + i * 40} y2="272" stroke="#e3f4ec" />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1="16" y1={22 + i * 40} x2="504" y2={22 + i * 40} stroke="#e3f4ec" />
        ))}
      </g>

      {/* contact glow while rubbing */}
      {rubbing && <ellipse cx="260" cy="140" rx="150" ry="26" fill="url(#rubGlow)" />}

      {/* top material */}
      <g className={rubbing ? "anim-rub" : undefined} filter="url(#rubShadow)">
        <Surface id={aId} x={120} y={64} w={280} h={40} positive={aPositive} label={aName} charge={charge} />
      </g>

      {/* travelling electrons */}
      {strokes > 0 &&
        Array.from({ length: electrons }).map((_, i) => (
          <g
            key={i}
            className="anim-electron"
            style={{ animationDelay: `${(i * 0.12).toFixed(2)}s`, animationDirection: down ? "normal" : "reverse" }}
          >
            <circle cx={146 + i * 24} cy={down ? 112 : 132} r="9" fill="#2e9aa6" opacity="0.2" />
            <circle cx={146 + i * 24} cy={down ? 112 : 132} r="6.2" fill="#1f8fa6" />
            <line
              x1={143 + i * 24}
              y1={down ? 112 : 132}
              x2={149 + i * 24}
              y2={down ? 112 : 132}
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>
        ))}

      {/* bottom material */}
      <g filter="url(#rubShadow)">
        <Surface id={bId} x={120} y={164} w={280} h={40} positive={!aPositive} label={bName} charge={charge} />
      </g>

      {/* charge meters */}
      {[
        { x: 40, value: meter, color: aPositive ? "#e9a22b" : "#2e9aa6", label: aName },
        { x: 452, value: meter, color: aPositive ? "#2e9aa6" : "#e9a22b", label: bName },
      ].map((m) => (
        <g key={m.x}>
          <rect x={m.x} y="64" width="26" height="140" rx="13" fill="#ffffff" stroke="#bee9d8" />
          <rect
            x={m.x + 4}
            y={200 - m.value * 132}
            width="18"
            height={m.value * 132}
            rx="9"
            fill={m.color}
            style={{ transition: "all 350ms cubic-bezier(0.22,1,0.36,1)" }}
          />
          <text x={m.x + 13} y="222" textAnchor="middle" fontSize="10" fontWeight="700" fill="#5e7268">
            {m.value === 0 ? "0" : `${(m.value * 12).toFixed(1)}`}
          </text>
          <text x={m.x + 13} y="236" textAnchor="middle" fontSize="8.5" fill="#9aaaa2">
            nC
          </text>
        </g>
      ))}

      {/* motion hint */}
      {rubbing && (
        <g>
          <path d="M150 44 h60" stroke="#c4703f" strokeWidth="2.4" strokeLinecap="round" />
          <polygon points="216,44 206,39 206,49" fill="#c4703f" />
          <path d="M370 44 h-60" stroke="#c4703f" strokeWidth="2.4" strokeLinecap="round" />
          <polygon points="304,44 314,39 314,49" fill="#c4703f" />
        </g>
      )}

      <text x="260" y="266" textAnchor="middle" fontSize="12" fill="#5e7268">
        عدد مرات الدلك: {strokes} — الإلكترونات تنتقل من {aPositive ? aName : bName} إلى {aPositive ? bName : aName}
      </text>
    </svg>
  );
}

export function StationFriction() {
  const [aId, setA] = useState("hair");
  const [bId, setB] = useState("plastic");
  const [strokes, setStrokes] = useState(12);
  const [rubbing, setRubbing] = useState(false);
  const timer = useRef<number | null>(null);

  const a = byId(aId);
  const b = byId(bId);
  const charge = useMemo(() => rubCharge(a.rank, b.rank, strokes), [a.rank, b.rank, strokes]);
  const aPositive = a.rank > b.rank;
  const same = a.id === b.id;
  const electrons = electronsFor(charge * 1e-9);

  const rub = (times = 6) => {
    setStrokes((s) => Math.min(40, s + times));
    setRubbing(true);
    play("whoosh");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRubbing(false), 1500);
  };

  const ranked = [...TRIBO].sort((m1, m2) => m2.rank - m1.rank);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-s-4 border-s-forest-700">
          <SourceTag kind="book" page={74} />
          <h3 className="mt-3 text-lg font-bold text-forest-900">التكهرب بالدلك</h3>
          <p className="mt-3 text-[15px] leading-8 text-ink-700">
            عند دلك جسمين مختلفين أحدهما بالآخر تنتقل الإلكترونات من أحدهما إلى الآخر، فيُشحن الجسمان بشحنتين متساويتين
            في المقدار ومتعاكستين في الإشارة. وتختلف قابلية المواد لاكتساب الإلكترونات أو فقدانها، فمنها ما يُشحن موجباً
            ومنها ما يُشحن سالباً.
          </p>
        </Card>
        <Card>
          <SourceTag kind="platform" />
          <h3 className="mt-3 text-lg font-bold text-forest-900">كيف نتوقّع الإشارة قبل التجربة؟</h3>
          <p className="mt-3 text-[15px] leading-8 text-ink-700">
            نرتّب المواد على «سلّم التكهرب»: المادة الأقرب إلى قمّة السلّم تفقد إلكتروناتها بسهولة فتُشحن
            <strong className="text-spark-600"> موجباً</strong>، والأقرب إلى القاع تكتسب الإلكترونات فتُشحن
            <strong className="text-lagoon-600"> سالباً</strong>. وكلما بَعُدَت المادتان على السلّم كان التكهرب أقوى.
          </p>
        </Card>
      </div>

      <Panel
        title="ورشة الدلك التفاعلية"
        subtitle="اختر مادتين، دلكهما، وراقب إلى أين تذهب الإلكترونات"
        icon={<IconRub className="h-5 w-5" />}
        actions={
          <>
            <Btn variant="spark" onClick={() => rub(6)} sound="none">
              <IconRub className="h-4 w-4" />
              دلك ×6
            </Btn>
            <Btn
              variant="ghost"
              onClick={() => {
                setStrokes(0);
                setRubbing(false);
              }}
            >
              <IconReset className="h-4 w-4" />
              تصفير
            </Btn>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <MaterialPicker title="المادة الأولى (العليا)" value={aId} onChange={setA} exclude={bId} tone="spark" />
            <MaterialPicker title="المادة الثانية (السفلى)" value={bId} onChange={setB} exclude={aId} tone="lagoon" />
            <Slider
              label="عدد مرات الدلك"
              value={strokes}
              min={0}
              max={40}
              onChange={(v) => {
                setStrokes(v);
                setRubbing(true);
                if (timer.current) window.clearTimeout(timer.current);
                timer.current = window.setTimeout(() => setRubbing(false), 900);
              }}
              valueTex={<span className="num">{strokes}</span>}
              tone="forest"
              hint="كل مرّة دلك تنقل حزمة من الإلكترونات؛ الشحنة تزداد ثم تتشبّع."
            />
            <div className="flex flex-wrap gap-2">
              <Btn
                variant="soft"
                onClick={() => {
                  setA(bId);
                  setB(aId);
                }}
              >
                ⇄ بدّل المادتين
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  setA("glass");
                  setB("silk");
                  setStrokes(14);
                }}
              >
                تجربة الكتاب: زجاج + حرير
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  setA("wool");
                  setB("pvc");
                  setStrokes(14);
                }}
              >
                تجربة الكتاب: صوف + إيبونيت
              </Btn>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-forest-200">
              <RubScene
                aId={a.id}
                bId={b.id}
                aName={a.name}
                bName={b.name}
                aPositive={aPositive}
                strokes={same ? 0 : strokes}
                rubbing={rubbing && !same}
                charge={same ? 0 : charge}
              />
            </div>

            {same ? (
              <Callout tone="warn" title="مادتان متماثلتان">
                لا يحدث تكهرب يُذكر عند دلك مادة بمادة مثلها؛ فالقابلية على اكتساب الإلكترونات متساوية، ويبقى الجسمان
                متعادلين. جرّب مادتين مختلفتين.
              </Callout>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat
                  label={`شحنة ${a.name}`}
                  value={<T e={`${aPositive ? "+" : "-"}${charge}\\ \\mathrm{nC}`} label={`${charge} نانوكولوم`} />}
                  tone={aPositive ? "spark" : "lagoon"}
                />
                <Stat
                  label={`شحنة ${b.name}`}
                  value={<T e={`${aPositive ? "-" : "+"}${charge}\\ \\mathrm{nC}`} label={`${charge} نانوكولوم`} />}
                  tone={aPositive ? "lagoon" : "spark"}
                />
                <Stat label="إلكترونات منتقلة" value={<T e={sci(electrons, 2)} label={`${plainSci(electrons, 2)} إلكترون`} />} />
              </div>
            )}

            {!same && (
              <div className="rounded-2xl bg-forest-50 p-4">
                <TEq
                  e={`q = n\\cdot e = ${sci(electrons, 2)} \\times 1.6\\times 10^{-19} = ${sci(charge * 1e-9, 2)}\\ \\mathrm{C} = ${charge}\\ \\mathrm{nC}`}
                  label="حساب الشحنة من عدد الإلكترونات المنتقلة"
                />
                <p className="mt-2 text-center text-sm leading-7 text-ink-700">
                  {aPositive ? a.name : b.name} فقد الإلكترونات فأصبح موجباً، و{aPositive ? b.name : a.name} اكتسبها
                  فأصبح سالباً — والشحنتان متساويتان في المقدار:{" "}
                  <T e="q_{+} = -q_{-}" label="الشحنة الموجبة تساوي سالب الشحنة السالبة" />.
                </p>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* triboelectric ladder */}
      <Panel
        title="سلّم التكهرب بالدلك"
        subtitle="من يَمْنح الإلكترونات (الأعلى) إلى من يَكتسبها (الأسفل)"
        icon={<IconSparkle className="h-5 w-5" />}
        actions={<SourceTag kind="enrich" />}
      >
        <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
          <ol className="relative space-y-1.5">
            {ranked.map((m) => {
              const selected = m.id === aId || m.id === bId;
              const isPositiveSide = !same && selected && ((m.id === aId && aPositive) || (m.id === bId && !aPositive));
              return (
                <li
                  key={m.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm transition-all",
                    selected
                      ? isPositiveSide
                        ? "border-spark-400 bg-spark-50 font-bold text-spark-600"
                        : "border-lagoon-300 bg-lagoon-500/10 font-bold text-lagoon-600"
                      : "border-forest-100 bg-white text-ink-700",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: m.rank > 0 ? "#e9a22b" : "#2e9aa6", opacity: 0.35 + Math.abs(m.rank) / 16 }}
                    />
                    {m.name}
                  </span>
                  <span className="text-[11px] text-ink-500">{m.hint}</span>
                </li>
              );
            })}
          </ol>

          <div className="space-y-4">
            <Callout tone="info" title="اتجاه انتقال الإلكترونات" icon={<IconBolt className="h-4 w-4" />}>
              {!same ? (
                <>
                  في اختيارك الحالي تنتقل الإلكترونات من <strong>{aPositive ? a.name : b.name}</strong> إلى{" "}
                  <strong>{aPositive ? b.name : a.name}</strong>، لأن الفرق في الرتبة بينهما{" "}
                  <T e={`\\Delta r = ${Math.abs(a.rank - b.rank)}`} label={`فرق الرتبة ${Math.abs(a.rank - b.rank)}`} />.
                </>
              ) : (
                <>اختر مادتين مختلفتين لترى اتجاه انتقال الإلكترونات وقوّة التكهرب.</>
              )}
            </Callout>
            <Card className="bg-paper-warm">
              <h4 className="text-base font-bold text-forest-900">لماذا تختفي الظاهرة في يوم رطب؟</h4>
              <p className="mt-2 text-sm leading-7 text-ink-700">
                بخار الماء يشكّل طبقة رقيقة موصّلة على أسطح الأجسام، فتتسرّب الشحنات إلى الهواء قبل أن تتراكم. لهذا تنجح
                تجارب الكهرباء الساكنة في الشتاء الجاف وتفشل في يوم ماطر.
              </p>
            </Card>
            <Card>
              <h4 className="text-base font-bold text-forest-900">من الحياة</h4>
              <ul className="mt-2 space-y-2 text-sm leading-7 text-ink-700">
                <li>• الملابس في النشافة تتلاصق لأن ألياف مختلفة تُدلك معاً فتُشحن بشحنات متعاكسة.</li>
                <li>• كيس التغليف يلتصق بيدك لأن البلاستيك يكتسب الإلكترونات بسهولة.</li>
                <li>• شاحنة الوقود تُوصَل بالأرض قبل التفريغ كي لا تُشعل شرارةٌ ساكنة البخار.</li>
              </ul>
            </Card>
          </div>
        </div>
      </Panel>
      <DeepExplain
        title="ما الذي يحدث فعلاً عند سطح التلامس؟"
        tone="tinted"
        intro="نقول «دلكنا المشط بالصوف» فنتخيّل سطحين أملسين يتلامسان بالكامل. الحقيقة أنّ التلامس يحدث عند نقاط محدودة جداً، وفيها تحدث كل القصة."
        parts={[
          {
            label: "١ — السطح خشن تحت المجهر",
            body: (
              <>
                أي سطح، مهما بدا ناعماً، مليء بالنتوءات المجهرية. عند الضغط تلتقي قمم هذه النتوءات فقط، فتكون مساحة التلامس الحقيقية جزءاً صغيراً جداً من المساحة الظاهرية.
              </>
            ),
          },
          {
            label: "٢ — الدلك يزيد عدد نقاط التلامس",
            body: (
              <>
                كل حركة دلك تُبدّل نقاط التلامس وتزيد عددها التراكمي، فتُتاح فرص أكثر لانتقال الإلكترونات. لهذا تزداد الشحنة مع عدد مرات الدلك، ولهذا أيضاً يسخن الجسمان قليلاً عند الدلك.
              </>
            ),
          },
          {
            label: "٣ — الإلكترون يقفز إلى المادة «الأشره» له",
            body: (
              <>
                عند كل نقطة تلامس تقترب السحب الإلكترونية للمادتين حتى تتداخل، فينتقل الإلكترون إلى المادة التي تجذب إلكتروناتها بقوة أكبر (طاقة ربط أعلى). هذا هو سبب وجود اتجاه ثابت لانتقال الشحنة بين كل زوج مواد.
              </>
            ),
          },
          {
            label: "٤ — لماذا لا تستمر الشحنة بالزيادة إلى ما لا نهاية؟",
            body: (
              <>
                لأنّ الشحنة المتراكمة تبدأ بالتنافر مع الإلكترونات القادمة الجديدة فتقاوم قدومها، ولأنّ الهواء المحيط يبدأ بتسريب جزء منها (خصوصاً في الجو الرطب). نصل إلى حالة <strong>تشبّع</strong> تتوازن فيها الإضافة مع التسرّب.
              </>
            ),
          },
        ]}
        formula={"q_{\\text{total}} = n \\cdot e \\quad\\text{with } n \\propto \\text{(strokes)} \\times |\\Delta r|"}
        formulaNote="الشحنة تزداد مع عدد مرات الدلك ومع بُعد المادتين على سلّم التكهرب."
        life="لهذا تفرك يديك في الشتاء فتدفآن: الاحتكاك نفسه الذي ينقل الإلكترونات يحوّل جزءاً من الشغل إلى حرارة."
        misconception="الضغط الشديد ليس بديلاً عن الحركة: جسمان مضغوطان بلا حركة بينهما لا يتكهربان تقريباً، لأنّ نقاط التلامس لا تتجدّد."
        check={{
          q: "لماذا تنجح تجربة الدلك مع الصوف أكثر من نجاحها مع قطعة معدنية ممسوكة باليد؟",
          a: "لأنّ المعدن ناقل ويدك ناقل ومؤرَّضة، فالشحنة المتولّدة تتسرّب فوراً إلى الأرض عبر جسمك ولا تتراكم. أمّا الصوف فعازل يحتفظ بالشحنة على سطحه.",
        }}
      />

      <DeepExplain
        title="سلّم التكهرب: لماذا تُشحن موادّ موجباً وأخرى سالباً؟"
        intro="ترتيب المواد في السلّم ليس عشوائياً ولا حفظاً أعمى، بل يعكس خاصية فيزيائية حقيقية لكل مادة: مدى شدّة إمساكها بإلكتروناتها الخارجية."
        parts={[
          {
            label: "١ — طاقة الربط (الألفة الإلكترونية)",
            body: (
              <>
                في بعض المواد تكون الإلكترونات الخارجية مرتبطة بضعف نسبي، فتغادر بسهولة عند أدنى فرصة (الزجاج، الفرو، الشعر). وفي موادّ أخرى يكون ارتباطها أقوى فتخطف إلكتروناً إضافياً وتحتفظ به (البلاستيك، PVC، التفلون).
              </>
            ),
          },
          {
            label: "٢ — القاعدة العملية",
            body: (
              <>
                عند دلك أي مادتين: الأقرب إلى قمّة السلّم يفقد إلكترونات ← يُشحن <strong className="text-spark-600">موجباً</strong>، والأقرب إلى القاع يكتسبها ← يُشحن <strong className="text-lagoon-600">سالباً</strong>. والمقدار يزداد كلما ابتعدتا عن بعضهما في السلّم.
              </>
            ),
          },
          {
            label: "٣ — لماذا لا نضع المعادن في السلّم؟",
            body: (
              <>
                لأنّ المعدن الممسوك باليد يفقد شحنته فوراً إلى الأرض، فلا تُلاحظ عليه شحنة ساكنة. أما إذا مسكته بمقبض عازل فيمكن شحنه فعلاً — وهذا يفسّر لماذا تُصنع أدوات التجارب بمقابض بلاستيكية.
              </>
            ),
          },
          {
            label: "٤ — تحقّق بنفسك",
            body: (
              <>
                اختر في المختبر أعلاه زوجين متقاربين في السلّم (مثل الورق والقطن) ثم زوجين متباعدين (مثل الفرو والتفلون)، ولاحظ الفرق في مقدار الشحنة عند عدد الدلكات نفسه.
              </>
            ),
          },
        ]}
        formula={"|q| \\propto |r_A - r_B| \\quad,\\quad r = \\text{rank on the triboelectric ladder}"}
        life="ملابس النايلون فوق كنزة صوفية = شرارات صغيرة في العتمة عند خلعها؛ النايلون والصوف متباعدان في السلّم فينتقل بينهما عدد كبير من الإلكترونات."
        misconception="لا يوجد «مادة موجبة دائماً» أو «سالبة دائماً»: الإشارة تعتمد على الزوج. الزجاج يُشحن موجباً مع الحرير، لكنه قد يُشحن سالباً مع مادة أعلى منه في السلّم."
        check={{
          q: "دلكنا ساق زجاج بالحرير. أيّهما يصبح موجباً ولماذا؟",
          a: "الزجاج، لأنه أعلى في السلّم فيفقد إلكترونات لصالح الحرير؛ يصبح الزجاج موجباً والحرير سالباً بالمقدار نفسه.",
        }}
      />
    </div>
  );
}