import katex from "katex";
import { useMemo } from "react";
import { cn } from "@/utils/cn";

/** Render a TeX source to HTML. Math is always an LTR island inside the RTL page. */
export function renderTex(source: string, display = false): string {
  try {
    return katex.renderToString(source, {
      displayMode: display,
      throwOnError: false,
      output: "html",
      strict: false,
      trust: false,
    });
  } catch {
    return `<span dir="ltr">${source}</span>`;
  }
}

type TexProps = {
  /** TeX source, always read left-to-right. */
  e: string;
  /** Arabic description used as the accessible label. */
  label?: string;
  className?: string;
};

/** Inline math island. */
export function T({ e, label, className }: TexProps) {
  const html = useMemo(() => renderTex(e, false), [e]);
  return (
    <bdi
      dir="ltr"
      className={cn("inline-block align-middle", className)}
      role={label ? "math" : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Display math island (own line, centred LTR block). */
export function TEq({ e, label, className }: TexProps) {
  const html = useMemo(() => renderTex(e, true), [e]);
  return (
    <div dir="ltr" className={cn("overflow-x-auto py-1 text-center", className)}>
      <span role={label ? "math" : undefined} aria-label={label} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/** A value with its unit, e.g. 12 nC — never rendered as "nC 12". */
export function Q({ v, u, label }: { v: string | number; u: string; label?: string }) {
  const src = `${v}\\;\\mathrm{${u}}`;
  return <T e={src} label={label ?? `${v} ${u}`} />;
}

/** Plain number formatted for KaTeX (no trailing zeros, thin thousands). */
export function num(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "\\text{—}";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e5 || abs < 1e-3) {
    return sci(value, digits);
  }
  const rounded = Number(value.toFixed(digits));
  return String(rounded);
}

/** Scientific notation as TeX: 9 \times 10^{9} */
export function sci(value: number, digits = 2): string {
  if (value === 0) return "0";
  if (!Number.isFinite(value)) return "\\text{—}";
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const mant = value / 10 ** exp;
  const m = Number(mant.toFixed(digits));
  if (m === 1) return `10^{${exp}}`;
  return `${m} \\times 10^{${exp}}`;
}

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

/** Scientific notation as plain unicode text (for SVG <text>, aria-labels, exports). */
export function plainSci(value: number, digits = 2): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const mant = Number((value / 10 ** exp).toFixed(digits));
  const sup = String(exp)
    .split("")
    .map((ch) => SUPERSCRIPT[ch] ?? ch)
    .join("");
  if (exp >= -2 && exp <= 3) return String(Number(value.toFixed(digits + 1)));
  return `${mant}×10${sup}`;
}

/** Signed charge label used in diagrams and readouts. */
export function signTex(value: number): "+" | "-" | "0" {
  if (value > 0) return "+";
  if (value < 0) return "-";
  return "0";
}