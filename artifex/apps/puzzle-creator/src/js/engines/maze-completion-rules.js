// Maze / Labyrinth completion rules and required-item placement
// Owns the Maze Game Logic completion contract: Reach Exit plus optional required items.

import { isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);

const completionState = {
  collectRequired: false,
  collectCount: 1,
  items: [],
  placingItemId: null
};

window.__artifexMazeCompletionRules = completionState;

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  removeLegacyMazeFields();
  injectCompletionBuilder();
  bindCompletionUi();
  bindItemPlacement();
  bindMarkerRefresh();
  patchExportPayload();
  ensureItemSlots();
  renderCompletionUi();
});

function runtimeState() {
  return window.__artifexMazeRuntime?.state || null;
}

function removeLegacyMazeFields() {
  document.querySelectorAll('[data-engine-field="showSolution"], [data-engine-field="completionRule"]').forEach((input) => {
    input.closest('.engine-field')?.remove();
  });
  ['puzzle-type', 'gameplay-mode'].forEach((id) => {
    $(id)?.closest('.field-block')?.remove();
  });
}

function injectCompletionBuilder() {
  if ($('completion-rule-builder')) return;
  const logicPanel = document.querySelector('[data-panel-content="logic"]');
  if (!logicPanel) return;
  const insertBefore = $('completion-flag')?.closest('.field-block') || $('calling-text')?.closest('.field-block') || $('btn-copy-json');
  const section = document.createElement('section');
  section.id = 'completion-rule-builder';
  section.className = 'completion-rule-builder';
  section.innerHTML = `
    <div class="completion-builder-head">
      <div>
        <strong>Completion Rule</strong>
        <small>Set what the player must do before the maze counts as complete.</small>
      </div>
      <span id="completion-builder-status" class="completion-status-pill is-good">Exit</span>
    </div>
    <label class="completion-rule-row is-locked">
      <input type="checkbox" checked disabled title="Reaching the exit is always required for a maze." />
      <span><strong>Reach Exit</strong><small>Always required.</small></span>
    </label>
    <label class="completion-rule-row">
      <input id="rule-collect" type="checkbox" title="Require placed objects to be collected before the exit completes the maze." />
      <span><strong>Collect Objects Before Exit</strong><small>Optional required pickups.</small></span>
    </label>
    <div id="rule-collect-options" class="completion-rule-options" hidden>
      <label><span>Required objects</span><input id="rule-collect-count" type="number" min="1" max="20" value="1" title="Number of required objects the player must collect." /></label>
      <div id="required-items-list" class="required-items-list"></div>
    </div>
  `;
  if (insertBefore) insertBefore.insertAdjacentElement('beforebegin', section);
  else logicPanel.appendChild(section);
}

function bindCompletionUi() {
  $('rule-collect')?.addEventListener('change', (event) => {
    completionState.collectRequired = event.target.checked;
    if (!completionState.collectRequired) completionState.placingItemId = null;
    ensureItemSlots();
    renderCompletionUi();
  });
  $('rule-collect-count')?.addEventListener('input', (event) => {
    completionState.collectCount = Math.max(1, Math.min(20, Number(event.target.value || 1)));
    ensureItemSlots();
    renderCompletionUi();
  });
}

function ensureItemSlots() {
  const needed = completionState.collectRequired ? completionState.collectCount : 0;
  while (completionState.items.length < needed) {
    completionState.items.push({
      id: `required_item_${completionState.items.length + 1}`,
      label: `Item ${completionState.items.length + 1}`,
      cell: null,
      archetypeObjectId: null,
      archetypeLabel: null
    });
  }
  completionState.items = completionState.items.slice(0, needed);
  if (!completionState.items.some((item) => item.id === completionState.placingItemId)) completionState.placingItemId = null;
}

function renderCompletionUi() {
  const options = $('rule-collect-options');
  if (options) options.hidden = !completionState.collectRequired;
  const status = $('completion-builder-status');
  const itemList = $('required-items-list');
  if (!completionState.collectRequired) {
    if (status) {
      status.textContent = 'Exit';
      status.className = 'completion-status-pill is-good';
    }
    if (itemList) itemList.innerHTML = '';
    drawMarkersSoon();
    return;
  }

  const placedCount = completionState.items.filter((item) => item.cell).length;
  const ready = placedCount === completionState.items.length && completionState.items.length > 0;
  if (status) {
    status.textContent = ready ? `${placedCount} Placed` : `${placedCount}/${completionState.items.length}`;
    status.className = `completion-status-pill ${ready ? 'is-good' : 'is-warning'}`;
  }
  if (itemList) {
    itemList.innerHTML = completionState.items.map((item, index) => itemRowHtml(item, index)).join('');
    itemList.querySelectorAll('[data-place-item]').forEach((button) => button.addEventListener('click', () => {
      completionState.placingItemId = button.dataset.placeItem;
      renderCompletionUi();
    }));
    itemList.querySelectorAll('[data-clear-item]').forEach((button) => button.addEventListener('click', () => {
      const item = completionState.items.find((entry) => entry.id === button.dataset.clearItem);
      if (!item) return;
      item.cell = null;
      if (completionState.placingItemId === item.id) completionState.placingItemId = null;
      renderCompletionUi();
    }));
  }
  drawMarkersSoon();
}

