// Maze / Labyrinth connections
// Owns setup and Walk Test behaviour for Door and local Portal feature instances.
// Traboule and global Portal Registry linking remain deliberately unavailable until implemented.

import { isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
const TYPES = {
  door: { label: 'Door', markerIn: '#f1cf75', markerOut: '#e1c073', description: 'Visible paired doorway inside this maze. Walk Test transfers between its cells.' },
  portal: { label: 'Portal', markerIn: '#b58cff', markerOut: '#87dfff', description: 'Portal endpoint pair. Local transfer works now; global destination linking is queued.' }
};
const connectionState = { pairs: [], selectedId: null, placementMode: null, teleportCooldownUntil: 0 };
const previewMarkerTransform = { panX: 0, panY: 0, dragging: false, lastX: 0, lastY: 0 };

window.__artifexMazeConnections = connectionState;

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  bindFeatureRequests();
  bindOverviewPlacement();
  bindWalkTransfer();
  bindPreviewTransformMirror();
  bindMarkerRefresh();
  patchExportPayload();
});

function state() { return window.__artifexMazeRuntime?.state || null; }
function selectedPair() { return connectionState.pairs.find((pair) => pair.id === connectionState.selectedId) || null; }
function features() { return window.__artifexMazeFeatures; }

function bindFeatureRequests() {
  window.addEventListener('artifex-maze-feature-add-instance', (event) => {
    const type = event.detail?.type;
    if (type === 'door' || type === 'portal') addPair(type);
  });
}

function setupHost() { return $('maze-feature-setup-host'); }

function ensureBuilder() {
  const host = setupHost();
  if (!host || $('maze-connections')) return;
  const box = document.createElement('section');
  box.id = 'maze-connections';
  box.className = 'feature-setup-card maze-connections';
  box.innerHTML = `
    <div class="feature-setup-head connection-head">
      <div><strong>Doors & Portals</strong><small>Placed features. Completion Rules below decides whether using any of them is mandatory.</small></div>
      <span id="connection-status" class="connection-pill is-warning">0</span>
    </div>
    <div class="connection-place-row">
      <button id="btn-place-connection-entry" type="button" title="Place the first endpoint on a path cell.">▥ Entry</button>
      <button id="btn-place-connection-exit" type="button" title="Place the destination endpoint on a path cell.">✦ Exit</button>
      <button id="btn-delete-connection" type="button" title="Delete selected feature instance.">⌫ Delete</button>
    </div>
    <div id="connection-fields" hidden>
      <div class="connection-fields-row">
        <label><span>Label</span><input id="connection-label" type="text" maxlength="16" /></label>
        <label><span>Direction</span><select id="connection-direction" title="Whether travel can work in both directions."><option value="two_way">Two-way</option><option value="one_way">One-way</option></select></label>
      </div>
      <p id="connection-type-help" class="connection-type-help"></p>
      <div class="connection-pending-note">Image/FX selection will be connected to the Asset Library in a later pass.</div>
      <div id="portal-registry-status" class="connection-pending-note" hidden>Global Portal Registry linking is specified but not wired yet. This Portal currently links locally inside this maze.</div>
      <label class="connection-hint"><span>Hint</span><input id="connection-hint" type="text" placeholder="Optional Capra hint" /></label>
      <div id="connection-placement-note" class="connection-placement-note"></div>
    </div>
    <div id="connection-list" class="connection-list"></div>
  `;
  host.appendChild(box);
  $('btn-place-connection-entry')?.addEventListener('click', () => setPlacement('entry'));
  $('btn-place-connection-exit')?.addEventListener('click', () => setPlacement('exit'));
  $('btn-delete-connection')?.addEventListener('click', deleteSelected);
  $('connection-label')?.addEventListener('input', syncEditor);
  $('connection-direction')?.addEventListener('change', syncEditor);
  $('connection-hint')?.addEventListener('input', syncEditor);
}

function addPair(type) {
  ensureBuilder();
  const prefix = type === 'portal' ? 'P' : 'D';
  let number = 1;
  while (connectionState.pairs.some((pair) => pair.label === `${prefix}${number}`)) number++;
  const pair = { id: `${type}_${Date.now().toString(36)}`, type, label: `${prefix}${number}`, entry: null, exit: null, direction: 'two_way', hint: '', visualAssetId: null, destinationMode: 'local_pair' };
  connectionState.pairs.push(pair);
  connectionState.selectedId = pair.id;
  connectionState.placementMode = 'entry';
  emitChange();
  renderUi();
}

function setPlacement(mode) {
  if (!selectedPair()) return;
  connectionState.placementMode = mode;
  renderUi();
}

