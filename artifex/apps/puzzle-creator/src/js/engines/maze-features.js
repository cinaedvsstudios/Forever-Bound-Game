// Maze / Labyrinth features
// Owns feature selection and the setup UI for required/optional collection objects.
// Connection feature setup is rendered by maze-connections.js inside the shared setup host.

import { isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
const featureState = {
  enabled: { collection: false, door: false, portal: false, foe: false, hazard: false, traboule: false },
  collection: { count: 1, items: [], placingItemId: null }
};

window.__artifexMazeFeatures = {
  state: featureState,
  enable,
  disable,
  isEnabled: (type) => !!featureState.enabled[type],
  collectionItems: () => featureState.collection.items,
  refresh: renderAll
};

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  injectFeatureCard();
  bindFeatureButtons();
  bindCollectionPlacement();
  patchExportPayload();
  renderAll();
  window.setInterval(drawCollectionMarkers, 180);
});

function runtimeState() { return window.__artifexMazeRuntime?.state || null; }

function injectFeatureCard() {
  if ($('maze-feature-card')) return;
  const solution = $('difficulty-status-box');
  if (!solution) return;
  const card = document.createElement('section');
  card.id = 'maze-feature-card';
  card.className = 'maze-feature-card';
  card.innerHTML = `
    <div class="feature-head">
      <div><strong>Features</strong><small>Add content to this maze, then choose below whether it is mandatory for completion.</small></div>
      <span id="feature-count" class="feature-count">0</span>
    </div>
    <div class="feature-add-grid">
      <button type="button" data-add-feature="collection" title="Add collectable objects to place in this maze.">✦ Collect</button>
      <button type="button" data-add-feature="door" title="Add a visible paired door connection.">🚪 Door</button>
      <button type="button" data-add-feature="portal" title="Add a Portal endpoint connection.">◌ Portal</button>
      <button type="button" data-add-feature="foe" disabled title="Foe placement will be built when the encounter/archetype link is available.">⚔ Foe</button>
      <button type="button" data-add-feature="hazard" disabled title="Hazard placement is planned but not yet implemented.">⚠ Hazard</button>
      <button type="button" data-add-feature="traboule" disabled title="Traboule will be implemented as a hidden pass-through wall, not a paired connection.">▧ Traboule</button>
    </div>
    <div id="maze-feature-setup-host" class="maze-feature-setup-host"></div>
    <p class="feature-pending-note">Foe, Hazard and Traboule are listed for the feature workflow but remain disabled until their actual placement behaviour exists.</p>
  `;
  solution.insertAdjacentElement('afterend', card);
}

function bindFeatureButtons() {
  document.querySelectorAll('[data-add-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.addFeature;
      if (button.disabled) return;
      if (type === 'collection') {
        featureState.enabled.collection ? focusCollection() : enable('collection');
        return;
      }
      enable(type);
      window.dispatchEvent(new CustomEvent('artifex-maze-feature-add-instance', { detail: { type } }));
    });
  });
}

function enable(type) {
  if (!(type in featureState.enabled)) return;
  featureState.enabled[type] = true;
  if (type === 'collection') ensureCollectionItems();
  notifyChange();
  renderAll();
}

function disable(type) {
  if (!(type in featureState.enabled)) return;
  featureState.enabled[type] = false;
  if (type === 'collection') {
    featureState.collection.items = [];
    featureState.collection.placingItemId = null;
  }
  notifyChange();
  renderAll();
}

