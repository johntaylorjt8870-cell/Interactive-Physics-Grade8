import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';

const repo = '/home/user/Interactive-Physics-Grade8/';
const base = 'file://' + repo;
const html = await readFile(repo + 'unit2-lesson-2.html', 'utf8');
const dom = new JSDOM(html, { url: base + 'unit2-lesson-2.html', pretendToBeVisual: true });
const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
globalThis.Element = window.Element;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Node = window.Node;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
window.matchMedia = globalThis.matchMedia;
window.scrollTo = () => {};
window.Element.prototype.scrollIntoView = () => {};

const errors = [];
window.addEventListener('error', (e) => errors.push('error ' + e.message));
await import(base + 'src/unit2-lesson2-main.js');

const doc = window.document;
const $ = (sel) => doc.querySelector(sel);
const $$ = (sel) => [...doc.querySelectorAll(sel)];
const wait = (ms = 40) => new Promise((r) => setTimeout(r, ms));
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks += 1; };

const next = async () => { $('#next-button').click(); await wait(20); };
const navTo = async (index) => {
  const buttons = $$('#page-nav button');
  buttons[index].click();
  await wait(30);
};

const results = [];
const stage = (name, fn) => results.push({ name, fn });

/* ---------- p90: table, graph, reset independence, solution gate ---------- */
await navTo(3); // p90
check($('#page-number').textContent === '90', 'on page 90');
check($$('[data-u2l2-practice]').length === 2, 'two activities on p90');
const tableRoot = $('[data-u2l2-practice="p90-table"]');
const graphRoot = $('[data-u2l2-practice="p90-graph"]');
check(tableRoot.innerHTML.includes('data-practice-cell'), 'table activity rendered');
check(graphRoot.innerHTML.includes('data-graph-point'), 'graph activity rendered');

// solution is locked before an attempt
tableRoot.querySelector('[data-practice-action="solution"]').click();
await wait(80);
check(tableRoot.querySelector('[data-practice-feedback]').dataset.kind === 'error', 'solution locked before attempt');
check(tableRoot.querySelector('[data-practice-solution]').hidden, 'solution panel still hidden');

// hint is available and does not reveal the values
tableRoot.querySelector('[data-practice-action="hint"]').click();
await wait(120);
check(!tableRoot.querySelector('[data-practice-hint]').hidden, 'hint opens on request');
check(!/15|25/.test(tableRoot.querySelector('[data-practice-hint]').textContent.replace(/[٠-٩]/g, '')), 'hint does not state the blanks');

// wrong table values
const setCell = (root, i, value) => {
  const input = root.querySelector(`[data-practice-cell="${i}"]`);
  input.value = value;
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
};
[0, 1, 2, 3, 4].forEach((i) => setCell(tableRoot, i, i === 0 ? '20' : '4'));
tableRoot.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(tableRoot.querySelector('[data-practice-feedback]').dataset.kind === 'incorrect', 'wrong table is rejected');
check(tableRoot.querySelector('[data-practice-score]').textContent.includes('3 / 5'), 'per-cell score on the table');
check(tableRoot.querySelector('[data-practice-solution]').hidden, 'no solution before a correct attempt is not required, but hidden until asked');

// correct table values, including Arabic digits
setCell(tableRoot, 0, '١٥');
setCell(tableRoot, 1, '25');
tableRoot.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(tableRoot.querySelector('[data-practice-feedback]').dataset.kind === 'correct', 'correct table accepted');
tableRoot.querySelector('[data-practice-action="solution"]').click();
await wait(150);
check(!tableRoot.querySelector('[data-practice-solution]').hidden, 'solution opens after an attempt');
check(tableRoot.querySelector('[data-practice-solution]').innerHTML.includes('mfrac'), 'solution shows a real fraction');