function deleteSelected() {
  const removed = selectedPair();
  if (!removed) return;
  connectionState.pairs = connectionState.pairs.filter((pair) => pair.id !== removed.id);
  connectionState.selectedId = connectionState.pairs[0]?.id || null;
  connectionState.placementMode = null;
  if (!connectionState.pairs.some((pair) => pair.type === removed.type)) features()?.disable?.(removed.type);
  if (!connectionState.pairs.length) $('maze-connections')?.remove();
  emitChange();
  renderUi();
}

function syncEditor() {
  const pair = selectedPair();
  if (!pair) return;
  pair.label = $('connection-label')?.value.trim() || pair.label;
  pair.direction = $('connection-direction')?.value || 'two_way';
  pair.hint = $('connection-hint')?.value || '';
  emitChange();
  renderUi(false);
}

function renderUi(syncFields = true) {
  if (!connectionState.pairs.length) return;
  ensureBuilder();
  const pair = selectedPair();
  if ($('connection-fields')) $('connection-fields').hidden = !pair;
  if (syncFields && pair) {
    if ($('connection-label')) $('connection-label').value = pair.label;
    if ($('connection-direction')) $('connection-direction').value = pair.direction;
    if ($('connection-hint')) $('connection-hint').value = pair.hint;
  }
  if (pair) {
    const type = TYPES[pair.type];
    if ($('connection-type-help')) $('connection-type-help').textContent = type.description;
    if ($('portal-registry-status')) $('portal-registry-status').hidden = pair.type !== 'portal';
    const message = connectionState.placementMode ? `Click a path cell in Overview to place ${pair.label} ${connectionState.placementMode}.` : pair.entry && pair.exit ? `${type.label} ${pair.label} is ready for Walk Test.` : `${type.label} ${pair.label} needs ${pair.entry ? 'an exit' : 'an entry'}.`;
    setNote(message, connectionState.placementMode ? 'is-active' : pair.entry && pair.exit ? 'is-good' : 'is-warning');
  }
  const incomplete = connectionState.pairs.filter((pair) => !pair.entry || !pair.exit).length;
  if ($('connection-status')) {
    $('connection-status').textContent = `${connectionState.pairs.length}`;
    $('connection-status').className = `connection-pill ${incomplete ? 'is-warning' : 'is-good'}`;
  }
  const list = $('connection-list');
  if (list) {
    list.innerHTML = connectionState.pairs.map(pairHtml).join('');
    list.querySelectorAll('[data-connection]').forEach((button) => button.addEventListener('click', () => {
      connectionState.selectedId = button.dataset.connection;
      connectionState.placementMode = null;
      renderUi();
    }));
  }
  drawMarkersSoon();
}

function pairHtml(pair) {
  return `<button type="button" class="connection-list-item ${pair.id === connectionState.selectedId ? 'is-selected' : ''}" data-connection="${pair.id}"><strong>${escapeHtml(pair.label)} · ${escapeHtml(TYPES[pair.type].label)}</strong><small>${pair.entry && pair.exit ? 'Ready' : 'Needs placement'} · ${pair.direction === 'two_way' ? 'Two-way' : 'One-way'}</small></button>`;
}
function setNote(text, klass) { const note = $('connection-placement-note'); if (note) { note.textContent = text; note.className = `connection-placement-note ${klass}`; } }
function emitChange() { window.dispatchEvent(new CustomEvent('artifex-maze-connections-updated', { detail: connectionState })); }

function bindOverviewPlacement() {
  $('analysis-canvas')?.addEventListener('click', (event) => {
    const pair = selectedPair();
    if (!pair || !connectionState.placementMode) return;
    const currentState = state();
    const cell = cellFromEvent(event, currentState);
    if (!currentState || !cell || !isOpenPathCell(currentState, cell)) { setNote('Choose a valid path cell inside the maze.', 'is-warning'); return; }
    const itemCells = features()?.collectionItems?.().map((item) => item.cell).filter(Boolean) || [];
    if (itemCells.some((point) => sameCell(point, cell))) { setNote('That cell is already used by a collection object.', 'is-warning'); return; }
    pair[connectionState.placementMode] = cell;
    connectionState.placementMode = connectionState.placementMode === 'entry' && !pair.exit ? 'exit' : null;
    emitChange();
    renderUi();
  }, true);
}

