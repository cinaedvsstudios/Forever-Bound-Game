import {
  deleteActiveLayer,
  editorState,
  onStateChange,
  selectLayer,
  updateActiveLayer
} from './editor-state.js';
import { resizeCanvas } from './editor-renderer.js';

const VERSION_LABEL = 'INDEX2-CLEAN-0.1.8-UI';
const LAYOUT_STORAGE_KEY = 'artifex-index2-ui-layout';
const COLLAPSE_STORAGE_KEY = 'artifex-index2-card-collapse';

window.addEventListener('DOMContentLoaded', initIndex2UIParity);

function initIndex2UIParity() {
  setVersionLabel();
  restoreSavedLayout();
  setupPanelResizers();
  setupTopShortcuts();
  setupCardCollapse();
  setupLayerPanelLayout();
  restoreQuickEditHelpers();
  addControlTooltips();
  onStateChange(syncParityUI);
  syncParityUI();
}

function setVersionLabel() {
  document.title = `Artifex Effect Editor ${VERSION_LABEL}`;
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = VERSION_LABEL;
  const about = document.getElementById('about-button');
  if (about) about.textContent = `About ${VERSION_LABEL}`;
}

function setupTopShortcuts() {
  document.querySelectorAll('.index2-action-strip [data-jump-card]').forEach((button) => {
    button.addEventListener('click', () => jumpToCard(button.dataset.jumpCard));
  });
}

function jumpToCard(id) {
  const target = document.getElementById(id || '');
  if (!target) return;
  const query = document.getElementById('left-panel-search-input');
  if (target.classList.contains('index2-card-hidden') && query) {
    query.value = '';
    query.dispatchEvent(new Event('input', { bubbles: true }));
  }
  if (target.classList.contains('index2-card-collapsed')) {
    setCardCollapsed(target, false);
    persistCollapsedCards();
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  target.classList.add('index2-jump-highlight');
  window.setTimeout(() => target.classList.remove('index2-jump-highlight'), 650);
}

function setupCardCollapse() {
  const saved = readCollapsedCards();
  document.querySelectorAll('#left-panel .card[id]').forEach((card) => {
    const button = card.querySelector('[data-card-collapse]');
    if (!button) return;
    setCardCollapsed(card, saved.includes(card.id));
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const collapsed = !card.classList.contains('index2-card-collapsed');
      setCardCollapsed(card, collapsed);
      persistCollapsedCards();
    });
  });
}

function setCardCollapsed(card, collapsed) {
  card.classList.toggle('index2-card-collapsed', collapsed);
  const button = card.querySelector('[data-card-collapse]');
  if (!button) return;
  button.textContent = collapsed ? '⬇️' : '⬆️';
  button.title = `${collapsed ? 'Expand' : 'Collapse'} ${card.querySelector('h2')?.textContent || 'panel'}`;
}

function readCollapsedCards() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function persistCollapsedCards() {
  const ids = Array.from(document.querySelectorAll('#left-panel .card.index2-card-collapsed[id]')).map((card) => card.id);
  try {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore private-browsing storage restrictions.
  }
}

function setupLayerPanelLayout() {
  const toolbar = document.querySelector('.index2-layer-toolbar');
  const list = document.getElementById('layer-list');
  if (!toolbar || !list || toolbar.parentElement?.classList.contains('index2-layer-panel-body')) return;
  const body = document.createElement('div');
  body.className = 'index2-layer-panel-body';
  toolbar.before(body);
  body.append(toolbar, list);
}

function syncParityUI() {
  syncCanvasButtonIcons();
  enhanceLayerList();
}

function syncCanvasButtonIcons() {
  const pause = document.getElementById('pause-button');
  const snapshot = document.getElementById('snapshot-button');
  if (pause) {
    pause.textContent = editorState.isPaused ? '▶️' : '⏸️';
    pause.title = editorState.isPaused ? 'Resume preview' : 'Pause preview';
  }
  if (snapshot) {
    snapshot.textContent = '📸';
    snapshot.title = 'Take snapshot';
  }
}

function enhanceLayerList() {
  const items = document.querySelectorAll('#layer-list .layer-item');
  if (!editorState.composition.layers.length) return;
  items.forEach((item, index) => {
    if (item.querySelector('.layer-sequence-number')) return;
    const number = document.createElement('span');
    number.className = 'layer-sequence-number';
    number.textContent = String(index + 1);
    number.title = `Sequence position ${index + 1}`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'layer-delete-inline';
    remove.textContent = '×';
    remove.title = `Delete layer ${index + 1}`;
    remove.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      selectLayer(index);
      deleteActiveLayer();
    });
    item.prepend(number);
    item.append(remove);
  });
}

