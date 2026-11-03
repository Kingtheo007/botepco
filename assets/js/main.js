// main.js — entry point. Everything here is progressive enhancement: the site
// works without JavaScript. Navigation and the cookie banner load on every
// page; other modules load only when the page contains what they enhance.

import initNav from './nav.js';
import initCookieBanner from './cookie-banner.js';

initNav();
initCookieBanner();

// Review aid: add ?placeholders to any URL to outline dummy content (elements with data-placeholder)
if (new URLSearchParams(window.location.search).has('placeholders')) {
  document.documentElement.classList.add('show-placeholders');
}

const features = [
  ['[data-search-toggle], [data-search-page]', () => import('./search.js')],
  ['[data-accordion]', () => import('./accordion.js')],
  ['[data-count]', () => import('./counters.js')],
  ['[data-register-search]', () => import('./register-search.js')],
  ['[data-filter], [data-deadline]', () => import('./listing.js')],
  ['form[data-form]', () => import('./forms.js')],
  ['[data-map]', () => import('./map.js')],
  ['[data-copy-link]', () => import('./share.js')],
];

for (const [selector, load] of features) {
  if (document.querySelector(selector)) {
    load()
      .then((module) => module.default())
      .catch((error) => console.error(`Could not load module for ${selector}`, error));
  }
}
