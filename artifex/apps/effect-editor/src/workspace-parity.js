import {
  MODULE_THEMES,
  editorState,
  onStateChange,
  setLowPerformanceMode,
  setModuleTheme,
  setWorkspaceMode,
  toggleGrid,
  toggleHelpers
} from './editor-state.js';
import { resizeCanvas } from './editor-renderer.js';

export function initWorkspaceParity(showToast = () => {}) {
  ensureUnderlayState();
  injectWorkspaceStyles();
  ensureToolbarControls();
  bindWorkspaceControls(showToast);
  applyModuleTheme();
  syncWorkspaceControls();
  onStateChange(() => {
    applyModuleTheme();
    syncWorkspaceControls();
  });
}

function ensureUnderlayState() {
  editorState.referenceMedia = editorState.referenceMedia || {
    type: '',
    name: '',
    dataUrl: '',
    opacity: 0.55,
    visible: false,
    frame: 0
  };
  if (editorState.workspaceMode === 'reference') editorState.workspaceMode = 'underlay';
}

function injectWorkspaceStyles() {
  if (document.getElementById('workspace-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'workspace-parity-style';
  style.textContent = `
    .workspace-extra-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .workspace-extra-controls button, .workspace-extra-controls select { min-height: 34px; padding: 6px 10px; font-size: 12px; white-space: nowrap; }
    .workspace-extra-controls select { width: auto; max-width: 140px; }
    .reference-file-label { border: 1px solid var(--border); border-radius: 13px; padding: 7px 10px; background: linear-gradient(180deg, #2a201a 0%, #1b1411 100%); color: var(--gold); cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,.62); font-size: 12px; white-space: nowrap; }
    .reference-file-label input { display: none; }
    .reference-control-strip { position: absolute; left: 12px; bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 8px; border: 1px solid var(--border); border-radius: 14px; background: rgba(23,18,16,.86); box-shadow: 0 12px 26px rgba(0,0,0,.72); z-index: 8; }
    .reference-control-strip[hidden] { display: none; }
    .reference-control-strip label { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 10px; }
    .reference-control-strip input[type='range'] { width: 120px; }
    .reference-name { color: var(--module-accent-strong); font-size: 11px; max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .is-active-state { border-color: var(--module-accent) !important; color: white !important; box-shadow: 0 0 0 1px var(--module-accent-soft), 0 0 14px var(--module-glow) !important; }
    body.low-performance-mode .appearance-stop-marker::before,
    body.low-performance-mode .brand-mark,
    body.low-performance-mode #version-badge { box-shadow: none !important; }
  `;
  document.head.append(style);
}

function ensureToolbarControls() {
  const controlsHost = document.getElementById('bottom-workspace-controls') || document.querySelector('.workspace-toolbar');
  const workspace = document.getElementById('workspace');
  if (!controlsHost || !workspace || document.getElementById('workspace-mode-cycle-button')) return;

  const controls = document.createElement('div');
  controls.className = 'workspace-extra-controls';
  controls.innerHTML = `
    <button id="workspace-mode-cycle-button" type="button" title="Cycle the preview background between dark, white, and loaded underlay.">Background: Dark</button>
    <button id="helper-cycle-button" type="button" title="Toggle grid and emitter guide visibility.">Guides: On</button>
    <label class="reference-file-label" title="Load an image/video underlay behind the effect.">Load Underlay<input id="reference-file-input" type="file" accept="image/*,video/*" /></label>
    <button id="toggle-reference-button" type="button" title="Show or hide the loaded image/video underlay.">Underlay: Off</button>
    <button id="low-performance-button" type="button" title="Reduce render load by lowering particle count, limiting pixel ratio, and updating particles less often.">Performance: Full</button>
    <select id="module-theme-select" title="Change the module accent colour so Effects, Archetype, and Project tools are visually distinct.">
      <option value="effects">Theme: Effects</option>
      <option value="archetype">Theme: Archetype</option>
      <option value="project">Theme: Project</option>
    </select>
  `;
  controlsHost.append(controls);

  workspace.insertAdjacentHTML('beforeend', `
    <div id="reference-control-strip" class="reference-control-strip" hidden>
      <span id="reference-name" class="reference-name">No underlay loaded</span>
      <label>Opacity <input id="reference-opacity-input" type="range" min="0" max="1" step="0.01" value="0.55" /></label>
      <button id="reference-frame-back-button" type="button" title="Move the underlay video one frame backward once video support is wired.">Frame −</button>
      <button id="reference-frame-forward-button" type="button" title="Move the underlay video one frame forward once video support is wired.">Frame +</button>
      <button id="clear-reference-button" type="button" title="Clear the loaded underlay.">Clear Underlay</button>
    </div>
  `);
}

function bindWorkspaceControls(showToast) {
  document.getElementById('workspace-mode-cycle-button')?.addEventListener('click', () => {
    const modes = ['dark', 'white', 'underlay'];
    const current = modes.indexOf(editorState.workspaceMode);
    const next = modes[(current + 1) % modes.length];
    setWorkspaceMode(next);
    if (next === 'underlay' && !editorState.referenceMedia.dataUrl) {
      showToast('Load an underlay image or video first.', 'warn');
    } else {
      showToast(`Background: ${labelForWorkspaceMode(next)}.`, 'success');
    }
  });

  document.getElementById('helper-cycle-button')?.addEventListener('click', () => {
    toggleGrid();
    toggleHelpers();
    showToast(editorState.showGrid || editorState.showHelpers ? 'Guides toggled.' : 'Guides hidden.', 'info');
  });

  document.getElementById('toggle-reference-button')?.addEventListener('click', () => {
    ensureUnderlayState();
    if (!editorState.referenceMedia.dataUrl) {
      showToast('Load an underlay image or video first.', 'warn');
      syncWorkspaceControls();
      return;
    }
    editorState.referenceMedia.visible = !editorState.referenceMedia.visible;
    if (editorState.referenceMedia.visible) setWorkspaceMode('underlay');
    showToast(editorState.referenceMedia.visible ? 'Underlay visible.' : 'Underlay hidden.', 'info');
    syncWorkspaceControls();
  });

  document.getElementById('low-performance-button')?.addEventListener('click', () => {
    setLowPerformanceMode(!editorState.lowPerformanceMode);
    resizeCanvas();
    showToast(editorState.lowPerformanceMode ? 'Low Performance Mode enabled.' : 'Full Performance Mode enabled.', 'success');
  });

  document.getElementById('module-theme-select')?.addEventListener('change', (event) => {
    setModuleTheme(event.target.value);
    showToast(`Module theme: ${MODULE_THEMES[editorState.moduleTheme].label}.`, 'success');
  });

  document.getElementById('reference-file-input')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readAsDataURL(file);
    editorState.referenceMedia = {
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name,
      dataUrl,
      opacity: editorState.referenceMedia?.opacity ?? 0.55,
      visible: true,
      frame: 0
    };
    setWorkspaceMode('underlay');
    event.target.value = '';
    showToast(`Underlay loaded: ${file.name}`, 'success');
    syncWorkspaceControls();
  });

  document.getElementById('reference-opacity-input')?.addEventListener('input', (event) => {
    ensureUnderlayState();
    editorState.referenceMedia.opacity = Number(event.target.value);
    syncWorkspaceControls();
  });

  document.getElementById('reference-frame-back-button')?.addEventListener('click', () => nudgeReferenceFrame(-1));
  document.getElementById('reference-frame-forward-button')?.addEventListener('click', () => nudgeReferenceFrame(1));
  document.getElementById('clear-reference-button')?.addEventListener('click', () => {
    editorState.referenceMedia = { type: '', name: '', dataUrl: '', opacity: 0.55, visible: false, frame: 0 };
    if (editorState.workspaceMode === 'underlay') setWorkspaceMode('dark');
    showToast('Underlay cleared.', 'warn');
    syncWorkspaceControls();
  });
}

