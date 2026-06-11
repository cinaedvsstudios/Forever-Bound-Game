const SCHEMA = 'cinaedvs.artifex.puzzle.v1';

const textureLibrary = [
  { id: 'bricks', name: 'Bricks', src: 'assets/bricks.jpg', rootSrc: '../bricks.jpg' },
  { id: 'cave', name: 'Cave', src: 'assets/cave.jpg', rootSrc: '../cave.jpg' },
  { id: 'cobblestone', name: 'Cobble', src: 'assets/cobblestone.jpg', rootSrc: '../cobblestone.jpg' },
  { id: 'wood', name: 'Wood', src: 'assets/wood.jpg', rootSrc: '../wood.jpg' },
  { id: 'blocks', name: 'Blocks', src: 'assets/blocks.jpg', rootSrc: '../blocks.jpg' },
  { id: 'castle', name: 'Castle', src: 'assets/castle.jpg', rootSrc: '../castle.jpg' },
  { id: 'dirt', name: 'Dirt', src: 'assets/dirt.jpeg', rootSrc: '../dirt.jpeg' },
  { id: 'hedges', name: 'Hedges', src: 'assets/hedges.jpg', rootSrc: '../hedges.jpg' },
  { id: 'thorns', name: 'Thorns', src: 'assets/thorns.jpeg', rootSrc: '../thorns.jpeg' },
  { id: 'marble', name: 'Marble', src: 'assets/marble.jpg', rootSrc: '../marble.jpg' }
];

const palette = ['#24513a', '#7b5a32', '#8b3f2f', '#b37a37', '#7fd2cf', '#684b8f', '#2b3341', '#e1c073'];
const SIZE_MAP = { 1: 11, 2: 15, 3: 20, 4: 25, 5: 30 };
const SHAPES = ['Triangle', 'Square', 'Pentagon', 'Hexagon', 'Circle'];
const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = {
  sizeLevel: 3,
  gridSize: 20,
  threshold: 50,
  invert: false,
  matrix: [],
  cellStyles: [],
  start: { x: 1, y: 0 },
  exit: { x: 18, y: 19 },
  solution: [],
  sourceImage: null,
  tool: 'camera',
  view: 'diorama',
  zoom: 1,
  wallHeight: 1.5,
  gap: 0.98,
  layout: 1,
  stretchX: 100,
  stretchY: 100,
  warp: 0,
  edge: 0,
  difficulty: 3,
  blankStarted: false,
  selectedTarget: 'walls',
  style: {
    walls: { color: '#24513a', texture: null },
    floor: { color: '#7b5a32', texture: null },
    border: { color: '#24513a', texture: null },
    roof: { color: '#1b2b1e', texture: null }
  },
  textureImages: {},
  customTextures: [],
  player: { x: 1.5, y: 0.5 },
  keys: {},
  overview: { visible: true, x: 520, y: 180 },
  undo: [],
  redo: []
};

const labels = {
  edge: ['Sharp', 'Rough', 'Smooth'],
  difficulty: ['', '1 · Easy', '2 · Gentle', '3 · Balanced', '4 · Hard', '5 · Brutal']
};

window.__artifexMazeRuntime = { state, renderAll, exportPayload: exportObj };
window.addEventListener('DOMContentLoaded', boot);

function boot() {
  preloadTextures();
  bindUi();
  buildPalettes();
  buildReference();
  syncControls();
  renderAll();
  requestAnimationFrame(() => { clampOverview(); placeOverview(); drawPreview(); });
}

