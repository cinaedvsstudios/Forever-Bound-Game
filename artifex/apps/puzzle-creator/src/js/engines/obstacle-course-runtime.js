// Obstacle Course / Horse Forest Runner V20
// Controlled pass: skewed spruce horizon border, clear visible path, grounded 3D trees, rocks, ferns.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';

const ASSET_BASE = './assets/obstacle-course/horse-forest/';
const GROUND_Y = -1.62;
const SEGMENT_LENGTH = 18;

const HORSE_FOREST_ASSETS = {
  horse: `${ASSET_BASE}foreground/horse.png`,
  sky: `${ASSET_BASE}sky/forest_sky_clouds_1920x1080.png`,
  border: `${ASSET_BASE}trees/treeline_spruce_alpha_2048x1024.png`,
  pathGround: `${ASSET_BASE}ground/forest_floor_roots_tile_placeholder_1254.png`,
  sideGroundA: `${ASSET_BASE}ground/forest_floor_grass.png`,
  sideGroundB: `${ASSET_BASE}ground/forest_floor_grass2.png`,
  treeModels: [
    `${ASSET_BASE}3d/tree.glb`,
    `${ASSET_BASE}3d/tree_low-poly.glb`,
    `${ASSET_BASE}3d/hill_top_tree.glb`,
    `${ASSET_BASE}3d/small_pine.glb`,
    `${ASSET_BASE}3d/pine_with_awkward_teenage_face.glb`,
  ],
};

const TEMPLATES = {
  horse_forest_easy: {
    label: 'Horse Forest Ride',
    objective: 'Ride through the forest corridor. Follow the lighter path, jump logs, rocks, and streams, duck beneath low branches, and collect glowing items.',
    fog: 0x102018,
    sky: 0x7fa7b8,
    obstacleRate: 1,
  },
  horse_forest_dense: {
    label: 'Dense Forest Ride',
    objective: 'Ride through a tighter forest corridor. Tree borders are denser, but the path remains clear.',
    fog: 0x07130d,
    sky: 0x6d93a7,
    obstacleRate: 1.35,
  },
  horse_forest_night: {
    label: 'Moonlit Forest Ride',
    objective: 'A darker ride through the same clear corridor. Collect glowing charms and avoid shadowed obstacles.',
    fog: 0x060914,
    sky: 0x101832,
    obstacleRate: 1.15,
  },
};

const OC = {
  mounted: false,
  active: false,
  running: false,
  complete: false,
  templateId: 'horse_forest_easy',
  difficulty: 2,
  duration: 45,
  speed: 34,
  steerSpeed: 9,
  laneWidth: 2.7,
  distance: 0,
  courseLength: 1530,
  score: 0,
  hits: 0,
  jumps: 0,
  collected: 0,
  successScore: 20,
  bumpStrength: 0.12,
  displacementStrength: 0.035,
  successEventId: 'obstacle_course_success',
  failureEventId: 'obstacle_course_failure',
  successOutcomeKey: 'horse_forest_success',
  failureOutcomeKey: 'horse_forest_failure',
  keys: new Set(),
  player: { x: 0, y: 0, vy: 0, grounded: true },
  objects: [],
  scenery: [],
  groundMeshes: [],
  treeModels: [],
  stage: null,
  panels: null,
  host: null,
  scene: null,
  camera: null,
  renderer: null,
  backdrop: null,
  world: null,
  clock: null,
  frame: null,
  textureLoader: null,
  textureCache: new Map(),
  groundMaterial: null,
  fallbackGroundMaterial: null,
  gltfLoaderPromise: null,
};

const oc$ = (id) => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function pathCenterAt(distance) {
  return Math.sin(distance * 0.0065) * 1.15 + Math.sin(distance * 0.017) * 0.38;
}

function playerWorldX() {
  return pathCenterAt(OC.distance) + OC.player.x;
}

