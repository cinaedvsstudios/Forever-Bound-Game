import { DEFAULT_CANVAS, MAX_HISTORY } from './constants.js';

const DEFAULT_VIEWPORT = Object.freeze({ zoom: 1, panX: 0, panY: 0 });

const state = {
  canvas: { ...DEFAULT_CANVAS },
  viewport: { ...DEFAULT_VIEWPORT },
  title: 'Untitled Scene',
  assets: [],
  layers: [],
  selectedLayerId: null,
  selectedAssetId: null,
  activeTool: 'select',
  showGrid: true,
  showGuides: true,
  history: [],
  future: []
};

const listeners = new Set();

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emit(reason = 'update') {
  listeners.forEach((listener) => listener(state, reason));
}

function snapshot() {
  return structuredClone({
    canvas: state.canvas,
    viewport: state.viewport,
    title: state.title,
    assets: state.assets,
    layers: state.layers,
    selectedLayerId: state.selectedLayerId,
    selectedAssetId: state.selectedAssetId,
    activeTool: state.activeTool,
    showGrid: state.showGrid,
    showGuides: state.showGuides
  });
}

function restore(payload) {
  Object.assign(state, structuredClone(payload));
  state.viewport = { ...DEFAULT_VIEWPORT, ...(state.viewport ?? {}) };
}

export function commit(label = 'Change') {
  state.history.push({ label, payload: snapshot() });
  if (state.history.length > MAX_HISTORY) state.history.shift();
  state.future = [];
  emit('commit');
}

export function mutate(label, mutation, { record = true } = {}) {
  if (record) state.history.push({ label, payload: snapshot() });
  mutation(state);
  if (record) {
    if (state.history.length > MAX_HISTORY) state.history.shift();
    state.future = [];
  }
  emit(label);
}

export function undo() {
  const previous = state.history.pop();
  if (!previous) return false;
  state.future.push({ label: previous.label, payload: snapshot() });
  restore(previous.payload);
  emit('undo');
  return true;
}

export function redo() {
  const next = state.future.pop();
  if (!next) return false;
  state.history.push({ label: next.label, payload: snapshot() });
  restore(next.payload);
  emit('redo');
  return true;
}

export function replaceProject(project) {
  mutate('Open project', () => {
    state.canvas = project.canvas;
    state.viewport = { ...DEFAULT_VIEWPORT, ...(project.viewport ?? {}) };
    state.title = project.title;
    state.assets = project.assets;
    state.layers = project.layers;
    state.selectedLayerId = project.selectedLayerId ?? null;
    state.selectedAssetId = project.selectedAssetId ?? null;
    state.activeTool = 'select';
    state.showGrid = project.showGrid ?? true;
    state.showGuides = project.showGuides ?? true;
  }, { record: false });
  state.history = [];
  state.future = [];
}

export function resetProject() {
  mutate('New scene', () => {
    state.canvas = { ...DEFAULT_CANVAS };
    state.viewport = { ...DEFAULT_VIEWPORT };
    state.title = 'Untitled Scene';
    state.assets = [];
    state.layers = [];
    state.selectedLayerId = null;
    state.selectedAssetId = null;
    state.activeTool = 'select';
    state.showGrid = true;
    state.showGuides = true;
  });
}

export function serializeProject() {
  const { history, future, ...project } = state;
  return structuredClone({ version: 2, app: 'Scene Mockup', ...project });
}

export function getSelectedLayer() {
  return state.layers.find((layer) => layer.id === state.selectedLayerId) ?? null;
}
