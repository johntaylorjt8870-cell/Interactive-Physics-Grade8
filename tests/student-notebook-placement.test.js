import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LESSON_PAGES } from '../src/lesson-content.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('the student notebook is the ninth and final tab of the actual first lesson', async () => {
  const page = await read('../lesson-1.html');
  const source = await read('../src/lesson-content.js');
  assert.equal(LESSON_PAGES.length, 9);
  assert.equal(LESSON_PAGES.at(-1).stageTitle, '📒 دفتر الطالب');
  assert.match(LESSON_PAGES.at(-1).blocks.join(''), /student-notebook-title/);
  assert.match(page, /aria-valuemax="9"/);
  assert.match(page, /1 \/ 9/);
  for (const heading of ['١. تعريفات أساسية','٢. قاعدة متوازي الأضلاع','٣. قوتان متعامدتان','٤. تحليل الثقل على سطح مائل','٥. الرموز والوحدات','٦. ملاحظات تمنع الخلط']) {
    assert.ok(source.includes(heading), `missing notebook section: ${heading}`);
  }
  assert.match(source, /student-notebook-formula/);
});

test('the student notebook has no shortcut card in the separate Physics in Life section', async () => {
  const page = await read('../physics-in-life-lesson-1.html');
  assert.doesNotMatch(page, /pil-notebook-entry|pil-step-notebook|دفتر الطالب/);
});
