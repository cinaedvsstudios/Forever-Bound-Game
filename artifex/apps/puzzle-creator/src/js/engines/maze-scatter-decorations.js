// Maze / Labyrinth Scatter decorations and lights
//
// Owns collision-free authored decoration placement. Placements may be authored as markers
// before final visual assets are selected. Optional registered asset_ links define what will
// eventually render at those positions; actual playable-preview rendering belongs to a later pass.

import '../../../../../shared/project-folder/project-folder-client.js?v=0.1.0';
import { openRegisteredContentPicker } from '../../../../../shared/registered-content/registered-content-picker.js?v=1.29.1';
import { isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
const STYLE_ID = 'maze-scatter-decorations-style';
const CARD_ID = 'maze-scatter-card';
const MAX_DECORATION_SLOTS = 5;
const PLACEMENT_MODES = {
  random: { label: 'Random', help: 'Loosely random placement with immediate clusters avoided where space allows.' },
  equal_distribution: { label: 'Equal Distribution', help: 'Spreads markers across walkable corridors for more consistent coverage.' },
  solution_path: { label: 'Around Main Solution Path', help: 'Spaces markers along the calculated start-to-exit route, with nearby overflow placement when needed.' }
};
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
    placementMode: type === 'light' ? 'equal_distribution' : 'random',
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
  const placedCount = authoredSlots().reduce((sum, slot) => sum + slot.cells.length, 0);
  card.innerHTML = `
    <div class="scatter-head">
      <div>
        <strong>Scatter · Decoration + Light</strong>
        <small>Place markers first; link final visual assets later if needed. Decorations never alter paths or collision.</small>
      </div>
      <button type="button" class="scatter-toggle ${scatterState.enabled ? 'is-on' : ''}" data-scatter-toggle title="${scatterState.enabled ? 'Remove Scatter placements and disable decoration setup.' : 'Enable collision-free decoration and light placement.'}">${scatterState.enabled ? 'On' : 'Add'}</button>
    </div>
    <div class="scatter-body" ${scatterState.enabled ? '' : 'hidden'}>
      <div class="scatter-slot scatter-light-slot">
        <div class="scatter-slot-title"><strong>Decorative Lights</strong><small>${escapeHtml(assetStatus(scatterState.light))}</small></div>
        <div class="scatter-controls">
          <label title="Number of decorative light placeholder markers generated on available path cells."><span>Amount</span><input type="number" min="0" max="30" value="${scatterState.light.amount}" data-scatter-amount="${scatterState.light.id}" /></label>
          ${placementControl(scatterState.light)}
          <button type="button" data-scatter-link="${scatterState.light.id}" title="Optionally choose a final registered asset_ visual for decorative lights.">${scatterState.light.visualAssetId ? 'Replace' : 'Link Light'}</button>
          ${scatterState.light.visualAssetId ? `<button type="button" data-scatter-unlink="${scatterState.light.id}" title="Remove the linked light asset while retaining placeholder positions.">Unlink</button>` : ''}
        </div>
      </div>
      <div class="scatter-decoration-heading">
        <strong>Decoration Assets</strong>
        <button type="button" data-scatter-add-slot ${scatterState.decorations.length >= MAX_DECORATION_SLOTS ? 'disabled' : ''} title="Add a decoration marker slot, up to five total; a final asset may be linked later.">+ Asset</button>
      </div>
      <div class="scatter-decoration-list">
        ${scatterState.decorations.length ? scatterState.decorations.map(decorationHtml).join('') : '<p class="scatter-empty">No decoration marker slots added.</p>'}
      </div>
      <div class="scatter-generation">
        <label title="Seed used to regenerate repeatable decorative placement positions."><span>Seed</span><input type="number" min="1" max="999999" value="${scatterState.seed}" data-scatter-seed /></label>
        <button type="button" data-scatter-regenerate title="Generate placeholder decoration markers using each slot’s selected placement mode.">Regenerate</button>
        <button type="button" data-scatter-clear title="Clear generated decoration marker positions while keeping any linked assets.">Clear Positions</button>
      </div>
      <p class="scatter-status">${escapeHtml(scatterState.status)} ${placedCount ? `· ${placedCount} marker${placedCount === 1 ? '' : 's'} in Overview.` : ''}</p>
      <p class="scatter-render-note">Overview markers are authored placeholders. Linked images and actual light effects are not yet drawn in the playable preview.</p>
    </div>
  `;
  bindCardActions(card);
}

