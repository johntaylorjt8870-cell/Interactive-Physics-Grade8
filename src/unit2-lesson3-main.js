import { UNIT2L3_PAGES } from './unit2-lesson3-content.js';
import { LessonStepper } from './lesson-steps.js';
import { mountUnit2l3Step, unit2l3StepMarkup } from './unit2-lesson3-step-view.js';

/**
 * Unit 2 Lesson 3 bootstrap: one textbook page per step, with «السابق» / «التالي»,
 * the lesson progress bar, and the step list in the sidebar. Steps are built once
 * and then detached/reattached, so a student who answers an activity, opens a hint,
 * or closes a lab leaves everything as it was when they come back to that step.
 */
const stepper = new LessonStepper(UNIT2L3_PAGES);

const nav = document.querySelector('#page-nav');
const pageContent = document.querySelector('#page-content');
if (!nav || !pageContent) throw new Error('Lesson 3 student content root is missing.');

const pageHeading = document.querySelector('#page-heading');
const pageNumber = document.querySelector('#page-number');
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

const steps = new Map();
const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildStep(index) {
  if (steps.has(index)) return steps.get(index);
  const page = UNIT2L3_PAGES[index];
  const view = document.createElement('div');
  view.className = 'p3-step';
  view.dataset.stepIndex = String(index);
  view.innerHTML = unit2l3StepMarkup(page);
  mountUnit2l3Step(view);
  steps.set(index, view);
  return view;
}

function updateProgress() {
  const { current, total, percent } = stepper.progress;
  progressText.textContent = `${current} / ${total}`;
  progressTrack.setAttribute('aria-valuenow', String(current));
  progressTrack.setAttribute('aria-valuemax', String(total));
  progressFill.style.width = `${percent}%`;
  mobileProgressFill.style.width = `${percent}%`;
  controlCenter.textContent = `الخطوة ${current} من ${total} · صفحة ${stepper.page.page}`;
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
  });
}

function renderStep() {
  const page = stepper.page;
  pageHeading.textContent = page.heading;
  pageNumber.textContent = String(page.page);
  sectionKicker.textContent = `الدرس 3 · فرق الكمون الكهربائي · ${stepper.position} / ${stepper.total}`;
  pageContent.replaceChildren(buildStep(stepper.index));
  updateProgress();
  updateControls();
  updateNav();
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

UNIT2L3_PAGES.forEach((page, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'page-nav-button';
  button.setAttribute('aria-label', `الخطوة ${index + 1}، الصفحة ${page.page}: ${page.navLabel}`);
  button.innerHTML = `<span class="nav-page-number" dir="ltr">${page.page}</span><span class="nav-page-copy"><strong>${escapeHtml(page.navLabel)}</strong><small>خطوة من الكتاب</small></span><span class="nav-current-mark" aria-hidden="true">↙</span>`;
  button.addEventListener('click', () => goToStep(index, true));
  nav.append(button);
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

previousButton.addEventListener('click', () => goToStep(stepper.index - 1, true));
nextButton.addEventListener('click', () => goToStep(stepper.index + 1, true));

window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target?.closest?.('input, button, select, textarea, a, [contenteditable="true"]')) return;
  if (event.key === 'PageDown' && !stepper.isLast) { event.preventDefault(); goToStep(stepper.index + 1, true); }
  if (event.key === 'PageUp' && !stepper.isFirst) { event.preventDefault(); goToStep(stepper.index - 1, true); }
});

renderStep();
