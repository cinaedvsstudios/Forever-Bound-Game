import { OC } from './obstacle-course-state.js';
import { ASSETS, requiredAssetList, optionalAssetList } from './obstacle-course-assets.js';
import { $, clamp } from './obstacle-course-utils.js';

export function setLoading(count, total) {
  OC.loadingCount = count;
  OC.loadingTotal = total;
  const message = `Assets ${count} / ${total}`;
  if ($('oc-loading')) $('oc-loading').textContent = `Loading ${message}`;
  if ($('oc-top-load')) $('oc-top-load').textContent = message;
  if ($('oc-loading-horse-count')) $('oc-loading-horse-count').textContent = message;
}

function cacheBusted(url) {
  return `${url}${url.includes('?') ? '&' : '?'}v=${OC.cacheVersion}`;
}

export function preloadImage(url, fallbackUrl = null) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let triedFallback = false;
    img.onload = () => { OC.images.set(url, img); resolve(true); };
    img.onerror = () => {
      if (fallbackUrl && !triedFallback) {
        triedFallback = true;
        img.src = cacheBusted(fallbackUrl);
        return;
      }
      console.warn('[ObstacleCourse] image failed', url);
      resolve(false);
    };
    img.src = cacheBusted(url);
  });
}

export async function preloadJson(url) {
  try {
    const response = await fetch(cacheBusted(url));
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    OC.groundPathMap = data;
    return true;
  } catch (error) {
    console.warn('[ObstacleCourse] ground path map failed', url, error);
    return false;
  }
}

export function resolveGroundTileUrl(file) {
  if (/^https?:\/\//i.test(file)) return file;
  const root = OC.groundPathMap?.imageRoot || './assets/ground/';
  return `${root}${file}`;
}

export function resolveGroundTileFallbackUrl(file) {
  if (/^https?:\/\//i.test(file)) return null;
  const root = OC.groundPathMap?.fallbackImageRoot || '';
  return root ? `${root}${file}` : null;
}

export function groundTileAssetsFromMap() {
  return (OC.groundPathMap?.tiles || []).map((tile) => ({
    url: resolveGroundTileUrl(tile.file),
    fallbackUrl: resolveGroundTileFallbackUrl(tile.file),
    type: 'image',
    required: true,
    label: tile.label || tile.file,
    tile
  }));
}

export async function loadPathAlphaMap() { return false; }
export function pathAlphaAtSegment() { return null; }

export async function loadRequiredAssets({ onFirstReady } = {}) {
  const required = requiredAssetList();
  const first = [ASSETS.background, ASSETS.horse];
  const optional = optionalAssetList();
  let total = required.length + optional.length;
  let count = 0;
  OC.failures = [];
  setLoading(0, total);
  for (const url of first) {
    const ok = await preloadImage(url);
    count += 1;
    setLoading(count, total);
    if (!ok) OC.failures.push(url);
  }
  onFirstReady?.();
  for (const asset of required.filter((item) => !first.includes(item.url))) {
    let ok = true;
    if (asset.type === 'json') ok = await preloadJson(asset.url);
    else ok = await preloadImage(asset.url);
    count += 1;
    setLoading(count, total);
    if (!ok) OC.failures.push(asset.url);
  }
  const groundTiles = groundTileAssetsFromMap();
  OC.groundTileAssets = groundTiles;
  total += groundTiles.length;
  setLoading(count, total);
  for (const asset of groundTiles) {
    const ok = await preloadImage(asset.url, asset.fallbackUrl);
    count += 1;
    setLoading(count, total);
    if (!ok) OC.failures.push(asset.url);
  }
  OC.requiredReady = OC.failures.length === 0;
  if ($('obstacle-start')) $('obstacle-start').disabled = !OC.requiredReady;
  if (!OC.requiredReady && $('oc-loading')) $('oc-loading').textContent = `Required asset failure: ${OC.failures.join(', ')}`;
  return { count, total };
}

async function loadWithTimeout(task, ms = 2500) {
  let timer = 0;
  try {
    return await Promise.race([
      task,
      new Promise((resolve) => { timer = window.setTimeout(() => resolve(false), ms); })
    ]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}

export async function loadOptionalAssets({ loadGlbAsset } = {}) {
  const optional = optionalAssetList();
  let count = OC.loadingCount;
  const total = OC.loadingTotal || (requiredAssetList().length + optional.length);
  OC.optionalFailures = [];
  await Promise.all(optional.map(async (asset) => {
    let ok = true;
    if (asset.type === 'glb' && loadGlbAsset) ok = await loadWithTimeout(loadGlbAsset(asset.url), 3000);
    count += 1;
    setLoading(count, total);
    if (!ok) OC.optionalFailures.push(asset.url);
  }));
  OC.loadingDone = true;
  if ($('oc-loading')) $('oc-loading').textContent = `Loading assets ${count} / ${total} complete`;
  if ($('oc-top-load')) $('oc-top-load').textContent = `Assets ${count} / ${total} loaded`;
  if ($('oc-loading-horse')) $('oc-loading-horse').hidden = true;
}