function decorationHtml(slot, index) {
  return `
    <div class="scatter-slot">
      <div class="scatter-slot-title"><strong>Decoration ${index + 1}</strong><small>${escapeHtml(assetStatus(slot))}</small></div>
      <div class="scatter-controls">
        <label title="Number of placeholder markers generated for this decoration slot."><span>Amount</span><input type="number" min="0" max="20" value="${slot.amount}" data-scatter-amount="${slot.id}" /></label>
        ${placementControl(slot)}
        <button type="button" data-scatter-link="${slot.id}" title="Optionally choose a final registered asset_ visual for this decoration.">${slot.visualAssetId ? 'Replace' : 'Link Asset'}</button>
        ${slot.visualAssetId ? `<button type="button" data-scatter-unlink="${slot.id}" title="Remove the linked asset while retaining marker positions.">Unlink</button>` : ''}
        <button type="button" data-scatter-remove="${slot.id}" title="Delete this decoration slot and its marker positions.">Remove</button>
      </div>
    </div>
  `;
}

function placementControl(slot) {
  const mode = validPlacementMode(slot.placementMode);
  const title = PLACEMENT_MODES[mode].help;
  return `<label class="scatter-placement-control" title="${escapeHtml(title)}"><span>Placement</span><select data-scatter-placement="${slot.id}">${Object.entries(PLACEMENT_MODES).map(([value, item]) => `<option value="${value}" ${value === mode ? 'selected' : ''}>${item.label}</option>`).join('')}</select></label>`;
}

function validPlacementMode(mode) {
  return PLACEMENT_MODES[mode] ? mode : 'random';
}

function assetStatus(slot) {
  return slot.visualAssetId ? `${slot.visualAssetLabel || 'Linked asset'} · ${slot.visualAssetId}` : 'Placeholder · no final visual linked';
}

function bindCardActions(card) {
  card.querySelector('[data-scatter-toggle]')?.addEventListener('click', () => {
    scatterState.enabled = !scatterState.enabled;
    if (!scatterState.enabled) clearPlacements('Scatter is off.');
    else scatterState.status = 'Set amounts and placement modes, then regenerate markers; link visuals whenever available.';
    renderCard();
    repaintOverviewAndMarkers();
  });
  card.querySelector('[data-scatter-add-slot]')?.addEventListener('click', () => {
    if (scatterState.decorations.length >= MAX_DECORATION_SLOTS) return;
    const number = scatterState.decorations.length + 1;
    scatterState.decorations.push(createSlot(`scatter_decoration_${number}`, `Decoration ${number}`, 3, 'decoration'));
    scatterState.status = 'Decoration marker slot added. Random placement is selected by default; regenerate now or adjust the mode.';
    renderCard();
  });
  card.querySelectorAll('[data-scatter-link]').forEach((button) => button.addEventListener('click', () => openAssetPicker(button.dataset.scatterLink)));
  card.querySelectorAll('[data-scatter-unlink]').forEach((button) => button.addEventListener('click', () => unlinkSlot(button.dataset.scatterUnlink)));
  card.querySelectorAll('[data-scatter-remove]').forEach((button) => button.addEventListener('click', () => removeDecoration(button.dataset.scatterRemove)));
  card.querySelectorAll('[data-scatter-amount]').forEach((input) => input.addEventListener('change', () => {
    const slot = findSlot(input.dataset.scatterAmount);
    if (!slot) return;
    slot.amount = clampAmount(Number(input.value || 0), slot.type === 'light' ? 30 : 20);
    scatterState.status = 'Amount updated. Regenerate to update marker positions.';
    renderCard();
  }));
  card.querySelectorAll('[data-scatter-placement]').forEach((select) => select.addEventListener('change', () => {
    const slot = findSlot(select.dataset.scatterPlacement);
    if (!slot) return;
    slot.placementMode = validPlacementMode(select.value);
    scatterState.status = `${slot.label} will use ${PLACEMENT_MODES[slot.placementMode].label}. Regenerate to apply it.`;
    renderCard();
  }));
  card.querySelector('[data-scatter-seed]')?.addEventListener('change', (event) => {
    scatterState.seed = Math.max(1, Math.min(999999, Math.floor(Number(event.target.value || 1))));
    scatterState.status = 'Seed updated. Regenerate to apply it.';
    renderCard();
  });
  card.querySelector('[data-scatter-regenerate]')?.addEventListener('click', regeneratePlacements);
  card.querySelector('[data-scatter-clear]')?.addEventListener('click', () => {
    clearPlacements('Generated positions cleared. Visual links are retained.');
    renderCard();
    repaintOverviewAndMarkers();
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
      scatterState.status = `${current.label} linked. Existing marker positions retained.`;
      renderCard();
      repaintOverviewAndMarkers();
    }
  });
}