function injectStyles() {
  if (oc$('obstacle-course-pov-styles')) return;
  const style = document.createElement('style');
  style.id = 'obstacle-course-pov-styles';
  style.textContent = `
    .is-obstacle-course .right-preview-layout,.is-obstacle-course .overview-window{display:none!important}
    .is-obstacle-course .left-panel-body>[data-panel-content],.is-obstacle-course #puzzle-launcher-panel{display:none!important}
    .is-obstacle-course [data-workflow-menu],.is-obstacle-course [data-workflow-only]{display:none!important}
    .obstacle-course-stage{height:100%;overflow:auto;padding:18px 20px 22px;background:radial-gradient(circle at 38% 0%,rgba(80,120,180,.22),transparent 34%),#05080d;color:var(--cream,#f4ead4)}
    .obstacle-workspace{display:grid;grid-template-columns:minmax(600px,1fr) 292px;gap:14px;align-items:start}.obstacle-view-card,.obstacle-side-card{border:1px solid rgba(124,202,210,.24);border-radius:16px;background:rgba(7,14,22,.84);box-shadow:0 12px 34px rgba(0,0,0,.28)}
    .obstacle-view-card{padding:16px;display:flex;flex-direction:column;gap:12px;min-height:min(720px,calc(100vh - 140px))}.obstacle-header-line{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(124,202,210,.18);padding-bottom:12px}.obstacle-header-line h2{font-family:'Cinzel',serif;margin:3px 0 0;font-size:1.38rem}.obstacle-header-line p{margin:8px 0 0;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.42}.obstacle-status-pill{border:1px solid rgba(238,196,90,.34);border-radius:999px;color:#eec45a;padding:6px 10px;font-size:.68rem;font-weight:900;white-space:nowrap}
    .obstacle-three-wrap{position:relative;min-height:500px;border:1px solid rgba(124,202,210,.18);border-radius:18px;overflow:hidden;background:#07101c}.obstacle-three-wrap:after{content:'';position:absolute;left:0;right:0;bottom:0;height:86px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(10,8,5,.56));pointer-events:none;z-index:2}.obstacle-three-wrap canvas{display:block;width:100%!important;height:500px!important;cursor:crosshair}
    .obstacle-hud{position:absolute;left:14px;right:14px;bottom:12px;z-index:6;display:flex;justify-content:space-between;gap:12px;pointer-events:none;color:var(--cream,#f4ead4);font-size:.74rem;text-shadow:0 2px 5px rgba(0,0,0,.8)}.obstacle-horse-overlay{position:absolute;left:50%;bottom:-26px;z-index:5;width:330px;height:190px;margin-left:-165px;pointer-events:none;filter:drop-shadow(0 7px 9px rgba(0,0,0,.72));opacity:.98;background:url('${HORSE_FOREST_ASSETS.horse}') center bottom / contain no-repeat}.obstacle-horse-overlay i{display:none}.obstacle-reticle{position:absolute;left:50%;top:50%;z-index:4;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(238,196,90,.35);border-radius:50%;box-shadow:0 0 16px rgba(238,196,90,.16);pointer-events:none}.obstacle-reticle:before,.obstacle-reticle:after{content:'';position:absolute;background:rgba(238,196,90,.45)}.obstacle-reticle:before{left:50%;top:-8px;width:1px;height:50px}.obstacle-reticle:after{top:50%;left:-8px;width:50px;height:1px}
    .obstacle-help-strip{display:flex;justify-content:space-between;gap:10px;color:var(--muted,#c9bfae);font-size:.72rem;line-height:1.35}.obstacle-control-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.obstacle-control-row button{min-height:42px;border:1px solid rgba(124,202,125,.3);border-radius:10px;background:rgba(20,72,37,.62);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer}.obstacle-side-card{padding:16px 14px;display:flex;flex-direction:column;gap:11px}.obstacle-side-card h3{font-family:'Cinzel',serif;margin:0;font-size:1.03rem}.obstacle-metric{display:flex;justify-content:space-between;border:1px solid rgba(124,202,210,.2);border-radius:11px;padding:10px;color:var(--muted,#c9bfae);font-size:.76rem}.obstacle-metric strong{color:var(--cream,#f4ead4)}
    .obstacle-result{min-height:64px;border:1px solid rgba(124,202,210,.22);border-radius:11px;padding:11px;color:var(--muted,#c9bfae);font-size:.78rem;line-height:1.4}.obstacle-result[data-state='success']{border-color:#69ad70;color:#9ee6a4;background:#214b2b}.obstacle-result[data-state='failure']{border-color:#cc6d55;color:#f0a088;background:#4a1d1a}.obstacle-result[data-state='warn']{border-color:#c9a64a;color:#eec45a;background:#3c2c12}.obstacle-panel-copy{font-size:.73rem;line-height:1.46;color:var(--muted,#c9bfae);margin:0 0 14px}.obstacle-score-block{padding:12px;margin:0 0 10px;border-radius:11px;background:rgba(20,35,54,.42);border:1px solid rgba(124,202,210,.17)}.obstacle-score-block small{display:block;color:#eec45a;font-size:.63rem;letter-spacing:.13em;text-transform:uppercase;font-weight:800;margin-bottom:7px}.obstacle-score-block p{margin:0;font-size:.77rem;line-height:1.5;color:var(--cream,#f4ead4)}.obstacle-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.obstacle-mini-grid button{min-height:38px;border:1px solid rgba(124,202,125,.28);border-radius:9px;background:rgba(20,72,37,.58);color:var(--cream,#f4ead4);font-weight:900}.asset-list-code{font-size:.62rem;line-height:1.45;white-space:pre-wrap;word-break:break-word;color:#c8e6ca;background:rgba(0,0,0,.28);border:1px solid rgba(124,202,125,.18);border-radius:10px;padding:9px}
    @media(max-width:1080px){.obstacle-workspace{grid-template-columns:1fr}.obstacle-view-card{min-height:600px}.obstacle-side-card{min-height:220px}}
  `;
  document.head.appendChild(style);
}

export function openObstacleCourseWorkflow() {
  ensureObstacleMounted();
  OC.active = true;
  document.body.classList.add('is-obstacle-course');
  document.body.classList.remove('is-puzzle-brief', 'is-puzzle-chooser');
  OC.stage.hidden = false;
  OC.panels.hidden = false;
  showObstaclePanel('build');
  resizeRenderer();
  regenerateCourse();
  drawFrame();
}

export function closeObstacleCourseWorkflow() {
  if (!OC.mounted) return;
  OC.active = false;
  pauseRun();
  document.body.classList.remove('is-obstacle-course');
  OC.stage.hidden = true;
  OC.panels.hidden = true;
}