function bindUi() {
  $$('.panel-nav-button').forEach((button) => button.addEventListener('click', () => showPanel(button.dataset.panel)));
  $('btn-random')?.addEventListener('click', () => { snapshot(); state.blankStarted = false; buildRandom(); renderAll(); });
  $('btn-start-blank')?.addEventListener('click', () => { snapshot(); startBlank(); renderAll(); });
  $('btn-load-reference')?.addEventListener('click', () => { snapshot(); state.blankStarted = false; buildReference(); renderAll(); });
  $('btn-reparse')?.addEventListener('click', () => { snapshot(); state.sourceImage ? parseImage(state.sourceImage) : buildReference(); renderAll(); });
  $('btn-solve')?.addEventListener('click', () => { solve(); renderAll(); });
  $('btn-apply-difficulty')?.addEventListener('click', () => { analyseDifficulty(); });
  $('btn-export-json')?.addEventListener('click', downloadJson);
  $('btn-copy-json')?.addEventListener('click', copyJson);
  $('btn-clear-paint')?.addEventListener('click', () => { snapshot(); state.cellStyles = blankStyles(); renderAll(); });
  $('btn-import-json-proxy')?.addEventListener('click', () => $('json-import')?.click());
  $('image-upload')?.addEventListener('change', (event) => loadImage(event.target.files?.[0]));
  $('json-import')?.addEventListener('change', (event) => importJson(event.target.files?.[0]));

  $('view-mode-diorama')?.addEventListener('click', () => setView('diorama'));
  $('view-mode-fps')?.addEventListener('click', () => setView('fps'));
  $('btn-zoom-in')?.addEventListener('click', () => { state.zoom = Math.min(2.4, state.zoom + 0.15); drawPreview(); });
  $('btn-zoom-out')?.addEventListener('click', () => { state.zoom = Math.max(0.55, state.zoom - 0.15); drawPreview(); });
  $('btn-zoom-reset')?.addEventListener('click', () => { state.zoom = 1; drawPreview(); });

  $('menu-new-maze')?.addEventListener('click', () => $('btn-random')?.click());
  $('menu-save-maze')?.addEventListener('click', downloadJson);
  $('menu-import-json')?.addEventListener('click', () => $('json-import')?.click());
  $('menu-import-image')?.addEventListener('click', () => $('image-upload')?.click());
  $('menu-copy-json')?.addEventListener('click', copyJson);
  $('menu-paste-json')?.addEventListener('click', pasteJson);
  $('menu-undo')?.addEventListener('click', undo);
  $('menu-redo')?.addEventListener('click', redo);
  $('menu-toggle-overview')?.addEventListener('click', toggleOverview);
  $('menu-fit-preview')?.addEventListener('click', () => { state.zoom = 1; drawPreview(); });
  $('menu-zoom-in')?.addEventListener('click', () => $('btn-zoom-in')?.click());
  $('menu-zoom-out')?.addEventListener('click', () => $('btn-zoom-out')?.click());
  $('overview-close')?.addEventListener('click', toggleOverview);

  $$('.template-action').forEach((button) => button.addEventListener('click', () => applyTemplate(button.dataset.template)));
  $$('.tool-button').forEach((button) => button.addEventListener('click', () => setTool(button.dataset.tool)));
  $$('.target-button').forEach((button) => button.addEventListener('click', () => selectTarget(button.dataset.target)));
  $('target-color-picker')?.addEventListener('input', (event) => { applyColor(event.target.value); });
  $('btn-apply-target-color')?.addEventListener('click', () => applyColor($('target-color-picker')?.value || state.style[state.selectedTarget].color));

  bindSlider('grid-slider', (v) => { state.sizeLevel = v; state.gridSize = SIZE_MAP[v]; syncLabels(); }, () => { snapshot(); resizeForCurrentSize(); renderAll(); });
  bindSlider('threshold-slider', (v) => { state.threshold = v; syncLabels(); }, () => { if (state.sourceImage) { snapshot(); parseImage(state.sourceImage); renderAll(); } });
  $('invert-checkbox')?.addEventListener('change', (event) => { snapshot(); state.invert = event.target.checked; state.sourceImage ? parseImage(state.sourceImage) : invertMatrix(); renderAll(); });
  bindSlider('wall-height-slider', (v) => { state.wallHeight = v; syncLabels(); drawPreview(); }, null, parseFloat);
  bindSlider('gap-slider', (v) => { state.gap = v; syncLabels(); drawPreview(); }, null, parseFloat);
  bindSlider('layout-style-slider', (v) => { snapshot(); state.layout = v; regenerateEndpointsOnly(); syncLabels(); drawMatrix(); drawPreview(); updateChecks(); });
  bindSlider('stretch-x-slider', (v) => { state.stretchX = v; syncLabels(); drawPreview(); updateChecks(); });
  bindSlider('stretch-y-slider', (v) => { state.stretchY = v; syncLabels(); drawPreview(); updateChecks(); });
  bindSlider('warp-slider', (v) => { if (isAdvancedLocked()) { $('warp-slider').value = 0; state.warp = 0; return; } state.warp = v; syncLabels(); drawPreview(); });
  bindSlider('edge-style-slider', (v) => { state.edge = v; syncLabels(); drawPreview(); });
  bindSlider('difficulty-slider', (v) => { state.difficulty = v; syncLabels(); });

  const overviewCanvas = $('analysis-canvas');
  overviewCanvas?.addEventListener('mousedown', (event) => editFromEvent(event, true));
  overviewCanvas?.addEventListener('mousemove', (event) => { if (event.buttons) editFromEvent(event, false); });
  overviewCanvas?.addEventListener('touchstart', (event) => editFromEvent(event, true), { passive: false });
  overviewCanvas?.addEventListener('touchmove', (event) => editFromEvent(event, false), { passive: false });

  window.addEventListener('keydown', (event) => setKey(event.key, true));
  window.addEventListener('keyup', (event) => setKey(event.key, false));
  $('virtual-dpad')?.querySelectorAll('button[data-dpad]').forEach((button) => {
    const key = button.dataset.dpad;
    const down = (event) => { event.preventDefault(); setKey(key, true); };
    const up = (event) => { event.preventDefault(); setKey(key, false); };
    button.addEventListener('mousedown', down);
    button.addEventListener('mouseup', up);
    button.addEventListener('mouseleave', up);
    button.addEventListener('touchstart', down, { passive: false });
    button.addEventListener('touchend', up, { passive: false });
  });

  window.addEventListener('resize', () => { clampOverview(); placeOverview(); drawPreview(); });
  setInterval(movePlayer, 33);
  makeOverviewDraggable();
}

