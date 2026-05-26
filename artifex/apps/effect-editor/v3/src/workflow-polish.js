import {
  clearParticles,
  deleteActiveLayer,
  editorState,
  loadComposition,
  onStateChange,
  resetComposition,
  selectLayer,
  setLowPerformanceMode,
  updateActiveLayer
} from './editor-state.js';
import { resizeCanvas } from './editor-renderer.js';
import { saveToLocalStorage } from './editor-io.js';

const AUTOSAVE_KEY = 'artifex-effect-editor-autosave-untitled';
const PERF_KEY = 'artifex-effect-editor-low-performance';
const MAX_HISTORY = 20;

let showToastRef = () => {};
let dirty = false;
let lastSavedAt = '';
let suppressHistory = false;
let undoStack = [];
let redoStack = [];
let lastSnapshot = '';
let snapRotate = true;

export function initWorkflowPolish(showToast = () => {}) {
  showToastRef = showToast;
  injectWorkflowPolishStyles();
  restorePerformancePreference();
  centerTopMenu();
  enhanceMenus();
  addBottomPanelButtons();
  addArchetypeLibraryShortcut();
  addResetAppearanceButton();
  addRotateSnapControl();
  installLayerDeleteButtons();
  installUnsavedGuards();
  installAutosaveAndHistory();
  installTooltips();
  syncDiagnostics();
  onStateChange(() => {
    persistPerformancePreference();
    saveAutosaveDraft();
    recordHistorySnapshot();
    syncDiagnostics();
    decorateSelectedBorders();
  });
  decorateSelectedBorders();
}

function injectWorkflowPolishStyles() {
  if (document.getElementById('workflow-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'workflow-polish-style';
  style.textContent = `
    .menu-bar { margin-left: auto; margin-right: auto; justify-content: center; }
    .topbar { grid-template-columns: minmax(280px, 1fr) auto minmax(280px, 1fr); }
    .topbar .menu-bar { grid-column: 2; }
    .topbar::after { content: ''; display: block; grid-column: 3; }
    .is-cyan-selected,
    .layer-item.selected,
    .layer-item:focus-within,
    .brush-asset-card.is-selected,
    .appearance-stop-marker.is-selected,
    button.is-active-state,
    button.is-accent,
    select:focus,
    input:focus {
      border-color: var(--module-accent) !important;
      box-shadow: 0 0 0 1px var(--module-accent-soft), 0 0 14px var(--module-glow) !important;
    }
    .quick-inline-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: end; }
    .quick-inline-row label { margin: 0; }
    .quick-inline-row button { min-height: 38px; padding: 7px 10px; }
    .icon-button-tiny { min-width: 30px; min-height: 30px; padding: 4px 7px; text-align: center; }
    .layer-x-button { color: #ffb4c0 !important; border-color: rgba(255,128,160,.36) !important; }
    .rotate-snap-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; margin-top: 4px; }
    .rotate-snap-row button { min-height: 26px; padding: 4px 8px; font-size: 10px; }
    .diagnostic-mini { display: block; color: var(--gold-muted); margin-top: 7px; }
  `;
  document.head.append(style);
}

function restorePerformancePreference() {
  const saved = localStorage.getItem(PERF_KEY);
  if (saved === 'true') {
    setLowPerformanceMode(true);
    resizeCanvas();
  }
}

function persistPerformancePreference() {
  localStorage.setItem(PERF_KEY, String(Boolean(editorState.lowPerformanceMode)));
}

function centerTopMenu() {
  document.querySelector('.menu-bar')?.setAttribute('aria-label', 'Centered editor menus');
}

function enhanceMenus() {
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest?.('.menu')) closeAllMenus();
  }, true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllMenus();
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      undoChange();
    }
    if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
      event.preventDefault();
      redoChange();
    }
  });

  const editPanel = document.getElementById('menu-edit');
  if (editPanel && !document.getElementById('undo-button')) {
    editPanel.insertAdjacentHTML('afterbegin', `
      <div class="menu-section-title">History</div>
      <button id="undo-button" title="Undo the last edit. Keeps up to 20 changes.">↶ Undo</button>
      <button id="redo-button" title="Redo the last undone edit.">↷ Redo</button>
      <div class="menu-divider"></div>
    `);
    document.getElementById('undo-button')?.addEventListener('click', undoChange);
    document.getElementById('redo-button')?.addEventListener('click', redoChange);
  }
}

function closeAllMenus() {
  document.querySelectorAll('.menu-panel.open').forEach((panel) => panel.classList.remove('open'));
}

