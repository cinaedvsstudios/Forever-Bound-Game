const SCHEMA = 'cinaedvs.artifex.maze.v1';

const state = {
  gridSize: 31,
  threshold: 50,
  invert: false,
  matrix: [],
  colors: [],
  start: { x: 1, y: 1 },
  exit: { x: 29, y: 29 },
  solution: [],
  sourceImage: null,
  brushColor: '#8b3f2f',
  wallColor: '#24513a',
  tool: 'camera',
  view: 'diorama',
  zoom: 1,
  wallHeight: 1.5,
  gap: 0.98,
  material: 'hedge',
  floor: 'soil',
  layout: 0,
  edge: 0,
  difficulty: 3,
  player: { x: 1.5, y: 1.5 },
  keys: {},
  overview: { visible: true, x: 520, y: 180 },
  undo: [],
  redo: []
};

const $ = (id) => document.getElementById(id);
const qs = (selector) => [...document.querySelectorAll(selector)];
const labels = {
  layout: ['Straight', 'Natural', 'Curved'],
  edge: ['Sharp', 'Rough', 'Smooth'],
  difficulty: ['', '1 · Easy', '2 · Gentle', '3 · Balanced', '4 · Hard', '5 · Brutal']
};

window.addEventListener('DOMContentLoaded', boot);

function boot() {
  bind();
  buildSwatches();
  buildReference();
  syncStateToControls();
  renderAll('Ready');
  updateChecks();
  requestAnimationFrame(() => {
    clampOverviewToViewport();
    placeOverview();
  });
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
  $('btn-clear-paint')?.addEventListener('click', () => { snapshot(); state.colors = blankColors(); renderAll('Paint cleared'); });

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
  qs('.material-preset').forEach((button) => button.addEventListener('click', () => {
    state.material = button.dataset.style;
    qs('.material-preset').forEach((b) => b.classList.toggle('is-active', b === button));
    drawPreview();
    updateChecks();
  }));

  $('grid-slider')?.addEventListener('input', (event) => { state.gridSize = parseInt(event.target.value, 10); syncLabels(); updateChecks(); });
  $('grid-slider')?.addEventListener('change', () => { snapshot(); buildRandom(); renderAll('Grid rebuilt'); });
  $('threshold-slider')?.addEventListener('input', (event) => { state.threshold = parseInt(event.target.value, 10); syncLabels(); updateChecks(); });
  $('threshold-slider')?.addEventListener('change', () => { if (state.sourceImage) { snapshot(); parseImage(state.sourceImage); renderAll('Detection updated'); } });
  $('invert-checkbox')?.addEventListener('change', (event) => { snapshot(); state.invert = event.target.checked; if (state.sourceImage) parseImage(state.sourceImage); else invertMatrix(); renderAll('Inverted'); });

  $('wall-height-slider')?.addEventListener('input', (event) => { state.wallHeight = parseFloat(event.target.value); syncLabels(); drawPreview(); updateChecks(); });
  $('gap-slider')?.addEventListener('input', (event) => { state.gap = parseFloat(event.target.value); syncLabels(); drawPreview(); updateChecks(); });
  $('layout-style-slider')?.addEventListener('input', (event) => { state.layout = parseInt(event.target.value, 10); syncLabels(); drawPreview(); updateChecks(); });
  $('edge-style-slider')?.addEventListener('input', (event) => { state.edge = parseInt(event.target.value, 10); syncLabels(); drawPreview(); updateChecks(); });
  $('difficulty-slider')?.addEventListener('input', (event) => { state.difficulty = parseInt(event.target.value, 10); syncLabels(); updateChecks(); });

  $('wall-color-picker')?.addEventListener('input', (event) => { state.wallColor = event.target.value; drawMatrix(); drawPreview(); updateChecks(); });
  $('floor-style')?.addEventListener('change', (event) => { state.floor = event.target.value; drawPreview(); updateChecks(); });
  $('brush-color-picker')?.addEventListener('input', (event) => { state.brushColor = event.target.value; setTool('paint'); updateChecks(); });

  const overviewCanvas = $('analysis-canvas');
  overviewCanvas?.addEventListener('mousedown', (event) => editFromEvent(event, true));
  overviewCanvas?.addEventListener('mousemove', (event) => { if (event.buttons) editFromEvent(event, false); });
  overviewCanvas?.addEventListener('touchstart', (event) => editFromEvent(event, true), { passive: false });
  overviewCanvas?.addEventListener('touchmove', (event) => editFromEvent(event, false), { passive: false });

  window.addEventListener('keydown', (event) => { state.keys[event.key] = true; });
  window.addEventListener('keyup', (event) => { state.keys[event.key] = false; });
  $('virtual-dpad')?.querySelectorAll('button[data-dpad]').forEach((button) => {
    const key = button.dataset.dpad;
    const down = (event) => { event.preventDefault(); state.keys[key] = true; };
    const up = (event) => { event.preventDefault(); state.keys[key] = false; };
    button.addEventListener('mousedown', down);
    button.addEventListener('mouseup', up);
    button.addEventListener('mouseleave', up);
    button.addEventListener('touchstart', down, { passive: false });
    button.addEventListener('touchend', up, { passive: false });
  });

  window.addEventListener('resize', () => { clampOverviewToViewport(); placeOverview(); drawPreview(); });
  setInterval(movePlayer, 33);
  makeOverviewDraggable();
}

