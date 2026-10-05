import { mountTeacherArea } from './teacher-area.js';
import { verifyTeacherPassword } from './teacher-auth.js';

const form = document.querySelector('#teacher-login');
const passwordInput = document.querySelector('#teacher-password');
const feedback = document.querySelector('#teacher-auth-message');
const workspace = document.querySelector('#teacher-workspace');
const submitButton = document.querySelector('#teacher-login-submit');

mountTeacherArea({
  form,
  passwordInput,
  feedback,
  workspace,
  submitButton,
  verifyPassword: verifyTeacherPassword,
  loadContent: () => import('./teacher-content.js'),
});
