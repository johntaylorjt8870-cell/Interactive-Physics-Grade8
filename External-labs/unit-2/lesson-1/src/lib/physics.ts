/** Pure physics helpers for the static-electricity lab. */

export const E_CHARGE = 1.6e-19; // C — مقدار شحنة الإلكترون
export const K_COULOMB = 9e9; // N·m²/C² — ثابت كولوم في الهواء

/** Coulomb force in newtons. Charges in nanocoulombs, distance in centimetres. */
export function coulombForce(q1nC: number, q2nC: number, dCm: number, epsilonR = 1): number {
  const q1 = q1nC * 1e-9;
  const q2 = q2nC * 1e-9;
  const d = Math.max(0.5, dCm) / 100;
  return (K_COULOMB * Math.abs(q1 * q2)) / (epsilonR * d * d);
}

/** How many electrons correspond to a charge (in coulombs). */
export function electronsFor(qC: number): number {
  return Math.abs(qC) / E_CHARGE;
}

/** Charge (C) carried by n electrons. */
export function chargeOf(n: number): number {
  return n * E_CHARGE;
}

export type Tribo = {
  id: string;
  name: string;
  rank: number;
  hint: string;
};

/** Triboelectric ladder: the higher the rank, the more the material gives electrons away. */
export const TRIBO: Tribo[] = [
  { id: "skin", name: "يد الإنسان", rank: 10, hint: "تمنح الإلكترونات بسهولة" },
  { id: "fur", name: "الفرو", rank: 9, hint: "من أشهر ما يُدلك به الإيبونيت" },
  { id: "glass", name: "الزجاج", rank: 8, hint: "يُشحن موجباً عند دلكه بالحرير" },
  { id: "hair", name: "الشعر الجاف", rank: 7, hint: "يقف عند اقتراب البالون" },
  { id: "nylon", name: "النايلون", rank: 6, hint: "ألياف ثياب تلسع في الشتاء" },
  { id: "wool", name: "الصوف", rank: 5, hint: "مدلك الكتاب مع الإيبونيت" },
  { id: "silk", name: "الحرير", rank: 4, hint: "مدلك الزجاج في الكتاب" },
  { id: "paper", name: "الورق", rank: 3, hint: "قصاصات الورق تنجذب بسهولة" },
  { id: "cotton", name: "القطن", rank: 2, hint: "شبه متعادل مع الورق" },
  { id: "wood", name: "الخشب", rank: 1, hint: "تكهربه ضعيف" },
  { id: "rubber", name: "المطاط (بالون)", rank: -3, hint: "يكتسب الإلكترونات" },
  { id: "plastic", name: "مشط بلاستيكي", rank: -5, hint: "يُشحن سالباً بالدلك مع الشعر" },
  { id: "pvc", name: "أنبوب PVC", rank: -6, hint: "قوي في اكتساب الإلكترونات" },
  { id: "teflon", name: "التفلون", rank: -8, hint: "أقوى ما يكتسب الإلكترونات" },
];

/** Charge magnitude (nC) produced by rubbing two materials a number of strokes. */
export function rubCharge(rankA: number, rankB: number, strokes: number): number {
  const gap = Math.abs(rankA - rankB);
  return Number((strokes * gap * 0.04).toFixed(2));
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** Arabic-friendly signed label. */
export function chargeWord(q: number): string {
  if (q > 0) return "موجبة";
  if (q < 0) return "سالبة";
  return "متعادلة";
}