import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { LESSON_PAGES, PYTHAGORAS_LINES, pageTextBlocks } from '../src/lesson-content.js';
import { DIAGRAMS } from '../src/diagrams.js';
import { SELF_CHECK_ANSWERS, selfCheckAnswer } from '../src/self-check-answers.js';
import { gradeSelfCheck } from '../src/self-check.js';
import { PRACTICE_DECK, PRACTICE_LEVELS, TEXTBOOK_PROBLEMS } from '../src/lesson-1-practice-data.js';
import {
  V_F1,
  V_F2,
  V_F3,
  V_F,
  V_F_PRIME,
  V_W,
  V_R,
  V_OM,
  V_OX,
  V_OY,
  LATIN_A,
} from '../src/math.js';

const page = (number) => LESSON_PAGES.find((item) => item.page === number);
const vectorBetween = (start, end) => ({ x: end.x - start.x, y: end.y - start.y });
const vectorLength = (vector) => Math.hypot(vector.x, vector.y);
const dot = (first, second) => first.x * second.x + first.y * second.y;
const nearly = (actual, expected, tolerance = 0.02) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
};
const svgTextPosition = (svg, text) => {
  const match = [...svg.matchAll(/<text x="([^"]+)" y="([^"]+)"[^>]*>([^<]*)<[/]text>/g)]
    .find(([, , , content]) => content === text);
  assert.ok(match, `Missing SVG text: ${text}`);
  return { x: Number(match[1]), y: Number(match[2]) };
};

test('Phase 1 source audit document and all 8 textbook source images are archived in docs/sources/unit1-lesson1', async () => {
  assert.equal(existsSync(new URL('../docs/unit-1-lesson-1-source-audit.md', import.meta.url)), true);
  for (let i = 1; i <= 8; i += 1) {
    assert.equal(
      existsSync(new URL(`../docs/sources/unit1-lesson1/image-${i}.png`, import.meta.url)),
      true,
      `Missing archived source scan image-${i}.png`,
    );
  }
  const auditMd = await readFile(new URL('../docs/unit-1-lesson-1-source-audit.md', import.meta.url), 'utf8');
  assert.match(auditMd, /لوح الرّبائع المغناطيسي/);
  assert.match(auditMd, /55/);
  assert.match(auditMd, /62/);
});

test('lesson navigation follows 8 self-contained stages mapped to textbook pages 55 through 62', () => {
  assert.deepEqual(LESSON_PAGES.map((item) => item.page), [55, 56, 57, 58, 59, 60, 61, 62]);
  for (const stage of LESSON_PAGES) {
    assert.ok(stage.stageTitle && stage.stageTitle.length > 4, `Stage ${stage.page} has stageTitle`);
    assert.ok(stage.summary && stage.summary.length > 20, `Stage ${stage.page} has summary`);
    assert.ok(Array.isArray(stage.objectives) && stage.objectives.length >= 3, `Stage ${stage.page} has learning objectives`);
    const joined = stage.blocks.join('\n');
    assert.match(joined, /curriculum-tag-book/, `Stage ${stage.page} distinguishes textbook content`);
  }
});

test('Stage 1 (p55) teaches force as a 4-element vector with scale reading and covers the parachutist inquiry', () => {
  const content = pageTextBlocks(page(55));
  for (const phrase of [
    'نقطة التأثير',
    'الحامل',
    'الجهة',
    'الشدة',
    'مقياس رسم',
    'القوى المتلاقية',
    'تحليل القوة',
    'المظلّي',
  ]) {
    assert.ok(content.includes(phrase), `Missing Stage 1 concept: ${phrase}`);
  }
  const html = page(55).blocks.join('\n');
  assert.equal((html.match(/data-inquiry-card/g) ?? []).length, 3, '3 interactive parachutist inquiry questions');

  const anatomySvg = DIAGRAMS['force-vector-anatomy'].svg;
  const pointCallout = svgTextPosition(anatomySvg, '١. نقطة التأثير O (بداية السهم)');
  const strengthCallout = svgTextPosition(anatomySvg, '٢. الشدة: طول السهم × المقياس (20 N)');
  assert.ok(pointCallout.y - strengthCallout.y >= 40, 'p55 vector callouts have clear vertical separation');
  assert.ok(pointCallout.y < 370, 'p55 point-of-impact callout remains within the SVG viewBox');
});

