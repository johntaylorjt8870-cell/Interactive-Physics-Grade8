/* Unit 2 solutions build display equations directly, without the
   `.assessment-formula` wrapper that the other solution modules use. On a 390px
   screen the long chains (u2-9 Coulomb, u2-46 resistivity) therefore used to
   widen the whole results page instead of scrolling inside their box.
   These checks pin the CSS contract only — they cannot measure layout, which
   still needs a real browser at 390px and on desktop. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

/** Declarations of a rule whose selector starts the line, so
 *  `.assessment-formula .equation {` is never mistaken for the bare rule. */
function bareRuleBody(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  return match?.[1] ?? null;
}

test('a display equation scrolls horizontally inside its own box on narrow screens', async () => {
  const css = await read('src/lesson-test.css');
  const body = bareRuleBody(css, '.equation');
  assert.ok(body, 'lesson-test.css declares a bare .equation rule');
  assert.match(body, /overflow-x:\s*auto/, '.equation scrolls horizontally');
  assert.match(body, /max-width:\s*100%/, '.equation never exceeds its column');
});

test('the existing equation card keeps its formatting', async () => {
  const css = await read('src/lesson-test.css');
  const body = bareRuleBody(css, '.assessment-formula .equation');
  assert.ok(body, 'the wrapped equation rule is still present');
  for (const declaration of ['padding:', 'border:', 'background:', 'border-radius:']) {
    assert.ok(body.includes(declaration), `the card keeps its ${declaration} declaration`);
  }
  assert.match(body, /overflow-x:\s*auto/, 'the card still scrolls horizontally');
});

test('the scrolling rule cannot leak into lessons, appendices or teacher pages', async () => {
  const nonAssessmentPages = [
    'index.html', 'lesson-1.html', 'lesson-1-appendix.html', 'lesson-2.html', 'lesson-2-appendix.html',
    'appendices.html', 'unit2-exercises.html', 'unit-questions.html', 'teacher.html',
  ];
  const assessmentPages = [
    'lesson-test.html', 'lesson-2-test.html', 'unit-1-test.html', 'unit-2-test.html',
    'unit2-lesson-1-test.html', 'unit2-lesson-2-test.html', 'unit2-lesson-3-test.html',
  ];
  for (const page of nonAssessmentPages) {
    assert.doesNotMatch(await read(page), /lesson-test\.css/, `${page} does not load the assessment stylesheet`);
  }
  for (const page of assessmentPages) {
    assert.match(await read(page), /href="\.\/src\/lesson-test\.css"/, `${page} still loads the stylesheet`);
  }
});