function showPanel(name) {
  qs('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === name));
  qs('[data-panel-content]').forEach((panel) => {
    const active = panel.dataset.panelContent === name;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
}

function setTool(tool) {
  state.tool = tool;
  qs('.tool-button').forEach((button) => button.classList.toggle('is-active', button.dataset.tool === tool));
  updateChecks();
}

function setView(view) {
  state.view = view;
  $('view-mode-diorama')?.classList.toggle('is-active', view === 'diorama');
  $('view-mode-fps')?.classList.toggle('is-active', view === 'fps');
  $('virtual-dpad')?.classList.toggle('is-hidden', view !== 'fps');
  status(view === 'fps' ? 'Walk Test · WASD/arrows' : 'Diorama camera');
  drawPreview();
  updateChecks();
}

function status(text) {
  const el = $('player-status-indicator');
  if (el) el.textContent = text;
}

function ready(text) {
  const el = $('analysis-state');
  if (el) {
    el.textContent = text;
    el.className = 'status-pill is-good';
  }
}

function syncLabels() {
  $('grid-val') && ($('grid-val').textContent = `${state.gridSize} × ${state.gridSize}`);
  $('threshold-val') && ($('threshold-val').textContent = `${state.threshold}%`);
  $('wall-height-val') && ($('wall-height-val').textContent = state.wallHeight.toFixed(1));
  $('gap-val') && ($('gap-val').textContent = state.gap.toFixed(2));
  $('layout-style-val') && ($('layout-style-val').textContent = labels.layout[state.layout]);
  $('edge-style-val') && ($('edge-style-val').textContent = labels.edge[state.edge]);
  $('difficulty-val') && ($('difficulty-val').textContent = labels.difficulty[state.difficulty]);
}

function syncStateToControls() {
  $('grid-slider') && ($('grid-slider').value = state.gridSize);
  $('threshold-slider') && ($('threshold-slider').value = state.threshold);
  $('invert-checkbox') && ($('invert-checkbox').checked = state.invert);
  $('wall-height-slider') && ($('wall-height-slider').value = state.wallHeight);
  $('gap-slider') && ($('gap-slider').value = state.gap);
  $('layout-style-slider') && ($('layout-style-slider').value = state.layout);
  $('edge-style-slider') && ($('edge-style-slider').value = state.edge);
  $('difficulty-slider') && ($('difficulty-slider').value = state.difficulty);
  $('wall-color-picker') && ($('wall-color-picker').value = state.wallColor);
  $('brush-color-picker') && ($('brush-color-picker').value = state.brushColor);
  $('floor-style') && ($('floor-style').value = state.floor);
  syncLabels();
}

function buildSwatches() {
  const row = $('swatch-row');
  if (!row) return;
  row.innerHTML = '';
  ['#24513a', '#6f4a2d', '#8b3f2f', '#b37a37', '#7fd2cf', '#684b8f', '#2b3341', '#59624c', '#bd6651', '#e1c073'].forEach((color) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch-button';
    button.style.background = color;
    button.title = color;
    button.onclick = () => {
      state.brushColor = color;
      $('brush-color-picker') && ($('brush-color-picker').value = color);
      setTool('paint');
    };
    row.appendChild(button);
  });
}

function snapshot() {
  state.undo.push(JSON.stringify({ matrix: state.matrix, colors: state.colors, start: state.start, exit: state.exit, solution: state.solution }));
  if (state.undo.length > 40) state.undo.shift();
  state.redo = [];
}

function restore(serialized) {
  const data = JSON.parse(serialized);
  state.matrix = data.matrix;
  state.gridSize = data.matrix.length;
  state.colors = data.colors || blankColors();
  state.start = data.start;
  state.exit = data.exit;
  state.solution = data.solution || [];
  syncStateToControls();
  renderAll('Restored');
}

function undo() {
  if (!state.undo.length) return;
  state.redo.push(JSON.stringify({ matrix: state.matrix, colors: state.colors, start: state.start, exit: state.exit, solution: state.solution }));
  restore(state.undo.pop());
}

function redo() {
  if (!state.redo.length) return;
  state.undo.push(JSON.stringify({ matrix: state.matrix, colors: state.colors, start: state.start, exit: state.exit, solution: state.solution }));
  restore(state.redo.pop());
}

function buildReference() {
  state.matrix = makeMaze(state.gridSize, 42);
  state.colors = blankColors();
  state.sourceImage = null;
  locateEnds();
}

function buildRandom() {
  state.matrix = makeMaze(state.gridSize, Date.now() % 99999);
  state.colors = blankColors();
  state.sourceImage = null;
  locateEnds();
}

function blankColors() {
  return Array.from({ length: state.gridSize }, () => Array(state.gridSize).fill(null));
}

function makeMaze(size, seed) {
  const grid = Array.from({ length: size }, () => Array(size).fill(1));
  let s = seed;
  const rnd = () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
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
  grid[0][1] = 0;
  grid[size - 1][size - 2] = 0;
  return grid;
}

function invertMatrix() {
  state.matrix = state.matrix.map((row) => row.map((value) => value ? 0 : 1));
  locateEnds();
}

function locateEnds() {
  const n = state.matrix.length;
  const openings = [];
  for (let c = 0; c < n; c++) {
    if (!state.matrix[0][c]) openings.push({ x: c, y: 0 });
    if (!state.matrix[n - 1][c]) openings.push({ x: c, y: n - 1 });
  }
  for (let r = 1; r < n - 1; r++) {
    if (!state.matrix[r][0]) openings.push({ x: 0, y: r });
    if (!state.matrix[r][n - 1]) openings.push({ x: n - 1, y: r });
  }
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
    image.onload = () => {
      state.sourceImage = image;
      parseImage(image);
      renderAll('Image parsed');
    };
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
    return (state.invert ? !wall : wall) ? 1 : 0;
  }));
  state.colors = blankColors();
  locateEnds();
}