function bindSlider(id, inputHandler, changeHandler, parser = parseInt) {
  const slider = $(id);
  if (!slider) return;
  slider.addEventListener('input', (event) => inputHandler(parser(event.target.value, 10)));
  if (changeHandler) slider.addEventListener('change', changeHandler);
}

function showPanel(name) {
  $$('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === name));
  $$('[data-panel-content]').forEach((panel) => {
    const active = panel.dataset.panelContent === name;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  updateChecks();
}

function setTool(tool) {
  state.tool = tool;
  $$('.tool-button').forEach((button) => button.classList.toggle('is-active', button.dataset.tool === tool));
}

function setView(view) {
  state.view = view;
  $('view-mode-diorama')?.classList.toggle('is-active', view === 'diorama');
  $('view-mode-fps')?.classList.toggle('is-active', view === 'fps');
  $('virtual-dpad')?.classList.toggle('is-hidden', view !== 'fps');
  setText('player-status-indicator', view === 'fps' ? 'Walk Test · WASD/arrows' : 'Diorama camera');
  if (view === 'fps') $('threejs-container')?.focus?.();
  drawPreview();
}

function setKey(key, value) {
  state.keys[key] = value;
  const map = { ArrowUp: 'w', ArrowLeft: 'a', ArrowDown: 's', ArrowRight: 'd' };
  $('virtual-dpad')?.querySelectorAll('button[data-dpad]').forEach((button) => {
    const alias = Object.keys(map).find((k) => map[k] === button.dataset.dpad);
    button.classList.toggle('is-pressed', !!(state.keys[button.dataset.dpad] || state.keys[alias]));
  });
}

function syncLabels() {
  setText('grid-val', `${state.sizeLevel} · ${state.gridSize}`);
  setText('threshold-val', `${state.threshold}%`);
  setText('wall-height-val', state.wallHeight.toFixed(1));
  setText('gap-val', state.gap.toFixed(2));
  setText('layout-style-val', SHAPES[state.layout]);
  setText('stretch-x-val', `${state.stretchX}%`);
  setText('stretch-y-val', `${state.stretchY}%`);
  setText('warp-val', `${state.warp}%`);
  setText('edge-style-val', labels.edge[state.edge]);
  setText('difficulty-val', labels.difficulty[state.difficulty]);
}

function syncControls() {
  setValue('grid-slider', state.sizeLevel);
  setValue('threshold-slider', state.threshold);
  if ($('invert-checkbox')) $('invert-checkbox').checked = state.invert;
  setValue('wall-height-slider', state.wallHeight);
  setValue('gap-slider', state.gap);
  setValue('layout-style-slider', state.layout);
  setValue('stretch-x-slider', state.stretchX);
  setValue('stretch-y-slider', state.stretchY);
  setValue('warp-slider', state.warp);
  setValue('edge-style-slider', state.edge);
  setValue('difficulty-slider', state.difficulty);
  selectTarget(state.selectedTarget);
  syncLabels();
}

function setText(id, text) { if ($(id)) $(id).textContent = text; }
function setValue(id, value) { if ($(id)) $(id).value = value; }
function ready(_text) { const el = $('analysis-state'); if (el) el.textContent = ''; }

function buildPalettes() {
  const paletteBox = $('color-palette');
  if (paletteBox) {
    paletteBox.innerHTML = '';
    palette.forEach((color) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'color-button';
      button.style.background = color;
      button.title = color;
      button.addEventListener('click', () => applyColor(color));
      paletteBox.appendChild(button);
    });
  }
  const textureBox = $('texture-library');
  if (textureBox) {
    textureBox.innerHTML = '';
    textureLibrary.forEach((texture) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'texture-button';
      button.style.backgroundImage = texture.rootSrc ? `url(${texture.src}), url(${texture.rootSrc})` : `url(${texture.src})`;
      button.innerHTML = `<span>${texture.name}</span>`;
      button.addEventListener('click', () => applyTexture(texture.id));
      textureBox.appendChild(button);
    });
  }
  const customGrid = $('custom-image-grid');
  if (customGrid) {
    customGrid.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const label = document.createElement('label');
      label.className = 'custom-slot';
      label.textContent = `Slot ${i + 1}`;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', (event) => loadCustomTexture(event.target.files?.[0], i, label));
      label.appendChild(input);
      customGrid.appendChild(label);
    }
  }
}

function selectTarget(target) {
  state.selectedTarget = target;
  $$('.target-button').forEach((button) => button.classList.toggle('is-active', button.dataset.target === target));
  setText('selected-target-label', target.charAt(0).toUpperCase() + target.slice(1));
  if ($('target-color-picker')) $('target-color-picker').value = state.style[target].color;
  updateTargetUi();
}

function updateTargetUi() {
  const currentTexture = state.style[state.selectedTarget].texture;
  $$('.texture-button').forEach((button, index) => button.classList.toggle('is-active', textureLibrary[index]?.id === currentTexture));
}

function applyColor(color) {
  state.style[state.selectedTarget].color = color;
  state.style[state.selectedTarget].texture = null;
  if ($('target-color-picker')) $('target-color-picker').value = color;
  updateTargetUi();
  drawMatrix();
  drawPreview();
}

