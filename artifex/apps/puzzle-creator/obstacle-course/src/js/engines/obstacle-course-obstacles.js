import { OC, GROUND_Y, START_DISTANCE } from './obstacle-course-state.js';
import { GLB_ASSETS } from './obstacle-course-assets.js?v=3.0.43';
import { THREE } from './obstacle-course-scene.js';
import { rand, pick } from './obstacle-course-utils.js';
import { pathCenterAt, pathAlphaAtWorld } from './obstacle-course-ground-path.js';
import { makeLayer, registerEntity } from './obstacle-course-layers.js';
import { makeGlbOrFallback } from './obstacle-course-glb.js';
import { playHitSound } from './obstacle-course-audio.js';

const ROCK_OBSTACLE_SCALE_MULTIPLIER = 1.5;
let objectShadowTexture = null;

function fallbackObstacle() {
  return new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.36, 0.72), 0), new THREE.MeshStandardMaterial({ color: 0x7e5d44, roughness: 1 }));
}

function getObjectShadowTexture() {
  if (objectShadowTexture) return objectShadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(0,0,0,0.32)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.16)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  objectShadowTexture = new THREE.CanvasTexture(canvas);
  objectShadowTexture.minFilter = THREE.LinearFilter;
  objectShadowTexture.magFilter = THREE.LinearFilter;
  return objectShadowTexture;
}

function attachObjectDropShadow(obj, radius = 1.3) {
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 1.65, radius * 0.95, 1, 1),
    new THREE.MeshBasicMaterial({
      map: getObjectShadowTexture(),
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      blending: THREE.MultiplyBlending,
    })
  );
  shadow.name = 'ObjectDropShadow';
  shadow.position.set(0, -0.62, 0.12);
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = -1;
  shadow.userData.ocSkipLayerVisual = true;
  obj.add(shadow);
  obj.userData.dropShadow = shadow;
}

function routeDistance(index, count) {
  const start = START_DISTANCE + 80;
  const end = Math.max(start + 80, OC.courseLength - 55);
  const step = (end - start) / Math.max(1, count);
  return start + index * step + rand(-14, 14);
}

export function addObstacles(count = 12) {
  let layer = OC.layers.get('obstacles');
  if (!layer) {
    const group = new THREE.Group();
    OC.world.add(group);
    layer = makeLayer('obstacles', 'Obstacles', group, { order: 16 });
  }
  const assets = GLB_ASSETS.filter((asset) => asset.type === 'rock' && OC.glbTemplates.has(asset.url));
  const wanted = Math.max(count, 14);
  let placed = 0;
  let attempts = 0;
  while (placed < wanted && attempts < wanted * 60) {
    attempts += 1;
    const d = routeDistance(placed, wanted);
    const center = pathCenterAt(d);
    const x = center + rand(-OC.pathVisualWidth * 0.24, OC.pathVisualWidth * 0.24);
    const alpha = pathAlphaAtWorld(x, d);
    if (alpha !== null && alpha < OC.pathAlphaThreshold) continue;
    const asset = pick(assets) || null;
    const obj = asset ? makeGlbOrFallback(asset, fallbackObstacle) : fallbackObstacle();
    obj.position.set(x, GROUND_Y + 0.42, -d);
    obj.rotation.y = rand(0, Math.PI * 2);
    obj.scale.multiplyScalar((asset?.scale || 1) * ROCK_OBSTACLE_SCALE_MULTIPLIER);
    attachObjectDropShadow(obj, 1.25);
    obj.userData.kind = 'obstacle';
    obj.userData.hit = false;
    if (asset) {
      obj.userData.glbAssetUrl = asset.url;
      obj.userData.baseScaleValue = obj.scale.x || 1;
      OC.glbInstances.push(obj);
    }
    obj.userData.basePosition = obj.position.clone();
    layer.group.add(obj);
    OC.objects.push(obj);
    registerEntity('obstacle', obj, { x, z: -d, assetUrl: asset?.url || '' });
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
