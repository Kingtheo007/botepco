// accordion.js — enhances native <details> groups marked [data-accordion].
// <details name="…"> already gives one-open-at-a-time behaviour in current
// browsers; this adds it for older ones, opens the item named in the URL hash,
// and keeps the hash in sync so a question can be shared by link.

export default function initAccordions() {
  const nativeExclusive = 'name' in HTMLDetailsElement.prototype;

  document.querySelectorAll('[data-accordion]').forEach((group) => {
    const items = [...group.querySelectorAll(':scope > details')];

    items.forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        if (!nativeExclusive) {
          items.forEach((other) => {
            if (other !== details) other.open = false;
          });
        }
        if (details.id) {
          history.replaceState(null, '', `#${details.id}`);
        }
      });
    });
  });

  openFromHash();
  window.addEventListener('hashchange', openFromHash);
}

function openFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  const details = target?.closest('details');
  if (!details) return;
  details.open = true;
  details.querySelector('summary')?.focus({ preventScroll: true });
  details.scrollIntoView({ block: 'start' });
}
