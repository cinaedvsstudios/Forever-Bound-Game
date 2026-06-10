// Horse Forest Runner V16
// Procedural geometry reset, passes 1-3.
// No textures, no image cards, no CSS treelines. Everything inside the ride is Three.js geometry using hex-colour materials.
// Pass 1: chunked runner world, camera, fog, sky colour, ground/path.
// Pass 2: procedural 3D trees on both sides.
// Pass 3: procedural logs, rocks and streams as jump obstacles.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const HORSE_VERSION = 'v16-geometry-pass-2-3';
const CHUNK_LENGTH = 34;
const CHUNKS_AHEAD = 15;
const CHUNKS_BEHIND = 3;
const FAR_DISTANCE = CHUNK_LENGTH * CHUNKS_AHEAD;
const COLORS = {
  sky: 0x8eabb5,
  fog: 0x8eabb5,
  path: 0x6f4b24,
  pathDark: 0x503619,
  pathLight: 0x8b6331,
  grassDark: 0x1f311c,
  grass: 0x2f4b25,
  moss: 0x477332,
  trunk: 0x4a2d17,
  trunkDark: 0x2a170b,
  pineDark: 0x0d2414,
  pineMid: 0x17401f,
  pineLight: 0x245a2b,
  rock: 0x5f6256,
  rockDark: 0x343a32,
  log: 0x5a3519,
  logCut: 0x9a6a38,
  stream: 0x3b7694,
  streamLight: 0x76b6c8,
  shadow: 0x050805,
};

const H = {
  mounted: false,
  active: false,
  running: false,
  complete: false,
  raf: null,
  lastTime: 0,
  distance: 0,
  courseLength: 2800,
  speed: 34,
  difficulty: 2,
  duration: 78,
  score: 0,
  hits: 0,
  jumps: 0,
  player: { x: 0, y: 0, vy: 0, grounded: true },
  keys: new Set(),
  chunks: [],
  obstacles: [],
  nextChunkZ: 0,
  stage: null,
  panels: null,
  host: null,
  scene: null,
  camera: null,
  renderer: null,
  world: null,
  clock: null,
  materials: null,
  geometries: null,
};

const $ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);
const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];

