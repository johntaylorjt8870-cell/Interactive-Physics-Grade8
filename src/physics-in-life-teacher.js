import { mountTeacherArea } from './teacher-area.js';
import { verifyTeacherPassword } from './teacher-auth.js';
import { PHYSICS_IN_LIFE_TEACHER_PAYLOAD } from './physics-in-life-teacher-payload.js';

/*
 * The authored solutions live in physics-in-life-teacher-content.js, which the
 * production build excludes from dist/. Only this authenticated ciphertext is
 * deployed; it is decrypted after the shared teacher gate succeeds, exactly like
 * the Unit 2 exercise solutions.
 */

const fromBase64 = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

async function decryptTeacherContent(password) {
  if (!globalThis.crypto?.subtle) throw new Error('secure-context-required');
  const encoder = new TextEncoder();
  const material = await globalThis.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await globalThis.crypto.subtle.deriveKey({
    name: 'PBKDF2',
    salt: fromBase64(PHYSICS_IN_LIFE_TEACHER_PAYLOAD.salt),
    iterations: PHYSICS_IN_LIFE_TEACHER_PAYLOAD.iterations,
    hash: 'SHA-256',
  }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plaintext = await globalThis.crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv: fromBase64(PHYSICS_IN_LIFE_TEACHER_PAYLOAD.iv),
  }, key, fromBase64(PHYSICS_IN_LIFE_TEACHER_PAYLOAD.ciphertext));
  const html = new TextDecoder().decode(plaintext);
  /* AES-GCM already authenticates the bytes; this also pins the expected guide. */
  if (!html.includes('دليل المعلم · الفيزياء في حياتنا · الدرس الأول')
    || !html.includes('حلول الاختبارات القصيرة (16 سؤالاً)')
    || !html.includes('pil-teacher-quizzes')) {
    throw new Error('teacher-payload-integrity-failed');
  }
  return { renderTeacherContent: () => html };
}

/* Reuses the platform's existing verifier and gate; no second login system. */
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
