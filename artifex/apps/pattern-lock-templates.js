// Maze / Labyrinth runtime status and maker solution display
// Owns triangle lockout, live route analysis, difficulty auto-regeneration and maker-only solution visibility.

import { SHAPES, isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
let difficultyDebounce = null;
const displayState = { showSolution: true };

window.__artifexMazeSolutionDisplay = displayState;

window.addEventListener('DOMContentLoaded', () => {
  injectRuntimeStatusStyles();
  disableTriangleUntilSolverExists();
  ensureDifficultyStatusBox();
  configureSolutionControls();
  installDifficultyAutoRegenerate();
  installStatusRefreshHooks();
  setTimeout(() => refreshSolutionDisplay(true), 360);
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
      if ($('layout-style-val')) $('layout-style-val').textContent = 'Square';
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
  box.innerHTML = '<strong>Solution</strong><span>Generate a maze to calculate the route.</span>';
  label?.insertAdjacentElement('afterend', box);
}

function configureSolutionControls() {
  $('btn-apply-difficulty')?.remove();
  const solve = $('btn-solve');
  const grid = solve?.closest('.button-grid');
  if (!solve) return;
  solve.textContent = 'Hide Solution';
  solve.title = 'Show or hide the maker-only solution route on the editor map.';
  grid?.classList.add('solution-toggle-row');
  document.addEventListener('click', (event) => {
    if (!event.target?.closest?.('#btn-solve')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    displayState.showSolution = !displayState.showSolution;
    refreshSolutionDisplay(false);
  }, true);
}

function installDifficultyAutoRegenerate() {
  const slider = $('difficulty-slider');
  if (!slider) return;
  const regenerate = () => {
    clearTimeout(difficultyDebounce);
    difficultyDebounce = setTimeout(() => {
      const currentState = state();
      if (!currentState || currentState.blankStarted) {
        refreshSolutionDisplay(false);
        return;
      }
      document.querySelector('[data-force-regenerate="logic"]')?.click();
      setTimeout(() => refreshSolutionDisplay(true), 280);
    }, 260);
  };
  slider.addEventListener('input', regenerate, true);
  slider.addEventListener('change', regenerate, true);
}

function installStatusRefreshHooks() {
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('#btn-random, #btn-load-reference, #btn-start-blank, #btn-clear-all, [data-force-regenerate]')) {
      setTimeout(() => refreshSolutionDisplay(true), 360);
    }
  }, true);
  ['grid-slider', 'layout-style-slider', 'stretch-x-slider', 'stretch-y-slider', 'warp-slider', 'edge-style-slider'].forEach((id) => {
    $(id)?.addEventListener('change', () => setTimeout(() => refreshSolutionDisplay(true), 360), true);
  });
}

function refreshSolutionDisplay(recalculateRoute) {
  const box = $('difficulty-status-box');
  const currentState = state();
  if (!box || !currentState?.matrix?.length) return;
  if (Number(currentState.layout) < 1) {
    box.innerHTML = '<strong>Solution</strong><span>Triangle is disabled until its route solver is reliable.</span>';
    return;
  }
  const route = findPath(currentState, currentState.start, currentState.exit);
  if (recalculateRoute || displayState.showSolution) currentState.solution = displayState.showSolution ? route : [];
  if (!displayState.showSolution) currentState.solution = [];
  window.__artifexMazeRuntimeControls?.repaintAll?.();

  const difficulty = Number(currentState.difficulty || $('difficulty-slider')?.value || 3);
  const targetRoutes = 6 - difficulty;
  const branches = countBranchCells(currentState);
  const deadEnds = countDeadEnds(currentState);
  const shape = SHAPES[currentState.layout] || 'Square';
  const solutionLabel = displayState.showSolution ? 'visible to maker' : 'hidden';
  const solve = $('btn-solve');
  if (solve) solve.textContent = displayState.showSolution ? 'Hide Solution' : 'Show Solution';

  if (!route.length) {
    box.innerHTML = `<strong>Solution</strong><div class="solution-grid"><span>Shape</span><b>${escapeHtml(shape)}</b><span>Route exists</span><b>No</b></div><small>No valid entrance-to-exit route yet. Regenerate or draw a path.</small>`;
    return;
  }
  box.innerHTML = `
    <strong>Solution</strong>
    <div class="solution-grid">
      <span>Difficulty</span><b>${difficulty}</b>
      <span>Target routes</span><b>${targetRoutes}</b>
      <span>Route exists</span><b>Yes</b>
      <span>Minimum path</span><b>${route.length} cells</b>
      <span>Branch cells</span><b>${branches}</b>
      <span>Dead ends</span><b>${deadEnds}</b>
      <span>Route overlay</span><b>${solutionLabel}</b>
    </div>
    <small>Meaningful alternate-route matching is still a later algorithm pass.</small>`;
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
  for (let y = 0; y < currentState.gridSize; y++) for (let x = 0; x < currentState.gridSize; x++) {
    if (isOpenCell(currentState, x, y) && countOpenNeighbours(currentState, x, y) >= 3) count++;
  }
  return count;
}

function countDeadEnds(currentState) {
  let count = 0;
  for (let y = 0; y < currentState.gridSize; y++) for (let x = 0; x < currentState.gridSize; x++) {
    if (isOpenCell(currentState, x, y) && countOpenNeighbours(currentState, x, y) === 1) count++;
  }
  return Math.max(0, count - 2);
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
    .difficulty-status-box{margin:8px 0 10px;padding:11px 12px;border:1px solid rgba(158,230,164,.24);border-radius:14px;background:linear-gradient(180deg,rgba(8,32,17,.82),rgba(4,18,10,.9));}
    .difficulty-status-box>strong{display:block;margin:0 0 7px;color:var(--green2,#9ee6a4);font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;}
    .solution-grid{display:grid;grid-template-columns:1fr auto;gap:4px 10px;color:#b3c0a7;font-size:.68rem;line-height:1.3;}
    .solution-grid b{color:#e5dcc5;text-align:right;font-weight:700;}
    .difficulty-status-box small{display:block;color:#a9b59e;font-size:.62rem;line-height:1.35;margin-top:8px;}
    .solution-toggle-row{display:block!important;margin:7px 0 12px!important;}
    .solution-toggle-row #btn-solve{width:100%;font-size:.73rem!important;min-height:34px!important;}
  `;
  document.head.appendChild(style);
}
