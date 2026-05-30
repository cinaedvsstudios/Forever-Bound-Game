// Maze / Labyrinth Wall Form renderer
// Renders joined visual wall surfaces on an opaque overlay canvas while leaving the grid,
// collision, route solving, feature placement and Overview data unchanged.

import { isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
const rendererState = {
  panX: 0,
  panY: 0,
  dragging: false,
  lastX: 0,
  lastY: 0,
  timer: null
};

window.__artifexMazeWallRenderer = {
  render: renderWallFormPreview,
  setMode
};

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  injectControls();
  bindPanMirror();
  bindRenderTriggers();
  patchExportPayload();
});

function state() {
  return window.__artifexMazeRuntime?.state || null;
}

function activeMode() {
  const currentState = state();
  return currentState?.wallRenderMode && currentState.wallRenderMode !== 'blocks' && currentState.view !== '3d';
}

function injectControls() {
  if ($('maze-wall-form-card')) return;
  const panel = document.querySelector('[data-panel-content="visuals"]');
  const hint = panel?.querySelector('.hint-text');
  if (!panel || !hint) return;
  const card = document.createElement('section');
  card.id = 'maze-wall-form-card';
  card.className = 'maze-wall-form-card';
  card.innerHTML = `
    <div class="wall-form-copy">
      <strong>Wall Form</strong>
      <small>Join visual walls into continuous surfaces. The underlying maze grid and collision do not change.</small>
    </div>
    <div class="wall-form-buttons" role="group" aria-label="Wall form">
      <button type="button" data-wall-form="blocks" class="is-active" title="Show individual tile blocks.">Blocks</button>
      <button type="button" data-wall-form="rounded" title="Join nearby wall tiles with clean rounded corners.">Rounded</button>
      <button type="button" data-wall-form="organic" title="Create visibly irregular flowing hedge, cave or natural wall edges.">Organic</button>
    </div>
    <p id="wall-form-status">Blocks preserves the square-tile preview.</p>
  `;
  hint.insertAdjacentElement('afterend', card);
  card.querySelectorAll('[data-wall-form]').forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.wallForm));
  });
  const currentState = state();
  if (currentState) currentState.wallRenderMode = currentState.wallRenderMode || 'blocks';
  syncControls();
}

function setMode(mode) {
  const currentState = state();
  if (!currentState || !['blocks', 'rounded', 'organic'].includes(mode)) return;
  currentState.wallRenderMode = mode;
  rendererState.panX = 0;
  rendererState.panY = 0;
  $('btn-zoom-reset')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  syncControls();
  if (mode === 'blocks') {
    stopTimer();
    hideOverlay();
    window.__artifexMazeRuntimeControls?.repaintAll?.();
    return;
  }
  startTimer();
  renderWallFormPreview();
}

function syncControls() {
  const currentState = state();
  const mode = currentState?.wallRenderMode || 'blocks';
  document.querySelectorAll('[data-wall-form]').forEach((button) => button.classList.toggle('is-active', button.dataset.wallForm === mode));
  const status = $('wall-form-status');
  if (!status) return;
  status.textContent = mode === 'organic'
    ? 'Organic makes the wall masses uneven and flowing; Warp increases the natural distortion.'
    : mode === 'rounded'
      ? 'Rounded joins wall tiles into clean softened corridor edges.'
      : 'Blocks preserves the square-tile preview.';
}

function ensureOverlay() {
  const wrap = $('threejs-container');
  if (!wrap) return null;
  let canvas = $('maze-wall-form-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'maze-wall-form-canvas';
    canvas.className = 'maze-wall-form-overlay';
    wrap.appendChild(canvas);
  }
  return canvas;
}

function hideOverlay() {
  const overlay = $('maze-wall-form-canvas');
  if (overlay) overlay.hidden = true;
}

function startTimer() {
  if (rendererState.timer) return;
  rendererState.timer = window.setInterval(() => {
    if (activeMode()) renderWallFormPreview();
    else if (state()?.view === '3d') hideOverlay();
  }, 33);
}

function stopTimer() {
  if (!rendererState.timer) return;
  window.clearInterval(rendererState.timer);
  rendererState.timer = null;
}