function cellFromEvent(event, currentState) {
  const canvas = $('analysis-canvas');
  if (!currentState || !canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const dims = dimensions(canvas.width, canvas.height, currentState);
  const px = (event.clientX - rect.left) * (canvas.width / rect.width);
  const py = (event.clientY - rect.top) * (canvas.height / rect.height);
  const x = Math.floor((px - dims.ox) / dims.cellW);
  const y = Math.floor((py - dims.oy) / dims.cellH);
  return x >= 0 && y >= 0 && x < currentState.gridSize && y < currentState.gridSize ? { x, y } : null;
}
function dimensions(width, height, currentState, zoom = 1) {
  const scaleX = Math.max(.6, Number(currentState.stretchX || 100) / 100), scaleY = Math.max(.6, Number(currentState.stretchY || 100) / 100);
  const base = Math.min(width / (currentState.gridSize * scaleX + 3), height / (currentState.gridSize * scaleY + 3)) * Number(zoom || 1);
  return { cellW: base * scaleX, cellH: base * scaleY, ox: width / 2 - currentState.gridSize * base * scaleX / 2, oy: height / 2 - currentState.gridSize * base * scaleY / 2 };
}
function isOpenPathCell(currentState, cell) { return currentState.matrix[cell.y]?.[cell.x] === 0 && isInsideShape(cell.x, cell.y, currentState.gridSize, currentState.layout, currentState.stretchX, currentState.stretchY) && !sameCell(cell, currentState.start) && !sameCell(cell, currentState.exit); }

function bindWalkTransfer() {
  setInterval(() => {
    const currentState = state();
    if (!currentState || currentState.view !== 'walktest' || Date.now() < connectionState.teleportCooldownUntil) return;
    for (const pair of connectionState.pairs) {
      if (!pair.entry || !pair.exit) continue;
      if (touches(currentState.player, pair.entry)) { transfer(pair, pair.exit); return; }
      if (pair.direction === 'two_way' && touches(currentState.player, pair.exit)) { transfer(pair, pair.entry); return; }
    }
  }, 40);
}
function touches(player, cell) { return !!player && !!cell && (Math.hypot(player.x - (cell.x + .5), player.y - (cell.y + .5)) <= .58 || sameCell({ x: Math.floor(player.x), y: Math.floor(player.y) }, cell)); }
function transfer(pair, destination) {
  const currentState = state(); if (!currentState) return;
  currentState.player = { x: destination.x + .5, y: destination.y + .5 };
  connectionState.teleportCooldownUntil = Date.now() + 750;
  if ($('player-status-indicator')) $('player-status-indicator').textContent = `${TYPES[pair.type].label} ${pair.label} used`;
  window.__artifexMazeRuntimeControls?.repaintAll?.();
}

function bindPreviewTransformMirror() {
  const surface = document.querySelector('.render-viewport') || $('threejs-container');
  if (!surface) return;
  surface.addEventListener('mousedown', (event) => {
    if (event.button !== 1 && event.button !== 2) return;
    previewMarkerTransform.dragging = true;
    previewMarkerTransform.lastX = event.clientX;
    previewMarkerTransform.lastY = event.clientY;
  }, true);
  window.addEventListener('mousemove', (event) => {
    if (!previewMarkerTransform.dragging) return;
    previewMarkerTransform.panX += event.clientX - previewMarkerTransform.lastX;
    previewMarkerTransform.panY += event.clientY - previewMarkerTransform.lastY;
    previewMarkerTransform.lastX = event.clientX;
    previewMarkerTransform.lastY = event.clientY;
    drawMarkersSoon();
  }, true);
  window.addEventListener('mouseup', () => { previewMarkerTransform.dragging = false; }, true);
  $('btn-zoom-reset')?.addEventListener('click', () => {
    previewMarkerTransform.panX = 0;
    previewMarkerTransform.panY = 0;
    drawMarkersSoon();
  }, true);
}

function bindMarkerRefresh() { ['click', 'input', 'change', 'keydown'].forEach((name) => document.addEventListener(name, drawMarkersSoon, true)); setInterval(drawMarkers, 180); }
function drawMarkersSoon() { requestAnimationFrame(() => setTimeout(drawMarkers, 25)); }
function drawMarkers() { drawOnCanvas($('analysis-canvas'), false); drawOnCanvas($('maze-preview-canvas'), true); }
function drawOnCanvas(canvas, preview) {
  const currentState = state(); if (!canvas || !currentState || !connectionState.pairs.length || (preview && currentState.view === '3d')) return;
  const rect = preview ? canvas.getBoundingClientRect() : null, width = preview ? rect.width : canvas.width, height = preview ? rect.height : canvas.height;
  if (!width || !height) return;
  const zoom = preview ? Number(currentState.zoom || 1) : 1;
  const offset = preview ? previewMarkerTransform : { panX: 0, panY: 0 };
  const ratio = preview ? window.devicePixelRatio || 1 : 1, dims = dimensions(width, height, currentState, zoom), ctx = canvas.getContext('2d');
  ctx.save(); if (preview) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  connectionState.pairs.forEach((pair) => { const type = TYPES[pair.type]; if (pair.entry) drawMarker(ctx, dims, currentState, pair.entry, pair.label, type.markerIn, 'I', offset); if (pair.exit) drawMarker(ctx, dims, currentState, pair.exit, pair.label, type.markerOut, 'O', offset); });
  ctx.restore();
}
function drawMarker(ctx, dims, currentState, cell, label, color, suffix, offset) {
  const pos = warpedPoint(cell, dims, currentState);
  const x = dims.ox + offset.panX + pos.x + dims.cellW / 2;
  const y = dims.oy + offset.panY + pos.y + dims.cellH / 2;
  const r = Math.max(7, Math.min(dims.cellW, dims.cellH) * .44);
  ctx.fillStyle = color; ctx.strokeStyle = '#06140b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#06140b'; ctx.font = `900 ${Math.max(8, r * .82)}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${label}${suffix}`, x, y + .5);
}
function warpedPoint(cell, dims, currentState) {
  let x = cell.x * dims.cellW;
  let y = cell.y * dims.cellH;
  const warp = Number(currentState.warp || 0) / 100;
  if (warp) {
    x += Math.sin(cell.y * 1.37 + cell.x * 0.31) * dims.cellW * 0.42 * warp;
    y += Math.cos(cell.x * 1.21 + cell.y * 0.27) * dims.cellH * 0.42 * warp;
  }
  return { x, y };
}

