import { getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

const REPO_BRUSH_API_URL = 'https://api.github.com/repos/cinaedvsstudios/Forever-Bound-Game/contents/artifex/apps/effect-editor/brushes?ref=main';
const IMAGE_EXTENSION_RE = /\.(png|webp|jpe?g)$/iu;

const BUILT_IN_ASSETS = [
  { id: 'shape:circle', source: 'built-in', kind: 'shape', value: 'circle', name: 'Soft Orb', symbol: '●' },
  { id: 'shape:square', source: 'built-in', kind: 'shape', value: 'square', name: 'Square', symbol: '■' },
  { id: 'shape:diamond', source: 'built-in', kind: 'shape', value: 'diamond', name: 'Diamond', symbol: '◆' },
  { id: 'shape:star', source: 'built-in', kind: 'shape', value: 'star', name: 'Star', symbol: '✦' },
  { id: 'shape:slash', source: 'built-in', kind: 'shape', value: 'slash', name: 'Slash Stroke', symbol: '╱' },
  { id: 'shape:text', source: 'built-in', kind: 'shape', value: 'text', name: 'Text', symbol: 'T' },
  { id: 'brush:spark', source: 'built-in', kind: 'brush', value: 'spark', name: 'Sharp Spark', symbol: '—' },
  { id: 'brush:soft-dot', source: 'built-in', kind: 'brush', value: 'soft-dot', name: 'Soft Dot', symbol: '●' },
  { id: 'brush:smoke-puff', source: 'built-in', kind: 'brush', value: 'smoke-puff', name: 'Smoke Puff', symbol: '☁' },
  { id: 'brush:flare', source: 'built-in', kind: 'brush', value: 'flare', name: 'Flare Cross', symbol: '✛' }
];

let brushAssets = [];
let activeFilter = '';
let repositoryBrushesLoaded = false;

export function initBrushAssetLibrary(showToast = () => {}) {
  injectBrushLibraryStyles();
  ensureBrushLibraryPanel(showToast);
  renderBrushLibrary();
  autoLoadRepositoryBrushes(showToast);
  onStateChange(() => {
    renderBrushLibrary();
    renderCurrentBrushPreview();
  });
}

function injectBrushLibraryStyles() {
  if (document.getElementById('brush-asset-library-style')) return;
  const style = document.createElement('style');
  style.id = 'brush-asset-library-style';
  style.textContent = `
    #render-choice-label,
    #appearance-mode-select { display: none !important; }
    #appearance-mode-select + * { display: none !important; }
    #appearance-ramp-editor .appearance-stop-fields .appearance-wide { grid-column: auto !important; }
    .current-brush-field { margin: 0; }
    .current-brush-preview-button {
      width: 100%;
      min-height: 44px;
      border-radius: 10px;
      padding: 4px 8px;
      display: grid;
      grid-template-columns: 34px 1fr;
      gap: 8px;
      align-items: center;
      text-align: left;
    }
    .current-brush-preview-square {
      width: 30px;
      height: 30px;
      border: 1px solid rgba(226,204,167,.24);
      border-radius: 7px;
      background:
        linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,.08) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,.08) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.08) 75%),
        #050405;
      background-size: 10px 10px;
      background-position: 0 0, 0 5px, 5px -5px, -5px 0;
      display: grid;
      place-items: center;
      overflow: hidden;
      color: var(--module-accent-strong);
      font-size: 18px;
      line-height: 1;
    }
    .current-brush-preview-square img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
    .current-brush-preview-name { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 10px; font-weight: 500; }
    .brush-library-panel {
      position: absolute;
      z-index: 40;
      right: 14px;
      top: 235px;
      width: min(340px, calc(100% - 28px));
      display: none;
      border: 1px solid rgba(56,42,33,.92);
      border-radius: 15px;
      padding: 10px;
      background: rgba(15,12,11,.98);
      box-shadow: 0 18px 40px rgba(0,0,0,.62), 0 0 18px var(--module-glow);
    }
    .brush-library-panel.is-open { display: block; }
    .brush-library-panel h3 {
      margin: 0 0 8px;
      font-family: 'Cinzel', Georgia, serif;
      color: var(--gold-bright);
      font-size: 11px;
      letter-spacing: .14em;
      text-transform: uppercase;
    }
    .brush-library-actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 8px; }
    .brush-library-actions button { min-height: 34px; padding: 6px 8px; font-size: 11px; text-align: center; }
    .brush-library-search { margin: 8px 0; }
    .brush-library-search input { width: 100%; }
    .brush-library-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 8px; max-height: 265px; overflow: auto; padding-right: 2px; }
    .brush-asset-card { border: 1px solid rgba(226,204,167,.18); border-radius: 12px; padding: 6px; background: rgba(0,0,0,.28); cursor: pointer; min-width: 0; display: block; width: 100%; }
    .brush-asset-card:hover,
    .brush-asset-card.is-selected { border-color: var(--module-accent); box-shadow: 0 0 12px var(--module-glow); }
    .brush-asset-thumb {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 8px;
      background:
        linear-gradient(45deg, rgba(255,255,255,.08) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(255,255,255,.08) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, rgba(255,255,255,.08) 75%),
        linear-gradient(-45deg, transparent 75%, rgba(255,255,255,.08) 75%),
        #050405;
      background-size: 14px 14px;
      background-position: 0 0, 0 7px, 7px -7px, -7px 0;
      display: grid;
      place-items: center;
      overflow: hidden;
      color: var(--module-accent-strong);
      font-size: 26px;
      line-height: 1;
    }
    .brush-asset-thumb img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
    .brush-asset-name { display: block; margin-top: 5px; color: var(--gold-muted); font-size: 9px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
    .brush-library-empty { grid-column: 1 / -1; border: 1px dashed rgba(226,204,167,.24); border-radius: 12px; padding: 12px; color: var(--muted); font-size: 11px; line-height: 1.35; text-align: center; }
  `;
  document.head.append(style);
}

function ensureBrushLibraryPanel(showToast) {
  const cards = Array.from(document.querySelectorAll('#left-panel .card'));
  const appearanceCard = cards.find((card) => card.querySelector('h2')?.textContent?.trim() === 'Effect Layer Appearance');
  if (!appearanceCard) return;
  appearanceCard.style.position = 'relative';
  ensureCurrentBrushField();
  if (document.getElementById('brush-library-panel')) return;

  appearanceCard.insertAdjacentHTML('beforeend', `
    <div id="brush-library-panel" class="brush-library-panel">
      <h3>Brush / Shape Library</h3>
      <div class="brush-library-actions">
        <button id="load-brush-files-button" type="button" title="Load one or more PNG/WebP/JPG brush images into this session library.">📄</button>
        <button id="load-brush-folder-button" type="button" title="Load a whole folder of brush images into this session library.">📁</button>
        <button id="clear-brush-library-button" type="button" title="Clear session-loaded brushes. Repository and built-in brushes stay available.">🧹</button>
      </div>
      <div class="brush-library-search">
        <input id="brush-library-search-input" type="search" placeholder="Search shapes / brushes" title="Search loaded brush and shape assets." />
      </div>
      <input id="brush-files-input" type="file" accept="image/png,image/webp,image/jpeg" multiple hidden />
      <input id="brush-folder-input" type="file" accept="image/png,image/webp,image/jpeg" multiple webkitdirectory hidden />
      <div id="brush-library-grid" class="brush-library-grid"></div>
    </div>
  `);

  document.getElementById('current-brush-preview-button')?.addEventListener('click', toggleBrushPanel);
  document.addEventListener('pointerdown', (event) => {
    const panel = document.getElementById('brush-library-panel');
    const preview = document.getElementById('current-brush-preview-button');
    if (!panel?.classList.contains('is-open')) return;
    if (panel.contains(event.target) || preview?.contains(event.target)) return;
    panel.classList.remove('is-open');
  }, true);
  document.getElementById('load-brush-files-button')?.addEventListener('click', () => document.getElementById('brush-files-input')?.click());
  document.getElementById('load-brush-folder-button')?.addEventListener('click', () => document.getElementById('brush-folder-input')?.click());
  document.getElementById('clear-brush-library-button')?.addEventListener('click', () => {
    brushAssets = brushAssets.filter((asset) => asset.source === 'repo');
    renderBrushLibrary();
    showToast('Session brush assets cleared.', 'warn');
  });
  document.getElementById('brush-library-search-input')?.addEventListener('input', (event) => {
    activeFilter = String(event.target.value || '').trim().toLowerCase();
    renderBrushLibrary();
  });
  document.getElementById('brush-files-input')?.addEventListener('change', async (event) => loadBrushFiles(event, showToast));
  document.getElementById('brush-folder-input')?.addEventListener('change', async (event) => loadBrushFiles(event, showToast));
}

function ensureCurrentBrushField() {
  const colorInput = document.getElementById('stop-color-input');
  const colorLabel = colorInput?.closest('label');
  if (!colorLabel || document.getElementById('current-brush-field')) return;
  colorLabel.classList.remove('appearance-wide');
  colorLabel.insertAdjacentHTML('afterend', `
    <label id="current-brush-field" class="current-brush-field">Brush
      <button id="current-brush-preview-button" class="current-brush-preview-button" type="button" title="Open the brush and shape picker.">
        <span id="current-brush-preview-square" class="current-brush-preview-square">●</span>
        <span id="current-brush-preview-name" class="current-brush-preview-name">Soft Orb</span>
      </button>
    </label>
  `);
}

function toggleBrushPanel() {
  const panel = document.getElementById('brush-library-panel');
  if (!panel) return;
  panel.classList.toggle('is-open');
  renderBrushLibrary();
}

async function autoLoadRepositoryBrushes(showToast) {
  if (repositoryBrushesLoaded) return;
  repositoryBrushesLoaded = true;
  try {
    const response = await fetch(REPO_BRUSH_API_URL, { cache: 'no-store' });
    if (!response.ok) return;
    const entries = await response.json();
    if (!Array.isArray(entries)) return;
    const imageEntries = entries.filter((entry) => entry?.type === 'file' && IMAGE_EXTENSION_RE.test(entry.name || ''));
    if (!imageEntries.length) return;
    const loaded = await Promise.all(imageEntries.map(readRepositoryBrush).filter(Boolean));
    const added = addBrushAssets(loaded.filter(Boolean));
    if (added) showToast(`${added} repository brush asset${added === 1 ? '' : 's'} auto-loaded.`, 'success');
  } catch (error) {
    console.warn('Repository brush auto-load failed', error);
  }
}

async function readRepositoryBrush(entry) {
  const url = entry.download_url || new URL(`../brushes/${encodeURIComponent(entry.name)}`, window.location.href).href;
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) return null;
  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  return { id: `repo:${entry.path || entry.name}:${entry.sha || blob.size}`, name: entry.name, path: entry.path || `artifex/apps/effect-editor/brushes/${entry.name}`, size: blob.size, type: blob.type || mimeFromName(entry.name), dataUrl, source: 'repo', kind: 'custom' };
}

