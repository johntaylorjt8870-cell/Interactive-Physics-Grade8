const TYPE_SET = new Set([
  'single-choice',
  'true-false',
  'multiple-select',
  'numeric',
  'ordering',
  'matching',
  'error-analysis',
  'diagram-interpretation',
]);

const CHOICE_TYPES = new Set(['single-choice', 'true-false', 'error-analysis', 'diagram-interpretation']);
const UNIT_ALIASES = Object.freeze({
  N: ['n', 'newton', 'newtons', 'نيوتن', 'نيوتنات'],
  cm: ['cm', 'سم', 'سنتيمتر', 'سنتيمترات'],
});

export const DIFFICULTY_LEVELS = Object.freeze(['basic', 'medium', 'advanced', 'thinking']);
export const QUESTION_TYPES = Object.freeze([...TYPE_SET]);

export function createAssessmentState() {
  return {
    status: 'not-started',
    currentIndex: 0,
    answers: {},
    results: null,
  };
}

export function startAssessment(state) {
  if (state.status === 'submitted') return state;
  return { ...state, status: 'in-progress' };
}

export function questionById(questions, id) {
  return questions.find((question) => question.id === id) ?? null;
}

function cloneAnswer(answer) {
  if (Array.isArray(answer)) return [...answer];
  if (answer && typeof answer === 'object') return { ...answer };
  return answer;
}

function hasDraft(question, answer) {
  if (answer === null || answer === undefined) return false;
  switch (question.type) {
    case 'numeric':
      return String(answer).trim().length > 0;
    case 'multiple-select':
    case 'ordering':
      return Array.isArray(answer) && answer.some((value) => String(value).length > 0);
    case 'matching':
      return answer && typeof answer === 'object' && Object.values(answer).some((value) => String(value).length > 0);
    default:
      return typeof answer === 'string' && answer.length > 0;
  }
}

export function recordAnswer(state, question, answer) {
  if (state.status !== 'in-progress' || !question) return state;
  const answers = { ...state.answers };
  if (!hasDraft(question, answer)) delete answers[question.id];
  else answers[question.id] = cloneAnswer(answer);
  return { ...state, answers, results: null };
}

export function moveToQuestion(state, nextIndex, totalQuestions) {
  if (state.status !== 'in-progress' || !Number.isInteger(nextIndex) || totalQuestions < 1) return state;
  const currentIndex = Math.min(Math.max(nextIndex, 0), totalQuestions - 1);
  return { ...state, currentIndex };
}

export function questionIsAnswered(question, answer) {
  if (!question || !hasDraft(question, answer)) return false;
  switch (question.type) {
    case 'single-choice':
    case 'true-false':
    case 'error-analysis':
    case 'diagram-interpretation':
      return question.options.some((option) => option.id === answer);
    case 'multiple-select':
      return Array.isArray(answer)
        && answer.length > 0
        && new Set(answer).size === answer.length
        && answer.every((id) => question.options.some((option) => option.id === id));
    case 'numeric':
      return String(answer).trim().length > 0;
    case 'ordering':
      return Array.isArray(answer)
        && answer.length === question.items.length
        && new Set(answer).size === question.items.length
        && answer.every((id) => question.items.some((item) => item.id === id));
    case 'matching': {
      const selected = question.fields.map((field) => answer[field.id]);
      return question.fields.every((field) => typeof answer[field.id] === 'string' && answer[field.id].length > 0)
        && selected.every((id) => question.options.some((option) => option.id === id))
        && new Set(selected).size === selected.length;
    }
    default:
      return false;
  }
}

