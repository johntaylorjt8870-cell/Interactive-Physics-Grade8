import { useMemo, useState } from "react";
import { Callout, Card, Panel, Slider, SourceTag, Stat, Btn, Divider } from "@/components/ui";
import { IconAtom, IconBolt, IconReset, IconSparkle } from "@/components/icons";
import { T, TEq, num, plainSci, sci } from "@/lib/math";
import { E_CHARGE, chargeWord, electronsFor } from "@/lib/physics";
import { play } from "@/lib/sound";
import { DeepExplain } from "@/components/Explain";

/* -------------------------------------------------------------- */
/* atom drawing                                                    */
/* -------------------------------------------------------------- */

const SHELLS = [
  { rx: 76, ry: 31, cap: 2, tilt: 0, dur: 17, name: "K" },
  { rx: 112, ry: 45, cap: 8, tilt: 62, dur: 27, name: "L" },
  { rx: 146, ry: 58, cap: 8, tilt: 124, dur: 39, name: "M" },
];

function shellCounts(electrons: number) {
  let left = electrons;
  return SHELLS.map((s) => {
    const n = Math.min(left, s.cap);
    left -= n;
    return n;
  });
}

function AtomView({ protons, electrons, net }: { protons: number; electrons: number; net: number }) {
  const cx = 200;
  const cy = 180;
  const counts = shellCounts(electrons);
  const nucleons = Math.min(protons * 2, 26);
  const haloColor = net > 0 ? "#e9a22b" : net < 0 ? "#2e9aa6" : "#8fd9be";

  const nucleonPos = useMemo(() => {
    const pts: { x: number; y: number; positive: boolean }[] = [];
    let placed = 0;
    const rings = [
      { count: 1, radius: 0 },
      { count: 6, radius: 14 },
      { count: 9, radius: 27 },
      { count: 12, radius: 39 },
    ];
    for (const ring of rings) {
      for (let i = 0; i < ring.count && placed < nucleons; i++) {
        const a = (i / ring.count) * Math.PI * 2 + ring.radius;
        pts.push({
          x: cx + Math.cos(a) * ring.radius,
          y: cy + Math.sin(a) * ring.radius * 0.94,
          positive: placed < protons,
        });
        placed++;
      }
    }
    return pts;
  }, [nucleons, protons]);

  return (
    <svg viewBox="0 0 400 366" className="w-full" role="img" aria-label={`ذرّة فيها ${protons} بروتوناً و${electrons} إلكتروناً`}>
      <title>ذرّة تفاعلية</title>
      <desc>
        نواة فيها {protons} بروتوناً، وحولها {electrons} إلكتروناً موزّعة على المدارات؛ الشحنة الصافية {net}.
      </desc>
      <defs>
        <radialGradient id="atomHalo">
          <stop offset="0%" stopColor={haloColor} stopOpacity="0.42" />
          <stop offset="60%" stopColor={haloColor} stopOpacity="0.1" />
          <stop offset="100%" stopColor={haloColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nucleusCore">
          <stop offset="0%" stopColor="#f7d9b8" />
          <stop offset="55%" stopColor="#c4703f" />
          <stop offset="100%" stopColor="#7d3f1d" />
        </radialGradient>
        <radialGradient id="protonBall" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#ffd9b0" />
          <stop offset="55%" stopColor="#d3763f" />
          <stop offset="100%" stopColor="#8f441c" />
        </radialGradient>
        <radialGradient id="neutronBall" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#f2f8f5" />
          <stop offset="55%" stopColor="#a9bcb4" />
          <stop offset="100%" stopColor="#63796f" />
        </radialGradient>
        <radialGradient id="electronBall" cx="34%" cy="30%">
          <stop offset="0%" stopColor="#d7f4f8" />
          <stop offset="50%" stopColor="#39a8b8" />
          <stop offset="100%" stopColor="#14545f" />
        </radialGradient>
        <linearGradient id="orbitStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#56c39c" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#bee9d8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f2c14e" stopOpacity="0.5" />
        </linearGradient>
        <filter id="atomGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r="176" fill="url(#atomHalo)" />
      <circle cx={cx} cy={cy} r="176" fill="none" stroke={haloColor} strokeOpacity="0.28" strokeWidth="1.2" strokeDasharray="2 9" />

      {/* orbits + electrons */}
      {SHELLS.map((sh, si) => {
        const n = counts[si];
        if (n === 0) return null;
        return (
          <g key={sh.name} className="anim-spin-slow" style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: `${sh.dur}s` }}>
            <g transform={`rotate(${sh.tilt} ${cx} ${cy})`}>
              <ellipse cx={cx} cy={cy} rx={sh.rx} ry={sh.ry} fill="none" stroke="url(#orbitStroke)" strokeWidth="1.7" />
              <ellipse cx={cx} cy={cy} rx={sh.rx} ry={sh.ry} fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="6" />
              {Array.from({ length: n }).map((_, i) => {
                const t = (i / n) * Math.PI * 2;
                const x = cx + Math.cos(t) * sh.rx;
                const y = cy + Math.sin(t) * sh.ry;
                const tTrail = t - 0.5;
                const tx = cx + Math.cos(tTrail) * sh.rx;
                const ty = cy + Math.sin(tTrail) * sh.ry;
                return (
                  <g key={i}>
                    <path
                      d={`M${tx} ${ty} A ${sh.rx} ${sh.ry} 0 0 1 ${x} ${y}`}
                      fill="none"
                      stroke="#7fcbd3"
                      strokeOpacity="0.35"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx={x} cy={y} r="10" fill="#2e9aa6" opacity="0.22" />
                    <circle cx={x} cy={y} r="6.6" fill="url(#electronBall)" />
                    <circle cx={x - 2} cy={y - 2.2} r="1.7" fill="#ffffff" opacity="0.75" />
                    <line x1={x - 3.2} y1={y} x2={x + 3.2} y2={y} stroke="#05201b" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
                  </g>
                );
              })}
              <text x={cx + sh.rx + 8} y={cy + 4} fontSize="10" fontWeight="700" fill="#8fd9be" opacity="0.7">
                {sh.name}
              </text>
            </g>
          </g>
        );
      })}

      {/* nucleus */}
      <ellipse cx={cx} cy={cy + 48} rx="46" ry="10" fill="#05201b" opacity="0.35" />
      <circle cx={cx} cy={cy} r="52" fill="url(#nucleusCore)" opacity="0.18" filter="url(#atomGlow)" />
      {nucleonPos.map((nuc, i) => (
        <g key={i}>
          <circle cx={nuc.x} cy={nuc.y} r="10" fill={nuc.positive ? "url(#protonBall)" : "url(#neutronBall)"} stroke="#05201b" strokeOpacity="0.22" strokeWidth="0.8" />
          <circle cx={nuc.x - 3} cy={nuc.y - 3.4} r="2.4" fill="#ffffff" opacity="0.35" />
        </g>
      ))}
      {nucleonPos.slice(0, protons).map((nuc, i) => (
        <g key={`p${i}`} stroke="#fff" strokeWidth="1.7" strokeLinecap="round" opacity="0.95">
          <line x1={nuc.x - 3.4} y1={nuc.y} x2={nuc.x + 3.4} y2={nuc.y} />
          <line x1={nuc.x} y1={nuc.y - 3.4} x2={nuc.x} y2={nuc.y + 3.4} />
        </g>
      ))}

      {/* readout pills */}
      <g>
        <rect x="10" y="12" width="126" height="28" rx="14" fill="#ffffff" opacity="0.92" />
        <circle cx="28" cy="26" r="6" fill="url(#protonBall)" />
        <text x="42" y="30" fontSize="12" fontWeight="700" fill="#16594a">
          بروتونات: {protons}
        </text>
      </g>
      <g>
        <rect x="264" y="12" width="126" height="28" rx="14" fill="#ffffff" opacity="0.92" />
        <circle cx="282" cy="26" r="6" fill="url(#electronBall)" />
        <text x="296" y="30" fontSize="12" fontWeight="700" fill="#175b66">
          إلكترونات: {electrons}
        </text>
      </g>
      <g>
        <rect x="126" y="326" width="148" height="30" rx="15" fill={haloColor} opacity="0.16" />
        <text x="200" y="346" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={haloColor}>
          {net === 0 ? "الذرّة متعادلة" : net > 0 ? `عجز ${net} إلكترون` : `زيادة ${Math.abs(net)} إلكترون`}
        </text>
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------- */

export function StationCharge() {
  const [protons, setProtons] = useState(8);
  const [electrons, setElectrons] = useState(8);
  const [nCInput, setNCInput] = useState(8);

  const net = protons - electrons;
  const qC = net * E_CHARGE;
  const word = chargeWord(net);

  const converted = electronsFor(nCInput * 1e-9);

  return (
    <div className="space-y-8">
      {/* ---------- opening ---------- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-s-4 border-s-forest-700">
          <SourceTag kind="book" page={73} />
          <h3 className="mt-3 text-lg font-bold text-forest-900">ما الكهرباء الساكنة؟</h3>
          <p className="mt-3 text-[15px] leading-8 text-ink-700">
            عند دلك مسطرة بلاستيكية بقطعة صوف تكتسب المسطرة خاصية جذب الأجسام الخفيفة كقصاصات الورق، ونقول إنّ الجسم
            <strong className="text-forest-700"> تكهرب </strong>
            أو أصبح <strong className="text-forest-700">مشحوناً بالكهرباء</strong>. هذه الشحنات تبقى ساكنة على سطح الجسم
            ولا تسري فيه، لذلك سُمّيت <strong className="text-forest-700">الكهرباء الساكنة</strong>.
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-ink-700">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" />
              ساق من الإيبونيت مدلوك بالصوف ← يُشحن <strong>سالباً</strong>.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-spark-500" />
              ساق من الزجاج مدلوك بالحرير ← يُشحن <strong>موجباً</strong>.
            </li>
          </ul>
        </Card>

        <Card>
          <SourceTag kind="platform" />
          <h3 className="mt-3 text-lg font-bold text-forest-900">لماذا يحدث ذلك أصلاً؟</h3>
          <p className="mt-3 text-[15px] leading-8 text-ink-700">
            كل مادة مبنية من ذرّات، وفي نواة كل ذرّة <strong className="text-copper-500">بروتونات موجبة</strong> لا
            تغادر مكانها أبداً في الدلك، وحولها{" "}
            <strong className="text-lagoon-600">إلكترونات سالبة</strong> خفيفة يمكن أن تنتقل من جسم إلى آخر. الدلك لا
            يخلق شحنة جديدة، بل <strong>ينقل إلكترونات</strong>: فالجسم الذي يفقد إلكترونات يصبح موجباً، والذي يكتسبها
            يصبح سالباً.
          </p>
          <div className="mt-4 rounded-2xl bg-forest-50 p-4">
            <TEq e="q = \left(n_{p} - n_{e}\right)\cdot e" label="الشحنة تساوي فرق عدد البروتونات والإلكترونات مضروباً بشحنة الإلكترون" />
            <p className="mt-1 text-center text-xs text-ink-500">
              حيث <T e="e = 1.6 \times 10^{-19}\ \mathrm{C}" label="شحنة الإلكترون 1.6 في 10 أس ناقص 19 كولوم" /> ورمز
              الشحنة <T e="q" label="كيو" /> ووحدتها الكولوم <T e="\mathrm{C}" label="كولوم" />.
            </p>
          </div>
        </Card>
      </div>

      {/* ---------- interactive atom ---------- */}
      <Panel
        title="مختبر الذرّة: حرّك الإلكترونات بنفسك"
        subtitle="غيّر عدد الإلكترونات وشاهد الذرّة تتحوّل من متعادلة إلى مشحونة"
        icon={<IconAtom className="h-5 w-5" />}
        actions={<SourceTag kind="platform" />}
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 p-3">
            <div className="absolute inset-0 grain opacity-[0.08]" />
            <AtomView protons={protons} electrons={electrons} net={net} />
            <div className="relative flex flex-wrap items-center justify-center gap-2 pb-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-forest-100">
                نموذج تعليمي مبسّط — أحجام المدارات ليست بمقياس حقيقي
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-forest-200 bg-white p-4">
              <p className="text-xs font-bold text-ink-500">حالة الجسم الآن</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  net > 0 ? "text-spark-600" : net < 0 ? "text-lagoon-600" : "text-forest-700"
                }`}
              >
                {net === 0 ? "متعادل كهربائياً" : `مشحون بشحنة ${word}`}
              </p>
              <p className="mt-2 text-sm leading-7 text-ink-700">
                {net === 0
                  ? "عدد البروتونات الموجبة يساوي عدد الإلكترونات السالبة، فمحصّلة الشحنة صفر."
                  : net > 0
                    ? `فقد الجسم ${net} إلكتروناً، فزادت شحنة البروتونات الموجبة على الإلكترونات.`
                    : `اكتسب الجسم ${Math.abs(net)} إلكتروناً، فأصبحت شحنته السالبة زائدة.`}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="عدد البروتونات" value={<span className="num">{protons}</span>} tone="spark" />
              <Stat label="عدد الإلكترونات" value={<span className="num">{electrons}</span>} tone="lagoon" />
              <Stat
                label="الفرق (nₚ − nₑ)"
                value={<span className="num">{net > 0 ? `+${net}` : net}</span>}
                tone={net === 0 ? "neutral" : net > 0 ? "spark" : "lagoon"}
              />
              <Stat label="الشحنة q" value={<T e={`${sci(qC, 2)}\\ \\mathrm{C}`} label={`الشحنة ${plainSci(qC, 2)} كولوم`} />} />
            </div>

            <div className="space-y-4 rounded-3xl bg-forest-50 p-4">
              <Slider
                label="عدد البروتونات في النواة"
                value={protons}
                min={3}
                max={12}
                onChange={(v) => {
                  setProtons(v);
                  play("tick");
                }}
                valueTex={<span className="num">{protons}</span>}
                tone="spark"
                hint="تنبيه: تغيير البروتونات يغيّر نوع العنصر، وهذا لا يحدث في التكهرب بالدلك!"
              />
              <Slider
                label="عدد الإلكترونات حول النواة"
                value={electrons}
                min={2}
                max={16}
                onChange={(v) => {
                  setElectrons(v);
                  play("transfer");
                }}
                valueTex={<span className="num">{electrons}</span>}
                tone="lagoon"
                hint="هذه هي الإلكترونات التي تنتقل عند الدلك أو اللمس."
              />
              <div className="flex flex-wrap gap-2">
                <Btn
                  variant="soft"
                  sound="transfer"
                  onClick={() => setElectrons((e) => Math.min(16, e + 1))}
                  disabled={electrons >= 16}
                >
                  + اكتسب إلكتروناً
                </Btn>
                <Btn
                  variant="soft"
                  sound="transfer"
                  onClick={() => setElectrons((e) => Math.max(2, e - 1))}
                  disabled={electrons <= 2}
                >
                  − افقد إلكتروناً
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setElectrons(protons);
                  }}
                >
                  <IconReset className="h-4 w-4" />
                  إعادة التعادل
                </Btn>
              </div>
            </div>
          </div>
        </div>

        <Divider label="دفتر حساب الشحنة" />

        <div className="rounded-3xl border border-forest-200 bg-gradient-to-l from-forest-50 to-white p-5">
          <TEq
            e={`q = (n_p - n_e)\\cdot e = (${protons} - ${electrons}) \\times 1.6\\times 10^{-19} = ${sci(qC, 2)}\\ \\mathrm{C}`}
            label="حساب الشحنة خطوة بخطوة"
          />
          <p className="mt-2 text-center text-sm text-ink-500">
            الشحنة صغيرة جداً بمقياس الكولوم، لذلك نستعمل عادة المضاعفات الصغيرة مثل النانوكولوم{" "}
            <T e="1\ \mathrm{nC} = 10^{-9}\ \mathrm{C}" label="واحد نانوكولوم يساوي 10 أس ناقص 9 كولوم" />.
          </p>
        </div>
      </Panel>

      {/* ---------- enrichment: converter ---------- */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel
          title="كم إلكتروناً في هذه الشحنة؟"
          subtitle="محوّل تفاعلي بين الشحنة وعدد الإلكترونات"
          icon={<IconSparkle className="h-5 w-5" />}
          actions={<SourceTag kind="enrich" />}
        >
          <Slider
            label="الشحنة q بالنانوكولوم"
            value={nCInput}
            min={1}
            max={100}
            step={1}
            onChange={setNCInput}
            valueTex={<T e={`${nCInput}\\ \\mathrm{nC}`} label={`${nCInput} نانوكولوم`} />}
          />
          <div className="mt-5 rounded-2xl bg-forest-950 p-4 text-forest-100">
            <TEq
              e={`n = \\dfrac{q}{e} = \\dfrac${`{${nCInput} \\times 10^{-9}\\ \\mathrm{C}}`}{1.6 \\times 10^{-19}\\ \\mathrm{C}} = ${sci(converted, 2)}`}
              label="عدد الإلكترونات يساوي الشحنة مقسومة على شحنة الإلكترون"
              className="text-white"
            />
            <p className="mt-2 text-center text-xs text-forest-300">
              أي نحو <span className="num">{num(converted / 1e9, 1)}</span> مليار إلكترون! رقم يوضّح صغر شحنة الإلكترون
              الواحد.
            </p>
          </div>
          <Callout tone="warn" className="mt-4" title="الكولوم وحدة ضخمة" icon={<IconBolt className="h-4 w-4" />}>
            شحنة مقدارها <T e="1\ \mathrm{C}" label="واحد كولوم" /> تعني انتقال{" "}
            <T e="6.25 \times 10^{18}" label="6.25 في 10 أس 18" /> إلكترون، وهذا أكبر بكثير مما ينتج عن دلك مشط. لذلك
            شحنات الدلك تُقاس عادة بالنانوكولوم.
          </Callout>
        </Panel>

        <div className="grid gap-4">
          <Card>
            <h4 className="flex items-center gap-2 text-base font-bold text-forest-900">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-forest-100 text-forest-700">
                <IconBolt className="h-4 w-4" />
              </span>
              مبدأ انحفاظ الشحنة
            </h4>
            <p className="mt-2 text-sm leading-7 text-ink-700">
              الشحنة لا تُخلق ولا تفنى؛ ما يفقده جسم يكتسبه الآخر تماماً. عند دلك المشط بالشعر:{" "}
              <T e="q_{\text{comb}} = -q_{\text{hair}}" label="شحنة المشط تساوي سالب شحنة الشعر" />، فيبقى المجموع
              صفراً.
            </p>
          </Card>
          <Card>
            <h4 className="text-base font-bold text-forest-900">قاعدة الاتجاهين</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-lagoon-300/60 bg-lagoon-500/8 p-3">
                <p className="text-sm font-bold text-lagoon-600">اكتساب إلكترونات</p>
                <p className="mt-1 text-xs leading-6 text-ink-700">
                  <T e="n_e > n_p \Rightarrow q < 0" label="عدد الإلكترونات أكبر من البروتونات فالشحنة سالبة" />
                </p>
              </div>
              <div className="rounded-2xl border border-spark-200 bg-spark-50 p-3">
                <p className="text-sm font-bold text-spark-600">فقدان إلكترونات</p>
                <p className="mt-1 text-xs leading-6 text-ink-700">
                  <T e="n_e < n_p \Rightarrow q > 0" label="عدد الإلكترونات أصغر من البروتونات فالشحنة موجبة" />
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-paper-warm">
            <h4 className="text-base font-bold text-forest-900">من الحياة: لسعة مقبض الباب</h4>
            <p className="mt-2 text-sm leading-7 text-ink-700">
              في يوم جاف تمشي على سجادة فتنتقل إلكترونات من حذائك إليها، ويصبح جسمك مشحوناً. عند لمس مقبض معدني تعود
              الإلكترونات دفعة واحدة خلال جزء من الثانية، فترى شرارة صغيرة وتسمع طقطقة — إنها الكهرباء الساكنة نفسها،
              لكن بمقياس مصغّر من الصاعقة.
            </p>
          </Card>
        </div>
      </div>
      <DeepExplain
        title="لماذا الإلكترونات هي التي تنتقل… ولا تنتقل البروتونات أبداً؟"
        tone="tinted"
        intro="كل ظاهرة في هذا الدرس — من قصاصة الورق إلى الصاعقة — سببها انتقال إلكترونات فقط. والسؤال المنطقي: لماذا لا تنتقل البروتونات الموجبة بدلها؟ الجواب في بنية الذرّة نفسها."
        parts={[
          {
            label: "١ — الموقع: النواة في القلب والإلكترونات على الأطراف",
            body: (
              <>
                البروتونات محبوسة داخل النواة في مركز الذرّة، والإلكترونات تدور حولها في مسافات أكبر بعشرات آلاف المرات من حجم النواة. عندما يتلامس جسمان فإنّ ما يتلامس فعلاً هو <strong>الأطراف</strong>، أي السحب الإلكترونية، لا الأنوية.
              </>
            ),
          },
          {
            label: "٢ — قوة الربط: النوويّة أقوى بملايين المرات",
            body: (
              <>
                يرتبط البروتون بجيرانه في النواة بالقوة النووية الشديدة، وهي أقوى بمئات المرات من القوة الكهربائية التي تربط الإلكترون الخارجي. طاقة انتزاع إلكترون خارجي تُقاس بأجزاء من الإلكترون–فولت، أمّا انتزاع بروتون من النواة فيحتاج ملايين الإلكترون–فولتات — وهذا لا يحدث بالدلك أبداً.
              </>
            ),
          },
          {
            label: "٣ — الكتلة: الإلكترون أخفّ نحو 1836 مرة",
            body: (
              <>
                كتلة البروتون تساوي تقريباً <span className="num">1836</span> ضعف كتلة الإلكترون، فالإلكترون هو الجسيم «الخفيف المتحرّك» الذي تستجيب حركته لأي قوة صغيرة تنشأ عند التلامس.
              </>
            ),
          },
          {
            label: "٤ — النتيجة: تغيير عدد البروتونات يغيّر العنصر نفسه",
            body: (
              <>
                عدد البروتونات هو هوية العنصر (العدد الذرّي). لو انتزعنا بروتوناً من ذرّة أكسجين لأصبحت آزوتاً! وهذا يحدث في التفاعلات النووية فقط، وليس في دلك مشط بشعر. لذلك في المختبر أعلاه: حرّك الإلكترونات كما تشاء، أمّا منزلق البروتونات فموجود ليُريك الفرق فقط.
              </>
            ),
          },
        ]}
        formula={"n_p = \\text{const} \\quad,\\quad n_e \\uparrow \\Rightarrow q<0 \\quad,\\quad n_e \\downarrow \\Rightarrow q>0"}
        formulaNote="في كل تجارب التكهرب يبقى عدد البروتونات ثابتاً، ويتغيّر عدد الإلكترونات فقط."
        life="عندما تمشي على سجادة، جسمك يكتسب إلكترونات من السجادة. أنت لا تتحوّل إلى عنصر آخر — فقط صار عدد إلكتروناتك أكبر من عدد بروتوناتك بقليل."
        misconception="عبارة «الجسم اكتسب شحنة موجبة» لا تعني أنه اكتسب بروتونات، بل تعني أنه <strong>فقد</strong> إلكترونات فظهرت شحنة بروتوناته الزائدة."
        check={{
          q: "ذرّة عدد بروتوناتها ١٣ وعدد إلكتروناتها ١٠. ما نوع شحنتها وكم مقدارها بالكولوم؟",
          a: "الفرق 3 إلكترونات مفقودة، إذن الشحنة موجبة ومقدارها q = 3 × 1.6×10⁻¹⁹ = 4.8×10⁻¹⁹ كولوم.",
        }}
      />

      <DeepExplain
        title="من إلكترون واحد إلى كولوم واحد: كيف نتعامل مع هذه الأرقام؟"
        intro="أكثر ما يُربك الطالب في هذا الدرس هو الأرقام الأسّية. والحقيقة أنّ الأمر ميكانيكي تماماً إذا اتّبعت ترتيباً ثابتاً في كل مسألة."
        parts={[
          {
            label: "١ — احفظ الكمّية المرجعية",
            body: (
              <>
                شحنة الإلكترون <span className="font-bold text-forest-700">e = 1.6×10⁻¹⁹ C</span> هي «حبة الشحنة» التي لا تُقسَّم. أي شحنة في الطبيعة هي عدد صحيح من هذه الحبات: q = n·e.
              </>
            ),
          },
          {
            label: "٢ — حوّل الوحدات قبل التعويض",
            body: (
              <>
                النانوكولوم <span className="num">1 nC = 10⁻⁹ C</span>، والميكروكولوم <span className="num">1 µC = 10⁻⁶ C</span>، والسنتيمتر <span className="num">1 cm = 10⁻² m</span>. أكثر أخطاء الامتحان تأتي من نسيان هذا التحويل، لا من نسيان القانون.
              </>
            ),
          },
          {
            label: "٣ — افصل الأعداد عن قوى العشرة",
            body: (
              <>
                عند الضرب اضرب الأعداد أولاً ثم اجمع الأسس، وعند القسمة اطرح الأسس. مثال: (9×10⁹)(4×10⁻⁹) = 36×10⁰ = 36. هذه الخطوة وحدها توفّر نصف الوقت.
              </>
            ),
          },
          {
            label: "٤ — تحقّق من منطق النتيجة",
            body: (
              <>
                هل عدد الإلكترونات عدد صحيح؟ هل الشحنة الناتجة عن الدلك بمرتبة النانوكولوم لا الكولوم؟ هل القوة بين شحنتين صغيرتين صغيرة؟ إن خرجت لك شحنة دلك بمقدار 2 كولوم فاعلم أنّ هناك خطأ في التحويل.
              </>
            ),
          },
        ]}
        formula={"n = \\dfrac{q}{e} \\quad\\Longleftrightarrow\\quad q = n\\,e \\quad,\\quad e = 1.6\\times 10^{-19}\\ \\mathrm{C}"}
        life="شحنة 1 كولوم كاملة تعني انتقال نحو 6.25×10¹⁸ إلكترون — أي أكثر من عدد حبّات الرمل على شاطئ كامل. لهذا نقيس شحنات الدلك بالنانوكولوم."
        misconception="لا تكتب «الشحنة = 1.6×10⁻¹⁹» دون وحدة، ولا تخلط بين e (شحنة الإلكترون) و e (أساس اللوغاريتم). الوحدة جزء من الجواب في الفيزياء."
        check={{
          q: "جسم اكتسب 5×10¹⁰ إلكترون. ما مقدار شحنته وبأي إشارة؟",
          a: "q = n·e = 5×10¹⁰ × 1.6×10⁻¹⁹ = 8×10⁻⁹ C أي 8 نانوكولوم، وإشارتها سالبة لأنه اكتسب إلكترونات.",
        }}
      />

      <DeepExplain
        title="الكهرباء الساكنة مقابل التيار الكهربائي: أين نحن الآن؟"
        intro="هذا الدرس هو بوابة الوحدة الثانية كلها. تمييزك بين «شحنة ساكنة» و«شحنة تسري» سيجعل الدروس التالية أسهل بكثير."
        parts={[
          {
            label: "الكهرباء الساكنة (هذا الدرس)",
            body: (
              <>
                شحنات تتراكم على سطح جسم عازل أو ناقل معزول، وتبقى في مكانها لا تسري. تظهر آثارها كقوى تجاذب وتنافر، وقد تتفرّغ دفعة واحدة كشرارة.
              </>
            ),
          },
          {
            label: "التيار الكهربائي (الدرس التالي)",
            body: (
              <>
                شحنات تسري بانتظام داخل ناقل ضمن دارة مغلقة، بمعدّل ثابت نسمّيه شدّة التيار <span className="font-bold text-forest-700">I = Q/t</span>. هنا لا نهتمّ بالقوة بين شحنتين بل بمعدّل مرور الشحنات.
              </>
            ),
          },
          {
            label: "الجسر بينهما: التفريغ",
            body: (
              <>
                الشرارة التي تشعر بها عند مقبض الباب هي لحظة انتقال من «ساكن» إلى «تيار»: الشحنات المتراكمة تجد فجأة طريقاً موصّلاً فتسري خلال ميكروثوانٍ. الصاعقة هي النسخة العملاقة من هذا الجسر.
              </>
            ),
          },
        ]}
        life="البطارية في يدك ساكنة كهربائياً حتى تصلها بدارة مغلقة؛ عندها يبدأ التيار. أما المشط المدلوك فيبقى ساكناً إلى أن تلمسه فيفرّغ شحنته."
        check={{
          q: "لماذا لا نستطيع تشغيل مصباح بشحنة مشط مدلوك؟",
          a: "لأنّ الشحنة الساكنة صغيرة جداً (نانوكولومات) وتتفرّغ في زمن قصير جداً، فلا تعطي تياراً مستمراً قادراً على تسخين فتيلة المصباح؛ التشغيل يحتاج مصدراً يحافظ على فرق الجهد باستمرار.",
        }}
      />
    </div>
  );
}