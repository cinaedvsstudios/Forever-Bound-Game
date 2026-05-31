// Maze / Labyrinth Scatter decorations and lights
//
// Owns collision-free authored decoration placement using registered final visual assets.
// Placements are previewed as authoring markers in Overview only at this stage; linked image
// rendering inside the playable preview belongs to a later shared visual-rendering pass.

import '../../../../../shared/project-folder/project-folder-client.js?v=0.1.0';
import { openRegisteredContentPicker } from '../../../../../shared/registered-content/registered-content-picker.js?v=1.29.1';
import { isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
const STYLE_ID = 'maze-scatter-decorations-style';
const CARD_ID = 'maze-scatter-card';
const MAX_DECORATION_SLOTS = 5;
const scatterState = {
  enabled: false,
  seed: 1842,
  status: 'Scatter is off.',
  light: createSlot('scatter_light', 'Decorative Lights', 6, 'light'),
  decorations: []
};

window.__artifexMazeScatter = {
  state: scatterState,
  regenerate: regeneratePlacements,
  refresh: renderCard,
  export: exportScatter
};

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  injectCard();
  bindRepaintTriggers();
  patchExportPayload();
  renderCard();
  window.setInterval(drawOverviewMarkers, 180);
});

function runtimeState() {
  return window.__artifexMazeRuntime?.state || null;
}

function createSlot(id, label, amount, type) {
  return {
    id,
    label,
    type,
    amount,
    visualAssetId: null,
    visualAssetLabel: null,
    visualAssetReferenceSource: null,
    cells: []
  };
}

function injectCard() {
  if ($(CARD_ID)) return;
  const panel = document.querySelector('[data-panel-content="visuals"]');
  if (!panel) return;
  const card = document.createElement('section');
  card.id = CARD_ID;
  card.className = 'maze-scatter-card';
  const wallCard = $('maze-wall-form-card');
  if (wallCard) wallCard.insertAdjacentElement('afterend', card);
  else panel.appendChild(card);
}

function renderCard() {
  const card = $(CARD_ID);
  if (!card) return;
  const placedCount = linkedSlots().reduce((sum, slot) => sum + slot.cells.length, 0);
  card.innerHTML = `
    <div class="scatter-head">
      <div>
        <strong>Scatter · Decoration + Light</strong>
        <small>Registered visual assets only. Decorative placements never alter paths or collision.</small>
      </div>
      <button type="button" class="scatter-toggle ${scatterState.enabled ? 'is-on' : ''}" data-scatter-toggle title="${scatterState.enabled ? 'Remove Scatter placements and disable decoration setup.' : 'Enable collision-free decoration and light placement.'}">${scatterState.enabled ? 'On' : 'Add'}</button>
    </div>
    <div class="scatter-body" ${scatterState.enabled ? '' : 'hidden'}>
      <div class="scatter-slot scatter-light-slot">
        <div class="scatter-slot-title"><strong>Decorative Lights</strong><small>${assetStatus(scatterState.light)}</small></div>
        <div class="scatter-controls">
          <label title="Number of decorative light markers generated on available path cells."><span>Amount</span><input type="number" min="0" max="30" value="${scatterState.light.amount}" data-scatter-amount="${scatterState.light.id}" /></label>
          <button type="button" data-scatter-link="${scatterState.light.id}" title="Choose a final registered asset_ visual for decorative lights.">${scatterState.light.visualAssetId ? 'Replace' : 'Link Light'}</button>
          ${scatterState.light.visualAssetId ? `<button type="button" data-scatter-unlink="${scatterState.light.id}" title="Remove the linked light asset and its generated placements.">Unlink</button>` : ''}
        </div>
      </div>
      <div class="scatter-decoration-heading">
        <strong>Decoration Assets</strong>
        <button type="button" data-scatter-add-slot ${scatterState.decorations.length >= MAX_DECORATION_SLOTS ? 'disabled' : ''} title="Add a registered decoration asset slot, up to five total.">+ Asset</button>
      </div>
      <div class="scatter-decoration-list">
        ${scatterState.decorations.length ? scatterState.decorations.map(decorationHtml).join('') : '<p class="scatter-empty">No decoration asset slots added.</p>'}
      </div>
      <div class="scatter-generation">
        <label title="Seed used to regenerate repeatable decorative placement positions."><span>Seed</span><input type="number" min="1" max="999999" value="${scatterState.seed}" data-scatter-seed /></label>
        <button type="button" data-scatter-regenerate title="Generate decoration markers on available path cells without collision.">Regenerate</button>
        <button type="button" data-scatter-clear title="Clear generated decoration marker positions while keeping linked assets.">Clear Positions</button>
      </div>
      <p class="scatter-status">${escapeHtml(scatterState.status)} ${placedCount ? `· ${placedCount} marker${placedCount === 1 ? '' : 's'} in Overview.` : ''}</p>
      <p class="scatter-render-note">Overview markers show authored placement only. Actual linked images are not yet drawn in the playable preview.</p>
    </div>
  `;
  bindCardActions(card);
}