function unlinkSlot(slotId) {
  const slot = findSlot(slotId);
  if (!slot) return;
  slot.visualAssetId = null;
  slot.visualAssetLabel = null;
  slot.visualAssetReferenceSource = null;
  scatterState.status = `${slot.label} unlinked. Marker positions remain as placeholders.`;
  renderCard();
  repaintOverviewAndMarkers();
}

function removeDecoration(slotId) {
  scatterState.decorations = scatterState.decorations.filter((slot) => slot.id !== slotId);
  scatterState.status = 'Decoration slot and its marker positions removed.';
  repaintOverviewAndMarkers();
  renderCard();
}

function findSlot(slotId) {
  if (scatterState.light.id === slotId) return scatterState.light;
  return scatterState.decorations.find((slot) => slot.id === slotId) || null;
}

function authoredSlots() {
  return [scatterState.light, ...scatterState.decorations];
}

function hasPlacedCells() {
  return authoredSlots().some((slot) => slot.cells.length > 0);
}

function clampAmount(value, max) {
  return Math.max(0, Math.min(max, Math.floor(value)));
}

function clearPlacements(message) {
  authoredSlots().forEach((slot) => { slot.cells = []; });
  scatterState.status = message;
}

function regeneratePlacements() {
  const currentState = runtimeState();
  if (!scatterState.enabled) {
    scatterState.status = 'Enable Scatter before generating decoration positions.';
    renderCard();
    repaintOverviewAndMarkers();
    return;
  }
  const slots = authoredSlots().filter((slot) => clampAmount(slot.amount, slot.type === 'light' ? 30 : 20) > 0);
  if (!slots.length || !currentState?.matrix?.length) {
    clearPlacements(!slots.length ? 'No positions generated: all marker amounts are zero.' : 'No maze exists for marker placement.');
    renderCard();
    repaintOverviewAndMarkers();
    return;
  }
  const available = availableCells();
  const occupied = [];
  let usedSolutionFallback = false;
  authoredSlots().forEach((slot) => { slot.cells = []; });
  slots.forEach((slot, index) => {
    const amount = clampAmount(slot.amount, slot.type === 'light' ? 30 : 20);
    const pool = available.filter((cell) => !occupied.some((existing) => sameCell(existing, cell)));
    const random = seededRandom(scatterState.seed + ((index + 1) * 7919));
    const selection = chooseCells(slot, amount, pool, occupied, currentState, random);
    slot.cells = selection.cells;
    occupied.push(...selection.cells);
    usedSolutionFallback = usedSolutionFallback || selection.solutionFallback;
  });
  if (usedSolutionFallback) {
    scatterState.status = 'No valid main route exists; Around Main Solution Path fell back to Equal Distribution.';
  } else if (occupied.length) {
    scatterState.status = 'Placeholder markers regenerated using the selected placement modes.';
  } else {
    scatterState.status = 'No available path cells remain for decoration markers.';
  }
  renderCard();
  repaintOverviewAndMarkers();
}