function renderAll(message) {
  syncLabels();
  drawMatrix();
  drawPreview();
  ready(message);
  updateChecks();
}

function drawMatrix() {
  const canvas = $('analysis-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const n = state.matrix.length;
  canvas.width = 420;
  canvas.height = 420;
  const cell = canvas.width / n;
  ctx.fillStyle = '#06150b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      ctx.fillStyle = state.matrix[y][x] ? (state.colors[y][x] || state.wallColor) : '#7b5a32';
      ctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
  drawSolutionOnContext(ctx, cell);
  drawNode(ctx, state.start, cell, '#d65f55');
  drawNode(ctx, state.exit, cell, '#8ee6dc');
  const walls = state.matrix.flat().filter(Boolean).length;
  $('matrix-summary') && ($('matrix-summary').textContent = `${n} × ${n} · ${walls} walls`);
}

function drawSolutionOnContext(ctx, cell) {
  if (!state.solution.length) return;
  ctx.strokeStyle = '#8ee6dc';
  ctx.lineWidth = Math.max(2, cell * 0.32);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  state.solution.forEach((point, index) => {
    const px = point.x * cell + cell / 2;
    const py = point.y * cell + cell / 2;
    index ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  });
  ctx.stroke();
}

function drawNode(ctx, point, cell, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x * cell + cell / 2, point.y * cell + cell / 2, cell * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

function drawPreview() {
  const wrap = $('threejs-container');
  if (!wrap) return;
  let canvas = $('maze-preview-canvas');
  if (!canvas) {
    wrap.innerHTML = '';
    canvas = document.createElement('canvas');
    canvas.id = 'maze-preview-canvas';
    wrap.appendChild(canvas);
  }
  const rect = wrap.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * pixelRatio);
  canvas.height = Math.max(1, rect.height * pixelRatio);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  const w = rect.width;
  const h = rect.height;
  const n = state.matrix.length;
  const cell = Math.min(w / (n + 11), h / (n + 9)) * state.zoom;
  const ox = w / 2 - (n * cell) / 2;
  const oy = h / 2 - (n * cell) / 2 + 18;

  ctx.fillStyle = state.floor === 'underworld' ? '#020503' : state.floor === 'stone' ? '#242b25' : state.floor === 'parchment' ? '#455a35' : '#07180d';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(ox, oy);

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!state.matrix[y][x]) {
        const pos = layoutPoint(x, y, cell);
        ctx.fillStyle = state.floor === 'underworld' ? 'rgba(35,45,36,.75)' : 'rgba(118,91,50,.75)';
        ctx.fillRect(pos.x, pos.y, cell * 0.96, cell * 0.96);
      }
    }
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (state.matrix[y][x]) {
        const pos = layoutPoint(x, y, cell);
        drawBlock(ctx, pos.x, pos.y, cell, state.colors[y][x] || wallColor(), y, x);
      }
    }
  }
  drawPreviewSolution(ctx, cell);
  drawMarker(ctx, state.start, cell, '#d65f55');
  drawMarker(ctx, state.exit, cell, '#8ee6dc');
  if (state.view === 'fps') drawPlayer(ctx, cell);
  ctx.restore();
}

