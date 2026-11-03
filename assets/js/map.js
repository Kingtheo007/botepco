// map.js — loads the Google map on the Contact page only with permission:
// immediately if the visitor accepted optional services in the cookie banner,
// otherwise when they press "Show the map". Without JS a plain link to
// Google Maps is shown instead.

import { hasOptionalConsent } from './cookie-banner.js';

export default function initMaps() {
  document.querySelectorAll('[data-map]').forEach((box) => {
    const load = () => {
      if (box.classList.contains('is-loaded')) return;
      const frame = document.createElement('iframe');
      frame.src = box.dataset.mapSrc;
      frame.title = box.dataset.mapTitle || 'Map';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      box.replaceChildren(frame);
      box.classList.add('is-loaded');
    };

    const button = box.querySelector('[data-map-load]');
    if (button) {
      button.hidden = false;
      button.addEventListener('click', load);
    }

    if (hasOptionalConsent()) load();
    window.addEventListener('consent:change', (event) => {
      if (event.detail?.optional) load();
    });
  });
}
