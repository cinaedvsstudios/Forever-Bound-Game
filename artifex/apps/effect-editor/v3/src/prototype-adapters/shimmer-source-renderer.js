import { SHIMMER_PRESETS, clonePreset } from '../../../fx-shimmer/src/presets.js?v=1.40';
import { ShimmerDistortionEngine } from '../../../fx-shimmer/src/shimmer-engine.js?v=1.40';

const rendererCache = new Map();
const ASSET_ROOT = './fx-shimmer/assets/';
const DEFAULT_WORMHOLE_ARM_TEXTURE = 'default1.jpg';
const SOURCE_DEFAULTS_VERSION = 'shimmer-source-map-0.2.22';
const TAU = Math.PI * 2;

export function isSourceShimmerLayer(layer) {
  return Boolean(layer && (layer.engine === 'prototype-shimmer' || layer.prototypeFolder === 'fx-shimmer'));
}

export function drawSourceShimmerLayer(ctx, layer, scaleValue = 1, timeMs = 0, stage = {}) {
  if (!isSourceShimmerLayer(layer) || layer.visible === false) return false;
  const stageWidth = Number(stage.width) || 1280;
  const stageHeight = Number(stage.height) || 720;
  const key = layer.id || layer.name || 'source-shimmer-layer';
  const entry = getRendererEntry(key);
  const values = valuesFromLayer(layer, stageWidth, stageHeight);
  const t = (Number(timeMs) || 0) / 1000;
  if (values.type === 'heat') drawHeatBackgroundWarp(ctx, values, scaleValue, stageWidth, stageHeight, t);
  entry.engine.setValues(values);
  ensureDefaultAssets(entry, values);
  entry.engine.draw(t);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(entry.canvas, 0, 0, stageWidth * scaleValue, stageHeight * scaleValue);
  ctx.restore();
  if (values.type === 'wormhole') drawWormholeExtendedIntensity(ctx, values, scaleValue, stageWidth, stageHeight, t);
  return true;
}

function getRendererEntry(key) {
  const cacheKey = String(key);
  if (rendererCache.has(cacheKey)) return rendererCache.get(cacheKey);
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  const engine = new ShimmerDistortionEngine(canvas);
  const entry = { canvas, engine, textureAsset: '', overlayAsset: '', overlay2Asset: '', outlineAsset: '' };
  rendererCache.set(cacheKey, entry);
  return entry;
}

