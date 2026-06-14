import { OC, SECTION_WORLD_LENGTH, SECTION_WORLD_STEP, COURSE_WORLD_WIDTH, GROUND_Y } from './obstacle-course-state.js';
import { TEMPLATES, GLB_ASSETS } from './obstacle-course-assets.js';
import { clamp, lerp } from './obstacle-course-utils.js';
import { THREE, loadTexture } from './obstacle-course-scene.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';
import { createInstancedAssetGroup } from './obstacle-course-glb.js';

const TILE_SEAM_OVERLAP = 0.18;
const DENSITY_PER_1000 = {
  nearTreePairs: 18,
  farTreePairs: 8,
  rocks: 18,
  edgeDetailPairs: 24,
  farDetailPairs: 10,
};

function hashString(value) {
  let hash = 2166136261;
  const text = String(value || 'obstacle-course');
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seedText) {
  let seed = hashString(seedText) || 1;
  return function next() {
    seed += 0x6D2B79F5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randFrom(rng, min, max) { return min + rng() * (max - min); }
function pickFrom(rng, items) { return items[Math.floor(rng() * items.length)]; }
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
  if (['straight', 'centre', 'center', 'left', 'right', 'lefttostraight', 'righttostraight', 'righttostraight', 'kink'].includes(legacy)) return '1';
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

function fallbackTree(rng = Math.random) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 4.0, 6), new THREE.MeshStandardMaterial({ color: 0x5a321e }));
  const crown = new THREE.Mesh(new THREE.ConeGeometry(randFrom(rng, 1.8, 2.9), randFrom(rng, 5.4, 8.2), 7), new THREE.MeshStandardMaterial({ color: 0x1d5a34 }));
  trunk.position.y = GROUND_Y + 2.0;
  crown.position.y = GROUND_Y + 6.5;
  tree.add(trunk, crown);
  return tree;
}

function fallbackRock(rng = Math.random) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(randFrom(rng, 0.64, 1.5), 0), new THREE.MeshStandardMaterial({ color: 0x7d776b }));
  rock.position.y = GROUND_Y + 0.76;
  return rock;
}

function fallbackDetail(rng = Math.random) {
  const detail = new THREE.Mesh(new THREE.ConeGeometry(randFrom(rng, 0.36, 0.7), randFrom(rng, 0.8, 1.5), 5), new THREE.MeshStandardMaterial({ color: 0x2e8b45 }));
  detail.position.y = GROUND_Y + 0.7;
  return detail;
}

function sceneryOffset() { return Math.max(0, Number(OC.sceneryDistance || 0)) * 0.12; }
function scatterX(rng, distance, side, fromHalf, toHalf) {
  const center = pathCenterAt(distance);
  const half = pathHalfWidthAt(distance);
  const offset = sceneryOffset();
  return center + side * (half + randFrom(rng, fromHalf + offset, toHalf + offset));
}
function sectionCount() { return Math.max(1, OC.courseLength / 1000); }
function makeDistances(rng, count, start, end, jitter = 10) {
  const safeCount = Math.max(1, Math.round(count));
  const span = Math.max(1, end - start);
  const step = span / safeCount;
  const result = [];
  for (let i = 0; i < safeCount; i += 1) result.push(start + i * step + randFrom(rng, -jitter, jitter));
  return result.filter((d) => d > 0 && d < end + 40);
}

function screenEdgeScaleForX(x, minScale = 0.68) {
  const half = COURSE_WORLD_WIDTH * 0.5;
  const t = clamp(Math.abs(Number(x || 0)) / half, 0, 1);
  const smooth = t * t * (3 - 2 * t);
  return lerp(1, minScale, smooth);
}

function entityForInstance(type, x, z, assetUrl = '') { OC.entities.push({ type, x, z, assetUrl }); }
function queuePlacement(rng, queues, layer, type, assetList, fallbackFactory, x, groundOffset, z, scale = 1) {
  const asset = assetList.length ? pickFrom(rng, assetList) : null;
  const adjustedScale = type === 'tree' ? scale * screenEdgeScaleForX(x) : scale;
  if (!asset) {
    const object = fallbackFactory(rng);
    object.position.x = x;
    object.position.z = z;
    object.rotation.y = randFrom(rng, 0, Math.PI * 2);
    object.scale.multiplyScalar(adjustedScale);
    layer.group.add(object);
    registerEntity(type, object, { x, z, fallback: true });
    return;
  }
  const key = `${asset.url}::${layer.id}`;
  if (!queues.has(key)) queues.set(key, { layer, type, asset, placements: [] });
  queues.get(key).placements.push({ x, y: GROUND_Y + groundOffset, z, rotationY: randFrom(rng, 0, Math.PI * 2), scale: adjustedScale * (asset.scale || 1) });
  entityForInstance(type, x, z, asset.url);
}

