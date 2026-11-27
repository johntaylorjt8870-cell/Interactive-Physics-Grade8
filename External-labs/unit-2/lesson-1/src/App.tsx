import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Footer, Header, waLink, ENGINEER, type TabMeta } from "@/components/Chrome";
import { Hero } from "@/components/Hero";
import { Btn } from "@/components/ui";
import {
  IconArrowLeft,
  IconArrowRight,
  IconAtom,
  IconFactory,
  IconFlask,
  IconFormula,
  IconLayers,
  IconMagnet,
  IconQuiz,
  IconRub,
  IconWhatsApp,
} from "@/components/icons";
import { StationCharge } from "@/tabs/StationCharge";
import { StationFriction } from "@/tabs/StationFriction";
import { StationForces } from "@/tabs/StationForces";
import { StationCoulomb } from "@/tabs/StationCoulomb";
import { StationInduction } from "@/tabs/StationInduction";
import { StationExperiments } from "@/tabs/StationExperiments";
import { StationApps } from "@/tabs/StationApps";
import { StationQuiz } from "@/tabs/StationQuiz";
import { play } from "@/lib/sound";

const TABS: TabMeta[] = [
  {
    id: "charge",
    index: "1",
    title: "الشحنة الكهربائية وبنية الذرّة",
    short: "الشحنة والذرّة",
    blurb: "من أين تأتي الشحنة؟ حرّك الإلكترونات بنفسك واحسب q = n·e خطوة بخطوة.",
    icon: (p) => <IconAtom {...p} />,
  },
  {
    id: "friction",
    index: "2",
    title: "ورشة التكهرب بالدلك",
    short: "ورشة الدلك",
    blurb: "اختر مادتين من سلّم التكهرب، دلكهما، وتتبّع رحلة الإلكترونات لحظة بلحظة.",
    icon: (p) => <IconRub {...p} />,
  },
  {
    id: "forces",
    index: "3",
    title: "التجاذب والتنافر والكاشف الكهربائي",
    short: "التجاذب والكاشف",
    blurb: "كرتان معلّقتان تستجيبان لشحنتيك، وكاشف كهربائي تقرّبه وتلمسه وتؤرّضه.",
    icon: (p) => <IconMagnet {...p} />,
  },
  {
    id: "coulomb",
    index: "4",
    title: "مختبر قانون كولوم",
    short: "قانون كولوم",
    blurb: "متجهات قوة حيّة، تعويض فوري في القانون، ورسم بياني يتغيّر مع كل منزلق.",
    icon: (p) => <IconFormula {...p} />,
  },
  {
    id: "induction",
    index: "5",
    title: "اللمس والحَثّ والتأريض",
    short: "اللمس والحَثّ",
    blurb: "مشهد متحرّك من ست مراحل يشرح لماذا يعطي الحَثّ شحنة مخالفة، مع لعبة النواقل.",
    icon: (p) => <IconLayers {...p} />,
  },
  {
    id: "experiments",
    index: "6",
    title: "تجارب من الحياة الواقعية",
    short: "تجارب واقعية",
    blurb: "سبع تجارب منزلية كاملة: أدوات، خطوات، مؤقّت، تفسير، وسجلّ ملاحظات قابل للتصدير.",
    icon: (p) => <IconFlask {...p} />,
  },
  {
    id: "apps",
    index: "7",
    title: "من المختبر إلى الحياة: تطبيقات وسلامة",
    short: "تطبيقات وسلامة",
    blurb: "الصواعق ومانعتها، الطلاء الكهروستاتيكي، وحاسبة مسافة الصاعقة بصوت الرعد.",
    icon: (p) => <IconFactory {...p} />,
  },
  {
    id: "quiz",
    index: "8",
    title: "اختبر نفسي",
    short: "اختبر نفسي",
    blurb: "أربعة عشر سؤالاً متدرّجة مع تفسير لكل إجابة وبطاقة مراجعة سريعة.",
    icon: (p) => <IconQuiz {...p} />,
  },
];

