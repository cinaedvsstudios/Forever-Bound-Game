import { DESIGN_WIDTH, DESIGN_HEIGHT, editorState, onStateChange } from './editor-state.js';

let canvas;
let context;

export function initRenderer() {
  canvas = document.getElementById('object-canvas');
  context = canvas?.getContext('2d');
  if (!canvas || !context) return;
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  onStateChange(render);
  render(editorState);
}

export function getCanvas() {
  return canvas;
}

function resizeCanvas() {
  if (!canvas) return;
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
  render(editorState);
}

function render(state) {
  if (!canvas || !context) return;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  context.clearRect(0, 0, width, height);
  drawWorkspaceBackground(width, height, state.workspaceMode);

  const zoom = state.zoom;
  const fit = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT) * zoom;
  const stageWidth = DESIGN_WIDTH * fit;
  const stageHeight = DESIGN_HEIGHT * fit;
  const originX = (width - stageWidth) / 2;
  const originY = (height - stageHeight) / 2;

  context.save();
  context.translate(originX, originY);
  context.scale(fit, fit);
  drawStage(state);
  context.restore();
}

function drawWorkspaceBackground(width, height, mode) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  if (mode === 'white') {
    gradient.addColorStop(0, '#f8f2e8');
    gradient.addColorStop(1, '#d8ccbd');
  } else if (mode === 'scene') {
    gradient.addColorStop(0, '#2b2b2f');
    gradient.addColorStop(1, '#16161a');
  } else {
    gradient.addColorStop(0, '#050405');
    gradient.addColorStop(1, '#120e0d');
  }
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawStage(state) {
  context.save();
  context.fillStyle = state.workspaceMode === 'white' ? '#fffaf0' : '#0d0a09';
  context.strokeStyle = '#382a21';
  context.lineWidth = 2;
  context.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
  context.strokeRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

  if (state.showGrid) drawGrid();
  drawObjectPreview(state);
  context.restore();
}

function drawGrid() {
  context.save();
  context.lineWidth = 1;
  context.strokeStyle = 'rgba(226, 204, 167, 0.08)';
  for (let x = 0; x <= DESIGN_WIDTH; x += 80) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, DESIGN_HEIGHT);
    context.stroke();
  }
  for (let y = 0; y <= DESIGN_HEIGHT; y += 80) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(DESIGN_WIDTH, y);
    context.stroke();
  }
  context.restore();
}

function drawObjectPreview(state) {
  const item = state.archetype;
  const w = item.visual.width * item.visual.scale;
  const h = item.visual.height * item.visual.scale;
  const x = DESIGN_WIDTH / 2 - w / 2;
  const y = DESIGN_HEIGHT * 0.62 - h;
  const isHostile = item.behaviour.flags.hostile;
  const isCollectible = item.behaviour.flags.collectible;
  const colour = isHostile ? '#d84545' : isCollectible ? '#d9a441' : '#e2cca7';

  context.save();
  context.shadowColor = isHostile ? 'rgba(216,69,69,0.45)' : 'rgba(226,204,167,0.3)';
  context.shadowBlur = 18;
  context.fillStyle = 'rgba(30, 22, 18, 0.92)';
  roundRect(x, y, w, h, 18, true, false);
  context.shadowBlur = 0;
  context.strokeStyle = colour;
  context.lineWidth = 3;
  roundRect(x, y, w, h, 18, false, true);

  context.fillStyle = colour;
  context.font = '700 28px Cinzel, Georgia, serif';
  context.textAlign = 'center';
  context.fillText(categoryIcon(item.category), x + w / 2, y + h / 2 - 4);
  context.font = '700 16px Plus Jakarta Sans, Arial';
  context.fillText(item.name || item.id, x + w / 2, y + h + 30);
  context.font = '12px Fira Code, monospace';
  context.fillStyle = '#aaa09a';
  context.fillText(`${item.category} / ${item.role}`, x + w / 2, y + h + 50);

  if (state.showHelpers) drawHelpers(item, x, y, w, h);
  context.restore();
}

function drawHelpers(item, x, y, w, h) {
  const hitbox = item.collision.hitbox;
  const scaleX = w / Math.max(1, item.visual.width);
  const scaleY = h / Math.max(1, item.visual.height);
  const hx = x + hitbox.x * scaleX;
  const hy = y + hitbox.y * scaleY;
  const hw = hitbox.width * scaleX;
  const hh = hitbox.height * scaleY;

  if (item.collision.type !== 'none') {
    context.save();
    context.strokeStyle = 'rgba(87, 189, 140, 0.9)';
    context.lineWidth = 2;
    context.setLineDash([8, 6]);
    context.strokeRect(hx, hy, hw, hh);
    context.fillStyle = 'rgba(87, 189, 140, 0.08)';
    context.fillRect(hx, hy, hw, hh);
    label('collision / hitbox', hx, hy - 8, '#57bd8c');
    context.restore();
  }

  if (item.collision.interactionRadius > 0) {
    context.save();
    context.strokeStyle = 'rgba(255, 240, 206, 0.5)';
    context.lineWidth = 2;
    context.setLineDash([5, 8]);
    context.beginPath();
    context.arc(x + w / 2, y + h * 0.72, item.collision.interactionRadius, 0, Math.PI * 2);
    context.stroke();
    label('interaction radius', x + w / 2 + item.collision.interactionRadius + 10, y + h * 0.72, '#fff0ce');
    context.restore();
  }

  context.save();
  context.strokeStyle = 'rgba(216, 69, 69, 0.9)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x + w / 2 - 12, y + h);
  context.lineTo(x + w / 2 + 12, y + h);
  context.moveTo(x + w / 2, y + h - 12);
  context.lineTo(x + w / 2, y + h + 12);
  context.stroke();
  label(item.visual.anchor, x + w / 2 + 16, y + h + 16, '#ff7474');
  context.restore();
}

function label(text, x, y, color) {
  context.save();
  context.font = '11px Fira Code, monospace';
  context.fillStyle = color;
  context.textAlign = 'left';
  context.fillText(text, x, y);
  context.restore();
}

function categoryIcon(category) {
  const icons = {
    character: '☥', npc: '♙', enemy: '⚔', creature: '♞', boss: '♛', prop: '▣', door_exit: '⌂', pickup: '✦', marker: '⬡', interactable: '◈', searchable_cache: '▤', hazard: '⚠'
  };
  return icons[category] || '⬡';
}

function roundRect(x, y, width, height, radius, fill, stroke) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
  if (fill) context.fill();
  if (stroke) context.stroke();
}
