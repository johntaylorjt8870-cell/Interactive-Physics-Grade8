/* The platform's mathematical rendering layer.
 *
 * Every formula, symbol, vector, fraction, exponent, and unit in the product is
 * rendered through KaTeX (self-hosted in vendor/katex, no CDN). KaTeX produces
 * professionally typeset math with real fractions, stretched radicals, accents
 * above the correct letter, and true sub/superscripts — the same output on
 * every browser.
 *
 * RTL isolation is structural, not cosmetic:
 *   - every rendered expression is wrapped in dir="ltr" + unicode-bidi isolate,
 *     so surrounding Arabic prose can never reorder operators, digits, or units;
 *   - numbers with units are composed *inside* one TeX expression (e.g. 100 N),
 *     so a unit can never be detached from its value by the bidi algorithm;
 *   - vectors are TeX accents (\vec{F}_1): the arrow sits over the F and the
 *     subscript belongs to the same symbol — no RTL text tricks involved.
 */

import katex from '../vendor/katex/katex.mjs';

const KATEX_OPTIONS = Object.freeze({
  throwOnError: true,
  strict: 'ignore',
  output: 'htmlAndMathml',
  maxSize: 12,
});

const escapeAttribute = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function renderKatex(source, display) {
  return katex.renderToString(source, { ...KATEX_OPTIONS, displayMode: display });
}

/** Inline LTR-isolated math. `label` is the spoken/accessible reading. */
export function tex(source, label = source) {
  return `<span class="math math-inline" dir="ltr" role="math" aria-label="${escapeAttribute(label)}">${renderKatex(source, false)}</span>`;
}

/** Display equation on its own line — the home of every real calculation. */
export function formula(source, label = source) {
  return `<div class="math math-display equation" dir="ltr" role="math" aria-label="${escapeAttribute(label)}">${renderKatex(source, true)}</div>`;
}

/** A short aligned chain such as  F = 5 × 20 = 100 N  — always one horizontal flow. */
export function calculation(source, label = source) {
  return formula(source, label);
}

/** Multi-line aligned derivation; each entry is one TeX line, aligned at '&'. */
export function alignedSteps(lines, label) {
  const source = `\\begin{aligned}${lines.map((line) => ` ${line} \\\\`).join('')}&\\end{aligned}`;
  return formula(source, label ?? lines.join(' ; '));
}

/* --- semantic symbol helpers ------------------------------------------------ */

const vectorLabel = (symbol, subscript) => (subscript === null || subscript === undefined
  ? `vector ${symbol}`
  : `vector ${symbol} subscript ${subscript}`);

/** A vector symbol: arrow accent above the letter itself, subscript attached. */
export function vector(symbol, subscript = null) {
  const source = subscript === null || subscript === undefined
    ? `\\vec{${symbol}}`
    : `\\vec{${symbol}}_{${subscript}}`;
  return tex(source, vectorLabel(symbol, subscript));
}

/** Vector over a multi-letter name such as OM, OX, OY. */
export function vectorPair(pair) {
  const letters = [...pair].map((letter) => letter).join('');
  return tex(`\\vec{\\mathrm{${letters}}}`, `vector ${[...pair].join(' ')}`);
}

/** A scalar (magnitude) symbol, optionally with subscript: F, F₁, F₂ … */
export function scalar(symbol, subscript = null) {
  const source = subscript === null || subscript === undefined ? symbol : `${symbol}_{${subscript}}`;
  return tex(source, subscript === null || subscript === undefined ? symbol : `${symbol} subscript ${subscript}`);
}

/** A geometric point name (O, M, X, Y) typeset as a math variable. */
export function point(letter) {
  return tex(letter, `point ${letter}`);
}

/** Upright unit token to append after a rendered value, e.g. unit('N'). */
export function unit(symbol) {
  return tex(`\\mathrm{${symbol}}`, symbol);
}

/** Number + unit locked inside a single LTR expression: 5 kg, 100 N, 25 °C. */
export function qty(value, unitSymbol = null) {
  const source = unitSymbol === null ? String(value) : `${value}~\\mathrm{${unitSymbol}}`;
  return tex(source, unitSymbol === null ? String(value) : `${value} ${unitSymbol}`);
}

/** An angle in degrees inside math: 60°. */
export function degrees(value) {
  return tex(`${value}^{\\circ}`, `${value}°`);
}

/** A real typeset fraction, numerator over denominator. */
export function fraction(numerator, denominator, label) {
  return tex(`\\dfrac{${numerator}}{${denominator}}`, label ?? `${numerator} over ${denominator}`);
}

/** Non-math LTR isolation (page ranges, scale statements like 1 cm = 1 N). */
export function ltrText(text, label = text) {
  return `<bdi class="ltr-isolate" dir="ltr" aria-label="${escapeAttribute(label)}">${text}</bdi>`;
}

/* --- structured, platform-rendered solution -------------------------------- */

/* A worked solution is never a wall of Arabic with inline math. It is a labeled
   sequence: givens, required, law, substitution, arithmetic, unit, check. */
export function solutionSteps(rows) {
  const items = rows.map((row) => `<li class="solution-row solution-${row.kind}">
    <span class="solution-label">${row.label}</span>
    <div class="solution-body">${row.html}</div>
  </li>`).join('');
  return `<ol class="solution-steps" role="list">${items}</ol>`;
}

/* --- the lesson's fixed symbol vocabulary ---------------------------------- */

export const V_F1 = vector('F', '1');
export const V_F2 = vector('F', '2');
export const V_F3 = vector('F', '3');
export const V_F = vector('F');
export const V_W = vector('w');
export const V_R = vector('R');
export const V_OM = vectorPair('OM');
export const V_OX = vectorPair('OX');
export const V_OY = vectorPair('OY');
export const S_F1 = scalar('F', '1');
export const S_F2 = scalar('F', '2');
export const S_F3 = scalar('F', '3');
export const S_F = scalar('F');
export const P_O = point('O');
export const P_M = point('M');
export const P_X = point('X');
export const P_Y = point('Y');
export const LATIN_A = tex('a', 'Latin lowercase a');

/* Frequently reused relations (single sources of truth for exact TeX). */
export const PYTHAGORAS_TEX = 'F=\\sqrt{F_{1}^{2}+F_{2}^{2}}';
export const PYTHAGORAS_LABEL = 'F = √(F₁² + F₂²)';
