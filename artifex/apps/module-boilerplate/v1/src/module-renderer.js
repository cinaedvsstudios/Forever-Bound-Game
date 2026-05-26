import { moduleState, onStateChange } from './module-state.js';
import { DESIGN_WIDTH, DESIGN_HEIGHT, MODULE_LABEL, MODULE_THEME } from './module-config.js';

let canvas;
let context;
let animationFrame = null;

export function initRenderer() {
  canvas = document.getElementById('module-canvas');
  context = canvas?.getContext('2d');

  if (!canvas || !context) {
    console.warn('Module canvas not found.');
    return;
  }

  onStateChange(render);
  window.addEventListener('resize', render);

  startRenderLoop();
}

export function captureSnapshot() {
  if (!canvas) return null;
  return canvas.toDataURL('image/png');
}

function startRenderLoop() {
  if (animationFrame) cancelAnimationFrame(animationFrame);

  const loop = () => {
    render();
    animationFrame = requestAnimationFrame(loop);
  };

  loop();
}

function render() {
  if (!canvas || !context) return;

  const state = moduleState;
  const width = state.document.designWidth || DESIGN_WIDTH;
  const height = state.document.designHeight || DESIGN_HEIGHT;
  const zoom = state.zoom || 1;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  context.save();
  context.clearRect(0, 0, width, height);
  drawBackground(context, width, height, state.workspaceMode);

  if (state.showGrid) drawGrid(context, width, height);
  drawHeader(context, width, height, state.document.name);
  drawRecordCards(context, width, height, state);
  if (state.showHelpers) drawHelpers(context, width, height, state);

  context.restore();

  canvas.style.transformOrigin = 'center center';
  canvas.style.transform = `scale(${zoom})`;
}

function drawBackground(ctx, width, height, mode) {
  ctx.fillStyle = mode === 'white' ? '#f3efe8' : '#050405';
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.42, 80, width * 0.5, height * 0.5, width * 0.75);
  if (mode === 'white') {
    gradient.addColorStop(0, 'rgba(111, 182, 255, 0.16)');
    gradient.addColorStop(1, 'rgba(70, 49, 36, 0.05)');
  } else {
    gradient.addColorStop(0, 'rgba(111, 182, 255, 0.16)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(226, 204, 167, 0.08)';
  ctx.lineWidth = 1;

  const step = 80;
  for (let x = 0; x <= width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawHeader(ctx, width, height, documentName) {
  ctx.save();

  ctx.fillStyle = 'rgba(23, 18, 16, 0.84)';
  roundedRect(ctx, 32, 28, width - 64, 82, 20);
  ctx.fill();

  ctx.strokeStyle = 'rgba(226, 204, 167, 0.25)';
  ctx.lineWidth = 1;
  roundedRect(ctx, 32, 28, width - 64, 82, 20);
  ctx.stroke();

  ctx.fillStyle = '#fff0ce';
  ctx.font = '700 24px Cinzel, Georgia, serif';
  ctx.fillText(MODULE_LABEL, 58, 64);

  ctx.fillStyle = MODULE_THEME.accentStrong;
  ctx.font = '600 15px Plus Jakarta Sans, Arial, sans-serif';
  ctx.fillText(documentName || 'Untitled Module Data', 58, 91);

  ctx.restore();
}

function drawRecordCards(ctx, width, height, state) {
  const records = state.document.records || [];
  const activeIndex = state.activeRecordIndex;
  const cardWidth = 260;
  const cardHeight = 118;
  const gap = 22;
  const columns = Math.max(1, Math.floor((width - 96) / (cardWidth + gap)));

  ctx.save();

  if (!records.length) {
    ctx.fillStyle = 'rgba(226, 204, 167, 0.72)';
    ctx.font = '600 22px Plus Jakarta Sans, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No records yet. Use Insert → Add Generic Record.', width / 2, height / 2);
    ctx.restore();
    return;
  }

  records.forEach((record, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = 48 + col * (cardWidth + gap);
    const y = 150 + row * (cardHeight + gap);

    if (y > height - cardHeight - 24) return;

    ctx.fillStyle = index === activeIndex ? 'rgba(111, 182, 255, 0.18)' : 'rgba(23, 18, 16, 0.84)';
    roundedRect(ctx, x, y, cardWidth, cardHeight, 18);
    ctx.fill();

    ctx.strokeStyle = index === activeIndex ? MODULE_THEME.accent : 'rgba(226, 204, 167, 0.22)';
    ctx.lineWidth = index === activeIndex ? 2 : 1;
    roundedRect(ctx, x, y, cardWidth, cardHeight, 18);
    ctx.stroke();

    ctx.fillStyle = '#fff0ce';
    ctx.font = '700 16px Plus Jakarta Sans, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(truncate(record.name, 24), x + 18, y + 32);

    ctx.fillStyle = MODULE_THEME.accentStrong;
    ctx.font = '600 12px Fira Code, monospace';
    ctx.fillText(record.type || 'generic', x + 18, y + 58);

    ctx.fillStyle = 'rgba(226, 204, 167, 0.7)';
    ctx.font = '500 12px Plus Jakarta Sans, Arial, sans-serif';
    ctx.fillText(truncate(record.category || 'uncategorised', 30), x + 18, y + 82);

    const tagLine = Array.isArray(record.tags) ? record.tags.join(', ') : '';
    if (tagLine) {
      ctx.fillStyle = 'rgba(170, 160, 154, 0.9)';
      ctx.fillText(truncate(tagLine, 32), x + 18, y + 103);
    }
  });

  ctx.restore();
}

function drawHelpers(ctx, width, height, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(111, 182, 255, 0.72)';
  ctx.font = '500 12px Fira Code, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`records: ${(state.document.records || []).length}`, 38, height - 42);
  ctx.fillText(`active: ${state.activeRecordIndex >= 0 ? state.activeRecordIndex + 1 : 'none'}`, 38, height - 22);
  ctx.restore();
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function truncate(value, max) {
  const string = String(value || '');
  return string.length > max ? `${string.slice(0, max - 1)}…` : string;
}
