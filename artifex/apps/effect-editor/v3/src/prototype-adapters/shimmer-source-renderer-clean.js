import { SHIMMER_PRESETS, clonePreset } from '../../../fx-shimmer/src/presets.js?v=1.40';
import { ShimmerDistortionEngine } from '../../../fx-shimmer/src/shimmer-engine-wormhole-range.js?v=1.42';

const rendererCache = new Map();
const ASSET_ROOT = './fx-shimmer/assets/';
const DEFAULT_WORMHOLE_ARM_TEXTURE = 'default1.jpg';
const SOURCE_DEFAULTS_VERSION = 'shimmer-source-clean-0.2.32';

export function isSourceShimmerLayer(layer) {
  return Boolean(layer && (layer.engine === 'prototype-shimmer' || layer.prototypeFolder === 'fx-shimmer'));
}

export function drawSourceShimmerLayer(ctx, layer, scaleValue = 1, timeMs = 0, stage = {}) {
  if (!isSourceShimmerLayer(layer) || layer.visible === false) return false;
  const stageWidth = Number(stage.width) || 1280;
  const stageHeight = Number(stage.height) || 720;
  const entry = getRendererEntry(layer.id || layer.name || 'source-shimmer-layer');
  const values = valuesFromLayer(layer, stageWidth, stageHeight);
  entry.engine.setValues(values);
  ensureDefaultAssets(entry, values);
  entry.engine.draw((Number(timeMs) || 0) / 1000);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(entry.canvas, 0, 0, stageWidth * scaleValue, stageHeight * scaleValue);
  ctx.restore();
  return true;
}

function getRendererEntry(key) {
  const cacheKey = String(key);
  if (rendererCache.has(cacheKey)) return rendererCache.get(cacheKey);
  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = 960;
  previewCanvas.height = 540;
  const engine = new ShimmerDistortionEngine(previewCanvas);
  const entry = { canvas: previewCanvas, engine, textureAsset: '', overlayAsset: '', overlay2Asset: '', outlineAsset: '' };
  rendererCache.set(cacheKey, entry);
  return entry;
}

function valuesFromLayer(layer, stageWidth, stageHeight) {
  const preset = presetForLayer(layer);
  const base = clonePreset(preset).values;
  if (normalizeType(base.type || typeFromMode(layer.prototypeMode)) === 'wormhole') base.radius = 20;
  const staleLayer = layer.prototypeShimmerSourceMapVersion !== SOURCE_DEFAULTS_VERSION;
  if (staleLayer) migrateLayerToSourceDefaults(layer, base, stageWidth, stageHeight);
  const values = staleLayer ? { ...base, ...preservedLayerFields(layer, stageWidth, stageHeight) } : { ...base, ...layer };
  values.type = normalizeType(values.type || typeFromMode(values.prototypeMode) || base.type || 'ring');
  values.showGrid = false;
  values.showMask = false;
  values.backdropColor = '#000000';
  values.positionX = finite(values.positionX, finite(values.emitterX, stageWidth * 0.5) / stageWidth * 100);
  values.positionY = finite(values.positionY, finite(values.emitterY, stageHeight * 0.5) / stageHeight * 100);
  if (values.type === 'wormhole' && values.baseTextureEnabled !== false && !values.textureAssetPath && !values.textureDataUrl) {
    values.baseTextureEnabled = true;
    values.textureAssetPath = `${ASSET_ROOT}${DEFAULT_WORMHOLE_ARM_TEXTURE}`;
  }
  return values;
}

function preservedLayerFields(layer, stageWidth, stageHeight) {
  const emitterX = finite(layer.emitterX, stageWidth * 0.5);
  const emitterY = finite(layer.emitterY, stageHeight * 0.5);
  return {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    locked: layer.locked,
    engine: layer.engine,
    prototypeFolder: layer.prototypeFolder,
    prototypeMode: layer.prototypeMode,
    syncGroup: layer.syncGroup,
    emitterX,
    emitterY,
    positionX: finite(layer.positionX, emitterX / stageWidth * 100),
    positionY: finite(layer.positionY, emitterY / stageHeight * 100),
    prototypeShimmerSourceMapVersion: SOURCE_DEFAULTS_VERSION
  };
}

function migrateLayerToSourceDefaults(layer, base, stageWidth, stageHeight) {
  if (!layer || layer.__shimmerSourceMigrationQueued) return;
  layer.__shimmerSourceMigrationQueued = true;
  window.setTimeout(() => {
    Object.assign(layer, base, preservedLayerFields(layer, stageWidth, stageHeight));
    delete layer.__shimmerSourceMigrationQueued;
  }, 0);
}

function presetForLayer(layer) {
  const mode = layer.prototypeMode || '';
  const type = normalizeType(layer.type || typeFromMode(mode));
  const byMode = SHIMMER_PRESETS.find((preset) => preset.id === mode);
  if (byMode) return byMode;
  const byType = SHIMMER_PRESETS.find((preset) => preset.values?.type === type);
  return byType || SHIMMER_PRESETS[0];
}

function ensureDefaultAssets(entry, values) {
  const texturePath = values.textureAssetPath || (values.baseTextureEnabled && values.type === 'wormhole' ? `${ASSET_ROOT}${DEFAULT_WORMHOLE_ARM_TEXTURE}` : '');
  if (texturePath && texturePath !== entry.textureAsset) {
    entry.textureAsset = texturePath;
    loadImage(texturePath, (image) => entry.engine.setTextureImage(image));
  }
  if (!texturePath && entry.textureAsset) {
    entry.textureAsset = '';
    entry.engine.setTextureImage(null);
  }
}

function loadImage(path, callback) {
  const image = new Image();
  image.onload = () => callback(image);
  image.onerror = () => callback(null);
  image.src = path;
}

function typeFromMode(mode) {
  if (mode === 'wormhole-tunnel') return 'wormhole';
  if (mode === 'heat-shimmer') return 'heat';
  if (mode === 'transition-tear') return 'transition';
  return 'ring';
}

function normalizeType(type) {
  if (['ring', 'wormhole', 'heat', 'transition'].includes(type)) return type;
  return typeFromMode(type);
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