function nudgeReferenceFrame(delta) {
  ensureUnderlayState();
  editorState.referenceMedia.frame = Math.max(0, Number(editorState.referenceMedia.frame || 0) + delta);
  syncWorkspaceControls();
}

function syncWorkspaceControls() {
  ensureUnderlayState();
  const modeButton = document.getElementById('workspace-mode-cycle-button');
  if (modeButton) modeButton.textContent = `Background: ${labelForWorkspaceMode(editorState.workspaceMode)}`;
  const helperButton = document.getElementById('helper-cycle-button');
  if (helperButton) helperButton.textContent = editorState.showGrid || editorState.showHelpers ? 'Guides: On' : 'Guides: Off';
  const referenceButton = document.getElementById('toggle-reference-button');
  if (referenceButton) referenceButton.textContent = editorState.referenceMedia.visible ? 'Underlay: On' : 'Underlay: Off';
  const lowPerformanceButton = document.getElementById('low-performance-button');
  if (lowPerformanceButton) {
    lowPerformanceButton.textContent = editorState.lowPerformanceMode ? 'Performance: Low' : 'Performance: Full';
    lowPerformanceButton.classList.toggle('is-active-state', editorState.lowPerformanceMode);
  }
  const themeSelect = document.getElementById('module-theme-select');
  if (themeSelect && themeSelect.value !== editorState.moduleTheme) themeSelect.value = editorState.moduleTheme;
  document.body.classList.toggle('low-performance-mode', editorState.lowPerformanceMode);
  const strip = document.getElementById('reference-control-strip');
  if (strip) strip.hidden = !editorState.referenceMedia.dataUrl;
  const name = document.getElementById('reference-name');
  if (name) name.textContent = editorState.referenceMedia.name || 'No underlay loaded';
  const opacity = document.getElementById('reference-opacity-input');
  if (opacity && String(opacity.value) !== String(editorState.referenceMedia.opacity)) opacity.value = editorState.referenceMedia.opacity;
}

function applyModuleTheme() {
  const theme = MODULE_THEMES[editorState.moduleTheme] || MODULE_THEMES.effects;
  const root = document.documentElement;
  root.style.setProperty('--module-accent', theme.accent);
  root.style.setProperty('--module-accent-soft', theme.accentSoft);
  root.style.setProperty('--module-accent-strong', theme.accentStrong);
  root.style.setProperty('--module-glow', theme.glow);
  document.body.dataset.moduleTheme = editorState.moduleTheme;
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

function labelForWorkspaceMode(value) {
  if (value === 'white') return 'White';
  if (value === 'underlay' || value === 'reference') return 'Underlay';
  return 'Dark';
}