async function loadBrushFiles(event, showToast) {
  const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/') || IMAGE_EXTENSION_RE.test(file.name));
  if (!files.length) {
    showToast('No brush image files found.', 'warn');
    event.target.value = '';
    return;
  }
  const loaded = await Promise.all(files.map(readBrushFile));
  const added = addBrushAssets(loaded);
  event.target.value = '';
  renderBrushLibrary();
  showToast(`${added} brush asset${added === 1 ? '' : 's'} loaded.`, added ? 'success' : 'info');
}

function addBrushAssets(assets) {
  const existing = new Set(brushAssets.map((asset) => asset.id));
  let added = 0;
  for (const asset of assets) {
    if (!asset || existing.has(asset.id)) continue;
    brushAssets.push(asset);
    existing.add(asset.id);
    added += 1;
  }
  brushAssets.sort((a, b) => `${a.source === 'repo' ? '0' : '1'}${a.name}`.localeCompare(`${b.source === 'repo' ? '0' : '1'}${b.name}`));
  renderBrushLibrary();
  renderCurrentBrushPreview();
  return added;
}

function readBrushFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const path = file.webkitRelativePath || file.name;
      resolve({ id: `session:${path}:${file.size}:${file.lastModified}`, name: file.name, path, size: file.size, type: file.type || mimeFromName(file.name), dataUrl: String(reader.result || ''), source: 'session', kind: 'custom' });
    });
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result || '')));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(blob);
  });
}

