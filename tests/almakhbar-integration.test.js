import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

function read(p) { return readFile(new URL(p, import.meta.url), 'utf8'); }

test('top-level "المخبر" navigation item is visible in index.html', async () => {
  const home = await read('../index.html');
  assert.match(home, /المخبر/);
  assert.match(home, /href="\.\/almakhbar\.html"/);
  assert.match(home, /<nav[^>]*class="home-nav"/);
});

test('lab directory (almakhbar.html) shows organized unit groups', async () => {
  const dir = await read('../almakhbar.html');
  assert.match(dir, /الوحدة الأولى/);
  assert.match(dir, /الوحدة الثانية/);
  assert.match(dir, /الوحدة الثالثة/);
  assert.match(dir, /الدرس الأول: الكهرباء الساكنة/);
  assert.match(dir, /href="\.\/lab-unit2-lesson1\.html"/);
});

test('first lab is correctly classified under Unit 2 Lesson 1', async () => {
  const dir = await read('../almakhbar.html');
  // Must mention Unit 2 and Lesson 1 specifically
  assert.match(dir, /الوحدة الثانية/);
  assert.match(dir, /الدرس الأول/);
  assert.match(dir, /الكهرباء الساكنة/);
  // Should not confuse with Unit 1 or Lesson 2
  const unit2Section = dir.split('الوحدة الثانية')[1] ?? '';
  assert.match(unit2Section, /الدرس الأول/);
});

test('lab wrapper page loads the built lab via iframe', async () => {
  const wrap = await read('../lab-unit2-lesson1.html');
  assert.match(wrap, /<iframe/);
  assert.match(wrap, /External-labs\/unit-2\/lesson-1\/dist\/index\.html/);
  assert.match(wrap, /المخبر/);
  assert.match(wrap, /الوحدة الثانية/);
  assert.match(wrap, /الدرس الأول/);
  assert.match(wrap, /الكهرباء الساكنة/);
});

test('external lab source directory is preserved', async () => {
  const src = await read('../External-labs/unit-2/lesson-1/src/App.tsx');
  assert.match(src, /StationCharge/);
  assert.match(src, /StationQuiz/);
  assert.match(src, /StationCoulomb/);
  assert.match(src, /StationExperiments/);
});

test('external lab production build exists and preserves content', async () => {
  const dist = await read('../External-labs/unit-2/lesson-1/dist/index.html');
  assert.match(dist, /مختبر الكهرباء الساكنة/);
  assert.match(dist, /الوحدة الثانية/);
  assert.match(dist, /الدرس الأول/);
  assert.match(dist, /<script/);
  assert.match(dist, /<style/);
  // Should contain interactive tab indicators (from source)
  assert.match(dist, /الشحنة الكهربائية وبنية الذرّة/);
});

test('existing platform areas are unbroken (regression)', async () => {
  const home = await read('../index.html');
  assert.match(home, /القوى المتلاقية/);
  assert.match(home, /الوحدة الأولى/);
  assert.match(home, /الدروس المتاحة/);
  const lesson = await read('../lesson-1.html');
  assert.match(lesson, /القوى المتلاقية/);
  assert.match(lesson, /class="lesson-layout"/);
});

test('navigation isolation: lab section does not break site styles', async () => {
  const wrap = await read('../lab-unit2-lesson1.html');
  // Should not inject conflicting React runtime at root
  assert.doesNotMatch(wrap, /id="root"/); // wrapper should not claim root
  // Should reference external lab via relative path, not external redirect
  assert.match(wrap, /\.\/External-labs/);
});

test('Lesson 2 placeholder uses exact required title and "قريباً" status', async () => {
  const dir = await read('../almakhbar.html');
  assert.match(dir, /الدرس الثاني: التيار الكهربائي المتواصل/);
  assert.match(dir, /قريباً/);
  // Should not claim available
  const lesson2Section = dir.split('الدرس الثاني: التيار الكهربائي المتواصل')[1] ?? '';
  assert.doesNotMatch(lesson2Section, /افتح المختبر/);
});

test('full-page lab wrapper uses viewport-filling layout with compact return bar', async () => {
  const wrap = await read('../lab-unit2-lesson1.html');
  assert.match(wrap, /عودة للمنصة/);
  assert.match(wrap, /\.\/almakhbar\.html/); // directory return available
  assert.match(wrap, /lab-viewport/);
  assert.match(wrap, /calc\(100vh/); // fills viewport
  assert.doesNotMatch(wrap, /max-width/); // no constrained container
  assert.match(wrap, /<iframe/);
  assert.match(wrap, /External-labs\/unit-2\/lesson-1\/dist\/index\.html/);
});

test('full-page wrapper has no large obstructing header/footer that reduce lab area', async () => {
  const wrap = await read('../lab-unit2-lesson1.html');
  // Should not contain the old large hero/home-shell structure or site footer
  assert.doesNotMatch(wrap, /home-hero/);
  assert.doesNotMatch(wrap, /site-footer/);
  assert.match(wrap, /lab-topbar/);
});

test('iframe isolation preserved and loads correct source', async () => {
  const wrap = await read('../lab-unit2-lesson1.html');
  assert.match(wrap, /<iframe[^>]*src="\.\/External-labs\/unit-2\/lesson-1\/dist\/index\.html"/);
  // No external redirect
  assert.doesNotMatch(wrap, /window\.location/);
  assert.doesNotMatch(wrap, /https?:\/\/.*\.html/); // local relative only
});
