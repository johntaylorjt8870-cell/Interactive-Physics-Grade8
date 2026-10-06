import { LESSON_2_PAGES } from './lesson-2-content.js';
import { LESSON_2_DIAGRAMS } from './lesson-2-diagrams.js';
import { lesson2SimulationMarkup, mountLesson2Simulations } from './lesson-2-simulation.js';
import {
  collectSelfCheckSelections,
  enhanceSelfCheckSections,
  gradeSelfCheck,
  markSelfCheckOptions,
  renderSelfCheckResults,
} from './self-check.js';

const nav = document.querySelector('#page-nav');
const pageContent = document.querySelector('#page-content');
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
let activeIndex = 0;

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

function renderLegend(legend = []) {
  if (!legend.length) return '';
  return `<ul class="diagram-legend" aria-label="رموز الرسم">${legend.map((item) => `<li><span class="legend-swatch ${escapeHtml(item.color)}" aria-hidden="true"></span>${item.symbol}</li>`).join('')}</ul>`;
}

function renderPlatformBlock(block) {
  if (block.type === 'simulation') return lesson2SimulationMarkup(block.id);
  if (block.type === 'diagram') {
    const diagram = LESSON_2_DIAGRAMS[block.id];
    if (!diagram) return '';
    return `<aside class="platform-explanation diagram-explanation" aria-label="شرح المنصة: رسم تخطيطي">
      <div class="platform-heading"><span class="platform-label">رسم توضيحي من المنصة</span></div>
      <h3>${diagram.title}</h3><p class="platform-copy platform-body">${diagram.platformNote}</p>
      <figure class="diagram-figure"><div class="diagram-canvas">${diagram.svg}</div>${renderLegend(diagram.legend)}<figcaption>${diagram.description}</figcaption></figure>
    </aside>`;
  }
  const kindClass = block.kind === 'source-slot' ? ' source-slot-explanation' : '';
  return `<aside class="platform-explanation${kindClass}" aria-label="شرح المنصة: ${escapeHtml(block.title)}">
    <div class="platform-heading"><span class="platform-label">Platform Explanation · شرح المنصة</span></div>
    <h3>${escapeHtml(block.title)}</h3><div class="platform-copy platform-body">${block.html}</div>
  </aside>`;
}

function renderPage(page, index) {
  pageHeading.textContent = page.heading;
  pageNumber.textContent = String(page.page);
  sectionKicker.textContent = `الدرس 2 · القوى المتوازية · ${index + 1} / ${LESSON_2_PAGES.length}`;
  const ordinaryBlocks = page.blocks.filter((block) => block.type !== 'simulation');
  const simulations = page.blocks.filter((block) => block.type === 'simulation');
  const markup = ordinaryBlocks.map((block, blockIndex) => {
    if (block.type !== 'book') return renderPlatformBlock(block);
    const startsSourceRun = blockIndex === 0 || ordinaryBlocks[blockIndex - 1].type !== 'book';
    const marker = startsSourceRun ? `<p class="source-marker" role="note"><span>من الكتاب · الصفحة ${page.page}</span></p>` : '';
    return `${marker}<div class="book-copy" data-source-page="p${page.page}">${block.html}</div>`;
  }).join('');
  pageContent.innerHTML = `${markup}${simulations.map(renderPlatformBlock).join('')}`;
  mountLesson2Simulations(pageContent);
  enhanceSelfCheckSections(pageContent, page.page);
  updateProgress(index);
  updateControls(index);
  updateNavigation(index);
}

function updateProgress(index) {
  const current = index + 1;
  const percentage = (current / LESSON_2_PAGES.length) * 100;
  progressText.textContent = `${current} / ${LESSON_2_PAGES.length}`;
  progressTrack.setAttribute('aria-valuenow', String(current));
  progressFill.style.width = `${percentage}%`;
  mobileProgressFill.style.width = `${percentage}%`;
  controlCenter.textContent = `صفحة ${current} من ${LESSON_2_PAGES.length}`;
}

