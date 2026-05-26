const SCHEMA = 'cinaedvs.artifex.maze.v1';

const textureLibrary = [
  { id: 'bricks', name: 'Bricks', src: 'bricks.jpg' },
  { id: 'cave', name: 'Cave', src: 'cave.jpg' },
  { id: 'cobblestone', name: 'Cobble', src: 'cobblestone.jpg' },
  { id: 'wood', name: 'Wood', src: 'wood.jpg' },
  { id: 'blocks', name: 'Blocks', src: 'blocks.jpg' },
  { id: 'castle', name: 'Castle', src: 'castle.jpg' },
  { id: 'dirt', name: 'Dirt', src: 'dirt.jpeg' },
  { id: 'hedges', name: 'Hedges', src: 'hedges.jpg' },
  { id: 'thorns', name: 'Thorns', src: 'thorns.jpeg' },
  { id: 'marble', name: 'Marble', src: 'marble.jpg' }
];

const palette = ['#24513a', '#7b5a32', '#8b3f2f', '#b37a37', '#7fd2cf', '#684b8f', '#2b3341', '#e1c073'];
const state = {
  gridSize: 31,
  threshold: 50,
  invert: false,
  matrix: [],
  start: { x: 1, y: 1 },
  exit: { x: 29, y: 29 },
  solution: [],
  sourceImage: null,
  tool: 'camera',
  view: 'diorama',
  zoom: 1,
  wallHeight: 1.5,
  gap: 0.98,
  layout: 1,
  warp: 0,
  edge: 0,
  difficulty: 3,
  selectedTarget: 'walls',
  style: {
    walls: { color: '#24513a', texture: null },
    floor: { color: '#7b5a32', texture: null },
    border: { color: '#24513a', texture: null },
    roof: { color: '#1b2b1e', texture: null }
  },
  cellStyles: [],
  customTextures: [],
  textureImages: {},
  player: { x: 1.5, y: 1.5 },
  keys: {},
  overview: { visible: true, x: 520, y: 180 },
  undo: [],
  redo: []
};

const $ = (id) => document.getElementById(id);
const qs = (selector) => [...document.querySelectorAll(selector)];
const labels = {
  layout: ['Triangle', 'Square', 'Circle'],
  edge: ['Sharp', 'Rough', 'Smooth'],
  difficulty: ['', '1 · Easy', '2 · Gentle', '3 · Balanced', '4 · Hard', '5 · Brutal']
};

window.addEventListener('DOMContentLoaded', boot);

function boot() {
  preloadTextures();
  bind();
  buildPalettes();
  buildReference();
  syncStateToControls();
  renderAll('Ready');
  requestAnimationFrame(() => { clampOverview(); placeOverview(); });
}

