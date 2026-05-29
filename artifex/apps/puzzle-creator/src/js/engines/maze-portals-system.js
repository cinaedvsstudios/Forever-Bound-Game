// Maze / Labyrinth portal system
// Owns portal pair authoring, markers, walk-test teleporting, and portal export.

import { isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);

const PORTAL_TYPES = {
  door: {
    label: 'Door',
    description: 'A visible paired doorway. In Walk Test it transports the player between the two placed door cells.'
  },
  traboule: {
    label: 'Traboule',
    description: 'A concealed passage or shortcut between two places, like a hidden corridor through a building or maze wall.'
  },
  portal: {
    label: 'Portal',
    description: 'A magical or non-physical transfer point. It uses the same destination logic, but exports as a portal for later visual effects.'
  }
};

const portalState = {
  pairs: [],
  selectedId: null,
  placementMode: null,
  teleportCooldownUntil: 0,
  lastTeleportLabel: ''
};

window.__artifexMazePortals = portalState;
window.__artifexMazePortalsSystemStable = true;

window.addEventListener('DOMContentLoaded', () => {
  injectPortalStyles();
  injectPortalBuilder();
  bindPortalUi();
  bindOverviewPlacement();
  bindTeleportLoop();
  bindPortalMarkerRefresh();
  patchExportPayload();
});

function state() {
  return window.__artifexMazeRuntime?.state || null;
}

function injectPortalBuilder() {
  if ($('portal-builder')) return;
  const logicPanel = document.querySelector('[data-panel-content="logic"]');
  const completionBuilder = $('completion-rule-builder');
  const anchor = completionBuilder || $('btn-copy-json') || logicPanel?.lastElementChild;
  if (!logicPanel || !anchor) return;

  const box = document.createElement('section');
  box.id = 'portal-builder';
  box.className = 'portal-builder';
  box.innerHTML = `
    <div class="portal-builder-head">
      <div>
        <strong>Portals</strong>
        <small>Pair doors, traboules or portals. Click Entry or Exit, then click a path cell in the Overview.</small>
      </div>
      <span id="portal-builder-status" class="portal-status-pill is-empty">0 pairs</span>
    </div>
    <div class="portal-action-row">
      <button id="btn-add-portal" type="button" title="Create a new connected pair">➕ Add Pair</button>
      <button id="btn-place-portal-entry" type="button" title="Place the connected-pair entry on the Overview">🚪 Entry</button>
      <button id="btn-place-portal-exit" type="button" title="Place the connected-pair exit on the Overview">✨ Exit</button>
      <button id="btn-delete-portal" type="button" title="Delete the selected connected pair">🗑 Delete</button>
    </div>
    <div class="portal-editor-row">
      <label class="portal-label-field"><span>Label</span><input id="portal-label-input" type="text" maxlength="12" value="A" /></label>
      <label class="portal-type-field"><span>Type</span><select id="portal-type-select"><option value="door">Door</option><option value="traboule">Traboule</option><option value="portal">Portal</option></select></label>
      <label class="portal-toggle"><input id="portal-two-way" type="checkbox" checked /> Two-way</label>
      <label class="portal-toggle"><input id="portal-required" type="checkbox" /> Required</label>
    </div>
    <p id="portal-type-help" class="portal-type-help"></p>
    <label class="portal-hint-row"><span>Capra hint</span><input id="portal-hint-input" type="text" placeholder="Optional hint text" /></label>
    <div id="portal-placement-note" class="portal-placement-note">No connected pair selected yet.</div>
    <div id="portal-pair-list" class="portal-pair-list"></div>
  `;

  anchor.insertAdjacentElement(completionBuilder ? 'afterend' : 'beforebegin', box);
}

function bindPortalUi() {
  $('btn-add-portal')?.addEventListener('click', addPair);
  $('btn-place-portal-entry')?.addEventListener('click', () => setPlacementMode('entry'));
  $('btn-place-portal-exit')?.addEventListener('click', () => setPlacementMode('exit'));
  $('btn-delete-portal')?.addEventListener('click', deleteSelectedPair);
  $('portal-label-input')?.addEventListener('input', syncSelectedFromInputs);
  $('portal-type-select')?.addEventListener('change', syncSelectedFromInputs);
  $('portal-two-way')?.addEventListener('change', syncSelectedFromInputs);
  $('portal-required')?.addEventListener('change', syncSelectedFromInputs);
  $('portal-hint-input')?.addEventListener('input', syncSelectedFromInputs);
  renderPortalUi();
}

