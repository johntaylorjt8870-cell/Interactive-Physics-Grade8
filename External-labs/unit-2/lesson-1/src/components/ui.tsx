import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { play } from "@/lib/sound";

/* ------------------------------------------------------------------ */
/* persistence                                                         */
/* ------------------------------------------------------------------ */

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage may be unavailable — state still works in memory */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

/* ------------------------------------------------------------------ */
/* source labelling (book vs platform)                                 */
/* ------------------------------------------------------------------ */

const TAGS = {
  book: { text: "من الكتاب", cls: "bg-forest-800 text-forest-100 ring-forest-700" },
  platform: { text: "شرح المنصة", cls: "bg-forest-100 text-forest-800 ring-forest-200" },
  enrich: { text: "إثراء علمي من المنصة", cls: "bg-spark-50 text-spark-600 ring-spark-200" },
  model: { text: "نموذج تعليمي مبسّط", cls: "bg-white text-ink-500 ring-ink-300/60" },
} as const;

export function SourceTag({ kind, page, className }: { kind: keyof typeof TAGS; page?: number; className?: string }) {
  const tag = TAGS[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        tag.cls,
        className,
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {tag.text}
      {page ? (
        <>
          <span className="opacity-50">·</span>
          <span>
            ص<span className="num"> {page}</span>
          </span>
        </>
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "relative rounded-3xl border border-forest-200/70 bg-surface/90 p-5 backdrop-blur-sm panel-shadow sm:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Panel({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  tone = "light",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: "light" | "deep";
}) {
  const deep = tone === "deep";
  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border panel-shadow",
        deep ? "border-forest-800 bg-forest-900 text-forest-100" : "border-forest-200/70 bg-surface/90",
        className,
      )}
    >
      <header
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4",
          deep
            ? "border-forest-800 bg-gradient-to-l from-forest-800/70 via-forest-900 to-forest-900"
            : "border-forest-100 bg-gradient-to-l from-forest-50 via-white to-white",
        )}
      >
        <div className="flex items-center gap-3">
          {icon ? (
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-2xl ring-1",
                deep ? "bg-forest-800 text-spark-400 ring-forest-700" : "bg-forest-100 text-forest-700 ring-forest-200",
              )}
            >
              {icon}
            </span>
          ) : null}
          <div>
            <h3 className={cn("text-base font-bold sm:text-lg", deep ? "text-white" : "text-forest-900")}>{title}</h3>
            {subtitle ? (
              <p className={cn("mt-0.5 text-xs sm:text-sm", deep ? "text-forest-300" : "text-ink-500")}>{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

const CALLOUT_TONES = {
  info: "border-lagoon-300/60 bg-lagoon-500/8 text-lagoon-600",
  success: "border-forest-300 bg-forest-100/70 text-forest-800",
  warn: "border-spark-200 bg-spark-50 text-spark-600",
  danger: "border-berry-500/40 bg-berry-100/70 text-berry-600",
} as const;

export function Callout({
  tone = "info",
  title,
  icon,
  children,
  className,
}: {
  tone?: keyof typeof CALLOUT_TONES;
  title?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border-s-4 border px-4 py-3", CALLOUT_TONES[tone], className)}>
      {title ? (
        <p className="mb-1 flex items-center gap-2 text-sm font-bold">
          {icon}
          {title}
        </p>
      ) : null}
      <div className="text-sm leading-7 text-ink-700">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* controls                                                            */
/* ------------------------------------------------------------------ */

const BTN_VARIANTS = {
  primary:
    "bg-gradient-to-l from-forest-700 to-forest-500 text-white shadow-[0_10px_24px_-14px_rgba(6,46,39,0.9)] hover:from-forest-800 hover:to-forest-600",
  soft: "bg-forest-100 text-forest-800 ring-1 ring-inset ring-forest-200 hover:bg-forest-200/80",
  ghost: "bg-white/70 text-ink-700 ring-1 ring-inset ring-forest-200 hover:bg-forest-50",
  spark: "bg-gradient-to-l from-spark-600 to-spark-400 text-forest-950 hover:brightness-105",
  danger: "bg-berry-100 text-berry-600 ring-1 ring-inset ring-berry-500/30 hover:bg-berry-100/70",
} as const;

export function Btn({
  children,
  onClick,
  variant = "soft",
  className,
  disabled,
  title,
  type = "button",
  sound = "tick",
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: keyof typeof BTN_VARIANTS;
  className?: string;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit";
  sound?: "tick" | "spark" | "whoosh" | "transfer" | "correct" | "wrong" | "none";
  active?: boolean;
}) {
  const handle = useCallback(() => {
    if (disabled) return;
    if (sound !== "none") play(sound);
    onClick?.();
  }, [disabled, onClick, sound]);

  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={handle}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45",
        BTN_VARIANTS[variant],
        active && "ring-2 ring-forest-500 ring-offset-1 ring-offset-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  valueTex,
  hint,
  tone = "forest",
  disabled,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  valueTex?: ReactNode;
  hint?: ReactNode;
  tone?: "forest" | "spark" | "lagoon" | "berry";
  disabled?: boolean;
}) {
  const accent = {
    forest: "[&::-webkit-slider-thumb]:bg-forest-600 [&::-moz-range-thumb]:bg-forest-600",
    spark: "[&::-webkit-slider-thumb]:bg-spark-500 [&::-moz-range-thumb]:bg-spark-500",
    lagoon: "[&::-webkit-slider-thumb]:bg-lagoon-500 [&::-moz-range-thumb]:bg-lagoon-500",
    berry: "[&::-webkit-slider-thumb]:bg-berry-500 [&::-moz-range-thumb]:bg-berry-500",
  }[tone];

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <label className={cn("block select-none", disabled && "opacity-50")}>
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink-700">{label}</span>
        {valueTex ? <span className="text-sm font-bold text-forest-800">{valueTex}</span> : null}
      </span>
      <input
        dir="ltr"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={typeof label === "string" ? label : undefined}
        onChange={(ev) => onChange(Number(ev.target.value))}
        style={{ background: `linear-gradient(90deg, var(--color-forest-400) ${pct}%, var(--color-forest-100) ${pct}%)` }}
        className={cn(
          "mt-2 h-2.5 w-full cursor-pointer appearance-none rounded-full outline-none",
          "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_-1px_rgba(6,46,39,0.5)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110",
          "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white",
          accent,
        )}
      />
      {hint ? <span className="mt-1 block text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
}: {
  options: { value: T; label: ReactNode; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  label?: ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <div>
      {label ? <p className="mb-2 text-sm font-semibold text-ink-700">{label}</p> : null}
      <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-forest-100/70 p-1 ring-1 ring-inset ring-forest-200">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            title={opt.hint}
            onClick={() => {
              play("tick");
              onChange(opt.value);
            }}
            className={cn(
              "rounded-xl font-semibold transition-all duration-200",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              value === opt.value
                ? "bg-white text-forest-800 shadow-[0_6px_16px_-10px_rgba(6,46,39,0.9)] ring-1 ring-forest-200"
                : "text-ink-500 hover:text-forest-700",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  tone = "forest",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: "forest" | "spark" | "lagoon" | "berry" | "neutral";
  className?: string;
}) {
  const tones = {
    forest: "border-forest-200 bg-forest-50 text-forest-800",
    spark: "border-spark-200 bg-spark-50 text-spark-600",
    lagoon: "border-lagoon-300/50 bg-lagoon-500/8 text-lagoon-600",
    berry: "border-berry-500/30 bg-berry-100/60 text-berry-600",
    neutral: "border-ink-300/40 bg-white text-ink-700",
  }[tone];
  return (
    <div className={cn("rounded-2xl border px-3 py-2.5", tones, className)}>
      <p className="text-[11px] font-semibold opacity-80">{label}</p>
      <div className="mt-1 text-base font-bold leading-tight">{value}</div>
    </div>
  );
}

export function Divider({ label }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-forest-200 to-transparent" />
      {label ? <span className="text-xs font-bold text-ink-500">{label}</span> : null}
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-forest-200 to-transparent" />
    </div>
  );
}