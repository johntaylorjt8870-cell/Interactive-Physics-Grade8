import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { LESSON_2_PAGES, LESSON_2_META, pageTextBlocks } from '../src/lesson-2-content.js';
import { LESSON_2_DIAGRAMS } from '../src/lesson-2-diagrams.js';
import {
  BOOK_EXAMPLE_OPPOSITE,
  BOOK_EXAMPLE_SAME,
  BOOK_PROBLEM_1,
  BOOK_PROBLEM_2,
  momentProducts,
  oppositeSenseFromLength,
  oppositeSenseParallelResultant,
  sameSenseFromD1,
  sameSenseParallelResultant,
} from '../src/lesson-2-physics.js';
import { PRACTICE_DECK, SELF_CHECK_ITEMS, TEXTBOOK_PROBLEMS } from '../src/lesson-2-practice-data.js';
import { lesson2SimulationMarkup } from '../src/lesson-2-simulation.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const page = (number) => LESSON_2_PAGES.find((item) => item.page === number);
const htmlOf = (number) => page(number).blocks.join('\n');

test('source audit and eight textbook scans are archived', async () => {
  assert.equal(existsSync(new URL('../docs/unit-1-lesson-2-source-audit.md', import.meta.url)), true);
  for (let i = 1; i <= 8; i += 1) {
    assert.equal(
      existsSync(new URL(`../docs/sources/unit1-lesson2/image-${i}.png`, import.meta.url)),
      true,
      `Missing archived source scan image-${i}.png`,
    );
  }
  const audit = await read('../docs/unit-1-lesson-2-source-audit.md');
  assert.match(audit, /لوح الربائع المغناطيسي|لوح الرّبائع المغناطيسي/);
  assert.match(audit, /63/);
  assert.match(audit, /70/);
});

test('Lesson 2 has a stable RTL entry, eight sequential textbook pages, and no future lesson', async () => {
  const [html, main, build] = await Promise.all([
    read('../lesson-2.html'),
    read('../src/lesson-2-main.js'),
    read('../scripts/build.mjs'),
  ]);
  assert.match(html, /<html lang="ar" dir="rtl">/);
  assert.match(html, /القوى المتوازية/);
  assert.match(html, /ص 63–70/);
  assert.match(html, /src="\.\/src\/lesson-2-main\.js"/);
  assert.match(html, /href="\.\/lesson-2-test\.html"/);
  assert.match(html, /href="\.\/lesson-2-teacher\.html"/);
  assert.match(html, /href="\.\/unit-1-test\.html"/);
  assert.match(html, /href="\.\/unit-questions\.html">أسئلة الوحدة الأولى/);
  assert.deepEqual(LESSON_2_PAGES.map((item) => item.page), [63, 64, 65, 66, 67, 68, 69, 70]);
  assert.equal(LESSON_2_META.pages, '63–70');
  assert.match(main, /goToPage\(0\)/);
  assert.match(build, /'lesson-2\.html'/);
  assert.doesNotMatch(html, /lesson-3|الدرس 3/);
  assert.doesNotMatch(html, /somer173/);
});

test('each stage is self-contained with title, summary, objectives, and book/platform badges', () => {
  for (const stage of LESSON_2_PAGES) {
    assert.ok(stage.stageTitle && stage.stageTitle.length > 3, `stageTitle ${stage.page}`);
    assert.ok(stage.summary && stage.summary.length > 20, `summary ${stage.page}`);
    assert.ok(Array.isArray(stage.objectives) && stage.objectives.length >= 3, `objectives ${stage.page}`);
    const joined = stage.blocks.join('\n');
    assert.match(joined, /curriculum-tag-book/, `book badge ${stage.page}`);
  }
});

