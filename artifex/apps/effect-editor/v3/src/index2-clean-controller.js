import {
  addLayer,
  centerActiveEmitter,
  clearParticles,
  deleteActiveLayer,
  duplicateActiveLayer,
  editorState,
  getActiveLayer,
  moveActiveEmitter,
  moveLayer,
  onStateChange,
  resetComposition,
  selectLayer,
  setLowPerformanceMode,
  setPaused,
  setWorkspaceMode,
  setZoom,
  toggleGrid,
  toggleHelpers,
  toggleLayerVisibility,
  updateActiveLayer
} from './editor-state.js';
import { initRenderer, takeSnapshot } from './editor-renderer.js';
import { cloneBasePreset, listBasePresets } from './presets/base-effects.js';

const VERSION_LABEL = 'INDEX2-CLEAN-0.1.2';

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
  injectStyles();
  prepareSafeState();
  buildBottomPanel();
  safeRun('renderer', initRenderer);
  populateEngineSelect();
  populateBaseLayerMenu();
  setupMenus();
  setupButtons();
  bindLayerControls();
  addStarterLayer();
  onStateChange(syncUI);
  syncUI();
  showToast(`${VERSION_LABEL} loaded. Clean test page.`, 'success');
});

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  document.getElementById('version-badge')?.replaceChildren(document.createTextNode(VERSION_LABEL));
}

function prepareSafeState() {
  editorState.emergencyLiteMode = true;
  editorState.showGrid = true;
  editorState.showHelpers = true;
  setLowPerformanceMode(true);
  setPaused(true);
  editorState.particles = [];
}

function injectStyles() {
  if (document.getElementById('index2-clean-style')) return;
  const style = document.createElement('style');
  style.id = 'index2-clean-style';
  style.textContent = `
    .menu-panel.open { display: block !important; }
    #base-layer-list button { width: 100%; display: block; text-align: left; margin-bottom: 7px; }
    #base-layer-list button span { display: block; margin-top: 3px; color: var(--gold-muted); font-size: 10px; line-height: 1.25; font-weight: 400; }
    .workspace-toolbar #status-text { margin-left: auto; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .index2-bottom-grid { display: grid; grid-template-columns: minmax(330px, 1.5fr) minmax(230px, .78fr) minmax(310px, 1fr); gap: 14px; min-height: 100%; }
    .index2-bottom-card { min-width: 0; border-left: 1px solid rgba(56,42,33,.75); padding-left: 14px; }
    .index2-bottom-card:first-child { border-left: 0; padding-left: 0; }
    .index2-layer-toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 10px; }
    .index2-layer-toolbar button, .index2-display-grid button, .index2-zoom-strip button { min-width: 34px; min-height: 34px; padding: 4px 8px; border-radius: 13px; }
    .index2-display-grid { display: grid; grid-template-columns: repeat(3, minmax(34px, 46px)); gap: 8px; align-items: center; justify-content: start; margin-top: 8px; }
    .index2-zoom-strip { display: grid; grid-template-columns: 34px 58px 34px auto; gap: 8px; align-items: center; margin-top: 10px; }
    #index2-zoom-readout { color: var(--gold-bright); text-align: center; font-weight: 800; }
    .index2-diagnostics { color: var(--module-accent-strong); font-family: 'Fira Code', monospace; font-size: 12px; line-height: 1.55; white-space: pre-wrap; }
    .layer-item { cursor: pointer; }
    .layer-item.selected { border-color: var(--module-accent); box-shadow: 0 0 0 1px var(--module-glow); }
    @media (max-width: 1100px) { .index2-bottom-grid { grid-template-columns: 1fr; } }
  `;
  document.head.append(style);
}

