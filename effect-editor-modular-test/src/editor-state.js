export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

export const editorState = {
  composition: createEmptyComposition(),
  activeLayerIndex: -1,
  particles: [],
  isPaused: false,
  showGrid: true,
  showHelpers: true,
  workspaceMode: 'dark',
  zoom: 1,
  renderStats: {
    fps: 0,
    particles: 0
  }
};

export function createEmptyComposition() {
  return {
    id: `fx_${Date.now().toString(36)}`,
    name: 'Untitled Effect Archetype',
    designWidth: DESIGN_WIDTH,
    designHeight: DESIGN_HEIGHT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    layers: []
  };
}

export function resetComposition() {
  editorState.composition = createEmptyComposition();
  editorState.activeLayerIndex = -1;
  editorState.particles = [];
  notifyChange();
}

export function loadComposition(composition) {
  editorState.composition = normalizeComposition(composition);
  editorState.activeLayerIndex = editorState.composition.layers.length ? 0 : -1;
  editorState.particles = [];
  notifyChange();
}

export function normalizeComposition(input) {
  const base = createEmptyComposition();
  const layers = Array.isArray(input?.layers) ? input.layers : [];
  return {
    ...base,
    ...input,
    designWidth: input?.designWidth || DESIGN_WIDTH,
    designHeight: input?.designHeight || DESIGN_HEIGHT,
    layers: layers.map(normalizeLayer)
  };
}

export function normalizeLayer(layer) {
  const lifetime = finiteNumber(layer.lifetime, 80);
  return {
    id: layer.id || `layer_${cryptoRandom()}`,
    name: layer.name || 'Effect Layer',
    visible: layer.visible !== false,
    engine: layer.engine || 'particles',
    colorA: layer.colorA || '#ffcc66',
    colorB: layer.colorB || '#ff6600',
    alphaStart: finiteNumber(layer.alphaStart, 1),
    alphaEnd: finiteNumber(layer.alphaEnd, 0),
    sizeStart: finiteNumber(layer.sizeStart, 20),
    sizeEnd: finiteNumber(layer.sizeEnd, 4),
    glow: finiteNumber(layer.glow, 12),
    spawnRate: finiteNumber(layer.spawnRate, 16),
    speedMin: finiteNumber(layer.speedMin, 1.5),
    speedMax: finiteNumber(layer.speedMax, 6),
    angle: finiteNumber(layer.angle, -90),
    spread: finiteNumber(layer.spread, 60),
    gravity: finiteNumber(layer.gravity, 0.04),
    lifetime,
    emitterX: finiteNumber(layer.emitterX, DESIGN_WIDTH / 2),
    emitterY: finiteNumber(layer.emitterY, DESIGN_HEIGHT * 0.64),
    appearanceMode: layer.appearanceMode || 'shape',
    particleShape: layer.particleShape || 'circle',
    blendMode: layer.blendMode || defaultBlendMode(layer.engine),
    reverseColor: Boolean(layer.reverseColor),
    rotation: finiteNumber(layer.rotation, 0),
    edgeBlur: finiteNumber(layer.edgeBlur, 0),
    textureAlpha: finiteNumber(layer.textureAlpha, 1),
    textureName: layer.textureName || '',
    textureDataUrl: layer.textureDataUrl || '',
    emitterWidth: finiteNumber(layer.emitterWidth, 0),
    emitterWidthUnit: layer.emitterWidthUnit || 'px',
    emitterRotation: finiteNumber(layer.emitterRotation, 0),
    targetX: finiteNumber(layer.targetX, DESIGN_WIDTH / 2),
    targetY: finiteNumber(layer.targetY, DESIGN_HEIGHT / 2),
    reverseNearTarget: Boolean(layer.reverseNearTarget),
    friction: finiteNumber(layer.friction, 0),
    orbitalForce: finiteNumber(layer.orbitalForce, 0),
    lifetimeMin: finiteNumber(layer.lifetimeMin, Math.max(4, lifetime * 0.75)),
    lifetimeMax: finiteNumber(layer.lifetimeMax, Math.max(4, lifetime * 1.25)),
    noiseGrain: finiteNumber(layer.noiseGrain, 0)
  };
}

export function addLayer(layerConfig) {
  const layer = normalizeLayer({
    ...layerConfig,
    id: `layer_${cryptoRandom()}`
  });
  editorState.composition.layers.push(layer);
  editorState.activeLayerIndex = editorState.composition.layers.length - 1;
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
  return layer;
}

export function addLayers(layers) {
  for (const layer of layers) {
    addLayer(layer);
  }
  notifyChange();
}

export function getActiveLayer() {
  return editorState.composition.layers[editorState.activeLayerIndex] || null;
}

export function selectLayer(index) {
  if (index < 0 || index >= editorState.composition.layers.length) return;
  editorState.activeLayerIndex = index;
  notifyChange();
}

export function updateActiveLayer(patch) {
  const layer = getActiveLayer();
  if (!layer) return;
  Object.assign(layer, patch);
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function deleteActiveLayer() {
  if (editorState.activeLayerIndex < 0) return;
  editorState.composition.layers.splice(editorState.activeLayerIndex, 1);
  editorState.activeLayerIndex = Math.min(editorState.activeLayerIndex, editorState.composition.layers.length - 1);
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function duplicateActiveLayer() {
  const layer = getActiveLayer();
  if (!layer) return;
  const clone = normalizeLayer(JSON.parse(JSON.stringify(layer)));
  clone.id = `layer_${cryptoRandom()}`;
  clone.name = `${layer.name} Copy`;
  editorState.composition.layers.splice(editorState.activeLayerIndex + 1, 0, clone);
  editorState.activeLayerIndex += 1;
  notifyChange();
}

export function centerActiveEmitter() {
  updateActiveLayer({ emitterX: DESIGN_WIDTH / 2, emitterY: DESIGN_HEIGHT / 2 });
}

export function moveActiveEmitter(x, y) {
  updateActiveLayer({
    emitterX: clamp(Number(x), 0, DESIGN_WIDTH),
    emitterY: clamp(Number(y), 0, DESIGN_HEIGHT)
  });
}

export function setPaused(value) {
  editorState.isPaused = Boolean(value);
  notifyChange();
}

export function setWorkspaceMode(mode) {
  editorState.workspaceMode = mode === 'white' ? 'white' : 'dark';
  notifyChange();
}

export function setZoom(value) {
  editorState.zoom = clamp(Number(value), 0.4, 3);
  notifyChange();
}

export function toggleGrid() {
  editorState.showGrid = !editorState.showGrid;
  notifyChange();
}

export function toggleHelpers() {
  editorState.showHelpers = !editorState.showHelpers;
  notifyChange();
}

export function clearParticles() {
  editorState.particles = [];
  notifyChange();
}

export function serializeComposition() {
  return JSON.stringify(editorState.composition, null, 2);
}

let changeListeners = [];

export function onStateChange(listener) {
  changeListeners.push(listener);
  return () => {
    changeListeners = changeListeners.filter((item) => item !== listener);
  };
}

export function notifyChange() {
  for (const listener of changeListeners) {
    listener(editorState);
  }
}

function defaultBlendMode(engine) {
  return engine === 'gas' || engine === 'refraction' ? 'source-over' : 'lighter';
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function cryptoRandom() {
  if (globalThis.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0].toString(36);
  }
  return Math.random().toString(36).slice(2);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
