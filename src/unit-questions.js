import { renderUnitQuestions } from './unit-questions-content.js';

const content = document.querySelector('#unit-question-content');
if (!content) throw new Error('Unit Questions content mount point is missing.');

content.innerHTML = renderUnitQuestions();
content.setAttribute('aria-busy', 'false');