test('page 63 exposes exact objectives, keyword, and the three inquiry questions', () => {
  const text = pageTextBlocks(page(63));
  for (const phrase of [
    'يتعرّف القوى المتوازية.',
    'يحدّد عناصر محصلة قوتين متوازيتين بجهة واحدة.',
    'يحدّد عناصر محصلة قوتين متوازيتين بجهتين متعاكستين.',
    'يمثّل بالرسم القوى المتوازية ومحصلتها.',
    'قوتان متوازيتان',
    'كيف تكون قوى شد السلاسل للأرجوحة',
    'ما الذي يجعل الأرجوحة متوازنة',
    'كيف يشد الحصانان العربة',
  ]) {
    assert.ok(text.includes(phrase), phrase);
  }
  assert.equal((htmlOf(63).match(/data-inquiry-card/g) ?? []).length, 3);
});

test('page 64 uses the audited apparatus list, definition, and remaining-wonder question', () => {
  const text = pageTextBlocks(page(64));
  assert.ok(text.includes('لوح الربائع المغناطيسي'));
  assert.ok(text.includes('حقيبة الميكانيك'));
  assert.ok(text.includes('القوى المتوازية'));
  assert.ok(text.includes('حواملها مستقيمات متوازية'));
  assert.ok(text.includes('هل لحاملي قوتي شد الربيعتين الاستقامة ذاتها'));
  assert.ok(text.includes('هل يمكن إيجاد محصلة عدة قوى متوازية'));
  assert.doesNotMatch(text, /غير محسوم|Reference \/ See textbook — p64/);
  assert.match(htmlOf(64), /parallel-definition-lab/);
});

test('pages 65–67 keep laws, experiment steps, and the same-sense worked example', () => {
  const p65 = htmlOf(65);
  const p66 = htmlOf(66) + htmlOf(67);
  assert.ok(p65.includes('F_{1}\\\\times d_{1}=F_{2}\\\\times d_{2}'));
  assert.ok(p65.includes('F=F_{1}+F_{2}'));
  assert.ok(p65.includes('أحسب الجداءين') || pageTextBlocks(page(65)).includes('أحسب الجداءين'));
  assert.match(p65, /parallel-resultant-lab/);
  for (const value of ['0.5\\\\,\\\\mathrm{m}', '20\\\\,\\\\mathrm{N}', '30\\\\,\\\\mathrm{N}', '50\\\\,\\\\mathrm{N}']) {
    assert.ok(p66.includes(value), value);
  }
  assert.ok(pageTextBlocks(page(66)).includes('أين ستقع النقطة') || pageTextBlocks(page(66)).includes('أين تستقر'));
  assert.ok(htmlOf(67).includes('F=F_{2}-F_{1}'));
  assert.ok(pageTextBlocks(page(67)).includes('أنزع الثقل'));
});

test('pages 68–70 keep opposite example values and the original self-check tasks', () => {
  const t68 = pageTextBlocks(page(68));
  const t70 = pageTextBlocks(page(70));
  const p70 = htmlOf(70);
  for (const value of ['60', '200', '300', '100', '180']) {
    assert.ok(t68.includes(value), `p68 missing ${value}`);
  }
  for (const value of ['40', '10', '80', '20']) {
    assert.ok(t70.includes(value), `p70 missing ${value}`);
  }
  assert.match(p70, /المسألة الأولى/);
  assert.match(p70, /المسألة الثانية/);
  assert.ok(t70.includes('بُعد حامل القوة الثانية') || t70.includes('بعد حامل القوة الثانية'));
  assert.equal((p70.match(/data-selfcheck-item/g) ?? []).length, 4);
});

