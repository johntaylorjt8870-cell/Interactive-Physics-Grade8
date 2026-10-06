import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSON_PAGES, PYTHAGORAS_LINES, pageTextBlocks } from '../src/lesson-content.js';
import { DIAGRAMS } from '../src/diagrams.js';
import { SELF_CHECK_ANSWERS, selfCheckAnswer } from '../src/self-check-answers.js';
import { gradeSelfCheck } from '../src/self-check.js';
import {
  V_F1, V_F2, V_F3, V_F, V_W, V_R, V_OM, V_OX, V_OY,
} from '../src/math.js';

const page = (number) => LESSON_PAGES.find((item) => item.page === number);
const vectorBetween = (start, end) => ({ x: end.x - start.x, y: end.y - start.y });
const vectorLength = (vector) => Math.hypot(vector.x, vector.y);
const dot = (first, second) => first.x * second.x + first.y * second.y;
const nearly = (actual, expected, tolerance = 0.02) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
};

function listItemCount(markup, className) {
  const match = markup.match(new RegExp(`<ol class="source-list ${className}">([\\s\\S]*?)<\\/ol>`));
  assert.ok(match, `Expected ordered list ${className}`);
  return (match[1].match(/<li\b/g) ?? []).length;
}

test('lesson navigation follows textbook pages 55 through 62 in order', () => {
  assert.deepEqual(LESSON_PAGES.map((item) => item.page), [55, 56, 57, 58, 59, 60, 61, 62]);
  assert.ok(LESSON_PAGES.every((item) => item.blocks.some((block) => block.type === 'book')));
});

test('page 55 preserves objectives and leaves the unavailable photograph as a source slot', () => {
  const content = pageTextBlocks(page(55));
  for (const phrase of [
    'يتعرّف القوى المتلاقية.',
    'يوضّح بالرسم القوى المتلاقية.',
    'يحدّد عناصر محصلة قوتين متلاقيتين.',
    'يحلّل القوة إلى مركبتين متعامدتين.',
    'القوى المتلاقية – تحليل القوة.',
    'أين تلتقي حبال المظلّة؟',
  ]) assert.ok(content.includes(phrase), `Missing source phrase: ${phrase}`);
  const slot = page(55).blocks.find((block) => block.type === 'platform' && block.kind === 'source-slot');
  assert.ok(slot, 'the unavailable photograph stays a labelled source slot');
  assert.match(slot.html, /موضع الصورة الأصلية/);
  assert.doesNotMatch(slot.html, /<img\b/);
});

test('page 56 has seven experiment steps and marks unresolved apparatus wording', () => {
  const content = pageTextBlocks(page(56));
  assert.equal(listItemCount(content, 'experiment-list'), 7);
  assert.ok(content.includes('خطوات التجربة:'));
  assert.ok(content.includes('جسم مزود بخطاف - خيوط ربط.'));
  assert.ok(content.includes('بداية سطر الأدوات/اسم اللوح غير محسوم'));
});

test('page 56 concurrent arrows begin at O, point in the source directions, and meet on their carriers', () => {
  const { geometry, svg } = DIAGRAMS.concurrent;
  const { origin, forceTips, carriers } = geometry;
  assert.ok(forceTips.F1.x > origin.x && forceTips.F1.y < origin.y);
  assert.ok(forceTips.F2.x < origin.x && forceTips.F2.y < origin.y);
  assert.ok(forceTips.w.x === origin.x && forceTips.w.y > origin.y);
  for (const tip of Object.values(forceTips)) {
    assert.ok(svg.includes(`x1="${origin.x}" y1="${origin.y}" x2="${tip.x}" y2="${tip.y}"`));
  }
  for (const carrier of carriers) {
    const direction = vectorBetween(carrier.start, carrier.end);
    const toOrigin = vectorBetween(carrier.start, origin);
    nearly(direction.x * toOrigin.y - direction.y * toOrigin.x, 0, 1);
  }
});