test('Stage 2 (p56) includes audited magnetic spring-board tools, definition, and concurrent vs non-concurrent comparison', () => {
  const content = pageTextBlocks(page(56));
  assert.ok(content.includes('لوح الربائع المغناطيسي'));
  assert.ok(content.includes('القوى المتلاقية: هي القوى التي تتلاقى حواملها في نقطة واحدة.'));
  assert.doesNotMatch(content, /غير محسوم|موضع الصورة الأصلية/);
  const comparisonCaption = page(56).blocks.join('\n');
  assert.match(comparisonCaption, /ثلاث حوامل تتقاطع اثنين اثنين في ثلاث نقاط مختلفة/);
  assert.doesNotMatch(comparisonCaption, /على اليسار قوى متوازية منفصلة الحوامل/);

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

test('Stage 3–5 diagrams preserve exact parallelogram, 60-degree 4:3, and 3-4-5 right-angle vector geometry', () => {
  const pgram = DIAGRAMS.parallelogram;
  nearly(pgram.geometry.result.x, pgram.geometry.firstTip.x + pgram.geometry.secondTip.x - pgram.geometry.origin.x);
  nearly(pgram.geometry.result.y, pgram.geometry.firstTip.y + pgram.geometry.secondTip.y - pgram.geometry.origin.y);

  const oblique = DIAGRAMS['oblique-example'];
  const first = vectorBetween(oblique.geometry.origin, oblique.geometry.firstTip);
  const second = vectorBetween(oblique.geometry.origin, oblique.geometry.secondTip);
  const firstLen = vectorLength(first);
  const secondLen = vectorLength(second);
  const angle = Math.acos(dot(first, second) / (firstLen * secondLen)) * 180 / Math.PI;
  nearly(firstLen / oblique.geometry.scalePixelsPerCentimeter, 4);
  nearly(secondLen / oblique.geometry.scalePixelsPerCentimeter, 3);
  nearly(angle, 60, 0.05);

  const right = DIAGRAMS['right-angle-resultant'];
  const rFirst = vectorBetween(right.geometry.origin, right.geometry.firstTip);
  const rSecond = vectorBetween(right.geometry.origin, right.geometry.secondTip);
  const rDiag = vectorBetween(right.geometry.origin, right.geometry.result);
  nearly(dot(rFirst, rSecond), 0);
  const scale = vectorLength(rFirst) / right.geometry.sourceMagnitudesCentimeters.F1;
  nearly(vectorLength(rSecond) / scale, 4);
  nearly(vectorLength(rDiag) / scale, 5);
  assert.deepEqual(PYTHAGORAS_LINES, [
    'F = √(F₁² + F₂²)',
    'F = √((60)² + (80)²)',
    'F = 100 N',
  ]);
});

test('all 13 custom SVG diagrams exist with titles, accessible roles, and valid problem scale geometry', () => {
  const expectedKeys = [
    'force-vector-anatomy',
    'parachutist-vectors',
    'concurrent',
    'concurrent-comparison',
    'equilibrium-parallelogram',
    'parallelogram',
    'oblique-example',
    'quadrilateral-cases',
    'right-angle-resultant',
    'components-xy',
    'inclined-plane',
    'problem1-scale',
    'problem2-scale',
  ];
  for (const key of expectedKeys) {
    assert.ok(DIAGRAMS[key], `Missing diagram key: ${key}`);
    assert.match(DIAGRAMS[key].svg, /<svg[^>]+role="img"/, `${key} SVG has role="img"`);
    assert.match(DIAGRAMS[key].svg, /<title/, `${key} SVG has accessible <title>`);
  }

  // Verify Problem 1 scale diagram: F' is exact opposite of F with equal length (5 cm vs 3 cm and 4 cm legs)
  const p1 = DIAGRAMS['problem1-scale'].geometry;
  const vF = vectorBetween(p1.origin, p1.fTip);
  const vFPrime = vectorBetween(p1.origin, p1.fPrimeTip);
  nearly(vF.x + vFPrime.x, 0);
  nearly(vF.y + vFPrime.y, 0);
  nearly(dot(vectorBetween(p1.origin, p1.f1Tip), vectorBetween(p1.origin, p1.f2Tip)), 0);
  const p1F1Measurement = svgTextPosition(DIAGRAMS['problem1-scale'].svg, '3 cm (9 N)');
  assert.equal(p1F1Measurement.x, p1.origin.x + 52);
  assert.equal(p1F1Measurement.y, p1.origin.y + 50, 'p62 problem 1 measurement clears O and its label');

  const p2 = DIAGRAMS['problem2-scale'].geometry;
  const p2F1 = vectorBetween(p2.origin, p2.f1Tip);
  const p2F2 = vectorBetween(p2.origin, p2.f2Tip);
  const p2Result = vectorBetween(p2.origin, p2.fTip);
  nearly(dot(p2F1, p2F2), 0, 0.01);
  nearly(vectorLength(p2F1), 132);
  nearly(vectorLength(p2F2), 176);
  nearly(vectorLength(p2Result), 220);
  nearly(p2F1.x + p2F2.x, p2Result.x);
  nearly(p2F1.y + p2F2.y, p2Result.y);
  const p2F1Measurement = svgTextPosition(DIAGRAMS['problem2-scale'].svg, '3 cm (30 N)');
  assert.equal(p2F1Measurement.x, p2.origin.x - 90);
  assert.equal(p2F1Measurement.y, p2.origin.y - 7, 'p62 problem 2 measurement is offset clear of the F1 shaft');

  const inclineText = [...DIAGRAMS['inclined-plane'].svg.matchAll(/<text[^>]*>([^<]*)<[/]text>/g)]
    .map(([, text]) => text)
    .join(' ');
  assert.doesNotMatch(inclineText, /الشكل الناتج من تحليل الثقل|مستطيل قطره w وضلعاه/);
  assert.match(DIAGRAMS['inclined-plane'].description, /مستطيل قطره w/);
});

test('KaTeX vector helpers render LTR-isolated math including prime equilibrant notation', () => {
  for (const markup of [V_F1, V_F2, V_F3, V_F, V_F_PRIME, V_W, V_R, V_OM, V_OX, V_OY, LATIN_A]) {
    assert.match(markup, /class="math math-inline" dir="ltr"/);
    assert.match(markup, /class="katex"/);
    assert.match(markup, /<annotation encoding="application\/x-tex">/);
  }
  assert.match(V_F_PRIME, /\\vec\{F\}(?:'|&#x27;)/);
  assert.match(V_F_PRIME, /′/);
});

test('self-check answer key preserves grading contract and provides progressive non-spoiling hints and option-specific feedback', () => {
  assert.deepEqual(Object.keys(SELF_CHECK_ANSWERS).sort(), ['61-1', '61-2', '62-1', '62-2', '62-3', '62-4']);
  for (const [key, entry] of Object.entries(SELF_CHECK_ANSWERS)) {
    assert.equal(selfCheckAnswer(key), entry);
    assert.equal(entry.hints.length, 2, `${key} has 2 progressive hints`);
    for (const hint of entry.hints) {
      assert.doesNotMatch(hint, new RegExp(`\\b${entry.correct}\\)`), `${key} hint must not leak option letter`);
    }
    assert.deepEqual(Object.keys(entry.optionFeedback).sort(), ['a', 'b', 'c', 'd'], `${key} explains all 4 options`);
  }

  const graded = gradeSelfCheck({ '61-1': 'd', '61-2': 'a' }, SELF_CHECK_ANSWERS);
  assert.deepEqual(graded.find((row) => row.key === '61-1'), {
    key: '61-1',
    selected: 'd',
    correct: 'd',
    isCorrect: true,
    isAnswered: true,
  });
  assert.equal(graded.find((row) => row.key === '61-2').isCorrect, false);
});

test('p62 written problem workbenches diagnose common calculation misconceptions and present 8-part worked solutions', () => {
  assert.equal(TEXTBOOK_PROBLEMS.length, 2);
  const [prob1, prob2] = TEXTBOOK_PROBLEMS;
  assert.equal(prob1.interactiveSteps[0].expected, 9);
  assert.equal(prob1.interactiveSteps[1].expected, 15);
  assert.equal(prob1.interactiveSteps[2].expected, 3);
  assert.match(prob1.interactiveSteps[0].diagnose(3), /طرحت/);
  assert.match(prob1.interactiveSteps[0].diagnose(81), /الجذر التربيعي/);
  assert.equal((prob1.workedSolutionHtml.match(/class="worked-step-card"/g) ?? []).length, 8);

  assert.equal(prob2.interactiveSteps[0].expected, 50);
  assert.equal(prob2.interactiveSteps[1].expected, 5);
  assert.match(prob2.interactiveSteps[0].diagnose(70), /جمعت/);
  assert.equal((prob2.workedSolutionHtml.match(/class="worked-step-card"/g) ?? []).length, 8);
});

test('4-level formative practice deck has 10 progressive exercises with 2-level hints and option-specific feedback', () => {
  assert.equal(PRACTICE_LEVELS.length, 4);
  assert.equal(PRACTICE_DECK.length, 10);
  for (const level of PRACTICE_LEVELS) {
    assert.ok(PRACTICE_DECK.some((item) => item.levelId === level.id), `Level ${level.id} has items`);
  }
  for (const item of PRACTICE_DECK) {
    assert.equal(item.hints.length, 2, `${item.id} has 2 progressive hints`);
    assert.equal(item.options.length, 4, `${item.id} has 4 options`);
    assert.ok(item.options.some((opt) => opt.id === item.correct), `${item.id} has valid correct option`);
    for (const opt of item.options) {
      assert.ok(opt.feedback.length > 20, `${item.id}/${opt.id} has diagnostic feedback`);
    }
  }
});
