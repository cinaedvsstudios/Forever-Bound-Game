import { OC, COURSE_WORLD_WIDTH, GROUND_Y } from './obstacle-course-state.js';
import { ASSETS, TEMPLATES, GLB_ASSETS } from './obstacle-course-assets.js?v=3.0.40';
import { clamp, lerp } from './obstacle-course-utils.js';
import { THREE } from './obstacle-course-scene.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';
import { createInstancedAssetGroup } from './obstacle-course-glb.js';
import { pathCenterAt, pathHalfWidthAt } from './obstacle-course-ground-path.js';

const TREE_ROOT_LIFT = 0.22;
const TREE_OUTER_LIMIT_FROM_PATH_EDGE = 2.2;
const DETAIL_OUTER_LIMIT_FROM_PATH_EDGE = 2.35;
const SHADOW_Y_OFFSET = 0.055;
const SHADOW_OPACITY = 0.35;
const SHADOW_SCALE_MULTIPLIER = 3.10;
const SHADOW_MIN_LENGTH = 14.4;
const SHADOW_MAX_LENGTH = 38.0;
const SHADOW_LEFT_ROTATION = 0;
const TREE_SHADOW_COPIES = 2;
const DENSITY_PER_1000 = { pathEdgeTreePairs: 50, limitedOuterTreePairs: 18, tallPathBushPairs: 84, smallGroundFernPairs: 92, edgeDetailPairs: 24, farDetailPairs: 10 };
const shadowMultiplyTextureCache = new Map();

function hashString(value) { let hash = 2166136261; String(value || 'obstacle-course').split('').forEach((ch) => { hash ^= ch.charCodeAt(0); hash = Math.imul(hash, 16777619); }); return hash >>> 0; }
function seededRandom(seedText) { let seed = hashString(seedText) || 1; return () => { seed += 0x6D2B79F5; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function randFrom(rng, min, max) { return min + rng() * (max - min); }
function pickFrom(rng, items) { return items[Math.floor(rng() * items.length)]; }
function loadedAssets(type) { return GLB_ASSETS.filter((asset) => asset.type === type && OC.glbTemplates.has(asset.url)); }
function loadedTreeAssets() { return GLB_ASSETS.filter((asset) => ['nearTree', 'farTree'].includes(asset.type) && OC.glbTemplates.has(asset.url)); }
function assetsNamed(assets, token) { return assets.filter((asset) => asset.url.includes(token)); }
function uniqueAssets(assets) { return Array.from(new Map(assets.map((asset) => [asset.url, asset])).values()); }
function preferredAssets(primary, fallback) { return primary.length ? primary : fallback; }
function layerScale(layer) { return Math.max(0.0001, Number(layer?.scale || 1)); }

function fallbackTree(rng = Math.random) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.44, 4, 6), new THREE.MeshStandardMaterial({ color: 0x5a321e }));
  const crown = new THREE.Mesh(new THREE.ConeGeometry(randFrom(rng, 1.8, 2.9), randFrom(rng, 5.4, 8.2), 7), new THREE.MeshStandardMaterial({ color: 0x1d5a34 }));
  trunk.position.y = GROUND_Y + 2;
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
function pathEdgeX(rng, distance, side) { return pathCenterAt(distance) + side * (pathHalfWidthAt(distance) + randFrom(rng, 0.65, 1.65)); }
function pathEdgeBushX(rng, distance, side) { return pathCenterAt(distance) + side * Math.max(0.1, pathHalfWidthAt(distance) - randFrom(rng, 0.08, 0.22)); }
function limitedOutsideX(rng, distance, side, minFromEdge = 1.05, maxFromEdge = TREE_OUTER_LIMIT_FROM_PATH_EDGE) { return pathCenterAt(distance) + side * (pathHalfWidthAt(distance) + randFrom(rng, minFromEdge, maxFromEdge)); }
function limitedDetailX(rng, distance, side, minFromEdge = 0.2, maxFromEdge = DETAIL_OUTER_LIMIT_FROM_PATH_EDGE) { return pathCenterAt(distance) + side * (pathHalfWidthAt(distance) + randFrom(rng, minFromEdge, maxFromEdge)); }
function makeDistances(rng, count, start, end, jitter = 10) {
  const safeCount = Math.max(0, Math.round(count));
  if (!safeCount) return [];
  const step = Math.max(1, end - start) / safeCount;
  return Array.from({ length: safeCount }, (_, i) => start + i * step + randFrom(rng, -jitter, jitter)).filter((d) => d > 0 && d < end + 40);
}
function screenEdgeScaleForX(x, minScale = 0.68) { const t = clamp(Math.abs(Number(x || 0)) / (COURSE_WORLD_WIDTH * 0.5), 0, 1); return lerp(1, minScale, t * t * (3 - 2 * t)); }
function pathEdgeTreeScale(rng, distance) { return randFrom(rng, 0.22, 0.34) * clamp((Number(distance || 0) - 70) / 280, 0.58, 1); }
function limitedOuterTreeScale(rng, distance) { return randFrom(rng, 0.18, 0.28) * clamp((Number(distance || 0) - 70) / 280, 0.58, 1); }
function localPlacementForLayer(layer, x, y, z) { const scale = layerScale(layer); return { x: (Number(x || 0) - Number(layer?.x || 0)) / scale, y, z: (Number(z || 0) - Number(layer?.z || 0)) / scale }; }
function entityForInstance(type, layer, x, z, localX, localZ, assetUrl = '') { OC.entities.push({ type, layerId: layer.id, x, z, localX, localZ, assetUrl }); }

