import {
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
  addLayer,
  centerActiveEmitter,
  clearParticles,
  deleteActiveLayer,
  duplicateActiveLayer,
  editorState,
  getActiveLayer,
  moveActiveEmitter,
  onStateChange,
  resetComposition,
  selectLayer,
  setPaused,
  setWorkspaceMode,
  setZoom,
  toggleGrid,
  toggleHelpers,
  updateActiveLayer
} from './editor-state.js';
import { listBasePresets } from './presets/base-effects.js';
import { takeSnapshot } from './editor-renderer.js';
import { exportJSON, importJSONFromFile, saveToLocalStorage, showLocalFiles } from './editor-io.js';

const ENGINE_OPTIONS = [
  ['particles', 'Standard Particle Engine'],
  ['lightning', 'Lightning / Beam Engine'],
  ['ribbon', 'Trail / Ribbon Engine'],
  ['ring', 'Ring / Shockwave Engine'],
  ['projectile', 'Projectile / Trail Engine'],
  ['gas', 'Gas / Smoke / Dust Engine']
];

const bindings = [
  ['layer-name-input', 'name', 'text'],
  ['engine-select', 'engine', 'text'],
  ['color-a-input', 'colorA', 'text'],
  ['color-b-input', 'colorB', 'text'],
  ['alpha-start-input', 'alphaStart', 'number'],
  ['alpha-end-input', 'alphaEnd', 'number'],
  ['size-start-input', 'sizeStart', 'number'],
  ['size-end-input', 'sizeEnd', 'number'],
  ['glow-input', 'glow', 'number'],
  ['spawn-rate-input', 'spawnRate', 'number'],
  ['speed-min-input', 'speedMin', 'number'],
  ['speed-max-input', 'speedMax', 'number'],
  ['angle-input', 'angle', 'number'],
  ['spread-input', 'spread', 'number'],
  ['gravity-input', 'gravity', 'number'],
  ['lifetime-input', 'lifetime', 'number']
];

export function initUI() {
  setupHeaderAndMenuParity();
  setupMenus();
  setupPanelResizers();
  setupButtons();
  populateEngineSelect();
  bindLayerControls();
  onStateChange(syncUI);
  syncUI();
}

export function showToast(message, type = 'info') {
  const toastArea = document.getElementById('toast-area');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastArea.append(toast);
  setTimeout(() => toast.remove(), 3000);
}

function setupHeaderAndMenuParity() {
  injectHeaderMenuStyles();
  applyBrandAssets();
  rebuildTopMenus();
}

