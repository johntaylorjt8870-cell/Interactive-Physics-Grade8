import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  COMPASS_DIRECTIONS,
  angularDifference,
  concurrentResultant,
  evaluateForceDrawing,
  formatNumber,
  inclineComponents,
  nearestCompassDirection,
  perpendicularResultant,
} from '../src/physics-in-life-physics.js';
import {
  checkPrediction,
  choosePrediction,
  createPredictionState,
  createProgress,
  createQuizState,
  markExperience,
  progressSummary,
  quizScore,
  resetPrediction,
  retryQuestion,
  selectChoice,
  selectPointOfEffect,
  submitQuestion,
} from '../src/physics-in-life-state.js';
import {
  DRAWING_CHALLENGES,
  EXAMPLES,
  GALLERY_GROUPS,
  OPENING_CHALLENGE,
  PREDICT_SCENARIO,
  STATIONS,
  STATION_QUIZZES,
  findExample,
} from '../src/physics-in-life-content.js';
import { PHYSICS_IN_LIFE_LESSONS, SECTION_META } from '../src/physics-in-life-lessons.js';
import {
  concurrentStationScene,
  drawingScene,
  exampleScene,
  inclineStationScene,
  openingScene,
  perpendicularStationScene,
  predictScene,
} from '../src/physics-in-life-scenes.js';
import { renderTeacherContent } from '../src/physics-in-life-teacher-content.js';

