import { makeAsset } from '../core/scene-model.js';

export const ASSET_CATEGORIES = Object.freeze([
  { id: 'backgrounds', label: 'Backgrounds' },
  { id: 'people', label: 'People' },
  { id: 'objects', label: 'Objects' }
]);

const REPOSITORY = 'cinaedvsstudios/Forever-Bound-Game';
const ROOT = 'scene-mockup/assets';
const EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'glb']);

let cache = null;

function extensionOf(name = '') {
  return name.split('.').pop().toLowerCase();
}

function titleFromFilename(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function makeGlbPoster(name) {
  const safeName = name.replace(/[<>&"]/g, '').slice(0, 32) || '3D model';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#132b44"/><stop offset=".55" stop-color="#252047"/><stop offset="1" stop-color="#101a2a"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/><g fill="none" stroke="#86d7ff" stroke-width="9"><path d="M480 105 668 214 668 326 480 435 292 326 292 214Z"/><path d="M480 105v122m0 208V313m-188-99 188 99 188-99"/></g><circle cx="480" cy="270" r="69" fill="#101a2a" stroke="#dbefff" stroke-width="7"/><text x="480" y="286" text-anchor="middle" font-family="system-ui, sans-serif" font-size="47" fill="#dbefff" font-weight="700">3D</text><text x="480" y="488" text-anchor="middle" font-family="system-ui, sans-serif" font-size="25" fill="#a9c7e5">${safeName}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function entryToAsset(entry, category) {
  const filename = entry.name;
  const kind = extensionOf(filename) === 'glb' ? 'glb' : 'image';
  const name = titleFromFilename(filename);
  const sourcePath = `${category}/${filename}`;
  const dataUrl = kind === 'glb' ? makeGlbPoster(name) : entry.download_url;
  const asset = makeAsset({
    name,
    kind,
    dataUrl,
    sourceDataUrl: dataUrl,
    category,
    origin: 'repository',
    sourcePath
  });
  asset.id = `repository:${encodeURIComponent(sourcePath)}`;
  return asset;
}

async function fetchFolder(category) {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/contents/${ROOT}/${category}?ref=main`, {
    headers: { Accept: 'application/vnd.github+json' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Could not read ${category}.`);
  const entries = await response.json();
  return entries
    .filter((entry) => entry.type === 'file' && EXTENSIONS.has(extensionOf(entry.name)))
    .map((entry) => entryToAsset(entry, category));
}

async function loadManifestFallback() {
  const response = await fetch('./assets/manifest.json', { cache: 'no-store' });
  if (!response.ok) return [];
  const manifest = await response.json();
  if (!Array.isArray(manifest.assets)) return [];

  return manifest.assets
    .filter((entry) => entry?.path && EXTENSIONS.has(extensionOf(entry.path)))
    .map((entry) => {
      const filename = entry.path.split('/').pop();
      const category = entry.category || entry.path.split('/')[0] || 'objects';
      const kind = entry.kind || (extensionOf(entry.path) === 'glb' ? 'glb' : 'image');
      const name = entry.name || titleFromFilename(filename);
      const sourcePath = entry.path;
      const dataUrl = kind === 'glb' ? makeGlbPoster(name) : `./assets/${sourcePath}`;
      const asset = makeAsset({ name, kind, dataUrl, sourceDataUrl: dataUrl, category, origin: 'manifest', sourcePath });
      asset.id = `manifest:${encodeURIComponent(sourcePath)}`;
      return asset;
    });
}

export async function loadRepositoryCatalogue({ force = false } = {}) {
  if (cache && !force) return cache;

  try {
    const groups = await Promise.all(ASSET_CATEGORIES.map(({ id }) => fetchFolder(id)));
    cache = groups.flat();
  } catch (error) {
    console.warn('Repository asset catalogue unavailable; using manifest fallback.', error);
    cache = await loadManifestFallback();
  }

  return cache;
}

export function categoryLabel(category) {
  if (category === 'imports') return 'Imported';
  return ASSET_CATEGORIES.find((item) => item.id === category)?.label ?? 'Asset';
}
