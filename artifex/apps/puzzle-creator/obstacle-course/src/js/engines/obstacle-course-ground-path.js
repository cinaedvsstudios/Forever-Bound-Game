import { OC, SECTION_WORLD_LENGTH, SECTION_WORLD_STEP, COURSE_WORLD_WIDTH, GROUND_Y } from './obstacle-course-state.js';
import { clamp, lerp } from './obstacle-course-utils.js';
import { THREE, loadTexture } from './obstacle-course-scene.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';

const TILE_SEAM_OVERLAP = 0.18;

function mapTiles() { return OC.groundPathMap?.tiles || []; }
function tileById(id) { return mapTiles().find((tile) => String(tile.id) === String(id)) || null; }
function fallbackTile() { return tileById('1') || mapTiles()[0] || null; }

function imageUrlForTile(tile) {
  if (!tile) return '';
  const asset = (OC.groundTileAssets || []).find((item) => item.tile?.id === tile.id || item.tile?.file === tile.file);
  if (asset?.url) return asset.url;
  const root = OC.groundPathMap?.imageRoot || './assets/ground/';
  return /^https?:\/\//i.test(tile.file) ? tile.file : `${root}${tile.file}`;
}

function interpolatePathPoint(tile, localT) {
  const points = tile?.path?.points || [];
  if (!points.length) return { x: 0.5, halfWidth: 0.07 };
  const t = clamp(localT, 0, 1);
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    if (t >= a.y && t <= b.y) {
      const f = b.y === a.y ? 0 : (t - a.y) / (b.y - a.y);
      return { x: lerp(a.x, b.x, f), halfWidth: lerp(a.halfWidth, b.halfWidth, f) };
    }
  }
  const p = t < points[0].y ? points[0] : points[points.length - 1];
  return { x: p.x, halfWidth: p.halfWidth };
}

function legacyPathIdToTileId(id) {
  if (tileById(id)) return id;
  const legacy = String(id || '').toLowerCase();
  if (['straight', 'centre', 'center', 'left', 'right', 'lefttostraight', 'righttostraight', 'kink'].includes(legacy)) return '1';
  return id || '1';
}

function segmentListFromSettings() {
  const custom = Array.isArray(OC.customPathSequence) ? OC.customPathSequence : [];
  if (custom.length) return custom;
  const sequence = OC.groundPathMap?.sequence || [];
  if (sequence.length) return sequence.map((id, index) => ({ id, distance: index * SECTION_WORLD_STEP }));
  return mapTiles().map((tile, index) => ({ id: tile.id, distance: index * SECTION_WORLD_STEP }));
}

export function generatePathSequence() {
  const source = segmentListFromSettings();
  const baseSource = source.length ? source : [{ id: '1', distance: 0 }];
  const requiredCount = Math.ceil(OC.courseLength / SECTION_WORLD_STEP) + 4;
  OC.pathSequence = [];

  for (let i = 0; i < Math.max(requiredCount, baseSource.length); i += 1) {
    const raw = baseSource[i % baseSource.length];
    const rawId = typeof raw === 'string' ? raw : raw.id ?? raw.tileId ?? raw.key ?? '1';
    const tile = tileById(legacyPathIdToTileId(rawId)) || fallbackTile();
    if (!tile) continue;
    const worldLength = Number(tile.worldLength || OC.groundPathMap?.defaultWorldLength || SECTION_WORLD_LENGTH);
    const worldWidth = Number(tile.worldWidth || OC.groundPathMap?.defaultWorldWidth || COURSE_WORLD_WIDTH);
    const distance = Number(typeof raw === 'object' && raw.distance !== undefined ? raw.distance : i * SECTION_WORLD_STEP);
    OC.pathSequence.push({ tile, key: tile.id, distance, worldLength, worldWidth, startX: 0, endX: 0 });
  }
  OC.pathSequence.sort((a, b) => a.distance - b.distance);
}

export function pathSegmentAt(distance) {
  if (!OC.pathSequence.length) return null;
  let current = OC.pathSequence[0];
  for (let i = 0; i < OC.pathSequence.length; i += 1) {
    if (OC.pathSequence[i].distance <= distance) current = OC.pathSequence[i];
    else break;
  }
  return current;
}

export function pathCenterAt(distance) {
  const seg = pathSegmentAt(distance);
  if (!seg) return 0;
  const t = clamp((distance - seg.distance) / (seg.worldLength || SECTION_WORLD_STEP), 0, 1);
  const point = interpolatePathPoint(seg.tile, t);
  return (point.x - 0.5) * (seg.worldWidth || COURSE_WORLD_WIDTH);
}

export function pathHalfWidthAt(distance) {
  const seg = pathSegmentAt(distance);
  if (!seg) return OC.pathVisualWidth * 0.5;
  const t = clamp((distance - seg.distance) / (seg.worldLength || SECTION_WORLD_STEP), 0, 1);
  const point = interpolatePathPoint(seg.tile, t);
  return Math.max(2.6, Number(point.halfWidth || 0.07) * (seg.worldWidth || COURSE_WORLD_WIDTH));
}

export function playerWorldX() { return pathCenterAt(OC.distance) + OC.player.x; }
export function pathAlphaAtWorld(worldX, distance) { return Math.abs(worldX - pathCenterAt(distance)) <= pathHalfWidthAt(distance) ? 1 : 0; }
export function nearestVisiblePathX(distance, worldX) { const center = pathCenterAt(distance); const half = pathHalfWidthAt(distance); return clamp(worldX, center - half, center + half); }
export function pathStatus() {
  const worldX = playerWorldX();
  const center = pathCenterAt(OC.distance);
  const half = pathHalfWidthAt(OC.distance);
  if (Math.abs(worldX - center) <= half) return 'on';
  OC.pathHintDirection = worldX > center ? 'left' : 'right';
  return 'off';
}

export function clearWorld() {
  if (!OC.world) return;
  while (OC.world.children.length) OC.world.remove(OC.world.children[0]);
  OC.layers.clear();
  OC.entities = [];
  OC.objects = [];
  OC.glbInstances = [];
}

export function buildGroundAndPath() {
  generatePathSequence();
  const groundLayer = new THREE.Group();
  const pathLayer = new THREE.Group();
  makeLayer('ground', 'Ground / Path Tiles', groundLayer, { order: 1 });
  makeLayer('path', 'Path Logic Guide (hidden)', pathLayer, { order: 2, visible: false });
  OC.world.add(groundLayer, pathLayer);
  OC.pathSequence.forEach((seg) => {
    const length = (seg.worldLength || SECTION_WORLD_LENGTH) + TILE_SEAM_OVERLAP;
    const z = -seg.distance - (seg.worldLength || SECTION_WORLD_LENGTH) / 2 - TILE_SEAM_OVERLAP / 2;
    const tileUrl = imageUrlForTile(seg.tile);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(seg.worldWidth || COURSE_WORLD_WIDTH, length, 1, 1),
      new THREE.MeshStandardMaterial({
        map: loadTexture(tileUrl, { repeat: [1, 1], repeatX: false }),
        transparent: true,
        alphaTest: 0.02,
        roughness: 1,
        side: THREE.DoubleSide,
        depthWrite: true,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, GROUND_Y, z);
    groundLayer.add(ground);
    registerEntity('ground', ground, { x: 0, z, visibleOnOverview: false, tile: seg.tile?.id });
  });
}