function addBottomPanelButtons() {
  const playbackCard = Array.from(document.querySelectorAll('.bottom-tool-card')).find((card) => card.querySelector('h2')?.textContent?.includes('Playback'));
  const playbackButtons = playbackCard?.querySelector('.bottom-control-buttons');
  if (playbackButtons) {
    const pauseButton = document.getElementById('pause-button');
    const snapshotButton = document.getElementById('snapshot-button');
    const clearButton = document.getElementById('clear-particles-button-bottom');
    const zoomReset = document.getElementById('zoom-reset-button');
    if (pauseButton) pauseButton.textContent = editorState.isPaused ? '▶️' : '⏸️';
    if (snapshotButton) snapshotButton.textContent = '📸';
    if (clearButton) clearButton.textContent = '🧹';
    if (zoomReset) zoomReset.textContent = '🎯';
    if (!document.getElementById('low-performance-button-playback')) {
      playbackButtons.insertAdjacentHTML('beforeend', `<button id="low-performance-button-playback" title="Toggle Low Performance Mode from playback controls.">🐢</button>`);
      document.getElementById('low-performance-button-playback')?.addEventListener('click', () => {
        setLowPerformanceMode(!editorState.lowPerformanceMode);
        resizeCanvas();
        showToastRef(editorState.lowPerformanceMode ? 'Low Performance Mode enabled.' : 'Full Performance Mode enabled.', 'success');
      });
    }
    if (!document.getElementById('save-archetype-bottom-button')) {
      playbackButtons.insertAdjacentHTML('beforeend', `<button id="save-archetype-bottom-button" title="Save the current effect archetype in browser local storage.">💾 Save Archetype</button>`);
      document.getElementById('save-archetype-bottom-button')?.addEventListener('click', () => {
        saveToLocalStorage();
        markSaved();
      });
    }
  }

  onStateChange(() => {
    const pauseButton = document.getElementById('pause-button');
    const lowPerf = document.getElementById('low-performance-button-playback');
    if (pauseButton) pauseButton.textContent = editorState.isPaused ? '▶️' : '⏸️';
    if (lowPerf) lowPerf.classList.toggle('is-active-state', editorState.lowPerformanceMode);
  });
}

function addArchetypeLibraryShortcut() {
  const archetypeInput = document.getElementById('archetype-id-input');
  const label = archetypeInput?.closest('label');
  if (!label || document.getElementById('archetype-library-shortcut')) return;
  label.insertAdjacentHTML('afterend', `<button id="archetype-library-shortcut" class="icon-button-tiny" title="Open the Effect Archetype Library.">📚 Library</button>`);
  document.getElementById('archetype-library-shortcut')?.addEventListener('click', () => document.getElementById('open-library-button')?.click());
}

function addResetAppearanceButton() {
  const glowInput = document.getElementById('stop-glow-input') || document.getElementById('glow-input');
  const label = glowInput?.closest('label');
  if (!label || document.getElementById('reset-appearance-button')) return;
  label.insertAdjacentHTML('afterend', `<button id="reset-appearance-button" class="icon-button-tiny" title="Reset the active layer appearance ramp to the default particle appearance.">🔄 Reset Appearance</button>`);
  document.getElementById('reset-appearance-button')?.addEventListener('click', () => {
    updateActiveLayer({
      appearanceStops: [
        { position: 0, color: '#ffcc66', opacity: 1, size: 20, glow: 12 },
        { position: 1, color: '#ff6600', opacity: 0, size: 4, glow: 0 }
      ],
      activeAppearanceStopIndex: 0,
      colorA: '#ffcc66',
      colorB: '#ff6600',
      alphaStart: 1,
      alphaEnd: 0,
      sizeStart: 20,
      sizeEnd: 4,
      glow: 12
    });
    showToastRef('Appearance reset to default.', 'success');
  });
}

function addRotateSnapControl() {
  const rotationInput = document.getElementById('rotation-input');
  const output = document.getElementById('rotation-output');
  if (!rotationInput || !output || document.getElementById('rotation-snap-button')) return;
  output.insertAdjacentHTML('afterend', `<div class="rotate-snap-row"><span id="rotation-snap-readout">snap on</span><button id="rotation-snap-button" type="button" title="Toggle snapping the Rotate slider to 45° increments when close.">SNAP</button></div>`);
  document.getElementById('rotation-snap-button')?.addEventListener('click', () => {
    snapRotate = !snapRotate;
    syncRotateSnapReadout();
  });
  rotationInput.addEventListener('input', () => {
    if (!snapRotate) return;
    const snapped = snapAngle(Number(rotationInput.value));
    if (snapped !== Number(rotationInput.value)) {
      rotationInput.value = String(snapped);
      output.textContent = String(snapped);
      updateActiveLayer({ rotation: snapped });
    }
  });
  syncRotateSnapReadout();
}

function snapAngle(value) {
  const targets = [];
  for (let angle = -180; angle <= 180; angle += 45) targets.push(angle);
  const nearest = targets.reduce((best, target) => Math.abs(target - value) < Math.abs(best - value) ? target : best, targets[0]);
  return Math.abs(nearest - value) <= 5 ? nearest : value;
}

function syncRotateSnapReadout() {
  const readout = document.getElementById('rotation-snap-readout');
  const button = document.getElementById('rotation-snap-button');
  if (readout) readout.textContent = snapRotate ? 'snap on' : 'snap off';
  if (button) button.classList.toggle('is-active-state', snapRotate);
}

