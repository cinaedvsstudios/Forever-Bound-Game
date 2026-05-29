// Maze / Labyrinth runtime status
//
// Stable replacement for the former V1.13 polish patch.
// Owns triangle lockout, solution status text, and difficulty auto-regeneration.

import { SHAPES, isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
let difficultyDebounce = null;

window.addEventListener('DOMContentLoaded', () => {
  injectRuntimeStatusStyles();
  disableTriangleUntilSolverExists();
  ensureDifficultyStatusBox();
  installDifficultyAutoRegenerate();
  installStatusRefreshHooks();
  setTimeout(updateDifficultyStatus, 350);
});

function state() {
  return window.__artifexMazeRuntime?.state || null;
}

function disableTriangleUntilSolverExists() {
  const slider = $('layout-style-slider');
  if (!slider) return;
  slider.min = '1';
  if (Number(slider.value) < 1) slider.value = '1';

  const correct = () => {
    const currentState = state();
    if (Number(slider.value) < 1) slider.value = '1';
    if (currentState && Number(currentState.layout) < 1) {
      currentState.layout = 1;
      slider.value = '1';
      const output = $('layout-style-val');
      if (output) output.textContent = 'Square';
      setTimeout(() => document.querySelector('[data-force-regenerate="display"]')?.click(), 50);
    }
  };

  slider.addEventListener('input', correct, true);
  slider.addEventListener('change', correct, true);
  setTimeout(correct, 200);
}

function ensureDifficultyStatusBox() {
  const difficultySlider = $('difficulty-slider');
  if (!difficultySlider || $('difficulty-status-box')) return;
  const label = difficultySlider.closest('.range-row');
  const box = document.createElement('div');
  box.id = 'difficulty-status-box';
  box.className = 'difficulty-status-box';
  box.innerHTML = '<strong>Solution</strong><span>Generate a maze to calculate the minimum route.</span>';
  label?.insertAdjacentElement('afterend', box);
}

function installDifficultyAutoRegenerate() {
  const slider = $('difficulty-slider');
  if (!slider) return;

  const regenerate = () => {
    clearTimeout(difficultyDebounce);
    difficultyDebounce = setTimeout(() => {
      const currentState = state();
      if (!currentState || currentState.blankStarted) {
        updateDifficultyStatus();
        return;
      }
      document.querySelector('[data-force-regenerate="logic"]')?.click();
      setTimeout(updateDifficultyStatus, 280);
    }, 260);
  };

  slider.addEventListener('input', regenerate, true);
  slider.addEventListener('change', regenerate, true);
}

function installStatusRefreshHooks() {
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('#btn-random, #btn-load-reference, #btn-start-blank, #btn-clear-all, #btn-solve, [data-force-regenerate]')) {
      setTimeout(updateDifficultyStatus, 360);
    }
  }, true);

  ['grid-slider', 'layout-style-slider', 'stretch-x-slider', 'stretch-y-slider', 'warp-slider', 'edge-style-slider'].forEach((id) => {
    $(id)?.addEventListener('change', () => setTimeout(updateDifficultyStatus, 360), true);
  });

  window.addEventListener('artifex-preview-redrawn', () => setTimeout(updateDifficultyStatus, 50));
}

function updateDifficultyStatus() {
  const box = $('difficulty-status-box');
  const currentState = state();
  if (!box || !currentState?.matrix?.length) return;

  if (Number(currentState.layout) < 1) {
    box.innerHTML = '<strong>Solution</strong><span>Triangle is disabled until the route solver supports it. Choose another shape.</span>';
    return;
  }

  const route = findPath(currentState, currentState.start, currentState.exit);
  const difficulty = Number(currentState.difficulty || $('difficulty-slider')?.value || 3);
  const targetRoutes = 6 - difficulty;
  const branchCells = countBranchCells(currentState);
  const shape = SHAPES[currentState.layout] || 'Square';

  if (!route.length) {
    box.innerHTML = `<strong>Solution</strong><span>${escapeHtml(shape)} · no valid entrance-to-exit route yet. Regenerate or draw a path.</span>`;
    return;
  }

  box.innerHTML = `<strong>Solution</strong><span>${escapeHtml(shape)} · minimum route ${route.length} squares · target ${targetRoutes} meaningful route${targetRoutes === 1 ? '' : 's'} · ${branchCells} branch cells</span>`;
}

function findPath(currentState, start, exit) {
  if (!start || !exit) return [];
  const queue = [[start]];
  const seen = new Set([key(start)]);

  while (queue.length) {
    const path = queue.shift();
    const point = path[path.length - 1];
    if (point.x === exit.x && point.y === exit.y) return path;

    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { x: point.x + dx, y: point.y + dy };
      if (seen.has(key(next)) || !isOpenCell(currentState, next.x, next.y)) continue;
      seen.add(key(next));
      queue.push([...path, next]);
    }
  }

  return [];
}

function isOpenCell(currentState, x, y) {
  return x >= 0 && y >= 0 && x < currentState.gridSize && y < currentState.gridSize && currentState.matrix[y]?.[x] === 0 && isInsideShape(x, y, currentState.gridSize, currentState.layout, currentState.stretchX, currentState.stretchY);
}

function countOpenNeighbours(currentState, x, y) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => isOpenCell(currentState, x + dx, y + dy)).length;
}

function countBranchCells(currentState) {
  let count = 0;
  for (let y = 0; y < currentState.gridSize; y++) {
    for (let x = 0; x < currentState.gridSize; x++) {
      if (isOpenCell(currentState, x, y) && countOpenNeighbours(currentState, x, y) >= 3) count++;
    }
  }
  return count;
}

function key(point) { return `${point.x},${point.y}`; }

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function injectRuntimeStatusStyles() {
  if ($('maze-runtime-status-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-runtime-status-style';
  style.textContent = `
    .difficulty-status-box{margin:8px 0 14px;padding:12px 13px;border:1px solid rgba(158,230,164,.24);border-radius:16px;background:linear-gradient(180deg,rgba(8,32,17,.82),rgba(4,18,10,.9));box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);}
    .difficulty-status-box strong{display:block;margin:0 0 4px;color:var(--green2,#9ee6a4);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;}
    .difficulty-status-box span{display:block;color:#d8d0ba;font-size:.84rem;line-height:1.35;}
  `;
  document.head.appendChild(style);
}