function bindPanMirror() {
  const surface = document.querySelector('.render-viewport') || $('threejs-container');
  if (!surface) return;
  surface.addEventListener('mousedown', (event) => {
    if (event.button !== 1 && event.button !== 2) return;
    rendererState.dragging = true;
    rendererState.lastX = event.clientX;
    rendererState.lastY = event.clientY;
  }, true);
  window.addEventListener('mousemove', (event) => {
    if (!rendererState.dragging) return;
    rendererState.panX += event.clientX - rendererState.lastX;
    rendererState.panY += event.clientY - rendererState.lastY;
    rendererState.lastX = event.clientX;
    rendererState.lastY = event.clientY;
    renderWallFormPreview();
  }, true);
  window.addEventListener('mouseup', () => { rendererState.dragging = false; }, true);
  $('btn-zoom-reset')?.addEventListener('click', () => {
    rendererState.panX = 0;
    rendererState.panY = 0;
    renderWallFormPreview();
  }, true);
}

function bindRenderTriggers() {
  ['warp-slider', 'wall-height-slider', 'stretch-x-slider', 'stretch-y-slider', 'layout-style-slider', 'grid-slider', 'target-color-picker'].forEach((id) => {
    $(id)?.addEventListener('input', scheduleRender, true);
    $(id)?.addEventListener('change', scheduleRender, true);
  });
  ['btn-random', 'btn-start-blank', 'btn-clear-all', 'btn-load-reference', 'view-mode-diorama', 'view-mode-fps', 'view-mode-3d', 'btn-zoom-in', 'btn-zoom-out'].forEach((id) => {
    $(id)?.addEventListener('click', () => window.setTimeout(() => {
      if (activeMode()) renderWallFormPreview();
      else hideOverlay();
    }, 20), true);
  });
  window.addEventListener('resize', scheduleRender);
}

function scheduleRender() {
  if (!activeMode()) return;
  window.requestAnimationFrame(renderWallFormPreview);
}

function renderWallFormPreview() {
  const currentState = state();
  const wrap = $('threejs-container');
  if (!currentState || !wrap || !currentState.matrix?.length || !activeMode()) {
    if (currentState?.wallRenderMode === 'blocks' || currentState?.view === '3d') hideOverlay();
    return;
  }
  const canvas = ensureOverlay();
  if (!canvas) return;
  canvas.hidden = false;
  const rect = wrap.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const ratio = window.devicePixelRatio || 1;
  const pxWidth = Math.max(1, Math.round(rect.width * ratio));
  const pxHeight = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== pxWidth || canvas.height !== pxHeight) {
    canvas.width = pxWidth;
    canvas.height = pxHeight;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = currentState.style?.roof?.color || '#031009';
  ctx.fillRect(0, 0, rect.width, rect.height);
  const dims = dimensions(rect.width, rect.height, currentState);
  ctx.save();
  ctx.translate(dims.ox + rendererState.panX, dims.oy + rendererState.panY);
  drawFloorSurface(ctx, currentState, dims);
  drawJoinedWalls(ctx, currentState, dims);
  drawSolution(ctx, currentState, dims);
  drawConnections(ctx, currentState, dims);
  drawCollectionItems(ctx, currentState, dims);
  drawMarker(ctx, currentState, dims, currentState.start, '#d65f55');
  drawMarker(ctx, currentState, dims, currentState.exit, '#8ee6dc');
  if (currentState.view === 'walktest') drawMarker(ctx, currentState, dims, { x: Math.floor(currentState.player.x), y: Math.floor(currentState.player.y) }, '#f3dcaa');
  ctx.restore();
}

function dimensions(width, height, currentState) {
  const scaleX = Math.max(0.6, Number(currentState.stretchX || 100) / 100);
  const scaleY = Math.max(0.6, Number(currentState.stretchY || 100) / 100);
  const base = Math.min(width / (currentState.gridSize * scaleX + 3), height / (currentState.gridSize * scaleY + 3)) * Number(currentState.zoom || 1);
  const cellW = base * scaleX;
  const cellH = base * scaleY;
  return { cellW, cellH, ox: width / 2 - currentState.gridSize * cellW / 2, oy: height / 2 - currentState.gridSize * cellH / 2 };
}

function warpedPoint(x, y, dims, currentState) {
  let px = x * dims.cellW;
  let py = y * dims.cellH;
  const warp = Number(currentState.warp || 0) / 100;
  if (warp) {
    px += Math.sin(y * 1.37 + x * 0.31) * dims.cellW * 0.42 * warp;
    py += Math.cos(x * 1.21 + y * 0.27) * dims.cellH * 0.42 * warp;
  }
  return { x: px, y: py };
}

