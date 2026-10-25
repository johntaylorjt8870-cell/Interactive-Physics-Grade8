/**
 * Renders exactly one textbook page («خطوة») of Unit 2 Lesson 3.
 *
 * The lesson is taught one page at a time: `unit2-lesson3-main.js` hands this
 * module the active page entry and swaps the returned article into
 * `#page-content`. Nothing here renders the whole lesson at once — that is what
 * turned the lesson into a single long article before.
 */
import { unit2l3DiagramMarkup } from './unit2-lesson3-diagrams.js';
import { mountUnit2Lesson3Practice, unit2l3PracticeMarkup } from './unit2-lesson3-practice.js';
import { mountUnit2Lesson3Simulations, unit2l3SimulationMarkup } from './unit2-lesson3-simulation.js';

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
  if (block.type === 'practice') {
    return unit2l3PracticeMarkup(block.id);
  }
  throw new TypeError(`Unknown Lesson 3 block type: ${block.type}`);
}

/** Markup for one step: the book page heading, its source label, and its blocks in order. */
export function unit2l3StepMarkup(page) {
  if (!page || !Number.isInteger(page.page) || !Array.isArray(page.blocks)) {
    throw new TypeError('unit2l3StepMarkup needs one lesson page entry.');
  }
  return `<article class="p3-step-view" data-page-view="p${page.page}" data-source-page="p${page.page}" aria-label="الصفحة ${page.page}: ${escapeHtml(page.heading)}">
    <p class="p3-step-source" role="note"><span>من الكتاب · الصفحة <bdi dir="ltr">${page.page}</bdi></span><span class="p3-step-source-topic">${escapeHtml(page.heading)}</span></p>
    ${page.blocks.map((block, index) => renderBlock(block, page, index)).join('')}
  </article>`;
}

/** Wires the interactive tools of the step that was just inserted into the DOM. */
export function mountUnit2l3Step(root) {
  if (!root) return;
  mountUnit2Lesson3Simulations(root);
  mountUnit2Lesson3Practice(root);
}
