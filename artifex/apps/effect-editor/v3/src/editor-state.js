export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

export const MODULE_THEMES = {
  effects: {
    label: 'Effects',
    accent: '#00aeea',
    accentSoft: 'rgba(0, 174, 234, 0.18)',
    accentStrong: '#27d7ff',
    glow: 'rgba(0, 174, 234, 0.42)'
  },
  archetype: {
    label: 'Archetype',
    accent: '#d84545',
    accentSoft: 'rgba(216, 69, 69, 0.18)',
    accentStrong: '#ff7474',
    glow: 'rgba(216, 69, 69, 0.42)'
  },
  project: {
    label: 'Project',
    accent: '#9dbb3f',
    accentSoft: 'rgba(157, 187, 63, 0.18)',
    accentStrong: '#d9e979',
    glow: 'rgba(157, 187, 63, 0.42)'
  }
};

export const editorState = {
  composition: createEmptyComposition(),
  activeLayerIndex: -1,
  particles: [],
  isPaused: false,
  showGrid: true,
  showHelpers: true,
  workspaceMode: 'dark',
  referenceMedia: createEmptyReferenceMedia(),
  zoom: 1,
  lowPerformanceMode: false,
  moduleTheme: 'effects',
  renderStats: {
    fps: 0,
    particles: 0,
    particleCap: 900,
    performanceMode: 'Full'
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

export function createEmptyReferenceMedia() {
  return {
    type: '',
    name: '',
    dataUrl: '',
    opacity: 0.55,
    visible: false,
    frame: 0
  };
}

export function getDesignWidth() {
  return finiteNumber(editorState.composition?.designWidth, DESIGN_WIDTH);
}

export function getDesignHeight() {
  return finiteNumber(editorState.composition?.designHeight, DESIGN_HEIGHT);
}

export function getDesignSize() {
  return {
    width: getDesignWidth(),
    height: getDesignHeight()
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
    designWidth: finiteNumber(input?.designWidth, DESIGN_WIDTH),
    designHeight: finiteNumber(input?.designHeight, DESIGN_HEIGHT),
    layers: layers.map(normalizeLayer)
  };
}

export function normalizeLayer(layer) {
  const lifetime = finiteNumber(layer.lifetime, 80);
  const normalizedStops = normalizeAppearanceStops(layer.appearanceStops, layer);
  const activeAppearanceStopIndex = clamp(Math.round(finiteNumber(layer.activeAppearanceStopIndex, 0)), 0, Math.max(0, normalizedStops.length - 1));
  const firstStop = normalizedStops[0];
  const lastStop = normalizedStops[normalizedStops.length - 1] || firstStop;

  return {
    id: layer.id || `layer_${cryptoRandom()}`,
    name: layer.name || 'Effect Layer',
    visible: layer.visible !== false,
    locked: Boolean(layer.locked),
    engine: layer.engine || 'particles',
    colorA: firstStop?.color || layer.colorA || '#ffcc66',
    colorB: lastStop?.color || layer.colorB || '#ff6600',
    alphaStart: finiteNumber(firstStop?.opacity, finiteNumber(layer.alphaStart, 1)),
    alphaEnd: finiteNumber(lastStop?.opacity, finiteNumber(layer.alphaEnd, 0)),
    sizeStart: finiteNumber(firstStop?.size, finiteNumber(layer.sizeStart, 20)),
    sizeEnd: finiteNumber(lastStop?.size, finiteNumber(layer.sizeEnd, 4)),
    glow: finiteNumber(firstStop?.glow, finiteNumber(layer.glow, 12)),
    appearanceStops: normalizedStops,
    activeAppearanceStopIndex,
    spawnRate: finiteNumber(layer.spawnRate, 16),
    speedMin: finiteNumber(layer.speedMin, 1.5),
    speedMax: finiteNumber(layer.speedMax, 6),
    angle: finiteNumber(layer.angle, -90),
    spread: finiteNumber(layer.spread, 60),
    gravity: finiteNumber(layer.gravity, 0.04),
    lifetime,
    emitterX: finiteNumber(layer.emitterX, getDesignWidth() / 2),
    emitterY: finiteNumber(layer.emitterY, getDesignHeight() * 0.64),
    appearanceMode: layer.appearanceMode || 'shape',
    particleShape: layer.particleShape || 'circle',
    blendMode: layer.blendMode || defaultBlendMode(layer.engine),
    reverseColor: Boolean(layer.reverseColor),
    rotation: finiteNumber(layer.rotation, 0),
    rotationMode: layer.rotationMode || 'random',
    rotationJitter: finiteNumber(layer.rotationJitter, 5),
    edgeBlur: finiteNumber(layer.edgeBlur, 0),
    textureAlpha: finiteNumber(layer.textureAlpha, 1),
    textureContrast: finiteNumber(layer.textureContrast, 1),
    textureName: layer.textureName || '',
    textureDataUrl: layer.textureDataUrl || '',
    builtInBrush: layer.builtInBrush || 'spark',
    tintMode: layer.tintMode || 'tint',
    textureFit: layer.textureFit || 'contain',
    emitterWidth: finiteNumber(layer.emitterWidth, 0),
    emitterWidthUnit: layer.emitterWidthUnit || 'px',
    emitterRotation: finiteNumber(layer.emitterRotation, 0),
    targetX: finiteNumber(layer.targetX, getDesignWidth() / 2),
    targetY: finiteNumber(layer.targetY, getDesignHeight() / 2),
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
  if (!layer || layer.locked) return;
  Object.assign(layer, patch);
  if (patch.appearanceStops) {
    layer.appearanceStops = normalizeAppearanceStops(patch.appearanceStops, layer);
    layer.activeAppearanceStopIndex = clamp(Math.round(finiteNumber(layer.activeAppearanceStopIndex, 0)), 0, Math.max(0, layer.appearanceStops.length - 1));
    syncLegacyAppearanceFields(layer);
  }
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function setLayerVisibility(index, visible) {
  const layer = editorState.composition.layers[index];
  if (!layer) return;
  layer.visible = Boolean(visible);
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function toggleLayerVisibility(index = editorState.activeLayerIndex) {
  const layer = editorState.composition.layers[index];
  if (!layer) return;
  layer.visible = layer.visible === false;
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function toggleLayerLock(index = editorState.activeLayerIndex) {
  const layer = editorState.composition.layers[index];
  if (!layer) return;
  layer.locked = !layer.locked;
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function showAllLayers() {
  for (const layer of editorState.composition.layers) layer.visible = true;
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function soloLayer(index = editorState.activeLayerIndex) {
  const layers = editorState.composition.layers;
  if (index < 0 || index >= layers.length) return;
  const alreadySolo = layers.every((layer, layerIndex) => layer.visible === (layerIndex === index));
  if (alreadySolo) {
    for (const layer of layers) layer.visible = true;
  } else {
    layers.forEach((layer, layerIndex) => {
      layer.visible = layerIndex === index;
    });
    editorState.activeLayerIndex = index;
  }
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function moveLayer(fromIndex, toIndex) {
  const layers = editorState.composition.layers;
  if (fromIndex < 0 || fromIndex >= layers.length) return;
  const nextIndex = clamp(Math.round(toIndex), 0, layers.length - 1);
  if (nextIndex === fromIndex) return;
  const [layer] = layers.splice(fromIndex, 1);
  layers.splice(nextIndex, 0, layer);
  if (editorState.activeLayerIndex === fromIndex) {
    editorState.activeLayerIndex = nextIndex;
  } else if (editorState.activeLayerIndex > fromIndex && editorState.activeLayerIndex <= nextIndex) {
    editorState.activeLayerIndex -= 1;
  } else if (editorState.activeLayerIndex < fromIndex && editorState.activeLayerIndex >= nextIndex) {
    editorState.activeLayerIndex += 1;
  }
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function moveActiveLayer(delta) {
  moveLayer(editorState.activeLayerIndex, editorState.activeLayerIndex + delta);
}

export function renameLayer(index, name) {
  const layer = editorState.composition.layers[index];
  const nextName = String(name || '').trim();
  if (!layer || !nextName || layer.locked) return;
  layer.name = nextName;
  editorState.composition.updatedAt = new Date().toISOString();
  notifyChange();
}

export function setDesignSize(width, height, options = {}) {
  const oldWidth = getDesignWidth();
  const oldHeight = getDesignHeight();
  const nextWidth = clamp(finiteNumber(width, oldWidth), 320, 4096);
  const nextHeight = clamp(finiteNumber(height, oldHeight), 180, 4096);
  const scaleX = nextWidth / oldWidth;
  const scaleY = nextHeight / oldHeight;

  editorState.composition.designWidth = Math.round(nextWidth);
  editorState.composition.designHeight = Math.round(nextHeight);
  editorState.composition.updatedAt = new Date().toISOString();

  if (options.scaleContent) {
    for (const layer of editorState.composition.layers) {
      layer.emitterX = finiteNumber(layer.emitterX, oldWidth / 2) * scaleX;
      layer.emitterY = finiteNumber(layer.emitterY, oldHeight / 2) * scaleY;
      layer.targetX = finiteNumber(layer.targetX, oldWidth / 2) * scaleX;
      layer.targetY = finiteNumber(layer.targetY, oldHeight / 2) * scaleY;
      if (layer.emitterWidthUnit !== 'percent') {
        layer.emitterWidth = finiteNumber(layer.emitterWidth, 0) * ((scaleX + scaleY) / 2);
      }
    }
  } else {
    for (const layer of editorState.composition.layers) {
      layer.emitterX = clamp(finiteNumber(layer.emitterX, nextWidth / 2), 0, nextWidth);
      layer.emitterY = clamp(finiteNumber(layer.emitterY, nextHeight / 2), 0, nextHeight);
      layer.targetX = clamp(finiteNumber(layer.targetX, nextWidth / 2), 0, nextWidth);
      layer.targetY = clamp(finiteNumber(layer.targetY, nextHeight / 2), 0, nextWidth);
    }
  }

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
  clone.locked = false;
  editorState.composition.layers.splice(editorState.activeLayerIndex + 1, 0, clone);
  editorState.activeLayerIndex += 1;
  notifyChange();
}

export function centerActiveEmitter() {
  updateActiveLayer({ emitterX: getDesignWidth() / 2, emitterY: getDesignHeight() / 2 });
}

export function moveActiveEmitter(x, y) {
  const layer = getActiveLayer();
  if (layer?.locked) return;
  updateActiveLayer({
    emitterX: clamp(Number(x), 0, getDesignWidth()),
    emitterY: clamp(Number(y), 0, getDesignHeight())
  });
}

export function setPaused(value) {
  editorState.isPaused = Boolean(value);
  notifyChange();
}

export function setWorkspaceMode(mode) {
  const normalized = mode === 'reference' ? 'underlay' : mode;
  editorState.workspaceMode = ['dark', 'white', 'underlay'].includes(normalized) ? normalized : 'dark';
  if (editorState.workspaceMode === 'underlay') {
    editorState.referenceMedia.visible = Boolean(editorState.referenceMedia?.dataUrl);
  }
  notifyChange();
}

export function setReferenceMedia(patch) {
  editorState.referenceMedia = {
    ...createEmptyReferenceMedia(),
    ...(editorState.referenceMedia || {}),
    ...patch
  };
  notifyChange();
}

export function setZoom(value) {
  editorState.zoom = clamp(Number(value), 0.4, 3);
  notifyChange();
}

export function setLowPerformanceMode(value) {
  editorState.lowPerformanceMode = Boolean(value);
  editorState.renderStats.performanceMode = editorState.lowPerformanceMode ? 'Low' : 'Full';
  editorState.renderStats.particleCap = editorState.lowPerformanceMode ? 260 : 900;
  if (editorState.particles.length > editorState.renderStats.particleCap) {
    editorState.particles = editorState.particles.slice(-editorState.renderStats.particleCap);
  }
  notifyChange();
}

export function toggleLowPerformanceMode() {
  setLowPerformanceMode(!editorState.lowPerformanceMode);
}

export function setModuleTheme(themeName) {
  editorState.moduleTheme = MODULE_THEMES[themeName] ? themeName : 'effects';
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

function normalizeAppearanceStops(stops, layer = {}) {
  const fallback = createDefaultAppearanceStops(layer);
  const rawStops = Array.isArray(stops) && stops.length ? stops : fallback;
  const mapped = rawStops.slice(0, 5).map((stop, index) => ({
    id: stop.id || `stop_${index + 1}_${cryptoRandom()}`,
    position: snap01(finiteNumber(stop.position, index / Math.max(1, rawStops.length - 1))),
    color: normalizeHex(stop.color || (index === 0 ? layer.colorA : layer.colorB) || '#ffcc66'),
    opacity: clamp(finiteNumber(stop.opacity, index === 0 ? finiteNumber(layer.alphaStart, 1) : finiteNumber(layer.alphaEnd, 0)), 0, 1),
    size: clamp(finiteNumber(stop.size, index === 0 ? finiteNumber(layer.sizeStart, 20) : finiteNumber(layer.sizeEnd, 4)), 0, 180),
    glow: clamp(finiteNumber(stop.glow, index === 0 ? finiteNumber(layer.glow, 12) : 0), 0, 80)
  })).sort((a, b) => a.position - b.position);

  if (!mapped.length) return fallback;
  mapped[0].position = 0;
  if (mapped.length > 1) mapped[mapped.length - 1].position = 1;

  for (let index = 1; index < mapped.length - 1; index += 1) {
    const min = mapped[index - 1].position + 0.1;
    const max = mapped[index + 1].position - 0.1;
    mapped[index].position = snap01(clamp(mapped[index].position, min, max));
  }

  return mapped;
}

function createDefaultAppearanceStops(layer = {}) {
  return [
    {
      id: `stop_start_${cryptoRandom()}`,
      position: 0,
      color: normalizeHex(layer.colorA || '#ffcc66'),
      opacity: clamp(finiteNumber(layer.alphaStart, 1), 0, 1),
      size: clamp(finiteNumber(layer.sizeStart, 20), 0, 180),
      glow: clamp(finiteNumber(layer.glow, 12), 0, 80)
    },
    {
      id: `stop_end_${cryptoRandom()}`,
      position: 1,
      color: normalizeHex(layer.colorB || '#ff6600'),
      opacity: clamp(finiteNumber(layer.alphaEnd, 0), 0, 1),
      size: clamp(finiteNumber(layer.sizeEnd, 4), 0, 180),
      glow: 0
    }
  ];
}

function syncLegacyAppearanceFields(layer) {
  const stops = normalizeAppearanceStops(layer.appearanceStops, layer);
  const first = stops[0];
  const last = stops[stops.length - 1] || first;
  layer.colorA = first.color;
  layer.colorB = last.color;
  layer.alphaStart = first.opacity;
  layer.alphaEnd = last.opacity;
  layer.sizeStart = first.size;
  layer.sizeEnd = last.size;
  layer.glow = first.glow;
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

function normalizeHex(value) {
  const string = String(value || '').trim();
  if (/^#[0-9a-f]{6}$/iu.test(string)) return string;
  if (/^#[0-9a-f]{3}$/iu.test(string)) {
    return `#${string.slice(1).split('').map((char) => char + char).join('')}`;
  }
  return '#ffcc66';
}

function snap01(value) {
  return clamp(Math.round(Number(value) * 10) / 10, 0, 1);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