function ensureObstacleMounted() {
  if (OC.mounted) return;
  injectStyles();
  const rightPanel = document.querySelector('.right-panel');
  const leftBody = document.querySelector('.left-panel-body');
  if (!rightPanel || !leftBody) return;

  OC.stage = document.createElement('section');
  OC.stage.id = 'obstacle-course-stage';
  OC.stage.className = 'obstacle-course-stage';
  OC.stage.hidden = true;
  OC.stage.innerHTML = `
    <div class="obstacle-workspace">
      <section class="obstacle-view-card">
        <div class="obstacle-header-line"><div><p class="eyebrow">Obstacle Course · Horse Forest Runner V20</p><h2 id="obstacle-title">Horse Forest Ride</h2><p id="obstacle-objective"></p></div><span id="obstacle-status" class="obstacle-status-pill">Ready</span></div>
        <div id="obstacle-three-host" class="obstacle-three-wrap"><div class="obstacle-reticle"></div><div class="obstacle-horse-overlay"><i></i></div><div class="obstacle-hud"><span>A/D or arrows steer · Space/W/Up jumps · S/Down ducks</span><span id="obstacle-course-summary">0m / 0m</span></div></div>
        <div class="obstacle-help-strip"><span>Path texture: roots. Side ground: grass/noise blend. Trees: 3D only. Border: skewed spruce horizon.</span><span>Bump/displacement sliders are live.</span></div>
        <div class="obstacle-control-row"><button id="obstacle-start" type="button">Start Test</button><button id="obstacle-pause" type="button">Pause</button><button id="obstacle-reset-run" type="button">Reset Run</button></div>
      </section>
      <aside class="obstacle-side-card">
        <p class="eyebrow">Ride Result</p><h3>Score</h3>
        <div class="obstacle-metric"><span>Score</span><strong id="obstacle-score">0</strong></div><div class="obstacle-metric"><span>Collected</span><strong id="obstacle-collected">0</strong></div><div class="obstacle-metric"><span>Hits</span><strong id="obstacle-hits">0</strong></div><div class="obstacle-metric"><span>Jumps</span><strong id="obstacle-jumps">0</strong></div><div class="obstacle-metric"><span>Target Score</span><strong id="obstacle-target-score">20</strong></div>
        <div id="obstacle-result" class="obstacle-result" aria-live="polite">Ride waiting. Start the test when ready.</div>
      </aside>
    </div>`;
  rightPanel.prepend(OC.stage);

  OC.panels = document.createElement('div');
  OC.panels.id = 'obstacle-course-panels';
  OC.panels.hidden = true;
  OC.panels.innerHTML = `
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="build"><div class="panel-title-row"><div><p class="eyebrow">01 · Construction</p><h2>Horse Ride</h2></div><span class="status-pill is-waiting">V20</span></div><p class="obstacle-panel-copy">POV forest runner with a clear blended-texture path corridor. The spruce PNG is only a skewed horizon border.</p><label class="field-block"><span>Course Template</span><select id="obstacle-template"><option value="horse_forest_easy">Horse Forest Ride</option><option value="horse_forest_dense">Dense Forest Ride</option><option value="horse_forest_night">Moonlit Forest Ride</option></select></label><label class="range-row"><span>Difficulty <output id="obstacle-difficulty-out">2</output></span><input id="obstacle-difficulty" type="range" min="1" max="5" value="2" /></label><label class="range-row"><span>Course Duration <output id="obstacle-duration-out">45s</output></span><input id="obstacle-duration" type="range" min="20" max="80" step="5" value="45" /></label><button id="obstacle-regenerate" class="wide-button" type="button">Regenerate Horse Course</button></section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="display" hidden><div class="panel-title-row"><div><p class="eyebrow">02 · Display</p><h2>Ground Relief</h2></div></div><p class="obstacle-panel-copy">The procedural noise mask blends the ground textures and also drives bump/displacement. Collision remains flat.</p><label class="range-row"><span>Bump Strength <output id="obstacle-bump-out">0.12</output></span><input id="obstacle-bump" type="range" min="0" max="0.45" step="0.01" value="0.12" /></label><label class="range-row"><span>Displacement Strength <output id="obstacle-displacement-out">0.035</output></span><input id="obstacle-displacement" type="range" min="0" max="0.18" step="0.005" value="0.035" /></label><label class="range-row"><span>Horse Speed <output id="obstacle-speed-out">34</output></span><input id="obstacle-speed" type="range" min="18" max="64" step="2" value="34" /></label><label class="range-row"><span>Lane Width <output id="obstacle-lane-width-out">2.7</output></span><input id="obstacle-lane-width" type="range" min="1.8" max="5" step="0.1" value="2.7" /></label><div class="asset-list-code">Path: ground/forest_floor_roots_tile_placeholder_1254.png\nSides: ground/forest_floor_grass.png + ground/forest_floor_grass2.png\nBorder: trees/treeline_spruce_alpha_2048x1024.png\nSky: sky/forest_sky_clouds_1920x1080.png</div></section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="logic" hidden><div class="panel-title-row"><div><p class="eyebrow">03 · Logic</p><h2>Scoring + Events</h2></div></div><div class="obstacle-score-block"><small>Scoring</small><p>Collect glowing item: +5. Hit log/rock/branch/stream: -1. Jump obstacles, duck branches, and finish the route to resolve success or failure.</p></div><label class="range-row"><span>Success Score <output id="obstacle-success-score-out">20</output></span><input id="obstacle-success-score" type="range" min="0" max="80" step="5" value="20" /></label><label class="field-block"><span>Success Event ID</span><input id="obstacle-success-event" type="text" value="obstacle_course_success" /></label><label class="field-block"><span>Success Quest Outcome Key</span><input id="obstacle-success-outcome" type="text" value="horse_forest_success" /></label><label class="field-block"><span>Failure Event ID</span><input id="obstacle-failure-event" type="text" value="obstacle_course_failure" /></label><label class="field-block"><span>Failure Quest Outcome Key</span><input id="obstacle-failure-outcome" type="text" value="horse_forest_failure" /></label></section>
    <section class="panel tool-panel obstacle-panel" data-obstacle-panel="visuals" hidden><div class="panel-title-row"><div><p class="eyebrow">04 · Density</p><h2>Route Pieces</h2></div></div><p class="obstacle-panel-copy">Scattered trees, rocks, and ferns are 3D objects. The middle path stays open.</p><div class="obstacle-mini-grid"><button id="obstacle-add-obstacles" type="button">More Obstacles</button><button id="obstacle-add-collectibles" type="button">More Collectibles</button></div></section>`;
  leftBody.appendChild(OC.panels);

  OC.host = oc$('obstacle-three-host');
  setupThreeScene();
  bindControls();
  OC.mounted = true;
}

function setupThreeScene() {
  OC.textureLoader = new THREE.TextureLoader();
  OC.scene = new THREE.Scene();
  OC.camera = new THREE.PerspectiveCamera(66, 1, 0.1, 1000);
  OC.camera.position.set(0, 1.55, 7.8);
  OC.camera.lookAt(0, 0.08, -44);
  OC.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  OC.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  OC.renderer.setClearColor(0x7fa7b8, 1);
  OC.host.prepend(OC.renderer.domElement);
  OC.clock = new THREE.Clock();
  OC.scene.add(new THREE.AmbientLight(0xd8f0ff, 0.82));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.0);
  sun.position.set(-8, 16, 12);
  OC.scene.add(sun);
  OC.backdrop = new THREE.Group();
  OC.scene.add(OC.backdrop);
  OC.world = new THREE.Group();
  OC.scene.add(OC.world);
  OC.fallbackGroundMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2c1a, roughness: 0.98, metalness: 0 });
  buildGroundMaterial();
  loadTreeModels();
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();
}