function decorationHtml(slot, index) {
  return `
    <div class="scatter-slot">
      <div class="scatter-slot-title"><strong>Decoration ${index + 1}</strong><small>${assetStatus(slot)}</small></div>
      <div class="scatter-controls">
        <label title="Number of markers generated for this decoration asset."><span>Amount</span><input type="number" min="0" max="20" value="${slot.amount}" data-scatter-amount="${slot.id}" /></label>
        <button type="button" data-scatter-link="${slot.id}" title="Choose a final registered asset_ visual for this decoration.">${slot.visualAssetId ? 'Replace' : 'Link Asset'}</button>
        ${slot.visualAssetId ? `<button type="button" data-scatter-unlink="${slot.id}" title="Remove the linked asset and its generated positions.">Unlink</button>` : ''}
        <button type="button" data-scatter-remove="${slot.id}" title="Delete this decoration slot.">Remove</button>
      </div>
    </div>
  `;
}

function assetStatus(slot) {
  return slot.visualAssetId ? `${slot.visualAssetLabel || 'Linked asset'} · ${slot.visualAssetId}` : 'No final visual asset linked';
}

function bindCardActions(card) {
  card.querySelector('[data-scatter-toggle]')?.addEventListener('click', () => {
    scatterState.enabled = !scatterState.enabled;
    if (!scatterState.enabled) clearPlacements('Scatter is off.');
    else scatterState.status = 'Link visual assets, then regenerate placement markers.';
    renderCard();
  });
  card.querySelector('[data-scatter-add-slot]')?.addEventListener('click', () => {
    if (scatterState.decorations.length >= MAX_DECORATION_SLOTS) return;
    const number = scatterState.decorations.length + 1;
    scatterState.decorations.push(createSlot(`scatter_decoration_${number}`, `Decoration ${number}`, 3, 'decoration'));
    scatterState.status = 'Decoration slot added. Link a registered final asset to use it.';
    renderCard();
  });
  card.querySelectorAll('[data-scatter-link]').forEach((button) => button.addEventListener('click', () => openAssetPicker(button.dataset.scatterLink)));
  card.querySelectorAll('[data-scatter-unlink]').forEach((button) => button.addEventListener('click', () => unlinkSlot(button.dataset.scatterUnlink)));
  card.querySelectorAll('[data-scatter-remove]').forEach((button) => button.addEventListener('click', () => removeDecoration(button.dataset.scatterRemove)));
  card.querySelectorAll('[data-scatter-amount]').forEach((input) => input.addEventListener('input', () => {
    const slot = findSlot(input.dataset.scatterAmount);
    if (!slot) return;
    slot.amount = clampAmount(Number(input.value || 0), slot.type === 'light' ? 30 : 20);
    scatterState.status = 'Amount updated. Regenerate to update marker positions.';
    renderCard();
  }));
  card.querySelector('[data-scatter-seed]')?.addEventListener('input', (event) => {
    scatterState.seed = Math.max(1, Math.min(999999, Math.floor(Number(event.target.value || 1))));
    scatterState.status = 'Seed updated. Regenerate to apply it.';
    renderCard();
  });
  card.querySelector('[data-scatter-regenerate]')?.addEventListener('click', regeneratePlacements);
  card.querySelector('[data-scatter-clear]')?.addEventListener('click', () => {
    clearPlacements('Generated positions cleared. Linked visual assets are retained.');
    renderCard();
  });
}

