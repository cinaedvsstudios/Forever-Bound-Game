import { OC } from './obstacle-course-state.js';
import { $ } from './obstacle-course-utils.js';
import { pathCenterAt, pathHalfWidthAt } from './obstacle-course-ground-path.js';

const OVERVIEW_X_ZOOM = 15.0;
const OVERVIEW_Z_ZOOM = 0.62;
const OVERVIEW_HEIGHT = 560;
const OVERVIEW_FORWARD_RANGE = 760;
const OVERVIEW_BACK_BUFFER = 35;
const HOVER_RADIUS = 9;

export function scheduleOverviewDraw() {
  if (OC.overviewRaf) return;
  OC.overviewRaf = requestAnimationFrame(() => { OC.overviewRaf = 0; drawOverview(); });
}

function overviewDistanceRange() {
  const start = Math.max(0, OC.distance - OVERVIEW_BACK_BUFFER);
  const end = Math.min(OC.courseLength, OC.distance + OVERVIEW_FORWARD_RANGE);
  return { start, end };
}

export function worldToOverview(x, z) {
  const c = $('hf-overview');
  const width = c?.width || 280;
  const height = c?.height || OVERVIEW_HEIGHT;
  const worldDistance = -Number(z || 0);
  const relativeDistance = worldDistance - Number(OC.distance || 0);
  return { x: width / 2 + Number(x || 0) * OVERVIEW_X_ZOOM, y: height - 42 - relativeDistance * OVERVIEW_Z_ZOOM };
}

function filenameFromUrl(url = '') {
  const clean = String(url || '').split('?')[0].split('#')[0];
  return clean.split('/').pop() || 'no asset url';
}

function labelForEntity(entity) {
  const url = entity?.assetUrl || entity?.object?.userData?.assetUrl || '';
  const name = filenameFromUrl(url);
  const x = Number(entity?.x ?? entity?.object?.position?.x ?? 0).toFixed(1);
  const z = Number(entity?.z ?? entity?.object?.position?.z ?? 0).toFixed(1);
  const selectHint = url ? '\nclick: select GLB controls' : '';
  return `${entity?.type || 'entity'}\n${name}\nx ${x} · z ${z}${selectHint}`;
}

function ensureTooltip() {
  let tip = document.getElementById('hf-overview-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'hf-overview-tooltip';
    tip.style.cssText = 'position:fixed;z-index:10000;display:none;pointer-events:none;white-space:pre-line;background:#080b10;color:#f4ead4;border:1px solid rgba(238,196,90,.75);border-radius:8px;padding:7px 9px;font:11px/1.3 monospace;box-shadow:0 10px 30px rgba(0,0,0,.45);max-width:260px';
    document.body.appendChild(tip);
  }
  return tip;
}

function canvasPointFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / Math.max(1, rect.width);
  const scaleY = canvas.height / Math.max(1, rect.height);
  return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
}

function nearestHitFromEvent(canvas, event) {
  const point = canvasPointFromEvent(canvas, event);
  let best = null;
  let bestDist = HOVER_RADIUS;
  (OC.overviewHitPoints || []).forEach((hit) => {
    const dist = Math.hypot(hit.x - point.x, hit.y - point.y);
    if (dist <= bestDist) {
      best = hit;
      bestDist = dist;
    }
  });
  return best;
}

function selectOverviewHit(hit) {
  const entity = hit?.entity;
  const assetUrl = entity?.assetUrl || entity?.object?.userData?.assetUrl || '';
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
    if (glbSelect && Array.from(glbSelect.options).some((option) => option.value === assetUrl)) {
      glbSelect.value = assetUrl;
      glbSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, 0);
}

function bindOverviewHover(canvas) {
  if (canvas.dataset.ocOverviewHoverBound === 'true') return;
  canvas.dataset.ocOverviewHoverBound = 'true';
  const tooltip = ensureTooltip();
  canvas.addEventListener('mousemove', (event) => {
    const best = nearestHitFromEvent(canvas, event);
    if (!best) {
      tooltip.style.display = 'none';
      canvas.style.cursor = 'default';
      return;
    }
    tooltip.textContent = best.label;
    tooltip.style.left = `${event.clientX + 14}px`;
    tooltip.style.top = `${event.clientY + 14}px`;
    tooltip.style.display = 'block';
    canvas.style.cursor = best.entity?.assetUrl ? 'pointer' : 'help';
  });
  canvas.addEventListener('click', (event) => {
    const best = nearestHitFromEvent(canvas, event);
    selectOverviewHit(best);
  });
  canvas.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
    canvas.style.cursor = 'default';
  });
}

function drawPathLane(ctx) {
  if (!OC.overviewPathOverlay) return;
  const { start, end } = overviewDistanceRange();
  ctx.fillStyle = 'rgba(238,196,90,.18)';
  for (let d = start; d < end; d += 6) {
    const center = pathCenterAt(d);
    const half = pathHalfWidthAt(d);
    const left = worldToOverview(center - half, -d);
    const right = worldToOverview(center + half, -d);
    const width = Math.max(2, right.x - left.x);
    ctx.fillRect(left.x, left.y - 1, width, 2);
  }

  ctx.strokeStyle = 'rgba(238,196,90,.55)';
  ctx.lineWidth = 1.5;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    for (let d = start; d < end; d += 16) {
      const p = worldToOverview(pathCenterAt(d) + side * pathHalfWidthAt(d), -d);
      if (d === start) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  });

  ctx.strokeStyle = '#d09a55';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let d = start; d < end; d += 16) {
    const p = worldToOverview(pathCenterAt(d), -d);
    if (d === start) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

export function drawOverview() {
  const c = $('hf-overview');
  if (!c) return;
  bindOverviewHover(c);
  if (c.height !== OVERVIEW_HEIGHT) c.height = OVERVIEW_HEIGHT;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#101914';
  ctx.fillRect(0, 0, c.width, c.height);
  drawPathLane(ctx);
  OC.overviewHitPoints = [];
  OC.entities.forEach((e) => {
    if (e.visibleOnOverview === false) return;
    const p = worldToOverview(e.x ?? e.object?.position?.x ?? 0, e.z ?? e.object?.position?.z ?? 0);
    if (p.y < -20 || p.y > c.height + 20 || p.x < -30 || p.x > c.width + 30) return;
    const radius = e.type === 'tree' ? 4.2 : 3.4;
    ctx.fillStyle = e.type === 'collectible' ? '#5be5ff' : e.type === 'obstacle' ? '#ff7055' : e.type === 'tree' ? '#2da357' : e.type === 'rock' ? '#9a9388' : '#66bb6a';
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    OC.overviewHitPoints.push({ x: p.x, y: p.y, radius, label: labelForEntity(e), entity: e });
  });
  const player = worldToOverview(pathCenterAt(OC.distance) + OC.player.x, -OC.distance);
  ctx.fillStyle = '#f4ead4';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eec45a';
  ctx.strokeRect(1, 1, c.width - 2, c.height - 2);
}