function patchExportPayload() {
  setTimeout(() => { const previous = window.__artifexAugmentPuzzlePayload; window.__artifexAugmentPuzzlePayload = (payload) => { const base = typeof previous === 'function' ? previous(payload) : payload; return { ...base, puzzle: { ...base.puzzle, connections: exportConnections() } }; }; }, 0);
}
function exportConnections() {
  return { schemaVersion: 'artifex.mazeConnections.v2', doors: connectionState.pairs.filter((pair) => pair.type === 'door'), portalEndpoints: connectionState.pairs.filter((pair) => pair.type === 'portal').map((pair) => ({ ...pair, registryStatus: 'local_pair_pending_global_registry' })), traboules: [], status: connectionState.pairs.some((pair) => !pair.entry || !pair.exit) ? 'needs_placement' : 'ready' };
}

function injectStyles() {
  if ($('maze-connections-style')) return;
  const style = document.createElement('style'); style.id = 'maze-connections-style'; style.textContent = `
    .maze-connections{margin:0;padding:9px;border:1px solid rgba(158,230,164,.18);border-radius:12px;background:rgba(0,0,0,.14)}
    .connection-head{align-items:flex-start;margin-bottom:8px}.connection-head strong{font-size:.73rem!important}.connection-head small{font-size:.61rem!important}
    .connection-pill{height:max-content;padding:4px 7px;border-radius:999px;font-size:.6rem;font-weight:900}.connection-pill.is-warning{color:#f1cf75;border:1px solid rgba(238,196,89,.33)}.connection-pill.is-good{color:#a8e8a3;border:1px solid rgba(122,220,139,.34)}
    .connection-place-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-bottom:7px}.connection-place-row button{min-height:28px;padding:3px;border-radius:8px;border:1px solid rgba(158,230,164,.2);background:rgba(12,54,28,.65);color:#eadfc6;font-size:.6rem;font-weight:900}
    .connection-fields-row{display:grid;grid-template-columns:1fr 98px;gap:6px;margin-bottom:6px}.connection-fields-row label,.connection-hint{display:grid;gap:3px;color:#d8d0ba;font-size:.62rem}.connection-fields-row input,.connection-fields-row select,.connection-hint input{min-height:27px;min-width:0;border-radius:7px;border:1px solid rgba(158,230,164,.2);background:#07190e;color:#eadfc6;padding:3px 5px;font-size:.67rem;color-scheme:dark}.connection-fields-row option{background:#07190e;color:#eadfc6}
    .connection-type-help,.connection-pending-note,.connection-placement-note{font-size:.6rem;line-height:1.3;padding:6px;margin:6px 0;border-radius:8px;border:1px solid rgba(158,230,164,.13);color:#a9b59e;background:rgba(0,0,0,.13)}.connection-pending-note{color:#d8c185;border-color:rgba(238,196,89,.22)}.connection-placement-note.is-active,.connection-placement-note.is-warning{color:#f1cf75;border-color:rgba(238,196,89,.33)}.connection-placement-note.is-good{color:#a8e8a3;border-color:rgba(122,220,139,.3)}
    .connection-list{display:grid;gap:5px;margin-top:7px}.connection-list-item{text-align:left;padding:6px 7px;border-radius:8px;border:1px solid rgba(158,230,164,.14);background:rgba(0,0,0,.12);color:#eadfc6}.connection-list-item.is-selected{border-color:rgba(158,230,164,.43)}.connection-list-item strong{display:block;font-size:.65rem}.connection-list-item small{font-size:.59rem;color:#a9b59e}
  `; document.head.appendChild(style);
}
function sameCell(a,b){return !!a&&!!b&&a.x===b.x&&a.y===b.y;}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
