import { OC, COURSE_WORLD_WIDTH, GROUND_Y } from './obstacle-course-state.js';
import { ASSETS, TEMPLATES, GLB_ASSETS } from './obstacle-course-assets.js';
import { clamp, lerp } from './obstacle-course-utils.js';
import { THREE, loadTexture } from './obstacle-course-scene.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';
import { createInstancedAssetGroup } from './obstacle-course-glb.js';
import { pathCenterAt, pathHalfWidthAt } from './obstacle-course-ground-path.js';

const TREE_ROOT_LIFT = 0.22;
const TREE_OUTER_LIMIT_FROM_PATH_EDGE = 2.2;
const DETAIL_OUTER_LIMIT_FROM_PATH_EDGE = 2.35;
const SHADOW_Y_OFFSET = 0.045;
const SHADOW_BASE_OPACITY = 0.34;
const DENSITY_PER_1000 = {
  pathEdgeTreePairs: 42,
  pathInsideTreePairs: 54,
  limitedOuterTreePairs: 18,
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
function loadedAssets(type) { return GLB_ASSETS.filter((asset) => asset.type === type && OC.glbTemplates.has(asset.url)); }
function loadedTreeAssets() { return GLB_ASSETS.filter((asset) => ['nearTree', 'farTree'].includes(asset.type) && OC.glbTemplates.has(asset.url)); }
function assetsNamed(assets, token) { return assets.filter((asset) => asset.url.includes(token)); }
function uniqueAssets(assets) { return Array.from(new Map(assets.map((asset) => [asset.url, asset])).values()); }
function preferredAssets(primary, fallback) { return primary.length ? primary : fallback; }

function fallbackTree(rng = Math.random) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 4.0, 6), new THREE.MeshStandardMaterial({ color: 0x5a321e }));
  const crown = new THREE.Mesh(new THREE.ConeGeometry(randFrom(rng, 1.8, 2.9), randFrom(rng, 5.4, 8.2), 7), new THREE.MeshStandardMaterial({ color: 0x1d5a34 }));
  trunk.position.y = GROUND_Y + 2.0;
  crown.position.y = GROUND_Y + 6.5;
  tree.add(trunk, crown);
  return tree;
}

function fallbackDetail(rng = Math.random) {
  const detail = new THREE.Mesh(new THREE.ConeGeometry(randFrom(rng, 0.36, 0.7), randFrom(rng, 0.8, 1.5), 5), new THREE.MeshStandardMaterial({ color: 0x2e8b45 }));
  detail.position.y = GROUND_Y + 0.7;
  return detail;
}

function sectionCount() { return Math.max(1, OC.courseLength / 1000); }
function pathEdgeX(rng, distance, side) {
  const center = pathCenterAt(distance);
  const half = pathHalfWidthAt(distance);
  return center + side * (half + randFrom(rng, 0.05, 0.95));
}
function pathInsideEdgeX(rng, distance, side) {
  const center = pathCenterAt(distance);
  const half = pathHalfWidthAt(distance);
  return center + side * Math.max(0.35, half - randFrom(rng, 0.25, 1.25));
}
function limitedOutsideX(rng, distance, side, minFromEdge = 1.05, maxFromEdge = TREE_OUTER_LIMIT_FROM_PATH_EDGE) {
  const center = pathCenterAt(distance);
  const half = pathHalfWidthAt(distance);
  return center + side * (half + randFrom(rng, minFromEdge, maxFromEdge));
}
function limitedDetailX(rng, distance, side, minFromEdge = 0.2, maxFromEdge = DETAIL_OUTER_LIMIT_FROM_PATH_EDGE) {
  const center = pathCenterAt(distance);
  const half = pathHalfWidthAt(distance);
  return center + side * (half + randFrom(rng, minFromEdge, maxFromEdge));
}
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