function focusCollection() {
  $('collection-feature-card')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function notifyChange() {
  window.dispatchEvent(new CustomEvent('artifex-maze-features-updated', { detail: featureState }));
}

function renderAll() {
  updateFeatureButtons();
  renderCollectionCard();
  updateCount();
  drawMarkersSoon();
}

function updateFeatureButtons() {
  ['collection', 'door', 'portal'].forEach((type) => {
    document.querySelector(`[data-add-feature="${type}"]`)?.classList.toggle('is-active', !!featureState.enabled[type]);
  });
}

function updateCount() {
  const count = Object.values(featureState.enabled).filter(Boolean).length;
  if ($('feature-count')) $('feature-count').textContent = `${count}`;
}

function ensureCollectionItems() {
  const collection = featureState.collection;
  const needed = Math.max(1, Number(collection.count || 1));
  while (collection.items.length < needed) {
    const position = collection.items.length + 1;
    collection.items.push({ id: `collect_item_${position}`, label: `Item ${position}`, cell: null, archetypeObjectId: null, archetypeLabel: null });
  }
  collection.items = collection.items.slice(0, needed);
  if (!collection.items.some((item) => item.id === collection.placingItemId)) collection.placingItemId = null;
}

function renderCollectionCard() {
  const host = $('maze-feature-setup-host');
  if (!host) return;
  let card = $('collection-feature-card');
  if (!featureState.enabled.collection) {
    card?.remove();
    return;
  }
  ensureCollectionItems();
  if (!card) {
    card = document.createElement('section');
    card.id = 'collection-feature-card';
    card.className = 'feature-setup-card';
    host.appendChild(card);
  }
  const placed = featureState.collection.items.filter((item) => item.cell).length;
  card.innerHTML = `
    <div class="feature-setup-head">
      <div><strong>Collect Objects</strong><small>Place pickups; Completion Rules decides whether collecting them is mandatory.</small></div>
      <button type="button" data-remove-feature="collection" title="Remove collection objects from this maze.">×</button>
    </div>
    <label class="feature-count-row"><span>Objects</span><input id="feature-collect-count" type="number" min="1" max="20" value="${featureState.collection.count}" title="Number of collection objects in this maze." /><small>${placed}/${featureState.collection.items.length} placed</small></label>
    <div class="feature-item-list">${featureState.collection.items.map(itemHtml).join('')}</div>
  `;
  card.querySelector('[data-remove-feature="collection"]')?.addEventListener('click', () => disable('collection'));
  $('feature-collect-count')?.addEventListener('input', (event) => {
    featureState.collection.count = Math.max(1, Math.min(20, Number(event.target.value || 1)));
    ensureCollectionItems();
    notifyChange();
    renderAll();
  });
  card.querySelectorAll('[data-place-collect]').forEach((button) => button.addEventListener('click', () => {
    featureState.collection.placingItemId = button.dataset.placeCollect;
    renderCollectionCard();
  }));
  card.querySelectorAll('[data-clear-collect]').forEach((button) => button.addEventListener('click', () => {
    const item = featureState.collection.items.find((row) => row.id === button.dataset.clearCollect);
    if (!item) return;
    item.cell = null;
    if (featureState.collection.placingItemId === item.id) featureState.collection.placingItemId = null;
    notifyChange();
    renderAll();
  }));
}

function itemHtml(item) {
  const placing = featureState.collection.placingItemId === item.id;
  const placed = item.cell ? `${item.cell.x}, ${item.cell.y}` : 'Not placed';
  return `<article class="feature-item ${placing ? 'is-placing' : ''}">
    <div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(placed)}</small></div>
    <div class="feature-item-actions">
      <button type="button" data-place-collect="${item.id}" title="Choose a path cell in Overview for this object.">${placing ? 'Pick…' : 'Place'}</button>
      <button type="button" disabled title="Archetype Object linking is queued; it is not available yet.">Link</button>
      <button type="button" data-clear-collect="${item.id}" title="Remove placed cell.">Clear</button>
    </div>
  </article>`;
}

function bindCollectionPlacement() {
  $('analysis-canvas')?.addEventListener('click', (event) => {
    const id = featureState.collection.placingItemId;
    if (!id || !featureState.enabled.collection) return;
    if (window.__artifexMazeConnections?.placementMode) return;
    const currentState = runtimeState();
    const cell = cellFromEvent(event, currentState);
    const item = featureState.collection.items.find((row) => row.id === id);
    if (!currentState || !cell || !item || !isPlaceableCell(currentState, cell)) return;
    if (featureState.collection.items.some((row) => row.id !== id && sameCell(row.cell, cell))) return;
    item.cell = cell;
    featureState.collection.placingItemId = null;
    notifyChange();
    renderAll();
  }, true);
}

function isPlaceableCell(currentState, cell) {
  if (currentState.matrix[cell.y]?.[cell.x] !== 0 || sameCell(currentState.start, cell) || sameCell(currentState.exit, cell)) return false;
  if (!isInsideShape(cell.x, cell.y, currentState.gridSize, currentState.layout, currentState.stretchX, currentState.stretchY)) return false;
  const occupied = window.__artifexMazeConnections?.pairs?.flatMap((pair) => [pair.entry, pair.exit]).filter(Boolean) || [];
  return !occupied.some((point) => sameCell(point, cell));
}

function cellFromEvent(event, currentState) {
  const canvas = $('analysis-canvas');
  if (!canvas || !currentState) return null;
  const rect = canvas.getBoundingClientRect();
  const dims = dimensions(canvas.width, canvas.height, currentState);
  const px = (event.clientX - rect.left) * (canvas.width / rect.width);
  const py = (event.clientY - rect.top) * (canvas.height / rect.height);
  const x = Math.floor((px - dims.ox) / dims.cellW);
  const y = Math.floor((py - dims.oy) / dims.cellH);
  return x >= 0 && y >= 0 && x < currentState.gridSize && y < currentState.gridSize ? { x, y } : null;
}

function dimensions(width, height, currentState) {
  const scaleX = Math.max(.6, Number(currentState.stretchX || 100) / 100);
  const scaleY = Math.max(.6, Number(currentState.stretchY || 100) / 100);
  const base = Math.min(width / (currentState.gridSize * scaleX + 3), height / (currentState.gridSize * scaleY + 3));
  return { cellW: base * scaleX, cellH: base * scaleY, ox: width / 2 - currentState.gridSize * base * scaleX / 2, oy: height / 2 - currentState.gridSize * base * scaleY / 2 };
}

function drawMarkersSoon() { requestAnimationFrame(() => setTimeout(drawCollectionMarkers, 30)); }
function drawCollectionMarkers() {
  const currentState = runtimeState();
  const canvas = $('analysis-canvas');
  if (!featureState.enabled.collection || !currentState || !canvas) return;
  const ctx = canvas.getContext('2d');
  const dims = dimensions(canvas.width, canvas.height, currentState);
  featureState.collection.items.forEach((item, index) => {
    if (!item.cell) return;
    const x = dims.ox + item.cell.x * dims.cellW + dims.cellW / 2;
    const y = dims.oy + item.cell.y * dims.cellH + dims.cellH / 2;
    const r = Math.max(7, Math.min(dims.cellW, dims.cellH) * .4);
    ctx.save(); ctx.fillStyle = '#e1c073'; ctx.strokeStyle = '#06140b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#06140b'; ctx.font = `900 ${Math.max(8, r * .88)}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${index + 1}`, x, y + .5); ctx.restore();
  });
}