function chooseCells(slot, amount, candidates, occupied, currentState, random) {
  const mode = validPlacementMode(slot.placementMode);
  if (mode === 'equal_distribution') return { cells: chooseEvenDistribution(candidates, amount, occupied, currentState, random), solutionFallback: false };
  if (mode === 'solution_path') return chooseAroundSolutionPath(candidates, amount, occupied, currentState, random);
  return { cells: chooseRandomSpread(candidates, amount, random), solutionFallback: false };
}

function chooseRandomSpread(candidates, amount, random) {
  const shuffled = [...candidates];
  shuffle(shuffled, random);
  const chosen = [];
  shuffled.forEach((cell) => {
    if (chosen.length >= amount) return;
    if (chosen.every((existing) => manhattanDistance(existing, cell) > 1)) chosen.push(cell);
  });
  shuffled.forEach((cell) => {
    if (chosen.length >= amount || chosen.some((existing) => sameCell(existing, cell))) return;
    chosen.push(cell);
  });
  return chosen;
}

function chooseEvenDistribution(candidates, amount, occupied, currentState, random) {
  const pool = [...candidates];
  const chosen = [];
  if (!pool.length || amount < 1) return chosen;
  if (!occupied.length) {
    const firstIndex = Math.floor(random() * pool.length);
    chosen.push(pool.splice(firstIndex, 1)[0]);
  }
  while (chosen.length < amount && pool.length) {
    const anchors = [...occupied, ...chosen];
    const distances = distanceFromSources(currentState, anchors);
    let bestScore = -1;
    let tied = [];
    pool.forEach((cell) => {
      const score = distances.get(cellKey(cell)) ?? 0;
      if (score > bestScore) {
        bestScore = score;
        tied = [cell];
      } else if (score === bestScore) {
        tied.push(cell);
      }
    });
    const selected = tied[Math.floor(random() * tied.length)] || pool[0];
    chosen.push(selected);
    pool.splice(pool.findIndex((cell) => sameCell(cell, selected)), 1);
  }
  return chosen.slice(0, amount);
}

function chooseAroundSolutionPath(candidates, amount, occupied, currentState, random) {
  const route = findSolutionPath(currentState);
  if (!route.length) {
    return { cells: chooseEvenDistribution(candidates, amount, occupied, currentState, random), solutionFallback: true };
  }
  const candidateKeys = new Set(candidates.map(cellKey));
  const routeCandidates = route.filter((cell) => candidateKeys.has(cellKey(cell)));
  const selected = evenlySampleOrdered(routeCandidates, Math.min(amount, routeCandidates.length));
  if (selected.length < amount) {
    const selectedKeys = new Set(selected.map(cellKey));
    const remainder = candidates.filter((cell) => !selectedKeys.has(cellKey(cell)));
    const byRouteDistance = remainder
      .map((cell) => ({ cell, distance: nearestManhattanDistance(cell, route), tie: random() }))
      .sort((a, b) => a.distance - b.distance || a.tie - b.tie)
      .map((item) => item.cell);
    const needed = amount - selected.length;
    const nearPool = byRouteDistance.slice(0, Math.max(needed, needed * 4));
    selected.push(...chooseEvenDistribution(nearPool, needed, [...occupied, ...selected], currentState, random));
  }
  return { cells: selected.slice(0, amount), solutionFallback: false };
}

function evenlySampleOrdered(cells, amount) {
  if (amount >= cells.length) return [...cells];
  if (amount < 1) return [];
  return Array.from({ length: amount }, (_, index) => {
    const cellIndex = Math.min(cells.length - 1, Math.floor(((index + 0.5) * cells.length) / amount));
    return cells[cellIndex];
  });
}

