import {
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
import { initRenderer, takeSnapshot } from './editor-renderer.js';
import { cloneBasePreset, listBasePresets } from './presets/base-effects.js';

const VERSION_LABEL = 'V3.31-emergency';

const ENGINE_OPTIONS = [
  ['particles', 'Standard Particle Engine'],
  ['lightning', 'Lightning / Beam Engine'],
  ['electric-arc', 'Electric Arc Engine'],
  ['ribbon', 'Trail / Ribbon Engine'],
  ['ring', 'Ring / Shockwave Engine'],
  ['projectile', 'Projectile / Trail Engine'],
  ['gas', 'Gas / Smoke / Dust Engine'],
  ['shockwave', 'Shockwave Pulse Engine'],
  ['refraction', 'Refraction / Shimmer Engine'],
  ['heatdistortion', 'Heat Distortion Engine'],
  ['lensflare', 'Lens Flare Engine'],
  ['true-lensflare', 'True Lens Flare Engine']
];

const BINDINGS = [
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
  ['gravity-input', 'gravity', 'number'],
  ['angle-input', 'angle', 'number'],
  ['spread-input', 'spread', 'number'],
  ['lifetime-input', 'lifetime', 'number']
];

window.addEventListener('DOMContentLoaded', () => {
  setVersionLabel();
  installEmergencyBootStyles();
  safeRun('renderer', initRenderer);
  populateEngineSelect();
  populateBaseLayerMenu();
  setupMenus();
  setupButtons();
  bindLayerControls();
  addStarterLayer();
  onStateChange(syncUI);
  syncUI();
  showToast(`${VERSION_LABEL} loaded. Emergency stable shell is active.`, 'success');
});

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;
}

function installEmergencyBootStyles() {
  if (document.getElementById('v331-emergency-style')) return;
  const style = document.createElement('style');
  style.id = 'v331-emergency-style';
  style.textContent = `
    .menu-panel.open { display: block !important; }
    #base-layer-list button { width: 100%; display: block; text-align: left; margin-bottom: 7px; }
    #base-layer-list button span { display: block; margin-top: 3px; color: var(--gold-muted); font-size: 10px; line-height: 1.25; font-weight: 400; }
    .layer-item { cursor: pointer; }
    .layer-item.selected { border-color: var(--module-accent); box-shadow: 0 0 0 1px var(--module-glow); }
  `;
  document.head.append(style);
}

function setupMenus() {
  document.querySelectorAll('.menu-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const panel = document.getElementById(`menu-${button.dataset.menu}`);
      if (!panel) return;
      const wasOpen = panel.classList.contains('open');
      closeMenus();
      if (!wasOpen) panel.classList.add('open');
    });
  });
  document.querySelectorAll('.menu-panel').forEach((panel) => panel.addEventListener('click', (event) => event.stopPropagation()));
  document.addEventListener('click', closeMenus);
}

function closeMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

function populateEngineSelect() {
  const select = document.getElementById('engine-select');
  if (!select) return;
  select.innerHTML = ENGINE_OPTIONS.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
}

function populateBaseLayerMenu() {
  const list = document.getElementById('base-layer-list');
  if (!list) return;
  list.innerHTML = listBasePresets().map((preset) => `
    <button type="button" data-base-preset="${escapeHtml(preset.id)}" title="${escapeHtml(preset.description || '')}">
      ${escapeHtml(preset.label || preset.id)}
      <span>${escapeHtml(preset.description || preset.engine || '')}</span>
    </button>
  `).join('');
}

function setupButtons() {
  bindClick('new-effect-button', () => {
    resetComposition();
    addStarterLayer();
    closeMenus();
    showToast('New effect archetype created.', 'success');
  });
  bindClick('duplicate-layer-button', () => { duplicateActiveLayer(); showToast('Layer duplicated.', 'success'); });
  bindClick('delete-layer-button', () => { deleteActiveLayer(); showToast('Layer deleted.', 'warn'); });
  bindClick('clear-particles-button', () => { clearParticles(); showToast('Particles cleared.', 'success'); });
  bindClick('center-emitter-button', () => { centerActiveEmitter(); showToast('Origin centered.', 'success'); });
  bindClick('pause-button', () => setPaused(!editorState.isPaused));
  bindClick('snapshot-button', takeSnapshot);
  bindClick('zoom-in-button', () => setZoom(editorState.zoom + 0.1));
  bindClick('zoom-out-button', () => setZoom(editorState.zoom - 0.1));
  bindClick('zoom-reset-button', () => setZoom(1));
  bindClick('toggle-grid-button', toggleGrid);
  bindClick('toggle-helpers-button', toggleHelpers);
  bindClick('quick-start-button', () => showToast('Use Insert > Base Layer to add an effect preset.', 'info'));
  bindClick('about-button', () => showToast('Emergency stable shell while the patch modules are repaired.', 'info'));

  document.querySelectorAll('[data-workspace-mode]').forEach((button) => {
    button.addEventListener('click', () => { setWorkspaceMode(button.dataset.workspaceMode); closeMenus(); });
  });
  document.querySelectorAll('[data-base-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = cloneBasePreset('base', button.dataset.basePreset);
      if (preset?.config) {
        addLayer(preset.config);
        showToast(`Added ${preset.label}.`, 'success');
      }
      closeMenus();
    });
  });
  document.querySelectorAll('[data-quick-preset]').forEach((button) => {
    button.addEventListener('click', () => applyQuickPreset(button.dataset.quickPreset));
  });
}

