import { OC, SECTION_WORLD_LENGTH, SECTION_WORLD_STEP, COURSE_WORLD_WIDTH, PATH_POSITIONS, GROUND_Y } from './obstacle-course-state.js';
import { ASSETS, TEMPLATES, GLB_ASSETS } from './obstacle-course-assets.js';
import { clamp, lerp, pick, rand } from './obstacle-course-utils.js';
import { THREE, loadTexture } from './obstacle-course-scene.js';
import { pathAlphaAtSegment } from './obstacle-course-loader.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';
import { makeGlbOrFallback } from './obstacle-course-glb.js';

export function generatePathSequence() {
  if (Array.isArray(OC.customPathSequence) && OC.customPathSequence.length) {
    const defs = Object.values(ASSETS.pathSegments);
    OC.pathSequence = OC.customPathSequence.map((item, i) => {
      const def = defs.find((seg) => seg.key === item.id || seg.key === item.key) || ASSETS.pathSegments.straight;
      const distance = Number.isFinite(Number(item.distance)) ? Number(item.distance) : i * SECTION_WORLD_STEP;
      return { ...def, distance, startX: PATH_POSITIONS[def.start] ?? 0, endX: PATH_POSITIONS[def.end] ?? 0 };
    });
    return;
  }
  OC.pathSequence = [];
  const count = Math.ceil(OC.courseLength / SECTION_WORLD_STEP) + 4;
  let lane = 'centre';
  for (let i = 0; i < count; i += 1) {
    const choices = lane === 'centre' ? [ASSETS.pathSegments.straight, ASSETS.pathSegments.kink, ASSETS.pathSegments.left, ASSETS.pathSegments.right] : lane === 'left' ? [ASSETS.pathSegments.straight, ASSETS.pathSegments.leftToStraight] : [ASSETS.pathSegments.straight, ASSETS.pathSegments.rightToStraight];
    let def = pick(choices);
    if (lane !== 'centre' && def.start === 'centre') def = lane === 'left' ? ASSETS.pathSegments.leftToStraight : ASSETS.pathSegments.rightToStraight;
    const startX = PATH_POSITIONS[def.start] ?? PATH_POSITIONS[lane] ?? 0;
    const endX = PATH_POSITIONS[def.end] ?? startX;
    OC.pathSequence.push({ ...def, distance: i * SECTION_WORLD_STEP, startX, endX });
    lane = def.end;
  }
}

export function pathSegmentAt(distance) { return OC.pathSequence[clamp(Math.floor(distance / SECTION_WORLD_STEP), 0, OC.pathSequence.length - 1)] || null; }
export function pathCenterAt(distance) { const seg = pathSegmentAt(distance); if (!seg) return 0; return lerp(seg.startX, seg.endX, clamp((distance - seg.distance) / SECTION_WORLD_STEP, 0, 1)); }
export function playerWorldX() { return pathCenterAt(OC.distance) + OC.player.x; }
export function pathAlphaAtWorld(worldX, distance) { const seg = pathSegmentAt(distance); if (!seg) return null; const u = 0.5 + (worldX - pathCenterAt(distance)) / OC.pathVisualWidth; const v = clamp((distance - seg.distance) / SECTION_WORLD_STEP, 0, 1); if (u < 0 || u > 1) return 0; return pathAlphaAtSegment(seg.key, u, v); }
export function nearestVisiblePathX(distance, worldX) { const center = pathCenterAt(distance); let bestX = center; let best = Infinity; for (let x = center - OC.pathVisualWidth * .7; x <= center + OC.pathVisualWidth * .7; x += .4) { const a = pathAlphaAtWorld(x, distance); if (a !== null && a >= OC.pathAlphaThreshold) { const d = Math.abs(x - worldX); if (d < best) { best = d; bestX = x; } } } return bestX; }
export function pathStatus() { const worldX = playerWorldX(); const alpha = pathAlphaAtWorld(worldX, OC.distance); if (alpha === null) return Math.abs(OC.player.x) > OC.pathVisualWidth * .5 ? 'off' : 'on'; if (alpha >= OC.pathAlphaThreshold) return 'on'; OC.pathHintDirection = nearestVisiblePathX(OC.distance, worldX) < worldX ? 'left' : 'right'; return 'off'; }

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
  makeLayer('ground', 'Ground', groundLayer, { order: 1 });
  makeLayer('path', 'Path', pathLayer, { order: 2 });
  OC.world.add(groundLayer, pathLayer);
  const groundMat = new THREE.MeshStandardMaterial({ map: loadTexture(ASSETS.ground, { repeat: [1, 1], repeatX: false }), transparent: true, alphaTest: .02, roughness: 1, side: THREE.DoubleSide });
  const groundGeo = new THREE.PlaneGeometry(COURSE_WORLD_WIDTH, SECTION_WORLD_LENGTH, 1, 1);
  OC.pathSequence.forEach((seg) => {
    const z = -seg.distance - SECTION_WORLD_LENGTH / 2;
    const ground = new THREE.Mesh(groundGeo.clone(), groundMat.clone());
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, GROUND_Y, z);
    groundLayer.add(ground);
    registerEntity('ground', ground, { x: 0, z, visibleOnOverview: false });
    const path = new THREE.Mesh(new THREE.PlaneGeometry(OC.pathVisualWidth, SECTION_WORLD_LENGTH, 1, 1), new THREE.MeshStandardMaterial({ map: loadTexture(seg.file), transparent: true, alphaTest: .05, roughness: .95, side: THREE.DoubleSide, depthWrite: false }));
    path.rotation.x = -Math.PI / 2;
    path.position.set((seg.startX + seg.endX) / 2, GROUND_Y + .045, z);
    pathLayer.add(path);
    registerEntity('path', path, { x: path.position.x, z, segmentKey: seg.key });
  });
}

