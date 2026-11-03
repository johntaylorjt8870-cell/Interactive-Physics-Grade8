import { UNIT2L4_PAGES, UNIT2L4_PHASES } from './unit2-lesson4-content.js';
import { LessonStepper } from './lesson-steps.js';
import { createUnit2L4StepCache } from './unit2-lesson4-step-view.js';
import { UNIT2L4_NOTEBOOK_BLOCK, UNIT2L4_NOTEBOOK_TITLE } from './unit2-lesson4-notebook.js';

/**
 * Unit 2 Lesson 4 bootstrap: one printed textbook page per study step (107–120),
 * with «السابق» / «التالي», a progress bar, the step list in the sidebar and the
 * Page Up / Page Down shortcut. Steps are built once and then detached/reattached,
 * so an answered activity, an open hint, a recorded lab reading or a notebook note
 * is exactly as the student left it when they come back.
 */
const pagesWithNotebook = [
  ...UNIT2L4_PAGES,
  {
    id: 'student-notebook',
    page: 0, // special marker, not a textbook page
    phase: 'practice',
    navLabel: '📒 دفتر الطالب',
    heading: 'دفتر الطالب: المقاومة الكهربائية',
    blocks: [
      { type: 'student-notebook', html: UNIT2L4_NOTEBOOK_BLOCK },
    ],
  },
];
const stepper = new LessonStepper(pagesWithNotebook);

const nav = document.querySelector('#page-nav');
const pageContent = document.querySelector('#page-content');
if (!nav || !pageContent) throw new Error('Lesson 4 student content root is missing.');

const pageHeading = document.querySelector('#page-heading');
const pageNumber = document.querySelector('#page-number');
const pageBadgeLabel = document.querySelector('#page-badge-label');
const progressText = document.querySelector('#progress-text');
const progressTrack = document.querySelector('#progress-track');
const progressFill = document.querySelector('#progress-fill');
const mobileProgressFill = document.querySelector('#mobile-progress-fill');
const previousButton = document.querySelector('#previous-button');
const nextButton = document.querySelector('#next-button');
const previousLabel = document.querySelector('#previous-label');
const nextLabel = document.querySelector('#next-label');
const controlCenter = document.querySelector('#control-center');
const sectionKicker = document.querySelector('#section-kicker');
const visitedText = document.querySelector('#visited-text');
const phaseName = document.querySelector('#phase-name');

const phases = new Map(UNIT2L4_PHASES.map((phase) => [phase.id, phase]));
/* Built once per page and then re-attached: a half-finished answer or a recorded
   lab reading is still exactly where the student left it when they step back. */
const stepCache = createUnit2L4StepCache(UNIT2L4_PAGES);
const visited = new Set();
const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function updateProgress() {
  const { current, total, percent } = stepper.progress;
  progressText.textContent = `${current} / ${total}`;
  progressTrack.setAttribute('aria-valuenow', String(current));
  progressTrack.setAttribute('aria-valuemax', String(total));
  progressFill.style.width = `${percent}%`;
  mobileProgressFill.style.width = `${percent}%`;
  
  // The notebook is the last step (index 14), total is 15
  const isNotebook = stepper.page.id === 'student-notebook';
  controlCenter.textContent = isNotebook
    ? `الخطوة ${current} من ${total} · ${UNIT2L4_NOTEBOOK_TITLE}`
    : `الخطوة ${current} من ${total} · صفحة ${stepper.page.page}`;
  
  progressTrack.setAttribute('aria-valuetext', controlCenter.textContent);
  if (visitedText) visitedText.textContent = `${visited.size} / ${total}`;
}

function updateControls() {
  previousButton.disabled = stepper.isFirst;
  nextButton.disabled = stepper.isLast;
  previousLabel.textContent = stepper.labelFor('previous');
  nextLabel.textContent = stepper.labelFor('next');
}

