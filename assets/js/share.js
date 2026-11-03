// share.js — "Copy link" button on articles. The other share options are plain
// links and work without JS; this button only appears when the clipboard API exists.

export default function initShare() {
  if (!navigator.clipboard) return;
  document.querySelectorAll('[data-copy-link]').forEach((button) => {
    const status = button.closest('.share')?.querySelector('[data-copy-status]');
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (status) status.textContent = 'Link copied.';
      } catch {
        if (status) status.textContent = 'Couldn’t copy the link. Copy it from the address bar instead.';
      }
    });
  });
}
