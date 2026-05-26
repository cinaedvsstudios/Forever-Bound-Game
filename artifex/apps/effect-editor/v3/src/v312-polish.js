import { getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

const EXTRA_SHAPES = [
  { value: 'dot-cluster', name: 'Dot Cluster', symbol: '⠿', title: 'Use a cluster of small dots as the particle shape.' },
  { value: 'figure-eight-rings', name: 'Figure-8 Rings', symbol: '∞', title: 'Use linked figure-8 rings, like a can-holder loop shape.' },
  { value: 'diamond-net', name: 'Diamond Net', symbol: '◇', title: 'Use a diamond fishing-net lattice particle shape.' }
];

export function initV312Polish(showToast = () => {}) {
  injectStyles();
  polishBottomDisplayPanel();
  installExtraBrushShapes(showToast);
  applyControlLocks();
  onStateChange(() => {
    polishBottomDisplayPanel();
    installExtraBrushShapes(showToast);
    updateExtraShapePreview();
    applyControlLocks();
  });
}

function injectStyles() {
  if (document.getElementById('v312-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'v312-polish-style';
  style.textContent = `
    #left-panel select,
    #left-panel select option,
    .menu-panel select,
    .effect-specific-grid select,
    .brush-library-panel select {
      font-size: 10px !important;
      font-weight: 400 !important;
      letter-spacing: .01em !important;
    }
    .bottom-tool-card.display-card-v312 .bottom-control-buttons {
      display: grid !important;
      grid-template-columns: repeat(3, minmax(38px, auto));
      gap: 8px;
      justify-content: start;
      align-items: start;
    }
    .bottom-tool-card.display-card-v312 .bottom-control-buttons button {
      min-width: 42px;
      text-align: center;
    }
    .bottom-tool-card.display-card-v312 #save-archetype-bottom-button {
      grid-column: 1 / -1;
      min-width: 0;
    }
    .brush-asset-card.v312-extra-shape .brush-asset-thumb {
      color: var(--module-accent-strong);
      font-family: Georgia, serif;
      font-weight: 800;
    }
    .control-locked-v312 {
      opacity: .38 !important;
      filter: grayscale(.75);
    }
    .control-locked-v312 input,
    .control-locked-v312 select,
    .control-locked-v312 button {
      cursor: not-allowed !important;
    }
  `;
  document.head.append(style);
}

function polishBottomDisplayPanel() {
  const cards = Array.from(document.querySelectorAll('.bottom-tool-card'));
  const playback = cards.find((card) => /Playback|Display/i.test(card.querySelector('h2')?.textContent || ''));
  if (!playback) return;
  playback.classList.add('display-card-v312');
  const h2 = playback.querySelector('h2');
  if (h2) h2.textContent = 'Display';
  const buttons = playback.querySelector('.bottom-control-buttons');
  if (!buttons) return;
  if (!document.getElementById('undo-bottom-button-v312')) {
    buttons.insertAdjacentHTML('afterbegin', `
      <button id="undo-bottom-button-v312" type="button" title="Undo the last edit. Keeps up to 20 changes.">↶</button>
      <button id="redo-bottom-button-v312" type="button" title="Redo the last undone edit.">↷</button>
    `);
    document.getElementById('undo-bottom-button-v312')?.addEventListener('click', () => dispatchHistoryShortcut('z'));
    document.getElementById('redo-bottom-button-v312')?.addEventListener('click', () => dispatchHistoryShortcut('y'));
  }
}

function dispatchHistoryShortcut(key) {
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    ctrlKey: true,
    bubbles: true,
    cancelable: true
  }));
}

function installExtraBrushShapes(showToast) {
  const grid = document.getElementById('brush-library-grid');
  if (!grid || grid.dataset.v312ExtraShapes === 'true') return;
  grid.dataset.v312ExtraShapes = 'true';
  const observer = new MutationObserver(() => appendExtraShapeCards(showToast));
  observer.observe(grid, { childList: true });
  appendExtraShapeCards(showToast);
}

function appendExtraShapeCards(showToast) {
  const grid = document.getElementById('brush-library-grid');
  if (!grid) return;
  for (const shape of EXTRA_SHAPES) {
    if (grid.querySelector(`[data-v312-shape="${shape.value}"]`)) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'brush-asset-card v312-extra-shape';
    button.dataset.v312Shape = shape.value;
    button.title = shape.title;
    button.innerHTML = `<span class="brush-asset-thumb">${escapeHtml(shape.symbol)}</span><span class="brush-asset-name">${escapeHtml(shape.name)}</span>`;
    button.addEventListener('click', () => {
      updateActiveLayer({ appearanceMode: 'shape', particleShape: shape.value });
      document.getElementById('brush-library-panel')?.classList.remove('is-open');
      updateExtraShapePreview();
      showToast(`${shape.name} shape selected.`, 'success');
    });
    grid.append(button);
  }
  syncExtraShapeSelection();
}

function updateExtraShapePreview() {
  const layer = getActiveLayer();
  const shape = EXTRA_SHAPES.find((item) => item.value === layer?.particleShape);
  if (!shape) {
    syncExtraShapeSelection();
    return;
  }
  const square = document.getElementById('current-brush-preview-square');
  const name = document.getElementById('current-brush-preview-name');
  if (square) square.textContent = shape.symbol;
  if (name) name.textContent = shape.name;
  syncExtraShapeSelection();
}

function syncExtraShapeSelection() {
  const layer = getActiveLayer();
  document.querySelectorAll('[data-v312-shape]').forEach((button) => {
    button.classList.toggle('is-selected', layer?.appearanceMode === 'shape' && layer?.particleShape === button.dataset.v312Shape);
  });
}

function applyControlLocks() {
  const layer = getActiveLayer();
  const lockIds = new Set();
  if (layer?.engine === 'shockwave') {
    ['speed-min-input', 'speed-max-input', 'gravity-input', 'spread-input', 'emitter-width-input', 'emitter-width-unit-select', 'emitter-rotation-input', 'friction-input', 'orbital-force-input', 'noise-grain-input'].forEach((id) => lockIds.add(id));
  }
  if (layer?.engine === 'true-lensflare') {
    ['speed-min-input', 'speed-max-input', 'gravity-input', 'spread-input', 'emitter-width-input', 'emitter-width-unit-select', 'friction-input', 'orbital-force-input', 'noise-grain-input'].forEach((id) => lockIds.add(id));
  }
  if (layer?.engine === 'ring') {
    ['gravity-input', 'orbital-force-input'].forEach((id) => lockIds.add(id));
  }
  document.querySelectorAll('.control-locked-v312').forEach((label) => label.classList.remove('control-locked-v312'));
  lockIds.forEach((id) => document.getElementById(id)?.closest('label')?.classList.add('control-locked-v312'));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
