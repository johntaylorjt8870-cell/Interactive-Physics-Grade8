import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { IconBolt, IconLab, IconSoundOff, IconSoundOn, IconWhatsApp } from "@/components/icons";
import { isMuted, onMuteChange, toggleMuted, play } from "@/lib/sound";

export const ENGINEER = {
  name: "المهندس سومر شاهين",
  phoneDisplay: "0930215022",
  phoneIntl: "963930215022",
  message: "مرحباً مهندس سومر، لدي استفسار حول درس الكهرباء الساكنة (الوحدة الثانية).",
};

export const waLink = `https://wa.me/${ENGINEER.phoneIntl}?text=${encodeURIComponent(ENGINEER.message)}`;

export type TabMeta = {
  id: string;
  index: string;
  title: string;
  short: string;
  blurb: string;
  icon: (p: { className?: string }) => ReactNode;
};

/* ---------------------------------------------------------------- */

function SoundToggle({ compact = false }: { compact?: boolean }) {
  const [muted, setLocal] = useState(isMuted());
  useEffect(() => onMuteChange(setLocal) as unknown as () => void, []);
  return (
    <button
      type="button"
      onClick={() => {
        const next = toggleMuted();
        if (!next) play("tick");
      }}
      aria-pressed={!muted}
      title={muted ? "تشغيل أصوات المختبر" : "كتم أصوات المختبر"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors",
        muted
          ? "bg-forest-800/60 text-forest-300 ring-1 ring-inset ring-forest-700"
          : "bg-spark-400/20 text-spark-400 ring-1 ring-inset ring-spark-400/40",
      )}
    >
      {muted ? <IconSoundOff className="h-3.5 w-3.5" /> : <IconSoundOn className="h-3.5 w-3.5" />}
      <span className={compact ? "hidden" : "hidden sm:inline"}>{muted ? "الصوت مكتوم" : "أصوات المختبر"}</span>
    </button>
  );
}

function WaButton({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => play("spark")}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-full font-bold text-white transition-all duration-300",
        "bg-gradient-to-l from-[#0b7a45] via-[#1faa59] to-[#25d366] shadow-[0_10px_26px_-12px_rgba(37,211,102,0.9)] hover:shadow-[0_14px_30px_-10px_rgba(37,211,102,0.95)] active:scale-[0.97]",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-6 py-3.5 text-base",
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span
        className={cn(
          "relative grid place-items-center rounded-full bg-white/20 ring-1 ring-white/40",
          size === "sm" ? "h-6 w-6" : "h-10 w-10",
        )}
      >
        <IconWhatsApp className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"} />
      </span>
      <span className="relative flex flex-col items-start leading-tight">
        {size === "lg" && <span className="text-[11px] font-semibold text-white/80">تواصل مباشرة عبر واتساب</span>}
        <span dir="ltr" className="num tracking-wide">
          {ENGINEER.phoneDisplay}
        </span>
      </span>
    </a>
  );
}

/* ---------------------------------------------------------------- */

