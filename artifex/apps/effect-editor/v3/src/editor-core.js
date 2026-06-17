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
  setLowPerformanceMode,
  setPaused,
  setWorkspaceMode,
  setZoom,
  toggleGrid,
  toggleHelpers,
  updateActiveLayer
} from './editor-state.js';
import { initRenderer, takeSnapshot } from './editor-renderer.js?v=052-wormhole-visible-range';
import { cloneBasePreset, listBasePresets } from './presets/portal-wormhole-presets.js';
import { initBottomPanel, renderLayerList, syncBottomPanelStatus } from './editor-bottom-panel.js';
import { syncEffectControls } from './editor-effect-controls.js';
import { initEditorPersistence, loadCompositionLocal } from './editor-persistence.js';

const ZERO_SPAWN_ENGINES = new Set(['portal-ring', 'wormhole-tunnel', 'prototype-smoke', 'prototype-shimmer']);
const ENGINES = [
  ['particles', 'Standard Particle Engine'], ['lightning', 'Lightning / Beam Engine'],
  ['electric-arc', 'Electric Arc Engine'], ['ribbon', 'Trail / Ribbon Engine'],
  ['ring', 'Ring / Shockwave Engine'], ['projectile', 'Projectile / Trail Engine'],
  ['gas', 'Gas Engine'], ['shockwave', 'Shockwave Pulse Engine'],
  ['portal-ring', 'Orb Engine'], ['wormhole-tunnel', 'Swirl Engine'],
  ['prototype-smoke', 'Prototype Smoke Placeholder'], ['prototype-shimmer', 'Prototype Shimmer Placeholder'],
  ['refraction', 'Refraction / Shimmer Engine'], ['heatdistortion', 'Grid Effect Engine'],
  ['lensflare', 'Crosshairs Engine'], ['true-lensflare', 'Crosshairs Engine'], ['text', 'Text Effect Engine']
];
const INPUT_BINDINGS = [
  ['layer-name-input', 'name', false], ['engine-select', 'engine', false],
  ['spawn-rate-input', 'spawnRate', true], ['speed-min-input', 'speedMin', true],
  ['speed-max-input', 'speedMax', true], ['lifetime-input', 'lifetime', true]
];
let toast = () => {};
let version = 'INDEX2-WORK';
let selectedInsertPresetId = '';

export function initEditorCore({ versionLabel, showToast } = {}) {
  version = versionLabel || version;
  toast = typeof showToast === 'function' ? showToast : () => {};
  prepareState();
  initBottomPanel({ loadCompositionLocal, showToast: toast });
  initEditorPersistence(toast);
  initRenderer();
  populateEngineSelect();
  populateBaseMenu();
  setupMenus();
  setupActions();
  setupSearch();
  bindLayerInputs();
  ensureStarterLayer();
  onStateChange(syncCoreUI);
  syncCoreUI();
  toast(`${version} loaded.`, 'success');
}

function prepareState() {
  editorState.emergencyLiteMode = true;
  editorState.showGrid = true;
  editorState.showHelpers = true;
  setLowPerformanceMode(true);
  setPaused(true);
  editorState.particles = [];
}

function populateEngineSelect() {
  const select = document.getElementById('engine-select');
  if (!select) return;
  select.replaceChildren(...ENGINES.map(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }));
}

function populateBaseMenu() {
  const list = document.getElementById('base-layer-list');
  if (!list) return;
  const preview = ensureInsertPreviewPanel(list);
  const presets = [...listBasePresets()].sort((a, b) => String(a.label || a.id || '').localeCompare(String(b.label || b.id || ''), undefined, { sensitivity: 'base' }));
  const buttons = presets.map((preset) => {
    const button = document.createElement('button');
    const label = preset.label || preset.id;
    const detail = preset.description || preset.engine || '';
    button.type = 'button';
    button.dataset.insertPresetId = preset.id;
    button.title = detail ? `${label}\n${detail}` : label;
    if (isPrototypePreset(preset)) button.classList.add('index2-prototype-insert-item');
    button.append(document.createTextNode(label));
    button.addEventListener('click', () => selectInsertPreset(preview, preset));
    return button;
  });
  list.replaceChildren(...buttons);
  selectInsertPreset(preview, presets[0]);
}

