import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

/* The lesson column is 978px wide at 1366px and 1032px at 1440px, so a line of
   running text ran about 900–980px. The reading measure caps only running text
   (paragraphs and list items) and leaves the interactive regions alone. These
   tests pin that scope so a restyle cannot widen the prose again or start
   changing simulations, inquiry cards, self-checks, practice or workbenches. */

const EXCLUDED = ['.simulation-experience', '.inquiry-card', '.l1-practice-deck', '.problem-workbench', '[data-self-check]'];

/** The declaration body of the first `selector { … }` rule that follows `from`. */
function ruleBody(css, selector) {
  const index = css.indexOf(selector);
  assert.notEqual(index, -1, `${selector} must exist in the lesson stylesheet`);
  const open = css.indexOf('{', index);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

test('the reading measure is a single variable, set on the lesson page root', async () => {
  const css = await read('../src/lesson-1.css');
  const root = ruleBody(css, '.l1-page {');
  const match = root.match(/--l1-reading-measure:\s*([\d.]+)rem;/);
  assert.ok(match, '--l1-reading-measure must be declared in the .l1-page root block');
  const rem = Number(match[1]);
  // a comfortable measure: roughly 70–90 Arabic characters at 17px (about 36–44rem)
  assert.ok(rem >= 36 && rem <= 44, `reading measure ${rem}rem should stay in the 36–44rem range`);
});

test('running text in the lesson stages is capped by the variable', async () => {
  const css = await read('../src/lesson-1.css');
  const cap = css.indexOf('max-width: var(--l1-reading-measure);');
  assert.notEqual(cap, -1, 'the cap must use the reading measure variable');

  // the selector that owns the cap is the one immediately before its declaration
  const selectorStart = css.lastIndexOf('}', cap) + 1;
  const selector = css.slice(selectorStart, cap);

  assert.match(selector, /\.l1-page \.page-content :is\(p, li\)/, 'stage paragraphs and list items are capped');
  assert.match(selector, /\.l1-page \.stage-hero-card :is\(p, li\)/, 'the stage summary and objectives are capped');
});

test('the cap excludes every interactive region, in the same selector', async () => {
  const css = await read('../src/lesson-1.css');
  const cap = css.indexOf('max-width: var(--l1-reading-measure);');
  const selectorStart = css.lastIndexOf('}', cap) + 1;
  const selector = css.slice(selectorStart, cap);

  assert.match(selector, /:not\(:is\(/, 'the page-content rule must exclude interactive regions');
  for (const name of EXCLUDED) {
    assert.ok(selector.includes(name), `${name} must be excluded from the reading measure`);
  }
});

test('no interactive region is re-sized by a max-width reset', async () => {
  const css = await read('../src/lesson-1.css');
  // a reset to none/revert would also undo the 820px cap that styles.css gives simulation text
  assert.doesNotMatch(css, /max-width:\s*(none|revert|unset|initial)\s*;/, 'the lesson stylesheet must not reset max-width');
  assert.doesNotMatch(css, /max-width:[^;]*!important/, 'the reading measure must not use !important');
});

test('the shared stylesheet and the stacked layout are not touched by the measure', async () => {
  const shared = await read('../src/styles.css');
  // the simulation text cap in the shared sheet is still there, unchanged
  assert.match(shared, /\.simulation-header p \{ max-width: 820px;/);
  assert.doesNotMatch(shared, /reading-measure/);
});
