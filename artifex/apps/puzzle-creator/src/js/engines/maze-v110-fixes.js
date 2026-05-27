import { SHAPES, SIZE_MAP, isInsideShape, isBoundaryCell, chooseEntranceExit, nearestInteriorNeighbour } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const patchState = {
  panX: 0,
  panY: 0,
  dragging: false,
  dragButton: null,
  lastX: 0,
  lastY: 0,
  suppressNextOriginal: false
};

window.addEventListener('DOMContentLoaded', () => {
  installButtonOverrides();
  installDisplayModes();
  installMiddleMousePan();
  installRenderHooks();
  setTimeout(() => buildGeneratedMaze('initial'), 120);
});

function runtime() { return window.__artifexMazeRuntime; }
function state() { return runtime()?.state; }

function installButtonOverrides() {
  captureClick('btn-random', () => buildGeneratedMaze('fresh random'));
  captureClick('btn-load-reference', () => buildGeneratedMaze('reference'));
  captureClick('btn-start-blank', () => clearToBlankShape('start blank'));
  captureClick('btn-clear-all', () => clearToBlankShape('clear all'));
  captureClick('btn-solve', () => plotSolution());
  captureClick('btn-apply-difficulty', () => analyseDifficultyPlaceholder());
  $$('[data-force-regenerate]').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    buildGeneratedMaze(button.dataset.forceRegenerate || 'manual');
  }, true));

  ['layout-style-slider', 'stretch-x-slider', 'stretch-y-slider', 'grid-slider'].forEach((id) => {
    const input = $(id);
    if (!input) return;
    input.addEventListener('change', () => {
      const s = state();
      if (!s) return;
      syncStateFromControls();
      if (s.blankStarted) clearToBlankShape(`${id} blank reshape`);
      else buildGeneratedMaze(id.replace('-slider', ''));
    });
    input.addEventListener('input', () => {
      syncStateFromControls();
      updateOverviewSummary();
    });
  });

  ['warp-slider', 'edge-style-slider', 'wall-height-slider', 'gap-slider'].forEach((id) => {
    $(id)?.addEventListener('input', () => setTimeout(repaintAll, 10));
  });
}

function captureClick(id, handler) {
  const node = $(id);
  if (!node) return;
  node.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    syncStateFromControls();
    handler(event);
  }, true);
}

function installDisplayModes() {
  $('view-mode-3d')?.addEventListener('click', (event) => {
    event.preventDefault();
    const s = state();
    if (!s) return;
    s.view = '3d';
    setModeButtons('3d');
    $('virtual-dpad')?.classList.add('is-hidden');
    setStatus('3D View · dedicated renderer pending');
    draw3DPlaceholder();
  }, true);

  $('view-mode-diorama')?.addEventListener('click', () => {
    const s = state();
    if (s) s.view = 'diorama';
    setModeButtons('diorama');
    $('virtual-dpad')?.classList.add('is-hidden');
    setStatus('Diorama camera');
    setTimeout(repaintAll, 30);
  });

  $('view-mode-fps')?.addEventListener('click', () => {
    const s = state();
    if (s) s.view = 'fps';
    setModeButtons('fps');
    $('virtual-dpad')?.classList.remove('is-hidden');
    setStatus('Walk Test · WASD/arrows');
    setTimeout(repaintAll, 30);
  });
}

function setModeButtons(mode) {
  $('view-mode-diorama')?.classList.toggle('is-active', mode === 'diorama');
  $('view-mode-fps')?.classList.toggle('is-active', mode === 'fps');
  $('view-mode-3d')?.classList.toggle('is-active', mode === '3d');
}