function restoreQuickEditHelpers() {
  const card = document.getElementById('index2-card-presets');
  if (!card || card.querySelector('.index2-quick-helper-sections')) return;
  const oldRow = card.querySelector('.button-row');
  if (oldRow) oldRow.classList.add('index2-original-quick-row');
  installCorrectedCorePresetHandlers(card);
  card.insertAdjacentHTML('beforeend', `
    <div class="index2-quick-helper-sections">
      ${helperSection('Colour Helpers', 'colour', ['Water', 'Evil'])}
      ${helperSection('Appearance Helpers', 'appearance', ['Soft Glow', 'Sharp Sparks', 'Fade In/Out', 'Bright Add', 'White Fog', 'Sooty Smoke'])}
      ${helperSection('Dynamics Helpers', 'dynamics', ['Slow Drift', 'Burst Out', 'Rise Up', 'Tight Trail'])}
    </div>
  `);
  card.querySelectorAll('[data-helper-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const patch = HELPER_PATCHES[button.dataset.helperPreset];
      if (!patch) return;
      updateActiveLayer(patch);
      showLocalToast(`${button.textContent.trim()} helper applied.`, 'success');
    });
  });
}

function installCorrectedCorePresetHandlers(card) {
  const patches = {
    fire: HELPER_PATCHES['colour:fire'],
    ice: HELPER_PATCHES['colour:ice'],
    goodMagic: HELPER_PATCHES['colour:good-magic'],
    darkMagic: HELPER_PATCHES['colour:dark-magic']
  };
  card.querySelectorAll('[data-quick-preset]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const patch = patches[button.dataset.quickPreset];
      if (!patch) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      updateActiveLayer(patch);
      showLocalToast(`${button.textContent.trim()} helper applied.`, 'success');
    }, true);
  });
}

function helperSection(title, group, labels) {
  return `<section class="index2-helper-section"><div class="index2-helper-title"><span></span>${title}</div><div class="index2-helper-grid">${labels.map((label) => `<button type="button" data-helper-preset="${group}:${slug(label)}">${label}</button>`).join('')}</div></section>`;
}