function fallbackTree() {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.14, .22, 2.0, 6), new THREE.MeshStandardMaterial({ color: 0x5a321e }));
  const crown = new THREE.Mesh(new THREE.ConeGeometry(rand(.8, 1.25), rand(2.4, 3.6), 7), new THREE.MeshStandardMaterial({ color: 0x1d5a34 }));
  trunk.position.y = GROUND_Y + 1.0;
  crown.position.y = GROUND_Y + 2.95;
  tree.add(trunk, crown);
  return tree;
}
function fallbackRock() { return new THREE.Mesh(new THREE.DodecahedronGeometry(rand(.32, .75), 0), new THREE.MeshStandardMaterial({ color: 0x7d776b })); }
function fallbackDetail() { return new THREE.Mesh(new THREE.ConeGeometry(rand(.18, .35), rand(.4, .75), 5), new THREE.MeshStandardMaterial({ color: 0x2e8b45 })); }
function addMaybeGlbObject(layer, type, assetList, fallback, x, y, z, scale = 1) {
  const asset = pick(assetList) || null;
  const obj = asset ? makeGlbOrFallback(asset, fallback) : fallback();
  obj.position.set(x, y, z);
  obj.rotation.y = rand(0, Math.PI * 2);
  obj.scale.multiplyScalar(scale * (asset?.scale || 1));
  if (asset) {
    obj.userData.glbAssetUrl = asset.url;
    obj.userData.baseScaleValue = obj.scale.x || 1;
    OC.glbInstances.push(obj);
  }
  obj.userData.basePosition = obj.position.clone();
  layer.group.add(obj);
  registerEntity(type, obj, { x, z });
  return obj;
}

export function scatterScenery() {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  const treeLayer = new THREE.Group(); const rockLayer = new THREE.Group(); const detailLayer = new THREE.Group();
  makeLayer('trees', 'Trees', treeLayer, { order: 10 }); makeLayer('rocks', 'Rocks', rockLayer, { order: 11 }); makeLayer('details', 'Ferns / Bushes / Details', detailLayer, { order: 12 });
  OC.world.add(treeLayer, rockLayer, detailLayer);
  const treeAssets = GLB_ASSETS.filter((asset) => asset.type === 'tree' && OC.glbTemplates.has(asset.url));
  const rockAssets = GLB_ASSETS.filter((asset) => asset.type === 'rock' && OC.glbTemplates.has(asset.url));
  const detailAssets = GLB_ASSETS.filter((asset) => asset.type === 'detail' && OC.glbTemplates.has(asset.url));
  for (let d = 24; d < OC.courseLength + 260; d += Math.max(11, 22 / template.treeRate)) {
    const center = pathCenterAt(d);
    [-1, 1].forEach((side) => {
      const x = center + side * (OC.pathVisualWidth * .5 + OC.sceneryDistance * .25 + rand(1, 4));
      addMaybeGlbObject({ group: treeLayer }, 'tree', treeAssets, fallbackTree, x, 0, -d + rand(-5, 5), rand(.75, .95));
    });
  }
  for (let d = 34; d < OC.courseLength + 120; d += 27 / template.rockRate) {
    const side = Math.random() > .5 ? 1 : -1;
    const x = pathCenterAt(d) + side * (OC.pathVisualWidth * .5 + OC.sceneryDistance * .18 + rand(.4, 4));
    addMaybeGlbObject({ group: rockLayer }, 'rock', rockAssets, fallbackRock, x, GROUND_Y + .35, -d + rand(-3, 3), rand(.65, .95));
  }
  for (let d = 20; d < OC.courseLength + 100; d += 14 / template.detailRate) {
    const side = Math.random() > .5 ? 1 : -1;
    const x = pathCenterAt(d) + side * (OC.pathVisualWidth * .5 + rand(.3, Math.max(1.5, OC.sceneryDistance * .2)));
    addMaybeGlbObject({ group: detailLayer }, 'detail', detailAssets, fallbackDetail, x, GROUND_Y + .35, -d + rand(-2, 2), rand(.55, .9));
  }
}

export function rebuildGroundPathAndScenery() { clearWorld(); buildGroundAndPath(); scatterScenery(); }
