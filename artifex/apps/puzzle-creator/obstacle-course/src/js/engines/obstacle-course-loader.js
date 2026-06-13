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

export function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { OC.images.set(url, img); resolve(true); };
    img.onerror = () => { console.warn('[ObstacleCourse] image failed', url); resolve(false); };
    img.src = `${url}?v=${OC.cacheVersion}`;
  });
}

export async function loadPathAlphaMap(segment) {
  try {
    const img = OC.images.get(segment.file);
    if (!img) return false;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || !canvas.width || !canvas.height) return false;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    OC.alphaMaps.set(segment.key, { width: canvas.width, height: canvas.height, data: data.data });
    return true;
  } catch (error) {
    console.warn('[ObstacleCourse] alpha map failed', segment.file, error);
    return false;
  }
}

export function pathAlphaAtSegment(segmentKey, u, v) {
  const alpha = OC.alphaMaps.get(segmentKey);
  if (!alpha) return null;
  const x = clamp(Math.round(u * (alpha.width - 1)), 0, alpha.width - 1);
  const y = clamp(Math.round(v * (alpha.height - 1)), 0, alpha.height - 1);
  const idx = (y * alpha.width + x) * 4 + 3;
  return alpha.data[idx] / 255;
}

export async function loadRequiredAssets({ onFirstReady } = {}) {
  const required = requiredAssetList();
  const first = [ASSETS.background, ASSETS.horse];
  const total = required.length + optionalAssetList().length;
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
  const rest = required.filter((asset) => !first.includes(asset.url));
  await Promise.all(rest.map((asset) => preloadImage(asset.url).then((ok) => {
    count += 1;
    setLoading(count, total);
    if (!ok) OC.failures.push(asset.url);
  })));
  for (const seg of Object.values(ASSETS.pathSegments)) {
    const ok = await loadPathAlphaMap(seg);
    if (!ok) console.warn('[ObstacleCourse] alpha fallback active for', seg.file);
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
