import { onStateChange } from './editor-state.js';

const SETTINGS_KEY = 'artifex.effectEditor.mySettingsPins.v327';
const LAYOUT_KEY = 'artifex.effectEditor.mySettingsLayout.v327';

let editMode = false;
let observerInstalled = false;
let syncTimer = 0;

export function initV327MySettings() {
  injectStyles();
  ensurePanel();
  bindPanel();
  restoreLayout();
  renderPinnedControls();
  decorateSourceControls();
  installPanelObserver();
  onStateChange(() => {
    decorateSourceControls();
    renderPinnedControls();
  });
}

function injectStyles() {
  if (document.getElementById('v327-my-settings-style')) return;
  const style = document.createElement('style');
  style.id = 'v327-my-settings-style';
  style.textContent = `
    .my-settings-panel-v327 {
      position: absolute;
      top: 62px;
      right: 16px;
      z-index: 18;
      width: min(330px, calc(100% - 32px));
      max-height: calc(100% - 86px);
      display: grid;
      grid-template-rows: auto 1fr;
      border: 1px solid rgba(0, 174, 234, .36);
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(23,18,16,.96), rgba(9,7,7,.88));
      box-shadow: 0 16px 32px rgba(0,0,0,.72), 0 0 22px rgba(0,174,234,.16);
      backdrop-filter: blur(10px);
      overflow: hidden;
      pointer-events: auto;
    }
    .my-settings-panel-v327.is-collapsed { grid-template-rows: auto; }
    .my-settings-panel-v327.is-collapsed .my-settings-body-v327 { display: none; }
    .my-settings-header-v327 {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      align-items: center;
      padding: 9px 10px;
      border-bottom: 1px solid rgba(226,204,167,.14);
      cursor: grab;
      user-select: none;
    }
    .my-settings-header-v327:active { cursor: grabbing; }
    .my-settings-title-v327 {
      display: grid;
      gap: 1px;
      min-width: 0;
    }
    .my-settings-title-v327 strong {
      color: var(--gold-bright);
      font-family: 'Cinzel', Georgia, serif;
      font-size: 12px;
      letter-spacing: .14em;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .my-settings-title-v327 span {
      color: var(--gold-muted);
      font-size: 10px;
      line-height: 1.25;
    }
    .my-settings-header-v327 button {
      min-width: 34px;
      min-height: 32px;
      padding: 5px 8px;
      border-radius: 11px;
      font-size: 11px;
    }
    .my-settings-panel-v327.is-editing {
      border-color: rgba(39, 215, 255, .72);
      box-shadow: 0 16px 32px rgba(0,0,0,.72), 0 0 26px rgba(0,174,234,.28);
    }
    .my-settings-body-v327 {
      overflow: auto;
      padding: 10px;
      display: grid;
      gap: 9px;
    }
    .my-settings-empty-v327 {
      padding: 12px;
      border: 1px dashed rgba(226,204,167,.22);
      border-radius: 14px;
      color: var(--gold-muted);
      background: rgba(0,0,0,.18);
      font-size: 11px;
      line-height: 1.4;
    }
    .my-settings-row-v327 {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 7px;
      align-items: center;
      padding: 8px;
      border: 1px solid rgba(56,42,33,.8);
      border-radius: 14px;
      background: rgba(15,12,11,.72);
    }
    .my-settings-row-v327.is-missing { opacity: .55; }
    .my-settings-row-v327 label {
      margin: 0;
      display: grid;
      gap: 5px;
      color: var(--gold);
      font-size: 10px;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .my-settings-row-v327 input,
    .my-settings-row-v327 select,
    .my-settings-row-v327 textarea {
      width: 100%;
      min-width: 0;
    }
    .my-settings-row-v327 textarea {
      min-height: 72px;
      resize: vertical;
      text-transform: none;
      letter-spacing: normal;
    }
    .my-settings-control-grid-v327 {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 7px;
      align-items: center;
    }
    .my-settings-remove-v327 {
      display: none;
      min-width: 28px !important;
      min-height: 28px !important;
      padding: 3px 7px !important;
      color: #ffb4c0 !important;
      align-self: start;
    }
    .my-settings-panel-v327.is-editing .my-settings-remove-v327 { display: inline-grid; place-items: center; }
    .my-settings-source-pin-v327 {
      display: none;
      position: absolute;
      right: 7px;
      top: 7px;
      min-width: 26px !important;
      min-height: 24px !important;
      padding: 1px 6px !important;
      border-radius: 999px !important;
      font-size: 12px !important;
      z-index: 3;
      color: #cbf5ff !important;
      border-color: rgba(0,174,234,.56) !important;
      background: rgba(0,174,234,.12) !important;
    }
    body.my-settings-editing-v327 #left-panel label,
    body.my-settings-editing-v327 #effect-specific-controls-card label { position: relative; padding-right: 34px; }
    body.my-settings-editing-v327 .my-settings-source-pin-v327 { display: inline-grid; place-items: center; }
    body.my-settings-editing-v327 .my-settings-source-pinned-v327 .my-settings-source-pin-v327 {
      color: var(--gold-bright) !important;
      border-color: rgba(226,204,167,.72) !important;
      background: rgba(226,204,167,.12) !important;
    }
  `;
  document.head.append(style);
}

