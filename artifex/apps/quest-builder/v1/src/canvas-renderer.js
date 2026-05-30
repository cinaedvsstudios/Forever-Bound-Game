import { DESIGN_WIDTH as W, DESIGN_HEIGHT as H } from './module-config.js?v=1.2.10';
import { getBlockType } from './block-types.js?v=1.2.10';
import { START_NODE_ID, END_NODE_ID } from './quest-schema.js?v=1.2.10';

export const CARD_W = 250;
export const CARD_H = 124;
const PORT_RADIUS = 9;
const endpointAssets = {
  start: new URL('../../icons/start.png?v=1.2.10', import.meta.url).href,
  finish: new URL('../../icons/finish.png?v=1.2.10', import.meta.url).href
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

  const start = { x: 118, y: 245 };
  const finish = { x: W - 115, y: H - 108 };
  const blocks = q.blocks || [];
  const positions = Object.fromEntries(blocks.map((item, index) => [item.id, getBlockPosition(layout, q.id, item.id, index)]));
  const graph = buildGraphDrawingData(q, blocks);

  (q.connections || []).forEach((connection) => {
    const source = getPortPoint(connection.sourceNodeId, 'out', connection.sourcePort, positions, start, finish, graph);
    const target = getPortPoint(connection.targetNodeId, 'in', connection.targetPort, positions, start, finish, graph);
    if (!source || !target) return;
    const sourceBlock = blocks.find((block) => block.id === connection.sourceNodeId);
    const color = connection.sourceNodeId === START_NODE_ID ? '#7ff0bd' : typeColor(sourceBlock?.type);
    const segments = drawConnector(ctx, source, target, color, state.activeConnectionId === connection.id);
    app.hitZones.push({ kind: 'connection', connectionId: connection.id, segments, threshold: 9 });
  });

  if (state.connectionDrag) {
    const source = getPortPoint(state.connectionDrag.sourceNodeId, 'out', state.connectionDrag.sourcePort, positions, start, finish, graph);
    if (source && state.connectionDrag.point) drawPreviewConnector(ctx, source, state.connectionDrag.point, state.connectionDrag.color);
  }

  drawEndpointNode(ctx, start.x, start.y, 'start', app);
  drawEndpointNode(ctx, finish.x, finish.y, 'finish', app);

  blocks.forEach((item, index) => {
    const position = positions[item.id];
    const selected = state.inspectorTarget === 'block' && index === state.activeBlock;
    const dragging = state.canvasBlockDrag?.index === index && state.canvasBlockDrag?.moved;
    drawFlowCard(ctx, position.x, position.y, CARD_W, CARD_H, item, selected, dragging);
    app.hitZones.push({ kind: 'block', x: position.x, y: position.y, w: CARD_W, h: CARD_H, index });
    app.hitZones.push({ kind: 'block-edit', x: position.x + CARD_W - 48, y: position.y, w: 48, h: 46, index });
  });

  drawNodePorts(ctx, app, START_NODE_ID, null, positions, start, finish, graph);
  blocks.forEach((block) => drawNodePorts(ctx, app, block.id, block, positions, start, finish, graph));
  drawNodePorts(ctx, app, END_NODE_ID, null, positions, start, finish, graph);
}

export function getCanvasPoint(app, event) {
  const rect = app.canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (app.canvas.width / rect.width),
    y: (event.clientY - rect.top) * (app.canvas.height / rect.height)
  };
}

export function getCanvasHit(app, event) {
  const point = getCanvasPoint(app, event);
  return [...(app.hitZones || [])].reverse().find((zone) => hitContains(zone, point)) || null;
}

export function getBlockPosition(layout, questId, blockId, index) {
  const key = `${questId}:${blockId}`;
  const saved = layout.blockPositions?.[key];
  if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return saved;
  let x = 252 + index * 284;
  let y = 190;
  while (x + CARD_W > W - 260) {
    x -= 3 * 284;
    y += CARD_H + 54;
  }
  return { x, y };
}

export function applyCanvasTransform(canvas, layout) {
  canvas.style.transform = `translate(${layout.panX}px, ${layout.panY}px) scale(${layout.zoom})`;
}

function buildGraphDrawingData(quest, blocks) {
  const inPorts = new Map();
  const outPorts = new Map();
  const add = (map, nodeId, portId) => {
    if (!map.has(nodeId)) map.set(nodeId, new Set());
    map.get(nodeId).add(portId);
  };
  (quest.connections || []).forEach((connection) => {
    add(outPorts, connection.sourceNodeId, connection.sourcePort || 'out:0');
    add(inPorts, connection.targetNodeId, connection.targetPort || 'in:0');
  });
  add(outPorts, START_NODE_ID, 'out:0');
  add(inPorts, END_NODE_ID, 'in:0');
  blocks.forEach((block) => {
    add(inPorts, block.id, nextAvailablePort(inPorts.get(block.id), 'in'));
    add(outPorts, block.id, nextAvailablePort(outPorts.get(block.id), 'out'));
  });
  return { inPorts, outPorts };
}

function nextAvailablePort(ports, direction) {
  const used = ports || new Set();
  let index = 0;
  while (used.has(`${direction}:${index}`)) index += 1;
  return `${direction}:${index}`;
}