function applyTexture(textureId) {
  state.style[state.selectedTarget].texture = textureId;
  updateTargetUi();
  drawMatrix();
  drawPreview();
}

function loadCustomTexture(file, index, slot) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const id = `custom_${index}`;
    const image = new Image();
    image.onload = () => {
      state.textureImages[id] = image;
      state.customTextures[index] = { id, src: reader.result };
      slot.style.backgroundImage = `url(${reader.result})`;
      slot.textContent = '';
      applyTexture(id);
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function preloadTextures() {
  textureLibrary.forEach((texture) => {
    const image = new Image();
    image.onload = () => drawPreview();
    image.onerror = () => { if (texture.rootSrc && image.src !== new URL(texture.rootSrc, window.location.href).href) image.src = texture.rootSrc; };
    image.src = texture.src;
    state.textureImages[texture.id] = image;
  });
}

function snapshot() {
  state.undo.push(JSON.stringify({ matrix: state.matrix, cellStyles: state.cellStyles, start: state.start, exit: state.exit, solution: state.solution, style: state.style, gridSize: state.gridSize, sizeLevel: state.sizeLevel, layout: state.layout, stretchX: state.stretchX, stretchY: state.stretchY, blankStarted: state.blankStarted }));
  if (state.undo.length > 40) state.undo.shift();
  state.redo = [];
}

function restore(serialized) {
  const data = JSON.parse(serialized);
  Object.assign(state, data);
  syncControls();
  renderAll();
}

function undo() { if (!state.undo.length) return; state.redo.push(JSON.stringify({ matrix: state.matrix, cellStyles: state.cellStyles, start: state.start, exit: state.exit, solution: state.solution, style: state.style, gridSize: state.gridSize, sizeLevel: state.sizeLevel, layout: state.layout, stretchX: state.stretchX, stretchY: state.stretchY, blankStarted: state.blankStarted })); restore(state.undo.pop()); }
function redo() { if (!state.redo.length) return; state.undo.push(JSON.stringify({ matrix: state.matrix, cellStyles: state.cellStyles, start: state.start, exit: state.exit, solution: state.solution, style: state.style, gridSize: state.gridSize, sizeLevel: state.sizeLevel, layout: state.layout, stretchX: state.stretchX, stretchY: state.stretchY, blankStarted: state.blankStarted })); restore(state.redo.pop()); }

function blankStyles() { return Array.from({ length: state.gridSize }, () => Array(state.gridSize).fill(null)); }
function shapeMask() { return Array.from({ length: state.gridSize }, (_, y) => Array.from({ length: state.gridSize }, (_, x) => isVisibleShapeCell(x, y, state.gridSize))); }

function resizeForCurrentSize() {
  state.gridSize = SIZE_MAP[state.sizeLevel];
  state.blankStarted ? startBlank() : buildRandom();
}

function buildReference() { state.matrix = makeMaze(state.gridSize, 42); applyShapeMaskToMatrix(); state.cellStyles = blankStyles(); state.sourceImage = null; locateEnds(); }
function buildRandom() { state.matrix = makeMaze(state.gridSize, Date.now() % 99999); applyShapeMaskToMatrix(); state.cellStyles = blankStyles(); state.sourceImage = null; locateEnds(); }
function startBlank() { state.blankStarted = true; const mask = shapeMask(); state.matrix = mask.map((row) => row.map((inside) => inside ? 0 : 1)); state.cellStyles = blankStyles(); locateEnds(); }
function regenerateEndpointsOnly() { if (!state.matrix.length) return; applyShapeMaskToMatrix(); locateEnds(); }

function makeMaze(size, seed) {
  const grid = Array.from({ length: size }, () => Array(size).fill(1));
  let s = seed;
  const rnd = () => { const x = Math.sin(s++) * 10000; return x - Math.floor(x); };
  function carve(x, y) {
    grid[y][x] = 0;
    [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => rnd() - 0.5).forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && ny > 0 && nx < size - 1 && ny < size - 1 && grid[ny][nx]) {
        grid[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    });
  }
  carve(1, 1);
  return grid;
}

function applyShapeMaskToMatrix() {
  const mask = shapeMask();
  state.matrix = state.matrix.map((row, y) => row.map((cell, x) => mask[y][x] ? cell : 1));
}

function locateEnds() {
  const edges = validEdgePathCells();
  const n = state.gridSize;
  const topLeft = edges[0] || nearestOpenCell({ x: 1, y: 1 });
  const bottomRight = edges[edges.length - 1] || nearestOpenCell({ x: n - 2, y: n - 2 });
  state.start = topLeft;
  state.exit = bottomRight;
  state.matrix[state.start.y][state.start.x] = 0;
  state.matrix[state.exit.y][state.exit.x] = 0;
  state.player = { x: state.start.x + 0.5, y: state.start.y + 0.5 };
  state.solution = [];
}

