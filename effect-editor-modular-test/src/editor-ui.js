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
    showToast('Modular test build: separated state, UI, library, IO, renderer, runtime, and presets.', 'info');
  });

  document.querySelectorAll('[data-workspace-mode]').forEach((button) => {
    button.addEventListener('click', () => setWorkspaceMode(button.dataset.workspaceMode));
  });

  document.querySelectorAll('[data-quick-preset]').forEach((button) => {
    button.addEventListener('click', () => applyQuickPreset(button.dataset.quickPreset));
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