function bindControls() {
  oc$('obstacle-template').addEventListener('change', (event) => { OC.templateId = event.target.value; regenerateCourse(); });
  oc$('obstacle-difficulty').addEventListener('input', (event) => { OC.difficulty = Number(event.target.value); oc$('obstacle-difficulty-out').textContent = String(OC.difficulty); regenerateCourse(); });
  oc$('obstacle-duration').addEventListener('input', (event) => { OC.duration = Number(event.target.value); oc$('obstacle-duration-out').textContent = `${OC.duration}s`; regenerateCourse(); });
  oc$('obstacle-speed').addEventListener('input', (event) => { OC.speed = Number(event.target.value); oc$('obstacle-speed-out').textContent = String(OC.speed); regenerateCourse(); });
  oc$('obstacle-lane-width').addEventListener('input', (event) => { OC.laneWidth = Number(event.target.value); oc$('obstacle-lane-width-out').textContent = OC.laneWidth.toFixed(1); regenerateCourse(); });
  oc$('obstacle-bump').addEventListener('input', (event) => { OC.bumpStrength = Number(event.target.value); oc$('obstacle-bump-out').textContent = OC.bumpStrength.toFixed(2); updateGroundRelief(); });
  oc$('obstacle-displacement').addEventListener('input', (event) => { OC.displacementStrength = Number(event.target.value); oc$('obstacle-displacement-out').textContent = OC.displacementStrength.toFixed(3); updateGroundRelief(); });
  oc$('obstacle-success-score').addEventListener('input', (event) => { OC.successScore = Number(event.target.value); oc$('obstacle-success-score-out').textContent = String(OC.successScore); oc$('obstacle-target-score').textContent = String(OC.successScore); });
  oc$('obstacle-success-event').addEventListener('input', (event) => { OC.successEventId = event.target.value; });
  oc$('obstacle-failure-event').addEventListener('input', (event) => { OC.failureEventId = event.target.value; });
  oc$('obstacle-success-outcome').addEventListener('input', (event) => { OC.successOutcomeKey = event.target.value; });
  oc$('obstacle-failure-outcome').addEventListener('input', (event) => { OC.failureOutcomeKey = event.target.value; });
  oc$('obstacle-regenerate').addEventListener('click', regenerateCourse);
  oc$('obstacle-start').addEventListener('click', startRun);
  oc$('obstacle-pause').addEventListener('click', pauseRun);
  oc$('obstacle-reset-run').addEventListener('click', () => resetRun(false));
  oc$('obstacle-add-obstacles').addEventListener('click', () => { addObstacles(7); drawFrame(); });
  oc$('obstacle-add-collectibles').addEventListener('click', () => { addCollectibles(6); drawFrame(); });
  window.addEventListener('keydown', (event) => {
    if (!OC.active) return;
    const key = event.key.toLowerCase();
    if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(key)) {
      event.preventDefault();
      OC.keys.add(key);
      if (['arrowup','w',' '].includes(key)) jumpHorse();
    }
  });
  window.addEventListener('keyup', (event) => OC.keys.delete(event.key.toLowerCase()));
  document.querySelector('.left-icon-bar')?.addEventListener('click', (event) => {
    if (!OC.active) return;
    const button = event.target.closest('.panel-nav-button');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showObstaclePanel(button.dataset.panel);
  }, true);
}

function loadTexture(url, options = {}) {
  const key = `${url}::${options.repeat ? options.repeat.join('x') : 'single'}`;
  if (OC.textureCache.has(key)) return OC.textureCache.get(key);
  const texture = OC.textureLoader.load(url, undefined, undefined, () => {});
  if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  else texture.encoding = THREE.sRGBEncoding;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  if (OC.renderer?.capabilities?.getMaxAnisotropy) texture.anisotropy = Math.min(8, OC.renderer.capabilities.getMaxAnisotropy());
  if (options.repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }
  OC.textureCache.set(key, texture);
  return texture;
}

function resizeRenderer() {
  if (!OC.renderer || !OC.host || !OC.camera) return;
  const width = Math.max(1, OC.host.clientWidth);
  const height = 500;
  OC.camera.aspect = width / height;
  OC.camera.updateProjectionMatrix();
  OC.renderer.setSize(width, height);
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hashNoise(x, y, seed = 0) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function valueNoise(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hashNoise(xi, yi, seed);
  const b = hashNoise(xi + 1, yi, seed);
  const c = hashNoise(xi, yi + 1, seed);
  const d = hashNoise(xi + 1, yi + 1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm(x, y, seed = 0) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 5; i += 1) {
    value += valueNoise(x * freq, y * freq, seed + i * 13.1) * amp;
    freq *= 2;
    amp *= 0.5;
  }
  return clamp(value, 0, 1);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function getImageData(img, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size).data;
}

function sample(data, size, x, y) {
  const px = ((Math.floor(y) % size + size) % size) * size + ((Math.floor(x) % size + size) % size);
  const i = px * 4;
  return [data[i], data[i + 1], data[i + 2]];
}

async function buildGroundMaterial() {
  try {
    const size = 512;
    const [pathImg, grassAImg, grassBImg] = await Promise.all([
      loadImage(HORSE_FOREST_ASSETS.pathGround),
      loadImage(HORSE_FOREST_ASSETS.sideGroundA),
      loadImage(HORSE_FOREST_ASSETS.sideGroundB),
    ]);
    const pathData = getImageData(pathImg, size);
    const grassAData = getImageData(grassAImg, size);
    const grassBData = getImageData(grassBImg, size);
    const colorCanvas = document.createElement('canvas');
    const bumpCanvas = document.createElement('canvas');
    colorCanvas.width = bumpCanvas.width = size;
    colorCanvas.height = bumpCanvas.height = size;
    const colorCtx = colorCanvas.getContext('2d');
    const bumpCtx = bumpCanvas.getContext('2d');
    const colorImage = colorCtx.createImageData(size, size);
    const bumpImage = bumpCtx.createImageData(size, size);
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const u = x / size;
        const v = y / size;
        const n1 = fbm(u * 7.0, v * 7.0, 1);
        const n2 = fbm(u * 18.0, v * 18.0, 5);
        const edgeWobble = (n1 - 0.5) * 0.075 + (n2 - 0.5) * 0.02;
        const pathMask = 1 - smoothstep(0.185 + edgeWobble, 0.31 + edgeWobble, Math.abs(u - 0.5));
        const sideMix = smoothstep(0.22, 0.78, fbm(u * 5.5 + 31, v * 5.5 - 8, 9));
        const sx = (u * size * 2.8 + n2 * 18) % size;
        const sy = (v * size * 2.8 + n1 * 18) % size;
        const pathCol = sample(pathData, size, sx, sy);
        const grassA = sample(grassAData, size, sx * 1.2, sy * 1.2);
        const grassB = sample(grassBData, size, sx * 1.1 + 80, sy * 1.1 + 40);
        const sideCol = grassA.map((c, i) => c * (1 - sideMix) + grassB[i] * sideMix);
        const pathTint = 1.12;
        const sideTint = 0.82 + n1 * 0.18;
        const out = [0, 1, 2].map((i) => clamp(pathCol[i] * pathTint * pathMask + sideCol[i] * sideTint * (1 - pathMask), 0, 255));
        const idx = (y * size + x) * 4;
        colorImage.data[idx] = out[0];
        colorImage.data[idx + 1] = out[1];
        colorImage.data[idx + 2] = out[2];
        colorImage.data[idx + 3] = 255;
        const bump = clamp(70 + n1 * 115 + n2 * 70 + pathMask * 14, 0, 255);
        bumpImage.data[idx] = bump;
        bumpImage.data[idx + 1] = bump;
        bumpImage.data[idx + 2] = bump;
        bumpImage.data[idx + 3] = 255;
      }
    }
    colorCtx.putImageData(colorImage, 0, 0);
    bumpCtx.putImageData(bumpImage, 0, 0);
    const map = new THREE.CanvasTexture(colorCanvas);
    const bumpMap = new THREE.CanvasTexture(bumpCanvas);
    [map, bumpMap].forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
      if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
      else texture.encoding = THREE.sRGBEncoding;
      texture.needsUpdate = true;
    });
    OC.groundMaterial = new THREE.MeshStandardMaterial({
      map,
      bumpMap,
      displacementMap: bumpMap,
      bumpScale: OC.bumpStrength,
      displacementScale: OC.displacementStrength,
      roughness: 0.98,
      metalness: 0,
    });
    updateGroundRelief();
    if (OC.active) regenerateCourse();
  } catch (error) {
    console.warn('[HorseForest] Blended ground material failed; using fallback.', error);
  }
}

