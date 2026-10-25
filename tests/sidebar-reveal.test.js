import test from 'node:test';
import assert from 'node:assert/strict';
import { revealScrollTop } from '../src/sidebar-reveal.js';

/**
 * The rail on a 1366×768 laptop: the list scrollport is 377px tall for 444px of
 * steps, and the eight buttons are 53–71px each.
 */
const laptop = (overrides = {}) => ({
  scrollTop: 0,
  scrollHeight: 444,
  clientHeight: 377,
  listTop: 269,
  listBottom: 646,
  itemTop: 269,
  itemBottom: 322,
  ...overrides,
});

test('a list that already shows every step is left at the top', () => {
  // 1440×900 and 1920×1080: the rail is not height-bound, nothing scrolls
  const stuck = revealScrollTop(laptop({ scrollHeight: 506, clientHeight: 506, scrollTop: 0, itemTop: 600, itemBottom: 653 }));
  assert.equal(stuck, 0);
  // even a stale offset is dropped, so the first step is not hidden
  assert.equal(revealScrollTop(laptop({ scrollHeight: 506, clientHeight: 506, scrollTop: 20 })), 0);
  // a 1px rounding difference must not count as overflow
  assert.equal(revealScrollTop(laptop({ scrollHeight: 378, clientHeight: 377 })), 0);
});

test('a step that already fits leaves the scroll position untouched', () => {
  const metrics = laptop({ scrollTop: 41, itemTop: 400, itemBottom: 453 });
  assert.equal(revealScrollTop(metrics), 41);
  // the tolerance absorbs sub-pixel layout jitter at both edges
  assert.equal(revealScrollTop(laptop({ scrollTop: 12, itemTop: 269.4, itemBottom: 322 })), 12);
  assert.equal(revealScrollTop(laptop({ scrollTop: 12, itemTop: 594, itemBottom: 646.4 })), 12);
});

test('a step below the scrollport is centred inside it', () => {
  // last step at 595..648 sits past the 646px bottom edge of the list
  const target = revealScrollTop(laptop({ scrollTop: 0, itemTop: 595, itemBottom: 648 }));
  // (595 - 269) - (377 - 53) / 2 = 164 → beyond the 67px the list can scroll
  assert.equal(target, 67);
  assert.equal(target, 444 - 377);
});

test('a step above the scrollport is centred and never goes negative', () => {
  // reader is 60px down the list and moves back to the first step
  const target = revealScrollTop(laptop({ scrollTop: 60, itemTop: 209, itemBottom: 262 }));
  assert.equal(target, 0); // 60 - 60 - 162 = -162, clamped to the top
});

test('the result is always a finite, non-negative, in-range offset', () => {
  const cases = [
    {},
    { scrollHeight: 444 },
    { scrollTop: Number.NaN, scrollHeight: 444, clientHeight: 377, listTop: 269, listBottom: 646, itemTop: 700, itemBottom: 753 },
    { scrollTop: 0, scrollHeight: '444', clientHeight: 377, listTop: 269, listBottom: 646, itemTop: 700, itemBottom: 753 },
    { scrollTop: 0, scrollHeight: 444, clientHeight: 377, listTop: 269, listBottom: 646, itemTop: Number.POSITIVE_INFINITY, itemBottom: 753 },
    laptop({ itemTop: 646, itemBottom: 646 }),
    laptop({ listTop: 646, listBottom: 269 }),
    laptop({ scrollTop: -80, itemTop: 595, itemBottom: 648 }),
  ];
  for (const metrics of cases) {
    const value = revealScrollTop(metrics);
    assert.equal(typeof value, 'number');
    assert.ok(Number.isFinite(value), `not finite for ${JSON.stringify(metrics)}`);
    assert.ok(Number.isInteger(value), `not an integer for ${JSON.stringify(metrics)}`);
    assert.ok(value >= 0, `negative for ${JSON.stringify(metrics)}`);
    if (typeof metrics.scrollHeight === 'number' && typeof metrics.clientHeight === 'number') {
      assert.ok(value <= Math.max(0, metrics.scrollHeight - metrics.clientHeight) || value === 0, `past the end for ${JSON.stringify(metrics)}`);
    }
  }
});

test('every step of the real rail lands inside its scrollport', () => {
  // the shipped rail measured at 1366×768: eight 52px buttons, 2px gaps and a
  // 14px top pad inside a 377px scrollport (444px of content, 67px of scroll)
  const listTop = 269;
  const listBottom = 646;
  const scrollHeight = 444;
  const clientHeight = 377;
  const topPad = 14;
  const steps = Array.from({ length: 8 }, (_, index) => {
    const top = topPad + index * 54;
    return { top, bottom: top + 52 };
  });

  // walking forward, then back, the way the reader uses «التالي» / «السابق»
  for (const order of [[...steps], [...steps].reverse()]) {
    let scrollTop = 0;
    order.forEach((step) => {
      const itemTop = listTop + step.top - scrollTop;
      const itemBottom = listTop + step.bottom - scrollTop;
      scrollTop = revealScrollTop({ scrollTop, scrollHeight, clientHeight, listTop, listBottom, itemTop, itemBottom });
      const visibleTop = listTop + step.top - scrollTop;
      const visibleBottom = listTop + step.bottom - scrollTop;
      assert.ok(visibleTop >= listTop - 1, `step at ${step.top} starts above the scrollport (${visibleTop})`);
      assert.ok(visibleBottom <= listBottom + 1, `step at ${step.top} ends below the scrollport (${visibleBottom})`);
      assert.ok(scrollTop >= 0 && scrollTop <= scrollHeight - clientHeight, `scrolled out of range: ${scrollTop}`);
    });
  }
});

test('the module is pure: repeated calls with the same metrics return the same value', () => {
  const metrics = laptop({ scrollTop: 12, itemTop: 700, itemBottom: 753 });
  assert.equal(revealScrollTop(metrics), revealScrollTop(metrics));
  // and it does not mutate the caller's object
  const frozen = Object.freeze({ ...metrics });
  assert.doesNotThrow(() => revealScrollTop(frozen));
});
