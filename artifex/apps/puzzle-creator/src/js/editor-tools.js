import { state, runtime, resetPaintMatrices } from './state.js';
import { redrawAnalysisCanvas } from './maze-parser.js';
import { showToast } from './dom.js';

export function setTool(tool) {
  state.currentTool = tool;
  document.querySelectorAll('.tool-button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tool === tool);
  });
}

export function paintCell(row, col) {
  if (!isValidCell(row, col) || state.mazeMatrix[row][col] !== 1) return;
  state.colorMatrix[row][col] = state.brushColor;
  state.textureMatrix[row][col] = null;
  runtime.rendererApi?.repaintCell(row, col);
  redrawAnalysisCanvas();
}

export function paintSection(row, col) {
  if (!isValidCell(row, col) || state.mazeMatrix[row][col] !== 1) return;
  const directions = [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]];
  directions.forEach(([dy, dx]) => {
    let y = row + dy;
    let x = col + dx;
    while (isValidCell(y, x) && state.mazeMatrix[y][x] === 1) {
      state.colorMatrix[y][x] = state.brushColor;
      state.textureMatrix[y][x] = null;
      runtime.rendererApi?.repaintCell(y, x);
      if (dy === 0 && dx === 0) break;
      y += dy;
      x += dx;
    }
  });
  redrawAnalysisCanvas();
}

export function toggleCell(row, col, target = null) {
  if (!isValidCell(row, col)) return;
  const next = target === null ? (state.mazeMatrix[row][col] === 1 ? 0 : 1) : target;
  state.mazeMatrix[row][col] = next;
  if (next === 0) {
    state.colorMatrix[row][col] = null;
    state.textureMatrix[row][col] = null;
  }
  state.solutionPath = [];
  runtime.rendererApi?.rebuild();
  redrawAnalysisCanvas();
}

export function clearPaint() {
  resetPaintMatrices();
  runtime.rendererApi?.rebuild();
  redrawAnalysisCanvas();
  showToast('Paint overrides cleared.');
}

export function apply2DPointer(event, continuous = false) {
  if (state.currentTool === 'camera') return;
  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const point = event.touches?.[0] || event;
  const size = state.mazeMatrix.length;
  const col = Math.floor(((point.clientX - rect.left) / rect.width) * size);
  const row = Math.floor(((point.clientY - rect.top) / rect.height) * size);

  if (state.currentTool === 'paint') paintCell(row, col);
  if (state.currentTool === 'paintSection' && !continuous) paintSection(row, col);
  if (state.currentTool === 'toggle') {
    const target = continuous ? runtime.pointer.lastToggleTarget : (state.mazeMatrix[row]?.[col] === 1 ? 0 : 1);
    runtime.pointer.lastToggleTarget = target;
    toggleCell(row, col, target);
  }
}

export function apply3DPointer(event, continuous = false) {
  if (state.currentTool === 'camera' || state.currentViewMode === 'walk') return;
  const hit = runtime.rendererApi?.raycastFromEvent(event);
  if (!hit) return;

  if (state.currentTool === 'paint' && hit.kind === 'wall') paintCell(hit.row, hit.col);
  if (state.currentTool === 'paintSection' && hit.kind === 'wall' && !continuous) paintSection(hit.row, hit.col);
  if (state.currentTool === 'toggle') {
    const target = continuous ? runtime.pointer.lastToggleTarget : (hit.kind === 'wall' ? 0 : 1);
    runtime.pointer.lastToggleTarget = target;
    toggleCell(hit.row, hit.col, target);
  }
}

function isValidCell(row, col) {
  const size = state.mazeMatrix.length;
  return Number.isInteger(row) && Number.isInteger(col) && row >= 0 && col >= 0 && row < size && col < size;
}
