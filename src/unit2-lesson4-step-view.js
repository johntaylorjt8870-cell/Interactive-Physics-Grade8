/* Renders exactly one textbook page («خطوة») of Unit 2 Lesson 4.
 *
 * The lesson is taught one page at a time: unit2-lesson4-main.js hands this
 * module the active page entry and swaps the returned article into
 * `#page-content`. Nothing here renders the whole lesson at once; steps are
 * built once and re-attached, so answers, hints, lab readings and notebook text
 * survive stepping away and back.
 */
import { ACTIVITIES } from './unit2-lesson4-activities.js';
import { unit2l4DiagramMarkup } from './unit2-lesson4-diagrams.js';
import { mountUnit2L4Practice, unit2l4PracticeMarkup } from './unit2-lesson4-practice.js';
import { mountUnit2L4Simulations, unit2l4SimulationMarkup } from './unit2-lesson4-simulations.js';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const activityById = new Map(ACTIVITIES.map((activity) => [activity.id, activity]));

const storage = {
  read(key) {
    try { return localStorage.getItem(key) ?? ''; } catch { return ''; }
  },
  write(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
  },
};

function notebookBlock(id, page) {
  const activity = activityById.get(id);
  if (!activity) throw new RangeError(`Unknown book demand for the notebook: ${id}`);
  const key = `u2l4-note-${id}`;
  const saved = storage.read(key);
  return `<details class="r4-notebook" data-notebook="${id}" data-source-page="p${page}">
    <summary><span class="r4-notebook-page" dir="ltr">ص${page}</span><span class="r4-notebook-label">${escapeHtml(activity.label)}</span><span class="r4-notebook-state" data-notebook-state>${saved ? 'محفوظة' : 'فارغة'}</span></summary>
    <div class="r4-notebook-body">
      <p class="r4-notebook-prompt">${escapeHtml(activity.prompt)}</p>
      <label class="r4-notebook-field" for="note-${id}">إجابتي أو ملاحظتي</label>
      <textarea id="note-${id}" data-notebook-input="${id}" rows="4" placeholder="اكتب توقّعك أو خطوات الحل هنا…">${escapeHtml(saved)}</textarea>
      <small data-notebook-status role="status">${saved ? 'استُعيدت من هذا الجهاز.' : 'تُحفظ محلياً على هذا الجهاز عند الكتابة.'}</small>
    </div>
  </details>`;
}

function renderBlock(block, page, index) {
  if (block.type === 'book') {
    return `<div class="r4-book-copy" data-book-copy="p${page.page}"><span class="r4-book-label">نص الكتاب</span>${block.html}</div>`;
  }
  if (block.type === 'platform') {
    return `<aside class="r4-platform-card r4-platform-${escapeHtml(block.kind)}" aria-label="شرح المنصة: ${escapeHtml(block.title)}">
      <div class="r4-platform-label"><span aria-hidden="true">✦</span> شرح المنصة · لا اقتباس</div>
      <h4>${escapeHtml(block.title)}</h4>${block.html}</aside>`;
  }
  if (block.type === 'diagram') {
    return unit2l4DiagramMarkup(block.id, `p${page.page}-figure-${index}`);
  }
  if (block.type === 'simulation') {
    return unit2l4SimulationMarkup(block.id);
  }
  if (block.type === 'practice') {
    return unit2l4PracticeMarkup(block.id);
  }
  if (block.type === 'notebook') {
    return notebookBlock(block.id, page.page);
  }
  throw new TypeError(`Unknown Lesson 4 block type: ${block.type}`);
}

/** Markup for one step: its source label and its blocks in book order. */
export function unit2l4StepMarkup(page) {
  if (!page || !Number.isInteger(page.page) || !Array.isArray(page.blocks)) {
    throw new TypeError('unit2l4StepMarkup needs one lesson page entry.');
  }
  return `<article class="r4-step-view" data-page-view="p${page.page}" data-source-page="p${page.page}" aria-label="الصفحة ${page.page}: ${escapeHtml(page.heading)}">
    <p class="r4-step-source" role="note"><span>من الكتاب · الصفحة <bdi dir="ltr">${page.page}</bdi></span><span class="r4-step-topic">${escapeHtml(page.heading)}</span></p>
    ${page.blocks.map((block, index) => renderBlock(block, page, index)).join('')}
  </article>`;
}

function mountNotebooks(root) {
  for (const host of root.querySelectorAll('[data-notebook]')) {
    if (host.dataset.mounted === 'true') continue;
    host.dataset.mounted = 'true';
    const id = host.dataset.notebook;
    const input = host.querySelector('[data-notebook-input]');
    const status = host.querySelector('[data-notebook-status]');
    const state = host.querySelector('[data-notebook-state]');
    input?.addEventListener('input', () => {
      const saved = storage.write(`u2l4-note-${id}`, input.value);
      if (status) {
        status.textContent = saved
          ? 'حُفظت محلياً على هذا الجهاز.'
          : 'تعذّر الحفظ المحلي؛ انسخ إجابتك قبل مغادرة الصفحة.';
      }
      if (state) state.textContent = saved && input.value.trim() ? 'محفوظة' : 'فارغة';
    });
  }
}

/**
 * Builds a step at most once and keeps the node, so stepping away and back does
 * not reset answers, hints, lab readings or notebook text. `main.js` keeps one
 * cache per lesson; the same cache can be inspected by tests.
 */
export function createUnit2L4StepCache(pages) {
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new TypeError('createUnit2L4StepCache needs the lesson pages.');
  }
  const cache = new Map();
  return {
    get size() { return cache.size; },
    get(index) {
      if (!cache.has(index)) {
        const view = document.createElement('div');
        view.className = 'r4-step';
        view.dataset.stepIndex = String(index);
        view.innerHTML = unit2l4StepMarkup(pages[index]);
        mountUnit2L4Step(view);
        cache.set(index, view);
      }
      return cache.get(index);
    },
  };
}

/** Wires the interactive tools of the step that was just inserted into the DOM. */
export function mountUnit2L4Step(root) {
  if (!root) return;
  mountUnit2L4Simulations(root);
  mountUnit2L4Practice(root);
  mountNotebooks(root);
}
