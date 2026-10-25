import { LESSON_PAGES } from './lesson-content.js';
import {
  enhanceLesson1SelfCheck,
  mountInquiryCards,
  mountPracticeDeck,
  mountProblemWorkbenches,
} from './lesson-1-practice.js';
import { mountSimulationExperiences } from './simulations.js';
import { revealScrollTop } from './sidebar-reveal.js';

let currentIndex = 0;

const pageContent = document.querySelector('#page-content');
const pageNav = document.querySelector('#page-nav');
const progressText = document.querySelector('#progress-text');
const progressTrack = document.querySelector('#progress-track');
const progressFill = document.querySelector('#progress-fill');
const mobileProgressFill = document.querySelector('#mobile-progress-fill');
const sectionKicker = document.querySelector('#section-kicker');
const pageHeading = document.querySelector('#page-heading');
const pageNumber = document.querySelector('#page-number');
const prevButton = document.querySelector('#previous-button');
const nextButton = document.querySelector('#next-button');
const prevLabel = document.querySelector('#previous-label');
const nextLabel = document.querySelector('#next-label');
const controlCenter = document.querySelector('#control-center');

/**
 * Keeps the active step visible inside the rail's own scrollport.
 *
 * On short laptop screens the rail is height-bound (see `src/lesson-1.css`), so
 * only `#page-nav` scrolls. The window must not move here: changing a step
 * already scrolls the window back to the step heading, and that behaviour is
 * unchanged. On taller screens the list is not scrollable, so this is a no-op.
 */
function revealActiveStep() {
  if (!pageNav) return;
  const active = pageNav.querySelector('[aria-current="step"]');
  if (!active) return;
  const listBox = pageNav.getBoundingClientRect();
  const stepBox = active.getBoundingClientRect();
  pageNav.scrollTop = revealScrollTop({
    scrollTop: pageNav.scrollTop,
    scrollHeight: pageNav.scrollHeight,
    clientHeight: pageNav.clientHeight,
    listTop: listBox.top,
    listBottom: listBox.bottom,
    itemTop: stepBox.top,
    itemBottom: stepBox.bottom,
  });
}

let revealFrame = 0;
window.addEventListener('resize', () => {
  if (revealFrame) return;
  revealFrame = window.requestAnimationFrame(() => {
    revealFrame = 0;
    revealActiveStep();
  });
});

function renderNav() {
  if (!pageNav) return;
  pageNav.innerHTML = '';
  LESSON_PAGES.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `page-nav-button${index === currentIndex ? ' is-active' : ''}`;
    button.dataset.page = String(item.page);
    if (index === currentIndex) button.setAttribute('aria-current', 'step');
    button.innerHTML = `
      <span class="page-nav-index" dir="ltr">${index + 1}</span>
      <span class="page-nav-copy">
        <strong>${item.stageTitle ?? item.title}</strong>
        <small>ص <bdi dir="ltr">${item.page}</bdi></small>
      </span>
    `;
    button.addEventListener('click', () => goToPage(index, { focusHeading: true }));
    pageNav.append(button);
  });
}

function renderCurrentPage() {
  const page = LESSON_PAGES[currentIndex];
  const stageNum = currentIndex + 1;
  const total = LESSON_PAGES.length;
  const pct = `${((stageNum / total) * 100).toFixed(1)}%`;

  if (sectionKicker) {
    sectionKicker.textContent = `${page.unitTitle} · المرحلة ${stageNum} من ${total}`;
  }
  if (pageHeading) {
    pageHeading.textContent = page.title;
  }
  if (pageNumber) {
    pageNumber.textContent = String(page.page);
  }
  if (progressText) {
    progressText.textContent = `${stageNum} / ${total}`;
  }
  if (progressTrack) {
    progressTrack.setAttribute('aria-valuenow', String(stageNum));
  }
  if (progressFill) {
    progressFill.style.width = pct;
  }
  if (mobileProgressFill) {
    mobileProgressFill.style.width = pct;
  }

  const objectivesHtml = page.objectives?.length
    ? `<div class="stage-objectives" aria-label="أهداف هذه المرحلة">
        <strong>ماذا ستتقن في هذه المرحلة؟</strong>
        <ul>${page.objectives.map((obj) => `<li>${obj}</li>`).join('')}</ul>
      </div>`
    : '';

  pageContent.setAttribute('aria-busy', 'true');
  pageContent.innerHTML = `
    <section class="stage-hero-card" aria-label="ملخص المرحلة وأهدافها">
      ${page.summary ? `<p class="stage-summary">${page.summary}</p>` : ''}
      ${objectivesHtml}
    </section>
    <div class="page-blocks">
      ${page.blocks.join('\n')}
    </div>
  `;
  pageContent.setAttribute('aria-busy', 'false');

  enhanceLesson1SelfCheck(pageContent);
  mountSimulationExperiences(pageContent);
  mountProblemWorkbenches(pageContent);
  mountPracticeDeck(pageContent);
  mountInquiryCards(pageContent);

  const prevItem = LESSON_PAGES[currentIndex - 1];
  const nextItem = LESSON_PAGES[currentIndex + 1];
  if (prevButton) prevButton.disabled = !prevItem;
  if (nextButton) nextButton.disabled = !nextItem;
  if (prevLabel) prevLabel.textContent = prevItem ? (prevItem.stageTitle ?? prevItem.title) : 'بداية الدرس';
  if (nextLabel) nextLabel.textContent = nextItem ? (nextItem.stageTitle ?? nextItem.title) : 'نهاية مراحل الدرس';
  if (controlCenter) controlCenter.textContent = `المرحلة ${stageNum} من ${total} · ص ${page.page}`;

  renderNav();
  revealActiveStep();
}

function goToPage(index, options = {}) {
  if (index < 0 || index >= LESSON_PAGES.length) return;
  currentIndex = index;
  renderCurrentPage();
  if (options.focusHeading) {
    pageHeading?.focus();
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }
}

prevButton?.addEventListener('click', () => goToPage(currentIndex - 1, { focusHeading: true }));
nextButton?.addEventListener('click', () => goToPage(currentIndex + 1, { focusHeading: true }));

document.addEventListener('keydown', (event) => {
  const tag = event.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (event.key === 'PageDown' || event.key === 'ArrowLeft') {
    if (currentIndex < LESSON_PAGES.length - 1) {
      event.preventDefault();
      goToPage(currentIndex + 1, { focusHeading: true });
    }
  } else if (event.key === 'PageUp' || event.key === 'ArrowRight') {
    if (currentIndex > 0) {
      event.preventDefault();
      goToPage(currentIndex - 1, { focusHeading: true });
    }
  }
});

goToPage(0);
