import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the platform root is the course home and Lesson 1 has its own stable entry', async () => {
  const [home, lesson, build] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../lesson-1.html', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8'),
  ]);

  assert.match(home, /<title>Interactive Physics — Grade 8 \| منصة الفيزياء التفاعلية<\/title>/);
  assert.match(home, /<main id="course-content">/);
  assert.match(home, /href="\.\/lesson-1\.html"[^>]*>\s*<span>ابدأ الدرس<\/span>/);
  assert.match(home, /القوى المتلاقية/);
  assert.match(home, /القوى المتوازية/);
  assert.match(home, /الوحدة الأولى/);
  assert.equal((home.match(/class="lesson-entry"/g) ?? []).length, 2);
  assert.match(home, /href="\.\/lesson-2\.html"/);
  assert.doesNotMatch(home, /lesson-3\.html|id="page-content"|src="\.\/src\/main\.js"|LESSON_PAGES/);

  assert.match(lesson, /<main class="lesson-layout" id="lesson-content">/);
  assert.match(lesson, /src="\.\/src\/main\.js"/);
  assert.match(lesson, /href="\.\/"[^>]*>الرئيسية<\/a>/);
  assert.match(lesson, /href="\.\/lesson-test\.html"/);
  assert.match(lesson, /href="\.\/teacher\.html"/);

  assert.match(build, /resolve\(projectDirectory, 'lesson-1\.html'\)/);
});