function addPair() {
  const id = `portal_${Date.now().toString(36)}`;
  const label = nextLabel();
  portalState.pairs.push({
    id,
    label,
    entry: null,
    exit: null,
    type: 'door',
    twoWay: true,
    required: false,
    hint: ''
  });
  portalState.selectedId = id;
  portalState.placementMode = 'entry';
  renderPortalUi();
}

function nextLabel() {
  const used = new Set(portalState.pairs.map((pair) => pair.label));
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const letter of letters) if (!used.has(letter)) return letter;
  return String(portalState.pairs.length + 1);
}

function selectedPair() {
  return portalState.pairs.find((pair) => pair.id === portalState.selectedId) || null;
}

function setPlacementMode(mode) {
  if (!selectedPair()) addPair();
  portalState.placementMode = mode;
  renderPortalUi();
}

function syncSelectedFromInputs() {
  const pair = selectedPair();
  if (!pair) return;
  pair.label = $('portal-label-input')?.value.trim() || pair.label;
  pair.type = $('portal-type-select')?.value || 'door';
  pair.twoWay = !!$('portal-two-way')?.checked;
  pair.required = !!$('portal-required')?.checked;
  pair.hint = $('portal-hint-input')?.value || '';
  renderPortalUi(false);
}

function deleteSelectedPair() {
  if (!portalState.selectedId) return;
  portalState.pairs = portalState.pairs.filter((pair) => pair.id !== portalState.selectedId);
  portalState.selectedId = portalState.pairs[0]?.id || null;
  portalState.placementMode = null;
  renderPortalUi();
}

function bindOverviewPlacement() {
  const canvas = $('analysis-canvas');
  if (!canvas) return;
  canvas.addEventListener('click', (event) => {
    if (!portalState.placementMode || !selectedPair()) return;
    const cell = canvasEventToCell(event);
    const currentState = state();
    if (!cell || !currentState || !isOpenCell(currentState, cell.x, cell.y)) {
      setPlacementNote('Choose a path cell inside the maze. Walls and outside-shape cells cannot hold a connected pair.', 'is-warning');
      return;
    }
    const pair = selectedPair();
    pair[portalState.placementMode] = cell;
    portalState.placementMode = portalState.placementMode === 'entry' && !pair.exit ? 'exit' : null;
    renderPortalUi();
    drawPortalMarkersSoon();
  }, true);
}

