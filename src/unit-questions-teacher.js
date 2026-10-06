import { mountTeacherArea } from './teacher-area.js';
import { verifyTeacherPassword } from './teacher-auth.js';

mountTeacherArea({
  form: document.querySelector('#teacher-login'),
  passwordInput: document.querySelector('#teacher-password'),
  feedback: document.querySelector('#teacher-auth-message'),
  workspace: document.querySelector('#teacher-workspace'),
  submitButton: document.querySelector('#teacher-login-submit'),
  verifyPassword: verifyTeacherPassword,
  loadContent: () => import('./unit-questions-teacher-content.js'),
});