function updateGroundRelief() {
  if (OC.groundMaterial) {
    OC.groundMaterial.bumpScale = OC.bumpStrength;
    OC.groundMaterial.displacementScale = OC.displacementStrength;
    OC.groundMaterial.needsUpdate = true;
  }
  drawFrame();
}

async function loadTreeModels() {
  try {
    if (!OC.gltfLoaderPromise) OC.gltfLoaderPromise = import('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js');
    const { GLTFLoader } = await OC.gltfLoaderPromise;
    const loader = new GLTFLoader();
    HORSE_FOREST_ASSETS.treeModels.forEach((url) => {
      loader.load(url, (gltf) => {
        if (!gltf.scene) return;
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = false;
            node.receiveShadow = true;
          }
        });
        OC.treeModels.push(gltf.scene);
        if (OC.active) regenerateCourse();
      }, undefined, () => {});
    });
  } catch (error) {
    console.warn('[HorseForest] GLTFLoader unavailable; procedural 3D trees remain active.', error);
  }
}

function regenerateCourse() {
  if (!OC.world) return;
  clearWorld();
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  OC.courseLength = Math.max(900, OC.duration * OC.speed);
  OC.scene.background = loadTexture(HORSE_FOREST_ASSETS.sky);
  OC.scene.fog = new THREE.Fog(template.fog, 60, 360);
  OC.renderer?.setClearColor(template.sky, 1);
  buildBackdrop(template);
  resetRun(true);
  buildWorld();
  addObstacles(Math.round((8 + OC.difficulty * 5) * template.obstacleRate));
  addCollectibles(8 + OC.difficulty * 3);
  updateTemplateText();
  updateWorldPositions();
  drawFrame();
}

function disposeGroup(group) {
  if (!group) return;
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse?.((node) => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach((mat) => mat.dispose?.());
      else node.material?.dispose?.();
    });
  }
}

function clearWorld() {
  disposeGroup(OC.world);
  disposeGroup(OC.backdrop);
  OC.objects = [];
  OC.scenery = [];
  OC.groundMeshes = [];
}

function updateTemplateText() {
  const template = TEMPLATES[OC.templateId] || TEMPLATES.horse_forest_easy;
  oc$('obstacle-title').textContent = template.label;
  oc$('obstacle-objective').textContent = template.objective;
  oc$('obstacle-target-score').textContent = String(OC.successScore);
}