function ensureInsertPreviewPanel(list) {
  const section = list.closest('.insert-section') || list.parentElement;
  let panel = document.getElementById('insert-effect-preview-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'insert-effect-preview-panel';
    panel.className = 'insert-effect-preview-panel';

    const image = document.createElement('div');
    image.id = 'insert-effect-preview-image';
    image.className = 'insert-effect-preview-image';
    image.setAttribute('aria-label', 'Effect preview placeholder');

    const copy = document.createElement('div');
    copy.className = 'insert-effect-preview-copy';

    const title = document.createElement('h4');
    title.id = 'insert-effect-preview-title';
    title.textContent = 'Select effect';

    const description = document.createElement('p');
    description.id = 'insert-effect-preview-description';
    description.textContent = 'Choose an effect below to preview it here.';

    const add = document.createElement('button');
    add.id = 'insert-effect-add-button';
    add.type = 'button';
    add.textContent = 'Add';
    add.addEventListener('click', () => addSelectedInsertPreset());

    copy.append(title, description, add);
    panel.append(image, copy);
    section?.insertBefore(panel, list);
  }
  return panel;
}
function selectInsertPreset(panel, preset) {
  if (!panel || !preset) return;
  selectedInsertPresetId = preset.id;
  updateInsertPreviewPanel(panel, preset, true);
  document.querySelectorAll('#base-layer-list [data-insert-preset-id]').forEach((button) => {
    button.classList.toggle('index2-insert-selected', button.dataset.insertPresetId === preset.id);
  });
}
function updateInsertPreviewPanel(panel, preset, selected) {
  const image = panel.querySelector('#insert-effect-preview-image');
  const title = panel.querySelector('#insert-effect-preview-title');
  const description = panel.querySelector('#insert-effect-preview-description');
  const add = panel.querySelector('#insert-effect-add-button');
  const label = preset.label || preset.id;
  const detail = preset.description || 'No description yet.';
  panel.dataset.prototype = isPrototypePreset(preset) ? 'true' : 'false';
  panel.dataset.selected = selected ? 'true' : 'false';
  panel.title = `${label}\n${detail}`;
  if (image) image.title = `${label}\n${detail}`;
  if (title) title.textContent = label;
  if (description) description.textContent = detail;
  if (add) add.disabled = !selectedInsertPresetId;
}
function addSelectedInsertPreset() {
  if (!selectedInsertPresetId) return;
  addPreset(selectedInsertPresetId);
  closeMenus();
}

