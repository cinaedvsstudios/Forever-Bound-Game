// Horse Forest Runner V15
// Full reset: procedural Three.js forest runner with NO textures and NO image cards.
// Passes included: 1) clean world/chunks, 2) procedural trees, 3) logs/rocks/streams.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const VERSION = 'v15-procedural-geometry-reset';

const COLORS = {
  sky: 0x7f9aa9,
  fog: 0x35493f,
  ground: 0x1c2a16,
  path: 0x4a351f,
  pathDark: 0x2b1c10,
  moss: 0x2e5a28,
  grass: 0x3d6e31,
  grassDark: 0x173215,
  trunk: 0x3b2415,
  trunkDark: 0x24140c,
  pineA: 0x123a20,
  pineB: 0x1d5429,
  pineC: 0x0d2516,
  rock: 0x5f6259,
  rockDark: 0x363932,
  log: 0x5a321b,
  logEnd: 0x8a6741,
  stream: 0x245b78,
  streamLight: 0x5a9ab3,
  warning: 0xeec45a,
  hit: 0xd46a45,
};

const CONFIG = {
  chunkLength: 74,
  chunksAhead: 10,
  chunksBehind: 2,
  courseLength: 1700,
  speed: 31,
  steerSpeed: 7.2,
  laneWidth: 2.8,
  pathHalfWidth: 4.1,
  collisionZ: 5.8,
  jumpPower: 8.3,
  gravity: 18.5,
  treeDensityBase: 18,
  obstacleBase: 2,
};

const Geo = {};
const Mat = {};

const H = {
  mounted: false,
  active: false,
  running: false,
  complete: false,
  raf: null,
  stage: null,
  panels: null,
  host: null,
  renderer: null,
  scene: null,
  camera: null,
  clock: null,
  world: null,
  chunks: [],
  obstacles: [],
  difficulty: 2,
  duration: 55,
  courseLength: CONFIG.courseLength,
  distance: 0,
  score: 0,
  hits: 0,
  jumps: 0,
  streamsJumped: 0,
  logsJumped: 0,
  rocksAvoided: 0,
  successScore: 20,
  successEventId: 'horse_forest_success',
  failureEventId: 'horse_forest_failure',
  player: { x: 0, y: 0, vy: 0, onGround: true },
  keys: new Set(),
};

const $ = (id) => document.getElementById(id);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => min + Math.random() * (max - min);
const choose = (items) => items[Math.floor(Math.random() * items.length)];

function disposeObject(object) {
  if (!object) return;
  object.traverse((node) => {
    if (node.geometry && !Object.values(Geo).includes(node.geometry)) node.geometry.dispose?.();
  });
}

function setupSharedGeometry() {
  if (Geo.path) return;
  Geo.path = new THREE.PlaneGeometry(CONFIG.pathHalfWidth * 2, CONFIG.chunkLength, 1, 1);
  Geo.sideGround = new THREE.PlaneGeometry(18, CONFIG.chunkLength, 1, 1);
  Geo.trunk = new THREE.CylinderGeometry(0.22, 0.32, 5.2, 8, 1);
  Geo.branch = new THREE.CylinderGeometry(0.055, 0.085, 2.4, 6, 1);
  Geo.pineSmall = new THREE.ConeGeometry(1.1, 2.8, 8, 1);
  Geo.pineMed = new THREE.ConeGeometry(1.35, 3.2, 8, 1);
  Geo.pineBig = new THREE.ConeGeometry(1.6, 3.5, 8, 1);
  Geo.lowPine = new THREE.ConeGeometry(0.8, 1.9, 7, 1);
  Geo.rock = new THREE.DodecahedronGeometry(0.85, 0);
  Geo.smallRock = new THREE.IcosahedronGeometry(0.55, 0);
  Geo.log = new THREE.CylinderGeometry(0.34, 0.42, 3.3, 12, 1);
  Geo.logEnd = new THREE.CircleGeometry(0.44, 12);
  Geo.stream = new THREE.PlaneGeometry(CONFIG.pathHalfWidth * 2.2, 3.5, 1, 1);
  Geo.bank = new THREE.BoxGeometry(CONFIG.pathHalfWidth * 2.4, 0.18, 0.28);
  Geo.grassBlade = new THREE.ConeGeometry(0.08, 0.6, 4, 1);
}

