import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { renderTeacherContent } from '../src/unit-questions-teacher-content.js';
import {
  UNIT_QUESTIONS_META,
  UNIT_QUESTIONS_PAGE_AUDIT,
  UNIT_QUESTIONS_SUBPARTS,
  UNIT_QUESTION_SOURCE_BLOCKS,
  computeOverallSummary,
  computeQuestionGroupSummary,
  createInitialUnitQuestionsState,
  defaultResponseFor,
  evaluateSubpart,
  getSubpartStatus,
  parseFlexibleNumber,
  renderProblemOneDiagram,
  renderProblemTwoDiagram,
  renderQuestionTwoDiagram,
  renderUnitQuestionSourceDisclosure,
  renderUnitQuestions,
} from '../src/unit-questions-content.js';
import { verifyTeacherPassword } from '../src/teacher-auth.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const studentMarkup = renderUnitQuestions();
const teacherMarkup = renderTeacherContent();

function sourceSubparts(markup) {
  return [...markup.matchAll(/data-source-subpart="([^"]+)"/g)].map((match) => match[1]);
}

test('Course Home presents Unit Questions as a separate Unit 1 review, not another lesson or test', async () => {
  const home = await read('../index.html');
  const unitPanel = home.slice(home.indexOf('<div class="unit-panel">'), home.indexOf('<div class="unit-panel">', home.indexOf('<div class="unit-panel">') + 10));
  assert.match(home, /class="unit-review-entry"[^]*أسئلة الوحدة الأولى/);
  assert.match(home, /href="\.\/unit-questions\.html"/);
  assert.match(home, /مراجعة شاملة لأسئلة الكتاب الأصلية/);
  assert.equal((home.match(/class="lesson-entry"/g) ?? []).length, 6);
  assert.equal((unitPanel.match(/class="lesson-entry"/g) ?? []).length, 2);
  assert.match(unitPanel, /class="unit-review-entry"/);
  assert.match(home, /href="\.\/unit2-lesson-3\.html"/);
  assert.doesNotMatch(home, /href="\.\/lesson-3\.html"/);
  assert.match(home, /unit-2-test\.html/);
});