function buildBottomPanel() {
  const panel = document.getElementById('bottom-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="index2-bottom-grid">
      <section class="index2-bottom-card">
        <header><h2>Layers</h2><span id="layer-count">0 layers</span></header>
        <div class="index2-layer-toolbar" aria-label="Layer actions">
          <button type="button" data-index2-action="layer-up" title="Move layer up.">↑</button>
          <button type="button" data-index2-action="layer-down" title="Move layer down.">↓</button>
          <button type="button" data-index2-action="layer-visible" title="Toggle active layer visibility.">👁️</button>
          <button type="button" data-index2-action="duplicate" title="Duplicate active layer.">⧉</button>
          <button type="button" data-index2-action="delete" title="Delete active layer.">×</button>
        </div>
        <div id="layer-list" class="layer-list"></div>
      </section>
      <section class="index2-bottom-card">
        <header><h2>Display</h2><span id="index2-display-state">Paused</span></header>
        <div class="index2-display-grid" aria-label="Display controls">
          <button type="button" data-index2-action="pause" id="index2-display-pause" title="Pause or resume preview.">▶</button>
          <button type="button" data-index2-action="snapshot" title="Save snapshot.">📸</button>
          <button type="button" data-index2-action="grid" title="Toggle grid.">▦</button>
          <button type="button" data-index2-action="helpers" title="Toggle guides.">🎯</button>
          <button type="button" data-index2-action="background" title="Toggle dark / white background.">BG</button>
          <button type="button" data-index2-action="folder" title="Reserved local effects button.">📁</button>
        </div>
        <div class="index2-zoom-strip" aria-label="Zoom controls">
          <button type="button" data-index2-action="zoom-out" title="Zoom out.">−</button>
          <span id="index2-zoom-readout">100%</span>
          <button type="button" data-index2-action="zoom-in" title="Zoom in.">+</button>
          <button type="button" data-index2-action="zoom-reset" title="Reset zoom.">Reset</button>
        </div>
      </section>
      <section class="index2-bottom-card">
        <header><h2>Diagnostics</h2></header>
        <div id="index2-diagnostics" class="index2-diagnostics">Ready.</div>
      </section>
    </div>
  `;
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
  bindClick('pause-button', togglePaused);
  bindClick('snapshot-button', takeSnapshot);
  bindClick('snapshot-button-menu', takeSnapshot);
  bindClick('zoom-in-button', () => setZoom(editorState.zoom + 0.1));
  bindClick('zoom-out-button', () => setZoom(editorState.zoom - 0.1));
  bindClick('zoom-reset-button', () => setZoom(1));
  bindClick('toggle-grid-button', toggleGrid);
  bindClick('toggle-helpers-button', toggleHelpers);
  bindClick('about-button', () => showToast(`${VERSION_LABEL}: clean index2 test page.`, 'info'));

  document.querySelectorAll('[data-workspace-mode]').forEach((button) => {
    button.addEventListener('click', () => { setWorkspaceMode(button.dataset.workspaceMode); closeMenus(); });
  });
  document.querySelectorAll('[data-base-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      addPresetById(button.dataset.basePreset);
      closeMenus();
    });
  });
  document.querySelectorAll('[data-quick-preset]').forEach((button) => {
    button.addEventListener('click', () => applyQuickPreset(button.dataset.quickPreset));
  });
  document.querySelectorAll('[data-index2-action]').forEach((button) => {
    button.addEventListener('click', () => runBottomAction(button.dataset.index2Action));
  });
}

function runBottomAction(action) {
  if (action === 'duplicate') {
    duplicateActiveLayer();
    showToast('Layer duplicated.', 'success');
  } else if (action === 'delete') {
    deleteActiveLayer();
    showToast('Layer deleted.', 'warn');
  } else if (action === 'layer-up') {
    moveActiveLayerBy(-1);
  } else if (action === 'layer-down') {
    moveActiveLayerBy(1);
  } else if (action === 'layer-visible') {
    toggleLayerVisibility(editorState.activeLayerIndex);
    showToast('Layer visibility toggled.', 'info');
  } else if (action === 'pause') togglePaused();
  else if (action === 'snapshot') takeSnapshot();
  else if (action === 'grid') toggleGrid();
  else if (action === 'helpers') toggleHelpers();
  else if (action === 'zoom-out') setZoom(editorState.zoom - 0.1);
  else if (action === 'zoom-in') setZoom(editorState.zoom + 0.1);
  else if (action === 'zoom-reset') setZoom(1);
  else if (action === 'background') toggleWorkspaceBackground();
  else showToast('Reserved for next index2 pass.', 'info');
}

function moveActiveLayerBy(delta) {
  const fromIndex = editorState.activeLayerIndex;
  const toIndex = fromIndex + delta;
  if (fromIndex < 0 || toIndex < 0 || toIndex >= editorState.composition.layers.length) {
    showToast('Layer cannot move further.', 'warn');
    return;
  }
  moveLayer(fromIndex, toIndex);
  showToast(delta < 0 ? 'Layer moved up.' : 'Layer moved down.', 'success');
}

function toggleWorkspaceBackground() {
  const next = editorState.workspaceMode === 'white' ? 'dark' : 'white';
  setWorkspaceMode(next);
}

function togglePaused() {
  setPaused(!editorState.isPaused);
  editorState.emergencyLiteMode = editorState.isPaused;
  showToast(editorState.isPaused ? 'Preview paused.' : 'Preview running.', 'info');
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
  addPresetById('standard-particle');
}

function addPresetById(id) {
  const preset = cloneBasePreset('base', id);
  if (preset?.config) {
    const config = { ...preset.config };
    if (editorState.emergencyLiteMode) config.spawnRate = Math.min(Number(config.spawnRate) || 4, 4);
    addLayer(config);
    showToast(`Added ${preset.label}.`, 'success');
  }
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
  if (emitterX && document.activeElement !== emitterX) emitterX.value = layer ? Math.round(layer.emitterX || 0) : 0;
  if (emitterY && document.activeElement !== emitterY) emitterY.value = layer ? Math.round(layer.emitterY || 0) : 0;

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
  const zoomTop = document.getElementById('zoom-readout');
  const zoomBottom = document.getElementById('index2-zoom-readout');
  const displayState = document.getElementById('index2-display-state');
  const pauseTop = document.getElementById('pause-button');
  const pauseBottom = document.getElementById('index2-display-pause');
  const diagnostics = document.getElementById('index2-diagnostics');

  const zoomText = `${Math.round(editorState.zoom * 100)}%`;
  if (zoomTop) zoomTop.textContent = zoomText;
  if (zoomBottom) zoomBottom.textContent = zoomText;
  if (displayState) displayState.textContent = editorState.isPaused ? 'Paused' : 'Running';
  if (pauseTop) pauseTop.textContent = editorState.isPaused ? 'Resume' : 'Pause';
  if (pauseBottom) pauseBottom.textContent = editorState.isPaused ? '▶' : '⏸';

  const compactStatus = `FPS ${editorState.renderStats.fps} Particles ${editorState.renderStats.particles}/${editorState.renderStats.particleCap} Mode ${editorState.renderStats.performanceMode} Grid ${editorState.showGrid ? 'On' : 'Off'} Guides ${editorState.showHelpers ? 'On' : 'Off'}`;
  if (status) status.textContent = compactStatus;
  if (diagnostics) {
    diagnostics.textContent = `FPS ${editorState.renderStats.fps}\nParticles ${editorState.renderStats.particles} / ${editorState.renderStats.particleCap}\nMode ${editorState.renderStats.performanceMode}\nGrid ${editorState.showGrid ? 'On' : 'Off'} · Guides ${editorState.showHelpers ? 'On' : 'Off'}\nPreview ${editorState.isPaused ? 'Paused' : 'Running'}\nLayers ${editorState.composition.layers.length}\nZoom ${zoomText}`;
  }
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
    fire: { colorA: '#fff1a8', colorB: '#ff2600', glow: 16, gravity: 0.04, spawnRate: 4 },
    ice: { colorA: '#ffffff', colorB: '#00a1d7', glow: 12, gravity: -0.01, spawnRate: 4 },
    goodMagic: { colorA: '#fff7cf', colorB: '#5e8cff', glow: 14, gravity: -0.008, spawnRate: 4 },
    darkMagic: { colorA: '#7cff00', colorB: '#07100a', glow: 10, gravity: 0.015, spawnRate: 4 }
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
    console.error(`[${VERSION_LABEL}] ${name} failed`, error);
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