function canvasEventToCell(event) {
  const currentState = state();
  const canvas = $('analysis-canvas');
  if (!currentState || !canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const px = (event.clientX - rect.left) * (canvas.width / rect.width);
  const py = (event.clientY - rect.top) * (canvas.height / rect.height);
  const dims = overviewDimensions(canvas.width, canvas.height);
  const x = Math.floor((px - dims.ox) / dims.cellW);
  const y = Math.floor((py - dims.oy) / dims.cellH);
  if (x < 0 || y < 0 || x >= currentState.gridSize || y >= currentState.gridSize) return null;
  return { x, y };
}

function overviewDimensions(width, height) {
  const currentState = state();
  const scaleX = Math.max(0.6, (currentState?.stretchX || 100) / 100);
  const scaleY = Math.max(0.6, (currentState?.stretchY || 100) / 100);
  const base = Math.min(width / ((currentState?.gridSize || 20) * scaleX + 3), height / ((currentState?.gridSize || 20) * scaleY + 3));
  const cellW = base * scaleX;
  const cellH = base * scaleY;
  return {
    cellW,
    cellH,
    ox: width / 2 - ((currentState?.gridSize || 20) * cellW) / 2,
    oy: height / 2 - ((currentState?.gridSize || 20) * cellH) / 2
  };
}

function previewDimensions(width, height) {
  const currentState = state();
  const scaleX = Math.max(0.6, (currentState?.stretchX || 100) / 100);
  const scaleY = Math.max(0.6, (currentState?.stretchY || 100) / 100);
  const base = Math.min(width / ((currentState?.gridSize || 20) * scaleX + 3), height / ((currentState?.gridSize || 20) * scaleY + 3)) * (currentState?.zoom || 1);
  const cellW = base * scaleX;
  const cellH = base * scaleY;
  const pan = window.__artifexMazeRuntimeControls?.getPan?.() || { x: 0, y: 0 };
  return {
    cellW,
    cellH,
    ox: width / 2 - ((currentState?.gridSize || 20) * cellW) / 2 + pan.x,
    oy: height / 2 - ((currentState?.gridSize || 20) * cellH) / 2 + pan.y
  };
}

function bindTeleportLoop() {
  setInterval(() => {
    const currentState = state();
    if (!currentState || currentState.view !== 'walktest' || Date.now() < portalState.teleportCooldownUntil) return;
    for (const pair of portalState.pairs) {
      if (pair.entry && pair.exit && playerTouchesPortal(currentState.player, pair.entry)) return teleportTo(pair.exit, pair.label);
      if (pair.twoWay && pair.entry && pair.exit && playerTouchesPortal(currentState.player, pair.exit)) return teleportTo(pair.entry, pair.label);
    }
  }, 40);
}

function playerTouchesPortal(player, portalCell) {
  if (!player || !portalCell) return false;
  const exactFloor = { x: Math.floor(player.x), y: Math.floor(player.y) };
  const exactCenter = { x: Math.round(player.x - 0.5), y: Math.round(player.y - 0.5) };
  if (sameCell(exactFloor, portalCell) || sameCell(exactCenter, portalCell)) return true;
  const dx = player.x - (portalCell.x + 0.5);
  const dy = player.y - (portalCell.y + 0.5);
  return Math.hypot(dx, dy) <= 0.58;
}

function teleportTo(cell, label) {
  const currentState = state();
  if (!currentState) return;
  currentState.player = { x: cell.x + 0.5, y: cell.y + 0.5 };
  portalState.teleportCooldownUntil = Date.now() + 750;
  portalState.lastTeleportLabel = label;
  setStatus(`Connected pair ${label} used`);
  forceWalkTestRepaint(label);
}

function forceWalkTestRepaint(label) {
  requestAnimationFrame(() => {
    $('view-mode-fps')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    setStatus(`Connected pair ${label} used`);
    drawPortalMarkersSoon();
  });
}

function sameCell(a, b) {
  return !!a && !!b && a.x === b.x && a.y === b.y;
}

function isOpenCell(currentState, x, y) {
  return x >= 0 && y >= 0 && x < currentState.gridSize && y < currentState.gridSize && currentState.matrix[y]?.[x] === 0 && isInsideShape(x, y, currentState.gridSize, currentState.layout, currentState.stretchX, currentState.stretchY);
}

function bindPortalMarkerRefresh() {
  ['click', 'input', 'change', 'keydown', 'keyup'].forEach((eventName) => document.addEventListener(eventName, drawPortalMarkersSoon, true));
  setInterval(drawPortalMarkers, 160);
}

function drawPortalMarkersSoon() {
  requestAnimationFrame(() => setTimeout(drawPortalMarkers, 25));
}

function drawPortalMarkers() {
  drawOverviewPortalMarkers();
  drawPreviewPortalMarkers();
}

function drawOverviewPortalMarkers() {
  const currentState = state();
  const canvas = $('analysis-canvas');
  if (!currentState || !canvas || !portalState.pairs.length) return;
  const ctx = canvas.getContext('2d');
  const dims = overviewDimensions(canvas.width, canvas.height);
  portalState.pairs.forEach((pair) => {
    if (pair.entry) drawMarker(ctx, dims, pair.entry, pair.label, '#f1cf75', 'E');
    if (pair.exit) drawMarker(ctx, dims, pair.exit, pair.label, '#b58cff', 'X');
  });
}

function drawPreviewPortalMarkers() {
  const currentState = state();
  const canvas = $('maze-preview-canvas');
  if (!currentState || !canvas || currentState.view === '3d' || !portalState.pairs.length) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const ratio = window.devicePixelRatio || 1;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const dims = previewDimensions(rect.width, rect.height);
  portalState.pairs.forEach((pair) => {
    if (pair.entry) drawMarker(ctx, dims, pair.entry, pair.label, '#f1cf75', 'E');
    if (pair.exit) drawMarker(ctx, dims, pair.exit, pair.label, '#b58cff', 'X');
  });
  ctx.restore();
}

function drawMarker(ctx, dims, cell, label, color, suffix) {
  const x = dims.ox + cell.x * dims.cellW + dims.cellW / 2;
  const y = dims.oy + cell.y * dims.cellH + dims.cellH / 2;
  const r = Math.max(7, Math.min(dims.cellW, dims.cellH) * 0.45);
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#06140b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#06140b';
  ctx.font = `900 ${Math.max(9, r * 0.9)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label}${suffix}`, x, y + 0.5);
  ctx.restore();
}