// graph: place the five points
const keys = ['5,20', '10,40', '15,60', '20,80', '25,100'];
for (const key of keys) {
  graphRoot.querySelector(`[data-graph-point="${key}"] .u2l2-graph-hit`).dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await wait(5);
}
check(graphRoot.querySelector('[data-graph-status]').textContent.includes('5'), 'graph counts five placed points');
graphRoot.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(graphRoot.querySelector('[data-practice-feedback]').dataset.kind === 'correct', 'graph accepted');

// reset is independent per activity
graphRoot.querySelector('[data-practice-action="reset"]').click();
await wait(60);
check(graphRoot.querySelector('[data-graph-status]').textContent.includes('لم تُوضع'), 'graph reset clears its points');
check(tableRoot.querySelector('[data-practice-feedback]').dataset.kind === 'correct', 'table result survives the graph reset');
tableRoot.querySelector('[data-practice-action="reset"]').click();
await wait(60);
check(tableRoot.querySelector('[data-practice-score]').textContent === '' && tableRoot.querySelector('[data-practice-feedback]').dataset.kind === 'neutral', 'table reset clears its own result');
check(tableRoot.querySelector('[data-practice-cell="0"]').value === '', 'table reset clears inputs');

/* ---------- p95: terms, true/false, curve choice ---------- */
await navTo(8);
check($('#page-number').textContent === '95', 'on page 95');
const q1 = $('[data-u2l2-practice="p95-q1"]');
const q2 = $('[data-u2l2-practice="p95-q2"]');
const q3 = $('[data-u2l2-practice="p95-q3"]');
const setTerm = (root, i, value) => { const input = root.querySelector(`[data-term-input="${i}"]`); input.value = value; input.dispatchEvent(new window.Event('input', { bubbles: true })); };
['شدة التيار', 'الأمبير', 'الأميتر', 'التيار المستمر'].forEach((t, i) => setTerm(q1, i, t));
q1.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(q1.querySelector('[data-practice-feedback]').dataset.kind === 'correct', 'equivalent terms accepted');
setTerm(q1, 2, 'الفولت');
q1.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(q1.querySelector('[data-practice-feedback]').dataset.kind === 'incorrect', 'a wrong term is rejected');
check(!q1.querySelector('[data-practice-feedback]').textContent.includes('مقياس الأمبير'), 'the correct term is not printed in the feedback');

const pick = (root, index, value) => { const input = root.querySelectorAll(`input[type="radio"]`)[index]; input.checked = true; input.dispatchEvent(new window.Event('change', { bubbles: true })); };
const pickTruth = (root, statement, value) => { const input = root.querySelector(`input[name="u2l2-truth-${statement}"][value="${value}"]`); input.checked = true; input.dispatchEvent(new window.Event('change', { bubbles: true })); };
pickTruth(q2, 0, 'true'); // wrong: statement 1 is false
pickTruth(q2, 1, 'true'); // right
q2.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(q2.querySelector('[data-practice-feedback]').dataset.kind === 'incorrect', 'wrong judgement rejected');
check(q2.querySelectorAll('[data-truth-feedback][data-kind="incorrect"]').length === 1, 'each statement is judged separately');
pickTruth(q2, 0, 'false');
q2.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(q2.querySelector('[data-practice-feedback]').dataset.kind === 'correct', 'correct judgements accepted');

pick(q3, 3, 'd');
q3.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(q3.querySelector('[data-practice-feedback]').dataset.kind === 'correct', 'curve d accepted');
check($$('.u2l2-curve-option').length === 4, 'four curves drawn');
/* changing an answer clears the previous success */
pick(q3, 0, 'a');
check(q3.querySelector('[data-practice-feedback]').textContent === '', 'result cleared when the answer changes');

/* ---------- p96: cause, explanation, multi-step numeric ---------- */
await navTo(9);
const q3b = $('[data-u2l2-practice="p96-q3b"]');
const q4 = $('[data-u2l2-practice="p96-q4"]');
const q5 = $('[data-u2l2-practice="p96-q5"]');
pick(q3b, 1, 'b');
q3b.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(q3b.querySelector('[data-practice-feedback]').dataset.kind === 'correct', 'cause b accepted');

