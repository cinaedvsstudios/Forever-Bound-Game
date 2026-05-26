import {
  deleteActiveLayer,
  duplicateActiveLayer,
  editorState,
  moveActiveLayer,
  onStateChange,
  renameLayer,
  selectLayer,
  showAllLayers,
  soloLayer,
  toggleLayerLock,
  toggleLayerVisibility
} from './editor-state.js';

export function initLayerOrderParity(showToast = () => {}) {
  injectLayerOrderStyles();
  decorateLayerList(showToast);
  onStateChange(() => decorateLayerList(showToast));
}

function injectLayerOrderStyles() {
  if (document.getElementById('layer-order-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'layer-order-parity-style';
  style.textContent = `
    .layer-stack-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 8px;
      align-items: center;
    }
    .layer-stack-toolbar button {
      min-height: 28px;
      padding: 5px 8px;
      font-size: 10px;
    }
    .layer-stack-toolbar .layer-stack-hint {
      margin-left: auto;
      color: var(--muted);
      font-size: 10px;
      white-space: nowrap;
    }
    .layer-item {
      position: relative;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: center;
      cursor: pointer;
    }
    .layer-item.is-hidden {
      opacity: .52;
      border-style: dashed;
    }
    .layer-item.is-locked strong::after {
      content: '  locked';
      color: var(--muted);
      font-size: 9px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .layer-item-main {
      min-width: 0;
      display: grid;
      gap: 3px;
    }
    .layer-item-main strong,
    .layer-item-main span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .layer-item-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .layer-item-actions button {
      min-height: 26px;
      width: 28px;
      padding: 2px 0;
      text-align: center;
      font-size: 10px;
      border-radius: 9px;
    }
    .layer-item-actions button.is-on {
      border-color: var(--module-accent);
      color: var(--module-accent-strong);
      box-shadow: 0 0 10px var(--module-glow);
    }
    .layer-item-actions button.is-danger {
      color: #ffb4c0;
    }
  `;
  document.head.append(style);
}

function decorateLayerList(showToast) {
  const list = document.getElementById('layer-list');
  if (!list) return;
  ensureLayerToolbar(list, showToast);
  const items = Array.from(list.querySelectorAll('.layer-item'));
  if (!editorState.composition.layers.length) return;

  items.forEach((item, index) => {
    const layer = editorState.composition.layers[index];
    if (!layer || item.dataset.layerDecorated === 'true') return;
    item.dataset.layerDecorated = 'true';
    item.classList.toggle('is-hidden', layer.visible === false);
    item.classList.toggle('is-locked', Boolean(layer.locked));

    const strong = item.querySelector('strong');
    const span = item.querySelector('span');
    const title = strong?.textContent || layer.name;
    const meta = span?.textContent || `${layer.engine} · visible`;
    item.innerHTML = `
      <div class="layer-item-main">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(meta)} · order ${index + 1}</span>
      </div>
      <div class="layer-item-actions">
        <button type="button" data-action="up" title="Move layer up in the stack">↑</button>
        <button type="button" data-action="down" title="Move layer down in the stack">↓</button>
        <button type="button" data-action="visible" title="Show or hide this layer">${layer.visible === false ? '○' : '●'}</button>
        <button type="button" data-action="solo" title="Solo this layer / show all again">S</button>
        <button type="button" data-action="lock" title="Lock or unlock editing for this layer">${layer.locked ? '🔒' : '🔓'}</button>
        <button type="button" data-action="rename" title="Rename this layer">✎</button>
      </div>
    `;

    item.addEventListener('click', () => selectLayer(index));
    item.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        runLayerAction(button.dataset.action, index, showToast);
      });
    });

    item.querySelector('[data-action="visible"]')?.classList.toggle('is-on', layer.visible !== false);
    item.querySelector('[data-action="solo"]')?.classList.toggle('is-on', isSolo(index));
    item.querySelector('[data-action="lock"]')?.classList.toggle('is-on', Boolean(layer.locked));
  });
}

function ensureLayerToolbar(list, showToast) {
  if (document.getElementById('layer-stack-toolbar')) return;
  const toolbar = document.createElement('div');
  toolbar.id = 'layer-stack-toolbar';
  toolbar.className = 'layer-stack-toolbar';
  toolbar.innerHTML = `
    <button type="button" data-action="active-up" title="Move selected layer up">Move Up</button>
    <button type="button" data-action="active-down" title="Move selected layer down">Move Down</button>
    <button type="button" data-action="show-all" title="Show all layers">Show All</button>
    <button type="button" data-action="duplicate" title="Duplicate selected layer">Duplicate</button>
    <button type="button" data-action="delete" title="Delete selected layer">Delete</button>
    <span class="layer-stack-hint">top draws last</span>
  `;
  list.before(toolbar);
  toolbar.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => runToolbarAction(button.dataset.action, showToast));
  });
}

function runToolbarAction(action, showToast) {
  if (action === 'active-up') {
    moveActiveLayer(1);
    showToast('Selected layer moved up.', 'success');
  } else if (action === 'active-down') {
    moveActiveLayer(-1);
    showToast('Selected layer moved down.', 'success');
  } else if (action === 'show-all') {
    showAllLayers();
    showToast('All layers visible.', 'success');
  } else if (action === 'duplicate') {
    duplicateActiveLayer();
    showToast('Layer duplicated.', 'success');
  } else if (action === 'delete') {
    deleteActiveLayer();
    showToast('Layer deleted.', 'warn');
  }
}

function runLayerAction(action, index, showToast) {
  selectLayer(index);
  if (action === 'up') {
    moveActiveLayer(1);
    showToast('Layer moved up.', 'success');
  } else if (action === 'down') {
    moveActiveLayer(-1);
    showToast('Layer moved down.', 'success');
  } else if (action === 'visible') {
    toggleLayerVisibility(index);
    showToast('Layer visibility toggled.', 'info');
  } else if (action === 'solo') {
    soloLayer(index);
    showToast(isSolo(index) ? 'Layer soloed.' : 'All layers restored.', 'info');
  } else if (action === 'lock') {
    toggleLayerLock(index);
    showToast('Layer lock toggled.', 'info');
  } else if (action === 'rename') {
    const layer = editorState.composition.layers[index];
    const nextName = prompt('Layer name', layer?.name || 'Effect Layer');
    if (nextName) {
      renameLayer(index, nextName);
      showToast('Layer renamed.', 'success');
    }
  }
}

function isSolo(index) {
  const layers = editorState.composition.layers;
  return layers.length > 1 && layers.every((layer, layerIndex) => layer.visible === (layerIndex === index));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}