function openAssetPicker(slotId) {
  const slot = findSlot(slotId);
  if (!slot) return;
  openRegisteredContentPicker({
    initialKind: 'assets',
    kinds: ['assets'],
    title: `Link ${slot.label}`,
    selectLabel: 'Link Asset',
    contextNote: 'Only registered final asset_ records may be used for Scatter visuals.',
    onSelect: ({ item, reference }) => {
      const current = findSlot(slotId);
      if (!current) return;
      current.visualAssetId = reference.assetId;
      current.visualAssetLabel = item.name;
      current.visualAssetReferenceSource = reference.referenceSource;
      scatterState.status = `${current.label} linked. Regenerating marker positions.`;
      regeneratePlacements();
    }
  });
}

function unlinkSlot(slotId) {
  const slot = findSlot(slotId);
  if (!slot) return;
  slot.visualAssetId = null;
  slot.visualAssetLabel = null;
  slot.visualAssetReferenceSource = null;
  slot.cells = [];
  scatterState.status = `${slot.label} unlinked; its generated positions were removed.`;
  renderCard();
}

function removeDecoration(slotId) {
  scatterState.decorations = scatterState.decorations.filter((slot) => slot.id !== slotId);
  scatterState.status = 'Decoration slot removed.';
  regeneratePlacements();
}

function findSlot(slotId) {
  if (scatterState.light.id === slotId) return scatterState.light;
  return scatterState.decorations.find((slot) => slot.id === slotId) || null;
}

function linkedSlots() {
  return [scatterState.light, ...scatterState.decorations].filter((slot) => slot.visualAssetId);
}

function clampAmount(value, max) {
  return Math.max(0, Math.min(max, Math.floor(value)));
}

function clearPlacements(message) {
  [scatterState.light, ...scatterState.decorations].forEach((slot) => { slot.cells = []; });
  scatterState.status = message;
}

function regeneratePlacements() {
  if (!scatterState.enabled) {
    scatterState.status = 'Enable Scatter before generating decoration positions.';
    renderCard();
    return;
  }
  const slots = linkedSlots();
  if (!slots.length) {
    clearPlacements('No positions generated: link at least one registered final visual asset.');
    renderCard();
    return;
  }
  const available = availableCells();
  const random = seededRandom(scatterState.seed);
  shuffle(available, random);
  let cursor = 0;
  slots.forEach((slot) => {
    slot.cells = [];
    const amount = clampAmount(slot.amount, slot.type === 'light' ? 30 : 20);
    for (let index = 0; index < amount && cursor < available.length; index += 1, cursor += 1) {
      slot.cells.push(available[cursor]);
    }
  });
  scatterState.status = cursor
    ? 'Decoration markers regenerated on unoccupied path cells.'
    : 'No available path cells remain for decoration markers.';
  renderCard();
  drawOverviewMarkers();
}

function availableCells() {
  const currentState = runtimeState();
  if (!currentState?.matrix?.length) return [];
  const blocked = new Set();
  const addBlocked = (cell) => { if (cell) blocked.add(cellKey(cell)); };
  addBlocked(currentState.start);
  addBlocked(currentState.exit);
  (window.__artifexMazeFeatures?.collectionItems?.() || []).forEach((item) => addBlocked(item.cell));
  (window.__artifexMazeConnections?.pairs || []).forEach((pair) => {
    addBlocked(pair.entry);
    addBlocked(pair.exit);
  });
  const cells = [];
  for (let y = 0; y < currentState.gridSize; y += 1) {
    for (let x = 0; x < currentState.gridSize; x += 1) {
      const cell = { x, y };
      if (currentState.matrix[y]?.[x] !== 0 || blocked.has(cellKey(cell))) continue;
      if (!isInsideShape(x, y, currentState.gridSize, currentState.layout, currentState.stretchX, currentState.stretchY)) continue;
      cells.push(cell);
    }
  }
  return cells;
}

