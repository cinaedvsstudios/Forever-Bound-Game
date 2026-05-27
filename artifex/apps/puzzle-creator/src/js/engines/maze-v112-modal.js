import { SHAPES, isInsideShape } from './maze-shape-generator.js';

const $ = (id) => document.getElementById(id);

window.addEventListener('DOMContentLoaded', () => {
  injectModalStyle();
  ensureModal();
  interceptDifficultyReport();
});

function interceptDifficultyReport() {
  window.addEventListener('click', (event) => {
    const button = event.target?.closest?.('#btn-apply-difficulty');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showDifficultyReport();
  }, true);
}

function runtimeState() {
  return window.__artifexMazeRuntime?.state || null;
}

function showDifficultyReport() {
  const state = runtimeState();
  if (!state?.matrix?.length) {
    showBrandedModal({
      eyebrow: 'Maze Analysis',
      title: 'Difficulty Report',
      body: '<p>No maze exists yet. Generate or draw a maze before analysing difficulty.</p>',
      actions: [{ label: 'OK', kind: 'primary', action: closeBrandedModal }]
    });
    return;
  }

  const route = findPath(state, state.start, state.exit);
  const targetRoutes = 6 - Number(state.difficulty || 3);
  const branches = countBranchCells(state);
  const deadEnds = countDeadEnds(state);
  const shapeName = SHAPES[state.layout] || 'Square';
  const status = route.length ? 'yes' : 'no';
  const note = route.length
    ? 'Regenerate currently uses the difficulty setting as a basic influence: higher difficulty keeps fewer loop-openings, lower difficulty opens more alternate connectors. Full meaningful-route counting is still queued.'
    : 'No valid entrance-to-exit route exists yet. Use Regenerate, Clear All, or draw a route before analysing difficulty.';

  showBrandedModal({
    eyebrow: 'Maze Analysis',
    title: 'Difficulty Report',
    body: `
      <div class="artifex-modal-grid">
        <span>Shape</span><strong>${escapeHtml(shapeName)}</strong>
        <span>Target difficulty</span><strong>${state.difficulty}</strong>
        <span>Target meaningful routes</span><strong>${targetRoutes}</strong>
        <span>Route exists</span><strong>${status}</strong>
        <span>Main route length</span><strong>${route.length ? `${route.length} cells` : '—'}</strong>
        <span>Branch cells</span><strong>${branches}</strong>
        <span>Dead ends</span><strong>${deadEnds}</strong>
      </div>
      <p>${escapeHtml(note)}</p>
    `,
    actions: [
      { label: 'Regenerate', kind: 'secondary', action: () => { closeBrandedModal(); $('btn-random')?.click(); } },
      { label: 'OK', kind: 'primary', action: closeBrandedModal }
    ]
  });
}

function ensureModal() {
  if ($('artifex-modal-root')) return;
  const root = document.createElement('div');
  root.id = 'artifex-modal-root';
  root.className = 'artifex-modal-root is-hidden';
  root.innerHTML = `
    <div class="artifex-modal-backdrop" data-modal-close></div>
    <section class="artifex-modal-card" role="dialog" aria-modal="true" aria-labelledby="artifex-modal-title">
      <div class="artifex-modal-header">
        <div>
          <p id="artifex-modal-eyebrow" class="artifex-modal-eyebrow">Report</p>
          <h2 id="artifex-modal-title">Report</h2>
        </div>
        <button id="artifex-modal-close" type="button" aria-label="Close">×</button>
      </div>
      <div id="artifex-modal-body" class="artifex-modal-body"></div>
      <div id="artifex-modal-actions" class="artifex-modal-actions"></div>
    </section>
  `;
  document.body.appendChild(root);
  root.addEventListener('click', (event) => {
    if (event.target.matches('[data-modal-close], #artifex-modal-close')) closeBrandedModal();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !root.classList.contains('is-hidden')) closeBrandedModal();
  });
}

function showBrandedModal({ eyebrow, title, body, actions }) {
  ensureModal();
  $('artifex-modal-eyebrow').textContent = eyebrow;
  $('artifex-modal-title').textContent = title;
  $('artifex-modal-body').innerHTML = body;
  const actionsBox = $('artifex-modal-actions');
  actionsBox.innerHTML = '';
  actions.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `artifex-modal-button ${item.kind === 'primary' ? 'is-primary' : 'is-secondary'}`;
    button.textContent = item.label;
    button.addEventListener('click', item.action);
    actionsBox.appendChild(button);
  });
  $('artifex-modal-root').classList.remove('is-hidden');
}

