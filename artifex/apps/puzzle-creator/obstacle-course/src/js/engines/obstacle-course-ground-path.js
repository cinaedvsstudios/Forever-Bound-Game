import { OC, SECTION_WORLD_LENGTH, SECTION_WORLD_STEP, COURSE_WORLD_WIDTH, GROUND_Y, START_DISTANCE } from './obstacle-course-state.js';
import { clamp, lerp } from './obstacle-course-utils.js';
import { THREE, loadTexture } from './obstacle-course-scene.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';

const TILE_SEAM_OVERLAP = 0.18;
const GROUND_BUMP_SCALE = 0.075;
const GROUND_DISPLACEMENT_FILE = '1bump.jpg';
const GROUND_DISPLACEMENT_SEGMENTS = 64;
const GROUND_DISPLACEMENT_SCALE = 0.42;
const GROUND_DISPLACEMENT_BIAS = -0.18;
const ENDLESS_PATH_AHEAD_DISTANCE = 3200;
const ENDLESS_PATH_INITIAL_DISTANCE = 6400;
const ENDLESS_PATH_APPEND_SEGMENT_LIMIT = 160;

function mapTiles() { return OC.groundPathMap?.tiles || []; }
function tileById(id) { return mapTiles().find((tile) => String(tile.id) === String(id)) || null; }
function fallbackTile() { return tileById('1') || mapTiles()[0] || null; }
function groundImageRoot() { return OC.groundPathMap?.imageRoot || './assets/ground/'; }

function cacheBusted(url) {
  if (!url) return '';
  const version = OC.cacheVersion || Date.now();
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

function imageUrlForTile(tile) {
  if (!tile) return '';
  const asset = (OC.groundTileAssets || []).find((item) => item.tile?.id === tile.id || item.tile?.file === tile.file);
  if (asset?.url) return cacheBusted(asset.url);
  const root = groundImageRoot();
  const url = /^https?:\/\//i.test(tile.file) ? tile.file : `${root}${tile.file}`;
  return cacheBusted(url);
}

function displacementUrlForTile(tile) {
  const file = tile?.displacementFile || tile?.bumpFile || OC.groundPathMap?.displacementFile || OC.groundPathMap?.bumpFile || GROUND_DISPLACEMENT_FILE;
  const url = /^https?:\/\//i.test(file) ? file : `${groundImageRoot()}${file}`;
  return cacheBusted(url);
}

function worldWidthForTile(tile, worldLength) {
  const pixelWidth = Number(tile?.pixelWidth || OC.groundPathMap?.tilePixelWidth || 0);
  const pixelHeight = Number(tile?.pixelHeight || OC.groundPathMap?.tilePixelHeight || 0);
  if (pixelWidth > 0 && pixelHeight > 0) return worldLength * (pixelWidth / pixelHeight);
  return Number(tile?.worldWidth || OC.groundPathMap?.defaultWorldWidth || COURSE_WORLD_WIDTH);
}

function groundVisualScale() {
  const layerScale = Number(OC.layers?.get?.('ground')?.scale);
  const pendingScale = Number(OC.pendingLayerSettings?.ground?.scale);
  const defaultScale = Number(OC.defaultLayerSettings?.ground?.scale);
  const scale = Number.isFinite(layerScale) && layerScale > 0 ? layerScale : Number.isFinite(pendingScale) && pendingScale > 0 ? pendingScale : Number.isFinite(defaultScale) && defaultScale > 0 ? defaultScale : 1;
  return Math.max(0.0001, scale);
}

function endlessUnscaledDistanceFor(visualDistance) {
  return Math.max(0, Number(visualDistance || 0)) / groundVisualScale();
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

function segmentDistance(raw, index, baseLength) {
  if (typeof raw === 'object' && raw.distance !== undefined && index < baseLength) return Number(raw.distance);
  return index * SECTION_WORLD_STEP;
}

function makePathSegment(raw, index, baseLength) {
  const rawId = typeof raw === 'string' ? raw : raw.id ?? raw.tileId ?? raw.key ?? '1';
  const tile = tileById(legacyPathIdToTileId(rawId)) || fallbackTile();
  if (!tile) return null;
  const worldLength = Number(tile.worldLength || OC.groundPathMap?.defaultWorldLength || SECTION_WORLD_LENGTH);
  const worldWidth = worldWidthForTile(tile, worldLength);
  const distance = segmentDistance(raw, index, baseLength);
  return { tile, key: tile.id, distance, worldLength, worldWidth, startX: 0, endX: 0 };
}

function renderGroundSegment(seg, groundLayer) {
  if (!seg || !groundLayer) return;
  const length = (seg.worldLength || SECTION_WORLD_LENGTH) + TILE_SEAM_OVERLAP;
  const width = worldWidthForTile(seg.tile, length);
  const z = -seg.distance - (seg.worldLength || SECTION_WORLD_LENGTH) / 2 - TILE_SEAM_OVERLAP / 2;
  const tileUrl = imageUrlForTile(seg.tile);
  const displacementUrl = displacementUrlForTile(seg.tile);
  const tileTexture = loadTexture(tileUrl, { repeat: [1, 1], repeatX: false });
  const displacementTexture = loadTexture(displacementUrl, { repeat: [1, 1], repeatX: false });
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length, GROUND_DISPLACEMENT_SEGMENTS, GROUND_DISPLACEMENT_SEGMENTS),
    new THREE.MeshStandardMaterial({
      map: tileTexture,
      bumpMap: displacementTexture,
      bumpScale: GROUND_BUMP_SCALE,
      displacementMap: displacementTexture,
      displacementScale: GROUND_DISPLACEMENT_SCALE,
      displacementBias: GROUND_DISPLACEMENT_BIAS,
      transparent: false,
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
}

function appendPathSegmentsUntil(unscaledDistance) {
  const groundLayer = OC.layers?.get?.('ground')?.group;
  if (!groundLayer) return;
  const source = segmentListFromSettings();
  const baseSource = source.length ? source : [{ id: '1', distance: 0 }];
  if (!OC.pathSequence) OC.pathSequence = [];
  if (!Number.isInteger(OC.pathAppendIndex)) OC.pathAppendIndex = OC.pathSequence.length;
  let appended = 0;
  while ((OC.pathAppendIndex * SECTION_WORLD_STEP) < unscaledDistance && appended < ENDLESS_PATH_APPEND_SEGMENT_LIMIT) {
    const raw = baseSource[OC.pathAppendIndex % baseSource.length];
    const seg = makePathSegment(raw, OC.pathAppendIndex, baseSource.length);
    OC.pathAppendIndex += 1;
    appended += 1;
    if (!seg) continue;
    OC.pathSequence.push(seg);
    renderGroundSegment(seg, groundLayer);
  }
  if (appended) OC.pathSequence.sort((a, b) => a.distance - b.distance);
}

export function generatePathSequence() {
  OC.pathSequence = [];
  OC.pathAppendIndex = 0;
}

export function ensurePathCoverage(distance = OC.distance) {
  const targetVisualDistance = Math.max(Number(OC.courseLength || 0), Number(distance || 0) + ENDLESS_PATH_AHEAD_DISTANCE, ENDLESS_PATH_INITIAL_DISTANCE);
  appendPathSegmentsUntil(endlessUnscaledDistanceFor(targetVisualDistance));
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
  ensurePathCoverage(START_DISTANCE);
}
