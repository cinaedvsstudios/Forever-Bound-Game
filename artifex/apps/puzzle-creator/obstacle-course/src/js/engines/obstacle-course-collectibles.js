import { OC, GROUND_Y } from './obstacle-course-state.js';
import { GLB_ASSETS } from './obstacle-course-assets.js';
import { THREE } from './obstacle-course-scene.js';
import { rand, pick } from './obstacle-course-utils.js';
import { pathCenterAt, pathAlphaAtWorld } from './obstacle-course-ground-path.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';
import { makeGlbOrFallback } from './obstacle-course-glb.js';
import { playCollectSound } from './obstacle-course-audio.js';

function fallbackCollectible() {
  return new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), new THREE.MeshStandardMaterial({ color: 0x5be5ff, emissive: 0x102a33, roughness: 0.4 }));
}

export function addCollectibles(count = 8) {
  let layer = OC.layers.get('collectibles');
  if (!layer) {
    const group = new THREE.Group();
    OC.world.add(group);
    layer = makeLayer('collectibles', 'Collectibles', group, { order: 15 });
  }
  const assets = GLB_ASSETS.filter((asset) => asset.type === 'collectible' && OC.glbTemplates.has(asset.url));
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 80) {
    attempts += 1;
    const d = rand(50, OC.courseLength - 40);
    const center = pathCenterAt(d);
    const x = center + rand(-OC.pathVisualWidth * 0.35, OC.pathVisualWidth * 0.35);
    const alpha = pathAlphaAtWorld(x, d);
    if (alpha !== null && alpha < OC.pathAlphaThreshold) continue;
    const asset = pick(assets) || null;
    const obj = asset ? makeGlbOrFallback(asset, fallbackCollectible) : fallbackCollectible();
    obj.position.set(x, GROUND_Y + 0.85, -d);
    obj.rotation.y = rand(0, Math.PI * 2);
    obj.scale.multiplyScalar(asset?.scale || 1);
    obj.userData.kind = 'collectible';
    obj.userData.value = asset?.value || pick([10, 10, 25]);
    obj.userData.collected = false;
    if (asset) {
      obj.userData.glbAssetUrl = asset.url;
      obj.userData.baseScaleValue = asset.scale || 1;
      OC.glbInstances.push(obj);
    }
    obj.userData.basePosition = obj.position.clone();
    layer.group.add(obj);
    OC.objects.push(obj);
    registerEntity('collectible', obj, { x, z: -d, value: obj.userData.value });
    placed += 1;
  }
}

export function checkCollectibles() {
  const px = pathCenterAt(OC.distance) + OC.player.x;
  const pz = -OC.distance;
  OC.objects.forEach((obj) => {
    if (obj.userData.kind !== 'collectible' || obj.userData.collected || !obj.visible) return;
    const dx = obj.position.x - px;
    const dz = obj.position.z - pz;
    if (Math.hypot(dx, dz) < 2.2) {
      obj.userData.collected = true;
      obj.visible = false;
      OC.collected += 1;
      OC.score += obj.userData.value || 10;
      playCollectSound();
    }
  });
}