function layoutPoint(x, y, cell) {
  let px = x * cell;
  let py = y * cell;
  if (state.layout === 1) {
    px += Math.sin(y * 0.6) * cell * 0.14 + Math.cos(x * 0.4) * cell * 0.08;
    py += Math.cos(x * 0.55) * cell * 0.1;
  }
  if (state.layout === 2) {
    px += Math.sin(y * 0.26) * cell * 0.55 + Math.cos(x * 0.18) * cell * 0.22;
    py += Math.cos(x * 0.26) * cell * 0.55 + Math.sin(y * 0.18) * cell * 0.22;
  }
  return { x: px, y: py };
}

function drawPreviewSolution(ctx, cell) {
  if (!state.solution.length) return;
  ctx.strokeStyle = '#8ee6dc';
  ctx.lineWidth = Math.max(2, cell * 0.25);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  state.solution.forEach((point, index) => {
    const pos = layoutPoint(point.x, point.y, cell);
    const px = pos.x + cell / 2;
    const py = pos.y + cell / 2;
    index ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  });
  ctx.stroke();
}

function wallColor() {
  const pickerValue = $('wall-color-picker')?.value || state.wallColor;
  if (state.material === 'stone' && pickerValue === '#24513a') return '#6f6960';
  if (state.material === 'rune' && pickerValue === '#24513a') return '#8a5a2a';
  if (state.material === 'shadow' && pickerValue === '#24513a') return '#0b1110';
  return pickerValue;
}

