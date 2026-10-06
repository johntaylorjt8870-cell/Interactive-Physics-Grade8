/* Interactive layer for the textbook self-check («أختبر نفسي») on pages 61–62.
   The book markup in lesson-content.js stays verbatim source text; this module
   enhances it at render time on the student page only, following the Lesson Test
   interaction model: select, change freely, submit deliberately, and only then
   reveal correctness. Nothing here rewords, reorders, or answers the source. */

export const SELF_CHECK_LETTERS = Object.freeze(['a', 'b', 'c', 'd']);

const arabicOrdinals = Object.freeze(['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة']);

export function selfCheckKey(pageNumber, ordinal) {
  return `${pageNumber}-${ordinal}`;
}

/* Pure grading: no DOM, so it can be unit-tested directly. */
export function gradeSelfCheck(selections, answers) {
  return Object.keys(answers).map((key) => {
    const selected = selections[key] ?? null;
    const correct = answers[key]?.correct ?? null;
    return {
      key,
      selected,
      correct,
      isCorrect: selected !== null && selected === correct,
      isAnswered: selected !== null,
    };
  });
}

export function collectSelfCheckSelections(scope) {
  const selections = {};
  for (const input of scope.querySelectorAll('input[data-selfcheck-option]')) {
    if (!input.checked) continue;
    selections[input.dataset.selfcheckKey] = input.dataset.selfcheckOption;
  }
  return selections;
}

function letterSpan(letter) {
  return `<bdi class="selfcheck-letter" dir="ltr">${letter}</bdi>`;
}

function enhanceQuestionItem(item, key) {
  const optionList = item.querySelector('.option-list');
  if (!optionList) return false;
  const choices = [...optionList.children].filter((node) => node.tagName === 'LI');
  if (!choices.length) return false;
  choices.forEach((choice, index) => {
    const letter = SELF_CHECK_LETTERS[index];
    if (!letter) return;
    const inputId = `selfcheck-${key}-${letter}`;
    choice.classList.add('option-choice');
    choice.dataset.selfcheckChoice = letter;
    const copy = choice.innerHTML;
    choice.innerHTML = `<label class="option-label" for="${inputId}">
      <input class="option-input" id="${inputId}" type="radio" name="selfcheck-${key}" value="${letter}"
        data-selfcheck-option="${letter}" data-selfcheck-key="${key}" aria-label="الخيار ${letter}" />
      <span class="option-copy">${copy}</span>
    </label>`;
  });
  return true;
}

export function enhanceSelfCheckSections(scope, pageNumber) {
  const enhanced = [];
  for (const section of scope.querySelectorAll('.self-check-section')) {
    const items = [...section.querySelectorAll('.question-item')];
    let ordinal = 0;
    for (const item of items) {
      const key = selfCheckKey(pageNumber, ordinal + 1);
      if (enhanceQuestionItem(item, key)) {
        ordinal += 1;
        item.dataset.selfcheckItem = key;
      }
    }
    if (!ordinal) continue;
    section.dataset.selfcheckPage = String(pageNumber);
    const actions = scope.ownerDocument.createElement('div');
    actions.className = 'selfcheck-actions';
    actions.innerHTML = `<button class="selfcheck-submit" type="button" data-selfcheck-submit="${pageNumber}">تحقق من إجاباتي</button>
      <p class="selfcheck-note">اختر إجابة لكل فقرة ثم تحقق؛ يمكن تعديل الاختيار قبل التحقق، ولا تظهر النتيجة قبله.</p>`;
    const results = scope.ownerDocument.createElement('div');
    results.className = 'selfcheck-results';
    results.dataset.selfcheckResults = String(pageNumber);
    results.hidden = true;
    results.setAttribute('aria-live', 'polite');
    section.append(actions, results);
    enhanced.push(section);
  }
  return enhanced;
}

export function renderSelfCheckResults(results, graded, startNumber) {
  const correctCount = graded.filter((entry) => entry.isCorrect).length;
  const rows = graded.map((entry, index) => {
    const ordinalText = arabicOrdinals[startNumber + index - 1] ?? `رقم ${startNumber + index}`;
    const state = entry.isCorrect ? 'صحيحة' : 'غير صحيحة';
    const chosen = entry.isAnswered ? letterSpan(entry.selected) : '<span class="selfcheck-letter-missing">بلا اختيار</span>';
    const correction = entry.isCorrect ? '' : ` · الصحيحة: ${letterSpan(entry.correct)}`;
    return `<li class="selfcheck-result-row ${entry.isCorrect ? 'is-correct' : 'is-wrong'}">
      <span class="selfcheck-result-index">الفقرة ${ordinalText}</span>
      <span class="selfcheck-result-state">${state}</span>
      <span class="selfcheck-result-choice">اختيارك: ${chosen}${correction}</span>
    </li>`;
  }).join('');
  results.hidden = false;
  results.innerHTML = `<div class="selfcheck-result-card" role="group" aria-label="نتيجة التحقق من أسئلة الكتاب">
    <div class="selfcheck-result-head">
      <span class="selfcheck-result-kicker">نتيجة التحقق</span>
      <span class="selfcheck-result-score" dir="ltr">${correctCount}/${graded.length}</span>
    </div>
    <ul class="selfcheck-result-list">${rows}</ul>
    <p class="selfcheck-result-note">شرح المنصة: تصحيح آلي للاختيارات فقط؛ الحل المشروح في منطقة المعلم.</p>
  </div>`;
}

export function markSelfCheckOptions(scope, graded) {
  const byKey = new Map(graded.map((entry) => [entry.key, entry]));
  for (const item of scope.querySelectorAll('[data-selfcheck-item]')) {
    const entry = byKey.get(item.dataset.selfcheckItem);
    if (!entry) continue;
    for (const choice of item.querySelectorAll('.option-choice')) {
      choice.classList.remove('is-revealed-correct', 'is-revealed-wrong');
      if (choice.dataset.selfcheckChoice === entry.correct) choice.classList.add('is-revealed-correct');
      else if (choice.dataset.selfcheckChoice === entry.selected) choice.classList.add('is-revealed-wrong');
    }
  }
}
