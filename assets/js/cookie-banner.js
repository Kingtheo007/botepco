// cookie-banner.js — lightweight consent banner.
// The site itself sets no tracking cookies. The banner only asks before loading
// third-party services (e.g. the Google map on the Contact page). The choice is
// kept in localStorage and announced with a "consent:change" event so modules
// can load or skip optional embeds. Without JS nothing optional loads, so no
// banner is needed.

const STORAGE_KEY = 'botepco-consent-v1';
let banner;

export default function initCookieBanner() {
  document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => show({ focus: true }));
  });

  const stored = readChoice();
  if (stored) announce(stored);
  else show({ focus: false });
}

export function hasOptionalConsent() {
  return readChoice()?.optional === true;
}

function readChoice() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveChoice(optional) {
  const choice = { optional, date: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // Storage blocked: the choice still applies for this page view
  }
  announce(choice);
}

function announce(choice) {
  document.documentElement.dataset.consent = choice.optional ? 'all' : 'essential';
  window.dispatchEvent(new CustomEvent('consent:change', { detail: choice }));
}

function show({ focus }) {
  banner ??= build();
  banner.hidden = false;
  if (focus) banner.querySelector('button').focus();
}

function build() {
  const element = document.createElement('section');
  element.className = 'cookie-banner';
  element.setAttribute('aria-labelledby', 'cookie-banner-title');
  element.innerHTML = `
    <h2 id="cookie-banner-title">Your privacy choices</h2>
    <p>This site saves your choice on your device. With your permission, some pages also load services from other companies, such as the Google map on the Contact page, which may set their own cookies.</p>
    <p><a href="/cookie-policy/">Read the cookie policy</a></p>
    <div class="cluster">
      <button type="button" class="btn btn--primary" data-consent="all">Accept all</button>
      <button type="button" class="btn btn--primary" data-consent="essential">Essential only</button>
    </div>`;

  element.addEventListener('click', (event) => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    saveChoice(button.dataset.consent === 'all');
    element.hidden = true;
  });

  element.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && readChoice()) element.hidden = true;
  });

  // Placed straight after the skip link so keyboard users meet it early
  const skip = document.querySelector('.skip-link');
  if (skip) skip.after(element);
  else document.body.prepend(element);
  return element;
}