function findSolutionPath(currentState) {
  if (!currentState?.start || !currentState?.exit) return [];
  const queue = [[currentState.start]];
  const seen = new Set([cellKey(currentState.start)]);
  while (queue.length) {
    const path = queue.shift();
    const cell = path[path.length - 1];
    if (sameCell(cell, currentState.exit)) return path;
    openNeighbours(cell).forEach((next) => {
      if (seen.has(cellKey(next)) || !isOpenCell(currentState, next)) return;
      seen.add(cellKey(next));
      queue.push([...path, next]);
    });
  }
  return [];
}

function distanceFromSources(currentState, sources) {
  const distances = new Map();
  const queue = [];
  sources.forEach((source) => {
    if (!source || distances.has(cellKey(source)) || !isOpenCell(currentState, source)) return;
    distances.set(cellKey(source), 0);
    queue.push(source);
  });
  while (queue.length) {
    const cell = queue.shift();
    const distance = distances.get(cellKey(cell));
    openNeighbours(cell).forEach((next) => {
      if (distances.has(cellKey(next)) || !isOpenCell(currentState, next)) return;
      distances.set(cellKey(next), distance + 1);
      queue.push(next);
    });
  }
  return distances;
}

function openNeighbours(cell) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: cell.x + dx, y: cell.y + dy }));
}

function isOpenCell(currentState, cell) {
  return cell.x >= 0 && cell.y >= 0 && cell.x < currentState.gridSize && cell.y < currentState.gridSize && currentState.matrix[cell.y]?.[cell.x] === 0 && isInsideShape(cell.x, cell.y, currentState.gridSize, currentState.layout, currentState.stretchX, currentState.stretchY);
}

function nearestManhattanDistance(cell, cells) {
  return cells.reduce((minimum, other) => Math.min(minimum, manhattanDistance(cell, other)), Infinity);
}

function manhattanDistance(first, second) {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
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
      if (!isOpenCell(currentState, cell) || blocked.has(cellKey(cell))) continue;
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
    if (scatterState.enabled && hasPlacedCells()) regeneratePlacements();
  });
  window.addEventListener('artifex-maze-connections-updated', () => {
    if (scatterState.enabled && hasPlacedCells()) regeneratePlacements();
  });
  ['btn-random', 'btn-start-blank', 'btn-clear-all', 'btn-load-reference', 'layout-style-slider', 'grid-slider', 'stretch-x-slider', 'stretch-y-slider'].forEach((id) => {
    $(id)?.addEventListener('click', () => window.setTimeout(regenerateIfPlaced, 40), true);
    $(id)?.addEventListener('change', () => window.setTimeout(regenerateIfPlaced, 40), true);
  });
}

function regenerateIfPlaced() {
  if (scatterState.enabled && hasPlacedCells()) regeneratePlacements();
}

function repaintOverviewAndMarkers() {
  window.__artifexMazeRuntimeControls?.repaintAll?.();
  window.setTimeout(drawOverviewMarkers, 35);
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
  authoredSlots().forEach((slot, slotIndex) => {
    slot.cells.forEach((cell) => drawMarker(ctx, dims, cell, slot.type === 'light' ? '✦' : `${slotIndex}`, slot.type === 'light' ? '#f6d879' : '#83d8ac', !slot.visualAssetId));
  });
}

