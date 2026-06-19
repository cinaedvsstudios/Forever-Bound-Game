import { clamp } from '../core/utils.js';
import { getState, mutate } from '../core/store.js';
import { dom } from './dom.js';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const WHEEL_STEP = 0.1;

let panDrag = null;

export function setupViewport() {
  ensureViewportState();
  dom.stageWrap.addEventListener('wheel', onWheel, { passive: false });
  dom.stageWrap.addEventListener('pointerdown', onViewportPointerDown);
  dom.stageWrap.addEventListener('pointermove', onViewportPointerMove);
  dom.stageWrap.addEventListener('pointerup', finishViewportPointer);
  dom.stageWrap.addEventListener('pointercancel', finishViewportPointer);
}

export function renderViewport() {
  const viewport = ensureViewportState();
  dom.stageViewport.style.transform = `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`;
  dom.stageWrap.dataset.zoom = String(Math.round(viewport.zoom * 100));
}

export function zoomBy(step) {
  setZoom(ensureViewportState().zoom + step);
}

export function resetViewport() {
  mutate('Reset canvas view', (state) => {
    state.viewport = { zoom: 1, panX: 0, panY: 0 };
  }, { record: false });
}

export function fitCanvas() {
  const state = getState();
  const stageBounds = dom.stageWrap.getBoundingClientRect();
  const availableWidth = Math.max(1, stageBounds.width - 44);
  const availableHeight = Math.max(1, stageBounds.height - 44);
  const nominalWidth = Math.min(availableWidth, 1090);
  const nominalHeight = nominalWidth * (state.canvas.height / state.canvas.width);
  const zoom = clamp(Math.min(1, availableHeight / nominalHeight), MIN_ZOOM, MAX_ZOOM);

  mutate('Fit canvas view', (nextState) => {
    nextState.viewport = { zoom: Math.round(zoom * 100) / 100, panX: 0, panY: 0 };
  }, { record: false });
}

function setZoom(value) {
  mutate('Change canvas zoom', (state) => {
    const viewport = state.viewport ?? { zoom: 1, panX: 0, panY: 0 };
    viewport.zoom = clamp(Math.round(value * 100) / 100, MIN_ZOOM, MAX_ZOOM);
    state.viewport = viewport;
  }, { record: false });
}

function onWheel(event) {
  event.preventDefault();
  const direction = event.deltaY < 0 ? 1 : -1;
  const multiplier = event.ctrlKey || event.metaKey ? 1.7 : 1;
  zoomBy(direction * WHEEL_STEP * multiplier);
}

function onViewportPointerDown(event) {
  if (event.button !== 1) return;
  event.preventDefault();
  const viewport = ensureViewportState();
  panDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: viewport.panX,
    originY: viewport.panY
  };
  dom.stageWrap.setPointerCapture?.(event.pointerId);
  dom.stageWrap.classList.add('is-panning');
}

function onViewportPointerMove(event) {
  if (!panDrag || event.pointerId !== panDrag.pointerId) return;
  const nextX = Math.round(panDrag.originX + event.clientX - panDrag.startX);
  const nextY = Math.round(panDrag.originY + event.clientY - panDrag.startY);
  const state = getState();
  state.viewport = { ...ensureViewportState(), panX: nextX, panY: nextY };
  renderViewport();
}

function finishViewportPointer(event) {
  if (!panDrag || event.pointerId !== panDrag.pointerId) return;
  if (dom.stageWrap.hasPointerCapture?.(event.pointerId)) {
    dom.stageWrap.releasePointerCapture(event.pointerId);
  }
  panDrag = null;
  dom.stageWrap.classList.remove('is-panning');
  mutate('Pan canvas workspace', () => {}, { record: false });
}

function ensureViewportState() {
  const state = getState();
  if (!state.viewport) state.viewport = { zoom: 1, panX: 0, panY: 0 };
  return state.viewport;
}
