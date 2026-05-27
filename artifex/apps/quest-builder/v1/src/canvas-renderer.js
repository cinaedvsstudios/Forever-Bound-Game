import { DESIGN_WIDTH as W, DESIGN_HEIGHT as H } from './module-config.js';
import { getBlockType } from './block-types.js';

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
    drawHeaderBox(ctx, 60, 50, '📜', 'No Quest Selected', 'Create or import a Quest to begin.', false);
    return;
  }

  drawHeaderBox(ctx, 54, 42, q.thumbnail || '📜', q.name, `${q.chronicleId} / ${q.type} / ${(q.blocks || []).length} blocks`, state.inspectorTarget === 'quest');
  app.hitZones.push({ kind: 'quest', x: 54, y: 42, w: 560, h: 70, index: state.activeQuest });
  drawCallingPill(ctx, 54, 124, q.callingText || 'No Calling text set', state.inspectorTarget === 'quest');
  app.hitZones.push({ kind: 'quest', x: 54, y: 124, w: 720, h: 38, index: state.activeQuest });

  drawNode(ctx, 60, 190, 170, 96, 'START', '◇', typeColor('neutral'));

  let x = 270;
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

  drawNode(ctx, W - 230, H - 145, 170, 96, 'END', '✓', typeColor('neutral'));
}

export function getCanvasHit(app, event) {
  const rect = app.canvas.getBoundingClientRect();
  const layout = app.layoutState.get();
  const renderedScaleX = rect.width / app.canvas.width;
  const renderedScaleY = rect.height / app.canvas.height;
  const x = (event.clientX - rect.left - layout.panX * renderedScaleX) / (renderedScaleX * layout.zoom);
  const y = (event.clientY - rect.top - layout.panY * renderedScaleY) / (renderedScaleY * layout.zoom);
  return [...(app.hitZones || [])].reverse().find((zone) => x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) || null;
}

export function applyCanvasTransform(canvas, layout) {
  canvas.style.transform = `translate(${layout.panX}px, ${layout.panY}px) scale(${layout.zoom})`;
}

function drawHeaderBox(ctx, x, y, thumb, title, meta, selected) {
  box(ctx, x, y, 560, 70, 18, selected ? 'rgba(62,180,137,.2)' : 'rgba(17,26,20,.88)', selected ? '#7ff0bd' : 'rgba(226,204,167,.26)', selected ? 3 : 1);
  ctx.fillStyle = 'rgba(62,180,137,.16)';
  round(ctx, x + 14, y + 13, 44, 44, 14);
  ctx.fill();
  ctx.fillStyle = '#fff0ce';
  ctx.font = '25px Arial';
  ctx.fillText(thumb, x + 24, y + 43);
  ctx.fillStyle = '#fff0ce';
  ctx.font = '700 22px Georgia';
  ctx.fillText(short(title, 38), x + 72, y + 32);
  ctx.fillStyle = '#7ff0bd';
  ctx.font = '600 13px Arial';
  ctx.fillText(short(meta, 58), x + 72, y + 54);
}

function drawCallingPill(ctx, x, y, text, selected) {
  box(ctx, x, y, 720, 38, 19, selected ? 'rgba(62,180,137,.22)' : 'rgba(62,180,137,.14)', selected ? '#7ff0bd' : 'rgba(62,180,137,.45)', selected ? 2 : 1);
  ctx.fillStyle = '#7ff0bd';
  ctx.font = '700 13px Arial';
  ctx.fillText('Calling', x + 18, y + 24);
  ctx.fillStyle = 'rgba(226,204,167,.88)';
  ctx.font = '600 13px Arial';
  ctx.fillText(short(text, 82), x + 90, y + 24);
  ctx.fillStyle = '#fff0ce';
  ctx.font = '16px Arial';
  ctx.fillText('✎', x + 690, y + 25);
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

function drawNode(ctx, x, y, w, h, title, thumb, color) {
  box(ctx, x, y, w, h, 18, 'rgba(17,26,20,.72)', color, 1.5);
  ctx.fillStyle = '#fff0ce';
  ctx.font = '24px Arial';
  ctx.fillText(thumb, x + 20, y + 42);
  ctx.font = '700 18px Georgia';
  ctx.fillText(title, x + 60, y + 42);
  ctx.fillStyle = 'rgba(226,204,167,.64)';
  ctx.font = '600 11px Arial';
  ctx.fillText(title === 'START' ? 'quest begins' : 'quest resolves', x + 20, y + 68);
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