function ensurePanel() {
  const workspace = document.getElementById('workspace') || document.body;
  if (document.getElementById('my-settings-panel-v327')) return;
  workspace.insertAdjacentHTML('beforeend', `
    <aside id="my-settings-panel-v327" class="my-settings-panel-v327" aria-label="My Settings">
      <header id="my-settings-header-v327" class="my-settings-header-v327">
        <div class="my-settings-title-v327"><strong>My Settings</strong><span id="my-settings-subtitle-v327">Pin favourite controls here.</span></div>
        <button id="my-settings-edit-v327" type="button" title="Turn edit mode on to pin or remove copied controls.">Edit</button>
        <button id="my-settings-collapse-v327" type="button" title="Collapse or expand My Settings.">−</button>
      </header>
      <div id="my-settings-body-v327" class="my-settings-body-v327"></div>
    </aside>
  `);
}

function bindPanel() {
  document.getElementById('my-settings-edit-v327')?.addEventListener('click', () => setEditMode(!editMode));
  document.getElementById('my-settings-collapse-v327')?.addEventListener('click', () => {
    const panel = document.getElementById('my-settings-panel-v327');
    panel?.classList.toggle('is-collapsed');
    const button = document.getElementById('my-settings-collapse-v327');
    if (button) button.textContent = panel?.classList.contains('is-collapsed') ? '+' : '−';
  });
  bindDrag();
}

function bindDrag() {
  const panel = document.getElementById('my-settings-panel-v327');
  const header = document.getElementById('my-settings-header-v327');
  if (!panel || !header || header.dataset.dragBound === 'true') return;
  header.dataset.dragBound = 'true';
  header.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    header.setPointerCapture(event.pointerId);
    const start = panel.getBoundingClientRect();
    const host = (document.getElementById('workspace') || document.body).getBoundingClientRect();
    const offsetX = event.clientX - start.left;
    const offsetY = event.clientY - start.top;
    const move = (moveEvent) => {
      const left = Math.max(8, Math.min(host.width - panel.offsetWidth - 8, moveEvent.clientX - host.left - offsetX));
      const top = Math.max(8, Math.min(host.height - panel.offsetHeight - 8, moveEvent.clientY - host.top - offsetY));
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.right = 'auto';
    };
    const up = () => {
      header.removeEventListener('pointermove', move);
      header.removeEventListener('pointerup', up);
      saveLayout();
    };
    header.addEventListener('pointermove', move);
    header.addEventListener('pointerup', up);
  });
}

function restoreLayout() {
  const panel = document.getElementById('my-settings-panel-v327');
  if (!panel) return;
  try {
    const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');
    if (Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
      panel.style.left = `${saved.left}px`;
      panel.style.top = `${saved.top}px`;
      panel.style.right = 'auto';
    }
  } catch {
    localStorage.removeItem(LAYOUT_KEY);
  }
}