function renderPortalUi(syncInputs = true) {
  const pair = selectedPair();
  if (syncInputs) {
    if ($('portal-label-input')) $('portal-label-input').value = pair?.label || nextLabel();
    if ($('portal-type-select')) $('portal-type-select').value = pair?.type || 'door';
    if ($('portal-two-way')) $('portal-two-way').checked = pair?.twoWay !== false;
    if ($('portal-required')) $('portal-required').checked = !!pair?.required;
    if ($('portal-hint-input')) $('portal-hint-input').value = pair?.hint || '';
  }

  const selectedType = PORTAL_TYPES[pair?.type || $('portal-type-select')?.value || 'door'] || PORTAL_TYPES.door;
  if ($('portal-type-help')) $('portal-type-help').textContent = selectedType.description;

  const status = $('portal-builder-status');
  if (status) {
    const incomplete = portalState.pairs.filter((item) => !item.entry || !item.exit).length;
    status.textContent = `${portalState.pairs.length} pair${portalState.pairs.length === 1 ? '' : 's'}`;
    status.className = `portal-status-pill ${portalState.pairs.length ? (incomplete ? 'is-warning' : 'is-good') : 'is-empty'}`;
  }

  if (portalState.placementMode && pair) {
    setPlacementNote(`Click the Overview to place ${selectedType.label} ${pair.label} ${portalState.placementMode}.`, 'is-active');
  } else if (pair) {
    setPlacementNote(pair.entry && pair.exit ? `${selectedType.label} ${pair.label} is placed. Walk Test transfers the player on contact.` : `${selectedType.label} ${pair.label} needs ${pair.entry ? 'an exit' : 'an entry'}.`, pair.entry && pair.exit ? 'is-good' : 'is-warning');
  } else {
    setPlacementNote('No connected pair selected yet.', '');
  }

  const list = $('portal-pair-list');
  if (list) {
    list.innerHTML = portalState.pairs.length ? portalState.pairs.map(pairToHtml).join('') : '<p class="portal-empty-note">No connected pairs yet. Add a pair to begin.</p>';
    list.querySelectorAll('[data-select-portal]').forEach((button) => button.addEventListener('click', () => {
      portalState.selectedId = button.dataset.selectPortal;
      portalState.placementMode = null;
      renderPortalUi();
    }));
  }
  drawPortalMarkersSoon();
}

function pairToHtml(pair) {
  const selected = pair.id === portalState.selectedId ? ' is-selected' : '';
  const placed = pair.entry && pair.exit ? 'Ready' : 'Needs placement';
  const entry = pair.entry ? `${pair.entry.x},${pair.entry.y}` : '—';
  const exit = pair.exit ? `${pair.exit.x},${pair.exit.y}` : '—';
  const required = pair.required ? ' · Required' : '';
  const type = PORTAL_TYPES[pair.type]?.label || 'Door';
  return `<button type="button" class="portal-pair-item${selected}" data-select-portal="${pair.id}"><strong>${escapeHtml(pair.label)} · ${escapeHtml(type)}</strong><span>${escapeHtml(placed)}${required}</span><small>Entry ${entry} → Exit ${exit}</small></button>`;
}

function setPlacementNote(text, klass) {
  const note = $('portal-placement-note');
  if (!note) return;
  note.textContent = text;
  note.className = `portal-placement-note ${klass || ''}`.trim();
}

function setStatus(text) {
  const status = $('player-status-indicator');
  if (status) status.textContent = text;
}

function patchExportPayload() {
  setTimeout(() => {
    const previous = window.__artifexAugmentPuzzlePayload;
    window.__artifexAugmentPuzzlePayload = (payload) => {
      const base = typeof previous === 'function' ? previous(payload) : payload;
      return {
        ...base,
        puzzle: {
          ...base.puzzle,
          portals: exportPortals()
        }
      };
    };
  }, 0);
}

function exportPortals() {
  return {
    schemaVersion: 'artifex.mazePortals.v1',
    status: portalState.pairs.length && portalState.pairs.some((pair) => !pair.entry || !pair.exit) ? 'needs_placement' : 'ready',
    pairs: portalState.pairs.map((pair) => ({
      id: pair.id,
      label: pair.label,
      type: pair.type,
      entry: pair.entry,
      exit: pair.exit,
      twoWay: pair.twoWay,
      required: pair.required,
      capraHint: pair.hint || ''
    }))
  };
}