test('page 57 parallelogram uses common-origin forces and the O-to-M diagonal', () => {
  const { geometry, svg } = DIAGRAMS.parallelogram;
  const expectedResult = {
    x: geometry.firstTip.x + geometry.secondTip.x - geometry.origin.x,
    y: geometry.firstTip.y + geometry.secondTip.y - geometry.origin.y,
  };
  nearly(geometry.result.x, expectedResult.x);
  nearly(geometry.result.y, expectedResult.y);
  assert.ok(svg.includes(`x1="${geometry.origin.x}" y1="${geometry.origin.y}" x2="${geometry.firstTip.x}" y2="${geometry.firstTip.y}"`));
  assert.ok(svg.includes(`x1="${geometry.origin.x}" y1="${geometry.origin.y}" x2="${geometry.secondTip.x}" y2="${geometry.secondTip.y}"`));
  assert.ok(svg.includes(`x1="${geometry.origin.x}" y1="${geometry.origin.y}" x2="${geometry.result.x}" y2="${geometry.result.y}"`));
});

test('page 58 diagram keeps the 4:3 construction at 60 degrees without replacing the approximate result', () => {
  const { geometry, svg, platformNote } = DIAGRAMS['oblique-example'];
  const first = vectorBetween(geometry.origin, geometry.firstTip);
  const second = vectorBetween(geometry.origin, geometry.secondTip);
  const firstLength = vectorLength(first);
  const secondLength = vectorLength(second);
  const angle = Math.acos(dot(first, second) / (firstLength * secondLength)) * 180 / Math.PI;
  nearly(firstLength / geometry.scalePixelsPerCentimeter, 4);
  nearly(secondLength / geometry.scalePixelsPerCentimeter, 3);
  nearly(angle, 60, 0.05);
  assert.ok(svg.includes('60°'));
  assert.ok(svg.includes('4 cm'));
  assert.ok(svg.includes('3 cm'));
  assert.match(platformNote, /لا يقيس القطر/);
  const content = pageTextBlocks(page(58));
  for (const phrase of ['60°', '1 cm = 1 N', 'F₁ = 4 N', 'F₂ = 3 N', 'تقريباً', '6 cm', 'F = 6 × 1 = 6 N']) {
    assert.ok(content.includes(phrase), `Missing page 58 detail: ${phrase}`);
  }
});

test('page 59 rectangle is a right-angle 3–4–5 construction at the stated scale', () => {
  const { geometry, svg } = DIAGRAMS['right-angle-resultant'];
  const first = vectorBetween(geometry.origin, geometry.firstTip);
  const second = vectorBetween(geometry.origin, geometry.secondTip);
  const resultant = vectorBetween(geometry.origin, geometry.result);
  nearly(dot(first, second), 0);
  const scale = vectorLength(first) / geometry.sourceMagnitudesCentimeters.F1;
  nearly(vectorLength(second) / scale, 4);
  nearly(vectorLength(resultant) / scale, 5);
  for (const label of ['3 cm', '4 cm', '5 cm']) assert.ok(svg.includes(label));
  const content = pageTextBlocks(page(59));
  assert.ok(content.includes('1 cm'));
  assert.ok(content.includes('20 N'));
  assert.ok(content.includes('F = 100 N'));
  assert.ok(content.includes('aria-label="F = 5 × 20 = 100 N"'));
  assert.equal((content.match(/class="formula-line"/g) ?? []).length, 4); // one scale line plus the three printed Pythagoras lines
  assert.deepEqual(PYTHAGORAS_LINES, [
    'F = √(F₁² + F₂²)',
    'F = √((60)² + (80)²)',
    'F = 100 N',
  ]);
  assert.equal((content.match(/data-source-line=/g) ?? []).length, 3);
});

test('page 59 component axes are orthogonal and the diagonal is the component sum', () => {
  const { geometry, svg } = DIAGRAMS['components-xy'];
  const first = vectorBetween(geometry.origin, geometry.firstTip);
  const second = vectorBetween(geometry.origin, geometry.secondTip);
  nearly(dot(first, second), 0);
  nearly(geometry.result.x, geometry.firstTip.x + geometry.secondTip.x - geometry.origin.x);
  nearly(geometry.result.y, geometry.firstTip.y + geometry.secondTip.y - geometry.origin.y);
  assert.ok(svg.includes('>x</text>'));
  assert.ok(svg.includes('>y</text>'));
});