function setupMaterials() {
  if (Mat.path) return;
  Mat.path = new THREE.MeshLambertMaterial({ color: COLORS.path });
  Mat.pathDark = new THREE.MeshLambertMaterial({ color: COLORS.pathDark });
  Mat.ground = new THREE.MeshLambertMaterial({ color: COLORS.ground });
  Mat.moss = new THREE.MeshLambertMaterial({ color: COLORS.moss });
  Mat.grass = new THREE.MeshLambertMaterial({ color: COLORS.grass });
  Mat.grassDark = new THREE.MeshLambertMaterial({ color: COLORS.grassDark });
  Mat.trunk = new THREE.MeshLambertMaterial({ color: COLORS.trunk });
  Mat.trunkDark = new THREE.MeshLambertMaterial({ color: COLORS.trunkDark });
  Mat.pineA = new THREE.MeshLambertMaterial({ color: COLORS.pineA });
  Mat.pineB = new THREE.MeshLambertMaterial({ color: COLORS.pineB });
  Mat.pineC = new THREE.MeshLambertMaterial({ color: COLORS.pineC });
  Mat.rock = new THREE.MeshLambertMaterial({ color: COLORS.rock });
  Mat.rockDark = new THREE.MeshLambertMaterial({ color: COLORS.rockDark });
  Mat.log = new THREE.MeshLambertMaterial({ color: COLORS.log });
  Mat.logEnd = new THREE.MeshLambertMaterial({ color: COLORS.logEnd });
  Mat.stream = new THREE.MeshLambertMaterial({ color: COLORS.stream, transparent: true, opacity: 0.86 });
  Mat.streamLight = new THREE.MeshBasicMaterial({ color: COLORS.streamLight, transparent: true, opacity: 0.36 });
  Mat.warning = new THREE.MeshBasicMaterial({ color: COLORS.warning });
  Mat.hit = new THREE.MeshBasicMaterial({ color: COLORS.hit });
}