function pathEdgeTreeScale(rng, distance) {
  const closeDistanceScale = clamp((Number(distance || 0) - 70) / 280, 0.58, 1);
  return randFrom(rng, 0.22, 0.34) * closeDistanceScale;
}
function pathInsideTreeScale(rng, distance) {
  const closeDistanceScale = clamp((Number(distance || 0) - 70) / 280, 0.58, 1);
  return randFrom(rng, 0.18, 0.30) * closeDistanceScale;
}
function limitedOuterTreeScale(rng, distance) {
  const closeDistanceScale = clamp((Number(distance || 0) - 70) / 280, 0.58, 1);
  return randFrom(rng, 0.18, 0.28) * closeDistanceScale;
}

function layerScale(layer) { return Math.max(0.0001, Number(layer?.scale || 1)); }
function localPlacementForLayer(layer, x, y, z) {
  const scale = layerScale(layer);
  return {
    x: (Number(x || 0) - Number(layer?.x || 0)) / scale,
    y,
    z: (Number(z || 0) - Number(layer?.z || 0)) / scale,
  };
}
function entityForInstance(type, layer, x, z, localX, localZ, assetUrl = '') {
  OC.entities.push({ type, layerId: layer.id, x, z, localX, localZ, assetUrl });
}

function treeShadowTexture(rng) {
  const options = ASSETS.shadows?.tree || [];
  const url = options.length ? pickFrom(rng, options) : '';
  return url ? loadTexture(url, { repeat: [1, 1], repeatX: false, repeatY: false }) : null;
}

function addTreeShadow(rng, shadowLayer, x, z, scale) {
  if (!shadowLayer?.group) return;
  const texture = treeShadowTexture(rng);
  if (!texture) return;
  const shadowLength = clamp(28 * Number(scale || 1), 4.8, 12.5) * randFrom(rng, 0.88, 1.18);
  const shadowWidth = shadowLength * randFrom(rng, 0.52, 0.72);
  const geometry = new THREE.PlaneGeometry(shadowLength, shadowWidth, 1, 1);
  geometry.translate(-shadowLength * 0.42, 0, 0);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: SHADOW_BASE_OPACITY,
    depthWrite: false,
    depthTest: true,
    blending: THREE.MultiplyBlending,
    side: THREE.DoubleSide,
  });
  const shadow = new THREE.Mesh(geometry, material);
  shadow.position.set(x, GROUND_Y + SHADOW_Y_OFFSET, z + randFrom(rng, -0.2, 0.2));
  shadow.rotation.set(-Math.PI / 2, 0, Math.PI / 2 + randFrom(rng, -0.16, 0.16));
  shadow.renderOrder = 6;
  shadowLayer.group.add(shadow);
  registerEntity('shadow', shadow, { x, z, visibleOnOverview: false });
}

