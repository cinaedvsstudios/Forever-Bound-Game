import { editorState, setWorkspaceMode, setZoom, toggleGrid, toggleHelpers, onStateChange } from './editor-state.js';

export function initWorkspaceParity(showToast = () => {}) {
  ensureReferenceState();
  injectWorkspaceStyles();
  ensureToolbarControls();
  bindWorkspaceControls(showToast);
  syncWorkspaceControls();
  onStateChange(syncWorkspaceControls);
}

function ensureReferenceState() {
  editorState.referenceMedia = editorState.referenceMedia || {
    type: '',
    name: '',
    dataUrl: '',
    opacity: 0.55,
    visible: false,
    frame: 0
  };
}

function injectWorkspaceStyles() {
  if (document.getElementById('workspace-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'workspace-parity-style';
  style.textContent = `
    .workspace-extra-controls { display: flex; align-items: center; gap: 8px; margin-left: 8px; }
    .workspace-extra-controls button { min-height: 34px; padding: 6px 10px; font-size: 12px; }
    .reference-file-label { border: 1px solid var(--border); border-radius: 13px; padding: 7px 10px; background: linear-gradient(180deg, #2a201a 0%, #1b1411 100%); color: var(--gold); cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,.62); font-size: 12px; white-space: nowrap; }
    .reference-file-label input { display: none; }
    .reference-control-strip { position: absolute; left: 12px; bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 8px; border: 1px solid var(--border); border-radius: 14px; background: rgba(23,18,16,.86); box-shadow: 0 12px 26px rgba(0,0,0,.72); z-index: 8; }
    .reference-control-strip[hidden] { display: none; }
    .reference-control-strip label { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 10px; }
    .reference-control-strip input[type='range'] { width: 120px; }
    .reference-name { color: var(--gold-bright); font-size: 11px; max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `;
  document.head.append(style);
}

function ensureToolbarControls() {
  const toolbar = document.querySelector('.workspace-toolbar');
  const workspace = document.getElementById('workspace');
  if (!toolbar || !workspace || document.getElementById('workspace-mode-cycle-button')) return;

  const status = document.getElementById('status-text');
  const controls = document.createElement('div');
  controls.className = 'workspace-extra-controls';
  controls.innerHTML = `
    <button id="workspace-mode-cycle-button" type="button">View: Dark</button>
    <button id="helper-cycle-button" type="button">Helpers On</button>
    <label class="reference-file-label">Load Reference<input id="reference-file-input" type="file" accept="image/*,video/*" /></label>
    <button id="toggle-reference-button" type="button">Reference Off</button>
  `;
  toolbar.insertBefore(controls, status || null);

  workspace.insertAdjacentHTML('beforeend', `
    <div id="reference-control-strip" class="reference-control-strip" hidden>
      <span id="reference-name" class="reference-name">No reference loaded</span>
      <label>Opacity <input id="reference-opacity-input" type="range" min="0" max="1" step="0.01" value="0.55" /></label>
      <button id="reference-frame-back-button" type="button">Frame −</button>
      <button id="reference-frame-forward-button" type="button">Frame +</button>
      <button id="clear-reference-button" type="button">Clear</button>
    </div>
  `);
}

function bindWorkspaceControls(showToast) {
  document.getElementById('workspace-mode-cycle-button')?.addEventListener('click', () => {
    const modes = ['dark', 'white', 'reference'];
    const current = modes.indexOf(editorState.workspaceMode);
    const next = modes[(current + 1) % modes.length];
    setWorkspaceMode(next);
    if (next === 'reference') {
      editorState.referenceMedia.visible = Boolean(editorState.referenceMedia.dataUrl);
    }
    showToast(`Workspace view: ${next}.`, 'success');
  });

  document.getElementById('helper-cycle-button')?.addEventListener('click', () => {
    toggleGrid();
    toggleHelpers();
    showToast(editorState.showGrid || editorState.showHelpers ? 'Helper visibility toggled.' : 'Helpers hidden.', 'info');
  });

  document.getElementById('toggle-reference-button')?.addEventListener('click', () => {
    ensureReferenceState();
    editorState.referenceMedia.visible = !editorState.referenceMedia.visible;
    if (editorState.referenceMedia.visible) setWorkspaceMode('reference');
    showToast(editorState.referenceMedia.visible ? 'Reference visible.' : 'Reference hidden.', 'info');
    syncWorkspaceControls();
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
    setWorkspaceMode('reference');
    event.target.value = '';
    showToast(`Reference loaded: ${file.name}`, 'success');
    syncWorkspaceControls();
  });

  document.getElementById('reference-opacity-input')?.addEventListener('input', (event) => {
    ensureReferenceState();
    editorState.referenceMedia.opacity = Number(event.target.value);
    syncWorkspaceControls();
  });

  document.getElementById('reference-frame-back-button')?.addEventListener('click', () => nudgeReferenceFrame(-1));
  document.getElementById('reference-frame-forward-button')?.addEventListener('click', () => nudgeReferenceFrame(1));
  document.getElementById('clear-reference-button')?.addEventListener('click', () => {
    editorState.referenceMedia = { type: '', name: '', dataUrl: '', opacity: 0.55, visible: false, frame: 0 };
    showToast('Reference cleared.', 'warn');
    syncWorkspaceControls();
  });
}

function nudgeReferenceFrame(delta) {
  ensureReferenceState();
  editorState.referenceMedia.frame = Math.max(0, Number(editorState.referenceMedia.frame || 0) + delta);
  syncWorkspaceControls();
}

function syncWorkspaceControls() {
  ensureReferenceState();
  const modeButton = document.getElementById('workspace-mode-cycle-button');
  if (modeButton) modeButton.textContent = `View: ${capitalize(editorState.workspaceMode)}`;
  const helperButton = document.getElementById('helper-cycle-button');
  if (helperButton) helperButton.textContent = editorState.showGrid || editorState.showHelpers ? 'Helpers On' : 'Helpers Off';
  const referenceButton = document.getElementById('toggle-reference-button');
  if (referenceButton) referenceButton.textContent = editorState.referenceMedia.visible ? 'Reference On' : 'Reference Off';
  const strip = document.getElementById('reference-control-strip');
  if (strip) strip.hidden = !editorState.referenceMedia.dataUrl;
  const name = document.getElementById('reference-name');
  if (name) name.textContent = editorState.referenceMedia.name || 'No reference loaded';
  const opacity = document.getElementById('reference-opacity-input');
  if (opacity && String(opacity.value) !== String(editorState.referenceMedia.opacity)) opacity.value = editorState.referenceMedia.opacity;
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

function capitalize(value) {
  return String(value || '').slice(0, 1).toUpperCase() + String(value || '').slice(1);
}
