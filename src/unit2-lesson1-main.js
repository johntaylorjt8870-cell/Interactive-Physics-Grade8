import { UNIT2_PAGES } from './unit2-lesson1-content.js';
import { UNIT2_DIAGRAMS } from './unit2-lesson1-diagrams.js';
import { unit2SimulationMarkup, mountUnit2Simulations } from './unit2-lesson1-simulation.js';
import { mountUnit2Practice } from './unit2-lesson1-practice.js';
import { railMaxHeight, revealScrollTop } from './sidebar-reveal.js';

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
const visited = new Set();
const pageCache = new Map();

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

function renderPlatformBlock(block) {
  if (block.type === 'student-notebook') return block.html;
  if (block.type === 'simulation') return unit2SimulationMarkup(block.id);
  if (block.type === 'diagram') {
    const diagram = UNIT2_DIAGRAMS[block.id];
    if (!diagram) return '';
    const key = Array.isArray(diagram.legend) ? `<ol class="u2-diagram-key" aria-label="مفتاح تسميات الشكل">${diagram.legend.map((label) => `<li>${escapeHtml(label)}</li>`).join('')}</ol>` : '';
    return `<aside class="platform-explanation diagram-explanation" data-diagram-id="${escapeHtml(block.id)}" aria-label="رسم توضيحي من المنصة"><div class="platform-heading"><span class="platform-label">رسم توضيحي من المنصة · مطابق للشكل والبيانات</span></div><h3>${escapeHtml(diagram.title)}</h3><figure class="diagram-figure"><div class="diagram-canvas">${diagram.svg}</div><figcaption>${escapeHtml(diagram.description)}</figcaption>${key}</figure></aside>`;
  }
  return `<aside class="platform-explanation" aria-label="شرح المنصة: ${escapeHtml(block.title)}"><div class="platform-heading"><span class="platform-label">شرح من المنصة · ليس نصاً من الكتاب</span></div><h3>${escapeHtml(block.title)}</h3><div class="platform-copy platform-body">${block.html}</div></aside>`;
}

function buildPage(page, index) {
  const view = document.createElement('article');
  view.className = 'page-view';
  view.dataset.pageView = String(page.page);
  view.setAttribute('aria-label', `صفحة الكتاب ${page.page}`);
  let previousType = null;
  view.innerHTML = page.blocks.map((block) => {
    if (block.type !== 'book') {
      previousType = block.type;
      return renderPlatformBlock(block);
    }
    const marker = previousType !== 'book' ? `<p class="source-marker" role="note"><span>من الكتاب · الصفحة ${page.page}</span></p>` : '';
    previousType = 'book';
    return `${marker}<div class="book-copy" data-source-page="p${page.page}">${block.html}</div>`;
  }).join('');
  // Mount each page once. Detaching a cached view on navigation preserves all inputs.
  mountUnit2Simulations(view);
  mountUnit2Practice(view);
  return view;
}

function renderPage(page, index) {
  pageHeading.textContent = page.heading;
  // The final stage is the student notebook, not a printed textbook page. Its
  // badge keeps the lesson's last source page (86) as the source reference,
  // while the tab, the kicker and `#control-center` name it «دفتر الطالب».
  pageNumber.textContent = String(page.page);
  sectionKicker.textContent = `الدرس 1 · الكهرباء الساكنة · ${index + 1} / ${UNIT2_PAGES.length}`;
  if (!pageCache.has(index)) pageCache.set(index, buildPage(page, index));
  pageContent.replaceChildren(pageCache.get(index));
  visited.add(index);
  updateProgress(index);
  updateControls(index);
  updateNavigation(index);
}

function updateProgress(index) {
  const percentage = (visited.size / UNIT2_PAGES.length) * 100;
  progressText.textContent = `${visited.size} / ${UNIT2_PAGES.length}`;
  progressTrack.setAttribute('aria-valuenow', String(visited.size));
  progressTrack.setAttribute('aria-valuetext', `${visited.size} مراحل من ${UNIT2_PAGES.length}`);
  progressFill.style.width = `${percentage}%`;
  mobileProgressFill.style.width = `${percentage}%`;
  const stage = UNIT2_PAGES[index];
  controlCenter.textContent = stage.id === 'student-notebook'
    ? `المرحلة ${index + 1} من ${UNIT2_PAGES.length} · دفتر الطالب`
    : `المرحلة ${index + 1} من ${UNIT2_PAGES.length} · صفحة ${stage.page}`;
}