function validEdgePathCells() {
  const n = state.gridSize;
  const cells = [];
  for (let x = 0; x < n; x++) { if (isVisibleShapeCell(x, 0, n) && !state.matrix[0][x]) cells.push({ x, y: 0 }); if (isVisibleShapeCell(x, n - 1, n) && !state.matrix[n - 1][x]) cells.push({ x, y: n - 1 }); }
  for (let y = 1; y < n - 1; y++) { if (isVisibleShapeCell(0, y, n) && !state.matrix[y][0]) cells.push({ x: 0, y }); if (isVisibleShapeCell(n - 1, y, n) && !state.matrix[y][n - 1]) cells.push({ x: n - 1, y }); }
  if (!cells.length) {
    const top = nearestOpenCell({ x: Math.floor(n / 2), y: 0 });
    const bottom = nearestOpenCell({ x: Math.floor(n / 2), y: n - 1 });
    cells.push(top, bottom);
  }
  return cells.filter(Boolean);
}

function nearestOpenCell(target) {
  const n = state.gridSize;
  let best = null;
  let bestScore = Infinity;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!isVisibleShapeCell(x, y, n)) continue;
    if (state.matrix[y]?.[x]) continue;
    const edgePenalty = (x === 0 || y === 0 || x === n - 1 || y === n - 1) ? 0 : 100;
    const score = Math.abs(x - target.x) + Math.abs(y - target.y) + edgePenalty;
    if (score < bestScore) { best = { x, y }; bestScore = score; }
  }
  if (!best) best = { x: Math.max(0, Math.min(n - 1, target.x)), y: Math.max(0, Math.min(n - 1, target.y)) };
  return best;
}

function invertMatrix() { state.matrix = state.matrix.map((row, y) => row.map((cell, x) => isVisibleShapeCell(x, y, state.gridSize) ? (cell ? 0 : 1) : 1)); locateEnds(); }

function loadImage(file) {
  if (!file) return;
  snapshot();
  setText('image-file-status', file.name);
  const group = $('image-contrast-group');
  if (group) group.hidden = false;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => { state.sourceImage = image; state.blankStarted = false; parseImage(image); renderAll(); };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function parseImage(image) {
  const n = state.gridSize;
  const canvas = document.createElement('canvas');
  canvas.width = n;
  canvas.height = n;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, n, n);
  const data = ctx.getImageData(0, 0, n, n).data;
  const values = [];
  for (let i = 0; i < data.length; i += 4) values.push((data[i] + data[i + 1] + data[i + 2]) / 3);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const cut = min + (max - min) * state.threshold / 100;
  state.matrix = Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => {
    const wall = values[y * n + x] < cut;
    return isVisibleShapeCell(x, y, n) && ((state.invert ? !wall : wall) ? 1 : 0);
  }));
  applyShapeMaskToMatrix();
  state.cellStyles = blankStyles();
  locateEnds();
}

function renderAll() {
  syncLabels();
  drawMatrix();
  drawPreview();
  ready('');
  updateChecks();
}

function styleForTarget(target, cellStyle) { return cellStyle || state.style[target]; }
function fillWithStyle(ctx, x, y, w, h, style) {
  const image = style?.texture ? state.textureImages[style.texture] : null;
  if (image?.complete && image.naturalWidth) {
    try { ctx.fillStyle = ctx.createPattern(image, 'repeat'); } catch { ctx.fillStyle = style.color; }
  } else ctx.fillStyle = style?.color || '#24513a';
  ctx.fillRect(x, y, w, h);
}

function drawMatrix() {
  const canvas = $('analysis-canvas');
  if (!canvas || !state.matrix.length) return;
  const ctx = canvas.getContext('2d');
  const n = state.matrix.length;
  canvas.width = 420;
  canvas.height = 420;
  const cell = canvas.width / n;
  ctx.fillStyle = '#031009';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (!isVisibleShapeCell(x, y, n)) continue;
    if (state.matrix[y][x]) fillWithStyle(ctx, x * cell, y * cell, Math.ceil(cell), Math.ceil(cell), styleForTarget('walls', state.cellStyles[y]?.[x]));
    else fillWithStyle(ctx, x * cell, y * cell, Math.ceil(cell), Math.ceil(cell), state.style.floor);
  }
  drawSolution(ctx, cell, false);
  drawNode(ctx, state.start, cell, '#d65f55');
  drawNode(ctx, state.exit, cell, '#8ee6dc');
  setText('matrix-summary', `${SHAPES[state.layout]} · ${n} · ${state.matrix.flat().filter(Boolean).length} walls`);
}