function seededRandom(seed) {
  let current = Math.max(1, Number(seed) || 1) % 2147483647;
  return () => {
    current = current * 16807 % 2147483647;
    return (current - 1) / 2147483646;
  };
}

function shuffle(items, random) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const selected = Math.floor(random() * (index + 1));
    [items[index], items[selected]] = [items[selected], items[index]];
  }
}

function bindRepaintTriggers() {
  window.addEventListener('artifex-maze-features-updated', () => {
    if (scatterState.enabled && linkedSlots().some((slot) => slot.cells.length)) regeneratePlacements();
  });
  window.addEventListener('artifex-maze-connections-updated', () => {
    if (scatterState.enabled && linkedSlots().some((slot) => slot.cells.length)) regeneratePlacements();
  });
  ['btn-random', 'btn-start-blank', 'btn-clear-all', 'btn-load-reference', 'layout-style-slider', 'grid-slider', 'stretch-x-slider', 'stretch-y-slider'].forEach((id) => {
    $(id)?.addEventListener('click', () => window.setTimeout(regenerateIfPlaced, 40), true);
    $(id)?.addEventListener('change', () => window.setTimeout(regenerateIfPlaced, 40), true);
  });
}

function regenerateIfPlaced() {
  if (scatterState.enabled && linkedSlots().some((slot) => slot.cells.length)) regeneratePlacements();
}

function overviewDimensions(width, height, currentState) {
  const scaleX = Math.max(0.6, Number(currentState.stretchX || 100) / 100);
  const scaleY = Math.max(0.6, Number(currentState.stretchY || 100) / 100);
  const base = Math.min(width / (currentState.gridSize * scaleX + 3), height / (currentState.gridSize * scaleY + 3));
  return {
    cellW: base * scaleX,
    cellH: base * scaleY,
    ox: width / 2 - currentState.gridSize * base * scaleX / 2,
    oy: height / 2 - currentState.gridSize * base * scaleY / 2
  };
}

function drawOverviewMarkers() {
  const currentState = runtimeState();
  const canvas = $('analysis-canvas');
  if (!scatterState.enabled || !currentState || !canvas) return;
  const ctx = canvas.getContext('2d');
  const dims = overviewDimensions(canvas.width, canvas.height, currentState);
  linkedSlots().forEach((slot, slotIndex) => {
    slot.cells.forEach((cell) => drawMarker(ctx, dims, cell, slot.type === 'light' ? '✦' : `${slotIndex}`, slot.type === 'light' ? '#f6d879' : '#83d8ac'));
  });
}