function bind() {
  qs('.panel-nav-button').forEach((button) => button.addEventListener('click', () => showPanel(button.dataset.panel)));
  $('btn-random')?.addEventListener('click', () => { snapshot(); buildRandom(); renderAll('Random maze built'); });
  $('btn-load-reference')?.addEventListener('click', () => { snapshot(); buildReference(); renderAll('Reference loaded'); });
  $('btn-reparse')?.addEventListener('click', () => { snapshot(); state.sourceImage ? parseImage(state.sourceImage) : buildReference(); renderAll('Re-parsed'); });
  $('btn-solve')?.addEventListener('click', () => { solve(); renderAll(state.solution.length ? 'Solution plotted' : 'No path found'); });
  $('btn-apply-difficulty')?.addEventListener('click', () => { snapshot(); applyDifficulty(); renderAll('Difficulty applied'); });
  $('btn-export-json')?.addEventListener('click', downloadJson);
  $('btn-copy-json')?.addEventListener('click', copyJson);
  $('btn-clear-paint')?.addEventListener('click', () => { snapshot(); state.cellStyles = blankStyles(); renderAll('Paint cleared'); });
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
  qs('.template-action').forEach((button) => button.addEventListener('click', () => applyTemplate(button.dataset.template)));
  qs('.tool-button').forEach((button) => button.addEventListener('click', () => setTool(button.dataset.tool)));
  qs('.target-button').forEach((button) => button.addEventListener('click', () => selectTarget(button.dataset.target)));
  $('target-color-picker')?.addEventListener('input', (event) => {
    state.style[state.selectedTarget].color = event.target.value;
    state.style[state.selectedTarget].texture = null;
    updateTargetUi();
    drawMatrix();
    drawPreview();
  });
  $('btn-apply-target-color')?.addEventListener('click', () => {
    state.style[state.selectedTarget].color = $('target-color-picker')?.value || state.style[state.selectedTarget].color;
    state.style[state.selectedTarget].texture = null;
    updateTargetUi();
    drawMatrix();
    drawPreview();
  });
  bindSlider('grid-slider', (v) => { state.gridSize = v; syncLabels(); updateChecks(); }, () => { snapshot(); buildRandom(); renderAll('Grid rebuilt'); });
  bindSlider('threshold-slider', (v) => { state.threshold = v; syncLabels(); }, () => { if (state.sourceImage) { snapshot(); parseImage(state.sourceImage); renderAll('Detection updated'); } });
  $('invert-checkbox')?.addEventListener('change', (event) => { snapshot(); state.invert = event.target.checked; if (state.sourceImage) parseImage(state.sourceImage); else invertMatrix(); renderAll('Inverted'); });
  bindSlider('wall-height-slider', (v) => { state.wallHeight = v; syncLabels(); drawPreview(); }, null, parseFloat);
  bindSlider('gap-slider', (v) => { state.gap = v; syncLabels(); drawPreview(); }, null, parseFloat);
  bindSlider('layout-style-slider', (v) => { state.layout = v; syncLabels(); drawPreview(); });
  bindSlider('warp-slider', (v) => { state.warp = v; syncLabels(); drawPreview(); });
  bindSlider('edge-style-slider', (v) => { state.edge = v; syncLabels(); drawPreview(); });
  bindSlider('difficulty-slider', (v) => { state.difficulty = v; syncLabels(); });
  const overviewCanvas = $('analysis-canvas');
  overviewCanvas?.addEventListener('mousedown', (event) => editFromEvent(event, true));
  overviewCanvas?.addEventListener('mousemove', (event) => { if (event.buttons) editFromEvent(event, false); });
  overviewCanvas?.addEventListener('touchstart', (event) => editFromEvent(event, true), { passive: false });
  overviewCanvas?.addEventListener('touchmove', (event) => editFromEvent(event, false), { passive: false });
  window.addEventListener('keydown', (event) => { setKey(event.key, true); });
  window.addEventListener('keyup', (event) => { setKey(event.key, false); });
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

function setKey(key, value) {
  state.keys[key] = value;
  const map = { ArrowUp: 'w', ArrowLeft: 'a', ArrowDown: 's', ArrowRight: 'd' };
  const dpadKey = map[key] || key;
  $('virtual-dpad')?.querySelectorAll('button[data-dpad]').forEach((button) => button.classList.toggle('is-pressed', state.keys[button.dataset.dpad] || state.keys[Object.keys(map).find((k) => map[k] === button.dataset.dpad)]));
}

function showPanel(name) {
  qs('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === name));
  qs('[data-panel-content]').forEach((panel) => {
    const active = panel.dataset.panelContent === name;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  updateChecks();
}

function setTool(tool) {
  state.tool = tool;
  qs('.tool-button').forEach((button) => button.classList.toggle('is-active', button.dataset.tool === tool));
}

function setView(view) {
  state.view = view;
  $('view-mode-diorama')?.classList.toggle('is-active', view === 'diorama');
  $('view-mode-fps')?.classList.toggle('is-active', view === 'fps');
  $('virtual-dpad')?.classList.toggle('is-hidden', view !== 'fps');
  status(view === 'fps' ? 'Walk Test · WASD/arrows' : 'Diorama camera');
  drawPreview();
}

function status(text) { if ($('player-status-indicator')) $('player-status-indicator').textContent = text; }
function ready(text) { const el = $('analysis-state'); if (el) { el.textContent = text; el.className = 'status-pill is-good'; } }

function syncLabels() {
  setText('grid-val', `${state.gridSize} × ${state.gridSize}`);
  setText('threshold-val', `${state.threshold}%`);
  setText('wall-height-val', state.wallHeight.toFixed(1));
  setText('gap-val', state.gap.toFixed(2));
  setText('layout-style-val', labels.layout[state.layout]);
  setText('warp-val', `${state.warp}%`);
  setText('edge-style-val', labels.edge[state.edge]);
  setText('difficulty-val', labels.difficulty[state.difficulty]);
}
function setText(id, text) { if ($(id)) $(id).textContent = text; }

function syncStateToControls() {
  setValue('grid-slider', state.gridSize);
  setValue('threshold-slider', state.threshold);
  if ($('invert-checkbox')) $('invert-checkbox').checked = state.invert;
  setValue('wall-height-slider', state.wallHeight);
  setValue('gap-slider', state.gap);
  setValue('layout-style-slider', state.layout);
  setValue('warp-slider', state.warp);
  setValue('edge-style-slider', state.edge);
  setValue('difficulty-slider', state.difficulty);
  selectTarget(state.selectedTarget);
  syncLabels();
}
function setValue(id, value) { if ($(id)) $(id).value = value; }

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
      button.style.backgroundImage = `url(${texture.src})`;
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

function buildSwatches() { buildPalettes(); }

function selectTarget(target) {
  state.selectedTarget = target;
  qs('.target-button').forEach((button) => button.classList.toggle('is-active', button.dataset.target === target));
  setText('selected-target-label', target.charAt(0).toUpperCase() + target.slice(1));
  const style = state.style[target];
  if ($('target-color-picker')) $('target-color-picker').value = style.color;
  updateTargetUi();
}

function updateTargetUi() {
  const currentTexture = state.style[state.selectedTarget].texture;
  qs('.texture-button').forEach((button, i) => button.classList.toggle('is-active', textureLibrary[i]?.id === currentTexture));
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
      state.customTextures[index] = { id, name: `Custom ${index + 1}`, src: reader.result };
      state.textureImages[id] = image;
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
    image.src = texture.src;
    state.textureImages[texture.id] = image;
  });
}

function snapshot() {
  state.undo.push(JSON.stringify({ matrix: state.matrix, cellStyles: state.cellStyles, start: state.start, exit: state.exit, solution: state.solution, style: state.style }));
  if (state.undo.length > 40) state.undo.shift();
  state.redo = [];
}
function restore(serialized) {
  const data = JSON.parse(serialized);
  state.matrix = data.matrix;
  state.gridSize = data.matrix.length;
  state.cellStyles = data.cellStyles || blankStyles();
  state.start = data.start;
  state.exit = data.exit;
  state.solution = data.solution || [];
  state.style = data.style || state.style;
  syncStateToControls();
  renderAll('Restored');
}
function undo() { if (!state.undo.length) return; state.redo.push(JSON.stringify({ matrix: state.matrix, cellStyles: state.cellStyles, start: state.start, exit: state.exit, solution: state.solution, style: state.style })); restore(state.undo.pop()); }
function redo() { if (!state.redo.length) return; state.undo.push(JSON.stringify({ matrix: state.matrix, cellStyles: state.cellStyles, start: state.start, exit: state.exit, solution: state.solution, style: state.style })); restore(state.redo.pop()); }

function buildReference() { state.matrix = makeMaze(state.gridSize, 42); state.cellStyles = blankStyles(); state.sourceImage = null; locateEnds(); }
function buildRandom() { state.matrix = makeMaze(state.gridSize, Date.now() % 99999); state.cellStyles = blankStyles(); state.sourceImage = null; locateEnds(); }
function blankStyles() { return Array.from({ length: state.gridSize }, () => Array(state.gridSize).fill(null)); }

function makeMaze(size, seed) {
  const grid = Array.from({ length: size }, () => Array(size).fill(1));
  let s = seed;
  const rnd = () => { const x = Math.sin(s++) * 10000; return x - Math.floor(x); };
  function carve(x, y) {
    grid[y][x] = 0;
    [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => rnd() - 0.5).forEach(([dx, dy]) => {
      const nx = x + dx; const ny = y + dy;
      if (nx > 0 && ny > 0 && nx < size - 1 && ny < size - 1 && grid[ny][nx]) {
        grid[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    });
  }
  carve(1, 1);
  grid[0][1] = 0;
  grid[size - 1][size - 2] = 0;
  return grid;
}
function invertMatrix() { state.matrix = state.matrix.map((row) => row.map((value) => value ? 0 : 1)); locateEnds(); }
function locateEnds() {
  const n = state.matrix.length; const openings = [];
  for (let c = 0; c < n; c++) { if (!state.matrix[0][c]) openings.push({ x: c, y: 0 }); if (!state.matrix[n - 1][c]) openings.push({ x: c, y: n - 1 }); }
  for (let r = 1; r < n - 1; r++) { if (!state.matrix[r][0]) openings.push({ x: 0, y: r }); if (!state.matrix[r][n - 1]) openings.push({ x: n - 1, y: r }); }
  state.start = openings[0] || { x: 1, y: 1 };
  state.exit = openings[openings.length - 1] || { x: n - 2, y: n - 2 };
  state.player = { x: state.start.x + 0.5, y: state.start.y + 0.5 };
  state.solution = [];
}

function loadImage(file) {
  if (!file) return;
  snapshot();
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => { state.sourceImage = image; parseImage(image); renderAll('Image parsed'); };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}
function parseImage(image) {
  const n = state.gridSize; const canvas = document.createElement('canvas'); canvas.width = n; canvas.height = n;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0, n, n);
  const data = ctx.getImageData(0, 0, n, n).data; const values = [];
  for (let i = 0; i < data.length; i += 4) values.push((data[i] + data[i + 1] + data[i + 2]) / 3);
  const min = Math.min(...values); const max = Math.max(...values); const cut = min + (max - min) * state.threshold / 100;
  state.matrix = Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => { const wall = values[y * n + x] < cut; return (state.invert ? !wall : wall) ? 1 : 0; }));
  state.cellStyles = blankStyles(); locateEnds();
}

function renderAll(message) { syncLabels(); drawMatrix(); drawPreview(); ready(message); updateChecks(); }
function styleForTarget(target, cellStyle) { return cellStyle || state.style[target]; }
function fillWithStyle(ctx, x, y, w, h, style) {
  const image = style?.texture ? state.textureImages[style.texture] : null;
  if (image?.complete && image.naturalWidth) {
    try { const pattern = ctx.createPattern(image, 'repeat'); ctx.fillStyle = pattern; } catch { ctx.fillStyle = style.color; }
  } else ctx.fillStyle = style?.color || '#24513a';
  ctx.fillRect(x, y, w, h);
}
function drawMatrix() {
  const canvas = $('analysis-canvas'); if (!canvas) return;
  const ctx = canvas.getContext('2d'); const n = state.matrix.length; canvas.width = 420; canvas.height = 420; const cell = canvas.width / n;
  fillWithStyle(ctx, 0, 0, canvas.width, canvas.height, state.style.floor);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (state.matrix[y][x]) fillWithStyle(ctx, x * cell, y * cell, Math.ceil(cell), Math.ceil(cell), styleForTarget('walls', state.cellStyles[y]?.[x]));
    else { ctx.fillStyle = state.style.floor.color; ctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell)); }
  }
  drawSolution(ctx, cell, false); drawNode(ctx, state.start, cell, '#d65f55'); drawNode(ctx, state.exit, cell, '#8ee6dc');
  const walls = state.matrix.flat().filter(Boolean).length; setText('matrix-summary', `${n} × ${n} · ${walls} walls`);
}
function drawSolution(ctx, cell, shaped) {
  if (!state.solution.length) return;
  ctx.strokeStyle = '#8ee6dc'; ctx.lineWidth = Math.max(2, cell * 0.32); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  state.solution.forEach((p, i) => { const pos = shaped ? layoutPoint(p.x, p.y, cell) : { x: p.x * cell, y: p.y * cell }; const px = pos.x + cell / 2; const py = pos.y + cell / 2; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke();
}
function drawNode(ctx, p, cell, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x * cell + cell / 2, p.y * cell + cell / 2, cell * 0.38, 0, Math.PI * 2); ctx.fill(); }
function drawMarker(ctx, p, cell, color) { const pos = layoutPoint(p.x, p.y, cell); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(pos.x + cell / 2, pos.y + cell / 2, cell * 0.38, 0, Math.PI * 2); ctx.fill(); }

function drawPreview() {
  const wrap = $('threejs-container'); if (!wrap) return;
  let canvas = $('maze-preview-canvas'); if (!canvas) { wrap.innerHTML = ''; canvas = document.createElement('canvas'); canvas.id = 'maze-preview-canvas'; wrap.appendChild(canvas); }
  const rect = wrap.getBoundingClientRect(); const ratio = window.devicePixelRatio || 1; canvas.width = Math.max(1, rect.width * ratio); canvas.height = Math.max(1, rect.height * ratio); canvas.style.width = '100%'; canvas.style.height = '100%';
  const ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const w = rect.width; const h = rect.height; const n = state.matrix.length; const cell = Math.min(w / (n + 11), h / (n + 9)) * state.zoom; const ox = w / 2 - (n * cell) / 2; const oy = h / 2 - (n * cell) / 2 + 18;
  fillWithStyle(ctx, 0, 0, w, h, state.style.roof);
  ctx.save(); ctx.translate(ox, oy);
  drawShapeBackdrop(ctx, n, cell);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!state.matrix[y][x] && isVisibleShapeCell(x, y, n)) { const pos = layoutPoint(x, y, cell); fillWithStyle(ctx, pos.x, pos.y, cell * .96, cell * .96, state.style.floor); }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (state.matrix[y][x] && isVisibleShapeCell(x, y, n)) { const pos = layoutPoint(x, y, cell); drawBlock(ctx, pos.x, pos.y, cell, styleForTarget('walls', state.cellStyles[y]?.[x]), y, x); }
  drawSolution(ctx, cell, true); drawMarker(ctx, state.start, cell, '#d65f55'); drawMarker(ctx, state.exit, cell, '#8ee6dc'); if (state.view === 'fps') drawPlayer(ctx, cell); ctx.restore();
}
function isVisibleShapeCell(x, y, n) {
  if (state.layout === 0) return y >= Math.abs(x - (n - 1) / 2) * 0.82;
  if (state.layout === 2) { const cx = (n - 1) / 2; const cy = (n - 1) / 2; const r = n * 0.51; return Math.hypot(x - cx, y - cy) <= r; }
  return true;
}
function drawShapeBackdrop(ctx, n, cell) {
  ctx.save();
  ctx.strokeStyle = state.style.border.color; ctx.lineWidth = Math.max(3, cell * .35); ctx.beginPath();
  if (state.layout === 0) { ctx.moveTo(n * cell / 2, 0); ctx.lineTo(n * cell, n * cell); ctx.lineTo(0, n * cell); ctx.closePath(); }
  else if (state.layout === 2) { ctx.arc(n * cell / 2, n * cell / 2, n * cell / 2, 0, Math.PI * 2); }
  else ctx.rect(0, 0, n * cell, n * cell);
  ctx.stroke(); ctx.restore();
}
function layoutPoint(x, y, cell) {
  const n = state.matrix.length; let px = x * cell; let py = y * cell;
  if (state.layout === 0) { const taper = 1 - (y / Math.max(1, n - 1)) * 0.42; px = (x - n / 2) * cell * taper + n * cell / 2; }
  if (state.layout === 2) { const cx = (n - 1) / 2; const cy = (n - 1) / 2; const dx = x - cx; const dy = y - cy; const dist = Math.hypot(dx, dy) / (n / 2); const scale = dist > 0 ? Math.min(1.08, 0.78 + dist * .24) : 1; px = (cx + dx * scale) * cell; py = (cy + dy * scale) * cell; }
  const warp = state.warp / 100; if (warp) { px += Math.sin(y * 1.37 + x * .31) * cell * 0.45 * warp; py += Math.cos(x * 1.21 + y * .27) * cell * 0.45 * warp; }
  return { x: px, y: py };
}
function drawBlock(ctx, x, y, cell, style, row, col) {
  const jitter = state.edge === 1 ? Math.sin((row + 1) * (col + 3)) * cell * 0.04 : 0; const radius = state.edge === 2 ? cell * 0.25 : 3; const w = cell * state.gap; const h = cell * state.gap;
  ctx.save(); roundedRect(ctx, x + jitter, y - jitter, w, h, radius); ctx.clip(); fillWithStyle(ctx, x + jitter, y - jitter, w, h, style); ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fillRect(x, y + h - cell * (.35 + state.wallHeight * .08), w, cell * (.35 + state.wallHeight * .08)); ctx.restore(); ctx.strokeStyle = 'rgba(233,255,224,.16)'; ctx.strokeRect(x, y, w, h);
}
function roundedRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); }
function drawPlayer(ctx, cell) { const pos = layoutPoint(state.player.x, state.player.y, cell); ctx.fillStyle = '#f3dcaa'; ctx.beginPath(); ctx.arc(pos.x, pos.y, Math.max(3, cell * .3), 0, Math.PI * 2); ctx.fill(); }

