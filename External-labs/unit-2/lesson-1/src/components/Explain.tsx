import { useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { TEq } from "@/lib/math";
import { IconBook, IconSparkle, IconShield, IconCheck } from "@/components/icons";
import { play } from "@/lib/sound";

export type ExplainPart = { label: string; body: ReactNode };

/** Reveal-on-demand answer used inside explanations and quick checks. */
export function Reveal({ question, answer, label = "أظهر الجواب" }: { question: ReactNode; answer: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-forest-200 bg-white/80 p-4">
      <p className="flex items-start gap-2 text-sm font-bold leading-7 text-forest-900">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-forest-100 text-[11px] text-forest-700">؟</span>
        {question}
      </p>
      {open ? (
        <div className="anim-rise mt-3 rounded-xl bg-forest-50 px-3 py-2.5 text-sm leading-7 text-ink-700">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-forest-700">
            <IconCheck className="h-3.5 w-3.5" /> الجواب
          </span>
          {answer}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            play("tick");
          }}
          className="mt-3 rounded-xl bg-forest-800 px-3 py-1.5 text-xs font-bold text-forest-50 transition-colors hover:bg-forest-700"
        >
          {label}
        </button>
      )}
    </div>
  );
}

/**
 * The deep-teaching block: every idea of the lesson gets a layered explanation
 * (simple idea → atomic level → steps → life example → common mistake → check).
 */
export function DeepExplain({
  kicker = "شرح مستفيض",
  title,
  intro,
  parts,
  formula,
  formulaNote,
  life,
  misconception,
  check,
  tone = "light",
  className,
}: {
  kicker?: string;
  title: ReactNode;
  intro: ReactNode;
  parts: ExplainPart[];
  formula?: string;
  formulaNote?: ReactNode;
  life?: ReactNode;
  misconception?: ReactNode;
  check?: { q: ReactNode; a: ReactNode };
  tone?: "light" | "tinted";
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-3xl border border-forest-200/80 panel-shadow",
        tone === "tinted" ? "bg-gradient-to-br from-forest-50 via-white to-paper-warm" : "bg-surface/92",
        className,
      )}
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-forest-200/40 blur-3xl" />

      <header className="relative border-b border-forest-100 px-5 py-4 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-800 px-2.5 py-1 text-[11px] font-bold text-forest-50">
          <IconBook className="h-3.5 w-3.5 text-spark-400" />
          {kicker}
        </span>
        <h3 className="mt-2.5 text-lg font-bold leading-8 text-forest-950 sm:text-xl">{title}</h3>
        <p className="mt-2 max-w-3xl text-[15px] leading-8 text-ink-700">{intro}</p>
      </header>

      <div className="relative px-5 py-5 sm:px-6">
        <ol className="relative space-y-5 border-s-2 border-dashed border-forest-200 ps-6">
          {parts.map((p, i) => (
            <li key={p.label} className="relative">
              <span className="absolute -start-[35px] top-0 grid h-7 w-7 place-items-center rounded-xl bg-gradient-to-br from-forest-700 to-forest-500 text-[11px] font-bold text-white shadow-[0_8px_18px_-10px_rgba(6,46,39,1)]">
                <span className="num">{i + 1}</span>
              </span>
              <h4 className="text-[13px] font-bold text-forest-700">{p.label}</h4>
              <div className="mt-1 text-sm leading-8 text-ink-700">{p.body}</div>
            </li>
          ))}
        </ol>

        {formula && (
          <div className="mt-5 rounded-2xl bg-forest-950 px-4 py-3">
            <TEq e={formula} label={typeof title === "string" ? title : "المعادلة"} className="text-white" />
            {formulaNote && <p className="mt-1 text-center text-xs leading-6 text-forest-300">{formulaNote}</p>}
          </div>
        )}

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {life && (
            <div className="rounded-2xl border-s-4 border border-spark-200 bg-spark-50 px-4 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-spark-600">
                <IconSparkle className="h-3.5 w-3.5" /> من الحياة اليومية
              </p>
              <div className="text-sm leading-8 text-ink-700">{life}</div>
            </div>
          )}
          {misconception && (
            <div className="rounded-2xl border-s-4 border border-berry-500/40 bg-berry-100/60 px-4 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-berry-600">
                <IconShield className="h-3.5 w-3.5" /> خطأ شائع — احترس
              </p>
              <div className="text-sm leading-8 text-ink-700">{misconception}</div>
            </div>
          )}
        </div>

        {check && (
          <div className="mt-4">
            <Reveal question={check.q} answer={check.a} />
          </div>
        )}
      </div>
    </article>
  );
}