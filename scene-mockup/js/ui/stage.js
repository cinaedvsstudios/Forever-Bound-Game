import { getRelativePointer, makeFilterString, clamp } from '../core/utils.js';
import { getState, mutate, getSelectedLayer } from '../core/store.js';
import { dom, toast } from './dom.js';
import { createMaskSession, eraseAt, commitMaskSession } from '../features/eraser.js';

let drag = null;
let eraserSession = null;
let eraserLastPoint = null;

export function setupStage() {
  dom.stage.addEventListener('pointerdown', onStagePointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  dom.stage.addEventListener('keydown', onStageKeyDown);
}

function stagePoint(event) {
  const state = getState();
  const pointer = getRelativePointer(event, dom.stage);
  return {
    x: (pointer.x / pointer.width) * state.canvas.width,
    y: (pointer.y / pointer.height) * state.canvas.height
  };
}

async function onStagePointerDown(event) {
  const target = event.target.closest('[data-layer-id]');
  const state = getState();
  if (!target) {
    if (state.activeTool === 'select') mutate('Clear selection', (nextState) => { nextState.selectedLayerId = null; });
    return;
  }

  const layerId = target.dataset.layerId;
  const layer = state.layers.find((item) => item.id === layerId);
  if (!layer) return;
  mutate('Select layer', (nextState) => { nextState.selectedLayerId = layerId; }, { record: false });
  dom.stage.focus({ preventScroll: true });

  if (state.activeTool === 'eraser') {
    if (layer.locked || layer.kind === 'glb') {
      toast(layer.kind === 'glb' ? 'Eraser is only available on image layers.' : 'Unlock this layer before masking it.', { error: true });
      return;
    }
    try {
      eraserSession = await createMaskSession(layer);
      eraserSession.layerId = layer.id;
      const point = stagePoint(event);
      const local = {
        x: ((point.x - layer.x) / layer.width) * eraserSession.width,
        y: ((point.y - layer.y) / layer.height) * eraserSession.height
      };
      eraserLastPoint = local;
      eraseAt(eraserSession, local, Math.max(8, eraserSession.width * .018));
      drag = { mode: 'erase', layerId };
      target.setPointerCapture?.(event.pointerId);
      renderStage();
    } catch (error) {
      console.error(error);
      toast('Could not start the eraser mask.', { error: true });
    }
    return;
  }

  if (layer.locked) {
    toast('This layer is locked. Unlock it in the Layers stack first.', { error: true });
    return;
  }
  const point = stagePoint(event);
  drag = { mode: 'move', layerId, originX: layer.x, originY: layer.y, startX: point.x, startY: point.y };
  target.setPointerCapture?.(event.pointerId);
}

function onPointerMove(event) {
  if (!drag) return;
  const state = getState();
  const layer = state.layers.find((item) => item.id === drag.layerId);
  if (!layer) return;
  const point = stagePoint(event);

  if (drag.mode === 'move') {
    const x = clamp(Math.round(drag.originX + (point.x - drag.startX)), -layer.width + 1, state.canvas.width - 1);
    const y = clamp(Math.round(drag.originY + (point.y - drag.startY)), -layer.height + 1, state.canvas.height - 1);
    layer.x = x;
    layer.y = y;
    renderStage();
    return;
  }

  if (drag.mode === 'erase' && eraserSession) {
    const local = {
      x: ((point.x - layer.x) / layer.width) * eraserSession.width,
      y: ((point.y - layer.y) / layer.height) * eraserSession.height
    };
    eraseAt(eraserSession, local, Math.max(8, eraserSession.width * .018), eraserLastPoint);
    eraserLastPoint = local;
    renderStage();
  }
}

function onPointerUp() {
  if (!drag) return;
  const state = getState();
  if (drag.mode === 'move') {
    // A single history state after the drag avoids storing every pointer movement.
    state.history.push({ label: 'Move layer', payload: structuredClone({
      canvas: state.canvas, title: state.title, assets: state.assets, layers: state.layers.map((layer) => ({ ...layer, x: layer.id === drag.layerId ? drag.originX : layer.x, y: layer.id === drag.layerId ? drag.originY : layer.y })),
      selectedLayerId: state.selectedLayerId, selectedAssetId: state.selectedAssetId, activeTool: state.activeTool, showGrid: state.showGrid, showGuides: state.showGuides
    }) });
    state.future = [];
  }
  if (drag.mode === 'erase' && eraserSession) {
    const layer = state.layers.find((item) => item.id === drag.layerId);
    if (layer) {
      mutate('Erase image mask', (nextState) => {
        const target = nextState.layers.find((item) => item.id === layer.id);
        target.dataUrl = commitMaskSession(eraserSession);
      });
    }
  }
  drag = null;
  eraserSession = null;
  eraserLastPoint = null;
  mutate('Finish pointer edit', () => {}, { record: false });
  renderStage();
}

function onStageKeyDown(event) {
  const state = getState();
  const layer = getSelectedLayer();
  if (!layer || layer.locked) return;
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Backspace'].includes(event.key)) return;
  if (event.key === 'Delete' || event.key === 'Backspace') return;
  event.preventDefault();
  const step = event.shiftKey ? 10 : 1;
  const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
  mutate('Nudge layer', (nextState) => {
    const target = nextState.layers.find((item) => item.id === layer.id);
    target.x = clamp(target.x + delta[0], -target.width + 1, nextState.canvas.width - 1);
    target.y = clamp(target.y + delta[1], -target.height + 1, nextState.canvas.height - 1);
  });
}

export function renderStage() {
  const state = getState();
  dom.stage.innerHTML = '';
  dom.stage.style.aspectRatio = `${state.canvas.width} / ${state.canvas.height}`;
  dom.stage.classList.toggle('has-grid', state.showGrid);
  dom.stage.classList.toggle('has-guides', state.showGuides);

  state.layers.forEach((layer) => {
    const item = document.createElement('div');
    item.className = `scene-layer${layer.id === state.selectedLayerId ? ' is-selected' : ''}${layer.locked ? ' is-locked' : ''}${!layer.visible ? ' is-hidden' : ''}${state.activeTool === 'eraser' && layer.id === state.selectedLayerId ? ' is-eraser-target' : ''}`;
    item.dataset.layerId = layer.id;
    item.style.left = `${(layer.x / state.canvas.width) * 100}%`;
    item.style.top = `${(layer.y / state.canvas.height) * 100}%`;
    item.style.width = `${(layer.width / state.canvas.width) * 100}%`;
    item.style.height = `${(layer.height / state.canvas.height) * 100}%`;
    item.style.opacity = layer.opacity;
    item.style.mixBlendMode = layer.blendMode;
    item.style.filter = makeFilterString(layer.filters);
    item.style.zIndex = String(state.layers.indexOf(layer) + 1);

    const image = new Image();
    image.src = eraserSession && eraserSession.layerId === layer.id ? eraserSession.canvas.toDataURL() : layer.dataUrl;
    image.alt = layer.name;
    item.append(image);
    dom.stage.append(item);
  });
}
