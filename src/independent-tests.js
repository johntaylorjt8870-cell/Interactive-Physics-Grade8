/* ============================================================================
   Independent Tests («اختبارات مستقلة») — page behaviour.
   Wires the two internal tabs (tests / solutions) with full keyboard support
   (roving tabindex, arrow keys, Home/End), hash deep-links (#tests /
   #solutions), and renders cards from the registry in
   independent-tests-data.js. Stage 1: the registry is empty, so the designed
   empty states stay visible and no sample content is ever shown.
   ========================================================================== */

import {
  INDEPENDENT_TESTS,
  INDEPENDENT_TEST_SOLUTIONS,
  getSolutionForTest,
  hasSolutionForTest,
  testIdsWithoutSolution,
} from './independent-tests-data.js';

const TABS = Object.freeze([
  { id: 'tests', hash: '#tests', label: 'الاختبارات المستقلة' },
  { id: 'solutions', hash: '#solutions', label: 'حلول الاختبارات' },
]);

const FIRST_TAB = TABS[0].id;

function tabFromHash(hash) {
  const found = TABS.find((tab) => tab.hash === hash);
  return found === undefined ? FIRST_TAB : found.id;
}

function activateTab(tabId, { updateHash = true, focus = false } = {}) {
  const tab = TABS.find((candidate) => candidate.id === tabId);
  if (tab === undefined) return;
  for (const candidate of TABS) {
    const button = document.querySelector(`[data-it-tab="${candidate.id}"]`);
    const panel = document.getElementById(`it-panel-${candidate.id}`);
    if (button === null || panel === null) continue;
    const active = candidate.id === tab.id;
    button.setAttribute('aria-selected', active ? 'true' : 'false');
    button.tabIndex = active ? 0 : -1;
    panel.hidden = !active;
    if (active && focus) button.focus();
  }
  if (updateHash && window.location.hash !== tab.hash) {
    window.history.replaceState(null, '', tab.hash);
  }
}

function moveFocus(currentTabId, delta) {
  const index = TABS.findIndex((tab) => tab.id === currentTabId);
  const nextIndex = (index + delta + TABS.length) % TABS.length;
  activateTab(TABS[nextIndex].id, { focus: true });
}

function wireTabs() {
  const tablist = document.querySelector('[data-it-tablist]');
  if (tablist === null) return;
  tablist.addEventListener('click', (event) => {
    const button = event.target.closest('[data-it-tab]');
    if (button !== null) activateTab(button.dataset.itTab);
  });
  tablist.addEventListener('keydown', (event) => {
    const button = event.target.closest('[data-it-tab]');
    if (button === null) return;
    const current = button.dataset.itTab;
    // RTL tablist: ArrowLeft moves to the next tab, ArrowRight to the previous.
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveFocus(current, +1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveFocus(current, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      activateTab(TABS[0].id, { focus: true });
    } else if (event.key === 'End') {
      event.preventDefault();
      activateTab(TABS[TABS.length - 1].id, { focus: true });
    }
  });
  window.addEventListener('hashchange', () => activateTab(tabFromHash(window.location.hash)));
}

function testCardMarkup(test) {
  const meta = [test.subject, test.source].filter((value) => typeof value === 'string' && value.trim() !== '');
  const metaMarkup = meta.length > 0
    ? `<ul class="it-card-meta">${meta.map((value) => `<li>${value}</li>`).join('')}</ul>`
    : '';
  const countMarkup = Number.isInteger(test.questionCount) && test.questionCount > 0
    ? `<span class="it-card-chip">${test.questionCount} سؤالاً</span>`
    : '<span class="it-card-chip it-card-chip-muted">الأسئلة قيد الإعداد</span>';
  return `
    <span class="it-card-number" aria-hidden="true" dir="ltr">${String(test.number).padStart(2, '0')}</span>
    <div class="it-card-body">
      <h3 class="it-card-title" id="it-test-${test.id}-title">${test.title}</h3>
      ${metaMarkup}
      <div class="it-card-footer">
        ${countMarkup}
        <a class="it-card-action" href="#test-${test.id}" aria-describedby="it-test-${test.id}-title">فتح الاختبار <span aria-hidden="true">←</span></a>
      </div>
    </div>`;
}

function renderTests() {
  const grid = document.getElementById('it-tests-grid');
  const empty = document.getElementById('it-tests-empty');
  if (grid === null || empty === null) return;
  grid.replaceChildren(...INDEPENDENT_TESTS.map((test) => {
    const card = document.createElement('article');
    card.className = 'it-card';
    card.dataset.testId = test.id;
    card.innerHTML = testCardMarkup(test);
    return card;
  }));
  empty.hidden = INDEPENDENT_TESTS.length > 0;
  const counter = document.getElementById('it-tests-count');
  if (counter !== null) counter.textContent = String(INDEPENDENT_TESTS.length);
}

function solutionRowMarkup(testId) {
  const solution = getSolutionForTest(testId);
  const test = INDEPENDENT_TESTS.find((candidate) => candidate.id === testId);
  const pending = solution === undefined;
  const title = test !== undefined ? test.title : testId;
  return `
    <span class="it-solution-index" aria-hidden="true" dir="ltr">${testId}</span>
    <div class="it-solution-body">
      <h3 class="it-solution-title">حل اختبار: ${title}</h3>
      <p class="it-solution-note">${pending ? 'الحل التفصيلي سيُضاف بعد اعتماد الاختبار.' : 'الحل التفصيلي خطوة بخطوة، مرتبط بمعرّف هذا الاختبار.'}</p>
    </div>
    ${pending
      ? '<span class="it-solution-chip it-solution-chip-pending">بانتظار الحل</span>'
      : `<a class="it-solution-link" href="#solution-${testId}">عرض الحل <span aria-hidden="true">←</span></a>`}`;
}

function renderSolutions() {
  const list = document.getElementById('it-solutions-list');
  const empty = document.getElementById('it-solutions-empty');
  if (list === null || empty === null) return;
  const linkedIds = INDEPENDENT_TESTS.map((test) => test.id).filter((id) => hasSolutionForTest(id));
  const missing = testIdsWithoutSolution();
  const rows = [...linkedIds, ...missing].map((testId) => {
    const row = document.createElement('article');
    row.className = 'it-solution-row';
    row.dataset.testId = testId;
    row.innerHTML = solutionRowMarkup(testId);
    return row;
  });
  list.replaceChildren(...rows);
  // The solutions empty state is shown only when there is nothing at all to list.
  empty.hidden = linkedIds.length > 0 || missing.length > 0;
  const counter = document.getElementById('it-solutions-count');
  if (counter !== null) counter.textContent = String(linkedIds.length);
}

function init() {
  wireTabs();
  renderTests();
  renderSolutions();
  activateTab(tabFromHash(window.location.hash), { updateHash: false });
}

init();
