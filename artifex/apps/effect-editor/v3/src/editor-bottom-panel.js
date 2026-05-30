import {
  deleteActiveLayer,
  duplicateActiveLayer,
  editorState,
  moveLayer,
  selectLayer,
  setWorkspaceMode,
  setZoom,
  toggleGrid,
  toggleHelpers,
  toggleLayerVisibility
} from './editor-state.js';

let loadLocal = () => {};
let toast = () => {};

export function initBottomPanel({ loadCompositionLocal, showToast } = {}) {
  loadLocal = typeof loadCompositionLocal === 'function' ? loadCompositionLocal : () => {};
  toast = typeof showToast === 'function' ? showToast : () => {};
  const panel = document.getElementById('bottom-panel');
  if (!panel) return;
  panel.replaceChildren(buildBottomGrid());
}

function buildBottomGrid() {
  const grid = element('div', 'index2-bottom-grid');
  const layers = element('section', 'index2-bottom-card index2-layers-card');
  const count = element('span', 'index2-layer-count', '0 layers');
  count.id = 'layer-count';
  const list = element('div', 'layer-list');
  list.id = 'layer-list';
  layers.append(count, list);

  const display = element('section', 'index2-bottom-card index2-display-card');
  const status = element('span', 'index2-status-paused', 'PAUSED');
  status.id = 'index2-display-state';
  const controls = element('div', 'index2-display-grid');
  controls.setAttribute('aria-label', 'Display controls');
  controls.append(
    displayButton('grid', '▦', 'Toggle grid'),
    displayButton('helpers', '🎯', 'Toggle guides'),
    displayButton('background', 'BG', 'Toggle background'),
    displayButton('folder', '📁', 'Load local effect')
  );
  const reset = displayButton('zoom-reset', 'Reset zoom', 'Reset zoom');
  reset.classList.add('index2-reset-button');
  display.append(status, controls, reset);

  const diagnosticPanel = element('section', 'index2-bottom-card index2-diagnostics-card');
  const diagnostics = element('div', 'index2-diagnostics', 'Ready.');
  diagnostics.id = 'index2-diagnostics';
  diagnosticPanel.append(diagnostics);
  grid.append(layers, display, diagnosticPanel);
  return grid;
}

function displayButton(action, label, title) {
  const button = element('button', '', label);
  button.type = 'button';
  button.dataset.displayAction = action;
  button.title = title;
  button.addEventListener('click', () => runDisplayAction(action));
  return button;
}

export function renderLayerList() {
  const list = document.getElementById('layer-list');
  const count = document.getElementById('layer-count');
  if (!list || !count) return;
  const layers = editorState.composition.layers;
  count.textContent = `${layers.length} layer${layers.length === 1 ? '' : 's'}`;
  list.replaceChildren();
  if (!layers.length) {
    const empty = element('div', 'layer-item');
    empty.append(element('strong', '', 'No layers yet'), element('span', '', 'Use Insert > Base Layer.'));
    list.append(empty);
    return;
  }
  layers.forEach((layer, index) => list.append(buildLayerItem(layer, index, layers.length)));
}

function buildLayerItem(layer, index, layerCount) {
  const item = element('div', `layer-item ${index === editorState.activeLayerIndex ? 'selected' : ''}`);
  item.append(
    element('span', 'layer-sequence-number', String(index + 1)),
    element('strong', '', layer.name || 'Effect Layer'),
    element('span', '', `${layer.engine || 'particles'} · ${layer.visible === false ? 'hidden' : 'visible'}`)
  );
  const actions = element('span', 'layer-inline-actions');
  actions.append(
    layerButton('up', '⬆️', 'Move layer up', index, index === 0),
    layerButton('down', '⬇️', 'Move layer down', index, index === layerCount - 1),
    layerButton('visibility', layer.visible === false ? '🙈' : '👁️', 'Toggle visibility', index),
    layerButton('duplicate', '⧉', 'Duplicate layer', index),
    layerButton('delete', '×', 'Delete layer', index)
  );
  item.append(actions);
  item.addEventListener('click', () => selectLayer(index));
  return item;
}

function layerButton(action, label, title, index, disabled = false) {
  const button = element('button', 'layer-inline-action', label);
  button.type = 'button';
  button.title = title;
  button.disabled = disabled;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!disabled) runLayerAction(index, action);
  });
  return button;
}

export function syncBottomPanelStatus() {
  const state = document.getElementById('index2-display-state');
  const diagnostics = document.getElementById('index2-diagnostics');
  const zoomText = `${Math.round(editorState.zoom * 100)}%`;
  if (state) {
    state.textContent = editorState.isPaused ? 'PAUSED' : 'PLAYING';
    state.classList.toggle('index2-status-paused', editorState.isPaused);
    state.classList.toggle('index2-status-playing', !editorState.isPaused);
  }
  if (diagnostics) diagnostics.textContent = `FPS ${editorState.renderStats.fps}\nParticles ${editorState.renderStats.particles} / ${editorState.renderStats.particleCap}\nMode ${editorState.renderStats.performanceMode}\nGrid ${editorState.showGrid ? 'On' : 'Off'} · Guides ${editorState.showHelpers ? 'On' : 'Off'}\nPreview ${editorState.isPaused ? 'Paused' : 'Running'}\nLayers ${editorState.composition.layers.length}\nZoom ${zoomText}`;
}

function runLayerAction(index, action) {
  if (action === 'up' && index > 0) moveLayer(index, index - 1);
  else if (action === 'down' && index < editorState.composition.layers.length - 1) moveLayer(index, index + 1);
  else if (action === 'visibility') toggleLayerVisibility(index);
  else if (action === 'duplicate') { selectLayer(index); duplicateActiveLayer(); toast('Layer duplicated.', 'success'); }
  else if (action === 'delete') { selectLayer(index); deleteActiveLayer(); toast('Layer deleted.', 'warn'); }
}

function runDisplayAction(action) {
  if (action === 'grid') toggleGrid();
  else if (action === 'helpers') toggleHelpers();
  else if (action === 'zoom-reset') setZoom(1);
  else if (action === 'background') setWorkspaceMode(editorState.workspaceMode === 'white' ? 'dark' : 'white');
  else if (action === 'folder') loadLocal();
}

function element(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
