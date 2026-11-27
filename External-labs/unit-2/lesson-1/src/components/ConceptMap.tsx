import { useState } from "react";
import { Btn, Panel, SourceTag } from "@/components/ui";
import { IconSparkle } from "@/components/icons";
import { play } from "@/lib/sound";
import { cn } from "@/utils/cn";

type Node = {
  id: string;
  tab: string;
  title: string;
  short: string;
  color: string;
  angle: number;
  detail: string;
};

const NODES: Node[] = [
  {
    id: "charge",
    tab: "charge",
    title: "الشحنة الكهربائية",
    short: "الشحنة",
    color: "#2e9aa6",
    angle: -152,
    detail: "الشحنة كمّية مكمّاة: q = n·e، ووحدتها الكولوم. الجسم يسالب حين يكتسب إلكترونات، ويوجب حين يفقدها، والشحنة الكلية محفوظة دائماً.",
  },
  {
    id: "methods",
    tab: "friction",
    title: "طرائق التكهرب",
    short: "التكهرب",
    color: "#e9a22b",
    angle: -90,
    detail: "الدلك ينقل الإلكترونات بين مادتين مختلفتين، واللمس يعطي شحنة مماثلة، والحَثّ يعطي شحنة مخالفة دون تلامس — وفي الثلاث لا تُخلق شحنة جديدة.",
  },
  {
    id: "forces",
    tab: "coulomb",
    title: "القوة الكهربائية",
    short: "القوة",
    color: "#c6493f",
    angle: -28,
    detail: "المتماثلتان تتنافران والمختلفتان تتجاذبان، والمقدار يتبع F = K|q₁q₂|/d²: يضعف سريعاً مع المسافة ويزداد مع الشحنتين.",
  },
  {
    id: "detect",
    tab: "forces",
    title: "الكشف والقياس",
    short: "الكشف",
    color: "#2fa07c",
    angle: 34,
    detail: "الكاشف الكهربائي يكشف وجود الشحنة ومقدارها عبر انفراج ورقتيه، والاستقطاب يفسّر جذب الأجسام المتعادلة الخفيفة.",
  },
  {
    id: "apps",
    tab: "apps",
    title: "تطبيقات وسلامة",
    short: "التطبيقات",
    color: "#c4703f",
    angle: 104,
    detail: "الصاعقة ومانعتها، الطلاء الكهروستاتيكي، آلات التصوير، مرشّحات الغبار، والتأريض وسيلة أمان أساسية.",
  },
  {
    id: "life",
    tab: "experiments",
    title: "تجارب من الحياة",
    short: "التجارب",
    color: "#227f8c",
    angle: 172,
    detail: "مشط وقصاصات ورق، خيط ماء ينحرف، بالون على الجدار، علبة تتدحرج، وكاشف منزلي من برطمان وسلك.",
  },
];

const CX = 380;
const CY = 215;
const RX = 262;
const RY = 150;

export function ConceptMap({ onGoto }: { onGoto: (tab: string) => void }) {
  const [selected, setSelected] = useState<string | null>("methods");
  const active = NODES.find((n) => n.id === selected) ?? null;

  const pos = (n: Node) => {
    const rad = (n.angle * Math.PI) / 180;
    return { x: CX + Math.cos(rad) * RX, y: CY + Math.sin(rad) * RY };
  };

  return (
    <Panel
      title="خريطة مفاهيم الدرس في نظرة واحدة"
      subtitle="اضغط أي عقدة لتقرأ خلاصتها، ثم انتقل إلى محطتها"
      icon={<IconSparkle className="h-5 w-5" />}
      actions={<SourceTag kind="platform" />}
    >
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 p-2">
          <svg viewBox="0 0 760 430" className="w-full" role="img" aria-label="خريطة مفاهيم درس الكهرباء الساكنة">
            <title>خريطة مفاهيم الكهرباء الساكنة</title>
            <defs>
              <radialGradient id="coreGlow">
                <stop offset="0%" stopColor="#f2c14e" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f2c14e" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g opacity="0.22">
              {Array.from({ length: 19 }).map((_, i) => (
                <line key={`v${i}`} x1={20 + i * 40} y1="10" x2={20 + i * 40} y2="420" stroke="#16594a" />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`h${i}`} x1="10" y1={10 + i * 40} x2="750" y2={10 + i * 40} stroke="#16594a" />
              ))}
            </g>

            {NODES.map((n) => {
              const p = pos(n);
              const isOn = selected === n.id;
              const mx = (CX + p.x) / 2 + (p.y - CY) * 0.18;
              const my = (CY + p.y) / 2 - (p.x - CX) * 0.18;
              return (
                <path
                  key={`link-${n.id}`}
                  d={`M${CX} ${CY} Q ${mx} ${my} ${p.x} ${p.y}`}
                  fill="none"
                  stroke={n.color}
                  strokeWidth={isOn ? 3.4 : 1.8}
                  strokeOpacity={isOn ? 0.95 : 0.45}
                  strokeDasharray={isOn ? "0" : "5 7"}
                />
              );
            })}

            <circle cx={CX} cy={CY} r="96" fill="url(#coreGlow)" />
            <circle cx={CX} cy={CY} r="66" fill="#0a2f28" stroke="#f2c14e" strokeWidth="2.5" />
            <text x={CX} y={CY - 6} textAnchor="middle" fontSize="17" fontWeight="700" fill="#f2c14e">
              الكهرباء
            </text>
            <text x={CX} y={CY + 20} textAnchor="middle" fontSize="17" fontWeight="700" fill="#f2c14e">
              الساكنة
            </text>

            {NODES.map((n) => {
              const p = pos(n);
              const isOn = selected === n.id;
              return (
                <g
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  aria-label={n.title}
                  onClick={() => {
                    setSelected(n.id);
                    play("tick");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelected(n.id);
                  }}
                  className="cursor-pointer"
                >
                  <circle cx={p.x} cy={p.y} r={isOn ? 54 : 46} fill={n.color} opacity={isOn ? 0.28 : 0.14} style={{ transition: "all 260ms ease" }} />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="38"
                    fill="#05201b"
                    stroke={n.color}
                    strokeWidth={isOn ? 3 : 1.8}
                    style={{ transition: "all 260ms ease" }}
                  />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={isOn ? "#ffffff" : "#bee9d8"}>
                    {n.short}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            {NODES.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setSelected(n.id);
                  play("tick");
                }}
                className={cn(
                  "rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all",
                  selected === n.id ? "text-white" : "bg-white text-ink-700 ring-1 ring-inset ring-forest-200 hover:bg-forest-50",
                )}
                style={selected === n.id ? { background: n.color } : undefined}
              >
                {n.title}
              </button>
            ))}
          </div>

          {active && (
            <div key={active.id} className="anim-rise flex-1 rounded-3xl border border-forest-200 bg-forest-50 p-5">
              <h4 className="text-base font-bold" style={{ color: active.color }}>
                {active.title}
              </h4>
              <p className="mt-2 text-sm leading-8 text-ink-700">{active.detail}</p>
              <Btn variant="primary" className="mt-4" onClick={() => onGoto(active.tab)}>
                انتقل إلى المحطة ↗
              </Btn>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}