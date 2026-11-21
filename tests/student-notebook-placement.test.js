import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LESSON_PAGES } from '../src/lesson-content.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

/* Placement, not content: the notebook must stay the ninth and final tab of the
   real first lesson and must not leak into any other page. Content coverage is
   asserted in `tests/lesson-1-student-notebook.test.js`, which reads the
   notebook module section by section. */

test('the student notebook is the ninth and final tab of the actual first lesson', async () => {
  const page = await read('../lesson-1.html');
  const source = await read('../src/lesson-content.js');
  const notebook = await read('../src/lesson-1-notebook.js');
  assert.equal(LESSON_PAGES.length, 9);
  assert.equal(LESSON_PAGES.at(-1).stageTitle, '📒 دفتر الطالب');
  assert.match(LESSON_PAGES.at(-1).blocks.join(''), /student-notebook-title/);
  assert.match(page, /aria-valuemax="9"/);
  assert.match(page, /1 \/ 9/);

  // the notebook is authored once, in its own module, and imported by the lesson
  assert.match(source, /import \{ LESSON_1_NOTEBOOK_BLOCK \} from '\.\/lesson-1-notebook\.js'/);
  const headings = [
    '١. الدرس في سطور',
    '٢. القوة كمية متجهة',
    '٣. تعريفات أساسية',
    '٤. تجربة لوح الربائع',
    '٥. محصّلة قوّتين متلاقيتين',
    '٦. قوتان متلاقيتان متعامدتان',
    '٧. التطبيق المحلول (١)',
    '٨. التطبيق المحلول (٢)',
    '٩. تحليل القوّة',
    '١٠. تحليل الثقل على سطح مائل أملس',
    '١١. خلاصة «تعلّمتُ»',
    '١٢. «أختبر نفسي»',
    '١٣. «أختبر نفسي»',
    '١٤. الرموز والوحدات',
    '١٥. ملاحظات تمنع الخلط',
    '١٦. شروط تطبيق القوانين',
    '١٧. قائمة تحقّق',
  ];
  let cursor = -1;
  for (const heading of headings) {
    const index = notebook.indexOf(heading);
    assert.notEqual(index, -1, `missing notebook section: ${heading}`);
    assert.ok(index > cursor, `notebook section out of order: ${heading}`);
    cursor = index;
  }
  assert.match(notebook, /student-notebook-formula/);
});

test('the student notebook has no shortcut card in the separate Physics in Life section', async () => {
  const page = await read('../physics-in-life-lesson-1.html');
  assert.doesNotMatch(page, /pil-notebook-entry|pil-step-notebook|دفتر الطالب/);
});
