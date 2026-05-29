import { DESIGN_WIDTH as W, DESIGN_HEIGHT as H } from './module-config.js?v=1.2.8';
import { getBlockType } from './block-types.js?v=1.2.8';

const endpointAssets = {
  start: new URL('../../icons/start.png?v=1.2.8', import.meta.url).href,
  finish: new URL('../../icons/finish.png?v=1.2.8', import.meta.url).href
};
const endpointImages = {};

export function drawCanvas(app) {
  const { canvas, ctx, state } = app;
  const layout = app.layoutState.get();
  app.hitZones = [];
  applyCanvasTransform(canvas, layout);
  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = state.mode === 'light' ? '#eef6ef' : '#050805';
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * .52, H * .42, 80, W * .5, H * .5, W * .7);
  glow.addColorStop(0, 'rgba(62,180,137,.16)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(226,204,167,.07)';
  for (let x = 0; x < W; x += 80) line(ctx, x, 0, x, H);
  for (let y = 0; y < H; y += 80) line(ctx, 0, y, W, y);

  const q = app.quest();
  if (!q) {
    drawQuestHeaderCard(ctx, 54, 34, '📜', 'No Quest Selected', 'Create or import a Quest to begin.', 'No Calling text set', false);
    return;
  }

  drawQuestHeaderCard(ctx, 54, 34, q.thumbnail || '📜', q.name, `${q.chronicleId} / ${q.type} / ${(q.blocks || []).length} blocks`, q.callingText || 'No Calling text set', state.inspectorTarget === 'quest');
  app.hitZones.push({ kind: 'quest', x: 54, y: 34, w: 740, h: 114, index: state.activeQuest });
  app.hitZones.push({ kind: 'quest-edit', x: 742, y: 104, w: 40, h: 39, index: state.activeQuest });

  drawEndpointNode(ctx, 118, 245, 'start', app);

  let x = 252;
  let y = 190;
  const cardW = 250;
  const cardH = 124;
  const gap = 34;

  (q.blocks || []).forEach((item, index) => {
    if (x + cardW > W - 260) {
      x = 90;
      y += cardH + 54;
    }
    const selected = state.inspectorTarget === 'block' && index === state.activeBlock;
    drawFlowCard(ctx, x, y, cardW, cardH, item, selected);
    app.hitZones.push({ kind: 'block', x, y, w: cardW, h: cardH, index });
    app.hitZones.push({ kind: 'block-edit', x: x + cardW - 48, y, w: 48, h: 46, index });
    if (index < q.blocks.length - 1) {
      ctx.strokeStyle = 'rgba(62,180,137,.55)';
      ctx.lineWidth = 2;
      line(ctx, x + cardW, y + cardH / 2, x + cardW + gap, y + cardH / 2);
      ctx.fillStyle = 'rgba(127,240,189,.8)';
      ctx.font = '14px Arial';
      ctx.fillText('→', x + cardW + 10, y + cardH / 2 + 5);
    }
    x += cardW + gap;
  });

  drawEndpointNode(ctx, W - 115, H - 108, 'finish', app);
}

export function getCanvasHit(app, event) {
  const rect = app.canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (app.canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (app.canvas.height / rect.height);
  return [...(app.hitZones || [])].reverse().find((zone) => x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) || null;
}

export function applyCanvasTransform(canvas, layout) {
  canvas.style.transform = `translate(${layout.panX}px, ${layout.panY}px) scale(${layout.zoom})`;
}

function drawQuestHeaderCard(ctx, x, y, thumb, title, meta, calling, selected) {
  const w = 740;
  const h = 114;
  box(ctx, x, y, w, h, 21, selected ? 'rgba(28,70,52,.63)' : 'rgba(17,26,20,.9)', selected ? '#7ff0bd' : 'rgba(226,204,167,.26)', selected ? 3 : 1);
  ctx.fillStyle = 'rgba(62,180,137,.16)';
  round(ctx, x + 16, y + 14, 44, 44, 14);
  ctx.fill();
  ctx.fillStyle = '#fff0ce';
  ctx.font = '25px Arial';
  ctx.fillText(thumb, x + 26, y + 44);
  ctx.fillStyle = '#fff0ce';
  ctx.font = '700 22px Georgia';
  ctx.fillText(short(title, 46), x + 74, y + 30);
  ctx.fillStyle = '#7ff0bd';
  ctx.font = '600 12px Arial';
  ctx.fillText(short(meta, 68), x + 74, y + 52);

  ctx.strokeStyle = 'rgba(127,240,189,.2)';
  line(ctx, x + 16, y + 66, x + w - 16, y + 66);
  round(ctx, x + 16, y + 74, w - 32, 30, 15);
  ctx.fillStyle = 'rgba(62,180,137,.07)';
  ctx.fill();
  ctx.fillStyle = '#7ff0bd';
  ctx.font = '700 12px Arial';
  ctx.fillText('Calling', x + 30, y + 94);
  ctx.fillStyle = 'rgba(226,204,167,.9)';
  ctx.font = '600 12px Arial';
  ctx.fillText(short(calling, 86), x + 94, y + 94);
  ctx.fillStyle = '#fff0ce';
  ctx.font = '14px Arial';
  ctx.fillText('✎', x + w - 40, y + 94);
}

function drawFlowCard(ctx, x, y, w, h, item, selected) {
  const blockType = getBlockType(item.type);
  const color = typeColor(item.type);
  const missing = missingFields(item, blockType);
  const summary = linkedSummary(item);
  const stroke = selected ? '#7ff0bd' : missing.length ? '#f59e0b' : color;

  box(ctx, x, y, w, h, 18, selected ? 'rgba(62,180,137,.22)' : 'rgba(17,26,20,.86)', stroke, selected ? 3 : 1.5);
  ctx.fillStyle = '#fff0ce';
  ctx.font = '25px Arial';
  ctx.fillText(item.thumbnail || blockType.emoji, x + 18, y + 40);
  ctx.fillStyle = '#fff0ce';
  ctx.font = '700 15px Arial';
  ctx.fillText(short(item.name || blockType.name, 24), x + 60, y + 30);
  ctx.fillStyle = color;
  ctx.font = '700 12px Arial';
  ctx.fillText(blockType.name, x + 60, y + 52);

  ctx.fillStyle = summary === 'unlinked' ? 'rgba(245,158,11,.9)' : 'rgba(226,204,167,.78)';
  ctx.font = '500 11px Arial';
  ctx.fillText(short(summary, 34), x + 60, y + 76);

  if (missing.length) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 11px Arial';
    ctx.fillText('⚠ missing ' + short(missing.join(', '), 21), x + 60, y + 98);
  } else if (item.audioId) {
    ctx.fillStyle = 'rgba(127,240,189,.82)';
    ctx.font = '600 11px Arial';
    ctx.fillText(short('audio: ' + item.audioId, 30), x + 60, y + 98);
  } else {
    ctx.fillStyle = 'rgba(127,240,189,.72)';
    ctx.font = '600 11px Arial';
    ctx.fillText('ready', x + 60, y + 98);
  }

  ctx.fillStyle = '#fff0ce';
  ctx.font = '15px Arial';
  ctx.fillText('✎', x + w - 28, y + 28);
}

