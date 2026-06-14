import { OC } from './obstacle-course-state.js';
import { $ } from './obstacle-course-utils.js';
import { pathCenterAt, pathHalfWidthAt } from './obstacle-course-ground-path.js';

const XZ = 36.0;
const ZZ = 1.08;
const H = 560;
const FWD = 480;
const BACK = 30;
const HIT = 12;
const TREE_LIMIT = 2.2;

export function scheduleOverviewDraw() {
  if (OC.overviewRaf) return;
  OC.overviewRaf = requestAnimationFrame(() => { OC.overviewRaf = 0; drawOverview(); });
}

function range() {
  return { start: Math.max(0, OC.distance - BACK), end: Math.min(OC.courseLength, OC.distance + FWD) };
}

function prep(canvas) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(360, Math.round(rect.width || canvas.clientWidth || 760));
  if (canvas.width !== width || canvas.height !== H) {
    canvas.width = width;
    canvas.height = H;
  }
  canvas.style.height = `${H}px`;
  return { width, height: H };
}

export function worldToOverview(x, z) {
  const canvas = $('hf-overview');
  const width = canvas?.width || 760;
  const height = canvas?.height || H;
  const distance = -Number(z || 0);
  return { x: width / 2 + Number(x || 0) * XZ, y: height - 56 - (distance - Number(OC.distance || 0)) * ZZ };
}

function fileName(url = '') {
  return String(url || '').split('?')[0].split('#')[0].split('/').pop() || 'no asset url';
}

function layerId(entity) {
  if (entity?.layerId) return entity.layerId;
  if (entity?.type === 'tree') return 'trees';
  if (entity?.type === 'detail') return 'details';
  if (entity?.type === 'collectible') return 'collectibles';
  if (entity?.type === 'obstacle') return 'obstacles';
  if (entity?.type === 'rock') return 'rocks';
  return '';
}

function entityWorld(entity) {
  const layer = OC.layers.get(layerId(entity));
  const assetUrl = entity?.assetUrl || entity?.object?.userData?.assetUrl || '';
  const cfg = assetUrl ? OC.glbControls.get(assetUrl) : null;
  const localX = Number(entity?.localX ?? entity?.object?.position?.x ?? entity?.x ?? 0);
  const localZ = Number(entity?.localZ ?? entity?.object?.position?.z ?? entity?.z ?? 0);
  if (!layer) return { x: localX + Number(cfg?.x || 0), z: localZ + Number(cfg?.z || 0) };
  const scale = Math.max(0.0001, Number(layer.scale || 1));
  return {
    x: Number(layer.x || 0) + (localX + Number(cfg?.x || 0)) * scale,
    z: Number(layer.z || 0) + (localZ + Number(cfg?.z || 0)) * scale,
  };
}

function label(entity) {
  const assetUrl = entity?.assetUrl || entity?.object?.userData?.assetUrl || '';
  const pos = entityWorld(entity);
  return `${entity?.type || 'entity'}\n${fileName(assetUrl)}\nx ${pos.x.toFixed(1)} · z ${pos.z.toFixed(1)}${assetUrl ? '\nclick: select GLB controls' : ''}`;
}

function tooltip() {
  let tip = document.getElementById('hf-overview-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'hf-overview-tooltip';
    tip.style.cssText = 'position:fixed;z-index:10000;display:none;pointer-events:none;white-space:pre-line;background:#080b10;color:#f4ead4;border:1px solid rgba(238,196,90,.75);border-radius:8px;padding:7px 9px;font:11px/1.3 monospace;box-shadow:0 10px 30px rgba(0,0,0,.45);max-width:260px';
    document.body.appendChild(tip);
  }
  return tip;
}

function hitFor(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const point = { x: (event.clientX - rect.left) * canvas.width / Math.max(1, rect.width), y: (event.clientY - rect.top) * canvas.height / Math.max(1, rect.height) };
  let best = null;
  let bestDist = HIT;
  (OC.overviewHitPoints || []).forEach((hit) => {
    const dist = Math.hypot(hit.x - point.x, hit.y - point.y);
    if (dist <= bestDist) { best = hit; bestDist = dist; }
  });
  return best;
}