function drawPreview() {
  const wrap = $('threejs-container');
  if (!wrap || !state.matrix.length) return;
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
  const w = rect.width;
  const h = rect.height;
  const n = state.matrix.length;
  const stretchMax = Math.max(state.stretchX, state.stretchY) / 100;
  const cell = Math.min(w / (n * stretchMax + 10), h / (n * stretchMax + 8)) * state.zoom;
  const ox = w / 2 - (n * cell * state.stretchX / 100) / 2;
  const oy = h / 2 - (n * cell * state.stretchY / 100) / 2 + 18;
  fillWithStyle(ctx, 0, 0, w, h, state.style.roof);
  ctx.save();
  ctx.translate(ox, oy);
  drawShapeBackdrop(ctx, n, cell);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!state.matrix[y][x] && isVisibleShapeCell(x, y, n)) { const p = layoutPoint(x, y, cell); fillWithStyle(ctx, p.x, p.y, cell * 0.96, cell * 0.96, state.style.floor); }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (state.matrix[y][x] && isVisibleShapeCell(x, y, n)) { const p = layoutPoint(x, y, cell); drawBlock(ctx, p.x, p.y, cell, styleForTarget('walls', state.cellStyles[y]?.[x]), y, x); }
  drawSolution(ctx, cell, true);
  drawMarker(ctx, state.start, cell, '#d65f55');
  drawMarker(ctx, state.exit, cell, '#8ee6dc');
  if (state.view === 'fps') drawPlayer(ctx, cell);
  ctx.restore();
  window.dispatchEvent(new CustomEvent('artifex-preview-redrawn'));
}

function drawSolution(ctx, cell, shaped) {
  if (!state.solution.length) return;
  ctx.strokeStyle = '#8ee6dc'; ctx.lineWidth = Math.max(2, cell * 0.32); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  state.solution.forEach((p, i) => { const pos = shaped ? layoutPoint(p.x, p.y, cell) : { x: p.x * cell, y: p.y * cell }; const px = pos.x + cell / 2; const py = pos.y + cell / 2; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
  ctx.stroke();
}

function drawNode(ctx, p, cell, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x * cell + cell / 2, p.y * cell + cell / 2, cell * 0.38, 0, Math.PI * 2); ctx.fill(); }
function drawMarker(ctx, p, cell, color) { const pos = layoutPoint(p.x, p.y, cell); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(pos.x + cell / 2, pos.y + cell / 2, cell * 0.38, 0, Math.PI * 2); ctx.fill(); }

function isVisibleShapeCell(x, y, n) {
  const cx = (n - 1) / 2;
  const cy = (n - 1) / 2;
  const nx = (x - cx) / (n / 2);
  const ny = (y - cy) / (n / 2);
  if (state.layout === 0) return y >= Math.abs(x - cx) * 1.05 && y <= n - 1;
  if (state.layout === 1) return true;
  if (state.layout === 4) return Math.hypot(nx, ny) <= 1.02;
  const sides = state.layout === 2 ? 5 : 6;
  return pointInRegularPolygon(nx, ny, sides, -Math.PI / 2);
}

function pointInRegularPolygon(x, y, sides, rotation) {
  const pts = [];
  for (let i = 0; i < sides; i++) pts.push([Math.cos(rotation + i * Math.PI * 2 / sides), Math.sin(rotation + i * Math.PI * 2 / sides)]);
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 0.0001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function drawShapeBackdrop(ctx, n, cell) {
  ctx.save(); ctx.scale(state.stretchX / 100, state.stretchY / 100); ctx.strokeStyle = state.style.border.color; ctx.lineWidth = Math.max(3, cell * 0.35); ctx.beginPath();
  if (state.layout === 0) { ctx.moveTo(n * cell / 2, 0); ctx.lineTo(n * cell, n * cell); ctx.lineTo(0, n * cell); ctx.closePath(); }
  else if (state.layout === 4) ctx.arc(n * cell / 2, n * cell / 2, n * cell / 2, 0, Math.PI * 2);
  else if (state.layout === 2 || state.layout === 3) drawPolygonPath(ctx, n * cell / 2, n * cell / 2, n * cell / 2, state.layout === 2 ? 5 : 6, -Math.PI / 2);
  else ctx.rect(0, 0, n * cell, n * cell);
  ctx.stroke(); ctx.restore();
}

function drawPolygonPath(ctx, cx, cy, r, sides, rotation) { for (let i = 0; i < sides; i++) { const x = cx + Math.cos(rotation + i * Math.PI * 2 / sides) * r; const y = cy + Math.sin(rotation + i * Math.PI * 2 / sides) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); }

function layoutPoint(x, y, cell) {
  let px = x * cell * state.stretchX / 100;
  let py = y * cell * state.stretchY / 100;
  const warp = state.warp / 100;
  if (warp) { px += Math.sin(y * 1.37 + x * 0.31) * cell * 0.45 * warp; py += Math.cos(x * 1.21 + y * 0.27) * cell * 0.45 * warp; }
  return { x: px, y: py };
}

function drawBlock(ctx, x, y, cell, style, row, col) {
  const jitter = state.edge === 1 ? Math.sin((row + 1) * (col + 3)) * cell * 0.04 : 0;
  const radius = state.edge === 2 ? cell * 0.25 : 3;
  const width = cell * state.gap;
  const height = cell * state.gap;
  ctx.save();
  roundedRect(ctx, x + jitter, y - jitter, width, height, radius);
  ctx.clip();
  fillWithStyle(ctx, x + jitter, y - jitter, width, height, style);
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.fillRect(x, y + height - cell * (0.35 + state.wallHeight * 0.08), width, cell * (0.35 + state.wallHeight * 0.08));
  ctx.restore();
  ctx.strokeStyle = 'rgba(233,255,224,.16)';
  ctx.strokeRect(x, y, width, height);
}

function roundedRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); }
function drawPlayer(ctx, cell) { const p = layoutPoint(state.player.x, state.player.y, cell); ctx.fillStyle = '#f3dcaa'; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(3, cell * 0.3), 0, Math.PI * 2); ctx.fill(); }

