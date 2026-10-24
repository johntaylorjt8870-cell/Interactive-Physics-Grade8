import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { UNIT2_PAGES, UNIT2_META, UNIT2_SOURCE_INVENTORY } from '../src/unit2-lesson1-content.js';
import { chargeFromElectrons, electronCountFromCharge, coulombForce, netForceOnCharge, electroscopeState, parseNumericInput, parseQuantityInput, checkEquivalentQuantity } from '../src/unit2-lesson1-physics.js';
import { UNIT2_DIAGRAMS } from '../src/unit2-lesson1-diagrams.js';
import { unit2SimulationMarkup, mountUnit2Simulations } from '../src/unit2-lesson1-simulation.js';
import { unit2PracticeMarkup, mountUnit2Practice } from '../src/unit2-lesson1-practice.js';
import { UNIT2_SELF_CHECK_ANSWERS } from '../src/unit2-lesson1-self-check-answers.js';
import { UNIT2_QUESTIONS, UNIT2_TEST } from '../src/unit2-lesson1-test-data.js';
import { ANSWER_KEY, SOLUTIONS, SOLUTION_GROUPS } from '../src/unit2-lesson1-test-solutions.js';
import { validateAnswerKey, startAssessment, createAssessmentState, recordAnswer, submitAssessment, restartAssessment } from '../src/lesson-test-engine.js';
import { renderTeacherContent } from '../src/unit2-lesson1-teacher-content.js';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const source = (n) => UNIT2_PAGES.find((page) => page.page === n)?.blocks.filter((block) => block.type === 'book').map((block) => block.html).join('') ?? '';
const practiceIds = [...new Set(UNIT2_PAGES.flatMap((page) => page.blocks).filter((block) => block.type === 'book').flatMap((block) => [...block.html.matchAll(/data-u2-practice="([^"]+)"/g)].map((match) => match[1])))];
const simulationIds = UNIT2_PAGES.flatMap((page) => page.blocks).filter((block) => block.type === 'simulation').map((block) => block.id);

test('pages 73–86 stay ordered, scoped, routed and RTL', async () => {
  assert.deepEqual(UNIT2_PAGES.map((page) => page.page), [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86]);
  assert.equal(UNIT2_META.pages, '73–86');
  assert.equal(UNIT2_SOURCE_INVENTORY.pages, 14);
  const [html, build, home, main] = await Promise.all([read('../unit2-lesson-1.html'), read('../scripts/build.mjs'), read('../index.html'), read('../src/unit2-lesson1-main.js')]);
  assert.match(main, /event\.key === 'PageUp' && activeIndex > 0.*goToPage\(activeIndex - 1, true\)/);
  assert.match(html, /<html lang="ar" dir="rtl">/);
  assert.match(html, /الكهرباء الساكنة/);
  assert.match(html, /unit2-lesson1-main\.js/);
  assert.match(html, /unit2-lesson-1-test\.html/);
  assert.match(html, /unit2-lesson-1-teacher\.html/);
  assert.doesNotMatch(html, /lesson-2\.html|unit2-lesson-2/);
  assert.match(build, /'unit2-lesson-1\.html'/);
  assert.match(home, /unit2-lesson-1\.html/);
  assert.match(home, /unit-2-test\.html/);
});

test('every source page retains its textbook text, small print and question branches', async () => {
  for (const page of UNIT2_PAGES) {
    assert.ok(source(page.page).length > 100, `book text p${page.page}`);
    assert.ok(page.blocks.some((block) => block.type === 'book'), `book block p${page.page}`);
  }
  for (const phrase of ['يتعرّف الكهرباء الساكنة', 'الكلمات المفتاحية']) assert.ok(source(73).includes(phrase), phrase);
  assert.ok(source(74).includes('وريقتين ناقلتين خفيفتين'));
  assert.ok(source(74).includes('مبدأ عمل هذا الجهاز'));
  assert.ok(source(75).includes('حقيبة الكهرباء الساكنة'));
  assert.ok(source(75).includes('الحالة الجافة'));
  assert.ok(source(76).includes('شحنة الإلكترون'));
  assert.ok(source(76).includes('20'));
  assert.ok(source(77).includes('الشحنات الكهربائية المتماثلة تتنافر'));
  assert.ok(source(78).includes('التكهرب باللمس'));
  assert.ok(source(79).includes('ثم أبعد الإصبع والساق معاً'));
  assert.ok(source(80).includes('قانون كولوم'));
  assert.ok(source(80).includes('ثابت كولوم'));
  assert.ok(source(80).includes('k=9'));
  assert.ok(source(80).includes(String.raw`q_{1}\cdot q_{2}`));
  assert.ok(source(81).includes('36'));
  assert.ok(source(82).includes('الاختلاف الكبير'));
  assert.ok(source(82).includes('شحنات مخالفة'));
  assert.ok(source(82).includes('تحثّ الشحنة السالبة'));
  assert.ok(source(82).includes('إضاءة'));
  assert.doesNotMatch(source(82), /الاصطدام الكبير/);
  assert.ok(source(83).includes('بنجامين فرانكلين'));
  assert.ok(source(84).includes('السؤال الثالث'));
  assert.ok(source(85).includes('جسم إلكترونات ذراته السطحية قليل وشديدة الارتباط بالنواة'));
  assert.ok(source(85).includes('المسألة الثانية'));
  assert.ok(source(86).includes('المسألة الثالثة'));
  const required = source(86).slice(source(86).indexOf('المطلوب'));
  const first = required.indexOf('بين');
  const second = required.indexOf('بين', first + 1);
  const third = required.indexOf('محصلة القوى');
  assert.ok(first > -1 && second > first && third > second, 'p86 branch order');
  const raw = await read('../src/unit2-lesson1-content.js');
  assert.ok(raw.includes(String.raw`q=+e^{-}`));
  assert.ok(raw.includes(String.raw`q=+2e^{-}`));
  assert.match(raw, /u2-math-sequence/);
  assert.ok(raw.includes(String.raw`e=-1.6\\times10^{-19}\\,\\mathrm{c}`));
  assert.ok(raw.includes(String.raw`q_{1}=5\\,\\mu\\mathrm{c}`));
  assert.match(raw, /توضيح اصطلاحي حول رمز e/);
});

test('source inventory has four experiments, two worked examples and twenty leaf demands', () => {
  assert.equal(UNIT2_SOURCE_INVENTORY.experiments, 4);
  assert.equal(UNIT2_SOURCE_INVENTORY.workedExamples, 2);
  assert.equal(UNIT2_SOURCE_INVENTORY.selfCheckMainQuestions, 5);
  assert.equal(UNIT2_SOURCE_INVENTORY.selfCheckLeafTasks, 20);
  assert.equal(UNIT2_SOURCE_INVENTORY.matchingTables, 1);
  assert.equal(UNIT2_SOURCE_INVENTORY.sourcePhotos, 3);
  assert.equal(UNIT2_SOURCE_INVENTORY.diagrams, 7);
  assert.equal(UNIT2_SOURCE_INVENTORY.simulations, 6);
  assert.equal(UNIT2_SOURCE_INVENTORY.practiceMounts, 9);
  assert.equal(simulationIds.length, 6);
  assert.equal(practiceIds.length, 9);
  assert.equal(new Set(practiceIds).size, practiceIds.length);
});

test('seven responsive diagrams preserve labels, geometry and accessible descriptions', () => {
  assert.deepEqual(Object.keys(UNIT2_DIAGRAMS), ['electroscope-parts', 'electroscope-states', 'coulomb-pair', 'coulomb-example', 'storm-charges', 'lightning-rod', 'three-charges']);
  for (const [id, diagram] of Object.entries(UNIT2_DIAGRAMS)) {
    assert.match(diagram.svg, /role="img"/, id);
    assert.match(diagram.svg, /<title/, id);
    assert.match(diagram.svg, /<desc/, id);
    assert.match(diagram.svg, /viewBox=/, id);
    assert.ok(diagram.description.length > 20, id);
    assert.doesNotMatch(diagram.svg, /<img/, id);
  }
  assert.match(UNIT2_DIAGRAMS['electroscope-parts'].svg, /ورقتين معدنيتين/);
  assert.match(UNIT2_DIAGRAMS['electroscope-parts'].svg, /رقيقتين/);
  assert.match(UNIT2_DIAGRAMS['coulomb-pair'].svg, /F<tspan/);
  assert.match(UNIT2_DIAGRAMS['coulomb-example'].svg, /36 N/);
  assert.deepEqual(UNIT2_DIAGRAMS['lightning-rod'].legend, ['الهوائي', 'مانع الصواعق', 'سلك نحاسي', 'نقطة الاتصال بالأرضي', 'مادة محيطة بساق التأريض', 'ساق التأريض']);
  assert.match(UNIT2_DIAGRAMS['three-charges'].svg, /AB = 20 cm/);
  assert.match(UNIT2_DIAGRAMS['three-charges'].svg, /BC = 40 cm/);
});

test('six simulations expose qualitative models, live status and reset controls', () => {
  assert.deepEqual(simulationIds, ['electroscope-lab', 'rubbing-lab', 'interaction-lab', 'contact-lab', 'induction-lab', 'coulomb-lab']);
  for (const id of simulationIds) {
    const markup = unit2SimulationMarkup(id);
    assert.match(markup, new RegExp(`data-u2-sim="${id}"`));
    assert.match(markup, /aria-live="polite"/);
    assert.match(markup, /إعادة الضبط/);
    assert.match(markup, /نموذج|تخطيطي|نوعي/);
  }
  assert.equal(typeof mountUnit2Simulations, 'function');
});

test('physics accepts equivalent numeric notation and units without changing textbook results', () => {
  assert.equal(chargeFromElectrons(5e12, 'lost').charge > 0, true);
  assert.ok(Math.abs(electronCountFromCharge(8e-7).count - 5e12) < 1);
  assert.equal(coulombForce(50e-6, 80e-6, 1).magnitude, 36);
  assert.equal(coulombForce(50e-6, 80e-6, 1).kind, 'repulsion');
  assert.equal(coulombForce(5e-6, -8e-6, 1).kind, 'attraction');
  const net = netForceOnCharge({ charge: 5e-6, position: 0 }, [{ charge: 6e-6, position: 0.2 }, { charge: -8e-6, position: 0.6 }]);
  assert.ok(Math.abs(net.magnitude - 5.75) < 1e-9);
  assert.equal(net.direction, -1);
  assert.equal(electroscopeState(0).diverged, false);
  assert.equal(electroscopeState(-3).diverged, true);
  assert.throws(() => coulombForce(1, 1, 0), RangeError);
  assert.equal(parseNumericInput('٣٫٢×10^-٨'), 3.2e-8);
  assert.equal(parseQuantityInput('32 nC', 'C').value, 3.2e-8);
  assert.ok(Math.abs(parseQuantityInput('5 μc', 'C').value - 5e-6) < 1e-15);
  assert.equal(checkEquivalentQuantity('-1.6e-19', 'c', -1.6e-19, 'C').correct, true);
  assert.equal(checkEquivalentQuantity('32', 'nC', 3.2e-8, 'C').correct, true);
  assert.equal(checkEquivalentQuantity('-96.32', 'kC', -96320, 'C').correct, true);
  assert.equal(checkEquivalentQuantity('2320', 'mN', 2.32, 'N').correct, true);
  assert.equal(checkEquivalentQuantity('2.32', 'N', 2.32, 'C').correct, false);
  assert.equal(checkEquivalentQuantity('-3.2e-8', 'C', 3.2e-8, 'C').correct, false);
});

test('practice starts without answer keys and loads all nine independent answer specifications lazily', async () => {
  assert.equal(typeof mountUnit2Practice, 'function');
  for (const id of practiceIds) {
    const markup = unit2PracticeMarkup(id);
    assert.match(markup, /data-practice-form/);
    assert.match(markup, /data-practice-action="check"/);
    assert.match(markup, /data-practice-action="reset"/);
    assert.match(markup, /data-practice-solution-panel hidden><\/div>/);
    assert.doesNotMatch(markup, /data-correct|data-answer-key/);
    assert.ok(UNIT2_SELF_CHECK_ANSWERS[id], id);
  }
  const vector = unit2PracticeMarkup('three-charge-problem');
  assert.match(vector, /data-vector-draw/);
  assert.match(vector, /data-vector-direction="resultant"/);
  const [main, practice] = await Promise.all([read('../src/unit2-lesson1-main.js'), read('../src/unit2-lesson1-practice.js')]);
  assert.doesNotMatch(main, /self-check-answers|UNIT2_SELF_CHECK_ANSWERS/);
  assert.match(practice, /import\('\.\/unit2-lesson1-self-check-answers\.js'\)/);
});

test('answer specifications preserve numerical targets and p86 force directions', () => {
  assert.equal(UNIT2_SELF_CHECK_ANSWERS['charge-activity'].expected, 3.2e-8);
  assert.equal(UNIT2_SELF_CHECK_ANSWERS['mol-charge'].expected, -96320);
  assert.equal(UNIT2_SELF_CHECK_ANSWERS['distance-force'].expected, 2.32);
  assert.deepEqual(UNIT2_SELF_CHECK_ANSWERS['selfcheck-matching'].items, ['تكهرب', 'تدافع', 'البروتون', 'تفريغ', 'عازل']);
  assert.deepEqual(UNIT2_SELF_CHECK_ANSWERS['three-charge-problem'].expected, { f12: 6.75, f13: 1, resultant: 5.75 });
  assert.deepEqual(UNIT2_SELF_CHECK_ANSWERS['three-charge-problem'].directions, { f12: 'left', f13: 'right', resultant: 'left' });
});

test('teacher area covers every page and uses the source-aligned p80/p82/p85 wording', () => {
  const markup = renderTeacherContent();
  for (let page = 73; page <= 86; page++) assert.ok(markup.includes(`data-source-page="p${page}"`), `teacher p${page}`);
  for (const phrase of ['الكاشف الكهربائي', 'تطبيق محلول', 'نشاط', 'التكهرب بالتأثير', 'السؤال الأول', 'السؤال الثاني', 'السؤال الثالث', 'السؤال الرابع', 'المسألة الأولى', 'المسألة الثانية', 'المسألة الثالثة', '5.75', '2.32', '96320', 'المطلوب 1', 'المطلوب 2', 'المطلوب 3', 'الإصبع والساق معاً', 'إضاءة']) assert.ok(markup.includes(phrase), phrase);
  assert.doesNotMatch(markup, /الإصبع أولاً والساق ثانياً/);
  const first = markup.indexOf('المطلوب 1');
  const second = markup.indexOf('المطلوب 2');
  const third = markup.indexOf('المطلوب 3');
  assert.ok(first > -1 && second > first && third > second);
  assert.match(markup, /المعطيات/);
  assert.match(markup, /المطلوب/);
  assert.match(markup, /التحقق/);
});

test('source images and derived local assets are present for all fourteen pages', async () => {
  const files = await Promise.all(Array.from({ length: 14 }, (_, index) => read(`../docs/sources/unit2-lesson1/image-${index + 1}.png`)));
  assert.equal(files.length, 14);
  for (const path of ['lightning.jpg', 'coulomb.jpg', 'franklin.jpg']) assert.ok((await read(`../src/assets/unit2-lesson1/${path}`)).length > 1000, path);
  assert.match(await read('../docs/sources/unit2-lesson1/SHA256SUMS'), /image-1\.png/);
});

test('responsive CSS keeps math isolated and includes mobile/reduced-motion rules', async () => {
  const css = await read('../src/unit2-lesson1.css');
  assert.match(css, /u2-math-sequence/);
  assert.match(css, /direction: ltr/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(max-width: 480px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /u2-vector-canvas/);
});

test('test: exactly 20, distribution 6/7/4/3, hidden keys, groups of 5, no instant score, restart', async () => {
  assert.equal(UNIT2_QUESTIONS.length, 20);
  assert.equal(new Set(UNIT2_QUESTIONS.map((question) => question.id)).size, 20);
  assert.deepEqual(Object.fromEntries(['basic', 'medium', 'advanced', 'thinking'].map((level) => [level, UNIT2_QUESTIONS.filter((question) => question.difficulty === level).length])), { basic: 6, medium: 7, advanced: 4, thinking: 3 });
  assert.ok(new Set(UNIT2_QUESTIONS.map((question) => question.type)).size >= 7);
  assert.deepEqual(UNIT2_TEST.sourcePages, [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86]);
  assert.deepEqual(SOLUTION_GROUPS.map((group) => group.items.length), [5, 5, 5, 5]);
  assert.equal(Object.keys(ANSWER_KEY).length, 20);
  for (const question of UNIT2_QUESTIONS) {
    assert.equal(validateAnswerKey(question, ANSWER_KEY[question.id]), true, question.id);
    assert.ok(SOLUTIONS[question.id].explanationHtml.length > 40, question.id);
  }
  const app = await read('../src/unit2-lesson1-assessment.js');
  assert.match(app, /loadSolutions: \(\) => import\('\.\/unit2-lesson1-test-solutions\.js'\)/);
  assert.doesNotMatch(app, /ANSWER_KEY/);
  let state = startAssessment(createAssessmentState());
  state = recordAnswer(state, UNIT2_QUESTIONS[0], ANSWER_KEY[UNIT2_QUESTIONS[0].id]);
  assert.equal(state.results, null);
  const submitted = submitAssessment(state, UNIT2_QUESTIONS, ANSWER_KEY);
  assert.equal(submitted.results.correct, 1);
  assert.deepEqual(restartAssessment(submitted), { status: 'not-started', currentIndex: 0, answers: {}, results: null });
});

test('teacher gate unchanged and no plain password in new pages', async () => {
  const [teacher, auth] = await Promise.all([read('../unit2-lesson-1-teacher.html'), read('../src/teacher-auth.js')]);
  assert.match(teacher, /type="password"/);
  assert.match(teacher, /unit2-lesson1-teacher\.js/);
  assert.doesNotMatch(teacher, /somer173/);
  assert.doesNotMatch(auth, /somer173/);
  const boot = await read('../src/unit2-lesson1-teacher.js');
  assert.match(boot, /verifyTeacherPassword/);
});