function updateControls(index) {
  const previous = LESSON_2_PAGES[index - 1];
  const next = LESSON_2_PAGES[index + 1];
  previousButton.disabled = !previous;
  nextButton.disabled = !next;
  previousLabel.textContent = previous?.navLabel ?? 'بداية الدرس';
  nextLabel.textContent = next?.navLabel ?? 'نهاية الدرس';
}

function updateNavigation(index) {
  [...nav.children].forEach((button, buttonIndex) => {
    if (buttonIndex === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
}

function goToPage(index, moveFocus = false) {
  const bounded = Math.max(0, Math.min(LESSON_2_PAGES.length - 1, index));
  if (bounded === activeIndex && pageContent.childElementCount > 0) return;
  activeIndex = bounded;
  pageContent.setAttribute('aria-busy', 'true');
  renderPage(LESSON_2_PAGES[activeIndex], activeIndex);
  pageContent.setAttribute('aria-busy', 'false');
  if (moveFocus) {
    pageHeading.focus({ preventScroll: true });
    pageHeading.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}

LESSON_2_PAGES.forEach((page, index) => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'page-nav-button';
  button.setAttribute('aria-label', `الصفحة ${page.page}: ${page.navLabel}`);
  button.innerHTML = `<span class="nav-page-number" dir="ltr">${page.page}</span><span class="nav-page-copy"><strong>${escapeHtml(page.navLabel)}</strong><small>صفحة من الكتاب</small></span><span class="nav-current-mark" aria-hidden="true">↙</span>`;
  button.addEventListener('click', () => goToPage(index, true));
  nav.append(button);
});

previousButton.addEventListener('click', () => goToPage(activeIndex - 1, true));
nextButton.addEventListener('click', () => goToPage(activeIndex + 1, true));

pageContent.addEventListener('change', (event) => {
  const input = event.target.closest('input[data-selfcheck-option]');
  if (!input) return;
  const item = input.closest('[data-selfcheck-item]');
  if (!item) return;
  for (const choice of item.querySelectorAll('.option-choice')) {
    const choiceInput = choice.querySelector('input[data-selfcheck-option]');
    choice.classList.toggle('is-selected', choiceInput?.checked === true);
    choice.classList.remove('is-revealed-correct', 'is-revealed-wrong');
  }
  const results = item.closest('.self-check-section')?.querySelector('[data-selfcheck-results]');
  if (results) { results.hidden = true; results.innerHTML = ''; }
});

pageContent.addEventListener('click', (event) => {
  const submitButton = event.target.closest('[data-selfcheck-submit]');
  if (!submitButton) return;
  const sourcePage = Number(submitButton.dataset.selfcheckSubmit);
  const section = pageContent.querySelector(`.self-check-section[data-selfcheck-page="${sourcePage}"]`);
  if (!section) return;
  const keys = [...section.querySelectorAll('[data-selfcheck-item]')].map((item) => item.dataset.selfcheckItem);
  submitButton.disabled = true;
  import('./lesson-2-self-check-answers.js').then(({ lesson2SelfCheckAnswer }) => {
    const answers = Object.fromEntries(keys.map((key) => [key, lesson2SelfCheckAnswer(key)]).filter(([, answer]) => answer));
    const graded = gradeSelfCheck(collectSelfCheckSelections(section), answers);
    markSelfCheckOptions(section, graded);
    renderSelfCheckResults(section.querySelector(`[data-selfcheck-results="${sourcePage}"]`), graded, 1);
  }).finally(() => { submitButton.disabled = false; });
});

window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target?.closest?.('input, button, select, textarea, a, [contenteditable="true"]')) return;
  if (event.key === 'PageDown' && activeIndex < LESSON_2_PAGES.length - 1) { event.preventDefault(); goToPage(activeIndex + 1, true); }
  if (event.key === 'PageUp' && activeIndex > 0) { event.preventDefault(); goToPage(activeIndex - 1, true); }
});

goToPage(0);
