/* Renders «الفيزياء في حياتنا» lesson cards from the section registry. */
import { PHYSICS_IN_LIFE_LESSONS, SECTION_META } from './physics-in-life-lessons.js';
import { lessonCardScene } from './physics-in-life-scenes.js';

function statusLabel(status) {
  return status === 'available' ? 'متاح الآن' : 'قيد الإعداد';
}

function card(lesson, index) {
  const available = lesson.status === 'available';
  const action = available
    ? `<a class="pil-primary-link" href="${lesson.href}"><span>اكتشف التجربة</span><span aria-hidden="true">←</span></a>`
    : '<span class="pil-lesson-status is-preparing">قيد الإعداد</span>';
  return `<article class="pil-lesson-card" aria-labelledby="pil-lesson-${lesson.id}-title">
    <div class="pil-lesson-art">
      ${lessonCardScene(lesson.scene, `pil-card-${lesson.id}`)}
      <span class="pil-lesson-number" dir="ltr">LESSON 0${index + 1}</span>
    </div>
    <div class="pil-lesson-body">
      <span class="pil-lesson-status${available ? '' : ' is-preparing'}">${statusLabel(lesson.status)}</span>
      <p class="pil-kicker" style="margin:0">${lesson.kicker}</p>
      <h3 id="pil-lesson-${lesson.id}-title">${lesson.title}</h3>
      <p class="pil-lesson-curiosity">${lesson.curiosity}</p>
      <p class="pil-lesson-description">${lesson.description}</p>
      <div class="pil-lesson-meta">
        <span>${lesson.meta}</span>
        <span>${available ? 'مختبر افتراضي كامل' : 'سيُعلن عند جاهزيته'}</span>
      </div>
      ${action}
    </div>
  </article>`;
}

function mount() {
  const cards = document.querySelector('#pil-lesson-cards');
  const art = document.querySelector('#pil-hero-art');
  if (!cards) return;
  cards.innerHTML = PHYSICS_IN_LIFE_LESSONS.map(card).join('');
  if (art) art.innerHTML = lessonCardScene('tugboats', 'pil-hero-scene');
  document.title = `${SECTION_META.title} | Interactive Physics — Grade 8`;
}

mount();