export function Header({
  tabs,
  active,
  onSelect,
  visited,
}: {
  tabs: TabMeta[];
  active: string;
  onSelect: (id: string) => void;
  visited: number;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 26);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const progress = Math.round((visited / tabs.length) * 100);

  return (
    <header className="sticky top-0 z-50">
      {/* engineer strip — always at the very top */}
      <div
        className={cn(
          "overflow-hidden bg-forest-950 text-forest-100 transition-all duration-500",
          scrolled ? "max-h-0 opacity-0" : "max-h-20 opacity-100",
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 sm:px-6">
          <p className="flex items-center gap-2 text-[11px] font-semibold sm:text-xs">
            <IconBolt className="h-3.5 w-3.5 text-spark-400" />
            إعداد وإشراف: <span className="text-spark-400">{ENGINEER.name}</span>
          </p>
          <WaButton />
        </div>
      </div>

      {/* brand + tabs */}
      <div
        className={cn(
          "border-b border-forest-200/70 bg-paper/85 backdrop-blur-xl transition-shadow duration-300",
          scrolled && "shadow-[0_10px_30px_-24px_rgba(6,46,39,0.9)]",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-forest-800 to-forest-600 text-spark-400 shadow-[0_10px_22px_-14px_rgba(6,46,39,1)]">
                <IconLab className="h-5 w-5" />
                <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-spark-400 anim-pulse-soft" />
              </span>
              <div className="leading-tight">
                <h1 className="text-sm font-bold text-forest-900 sm:text-base">مختبر الكهرباء الساكنة</h1>
                <p className="text-[10px] text-ink-500 sm:text-[11px]">
                  الوحدة الثانية · الدرس الأول · فيزياء الصف الثامن
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SoundToggle />
              {scrolled && (
                <div className="hidden sm:block">
                  <WaButton />
                </div>
              )}
              <div className="hidden items-center gap-2 rounded-full bg-forest-100 px-3 py-1.5 ring-1 ring-inset ring-forest-200 md:flex">
                <span className="text-[11px] font-bold text-forest-800">
                  زرت <span className="num">{visited}</span> من <span className="num">{tabs.length}</span> محطات
                </span>
                <span className="relative h-1.5 w-20 overflow-hidden rounded-full bg-forest-200">
                  <span
                    className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-forest-600 to-spark-400 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </span>
              </div>
            </div>
          </div>

          <nav aria-label="تبويبات الدرس" className="-mx-1 overflow-x-auto pb-2">
            <ul className="flex min-w-max items-center gap-1.5 px-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === active;
                return (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => {
                        play("tick");
                        onSelect(tab.id);
                      }}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition-all duration-300 sm:text-[13px]",
                        isActive
                          ? "bg-gradient-to-l from-forest-800 to-forest-600 text-white shadow-[0_12px_26px_-18px_rgba(6,46,39,1)]"
                          : "bg-white/70 text-ink-500 ring-1 ring-inset ring-forest-200/80 hover:bg-forest-50 hover:text-forest-700",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-spark-400" : "text-forest-500")} />
                      <span className="whitespace-nowrap">{tab.short}</span>
                      <span
                        className={cn(
                          "num rounded-md px-1 text-[10px]",
                          isActive ? "bg-white/15 text-white/90" : "bg-forest-100 text-forest-600",
                        )}
                      >
                        {tab.index}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- */

export function Footer({ tabs, onSelect }: { tabs: TabMeta[]; onSelect: (id: string) => void }) {
  return (
    <footer className="relative mt-16 overflow-hidden bg-forest-950 text-forest-100">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-forest-600/30 blur-3xl anim-float-slow" />
        <div className="absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-spark-500/15 blur-3xl anim-float" />
        <div className="absolute inset-0 grain opacity-[0.07] mix-blend-overlay" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* WhatsApp showcase card */}
        <div className="relative overflow-hidden rounded-[28px] border border-forest-700/70 bg-gradient-to-l from-forest-900 via-forest-800 to-forest-900 p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 grain opacity-[0.06]" />
          <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-right">
            <div className="flex items-center gap-4">
              <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-[#0b7a45] to-[#25d366] text-white shadow-[0_16px_36px_-16px_rgba(37,211,102,0.9)]">
                <IconWhatsApp className="h-8 w-8" />
                <span className="absolute inset-0 rounded-3xl ring-2 ring-[#25d366]/40 anim-pulse-soft" />
              </span>
              <div>
                <p className="text-xs font-semibold text-forest-300">للاستفسار والدعم العلمي</p>
                <p className="mt-1 text-xl font-bold text-white sm:text-2xl">{ENGINEER.name}</p>
                <p dir="ltr" className="num mt-1 text-lg font-bold tracking-widest text-spark-400">
                  {ENGINEER.phoneDisplay}
                </p>
              </div>
            </div>
            <WaButton size="lg" />
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-white">
              <IconLab className="h-4 w-4 text-spark-400" />
              عن هذا المختبر
            </h4>
            <p className="mt-3 text-[13px] leading-7 text-forest-300">
              مختبر تفاعلي يرافق الدرس الأول من الوحدة الثانية (الكهرباء الساكنة، صفحات الكتاب{" "}
              <span className="num">73–86</span>): محاكاة، تجارب منزلية حقيقية، وقانون كولوم خطوة بخطوة. نصوص الكتاب
              مُعلَّمة بوسم «من الكتاب»، وكل إضافة تعليمية مُعلَّمة بوسم «شرح المنصة» أو «إثراء علمي».
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">محطات المختبر</h4>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              {tabs.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(t.id)}
                    className="text-forest-300 transition-colors hover:text-spark-400"
                  >
                    {t.short}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">تنبيه المخبر</h4>
            <p className="mt-3 text-[13px] leading-7 text-forest-300">
              كل المحاكاة نماذج تعليمية مبسّطة: القيم مُقرَّبة لتوضيح الفكرة، ولا تُغني عن القياس المخبري الحقيقي. جرّب
              تجارب هذا الدرس بأدوات آمنة تماماً (مشط، بالون، ورق، ماء)، وابتعد كلياً عن مأخذ الكهرباء المنزلي.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-forest-800 pt-6 text-[11px] text-forest-400 sm:flex-row">
          <p>
            منصة الفيزياء التفاعلية · الصف الثامن · {ENGINEER.name} — <span className="num">{ENGINEER.phoneDisplay}</span>
          </p>
          <p>الخطوط: IBM Plex Sans Arabic · المعادلات: KaTeX</p>
        </div>
      </div>
    </footer>
  );
}