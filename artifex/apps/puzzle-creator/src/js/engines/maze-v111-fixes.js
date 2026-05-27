import { SHAPES, SIZE_MAP, isInsideShape, isBoundaryCell, chooseEntranceExit, nearestInteriorNeighbour } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const patchState = {
  panX: 0,
  panY: 0,
  dragging: false,
  lastX: 0,
  lastY: 0,
  keys: {},
  walkTimer: null
};

window.addEventListener('DOMContentLoaded', () => {
  installButtonOverrides();
  installSliderOverrides();
  installDisplayModes();
  installKeyboardWalkTest();
  installWorkspacePan();
  setTimeout(() => buildGeneratedMaze('initial'), 160);
});

function runtime() { return window.__artifexMazeRuntime; }
function state() { return runtime()?.state; }

function installButtonOverrides() {
  captureClick('btn-random', () => buildGeneratedMaze('fresh random'));
  captureClick('btn-load-reference', () => buildGeneratedMaze('reference'));
  captureClick('btn-start-blank', () => clearToBlankShape('start blank'));
  captureClick('btn-clear-all', () => clearToBlankShape('clear all'));
  captureClick('btn-solve', () => plotSolution());
  captureClick('btn-apply-difficulty', () => analyseDifficulty());
  $$('[data-force-regenerate]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      buildGeneratedMaze(button.dataset.forceRegenerate || 'manual');
    }, true);
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

function installSliderOverrides() {
  ['layout-style-slider', 'stretch-x-slider', 'stretch-y-slider', 'grid-slider'].forEach((id) => {
    const input = $(id);
    if (!input) return;
    input.addEventListener('change', (event) => {
      event.stopImmediatePropagation();
      syncStateFromControls();
      const s = state();
      if (!s) return;
      if (s.blankStarted) clearToBlankShape(`${id} blank reshape`);
      else buildGeneratedMaze(id.replace('-slider', ''));
    }, true);
    input.addEventListener('input', () => {
      syncStateFromControls();
      updateLabels();
      updateOverviewSummary();
    }, true);
  });
  ['warp-slider', 'edge-style-slider', 'wall-height-slider', 'gap-slider', 'difficulty-slider'].forEach((id) => {
    $(id)?.addEventListener('input', () => {
      syncStateFromControls();
      updateLabels();
      repaintAll();
    }, true);
  });
}

function installDisplayModes() {
  captureClick('view-mode-diorama', () => setDisplayMode('diorama'));
  captureClick('view-mode-fps', () => setDisplayMode('walktest'));
  captureClick('view-mode-3d', () => setDisplayMode('3d'));
}

function setDisplayMode(mode) {
  const s = state();
  if (!s) return;
  s.view = mode;
  $('view-mode-diorama')?.classList.toggle('is-active', mode === 'diorama');
  $('view-mode-fps')?.classList.toggle('is-active', mode === 'walktest');
  $('view-mode-3d')?.classList.toggle('is-active', mode === '3d');
  $('virtual-dpad')?.classList.toggle('is-hidden', mode !== 'walktest');
  if (mode === 'walktest') setStatus('Walk Test · WASD/arrows');
  else if (mode === '3d') setStatus('3D View · renderer not built yet');
  else setStatus('Diorama camera');
  repaintAll();
}

function installKeyboardWalkTest() {
  window.addEventListener('keydown', (event) => handleWalkKey(event, true), true);
  window.addEventListener('keyup', (event) => handleWalkKey(event, false), true);
  $('virtual-dpad')?.querySelectorAll('button[data-dpad]').forEach((button) => {
    const key = button.dataset.dpad;
    const down = (event) => { event.preventDefault(); patchState.keys[key] = true; updateDpad(); };
    const up = (event) => { event.preventDefault(); patchState.keys[key] = false; updateDpad(); };
    button.addEventListener('mousedown', down);
    button.addEventListener('mouseup', up);
    button.addEventListener('mouseleave', up);
    button.addEventListener('touchstart', down, { passive: false });
    button.addEventListener('touchend', up, { passive: false });
  });
  if (!patchState.walkTimer) patchState.walkTimer = setInterval(moveWalkPlayer, 33);
}

