// Artifex shared registered-content picker controller
//
// Reusable modal picker for final project-backed assets and archetypes. This UI only displays
// records accepted by registered-content-reader.js; it does not offer uploads, raw path input,
// or any shortcut around project asset promotion and indexing.

import {
  REGISTERED_CONTENT_DEFINITIONS,
  REGISTERED_CONTENT_STATUS,
  createRegisteredReference,
  loadRegisteredContentIndex,
  searchRegisteredContent
} from './registered-content-reader.js';

const PICKER_STYLE_ID = 'artifex-registered-content-picker-styles';
const DEFAULT_KINDS = Object.freeze(['assets', 'archetype-objects', 'archetype-effects']);
let pickerNumber = 0;
let openPicker = null;

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value) {
  return String(value ?? '').trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function validKinds(value) {
  const requested = safeArray(value).length ? value : DEFAULT_KINDS;
  const filtered = requested.filter((kind) => Boolean(REGISTERED_CONTENT_DEFINITIONS[kind]));
  return filtered.length ? [...new Set(filtered)] : [...DEFAULT_KINDS];
}

function stateLabel(status) {
  const labels = {
    [REGISTERED_CONTENT_STATUS.READY]: 'Ready',
    [REGISTERED_CONTENT_STATUS.EMPTY]: 'No registered items',
    [REGISTERED_CONTENT_STATUS.PARTIALLY_REJECTED]: 'Some records excluded',
    [REGISTERED_CONTENT_STATUS.INVALID_INDEX]: 'Invalid index',
    [REGISTERED_CONTENT_STATUS.INDEX_NOT_FOUND]: 'Index not found',
    [REGISTERED_CONTENT_STATUS.READER_UNAVAILABLE]: 'Project reader unavailable',
    [REGISTERED_CONTENT_STATUS.READ_FAILED]: 'Read failed'
  };
  return labels[status] || 'Waiting';
}

function stateClass(status) {
  if (status === REGISTERED_CONTENT_STATUS.READY) return 'is-ready';
  if (status === REGISTERED_CONTENT_STATUS.EMPTY) return 'is-empty';
  return 'is-warning';
}

function injectStyles() {
  if (document.getElementById(PICKER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PICKER_STYLE_ID;
  style.textContent = `
    .artifex-registered-picker {
      width: min(820px, calc(100vw - 42px));
      height: min(610px, calc(100vh - 42px));
      padding: 0;
      color: var(--cream, #eadfc6);
      background: #0b120e;
      border: 1px solid rgba(158,230,164,.3);
      border-radius: 17px;
      box-shadow: 0 24px 70px rgba(0,0,0,.72), 0 0 18px rgba(62,144,75,.16);
      overflow: hidden;
    }
    .artifex-registered-picker::backdrop { background: rgba(0,0,0,.66); backdrop-filter: blur(2px); }
    .registered-picker-shell { height: 100%; display: grid; grid-template-rows: auto auto auto minmax(0, 1fr) auto; background: linear-gradient(155deg, rgba(22,45,27,.4), transparent 42%), #0b120e; }
    .registered-picker-head { display: flex; justify-content: space-between; align-items: start; gap: 14px; padding: 15px 16px 12px; border-bottom: 1px solid rgba(158,230,164,.16); }
    .registered-picker-head p { margin: 0 0 4px; color: #9ee6a4; font: 700 .62rem/1.2 Inter, Arial, sans-serif; letter-spacing: .13em; text-transform: uppercase; }
    .registered-picker-head h2 { margin: 0; font: 700 1.05rem/1.2 Cinzel, Georgia, serif; color: #eadfc6; }
    .registered-picker-close { min-width: 34px; min-height: 34px; padding: 0; border: 1px solid rgba(158,230,164,.26); border-radius: 10px; background: rgba(20,72,37,.4); color: #eadfc6; font-size: 1.1rem; cursor: pointer; }
    .registered-picker-close:hover { background: rgba(43,111,54,.42); }
    .registered-picker-tabs { display: flex; flex-wrap: wrap; gap: 7px; padding: 10px 16px; border-bottom: 1px solid rgba(158,230,164,.13); }
    .registered-picker-tab { border: 1px solid rgba(158,230,164,.18); border-radius: 10px; background: rgba(5,18,11,.7); color: #a9b59e; min-height: 35px; padding: 7px 12px; font: 700 .72rem Inter, Arial, sans-serif; cursor: pointer; }
    .registered-picker-tab.is-active { color: #d7ffdb; border-color: rgba(158,230,164,.55); background: rgba(40,92,47,.42); }
    .registered-picker-toolbar { display: grid; grid-template-columns: minmax(170px, 1fr) auto auto; align-items: center; gap: 9px; padding: 10px 16px; border-bottom: 1px solid rgba(158,230,164,.13); }
    .registered-picker-search { width: 100%; box-sizing: border-box; min-height: 38px; border: 1px solid rgba(158,230,164,.2); border-radius: 10px; background: rgba(0,0,0,.28); padding: 8px 11px; color: #eadfc6; font: .77rem Inter, Arial, sans-serif; }
    .registered-picker-search:focus { outline: none; border-color: rgba(158,230,164,.55); }
    .registered-picker-reload { min-height: 38px; border: 1px solid rgba(158,230,164,.26); border-radius: 10px; padding: 7px 12px; background: rgba(20,72,37,.38); color: #eadfc6; font: 700 .72rem Inter, Arial, sans-serif; cursor: pointer; }
    .registered-picker-status { max-width: 190px; border: 1px solid rgba(158,230,164,.18); border-radius: 999px; padding: 6px 10px; color: #a9b59e; font: 700 .64rem Inter, Arial, sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .registered-picker-status.is-ready { color: #9ee6a4; border-color: rgba(158,230,164,.38); }
    .registered-picker-status.is-warning { color: #e1c073; border-color: rgba(225,192,115,.35); }
    .registered-picker-body { min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 264px; }
    .registered-picker-results { padding: 12px 14px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(192px, 1fr)); align-content: start; gap: 9px; }
    .registered-picker-card { min-height: 88px; border: 1px solid rgba(158,230,164,.15); border-radius: 12px; background: rgba(0,0,0,.25); color: #eadfc6; padding: 10px; text-align: left; cursor: pointer; }
    .registered-picker-card:hover, .registered-picker-card.is-selected { border-color: rgba(158,230,164,.55); background: rgba(31,83,39,.36); }
    .registered-picker-card strong { display: block; font: 700 .77rem/1.3 Inter, Arial, sans-serif; margin-bottom: 3px; }
    .registered-picker-card small { display: block; color: #9ee6a4; font: 600 .61rem/1.3 monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .registered-picker-card span { display: block; margin-top: 7px; color: #a9b59e; font: .65rem/1.35 Inter, Arial, sans-serif; }
    .registered-picker-empty { grid-column: 1/-1; border: 1px dashed rgba(158,230,164,.22); border-radius: 13px; padding: 22px 18px; text-align: center; color: #a9b59e; font: .76rem/1.55 Inter, Arial, sans-serif; }
    .registered-picker-detail { min-height: 0; overflow-y: auto; padding: 14px; border-left: 1px solid rgba(158,230,164,.14); background: rgba(0,0,0,.15); }
    .registered-picker-detail h3 { margin: 0 0 8px; color: #eadfc6; font: 700 .85rem/1.35 Inter, Arial, sans-serif; }
    .registered-picker-detail p { margin: 6px 0; color: #a9b59e; font: .68rem/1.45 Inter, Arial, sans-serif; word-break: break-word; }
    .registered-picker-detail .mono { color: #9ee6a4; font-family: monospace; }
    .registered-picker-exclusions { margin-top: 13px; padding: 9px; border: 1px solid rgba(225,192,115,.25); border-radius: 10px; color: #e1c073; font: .65rem/1.4 Inter, Arial, sans-serif; }
    .registered-picker-actions { padding: 12px 16px; border-top: 1px solid rgba(158,230,164,.15); display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    .registered-picker-note { color: #a9b59e; font: .66rem/1.35 Inter, Arial, sans-serif; }
    .registered-picker-action-group { display: flex; gap: 9px; }
    .registered-picker-action-group button { min-height: 38px; border-radius: 10px; padding: 8px 13px; font: 700 .74rem Inter, Arial, sans-serif; cursor: pointer; }
    .registered-picker-cancel { border: 1px solid rgba(158,230,164,.22); background: rgba(0,0,0,.22); color: #eadfc6; }
    .registered-picker-select { border: 1px solid rgba(158,230,164,.48); background: rgba(40,92,47,.55); color: #eaffea; }
    .registered-picker-select:disabled { cursor: not-allowed; opacity: .42; }
    @media (max-width: 690px) {
      .registered-picker-toolbar { grid-template-columns: 1fr auto; }
      .registered-picker-status { grid-column: 1/-1; }
      .registered-picker-body { grid-template-columns: 1fr; }
      .registered-picker-detail { display: none; }
    }
  `;
  document.head.appendChild(style);
}

function itemSummary(item) {
  return item.description || item.tags.slice(0, 4).join(', ') || item.type || 'Registered project item';
}

function renderItemCard(item, selectedId) {
  return `
    <button type="button" class="registered-picker-card ${item.id === selectedId ? 'is-selected' : ''}" data-registered-item="${escapeHtml(item.id)}" title="Select ${escapeHtml(item.name)}">
      <strong>${escapeHtml(item.name)}</strong>
      <small>${escapeHtml(item.id)}</small>
      <span>${escapeHtml(itemSummary(item))}</span>
    </button>
  `;
}

function normalizeOptions(options = {}) {
  const kinds = validKinds(options.kinds);
  const initialKind = kinds.includes(options.initialKind) ? options.initialKind : kinds[0];
  return {
    title: text(options.title) || 'Select Registered Content',
    selectLabel: text(options.selectLabel) || 'Use Selected',
    contextNote: text(options.contextNote) || 'Only final registered project records are selectable.',
    kinds,
    initialKind,
    readJson: options.readJson,
    projectFolderClient: options.projectFolderClient,
    onSelect: typeof options.onSelect === 'function' ? options.onSelect : () => {},
    onClose: typeof options.onClose === 'function' ? options.onClose : () => {}
  };
}

export function createRegisteredContentPicker(options = {}) {
  const config = normalizeOptions(options);
  const id = `artifex-registered-picker-${++pickerNumber}`;
  let dialog = null;
  let activeKind = config.initialKind;
  let currentResult = null;
  let selectedItem = null;
  let query = '';
  let loading = false;
  let requestNumber = 0;

  function getRoot() {
    return dialog;
  }

  function close(reason = 'cancelled') {
    if (!dialog) return;
    if (dialog.open) dialog.close();
    dialog.remove();
    dialog = null;
    if (openPicker === controller) openPicker = null;
    config.onClose({ reason });
  }

  function renderDetail() {
    const target = dialog?.querySelector('[data-picker-detail]');
    if (!target) return;
    if (!selectedItem) {
      const warning = currentResult?.rejected?.length
        ? `<div class="registered-picker-exclusions">${currentResult.rejected.length} record(s) were excluded because they are not valid final registered content.</div>`
        : '';
      target.innerHTML = `<h3>Selection Details</h3><p>Select a registered item to review its stable ID and final project record path.</p>${warning}`;
      return;
    }
    target.innerHTML = `
      <h3>${escapeHtml(selectedItem.name)}</h3>
      <p class="mono">${escapeHtml(selectedItem.id)}</p>
      <p>Type: ${escapeHtml(selectedItem.type)}</p>
      <p>Status: ${escapeHtml(selectedItem.status)}</p>
      <p class="mono">${escapeHtml(selectedItem.file)}</p>
      ${selectedItem.description ? `<p>${escapeHtml(selectedItem.description)}</p>` : ''}
      ${selectedItem.tags.length ? `<p>Tags: ${escapeHtml(selectedItem.tags.join(', '))}</p>` : ''}
    `;
  }

  function renderResults() {
    const results = dialog?.querySelector('[data-picker-results]');
    const status = dialog?.querySelector('[data-picker-status]');
    const selectButton = dialog?.querySelector('[data-picker-confirm]');
    if (!results || !status || !selectButton) return;

    if (loading) {
      status.textContent = 'Loading…';
      status.className = 'registered-picker-status';
      results.innerHTML = '<div class="registered-picker-empty">Reading final registered project records…</div>';
      selectButton.disabled = true;
      renderDetail();
      return;
    }

    const statusValue = currentResult?.status;
    status.textContent = stateLabel(statusValue);
    status.title = currentResult?.message || '';
    status.className = `registered-picker-status ${stateClass(statusValue)}`;
    const items = searchRegisteredContent(currentResult, query);

    if (!items.length) {
      const message = query && currentResult?.items?.length
        ? 'No registered items match this search.'
        : currentResult?.message || 'No final registered content is available.';
      results.innerHTML = `<div class="registered-picker-empty">${escapeHtml(message)}</div>`;
    } else {
      results.innerHTML = items.map((item) => renderItemCard(item, selectedItem?.id)).join('');
      results.querySelectorAll('[data-registered-item]').forEach((button) => {
        button.addEventListener('click', () => {
          selectedItem = items.find((item) => item.id === button.dataset.registeredItem) || null;
          renderResults();
        });
      });
    }

    selectButton.disabled = !selectedItem;
    renderDetail();
  }

  function renderTabs() {
    const tabs = dialog?.querySelector('[data-picker-tabs]');
    if (!tabs) return;
    tabs.innerHTML = config.kinds.map((kind) => {
      const definition = REGISTERED_CONTENT_DEFINITIONS[kind];
      return `<button type="button" class="registered-picker-tab ${kind === activeKind ? 'is-active' : ''}" data-picker-kind="${escapeHtml(kind)}" title="Browse ${escapeHtml(definition.label)}">${escapeHtml(definition.label)}</button>`;
    }).join('');
    tabs.querySelectorAll('[data-picker-kind]').forEach((button) => {
      button.addEventListener('click', () => switchKind(button.dataset.pickerKind));
    });
  }

  async function loadActiveKind() {
    const token = ++requestNumber;
    loading = true;
    currentResult = null;
    selectedItem = null;
    renderResults();
    const result = await loadRegisteredContentIndex(activeKind, {
      readJson: config.readJson,
      projectFolderClient: config.projectFolderClient
    });
    if (token !== requestNumber || !dialog) return result;
    currentResult = result;
    loading = false;
    renderResults();
    return result;
  }

  async function switchKind(kind) {
    if (!config.kinds.includes(kind) || kind === activeKind) return currentResult;
    activeKind = kind;
    query = '';
    const input = dialog?.querySelector('[data-picker-search]');
    if (input) input.value = '';
    renderTabs();
    return loadActiveKind();
  }

  function confirmSelection() {
    if (!selectedItem) return;
    const reference = createRegisteredReference(activeKind, selectedItem);
    const selection = { kind: activeKind, item: selectedItem, reference, indexResult: currentResult };
    config.onSelect(selection);
    close('selected');
  }

  async function open(overrides = {}) {
    if (dialog) return currentResult;
    openPicker?.close('replaced');
    if (config.kinds.includes(overrides.kind)) activeKind = overrides.kind;
    injectStyles();
    dialog = document.createElement('dialog');
    dialog.id = id;
    dialog.className = 'artifex-registered-picker';
    dialog.innerHTML = `
      <section class="registered-picker-shell" aria-label="Registered content picker">
        <header class="registered-picker-head">
          <div><p>Artifex Project Library</p><h2>${escapeHtml(config.title)}</h2></div>
          <button type="button" class="registered-picker-close" data-picker-close title="Close without selecting anything" aria-label="Close">×</button>
        </header>
        <nav class="registered-picker-tabs" data-picker-tabs aria-label="Registered content types"></nav>
        <section class="registered-picker-toolbar">
          <input class="registered-picker-search" data-picker-search type="search" placeholder="Search registered records" title="Search registered IDs, names, paths and tags." />
          <button class="registered-picker-reload" type="button" data-picker-reload title="Read the current project index again.">Reload</button>
          <span class="registered-picker-status" data-picker-status>Waiting</span>
        </section>
        <section class="registered-picker-body">
          <div class="registered-picker-results" data-picker-results></div>
          <aside class="registered-picker-detail" data-picker-detail></aside>
        </section>
        <footer class="registered-picker-actions">
          <span class="registered-picker-note">${escapeHtml(config.contextNote)}</span>
          <span class="registered-picker-action-group">
            <button type="button" class="registered-picker-cancel" data-picker-cancel title="Close without linking a record.">Cancel</button>
            <button type="button" class="registered-picker-select" data-picker-confirm title="Use the selected final registered record." disabled>${escapeHtml(config.selectLabel)}</button>
          </span>
        </footer>
      </section>
    `;
    document.body.appendChild(dialog);
    openPicker = controller;
    dialog.querySelector('[data-picker-close]')?.addEventListener('click', () => close('cancelled'));
    dialog.querySelector('[data-picker-cancel]')?.addEventListener('click', () => close('cancelled'));
    dialog.querySelector('[data-picker-confirm]')?.addEventListener('click', confirmSelection);
    dialog.querySelector('[data-picker-reload]')?.addEventListener('click', loadActiveKind);
    dialog.querySelector('[data-picker-search]')?.addEventListener('input', (event) => {
      query = text(event.target.value);
      selectedItem = null;
      renderResults();
    });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      close('cancelled');
    });
    renderTabs();
    dialog.showModal();
    return loadActiveKind();
  }

  const controller = Object.freeze({
    open,
    close,
    reload: loadActiveKind,
    switchKind,
    getRoot,
    getSelection: () => selectedItem,
    getResult: () => currentResult,
    getActiveKind: () => activeKind
  });

  return controller;
}

export function openRegisteredContentPicker(options = {}) {
  const picker = createRegisteredContentPicker(options);
  picker.open({ kind: options.initialKind });
  return picker;
}
