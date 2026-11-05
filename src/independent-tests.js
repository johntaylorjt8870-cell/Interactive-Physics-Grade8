/* Central entry for the existing Independent Tests area.
 * Tests stay in the stable registry and open in this document; they do not
 * create per-test HTML pages or a parallel assessment area.
 */
import { INDEPENDENT_TESTS } from './independent-tests-data.js';

const grid = document.getElementById('it-tests-grid');
const catalog = document.getElementById('it-catalog');
const view = document.getElementById('it-test-view');
const viewTitle = document.getElementById('it-test-view-title');
const stableId = document.getElementById('it-test-stable-id');
const assessmentHost = document.getElementById('it1-assessment');
let activeTestId = null;
let assessmentModulePromise = null;

function renderTestCard(test) {
  const article = document.createElement('article');
  article.className = 'it-card';
  article.dataset.testId = test.id;

  const number = document.createElement('span');
  number.className = 'it-card-number';
  number.dir = 'ltr';
  number.textContent = String(test.number).padStart(2, '0');
  number.setAttribute('aria-hidden', 'true');

  const body = document.createElement('div');
  body.className = 'it-card-body';
  const title = document.createElement('h3');
  title.className = 'it-card-title';
  title.textContent = test.title;
  const meta = document.createElement('p');
  meta.className = 'it-card-meta';
  meta.textContent = [test.subject, test.source].filter(Boolean).join(' · ');
  const action = document.createElement('a');
  action.className = 'it-card-action';
  action.href = `#${test.id}`;
  action.textContent = `ابدأ الاختبار · ${test.problemCount ?? test.questionCount} مسألة`;
  action.setAttribute('aria-label', `فتح ${test.title}`);

  body.append(title, meta, action);
  article.append(number, body);
  return article;
}

function renderCatalog() {
  if (!grid) return;
  grid.replaceChildren(...INDEPENDENT_TESTS.map(renderTestCard));
  const count = document.getElementById('it-tests-count');
  if (count) count.textContent = String(INDEPENDENT_TESTS.length);
  const empty = document.getElementById('it-tests-empty');
  if (empty) empty.hidden = INDEPENDENT_TESTS.length !== 0;
}

function testIdFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return INDEPENDENT_TESTS.some((test) => test.id === id) ? id : null;
}

async function openTest(testId, { updateHash = true } = {}) {
  const test = INDEPENDENT_TESTS.find((entry) => entry.id === testId);
  if (!test || !catalog || !view || !assessmentHost) return;
  activeTestId = test.id;
  catalog.hidden = true;
  view.hidden = false;
  viewTitle.textContent = test.title;
  stableId.textContent = test.id;
  if (updateHash && window.location.hash !== `#${test.id}`) {
    window.history.pushState({ independentTest: test.id }, '', `#${test.id}`);
  }

  assessmentModulePromise ??= import('./it1-assessment.js');
  const module = await assessmentModulePromise;
  if (activeTestId !== test.id) return;
  module.mountIndependentTest1(assessmentHost);
  view.scrollIntoView({ block: 'start' });
}

function showCatalog({ updateHash = true, focus = false } = {}) {
  activeTestId = null;
  if (view) view.hidden = true;
  if (catalog) catalog.hidden = false;
  if (updateHash && window.location.hash) window.history.pushState(null, '', window.location.pathname + window.location.search);
  if (focus) document.getElementById('it-catalog-title')?.focus();
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('.it-card-action');
  if (link) {
    const card = link.closest('[data-test-id]');
    if (card) {
      event.preventDefault();
      void openTest(card.dataset.testId);
    }
  }
  if (event.target.closest('[data-it-back]')) showCatalog({ focus: true });
});

window.addEventListener('hashchange', () => {
  const testId = testIdFromHash();
  if (testId) void openTest(testId, { updateHash: false });
  else if (activeTestId) showCatalog({ updateHash: false });
});

renderCatalog();
const initialTestId = testIdFromHash();
if (initialTestId) void openTest(initialTestId, { updateHash: false });