function installMiddleMousePan() {
  const box = $('threejs-container');
  if (!box) return;
  box.addEventListener('mousedown', (event) => {
    if (event.button !== 1 && event.button !== 2) return;
    event.preventDefault();
    patchState.dragging = true;
    patchState.dragButton = event.button;
    patchState.lastX = event.clientX;
    patchState.lastY = event.clientY;
    document.body.style.userSelect = 'none';
  });
  box.addEventListener('contextmenu', (event) => {
    if (patchState.dragButton === 2) event.preventDefault();
  });
  window.addEventListener('mousemove', (event) => {
    if (!patchState.dragging) return;
    const dx = event.clientX - patchState.lastX;
    const dy = event.clientY - patchState.lastY;
    patchState.lastX = event.clientX;
    patchState.lastY = event.clientY;
    patchState.panX += dx;
    patchState.panY += dy;
    repaintPreviewOnly();
  });
  window.addEventListener('mouseup', () => {
    patchState.dragging = false;
    patchState.dragButton = null;
    document.body.style.userSelect = '';
  });
  $('btn-zoom-reset')?.addEventListener('click', () => {
    patchState.panX = 0;
    patchState.panY = 0;
    setTimeout(repaintPreviewOnly, 20);
  });
}

function installRenderHooks() {
  window.addEventListener('artifex-preview-redrawn', () => {
    const s = state();
    if (!s || s.view === '3d') return;
    setTimeout(repaintPreviewOnly, 0);
  });
  window.addEventListener('resize', () => setTimeout(repaintAll, 60));
}

function syncStateFromControls() {
  const s = state();
  if (!s) return;
  s.sizeLevel = Number($('grid-slider')?.value || s.sizeLevel || 3);
  s.gridSize = SIZE_MAP[s.sizeLevel] || s.gridSize || 20;
  s.layout = Number($('layout-style-slider')?.value || 1);
  s.stretchX = Number($('stretch-x-slider')?.value || 100);
  s.stretchY = Number($('stretch-y-slider')?.value || 100);
  s.warp = Number($('warp-slider')?.value || 0);
  s.edge = Number($('edge-style-slider')?.value || 0);
  s.gap = Number($('gap-slider')?.value || 0.98);
  s.wallHeight = Number($('wall-height-slider')?.value || 1.5);
}

function blankGrid(fill = 1) {
  const s = state();
  return Array.from({ length: s.gridSize }, () => Array(s.gridSize).fill(fill));
}

function buildGeneratedMaze(reason = 'regenerate') {
  const s = state();
  if (!s) return;
  syncStateFromControls();
  s.blankStarted = false;
  s.matrix = blankGrid(1);
  s.cellStyles = Array.from({ length: s.gridSize }, () => Array(s.gridSize).fill(null));
  const endpoints = chooseEntranceExit(s.gridSize, s.layout, s.stretchX, s.stretchY);
  s.start = endpoints.start;
  s.exit = endpoints.exit;

  const startInner = nearestInteriorNeighbour(s.start, s.gridSize, s.layout, s.stretchX, s.stretchY) || nearestInteriorCell(s.start);
  const exitInner = nearestInteriorNeighbour(s.exit, s.gridSize, s.layout, s.stretchX, s.stretchY) || nearestInteriorCell(s.exit);
  carveMazeFrom(startInner);
  carveGuaranteedPath(startInner, exitInner);
  applySolidBorderWithOpenings();
  s.matrix[s.start.y][s.start.x] = 0;
  s.matrix[s.exit.y][s.exit.x] = 0;
  if (startInner) s.matrix[startInner.y][startInner.x] = 0;
  if (exitInner) s.matrix[exitInner.y][exitInner.x] = 0;
  s.player = { x: s.start.x + 0.5, y: s.start.y + 0.5 };
  s.solution = findPath(s.start, s.exit);
  setStatus(`Map regenerated · ${reason}`);
  repaintAll();
}

