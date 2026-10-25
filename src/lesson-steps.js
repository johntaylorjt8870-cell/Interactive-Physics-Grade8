/**
 * Step model for the textbook-page lessons.
 *
 * A lesson that covers several textbook pages is taught one page at a time: the
 * lesson's content module exports one entry per book page, and the student page
 * shows only the active entry, with «السابق» / «التالي» and a progress bar.
 * Lessons 1 and 2 of Unit 2 and Lesson 3 (potential difference) use this model;
 * Lesson 3 previously rendered every page at once, which turned the lesson into
 * a single long article instead of a step-by-step lesson.
 *
 * This module is deliberately DOM-free so the navigation contract can be tested
 * with `node --test` (no browser, no jsdom) and reused by any lesson bootstrap.
 */

const clampIndex = (index, total) => Math.min(Math.max(Number.isInteger(index) ? index : 0, 0), total - 1);

export class LessonStepper {
  #pages;
  #index;

  constructor(pages, startIndex = 0) {
    if (!Array.isArray(pages) || pages.length === 0) {
      throw new TypeError('LessonStepper needs at least one study step.');
    }
    this.#pages = pages;
    this.#index = clampIndex(startIndex, pages.length);
  }

  get pages() {
    return this.#pages;
  }

  get index() {
    return this.#index;
  }

  get total() {
    return this.#pages.length;
  }

  /** The active step: one textbook page, with its heading, blocks and nav label. */
  get page() {
    return this.#pages[this.#index];
  }

  get position() {
    return this.#index + 1;
  }

  get isFirst() {
    return this.#index === 0;
  }

  get isLast() {
    return this.#index === this.#pages.length - 1;
  }

  get previousPage() {
    return this.#pages[this.#index - 1] ?? null;
  }

  get nextPage() {
    return this.#pages[this.#index + 1] ?? null;
  }

  /** Ready-to-render progress values; `current` is 1-based like the printed counter. */
  get progress() {
    return {
      current: this.position,
      total: this.total,
      percent: Math.round((this.position / this.total) * 100),
    };
  }

  /** Moves to an explicit step. Returns true when the active step actually changed. */
  goTo(index) {
    const bounded = clampIndex(index, this.total);
    if (bounded === this.#index) return false;
    this.#index = bounded;
    return true;
  }

  next() {
    return this.goTo(this.#index + 1);
  }

  previous() {
    return this.goTo(this.#index - 1);
  }

  /** Label for the «السابق» / «التالي» button of one direction. */
  labelFor(direction) {
    if (direction === 'previous') return this.previousPage?.navLabel ?? 'بداية الدرس';
    if (direction === 'next') return this.nextPage?.navLabel ?? 'نهاية الدرس';
    throw new RangeError(`Unknown step direction: ${direction}`);
  }
}

/**
 * Structural audit used by the test suite so a new lesson cannot be published as
 * one long scroll again: every textbook page needs its own step, every step needs
 * a heading, a navigation label and real book content, and the steps must follow
 * the book order without gaps or repeats.
 *
 * Returns `{ ok, problems }` instead of throwing so the caller can report all
 * problems at once.
 */
export function auditLessonSteps(pages, { sourcePages = [] } = {}) {
  const problems = [];
  if (!Array.isArray(pages) || pages.length === 0) {
    return { ok: false, problems: ['the lesson defines no study steps'] };
  }
  const numbers = pages.map((page) => page?.page);
  pages.forEach((page, index) => {
    const label = `step ${index + 1}`;
    if (!Number.isInteger(page?.page)) problems.push(`${label} has no textbook page number`);
    if (typeof page?.heading !== 'string' || page.heading.trim().length < 4) problems.push(`${label} has no clear heading`);
    if (typeof page?.navLabel !== 'string' || page.navLabel.trim().length < 2) problems.push(`${label} has no navigation label`);
    const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
    if (!blocks.some((block) => block?.type === 'book')) problems.push(`${label} carries no textbook content`);
  });
  numbers.forEach((number, index) => {
    if (index > 0 && !(number > numbers[index - 1])) problems.push(`step ${index + 1} breaks the textbook page order`);
  });
  if (new Set(numbers).size !== numbers.length) problems.push('two steps claim the same textbook page');
  if (sourcePages.length > 0) {
    if (pages.length !== sourcePages.length) {
      problems.push(`the lesson has ${pages.length} steps for ${sourcePages.length} textbook pages`);
    }
    const mismatch = sourcePages.findIndex((number, index) => numbers[index] !== number);
    if (mismatch >= 0) problems.push(`step ${mismatch + 1} does not match textbook page ${sourcePages[mismatch]}`);
  }
  return { ok: problems.length === 0, problems };
}