function editFromEvent(event, first) {
  if (state.tool === 'camera') return;
  event.preventDefault();
  const touch = event.touches?.[0];
  const rect = $('analysis-canvas').getBoundingClientRect();
  const col = Math.floor(((touch ? touch.clientX : event.clientX) - rect.left) / rect.width * state.gridSize);
  const row = Math.floor(((touch ? touch.clientY : event.clientY) - rect.top) / rect.height * state.gridSize);
  if (row < 0 || col < 0 || row >= state.gridSize || col >= state.gridSize || !isVisibleShapeCell(col, row, state.gridSize)) return;
  if (first) snapshot();
  if (state.tool === 'paint' && state.matrix[row][col]) state.cellStyles[row][col] = { ...state.style[state.selectedTarget] };
  if (state.tool === 'paintSection') paintSection(row, col);
  if (state.tool === 'toggle' && first) { state.matrix[row][col] = state.matrix[row][col] ? 0 : 1; locateEnds(); }
  state.solution = [];
  drawMatrix(); drawPreview(); updateChecks();
}

function paintSection(row, col) {
  if (!state.matrix[row][col]) return;
  [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
    let x = col + dx; let y = row + dy;
    while (y >= 0 && x >= 0 && y < state.gridSize && x < state.gridSize && state.matrix[y][x]) {
      state.cellStyles[y][x] = { ...state.style[state.selectedTarget] };
      if (!dx && !dy) break;
      x += dx; y += dy;
    }
  });
}

function movePlayer() {
  if (state.view !== 'fps') return;
  let dx = 0; let dy = 0;
  if (state.keys.w || state.keys.ArrowUp) dy -= 0.08;
  if (state.keys.s || state.keys.ArrowDown) dy += 0.08;
  if (state.keys.a || state.keys.ArrowLeft) dx -= 0.08;
  if (state.keys.d || state.keys.ArrowRight) dx += 0.08;
  if (!dx && !dy) return;
  const nx = state.player.x + dx; const ny = state.player.y + dy;
  const c = Math.floor(nx); const r = Math.floor(ny);
  if (r >= 0 && c >= 0 && r < state.gridSize && c < state.gridSize && !state.matrix[r][c] && isVisibleShapeCell(c, r, state.gridSize)) { state.player.x = nx; state.player.y = ny; drawPreview(); }
}

function solve() {
  const queue = [[state.start]];
  const seen = new Set([`${state.start.x},${state.start.y}`]);
  const n = state.gridSize;
  while (queue.length) {
    const path = queue.shift();
    const p = path[path.length - 1];
    if (p.x === state.exit.x && p.y === state.exit.y) { state.solution = path; return path; }
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const next = { x: p.x + dx, y: p.y + dy };
      const key = `${next.x},${next.y}`;
      if (next.x >= 0 && next.y >= 0 && next.x < n && next.y < n && !seen.has(key) && !state.matrix[next.y][next.x] && isVisibleShapeCell(next.x, next.y, n)) { seen.add(key); queue.push([...path, next]); }
    });
  }
  state.solution = [];
  return [];
}

function hasValidRoute() { return !!solve().length; }
function isAdvancedLocked() { return state.blankStarted && !hasValidRoute(); }

function analyseDifficulty() {
  const valid = solve().length;
  const target = 6 - state.difficulty;
  const message = valid ? `Difficulty analysis placeholder:\n\nTarget difficulty ${state.difficulty} expects ${target} meaningful route(s).\n\nCurrent quick check: at least 1 entrance-to-exit route exists.\n\nThe full meaningful-route report/fix tool is the next pass.` : 'No valid entrance-to-exit route exists yet. Draw or open a path before difficulty can be analysed.';
  alert(message);
  renderAll();
}

function applyTemplate(template) {
  snapshot();
  state.blankStarted = false;
  buildRandom();
  if (template === 'training') { state.difficulty = 1; }
  if (template === 'stone') { selectTarget('walls'); applyTexture('cobblestone'); selectTarget('floor'); applyTexture('marble'); }
  if (template === 'underworld') { selectTarget('floor'); applyColor('#050706'); selectTarget('walls'); applyColor('#0b1110'); }
  syncControls();
  renderAll();
}