function drawBlock(ctx, x, y, cell, color, row, col) {
  const jitter = state.edge === 1 ? Math.sin((row + 1) * (col + 3)) * cell * 0.04 : 0;
  const radius = state.edge === 2 ? cell * 0.25 : 3;
  const heightShade = cell * (0.35 + state.wallHeight * 0.08);
  ctx.fillStyle = color;
  roundedRect(ctx, x + jitter, y - jitter, cell * state.gap, cell * state.gap, radius);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.fillRect(x, y + cell * state.gap - heightShade, cell * state.gap, heightShade);
  ctx.strokeStyle = 'rgba(233,255,224,.16)';
  ctx.strokeRect(x, y, cell * state.gap, cell * state.gap);
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawMarker(ctx, point, cell, color) {
  const pos = layoutPoint(point.x, point.y, cell);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x + cell / 2, pos.y + cell / 2, cell * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(ctx, cell) {
  const pos = layoutPoint(state.player.x, state.player.y, cell);
  ctx.fillStyle = '#f3dcaa';
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, Math.max(3, cell * 0.3), 0, Math.PI * 2);
  ctx.fill();
}

function editFromEvent(event, first) {
  if (state.tool === 'camera') return;
  event.preventDefault();
  const touch = event.touches?.[0];
  const rect = $('analysis-canvas').getBoundingClientRect();
  const x = (touch ? touch.clientX : event.clientX) - rect.left;
  const y = (touch ? touch.clientY : event.clientY) - rect.top;
  const col = Math.floor(x / rect.width * state.gridSize);
  const row = Math.floor(y / rect.height * state.gridSize);
  if (row < 0 || col < 0 || row >= state.gridSize || col >= state.gridSize) return;
  if (first) snapshot();
  if (state.tool === 'paint' && state.matrix[row][col]) state.colors[row][col] = state.brushColor;
  if (state.tool === 'paintSection') paintSection(row, col);
  if (state.tool === 'toggle' && first) {
    state.matrix[row][col] = state.matrix[row][col] ? 0 : 1;
    locateEnds();
  }
  state.solution = [];
  drawMatrix();
  drawPreview();
  updateChecks();
}

function paintSection(row, col) {
  if (!state.matrix[row][col]) return;
  [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
    let x = col + dx;
    let y = row + dy;
    while (y >= 0 && x >= 0 && y < state.gridSize && x < state.gridSize && state.matrix[y][x]) {
      state.colors[y][x] = state.brushColor;
      if (!dx && !dy) break;
      x += dx;
      y += dy;
    }
  });
}

function movePlayer() {
  if (state.view !== 'fps') return;
  let dx = 0;
  let dy = 0;
  if (state.keys.w || state.keys.ArrowUp) dy -= 0.08;
  if (state.keys.s || state.keys.ArrowDown) dy += 0.08;
  if (state.keys.a || state.keys.ArrowLeft) dx -= 0.08;
  if (state.keys.d || state.keys.ArrowRight) dx += 0.08;
  if (!dx && !dy) return;
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  const c = Math.floor(nx);
  const r = Math.floor(ny);
  if (r >= 0 && c >= 0 && r < state.gridSize && c < state.gridSize && !state.matrix[r][c]) {
    state.player.x = nx;
    state.player.y = ny;
    drawPreview();
  }
}

function solve() {
  const queue = [[state.start]];
  const seen = new Set([`${state.start.x},${state.start.y}`]);
  const n = state.gridSize;
  while (queue.length) {
    const path = queue.shift();
    const point = path[path.length - 1];
    if (point.x === state.exit.x && point.y === state.exit.y) {
      state.solution = path;
      return path;
    }
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const next = { x: point.x + dx, y: point.y + dy };
      const key = `${next.x},${next.y}`;
      if (next.x >= 0 && next.y >= 0 && next.x < n && next.y < n && !seen.has(key) && !state.matrix[next.y][next.x]) {
        seen.add(key);
        queue.push([...path, next]);
      }
    });
  }
  state.solution = [];
  return [];
}