function updateNav() {
  [...nav.children].forEach((button, index) => {
    if (index === stepper.index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
    const page = pagesWithNotebook[index];
    const isNotebook = page.id === 'student-notebook';
    button.dataset.visited = String(visited.has(isNotebook ? 0 : page.page));
  });
}

function syncHash() {
  const page = stepper.page;
  const hash = page.id === 'student-notebook' ? '#notebook' : `#p${page.page}`;
  if (location.hash !== hash) {
    try { history.replaceState(null, '', hash); } catch { /* file:// or restricted history */ }
  }
}

function renderStep() {
  const page = stepper.page;
  const phase = phases.get(page.phase);
  visited.add(page.id === 'student-notebook' ? 0 : page.page);
  pageHeading.textContent = page.heading;
  const isNotebook = page.id === 'student-notebook';
  pageBadgeLabel.textContent = isNotebook ? 'مرجع الكتاب' : 'صفحة الكتاب';
  pageNumber.textContent = isNotebook ? '107–120' : String(page.page);
  sectionKicker.textContent = `الدرس 4 · المقاومة الكهربائية · ${stepper.position} / ${stepper.total}`;
  if (phaseName) phaseName.textContent = page.id === 'student-notebook'
    ? 'المرحلة ١٥ · دفتر الطالب'
    : `المرحلة ${phase?.index ?? ''} · ${phase?.title ?? ''}`;
  
  // Create a new fragment for the notebook if it's the notebook step, otherwise use the cache
  if (page.id === 'student-notebook') {
    // We still use the cache mechanism for compatibility but ensure the notebook block is appended
    // The cache is built on UNIT2L4_PAGES, so for the notebook step we manually render it
    const fragment = document.createDocumentFragment();
    const div = document.createElement('div');
    div.innerHTML = UNIT2L4_NOTEBOOK_BLOCK;
    fragment.append(div);
    pageContent.replaceChildren(fragment);
  } else {
    pageContent.replaceChildren(stepCache.get(stepper.index));
  }
  
  updateProgress();
  updateControls();
  updateNav();
  syncHash();
}

function goToStep(index, moveFocus = false) {
  pageContent.setAttribute('aria-busy', 'true');
  const changed = stepper.goTo(index);
  if (!changed && pageContent.childElementCount > 0) {
    pageContent.setAttribute('aria-busy', 'false');
    return;
  }
  renderStep();
  pageContent.setAttribute('aria-busy', 'false');
  if (moveFocus) {
    pageHeading.focus({ preventScroll: true });
    pageHeading.scrollIntoView({ block: 'start', behavior: reduceMotion() ? 'auto' : 'smooth' });
  }
}

pagesWithNotebook.forEach((page, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'r4-nav-button';
  const phase = phases.get(page.phase);
  const isNotebook = page.id === 'student-notebook';
  button.setAttribute('aria-label', isNotebook
    ? `الخطوة ${index + 1}: ${UNIT2L4_NOTEBOOK_TITLE}`
    : `الخطوة ${index + 1}، الصفحة ${page.page}: ${page.navLabel}`);
  button.innerHTML = `<span class="r4-nav-page" dir="ltr">${isNotebook ? '📒' : page.page}</span><span class="r4-nav-copy"><strong>${escapeHtml(page.navLabel)}</strong><small>${isNotebook ? 'آخر خطوة · مرجع مراجعة' : escapeHtml(phase?.shortTitle ?? '')}</small></span><span class="r4-nav-mark" aria-hidden="true">↙</span>`;
  button.addEventListener('click', () => goToStep(index, true));
  nav.append(button);
});

previousButton.addEventListener('click', () => goToStep(stepper.index - 1, true));
nextButton.addEventListener('click', () => goToStep(stepper.index + 1, true));
document.querySelector('#start-lesson')?.addEventListener('click', () => goToStep(0, true));

window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target?.closest?.('input, button, select, textarea, a, [contenteditable="true"], summary')) return;
  if (event.key === 'PageDown' && !stepper.isLast) { event.preventDefault(); goToStep(stepper.index + 1, true); }
  if (event.key === 'PageUp' && !stepper.isFirst) { event.preventDefault(); goToStep(stepper.index - 1, true); }
});

/* Deep link: #p113 opens the step for page 113, #notebook opens the notebook.
   The same rule answers later hash changes and the browser's back/forward
   buttons, so a shared link always lands on the intended printed page or notebook. */
const stepIndexFromHash = () => {
  if (location.hash === '#notebook') return pagesWithNotebook.length - 1;
  const match = /^#p(\d{3})$/.exec(location.hash);
  return match ? pagesWithNotebook.findIndex((page) => page.page === Number(match[1])) : -1;
};
const initialIndex = stepIndexFromHash();
if (initialIndex >= 0) stepper.goTo(initialIndex);

renderStep();

window.addEventListener('hashchange', () => {
  const index = stepIndexFromHash();
  if (index >= 0 && index !== stepper.index) goToStep(index, true);
});