function exportObj() {
  const base = {
    schema: SCHEMA,
    kind: 'puzzle_module',
    moduleId: $('module-id')?.value || 'ch00_optional_puzzle_module',
    displayName: window.__artifexActivePuzzleEngine?.label || 'Maze / Labyrinth',
    gameplayMode: $('gameplay-mode')?.value || 'scene_mode',
    puzzle: {
      type: $('puzzle-type')?.value || 'pass_environmental_obstacle',
      callingText: $('calling-text')?.value || '',
      difficulty: state.difficulty,
      completionCondition: { flag: $('completion-flag')?.value || 'puzzle_complete', value: true, trigger: 'puzzle_success' },
      start: { ...state.start, grid: 'matrix' },
      exit: { ...state.exit, grid: 'matrix' }
    },
    grid: { cols: state.gridSize, rows: state.gridSize, cellSize: 1, origin: 'top_left', wallValue: 1, pathValue: 0, matrix: state.matrix },
    renderHints: { sizeLevel: state.sizeLevel, shape: SHAPES[state.layout], stretchX: state.stretchX, stretchY: state.stretchY, wallHeight: state.wallHeight, gap: state.gap, warp: state.warp, edgeStyle: labels.edge[state.edge], styleTargets: state.style, cellStyles: state.cellStyles },
    solution: { generated: !!state.solution.length, path: state.solution }
  };
  return window.__artifexAugmentPuzzlePayload ? window.__artifexAugmentPuzzlePayload(base) : base;
}

function downloadJson() {
  const id = $('module-id')?.value || 'puzzle-module';
  const blob = new Blob([JSON.stringify(exportObj(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${id}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function copyJson() {
  try { await navigator.clipboard.writeText(JSON.stringify(exportObj(), null, 2)); } catch { alert('Clipboard blocked. Use Download JSON instead.'); }
}

async function pasteJson() {
  try { importObject(JSON.parse(await navigator.clipboard.readText())); renderAll(); } catch { alert('Paste failed.'); }
}

function importJson(file) {
  if (!file) return;
  setText('json-file-status', file.name);
  const reader = new FileReader();
  reader.onload = () => { try { importObject(JSON.parse(reader.result)); renderAll(); } catch { alert('Import failed.'); } };
  reader.readAsText(file);
}

function importObject(data) {
  snapshot();
  if (!data.grid?.matrix) throw new Error('Missing grid.matrix');
  state.matrix = data.grid.matrix;
  state.gridSize = data.grid.rows || data.grid.matrix.length;
  state.sizeLevel = Number(Object.keys(SIZE_MAP).find((key) => SIZE_MAP[key] === state.gridSize)) || 3;
  state.cellStyles = data.renderHints?.cellStyles || blankStyles();
  state.start = data.puzzle?.start || { x: 1, y: 0 };
  state.exit = data.puzzle?.exit || { x: state.gridSize - 2, y: state.gridSize - 1 };
  state.solution = data.solution?.path || [];
  state.difficulty = data.puzzle?.difficulty || 3;
  state.wallHeight = data.renderHints?.wallHeight || state.wallHeight;
  state.gap = data.renderHints?.gap || state.gap;
  state.warp = data.renderHints?.warp || 0;
  state.layout = Math.max(0, SHAPES.indexOf(data.renderHints?.shape));
  if (state.layout < 0) state.layout = 1;
  state.stretchX = data.renderHints?.stretchX || 100;
  state.stretchY = data.renderHints?.stretchY || 100;
  state.style = data.renderHints?.styleTargets || state.style;
  if ($('module-id')) $('module-id').value = data.moduleId || '';
  syncControls();
}

function makeOverviewDraggable() {
  const win = $('overview-window'); const bar = $('overview-titlebar');
  if (!win || !bar) return;
  let dragging = false; let sx = 0; let sy = 0; let ox = 0; let oy = 0;
  bar.addEventListener('mousedown', (event) => {
    if (event.target.id === 'overview-close') return;
    dragging = true; sx = event.clientX; sy = event.clientY; ox = state.overview.x; oy = state.overview.y; document.body.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', (event) => { if (!dragging) return; state.overview.x = ox + event.clientX - sx; state.overview.y = oy + event.clientY - sy; clampOverview(); placeOverview(); });
  window.addEventListener('mouseup', () => { dragging = false; document.body.style.userSelect = ''; });
}

function clampOverview() {
  const win = $('overview-window');
  if (!win) return;
  state.overview.x = Math.max(8, Math.min(window.innerWidth - (win.offsetWidth || 360) - 8, state.overview.x));
  state.overview.y = Math.max(8, Math.min(window.innerHeight - (win.offsetHeight || 420) - 8, state.overview.y));
}

function placeOverview() {
  const win = $('overview-window');
  if (!win) return;
  win.style.left = `${state.overview.x}px`;
  win.style.top = `${state.overview.y}px`;
  win.classList.toggle('is-hidden', !state.overview.visible);
}

function toggleOverview() { state.overview.visible = !state.overview.visible; placeOverview(); }

function updateChecks() {
  const locked = isAdvancedLocked();
  $('warp-slider') && ($('warp-slider').disabled = locked);
  $('warp-row')?.classList.toggle('is-advanced-locked', locked);
  setCheck('build', state.matrix.length ? 'green' : 'red');
  setCheck('display', 'green');
  setCheck('logic', $('module-id')?.value && $('completion-flag')?.value && $('calling-text')?.value ? 'green' : 'yellow');
  setCheck('visuals', state.cellStyles.flat().some(Boolean) ? 'green' : 'yellow');
  placeOverview();
}
function setCheck(name, statusName) { $$(`[data-check="${name}"]`).forEach((button) => { button.classList.remove('status-green', 'status-yellow', 'status-red'); button.classList.add(`status-${statusName}`); }); }
