// Installer application page: forms.js binds the form itself; this adds the copy-link button.
import './forms.js';

for (const btn of document.querySelectorAll('[data-copy]')) {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    const label = btn.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copied';
    } catch {
      const input = btn.parentElement?.querySelector('input');
      input?.select();
      btn.textContent = 'Select and copy';
    }
    setTimeout(() => { btn.textContent = label; }, 1800);
  });
}
