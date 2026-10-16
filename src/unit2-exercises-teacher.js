import { mountTeacherArea } from './teacher-area.js';
import { verifyTeacherPassword } from './teacher-auth.js';
import { UNIT2_TEACHER_PAYLOAD } from './unit2-exercises-teacher-payload.js';

const fromBase64 = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

async function decryptTeacherContent(password) {
  if (!globalThis.crypto?.subtle) throw new Error('secure-context-required');
  const encoder = new TextEncoder();
  const material = await globalThis.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await globalThis.crypto.subtle.deriveKey({
    name: 'PBKDF2',
    salt: fromBase64(UNIT2_TEACHER_PAYLOAD.salt),
    iterations: UNIT2_TEACHER_PAYLOAD.iterations,
    hash: 'SHA-256',
  }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plaintext = await globalThis.crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv: fromBase64(UNIT2_TEACHER_PAYLOAD.iv),
  }, key, fromBase64(UNIT2_TEACHER_PAYLOAD.ciphertext));
  const html = new TextDecoder().decode(plaintext);
  if (!html.includes('الحلول النموذجية المشروحة لتمرينات الوحدة الثانية') || !html.includes('teacher-q3b1')) {
    throw new Error('teacher-payload-integrity-failed');
  }
  return { renderTeacherContent: () => html };
}

mountTeacherArea({
  form: document.querySelector('#teacher-login'),
  passwordInput: document.querySelector('#teacher-password'),
  feedback: document.querySelector('#teacher-auth-message'),
  workspace: document.querySelector('#teacher-workspace'),
  submitButton: document.querySelector('#teacher-login-submit'),
  verifyPassword: verifyTeacherPassword,
  loadContent: decryptTeacherContent,
  passPasswordToContent: true,
});