function makeBorderMesh(width, height, topInset, bottomDrop, material) {
  const half = width / 2;
  const topHalf = half * topInset;
  const positions = new Float32Array([
    -half, -height / 2 - bottomDrop, 0,
     half, -height / 2 - bottomDrop, 0,
    -topHalf, height / 2, 0,
     topHalf, height / 2, 0,
  ]);
  const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
  const indices = [0, 1, 2, 2, 1, 3];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

function buildBackdrop(template) {
  const skyVeil = new THREE.Mesh(new THREE.PlaneGeometry(240, 110), new THREE.MeshBasicMaterial({ color: template.sky, transparent: true, opacity: 0.08, depthWrite: false, depthTest: false, fog: false }));
  skyVeil.position.set(0, 10, -205);
  skyVeil.renderOrder = -20;
  OC.backdrop.add(skyVeil);

  const borderTexture = loadTexture(HORSE_FOREST_ASSETS.border);
  const baseBorderMat = new THREE.MeshBasicMaterial({ map: borderTexture, transparent: true, alphaTest: 0.08, depthWrite: false, depthTest: false, fog: false, side: THREE.DoubleSide });

  const center = makeBorderMesh(138, 32, 0.64, 5.2, baseBorderMat);
  center.position.set(0, 4.6, -156);
  center.renderOrder = -10;
  OC.backdrop.add(center);

  const left = makeBorderMesh(118, 34, 0.7, 6.0, baseBorderMat.clone());
  left.position.set(-48, 4.15, -126);
  left.rotation.y = 0.38;
  left.rotation.z = -0.025;
  left.renderOrder = -9;
  OC.backdrop.add(left);

  const right = makeBorderMesh(118, 34, 0.7, 6.0, baseBorderMat.clone());
  right.position.set(48, 4.15, -126);
  right.rotation.y = -0.38;
  right.rotation.z = 0.025;
  right.renderOrder = -9;
  OC.backdrop.add(right);

  const fogBand = new THREE.Mesh(new THREE.PlaneGeometry(220, 16), new THREE.MeshBasicMaterial({ color: template.fog, transparent: true, opacity: 0.12, depthWrite: false, depthTest: false, fog: false }));
  fogBand.position.set(0, 1.5, -112);
  fogBand.renderOrder = -8;
  OC.backdrop.add(fogBand);
}

function buildWorld() {
  buildGroundChunks();
  buildTreeCorridor();
  scatterForestFloorDetail();
}

function buildGroundChunks() {
  const mat = OC.groundMaterial || OC.fallbackGroundMaterial;
  for (let d = 0; d < OC.courseLength + 300; d += SEGMENT_LENGTH) {
    const center = pathCenterAt(d + SEGMENT_LENGTH / 2);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(42, SEGMENT_LENGTH + 1.2, 32, 18), mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(center, GROUND_Y, -d - SEGMENT_LENGTH / 2);
    ground.renderOrder = 0;
    OC.world.add(ground);
    OC.groundMeshes.push(ground);
  }
}

function buildTreeCorridor() {
  const mainStep = OC.templateId === 'horse_forest_dense' ? 22 : 28;
  const outerStep = OC.templateId === 'horse_forest_dense' ? 30 : 38;
  for (let d = 28; d < OC.courseLength + 260; d += mainStep) {
    [-1, 1].forEach((side) => addTreeAt(d + rand(-3, 8), side, rand(8.5, 14.5), rand(6.5, 10.5)));
  }
  for (let d = 18; d < OC.courseLength + 300; d += outerStep) {
    [-1, 1].forEach((side) => {
      addTreeAt(d + rand(0, 12), side, rand(9, 16), rand(13, 20));
      addTreeAt(d + rand(8, 22), side, rand(6.5, 12), rand(20, 29));
    });
  }
}

function addTreeAt(distance, side, height, extraOffset = 0) {
  const center = pathCenterAt(distance);
  const corridorEdge = OC.laneWidth * 2.6;
  const x = center + side * (corridorEdge + extraOffset + rand(0.7, 2.4));
  const tree = createTree(height);
  tree.position.set(x, GROUND_Y, -distance);
  tree.rotation.y = rand(0, Math.PI * 2);
  OC.world.add(tree);
  OC.scenery.push(tree);
}

function createTree(targetHeight) {
  if (OC.treeModels.length) return createModelTree(targetHeight);
  return createProceduralTree(targetHeight);
}

function createModelTree(targetHeight) {
  const root = pick(OC.treeModels).clone(true);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = targetHeight / Math.max(size.y, 0.001);
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  const box2 = new THREE.Box3().setFromObject(root);
  root.position.y -= box2.min.y;
  root.position.x -= (box2.min.x + box2.max.x) / 2;
  root.position.z -= (box2.min.z + box2.max.z) / 2;
  return root;
}

function createProceduralTree(targetHeight) {
  const group = new THREE.Group();
  const scale = targetHeight / 12;
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5a3820 });
  const darkLeaf = new THREE.MeshLambertMaterial({ color: 0x183d1d });
  const midLeaf = new THREE.MeshLambertMaterial({ color: 0x2c6a2c });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * scale, 0.28 * scale, targetHeight * 0.75, 9), trunkMat);
  trunk.position.y = targetHeight * 0.375;
  group.add(trunk);
  const layers = [
    [0.44, 0.17, 0.18],
    [0.58, 0.15, 0.17],
    [0.71, 0.13, 0.16],
    [0.83, 0.10, 0.14],
    [0.93, 0.07, 0.11],
  ];
  layers.forEach(([y, r, h], index) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(targetHeight * r, targetHeight * h, 8), index % 2 === 0 ? darkLeaf : midLeaf);
    cone.position.y = targetHeight * y;
    group.add(cone);
  });
  return group;
}

function scatterForestFloorDetail() {
  for (let d = 18; d < OC.courseLength + 260; d += rand(8, 14)) {
    [-1, 1].forEach((side) => {
      const center = pathCenterAt(d);
      const edge = OC.laneWidth * 1.5;
      const x = center + side * (edge + rand(1.2, 8.8));
      if (Math.random() < 0.55) addFern(x, d + rand(-3, 4));
      if (Math.random() < 0.38) addSceneryRock(x + rand(-1, 1), d + rand(-4, 4));
    });
  }
}

function addFern(x, distance) {
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: Math.random() < 0.5 ? 0x2d6d2e : 0x3f8a3e, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i += 1) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.12, rand(0.55, 0.95)), mat);
    leaf.position.y = 0.25;
    leaf.rotation.x = rand(-0.4, 0.15);
    leaf.rotation.y = (Math.PI * 2 * i) / 6;
    leaf.rotation.z = rand(-0.18, 0.18);
    leaf.position.x = Math.sin(leaf.rotation.y) * 0.18;
    leaf.position.z = Math.cos(leaf.rotation.y) * 0.18;
    group.add(leaf);
  }
  group.position.set(x, GROUND_Y + 0.02, -distance);
  group.scale.setScalar(rand(0.65, 1.15));
  OC.world.add(group);
  OC.scenery.push(group);
}

function addSceneryRock(x, distance) {
  const rock = createRock();
  rock.position.set(x, GROUND_Y + 0.18, -distance);
  rock.scale.multiplyScalar(rand(0.55, 0.95));
  OC.world.add(rock);
  OC.scenery.push(rock);
}

function createLog() {
  const group = new THREE.Group();
  const logMat = new THREE.MeshLambertMaterial({ color: 0x5a3519 });
  const cutMat = new THREE.MeshLambertMaterial({ color: 0xa16f3e });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 3.6, 14), logMat);
  body.rotation.z = Math.PI / 2;
  group.add(body);
  [-1, 1].forEach((side) => {
    const end = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 14), cutMat);
    end.rotation.z = Math.PI / 2;
    end.position.x = side * 1.82;
    group.add(end);
  });
  return group;
}

