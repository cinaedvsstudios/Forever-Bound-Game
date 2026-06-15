import { OC } from './obstacle-course-state.js';
import { GLB_ASSETS } from './obstacle-course-assets.js';
import { $ } from './obstacle-course-utils.js';
import { THREE } from './obstacle-course-scene.js';
import { pathCenterAt, pathHalfWidthAt } from './obstacle-course-ground-path.js';

const XZ = 36.0;
const ZZ = 1.08;
const H = 560;
const FWD = 480;
const BACK = 30;
const HIT = 12;
const TREE_LIMIT = 2.2;
const tempMatrix = new THREE.Matrix4();
const tempWorldMatrix = new THREE.Matrix4();
const tempPosition = new THREE.Vector3();

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

function typeFromAsset(url = '') {
  const asset = GLB_ASSETS.find((item) => item.url === url);
  if (!asset) return 'entity';
  if (['nearTree', 'farTree'].includes(asset.type)) return 'tree';
  if (['edgeDetail', 'farDetail'].includes(asset.type)) return 'detail';
  return asset.type || 'entity';
}

function labelForPoint(point) {
  return `${point.type || 'entity'}\n${fileName(point.assetUrl)}\nx ${point.x.toFixed(1)} · z ${point.z.toFixed(1)}\nactual scene position${point.assetUrl ? '\nclick: select GLB controls' : ''}`;
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
  const assetUrl = hit?.point?.assetUrl || '';
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
    canvas.style.cursor = hit.point?.assetUrl ? 'pointer' : 'help';
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
  ctx.fillText('purple = tree limit · dots = actual scene positions', 12, 34);
  ctx.strokeStyle = 'rgba(244,234,212,.25)';
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2, 42);
  ctx.lineTo(canvasWidth / 2, ctx.canvas.height - 26);
  ctx.stroke();
}

function pointColor(type) {
  if (type === 'collectible') return '#5be5ff';
  if (type === 'obstacle') return '#ff7055';
  if (type === 'tree') return '#35b568';
  if (type === 'rock') return '#9a9388';
  return '#66bb6a';
}

function pointRadius(type) {
  if (type === 'tree') return 5.2;
  if (type === 'collectible') return 4.8;
  return 4.2;
}

function addObjectPoint(points, object, fallbackType = 'entity') {
  if (!object || object.visible === false) return;
  object.updateMatrixWorld(true);
  tempPosition.setFromMatrixPosition(object.matrixWorld);
  const assetUrl = object.userData?.glbAssetUrl || object.userData?.assetUrl || '';
  const type = object.userData?.ocType || object.userData?.kind || typeFromAsset(assetUrl) || fallbackType;
  points.push({ x: tempPosition.x, z: tempPosition.z, type, assetUrl, source: object });
}

function addInstancedGroupPoints(points, group) {
  if (!group?.userData?.isInstancedAssetGroup || group.visible === false) return false;
  const assetUrl = group.userData.glbAssetUrl || '';
  const type = typeFromAsset(assetUrl);
  group.updateMatrixWorld(true);
  const mesh = group.children.find((child) => child.isInstancedMesh);
  if (!mesh) return false;
  mesh.updateMatrixWorld(true);
  const count = Math.min(mesh.count || 0, group.userData.placements?.length || mesh.count || 0);
  for (let index = 0; index < count; index += 1) {
    mesh.getMatrixAt(index, tempMatrix);
    tempWorldMatrix.multiplyMatrices(mesh.matrixWorld, tempMatrix);
    tempPosition.setFromMatrixPosition(tempWorldMatrix);
    points.push({ x: tempPosition.x, z: tempPosition.z, type, assetUrl, source: group });
  }
  return true;
}

function actualScenePoints() {
  const points = [];
  const seen = new Set();
  OC.world?.updateMatrixWorld(true);
  (OC.glbInstances || []).forEach((object) => {
    if (addInstancedGroupPoints(points, object)) {
      seen.add(object);
      return;
    }
    addObjectPoint(points, object, typeFromAsset(object?.userData?.glbAssetUrl));
    seen.add(object);
  });
  (OC.entities || []).forEach((entity) => {
    if (entity.visibleOnOverview === false || !entity.object || seen.has(entity.object)) return;
    addObjectPoint(points, entity.object, entity.type);
  });
  return points;
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
  actualScenePoints().forEach((scenePoint) => {
    const point = worldToOverview(scenePoint.x, scenePoint.z);
    if (point.y < -28 || point.y > height + 28 || point.x < -38 || point.x > width + 38) return;
    const radius = pointRadius(scenePoint.type);
    ctx.fillStyle = pointColor(scenePoint.type);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,.45)';
    ctx.stroke();
    OC.overviewHitPoints.push({ x: point.x, y: point.y, radius, label: labelForPoint(scenePoint), point: scenePoint });
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