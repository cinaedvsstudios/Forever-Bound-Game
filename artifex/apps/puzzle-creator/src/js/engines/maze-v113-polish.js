import { SHAPES, isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);
let difficultyDebounce = null;

window.addEventListener('DOMContentLoaded', () => {
  injectPolishStyles();
  disableTriangleForNow();
  installDifficultyStatusBox();
  installDifficultyAutoRegenerate();
  installStatusRefreshHooks();
  setTimeout(updateDifficultyStatus, 350);
});

function state() {
  return window.__artifexMazeRuntime?.state || null;
}

function disableTriangleForNow() {
  const slider = $('layout-style-slider');
  if (!slider) return;
  slider.min = '1';
  if (Number(slider.value) < 1) slider.value = '1';
  const label = slider.closest('.range-row');
  if (label && !label.querySelector('.triangle-disabled-note')) {
    const note = document.createElement('small');
    note.className = 'triangle-disabled-note';
    note.textContent = 'Triangle is disabled for now because its route solving is unreliable. Square, Pentagon, Hexagon, and Circle remain active.';
    label.appendChild(note);
  }
  const correct = () => {
    const s = state();
    if (Number(slider.value) < 1) slider.value = '1';
    if (s && Number(s.layout) < 1) {
      s.layout = 1;
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

function installDifficultyStatusBox() {
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
      const s = state();
      if (!s || s.blankStarted) {
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
  const s = state();
  if (!box || !s?.matrix?.length) return;
  if (Number(s.layout) < 1) {
    box.innerHTML = '<strong>Solution</strong><span>Triangle is disabled for now. Choose another shape.</span>';
    return;
  }
  const route = findPath(s, s.start, s.exit);
  const difficulty = Number(s.difficulty || $('difficulty-slider')?.value || 3);
  const targetRoutes = 6 - difficulty;
  const branchCells = countBranchCells(s);
  const shape = SHAPES[s.layout] || 'Square';
  if (!route.length) {
    box.innerHTML = `<strong>Solution</strong><span>${escapeHtml(shape)} · no valid entrance-to-exit route yet. Regenerate or draw a path.</span>`;
    return;
  }
  box.innerHTML = `<strong>Solution</strong><span>${escapeHtml(shape)} · minimum route ${route.length} squares · target ${targetRoutes} meaningful route${targetRoutes === 1 ? '' : 's'} · ${branchCells} branch cells</span>`;
}

function findPath(s, start, exit) {
  if (!start || !exit) return [];
  const queue = [[start]];
  const seen = new Set([key(start)]);
  while (queue.length) {
    const path = queue.shift();
    const p = path[path.length - 1];
    if (p.x === exit.x && p.y === exit.y) return path;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = { x: p.x + dx, y: p.y + dy };
      if (seen.has(key(next)) || !isOpenCell(s, next.x, next.y)) continue;
      seen.add(key(next));
      queue.push([...path, next]);
    }
  }
  return [];
}

function isOpenCell(s, x, y) {
  return x >= 0 && y >= 0 && x < s.gridSize && y < s.gridSize && s.matrix[y]?.[x] === 0 && isInsideShape(x, y, s.gridSize, s.layout, s.stretchX, s.stretchY);
}

function countOpenNeighbours(s, x, y) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => isOpenCell(s, x + dx, y + dy)).length;
}

function countBranchCells(s) {
  let count = 0;
  for (let y = 0; y < s.gridSize; y++) {
    for (let x = 0; x < s.gridSize; x++) {
      if (isOpenCell(s, x, y) && countOpenNeighbours(s, x, y) >= 3) count++;
    }
  }
  return count;
}

function key(p) { return `${p.x},${p.y}`; }
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function injectPolishStyles() {
  if ($('maze-v113-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'maze-v113-polish-style';
  style.textContent = `
    .triangle-disabled-note{color:#b8b8aa!important;border:1px solid rgba(190,190,170,.22);border-radius:12px;padding:7px 9px;background:rgba(0,0,0,.18);}
    .difficulty-status-box{margin:8px 0 14px;padding:12px 13px;border:1px solid rgba(158,230,164,.24);border-radius:16px;background:linear-gradient(180deg,rgba(8,32,17,.82),rgba(4,18,10,.9));box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);}
    .difficulty-status-box strong{display:block;margin:0 0 4px;color:var(--green2,#9ee6a4);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;}
    .difficulty-status-box span{display:block;color:#d8d0ba;font-size:.84rem;line-height:1.35;}
  `;
  document.head.appendChild(style);
}