function exportFeatures() {
  return {
    schemaVersion: 'artifex.mazeFeatures.v1',
    enabled: Object.entries(featureState.enabled).filter(([, value]) => value).map(([key]) => key),
    collection: featureState.enabled.collection ? {
      items: featureState.collection.items.map((item) => ({ id: item.id, label: item.label, cell: item.cell, archetypeObjectId: item.archetypeObjectId })),
      objectLinksStatus: 'pending_archetype_library_integration'
    } : null
  };
}

function patchExportPayload() {
  setTimeout(() => {
    const previous = window.__artifexAugmentPuzzlePayload;
    window.__artifexAugmentPuzzlePayload = (payload) => {
      const base = typeof previous === 'function' ? previous(payload) : payload;
      return { ...base, puzzle: { ...base.puzzle, features: exportFeatures() } };
    };
  }, 0);
}

function injectStyles() {
  if ($('maze-features-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-features-style';
  style.textContent = `
    .maze-feature-card{margin:9px 0 12px;padding:11px;border:1px solid rgba(158,230,164,.22);border-radius:15px;background:rgba(5,18,11,.92);}
    .feature-head{display:flex;justify-content:space-between;gap:8px;margin-bottom:9px}.feature-head strong{display:block;color:#eadfc6;font-size:.8rem}.feature-head small{display:block;color:#a9b59e;font-size:.63rem;line-height:1.3}.feature-count{height:max-content;padding:4px 7px;border:1px solid rgba(158,230,164,.28);border-radius:999px;color:#a8e8a3;font-size:.63rem;font-weight:900}
    .feature-add-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:9px}.feature-add-grid button{min-height:32px;padding:4px;border-radius:9px;border:1px solid rgba(158,230,164,.22);background:rgba(12,54,28,.7);color:#eadfc6;font-size:.65rem;font-weight:900}.feature-add-grid button.is-active{border-color:rgba(158,230,164,.55);box-shadow:0 0 11px rgba(158,230,164,.12)}.feature-add-grid button:disabled{opacity:.42}
    .maze-feature-setup-host{display:grid;gap:8px}.feature-setup-card{padding:9px;border:1px solid rgba(158,230,164,.18);border-radius:12px;background:rgba(0,0,0,.14)}.feature-setup-head{display:flex;justify-content:space-between;gap:7px;margin-bottom:8px}.feature-setup-head strong{font-size:.73rem;color:#eadfc6}.feature-setup-head small{display:block;font-size:.62rem;color:#a9b59e;line-height:1.3}.feature-setup-head button{min-width:28px;height:28px;border-radius:8px;border:1px solid rgba(204,49,49,.35);background:rgba(80,20,20,.3);color:#e89068}
    .feature-count-row{display:grid;grid-template-columns:1fr 58px auto;gap:6px;align-items:center;color:#d8d0ba;font-size:.67rem;margin-bottom:8px}.feature-count-row input{min-height:27px;min-width:0;border-radius:8px;border:1px solid rgba(158,230,164,.24);background:#07190e;color:#eadfc6;padding:3px 5px}.feature-count-row small{font-size:.61rem;color:#a9b59e}
    .feature-item-list{display:grid;gap:5px}.feature-item{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center;padding:6px;border:1px solid rgba(158,230,164,.12);border-radius:9px}.feature-item.is-placing{border-color:rgba(238,196,89,.4)}.feature-item strong{display:block;color:#eadfc6;font-size:.67rem}.feature-item small{font-size:.6rem;color:#a9b59e}.feature-item-actions{display:flex;gap:4px}.feature-item-actions button{min-height:27px;padding:3px 5px;border-radius:7px;border:1px solid rgba(158,230,164,.2);background:rgba(12,54,28,.65);color:#eadfc6;font-size:.6rem}.feature-item-actions button:disabled{opacity:.42}
    .feature-pending-note{margin:8px 0 0;color:#d8c185;font-size:.61rem;line-height:1.3}
  `;
  document.head.appendChild(style);
}
function sameCell(a,b){return !!a&&!!b&&a.x===b.x&&a.y===b.y;}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