function cellCentre(x, y, dims, currentState) {
  const point = warpedPoint(x, y, dims, currentState);
  return { x: point.x + dims.cellW / 2, y: point.y + dims.cellH / 2 };
}

function organicWallCentre(x, y, dims, currentState) {
  const point = cellCentre(x, y, dims, currentState);
  const minCell = Math.min(dims.cellW, dims.cellH);
  const warp = Number(currentState.warp || 0) / 100;
  const strength = minCell * (0.10 + warp * 0.42);
  const wideDrift = minCell * warp * 0.14;
  return {
    x: point.x + (seedNoise(x, y, 3) - 0.5) * 2 * strength + Math.sin(y * 0.56 + x * 0.19) * wideDrift,
    y: point.y + (seedNoise(x, y, 8) - 0.5) * 2 * strength + Math.cos(x * 0.48 + y * 0.17) * wideDrift
  };
}

function isVisibleCell(currentState, x, y) {
  return x >= 0 && y >= 0 && x < currentState.gridSize && y < currentState.gridSize && isInsideShape(x, y, currentState.gridSize, currentState.layout, currentState.stretchX, currentState.stretchY);
}

function isWall(currentState, x, y) {
  return isVisibleCell(currentState, x, y) && currentState.matrix[y]?.[x] === 1;
}

function drawFloorSurface(ctx, currentState, dims) {
  ctx.fillStyle = currentState.style?.floor?.color || '#7b5a32';
  for (let y = 0; y < currentState.gridSize; y++) {
    for (let x = 0; x < currentState.gridSize; x++) {
      if (!isVisibleCell(currentState, x, y)) continue;
      const point = warpedPoint(x, y, dims, currentState);
      ctx.fillRect(point.x - 1, point.y - 1, dims.cellW + 2, dims.cellH + 2);
    }
  }
}

function drawJoinedWalls(ctx, currentState, dims) {
  const organic = currentState.wallRenderMode === 'organic';
  const minCell = Math.min(dims.cellW, dims.cellH);
  const warp = Number(currentState.warp || 0) / 100;
  const width = minCell * (organic ? 0.80 + warp * 0.12 : 0.90);
  const depth = minCell * (0.08 + Number(currentState.wallHeight || 1.5) * 0.07);
  const wallColor = currentState.style?.walls?.color || '#24513a';
  const shadowColor = shade(wallColor, -0.28);
  ctx.save();
  ctx.translate(0, depth);
  drawWallNetwork(ctx, currentState, dims, organic, width + minCell * (organic ? 0.20 : 0.12), shadowColor, warp);
  ctx.restore();
  drawWallNetwork(ctx, currentState, dims, organic, width, wallColor, warp);
  ctx.save();
  ctx.globalAlpha = organic ? 0.23 : 0.16;
  drawWallNetwork(ctx, currentState, dims, organic, Math.max(1.4, width * (organic ? 0.12 : 0.10)), '#eaffde', warp);
  ctx.restore();
}

function drawWallNetwork(ctx, currentState, dims, organic, width, color, warp) {
  const minCell = Math.min(dims.cellW, dims.cellH);
  const wallPoint = (x, y) => organic ? organicWallCentre(x, y, dims, currentState) : cellCentre(x, y, dims, currentState);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let y = 0; y < currentState.gridSize; y++) {
    for (let x = 0; x < currentState.gridSize; x++) {
      if (!isWall(currentState, x, y)) continue;
      const start = wallPoint(x, y);
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        if (!isWall(currentState, x + dx, y + dy)) continue;
        const end = wallPoint(x + dx, y + dy);
        ctx.moveTo(start.x, start.y);
        if (organic) {
          const bend = (seedNoise(x, y, 14 + dx + dy) - 0.5) * 2 * minCell * (0.18 + warp * 0.48);
          const midX = (start.x + end.x) / 2 + (dy ? bend : 0);
          const midY = (start.y + end.y) / 2 + (dx ? bend : 0);
          ctx.quadraticCurveTo(midX, midY, end.x, end.y);
        } else {
          ctx.lineTo(end.x, end.y);
        }
      }
    }
  }
  ctx.stroke();
  ctx.beginPath();
  for (let y = 0; y < currentState.gridSize; y++) {
    for (let x = 0; x < currentState.gridSize; x++) {
      if (!isWall(currentState, x, y)) continue;
      const point = wallPoint(x, y);
      const radiusScale = organic ? 0.86 + seedNoise(x, y, 21) * 0.30 + warp * 0.08 : 1;
      const radius = width / 2 * radiusScale;
      ctx.moveTo(point.x + radius, point.y);
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    }
  }
  ctx.fill();
}

