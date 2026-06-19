import { DEFAULT_FILTERS } from './constants.js';
import { uid, clamp } from './utils.js';

export function makeAsset({ name, kind, dataUrl, sourceDataUrl = dataUrl, width = 0, height = 0 }) {
  return { id: uid('asset'), name, kind, dataUrl, sourceDataUrl, width, height, createdAt: Date.now() };
}

export function makeLayer(asset, canvas, overrides = {}) {
  const naturalWidth = asset.width || 640;
  const naturalHeight = asset.height || 360;
  const width = overrides.width ?? Math.min(canvas.width * 0.43, naturalWidth);
  const height = overrides.height ?? Math.max(1, width * (naturalHeight / naturalWidth));
  return {
    id: uid('layer'),
    assetId: asset.id,
    name: overrides.name ?? asset.name.replace(/\.[^.]+$/, ''),
    kind: asset.kind,
    dataUrl: asset.dataUrl,
    sourceDataUrl: asset.sourceDataUrl,
    x: overrides.x ?? Math.round((canvas.width - width) / 2),
    y: overrides.y ?? Math.round((canvas.height - height) / 2),
    width: Math.round(width),
    height: Math.round(height),
    opacity: overrides.opacity ?? 1,
    visible: overrides.visible ?? true,
    locked: overrides.locked ?? false,
    blendMode: overrides.blendMode ?? 'normal',
    filters: { ...DEFAULT_FILTERS, ...(overrides.filters ?? {}) },
    isBackground: overrides.isBackground ?? false,
    chroma: overrides.chroma ?? null
  };
}

export function constrainLayer(layer, canvas) {
  layer.width = clamp(Number(layer.width) || 1, 1, canvas.width * 4);
  layer.height = clamp(Number(layer.height) || 1, 1, canvas.height * 4);
  layer.x = clamp(Number(layer.x) || 0, -layer.width + 1, canvas.width - 1);
  layer.y = clamp(Number(layer.y) || 0, -layer.height + 1, canvas.height - 1);
  layer.opacity = clamp(Number(layer.opacity) || 0, 0, 1);
  return layer;
}
