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
  setLowPerformanceMode,
  setModuleTheme,
  setPaused,
  setWorkspaceMode,
  setZoom,
  toggleGrid,
  toggleHelpers,
  updateActiveLayer
} from './editor-state.js';
import { resizeCanvas, takeSnapshot } from './editor-renderer.js';
import { listBasePresets } from './presets/base-effects.js';
import {
  exportBoilerplate,
  exportJSON,
  importJSONFromFile,
  saveToLocalStorage,
  showJSONPanel,
  showLocalFiles
} from './editor-io.js';

const ENGINE_OPTIONS = [
  ['particles', 'Standard Particle Engine'],
  ['lightning', 'Lightning / Beam Engine'],
  ['ribbon', 'Trail / Ribbon Engine'],
  ['ring', 'Ring / Shockwave Engine'],
  ['projectile', 'Projectile / Trail Engine'],
  ['gas', 'Gas / Smoke / Dust Engine']
];

const QUICK_PRESETS = {
  fire: {
    label: 'Fire',
    patch: {
      appearanceStops: [
        { position: 0, color: '#fff1a8', opacity: 1, size: 24, glow: 34 },
        { position: 0.5, color: '#ff8a00', opacity: 0.8, size: 18, glow: 24 },
        { position: 1, color: '#ff2600', opacity: 0, size: 5, glow: 0 }
      ],
      gravity: 0.04,
      blendMode: 'lighter'
    }
  },
  ice: {
    label: 'Ice',
    patch: {
      appearanceStops: [
        { position: 0, color: '#ffffff', opacity: 0.95, size: 18, glow: 22 },
        { position: 0.5, color: '#99f2ff', opacity: 0.7, size: 14, glow: 16 },
        { position: 1, color: '#00a1d7', opacity: 0, size: 2, glow: 0 }
      ],
      gravity: -0.01,
      blendMode: 'screen'
    }
  },
  goodMagic: {
    label: 'Good Magic',
    patch: {
      appearanceStops: [
        { position: 0, color: '#fff7cf', opacity: 1, size: 18, glow: 30 },
        { position: 0.5, color: '#d65cff', opacity: 0.85, size: 22, glow: 34 },
        { position: 1, color: '#5e8cff', opacity: 0, size: 8, glow: 0 }
      ],
      gravity: -0.008,
      blendMode: 'lighter'
    }
  },
  darkMagic: {
    label: 'Dark Magic',
    patch: {
      appearanceStops: [
        { position: 0, color: '#7cff00', opacity: 0.9, size: 20, glow: 20 },
        { position: 0.4, color: '#5b148c', opacity: 0.75, size: 24, glow: 18 },
        { position: 1, color: '#07100a', opacity: 0, size: 6, glow: 0 }
      ],
      gravity: 0.015,
      blendMode: 'lighter'
    }
  }
};

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
  setupBottomPanelLayout();
  setupMenus();
  setupPanelResizers();
  setupButtons();
  populateEngineSelect();
  bindLayerControls();
  restoreSavedLayout();
  restoreTooltips();
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

function setupBottomPanelLayout() {
  const toolbar = document.querySelector('.workspace-toolbar');
  const bottomPanel = document.getElementById('bottom-panel');
  if (!toolbar || !bottomPanel || document.getElementById('bottom-panel-grid')) return;

  toolbar.classList.add('compact-toolbar');
  toolbar.innerHTML = '<span class="workspace-toolbar-note">Workspace controls moved to the bottom control panel.</span>';

  bottomPanel.innerHTML = `
    <div id="bottom-panel-grid" class="bottom-panel-grid">
      <section class="bottom-tool-card bottom-layer-card">
        <header><h2>Layers</h2><span id="layer-count">0 layers</span></header>
        <div id="layer-list" class="layer-list"></div>
      </section>
      <section class="bottom-tool-card">
        <header><h2>Playback / Export</h2></header>
        <div class="bottom-control-buttons">
          <button id="pause-button" title="Pause or resume the particle preview.">Pause</button>
          <button id="snapshot-button" title="Export the current canvas preview as a PNG snapshot.">Snapshot</button>
          <button id="clear-particles-button-bottom" title="Clear the currently visible preview particles.">Clear Particles</button>
        </div>
      </section>
      <section class="bottom-tool-card">
        <header><h2>View / Guides</h2></header>
        <div class="bottom-control-buttons bottom-zoom-grid">
          <button id="zoom-out-button" title="Zoom out.">−</button>
          <span id="zoom-readout">100%</span>
          <button id="zoom-in-button" title="Zoom in.">+</button>
          <button id="zoom-reset-button" title="Reset zoom to 100%.">Reset Zoom</button>
        </div>
        <div id="bottom-workspace-controls" class="bottom-control-buttons"></div>
      </section>
      <section class="bottom-tool-card">
        <header><h2>Diagnostics</h2></header>
        <div id="status-text" class="diagnostic-readout">Ready.</div>
      </section>
    </div>
  `;
}