function injectStyles() {
  if ($('horse-forest-v15-styles')) return;
  const style = document.createElement('style');
  style.id = 'horse-forest-v15-styles';
  style.textContent = `
    .is-horse-forest .right-preview-layout,.is-horse-forest .overview-window,.is-horse-forest #puzzle-launcher-panel,.is-horse-forest #puzzle-module-brief-page{display:none!important}
    .is-horse-forest .left-panel-body>[data-panel-content],.is-horse-forest [data-workflow-menu],.is-horse-forest [data-workflow-only]{display:none!important}
    .horse-proc-stage{height:100%;min-height:calc(100vh - 120px);overflow:auto;padding:18px 20px 22px;background:radial-gradient(circle at 50% 0%,rgba(109,181,115,.14),transparent 34%),#06100a;color:var(--cream,#f4ead4)}
    .horse-proc-workspace{display:grid;grid-template-columns:minmax(620px,1fr) 300px;gap:14px;align-items:start}
    .horse-proc-view-card,.horse-proc-side-card{border:1px solid rgba(154,230,164,.25);border-radius:16px;background:rgba(6,18,10,.88);box-shadow:0 14px 36px rgba(0,0,0,.32)}
    .horse-proc-view-card{padding:16px;display:flex;flex-direction:column;gap:12px;min-height:min(720px,calc(100vh - 140px))}
    .horse-proc-header{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(154,230,164,.18);padding-bottom:12px}.horse-proc-header h2{margin:2px 0 0;font-family:'Cinzel',Georgia,serif;font-size:1.36rem}.horse-proc-header p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}.horse-proc-pill{align-self:flex-start;border:1px solid rgba(238,196,90,.36);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .horse-proc-host{position:relative;height:500px;border:1px solid rgba(154,230,164,.22);border-radius:18px;overflow:hidden;background:#101810;isolation:isolate}.horse-proc-host canvas{display:block;width:100%!important;height:500px!important;cursor:crosshair}
    .horse-proc-horse{position:absolute;left:50%;bottom:-10px;width:230px;height:116px;transform:translateX(-50%);z-index:30;pointer-events:none;opacity:.9}.horse-proc-horse:before,.horse-proc-horse:after{content:'';position:absolute;bottom:0;width:92px;height:102px;border-radius:48% 48% 30% 30%;background:linear-gradient(135deg,#4a2b1a,#27150d);box-shadow:inset 0 10px 20px rgba(255,255,255,.09)}.horse-proc-horse:before{left:28px;transform:rotate(-10deg);clip-path:polygon(30% 0,60% 0,84% 100%,10% 100%)}.horse-proc-horse:after{right:28px;transform:rotate(10deg);clip-path:polygon(40% 0,70% 0,90% 100%,16% 100%)}
    .horse-proc-reticle{position:absolute;left:50%;top:61%;width:46px;height:14px;margin-left:-23px;margin-top:-7px;border:1px solid rgba(238,196,90,.7);border-radius:50%;box-shadow:0 0 18px rgba(238,196,90,.24);z-index:31;pointer-events:none}.horse-proc-reticle:after{content:'';position:absolute;left:50%;top:-18px;width:1px;height:52px;background:rgba(238,196,90,.7)}
    .horse-proc-hud{position:absolute;left:14px;right:14px;bottom:10px;display:flex;justify-content:space-between;gap:12px;z-index:32;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.9);pointer-events:none}
    .horse-proc-help{display:flex;justify-content:space-between;gap:12px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}.horse-proc-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.horse-proc-controls button,.horse-proc-mini-grid button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.horse-proc-controls button:hover,.horse-proc-mini-grid button:hover{border-color:rgba(158,230,164,.62)}
    .horse-proc-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.horse-proc-side-card h3{margin:0;font-family:'Cinzel',Georgia,serif;font-size:1.03rem}.horse-proc-metric{display:flex;justify-content:space-between;border:1px solid rgba(154,230,164,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.horse-proc-metric strong{color:var(--cream,#f4ead4)}.horse-proc-result{min-height:64px;border:1px solid rgba(154,230,164,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.horse-proc-result[data-state='waiting']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}.horse-proc-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.horse-proc-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}
    .horse-proc-panel-copy{margin:0 0 14px;font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae)}.horse-proc-note{border:1px solid rgba(154,230,164,.17);border-radius:11px;padding:10px;background:rgba(20,35,24,.35);color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.48}.horse-proc-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}@media(max-width:1080px){.horse-proc-workspace{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function buildDom() {
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) {
    console.warn('[HorseForestV15] Missing Puzzle Creator panels.');
    return false;
  }

  H.stage = document.createElement('section');
  H.stage.id = 'horse-forest-procedural-stage';
  H.stage.className = 'horse-proc-stage';
  H.stage.hidden = true;
  H.stage.innerHTML = `
    <div class="horse-proc-workspace">
      <section class="horse-proc-view-card">
        <div class="horse-proc-header">
          <div>
            <p class="eyebrow">Obstacle Course · Horse Forest Runner V15</p>
            <h2>Horse Forest Ride</h2>
            <p>Procedural geometry reset. Ride through a forest made from coloured 3D objects only: trees, path chunks, logs, rocks and streams.</p>
          </div>
          <span id="horse-proc-status" class="horse-proc-pill">Ready</span>
        </div>
        <div id="horse-proc-host" class="horse-proc-host">
          <div class="horse-proc-horse"></div>
          <div class="horse-proc-reticle"></div>
          <div class="horse-proc-hud"><span>WASD / arrows steer · Space jumps</span><span id="horse-proc-distance">0m / 1700m</span></div>
        </div>
        <div class="horse-proc-help"><span>No textures, no image cards, no CSS treeline. Everything inside the ride is Three.js geometry.</span><span>Pass 1–3 only: world, trees, logs/rocks/streams.</span></div>
        <div class="horse-proc-controls"><button id="horse-proc-start" type="button">Start Test</button><button id="horse-proc-pause" type="button">Pause</button><button id="horse-proc-reset" type="button">Reset Run</button></div>
      </section>
      <aside class="horse-proc-side-card">
        <p class="eyebrow">Ride Result</p><h3>Score</h3>
        <div class="horse-proc-metric"><span>Score</span><strong id="horse-proc-score">0</strong></div>
        <div class="horse-proc-metric"><span>Hits</span><strong id="horse-proc-hits">0</strong></div>
        <div class="horse-proc-metric"><span>Jumps</span><strong id="horse-proc-jumps">0</strong></div>
        <div class="horse-proc-metric"><span>Streams Jumped</span><strong id="horse-proc-streams">0</strong></div>
        <div class="horse-proc-metric"><span>Target Score</span><strong id="horse-proc-target">20</strong></div>
        <div id="horse-proc-result" class="horse-proc-result" data-state="waiting">Course waiting. Start the test when ready.</div>
      </aside>
    </div>`;
  rightPanel.prepend(H.stage);

  H.panels = document.createElement('div');
  H.panels.id = 'horse-forest-procedural-panels';
  H.panels.hidden = true;
  H.panels.innerHTML = `
    <section class="panel tool-panel horse-proc-panel" data-horse-proc-panel="build">
      <div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Procedural Ride</h2></div><span class="status-pill is-waiting">V15</span></div>
      <p class="horse-proc-panel-copy">Clean rebuild. The old horse forest runtime is replaced with a chunked Three.js scene using only generated geometry and hex-colour materials.</p>
      <label class="range-row"><span>Course Duration <output id="horse-proc-duration-out">55s</output></span><input id="horse-proc-duration" type="range" min="20" max="90" step="5" value="55"></label>
      <label class="range-row"><span>Difficulty <output id="horse-proc-difficulty-out">2</output></span><input id="horse-proc-difficulty" type="range" min="1" max="5" value="2"></label>
      <button id="horse-proc-regenerate" class="wide-button" type="button">Regenerate Forest Ride</button>
    </section>
    <section class="panel tool-panel horse-proc-panel" data-horse-proc-panel="display" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Geometry Only</h2></div></div>
      <div class="horse-proc-note">Layer contract: scene background colour + fog, long path chunks, side forest floor strips, procedural trees on both sides, and generated obstacle meshes. No PNGs, no JPEGs, no FBX, no textures.</div>
    </section>
    <section class="panel tool-panel horse-proc-panel" data-horse-proc-panel="logic" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Obstacle Rules</h2></div></div>
      <p class="horse-proc-panel-copy">Logs and streams must be jumped. Rocks must be steered around or jumped if centred. Scoring is temporary for pass 1–3: +2 for cleared obstacles, -2 for hits.</p>
      <label class="range-row"><span>Success Score <output id="horse-proc-success-score-out">20</output></span><input id="horse-proc-success-score" type="range" min="0" max="80" step="5" value="20"></label>
      <label class="field-block"><span>Success Event ID</span><input id="horse-proc-success-event" type="text" value="horse_forest_success"></label>
      <label class="field-block"><span>Failure Event ID</span><input id="horse-proc-failure-event" type="text" value="horse_forest_failure"></label>
    </section>
    <section class="panel tool-panel horse-proc-panel" data-horse-proc-panel="visuals" hidden>
      <div class="panel-title-row"><div><p class="eyebrow">04 · Debug</p><h2>Density</h2></div></div>
      <p class="horse-proc-panel-copy">These buttons regenerate geometry counts without touching any external image files.</p>
      <div class="horse-proc-mini-grid"><button id="horse-proc-more-trees" type="button">More Trees</button><button id="horse-proc-more-obstacles" type="button">More Obstacles</button></div>
    </section>`;
  leftBody.appendChild(H.panels);

  H.host = $('horse-proc-host');
  H.result = $('horse-proc-result');
  bindControls();
  return true;
}

function bindControls() {
  $('horse-proc-start')?.addEventListener('click', startRun);
  $('horse-proc-pause')?.addEventListener('click', pauseRun);
  $('horse-proc-reset')?.addEventListener('click', () => resetRun(false));
  $('horse-proc-regenerate')?.addEventListener('click', regenerateCourse);
  $('horse-proc-more-trees')?.addEventListener('click', () => { addExtraTrees(); drawFrame(); });
  $('horse-proc-more-obstacles')?.addEventListener('click', () => { addExtraObstacles(); drawFrame(); });
  $('horse-proc-duration')?.addEventListener('input', (event) => {
    H.duration = Number(event.target.value);
    H.courseLength = Math.round(H.duration * CONFIG.speed);
    $('horse-proc-duration-out').textContent = `${H.duration}s`;
    regenerateCourse();
  });
  $('horse-proc-difficulty')?.addEventListener('input', (event) => {
    H.difficulty = Number(event.target.value);
    $('horse-proc-difficulty-out').textContent = String(H.difficulty);
    regenerateCourse();
  });
  $('horse-proc-success-score')?.addEventListener('input', (event) => {
    H.successScore = Number(event.target.value);
    $('horse-proc-success-score-out').textContent = String(H.successScore);
    updateStats();
  });

  window.addEventListener('keydown', (event) => {
    if (!H.active) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', 'A', 'D', 'W', 'S', ' '].includes(event.key)) {
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

function setupThree() {
  setupSharedGeometry();
  setupMaterials();

  H.scene = new THREE.Scene();
  H.scene.background = new THREE.Color(COLORS.sky);
  H.scene.fog = new THREE.Fog(COLORS.fog, 32, 178);

  H.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 260);
  H.camera.position.set(0, 2.35, 8.5);
  H.camera.lookAt(0, 1.2, -48);

  H.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  H.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  H.renderer.setClearColor(COLORS.sky, 1);
  H.host.prepend(H.renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xd5ead8, 0x26331f, 1.0);
  H.scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffedc2, 0.85);
  sun.position.set(-14, 22, 10);
  H.scene.add(sun);
  const frontFill = new THREE.DirectionalLight(0xaed7c3, 0.22);
  frontFill.position.set(9, 6, 18);
  H.scene.add(frontFill);

  H.world = new THREE.Group();
  H.scene.add(H.world);
  H.clock = new THREE.Clock();
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
}

function resizeRenderer() {
  if (!H.renderer || !H.host || !H.camera) return;
  const width = Math.max(1, H.host.clientWidth);
  const height = 500;
  H.renderer.setSize(width, height);
  H.camera.aspect = width / height;
  H.camera.updateProjectionMatrix();
}

function ensureMounted() {
  if (H.mounted) return true;
  injectStyles();
  if (!buildDom()) return false;
  setupThree();
  H.mounted = true;
  return true;
}

function openHorseForestRunner() {
  if (!ensureMounted()) return;
  H.active = true;
  document.body.classList.add('is-horse-forest');
  document.body.classList.remove('is-obstacle-course', 'is-pattern-lock', 'is-potion-match', 'is-puzzle-chooser', 'is-puzzle-brief');
  $('puzzle-launcher-panel')?.setAttribute('hidden', '');
  $('puzzle-module-brief-page')?.setAttribute('hidden', '');
  H.stage.hidden = false;
  H.panels.hidden = false;
  showPanel('build');
  regenerateCourse();
  drawFrame();
}

function closeHorseForestRunner() {
  if (!H.mounted) return;
  pauseRun();
  H.active = false;
  H.stage.hidden = true;
  H.panels.hidden = true;
  document.body.classList.remove('is-horse-forest');
}

function clearWorld() {
  pauseRun();
  H.obstacles = [];
  H.chunks.forEach((chunk) => disposeObject(chunk.group));
  H.chunks = [];
  H.world.clear();
}

function regenerateCourse() {
  if (!H.world) return;
  clearWorld();
  H.courseLength = Math.round(H.duration * CONFIG.speed);
  const count = CONFIG.chunksAhead + CONFIG.chunksBehind + 1;
  for (let i = 0; i < count; i += 1) {
    const chunk = createChunk(-i * CONFIG.chunkLength);
    H.chunks.push(chunk);
    H.world.add(chunk.group);
  }
  resetRun(true);
  setResult('Procedural forest rebuilt. Start the test when ready.', 'waiting');
  drawFrame();
}

function createChunk(baseZ) {
  const group = new THREE.Group();
  const chunk = { group, baseZ, indexSeed: Math.random() * 100000, obstacles: [] };
  group.position.z = baseZ;
  populateChunk(chunk);
  return chunk;
}

function populateChunk(chunk) {
  chunk.group.clear();
  chunk.obstacles.forEach((obstacle) => {
    const index = H.obstacles.indexOf(obstacle);
    if (index >= 0) H.obstacles.splice(index, 1);
  });
  chunk.obstacles = [];
  buildGroundChunk(chunk.group);
  buildTreeChunk(chunk);
  buildObstacleChunk(chunk);
}

function buildGroundChunk(group) {
  const path = new THREE.Mesh(Geo.path, Math.random() < 0.5 ? Mat.path : Mat.pathDark);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, -0.04, -CONFIG.chunkLength / 2);
  group.add(path);

  const left = new THREE.Mesh(Geo.sideGround, Mat.ground);
  left.rotation.x = -Math.PI / 2;
  left.position.set(-12.7, -0.07, -CONFIG.chunkLength / 2);
  group.add(left);

  const right = new THREE.Mesh(Geo.sideGround, Mat.ground);
  right.rotation.x = -Math.PI / 2;
  right.position.set(12.7, -0.07, -CONFIG.chunkLength / 2);
  group.add(right);

  const mossPatches = 18;
  for (let i = 0; i < mossPatches; i += 1) {
    const patch = new THREE.Mesh(Geo.grassBlade, Math.random() < 0.5 ? Mat.grass : Mat.grassDark);
    const side = Math.random() < 0.5 ? -1 : 1;
    patch.position.set(side * rand(4.7, 14.5), 0.25, rand(-CONFIG.chunkLength + 3, -3));
    patch.scale.set(rand(0.8, 1.8), rand(0.6, 1.5), rand(0.8, 1.8));
    patch.rotation.y = rand(0, Math.PI * 2);
    group.add(patch);
  }
}

function buildTreeChunk(chunk) {
  const group = chunk.group;
  const count = CONFIG.treeDensityBase + H.difficulty * 5;
  for (let i = 0; i < count; i += 1) {
    const side = Math.random() < 0.5 ? -1 : 1;
    const nearPath = Math.random() < 0.55;
    const x = side * (nearPath ? rand(5.2, 10.5) : rand(10.5, 23));
    const z = rand(-CONFIG.chunkLength + 4, -4);
    const height = nearPath ? rand(5.8, 9.5) : rand(4.8, 7.2);
    const tree = createPineTree(height, nearPath);
    tree.position.set(x, 0, z);
    tree.rotation.y = rand(0, Math.PI * 2);
    group.add(tree);
  }
}

function createPineTree(height = 7, full = true) {
  const tree = new THREE.Group();
  const trunkHeight = height * 0.55;
  const trunk = new THREE.Mesh(Geo.trunk, Math.random() < 0.25 ? Mat.trunkDark : Mat.trunk);
  trunk.scale.setScalar(height / 7.5);
  trunk.position.y = trunkHeight / 2;
  tree.add(trunk);

  const layers = full ? 4 : 2;
  for (let i = 0; i < layers; i += 1) {
    const cone = new THREE.Mesh(choose([Geo.pineSmall, Geo.pineMed, Geo.pineBig]), choose([Mat.pineA, Mat.pineB, Mat.pineC]));
    const layerT = i / Math.max(1, layers - 1);
    const scale = (height / 7.2) * (1.08 - layerT * 0.24);
    cone.scale.set(scale, scale, scale);
    cone.position.y = trunkHeight * 0.45 + i * (height * 0.18);
    cone.rotation.y = rand(0, Math.PI * 2);
    tree.add(cone);
  }

  if (full && Math.random() < 0.6) {
    const branchCount = 2 + Math.floor(Math.random() * 3);
    for (let b = 0; b < branchCount; b += 1) {
      const branch = new THREE.Mesh(Geo.branch, Mat.trunkDark);
      branch.position.y = rand(2.2, height * 0.68);
      branch.rotation.z = Math.PI / 2 + rand(-0.35, 0.35);
      branch.rotation.y = rand(0, Math.PI * 2);
      tree.add(branch);
    }
  }
  return tree;
}

function buildObstacleChunk(chunk) {
  const count = CONFIG.obstacleBase + Math.floor(H.difficulty * 1.15);
  const reservedZ = new Set();
  for (let i = 0; i < count; i += 1) {
    let z = rand(-CONFIG.chunkLength + 9, -12);
    let guard = 0;
    while ([...reservedZ].some((taken) => Math.abs(taken - z) < 9) && guard < 8) {
      z = rand(-CONFIG.chunkLength + 9, -12);
      guard += 1;
    }
    reservedZ.add(z);
    const roll = Math.random();
    let obstacle;
    if (roll < 0.42) obstacle = createLogObstacle(z);
    else if (roll < 0.78) obstacle = createRockObstacle(z);
    else obstacle = createStreamObstacle(z);
    chunk.group.add(obstacle.group);
    chunk.obstacles.push(obstacle);
    H.obstacles.push(obstacle);
  }
}

function createLogObstacle(z) {
  const lane = choose([-1, 0, 1]);
  const x = lane * CONFIG.laneWidth;
  const group = new THREE.Group();
  const log = new THREE.Mesh(Geo.log, Mat.log);
  log.rotation.z = Math.PI / 2;
  log.rotation.y = rand(-0.25, 0.25);
  log.position.set(0, 0.42, 0);
  group.add(log);

  const endA = new THREE.Mesh(Geo.logEnd, Mat.logEnd);
  endA.position.set(-1.67, 0.42, 0);
  endA.rotation.y = Math.PI / 2;
  group.add(endA);
  const endB = new THREE.Mesh(Geo.logEnd, Mat.logEnd);
  endB.position.set(1.67, 0.42, 0);
  endB.rotation.y = -Math.PI / 2;
  group.add(endB);

  group.position.set(x, 0, z);
  return { type: 'log', group, x, z, radiusX: 1.65, radiusZ: 1.2, jumpable: true, cleared: false, hit: false };
}

function createRockObstacle(z) {
  const lane = choose([-1, 0, 1]);
  const x = lane * CONFIG.laneWidth;
  const group = new THREE.Group();
  const rockCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < rockCount; i += 1) {
    const rock = new THREE.Mesh(Math.random() < 0.5 ? Geo.rock : Geo.smallRock, Math.random() < 0.35 ? Mat.rockDark : Mat.rock);
    rock.position.set(rand(-0.55, 0.55), rand(0.35, 0.7), rand(-0.35, 0.35));
    rock.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    rock.scale.set(rand(0.75, 1.25), rand(0.55, 1.1), rand(0.75, 1.4));
    group.add(rock);
  }
  group.position.set(x, 0, z);
  return { type: 'rock', group, x, z, radiusX: 1.25, radiusZ: 1.2, jumpable: true, cleared: false, hit: false };
}

function createStreamObstacle(z) {
  const group = new THREE.Group();
  const stream = new THREE.Mesh(Geo.stream, Mat.stream);
  stream.rotation.x = -Math.PI / 2;
  stream.position.y = 0.025;
  group.add(stream);

  const shine = new THREE.Mesh(Geo.stream, Mat.streamLight);
  shine.rotation.x = -Math.PI / 2;
  shine.scale.set(0.75, 0.42, 1);
  shine.position.y = 0.035;
  group.add(shine);

  const bankA = new THREE.Mesh(Geo.bank, Mat.pathDark);
  bankA.position.set(0, 0.09, -1.88);
  group.add(bankA);
  const bankB = new THREE.Mesh(Geo.bank, Mat.pathDark);
  bankB.position.set(0, 0.09, 1.88);
  group.add(bankB);

  group.position.set(0, 0, z);
  return { type: 'stream', group, x: 0, z, radiusX: CONFIG.pathHalfWidth, radiusZ: 1.75, jumpable: true, cleared: false, hit: false };
}

function addExtraTrees() {
  H.chunks.forEach((chunk) => {
    for (let i = 0; i < 8; i += 1) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const tree = createPineTree(rand(5.5, 9.5), true);
      tree.position.set(side * rand(5.3, 14), 0, rand(-CONFIG.chunkLength + 4, -4));
      chunk.group.add(tree);
    }
  });
}

function addExtraObstacles() {
  H.chunks.forEach((chunk) => {
    const obstacle = choose([createLogObstacle, createRockObstacle, createStreamObstacle])(rand(-CONFIG.chunkLength + 9, -12));
    chunk.group.add(obstacle.group);
    chunk.obstacles.push(obstacle);
    H.obstacles.push(obstacle);
  });
}

function recycleChunks() {
  let minZ = Math.min(...H.chunks.map((chunk) => chunk.baseZ));
  H.chunks.forEach((chunk) => {
    const worldZ = chunk.baseZ + H.world.position.z;
    if (worldZ > CONFIG.chunkLength * 1.25) {
      chunk.baseZ = minZ - CONFIG.chunkLength;
      chunk.group.position.z = chunk.baseZ;
      minZ = chunk.baseZ;
      populateChunk(chunk);
    }
  });
}

function resetRun(quiet = false) {
  H.running = false;
  H.complete = false;
  H.distance = 0;
  H.score = 0;
  H.hits = 0;
  H.jumps = 0;
  H.streamsJumped = 0;
  H.logsJumped = 0;
  H.rocksAvoided = 0;
  H.player.x = 0;
  H.player.y = 0;
  H.player.vy = 0;
  H.player.onGround = true;
  H.world.position.z = 0;
  H.obstacles.forEach((obstacle) => {
    obstacle.cleared = false;
    obstacle.hit = false;
    obstacle.group.traverse((node) => {
      if (node.isMesh && node.material === Mat.hit) {
        if (obstacle.type === 'log') node.material = Mat.log;
        if (obstacle.type === 'rock') node.material = Mat.rock;
      }
    });
  });
  updateCamera();
  updateStats();
  if (!quiet) setResult('Course reset. Start the test when ready.', 'waiting');
  drawFrame();
}

function startRun() {
  if (H.complete) resetRun(true);
  if (H.running) return;
  H.running = true;
  H.clock.getDelta();
  $('horse-proc-status').textContent = 'Riding';
  setResult('Ride running. Steer through the trees and jump logs, rocks and streams.', 'waiting');
  H.raf = requestAnimationFrame(tick);
}

function pauseRun() {
  H.running = false;
  if (H.raf) cancelAnimationFrame(H.raf);
  H.raf = null;
  if ($('horse-proc-status')) $('horse-proc-status').textContent = 'Paused';
}

function jump() {
  if (!H.running || !H.player.onGround) return;
  H.player.vy = CONFIG.jumpPower;
  H.player.onGround = false;
  H.jumps += 1;
}

function tick() {
  H.raf = null;
  if (!H.active) return;
  const dt = Math.min(0.05, H.clock.getDelta() || 0.016);
  if (H.running) {
    updatePlayer(dt);
    H.distance += CONFIG.speed * dt;
    H.world.position.z = H.distance;
    recycleChunks();
    checkCollisions();
    updateStats();
    if (H.distance >= H.courseLength) finishRun();
  }
  drawFrame();
  if (H.running) H.raf = requestAnimationFrame(tick);
}

function updatePlayer(dt) {
  let steer = 0;
  if (H.keys.has('arrowleft') || H.keys.has('a')) steer -= 1;
  if (H.keys.has('arrowright') || H.keys.has('d')) steer += 1;
  H.player.x = clamp(H.player.x + steer * CONFIG.steerSpeed * dt, -CONFIG.pathHalfWidth + 0.65, CONFIG.pathHalfWidth - 0.65);

  H.player.vy -= CONFIG.gravity * dt;
  H.player.y += H.player.vy * dt;
  if (H.player.y <= 0) {
    H.player.y = 0;
    H.player.vy = 0;
    H.player.onGround = true;
  }
  updateCamera();
}

function updateCamera() {
  const bob = H.running ? Math.sin(performance.now() * 0.012) * 0.035 : 0;
  H.camera.position.set(H.player.x * 0.35, 2.25 + H.player.y * 0.82 + bob, 8.5);
  H.camera.lookAt(H.player.x * 0.12, 1.18 + H.player.y * 0.18, -45);
}

function obstacleWorldZ(obstacle) {
  const chunk = H.chunks.find((candidate) => candidate.obstacles.includes(obstacle));
  return (chunk?.baseZ || 0) + obstacle.z + H.world.position.z;
}

function markObstacleHit(obstacle) {
  obstacle.hit = true;
  H.hits += 1;
  H.score -= 2;
  obstacle.group.traverse((node) => {
    if (node.isMesh && (obstacle.type === 'log' || obstacle.type === 'rock')) node.material = Mat.hit;
  });
}

function markObstacleCleared(obstacle) {
  obstacle.cleared = true;
  H.score += 2;
  if (obstacle.type === 'stream') H.streamsJumped += 1;
  if (obstacle.type === 'log') H.logsJumped += 1;
  if (obstacle.type === 'rock') H.rocksAvoided += 1;
}

function checkCollisions() {
  H.obstacles.forEach((obstacle) => {
    if (obstacle.hit || obstacle.cleared) return;
    const z = obstacleWorldZ(obstacle);
    const passed = z > CONFIG.collisionZ + obstacle.radiusZ + 1;
    const inDepth = Math.abs(z - CONFIG.collisionZ) < obstacle.radiusZ;
    const xHit = Math.abs(obstacle.x - H.player.x) < obstacle.radiusX;
    const jumpClear = H.player.y > 0.85;
    if (inDepth && xHit && !jumpClear) {
      markObstacleHit(obstacle);
      return;
    }
    if (passed) markObstacleCleared(obstacle);
  });
}

function finishRun() {
  H.running = false;
  H.complete = true;
  if (H.raf) cancelAnimationFrame(H.raf);
  H.raf = null;
  if (H.score >= H.successScore) {
    $('horse-proc-status').textContent = 'Success';
    setResult(`Success event: ${$('horse-proc-success-event')?.value || H.successEventId} · Score ${H.score}`, 'success');
  } else {
    $('horse-proc-status').textContent = 'Failure';
    setResult(`Failure event: ${$('horse-proc-failure-event')?.value || H.failureEventId} · Score ${H.score}`, 'failure');
  }
}

function updateStats() {
  if (!$('horse-proc-score')) return;
  $('horse-proc-score').textContent = String(H.score);
  $('horse-proc-hits').textContent = String(H.hits);
  $('horse-proc-jumps').textContent = String(H.jumps);
  $('horse-proc-streams').textContent = String(H.streamsJumped);
  $('horse-proc-target').textContent = String(H.successScore);
  $('horse-proc-distance').textContent = `${Math.round(H.distance)}m / ${Math.round(H.courseLength)}m`;
}

function setResult(text, state = 'waiting') {
  if (!H.result) return;
  H.result.textContent = text;
  H.result.dataset.state = state;
}

function drawFrame() {
  if (!H.renderer || !H.scene || !H.camera) return;
  H.scene.traverse((node) => {
    if (node.userData?.wind) {
      node.rotation.z = Math.sin(performance.now() * 0.0017 + node.userData.wind) * 0.035;
    }
  });
  H.renderer.render(H.scene, H.camera);
}

function showPanel(panelId) {
  if (!H.panels) return;
  H.panels.querySelectorAll('[data-horse-proc-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.horseProcPanel !== panelId;
    panel.classList.toggle('is-active', panel.dataset.horseProcPanel === panelId);
  });
  document.querySelectorAll('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panelId));
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
    if (small) small.textContent = 'Procedural 3D forest ride: trees, logs, rocks and streams. No texture files.';
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
  version: VERSION,
  open: openHorseForestRunner,
  close: closeHorseForestRunner,
  regenerate: regenerateCourse,
  getState: () => ({
    version: VERSION,
    noTextures: true,
    pass: '1-3',
    distance: H.distance,
    courseLength: H.courseLength,
    score: H.score,
    hits: H.hits,
    jumps: H.jumps,
    streamsJumped: H.streamsJumped,
    successScore: H.successScore,
  }),
};