function drawMarker(ctx, dims, cell, markerText, color, isPlaceholder) {
  const x = dims.ox + cell.x * dims.cellW + dims.cellW / 2;
  const y = dims.oy + cell.y * dims.cellH + dims.cellH / 2;
  const radius = Math.max(4.5, Math.min(dims.cellW, dims.cellH) * 0.28);
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = isPlaceholder ? 0.72 : 1;
  ctx.strokeStyle = '#06140b';
  ctx.lineWidth = 1.4;
  if (isPlaceholder) ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#06140b';
  ctx.font = `800 ${Math.max(7, radius * 1.15)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(markerText, x, y + 0.4);
  ctx.restore();
}

function exportSlot(slot) {
  return {
    id: slot.id,
    type: slot.type,
    placementMode: validPlacementMode(slot.placementMode),
    visualAssetId: slot.visualAssetId,
    visualAssetLabel: slot.visualAssetLabel,
    visualAssetReferenceSource: slot.visualAssetReferenceSource,
    visualLinkStatus: slot.visualAssetId ? 'linked_final_asset' : 'placeholder_pending_final_asset',
    amount: slot.amount,
    cells: slot.cells.map((cell) => ({ ...cell }))
  };
}

function exportScatter() {
  return {
    schemaVersion: 'artifex.mazeScatter.v2',
    enabled: scatterState.enabled,
    seed: scatterState.seed,
    collision: 'none',
    previewStatus: 'overview_authoring_markers_only_pending_playable_visual_rendering',
    light: scatterState.enabled ? exportSlot(scatterState.light) : null,
    decorations: scatterState.enabled ? scatterState.decorations.map(exportSlot) : []
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
    .scatter-body{margin-top:9px;display:grid;gap:7px}.scatter-slot{padding:7px;border:1px solid rgba(158,230,164,.13);border-radius:9px;background:rgba(0,0,0,.14)}.scatter-light-slot{border-color:rgba(225,192,115,.23)}.scatter-slot-title{display:flex;justify-content:space-between;gap:7px;align-items:baseline;margin-bottom:6px}.scatter-slot-title strong{color:#eadfc6;font-size:.64rem}.scatter-slot-title small{max-width:175px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#a9b59e;font-size:.55rem}.scatter-controls{display:flex;gap:5px;align-items:end;flex-wrap:wrap}.scatter-controls label,.scatter-generation label{display:grid;gap:2px;color:#d8d0ba;font-size:.56rem}.scatter-controls input{width:54px}.scatter-controls input,.scatter-controls select,.scatter-generation input{min-height:26px;box-sizing:border-box;border-radius:7px;border:1px solid rgba(158,230,164,.18);background:#07190e;color:#eadfc6;padding:3px 5px;font-size:.62rem;color-scheme:dark}.scatter-placement-control{flex:1 1 145px}.scatter-placement-control select{width:100%;max-width:190px}.scatter-controls button,.scatter-decoration-heading button,.scatter-generation button{min-height:27px;padding:4px 7px;border-radius:7px;border:1px solid rgba(158,230,164,.22);background:rgba(12,54,28,.65);color:#eadfc6;font-size:.58rem;font-weight:700;cursor:pointer}.scatter-controls button:disabled,.scatter-decoration-heading button:disabled{opacity:.42;cursor:not-allowed}
    .scatter-decoration-heading{display:flex;justify-content:space-between;align-items:center}.scatter-decoration-heading strong{color:#d8d0ba;font-size:.64rem}.scatter-decoration-list{display:grid;gap:5px}.scatter-empty{margin:0;padding:8px;border:1px dashed rgba(158,230,164,.17);border-radius:8px;color:#a9b59e;font-size:.58rem;text-align:center}.scatter-generation{display:flex;align-items:end;gap:5px;flex-wrap:wrap;padding-top:4px}.scatter-generation input{width:78px}
    .scatter-status{margin:2px 0 0;padding:6px;border-radius:8px;border:1px solid rgba(158,230,164,.16);color:#9ee6a4;background:rgba(20,72,37,.16);font-size:.57rem;line-height:1.35}.scatter-render-note{margin:0;color:#d8c185;font-size:.56rem;line-height:1.35}
  `;
  document.head.appendChild(style);
}

function sameCell(first, second) {
  return !!first && !!second && first.x === second.x && first.y === second.y;
}

function cellKey(cell) {
  return `${cell.x}:${cell.y}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}