function installLayerDeleteButtons() {
  const layerList = document.getElementById('layer-list');
  if (!layerList) return;
  const decorate = () => {
    Array.from(layerList.querySelectorAll('.layer-item')).forEach((item, index) => {
      const actions = item.querySelector('.layer-item-actions');
      if (!actions || item.querySelector('.layer-x-button')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'layer-x-button';
      button.title = 'Delete this layer.';
      button.textContent = '×';
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectLayer(index);
        deleteActiveLayer();
        showToastRef('Layer deleted.', 'warn');
      });
      actions.append(button);
    });
  };
  decorate();
  new MutationObserver(decorate).observe(layerList, { childList: true, subtree: true });
}

function installUnsavedGuards() {
  guardButton('new-effect-button', 'You have unsaved changes. Start a new archetype anyway?', () => {
    resetComposition();
    dirty = false;
    showToastRef('New effect archetype created.', 'success');
  });
  guardButton('clear-particles-button', 'You have unsaved changes. Clear the preview particles anyway?', () => {
    clearParticles();
    showToastRef('Particles cleared.', 'success');
  });
  guardButton('clear-particles-button-bottom', 'You have unsaved changes. Clear the preview particles anyway?', () => {
    clearParticles();
    showToastRef('Particles cleared.', 'success');
  });
  window.addEventListener('beforeunload', (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });
}

function guardButton(id, message, action) {
  const button = document.getElementById(id);
  if (!button || button.dataset.unsavedGuard === 'true') return;
  button.dataset.unsavedGuard = 'true';
  button.addEventListener('click', (event) => {
    if (!dirty || confirm(message)) {
      event.stopImmediatePropagation();
      action();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}

function installAutosaveAndHistory() {
  lastSnapshot = snapshotComposition();
  undoStack = [lastSnapshot];
  saveAutosaveDraft();
}

function saveAutosaveDraft() {
  try {
    const payload = {
      name: editorState.composition.name || 'Untitled Effect Archetype',
      id: editorState.composition.id || 'untitled',
      savedAt: new Date().toISOString(),
      composition: editorState.composition
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
    dirty = true;
  } catch (error) {
    console.warn('Artifex autosave failed', error);
  }
}

function markSaved() {
  dirty = false;
  lastSavedAt = new Date().toLocaleString();
  syncDiagnostics();
}

function recordHistorySnapshot() {
  if (suppressHistory) return;
  const snapshot = snapshotComposition();
  if (!snapshot || snapshot === lastSnapshot) return;
  undoStack.push(snapshot);
  if (undoStack.length > MAX_HISTORY + 1) undoStack.shift();
  redoStack = [];
  lastSnapshot = snapshot;
}

function undoChange() {
  if (undoStack.length <= 1) {
    showToastRef('Nothing to undo.', 'info');
    return;
  }
  const current = undoStack.pop();
  redoStack.push(current);
  restoreSnapshot(undoStack[undoStack.length - 1]);
  showToastRef('Undo.', 'info');
}

function redoChange() {
  if (!redoStack.length) {
    showToastRef('Nothing to redo.', 'info');
    return;
  }
  const next = redoStack.pop();
  undoStack.push(next);
  restoreSnapshot(next);
  showToastRef('Redo.', 'info');
}

function restoreSnapshot(snapshot) {
  try {
    suppressHistory = true;
    loadComposition(JSON.parse(snapshot));
    lastSnapshot = snapshot;
    dirty = true;
  } finally {
    suppressHistory = false;
  }
}

function snapshotComposition() {
  try {
    return JSON.stringify(editorState.composition);
  } catch {
    return '';
  }
}

function installTooltips() {
  document.querySelectorAll('button, input, select, label.reference-file-label').forEach((element) => {
    if (element.title) return;
    const label = element.closest('label')?.childNodes?.[0]?.textContent?.trim();
    const text = element.textContent?.trim() || label || element.id || element.name;
    if (text) element.title = `Adjust ${text.replace(/[:▾]/gu, '').trim()}.`;
  });
}

function decorateSelectedBorders() {
  document.querySelectorAll('.layer-item.selected, .brush-asset-card.is-selected, .appearance-stop-marker.is-selected').forEach((element) => element.classList.add('is-cyan-selected'));
}

function syncDiagnostics() {
  const status = document.getElementById('status-text');
  if (!status) return;
  const fileName = editorState.composition?.name || editorState.composition?.id || 'Untitled Effect Archetype';
  const saved = lastSavedAt || 'Autosaving draft';
  if (!status.querySelector('#diagnostic-file-name')) {
    status.insertAdjacentHTML('beforeend', `<span class="diagnostic-mini" id="diagnostic-file-name"></span><span class="diagnostic-mini" id="diagnostic-last-saved"></span>`);
  }
  const file = document.getElementById('diagnostic-file-name');
  const last = document.getElementById('diagnostic-last-saved');
  if (file) file.textContent = `File: ${fileName}`;
  if (last) last.textContent = `Last saved: ${saved}${dirty ? ' • unsaved' : ''}`;
}
