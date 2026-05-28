import { addLayer, editorState, onStateChange, resetComposition, selectLayer } from './editor-state.js';
import { cloneBasePreset, listBasePresets } from './presets/base-effects.js';

let installed = false;

export function initV330BootRecovery(showToast = () => {}) {
  if (installed) return;
  installed = true;
  injectStyles();
  installMenuFallback(showToast);
  installBaseLayerFallback(showToast);
  onStateChange(renderLayerListFallback);
  window.setTimeout(() => recoverEditorBasics(showToast), 0);
  window.setTimeout(() => recoverEditorBasics(showToast), 160);
  window.setTimeout(() => recoverEditorBasics(showToast), 650);
}

function injectStyles() {
  if (document.getElementById('v330-boot-recovery-style')) return;
  const style = document.createElement('style');
  style.id = 'v330-boot-recovery-style';
  style.textContent = `
    .menu-panel.open { display: block !important; }
    .menu-panel.v330-open { display: block !important; }
    #base-layer-list .v330-base-preset-button {
      width: 100%;
      display: block;
      text-align: left;
      margin-bottom: 7px;
    }
    #base-layer-list .v330-base-preset-button span {
      display: block;
      margin-top: 3px;
      color: var(--gold-muted);
      font-size: 10px;
      line-height: 1.25;
      font-weight: 400;
    }
    .layer-item.v330-layer-item { cursor: pointer; }
  `;
  document.head.append(style);
}

function recoverEditorBasics(showToast) {
  populateBaseLayerList(showToast);
  ensureStarterLayer();
  renderLayerListFallback();
}

function installMenuFallback(showToast) {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.menu-button');
    if (!button) return;
    const menuId = button.dataset.menu;
    const panel = document.getElementById(`menu-${menuId}`);
    if (!panel) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const wasOpen = panel.classList.contains('open') || panel.classList.contains('v330-open');
    closeMenus();
    if (!wasOpen) {
      panel.classList.add('open', 'v330-open');
      showToast(`Opened ${readable(menuId)} menu.`, 'info');
    }
  }, true);

  document.addEventListener('click', (event) => {
    if (event.target.closest('.menu-panel')) return;
    if (event.target.closest('.menu-button')) return;
    closeMenus();
  }, true);

  document.querySelectorAll('.menu-panel').forEach((panel) => {
    panel.addEventListener('click', (event) => event.stopPropagation());
  });
}

function closeMenus() {
  document.querySelectorAll('.menu-panel.open, .menu-panel.v330-open').forEach((panel) => {
    panel.classList.remove('open', 'v330-open');
  });
}

function installBaseLayerFallback(showToast) {
  document.addEventListener('click', (event) => {
    const presetButton = event.target.closest('[data-v330-base-preset]');
    if (presetButton) {
      event.preventDefault();
      const preset = cloneBasePreset('base', presetButton.dataset.v330BasePreset);
      if (!preset?.config) return;
      addLayer(preset.config);
      closeMenus();
      showToast(`Added ${preset.label}.`, 'success');
      renderLayerListFallback();
      return;
    }

    const newButton = event.target.closest('#new-effect-button');
    if (newButton) {
      event.preventDefault();
      resetComposition();
      ensureStarterLayer();
      renderLayerListFallback();
      closeMenus();
      showToast('New effect archetype created with a starter layer.', 'success');
      return;
    }
  }, true);
}

function populateBaseLayerList(showToast) {
  const list = document.getElementById('base-layer-list');
  if (!list || list.dataset.v330BaseLayerList === 'true') return;
  list.dataset.v330BaseLayerList = 'true';
  list.innerHTML = listBasePresets().map((preset) => `
    <button type="button" class="v330-base-preset-button" data-v330-base-preset="${escapeHtml(preset.id)}" title="${escapeHtml(preset.description || '')}">
      ${escapeHtml(preset.label || preset.id)}
      <span>${escapeHtml(preset.description || preset.engine || '')}</span>
    </button>
  `).join('');
  showToast('Base layer insert menu restored.', 'info');
}

function ensureStarterLayer() {
  if (editorState.composition.layers.length) {
    if (editorState.activeLayerIndex < 0) selectLayer(0);
    return;
  }
  const preset = cloneBasePreset('base', 'standard-particle');
  if (preset?.config) addLayer(preset.config);
}

function renderLayerListFallback() {
  const list = document.getElementById('layer-list');
  const count = document.getElementById('layer-count');
  if (!list || !count) return;
  const layers = editorState.composition.layers;
  count.textContent = `${layers.length} layer${layers.length === 1 ? '' : 's'}`;
  if (!layers.length) {
    list.innerHTML = '<div class="layer-item"><strong>No layers yet</strong><span>Use Insert > Base Layer.</span></div>';
    return;
  }
  list.innerHTML = '';
  layers.forEach((layer, index) => {
    const item = document.createElement('div');
    item.className = `layer-item v330-layer-item ${index === editorState.activeLayerIndex ? 'selected' : ''}`;
    item.innerHTML = `<strong>${escapeHtml(layer.name || 'Effect Layer')}</strong><span>${escapeHtml(layer.engine || 'particles')} · ${layer.visible === false ? 'hidden' : 'visible'}</span>`;
    item.addEventListener('click', () => selectLayer(index));
    list.append(item);
  });
}

function readable(value) {
  return String(value || '').replace(/[-_]/g, ' ');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}
