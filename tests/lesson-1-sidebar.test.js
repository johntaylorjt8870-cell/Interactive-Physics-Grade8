import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

const LAPTOP_MEDIA = '@media (min-width: 821px)';
const SHORT_MEDIA = '@media (min-width: 821px) and (max-height: 800px)';

/** Locates the first CSS block introduced by `header`, braces included. */
function findBlock(css, header) {
  const start = css.indexOf(header);
  assert.notEqual(start, -1, `${header} must exist in the lesson stylesheet`);
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    else if (css[index] === '}') {
      depth -= 1;
      if (depth === 0) return { body: css.slice(open + 1, index), start, end: index + 1 };
    }
  }
  throw new Error(`unbalanced block for ${header}`);
}

/** Returns the body of the first CSS block introduced by `header`. */
const mediaBlock = (css, header) => findBlock(css, header).body;

/** The stylesheet with that one block removed, i.e. everything outside the media query. */
function outsideBlock(css, header) {
  const { start, end } = findBlock(css, header);
  return `${css.slice(0, start)}\n${css.slice(end)}`;
}

/** The declaration body of the first `selector { … }` rule. */
function rule(css, selector) {
  const index = css.indexOf(selector);
  assert.notEqual(index, -1, `${selector} must exist`);
  const open = css.indexOf('{', index);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

/* The rail is a sticky flex column. On a 1366×768 laptop it is 849px tall, so
   with `top: 24px` it spans 24..873: the eighth step and the curriculum key sat
   below the fold for the whole lesson because `#page-nav` could not scroll
   (`overflow: visible`). These rules are what keep the rail inside the window;
   they are pinned here so a restyle cannot quietly bring the defect back. */
test('the step rail is height-bound from 821px up and only the step list scrolls', async () => {
  const css = await read('../src/lesson-1.css');
  const laptop = mediaBlock(css, LAPTOP_MEDIA);

  const sidebar = rule(laptop, '.l1-page .lesson-sidebar {');
  assert.match(sidebar, /max-height: calc\(100vh - 48px\);/);
  assert.match(sidebar, /max-height: calc\(100dvh - 48px\);/);

  const nav = rule(laptop, '.l1-page .lesson-sidebar > .page-nav {');
  assert.match(nav, /min-height: 0;/);
  assert.match(nav, /overflow-y: auto;/);
  assert.match(nav, /overscroll-behavior: contain;/);

  // the intro, the progress bar and the curriculum key never shrink away
  assert.match(laptop, /\.l1-page \.lesson-sidebar > \.sidebar-intro,\s*\.l1-page \.lesson-sidebar > \.progress-wrap,\s*\.l1-page \.lesson-sidebar > \.sidebar-footer \{\s*flex: 0 0 auto;/);
});

test('the rail height rule does not leak outside the laptop media queries', async () => {
  const css = await read('../src/lesson-1.css');
  // both rail rules are media-scoped: the pinned one and the short-window one
  const outside = outsideBlock(outsideBlock(css, LAPTOP_MEDIA), SHORT_MEDIA);

  assert.ok(!/\.lesson-sidebar\s*\{[^}]*max-height/.test(outside), 'the rail must stay unbounded below 821px, where it is in the flow');
  assert.ok(!/\.page-nav\s*\{[^}]*overflow-y:\s*(auto|scroll|hidden)/.test(outside), 'the step list must not scroll below 821px');

  // and the stacked layout keeps the overflow it had before this change
  const shared = await read('../src/styles.css');
  const stacked = mediaBlock(shared, '@media (max-width: 820px)');
  assert.ok(stacked.includes('.page-nav { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }'), 'the stacked rail keeps its four-column grid');
  assert.ok(!/max-height/.test(stacked), 'the stacked rail is not height-bound');
  assert.ok(!/\.page-nav \{[^}]*overflow/.test(stacked), 'the stacked rail keeps its natural overflow');
});

test('the scrollport adds no width, no gutter and no clipping of the button text', async () => {
  const css = await read('../src/lesson-1.css');
  const laptop = mediaBlock(css, LAPTOP_MEDIA);
  const nav = rule(laptop, '.l1-page .lesson-sidebar > .page-nav {');

  // `scrollbar-gutter: stable` shifted the RTL buttons 15px; padding-inline would
  // shrink them below the 256px they measure before and after the fix
  assert.doesNotMatch(css, /scrollbar-gutter/, 'scrollbar-gutter changes the RTL button alignment');
  assert.doesNotMatch(nav, /padding-inline|padding:|margin-inline|margin:/, 'the scrollport must not change the button box');
  // the buttons keep their shared sizing from styles.css (min-height 52, width 100%)
  const shared = await read('../src/styles.css');
  const button = rule(shared, '.page-nav-button {');
  assert.match(button, /width: 100%;/);
  assert.match(button, /min-height: 52px;/);
});

test('the keyboard focus ring is drawn inside the scrollport', async () => {
  const css = await read('../src/lesson-1.css');
  const laptop = mediaBlock(css, LAPTOP_MEDIA);

  // a scrollport clips outlines drawn outside the box, so the Lesson 1 ring moves
  // inside by 2px; it is still a 2px solid outline in the shared focus style
  assert.match(laptop, /\.l1-page \.lesson-sidebar > \.page-nav \.page-nav-button:focus-visible \{\s*outline-offset: -2px;/);
  const shared = await read('../src/styles.css');
  assert.match(shared, /:focus-visible \{ outline: 2px solid var\(--accent\); outline-offset: 3px; \}/);
});

test('main.js reveals the active step in the rail without moving the window', async () => {
  const main = await read('../src/main.js');

  assert.match(main, /import \{ railMaxHeight, revealScrollTop \} from '\.\/sidebar-reveal\.js';/);
  assert.match(main, /function revealActiveStep\(\)/);
  assert.match(main, /pageNav\.scrollTop = revealScrollTop\(\{/);
  // called on every render, right after the rail is rebuilt
  assert.match(main, /  renderNav\(\);[\s\S]{0,160}?  revealActiveStep\(\);/);
  // and when the window is resized past the laptop breakpoint
  assert.match(main, /window\.addEventListener\('resize', refitAndReveal\);/);

  // the window is still scrolled only by the existing step change, never by the reveal
  assert.doesNotMatch(main, /scrollIntoView/);
});

test('the reveal calculation lives in a DOM-free module', async () => {
  const module = await read('../src/sidebar-reveal.js');
  assert.match(module, /export function revealScrollTop\(/);
  assert.doesNotMatch(module, /document\.|querySelector|addEventListener|requestAnimationFrame|window\.\w+\s*[=(]/, 'the reveal maths must be testable without a browser');
});

test('Lesson 1 keeps its own assets and the shared lesson styles are untouched by it', async () => {
  assert.equal(existsSync(new URL('../src/sidebar-reveal.js', import.meta.url)), true);
  const page = await read('../lesson-1.html');

  // the same two Lesson 1 assets, in the same order, plus no new stylesheet
  assert.match(page, /<link rel="stylesheet" href="\.\/src\/styles\.css" \/>\s*<link rel="stylesheet" href="\.\/src\/lesson-1\.css" \/>/);
  assert.match(page, /<script type="module" src="\.\/src\/main\.js"><\/script>/);
  assert.equal((page.match(/<link rel="stylesheet"/g) ?? []).length, 4, 'lesson-1.html links fonts, KaTeX, styles and its own stylesheet');
});

/* At scrollY = 0 the rail has not stuck yet: it starts under the top bar and the
   layout's top margin, 112px down. Bounding it only by `100vh - 48px` left it
   64px past the fold and cut the curriculum key, so a short-window rule takes
   the measured space instead. Screens ≥801px tall must not enter that rule. */
test('short windows bound the rail by the space it actually has', async () => {
  const css = await read('../src/lesson-1.css');
  const short = mediaBlock(css, SHORT_MEDIA);

  assert.match(short, /max-height: var\(--rail-max-height, calc\(100vh - 136px\)\);/);
  assert.match(short, /max-height: var\(--rail-max-height, calc\(100dvh - 136px\)\);/);
  // 136px = 112px top of the rail + 24px gutter: the key is whole at scrollY 0
  assert.equal(136 - 112, 24);

  // 1440×900 and taller are outside the rule, so their pixels cannot change
  assert.ok(900 > 800 && 1080 > 800, 'the tall laptop viewports stay out of the short rule');
});

test('main.js publishes the measured rail height and refreshes it on scroll', async () => {
  const main = await read('../src/main.js');

  assert.match(main, /import \{ railMaxHeight, revealScrollTop \} from '\.\/sidebar-reveal\.js';/);
  assert.match(main, /window\.matchMedia\?\.\('\(min-width: 821px\) and \(max-height: 800px\)'\);/);
  assert.match(main, /sidebar\.style\.setProperty\('--rail-max-height', `\$\{height\}px`\);/);
  // the property is dropped again outside the short rule, so tall screens fall back to CSS
  assert.match(main, /sidebar\.style\.removeProperty\('--rail-max-height'\)/);
  // measured again while scrolling (the rail's top changes until it sticks) and on resize
  assert.match(main, /window\.addEventListener\('scroll', refitOnly, \{ passive: true \}\);/);
  assert.match(main, /window\.addEventListener\('resize', refitAndReveal\);/);
  assert.match(main, /shortRailQuery\?\.addEventListener\?\.\('change', refitAndReveal\);/);
  // the fit runs before the reveal, because the height decides the scrollport
  assert.match(main, /  renderNav\(\);\s*\n  \/\/ the rail's height decides the step list's scrollport; fit it before revealing\s*\n  fitRailToViewport\(\);\s*\n  revealActiveStep\(\);/);
  // and the window is still never scrolled from this module
  assert.doesNotMatch(main, /scrollIntoView/);
});