test('parallel-force physics places same-sense resultant inside and opposite-sense resultant outside', () => {
  const same = sameSenseParallelResultant(20, 30, 0.5);
  assert.equal(same.magnitude, 50);
  assert.equal(same.distanceFromF2, 0.2);
  assert.equal(same.position, 0.3);
  const opposite = oppositeSenseParallelResultant(200, 300, 60);
  assert.equal(opposite.magnitude, 100);
  assert.equal(opposite.position, 180);
  assert.equal(opposite.distanceFromF2, 120);
  assert.equal(opposite.sense, -1);
  assert.deepEqual(momentProducts(200, 180, 300, 120), { first: 36000, second: 36000, balanced: true });
  const equal = oppositeSenseParallelResultant(20, 20, 40);
  assert.equal(equal.hasFiniteResultant, false);
  assert.equal(equal.position, null);
  const fromD1 = sameSenseFromD1(40, 10, 30);
  assert.equal(fromD1.d2, 120);
  assert.equal(fromD1.d, 150);
  assert.equal(fromD1.magnitude, 50);
  const oppLen = oppositeSenseFromLength(80, 20, 40);
  assert.equal(oppLen.magnitude, 60);
  assert.ok(Math.abs(oppLen.d2 - 160 / 3) < 1e-9);
  assert.equal(BOOK_EXAMPLE_SAME.F, 50);
  assert.equal(BOOK_EXAMPLE_OPPOSITE.d1, 180);
  assert.equal(BOOK_PROBLEM_1.d, 150);
  assert.equal(BOOK_PROBLEM_2.F, 60);
});

test('reconstructed diagrams are labelled vectors with source-relevant points and no image tags', () => {
  const required = [
    'parallel-definition', 'same-sense', 'opposite-sense',
    'swing-scene', 'wagon-scene', 'worked-same', 'worked-opposite',
    'problem-1', 'problem-2',
  ];
  for (const key of required) {
    assert.ok(LESSON_2_DIAGRAMS[key], key);
  }
  for (const diagram of Object.values(LESSON_2_DIAGRAMS)) {
    assert.match(diagram.svg, /<svg[^]*role="img"/);
    assert.match(diagram.svg, /<title/);
    assert.match(diagram.svg, /<desc/);
    assert.ok(diagram.description.length > 20);
    assert.doesNotMatch(diagram.svg, /<img/);
  }
  assert.match(LESSON_2_DIAGRAMS['same-sense'].svg, />C</);
  assert.match(LESSON_2_DIAGRAMS['opposite-sense'].svg, />A</);
  assert.match(LESSON_2_DIAGRAMS['worked-same'].svg, /50 N/);
  assert.match(LESSON_2_DIAGRAMS['worked-opposite'].svg, /180 cm/);
});

test('simulations expose live status, reset, prediction, reduced-motion, and keyboard-accessible controls', async () => {
  const def = lesson2SimulationMarkup('parallel-definition-lab');
  const lab = lesson2SimulationMarkup('parallel-resultant-lab');
  const source = await read('../src/lesson-2-simulation.js');
  assert.match(def, /aria-live="polite"/);
  assert.match(def, /Educational simplified model/);
  assert.match(def, /data-def-reset/);
  assert.match(lab, /type="radio"/);
  assert.match(lab, /type="range"/);
  assert.match(lab, /data-parallel-reset/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(lab, /aria-live="polite"/);
});

test('self-check answers, textbook problems, and practice stay inside the book', () => {
  assert.equal(SELF_CHECK_ITEMS['70-1'].correct, 'a');
  assert.equal(SELF_CHECK_ITEMS['70-2'].correct, 'c');
  assert.equal(SELF_CHECK_ITEMS['70-3'].correct, 'c');
  assert.equal(SELF_CHECK_ITEMS['70-4'].correct, 'a');
  assert.equal(TEXTBOOK_PROBLEMS.length, 2);
  assert.equal(TEXTBOOK_PROBLEMS[0].interactiveSteps[0].expected, 120);
  assert.equal(TEXTBOOK_PROBLEMS[1].interactiveSteps[0].expected, 60);
  assert.equal(PRACTICE_DECK.length, 6);
  assert.ok(PRACTICE_DECK.every((item) => item.options.length === 4 && item.correct));
});

test('Lesson 2 CSS preserves reduced motion, RTL isolation, and distinctive identity', async () => {
  const css = await read('../src/lesson-2.css');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /--l2-teal/);
  assert.match(css, /direction: ltr/);
});
