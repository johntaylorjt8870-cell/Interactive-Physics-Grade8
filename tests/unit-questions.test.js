import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderTeacherContent } from '../src/unit-questions-teacher-content.js';
import {
  renderUnitQuestions,
  renderUnitQuestionSourceDisclosure,
  UNIT_QUESTIONS_META,
  UNIT_QUESTIONS_PAGE_AUDIT,
  UNIT_QUESTION_SOURCE_BLOCKS,
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
  const unitPanel = home.slice(home.indexOf('<div class="unit-panel">'), home.indexOf('</section>', home.indexOf('<div class="unit-panel">')));
  assert.match(home, /class="unit-review-entry"[^]*أسئلة الوحدة الأولى/);
  assert.match(home, /href="\.\/unit-questions\.html"/);
  assert.match(home, /مراجعة شاملة لأسئلة الكتاب الأصلية/);
  assert.equal((home.match(/class="lesson-entry"/g) ?? []).length, 2);
  assert.equal((unitPanel.match(/class="lesson-entry"/g) ?? []).length, 2);
  assert.match(unitPanel, /class="unit-review-entry"/);
  assert.doesNotMatch(home, /lesson-3\.html|class="lesson-entry"[^]*الدرس الثالث|unit-2/);
});

test('standalone Student Area has the correct Unit 1 identity, page references, KaTeX, and no teacher import', async () => {
  const [page, boot, css] = await Promise.all([
    read('../unit-questions.html'), read('../src/unit-questions.js'), read('../src/unit-questions.css'),
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
  assert.doesNotMatch(boot, /teacher-content|teacher-auth|teacher-solutions/);
  assert.match(css, /unicode-bidi:\s*isolate/);
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(css, /:focus-visible|:focus-visible/);
});

test('Source Audit inventories both pages, three main questions, all nested items, values, and no printed figure/table', () => {
  assert.deepEqual(UNIT_QUESTIONS_META.sourcePages, [71, 72]);
  assert.equal(UNIT_QUESTIONS_META.mainQuestionCount, 3);
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

test('all source questions, options, and subparts remain in their exact printed order across pages 71–72', () => {
  const questionOrder = [...studentMarkup.matchAll(/data-question-order="([1-3])"/g)].map((match) => Number(match[1]));
  assert.deepEqual(questionOrder, [1, 2, 3]);
  assert.deepEqual(sourceSubparts(studentMarkup), ['1.1', '1.2', '1.3', '1.4', '3.1.1', '3.1.2', '3.1.3', '3.2.1', '3.2.2', '3.2.3']);
  assert.equal((studentMarkup.match(/class="unit-question-option"/g) ?? []).length, 16);
  assert.deepEqual(['a.', 'b.', 'c.', 'd.'].map((label) => (studentMarkup.match(new RegExp(`unit-option-label[^]*?${label.replace('.', '\\.')}`, 'g')) ?? []).length > 0), [true, true, true, true]);
  for (const phrase of [
    'اختر الإجابة الصحيحة لكل مما يأتي:',
    'قوتان شاقوليتان نحو الأسفل',
    'قوتان متلاقيتان متعامدتان',
    'متساويتان بالشدة',
    'البعد بين حامليهما',
    'قوتان متعامدتان شدة القوة الأولى',
    'حدّد بالكتابة والرسم عناصر محصلة قوتين شاقوليتين مختلفتين بالشدة',
    'حل المسألتين الآتيتين:',
    'ارسم شكلاً يمثل القوتين والمحصلة بمقياس رسم مناسب.',
    'القوة',
    'المعاكسة مباشرة للمحصلة',
    'قوتان شاقوليتان',
    'طرفي ساق معدنية خفيفة',
    'احسب شدة كل من القوتين.',
  ]) assert.ok(studentMarkup.includes(phrase), `source wording missing: ${phrase}`);
  assert.match(studentMarkup, /data-source-page="p71"/);
  assert.match(studentMarkup, /data-source-page="p72"/);
  assert.match(studentMarkup, /class="unit-page-continuation"[^]*p72/);
  assert.match(UNIT_QUESTION_SOURCE_BLOCKS.questionThreePage72, /<ol class="unit-written-parts" start="2">/);
});

test('source values, options, units, subscripts, roots, vectors, and RTL/LTR boundaries render through KaTeX', async () => {
  for (const token of [
    'F_{1}=8~\\mathrm{N}', 'F_{2}=12~\\mathrm{N}', '0~\\mathrm{N}', '4~\\mathrm{N}', '20~\\mathrm{N}', '96~\\mathrm{N}', 'F_{1}=F_{2}',
    'F=2F_{1}', 'F=\\sqrt{2}F_{1}', 'F=2\\sqrt{F_{1}}', 'F=\\sqrt{2F_{1}}',
    'd_{2}=6~\\mathrm{cm}', 'd_{1}=2~\\mathrm{cm}', '12~\\mathrm{cm}', '8~\\mathrm{cm}', '4~\\mathrm{cm}', '3~\\mathrm{cm}',
    'F_{1}=6~\\mathrm{N}', 'F=10~\\mathrm{N}', '2~\\mathrm{N}', '6~\\mathrm{N}', '14~\\mathrm{N}', '8~\\mathrm{N}', 'F=150~\\mathrm{N}',
    '80~\\mathrm{N}', '100~\\mathrm{N}', '1~\\mathrm{m}', '30~\\mathrm{cm}',
    '\\vec{F}_{1}', '\\vec{F}_{2}',
  ]) assert.ok(studentMarkup.includes(`<annotation encoding="application/x-tex">${token}</annotation>`), `missing KaTeX source ${token}`);
  assert.match(studentMarkup, /aria-label="vector F prime"[^]*<annotation encoding="application\/x-tex">\\vec\{F\}&#x27;<\/annotation>/);

  const [sharedCss, questionCss, math] = await Promise.all([
    read('../src/styles.css'), read('../src/unit-questions.css'), import('../src/math.js'),
  ]);
  assert.match(studentMarkup, /class="math math-inline" dir="ltr" role="math"/);
  assert.match(sharedCss, /\.math\s*\{\s*direction:\s*ltr;\s*unicode-bidi:\s*isolate;/);
  assert.match(questionCss, /\.unit-book-question \[dir="ltr"\], \.unit-book-question \.math \{ direction: ltr; unicode-bidi: isolate; \}/);
  const vector = math.vector('F', '1');
  assert.match(vector, /<annotation encoding="application\/x-tex">\\vec\{F\}_\{1\}<\/annotation>/);
  assert.match(vector, /dir="ltr"/);
  assert.match(vector, /aria-label="vector F subscript 1"/);
});

test('Teacher Area has complete worked coverage, separate source disclosures, page citations, and diagrams labelled as platform material', () => {
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
    'F=\\sqrt{2}F_{1}',
    'd=6-2=4~\\mathrm{cm}',
    'F_{2}=\\sqrt{100-36}=\\sqrt{64}=8~\\mathrm{N}',
    'F_{2}=\\sqrt{10000-6400}=\\sqrt{3600}=60~\\mathrm{N}',
    'F_{1}=45~\\mathrm{N}',
    'F_{2}=45+150=195~\\mathrm{N}',
    '58.5~\\mathrm{N\\,m}',
  ]) assert.ok(teacherMarkup.includes(result), `missing worked result ${result}`);
  assert.match(teacherMarkup, /1\.30~\\mathrm\{m\}/);
  assert.match(teacherMarkup, /teacher-unit-q1-part1/);
  assert.match(teacherMarkup, /teacher-unit-q1-part4/);
  assert.match(teacherMarkup, /data-platform-illustration="question-two-opposite-forces"/);
  assert.match(teacherMarkup, /data-platform-illustration="problem-one-perpendicular-forces"/);
  assert.match(teacherMarkup, /data-platform-illustration="problem-two-resultant-position"/);
  assert.match(teacherMarkup, /رسم إرشادي من المنصة، لا رسم مطبوع من الكتاب/);
  assert.match(teacherMarkup, /غير مرسوم على مقياس/);
  assert.match(teacherMarkup, /لم يذكر مقادير عددية/);
});

test('new Teacher Area reuses the existing password gate without changing the passphrase or loading answers in Student Area', async () => {
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

test('Unit Questions remain distinct from Unit 1 Test, lessons, and the two-entry Appendix Library', async () => {
  const [home, lesson2, testPage, testBoot, library, build] = await Promise.all([
    read('../index.html'), read('../lesson-2.html'), read('../unit-1-test.html'),
    read('../src/unit-1-assessment.js'), read('../appendices.html'), read('../scripts/build.mjs'),
  ]);
  assert.match(lesson2, /href="\.\/unit-questions\.html">أسئلة الوحدة الأولى/);
  assert.match(lesson2, /href="\.\/unit-1-test\.html"/);
  assert.match(testPage, /اختبار الوحدة الأولى/);
  assert.match(testBoot, /loadSolutions: \(\) => import\('\.\/unit-1-test-solutions\.js'\)/);
  assert.match(home, /اختبار الوحدة الأولى/);
  assert.equal((library.match(/class="appendix-library-card"/g) ?? []).length, 2);
  assert.doesNotMatch(home + lesson2 + testPage + build, /lesson-3\.html|lesson-3\/|Unit 2|unit-2-test|قريباً|قريبًا/);
  assert.match(build, /resolve\(projectDirectory, 'unit-questions\.html'\)/);
  assert.match(build, /resolve\(projectDirectory, 'unit-questions-teacher\.html'\)/);
  assert.doesNotMatch(build, /lesson-3\.html|unit-2/);
});

test('static build configuration copies both Unit Questions entries and shared source modules', async () => {
  const build = await read('../scripts/build.mjs');
  for (const file of ['unit-questions.html', 'unit-questions-teacher.html']) {
    assert.ok(build.includes(`resolve(projectDirectory, '${file}')`), `build script must copy ${file}`);
  }
  for (const file of ['unit-questions.js', 'unit-questions-content.js', 'unit-questions-teacher.js', 'unit-questions-teacher-content.js', 'unit-questions.css', 'unit-questions-teacher.css']) {
    assert.ok((await read(`../src/${file}`)).length > 0, `missing new source asset ${file}`);
  }
  assert.match(build, /resolve\(projectDirectory, 'src'\).*recursive:\s*true/);
});

test('Source Audit file matches the published page order and source disclosure coverage', async () => {
  const audit = await read('../docs/unit-1-questions-source-audit.md');
  assert.match(audit, /الصفحة 71/);
  assert.match(audit, /الصفحة 72/);
  assert.match(audit, /11 مطلباً/);
  assert.match(audit, /12 cm/);
  assert.match(audit, /150 N/);
  assert.match(audit, /30 cm/);
  assert.match(renderUnitQuestionSourceDisclosure(71), /data-source-page="p71"/);
  assert.match(renderUnitQuestionSourceDisclosure(72), /data-source-page="p72"/);
});
