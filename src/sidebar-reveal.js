/**
 * Scroll position for the Lesson 1 step rail.
 *
 * The rail (`.lesson-sidebar`) is a sticky flex column. On a 1366×768 laptop it
 * is taller than the space a sticky element has, so the rail is height-bound and
 * only its step list (`#page-nav`) scrolls. When the reader moves to a step that
 * sits outside that list's scrollport, the list has to follow — the window must
 * not, because the lesson already scrolls the window back to the step heading on
 * every change.
 *
 * This function is deliberately DOM-free: it takes the numbers a caller reads
 * from the live layout and returns the `scrollTop` to apply, so the rule
 * (reveal only when needed, centre the step, clamp to the list) can be tested
 * with `node --test` without a browser.
 *
 * @param {object} metrics
 * @param {number} metrics.scrollTop    current `#page-nav` scroll offset
 * @param {number} metrics.scrollHeight full scroll height of `#page-nav`
 * @param {number} metrics.clientHeight visible height of `#page-nav`
 * @param {number} metrics.listTop      top of the list's scrollport, viewport px
 * @param {number} metrics.listBottom   bottom of the list's scrollport, viewport px
 * @param {number} metrics.itemTop      top of the active step, viewport px
 * @param {number} metrics.itemBottom   bottom of the active step, viewport px
 * @returns {number} the `scrollTop` to apply, always a finite, non-negative number
 */
export function revealScrollTop({
  scrollTop = 0,
  scrollHeight,
  clientHeight,
  listTop,
  listBottom,
  itemTop,
  itemBottom,
} = {}) {
  const numbers = [scrollTop, scrollHeight, clientHeight, listTop, listBottom, itemTop, itemBottom];
  if (!numbers.every((value) => typeof value === 'number' && Number.isFinite(value))) return 0;

  const maxScroll = scrollHeight - clientHeight;
  // The list already shows every step: there is nothing to scroll, and leaving a
  // stale offset behind would only hide the top of the list.
  if (!(maxScroll > 1)) return 0;

  const current = Math.min(Math.max(scrollTop, 0), maxScroll);
  const stepHeight = itemBottom - itemTop;
  const boxHeight = listBottom - listTop;
  if (!(stepHeight > 0) || !(boxHeight > 0)) return 0;

  // Tolerance for sub-pixel layout: a step that already fits is left alone, so
  // re-rendering a step does not nudge the list under the reader's pointer.
  const fits = itemTop >= listTop - 0.5 && itemBottom <= listBottom + 0.5;
  if (fits) return current;

  const centred = current + (itemTop - listTop) - (boxHeight - stepHeight) / 2;
  return Math.min(Math.max(Math.round(centred), 0), maxScroll);
}
