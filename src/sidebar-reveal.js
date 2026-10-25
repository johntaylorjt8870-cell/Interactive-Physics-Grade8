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

/**
 * Height the step rail may occupy at its current place in the window.
 *
 * The rail is sticky at `top: 24px`, but at the top of the page it starts lower
 * (the 76px top bar plus the layout's 36px margin), so a rail bounded only by
 * `100vh - 48px` still ends 64px past the fold on a 1366×768 screen and the
 * curriculum key is cut. This measures the space the rail actually has from
 * where it currently sits, so the same rule works at every scroll position:
 * 632px before it sticks, 720px once it is pinned, with a 24px bottom gutter.
 *
 * The rail never sits above its sticky offset, so a smaller measured top (the
 * container pushing the rail up at the very end of a page) falls back to it.
 *
 * Like `revealScrollTop`, this is DOM-free: the caller passes the two numbers
 * it reads from the layout.
 *
 * @param {object} metrics
 * @param {number} metrics.viewportHeight current window inner height
 * @param {number} metrics.railTop        rail's current top, viewport px
 * @param {number} [metrics.gutter]       space kept below the rail (default 24)
 * @param {number} [metrics.stickyTop]    the rail's sticky offset (default 24)
 * @returns {number} available height in px, a finite non-negative integer, or
 *   `null` when the metrics are unusable and the caller should keep its fallback
 */
export function railMaxHeight({ viewportHeight, railTop, gutter = 24, stickyTop = 24 } = {}) {
  if (![viewportHeight, railTop, gutter, stickyTop].every((value) => typeof value === 'number' && Number.isFinite(value))) return null;
  if (viewportHeight <= 0 || gutter < 0) return null;
  const top = Math.min(Math.max(railTop, stickyTop), viewportHeight);
  return Math.max(0, Math.round(viewportHeight - top - gutter));
}