function sortedPorts(graph, direction, nodeId) {
  return [...(direction === 'out' ? graph.outPorts.get(nodeId) : graph.inPorts.get(nodeId) || [])]
    .sort((a, b) => portIndex(a) - portIndex(b));
}

function portIndex(portId) {
  const number = Number(String(portId || '').split(':')[1]);
  return Number.isFinite(number) ? number : 0;
}

function getPortPoint(nodeId, direction, portId, positions, start, finish, graph) {
  if (nodeId === START_NODE_ID) return direction === 'out' ? { x: start.x + 55, y: start.y } : null;
  if (nodeId === END_NODE_ID) return direction === 'in' ? { x: finish.x - 55, y: finish.y } : null;
  const position = positions[nodeId];
  if (!position) return null;
  const ports = sortedPorts(graph, direction, nodeId);
  const index = Math.max(0, ports.indexOf(portId || `${direction}:0`));
  const spread = 22;
  const y = position.y + CARD_H / 2 + (index - (ports.length - 1) / 2) * spread;
  return { x: direction === 'out' ? position.x + CARD_W : position.x, y };
}

function drawNodePorts(ctx, app, nodeId, block, positions, start, finish, graph) {
  const directions = nodeId === START_NODE_ID ? ['out'] : nodeId === END_NODE_ID ? ['in'] : ['in', 'out'];
  directions.forEach((direction) => {
    const ports = sortedPorts(graph, direction, nodeId);
    ports.forEach((portId) => {
      const point = getPortPoint(nodeId, direction, portId, positions, start, finish, graph);
      if (!point) return;
      const active = app.state.connectionDrag?.sourceNodeId === nodeId && app.state.connectionDrag?.sourcePort === portId;
      drawPort(ctx, point, direction, active);
      app.hitZones.push({ kind: `port-${direction}`, nodeId, portId, x: point.x - PORT_RADIUS - 4, y: point.y - PORT_RADIUS - 4, w: (PORT_RADIUS + 4) * 2, h: (PORT_RADIUS + 4) * 2, blockId: block?.id });
    });
  });
}

function drawPort(ctx, point, direction, active) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, PORT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = active ? 'rgba(127,240,189,.96)' : 'rgba(17,26,20,.98)';
  ctx.fill();
  ctx.strokeStyle = direction === 'out' ? '#7ff0bd' : 'rgba(226,204,167,.9)';
  ctx.lineWidth = active ? 3 : 2;
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawConnector(ctx, from, to, color, selected) {
  const midX = from.x + (to.x - from.x) / 2;
  const segments = [[from, { x: midX, y: from.y }], [{ x: midX, y: from.y }, { x: midX, y: to.y }], [{ x: midX, y: to.y }, to]];
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(midX, from.y);
  ctx.lineTo(midX, to.y);
  ctx.lineTo(to.x, to.y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color || '#7ff0bd';
  ctx.lineWidth = selected ? 6 : 4;
  if (selected) {
    ctx.shadowColor = color || '#7ff0bd';
    ctx.shadowBlur = 14;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1;
  return segments;
}

function drawPreviewConnector(ctx, from, to, color) {
  ctx.save();
  ctx.setLineDash([10, 7]);
  ctx.globalAlpha = .84;
  drawConnector(ctx, from, to, color, false);
  ctx.restore();
}

function hitContains(zone, point) {
  if (zone.kind === 'connection') return (zone.segments || []).some(([a, b]) => distanceToSegment(point, a, b) <= (zone.threshold || 8));
  return point.x >= zone.x && point.x <= zone.x + zone.w && point.y >= zone.y && point.y <= zone.y + zone.h;
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (!dx && !dy) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
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

function drawFlowCard(ctx, x, y, w, h, item, selected, dragging) {
  const blockType = getBlockType(item.type);
  const color = typeColor(item.type);
  const missing = missingFields(item, blockType);
  const summary = linkedSummary(item);
  const stroke = selected ? '#7ff0bd' : missing.length ? '#f59e0b' : color;
  ctx.save();
  if (dragging) ctx.globalAlpha = .9;
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
  ctx.fillStyle = 'rgba(127,240,189,.52)';
  ctx.font = '13px Arial';
  ctx.fillText('⋮⋮', x + w - 34, y + h - 15);
  ctx.restore();
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
  if (image?.loaded) drawContainedImage(ctx, image.element, cx, cy - 21, 45, 38);
  else {
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
  state.element.onload = () => { state.loaded = true; app.draw(); };
  state.element.onerror = () => { state.failed = true; };
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
  return { scene: '#a78bfa', dialogue: '#f87171', action: '#fbbf24', object: '#2dd4bf', information: '#60a5fa', condition: '#60a5fa', capra: '#7ff0bd', ui: '#7ff0bd', reward: '#e2cca7', codice: '#e2cca7', ritual: '#e2cca7', combat: '#fb7185', route: '#34d399', travel: '#34d399', companion: '#7ff0bd', cleansing: '#7ff0bd', completion: '#7ff0bd', neutral: 'rgba(226,204,167,.65)' }[type] || 'rgba(226,204,167,.25)';
}

function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function round(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function box(ctx, x, y, w, h, r, fill, stroke = 'rgba(226,204,167,.25)', width = 1) { round(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); ctx.lineWidth = 1; }
function short(value, max) { value = String(value || ''); return value.length > max ? value.slice(0, max - 1) + '…' : value; }