function valuesFromLayer(layer, stageWidth, stageHeight) {
  const preset = presetForLayer(layer);
  const base = clonePreset(preset).values;
  const staleSourceMapLayer = layer.prototypeShimmerSourceMapVersion !== SOURCE_DEFAULTS_VERSION;
  if (staleSourceMapLayer) migrateLayerToSourceDefaults(layer, base, stageWidth, stageHeight);
  const values = staleSourceMapLayer
    ? { ...base, ...preservedLayerFields(layer, stageWidth, stageHeight) }
    : { ...base, ...layer };
  values.type = normalizeType(values.type || typeFromMode(values.prototypeMode) || base.type || 'ring');
  values.showGrid = false;
  values.showMask = false;
  values.backdropColor = '#000000';
  values.positionX = finite(values.positionX, finite(values.emitterX, stageWidth * 0.5) / stageWidth * 100);
  values.positionY = finite(values.positionY, finite(values.emitterY, stageHeight * 0.5) / stageHeight * 100);
  values.__uiOrbitCloudAmount = finite(layer.orbitCloudAmount, finite(base.orbitCloudAmount, 0));
  values.__uiOrbitCloudOpacity = finite(layer.orbitCloudOpacity, finite(base.orbitCloudOpacity, 0));
  values.__uiOrbitCloudSize = finite(layer.orbitCloudSize, finite(base.orbitCloudSize, 60));
  values.__uiParticleOpacity = finite(layer.particleOpacity, finite(base.particleOpacity, 0));
  values.__uiEmissionOpacity = finite(layer.emissionOpacity, finite(base.emissionOpacity, 0));
  values.__uiEmissionTrailOpacity = finite(layer.emissionTrailOpacity, finite(base.emissionTrailOpacity, 0));
  if (values.type === 'wormhole' && values.baseTextureEnabled !== false && !values.textureAssetPath && !values.textureDataUrl) {
    values.baseTextureEnabled = true;
    values.textureAssetPath = `${ASSET_ROOT}${DEFAULT_WORMHOLE_ARM_TEXTURE}`;
  }
  applySourceRenderBoosts(values);
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

function applySourceRenderBoosts(values) {
  if (values.type !== 'wormhole') return;
  values.particleOpacity = finite(values.particleOpacity, 0) * 2.35;
  values.emissionOpacity = finite(values.emissionOpacity, 0) * 2.35;
  values.emissionTrailOpacity = finite(values.emissionTrailOpacity, 0) * 2.35;
}

function drawWormholeExtendedIntensity(ctx, values, scaleValue, stageWidth, stageHeight, t) {
  const cloudAmount = clamp(finite(values.__uiOrbitCloudAmount, 0), 0, 200);
  const cloudOpacity = clamp(finite(values.__uiOrbitCloudOpacity, 0), 0, 200);
  const cloudSize = clamp(finite(values.__uiOrbitCloudSize, 60), 0, 200);
  const extraCloudPower = Math.max(cloudAmount, cloudOpacity, cloudSize) / 200;
  if (extraCloudPower > 0.01) drawWormholeExtraClouds(ctx, values, scaleValue, stageWidth, stageHeight, t, cloudAmount, cloudOpacity, cloudSize);
  drawWormholeExtraParticles(ctx, values, scaleValue, stageWidth, stageHeight, t);
}

function drawWormholeExtraClouds(ctx, values, scaleValue, stageWidth, stageHeight, t, cloudAmount, cloudOpacity, cloudSize) {
  const cx = stageWidth * scaleValue * finite(values.positionX, 50) / 100;
  const cy = stageHeight * scaleValue * finite(values.positionY, 50) / 100;
  const base = Math.min(stageWidth, stageHeight) * scaleValue * scaleRange(0.08, 0.62, finite(values.radius, 56) / 100);
  const rx = Math.max(8, base * finite(values.scaleX, 118) / 100);
  const ry = Math.max(8, base * finite(values.scaleY, 90) / 100);
  const radiusControl = clamp(finite(values.orbitCloudRadius, 60) / 100, 0, 2);
  const stagger = clamp(finite(values.orbitCloudStagger, 42) / 100, 0, 2);
  const speed = Math.pow(clamp(finite(values.orbitCloudSpeed, 24) / 100, 0, 2), 2) * 0.48;
  const gamma = scaleRange(1, 3.0, clamp(finite(values.orbitCloudGamma, 0) / 100, 0, 1));
  const amountRatio = clamp(cloudAmount / 200, 0, 1);
  const opacityRatio = clamp(cloudOpacity / 200, 0, 1);
  const sizeRatio = clamp(cloudSize / 200, 0, 1);
  const count = Math.round(scaleRange(0, 96, amountRatio));
  if (count <= 0 || opacityRatio <= 0.001 || sizeRatio <= 0.001) return;
  const thickness = base * scaleRange(0.018, 0.19, sizeRatio);
  const blur = scaleRange(5, 22, sizeRatio) + scaleRange(0, 30, clamp(finite(values.orbitCloudExtraBlur, 0) / 100, 0, 1));
  const dir = finite(values.swirl, 80) >= 0 ? 1 : -1;
  const seedBase = seedFromString(`${values.id || values.name || 'wormhole'}-visible-clouds`);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.filter = `blur(${blur}px)`;
  for (let index = 0; index < count; index += 1) {
    const rand = seeded(seedBase + index * 1009);
    const orbit = TAU * (index / Math.max(1, count)) + rand() * 0.8 + t * speed * dir * scaleRange(0.45, 1.55, rand());
    const localRadius = scaleRange(0.34, 1.56, radiusControl) * scaleRange(Math.max(0.06, 1 - stagger * 0.75), 1 + stagger * 1.25, rand());
    const wobble = Math.sin(t * speed * 2.2 + index) * base * scaleRange(0.02, 0.11, stagger);
    const x = cx + Math.cos(orbit) * (rx * localRadius + wobble);
    const y = cy + Math.sin(orbit) * (ry * localRadius * 0.88 + wobble * 0.68);
    const major = thickness * scaleRange(1.1, 5.8, rand());
    const minor = major * scaleRange(0.28, 0.68, rand());
    const colour = index % 4 === 0 ? values.accentColor : (index % 2 === 0 ? values.coreColor : values.rimColor);
    const alpha = Math.min(0.82, scaleRange(0.06, 0.56, opacityRatio) * gamma * scaleRange(0.34, 1.18, rand()));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(orbit + Math.PI / 2 + (rand() - 0.5) * 1.2);
    ctx.fillStyle = rgba(colour, alpha);
    ctx.beginPath();
    ctx.ellipse(0, 0, major, minor, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawWormholeExtraParticles(ctx, values, scaleValue, stageWidth, stageHeight, t) {
  const particleOpacity = clamp(finite(values.__uiParticleOpacity, 0), 0, 200);
  const emissionOpacity = clamp(Math.max(finite(values.__uiEmissionOpacity, 0), finite(values.__uiEmissionTrailOpacity, 0)), 0, 200);
  const particlePower = Math.max(0, (particleOpacity - 100) / 100);
  const emissionPower = Math.max(0, (emissionOpacity - 100) / 100);
  if (particlePower <= 0.001 && emissionPower <= 0.001) return;
  const cx = stageWidth * scaleValue * finite(values.positionX, 50) / 100;
  const cy = stageHeight * scaleValue * finite(values.positionY, 50) / 100;
  const base = Math.min(stageWidth, stageHeight) * scaleValue * scaleRange(0.08, 0.62, finite(values.radius, 56) / 100);
  const rx = Math.max(8, base * finite(values.scaleX, 118) / 100);
  const ry = Math.max(8, base * finite(values.scaleY, 90) / 100);
  const count = Math.round(20 * particlePower + 28 * emissionPower);
  const seedBase = seedFromString(`${values.id || values.name || 'wormhole'}-visible-particles`);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let index = 0; index < count; index += 1) {
    const rand = seeded(seedBase + index * 1231);
    const phase = (t * scaleRange(0.12, 0.55, rand()) + rand()) % 1;
    const angle = rand() * TAU + Math.sin(t + index) * 0.18;
    const radius = scaleRange(0.18, 1.2, rand());
    const pull = emissionPower > particlePower ? (1 - phase) : phase;
    const x = cx + Math.cos(angle) * rx * radius * pull;
    const y = cy + Math.sin(angle) * ry * radius * 0.88 * pull;
    const size = scaleRange(1.2, 5.8, rand()) * (1 + emissionPower * 0.7);
    const colour = index % 5 === 0 ? values.accentColor : (index % 2 === 0 ? values.coreColor : values.rimColor);
    const alpha = Math.min(0.72, (0.18 + rand() * 0.40) * Math.sin(phase * Math.PI) * Math.max(particlePower, emissionPower));
    ctx.fillStyle = rgba(colour, alpha);
    ctx.shadowColor = colour;
    ctx.shadowBlur = size * scaleRange(1, 5.5, clamp(finite(values.particleGlow, 20) / 100, 0, 1));
    ctx.beginPath();
    ctx.arc(x, y, size, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawHeatBackgroundWarp(ctx, values, scaleValue, stageWidth, stageHeight, t) {
  const localWidth = stageWidth * scaleValue;
  const localHeight = stageHeight * scaleValue;
  const transform = ctx.getTransform();
  const canvas = ctx.canvas;
  const ratioX = Math.hypot(transform.a, transform.b) || 1;
  const ratioY = Math.hypot(transform.c, transform.d) || ratioX;
  const base = Math.min(localWidth, localHeight) * scaleRange(0.08, 0.62, finite(values.radius, 86) / 100);
  const cx = localWidth * finite(values.positionX, 50) / 100;
  const cy = localHeight * finite(values.positionY, 50) / 100;
  const rx = Math.max(6, base * finite(values.scaleX, 170) / 100);
  const ry = Math.max(6, base * finite(values.scaleY, 58) / 100);
  const strength = scaleRange(0, 0.24, finite(values.strength, 36) / 100);
  const refraction = scaleRange(0, 0.16, finite(values.refraction, 78) / 100);
  const waveSize = scaleRange(0.006, 0.08, finite(values.waveSize, 24) / 100);
  const waveSpeed = scaleRange(0.15, 4.8, finite(values.waveSpeed, 58) / 100);
  const noise = clamp(finite(values.noise, 48) / 100, 0, 1);
  const pad = Math.max(18, (strength + refraction) * 180 * scaleValue);
  const minX = Math.max(0, Math.floor(cx - rx - pad));
  const maxX = Math.min(localWidth, Math.ceil(cx + rx + pad));
  const minY = Math.max(0, Math.floor(cy - ry - pad));
  const maxY = Math.min(localHeight, Math.ceil(cy + ry + pad));
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const sourceX = Math.max(0, Math.floor(transform.e + minX * ratioX));
  const sourceY = Math.max(0, Math.floor(transform.f + minY * ratioY));
  const sourceW = Math.min(canvas.width - sourceX, Math.ceil(width * ratioX));
  const sourceH = Math.min(canvas.height - sourceY, Math.ceil(height * ratioY));
  if (sourceW <= 1 || sourceH <= 1) return;

  const snapshot = document.createElement('canvas');
  snapshot.width = sourceW;
  snapshot.height = sourceH;
  const snapCtx = snapshot.getContext('2d');
  if (!snapCtx) return;
  snapCtx.drawImage(canvas, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

  const stripHeight = Math.max(2, Math.round(localHeight / 180));
  const maxShift = Math.max(1, (strength * 44 + refraction * 78) * scaleValue);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  for (let y = minY; y < maxY; y += stripHeight) {
    const ny = (y + stripHeight * 0.5 - cy) / Math.max(1, ry);
    const verticalMask = Math.max(0, 1 - Math.abs(ny) * 0.95);
    if (verticalMask <= 0.01) continue;
    const wave = Math.sin(y * waveSize * 2.8 + t * waveSpeed * 2.2)
      + Math.sin(y * waveSize * 5.1 - t * waveSpeed * 1.3 + noise * 4.2) * noise * 0.42;
    const shift = wave * maxShift * verticalMask;
    const sy = Math.max(0, Math.floor((y - minY) * ratioY));
    const sh = Math.max(1, Math.min(sourceH - sy, Math.ceil(stripHeight * ratioY)));
    ctx.globalAlpha = 0.34 + verticalMask * 0.56;
    ctx.drawImage(snapshot, 0, sy, sourceW, sh, minX + shift, y, width, stripHeight + 1);
  }
  ctx.restore();
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
  syncImageAsset(entry, values.overlayAssetPath, 'overlayAsset', (image) => entry.engine.setOverlayImage(image));
  syncImageAsset(entry, values.overlay2AssetPath, 'overlay2Asset', (image) => entry.engine.setOverlay2Image(image));
  syncImageAsset(entry, values.outlineAssetPath, 'outlineAsset', (image) => entry.engine.setOutlineImage(image));
}

function syncImageAsset(entry, path, field, setter) {
  const assetPath = path || '';
  if (assetPath === entry[field]) return;
  entry[field] = assetPath;
  if (!assetPath) {
    setter(null);
    return;
  }
  loadImage(assetPath, setter);
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

function rgba(color, alpha) {
  const c = parseColor(color);
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${clamp(alpha, 0, 1)})`;
}

function parseColor(color) {
  const string = String(color || '').trim();
  const hex = string.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/iu);
  if (!hex) return { r: 255, g: 255, b: 255 };
  let value = hex[1];
  if (value.length === 3) value = value.split('').map((char) => char + char).join('');
  return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) };
}

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function seedFromString(value) {
  const string = String(value || 'seed');
  let seed = 2166136261;
  for (let index = 0; index < string.length; index += 1) {
    seed ^= string.charCodeAt(index);
    seed = Math.imul(seed, 16777619) >>> 0;
  }
  return seed >>> 0;
}

function scaleRange(min, max, value) {
  const t = clamp(value, 0, 1);
  return min + (max - min) * t;
}

function finite(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
