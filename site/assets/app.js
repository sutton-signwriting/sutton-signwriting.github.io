document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const text = document.getElementById(button.dataset.copy).textContent;
    const status = button.parentElement.querySelector('[role=status]');
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement('textarea'); field.value = text;
        field.style.position = 'fixed'; field.style.opacity = '0'; document.body.append(field); field.select();
        const copied = document.execCommand('copy'); field.remove(); button.focus();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      status.textContent = 'Copied.';
    } catch { status.textContent = 'Select and copy the code below.'; }
  });
});