function clearToBlankShape(reason = 'blank') {
  const s = state();
  if (!s) return;
  syncStateFromControls();
  s.blankStarted = true;
  s.matrix = blankGrid(1);
  s.cellStyles = Array.from({ length: s.gridSize }, () => Array(s.gridSize).fill(null));
  const endpoints = chooseEntranceExit(s.gridSize, s.layout, s.stretchX, s.stretchY);
  s.start = endpoints.start;
  s.exit = endpoints.exit;
  for (let y = 0; y < s.gridSize; y++) {
    for (let x = 0; x < s.gridSize; x++) {
      if (isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY) && !isBoundaryCell(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY)) s.matrix[y][x] = 0;
    }
  }
  applySolidBorderWithOpenings();
  const startInner = nearestInteriorNeighbour(s.start, s.gridSize, s.layout, s.stretchX, s.stretchY);
  const exitInner = nearestInteriorNeighbour(s.exit, s.gridSize, s.layout, s.stretchX, s.stretchY);
  s.matrix[s.start.y][s.start.x] = 0;
  s.matrix[s.exit.y][s.exit.x] = 0;
  if (startInner) s.matrix[startInner.y][startInner.x] = 0;
  if (exitInner) s.matrix[exitInner.y][exitInner.x] = 0;
  s.player = { x: s.start.x + 0.5, y: s.start.y + 0.5 };
  s.solution = [];
  setStatus(`Blank shape · ${reason}`);
  repaintAll();
}

function carveMazeFrom(startCell) {
  const s = state();
  if (!startCell) return;
  let seed = Date.now() % 99999;
  const rnd = () => { const n = Math.sin(seed++) * 10000; return n - Math.floor(n); };
  const valid = (x, y) => x > 0 && y > 0 && x < s.gridSize - 1 && y < s.gridSize - 1 && isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY) && !isBoundaryCell(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY);
  function carve(x, y) {
    if (!valid(x, y)) return;
    s.matrix[y][x] = 0;
    [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => rnd() - 0.5).forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (valid(nx, ny) && s.matrix[ny][nx]) {
        s.matrix[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    });
  }
  carve(startCell.x, startCell.y);
}

function carveGuaranteedPath(from, to) {
  const s = state();
  if (!from || !to) return;
  const queue = [from];
  const seen = new Set([key(from)]);
  const parent = new Map();
  while (queue.length) {
    const p = queue.shift();
    if (p.x === to.x && p.y === to.y) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (seen.has(key(n))) continue;
      if (!isInteriorShapeCell(n.x, n.y)) continue;
      seen.add(key(n));
      parent.set(key(n), p);
      queue.push(n);
    }
  }
  let cur = to;
  let guard = 0;
  while (cur && guard++ < s.gridSize * s.gridSize) {
    if (isInteriorShapeCell(cur.x, cur.y)) s.matrix[cur.y][cur.x] = 0;
    if (cur.x === from.x && cur.y === from.y) break;
    cur = parent.get(key(cur));
  }
}

function applySolidBorderWithOpenings() {
  const s = state();
  const open = new Set([key(s.start), key(s.exit)]);
  for (let y = 0; y < s.gridSize; y++) {
    for (let x = 0; x < s.gridSize; x++) {
      if (!isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY)) s.matrix[y][x] = 1;
      else if (isBoundaryCell(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY) && !open.has(`${x},${y}`)) s.matrix[y][x] = 1;
    }
  }
}

function nearestInteriorCell(target) {
  const s = state();
  let best = null;
  let bestScore = Infinity;
  for (let y = 0; y < s.gridSize; y++) {
    for (let x = 0; x < s.gridSize; x++) {
      if (!isInteriorShapeCell(x, y)) continue;
      const score = Math.abs(x - target.x) + Math.abs(y - target.y);
      if (score < bestScore) { best = { x, y }; bestScore = score; }
    }
  }
  return best;
}

function isInteriorShapeCell(x, y) {
  const s = state();
  return x >= 0 && y >= 0 && x < s.gridSize && y < s.gridSize && isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY) && !isBoundaryCell(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY);
}

function findPath(start, exit) {
  const s = state();
  if (!s || !start || !exit) return [];
  const queue = [[start]];
  const seen = new Set([key(start)]);
  while (queue.length) {
    const path = queue.shift();
    const p = path[path.length - 1];
    if (p.x === exit.x && p.y === exit.y) return path;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (seen.has(key(n))) continue;
      if (n.x < 0 || n.y < 0 || n.x >= s.gridSize || n.y >= s.gridSize) continue;
      if (s.matrix[n.y][n.x]) continue;
      if (!isInsideShape(n.x, n.y, s.gridSize, s.layout, s.stretchX, s.stretchY)) continue;
      seen.add(key(n));
      queue.push([...path, n]);
    }
  }
  return [];
}