function injectHeaderMenuStyles() {
  if (document.getElementById('header-menu-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'header-menu-parity-style';
  style.textContent = `
    .brand { min-width: 300px; }
    .brand-logo-img { width: 42px; height: 42px; object-fit: contain; display: block; filter: drop-shadow(0 0 10px rgba(158,1,206,.55)); }
    .brand-title-img { height: 28px; max-width: 192px; object-fit: contain; object-position: left center; display: block; }
    .brand-title-fallback { font-family: 'Cinzel', Georgia, serif; font-size: 22px; letter-spacing: .18em; color: var(--gold-bright); }
    .menu-panel.parity-wide { width: min(300px, calc(100vw - 24px)); }
    .menu-section-title { margin: 8px 4px 6px; color: var(--gold-muted); font-family: 'Cinzel', Georgia, serif; font-size: 10px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    .menu-section-title:first-child { margin-top: 0; }
    .menu-divider { height: 1px; margin: 7px 2px; background: rgba(56,42,33,.82); }
    .menu-panel button.is-placeholder { color: var(--muted); opacity: .9; }
    .menu-panel button.is-danger { color: #ffb4c0; }
    .menu-panel button.is-accent { color: white; border-color: rgba(158,1,206,.65); background: linear-gradient(180deg, #52205a 0%, #2b182d 100%); }
  `;
  document.head.append(style);
}

function applyBrandAssets() {
  const brandMark = document.querySelector('.brand-mark');
  if (brandMark) {
    brandMark.textContent = '';
    const logo = document.createElement('img');
    logo.src = '../artifex/artifexlogo.png';
    logo.alt = 'Artifex logo';
    logo.className = 'brand-logo-img';
    logo.onerror = () => {
      logo.remove();
      brandMark.textContent = '✦';
    };
    brandMark.append(logo);
  }

  const title = document.querySelector('.brand h1');
  if (title) {
    title.textContent = '';
    const titleImg = document.createElement('img');
    titleImg.src = '../artifex/artifextitle.png';
    titleImg.alt = 'Artifex';
    titleImg.className = 'brand-title-img';
    titleImg.onerror = () => {
      titleImg.remove();
      title.textContent = 'ARTIFEX';
      title.classList.add('brand-title-fallback');
    };
    title.append(titleImg);
  }
}

function rebuildTopMenus() {
  setPanelHTML('menu-file', `
    <div class="menu-section-title">New / Import</div>
    <button id="new-effect-button">New Effect Archetype</button>
    <label class="menu-file-label">Import FX JSON<input id="import-json-input" type="file" accept=".json,application/json" hidden /></label>
    <button class="is-placeholder" data-toast-message="Effekseer Draft import is reserved for a later compatibility pass.">Import Effekseer Draft</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">Export Archetype</div>
    <button id="export-json-button">Raw Layer Composition</button>
    <button class="is-placeholder" data-toast-message="Editor Project export will be restored in the IO parity pass.">Editor Project</button>
    <button class="is-placeholder" data-toast-message="Effect Archetype Asset export will be restored with thumbnail/save flow.">Effect Archetype Asset</button>
    <button class="is-placeholder" data-toast-message="Scene FX Instance export will be restored after runtime compatibility is stable.">Scene FX Instance</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">Local Files</div>
    <button id="save-local-button">Save to Local Storage</button>
    <button id="view-local-button">View Local Files</button>
    <button class="is-placeholder" data-toast-message="Scene / FX Resolution settings are scheduled for the resolution pass.">Settings</button>
  `, 'parity-wide');

  setPanelHTML('menu-edit', `
    <div class="menu-section-title">Layer Actions</div>
    <button id="duplicate-layer-button">Duplicate Layer</button>
    <button id="delete-layer-button" class="is-danger">Delete Layer</button>
    <button id="clear-particles-button">Clear All Particles</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">Emitter</div>
    <button id="center-emitter-button">Center / Reset Emitter</button>
    <button class="is-placeholder" data-toast-message="Bring Forward / Send Back will be restored with layer ordering controls.">Bring Forward / Send Back</button>
  `, 'parity-wide');

  setPanelHTML('menu-view', `
    <div class="menu-section-title">Workspace Profile</div>
    <button data-workspace-mode="dark">Dark Workspace</button>
    <button data-workspace-mode="white">White Workspace</button>
    <button class="is-placeholder" data-toast-message="Reference image/video mode will be restored in the workspace controls pass.">Reference Image / Video</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">Helpers</div>
    <button id="toggle-grid-button">Snap / Grid Guides</button>
    <button id="toggle-helpers-button">Helper Visibility</button>
    <button class="is-placeholder" data-toast-message="Load reference image/video is scheduled for the workspace controls pass.">Load Reference Image / Video</button>
    <button class="is-placeholder" data-toast-message="Low Performance Mode will be restored after runtime controls are stable.">Low Performance Mode</button>
  `, 'parity-wide');

  setPanelHTML('menu-help', `
    <button id="quick-start-button">Quick Start Guide</button>
    <button class="is-placeholder" data-toast-message="Terminology guide links will be restored after menu parity is confirmed.">Terminology / Guide Links</button>
    <button id="about-button">About Artifex Studio</button>
  `, 'right');
}

function setPanelHTML(id, html, extraClass) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.className = `menu-panel ${extraClass || ''}`.trim();
  panel.innerHTML = html;
}

function setupMenus() {
  document.querySelectorAll('.menu-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const id = button.dataset.menu;
      const panel = document.getElementById(`menu-${id}`);
      const isOpen = panel.classList.contains('open');
      closeAllMenus();
      if (!isOpen) panel.classList.add('open');
    });
  });

  document.addEventListener('click', closeAllMenus);
  document.querySelectorAll('.menu-panel').forEach((panel) => {
    panel.addEventListener('click', (event) => event.stopPropagation());
  });
}

function closeAllMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