function renderBrushLibrary() {
  const grid = document.getElementById('brush-library-grid');
  if (!grid) return;
  const layer = getActiveLayer();
  const allAssets = [...BUILT_IN_ASSETS, ...brushAssets];
  const visibleAssets = allAssets.filter((asset) => {
    const haystack = `${asset.name} ${asset.path || ''} ${asset.kind || ''}`.toLowerCase();
    return !activeFilter || haystack.includes(activeFilter);
  });
  if (!visibleAssets.length) {
    grid.innerHTML = `<div class="brush-library-empty">No matching shapes or brush assets.</div>`;
    return;
  }
  grid.innerHTML = '';
  for (const asset of visibleAssets) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'brush-asset-card';
    card.title = `Use ${asset.name}`;
    card.classList.toggle('is-selected', isSelectedAsset(layer, asset));
    card.innerHTML = renderAssetThumb(asset);
    card.addEventListener('click', () => applyBrushAsset(asset));
    grid.append(card);
  }
}

function renderAssetThumb(asset) {
  if (asset.kind === 'custom') {
    return `<span class="brush-asset-thumb"><img src="${asset.dataUrl}" alt="${escapeHtml(asset.name)}" /></span><span class="brush-asset-name">${escapeHtml(asset.name)}</span>`;
  }
  return `<span class="brush-asset-thumb">${escapeHtml(asset.symbol || '●')}</span><span class="brush-asset-name">${escapeHtml(asset.name)}</span>`;
}