function updateControls(index) {
  const previous = UNIT2_PAGES[index - 1];
  const next = UNIT2_PAGES[index + 1];
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

/* The rail carries fifteen tabs (fourteen book pages + the student notebook), so
   on a short laptop window it is taller than a sticky rail may be. The rail is
   bounded to the viewport and only `#page-nav` scrolls; `railMaxHeight()` and
   `revealScrollTop()` are the shared helpers Lesson 1 and Lesson 2 already use. */
const sidebar = document.querySelector('.lesson-sidebar');
const shortRailQuery = window.matchMedia?.('(min-width: 821px) and (max-height: 800px)');

function fitRailToViewport() {
  if (!sidebar) return;
  if (!shortRailQuery?.matches) {
    if (sidebar.style.getPropertyValue('--rail-max-height')) sidebar.style.removeProperty('--rail-max-height');
    return;
  }
  const height = railMaxHeight({
    viewportHeight: window.innerHeight,
    railTop: sidebar.getBoundingClientRect().top,
  });
  if (height === null) {
    sidebar.style.removeProperty('--rail-max-height');
    return;
  }
  sidebar.style.setProperty('--rail-max-height', `${height}px`);
}

/* Keeps the active tab inside the rail's own scrollport, never the window. */
function revealActiveStep() {
  if (!nav) return;
  const active = nav.querySelector('[aria-current="step"]');
  if (!active) return;
  const listBox = nav.getBoundingClientRect();
  const stepBox = active.getBoundingClientRect();
  nav.scrollTop = revealScrollTop({
    scrollTop: nav.scrollTop,
    scrollHeight: nav.scrollHeight,
    clientHeight: nav.clientHeight,
    listTop: listBox.top,
    listBottom: listBox.bottom,
    itemTop: stepBox.top,
    itemBottom: stepBox.bottom,
  });
}

let revealFrame = 0;
function refreshRail({ reveal = true } = {}) {
  if (revealFrame) return;
  revealFrame = window.requestAnimationFrame(() => {
    revealFrame = 0;
    fitRailToViewport();
    if (reveal) revealActiveStep();
  });
}
window.addEventListener('resize', () => refreshRail({ reveal: true }));
window.addEventListener('scroll', () => refreshRail({ reveal: false }), { passive: true });
shortRailQuery?.addEventListener?.('change', () => refreshRail({ reveal: true }));
fitRailToViewport();

function goToPage(index, moveFocus = false) {
  const bounded = Math.max(0, Math.min(UNIT2_PAGES.length - 1, index));
  if (bounded === activeIndex && pageContent.childElementCount > 0) return;
  activeIndex = bounded;
  pageContent.setAttribute('aria-busy', 'true');
  renderPage(UNIT2_PAGES[activeIndex], activeIndex);
  pageContent.setAttribute('aria-busy', 'false');
  refreshRail({ reveal: true });
  if (moveFocus) {
    pageHeading.focus({ preventScroll: true });
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    pageHeading.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  }
}

UNIT2_PAGES.forEach((page, index) => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'page-nav-button';
  button.setAttribute('aria-label', page.id === 'student-notebook'
    ? `${page.navLabel} — المرحلة الأخيرة في الدرس`
    : `الصفحة ${page.page}: ${page.navLabel}`);
  const isNotebook = page.id === 'student-notebook';
  button.dataset.stage = isNotebook ? 'student-notebook' : `page-${page.page}`;
  button.innerHTML = `<span class="nav-page-number" dir="ltr">${page.page}</span><span class="nav-page-copy"><strong>${escapeHtml(page.navLabel)}</strong><small>${isNotebook ? 'مرجع الدرس الكامل' : 'صفحة من الكتاب'}</small></span><span class="nav-current-mark" aria-hidden="true">↙</span>`;
  button.addEventListener('click', () => goToPage(index, true));
  nav.append(button);
});

previousButton.addEventListener('click', () => goToPage(activeIndex - 1, true));
nextButton.addEventListener('click', () => goToPage(activeIndex + 1, true));

window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target?.closest?.('input, button, select, textarea, a, [contenteditable="true"]')) return;
  if (event.key === 'PageDown' && activeIndex < UNIT2_PAGES.length - 1) { event.preventDefault(); goToPage(activeIndex + 1, true); }
  if (event.key === 'PageUp' && activeIndex > 0) { event.preventDefault(); goToPage(activeIndex - 1, true); }
});

goToPage(0);
