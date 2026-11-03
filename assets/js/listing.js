// listing.js — listing page enhancements.
// Filter chips: every item is visible without JS; the chips appear only when
// this module runs and hide items whose data-category doesn't match.
// Deadlines: badges with data-deadline show "Open" or "Closed" based on today's
// date, so a static page never shows a stale status.

export default function initListing() {
  document.querySelectorAll('[data-filter]').forEach(bindFilter);
  markDeadlines();
}

function bindFilter(group) {
  const list = document.getElementById(group.dataset.filter);
  if (!list) return;
  const status = document.querySelector(`[data-filter-status="${group.dataset.filter}"]`);
  const buttons = [...group.querySelectorAll('[data-filter-value]')];
  group.hidden = false;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.filterValue;
      let shown = 0;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      [...list.children].forEach((item) => {
        const match = value === 'all' || item.dataset.category === value;
        item.hidden = !match;
        if (match) shown += 1;
      });
      if (status) status.textContent = `Showing ${shown} ${shown === 1 ? 'item' : 'items'}.`;
    });
  });
}

function markDeadlines() {
  const now = new Date();
  document.querySelectorAll('[data-deadline]').forEach((badge) => {
    const closes = new Date(`${badge.dataset.deadline}T23:59:59`);
    if (Number.isNaN(closes.getTime())) return;
    const open = closes >= now;
    badge.textContent = open ? 'Open' : 'Closed';
    badge.classList.add(open ? 'badge--ok' : 'badge--alert');
    badge.hidden = false;
  });
}