function setupButtons() {
  document.getElementById('new-effect-button').addEventListener('click', () => {
    resetComposition();
    showToast('New effect archetype created.', 'success');
  });
  document.getElementById('delete-layer-button').addEventListener('click', () => {
    deleteActiveLayer();
    showToast('Layer deleted.', 'warn');
  });
  document.getElementById('duplicate-layer-button').addEventListener('click', () => {
    duplicateActiveLayer();
    showToast('Layer duplicated.', 'success');
  });
  document.getElementById('clear-particles-button').addEventListener('click', () => {
    clearParticles();
    showToast('Particles cleared.', 'success');
  });
  document.getElementById('center-emitter-button').addEventListener('click', () => {
    centerActiveEmitter();
    showToast('Emitter centered.', 'success');
  });
  document.getElementById('export-json-button').addEventListener('click', exportJSON);
  document.getElementById('save-local-button').addEventListener('click', saveToLocalStorage);
  document.getElementById('view-local-button').addEventListener('click', showLocalFiles);
  document.getElementById('load-local-button').addEventListener('click', showLocalFiles);
  document.getElementById('import-json-input').addEventListener('change', importJSONFromFile);
  document.getElementById('toggle-grid-button').addEventListener('click', toggleGrid);
  document.getElementById('toggle-helpers-button').addEventListener('click', toggleHelpers);
  document.getElementById('pause-button').addEventListener('click', () => {
    setPaused(!editorState.isPaused);
  });
  document.getElementById('snapshot-button').addEventListener('click', takeSnapshot);
  document.getElementById('zoom-in-button').addEventListener('click', () => setZoom(editorState.zoom + 0.1));
  document.getElementById('zoom-out-button').addEventListener('click', () => setZoom(editorState.zoom - 0.1));
  document.getElementById('zoom-reset-button').addEventListener('click', () => setZoom(1));
  document.getElementById('quick-start-button').addEventListener('click', () => {
    showToast('Insert > Base Layer > Standard Particle, then adjust sliders.', 'info');
  });
  document.getElementById('about-button').addEventListener('click', () => {
    showToast('Artifex Effect Editor modular test build: header/menu parity active.', 'info');
  });

  document.querySelectorAll('[data-workspace-mode]').forEach((button) => {
    button.addEventListener('click', () => setWorkspaceMode(button.dataset.workspaceMode));
  });

  document.querySelectorAll('[data-quick-preset]').forEach((button) => {
    button.addEventListener('click', () => applyQuickPreset(button.dataset.quickPreset));
  });

  document.querySelectorAll('[data-toast-message]').forEach((button) => {
    button.addEventListener('click', () => showToast(button.dataset.toastMessage, 'info'));
  });
}

function setupPanelResizers() {
  const leftPanel = document.getElementById('left-panel');
  const sideResizer = document.getElementById('side-resizer');
  const bottomPanel = document.getElementById('bottom-panel');
  const bottomResizer = document.getElementById('bottom-resizer');

  sideResizer.addEventListener('pointerdown', (event) => {
    sideResizer.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startWidth = leftPanel.getBoundingClientRect().width;

    const move = (moveEvent) => {
      const width = Math.min(560, Math.max(245, startWidth + moveEvent.clientX - startX));
      leftPanel.style.width = `${width}px`;
    };
    const up = () => {
      sideResizer.removeEventListener('pointermove', move);
      sideResizer.removeEventListener('pointerup', up);
    };

    sideResizer.addEventListener('pointermove', move);
    sideResizer.addEventListener('pointerup', up);
  });

  bottomResizer.addEventListener('pointerdown', (event) => {
    bottomResizer.setPointerCapture(event.pointerId);
    const startY = event.clientY;
    const startHeight = bottomPanel.getBoundingClientRect().height;

    const move = (moveEvent) => {
      const height = Math.min(420, Math.max(86, startHeight - (moveEvent.clientY - startY)));
      bottomPanel.style.height = `${height}px`;
    };
    const up = () => {
      bottomResizer.removeEventListener('pointermove', move);
      bottomResizer.removeEventListener('pointerup', up);
    };

    bottomResizer.addEventListener('pointermove', move);
    bottomResizer.addEventListener('pointerup', up);
  });
}

