const STORAGE_KEY = 'artifex.effectEditor.leftPanelSearch';

export function initV326LeftPanelSearch() {
  injectStyles();
  ensureSearchBar();
  bindSearchBar();
  applySavedQuery();
  observePanelChanges();
}

function injectStyles() {
  if (document.getElementById('v326-left-panel-search-style')) return;
  const style = document.createElement('style');
  style.id = 'v326-left-panel-search-style';
  style.textContent = `
    #left-panel-search-v326 {
      position: sticky;
      top: 0;
      z-index: 16;
      margin: 0 0 12px;
      padding: 10px;
      border: 1px solid rgba(0, 174, 234, .36);
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(23,18,16,.98), rgba(12,9,8,.94));
      box-shadow: 0 10px 22px rgba(0,0,0,.66), 0 0 18px rgba(0,174,234,.12);
      backdrop-filter: blur(10px);
    }
    .left-panel-search-row-v326 {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: center;
    }
    #left-panel-search-input-v326 {
      width: 100%;
      min-height: 36px;
      border: 1px solid rgba(56,42,33,.92);
      border-radius: 12px;
      padding: 8px 10px;
      color: var(--gold-bright);
      background: rgba(0,0,0,.32);
      box-shadow: inset 0 2px 8px rgba(0,0,0,.45);
    }
    #left-panel-search-input-v326::placeholder { color: var(--gold-muted); }
    #left-panel-search-clear-v326 {
      min-width: 36px;
      min-height: 36px;
      padding: 6px 9px;
      border-radius: 12px;
    }
    #left-panel-search-count-v326 {
      display: block;
      margin-top: 6px;
      color: var(--gold-muted);
      font-size: 10px;
      line-height: 1.3;
      letter-spacing: .04em;
    }
    #left-panel .card.left-panel-search-hidden-v326 { display: none !important; }
    #left-panel .card.left-panel-search-match-v326 {
      border-color: rgba(0, 174, 234, .54);
      box-shadow: 0 0 0 1px rgba(0,174,234,.14), 0 0 14px rgba(0,174,234,.18);
    }
  `;
  document.head.append(style);
}

function ensureSearchBar() {
  const panel = document.getElementById('left-panel');
  if (!panel || document.getElementById('left-panel-search-v326')) return;
  panel.insertAdjacentHTML('afterbegin', `
    <section id="left-panel-search-v326" aria-label="Search settings">
      <div class="left-panel-search-row-v326">
        <input id="left-panel-search-input-v326" type="search" autocomplete="off" placeholder="Search settings…" title="Search visible controls and panels in the left settings column." />
        <button id="left-panel-search-clear-v326" type="button" title="Clear settings search.">×</button>
      </div>
      <span id="left-panel-search-count-v326">Showing all settings.</span>
    </section>
  `);
}

function bindSearchBar() {
  const input = document.getElementById('left-panel-search-input-v326');
  const clear = document.getElementById('left-panel-search-clear-v326');
  if (!input || input.dataset.leftPanelSearchBound === 'true') return;
  input.dataset.leftPanelSearchBound = 'true';
  input.addEventListener('input', () => {
    localStorage.setItem(STORAGE_KEY, input.value);
    applySearch(input.value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    scrollToFirstMatch();
  });
  clear?.addEventListener('click', () => {
    input.value = '';
    localStorage.removeItem(STORAGE_KEY);
    applySearch('');
    input.focus();
  });
}

function applySavedQuery() {
  const input = document.getElementById('left-panel-search-input-v326');
  if (!input) return;
  input.value = localStorage.getItem(STORAGE_KEY) || '';
  applySearch(input.value);
}

function observePanelChanges() {
  const panel = document.getElementById('left-panel');
  if (!panel || panel.dataset.leftPanelSearchObserved === 'true') return;
  panel.dataset.leftPanelSearchObserved = 'true';
  const observer = new MutationObserver(() => {
    const input = document.getElementById('left-panel-search-input-v326');
    applySearch(input?.value || '');
  });
  observer.observe(panel, { childList: true, subtree: true });
}

function applySearch(rawQuery) {
  const query = normalize(rawQuery);
  const cards = getSearchableCards();
  let visible = 0;
  cards.forEach((card) => {
    const matches = !query || normalize(card.textContent).includes(query) || normalize(card.id).includes(query) || normalize(card.dataset.searchKeywords || '').includes(query);
    card.classList.toggle('left-panel-search-hidden-v326', !matches);
    card.classList.toggle('left-panel-search-match-v326', Boolean(query && matches));
    if (matches) visible += 1;
  });
  syncCount(query, visible, cards.length);
}

function getSearchableCards() {
  return Array.from(document.querySelectorAll('#left-panel .card')).filter((card) => !card.closest('#left-panel-search-v326'));
}

function syncCount(query, visible, total) {
  const count = document.getElementById('left-panel-search-count-v326');
  if (!count) return;
  if (!query) {
    count.textContent = 'Showing all settings.';
    return;
  }
  count.textContent = visible ? `${visible} of ${total} settings panels match. Press Enter to jump to the first match.` : 'No matching settings panels.';
}

function scrollToFirstMatch() {
  const first = getSearchableCards().find((card) => !card.classList.contains('left-panel-search-hidden-v326'));
  first?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function normalize(value) {
  return String(value || '').replace(/[🧩🎨✨🎯🔷💅🚀💥]/gu, '').toLowerCase().trim();
}