function setupMenus() {
  document.querySelectorAll('.menu-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const panel = document.getElementById(`menu-${button.dataset.menu}`);
      if (!panel) return;
      const isOpen = panel.classList.contains('open');
      closeMenus();
      if (!isOpen) panel.classList.add('open');
    });
  });
  document.querySelectorAll('.menu-panel').forEach((panel) => panel.addEventListener('click', (event) => event.stopPropagation()));
  document.addEventListener('click', closeMenus);
}
function closeMenus() { document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open')); }

function setupActions() {
  bindClick('new-effect-button', () => { resetComposition(); ensureStarterLayer(); closeMenus(); toast('New effect archetype created.', 'success'); });
  bindClick('duplicate-layer-button', () => { duplicateActiveLayer(); toast('Layer duplicated.', 'success'); });
  bindClick('delete-layer-button', () => { deleteActiveLayer(); toast('Layer deleted.', 'warn'); });
  bindClick('clear-particles-button', () => { clearParticles(); toast('Particles cleared.', 'success'); });
  bindClick('center-emitter-button', () => { centerActiveEmitter(); toast('Origin centered.', 'success'); });
  bindClick('pause-button', togglePaused);
  bindClick('snapshot-button', takeSnapshot);
  bindClick('snapshot-button-menu', takeSnapshot);
  bindClick('zoom-in-button', () => setZoom(editorState.zoom + 0.1));
  bindClick('zoom-out-button', () => setZoom(editorState.zoom - 0.1));
  bindClick('zoom-reset-button', () => setZoom(1));
  bindClick('toggle-grid-button', toggleGrid);
  bindClick('toggle-helpers-button', toggleHelpers);
  bindClick('about-button', () => toast(`${version}: integration test build.`, 'info'));
  document.querySelectorAll('[data-workspace-mode]').forEach((button) => {
    button.addEventListener('click', () => { setWorkspaceMode(button.dataset.workspaceMode); closeMenus(); });
  });
}

function setupSearch() {
  const input = document.getElementById('left-panel-search-input');
  input?.addEventListener('input', applySearch);
  applySearch();
}
function applySearch() {
  const query = String(document.getElementById('left-panel-search-input')?.value || '').trim().toLowerCase();
  const count = document.getElementById('left-panel-search-count');
  const cards = [...document.querySelectorAll('#left-panel .card[data-search-card]')].filter((card) => !card.classList.contains('index2-search-card'));
  let visibleCount = 0;
  cards.forEach((card) => {
    const matches = !query || `${card.dataset.searchCard || ''} ${card.textContent || ''}`.toLowerCase().includes(query);
    card.classList.toggle('index2-card-hidden', !matches);
    if (matches) visibleCount += 1;
  });
  if (count) count.textContent = query ? `Showing ${visibleCount} matching section${visibleCount === 1 ? '' : 's'}.` : 'Showing all sections.';
}

function bindLayerInputs() {
  INPUT_BINDINGS.forEach(([id, property, numeric]) => {
    const input = document.getElementById(id);
    if (!input) return;
    const apply = () => updateActiveLayer({ [property]: numeric ? Number(input.value) : input.value });
    input.addEventListener('input', apply);
    input.addEventListener('change', apply);
  });
  const x = document.getElementById('emitter-x-input');
  const y = document.getElementById('emitter-y-input');
  x?.addEventListener('input', () => { const layer = getActiveLayer(); if (layer) moveActiveEmitter(Number(x.value), layer.emitterY); });
  y?.addEventListener('input', () => { const layer = getActiveLayer(); if (layer) moveActiveEmitter(layer.emitterX, Number(y.value)); });
}

function ensureStarterLayer() { if (!editorState.composition.layers.length) addPreset('standard-particle'); }
function addPreset(id) {
  const preset = cloneBasePreset('base', id);
  if (!preset?.config) return;
  const config = { ...preset.config, spawnRate: ZERO_SPAWN_ENGINES.has(preset.config.engine) ? 0 : Math.min(Number(preset.config.spawnRate) || 4, 4) };
  if (id === 'standard-particle') {
    config.gravity = 100;
    config.gravityBoost = false;
    config.gravityScaleVersion = 'ui';
  }
  if (config.engine === 'text') {
    config.textDensity = Math.min(Number(config.textDensity) || Number(config.spawnRate) || 2, 2.5);
    config.spawnRate = Math.min(Number(config.spawnRate) || 2, 3);
    config.textSpawnDelay = Math.max(Number(config.textSpawnDelay) || 0, 12);
  }
  addLayer(config);
  toast(`Added ${preset.label}.`, 'success');
}

function syncCoreUI() {
  renderLayerList();
  syncBoundInputs();
  syncEffectControls();
  applySearch();
  syncStatusText();
  syncBottomPanelStatus();
}
function syncBoundInputs() {
  const layer = getActiveLayer();
  INPUT_BINDINGS.forEach(([id, property]) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.disabled = !layer;
    if (layer && document.activeElement !== input) input.value = String(layer[property] ?? '');
  });
  setInput('emitter-x-input', layer ? Math.round(layer.emitterX || 0) : 0);
  setInput('emitter-y-input', layer ? Math.round(layer.emitterY || 0) : 0);
  setOutput('spawn-rate-output', layer?.spawnRate);
  setOutput('speed-min-output', layer?.speedMin);
  setOutput('speed-max-output', layer?.speedMax);
  setOutput('lifetime-output', layer?.lifetime);
}
function syncStatusText() {
  const zoomText = `${Math.round(editorState.zoom * 100)}%`;
  const zoom = document.getElementById('zoom-readout');
  const status = document.getElementById('status-text');
  if (zoom) zoom.textContent = zoomText;
  if (status) status.textContent = `FPS ${editorState.renderStats.fps} Particles ${editorState.renderStats.particles}/${editorState.renderStats.particleCap} Mode ${editorState.renderStats.performanceMode} Grid ${editorState.showGrid ? 'On' : 'Off'} Guides ${editorState.showHelpers ? 'On' : 'Off'}`;
}
function isPrototypePreset(preset) { return Boolean(preset && (preset.engine === 'prototype-smoke' || preset.engine === 'prototype-shimmer' || preset.config?.prototypeFolder)); }
function togglePaused() {
  setPaused(!editorState.isPaused);
  editorState.emergencyLiteMode = editorState.isPaused;
  toast(editorState.isPaused ? 'Preview paused.' : 'Preview running.', 'info');
}
function setInput(id, value) { const input = document.getElementById(id); if (input && document.activeElement !== input) input.value = String(value); }
function setOutput(id, value) { const output = document.getElementById(id); if (output) output.textContent = formatValue(value); }
function formatValue(value) { const n = Number(value); return Number.isFinite(n) ? (Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)))) : '0'; }
function bindClick(id, action) { document.getElementById(id)?.addEventListener('click', action); }