function createRock() {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.45, 0.75), 0), new THREE.MeshLambertMaterial({ color: Math.random() < 0.5 ? 0x62655c : 0x3e443a, flatShading: true }));
  rock.scale.set(rand(0.8, 1.4), rand(0.45, 0.9), rand(0.75, 1.3));
  rock.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
  return rock;
}

function createBranch() {
  const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 4.4, 8), new THREE.MeshLambertMaterial({ color: 0x4a2b14 }));
  branch.rotation.z = Math.PI / 2 + rand(-0.12, 0.12);
  return branch;
}

function createStream() {
  const group = new THREE.Group();
  const water = new THREE.Mesh(new THREE.PlaneGeometry(OC.laneWidth * 3.2, 3.4, 1, 1), new THREE.MeshBasicMaterial({ color: 0x376d87, transparent: true, opacity: 0.82, depthWrite: false }));
  water.rotation.x = -Math.PI / 2;
  group.add(water);
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(OC.laneWidth * 2.6, 0.18, 1, 1), new THREE.MeshBasicMaterial({ color: 0x8dd0dc, transparent: true, opacity: 0.45, depthWrite: false }));
  glint.rotation.x = -Math.PI / 2;
  glint.position.z = -0.45;
  group.add(glint);
  return group;
}

function addObstacles(count) {
  for (let i = 0; i < count; i += 1) {
    const d = 70 + Math.random() * (OC.courseLength - 120);
    const laneRoll = Math.random();
    const center = pathCenterAt(d);
    const x = center + (laneRoll < 0.34 ? 0 : laneRoll < 0.67 ? -OC.laneWidth * 0.55 : OC.laneWidth * 0.55);
    const kind = pick(['log', 'log', 'rock', 'branch', 'stream']);
    let obj;
    if (kind === 'log') obj = createLog();
    else if (kind === 'rock') obj = createRock();
    else if (kind === 'stream') obj = createStream();
    else obj = createBranch();
    const isBranch = kind === 'branch';
    const isStream = kind === 'stream';
    obj.position.set(isStream ? center : x, isBranch ? 1.55 : isStream ? GROUND_Y + 0.035 : GROUND_Y + 0.35, -d);
    obj.userData = { kind: 'obstacle', obstacleType: kind, hit: false, radiusX: isBranch ? 2.2 : isStream ? OC.laneWidth * 1.42 : 0.85, radiusZ: isStream ? 1.8 : 1.15, needsJump: !isBranch, needsDuck: isBranch };
    OC.world.add(obj);
    OC.objects.push(obj);
  }
}

function addCollectibles(count) {
  const gemGeo = new THREE.OctahedronGeometry(0.32, 0);
  for (let i = 0; i < count; i += 1) {
    const d = 45 + Math.random() * (OC.courseLength - 90);
    const laneRoll = Math.random();
    const center = pathCenterAt(d);
    const x = center + (laneRoll < 0.34 ? 0 : laneRoll < 0.67 ? -OC.laneWidth * 0.55 : OC.laneWidth * 0.55);
    const y = Math.random() < 0.65 ? -0.55 + Math.random() * 1.2 : 1.2 + Math.random() * 1.2;
    const mat = new THREE.MeshBasicMaterial({ color: 0xeec45a, transparent: true, opacity: 0.9 });
    const obj = new THREE.Mesh(gemGeo, mat);
    obj.position.set(x, y, -d);
    obj.userData = { kind: 'collectible', collected: false, radius: 0.85, baseScale: 1 };
    const light = new THREE.PointLight(0xeec45a, 0.75, 9);
    obj.add(light);
    OC.world.add(obj);
    OC.objects.push(obj);
  }
}

function resetRun(keepMessage = false) {
  OC.running = false;
  OC.complete = false;
  OC.distance = 0;
  OC.score = 0;
  OC.hits = 0;
  OC.jumps = 0;
  OC.collected = 0;
  OC.player.x = 0;
  OC.player.y = 0;
  OC.player.vy = 0;
  OC.player.grounded = true;
  OC.objects.forEach((obj) => {
    obj.visible = true;
    obj.userData.hit = false;
    obj.userData.collected = false;
    obj.traverse?.((node) => { if (node.material) node.material.opacity = 1; });
  });
  updateWorldPositions();
  updateStats();
  if (!keepMessage && oc$('obstacle-result')) setResult('Ride reset. Start the test when ready.', 'warn');
}

function startRun() {
  if (OC.complete) resetRun(true);
  OC.running = true;
  OC.clock.getDelta();
  oc$('obstacle-status').textContent = 'Riding';
  setResult('Horse ride running. Stay in the path corridor, jump obstacles, and duck low branches.', 'warn');
  if (!OC.frame) OC.frame = requestAnimationFrame(tickRun);
}

function pauseRun() {
  OC.running = false;
  if (oc$('obstacle-status')) oc$('obstacle-status').textContent = 'Paused';
  if (OC.frame) cancelAnimationFrame(OC.frame);
  OC.frame = null;
}

function tickRun() {
  OC.frame = null;
  if (!OC.active) return;
  const dt = Math.min(0.05, OC.clock.getDelta() || 0.016);
  if (OC.running) {
    updatePlayer(dt);
    OC.distance += OC.speed * dt;
    checkCollisions();
    if (OC.distance >= OC.courseLength) finishRun();
    updateStats();
  }
  drawFrame();
  if (OC.running) OC.frame = requestAnimationFrame(tickRun);
}

function jumpHorse() {
  if (!OC.running || !OC.player.grounded) return;
  OC.player.vy = 7.8;
  OC.player.grounded = false;
  OC.jumps += 1;
}

function updatePlayer(dt) {
  let dx = 0;
  if (OC.keys.has('arrowleft') || OC.keys.has('a')) dx -= 1;
  if (OC.keys.has('arrowright') || OC.keys.has('d')) dx += 1;
  OC.player.x = clamp(OC.player.x + dx * OC.steerSpeed * dt, -OC.laneWidth, OC.laneWidth);
  OC.player.vy -= 18 * dt;
  OC.player.y += OC.player.vy * dt;
  if (OC.player.y <= 0) {
    OC.player.y = 0;
    OC.player.vy = 0;
    OC.player.grounded = true;
  }
  updateWorldPositions();
}

