import { UNIT2L3_PAGES, UNIT2L3_STATIONS } from './unit2-lesson3-content.js';
import { unit2l3DiagramMarkup } from './unit2-lesson3-diagrams.js';
import { mountUnit2Lesson3Simulations, unit2l3SimulationMarkup } from './unit2-lesson3-simulation.js';

const root = document.querySelector('#lesson-stations');
if (!root) throw new Error('Lesson 3 student content root is missing.');

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function renderBlock(block, page, index) {
  if (block.type === 'book') {
    return `<div class="p3-book-copy" data-book-copy="p${page.page}"><span class="p3-book-copy-label">من الكتاب</span>${block.html}</div>`;
  }
  if (block.type === 'platform') {
    return `<aside class="p3-platform-card p3-platform-${escapeHtml(block.kind)}" aria-label="شرح المنصة: ${escapeHtml(block.title)}"><div class="p3-platform-label"><span aria-hidden="true">✦</span> شرح المنصة</div><h4>${escapeHtml(block.title)}</h4>${block.html}</aside>`;
  }
  if (block.type === 'diagram') {
    return unit2l3DiagramMarkup(block.id, `p${page.page}-figure-${index}`);
  }
  if (block.type === 'simulation') {
    return unit2l3SimulationMarkup(block.id);
  }
  throw new TypeError(`Unknown Lesson 3 block type: ${block.type}`);
}

function renderPage(page) {
  return `<article class="p3-page-card" id="source-page-${page.page}" data-source-page="p${page.page}" aria-labelledby="source-page-${page.page}-heading">
    <header class="p3-page-card-heading"><div class="p3-page-marker"><span>صفحة الكتاب</span><strong dir="ltr">${page.page}</strong></div><div><p>المصدر الرسمي · الكتاب</p><h3 id="source-page-${page.page}-heading">${escapeHtml(page.heading)}</h3></div><span class="p3-page-ornament" aria-hidden="true">U</span></header>
    <div class="p3-page-content">${page.blocks.map((block, index) => renderBlock(block, page, index)).join('')}</div>
  </article>`;
}

function renderStation(station) {
  const pages = station.pages.map((pageNumber) => UNIT2L3_PAGES.find((page) => page.page === pageNumber)).filter(Boolean);
  return `<section class="p3-station" id="station-${station.id}" data-lesson-station="${station.id}" aria-labelledby="station-${station.id}-heading">
    <header class="p3-station-heading"><div class="p3-station-count"><span>${station.index}</span><i aria-hidden="true">${station.icon}</i></div><div><p>محطة ${station.index} · صفحات <bdi dir="ltr">${station.range}</bdi></p><h2 id="station-${station.id}-heading">${escapeHtml(station.title)}</h2></div><span class="p3-station-flourish" aria-hidden="true"></span></header>
    <div class="p3-station-pages">${pages.map(renderPage).join('')}</div>
  </section>`;
}

root.innerHTML = UNIT2L3_STATIONS.map(renderStation).join('');
mountUnit2Lesson3Simulations(document);

const navLinks = [...document.querySelectorAll('[data-station-link]')];
const progressTrack = document.querySelector('#station-progress-track');
const progressFill = document.querySelector('#station-progress-fill');
const progressLabel = document.querySelector('#station-progress-label');
const progressValue = document.querySelector('#station-progress-value');
const stations = [...document.querySelectorAll('[data-lesson-station]')];

function setCurrentStation(id) {
  const index = UNIT2L3_STATIONS.findIndex((station) => station.id === id);
  if (index < 0) return;
  const station = UNIT2L3_STATIONS[index];
  navLinks.forEach((link) => {
    if (link.dataset.stationLink === id) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  progressTrack.setAttribute('aria-valuenow', String(index + 1));
  progressFill.style.width = `${((index + 1) / UNIT2L3_STATIONS.length) * 100}%`;
  progressLabel.textContent = `المحطة ${station.index} من ${UNIT2L3_STATIONS.length} · ${station.title}`;
  progressValue.textContent = `${Math.round(((index + 1) / UNIT2L3_STATIONS.length) * 100)}%`;
}

if ('IntersectionObserver' in window) {
  const visibleStations = new Map();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleStations.set(entry.target.dataset.lessonStation, entry.intersectionRatio);
      else visibleStations.delete(entry.target.dataset.lessonStation);
    }
    const current = [...visibleStations.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (current) setCurrentStation(current);
  }, { rootMargin: '-16% 0px -58% 0px', threshold: [0.01, 0.12, 0.3, 0.6] });
  stations.forEach((station) => observer.observe(station));
} else {
  window.addEventListener('scroll', () => {
    const target = stations.find((station) => station.getBoundingClientRect().top >= -120) ?? stations.at(-1);
    if (target) setCurrentStation(target.dataset.lessonStation);
  }, { passive: true });
}

navLinks.forEach((link) => link.addEventListener('click', () => {
  setCurrentStation(link.dataset.stationLink);
}));
