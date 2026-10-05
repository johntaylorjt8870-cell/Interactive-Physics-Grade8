export function mountTeacherArea({
  form,
  passwordInput,
  feedback,
  workspace,
  submitButton,
  verifyPassword,
  loadContent,
}) {
  const required = [form, passwordInput, feedback, workspace, submitButton, verifyPassword, loadContent];
  if (required.some((item) => !item)) {
    throw new TypeError('Teacher Area requires its form, fields, verifier, and content loader.');
  }

  workspace.hidden = true;
  let pending = false;

  const logout = () => {
    workspace.replaceChildren();
    workspace.hidden = true;
    form.hidden = false;
    passwordInput.value = '';
    feedback.textContent = '';
    feedback.hidden = true;
    submitButton.disabled = false;
    form.setAttribute('aria-busy', 'false');
    passwordInput.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;

    pending = true;
    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    feedback.textContent = '';
    feedback.hidden = true;

    try {
      const authorized = await verifyPassword(passwordInput.value);
      if (!authorized) {
        feedback.textContent = 'كلمة المرور غير صحيحة؛ حاول مرة أخرى.';
        feedback.hidden = false;
        passwordInput.select?.();
        return;
      }

      const module = await loadContent();
      if (typeof module?.renderTeacherContent !== 'function') {
        throw new Error('teacher-content-unavailable');
      }

      workspace.innerHTML = module.renderTeacherContent();
      passwordInput.value = '';
      form.hidden = true;
      workspace.hidden = false;
      feedback.textContent = '';
      feedback.hidden = true;
      workspace.querySelector('[data-teacher-logout]')?.addEventListener('click', logout);
      workspace.querySelector('#teacher-workspace-heading')?.focus();
    } catch (error) {
      feedback.textContent = error?.message === 'secure-context-required'
        ? 'تعذّر التحقق في هذا السياق. افتح الصفحة عبر اتصال آمن أو localhost.'
        : 'تعذّر فتح مادة المعلم الآن. أعد المحاولة.';
      feedback.hidden = false;
    } finally {
      pending = false;
      submitButton.disabled = false;
      form.setAttribute('aria-busy', 'false');
    }
  });

  return { logout };
}