function bindClick(id, handler) {
  const element = document.getElementById(id);
  if (element) element.addEventListener('click', handler);
}

function bindLayerControls() {
  BINDINGS.forEach(([id, property, kind]) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.addEventListener('input', () => {
      const value = kind === 'number' ? Number(element.value) : element.value;
      updateActiveLayer({ [property]: value });
    });
    element.addEventListener('change', () => {
      const value = kind === 'number' ? Number(element.value) : element.value;
      updateActiveLayer({ [property]: value });
    });
  });

  const emitterX = document.getElementById('emitter-x-input');
  const emitterY = document.getElementById('emitter-y-input');
  emitterX?.addEventListener('input', () => {
    const layer = getActiveLayer();
    if (layer) moveActiveEmitter(Number(emitterX.value), layer.emitterY);
  });
  emitterY?.addEventListener('input', () => {
    const layer = getActiveLayer();
    if (layer) moveActiveEmitter(layer.emitterX, Number(emitterY.value));
  });
}

function addStarterLayer() {
  if (editorState.composition.layers.length) return;
  const preset = cloneBasePreset('base', 'standard-particle');
  if (preset?.config) addLayer(preset.config);
}

function syncUI() {
  renderLayerList();
  syncControls();
  syncStatus();
}

function renderLayerList() {
  const list = document.getElementById('layer-list');
  const count = document.getElementById('layer-count');
  if (!list || !count) return;
  const layers = editorState.composition.layers;
  count.textContent = `${layers.length} layer${layers.length === 1 ? '' : 's'}`;
  list.innerHTML = '';
  if (!layers.length) {
    list.innerHTML = '<div class="layer-item"><strong>No layers yet</strong><span>Use Insert > Base Layer.</span></div>';
    return;
  }
  layers.forEach((layer, index) => {
    const item = document.createElement('div');
    item.className = `layer-item ${index === editorState.activeLayerIndex ? 'selected' : ''}`;
    item.innerHTML = `<strong>${escapeHtml(layer.name || 'Effect Layer')}</strong><span>${escapeHtml(layer.engine || 'particles')} · ${layer.visible === false ? 'hidden' : 'visible'}</span>`;
    item.addEventListener('click', () => selectLayer(index));
    list.append(item);
  });
}

function syncControls() {
  const layer = getActiveLayer();
  BINDINGS.forEach(([id, property]) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.disabled = !layer;
    if (layer && document.activeElement !== element) element.value = layer[property] ?? '';
  });
  const emitterX = document.getElementById('emitter-x-input');
  const emitterY = document.getElementById('emitter-y-input');
  if (emitterX) emitterX.value = layer ? Math.round(layer.emitterX || 0) : 0;
  if (emitterY) emitterY.value = layer ? Math.round(layer.emitterY || 0) : 0;

  setOutput('alpha-start-output', layer?.alphaStart);
  setOutput('alpha-end-output', layer?.alphaEnd);
  setOutput('size-start-output', layer?.sizeStart);
  setOutput('size-end-output', layer?.sizeEnd);
  setOutput('glow-output', layer?.glow);
  setOutput('spawn-rate-output', layer?.spawnRate);
  setOutput('speed-min-output', layer?.speedMin);
  setOutput('speed-max-output', layer?.speedMax);
  setOutput('gravity-output', layer?.gravity);
  setOutput('angle-output', layer?.angle);
  setOutput('spread-output', layer?.spread);
  setOutput('lifetime-output', layer?.lifetime);
}

function syncStatus() {
  const status = document.getElementById('status-text');
  const zoom = document.getElementById('zoom-readout');
  if (zoom) zoom.textContent = `${Math.round(editorState.zoom * 100)}%`;
  if (!status) return;
  status.textContent = `FPS ${editorState.renderStats.fps} | Particles ${editorState.renderStats.particles} / ${editorState.renderStats.particleCap} | ${editorState.renderStats.performanceMode}`;
}

function setOutput(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = formatValue(value);
}

function formatValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/u, '').replace(/\.$/u, '');
}

function applyQuickPreset(kind) {
  const presets = {
    fire: { colorA: '#fff1a8', colorB: '#ff2600', glow: 34, gravity: 0.04 },
    ice: { colorA: '#ffffff', colorB: '#00a1d7', glow: 22, gravity: -0.01 },
    goodMagic: { colorA: '#fff7cf', colorB: '#5e8cff', glow: 30, gravity: -0.008 },
    darkMagic: { colorA: '#7cff00', colorB: '#07100a', glow: 20, gravity: 0.015 }
  };
  if (!presets[kind]) return;
  updateActiveLayer(presets[kind]);
  showToast('Quick preset applied.', 'success');
}

function showToast(message, type = 'info') {
  const area = document.getElementById('toast-area');
  if (!area) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  area.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function safeRun(name, action) {
  try {
    action();
  } catch (error) {
    console.error(`[Effect Editor] ${name} failed`, error);
    showToast(`${name} failed.`, 'warn');
  }
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