function injectStyles() {
  if ($('horse-forest-v16-styles')) return;
  const style = document.createElement('style');
  style.id = 'horse-forest-v16-styles';
  style.textContent = `
    .is-horse-forest .right-preview-layout,.is-horse-forest .overview-window,.is-horse-forest #puzzle-launcher-panel,.is-horse-forest #puzzle-module-brief-page{display:none!important}
    .is-horse-forest .left-panel-body>[data-panel-content],.is-horse-forest [data-workflow-menu],.is-horse-forest [data-workflow-only]{display:none!important}
    .horse-v16-stage{height:100%;min-height:calc(100vh - 120px);overflow:auto;padding:18px 20px 22px;color:var(--cream,#f4ead4);background:radial-gradient(circle at 50% 0%,rgba(109,181,115,.13),transparent 34%),#06100a}
    .horse-v16-workspace{display:grid;grid-template-columns:minmax(620px,1fr) 300px;gap:14px;align-items:start}
    .horse-v16-view-card,.horse-v16-side-card{border:1px solid rgba(154,230,164,.25);border-radius:16px;background:rgba(6,18,10,.88);box-shadow:0 14px 36px rgba(0,0,0,.32)}
    .horse-v16-view-card{padding:16px;display:flex;flex-direction:column;gap:12px}.horse-v16-header{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(154,230,164,.18);padding-bottom:12px}.horse-v16-header h2{margin:2px 0 0;font-family:'Cinzel',Georgia,serif;font-size:1.36rem;line-height:1.1}.horse-v16-header p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}.horse-v16-pill{align-self:flex-start;border:1px solid rgba(238,196,90,.36);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .horse-v16-three-wrap{position:relative;height:500px;overflow:hidden;border:1px solid rgba(154,230,164,.22);border-radius:18px;background:#8eabb5;isolation:isolate;user-select:none}.horse-v16-three-wrap canvas{display:block;width:100%!important;height:500px!important;cursor:crosshair}.horse-v16-three-wrap:after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 42%,rgba(0,0,0,.38) 100%),linear-gradient(to bottom,rgba(0,0,0,.05),transparent 30%,rgba(0,0,0,.25) 100%)}
    .horse-v16-horse{position:absolute;left:50%;bottom:-10px;width:230px;height:116px;transform:translateX(-50%);z-index:30;pointer-events:none;opacity:.9}.horse-v16-horse:before,.horse-v16-horse:after{content:'';position:absolute;bottom:0;width:92px;height:102px;border-radius:48% 48% 30% 30%;background:linear-gradient(135deg,#4a2b1a,#27150d);box-shadow:inset 0 10px 20px rgba(255,255,255,.09)}.horse-v16-horse:before{left:28px;transform:rotate(-10deg);clip-path:polygon(30% 0,60% 0,84% 100%,10% 100%)}.horse-v16-horse:after{right:28px;transform:rotate(10deg);clip-path:polygon(40% 0,70% 0,90% 100%,16% 100%)}
    .horse-v16-reticle{position:absolute;left:50%;top:65%;width:44px;height:14px;margin-left:-22px;margin-top:-7px;border:1px solid rgba(238,196,90,.72);border-radius:50%;box-shadow:0 0 18px rgba(238,196,90,.24);z-index:31;pointer-events:none}.horse-v16-reticle:after{content:'';position:absolute;left:50%;top:-18px;width:1px;height:52px;background:rgba(238,196,90,.7)}.horse-v16-hud{position:absolute;left:14px;right:14px;bottom:10px;display:flex;justify-content:space-between;gap:12px;z-index:32;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.9);pointer-events:none}
    .horse-v16-help{display:flex;justify-content:space-between;gap:12px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}.horse-v16-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.horse-v16-controls button,.horse-v16-mini-grid button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.horse-v16-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.horse-v16-side-card h3{margin:0;font-family:'Cinzel',Georgia,serif;font-size:1.03rem}.horse-v16-metric{display:flex;justify-content:space-between;border:1px solid rgba(154,230,164,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.horse-v16-metric strong{color:var(--cream,#f4ead4)}.horse-v16-result{min-height:64px;border:1px solid rgba(154,230,164,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.horse-v16-result[data-state='waiting']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}.horse-v16-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.horse-v16-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.horse-v16-panel-copy{margin:0 0 14px;font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae)}.horse-v16-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}@media(max-width:1080px){.horse-v16-workspace{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function buildDom() {
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) {
    console.warn('[HorseForestV16] Missing Puzzle Creator panels.');
    return false;
  }

  H.stage = document.createElement('section');
  H.stage.id = 'horse-forest-v16-stage';
  H.stage.className = 'horse-v16-stage';
  H.stage.hidden = true;
  H.stage.innerHTML = `<div class="horse-v16-workspace"><section class="horse-v16-view-card"><div class="horse-v16-header"><div><p class="eyebrow">Obstacle Course · Horse Forest Runner V16</p><h2>Horse Forest Ride</h2><p>Procedural geometry reset. Ride through a generated 3D forest, jump logs, rocks and streams, and keep moving forward.</p></div><span id="horse-v16-status" class="horse-v16-pill">Ready</span></div><div id="horse-v16-host" class="horse-v16-three-wrap"><div class="horse-v16-horse"></div><div class="horse-v16-reticle"></div><div class="horse-v16-hud"><span>WASD / arrows steer · Space jumps</span><span id="horse-v16-distance">0m / 2800m</span></div></div><div class="horse-v16-help"><span>No textures. Trees, rocks, logs, streams and ground are all Three.js geometry.</span><span>Pass 2–3: procedural trees plus jump obstacles are visible now.</span></div><div class="horse-v16-controls"><button id="horse-v16-start" type="button">Start Test</button><button id="horse-v16-pause" type="button">Pause</button><button id="horse-v16-reset" type="button">Reset Run</button></div></section><aside class="horse-v16-side-card"><p class="eyebrow">Ride Result</p><h3>Score</h3><div class="horse-v16-metric"><span>Score</span><strong id="horse-v16-score">0</strong></div><div class="horse-v16-metric"><span>Hits</span><strong id="horse-v16-hits">0</strong></div><div class="horse-v16-metric"><span>Jumps</span><strong id="horse-v16-jumps">0</strong></div><div class="horse-v16-metric"><span>Difficulty</span><strong id="horse-v16-difficulty-readout">2</strong></div><div id="horse-v16-result" class="horse-v16-result" data-state="waiting">Course waiting. Start the test when ready.</div></aside></div>`;
  rightPanel.prepend(H.stage);

  H.panels = document.createElement('div');
  H.panels.id = 'horse-forest-v16-panels';
  H.panels.hidden = true;
  H.panels.innerHTML = `<section class="panel tool-panel horse-v16-panel" data-horse-v16-panel="build"><div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Forest</h2></div><span class="status-pill is-waiting">V16</span></div><p class="horse-v16-panel-copy">Geometry-only runner. Pass 1 builds chunks/camera/ground. Pass 2 adds procedural trees. Pass 3 adds logs, rocks and streams.</p><label class="range-row"><span>Course Duration <output id="horse-v16-duration-out">78s</output></span><input id="horse-v16-duration" type="range" min="30" max="120" step="5" value="78"></label><label class="range-row"><span>Difficulty <output id="horse-v16-difficulty-out">2</output></span><input id="horse-v16-difficulty" type="range" min="1" max="5" value="2"></label><button id="horse-v16-regenerate" class="wide-button" type="button">Regenerate Geometry Forest</button></section><section class="panel tool-panel horse-v16-panel" data-horse-v16-panel="display" hidden><div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Geometry Layers</h2></div></div><p class="horse-v16-panel-copy">Sky colour, fog, path planes, side ground planes, procedural conifer trees, low-poly rocks, cylinders for logs and blue stream planes. No images are used.</p></section><section class="panel tool-panel horse-v16-panel" data-horse-v16-panel="logic" hidden><div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Collision</h2></div></div><p class="horse-v16-panel-copy">Logs, rocks and streams are jump obstacles. Trees are scenery only for now. Pass 4 can add branch pickups and collectibles.</p></section><section class="panel tool-panel horse-v16-panel" data-horse-v16-panel="visuals" hidden><div class="panel-title-row"><div><p class="eyebrow">04 · Density</p><h2>Debug Controls</h2></div></div><p class="horse-v16-panel-copy">These buttons add more generated content ahead of the current route.</p><div class="horse-v16-mini-grid"><button id="horse-v16-more-trees" type="button">Add More Trees</button><button id="horse-v16-more-obstacles" type="button">Add More Obstacles</button></div></section>`;
  leftBody.appendChild(H.panels);

  H.host = $('horse-v16-host');
  H.result = $('horse-v16-result');
  bindControls();
  return true;
}

function bindControls() {
  $('horse-v16-start')?.addEventListener('click', startRun);
  $('horse-v16-pause')?.addEventListener('click', pauseRun);
  $('horse-v16-reset')?.addEventListener('click', () => resetRun(false));
  $('horse-v16-regenerate')?.addEventListener('click', regenerateWorld);
  $('horse-v16-more-trees')?.addEventListener('click', () => addExtraTreesAhead());
  $('horse-v16-more-obstacles')?.addEventListener('click', () => addExtraObstaclesAhead());
  $('horse-v16-duration')?.addEventListener('input', (event) => {
    H.duration = Number(event.target.value);
    H.courseLength = Math.round(H.duration * 36);
    $('horse-v16-duration-out').textContent = `${H.duration}s`;
    regenerateWorld();
  });
  $('horse-v16-difficulty')?.addEventListener('input', (event) => {
    H.difficulty = Number(event.target.value);
    $('horse-v16-difficulty-out').textContent = String(H.difficulty);
    $('horse-v16-difficulty-readout').textContent = String(H.difficulty);
    regenerateWorld();
  });

  window.addEventListener('keydown', (event) => {
    if (!H.active) return;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s','A','D','W','S',' '].includes(event.key)) {
      event.preventDefault();
      if (event.key === ' ') jump();
      else H.keys.add(event.key.toLowerCase());
    }
  });
  window.addEventListener('keyup', (event) => H.keys.delete(event.key.toLowerCase()));

  document.querySelector('.left-icon-bar')?.addEventListener('click', (event) => {
    if (!H.active) return;
    const button = event.target.closest('.panel-nav-button');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showPanel(button.dataset.panel);
  }, true);
}

function makeMaterials() {
  H.materials = {
    path: new THREE.MeshLambertMaterial({ color: COLORS.path }),
    pathDark: new THREE.MeshLambertMaterial({ color: COLORS.pathDark }),
    pathLight: new THREE.MeshLambertMaterial({ color: COLORS.pathLight }),
    grassDark: new THREE.MeshLambertMaterial({ color: COLORS.grassDark }),
    grass: new THREE.MeshLambertMaterial({ color: COLORS.grass }),
    moss: new THREE.MeshLambertMaterial({ color: COLORS.moss }),
    trunk: new THREE.MeshLambertMaterial({ color: COLORS.trunk }),
    trunkDark: new THREE.MeshLambertMaterial({ color: COLORS.trunkDark }),
    pineDark: new THREE.MeshLambertMaterial({ color: COLORS.pineDark }),
    pineMid: new THREE.MeshLambertMaterial({ color: COLORS.pineMid }),
    pineLight: new THREE.MeshLambertMaterial({ color: COLORS.pineLight }),
    rock: new THREE.MeshLambertMaterial({ color: COLORS.rock, flatShading: true }),
    rockDark: new THREE.MeshLambertMaterial({ color: COLORS.rockDark, flatShading: true }),
    log: new THREE.MeshLambertMaterial({ color: COLORS.log }),
    logCut: new THREE.MeshLambertMaterial({ color: COLORS.logCut }),
    stream: new THREE.MeshLambertMaterial({ color: COLORS.stream, transparent: true, opacity: 0.82 }),
    streamLight: new THREE.MeshLambertMaterial({ color: COLORS.streamLight, transparent: true, opacity: 0.48 }),
    shadow: new THREE.MeshBasicMaterial({ color: COLORS.shadow, transparent: true, opacity: 0.28, depthWrite: false }),
  };
}

function makeGeometries() {
  H.geometries = {
    pathPlane: new THREE.PlaneGeometry(5.8, CHUNK_LENGTH),
    sidePlane: new THREE.PlaneGeometry(18, CHUNK_LENGTH),
    stripe: new THREE.PlaneGeometry(0.08, 4.2),
    trunk: new THREE.CylinderGeometry(0.22, 0.34, 3.4, 8),
    branch: new THREE.CylinderGeometry(0.045, 0.07, 1.45, 6),
    coneLow: new THREE.ConeGeometry(1.6, 2.4, 8),
    coneMid: new THREE.ConeGeometry(1.25, 2.1, 8),
    coneTop: new THREE.ConeGeometry(0.9, 1.65, 8),
    log: new THREE.CylinderGeometry(0.24, 0.3, 3.4, 12),
    logEnd: new THREE.CylinderGeometry(0.255, 0.255, 0.05, 12),
    rock: new THREE.DodecahedronGeometry(0.58, 0),
    stream: new THREE.PlaneGeometry(7.4, 3.4),
    clump: new THREE.ConeGeometry(0.22, 0.42, 6),
    shadow: new THREE.CircleGeometry(1, 18),
  };
  Object.values(H.geometries).forEach((geometry) => {
    if (geometry.type === 'PlaneGeometry' || geometry.type === 'CircleGeometry') geometry.rotateX(-Math.PI / 2);
  });
}

function initThree() {
  if (H.renderer) return;
  H.scene = new THREE.Scene();
  H.scene.background = new THREE.Color(COLORS.sky);
  H.scene.fog = new THREE.Fog(COLORS.fog, 34, FAR_DISTANCE * 0.9);

  H.camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, FAR_DISTANCE + 80);
  H.camera.position.set(0, 2.15, 8.5);

  H.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  H.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  H.renderer.outputEncoding = THREE.sRGBEncoding;
  H.host.prepend(H.renderer.domElement);

  makeMaterials();
  makeGeometries();

  H.world = new THREE.Group();
  H.scene.add(H.world);

  const hemi = new THREE.HemisphereLight(0xb7d7c8, 0x29331d, 1.35);
  H.scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xf0dfb8, 1.05);
  sun.position.set(-12, 18, 8);
  H.scene.add(sun);
  const lowFill = new THREE.DirectionalLight(0x7fa27b, 0.35);
  lowFill.position.set(9, 5, -12);
  H.scene.add(lowFill);

  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
}

function resizeRenderer() {
  if (!H.renderer || !H.host) return;
  const rect = H.host.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width));
  const height = 500;
  H.renderer.setSize(width, height, false);
  H.camera.aspect = width / height;
  H.camera.updateProjectionMatrix();
}

function clearWorld() {
  if (!H.world) return;
  for (const chunk of H.chunks) H.world.remove(chunk.group);
  H.chunks = [];
  H.obstacles = [];
  H.nextChunkZ = 0;
}

function regenerateWorld() {
  pauseRun();
  clearWorld();
  H.distance = 0;
  H.score = 0;
  H.hits = 0;
  H.jumps = 0;
  H.complete = false;
  H.player.x = 0;
  H.player.y = 0;
  H.player.vy = 0;
  H.player.grounded = true;
  ensureChunks();
  updateStats();
  setResult('Generated geometry forest ready. Start the test when ready.', 'waiting');
  drawFrame(0);
}

function ensureChunks() {
  const targetAhead = H.distance + FAR_DISTANCE;
  while (H.nextChunkZ < targetAhead && H.nextChunkZ < H.courseLength + FAR_DISTANCE * 0.2) {
    createChunk(H.nextChunkZ);
    H.nextChunkZ += CHUNK_LENGTH;
  }
  const removeBefore = H.distance - CHUNK_LENGTH * CHUNKS_BEHIND;
  while (H.chunks.length && H.chunks[0].zStart + CHUNK_LENGTH < removeBefore) {
    const old = H.chunks.shift();
    H.world.remove(old.group);
    H.obstacles = H.obstacles.filter((obstacle) => obstacle.chunk !== old);
  }
}

function createChunk(zStart) {
  const group = new THREE.Group();
  group.position.z = -(zStart - H.distance);
  H.world.add(group);
  const chunk = { zStart, group };
  H.chunks.push(chunk);

  addGroundToChunk(group);
  addTreeBandToChunk(chunk, -1);
  addTreeBandToChunk(chunk, 1);
  addGroundClumpsToChunk(group);
  addObstacleToChunk(chunk);
}

function addGroundToChunk(group) {
  const path = new THREE.Mesh(H.geometries.pathPlane, H.materials.path);
  path.position.set(0, 0, -CHUNK_LENGTH / 2);
  path.receiveShadow = true;
  group.add(path);

  const left = new THREE.Mesh(H.geometries.sidePlane, H.materials.grassDark);
  left.position.set(-11.7, -0.015, -CHUNK_LENGTH / 2);
  group.add(left);

  const right = new THREE.Mesh(H.geometries.sidePlane, H.materials.grassDark);
  right.position.set(11.7, -0.015, -CHUNK_LENGTH / 2);
  group.add(right);

  for (let i = 0; i < 6; i += 1) {
    const stripe = new THREE.Mesh(H.geometries.stripe, i % 2 ? H.materials.pathLight : H.materials.pathDark);
    stripe.position.set(rand(-2.1, 2.1), 0.012, -rand(3, CHUNK_LENGTH - 2));
    stripe.rotation.y = rand(-0.25, 0.25);
    stripe.scale.set(rand(0.6, 1.7), 1, rand(0.5, 1.6));
    group.add(stripe);
  }
}

function addTreeBandToChunk(chunk, side) {
  const baseX = side * rand(7.2, 9.3);
  const dense = 4 + H.difficulty;
  const treeCount = dense + Math.floor(Math.random() * 4);
  for (let i = 0; i < treeCount; i += 1) {
    const zLocal = rand(2, CHUNK_LENGTH - 2);
    const x = baseX + side * rand(0, 10.5);
    const scale = rand(0.72, 1.7) * (Math.abs(x) < 10.5 ? 1.22 : 0.95);
    const tree = createTree(scale, Math.random() < 0.24);
    tree.position.set(x, 0, -zLocal);
    tree.rotation.y = rand(0, Math.PI * 2);
    chunk.group.add(tree);
  }
}

function createTree(scale = 1, leaning = false) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(H.geometries.trunk, Math.random() < 0.3 ? H.materials.trunkDark : H.materials.trunk);
  trunk.position.y = 1.7 * scale;
  trunk.scale.set(0.75 * scale, scale, 0.75 * scale);
  if (leaning) {
    trunk.rotation.z = rand(-0.07, 0.07);
    trunk.rotation.x = rand(-0.05, 0.05);
  }
  tree.add(trunk);

  const branchCount = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < branchCount; i += 1) {
    const branch = new THREE.Mesh(H.geometries.branch, H.materials.trunkDark);
    branch.position.y = rand(1.6, 3.3) * scale;
    branch.scale.set(scale, scale, scale);
    branch.rotation.z = Math.PI / 2 + rand(-0.35, 0.35);
    branch.rotation.y = rand(0, Math.PI * 2);
    tree.add(branch);
  }

  const palette = [H.materials.pineDark, H.materials.pineMid, H.materials.pineLight];
  const foliage1 = new THREE.Mesh(H.geometries.coneLow, choose(palette));
  foliage1.position.y = 3.0 * scale;
  foliage1.scale.set(scale, scale, scale);
  tree.add(foliage1);
  const foliage2 = new THREE.Mesh(H.geometries.coneMid, choose(palette));
  foliage2.position.y = 4.0 * scale;
  foliage2.scale.set(scale * 0.96, scale, scale * 0.96);
  tree.add(foliage2);
  const foliage3 = new THREE.Mesh(H.geometries.coneTop, choose(palette));
  foliage3.position.y = 4.92 * scale;
  foliage3.scale.set(scale * 0.9, scale, scale * 0.9);
  tree.add(foliage3);

  const shadow = new THREE.Mesh(H.geometries.shadow, H.materials.shadow);
  shadow.position.y = 0.011;
  shadow.scale.set(1.3 * scale, 0.7 * scale, 1);
  tree.add(shadow);
  return tree;
}

function addGroundClumpsToChunk(group) {
  const clumps = 8 + H.difficulty * 2;
  for (let i = 0; i < clumps; i += 1) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const clump = new THREE.Mesh(H.geometries.clump, Math.random() < 0.45 ? H.materials.moss : H.materials.grass);
    clump.position.set(side * rand(4.1, 12.5), 0.22, -rand(1, CHUNK_LENGTH - 1));
    clump.scale.set(rand(0.6, 1.8), rand(0.6, 1.7), rand(0.6, 1.8));
    clump.rotation.y = rand(0, Math.PI * 2);
    group.add(clump);
  }
}

function addObstacleToChunk(chunk) {
  if (chunk.zStart < 40 || Math.random() > 0.55 + H.difficulty * 0.07) return;
  const type = choose(['log', 'rock', 'stream']);
  const zLocal = rand(8, CHUNK_LENGTH - 7);
  const lane = choose([-1, 0, 1]);
  const x = type === 'stream' ? 0 : lane * rand(1.25, 1.95);
  let mesh;
  let radius = 1.15;
  let jumpRequired = true;

  if (type === 'log') {
    mesh = createLog();
    mesh.position.set(x, 0.32, -zLocal);
    mesh.rotation.z = Math.PI / 2 + rand(-0.12, 0.12);
    radius = 1.35;
  } else if (type === 'rock') {
    mesh = createRock();
    mesh.position.set(x, 0.42, -zLocal);
    radius = 1.05;
  } else {
    mesh = createStream();
    mesh.position.set(0, 0.025, -zLocal);
    radius = 2.1;
  }

  chunk.group.add(mesh);
  H.obstacles.push({ chunk, mesh, type, x, z: chunk.zStart + zLocal, radius, hit: false, jumpRequired });
}

function createLog() {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(H.geometries.log, H.materials.log);
  group.add(trunk);
  const endA = new THREE.Mesh(H.geometries.logEnd, H.materials.logCut);
  endA.position.y = 1.72;
  group.add(endA);
  const endB = new THREE.Mesh(H.geometries.logEnd, H.materials.logCut);
  endB.position.y = -1.72;
  group.add(endB);
  return group;
}

function createRock() {
  const group = new THREE.Group();
  const count = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i += 1) {
    const rock = new THREE.Mesh(H.geometries.rock, Math.random() < 0.45 ? H.materials.rockDark : H.materials.rock);
    rock.position.set(rand(-0.35, 0.35), rand(-0.04, 0.1), rand(-0.3, 0.3));
    rock.scale.set(rand(0.8, 1.5), rand(0.55, 1.0), rand(0.75, 1.4));
    rock.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    group.add(rock);
  }
  return group;
}

function createStream() {
  const group = new THREE.Group();
  const water = new THREE.Mesh(H.geometries.stream, H.materials.stream);
  group.add(water);
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 0.18).rotateX(-Math.PI / 2), H.materials.streamLight);
  glint.position.z = -0.45;
  group.add(glint);
  const bankA = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.16, 0.22), H.materials.pathDark);
  bankA.position.z = 1.78;
  bankA.position.y = 0.08;
  group.add(bankA);
  const bankB = bankA.clone();
  bankB.position.z = -1.78;
  group.add(bankB);
  return group;
}

function addExtraTreesAhead() {
  if (!H.chunks.length) return;
  const visible = H.chunks.slice(-8);
  visible.forEach((chunk) => {
    addTreeBandToChunk(chunk, -1);
    addTreeBandToChunk(chunk, 1);
  });
  drawFrame(0);
}

function addExtraObstaclesAhead() {
  H.chunks.slice(-10).forEach((chunk) => addObstacleToChunk(chunk));
  drawFrame(0);
}

function startRun() {
  if (H.running) return;
  H.running = true;
  H.complete = false;
  H.lastTime = performance.now();
  $('horse-v16-status').textContent = 'Riding';
  setResult('Ride running. Space jumps logs, rocks and streams.', 'waiting');
}

function pauseRun() {
  H.running = false;
  if ($('horse-v16-status')) $('horse-v16-status').textContent = 'Paused';
}

function resetRun(quiet = false) {
  H.running = false;
  H.complete = false;
  H.distance = 0;
  H.score = 0;
  H.hits = 0;
  H.jumps = 0;
  H.player.x = 0;
  H.player.y = 0;
  H.player.vy = 0;
  H.player.grounded = true;
  H.obstacles.forEach((obstacle) => {
    obstacle.hit = false;
    obstacle.mesh.visible = true;
  });
  updateStats();
  if (!quiet) setResult('Course reset. Start the test when ready.', 'waiting');
  drawFrame(0);
}

function jump() {
  if (!H.active || !H.player.grounded) return;
  H.player.vy = 8.4;
  H.player.grounded = false;
  H.jumps += 1;
  updateStats();
}

function loop(now) {
  if (!H.active) return;
  const dt = Math.min(0.05, ((now || performance.now()) - H.lastTime) / 1000 || 0.016);
  H.lastTime = now || performance.now();
  drawFrame(dt);
  H.raf = requestAnimationFrame(loop);
}

function drawFrame(dt) {
  if (!H.renderer || !H.scene || !H.camera) return;
  if (H.running && !H.complete) updateRun(dt);
  updateChunks();
  updateCamera();
  H.renderer.render(H.scene, H.camera);
}

function updateRun(dt) {
  let steer = 0;
  if (H.keys.has('arrowleft') || H.keys.has('a')) steer -= 1;
  if (H.keys.has('arrowright') || H.keys.has('d')) steer += 1;
  let speedMod = 1;
  if (H.keys.has('arrowup') || H.keys.has('w')) speedMod = 1.15;
  if (H.keys.has('arrowdown') || H.keys.has('s')) speedMod = 0.78;

  H.player.x = clamp(H.player.x + steer * 5.8 * dt, -2.45, 2.45);
  H.player.vy -= 18 * dt;
  H.player.y += H.player.vy * dt;
  if (H.player.y <= 0) {
    H.player.y = 0;
    H.player.vy = 0;
    H.player.grounded = true;
  }

  H.distance += H.speed * speedMod * dt;
  H.score = Math.max(0, Math.floor(H.distance / 25) - H.hits * 3);
  ensureChunks();
  checkCollisions();
  updateStats();

  if (H.distance >= H.courseLength) finishRun();
}

function updateChunks() {
  ensureChunks();
  for (const chunk of H.chunks) {
    chunk.group.position.z = -(chunk.zStart - H.distance);
  }
}

function updateCamera() {
  const bob = H.running ? Math.sin(performance.now() * 0.011) * 0.055 : 0;
  H.camera.position.set(H.player.x * 0.42, 2.1 + H.player.y * 0.28 + bob, 8.4);
  H.camera.lookAt(H.player.x * 0.62, 1.24 + H.player.y * 0.08, -38);
}

function checkCollisions() {
  for (const obstacle of H.obstacles) {
    if (obstacle.hit) continue;
    const rel = obstacle.z - H.distance;
    if (rel < -1.2 || rel > 1.1) continue;
    const playerClear = H.player.y > 1.05;
    const xHit = obstacle.type === 'stream' || Math.abs(obstacle.x - H.player.x) < obstacle.radius;
    if (!xHit) continue;
    if (!playerClear) {
      obstacle.hit = true;
      obstacle.mesh.visible = false;
      H.hits += 1;
      setResult(`Hit ${obstacle.type}. Jump earlier next time.`, 'failure');
    }
  }
}

function finishRun() {
  H.running = false;
  H.complete = true;
  $('horse-v16-status').textContent = 'Finished';
  setResult(`Finished geometry forest run. Score ${H.score}, hits ${H.hits}.`, H.hits <= 4 ? 'success' : 'failure');
}

function updateStats() {
  if (!$('horse-v16-score')) return;
  $('horse-v16-score').textContent = String(H.score);
  $('horse-v16-hits').textContent = String(H.hits);
  $('horse-v16-jumps').textContent = String(H.jumps);
  $('horse-v16-distance').textContent = `${Math.round(H.distance)}m / ${H.courseLength}m`;
}

function setResult(text, state = 'waiting') {
  if (!H.result) return;
  H.result.textContent = text;
  H.result.dataset.state = state;
}

function showPanel(panelId) {
  if (!H.panels) return;
  H.panels.querySelectorAll('[data-horse-v16-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.horseV16Panel !== panelId;
    panel.classList.toggle('is-active', panel.dataset.horseV16Panel === panelId);
  });
  document.querySelectorAll('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panelId));
}

function ensureMounted() {
  if (H.mounted) return true;
  injectStyles();
  if (!buildDom()) return false;
  initThree();
  H.mounted = true;
  return true;
}

function openHorseForestRunner() {
  if (!ensureMounted()) return;
  H.active = true;
  document.body.classList.add('is-horse-forest');
  document.body.classList.remove('is-obstacle-course','is-pattern-lock','is-potion-match','is-puzzle-chooser','is-puzzle-brief');
  $('puzzle-launcher-panel')?.setAttribute('hidden','');
  $('puzzle-module-brief-page')?.setAttribute('hidden','');
  H.stage.hidden = false;
  H.panels.hidden = false;
  showPanel('build');
  resizeRenderer();
  regenerateWorld();
  H.lastTime = performance.now();
  if (!H.raf) H.raf = requestAnimationFrame(loop);
}

function closeHorseForestRunner() {
  if (!H.mounted) return;
  pauseRun();
  H.active = false;
  H.stage.hidden = true;
  H.panels.hidden = true;
  document.body.classList.remove('is-horse-forest');
  if (H.raf) cancelAnimationFrame(H.raf);
  H.raf = null;
}

function interceptObstacleCourseClick(event) {
  const button = event.target.closest("[data-engine='obstacle-course']");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((candidate) => {
    const active = candidate.dataset.engine === 'obstacle-course';
    candidate.classList.toggle('is-active', active);
    candidate.classList.toggle('is-selected', active);
  });
  openHorseForestRunner();
}

function renameObstacleCourseMenu() {
  document.querySelectorAll("[data-engine='obstacle-course']").forEach((button) => {
    button.querySelector('strong, .puzzle-type-title, h3')?.replaceChildren(document.createTextNode('Horse Forest Ride'));
    const small = button.querySelector('small, p');
    if (small) small.textContent = 'Procedural geometry forest runner: trees, logs, rocks and streams.';
  });
}

function bootHorseForestRunner() {
  document.addEventListener('click', interceptObstacleCourseClick, true);
  renameObstacleCourseMenu();
  setTimeout(renameObstacleCourseMenu, 400);
  setTimeout(renameObstacleCourseMenu, 1200);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootHorseForestRunner, { once: true });
else bootHorseForestRunner();

window.__artifexHorseForestRunner = {
  version: HORSE_VERSION,
  open: openHorseForestRunner,
  close: closeHorseForestRunner,
  regenerate: regenerateWorld,
  getState: () => ({
    version: HORSE_VERSION,
    distance: H.distance,
    courseLength: H.courseLength,
    score: H.score,
    hits: H.hits,
    jumps: H.jumps,
    difficulty: H.difficulty,
    chunks: H.chunks.length,
    obstacles: H.obstacles.length,
  }),
};