test('rendered vectors are KaTeX expressions isolated as LTR with true accents and subscripts', () => {
  for (const markup of [V_F1, V_F2, V_F3, V_F, V_W, V_R, V_OM, V_OX, V_OY]) {
    assert.match(markup, /class="math math-inline" dir="ltr"/);
    assert.match(markup, /class="katex"/);
    assert.match(markup, /<annotation encoding="application\/x-tex">/);
  }
  const annotationOf = (markup) => markup.match(/<annotation encoding="application\/x-tex">([^<]*)<\/annotation>/)[1];
  assert.equal(annotationOf(V_F1), '\\vec{F}_{1}');
  assert.equal(annotationOf(V_F3), '\\vec{F}_{3}');
  assert.equal(annotationOf(V_F), '\\vec{F}');
  assert.equal(annotationOf(V_OM), '\\vec{\\mathrm{OM}}');
  assert.equal(annotationOf(V_OX), '\\vec{\\mathrm{OX}}');
  assert.equal(annotationOf(V_OY), '\\vec{\\mathrm{OY}}');
  const p60Reference = page(60).blocks.find((block) => block.type === 'platform' && block.title === 'مرجع شكل النشاط · الصفحة 60');
  assert.ok(p60Reference, 'p60 keeps its source-reference block for the unclear figure');
  assert.ok(p60Reference.html.includes(V_R));
  assert.ok(p60Reference.html.includes('Latin lowercase a'));
});

test('page 60 retains six experiment steps and uses a source-reference treatment for the unclear inclined-plane figure', () => {
  const selectedPage = page(60);
  const content = pageTextBlocks(selectedPage);
  assert.equal(listItemCount(content, 'experiment-list'), 6);
  assert.ok(selectedPage.blocks.some((block) => block.type === 'platform' && block.title === 'مرجع شكل النشاط · الصفحة 60'));
  assert.ok(selectedPage.blocks.some((block) => block.type === 'simulation' && block.id === 'force-resolution'));
  const figureReference = selectedPage.blocks.find((block) => block.type === 'platform' && block.title === 'مرجع شكل النشاط · الصفحة 60');
  assert.ok(figureReference.html.includes('Latin lowercase a'));
  assert.match(figureReference.html, /<annotation encoding="application\/x-tex">a<\/annotation>/);
  assert.doesNotMatch(figureReference.html, /α|θ/);
  assert.doesNotMatch(content, /محاكاة تفاعلية من المنصة/);
  assert.ok(!selectedPage.blocks.some((block) => block.type === 'diagram'));
});

test('pages 61–62 retain textbook questions without answers', () => {
  assert.equal((pageTextBlocks(page(61)).match(/<li class="question-item">/g) ?? []).length, 2);
  const content = pageTextBlocks(page(62));
  assert.equal((content.match(/<li class="question-item">/g) ?? []).length, 4);
  assert.ok(content.includes('\\{\\vec{F}_{1},\\ \\vec{F}_{2},\\ \\vec{F},\\ \\vec{F}_{3}\\}'), 'the printed set keeps its exact order F1, F2, F, F3');
  assert.ok(content.includes('المسألة الأولى:'));
  assert.ok(content.includes('المسألة الثانية:'));
  assert.doesNotMatch(content, /الإجابة الصحيحة هي|الحل النموذجي/);
});

test('textbook blocks keep platform simulations and assessments separate', () => {
  const allBookText = LESSON_PAGES.map(pageTextBlocks).join('\n');
  assert.doesNotMatch(allBookText, /محاكاة تفاعلية|نتيجة المحاكاة|منطقة المعلم|وحدة الاختبار/);
  assert.ok(allBookText.includes('أختبر نفسي:')); // textbook self-check remains source content
  assert.deepEqual(LESSON_PAGES.filter((item) => item.blocks.some((block) => block.type === 'simulation')).map((item) => item.page), [56, 57, 59, 60]);
});

