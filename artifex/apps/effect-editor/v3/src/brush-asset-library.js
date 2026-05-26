import { getActiveLayer, onStateChange, updateActiveLayer } from './editor-state.js';

let brushAssets = [];
let activeFilter = '';

export function initBrushAssetLibrary(showToast = () => {}) {
  injectBrushLibraryStyles();
  ensureBrushLibraryPanel(showToast);
  renderBrushLibrary();
  onStateChange(renderBrushLibrary);
}

function injectBrushLibraryStyles() {
  if (document.getElementById('brush-asset-library-style')) return;
  const style = document.createElement('style');
  style.id = 'brush-asset-library-style';
  style.textContent = `
    .brush-library-panel {
      margin-top: 13px;
      border: 1px solid rgba(56,42,33,.76);
      border-radius: 15px;
      padding: 10px;
      background: rgba(15,12,11,.48);
    }
    .brush-library-panel h3 {
      margin: 0 0 8px;
      font-family: 'Cinzel', Georgia, serif;
      color: var(--gold-bright);
      font-size: 11px;
      letter-spacing: .14em;
      text-transform: uppercase;
    }
    .brush-library-actions {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 8px;
    }
    .brush-library-actions button {
      min-height: 34px;
      padding: 6px 8px;
      font-size: 11px;
      text-align: center;
    }
    .brush-library-search {
      margin: 8px 0;
    }
    .brush-library-search input {
      width: 100%;
    }
    .brush-library-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
      gap: 8px;
      max-height: 220px;
      overflow: auto;
      padding-right: 2px;
    }
    .brush-asset-card {
      border: 1px solid rgba(226,204,167,.18);
      border-radius: 12px;
      padding: 6px;
      background: rgba(0,0,0,.28);
      cursor: pointer;
      min-width: 0;
    }
    .brush-asset-card:hover,
    .brush-asset-card.is-selected {
      border-color: var(--module-accent);
      box-shadow: 0 0 12px var(--module-glow);
    }
    .brush-asset-thumb {
      height: 54px;
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
    }
    .brush-asset-thumb img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }
    .brush-asset-name {
      display: block;
      margin-top: 5px;
      color: var(--gold-muted);
      font-size: 9px;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
    }
    .brush-library-empty {
      border: 1px dashed rgba(226,204,167,.24);
      border-radius: 12px;
      padding: 12px;
      color: var(--muted);
      font-size: 11px;
      line-height: 1.35;
      text-align: center;
    }
    .brush-library-note {
      color: var(--muted);
      font-size: 10px;
      line-height: 1.35;
      margin: 8px 2px 0;
    }
  `;
  document.head.append(style);
}

function ensureBrushLibraryPanel(showToast) {
  const cards = Array.from(document.querySelectorAll('#left-panel .card'));
  const appearanceCard = cards.find((card) => card.querySelector('h2')?.textContent?.trim() === 'Effect Layer Appearance');
  if (!appearanceCard || document.getElementById('brush-library-panel')) return;

  appearanceCard.insertAdjacentHTML('beforeend', `
    <div id="brush-library-panel" class="brush-library-panel">
      <h3>Brush Asset Library</h3>
      <div class="brush-library-actions">
        <button id="load-brush-files-button" type="button" title="Load one or more PNG/WebP/JPG brush images into this session library.">Load Files</button>
        <button id="load-brush-folder-button" type="button" title="Load a whole folder of brush images into this session library.">Load Folder</button>
        <button id="clear-brush-library-button" type="button" title="Clear the in-memory brush library list.">Clear</button>
      </div>
      <div class="brush-library-search">
        <input id="brush-library-search-input" type="search" placeholder="Search loaded brush assets" />
      </div>
      <input id="brush-files-input" type="file" accept="image/png,image/webp,image/jpeg" multiple hidden />
      <input id="brush-folder-input" type="file" accept="image/png,image/webp,image/jpeg" multiple webkitdirectory hidden />
      <div id="brush-library-grid" class="brush-library-grid"></div>
      <p class="brush-library-note">Loaded brushes are kept for this editing session. Selecting one applies it to the active layer as a Custom Image Brush, so saves/exports keep the chosen brush.</p>
    </div>
  `);

  document.getElementById('load-brush-files-button')?.addEventListener('click', () => document.getElementById('brush-files-input')?.click());
  document.getElementById('load-brush-folder-button')?.addEventListener('click', () => document.getElementById('brush-folder-input')?.click());
  document.getElementById('clear-brush-library-button')?.addEventListener('click', () => {
    brushAssets = [];
    renderBrushLibrary();
    showToast('Brush asset library cleared.', 'warn');
  });
  document.getElementById('brush-library-search-input')?.addEventListener('input', (event) => {
    activeFilter = String(event.target.value || '').trim().toLowerCase();
    renderBrushLibrary();
  });
  document.getElementById('brush-files-input')?.addEventListener('change', async (event) => loadBrushFiles(event, showToast));
  document.getElementById('brush-folder-input')?.addEventListener('change', async (event) => loadBrushFiles(event, showToast));
}

async function loadBrushFiles(event, showToast) {
  const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
  if (!files.length) {
    showToast('No brush image files found.', 'warn');
    event.target.value = '';
    return;
  }

  const loaded = await Promise.all(files.map(readBrushFile));
  const existing = new Set(brushAssets.map((asset) => asset.id));
  let added = 0;
  for (const asset of loaded) {
    if (existing.has(asset.id)) continue;
    brushAssets.push(asset);
    existing.add(asset.id);
    added += 1;
  }
  brushAssets.sort((a, b) => a.name.localeCompare(b.name));
  event.target.value = '';
  renderBrushLibrary();
  showToast(`${added} brush asset${added === 1 ? '' : 's'} loaded.`, added ? 'success' : 'info');
}

function readBrushFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const path = file.webkitRelativePath || file.name;
      resolve({
        id: `${path}:${file.size}:${file.lastModified}`,
        name: file.name,
        path,
        size: file.size,
        type: file.type,
        dataUrl: String(reader.result || '')
      });
    });
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

function renderBrushLibrary() {
  const grid = document.getElementById('brush-library-grid');
  if (!grid) return;
  const layer = getActiveLayer();
  const visibleAssets = brushAssets.filter((asset) => {
    const haystack = `${asset.name} ${asset.path}`.toLowerCase();
    return !activeFilter || haystack.includes(activeFilter);
  });

  if (!visibleAssets.length) {
    grid.innerHTML = `<div class="brush-library-empty">${brushAssets.length ? 'No matching brush assets.' : 'Load PNG/WebP/JPG files or a folder of brushes.'}</div>`;
    return;
  }

  grid.innerHTML = '';
  for (const asset of visibleAssets) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'brush-asset-card';
    card.title = `Use ${asset.path}`;
    card.classList.toggle('is-selected', layer?.textureName === asset.name && layer?.textureDataUrl === asset.dataUrl);
    card.innerHTML = `
      <span class="brush-asset-thumb"><img src="${asset.dataUrl}" alt="${escapeHtml(asset.name)}" /></span>
      <span class="brush-asset-name">${escapeHtml(asset.name)}</span>
    `;
    card.addEventListener('click', () => applyBrushAsset(asset));
    grid.append(card);
  }
}

function applyBrushAsset(asset) {
  updateActiveLayer({
    appearanceMode: 'custom',
    textureName: asset.name,
    textureDataUrl: asset.dataUrl
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}