function isDucking() {
  return OC.keys.has('arrowdown') || OC.keys.has('s');
}

function updateWorldPositions() {
  const bob = OC.running ? Math.sin(performance.now() * 0.012) * 0.035 : 0;
  const duckOffset = isDucking() && OC.player.grounded ? -0.28 : 0;
  const curve = pathCenterAt(OC.distance);
  const camX = curve + OC.player.x * 0.42;
  const lookX = pathCenterAt(OC.distance + 46) + OC.player.x * 0.14;
  OC.camera.position.set(camX, 1.48 + OC.player.y + bob + duckOffset, 7.8);
  OC.camera.lookAt(lookX, 0.12 + OC.player.y * 0.25 + duckOffset * 0.25, -44);
  if (OC.world) OC.world.position.z = OC.distance;
}

function checkCollisions() {
  const playerY = 0.6 + OC.player.y;
  const px = playerWorldX();
  OC.objects.forEach((obj) => {
    if (!obj.visible) return;
    const worldZ = obj.position.z + OC.world.position.z;
    if (Math.abs(worldZ + 14) > 1.45) return;
    const dx = Math.abs(obj.position.x - px);
    if (obj.userData.kind === 'obstacle' && !obj.userData.hit) {
      const xHit = dx < obj.userData.radiusX;
      const jumpCleared = obj.userData.needsJump && OC.player.y > 0.65;
      const branchCleared = obj.userData.needsDuck && isDucking();
      if (xHit && !jumpCleared && !branchCleared) {
        obj.userData.hit = true;
        obj.traverse?.((node) => { if (node.material) node.material.opacity = 0.35; });
        OC.hits += 1;
        OC.score -= 1;
      }
    }
    if (obj.userData.kind === 'collectible' && !obj.userData.collected) {
      const dy = Math.abs(obj.position.y - playerY);
      if (dx < obj.userData.radius && dy < obj.userData.radius + 0.45) {
        obj.userData.collected = true;
        obj.visible = false;
        OC.collected += 1;
        OC.score += 5;
      }
    }
  });
}

function finishRun() {
  OC.running = false;
  OC.complete = true;
  OC.distance = OC.courseLength;
  updateStats();
  drawFrame();
  if (OC.score >= OC.successScore) {
    oc$('obstacle-status').textContent = 'Success';
    setResult(`Success event: ${OC.successEventId} · Quest outcome: ${OC.successOutcomeKey}`, 'success');
  } else {
    oc$('obstacle-status').textContent = 'Failure';
    setResult(`Failure event: ${OC.failureEventId} · Quest outcome: ${OC.failureOutcomeKey}`, 'failure');
  }
}

function updateStats() {
  if (!oc$('obstacle-score')) return;
  oc$('obstacle-score').textContent = String(OC.score);
  oc$('obstacle-collected').textContent = String(OC.collected);
  oc$('obstacle-hits').textContent = String(OC.hits);
  oc$('obstacle-jumps').textContent = String(OC.jumps);
  oc$('obstacle-course-summary').textContent = `${Math.round(OC.distance)}m / ${Math.round(OC.courseLength)}m`;
}

function setResult(text, state = 'warn') {
  const target = oc$('obstacle-result');
  if (!target) return;
  target.textContent = text;
  target.dataset.state = state;
}

function drawFrame() {
  if (!OC.renderer || !OC.scene || !OC.camera) return;
  const now = performance.now();
  OC.objects.forEach((obj) => {
    if (obj.userData.kind === 'collectible' && obj.visible) {
      obj.rotation.y = now * 0.002 + obj.position.z;
      const base = obj.userData.baseScale ?? 1;
      obj.scale.setScalar(base + Math.sin(now * 0.006 + obj.position.z) * 0.08);
    }
  });
  OC.renderer.render(OC.scene, OC.camera);
}

function showObstaclePanel(panelId) {
  OC.panels.querySelectorAll('[data-obstacle-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.obstaclePanel !== panelId;
    panel.classList.toggle('is-active', panel.dataset.obstaclePanel === panelId);
  });
  document.querySelectorAll('.panel-nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.panel === panelId));
}

function closeOtherPuzzleWorkflows() {
  window.__artifexPatternLock?.close?.();
  window.__artifexPotionMatch?.close?.();
  window.__artifexHorseForestRunner?.close?.();
  document.body.classList.remove('is-pattern-lock', 'is-potion-match', 'is-horse-forest');
}

function interceptObstacleCourseClicks(event) {
  const button = event.target.closest("[data-engine='obstacle-course']");
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  closeOtherPuzzleWorkflows();
  document.querySelectorAll('.puzzle-type-option, .engine-button[data-engine]').forEach((candidate) => {
    candidate.classList.toggle('is-active', candidate.dataset.engine === 'obstacle-course');
    candidate.classList.toggle('is-selected', candidate.dataset.engine === 'obstacle-course');
  });
  document.getElementById('puzzle-launcher-panel')?.setAttribute('hidden', '');
  document.getElementById('puzzle-module-brief-page')?.setAttribute('hidden', '');
  openObstacleCourseWorkflow();
}

function bootObstacleCourse() {
  document.addEventListener('click', interceptObstacleCourseClicks, true);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootObstacleCourse, { once: true });
else bootObstacleCourse();

window.__artifexObstacleCourse = {
  open: openObstacleCourseWorkflow,
  close: closeObstacleCourseWorkflow,
  getState: () => ({
    templateId: OC.templateId,
    difficulty: OC.difficulty,
    duration: OC.duration,
    speed: OC.speed,
    laneWidth: OC.laneWidth,
    bumpStrength: OC.bumpStrength,
    displacementStrength: OC.displacementStrength,
    successScore: OC.successScore,
    successEventId: OC.successEventId,
    failureEventId: OC.failureEventId,
    successOutcomeKey: OC.successOutcomeKey,
    failureOutcomeKey: OC.failureOutcomeKey,
    score: OC.score,
    hits: OC.hits,
    jumps: OC.jumps,
    collected: OC.collected,
    assetBase: ASSET_BASE,
  }),
};