function flushPlacementQueues(queues) {
  queues.forEach(({ layer, asset, placements }) => {
    const group = createInstancedAssetGroup(asset, placements);
    if (group) layer.group.add(group);
  });
}

export function scatterScenery() {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  const rng = seededRandom(`${OC.templateId}|${OC.difficulty}|${OC.courseLength}|${OC.pathSequence.map((p) => p.key).join(',') || '1'}|${OC.glbTemplates.size}`);
  const treeLayer = makeLayer('trees', 'Trees', new THREE.Group(), { order: 10 });
  const rockLayer = makeLayer('rocks', 'Rocks', new THREE.Group(), { order: 11 });
  const detailLayer = makeLayer('details', 'Ferns / Bushes / Details', new THREE.Group(), { order: 12 });
  OC.world.add(treeLayer.group, rockLayer.group, detailLayer.group);
  const nearTreeAssets = GLB_ASSETS.filter((asset) => asset.type === 'nearTree' && OC.glbTemplates.has(asset.url));
  const farTreeAssets = GLB_ASSETS.filter((asset) => ['nearTree', 'farTree'].includes(asset.type) && OC.glbTemplates.has(asset.url));
  const rockAssets = GLB_ASSETS.filter((asset) => asset.type === 'rock' && OC.glbTemplates.has(asset.url));
  const edgeDetailAssets = GLB_ASSETS.filter((asset) => asset.type === 'edgeDetail' && OC.glbTemplates.has(asset.url));
  const farDetailAssets = GLB_ASSETS.filter((asset) => ['edgeDetail', 'farDetail'].includes(asset.type) && OC.glbTemplates.has(asset.url));
  const sections = sectionCount();
  const end = OC.courseLength + 80;
  const queues = new Map();

  makeDistances(rng, DENSITY_PER_1000.nearTreePairs * sections * template.treeRate, 28, end, 18).forEach((d) => {
    [-1, 1].forEach((side) => queuePlacement(rng, queues, treeLayer, 'tree', nearTreeAssets, fallbackTree, scatterX(rng, d, side, 4.0, 9.5), 0, -d + randFrom(rng, -5, 5), randFrom(rng, 1.0, 1.3)));
  });
  makeDistances(rng, DENSITY_PER_1000.farTreePairs * sections * template.treeRate, 60, end, 26).forEach((d) => {
    [-1, 1].forEach((side) => queuePlacement(rng, queues, treeLayer, 'tree', farTreeAssets, fallbackTree, scatterX(rng, d, side, 13, 25), 0, -d + randFrom(rng, -9, 9), randFrom(rng, 1.0, 1.3)));
  });
  makeDistances(rng, DENSITY_PER_1000.rocks * sections * template.rockRate, 38, OC.courseLength + 40, 18).forEach((d) => {
    const side = rng() > 0.5 ? 1 : -1;
    queuePlacement(rng, queues, rockLayer, 'rock', rockAssets, fallbackRock, scatterX(rng, d, side, 0.8, 8), 0, -d + randFrom(rng, -4, 4), randFrom(rng, 0.7, 1.0));
  });
  makeDistances(rng, DENSITY_PER_1000.edgeDetailPairs * sections * template.detailRate, 20, OC.courseLength + 40, 14).forEach((d) => {
    [-1, 1].forEach((side) => queuePlacement(rng, queues, detailLayer, 'detail', edgeDetailAssets, fallbackDetail, scatterX(rng, d, side, 0.2, 3.0), 0, -d + randFrom(rng, -3, 3), randFrom(rng, 0.75, 1.15)));
  });
  makeDistances(rng, DENSITY_PER_1000.farDetailPairs * sections * template.detailRate, 50, OC.courseLength + 60, 22).forEach((d) => {
    [-1, 1].forEach((side) => queuePlacement(rng, queues, detailLayer, 'detail', farDetailAssets, fallbackDetail, scatterX(rng, d, side, 5, 13), 0, -d + randFrom(rng, -5, 5), randFrom(rng, 0.65, 1.0)));
  });
  flushPlacementQueues(queues);
}

export function rebuildGroundPathAndScenery() { clearWorld(); buildGroundAndPath(); scatterScenery(); }