function plotSolution() {
  const s = state();
  if (!s) return;
  const path = findPath(s.start, s.exit);
  s.solution = path;
  setStatus(path.length ? `Solution path · ${path.length} cells` : 'No entrance-to-exit route found');
  repaintAll();
}

function analyseDifficultyPlaceholder() {
  const s = state();
  if (!s) return;
  const path = findPath(s.start, s.exit);
  const target = 6 - Number(s.difficulty || 3);
  alert(path.length ? `Difficulty analysis placeholder:\n\nTarget: ${target} meaningful route(s).\nCurrent quick check: at least one valid route exists.\n\nFull meaningful-route count/report/fix is still a later pass.` : 'No valid route exists yet. Use Clear All, Regenerate, or draw a route before analysing difficulty.');
}

function repaintAll() {
  syncStateFromControls();
  drawOverview();
  if (state()?.view === '3d') draw3DPlaceholder();
  else drawPreview();
  updateOverviewSummary();
}
function repaintPreviewOnly() { state()?.view === '3d' ? draw3DPlaceholder() : drawPreview(); }

function drawOverview() {
  const s = state();
  const canvas = $('analysis-canvas');
  if (!s || !canvas || !s.matrix?.length) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 420;
  canvas.height = 420;
  const scaleX = s.stretchX / 100;
  const scaleY = s.stretchY / 100;
  const cell = Math.min(canvas.width / (s.gridSize * scaleX), canvas.height / (s.gridSize * scaleY));
  const ox = (canvas.width - s.gridSize * cell * scaleX) / 2;
  const oy = (canvas.height - s.gridSize * cell * scaleY) / 2;
  ctx.fillStyle = '#031009';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scaleX, scaleY);
  drawCells(ctx, cell, false);
  drawSolution(ctx, cell, false);
  drawNode(ctx, s.start, cell, '#d65f55');
  drawNode(ctx, s.exit, cell, '#8ee6dc');
  ctx.restore();
  setText('matrix-summary', `${SHAPES[s.layout]} · ${s.gridSize} · ${s.matrix.flat().filter(Boolean).length} walls`);
}

function drawPreview() {
  const s = state();
  const wrap = $('threejs-container');
  if (!s || !wrap || !s.matrix?.length) return;
  let canvas = $('maze-preview-canvas');
  if (!canvas) { wrap.innerHTML = ''; canvas = document.createElement('canvas'); canvas.id = 'maze-preview-canvas'; wrap.appendChild(canvas); }
  const rect = wrap.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * ratio);
  canvas.height = Math.max(1, rect.height * ratio);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const scaleX = s.stretchX / 100;
  const scaleY = s.stretchY / 100;
  const cell = Math.min(rect.width / (s.gridSize * scaleX + 4), rect.height / (s.gridSize * scaleY + 4)) * (s.zoom || 1);
  const ox = rect.width / 2 - (s.gridSize * cell * scaleX) / 2 + patchState.panX;
  const oy = rect.height / 2 - (s.gridSize * cell * scaleY) / 2 + patchState.panY;
  fillBackground(ctx, rect.width, rect.height);
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scaleX, scaleY);
  drawCells(ctx, cell, true);
  drawSolution(ctx, cell, true);
  drawNode(ctx, s.start, cell, '#d65f55');
  drawNode(ctx, s.exit, cell, '#8ee6dc');
  if (s.view === 'fps') drawPlayer(ctx, cell);
  ctx.restore();
}