const symbolGroups = (svg) => [...svg.matchAll(/<g class="force-symbol-group sym-\w+">([\s\S]*?)<\/g>/g)].map((match) => match[1]);
const symbolArrowY = (group) => Number(/<path class="force-vec-arrow"[^>]*d="M [-\d.]+ ([-\d.]+)/.exec(group)[1]);
const symbolLetterY = (group) => Number(/<text class="force-symbol"[^>]*y="([-\d.]+)"/.exec(group)[1]);

test('every force diagram labels its arrows with LTR force symbols and vector arrows above the letter', () => {
  const expected = {
    concurrent: [['F', '1'], ['F', '2'], ['w', null]],
    parallelogram: [['F', '1'], ['F', '2'], ['F', null]],
    'oblique-example': [['F', '1'], ['F', '2'], ['F', null]],
    'right-angle-resultant': [['F', '1'], ['F', '2'], ['F', null]],
    'components-xy': [['F', '1'], ['F', '2'], ['F', null]],
  };
  for (const [id, symbols] of Object.entries(expected)) {
    const groups = symbolGroups(DIAGRAMS[id].svg);
    assert.equal(groups.length, symbols.length, `${id} exposes one labelled symbol per force arrow`);
    groups.forEach((group, index) => {
      const [letter, subscript] = symbols[index];
      assert.match(group, new RegExp(`<text class="force-symbol"[^>]*direction="ltr">${letter}</text>`), `${id} symbol ${index} letter`);
      assert.match(group, /<path class="force-vec-arrow"[^>]*direction="ltr"|<path class="force-vec-arrow"/, `${id} symbol ${index} has a vector arrow`);
      assert.ok(symbolArrowY(group) < symbolLetterY(group), `${id} symbol ${index}: the vector arrow sits above the letter`);
      if (subscript === null) assert.doesNotMatch(group, /force-sub/);
      else assert.match(group, new RegExp(`<text class="force-sub"[^>]*direction="ltr">${subscript}</text>`), `${id} symbol ${index} subscript`);
    });
  }
});

test('ordinary calculations stay on a single horizontal line in the student lesson', () => {
  const p59 = pageTextBlocks(page(59));
  assert.match(p59, /aria-label="F = 5 × 20 = 100 N"/);
  assert.doesNotMatch(p59, /aria-label="F = 5 × 20"/);
  for (const pageNumber of [61, 62]) {
    const content = pageTextBlocks(page(pageNumber));
    assert.doesNotMatch(content, /math-display/, `p${pageNumber} keeps relations inline, not stacked`);
  }
  assert.match(pageTextBlocks(page(59)), /math-display/); // the printed three-line Pythagoras block remains a source stack
});

test('student entry imports every notation helper it references', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  const mathImport = /import \{([^}]*)\} from '\.\/math\.js';/.exec(source);
  assert.ok(mathImport, 'main.js imports the notation helpers it smoke-checks');
  for (const name of ['V_F1', 'V_F2', 'V_F', 'V_W']) {
    assert.ok(mathImport[1].includes(name), `main.js imports ${name}`);
  }
});

test('self-check interactivity is a student-page enhancement, never source text', () => {
  for (const pageNumber of [61, 62]) {
    const content = pageTextBlocks(page(pageNumber));
    assert.doesNotMatch(content, /<input|type="radio"/, `p${pageNumber} book text stays verbatim`);
    assert.match(content, /option-list/);
  }
});

test('textbook self-check answer key matches the printed option order and grades purely', () => {
  assert.deepEqual(Object.keys(SELF_CHECK_ANSWERS).sort(), ['61-1', '61-2', '62-1', '62-2', '62-3', '62-4']);
  const optionText = (pageNumber, itemOrdinal, letterIndex) => {
    const items = pageTextBlocks(page(pageNumber)).split('<li class="question-item">').slice(1);
    const options = [...items[itemOrdinal - 1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => match[1]);
    return options[letterIndex];
  };
  const letterIndex = { a: 0, b: 1, c: 2, d: 3 };
  const expectedPhrase = {
    '61-1': 'متوازي أضلاع', '61-2': 'مستطيل', '62-1': 'مربع',
    '62-2': '20 N', '62-3': '30 N', '62-4': '\\sqrt{',
  };
  for (const [key, entry] of Object.entries(SELF_CHECK_ANSWERS)) {
    const [pageNumber, ordinal] = key.split('-').map(Number);
    const text = optionText(pageNumber, ordinal, letterIndex[entry.correct]);
    assert.ok(text.includes(expectedPhrase[key]), `${key} key letter ${entry.correct} points at the printed option`);
    assert.equal(selfCheckAnswer(key), entry);
  }
  const graded = gradeSelfCheck({ '61-1': 'd', '61-2': 'a' }, SELF_CHECK_ANSWERS);
  assert.deepEqual(graded.find((row) => row.key === '61-1'), { key: '61-1', selected: 'd', correct: 'd', isCorrect: true, isAnswered: true });
  assert.equal(graded.find((row) => row.key === '61-2').isCorrect, false);
  assert.equal(gradeSelfCheck({}, SELF_CHECK_ANSWERS).every((row) => !row.isCorrect && !row.isAnswered), true);
});