function queuePlacement(rng, queues, layer, shadowLayer, type, assetList, fallbackFactory, x, groundOffset, z, scale = 1) {
  const asset = assetList.length ? pickFrom(rng, assetList) : null;
  const adjustedScale = type === 'tree' ? scale * screenEdgeScaleForX(x) : scale;
  const local = localPlacementForLayer(layer, x, GROUND_Y + groundOffset, z);
  if (type === 'tree') addTreeShadow(rng, shadowLayer, x, z, adjustedScale);
  if (!asset) {
    const object = fallbackFactory(rng);
    object.position.x = local.x;
    object.position.z = local.z;
    object.rotation.y = randFrom(rng, 0, Math.PI * 2);
    object.scale.multiplyScalar(adjustedScale);
    layer.group.add(object);
    registerEntity(type, object, { x, z, localX: local.x, localZ: local.z, layerId: layer.id, fallback: true });
    return;
  }
  const key = `${asset.url}::${layer.id}`;
  if (!queues.has(key)) queues.set(key, { layer, type, asset, placements: [] });
  queues.get(key).placements.push({ x: local.x, y: local.y, z: local.z, rotationY: randFrom(rng, 0, Math.PI * 2), scale: adjustedScale * (asset.scale || 1) });
  entityForInstance(type, layer, x, z, local.x, local.z, asset.url);
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
  const shadowLayer = makeLayer('treeShadows', 'Tree Shadows', new THREE.Group(), { order: 6, opacity: SHADOW_BASE_OPACITY, brightness: 1, contrast: 1, saturation: 1 });
  const treeLayer = makeLayer('trees', 'Trees', new THREE.Group(), { order: 20 });
  const detailLayer = makeLayer('details', 'Ferns / Bushes / Details', new THREE.Group(), { order: 25 });
  OC.world.add(shadowLayer.group, treeLayer.group, detailLayer.group);

  const allTrees = loadedTreeAssets();
  const nearTreeAssets = loadedAssets('nearTree');
  const pathEdgeTreeAssets = preferredAssets(uniqueAssets([
    ...assetsNamed(allTrees, 'pine_tree'),
    ...assetsNamed(allTrees, 'oak_trees'),
    ...assetsNamed(allTrees, 'tree_low-poly'),
  ]), nearTreeAssets);
  const oakTreeAssets = preferredAssets(assetsNamed(allTrees, 'oak_trees'), pathEdgeTreeAssets);
  const edgeDetailAssets = loadedAssets('edgeDetail');
  const farDetailAssets = GLB_ASSETS.filter((asset) => ['edgeDetail', 'farDetail'].includes(asset.type) && OC.glbTemplates.has(asset.url));
  const sections = sectionCount();
  const end = OC.courseLength + 80;
  const queues = new Map();

  makeDistances(rng, DENSITY_PER_1000.pathInsideTreePairs * sections * template.treeRate, 28, end, 10).forEach((d) => {
    [-1, 1].forEach((side) => queuePlacement(rng, queues, treeLayer, shadowLayer, 'tree', pathEdgeTreeAssets, fallbackTree, pathInsideEdgeX(rng, d, side), TREE_ROOT_LIFT, -d + randFrom(rng, -4, 4), pathInsideTreeScale(rng, d)));
  });
  makeDistances(rng, DENSITY_PER_1000.pathEdgeTreePairs * sections * template.treeRate, 28, end, 12).forEach((d) => {
    [-1, 1].forEach((side) => queuePlacement(rng, queues, treeLayer, shadowLayer, 'tree', pathEdgeTreeAssets, fallbackTree, pathEdgeX(rng, d, side), TREE_ROOT_LIFT, -d + randFrom(rng, -4, 4), pathEdgeTreeScale(rng, d)));
  });
  makeDistances(rng, DENSITY_PER_1000.limitedOuterTreePairs * sections * template.treeRate, 60, end, 20).forEach((d) => {
    [-1, 1].forEach((side) => queuePlacement(rng, queues, treeLayer, shadowLayer, 'tree', oakTreeAssets, fallbackTree, limitedOutsideX(rng, d, side), TREE_ROOT_LIFT, -d + randFrom(rng, -7, 7), limitedOuterTreeScale(rng, d)));
  });
  makeDistances(rng, DENSITY_PER_1000.edgeDetailPairs * sections * template.detailRate, 20, OC.courseLength + 40, 14).forEach((d) => {
    [-1, 1].forEach((side) => queuePlacement(rng, queues, detailLayer, null, 'detail', edgeDetailAssets, fallbackDetail, limitedDetailX(rng, d, side, 0.15, 1.6), 0, -d + randFrom(rng, -3, 3), randFrom(rng, 0.75, 1.15)));
  });
  makeDistances(rng, DENSITY_PER_1000.farDetailPairs * sections * template.detailRate, 50, OC.courseLength + 60, 22).forEach((d) => {
    [-1, 1].forEach((side) => queuePlacement(rng, queues, detailLayer, null, 'detail', farDetailAssets, fallbackDetail, limitedDetailX(rng, d, side, 1.6, DETAIL_OUTER_LIMIT_FROM_PATH_EDGE), 0, -d + randFrom(rng, -5, 5), randFrom(rng, 0.65, 1.0)));
  });
  flushPlacementQueues(queues);
}