function editFromEvent(event, first) {
  if (state.tool === 'camera') return; event.preventDefault(); const touch = event.touches?.[0]; const rect = $('analysis-canvas').getBoundingClientRect(); const x = (touch ? touch.clientX : event.clientX) - rect.left; const y = (touch ? touch.clientY : event.clientY) - rect.top; const col = Math.floor(x / rect.width * state.gridSize); const row = Math.floor(y / rect.height * state.gridSize); if (row < 0 || col < 0 || row >= state.gridSize || col >= state.gridSize) return; if (first) snapshot();
  if (state.tool === 'paint' && state.matrix[row][col]) state.cellStyles[row][col] = { ...state.style[state.selectedTarget] };
  if (state.tool === 'paintSection') paintSection(row, col);
  if (state.tool === 'toggle' && first) { state.matrix[row][col] = state.matrix[row][col] ? 0 : 1; locateEnds(); }
  state.solution = []; drawMatrix(); drawPreview(); updateChecks();
}
function paintSection(row, col) { if (!state.matrix[row][col]) return; [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { let x = col + dx; let y = row + dy; while (y >= 0 && x >= 0 && y < state.gridSize && x < state.gridSize && state.matrix[y][x]) { state.cellStyles[y][x] = { ...state.style[state.selectedTarget] }; if (!dx && !dy) break; x += dx; y += dy; } }); }
function movePlayer() { if (state.view !== 'fps') return; let dx = 0; let dy = 0; if (state.keys.w || state.keys.ArrowUp) dy -= .08; if (state.keys.s || state.keys.ArrowDown) dy += .08; if (state.keys.a || state.keys.ArrowLeft) dx -= .08; if (state.keys.d || state.keys.ArrowRight) dx += .08; if (!dx && !dy) return; const nx = state.player.x + dx; const ny = state.player.y + dy; const c = Math.floor(nx); const r = Math.floor(ny); if (r >= 0 && c >= 0 && r < state.gridSize && c < state.gridSize && !state.matrix[r][c]) { state.player.x = nx; state.player.y = ny; drawPreview(); } }
function solve() { const queue = [[state.start]]; const seen = new Set([`${state.start.x},${state.start.y}`]); const n = state.gridSize; while (queue.length) { const path = queue.shift(); const p = path[path.length - 1]; if (p.x === state.exit.x && p.y === state.exit.y) { state.solution = path; return path; } [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const next = { x: p.x + dx, y: p.y + dy }; const key = `${next.x},${next.y}`; if (next.x >= 0 && next.y >= 0 && next.x < n && next.y < n && !seen.has(key) && !state.matrix[next.y][next.x]) { seen.add(key); queue.push([...path, next]); } }); } state.solution = []; return []; }
function applyDifficulty() { buildRandom(); if (state.difficulty <= 2) { solve(); state.solution.forEach((p, i) => { if (i % (state.difficulty === 1 ? 1 : 2)) return; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const x = p.x + dx; const y = p.y + dy; if (x > 0 && y > 0 && x < state.gridSize - 1 && y < state.gridSize - 1) state.matrix[y][x] = 0; }); }); } if (state.difficulty >= 4) { solve(); const keep = new Set(state.solution.map((p) => `${p.x},${p.y}`)); for (let y = 1; y < state.gridSize - 1; y++) for (let x = 1; x < state.gridSize - 1; x++) if (!state.matrix[y][x] && !keep.has(`${x},${y}`) && Math.random() < (state.difficulty === 5 ? .65 : .38)) state.matrix[y][x] = 1; } if (!solve().length) buildReference(); state.cellStyles = blankStyles(); solve(); }
function applyTemplate(t) { snapshot(); buildRandom(); if (t === 'training') { state.difficulty = 1; applyDifficulty(); } if (t === 'stone') { applyTexture('cobblestone'); selectTarget('floor'); applyTexture('stone'); } if (t === 'underworld') { selectTarget('floor'); applyColor('#050706'); selectTarget('walls'); applyColor('#0b1110'); } syncStateToControls(); renderAll('Template applied'); }
function exportObj() { const id = $('module-id')?.value || 'ch00_q00_labyrinth_maze'; return { schema: SCHEMA, kind: 'puzzle_module', moduleId: id, displayName: 'Labyrinth Maze', gameplayMode: $('gameplay-mode')?.value || 'scene_mode', puzzle: { type: $('puzzle-type')?.value || 'pass_environmental_obstacle', callingText: $('calling-text')?.value || '', difficulty: state.difficulty, completionCondition: { flag: $('completion-flag')?.value || 'maze_exit_reached', value: true, trigger: 'player_reaches_exit' }, start: { ...state.start, grid: 'matrix' }, exit: { ...state.exit, grid: 'matrix' } }, grid: { cols: state.gridSize, rows: state.gridSize, cellSize: 1, origin: 'top_left', wallValue: 1, pathValue: 0, matrix: state.matrix }, renderHints: { wallHeight: state.wallHeight, gap: state.gap, layoutShape: labels.layout[state.layout], warp: state.warp, edgeStyle: labels.edge[state.edge], styleTargets: state.style, cellStyles: state.cellStyles }, solution: { generated: !!state.solution.length, path: state.solution } }; }
function downloadJson() { const id = $('module-id')?.value || 'maze-module'; const blob = new Blob([JSON.stringify(exportObj(), null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${id}.json`; a.click(); URL.revokeObjectURL(a.href); ready('JSON downloaded'); }
async function copyJson() { try { await navigator.clipboard.writeText(JSON.stringify(exportObj(), null, 2)); ready('JSON copied'); } catch { ready('Clipboard blocked'); } }
async function pasteJson() { try { const text = await navigator.clipboard.readText(); importObject(JSON.parse(text)); renderAll('JSON pasted'); } catch { ready('Paste failed'); } }
function importJson(file) { if (!file) return; const reader = new FileReader(); reader.onload = () => { try { importObject(JSON.parse(reader.result)); renderAll('JSON imported'); } catch { ready('Import failed'); } }; reader.readAsText(file); }
function importObject(data) { snapshot(); state.matrix = data.grid.matrix; state.gridSize = data.grid.rows; state.cellStyles = data.renderHints?.cellStyles || blankStyles(); state.start = data.puzzle.start; state.exit = data.puzzle.exit; state.solution = data.solution?.path || []; state.difficulty = data.puzzle?.difficulty || 3; state.wallHeight = data.renderHints?.wallHeight || state.wallHeight; state.gap = data.renderHints?.gap || state.gap; state.warp = data.renderHints?.warp || 0; state.style = data.renderHints?.styleTargets || state.style; $('module-id') && ($('module-id').value = data.moduleId || ''); syncStateToControls(); }
function makeOverviewDraggable() { const win = $('overview-window'); const bar = $('overview-titlebar'); if (!win || !bar) return; let dragging = false; let sx = 0; let sy = 0; let ox = 0; let oy = 0; bar.addEventListener('mousedown', (event) => { if (event.target.id === 'overview-close') return; dragging = true; sx = event.clientX; sy = event.clientY; ox = state.overview.x; oy = state.overview.y; document.body.style.userSelect = 'none'; }); window.addEventListener('mousemove', (event) => { if (!dragging) return; state.overview.x = ox + event.clientX - sx; state.overview.y = oy + event.clientY - sy; clampOverview(); placeOverview(); }); window.addEventListener('mouseup', () => { dragging = false; document.body.style.userSelect = ''; }); }
function clampOverview() { const win = $('overview-window'); if (!win) return; const width = win.offsetWidth || 360; const height = win.offsetHeight || 420; state.overview.x = Math.max(8, Math.min(window.innerWidth - width - 8, state.overview.x)); state.overview.y = Math.max(8, Math.min(window.innerHeight - height - 8, state.overview.y)); }
function placeOverview() { const win = $('overview-window'); if (!win) return; win.style.left = `${state.overview.x}px`; win.style.top = `${state.overview.y}px`; win.classList.toggle('is-hidden', !state.overview.visible); }
function toggleOverview() { state.overview.visible = !state.overview.visible; placeOverview(); }
function updateChecks() { const walls = state.matrix.flat().filter(Boolean).length; setCheck('build', walls ? 'green' : 'red'); setCheck('display', 'green'); const logicFilled = $('module-id')?.value && $('completion-flag')?.value && $('calling-text')?.value; setCheck('logic', logicFilled ? 'green' : 'yellow'); const painted = state.cellStyles.flat().some(Boolean); setCheck('visuals', painted ? 'green' : 'yellow'); placeOverview(); }
function setCheck(name, s) { qs(`[data-check="${name}"]`).forEach((b) => { b.classList.remove('status-green', 'status-yellow', 'status-red'); b.classList.add(`status-${s}`); }); }