function itemRowHtml(item, index) {
  const placing = completionState.placingItemId === item.id;
  const cell = item.cell ? `Cell ${item.cell.x}, ${item.cell.y}` : 'Not placed';
  const stateClass = item.cell ? 'is-good' : 'is-warning';
  return `
    <article class="required-item-row ${placing ? 'is-placing' : ''}">
      <div class="required-item-head"><strong>${escapeHtml(item.label)}</strong><span class="required-item-status ${stateClass}">${escapeHtml(cell)}</span></div>
      <div class="required-item-actions">
        <button type="button" data-place-item="${item.id}" title="Click, then select a path cell in the Overview.">${placing ? 'Pick Cell…' : 'Place'}</button>
        <button type="button" disabled title="Archetype Object library connection is not wired into Puzzle Creator yet.">Link Object</button>
        <button type="button" data-clear-item="${item.id}" title="Remove this item's placed cell.">Clear</button>
      </div>
      <small>${item.archetypeLabel ? escapeHtml(item.archetypeLabel) : 'Object link pending library integration.'}</small>
    </article>`;
}

function bindItemPlacement() {
  const canvas = $('analysis-canvas');
  if (!canvas) return;
  canvas.addEventListener('click', (event) => {
    if (!completionState.placingItemId || !completionState.collectRequired) return;
    if (window.__artifexMazeConnections?.placementMode) return;
    const cell = canvasEventToCell(event);
    const currentState = runtimeState();
    const item = completionState.items.find((entry) => entry.id === completionState.placingItemId);
    if (!cell || !currentState || !item || !isPlaceablePathCell(currentState, cell)) return;
    if (completionState.items.some((entry) => entry.id !== item.id && sameCell(entry.cell, cell))) return;
    item.cell = cell;
    completionState.placingItemId = null;
    renderCompletionUi();
  }, true);
}

