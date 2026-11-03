// register-search.js — "Check the teacher register" form.
// Defines exactly what happens on submit:
//   1. Invalid input  → inline error next to the field, focus stays in the field.
//   2. No endpoint    → clear "not connected yet" result with contact details.
//   3. Endpoint set   → POST { name } and show matches, "no match", or an error.
// Set data-endpoint on the form once a register API exists (contract in README).
// Without JS the form goes to the Teacher Verification page. The name field has
// no name attribute, so the teacher's name never ends up in a URL.

const MIN_LENGTH = 3;
const NAME_PATTERN = /^[\p{L}][\p{L}' .-]*$/u;
const CONTACT = 'contact BOTEPCO on <a href="tel:+2673933472">(+267) 393 3472</a> or <a href="mailto:enquiries@botepco.org.bw">enquiries@botepco.org.bw</a> (Monday to Friday, 08:00–17:00)';

export default function initRegisterSearch() {
  document.querySelectorAll('[data-register-search]').forEach(bind);
}

function bind(form) {
  const input = form.querySelector('input[type="text"]');
  const error = form.querySelector('.field-error');
  const result = form.querySelector('[data-register-result]');
  const endpoint = (form.dataset.endpoint || '').trim();

  const showError = (message) => {
    error.textContent = message;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    result.hidden = true;
    input.focus();
  };

  const clearError = () => {
    error.hidden = true;
    error.textContent = '';
    input.removeAttribute('aria-invalid');
  };

  const render = (html, { warn = false, focus = true } = {}) => {
    result.innerHTML = html;
    result.classList.toggle('verify-result--warn', warn);
    result.hidden = false;
    if (focus) result.focus();
  };

  input.addEventListener('input', clearError);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = input.value.trim().replace(/\s+/g, ' ');

    if (name.length < MIN_LENGTH) {
      showError(`Enter at least ${MIN_LENGTH} letters of the teacher’s name.`);
      return;
    }
    if (!NAME_PATTERN.test(name)) {
      showError('Use letters only. Names can include spaces, hyphens and apostrophes.');
      return;
    }
    clearError();

    if (!endpoint) {
      render(notConnected(name), { warn: true });
      return;
    }

    render('<p role="status">Searching the register…</p>', { focus: false });
    form.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const results = Array.isArray(data.results) ? data.results : [];
      if (results.length) render(matches(name, results));
      else render(noMatch(name), { warn: true });
    } catch (err) {
      console.error('Register search failed', err);
      render(failed(), { warn: true });
    } finally {
      form.removeAttribute('aria-busy');
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? escapeHtml(iso)
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function notConnected(name) {
  return `
    <h3>Online register search isn’t available yet</h3>
    <p>You searched for “<strong>${escapeHtml(name)}</strong>”. This website can’t look up the teacher register yet, so no result is shown.</p>
    <p>To verify a teacher’s registration or licence status, ${CONTACT}.</p>
    <p><a href="/services/teacher-verification/">About teacher verification</a></p>`;
}

function statusLabel(entry) {
  const registered = entry.registrationStatus === 'registered';
  const licence = entry.licenceStatus;
  const reg = registered
    ? '<span class="status status--ok">Registered</span>'
    : '<span class="status status--warn">Not currently registered</span>';
  let lic = '<span class="status status--warn">No licence on record</span>';
  if (licence === 'valid') {
    lic = `<span class="status status--ok">Licence valid${entry.licenceExpiry ? ` until ${formatDate(entry.licenceExpiry)}` : ''}</span>`;
  } else if (licence === 'expired') {
    lic = `<span class="status status--warn">Licence expired${entry.licenceExpiry ? ` on ${formatDate(entry.licenceExpiry)}` : ''}</span>`;
  }
  return `${reg} · ${lic}`;
}

function matches(name, results) {
  const items = results.map((entry) => `
    <li>
      <strong>${escapeHtml(entry.fullName)}</strong>
      ${entry.registrationNumber ? `<br><span class="muted">Registration no. ${escapeHtml(entry.registrationNumber)}</span>` : ''}
      <br>${statusLabel(entry)}
    </li>`).join('');
  const count = results.length === 1 ? '1 teacher matches' : `${results.length} teachers match`;
  return `
    <h3>${count} “${escapeHtml(name)}”</h3>
    <ul class="register-matches" role="list">${items}</ul>
    <p class="muted">If the details look wrong, ${CONTACT}.</p>`;
}

function noMatch(name) {
  return `
    <h3>No registered teacher matches “${escapeHtml(name)}”</h3>
    <p>Check the spelling and try the teacher’s full names. If you still can’t find them, ${CONTACT}.</p>`;
}

function failed() {
  return `
    <h3>We couldn’t reach the register</h3>
    <p>Try again in a few minutes. If it keeps happening, ${CONTACT}.</p>`;
}