function handleWalkKey(event, pressed) {
  const s = state();
  const map = { ArrowUp: 'w', ArrowLeft: 'a', ArrowDown: 's', ArrowRight: 'd', w: 'w', W: 'w', a: 'a', A: 'a', s: 's', S: 's', d: 'd', D: 'd' };
  const mapped = map[event.key];
  if (!mapped || s?.view !== 'walktest') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  patchState.keys[mapped] = pressed;
  updateDpad();
}

function updateDpad() {
  $('virtual-dpad')?.querySelectorAll('button[data-dpad]').forEach((button) => button.classList.toggle('is-pressed', !!patchState.keys[button.dataset.dpad]));
}

function moveWalkPlayer() {
  const s = state();
  if (!s || s.view !== 'walktest') return;
  let dx = 0;
  let dy = 0;
  if (patchState.keys.w) dy -= 0.1;
  if (patchState.keys.s) dy += 0.1;
  if (patchState.keys.a) dx -= 0.1;
  if (patchState.keys.d) dx += 0.1;
  if (!dx && !dy) return;
  const nx = s.player.x + dx;
  const ny = s.player.y + dy;
  const cx = Math.floor(nx);
  const cy = Math.floor(ny);
  if (isOpenCell(cx, cy)) {
    s.player.x = nx;
    s.player.y = ny;
    repaintPreviewOnly();
  }
}

function installWorkspacePan() {
  const target = document.querySelector('.render-viewport') || $('threejs-container');
  if (!target) return;
  target.addEventListener('mousedown', (event) => {
    if (event.button !== 1 && event.button !== 2) return;
    event.preventDefault();
    event.stopPropagation();
    patchState.dragging = true;
    patchState.lastX = event.clientX;
    patchState.lastY = event.clientY;
    document.body.style.userSelect = 'none';
  }, true);
  window.addEventListener('contextmenu', (event) => { if (patchState.dragging) event.preventDefault(); }, true);
  window.addEventListener('mousemove', (event) => {
    if (!patchState.dragging) return;
    patchState.panX += event.clientX - patchState.lastX;
    patchState.panY += event.clientY - patchState.lastY;
    patchState.lastX = event.clientX;
    patchState.lastY = event.clientY;
    repaintPreviewOnly();
  }, true);
  window.addEventListener('mouseup', () => {
    patchState.dragging = false;
    document.body.style.userSelect = '';
  }, true);
  $('btn-zoom-reset')?.addEventListener('click', () => {
    patchState.panX = 0;
    patchState.panY = 0;
    setTimeout(repaintPreviewOnly, 20);
  }, true);
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
  s.difficulty = Number($('difficulty-slider')?.value || s.difficulty || 3);
}

function updateLabels() {
  const s = state();
  if (!s) return;
  setText('grid-val', `${s.sizeLevel} · ${s.gridSize}`);
  setText('layout-style-val', SHAPES[s.layout]);
  setText('stretch-x-val', `${s.stretchX}%`);
  setText('stretch-y-val', `${s.stretchY}%`);
  setText('warp-val', `${s.warp}%`);
  setText('edge-style-val', ['Sharp', 'Rough', 'Smooth'][s.edge] || 'Sharp');
  setText('difficulty-val', ['', '1 · Easy', '2 · Gentle', '3 · Balanced', '4 · Hard', '5 · Brutal'][s.difficulty] || `${s.difficulty}`);
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
  if (startInner) s.matrix[startInner.y][startInner.x] = 0;
  connectEndpointToMaze(exitInner);
  addDifficultyLoops();
  applySolidBorderWithOpenings();
  openEndpoint(s.start);
  openEndpoint(s.exit);
  s.player = { x: s.start.x + 0.5, y: s.start.y + 0.5 };
  s.solution = [];
  const route = findPath(s.start, s.exit);
  setStatus(route.length ? `Map regenerated · ${reason} · route OK` : `Map regenerated · ${reason} · route needs edit`);
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
  for (let y = 0; y < s.gridSize; y++) for (let x = 0; x < s.gridSize; x++) if (isInteriorShapeCell(x, y)) s.matrix[y][x] = 0;
  applySolidBorderWithOpenings();
  openEndpoint(s.start);
  openEndpoint(s.exit);
  s.player = { x: s.start.x + 0.5, y: s.start.y + 0.5 };
  s.solution = [];
  setStatus(`Blank shape · ${reason}`);
  repaintAll();
}