function drawSolution(ctx, currentState, dims) {
  if (!currentState.solution?.length) return;
  ctx.strokeStyle = '#8ee6dc';
  ctx.lineWidth = Math.max(2, Math.min(dims.cellW, dims.cellH) * 0.24);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  currentState.solution.forEach((cell, index) => {
    const point = cellCentre(cell.x, cell.y, dims, currentState);
    index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y);
  });
  ctx.stroke();
}

function drawConnections(ctx, currentState, dims) {
  const pairs = window.__artifexMazeConnections?.pairs || [];
  pairs.forEach((pair) => {
    const colors = pair.type === 'portal' ? ['#b58cff', '#87dfff'] : ['#f1cf75', '#e1c073'];
    if (pair.entry) drawLetterMarker(ctx, dims, pair.entry, colors[0], pair.label, 'I', currentState);
    if (pair.exit) drawLetterMarker(ctx, dims, pair.exit, colors[1], pair.label, 'O', currentState);
  });
}

function drawCollectionItems(ctx, currentState, dims) {
  const items = window.__artifexMazeFeatures?.collectionItems?.() || [];
  items.forEach((item, index) => {
    if (item.cell) drawLetterMarker(ctx, dims, item.cell, '#e1c073', String(index + 1), '', currentState);
  });
}

function drawLetterMarker(ctx, dims, cell, color, label, suffix, currentState) {
  const point = cellCentre(cell.x, cell.y, dims, currentState);
  const radius = Math.max(7, Math.min(dims.cellW, dims.cellH) * 0.4);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#06140b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#06140b';
  ctx.font = `900 ${Math.max(8, radius * 0.82)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label}${suffix}`, point.x, point.y + 0.5);
}

function drawMarker(ctx, currentState, dims, cell, color) {
  if (!cell) return;
  const point = cellCentre(cell.x, cell.y, dims, currentState);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, Math.max(4, Math.min(dims.cellW, dims.cellH) * 0.35), 0, Math.PI * 2);
  ctx.fill();
}

function seedNoise(x, y, salt) {
  const value = Math.sin((x + 1) * 92.31 + (y + 3) * 47.17 + salt * 11.41) * 43758.5453;
  return value - Math.floor(value);
}

function shade(hex, amount) {
  const cleaned = String(hex).replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(cleaned)) return '#11251a';
  const values = [0, 2, 4].map((index) => parseInt(cleaned.slice(index, index + 2), 16));
  return `rgb(${values.map((value) => Math.max(0, Math.min(255, Math.round(value * (1 + amount))))).join(',')})`;
}

function patchExportPayload() {
  window.setTimeout(() => {
    const previous = window.__artifexAugmentPuzzlePayload;
    window.__artifexAugmentPuzzlePayload = (payload) => {
      const base = typeof previous === 'function' ? previous(payload) : payload;
      const mode = state()?.wallRenderMode || 'blocks';
      return {
        ...base,
        puzzle: {
          ...base.puzzle,
          visualRendering: { ...(base.puzzle?.visualRendering || {}), wallForm: mode }
        }
      };
    };
  }, 0);
}

function injectStyles() {
  if ($('maze-organic-wall-renderer-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-organic-wall-renderer-style';
  style.textContent = `
    .threejs-container{position:relative;}
    .maze-wall-form-overlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;}
    .maze-wall-form-card{display:grid;gap:9px;margin:11px 0 15px;padding:11px;border:1px solid rgba(158,230,164,.18);border-radius:14px;background:rgba(0,0,0,.16);}
    .wall-form-copy strong{display:block;color:#eadfc6;font-size:.78rem;}
    .wall-form-copy small{display:block;color:#a9b59e;margin-top:3px;font-size:.64rem;line-height:1.35;}
    .wall-form-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
    .wall-form-buttons button{min-height:33px;padding:4px;border-radius:9px;border:1px solid rgba(158,230,164,.22);background:rgba(12,54,28,.58);color:#eadfc6;font-size:.65rem;font-weight:900;}
    .wall-form-buttons button.is-active{border-color:rgba(158,230,164,.56);background:rgba(50,113,64,.68);color:#dff8d8;box-shadow:0 0 15px rgba(158,230,164,.11);}
    #wall-form-status{margin:0;color:#a9b59e;font-size:.62rem;line-height:1.35;}
  `;
  document.head.appendChild(style);
}
