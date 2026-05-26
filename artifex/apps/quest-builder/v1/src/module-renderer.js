import { DESIGN_WIDTH, DESIGN_HEIGHT, MODULE_THEME } from './module-config.js';
import { state, onStateChange } from './module-state.js';

let canvas;
let ctx;

export function initRenderer() {
  canvas = document.getElementById('module-canvas');
  ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  onStateChange(render);
  window.addEventListener('resize', render);
  render();
}

function render() {
  if (!canvas || !ctx) return;
  const width = state.document.designWidth || DESIGN_WIDTH;
  const height = state.document.designHeight || DESIGN_HEIGHT;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.clearRect(0, 0, width, height);
  drawBackground(width, height);
  drawHeader(width);
  drawQuestFlow(width, height);
}

function drawBackground(width, height) {
  ctx.fillStyle = state.workspaceMode === 'white' ? '#eef6ef' : '#050805';
  ctx.fillRect(0, 0, width, height);
  const gradient = ctx.createRadialGradient(width * 0.52, height * 0.42, 80, width * 0.5, height * 0.5, width * 0.7);
  gradient.addColorStop(0, 'rgba(62, 180, 137, 0.18)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(226, 204, 167, 0.07)';
  for (let x = 0; x < width; x += 80) line(x, 0, x, height);
  for (let y = 0; y < height; y += 80) line(0, y, width, y);
}

function drawHeader(width) {
  roundedRect(32, 28, width - 64, 82, 20);
  ctx.fillStyle = 'rgba(17, 26, 20, 0.86)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(226, 204, 167, 0.25)';
  ctx.stroke();
  ctx.fillStyle = '#fff0ce';
  ctx.font = '700 24px Cinzel, Georgia, serif';
  ctx.fillText('QUEST BUILDER', 58, 64);
  ctx.fillStyle = MODULE_THEME.accentStrong;
  ctx.font = '600 15px Plus Jakarta Sans, Arial, sans-serif';
  const quest = state.document.quests[state.activeQuestIndex];
  ctx.fillText(quest ? `${quest.chronicleId} / ${quest.name}` : 'Create a Quest to begin assembly', 58, 91);
}

function drawQuestFlow(width, height) {
  const quest = state.document.quests[state.activeQuestIndex];
  if (!quest) {
    ctx.fillStyle = 'rgba(226, 204, 167, 0.72)';
    ctx.font = '600 22px Plus Jakarta Sans, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No Quest selected. Add a Quest to begin.', width / 2, height / 2);
    ctx.textAlign = 'left';
    return;
  }

  const blocks = quest.blocks || [];
  const startX = 60;
  const startY = 160;
  const cardW = 230;
  const cardH = 116;
  const gap = 34;
  let x = startX;
  let y = startY;

  ctx.font = '600 14px Plus Jakarta Sans, Arial, sans-serif';
  ctx.fillStyle = 'rgba(226, 204, 167, 0.78)';
  ctx.fillText(`Calling: ${truncate(quest.callingText || 'No Calling text set', 110)}`, 60, 132);

  if (!blocks.length) {
    ctx.fillStyle = 'rgba(226, 204, 167, 0.72)';
    ctx.font = '600 22px Plus Jakarta Sans, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No blocks yet. Add Scene / Dialogue / Capra / Codice / Completion blocks.', width / 2, height / 2);
    ctx.textAlign = 'left';
    return;
  }

  blocks.forEach((block, index) => {
    if (x + cardW > width - 40) {
      x = startX;
      y += cardH + 58;
    }
    if (index > 0) {
      ctx.strokeStyle = 'rgba(62, 180, 137, 0.6)';
      ctx.lineWidth = 2;
      const prevX = x - gap;
      const prevY = y + cardH / 2;
      if (prevX > startX) line(prevX, prevY, x, prevY);
    }
    ctx.fillStyle = index === state.activeBlockIndex ? 'rgba(62, 180, 137, 0.18)' : 'rgba(17, 26, 20, 0.86)';
    roundedRect(x, y, cardW, cardH, 18);
    ctx.fill();
    ctx.strokeStyle = index === state.activeBlockIndex ? MODULE_THEME.accent : 'rgba(226, 204, 167, 0.23)';
    ctx.lineWidth = index === state.activeBlockIndex ? 2 : 1;
    ctx.stroke();
    ctx.fillStyle = '#fff0ce';
    ctx.font = '700 15px Plus Jakarta Sans, Arial, sans-serif';
    ctx.fillText(truncate(block.name, 24), x + 16, y + 28);
    ctx.fillStyle = MODULE_THEME.accentStrong;
    ctx.font = '600 12px Fira Code, monospace';
    ctx.fillText(block.type || 'block', x + 16, y + 52);
    ctx.fillStyle = 'rgba(226, 204, 167, 0.78)';
    ctx.font = '500 11px Plus Jakarta Sans, Arial, sans-serif';
    ctx.fillText(truncate(block.sceneId || block.objectId || block.dialogueId || block.condition || block.action || 'unlinked', 34), x + 16, y + 78);
    if (block.uiOverlay || block.capraFeedback) {
      ctx.fillStyle = 'rgba(127, 240, 189, 0.82)';
      ctx.fillText(truncate(block.uiOverlay || 'Capra feedback', 34), x + 16, y + 99);
    }
    x += cardW + gap;
  });
}

function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function roundedRect(x, y, width, height, radius) { const r = Math.min(radius, width / 2, height / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + width, y, x + width, y + height, r); ctx.arcTo(x + width, y + height, x, y + height, r); ctx.arcTo(x, y + height, x, y, r); ctx.arcTo(x, y, x + width, y, r); ctx.closePath(); }
function truncate(value, max) { const string = String(value || ''); return string.length > max ? `${string.slice(0, max - 1)}…` : string; }
