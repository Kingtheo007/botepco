// search.js — site search.
// Without JS the header search button links to /search/ and forms submit there.
// With JS the button opens a panel in the header and results appear as you type,
// ranked from a small JSON index (/assets/data/search-index.json).

const INDEX_URL = '/assets/data/search-index.json';
const MAX_LIVE_RESULTS = 6;
let indexPromise;

export function loadIndex() {
  indexPromise ??= fetch(INDEX_URL).then((response) => {
    if (!response.ok) throw new Error(`Search index: HTTP ${response.status}`);
    return response.json();
  });
  return indexPromise;
}

export function normalise(text) {
  return String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function rank(index, query) {
  const terms = normalise(query).split(' ').filter(Boolean);
  if (!terms.length) return [];
  return index
    .map((page) => {
      const title = normalise(page.title);
      const haystack = normalise(`${page.title} ${page.summary} ${page.keywords || ''} ${page.section || ''}`);
      let score = 0;
      for (const term of terms) {
        if (!haystack.includes(term)) return null;
        score += title.includes(term) ? 3 : 1;
        if (title.startsWith(term)) score += 2;
      }
      return { ...page, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

// Build text with <mark> around matched terms, without innerHTML
export function highlight(text, query) {
  // Highlight word starts only, and skip short words like "of" or "to"
  const terms = normalise(query).split(' ').filter((t) => t.length > 2);
  const fragment = document.createDocumentFragment();
  if (!terms.length) {
    fragment.append(text);
    return fragment;
  }
  const pattern = new RegExp(`\\b(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  text.split(pattern).forEach((part, i) => {
    if (i % 2) {
      const mark = document.createElement('mark');
      mark.textContent = part;
      fragment.append(mark);
    } else if (part) {
      fragment.append(part);
    }
  });
  return fragment;
}

export function resultItem(page, query) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = page.url;
  const title = document.createElement('span');
  title.className = 'search-results__title';
  title.append(highlight(page.title, query));
  const summary = document.createElement('span');
  summary.className = 'search-results__summary';
  summary.append(highlight(page.summary, query));
  a.append(title, summary);
  li.append(a);
  return li;
}

export default function initSearch() {
  initPanel();
  document.querySelectorAll('[data-search-form]').forEach(bindLiveSearch);
}

function initPanel() {
  const toggle = document.querySelector('[data-search-toggle]');
  const panel = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
  if (!panel) return;
  const input = panel.querySelector('input[type="search"]');

  toggle.setAttribute('role', 'button');
  toggle.setAttribute('aria-expanded', 'false');

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      input.focus();
      loadIndex().catch(() => {});
    }
  };

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    setOpen(panel.hidden);
  });
  toggle.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      toggle.click();
    }
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      toggle.focus();
    }
  });
}

function bindLiveSearch(form) {
  const input = form.querySelector('input[type="search"]');
  const list = form.querySelector('[data-search-results]');
  const status = document.getElementById(input.getAttribute('aria-describedby'));
  const limit = Number(form.dataset.searchLimit) || MAX_LIVE_RESULTS;
  let timer;

  const run = async () => {
    const query = input.value.trim();
    if (query.length < 2) {
      list.replaceChildren();
      status.textContent = 'Type at least 2 letters to see matching pages.';
      return;
    }
    try {
      const results = rank(await loadIndex(), query).slice(0, limit);
      list.replaceChildren(...results.map((page) => resultItem(page, query)));
      status.textContent = results.length
        ? `${results.length} matching ${results.length === 1 ? 'page' : 'pages'}. Use the down arrow key to move through them.`
        : `No pages match “${query}”. Try another word, or press Search.`;
    } catch (error) {
      console.error(error);
      status.textContent = 'Search isn’t available right now. Press Search to try the search page.';
    }
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(run, 120);
  });

  input.addEventListener('keydown', (event) => {
    const first = list.querySelector('a');
    if (event.key === 'ArrowDown' && first) {
      event.preventDefault();
      first.focus();
    }
  });

  list.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = [...list.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    if (index === -1) return;
    event.preventDefault();
    if (event.key === 'ArrowUp' && index === 0) input.focus();
    else links[Math.min(links.length - 1, Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1)))].focus();
  });

  // Search results page: run the query from ?q= straight away
  if (form.hasAttribute('data-search-page')) {
    const query = new URLSearchParams(window.location.search).get('q');
    if (query) {
      input.value = query;
      run();
    }
  }
}
