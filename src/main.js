import { LESSON_PAGES } from './lesson-content.js';
import { DIAGRAMS } from './diagrams.js';
import { mountSimulationExperiences, simulationMarkup } from './simulations.js';
import { V_F1, V_F2, V_F, V_W } from './math.js';
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderLegend(legend = []) {
  if (!legend.length) return '';
  return `<ul class="diagram-legend" aria-label="رموز الرسم">${legend.map((item) => `
    <li><span class="legend-swatch ${escapeHtml(item.color)}" aria-hidden="true"></span>${item.symbol}</li>
  `).join('')}</ul>`;
}

function renderPlatformBlock(block) {
  if (block.type === 'simulation') return simulationMarkup(block.id);
  if (block.type === 'diagram') {
    const diagram = DIAGRAMS[block.id];
    if (!diagram) return '';
    return `<aside class="platform-explanation diagram-explanation" aria-label="شرح المنصة: رسم تخطيطي">
      <div class="platform-heading">
        <span class="platform-label">شرح المنصة</span>
        <span class="platform-kind">رسم توضيحي</span>
      </div>
      <h3>${diagram.title}</h3>
      <p class="platform-copy">${diagram.platformNote}</p>
      <figure class="diagram-figure">
        <div class="diagram-canvas">${diagram.svg}</div>
        ${renderLegend(diagram.legend)}
        <figcaption>${diagram.description}</figcaption>
      </figure>
    </aside>`;
  }

  return `<aside class="platform-explanation ${block.kind === 'source-slot' ? 'source-slot-explanation' : ''}" aria-label="شرح المنصة: ${escapeHtml(block.title)}">
    <div class="platform-heading">
      <span class="platform-label">شرح المنصة</span>
      ${block.kind === 'source-slot' ? '<span class="platform-kind">موضع مرجعي</span>' : ''}
    </div>
    <h3>${escapeHtml(block.title)}</h3>
    <div class="platform-copy">${block.html}</div>
  </aside>`;
}

function renderPage(page, index) {
  pageHeading.textContent = page.heading;
  pageNumber.textContent = String(page.page);
  sectionKicker.textContent = `الدرس 1 · القوى المتلاقية · ${index + 1} / ${LESSON_PAGES.length}`;

  const sourceAndFigureBlocks = page.blocks.filter((block) => block.type !== 'simulation');
  const simulationBlocks = page.blocks.filter((block) => block.type === 'simulation');
  const blocks = sourceAndFigureBlocks.map((block) => {
    if (block.type === 'book') return `<div class="book-copy">${block.html}</div>`;
    return renderPlatformBlock(block);
  }).join('');
  const simulations = simulationBlocks.map(renderPlatformBlock).join('');

  pageContent.innerHTML = `<article class="source-card" aria-labelledby="book-content-heading">
    <header class="source-card-header">
      <div>
        <span class="source-label" id="book-content-heading">محتوى الكتاب</span>
        <span class="source-caption">الصفحة الأصلية <bdi dir="ltr">${page.page}</bdi></span>
      </div>
      <span class="source-lockup" aria-hidden="true"><span>و٢</span><i></i></span>
    </header>
    <div class="source-card-body">${blocks}</div>
  </article>${simulations}`;
  mountSimulationExperiences(pageContent);
  enhanceSelfCheckSections(pageContent, page.page);

  updateProgress(index);
  updateControls(index);
  updateNavigation(index);
}

function updateProgress(index) {
  const current = index + 1;
  const percentage = (current / LESSON_PAGES.length) * 100;
  progressText.textContent = `${current} / ${LESSON_PAGES.length}`;
  progressTrack.setAttribute('aria-valuenow', String(current));
  progressFill.style.width = `${percentage}%`;
  mobileProgressFill.style.width = `${percentage}%`;
  controlCenter.textContent = `صفحة ${current} من ${LESSON_PAGES.length}`;
}

function updateControls(index) {
  const previous = LESSON_PAGES[index - 1];
  const next = LESSON_PAGES[index + 1];
  previousButton.disabled = !previous;
  nextButton.disabled = !next;
  previousLabel.textContent = previous?.navLabel ?? 'بداية الدرس';
  nextLabel.textContent = next?.navLabel ?? 'نهاية الدرس';
}