// explanation: no automatic correctness
q4.querySelector('[data-practice-action="check"]').click();
await wait(80);
check(q4.querySelector('[data-practice-feedback]').dataset.kind === 'neutral', 'explanation is not auto-graded');
q4.querySelector('[data-explain-compare]').click();
await wait(80);
check(q4.querySelector('[data-explain-compare-panel="0"]').hidden, 'model answer stays hidden before writing');
const write = (i, text) => { const area = q4.querySelector(`[data-explain-input="${i}"]`); area.value = text; area.dispatchEvent(new window.Event('input', { bubbles: true })); };
write(0, 'القاصمة سلك ينصهر عند زيادة التيار فيقطع الدارة ويحمي الجهاز من التلف.');
write(1, 'المعادن فيها إلكترونات حرة تتحرك، والعوازل إلكتروناتها مرتبطة بذراتها فلا تمرر التيار.');
q4.querySelector('[data-explain-compare]').click();
await wait(150);
check(!q4.querySelector('[data-explain-compare-panel="0"]').hidden, 'criteria and model answer open after writing');

// q5: numeric with equivalent units
const stepValue = (id, v) => { const input = q5.querySelector(`[data-step-value="${id}"]`); input.value = v; input.dispatchEvent(new window.Event('input', { bubbles: true })); };
const stepUnit = (id, u) => { const sel = q5.querySelector(`[data-step-unit="${id}"]`); sel.value = u; sel.dispatchEvent(new window.Event('change', { bubbles: true })); };
stepValue('current', '6'); stepValue('charge', '30');
q5.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(q5.querySelector('[data-practice-feedback]').dataset.kind === 'incorrect', '6 A rejected');
stepValue('current', '100'); stepUnit('current', 'mA');
q5.querySelector('[data-practice-action="check"]').click();
await wait(150);
check(q5.querySelector('[data-practice-feedback]').dataset.kind === 'correct', '100 mA equals 0.1 A');
check(q5.querySelector('[data-practice-score]').textContent.includes('2 / 2'), 'both parts scored');

/* ---------- labs: prediction, action, conclusion, reset ---------- */
await navTo(1); // p88 tube
const tube = $('[data-u2l2-sim="tube"]');
check(!!tube, 'tube lab mounted');
const prediction = tube.querySelector('[data-prediction]');
const choose = (root, value) => { const input = root.querySelector(`input[value="${value}"]`); input.checked = true; input.dispatchEvent(new window.Event('change', { bubbles: true })); };
choose(prediction, 'one');
prediction.querySelector('[data-prediction-submit]').click();
await wait(150);
check(prediction.querySelector('[data-prediction-feedback]').dataset.kind === 'incorrect', 'wrong prediction rejected');
choose(prediction, 'three');
prediction.querySelector('[data-prediction-submit]').click();
await wait(150);
check(prediction.querySelector('[data-prediction-feedback]').dataset.kind === 'correct', 'correct prediction accepted');
tube.querySelector('[data-tube-push="3"]').click();
await wait(30);
check(tube.querySelector('[data-tube-exited]').textContent === '3', 'three balls leave immediately');
check(!tube.querySelector('[data-sim-conclusion]').hidden, 'conclusion appears after acting');
tube.querySelector('[data-tube-reset]').click();
await wait(30);
check(tube.querySelector('[data-tube-exited]').textContent === '0', 'tube reset restores the tube');
check(tube.querySelector('[data-sim-conclusion]').hidden, 'tube reset hides the conclusion');
check(tube.querySelector('[data-prediction-feedback]').textContent === '', 'tube reset clears the prediction');
check(tube.querySelectorAll('.u2l2-ball').length === 9, 'nine balls after reset');

