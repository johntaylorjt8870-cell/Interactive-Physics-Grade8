const escapeAttribute = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

export function mathML(body, label, display = false) {
  const mode = display ? 'block' : 'inline';
  return `<math class="math-${mode}" dir="ltr" display="${mode}" aria-label="${escapeAttribute(label)}">${body}</math>`;
}

export function scalar(symbol, subscript = null) {
  const base = `<mi>${symbol}</mi>`;
  const body = subscript === null ? base : `<msub>${base}<mn>${subscript}</mn></msub>`;
  return mathML(body, subscript === null ? symbol : `${symbol} ${subscript}`);
}

export function vector(symbol, subscript = null) {
  const marked = `<mover accent="true"><mi>${symbol}</mi><mo stretchy="true">→</mo></mover>`;
  const body = subscript === null ? marked : `<msub>${marked}<mn>${subscript}</mn></msub>`;
  const label = subscript === null ? `vector ${symbol}` : `vector ${symbol} ${subscript}`;
  return mathML(body, label);
}

export function vectorPair(pair) {
  const letters = [...pair].map((letter) => `<mi>${letter}</mi>`).join('');
  return mathML(
    `<mover accent="true"><mrow>${letters}</mrow><mo stretchy="true">→</mo></mover>`,
    `vector ${[...pair].join(' ')}`,
  );
}

export function ltrText(text, label = text) {
  return `<bdi class="ltr-isolate" dir="ltr" aria-label="${escapeAttribute(label)}">${text}</bdi>`;
}

export function formula(body, label) {
  return mathML(body, label, true);
}

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