function closeBrandedModal() {
  $('artifex-modal-root')?.classList.add('is-hidden');
}

function findPath(state, start, exit) {
  if (!start || !exit) return [];
  const queue = [[start]];
  const seen = new Set([key(start)]);
  while (queue.length) {
    const path = queue.shift();
    const p = path[path.length - 1];
    if (p.x === exit.x && p.y === exit.y) return path;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (seen.has(key(n)) || !isOpenCell(state, n.x, n.y)) continue;
      seen.add(key(n));
      queue.push([...path, n]);
    }
  }
  return [];
}

function isOpenCell(state, x, y) {
  return x >= 0 && y >= 0 && x < state.gridSize && y < state.gridSize && state.matrix[y]?.[x] === 0 && isInsideShape(x, y, state.gridSize, state.layout, state.stretchX, state.stretchY);
}

function countOpenNeighbours(state, x, y) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => isOpenCell(state, x + dx, y + dy)).length;
}

function countBranchCells(state) {
  let count = 0;
  for (let y = 0; y < state.gridSize; y++) {
    for (let x = 0; x < state.gridSize; x++) {
      if (isOpenCell(state, x, y) && countOpenNeighbours(state, x, y) >= 3) count++;
    }
  }
  return count;
}

function countDeadEnds(state) {
  let count = 0;
  for (let y = 0; y < state.gridSize; y++) {
    for (let x = 0; x < state.gridSize; x++) {
      if (isOpenCell(state, x, y) && countOpenNeighbours(state, x, y) === 1) count++;
    }
  }
  return Math.max(0, count - 2);
}

function key(p) { return `${p.x},${p.y}`; }
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function injectModalStyle() {
  if ($('artifex-modal-style')) return;
  const style = document.createElement('style');
  style.id = 'artifex-modal-style';
  style.textContent = `
    .artifex-modal-root{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:24px;}
    .artifex-modal-root.is-hidden{display:none;}
    .artifex-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.66);backdrop-filter:blur(3px);}
    .artifex-modal-card{position:relative;width:min(560px,calc(100vw - 36px));max-height:calc(100vh - 48px);overflow:auto;border:1px solid rgba(158,230,164,.38);border-radius:24px;background:linear-gradient(155deg,rgba(5,20,11,.98),rgba(14,48,28,.96));box-shadow:0 26px 70px rgba(0,0,0,.62),0 0 42px rgba(158,230,164,.12);color:var(--cream,#eadfc6);}
    .artifex-modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:22px 24px 14px;border-bottom:1px solid rgba(158,230,164,.18);}
    .artifex-modal-eyebrow{margin:0 0 4px;color:var(--green2,#9ee6a4);font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;font-weight:900;}
    .artifex-modal-header h2{margin:0;font-family:Cinzel,serif;font-size:1.45rem;line-height:1.1;}
    #artifex-modal-close{width:38px;height:38px;border-radius:14px;border:1px solid rgba(158,230,164,.34);background:rgba(1,15,8,.72);color:var(--cream,#eadfc6);font-size:1.45rem;line-height:1;cursor:pointer;}
    .artifex-modal-body{padding:18px 24px;color:#d9d1bb;font-size:.95rem;line-height:1.5;}
    .artifex-modal-body p{margin:14px 0 0;}
    .artifex-modal-grid{display:grid;grid-template-columns:minmax(140px,1fr) auto;gap:9px 18px;padding:14px;border:1px solid rgba(158,230,164,.18);border-radius:16px;background:rgba(0,0,0,.22);}
    .artifex-modal-grid span{color:#aab79d;}
    .artifex-modal-grid strong{color:#dff8d8;text-align:right;}
    .artifex-modal-actions{display:flex;justify-content:flex-end;gap:10px;padding:0 24px 24px;}
    .artifex-modal-button{min-height:42px;border-radius:14px;padding:9px 18px;font-weight:900;cursor:pointer;}
    .artifex-modal-button.is-primary{border:1px solid rgba(158,230,164,.5);background:linear-gradient(180deg,#a8e8a3,#5ba96a);color:#07120a;}
    .artifex-modal-button.is-secondary{border:1px solid rgba(158,230,164,.34);background:rgba(13,58,31,.78);color:var(--cream,#eadfc6);}
  `;
  document.head.appendChild(style);
}