function applyDifficulty() {
  const n = state.gridSize;
  const level = state.difficulty;
  buildRandom();
  solve();
  const solutionKeys = () => new Set(state.solution.map((p) => `${p.x},${p.y}`));

  if (level <= 2) {
    solve();
    const path = [...state.solution];
    path.forEach((p, index) => {
      if (index % (level === 1 ? 1 : 2) !== 0) return;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const x = p.x + dx;
        const y = p.y + dy;
        if (x > 0 && y > 0 && x < n - 1 && y < n - 1) state.matrix[y][x] = 0;
      });
    });
  }

  if (level >= 4) {
    solve();
    const keep = solutionKeys();
    for (let y = 1; y < n - 1; y++) {
      for (let x = 1; x < n - 1; x++) {
        if (!state.matrix[y][x] && !keep.has(`${x},${y}`)) {
          const chance = level === 5 ? 0.68 : 0.42;
          if (Math.random() < chance) state.matrix[y][x] = 1;
        }
      }
    }
  }

  // Repair solvability and make the route visible.
  if (!solve().length) {
    let x = state.start.x;
    let y = state.start.y;
    while (x !== state.exit.x) {
      state.matrix[y][x] = 0;
      x += x < state.exit.x ? 1 : -1;
    }
    while (y !== state.exit.y) {
      state.matrix[y][x] = 0;
      y += y < state.exit.y ? 1 : -1;
    }
    state.matrix[state.exit.y][state.exit.x] = 0;
    solve();
  }
  state.colors = blankColors();
}

function applyTemplate(template) {
  snapshot();
  buildRandom();
  if (template === 'training') {
    state.difficulty = 1;
    state.material = 'hedge';
    state.floor = 'soil';
    applyDifficulty();
  }
  if (template === 'hedge') { state.material = 'hedge'; state.floor = 'soil'; }
  if (template === 'stone') { state.material = 'stone'; state.floor = 'stone'; }
  if (template === 'underworld') { state.material = 'shadow'; state.floor = 'underworld'; }
  syncStateToControls();
  qs('.material-preset').forEach((button) => button.classList.toggle('is-active', button.dataset.style === state.material));
  renderAll('Template applied');
}

function exportObj() {
  const id = $('module-id')?.value || 'ch00_q00_labyrinth_maze';
  return {
    schema: SCHEMA,
    kind: 'puzzle_module',
    moduleId: id,
    displayName: 'Labyrinth Maze',
    gameplayMode: $('gameplay-mode')?.value || 'scene_mode',
    puzzle: {
      type: $('puzzle-type')?.value || 'pass_environmental_obstacle',
      callingText: $('calling-text')?.value || '',
      difficulty: state.difficulty,
      completionCondition: { flag: $('completion-flag')?.value || 'maze_exit_reached', value: true, trigger: 'player_reaches_exit' },
      start: { ...state.start, grid: 'matrix' },
      exit: { ...state.exit, grid: 'matrix' }
    },
    grid: { cols: state.gridSize, rows: state.gridSize, cellSize: 1, origin: 'top_left', wallValue: 1, pathValue: 0, matrix: state.matrix },
    collision: { wallCellsBlockMovement: true, playerRadius: 0.35 },
    renderHints: { wallHeight: state.wallHeight, gap: state.gap, layoutStyle: labels.layout[state.layout], edgeStyle: labels.edge[state.edge], wallMaterialPreset: state.material, wallColor: state.wallColor, floorStyle: state.floor, colorOverrides: state.colors },
    entities: [{ id: 'maze_start', type: 'marker', role: 'start', grid: state.start }, { id: 'maze_exit', type: 'trigger_zone', role: 'exit', grid: state.exit, setsFlag: $('completion-flag')?.value || 'maze_exit_reached' }],
    solution: { generated: !!state.solution.length, path: state.solution }
  };
}

