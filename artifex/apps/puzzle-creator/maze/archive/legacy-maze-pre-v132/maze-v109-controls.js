const $ = (id) => document.getElementById(id);
const SHAPES = ['Triangle', 'Square', 'Pentagon', 'Hexagon', 'Circle'];

window.addEventListener('DOMContentLoaded', () => {
  bindRegenerateButtons();
  bindThreeModeDisplay();
  bindShapeRegeneration();
  updateOverviewSettings();
  window.addEventListener('artifex-preview-redrawn', updateOverviewSettings);
});

function bindRegenerateButtons() {
  document.querySelectorAll('[data-force-regenerate]').forEach((button) => {
    button.addEventListener('click', () => forceRegenerate(button.dataset.forceRegenerate));
  });
}

function forceRegenerate(reason = 'manual') {
  const runtime = window.__artifexMazeRuntime;
  if (!runtime?.state) return;
  const state = runtime.state;
  state.solution = [];
  state.blankStarted = false;
  document.getElementById('btn-random')?.click();
  updateStatus(`Map regenerated · ${reason}`);
}

function bindThreeModeDisplay() {
  const threeButton = $('view-mode-3d');
  const walkButton = $('view-mode-fps');
  const dioramaButton = $('view-mode-diorama');
  if (!threeButton) return;

  threeButton.addEventListener('click', () => {
    const runtime = window.__artifexMazeRuntime;
    if (runtime?.state) runtime.state.view = '3d';
    threeButton.classList.add('is-active');
    walkButton?.classList.remove('is-active');
    dioramaButton?.classList.remove('is-active');
    $('virtual-dpad')?.classList.remove('is-hidden');
    updateStatus('3D View placeholder · tunnel renderer pending');
    drawThreeDPlaceholder();
  });

  [walkButton, dioramaButton].forEach((button) => button?.addEventListener('click', () => {
    threeButton.classList.remove('is-active');
    setTimeout(updateOverviewSettings, 30);
  }));
}

function bindShapeRegeneration() {
  const shape = $('layout-style-slider');
  const stretchX = $('stretch-x-slider');
  const stretchY = $('stretch-y-slider');
  [shape, stretchX, stretchY].forEach((control) => {
    if (!control) return;
    control.addEventListener('change', () => {
      const runtime = window.__artifexMazeRuntime;
      if (!runtime?.state) return;
      if (runtime.state.blankStarted) return;
      setTimeout(() => forceRegenerate(control.id.replace('-slider', '')), 20);
    });
    control.addEventListener('input', () => setTimeout(updateOverviewSettings, 20));
  });

  ['warp-slider', 'edge-style-slider', 'grid-slider'].forEach((id) => $(id)?.addEventListener('input', () => setTimeout(updateOverviewSettings, 20)));
}

function drawThreeDPlaceholder() {
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
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * ratio);
  canvas.height = Math.max(1, rect.height * ratio);
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const w = rect.width;
  const h = rect.height;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#06170c');
  g.addColorStop(0.48, '#0e2a18');
  g.addColorStop(1, '#020604');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,.42)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * .32, h * .42);
  ctx.lineTo(w * .68, h * .42);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h);
  ctx.lineTo(w * .68, h * .58);
  ctx.lineTo(w * .32, h * .58);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(158,230,164,.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const x1 = w * (.32 - t * .32);
    const x2 = w * (.68 + t * .32);
    const y1 = h * (.42 - t * .42);
    const y2 = h * (.58 + t * .42);
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }
  ctx.fillStyle = '#e9dcc1';
  ctx.font = '800 18px Inter, sans-serif';
  ctx.fillText('3D View placeholder', 24, 34);
  ctx.font = '600 13px Inter, sans-serif';
  ctx.fillStyle = '#b9c5a5';
  ctx.fillText('Dedicated first-person tunnel renderer is a later pass.', 24, 56);
}

function updateOverviewSettings() {
  const runtime = window.__artifexMazeRuntime;
  const state = runtime?.state;
  const box = $('overview-settings-summary');
  if (!state || !box) return;
  const shape = SHAPES[state.layout] || 'Square';
  const tunnel = state.tunnelMode ? 'On' : 'Off';
  box.textContent = `Shape: ${shape} · Size: ${state.sizeLevel}/${state.gridSize} · Stretch: X ${state.stretchX}%, Y ${state.stretchY}% · Warp: ${state.warp}% · Edge: ${state.edge ?? 0} · Tunnel: ${tunnel}`;
}

function updateStatus(text) {
  const status = $('player-status-indicator');
  if (status) status.textContent = text;
  updateOverviewSettings();
}