export default function App() {
  const initial = useMemo(() => {
    const hash = window.location.hash.replace("#", "");
    return TABS.some((t) => t.id === hash) ? hash : "charge";
  }, []);

  const [active, setActive] = useState(initial);
  const [visited, setVisited] = useState<Set<string>>(() => new Set([initial]));
  const contentRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback((id: string, scroll = true) => {
    setActive(id);
    setVisited((v) => new Set(v).add(id));
    window.history.replaceState(null, "", `#${id}`);
    if (scroll) {
      window.requestAnimationFrame(() => {
        const el = contentRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 132;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    }
  }, []);

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (TABS.some((t) => t.id === hash)) {
        setActive(hash);
        setVisited((v) => new Set(v).add(hash));
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const currentIndex = TABS.findIndex((t) => t.id === active);
  const current = TABS[currentIndex];
  const prev = currentIndex > 0 ? TABS[currentIndex - 1] : null;
  const next = currentIndex < TABS.length - 1 ? TABS[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-paper">
      <Header tabs={TABS} active={active} onSelect={(id) => goTo(id)} visited={visited.size} />

      <main>
        <Hero onStart={() => goTo("charge")} onExperiments={() => goTo("experiments")} />

        <div ref={contentRef} className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6">
          {/* station header */}
          <div className="relative mb-7 overflow-hidden rounded-[28px] border border-forest-200/80 bg-gradient-to-l from-forest-900 via-forest-800 to-forest-700 p-6 text-forest-100 sm:p-8">
            <div className="pointer-events-none absolute inset-0 grain opacity-[0.07]" />
            <div className="pointer-events-none absolute -left-10 -top-16 h-52 w-52 rounded-full bg-spark-400/15 blur-3xl anim-float" />
            <div className="relative flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold text-spark-400">
                  المحطة <span className="num">{current.index}</span> من <span className="num">{TABS.length}</span>
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{current.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-forest-200">{current.blurb}</p>
              </div>
              <div className="flex items-center gap-2">
                <Btn variant="ghost" onClick={() => prev && goTo(prev.id)} disabled={!prev}>
                  <IconArrowRight className="h-4 w-4" />
                  {prev ? prev.short : "البداية"}
                </Btn>
                <Btn variant="spark" onClick={() => next && goTo(next.id)} disabled={!next}>
                  {next ? next.short : "النهاية"}
                  <IconArrowLeft className="h-4 w-4" />
                </Btn>
              </div>
            </div>

            <div className="relative mt-5 flex gap-1.5">
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  aria-label={t.short}
                  onClick={() => goTo(t.id)}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <= currentIndex ? "bg-spark-400" : "bg-forest-600/60"
                  }`}
                />
              ))}
            </div>
          </div>

          <div key={active} className="anim-rise">
            {active === "charge" && <StationCharge />}
            {active === "friction" && <StationFriction />}
            {active === "forces" && <StationForces />}
            {active === "coulomb" && <StationCoulomb />}
            {active === "induction" && <StationInduction />}
            {active === "experiments" && <StationExperiments onGoto={(id) => goTo(id)} />}
            {active === "apps" && <StationApps />}
            {active === "quiz" && <StationQuiz onGoto={(id) => goTo(id)} />}
          </div>

          {/* bottom station navigation */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <button
                type="button"
                onClick={() => {
                  play("tick");
                  goTo(prev.id);
                }}
                className="group rounded-3xl border border-forest-200 bg-white p-5 text-right transition-all hover:-translate-y-0.5 hover:border-forest-400"
              >
                <p className="text-xs font-bold text-ink-500">المحطة السابقة</p>
                <p className="mt-1 flex items-center gap-2 text-base font-bold text-forest-900">
                  <IconArrowRight className="h-4 w-4 text-forest-500 transition-transform group-hover:translate-x-1" />
                  {prev.title}
                </p>
              </button>
            ) : (
              <span />
            )}
            {next && (
              <button
                type="button"
                onClick={() => {
                  play("tick");
                  goTo(next.id);
                }}
                className="group rounded-3xl border border-forest-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-forest-400 sm:text-left"
              >
                <p className="text-xs font-bold text-ink-500">المحطة التالية</p>
                <p className="mt-1 flex items-center justify-end gap-2 text-base font-bold text-forest-900">
                  {next.title}
                  <IconArrowLeft className="h-4 w-4 text-forest-500 transition-transform group-hover:-translate-x-1" />
                </p>
              </button>
            )}
          </div>

          {/* mid-page WhatsApp banner */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => play("spark")}
            className="group mt-10 flex flex-col items-center justify-between gap-4 overflow-hidden rounded-[28px] border border-[#25d366]/30 bg-gradient-to-l from-forest-900 via-forest-800 to-[#0b7a45]/70 p-6 text-right transition-all hover:-translate-y-0.5 sm:flex-row sm:p-7"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0b7a45] to-[#25d366] text-white shadow-[0_14px_30px_-14px_rgba(37,211,102,0.9)]">
                <IconWhatsApp className="h-7 w-7" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">هل استوقفتك فكرة في هذا الدرس؟</p>
                <p className="mt-1 text-xs leading-6 text-forest-200">
                  راسل {ENGINEER.name} مباشرة على واتساب: <span dir="ltr" className="num font-bold text-spark-400">{ENGINEER.phoneDisplay}</span>
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white ring-1 ring-inset ring-white/20 transition-colors group-hover:bg-white/20">
              افتح المحادثة
              <IconArrowLeft className="h-4 w-4" />
            </span>
          </a>
        </div>
      </main>

      <Footer tabs={TABS} onSelect={(id) => goTo(id)} />
    </div>
  );
}