function carveMazeFrom(startCell) {
  const s = state();
  if (!startCell) return;
  let seed = (Date.now() + s.difficulty * 997 + s.layout * 31) % 99999;
  const rnd = () => { const n = Math.sin(seed++) * 10000; return n - Math.floor(n); };
  const valid = (x, y) => isInteriorShapeCell(x, y);
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

function connectEndpointToMaze(endpointInner) {
  const s = state();
  if (!endpointInner) return;
  if (s.matrix[endpointInner.y][endpointInner.x] === 0) return;
  const target = nearestOpenInteriorCell(endpointInner);
  if (!target) {
    s.matrix[endpointInner.y][endpointInner.x] = 0;
    return;
  }
  carveConnector(endpointInner, target);
}

function nearestOpenInteriorCell(origin) {
  const s = state();
  const queue = [origin];
  const seen = new Set([key(origin)]);
  while (queue.length) {
    const p = queue.shift();
    if (isInteriorShapeCell(p.x, p.y) && s.matrix[p.y][p.x] === 0) return p;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (seen.has(key(n)) || !isInteriorShapeCell(n.x, n.y)) continue;
      seen.add(key(n));
      queue.push(n);
    }
  }
  return null;
}

function carveConnector(from, to) {
  const s = state();
  const queue = [from];
  const seen = new Set([key(from)]);
  const parent = new Map();
  while (queue.length) {
    const p = queue.shift();
    if (p.x === to.x && p.y === to.y) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (seen.has(key(n)) || !isInteriorShapeCell(n.x, n.y)) continue;
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

function addDifficultyLoops() {
  const s = state();
  const targetLoops = { 5: 0, 4: 2, 3: 5, 2: 9, 1: 14 }[s.difficulty] ?? 5;
  if (!targetLoops) return;
  let seed = (Date.now() + 701 + s.difficulty * 53) % 99999;
  const rnd = () => { const n = Math.sin(seed++) * 10000; return n - Math.floor(n); };
  const candidates = [];
  for (let y = 1; y < s.gridSize - 1; y++) {
    for (let x = 1; x < s.gridSize - 1; x++) {
      if (!isInteriorShapeCell(x, y) || s.matrix[y][x] === 0) continue;
      const horizontal = isOpenCell(x - 1, y) && isOpenCell(x + 1, y);
      const vertical = isOpenCell(x, y - 1) && isOpenCell(x, y + 1);
      if (horizontal || vertical) candidates.push({ x, y });
    }
  }
  candidates.sort(() => rnd() - 0.5).slice(0, targetLoops).forEach((p) => { s.matrix[p.y][p.x] = 0; });
}

function applySolidBorderWithOpenings() {
  const s = state();
  const open = new Set([key(s.start), key(s.exit)]);
  for (let y = 0; y < s.gridSize; y++) {
    for (let x = 0; x < s.gridSize; x++) {
      if (!isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY)) s.matrix[y][x] = 1;
      else if (isBoundaryCell(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY) && !open.has(key({ x, y }))) s.matrix[y][x] = 1;
    }
  }
}

function openEndpoint(p) {
  const s = state();
  if (!p) return;
  s.matrix[p.y][p.x] = 0;
  const inner = nearestInteriorNeighbour(p, s.gridSize, s.layout, s.stretchX, s.stretchY) || nearestInteriorCell(p);
  if (inner) s.matrix[inner.y][inner.x] = 0;
}

function nearestInteriorCell(target) {
  const s = state();
  let best = null;
  let bestScore = Infinity;
  for (let y = 0; y < s.gridSize; y++) for (let x = 0; x < s.gridSize; x++) {
    if (!isInteriorShapeCell(x, y)) continue;
    const score = Math.abs(x - target.x) + Math.abs(y - target.y);
    if (score < bestScore) { best = { x, y }; bestScore = score; }
  }
  return best;
}

function isInteriorShapeCell(x, y) {
  const s = state();
  return !!s && x >= 0 && y >= 0 && x < s.gridSize && y < s.gridSize && isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY) && !isBoundaryCell(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY);
}