function selectHit(hit) {
  const assetUrl = hit?.entity?.assetUrl || hit?.entity?.object?.userData?.assetUrl || '';
  if (!assetUrl) return;
  OC.selectedLayerId = 'glbAsset';
  OC.selectedGlbAssetUrl = assetUrl;
  const layerSelect = document.getElementById('hf-layer-select');
  if (layerSelect) {
    layerSelect.value = 'glbAsset';
    layerSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
  window.setTimeout(() => {
    const glbSelect = document.getElementById('hf-glb-asset-select');
    if (glbSelect) {
      glbSelect.value = assetUrl;
      glbSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, 0);
}

function bind(canvas) {
  if (canvas.dataset.ocOverviewHoverBound === 'true') return;
  canvas.dataset.ocOverviewHoverBound = 'true';
  const tip = tooltip();
  canvas.addEventListener('mousemove', (event) => {
    const hit = hitFor(canvas, event);
    if (!hit) { tip.style.display = 'none'; canvas.style.cursor = 'default'; return; }
    tip.textContent = hit.label;
    tip.style.left = `${event.clientX + 14}px`;
    tip.style.top = `${event.clientY + 14}px`;
    tip.style.display = 'block';
    canvas.style.cursor = hit.entity?.assetUrl ? 'pointer' : 'help';
  });
  canvas.addEventListener('click', (event) => selectHit(hitFor(canvas, event)));
  canvas.addEventListener('mouseleave', () => { tip.style.display = 'none'; canvas.style.cursor = 'default'; });
}

function drawLine(ctx, start, end, side, offset, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let d = start; d < end; d += 12) {
    const point = worldToOverview(pathCenterAt(d) + side * (pathHalfWidthAt(d) + offset), -d);
    if (d === start) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}

function drawPath(ctx, canvasWidth) {
  if (!OC.overviewPathOverlay) return;
  const { start, end } = range();
  ctx.fillStyle = 'rgba(238,196,90,.24)';
  for (let d = start; d < end; d += 4) {
    const left = worldToOverview(pathCenterAt(d) - pathHalfWidthAt(d), -d);
    const right = worldToOverview(pathCenterAt(d) + pathHalfWidthAt(d), -d);
    ctx.fillRect(left.x, left.y - 2, Math.max(3, right.x - left.x), 4);
  }
  [-1, 1].forEach((side) => drawLine(ctx, start, end, side, 0, 'rgba(238,196,90,.72)', 2));
  [-1, 1].forEach((side) => drawLine(ctx, start, end, side, TREE_LIMIT, 'rgba(132,58,210,.88)', 3));
  ctx.strokeStyle = '#d09a55';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let d = start; d < end; d += 12) {
    const point = worldToOverview(pathCenterAt(d), -d);
    if (d === start) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(244,234,212,.72)';
  ctx.font = '11px monospace';
  ctx.fillText(`window: ${Math.round(start)}-${Math.round(end)}`, 12, 18);
  ctx.fillText('purple = tree limit · hover dot = asset', 12, 34);
  ctx.strokeStyle = 'rgba(244,234,212,.25)';
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2, 42);
  ctx.lineTo(canvasWidth / 2, ctx.canvas.height - 26);
  ctx.stroke();
}

export function drawOverview() {
  const canvas = $('hf-overview');
  if (!canvas) return;
  bind(canvas);
  const { width, height } = prep(canvas);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#101914';
  ctx.fillRect(0, 0, width, height);
  drawPath(ctx, width);
  OC.overviewHitPoints = [];
  OC.entities.forEach((entity) => {
    if (entity.visibleOnOverview === false) return;
    const pos = entityWorld(entity);
    const point = worldToOverview(pos.x, pos.z);
    if (point.y < -28 || point.y > height + 28 || point.x < -38 || point.x > width + 38) return;
    const radius = entity.type === 'tree' ? 5.2 : entity.type === 'collectible' ? 4.8 : 4.2;
    ctx.fillStyle = entity.type === 'collectible' ? '#5be5ff' : entity.type === 'obstacle' ? '#ff7055' : entity.type === 'tree' ? '#35b568' : entity.type === 'rock' ? '#9a9388' : '#66bb6a';
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,.45)';
    ctx.stroke();
    OC.overviewHitPoints.push({ x: point.x, y: point.y, radius, label: label(entity), entity });
  });
  const player = worldToOverview(pathCenterAt(OC.distance) + OC.player.x, -OC.distance);
  ctx.fillStyle = '#f4ead4';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eec45a';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
}