function slug(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const HELPER_PATCHES = {
  'colour:fire': { appearanceStops: [{ position: 0, color: '#fff1a8', opacity: 1, size: 24, glow: 34 }, { position: 0.5, color: '#ff8a00', opacity: 0.8, size: 18, glow: 24 }, { position: 1, color: '#ff2600', opacity: 0, size: 5, glow: 0 }], gravity: 0.04, blendMode: 'lighter' },
  'colour:ice': { appearanceStops: [{ position: 0, color: '#ffffff', opacity: 0.95, size: 18, glow: 22 }, { position: 0.5, color: '#99f2ff', opacity: 0.7, size: 14, glow: 16 }, { position: 1, color: '#00a1d7', opacity: 0, size: 2, glow: 0 }], gravity: -0.01, blendMode: 'screen' },
  'colour:good-magic': { appearanceStops: [{ position: 0, color: '#fff7cf', opacity: 1, size: 18, glow: 30 }, { position: 0.5, color: '#d65cff', opacity: 0.85, size: 22, glow: 34 }, { position: 1, color: '#5e8cff', opacity: 0, size: 8, glow: 0 }], gravity: -0.008, blendMode: 'lighter' },
  'colour:dark-magic': { appearanceStops: [{ position: 0, color: '#b6ff2e', opacity: 0.95, size: 20, glow: 24 }, { position: 0.5, color: '#29e36c', opacity: 0.8, size: 24, glow: 20 }, { position: 1, color: '#061709', opacity: 0, size: 6, glow: 0 }], gravity: 0.015, blendMode: 'lighter' },
  'colour:water': { appearanceStops: [{ position: 0, color: '#dffbff', opacity: 0.9, size: 18, glow: 10 }, { position: 0.5, color: '#38b6ff', opacity: 0.75, size: 20, glow: 12 }, { position: 1, color: '#0356a6', opacity: 0, size: 5, glow: 0 }] },
  'colour:evil': { appearanceStops: [{ position: 0, color: '#ffb0b0', opacity: 0.95, size: 19, glow: 24 }, { position: 0.45, color: '#ff003c', opacity: 0.85, size: 24, glow: 22 }, { position: 1, color: '#130006', opacity: 0, size: 7, glow: 0 }], blendMode: 'lighter' },
  'appearance:soft-glow': { glow: 24, edgeBlur: 1.2, blendMode: 'screen', textureContrast: 0.9 },
  'appearance:sharp-sparks': { appearanceMode: 'brush', builtInBrush: 'slash', glow: 10, edgeBlur: 0, sizeStart: 10, sizeEnd: 1, textureContrast: 1.45 },
  'appearance:fade-in-out': { appearanceStops: [{ position: 0, color: '#ffcc66', opacity: 0, size: 4, glow: 0 }, { position: 0.5, color: '#fff1a8', opacity: 1, size: 18, glow: 18 }, { position: 1, color: '#ff6600', opacity: 0, size: 4, glow: 0 }] },
  'appearance:bright-add': { blendMode: 'lighter', glow: 30, textureAlpha: 1, textureContrast: 1.25 },
  'appearance:white-fog': { colorA: '#ffffff', colorB: '#d9e6ea', alphaStart: 0.45, alphaEnd: 0, sizeStart: 38, sizeEnd: 64, edgeBlur: 1.6, blendMode: 'screen' },
  'appearance:sooty-smoke': { colorA: '#696360', colorB: '#161413', alphaStart: 0.6, alphaEnd: 0, sizeStart: 28, sizeEnd: 54, edgeBlur: 1.4, textureContrast: 0.8 },
  'dynamics:slow-drift': { spawnRate: 6, speedMin: 0.35, speedMax: 1.4, gravity: -0.004, spread: 110, lifetime: 155 },
  'dynamics:burst-out': { spawnRate: 36, speedMin: 6, speedMax: 14, gravity: 0, spread: 360, lifetime: 46 },
  'dynamics:rise-up': { spawnRate: 14, speedMin: 1.6, speedMax: 5.5, angle: -90, gravity: -0.03, spread: 42, lifetime: 96 },
  'dynamics:tight-trail': { spawnRate: 22, speedMin: 2, speedMax: 4.4, spread: 10, lifetime: 72 }
};

function showLocalToast(message, type = 'info') {
  const area = document.getElementById('toast-area');
  if (!area) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  area.append(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

function setupPanelResizers() {
  const leftPanel = document.getElementById('left-panel');
  const sideResizer = document.getElementById('side-resizer');
  const bottomPanel = document.getElementById('bottom-panel');
  const bottomResizer = document.getElementById('bottom-resizer');
  if (!leftPanel || !sideResizer || !bottomPanel || !bottomResizer) return;

  setupPointerResize(sideResizer, 'side', (event, start) => {
    const width = clamp(start.size + event.clientX - start.pointer, 245, 560);
    leftPanel.style.width = `${Math.round(width)}px`;
    requestCanvasResize();
  });

  setupPointerResize(bottomResizer, 'bottom', (event, start) => {
    const height = clamp(start.size - (event.clientY - start.pointer), 105, 420);
    bottomPanel.style.height = `${Math.round(height)}px`;
    requestCanvasResize();
  });

  sideResizer.addEventListener('dblclick', () => {
    leftPanel.style.width = '330px';
    persistLayout();
    requestCanvasResize();
  });
  bottomResizer.addEventListener('dblclick', () => {
    bottomPanel.style.height = '170px';
    persistLayout();
    requestCanvasResize();
  });
}

function setupPointerResize(handle, kind, onMove) {
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const panel = kind === 'side' ? document.getElementById('left-panel') : document.getElementById('bottom-panel');
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const start = { pointer: kind === 'side' ? event.clientX : event.clientY, size: kind === 'side' ? rect.width : rect.height };
    const bodyClass = kind === 'side' ? 'index2-resizing-side' : 'index2-resizing-bottom';
    document.body.classList.add('index2-resizing', bodyClass);
    handle.setPointerCapture(event.pointerId);
    const move = (moveEvent) => onMove(moveEvent, start);
    const finish = () => {
      document.body.classList.remove('index2-resizing', bodyClass);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', finish);
      handle.removeEventListener('pointercancel', finish);
      persistLayout();
      requestCanvasResize();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
  });
}

function persistLayout() {
  const leftWidth = document.getElementById('left-panel')?.style.width || '';
  const bottomHeight = document.getElementById('bottom-panel')?.style.height || '';
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ leftWidth, bottomHeight }));
  } catch {
    // Ignore private-browsing storage restrictions.
  }
}

function restoreSavedLayout() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(LAYOUT_STORAGE_KEY) || '{}');
    const leftPanel = document.getElementById('left-panel');
    const bottomPanel = document.getElementById('bottom-panel');
    if (leftPanel && saved.leftWidth) leftPanel.style.width = saved.leftWidth;
    if (bottomPanel && saved.bottomHeight) bottomPanel.style.height = saved.bottomHeight;
    requestCanvasResize();
  } catch {
    try { window.localStorage.removeItem(LAYOUT_STORAGE_KEY); } catch { /* no-op */ }
  }
}

let resizeFrame = 0;
function requestCanvasResize() {
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(() => resizeCanvas());
}

function addControlTooltips() {
  const tips = {
    'pause-button': 'Pause or resume the preview.',
    'snapshot-button': 'Export a PNG snapshot.',
    'zoom-out-button': 'Zoom out.',
    'zoom-in-button': 'Zoom in.',
    'zoom-reset-button': 'Reset zoom.'
  };
  Object.entries(tips).forEach(([id, title]) => {
    const element = document.getElementById(id);
    if (element) element.title = title;
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