function saveLayout() {
  const panel = document.getElementById('my-settings-panel-v327');
  if (!panel) return;
  localStorage.setItem(LAYOUT_KEY, JSON.stringify({ left: panel.offsetLeft, top: panel.offsetTop }));
}

function setEditMode(next) {
  editMode = Boolean(next);
  document.body.classList.toggle('my-settings-editing-v327', editMode);
  document.getElementById('my-settings-panel-v327')?.classList.toggle('is-editing', editMode);
  const button = document.getElementById('my-settings-edit-v327');
  if (button) button.textContent = editMode ? 'Done' : 'Edit';
  decorateSourceControls();
  renderPinnedControls();
}

function decorateSourceControls() {
  const pins = loadPins();
  const selectors = new Set(pins.map((pin) => pin.selector));
  getSourceLabels().forEach((label) => {
    const control = getPrimaryControl(label);
    const selector = selectorForControl(control);
    if (!selector) return;
    label.classList.toggle('my-settings-source-pinned-v327', selectors.has(selector));
    let button = label.querySelector(':scope > .my-settings-source-pin-v327');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'my-settings-source-pin-v327';
      button.title = 'Copy this control to My Settings.';
      button.textContent = '+';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        addPinFromLabel(label);
      });
      label.append(button);
    }
    button.textContent = selectors.has(selector) ? '✓' : '+';
  });
}

function getSourceLabels() {
  return Array.from(document.querySelectorAll('#left-panel .card label, #effect-specific-controls-card label')).filter((label) => {
    if (label.closest('#my-settings-panel-v327') || label.closest('#left-panel-search-v326')) return false;
    return Boolean(selectorForControl(getPrimaryControl(label)));
  });
}

function getPrimaryControl(label) {
  return label?.querySelector('input:not([type="hidden"]), select, textarea, button[data-effect-field], button[id]') || null;
}

function selectorForControl(control) {
  if (!control) return '';
  if (control.id) return `#${control.id}`;
  const field = control.dataset?.effectField;
  if (field) return `[data-effect-field="${field}"]`;
  return '';
}

function addPinFromLabel(label) {
  const control = getPrimaryControl(label);
  const selector = selectorForControl(control);
  if (!selector) return;
  const pins = loadPins();
  if (!pins.some((pin) => pin.selector === selector)) {
    pins.push({ selector, label: getLabelText(label) });
    savePins(pins);
  }
  decorateSourceControls();
  renderPinnedControls();
}

function renderPinnedControls() {
  const body = document.getElementById('my-settings-body-v327');
  if (!body) return;
  const pins = loadPins();
  const subtitle = document.getElementById('my-settings-subtitle-v327');
  if (subtitle) subtitle.textContent = pins.length ? `${pins.length} copied control${pins.length === 1 ? '' : 's'}.` : 'Pin favourite controls here.';
  body.innerHTML = '';
  if (!pins.length) {
    body.innerHTML = `<div class="my-settings-empty-v327">Click <strong>Edit</strong>, then use the + buttons beside any left-panel control to copy it here.</div>`;
    return;
  }
  pins.forEach((pin, index) => body.append(renderPinnedRow(pin, index)));
  scheduleSync();
}

function renderPinnedRow(pin, index) {
  const row = document.createElement('div');
  row.className = 'my-settings-row-v327';
  row.dataset.pinSelector = pin.selector;
  const source = findSource(pin.selector);
  row.classList.toggle('is-missing', !source);

  const label = document.createElement('label');
  label.textContent = pin.label || readableSelector(pin.selector);
  if (source) label.append(buildLinkedControl(source));
  else label.insertAdjacentHTML('beforeend', `<span>Control is hidden for this layer.</span>`);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'my-settings-remove-v327';
  remove.textContent = '×';
  remove.title = 'Remove this copied control from My Settings.';
  remove.addEventListener('click', () => removePin(index));

  row.append(label, remove);
  return row;
}

function buildLinkedControl(source) {
  if (source.tagName === 'SELECT') return buildSelect(source);
  if (source.tagName === 'TEXTAREA') return buildTextarea(source);
  if (source.tagName === 'BUTTON') return buildButton(source);
  if (source.tagName === 'INPUT') return buildInput(source);
  const span = document.createElement('span');
  span.textContent = 'Unsupported control.';
  return span;
}