function injectPortalStyles() {
  if ($('maze-portals-system-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-portals-system-style';
  style.textContent = `
    .portal-builder{margin:10px 0 14px;padding:13px;border:1px solid rgba(181,140,255,.28);border-radius:18px;background:linear-gradient(180deg,rgba(18,18,44,.42),rgba(5,18,11,.94));box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);}
    .portal-builder-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;}
    .portal-builder-head strong{display:block;color:var(--cream,#eadfc6);font-weight:900;}
    .portal-builder-head small{display:block;color:#a9b59e;font-size:.7rem;line-height:1.3;margin-top:2px;}
    .portal-status-pill{display:inline-flex;align-items:center;white-space:nowrap;border-radius:999px;padding:5px 8px;font-size:.66rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;}
    .portal-status-pill.is-empty{background:rgba(255,255,255,.06);color:#b9c5a5;border:1px solid rgba(255,255,255,.12);}
    .portal-status-pill.is-good{background:rgba(122,220,139,.16);color:#a8e8a3;border:1px solid rgba(122,220,139,.34);}
    .portal-status-pill.is-warning{background:rgba(238,196,89,.13);color:#f1cf75;border:1px solid rgba(238,196,89,.3);}
    .portal-action-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:10px;}
    .portal-action-row button{min-height:36px;border-radius:12px;border:1px solid rgba(158,230,164,.24);background:rgba(12,54,28,.75);color:#eadfc6;font-size:.78rem;font-weight:900;cursor:pointer;}
    .portal-editor-row{display:grid;grid-template-columns:84px 112px 1fr 1fr;gap:8px;margin:8px 0;align-items:end;}
    .portal-editor-row label,.portal-hint-row{display:grid;gap:4px;color:#d8d0ba;font-size:.72rem;}
    .portal-editor-row input,.portal-editor-row select,.portal-hint-row input{min-height:32px;border-radius:10px;border:1px solid rgba(158,230,164,.24);background:rgba(0,0,0,.22);color:#e8f5de;font-size:.78rem;padding:5px 7px;min-width:0;}
    .portal-type-field select{width:112px;max-width:112px;}
    .portal-toggle{display:flex!important;align-items:center;gap:5px;align-self:end;min-height:32px;border:1px solid rgba(158,230,164,.16);border-radius:10px;padding:5px 7px;background:rgba(0,0,0,.14);white-space:nowrap;}
    .portal-toggle input{min-height:auto;accent-color:#9ee6a4;}
    .portal-type-help{margin:5px 0 10px;padding:7px 9px;border-radius:10px;border:1px solid rgba(158,230,164,.14);background:rgba(0,0,0,.14);color:#b9c5a5;font-size:.7rem;line-height:1.35;}
    .portal-placement-note{margin:10px 0 8px;padding:9px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.18);color:#b9c5a5;font-size:.74rem;line-height:1.3;}
    .portal-placement-note.is-active{color:#f1cf75;border-color:rgba(238,196,89,.3);box-shadow:0 0 16px rgba(238,196,89,.08);}
    .portal-placement-note.is-warning{color:#f1cf75;border-color:rgba(238,196,89,.3);}
    .portal-placement-note.is-good{color:#a8e8a3;border-color:rgba(122,220,139,.3);}
    .portal-pair-list{display:grid;gap:7px;margin-top:8px;}
    .portal-pair-item{text-align:left;border-radius:13px;border:1px solid rgba(158,230,164,.18);background:rgba(0,0,0,.18);color:#eadfc6;padding:8px 9px;cursor:pointer;}
    .portal-pair-item.is-selected{border-color:rgba(181,140,255,.68);box-shadow:0 0 18px rgba(181,140,255,.12);}
    .portal-pair-item strong{display:block;font-size:.8rem;}
    .portal-pair-item span{display:block;color:#d8d0ba;font-size:.7rem;margin-top:2px;}
    .portal-pair-item small{display:block;color:#a9b59e;font-size:.68rem;margin-top:2px;}
    .portal-empty-note{margin:0;color:#a9b59e;font-size:.74rem;}
    @media(max-width:520px){.portal-action-row,.portal-editor-row{grid-template-columns:1fr 1fr;}.portal-type-field select{width:100%;max-width:none;}}
  `;
  document.head.appendChild(style);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
