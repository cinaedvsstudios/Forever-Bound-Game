import { OC, GROUND_Y } from './obstacle-course-state.js';
import { GLB_ASSETS } from './obstacle-course-assets.js';
import { THREE } from './obstacle-course-scene.js';
import { rand, pick } from './obstacle-course-utils.js';
import { pathCenterAt, pathAlphaAtWorld } from './obstacle-course-ground-path.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';
import { makeGlbOrFallback } from './obstacle-course-glb.js';
import { playHitSound } from './obstacle-course-audio.js';

function fallbackObstacle() {
  return new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.6, 1.05), 0), new THREE.MeshStandardMaterial({ color: 0x7e5d44, roughness: 1 }));
}

export function addObstacles(count = 12) {
  let layer = OC.layers.get('obstacles');
  if (!layer) {
    const group = new THREE.Group();
    OC.world.add(group);
    layer = makeLayer('obstacles', 'Obstacles', group, { order: 16 });
  }
  const assets = GLB_ASSETS.filter((asset) => asset.type === 'rock' && OC.glbTemplates.has(asset.url));
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 60) {
    attempts += 1;
    const d = rand(80, OC.courseLength - 30);
    const center = pathCenterAt(d);
    const x = center + rand(-OC.pathVisualWidth * 0.32, OC.pathVisualWidth * 0.32);
    const alpha = pathAlphaAtWorld(x, d);
    if (alpha !== null && alpha < OC.pathAlphaThreshold) continue;
    const asset = pick(assets) || null;
    const obj = asset ? makeGlbOrFallback(asset, fallbackObstacle) : fallbackObstacle();
    obj.position.set(x, GROUND_Y + 0.5, -d);
    obj.rotation.y = rand(0, Math.PI * 2);
    obj.scale.multiplyScalar(asset?.scale || 1);
    obj.userData.kind = 'obstacle';
    obj.userData.hit = false;
    if (asset) {
      obj.userData.glbAssetUrl = asset.url;
      obj.userData.baseScaleValue = asset.scale || 1;
      OC.glbInstances.push(obj);
    }
    obj.userData.basePosition = obj.position.clone();
    layer.group.add(obj);
    OC.objects.push(obj);
    registerEntity('obstacle', obj, { x, z: -d });
    placed += 1;
  }
}

export function checkObstacles() {
  const px = pathCenterAt(OC.distance) + OC.player.x;
  const pz = -OC.distance;
  OC.objects.forEach((obj) => {
    if (obj.userData.kind !== 'obstacle' || obj.userData.hit) return;
    const dx = obj.position.x - px;
    const dz = obj.position.z - pz;
    if (Math.hypot(dx, dz) < 1.8 && OC.player.y < 1.2) {
      obj.userData.hit = true;
      OC.hits += 1;
      OC.score = Math.max(0, OC.score - 5);
      playHitSound();
    }
  });
}