function isSelectedAsset(layer, asset) {
  if (!layer) return false;
  if (asset.kind === 'shape') return (layer.appearanceMode || 'shape') === 'shape' && (layer.particleShape || 'circle') === asset.value;
  if (asset.kind === 'brush') return layer.appearanceMode === 'brush' && (layer.builtInBrush || 'spark') === asset.value;
  return layer.appearanceMode === 'custom' && layer.textureName === asset.name && layer.textureDataUrl === asset.dataUrl;
}

function applyBrushAsset(asset) {
  if (asset.kind === 'shape') {
    const patch = { appearanceMode: 'shape', particleShape: asset.value };
    if (asset.value === 'text') {
      patch.textContent = getActiveLayer()?.textContent || 'AETHERA';
      patch.spawnRate = Math.min(Number(getActiveLayer()?.spawnRate) || 4, 8);
    }
    updateActiveLayer(patch);
  } else if (asset.kind === 'brush') {
    updateActiveLayer({ appearanceMode: 'brush', builtInBrush: asset.value });
  } else {
    updateActiveLayer({ appearanceMode: 'custom', textureName: asset.name, textureDataUrl: asset.dataUrl, tintMode: getActiveLayer()?.tintMode || 'tint', rotationMode: getActiveLayer()?.rotationMode || 'fixed', rotationJitter: Number.isFinite(Number(getActiveLayer()?.rotationJitter)) ? getActiveLayer().rotationJitter : 5, blendMode: getActiveLayer()?.blendMode || 'source-over' });
  }
  document.getElementById('brush-library-panel')?.classList.remove('is-open');
  renderCurrentBrushPreview();
}

function renderCurrentBrushPreview() {
  const layer = getActiveLayer();
  const square = document.getElementById('current-brush-preview-square');
  const name = document.getElementById('current-brush-preview-name');
  if (!square || !name || !layer) return;
  if (layer.appearanceMode === 'custom' && layer.textureDataUrl) {
    square.innerHTML = `<img src="${layer.textureDataUrl}" alt="${escapeHtml(layer.textureName || 'Brush')}" />`;
    name.textContent = layer.textureName || 'Image Brush';
    return;
  }
  const asset = BUILT_IN_ASSETS.find((item) => item.kind === (layer.appearanceMode === 'brush' ? 'brush' : 'shape') && item.value === (layer.appearanceMode === 'brush' ? layer.builtInBrush : layer.particleShape)) || BUILT_IN_ASSETS[0];
  square.textContent = asset.symbol || '●';
  name.textContent = asset.name;
}

function mimeFromName(name) {
  if (/\.webp$/iu.test(name)) return 'image/webp';
  if (/\.jpe?g$/iu.test(name)) return 'image/jpeg';
  return 'image/png';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}
