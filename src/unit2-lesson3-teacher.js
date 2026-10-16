import { mountTeacherArea } from './teacher-area.js';
import { verifyTeacherPassword } from './teacher-auth.js';

const form = document.querySelector('#teacher-login');
const gate = document.querySelector('.teacher-gate');
const passwordInput = document.querySelector('#teacher-password');
const feedback = document.querySelector('#teacher-auth-message');
const workspace = document.querySelector('#teacher-workspace');
const submitButton = document.querySelector('#teacher-login-submit');

// The shared gate hides its form after login; hide its now-empty wrapper too.
const gateVisibility = new MutationObserver(() => {
  gate.hidden = form.hidden;
});
gateVisibility.observe(form, { attributes: true, attributeFilter: ['hidden'] });

gate.hidden = form.hidden;

mountTeacherArea({
  form,
  passwordInput,
  feedback,
  workspace,
  submitButton,
  verifyPassword: verifyTeacherPassword,
  loadContent: () => import('./unit2-lesson3-teacher-content.js'),
});