function normalizeDigits(text) {
  return String(text)
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

function unitAliasMatches(unit, alias) {
  return (UNIT_ALIASES[unit] ?? []).includes(alias.toLowerCase());
}

/** Parse a single numeric value or simple fraction; never evaluates expressions. */
export function parseNumericResponse(raw, expectedUnit = null) {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  let text = normalizeDigits(raw)
    .replaceAll('\u2212', '-')
    .replaceAll('\u066B', '.')
    .replaceAll('\u066C', '')
    .replaceAll('\u00A0', ' ')
    .trim();
  if (!text) return null;

  const suffix = text.match(/\s*(newtons?|نيوتن(?:ات)?|سنتيمتر(?:ات)?|N|cm|سم)\s*$/iu);
  if (suffix) {
    const providedUnit = suffix[1].toLowerCase();
    if (!expectedUnit || !unitAliasMatches(expectedUnit, providedUnit)) return null;
    text = text.slice(0, suffix.index).trim();
  }

  text = text.replaceAll(' ', '');
  const commaCount = [...text].filter((character) => character === ',').length;
  if (commaCount > 0) {
    if (text.includes('.')) {
      if (!/^[-+]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(text)) return null;
      text = text.replaceAll(',', '');
    } else if (/^[-+]?\d{1,3}(?:,\d{3})+$/.test(text)) {
      text = text.replaceAll(',', '');
    } else if (commaCount === 1) {
      text = text.replace(',', '.');
    } else {
      return null;
    }
  }

  const fraction = text.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\/([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
    return numerator / denominator;
  }

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function sameSet(first, second) {
  if (!Array.isArray(first) || !Array.isArray(second) || first.length !== second.length) return false;
  if (new Set(first).size !== first.length || new Set(second).size !== second.length) return false;
  const secondSet = new Set(second);
  return first.every((item) => secondSet.has(item));
}

function sameMapping(actual, expected, expectedKeys) {
  if (!actual || typeof actual !== 'object' || Array.isArray(actual)) return false;
  const actualKeys = Object.keys(actual);
  if (actualKeys.length !== expectedKeys.length || !expectedKeys.every((key) => actualKeys.includes(key))) return false;
  return expectedKeys.every((key) => actual[key] === expected[key]);
}

export function answerIsCorrect(question, answer, answerKey) {
  if (!questionIsAnswered(question, answer) || answerKey === undefined || answerKey === null) return false;
  if (CHOICE_TYPES.has(question.type)) return answer === answerKey;
  if (question.type === 'multiple-select') return sameSet(answer, answerKey);
  if (question.type === 'ordering') {
    return Array.isArray(answer)
      && Array.isArray(answerKey)
      && answer.length === answerKey.length
      && answer.every((value, index) => value === answerKey[index]);
  }
  if (question.type === 'matching') return sameMapping(answer, answerKey, question.fields.map((field) => field.id));
  if (question.type === 'numeric') {
    if (!answerKey || typeof answerKey !== 'object' || !Number.isFinite(answerKey.value)) return false;
    if (answerKey.unit !== (question.numericUnit ?? null)) return false;
    const value = parseNumericResponse(answer, answerKey.unit);
    return value !== null && Math.abs(value - answerKey.value) <= answerKey.tolerance;
  }
  return false;
}

export function validateAnswerKey(question, answerKey) {
  if (!question || !TYPE_SET.has(question.type) || !answerKey) return false;
  const optionIds = question.options?.map((option) => option.id) ?? [];
  if (CHOICE_TYPES.has(question.type)) return optionIds.includes(answerKey);
  if (question.type === 'multiple-select') {
    return Array.isArray(answerKey)
      && answerKey.length > 0
      && new Set(answerKey).size === answerKey.length
      && answerKey.every((id) => optionIds.includes(id));
  }
  if (question.type === 'numeric') {
    return typeof answerKey === 'object'
      && Number.isFinite(answerKey.value)
      && Number.isFinite(answerKey.tolerance)
      && answerKey.tolerance >= 0
      && answerKey.unit === (question.numericUnit ?? null);
  }
  if (question.type === 'ordering') {
    const itemIds = question.items?.map((item) => item.id) ?? [];
    return Array.isArray(answerKey) && answerKey.length === itemIds.length && sameSet(answerKey, itemIds);
  }
  if (question.type === 'matching') {
    const fieldIds = question.fields?.map((field) => field.id) ?? [];
    const targetIds = question.options?.map((option) => option.id) ?? [];
    return answerKey
      && typeof answerKey === 'object'
      && !Array.isArray(answerKey)
      && Object.keys(answerKey).length === fieldIds.length
      && fieldIds.every((id) => targetIds.includes(answerKey[id]))
      && new Set(Object.values(answerKey)).size === fieldIds.length;
  }
  return false;
}

export function submitAssessment(state, questions, answerKey) {
  if (state.status !== 'in-progress' || !Array.isArray(questions) || questions.length === 0 || !answerKey || typeof answerKey !== 'object') return state;
  const correctQuestionIds = questions
    .filter((question) => answerIsCorrect(question, state.answers[question.id], answerKey[question.id]))
    .map((question) => question.id);
  const correct = correctQuestionIds.length;
  const total = questions.length;
  const incorrect = total - correct;
  return {
    ...state,
    status: 'submitted',
    results: {
      total,
      correct,
      incorrect,
      percentage: Math.round((correct / total) * 100),
      correctQuestionIds,
    },
  };
}

export function restartAssessment() {
  return createAssessmentState();
}

export function canRevealResults(state) {
  return state.status === 'submitted' && state.results !== null;
}

export function canRevealSolutions(state) {
  return canRevealResults(state);
}
