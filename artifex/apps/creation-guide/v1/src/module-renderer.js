import { MODULE_ACCENTS, MODULE_LABEL, MODULE_THEME, DESIGN_WIDTH, DESIGN_HEIGHT, WORKFLOW_STATES } from './module-config.js';
import {
  getCompletion,
  getEffectiveEffort,
  getEffectivePriority,
  getVisibleAssignments,
  moduleState,
  onStateChange
} from './module-state.js';

let canvas;
let context;
let animationFrame = null;

export function initRenderer() {
  canvas = document.getElementById('module-canvas');
  context = canvas?.getContext('2d');

  if (!canvas || !context) {
    console.warn('Creation Guide canvas not found.');
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
  drawHeader(context, width, height, state);
  drawDashboard(context, width, height, state);
  drawAssignmentCards(context, width, height, state);
  if (state.showHelpers) drawHelpers(context, width, height, state);
  context.restore();

  canvas.style.transformOrigin = 'center center';
  canvas.style.transform = `scale(${zoom})`;
}

function drawBackground(ctx, width, height, mode) {
  ctx.fillStyle = mode === 'white' ? '#f3efe8' : '#050405';
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(width * 0.5, height * 0.35, 80, width * 0.5, height * 0.5, width * 0.75);
  if (mode === 'white') {
    gradient.addColorStop(0, 'rgba(143, 109, 255, 0.14)');
    gradient.addColorStop(1, 'rgba(70, 49, 36, 0.05)');
  } else {
    gradient.addColorStop(0, 'rgba(143, 109, 255, 0.18)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(226, 204, 167, 0.07)';
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

function drawHeader(ctx, width, height, state) {
  ctx.save();
  const title = state.document.setup?.gameTitle || state.document.name;
  roundedRect(ctx, 32, 28, width - 64, 86, 20);
  ctx.fillStyle = 'rgba(23, 18, 16, 0.86)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(226, 204, 167, 0.25)';
  ctx.stroke();

  ctx.fillStyle = '#fff0ce';
  ctx.font = '700 24px Cinzel, Georgia, serif';
  ctx.fillText(MODULE_LABEL, 58, 64);
  ctx.fillStyle = MODULE_THEME.accentStrong;
  ctx.font = '600 15px Plus Jakarta Sans, Arial, sans-serif';
  ctx.fillText(title, 58, 93);

  const completion = getOverallCompletion(state.document.assignments || []);
  drawMetric(ctx, width - 240, 45, 'Overall', `${completion}%`, MODULE_THEME.accentStrong);
  drawMetric(ctx, width - 130, 45, 'Active', `${getActiveCount(state.document.assignments || [])}`, '#fff0ce');
  ctx.restore();
}

function drawDashboard(ctx, width, height, state) {
  const assignments = state.document.assignments || [];
  const y = 135;
  const x = 32;
  const cardWidth = (width - 96) / 4;
  const metrics = [
    ['To Do', assignments.filter((a) => !['done', 'archived'].includes(a.state)).length, '#d9c3ac'],
    ['Doing', assignments.filter((a) => a.state === 'started').length, MODULE_THEME.accentStrong],
    ['Review', assignments.filter((a) => a.state === 'review').length, '#fff0a8'],
    ['Blocked', assignments.filter((a) => a.state === 'blocked').length, '#ffaaaa']
  ];

  ctx.save();
  metrics.forEach((metric, index) => {
    const bx = x + index * (cardWidth + 10);
    roundedRect(ctx, bx, y, cardWidth, 84, 18);
    ctx.fillStyle = 'rgba(23, 18, 16, 0.84)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(226, 204, 167, 0.22)';
    ctx.stroke();
    ctx.fillStyle = metric[2];
    ctx.font = '700 34px Cinzel, Georgia, serif';
    ctx.fillText(String(metric[1]), bx + 20, y + 46);
    ctx.fillStyle = 'rgba(226, 204, 167, 0.8)';
    ctx.font = '700 12px Plus Jakarta Sans, Arial, sans-serif';
    ctx.fillText(metric[0].toUpperCase(), bx + 20, y + 68);
  });
  ctx.restore();
}

function drawAssignmentCards(ctx, width, height, state) {
  const assignments = getVisibleAssignments().slice(0, 8);
  const startY = 245;
  const cardWidth = 276;
  const cardHeight = 136;
  const gap = 18;
  const columns = Math.max(1, Math.floor((width - 72) / (cardWidth + gap)));

  ctx.save();

  if (!assignments.length) {
    ctx.fillStyle = 'rgba(226, 204, 167, 0.72)';
    ctx.font = '600 22px Plus Jakarta Sans, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No assignments in this filter. Use Insert → Starter Assignment Templates.', width / 2, height / 2);
    ctx.restore();
    return;
  }

  assignments.forEach((assignment, visibleIndex) => {
    const realIndex = state.document.assignments.indexOf(assignment);
    const col = visibleIndex % columns;
    const row = Math.floor(visibleIndex / columns);
    const x = 36 + col * (cardWidth + gap);
    const y = startY + row * (cardHeight + gap);
    if (y > height - cardHeight - 28) return;
    drawAssignmentCard(ctx, assignment, x, y, cardWidth, cardHeight, realIndex === state.activeAssignmentIndex);
  });

  ctx.restore();
}

function drawAssignmentCard(ctx, assignment, x, y, width, height, selected) {
  const module = MODULE_ACCENTS[assignment.primaryModule] || MODULE_ACCENTS.unassigned;
  const pct = getCompletion(assignment);

  roundedRect(ctx, x, y, width, height, 18);
  ctx.fillStyle = selected ? module.accentSoft : 'rgba(23, 18, 16, 0.86)';
  ctx.fill();
  ctx.strokeStyle = selected ? module.accent : 'rgba(226, 204, 167, 0.22)';
  ctx.lineWidth = selected ? 2 : 1;
  ctx.stroke();

  ctx.fillStyle = module.accent;
  roundedRect(ctx, x, y, 8, height, 18);
  ctx.fill();

  ctx.fillStyle = module.accentStrong;
  ctx.font = '700 24px Plus Jakarta Sans, Arial, sans-serif';
  ctx.fillText(assignment.icon || module.icon, x + 22, y + 34);

  ctx.fillStyle = '#fff0ce';
  ctx.font = '700 15px Plus Jakarta Sans, Arial, sans-serif';
  ctx.fillText(truncate(assignment.title, 29), x + 58, y + 32);

  ctx.fillStyle = module.accentStrong;
  ctx.font = '600 11px Fira Code, monospace';
  ctx.fillText(module.label, x + 58, y + 54);

  ctx.fillStyle = 'rgba(226, 204, 167, 0.75)';
  ctx.font = '600 11px Plus Jakarta Sans, Arial, sans-serif';
  ctx.fillText(`${assignment.state} · P${getEffectivePriority(assignment)} · E${getEffectiveEffort(assignment)}`, x + 58, y + 76);

  ctx.fillText(truncate(assignment.zoneId || assignment.sceneId || assignment.milestoneId || 'No zone linked', 34), x + 18, y + 102);

  ctx.fillStyle = 'rgba(226, 204, 167, 0.16)';
  roundedRect(ctx, x + 18, y + height - 20, width - 36, 7, 99);
  ctx.fill();
  ctx.fillStyle = module.accent;
  roundedRect(ctx, x + 18, y + height - 20, Math.max(5, (width - 36) * (pct / 100)), 7, 99);
  ctx.fill();
}

function drawHelpers(ctx, width, height, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(199, 184, 255, 0.72)';
  ctx.font = '500 12px Fira Code, monospace';
  ctx.fillText(`filter: ${state.activeWorkflowFilter}`, 38, height - 42);
  ctx.fillText(`sort: ${state.todoSort}`, 38, height - 22);
  ctx.restore();
}

function drawMetric(ctx, x, y, label, value, color) {
  ctx.fillStyle = color;
  ctx.font = '700 22px Cinzel, Georgia, serif';
  ctx.fillText(value, x, y + 20);
  ctx.fillStyle = 'rgba(226, 204, 167, 0.72)';
  ctx.font = '700 10px Plus Jakarta Sans, Arial, sans-serif';
  ctx.fillText(label.toUpperCase(), x, y + 41);
}

function getOverallCompletion(assignments) {
  if (!assignments.length) return 0;
  return Math.round(assignments.reduce((sum, assignment) => sum + getCompletion(assignment), 0) / assignments.length);
}

function getActiveCount(assignments) {
  return assignments.filter((assignment) => !['done', 'archived'].includes(assignment.state)).length;
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