function buildInput(source) {
  const type = source.type || 'text';
  const wrap = type === 'range' ? document.createElement('div') : null;
  if (wrap) wrap.className = 'my-settings-control-grid-v327';
  const input = document.createElement('input');
  input.type = type;
  copyAttributes(source, input, ['min', 'max', 'step', 'placeholder']);
  input.value = source.value;
  input.addEventListener('input', () => relayValue(source, input.value));
  input.addEventListener('change', () => relayValue(source, input.value));
  if (type !== 'range') return input;
  const output = document.createElement('output');
  output.textContent = source.parentElement?.querySelector('output')?.textContent || source.value;
  input.addEventListener('input', () => { output.textContent = source.parentElement?.querySelector('output')?.textContent || input.value; });
  wrap.append(input, output);
  return wrap;
}

function buildSelect(source) {
  const select = document.createElement('select');
  Array.from(source.options).forEach((option) => {
    const clone = new Option(option.textContent, option.value, option.defaultSelected, option.selected);
    select.append(clone);
  });
  select.value = source.value;
  select.addEventListener('change', () => relayValue(source, select.value));
  return select;
}

function buildTextarea(source) {
  const textarea = document.createElement('textarea');
  textarea.value = source.value;
  textarea.addEventListener('input', () => relayValue(source, textarea.value));
  return textarea;
}

function buildButton(source) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = source.textContent || 'Toggle';
  button.title = source.title || '';
  button.addEventListener('click', () => {
    source.click();
    scheduleSync();
  });
  return button;
}

function relayValue(source, value) {
  source.value = value;
  source.dispatchEvent(new Event('input', { bubbles: true }));
  source.dispatchEvent(new Event('change', { bubbles: true }));
  scheduleSync();
}

function scheduleSync() {
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(syncPinnedValues, 30);
}

function syncPinnedValues() {
  document.querySelectorAll('.my-settings-row-v327').forEach((row) => {
    const source = findSource(row.dataset.pinSelector || '');
    const clone = row.querySelector('input, select, textarea, button');
    if (!source || !clone) return;
    row.classList.remove('is-missing');
    if (source.tagName === 'BUTTON') clone.textContent = source.textContent || clone.textContent;
    else if (document.activeElement !== clone && clone.value !== source.value) clone.value = source.value;
    const output = row.querySelector('output');
    if (output) output.textContent = source.parentElement?.querySelector('output')?.textContent || source.value;
  });
}

function findSource(selector) {
  try {
    const matches = Array.from(document.querySelectorAll(selector));
    return matches.find((element) => !element.closest('#my-settings-panel-v327')) || null;
  } catch {
    return null;
  }
}

function removePin(index) {
  const pins = loadPins();
  pins.splice(index, 1);
  savePins(pins);
  decorateSourceControls();
  renderPinnedControls();
}

function loadPins() {
  try {
    const pins = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '[]');
    return Array.isArray(pins) ? pins.filter((pin) => pin && typeof pin.selector === 'string') : [];
  } catch {
    localStorage.removeItem(SETTINGS_KEY);
    return [];
  }
}

function savePins(pins) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(pins));
}

function copyAttributes(source, target, names) {
  names.forEach((name) => {
    if (source.hasAttribute(name)) target.setAttribute(name, source.getAttribute(name));
  });
}

function getLabelText(label) {
  const clone = label.cloneNode(true);
  clone.querySelectorAll('input, select, textarea, button, output').forEach((node) => node.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim() || 'Control';
}

function readableSelector(selector) {
  return String(selector || 'Control').replace(/^#/, '').replace(/^\[data-effect-field="|"\]$/g, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function installPanelObserver() {
  if (observerInstalled) return;
  const panel = document.getElementById('left-panel');
  if (!panel) return;
  observerInstalled = true;
  const observer = new MutationObserver(() => {
    decorateSourceControls();
    scheduleSync();
  });
  observer.observe(panel, { childList: true, subtree: true });
}