function updateNavigation(index) {
  for (const [buttonIndex, button] of [...nav.children].entries()) {
    if (buttonIndex === index) {
      button.setAttribute('aria-current', 'step');
    } else {
      button.removeAttribute('aria-current');
    }
  }
}

function goToPage(index, moveFocus = false) {
  const boundedIndex = Math.max(0, Math.min(LESSON_PAGES.length - 1, index));
  if (boundedIndex === activeIndex && pageContent.childElementCount > 0) return;
  activeIndex = boundedIndex;
  pageContent.setAttribute('aria-busy', 'true');
  renderPage(LESSON_PAGES[activeIndex], activeIndex);
  pageContent.setAttribute('aria-busy', 'false');
  if (moveFocus) {
    pageHeading.focus({ preventScroll: true });
    pageHeading.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}

LESSON_PAGES.forEach((page, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'page-nav-button';
  button.setAttribute('aria-label', `الصفحة ${page.page}: ${page.navLabel}`);
  button.innerHTML = `<span class="nav-page-number" dir="ltr">${page.page}</span>
    <span class="nav-page-copy"><strong>${escapeHtml(page.navLabel)}</strong><small>صفحة من الكتاب</small></span>
    <span class="nav-current-mark" aria-hidden="true">↙</span>`;
  button.addEventListener('click', () => goToPage(index, true));
  nav.append(button);
});

previousButton.addEventListener('click', () => goToPage(activeIndex - 1, true));
nextButton.addEventListener('click', () => goToPage(activeIndex + 1, true));

/* Textbook self-check interaction: selecting or changing an answer never reveals
   correctness. Results appear only when the student deliberately submits. */
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
  const section = item.closest('.self-check-section');
  const results = section?.querySelector('[data-selfcheck-results]');
  if (results && !results.hidden) {
    results.hidden = true;
    results.innerHTML = '';
    for (const revealed of section.querySelectorAll('.is-revealed-correct, .is-revealed-wrong')) {
      revealed.classList.remove('is-revealed-correct', 'is-revealed-wrong');
    }
  }
});

pageContent.addEventListener('click', (event) => {
  const submitButton = event.target.closest('[data-selfcheck-submit]');
  if (!submitButton) return;
  const pageNumber = Number(submitButton.dataset.selfcheckSubmit);
  const section = pageContent.querySelector(`.self-check-section[data-selfcheck-page="${pageNumber}"]`);
  if (!section) return;
  const itemKeys = [...section.querySelectorAll('[data-selfcheck-item]')].map((item) => item.dataset.selfcheckItem);
  if (!itemKeys.length) return;
  submitButton.disabled = true;
  import('./self-check-answers.js')
    .then((answersModule) => {
      const answers = {};
      for (const key of itemKeys) {
        const entry = answersModule.selfCheckAnswer(key);
        if (entry) answers[key] = entry;
      }
      const selections = collectSelfCheckSelections(section);
      const graded = gradeSelfCheck(selections, answers);
      const resultList = section.querySelector('.question-list');
      const startNumber = Number(resultList?.getAttribute('start') ?? 1);
      markSelfCheckOptions(section, graded);
      renderSelfCheckResults(section.querySelector(`[data-selfcheck-results="${pageNumber}"]`), graded, startNumber);
    })
    .finally(() => { submitButton.disabled = false; });
});

window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target?.closest?.('input, button, select, textarea, a, [contenteditable="true"]')) return;
  if (event.key === 'PageDown' && activeIndex < LESSON_PAGES.length - 1) {
    event.preventDefault();
    goToPage(activeIndex + 1, true);
  } else if (event.key === 'PageUp' && activeIndex > 0) {
    event.preventDefault();
    goToPage(activeIndex - 1, true);
  }
});

// Keep the notation helpers referenced here as an intentional smoke check: the app's
// displayed MathML vectors are generated from the same isolated notation primitives.
void [V_F1, V_F2, V_F, V_W];

goToPage(0);