await navTo(4); // p91 current lab
const current = $('[data-u2l2-sim="current"]');
const cq = current.querySelector('#cq');
cq.value = '120';
cq.dispatchEvent(new window.Event('input', { bubbles: true }));
await wait(30);
check(current.querySelector('[data-current-i]').textContent.includes('4'), 'I doubles when q doubles');
current.querySelector('[data-current-reset]').click();
await wait(30);
check(cq.value === '60', 'current reset restores the book values');
check(current.querySelector('[data-current-i]').textContent.includes('2'), 'I back to 2 A');

await navTo(6); // p93 circuit lab
const circuit = $('[data-u2l2-sim="circuit"]');
check(circuit.querySelector('[data-circuit-canvas="series"]').closest('[data-circuit-canvas-group]').hidden === false, 'series canvas visible');
circuit.querySelector('[data-circuit-mode="parallel"]').click();
await wait(30);
check(circuit.querySelector('[data-circuit-canvas-group="parallel"]').hidden === false, 'parallel canvas visible');
check(circuit.querySelector('[data-circuit-src]').textContent.includes('300'), 'parallel source current is the sum');
circuit.querySelector('[data-circuit-remove]').click();
await wait(30);
check(circuit.querySelector('[data-circuit-src]').textContent.includes('200'), 'removing a branch leaves the other one');
circuit.querySelector('[data-circuit-reset]').click();
await wait(30);
check(circuit.querySelector('[data-circuit-src]').textContent.includes('200'), 'reset returns to the series default');
check(circuit.querySelector('[data-circuit-canvas-group="series"]').hidden === false, 'reset returns to the series canvas');

/* ---------- keyboard navigation ---------- */
const before = $('#page-number').textContent;
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }));
await wait(30);
check($('#page-number').textContent !== before, 'PageDown moves to the next stage');

/* ---------- no answer module fetched without a request ---------- */
check(errors.length === 0, 'no runtime errors: ' + errors.join('; '));
check($$('.katex-error').length === 0, 'no KaTeX errors');

/* ---------- teacher area ---------- */
const teacherHtml = await readFile(repo + 'unit2-lesson-2-teacher.html', 'utf8');
const tdom = new JSDOM(teacherHtml, { url: base + 'unit2-lesson-2-teacher.html', pretendToBeVisual: true });
const tw = tdom.window;
check(tw.document.querySelector('#teacher-workspace').hidden === true, 'teacher area starts locked');
globalThis.window = tw;
globalThis.document = tw.document;
globalThis.Element = tw.Element;
tw.matchMedia = globalThis.matchMedia;
await import(base + 'src/unit2-lesson2-teacher.js');
await new Promise((r) => setTimeout(r, 200));
const tdoc = tw.document;
tdoc.querySelector('#teacher-password').value = 'wrong-password';
tdoc.querySelector('#teacher-login-submit').click();
await new Promise((r) => setTimeout(r, 400));
check(tdoc.querySelector('#teacher-workspace').hidden === true, 'wrong password keeps the workspace locked');
check(!tdoc.querySelector('#teacher-auth-message').hidden, 'wrong password shows a message');
tdoc.querySelector('#teacher-password').value = 'somer173';
tdoc.querySelector('#teacher-login-submit').click();
await new Promise((r) => setTimeout(r, 600));
check(tdoc.querySelector('#teacher-workspace').hidden === false, 'correct password opens the workspace');
check(tdoc.querySelectorAll('[data-source-page]').length >= 10, 'teacher content covers every source page');
check(tdoc.querySelector('#teacher-workspace').innerHTML.includes('أنشطة الطالب التفاعلية'), 'teacher guidance updated for the activities');
tdoc.querySelector('[data-teacher-logout]').click();
await new Promise((r) => setTimeout(r, 100));
check(tdoc.querySelector('#teacher-workspace').hidden === true, 'logout hides the solutions');

console.log(`DOM QA passed: ${checks} checks`);