test('standalone Student Area has the correct Unit 1 identity, page references, KaTeX, and no teacher import', async () => {
  const [page, boot, contentMod, css] = await Promise.all([
    read('../unit-questions.html'),
    read('../src/unit-questions.js'),
    read('../src/unit-questions-content.js'),
    read('../src/unit-questions.css'),
  ]);
  assert.match(page, /<html lang="ar" dir="rtl">/);
  assert.match(page, /<title>أسئلة الوحدة الأولى — الحركة والقوى/);
  assert.match(page, /مراجعة شاملة لأسئلة الوحدة الأولى من الكتاب/);
  assert.match(page, /صفحتا <bdi dir="ltr">71–72<\/bdi>/);
  assert.match(page, /href="\.\/unit-1-test\.html"/);
  assert.match(page, /href="\.\/unit-questions-teacher\.html"/);
  assert.match(page, /vendor\/katex\/katex\.min\.css/);
  assert.match(page, /src="\.\/src\/unit-questions\.js"/);
  assert.match(boot, /renderUnitQuestions/);
  assert.doesNotMatch(boot, /teacher-content|teacher-auth|teacher-solutions|somer173/);
  assert.doesNotMatch(contentMod, /teacher-content|teacher-auth|somer173/);
  assert.match(css, /unicode-bidi:\s*isolate/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('Source Audit and source images inventory both pages, three main questions, all 11 subparts, and no printed figure/table', async () => {
  await access(new URL('../docs/source-images/unit1-questions-p71.png', import.meta.url));
  await access(new URL('../docs/source-images/unit1-questions-p72.png', import.meta.url));
  assert.deepEqual(UNIT_QUESTIONS_META.sourcePages, [71, 72]);
  assert.equal(UNIT_QUESTIONS_META.mainQuestionCount, 3);
  assert.equal(UNIT_QUESTIONS_META.totalSubparts, 11);
  assert.equal(UNIT_QUESTIONS_SUBPARTS.length, 11);
  assert.deepEqual(UNIT_QUESTIONS_META.requestedSubparts, {
    questionOne: 4, questionTwo: 1, problemOne: 3, problemTwo: 3,
  });
  assert.deepEqual(Object.keys(UNIT_QUESTIONS_PAGE_AUDIT), ['71', '72']);
  for (const page of Object.values(UNIT_QUESTIONS_PAGE_AUDIT)) {
    assert.match(page.drawings, /لا يوجد رسم مطبوع/);
    assert.match(page.tables, /لا توجد جداول/);
    assert.ok(page.values.length > 0);
  }
  assert.match(UNIT_QUESTIONS_PAGE_AUDIT[71].drawings, /السؤالان 2 و3/);
  assert.match(UNIT_QUESTIONS_PAGE_AUDIT[72].drawings, /المسألة الأولى/);
});

test('all 3 source questions, 16 MCQ options, and 11 interactive subparts preserve exact printed order across pages 71–72', () => {
  const questionOrder = [...studentMarkup.matchAll(/data-question-order="([1-3])"/g)].map((match) => Number(match[1]));
  assert.deepEqual(questionOrder, [1, 2, 3]);
  assert.deepEqual(sourceSubparts(studentMarkup), [
    '1.1', '1.2', '1.3', '1.4', '2.1', '3.1.1', '3.1.2', '3.1.3', '3.2.1', '3.2.2', '3.2.3',
  ]);
  assert.equal((studentMarkup.match(/class="unit-question-option\b/g) ?? []).length, 16);
  for (const label of ['a.', 'b.', 'c.', 'd.']) {
    const count = (studentMarkup.match(new RegExp(`<bdi class="unit-option-label" dir="ltr">${label.replace('.', '\\.')}</bdi>`, 'g')) ?? []).length;
    assert.equal(count, 4, `expected 4 options labelled ${label}`);
  }
  for (const phrase of [
    'اخترْ الإجابة الصّحيحة لكلّ ممّا يأتي:',
    'قوّتان شاقوليتان نحو الأسفل',
    'قوّتان متلاقيتان متعامدتان متساويتان بالشدّة',
    'قوّتان شاقوليتان بجهتين متعاكستين',
    'البُعْد بين حاملَيهما',
    'قوتان مُتعامدتان شدّة القوّة الأولى',
    'حدِّدْ بالكتابة والرّسم عناصر مُحصّلة قوّتين شاقوليتين مختلفتين بالشدة',
    'حلّ المسألتين الآتيتين:',
    'ارسمْ شكلاً يُمَثِّل القوّتين والمحصّلة بمقياس رسم مناسب.',
    'المعاكسة مباشرة للمحصّلة',
    'في طرفي ساق معدنيّة خفيفة طولها',
    'احسبْ شدّة كلّ من القوّتين.',
  ]) assert.ok(studentMarkup.includes(phrase), `source wording missing: ${phrase}`);
  assert.match(studentMarkup, /data-source-page="p71"/);
  assert.match(studentMarkup, /data-source-page="p72"/);
  assert.match(studentMarkup, /class="unit-page-continuation"[^]*p72/);
  assert.match(UNIT_QUESTION_SOURCE_BLOCKS.questionThreePage72, /<ol class="unit-written-parts" start="2">/);
});

test('source values, corrected Q1.2 radicals, units, subscripts, vectors, and RTL/LTR boundaries render through KaTeX without errors', async () => {
  assert.doesNotMatch(studentMarkup, /katex-error/);
  assert.doesNotMatch(teacherMarkup, /katex-error/);

  for (const token of [
    'F_{1}=8~\\mathrm{N}', 'F_{2}=12~\\mathrm{N}', '0~\\mathrm{N}', '4~\\mathrm{N}', '20~\\mathrm{N}', '96~\\mathrm{N}',
    'F_{1}=F_{2}', 'F=2F_{1}', 'F=\\sqrt{2F_{1}}', 'F=2\\sqrt{F_{1}}', 'F=F_{1}\\sqrt{2}',
    'd_{1}=2~\\mathrm{cm}', 'd_{2}=6~\\mathrm{cm}', '12~\\mathrm{cm}', '8~\\mathrm{cm}', '4~\\mathrm{cm}', '3~\\mathrm{cm}',
    'F_{1}=6~\\mathrm{N}', 'F=10~\\mathrm{N}', '2~\\mathrm{N}', '6~\\mathrm{N}', '14~\\mathrm{N}', '8~\\mathrm{N}',
    '80~\\mathrm{N}', '100~\\mathrm{N}', '\\vec{F}=150~\\mathrm{N}', '1~\\mathrm{m}', '30~\\mathrm{cm}',
    '\\vec{F}_{1}', '\\vec{F}_{2}',
  ]) assert.ok(studentMarkup.includes(`<annotation encoding="application/x-tex">${token}</annotation>`), `missing KaTeX source ${token}`);

  assert.match(studentMarkup, /aria-label="vector F prime"[^]*<annotation encoding="application\/x-tex">\\vec\{F\}&#x27;<\/annotation>/);

  // Verify Q1.2 option b is √(2F₁) and option d is F₁√2 in exact order
  const q12 = UNIT_QUESTIONS_SUBPARTS.find((item) => item.id === '1.2');
  assert.equal(q12.correct, 'd');
  assert.match(q12.options[1].html, /F=\\sqrt\{2F_\{1\}\}/);
  assert.match(q12.options[3].html, /F=F_\{1\}\\sqrt\{2\}/);

  const [sharedCss, questionCss, math] = await Promise.all([
    read('../src/styles.css'), read('../src/unit-questions.css'), import('../src/math.js'),
  ]);
  assert.match(studentMarkup, /class="math math-inline" dir="ltr" role="math"/);
  assert.match(sharedCss, /\.math\s*\{\s*direction:\s*ltr;\s*unicode-bidi:\s*isolate;/);
  assert.match(questionCss, /\.unit-book-question \[dir="ltr"\],\s*\.unit-book-question \.math\s*\{\s*direction:\s*ltr;\s*unicode-bidi:\s*isolate;/);
  const vec = math.vector('F', '1');
  assert.match(vec, /<annotation encoding="application\/x-tex">\\vec\{F\}_\{1\}<\/annotation>/);
});

test('flexible numeric parser supports ASCII, Arabic-Indic digits, decimal commas, and unit tokens while rejecting invalid strings', () => {
  assert.deepEqual(parseFlexibleNumber('60'), { ok: true, value: 60, embeddedUnit: null });
  assert.deepEqual(parseFlexibleNumber('  ٦٠  '), { ok: true, value: 60, embeddedUnit: null });
  assert.deepEqual(parseFlexibleNumber('1,3 m'), { ok: true, value: 1.3, embeddedUnit: 'm' });
  assert.deepEqual(parseFlexibleNumber('130 cm'), { ok: true, value: 130, embeddedUnit: 'cm' });
  assert.deepEqual(parseFlexibleNumber('45 N'), { ok: true, value: 45, embeddedUnit: 'N' });
  assert.equal(parseFlexibleNumber('').ok, false);
  assert.equal(parseFlexibleNumber('abc').ok, false);
  assert.equal(parseFlexibleNumber('60 + 20').ok, false);
  assert.equal(parseFlexibleNumber('10..5').ok, false);
});

test('interactive evaluation accurately grades every MCQ, conceptual, scale-drawing, and numerical branch across all 11 subparts', () => {
  // Question 1 MCQs: 1.1 -> c, 1.2 -> d, 1.3 -> c, 1.4 -> d
  assert.equal(evaluateSubpart('1.1', { choice: '' }).valid, false);
  assert.equal(evaluateSubpart('1.1', { choice: 'b' }).isCorrect, false);
  assert.equal(evaluateSubpart('1.1', { choice: 'c' }).isCorrect, true);

  assert.equal(evaluateSubpart('1.2', { choice: 'b' }).isCorrect, false);
  assert.equal(evaluateSubpart('1.2', { choice: 'd' }).isCorrect, true);

  assert.equal(evaluateSubpart('1.3', { choice: 'b' }).isCorrect, false);
  assert.equal(evaluateSubpart('1.3', { choice: 'c' }).isCorrect, true);

  assert.equal(evaluateSubpart('1.4', { choice: 'c' }).isCorrect, false);
  assert.equal(evaluateSubpart('1.4', { choice: 'd' }).isCorrect, true);

  // Question 2: 4 elements + schematic placement
  assert.equal(evaluateSubpart('2.1', defaultResponseFor('2.1')).valid, false);
  assert.equal(evaluateSubpart('2.1', {
    carrier: 'parallel', sense: 'larger', magnitude: 'sum', point: 'outside-larger',
    diagramPos: 'outside-larger', diagramSense: 'larger',
  }).isCorrect, false);
  assert.equal(evaluateSubpart('2.1', {
    carrier: 'parallel', sense: 'larger', magnitude: 'difference', point: 'outside-larger',
    diagramPos: 'outside-larger', diagramSense: 'larger',
  }).isCorrect, true);

  // Problem 1.1: F2 = 60 N
  assert.equal(evaluateSubpart('3.1.1', { value: '' }).valid, false);
  assert.equal(evaluateSubpart('3.1.1', { value: '20' }).isCorrect, false);
  assert.equal(evaluateSubpart('3.1.1', { value: '60 cm' }).isCorrect, false);
  assert.equal(evaluateSubpart('3.1.1', { value: '60' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.1.1', { value: '٦٠.٠ N' }).isCorrect, true);

  // Problem 1.2: Scale drawing works for all valid scales (20, 10, 40 N/cm)
  assert.equal(evaluateSubpart('3.1.2', { scale: '20', l1: '4', l2: '3', lr: '5', angle: '90' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.1.2', { scale: '10', l1: '8', l2: '6', lr: '10', angle: '90' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.1.2', { scale: '40', l1: '2', l2: '1.5', lr: '2.5', angle: '90' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.1.2', { scale: '20', l1: '4', l2: '3', lr: '7', angle: '90' }).isCorrect, false);
  assert.equal(evaluateSubpart('3.1.2', { scale: '20', l1: '4', l2: '3', lr: '5', angle: 'same-line' }).isCorrect, false);

  // Problem 1.3: Directly opposite force F' = 100 N, opposite-collinear
  assert.equal(evaluateSubpart('3.1.3', { fPrimeMag: '100', fPrimeDir: 'opposite-collinear' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.1.3', { fPrimeMag: '60', fPrimeDir: 'opposite-collinear' }).isCorrect, false);
  assert.equal(evaluateSubpart('3.1.3', { fPrimeMag: '100', fPrimeDir: 'same-collinear' }).isCorrect, false);

  // Problem 2.1: F2 is larger + physical justification
  assert.equal(evaluateSubpart('3.2.1', { largerForce: 'F2', reason: 'outside-near-f2' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.2.1', { largerForce: 'F1', reason: 'outside-near-f2' }).isCorrect, false);
  assert.equal(evaluateSubpart('3.2.1', { largerForce: 'F2', reason: 'inside-rod' }).isCorrect, false);

  // Problem 2.2: d1 = 130 cm = 1.3 m (unit-aware)
  assert.equal(evaluateSubpart('3.2.2', { d1Value: '130', d1Unit: 'cm' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.2.2', { d1Value: '1.3', d1Unit: 'm' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.2.2', { d1Value: '1,30', d1Unit: 'm' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.2.2', { d1Value: '1.3 m', d1Unit: 'cm' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.2.2', { d1Value: '130', d1Unit: 'm' }).isCorrect, false);
  assert.equal(evaluateSubpart('3.2.2', { d1Value: '1.3', d1Unit: 'cm' }).isCorrect, false);
  assert.equal(evaluateSubpart('3.2.2', { d1Value: '70', d1Unit: 'cm' }).isCorrect, false);
  assert.equal(evaluateSubpart('3.2.2', { d1Value: '31', d1Unit: 'cm' }).isCorrect, false);

  // Problem 2.3: F1 = 45 N, F2 = 195 N
  assert.equal(evaluateSubpart('3.2.3', { f1Value: '45', f2Value: '195' }).isCorrect, true);
  assert.equal(evaluateSubpart('3.2.3', { f1Value: '195', f2Value: '45' }).isCorrect, false);
  assert.equal(evaluateSubpart('3.2.3', { f1Value: '45', f2Value: '105' }).isCorrect, false);
});

test('multi-branch parent questions are never marked complete/correct when a branch is wrong or unchecked, and hints never count as answers', () => {
  const state = createInitialUnitQuestionsState();

  // Opening hints on 1.1 does not mark it answered or checked
  state.branches['1.1'].hintLevel = 2;
  assert.equal(getSubpartStatus(state.branches['1.1'], '1.1'), 'unanswered');
  assert.equal(computeOverallSummary(state).answeredCount, 0);
  assert.equal(computeOverallSummary(state).isFinal, false);

  // Answer 3 out of 4 in Q1 correctly and 1 wrong -> Q1 must NOT be marked correct
  for (const [id, choice] of [['1.1', 'c'], ['1.2', 'd'], ['1.3', 'c'], ['1.4', 'a']]) {
    state.branches[id].response = { choice };
    const res = evaluateSubpart(id, state.branches[id].response);
    state.branches[id].checked = true;
    state.branches[id].isCorrect = res.isCorrect;
  }
  const q1Partial = computeQuestionGroupSummary(state, 'q1');
  assert.equal(q1Partial.allChecked, true);
  assert.equal(q1Partial.allCorrect, false);
  assert.equal(q1Partial.status, 'partial');
  assert.equal(q1Partial.correctCount, 3);
  assert.equal(computeOverallSummary(state).isFinal, false);

  // Fix 1.4 and complete all remaining branches -> overall becomes final 11/11
  const fullAnswers = {
    '1.4': { choice: 'd' },
    '2.1': { carrier: 'parallel', sense: 'larger', magnitude: 'difference', point: 'outside-larger', diagramPos: 'outside-larger', diagramSense: 'larger', note: '' },
    '3.1.1': { value: '60' },
    '3.1.2': { scale: '20', l1: '4', l2: '3', lr: '5', angle: '90' },
    '3.1.3': { fPrimeMag: '100', fPrimeDir: 'opposite-collinear' },
    '3.2.1': { largerForce: 'F2', reason: 'outside-near-f2' },
    '3.2.2': { d1Value: '130', d1Unit: 'cm' },
    '3.2.3': { f1Value: '45', f2Value: '195' },
  };
  for (const [id, response] of Object.entries(fullAnswers)) {
    state.branches[id].response = response;
    const res = evaluateSubpart(id, response);
    assert.equal(res.isCorrect, true, `expected ${id} to be correct`);
    state.branches[id].checked = true;
    state.branches[id].isCorrect = true;
  }

  const finalSummary = computeOverallSummary(state);
  assert.equal(finalSummary.isFinal, true);
  assert.equal(finalSummary.checkedCount, 11);
  assert.equal(finalSummary.correctCount, 11);
  assert.equal(finalSummary.groups.q1.allCorrect, true);
  assert.equal(finalSummary.groups.q2.allCorrect, true);
  assert.equal(finalSummary.groups.q3.allCorrect, true);
});

test('interactive physics diagrams are accessible, labelled as platform visuals, and do not leak Problem 2 answers before verification', () => {
  const initialState = createInitialUnitQuestionsState();
  const q2Svg = renderQuestionTwoDiagram(initialState.branches['2.1'].response, false);
  const p1Svg = renderProblemOneDiagram(initialState);
  const p2InitialSvg = renderProblemTwoDiagram(initialState);

  for (const svg of [q2Svg, p1Svg, p2InitialSvg]) {
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title id="/);
    assert.match(svg, /<desc id="/);
    assert.match(svg, /من المنصة/);
  }

  // Before solving 3.2.1..3.2.3, Problem 2 SVG must not reveal 130 cm, 45 N, or 195 N
  assert.doesNotMatch(p2InitialSvg, /130 cm|45 N|195 N/);

  initialState.branches['3.2.1'].checked = true;
  initialState.branches['3.2.1'].isCorrect = true;
  const p2AfterPart1 = renderProblemTwoDiagram(initialState);
  assert.match(p2AfterPart1, /d₂ = 30 cm/);
  assert.match(p2AfterPart1, /d₁ = ؟/);
  assert.doesNotMatch(p2AfterPart1, /130 cm|45 N|195 N/);

  initialState.branches['3.2.2'].checked = true;
  initialState.branches['3.2.2'].isCorrect = true;
  const p2AfterPart2 = renderProblemTwoDiagram(initialState);
  assert.match(p2AfterPart2, /130 cm/);
  assert.doesNotMatch(p2AfterPart2, /45 N|195 N/);
});

test('Teacher Area has complete worked coverage, corrected Q1.2 option d, separate source disclosures, and diagrams labelled as platform material', () => {
  const teacherQuestions = [...teacherMarkup.matchAll(/data-teacher-question="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(teacherQuestions, [
    'teacher-unit-q1-part1', 'teacher-unit-q1-part2', 'teacher-unit-q1-part3', 'teacher-unit-q1-part4',
    'question-two', 'problem-one', 'problem-two',
  ]);
  assert.match(teacherMarkup, /data-source-page="p71"/);
  assert.match(teacherMarkup, /data-source-page="p72"/);
  assert.match(teacherMarkup, /محتوى الكتاب الأصلي · p71/);
  assert.match(teacherMarkup, /محتوى الكتاب الأصلي · p72/);
  for (const label of ['المعطيات', 'المطلوب', 'القانون', 'التعويض', 'الحساب', 'الوحدة', 'التحقق']) {
    assert.ok(teacherMarkup.includes(`class="solution-label">${label}</span>`), `teacher solution is missing ${label}`);
  }
  for (const result of [
    '8+12=20~\\mathrm{N}',
    'F=F_{1}\\sqrt{2}',
    'd=6-2=4~\\mathrm{cm}',
    'F_{2}=\\sqrt{100-36}=\\sqrt{64}=8~\\mathrm{N}',
    'F_{2}=\\sqrt{10000-6400}=\\sqrt{3600}=60~\\mathrm{N}',
    'F_{1}=45~\\mathrm{N}',
    'F_{2}=45+150=195~\\mathrm{N}',
    '58.5~\\mathrm{N\\,m}',
  ]) assert.ok(teacherMarkup.includes(result), `missing worked result ${result}`);
  assert.match(teacherMarkup, /الخيار الصحيح في ص71 هو <strong>d<\/strong>/);
  assert.match(teacherMarkup, /1\.30~\\mathrm\{m\}/);
  assert.match(teacherMarkup, /data-platform-illustration="question-two-opposite-forces"/);
  assert.match(teacherMarkup, /data-platform-illustration="problem-one-perpendicular-forces"/);
  assert.match(teacherMarkup, /data-platform-illustration="problem-two-resultant-position"/);
  assert.match(teacherMarkup, /رسم إرشادي من المنصة، لا رسم مطبوع من الكتاب/);
  assert.match(teacherMarkup, /غير مرسوم على مقياس/);
});

test('Teacher Area reuses the existing password gate without changing the passphrase or loading answers in Student Area', async () => {
  const [teacherPage, teacherBoot, studentBoot, auth, sharedGate] = await Promise.all([
    read('../unit-questions-teacher.html'),
    read('../src/unit-questions-teacher.js'),
    read('../src/unit-questions.js'),
    read('../src/teacher-auth.js'),
    read('../src/teacher-area.js'),
  ]);
  assert.match(teacherPage, /<title>منطقة المعلم — أسئلة الوحدة الأولى<\/title>/);
  assert.match(teacherPage, /type="password"[^>]*autocomplete="current-password"/);
  assert.match(teacherPage, /id="teacher-workspace"[^>]*hidden/);
  assert.match(teacherPage, /src="\.\/src\/unit-questions-teacher\.js"/);
  assert.match(teacherBoot, /verifyTeacherPassword/);
  assert.match(teacherBoot, /import\('\.\/unit-questions-teacher-content\.js'\)/);
  assert.match(sharedGate, /workspace\.hidden = true/);
  assert.match(sharedGate, /const module = await loadContent\(\)/);
  assert.match(auth, /PASSWORD_DERIVED_KEY/);
  assert.doesNotMatch(teacherPage, /somer173/);
  assert.doesNotMatch(teacherBoot, /somer173/);
  assert.doesNotMatch(studentBoot, /unit-questions-teacher-content|teacher-auth|somer173/);
  assert.equal(await verifyTeacherPassword('somer173'), true);
});

test('Unit Questions remain distinct from Unit 1 Test, lessons, and the Appendix Library, and build succeeds cleanly', async () => {
  const [home, lesson2, testPage, testBoot, library, build, audit] = await Promise.all([
    read('../index.html'), read('../lesson-2.html'), read('../unit-1-test.html'),
    read('../src/unit-1-assessment.js'), read('../appendices.html'), read('../scripts/build.mjs'),
    read('../docs/unit-1-questions-source-audit.md'),
  ]);
  assert.match(lesson2, /href="\.\/unit-questions\.html">أسئلة الوحدة الأولى/);
  assert.match(lesson2, /href="\.\/unit-1-test\.html"/);
  assert.match(testPage, /اختبار الوحدة الأولى/);
  assert.match(testBoot, /loadSolutions: \(\) => import\('\.\/unit-1-test-solutions\.js'\)/);
  assert.match(home, /اختبار الوحدة الأولى/);
  assert.equal((library.match(/class="appendix-library-card"/g) ?? []).length, 5);
  assert.match(build, /resolve\(projectDirectory, 'unit-questions\.html'\)/);
  assert.match(build, /resolve\(projectDirectory, 'unit-questions-teacher\.html'\)/);
  assert.match(audit, /الصفحة 71/);
  assert.match(audit, /الصفحة 72/);
  assert.match(audit, /11 مطلباً/);
  assert.match(audit, /12 cm/);
  assert.match(audit, /150 N/);
  assert.match(audit, /30 cm/);
  assert.match(renderUnitQuestionSourceDisclosure(71), /data-source-page="p71"/);
  assert.match(renderUnitQuestionSourceDisclosure(72), /data-source-page="p72"/);
});