function injectHeaderMenuStyles() {
  if (document.getElementById('header-menu-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'header-menu-parity-style';
  style.textContent = `
    .brand { min-width: 300px; }
    .brand-logo-img { width: 42px; height: 42px; object-fit: contain; display: block; filter: drop-shadow(0 0 10px var(--module-glow)); }
    .brand-title-img { height: 28px; max-width: 192px; object-fit: contain; object-position: left center; display: block; }
    .brand-title-fallback { font-family: 'Cinzel', Georgia, serif; font-size: 22px; letter-spacing: .18em; color: var(--gold-bright); }
    .menu-panel.parity-wide { width: min(330px, calc(100vw - 24px)); }
    .menu-section-title { margin: 8px 4px 6px; color: var(--gold-muted); font-family: 'Cinzel', Georgia, serif; font-size: 10px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    .menu-section-title:first-child { margin-top: 0; }
    .menu-divider { height: 1px; margin: 7px 2px; background: rgba(56,42,33,.82); }
    .menu-panel button.is-placeholder { color: var(--muted); opacity: .9; }
    .menu-panel button.is-danger { color: #ffb4c0; }
    .menu-panel button.is-accent { color: white; border-color: var(--module-accent); background: linear-gradient(180deg, rgba(0,174,234,.35) 0%, #18272d 100%); }
    .workspace-toolbar.compact-toolbar { min-height: 24px; height: 24px; padding: 2px 10px; }
    .workspace-toolbar-note { color: var(--gold-muted); font-size: 11px; letter-spacing: .04em; }
    .bottom-panel-grid { display: grid; grid-template-columns: minmax(220px, 1.2fr) minmax(160px, .8fr) minmax(220px, 1fr) minmax(180px, .85fr); gap: 12px; min-height: 100%; }
    .bottom-tool-card { border-left: 1px solid rgba(56,42,33,.75); padding-left: 12px; min-width: 0; }
    .bottom-tool-card:first-child { border-left: 0; padding-left: 0; }
    .bottom-tool-card header { min-height: 22px; margin-bottom: 8px; }
    .bottom-control-buttons { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .bottom-control-buttons button, .bottom-control-buttons .reference-file-label { min-height: 34px; padding: 6px 10px; font-size: 12px; white-space: nowrap; }
    .bottom-zoom-grid { display: grid; grid-template-columns: auto 54px auto 1fr; gap: 8px; margin-bottom: 8px; }
    .bottom-zoom-grid button { text-align: center; }
    .diagnostic-readout { color: var(--module-accent-strong); font-size: 12px; line-height: 1.55; font-family: 'Fira Code', monospace; }
    .compact-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .compact-row label { margin: 0; }
    .compact-row input[type='number'] { min-width: 0; }
    @media (max-width: 1100px) { .bottom-panel-grid { grid-template-columns: 1fr 1fr; } }
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
    <button id="new-effect-button" title="Start a new blank effect archetype.">New Effect Archetype</button>
    <label class="menu-file-label" title="Import an Artifex FX JSON file.">Import FX JSON<input id="import-json-input" type="file" accept=".json,application/json" hidden /></label>
    <button class="is-placeholder" data-toast-message="Effekseer Draft import is reserved for a later compatibility pass." title="Reserved for a later Effekseer compatibility pass.">Import Effekseer Draft</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">Export Archetype</div>
    <button id="export-json-button" title="Download the raw layer composition JSON.">Export Raw Composition JSON</button>
    <button class="is-placeholder" data-toast-message="Editor Project export is wired by the IO parity module." title="Export the full editor project JSON.">Export Editor Project JSON</button>
    <button class="is-placeholder" data-toast-message="Effect Archetype export is wired by the IO parity module." title="Export the effect archetype asset JSON.">Export Effect Archetype JSON</button>
    <button class="is-placeholder" data-toast-message="Scene FX Instance export is wired by the IO parity module." title="Export a scene-ready FX instance JSON.">Export Scene FX Instance JSON</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">Local Files</div>
    <button id="save-local-button" title="Save the effect in this browser's local storage.">Save Locally in Browser</button>
    <button id="view-local-button" title="Open saved local effects.">Manage Local Effects</button>
    <button class="is-placeholder" data-toast-message="Scene / FX Resolution settings are available lower in this File menu." title="Scene and FX resolution settings are available in this menu.">Settings</button>
  `, 'parity-wide');

  setPanelHTML('menu-edit', `
    <div class="menu-section-title">Layer Actions</div>
    <button id="duplicate-layer-button" title="Duplicate the active layer.">Duplicate Layer</button>
    <button id="delete-layer-button" class="is-danger" title="Delete the active layer.">Delete Layer</button>
    <button id="clear-particles-button" title="Clear all preview particles.">Clear All Particles</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">Emitter</div>
    <button id="center-emitter-button" title="Move the origin point to the centre of the stage.">Center Origin</button>
    <button class="is-placeholder" data-toast-message="Bring Forward / Send Back will be restored with layer ordering controls." title="Layer ordering controls are scheduled for later.">Bring Forward / Send Back</button>
  `, 'parity-wide');

  setPanelHTML('menu-view', `
    <div class="menu-section-title">Workspace Background</div>
    <button data-workspace-mode="dark" title="Use the dark preview background.">Background: Dark</button>
    <button data-workspace-mode="white" title="Use the white preview background.">Background: White</button>
    <button data-workspace-mode="underlay" title="Show the loaded image/video underlay behind the effect.">Background: Underlay</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">Guides</div>
    <button id="toggle-grid-button" title="Toggle the stage grid.">Toggle Grid</button>
    <button id="toggle-helpers-button" title="Toggle emitter and coordinate guides.">Toggle Guides</button>
    <button class="is-placeholder" data-toast-message="Load Underlay is available in the bottom View / Guides panel." title="Load an image/video underlay from the bottom View / Guides panel.">Load Underlay</button>
    <button id="low-performance-menu-button" title="Reduce render load by lowering particle count and update frequency.">Low Performance Mode: Off</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">Module Accent</div>
    <button data-module-theme="effects" title="Use cyan/blue accent for the Effects editor.">Theme: Effects</button>
    <button data-module-theme="archetype" title="Use red accent for the Archetype editor.">Theme: Archetype</button>
    <button data-module-theme="project" title="Use gold/green accent for the Project editor.">Theme: Project</button>
    <div class="menu-divider"></div>
    <div class="menu-section-title">JSON / Boilerplate</div>
    <button id="view-json-button" title="Open a read-only JSON view.">View JSON</button>
    <button id="edit-json-button" title="Open an editable JSON panel.">Edit JSON</button>
    <button id="view-boilerplate-button" title="Open generated boilerplate text.">View Boilerplate</button>
    <button id="export-boilerplate-button" title="Download generated boilerplate text.">Export Boilerplate</button>
  `, 'parity-wide');

  setPanelHTML('menu-help', `
    <button id="quick-start-button" title="Show a quick start hint.">Quick Start Guide</button>
    <button class="is-placeholder" data-toast-message="Terminology guide links will be restored after menu parity is confirmed." title="Terminology links are scheduled for later.">Terminology / Guide Links</button>
    <button id="about-button" title="Show build information.">About Artifex Studio</button>
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
  document.getElementById('clear-particles-button-bottom').addEventListener('click', () => {
    clearParticles();
    showToast('Particles cleared.', 'success');
  });
  document.getElementById('center-emitter-button').addEventListener('click', () => {
    centerActiveEmitter();
    showToast('Origin centered.', 'success');
  });
  document.getElementById('export-json-button').addEventListener('click', exportJSON);
  document.getElementById('save-local-button').addEventListener('click', saveToLocalStorage);
  document.getElementById('view-local-button').addEventListener('click', showLocalFiles);
  document.getElementById('load-local-button').addEventListener('click', showLocalFiles);
  document.getElementById('import-json-input').addEventListener('change', importJSONFromFile);
  document.getElementById('toggle-grid-button').addEventListener('click', toggleGrid);
  document.getElementById('toggle-helpers-button').addEventListener('click', toggleHelpers);
  document.getElementById('view-json-button').addEventListener('click', () => showJSONPanel('view'));
  document.getElementById('edit-json-button').addEventListener('click', () => showJSONPanel('edit'));
  document.getElementById('view-boilerplate-button').addEventListener('click', () => showJSONPanel('boilerplate'));
  document.getElementById('export-boilerplate-button').addEventListener('click', exportBoilerplate);
  document.getElementById('low-performance-menu-button').addEventListener('click', () => {
    setLowPerformanceMode(!editorState.lowPerformanceMode);
    resizeCanvas();
    showToast(editorState.lowPerformanceMode ? 'Low Performance Mode enabled.' : 'Full Performance Mode enabled.', 'success');
  });
  document.querySelectorAll('[data-module-theme]').forEach((button) => {
    button.addEventListener('click', () => {
      setModuleTheme(button.dataset.moduleTheme);
      showToast(`Module theme changed.`, 'success');
    });
  });
  document.getElementById('pause-button').addEventListener('click', () => setPaused(!editorState.isPaused));
  document.getElementById('snapshot-button').addEventListener('click', takeSnapshot);
  document.getElementById('zoom-in-button').addEventListener('click', () => setZoom(editorState.zoom + 0.1));
  document.getElementById('zoom-out-button').addEventListener('click', () => setZoom(editorState.zoom - 0.1));
  document.getElementById('zoom-reset-button').addEventListener('click', () => setZoom(1));
  document.getElementById('quick-start-button').addEventListener('click', () => showToast('Insert > Base Layer > Standard Particle, then adjust sliders.', 'info'));
  document.getElementById('about-button').addEventListener('click', () => showToast('Artifex Effect Editor modular test build: Step 3 presets and saving active.', 'info'));

  document.querySelectorAll('[data-workspace-mode]').forEach((button) => button.addEventListener('click', () => setWorkspaceMode(button.dataset.workspaceMode)));
  document.querySelectorAll('[data-quick-preset]').forEach((button) => button.addEventListener('click', () => applyQuickPreset(button.dataset.quickPreset)));
  document.querySelectorAll('[data-toast-message]').forEach((button) => button.addEventListener('click', () => showToast(button.dataset.toastMessage, 'info')));
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
      saveLayoutState();
    };
    const up = () => {
      sideResizer.removeEventListener('pointermove', move);
      sideResizer.removeEventListener('pointerup', up);
      saveLayoutState();
    };
    sideResizer.addEventListener('pointermove', move);
    sideResizer.addEventListener('pointerup', up);
  });

  bottomResizer.addEventListener('pointerdown', (event) => {
    bottomResizer.setPointerCapture(event.pointerId);
    const startY = event.clientY;
    const startHeight = bottomPanel.getBoundingClientRect().height;
    const move = (moveEvent) => {
      const height = Math.min(420, Math.max(130, startHeight - (moveEvent.clientY - startY)));
      bottomPanel.style.height = `${height}px`;
      saveLayoutState();
    };
    const up = () => {
      bottomResizer.removeEventListener('pointermove', move);
      bottomResizer.removeEventListener('pointerup', up);
      saveLayoutState();
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
  if (!exists) select.append(new Option(labelForEngine(value), value));
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
      if (elementId === 'engine-select') ensureEngineOption(layer[property]);
      if (String(element.value) !== String(layer[property])) element.value = layer[property];
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
  const lowPerformanceButton = document.getElementById('low-performance-menu-button');
  if (lowPerformanceButton) {
    lowPerformanceButton.textContent = editorState.lowPerformanceMode ? 'Low Performance Mode: On' : 'Low Performance Mode: Off';
    lowPerformanceButton.classList.toggle('is-accent', editorState.lowPerformanceMode);
  }
  document.querySelectorAll('[data-module-theme]').forEach((button) => {
    button.classList.toggle('is-accent', button.dataset.moduleTheme === editorState.moduleTheme);
  });
  document.getElementById('pause-button').textContent = editorState.isPaused ? 'Resume' : 'Pause';
  document.getElementById('zoom-readout').textContent = `${Math.round(editorState.zoom * 100)}%`;
  document.getElementById('status-text').innerHTML = `FPS ${editorState.renderStats.fps}<br>Particles ${editorState.renderStats.particles} / ${editorState.renderStats.particleCap}<br>Stage ${DESIGN_WIDTH}×${DESIGN_HEIGHT}<br>Performance ${editorState.renderStats.performanceMode}<br>Theme ${editorState.moduleTheme}`;
}

function restoreTooltips() {
  const tooltipMap = {
    'pause-button': 'Pause or resume the particle preview.',
    'snapshot-button': 'Export the current canvas preview as a PNG snapshot.',
    'zoom-out-button': 'Zoom out.',
    'zoom-in-button': 'Zoom in.',
    'zoom-reset-button': 'Reset zoom to 100%.',
    'toggle-grid-button': 'Toggle the stage grid.',
    'toggle-helpers-button': 'Toggle emitter and coordinate guides.',
    'open-library-button': 'Open the Effect Archetype Library.',
    'load-local-button': 'Load effects saved in this browser.',
    'clear-particles-button-bottom': 'Clear visible preview particles.',
    'low-performance-menu-button': 'Reduce render load by lowering particle count and update frequency.',
    'view-json-button': 'Open a read-only JSON view.',
    'edit-json-button': 'Edit and apply current composition JSON.',
    'view-boilerplate-button': 'Open generated boilerplate text.',
    'export-boilerplate-button': 'Download generated boilerplate text.'
  };
  for (const [id, title] of Object.entries(tooltipMap)) {
    const element = document.getElementById(id);
    if (element && !element.title) element.title = title;
  }
}

function applyQuickPreset(name) {
  const preset = QUICK_PRESETS[name];
  if (!preset) return;
  updateActiveLayer(preset.patch);
  showToast(`${preset.label} appearance ramp applied.`, 'success');
}

function saveLayoutState() {
  const leftPanel = document.getElementById('left-panel');
  const bottomPanel = document.getElementById('bottom-panel');
  const state = {
    leftWidth: leftPanel?.style.width || '',
    bottomHeight: bottomPanel?.style.height || ''
  };
  localStorage.setItem('artifex-effect-editor-layout', JSON.stringify(state));
}

function restoreSavedLayout() {
  try {
    const saved = JSON.parse(localStorage.getItem('artifex-effect-editor-layout') || '{}');
    if (saved.leftWidth) document.getElementById('left-panel').style.width = saved.leftWidth;
    if (saved.bottomHeight) document.getElementById('bottom-panel').style.height = saved.bottomHeight;
  } catch {
    localStorage.removeItem('artifex-effect-editor-layout');
  }
}

export function addPresetLayer(preset) {
  addLayer(preset.config);
  showToast(`${preset.label} inserted.`, 'success');
}

export function getAvailableBasePresets() {
  return listBasePresets();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
