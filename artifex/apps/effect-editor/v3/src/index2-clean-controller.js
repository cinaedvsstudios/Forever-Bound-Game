import {
  addLayer,
  centerActiveEmitter,
  clearParticles,
  deleteActiveLayer,
  duplicateActiveLayer,
  editorState,
  getActiveLayer,
  loadComposition,
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

const VERSION_LABEL = 'INDEX2-CLEAN-0.1.6';
const LOCAL_STORAGE_PREFIX = 'artifex-index2-effect:';
const LOCAL_STORAGE_INDEX = 'artifex-index2-effect-index';

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
  ['true-lensflare', 'True Lens Flare Engine'],
  ['text', 'Text Effect Engine']
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

const EFFECT_SPECIFIC_CONTROL_SETS = {
  lightning: [
    ['arcLength', 'Arc Length', 10, 260, 1],
    ['arcBranches', 'Branches', 0, 12, 1],
    ['arcJaggedness', 'Jaggedness', 0, 60, 1],
    ['arcFlicker', 'Flicker', 0, 1, 0.01]
  ],
  'electric-arc': [
    ['arcLength', 'Arc Length', 10, 260, 1],
    ['arcBranchLength', 'Branch Length', 0, 120, 1],
    ['arcJaggedness', 'Jaggedness', 0, 60, 1],
    ['arcFlicker', 'Flicker', 0, 1, 0.01]
  ],
  shockwave: [
    ['shockwaveRadius', 'Radius', 10, 620, 1],
    ['shockwaveStartRadius', 'Start Radius', 0, 120, 1],
    ['shockwaveThickness', 'Thickness', 1, 80, 1],
    ['shockwaveCenterFlash', 'Center Flash', 0, 1, 0.01]
  ],
  refraction: [
    ['distortionStrength', 'Distortion Strength', 0, 80, 1],
    ['distortionScale', 'Distortion Scale', 1, 120, 1],
    ['noiseGrain', 'Noise Grain', 0, 1, 0.01]
  ],
  heatdistortion: [
    ['distortionStrength', 'Distortion Strength', 0, 80, 1],
    ['distortionScale', 'Distortion Scale', 1, 120, 1],
    ['noiseGrain', 'Noise Grain', 0, 1, 0.01]
  ],
  lensflare: [
    ['flareStreakLength', 'Streak Length', 0, 900, 1],
    ['flareGhosts', 'Ghosts', 0, 12, 1],
    ['flareHalo', 'Halo', 0, 260, 1],
    ['flareOverlayOpacity', 'Overlay Opacity', 0, 1, 0.01]
  ],
  'true-lensflare': [
    ['flareStreakLength', 'Streak Length', 0, 900, 1],
    ['flareGhosts', 'Ghosts', 0, 12, 1],
    ['flareHalo', 'Halo', 0, 260, 1],
    ['flareOverlayOpacity', 'Overlay Opacity', 0, 1, 0.01]
  ],
  gas: [
    ['noiseGrain', 'Noise Grain', 0, 1, 0.01],
    ['edgeBlur', 'Edge Blur', 0, 60, 1],
    ['textureContrast', 'Texture Contrast', 0, 3, 0.01]
  ],
  ribbon: [
    ['friction', 'Friction', 0, 1, 0.01],
    ['orbitalForce', 'Orbital Force', -2, 2, 0.01],
    ['emitterWidth', 'Emitter Width', 0, 720, 1]
  ],
  projectile: [
    ['friction', 'Friction', 0, 1, 0.01],
    ['targetX', 'Target X', 0, 1280, 1],
    ['targetY', 'Target Y', 0, 720, 1]
  ]
};

const TEXT_EFFECT_CONTROLS = [
  { property: 'textContent', label: 'Text Content', type: 'textarea', rows: 4 },
  { property: 'textFont', label: 'Font', type: 'select', options: [
    ['Cinzel, Georgia, serif', 'Cinzel / Fantasy Serif'],
    ['Georgia, serif', 'Georgia Serif'],
    ['Garamond, serif', 'Garamond Serif'],
    ['Arial, sans-serif', 'Arial Sans'],
    ['monospace', 'Monospace']
  ] },
  { property: 'textWeight', label: 'Font Weight', type: 'select', options: [['400', 'Regular'], ['500', 'Medium'], ['700', 'Bold'], ['900', 'Black']] },
  { property: 'textLetterSpacing', label: 'Letter Spacing', type: 'range', min: 0, max: 18, step: 0.1 },
  { property: 'textBlockWidth', label: 'Block Width / Wrap', type: 'range', min: 0, max: 900, step: 10 },
  { property: 'textLineSpacing', label: 'Line Spacing', type: 'range', min: 0.7, max: 2.4, step: 0.05 },
  { property: 'textGeneralSpeed', label: 'General Speed', type: 'range', min: 0.25, max: 3, step: 0.05 },
  { property: 'textBlockDelay', label: 'Delay Between Text Blocks', type: 'range', min: 1, max: 240, step: 1 },
  { property: 'textLineDelay', label: 'Delay Between Lines', type: 'range', min: 1, max: 120, step: 1 },
  { property: 'textCharacterDelay', label: 'Delay Between Characters', type: 'range', min: 1, max: 90, step: 1, revealModes: ['character'] },
  { property: 'textRevealMode', label: 'Reveal Mode', type: 'select', options: [['all', 'All Text'], ['line', 'Line by Line'], ['character', 'Character Spray']] },
  { property: 'textDirection', label: 'Direction', type: 'select', options: [['rise', 'Rise'], ['fall', 'Fall'], ['static', 'Static'], ['drift', 'Drift']] },
  { property: 'textDensity', label: 'Text Density', type: 'range', min: 0, max: 10, step: 0.1 },
  { property: 'textSpawnDelay', label: 'Spawn Delay', type: 'range', min: 0, max: 240, step: 1 },
  { property: 'textScatter', label: 'Scatter', type: 'range', min: 0, max: 180, step: 1 },
  { property: 'textLifetimeBias', label: 'Lifetime Bias', type: 'select', options: [['short', 'Short'], ['normal', 'Normal'], ['long', 'Long']] },
  { property: 'textKeepBlockTogether', label: 'Keep Block Together', type: 'checkbox' }
];

let effectSpecificRenderKey = '';

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
  setupSearch();
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
    .menu-file-label { display: block; cursor: pointer; }
    #base-layer-list button { width: 100%; display: block; text-align: left; margin-bottom: 7px; }
    #base-layer-list button span { display: block; margin-top: 3px; color: var(--gold-muted); font-size: 10px; line-height: 1.25; font-weight: 400; }
    .workspace-toolbar #status-text { margin-left: auto; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .index2-search-card { border-color: rgba(0, 174, 234, .45); }
    .index2-search-count { color: var(--gold-muted); font-size: 11px; margin: 8px 0 0; }
    .index2-card-hidden { display: none !important; }
    .index2-bottom-grid { display: grid; grid-template-columns: minmax(330px, 1.5fr) minmax(230px, .78fr) minmax(310px, 1fr); gap: 14px; min-height: 100%; }
    .index2-bottom-card { min-width: 0; border-left: 1px solid rgba(56,42,33,.75); padding-left: 14px; }
    .index2-bottom-card:first-child { border-left: 0; padding-left: 0; }
    .index2-layer-toolbar { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 10px; }
    .index2-layer-toolbar button, .index2-display-grid button, .index2-zoom-strip button { min-width: 34px; min-height: 34px; padding: 4px 8px; border-radius: 13px; }
    .index2-display-grid { display: grid; grid-template-columns: repeat(3, minmax(34px, 46px)); gap: 8px; align-items: center; justify-content: start; margin-top: 8px; }
    .index2-zoom-strip { display: grid; grid-template-columns: 34px 58px 34px auto; gap: 8px; align-items: center; margin-top: 10px; }
    #index2-zoom-readout { color: var(--gold-bright); text-align: center; font-weight: 800; }
    .index2-diagnostics { color: var(--module-accent-strong); font-family: 'Fira Code', monospace; font-size: 12px; line-height: 1.55; white-space: pre-wrap; }
    .index2-control-empty { color: var(--gold-muted); font-size: 11px; line-height: 1.45; margin: 0; }
    .index2-effect-control { display: grid; gap: 5px; margin-bottom: 10px; }
    .index2-effect-control span { display: flex; justify-content: space-between; gap: 10px; color: var(--gold-muted); font-size: 11px; }
    .index2-effect-control textarea { min-height: 84px; resize: vertical; }
    .index2-effect-control select, .index2-effect-control textarea { width: 100%; }
    .index2-effect-control input[type=checkbox] { width: auto; justify-self: start; }
    .index2-control-note { color: var(--gold-muted); font-size: 10px; line-height: 1.35; margin: -2px 0 10px; }
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
          <button type="button" data-index2-action="folder" title="Open local save loader.">📁</button>
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
  bindClick('export-json-button', exportCompositionToJson);
  bindClick('save-local-button', saveCompositionLocal);
  bindClick('load-local-button', loadCompositionLocal);

  const importInput = document.getElementById('import-json-input');
  importInput?.addEventListener('change', importCompositionFromJson);

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

function setupSearch() {
  const input = document.getElementById('left-panel-search-input');
  if (!input) return;
  input.addEventListener('input', applyLeftPanelSearch);
  applyLeftPanelSearch();
}

function applyLeftPanelSearch() {
  const input = document.getElementById('left-panel-search-input');
  const count = document.getElementById('left-panel-search-count');
  const query = String(input?.value || '').trim().toLowerCase();
  const cards = Array.from(document.querySelectorAll('#left-panel .card[data-search-card]')).filter((card) => !card.classList.contains('index2-search-card'));
  let shown = 0;
  for (const card of cards) {
    const haystack = `${card.dataset.searchCard || ''} ${card.textContent || ''}`.toLowerCase();
    const visible = !query || haystack.includes(query);
    card.classList.toggle('index2-card-hidden', !visible);
    if (visible) shown += 1;
  }
  if (count) count.textContent = query ? `Showing ${shown} matching section${shown === 1 ? '' : 's'}.` : 'Showing all sections.';
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
  else if (action === 'folder') loadCompositionLocal();
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

function exportCompositionToJson() {
  const payload = JSON.stringify(editorState.composition, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = String(editorState.composition.name || editorState.composition.id || 'artifex-effect').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '');
  link.download = `${safeName || 'artifex-effect'}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  closeMenus();
  showToast('Composition JSON exported.', 'success');
}

function importCompositionFromJson(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    try {
      const parsed = JSON.parse(String(reader.result || '{}'));
      loadComposition(parsed);
      editorState.emergencyLiteMode = editorState.isPaused;
      clearParticles();
      closeMenus();
      showToast('Composition JSON imported.', 'success');
    } catch (error) {
      console.error(`[${VERSION_LABEL}] import failed`, error);
      showToast('Import failed. Check the JSON file.', 'warn');
    } finally {
      event.target.value = '';
    }
  });
  reader.readAsText(file);
}

function saveCompositionLocal() {
  const name = window.prompt('Save effect as:', editorState.composition.name || editorState.composition.id || 'Untitled Effect');
  if (!name) return;
  const id = `local_${Date.now().toString(36)}`;
  const entry = {
    id,
    name: String(name).trim() || 'Untitled Effect',
    savedAt: new Date().toISOString(),
    composition: { ...editorState.composition, name: String(name).trim() || editorState.composition.name }
  };
  const index = readLocalIndex().filter((item) => item.id !== id);
  index.unshift({ id: entry.id, name: entry.name, savedAt: entry.savedAt });
  window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${id}`, JSON.stringify(entry));
  window.localStorage.setItem(LOCAL_STORAGE_INDEX, JSON.stringify(index.slice(0, 25)));
  closeMenus();
  showToast(`Saved locally: ${entry.name}`, 'success');
}

function loadCompositionLocal() {
  const index = readLocalIndex();
  if (!index.length) {
    showToast('No local effects saved yet.', 'info');
    return;
  }
  const list = index.map((item, idx) => `${idx + 1}. ${item.name} (${formatDate(item.savedAt)})`).join('\n');
  const choice = window.prompt(`Load local effect:\n${list}\n\nEnter number:`, '1');
  if (!choice) return;
  const selected = index[Number(choice) - 1];
  if (!selected) {
    showToast('No local effect matched that number.', 'warn');
    return;
  }
  try {
    const entry = JSON.parse(window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${selected.id}`) || '{}');
    if (!entry.composition) throw new Error('Missing composition.');
    loadComposition(entry.composition);
    clearParticles();
    closeMenus();
    showToast(`Loaded local effect: ${entry.name || selected.name}`, 'success');
  } catch (error) {
    console.error(`[${VERSION_LABEL}] local load failed`, error);
    showToast('Local effect could not be loaded.', 'warn');
  }
}

function readLocalIndex() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_INDEX) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
    if (isTextEffectConfig(config)) {
      config.textDensity = Math.min(Number(config.textDensity) || Number(config.spawnRate) || 2, 2.5);
      config.spawnRate = Math.min(Number(config.spawnRate) || 2, 3);
      config.textSpawnDelay = Math.max(Number(config.textSpawnDelay) || 0, 12);
    }
    addLayer(config);
    showToast(`Added ${preset.label}.`, 'success');
  }
}

function syncUI() {
  renderLayerList();
  syncControls();
  syncEffectSpecificControls();
  applyLeftPanelSearch();
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

function syncEffectSpecificControls() {
  const body = document.getElementById('effect-specific-controls-body');
  if (!body) return;
  const layer = getActiveLayer();
  const key = getEffectSpecificRenderKey(layer);
  if (key !== effectSpecificRenderKey) {
    effectSpecificRenderKey = key;
    renderEffectSpecificControls(layer);
  }
  updateEffectSpecificControlValues(layer);
}

function getEffectSpecificRenderKey(layer) {
  if (!layer) return 'none';
  const kind = isTextEffectConfig(layer) ? 'text' : layer.engine || 'particles';
  const reveal = isTextEffectConfig(layer) ? (layer.textRevealMode || 'all') : '';
  return `${layer.id || 'active'}|${kind}|${reveal}`;
}

function getEffectSpecificControls(layer) {
  if (isTextEffectConfig(layer)) {
    const reveal = layer.textRevealMode || 'all';
    return TEXT_EFFECT_CONTROLS.filter((control) => !control.revealModes || control.revealModes.includes(reveal));
  }
  return (EFFECT_SPECIFIC_CONTROL_SETS[layer?.engine] || []).map(([property, label, min, max, step]) => ({
    property,
    label,
    type: 'range',
    min,
    max,
    step
  }));
}

function renderEffectSpecificControls(layer = getActiveLayer()) {
  const body = document.getElementById('effect-specific-controls-body');
  if (!body) return;
  if (!layer) {
    body.innerHTML = '<p class="index2-control-empty">Select a layer to see engine controls.</p>';
    return;
  }
  const controls = getEffectSpecificControls(layer);
  if (!controls.length) {
    body.innerHTML = '<p class="index2-control-empty">This engine has no extra controls in the clean index2 build yet.</p>';
    return;
  }
  const intro = isTextEffectConfig(layer)
    ? '<p class="index2-control-note">Text controls use bounded emission and conservative defaults to avoid runaway multiline drawing.</p>'
    : '';
  body.innerHTML = `${intro}${controls.map((control) => renderSpecificControl(control, layer)).join('')}`;
  body.querySelectorAll('[data-effect-property]').forEach((input) => {
    input.addEventListener('input', () => handleSpecificInput(input));
    input.addEventListener('change', () => handleSpecificInput(input));
  });
}

function renderSpecificControl(control, layer) {
  const value = layer[control.property];
  const output = control.type === 'checkbox' || control.type === 'textarea' || control.type === 'select'
    ? ''
    : `<output id="effect-output-${escapeHtml(control.property)}">${escapeHtml(formatValue(value))}</output>`;
  const label = `<span><b>${escapeHtml(control.label)}</b>${output}</span>`;
  if (control.type === 'textarea') {
    return `<label class="index2-effect-control">${label}<textarea data-effect-property="${escapeHtml(control.property)}" rows="${control.rows || 3}">${escapeHtml(value ?? '')}</textarea></label>`;
  }
  if (control.type === 'select') {
    const options = (control.options || []).map(([optionValue, optionLabel]) => `<option value="${escapeHtml(optionValue)}" ${String(value ?? '') === String(optionValue) ? 'selected' : ''}>${escapeHtml(optionLabel)}</option>`).join('');
    return `<label class="index2-effect-control">${label}<select data-effect-property="${escapeHtml(control.property)}">${options}</select></label>`;
  }
  if (control.type === 'checkbox') {
    return `<label class="index2-effect-control">${label}<input data-effect-property="${escapeHtml(control.property)}" type="checkbox" ${value !== false ? 'checked' : ''} /></label>`;
  }
  return `
    <label class="index2-effect-control">
      ${label}
      <input data-effect-property="${escapeHtml(control.property)}" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${escapeHtml(value ?? 0)}" />
    </label>
  `;
}

function handleSpecificInput(input) {
  const property = input.dataset.effectProperty;
  if (!property) return;
  let value = input.value;
  if (input.type === 'range' || input.type === 'number') value = Number(input.value);
  if (input.type === 'checkbox') value = input.checked;
  updateActiveLayer({ [property]: value });
  const output = document.getElementById(`effect-output-${property}`);
  if (output) output.textContent = formatValue(value);
}

function updateEffectSpecificControlValues(layer) {
  const body = document.getElementById('effect-specific-controls-body');
  if (!body || !layer) return;
  body.querySelectorAll('[data-effect-property]').forEach((input) => {
    const property = input.dataset.effectProperty;
    const value = layer[property];
    if (document.activeElement !== input) {
      if (input.type === 'checkbox') input.checked = value !== false;
      else input.value = value ?? '';
    }
    const output = document.getElementById(`effect-output-${property}`);
    if (output) output.textContent = formatValue(value);
  });
}

function isTextEffectConfig(layer) {
  return Boolean(layer && (layer.engine === 'text' || (layer.appearanceMode === 'shape' && layer.particleShape === 'text')));
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

function formatDate(value) {
  if (!value) return 'unknown time';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return 'unknown time';
  }
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