function shadowUrlWithCache(url) { return `${url}${url.includes('?') ? '&' : '?'}v=${OC.cacheVersion}`; }
function makeShadowMultiplyTexture(url) {
  const key = `shadow-multiply:${url}:${OC.cacheVersion}`;
  if (shadowMultiplyTextureCache.has(key)) return shadowMultiplyTextureCache.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const editCtx = canvas.getContext('2d', { willReadFrequently: true });
    editCtx.clearRect(0, 0, canvas.width, canvas.height);
    editCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = editCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixels.data;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;
      const luma = ((data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114)) / 255;
      const shadowAmount = (1 - luma) * SHADOW_OPACITY * alpha;
      const multiplyValue = Math.round(clamp(1 - shadowAmount, 0, 1) * 255);
      data[i] = multiplyValue;
      data[i + 1] = multiplyValue;
      data[i + 2] = multiplyValue;
      data[i + 3] = 255;
    }
    editCtx.putImageData(pixels, 0, 0);
    texture.needsUpdate = true;
  };
  image.src = shadowUrlWithCache(url);
  shadowMultiplyTextureCache.set(key, texture);
  return texture;
}

function makeShadowMaterial(texture) {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: false,
    opacity: 1,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.MultiplyBlending,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  material.userData.ocSkipLayerVisual = true;
  material.userData.ocFixedShadowMaterial = true;
  return material;
}
function addSingleTreeShadow(rng, shadowLayer, x, z, scale, copyIndex = 0) {
  const urls = ASSETS.shadows?.tree || [];
  const texture = urls.length ? makeShadowMultiplyTexture(pickFrom(rng, urls)) : null;
  if (!texture) return;
  const groundScale = Math.max(0.0001, Number(shadowLayer.groundScale || 1));
  const layerOffsetX = Number(shadowLayer.x || 0);
  const layerOffsetZ = Number(shadowLayer.z || 0);
  const copySpread = copyIndex === 0 ? 0 : randFrom(rng, -0.9, 0.9);
  const copyLength = copyIndex === 0 ? 1 : randFrom(rng, 0.78, 1.18);
  const localX = ((x + layerOffsetX + copySpread) / groundScale) - layerOffsetX;
  const localZ = ((z + layerOffsetZ + randFrom(rng, -0.45, 0.45)) / groundScale) - layerOffsetZ;
  const shadowLength = clamp(28 * Number(scale || 1) * SHADOW_SCALE_MULTIPLIER * copyLength, SHADOW_MIN_LENGTH, SHADOW_MAX_LENGTH) * randFrom(rng, 0.95, 1.08);
  const shadowWidth = shadowLength * randFrom(rng, 0.54, 0.74);
  const geometry = new THREE.PlaneGeometry(shadowLength / groundScale, shadowWidth / groundScale, 1, 1);
  geometry.translate(-(shadowLength / groundScale) * 0.42, 0, 0);
  const shadow = new THREE.Mesh(geometry, makeShadowMaterial(texture));
  shadow.position.set(localX, GROUND_Y + SHADOW_Y_OFFSET + copyIndex * 0.002, localZ);
  shadow.rotation.set(-Math.PI / 2, 0, SHADOW_LEFT_ROTATION + randFrom(rng, -0.075, 0.075));
  shadow.renderOrder = 6;
  shadowLayer.group.add(shadow);
  registerEntity('shadow', shadow, { x, z, visibleOnOverview: false });
}
function addTreeShadow(rng, shadowLayer, x, z, scale) {
  if (!shadowLayer?.group) return;
  for (let i = 0; i < TREE_SHADOW_COPIES; i += 1) addSingleTreeShadow(rng, shadowLayer, x, z, scale, i);
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
function flushPlacementQueues(queues) { queues.forEach(({ layer, asset, placements }) => { const group = createInstancedAssetGroup(asset, placements); if (group) layer.group.add(group); }); }

export function scatterScenery() {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  const rng = seededRandom(`${OC.templateId}|${OC.difficulty}|${OC.courseLength}|${OC.pathSequence.map((p) => p.key).join(',') || '1'}|${OC.glbTemplates.size}`);
  const shadowLayer = makeLayer('treeShadows', 'Tree Shadows', new THREE.Group(), { order: 6, opacity: 1, brightness: 1, contrast: 1, saturation: 1 });
  const treeLayer = makeLayer('trees', 'Trees', new THREE.Group(), { order: 20 });
  const detailLayer = makeLayer('details', 'Ferns / Bushes / Details', new THREE.Group(), { order: 25 });
  const groundLayer = OC.layers.get('ground');
  shadowLayer.groundScale = layerScale(groundLayer);
  if (groundLayer?.group) groundLayer.group.add(shadowLayer.group);
  else OC.world.add(shadowLayer.group);
  OC.world.add(treeLayer.group, detailLayer.group);

  const allTrees = loadedTreeAssets();
  const nearTreeAssets = loadedAssets('nearTree');
  const pathEdgeTreeAssets = preferredAssets(uniqueAssets([...assetsNamed(allTrees, 'pine_tree'), ...assetsNamed(allTrees, 'oak_trees'), ...assetsNamed(allTrees, 'tree_low-poly')]), nearTreeAssets);
  const oakTreeAssets = preferredAssets(assetsNamed(allTrees, 'oak_trees'), pathEdgeTreeAssets);
  const edgeDetailAssets = loadedAssets('edgeDetail');
  const farDetailAssets = GLB_ASSETS.filter((asset) => ['edgeDetail', 'farDetail'].includes(asset.type) && OC.glbTemplates.has(asset.url));
  const smallFernAssets = uniqueAssets([...assetsNamed(edgeDetailAssets, 'fern'), ...assetsNamed(farDetailAssets, 'fern')]);
  const tallBushAssets = assetsNamed(farDetailAssets, 'tall_bush');
  const sections = sectionCount();
  const end = OC.courseLength + 80;
  const queues = new Map();

  makeDistances(rng, DENSITY_PER_1000.pathEdgeTreePairs * sections * template.treeRate, 28, end, 12).forEach((d) => [-1, 1].forEach((side) => queuePlacement(rng, queues, treeLayer, shadowLayer, 'tree', pathEdgeTreeAssets, fallbackTree, pathEdgeX(rng, d, side), TREE_ROOT_LIFT, -d + randFrom(rng, -4, 4), pathEdgeTreeScale(rng, d))));
  makeDistances(rng, DENSITY_PER_1000.limitedOuterTreePairs * sections * template.treeRate, 60, end, 20).forEach((d) => [-1, 1].forEach((side) => queuePlacement(rng, queues, treeLayer, shadowLayer, 'tree', oakTreeAssets, fallbackTree, limitedOutsideX(rng, d, side), TREE_ROOT_LIFT, -d + randFrom(rng, -7, 7), limitedOuterTreeScale(rng, d))));
  if (tallBushAssets.length) makeDistances(rng, DENSITY_PER_1000.tallPathBushPairs * sections * template.detailRate, 35, OC.courseLength + 60, 10).forEach((d) => [-1, 1].forEach((side) => queuePlacement(rng, queues, detailLayer, null, 'detail', tallBushAssets, fallbackDetail, pathEdgeBushX(rng, d, side), 0, -d + randFrom(rng, -4, 4), randFrom(rng, 4.22, 6.02))));
  makeDistances(rng, DENSITY_PER_1000.smallGroundFernPairs * sections * template.detailRate, 18, OC.courseLength + 60, 9).forEach((d) => [-1, 1].forEach((side) => queuePlacement(rng, queues, detailLayer, null, 'detail', smallFernAssets, fallbackDetail, limitedDetailX(rng, d, side, 0.05, 1.25), -0.18, -d + randFrom(rng, -3, 3), randFrom(rng, 0.46, 0.82))));
  makeDistances(rng, DENSITY_PER_1000.edgeDetailPairs * sections * template.detailRate, 20, OC.courseLength + 40, 14).forEach((d) => [-1, 1].forEach((side) => queuePlacement(rng, queues, detailLayer, null, 'detail', edgeDetailAssets, fallbackDetail, limitedDetailX(rng, d, side, 0.15, 1.6), 0, -d + randFrom(rng, -3, 3), randFrom(rng, 0.75, 1.15))));
  makeDistances(rng, DENSITY_PER_1000.farDetailPairs * sections * template.detailRate, 50, OC.courseLength + 60, 22).forEach((d) => [-1, 1].forEach((side) => queuePlacement(rng, queues, detailLayer, null, 'detail', farDetailAssets, fallbackDetail, limitedDetailX(rng, d, side, 1.6, DETAIL_OUTER_LIMIT_FROM_PATH_EDGE), 0, -d + randFrom(rng, -5, 5), randFrom(rng, 0.65, 1.0))));
  flushPlacementQueues(queues);
}