function downloadJson() {
  const id = $('module-id')?.value || 'maze-module';
  const blob = new Blob([JSON.stringify(exportObj(), null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${id}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  ready('JSON downloaded');
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(exportObj(), null, 2));
    ready('JSON copied');
  } catch {
    ready('Clipboard blocked');
  }
}

async function pasteJson() {
  try {
    const text = await navigator.clipboard.readText();
    importObject(JSON.parse(text));
    renderAll('JSON pasted');
  } catch {
    ready('Paste failed');
  }
}

function importJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      importObject(JSON.parse(reader.result));
      renderAll('JSON imported');
    } catch {
      ready('Import failed');
    }
  };
  reader.readAsText(file);
}

function importObject(data) {
  snapshot();
  state.matrix = data.grid.matrix;
  state.gridSize = data.grid.rows;
  state.colors = data.renderHints?.colorOverrides || blankColors();
  state.start = data.puzzle.start;
  state.exit = data.puzzle.exit;
  state.solution = data.solution?.path || [];
  state.difficulty = data.puzzle?.difficulty || 3;
  state.wallHeight = data.renderHints?.wallHeight || state.wallHeight;
  state.gap = data.renderHints?.gap || state.gap;
  state.material = data.renderHints?.wallMaterialPreset || state.material;
  state.wallColor = data.renderHints?.wallColor || state.wallColor;
  state.floor = data.renderHints?.floorStyle || state.floor;
  $('module-id') && ($('module-id').value = data.moduleId || '');
  syncStateToControls();
}

function makeOverviewDraggable() {
  const win = $('overview-window');
  const bar = $('overview-titlebar');
  if (!win || !bar) return;
  let dragging = false;
  let sx = 0;
  let sy = 0;
  let ox = 0;
  let oy = 0;
  bar.addEventListener('mousedown', (event) => {
    if (event.target.id === 'overview-close') return;
    dragging = true;
    sx = event.clientX;
    sy = event.clientY;
    ox = state.overview.x;
    oy = state.overview.y;
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', (event) => {
    if (!dragging) return;
    state.overview.x = ox + event.clientX - sx;
    state.overview.y = oy + event.clientY - sy;
    clampOverviewToViewport();
    placeOverview();
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.userSelect = '';
  });
}

function clampOverviewToViewport() {
  const win = $('overview-window');
  if (!win) return;
  const width = win.offsetWidth || 360;
  const height = win.offsetHeight || 460;
  state.overview.x = Math.max(8, Math.min(window.innerWidth - width - 8, state.overview.x));
  state.overview.y = Math.max(8, Math.min(window.innerHeight - height - 8, state.overview.y));
}

function placeOverview() {
  const win = $('overview-window');
  if (!win) return;
  win.style.left = `${state.overview.x}px`;
  win.style.top = `${state.overview.y}px`;
  win.classList.toggle('is-hidden', !state.overview.visible);
}

function toggleOverview() {
  state.overview.visible = !state.overview.visible;
  placeOverview();
}

function updateChecks() {
  const walls = state.matrix.flat().filter(Boolean).length;
  setCheck('build', walls ? 'green' : 'red');
  setCheck('display', state.view && state.wallHeight && state.gap ? 'green' : 'yellow');
  const logicFilled = $('module-id')?.value && $('completion-flag')?.value && $('calling-text')?.value;
  setCheck('logic', logicFilled ? 'green' : 'yellow');
  const painted = state.colors.flat().some(Boolean);
  setCheck('visuals', painted || state.material !== 'hedge' || state.floor !== 'soil' || state.wallColor !== '#24513a' ? 'green' : 'yellow');
  placeOverview();
}

function setCheck(name, statusName) {
  qs(`[data-check="${name}"]`).forEach((button) => {
    button.classList.remove('status-green', 'status-yellow', 'status-red');
    button.classList.add(`status-${statusName}`);
  });
}
