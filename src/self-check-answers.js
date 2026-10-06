/* Answer key for the textbook self-check («أختبر نفسي») on pages 61–62.
   Keys are `${textbookPage}-${ordinal of the question item on that page}`.
   The letters refer to the textbook's own a/b/c/d option ordering, which the
   student page preserves verbatim. Like the Lesson Test key, this module is
   imported only at submission time so no correctness signal exists before it. */
export const SELF_CHECK_ANSWERS = Object.freeze({
  '61-1': Object.freeze({ correct: 'd' }), // حادتان مختلفتان شدة ⇒ متوازي أضلاع
  '61-2': Object.freeze({ correct: 'b' }), // متعامدتان مختلفتان شدة ⇒ مستطيل
  '62-1': Object.freeze({ correct: 'a' }), // متعامدتان متساويتان شدة ⇒ مربع
  '62-2': Object.freeze({ correct: 'b' }), // 12 N و16 N ⇒ F = 20 N
  '62-3': Object.freeze({ correct: 'b' }), // 50 N و40 N ⇒ F₂ = 30 N
  '62-4': Object.freeze({ correct: 'c' }), // علاقة فيثاغورث للجذر
});

export function selfCheckAnswer(key) {
  return SELF_CHECK_ANSWERS[key] ?? null;
}