function isOpenCell(x, y) {
  const s = state();
  return !!s && x >= 0 && y >= 0 && x < s.gridSize && y < s.gridSize && s.matrix[y][x] === 0 && isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY);
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
      if (seen.has(key(n)) || !isOpenCell(n.x, n.y)) continue;
      seen.add(key(n));
      queue.push([...path, n]);
    }
  }
  return [];
}

function plotSolution() {
  const s = state();
  if (!s) return;
  s.solution = findPath(s.start, s.exit);
  setStatus(s.solution.length ? `Solution path · ${s.solution.length} cells` : 'No entrance-to-exit route found');
  repaintAll();
}

function analyseDifficulty() {
  const s = state();
  if (!s) return;
  const route = findPath(s.start, s.exit);
  const target = 6 - s.difficulty;
  const branches = countBranchCells();
  const deadEnds = countDeadEnds();
  alert(route.length ? `Difficulty report\n\nTarget difficulty: ${s.difficulty}\nTarget meaningful route count: ${target}\n\nCurrent quick analysis:\nRoute exists: yes\nMain route length: ${route.length} cells\nBranch cells: ${branches}\nDead ends: ${deadEnds}\n\nRegenerate now uses the difficulty setting: higher difficulty keeps fewer loop-openings, lower difficulty opens more alternate connectors. Full meaningful-route counting is still a later pass.` : `Difficulty report\n\nNo valid entrance-to-exit route exists yet. Use Regenerate, Clear All, or draw a route before analysing difficulty.`);
}

function countOpenNeighbours(x, y) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => isOpenCell(x + dx, y + dy)).length;
}
function countBranchCells() {
  const s = state();
  let count = 0;
  for (let y = 0; y < s.gridSize; y++) for (let x = 0; x < s.gridSize; x++) if (isOpenCell(x, y) && countOpenNeighbours(x, y) >= 3) count++;
  return count;
}
function countDeadEnds() {
  const s = state();
  let count = 0;
  for (let y = 0; y < s.gridSize; y++) for (let x = 0; x < s.gridSize; x++) if (isOpenCell(x, y) && countOpenNeighbours(x, y) === 1) count++;
  return Math.max(0, count - 2);
}

function repaintAll() {
  syncStateFromControls();
  updateLabels();
  drawOverview();
  repaintPreviewOnly();
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
  const dims = dimensions(canvas.width, canvas.height, 1);
  ctx.fillStyle = '#031009';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(dims.ox, dims.oy);
  drawCells(ctx, dims.cellW, dims.cellH, false);
  drawSolution(ctx, dims.cellW, dims.cellH);
  drawNode(ctx, s.start, dims.cellW, dims.cellH, '#d65f55');
  drawNode(ctx, s.exit, dims.cellW, dims.cellH, '#8ee6dc');
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
  fillBackground(ctx, rect.width, rect.height);
  const dims = dimensions(rect.width, rect.height, s.zoom || 1);
  ctx.save();
  ctx.translate(dims.ox + patchState.panX, dims.oy + patchState.panY);
  drawCells(ctx, dims.cellW, dims.cellH, true);
  drawSolution(ctx, dims.cellW, dims.cellH);
  drawNode(ctx, s.start, dims.cellW, dims.cellH, '#d65f55');
  drawNode(ctx, s.exit, dims.cellW, dims.cellH, '#8ee6dc');
  if (s.view === 'walktest') drawPlayer(ctx, dims.cellW, dims.cellH);
  ctx.restore();
}

function dimensions(width, height, zoom = 1) {
  const s = state();
  const scaleX = Math.max(0.6, s.stretchX / 100);
  const scaleY = Math.max(0.6, s.stretchY / 100);
  const base = Math.min(width / (s.gridSize * scaleX + 3), height / (s.gridSize * scaleY + 3)) * zoom;
  const cellW = base * scaleX;
  const cellH = base * scaleY;
  const ox = width / 2 - (s.gridSize * cellW) / 2;
  const oy = height / 2 - (s.gridSize * cellH) / 2;
  return { cellW, cellH, ox, oy };
}

