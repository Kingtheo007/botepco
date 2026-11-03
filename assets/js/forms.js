// forms.js — validation and submit behaviour for forms marked [data-form].
// Without JS the browser validates natively and the form posts to its action.
// With JS: plain-language errors next to each field plus an error summary,
// then one of three clear outcomes:
//   data-live="false" → "not connected yet" message; nothing is sent.
//   data-live="true"  → POST FormData to the form's action; success or failure message.
// See README, "Backend: forms", for the endpoints each form expects.

const BW_PHONE = /^(?:\+?267)?(?:\d{7}|\d{8})$/;

export default function initForms() {
  document.querySelectorAll('form[data-form]').forEach(bind);
}

function bind(form) {
  const summary = form.querySelector('[data-error-summary]');
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[type="submit"]');
  const submitLabel = submit?.textContent.trim();

  // Re-check a field as soon as the user fixes it
  const recheck = (event) => {
    const field = event.target;
    if (field.matches('input, select, textarea') && isFlagged(field)) checkField(field);
  };
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errors = validate(form);
    if (errors.length) {
      showSummary(summary, errors);
      if (status) status.hidden = true;
      return;
    }
    if (summary) summary.hidden = true;

    const name = form.dataset.formName || 'form';
    const fallback = form.dataset.fallbackEmail || 'enquiries@botepco.org.bw';

    if (form.dataset.live !== 'true') {
      showStatus(status, notConnected(name, fallback), 'warn');
      return;
    }

    form.setAttribute('aria-busy', 'true');
    if (submit) submit.textContent = 'Sending…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      showStatus(status, sent(name), 'ok');
    } catch (error) {
      console.error(`Could not send ${name}`, error);
      showStatus(status, failed(name, fallback), 'warn');
    } finally {
      form.removeAttribute('aria-busy');
      if (submit) submit.textContent = submitLabel;
    }
  });
}

function fieldsOf(form) {
  const seenGroups = new Set();
  return [...form.querySelectorAll('input, select, textarea')].filter((field) => {
    if (field.disabled || ['submit', 'button', 'hidden'].includes(field.type)) return false;
    if (field.type === 'radio') {
      if (seenGroups.has(field.name)) return false;
      seenGroups.add(field.name);
    }
    return true;
  });
}

function validate(form) {
  return fieldsOf(form)
    .map((field) => ({ field, message: checkField(field) }))
    .filter((result) => result.message);
}

function isFlagged(field) {
  if (field.type === 'radio') {
    return field.form.querySelector(`input[name="${CSS.escape(field.name)}"][aria-invalid="true"]`) !== null;
  }
  return field.getAttribute('aria-invalid') === 'true';
}

function checkField(field) {
  if (field.dataset.validate === 'bw-phone') {
    const digits = field.value.replace(/[\s()-]/g, '');
    field.setCustomValidity(digits && !BW_PHONE.test(digits) ? 'Enter a Botswana phone number with 7 or 8 digits, like 71 234 567' : '');
  }
  const valid = field.type === 'radio' ? radioGroupValid(field) : field.checkValidity();
  const message = valid ? '' : messageFor(field);
  setError(field, message);
  return message;
}

function radioGroupValid(radio) {
  const group = [...radio.form.querySelectorAll(`input[name="${CSS.escape(radio.name)}"]`)];
  const required = group.some((r) => r.required);
  return !required || group.some((r) => r.checked);
}

function labelText(field) {
  const label = field.labels?.[0];
  if (!label) return field.name;
  const copy = label.cloneNode(true);
  copy.querySelectorAll('.field__optional, input').forEach((n) => n.remove());
  return copy.textContent.trim().toLowerCase();
}

function messageFor(field) {
  if (field.type === 'radio') {
    return field.closest('[data-error-required]')?.dataset.errorRequired || 'Select an option';
  }
  const v = field.validity;
  if (v.valueMissing) {
    if (field.dataset.errorRequired) return field.dataset.errorRequired;
    if (field.type === 'checkbox') return 'Tick the box to continue';
    if (field.tagName === 'SELECT') return `Select ${labelText(field)}`;
    return `Enter ${labelText(field)}`;
  }
  if (v.typeMismatch && field.type === 'email') return 'Enter an email address in the correct format, like name@example.com';
  if (v.patternMismatch) return field.dataset.errorPattern || `Enter ${labelText(field)} in the correct format`;
  if (v.customError) return field.validationMessage;
  return field.validationMessage;
}

function ensureId(field) {
  if (!field.id) field.id = `${field.form.dataset.formName || 'form'}-${field.name}`.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
  return field.id;
}

function setError(field, message) {
  const id = ensureId(field);
  const isRadio = field.type === 'radio';
  const container = isRadio ? field.closest('fieldset') : field.closest('.field') || field.parentElement;
  let error = container.querySelector(':scope > .field__error');

  if (!error && message) {
    error = document.createElement('p');
    error.className = 'field__error';
    error.id = `${id}-error`;
    if (isRadio) container.querySelector('legend')?.after(error);
    else if (field.parentElement === container) field.before(error);
    else container.prepend(error);
  }
  if (error) {
    error.hidden = !message;
    error.replaceChildren();
    if (message) {
      const prefix = document.createElement('span');
      prefix.className = 'visually-hidden';
      prefix.textContent = 'Error: ';
      error.append(prefix, message);
    }
  }

  const targets = isRadio ? [...field.form.querySelectorAll(`input[name="${CSS.escape(field.name)}"]`)] : [field];
  targets.forEach((t) => {
    if (message) {
      t.setAttribute('aria-invalid', 'true');
      if (error) {
        const ids = new Set((t.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
        ids.add(error.id);
        t.setAttribute('aria-describedby', [...ids].join(' '));
      }
    } else {
      t.removeAttribute('aria-invalid');
    }
  });
}

function showSummary(summary, errors) {
  if (!summary) {
    errors[0].field.focus();
    return;
  }
  summary.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = 'There is a problem';
  const list = document.createElement('ul');
  errors.forEach(({ field, message }) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${ensureId(field)}`;
    link.textContent = message;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      field.focus();
      field.scrollIntoView({ block: 'center' });
    });
    li.append(link);
    list.append(li);
  });
  summary.append(heading, list);
  summary.hidden = false;
  summary.focus();
}

function showStatus(status, html, tone) {
  if (!status) return;
  status.innerHTML = html;
  status.classList.toggle('form-status--warn', tone === 'warn');
  status.classList.toggle('form-status--ok', tone === 'ok');
  status.hidden = false;
  status.focus();
}

const CALL = '<a href="tel:+2673933472">(+267) 393 3472</a>';

function notConnected(name, email) {
  return `
    <h2>This form isn’t connected yet</h2>
    <p>Your ${name} has <strong>not</strong> been sent. Your answers are still in the form.</p>
    <p>For now, email <a href="mailto:${email}">${email}</a> or call ${CALL}.</p>`;
}

function sent(name) {
  return `
    <h2>Thank you</h2>
    <p>Your ${name} has been sent to BOTEPCO.</p>`;
}

function failed(name, email) {
  return `
    <h2>Your ${name} wasn’t sent</h2>
    <p>Something went wrong on our side. Your answers are still in the form, so you can try again. If it keeps happening, email <a href="mailto:${email}">${email}</a> or call ${CALL}.</p>`;
}
