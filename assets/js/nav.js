// nav.js — header navigation.
// Without JS: the menu button is a link to #site-menu (shown via :target) and
// desktop dropdowns open on hover/focus-within. With JS: real disclosure
// buttons with aria-expanded, Escape to close, arrow keys inside dropdowns,
// and aria-current set from the URL so header markup stays identical everywhere.

const desktop = window.matchMedia('(min-width: 64em)');

export default function initNav() {
  markCurrentPage();
  initMenuToggle();
  initSubmenus();
}

function normalisePath(path) {
  const clean = path.replace(/index\.html$/, '');
  return clean.endsWith('/') ? clean : `${clean}/`;
}

function markCurrentPage() {
  const here = normalisePath(window.location.pathname);
  const links = document.querySelectorAll('.site-nav a[href^="/"]');

  links.forEach((link) => {
    if (normalisePath(new URL(link.href).pathname) === here) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // Highlight the section parent when on one of its child pages
  document.querySelectorAll('.nav-item--has-sub').forEach((item) => {
    const parent = item.querySelector('.nav-link');
    const sectionPath = normalisePath(new URL(parent.href).pathname);
    const inSection = [...item.querySelectorAll('.nav-sub a')]
      .some((a) => normalisePath(new URL(a.href).pathname) === here) || here.startsWith(sectionPath);
    if (inSection && !parent.hasAttribute('aria-current')) {
      parent.setAttribute('aria-current', 'true');
    }
  });
}

function asButton(link) {
  link.setAttribute('role', 'button');
  link.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      link.click();
    }
  });
}

function initMenuToggle() {
  const toggle = document.querySelector('[data-menu-toggle]');
  if (!toggle) return;
  const nav = document.getElementById(toggle.getAttribute('aria-controls'));
  const label = toggle.querySelector('[data-menu-label]');

  asButton(toggle);
  toggle.setAttribute('aria-expanded', 'false');

  const setOpen = (open, { returnFocus = false } = {}) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('nav-open', open && !desktop.matches);
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open') && !desktop.matches) {
      setOpen(false, { returnFocus: true });
    }
  });

  desktop.addEventListener('change', () => setOpen(false));

  // Someone arrived on a #site-menu link: open the menu in its enhanced state
  // (clearing the hash first so the no-JS :target styles stop applying)
  if (window.location.hash === '#site-menu') {
    window.location.hash = '';
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setOpen(true);
  }
}

function initSubmenus() {
  const items = [...document.querySelectorAll('.nav-item--has-sub')];

  const setItem = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('.nav-sub-toggle').setAttribute('aria-expanded', String(open));
    if (open && desktop.matches) {
      items.forEach((other) => other !== item && setItem(other, false));
    }
  };

  items.forEach((item) => {
    const button = item.querySelector('.nav-sub-toggle');
    const links = () => [...item.querySelectorAll('.nav-sub a')];
    let closeTimer;
    button.hidden = false;

    button.addEventListener('click', () => {
      const hoverOpened = desktop.matches && item.matches(':hover') && item.classList.contains('is-open');
      setItem(item, hoverOpened ? true : !item.classList.contains('is-open'));
    });

    // Mouse users on desktop get hover-to-open; state is mirrored in aria-expanded
    item.addEventListener('pointerenter', (event) => {
      if (!desktop.matches || event.pointerType !== 'mouse') return;
      clearTimeout(closeTimer);
      setItem(item, true);
    });
    item.addEventListener('pointerleave', (event) => {
      if (!desktop.matches || event.pointerType !== 'mouse') return;
      closeTimer = setTimeout(() => setItem(item, false), 250);
    });

    item.addEventListener('focusout', (event) => {
      if (desktop.matches && !item.contains(event.relatedTarget)) setItem(item, false);
    });

    item.addEventListener('keydown', (event) => {
      const inSub = event.target.closest('.nav-sub');

      if (event.key === 'Escape' && item.classList.contains('is-open')) {
        event.stopPropagation();
        setItem(item, false);
        button.focus();
        return;
      }

      if (event.key === 'ArrowDown' && event.target === button) {
        event.preventDefault();
        setItem(item, true);
        links()[0]?.focus();
        return;
      }

      if (inSub && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        const list = links();
        const index = list.indexOf(event.target);
        const step = event.key === 'ArrowDown' ? 1 : -1;
        list[(index + step + list.length) % list.length].focus();
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (desktop.matches && !event.target.closest('.nav-item--has-sub')) {
      items.forEach((item) => setItem(item, false));
    }
  });

  desktop.addEventListener('change', () => items.forEach((item) => setItem(item, false)));
}