function drawCells(ctx, cell, preview) {
  const s = state();
  const gap = preview ? Math.max(0.82, Number(s.gap || 0.98)) : 1;
  for (let y = 0; y < s.gridSize; y++) {
    for (let x = 0; x < s.gridSize; x++) {
      if (!isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY)) continue;
      const pos = warpedPoint(x, y, cell);
      const style = s.matrix[y][x] ? s.style.walls : s.style.floor;
      ctx.fillStyle = style?.color || (s.matrix[y][x] ? '#24513a' : '#7b5a32');
      ctx.fillRect(pos.x, pos.y, cell * gap, cell * gap);
      if (s.matrix[y][x]) {
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        ctx.fillRect(pos.x, pos.y + cell * gap * 0.62, cell * gap, cell * gap * 0.38);
      }
      ctx.strokeStyle = 'rgba(158,230,164,.11)';
      ctx.strokeRect(pos.x, pos.y, cell * gap, cell * gap);
    }
  }
}

function drawSolution(ctx, cell) {
  const s = state();
  if (!s.solution?.length) return;
  ctx.strokeStyle = '#8ee6dc';
  ctx.lineWidth = Math.max(2, cell * 0.25);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  s.solution.forEach((p, index) => {
    const pos = warpedPoint(p.x, p.y, cell);
    const x = pos.x + cell / 2;
    const y = pos.y + cell / 2;
    index ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
}

function drawNode(ctx, p, cell, color) {
  const pos = warpedPoint(p.x, p.y, cell);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x + cell / 2, pos.y + cell / 2, Math.max(4, cell * 0.35), 0, Math.PI * 2);
  ctx.fill();
}
function drawPlayer(ctx, cell) { drawNode(ctx, { x: Math.floor(state().player.x), y: Math.floor(state().player.y) }, cell, '#f3dcaa'); }

function warpedPoint(x, y, cell) {
  const s = state();
  let px = x * cell;
  let py = y * cell;
  const warp = Number(s.warp || 0) / 100;
  if (warp) {
    px += Math.sin(y * 1.37 + x * 0.31) * cell * 0.42 * warp;
    py += Math.cos(x * 1.21 + y * 0.27) * cell * 0.42 * warp;
  }
  return { x: px, y: py };
}

function fillBackground(ctx, w, h) {
  const s = state();
  ctx.fillStyle = s?.style?.roof?.color || '#031009';
  ctx.fillRect(0, 0, w, h);
}

function draw3DPlaceholder() {
  const wrap = $('threejs-container');
  if (!wrap) return;
  let canvas = $('maze-preview-canvas');
  if (!canvas) { wrap.innerHTML = ''; canvas = document.createElement('canvas'); canvas.id = 'maze-preview-canvas'; wrap.appendChild(canvas); }
  const rect = wrap.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * ratio);
  canvas.height = Math.max(1, rect.height * ratio);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  fillBackground(ctx, rect.width, rect.height);
  ctx.fillStyle = 'rgba(158,230,164,.08)';
  ctx.fillRect(40, 48, rect.width - 80, rect.height - 96);
  ctx.strokeStyle = 'rgba(158,230,164,.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 48, rect.width - 80, rect.height - 96);
  ctx.fillStyle = '#e9dcc1';
  ctx.font = '800 22px Inter, sans-serif';
  ctx.fillText('3D View placeholder', 64, 88);
  ctx.font = '600 14px Inter, sans-serif';
  ctx.fillStyle = '#b9c5a5';
  ctx.fillText('The real first-person / tunnel renderer is queued for a dedicated runtime pass.', 64, 116);
  ctx.fillText('Use Walk Test for movement and collision until then.', 64, 140);
}

function updateOverviewSummary() {
  const s = state();
  const box = $('overview-settings-summary');
  if (!s || !box) return;
  const edge = ['Sharp', 'Rough', 'Smooth'][s.edge] || s.edge || 'Sharp';
  box.textContent = `Shape: ${SHAPES[s.layout]} · Size: ${s.sizeLevel}/${s.gridSize} · Stretch: X ${s.stretchX}%, Y ${s.stretchY}% · Warp: ${s.warp}% · Edge: ${edge} · Tunnel: ${s.tunnelMode ? 'On' : 'Off'}`;
}

function setStatus(text) { setText('player-status-indicator', text); updateOverviewSummary(); }
function setText(id, text) { const node = $(id); if (node) node.textContent = text; }
function key(p) { return `${p.x},${p.y}`; }