function bindLayerControls() {
  for (const [elementId, property, kind] of bindings) {
    const element = document.getElementById(elementId);
    element.addEventListener('input', () => {
      const value = kind === 'number' ? Number(element.value) : element.value;
      updateActiveLayer({ [property]: value });
    });
  }

  document.getElementById('emitter-x-input').addEventListener('input', (event) => {
    const layer = getActiveLayer();
    if (layer) moveActiveEmitter(Number(event.target.value), layer.emitterY);
  });

  document.getElementById('emitter-y-input').addEventListener('input', (event) => {
    const layer = getActiveLayer();
    if (layer) moveActiveEmitter(layer.emitterX, Number(event.target.value));
  });
}

function populateEngineSelect() {
  const select = document.getElementById('engine-select');
  select.innerHTML = ENGINE_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  select.title = 'Choose the active layer effect engine.';
}

function ensureEngineOption(value) {
  const select = document.getElementById('engine-select');
  if (!select.options.length) populateEngineSelect();
  if (!value) return;
  const exists = Array.from(select.options).some((option) => option.value === value);
  if (!exists) {
    select.append(new Option(labelForEngine(value), value));
  }
}

function labelForEngine(value) {
  const known = ENGINE_OPTIONS.find(([engine]) => engine === value);
  if (known) return known[1];
  return String(value || 'Unknown Engine').replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function syncUI() {
  renderLayerList();
  syncControls();
  updateStatus();
}

function renderLayerList() {
  const list = document.getElementById('layer-list');
  const layers = editorState.composition.layers;
  document.getElementById('layer-count').textContent = `${layers.length} layer${layers.length === 1 ? '' : 's'}`;

  if (!layers.length) {
    list.innerHTML = '<div class="layer-item"><strong>No layers yet</strong><span>Use Insert > Base Layer.</span></div>';
    return;
  }

  list.innerHTML = '';
  layers.forEach((layer, index) => {
    const item = document.createElement('div');
    item.className = `layer-item ${index === editorState.activeLayerIndex ? 'selected' : ''}`;
    item.innerHTML = `<strong>${escapeHtml(layer.name)}</strong><span>${escapeHtml(layer.engine)} · ${layer.visible === false ? 'hidden' : 'visible'}</span>`;
    item.addEventListener('click', () => selectLayer(index));
    list.append(item);
  });
}

function syncControls() {
  const layer = getActiveLayer();
  const disabled = !layer;

  for (const [elementId, property] of bindings) {
    const element = document.getElementById(elementId);
    element.disabled = disabled;

    if (layer) {
      if (elementId === 'engine-select') {
        ensureEngineOption(layer[property]);
      }
      if (String(element.value) !== String(layer[property])) {
        element.value = layer[property];
      }
      if (elementId === 'engine-select') {
        element.title = labelForEngine(layer[property]);
        element.dataset.selectedLabel = labelForEngine(layer[property]);
      }
    }

    const output = document.getElementById(elementId.replace('-input', '-output'));
    if (output && layer) output.textContent = String(layer[property]);
  }

  document.getElementById('emitter-x-input').disabled = disabled;
  document.getElementById('emitter-y-input').disabled = disabled;

  if (layer) {
    document.getElementById('emitter-x-input').value = Math.round(layer.emitterX);
    document.getElementById('emitter-y-input').value = Math.round(layer.emitterY);
  }
}

function updateStatus() {
  document.getElementById('pause-button').textContent = editorState.isPaused ? 'Resume' : 'Pause';
  document.getElementById('zoom-readout').textContent = `${Math.round(editorState.zoom * 100)}%`;
  document.getElementById('status-text').textContent = `FPS ${editorState.renderStats.fps} · particles ${editorState.renderStats.particles} · stage ${DESIGN_WIDTH}×${DESIGN_HEIGHT}`;
}

function applyQuickPreset(name) {
  const presets = {
    fire: { colorA: '#fff1a8', colorB: '#ff2d00', glow: 28, gravity: 0.04 },
    ice: { colorA: '#ffffff', colorB: '#00a1d7', glow: 22, gravity: -0.01 },
    goodMagic: { colorA: '#d65cff', colorB: '#5e8cff', glow: 34, gravity: -0.008 },
    darkMagic: { colorA: '#7cff00', colorB: '#07100a', glow: 18, gravity: 0.015 }
  };
  updateActiveLayer(presets[name]);
  showToast(`${name} colours applied.`, 'success');
}

export function addPresetLayer(preset) {
  addLayer(preset.config);
  showToast(`${preset.label} inserted.`, 'success');
}

export function getAvailableBasePresets() {
  return listBasePresets();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}