function canvasEventToCell(event) {
  const currentState = runtimeState();
  const canvas = $('analysis-canvas');
  if (!currentState || !canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const px = (event.clientX - rect.left) * (canvas.width / rect.width);
  const py = (event.clientY - rect.top) * (canvas.height / rect.height);
  const dims = overviewDimensions(canvas.width, canvas.height, currentState);
  const x = Math.floor((px - dims.ox) / dims.cellW);
  const y = Math.floor((py - dims.oy) / dims.cellH);
  return x >= 0 && y >= 0 && x < currentState.gridSize && y < currentState.gridSize ? { x, y } : null;
}

function overviewDimensions(width, height, currentState) {
  const scaleX = Math.max(0.6, Number(currentState.stretchX || 100) / 100);
  const scaleY = Math.max(0.6, Number(currentState.stretchY || 100) / 100);
  const base = Math.min(width / (currentState.gridSize * scaleX + 3), height / (currentState.gridSize * scaleY + 3));
  const cellW = base * scaleX;
  const cellH = base * scaleY;
  return { cellW, cellH, ox: width / 2 - currentState.gridSize * cellW / 2, oy: height / 2 - currentState.gridSize * cellH / 2 };
}

function isPlaceablePathCell(currentState, cell) {
  if (currentState.matrix[cell.y]?.[cell.x] !== 0) return false;
  if (!isInsideShape(cell.x, cell.y, currentState.gridSize, currentState.layout, currentState.stretchX, currentState.stretchY)) return false;
  if (sameCell(currentState.start, cell) || sameCell(currentState.exit, cell)) return false;
  const connectionCells = window.__artifexMazeConnections?.pairs?.flatMap((pair) => [pair.entry, pair.exit]).filter(Boolean) || [];
  return !connectionCells.some((point) => sameCell(point, cell));
}

function bindMarkerRefresh() {
  ['click', 'change', 'input'].forEach((eventName) => document.addEventListener(eventName, drawMarkersSoon, true));
  window.setInterval(drawItemMarkers, 200);
}

function drawMarkersSoon() {
  requestAnimationFrame(() => window.setTimeout(drawItemMarkers, 30));
}

function drawItemMarkers() {
  if (!completionState.collectRequired || !completionState.items.some((item) => item.cell)) return;
  const currentState = runtimeState();
  const canvas = $('analysis-canvas');
  if (!currentState || !canvas) return;
  const ctx = canvas.getContext('2d');
  const dims = overviewDimensions(canvas.width, canvas.height, currentState);
  completionState.items.forEach((item, index) => {
    if (!item.cell) return;
    const x = dims.ox + item.cell.x * dims.cellW + dims.cellW / 2;
    const y = dims.oy + item.cell.y * dims.cellH + dims.cellH / 2;
    const r = Math.max(7, Math.min(dims.cellW, dims.cellH) * 0.42);
    ctx.save();
    ctx.fillStyle = '#e1c073';
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
    ctx.fillText(`${index + 1}`, x, y + 0.5);
    ctx.restore();
  });
}

function exportCompletionRules() {
  const items = completionState.items.map((item) => ({
    itemId: item.id,
    label: item.label,
    cell: item.cell,
    archetypeObjectId: item.archetypeObjectId
  }));
  const allPlaced = items.length > 0 && items.every((item) => item.cell);
  return {
    schemaVersion: 'artifex.mazeCompletionRules.v2',
    mode: completionState.collectRequired ? 'collect_then_exit' : 'reach_exit',
    reachExit: true,
    collectObjectsBeforeExit: completionState.collectRequired,
    requiredItems: completionState.collectRequired ? items : [],
    status: completionState.collectRequired ? (allPlaced ? 'placements_ready_object_links_pending' : 'needs_item_placement') : 'ready'
  };
}

function patchExportPayload() {
  window.setTimeout(() => {
    const previous = window.__artifexAugmentPuzzlePayload;
    window.__artifexAugmentPuzzlePayload = (payload) => {
      const base = typeof previous === 'function' ? previous(payload) : payload;
      return { ...base, puzzle: { ...base.puzzle, completionRules: exportCompletionRules() } };
    };
  }, 0);
}

function sameCell(a, b) {
  return !!a && !!b && a.x === b.x && a.y === b.y;
}

function injectStyles() {
  if ($('maze-completion-rules-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-completion-rules-style';
  style.textContent = `
    .completion-rule-builder{margin:10px 0 14px;padding:12px;border:1px solid rgba(158,230,164,.25);border-radius:16px;background:linear-gradient(180deg,rgba(7,31,16,.86),rgba(4,18,10,.94));}
    .completion-builder-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:9px;}
    .completion-builder-head strong{display:block;color:var(--cream,#eadfc6);font-size:.82rem;font-weight:900;}
    .completion-builder-head small,.completion-rule-row small{display:block;color:#a9b59e;font-size:.66rem;line-height:1.3;margin-top:2px;}
    .completion-status-pill{display:inline-flex;align-items:center;white-space:nowrap;border-radius:999px;padding:4px 7px;font-size:.62rem;font-weight:900;text-transform:uppercase;letter-spacing:.07em;}
    .completion-status-pill.is-good{background:rgba(122,220,139,.16);color:#a8e8a3;border:1px solid rgba(122,220,139,.34);}
    .completion-status-pill.is-warning{background:rgba(238,196,89,.13);color:#f1cf75;border:1px solid rgba(238,196,89,.3);}
    .completion-rule-row{display:grid;grid-template-columns:20px 1fr;gap:8px;align-items:start;padding:8px 4px;border-radius:11px;font-size:.76rem;}
    .completion-rule-row:hover{background:rgba(158,230,164,.05);}
    .completion-rule-row input{margin-top:3px;accent-color:#9ee6a4;}
    .completion-rule-row strong{color:#e5dcc5;}
    .completion-rule-options{padding:8px 0 0 28px;}
    .completion-rule-options>label{display:grid;grid-template-columns:1fr 72px;gap:8px;align-items:center;color:#d8d0ba;font-size:.72rem;margin-bottom:9px;}
    .completion-rule-options input{min-height:29px;border-radius:9px;border:1px solid rgba(158,230,164,.26);background:rgba(0,0,0,.22);color:#e8f5de;padding:4px 7px;font-size:.74rem;}
    .required-items-list{display:grid;gap:7px;}
    .required-item-row{display:grid;gap:6px;padding:8px;border:1px solid rgba(158,230,164,.15);border-radius:12px;background:rgba(0,0,0,.15);}
    .required-item-row.is-placing{border-color:rgba(238,196,89,.42);box-shadow:0 0 12px rgba(238,196,89,.1);}
    .required-item-head{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:.72rem;}
    .required-item-status{font-size:.63rem;border-radius:999px;padding:3px 6px;}
    .required-item-status.is-good{color:#a8e8a3;border:1px solid rgba(122,220,139,.3);}
    .required-item-status.is-warning{color:#f1cf75;border:1px solid rgba(238,196,89,.3);}
    .required-item-actions{display:grid;grid-template-columns:1fr 1.2fr .8fr;gap:5px;}
    .required-item-actions button{min-height:30px;padding:4px 5px;border:1px solid rgba(158,230,164,.25);border-radius:9px;background:rgba(12,54,28,.72);color:#eadfc6;font-size:.66rem;font-weight:800;}
    .required-item-actions button:disabled{opacity:.45;cursor:not-allowed;}
    .required-item-row>small{color:#a9b59e;font-size:.62rem;}
  `;
  document.head.appendChild(style);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