function drawMarker(ctx, dims, cell, text, color) {
  const x = dims.ox + cell.x * dims.cellW + dims.cellW / 2;
  const y = dims.oy + cell.y * dims.cellH + dims.cellH / 2;
  const radius = Math.max(4.5, Math.min(dims.cellW, dims.cellH) * 0.28);
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#06140b';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#06140b';
  ctx.font = `800 ${Math.max(7, radius * 1.15)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 0.4);
  ctx.restore();
}

function exportSlot(slot) {
  if (!slot.visualAssetId) return null;
  return {
    id: slot.id,
    type: slot.type,
    visualAssetId: slot.visualAssetId,
    visualAssetLabel: slot.visualAssetLabel,
    visualAssetReferenceSource: slot.visualAssetReferenceSource,
    amount: slot.amount,
    cells: slot.cells.map((cell) => ({ ...cell }))
  };
}

function exportScatter() {
  return {
    schemaVersion: 'artifex.mazeScatter.v1',
    enabled: scatterState.enabled,
    seed: scatterState.seed,
    collision: 'none',
    previewStatus: 'overview_authoring_markers_only_pending_playable_visual_rendering',
    light: exportSlot(scatterState.light),
    decorations: scatterState.decorations.map(exportSlot).filter(Boolean)
  };
}

function patchExportPayload() {
  window.setTimeout(() => {
    const previous = window.__artifexAugmentPuzzlePayload;
    window.__artifexAugmentPuzzlePayload = (payload) => {
      const base = typeof previous === 'function' ? previous(payload) : payload;
      return { ...base, puzzle: { ...base.puzzle, scatterDecorations: exportScatter() } };
    };
  }, 0);
}

function injectStyles() {
  if ($(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .maze-scatter-card{margin:9px 0 12px;padding:10px;border:1px solid rgba(158,230,164,.2);border-radius:13px;background:rgba(5,18,11,.88)}
    .scatter-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}.scatter-head strong{display:block;color:#eadfc6;font-size:.72rem}.scatter-head small{display:block;margin-top:2px;color:#a9b59e;font-size:.59rem;line-height:1.35}.scatter-toggle{min-width:44px;min-height:28px;padding:4px 8px;border-radius:9px;border:1px solid rgba(158,230,164,.27);background:rgba(12,54,28,.6);color:#eadfc6;font-size:.61rem;font-weight:800;cursor:pointer}.scatter-toggle.is-on{border-color:rgba(158,230,164,.53);background:rgba(40,92,47,.45);color:#d7ffdb}
    .scatter-body{margin-top:9px;display:grid;gap:7px}.scatter-slot{padding:7px;border:1px solid rgba(158,230,164,.13);border-radius:9px;background:rgba(0,0,0,.14)}.scatter-light-slot{border-color:rgba(225,192,115,.23)}.scatter-slot-title{display:flex;justify-content:space-between;gap:7px;align-items:baseline;margin-bottom:6px}.scatter-slot-title strong{color:#eadfc6;font-size:.64rem}.scatter-slot-title small{max-width:175px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#a9b59e;font-size:.55rem}.scatter-controls{display:flex;gap:5px;align-items:end;flex-wrap:wrap}.scatter-controls label,.scatter-generation label{display:grid;gap:2px;color:#d8d0ba;font-size:.56rem}.scatter-controls input{width:54px}.scatter-controls input,.scatter-generation input{min-height:26px;box-sizing:border-box;border-radius:7px;border:1px solid rgba(158,230,164,.18);background:#07190e;color:#eadfc6;padding:3px 5px;font-size:.62rem}.scatter-controls button,.scatter-decoration-heading button,.scatter-generation button{min-height:27px;padding:4px 7px;border-radius:7px;border:1px solid rgba(158,230,164,.22);background:rgba(12,54,28,.65);color:#eadfc6;font-size:.58rem;font-weight:700;cursor:pointer}.scatter-controls button:disabled,.scatter-decoration-heading button:disabled{opacity:.42;cursor:not-allowed}
    .scatter-decoration-heading{display:flex;justify-content:space-between;align-items:center}.scatter-decoration-heading strong{color:#d8d0ba;font-size:.64rem}.scatter-decoration-list{display:grid;gap:5px}.scatter-empty{margin:0;padding:8px;border:1px dashed rgba(158,230,164,.17);border-radius:8px;color:#a9b59e;font-size:.58rem;text-align:center}.scatter-generation{display:flex;align-items:end;gap:5px;flex-wrap:wrap;padding-top:4px}.scatter-generation input{width:78px}
    .scatter-status{margin:2px 0 0;padding:6px;border-radius:8px;border:1px solid rgba(158,230,164,.16);color:#9ee6a4;background:rgba(20,72,37,.16);font-size:.57rem;line-height:1.35}.scatter-render-note{margin:0;color:#d8c185;font-size:.56rem;line-height:1.35}
  `;
  document.head.appendChild(style);
}

function cellKey(cell) {
  return `${cell.x}:${cell.y}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}
