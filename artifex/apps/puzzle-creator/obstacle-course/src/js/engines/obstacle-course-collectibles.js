import { OC, GROUND_Y } from './obstacle-course-state.js';
import { GLB_ASSETS } from './obstacle-course-assets.js?v=3.0.43';
import { THREE } from './obstacle-course-scene.js';
import { rand, pick } from './obstacle-course-utils.js';
import { pathCenterAt, pathAlphaAtWorld } from './obstacle-course-ground-path.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';
import { makeGlbOrFallback } from './obstacle-course-glb.js';
import { playCollectSound } from './obstacle-course-audio.js';

let objectShadowTexture = null;

function fallbackCollectible() {
  return new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), new THREE.MeshStandardMaterial({ color: 0x5be5ff, emissive: 0x102a33, roughness: 0.4 }));
}

function getObjectShadowTexture() {
  if (objectShadowTexture) return objectShadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(0,0,0,0.34)');
  gradient.addColorStop(0.45, 'rgba(0,0,0,0.18)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  objectShadowTexture = new THREE.CanvasTexture(canvas);
  objectShadowTexture.minFilter = THREE.LinearFilter;
  objectShadowTexture.magFilter = THREE.LinearFilter;
  return objectShadowTexture;
}

function attachObjectDropShadow(obj, radius = 1.15) {
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 1.55, radius * 0.92, 1, 1),
    new THREE.MeshBasicMaterial({
      map: getObjectShadowTexture(),
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      blending: THREE.MultiplyBlending,
    })
  );
  shadow.name = 'ObjectDropShadow';
  shadow.position.set(0, -0.72, 0.12);
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = -1;
  shadow.userData.ocSkipLayerVisual = true;
  obj.add(shadow);
  obj.userData.dropShadow = shadow;
}

function collectibleKind(asset) {
  const url = String(asset?.url || '').toLowerCase();
  return url.includes('money') || url.includes('sack') ? 'money' : 'collect';
}

function glowColorForKind(kind) {
  return kind === 'money' ? 0xffd15c : 0x77e6ff;
}

function attachCollectibleGlow(obj, kind) {
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(kind === 'money' ? 0.78 : 0.88, 24, 16),
    new THREE.MeshBasicMaterial({
      color: glowColorForKind(kind),
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.name = 'CollectibleGlowPulse';
  glow.position.y = 0.18;
  glow.userData.ocSkipLayerVisual = true;
  obj.add(glow);
  obj.userData.glowObject = glow;
  obj.userData.pulseBaseScale = obj.scale.clone();
  obj.userData.pulsePhase = Math.random() * Math.PI * 2;
  obj.userData.collectibleKind = kind;
  obj.traverse?.((node) => {
    const materials = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
    materials.forEach((mat) => {
      if (mat.emissive) {
        mat.emissive.setHex(glowColorForKind(kind));
        mat.emissiveIntensity = kind === 'money' ? 0.28 : 0.2;
        mat.needsUpdate = true;
      }
    });
  });
}

export function updateCollectibleEffects(dt = 0.016) {
  OC.collectiblePulseTime = Number(OC.collectiblePulseTime || 0) + dt;
  const t = OC.collectiblePulseTime;
  OC.objects.forEach((obj) => {
    if (obj.userData.kind !== 'collectible' || obj.userData.collected || !obj.visible) return;
    const base = obj.userData.pulseBaseScale;
    if (!base) return;
    const phase = Number(obj.userData.pulsePhase || 0);
    const wave = Math.sin(t * 3.4 + phase);
    const scale = 1 + wave * 0.065;
    obj.scale.set(base.x * scale, base.y * scale, base.z * scale);
    if (obj.userData.glowObject?.material) {
      obj.userData.glowObject.material.opacity = 0.14 + (wave + 1) * 0.055;
      obj.userData.glowObject.scale.setScalar(1.04 + (wave + 1) * 0.06);
    }
  });
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
    const kind = collectibleKind(asset);
    obj.position.set(x, GROUND_Y + 0.72, -d);
    obj.rotation.y = rand(0, Math.PI * 2);
    obj.scale.multiplyScalar(asset?.scale || 1);
    attachObjectDropShadow(obj, kind === 'money' ? 1.25 : 1.05);
    attachCollectibleGlow(obj, kind);
    obj.userData.kind = 'collectible';
    obj.userData.value = asset?.value || pick([10, 10, 25]);
    obj.userData.collected = false;
    if (asset) {
      obj.userData.glbAssetUrl = asset.url;
      obj.userData.baseScaleValue = obj.scale.x || 1;
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
      playCollectSound(obj.userData.collectibleKind || 'collect');
    }
  });
}