function drawEndpointNode(ctx, cx, cy, kind, app) {
  const isStart = kind === 'start';
  const stroke = isStart ? '#7ff0bd' : '#e2cca7';
  const label = isStart ? 'START' : 'END';
  const helper = isStart ? 'quest begins' : 'quest resolves';
  const radius = 55;
  const fill = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
  fill.addColorStop(0, 'rgba(28,70,52,.98)');
  fill.addColorStop(1, 'rgba(8,20,15,.98)');

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.lineWidth = 1;

  const image = getEndpointImage(kind, app);
  if (image?.loaded) {
    drawContainedImage(ctx, image.element, cx, cy - 21, 45, 38);
  } else {
    ctx.fillStyle = stroke;
    ctx.font = '700 26px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isStart ? '▶' : '✓', cx, cy - 11);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = isStart ? '#7ff0bd' : '#fff0ce';
  ctx.font = '700 14px Georgia';
  ctx.fillText(label, cx, cy + 20);
  ctx.fillStyle = 'rgba(226,204,167,.68)';
  ctx.font = '600 9px Arial';
  ctx.fillText(helper, cx, cy + 36);
  ctx.textAlign = 'left';
}

function drawContainedImage(ctx, image, cx, cy, maxWidth, maxHeight) {
  const width = image.naturalWidth || image.width || maxWidth;
  const height = image.naturalHeight || image.height || maxHeight;
  const scale = Math.min(maxWidth / width, maxHeight / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  ctx.drawImage(image, cx - drawWidth / 2, cy - drawHeight / 2, drawWidth, drawHeight);
}

function getEndpointImage(kind, app) {
  if (endpointImages[kind]) return endpointImages[kind];
  const state = { element: new Image(), loaded: false, failed: false };
  state.element.onload = () => {
    state.loaded = true;
    app.draw();
  };
  state.element.onerror = () => {
    state.failed = true;
  };
  state.element.src = endpointAssets[kind];
  endpointImages[kind] = state;
  return state;
}

function missingFields(item, blockType) {
  return (blockType.requiredFields || []).filter((field) => !String(item[field] || '').trim());
}

function linkedSummary(item) {
  const parts = [];
  if (item.sceneId) parts.push('scene:' + item.sceneId);
  if (item.objectId) parts.push('object:' + item.objectId);
  if (item.dialogueId) parts.push('dialogue:' + item.dialogueId);
  if (item.condition) parts.push('if ' + item.condition);
  if (item.action) parts.push('do ' + item.action);
  if (item.uiOverlay) parts.push('ui:' + item.uiOverlay);
  return parts.length ? parts.join(' · ') : 'unlinked';
}

export function typeColor(type) {
  return {
    scene: '#a78bfa',
    dialogue: '#f87171',
    action: '#fbbf24',
    object: '#2dd4bf',
    information: '#60a5fa',
    condition: '#60a5fa',
    capra: '#7ff0bd',
    ui: '#7ff0bd',
    reward: '#e2cca7',
    codice: '#e2cca7',
    combat: '#fb7185',
    route: '#34d399',
    completion: '#fef3c7',
    neutral: 'rgba(226,204,167,.65)'
  }[type] || 'rgba(226,204,167,.25)';
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function round(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function box(ctx, x, y, w, h, r, fill, stroke = 'rgba(226,204,167,.25)', width = 1) {
  round(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.lineWidth = 1;
}

function short(value, max) {
  value = String(value || '');
  return value.length > max ? value.slice(0, max - 1) + '…' : value;
}
