// Maze / Labyrinth connections
// Owns local Doors and locally paired Portal endpoints used by Walk Test.
// Traboules and global Portal Registry linking are shown as queued until their real systems exist.

import { isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
const TYPES = {
  door: {
    label: 'Door',
    markerIn: '#f1cf75',
    markerOut: '#e1c073',
    description: 'A visible paired doorway inside this maze. Walk Test transfers between its two cells.'
  },
  portal: {
    label: 'Portal',
    markerIn: '#b58cff',
    markerOut: '#87dfff',
    description: 'A Portal endpoint. Local paired transfer works now; cross-game destination registry linking is the next implementation step.'
  }
};

const connectionState = {
  pairs: [],
  selectedId: null,
  placementMode: null,
  teleportCooldownUntil: 0
};

window.__artifexMazeConnections = connectionState;

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  injectBuilder();
  bindUi();
  bindOverviewPlacement();
  bindWalkTransfer();
  bindMarkerRefresh();
  patchExportPayload();
  renderUi();
});

function state() { return window.__artifexMazeRuntime?.state || null; }
function selectedPair() { return connectionState.pairs.find((item) => item.id === connectionState.selectedId) || null; }
function nextLabel(type) {
  const prefix = type === 'portal' ? 'P' : 'D';
  let n = 1;
  while (connectionState.pairs.some((item) => item.label === `${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}

function injectBuilder() {
  if ($('maze-connections')) return;
  const logicPanel = document.querySelector('[data-panel-content="logic"]');
  const completion = $('completion-rule-builder');
  if (!logicPanel) return;
  const box = document.createElement('section');
  box.id = 'maze-connections';
  box.className = 'maze-connections';
  box.innerHTML = `
    <div class="connection-head">
      <div><strong>Connections</strong><small>Doors are local paired passages. Portals are endpoint links.</small></div>
      <span id="connection-status" class="connection-pill is-empty">0</span>
    </div>
    <div class="connection-add-row">
      <button id="btn-add-door" type="button" title="Add a visible local door connection.">🚪 Door</button>
      <button id="btn-add-endpoint" type="button" title="Add a Portal endpoint pair in this maze.">✦ Portal</button>
      <button id="btn-add-traboule" type="button" disabled title="Traboule will be a hidden pass-through wall tool; it is not built yet.">▧ Traboule</button>
    </div>
    <div id="connection-editor" class="connection-editor is-empty">
      <p id="connection-empty">Choose Door or Portal to add a connection.</p>
      <div id="connection-fields" hidden>
        <div class="connection-place-row">
          <button id="btn-place-connection-entry" type="button" title="Place the first endpoint on a path cell.">▥ Entry</button>
          <button id="btn-place-connection-exit" type="button" title="Place the destination endpoint on a path cell.">✦ Exit</button>
          <button id="btn-delete-connection" type="button" title="Delete selected connection.">⌫ Delete</button>
        </div>
        <div class="connection-fields-row">
          <label><span>Label</span><input id="connection-label" type="text" maxlength="16" /></label>
          <label><span>Direction</span><select id="connection-direction" title="Whether travel can work in both directions."><option value="two_way">Two-way</option><option value="one_way">One-way</option></select></label>
        </div>
        <p id="connection-type-help" class="connection-type-help"></p>
        <div id="connection-visual-status" class="connection-pending-note">Visual asset selection will be linked to the project asset library in a later pass.</div>
        <div id="portal-registry-status" class="connection-pending-note" hidden>Global Portal Registry linking is specified in project docs but is not wired into the app yet. This Portal currently links locally inside this maze.</div>
        <label class="connection-hint"><span>Hint text</span><input id="connection-hint" type="text" placeholder="Optional Capra hint" /></label>
        <div id="connection-placement-note" class="connection-placement-note"></div>
      </div>
    </div>
    <div id="connection-list" class="connection-list"></div>
    <p class="traboule-note">Traboule is queued as a wall collision override: it should look like a normal wall but let the player walk through it.</p>
  `;
  if (completion) completion.insertAdjacentElement('afterend', box);
  else logicPanel.appendChild(box);
}

function bindUi() {
  $('btn-add-door')?.addEventListener('click', () => addPair('door'));
  $('btn-add-endpoint')?.addEventListener('click', () => addPair('portal'));
  $('btn-place-connection-entry')?.addEventListener('click', () => setPlacement('entry'));
  $('btn-place-connection-exit')?.addEventListener('click', () => setPlacement('exit'));
  $('btn-delete-connection')?.addEventListener('click', deleteSelected);
  $('connection-label')?.addEventListener('input', syncEditor);
  $('connection-direction')?.addEventListener('change', syncEditor);
  $('connection-hint')?.addEventListener('input', syncEditor);
}

function addPair(type) {
  const pair = {
    id: `${type}_${Date.now().toString(36)}`,
    type,
    label: nextLabel(type),
    entry: null,
    exit: null,
    direction: 'two_way',
    hint: '',
    visualAssetId: null,
    destinationMode: type === 'portal' ? 'local_pair' : 'local_pair'
  };
  connectionState.pairs.push(pair);
  connectionState.selectedId = pair.id;
  connectionState.placementMode = 'entry';
  renderUi();
}

function setPlacement(mode) {
  if (!selectedPair()) return;
  connectionState.placementMode = mode;
  renderUi();
}

function deleteSelected() {
  connectionState.pairs = connectionState.pairs.filter((item) => item.id !== connectionState.selectedId);
  connectionState.selectedId = connectionState.pairs[0]?.id || null;
  connectionState.placementMode = null;
  renderUi();
}

function syncEditor() {
  const pair = selectedPair();
  if (!pair) return;
  pair.label = $('connection-label')?.value.trim() || pair.label;
  pair.direction = $('connection-direction')?.value || 'two_way';
  pair.hint = $('connection-hint')?.value || '';
  renderUi(false);
}

function renderUi(syncFields = true) {
  const pair = selectedPair();
  const fields = $('connection-fields');
  const empty = $('connection-empty');
  if (fields) fields.hidden = !pair;
  if (empty) empty.hidden = !!pair;
  if (syncFields && pair) {
    if ($('connection-label')) $('connection-label').value = pair.label;
    if ($('connection-direction')) $('connection-direction').value = pair.direction;
    if ($('connection-hint')) $('connection-hint').value = pair.hint;
  }
  if (pair) {
    const type = TYPES[pair.type];
    if ($('connection-type-help')) $('connection-type-help').textContent = type.description;
    if ($('portal-registry-status')) $('portal-registry-status').hidden = pair.type !== 'portal';
    const message = connectionState.placementMode
      ? `Click a path cell in Overview to place ${pair.label} ${connectionState.placementMode}.`
      : pair.entry && pair.exit
        ? `${type.label} ${pair.label} is ready for Walk Test transfer.`
        : `${type.label} ${pair.label} still needs ${pair.entry ? 'an exit' : 'an entry'}.`;
    setNote(message, connectionState.placementMode ? 'is-active' : pair.entry && pair.exit ? 'is-good' : 'is-warning');
  }
  const incomplete = connectionState.pairs.filter((item) => !item.entry || !item.exit).length;
  if ($('connection-status')) {
    $('connection-status').textContent = `${connectionState.pairs.length}`;
    $('connection-status').className = `connection-pill ${connectionState.pairs.length ? (incomplete ? 'is-warning' : 'is-good') : 'is-empty'}`;
  }
  const list = $('connection-list');
  if (list) {
    list.innerHTML = connectionState.pairs.map((item) => pairHtml(item)).join('');
    list.querySelectorAll('[data-connection]').forEach((button) => button.addEventListener('click', () => {
      connectionState.selectedId = button.dataset.connection;
      connectionState.placementMode = null;
      renderUi();
    }));
  }
  drawMarkersSoon();
}

function pairHtml(pair) {
  const type = TYPES[pair.type].label;
  const placed = pair.entry && pair.exit ? 'Ready' : 'Needs cells';
  return `<button type="button" class="connection-list-item ${pair.id === connectionState.selectedId ? 'is-selected' : ''}" data-connection="${pair.id}"><strong>${escapeHtml(pair.label)} · ${escapeHtml(type)}</strong><small>${placed} · ${pair.direction === 'two_way' ? 'Two-way' : 'One-way'}</small></button>`;
}

function setNote(text, klass) {
  const note = $('connection-placement-note');
  if (!note) return;
  note.textContent = text;
  note.className = `connection-placement-note ${klass}`;
}

function bindOverviewPlacement() {
  $('analysis-canvas')?.addEventListener('click', (event) => {
    const pair = selectedPair();
    if (!pair || !connectionState.placementMode) return;
    const currentState = state();
    const cell = cellFromEvent(event);
    if (!currentState || !cell || !isOpenPathCell(currentState, cell)) {
      setNote('Choose a valid path cell inside the maze.', 'is-warning');
      return;
    }
    const itemCells = window.__artifexMazeCompletionRules?.items?.map((item) => item.cell).filter(Boolean) || [];
    if (itemCells.some((point) => sameCell(point, cell))) {
      setNote('That cell is already used by a required object.', 'is-warning');
      return;
    }
    pair[connectionState.placementMode] = cell;
    connectionState.placementMode = connectionState.placementMode === 'entry' && !pair.exit ? 'exit' : null;
    renderUi();
  }, true);
}

function cellFromEvent(event) {
  const currentState = state();
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

function dimensions(width, height, currentState) {
  const scaleX = Math.max(0.6, Number(currentState.stretchX || 100) / 100);
  const scaleY = Math.max(0.6, Number(currentState.stretchY || 100) / 100);
  const base = Math.min(width / (currentState.gridSize * scaleX + 3), height / (currentState.gridSize * scaleY + 3));
  return { cellW: base * scaleX, cellH: base * scaleY, ox: width / 2 - currentState.gridSize * base * scaleX / 2, oy: height / 2 - currentState.gridSize * base * scaleY / 2 };
}

function isOpenPathCell(currentState, cell) {
  return currentState.matrix[cell.y]?.[cell.x] === 0 && isInsideShape(cell.x, cell.y, currentState.gridSize, currentState.layout, currentState.stretchX, currentState.stretchY) && !sameCell(cell, currentState.start) && !sameCell(cell, currentState.exit);
}

function bindWalkTransfer() {
  window.setInterval(() => {
    const currentState = state();
    if (!currentState || currentState.view !== 'walktest' || Date.now() < connectionState.teleportCooldownUntil) return;
    connectionState.pairs.forEach((pair) => {
      if (!pair.entry || !pair.exit) return;
      if (touches(currentState.player, pair.entry)) transfer(pair, pair.exit);
      else if (pair.direction === 'two_way' && touches(currentState.player, pair.exit)) transfer(pair, pair.entry);
    });
  }, 40);
}

function touches(player, cell) {
  if (!player || !cell) return false;
  return Math.hypot(player.x - (cell.x + 0.5), player.y - (cell.y + 0.5)) <= 0.58 || sameCell({ x: Math.floor(player.x), y: Math.floor(player.y) }, cell);
}

function transfer(pair, destination) {
  const currentState = state();
  if (!currentState) return;
  currentState.player = { x: destination.x + 0.5, y: destination.y + 0.5 };
  connectionState.teleportCooldownUntil = Date.now() + 750;
  if ($('player-status-indicator')) $('player-status-indicator').textContent = `${TYPES[pair.type].label} ${pair.label} used`;
  window.__artifexMazeRuntimeControls?.repaintAll?.();
}

function bindMarkerRefresh() {
  ['click', 'input', 'change', 'keydown'].forEach((name) => document.addEventListener(name, drawMarkersSoon, true));
  window.setInterval(drawMarkers, 180);
}

function drawMarkersSoon() { requestAnimationFrame(() => setTimeout(drawMarkers, 25)); }
function drawMarkers() {
  drawOnCanvas($('analysis-canvas'), false);
  drawOnCanvas($('maze-preview-canvas'), true);
}

function drawOnCanvas(canvas, preview) {
  const currentState = state();
  if (!canvas || !currentState || !connectionState.pairs.length || (preview && currentState.view === '3d')) return;
  const ctx = canvas.getContext('2d');
  const rect = preview ? canvas.getBoundingClientRect() : null;
  const width = preview ? rect.width : canvas.width;
  const height = preview ? rect.height : canvas.height;
  if (!width || !height) return;
  const ratio = preview ? window.devicePixelRatio || 1 : 1;
  const dims = dimensions(width, height, currentState);
  ctx.save();
  if (preview) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  connectionState.pairs.forEach((pair) => {
    const type = TYPES[pair.type];
    if (pair.entry) drawMarker(ctx, dims, pair.entry, pair.label, type.markerIn, 'I');
    if (pair.exit) drawMarker(ctx, dims, pair.exit, pair.label, type.markerOut, 'O');
  });
  ctx.restore();
}

function drawMarker(ctx, dims, cell, label, color, suffix) {
  const x = dims.ox + cell.x * dims.cellW + dims.cellW / 2;
  const y = dims.oy + cell.y * dims.cellH + dims.cellH / 2;
  const r = Math.max(7, Math.min(dims.cellW, dims.cellH) * 0.44);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#06140b';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#06140b';
  ctx.font = `900 ${Math.max(8, r * 0.82)}px Inter, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`${label}${suffix}`, x, y + 0.5);
}

function patchExportPayload() {
  setTimeout(() => {
    const previous = window.__artifexAugmentPuzzlePayload;
    window.__artifexAugmentPuzzlePayload = (payload) => {
      const base = typeof previous === 'function' ? previous(payload) : payload;
      return { ...base, puzzle: { ...base.puzzle, connections: exportConnections() } };
    };
  }, 0);
}

function exportConnections() {
  return {
    schemaVersion: 'artifex.mazeConnections.v1',
    doors: connectionState.pairs.filter((item) => item.type === 'door'),
    portalEndpoints: connectionState.pairs.filter((item) => item.type === 'portal').map((item) => ({ ...item, registryStatus: 'local_pair_pending_global_registry' })),
    traboules: [],
    status: connectionState.pairs.some((item) => !item.entry || !item.exit) ? 'needs_placement' : 'ready'
  };
}

function injectStyles() {
  if ($('maze-connections-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-connections-style';
  style.textContent = `
    .maze-connections{margin:10px 0 14px;padding:11px;border:1px solid rgba(158,230,164,.22);border-radius:16px;background:rgba(5,18,11,.92);}
    .connection-head{display:flex;justify-content:space-between;gap:8px;margin-bottom:9px;}.connection-head strong{display:block;color:#eadfc6;font-size:.82rem;}.connection-head small{display:block;color:#a9b59e;font-size:.64rem;line-height:1.3;}
    .connection-pill{padding:4px 7px;border-radius:999px;font-size:.62rem;font-weight:900;}.connection-pill.is-empty{color:#a9b59e;border:1px solid rgba(255,255,255,.13);}.connection-pill.is-warning{color:#f1cf75;border:1px solid rgba(238,196,89,.33);}.connection-pill.is-good{color:#a8e8a3;border:1px solid rgba(122,220,139,.34);}
    .connection-add-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:9px;}.connection-add-row button,.connection-place-row button{min-height:33px;border-radius:10px;border:1px solid rgba(158,230,164,.25);background:rgba(12,54,28,.75);color:#eadfc6;font-size:.67rem;font-weight:900;padding:4px;}.connection-add-row button:disabled{opacity:.45;}
    .connection-editor{border:1px solid rgba(158,230,164,.12);border-radius:12px;padding:8px;background:rgba(0,0,0,.13);}.connection-editor>p{margin:0;color:#a9b59e;font-size:.68rem;}.connection-place-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;}.connection-fields-row{display:grid;grid-template-columns:1fr 112px;gap:7px;margin-bottom:7px;}.connection-fields-row label,.connection-hint{display:grid;gap:3px;color:#d8d0ba;font-size:.66rem;}.connection-fields-row input,.connection-fields-row select,.connection-hint input{min-height:29px;min-width:0;border-radius:8px;border:1px solid rgba(158,230,164,.24);background:#07190e;color:#eadfc6;padding:4px 6px;font-size:.72rem;color-scheme:dark;}.connection-fields-row option{background:#07190e;color:#eadfc6;}
    .connection-type-help,.connection-pending-note,.traboule-note,.connection-placement-note{font-size:.64rem;line-height:1.35;padding:6px 7px;margin:7px 0;border-radius:9px;border:1px solid rgba(158,230,164,.13);color:#a9b59e;background:rgba(0,0,0,.13);}.connection-pending-note,.traboule-note{color:#d8c185;border-color:rgba(238,196,89,.22);}.connection-placement-note.is-active,.connection-placement-note.is-warning{color:#f1cf75;border-color:rgba(238,196,89,.33);}.connection-placement-note.is-good{color:#a8e8a3;border-color:rgba(122,220,139,.3);}
    .connection-list{display:grid;gap:5px;margin-top:8px;}.connection-list-item{text-align:left;padding:7px 8px;border-radius:10px;border:1px solid rgba(158,230,164,.15);background:rgba(0,0,0,.12);color:#eadfc6;}.connection-list-item.is-selected{border-color:rgba(158,230,164,.45);}.connection-list-item strong{display:block;font-size:.7rem;}.connection-list-item small{font-size:.62rem;color:#a9b59e;}
  `;
  document.head.appendChild(style);
}

function sameCell(a, b) { return !!a && !!b && a.x === b.x && a.y === b.y; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char])); }