const near = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected} by more than ${tolerance}`);
};
const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const count = (text, needle) => [...text.matchAll(new RegExp(needle, 'g'))].length;

/* ------------------------------------------------------------------ physics */

test('concurrent resultant adds signed components and respects the parallelogram', () => {
  const result = concurrentResultant({ f1: 3, f2: 4, angle: 90, direction: 0 });
  near(result.components.x, 3);
  near(result.components.y, 4);
  near(result.magnitude, 5);
  near(result.directionDegrees, Math.atan2(4, 3) * 180 / Math.PI);
  assert.equal(result.isZero, false);
  assert.equal(result.theta, 90);
});

test('equal opposite forces cancel; unequal opposite forces do not', () => {
  const cancelled = concurrentResultant({ f1: 40, f2: 40, angle: 180, direction: 25 });
  assert.equal(cancelled.isZero, true);
  near(cancelled.magnitude, 0, 1e-9);
  assert.equal(cancelled.directionDegrees, null);
  assert.equal(cancelled.liesOnBisector, false);

  const remaining = concurrentResultant({ f1: 50, f2: 30, angle: 180, direction: 0 });
  near(remaining.magnitude, 20);
  near(remaining.directionDegrees, 0);
});

test('the resultant lies on the bisector only when the two magnitudes are equal', () => {
  const equal = concurrentResultant({ f1: 50, f2: 50, angle: 70, direction: 10 });
  assert.equal(equal.equalMagnitudes, true);
  assert.equal(equal.liesOnBisector, true);
  near(Math.abs(equal.deviationFromBisectorDegrees), 0, 1e-6);

  const unequal = concurrentResultant({ f1: 80, f2: 30, angle: 70, direction: 10 });
  assert.equal(unequal.liesOnBisector, false);
  assert.ok(unequal.deviationFromBisectorDegrees < 0, 'larger F1 pulls the resultant towards F1');

  const same = concurrentResultant({ f1: 10, f2: 80, angle: 70, direction: 10 });
  assert.ok(same.deviationFromBisectorDegrees > 0, 'larger F2 pulls the resultant towards F2');
});

test('a zero force leaves the other force as the resultant and a 180° pair can vanish', () => {
  const single = concurrentResultant({ f1: 55, f2: 0, angle: 120, direction: 20 });
  near(single.magnitude, 55);
  near(single.directionDegrees, 20);
  const empty = concurrentResultant({ f1: 0, f2: 0, angle: 65, direction: 20 });
  assert.equal(empty.isZero, true);
  assert.equal(empty.directionDegrees, null);
});

test('widening the angle with fixed equal magnitudes lowers the resultant monotonically', () => {
  const magnitudes = [0, 30, 60, 90, 120, 150, 180].map((angle) => concurrentResultant({ f1: 40, f2: 40, angle, direction: 0 }).magnitude);
  for (let index = 1; index < magnitudes.length; index += 1) {
    assert.ok(magnitudes[index] < magnitudes[index - 1], `angle step ${index} must reduce the resultant`);
  }
  near(magnitudes[0], 80);
  near(magnitudes[3], Math.sqrt(3200));
});

test('perpendicular forces use Pythagoras and stay consistent at the edges', () => {
  const classic = perpendicularResultant(6, 8);
  near(classic.magnitude, 10);
  near(classic.sumOfSquares, 100);
  near(classic.angleFromFirstDegrees, Math.atan2(8, 6) * 180 / Math.PI);

  const equal = perpendicularResultant(5, 5);
  near(equal.magnitude, 5 * Math.SQRT2);
  near(equal.angleFromFirstDegrees, 45);

  const single = perpendicularResultant(9, 0);
  near(single.magnitude, 9);
  near(single.angleFromFirstDegrees, 0);

  const none = perpendicularResultant(0, 0);
  assert.equal(none.isZero, true);
  assert.equal(none.angleFromFirstDegrees, null);

  const doubled = perpendicularResultant(12, 16);
  near(doubled.magnitude, 20);
});

test('the incline decomposes the weight with α measured from the horizontal', () => {
  const atThirty = inclineComponents(400, 30);
  near(atThirty.parallel, 200);
  near(atThirty.perpendicular, 400 * Math.cos(Math.PI / 6));
  near(atThirty.sumOfSquares, 400 * 400);

  const flat = inclineComponents(600, 0);
  near(flat.parallel, 0);
  near(flat.perpendicular, 600);

  const vertical = inclineComponents(600, 90);
  near(vertical.parallel, 600);
  near(vertical.perpendicular, 0);

  const fortyFive = inclineComponents(500, 45);
  near(fortyFive.parallel, fortyFive.perpendicular);
});

test('the parallel component grows and the perpendicular component falls from 0° to 90°', () => {
  let previousParallel = -1;
  let previousPerpendicular = Infinity;
  for (let angle = 0; angle <= 90; angle += 5) {
    const { parallel, perpendicular } = inclineComponents(700, angle);
    assert.ok(parallel >= previousParallel, `parallel must not fall at ${angle}°`);
    assert.ok(perpendicular <= previousPerpendicular, `perpendicular must not rise at ${angle}°`);
    previousParallel = parallel;
    previousPerpendicular = perpendicular;
  }
  near(previousParallel, 700);
  near(previousPerpendicular, 0);
});

test('compass directions cover the circle and tolerate near answers', () => {
  assert.equal(COMPASS_DIRECTIONS.length, 8);
  for (const direction of COMPASS_DIRECTIONS) {
    assert.equal(nearestCompassDirection(direction.degrees).id, direction.id);
  }
  assert.equal(nearestCompassDirection(52).id, 'north-east');
  assert.equal(nearestCompassDirection(215).id, 'south-west');
  near(angularDifference(350, 10), 20);
});

test('every drawing challenge is solvable with its authored key and fails a wrong point', () => {
  for (const challenge of DRAWING_CHALLENGES) {
    const direction = nearestCompassDirection(challenge.correctDirectionDegrees);
    const perfect = evaluateForceDrawing(challenge, {
      pointId: challenge.correctPointId,
      symbolId: challenge.correctSymbolId,
      classificationId: challenge.correctClassificationId,
      directionId: direction.id,
    });
    assert.equal(perfect.allCorrect, true, `${challenge.id} must be solvable`);
    assert.equal(perfect.correctCount, 4);

    const wrongPoint = challenge.points.find((point) => point.id !== challenge.correctPointId);
    const partial = evaluateForceDrawing(challenge, {
      pointId: wrongPoint.id,
      symbolId: challenge.correctSymbolId,
      classificationId: challenge.correctClassificationId,
      directionId: direction.id,
    });
    assert.equal(partial.point.ok, false);
    assert.equal(partial.correctCount, 3);

    const opposite = nearestCompassDirection(challenge.correctDirectionDegrees + 180);
    const wrongDirection = evaluateForceDrawing(challenge, {
      pointId: challenge.correctPointId,
      symbolId: challenge.correctSymbolId,
      classificationId: challenge.correctClassificationId,
      directionId: opposite.id,
    });
    assert.equal(wrongDirection.direction.status, 'wrong');
  }
});

test('formatNumber never leaks NaN into the interface', () => {
  assert.equal(formatNumber(10, 1), '10');
  assert.equal(formatNumber(10.26, 1), '10.3');
  assert.equal(formatNumber(Number.NaN), '0');
  assert.equal(formatNumber(Infinity), '0');
});

/* -------------------------------------------------------------------- state */

const questions = [
  {
    id: 'q1',
    prompt: 'one',
    choices: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
    correctId: 'a',
    explanation: 'because A',
  },
  {
    id: 'q2',
    prompt: 'two',
    choices: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
    correctId: 'b',
    explanation: 'because B',
  },
];

test('quiz answers are never graded before the explicit submit', () => {
  let state = createQuizState(questions);
  state = selectChoice(state, 'q1', 'b', questions);
  assert.equal(state.submitted.q1, undefined);
  assert.equal(quizScore(state, questions).correct, 0);
  assert.equal(quizScore(state, questions).answered, 0);

  state = submitQuestion(state, 'q1', questions);
  assert.equal(state.submitted.q1.correct, false);
  assert.equal(quizScore(state, questions).correct, 0);
  assert.equal(quizScore(state, questions).answered, 1);
});

test('submit requires a selection, retry clears one answer and the score is computed', () => {
  let state = createQuizState(questions);
  const untouched = submitQuestion(state, 'q1', questions);
  assert.equal(untouched, state);

  state = selectChoice(state, 'q1', 'a', questions);
  state = submitQuestion(state, 'q1', questions);
  assert.equal(state.submitted.q1.correct, true);

  state = selectChoice(state, 'q2', 'b', questions);
  state = submitQuestion(state, 'q2', questions);
  assert.deepEqual(quizScore(state, questions), {
    total: 2,
    answered: 2,
    correct: 2,
    percent: 100,
    complete: true,
  });

  state = retryQuestion(state, 'q1');
  assert.equal(state.submitted.q1, undefined);
  assert.equal(state.selected.q1, undefined);
  assert.equal(quizScore(state, questions).correct, 1);
  assert.equal(quizScore(state, questions).complete, false);
});

test('unknown choices and unknown questions are rejected loudly', () => {
  const state = createQuizState(questions);
  assert.throws(() => selectChoice(state, 'q1', 'nope', questions), RangeError);
  assert.throws(() => selectChoice(state, 'nope', 'a', questions), RangeError);
});

test('predictions are locked after checking and can be reset', () => {
  let state = createPredictionState();
  state = choosePrediction(state, 'near-larger');
  assert.equal(state.checked, false);
  state = checkPrediction(state, 'near-larger');
  assert.equal(state.correct, true);
  state = choosePrediction(state, 'bisector');
  assert.equal(state.selectedId, 'near-larger');
  state = resetPrediction();
  assert.deepEqual(state, { selectedId: null, checked: false, correct: null });
});

test('progress counts each experience once and never exceeds its total', () => {
  const ids = ['a', 'b', 'c'];
  let progress = createProgress(ids);
  progress = markExperience(progress, 'a', ids);
  progress = markExperience(progress, 'a', ids);
  progress = markExperience(progress, 'unknown', ids);
  assert.equal(progressSummary(progress).seen, 1);
  assert.equal(progressSummary(progress).percent, 33);
  progress = markExperience(progress, 'b', ids);
  progress = markExperience(progress, 'c', ids);
  assert.equal(progressSummary(progress).percent, 100);
});

test('a clicked point of effect is judged by its meaning, not its position', () => {
  const example = findExample('parachute');
  const correct = selectPointOfEffect(example, example.correctPointId);
  assert.equal(correct.correct, true);
  const wrong = selectPointOfEffect(example, 'canopy');
  assert.equal(wrong.correct, false);
  assert.match(wrong.message, /نقطة/);
  assert.equal(selectPointOfEffect(example, 'unknown'), null);
});

/* ------------------------------------------------------------------ content */

test('the section registry exposes the published lesson only', () => {
  assert.equal(SECTION_META.title, 'الفيزياء في حياتنا');
  assert.equal(PHYSICS_IN_LIFE_LESSONS.length, 1);
  const lesson = PHYSICS_IN_LIFE_LESSONS[0];
  assert.equal(lesson.status, 'available');
  assert.equal(lesson.href, './physics-in-life-lesson-1.html');
  assert.match(lesson.title, /القوى المتلاقية/);
});

test('the lesson has three stations, ten numbered examples and sixteen questions', () => {
  assert.equal(STATIONS.length, 3);
  assert.deepEqual(STATIONS.map((station) => station.id), ['concurrent', 'perpendicular', 'incline']);
  assert.equal(EXAMPLES.length, 10);
  assert.deepEqual(EXAMPLES.map((example) => example.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(new Set(EXAMPLES.map((example) => example.id)).size, 10);
  const total = Object.values(STATION_QUIZZES).reduce((sum, list) => sum + list.length, 0);
  assert.equal(total, 16);
  assert.deepEqual(Object.keys(STATION_QUIZZES), ['concurrent', 'perpendicular', 'incline']);
});

test('every authored question has a valid key, choices and an explanation', () => {
  for (const [stationId, list] of Object.entries(STATION_QUIZZES)) {
    for (const question of list) {
      assert.ok(question.prompt.length > 10, `${stationId}/${question.id} needs a prompt`);
      assert.ok(question.choices.length >= 2);
      assert.ok(question.choices.some((choice) => choice.id === question.correctId), `${question.id} key missing`);
      assert.ok(question.explanation.length > 20, `${question.id} needs an explanation`);
      assert.equal(new Set(question.choices.map((choice) => choice.id)).size, question.choices.length);
    }
  }
  assert.ok(OPENING_CHALLENGE.options.some((option) => option.id === OPENING_CHALLENGE.correctId));
  assert.ok(PREDICT_SCENARIO.options.some((option) => option.id === PREDICT_SCENARIO.correctId));
});

test('every life example has a scene, a point of effect, forces, an explanation and a quiz', () => {
  const groups = new Set(GALLERY_GROUPS.map((group) => group.id));
  for (const example of EXAMPLES) {
    assert.ok(groups.has(example.group), `${example.id} has an unknown group`);
    assert.ok(example.scene, `${example.id} has no scene`);
    assert.ok(example.points.length >= 3, `${example.id} needs clickable points`);
    assert.ok(example.points.some((point) => point.id === example.correctPointId), `${example.id} key missing`);
    assert.ok(example.forceLegend.length >= 2);
    assert.ok(example.explanation.length > 60);
    assert.ok(example.quiz.choices.some((choice) => choice.id === example.quiz.correctId));
    assert.ok(example.quiz.explanation.length > 30);
  }
});

test('scientific guard rails survive in the authored content', () => {
  const all = JSON.stringify({ EXAMPLES, STATION_QUIZZES, STATIONS, PREDICT_SCENARIO });
  assert.match(all, /منصف/);
  assert.match(all, /ليست.*رد الفعل|رد الفعل العمودي/);
  assert.match(all, /سرعة|سرعات/);
  const river = findExample('river');
  assert.match(river.explanation, /m\/s/);
  assert.match(river.note, /مخصّص للتمييز/);
  const slide = findExample('slide');
  assert.match(slide.explanation, /رد الفعل/);
  assert.match(slide.note, /الاحتكاك/);
});

test('the incline examples resolve their anchor points inside the scene', () => {
  for (const example of EXAMPLES.filter((item) => item.group === 'incline')) {
    const svg = exampleScene(example, { angle: example.interactiveAngle.initial });
    assert.doesNotMatch(svg, /undefined|NaN/);
    assert.equal(count(svg, 'data-point='), example.points.length);
  }
});

/* ------------------------------------------------------------------- scenes */

test('station scenes render without NaN, unresolved markers or missing hotspots', () => {
  const scenes = [
    concurrentStationScene(STATIONS[0].defaults, 'test-st1'),
    perpendicularStationScene(STATIONS[1].defaults, 'test-st2'),
    inclineStationScene({ ...STATIONS[2].defaults, showReaction: true }, 'test-st3'),
    openingScene(OPENING_CHALLENGE.defaults, 'test-open'),
    predictScene({ ...PREDICT_SCENARIO.defaults, reveal: true }, 'test-predict'),
  ];
  for (const svg of scenes) {
    assert.doesNotMatch(svg, /undefined|NaN/);
    const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
    for (const reference of svg.matchAll(/url\(#([^)]+)\)/g)) {
      assert.ok(ids.has(reference[1]), `unresolved marker ${reference[1]}`);
    }
    assert.match(svg, /<title/);
    assert.match(svg, /<desc/);
    assert.match(svg, /role="img"/);
  }
});

test('changing a force changes the drawn arrow and the displayed value together', () => {
  const small = concurrentStationScene({ f1: 20, f2: 20, angle: 60, direction: 0 }, 'test-a');
  const large = concurrentStationScene({ f1: 80, f2: 20, angle: 60, direction: 0 }, 'test-b');
  assert.notEqual(small, large);
  assert.match(small, /20 N/);
  assert.match(large, /80 N/);
  const resultSmall = concurrentResultant({ f1: 20, f2: 20, angle: 60, direction: 0 });
  const resultLarge = concurrentResultant({ f1: 80, f2: 20, angle: 60, direction: 0 });
  assert.ok(resultLarge.magnitude > resultSmall.magnitude);
  assert.match(large, new RegExp(`${formatNumber(resultLarge.magnitude, 1)} N`));
});

function tagBoxes(svg) {
  return [...svg.matchAll(/<g class="pil-vector-tag"[^>]*>\s*<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)]
    .map((match) => ({ x: Number(match[1]), y: Number(match[2]), w: Number(match[3]), h: Number(match[4]) }));
}

function viewBoxSize(svg) {
  const match = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return { w: Number(match[1]), h: Number(match[2]) };
}

function noteBoxes(svg) {
  return [...svg.matchAll(/<g class="pil-note-tag"[^>]*>\s*<rect x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)]
    .map((match) => ({ x: Number(match[1]), y: Number(match[2]), w: Number(match[3]), h: Number(match[4]) }));
}

function assertLabelsClean(svg, label) {
  const { w, h } = viewBoxSize(svg);
  const boxes = tagBoxes(svg);
  for (const box of boxes) {
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.w <= w + 0.5 && box.y + box.h <= h + 0.5, `${label}: tag outside the drawing`);
  }
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i];
      const b = boxes[j];
      const overlaps = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      assert.ok(!overlaps, `${label}: two force tags overlap`);
    }
  }
}

test('force labels stay inside the frame and never overlap at any slider value', () => {
  for (const f1 of [10, 40, 80]) {
    for (const f2 of [10, 40, 80]) {
      for (const angle of [0, 65, 180]) {
        for (const direction of [0, 15, 40]) {
          for (const scale of [1.6, 2.6]) {
            const label = `station 1 f1=${f1} f2=${f2} angle=${angle} dir=${direction} scale=${scale}`;
            const svg = concurrentStationScene({ f1, f2, angle, direction, scale, showConstruction: true }, 'box-a');
            assert.ok(!/NaN|undefined|Infinity/.test(svg), label);
            assertLabelsClean(svg, label);
          }
        }
      }
    }
  }
  for (const f1 of [10, 50, 80]) {
    for (const f2 of [10, 50, 80]) {
      const label = `station 2 f1=${f1} f2=${f2}`;
      const svg = perpendicularStationScene({ f1, f2 }, 'box-b');
      assert.ok(!/NaN|undefined|Infinity/.test(svg), label);
      assertLabelsClean(svg, label);
    }
  }
  for (const weight of [200, 600, 800]) {
    for (const angle of [0, 15, 30, 45, 60]) {
      for (const showReaction of [false, true]) {
        const label = `station 3 w=${weight} angle=${angle} r=${showReaction}`;
        const svg = inclineStationScene({ weight, angle, showReaction }, 'box-c');
        assert.ok(!/NaN|undefined|Infinity/.test(svg), label);
        assertLabelsClean(svg, label);
      }
    }
  }
  for (const f1 of [10, 40, 80]) {
    for (const f2 of [10, 40, 80]) {
      const label = `opening f1=${f1} f2=${f2}`;
      const svg = openingScene({ f1, f2, angle: 70, direction: 20, showResultant: true }, 'box-d');
      assert.ok(!/NaN|undefined|Infinity/.test(svg), label);
      assertLabelsClean(svg, label);
    }
  }
});

test('every gallery and drawing scene keeps its force labels readable', () => {
  for (const example of EXAMPLES) {
    const angles = example.group === 'incline' ? [0, 12, 28, 35, 50] : [null];
    for (const angle of angles) {
      const svg = exampleScene(example, { revealed: true, angle: angle ?? undefined, thumbnail: false }, `lab-${example.id}`);
      const label = `gallery ${example.id} angle=${angle}`;
      assert.ok(!/NaN|undefined|Infinity/.test(svg), label);
      assertLabelsClean(svg, label);
      for (const tag of tagBoxes(svg)) {
        for (const note of noteBoxes(svg)) {
          const overlaps = tag.x < note.x + note.w && tag.x + tag.w > note.x && tag.y < note.y + note.h && tag.y + tag.h > note.y;
          assert.ok(!overlaps, `${label}: a force tag covers an explanatory note`);
        }
      }
      const hotspots = [...svg.matchAll(/<g class="pil-hotspot[^"]*"[^>]*transform="translate\(([-\d.]+) ([-\d.]+)\)"/g)]
        .map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
      for (const hotspot of hotspots) {
        for (const box of [...tagBoxes(svg), ...noteBoxes(svg)]) {
          const nearestX = Math.max(box.x, Math.min(hotspot.x, box.x + box.w));
          const nearestY = Math.max(box.y, Math.min(hotspot.y, box.y + box.h));
          assert.ok(Math.hypot(hotspot.x - nearestX, hotspot.y - nearestY) >= 22, `${label}: a picker point covers a label`);
        }
      }
    }
  }
  for (const challenge of DRAWING_CHALLENGES) {
    const svg = drawingScene(challenge, {
      challenge,
      submitted: true,
      answer: { pointId: challenge.correctPointId, directionId: 'north-east' },
    }, `lab-${challenge.id}`);
    const label = `drawing ${challenge.id}`;
    assert.ok(!/NaN|undefined|Infinity/.test(svg), label);
    assertLabelsClean(svg, label);
  }
});

test('the drawing scale resizes the picture without touching the physics', () => {
  const state = { f1: 60, f2: 45, angle: 65, direction: 15 };
  const normal = concurrentStationScene({ ...state, scale: 2.6 }, 'scale-a');
  const small = concurrentStationScene({ ...state, scale: 1.6 }, 'scale-b');
  assert.notEqual(normal, small);

  const result = concurrentResultant(state);
  const label = `${formatNumber(result.magnitude, 1)} N`;
  assert.match(normal, new RegExp(label));
  assert.match(small, new RegExp(label));

  const xOf = (svg) => Number(svg.match(/<line class="pil-vector[^"]*" x1="[\d.]+" y1="[\d.]+" x2="([\d.]+)"/)[1]);
  assert.ok(xOf(normal) > xOf(small), 'the larger scale must draw a longer arrow');

  // An unknown scale falls back to the station default instead of breaking the drawing.
  const fallback = concurrentStationScene({ ...state, scale: 99 }, 'scale-c');
  assert.equal(fallback.replaceAll('scale-c', 'scale-a'), normal);
});

test('equal opposite forces draw a zero resultant instead of a fake arrow', () => {
  const svg = concurrentStationScene({ f1: 40, f2: 40, angle: 180, direction: 30 }, 'test-zero');
  assert.match(svg, /pil-zero-resultant/);
  assert.match(svg, /محصلة القوتين صفر/);
  assert.ok(!svg.includes('pil-resultant-vector'), 'a zero resultant must not be drawn as an arrow');
  assert.ok(!svg.includes('marker-end="url(#test-zero-resultant)"'), 'no resultant arrowhead at zero');
});

test('the incline scene values follow the angle, and R is never merged with w⊥', () => {
  const flat = inclineStationScene({ weight: 600, angle: 0, showReaction: true }, 'test-flat');
  const steep = inclineStationScene({ weight: 600, angle: 50, showReaction: true }, 'test-steep');
  assert.match(flat, /0 N/);
  assert.match(flat, /600 N/);
  assert.notEqual(flat, steep);
  assert.match(steep, /R: رد فعل السطح/);
  const components = inclineComponents(600, 50);
  assert.match(steep, new RegExp(`${formatNumber(components.parallel, 1)} N`));
  assert.match(steep, new RegExp(`${formatNumber(components.perpendicular, 1)} N`));
});

test('every example scene and drawing scene renders cleanly with its hotspots', () => {
  for (const example of EXAMPLES) {
    const svg = exampleScene(example, { revealed: true });
    assert.doesNotMatch(svg, /undefined|NaN/);
    assert.equal(count(svg, 'data-point='), example.points.length, `${example.id} hotspot count`);
    const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
    for (const reference of svg.matchAll(/url\(#([^)]+)\)/g)) {
      assert.ok(ids.has(reference[1]), `${example.id}: unresolved ${reference[1]}`);
    }
  }
  for (const challenge of DRAWING_CHALLENGES) {
    const svg = drawingScene(challenge, {
      answer: { pointId: challenge.correctPointId, directionId: 'north-east' },
      challenge,
      submitted: true,
    });
    assert.doesNotMatch(svg, /undefined|NaN/);
    assert.equal(count(svg, 'data-point='), challenge.points.length);
    assert.match(svg, /سهمك/);
  }
});

/* ----------------------------------------------------------- pages & build */

test('the lesson page loads only the section bundle and exposes every live region', async () => {
  const page = await read('../physics-in-life-lesson-1.html');
  assert.match(page, /<html lang="ar" dir="rtl">/);
  assert.match(page, /href="\.\/vendor\/katex\/katex\.min\.css"/);
  assert.match(page, /src="\.\/src\/physics-in-life-lesson-1\.js"/);
  assert.match(page, /href="\.\/src\/physics-in-life\.css"/);
  assert.match(page, /id="pil-scene-concurrent"/);
  assert.match(page, /id="pil-scene-perpendicular"/);
  assert.match(page, /id="pil-scene-incline"/);
  assert.match(page, /id="pil-opening-choices"/);
  assert.match(page, /id="pil-predict-scene"/);
  assert.match(page, /id="pil-gallery-groups"/);
  assert.match(page, /id="pil-drawing-scene"/);
  assert.match(page, /href="\.\/physics-in-life-teacher\.html"/);
  assert.match(page, /role="tablist"/);
  assert.equal((page.match(/role="tabpanel"/g) ?? []).length, 3);
  assert.doesNotMatch(page, /somer173/);
});

test('the section landing page renders cards from the registry and links the lesson', async () => {
  const [page, index, cardsSource, build] = await Promise.all([
    read('../physics-in-life.html'),
    read('../index.html'),
    read('../src/physics-in-life-index.js'),
    read('../scripts/build.mjs'),
  ]);
  assert.match(page, /src="\.\/src\/physics-in-life-index\.js"/);
  assert.match(page, /id="pil-lesson-cards"/);
  assert.match(page, /href="\.\/physics-in-life-lesson-1\.html"/);
  assert.match(cardsSource, /PHYSICS_IN_LIFE_LESSONS/);
  assert.match(index, /href="\.\/physics-in-life\.html"[\s\S]{0,120}الفيزياء في حياتنا/);
  assert.match(index, /<h2 id="pil-home-heading">الفيزياء في حياتنا<\/h2>/);
  assert.match(build, /physics-in-life-lesson-1\.html/);
  assert.match(build, /physics-in-life-teacher\.html/);
  assert.match(build, /'physics-in-life\.html'/);
});

test('the teacher area reuses the existing verifier and never prints the passphrase', async () => {
  const [page, script, auth] = await Promise.all([
    read('../physics-in-life-teacher.html'),
    read('../src/physics-in-life-teacher.js'),
    read('../src/teacher-auth.js'),
  ]);
  assert.match(page, /id="teacher-login"/);
  assert.match(page, /id="teacher-workspace"/);
  assert.match(script, /verifyTeacherPassword/);
  assert.match(script, /mountTeacherArea/);
  assert.match(script, /physics-in-life-teacher-content\.js/);
  assert.doesNotMatch(page, /somer173/);
  assert.doesNotMatch(script, /somer173/);
  assert.doesNotMatch(auth, /somer173/);
  assert.match(auth, /PBKDF2/);
});

test('teacher content renders every key without KaTeX errors', () => {
  const html = renderTeacherContent();
  assert.doesNotMatch(html, /katex-error|undefined|NaN/);
  assert.match(html, /حلول الاختبارات القصيرة/);
  assert.match(html, /مفاتيح معرض الحياة/);
  assert.match(html, /أنت رسّام القوى/);
  assert.match(html, /لا توجد نتائج محفوظة/);
  for (const station of STATIONS) {
    assert.ok(html.includes(station.shortTitle), `missing station ${station.id}`);
  }
  for (const example of EXAMPLES) {
    assert.ok(html.includes(example.title), `missing example ${example.id}`);
  }
  assert.ok(count(html, 'class="pil-teacher-live"') >= 2);
});

test('the section stylesheet keeps equations scrollable and never breaks RTL isolation', async () => {
  const css = await read('../src/physics-in-life.css');
  assert.match(css, /\.pil-page \.katex-display \{ overflow-x: auto; overflow-y: hidden;/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\.pil-f1|--pil-f1: #16706b/);
  assert.match(css, /\.pil-workbench \{/);
});