function drawCells(ctx, cellW, cellH, preview) {
  const s = state();
  const gap = preview ? Math.max(0.84, Number(s.gap || 0.98)) : 1;
  for (let y = 0; y < s.gridSize; y++) for (let x = 0; x < s.gridSize; x++) {
    if (!isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY)) continue;
    const pos = warpedPoint(x, y, cellW, cellH);
    const wall = s.matrix[y][x] === 1;
    ctx.fillStyle = wall ? (s.style?.walls?.color || '#24513a') : (s.style?.floor?.color || '#7b5a32');
    ctx.fillRect(pos.x, pos.y, cellW * gap, cellH * gap);
    if (wall) {
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.fillRect(pos.x, pos.y + cellH * gap * 0.62, cellW * gap, cellH * gap * 0.38);
    }
    ctx.strokeStyle = 'rgba(158,230,164,.11)';
    ctx.strokeRect(pos.x, pos.y, cellW * gap, cellH * gap);
  }
}

function drawSolution(ctx, cellW, cellH) {
  const s = state();
  if (!s.solution?.length) return;
  ctx.strokeStyle = '#8ee6dc';
  ctx.lineWidth = Math.max(2, Math.min(cellW, cellH) * 0.24);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  s.solution.forEach((p, index) => {
    const pos = warpedPoint(p.x, p.y, cellW, cellH);
    const x = pos.x + cellW / 2;
    const y = pos.y + cellH / 2;
    index ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
}

function drawNode(ctx, p, cellW, cellH, color) {
  const pos = warpedPoint(p.x, p.y, cellW, cellH);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x + cellW / 2, pos.y + cellH / 2, Math.max(4, Math.min(cellW, cellH) * 0.35), 0, Math.PI * 2);
  ctx.fill();
}
function drawPlayer(ctx, cellW, cellH) { drawNode(ctx, { x: Math.floor(state().player.x), y: Math.floor(state().player.y) }, cellW, cellH, '#f3dcaa'); }

function warpedPoint(x, y, cellW, cellH) {
  const s = state();
  let px = x * cellW;
  let py = y * cellH;
  const warp = Number(s.warp || 0) / 100;
  if (warp) {
    px += Math.sin(y * 1.37 + x * 0.31) * cellW * 0.42 * warp;
    py += Math.cos(x * 1.21 + y * 0.27) * cellH * 0.42 * warp;
  }
  return { x: px, y: py };
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
  ctx.fillStyle = '#e9dcc1';
  ctx.font = '800 22px Inter, sans-serif';
  ctx.fillText('3D View is queued', 48, 72);
  ctx.font = '600 14px Inter, sans-serif';
  ctx.fillStyle = '#b9c5a5';
  ctx.fillText('This button is reserved for the real first-person/tunnel renderer.', 48, 104);
  ctx.fillText('Use Diorama for layout preview and Walk Test for movement/collision testing.', 48, 130);
}

function fillBackground(ctx, w, h) { ctx.fillStyle = state()?.style?.roof?.color || '#031009'; ctx.fillRect(0, 0, w, h); }
function updateOverviewSummary() {
  const s = state();
  const box = $('overview-settings-summary');
  if (!s || !box) return;
  const edge = ['Sharp', 'Rough', 'Smooth'][s.edge] || 'Sharp';
  box.textContent = `Shape: ${SHAPES[s.layout]} · Size: ${s.sizeLevel}/${s.gridSize} · Stretch: X ${s.stretchX}%, Y ${s.stretchY}% · Warp: ${s.warp}% · Edge: ${edge} · Tunnel: ${s.tunnelMode ? 'On' : 'Off'}`;
}
function setStatus(text) { setText('player-status-indicator', text); updateOverviewSummary(); }
function setText(id, text) { const node = $(id); if (node) node.textContent = text; }
function key(p) { return `${p.x},${p.y}`; }
